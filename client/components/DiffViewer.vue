[file name]: DiffViewer.vue
<template>
  <div class="diff-viewer">
    <!-- Фильтры -->
    <div class="filters">
      <label
        v-for="filter in filters"
        :key="filter.type"
        class="filter-item"
      >
        <input
          v-model="activeFilters"
          type="checkbox"
          :value="filter.type"
          class="sr-only"
        >
        <span :class="['filter-badge', filter.class]">
          {{ filter.label }} ({{ counts[filter.type] }})
        </span>
      </label>
    </div>

    <!-- Список изменений -->
    <div class="diff-list">
      <div
        v-for="(item, index) in filteredChanges"
        :key="index"
        class="diff-item"
      >
        <div class="key-row">
          <span class="key-label">{{ item.key }}</span>
          <span
            v-if="item.type"
            :class="['change-type', typeClasses[item.type]]"
          >
            {{ item.type.toUpperCase() }}
          </span>
        </div>

        <div class="value-compare">
          <template v-if="item.type === 'modified'">
            <div class="value old">
              <span class="value-label">Default:</span>
              <span class="value-content">{{ item.baseValue }}</span>
            </div>
            <div class="value new">
              <span class="value-label">Current:</span>
              <span class="value-content">{{ item.currentValue }}</span>
            </div>
          </template>

          <div
            v-else
            class="value"
            :class="item.type"
          >
            <span class="value-content">{{ item.currentValue || item.baseValue }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { flattenTranslations } from '../util/i18nUtils'
import type { TranslationContent } from '../types'

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

const filters = [
  { type: 'added' as ChangeType, label: 'Added', class: 'bg-green-100 text-green-800' },
  { type: 'modified' as ChangeType, label: 'Modified', class: 'bg-yellow-100 text-yellow-800' },
  { type: 'removed' as ChangeType, label: 'Removed', class: 'bg-red-100 text-red-800' },
]

const typeClasses: Record<ChangeType, string> = {
  added: 'text-green-600',
  modified: 'text-yellow-600',
  removed: 'text-red-600',
}

const changes = computed(() => {
  const currentFlat = flattenTranslations(props.current)
  const baseFlat = flattenTranslations(props.base)
  const allKeys = new Set([...Object.keys(currentFlat), ...Object.keys(baseFlat)])

  return Array.from(allKeys).map((key): DiffItem | null => {
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
  }).filter(Boolean) as DiffItem[]
})

const counts = computed(() => ({
  added: changes.value.filter(c => c.type === 'added').length,
  modified: changes.value.filter(c => c.type === 'modified').length,
  removed: changes.value.filter(c => c.type === 'removed').length,
}))

const filteredChanges = computed(() =>
  changes.value.filter(c => activeFilters.value.includes(c.type)),
)
</script>

<style scoped>
.diff-viewer {
  @apply flex flex-col gap-4;
}

.filters {
  @apply flex gap-2;
}

.filter-item {
  @apply cursor-pointer;
}

.filter-badge {
  @apply px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all;
}

.filter-item input:checked + .filter-badge {
  @apply ring-2 ring-inset ring-opacity-50;
}

.diff-list {
  @apply space-y-4;
}

.diff-item {
  @apply bg-white rounded-lg shadow-sm border border-gray-100 p-4;
}

.key-row {
  @apply flex justify-between items-center mb-2;
}

.key-label {
  @apply font-mono text-sm text-gray-700 truncate;
}

.change-type {
  @apply text-xs font-semibold px-2 py-1 rounded-full;
}

.value-compare {
  @apply space-y-2;
}

.value {
  @apply p-2 rounded-md border border-transparent text-sm;
}

.value-label {
  @apply text-xs font-medium text-gray-500 mr-2;
}

.value-content {
  @apply break-words;
}

.old {
  @apply bg-red-50 border-red-200 text-red-700;
}

.new {
  @apply bg-green-50 border-green-200 text-green-700;
}

.added .value-content {
  @apply text-green-600;
}

.removed .value-content {
  @apply text-red-600 line-through;
}
</style>
