import path from 'node:path'
import {
  addComponentsDir,
  addImportsDir,
  addPlugin,
  addPrerenderRoutes,
  addServerHandler,
  createResolver,
  defineNuxtModule,
  extendPages,
  useLogger,
} from '@nuxt/kit'
import type { HookResult, NuxtPage } from '@nuxt/schema'
import { watch } from 'chokidar'
import { setupDevToolsUI } from './devtools'
import { PageManager } from './page-manager'
import type { ModuleOptions, ModuleOptionsExtend, ModulePrivateOptionsExtend } from './types'
import { LocaleManager } from './locale-manager'

declare module '@nuxt/schema' {
  interface ConfigSchema {
    i18nConfig?: ModulePrivateOptionsExtend
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
    autoDetectPath: '*',
    autoDetectLanguage: true,
    disablePageLocales: false,
    disableWatcher: false,
    includeDefaultLocaleRoute: false,
    fallbackLocale: undefined,
    localeCookie: 'user-locale',
    routesLocaleLinks: {},
    plural: (key, count, _locale, getTranslation) => {
      const translation = getTranslation(key, {})
      if (!translation) {
        return null
      }
      const forms = translation.toString().split('|')
      if (count === 0 && forms.length > 2) {
        return forms[0].trim() // Case for "no apples"
      }
      if (count === 1 && forms.length > 1) {
        return forms[1].trim() // Case for "one apple"
      }
      return (forms.length > 2 ? forms[2].trim() : forms[forms.length - 1].trim()).replace('{count}', count.toString())
    },
  },
  async setup(options, nuxt) {
    const isCloudflarePages = nuxt.options.nitro.preset === 'cloudflare_pages' || process.env.NITRO_PRESET === 'cloudflare-pages'
    const logger = useLogger('nuxt-i18n-micro')
    const resolver = createResolver(import.meta.url)

    const rootDirs = nuxt.options._layers.map(layer => layer.config.rootDir).reverse()

    const localeManager = new LocaleManager(options, rootDirs)
    const pageManager = new PageManager(localeManager.locales, options.defaultLocale!, options.includeDefaultLocaleRoute!)

    let plural = options.plural!
    if (typeof plural !== 'string') plural = plural.toString()

    nuxt.options.runtimeConfig.public.i18nConfig = {
      plural: plural,
      locales: localeManager.locales ?? [],
      meta: options.meta ?? true,
      metaBaseUrl: options.metaBaseUrl ?? undefined,
      define: options.define ?? true,
      disableWatcher: options.disableWatcher ?? false,
      defaultLocale: options.defaultLocale ?? 'en',
      translationDir: options.translationDir ?? 'locales',
      localeCookie: options.localeCookie ?? 'user-locale',
      autoDetectLanguage: options.autoDetectLanguage ?? true,
      autoDetectPath: options.autoDetectPath ?? '*',
      includeDefaultLocaleRoute: options.includeDefaultLocaleRoute ?? false,
      routesLocaleLinks: options.routesLocaleLinks ?? {},
      fallbackLocale: options.fallbackLocale ?? undefined,
      dateBuild: Date.now(),
      baseURL: nuxt.options.app.baseURL,
      hashMode: nuxt.options?.router?.options?.hashMode ?? false,
    }
    nuxt.options.runtimeConfig.i18nConfig = {
      rootDir: nuxt.options.rootDir,
      rootDirs: rootDirs,
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
        mode: 'server',
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

    extendPages((pages) => {
      const pagesNames = pages
        .map(page => page.name)
        .filter((name): name is string => name !== undefined && (!options.routesLocaleLinks || !options.routesLocaleLinks[name]))

      if (!options.disableWatcher) {
        localeManager.ensureTranslationFilesExist(pagesNames, options.translationDir!, nuxt.options.rootDir)
      }

      pageManager.extendPages(pages, nuxt.options.rootDir)

      nuxt.options.generate.routes = Array.isArray(nuxt.options.generate.routes) ? nuxt.options.generate.routes : []

      localeManager.locales.forEach((locale) => {
        if (!options.disablePageLocales) {
          pagesNames.forEach((name) => {
            addPrerenderRoutes(`/_locales/${name}/${locale.code}/data.json`)
          })
        }
        addPrerenderRoutes(`/_locales/general/${locale.code}/data.json`)
      })

      if (isCloudflarePages) {
        const processPageWithChildren = (page: NuxtPage, parentPath = '') => {
          if (!page.path) return // Пропускаем страницы без пути

          const fullPath = path.posix.normalize(`${parentPath}/${page.path}`) // Объединяем путь родителя и текущий путь

          // Проверяем наличие динамического сегмента :locale
          const localeSegmentMatch = fullPath.match(/:locale\(([^)]+)\)/)

          if (localeSegmentMatch) {
            const availableLocales = localeSegmentMatch[1].split('|') // Достаем локали из сегмента, например "de|ru|en"

            localeManager.locales.forEach((locale) => {
              const localeCode = locale.code

              // Проверяем, есть ли текущая локаль среди указанных в сегменте :locale(de|ru|en)
              if (availableLocales.includes(localeCode)) {
                let localizedPath = fullPath

                // Заменяем сегмент :locale(de|ru|en) на текущую локаль
                localizedPath = localizedPath.replace(/:locale\([^)]+\)/, localeCode)

                // Добавляем prerender для локализованного пути
                addPrerenderRoutes(localizedPath)
              }
            })
          }
          else {
            // Если в пути нет динамического сегмента локали, то просто добавляем его в prerender
            addPrerenderRoutes(fullPath)
          }

          // Рекурсивно обрабатываем детей, если они есть
          if (page.children && page.children.length) {
            page.children.forEach(childPage => processPageWithChildren(childPage, fullPath))
          }
        }

        // Пройдемся по страницам и добавим prerender для каждого пути с локалями
        pages.forEach((page) => {
          processPageWithChildren(page) // Обрабатываем каждую страницу рекурсивно
        })
      }
    })

    nuxt.hook('nitro:config', (nitroConfig) => {
      const routes = nitroConfig.prerender?.routes || []

      nuxt.options.generate.routes = Array.isArray(nuxt.options.generate.routes) ? nuxt.options.generate.routes : []
      const pages = nuxt.options.generate.routes || []

      localeManager.locales.forEach((locale) => {
        if (locale.code !== options.defaultLocale || options.includeDefaultLocaleRoute) {
          pages.forEach((page) => {
            routes.push(`/${locale.code}${page}`)
          })
        }
      })

      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = routes
    })

    nuxt.hook('nitro:build:before', async (_nitro) => {
      const isProd = nuxt.options.dev === false
      if (!isProd) {
        const translationPath = path.resolve(nuxt.options.rootDir, options.translationDir!)

        logger.log('ℹ add file watcher: ' + translationPath)

        const watcherEvent = async (path: string) => {
          watcher.close()
          logger.log('↻ update store item: ' + path)
          nuxt.callHook('restart')
        }

        const watcher = watch(translationPath, { depth: 1, persistent: true }).on('change', watcherEvent)

        nuxt.hook('close', () => {
          watcher.close()
        })
      }
    })

    nuxt.hook('prerender:routes', async (prerenderRoutes) => {
      const routesSet = prerenderRoutes.routes
      const additionalRoutes = new Set<string>()

      // Проходим по каждому существующему маршруту и добавляем локализованные версии, кроме дефолтной локали
      routesSet.forEach((route) => {
        localeManager.locales!.forEach((locale) => {
          if (locale.code !== options.defaultLocale) {
            if (route === '/') {
              additionalRoutes.add(`/${locale.code}`)
            }
            else {
              additionalRoutes.add(`/${locale.code}${route}`)
            }
          }
        })
      })

      // Добавляем новые локализованные маршруты к существующим
      additionalRoutes.forEach(route => routesSet.add(route))
    })

    // Setup DevTools integration
    if (nuxt.options.dev) {
      setupDevToolsUI(options, resolver.resolve)
    }
  },
})

export interface ModuleHooks {
  'i18n:register': (
    registerModule: (translations: unknown, locale?: string) => void,
    locale: string
  ) => HookResult
}

declare module '@nuxt/schema' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface NuxtHooks extends ModuleHooks {}
}
