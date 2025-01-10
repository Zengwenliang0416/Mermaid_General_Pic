<template>
  <el-card class="ai-card" shadow="hover">
    <div class="ai-settings">
      <el-select
        v-model="aiStore.settings.selectedModel"
        @change="handleModelChange"
        class="model-select"
        :placeholder="t('ai.model')"
      >
        <el-option
          v-for="(config, model) in aiStore.settings.modelConfigs"
          :key="model"
          :label="config.name"
          :value="model"
        />
      </el-select>
      <el-select
        v-if="isKimiModel"
        v-model="kimiModel"
        @change="handleKimiModelChange"
        class="model-version-select"
        :placeholder="t('ai.kimi_model_placeholder')"
      >
        <el-option
          v-for="(label, value) in kimiModels"
          :key="value"
          :label="label"
          :value="value"
        />
      </el-select>
      <el-input
        v-model="currentApiKey"
        type="password"
        :placeholder="t('ai.api_key_placeholder')"
        show-password
        @change="handleApiKeyChange"
        class="api-key-input"
      />
    </div>
    <div class="ai-input-container">
      <el-input
        v-model="aiPrompt"
        :placeholder="t('ai.placeholder')"
        :disabled="isGenerating"
        @keyup.enter="handleGenerate"
      >
        <template #prepend>
          <el-button
            type="primary"
            plain
            @click="handleNewConversation"
            :disabled="isGenerating"
          >
            {{ t('ai.new_conversation') }}
          </el-button>
        </template>
        <template #append>
          <el-button
            type="primary"
            :loading="isGenerating"
            @click="handleGenerate"
          >
            {{ t('ai.generate') }}
          </el-button>
        </template>
      </el-input>
    </div>

    <!-- 对话历史记录 -->
    <div v-if="chatHistory.length > 0" class="chat-history">
      <div v-for="(message, index) in chatHistory" :key="index" class="chat-message">
        <div class="message-header">
          <el-tag size="small" :type="message.role === 'user' ? 'primary' : 'success'">
            {{ message.role === 'user' ? t('ai.user') : t('ai.assistant') }}
          </el-tag>
          <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        </div>
        <div class="message-content" :class="{ 'user-message': message.role === 'user' }">
          {{ message.content }}
        </div>
        <div v-if="message.code" class="message-code">
          <pre>{{ message.code }}</pre>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAiStore } from '../stores/ai';
import { useMermaidStore } from '../stores/mermaid';
import { api } from '../services/api';
import { ElMessage } from 'element-plus';
import { AI_MODELS, KIMI_MODELS, type AiModel, type ChatMessage } from '../types';

const { t } = useI18n();
const aiStore = useAiStore();
const store = useMermaidStore();

const aiPrompt = ref('');
const isGenerating = ref(false);
const conversationId = ref<string>('');
const chatHistory = ref<ChatMessage[]>([]);
const currentApiKey = ref(aiStore.getCurrentApiKey());
const kimiModel = ref(aiStore.getCurrentKimiModel());
const kimiModels = KIMI_MODELS;
const isKimiModel = computed(() => aiStore.settings.selectedModel === AI_MODELS.KIMI);

// 处理模型变更
const handleModelChange = (model: AiModel) => {
  aiStore.updateSelectedModel(model);
  currentApiKey.value = aiStore.getCurrentApiKey();
};

// 处理API密钥变更
const handleApiKeyChange = (apiKey: string) => {
  aiStore.updateApiKey(aiStore.settings.selectedModel, apiKey);
};

// 处理 Kimi 模型变更
const handleKimiModelChange = (model: string) => {
  aiStore.updateKimiModel(model);
};

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString();
};

// 处理新建对话
const handleNewConversation = () => {
  conversationId.value = '';
  chatHistory.value = [];
  ElMessage.success(t('ai.new_conversation_success'));
};

// 处理AI生成
const handleGenerate = async () => {
  if (!aiPrompt.value.trim()) {
    ElMessage.warning(t('ai.prompt_required'));
    return;
  }

  const apiKey = aiStore.getCurrentApiKey();
  if (!apiKey) {
    ElMessage.warning(t('ai.api_key_required'));
    return;
  }

  isGenerating.value = true;

  try {
    // 添加用户消息到历史记录
    chatHistory.value.push({
      role: 'user',
      content: aiPrompt.value,
      timestamp: Date.now()
    });

    const response = await api.generateFromAi(aiPrompt.value, {
      model: aiStore.settings.selectedModel as AiModel,
      conversationId: conversationId.value,
      apiKey: apiKey,
      kimiModel: isKimiModel.value ? aiStore.getCurrentKimiModel() : undefined
    });
    
    // 添加助手回复到历史记录
    chatHistory.value.push({
      role: 'assistant',
      content: t('ai.generation_complete'),
      code: response.code,
      timestamp: Date.now()
    });

    store.code = response.code;
    conversationId.value = response.conversationId;
    
    ElMessage.success(t('ai.generation_success'));
    aiPrompt.value = '';
  } catch (error) {
    console.error('Failed to generate diagram:', error);
    ElMessage.error(t('ai.generation_error'));
  } finally {
    isGenerating.value = false;
  }
};

defineExpose({
  handleGenerate
});
</script>

<style scoped>
.ai-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.ai-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.ai-settings {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background-color: var(--el-bg-color-page);
  border-radius: 8px;
}

.ai-input-container {
  display: flex;
  gap: 12px;
}

:deep(.el-input-group__append) {
  padding: 0;
}

:deep(.el-input-group__append button) {
  border: none;
  height: 100%;
  padding: 0 20px;
  border-radius: 0 4px 4px 0;
}

.chat-history {
  margin-top: 20px;
  max-height: 400px;
  overflow-y: auto;
  border-top: 1px solid var(--el-border-color-light);
  padding: 20px;
}

.chat-message {
  margin-bottom: 20px;
  padding: 16px;
  border-radius: 12px;
  background-color: var(--el-bg-color-page);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.chat-message:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.message-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.message-time {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.message-content {
  margin-bottom: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}

.message-code {
  background-color: var(--el-bg-color);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
}

.message-code pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.user-message {
  color: var(--el-color-primary);
  font-weight: 500;
}

.model-select,
.model-version-select {
  width: 180px;
}

.api-key-input {
  flex: 1;
}
</style> 