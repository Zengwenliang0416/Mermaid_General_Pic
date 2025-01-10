<template>
  <el-dialog
    v-model="dialogVisible"
    :title="t('ai.title')"
    width="60%"
    :close-on-click-modal="false"
  >
    <div class="ai-dialog-content">
      <el-input
        v-model="prompt"
        type="textarea"
        :rows="4"
        :placeholder="t('ai.placeholder')"
        resize="none"
      />
      
      <div class="settings">
        <el-form :model="settings" label-position="top" size="small">
          <el-form-item :label="t('ai.model')">
            <el-select v-model="settings.model">
              <el-option
                label="Kimi"
                value="kimi"
              />
              <el-option
                label="DeepSeek"
                value="deepseek"
              />
            </el-select>
          </el-form-item>

          <el-form-item :label="t('editor.format')">
            <el-select v-model="settings.format">
              <el-option
                v-for="format in store.supportedFormats"
                :key="format"
                :label="format.toUpperCase()"
                :value="format"
              />
            </el-select>
          </el-form-item>

          <el-form-item :label="t('editor.theme')">
            <el-select v-model="settings.theme">
              <el-option
                v-for="theme in store.supportedThemes"
                :key="theme"
                :label="t(`theme.${theme}`)"
                :value="theme"
              />
            </el-select>
          </el-form-item>

          <el-form-item :label="t('editor.background')">
            <el-select v-model="settings.background">
              <el-option
                v-for="bg in store.supportedBackgrounds"
                :key="bg"
                :label="t(`background.${bg}`)"
                :value="bg"
              />
            </el-select>
          </el-form-item>

          <el-form-item :label="t('editor.dpi')">
            <el-input-number
              v-model="settings.dpi"
              :min="store.dpiRange.min"
              :max="store.dpiRange.max"
              :step="1"
            />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button
          type="primary"
          :loading="isGenerating"
          @click="handleGenerate"
        >
          {{ t('ai.generate') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useMermaidStore } from '../stores/mermaid';
import { api } from '../services/api';

const { t } = useI18n();
const store = useMermaidStore();

const dialogVisible = ref(false);
const prompt = ref('');
const isGenerating = ref(false);

const settings = reactive({
  format: store.format,
  dpi: store.dpi,
  theme: store.theme,
  background: store.background,
  model: 'kimi' // 默认使用 Kimi
});

const handleGenerate = async () => {
  if (!prompt.value.trim()) {
    ElMessage.warning(t('ai.prompt_required'));
    return;
  }

  isGenerating.value = true;

  try {
    const response = await api.generateFromAi(prompt.value, settings);
    
    // 更新编辑器代码
    store.code = response.code;
    
    // 更新设置
    store.format = settings.format;
    store.dpi = settings.dpi;
    store.theme = settings.theme;
    store.background = settings.background;

    dialogVisible.value = false;
    ElMessage.success(t('ai.generation_success'));
  } catch (error) {
    console.error('Failed to generate diagram:', error);
    ElMessage.error(t('ai.generation_error'));
  } finally {
    isGenerating.value = false;
  }
};

// 暴露给父组件的方法
defineExpose({
  show: () => {
    dialogVisible.value = true;
  }
});
</script>

<style scoped>
.ai-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .settings {
    grid-template-columns: 1fr;
  }
}
</style> 