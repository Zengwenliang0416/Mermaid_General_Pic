# 前端组件 API 文档

## 编辑器组件

### Editor.vue

Mermaid 代码编辑器组件。

#### Props

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | `''` | 编辑器内容（v-model） |
| `theme` | `string` | `'default'` | 编辑器主题 |
| `language` | `string` | `'mermaid'` | 编辑器语言 |
| `readOnly` | `boolean` | `false` | 是否只读 |

#### 事件

| 名称 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `(value: string)` | 编辑器内容更新 |
| `change` | `(value: string)` | 编辑器内容变化 |
| `save` | `(value: string)` | 保存编辑器内容 |

#### 插槽

| 名称 | 说明 |
|------|------|
| `toolbar` | 工具栏插槽 |
| `footer` | 底部插槽 |

#### 示例

```vue
<template>
  <Editor
    v-model="code"
    theme="dark"
    @save="handleSave"
  >
    <template #toolbar>
      <button @click="clear">清空</button>
    </template>
  </Editor>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Editor from '@/components/Editor.vue'

const code = ref('')
const handleSave = (value: string) => {
  console.log('保存内容:', value)
}
const clear = () => {
  code.value = ''
}
</script>
```

### Preview.vue

Mermaid 图表预览组件。

#### Props

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `code` | `string` | `''` | Mermaid 代码 |
| `theme` | `string` | `'default'` | 图表主题 |
| `backgroundColor` | `string` | `'transparent'` | 背景颜色 |
| `dpi` | `number` | `300` | 导出图片的 DPI |

#### 事件

| 名称 | 参数 | 说明 |
|------|------|------|
| `render-success` | `(svg: string)` | 渲染成功 |
| `render-error` | `(error: Error)` | 渲染失败 |
| `export-success` | `(url: string)` | 导出成功 |
| `export-error` | `(error: Error)` | 导出失败 |

#### 方法

| 名称 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `exportImage` | `(format: string)` | `Promise<string>` | 导出图片 |
| `refresh` | - | `Promise<void>` | 刷新预览 |

#### 示例

```vue
<template>
  <Preview
    :code="code"
    theme="forest"
    @render-success="handleSuccess"
    @render-error="handleError"
  >
    <template #toolbar>
      <button @click="exportPNG">导出 PNG</button>
    </template>
  </Preview>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Preview from '@/components/Preview.vue'

const code = ref('graph TD\nA[开始] --> B[结束]')
const previewRef = ref()

const handleSuccess = (svg: string) => {
  console.log('渲染成功')
}

const handleError = (error: Error) => {
  console.error('渲染失败:', error)
}

const exportPNG = async () => {
  try {
    const url = await previewRef.value.exportImage('png')
    console.log('导出成功:', url)
  } catch (error) {
    console.error('导出失败:', error)
  }
}
</script>
```

### AIPrompt.vue

AI 提示输入组件。

#### Props

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | `''` | 输入内容（v-model） |
| `placeholder` | `string` | `'请输入提示...'` | 占位文本 |
| `loading` | `boolean` | `false` | 加载状态 |
| `models` | `Array<Model>` | `[]` | 可用的 AI 模型列表 |
| `selectedModel` | `string` | `''` | 选中的模型 ID |

#### 事件

| 名称 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `(value: string)` | 输入内容更新 |
| `update:selectedModel` | `(value: string)` | 选中模型更新 |
| `submit` | `(prompt: string, model: string)` | 提交提示 |

#### 插槽

| 名称 | 说明 |
|------|------|
| `prefix` | 输入框前缀 |
| `suffix` | 输入框后缀 |

#### 示例

```vue
<template>
  <AIPrompt
    v-model="prompt"
    v-model:selectedModel="modelId"
    :models="models"
    :loading="loading"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AIPrompt from '@/components/AIPrompt.vue'

const prompt = ref('')
const modelId = ref('kimi-v1')
const loading = ref(false)
const models = [
  { id: 'kimi-v1', name: 'Kimi' },
  { id: 'deepseek-v1', name: 'DeepSeek' }
]

const handleSubmit = async (prompt: string, model: string) => {
  loading.value = true
  try {
    // 处理提交
  } finally {
    loading.value = false
  }
}
</script>
```

### History.vue

转换历史记录组件。

#### Props

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `Array<HistoryItem>` | `[]` | 历史记录列表 |
| `loading` | `boolean` | `false` | 加载状态 |

#### 事件

| 名称 | 参数 | 说明 |
|------|------|------|
| `select` | `(item: HistoryItem)` | 选择历史记录 |
| `delete` | `(item: HistoryItem)` | 删除历史记录 |
| `clear` | - | 清空历史记录 |

#### 类型定义

```typescript
interface HistoryItem {
  id: string
  code: string
  timestamp: number
  preview?: string
}
```

#### 示例

```vue
<template>
  <History
    :items="historyItems"
    :loading="loading"
    @select="handleSelect"
    @delete="handleDelete"
    @clear="handleClear"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import History from '@/components/History.vue'

const historyItems = ref([
  {
    id: '1',
    code: 'graph TD\nA[开始] --> B[结束]',
    timestamp: Date.now()
  }
])
const loading = ref(false)

const handleSelect = (item: HistoryItem) => {
  console.log('选择:', item)
}

const handleDelete = (item: HistoryItem) => {
  console.log('删除:', item)
}

const handleClear = () => {
  console.log('清空历史')
}
</script>
```

## 工具函数

### useEditor

编辑器相关的组合式函数。

#### 参数

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `options` | `EditorOptions` | `{}` | 编辑器配置项 |

#### 返回值

| 名称 | 类型 | 说明 |
|------|------|------|
| `code` | `Ref<string>` | 编辑器内容 |
| `setCode` | `(value: string) => void` | 设置编辑器内容 |
| `clear` | `() => void` | 清空编辑器 |
| `undo` | `() => void` | 撤销 |
| `redo` | `() => void` | 重做 |

#### 示例

```typescript
import { useEditor } from '@/composables/editor'

const { code, setCode, clear, undo, redo } = useEditor({
  theme: 'dark',
  language: 'mermaid'
})
```

### usePreview

预览相关的组合式函数。

#### 参数

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `options` | `PreviewOptions` | `{}` | 预览配置项 |

#### 返回值

| 名称 | 类型 | 说明 |
|------|------|------|
| `svg` | `Ref<string>` | 预览 SVG |
| `loading` | `Ref<boolean>` | 加载状态 |
| `error` | `Ref<Error \| null>` | 错误信息 |
| `render` | `(code: string) => Promise<void>` | 渲染函数 |
| `export` | `(format: string) => Promise<string>` | 导出函数 |

#### 示例

```typescript
import { usePreview } from '@/composables/preview'

const { svg, loading, error, render, export: exportImage } = usePreview({
  theme: 'default',
  backgroundColor: 'transparent'
})
```

## 语言切换

- [English Version](../en/api/frontend.md)
- [中文版本](./frontend.md) 