import { ref, inject, readonly, type InjectionKey } from 'vue'
import type { I18nDevToolsBridge, LocaleData, TranslationContent, ModuleOptions } from '../types'

// Key for state injection
export const I18N_STATE_KEY = Symbol('i18n-state') as InjectionKey<ReturnType<typeof createI18nState>>

// State creation function (called once in App.ce.vue)
export function createI18nState() {
  const isLoading = ref(true)
  const selectedFile = ref('')
  const locales = ref<LocaleData>({})
  const configs = ref<ModuleOptions>({})
  const selectedFileContent = ref<TranslationContent>({})

  // Bridge is stored in ref so it can be set later
  const bridge = ref<I18nDevToolsBridge | null>(null)

  const setBridge = (newBridge: I18nDevToolsBridge) => {
    bridge.value = newBridge
  }

  // --- Methods ---
  const handleFileSelected = (file: string) => {
    // Normalize path: remove leading slash and normalize separators
    const normalizedPath = file.replace(/^\/+/, '').replace(/\\/g, '/')

    selectedFile.value = file

    // Try to find by normalized path
    let content = locales.value[normalizedPath]

    // If not found, try to find by original path
    if (!content) {
      content = locales.value[file]
    }

    // If still not found, try to find by path without leading slash
    if (!content && file.startsWith('/')) {
      content = locales.value[file.slice(1)]
    }

    if (content) {
      selectedFileContent.value = { ...content } as TranslationContent
    }
    else {
      console.warn('[i18n-state] No content found for file:', file, 'or normalized:', normalizedPath)
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
          }
          catch {
            console.error('Invalid JSON file')
          }
        }
        reader.readAsText(file)
      }
    }
  }

  const getDefaultLocaleTranslation = () => {
    const defaultLocale = configs.value.defaultLocale as string
    if (!defaultLocale) return {} as TranslationContent

    // Normalize path of selected file
    const normalizedSelected = selectedFile.value.replace(/^\/+/, '').replace(/\\/g, '/')

    // Get file name (e.g., de.json)
    const currentFileName = normalizedSelected.split('/').pop() ?? ''

    // Replace locale in file name with default locale
    const defaultFileName = currentFileName.replace(/^[^.]*\./, `${defaultLocale}.`)

    // Try to find file by different path variants
    let defaultContent = locales.value[defaultFileName]

    if (!defaultContent) {
      // Try with leading slash
      defaultContent = locales.value[`/${defaultFileName}`]
    }

    if (!defaultContent) {
      // Try to find any file with default locale
      const defaultLocaleKey = Object.keys(locales.value).find(key =>
        key.includes(`${defaultLocale}.json`) || key.endsWith(`/${defaultLocale}.json`),
      )
      if (defaultLocaleKey) {
        defaultContent = locales.value[defaultLocaleKey]
      }
    }

    return defaultContent ?? ({} as TranslationContent)
  }

  const init = async () => {
    if (!bridge.value) {
      console.warn('[i18n-devtools] Bridge not ready for init')
      isLoading.value = false
      return
    }

    try {
      isLoading.value = true

      const [localesData, configsData] = await Promise.all([
        bridge.value.getLocalesAndTranslations(),
        bridge.value.getConfigs(),
      ])

      locales.value = localesData
      configs.value = configsData

      // Subscribe to updates
      bridge.value.onLocalesUpdate((updatedLocales) => {
        locales.value = updatedLocales
        // Update selected file content if it's still selected
        if (selectedFile.value && locales.value[selectedFile.value]) {
          selectedFileContent.value = { ...locales.value[selectedFile.value] }
        }
      })
    }
    catch (error) {
      console.error('[i18n-devtools] Failed to initialize:', error)
      // Set loading to false even on error to show UI
      isLoading.value = false
    }
    finally {
      isLoading.value = false
      console.log('[i18n-devtools] Initialization complete')
    }
  }

  const saveCurrent = async () => {
    if (!bridge.value || !selectedFile.value || !selectedFileContent.value) return
    try {
      await bridge.value.saveTranslation(selectedFile.value, selectedFileContent.value)
      // Optimistic update
      locales.value[selectedFile.value] = { ...selectedFileContent.value }
    }
    catch (error) {
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
