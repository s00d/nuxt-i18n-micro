<template>
  <div class="relative h-full w-full overflow-hidden" @keydown="onKeydown">
    <Loader v-if="isLoading" />

    <SplitPane v-else storage-key="tab-i18n-locales" default-left-width="260px">
      <template #left>
        <LocalesList :locales="filteredLocales" :selected-file="selectedFile" @file-selected="handleFileSelected" />
      </template>

      <template #right>
        <div v-if="selectedFile" class="flex h-full w-full flex-col overflow-hidden">
          <div class="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2">
            <div class="flex min-w-0 flex-1 basis-48 items-center gap-2">
              <Icon name="file" class="text-muted" />
              <!-- a long folder path gives way first, then the file name -->
              <span class="flex min-w-0 font-mono text-sm" :title="selectedFile">
                <span class="min-w-0 truncate text-muted">{{ fileFolder }}</span
                ><span class="max-w-full shrink-0 truncate font-semibold text-highlighted">{{ fileName }}</span>
              </span>
              <Badge v-if="fileLocale" color="primary">{{ fileLocale }}</Badge>
              <span v-if="saveState !== 'idle'" :class="['text-xs', saveState === 'error' ? 'text-error' : 'text-muted']" role="status">{{
                SAVE_LABEL[saveState]
              }}</span>
            </div>
            <ActionBar
              :show-translate-button="selectedDriver !== 'disabled'"
              @export="exportTranslations"
              @import="importTranslationsClick"
              @show-stats="showStatisticsModal"
              @translate-missing="confirmTranslateMissingKeys"
              @save="handleSave"
            />
          </div>
          <div class="min-h-0 flex-1">
            <TranslationEditor v-model="localContent" />
          </div>
        </div>

        <EmptyState
          v-else
          icon="languages"
          title="No file selected"
          description="Pick a translation file on the left to edit its keys side by side with the default locale."
        />
      </template>
    </SplitPane>

    <Modal v-if="isStatisticsModalVisible" v-model:show="isStatisticsModalVisible" :title="`Statistics · ${fileName}`" size="lg">
      <Statistics v-if="localContent" :content="localContent" />
    </Modal>

    <Modal v-if="isConfirmModalVisible" v-model:show="isConfirmModalVisible" title="Translate missing keys" size="sm">
      <p class="text-sm">
        Fill the empty keys of <code class="code">{{ fileName }}</code> from the default locale
        <code class="code">{{ configs.defaultLocale }}</code> with <strong class="text-highlighted">{{ selectedDriver }}</strong
        >? Review the result before saving.
      </p>
      <template #footer>
        <Button @click="isConfirmModalVisible = false">Cancel</Button>
        <Button variant="primary" icon="sparkles" @click="handleConfirm">Translate</Button>
      </template>
    </Modal>

    <Modal v-if="isFeedbackModalVisible" v-model:show="isFeedbackModalVisible" :title="feedbackTitle" size="sm">
      <p class="text-sm">{{ feedbackMessage }}</p>
      <template #footer>
        <Button variant="primary" @click="isFeedbackModalVisible = false">OK</Button>
      </template>
    </Modal>

    <input v-show="false" ref="file" type="file" accept=".json" @change="importTranslations" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import LocalesList from '../components/data/LocalesList.vue'
import Statistics from '../components/data/Statistics.vue'
import TranslationEditor from '../components/editor/TranslationEditor.vue'
import ActionBar from '../components/layout/ActionBar.vue'
import SplitPane from '../components/layout/SplitPane.vue'
import Badge from '../components/ui/Badge.vue'
import Button from '../components/ui/Button.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import Icon from '../components/ui/Icon.vue'
import Loader from '../components/ui/Loader.vue'
import Modal from '../components/ui/Modal.vue'
import { useI18nState } from '../composables/useI18nState'
import type { TranslationContent } from '../types'
import { flattenTranslations, unflattenTranslations } from '../util/i18nUtils'
import { type DriverType, loadTranslationSettings, Translator } from '../util/Translator'

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
  loadTranslationSettings(selectedDriver, apiToken, driverOptions)
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

/** `pages/about/` + `de.json`, and the locale the file name starts with. */
const fileFolder = computed(() => selectedFile.value.slice(0, selectedFile.value.lastIndexOf('/') + 1))
const fileName = computed(() => selectedFile.value.slice(fileFolder.value.length))
const fileLocale = computed(() => fileName.value.split('.')[0] ?? '')

const SAVE_LABEL = { idle: '', saving: 'Saving…', saved: 'Saved', error: 'Save failed' }
const saveState = ref<keyof typeof SAVE_LABEL>('idle')
watch(selectedFile, () => (saveState.value = 'idle'))

const handleSave = async () => {
  // Save through composable
  selectedFileContent.value = { ...localContent.value }
  saveState.value = 'saving'
  try {
    await saveCurrent()
    saveState.value = 'saved'
  } catch {
    // saveCurrent logged it and kept the draft for a retry
    saveState.value = 'error'
  }
}

/** Ctrl/⌘ + S saves the open file. */
const onKeydown = (event: KeyboardEvent) => {
  if (event.key.toLowerCase() !== 's' || !(event.metaKey || event.ctrlKey) || !selectedFile.value) return
  event.preventDefault()
  handleSave()
}

// Modal window for statistics
const isStatisticsModalVisible = ref(false)

// Show statistics modal
const showStatisticsModal = () => {
  isStatisticsModalVisible.value = true
}

const isConfirmModalVisible = ref(false)
const isFeedbackModalVisible = ref(false)
const feedbackTitle = ref('')
const feedbackMessage = ref('')

const showFeedback = (title: string, message: string) => {
  feedbackTitle.value = title
  feedbackMessage.value = message
  isFeedbackModalVisible.value = true
}

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
    showFeedback('Translation', 'Nothing to translate: no keys are missing.')
    return
  }

  try {
    const fromLang = configs.value.defaultLocale as string
    const translator = new Translator({
      apiKey: apiToken.value,
      driver: selectedDriver.value as DriverType,
      options: driverOptions.value,
    })

    const fileName: string = selectedFile.value.split('/').pop() ?? ''
    await Promise.all(
      missingKeys.map(async (key) => {
        const text = defaultFlatContent[key]
        if (text) {
          currentFlatContent[key] = await translator.translate(text, fromLang, fileName.replace('.json', ''))
        }
      }),
    )

    localContent.value = unflattenTranslations(currentFlatContent)
    showFeedback('Translation', `Translated ${missingKeys.length} key(s). Review them and save.`)
  } catch (error) {
    console.error(error)
    showFeedback('Translation', 'Translation failed, see the browser console.')
  }
}
</script>
