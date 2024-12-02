import path from 'node:path'
import fs from 'node:fs'
import {
  addComponentsDir,
  addImportsDir,
  addPlugin,
  addPrerenderRoutes,
  addServerHandler, addTemplate, addTypeTemplate,
  createResolver,
  defineNuxtModule,
  extendPages,
  useLogger,
} from '@nuxt/kit'
import type { HookResult, NuxtPage } from '@nuxt/schema'
import { watch } from 'chokidar'
import { setupDevToolsUI } from './devtools'
import { PageManager } from './page-manager'
import type { ModuleOptions, ModuleOptionsExtend, ModulePrivateOptionsExtend, Locale, PluralFunc, GlobalLocaleRoutes, Getter, LocaleCode } from './types'
import type { PluginsInjections } from './runtime/plugins/01.plugin'
import { LocaleManager } from './locale-manager'

function generateI18nTypes() {
  return `
import type {PluginsInjections} from "nuxt-i18n-micro";

declare module 'vue/types/vue' {
  interface Vue extends PluginsInjections { }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions extends PluginsInjections { }
  interface Context extends PluginsInjections { }
}

declare module '#app' {
  interface NuxtApp extends PluginsInjections { }
}

export {}`
}

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
    debug: false,
    define: true,
    types: true,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectPath: '/',
    autoDetectLanguage: true,
    disablePageLocales: false,
    disableWatcher: false,
    includeDefaultLocaleRoute: false,
    fallbackLocale: undefined,
    localeCookie: 'user-locale',
    apiBaseUrl: '_locales',
    routesLocaleLinks: {},
    globalLocaleRoutes: {},
    plural: (key, count, params, _locale, getTranslation) => {
      const translation = getTranslation(key, params)
      if (!translation) {
        return null
      }
      const forms = translation.toString().split('|')
      return (count < forms.length ? forms[count].trim() : forms[forms.length - 1].trim()).replace('{count}', count.toString())
    },
    customRegexMatcher: undefined,
  },
  async setup(options, nuxt) {
    const isSSG = nuxt.options._generate
    const isCloudflarePages = nuxt.options.nitro.preset === 'cloudflare_pages' || process.env.NITRO_PRESET === 'cloudflare-pages'
    if (isCloudflarePages && !options.includeDefaultLocaleRoute) {
      throw new Error('Nuxt-i18n-micro: "includeDefaultLocaleRoute" must be set to true when using Cloudflare Pages.')
    }

    const logger = useLogger('nuxt-i18n-micro')

    try {
      const storagePahh = path.join(nuxt.options.rootDir, './server/assets')
      fs.rmdirSync(storagePahh)
      logger.log(`Cleanup storage: ${storagePahh}`)
    }
    catch { /* empty */ }

    const resolver = createResolver(import.meta.url)
    const rootDirs = nuxt.options._layers.map(layer => layer.config.rootDir).reverse()

    const localeManager = new LocaleManager(options, rootDirs)
    const pageManager = new PageManager(localeManager.locales, options.defaultLocale!, options.includeDefaultLocaleRoute!, options.globalLocaleRoutes)

    addTemplate({
      filename: 'i18n.plural.mjs',
      write: true,
      getContents: () => `export const plural = ${options.plural!.toString()};`,
    })

    const apiBaseUrl = (process.env.NUXT_I18N_APP_BASE_URL ?? options.apiBaseUrl ?? '_locales').replace(/^\/+|\/+$|\/{2,}/, '')

    nuxt.options.runtimeConfig.public.i18nConfig = {
      plural: undefined,
      locales: localeManager.locales ?? [],
      meta: options.meta ?? true,
      metaBaseUrl: options.metaBaseUrl ?? undefined,
      define: options.define ?? true,
      disableWatcher: options.disableWatcher ?? false,
      defaultLocale: options.defaultLocale ?? 'en',
      translationDir: options.translationDir ?? 'locales',
      localeCookie: options.localeCookie ?? 'user-locale',
      autoDetectLanguage: options.autoDetectLanguage ?? true,
      autoDetectPath: options.autoDetectPath ?? '/',
      includeDefaultLocaleRoute: options.includeDefaultLocaleRoute ?? false,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      routesLocaleLinks: options.routesLocaleLinks ?? {},
      fallbackLocale: options.fallbackLocale ?? undefined,
      dateBuild: Date.now(),
      hashMode: nuxt.options?.router?.options?.hashMode ?? false,
      globalLocaleRoutes: undefined,
      apiBaseUrl: apiBaseUrl,
      isSSG: isSSG,
      customRegexMatcher: options.customRegexMatcher,
    }

    // if there is a customRegexMatcher set and all locales don't match the custom matcher, throw error
    if (typeof options.customRegexMatcher !== 'undefined') {
      const localeCodes = localeManager.locales.map(l => l.code)
      if (!localeCodes.every(code => code.match(options.customRegexMatcher as string | RegExp))) {
        throw new Error('Nuxt-18n-micro: Some locale codes does not match customRegexMatcher')
      }
    }
    nuxt.options.runtimeConfig.i18nConfig = {
      rootDir: nuxt.options.rootDir,
      rootDirs: rootDirs,
      debug: options.debug ?? false,
    }

    addPlugin({
      src: resolver.resolve('./runtime/plugins/01.plugin'),
      name: 'i18n-plugin-loader',
      order: 1,
    })

    if (options.meta) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/02.meta'),
        name: 'i18n-plugin-meta',
        order: 2,
      })
    }

    if (options.define) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/03.define'),
        name: 'i18n-plugin-define',
        order: 3,
      })
    }

    if (options.autoDetectLanguage) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/04.auto-detect'),
        mode: 'server',
        name: 'i18n-plugin-auto-detect',
        order: 4,
      })
    }

    addImportsDir(resolver.resolve('./runtime/composables'))

    addServerHandler({
      route: `/${apiBaseUrl}/:page/:locale/data.json`,
      handler: resolver.resolve('./runtime/server/middleware/i18n-loader'),
    })

    await addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      pathPrefix: false,
      extensions: ['vue'],
    })

    if (options.types) {
      addTypeTemplate({
        filename: 'types/i18n-plugin.d.ts',
        getContents: () => generateI18nTypes(),
      })
    }

    extendPages((pages) => {
      const pagesNames = pages
        .map(page => page.name)
        .filter((name): name is string => name !== undefined && (!options.routesLocaleLinks || !options.routesLocaleLinks[name]))

      if (!options.disableWatcher) {
        localeManager.ensureTranslationFilesExist(pagesNames, options.translationDir!, nuxt.options.rootDir)
      }

      pageManager.extendPages(pages, nuxt.options.rootDir, options.customRegexMatcher, isCloudflarePages)

      if (options.includeDefaultLocaleRoute && !isCloudflarePages) {
        const fallbackRoute: NuxtPage = {
          path: '/:pathMatch(.*)*',
          name: 'custom-fallback-route',
          file: resolver.resolve('./runtime/components/locale-redirect.vue'),
          meta: {
            globalLocaleRoutes: options.globalLocaleRoutes,
          },
        }
        pages.push(fallbackRoute)
      }

      nuxt.options.generate.routes = Array.isArray(nuxt.options.generate.routes) ? nuxt.options.generate.routes : []

      const prerenderRoutes: string[] = []

      localeManager.locales.forEach((locale) => {
        if (!options.disablePageLocales) {
          pagesNames.forEach((name) => {
            prerenderRoutes.push(`/${apiBaseUrl}/${name}/${locale.code}/data.json`)
          })
        }
        prerenderRoutes.push(`/${apiBaseUrl}/general/${locale.code}/data.json`)
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

                // Добавляем локализованный путь в массив
                prerenderRoutes.push(localizedPath)
              }
            })
          }
          else {
            // Если в пути нет динамического сегмента локали, то просто добавляем его в массив
            prerenderRoutes.push(fullPath)
          }

          // Рекурсивно обрабатываем детей, если они есть
          if (page.children && page.children.length) {
            page.children.forEach(childPage => processPageWithChildren(childPage, fullPath))
          }
        }

        // Пройдемся по страницам и добавим пути для каждого локализованного пути
        pages.forEach((page) => {
          processPageWithChildren(page) // Обрабатываем каждую страницу рекурсивно
        })
      }

      addPrerenderRoutes(prerenderRoutes)
    })

    nuxt.hook('nitro:config', (nitroConfig) => {
      if (nitroConfig.imports) {
        nitroConfig.imports.presets = nitroConfig.imports.presets || []
        nitroConfig.imports.presets.push({
          from: resolver.resolve('./runtime/translation-server-middleware'),
          imports: ['useTranslationServerMiddleware'],
        })
      }

      const routes = nitroConfig.prerender?.routes || []

      nuxt.options.generate.routes = Array.isArray(nuxt.options.generate.routes) ? nuxt.options.generate.routes : []
      const pages = nuxt.options.generate.routes || []

      localeManager.locales.forEach((locale) => {
        if (locale.code !== options.defaultLocale || options.includeDefaultLocaleRoute) {
          pages.forEach((page) => {
            if (!/\.[a-z0-9]+$/i.test(page)) {
              routes.push(`/${locale.code}${page}`)
            }
          })
        }
      })

      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = routes
    })

    nuxt.hook('nitro:build:public-assets', (nitro) => {
      const isProd = nuxt.options.dev === false
      if (isProd) {
        const publicDir = path.join((nitro.options.output.publicDir ?? './dist'), options.translationDir ?? 'locales')
        const translationDir = path.join(nuxt.options.rootDir, options.translationDir ?? 'locales')

        try {
          fs.cpSync(translationDir, publicDir, { recursive: true })
          logger.log(`Translations copied successfully to ${translationDir} directory`)
        }
        catch (err) {
          logger.error('Error copying translations:', err)
        }
      }
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

        const watcher = watch(translationPath, { depth: 2, persistent: true }).on('change', watcherEvent)

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
        if (!/\.[a-z0-9]+$/i.test(route)) {
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
        }
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

export type { Locale, PluralFunc, ModuleOptions, GlobalLocaleRoutes, Getter, LocaleCode, PluginsInjections }
