<template>
  <el-card class="ai-card" shadow="hover">
    <!-- AI设置区域 -->
    <div class="ai-settings">
      <div class="settings-group">
        <el-select
          v-model="aiStore.settings.selectedModel"
          @change="handleModelChange"
          class="model-select"
          :placeholder="t('ai.model')"
          size="large"
        >
          <el-option
            v-for="(config, model) in aiStore.settings.modelConfigs"
            :key="model"
            :label="config.name"
            :value="model"
          >
            <div class="model-option">
              <el-icon><Connection /></el-icon>
              <span>{{ config.name }}</span>
            </div>
          </el-option>
        </el-select>

        <el-select
          v-if="isKimiModel"
          v-model="kimiModel"
          @change="handleKimiModelChange"
          class="model-version-select"
          :placeholder="t('ai.kimi_model_placeholder')"
          size="large"
        >
          <el-option
            v-for="(label, value) in kimiModels"
            :key="value"
            :label="label"
            :value="value"
          >
            <div class="model-option">
              <el-icon><List /></el-icon>
              <span>{{ label }}</span>
            </div>
          </el-option>
        </el-select>
      </div>

      <el-input
        v-model="currentApiKey"
        type="password"
        :placeholder="t('ai.api_key_placeholder')"
        show-password
        @change="handleApiKeyChange"
        class="api-key-input"
        size="large"
      >
        <template #prefix>
          <el-icon><Key /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- AI输入区域 -->
    <div class="ai-input-container">
      <div class="chat-input-wrapper">
        <el-input
          v-model="aiPrompt"
          :placeholder="t('ai.placeholder')"
          :disabled="isGenerating"
          @keyup.enter="handleGenerate"
          size="large"
          clearable
          class="chat-input"
        >
          <template #prefix>
            <el-icon class="chat-icon"><ChatLineRound /></el-icon>
          </template>
        </el-input>

        <div class="chat-actions">
          <el-button
            class="action-button new-chat"
            type="primary"
            plain
            @click="handleNewConversation"
            :disabled="isGenerating"
            :title="t('ai.new_conversation_tooltip')"
          >
            <el-icon><Plus /></el-icon>
          </el-button>

          <el-button
            class="action-button generate"
            type="primary"
            :loading="isGenerating"
            @click="handleGenerate"
            :title="t('ai.generate_tooltip')"
          >
            <el-icon><Promotion /></el-icon>
            <span class="button-text">{{ t('ai.generate') }}</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 对话历史记录 -->
    <div v-if="chatHistory.length > 0" class="chat-history">
      <div v-for="(message, index) in chatHistory" :key="index" class="chat-message" :class="{ 'user-message': message.role === 'user' }">
        <div class="message-header">
          <div class="message-role">
            <el-tag size="small" :type="message.role === 'user' ? 'primary' : 'success'" effect="light">
              <el-icon>
                <User v-if="message.role === 'user'" />
                <Service v-else />
              </el-icon>
              {{ message.role === 'user' ? t('ai.user') : t('ai.assistant') }}
            </el-tag>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
          <div class="message-actions" v-if="message.code">
            <el-tooltip
              :content="t('ai.copy_code_tooltip')"
              placement="top"
              :show-after="300"
            >
              <el-button
                type="primary"
                link
                size="small"
                @click="copyCode(message.code)"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
        <div class="message-content">
          {{ message.content }}
        </div>
        <div v-if="message.code" class="message-code">
          <div class="code-header">
            <span>Mermaid</span>
          </div>
          <pre><code>{{ message.code }}</code></pre>
        </div>
      </div>
    </div>

    <div v-else class="empty-chat">
      <el-empty :description="t('ai.empty_chat')" :image-size="120">
        <template #image>
          <el-icon class="empty-icon"><ChatDotRound /></el-icon>
        </template>
      </el-empty>
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
import {
  Connection,
  List,
  Key,
  ChatLineRound,
  Plus,
  Promotion,
  User,
  Service,
  CopyDocument,
  ChatDotRound
} from '@element-plus/icons-vue';

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

// 添加复制代码功能
const copyCode = (code: string) => {
  navigator.clipboard.writeText(code).then(() => {
    ElMessage.success(t('ai.code_copied'));
  }).catch(() => {
    ElMessage.error(t('ai.copy_failed'));
  });
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
  margin-bottom: 20px;
  overflow: hidden;
}

.ai-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.ai-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: var(--el-bg-color-page);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.settings-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.model-select,
.model-version-select {
  min-width: 200px;
  flex: 1;
}

.api-key-input {
  width: 100%;
}

.model-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-option .el-icon {
  font-size: 16px;
  color: var(--el-color-primary);
}

.ai-input-container {
  padding: 0 20px;
  margin-bottom: 20px;
}

.chat-input-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
  background-color: var(--el-bg-color-page);
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.chat-input {
  flex: 1;
}

.chat-icon {
  font-size: 18px;
  color: var(--el-text-color-secondary);
}

:deep(.el-input__wrapper) {
  background-color: var(--el-bg-color) !important;
  box-shadow: none !important;
  border: 1px solid var(--el-border-color-light);
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: var(--el-border-color-hover);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-8) !important;
}

.chat-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-button {
  height: 40px;
  border-radius: 8px;
  transition: all 0.3s ease;
  padding: 0 16px;
}

.action-button.new-chat {
  width: 40px;
  padding: 0;
  border: 1px solid var(--el-color-primary-light-5);
}

.action-button.new-chat:hover {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
  transform: translateY(-1px);
}

.action-button.generate {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  min-width: 100px;
}

.action-button.generate:hover {
  transform: translateY(-1px);
}

.action-button .el-icon {
  font-size: 16px;
}

.button-text {
  margin-left: 4px;
}

.chat-history {
  margin-top: 20px;
  max-height: 500px;
  overflow-y: auto;
  padding: 20px;
  border-top: 1px solid var(--el-border-color-light);
  scrollbar-width: thin;
  scrollbar-color: var(--el-border-color) transparent;
}

.chat-history::-webkit-scrollbar {
  width: 6px;
}

.chat-history::-webkit-scrollbar-track {
  background: transparent;
}

.chat-history::-webkit-scrollbar-thumb {
  background-color: var(--el-border-color);
  border-radius: 3px;
}

.chat-message {
  margin-bottom: 24px;
  padding: 16px;
  border-radius: 12px;
  background-color: var(--el-bg-color-page);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  animation: slideIn 0.3s ease-out;
}

.chat-message:last-child {
  margin-bottom: 0;
}

.chat-message:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.message-role {
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-role .el-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
}

.message-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.message-content {
  line-height: 1.6;
  color: var(--el-text-color-regular);
  margin: 12px 0;
  white-space: pre-wrap;
}

.message-code {
  margin-top: 16px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-light);
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.message-code pre {
  margin: 0;
  padding: 16px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
  background-color: var(--el-bg-color);
}

.message-code code {
  color: var(--el-text-color-primary);
}

.empty-chat {
  padding: 40px 0;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: var(--el-text-color-secondary);
  opacity: 0.5;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .ai-settings {
    padding: 16px;
  }

  .settings-group {
    flex-direction: column;
  }

  .model-select,
  .model-version-select {
    width: 100%;
  }

  .ai-input-container {
    padding: 0 16px;
  }

  .chat-history {
    padding: 16px;
    max-height: 400px;
  }

  .chat-message {
    padding: 12px;
    margin-bottom: 16px;
  }

  .message-code pre {
    padding: 12px;
    font-size: 13px;
  }

  .chat-input-wrapper {
    padding: 8px;
    flex-direction: column;
    gap: 8px;
  }

  .chat-actions {
    width: 100%;
  }

  .action-button.generate {
    flex: 1;
  }
}
</style> 