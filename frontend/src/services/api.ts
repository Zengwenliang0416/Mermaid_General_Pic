import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface ConvertResponse {
  url: string;
}

export interface FormatsResponse {
  formats: string[];
  dpi: {
    min: number;
    max: number;
    default: number;
  };
  themes: string[];
  backgrounds: string[];
}

export const api = {
  async convert(
    code: string, 
    format: string = 'png', 
    dpi: number = 300,
    theme: string = 'default',
    background: string = 'transparent'
  ): Promise<ConvertResponse> {
    const response = await axios.post(`${API_BASE_URL}/convert`, {
      code,
      format,
      dpi,
      theme,
      background
    });
    return response.data;
  },

  async upload(
    file: File, 
    format: string = 'png', 
    dpi: number = 300,
    theme: string = 'default',
    background: string = 'transparent'
  ): Promise<ConvertResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    formData.append('dpi', String(dpi));
    formData.append('theme', theme);
    formData.append('background', background);

    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async getFormats(): Promise<FormatsResponse> {
    const response = await axios.get(`${API_BASE_URL}/formats`);
    return response.data;
  }
}; 