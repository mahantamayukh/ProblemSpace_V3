import { useState } from 'react';
import { ShieldAlert, Plus, X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Constraint {
  id: string;
  category: string;
  text: string;
}

interface ConstraintPanelProps {
  constraints: Constraint[];
  onAdd: (category: string, text: string) => void;
  onRemove: (id: string) => void;
}

const CATEGORIES = [
  { id: 'Budget', color: 'bg-red-500' },
  { id: 'Time', color: 'bg-blue-500' },
  { id: 'Technical', color: 'bg-amber-500' },
  { id: 'Audience', color: 'bg-emerald-500' },
  { id: 'Wild Card', color: 'bg-purple-500' },
];

export default function ConstraintPanel({ constraints, onAdd, onRemove }: ConstraintPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newConstraint, setNewConstraint] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);

  const handleAdd = () => {
    if (!newConstraint.trim()) return;
    onAdd(selectedCategory, newConstraint.trim());
    setNewConstraint('');
  };

  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-cream-warm)] transition-colors">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-[var(--color-cream-deep)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm">
            <ShieldAlert className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-medium text-[var(--color-ink-muted)]">Constraint Injector</span>
            <span className="font-semibold text-xs text-[var(--color-ink)]">
              {constraints.length} Active Boundary{constraints.length !== 1 ? 'ies' : ''}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {constraints.slice(0, 3).map(c => (
            <div key={c.id} className="w-2 h-2 rounded-full bg-amber-400" />
          ))}
          {constraints.length > 3 && <span className="text-[10px] font-medium text-[var(--color-ink-muted)]">+ {constraints.length - 3}</span>}
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
            <Plus className="w-4 h-4 text-[var(--color-ink-muted)]" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-[var(--color-cream)] space-y-4">
              {/* Active Constraints List */}
              <div className="space-y-2">
                {constraints.length === 0 ? (
                  <div className="p-8 border border-dashed border-[var(--color-border)] rounded-xl flex flex-col items-center justify-center text-center">
                    <Lock className="w-7 h-7 text-[var(--color-border)] mb-2" />
                    <p className="text-[10px] font-medium text-[var(--color-ink-muted)]">No constraints defined</p>
                    <p className="text-[9px] text-[var(--color-ink-muted)] mt-1">Boundaries breed creativity. Add one to stress-test your ideas.</p>
                  </div>
                ) : (
                  constraints.map(c => (
                    <div key={c.id} className="group flex items-center justify-between p-2.5 border border-[var(--color-border)] bg-[var(--color-cream-warm)] rounded-xl shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 text-[8px] font-semibold text-white rounded-md ${CATEGORIES.find(cat => cat.id === c.category)?.color}`}>
                          {c.category}
                        </span>
                        <span className="text-[10px] font-medium text-[var(--color-ink)]">{c.text}</span>
                      </div>
                      <button
                        onClick={() => onRemove(c.id)}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Constraint Form */}
              <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 text-[9px] font-semibold rounded-lg border transition-all whitespace-nowrap
                        ${selectedCategory === cat.id
                          ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-cream)]'
                          : 'border-[var(--color-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-border-hover)]'
                        }`}
                    >
                      {cat.id}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newConstraint}
                    onChange={e => setNewConstraint(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    placeholder="e.g. Must launch in 4 weeks..."
                    className="flex-1 text-[10px] p-2.5 border border-[var(--color-border)] rounded-xl bg-[var(--color-cream-warm)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all"
                  />
                  <button
                    onClick={handleAdd}
                    className="p-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-xl hover:opacity-90 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
