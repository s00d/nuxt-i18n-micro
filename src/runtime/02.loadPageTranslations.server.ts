import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'
import { defineNuxtPlugin, useRoute, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {
  const { $mergeTranslations, $getLocale } = nuxtApp
  const config = useRuntimeConfig()
  const route = useRoute()

  const loadPageTranslations = async (locale: string) => {
    const page = route.name?.toString().split('-').pop() // Получаем имя страницы
    if (!page) return

    try {
      // Если серверный рендеринг, то читаем файл напрямую
      const translationPath = resolve(config.public.myModule.rootDir, config.public.myModule.translationDir, `pages/${page}_${locale}.json`)
      const fileContent = await readFile(translationPath, 'utf-8')
      const pageTranslations = JSON.parse(fileContent)

      // Мерджим переводы
      $mergeTranslations(pageTranslations)
    } catch (error) {
      console.error(`Failed to load page translations for ${locale}:`, error)
    }
  }

  // Загружаем переводы при первой загрузке
  const currentLocale = $getLocale()
  await loadPageTranslations(currentLocale)

  // Экспортируем метод для использования в компонентах
  nuxtApp.provide('loadPageTranslations', loadPageTranslations)
})
