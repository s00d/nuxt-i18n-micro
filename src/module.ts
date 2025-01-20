import path from 'node:path'
import fs from 'node:fs'
import { readFile } from 'node:fs/promises'
import {
  addComponentsDir,
  addImportsDir,
  addPlugin,
  addPrerenderRoutes,
  addServerHandler,
  addTemplate,
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
  extendPages,
  useLogger,
} from '@nuxt/kit'
import type { HookResult, NuxtPage } from '@nuxt/schema'
import { watch } from 'chokidar'
import { globby } from 'globby'
import type { Translation, Translations, ModuleOptions, ModuleOptionsExtend, ModulePrivateOptionsExtend, Locale, PluralFunc, GlobalLocaleRoutes, Getter, LocaleCode, Strategies } from 'nuxt-i18n-micro-types'
import {
  isNoPrefixStrategy,
  isPrefixStrategy,
  withPrefixStrategy,
} from 'nuxt-i18n-micro-core'
import { setupDevToolsUI } from './devtools'
import { PageManager } from './page-manager'
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

function deepMerge<T extends object | unknown>(target: T, source: T): T {
  if (typeof source !== 'object' || source === null) {
    // If source is not an object, return target if it already exists, otherwise overwrite with source
    return target === undefined ? source : target
  }

  if (Array.isArray(target)) {
    // If source is an array, overwrite target with source
    return target as T
  }

  if (source instanceof Object) {
    // Ensure target is an object to merge into
    if (!(target instanceof Object) || Array.isArray(target)) {
      target = {} as T
    }

    for (const key in source) {
      if (key === '__proto__' || key === 'constructor') continue

      // Type guard to ensure that key exists on target and is of type object
      if (target !== null && typeof (target as Record<string, unknown>)[key] === 'object'
        && (target as Record<string, unknown>)[key] !== null) {
        // If target has a key that is an object, merge recursively
        (target as Record<string, unknown>)[key] = deepMerge(
          (target as Record<string, unknown>)[key],
          (source as Record<string, unknown>)[key],
        )
      }
      else {
        // If the key doesn't exist in target, or it's not an object, overwrite with source value
        if (target instanceof Object && !(key in target)) {
          (target as Record<string, unknown>)[key] = (source as Record<string, unknown>)[key]
        }
      }
    }
  }

  return target
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
    plugin: true,
    types: true,
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    translationDir: 'locales',
    autoDetectPath: '/',
    autoDetectLanguage: true,
    disablePageLocales: false,
    disableWatcher: false,
    disableUpdater: false,
    includeDefaultLocaleRoute: undefined,
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
    const defaultLocale = process.env.DEFAULT_LOCALE ?? options.defaultLocale ?? 'en'

    const isSSG = nuxt.options._generate
    const isCloudflarePages = nuxt.options.nitro.preset?.startsWith('cloudflare')
    const isVercelPages = nuxt.options.nitro.preset?.startsWith('vercel')

    const logger = useLogger('nuxt-i18n-micro')

    if (options.includeDefaultLocaleRoute !== undefined) {
      logger.debug('The \'includeDefaultLocaleRoute\' option is deprecated. Use \'strategy\' instead.')
      if (options.includeDefaultLocaleRoute) {
        options.strategy = 'prefix'
      }
      else {
        options.strategy = 'prefix_except_default'
      }
    }

    const resolver = createResolver(import.meta.url)
    const rootDirs = nuxt.options._layers.map(layer => layer.config.rootDir).reverse()

    const localeManager = new LocaleManager(options, rootDirs)
    const pageManager = new PageManager(localeManager.locales, defaultLocale, options.strategy!, options.globalLocaleRoutes)

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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      metaBaseUrl: options.metaBaseUrl ?? undefined,
      define: options.define ?? true,
      disableWatcher: options.disableWatcher ?? false,
      disableUpdater: options.disableUpdater ?? false,
      defaultLocale: defaultLocale,
      translationDir: options.translationDir ?? 'locales',
      localeCookie: options.localeCookie ?? 'user-locale',
      autoDetectLanguage: options.autoDetectLanguage ?? true,
      autoDetectPath: options.autoDetectPath ?? '/',
      strategy: options.strategy ?? 'no_prefix',
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
      disablePageLocales: options.disablePageLocales ?? false,
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

    addImportsDir(resolver.resolve('./runtime/composables'))

    if (process.env && process.env.TEST) {
      return
    }
    if (options.plugin) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/01.plugin'),
        name: 'i18n-plugin-loader',
        order: 1,
      })
    }

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
        mode: 'all',
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

    addServerHandler({
      route: `/${apiBaseUrl}/:page/:locale/data.json`,
      handler: resolver.resolve('./runtime/server/routes/get'),
    })
    // addServerHandler({
    //   route: `/${apiBaseUrl}/:page/:locale/data.json`,
    //   handler: resolver.resolve('./runtime/server/middleware/i18n-loader'),
    // })

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
      const prerenderRoutes: string[] = []

      const pagesNames = pages
        .map(page => page.name)
        .filter((name): name is string => name !== undefined && (!options.routesLocaleLinks || !options.routesLocaleLinks[name]))

      localeManager.locales.forEach((locale) => {
        if (!options.disablePageLocales) {
          pagesNames.forEach((name) => {
            prerenderRoutes.push(`/${apiBaseUrl}/${name}/${locale.code}/data.json`)
          })
        }
        prerenderRoutes.push(`/${apiBaseUrl}/general/${locale.code}/data.json`)
      })

      if (!options.disableWatcher) {
        localeManager.ensureTranslationFilesExist(pagesNames, options.translationDir!, nuxt.options.rootDir)
      }

      pageManager.extendPages(pages, options.customRegexMatcher, isCloudflarePages)

      if (isPrefixStrategy(options.strategy!) && !isCloudflarePages) {
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
      if (!isNoPrefixStrategy(options.strategy!)) {
        nuxt.options.generate.routes = Array.isArray(nuxt.options.generate.routes) ? nuxt.options.generate.routes : []

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
      }

      addPrerenderRoutes(prerenderRoutes)
    })

    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.bundledStorage = nitroConfig.bundledStorage || []
      nitroConfig.bundledStorage.push('i18n-locales')

      nitroConfig.storage = nitroConfig.storage || {}
      nitroConfig.storage['i18n-locales'] = {
        driver: isVercelPages ? 'vercelKV' : 'fs',
        base: path.join(nuxt.options.rootDir, 'server/assets/i18n-locales'),
      }

      if (nitroConfig.imports) {
        nitroConfig.imports.presets = nitroConfig.imports.presets || []
        nitroConfig.imports.presets.push({
          from: resolver.resolve('./runtime/translation-server-middleware'),
          imports: ['useTranslationServerMiddleware'],
        })
      }

      if (isNoPrefixStrategy(options.strategy!)) {
        return
      }

      const routes = nitroConfig.prerender?.routes || []

      nuxt.options.generate.routes = Array.isArray(nuxt.options.generate.routes) ? nuxt.options.generate.routes : []
      const pages = nuxt.options.generate.routes || []

      localeManager.locales.forEach((locale) => {
        if (locale.code !== defaultLocale || withPrefixStrategy(options.strategy!)) {
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

    nuxt.hook('nitro:init', async (nitro) => {
      logger.debug('[nuxt-i18n-micro] clear storage cache')
      await nitro.storage.clear('i18n-locales')
      if (!await nitro.storage.hasItem(`i18n-locales:.gitignore`)) {
        // await nitro.storage.setItem(`${output}:.gitignore`, '*')
        const dir = path.join(nuxt.options.rootDir, 'server/assets/i18n-locales')
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(`${dir}/.gitignore`, '*')
      }

      const translationDir = options.translationDir ?? ''
      const fallbackLocale = options.fallbackLocale ?? null
      const translationsByLocale: Record<string, Translations> = {}

      try {
        for (const rootDir of rootDirs) {
          const baseDir = path.resolve(rootDir, translationDir)
          const files = await globby('**/*.json', { cwd: baseDir })

          const promises = files.map(async (file) => {
            const filePath = path.join(baseDir, file)
            const content = await readFile(filePath, 'utf-8')
            const data = JSON.parse(content) as Translations

            const parts = file.split('/')
            const locale = parts.pop()?.replace('.json', '') || ''
            const pageKey = parts.pop() || 'general'

            if (!translationsByLocale[locale]) {
              translationsByLocale[locale] = {}
            }

            translationsByLocale[locale] = deepMerge<Translations>({
              [pageKey]: data,
            }, translationsByLocale[locale])
          })

          await Promise.all(promises)
        }

        const savePromises: Promise<void>[] = []

        for (const [locale, translations] of Object.entries(translationsByLocale)) {
          for (const [key, value] of Object.entries(translations)) {
            const storageKey = `i18n-locales:${locale}:${key}`
            const promise = (async () => {
              let translation: Translation = value
              if (fallbackLocale) {
                translation = deepMerge<Translation>(
                  translation,
                  translationsByLocale[fallbackLocale][key] ?? {},
                )
              }
              if (typeof translation === 'object' && translation !== null) {
                await nitro.storage.setItem(storageKey, translation)
                if (options.debug) {
                  logger.log(`[nuxt-i18n-micro] Translation saved to Nitro storage with key: ${storageKey}`)
                }
              }
            })()

            savePromises.push(promise)
          }
        }
        await Promise.all(savePromises)
      }
      catch (err) {
        logger.error('[nuxt-i18n-micro] Error processing translations:', err)
      }
    })

    if (!options.disableUpdater) {
      nuxt.hook('nitro:build:before', async (_nitro) => {
        const isProd = nuxt.options.dev === false
        if (!isProd) {
          const translationPath = path.resolve(nuxt.options.rootDir, options.translationDir!)

          logger.log('ℹ add file watcher: ' + translationPath)

          const watcherEvent = async (path: string) => {
            await watcher.close()
            logger.log('↻ update store item: ' + path)
            nuxt.callHook('restart')
          }

          const watcher = watch(translationPath, { depth: 2, persistent: true }).on('change', watcherEvent)

          nuxt.hook('close', () => {
            watcher.close()
          })
        }
      })
    }

    nuxt.hook('prerender:routes', async (prerenderRoutes) => {
      if (isNoPrefixStrategy(options.strategy!)) {
        return
      }
      const routesSet = prerenderRoutes.routes
      const additionalRoutes = new Set<string>()

      // Проходим по каждому существующему маршруту и добавляем локализованные версии, кроме дефолтной локали
      routesSet.forEach((route) => {
        if (!/\.[a-z0-9]+$/i.test(route)) {
          localeManager.locales!.forEach((locale) => {
            if (locale.code !== defaultLocale) {
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

export type { Locale, PluralFunc, ModuleOptions, GlobalLocaleRoutes, Getter, LocaleCode, PluginsInjections, Strategies }
