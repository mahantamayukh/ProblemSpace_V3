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
          className="relative z-10 w-full max-w-2xl bg-[var(--color-cream)] border border-[var(--color-border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-emerald-light)] flex items-center justify-between shrink-0 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <Brain className={`w-5 h-5 ${isDrafting ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <span className="block text-[10px] font-medium text-emerald-700 dark:text-emerald-400 leading-none mb-1">
                  Memory Consolidation
                </span>
                <span className="block font-semibold text-lg text-[var(--color-ink)] leading-tight">
                  Strategic Review
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Cost Savings Indicator */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400">
                <TrendingDown className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold tracking-wide">
                  -45% Token Usage
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-cream-warm)] transition-all shrink-0"
              >
                <X className="w-4 h-4 text-[var(--color-ink-muted)]" />
              </button>
            </div>
          </div>

          {/* Warning/Info Bar */}
          <div className="px-5 py-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] flex items-center justify-center gap-2 overflow-hidden shadow-sm z-10">
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
            <span className="text-[10px] font-medium tracking-wide">
              Consolidating past 10 turns into strategy. Fine-tune below.
            </span>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[var(--color-border)] shrink-0 bg-[var(--color-cream-warm)]">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all ${activeTab === 'preview' ? 'bg-[var(--color-cream)] text-[var(--color-ink)] border-t-[3px] border-t-emerald-500' : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border-t-[3px] border-t-transparent'}`}
            >
              <Sparkles className="w-4 h-4" />
              AI Draft (Preview)
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all ${activeTab === 'edit' ? 'bg-[var(--color-cream)] text-[var(--color-ink)] border-t-[3px] border-t-emerald-500' : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border-t-[3px] border-t-transparent'}`}
            >
              <FileEdit className="w-4 h-4" />
              Manual Correction
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 bg-[var(--color-cream-warm)]">
            {activeTab === 'preview' ? (
              <div className="relative">
                {isDrafting && (
                  <div className="absolute inset-x-0 -top-3 flex justify-center z-10">
                    <span className="px-3 py-1 rounded-full bg-purple-500 text-white text-[10px] font-semibold tracking-wide animate-pulse shadow-md">
                      AI is drafting...
                    </span>
                  </div>
                )}
                <div className={`p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] shadow-sm min-h-[300px] transition-all duration-500 ${isDrafting ? 'opacity-60 blur-[1px]' : 'opacity-100'}`}>
                  <div className="markdown-body prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-emerald-600 dark:prose-invert">
                    <Markdown>{editedSummary}</Markdown>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col gap-3">
                <p className="text-[10px] font-medium text-[var(--color-ink-muted)] pl-1 italic">
                  Use markdown to refine the core insights, audience needs, and project status.
                </p>
                <textarea
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  className="flex-1 w-full p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] text-[var(--color-ink)] font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 min-h-[350px] shadow-sm leading-relaxed"
                  placeholder="The strategic core of our session is..."
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-[var(--color-border)] bg-[var(--color-cream)] shrink-0 flex items-center justify-between rounded-b-2xl">
            <div className="flex flex-col gap-1 hidden sm:flex">
              <span className="text-xs font-semibold text-[var(--color-ink-muted)] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Session Management
              </span>
              <span className="text-[10px] font-medium text-[var(--color-ink-light)] max-w-[220px] leading-tight flex items-start gap-1">
                <History className="w-3 h-3 shrink-0" />
                Approval clears message history and embeds this summary into AI logic.
              </span>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-ink)] bg-[var(--color-cream)] hover:bg-[var(--color-cream-warm)] transition-all"
              >
                Discard
              </button>
              <button
                disabled={isDrafting || !editedSummary.trim()}
                onClick={() => onSave(editedSummary)}
                className="flex-1 sm:flex-none relative px-6 py-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] text-xs font-semibold rounded-xl border border-[var(--color-ink)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed group flex items-center justify-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-[var(--color-cream)]/20 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
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
