<template>
  <div class="json-editor">
    <json-editor-vue
      v-model="jsonData"
      :main-menu-bar="false"
      :navigation-bar="false"
      :status-bar="false"
      :read-only="false"
      :indentation="2"
      :tab-size="2"
      class="editor"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import JsonEditorVue from 'json-editor-vue'
import type { TranslationContent } from '../types'

const props = defineProps<{
  modelValue: TranslationContent // JSON-данные
}>()

const emit = defineEmits(['update:modelValue'])

const jsonData = ref(props.modelValue)

// Следим за изменениями в редакторе
watch(jsonData, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })
</script>

<style scoped>
.json-editor {
  height: 100%;
  overflow: hidden;
}

.editor {
  height: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}
</style>
