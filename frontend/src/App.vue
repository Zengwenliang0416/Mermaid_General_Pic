<template>
  <el-config-provider :locale="elementLocale">
    <el-container>
      <el-header>
        <el-menu
          mode="horizontal"
          router
          :ellipsis="false"
        >
          <el-menu-item index="/">
            <template #title>
              {{ $t('editor.title') }}
            </template>
          </el-menu-item>
          <el-menu-item index="/history">
            <template #title>
              {{ $t('history.title') }}
            </template>
          </el-menu-item>
          <div class="flex-grow" />
          <el-menu-item>
            <template #title>
              <el-switch
                v-model="isZh"
                active-text="中文"
                inactive-text="English"
                @change="handleLocaleChange"
              />
            </template>
          </el-menu-item>
        </el-menu>
      </el-header>
      <router-view />
    </el-container>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import en from 'element-plus/dist/locale/en.mjs';

const { locale } = useI18n();
const isZh = ref(locale.value === 'zh');

const elementLocale = computed(() => isZh.value ? zhCn : en);

const handleLocaleChange = (value: boolean) => {
  locale.value = value ? 'zh' : 'en';
};
</script>

<style>
.el-header {
  padding: 0;
}

.flex-grow {
  flex-grow: 1;
}

.el-menu {
  justify-content: flex-start;
}
</style>
