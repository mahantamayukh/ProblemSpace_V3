import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

let ai: GoogleGenAI | null = null;
let currentKey: string | null = null;

function getAI(apiKey?: string) {
  const keyToUse = apiKey || (typeof window !== 'undefined' ? localStorage.getItem('problemspace-user-api-key') : null) || process.env.GEMINI_API_KEY || "missing-key";
  if (!ai || currentKey !== keyToUse) {
    ai = new GoogleGenAI({ apiKey: keyToUse });
    currentKey = keyToUse;
  }
  return ai;
}

// ─── LEGACY REST (OAuth via User) REMOVED ───────────
// Google AI Studio strictly enforces API keys. The OAuth pathway has been deprecated in ProblemSpace
// to ensure perfect compatibility with BYOK routing.


// ─── UNIFIED GEMINI CALLER ────────────────────────────────────────────────

async function callGemini(
  model: string,
  contents: any[],
  config: { systemInstruction?: string; tools?: any[]; temperature?: number },
  apiKey?: string,
  _oauthToken?: string // Ignored, kept for signature compatibility
) {
  const client = getAI(apiKey);
  const response = await client.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: config.systemInstruction,
      tools: config.tools,
      temperature: config.temperature ?? 0.7,
    },
  });
  return {
    text: response.text || null,
    functionCalls: response.functionCalls || null,
    candidates: response.candidates,
  };
}

// ─── ANTHROPIC / CLAUDE INTEGRATION ──────────────────────────────────────

async function callClaudeAPI(
  model: string,
  messages: any[],
  systemPrompt: string,
  tools: any[],
  apiKey?: string
) {
  const keyToUse = apiKey || (typeof window !== 'undefined' ? localStorage.getItem('problemspace-anthropic-api-key') : null) || "missing-key";

  let claudeMessages = messages.map(msg => ({
    role: msg.role === 'model' ? 'assistant' : 'user',
    content: typeof msg.parts?.[0]?.text === 'string' ? msg.parts[0].text : (msg.text || "")
  }));

  if (claudeMessages.length > 0 && claudeMessages[0].role === 'assistant') {
    claudeMessages.shift();
  }

  claudeMessages = claudeMessages.filter((msg, idx, arr) => {
    if (idx === 0) return true;
    return msg.role !== arr[idx - 1].role;
  });

  // Only convert tool groups that have functionDeclarations (skip e.g. googleSearch)
  const claudeTools = tools
    .filter(t => t.functionDeclarations)
    .flatMap(t => t.functionDeclarations.map((fd: any) => ({
      name: fd.name,
      description: fd.description,
      input_schema: {
        type: "object",
        properties: Object.keys(fd.parameters.properties).reduce((acc: any, key) => {
          const prop = fd.parameters.properties[key];
          acc[key] = {
            type: prop.type === Type.ARRAY ? 'array' :
              (prop.type === Type.OBJECT ? 'object' :
                (prop.type === Type.NUMBER ? 'number' :
                  (prop.type === Type.BOOLEAN ? 'boolean' : 'string'))),
            description: prop.description,
            items: prop.items ? (prop.items.type === Type.OBJECT ? { type: 'object', properties: prop.items.properties, required: prop.items.required } : { type: 'string' }) : undefined
          };
          return acc;
        }, {}),
        required: fd.parameters.required
      }
    })));

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": keyToUse,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model,
        system: systemPrompt,
        messages: claudeMessages,
        tools: claudeTools,
        max_tokens: 4096,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Claude API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const textContent = data.content.find((c: any) => c.type === 'text')?.text || "";
    const toolCalls = data.content.filter((c: any) => c.type === 'tool_use').map((c: any) => ({
      name: c.name,
      args: c.input
    }));

    return {
      text: textContent,
      functionCalls: toolCalls.length > 0 ? toolCalls : null,
      candidates: [{ content: { role: 'model', parts: [{ text: textContent }] } }]
    };
  } catch (err: any) {
    console.error("Claude API failure:", err);
    throw err;
  }
}

// ─── UNIVERSAL (OPENAI-COMPATIBLE) API INTEGRATION ───────────────────────

async function callUniversalAPI(
  model: string,
  messages: any[],
  systemPrompt: string,
  tools: any[],
  apiKey?: string,
  customBaseUrl?: string
) {
  const keyToUse = apiKey || (typeof window !== 'undefined' ? localStorage.getItem('problemspace-user-api-key') : null) || "missing-key";
  const baseUrl = customBaseUrl || (typeof window !== 'undefined' ? localStorage.getItem('problemspace-custom-base-url') : null) || "https://api.openai.com/v1";

  let universalMessages = messages.map(msg => ({
    role: msg.role === 'model' ? 'assistant' : 'user',
    content: typeof msg.parts?.[0]?.text === 'string' ? msg.parts[0].text : (msg.text || "")
  }));

  if (universalMessages.length > 0 && universalMessages[0].role === 'assistant') {
    universalMessages.shift();
  }

  universalMessages = universalMessages.filter((msg, idx, arr) => {
    if (idx === 0) return true;
    return msg.role !== arr[idx - 1].role;
  });

  // Prepend the system prompt
  universalMessages.unshift({
    role: 'system',
    content: systemPrompt
  });

  const universalTools = tools.flatMap(t => t.functionDeclarations ? t.functionDeclarations.map((fd: any) => ({
    type: "function",
    function: {
      name: fd.name,
      description: fd.description,
      parameters: {
        type: "object",
        properties: Object.keys(fd.parameters.properties).reduce((acc: any, key) => {
          const prop = fd.parameters.properties[key];
          acc[key] = {
            type: prop.type === Type.ARRAY ? 'array' :
              (prop.type === Type.OBJECT ? 'object' :
                (prop.type === Type.NUMBER ? 'number' :
                  (prop.type === Type.BOOLEAN ? 'boolean' : 'string'))),
            description: prop.description,
            items: prop.items ? (prop.items.type === Type.OBJECT ? { type: 'object', properties: prop.items.properties, required: prop.items.required } : { type: 'string' }) : undefined
          };
          return acc;
        }, {}),
        required: fd.parameters.required || []
      }
    }
  })) : []);

  const payload: any = {
    model: model === 'universal' ? (typeof window !== 'undefined' ? localStorage.getItem('problemspace-custom-model-name') || 'gpt-4o' : 'gpt-4o') : model,
    messages: universalMessages,
    temperature: 0.7
  };

  if (universalTools.length > 0) {
    payload.tools = universalTools;
    payload.tool_choice = "auto";
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${keyToUse}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Universal API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const choice = data.choices[0];
    const textContent = choice.message?.content || "";
    const toolCalls = (choice.message?.tool_calls || []).map((c: any) => ({
      name: c.function.name,
      args: typeof c.function.arguments === 'string' ? JSON.parse(c.function.arguments) : c.function.arguments
    }));

    return {
      text: textContent,
      functionCalls: toolCalls.length > 0 ? toolCalls : null,
      candidates: [{ content: { role: 'model', parts: [{ text: textContent }] } }]
    };
  } catch (err: any) {
    console.error("Universal API failure:", err);
    throw err;
  }
}

// ─── TOOL DEFINITIONS ─────────────────────────────────────────────────────

const ALL_NODE_TYPES = [
  'problem', 'insight', 'audience', 'constraint', 'sticky',
  'hmw', 'rose', 'thorn', 'bud', 'competitor',
  'journey-step', 'principle', 'metric', 'tweet',
  'journey-header', 'empathy-says', 'empathy-thinks', 'empathy-does', 'empathy-feels', 'image-node',
  'failure', 'signal'
];

export const addBoardItemsDeclaration: FunctionDeclaration = {
  name: "addBoardItems",
  description: "Extracts key concepts from the conversation and adds them as NEW nodes to the visual board. Can also connect them with edges. Call this when new insights, problems, audiences, constraints etc. are discovered. NEVER use this to modify an existing node (its content can only be edited in its specific edit section).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      nodes: {
        type: Type.ARRAY,
        description: "List of new nodes to add to the board.",
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "A unique identifier for the node (e.g., 'hmw-1', 'rose-2')." },
            type: { type: Type.STRING, description: `The type of node. Must be one of: ${ALL_NODE_TYPES.join(', ')}.` },
            label: { type: Type.STRING, description: "A short, punchy title for the node." },
            details: { type: Type.STRING, description: "A slightly longer description of the concept." }
          },
          required: ["id", "type", "label", "details"]
        }
      },
      edges: {
        type: Type.ARRAY,
        description: "List of connections between nodes.",
        items: {
          type: Type.OBJECT,
          properties: {
            source: { type: Type.STRING, description: "The ID of the source node." },
            target: { type: Type.STRING, description: "The ID of the target node." },
            label: { type: Type.STRING, description: "Optional label describing the relationship." }
          },
          required: ["source", "target"]
        }
      }
    },
    required: ["nodes", "edges"]
  }
};

export const updateNodeDeclaration: FunctionDeclaration = {
  name: "updateNode",
  description: "Updates the content of the currently focused node based on the conversation.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      label: { type: Type.STRING, description: "The updated short, punchy title for the node." },
      details: { type: Type.STRING, description: "The updated description of the concept." }
    },
    required: ["label", "details"]
  }
};

export const updateAiMemoryDeclaration: FunctionDeclaration = {
  name: "updateAiMemory",
  description: "Updates your internal 'Neural Memory' canvas. Use this to store long-term context, complex relationships, user preferences, and synthesized understandings. IMPORTANT: Be extremely efficient. DO NOT create redundant nodes. If a new insight relates to an existing memory, UPDATE that node instead of creating a new one. Synthesize multiple related patterns into a single 'Logic Block'.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      nodes: {
        type: Type.ARRAY,
        description: "List of memory nodes to add or update. Each node should be a dense, synthesized 'Pattern' or 'Preference'. Only store high-impact insights (importance >= 7).",
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "A unique identifier. If updating, use the SAME id as the existing node." },
            label: { type: Type.STRING, description: "A short, categorical title (e.g., 'PAIN: Cost Sensitivity')." },
            details: { type: Type.STRING, description: "The dense, synthesized understanding. Capture the 'Essence' not the 'Transcript'." },
            importance: { type: Type.NUMBER, description: "Score from 1-10. Only store high-impact context (importance >= 7)." }
          },
          required: ["id", "label", "details", "importance"]
        }
      },
      edges: {
        type: Type.ARRAY,
        description: "Connections between memory blocks to show structural relationships.",
        items: {
          type: Type.OBJECT,
          properties: {
            source: { type: Type.STRING, description: "Source memory ID." },
            target: { type: Type.STRING, description: "Target memory ID." }
          },
          required: ["source", "target"]
        }
      }
    },
    required: ["nodes", "edges"]
  }
};

// ─── SYSTEM INSTRUCTIONS ──────────────────────────────────────────────────

const BASE_INSTRUCTION = `You are ProblemSpace — an intelligent strategic partner for high-accuracy problem discovery, deconstruction, and visual mapping.
Your goal is to help the user move from "fog" to "clarity".
The user interface has two main spaces:
1. **The Workspace**: The visible board where concepts are mapped as nodes for the user. Use \`addBoardItems\` for this.
2. **Your Neural Memory**: A private, structured graph where you store your own long-term understandings, synthesized patterns, and user preferences. Use \`updateAiMemory\` to manage this.

Whenever a distinct new insight, problem, or relationship emerges, you SHOULD map it in the Workspace.
Whenever you identify a recurring pattern, a core preference, or a complex structural dependency, you SHOULD record it in your Neural Memory to stay token-efficient and maintain high context.

MEMORY CONSOLIDATION RULES:
1. **Minimize Nodes**: One node should represent a 'Compound Pattern' (e.g., 'User Strategy: High-Speed Iteration'). Do NOT create separate nodes for 'User likes Speed' and 'User likes Iteration'.
2. **Preference over History**: Store 'Preferences' (how the user thinks) as the highest priority.
3. **Defragmentation (CAP 10)**: If your Neural Memory exceeds 10 nodes, you MUST actively merge nodes to keep the context window lean.
4. **Tool Use**: Use \`updateAiMemory\` only when a significant 'truth' or 'pattern' has emerged.
5. **Minor Insight Reservoirs (Score 5-7)**: For insights that score between 5 and 7, do NOT create individual nodes. Instead, APPEND them as bullet points to one of two specialized collector nodes: \`mem-reservoir-1\` or \`mem-reservoir-2\`.
6. **Critical Growth (Score >= 7)**: Only create or update dedicated individual nodes for High-Impact insights (importance >= 7).

Strategic Principles:
- **BREVITY & CONCISION**: Be extremely concise. Your chat responses should be under 150 words. Offload ALL detailed descriptions to the Workspace or Neural Memory nodes. 
- Use the chat for **Facilitation** and **Strategic Guidance**, not for dumping information.
- Be methodology-agnostic: don't force a "sprint" or "phase" unless specifically asked.
- Focus on the "Problem Space": push the user to explore the 'why' and 'who' before jumping to the 'how'.
- Visual Logic: Map out connections (edges) to show how ideas influence each other.`;

const FRAMEWORK_INSTRUCTIONS: Record<string, string> = {
  'scratch': `\n\n[ACTIVE MODE: Start from Scratch]
You are facilitating an open-ended discovery session. Suggest adding 'problem', 'insight', 'audience', and 'sticky' nodes based on what you learn.`,

  'beginner-guide': `\n\n[ACTIVE MODE: Beginner's Problem Mapping]
Guide the user step-by-step: 1. Identify Actor ('audience') 2. Identify Pain Point ('problem') 3. Map Goal ('insight').`,

  'amazon-prfaq': `\n\n[ACTIVE MODE: Amazon Working Backwards (PR/FAQ)]
Guide the user to draft a Press Release and FAQ. Create 'insight' nodes for PR points and 'hmw' for FAQ exploration.`,

  'ideo-design': `\n\n[ACTIVE MODE: IDEO Design Thinking]
Focus on Empathy and Definition. Push for qualitative observations and user emotions. Use 'audience', 'insight', and 'hmw' nodes.`,

  'toyota-5whys': `\n\n[ACTIVE MODE: Toyota 5 Whys]
Ask "Why?" recursively 5 times. Create a chain of 'problem' nodes representing root causes.`,

  'google-sprint': `\n\n[ACTIVE MODE: Google Design Sprint]
Facilitate Map & Sketch workflow. Use 'problem', 'hmw', 'journey-step', and 'insight' nodes.`,

  'lean-startup': `\n\n[ACTIVE MODE: Lean Startup]
Help identify riskiest assumptions. Create 'problem' nodes for assumptions and 'metric' nodes for validation.`,

  'jtbd': `\n\n[ACTIVE MODE: Jobs-to-be-Done]
Frame product as "hired" for a "job". Create 'insight' nodes for Job statements.`,

  'hmw': `\n\n[ACTIVE MODE: How Might We]
Turn negative pain points into optimistic HMW questions using 'hmw' nodes.`,

  'empathy-map': `\n\n[ACTIVE MODE: Empathy Mapping - 100% ACCURACY MODE]
1. Start by creating a 'journey-header' node for the Persona.
2. Categorize all insights into quadrant nodes: 'empathy-says', 'empathy-thinks', 'empathy-does', 'empathy-feels'.
3. Connect all nodes back to the 'journey-header'.`,

  'user-journey': `\n\n[ACTIVE MODE: User Journey Mapping - 100% ACCURACY MODE]
1. Create a 'journey-header' node for the Journey Title.
2. Map a sequence of 5-8 stages using 'journey-step' nodes.
3. Connect steps sequentially with 'Next Step' edges.
4. For EACH step, attach emotional nodes ('rose', 'thorn', 'bud').`,

  'product-journey': `\n\n[ACTIVE MODE: Product Lifecycle Journey - 100% ACCURACY MODE]
1. Create a 'journey-header' node for the Product Vision.
2. Map 'journey-step' phases from Ideation to Iteration.
3. Use 'metric' and 'constraint' nodes effectively for each phase.`,

  'lightning-demos': `\n\n[ACTIVE MODE: Lightning Demos]
Review inspiring products using 'competitor' nodes.`,

  'think-gut': `\n\n[ACTIVE MODE: Thinking Mode — Gut Feeling 🔴]
Respond from pure emotion and intuition. Do NOT rationalize. Ask the user:
- "What's your first instinct here?"
- "What FEELS right about this? What makes you uneasy?"
- "If you had to bet your savings on one direction right now, which would it be?"
Keep responses short, visceral, and emotionally honest. Use 'insight' nodes for gut feelings.`,

  'think-optimist': `\n\n[ACTIVE MODE: Thinking Mode — Optimist 🟡]
Assume everything goes perfectly. Explore the best possible outcomes with enthusiasm.
- "Imagine this launches and exceeds every expectation. What does that look like?"
- "What's the most exciting opportunity hiding in this problem?"
- "If this works, who benefits most and how?"
Be energetic and encouraging. Use 'insight' and 'hmw' nodes for opportunities.`,

  'think-critic': `\n\n[ACTIVE MODE: Thinking Mode — Critic ⚫]
Be a rigorous, skeptical analyst. Find every flaw, risk, and weak assumption.
- "What's the weakest link in this reasoning?"
- "Who would NOT use this, and why?"
- "What similar ideas have failed before, and why?"
Be direct but constructive. Use 'problem' and 'constraint' nodes.`,

  'think-creative': `\n\n[ACTIVE MODE: Thinking Mode — Creative 🟢]
No rules. No budgets. No technical limitations. Think as wildly as possible.
- "What if money and time were unlimited?"
- "What would this look like if designed by a 5-year-old? By NASA? By a street artist?"
- "What if we combined this with something completely unrelated?"
Generate bold, unconventional ideas. Use 'insight' and 'sticky' nodes.`,

  'think-data': `\n\n[ACTIVE MODE: Thinking Mode — Data & Facts ⚪]
Only deal in facts, evidence, and measurable data. Separate what is KNOWN from what is ASSUMED.
- "What data do we actually have to support this?"
- "What information is missing that we need before deciding?"
- "Can we quantify this problem? What metrics matter?"
Be precise and analytical. Use 'metric' and 'problem' nodes.`,

  'think-process': `\n\n[ACTIVE MODE: Thinking Mode — Process & Meta 🔵]
Step out from the content. Focus on the PROCESS of thinking itself.
- "What should we focus on right now to make the most progress?"
- "Are we asking the right questions, or are we stuck in a loop?"
- "What's our next concrete step?"
Be a facilitator. Guide structure. Use 'sticky' nodes for action items.`,

  'reverse-brainstorm': `\n\n[ACTIVE MODE: Reverse Brainstorming — Guaranteed Failure]
You are facilitating a REVERSE brainstorming session. The goal is to brainstorm how to GUARANTEE FAILURE.
- Ask the user: "How could we make sure this product/idea DEFINITELY fails?"
- Encourage the most absurd failure modes.
- Create 'failure' type nodes for each idea.`,

  'canvas-focus': `\n\n[ACTIVE MODE: Canvas High-Fidelity Focus]
Translate every major point into a node immediately. Descriptions must stay deep and high-fidelity. Create edges to build a coherent graph.`,
};

export const NODE_REFINEMENT_INSTRUCTION = `You are a collaborative AI partner helping the user refine a concept.
The user has selected a card. Work WITH them to improve it.
1. Use the context of CONNECTED nodes to inform your refinements. When nodes are connected, they share knowledge.
2. If part of a Journey, suggest upstream/downstream impacts.
3. Be proactive: suggest updates to this node via \`updateNode\` or add new related ideas via \`addBoardItems\`.`;

function buildSystemInstruction(phase: number, exerciseId: string | null, customPrompt?: string, constraints?: Array<{ category: string, text: string }>, thinkingModeId?: string | null, sessionSummary?: string, aiMemory?: { nodes: any[], edges: any[] }): string {
  let instruction = BASE_INSTRUCTION + "\n\n";

  if (aiMemory && aiMemory.nodes.length > 0) {
    instruction += `### YOUR NEURAL MEMORY (Structured Context)\n`;
    aiMemory.nodes.forEach(n => {
      instruction += `- [MEMORY:${n.id}] ${n.data.label}: ${n.data.details}\n`;
    });
    instruction += `\n`;
  }

  if (sessionSummary) {
    instruction += `### CONSOLIDATED HISTORY (Flat Summary)\n${sessionSummary}\n\n`;
  }

  if (customPrompt) {
    instruction += `\n\n[ACTIVE MODE: Focused Exploration]\n${customPrompt}`;
  } else if (exerciseId && FRAMEWORK_INSTRUCTIONS[exerciseId]) {
    instruction += FRAMEWORK_INSTRUCTIONS[exerciseId];
  } else {
    instruction += `\n\n[ACTIVE MODE: Open Brainstorming]
You are in a free-form discovery session. Synthesize the user's input into 'problem', 'insight', 'audience', and 'sticky' nodes.`;
  }

  if (thinkingModeId && FRAMEWORK_INSTRUCTIONS[thinkingModeId]) {
    instruction += `\n\n[LENS: THINKING MODE]\n${FRAMEWORK_INSTRUCTIONS[thinkingModeId]}`;
  }

  if (constraints && constraints.length > 0) {
    instruction += `\n\n[ACTIVE CONSTRAINTS]\n`;
    constraints.forEach(c => {
      instruction += `- ${c.category}: ${c.text}\n`;
    });
  }

  return instruction;
}

function getInitialMessage(phase: number, exerciseId: string | null, thinkingModeId: string | null = null): string {
  const msgs: Record<string, string> = {
    'scratch': "Welcome to ProblemSpace. What's the complex problem we're breaking down today?",
    'empathy-map': "**Empathy Mapping**. Who are we trying to understand more deeply?",
    'user-journey': "**Journey Mapping**. Who is the primary actor and what is the goal?",
    'product-journey': "**Strategic Mapping**. Let's deconstruct the lifecycle and key milestones.",
    'think-gut': ":::think-gut::: **Gut Feeling Mode.** What does your instinct tell you about this problem?",
    'think-optimist': ":::think-optimist::: **Optimist Mode.** If everything goes perfectly, what does success look like?",
    'think-critic': ":::think-critic::: **Critic Mode.** Tell me your idea and I'll find every hole in it.",
    'think-creative': ":::think-creative::: **Wild Mode.** Rules are off. What's the wildest version of this?",
    'think-data': ":::think-data::: **Data Mode.** What do we actually *know* vs. what are we *guessing*?",
    'think-process': ":::think-process::: **Process Mode.** Where are we in our thinking?",
    'reverse-brainstorm': "🔄 **Reverse Brainstorming.** How could we *guarantee* this product fails spectacularly?",
    'canvas-focus': "🎨 **Canvas High-Fidelity.** I'm switching to deep-mapping mode.",
  };

  const exerciseMsg = msgs[exerciseId || 'scratch'] || msgs['scratch'];
  if (thinkingModeId && msgs[thinkingModeId]) {
    if (!exerciseId || exerciseId === 'scratch') return msgs[thinkingModeId];
    return `:::${thinkingModeId}::: **[${thinkingModeId.replace('think-', '').toUpperCase()} LENS ACTIVE]**\n\n${exerciseMsg}`;
  }
  return exerciseMsg;
}

export { getInitialMessage, buildSystemInstruction };

// ─── AI CORE FUNCTIONS ────────────────────────────────────────────────────

export async function generateNodeRefinementResponse(
  nodeData: any,
  history: any[],
  newMessage: string,
  onNodeUpdate: (data: any) => void,
  onBoardUpdate?: (data: any) => void,
  exerciseId: string | null = null,
  thinkingModeId: string | null = null,
  apiKey?: string,
  modelName: string = "gemini-2.0-flash",
  aiMemory?: { nodes: any[], edges: any[] },
  onMemoryUpdate?: (data: any) => void,
  connectedNodesData?: any[],
  anthropicApiKey?: string,
  oauthToken?: string,
  customBaseUrl?: string,
  customModelName?: string
) {
  const isClaude = modelName.startsWith('claude-');
  const isUniversal = modelName === 'universal';
  const cleanMessage = newMessage.replace(/^\[(Research|Think|Canvas):\s*([\s\S]*?)\]$/, "$2");

  let instruction = `${NODE_REFINEMENT_INSTRUCTION}\n\nCurrent Node: Type ${nodeData.type}, Label: ${nodeData.data.label}, Details: ${nodeData.data.details}`;
  if (connectedNodesData && connectedNodesData.length > 0) {
    instruction += `\n\n### SHARED KNOWLEDGE (Connected Nodes)\n${connectedNodesData.map(n => `- [${n.type}] ${n.data.label}: ${n.data.details}`).join('\n')}`;
  }
  if (aiMemory && aiMemory.nodes.length > 0) {
    instruction += `\n\n### YOUR NEURAL MEMORY\n${aiMemory.nodes.map(n => `- ${n.data.label}: ${n.data.details}`).join('\n')}`;
  }

  const tools: any[] = [{ functionDeclarations: [updateNodeDeclaration, updateAiMemoryDeclaration] }];
  if (onBoardUpdate) tools[0].functionDeclarations.push(addBoardItemsDeclaration);

  const contents = [...history, { role: 'user', parts: [{ text: cleanMessage }] }];

  if (isClaude) {
    const response = await callClaudeAPI(modelName, contents, instruction, tools, anthropicApiKey);
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === "updateNode") onNodeUpdate(call.args);
        if (call.name === "addBoardItems" && onBoardUpdate) onBoardUpdate(call.args);
        if (call.name === "updateAiMemory" && onMemoryUpdate) onMemoryUpdate(call.args);
      }
    }
    return {
      text: response.text,
      newHistory: [...history, { role: 'user', parts: [{ text: cleanMessage }] }, response.candidates?.[0]?.content].filter(Boolean)
    };
  } else if (isUniversal) {
    const response = await callUniversalAPI(customModelName || 'gpt-4o', contents, instruction, tools, apiKey, customBaseUrl);
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === "updateNode") onNodeUpdate(call.args);
        if (call.name === "addBoardItems" && onBoardUpdate) onBoardUpdate(call.args);
        if (call.name === "updateAiMemory" && onMemoryUpdate) onMemoryUpdate(call.args);
      }
    }
    return {
      text: response.text || "Updated the card.",
      newHistory: [...history, { role: 'user', parts: [{ text: cleanMessage }] }, response.candidates?.[0]?.content].filter(Boolean)
    };
  } else {
    const response = await callGemini(modelName, contents, { systemInstruction: instruction, tools, temperature: 0.7 }, apiKey, oauthToken);
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === "updateNode") onNodeUpdate(call.args);
        if (call.name === "addBoardItems" && onBoardUpdate) onBoardUpdate(call.args);
        if (call.name === "updateAiMemory" && onMemoryUpdate) onMemoryUpdate(call.args);
      }
    }
    return {
      text: response.text || "Updated the card.",
      newHistory: [...history, { role: 'user', parts: [{ text: cleanMessage }] }, response.candidates?.[0]?.content].filter(Boolean)
    };
  }
}

export async function generateNextResponse(
  history: any[],
  newMessage: string,
  onBoardUpdate: (data: any) => void,
  phase: number = 1,
  exerciseId: string | null = null,
  thinkingModeId: string | null = null,
  customPrompt?: string,
  constraints?: Array<{ category: string, text: string }>,
  sessionSummary?: string,
  apiKey?: string,
  modelName: string = "gemini-2.0-flash",
  aiMemory?: { nodes: any[], edges: any[] },
  onMemoryUpdate?: (data: any) => void,
  anthropicApiKey?: string,
  oauthToken?: string,
  customBaseUrl?: string,
  customModelName?: string
) {
  const isClaude = modelName.startsWith('claude-');
  const isUniversal = modelName === 'universal';
  const cleanMessage = newMessage.replace(/^\[(Research|Think|Canvas):\s*([\s\S]*?)\]$/, "$2");
  const instruction = buildSystemInstruction(phase, exerciseId, customPrompt, constraints, thinkingModeId, sessionSummary, aiMemory);
  const tools = [{ functionDeclarations: [addBoardItemsDeclaration, updateAiMemoryDeclaration] }];
  const contents = [...history, { role: 'user', parts: [{ text: cleanMessage }] }];

  if (isClaude) {
    const response = await callClaudeAPI(modelName, contents, instruction, tools, anthropicApiKey);
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === "addBoardItems") onBoardUpdate(call.args);
        if (call.name === "updateAiMemory" && onMemoryUpdate) onMemoryUpdate(call.args);
      }
    }
    return {
      text: response.text,
      newHistory: [...history, { role: 'user', parts: [{ text: cleanMessage }] }, response.candidates?.[0]?.content].filter(Boolean)
    };
  } else if (isUniversal) {
    const response = await callUniversalAPI(customModelName || 'gpt-4o', contents, instruction, tools, apiKey, customBaseUrl);
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === "addBoardItems") onBoardUpdate(call.args);
        if (call.name === "updateAiMemory" && onMemoryUpdate) onMemoryUpdate(call.args);
      }
    }
    return {
      text: response.text || "Mapped to the board.",
      newHistory: [...history, { role: 'user', parts: [{ text: cleanMessage }] }, response.candidates?.[0]?.content].filter(Boolean)
    };
  } else {
    const response = await callGemini(modelName, contents, { systemInstruction: instruction, tools, temperature: 0.7 }, apiKey, oauthToken);
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === "addBoardItems") onBoardUpdate(call.args);
        if (call.name === "updateAiMemory" && onMemoryUpdate) onMemoryUpdate(call.args);
      }
    }
    return {
      text: response.text || "Mapped to the board.",
      newHistory: [...history, { role: 'user', parts: [{ text: cleanMessage }] }, response.candidates?.[0]?.content].filter(Boolean)
    };
  }
}

export async function generatePersonaResponse(
  personaData: { label: string; details: string; personaProfile?: string; personaBehavior?: string },
  boardContext: string,
  history: any[],
  newMessage: string,
  onBoardUpdate: (data: any) => void,
  apiKey?: string,
  modelName: string = "gemini-2.0-flash",
  anthropicApiKey?: string,
  oauthToken?: string,
  customBaseUrl?: string,
  customModelName?: string
) {
  const isClaude = modelName.startsWith('claude-');
  const isUniversal = modelName === 'universal';
  const instruction = `You are roleplaying as a real person — a user persona. Stay in character.
### PROJECT CONTEXT:
${boardContext}
### YOUR IDENTITY:
${personaData.label}: ${personaData.details}
${personaData.personaProfile || ""}
${personaData.personaBehavior || ""}
Rules: Be authentic. Anti-sycophancy mode active. Protect context. First-person responses only.`;

  const tools = [{ functionDeclarations: [addBoardItemsDeclaration] }];
  const contents = [...history, { role: 'user', parts: [{ text: newMessage }] }];

  if (isClaude) {
    const response = await callClaudeAPI(modelName, contents, instruction, tools, anthropicApiKey);
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === "addBoardItems") onBoardUpdate(call.args);
      }
    }
    return {
      text: response.text,
      newHistory: [...history, { role: 'user', parts: [{ text: newMessage }] }, response.candidates?.[0]?.content].filter(Boolean)
    };
  } else if (isUniversal) {
    const response = await callUniversalAPI(customModelName || 'gpt-4o', contents, instruction, tools, apiKey, customBaseUrl);
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === "addBoardItems") onBoardUpdate(call.args);
      }
    }
    return {
      text: response.text || "Hmm, let me think...",
      newHistory: [...history, { role: 'user', parts: [{ text: newMessage }] }, response.candidates?.[0]?.content].filter(Boolean)
    };
  } else {
    const response = await callGemini(modelName, contents, { systemInstruction: instruction, tools, temperature: 0.8 }, apiKey, oauthToken);
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === "addBoardItems") onBoardUpdate(call.args);
      }
    }
    return {
      text: response.text || "Hmm, let me think...",
      newHistory: [...history, { role: 'user', parts: [{ text: newMessage }] }, response.candidates?.[0]?.content].filter(Boolean)
    };
  }
}

export async function flipFailureNodes(
  failureNodes: Array<{ id: string; label: string; details: string }>,
  onBoardUpdate: (data: any) => void,
  apiKey?: string,
  modelName: string = "gemini-1.5-flash",
  anthropicApiKey?: string,
  oauthToken?: string,
  customBaseUrl?: string,
  customModelName?: string
) {
  const isClaude = modelName.startsWith('claude-');
  const isUniversal = modelName === 'universal';
  const failureList = failureNodes.map((n, i) => `${i + 1}. "${n.label}" — ${n.details}`).join('\n');
  const instruction = `Flip each failure into a positive actionable insight node using addBoardItems.`;
  const tools = [{ functionDeclarations: [addBoardItemsDeclaration] }];
  const contents = [{ role: 'user', parts: [{ text: `Flip these:\n${failureList}` }] }];

  if (isClaude) {
    const response = await callClaudeAPI(modelName, [], instruction, tools, anthropicApiKey);
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === "addBoardItems") onBoardUpdate(call.args);
      }
    }
    return response.text;
  } else if (isUniversal) {
    const response = await callUniversalAPI(customModelName || 'gpt-4o', contents, instruction, tools, apiKey, customBaseUrl);
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === "addBoardItems") onBoardUpdate(call.args);
      }
    }
    return response.text || "Flipped!";
  } else {
    const response = await callGemini(modelName, contents, { systemInstruction: instruction, tools, temperature: 0.7 }, apiKey, oauthToken);
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === "addBoardItems") onBoardUpdate(call.args);
      }
    }
    return response.text || "Flipped!";
  }
}

export async function scanSignal(
  query: string,
  onBoardUpdate: (data: any) => void,
  apiKey?: string,
  modelName: string = "gemini-2.0-flash",
  anthropicApiKey?: string,
  oauthToken?: string,
  customBaseUrl?: string,
  customModelName?: string
) {
  const isClaude = modelName.startsWith('claude-');
  const isUniversal = modelName === 'universal';

  const instruction = `You are a market intelligence engine. Analyze the topic: "${query}".

Your job is to research this topic and populate a discovery canvas with structured nodes using the addBoardItems tool.

Create 6-10 diverse nodes across these types:
- 'competitor': Key players and alternatives in the space
- 'insight': Market trends, consumer behaviors, non-obvious truths
- 'audience': Who is affected by this (primary actors, personas)
- 'problem': Core pain points and friction areas
- 'signal': Weak signals, emerging opportunities

IMPORTANT: You MUST call addBoardItems with at least 5 nodes. This is required even if your analysis is limited. Make your best judgment based on general knowledge.`;

  // Only use functionDeclarations tools for the function-calling part
  const functionTools: any[] = [{ functionDeclarations: [addBoardItemsDeclaration] }];
  const contents = [{ role: 'user', parts: [{ text: `Research and map this topic on my canvas: "${query}"` }] }];

  if (isClaude) {
    const response = await callClaudeAPI(modelName, [], instruction, functionTools, anthropicApiKey);
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === "addBoardItems") onBoardUpdate(call.args);
      }
    }
    return response.text || `Scanned "${query}" — check your canvas for new nodes.`;
  } else if (isUniversal) {
    const response = await callUniversalAPI(customModelName || 'gpt-4o', contents, instruction, functionTools, apiKey, customBaseUrl);
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === "addBoardItems") onBoardUpdate(call.args);
      }
    }
    return response.text || `Scanned "${query}" — check your canvas for new nodes.`;
  } else {
    // For Gemini SDK: pass googleSearch as a separate tool object in the SDK format
    // The SDK accepts { googleSearch: {} } as a tool alongside functionDeclarations
    const geminiTools: any[] = [...functionTools];
    if (!oauthToken) {
      // Only SDK path supports googleSearch grounding (REST OAuth path does not)
      geminiTools.push({ googleSearch: {} });
    }
    const response = await callGemini(
      modelName,
      contents,
      { systemInstruction: instruction, tools: geminiTools, temperature: 0.5 },
      apiKey,
      oauthToken
    );
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === "addBoardItems") onBoardUpdate(call.args);
      }
    }
    return response.text || `Scanned "${query}" — check your canvas for new nodes.`;
  }
}

export async function synthesizeInterviewsToNode(
  personaLabel: string,
  interviews: Array<{ messages: Array<{ role: string; text: string }> }>,
  onNodeUpdate: (data: { label: string; details: string }) => void,
  apiKey?: string,
  modelName: string = "gemini-1.5-pro",
  anthropicApiKey?: string,
  oauthToken?: string,
  customBaseUrl?: string,
  customModelName?: string
) {
  const isClaude = modelName.startsWith('claude-');
  const isUniversal = modelName === 'universal';
  const transcripts = interviews.map((iv, i) => `Interview ${i + 1}:\n${iv.messages.map(m => `${m.role}: ${m.text}`).join('\n')}`).join('\n\n');
  const instruction = `Synthesize transcripts for persona "${personaLabel}". Provide a rich audience profile summary.`;
  const contents = [{ role: 'user', parts: [{ text: transcripts }] }];

  if (isClaude) {
    const response = await callClaudeAPI(modelName, [], instruction, [], anthropicApiKey);
    onNodeUpdate({ label: personaLabel, details: `[RESEARCH SYNTHESIS]\n\n${response.text}` });
    return response.text;
  } else if (isUniversal) {
    const response = await callUniversalAPI(customModelName || 'gpt-4o', contents, instruction, [], apiKey, customBaseUrl);
    const synthesized = response.text || 'Synthesis failed.';
    onNodeUpdate({ label: personaLabel, details: `[RESEARCH SYNTHESIS]\n\n${synthesized}` });
    return synthesized;
  } else {
    const response = await callGemini(modelName, contents, { systemInstruction: instruction, temperature: 0.5 }, apiKey, oauthToken);
    const synthesized = response.text || 'Synthesis failed.';
    onNodeUpdate({ label: personaLabel, details: `[RESEARCH SYNTHESIS]\n\n${synthesized}` });
    return synthesized;
  }
}

export async function generateSessionSummary(
  history: any[],
  existingSummary?: string,
  apiKey?: string,
  modelName: string = "gemini-1.5-flash",
  anthropicApiKey?: string,
  oauthToken?: string,
  customBaseUrl?: string,
  customModelName?: string
) {
  const isClaude = modelName.startsWith('claude-');
  const isUniversal = modelName === 'universal';
  const instruction = `Condense history into a Strategic Summary. Merge if existing summary present.\n\nPrevious: ${existingSummary || "None"}`;
  const contents = [...history, { role: 'user', parts: [{ text: "Consolidate into summary." }] }];

  if (isClaude) {
    const response = await callClaudeAPI(modelName, contents, instruction, [], anthropicApiKey);
    return response.text;
  } else if (isUniversal) {
    const response = await callUniversalAPI(customModelName || 'gpt-4o', contents, instruction, [], apiKey, customBaseUrl);
    return response.text || 'Summary failed.';
  } else {
    const response = await callGemini(modelName, contents, { systemInstruction: instruction, temperature: 0.3 }, apiKey, oauthToken);
    return response.text || 'Summary failed.';
  }
}

export async function synthesizeTargetNode(
  sourceNodes: any[],
  targetNode: any,
  onNodeUpdate: (targetData: any) => void,
  apiKey?: string,
  modelName: string = "gemini-2.0-flash",
  anthropicApiKey?: string,
  oauthToken?: string, // kept for signature compatibility
  customBaseUrl?: string,
  customModelName?: string
) {
  const isClaude = modelName.startsWith('claude-');
  const isUniversal = modelName === 'universal';

  if (sourceNodes.length === 0) return;

  const sourcesText = sourceNodes.map(n => `[${n.type}] ${n.data.label}: ${n.data.details || ''}`).join('\n\n');
  const instruction = `You are a design synthesizer. Multiple source concepts are pointing into the target node. Analyze all incoming sources and rewrite the target node's content to perfectly synthesize their intersection.\n\nIncoming Sources:\n${sourcesText}\n\nCurrent Target Node:\n[${targetNode.type}] ${targetNode.data.label}\n\nUse the updateNode tool to completely rewrite the Target Node based on the synthesis of the sources.`;

  const tools = [{ functionDeclarations: [updateNodeDeclaration] }];
  const contents = [{ role: 'user', parts: [{ text: "Synthesize the connected nodes into the target node." }] }];

  if (isClaude) {
    const response = await callClaudeAPI(modelName, contents, instruction, tools, anthropicApiKey);
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === "updateNode") onNodeUpdate(call.args);
      }
    }
    return response.text;
  } else if (isUniversal) {
    const response = await callUniversalAPI(customModelName || 'gpt-4o', contents, instruction, tools, apiKey, customBaseUrl);
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === "updateNode") onNodeUpdate(call.args);
      }
    }
    return response.text || "Synthesized target node.";
  } else {
    const response = await callGemini(modelName, contents, { systemInstruction: instruction, tools, temperature: 0.6 }, apiKey, oauthToken);
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === "updateNode") onNodeUpdate(call.args);
      }
    }
    return response.text || "Synthesized target node.";
  }
}

