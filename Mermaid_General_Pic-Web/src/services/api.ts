import axios from 'axios';
import { config } from '../config/config';

interface GenerateAiResponse {
  code: string;
  conversationId: string;
}

interface GenerateAiSettings {
  model: string;
  conversationId?: string;
}

export const api = {
  async getFormats() {
    const response = await axios.get(`${config.apiBaseUrl}/api/mermaid/formats`);
    return response.data;
  },

  async convert(
    code: string,
    format: string = 'png',
    dpi: number = 300,
    theme: string = 'default',
    background: string = 'white'
  ): Promise<Blob> {
    const response = await axios.post(
      `${config.apiBaseUrl}/api/mermaid/convert`,
      {
        code,
        format,
        dpi,
        theme,
        background
      },
      {
        responseType: 'blob'
      }
    );
    return response.data;
  },

  async generateFromAi(prompt: string, settings: GenerateAiSettings): Promise<GenerateAiResponse> {
    const response = await axios.post(
      `${config.apiBaseUrl}/api/kimi/generate`,
      {
        prompt,
        model: settings.model,
        conversationId: settings.conversationId
      }
    );
    return response.data;
  }
}; 