# Frontend Component API Documentation

## Editor Components

### Editor.vue

Mermaid code editor component.

#### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | Editor content (v-model) |
| `theme` | `string` | `'default'` | Editor theme |
| `language` | `string` | `'mermaid'` | Editor language |
| `readOnly` | `boolean` | `false` | Read-only mode |

#### Events

| Name | Parameters | Description |
|------|------------|-------------|
| `update:modelValue` | `(value: string)` | Editor content update |
| `change` | `(value: string)` | Editor content change |
| `save` | `(value: string)` | Save editor content |

#### Slots

| Name | Description |
|------|-------------|
| `toolbar` | Toolbar slot |
| `footer` | Footer slot |

#### Example

```vue
<template>
  <Editor
    v-model="code"
    theme="dark"
    @save="handleSave"
  >
    <template #toolbar>
      <button @click="clear">Clear</button>
    </template>
  </Editor>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Editor from '@/components/Editor.vue'

const code = ref('')
const handleSave = (value: string) => {
  console.log('Content saved:', value)
}
const clear = () => {
  code.value = ''
}
</script>
```

### Preview.vue

Mermaid chart preview component.

#### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | `''` | Mermaid code |
| `theme` | `string` | `'default'` | Chart theme |
| `backgroundColor` | `string` | `'transparent'` | Background color |
| `dpi` | `number` | `300` | Export image DPI |

#### Events

| Name | Parameters | Description |
|------|------------|-------------|
| `render-success` | `(svg: string)` | Render success |
| `render-error` | `(error: Error)` | Render error |
| `export-success` | `(url: string)` | Export success |
| `export-error` | `(error: Error)` | Export error |

#### Methods

| Name | Parameters | Return | Description |
|------|------------|--------|-------------|
| `exportImage` | `(format: string)` | `Promise<string>` | Export image |
| `refresh` | - | `Promise<void>` | Refresh preview |

#### Example

```vue
<template>
  <Preview
    :code="code"
    theme="forest"
    @render-success="handleSuccess"
    @render-error="handleError"
  >
    <template #toolbar>
      <button @click="exportPNG">Export PNG</button>
    </template>
  </Preview>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Preview from '@/components/Preview.vue'

const code = ref('graph TD\nA[Start] --> B[End]')
const previewRef = ref()

const handleSuccess = (svg: string) => {
  console.log('Render successful')
}

const handleError = (error: Error) => {
  console.error('Render failed:', error)
}

const exportPNG = async () => {
  try {
    const url = await previewRef.value.exportImage('png')
    console.log('Export successful:', url)
  } catch (error) {
    console.error('Export failed:', error)
  }
}
</script>
```

### AIPrompt.vue

AI prompt input component.

#### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | Input content (v-model) |
| `placeholder` | `string` | `'Enter prompt...'` | Placeholder text |
| `loading` | `boolean` | `false` | Loading state |
| `models` | `Array<Model>` | `[]` | Available AI models |
| `selectedModel` | `string` | `''` | Selected model ID |

#### Events

| Name | Parameters | Description |
|------|------------|-------------|
| `update:modelValue` | `(value: string)` | Input content update |
| `update:selectedModel` | `(value: string)` | Selected model update |
| `submit` | `(prompt: string, model: string)` | Submit prompt |

#### Slots

| Name | Description |
|------|-------------|
| `prefix` | Input prefix |
| `suffix` | Input suffix |

#### Example

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
    // Handle submission
  } finally {
    loading.value = false
  }
}
</script>
```

### History.vue

Conversion history component.

#### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array<HistoryItem>` | `[]` | History items list |
| `loading` | `boolean` | `false` | Loading state |

#### Events

| Name | Parameters | Description |
|------|------------|-------------|
| `select` | `(item: HistoryItem)` | Select history item |
| `delete` | `(item: HistoryItem)` | Delete history item |
| `clear` | - | Clear history |

#### Type Definitions

```typescript
interface HistoryItem {
  id: string
  code: string
  timestamp: number
  preview?: string
}
```

#### Example

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
    code: 'graph TD\nA[Start] --> B[End]',
    timestamp: Date.now()
  }
])
const loading = ref(false)

const handleSelect = (item: HistoryItem) => {
  console.log('Selected:', item)
}

const handleDelete = (item: HistoryItem) => {
  console.log('Deleted:', item)
}

const handleClear = () => {
  console.log('History cleared')
}
</script>
```

## Utility Functions

### useEditor

Editor-related composable function.

#### Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `EditorOptions` | `{}` | Editor options |

#### Returns

| Name | Type | Description |
|------|------|-------------|
| `code` | `Ref<string>` | Editor content |
| `setCode` | `(value: string) => void` | Set editor content |
| `clear` | `() => void` | Clear editor |
| `undo` | `() => void` | Undo |
| `redo` | `() => void` | Redo |

#### Example

```typescript
import { useEditor } from '@/composables/editor'

const { code, setCode, clear, undo, redo } = useEditor({
  theme: 'dark',
  language: 'mermaid'
})
```

### usePreview

Preview-related composable function.

#### Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `PreviewOptions` | `{}` | Preview options |

#### Returns

| Name | Type | Description |
|------|------|-------------|
| `svg` | `Ref<string>` | Preview SVG |
| `loading` | `Ref<boolean>` | Loading state |
| `error` | `Ref<Error \| null>` | Error message |
| `render` | `(code: string) => Promise<void>` | Render function |
| `export` | `(format: string) => Promise<string>` | Export function |

#### Example

```typescript
import { usePreview } from '@/composables/preview'

const { svg, loading, error, render, export: exportImage } = usePreview({
  theme: 'default',
  backgroundColor: 'transparent'
})
```

## Language Switch

- [English Version](./frontend.md)
- [中文版本](../../zh/api/frontend.md) 