// import { resolve } from 'node:path'
// import { readFile } from 'node:fs/promises'
import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { ModuleOptionsExtend } from '~/src/module'

// const translationCache: Record<string, Record<string, unknown>> = {}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const i18nOptions: ModuleOptionsExtend = config.public.myModule as ModuleOptionsExtend
  const { locales, defaultLocale, rootDir, translationDir } = i18nOptions
  const url = event.path || ''

  if (url.startsWith('_nuxt') || /\.\w+$/.test(url)) {
    return
  }

  const matchedLocale = locales.find(locale => url === `/${locale}` || url.startsWith(`/${locale}/`)) || defaultLocale

  // Determine the chunk name based on the route (e.g., 'home' for /home)
  const routeName = url.split('/').filter(Boolean)[1] || 'index'
  const cacheKey = `${matchedLocale}-${routeName}`

  console.log('cachekey: ', cacheKey, Date.now())

  // Check cache
  // if (!translationCache[cacheKey]) {
  //   const commonPath = resolve(rootDir!, translationDir, `${matchedLocale}.json`)
  //   const chunkPath = resolve(rootDir!, translationDir, 'pages', `${routeName}_${matchedLocale}.json`)
  //
  //   console.info(`reload locales`, commonPath, chunkPath)
  //
  //   try {
  //     // Load common translations first
  //     const commonContent = await readFile(commonPath, 'utf-8')
  //     const commonTranslations = JSON.parse(commonContent)
  //
  //     // Attempt to load route-specific translations
  //     let chunkTranslations = {}
  //     try {
  //       const chunkContent = await readFile(chunkPath, 'utf-8')
  //       chunkTranslations = JSON.parse(chunkContent)
  //     }
  //     catch {
  //       console.warn(`No specific translations found for route: ${routeName}`)
  //     }
  //
  //     // Merge translations and cache them
  //     translationCache[cacheKey] = { ...commonTranslations, ...chunkTranslations }
  //   }
  //   catch (error) {
  //     console.error(`Ошибка загрузки файла перевода: ${cacheKey}`, error)
  //     translationCache[cacheKey] = {}
  //   }
  // }

  event.context.i18n = {
    locale: matchedLocale,
    translations: {},
    // translations: translationCache[cacheKey],
    defaultLocale,
    translationDir,
    locales,
    rootDir,
  }
})
