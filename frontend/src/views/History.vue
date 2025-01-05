<template>
  <div class="history">
    <el-container>
      <el-main>
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ $t('history.title') }}</span>
              <el-button
                type="danger"
                :disabled="!store.history.length"
                @click="handleClear"
              >
                {{ $t('history.clear') }}
              </el-button>
            </div>
          </template>

          <el-empty
            v-if="!store.history.length"
            :description="$t('history.empty')"
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
                    <pre>{{ item.code }}</pre>
                  </div>
                  <div class="image-preview">
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
                  </div>
                  <div class="history-actions">
                    <el-button
                      type="primary"
                      link
                      @click="handleLoad(item)"
                    >
                      {{ $t('history.load') }}
                    </el-button>
                    <el-button
                      type="primary"
                      link
                      @click="handleDownload(item)"
                    >
                      {{ $t('history.download') }}
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
import { ElMessageBox } from 'element-plus';
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
      t('history.clearConfirm'),
      t('history.clearTitle'),
      {
        type: 'warning'
      }
    );
    store.clearHistory();
  } catch {
    // 用户取消
  }
};

// 处理加载历史记录
const handleLoad = (item: ConversionHistory) => {
  store.loadFromHistory(item);
  router.push('/');
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

.code-preview {
  flex: 1;
  overflow: auto;
  max-height: 200px;
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 10px;
}

.code-preview pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  font-size: 12px;
}

.image-preview {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 10px;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
}

.history-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-info {
  display: flex;
  gap: 10px;
}

.history-actions {
  display: flex;
  gap: 10px;
}
</style> 