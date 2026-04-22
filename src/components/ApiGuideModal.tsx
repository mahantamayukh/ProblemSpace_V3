import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ShieldCheck, Info, Sparkles, Filter, Globe, Zap } from 'lucide-react';

interface ApiModel {
  id: string;
  type?: 'Free' | 'Paid';
}

interface ApiProvider {
  name: string;
  type: 'Free' | 'Paid' | 'Freemium'; // Summary for filtering
  category: 'Frontier' | 'Inference' | 'Aggregator';
  usageScore: number; // 0-100
  internetHypeScore: number; // 0-100
  baseUrl: string;
  modelIds: ApiModel[];
  keyUrl: string;
  docsUrl: string;
  description: string;
}

const PROVIDERS: ApiProvider[] = [
  // Frontier Labs
  {
    name: 'Google Gemini',
    type: 'Freemium',
    category: 'Frontier',
    usageScore: 95,
    internetHypeScore: 92,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    modelIds: [
      { id: 'gemini-2.0-flash' },
      { id: 'gemini-1.5-flash' },
      { id: 'gemini-1.5-pro', type: 'Paid' }
    ],
    keyUrl: 'https://aistudio.google.com/app/apikey',
    docsUrl: 'https://ai.google.dev/models/gemini',
    description: 'Leader in multi-modal and long-context (2M+ tokens). Gemini 2.0 Flash is currently peak meta for speed/logic.'
  },
  {
    name: 'OpenAI',
    type: 'Paid',
    category: 'Frontier',
    usageScore: 98,
    internetHypeScore: 90,
    baseUrl: 'https://api.openai.com/v1',
    modelIds: [
      { id: 'gpt-4o', type: 'Paid' },
      { id: 'gpt-4o-mini', type: 'Paid' },
      { id: 'o1-preview', type: 'Paid' }
    ],
    keyUrl: 'https://platform.openai.com/api-keys',
    docsUrl: 'https://platform.openai.com/docs/models',
    description: 'The industry standard. o1 models provide unprecedented reasoning capabilities for complex nodes.'
  },
  {
    name: 'Anthropic Claude',
    type: 'Paid',
    category: 'Frontier',
    usageScore: 90,
    internetHypeScore: 95,
    baseUrl: 'https://api.anthropic.com/v1',
    modelIds: [
      { id: 'claude-3-5-sonnet-latest', type: 'Paid' },
      { id: 'claude-3-5-haiku-latest', type: 'Paid' }
    ],
    keyUrl: 'https://console.anthropic.com/',
    docsUrl: 'https://docs.anthropic.com/en/docs/about-claude/models',
    description: 'The developer favorite for coding and structured reasoning. Best-in-class tool use.'
  },
  {
    name: 'xAI (Grok)',
    type: 'Paid',
    category: 'Frontier',
    usageScore: 45,
    internetHypeScore: 85,
    baseUrl: 'https://api.x.ai/v1',
    modelIds: [
      { id: 'grok-2-latest', type: 'Paid' },
      { id: 'grok-beta', type: 'Paid' }
    ],
    keyUrl: 'https://console.x.ai/',
    docsUrl: 'https://docs.x.ai/',
    description: 'Real-time data access and unique personality. Grok-2 is highly competitive with top-tier models.'
  },

  // Inference Platforms
  {
    name: 'DeepSeek',
    type: 'Paid',
    category: 'Inference',
    usageScore: 88,
    internetHypeScore: 98,
    baseUrl: 'https://api.deepseek.com',
    modelIds: [
      { id: 'deepseek-chat', type: 'Paid' },
      { id: 'deepseek-reasoner', type: 'Paid' }
    ],
    keyUrl: 'https://platform.deepseek.com/api_keys',
    docsUrl: 'https://api-docs.deepseek.com/',
    description: 'Insane price-to-performance. DeepSeek-V3 and R1 are currently disrupting the entire market with sub-$1 pricing.'
  },
  {
    name: 'Groq',
    type: 'Free',
    category: 'Inference',
    usageScore: 82,
    internetHypeScore: 88,
    baseUrl: 'https://api.groq.com/openai/v1',
    modelIds: [
      { id: 'llama-3.3-70b-versatile', type: 'Free' },
      { id: 'llama-3.1-8b-instant', type: 'Free' },
      { id: 'mixtral-8x7b-32768', type: 'Free' }
    ],
    keyUrl: 'https://console.groq.com/keys',
    docsUrl: 'https://console.groq.com/docs/models',
    description: 'Zero-latency inference using LPU hardware. Currently offering a generous free beta tier.'
  },
  {
    name: 'Mistral AI',
    type: 'Freemium',
    category: 'Frontier',
    usageScore: 68,
    internetHypeScore: 78,
    baseUrl: 'https://api.mistral.ai/v1',
    modelIds: [
      { id: 'mistral-large-latest', type: 'Paid' },
      { id: 'pixtral-12b-2409' },
      { id: 'mistral-small-latest' }
    ],
    keyUrl: 'https://console.mistral.ai/api-keys/',
    docsUrl: 'https://docs.mistral.ai/platform/endpoints/',
    description: 'The European frontier. High-quality open-weight models with a generous free tier for developer experimentation.'
  },
  {
    name: 'Perplexity',
    type: 'Paid',
    category: 'Inference',
    usageScore: 70,
    internetHypeScore: 82,
    baseUrl: 'https://api.perplexity.ai',
    modelIds: [
      { id: 'sonar-pro', type: 'Paid' },
      { id: 'sonar-reasoning', type: 'Paid' }
    ],
    keyUrl: 'https://www.perplexity.ai/settings/api',
    docsUrl: 'https://docs.perplexity.ai/',
    description: 'Search-augmented models. Perfect for nodes that require real-time web grounding.'
  },
  {
    name: 'DeepSeek',
    type: 'Paid',
    category: 'Frontier',
    usageScore: 92,
    internetHypeScore: 98,
    baseUrl: 'https://api.deepseek.com',
    modelIds: [
      { id: 'deepseek-chat', type: 'Paid' },
      { id: 'deepseek-reasoner', type: 'Paid' }
    ],
    keyUrl: 'https://platform.deepseek.com/api_keys',
    docsUrl: 'https://api-docs.deepseek.com/',
    description: 'The world-leading frontier from China. DeepSeek-V3 and R1 rival the best models globally in coding and mathematics at a fraction of the cost.'
  },
  {
    name: 'Zhipu AI',
    type: 'Paid',
    category: 'Frontier',
    usageScore: 82,
    internetHypeScore: 75,
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    modelIds: [
      { id: 'glm-4', type: 'Paid' },
      { id: 'glm-4-flash', type: 'Paid' }
    ],
    keyUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
    docsUrl: 'https://open.bigmodel.cn/dev/api',
    description: 'Home of the ChatGLM series. One of the first Chinese providers to reach GPT-4 level performance in reasoning.'
  },
  {
    name: 'AliCloud (DashScope)',
    type: 'Paid',
    category: 'Frontier',
    usageScore: 85,
    internetHypeScore: 80,
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    modelIds: [
      { id: 'qwen-max', type: 'Paid' },
      { id: 'qwen-plus', type: 'Paid' },
      { id: 'qwen-turbo', type: 'Paid' }
    ],
    keyUrl: 'https://dashscope.console.aliyun.com/apiKey',
    docsUrl: 'https://help.aliyun.com/zh/dashscope/',
    description: 'Alibaba Cloud frontier. The Qwen series (Tongyi Qianwen) consistently tops open-source and proprietary leaderboards.'
  },
  {
    name: '01.AI',
    type: 'Paid',
    category: 'Frontier',
    usageScore: 78,
    internetHypeScore: 72,
    baseUrl: 'https://api.01.ai/v1',
    modelIds: [
      { id: 'yi-lightning', type: 'Paid' },
      { id: 'yi-large', type: 'Paid' }
    ],
    keyUrl: 'https://platform.01.ai/apikeys',
    docsUrl: 'https://platform.01.ai/docs',
    description: 'Founded by Kai-Fu Lee. The Yi-Lightning model offers exceptional multilingual performance and high-speed reasoning.'
  },
  {
    name: 'Moonshot AI',
    type: 'Paid',
    category: 'Frontier',
    usageScore: 70,
    internetHypeScore: 88,
    baseUrl: 'https://api.moonshot.cn/v1',
    modelIds: [
      { id: 'moonshot-v1-8k', type: 'Paid' },
      { id: 'moonshot-v1-32k', type: 'Paid' }
    ],
    keyUrl: 'https://platform.moonshot.cn/console/api-keys',
    docsUrl: 'https://platform.moonshot.cn/docs',
    description: 'Specialists in long-context intelligence. The Kimi series provides high-fidelity synthesis of massive datasets.'
  },
  {
    name: 'Together AI',
    type: 'Paid',
    category: 'Inference',
    usageScore: 55,
    internetHypeScore: 70,
    baseUrl: 'https://api.together.xyz/v1',
    modelIds: [
      { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', type: 'Paid' },
      { id: 'deepseek-ai/DeepSeek-V3', type: 'Paid' }
    ],
    keyUrl: 'https://api.together.xyz/settings/api-keys',
    docsUrl: 'https://docs.together.ai/docs/inference-models',
    description: 'The playground for open-source. Over 100+ models available via a single API.'
  },
  {
    name: 'SiliconFlow',
    type: 'Freemium',
    category: 'Inference',
    usageScore: 40,
    internetHypeScore: 65,
    baseUrl: 'https://api.siliconflow.cn/v1',
    modelIds: [
      { id: 'deepseek-ai/DeepSeek-V3' },
      { id: 'deepseek-ai/DeepSeek-R1' },
      { id: 'THUDM/glm-4-9b-chat' }
    ],
    keyUrl: 'https://cloud.siliconflow.cn/account/ak',
    docsUrl: 'https://docs.siliconflow.cn/',
    description: 'Fast-growing platform offering unified inference for state-of-the-art Chinese and Global models.'
  },
  {
    name: 'Fireworks AI',
    type: 'Paid',
    category: 'Inference',
    usageScore: 42,
    internetHypeScore: 68,
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    modelIds: [
      { id: 'accounts/fireworks/models/llama-v3p3-70b-instruct', type: 'Paid' }
    ],
    keyUrl: 'https://fireworks.ai/account/api-keys',
    docsUrl: 'https://docs.fireworks.ai/models/',
    description: 'Highly optimized for speed and throughput. Excellent support for multimodal models.'
  },
  {
    name: 'Cerebras',
    type: 'Paid',
    category: 'Inference',
    usageScore: 60,
    internetHypeScore: 85,
    baseUrl: 'https://api.cerebras.ai/v1',
    modelIds: [
      { id: 'llama3.1-70b', type: 'Paid' },
      { id: 'llama3.1-8b', type: 'Paid' }
    ],
    keyUrl: 'https://cloud.cerebras.ai/',
    docsUrl: 'https://sdk.cerebras.ai/',
    description: 'The world fastest inference. Cerebras Wafer-Scale Engine (WSE) delivers unprecedented token-per-second performance.'
  },
  {
    name: 'SambaNova',
    type: 'Freemium',
    category: 'Inference',
    usageScore: 35,
    internetHypeScore: 60,
    baseUrl: 'https://api.sambanova.ai/v1',
    modelIds: [
      { id: 'llama-3.1-405b-instruct' },
      { id: 'llama-3.1-70b-instruct' }
    ],
    keyUrl: 'https://cloud.sambanova.ai/',
    docsUrl: 'https://docs.sambanova.ai/',
    description: 'Next-gen AI chips (RDU) providing ultra-fast inference for the largest open-source models.'
  },
  {
    name: 'Replicate',
    type: 'Paid',
    category: 'Inference',
    usageScore: 75,
    internetHypeScore: 82,
    baseUrl: 'https://api.replicate.com/v1',
    modelIds: [
      { id: 'meta/llama-2-70b-chat', type: 'Paid' },
      { id: 'mistralai/mixtral-8x7b-instruct-v0.1', type: 'Paid' }
    ],
    keyUrl: 'https://replicate.com/account/api-tokens',
    docsUrl: 'https://replicate.com/docs',
    description: 'Run machine learning models in the cloud with a few lines of code. Massive library of vision and text models.'
  },
  {
    name: 'Cohere',
    type: 'Paid',
    category: 'Frontier',
    usageScore: 50,
    internetHypeScore: 75,
    baseUrl: 'https://api.cohere.ai/v1',
    modelIds: [
      { id: 'command-r-plus', type: 'Paid' },
      { id: 'command-r', type: 'Paid' }
    ],
    keyUrl: 'https://dashboard.cohere.com/api-keys',
    docsUrl: 'https://docs.cohere.com/',
    description: 'Enterprise-grade LLMs specialized in RAG, search, and multilingual applications.'
  },
  {
    name: 'Upstage',
    type: 'Paid',
    category: 'Frontier',
    usageScore: 30,
    internetHypeScore: 55,
    baseUrl: 'https://api.upstage.ai/v1/solar',
    modelIds: [
      { id: 'solar-pro', type: 'Paid' },
      { id: 'solar-mini', type: 'Paid' }
    ],
    keyUrl: 'https://console.upstage.ai/',
    docsUrl: 'https://developers.upstage.ai/',
    description: 'Home of the Solar model. Optimized for document AI and reasoning performance.'
  },

  // Aggregators
  {
    name: 'OpenRouter',
    type: 'Freemium',
    category: 'Aggregator',
    usageScore: 85,
    internetHypeScore: 94,
    baseUrl: 'https://openrouter.ai/api/v1',
    modelIds: [
      { id: 'google/gemini-2.0-flash-exp:free', type: 'Free' },
      { id: 'meta-llama/llama-3.3-70b-instruct:free', type: 'Free' },
      { id: 'mistralai/mistral-7b-instruct:free', type: 'Free' }
    ],
    keyUrl: 'https://openrouter.ai/keys',
    docsUrl: 'https://openrouter.ai/models',
    description: 'The "Everything API". Unified access to almost every model in existence.'
  }
];

// Deterministic Daily Fluctuation Logic
const getDailySeed = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

const seededRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
};

const getAdjustedScore = (baseScore: number, providerName: string, type: 'usage' | 'hype') => {
  const seed = `${getDailySeed()}-${providerName}-${type}`;
  const variance = (seededRandom(seed) - 0.5) * 8;
  return Math.round(Math.min(100, Math.max(0, baseScore + variance)));
};

export default function ApiGuideModal({ onClose }: { onClose: () => void }) {
  const [liveHypeBoosts, setLiveHypeBoosts] = React.useState<Record<string, number>>({});
  const [filterCategory, setFilterCategory] = React.useState<'All' | 'Frontier' | 'Inference' | 'Aggregator'>('All');
  const [filterType, setFilterType] = React.useState<'All' | 'Free' | 'Paid' | 'Freemium'>('All');

  React.useEffect(() => {
    const fetchLiveHype = async () => {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/models');
        const data = await response.json();
        if (data.data) {
          const boosts: Record<string, number> = {};
          data.data.forEach((m: any) => {
            const providerPrefix = m.id.split('/')[0];
            boosts[providerPrefix] = (boosts[providerPrefix] || 0) + 1;
          });
          setLiveHypeBoosts(boosts);
        }
      } catch (e) {
        console.error('Failed to fetch live hype', e);
      }
    };
    fetchLiveHype();
  }, []);

  const rankedProviders = React.useMemo(() => {
    return [...PROVIDERS].map(p => {
      const providerSlug = p.name.toLowerCase().split(' ')[0];
      const liveBoost = (liveHypeBoosts[providerSlug] || 0) * 0.5;
      const usage = getAdjustedScore(p.usageScore, p.name, 'usage');
      const hype = Math.min(100, getAdjustedScore(p.internetHypeScore, p.name, 'hype') + liveBoost);
      return { ...p, usageScore: usage, internetHypeScore: hype };
    }).sort((a, b) => (b.usageScore + b.internetHypeScore) - (a.usageScore + a.internetHypeScore));
  }, [liveHypeBoosts]);

  const filteredProviders = rankedProviders.filter(p => {
    const categoryMatch = filterCategory === 'All' || p.category === filterCategory;
    const typeMatch = filterType === 'All' || p.type === filterType;
    return categoryMatch && typeMatch;
  });

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-3xl bg-[var(--color-cream)] border border-[var(--color-border)] shadow-2xl rounded-3xl overflow-hidden z-10 flex flex-col h-[90vh]">
        <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-cream-warm)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--color-ink)]">API Guide</h2>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1 font-medium">Frontier models & technical endpoints</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--color-cream-deep)] rounded-xl transition-all"><X className="w-5 h-5 text-[var(--color-ink-muted)]" /></button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-64 border-r border-[var(--color-border)] bg-[var(--color-cream-warm)] p-6 space-y-8 overflow-y-auto shrink-0">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ink-muted)] flex items-center gap-2 px-1"><Filter className="w-3 h-3" /> Provider Type</h3>
              <div className="space-y-1">
                {(['All', 'Frontier', 'Inference', 'Aggregator'] as const).map(cat => (
                  <button key={cat} onClick={() => setFilterCategory(cat)} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${filterCategory === cat ? 'bg-[var(--color-ink)] text-[var(--color-cream)] shadow-md' : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-cream-deep)]'}`}>{cat}</button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ink-muted)] flex items-center gap-2 px-1"><ShieldCheck className="w-3 h-3" /> Pricing Model</h3>
              <div className="space-y-1">
                {(['All', 'Free', 'Freemium', 'Paid'] as const).map(type => (
                  <button key={type} onClick={() => setFilterType(type)} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${filterType === type ? 'bg-[var(--color-ink)] text-[var(--color-cream)] shadow-md' : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-cream-deep)]'}`}>{type}</button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--color-border)] space-y-5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ink-muted)] flex items-center gap-2 px-1"><Zap className="w-3 h-3" /> BYOK Essentials</h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-[var(--color-ink)] uppercase">1. API Key</p>
                  <p className="text-[10px] text-[var(--color-ink-muted)] leading-relaxed">Your personal access token. It authenticates requests and manages billing directly with the provider.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-[var(--color-ink)] uppercase">2. Base URL</p>
                  <p className="text-[10px] text-[var(--color-ink-muted)] leading-relaxed">The digital endpoint address. Ensures requests are routed to the correct provider's inference hardware.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-[var(--color-ink)] uppercase">3. Model ID</p>
                  <p className="text-[10px] text-[var(--color-ink-muted)] leading-relaxed">The specific AI version (e.g. gpt-4o). Controls the intelligence level and context window of your nodes.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--color-border)]">
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-2">Live Insights</p>
                <p className="text-[10px] font-medium text-blue-800/60 leading-relaxed">Ranking is updated in real-time based on OpenRouter availability and daily community sentiment.</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[var(--color-cream)]">
            <div className="grid gap-4">
              {filteredProviders.length > 0 ? filteredProviders.map((p) => (
                <ApiProviderCard key={p.name} provider={p} globalRank={rankedProviders.indexOf(p) + 1} />
              )) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-[var(--color-cream-warm)] border border-[var(--color-border)] rounded-full flex items-center justify-center mx-auto"><Info className="w-6 h-6 text-[var(--color-ink-muted)] opacity-30" /></div>
                  <h3 className="text-sm font-bold text-[var(--color-ink)]">No providers match these filters</h3>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-cream-warm)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[var(--color-ink-muted)]"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span className="text-[10px] font-bold uppercase tracking-widest">BYOK Privacy Standard</span></div>
          <button onClick={onClose} className="px-10 py-3 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-[var(--color-lavender)] transition-all">Close API Guide</button>
        </div>
      </motion.div>
    </div>
  );
}

function ApiProviderCard({ provider: p, globalRank }: { provider: any; globalRank: number }) {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const totalScore = p.usageScore + p.internetHypeScore;

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setShowTooltip(true);
  };
  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => setShowTooltip(false), 500);
  };
  React.useEffect(() => () => { if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current); }, []);

  return (
    <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-cream-warm)] hover:border-[var(--color-lavender)] transition-all relative overflow-hidden flex gap-5 shadow-sm">
      <div className="flex flex-col items-center justify-start pt-1 shrink-0 w-8">
        <span className="text-2xl font-black text-[var(--color-ink-muted)] opacity-20 tabular-nums">{globalRank}</span>
        <div className="w-0.5 h-full bg-[var(--color-border)] rounded-full mt-2 opacity-50" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="absolute top-0 right-0 p-4">
          <a href={p.docsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[var(--color-lavender)] hover:underline opacity-40 hover:opacity-100 transition-opacity">Docs <ExternalLink className="w-3 h-3" /></a>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h4 className="text-base font-bold text-[var(--color-ink)] truncate">{p.name}</h4>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${p.type === 'Free' ? 'bg-emerald-100 text-emerald-700' : p.type === 'Freemium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{p.type}</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-ink-muted)] opacity-40">• {p.category}</span>
            </div>
          </div>
        </div>
        <p className="text-[11px] font-medium text-[var(--color-ink-light)] mb-3 leading-relaxed line-clamp-2">{p.description}</p>

        {/* Dedicated Endpoint Section */}
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[var(--color-cream-deep)] border border-[var(--color-border)] rounded-xl group/url hover:border-[var(--color-lavender)] transition-all">
          <Globe className="w-3 h-3 text-[var(--color-lavender)] opacity-60" />
          <div className="flex flex-col">
            <span className="text-[7px] font-black uppercase tracking-widest text-[var(--color-ink-muted)] opacity-50">Endpoint URL</span>
            <span className="font-mono text-[9px] font-bold text-[var(--color-ink-muted)] break-all select-all">{p.baseUrl}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 relative">
          <div className="relative shrink-0 flex items-center h-8">
            <motion.div className="flex items-center gap-3 cursor-help" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              {!isScrolled ? (
                <motion.div
                  key="exp"
                  layoutId={`pill-${p.name}`}
                  className="flex items-center gap-3"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                >
                  <motion.div
                    layoutId={`ind-${p.name}`}
                    initial={{ width: 10 }}
                    animate={{ width: 128 }}
                    className="relative h-2 bg-[var(--color-border)] rounded-full overflow-hidden flex"
                  >
                    <div className="h-full bg-blue-500" style={{ width: `${(p.usageScore / 200) * 100}%` }} />
                    <div className="h-full bg-amber-500" style={{ width: `${(p.internetHypeScore / 200) * 100}%` }} />
                  </motion.div>
                  <motion.span
                    layoutId={`txt-${p.name}`}
                    className="font-black text-[10px] text-[var(--color-ink)] tabular-nums shrink-0"
                  >
                    {Math.round(totalScore / 2)}
                  </motion.span>
                </motion.div>
              ) : (
                <motion.div
                  key="col"
                  layoutId={`pill-${p.name}`}
                  className="flex items-center gap-2 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-lg"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                >
                  <motion.div layoutId={`ind-${p.name}`} className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
                  <motion.span layoutId={`txt-${p.name}`} className="font-black text-xs text-blue-600 tabular-nums shrink-0">{Math.round(totalScore / 2)}</motion.span>
                </motion.div>
              )}
            </motion.div>

            <AnimatePresence>
              {showTooltip && (
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 5 }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="absolute bottom-full left-0 mb-3 z-50 pointer-events-auto origin-bottom-left">
                  <div className="bg-[#1a1a1a] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex flex-col gap-2 min-w-[200px]">
                    <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-widest text-white/90">Engagement-Quality Index</span><Sparkles className="w-3 h-3 text-amber-400" /></div>
                    <div className="flex flex-col gap-1.5 pt-1 border-t border-white/10">
                      <div className="flex justify-between items-center"><span className="text-[9px] text-white/50">Usage</span><span className="text-[9px] font-black text-blue-400">{p.usageScore}%</span></div>
                      <div className="flex justify-between items-center"><span className="text-[9px] text-white/50">Hype</span><span className="text-[9px] font-black text-amber-400">{p.internetHypeScore}%</span></div>
                    </div>
                    <div className="absolute -bottom-1 left-6 w-2 h-2 bg-[#1a1a1a] rotate-45" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 overflow-hidden relative flex items-center h-8">
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--color-cream-warm)] to-transparent z-10 pointer-events-none" />
            <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x scroll-smooth w-full" onScroll={(e) => {
              const target = e.target as HTMLDivElement;
              if (target.scrollLeft > 5) setIsScrolled(true);
              else setIsScrolled(false);
            }}>
              {p.modelIds.map((model: any) => (
                <motion.div key={model.id} whileHover={{ y: -1 }} className="flex items-center gap-2 px-3 py-1 bg-[var(--color-cream)] border border-[var(--color-border)] rounded-xl shrink-0 snap-start shadow-sm hover:border-[var(--color-lavender)] transition-all">
                  <span className="font-mono text-[9px] font-bold text-[var(--color-ink)]">{model.id}</span>
                  <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md ${model.type === 'Free' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>{model.type}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
