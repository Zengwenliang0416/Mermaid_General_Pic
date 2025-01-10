<template>
  <div class="history-page">
    <NavBar />
    <el-container>
      <el-main>
        <el-card class="history-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon><Timer /></el-icon>
                <span>{{ t('history.title') }}</span>
              </div>
              <div class="header-actions">
                <el-button
                  type="danger"
                  plain
                  size="small"
                  @click="handleClearHistory"
                >
                  <el-icon><Delete /></el-icon>
                  {{ t('history.clear') }}
                </el-button>
              </div>
            </div>
          </template>

          <div v-if="store.history.length > 0" class="history-list">
            <div
              v-for="(item, index) in store.history"
              :key="index"
              class="history-item"
            >
              <div class="item-preview">
                <el-image
                  :src="item.url"
                  fit="contain"
                  :preview-src-list="[item.url]"
                  :initial-index="0"
                  preview-teleported
                  class="preview-image"
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
              </div>

              <div class="item-info">
                <div class="info-header">
                  <span class="timestamp">{{ formatTime(item.timestamp) }}</span>
                  <div class="info-actions">
                    <el-button
                      type="primary"
                      link
                      size="small"
                      @click="handleLoad(item)"
                    >
                      <el-icon><Edit /></el-icon>
                      {{ t('history.load') }}
                    </el-button>
                    <el-button
                      type="danger"
                      link
                      size="small"
                      @click="handleDelete(index)"
                    >
                      <el-icon><Delete /></el-icon>
                      {{ t('history.delete') }}
                    </el-button>
                  </div>
                </div>

                <el-collapse>
                  <el-collapse-item>
                    <template #title>
                      <el-icon><Document /></el-icon>
                      <span>{{ t('history.show_code') }}</span>
                    </template>
                    <pre class="code-block">{{ item.code }}</pre>
                  </el-collapse-item>
                </el-collapse>

                <div class="item-meta">
                  <el-tag size="small" type="info">
                    {{ t('editor.format') }}: {{ item.format }}
                  </el-tag>
                  <el-tag size="small" type="info">
                    {{ t('editor.dpi') }}: {{ item.dpi }}
                  </el-tag>
                  <el-tag size="small" type="info">
                    {{ t('editor.theme') }}: {{ item.theme }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>

          <el-empty
            v-else
            :description="t('history.empty')"
            :image-size="200"
          />
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { Timer, Loading, PictureFilled, Edit, Delete, Document } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useMermaidStore } from '../stores/mermaid';
import { ElMessageBox } from 'element-plus';
import NavBar from '../components/NavBar.vue';

const { t } = useI18n();
const router = useRouter();
const store = useMermaidStore();

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

// 加载历史记录
const handleLoad = (item: any) => {
  store.code = item.code;
  store.format = item.format;
  store.dpi = item.dpi;
  store.theme = item.theme;
  store.background = item.background;
  router.push('/');
};

// 删除单条历史记录
const handleDelete = async (index: number) => {
  try {
    await ElMessageBox.confirm(
      t('history.delete_confirm'),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
      }
    );
    
    // 释放 URL
    URL.revokeObjectURL(store.history[index].url);
    // 删除记录
    store.history.splice(index, 1);
  } catch {
    // 用户取消删除
  }
};

// 清空历史记录
const handleClearHistory = async () => {
  try {
    await ElMessageBox.confirm(
      t('history.clear_confirm'),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
      }
    );
    
    // 释放所有 URL
    store.history.forEach(item => {
      URL.revokeObjectURL(item.url);
    });
    // 清空历史记录
    store.history = [];
  } catch {
    // 用户取消清空
  }
};
</script>

<style scoped>
.history-page {
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
}

.history-card {
  margin: 24px auto;
  max-width: 1200px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
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

.history-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.history-item {
  display: flex;
  gap: 24px;
  padding: 20px;
  border-radius: 12px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  transition: all 0.3s ease;
}

.history-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.item-preview {
  width: 300px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
}

.preview-image {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-bg-color-page);
}

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

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timestamp {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.info-actions {
  display: flex;
  gap: 12px;
}

.code-block {
  margin: 12px 0;
  padding: 16px;
  background-color: var(--el-bg-color-page);
  border-radius: 8px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--el-text-color-regular);
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
}

:deep(.el-collapse) {
  border: none;
  --el-collapse-header-height: 40px;
}

:deep(.el-collapse-item__header) {
  font-size: 14px;
  color: var(--el-text-color-regular);
  border: none;
}

:deep(.el-collapse-item__content) {
  padding: 0;
}

:deep(.el-collapse-item__header .el-icon) {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .history-item {
    flex-direction: column;
  }

  .item-preview {
    width: 100%;
  }
}
</style> 