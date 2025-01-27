<template>
  <div
    class="h-screen overflow-auto"
    style="padding-top: 44px"
  >
    <Loader v-if="isLoading" />

    <NSplitPane
      v-else
      storage-key="tab-i18n-locales"
    >
      <template #left>
        <LocalesList
          :locales="filteredLocales"
          :selected-locale="selectedLocale"
          @locale-selected="handleLocaleSelected"
        />
      </template>

      <template #right>
        <div
          v-if="selectedLocale"
          h-full
          of-hidden
          flex="~ col"
        >
          <NSplitPane
            storage-key="tab-i18n-files"
            :horizontal="true"
          >
            <template #left>
              <FilesList
                :files="selectedLocaleFiles"
                :selected-file="selectedFile"
                @file-selected="handleFileSelected"
              />
            </template>
            <template #right>
              <div
                v-if="localContent"
                class="editor-container"
              >
                <!-- Панель кнопок -->
                <div class="actions">
                  <div class="left-buttons">
                    <NButton @click="exportTranslations">
                      Export Translations
                    </NButton>
                    <NButton @click="importTranslationsClick">
                      Import Translations
                    </NButton>
                    <input
                      v-show="false"
                      ref="file"
                      type="file"
                      @change="importTranslations"
                    >
                    <NButton @click="showStatisticsModal">
                      Stat
                    </NButton>

                    <NButton
                      v-if="selectedDriver !== 'disabled'"
                      @click="confirmTranslateMissingKeys"
                    >
                      Translate Missing Keys
                    </NButton>
                  </div>
                  <NButton
                    class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold"
                    @click="handleSave"
                  >
                    Save
                  </NButton>
                </div>

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
                class="text-gray-500"
              >
                Please select a locale and a file to view editor.
              </div>
            </template>
          </NSplitPane>
        </div>
        <NCard v-else>
          <template #default>
            Learn more about
            <NLink
              href="https://github.com/s00d/nuxt-i18n-micro"
              color="orange"
              target="_blank"
            >
              i18n
            </NLink>
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
import FilesList from '../components/FilesList.vue'
import Modal from '../components/Modal.vue' // Импортируем наш компонент Modal
import Statistics from '../components/Statistics.vue' // Импортируем новый компонент Statistics
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
  selectedLocale,
  selectedFile,
  selectedFileContent,
  handleLocaleSelected,
  handleFileSelected,
  exportTranslations,
  importTranslations,
  getDefaultLocaleTranslation,
} = useI18nStore()

const file = ref<HTMLButtonElement | null>(null)

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

const selectedLocaleFiles = computed(() => {
  const locale = locales.value.find(l => l.locale === selectedLocale.value)
  return locale ? locale.files : []
})

const filteredLocales = computed(() => {
  return locales.value
})

const importTranslationsClick = () => {
  file.value?.click()
}

const handleSave = () => {
  selectedFileContent.value = { ...localContent.value }
}

watch([selectedLocale, selectedFile], () => {
  const locale = locales.value.find(l => l.locale === selectedLocale.value)
  localContent.value = locale ? locale.content[selectedFile.value] : {}
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
  if (!selectedLocale.value || !localContent.value) return

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
        currentFlatContent[key] = await translator.translate(text, fromLang, selectedLocale.value)
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
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 5px;
}

.left-buttons {
  display: flex;
  gap: 10px;
}

.editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}
</style>
