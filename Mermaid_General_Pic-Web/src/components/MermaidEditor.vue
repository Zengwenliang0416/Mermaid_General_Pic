<template>
  <div class="editor-preview-container">
    <el-row :gutter="20">
      <!-- 左侧编辑器 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="editor-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon><Edit /></el-icon>
                <span>{{ t('editor.title') }}</span>
              </div>
              <div class="header-actions">
                <el-upload
                  class="upload-btn"
                  :show-file-list="false"
                  accept=".txt,.mmd"
                  :before-upload="handleUpload"
                >
                  <el-button type="primary" size="small" class="action-button">
                    <el-icon><Upload /></el-icon>
                    <span class="button-text">{{ t('editor.upload') }}</span>
                  </el-button>
                </el-upload>
              </div>
            </div>
          </template>
          
          <div class="editor-container">
            <div class="editor-main">
              <el-input
                v-model="store.code"
                type="textarea"
                :rows="20"
                :placeholder="t('editor.placeholder')"
                @input="handleCodeChange"
                resize="none"
                spellcheck="false"
              />
            </div>

            <div class="editor-footer">
              <el-button
                type="primary"
                :loading="store.isLoading"
                @click="handleConvert"
                size="small"
                class="action-button"
              >
                <el-icon><Refresh /></el-icon>
                <span class="button-text">{{ t('editor.convert') }}</span>
              </el-button>
            </div>
          </div>

          <el-alert
            v-if="store.error"
            :title="store.error"
            type="error"
            show-icon
            class="error-alert"
          />
        </el-card>
      </el-col>

      <!-- 右侧预览 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="preview-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon><View /></el-icon>
                <span>{{ t('preview.title') }}</span>
              </div>
              <div class="preview-controls">
                <el-tooltip
                  v-if="previewUrl"
                  :content="t('preview.zoom_tooltip')"
                  placement="bottom"
                  :show-after="300"
                >
                  <el-input-number
                    v-model="zoomPercent"
                    :min="10"
                    :max="300"
                    :step="10"
                    size="small"
                    @change="handleZoomChange"
                    controls-position="right"
                  >
                    <template #suffix>%</template>
                  </el-input-number>
                </el-tooltip>
                <DownloadDialog
                  v-if="previewUrl"
                  :code="store.code"
                />
              </div>
            </div>
          </template>
          <div class="preview-container">
            <el-image
              v-if="previewUrl"
              :src="previewUrl"
              fit="contain"
              :style="{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }"
              class="preview-image"
              :preview-src-list="[previewUrl]"
              :initial-index="0"
              preview-teleported
              :preview-options="{
                zoom: 1.5,
                zoomRate: 1.2,
                defaultFullScreen: false,
                closeOnPressEscape: true,
                teleported: true
              }"
            >
              <template #placeholder>
                <div class="image-placeholder">
                  <el-icon><Loading /></el-icon>
                </div>
              </template>
              <template #error>
                <div class="image-error">
                  <el-icon><PictureFilled /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-else class="empty-preview">
              <el-icon><Picture /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  Edit,
  Upload,
  Picture,
  View,
  Loading,
  PictureFilled,
  Refresh
} from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { useMermaidStore } from '../stores/mermaid';
import DownloadDialog from './DownloadDialog.vue';
import { api } from '../services/api';

const { t } = useI18n();
const store = useMermaidStore();
const previewUrl = ref<string>('');
const zoomLevel = ref(1);
const zoomPercent = ref(100);

// 初始化
onMounted(async () => {
  await store.initializeStore();
});

// 处理代码变更
let timer: number | null = null;
const handleCodeChange = () => {
  if (timer) {
    clearTimeout(timer);
  }
  timer = window.setTimeout(async () => {
    if (store.code) {
      await handleConvert(false);
    }
  }, 1000);
};

// 处理转换
const handleConvert = async (addToHistory: boolean = true) => {
  try {
    // 预览时使用更高的 DPI 以获得更清晰的图像
    const previewDpi = Math.max(300, window.devicePixelRatio * 300);
    const blob = await api.convert(store.code, store.format, previewDpi, store.theme, store.background);
    if (blob) {
      // 如果之前有预览 URL，先释放它
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
      }

      // 为预览创建一个 URL
      previewUrl.value = URL.createObjectURL(blob.slice(0));
      zoomLevel.value = 1;

      // 只有在需要添加到历史记录时才创建新的 URL 和添加记录
      if (addToHistory) {
        // 为历史记录创建一个独立的 URL（使用 blob 的副本）
        const historyUrl = URL.createObjectURL(blob.slice(0));
        
        // 添加到历史记录
        store.history.unshift({
          code: store.code,
          format: store.format,
          dpi: previewDpi,
          theme: store.theme,
          background: store.background,
          timestamp: Date.now(),
          url: historyUrl
        });
      }
    }
  } catch (err) {
    console.error('Error converting:', err);
  }
};

// 处理上传
const handleUpload = async (file: File) => {
  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        store.code = e.target.result.toString();
        await handleConvert();
      }
    };
    reader.readAsText(file);
  } catch (err) {
    console.error('Error uploading:', err);
  }
  return false;
};

// 处理缩放
const handleZoomChange = (value: number) => {
  zoomLevel.value = value / 100;
};

defineExpose({
  handleConvert
});
</script>

<style scoped>
.editor-preview-container {
  margin-top: 24px;
}

.editor-card,
.preview-card {
  height: 100%;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--el-border-color-light);
  backdrop-filter: blur(8px);
  background-color: rgba(var(--el-bg-color-rgb), 0.8);
}

.editor-card:hover,
.preview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--el-color-primary-light-7);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: rgba(var(--el-bg-color-rgb), 0.6);
  backdrop-filter: blur(8px);
  border-radius: 16px 16px 0 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  letter-spacing: -0.5px;
}

.header-title .el-icon {
  font-size: 20px;
  color: var(--el-color-primary);
  transition: transform 0.3s ease;
}

.editor-card:hover .header-title .el-icon,
.preview-card:hover .header-title .el-icon {
  transform: scale(1.1);
}

.header-actions,
.preview-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.editor-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.editor-main {
  position: relative;
}

:deep(.el-textarea__inner) {
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 20px;
  border-radius: 12px;
  background-color: var(--el-bg-color-page);
  transition: all 0.3s ease;
  resize: none;
  border: 1px solid var(--el-border-color-light);
}

:deep(.el-textarea__inner:hover) {
  border-color: var(--el-border-color-hover);
}

:deep(.el-textarea__inner:focus) {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-light);
}

.error-alert {
  margin: 0 20px 20px;
  border-radius: 12px;
}

.preview-container {
  position: relative;
  min-height: 400px;
  max-height: 600px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: var(--el-bg-color-page);
  border-radius: 12px;
  overflow: auto;
  padding: 20px;
  margin: 20px;
  border: 1px solid var(--el-border-color-light);
  transition: all 0.3s ease;
}

.preview-container:hover {
  border-color: var(--el-border-color-hover);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.preview-image {
  max-width: 100%;
  height: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  object-fit: contain;
  border-radius: 8px;
}

:deep(.el-image) {
  width: 100%;
  height: auto;
  display: block;
}

:deep(.el-image__inner) {
  object-fit: contain;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.image-placeholder,
.image-error,
.empty-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: inherit;
  color: var(--el-text-color-secondary);
  background: linear-gradient(135deg, var(--el-bg-color) 0%, var(--el-bg-color-page) 100%);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.image-placeholder .el-icon,
.image-error .el-icon,
.empty-preview .el-icon {
  font-size: 32px;
  opacity: 0.4;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--el-text-color-secondary);
}

.image-placeholder:hover .el-icon,
.image-error:hover .el-icon,
.empty-preview:hover .el-icon {
  opacity: 0.6;
  transform: scale(1.1);
}

:deep(.el-upload) {
  width: auto;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.2);
}

.action-button .el-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.action-button:hover .el-icon {
  transform: scale(1.1);
}

:deep(.el-input-number) {
  width: 120px;
}

:deep(.el-input-number .el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-input-number:hover .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-color-primary-light-7);
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  border-radius: 4px;
  transition: all 0.3s ease;
  background-color: var(--el-bg-color-page);
}

:deep(.el-input-number__decrease:hover),
:deep(.el-input-number__increase:hover) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

@media (max-width: 768px) {
  .editor-preview-container {
    margin-top: 16px;
  }

  :deep(.el-row) {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  :deep(.el-col) {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .editor-card,
  .preview-card {
    margin-bottom: 16px;
  }

  .preview-container {
    min-height: 300px;
    padding: 16px;
    margin: 16px;
  }

  .header-title {
    font-size: 16px;
  }

  .header-title .el-icon {
    font-size: 18px;
  }

  :deep(.el-textarea__inner) {
    font-size: 13px;
    padding: 16px;
  }

  .editor-container {
    padding: 16px;
    gap: 16px;
  }

  .card-header {
    padding: 12px 16px;
  }
}
</style> 