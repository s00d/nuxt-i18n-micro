import { type InjectionKey, inject, readonly, ref } from 'vue'
import type { I18nDevToolsBridge, LocaleData, ModuleOptions, TranslationContent } from '../types'

// Injection key for state
export const I18N_STATE_KEY = Symbol('i18n-state') as InjectionKey<ReturnType<typeof createI18nState>>

// State creation function (called once in App.ce.vue)
export function createI18nState() {
  const isLoading = ref(true)
  const selectedFile = ref('')
  const locales = ref<LocaleData>({})
  const configs = ref<ModuleOptions>({})
  const selectedFileContent = ref<TranslationContent>({})

  // Bridge is stored in a ref so it can be set later
  const bridge = ref<I18nDevToolsBridge | null>(null)

  const setBridge = (newBridge: I18nDevToolsBridge) => {
    bridge.value = newBridge
  }

  // --- Methods ---
  /** Listed files are keyed without a leading slash and with `/` separators. */
  const normalizeFile = (file: string) => file.replace(/\\/g, '/').replace(/^\/+/, '')

  /** The listed file under `key`, own keys only (`constructor.json` is not a file). */
  const listed = (key: string) => (Object.prototype.hasOwnProperty.call(locales.value, key) ? locales.value[key] : undefined)

  const handleFileSelected = (file: string) => {
    // One key per file: saves and live updates write back under the same key the list shows.
    const key = normalizeFile(file)
    selectedFile.value = key

    const content = listed(key)
    if (content) {
      selectedFileContent.value = { ...content } as TranslationContent
    } else {
      console.warn('[i18n-state] No content found for file:', file)
      selectedFileContent.value = {} as TranslationContent
    }
  }

  const exportTranslations = async () => {
    const blob = new Blob([JSON.stringify(selectedFileContent.value, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'translations.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const importTranslations = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            selectedFileContent.value = JSON.parse(e.target?.result as string)
          } catch {
            console.error('Invalid JSON file')
          }
        }
        reader.readAsText(file)
      }
    }
  }

  /** The default-locale sibling of the open file: `pages/about/de.json` → `pages/about/en.json`. */
  const getDefaultLocaleTranslation = () => {
    const defaultLocale = configs.value.defaultLocale as string
    if (!defaultLocale) return {} as TranslationContent

    // Swap the locale in the file name (`de.json`, `de.extra.json`), keep the folder
    const defaultFile = normalizeFile(selectedFile.value).replace(/[^/]*?\.(?=[^/]*$)/, `${defaultLocale}.`)
    return listed(defaultFile) ?? listed(`/${defaultFile}`) ?? ({} as TranslationContent)
  }

  const init = async () => {
    if (!bridge.value) {
      console.warn('[i18n-devtools] Bridge not ready for init')
      isLoading.value = false
      return
    }

    try {
      isLoading.value = true

      const [localesData, configsData] = await Promise.all([bridge.value.getLocalesAndTranslations(), bridge.value.getConfigs()])

      locales.value = localesData
      configs.value = configsData

      // Subscribe to updates
      bridge.value.onLocalesUpdate((updatedLocales) => {
        locales.value = updatedLocales
        // Update selected file content if it's still selected
        const content = listed(selectedFile.value)
        if (content) selectedFileContent.value = { ...content }
      })
    } catch (error) {
      console.error('[i18n-devtools] Failed to initialize:', error)
      // Set loading to false even on error to show UI
      isLoading.value = false
    } finally {
      isLoading.value = false
      console.log('[i18n-devtools] Initialization complete')
    }
  }

  const saveCurrent = async () => {
    if (!bridge.value || !selectedFile.value || !selectedFileContent.value) return
    const file = selectedFile.value
    const draft = selectedFileContent.value
    try {
      await bridge.value.saveTranslation(file, draft)
      // Optimistic update
      locales.value[file] = { ...draft }
    } catch (error) {
      // The bridge rolled the app back and its update refreshed the open file: keep the edit to retry
      if (selectedFile.value === file) selectedFileContent.value = draft
      console.error('Failed to save translation:', error)
      throw error
    }
  }

  return {
    isLoading,
    selectedFile,
    locales,
    configs,
    selectedFileContent,
    bridge: readonly(bridge),
    setBridge,
    init,
    handleFileSelected,
    exportTranslations,
    importTranslations,
    getDefaultLocaleTranslation,
    saveCurrent,
  }
}

// Composable for use in child components
export function useI18nState() {
  const state = inject(I18N_STATE_KEY)
  if (!state) {
    throw new Error('I18n state not provided. Make sure to use createI18nState() and provide it in the root component.')
  }
  return state
}
