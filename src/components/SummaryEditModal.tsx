import React, { useState, useEffect } from 'react';
import { Save, X, Brain, Zap, History, FileEdit, Sparkles, TrendingDown, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';

interface SummaryEditModalProps {
  draftSummary: string;
  onSave: (finalSummary: string) => void;
  onClose: () => void;
  isDrafting?: boolean;
}

export default function SummaryEditModal({
  draftSummary,
  onSave,
  onClose,
  isDrafting = false
}: SummaryEditModalProps) {
  const [editedSummary, setEditedSummary] = useState(draftSummary);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('preview');

  useEffect(() => {
    if (!isDrafting) {
      setEditedSummary(draftSummary);
    }
  }, [draftSummary, isDrafting]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[var(--color-ink)]/50 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative z-10 w-full max-w-2xl bg-[var(--color-cream)] border border-[var(--color-border)] rounded-[2.5rem] shadow-[var(--shadow-elevated)] flex flex-col overflow-hidden max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-sage-light)] flex items-center justify-between shrink-0 rounded-t-[2.5rem]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-sage)] text-[var(--color-cream)] flex items-center justify-center shadow-lg transform -rotate-2">
                <Brain className={`w-6 h-6 ${isDrafting ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-sage)] mb-1">
                  Memory Consolidation
                </span>
                <span className="block font-black text-xl text-[var(--color-ink)] leading-tight">
                  Strategic Review
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-sage)]/20 bg-[var(--color-sage-light)] text-[var(--color-sage)]">
                <TrendingDown className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  -45% Context Load
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--color-cream-deep)] transition-all shrink-0 border border-transparent hover:border-[var(--color-border)]"
              >
                <X className="w-5 h-5 text-[var(--color-ink-muted)]" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[var(--color-cream)] custom-scrollbar">
            {/* Tabs */}
            <div className="flex p-1 bg-[var(--color-cream-warm)] rounded-2xl border border-[var(--color-border)] shrink-0">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 py-3 px-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl transition-all ${activeTab === 'preview' ? 'bg-[var(--color-ink)] text-[var(--color-cream)] shadow-md' : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'}`}
              >
                <Sparkles className="w-4 h-4" />
                AI Draft
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`flex-1 py-3 px-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl transition-all ${activeTab === 'edit' ? 'bg-[var(--color-ink)] text-[var(--color-cream)] shadow-md' : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'}`}
              >
                <FileEdit className="w-4 h-4" />
                Edit Core
              </button>
            </div>

            <div className="flex-1">
              {activeTab === 'preview' ? (
                <div className="relative">
                  <div className={`p-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-cream-warm)] shadow-inner min-h-[350px] transition-all duration-500 ${isDrafting ? 'opacity-60 blur-[1px]' : 'opacity-100'}`}>
                    <div className="markdown-body prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-black prose-a:text-[var(--color-sage)] dark:prose-invert text-[var(--color-ink)]">
                      <Markdown>{editedSummary}</Markdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col gap-3">
                  <textarea
                    value={editedSummary}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    className="w-full p-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-cream-warm)] text-[var(--color-ink)] font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-light)] min-h-[350px] shadow-inner leading-relaxed"
                    placeholder="The strategic core of our session is..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-[var(--color-border)] bg-[var(--color-cream-warm)] shrink-0 flex items-center justify-between rounded-b-[2.5rem]">
            <div className="flex flex-col gap-1 hidden sm:flex">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ink-muted)] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                Strategic Anchoring
              </span>
              <p className="text-[10px] font-medium text-[var(--color-ink-muted)] opacity-60 max-w-[240px] leading-relaxed">
                Saving this summary will compress current history into long-term neural memory.
              </p>
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-8 py-4 rounded-2xl border border-[var(--color-border)] text-[10px] font-black uppercase tracking-widest text-[var(--color-ink-muted)] bg-[var(--color-cream)] hover:bg-[var(--color-cream-deep)] transition-all shadow-sm"
              >
                Discard
              </button>
              <button
                disabled={isDrafting || !editedSummary.trim()}
                onClick={() => onSave(editedSummary)}
                className="flex-1 sm:flex-none px-8 py-4 bg-[var(--color-ink)] text-[var(--color-cream)] text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-[var(--color-sage)] hover:-translate-y-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed group flex items-center justify-center gap-3 overflow-hidden"
              >
                <Save className="w-4 h-4" />
                <span>Save & Consolidate</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
