<template>
  <div class="flex h-full w-full flex-col overflow-hidden">
    <div class="flex shrink-0 items-center gap-2 border-b border-line px-4 py-2">
      <div class="relative max-w-md flex-1">
        <Icon name="search" class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-dimmed" />
        <input v-model="searchQuery" type="search" placeholder="Search keys or values…" aria-label="Search keys or values" class="field pl-8" />
      </div>
      <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-default select-none">
        <input v-model="missingOnly" type="checkbox" class="size-3.5 accent-[var(--ui-primary)]" />
        Missing only
      </label>
      <div class="ml-auto flex items-center gap-1.5 text-xs text-muted">
        <Badge v-if="missingCount" color="warning" dot>{{ missingCount }} missing</Badge>
        <Badge>{{ allKeys.length }} keys</Badge>
      </div>
    </div>

    <div class="scroll-thin min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div
        v-for="key in visibleKeys"
        :key="key"
        :class="[
          'grid gap-x-4 gap-y-1.5 border-b border-line px-4 py-2.5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]',
          isMissing(key) ? 'border-l-2 border-l-warning bg-warning/5 pl-[14px]' : '',
        ]"
      >
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <code class="code truncate select-all" :title="key">{{ key }}</code>
            <Badge v-if="isMissing(key)" color="warning">missing</Badge>
          </div>
          <p class="mt-1 line-clamp-2 text-sm break-words text-muted" :title="defaultLocaleFlatContent[key]">
            {{ defaultLocaleFlatContent[key] || 'No default value' }}
          </p>
        </div>
        <div class="flex items-start gap-1.5">
          <textarea
            v-model="flattenedContent[key]"
            class="field min-h-8 resize-y [field-sizing:content]"
            :placeholder="defaultLocaleFlatContent[key]"
            :aria-label="`Translation for ${key}`"
            rows="1"
            @input="handleInputChange"
          />
          <Button
            v-if="selectedDriver !== 'disabled'"
            variant="ghost"
            square
            icon="languages"
            title="Translate from the default locale"
            aria-label="Translate from the default locale"
            @click="translateText(key, defaultLocaleFlatContent[key] || '')"
          />
        </div>
      </div>

      <EmptyState
        v-if="!visibleKeys.length"
        icon="search"
        :title="allKeys.length ? 'Nothing matches' : 'No keys'"
        :description="allKeys.length ? 'Try another search or turn off “Missing only”.' : 'The default locale has no keys for this file.'"
      />
    </div>

    <div v-if="totalPages > 1" class="flex shrink-0 items-center justify-between gap-3 border-t border-line px-4 py-1.5">
      <span class="text-xs text-muted tabular-nums">{{ rangeLabel }}</span>
      <Pagination :current-page="currentPage" :total-pages="totalPages" @update:page="goToPage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18nState } from '../../composables/useI18nState'
import type { TranslationContent } from '../../types'
import { flattenTranslations, unflattenTranslations } from '../../util/i18nUtils'
import { type DriverType, loadTranslationSettings, Translator } from '../../util/Translator'
import Badge from '../ui/Badge.vue'
import Button from '../ui/Button.vue'
import EmptyState from '../ui/EmptyState.vue'
import Icon from '../ui/Icon.vue'
import Pagination from '../ui/Pagination.vue'

const props = defineProps<{
  modelValue: TranslationContent
}>()

const emit = defineEmits<(e: 'update:modelValue', value: TranslationContent) => void>()

const { selectedFile, configs, getDefaultLocaleTranslation } = useI18nState()

const flattenedContent = ref(flattenTranslations(props.modelValue))
const defaultLocaleFlatContent = ref<Record<string, string>>({})
const searchQuery = ref('')
const missingOnly = ref(false)
const currentPage = ref(1)
const itemsPerPage = 30

// Translation settings
const selectedDriver = ref('disabled')
const apiToken = ref('')
const driverOptions = ref<{ [key: string]: string | number | boolean }>({})

/** Rows follow the default locale's keys. */
const allKeys = computed(() => Object.keys(defaultLocaleFlatContent.value))
const isMissing = (key: string) => !flattenedContent.value[key]?.trim()
const missingCount = computed(() => allKeys.value.filter(isMissing).length)

/** Missing keys when the filter was turned on: a row stays put while it is being filled in. */
const missingAtFilter = ref(new Set<string>())
const snapshotMissing = () => {
  missingAtFilter.value = new Set(allKeys.value.filter(isMissing))
}

const matchedKeys = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return allKeys.value.filter(
    (key) =>
      (!missingOnly.value || missingAtFilter.value.has(key)) &&
      (!query || key.toLowerCase().includes(query) || defaultLocaleFlatContent.value[key]?.toLowerCase().includes(query)),
  )
})

const totalPages = computed(() => Math.ceil(matchedKeys.value.length / itemsPerPage))
const visibleKeys = computed(() => matchedKeys.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage))
const rangeLabel = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage + 1
  return `${start}–${start + visibleKeys.value.length - 1} of ${matchedKeys.value.length}`
})

const initializeDefaultLocale = () => {
  defaultLocaleFlatContent.value = flattenTranslations(getDefaultLocaleTranslation())
}

const handleInputChange = () => {
  emit('update:modelValue', unflattenTranslations(flattenedContent.value))
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

const translateText = async (key: string, text: string) => {
  if (!text) return
  try {
    const fromLang = configs.value.defaultLocale as string
    const translator = new Translator({ apiKey: apiToken.value, driver: selectedDriver.value as DriverType, options: driverOptions.value })
    const fileName: string = selectedFile.value.split('/').pop() ?? ''
    flattenedContent.value[key] = await translator.translate(text, fromLang, fileName.replace('.json', ''))
    handleInputChange()
  } catch (error) {
    console.error('Translation error:', error)
  }
}

onMounted(() => {
  initializeDefaultLocale()
  loadTranslationSettings(selectedDriver, apiToken, driverOptions)
})

watch(
  () => props.modelValue,
  (newVal) => {
    flattenedContent.value = flattenTranslations(newVal)
    initializeDefaultLocale()
  },
)

watch(selectedFile, () => {
  initializeDefaultLocale()
  // the snapshot belongs to the previous file
  missingOnly.value = false
  currentPage.value = 1
})

watch(missingOnly, snapshotMissing)

watch([searchQuery, missingOnly], () => {
  currentPage.value = 1
})

watch(
  () => configs.value.defaultLocale,
  () => initializeDefaultLocale(),
)
</script>
