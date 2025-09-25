import path from 'node:path'
import fs from 'node:fs'
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
  useLogger,
} from '@nuxt/kit'
import type { HookResult, NuxtPage } from '@nuxt/schema'
import { watch } from 'chokidar'
import type { ModuleOptions, ModuleOptionsExtend, ModulePrivateOptionsExtend, Locale, PluralFunc, GlobalLocaleRoutes, Getter, LocaleCode, Strategies } from 'nuxt-i18n-micro-types'
import {
  isNoPrefixStrategy,
  isPrefixStrategy,
  withPrefixStrategy,
  isPrefixExceptDefaultStrategy,
  isPrefixAndDefaultStrategy,
} from 'nuxt-i18n-micro-core'
import { setupDevToolsUI } from './devtools'
import { PageManager } from './page-manager'
import type { PluginsInjections } from './runtime/plugins/01.plugin'
import { LocaleManager } from './locale-manager'
import { isInternalPath } from './utils'

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
    redirects: true,
    plugin: true,
    hooks: true,
    types: true,
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    translationDir: 'locales',
    autoDetectPath: '/',
    autoDetectLanguage: true,
    disablePageLocales: false,
    disableWatcher: false,
    disableUpdater: false,
    noPrefixRedirect: false,
    includeDefaultLocaleRoute: undefined,
    fallbackLocale: undefined,
    localeCookie: 'user-locale',
    apiBaseUrl: '_locales',
    routesLocaleLinks: {},
    globalLocaleRoutes: {},
    canonicalQueryWhitelist: ['page', 'sort', 'filter', 'search', 'q', 'query', 'tag'],
    plural: (key, count, params, _locale, getTranslation) => {
      const translation = getTranslation(key, params)
      if (!translation) {
        return null
      }
      const forms = translation.toString().split('|')
      if (forms.length === 0) return null
      const selectedForm = count < forms.length ? forms[count] : forms[forms.length - 1]
      if (!selectedForm) return null
      return selectedForm.trim().replace('{count}', count.toString())
    },
    customRegexMatcher: undefined,
    excludePatterns: undefined,
  },
  async setup(options, nuxt) {
    const defaultLocale = process.env.DEFAULT_LOCALE ?? options.defaultLocale ?? 'en'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isSSG = nuxt.options.nitro.static ?? (nuxt.options as any)._generate ?? false /* TODO: remove in future */
    const isCloudflarePages = nuxt.options.nitro.preset?.startsWith('cloudflare')

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
    const pageManager = new PageManager(localeManager.locales, defaultLocale, options.strategy!, options.globalLocaleRoutes, options.noPrefixRedirect!, options.excludePatterns)

    addTemplate({
      filename: 'i18n.plural.mjs',
      write: true,
      getContents: () => `export const plural = ${options.plural!.toString()};`,
    })

    const apiBaseUrl = (process.env.NUXT_I18N_APP_BASE_URL ?? options.apiBaseUrl ?? '_locales').replace(/^\/+|\/+$|\/{2,}/, '')

    nuxt.options.runtimeConfig.public.i18nConfig = {
      locales: localeManager.locales ?? [],
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      metaBaseUrl: options.metaBaseUrl ?? undefined,
      defaultLocale: defaultLocale,
      localeCookie: options.localeCookie ?? 'user-locale',
      autoDetectPath: options.autoDetectPath ?? '/',
      strategy: options.strategy ?? 'prefix_except_default',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      routesLocaleLinks: options.routesLocaleLinks ?? {},
      dateBuild: Date.now(),
      hashMode: nuxt.options?.router?.options?.hashMode ?? false,
      apiBaseUrl: apiBaseUrl,
      isSSG: isSSG,
      disablePageLocales: options.disablePageLocales ?? false,
      canonicalQueryWhitelist: options.canonicalQueryWhitelist ?? [],
      excludePatterns: options.excludePatterns ?? [],
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      fallbackLocale: options.fallbackLocale ?? undefined,
      translationDir: options.translationDir ?? 'locales',
      customRegexMatcher: options.customRegexMatcher,
    }

    addImportsDir(resolver.resolve('./runtime/composables'))

    if (process.env && process.env.TEST) {
      return
    }
    if (options.plugin) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/01.plugin'),
        name: 'i18n-plugin-loader',
        order: -5,
      })
    }

    if (options.hooks) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/05.hooks'),
        name: 'i18n-plugin-hooks',
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

    if (options.redirects) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/06.redirect'),
        name: 'i18n-plugin-redirect',
        mode: 'all',
        order: 6,
      })
    }

    addServerHandler({
      route: `/${apiBaseUrl}/:page/:locale/data.json`,
      handler: resolver.resolve('./runtime/server/routes/get'),
    })

    addComponentsDir({
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

    nuxt.hook('pages:resolved', (pages) => {
      const prerenderRoutes: string[] = []
      const routeRules = nuxt.options.routeRules || {}

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
        if (isCloudflarePages) {
          const processPageWithChildren = (page: NuxtPage, parentPath = '') => {
            if (!page.path) return // Skip pages without path

            const fullPath = path.posix.normalize(`${parentPath}/${page.path}`) // Combine parent path and current path

            // Skip internal paths
            if (isInternalPath(fullPath, options.excludePatterns)) {
              return
            }

            // Check if there's a rule for this route and whether it should be prerendered
            const routeRule = routeRules[fullPath]
            if (routeRule && routeRule.prerender === false) {
              // If the route is explicitly disabled for prerendering, skip it
              return
            }

            // Check for dynamic :locale segment
            const localeSegmentMatch = fullPath.match(/:locale\(([^)]+)\)/)

            if (localeSegmentMatch && localeSegmentMatch[1]) {
              const availableLocales = localeSegmentMatch[1].split('|') // Extract locales from segment, e.g. "de|ru|en"
              localeManager.locales.forEach((locale) => {
                const localeCode = locale.code

                // Check if current locale is among those specified in :locale(de|ru|en) segment
                if (availableLocales.includes(localeCode)) {
                  let localizedPath = fullPath

                  // Replace :locale(de|ru|en) segment with current locale
                  localizedPath = localizedPath.replace(/:locale\([^)]+\)/, localeCode)

                  // Check if there's a rule for the localized route and whether it should be prerendered
                  const localizedRouteRule = routeRules[localizedPath]
                  if (localizedRouteRule && localizedRouteRule.prerender === false) {
                    // If the localized route is explicitly disabled for prerendering, skip it
                    return
                  }

                  // Add localized path to array
                  if (!isInternalPath(localizedPath, options.excludePatterns)) {
                    prerenderRoutes.push(localizedPath)
                  }
                }
              })
            }
            else {
              // If there's no dynamic locale segment in the path, just add it to the array
              if (!isInternalPath(fullPath, options.excludePatterns)) {
                prerenderRoutes.push(fullPath)
              }
            }

            // Recursively process children if they exist
            if (page.children && page.children.length) {
              page.children.forEach(childPage => processPageWithChildren(childPage, fullPath))
            }
          }

          // Process pages and add paths for each localized path
          pages.forEach((page: NuxtPage) => {
            processPageWithChildren(page) // Process each page recursively
          })
        }
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
        nitroConfig.imports.presets.push({
          from: resolver.resolve('./runtime/locale-server-middleware'),
          imports: ['useLocaleServerMiddleware'],
        })
      }

      const routeRules = nuxt.options.routeRules || {}

      const strategy = options.strategy! as Strategies

      if (routeRules && Object.keys(routeRules).length && !isNoPrefixStrategy(strategy)) {
        // Ensure nitroConfig has space for new rules
        nitroConfig.routeRules = nitroConfig.routeRules || {}

        for (const [originalPath, ruleValue] of Object.entries(routeRules)) {
          // Skip /api
          if (originalPath.startsWith('/api')) {
            continue
          }

          // "Multiply" rules across all locales
          localeManager.locales.forEach((localeObj) => {
            const localeCode = localeObj.code
            const isDefaultLocale = (localeCode === defaultLocale)

            // For "prefix_except_default" and "prefix_and_default" strategies
            // skip default locale so /client remains without prefix
            const skip = (isPrefixExceptDefaultStrategy(strategy) || isPrefixAndDefaultStrategy(strategy)) && isDefaultLocale
            if (skip) {
              return
            }

            // Form localized path, e.g. '/fr/client'
            // If originalPath === '/', then suffix === ''
            const suffix = (originalPath === '/') ? '' : originalPath
            const localizedPath = `/${localeCode}${suffix}`

            // Extract redirect to avoid carrying it to localized routes
            const { redirect, ...restRuleValue } = ruleValue

            if (!Object.keys(restRuleValue).length) {
              return
            }

            // If doesn't exist — initialize
            nitroConfig.routeRules = nitroConfig.routeRules || {}

            // Assign all fields except redirect
            nitroConfig.routeRules[localizedPath] = {
              ...nitroConfig.routeRules[localizedPath],
              ...restRuleValue,
            }

            logger.debug(`Replicated routeRule for ${localizedPath}: ${JSON.stringify(restRuleValue)}`)
          })
        }
      }

      if (isNoPrefixStrategy(options.strategy!)) {
        return
      }

      const routes = nitroConfig.prerender?.routes || []

      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = Array.isArray(nitroConfig.prerender.routes) ? nitroConfig.prerender.routes : []
      const pages = nitroConfig.prerender.routes || []

      localeManager.locales.forEach((locale) => {
        // For prefix and prefix_and_default strategies generate routes for defaultLocale too
        // For prefix_except_default strategy skip defaultLocale
        const shouldGenerate = locale.code !== defaultLocale || withPrefixStrategy(options.strategy!)
        if (shouldGenerate) {
          pages.forEach((page) => {
            // Skip undefined values, file-like paths and service segments `__*`
            if (page && !/\.[a-z0-9]+$/i.test(page) && !isInternalPath(page)) {
              const localizedPage = `/${locale.code}${page}`

              // Check if there's a rule for this route and whether it should be prerendered
              const routeRule = routeRules[page]
              if (routeRule && routeRule.prerender === false) {
                // If the route is explicitly disabled for prerendering, skip it
                return
              }

              // Check if there's a rule for the localized route
              const localizedRouteRule = routeRules[localizedPage]
              if (localizedRouteRule && localizedRouteRule.prerender === false) {
                // If the localized route is explicitly disabled for prerendering, skip it
                return
              }

              routes.push(localizedPage)
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

      // Remove internal paths before localization processing
      const routesToRemove: string[] = []
      routesSet.forEach((route) => {
        if (isInternalPath(route, options.excludePatterns)) {
          routesToRemove.push(route)
        }
      })
      routesToRemove.forEach(route => routesSet.delete(route))

      const additionalRoutes = new Set<string>()
      const routeRules = nuxt.options.routeRules || {}

      // Go through each existing route and add localized versions
      routesSet.forEach((route) => {
        if (!/\.[a-z0-9]+$/i.test(route) && !isInternalPath(route, options.excludePatterns)) {
          localeManager.locales!.forEach((locale) => {
            // For prefix and prefix_and_default strategies generate routes for defaultLocale too
            // For prefix_except_default strategy skip defaultLocale
            const shouldGenerate = locale.code !== defaultLocale || withPrefixStrategy(options.strategy!)
            if (shouldGenerate) {
              let localizedRoute: string
              if (route === '/') {
                localizedRoute = `/${locale.code}`
              }
              else {
                localizedRoute = `/${locale.code}${route}`
              }

              // Check if there's a rule for this route and whether it should be prerendered
              const routeRule = routeRules[route]
              if (routeRule && routeRule.prerender === false) {
                // If the route is explicitly disabled for prerendering, skip it
                return
              }

              // Check if there's a rule for the localized route
              const localizedRouteRule = routeRules[localizedRoute]
              if (localizedRouteRule && localizedRouteRule.prerender === false) {
                // If the localized route is explicitly disabled for prerendering, skip it
                return
              }

              additionalRoutes.add(localizedRoute)
            }
          })
        }
      })

      // Add new localized routes to existing ones
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
