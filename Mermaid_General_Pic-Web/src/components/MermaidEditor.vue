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
                <el-tooltip
                  :content="t('editor.upload_tooltip')"
                  placement="bottom"
                  :show-after="300"
                >
                  <el-upload
                    class="upload-btn"
                    :show-file-list="false"
                    accept=".txt,.mmd"
                    :before-upload="handleUpload"
                  >
                    <el-button type="primary" size="small">
                      <el-icon><Upload /></el-icon>
                      <span class="button-text">{{ t('editor.upload') }}</span>
                    </el-button>
                  </el-upload>
                </el-tooltip>
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
              <el-tooltip
                :content="t('editor.convert_tooltip')"
                placement="top"
                :show-after="300"
              >
                <el-button
                  type="primary"
                  :loading="store.isLoading"
                  @click="handleConvert"
                  size="small"
                >
                  <el-icon><Refresh /></el-icon>
                  <span class="button-text">{{ t('editor.convert') }}</span>
                </el-button>
              </el-tooltip>
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
                  <span>{{ t('preview.loading') }}</span>
                </div>
              </template>
              <template #error>
                <div class="image-error">
                  <el-icon><PictureFilled /></el-icon>
                  <span>{{ t('preview.error') }}</span>
                </div>
              </template>
            </el-image>
            <div v-else class="empty-preview">
              <el-icon><Picture /></el-icon>
              <span>{{ t('preview.empty') }}</span>
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
  border-radius: 12px;
  transition: all 0.3s ease;
}

.editor-card:hover,
.preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.header-title .el-icon {
  font-size: 18px;
  color: var(--el-color-primary);
}

.header-actions,
.preview-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.editor-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-main {
  position: relative;
}

:deep(.el-textarea__inner) {
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 16px;
  border-radius: 8px;
  background-color: var(--el-bg-color-page);
  transition: all 0.3s ease;
  resize: none;
}

:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-light);
}

.error-alert {
  margin-top: 16px;
  border-radius: 8px;
}

.preview-container {
  position: relative;
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--el-bg-color-page);
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  transition: transform 0.3s ease;
}

.image-placeholder,
.image-error,
.empty-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--el-text-color-secondary);
}

.image-placeholder .el-icon,
.image-error .el-icon,
.empty-preview .el-icon {
  font-size: 48px;
  opacity: 0.5;
}

:deep(.el-upload) {
  width: auto;
}

:deep(.el-button) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

:deep(.el-input-number) {
  width: 120px;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  border-radius: 4px;
  transition: all 0.3s ease;
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
  }

  .header-title {
    font-size: 14px;
  }

  .header-title .el-icon {
    font-size: 16px;
  }

  :deep(.el-textarea__inner) {
    font-size: 13px;
    padding: 12px;
  }
}
</style> 