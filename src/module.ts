import { defineNuxtModule, addPlugin, createResolver, addServerHandler, extendPages, addTypeTemplate } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  locales: string[]
  defaultLocale: string
  translationDir: string
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

    addPlugin(resolver.resolve('./runtime/01.plugin'))

    addTypeTemplate({
      filename: 'types/i18n.d.ts',
      getContents() {
        return `
          import type { Translations, PluralTranslations } from '.~/server/middleware/i18n'

          declare module global {
            var $getLocale(): string;
            var $getLocales(): string[];
            var $t(key: string, defaultValue?: string): string | number | boolean | Translations | PluralTranslations | unknown[] | null;
            var $tc(key: string, count: number, defaultValue?: string): string;
            var $mergeTranslations(newTranslations: Translations): void;
            var $setLocale(locale: string): void;
            var $switchLocale(locale: string): Promise<void>;
            var $loadPageTranslations(locale: string): Promise<void>;
          }
        `
      },
    })

    const localeRegex = options.locales.filter(locale => locale !== options.defaultLocale).join('|')

    extendPages((pages) => {
      nuxt.options.generate.routes = Array.isArray(nuxt.options.generate.routes) ? nuxt.options.generate.routes : []
      // Получаем все страницы приложения
      const pagesList = nuxt.options.generate.routes || []

      const newRoutes = pages.map((page) => {
        options.locales.forEach((locale) => {
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
      options.locales.forEach((locale) => {
        if (locale !== options.defaultLocale) {
          pages.forEach((page) => {
            routes.push(`/${locale}${page}`)
            routes.push(`/_nuxt/locales/${page}/${locale}/data.json`)
          })
        }
      })

      // Обновляем опцию routes в конфигурации Nitro
      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = routes
    })

    nuxt.hook('nitro:build:before', async (nitro) => {

    })

    nuxt.hook('prerender:routes', async (prerenderRoutes) => {

      const routesSet = prerenderRoutes.routes
      const additionalRoutes = new Set<string>()

      // Проходим по каждому существующему маршруту и добавляем локализованные версии, кроме дефолтной локали
      routesSet.forEach((route) => {
        options.locales.forEach((locale) => {
          if (locale !== options.defaultLocale) {
            if (route === '/') {
              additionalRoutes.add(`/${locale}`)
            }
            else {
              additionalRoutes.add(`/${locale}${route}`)
            }
          }
        })
      })

      // Добавляем новые локализованные маршруты к существующим
      additionalRoutes.forEach(route => routesSet.add(route))
    })

    addServerHandler({
      middleware: true,
      // route: '/*',
      handler: resolver.resolve('./server/middleware/i18n'),
    })
  },
})
