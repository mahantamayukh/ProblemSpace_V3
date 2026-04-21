export interface ModelConfig {
  id: string;
  name: string;
  provider: 'google' | 'anthropic' | 'universal';
  version: string;
  description: string;
  reasoningScore: number; // 0 (Fastest) to 100 (Deepest Reasoning)
}

export const MODELS: ModelConfig[] = [
  { 
    id: 'gemini-1.5-flash', 
    name: 'Rapid Pulse', 
    provider: 'google', 
    version: '1.5 Flash', 
    description: 'Ultra-fast, lightweight discovery. Best for rapid iteration.',
    reasoningScore: 10
  },
  { 
    id: 'gemini-2.0-flash', 
    name: 'Neural Flash', 
    provider: 'google', 
    version: '2.0 Flash', 
    description: 'Balanced speed and intelligence. The optimal default.',
    reasoningScore: 40
  },
  { 
    id: 'gemini-1.5-pro', 
    name: 'Strategic Alpha', 
    provider: 'google', 
    version: '1.5 Pro', 
    description: 'Deep reasoning & long context. Finds complex connections.',
    reasoningScore: 75
  },
  { 
    id: 'gemini-2.0-pro-exp-02-05', 
    name: 'Pro Architect', 
    provider: 'google', 
    version: '2.0 Pro', 
    description: 'Maximum reasoning power. The ultimate problem solver.',
    reasoningScore: 100
  },
  { 
    id: 'claude-3-5-sonnet-latest', 
    name: 'Sonnet Catalyst', 
    provider: 'anthropic', 
    version: '3.5 Sonnet', 
    description: 'Highly creative and nuanced reasoning with visual talent.',
    reasoningScore: 85
  },
  { 
    id: 'claude-3-5-haiku-latest', 
    name: 'Haiku Sprint', 
    provider: 'anthropic', 
    version: '3.5 Haiku', 
    description: 'Instant, efficient feedback. Great for simple tasks.',
    reasoningScore: 20
  },
  { 
    id: 'universal', 
    name: 'Universal Link', 
    provider: 'universal', 
    version: 'Any', 
    description: 'Custom endpoint. Capability depends on your backend.',
    reasoningScore: 50
  },
];

export const getModelById = (id: string) => MODELS.find(m => m.id === id) || MODELS[1];

export const getModelByScore = (score: number) => {
  // Find the closest model to the reasoning score (Google models only for standard slider)
  const available = MODELS.filter(m => m.provider === 'google');
  return available.reduce((prev, curr) => {
    return (Math.abs(curr.reasoningScore - score) < Math.abs(prev.reasoningScore - score) ? curr : prev);
  });
};
