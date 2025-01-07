<template>
  <div class="history">
    <el-container>
      <el-main>
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ t('history.title') }}</span>
              <el-button
                type="danger"
                :disabled="!store.history.length"
                @click="handleClear"
              >
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
            >
              <el-card class="history-item">
                <div class="history-content">
                  <div class="code-preview">
                    <div class="code-header">
                      <span>{{ t('history.code') }}</span>
                    </div>
                    <pre>{{ item.code }}</pre>
                  </div>
                  <div class="image-preview">
                    <div class="preview-header">
                      <span>{{ t('preview.title') }}</span>
                    </div>
                    <el-image
                      :src="`http://localhost:8000${item.url}`"
                      fit="contain"
                      class="preview-image"
                    />
                  </div>
                </div>
                <div class="history-footer">
                  <div class="history-info">
                    <el-tag size="small">{{ item.format.toUpperCase() }}</el-tag>
                    <el-tag size="small" type="info">{{ item.dpi }} DPI</el-tag>
                    <el-tag size="small" type="success">{{ t(`theme.${item.theme}`) }}</el-tag>
                    <el-tag size="small" type="warning">{{ t(`background.${item.background}`) }}</el-tag>
                  </div>
                  <div class="history-actions">
                    <el-button
                      type="primary"
                      link
                      @click="handleLoad(item)"
                    >
                      {{ t('common.load') }}
                    </el-button>
                    <el-button
                      type="primary"
                      link
                      @click="handleDownload(item)"
                    >
                      {{ t('common.download') }}
                    </el-button>
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

const { t } = useI18n();
const router = useRouter();
const store = useMermaidStore();

// 格式化日期
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
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
    const response = await fetch(`http://localhost:8000${item.url}`);
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
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-item {
  margin-bottom: 20px;
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
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.code-header,
.preview-header {
  padding: 8px 12px;
  background-color: #e4e7ed;
  font-weight: 500;
  font-size: 14px;
}

.code-preview pre {
  margin: 0;
  padding: 10px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  font-size: 12px;
  overflow: auto;
  max-height: 180px;
}

.image-preview .el-image {
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-image {
  max-width: 100%;
  max-height: 180px;
}

.history-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.history-info {
  display: flex;
  gap: 10px;
}

.history-actions {
  display: flex;
  gap: 10px;
}

:deep(.el-timeline-item__node) {
  background-color: #409eff;
}

:deep(.el-timeline-item__tail) {
  border-left-color: #e4e7ed;
}

:deep(.el-timeline-item__timestamp) {
  color: #606266;
}
</style> 