<template>
  <div class="flex h-full w-full flex-col">
    <div class="shrink-0 border-b border-line p-2">
      <div class="relative">
        <Icon name="search" class="pointer-events-none absolute inset-y-0 left-2.5 my-auto text-dimmed" />
        <input
          v-model="query"
          type="search"
          placeholder="Filter files…"
          aria-label="Filter files"
          class="field pl-8"
          @keydown.down.prevent="focusRow(0)"
        />
      </div>
    </div>
    <div class="flex items-center justify-between px-3 pt-3 pb-1 text-xs font-medium text-muted">
      <span>Translation files</span>
      <span class="tabular-nums">{{ query.trim() ? `${shownCount} / ${files.length}` : files.length }}</span>
    </div>

    <!-- A flat ARIA tree: only rows of open folders exist in the DOM, nesting is aria-level -->
    <div
      ref="list"
      class="scroll-thin min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-2 pb-2"
      role="tree"
      aria-label="Translation files"
      @keydown="onKeydown"
    >
      <div
        v-for="(row, index) in rows"
        :key="row.node.fullPath"
        role="treeitem"
        :aria-level="row.depth + 1"
        :aria-expanded="row.node.isFile ? undefined : isOpen(row.node)"
        :aria-selected="row.node.isFile ? row.node.fullPath === selectedFile : undefined"
        :data-file="row.node.isFile || undefined"
        :data-folder="!row.node.isFile || undefined"
        :tabindex="index === focusIndex ? 0 : -1"
        :title="row.node.fullPath"
        :class="[
          'focus-ring flex h-7 min-w-0 cursor-pointer items-center gap-1.5 rounded-md pr-2 text-sm transition-colors select-none',
          row.node.fullPath === selectedFile ? 'bg-primary/10 font-medium text-primary' : 'text-default hover:bg-elevated hover:text-highlighted',
        ]"
        :style="{ paddingLeft: indent(row.depth) }"
        @click="activate(row, index)"
        @focus="focusIndex = index"
      >
        <Icon
          v-if="!row.node.isFile"
          name="chevron-right"
          :class="['size-3.5 text-dimmed transition-transform', { 'rotate-90': isOpen(row.node) }]"
        />
        <span v-else class="w-3.5 shrink-0" />
        <Icon
          :name="row.node.isFile ? 'file' : 'folder'"
          :class="row.node.fullPath === selectedFile ? 'text-primary' : row.node.isFile ? 'text-dimmed' : 'text-muted'"
        />
        <span class="min-w-0 truncate">
          <template v-for="(part, i) in nameParts(row.node.name)" :key="i">
            <mark v-if="i === 1" class="rounded-sm bg-warning/25 text-inherit">{{ part }}</mark>
            <template v-else>{{ part }}</template>
          </template>
        </span>
      </div>

      <EmptyState
        v-if="!rows.length"
        :icon="files.length ? 'search' : 'folder'"
        :title="files.length ? 'No matching files' : 'No translation files'"
        :description="files.length ? `Nothing matches “${query.trim()}”.` : 'The app has no translation files yet.'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { LocaleData, TreeNode } from '../../types'
import { ancestorPaths, buildFileTree, countFiles, filterTree, flattenTree, splitMatch, type TreeRow } from '../../util/i18nUtils'
import EmptyState from '../ui/EmptyState.vue'
import Icon from '../ui/Icon.vue'

const INDENT = 14
/** Deep levels never take more than 40% of the row, so a name always keeps room in a narrow panel. */
const indent = (depth: number) => `min(${6 + depth * INDENT}px, 40%)`
const STORAGE_KEY = 'i18n-devtools:tree-open'

const props = defineProps<{
  locales: LocaleData
  selectedFile: string
}>()

const emit = defineEmits<{ fileSelected: [fullPath: string] }>()

const query = ref('')
const list = ref<HTMLElement | null>(null)
const focusIndex = ref(0)

const files = computed(() => Object.keys(props.locales))
const fullTree = computed<TreeNode[]>(() => buildFileTree(files.value))
const tree = computed<TreeNode[]>(() => filterTree(fullTree.value, query.value))
const shownCount = computed(() => tree.value.reduce((sum, node) => sum + countFiles(node), 0))

/** Open folders, kept across file switches and reloads; a filter shows every match opened. */
const open = ref(new Set<string>(readOpen()))
const isOpen = (folder: TreeNode) => !!query.value.trim() || open.value.has(folder.fullPath)
const rows = computed<TreeRow[]>(() => flattenTree(tree.value, isOpen))

function readOpen(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function setOpen(path: string, value: boolean) {
  const next = new Set(open.value)
  if (value) next.add(path)
  else next.delete(path)
  open.value = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
  } catch {
    // storage blocked: the state lives for this session only
  }
}

const nameParts = (name: string) => splitMatch(name, query.value) ?? [name]

function activate(row: TreeRow, index: number) {
  focusIndex.value = index
  if (row.node.isFile) emit('fileSelected', row.node.fullPath)
  else if (!query.value.trim()) setOpen(row.node.fullPath, !open.value.has(row.node.fullPath))
}

function focusRow(index: number) {
  if (!rows.value.length) return
  focusIndex.value = Math.max(0, Math.min(index, rows.value.length - 1))
  nextTick(() => {
    const el = list.value?.querySelectorAll<HTMLElement>('[role="treeitem"]')[focusIndex.value]
    el?.focus()
    el?.scrollIntoView({ block: 'nearest' })
  })
}

/** WAI-ARIA tree keys: arrows, Home/End, Left/Right to close/open, Enter or Space to open a file. */
function onKeydown(event: KeyboardEvent) {
  const row = rows.value[focusIndex.value]
  if (!row) return
  const folderOpen = !row.node.isFile && isOpen(row.node)
  const keys: Record<string, () => void> = {
    ArrowDown: () => focusRow(focusIndex.value + 1),
    ArrowUp: () => focusRow(focusIndex.value - 1),
    Home: () => focusRow(0),
    End: () => focusRow(rows.value.length - 1),
    ArrowRight: () => {
      if (row.node.isFile) return
      if (folderOpen) focusRow(focusIndex.value + 1)
      else setOpen(row.node.fullPath, true)
    },
    ArrowLeft: () => {
      if (folderOpen && !query.value.trim()) setOpen(row.node.fullPath, false)
      else if (row.parent !== null) focusRow(rows.value.findIndex((r) => r.node.fullPath === row.parent))
    },
    Enter: () => activate(row, focusIndex.value),
    ' ': () => activate(row, focusIndex.value),
  }
  const action = keys[event.key]
  if (!action) return
  event.preventDefault()
  action()
}

// Open the folders down to the active file and bring it into view
watch(
  () => props.selectedFile,
  (file) => {
    if (!file) return
    const missing = ancestorPaths(fullTree.value, file).filter((path) => !open.value.has(path))
    for (const path of missing) setOpen(path, true)
    nextTick(() => {
      const index = rows.value.findIndex((r) => r.node.fullPath === file)
      if (index === -1) return
      focusIndex.value = index
      list.value?.querySelectorAll<HTMLElement>('[role="treeitem"]')[index]?.scrollIntoView({ block: 'nearest' })
    })
  },
  { immediate: true },
)

// Keep the roving tab stop on an existing row
watch(rows, (now) => {
  if (focusIndex.value >= now.length) focusIndex.value = Math.max(0, now.length - 1)
})
</script>
