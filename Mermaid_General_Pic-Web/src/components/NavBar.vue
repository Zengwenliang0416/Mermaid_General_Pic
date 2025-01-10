<template>
  <el-header class="header">
    <div class="nav-container">
      <div class="nav-left">
        <router-link to="/" class="logo-link">
          <el-icon class="logo-icon"><Connection /></el-icon>
          <h2 class="logo">{{ t('editor.title') }}</h2>
        </router-link>

        <div class="nav-links">
          <router-link 
            to="/" 
            class="nav-link"
            :class="{ active: $route.path === '/' }"
          >
            <el-icon><HomeFilled /></el-icon>
            <span class="nav-item-text">{{ t('nav.home') }}</span>
          </router-link>

          <router-link 
            to="/history" 
            class="nav-link"
            :class="{ active: $route.path === '/history' }"
          >
            <el-icon><Timer /></el-icon>
            <span class="nav-item-text">{{ t('history.title') }}</span>
          </router-link>
        </div>
      </div>

      <div class="nav-right">
        <!-- 主题切换按钮 -->
        <el-tooltip
          :content="isDark ? '切换到浅色模式' : '切换到深色模式'"
          placement="bottom"
          :show-after="300"
        >
          <button class="theme-switch" @click="toggleTheme">
            <el-icon v-if="isDark"><Sunny /></el-icon>
            <el-icon v-else><Moon /></el-icon>
          </button>
        </el-tooltip>

        <!-- 帮助按钮 -->
        <el-tooltip
          content="查看帮助文档"
          placement="bottom"
          :show-after="300"
        >
          <el-button
            class="help-button"
            type="primary"
            link
            @click="showHelp"
          >
            <el-icon><QuestionFilled /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 帮助对话框 -->
    <el-dialog
      v-model="helpDialogVisible"
      :title="t('nav.help')"
      width="600px"
      class="help-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="help-content">
        <h3>快速开始</h3>
        <p>1. 在编辑器中输入 Mermaid 语法的图表代码</p>
        <p>2. 点击"转换"按钮生成图表</p>
        <p>3. 使用缩放控制和下载功能处理生成的图表</p>

        <h3>AI 助手</h3>
        <p>1. 选择合适的 AI 模型</p>
        <p>2. 输入 API 密钥</p>
        <p>3. 描述你想要生成的图表</p>
        <p>4. AI 将帮助你生成相应的 Mermaid 代码</p>

        <h3>历史记录</h3>
        <p>1. 每次生成的图表都会自动保存</p>
        <p>2. 点击导航栏的"历史"查看所有记录</p>
        <p>3. 可以随时回顾和重用之前的图表</p>

        <h3>键盘快捷键</h3>
        <div class="shortcut-list">
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
            <span>生成图表</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>S</kbd>
            <span>保存图表</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>Z</kbd>
            <span>撤销更改</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>/</kbd>
            <span>显示帮助</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="helpDialogVisible = false">
            {{ t('common.close') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </el-header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  HomeFilled,
  Timer,
  Connection,
  Sunny,
  Moon,
  QuestionFilled
} from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { useDark, useToggle } from '@vueuse/core';

const { t } = useI18n();
const isDark = useDark();
const toggleTheme = useToggle(isDark);
const helpDialogVisible = ref(false);

const showHelp = () => {
  helpDialogVisible.value = true;
};
</script>

<style scoped>
.header {
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  height: 60px;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease;
}

.logo-link:hover {
  transform: scale(1.02);
}

.logo-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.logo {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  background: linear-gradient(45deg, var(--el-color-primary), var(--el-color-primary-light-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--el-text-color-regular);
  font-size: 16px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.nav-link.active {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
  font-weight: 600;
}

.nav-link .el-icon {
  font-size: 18px;
}

.nav-item-text {
  margin-left: 4px;
}

.theme-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--el-text-color-regular);
}

.theme-switch:hover {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.theme-switch .el-icon {
  font-size: 20px;
}

.help-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.help-button .el-icon {
  font-size: 20px;
}

.help-content {
  padding: 20px;
  font-size: 14px;
  line-height: 1.6;
}

.help-content h3 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.help-content h3:first-child {
  margin-top: 0;
}

.help-content p {
  margin: 8px 0;
  color: var(--el-text-color-regular);
}

.shortcut-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: var(--el-bg-color-page);
  border-radius: 6px;
}

kbd {
  display: inline-block;
  padding: 3px 6px;
  font-family: var(--el-font-family);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  color: var(--el-color-white);
  background-color: var(--el-text-color-regular);
  border-radius: 4px;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2);
}

.dialog-footer {
  padding: 20px 0 0;
  text-align: right;
}

@media (max-width: 768px) {
  .nav-item-text {
    display: none;
  }

  .nav-link {
    padding: 8px;
  }

  .logo {
    font-size: 18px;
  }

  .nav-left {
    gap: 16px;
  }
}
</style> 