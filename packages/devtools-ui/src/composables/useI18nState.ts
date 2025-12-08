import { ref, inject, readonly, type InjectionKey } from 'vue'
import type { I18nDevToolsBridge, LocaleData, TranslationContent, ModuleOptions } from '../types'

// Ключ для injection состояния
export const I18N_STATE_KEY = Symbol('i18n-state') as InjectionKey<ReturnType<typeof createI18nState>>

// Функция создания состояния (вызывается один раз в App.ce.vue)
export function createI18nState() {
  const isLoading = ref(true)
  const selectedFile = ref('')
  const locales = ref<LocaleData>({})
  const configs = ref<ModuleOptions>({})
  const selectedFileContent = ref<TranslationContent>({})

  // Bridge хранится в ref, чтобы можно было его установить позже
  const bridge = ref<I18nDevToolsBridge | null>(null)

  const setBridge = (newBridge: I18nDevToolsBridge) => {
    bridge.value = newBridge
  }

  // --- Methods ---
  const handleFileSelected = (file: string) => {
    // Нормализуем путь: убираем ведущий слэш и нормализуем разделители
    const normalizedPath = file.replace(/^\/+/, '').replace(/\\/g, '/')

    console.log('[i18n-state] File selected:', file, '-> normalized:', normalizedPath)
    console.log('[i18n-state] Available locales keys:', Object.keys(locales.value))

    selectedFile.value = file

    // Пробуем найти по нормализованному пути
    let content = locales.value[normalizedPath]

    // Если не нашли, пробуем найти по оригинальному пути
    if (!content) {
      content = locales.value[file]
    }

    // Если все еще не нашли, пробуем найти по пути без ведущего слэша
    if (!content && file.startsWith('/')) {
      content = locales.value[file.slice(1)]
    }

    if (content) {
      console.log('[i18n-state] Found content for file:', normalizedPath || file)
      console.log('[i18n-state] Content type:', typeof content, 'is object:', typeof content === 'object', 'is array:', Array.isArray(content))
      const contentKeys = content && typeof content === 'object'
        ? Object.keys(content as Record<string, unknown>).slice(0, 5)
        : 'not an object'
      console.log('[i18n-state] Content keys:', contentKeys)
      const contentSample = content && typeof content === 'object'
        ? Object.keys(content as Record<string, unknown>).slice(0, 3).reduce((acc, key) => {
            acc[key] = (content as Record<string, unknown>)[key]
            return acc
          }, {} as Record<string, unknown>)
        : content
      console.log('[i18n-state] Content sample:', contentSample)
      selectedFileContent.value = { ...content } as TranslationContent
      console.log('[i18n-state] selectedFileContent.value after assignment:', Object.keys(selectedFileContent.value).length, 'keys')
      console.log('[i18n-state] selectedFileContent.value keys:', Object.keys(selectedFileContent.value).slice(0, 5))
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

    // Нормализуем путь выбранного файла
    const normalizedSelected = selectedFile.value.replace(/^\/+/, '').replace(/\\/g, '/')

    // Получаем имя файла (например, de.json)
    const currentFileName = normalizedSelected.split('/').pop() ?? ''

    // Заменяем локаль в имени файла на дефолтную локаль
    const defaultFileName = currentFileName.replace(/^[^.]*\./, `${defaultLocale}.`)

    // Пробуем найти файл по разным вариантам пути
    let defaultContent = locales.value[defaultFileName]

    if (!defaultContent) {
      // Пробуем с ведущим слэшем
      defaultContent = locales.value[`/${defaultFileName}`]
    }

    if (!defaultContent) {
      // Пробуем найти любой файл с дефолтной локалью
      const defaultLocaleKey = Object.keys(locales.value).find(key =>
        key.includes(`${defaultLocale}.json`) || key.endsWith(`/${defaultLocale}.json`),
      )
      if (defaultLocaleKey) {
        defaultContent = locales.value[defaultLocaleKey]
      }
    }

    console.log('[i18n-state] getDefaultLocaleTranslation:', {
      selectedFile: selectedFile.value,
      normalizedSelected,
      currentFileName,
      defaultFileName,
      found: !!defaultContent,
      availableKeys: Object.keys(locales.value),
    })

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
      console.log('[i18n-devtools] Initializing with bridge...', bridge.value)

      const [localesData, configsData] = await Promise.all([
        bridge.value.getLocalesAndTranslations(),
        bridge.value.getConfigs(),
      ])

      console.log('[i18n-devtools] Data loaded:', {
        localesCount: Object.keys(localesData).length,
        configs: configsData,
      })
      console.log('[i18n-devtools] LocalesData keys:', Object.keys(localesData))
      console.log('[i18n-devtools] LocalesData sample:', Object.keys(localesData).slice(0, 2).reduce((acc, key) => {
        const value = localesData[key]
        if (value) {
          acc[key] = value
        }
        return acc
      }, {} as LocaleData))

      locales.value = localesData
      console.log('[i18n-devtools] locales.value after assignment:', Object.keys(locales.value).length, 'keys')
      console.log('[i18n-devtools] locales.value keys:', Object.keys(locales.value))
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

// Composable для использования в дочерних компонентах
export function useI18nState() {
  const state = inject(I18N_STATE_KEY)
  if (!state) {
    throw new Error('I18n state not provided. Make sure to use createI18nState() and provide it in the root component.')
  }
  return state
}
