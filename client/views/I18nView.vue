<template>
  <div class="i18n-view">
    <Loader v-if="isLoading" />

    <NSplitPane
      v-else
      storage-key="tab-i18n-locales"
    >
      <template #left>
        <LocalesList
          :locales="filteredLocales"
          :selected-file="selectedFile"
          @file-selected="handleFileSelected"
        />
      </template>

      <template #right>
        <div
          v-if="selectedFile"
          h-full
          of-hidden
          flex="~ col"
        >
          <div
            v-if="localContent"
            class="editor-container"
          >
            <!-- Action Bar -->
            <ActionBar
              v-model="selectedEditor"
              :show-translate-button="selectedDriver !== 'disabled'"
              @export="exportTranslations"
              @import="importTranslationsClick"
              @show-stats="showStatisticsModal"
              @translate-missing="confirmTranslateMissingKeys"
              @save="handleSave"
            />

            <!-- Скрытый input для импорта -->
            <input
              v-show="false"
              ref="file"
              type="file"
              accept=".json"
              @change="importTranslations"
            >

            <!-- Редакторы -->
            <div class="editor-wrapper">
              <JsonEditor
                v-if="selectedEditor === 'json'"
                v-model="localContent"
                style="overflow: auto; height: 100%"
              />
              <TranslationEditor
                v-else-if="selectedEditor === 'translation'"
                v-model="localContent"
              />
            </div>
          </div>
          <div
            v-else
            class="empty-state"
          >
            <div class="empty-state__icon">
              📁
            </div>
            <div class="empty-state__title">
              No File Selected
            </div>
            <div class="empty-state__description">
              Please select a locale and a file to view editor.
            </div>
          </div>
        </div>
        <NCard v-else>
          <template #default>
            <div class="welcome-card">
              <div class="welcome-card__icon">
                🌍
              </div>
              <div class="welcome-card__title">
                Welcome to i18n Micro
              </div>
              <div class="welcome-card__description">
                Learn more about
                <NLink
                  href="https://github.com/s00d/nuxt-i18n-micro"
                  color="orange"
                  target="_blank"
                >
                  i18n Micro
                </NLink>
              </div>
            </div>
          </template>
        </NCard>
      </template>
    </NSplitPane>

    <!-- Модальное окно для статистики -->
    <Modal
      v-if="isStatisticsModalVisible"
      v-model:show="isStatisticsModalVisible"
      title="Statistics"
      size="lg"
    >
      <Statistics
        v-if="localContent"
        :content="localContent"
      />
    </Modal>

    <Modal
      v-if="isConfirmModalVisible"
      v-model:show="isConfirmModalVisible"
      title="Confirm Translation"
      size="md"
    >
      <p>Are you sure you want to translate all missing keys?</p>
      <div class="flex justify-end gap-2 mt-4">
        <NButton
          class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          @click="isConfirmModalVisible = false"
        >
          Cancel
        </NButton>
        <NButton
          class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          @click="handleConfirm"
        >
          Confirm
        </NButton>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import Loader from '../components/Loader.vue'
import TranslationEditor from '../components/TranslationEditor.vue'
import JsonEditor from '../components/JsonEditor.vue'
import LocalesList from '../components/LocalesList.vue'
import Modal from '../components/Modal.vue'
import Statistics from '../components/Statistics.vue'
import ActionBar from '../components/ActionBar.vue'
import { useI18nStore } from '../stores/useI18nStore'
import type { TranslationContent } from '../types'
import { flattenTranslations, unflattenTranslations } from '../util/i18nUtils'
import { type DriverType, Translator } from '../util/Translator'

const selectedDriver = ref('disabled')
const apiToken = ref('')
const driverOptions = ref<{ [key: string]: string | number | boolean }>({})

const {
  configs,
  isLoading,
  locales,
  selectedFile,
  selectedFileContent,
  handleFileSelected,
  exportTranslations,
  importTranslations,
  getDefaultLocaleTranslation,
} = useI18nStore()

const file = ref<HTMLInputElement | null>(null)

// Локальное состояние для хранения изменений
const localContent = ref<TranslationContent>({})

// Выбранный редактор
const selectedEditor = ref('translation') // Значение по умолчанию

// Ключ для localStorage
const storageKey = 'selectedEditor'

// Загрузка значения из localStorage при монтировании
onMounted(() => {
  const savedEditor = localStorage.getItem(storageKey)
  if (savedEditor) {
    selectedEditor.value = savedEditor
  }
  else {
    selectedEditor.value = 'translation' // Значение по умолчанию
  }
})

// Сохранение значения в localStorage при изменении
watch(selectedEditor, (newEditor) => {
  localStorage.setItem(storageKey, newEditor)
})

// Инициализация локального состояния при изменении selectedFileContent
watch(
  selectedFileContent,
  (newContent) => {
    if (!newContent) return
    localContent.value = { ...newContent }
  },
  { deep: true, immediate: true },
)

const filteredLocales = computed(() => {
  return locales.value
})

const importTranslationsClick = () => {
  file.value?.click()
}

const handleSave = () => {
  selectedFileContent.value = { ...localContent.value }
}

watch(selectedFile, (val) => {
  localContent.value = locales.value[val] ?? {}
})

// Модальное окно для статистики
const isStatisticsModalVisible = ref(false)

// Показать модальное окно с статистикой
const showStatisticsModal = () => {
  isStatisticsModalVisible.value = true
}

const isConfirmModalVisible = ref(false)

const confirmTranslateMissingKeys = () => {
  isConfirmModalVisible.value = true
}

const handleConfirm = async () => {
  isConfirmModalVisible.value = false
  await translateMissingKeys()
}

const translateMissingKeys = async () => {
  if (!localContent.value) return

  const defaultContent = getDefaultLocaleTranslation()
  const defaultFlatContent = flattenTranslations(defaultContent)
  const currentFlatContent = flattenTranslations(localContent.value)

  const missingKeys = Object.keys(defaultFlatContent).filter(key => !currentFlatContent[key])

  if (missingKeys.length === 0) {
    alert('No missing keys to translate.')
    return
  }

  try {
    const fromLang = configs.value.defaultLocale as string
    const translator = new Translator({
      apiKey: apiToken.value,
      driver: selectedDriver.value as DriverType,
      options: driverOptions.value,
    })

    for (const key of missingKeys) {
      const text = defaultFlatContent[key]
      if (text) {
        const fileName: string = selectedFile.value.split('/').pop() ?? ''
        currentFlatContent[key] = await translator.translate(text, fromLang, fileName.replace('.json', ''))
      }
    }

    localContent.value = unflattenTranslations(currentFlatContent)
    alert('Missing keys have been translated successfully.')
  }
  catch (error) {
    console.error('Translation error:', error)
    alert('An error occurred while translating missing keys.')
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
  loadSettings()
})
</script>

<style scoped>
.i18n-view {
  @apply h-full flex flex-col;
}

.editor-container {
  @apply flex flex-col h-full;
}

.editor-wrapper {
  @apply flex-1 flex flex-col gap-2 overflow-hidden;
}

.editor {
  @apply flex-1 overflow-auto;
}

.empty-state {
  @apply flex flex-col items-center justify-center h-full text-center p-8;
}

.empty-state__icon {
  @apply text-6xl mb-4 opacity-50;
}

.empty-state__title {
  @apply text-xl font-semibold text-slate-700 mb-2;
}

.empty-state__description {
  @apply text-slate-500;
}

.welcome-card {
  @apply text-center p-8;
}

.welcome-card__icon {
  @apply text-6xl mb-4;
}

.welcome-card__title {
  @apply text-2xl font-bold text-slate-800 mb-2;
}

.welcome-card__description {
  @apply text-slate-600;
}
</style>
