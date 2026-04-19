import { useState, useEffect } from 'react';
import { X, CheckCircle2, Play, RotateCcw, Timer, ChevronRight, Zap, HelpCircle, Flower2, Swords, LayoutGrid, Footprints, Compass, BarChart3, MessageCircle, Crosshair, Target, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Exercise } from '../hooks/useSprintState';

const exerciseIcons: Record<string, any> = {
  'Zap': Zap, 'HelpCircle': HelpCircle, 'Flower2': Flower2, 'Swords': Swords, 'LayoutGrid': LayoutGrid,
  'Footprints': Footprints, 'Compass': Compass, 'BarChart3': BarChart3, 'MessageCircle': MessageCircle,
  'Crosshair': Crosshair, 'Target': Target, 'PenTool': PenTool,
};

const colorVariants: Record<string, { bg: string; text: string; border: string; darkBg: string; darkText: string }> = {
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', darkBg: 'dark:bg-amber-950/30', darkText: 'dark:text-amber-400' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-300', darkBg: 'dark:bg-cyan-950/30', darkText: 'dark:text-cyan-400' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-300', darkBg: 'dark:bg-pink-950/30', darkText: 'dark:text-pink-400' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-300', darkBg: 'dark:bg-slate-950/30', darkText: 'dark:text-slate-400' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-300', darkBg: 'dark:bg-violet-950/30', darkText: 'dark:text-violet-400' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300', darkBg: 'dark:bg-indigo-950/30', darkText: 'dark:text-indigo-400' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-300', darkBg: 'dark:bg-teal-950/30', darkText: 'dark:text-teal-400' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', darkBg: 'dark:bg-orange-950/30', darkText: 'dark:text-orange-400' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-300', darkBg: 'dark:bg-sky-950/30', darkText: 'dark:text-sky-400' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', darkBg: 'dark:bg-red-950/30', darkText: 'dark:text-red-400' },
};

interface ExercisePanelProps {
  exercise: Exercise;
  onClose: () => void;
  onComplete: (exerciseId: string) => void;
  onUncomplete: (exerciseId: string) => void;
  onUsePrompt: (prompt: string) => void;
}

export default function ExercisePanel({ exercise, onClose, onComplete, onUncomplete, onUsePrompt }: ExercisePanelProps) {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const Icon = exerciseIcons[exercise.icon] || Zap;
  const colors = colorVariants[exercise.colorClass] || colorVariants.amber;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden border-b border-[var(--color-border)]"
    >
      {/* Exercise Header */}
      <div className={`px-4 py-3 ${colors.bg} ${colors.darkBg} flex items-center justify-between transition-colors`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-sm ${colors.bg} ${colors.darkBg}`}>
            <Icon className={`w-3.5 h-3.5 ${colors.text} ${colors.darkText}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">
              {exercise.name}
            </h3>
            <p className="text-[10px] text-[var(--color-ink-muted)]">
              Phase {exercise.phase} Exercise
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-1 border border-[var(--color-border)] bg-[var(--color-cream)] text-xs font-medium font-mono rounded-lg shadow-sm">
            <Timer className="w-3 h-3 text-[var(--color-ink-muted)]" />
            <span className="text-[var(--color-ink)]">{formatTime(timerSeconds)}</span>
          </div>
          {!timerRunning ? (
            <button
              onClick={() => setTimerRunning(true)}
              className="w-7 h-7 border border-[var(--color-border)] bg-[var(--color-cream)] flex items-center justify-center rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <Play className="w-3 h-3 text-[var(--color-ink)]" />
            </button>
          ) : (
            <button
              onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}
              className="w-7 h-7 border border-[var(--color-border)] bg-[var(--color-cream)] flex items-center justify-center rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <RotateCcw className="w-3 h-3 text-[var(--color-ink)]" />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--color-cream-warm)] transition-all"
          >
            <X className="w-3.5 h-3.5 text-[var(--color-ink-muted)]" />
          </button>
        </div>
      </div>

      {/* Exercise Description */}
      <div className="px-4 py-3 bg-[var(--color-cream)] transition-colors">
        <p className="text-xs text-[var(--color-ink-light)] leading-relaxed">
          {exercise.description}
        </p>
      </div>

      {/* Guided Prompts */}
      <div className="px-4 py-2 bg-[var(--color-cream-warm)] transition-colors">
        <div className="text-[10px] font-medium text-[var(--color-ink-muted)] mb-2">
          Guided Prompts
        </div>
        <div className="space-y-1.5">
          {exercise.guidedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentPromptIndex(i);
                onUsePrompt(prompt);
              }}
              className={`w-full text-left flex items-center gap-2 px-2.5 py-2 group transition-all text-xs rounded-lg ${i === currentPromptIndex
                ? `bg-[var(--color-cream)] border border-[var(--color-border)] shadow-sm`
                : 'border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-cream)]'
                }`}
            >
              <span className={`shrink-0 w-5 h-5 flex items-center justify-center text-[10px] font-semibold rounded-md ${i === currentPromptIndex
                ? `${colors.bg} ${colors.darkBg} ${colors.text}`
                : 'text-[var(--color-ink-muted)] bg-[var(--color-cream-deep)]'
                }`}>
                {i + 1}
              </span>
              <span className="text-[var(--color-ink-light)] group-hover:text-[var(--color-ink)] transition-colors flex-1">
                {prompt}
              </span>
              <ChevronRight className="w-3 h-3 text-[var(--color-border)] group-hover:text-[var(--color-ink)] transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Complete Button */}
      <div className="px-4 py-3 bg-[var(--color-cream)] border-t border-[var(--color-border)] transition-colors">
        <button
          onClick={() => exercise.completed ? onUncomplete(exercise.id) : onComplete(exercise.id)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl border transition-all ${exercise.completed
            ? 'border-emerald-400 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 shadow-sm'
            : 'border-[var(--color-ink)] text-[var(--color-cream)] bg-[var(--color-ink)] hover:opacity-90 shadow-sm hover:shadow-md'
            }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {exercise.completed ? 'Completed ✓' : 'Mark as Complete'}
        </button>
      </div>
    </motion.div>
  );
}
