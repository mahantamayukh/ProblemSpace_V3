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
          className="relative z-10 w-full max-w-lg bg-[var(--color-cream)] border border-[var(--color-border)] rounded-[2.5rem] shadow-[var(--shadow-elevated)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-sage-light)] flex items-center justify-between shrink-0 rounded-t-[2.5rem]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-sage)] flex items-center justify-center shadow-lg transform -rotate-3 text-[var(--color-cream)]">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-sage)]">
                  Persona Intelligence
                </span>
                <span className="block font-black text-xl text-[var(--color-ink)] leading-tight">
                  {personaLabel}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--color-cream-deep)] transition-all shrink-0 border border-transparent hover:border-[var(--color-border)]"
            >
              <X className="w-5 h-5 text-[var(--color-ink-muted)]" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 flex flex-col gap-6 overflow-y-auto max-h-[65vh] bg-[var(--color-cream)] custom-scrollbar">
            <p className="text-[11px] font-medium text-[var(--color-ink-muted)] leading-relaxed border-l-4 border-[var(--color-sage)] pl-4 opacity-80">
              Define who this person is before starting the interview. The richer the profile, the more realistic the simulation.
            </p>

            {/* Identity Profile */}
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ink-muted)] px-1">
                Identity Profile <span className="text-red-500">*</span>
              </label>
              <AutoResizeTextarea
                value={profile}
                onChange={setProfile}
                placeholder="e.g. A 40-year-old logistics manager who relies on spreadsheets..."
                minRows={1}
              />
              <div className="flex flex-wrap gap-2 mt-1 px-1">
                {PROFILE_SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setProfile(s)}
                    className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl border border-[var(--color-border)] bg-[var(--color-cream-warm)] text-[var(--color-ink-muted)] hover:border-[var(--color-sage)] hover:text-[var(--color-sage)] transition-all shadow-sm"
                  >
                    {s.substring(0, 25)}…
                  </button>
                ))}
              </div>
            </div>

            {/* Behavior & Tone */}
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ink-muted)] px-1">
                Behavior & Tone
              </label>
              <AutoResizeTextarea
                value={behavior}
                onChange={setBehavior}
                placeholder="e.g. Blunt, uses jargon, focuses on cost savings..."
                minRows={1}
              />
              <div className="flex flex-wrap gap-2 mt-1 px-1">
                {BEHAVIOR_SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setBehavior(s)}
                    className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl border border-[var(--color-border)] bg-[var(--color-cream-warm)] text-[var(--color-ink-muted)] hover:border-[var(--color-sage)] hover:text-[var(--color-sage)] transition-all shadow-sm"
                  >
                    {s.substring(0, 25)}…
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-[var(--color-border)] bg-[var(--color-cream-warm)] shrink-0 flex gap-4 rounded-b-[2.5rem]">
            <button
              onClick={onClose}
              className="px-8 py-4 border border-[var(--color-border)] text-[10px] font-black uppercase tracking-widest text-[var(--color-ink-muted)] bg-[var(--color-cream)] rounded-2xl hover:bg-[var(--color-cream-deep)] transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              disabled={!canBegin}
              onClick={() => onBeginInterview(profile.trim(), behavior.trim())}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-[var(--color-ink)] text-[var(--color-cream)] text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-[var(--color-sage)] hover:-translate-y-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0 group"
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
