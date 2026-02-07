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
import TreeItem from './TreeItem.vue'

const props = defineProps<{
  locales: LocaleData
  selectedFile: string
}>()

const emit = defineEmits(['fileSelected'])

const tree = computed<TreeNode[]>(() => {
  const filePaths = Object.keys(props.locales)
  const commonPrefix = findCommonPrefix(filePaths)

  const root: TreeNode = {
    name: extractName(commonPrefix) || '/',
    fullPath: commonPrefix || '/',
    isFile: false,
    children: [],
  }

  filePaths.forEach((filePath) => {
    // Process each file path
    const relativePath = filePath.startsWith(commonPrefix)
      ? filePath.slice(commonPrefix.length).split('/').filter(Boolean)
      : filePath.split('/').filter(Boolean)

    let current = root

    for (let index = 0; index < relativePath.length; index++) {
      const part = relativePath[index]
      if (!part) continue
      const isFile = index === relativePath.length - 1

      let child = current.children.find((node) => node.name === part)
      if (!child) {
        child = {
          name: part,
          fullPath: `${current.fullPath}/${part}`.replace(/\/+/g, '/'),
          isFile,
          children: [],
        }
        current.children.push(child)
      }
      if (child) {
        current = child
      }
    }
  })

  const sortTree = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isFile === b.isFile) return a.name.localeCompare(b.name)
      return a.isFile ? 1 : -1
    })
    for (const node of nodes) {
      sortTree(node.children)
    }
  }

  sortTree(root.children)

  return root.children
})

function findCommonPrefix(files: string[]): string {
  if (files.length === 0) return ''

  const paths = files.map((p) => p.split('/'))
  const commonSegments: string[] = []
  const maxDepth = Math.min(...paths.map((p) => p.length))

  for (let i = 0; i < maxDepth; i++) {
    const segment = paths[0]?.[i]
    if (segment && paths.every((p) => p[i] === segment)) {
      commonSegments.push(segment)
    } else {
      break
    }
  }

  return commonSegments.join('/')
}

function extractName(path: string): string {
  const parts = path.split('/').filter((p) => p)
  return parts[parts.length - 1] || ''
}

function handleFileSelected(fullPath: string) {
  emit('fileSelected', fullPath)
}
</script>

<style scoped>
@reference "tailwindcss";
</style>
