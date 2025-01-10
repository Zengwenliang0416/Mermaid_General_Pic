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
const loadState = async () => {
  try {
    const savedCode = localStorage.getItem('mermaid_code') || '';
    const savedFormat = localStorage.getItem('mermaid_format') || 'png';
    const savedDpi = Number(localStorage.getItem('mermaid_dpi')) || 300;
    const savedTheme = localStorage.getItem('mermaid_theme') || 'default';
    const savedBackground = localStorage.getItem('mermaid_background') || 'white';
    const savedHistory = JSON.parse(localStorage.getItem('mermaid_history') || '[]');

    // 重新生成历史记录中的图片 URL
    const processedHistory = await Promise.all(
      savedHistory.map(async (item: ConversionHistory) => {
        try {
          const blob = await api.convert(
            item.code,
            item.format,
            item.dpi,
            item.theme,
            item.background
          );
          item.url = URL.createObjectURL(blob);
        } catch (error) {
          console.error('Failed to regenerate image URL for history item:', error);
        }
        return item;
      })
    );
    
    return {
      savedCode,
      savedFormat,
      savedDpi,
      savedTheme,
      savedBackground,
      savedHistory: processedHistory
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

export const useMermaidStore = defineStore('mermaid', () => {
  const code = ref('');
  const format = ref('png');
  const dpi = ref(300);
  const theme = ref('default');
  const background = ref('white');
  const history = ref<ConversionHistory[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const supportedFormats = ref<string[]>(['png', 'svg', 'jpg']);
  const supportedThemes = ref<string[]>(['default', 'dark', 'forest', 'neutral']);
  const supportedBackgrounds = ref<string[]>(['transparent', 'white']);
  const dpiRange = ref<{ min: number; max: number; default: number }>({
    min: 72,
    max: 600,
    default: 300
  });

  // 初始化 store
  async function initializeStore() {
    const {
      savedCode,
      savedFormat,
      savedDpi,
      savedTheme,
      savedBackground,
      savedHistory
    } = await loadState();

    code.value = savedCode;
    format.value = savedFormat;
    dpi.value = savedDpi;
    theme.value = savedTheme;
    background.value = savedBackground;
    history.value = savedHistory;

    // 初始化时获取支持的格式
    await fetchFormats();
  }

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
    // 只保存必要的数据到 localStorage，不保存 URL
    const historyToSave = newHistory.map(({ url, ...rest }) => rest);
    localStorage.setItem('mermaid_history', JSON.stringify(historyToSave));
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
      console.error('Failed to fetch supported formats:', err);
      // 使用默认值
      error.value = null;
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
    // 清理所有的 URL 对象
    history.value.forEach(item => {
      if (item.url) {
        URL.revokeObjectURL(item.url);
      }
    });
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
    fetchFormats,
    initializeStore
  };
}); 