import { defineNuxtModule, addPlugin, createResolver, addServerHandler, extendPages } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  locales?: string[]
  defaultLocale?: string
  translationDir?: string
}

export interface ModuleOptionsExtend extends ModuleOptions {
  rootDir?: string
}

declare module '@nuxt/schema' {
  interface ConfigSchema {
    publicRuntimeConfig?: {
      myModule?: ModuleOptions
    }
  }
  interface NuxtConfig {
    myModule?: ModuleOptions
  }
  interface NuxtOptions {
    myModule?: ModuleOptions
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'my-module',
    configKey: 'myModule',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    locales: ['en', 'ru', 'de'],
    defaultLocale: 'en',
    translationDir: 'locales',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.public.myModule = { ...options, rootDir: nuxt.options.rootDir }

    addPlugin({
      src: resolver.resolve('./runtime/01.plugin'),
      order: 1,
    })

    const localeRegex = options.locales!.filter(locale => locale !== options.defaultLocale).join('|')

    extendPages((pages) => {
      nuxt.options.generate.routes = Array.isArray(nuxt.options.generate.routes) ? nuxt.options.generate.routes : []
      // Получаем все страницы приложения
      const pagesList = nuxt.options.generate.routes || []

      const newRoutes = pages.map((page) => {
        options.locales!.forEach((locale) => {
          if (locale !== options.defaultLocale) {
            pages.forEach((page) => {
              pagesList.push(`/${locale}${page}`)
            })
          }
        })
        return {
          ...page,
          path: `/:locale(${localeRegex})${page.path}`,
          name: `localized-${page.name}`,
          meta: {
            ...page.meta,
          },
        }
      })

      // Добавляем новые маршруты
      pages.push(...newRoutes)
    })

    nuxt.hook('nitro:config', (nitroConfig) => {
      const routes = nitroConfig.prerender?.routes || []

      nuxt.options.generate.routes = Array.isArray(nuxt.options.generate.routes) ? nuxt.options.generate.routes : []
      // Получаем все страницы приложения
      const pages = nuxt.options.generate.routes || []

      // Генерируем маршруты для всех локалей, кроме дефолтной
      options.locales!.forEach((locale) => {
        if (locale !== options.defaultLocale) {
          pages.forEach((page) => {
            routes.push(`/${locale}${page}`)
          })
        }
      })

      // Обновляем опцию routes в конфигурации Nitro
      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = routes
    })
  },
})
