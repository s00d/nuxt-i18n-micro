import { defineNuxtPlugin, useRoute, watch } from '#imports'

// Кэш для хранения загруженных переводов
const translationCache: Record<string, Record<string, unknown>> = {}

export default defineNuxtPlugin(async (nuxtApp) => {
  console.log(1111, nuxtApp)
  const { $mergeTranslations, $getLocale } = nuxtApp
  const route = useRoute()

  const loadPageTranslations = async (locale: string) => {
    const page = route.name?.toString().split('-').pop() // Получаем имя страницы
    if (!page) return

    const cacheKey = `${page}_${locale}`

    // Проверяем, есть ли уже переводы в кэше
    if (translationCache[cacheKey]) {
      $mergeTranslations(translationCache[cacheKey])
      return
    }

    try {
      // На клиенте загружаем переводы через fetch
      const response = await fetch(`/_nuxt/locales/${page}/${locale}/data.json`)
      if (response.ok) {
        const pageTranslations = await response.json()

        // Сохраняем переводы в кэш
        translationCache[cacheKey] = pageTranslations

        // Мерджим переводы
        $mergeTranslations(pageTranslations)
      } else {
        console.error(`Failed to load page translations from server for ${locale}: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`Failed to load page translations from server for ${locale}:`, error)
    }
  }

  // Загружаем переводы при первой загрузке
  const currentLocale = $getLocale()
  await loadPageTranslations(currentLocale)

  watch(
    () => route.path,
    async () => {
      await loadPageTranslations($getLocale())
    },
  )

  // Экспортируем метод для использования в компонентах
  nuxtApp.provide('loadPageTranslations', loadPageTranslations)
})
