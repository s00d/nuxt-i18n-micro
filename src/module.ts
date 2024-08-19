import path from 'node:path'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import {
  addImportsDir,
  addPlugin,
  addPrerenderRoutes,
  addServerHandler,
  createResolver,
  defineNuxtModule,
  extendPages,
} from '@nuxt/kit'
import type { HookResult } from '@nuxt/schema'
import { setupDevToolsUI } from './devtools'

export interface Locale {
  code: string
  iso?: string
  dir?: 'rtl' | 'ltr'
}

// Module options TypeScript interface definition
export interface ModuleOptions {
  locales?: Locale[]
  mata?: boolean
  defaultLocale?: string
  translationDir?: string
  autoDetectLanguage?: boolean
  includeDefaultLocaleRoute?: boolean
  cache?: boolean
  plural?: string
}

declare module '@nuxt/schema' {
  interface ConfigSchema {
    publicRuntimeConfig?: {
      i18nConfig?: ModuleOptions
    }
  }
  interface NuxtConfig {
    i18nConfig?: ModuleOptions
  }
  interface NuxtOptions {
    i18nConfig?: ModuleOptions
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-i18n-micro',
    configKey: 'i18n',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    locales: [],
    mata: true,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: true,
    includeDefaultLocaleRoute: false,
    cache: false,
    plural: `function (translation, count, _locale) {
      const forms = translation.toString().split('|')
      if (count === 0 && forms.length > 2) {
        return forms[0].trim() // Case for "no apples"
      }
      if (count === 1 && forms.length > 1) {
        return forms[1].trim() // Case for "one apple"
      }
      return (forms.length > 2 ? forms[2].trim() : forms[forms.length - 1].trim()).replace('{count}', count.toString())
    }`,
  },
  setup: function (options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.public.i18nConfig = {
      rootDir: nuxt.options.rootDir,
      plural: options.plural!,
      locales: options.locales ?? [],
      mata: options.mata ?? true,
      defaultLocale: options.defaultLocale ?? 'en',
      translationDir: options.translationDir ?? 'locales',
      autoDetectLanguage: options.autoDetectLanguage ?? true,
      includeDefaultLocaleRoute: options.includeDefaultLocaleRoute ?? false,
      cache: options.cache ?? false,
    }

    addPlugin({
      src: resolver.resolve('./runtime/plugins/01.plugin'),
      order: 1,
    })

    if (options.mata) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/02.meta'),
        order: 2,
      })
    }

    addPlugin({
      src: resolver.resolve('./runtime/plugins/03.define'),
      order: 3,
    })

    if (options.autoDetectLanguage) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/04.auto-detect'),
        mode: 'client',
        order: 4,
      })
    }

    addImportsDir(resolver.resolve('./runtime/composables'))

    if (options.includeDefaultLocaleRoute) {
      addServerHandler({
        middleware: true,
        handler: resolver.resolve('./runtime/server/middleware/i18n-redirect'),
      })
    }

    addServerHandler({
      route: '/_locales/:page/:locale/data.json',
      handler: resolver.resolve('./runtime/server/middleware/i18n-loader'),
    })

    const localeRegex = options.locales!
      .filter(locale => locale.code !== options.defaultLocale || options.includeDefaultLocaleRoute) // Фильтрация локалей, исключая дефолтную
      .map(locale => locale.code) // Извлечение поля code из каждого объекта Locale
      .join('|') // Объединение всех code в строку, разделенную символом '|'

    const pagesDir = path.resolve(nuxt.options.rootDir, options.translationDir!, 'pages')

    extendPages((pages) => {
      const pagesNames = pages.map(page => page.name)

      const newRoutes = pages.map((page) => {
        options.locales!.forEach((locale) => {
          pages.forEach((page) => {
            const filePath = path.join(pagesDir, `${page.name}/${locale.code}.json`)
            const fileDir = path.dirname(filePath) // Get the directory of the file

            // Ensure the directory exists
            if (!existsSync(fileDir)) {
              mkdirSync(fileDir, { recursive: true }) // Create the directory if it doesn't exist
            }

            // Check if the file exists; if not, create it with an empty object
            if (!existsSync(filePath)) {
              writeFileSync(filePath, JSON.stringify({}), 'utf-8')
            }
          })
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

      nuxt.options.generate.routes = Array.isArray(nuxt.options.generate.routes) ? nuxt.options.generate.routes : []

      if (nuxt.options?._generate) {
        options.locales?.forEach((locale) => {
          pagesNames.forEach((name) => {
            addPrerenderRoutes(`/_locales/${name}/${locale.code}/data.json`)
          })
          addPrerenderRoutes(`/_locales/general/${locale.code}/data.json`)
        })
      }
    })

    nuxt.hook('nitro:config', (nitroConfig) => {
      const routes = nitroConfig.prerender?.routes || []

      nuxt.options.generate.routes = Array.isArray(nuxt.options.generate.routes) ? nuxt.options.generate.routes : []
      // Получаем все страницы приложения
      const pages = nuxt.options.generate.routes || []

      // Генерируем маршруты для всех локалей, кроме дефолтной
      options.locales!.forEach((locale) => {
        if (locale.code !== options.defaultLocale || options.includeDefaultLocaleRoute) {
          pages.forEach((page) => {
            routes.push(`/${locale.code}${page}`)
          })
        }
      })

      // Обновляем опцию routes в конфигурации Nitro
      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = routes
    })

    // Setup DevTools integration
    if (nuxt.options.dev) {
      setupDevToolsUI(options, resolver.resolve)
    }
  },
})

export interface ModuleHooks {
  'i18n:register': (
    registerModule: (translations: unknown, locale: string) => void
  ) => HookResult
}

declare module '@nuxt/schema' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface NuxtHooks extends ModuleHooks {}
}
