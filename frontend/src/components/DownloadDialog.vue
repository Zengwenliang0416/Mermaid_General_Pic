<template>
  <el-dialog
    v-model="dialogVisible"
    :title="t('download.title')"
    width="500px"
    class="download-dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form :model="form" label-width="120px" class="download-form">
      <el-form-item :label="t('download.filename')">
        <el-input 
          v-model="form.filename" 
          :placeholder="t('download.filename_placeholder')"
          clearable
        />
      </el-form-item>
      <el-form-item :label="t('download.format')">
        <el-select 
          v-model="form.format" 
          style="width: 100%"
          :placeholder="t('download.format_placeholder')"
        >
          <el-option
            v-for="format in store.supportedFormats"
            :key="format"
            :label="format.toUpperCase()"
            :value="format"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('download.dpi')">
        <el-input-number
          v-model="form.dpi"
          :min="store.dpiRange.min"
          :max="store.dpiRange.max"
          :step="100"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="t('download.theme')">
        <el-select 
          v-model="form.theme" 
          style="width: 100%"
          :placeholder="t('download.theme_placeholder')"
        >
          <el-option
            v-for="theme in store.supportedThemes"
            :key="theme"
            :label="t(`theme.${theme}`)"
            :value="theme"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('download.background')">
        <el-select 
          v-model="form.background" 
          style="width: 100%"
          :placeholder="t('download.background_placeholder')"
        >
          <el-option
            v-for="bg in store.supportedBackgrounds"
            :key="bg"
            :label="t(`background.${bg}`)"
            :value="bg"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button
          type="primary"
          @click="handleDownload"
          :loading="downloading"
        >
          {{ t('common.download') }}
        </el-button>
      </span>
    </template>
  </el-dialog>

  <el-button
    type="primary"
    :disabled="!code"
    @click="dialogVisible = true"
  >
    <el-icon><Download /></el-icon>
    {{ t('preview.download') }}
  </el-button>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { Download } from '@element-plus/icons-vue';
import { useMermaidStore } from '../stores/mermaid';
import { api } from '../services/api';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps<{
  code: string;
}>();

const store = useMermaidStore();
const dialogVisible = ref(false);
const downloading = ref(false);

const form = reactive({
  filename: 'mermaid-diagram',
  format: store.format,
  dpi: store.dpi,
  theme: store.theme,
  background: store.background,
});

const handleOpen = async () => {
  if (store.supportedFormats.length === 0) {
    await store.fetchFormats();
  }
  form.format = store.format;
  form.dpi = store.dpi;
  form.theme = store.theme;
  form.background = store.background;
};

watch(dialogVisible, (newValue) => {
  if (newValue) {
    handleOpen();
  }
});

const handleDownload = async () => {
  if (!props.code) return;

  downloading.value = true;
  try {
    const blob = await api.convert(
      props.code,
      form.format,
      form.dpi,
      form.theme,
      form.background
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${form.filename}.${form.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    dialogVisible.value = false;
    ElMessage.success(t('download.success'));
  } catch (err) {
    console.error('Download failed:', err);
    ElMessage.error(t('download.error'));
  } finally {
    downloading.value = false;
  }
};
</script>

<style scoped>
.download-dialog :deep(.el-dialog__body) {
  padding: 20px 30px;
}

.download-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.download-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.download-form :deep(.el-input__wrapper),
.download-form :deep(.el-select__wrapper) {
  box-shadow: none;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.download-form :deep(.el-input__wrapper:hover),
.download-form :deep(.el-select__wrapper:hover) {
  border-color: #409eff;
}

.download-form :deep(.el-input__wrapper.is-focus),
.download-form :deep(.el-select__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 1px #409eff;
}

.download-form :deep(.el-input-number .el-input__wrapper) {
  padding-right: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 