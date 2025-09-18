<template>
  <div class="editor-selector">
    <div class="editor-selector__tabs">
      <button
        v-for="option in editorOptions"
        :key="option.value"
        class="editor-tab"
        :class="{ 'editor-tab--active': modelValue === option.value }"
        @click="$emit('update:modelValue', option.value)"
      >
        <span class="editor-tab__icon">{{ option.icon }}</span>
        <span class="editor-tab__label">{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface EditorOption {
  value: string
  label: string
  description: string
  icon: string
}

interface Props {
  modelValue: string
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorOptions = ref<EditorOption[]>([
  {
    value: 'translation',
    label: 'Visual Editor',
    description: 'User-friendly interface for editing translations',
    icon: '🌐',
  },
  {
    value: 'json',
    label: 'Visual Editor',
    description: 'Raw JSON editing with syntax highlighting',
    icon: '📝',
  },
])
</script>

<style scoped>
.editor-selector {
  @apply bg-white border-b border-slate-200;
}

.editor-selector__tabs {
  @apply flex;
}

.editor-tab {
  @apply flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600
  border-b-2 border-transparent transition-all duration-200 hover:text-slate-800 hover:bg-slate-50;
}

.editor-tab--active {
  @apply text-blue-600 border-blue-500 bg-blue-50;
}

.editor-tab__icon {
  @apply text-base;
}

.editor-tab__label {
  @apply whitespace-nowrap;
}
</style>
