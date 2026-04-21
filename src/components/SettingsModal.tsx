import React, { useState, useEffect } from 'react';
import { Settings, X, Key, ShieldCheck, Zap, Info, Trash2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODELS } from '../lib/models';

interface SettingsModalProps {
  onClose: () => void;
  onSaveKey: (key: string) => void;
  onSaveAnthropicKey: (key: string) => void;
  onSaveModel: (model: string) => void;
  initialKey?: string;
  initialAnthropicKey?: string;
  initialModel?: string;
  initialBaseUrl?: string;
  initialCustomModel?: string;
  onSaveBaseUrl: (url: string) => void;
  onSaveCustomModel: (name: string) => void;
}


export default function SettingsModal({ 
  onClose, 
  onSaveKey, 
  onSaveAnthropicKey,
  onSaveModel, 
  initialKey = '', 
  initialAnthropicKey = '',
  initialModel = 'gemini-2.0-flash',
  initialBaseUrl = 'https://api.openai.com/v1',
  initialCustomModel = 'gpt-4o',
  onSaveBaseUrl,
  onSaveCustomModel
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(initialKey);
  const [anthropicKey, setAnthropicKey] = useState(initialAnthropicKey);
  const [model, setModel] = useState(initialModel);
  const [customBaseUrl, setCustomBaseUrl] = useState(initialBaseUrl);
  const [customModelName, setCustomModelName] = useState(initialCustomModel);
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const selectedModel = MODELS.find(m => m.id === model) || MODELS[0];
  const isAnthropic = selectedModel.provider === 'anthropic';
  const isUniversal = selectedModel.provider === 'universal';

  const handleSave = () => {
    onSaveKey(apiKey.trim());
    onSaveAnthropicKey(anthropicKey.trim());
    onSaveModel(model);
    onSaveBaseUrl(customBaseUrl.trim());
    onSaveCustomModel(customModelName.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const handleClear = () => {
    if (isAnthropic) {
      setAnthropicKey('');
      onSaveAnthropicKey('');
    } else if (isUniversal) {
      setApiKey('');
      onSaveKey('');
      setCustomBaseUrl('https://api.openai.com/v1');
      onSaveBaseUrl('https://api.openai.com/v1');
      setCustomModelName('gpt-4o');
      onSaveCustomModel('gpt-4o');
    } else {
      setApiKey('');
      onSaveKey('');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[var(--color-ink)]/40 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative z-10 w-full max-w-lg bg-[var(--color-cream)] border border-[var(--color-border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-lavender-light)] flex items-center justify-between shrink-0 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-sm">
                <Settings className="w-5 h-5" style={{ animation: 'spin 8s linear infinite' }} />
              </div>
              <div>
                <span className="block text-[10px] font-medium text-purple-600 dark:text-purple-400">
                  System Configuration
                </span>
                <span className="block font-semibold text-lg text-[var(--color-ink)] leading-tight">
                  Intelligence Tier
                </span>
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
          <div className="p-5 flex flex-col gap-6 overflow-y-auto max-h-[75vh]">
            {/* Model Selection Grid */}
            <div className="flex flex-col gap-4">
              <label className="text-xs font-bold text-[var(--color-ink-muted)] flex items-center gap-2 uppercase tracking-widest">
                <Brain className="w-3.5 h-3.5 text-purple-500" />
                Select Brain Module
              </label>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Google Gemini (Multi-Modal)</span>
                  <div className="grid grid-cols-2 gap-2">
                    {MODELS.filter(m => m.provider === 'google').map(m => (
                      <button
                        key={m.id}
                        onClick={() => setModel(m.id)}
                        className={`p-3 rounded-xl border transition-all text-left flex flex-col gap-0.5 group ${model === m.id ? 'bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)] shadow-md' : 'bg-[var(--color-cream-warm)] border-[var(--color-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-border-hover)]'}`}
                      >
                        <span className="text-xs font-bold">{m.name}</span>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-medium opacity-60">{m.version}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Anthropic Claude (Precise Reasoning)</span>
                  <div className="grid grid-cols-2 gap-2">
                    {MODELS.filter(m => m.provider === 'anthropic').map(m => (
                      <button
                        key={m.id}
                        onClick={() => setModel(m.id)}
                        className={`p-3 rounded-xl border transition-all text-left flex flex-col gap-0.5 group ${model === m.id ? 'bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)] shadow-md' : 'bg-[var(--color-cream-warm)] border-[var(--color-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-border-hover)]'}`}
                      >
                        <span className="text-xs font-bold">{m.name}</span>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-medium opacity-60">{m.version}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Universal / Custom API</span>
                  <div className="grid grid-cols-2 gap-2">
                    {MODELS.filter(m => m.provider === 'universal').map(m => (
                      <button
                        key={m.id}
                        onClick={() => setModel(m.id)}
                        className={`p-3 rounded-xl border transition-all text-left flex flex-col gap-0.5 group ${model === m.id ? 'bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)] shadow-md' : 'bg-[var(--color-cream-warm)] border-[var(--color-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-border-hover)]'}`}
                      >
                        <span className="text-xs font-bold">{m.name}</span>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-medium opacity-60">{m.version}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Model Description */}
              <div className="mt-1 p-3 bg-[var(--color-cream-warm)] border border-[var(--color-border)] rounded-xl">
                 <p className="text-[11px] font-medium text-[var(--color-ink-muted)] leading-relaxed italic">
                   "{selectedModel.description}"
                 </p>
              </div>
            </div>

            {/* API Key Section */}
            <div className="flex flex-col gap-3">
              {isUniversal && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[var(--color-ink-muted)] flex items-center gap-2 uppercase tracking-widest">
                      Base URL Endpoint
                    </label>
                    <input
                      type="text"
                      value={customBaseUrl}
                      onChange={(e) => setCustomBaseUrl(e.target.value)}
                      placeholder="https://api.groq.com/openai/v1"
                      className="w-full p-3.5 border border-[var(--color-border)] rounded-xl bg-[var(--color-cream-warm)] text-[var(--color-ink)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all placeholder:text-[var(--color-ink-muted)]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[var(--color-ink-muted)] flex items-center gap-2 uppercase tracking-widest">
                      Model ID
                    </label>
                    <input
                      type="text"
                      value={customModelName}
                      onChange={(e) => setCustomModelName(e.target.value)}
                      placeholder="llama3-70b-8192"
                      className="w-full p-3.5 border border-[var(--color-border)] rounded-xl bg-[var(--color-cream-warm)] text-[var(--color-ink)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all placeholder:text-[var(--color-ink-muted)]"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--color-ink-muted)] flex items-center gap-2 uppercase tracking-widest">
                  <Key className="w-3.5 h-3.5" />
                  {isUniversal ? 'API Key' : isAnthropic ? 'Anthropic API Key' : 'Gemini API Key'}
                </label>
                {(isAnthropic ? anthropicKey : apiKey) && (
                  <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-semibold rounded-full">
                    Active Override
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={isAnthropic ? anthropicKey : apiKey}
                  onChange={(e) => isAnthropic ? setAnthropicKey(e.target.value) : setApiKey(e.target.value)}
                  placeholder={isUniversal ? "sk-..." : isAnthropic ? "sk-ant-..." : "Paste your key here..."}
                  className="w-full p-3.5 pr-12 border border-[var(--color-border)] rounded-xl bg-[var(--color-cream-warm)] text-[var(--color-ink)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all placeholder:text-[var(--color-ink-muted)]"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 mt-1">
                <div className="flex items-start gap-3 p-3 bg-[var(--color-amber-light)] border border-[var(--color-amber)] rounded-xl">
                  <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
                    Bring Your Own Key (BYOK) allows you to use your own credits for unlimited, high-speed discovery.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 text-[10px] font-medium text-purple-600 dark:text-purple-400 underline underline-offset-2 mt-1">
                <Info className="w-3 h-3 shrink-0" />
                <a 
                  href={isAnthropic ? "https://console.anthropic.com/" : "https://aistudio.google.com/app/apikey"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Get a free {isAnthropic ? 'Anthropic' : 'Gemini'} API Key
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-[var(--color-border)] bg-[var(--color-cream)] shrink-0 flex gap-3 rounded-b-2xl">
            <button
              onClick={handleClear}
              className="px-4 py-2.5 border border-[var(--color-border)] text-xs font-semibold text-red-500 bg-[var(--color-cream)] rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Key
            </button>
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] text-xs font-semibold rounded-xl border border-[var(--color-ink)] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              {isSaved ? "Configuration Saved!" : "Apply Intelligence Tier"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function Brain(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.105V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a4 4 0 0 0 .52-8.105 4 4 0 0 0-2.527-5.77A3 3 0 1 0 12 5z" />
      <path d="M12 5v14" />
      <path d="M7 13h10" />
    </svg>
  );
}
