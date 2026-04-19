import { useState } from 'react';
import { Search, Loader2, X, Terminal, CheckCircle2, AlertTriangle } from 'lucide-react';
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
            className="relative w-full max-w-lg bg-[var(--color-cream)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-6 overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-cream-warm)] transition-all"
            >
              <X className="w-5 h-5 text-[var(--color-ink-muted)]" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shadow-sm shrink-0">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">Signal Scanner</h2>
                <p className="text-[10px] font-medium text-[var(--color-ink-muted)]">AI-Powered Market Intelligence</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Search input row */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--color-ink-muted)]">Search Query or Topic</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleScan()}
                      disabled={scanState === 'scanning'}
                      placeholder="e.g. competitors of Airbnb, trends in AI SaaS..."
                      className="w-full text-xs font-medium p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-cream-warm)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-700 pr-10 transition-all disabled:opacity-50"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Terminal className="w-3.5 h-3.5 text-[var(--color-ink-muted)]" />
                    </div>
                  </div>
                  <button
                    onClick={handleScan}
                    disabled={scanState === 'scanning' || !query.trim()}
                    className="px-4 bg-purple-500 text-white font-semibold text-xs rounded-xl border border-purple-600 shadow-sm hover:shadow-md hover:bg-purple-600 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                  >
                    {scanState === 'scanning' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Scanning…
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        Scan
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status panel */}
              <div className="p-4 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-cream-warm)] min-h-[90px] flex items-center justify-center">
                <AnimatePresence mode="wait">

                  {/* Scanning */}
                  {scanState === 'scanning' && (
                    <motion.div
                      key="scanning"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center text-center gap-3 w-full py-2"
                    >
                      <div className="w-8 h-8 border-t-2 border-purple-500 animate-spin rounded-full" />
                      <div>
                        <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 animate-pulse">
                          Engaging Intelligence Engine…
                        </p>
                        <p className="text-[9px] text-[var(--color-ink-muted)] mt-0.5">
                          Researching market signals and synthesising canvas nodes.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Success */}
                  {scanState === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center text-center gap-2 w-full py-2"
                    >
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Scan complete!</p>
                      <p className="text-[10px] text-[var(--color-ink-muted)] italic max-w-xs leading-relaxed">
                        {scanResult}
                      </p>
                      <p className="text-[9px] text-[var(--color-ink-muted)] mt-1">New nodes added to your canvas. Closing…</p>
                    </motion.div>
                  )}

                  {/* Error */}
                  {scanState === 'error' && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center text-center gap-2 w-full py-2"
                    >
                      <AlertTriangle className="w-6 h-6 text-amber-500" />
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Scan failed</p>
                      {errorDetail && (
                        <p className="text-[9px] font-mono text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-1.5 max-w-xs break-all leading-relaxed">
                          {errorDetail.length > 200 ? errorDetail.slice(0, 200) + '…' : errorDetail}
                        </p>
                      )}
                      <button
                        onClick={handleRetry}
                        className="mt-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        ← Try again
                      </button>
                    </motion.div>
                  )}

                  {/* Idle */}
                  {scanState === 'idle' && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-2 text-center w-full py-2"
                    >
                      <p className="text-[10px] text-[var(--color-ink-muted)] leading-relaxed max-w-[280px] mx-auto">
                        Enter a topic — competitors, market trends, or a problem space — and the AI will populate your canvas with structured signal nodes.
                      </p>
                      <div className="flex gap-2 mt-1 flex-wrap justify-center">
                        {['Figma competitors', 'AI SaaS trends', 'Remote work problems'].map(ex => (
                          <button
                            key={ex}
                            onClick={() => setQuery(ex)}
                            className="px-2 py-0.5 text-[9px] font-medium border border-[var(--color-border)] rounded-full text-[var(--color-ink-muted)] hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
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
              <div className="flex justify-between items-center text-[9px] font-medium text-[var(--color-ink-muted)]">
                <span>Problem Discovery Engine v2.0</span>
                <span>AI-Assisted Research</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
