export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  code?: string;
}

export interface ModelConfig {
  name: string;
  apiKey: string;
  model?: string;
}

export interface AiModelSettings {
  selectedModel: string;
  modelConfigs: Record<string, ModelConfig>;
}

export const AI_MODELS = {
  KIMI: 'kimi',
  DEEPSEEK: 'deepseek'
} as const;

export type AiModel = (typeof AI_MODELS)[keyof typeof AI_MODELS];

export const KIMI_MODELS = {
  'moonshot-v1-8k': 'Moonshot v1 8K',
  'moonshot-v1-32k': 'Moonshot v1 32K',
  'moonshot-v1-128k': 'Moonshot v1 128K'
} as const;

export type KimiModel = keyof typeof KIMI_MODELS; 