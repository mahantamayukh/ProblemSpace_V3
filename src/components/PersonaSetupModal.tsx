import { useState } from 'react';
import { Brain, UserPlus, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonaSetupModalProps {
  personaId: string;
  personaLabel: string;
  personaDetails: string;
  initialProfile?: string;
  initialBehavior?: string;
  onClose: () => void;
  /** Called with the filled profile/behavior so parent can save to node and open chat */
  onBeginInterview: (profile: string, behavior: string) => void;
}

const PROFILE_SUGGESTIONS = [
  'A 35-year-old professional who values efficiency above all…',
  'A first-time founder with no technical background…',
  'A busy parent juggling work and childcare…',
  'A power-user who relies on keyboard shortcuts…',
  'A senior executive who delegates tech decisions…',
];

const BEHAVIOR_SUGGESTIONS = [
  'Skeptical, short answers, focuses on cost and ROI…',
  'Enthusiastic but easily overwhelmed by jargon…',
  'Pragmatic, asks lots of "but what about X?" questions…',
  'Emotional — driven by fear of missing out…',
  'Analytical, wants data and comparisons before deciding…',
];

export default function PersonaSetupModal({
  personaLabel,
  personaDetails,
  initialProfile = '',
  initialBehavior = '',
  onClose,
  onBeginInterview,
}: PersonaSetupModalProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [behavior, setBehavior] = useState(initialBehavior);

  const canBegin = profile.trim().length > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[var(--color-ink)]/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 24 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="relative z-10 w-full max-w-lg bg-[var(--color-cream)] border border-[var(--color-border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-sage-light)] flex items-center justify-between shrink-0 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                  Persona Intelligence
                </span>
                <span className="block font-semibold text-base text-[var(--color-ink)] leading-tight">
                  {personaLabel}
                </span>
                {personaDetails && (
                  <span className="block text-[10px] text-emerald-800 dark:text-emerald-300 italic mt-0.5 line-clamp-1">
                    {personaDetails}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-cream-warm)] transition-all shrink-0"
            >
              <X className="w-5 h-5 text-[var(--color-ink-muted)]" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col gap-5 overflow-y-auto max-h-[65vh]">
            <p className="text-[11px] font-medium text-[var(--color-ink-light)] leading-relaxed border-l-2 border-emerald-400 pl-3">
              Define who this person is before starting the interview. The richer the profile, the more realistic the simulation.
            </p>

            {/* Identity Profile */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[var(--color-ink-muted)]">
                Identity Profile <span className="text-red-500">*</span>
                <span className="ml-2 font-normal text-[var(--color-ink-muted)]">Who are they?</span>
              </label>
              <AutoResizeTextarea
                value={profile}
                onChange={setProfile}
                placeholder="e.g. A 40-year-old logistics manager who relies on spreadsheets, skeptical of new software tools…"
                minRows={1}
              />
              <div className="flex flex-wrap gap-1.5 mt-1">
                {PROFILE_SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setProfile(s)}
                    className="px-2.5 py-1 text-[10px] font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-cream-warm)] text-[var(--color-ink-muted)] hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                  >
                    {s.substring(0, 30)}…
                  </button>
                ))}
              </div>
            </div>

            {/* Behavior & Tone */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[var(--color-ink-muted)]">
                Behavior & Tone
                <span className="ml-2 font-normal text-[var(--color-ink-muted)]">How do they respond? (optional)</span>
              </label>
              <AutoResizeTextarea
                value={behavior}
                onChange={setBehavior}
                placeholder="e.g. Blunt, uses jargon, focuses on cost savings, highly skeptical of anything that 'sounds too good'…"
                minRows={1}
              />
              <div className="flex flex-wrap gap-1.5 mt-1">
                {BEHAVIOR_SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setBehavior(s)}
                    className="px-2.5 py-1 text-[10px] font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-cream-warm)] text-[var(--color-ink-muted)] hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                  >
                    {s.substring(0, 30)}…
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-cream)] shrink-0 flex gap-3 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-[var(--color-border)] text-xs font-semibold text-[var(--color-ink)] bg-[var(--color-cream)] rounded-xl hover:bg-[var(--color-cream-warm)] transition-all"
            >
              Cancel
            </button>
            <button
              disabled={!canBegin}
              onClick={() => onBeginInterview(profile.trim(), behavior.trim())}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white text-xs font-semibold rounded-xl border border-emerald-600 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 group"
            >
              <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Begin Interview
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── Auto-resize textarea helper ─────────────────────────────────────────────

interface AutoResizeTextareaProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minRows?: number;
}

function AutoResizeTextarea({ value, onChange, placeholder, minRows = 1 }: AutoResizeTextareaProps) {
  return (
    <textarea
      value={value}
      rows={minRows}
      onChange={(e) => {
        onChange(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
      }}
      onFocus={(e) => {
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
      }}
      placeholder={placeholder}
      className="w-full resize-none text-sm p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-cream-warm)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all leading-relaxed"
      style={{ minHeight: `${minRows * 1.4}rem` }}
    />
  );
}
