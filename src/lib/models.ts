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
    name: 'Gemini 1.5 Flash', 
    provider: 'google', 
    version: '1.5 Flash', 
    description: 'Fast, lightweight processing. Best for quick iterations.',
    reasoningScore: 10
  },
  { 
    id: 'gemini-2.0-flash', 
    name: 'Gemini 2.0 Flash', 
    provider: 'google', 
    version: '2.0 Flash', 
    description: 'Balanced speed and intelligence. The optimal default.',
    reasoningScore: 40
  },
  { 
    id: 'gemini-1.5-pro', 
    name: 'Gemini 1.5 Pro', 
    provider: 'google', 
    version: '1.5 Pro', 
    description: 'Deep reasoning & long context. Finds complex connections.',
    reasoningScore: 75
  },
  { 
    id: 'gemini-2.0-pro-exp-02-05', 
    name: 'Gemini 2.0 Pro (Exp)', 
    provider: 'google', 
    version: '2.0 Pro', 
    description: 'Maximum reasoning power. The ultimate problem solver.',
    reasoningScore: 100
  },
  { 
    id: 'claude-3-5-sonnet-latest', 
    name: 'Claude 3.5 Sonnet', 
    provider: 'anthropic', 
    version: '3.5 Sonnet', 
    description: 'Highly nuanced reasoning with creative flair.',
    reasoningScore: 85
  },
  { 
    id: 'claude-3-5-haiku-latest', 
    name: 'Claude 3.5 Haiku', 
    provider: 'anthropic', 
    version: '3.5 Haiku', 
    description: 'Instant, efficient feedback for simple tasks.',
    reasoningScore: 20
  },
  { 
    id: 'universal', 
    name: 'Universal API Link', 
    provider: 'universal', 
    version: 'Any', 
    description: 'Connect to any OpenAI-compatible custom endpoint.',
    reasoningScore: 50
  },
];

export const getModelById = (id: string) => MODELS.find(m => m.id === id) || MODELS[1];
