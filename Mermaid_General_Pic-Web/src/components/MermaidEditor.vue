<template>
  <div class="editor-preview-container">
    <el-row :gutter="20">
      <!-- 左侧编辑器 -->
      <el-col :span="12">
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
                  <el-button type="primary" size="small">
                    <el-icon><Upload /></el-icon>
                    {{ t('editor.upload') }}
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
                :rows="25"
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
              >
                <el-icon><Refresh /></el-icon>
                {{ t('editor.convert') }}
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
      <el-col :span="12">
        <el-card class="preview-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon><View /></el-icon>
                <span>{{ t('preview.title') }}</span>
              </div>
              <div class="preview-controls">
                <div v-if="previewUrl">
                  <el-input-number
                    v-model="zoomPercent"
                    :min="10"
                    :max="300"
                    :step="10"
                    size="small"
                    style="width: 110px"
                    @change="handleZoomChange"
                    controls-position="right"
                  >
                    <template #suffix>%</template>
                  </el-input-number>
                </div>
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.header-title .el-icon {
  font-size: 20px;
  color: var(--el-color-primary);
}

.editor-container {
  padding: 20px;
}

:deep(.el-textarea__inner) {
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 16px;
  border-radius: 8px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  transition: all 0.3s ease;
  resize: none;
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
}

.preview-container {
  height: 600px;
  overflow: auto;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  padding: 20px;
  margin: 20px;
}

.preview-image {
  transition: transform 0.3s ease;
}

:deep(.el-image) {
  width: auto !important;
  display: inline-block;
}

.empty-preview,
.image-placeholder,
.image-error {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.preview-controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

:deep(.el-button-group) {
  display: flex;
  align-items: center;
}

:deep(.el-button-group .el-button) {
  padding: 8px 12px;
}

.error-alert {
  margin-top: 16px;
}

@media (max-width: 768px) {
  .el-row {
    flex-direction: column;
  }

  .el-col {
    width: 100% !important;
    margin-bottom: 20px;
  }
}

:deep(.el-image-viewer__wrapper) {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2000;
}

:deep(.el-image-viewer__mask) {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0.7;
  background: #000;
}

:deep(.el-image-viewer__actions) {
  opacity: 0.9;
  padding: 20px;
}

:deep(.el-image-viewer__actions__inner) {
  border-radius: 20px;
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.7);
}

:deep(.el-image-viewer__btn) {
  color: #fff;
  opacity: 0.8;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s;
}

:deep(.el-image-viewer__btn:hover) {
  opacity: 1;
  transform: scale(1.1);
}

:deep(.el-image-viewer__close) {
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.7);
  font-size: 24px;
  opacity: 0.8;
  transition: all 0.3s;
}

:deep(.el-image-viewer__close:hover) {
  opacity: 1;
  transform: rotate(90deg);
  background-color: rgba(0, 0, 0, 0.9);
}

:deep(.el-image-viewer__canvas) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

:deep(.el-image-viewer__img) {
  max-width: 100%;
  max-height: 100%;
  user-select: none;
  -webkit-user-drag: none;
  cursor: grab;
}

:deep(.el-image-viewer__img:active) {
  cursor: grabbing;
}

:deep(.el-image-viewer__prev),
:deep(.el-image-viewer__next) {
  display: none;
}
</style> 