<template>
  <div class="flex flex-col h-full w-full bg-slate-50 rounded-lg overflow-hidden">
    <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2">
      <TreeItem
        v-for="node in tree"
        :key="node.fullPath"
        :locale="node.name"
        :node="node"
        :depth="0"
        :selected-file="selectedFile"
        :default-expanded="false"
        @file-selected="handleFileSelected"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LocaleData, TreeNode } from '../../types'
import { buildFileTree } from '../../util/i18nUtils'
import TreeItem from './TreeItem.vue'

const props = defineProps<{
  locales: LocaleData
  selectedFile: string
}>()

const emit = defineEmits(['fileSelected'])

const tree = computed<TreeNode[]>(() => buildFileTree(Object.keys(props.locales)))

function handleFileSelected(fullPath: string) {
  emit('fileSelected', fullPath)
}
</script>

<style scoped>
@reference "tailwindcss";
</style>
