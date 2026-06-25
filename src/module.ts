import fs, { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import path, { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { defaultPlural, isNoPrefixStrategy, withPrefixStrategy } from '@i18n-micro/core'
import { generateHmrPlugin } from '@i18n-micro/hmr/generate-plugin'
import { isInternalPath, isLocaleAllowedForUnlocalizedRoute, normalizePath, RouteGenerator } from '@i18n-micro/route-strategy'
import type { Getter, GlobalLocaleRoutes, Locale, LocaleCode, ModuleOptions, PluralFunc, Strategies } from '@i18n-micro/types'
import { buildTranslationSourceLayers, type PreMergeLocaleInfo, preMergeLocales } from '@i18n-micro/utils/build'
import {
  getTranslationPayloadMisconfigurationWarnings,
  getTranslationPayloadSizeWarning,
  resolveTranslationPayloadOptions,
  resolveTranslationPayloadPublicDir,
  resolveTranslationPayloadWarningThresholds,
} from '@i18n-micro/utils/payload-config'
import { scanTranslationPayloadDirectory } from '@i18n-micro/utils/payload-stats'
import {
  addComponentsDir,
  addImportsDir,
  addPlugin,
  addPrerenderRoutes,
  addRouteMiddleware,
  addServerHandler,
  addServerImportsDir,
  addTemplate,
  addTypeTemplate,
  addVitePlugin,
  createResolver,
  defineNuxtModule,
  useLogger,
} from '@nuxt/kit'
import type { HookResult, NuxtPage } from '@nuxt/schema'
import { globby } from 'globby'
import { setupDevToolsUI } from './devtools'
import { shouldLocalizeRouteRulePath } from './route-rules'
import type { PluginsInjections } from './runtime/plugins/01.plugin'
import { collectDefineI18nRouteMetaFromFiles, createDefineI18nRoutePlugin } from './unplugin-define-i18n-route'

export type { TranslationPayloadMode } from '@i18n-micro/utils/payload-config'
export { resolveTranslationPayloadMode, resolveTranslationPayloadOptions, resolveTranslationPayloadPublicDir } from '@i18n-micro/utils/payload-config'

const DEFAULT_CANONICAL_QUERY_WHITELIST = ['page', 'sort', 'filter', 'search', 'q', 'query', 'tag']

const moduleRequire = createRequire(import.meta.url)

/** Subpath entries used to force-copy @i18n-micro/* packages into Nitro output. */
const I18N_MICRO_NITRO_TRACE_ENTRIES = [
  '@i18n-micro/utils/route',
  '@i18n-micro/core',
  '@i18n-micro/route-strategy',
  '@i18n-micro/path-strategy',
  '@i18n-micro/hmr/cache-keys',
] as const

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
    components: true,
    types: true,
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    translationDir: 'locales',
    autoDetectPath: '/',
    autoDetectLanguage: true,
    disablePageLocales: false,
    disableWatcher: false,
    noPrefixRedirect: false,
    fallbackLocale: undefined,
    localeCookie: null,
    apiBaseUrl: '_locales',
    apiBaseClientHost: undefined,
    apiBaseServerHost: undefined,
    translationPayloads: {
      mode: 'premerged',
      serverAssets: true,
      serverHandler: true,
      publicAssets: true,
      prerenderRoutes: true,
    },
    routesLocaleLinks: {},
    globalLocaleRoutes: {},
    canonicalQueryWhitelist: undefined,
    plural: defaultPlural,
    customRegexMatcher: undefined,
    excludePatterns: undefined,
    localizedRouteNamePrefix: 'localized-',
    missingWarn: true,
    metaTrustForwardedHost: true,
    metaTrustForwardedProto: true,
  },
  async setup(options, nuxt) {
    const defaultLocale = process.env.DEFAULT_LOCALE ?? options.defaultLocale ?? 'en'

    const isSSG = Boolean(nuxt.options.nitro?.static)

    const logger = useLogger('nuxt-i18n-micro')

    // For no_prefix strategy, localeCookie is required - set default if not provided
    if (options.strategy === 'no_prefix' && !options.localeCookie) {
      options.localeCookie = 'user-locale'
      logger.info("Strategy 'no_prefix': localeCookie automatically set to 'user-locale' for locale persistence.")
    }

    // Warn when redirects are enabled but localeCookie is not set for prefix strategies
    if (options.strategy !== 'no_prefix' && options.redirects !== false && !options.localeCookie) {
      logger.warn(
        'Redirects are enabled but localeCookie is not set. ' +
          "Locale-based redirects will not remember user's locale preference across page reloads. " +
          "Set `localeCookie: 'user-locale'` to enable cookie-based locale persistence for redirects.",
      )
    }

    const resolver = createResolver(import.meta.url)
    const rootDirs = nuxt.options._layers.map((layer) => layer.config.rootDir).reverse()

    // Pre-merge translations from all layers into a single directory (build-time).
    // This eliminates per-request layer iteration on the server.
    // Executed in build:before hook to ensure buildDir exists.
    const mergedLocalesDir = resolve(nuxt.options.buildDir, 'i18n-merged')
    const sourceLocalesDir = resolve(nuxt.options.buildDir, 'i18n-source')
    const translationDirName = options.translationDir || 'locales'
    const translationPayloads = resolveTranslationPayloadOptions(options)
    const translationAssetsDir = translationPayloads.mode === 'source' ? sourceLocalesDir : mergedLocalesDir
    for (const warning of getTranslationPayloadMisconfigurationWarnings({
      translationPayloads,
      apiBaseClientHost: options.apiBaseClientHost,
      apiBaseServerHost: options.apiBaseServerHost,
    })) {
      logger.warn(warning.replace('[nuxt-i18n-micro] ', ''))
    }

    const localeInfos: PreMergeLocaleInfo[] = (options.locales ?? []).map((l) =>
      typeof l === 'string' ? { code: l } : { code: l.code, fallbackLocale: l.fallbackLocale },
    )

    nuxt.hook('build:before', async () => {
      if (translationPayloads.mode === 'source') {
        await buildTranslationSourceLayers(rootDirs, translationDirName, sourceLocalesDir)
        logger.info(`Built compact translation source from ${rootDirs.length} layer(s) into ${sourceLocalesDir}`)
      } else {
        await preMergeLocales(rootDirs, translationDirName, mergedLocalesDir, localeInfos, options.fallbackLocale, options.disablePageLocales)
        logger.info(`Pre-merged translations from ${rootDirs.length} layer(s) into ${mergedLocalesDir}`)
      }

      const payloadStats = scanTranslationPayloadDirectory(translationAssetsDir)
      const sizeWarning = getTranslationPayloadSizeWarning(payloadStats, resolveTranslationPayloadWarningThresholds(options.translationPayloads))
      if (sizeWarning) {
        logger.warn(sizeWarning.replace('[nuxt-i18n-micro] ', ''))
      }
    })

    // Extract routeLocales and localeRoutes from pages before creating template
    const routeLocales: Record<string, string[]> = { ...(options.routeLocales ?? {}) }
    const globalLocaleRoutes: GlobalLocaleRoutes = {}
    const routeDisableMeta: Record<string, boolean | string[]> = {}

    // Find all page files across Nuxt layers (pages/ and app/pages/)
    const pageGlobs = rootDirs.flatMap((root) => [join(root, 'pages/**/*.vue'), join(root, 'app/pages/**/*.vue')])
    const pageFiles = await globby(pageGlobs, { absolute: true })

    for (const { routePath, config } of collectDefineI18nRouteMetaFromFiles(pageFiles, rootDirs)) {
      try {
        const { locales: extractedLocales, localeRoutes, disableMeta } = config

        if (extractedLocales) {
          if (Array.isArray(extractedLocales)) {
            routeLocales[routePath] = extractedLocales
          } else if (typeof extractedLocales === 'object') {
            routeLocales[routePath] = Object.keys(extractedLocales)
          }
        }

        if (localeRoutes) {
          globalLocaleRoutes[routePath] = localeRoutes
        }

        if (disableMeta !== undefined) {
          routeDisableMeta[routePath] = disableMeta
        }
      } catch {
        // Ignore files that can't be parsed
      }
    }

    // Merge extracted localeRoutes with options.globalLocaleRoutes so user options (e.g. unlocalized: false) take precedence
    const mergedGlobalLocaleRoutes = { ...globalLocaleRoutes, ...options.globalLocaleRoutes }
    if (options.debug) {
      logger.debug('[i18n module] mergedGlobalLocaleRoutes keys:', Object.keys(mergedGlobalLocaleRoutes))
      logger.debug('[i18n module] mergedGlobalLocaleRoutes["unlocalized"]:', mergedGlobalLocaleRoutes['unlocalized'])
      logger.debug('[i18n module] strategy:', options.strategy)
    }

    // Path-strategy: resolve actual file path for pnpm compatibility
    const require = createRequire(import.meta.url)
    const strategyFiles: Record<Strategies, string> = {
      no_prefix: 'no-prefix-strategy.mjs',
      prefix: 'prefix-strategy.mjs',
      prefix_except_default: 'prefix-except-default-strategy.mjs',
      prefix_and_default: 'prefix-and-default-strategy.mjs',
    }
    const strategyFile = strategyFiles[options.strategy!] ?? strategyFiles.prefix_except_default
    const pkgPath = require.resolve('@i18n-micro/path-strategy/package.json')
    const absoluteStrategyPath = join(dirname(pkgPath), 'dist', strategyFile)
    // On Windows, absolute paths like C:\... are rejected by Node.js ESM loader
    // (ERR_UNSUPPORTED_ESM_URL_SCHEME), so convert to file:// URL
    const resolvedStrategyPath = process.platform === 'win32' ? pathToFileURL(absoluteStrategyPath).href : absoluteStrategyPath.replace(/\\/g, '/')

    const routeGenerator = new RouteGenerator({
      locales: options.locales ?? [],
      defaultLocaleCode: defaultLocale,
      strategy: options.strategy!,
      globalLocaleRoutes: mergedGlobalLocaleRoutes,
      filesLocaleRoutes: globalLocaleRoutes,
      routeLocales,
      noPrefixRedirect: options.noPrefixRedirect!,
      excludePatterns: options.excludePatterns,
      localizedRouteNamePrefix: options.localizedRouteNamePrefix,
      customRegexMatcher: options.customRegexMatcher,
    })

    const pluralTemplate = addTemplate({
      filename: 'i18n.plural.mjs',
      write: true,
      getContents: () => `export const plural = ${options.plural!.toString()};`,
    })

    let apiBaseClientHost = process.env.NUXT_I18N_APP_BASE_CLIENT_HOST ?? options.apiBaseClientHost ?? undefined
    if (apiBaseClientHost?.endsWith('/')) {
      apiBaseClientHost = apiBaseClientHost.slice(0, -1)
    }
    let apiBaseServerHost = process.env.NUXT_I18N_APP_BASE_SERVER_HOST ?? options.apiBaseServerHost ?? undefined
    if (apiBaseServerHost?.endsWith('/')) {
      apiBaseServerHost = apiBaseServerHost.slice(0, -1)
    }
    const rawUrl = process.env.NUXT_I18N_APP_BASE_URL ?? options.apiBaseUrl ?? '_locales'
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      throw new Error('Nuxt-i18n-micro: Please use NUXT_I18N_APP_BASE_CLIENT_HOST or NUXT_I18N_APP_BASE_SERVER_HOST instead.')
    }
    const apiBaseUrl = rawUrl.replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/')

    // Cache-busting value used as `?v=...` when fetching translations.
    // Defaults to `Date.now()` so each build gets fresh assets unless the user
    // sets `dateBuild` explicitly (e.g. for rolling deploys or fixed cache keys).
    const dateBuild = options.dateBuild ?? Date.now()

    const fullConfig = {
      locales: routeGenerator.locales ?? [],
      metaBaseUrl: options.metaBaseUrl || undefined,
      metaTrustForwardedHost: options.metaTrustForwardedHost ?? true,
      metaTrustForwardedProto: options.metaTrustForwardedProto ?? true,
      defaultLocale: defaultLocale,
      fallbackLocale: options.fallbackLocale ?? undefined,
      localeCookie: options.localeCookie ?? null,
      autoDetectLanguage: options.autoDetectLanguage ?? true,
      autoDetectPath: options.autoDetectPath ?? '/',
      strategy: options.strategy ?? 'prefix_except_default',
      dateBuild,
      hashMode: nuxt.options?.router?.options?.hashMode ?? false,
      apiBaseUrl,
      apiBaseClientHost,
      isSSG,
      disablePageLocales: options.disablePageLocales ?? false,
      canonicalQueryWhitelist: options.canonicalQueryWhitelist ?? DEFAULT_CANONICAL_QUERY_WHITELIST,
      excludePatterns: options.excludePatterns ?? [],
      routeLocales,
      routeDisableMeta: routeDisableMeta,
      globalLocaleRoutes: mergedGlobalLocaleRoutes,
      missingWarn: options.missingWarn ?? true,
      redirects: options.redirects !== false,
      hooks: options.hooks !== false,
      hmr: options.hmr ?? true,
      localizedRouteNamePrefix: options.localizedRouteNamePrefix ?? 'localized-',
      routesLocaleLinks: options.routesLocaleLinks ?? {},
      noPrefixRedirect: options.noPrefixRedirect ?? false,
      debug: options.debug ?? false,
      customRegexMatcher: options.customRegexMatcher instanceof RegExp ? options.customRegexMatcher.source : options.customRegexMatcher,
      cacheMaxSize: options.cacheMaxSize ?? 0,
      cacheTtl: options.cacheTtl ?? 0,
      translationPayloadMode: translationPayloads.mode,
    }

    const fullConfigJson = JSON.stringify(fullConfig)

    const strategyTemplate = addTemplate({
      filename: 'i18n.strategy.mjs',
      write: true,
      getContents: () => `import { Strategy } from '${resolvedStrategyPath}'

const __fullConfig = ${fullConfigJson}

export function getI18nConfig() { return __fullConfig }

export function createI18nStrategy(router) {
  const routerAdapter = {
    hasRoute(name) { return router.hasRoute(name) },
    resolve(to) {
      const r = router.resolve(to)
      return {
        name: r.name != null ? String(r.name) : null,
        path: r.path,
        fullPath: r.fullPath,
        params: r.params || {},
        query: r.query || {},
        hash: r.hash || '',
      }
    },
  }

  return new Strategy({
    strategy: __fullConfig.strategy,
    defaultLocale: __fullConfig.defaultLocale,
    locales: __fullConfig.locales,
    localizedRouteNamePrefix: __fullConfig.localizedRouteNamePrefix,
    globalLocaleRoutes: __fullConfig.globalLocaleRoutes,
    routeLocales: __fullConfig.routeLocales,
    routesLocaleLinks: __fullConfig.routesLocaleLinks,
    noPrefixRedirect: __fullConfig.noPrefixRedirect,
    debug: __fullConfig.debug,
    router: routerAdapter,
    hashMode: __fullConfig.hashMode,
    disablePageLocales: __fullConfig.disablePageLocales,
  })
}
`,
    })

    // i18n config source of truth is #build/i18n.strategy.mjs.
    // runtimeConfig (public.i18nRuntime) is used only for runtime overrides.

    // Validate that all locale codes match the customRegexMatcher (if set)
    if (typeof options.customRegexMatcher !== 'undefined') {
      const localeCodes = routeGenerator.locales.map((l) => l.code)
      const failedCodes = localeCodes.filter((code) => !code.match(options.customRegexMatcher as string | RegExp))
      if (failedCodes.length > 0) {
        throw new Error(
          'Nuxt-i18n-micro: customRegexMatcher does not match the following locale codes: ' +
            failedCodes.join(', ') +
            '. The regex must match ALL locale codes in your configuration.',
        )
      }
    }

    const privateConfig = {
      rootDir: nuxt.options.rootDir,
      debug: options.debug ?? false,
      locales: routeGenerator.locales ?? [],
      fallbackLocale: options.fallbackLocale ?? undefined,
      translationDir: options.translationDir ?? 'locales',
      customRegexMatcher: options.customRegexMatcher instanceof RegExp ? options.customRegexMatcher.source : options.customRegexMatcher,
      routesLocaleLinks: options.routesLocaleLinks ?? {},
      apiBaseUrl,
      apiBaseClientHost,
      apiBaseServerHost,
      serverTranslationPreload: options.serverTranslationPreload ?? false,
    }
    const privateConfigJson = JSON.stringify(privateConfig)
    const configTemplate = addTemplate({
      filename: 'i18n.config.mjs',
      write: true,
      getContents: () => `const __privateConfig = ${privateConfigJson}
export function getI18nPrivateConfig() { return __privateConfig }
`,
    })

    addImportsDir(resolver.resolve('./runtime/composables'))

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

    // Server-side redirect and 404 handling. Client redirects use route middleware.
    addPlugin({
      src: resolver.resolve('./runtime/plugins/06.redirect'),
      mode: 'server',
      name: 'i18n-plugin-redirect',
      order: 10,
    })

    if (options.redirects !== false && options.plugin !== false) {
      addRouteMiddleware({
        name: 'i18n-redirect',
        path: resolver.resolve('./runtime/middleware/i18n-redirect.global'),
        global: true,
      })
    }

    addServerImportsDir(resolver.resolve('./runtime/server/utils'))

    if (translationPayloads.serverHandler) {
      addServerHandler({
        route: `/${apiBaseUrl}/:page/:locale/data.json`,
        handler: resolver.resolve('./runtime/server/routes/i18n'),
      })
    }

    if (options.components !== false) {
      addComponentsDir({
        path: resolver.resolve('./runtime/components'),
        pathPrefix: false,
        extensions: ['vue'],
      })
    }

    // HMR for translations
    if (nuxt.options.dev && (options.hmr ?? true)) {
      const translationsDir = join(nuxt.options.rootDir, options.translationDir || 'locales')
      const files = await globby(['**/*.json'], { cwd: translationsDir, absolute: true })
      const tpl = addTemplate({
        filename: 'i18n.hmr.mjs',
        write: true,
        getContents: () => generateHmrPlugin(files.map((f) => f.replace(/\\/g, '/'))),
      })
      addPlugin({
        src: tpl.dst,
        mode: 'client',
        name: 'i18n-hmr',
        order: 10,
      })
    }

    if (options.types) {
      addTypeTemplate({
        filename: 'types/i18n-plugin.d.ts',
        getContents: () => generateI18nTypes(),
      })
      addTypeTemplate({
        filename: 'types/h3.d.ts',
        getContents: () => `import type { Translations } from '@i18n-micro/types'

declare module 'h3' {
  interface H3EventContext {
    i18n?: {
      locale: string
      translations: Translations
    }
  }
}

export {}
`,
      })
    }

    // Types for #build/* and #i18n-internal/* (included in .nuxt/types/, nuxt.d.ts)
    addTypeTemplate({
      filename: 'types/i18n-internal.d.ts',
      getContents: () => {
        return `import type { ModuleOptionsExtend, ModulePrivateOptionsExtend, Params, Getter, PluralFunc } from '@i18n-micro/types'
import type { PathStrategy } from '@i18n-micro/path-strategy'

declare module '#build/i18n.plural.mjs' {
  export function plural(key: string, count: number, params: Params, locale: string, getter: Getter): string | null
}

declare module '#build/i18n.strategy.mjs' {
  export function getI18nConfig(): ModuleOptionsExtend
  export function createI18nStrategy(router: { hasRoute: (name: string) => boolean, resolve: (to: unknown) => { name: string | null, path: string, fullPath: string, params?: Record<string, unknown>, query?: Record<string, unknown>, hash?: string } }): PathStrategy
}

declare module '#i18n-internal/config' {
  export function getI18nPrivateConfig(): ModulePrivateOptionsExtend
}

declare module '#i18n-internal/strategy' {
  export function getI18nConfig(): ModuleOptionsExtend
  export function createI18nStrategy(router: { hasRoute: (name: string) => boolean, resolve: (to: unknown) => { name: string | null, path: string, fullPath: string, params?: Record<string, unknown>, query?: Record<string, unknown>, hash?: string } }): PathStrategy
}

declare module '#i18n-internal/plural' {
  export const plural: PluralFunc
}
`
      },
    })

    const addDataRoutes = (pages: NuxtPage[] = []) => {
      if (!translationPayloads.prerenderRoutes) return

      const pagesForDataRoutes = pages.filter((p) => p.name !== undefined && (!options.routesLocaleLinks || !options.routesLocaleLinks[p.name!]))
      const dataRoutes = routeGenerator.generateDataRoutes(pagesForDataRoutes, apiBaseUrl, !!options.disablePageLocales)
      addPrerenderRoutes(dataRoutes)
    }

    nuxt.hook('pages:resolved', (pages) => {
      const pagesNames = pages
        .map((page) => page.name)
        .filter((name): name is string => name !== undefined && (!options.routesLocaleLinks || !options.routesLocaleLinks[name]))

      if (!options.disableWatcher) {
        routeGenerator.ensureTranslationFilesExist(pagesNames, options.translationDir!, nuxt.options.rootDir, options.disablePageLocales)
      }

      addDataRoutes(pages)
      routeGenerator.extendPages(pages)
    })

    // When pages: false, pages:resolved may not run — ensure data routes are added
    if (options.disablePageLocales) {
      nuxt.hook('build:before', () => addDataRoutes([] as NuxtPage[]))
    }

    addVitePlugin(
      createDefineI18nRoutePlugin({
        buildDir: nuxt.options.buildDir,
        rootDirs,
      }).vite(),
    )

    // Nitro-only aliases for server runtime. Private config (#i18n-internal/config) is
    // intentionally NOT aliased in Vite so it cannot be bundled into the client graph.
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {}
      nitroConfig.alias['#i18n-internal/plural'] = pluralTemplate.dst
      nitroConfig.alias['#i18n-internal/strategy'] = strategyTemplate.dst
      nitroConfig.alias['#i18n-internal/config'] = configTemplate.dst

      // Force Nitro to copy @i18n-micro/* packages into .output/server/node_modules.
      // Subpath exports (e.g. @i18n-micro/utils/route) are not always traced otherwise.
      nitroConfig.externals = nitroConfig.externals || {}
      nitroConfig.externals.traceInclude = nitroConfig.externals.traceInclude || []
      for (const entry of I18N_MICRO_NITRO_TRACE_ENTRIES) {
        try {
          const resolved = moduleRequire.resolve(entry)
          if (!nitroConfig.externals.traceInclude.includes(resolved)) {
            nitroConfig.externals.traceInclude.push(resolved)
          }
        } catch {
          // Optional runtime entry (e.g. hmr) may be absent in minimal installs.
        }
      }

      if (translationPayloads.serverAssets) {
        nitroConfig.serverAssets = nitroConfig.serverAssets || []
        nitroConfig.serverAssets.push({
          baseName: 'i18n',
          dir: translationAssetsDir,
        })
      }

      nitroConfig.routeRules = nitroConfig.routeRules || {}
      nitroConfig.routeRules[`/${apiBaseUrl}/**`] = {
        ...(nitroConfig.routeRules[`/${apiBaseUrl}/**`] || {}),
        cors: true,
        ...(nuxt.options.dev
          ? {}
          : {
              cache: {
                maxAge: 60,
                swr: true,
              },
            }),
      }

      const routeRules = nuxt.options.routeRules || {}
      const strategy = options.strategy! as Strategies

      if (routeRules && Object.keys(routeRules).length && !isNoPrefixStrategy(strategy)) {
        for (const [originalPath, ruleValue] of Object.entries(routeRules)) {
          if (!shouldLocalizeRouteRulePath(originalPath)) continue

          routeGenerator.locales.forEach((localeObj) => {
            const localeCode = localeObj.code
            if (!isLocaleAllowedForUnlocalizedRoute(routeGenerator.routeLocales, routeGenerator.locales, originalPath, localeCode)) {
              return
            }
            const localizedPath = routeGenerator.resolveLocalizedPath(originalPath, localeCode)

            if (localizedPath === originalPath || localizedPath === normalizePath(originalPath)) {
              return
            }

            const { redirect, ...restRuleValue } = ruleValue
            if (!Object.keys(restRuleValue).length) return

            nitroConfig.routeRules![localizedPath] = {
              ...nitroConfig.routeRules![localizedPath],
              ...restRuleValue,
            }
            logger.debug(`Replicated routeRule for ${localizedPath}: ${JSON.stringify(restRuleValue)}`)
          })
        }
      }

      nitroConfig.plugins = nitroConfig.plugins || []
      if (nuxt.options.dev && (options.hmr ?? true)) {
        nitroConfig.plugins.push(resolver.resolve('./runtime/server/plugins/watcher.dev'))
      }
      nitroConfig.handlers = nitroConfig.handlers || []
      nitroConfig.handlers.unshift({
        middleware: true,
        handler: resolver.resolve('./runtime/server/middleware/i18n.global'),
      })
    })

    nuxt.hook('nitro:build:public-assets', (nitro) => {
      const isProd = nuxt.options.dev === false
      if (isProd && translationPayloads.publicAssets) {
        const publicDir = resolveTranslationPayloadPublicDir(nitro.options.output.publicDir, options)

        try {
          // Copy translation assets when public output is enabled.
          if (existsSync(translationAssetsDir)) {
            fs.cpSync(translationAssetsDir, publicDir, { recursive: true })
            logger.log(`Translation payloads copied to public directory`)
          } else {
            logger.warn(`Translation assets directory not found: ${translationAssetsDir}`)
          }
        } catch (err) {
          logger.error('Error copying translations:', err)
        }
      }
    })

    nuxt.hook('prerender:routes', async (prerenderRoutes) => {
      if (isNoPrefixStrategy(options.strategy!)) {
        return
      }

      const routesSet = prerenderRoutes.routes
      const routeRules = nuxt.options.routeRules || {}
      const additionalRoutes = new Set<string>()
      const localeCodes = new Set(routeGenerator.locales.map((locale) => locale.code))

      for (const route of routesSet) {
        if (isInternalPath(route, options.excludePatterns)) {
          routesSet.delete(route)
        }
      }

      for (const route of routesSet) {
        if (/\.[a-z0-9]+$/i.test(route)) {
          continue
        }
        if (routeRules[route]?.prerender === false) {
          continue
        }
        // Route is already localized (e.g. /fr/about), do not localize it again.
        const firstSegment = route.replace(/^\//, '').split('/')[0]
        if (firstSegment && localeCodes.has(firstSegment)) {
          continue
        }

        for (const locale of routeGenerator.locales) {
          if (!isLocaleAllowedForUnlocalizedRoute(routeGenerator.routeLocales, routeGenerator.locales, route, locale.code)) {
            continue
          }
          const localizedRoute = routeGenerator.resolveLocalizedPath(route, locale.code)
          if (localizedRoute === route) {
            continue
          }
          if (routeRules[localizedRoute]?.prerender === false) {
            continue
          }
          additionalRoutes.add(localizedRoute)
        }
      }

      if (additionalRoutes.size > 0) {
        logger.debug('[i18n prerender:routes] added localized routes:', [...additionalRoutes].sort().join(', '))
      }

      for (const route of additionalRoutes) {
        routesSet.add(route)
      }

      // prefix / prefix_and_default: only locale-prefixed paths are valid. Nuxt still
      // registers file-based routes like /contact, /about; prerendering them causes 500.
      // Remove them from the list so the crawler doesn't request them.
      if (withPrefixStrategy(options.strategy!)) {
        const deleted: string[] = []
        for (const route of routesSet) {
          if (route === '/' || route === '') continue // Keep / for redirect to default locale
          const firstSegment = route.replace(/^\//, '').split('/')[0]
          if (firstSegment && !localeCodes.has(firstSegment)) {
            routesSet.delete(route)
            deleted.push(route)
          }
        }
        if (deleted.length > 0) {
          logger.info(`[i18n prerender:routes] removed from prerender list (no locale prefix): ${deleted.join(', ')}`)
        }
      }
    })

    // Setup DevTools integration
    if (nuxt.options.dev) {
      setupDevToolsUI(options, resolver.resolve, rootDirs)
    }
  },
})

export interface ModuleHooks {
  'i18n:register': (registerModule: (translations: unknown, locale?: string) => void, locale: string) => HookResult
}

declare module '@nuxt/schema' {
  interface NuxtHooks extends ModuleHooks {}
}

export type { Locale, PluralFunc, ModuleOptions, GlobalLocaleRoutes, Getter, LocaleCode, PluginsInjections, Strategies }
