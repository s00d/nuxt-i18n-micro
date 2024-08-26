import path from 'node:path'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import {
  addComponentsDir,
  addImportsDir,
  addPlugin,
  addPrerenderRoutes,
  addServerHandler,
  createResolver,
  defineNuxtModule,
  extendPages,
} from '@nuxt/kit'
import type { HookResult, NuxtPage } from '@nuxt/schema'
import { watch } from 'chokidar'
import { setupDevToolsUI } from './devtools'

export interface Locale {
  code: string
  disabled?: boolean
  iso?: string
  dir?: 'ltr' | 'rtl' | 'auto'
}

// Module options TypeScript interface definition
export interface ModuleOptions {
  locales?: Locale[]
  meta?: boolean
  metaBaseUrl?: string
  define?: boolean
  defaultLocale?: string
  translationDir?: string
  autoDetectLanguage?: boolean
  includeDefaultLocaleRoute?: boolean
  routesLocaleLinks?: Record<string, string>
  plural?: string
}

export interface ModuleOptionsExtend extends ModuleOptions {
  rootDir: string
  pluralString: string
  rootDirs: string[]
  dateBuild: number
  baseURL: string
}

declare module '@nuxt/schema' {
  interface ConfigSchema {
    publicRuntimeConfig?: {
      i18nConfig?: ModuleOptionsExtend
    }
  }
  interface NuxtConfig {
    i18nConfig?: ModuleOptionsExtend
  }
  interface NuxtOptions {
    i18nConfig?: ModuleOptionsExtend
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
    meta: true,
    define: true,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: true,
    includeDefaultLocaleRoute: false,
    routesLocaleLinks: {},
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
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    const rootDirs = nuxt.options._layers.map(layer => layer.config.rootDir).reverse()

    const locales = (options.locales ?? [])
      .reduce((acc, locale) => {
        const existingLocale = acc.find(l => l.code === locale.code)
        if (existingLocale) {
          // Объединяем свойства объекта
          Object.assign(existingLocale, locale)
        }
        else {
          acc.push(locale)
        }
        return acc
      }, [] as Locale[])
      .filter(locale => !locale.disabled)

    nuxt.options.runtimeConfig.public.i18nConfig = {
      rootDir: nuxt.options.rootDir,
      rootDirs: rootDirs,
      plural: options.plural!,
      locales: locales ?? [],
      meta: options.meta ?? true,
      metaBaseUrl: options.metaBaseUrl ?? undefined,
      define: options.define ?? true,
      defaultLocale: options.defaultLocale ?? 'en',
      translationDir: options.translationDir ?? 'locales',
      autoDetectLanguage: options.autoDetectLanguage ?? true,
      includeDefaultLocaleRoute: options.includeDefaultLocaleRoute ?? false,
      routesLocaleLinks: options.routesLocaleLinks ?? {},
      dateBuild: Date.now(),
      baseURL: nuxt.options.app.baseURL,
    }

    addPlugin({
      src: resolver.resolve('./runtime/plugins/01.plugin'),
      order: 1,
    })

    if (options.meta) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/02.meta'),
        order: 2,
      })
    }

    if (options.define) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/03.define'),
        order: 3,
      })
    }

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

    await addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      pathPrefix: false,
      extensions: ['vue'],
    })

    const localeRegex = locales
      .filter(locale => locale.code !== options.defaultLocale || options.includeDefaultLocaleRoute) // Фильтрация локалей, исключая дефолтную
      .map(locale => locale.code) // Извлечение поля code из каждого объекта Locale
      .join('|') // Объединение всех code в строку, разделенную символом '|'

    const pagesDir = path.resolve(nuxt.options.rootDir, options.translationDir!, 'pages')

    extendPages((pages) => {
      const pagesNames = pages
        .map(page => page.name)
        .filter(name => name && (!options.routesLocaleLinks || !options.routesLocaleLinks[name]))

      function ensureFileExists(filePath: string) {
        const fileDir = path.dirname(filePath) // Get the directory of the file

        // Ensure the directory exists
        if (!existsSync(fileDir)) {
          mkdirSync(fileDir, { recursive: true }) // Create the directory if it doesn't exist
        }

        // Check if the file exists; if not, create it with an empty object
        if (!existsSync(filePath)) {
          writeFileSync(filePath, JSON.stringify({}), 'utf-8')
        }
      }

      locales.forEach((locale) => {
        // Process global translation files
        const globalFilePath = path.join(nuxt.options.rootDir, options.translationDir!, `${locale.code}.json`)
        ensureFileExists(globalFilePath)

        // Process page-specific translation files
        pagesNames.forEach((name) => {
          const pageFilePath = path.join(pagesDir, `${name}/${locale.code}.json`)
          ensureFileExists(pageFilePath)
        })
      })

      const newRoutes: NuxtPage[] = []
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]

        if (page.redirect && !page.file) {
          continue
        }

        const newRoute = {
          file: page.file,
          meta: { ...page.meta },
          alias: page.alias,
          redirect: page.redirect,
          children: page.children,
          mode: page.mode,
          path: `/:locale(${localeRegex})${page.path}`,
          name: `localized-${page.name}`,
        }

        newRoutes.push(newRoute)
      }

      pages.push(...newRoutes)

      nuxt.options.generate.routes = Array.isArray(nuxt.options.generate.routes) ? nuxt.options.generate.routes : []

      locales.forEach((locale) => {
        pagesNames.forEach((name) => {
          addPrerenderRoutes(`/_locales/${name}/${locale.code}/data.json`)
        })
        addPrerenderRoutes(`/_locales/general/${locale.code}/data.json`)
      })
    })

    nuxt.hook('nitro:config', (nitroConfig) => {
      const routes = nitroConfig.prerender?.routes || []

      nuxt.options.generate.routes = Array.isArray(nuxt.options.generate.routes) ? nuxt.options.generate.routes : []
      // Получаем все страницы приложения
      const pages = nuxt.options.generate.routes || []

      // Генерируем маршруты для всех локалей, кроме дефолтной
      locales.forEach((locale) => {
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

    nuxt.hook('nitro:build:before', async (_nitro) => {
      const isProd = nuxt.options.dev === false
      if (!isProd) {
        const translationPath = path.resolve(nuxt.options.rootDir, options.translationDir!)

        console.log('ℹ add file watcher', translationPath)

        const watcherEvent = async (path: string) => {
          watcher.close()
          console.log('↻ update store item', path)
          nuxt.callHook('restart')
        }

        const watcher = watch(translationPath, { depth: 1, persistent: true }).on('change', watcherEvent)

        nuxt.hook('close', () => {
          watcher.close()
        })
      }
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
