import { useState } from 'react';
import { ChevronDown, CheckCircle2, ChevronRight, Layers, Lightbulb, Workflow, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type FrameworkGroup = 'guides' | 'methods' | 'exercises';

export interface Framework {
  id: string;
  name: string;
  description: string;
  group: FrameworkGroup | 'custom';
}

export const AVAILABLE_FRAMEWORKS: Framework[] = [
  // Guides
  { id: 'scratch', name: 'Start from Scratch', description: 'A flexible blank slate to map your own discovery process with AI assistance.', group: 'guides' },
  { id: 'beginner-guide', name: 'Beginner\'s Problem Mapping', description: 'A step-by-step introduction to defining and mapping a problem space.', group: 'guides' },
  // Methods
  { id: 'amazon-prfaq', name: 'Strategic: Working Backwards', description: 'Start at the end by writing a Press Release and FAQ (PR/FAQ) to crystallize the value proposition.', group: 'methods' },
  { id: 'google-sprint', name: 'Strategic: Visual Mapping', description: 'A structured workflow for rapid problem discovery and sequence mapping.', group: 'methods' },
  { id: 'toyota-5whys', name: 'Strategic: Root Cause (5 Whys)', description: 'A powerful root cause analysis method that uses recursive questioning.', group: 'methods' },
  { id: 'ideo-design', name: 'Observation: Human-Centric', description: 'Focus on empathy, problem definition, and human-centric observational insights.', group: 'methods' },
  { id: 'lean-startup', name: 'Validation: Assumptions', description: 'Focus heavily on assumption tracking, metrics, and rapid hypothesis validation.', group: 'methods' },
  { id: 'jtbd', name: 'Alignment: Intent (JTBD)', description: 'Understand the core "job" a user is trying to accomplish.', group: 'methods' },
  { id: 'user-journey', name: 'Mapping: Journey Flow', description: 'Map the end-to-end experience to identify pain points and delight moments.', group: 'methods' },
  { id: 'product-journey', name: 'Mapping: Product Lifecycle', description: 'Map the journey of a product or feature from ideation to launch and iteration.', group: 'methods' },
  // Exercises
  { id: 'hmw', name: 'How Might We (HMW)', description: 'An exercise specifically to reframe negative pain points into open, positive questions.', group: 'exercises' },
  { id: 'empathy-map', name: 'Empathy Mapping', description: 'Map out exactly what target users Say, Think, Do, and Feel with 100% accuracy.', group: 'exercises' },
  { id: 'lightning-demos', name: 'Lightning Demos', description: 'Rapidly review and capture inspiring mechanics from competitors and other industries.', group: 'exercises' },
  { id: 'reverse-brainstorm', name: 'Reverse Brainstorming', description: 'Brainstorm how to guarantee failure, then flip every idea into a breakthrough opportunity.', group: 'exercises' },
  { id: 'canvas-focus', name: 'Canvas High-Fidelity', description: 'Optimize for generating high-quality nodes and structural relationships directly on the board.', group: 'exercises' }
];

interface FrameworkSelectorProps {
  currentFrameworkId: string;
  onSelect: (id: string) => void;
  customExercises?: any[];
  onAddCustom?: (exercise: any) => void;
  mode?: 'banner' | 'menu-only';
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function FrameworkSelector({
  currentFrameworkId,
  onSelect,
  customExercises = [],
  onAddCustom,
  mode = 'banner',
  isOpen: propsIsOpen,
  onOpenChange
}: FrameworkSelectorProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = propsIsOpen ?? internalIsOpen;
  const setIsOpen = onOpenChange ?? setInternalIsOpen;

  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customForm, setCustomForm] = useState({ name: '', description: '', prompt: '' });

  const allFrameworks = [
    ...AVAILABLE_FRAMEWORKS,
    ...customExercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      description: ex.description,
      group: 'custom' as any
    }))
  ];

  const selectedFramework = allFrameworks.find(f => f.id === currentFrameworkId) || allFrameworks[0];

  const groupedFrameworks = {
    guides: allFrameworks.filter(f => f.group === 'guides'),
    methods: allFrameworks.filter(f => f.group === 'methods'),
    exercises: allFrameworks.filter(f => f.group === 'exercises'),
    custom: allFrameworks.filter(f => f.group === 'custom'),
  };

  const handleCreateCustom = () => {
    if (!customForm.name || !customForm.prompt) return;
    if (onAddCustom) {
      onAddCustom({
        id: `custom-${Date.now()}`,
        name: customForm.name,
        description: customForm.description,
        icon: 'Target',
        colorClass: 'violet',
        guidedPrompts: ['Let us start this custom exercise.'],
        systemPrompt: customForm.prompt
      });
    }
    setIsCreatingCustom(false);
    setIsOpen(false);
    setCustomForm({ name: '', description: '', prompt: '' });
  };

  const renderMenuContent = () => (
    <motion.div
      initial={mode === 'banner' ? { height: 0, opacity: 0 } : { opacity: 0, y: 10, scale: 0.95 }}
      animate={mode === 'banner' ? { height: 'auto', opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={mode === 'banner' ? { height: 0, opacity: 0 } : { opacity: 0, y: 10, scale: 0.95 }}
      className={cn(
        "overflow-hidden border-[var(--color-border)] bg-[var(--color-cream)] z-20 shadow-md max-h-[60vh] overflow-y-auto",
        mode === 'banner' ? "absolute top-full left-0 w-full border-b rounded-b-xl" : "absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-80 border rounded-xl p-1"
      )}
    >
      {mode === 'menu-only' && (
        <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--color-cream)] border-r border-b border-[var(--color-border)] rotate-45" />
      )}

      <GroupSection title="Starter Templates" icon={Lightbulb} items={groupedFrameworks.guides} current={currentFrameworkId} onSelect={(id) => { onSelect(id); setIsOpen(false); }} />
      <div className="border-t border-[var(--color-border)]" />
      <GroupSection title="Strategic Patterns" icon={Workflow} items={groupedFrameworks.methods} current={currentFrameworkId} onSelect={(id) => { onSelect(id); setIsOpen(false); }} />
      <div className="border-t border-[var(--color-border)]" />
      <GroupSection title="Analysis Modules" icon={Layers} items={groupedFrameworks.exercises} current={currentFrameworkId} onSelect={(id) => { onSelect(id); setIsOpen(false); }} />

      {groupedFrameworks.custom.length > 0 && (
        <>
          <div className="border-t border-[var(--color-border)]" />
          <GroupSection title="Custom Templates" icon={Lightbulb} items={groupedFrameworks.custom} current={currentFrameworkId} onSelect={(id) => { onSelect(id); setIsOpen(false); }} />
        </>
      )}

      {isCreatingCustom ? (
        <div className="p-4 bg-[var(--color-cream-warm)] border-t border-[var(--color-border)] space-y-3">
          <input
            type="text"
            placeholder="Template Name"
            value={customForm.name}
            onChange={e => setCustomForm({ ...customForm, name: e.target.value })}
            className="w-full text-xs p-2.5 bg-[var(--color-cream)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <input
            type="text"
            placeholder="Short Description"
            value={customForm.description}
            onChange={e => setCustomForm({ ...customForm, description: e.target.value })}
            className="w-full text-xs p-2.5 bg-[var(--color-cream)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <textarea
            placeholder="AI System Prompt (e.g. 'Guide the user to do X...')"
            value={customForm.prompt}
            onChange={e => setCustomForm({ ...customForm, prompt: e.target.value })}
            className="w-full text-xs p-2.5 bg-[var(--color-cream)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none h-20"
          />
          <div className="flex items-center gap-2 pt-1">
            <button onClick={handleCreateCustom} className="flex-1 bg-[var(--color-ink)] text-[var(--color-cream)] text-xs font-semibold rounded-lg p-2.5 shadow-sm hover:shadow-md transition-all">Create</button>
            <button onClick={() => setIsCreatingCustom(false)} className="px-4 bg-[var(--color-cream)] text-[var(--color-ink)] text-xs font-semibold rounded-lg p-2.5 border border-[var(--color-border)] hover:bg-[var(--color-cream-warm)] transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-[var(--color-border)] bg-[var(--color-cream-warm)]">
          <button
            onClick={(e) => { e.stopPropagation(); setIsCreatingCustom(true); }}
            className="w-full flex items-center justify-center gap-2 p-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Custom Template
          </button>
        </div>
      )}
    </motion.div>
  );

  if (mode === 'menu-only') {
    return <AnimatePresence>{isOpen && renderMenuContent()}</AnimatePresence>;
  }

  return (
    <div className="relative border-b border-[var(--color-border)] bg-[var(--color-cream-warm)] z-30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-cream-deep)] transition-colors"
      >
        <div className="flex flex-col items-start gap-1">
          <span className="text-[10px] font-medium text-[var(--color-ink-muted)]">Active Exploration Mode</span>
          <span className="font-semibold text-sm text-[var(--color-ink)]">{selectedFramework.name}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-[var(--color-ink-muted)]" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && renderMenuContent()}
      </AnimatePresence>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

function GroupSection({ title, icon: Icon, items, current, onSelect }: any) {
  return (
    <div className="py-2">
      <div className="flex items-center gap-2 px-4 py-2 text-[10px] font-semibold text-[var(--color-ink-muted)]">
        <Icon className="w-3.5 h-3.5" />
        {title}
      </div>
      <div className="flex flex-col gap-0.5 px-2">
        {items.map((item: any) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all hover:bg-[var(--color-cream-warm)] border border-transparent ${current === item.id ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900' : ''}`}
          >
            <div className={`mt-0.5 w-4 h-4 shrink-0 flex items-center justify-center ${current === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-[var(--color-ink-muted)]'}`}>
              {current === item.id ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-3 h-3" />}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className={`text-xs font-semibold ${current === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-[var(--color-ink)]'}`}>{item.name}</span>
              <span className="text-[10px] text-[var(--color-ink-light)] line-clamp-2 leading-relaxed">{item.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
