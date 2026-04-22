import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, TrendingDown, ArrowRight, Zap, Sparkles, Sliders, Key, Eye, EyeOff, ShieldCheck, Database, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { MODELS } from '../lib/models';
import { testAIConnection } from '../lib/gemini';

interface IntelligenceHubModalProps {
  initialConfig: {
    model: string;
    frequency: number;
    geminiKey: string;
    anthropicKey: string;
    customBaseUrl: string;
    customModelName: string;
    universalKey: string;
  };
  onSave: (config: {
    model: string;
    frequency: number;
    geminiKey: string;
    anthropicKey: string;
    customBaseUrl: string;
    customModelName: string;
    universalKey: string;
  }) => void;
  onClose: () => void;
  isFirstTime?: boolean;
}

export default function IntelligenceHubModal({ 
  initialConfig, 
  onSave, 
  onClose,
  isFirstTime = false
}: IntelligenceHubModalProps) {
  const [model, setModel] = useState(initialConfig.model || 'gemini-2.0-flash');
  const [frequency, setFrequency] = useState(initialConfig.frequency || 10);
  const [geminiKey, setGeminiKey] = useState(initialConfig.geminiKey || '');
  const [anthropicKey, setAnthropicKey] = useState(initialConfig.anthropicKey || '');
  const [customBaseUrl, setCustomBaseUrl] = useState(initialConfig.customBaseUrl || 'https://api.openai.com/v1');
  const [customModelName, setCustomModelName] = useState(initialConfig.customModelName || 'gpt-4o');
  const [universalKey, setUniversalKey] = useState(initialConfig.universalKey || '');
  
  const [showKeys, setShowKeys] = useState(false);
  const [diagnosticsStatus, setDiagnosticsStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [diagnosticsError, setDiagnosticsError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Handle Save with real Diagnostics
  const handleSave = async () => {
    if (diagnosticsStatus === 'testing') return;
    
    setDiagnosticsStatus('testing');
    setDiagnosticsError(null);
    setProgress(10); // Initial reach

    const config = {
      model,
      geminiKey: geminiKey.trim(),
      anthropicKey: anthropicKey.trim(),
      customBaseUrl: customBaseUrl.trim(),
      customModelName: customModelName.trim(),
      universalKey: universalKey.trim()
    };

    // Simulate multi-step progress for UX feeling
    const steps = [30, 60, 90];
    for (const s of steps) {
      await new Promise(r => setTimeout(r, 400));
      setProgress(s);
    }

    const result = await testAIConnection(config);

    if (result.success) {
      setProgress(100);
      setDiagnosticsStatus('success');
      
      // Automatic close after success beat
      setTimeout(() => {
        onSave({
          ...config,
          frequency: Number(frequency)
        });
        localStorage.setItem('problemspace-setup-complete', 'true');
        onClose();
      }, 800);
    } else {
      setDiagnosticsStatus('error');
      setDiagnosticsError(result.error || "Connection failed. Please check your credentials.");
      setProgress(0);
    }
  };

  const getEfficiency = (freq: number) => {
    if (freq <= 10) return { pct: 92, label: 'High Preservation', color: 'var(--color-sage)' };
    if (freq <= 20) return { pct: 75, label: 'Balanced Context', color: 'var(--color-lavender)' };
    return { pct: 45, label: 'High Compression', color: 'var(--color-amber)' };
  };

  const efficiency = getEfficiency(frequency);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-[var(--color-cream)] border border-[var(--color-border)] shadow-2xl rounded-3xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-cream-warm)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-ink)] text-[var(--color-cream)] flex items-center justify-center shadow-lg">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--color-ink)]">Intelligence Hub</h2>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1 font-medium">Configure models & neural memory</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--color-cream-deep)] rounded-xl transition-all">
            <X className="w-5 h-5 text-[var(--color-ink-muted)]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-[var(--color-cream)]">
          <div className="space-y-5">
            <label className="text-[10px] font-black text-[var(--color-ink-muted)] uppercase tracking-widest flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--color-lavender)]" />
              1. Select Processing Engine
            </label>
            <div className="grid grid-cols-2 gap-4">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`p-5 rounded-2xl border text-left transition-all relative shadow-sm h-full ${
                    model === m.id 
                      ? 'bg-[var(--color-lavender-light)] border-[var(--color-lavender)] ring-1 ring-[var(--color-lavender)]' 
                      : 'bg-[var(--color-cream-warm)] border-[var(--color-border)] hover:border-[var(--color-lavender)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${model === m.id ? 'text-[var(--color-lavender)]' : 'text-[var(--color-ink-muted)]'}`}>
                      {m.provider}
                    </span>
                    {model === m.id && <div className="w-2 h-2 rounded-full bg-[var(--color-lavender)]" />}
                  </div>
                  <h4 className="text-sm font-bold mb-1 text-[var(--color-ink)]">{m.name}</h4>
                  <p className="text-[10px] text-[var(--color-ink-muted)] leading-relaxed line-clamp-2 font-medium">
                    {m.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={model}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 bg-[var(--color-cream-warm)] border border-[var(--color-border)] rounded-[2.5rem] space-y-6 shadow-sm"
              >
                {!model.startsWith('claude-') && model !== 'universal' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ink)] flex items-center gap-2">
                        <Zap className="w-3 h-3 text-amber-500" /> Google Gemini Key
                      </span>
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[9px] font-black text-[var(--color-lavender)] hover:underline">Get Key</a>
                    </div>
                    <input 
                      type={showKeys ? 'text' : 'password'}
                      value={geminiKey}
                      onChange={e => setGeminiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-5 py-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-cream)] font-mono text-xs outline-none focus:ring-2 focus:ring-[var(--color-lavender)] transition-all"
                    />
                  </div>
                )}

                {model.startsWith('claude-') && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ink)] flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-purple-500" /> Anthropic Claude Key
                      </span>
                      <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer" className="text-[9px] font-black text-[var(--color-lavender)] hover:underline">Get Key</a>
                    </div>
                    <input 
                      type={showKeys ? 'text' : 'password'}
                      value={anthropicKey}
                      onChange={e => setAnthropicKey(e.target.value)}
                      placeholder="sk-ant-..."
                      className="w-full px-5 py-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-cream)] font-mono text-xs outline-none focus:ring-2 focus:ring-[var(--color-lavender)] transition-all"
                    />
                  </div>
                )}

                {model === 'universal' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 px-1">
                        <span className="text-[9px] font-black text-[var(--color-ink-muted)] uppercase ml-1">Base URL</span>
                        <input value={customBaseUrl} onChange={e => setCustomBaseUrl(e.target.value)} placeholder="https://api.groq.com/openai/v1" className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] font-mono text-[10px] outline-none focus:border-[var(--color-lavender)] transition-all" />
                      </div>
                      <div className="space-y-2 px-1">
                        <span className="text-[9px] font-black text-[var(--color-ink-muted)] uppercase ml-1">Model ID</span>
                        <input value={customModelName} onChange={e => setCustomModelName(e.target.value)} placeholder="llama-3.3-70b-versatile" className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] font-mono text-[10px] outline-none focus:border-[var(--color-lavender)] transition-all" />
                      </div>
                    </div>
                    <div className="space-y-2 px-1">
                      <span className="text-[9px] font-black text-[var(--color-ink-muted)] uppercase ml-1">Universal API Key</span>
                      <input type={showKeys ? 'text' : 'password'} value={universalKey} onChange={e => setUniversalKey(e.target.value)} placeholder="Enter key..." className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] font-mono text-[10px] outline-none focus:border-[var(--color-lavender)] transition-all" />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-2 opacity-60">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">Privacy First: Keys Stored Locally</span>
                  </div>
                  <button onClick={() => setShowKeys(!showKeys)} className="flex items-center gap-2 text-[9px] font-black uppercase text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-all">
                    {showKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showKeys ? 'Conceal' : 'Reveal Credentials'}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <label className="text-[10px] font-black text-[var(--color-ink-muted)] uppercase tracking-widest flex items-center gap-2">
              <History className="w-4 h-4 text-[var(--color-sage)]" />
              2. Neural Memory Cycle
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[10, 20, 30].map((val) => (
                <button
                  key={val}
                  onClick={() => setFrequency(val)}
                  className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-1 shadow-sm ${
                    frequency === val 
                      ? 'bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)] shadow-md' 
                      : 'bg-[var(--color-cream-warm)] border-[var(--color-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-lavender)]'
                  }`}
                >
                  <span className="text-3xl font-black">{val}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Cycles</span>
                </button>
              ))}
            </div>
            <div className="p-8 bg-[var(--color-sage-light)] border border-[var(--color-sage)] rounded-[2.5rem] relative overflow-hidden group shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[var(--color-sage)]">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest font-mono">Efficiency Projection</span>
                  </div>
                  <span className="text-2xl font-black text-[var(--color-sage)] font-mono">{efficiency.pct}%</span>
               </div>
               <div className="w-full h-2 bg-[var(--color-sage-light)] rounded-full border border-[var(--color-sage)]/20 overflow-hidden shadow-inner">
                  <motion.div animate={{ width: `${efficiency.pct}%` }} transition={{ duration: 1, type: "spring" }} className="h-full bg-[var(--color-sage)]" />
               </div>
               <p className="mt-4 text-[10px] font-medium text-[var(--color-sage)] opacity-80 leading-relaxed font-medium">
                 Optimal memory cycles prevent "context drift" by synthesizing logic before token limits are hit.
               </p>
            </div>
          </div>
        </div>

        {/* Footer with diagnostics feedback */}
        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-cream-warm)] flex flex-col gap-4 rounded-b-3xl shrink-0">
          {diagnosticsStatus === 'error' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Intelligence Diagnostic Failed</p>
                <p className="text-[11px] font-medium text-red-500 leading-relaxed">{diagnosticsError}</p>
              </div>
            </motion.div>
          )}

          <div className="flex gap-4">
            <button onClick={onClose} className="px-8 py-3 border border-[var(--color-border)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--color-ink-muted)] hover:bg-[var(--color-cream-deep)] transition-all">
              Discard
            </button>
            <button 
              onClick={handleSave}
              disabled={diagnosticsStatus === 'testing' || diagnosticsStatus === 'success'}
              className={`flex-1 py-4 text-[var(--color-cream)] rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-4 transition-all relative overflow-hidden group ${
                diagnosticsStatus === 'success' ? 'bg-[var(--color-sage)]' : 'bg-[var(--color-ink)] hover:bg-[var(--color-lavender)]'
              }`}
            >
              {diagnosticsStatus === 'testing' ? (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[9px] tracking-[0.2em] font-black uppercase flex items-center gap-2">
                    <Search className="w-3 h-3 animate-pulse" />
                    {progress < 30 ? 'Reaching Provider' : progress < 60 ? 'Verifying Key' : 'Testing Model'}...
                  </span>
                  <div className="w-32 h-0.5 bg-white/20 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-[var(--color-lavender)]" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : diagnosticsStatus === 'success' ? (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Verified & Linked</span>
                </div>
              ) : (
                <>
                  <span>{isFirstTime ? 'Initialize Workspace' : 'Apply Configuration'}</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
