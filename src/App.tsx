import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles, User, Bot, LayoutDashboard, Target, X, Home, Moon, Sun, Trash2, FileText, RotateCcw, Plus, Radio, Brain, RefreshCw, Link, UserPlus, Heart, ShieldAlert, Lightbulb, Database, Settings,
  Footprints, MessageCircle, LayoutGrid, Zap, Swords, PenTool, ArrowRight, Workflow, Layers, FolderCode, FlaskConical, ChevronLeft, ChevronRight
} from 'lucide-react';
import { NeuronIcon } from './components/ui/NeuronIcon';
import Markdown from 'react-markdown';
import { generateNextResponse, generateNodeRefinementResponse, getInitialMessage, flipFailureNodes, scanSignal, synthesizeInterviewsToNode, generateSessionSummary, synthesizeTargetNode } from './lib/gemini';
import Board from './components/Board';
import LandingPage from './components/LandingPage';
import FrameworkSelector from './components/FrameworkSelector';
import ExercisePanel from './components/ExercisePanel';
import SprintSummary from './components/SprintSummary';
import IntelligenceHubModal from './components/IntelligenceHubModal';
import SummaryEditModal from './components/SummaryEditModal';
import { PromptInputBox } from './components/ui/ai-prompt-box';
import { useSprintState } from './hooks/useSprintState';
import { usePersistence } from './hooks/usePersistence';
import { NODE_TYPE_LABELS } from './components/nodes/CustomNodes';
import { AnimatePresence, motion } from 'framer-motion';
import ConstraintPanel, { Constraint } from './components/ConstraintPanel';
import SignalScanner from './components/SignalScanner';
import AudienceSimulator, { SavedInterview } from './components/AudienceSimulator';
import PersonaSetupModal from './components/PersonaSetupModal';
import { useAuth } from './lib/AuthContext';
import LoginOverlay from './components/LoginOverlay';
import UserProfileDropdown from './components/UserProfileDropdown';
import { MODELS } from './lib/models';

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
};

export default function App() {
  const { oauthToken, user, isAuthenticated, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('problemspace-dark-mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('problemspace-dark-mode', String(isDarkMode));
  }, [isDarkMode]);

  const [hasStarted, setHasStarted] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  // Sprint state
  const sprint = useSprintState();

  // Chat state - keyed by phase+exercise context (persisted to localStorage)
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('problemspace-chat-messages');
        if (saved) return JSON.parse(saved);
      } catch (e) { }
    }
    return [{
      id: 'initial',
      role: 'model',
      text: "Welcome to ProblemSpace. What's the complex problem we're breaking down today?"
    }];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('problemspace-chat-history');
        if (saved) return JSON.parse(saved);
      } catch (e) { }
    }
    return [];
  });

  // Board State
  const [boardItems, setBoardItems] = useState<any>(null);

  // New Features State
  const [constraints, setConstraints] = useState<Constraint[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('problemspace-constraints-v1');
        if (saved) return JSON.parse(saved);
      } catch (e) { }
    }
    return [];
  });
  const [showSignalScanner, setShowSignalScanner] = useState(false);
  const [simulatingPersona, setSimulatingPersona] = useState<any>(null);
  const [simulationSetupPersona, setSimulationSetupPersona] = useState<any>(null);
  const [savedInterviews, setSavedInterviews] = useState<SavedInterview[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('problemspace-interviews-v1');
        if (saved) return JSON.parse(saved);
      } catch (e) { }
    }
    return [];
  });
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [showThinkingModes, setShowThinkingModes] = useState(false);
  const [showFrameworkSelector, setShowFrameworkSelector] = useState(false);
  const [isIntelligenceHubOpen, setIsIntelligenceHubOpen] = useState(false);
  const [userApiKey, setUserApiKey] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('problemspace-user-api-key') || '' : ''));
  const [anthropicApiKey, setAnthropicApiKey] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('problemspace-anthropic-api-key') || '' : ''));
  const [sessionSummary, setSessionSummary] = useState<string>(() => (typeof window !== 'undefined' ? localStorage.getItem('problemspace-session-summary-v1') || '' : ''));
  const [summaryFrequency, setSummaryFrequency] = useState(() => (typeof window !== 'undefined' ? Number(localStorage.getItem('problemspace-summary-freq') || '10') : 10));
  const [pendingSummary, setPendingSummary] = useState('');
  const [showSummaryEditModal, setShowSummaryEditModal] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState<string>(() => (typeof window !== 'undefined' ? localStorage.getItem('problemspace-ai-model') || 'gemini-2.0-flash' : 'gemini-2.0-flash'));
  const [isNeuralViewOpen, setIsNeuralViewOpen] = useState(false);
  const [customBaseUrl, setCustomBaseUrl] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('problemspace-custom-base-url') || 'https://api.openai.com/v1' : 'https://api.openai.com/v1'));
  const [customModelName, setCustomModelName] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('problemspace-custom-model-name') || 'gpt-4o' : 'gpt-4o'));
  const [universalApiKey, setUniversalApiKey] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('problemspace-universal-api-key') || '' : ''));


  // Local state for manual node editing (to prevent focus loss and lag)
  const [localLabel, setLocalLabel] = useState('');
  const [localDetails, setLocalDetails] = useState('');
  const [isNodeEditDirty, setIsNodeEditDirty] = useState(false);


  // Auto-open Settings after login if required API key is missing for current provider
  useEffect(() => {
    if (!isAuthenticated) return;
    const needsGeminiKey = !aiModel.startsWith('claude-') && aiModel !== 'universal' && !userApiKey;
    const needsAnthropicKey = aiModel.startsWith('claude-') && !anthropicApiKey;
    const needsUniversalKey = aiModel === 'universal' && !userApiKey;
    if (needsGeminiKey || needsAnthropicKey || needsUniversalKey) {
      setIsIntelligenceHubOpen(true);
    }
  }, [isAuthenticated, aiModel, userApiKey, anthropicApiKey]);

  const STARTER_NODES = [
    { id: 'start-problem', type: 'problem', position: { x: 0, y: 0 }, data: { label: 'Defining the Core Challenge', details: 'What is the absolute root cause of the friction we see?' } },
    { id: 'start-audience', type: 'audience', position: { x: -300, y: 100 }, data: { label: 'Primary Actor', details: 'Who is feeling this pain most acutely?' } },
    { id: 'start-insight', type: 'insight', position: { x: 300, y: 100 }, data: { label: 'Key Insight', details: 'A non-obvious truth about the problem space.' } },
    { id: 'start-instr-1', type: 'sticky', position: { x: -100, y: -200 }, data: { label: 'Double-Click Canvas', details: 'Add a new sticky note anywhere instantly.' } },
    { id: 'start-instr-2', type: 'sticky', position: { x: 150, y: -200 }, data: { label: 'Direct Editing', details: 'Click names/details to edit text inline.' } },
  ];
  const STARTER_EDGES = [
    { id: 'e1', source: 'start-audience', target: 'start-problem', animated: true, style: { strokeWidth: 3 } },
    { id: 'e2', source: 'start-insight', target: 'start-problem', animated: true, style: { strokeWidth: 3 } },
  ];

  type BoardData = { id: string; name: string; nodes: any[]; edges: any[]; };
  const [projectBoards, setProjectBoards] = useState<BoardData[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('problemspace-project-boards-v4');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (!parsed.find((b: any) => b.id === 'ai-memory')) {
            parsed.push({ id: 'ai-memory', name: 'Neural Memory', nodes: [], edges: [] });
          }
          return parsed;
        }
      } catch (e) { }
    }
    return [
      { id: 'default', name: 'Welcome Workspace', nodes: STARTER_NODES, edges: STARTER_EDGES },
      { id: 'ai-memory', name: 'Neural Memory', nodes: [], edges: [] }
    ];
  });

  const [activeBoardId, setActiveBoardId] = useState<string>('default');
  const initialBoard = projectBoards.find(b => b.id === (activeBoardId || 'default')) || projectBoards[0];

  const [restoreState, setRestoreState] = useState<{ nodes: any[], edges: any[] } | undefined>({
    nodes: initialBoard.nodes,
    edges: initialBoard.edges
  });

  // Board nodes ref to pass to summary and save state
  const [boardNodesSnapshot, setBoardNodesSnapshot] = useState<any[]>(initialBoard.nodes);
  const [boardEdgesSnapshot, setBoardEdgesSnapshot] = useState<any[]>(initialBoard.edges);


  // Synchronize snapshots back to active board state on a slight denounce (so we don't block too hard)
  useEffect(() => {
    const timer = setTimeout(() => {
      setProjectBoards(boards => boards.map(b =>
        b.id === activeBoardId
          ? { ...b, nodes: boardNodesSnapshot, edges: boardEdgesSnapshot }
          : b
      ));
    }, 1000);
    return () => clearTimeout(timer);
  }, [boardNodesSnapshot, boardEdgesSnapshot, activeBoardId]);

  // Multi-Board Functions
  const handleSwitchBoard = (id: string) => {
    if (id === activeBoardId) return;

    // Save current active board immediately
    setProjectBoards(boards => boards.map(b =>
      b.id === activeBoardId ? { ...b, nodes: boardNodesSnapshot, edges: boardEdgesSnapshot } : b
    ));

    // Switch
    const nextBoard = projectBoards.find(b => b.id === id);
    if (nextBoard) {
      setActiveBoardId(id);
      setRestoreState({ nodes: nextBoard.nodes, edges: nextBoard.edges });
      setBoardNodesSnapshot(nextBoard.nodes);
      setBoardEdgesSnapshot(nextBoard.edges);
      setSelectedNode(null);
      setSelectedEdge(null);
    }
  };

  const handleAddBoard = () => {
    const visibleCount = projectBoards.filter(b => b.id !== 'ai-memory').length;
    const newBoard = { id: `board-${Date.now()}`, name: `Canvas ${visibleCount + 1}`, nodes: [], edges: [] };
    setProjectBoards(boards => [
      ...boards.map(b => b.id === activeBoardId ? { ...b, nodes: boardNodesSnapshot, edges: boardEdgesSnapshot } : b),
      newBoard
    ]);
    setActiveBoardId(newBoard.id);
    setRestoreState({ nodes: [], edges: [] });
    setBoardNodesSnapshot([]);
    setBoardEdgesSnapshot([]);
    setSelectedNode(null);
  };

  const handleMemoryUpdate = (data: any) => {
    // If we are currently looking at the Neural Memory, route updates through newItems to trigger auto-layout
    if (activeBoardId === 'ai-memory') {
      setBoardItems(data);
    }

    setProjectBoards(boards => boards.map(b => {
      if (b.id === 'ai-memory') {
        const newNodes = [...b.nodes];
        const newEdges = [...b.edges];

        if (data.nodes) {
          data.nodes.forEach((newNode: any) => {
            const idx = newNodes.findIndex(n => n.id === newNode.id);
            const flowNode = {
              id: newNode.id,
              type: 'memory', // Force neural memory visual style
              position: newNode.position || (idx > -1 ? newNodes[idx].position : { x: 0, y: 0 }),
              data: {
                label: newNode.label,
                details: newNode.details,
                importance: newNode.importance
              }
            };
            if (idx > -1) newNodes[idx] = flowNode;
            else newNodes.push(flowNode);
          });
        }

        if (data.edges) {
          data.edges.forEach((newEdge: any) => {
            const eId = `e-${newEdge.source}-${newEdge.target}`;
            if (!newEdges.find(e => e.id === eId)) {
              newEdges.push({ id: eId, source: newEdge.source, target: newEdge.target, animated: true });
            }
          });
        }

        return { ...b, nodes: newNodes, edges: newEdges };
      }
      return b;
    }));
  };

  const currentAiMemory = projectBoards.find(b => b.id === 'ai-memory') || { nodes: [], edges: [] };

  const [hoveredDescription, setHoveredDescription] = useState<string | null>(null);

  // Custom Markdown components to replace :::mode::: with styled badges
  const MarkdownComponents = {
    p: ({ children, ...props }: any) => {
      const modeData = [
        { id: 'think-gut', label: 'Gut', color: 'bg-red-500', icon: Heart },
        { id: 'think-optimist', label: 'Optimist', color: 'bg-yellow-500', icon: Sun },
        { id: 'think-critic', label: 'Critic', color: 'bg-neutral-900', icon: ShieldAlert, textColor: 'text-white' },
        { id: 'think-creative', label: 'Wild', color: 'bg-green-500', icon: Lightbulb },
        { id: 'think-data', label: 'Data', color: 'bg-neutral-200 text-black', icon: Database, textColor: 'text-black' },
        { id: 'think-process', label: 'Process', color: 'bg-blue-500', icon: Settings }
      ];

      const parts = React.Children.toArray(children).flatMap((child, childIdx) => {
        if (typeof child === 'string') {
          // Handle both :::mode::: and |||description|||
          return child.split(/(:::[^:]+:::|\|\|\|[^|]+\|\|\|)/g).map((part, partIdx) => {
            if (part.startsWith(':::') && part.endsWith(':::')) {
              const modeId = part.replaceAll(':', '');
              const mode = modeData.find(m => m.id === modeId);
              if (mode) {
                return (
                  <span
                    key={`mode-${childIdx}-${partIdx}`}
                    className={`inline-flex items-center justify-center w-7 h-7 border border-[var(--color-border)] ${mode.color} ${mode.textColor || 'text-white'} shadow-sm  font-bold mr-2 mb-1 align-middle`}
                  >
                    <mode.icon className="w-4 h-4" />
                  </span>
                );
              }
            }
            if (part.startsWith('|||') && part.endsWith('|||')) {
              const text = part.replaceAll('|', '');
              return (
                <small
                  key={`desc-${childIdx}-${partIdx}`}
                  className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 -mt-1 mb-2 leading-tight"
                >
                  {text}
                </small>
              );
            }
            return part;
          });
        }
        return child;
      });

      return <p className="mb-3 leading-relaxed" {...props}>{parts}</p>;
    },
    small: ({ children, ...props }: any) => (
      <small className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 -mt-1 mb-2 leading-tight" {...props}>
        {children}
      </small>
    )
  };

  const handleDeleteBoard = (id: string, e: any) => {
    e.stopPropagation();
    if (projectBoards.length === 1) {
      setDeleteError("You cannot delete your only board. ProblemSpace requires at least one active canvas.");
      return;
    }
    setBoardToDelete(id);
  };

  const confirmDeleteBoard = () => {
    if (!boardToDelete) return;

    const remainingBoards = projectBoards.filter(b => b.id !== boardToDelete);
    setProjectBoards(remainingBoards);

    if (activeBoardId === boardToDelete) {
      handleSwitchBoard(remainingBoards[0].id);
    }
    setBoardToDelete(null);
  };

  // Node Focus State
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [updatedNodes, setUpdatedNodes] = useState<any[]>([]);
  const clearUpdatedNodes = useCallback(() => setUpdatedNodes([]), []);

  const [deletedNodeId, setDeletedNodeId] = useState<string | undefined>(undefined);
  const [nodeMessages, setNodeMessages] = useState<Record<string, Message[]>>({});
  const [nodeHistory, setNodeHistory] = useState<Record<string, any[]>>({});
  const [isNodeLoading, setIsNodeLoading] = useState(false);

  // Edge Focus State
  const [selectedEdge, setSelectedEdge] = useState<any>(null);
  const [updatedEdge, setUpdatedEdge] = useState<any>(null);
  const clearUpdatedEdge = useCallback(() => setUpdatedEdge(null), []);
  const [deletedEdgeId, setDeletedEdgeId] = useState<string | undefined>(undefined);

  // Responsive Window Size Tracking
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  usePersistence({
    constraints,
    userApiKey,
    anthropicApiKey,
    sessionSummary,
    summaryFrequency,
    aiModel,
    customBaseUrl,
    customModelName,
    universalApiKey,
    messages,
    history,
    savedInterviews,
    projectBoards
  });

  useEffect(() => {
    if (selectedNode) {
      // Find the actual current state of this node on the board
      const currentNode = boardNodesSnapshot.find(n => n.id === selectedNode.id);
      if (currentNode && !isNodeEditDirty) {
        // If the board data changed (e.g. via AI) and we haven't started typing manually, sync it
        if (currentNode.data.label !== localLabel) setLocalLabel(currentNode.data.label || '');
        if (currentNode.data.details !== localDetails) setLocalDetails(currentNode.data.details || '');
      }
    }
  }, [boardNodesSnapshot, selectedNode, isNodeEditDirty, localLabel, localDetails]);

  const [showSummary, setShowSummary] = useState(false);

  const handleCompleteExercise = (exerciseId: string) => {
    sprint.completeExercise(exerciseId);
    const snapshots = JSON.parse(localStorage.getItem('problemspace-snapshots') || '[]');
    snapshots.push({
      id: Date.now(),
      exerciseId,
      timestamp: new Date().toISOString(),
      nodes: boardNodesSnapshot,
      edges: boardEdgesSnapshot
    });
    localStorage.setItem('problemspace-snapshots', JSON.stringify(snapshots));
  };


  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nodeMessagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollNodeToBottom = () => {
    nodeMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    scrollNodeToBottom();
  }, [nodeMessages, selectedNode]);

  // Listener for custom events from child node components (like ImageNode)
  useEffect(() => {
    const handleNodeUpdate = (e: any) => {
      const { id, data } = e.detail;
      setUpdatedNodes([{ id, data }]);
      setSelectedNode(prev => (prev && prev.id === id) ? { ...prev, data: { ...prev.data, ...data } } : prev);
    };

    window.addEventListener('node-data-update', handleNodeUpdate);
    return () => window.removeEventListener('node-data-update', handleNodeUpdate);
  }, []);

  // Update chat initial message when phase, exercise, or thinking mode changes
  // Preserve session summary as AI seed context so it retains prior knowledge across exercise switches
  useEffect(() => {
    const newInitialMsg = getInitialMessage(sprint.currentPhase, sprint.activeExercise, sprint.activeThinkingMode);
    setMessages([{
      id: `initial-${sprint.currentPhase}-${sprint.activeExercise || 'free'}-${sprint.activeThinkingMode || 'standard'}`,
      role: 'model',
      text: newInitialMsg
    }]);
    // Seed history with session summary so the AI retains context, instead of losing everything
    setHistory(sessionSummary
      ? [{ role: 'user', parts: [{ text: `[Context from previous discussion]: ${sessionSummary}` }] },
      { role: 'model', parts: [{ text: 'Understood. I have the context from our previous discussion. Let\'s continue.' }] }]
      : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sprint.currentPhase, sprint.activeExercise, sprint.activeThinkingMode]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userText = messageText.trim();

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // ─── CONTEXT SUMMARIZATION ──────────────────────────────────────────
      // If history is getting long, summarize old parts every X messages (configured by user)
      let effectiveHistory = [...history];
      if (history.length >= summaryFrequency && !isSummarizing) {
        setIsSummarizing(true);
        try {
          const draft = await generateSessionSummary(
            effectiveHistory,
            sessionSummary,
            userApiKey,
            aiModel,
            anthropicApiKey,
            undefined, // oauthToken
            aiModel === 'universal' ? customBaseUrl : undefined,
            aiModel === 'universal' ? customModelName : undefined,
            universalApiKey
          );
          setPendingSummary(draft);
          setShowSummaryEditModal(true);
          // Optimization: We don't return here anymore. We let the generateNextResponse call proceed 
          // but we use the DRAFT session summary as part of the context for the current response.
          // This keeps the chat flowing while the user edits the summary in parallel.
          // Note: setIsLoading remains true.
        } catch (e) {
          console.error("Summarization failed:", e);
        } finally {
          setIsSummarizing(false);
        }
      }

      const { text, newHistory } = await generateNextResponse(
        effectiveHistory,
        userText,
        (data) => setBoardItems(data),
        sprint.currentPhase,
        sprint.activeExercise,
        sprint.activeThinkingMode,
        sprint.activeExerciseData?.systemPrompt,
        constraints,
        sessionSummary,
        userApiKey,
        aiModel,
        currentAiMemory,
        handleMemoryUpdate,
        anthropicApiKey,
        undefined, // oauthToken
        aiModel === 'universal' ? customBaseUrl : undefined,
        aiModel === 'universal' ? customModelName : undefined,
        universalApiKey,
        boardNodesSnapshot
      );

      setHistory(newHistory.slice(-30)); // Safety cap on total raw history

      if (text) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text }]);
      }
    } catch (error: any) {
      console.error("Error generating response:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: `Error: ${error.message || String(error)}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlipFailures = async () => {
    const failureNodes = boardNodesSnapshot.filter(n => n.type === 'failure');
    if (failureNodes.length === 0) {
      alert("No failure nodes found to flip!");
      return;
    }

    setIsLoading(true);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: "[System: Flip all failures into positive insights]" }]);

    try {
      const text = await flipFailureNodes(
        failureNodes.map(n => ({ id: n.id, label: n.data.label, details: n.data.details })),
        (data) => setBoardItems(data),
        userApiKey,
        aiModel,
        anthropicApiKey,
        undefined, // oauthToken
        aiModel === 'universal' ? customBaseUrl : undefined,
        aiModel === 'universal' ? customModelName : undefined,
        universalApiKey,
        boardNodesSnapshot
      );
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `🔄 **Success!** ${text}` }]);
    } catch (err) {
      console.error(err);
      alert("Flip failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonaPin = (nodeData: any) => {
    setBoardItems({ nodes: [nodeData], edges: [] });
  };

  const handleSaveInterview = (interview: SavedInterview) => {
    setSavedInterviews(prev => {
      const idx = prev.findIndex(iv => iv.id === interview.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = interview;
        return next;
      }
      return [...prev, interview];
    });
  };

  const handleRenameInterview = (sessionId: string, newLabel: string) => {
    setSavedInterviews(prev => prev.map(iv => iv.id === sessionId ? { ...iv, customLabel: newLabel } : iv));
  };

  const handleSynthesizeInterviews = async (nodeId: string, personaLabel: string) => {
    const interviews = savedInterviews.filter(iv => iv.personaId === nodeId);
    if (interviews.length === 0) return;
    setIsSynthesizing(true);
    try {
      await synthesizeInterviewsToNode(
        personaLabel,
        interviews,
        (data) => {
          setUpdatedNodes([{ id: nodeId, data }]);
          setSelectedNode((prev: any) => ({ ...prev, data: { ...prev.data, ...data } }));
        },
        userApiKey,
        aiModel,
        anthropicApiKey,
        undefined, // oauthToken
        aiModel === 'universal' ? customBaseUrl : undefined,
        aiModel === 'universal' ? customModelName : undefined, universalApiKey
      );
    } catch (err) {
      console.error('Synthesis failed:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSaveSummary = (final: string) => {
    setSessionSummary(final);
    const truncated = history.slice(-6);
    setHistory(truncated);
    setShowSummaryEditModal(false);
    setPendingSummary('');
    // Trigger the AI response automatically after save to keep it seamless.
    continueAfterSummary(truncated, final);
  };

  const continueAfterSummary = async (newHistory: any[], newSummary: string) => {
    if (messages.length === 0) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;

    setIsLoading(true);
    try {
      const { text, newHistory: aiResponseHistory } = await generateNextResponse(
        newHistory,
        lastUserMsg.text,
        (data) => setBoardItems(data),
        sprint.currentPhase,
        sprint.activeExercise,
        sprint.activeThinkingMode,
        sprint.activeExerciseData?.systemPrompt,
        constraints,
        newSummary,
        userApiKey,
        aiModel,
        currentAiMemory,
        handleMemoryUpdate,
        anthropicApiKey,
        undefined, // oauthToken
        aiModel === 'universal' ? customBaseUrl : undefined,
        aiModel === 'universal' ? customModelName : undefined,
        universalApiKey,
        boardNodesSnapshot
      );
      setHistory(aiResponseHistory.slice(-30));
      if (text) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = (node: any) => {
    if (!node) {
      setSelectedNode(null);
      return;
    }
    setSelectedEdge(null);
    setSelectedNode(node);

    // Initialize local edit state
    if (node) {
      setLocalLabel(node.data.label || '');
      setLocalDetails(node.data.details || '');
      setIsNodeEditDirty(false);
    }

    if (node && !nodeMessages[node.id]) {
      setNodeMessages(prev => ({
        ...prev,
        [node.id]: [{
          id: 'initial',
          role: 'model',
          text: `Let's discuss this ${NODE_TYPE_LABELS[node.type] || node.type}: "${node.data.label}". What would you like to change or expand upon?`
        }]
      }));
    }
  };

  const handleEdgeClick = (edge: any) => {
    setSelectedNode(null);
    setSelectedEdge(edge);
  };

  const handleEdgeConnect = async (params: any) => {
    const targetNode = boardNodesSnapshot.find(n => n.id === params.target);
    if (!targetNode) return;

    // Find all edges pointing to this target node (including the one being created)
    const currentEdges = [...boardEdgesSnapshot, { source: params.source, target: params.target }];
    const incomingEdges = currentEdges.filter(e => e.target === params.target);

    // Extract the source nodes for all these edges
    const sourceNodes = incomingEdges
      .map(edge => boardNodesSnapshot.find(n => n.id === edge.source))
      .filter((n): n is any => !!n);

    if (sourceNodes.length === 0) return;

    try {
      await synthesizeTargetNode(
        sourceNodes,
        targetNode,
        (targetUpdate) => {
          setUpdatedNodes([{ id: params.target, data: targetUpdate }]);

          if (selectedNode?.id === params.target) {
            setSelectedNode((prev: any) => ({ ...prev, data: { ...prev.data, ...targetUpdate } }));
          }
        },
        userApiKey,
        aiModel,
        anthropicApiKey,
        undefined, // oauthToken
        aiModel === 'universal' ? customBaseUrl : undefined,
        aiModel === 'universal' ? customModelName : undefined, universalApiKey
      );
    } catch (err) {
      console.error("Node Synthesis failed:", err);
    }
  };

  const handleNodeSend = async (messageText: string) => {
    if (!messageText.trim() || isNodeLoading || !selectedNode) return;

    const userText = messageText.trim();
    const nodeId = selectedNode.id;

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
    setNodeMessages(prev => ({ ...prev, [nodeId]: [...(prev[nodeId] || []), newUserMsg] }));
    setIsNodeLoading(true);

    try {
      // Find connected nodes to provide context
      const connectedEdgeIds = boardEdgesSnapshot
        .filter(e => e.source === nodeId || e.target === nodeId)
        .map(e => e.source === nodeId ? e.target : e.source);

      const connectedNodesData = boardNodesSnapshot
        .filter(n => connectedEdgeIds.includes(n.id))
        .map(n => ({ type: n.type, data: n.data }));

      const currentHistory = nodeHistory[nodeId] || [];
      const { text, newHistory } = await generateNodeRefinementResponse(
        selectedNode,
        currentHistory,
        userText,
        (data) => {
          setUpdatedNodes([{ id: nodeId, data }]);
          setSelectedNode((prev: any) => ({ ...prev, data: { ...prev.data, ...data } }));
        },
        (data) => setBoardItems(data),
        sprint.activeExercise,
        sprint.activeThinkingMode,
        userApiKey,
        aiModel,
        currentAiMemory,
        handleMemoryUpdate,
        connectedNodesData,
        anthropicApiKey,
        undefined, // oauthToken
        aiModel === 'universal' ? customBaseUrl : undefined,
        aiModel === 'universal' ? customModelName : undefined, universalApiKey
      );

      setNodeHistory(prev => ({ ...prev, [nodeId]: newHistory }));

      if (text) {
        setNodeMessages(prev => ({ ...prev, [nodeId]: [...(prev[nodeId] || []), { id: Date.now().toString(), role: 'model', text }] }));
      }
    } catch (error: any) {
      console.error("Error generating response:", error);
      setNodeMessages(prev => ({
        ...prev, [nodeId]: [...(prev[nodeId] || []), {
          id: Date.now().toString(),
          role: 'model',
          text: "Sorry, I encountered an error. Please try again."
        }]
      }));
    } finally {
      setIsNodeLoading(false);
    }
  };

  const handleSaveNodeUpdate = () => {
    if (!selectedNode) return;

    const nodeId = selectedNode.id;
    const updateData = { label: localLabel, details: localDetails };

    // Update local state for immediate feedback in the panel
    setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, ...updateData } });

    // Dispatch update to board
    setUpdatedNodes([{ id: nodeId, data: updateData }]);
    setIsNodeEditDirty(false);
  };

  // Not wrapped in useCallback — handleSend captures current state each render,
  // so memoizing with stale deps would cause the callback to use outdated closures
  const handleExercisePrompt = (prompt: string) => {
    handleSend(prompt);
  };

  // All node type options for the dropdown
  const nodeTypeOptions = Object.entries(NODE_TYPE_LABELS).map(([value, label]) => ({ value, label }));

  const handleIntelligenceSave = (config: {
    model: string;
    frequency: number;
    geminiKey: string;
    anthropicKey: string;
    customBaseUrl: string;
    customModelName: string;
    universalKey: string;
  }) => {
    console.log("App: handleIntelligenceSave triggered with config:", config);
    setAiModel(config.model);
    setSummaryFrequency(config.frequency);
    setUserApiKey(config.geminiKey);
    setAnthropicApiKey(config.anthropicKey);
    setCustomBaseUrl(config.customBaseUrl);
    setCustomModelName(config.customModelName);
    setUniversalApiKey(config.universalKey);

    // Global persistence
    localStorage.setItem('problemspace-ai-model', config.model);
    localStorage.setItem('problemspace-summary-freq', config.frequency.toString());
    localStorage.setItem('problemspace-user-api-key', config.geminiKey);
    localStorage.setItem('problemspace-anthropic-api-key', config.anthropicKey);
    localStorage.setItem('problemspace-custom-base-url', config.customBaseUrl);
    localStorage.setItem('problemspace-custom-model-name', config.customModelName);
    localStorage.setItem('problemspace-universal-api-key', config.universalKey);

    setHasStarted(true);
    setIsIntelligenceHubOpen(false);
  };

  if (!isAuthenticated) {
    return <LoginOverlay isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />;
  }

  if (!hasStarted) {
    return <LandingPage
      onStart={handleIntelligenceSave}
      isDarkMode={isDarkMode}
      toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
    />;
  }

  return (
    <div className="flex h-screen w-full bg-[var(--color-cream-warm)] text-neutral-900 dark:text-neutral-100 font-sans overflow-hidden transition-colors">
      <AnimatePresence>
        {isIntelligenceHubOpen && (
          <IntelligenceHubModal
            initialConfig={{
              model: aiModel,
              frequency: summaryFrequency,
              geminiKey: userApiKey,
              anthropicKey: anthropicApiKey,
              customBaseUrl: customBaseUrl,
              customModelName: customModelName,
              universalKey: universalApiKey
            }}
            onSave={handleIntelligenceSave}
            onClose={() => setIsIntelligenceHubOpen(false)}
          />
        )}
      </AnimatePresence>
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0"
        style={{
          backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Chat Panel & Exercise Panel */}
      <div className={`fixed lg:relative inset-y-0 left-0 flex flex-col h-full shrink-0 border-r border-[var(--color-border)] bg-[var(--color-cream)] z-30 shadow-lg transition-all duration-300 ${isLeftCollapsed ? 'w-0 lg:w-16 items-center py-4' : 'w-full lg:w-[400px] xl:w-[450px]'}`}>
        <AnimatePresence>
          {!isLeftCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLeftCollapsed(true)}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[25] lg:hidden"
            />
          )}
        </AnimatePresence>

        {isLeftCollapsed ? (
          <>
            {/* Desktop Collapsed View */}
            <div className="hidden lg:flex flex-col items-center gap-6 w-full h-full">
              <button onClick={() => setIsLeftCollapsed(false)} className="w-10 h-10 border border-transparent hover:border-black dark:hover:border-white hover:shadow-sm  flex items-center justify-center transition-all">
                <ChevronRight className="w-5 h-5 dark:text-white" />
              </button>
              <div className="w-10 h-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-ink)] text-[var(--color-cream)] flex items-center justify-center shadow-sm  transition-all shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center opacity-30 select-none pointer-events-none">
                <span className="[writing-mode:vertical-rl] rotate-180 font-black tracking-[0.3em] uppercase text-xl dark:text-white">
                  ProblemSpace
                </span>
              </div>
            </div>

            {/* Mobile Floating Toggle */}
            <div className="lg:hidden fixed bottom-6 left-6 z-[40]">
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => setIsLeftCollapsed(false)}
                className="w-14 h-14 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full shadow-[var(--shadow-elevated)] flex items-center justify-center border-2 border-[var(--color-border)] active:scale-95 transition-transform"
              >
                <Sparkles className="w-6 h-6" />
              </motion.button>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full w-[100%] overflow-hidden">
            <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-cream)] transition-colors shrink-0">
              {/* Logo / Home */}
              <div
                className="flex items-center cursor-pointer group select-none ml-1 mr-2"
                onClick={() => setHasStarted(false)}
                title="Return to Home"
              >
                <div className="flex items-center text-xl leading-none transition-transform group-hover:scale-[1.02] shrink-0">
                  <span className="font-sans font-bold text-[#E05D36]">PS</span>
                  <span className="font-sans font-bold text-neutral-300 dark:text-neutral-600 mx-1.5">/</span>
                </div>
                <span className="font-mono font-medium text-[var(--color-ink)] tracking-tight shrink-0">problemspace</span>
              </div>

              {/* Tools & Profile */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Mobile-Only Collapse Button */}
                <button
                  onClick={() => setIsLeftCollapsed(true)}
                  className="lg:hidden w-10 h-10 mr-1 rounded-xl bg-[var(--color-cream-deep)] text-[var(--color-ink)] flex items-center justify-center transition-all border border-[var(--color-border)] active:scale-90"
                  title="Close Chat"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    const nextId = isNeuralViewOpen ? 'default' : 'ai-memory';
                    handleSwitchBoard(nextId);
                    setIsNeuralViewOpen(!isNeuralViewOpen);
                  }}
                  title={isNeuralViewOpen ? "Back to Workspace" : "View Neural Memory (AI Scratchpad)"}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isNeuralViewOpen ? 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/40 dark:text-fuchsia-300' : 'hover:bg-[var(--color-cream-warm)] text-[var(--color-ink)]'}`}
                >
                  <NeuronIcon className="w-4 h-4" />
                </button>
                
                {/* Hidden on small mobile to save space */}
                <div className="hidden sm:flex items-center gap-1">
                  <button
                    onClick={() => setShowSignalScanner(true)}
                    title="Signal Scanner (Market Intelligence)"
                    className="w-8 h-8 rounded-lg hover:bg-[var(--color-cream-warm)] text-[var(--color-ink)] flex items-center justify-center transition-all"
                  >
                    <Link className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    title="Toggle Light/Dark Mode"
                    className="w-8 h-8 rounded-lg hover:bg-[var(--color-cream-warm)] text-[var(--color-ink)] flex items-center justify-center transition-all"
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                </div>

                <div className="mx-1 w-px h-5 bg-[var(--color-border)]" />

                <UserProfileDropdown
                  onOpenSettings={() => setIsIntelligenceHubOpen(true)}
                />

                {/* Desktop-Only Collapse Button */}
                <button
                  onClick={() => setIsLeftCollapsed(true)}
                  title="Collapse Panel"
                  className="hidden lg:flex w-8 h-8 ml-1 rounded-lg hover:bg-[var(--color-cream-warm)] text-[var(--color-ink)] items-center justify-center transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Constraint Panel */}
            <ConstraintPanel
              constraints={constraints}
              onAdd={(cat, text) => setConstraints(prev => [...prev, { id: Date.now().toString(), category: cat, text }])}
              onRemove={(id) => setConstraints(prev => prev.filter(c => c.id !== id))}
            />

            {/* Framework Selector Dropdown */}
            {/* Active Exercise Panel */}
            <AnimatePresence>
              {sprint.activeExerciseData && (
                <ExercisePanel
                  exercise={sprint.activeExerciseData}
                  onClose={() => sprint.setActiveExercise(null)}
                  onComplete={handleCompleteExercise}
                  onUncomplete={sprint.uncompleteExercise}
                  onUsePrompt={handleExercisePrompt}
                />
              )}
            </AnimatePresence>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50/50 dark:bg-neutral-950/50 transition-colors">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} items-start`}>
                  <div className={`w-8 h-8 mt-1.5 rounded-lg flex items-center justify-center shrink-0 border border-[var(--color-border)] shadow-sm  transition-all ${msg.role === 'user' ? 'bg-[var(--color-cream)]' : 'bg-blue-600 text-white dark:bg-blue-500'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-[var(--color-ink)]" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-xl border border-[var(--color-border)] shadow-sm  transition-all ${msg.role === 'user' ? 'bg-[var(--color-ink)] text-[var(--color-cream)]' : 'bg-[var(--color-cream)]'}`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap text-sm font-medium">{msg.text}</p>
                    ) : (
                      <div className="markdown-body prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-neutral-800 prose-pre:text-neutral-100 dark:prose-invert">
                        <div className="flex flex-col gap-2">
                          <Markdown components={MarkdownComponents}>{msg.text}</Markdown>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 mt-1.5 border border-[var(--color-border)] bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm  transition-all">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-[var(--color-cream)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-2 shadow-sm  transition-all">
                    <div className="w-2 h-2 bg-[var(--color-ink)] animate-bounce" />
                    <div className="w-2 h-2 bg-[var(--color-ink)] animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-[var(--color-ink)] animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-cream)] transition-colors space-y-3">
              {/* Action Context Buttons */}
              <div className="flex flex-wrap gap-2">
                {sprint.activeExercise === 'reverse-brainstorm' && (
                  <button
                    onClick={handleFlipFailures}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest border border-[var(--color-border)] shadow-sm  hover:-translate-y-0.5 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" /> Flip All Failures
                  </button>
                )}
              </div>
              <PromptInputBox
                onSend={(message) => handleSend(message)}
                isLoading={isLoading}
                placeholder={sprint.activeExercise ? `Discuss ${sprint.activeExerciseData?.name || 'exercise'}...` : "Discuss a problem..."}
                onThinkClick={() => setShowThinkingModes(!showThinkingModes)}
                isThinkActive={showThinkingModes || (sprint.activeThinkingMode !== null)}
                thinkIcon={(() => {
                  const modes = [
                    { id: 'think-gut', icon: Heart },
                    { id: 'think-optimist', icon: Sun },
                    { id: 'think-critic', icon: ShieldAlert },
                    { id: 'think-creative', icon: Lightbulb },
                    { id: 'think-data', icon: Database },
                    { id: 'think-process', icon: Settings }
                  ];
                  const active = modes.find(m => m.id === sprint.activeThinkingMode);
                  return active ? <active.icon className="w-4 h-4" /> : null;
                })()}
                thinkColor={(() => {
                  const modes = [
                    { id: 'think-gut', color: 'bg-red-500 text-white' },
                    { id: 'think-optimist', color: 'bg-yellow-500 text-white' },
                    { id: 'think-critic', color: 'bg-neutral-900 text-white' },
                    { id: 'think-creative', color: 'bg-green-500 text-white' },
                    { id: 'think-data', color: 'bg-neutral-200 text-black' },
                    { id: 'think-process', color: 'bg-blue-500 text-white' }
                  ];
                  const active = modes.find(m => m.id === sprint.activeThinkingMode);
                  return active ? `${active.color} border-black shadow-sm` : undefined;
                })()}
                thinkMenu={
                  <AnimatePresence>
                    {showThinkingModes && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        onMouseLeave={() => setHoveredDescription(null)}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 bg-[var(--color-cream)] border border-[var(--color-border)] shadow-sm  p-3 grid grid-cols-3 gap-2 z-[60]"
                      >
                        {/* Arrow down to button */}
                        <div className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-4 h-4 bg-[var(--color-cream)] border-r-4 border-b-4 border-black dark:border-white rotate-45" />

                        {[
                          { id: 'think-gut', label: 'Gut', color: 'bg-red-500', icon: Heart, description: 'Focus on emotions, intuition, and visceral reactions.' },
                          { id: 'think-optimist', label: 'Optimist', color: 'bg-yellow-500', icon: Sun, description: 'Focus on best-case scenarios, value, and benefits.' },
                          { id: 'think-critic', label: 'Critic', color: 'bg-neutral-900', icon: ShieldAlert, description: 'Focus on risks, potential flaws, and critical judgment.', textColor: 'text-white' },
                          { id: 'think-creative', label: 'Wild', color: 'bg-green-500', icon: Lightbulb, description: 'Focus on wild ideas, alternatives, and new possibilities.' },
                          { id: 'think-data', label: 'Data', color: 'bg-neutral-200 text-black', icon: Database, description: 'Focus on facts, figures, and identifying information gaps.', textColor: 'text-black' },
                          { id: 'think-process', label: 'Process', color: 'bg-blue-500', icon: Settings, description: 'Focus on control, structure, and organizing the thinking flow.' },
                          { id: 'standard', label: 'Reset', color: 'bg-neutral-100 text-black', icon: RefreshCw, description: 'Return to standard AI discovery mode.', textColor: 'text-black' }
                        ].map(mode => (
                          <button
                            key={mode.id}
                            onMouseEnter={() => setHoveredDescription(mode.description)}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (mode.id === 'standard') {
                                sprint.setActiveThinkingMode(null);
                              } else {
                                sprint.setActiveThinkingMode(mode.id);
                              }
                              setShowThinkingModes(false);
                            }}
                            className={`group flex flex-col items-center gap-1.5 p-2 transition-all border border-transparent hover:border-black dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-neutral-800
                          ${sprint.activeThinkingMode === mode.id ? 'bg-[var(--color-cream-deep)] border-black dark:border-white' : ''}`}
                          >
                            <div className={`w-12 h-12 rounded-full border border-[var(--color-border)] transition-transform group-hover:scale-110 shadow-sm  flex items-center justify-center ${mode.color}`}>
                              <mode.icon className={`w-6 h-6 ${mode.textColor || (mode.id === 'think-critic' ? 'text-white' : 'text-inherit')}`} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-tighter text-[var(--color-ink)] leading-none truncate w-full text-center mt-1">{mode.label}</span>
                          </button>
                        ))}

                        <div className="col-span-3 mt-3 pt-3 border-t-2 border-black/10 dark:border-white/10 min-h-[40px] flex items-center justify-center">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-center text-neutral-500 dark:text-neutral-400 px-2 italic">
                            {hoveredDescription || "Hover over a mode for its focus..."}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                }
                onExplorationClick={() => setShowFrameworkSelector(!showFrameworkSelector)}
                isExplorationActive={showFrameworkSelector || (sprint.activeExercise !== null && sprint.activeExercise !== 'scratch')}
                explorationIcon={(() => {
                  if (!sprint.activeExercise || sprint.activeExercise === 'scratch') return null;
                  const icons: Record<string, any> = {
                    'scratch': Layers,
                    'beginner-guide': Lightbulb,
                    'amazon-prfaq': Target,
                    'google-sprint': Workflow,
                    'toyota-5whys': RefreshCw,
                    'ideo-design': User,
                    'lean-startup': Radio,
                    'jtbd': Target,
                    'user-journey': Footprints,
                    'product-journey': Workflow,
                    'hmw': MessageCircle,
                    'empathy-map': LayoutGrid,
                    'lightning-demos': Zap,
                    'reverse-brainstorm': Swords,
                    'canvas-focus': FolderCode,
                  };
                  const IconComp = icons[sprint.activeExercise] || Layers;
                  return <IconComp className="w-4 h-4" />;
                })()}
                explorationMenu={
                  <FrameworkSelector
                    mode="menu-only"
                    isOpen={showFrameworkSelector}
                    onOpenChange={setShowFrameworkSelector}
                    currentFrameworkId={sprint.activeExercise || 'scratch'}
                    onSelect={(id) => {
                      sprint.setActiveExercise(id);
                      setShowFrameworkSelector(false);
                    }}
                    customExercises={sprint.exercises.filter(ex => ex.isCustom && !ex.id.startsWith('think-'))}
                    onAddCustom={sprint.addCustomExercise}
                  />
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Board Panel Container */}
      <div className="flex flex-1 relative overflow-hidden z-10">

        <div className="absolute top-6 left-6 z-10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur border border-neutral-300 dark:border-neutral-700 shadow-xl flex items-center transition-all overflow-visible rounded-lg p-1 gap-1">
          {projectBoards.filter(b => b.id !== 'ai-memory').map(board => (
            <div key={board.id} className="relative group/tab">
              <button
                onClick={() => handleSwitchBoard(board.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all
                  ${activeBoardId === board.id
                    ? 'bg-blue-600 text-white shadow-md dark:bg-blue-500'
                    : 'text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800'
                  }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="max-w-[100px] truncate">{board.name}</span>
              </button>
              {projectBoards.filter(b => b.id !== 'ai-memory').length > 1 && (
                <button
                  onClick={(e) => handleDeleteBoard(board.id, e)}
                  className={`absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/tab:opacity-100 transition-opacity hover:scale-110 shadow-lg ${activeBoardId === board.id ? 'z-20' : 'hidden md:flex'}`}
                  title="Delete Board"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          ))}
          <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700 mx-1" />
          <button
            onClick={handleAddBoard}
            className="p-1.5 text-neutral-600 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-all flex items-center gap-1"
            title="New Canvas"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* The React Flow UI requires a stable mounting container, which is fine since we pass restoreState down dynamically! */}
        <Board
          key="master-board"
          newItems={boardItems}
          restoreState={restoreState}
          updatedNodes={updatedNodes}
          clearUpdatedNodes={clearUpdatedNodes}
          updatedEdge={updatedEdge}
          clearUpdatedEdge={clearUpdatedEdge}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onEdgeConnect={handleEdgeConnect}
          isDarkMode={isDarkMode}
          onSnapshot={(nodes, edges) => {
            setBoardNodesSnapshot(nodes);
            setBoardEdgesSnapshot(edges);
          }}
          onShowSummary={() => setShowSummary(true)}
          isNeuralView={isNeuralViewOpen}
          universalApiKey={universalApiKey}
        />

        {/* Node Focus Panel */}
        <AnimatePresence mode="popLayout">
          {selectedNode && (
            /* Mobile Backdrop */
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNode(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-20 md:hidden"
            />
          )}
          {selectedNode && (
            /* Sidebar Content */
            <motion.div
              key="sidebar-panel"
              initial={{ x: '100%', opacity: 0 }}
              animate={{
                x: 0,
                opacity: 1,
                width: isRightCollapsed
                  ? (windowWidth < 768 ? '0px' : '64px')
                  : (windowWidth < 768 ? '100%' : '400px')
              }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed md:relative inset-y-0 right-0 h-full bg-[var(--color-cream)] border-l border-[var(--color-border)] shadow-2xl md:shadow-xl z-[60] flex flex-col overflow-hidden shrink-0 ${isRightCollapsed ? 'w-0 md:w-16' : 'w-full sm:w-[400px] md:w-[400px]'}`}
            >
              {isRightCollapsed ? (
                <>
                  {/* Desktop Collapsed View */}
                  <div className="hidden md:flex w-[64px] h-full flex-col items-center py-4 gap-6">
                    <button onClick={() => setIsRightCollapsed(false)} className="w-10 h-10 border border-transparent hover:border-black dark:hover:border-white hover:shadow-sm  flex items-center justify-center transition-all">
                      <ChevronLeft className="w-5 h-5 dark:text-white" />
                    </button>
                    <div className="w-10 h-10 rounded-xl border border-[var(--color-border)] bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm  transition-all shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center opacity-30 select-none pointer-events-none">
                      <span className="[writing-mode:vertical-rl] rotate-180 font-black tracking-[0.2em] uppercase text-lg dark:text-white">
                        Refining Card
                      </span>
                    </div>
                  </div>

                  {/* Mobile Floating Toggle (Visible when collapsed on mobile) */}
                  <div className="md:hidden fixed bottom-6 right-6 z-[70]">
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      onClick={() => setIsRightCollapsed(false)}
                      className="w-14 h-14 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full shadow-[var(--shadow-elevated)] flex items-center justify-center border-2 border-[var(--color-border)] active:scale-95 transition-transform"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </motion.button>
                  </div>
                </>
              ) : (
                <div className="w-full sm:w-[400px] flex flex-col h-full shrink-0">
                  <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-cream)] transition-colors shrink-0">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setIsRightCollapsed(true)} className="w-8 h-8 mr-1 border border-transparent hover:border-black dark:hover:border-white bg-transparent flex items-center justify-center hover:shadow-sm  transition-all">
                        <ChevronRight className="w-4 h-4 dark:text-white" />
                      </button>
                      <div className="w-8 h-8 border border-[var(--color-border)] bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm  transition-all">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="font-bold text-sm uppercase dark:text-white">Refining Card</h2>
                        <select
                          value={selectedNode.type}
                          onChange={(e) => {
                            const newType = e.target.value;
                            setSelectedNode({ ...selectedNode, type: newType });
                            setUpdatedNodes([{ id: selectedNode.id, type: newType, data: {} }]);
                          }}
                          className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest bg-transparent border-none p-0 cursor-pointer focus:ring-0 outline-none"
                        >
                          {nodeTypeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {selectedNode.type === 'audience' && (
                        <div className="mt-4 px-1">
                          <button
                            onClick={() => {
                              setSimulationSetupPersona({
                                id: selectedNode.id,
                                label: selectedNode.data.label,
                                details: selectedNode.data.details,
                                personaProfile: selectedNode.data.personaProfile,
                                personaBehavior: selectedNode.data.personaBehavior
                              });
                            }}
                            className="w-full rounded-xl flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all group"
                          >
                            <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            {savedInterviews.some(iv => iv.personaId === selectedNode.id) ? 'Continue' : 'Start'}
                          </button>
                        </div>
                      )}
                      <button onClick={() => {
                        setDeletedNodeId(selectedNode.id);
                        setSelectedNode(null);
                      }} className="p-2 border border-transparent hover:border-red-500 hover:text-red-500 dark:hover:border-red-400 dark:hover:text-red-400 hover:shadow-md  transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setSelectedNode(null)} className="p-2 border border-transparent hover:border-black dark:hover:border-white hover:shadow-sm  transition-all">
                        <X className="w-4 h-4 text-[var(--color-ink)]" />
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Body */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--color-cream)] transition-colors">
                    {/* Current Card Preview */}
                    <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-cream-warm)] transition-colors">
                      <div className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] shadow-sm transition-all flex flex-col gap-2">
                        <input
                          value={localLabel}
                          onChange={(e) => {
                            setLocalLabel(e.target.value);
                            setIsNodeEditDirty(true);
                          }}
                          className="font-bold text-sm bg-transparent border-b border-transparent hover:border-neutral-200 focus:border-blue-500 focus:outline-none dark:text-white transition-colors w-full"
                          placeholder="Node Label"
                        />
                        <textarea
                          value={localDetails}
                          onChange={(e) => {
                            setLocalDetails(e.target.value);
                            setIsNodeEditDirty(true);
                          }}
                          className="text-xs text-neutral-600 dark:text-neutral-400 bg-transparent border border-transparent hover:border-neutral-200 focus:border-blue-500 focus:outline-none resize-none min-h-[60px] transition-colors w-full p-1"
                          placeholder="Node Details"
                        />
                      </div>

                      {/* Manual Update Button */}
                      <AnimatePresence>
                        {isNodeEditDirty && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-3 overflow-hidden"
                          >
                            <button
                              onClick={handleSaveNodeUpdate}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg  hover:-translate-y-0.5 transition-all"
                            >
                              Update Card Content
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="mt-6 space-y-3">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">Appearance & Mood</label>
                        <div className="flex flex-wrap gap-2.5">
                          {[null, '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'].map((color, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, customColor: color } });
                                setUpdatedNodes([{ id: selectedNode.id, data: { customColor: color } }]);
                              }}
                              className={`w-8 h-8 rounded-full border border-[var(--color-border)] shadow-sm  hover:-translate-y-1 transition-transform ${color === null ? 'bg-gradient-to-br from-white to-black dark:from-black dark:to-white' : ''}`}
                              style={color ? { backgroundColor: color } : {}}
                              title={color ? color : 'Default Theme Color'}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Audience — Research Summary & Synthesize */}
                      {selectedNode.type === 'audience' && (() => {
                        const nodeInterviews = savedInterviews.filter(iv => iv.personaId === selectedNode.id);
                        return (
                          <div className="mt-8 pt-8 border-t border-[var(--color-border)] space-y-4">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                              <Brain className="w-4 h-4" />
                              <span className="text-[11px] font-semibold uppercase tracking-wider">Research Interviews</span>
                            </div>

                            {nodeInterviews.length === 0 ? (
                              <p className="text-[10px] text-neutral-400 dark:text-neutral-600 leading-relaxed italic">
                                No saved interviews yet. Click "Start Simulation" to begin.
                              </p>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex flex-col gap-1.5">
                                  {nodeInterviews.map((iv, i) => (
                                    <div key={iv.id} className="flex items-center justify-between p-1.5 px-2 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800/50 group transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950">
                                      <div className="flex flex-col flex-1 min-w-0">
                                        <span
                                          onClick={() => {
                                            const next = prompt('Rename this interview:', iv.customLabel || '');
                                            if (next) handleRenameInterview(iv.id, next);
                                          }}
                                          className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 truncate cursor-pointer hover:underline"
                                        >
                                          {iv.customLabel || `Interview ${i + 1}`}
                                        </span>
                                        <span className="text-[8px] uppercase tracking-wider text-neutral-400">
                                          {new Date(iv.savedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => {
                                          setSimulatingPersona({
                                            id: iv.personaId,
                                            label: iv.personaLabel,
                                            details: selectedNode.data.details,
                                            personaProfile: selectedNode.data.personaProfile,
                                            personaBehavior: selectedNode.data.personaBehavior,
                                            // Pass the actual saved state to the simulator
                                            initialMessages: iv.messages,
                                            initialSessionId: iv.id,
                                            initialLabel: iv.customLabel
                                          });
                                        }}
                                        className="opacity-0 group-hover:opacity-100 ml-2 px-2 py-1 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-sm"
                                      >
                                        Open
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  onClick={() => handleSynthesizeInterviews(selectedNode.id, selectedNode.data.label)}
                                  disabled={isSynthesizing}
                                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-700 text-white text-[10px] font-semibold uppercase tracking-wider border border-[var(--color-border)] shadow-sm  hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-wait"
                                >
                                  <FlaskConical className="w-3.5 h-3.5" />
                                  {isSynthesizing ? 'Synthesizing…' : `Synthesize ${nodeInterviews.length} Interview${nodeInterviews.length > 1 ? 's' : ''} → Node`}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Node Chat Messages - Parent handles scroll now */}
                    <div className="p-4 space-y-4 bg-[var(--color-cream)] transition-colors">
                      {(nodeMessages[selectedNode.id] || []).map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-[var(--color-border)] shadow-sm  transition-all ${msg.role === 'user' ? 'bg-[var(--color-cream)]' : 'bg-blue-600 text-white dark:bg-blue-500'}`}>
                            {msg.role === 'user' ? <User className="w-3 h-3 text-[var(--color-ink)]" /> : <Bot className="w-3 h-3" />}
                          </div>
                          <div className={`max-w-[85%] p-3 rounded-lg border border-[var(--color-border)] shadow-sm  transition-all ${msg.role === 'user' ? 'bg-[var(--color-ink)] text-[var(--color-cream)]' : 'bg-[var(--color-cream)]'}`}>
                            {msg.role === 'user' ? (
                              <p className="whitespace-pre-wrap text-xs font-medium">{msg.text}</p>
                            ) : (
                              <div className="markdown-body prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-neutral-800 prose-pre:text-neutral-100 text-xs dark:prose-invert">
                                <div className="flex flex-col gap-2">
                                  <Markdown components={MarkdownComponents}>{msg.text}</Markdown>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isNodeLoading && (
                        <div className="flex gap-3">
                          <div className="w-6 h-6 border border-[var(--color-border)] bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm  transition-all">
                            <Bot className="w-3 h-3" />
                          </div>
                          <div className="bg-[var(--color-cream)] border border-[var(--color-border)] p-3 flex items-center gap-1.5 shadow-sm  transition-all">
                            <div className="w-1.5 h-1.5 bg-[var(--color-ink)] animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-[var(--color-ink)] animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <div className="w-1.5 h-1.5 bg-[var(--color-ink)] animate-bounce" style={{ animationDelay: '0.4s' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Node Chat Input - Sticky Footer */}
                  <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-cream)] transition-colors shrink-0 h-auto">
                    <PromptInputBox
                      onSend={(message) => handleNodeSend(message)}
                      isLoading={isNodeLoading}
                      placeholder="Suggest changes..."
                      className="h-auto"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edge Focus Panel */}
        <AnimatePresence>
          {selectedEdge && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isRightCollapsed ? 64 : 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="h-full bg-[var(--color-cream)] border-l border-[var(--color-border)] shadow-xl z-30 flex flex-col overflow-hidden shrink-0"
            >
              {isRightCollapsed ? (
                <div className="w-[64px] h-full flex flex-col items-center py-4 gap-6">
                  <button onClick={() => setIsRightCollapsed(false)} className="w-10 h-10 border border-transparent hover:border-black dark:hover:border-white hover:shadow-sm  flex items-center justify-center transition-all">
                    <ChevronLeft className="w-5 h-5 dark:text-white" />
                  </button>
                  <div className="w-10 h-10 rounded-xl border border-[var(--color-border)] bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-sm  transition-all shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center opacity-30 select-none pointer-events-none">
                    <span className="[writing-mode:vertical-rl] rotate-180 font-black tracking-[0.2em] uppercase text-lg dark:text-white">
                      Connection
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-[300px] flex flex-col h-full shrink-0">
                  <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-cream)] transition-colors shrink-0">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setIsRightCollapsed(true)} className="w-8 h-8 mr-1 border border-transparent hover:border-black dark:hover:border-white bg-transparent flex items-center justify-center hover:shadow-sm  transition-all">
                        <ChevronRight className="w-4 h-4 dark:text-white" />
                      </button>
                      <div className="w-8 h-8 border border-[var(--color-border)] bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-sm  transition-all shrink-0">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="font-bold text-sm uppercase dark:text-white">Edit Connection</h2>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => {
                        setDeletedEdgeId(selectedEdge.id);
                        setSelectedEdge(null);
                      }} className="p-2 border border-transparent hover:border-red-500 hover:text-red-500 dark:hover:border-red-400 dark:hover:text-red-400 hover:shadow-md  transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setSelectedEdge(null)} className="p-2 border border-transparent hover:border-black dark:hover:border-white hover:shadow-sm  transition-all">
                        <X className="w-4 h-4 text-[var(--color-ink)]" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Label</label>
                      <input
                        type="text"
                        value={selectedEdge.label || ''}
                        onChange={(e) => {
                          const newLabel = e.target.value;
                          setSelectedEdge({ ...selectedEdge, label: newLabel });
                          setUpdatedEdge({ id: selectedEdge.id, data: { label: newLabel } });
                        }}
                        className="w-full rounded-xl p-2 border border-[var(--color-border)] bg-transparent dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
                        placeholder="Connection label..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Line Type</label>
                      <select
                        value={selectedEdge.type || 'default'}
                        onChange={(e) => {
                          const newType = e.target.value;
                          setSelectedEdge({ ...selectedEdge, type: newType });
                          setUpdatedEdge({ id: selectedEdge.id, data: { type: newType } });
                        }}
                        className="w-full rounded-xl p-2 border border-[var(--color-border)] bg-transparent dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
                      >
                        <option value="default">Bezier (Curved)</option>
                        <option value="straight">Straight</option>
                        <option value="step">Step</option>
                        <option value="smoothstep">Smooth Step</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Style</label>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedEdge.animated || false}
                            onChange={(e) => {
                              const isAnimated = e.target.checked;
                              setSelectedEdge({ ...selectedEdge, animated: isAnimated });
                              setUpdatedEdge({ id: selectedEdge.id, data: { animated: isAnimated } });
                            }}
                            className="w-5 h-5 border border-[var(--color-border)] bg-transparent checked:bg-blue-600 checked:border-blue-600 focus:ring-0 focus:ring-offset-0 transition-colors cursor-pointer"
                          />
                          <span className="text-sm font-medium dark:text-white">Animated Flow</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedEdge.data?.dashed || false}
                            onChange={(e) => {
                              const isDashed = e.target.checked;
                              setSelectedEdge({ ...selectedEdge, data: { ...selectedEdge.data, dashed: isDashed } });
                              setUpdatedEdge({ id: selectedEdge.id, data: { dashed: isDashed } });
                            }}
                            className="w-5 h-5 border border-[var(--color-border)] bg-transparent checked:bg-blue-600 checked:border-blue-600 focus:ring-0 focus:ring-offset-0 transition-colors cursor-pointer"
                          />
                          <span className="text-sm font-medium dark:text-white">Dashed Line</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Thickness</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={selectedEdge.data?.thickness || 3}
                        onChange={(e) => {
                          const newThickness = parseInt(e.target.value);
                          setSelectedEdge({ ...selectedEdge, data: { ...selectedEdge.data, thickness: newThickness } });
                          setUpdatedEdge({ id: selectedEdge.id, data: { thickness: newThickness } });
                        }}
                        className="w-full cursor-pointer accent-blue-600 dark:accent-blue-400"
                      />
                      <div className="flex justify-between text-xs text-neutral-500">
                        <span>Thin</span>
                        <span>Thick</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Color</label>
                      <div className="flex flex-wrap gap-2">
                        {[null, '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'].map((color, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setSelectedEdge({ ...selectedEdge, data: { ...selectedEdge.data, customColor: color } });
                              setUpdatedEdge({ id: selectedEdge.id, data: { color: color } });
                            }}
                            className={`w-8 h-8 rounded-full border border-[var(--color-border)] shadow-sm  hover:-translate-y-0.5 transition-transform ${color === null ? 'bg-gradient-to-br from-white to-black dark:from-black dark:to-white' : ''}`}
                            style={color ? { backgroundColor: color } : {}}
                            title={color ? color : 'Default Theme Color'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Signal Scanner Overlay */}
      <SignalScanner
        isOpen={showSignalScanner}
        onClose={() => setShowSignalScanner(false)}
        onScan={async (q) => await scanSignal(q, (data) => setBoardItems(data), userApiKey, aiModel, anthropicApiKey, undefined, aiModel === 'universal' ? customBaseUrl : undefined, aiModel === 'universal' ? customModelName : undefined, universalApiKey, boardNodesSnapshot)}
      />

      {/* IntelligenceHubModal replaces legacy Settings and QuickSetup paths */}

      {/* Summary Editor Modal */}
      {showSummaryEditModal && (
        <SummaryEditModal
          draftSummary={pendingSummary}
          isDrafting={isSummarizing}
          onSave={handleSaveSummary}
          onClose={() => {
            setShowSummaryEditModal(false);
            setPendingSummary('');
          }}
        />
      )}

      {/* Persona Setup Modal — step 1 of simulation flow */}
      {simulationSetupPersona && (
        <PersonaSetupModal
          personaId={simulationSetupPersona.id}
          personaLabel={simulationSetupPersona.label}
          personaDetails={simulationSetupPersona.details}
          initialProfile={simulationSetupPersona.personaProfile || ''}
          initialBehavior={simulationSetupPersona.personaBehavior || ''}
          onClose={() => setSimulationSetupPersona(null)}
          onBeginInterview={(profile, behavior) => {
            // Save persona intelligence back to node
            setUpdatedNodes([{
              id: simulationSetupPersona.id,
              data: { personaProfile: profile, personaBehavior: behavior }
            }]);
            setSelectedNode((prev: any) => prev ? { ...prev, data: { ...prev.data, personaProfile: profile, personaBehavior: behavior } } : prev);
            // Open chat
            setSimulatingPersona({ ...simulationSetupPersona, personaProfile: profile, personaBehavior: behavior });
            setSimulationSetupPersona(null);
          }}
        />
      )}

      {simulatingPersona && (
        <AudienceSimulator
          persona={simulatingPersona}
          initialMessages={simulatingPersona.initialMessages}
          initialSessionId={simulatingPersona.initialSessionId}
          initialLabel={simulatingPersona.initialLabel}
          boardContext={(() => {
            const problemNodes = boardNodesSnapshot.filter(n => ['problem', 'hmw', 'insight'].includes(n.type));
            if (problemNodes.length === 0) return 'General creative exploration.';
            return problemNodes.map(n => `[${n.type.toUpperCase()}] ${n.data.label}: ${n.data.details}`).join('\n');
          })()}
          onClose={() => setSimulatingPersona(null)}
          onPinInsight={handlePersonaPin}
          onBoardUpdate={(data) => setBoardItems(data)}
          onSaveInterview={handleSaveInterview}
          onResetPersona={() => {
            setSimulationSetupPersona({
              id: simulatingPersona.id,
              label: simulatingPersona.label,
              details: simulatingPersona.details,
              personaProfile: simulatingPersona.personaProfile,
              personaBehavior: simulatingPersona.personaBehavior
            });
            setSimulatingPersona(null);
          }}
          savedInterviewCount={savedInterviews.filter(iv => iv.personaId === simulatingPersona.id).length}
          apiKey={userApiKey}
          aiModel={aiModel}
          anthropicApiKey={anthropicApiKey}
          customBaseUrl={aiModel === 'universal' ? customBaseUrl : undefined}
          customModelName={aiModel === 'universal' ? customModelName : undefined}
          universalApiKey={universalApiKey}
          boardNodes={boardNodesSnapshot}
        />
      )}

      {/* Process Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <SprintSummary
            onClose={() => setShowSummary(false)}
            boardNodes={boardNodesSnapshot}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {(boardToDelete || deleteError) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setBoardToDelete(null);
                setDeleteError(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[var(--color-cream)] border border-[var(--color-border)] shadow-[var(--shadow-elevated)] rounded-[2.5rem] p-8 z-10 overflow-hidden"
            >
              <div className="flex items-center gap-5 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${deleteError ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                  {deleteError ? <ShieldAlert className="w-7 h-7" /> : <Trash2 className="w-7 h-7" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-[var(--color-ink)]">
                    {deleteError ? "Action Restricted" : "Delete Canvas?"}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mt-1">Permanent Action</p>
                </div>
              </div>

              <p className="text-sm font-medium text-[var(--color-ink-muted)] mb-10 leading-relaxed">
                {deleteError || "Are you sure you want to permanently delete this canvas? This will remove all nodes, edges, and session history. This cannot be undone."}
              </p>

              <div className="flex gap-4">
                {deleteError ? (
                  <button
                    onClick={() => setDeleteError(null)}
                    className="flex-1 py-4 bg-[var(--color-ink)] text-[var(--color-cream)] font-bold uppercase tracking-widest rounded-2xl border border-transparent shadow-lg hover:-translate-y-1 hover:bg-[var(--color-sage)] transition-all text-[10px]"
                  >
                    Understood
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setBoardToDelete(null)}
                      className="flex-1 py-4 bg-[var(--color-cream-warm)] text-[var(--color-ink)] font-bold uppercase tracking-widest rounded-2xl border border-[var(--color-border)] shadow-sm hover:bg-[var(--color-cream-deep)] hover:-translate-y-1 transition-all text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDeleteBoard}
                      className="flex-1 py-4 bg-red-600 text-white font-bold uppercase tracking-widest rounded-2xl shadow-lg hover:bg-red-700 hover:-translate-y-1 transition-all text-[10px]"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
