import axios from 'axios';
import type { AiModel } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface GenerateAiSettings {
  model: AiModel;
  conversationId?: string;
  apiKey: string;
  kimiModel?: string;
}

interface GenerateAiResponse {
  code: string;
  conversationId: string;
}

interface FormatsResponse {
  formats: string[];
  themes: string[];
  backgrounds: string[];
  dpiRange: {
    min: number;
    max: number;
    default: number;
  };
}

export const api = {
  async getFormats(): Promise<FormatsResponse> {
    const response = await axios.get(`${BASE_URL}/api/mermaid/formats`);
    return response.data;
  },

  async convert(
    code: string,
    format: string = 'svg',
    dpi: number = 300,
    theme: string = 'default',
    background: string = 'transparent'
  ): Promise<Blob> {
    const response = await axios.post(
      `${BASE_URL}/api/mermaid/convert`,
      { code, format, dpi, theme, background },
      { responseType: 'blob' }
    );
    return response.data;
  },

  async generateFromAi(prompt: string, settings: GenerateAiSettings): Promise<GenerateAiResponse> {
    const response = await axios.post(`${BASE_URL}/api/kimi/generate`, {
      prompt,
      model: settings.model,
      conversationId: settings.conversationId,
      apiKey: settings.apiKey,
      kimiModel: settings.kimiModel
    });
    return response.data;
  }
}; 