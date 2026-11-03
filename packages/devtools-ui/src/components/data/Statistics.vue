<template>
  <div class="space-y-5">
    <!-- Coverage against the default locale -->
    <div>
      <div class="mb-1.5 flex items-baseline justify-between text-sm">
        <span class="font-medium text-highlighted">Coverage vs default locale</span>
        <span class="text-muted tabular-nums">{{ translatedCompared }} / {{ totalDefaultKeys }} · {{ percentageCompared }}%</span>
      </div>
      <div class="h-1.5 overflow-hidden rounded-full bg-elevated">
        <div class="h-full rounded-full bg-primary transition-[width]" :style="{ width: `${percentageCompared}%` }" />
      </div>
    </div>

    <section>
      <h4 class="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">This file</h4>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <StatItem v-for="stat in mainStats" :key="stat.label" v-bind="stat" />
      </div>
      <div v-if="longestKey || shortestKey" class="mt-2 grid grid-cols-2 gap-2">
        <StatItem v-if="longestKey" label="Longest key" :value="longestKey" mono />
        <StatItem v-if="shortestKey" label="Shortest key" :value="shortestKey" mono />
      </div>
    </section>

    <section>
      <h4 class="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Comparison with default locale</h4>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatItem v-for="stat in comparisonStats" :key="stat.label" v-bind="stat" />
      </div>
    </section>

    <section>
      <h4 class="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Differences</h4>
      <DiffViewer :current="content" :base="defaultFlattened" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18nState } from '../../composables/useI18nState'
import type { TranslationContent } from '../../types'
import { flattenTranslations } from '../../util/i18nUtils'
import DiffViewer from './DiffViewer.vue'
import StatItem from './StatItem.vue'

const { getDefaultLocaleTranslation } = useI18nState()

const props = defineProps<{
  content: TranslationContent
}>()

const isString = (value: unknown): value is string => typeof value === 'string'
const isFilled = (value: unknown) => isString(value) && value.trim() !== ''

const flattened = computed(() => flattenTranslations(props.content))
const defaultFlattened = computed(() => flattenTranslations(getDefaultLocaleTranslation()))
const values = computed(() => Object.values(flattened.value).filter(isString))
const count = (predicate: (value: string) => boolean) => values.value.filter(predicate).length

const totalKeys = computed(() => Object.keys(flattened.value).length)
const translatedKeys = computed(() => Object.values(flattened.value).filter(isFilled).length)
const percentage = computed(() => (totalKeys.value ? ((translatedKeys.value / totalKeys.value) * 100).toFixed(2) : '0.00'))

const duplicateValues = computed(() => {
  const counts: Record<string, number> = {}
  for (const v of values.value) counts[v] = (counts[v] || 0) + 1
  return Object.values(counts).filter((c) => c > 1).length
})

/** The key whose value is longest (`a > b`) or shortest (`a < b`). */
const extremeKey = (comparator: (a: number, b: number) => boolean) =>
  computed(() => {
    const keys = Object.keys(flattened.value)
    if (keys.length < 2) return null
    const length = (key: string) => {
      const value = flattened.value[key]
      return isString(value) ? value.length : 0
    }
    return keys.reduce((a, b) => (comparator(length(a), length(b)) ? a : b))
  })
const longestKey = extremeKey((a, b) => a > b)
const shortestKey = extremeKey((a, b) => a < b)

const totalDefaultKeys = computed(() => Object.keys(defaultFlattened.value).length)
const translatedCompared = computed(() => Object.keys(defaultFlattened.value).filter((k) => isFilled(flattened.value[k])).length)
const percentageCompared = computed(() => (totalDefaultKeys.value ? ((translatedCompared.value / totalDefaultKeys.value) * 100).toFixed(2) : '0.00'))

const mainStats = computed(() => {
  const missing = totalKeys.value - translatedKeys.value
  return [
    { label: 'Total keys', value: totalKeys.value },
    { label: 'Translated keys', value: `${translatedKeys.value} (${percentage.value}%)`, tone: 'primary' as const },
    { label: 'Missing translations', value: missing, tone: missing ? ('warning' as const) : undefined },
    { label: 'Duplicate values', value: duplicateValues.value },
    { label: 'Long translations (>100 chars)', value: count((v) => v.length > 100) },
    { label: 'Short translations (<3 chars)', value: count((v) => v.length < 3) },
    { label: 'Keys with special chars', value: count((v) => /[@#{}[\]]/.test(v)) },
    { label: 'Keys with HTML tags', value: count((v) => /<[^>]+>/.test(v)) },
    { label: 'Keys with placeholders', value: count((v) => /\{[^}]+\}/.test(v)) },
  ]
})

const comparisonStats = computed(() => {
  const missing = totalDefaultKeys.value - translatedCompared.value
  return [
    { label: 'Total keys in default', value: totalDefaultKeys.value },
    { label: 'Translated vs default', value: `${translatedCompared.value} (${percentageCompared.value}%)`, tone: 'primary' as const },
    { label: 'Missing from default', value: missing, tone: missing ? ('warning' as const) : undefined },
    { label: 'Extra keys', value: Math.max(totalKeys.value - totalDefaultKeys.value, 0) },
  ]
})
</script>
