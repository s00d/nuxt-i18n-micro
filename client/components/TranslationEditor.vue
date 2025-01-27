<template>
  <div class="translation-editor">
    <!-- Список переводов -->
    <div class="translation-list">
      <!-- Поиск -->
      <div class="search-box mx-4 mt-1">
        <input
          v-model="searchQuery"
          placeholder="Search keys or values..."
          class="search-input"
        >
      </div>

      <div
        v-for="key in filteredKeys"
        :key="key"
        class="translation-item"
        :class="{ missing: !flattenedContent[key]?.trim() }"
      >
        <div class="key-header">
          <span class="key-label">{{ key }}</span>
          <button
            v-if="selectedDriver !== 'disabled'"
            class="translate-btn"
            @click="translateText(key, defaultLocaleFlatContent[key])"
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
          :rows="1"
          @input="handleInputChange"
        />
      </div>
    </div>

    <!-- Пагинация -->
    <Pagination
      v-if="!searchQuery"
      :current-page="currentPage"
      :total-pages="totalPages"
      @update:page="goToPage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18nStore } from '../stores/useI18nStore'
import { flattenTranslations, unflattenTranslations } from '../util/i18nUtils'
import type { TranslationContent } from '../types'
import { type DriverType, Translator } from '../util/Translator'
import Pagination from './Pagination.vue'

const props = defineProps<{
  modelValue: TranslationContent
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: TranslationContent): void
}>()

const { selectedFile, configs, selectedLocale } = useI18nStore()
const { getDefaultLocaleTranslation } = useI18nStore()

// Реактивные данные
const flattenedContent = ref(flattenTranslations(props.modelValue))
const defaultLocaleFlatContent = ref<Record<string, string>>({})
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 30

// Настройки перевода
const selectedDriver = ref('disabled')
const apiToken = ref('')
const driverOptions = ref<{ [key: string]: string | number | boolean }>({})

// Вычисляемые свойства
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

// Методы
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
    const translator = new Translator({
      apiKey: apiToken.value,
      driver: selectedDriver.value as DriverType,
      options: driverOptions.value,
    })
    flattenedContent.value[key] = await translator.translate(text, fromLang, selectedLocale.value)
    handleInputChange() // Обновляем данные
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

// Хуки жизненного цикла
onMounted(() => {
  initializeDefaultLocale()
  loadSettings()
})

watch(() => props.modelValue, (newVal) => {
  flattenedContent.value = flattenTranslations(newVal)
})

watch(selectedFile, () => {
  initializeDefaultLocale()
  currentPage.value = 1
})
</script>

<style scoped>
.translation-editor {
  @apply flex flex-col h-full p-1 gap-0;
}

.search-box {
  @apply bg-white pb-4;
}

.search-input {
  @apply w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.translation-list {
  @apply flex-1 overflow-y-auto space-y-4;
}

.translation-item {
  @apply px-4 py-1 bg-white rounded-lg shadow-sm border border-gray-100;
}

.translation-item.missing {
  @apply border-yellow-500 bg-yellow-50;
}

.key-header {
  @apply flex justify-between items-center mb-1;
}

.key-label {
  @apply font-mono text-sm text-gray-700 truncate;
}

.default-value {
  @apply text-xs text-gray-500 mb-1 italic;
}

.translation-input {
  @apply w-full p-2 border rounded-md resize-y min-h-[20px]
  focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.translate-btn {
  @apply p-1 text-gray-500 hover:text-blue-600 transition-colors;
}

.translate-icon {
  @apply w-5 h-5 fill-current;
}
</style>
