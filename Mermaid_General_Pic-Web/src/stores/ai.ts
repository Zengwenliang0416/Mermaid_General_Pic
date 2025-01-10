import { defineStore } from 'pinia';
import { ref } from 'vue';
import { AiModelSettings, AI_MODELS, KIMI_MODELS } from '../types';

const STORAGE_KEY = 'ai_model_settings';

export const useAiStore = defineStore('ai', () => {
  const settings = ref<AiModelSettings>({
    selectedModel: AI_MODELS.KIMI,
    modelConfigs: {
      [AI_MODELS.KIMI]: {
        name: 'Kimi',
        apiKey: '',
        model: 'moonshot-v1-8k'
      },
      [AI_MODELS.DEEPSEEK]: {
        name: 'DeepSeek',
        apiKey: ''
      }
    }
  });

  // 从本地存储加载设置
  const loadSettings = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      settings.value = JSON.parse(stored);
    }
  };

  // 保存设置到本地存储
  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value));
  };

  // 更新API密钥
  const updateApiKey = (model: string, apiKey: string) => {
    if (settings.value.modelConfigs[model]) {
      settings.value.modelConfigs[model].apiKey = apiKey;
      saveSettings();
    }
  };

  // 更新选中的模型
  const updateSelectedModel = (model: string) => {
    settings.value.selectedModel = model;
    saveSettings();
  };

  // 更新 Kimi 的具体模型版本
  const updateKimiModel = (modelVersion: string) => {
    if (settings.value.modelConfigs[AI_MODELS.KIMI]) {
      settings.value.modelConfigs[AI_MODELS.KIMI].model = modelVersion;
      saveSettings();
    }
  };

  // 获取当前选中模型的API密钥
  const getCurrentApiKey = () => {
    return settings.value.modelConfigs[settings.value.selectedModel]?.apiKey || '';
  };

  // 获取当前 Kimi 模型版本
  const getCurrentKimiModel = () => {
    return settings.value.modelConfigs[AI_MODELS.KIMI]?.model || 'moonshot-v1-8k';
  };

  // 初始化时加载设置
  loadSettings();

  return {
    settings,
    updateApiKey,
    updateSelectedModel,
    updateKimiModel,
    getCurrentApiKey,
    getCurrentKimiModel
  };
}); 