<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="filter in filters"
        :key="filter.type"
        type="button"
        :aria-pressed="activeFilters.includes(filter.type)"
        :class="['focus-ring rounded-md transition-opacity', { 'opacity-40': !activeFilters.includes(filter.type) }]"
        @click="toggle(filter.type)"
      >
        <Badge :color="BADGE[filter.type]" dot>{{ filter.label }} · {{ counts[filter.type] }}</Badge>
      </button>
    </div>

    <div v-if="filteredChanges.length" class="divide-y divide-line overflow-hidden rounded-md border border-line">
      <div v-for="item in filteredChanges" :key="item.key" class="space-y-1.5 px-3 py-2 text-sm">
        <div class="flex items-center justify-between gap-3">
          <code class="code truncate">{{ item.key }}</code>
          <Badge :color="BADGE[item.type]">{{ item.type }}</Badge>
        </div>
        <template v-if="item.type === 'modified'">
          <div class="flex gap-2 break-words">
            <span class="w-14 shrink-0 text-xs text-muted">Default</span><span class="text-muted">{{ item.baseValue }}</span>
          </div>
          <div class="flex gap-2 break-words">
            <span class="w-14 shrink-0 text-xs text-muted">Current</span><span class="text-highlighted">{{ item.currentValue }}</span>
          </div>
        </template>
        <div v-else :class="['break-words', item.type === 'removed' ? 'text-muted line-through' : 'text-highlighted']">
          {{ item.currentValue || item.baseValue }}
        </div>
      </div>
    </div>
    <p v-else class="rounded-md border border-dashed border-line py-6 text-center text-sm text-muted">No differences.</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TranslationContent } from '../../types'
import { flattenTranslations } from '../../util/i18nUtils'
import Badge from '../ui/Badge.vue'

type ChangeType = 'added' | 'modified' | 'removed'

interface DiffItem {
  key: string
  type: ChangeType
  baseValue?: string
  currentValue?: string
}

const props = defineProps<{
  current: TranslationContent
  base: TranslationContent
}>()

const activeFilters = ref<ChangeType[]>(['added', 'modified', 'removed'])

const filters: { type: ChangeType; label: string }[] = [
  { type: 'added', label: 'Added' },
  { type: 'modified', label: 'Modified' },
  { type: 'removed', label: 'Removed' },
]

const BADGE: Record<ChangeType, 'primary' | 'warning' | 'error'> = { added: 'primary', modified: 'warning', removed: 'error' }

const toggle = (type: ChangeType) => {
  activeFilters.value = activeFilters.value.includes(type) ? activeFilters.value.filter((t) => t !== type) : [...activeFilters.value, type]
}

const changes = computed(() => {
  const currentFlat = flattenTranslations(props.current)
  const baseFlat = flattenTranslations(props.base)
  const allKeys = new Set([...Object.keys(currentFlat), ...Object.keys(baseFlat)])

  return Array.from(allKeys)
    .map((key): DiffItem | null => {
      const currentVal = currentFlat[key]
      const baseVal = baseFlat[key]

      if (!currentVal && baseVal) {
        return { key, type: 'removed', baseValue: baseVal }
      }
      if (currentVal && !baseVal) {
        return { key, type: 'added', currentValue: currentVal }
      }
      if (currentVal !== baseVal) {
        return {
          key,
          type: 'modified',
          baseValue: baseVal,
          currentValue: currentVal,
        }
      }
      return null
    })
    .filter(Boolean) as DiffItem[]
})

const counts = computed(() => ({
  added: changes.value.filter((c) => c.type === 'added').length,
  modified: changes.value.filter((c) => c.type === 'modified').length,
  removed: changes.value.filter((c) => c.type === 'removed').length,
}))

const filteredChanges = computed(() => changes.value.filter((c) => activeFilters.value.includes(c.type)))
</script>
