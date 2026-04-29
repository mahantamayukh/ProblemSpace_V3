import { useState, useRef, useCallback } from 'react';
import UserProfileDropdown from './UserProfileDropdown';
import { ArrowRight, Sparkles, Diamond, Search, Moon, Sun, Zap, HelpCircle, Footprints, Compass, Lightbulb, TrendingDown, Target, History, ShieldCheck, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EtheralShadow } from './ui/etheral-shadow';
import IntelligenceHubModal from './IntelligenceHubModal';
import ApiGuideModal from './ApiGuideModal';

interface WorkspaceConfig {
  frequency: number;
  model: string;
}

export default function LandingPage({ onStart, isDarkMode, toggleDarkMode }: { onStart: (config: WorkspaceConfig) => void, isDarkMode: boolean, toggleDarkMode: () => void }) {
  const [showConfig, setShowConfig] = useState(false);
  const [frequency, setFrequency] = useState(10);
  const [model, setModel] = useState('gemini-2.0-flash');
  const [showApiGuide, setShowApiGuide] = useState(false);

  const handleStartRequest = () => {
    const isComplete = localStorage.getItem('problemspace-setup-complete') === 'true';
    if (isComplete) {
      // Pull existing config from localStorage if available, or use current component state
      const savedFreq = localStorage.getItem('problemspace-summary-freq');
      const savedModel = localStorage.getItem('problemspace-ai-model');
      onStart({ 
        frequency: savedFreq ? Number(savedFreq) : frequency, 
        model: savedModel || model 
      });
    } else {
      setShowConfig(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--color-cream)] text-[var(--color-ink)] font-sans flex flex-col relative overflow-hidden transition-colors">
      {/* Global dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 z-[0]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--color-border-hover) 1.5px, transparent 1.5px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-[var(--color-border)] bg-[var(--color-cream)]/80 backdrop-blur-md relative z-10 transition-colors">
        <div className="flex items-center gap-2 cursor-default select-none ml-2">
          <div className="flex items-center text-xl leading-none transition-transform hover:scale-[1.02]">
            <span className="font-sans font-bold text-[#E05D36]">PS</span>
            <span className="font-sans font-bold text-neutral-300 dark:text-neutral-600 mx-1.5 -translate-y-0.5">/</span>
            <span className="font-mono font-medium text-[var(--color-ink)] tracking-tight">problemspace</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowApiGuide(true)} 
            className="px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--color-cream-warm)] transition-all flex items-center gap-2"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[var(--color-lavender)]" />
            API Guide
          </button>
          <button onClick={toggleDarkMode} className="w-9 h-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] flex items-center justify-center hover:bg-[var(--color-cream-warm)] hover:shadow-sm transition-all">
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <UserProfileDropdown />
        </div>
      </header>

      {/* Hero */}
      <main className={`flex-1 flex flex-col relative z-10 w-full min-h-[100vh] overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-neutral-950' : 'bg-[var(--color-cream)]'}`}>
        <EtheralShadow
          color={isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(100, 100, 90, 0.15)"}
          animation={{ scale: 100, speed: 45 }}
          noise={{ opacity: 0.3, scale: 1.2 }}
          className="w-full h-full min-h-[100vh]"
        >
          <div className="max-w-4xl mx-auto space-y-8 px-6 pt-24 pb-32">
            <div className={`inline-flex items-center gap-2 px-4 py-2 backdrop-blur-sm border rounded-full text-sm font-medium mb-4 shadow-sm transition-all mx-auto relative z-30 ${
              isDarkMode 
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20' 
                : 'bg-[var(--color-lavender-light)]/80 border-[var(--color-lavender)] text-purple-700 hover:bg-[var(--color-lavender-light)]'
            }`}>
              <Zap className="w-3.5 h-3.5" />
              <span>Problem Discovery & Brainstorming</span>
            </div>

            <h1 className={`text-5xl md:text-8xl font-sans font-bold tracking-tight leading-[1.1] relative z-30 drop-shadow-sm transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-[var(--color-ink)]'}`}>
              Untangle the <br />
              <span className={`font-mono font-medium tracking-tight ${isDarkMode ? 'text-neutral-400' : 'text-[var(--color-ink-light)]'}`}>problemspace.</span>
            </h1>

            <p className={`text-base md:text-xl max-w-2xl leading-relaxed mx-auto relative z-30 transition-colors duration-500 ${isDarkMode ? 'text-neutral-400' : 'text-[var(--color-ink-light)]'}`}>
              A flexible visual workspace built for <span className={`${isDarkMode ? 'text-white' : 'text-[var(--color-ink)]'} font-semibold`}>blindspot discovery</span>, <span className={`${isDarkMode ? 'text-white' : 'text-[var(--color-ink)]'} font-semibold`}>team alignment</span>, and <span className={`${isDarkMode ? 'text-white' : 'text-[var(--color-ink)]'} font-semibold`}>decision clarity</span>. Untangle your problems before you build.
            </p>

            <div className="pt-8 relative z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleStartRequest();
                }}
                className={`group relative inline-flex items-center justify-center gap-3 px-10 py-5 font-semibold rounded-2xl border transition-all active:translate-y-0 text-lg ${
                  isDarkMode 
                    ? 'bg-white text-black border-white shadow-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:-translate-y-1' 
                    : 'bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)] shadow-xl hover:shadow-2xl hover:-translate-y-1'
                }`}
              >
                <span>Initialize Workspace</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </EtheralShadow>
      </main>

      {/* Feature Cards */}
      <div className="mt-24 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Understand Card */}
          <div className="p-8 bg-[var(--color-cream)] border border-[var(--color-border)] rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-[var(--color-sky-light)] border border-[var(--color-sky)] flex items-center justify-center">
                <Search className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Understand The Context</h3>
              </div>
            </div>
            <p className="text-sm text-[var(--color-ink-light)] leading-relaxed mb-6">
              Deconstruct the mess. Identify pain points, core actors, and hidden constraints that define your problem.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: User, label: 'Actor Mapping' },
                { icon: HelpCircle, label: 'Core Questions' },
                { icon: Footprints, label: 'Journey Flows' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-ink-muted)] bg-[var(--color-cream-warm)]">
                  <Icon className="w-3 h-3" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Explore Card */}
          <div className="p-8 bg-[var(--color-cream)] border border-[var(--color-border)] rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-[var(--color-sage-light)] border border-[var(--color-sage)] flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Explore the Possibilities</h3>
              </div>
            </div>
            <p className="text-sm text-[var(--color-ink-light)] leading-relaxed mb-6">
              Don't just jump to solutions. Iterate on multiple concepts and align on the highest impact direction.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Zap, label: 'Rapid Ideation' },
                { icon: Diamond, label: 'Assumption Checks' },
                { icon: Compass, label: 'Metric Alignment' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-ink-muted)] bg-[var(--color-cream-warm)]">
                  <Icon className="w-3 h-3" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-20 max-w-4xl mx-auto w-full text-left">
        <h2 className="text-2xl font-semibold tracking-tight text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-[var(--color-border)] bg-[var(--color-cream)] rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-ink)] text-[var(--color-cream)] flex items-center justify-center text-sm font-semibold mb-4 shadow-sm">1</div>
            <h3 className="font-semibold text-sm tracking-tight mb-2">Visualize your thoughts</h3>
            <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
              Dump your raw ideas, user pain points, and business requirements onto an infinite spatial canvas.
            </p>
          </div>
          <div className="p-6 border border-[var(--color-border)] bg-[var(--color-cream)] rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-ink)] text-[var(--color-cream)] flex items-center justify-center text-sm font-semibold mb-4 shadow-sm">2</div>
            <h3 className="font-semibold text-sm tracking-tight mb-2">Synthesize with AI</h3>
            <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
              Our AI partner help you find the signals in the noise, automatically categorizing insights and suggesting blindspots.
            </p>
          </div>
          <div className="p-6 border border-[var(--color-border)] bg-[var(--color-cream)] rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-ink)] text-[var(--color-cream)] flex items-center justify-center text-sm font-semibold mb-4 shadow-sm">3</div>
            <h3 className="font-semibold text-sm tracking-tight mb-2">Align & Decide</h3>
            <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
              Share your clear, mapped problem space with the team to get direct buy-in before investing in execution.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      <AnimatePresence>
        {showConfig && (
          <IntelligenceHubModal
            isFirstTime={true}
            initialConfig={{
              model: model,
              frequency: frequency,
              geminiKey: typeof window !== 'undefined' ? localStorage.getItem('problemspace-user-api-key') || '' : '',
              anthropicKey: typeof window !== 'undefined' ? localStorage.getItem('problemspace-anthropic-api-key') || '' : '',
              customBaseUrl: typeof window !== 'undefined' ? localStorage.getItem('problemspace-custom-base-url') || 'https://api.openai.com/v1' : 'https://api.openai.com/v1',
              customModelName: typeof window !== 'undefined' ? localStorage.getItem('problemspace-custom-model-name') || 'gpt-4o' : 'gpt-4o',
              universalKey: typeof window !== 'undefined' ? localStorage.getItem('problemspace-universal-api-key') || '' : ''
            }}
            onSave={(config) => {
              setShowConfig(false);
              onStart(config as any);
            }}
            onClose={() => setShowConfig(false)}
          />
        )}
        {showApiGuide && (
          <ApiGuideModal onClose={() => setShowApiGuide(false)} />
        )}
      </AnimatePresence>

      <footer className="p-6 border-t border-[var(--color-border)] bg-[var(--color-cream)]/80 backdrop-blur-sm text-center text-xs font-medium text-[var(--color-ink-muted)] relative z-10 transition-colors tracking-wide">
        <p>ProblemSpace · Agnostic Discovery Tool · Clarity Before Code</p>
      </footer>
    </div>
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
