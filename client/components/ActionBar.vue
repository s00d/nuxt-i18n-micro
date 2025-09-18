<template>
  <div class="action-bar">
    <div class="action-bar__left">
      <!-- Editor Selector Dropdown -->
      <div class="editor-dropdown">
        <button
          class="editor-dropdown__trigger"
          @click="showEditorDropdown = !showEditorDropdown"
        >
          <span class="editor-dropdown__icon">🖋️</span>
          <span class="editor-dropdown__label">{{ currentEditorLabel }}</span>
          <span class="editor-dropdown__arrow">▼</span>
        </button>

        <div
          v-if="showEditorDropdown"
          class="editor-dropdown__menu"
        >
          <button
            v-for="option in editorOptions"
            :key="option.value"
            class="editor-dropdown__item"
            :class="{ 'editor-dropdown__item--active': modelValue === option.value }"
            @click="selectEditor(option.value)"
          >
            <span class="editor-dropdown__item-icon">{{ option.icon }}</span>
            <span class="editor-dropdown__item-label">{{ option.label }}</span>
          </button>
        </div>
      </div>

      <NButton
        class="action-btn action-btn--export"
        title="Export"
        @click="emit('export')"
      >
        <span class="action-btn__icon">📤</span>
      </NButton>

      <NButton
        class="action-btn action-btn--import"
        title="Import"
        @click="emit('import')"
      >
        <span class="action-btn__icon">📥</span>
      </NButton>

      <NButton
        class="action-btn action-btn--stats"
        title="Stats"
        @click="emit('show-stats')"
      >
        <span class="action-btn__icon">📊</span>
      </NButton>

      <NButton
        v-if="showTranslateButton"
        class="action-btn action-btn--translate"
        title="Translate"
        @click="emit('translate-missing')"
      >
        <span class="action-btn__icon">🌐</span>
      </NButton>
    </div>

    <NButton
      class="action-btn action-btn--save"
      title="Save"
      @click="emit('save')"
    >
      <span class="action-btn__icon">💾</span>
    </NButton>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  showTranslateButton?: boolean
  modelValue?: string
}

interface EditorOption {
  value: string
  label: string
  icon: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'translation',
})

const emit = defineEmits<{
  'export': []
  'import': []
  'show-stats': []
  'translate-missing': []
  'save': []
  'update:modelValue': [value: string]
}>()

const showEditorDropdown = ref(false)

const editorOptions: EditorOption[] = [
  {
    value: 'translation',
    label: 'Visual',
    icon: '🌐',
  },
  {
    value: 'json',
    label: 'JSON',
    icon: '📝',
  },
]

const currentEditorLabel = computed(() => {
  const option = editorOptions.find(opt => opt.value === props.modelValue)
  return option?.label || 'Visual'
})

const selectEditor = (value: string) => {
  emit('update:modelValue', value)
  showEditorDropdown.value = false
}
</script>

<style scoped>
.action-bar {
  @apply flex items-center justify-between p-3 bg-white border-b border-slate-200;
}

.action-bar__left {
  @apply flex items-center gap-2 flex-wrap;
}

/* Editor Dropdown */
.editor-dropdown {
  @apply relative;
}

.editor-dropdown__trigger {
  @apply flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md
  bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900
  transition-all duration-200 border border-slate-200;
}

.editor-dropdown__icon {
  @apply text-sm;
}

.editor-dropdown__label {
  @apply whitespace-nowrap;
}

.editor-dropdown__arrow {
  @apply text-xs transition-transform duration-200;
}

.editor-dropdown__trigger:hover .editor-dropdown__arrow {
  @apply transform rotate-180;
}

.editor-dropdown__menu {
  @apply absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 min-w-48;
}

.editor-dropdown__item {
  @apply flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors duration-200;
}

.editor-dropdown__item--active {
  @apply bg-blue-50 text-blue-700;
}

.editor-dropdown__item-icon {
  @apply text-sm;
}

.editor-dropdown__item-label {
  @apply flex-1;
}

/* Action Buttons */
.action-btn {
  @apply flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200;
}

.action-btn--export {
  @apply bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900;
}

.action-btn--import {
  @apply bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900;
}

.action-btn--stats {
  @apply bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900;
}

.action-btn--translate {
  @apply bg-orange-100 hover:bg-orange-200 text-orange-700 hover:text-orange-900;
}

.action-btn--save {
  @apply bg-blue-500 hover:bg-blue-600 text-white font-medium;
}

.action-btn__icon {
  @apply text-sm;
}
</style>
