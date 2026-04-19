# ProblemSpace v2: Technical Manifesto & Feature Roadmap

ProblemSpace is a high-fidelity design discovery platform that transforms the "fog" of initial ideas into a structured, visual knowledge graph. It is designed to be a strategic partner, not just a tool, facilitating rigorous deconstruction of problems before jumping to solutions.

---

## 🚀 The "New Technology": Neural Memory Architecture

To overcome the limitations of standard context windows and prevent "AI drift" during long discovery sessions, we developed the **Neural Memory Architecture**.

### 1. Structured AI Scratchpad
Unlike traditional chatbots that rely on a linear message history, ProblemSpace maintains a **private, structured graph** (The Neural Memory) hidden from the user. This graph stores:
- **Compound Patterns**: Synthesized understandings (e.g., merging "User likes speed" and "User likes iteration" into "Pattern: High-Velocity Iteration").
- **User Preferences**: Long-term "truths" about the user's thinking style and priorities.
- **Structural Dependencies**: Complex relationships between different parts of the problem space.

### 2. The 10-Node Defragmentation (Soft Cap)
To remain extremely token-efficient, the Neural Memory employs an active **defragmentation strategy**:
- **Soft Cap**: The system aims to keep the memory under 10 high-fidelity nodes.
- **Auto-Merging**: When the cap is exceeded, the AI actively identifies related nodes and merges them into dense "Logic Blocks."
- **Importance Filtering**: 
    - **Score >= 7**: High-impact insights get dedicated memory nodes.
    - **Score 5-7**: Appended to "Insight Reservoirs" (collector nodes) to preserve context without bloating the graph.
    - **Score < 5**: Discarded to maintain focus.

### 3. Context Consolidation
The system periodically triggers a **Strategic Summarization** (Session Consolidation). It condenses thousands of words of chat history into a dense, professional markdown summary, which is then injected into the system prompt, clearing the raw history while retaining 100% of the strategic knowledge.

---

## 🛠️ Core Features

### 1. High-Fidelity Framework Engine
ProblemSpace ships with 1-click support for industry-standard discovery frameworks, modified for "100% Accuracy Mode" on the canvas:
- **Empathy Mapping**: Quadrant-based mapping (Says, Thinks, Does, Feels).
- **User/Product Journey Mapping**: Sequential stage mapping with integrated Rose/Thorn/Bud emotional tagging.
- **Amazon PR/FAQ**: Working backwards from a future press release.
- **Toyota 5 Whys**: Recursive root-cause analysis.
- **Lean Startup**: Mapping assumptions and validation metrics.
- **JTBD**: Defining "Jobs-to-be-Done" and functional/emotional outcomes.

### 2. Audience Simulator with Anti-Sycophancy
A specialized interview mode where the AI roleplays as target personas.
- **Anti-Sycophancy Engine**: Personas are programmed to be **skeptical and protective of their time**. They exhibit "Status Quo Bias" and will not validate a user's idea unless it solves a 10x pain point.
- **Research Synthesis**: Interviews are recorded and can be synthesized back into the canvas as high-signal audience profiles.

### 3. Thinking Modes (Six Hats Lens)
Switch the AI's "brain" instantly between specialized cognitive lenses:
- 🔴 **Gut Feeling**: Visceral, emotional reactions.
- 🟡 **Optimist**: Best-case scenarios and value discovery.
- ⚫ **Critic**: Identifying risks, flaws, and weak assumptions.
- 🟢 **Creative**: Wild, unconventional, "NASA-level" thinking.
- ⚪ **Data & Facts**: Separating known truths from guesses.
- 🔵 **Process**: Meta-facilitation and structural guidance.

### 4. Signal Scanner (Real-World Grounding)
Integrates **Google Search Grounding** to bring external market intelligence directly onto the React Flow canvas. It automatically scans for:
- Competitor movements.
- Market signals and trends.
- Real-world user feedback/complaints in the domain.

### 5. Reverse Brainstorming (Failure Mapping)
A "dark mode" for ideation where users brainstorm how to **guarantee failure**. Once the board is filled with risks, the **"Flip" tool** uses AI to invert these failures into innovative opportunities and safeguards.

---

## 🎨 Aesthetic & UX Principles
- **Neubrutalist Interface**: High contrast, bold borders, and vibrant "Logic Badges."
- **Visual Synthesis**: Chat is kept concise (<150 words); all "Deep Knowledge" is offloaded to the visual board.
- **Responsive Canvas**: Built on React Flow for infinite scalability and intuitive node-edge relationships.

---

## 🏗️ Building Blocks: The Interface Structure

ProblemSpace is architected to support a "Thought-to-Canvas" workflow, where every interaction is designed to move abstract ideas into concrete visual elements.

### 1. The Intelligent Chat Engine (Left Panel)
- **Primary Interface**: A persistent chat interface that acts as the "Strategic Lead."
- **Context-Aware Responses**: The chat adapts its tone and tools based on the active **Thinking Mode** or **Exercise Framework**.
- **Neubrutalist Badges**: Visual indicators (:::mode:::) within the chat bubbles that highlight when the AI is using a specific cognitive lens (e.g., Critic, Optimist).
- **Embedded Action Buttons**: Inline controls for specific workflows like "Flip Failure" or "Start Synthesis."

### 2. The Dynamic Canvas (Center/Main Workspace)
- **React Flow Engine**: An infinite, Zoom-and-Pan canvas that serves as the "Common Ground" between the user and the AI.
- **Custom Node Ecosystem**: 20+ specialized node types (Problem, Insight, Audience, HMW, signal, journey-step, etc.), each with defined visual styles and semantic roles.
- **Semantic Edges**: Animated connections that show logical flow, causal relationships, or sequential steps.
- **Dual-Board View**: A toggleable interface that lets the user switch between the **Primary Workspace** and the **Neural Memory** (the AI's internal scratchpad).

### 3. Tactical Side Panels
- **Framework Selector**: A curated library of discovery exercises that, when activated, inject specialized system instructions into the AI.
- **Constraint Manager**: A system for defining "Boundaries" (e.g., budget, timeline, technical limits) that the AI must enforce during ideation sessions.
- **Exercise Progress Tracker**: A visual "mini-map" of the current discovery sprint, showing completed vs. pending tasks.

### 4. Specialized Modals & Workflows
- **Audience Setup**: A dedicated space for defining the identity and behavior of simulated personas.
- **Signal Scanner UI**: A search-driven interface that pulls real-time market data onto the board.
- **Strategic Summary Editor**: A prompt-driven modal that allows users to review and refine the "Consolidated Memory" before it is finalized into the long-term history.

---

## 📈 Future Efficiency Roadmap
- **Multiplayer "Logic Locks"**: Real-time collaborative deconstruction.
- **Automated PRD/FAQ Generation**: Exporting the visual graph into enterprise-ready documentation.
- **Gemini 3 Pro Integration**: Moving to 1M+ context window while maintaining high-speed Flash nodes for board updates.

