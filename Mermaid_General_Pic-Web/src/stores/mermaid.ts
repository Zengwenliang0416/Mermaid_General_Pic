import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { api } from '../services/api';

// 转换历史记录接口
export interface ConversionHistory {
  code: string;
  format: string;
  dpi: number;
  theme: string;
  background: string;
  timestamp: number;
  url?: string;
}

// DPI 范围配置
const DEFAULT_DPI_RANGE = {
  min: 72,
  max: 600,
  default: 300
};

// 从 localStorage 加载状态
async function loadState() {
  const savedCode = localStorage.getItem('mermaid_code') || '';
  const savedFormat = localStorage.getItem('mermaid_format') || 'png';
  const savedDpi = Number(localStorage.getItem('mermaid_dpi')) || DEFAULT_DPI_RANGE.default;
  const savedTheme = localStorage.getItem('mermaid_theme') || 'default';
  const savedBackground = localStorage.getItem('mermaid_background') || 'white';
  let savedHistory: ConversionHistory[] = [];

  try {
    const historyStr = localStorage.getItem('mermaid_history');
    if (historyStr) {
      const parsedHistory = JSON.parse(historyStr);
      // 为每个历史记录重新创建 URL
      savedHistory = await Promise.all(parsedHistory.map(async (item: ConversionHistory) => {
        try {
          // 使用存储的参数重新生成图片
          const blob = await api.convert(
            item.code,
            item.format,
            item.dpi,
            item.theme,
            item.background
          );
          return {
            ...item,
            url: URL.createObjectURL(blob)
          };
        } catch (error) {
          console.error('Failed to recreate URL for history item:', error);
          return item;
        }
      }));
    }
  } catch (error) {
    console.error('Failed to load history:', error);
  }

  return {
    savedCode,
    savedFormat,
    savedDpi,
    savedTheme,
    savedBackground,
    savedHistory
  };
}

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
  const dpiRange = ref<{ min: number; max: number; default: number }>(DEFAULT_DPI_RANGE);

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

  // 立即初始化 store
  initializeStore();

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