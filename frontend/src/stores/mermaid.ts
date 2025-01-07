import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../services/api';

export interface ConversionHistory {
  code: string;
  format: string;
  dpi: number;
  theme: string;
  background: string;
  timestamp: number;
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
  const supportedFormats = ref<string[]>([]);
  const supportedThemes = ref<string[]>([]);
  const supportedBackgrounds = ref<string[]>([]);
  const dpiRange = ref<{ min: number; max: number; default: number }>({
    min: 72,
    max: 600,
    default: 300
  });

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
        'png',
        validDpi,
        'default',
        'white'
      );
      
      const url = URL.createObjectURL(blob);
      
      history.value.unshift({
        code: code.value,
        format: 'png',
        dpi: validDpi,
        theme: 'default',
        background: 'white',
        timestamp: Date.now()
      });

      return url;
    } catch (err) {
      error.value = 'Failed to convert Mermaid code';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  // 上传文件
  async function upload(file: File) {
    isLoading.value = true;
    error.value = null;

    try {
      // 确保 DPI 值在有效范围内
      const validDpi = Math.min(Math.max(dpi.value, dpiRange.value.min), dpiRange.value.max);
      const blob = await api.upload(
        file, 
        'png',
        validDpi,
        'default',
        'white'
      );
      
      const url = URL.createObjectURL(blob);
      
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        code.value = e.target?.result as string;
      };
      fileReader.readAsText(file);

      history.value.unshift({
        code: code.value,
        format: 'png',
        dpi: validDpi,
        theme: 'default',
        background: 'white',
        timestamp: Date.now()
      });

      return url;
    } catch (err) {
      error.value = 'Failed to upload file';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  // 清除历史记录
  function clearHistory() {
    history.value = [];
  }

  // 从历史记录中加载
  function loadFromHistory(item: ConversionHistory) {
    code.value = item.code;
    format.value = 'png';
    dpi.value = item.dpi;
    theme.value = 'default';
    background.value = 'white';
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
    upload,
    clearHistory,
    loadFromHistory,
    fetchFormats
  };
}); 