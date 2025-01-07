<template>
  <div class="home">
    <el-container>
      <el-main>
        <el-row :gutter="20">
          <!-- 左侧编辑器 -->
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>{{ $t('editor.title') }}</span>
                  <el-upload
                    class="upload-btn"
                    :show-file-list="false"
                    accept=".txt,.mmd"
                    :before-upload="handleUpload"
                  >
                    <el-button type="primary">
                      <el-icon><Upload /></el-icon>
                      {{ $t('editor.upload') }}
                    </el-button>
                  </el-upload>
                </div>
              </template>
              <el-input
                v-model="store.code"
                type="textarea"
                :rows="15"
                :placeholder="$t('editor.placeholder')"
                @input="handleCodeChange"
              />
              <div class="settings">
                <el-select 
                  v-model="store.format" 
                  class="format-select"
                  @change="handleFormatChange"
                >
                  <el-option
                    v-for="format in store.supportedFormats"
                    :key="format"
                    :label="format.toUpperCase()"
                    :value="format"
                  />
                </el-select>
                <el-select 
                  v-model="store.theme" 
                  class="theme-select"
                  @change="handleThemeChange"
                >
                  <el-option
                    v-for="theme in store.supportedThemes"
                    :key="theme"
                    :label="theme"
                    :value="theme"
                  />
                </el-select>
                <el-select 
                  v-model="store.background" 
                  class="background-select"
                  @change="handleBackgroundChange"
                >
                  <el-option
                    v-for="bg in store.supportedBackgrounds"
                    :key="bg"
                    :label="bg"
                    :value="bg"
                  />
                </el-select>
                <el-input-number
                  v-model="store.dpi"
                  :min="store.dpiRange.min"
                  :max="store.dpiRange.max"
                  :step="1"
                  class="dpi-input"
                  @change="handleDpiChange"
                />
                <el-button
                  type="primary"
                  :loading="store.isLoading"
                  @click="handleConvert"
                >
                  {{ $t('editor.convert') }}
                </el-button>
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
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>{{ $t('preview.title') }}</span>
                  <div class="preview-controls">
                    <el-button-group v-if="previewUrl">
                      <el-button @click="handleZoomOut">
                        <el-icon><ZoomOut /></el-icon>
                      </el-button>
                      <el-button @click="handleResetZoom">
                        {{ Math.round(zoomLevel * 100) }}%
                      </el-button>
                      <el-button @click="handleZoomIn">
                        <el-icon><ZoomIn /></el-icon>
                      </el-button>
                    </el-button-group>
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
                />
                <div v-else class="empty-preview">
                  {{ $t('preview.empty') }}
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Upload, Download, ZoomIn, ZoomOut } from '@element-plus/icons-vue';
import { useMermaidStore } from '../stores/mermaid';
import DownloadDialog from '../components/DownloadDialog.vue';

const store = useMermaidStore();
const previewUrl = ref<string>('');
const zoomLevel = ref(1);
const ZOOM_STEP = 0.1;
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.1;

// 初始化
onMounted(async () => {
  await store.fetchFormats();
});

// 处理代码变更
let timer: number | null = null;
const handleCodeChange = () => {
  if (timer) {
    clearTimeout(timer);
  }
  timer = window.setTimeout(async () => {
    if (store.code) {
      await handleConvert();
    }
  }, 1000);
};

// 处理转换
const handleConvert = async () => {
  try {
    // 预览时使用更高的 DPI 以获得更清晰的图像
    const previewDpi = Math.max(300, window.devicePixelRatio * 300);
    const url = await store.convert(store.code, store.format, previewDpi, store.theme, store.background);
    if (url) {
      // 如果之前有预览 URL，先释放它
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
      }
      previewUrl.value = url;
      zoomLevel.value = 1;
    }
  } catch (err) {
    console.error('Error converting:', err);
  }
};

// 处理上传
const handleUpload = async (file: File) => {
  try {
    const url = await store.upload(file);
    if (url) {
      // 如果之前有预览 URL，先释放它
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
      }
      previewUrl.value = url;
      zoomLevel.value = 1;
    }
  } catch (err) {
    console.error('Error uploading:', err);
  }
  return false;
};

// 处理下载
const handleDownload = async () => {
  if (store.code) {
    try {
      const blob = await api.convert(
        store.code,
        store.format,
        store.dpi,
        store.theme,
        store.background
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mermaid.${store.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  }
};

// 处理 DPI 变更
const handleDpiChange = async () => {
  if (store.code) {
    await handleConvert();
  }
};

// 处理格式变更
const handleFormatChange = async () => {
  if (store.code) {
    await handleConvert();
  }
};

// 处理主题变更
const handleThemeChange = async () => {
  if (store.code) {
    await handleConvert();
  }
};

// 处理背景变更
const handleBackgroundChange = async () => {
  if (store.code) {
    await handleConvert();
  }
};

const handleZoomIn = () => {
  if (zoomLevel.value < MAX_ZOOM) {
    zoomLevel.value = Math.min(MAX_ZOOM, zoomLevel.value + ZOOM_STEP);
  }
};

const handleZoomOut = () => {
  if (zoomLevel.value > MIN_ZOOM) {
    zoomLevel.value = Math.max(MIN_ZOOM, zoomLevel.value - ZOOM_STEP);
  }
};

const handleResetZoom = () => {
  zoomLevel.value = 1;
};
</script>

<style scoped>
.home {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.format-select,
.theme-select,
.background-select {
  width: 120px;
}

.dpi-input {
  width: 120px;
}

.error-alert {
  margin-top: 20px;
}

.preview-container {
  height: 600px;
  overflow: auto;
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
}

.preview-image {
  transition: transform 0.2s ease;
}

:deep(.el-image) {
  width: auto !important;
  display: inline-block;
}

.empty-preview {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
}

:deep(.el-textarea__inner) {
  font-family: monospace;
  height: 600px;
}

.preview-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

:deep(.el-button-group) {
  display: flex;
  align-items: center;
}

:deep(.el-button-group .el-button) {
  padding: 8px 12px;
}
</style> 