import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { api } from '../services/api';

export interface ConversionHistory {
  code: string;
  format: string;
  dpi: number;
  theme: string;
  background: string;
  timestamp: number;
  url?: string;
}

// Load initial state from localStorage
const loadState = () => {
  try {
    const savedCode = localStorage.getItem('mermaid_code') || '';
    const savedFormat = localStorage.getItem('mermaid_format') || 'png';
    const savedDpi = Number(localStorage.getItem('mermaid_dpi')) || 300;
    const savedTheme = localStorage.getItem('mermaid_theme') || 'default';
    const savedBackground = localStorage.getItem('mermaid_background') || 'white';
    const savedHistory = JSON.parse(localStorage.getItem('mermaid_history') || '[]');
    
    return {
      savedCode,
      savedFormat,
      savedDpi,
      savedTheme,
      savedBackground,
      savedHistory
    };
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return {
      savedCode: '',
      savedFormat: 'png',
      savedDpi: 300,
      savedTheme: 'default',
      savedBackground: 'white',
      savedHistory: []
    };
  }
};

const {
  savedCode,
  savedFormat,
  savedDpi,
  savedTheme,
  savedBackground,
  savedHistory
} = loadState();

export const useMermaidStore = defineStore('mermaid', () => {
  const code = ref(savedCode);
  const format = ref(savedFormat);
  const dpi = ref(savedDpi);
  const theme = ref(savedTheme);
  const background = ref(savedBackground);
  const history = ref<ConversionHistory[]>(savedHistory);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const supportedFormats = ref<string[]>([]);
  const supportedThemes = ref<string[]>([]);
  const supportedBackgrounds = ref<string[]>([]);
  const dpiRange = ref<{ min: number; max: number; default: number }>({
    min: 72,
    max: 600,
    default: 300
  });

  // Watch for changes and save to localStorage
  watch(code, (newCode) => {
    localStorage.setItem('mermaid_code', newCode);
  });

  watch(format, (newFormat) => {
    localStorage.setItem('mermaid_format', newFormat);
  });

  watch(dpi, (newDpi) => {
    localStorage.setItem('mermaid_dpi', String(newDpi));
  });

  watch(theme, (newTheme) => {
    localStorage.setItem('mermaid_theme', newTheme);
  });

  watch(background, (newBackground) => {
    localStorage.setItem('mermaid_background', newBackground);
  });

  watch(history, (newHistory) => {
    localStorage.setItem('mermaid_history', JSON.stringify(newHistory));
  }, { deep: true });

  // 获取支持的格式
  async function fetchFormats() {
    try {
      const response = await api.getFormats();
      supportedFormats.value = response.formats;
      supportedThemes.value = response.themes;
      supportedBackgrounds.value = response.backgrounds;
      dpiRange.value = response.dpiRange;
    } catch (err) {
      error.value = 'Failed to fetch supported formats';
      console.error(err);
    }
  }

  // 转换代码
  async function convert() {
    if (!code.value) {
      error.value = 'Please enter Mermaid code';
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      // 确保 DPI 值在有效范围内
      const validDpi = Math.min(Math.max(dpi.value, dpiRange.value.min), dpiRange.value.max);
      const blob = await api.convert(
        code.value, 
        format.value,
        validDpi,
        theme.value,
        background.value
      );
      
      const url = URL.createObjectURL(blob);
      
      history.value.unshift({
        code: code.value,
        format: format.value,
        dpi: validDpi,
        theme: theme.value,
        background: background.value,
        timestamp: Date.now(),
        url
      });

      return url;
    } catch (err) {
      error.value = 'Failed to convert Mermaid code';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  // 清除历史记录
  function clearHistory() {
    history.value = [];
    localStorage.removeItem('mermaid_history');
  }

  // 从历史记录中加载
  function loadFromHistory(item: ConversionHistory) {
    code.value = item.code;
    format.value = item.format;
    dpi.value = item.dpi;
    theme.value = item.theme;
    background.value = item.background;
  }

  return {
    code,
    format,
    dpi,
    theme,
    background,
    history,
    isLoading,
    error,
    supportedFormats,
    supportedThemes,
    supportedBackgrounds,
    dpiRange,
    convert,
    clearHistory,
    loadFromHistory,
    fetchFormats
  };
}); 