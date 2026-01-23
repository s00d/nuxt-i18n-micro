<template>
  <div class="translation-editor">
    <!-- List (Scrollable) -->
    <div class="translation-list-container">
      <div class="search-box">
        <input
          v-model="searchQuery"
          placeholder="Search keys or values..."
          class="search-input"
        >
      </div>

      <div class="translation-list">
        <div
          v-for="key in filteredKeys"
          :key="key"
          class="translation-item"
          :class="{ missing: !flattenedContent[key]?.trim() }"
        >
          <div class="key-header">
            <span
              class="key-label"
              :title="key"
            >{{ key }}</span>
            <button
              v-if="selectedDriver !== 'disabled'"
              class="translate-btn"
              @click="translateText(key, defaultLocaleFlatContent[key] || '')"
            >
              <svg
                class="translate-icon"
                viewBox="0 0 24 24"
              >
                <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
              </svg>
            </button>
          </div>
          <div class="default-value">
            {{ defaultLocaleFlatContent[key] || 'No default value' }}
          </div>
          <textarea
            v-model="flattenedContent[key]"
            class="translation-input"
            :placeholder="defaultLocaleFlatContent[key]"
            rows="1"
            @input="handleInputChange"
          />
        </div>
      </div>
    </div>

    <!-- Pagination (Fixed at bottom) -->
    <div class="pagination-wrapper">
      <Pagination
        v-if="!searchQuery"
        :current-page="currentPage"
        :total-pages="totalPages"
        @update:page="goToPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18nState } from '../../composables/useI18nState'
import { flattenTranslations, unflattenTranslations } from '../../util/i18nUtils'
import type { TranslationContent } from '../../types'
import { type DriverType, Translator } from '../../util/Translator'
import Pagination from '../ui/Pagination.vue'

const props = defineProps<{
  modelValue: TranslationContent
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: TranslationContent): void
}>()

const { selectedFile, configs, getDefaultLocaleTranslation } = useI18nState()

// Reactive data
const flattenedContent = ref(flattenTranslations(props.modelValue))
const defaultLocaleFlatContent = ref<Record<string, string>>({})
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 30

// Translation settings
const selectedDriver = ref('disabled')
const apiToken = ref('')
const driverOptions = ref<{ [key: string]: string | number | boolean }>({})

// Computed properties
const filteredKeys = computed(() => {
  const keys = Object.keys(defaultLocaleFlatContent.value)
  if (!searchQuery.value.trim()) return paginatedKeys.value

  const query = searchQuery.value.toLowerCase()
  return keys.filter(key =>
    key.toLowerCase().includes(query)
    || defaultLocaleFlatContent.value[key]?.toLowerCase().includes(query),
  )
})

const totalPages = computed(() => {
  return Math.ceil(Object.keys(defaultLocaleFlatContent.value).length / itemsPerPage)
})

const paginatedKeys = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return Object.keys(defaultLocaleFlatContent.value).slice(start, end)
})

// Methods
const initializeDefaultLocale = () => {
  const defaultContent = getDefaultLocaleTranslation()
  defaultLocaleFlatContent.value = flattenTranslations(defaultContent)
}

const handleInputChange = () => {
  emit('update:modelValue', unflattenTranslations(flattenedContent.value))
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const translateText = async (key: string, text: string) => {
  if (!text) return
  try {
    const fromLang = configs.value.defaultLocale as string
    const translator = new Translator({ apiKey: apiToken.value, driver: selectedDriver.value as DriverType, options: driverOptions.value })
    const fileName: string = selectedFile.value.split('/').pop() ?? ''
    flattenedContent.value[key] = await translator.translate(text, fromLang, fileName.replace('.json', ''))
    handleInputChange()
  }
  catch (error) {
    console.error('Translation error:', error)
  }
}

const loadSettings = () => {
  const saved = localStorage.getItem('translationSettings')
  if (saved) {
    try {
      const settings = JSON.parse(saved)
      selectedDriver.value = settings.driver || 'disabled'
      apiToken.value = settings.token || ''
      driverOptions.value = settings.options || {}
    }
    catch {
      localStorage.removeItem('translationSettings')
    }
  }
}

onMounted(() => {
  initializeDefaultLocale()
  loadSettings()
})

watch(() => props.modelValue, (newVal) => {
  flattenedContent.value = flattenTranslations(newVal)
  // Update defaultLocaleFlatContent when modelValue changes
  initializeDefaultLocale()
})

watch(selectedFile, () => {
  initializeDefaultLocale()
  currentPage.value = 1
})

watch(() => configs.value.defaultLocale, () => {
  // Update defaultLocaleFlatContent when default locale changes
  initializeDefaultLocale()
})
</script>

<style scoped>
@reference "tailwindcss";

.translation-editor {
  @apply flex flex-col h-full w-full overflow-hidden bg-gray-50;
}

.translation-list-container {
  @apply flex-1 flex flex-col min-h-0 overflow-hidden;
}

.search-box {
  @apply bg-white p-2 border-b border-gray-200 shrink-0;
}

.search-input {
  @apply w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500;
}

.translation-list {
  @apply flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-3;
  overscroll-behavior: contain;
}

.translation-item {
  @apply p-3 bg-white rounded-lg shadow-sm border border-gray-200;
}

.translation-item.missing {
  @apply border-l-4 border-l-yellow-500 bg-yellow-50/30;
}

.key-header {
  @apply flex justify-between items-center mb-1;
}

.key-label {
  @apply font-mono text-xs font-semibold text-slate-700 truncate select-all;
}

.default-value {
  @apply text-xs text-gray-500 mb-2 truncate opacity-80;
}

.translation-input {
  @apply w-full p-2 border border-gray-300 rounded text-sm min-h-[38px]
  focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.translate-btn {
  @apply p-1 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-gray-100;
}

.translate-icon {
  @apply w-4 h-4 fill-current;
}

.pagination-wrapper {
  @apply shrink-0 p-2 border-t border-gray-200 bg-white;
}
</style>
