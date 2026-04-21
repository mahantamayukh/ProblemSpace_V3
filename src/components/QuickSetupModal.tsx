import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, X, History, TrendingDown, ShieldCheck, ArrowRight, Brain, Zap, Sparkles, Sliders } from 'lucide-react';
import { MODELS, getModelByScore } from '../lib/models';

interface QuickSetupModalProps {
  initialModel?: string;
  initialFrequency?: number;
  onSave: (config: { model: string, frequency: number }) => void;
  onClose: () => void;
  isFirstTime?: boolean;
}

export default function QuickSetupModal({ 
  initialModel = 'gemini-2.0-flash', 
  initialFrequency = 10, 
  onSave, 
  onClose,
  isFirstTime = false
}: QuickSetupModalProps) {
  const [frequency, setFrequency] = useState(initialFrequency);
  
  // Find current model's score
  const initialConfig = MODELS.find(m => m.id === initialModel) || MODELS[1];
  const [reasoningScore, setReasoningScore] = useState(initialConfig.reasoningScore);
  
  const selectedModel = getModelByScore(reasoningScore);

  const handleLaunch = () => {
    onSave({ model: selectedModel.id, frequency });
    localStorage.setItem('problemspace-setup-complete', 'true');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[var(--color-ink)]/40 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="relative w-full max-w-lg bg-[var(--color-cream)] border border-[var(--color-border)] shadow-2xl rounded-2xl p-8 z-10 flex flex-col gap-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-lavender-light)] border border-[var(--color-lavender)] flex items-center justify-center shadow-sm">
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight leading-none">
                {isFirstTime ? 'Setup Workspace' : 'Configure Intelligence'}
              </h2>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1">Fine-tune your AI discovery engine</p>
            </div>
          </div>
          {!isFirstTime && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-cream-warm)] transition-all">
              <X className="w-5 h-5 text-[var(--color-ink-muted)]" />
            </button>
          )}
        </div>

        {/* Intelligence Selection - Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[var(--color-ink-muted)] flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-purple-500" />
              Intelligence Profile
            </label>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/30 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              {selectedModel.name}
            </span>
          </div>

          <div className="relative pt-2 pb-6">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={reasoningScore}
              onChange={(e) => setReasoningScore(parseInt(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between mt-2 text-[9px] font-bold text-neutral-400 uppercase tracking-widest px-1">
              <span>High Speed</span>
              <span>Deep Reasoning</span>
            </div>
          </div>

          <div className="p-4 bg-[var(--color-cream-warm)] border border-[var(--color-border)] rounded-xl flex items-center gap-4 transition-all">
             <div className="w-12 h-12 shrink-0 rounded-full bg-white dark:bg-black/20 flex items-center justify-center shadow-inner">
                {reasoningScore < 50 ? <Zap className="w-5 h-5 text-amber-500" /> : <Sparkles className="w-5 h-5 text-purple-500" />}
             </div>
             <div>
                <h4 className="text-xs font-bold text-[var(--color-ink)] mb-0.5">{selectedModel.name}</h4>
                <p className="text-[10px] font-medium text-[var(--color-ink-muted)] leading-relaxed italic opacity-80">
                  "{selectedModel.description}"
                </p>
             </div>
          </div>
        </div>

        {/* Frequency Selection */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[var(--color-ink-muted)] flex items-center gap-2">
            <History className="w-3.5 h-3.5" />
            Memory Refresh Interval
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[10, 20, 30].map((val) => (
              <button
                key={val}
                onClick={() => setFrequency(val)}
                className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${frequency === val ? 'bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)] shadow-md' : 'bg-[var(--color-cream-warm)] border-[var(--color-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-border-hover)]'}`}
              >
                <span className="text-2xl font-bold">{val}</span>
                <span className="text-[10px] font-medium">Messages</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cost-Benefit Component */}
        <div className="p-5 border border-[var(--color-sage)] bg-[var(--color-sage-light)] rounded-xl space-y-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:scale-110 transition-transform text-emerald-800">
            <TrendingDown className="w-12 h-12" />
          </div>
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <TrendingDown className="w-4 h-4" />
            <span className="font-semibold text-sm">Strategic Consolidation</span>
          </div>
          <p className="text-xs font-medium leading-relaxed text-emerald-800 dark:text-emerald-300">
            Memory refreshes every <span className="font-bold underline decoration-1">{frequency} messages</span> to keep the problem space dense and token-efficient.
          </p>
        </div>

        {/* Security Note */}
        {isFirstTime && (
          <div className="flex items-start gap-3 p-4 bg-[var(--color-sky-light)] border border-[var(--color-sky)] rounded-xl text-sky-700 dark:text-sky-300">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold mb-1">Privacy Guarantee</h4>
              <p className="text-[10px] font-medium leading-tight opacity-80">All session data and API keys remain on your local device. We never store or transmit your sensitive configurations.</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLaunch}
          className="w-full py-4 bg-[var(--color-ink)] text-[var(--color-cream)] font-semibold rounded-xl border border-[var(--color-ink)] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
        >
          <span>{isFirstTime ? 'Launch Workspace' : 'Update Configuration'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
