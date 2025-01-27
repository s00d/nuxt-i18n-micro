import { ref } from 'vue'
import type { ModuleOptions } from 'nuxt-i18n-micro-types'
import type { LocaleData, TranslationContent } from '../types'

const isLoading = ref(true)
const selectedFile = ref('')
const locales = ref<LocaleData>({})
const configs = ref<ModuleOptions>({})
const selectedFileContent = ref<TranslationContent>({})

export const useI18nStore = () => {
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

    let fileName: string = selectedFile.value.split('/').pop() ?? ''
    fileName = selectedFile.value.replace(fileName, defaultLocale + '.json')
    return locales.value[fileName] ?? {} as TranslationContent
  }

  return {
    isLoading,
    selectedFile,
    locales,
    configs,
    selectedFileContent,
    handleFileSelected,
    exportTranslations,
    importTranslations,
    getDefaultLocaleTranslation,
  }
}
