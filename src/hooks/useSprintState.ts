import { useState, useEffect, useCallback } from 'react';

export type SprintPhase = 1 | 2;

export interface Exercise {
  id: string;
  name: string;
  description: string;
  phase: SprintPhase;
  icon: string; // lucide icon name
  colorClass: string;
  guidedPrompts: string[];
  completed: boolean;
  isCustom?: boolean;
  systemPrompt?: string;
}

export const PHASE_1_EXERCISES: Exercise[] = [
  {
    id: 'start-at-end',
    name: 'Start at the End',
    description: 'Set a long-term goal. Why are we doing this project? Where do we want to be in 6 months, a year, or 5 years from now?',
    phase: 1,
    icon: 'Target',
    colorClass: 'emerald',
    guidedPrompts: [
      "Why are we doing this specific project?",
      "Imagine it's a year from now. What does wild success look like?",
      "Let's write down the Long-Term Goal in a single, clear sentence."
    ],
    completed: false
  },
  {
    id: 'sprint-questions',
    name: 'Sprint Questions',
    description: 'Get pessimistic. How could we fail? Turn those fears into questions we must answer this week.',
    phase: 1,
    icon: 'HelpCircle',
    colorClass: 'amber',
    guidedPrompts: [
      "Imagine it's a year from now and our project completely failed. What went wrong?",
      "What are the biggest assumptions we are making?",
      "Let's turn these fears into Sprint Questions (e.g., 'Will users trust our checkout process?')."
    ],
    completed: false
  },
  {
    id: 'make-a-map',
    name: 'Make a Map',
    description: 'Create a simple flowchart showing how the actor discovers, learns, uses, and achieves their goal with your product.',
    phase: 1,
    icon: 'Footprints',
    colorClass: 'indigo',
    guidedPrompts: [
      "Who are the key actors (customers, users, stakeholders) in this story?",
      "What is the ultimate ending (the goal) they want to achieve?",
      "Let's map the steps in between: How do they Discover, Learn, and Use the product to reach that goal?"
    ],
    completed: false
  },
  {
    id: 'ask-experts-hmw',
    name: 'Ask Experts & HMW',
    description: 'Interview experts on the team. While they talk, take How Might We (HMW) notes to capture opportunities.',
    phase: 1,
    icon: 'MessageCircle',
    colorClass: 'cyan',
    guidedPrompts: [
      "Who holds the deep knowledge about this problem space?",
      "As they explain the domain, write down pain points.",
      "Convert those pain points into 'How Might We' format (e.g., 'How might we make the checkout faster?')."
    ],
    completed: false
  },
  {
    id: 'organize-hmw',
    name: 'Organize HMWs',
    description: 'Group the How Might We notes into affinity clusters, name the clusters, and vote on the most important ones.',
    phase: 1,
    icon: 'LayoutGrid',
    colorClass: 'violet',
    guidedPrompts: [
      "Let's look at all the HMW nodes on the board. Do you see any natural clusters?",
      "Let's give a clear, descriptive name to each cluster.",
      "If you had to put a dot-sticker on the most critical HMWs, which ones would you vote for?"
    ],
    completed: false
  },
  {
    id: 'pick-target',
    name: 'Pick a Target',
    description: 'Choose a specific target actor and the single most important step on the map to focus on for the rest of the sprint.',
    phase: 1,
    icon: 'Crosshair',
    colorClass: 'red',
    guidedPrompts: [
      "Look at the Map we created. Which step has the highest risk or greatest opportunity?",
      "Which actor is central to this crucial step?",
      "Let's define the Sprint Target: The specific actor and the specific step on the map."
    ],
    completed: false
  }
];

export const PHASE_2_EXERCISES: Exercise[] = [
  {
    id: 'lightning-demos',
    name: 'Lightning Demos',
    description: 'Review inspiring products, services, or competitors. Capture the best ideas and mechanics visually on the board.',
    phase: 2,
    icon: 'Zap',
    colorClass: 'sky',
    guidedPrompts: [
      "What other products (even in different industries) solve a similar problem beautifully?",
      "Let's list 3-5 inspiring solutions.",
      "What specific mechanic, feature, or vibe makes each one great?"
    ],
    completed: false
  },
  {
    id: 'divide-swarm',
    name: 'Divide or Swarm?',
    description: 'Decide if the team will all sketch the exact same target (swarm), or split up to tackle different parts (divide).',
    phase: 2,
    icon: 'Swords',
    colorClass: 'orange',
    guidedPrompts: [
      "Is our Sprint Target narrow enough for everyone to tackle the same thing (Swarm)?",
      "Or is the flow large enough that we need to assign different sections to different people (Divide)?",
      "Let's finalize the battle plan for sketching."
    ],
    completed: false
  },
  {
    id: 'four-step-sketch',
    name: 'The 4-Step Sketch',
    description: 'Execute the 4-step sketching process culminating in a final 3-panel Solution Sketch storyboard.',
    phase: 2,
    icon: 'PenTool', // Using a generic icon, we will import PenTool
    colorClass: 'pink',
    guidedPrompts: [
      "Step 1: Notes. Take 20 minutes to silently review everything on the board and write down key info.",
      "Step 2: Ideas. Take 20 minutes to jot down rough concepts and doodles.",
      "Step 3: Crazy 8s. Fold a paper into 8 squares. Sketch 8 fast variations of your best idea in 8 minutes.",
      "Step 4: Solution Sketch. Map out a self-explanatory 3-panel storyboard of your final concept."
    ],
    completed: false
  }
];

export interface SprintState {
  currentPhase: SprintPhase;
  activeExercise: string | null;
  activeThinkingMode: string | null;
  exercises: Exercise[];
  sprintGoal: string;
}

const STORAGE_KEY = 'problemspace-sprint-state';

function loadState(): SprintState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load sprint state from localStorage:', e);
  }
  return null;
}

function saveState(state: SprintState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save sprint state:', e);
  }
}

export function useSprintState() {
  const [state, setState] = useState<SprintState>(() => {
    const saved = loadState();
    if (saved) return saved;
    return {
      currentPhase: 1,
      activeExercise: null,
      activeThinkingMode: null,
      exercises: [...PHASE_1_EXERCISES, ...PHASE_2_EXERCISES],
      sprintGoal: ''
    };
  });

  // Persist to localStorage on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const setPhase = useCallback((phase: SprintPhase) => {
    setState(prev => ({ ...prev, currentPhase: phase, activeExercise: null }));
  }, []);

  const setActiveExercise = useCallback((exerciseId: string | null) => {
    setState(prev => ({ ...prev, activeExercise: exerciseId }));
  }, []);

  const setActiveThinkingMode = useCallback((modeId: string | null) => {
    setState(prev => ({ ...prev, activeThinkingMode: modeId }));
  }, []);

  const completeExercise = useCallback((exerciseId: string) => {
    setState(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, completed: true } : ex
      )
    }));
  }, []);

  const uncompleteExercise = useCallback((exerciseId: string) => {
    setState(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, completed: false } : ex
      )
    }));
  }, []);

  const setSprintGoal = useCallback((goal: string) => {
    setState(prev => ({ ...prev, sprintGoal: goal }));
  }, []);

  const addCustomExercise = useCallback((exercise: Omit<Exercise, 'completed' | 'phase'>) => {
    const newExercise: Exercise = {
      ...exercise,
      phase: 1, // Defaulting to phase 1 for custom
      completed: false,
      isCustom: true
    };
    setState(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
      activeExercise: newExercise.id
    }));
  }, []);

  const resetSprint = useCallback(() => {
    setState({
      currentPhase: 1,
      activeExercise: null,
      activeThinkingMode: null,
      exercises: [...PHASE_1_EXERCISES, ...PHASE_2_EXERCISES],
      sprintGoal: ''
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Computed values
  const currentExercises = state.exercises.filter(ex => ex.phase === state.currentPhase && !ex.id.startsWith('think-'));
  const activeExerciseData = state.exercises.find(ex => ex.id === state.activeExercise) || null;
  const phase1Progress = state.exercises.filter(ex => ex.phase === 1 && ex.completed).length / PHASE_1_EXERCISES.length;
  const phase2Progress = state.exercises.filter(ex => ex.phase === 2 && ex.completed).length / PHASE_2_EXERCISES.length;

  return {
    ...state,
    setPhase,
    setActiveExercise,
    completeExercise,
    uncompleteExercise,
    setSprintGoal,
    addCustomExercise,
    resetSprint,
    currentExercises,
    activeExerciseData,
    setActiveThinkingMode,
    phase1Progress,
    phase2Progress
  };
}
