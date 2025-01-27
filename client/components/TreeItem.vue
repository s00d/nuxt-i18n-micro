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
import type { TreeNode } from '../types'

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
.file-item {
  padding: 1px 12px;
  margin: 2px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  font-size: 14px;
  color: #334155;
  background: white;
  border-radius: 6px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.file-item:hover {
  background: #f1f5f9;
  transform: translateX(2px);
}

.file-item.selected {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
  font-weight: 500;
}

.folder-header {
  padding: 1px 12px;
  margin: 2px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  font-size: 14px;
  color: #334155;
  background: white;
  border-radius: 6px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.folder-header:hover {
  background: #f1f5f9;
  transform: translateX(2px);
}

.folder-header.expanded {
  font-weight: 500;
  color: #1e40af;
}

.folder-header.selected {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
  font-weight: 500;
}

.icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  flex-shrink: 0;
}

.chevron .icon {
  width: 14px;
  height: 14px;
  margin-right: 10px;
}

.folder-children {
  margin-left: 12px;
  border-left: 2px solid #e2e8f0;
  padding-left: 12px;
}
</style>
