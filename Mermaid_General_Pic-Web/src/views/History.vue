<template>
  <div class="history">
    <el-container>
      <el-main>
        <el-card class="history-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon><Timer /></el-icon>
                <span>{{ t('history.title') }}</span>
              </div>
              <el-button
                type="danger"
                :disabled="!store.history.length"
                @click="handleClear"
                size="small"
              >
                <el-icon><Delete /></el-icon>
                {{ t('common.clear') }}
              </el-button>
            </div>
          </template>

          <el-empty
            v-if="!store.history.length"
            :description="t('history.empty')"
          />

          <el-timeline v-else>
            <el-timeline-item
              v-for="item in store.history"
              :key="item.timestamp"
              :timestamp="formatDate(item.timestamp)"
              :type="getTimelineType(item)"
              :hollow="true"
              size="large"
            >
              <el-card class="history-item" shadow="hover">
                <div class="history-content">
                  <div class="code-preview">
                    <div class="code-header">
                      <el-icon><Document /></el-icon>
                      <span>{{ t('history.code') }}</span>
                    </div>
                    <pre>{{ item.code }}</pre>
                  </div>
                  <div class="image-preview">
                    <div class="preview-header">
                      <el-icon><Picture /></el-icon>
                      <span>{{ t('preview.title') }}</span>
                    </div>
                    <el-image
                      :src="`${config.apiBaseUrl}${item.url}`"
                      fit="contain"
                      class="preview-image"
                      :preview-src-list="[`${config.apiBaseUrl}${item.url}`]"
                      hide-on-click-modal
                    >
                      <template #placeholder>
                        <div class="image-placeholder">
                          <el-icon><Loading /></el-icon>
                        </div>
                      </template>
                      <template #error>
                        <div class="image-error">
                          <el-icon><PictureFilled /></el-icon>
                          <span>{{ t('preview.error') }}</span>
                        </div>
                      </template>
                    </el-image>
                  </div>
                </div>
                <div class="history-footer">
                  <div class="history-info">
                    <el-tooltip :content="t('editor.format')" placement="top">
                      <el-tag size="small" effect="plain">{{ item.format.toUpperCase() }}</el-tag>
                    </el-tooltip>
                    <el-tooltip :content="t('editor.dpi')" placement="top">
                      <el-tag size="small" type="info" effect="plain">{{ item.dpi }} DPI</el-tag>
                    </el-tooltip>
                    <el-tooltip :content="t('editor.theme')" placement="top">
                      <el-tag size="small" type="success" effect="plain">{{ t(`theme.${item.theme}`) }}</el-tag>
                    </el-tooltip>
                    <el-tooltip :content="t('editor.background')" placement="top">
                      <el-tag size="small" type="warning" effect="plain">{{ t(`background.${item.background}`) }}</el-tag>
                    </el-tooltip>
                  </div>
                  <div class="history-actions">
                    <el-tooltip :content="t('history.load_tooltip')" placement="top">
                      <el-button
                        type="primary"
                        link
                        @click="handleLoad(item)"
                      >
                        <el-icon><RefreshRight /></el-icon>
                        {{ t('common.load') }}
                      </el-button>
                    </el-tooltip>
                    <el-tooltip :content="t('history.download_tooltip')" placement="top">
                      <el-button
                        type="primary"
                        link
                        @click="handleDownload(item)"
                      >
                        <el-icon><Download /></el-icon>
                        {{ t('common.download') }}
                      </el-button>
                    </el-tooltip>
                  </div>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useMermaidStore, type ConversionHistory } from '../stores/mermaid';
import { useI18n } from 'vue-i18n';
import {
  Timer,
  Delete,
  Document,
  Picture,
  Loading,
  PictureFilled,
  Download,
  RefreshRight
} from '@element-plus/icons-vue';
import { config } from '../config/config';

const { t } = useI18n();
const router = useRouter();
const store = useMermaidStore();

// 格式化日期
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (diff < oneDay) {
    return t('history.today', { time: date.toLocaleTimeString() });
  } else if (diff < 2 * oneDay) {
    return t('history.yesterday', { time: date.toLocaleTimeString() });
  } else {
    return date.toLocaleString();
  }
};

// 获取时间轴节点类型
const getTimelineType = (item: ConversionHistory) => {
  switch (item.format) {
    case 'png':
      return 'primary';
    case 'svg':
      return 'success';
    case 'jpg':
      return 'warning';
    default:
      return 'info';
  }
};

// 处理清除历史记录
const handleClear = async () => {
  try {
    await ElMessageBox.confirm(
      t('history.clear_confirm'),
      t('history.clear'),
      {
        confirmButtonText: t('common.clear'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    );
    store.clearHistory();
    ElMessage.success(t('history.clear_success'));
  } catch {
    // 用户取消
  }
};

// 处理加载历史记录
const handleLoad = (item: ConversionHistory) => {
  store.loadFromHistory(item);
  router.push('/');
  ElMessage.success(t('history.load_success'));
};

// 处理下载
const handleDownload = async (item: ConversionHistory) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}${item.url}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mermaid.${item.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Download failed:', err);
    ElMessage.error(t('download.error'));
  }
};
</script>

<style scoped>
.history {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
}

.history-card {
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.history-item {
  margin-bottom: 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.history-content {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.code-preview,
.image-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
}

.code-header,
.preview-header {
  padding: 8px 12px;
  background-color: var(--el-bg-color-page);
  font-weight: 500;
  font-size: 14px;
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-preview pre {
  margin: 0;
  padding: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.5;
  overflow: auto;
  max-height: 180px;
  color: var(--el-text-color-primary);
}

.image-preview .el-image {
  padding: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--el-bg-color);
}

.preview-image {
  max-width: 100%;
  max-height: 180px;
  transition: transform 0.3s ease;
}

.preview-image:hover {
  transform: scale(1.02);
}

.image-placeholder,
.image-error {
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.history-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.history-info {
  display: flex;
  gap: 8px;
}

.history-actions {
  display: flex;
  gap: 16px;
}

:deep(.el-timeline) {
  padding: 16px;
}

:deep(.el-timeline-item__node) {
  background-color: var(--el-color-primary);
}

:deep(.el-timeline-item__tail) {
  border-left-color: var(--el-border-color);
}

:deep(.el-timeline-item__timestamp) {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

:deep(.el-button--small) {
  padding: 8px 16px;
}

:deep(.el-tag) {
  border-radius: 4px;
}

@media (max-width: 768px) {
  .history-content {
    flex-direction: column;
  }

  .code-preview,
  .image-preview {
    width: 100%;
  }

  .history-footer {
    flex-direction: column;
    gap: 16px;
  }

  .history-info,
  .history-actions {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style> 