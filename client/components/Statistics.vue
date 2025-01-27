<template>
  <div class="space-y-4 p-4 bg-white rounded-lg shadow">
    <!-- Основная статистика -->
    <div class="grid grid-cols-2 gap-4">
      <StatItem
        v-for="(stat, index) in mainStats"
        :key="index"
        :label="stat.label"
        :value="stat.value"
        :class="stat.class"
      />
    </div>

    <!-- Ключи с экстремальными длинами -->
    <div
      v-if="longestKey || shortestKey"
      class="grid grid-cols-2 gap-4"
    >
      <StatItem
        v-if="longestKey"
        label="Longest Key"
        :value="longestKey"
        stacked
        class="text-purple-600 break-all"
      />
      <StatItem
        v-if="shortestKey"
        label="Shortest Key"
        :value="shortestKey"
        stacked
        class="text-purple-600 break-all"
      />
    </div>

    <!-- Сравнение с дефолтной локалью -->
    <div class="pt-4 mt-4 border-t border-gray-200">
      <h3 class="text-lg font-semibold text-gray-800 mb-3">
        <span class="icon-[heroicons--scale-solid] mr-2" />
        Comparison with Default Locale
      </h3>

      <div class="grid grid-cols-2 gap-4">
        <StatItem
          v-for="(stat, index) in comparisonStats"
          :key="'compare-' + index"
          :label="stat.label"
          :value="stat.value"
          :class="stat.class"
        />
      </div>
    </div>

    <DiffViewer
      ref="diffModal"
      :current="content"
      :base="defaultFlattened"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { flattenTranslations } from '../util/i18nUtils'
import type { TranslationContent } from '../types'
import { useI18nStore } from '../stores/useI18nStore'
import StatItem from './StatItem.vue'
import DiffViewer from './DiffViewer.vue'

const { getDefaultLocaleTranslation } = useI18nStore()

const props = defineProps<{
  content: TranslationContent
}>()

// Вспомогательные функции
const safeTrim = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const isString = (value: unknown): value is string =>
  typeof value === 'string'

// Флатеннутые версии переводов
const flattened = computed(() => flattenTranslations(props.content))
const defaultFlattened = computed(() => flattenTranslations(getDefaultLocaleTranslation()))

// Универсальный счетчик
const createCounter = (predicate: (value: string) => boolean) =>
  computed(() =>
    Object.values(flattened.value)
      .filter(v => isString(v) && predicate(v))
      .length,
  )

// Основная статистика
const totalKeys = computed(() => Object.keys(flattened.value).length)
const translatedKeys = computed(() =>
  Object.values(flattened.value).filter(v =>
    isString(v) && safeTrim(v) !== '',
  ).length,
)
const percentage = computed(() =>
  totalKeys.value ? ((translatedKeys.value / totalKeys.value) * 100).toFixed(2) : '0.00',
)

// Специфические счетчики
const duplicateValues = computed(() => {
  const counts: Record<string, number> = {}
  Object.values(flattened.value).forEach((v) => {
    if (isString(v)) {
      counts[v] = (counts[v] || 0) + 1
    }
  })
  return Object.values(counts).filter(c => c > 1).length
})

// Экстремальные значения ключей
const extremeKey = (comparator: (a: number, b: number) => boolean) => computed(() => {
  const keys = Object.keys(flattened.value)
  if (keys.length < 2) return null

  return keys.reduce((a, b) => {
    const aVal = flattened.value[a]
    const bVal = flattened.value[b]
    const aLength = isString(aVal) ? aVal.length : 0
    const bLength = isString(bVal) ? bVal.length : 0

    return comparator(aLength, bLength) ? a : b
  })
})

// Сравнение с дефолтной локалью
const totalDefaultKeys = computed(() => Object.keys(defaultFlattened.value).length)
const translatedCompared = computed(() =>
  Object.keys(defaultFlattened.value).filter((k) => {
    const val = flattened.value[k]
    return isString(val) && safeTrim(val) !== ''
  }).length,
)
const percentageCompared = computed(() =>
  totalDefaultKeys.value ? ((translatedCompared.value / totalDefaultKeys.value) * 100).toFixed(2) : '0.00',
)

// Группировка данных для отображения
const mainStats = computed(() => [
  { label: 'Total Keys', value: totalKeys.value, class: 'text-blue-600' },
  { label: 'Translated Keys', value: `${translatedKeys.value} (${percentage.value}%)`, class: 'text-green-600' },
  { label: 'Missing Translations', value: totalKeys.value - translatedKeys.value, class: 'text-red-600' },
  { label: 'Duplicate Values', value: duplicateValues.value, class: 'text-orange-600' },
  { label: 'Long Translations (>100 chars)', value: longTranslations.value, class: 'text-yellow-600' },
  { label: 'Short Translations (<3 chars)', value: shortTranslations.value, class: 'text-pink-600' },
  { label: 'Keys with Special Chars', value: specialChars.value, class: 'text-indigo-600' },
  { label: 'Keys with HTML Tags', value: htmlTags.value, class: 'text-teal-600' },
  { label: 'Keys with Placeholders', value: placeholders.value, class: 'text-cyan-600' },
])

const comparisonStats = computed(() => [
  { label: 'Total Keys in Default', value: totalDefaultKeys.value, class: 'text-blue-600' },
  { label: 'Translated vs Default', value: `${translatedCompared.value} (${percentageCompared.value}%)`, class: 'text-green-600' },
  { label: 'Missing from Default', value: totalDefaultKeys.value - translatedCompared.value, class: 'text-red-600' },
  { label: 'Extra Keys', value: Math.max(totalKeys.value - totalDefaultKeys.value, 0), class: 'text-orange-600' },
])

// Инициализация счетчиков
const [longTranslations, shortTranslations, specialChars, htmlTags, placeholders] = [
  (v: string) => v.length > 100,
  (v: string) => v.length < 3,
  (v: string) => /[@#{}[\]]/.test(v),
  (v: string) => /<[^>]+>/.test(v),
  (v: string) => /\{[^}]+\}/.test(v),
].map(pred => createCounter(pred))

const longestKey = extremeKey((a, b) => a > b)
const shortestKey = extremeKey((a, b) => a < b)
</script>

<style scoped>
.border-t {
  border-top-width: 1px;
  border-top-color: #e5e7eb;
}

.pt-4 {
  padding-top: 1rem;
}

.mt-4 {
  margin-top: 1rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.font-semibold {
  font-weight: 600;
}

.bg-white {
  background-color: #fff;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.grid {
  display: grid;
}

.gap-4 {
  gap: 1rem;
}
</style>
