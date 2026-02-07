<template>
  <div class="i18n-view">
    <Loader v-if="isLoading" />

    <SplitPane
      v-else
      storage-key="tab-i18n-locales"
      default-left-width="280px"
    >
      <template #left>
        <div class="pane-inner">
          <LocalesList
            :locales="filteredLocales"
            :selected-file="selectedFile"
            @file-selected="handleFileSelected"
          />
        </div>
      </template>

      <template #right>
        <div class="pane-inner bg-white">
          <div
            v-if="selectedFile"
            class="editor-layout"
          >
            <!-- Header section -->
            <div class="editor-header">
              <div class="breadcrumbs">
                <span class="breadcrumbs__icon">📄</span>
                <span class="breadcrumbs__path">{{ selectedFile }}</span>
              </div>

              <div class="action-bar-wrapper">
                <ActionBar
                  :show-translate-button="selectedDriver !== 'disabled'"
                  @export="exportTranslations"
                  @import="importTranslationsClick"
                  @show-stats="showStatisticsModal"
                  @translate-missing="confirmTranslateMissingKeys"
                  @save="handleSave"
                />
              </div>
            </div>

            <!-- Editor area -->
            <div class="editor-content-area">
              <div class="editor-scroll-container">
                <TranslationEditor
                  v-model="localContent"
                  class="h-full"
                />
              </div>
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
              Select a file from the tree to edit
            </div>
          </div>
        </div>
      </template>
    </SplitPane>

    <!-- Modals -->
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
      <p>Are you sure?</p>
      <div class="flex justify-end gap-2 mt-4">
        <Button
          variant="danger"
          @click="isConfirmModalVisible = false"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          @click="handleConfirm"
        >
          Confirm
        </Button>
      </div>
    </Modal>

    <!-- Hidden input -->
    <input
      v-show="false"
      ref="file"
      type="file"
      accept=".json"
      @change="importTranslations"
    >
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import LocalesList from '../components/data/LocalesList.vue'
import Statistics from '../components/data/Statistics.vue'
import TranslationEditor from '../components/editor/TranslationEditor.vue'
import ActionBar from '../components/layout/ActionBar.vue'
import SplitPane from '../components/layout/SplitPane.vue'
import Button from '../components/ui/Button.vue'
import Loader from '../components/ui/Loader.vue'
import Modal from '../components/ui/Modal.vue'
import { useI18nState } from '../composables/useI18nState'
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
  saveCurrent,
} = useI18nState()

const file = ref<HTMLInputElement | null>(null)

// Local state for storing changes
const localContent = ref<TranslationContent>({})

onMounted(() => {
  loadSettings()
})

// Initialize local state when selectedFileContent changes
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

const handleSave = async () => {
  // Save through composable
  selectedFileContent.value = { ...localContent.value }
  await saveCurrent()
}

watch(selectedFile, (val) => {
  // Normalize path for lookup
  const normalizedPath = val.replace(/^\/+/, '').replace(/\\/g, '/')
  localContent.value = locales.value[normalizedPath] ?? locales.value[val] ?? (val.startsWith('/') ? locales.value[val.slice(1)] : {}) ?? {}
})

// Modal window for statistics
const isStatisticsModalVisible = ref(false)

// Show statistics modal
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
  const missingKeys = Object.keys(defaultFlatContent).filter((key) => !currentFlatContent[key])

  if (missingKeys.length === 0) {
    alert('No missing keys.')
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
    alert('Translated.')
  } catch (error) {
    console.error(error)
    alert('Error.')
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
    } catch {
      localStorage.removeItem('translationSettings')
    }
  }
}
</script>

<style scoped>
@reference "tailwindcss";

.i18n-view {
  @apply h-full w-full relative overflow-hidden;
}

/* Inner pane containers */
.pane-inner {
  @apply w-full h-full overflow-hidden flex flex-col;
}

.editor-layout {
  @apply flex flex-col h-full w-full overflow-hidden;
}

.editor-header {
  @apply shrink-0 bg-white z-10;
}

.breadcrumbs {
  @apply px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs font-mono text-slate-600 flex items-center gap-2;
}

.breadcrumbs__icon {
  @apply text-base;
}

.breadcrumbs__path {
  @apply truncate text-slate-700 font-medium;
}

.action-bar-wrapper {
  @apply border-b border-slate-200;
}

.editor-content-area {
  @apply flex-1 relative overflow-hidden;
}

.editor-scroll-container {
  @apply absolute inset-0 overflow-hidden;
}

.empty-state,
.welcome-card {
  @apply flex flex-col items-center justify-center h-full text-center p-8 text-slate-500;
}

.empty-state__icon,
.welcome-card__icon {
  @apply text-6xl mb-4 opacity-50;
}

.empty-state__title,
.welcome-card__title {
  @apply text-xl font-bold text-slate-700 mb-2;
}
</style>
