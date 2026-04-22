import { useState } from 'react';
import { Search, Loader2, X, Terminal, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SignalScannerProps {
  onScan: (query: string) => Promise<string | undefined | null>;
  onClose: () => void;
  isOpen: boolean;
}

type ScanState = 'idle' | 'scanning' | 'success' | 'error';

export default function SignalScanner({ onScan, onClose, isOpen }: SignalScannerProps) {
  const [query, setQuery] = useState('');
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scanResult, setScanResult] = useState<string>('');
  const [errorDetail, setErrorDetail] = useState<string>('');

  const handleScan = async () => {
    if (!query.trim() || scanState === 'scanning') return;
    const q = query.trim();

    setScanState('scanning');
    setScanResult('');
    setErrorDetail('');

    try {
      const result = await onScan(q);
      setScanResult(result || `Research on "${q}" is complete.`);
      setScanState('success');
      setQuery('');
      // Auto-close after 3 s on success
      setTimeout(() => {
        onClose();
        setScanState('idle');
        setScanResult('');
      }, 3000);
    } catch (err: any) {
      console.error('[SignalScanner]', err);
      const msg = err?.message || String(err);
      setErrorDetail(msg);
      setScanState('error');
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state after animation finishes
    setTimeout(() => {
      setScanState('idle');
      setScanResult('');
      setErrorDetail('');
    }, 300);
  };

  const handleRetry = () => {
    setScanState('idle');
    setErrorDetail('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-[var(--color-ink)]/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="relative w-full max-w-lg bg-[var(--color-cream)] border border-[var(--color-border)] rounded-[2.5rem] shadow-[var(--shadow-elevated)] p-8 overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--color-cream-deep)] transition-all border border-transparent hover:border-[var(--color-border)]"
            >
              <X className="w-5 h-5 text-[var(--color-ink-muted)]" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-sage)] flex items-center justify-center shadow-lg shrink-0 transform rotate-3 text-[var(--color-cream)]">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-[var(--color-ink)]">Signal Scanner</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-sage)] mt-0.5">Market Intelligence Engine</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Search input row */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ink-muted)] px-1">Research Objective</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleScan()}
                      disabled={scanState === 'scanning'}
                      placeholder="e.g. competitors of Airbnb, AI SaaS trends..."
                      className="w-full text-xs font-medium p-4 border border-[var(--color-border)] rounded-2xl bg-[var(--color-cream-warm)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-light)] pr-12 transition-all disabled:opacity-50 shadow-inner"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Terminal className="w-4 h-4 text-[var(--color-ink-muted)] opacity-40" />
                    </div>
                  </div>
                  <button
                    onClick={handleScan}
                    disabled={scanState === 'scanning' || !query.trim()}
                    className="px-6 bg-[var(--color-ink)] text-[var(--color-cream)] font-black uppercase tracking-widest text-[10px] rounded-2xl border border-transparent shadow-xl hover:bg-[var(--color-sage)] hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3 shrink-0"
                  >
                    {scanState === 'scanning' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Scanning…
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Scan
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status panel */}
              <div className="p-6 border border-dashed border-[var(--color-border)] rounded-3xl bg-[var(--color-cream-warm)] min-h-[120px] flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">

                  {/* Scanning */}
                  {scanState === 'scanning' && (
                    <motion.div
                      key="scanning"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center text-center gap-4 w-full py-2"
                    >
                      <div className="w-10 h-10 border-t-2 border-[var(--color-sage)] animate-spin rounded-full shadow-sm" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-sage)] animate-pulse">
                          Accessing Intelligence Layers…
                        </p>
                        <p className="text-[10px] font-medium text-[var(--color-ink-muted)] mt-1 max-w-[200px] opacity-60">
                          Synthesizing canvas nodes from live market signals.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Success */}
                  {scanState === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center text-center gap-3 w-full py-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Scan Synchronized</p>
                      <p className="text-[10px] font-medium text-[var(--color-ink-muted)] italic max-w-xs leading-relaxed">
                        {scanResult}
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mt-1 opacity-40">Auto-closing engine...</p>
                    </motion.div>
                  )}

                  {/* Error */}
                  {scanState === 'error' && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center text-center gap-3 w-full py-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">System Interrupted</p>
                      {errorDetail && (
                        <p className="text-[9px] font-mono text-red-500 bg-red-50/50 border border-red-100 rounded-xl px-4 py-2 max-w-xs break-all leading-relaxed shadow-sm">
                          {errorDetail.length > 150 ? errorDetail.slice(0, 150) + '…' : errorDetail}
                        </p>
                      )}
                      <button
                        onClick={handleRetry}
                        className="mt-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-sage)] hover:opacity-70 transition-all underline underline-offset-4"
                      >
                        ← Restart Scanner
                      </button>
                    </motion.div>
                  )}

                  {/* Idle */}
                  {scanState === 'idle' && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-3 text-center w-full py-2"
                    >
                      <p className="text-[10px] font-medium text-[var(--color-ink-muted)] leading-relaxed max-w-[280px] mx-auto opacity-70">
                        Enter a topic — competitors, market trends, or a problem space — and the AI will populate your canvas with structured signal nodes.
                      </p>
                      <div className="flex gap-2 mt-2 flex-wrap justify-center">
                        {['Figma competitors', 'AI SaaS trends', 'Remote work problems'].map(ex => (
                          <button
                            key={ex}
                            onClick={() => setQuery(ex)}
                            className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border border-[var(--color-border)] rounded-xl text-[var(--color-ink-muted)] bg-[var(--color-cream)] hover:border-[var(--color-sage)] hover:text-[var(--color-sage)] hover:shadow-sm transition-all"
                          >
                            {ex}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-[var(--color-ink-muted)] opacity-40 px-1 pt-2">
                <span className="flex items-center gap-2"><Zap className="w-3 h-3 text-[var(--color-sage)]" /> Neural Sync v2.0</span>
                <span>Active Research</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
