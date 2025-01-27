import { ref } from 'vue'
import type { ModuleOptions } from 'nuxt-i18n-micro-types'
import type { LocaleData, TranslationContent } from '../types'

const isLoading = ref(true)
const selectedLocale = ref('')
const selectedFile = ref('')
const locales = ref<LocaleData[]>([])
const configs = ref<ModuleOptions>({})
const selectedFileContent = ref<TranslationContent>({})

export const useI18nStore = () => {
  const handleLocaleSelected = (locale: string) => {
    selectedLocale.value = locale
    selectedFile.value = ''
  }

  const handleFileSelected = (file: string) => {
    selectedFile.value = file
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

  const getDefaultLocaleTranslation = () => {
    const defaultLocale = configs.value.defaultLocale as string
    if (!defaultLocale) return {} as TranslationContent

    const defaultLocaleData = locales.value.find(l => l.locale === defaultLocale)
    if (!defaultLocaleData) return {} as TranslationContent

    const fileName = selectedFile.value.replace(selectedLocale.value + '.json', defaultLocale + '.json')
    return defaultLocaleData.content[fileName] ?? {} as TranslationContent
  }

  const getDefaultLocaleValueByKey = (key: string): string => {
    const defaultLocale = configs.value.defaultLocale as string
    if (!defaultLocale) return ''

    const defaultLocaleData = locales.value.find(l => l.locale === defaultLocale)
    if (!defaultLocaleData) return ''

    const flattenJSON = (obj: TranslationContent, parentKey = '', result: Record<string, string> = {}): Record<string, string> => {
      for (const k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
          const newKey = parentKey ? `${parentKey}.${k}` : k
          const value = obj[k]
          if (typeof value === 'object' && value !== null) {
            flattenJSON(value as TranslationContent, newKey, result)
          }
          else {
            result[newKey] = value as string
          }
        }
      }
      return result
    }

    const fileName = selectedFile.value.replace(selectedLocale.value + '.json', defaultLocale + '.json')
    const flattenedContent = flattenJSON(defaultLocaleData.content[fileName])

    return flattenedContent[key] || ''
  }

  return {
    isLoading,
    selectedLocale,
    selectedFile,
    locales,
    configs,
    selectedFileContent,
    handleLocaleSelected,
    handleFileSelected,
    exportTranslations,
    importTranslations,
    getDefaultLocaleTranslation,
    getDefaultLocaleValueByKey,
  }
}
