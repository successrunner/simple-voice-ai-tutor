import { Provider } from '@/types/model.type';

export const AVAILABLE_PROVIDERS: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'OpenAI',
        description: 'Powerful foundation model for general tasks and reasoning',
        strengths: 'Reliable performance, reasoning, general capabilities',
      },
      {
        id: 'gpt-4.1',
        name: 'GPT-4.1',
        provider: 'OpenAI',
        description: 'Enhanced version of GPT-4 with improved capabilities',
        strengths: 'Enhanced reasoning, better context understanding',
      },
      {
        id: 'gpt-4.5-preview',
        name: 'GPT-4.5 Preview',
        provider: 'OpenAI',
        description: 'Preview of next-generation GPT model with advanced features',
        strengths: 'Cutting-edge capabilities, experimental features',
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: 'Optimized version of GPT-4 for improved performance',
        strengths: 'Speed optimization, efficiency, balanced capabilities',
      },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    models: [
      {
        id: 'gemini-2.5-flash-preview-05-20',
        name: 'Gemini 2.5 Flash Preview',
        provider: 'Google',
        description: "Latest preview of Gemini's high-speed model",
        strengths: 'Cutting-edge speed, latest optimizations',
      },
      {
        id: 'gemini-2.5-pro-preview-05-06',
        name: 'Gemini 2.5 Pro Preview',
        provider: 'Google',
        description: "Advanced preview of Gemini's professional-grade model",
        strengths: 'Next-gen capabilities, complex task handling',
      },
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'Google',
        description: 'High-speed model optimized for quick responses',
        strengths: 'Fast processing, efficient task handling',
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'Google',
        description: 'Professional-grade model for complex tasks',
        strengths: 'Reliable performance, advanced reasoning',
      },
    ],
  },
];
