<template>
  <div>
    <div
      v-if="node.isFile"
      :class="['file-item', { selected: isSelected }]"
      :style="indentStyle"
      @click="handleFileClick"
    >
      <span class="file-icon">
        <svg
          class="icon"
          viewBox="0 0 24 24"
        >
          <!-- Элементы локализации -->
          <g transform="translate(4 4) scale(0.8)">
            <!-- Глобус -->
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <!-- Меридианы -->
            <path
              d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
            />
            <!-- Параллели -->
            <path
              d="M2 12h20M5 5.2l14 14M5 18.8l14-14"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
            />
          </g>
        </svg>
      </span>
      <span
        class="file-name"
        v-html="node.name"
      />
    </div>

    <div v-else>
      <div
        :class="['folder-header', { expanded: isExpanded, selected: selected }]"
        :style="indentStyle"
        @click="toggleExpand"
      >
        <span class="chevron">
          <svg
            class="icon"
            viewBox="0 0 24 24"
          >
            <path
              v-if="isExpanded"
              d="M19 9l-7 7-7-7"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              v-else
              d="M9 5l7 7-7 7"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </span>
        <span class="folder-icon">
          <svg
            class="icon"
            viewBox="0 0 24 24"
          >
            <path
              d="M20 6a2 2 0 0 0-2-2h-8L10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </span>
        <span class="folder-name">{{ node.name }}</span>
      </div>

      <div
        v-if="isExpanded"
        class="folder-children"
      >
        <TreeItem
          v-for="child in node.children"
          :key="child.fullPath"
          :node="child"
          :locale="locale"
          :depth="depth + 1"
          :selected-file="selectedFile"
          :default-expanded="false"
          @file-selected="handleFileSelected"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TreeNode } from '../../types'

const props = defineProps<{
  node: TreeNode
  depth: number
  locale: string
  selectedFile: string
  defaultExpanded?: boolean
  selected?: boolean
}>()

const emit = defineEmits(['fileSelected'])

const isExpanded = ref(props.defaultExpanded || false)
const isSelected = computed(() => props.selectedFile === props.node.fullPath)

const indentStyle = computed(() => ({
  paddingLeft: `${props.depth * 20 + 8}px`,
}))

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function handleFileClick() {
  emit('fileSelected', props.node.fullPath, props.locale)
}
// Автоматически раскрываем папки по умолчанию
watch(() => props.defaultExpanded, (val) => {
  isExpanded.value = val === true
}, { immediate: true })

function handleFileSelected(fullPath: string, locale: string) {
  emit('fileSelected', fullPath, locale)
}
</script>

<style scoped>
@reference "tailwindcss";

.file-item {
  @apply py-1 px-2 my-1 cursor-pointer flex items-center text-sm text-slate-700 bg-white rounded-md transition-all duration-200 border border-transparent;
}

.file-item:hover {
  @apply bg-slate-50 transform translate-x-1;
}

.file-item.selected {
  @apply bg-blue-50 border-blue-200 text-blue-700 font-medium;
}

.folder-header {
  @apply py-1 px-2 my-1 cursor-pointer flex items-center text-sm text-slate-700 bg-white rounded-md transition-all duration-200 border border-transparent;
}

.folder-header:hover {
  @apply bg-slate-50 transform translate-x-1;
}

.folder-header.expanded {
  @apply font-medium text-blue-700;
}

.folder-header.selected {
  @apply bg-blue-50 border-blue-200 text-blue-700 font-medium;
}

.icon {
  @apply w-4 h-4 mr-2 shrink-0;
}

.chevron .icon {
  @apply w-3 h-3 mr-2;
}

.folder-children {
  @apply ml-3 border-l-2 border-slate-200 pl-3;
}
</style>
