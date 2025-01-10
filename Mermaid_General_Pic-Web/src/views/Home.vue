<template>
  <div class="home">
    <NavBar />
    <el-container>
      <el-main>
        <!-- AI 对话栏 -->
        <el-row :gutter="20" class="mb-4">
          <el-col :span="24">
            <AiChat ref="aiChat" />
          </el-col>
        </el-row>

        <!-- Mermaid 编辑器和预览 -->
        <MermaidEditor ref="mermaidEditor" />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NavBar from '../components/NavBar.vue';
import AiChat from '../components/AiChat.vue';
import MermaidEditor from '../components/MermaidEditor.vue';

const aiChat = ref();
const mermaidEditor = ref();
</script>

<style scoped>
.home {
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
}

.mb-4 {
  margin-bottom: 24px;
}
</style> 