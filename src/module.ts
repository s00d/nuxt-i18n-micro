import fs, { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { defaultPlural, isNoPrefixStrategy, withPrefixStrategy } from '@i18n-micro/core'
import { generateHmrPlugin } from '@i18n-micro/hmr/generate-plugin'
import { isInternalPath, isLocaleAllowedForUnlocalizedRoute, normalizePath, RouteGenerator } from '@i18n-micro/route-strategy'
import type {
  Getter,
  GlobalLocaleRoutes,
  Locale,
  LocaleCode,
  ModuleOptions,
  ModuleOptionsExtend,
  ModulePrivateOptionsExtend,
  PluralFunc,
  Strategies,
} from '@i18n-micro/types'
import { buildTranslationSourceLayers, type PreMergeLocaleInfo, preMergeLocales } from '@i18n-micro/utils/build'
import {
  getTranslationPayloadMisconfigurationWarnings,
  getTranslationPayloadSizeWarning,
  resolveTranslationPayloadOptions,
  resolveTranslationPayloadPublicDir,
  resolveTranslationPayloadWarningThresholds,
  type TranslationPayloadMode,
} from '@i18n-micro/utils/payload-config'
import { compressTranslationPayloads, hashTranslationSources, scanTranslationPayloadDirectory } from '@i18n-micro/utils/payload-stats'
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
  resolvePath,
  useLogger,
} from '@nuxt/kit'
import type { HookResult, Nuxt, NuxtPage } from '@nuxt/schema'
import { globby } from 'globby'
import { setupDevToolsUI } from './devtools'
import { shouldLocalizeRouteRulePath } from './route-rules'
import type { PluginsInjections } from './runtime/plugins/01.plugin'
import { collectDefineI18nRouteMetaFromFiles, createDefineI18nRoutePlugin } from './unplugin-define-i18n-route'

export type { TranslationPayloadMode } from '@i18n-micro/utils/payload-config'
export { resolveTranslationPayloadMode, resolveTranslationPayloadOptions, resolveTranslationPayloadPublicDir } from '@i18n-micro/utils/payload-config'

const strategyFiles: Record<Strategies, string> = {
  no_prefix: 'no-prefix-strategy.mjs',
  prefix: 'prefix-strategy.mjs',
  prefix_except_default: 'prefix-except-default-strategy.mjs',
  prefix_and_default: 'prefix-and-default-strategy.mjs',
}

async function resolveStrategyPath(strategy: Strategies): Promise<string> {
  const strategyFile = strategyFiles[strategy] ?? strategyFiles.prefix_except_default
  const specifier = `@i18n-micro/path-strategy/dist/${strategyFile}`
  let absoluteStrategyPath: string
  try {
    // Resolve relative to this module first, so pnpm layouts that nest
    // @i18n-micro/path-strategy under nuxt-i18n-micro still resolve it.
    absoluteStrategyPath = fileURLToPath(import.meta.resolve(specifier))
  } catch {
    absoluteStrategyPath = await resolvePath(specifier)
  }
  return process.platform === 'win32' ? pathToFileURL(absoluteStrategyPath).href : absoluteStrategyPath.replace(/\\/g, '/')
}

function generateI18nTypes(): string {
  return `
import type { PluginsInjections } from "nuxt-i18n-micro";

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

const DEFAULT_CANONICAL_QUERY_WHITELIST = ['page', 'sort', 'filter', 'search', 'q', 'query', 'tag']

interface NormalizedApiConfig {
  apiBaseUrl: string
  apiBaseClientHost: string | undefined
  apiBaseServerHost: string | undefined
}

function buildFullConfig(params: {
  options: ModuleOptions
  nuxt: Nuxt
  defaultLocale: string
  isSSG: boolean
  apiConfig: NormalizedApiConfig
  translationPayloadMode: TranslationPayloadMode
  routeLocales: Record<string, string[]>
  routeDisableMeta: Record<string, boolean | string[]>
  mergedGlobalLocaleRoutes: GlobalLocaleRoutes
  locales: ModuleOptionsExtend['locales']
  translationsHash: string | null
}) {
  const {
    options,
    nuxt,
    defaultLocale,
    isSSG,
    apiConfig,
    translationPayloadMode,
    routeLocales,
    routeDisableMeta,
    mergedGlobalLocaleRoutes,
    locales,
    translationsHash,
  } = params
  // Prefer a fingerprint of the translations themselves: a timestamp would move on
  // every build and make clients re-download a dictionary that never changed.
  const dateBuild = options.dateBuild ?? translationsHash ?? Date.now()

  return {
    locales: locales ?? [],
    metaBaseUrl: options.metaBaseUrl || undefined,
    metaTrustForwardedHost: options.metaTrustForwardedHost ?? true,
    metaTrustForwardedProto: options.metaTrustForwardedProto ?? true,
    defaultLocale,
    fallbackLocale: options.fallbackLocale ?? undefined,
    localeCookie: options.localeCookie ?? null,
    autoDetectLanguage: options.autoDetectLanguage ?? true,
    autoDetectPath: options.autoDetectPath ?? '/',
    strategy: options.strategy ?? 'prefix_except_default',
    dateBuild,
    hashMode: nuxt.options?.router?.options?.hashMode ?? false,
    apiBaseUrl: apiConfig.apiBaseUrl,
    apiBaseClientHost: apiConfig.apiBaseClientHost,
    isSSG,
    disablePageLocales: options.disablePageLocales ?? false,
    canonicalQueryWhitelist: options.canonicalQueryWhitelist ?? DEFAULT_CANONICAL_QUERY_WHITELIST,
    excludePatterns: options.excludePatterns ?? [],
    routeLocales,
    routeDisableMeta,
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
    httpCacheDuration: options.httpCacheDuration,
    numberFormats: options.numberFormats ?? {},
    datetimeFormats: options.datetimeFormats ?? {},
    translationPayloadMode,
  }
}

function buildPrivateConfig(options: ModuleOptions, nuxt: Nuxt, apiConfig: NormalizedApiConfig, locales: ModulePrivateOptionsExtend['locales']) {
  return {
    rootDir: nuxt.options.rootDir,
    debug: options.debug ?? false,
    locales: locales ?? [],
    fallbackLocale: options.fallbackLocale ?? undefined,
    translationDir: options.translationDir ?? 'locales',
    customRegexMatcher: options.customRegexMatcher instanceof RegExp ? options.customRegexMatcher.source : options.customRegexMatcher,
    routesLocaleLinks: options.routesLocaleLinks ?? {},
    apiBaseUrl: apiConfig.apiBaseUrl,
    apiBaseClientHost: apiConfig.apiBaseClientHost,
    apiBaseServerHost: apiConfig.apiBaseServerHost,
    serverTranslationPreload: options.serverTranslationPreload ?? false,
  }
}

function registerI18nTemplates(
  options: ModuleOptions,
  resolvedStrategyPath: string,
  fullConfig: ReturnType<typeof buildFullConfig>,
  privateConfig: ReturnType<typeof buildPrivateConfig>,
) {
  let runtimeFullConfig = fullConfig
  const privateConfigJson = JSON.stringify(privateConfig)

  const pluralTemplate = addTemplate({
    filename: 'i18n.plural.mjs',
    write: true,
    getContents: () => `export const plural = ${options.plural!.toString()};`,
  })

  const strategyTemplate = addTemplate({
    filename: 'i18n.strategy.mjs',
    write: true,
    getContents: () => {
      const fullConfigJson = JSON.stringify(runtimeFullConfig)
      return `import { Strategy } from '${resolvedStrategyPath}'

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
`
    },
  })

  const configTemplate = addTemplate({
    filename: 'i18n.config.mjs',
    write: true,
    getContents: () => `const __privateConfig = ${privateConfigJson}
export function getI18nPrivateConfig() { return __privateConfig }
`,
  })

  return {
    pluralTemplate,
    strategyTemplate,
    configTemplate,
    setFullConfig(next: ReturnType<typeof buildFullConfig>) {
      runtimeFullConfig = next
    },
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-i18n-micro',
    configKey: 'i18n',
  },
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
    httpCacheDuration: 31536000,
  },
  async setup(options, nuxt) {
    const defaultLocale = process.env.DEFAULT_LOCALE ?? options.defaultLocale ?? 'en'
    const isSSG = Boolean(nuxt.options.nitro?.static)
    const logger = useLogger('nuxt-i18n-micro')

    if (options.strategy === 'no_prefix' && !options.localeCookie) {
      options.localeCookie = 'user-locale'
      logger.info("Strategy 'no_prefix': localeCookie automatically set to 'user-locale' for locale persistence.")
    }
    if (options.strategy !== 'no_prefix' && options.redirects !== false && !options.localeCookie) {
      logger.warn(
        'Redirects are enabled but localeCookie is not set. ' +
          "Locale-based redirects will not remember user's locale preference across page reloads. " +
          "Set `localeCookie: 'user-locale'` to enable cookie-based locale persistence for redirects.",
      )
    }

    const resolver = createResolver(import.meta.url)
    const rootDirs = nuxt.options._layers.map((layer) => layer.config.rootDir).reverse()

    const mergedLocalesDir = resolve(nuxt.options.buildDir, 'i18n-merged')
    const sourceLocalesDir = resolve(nuxt.options.buildDir, 'i18n-source')
    const translationDirName = options.translationDir || 'locales'
    const translationsHash = hashTranslationSources(rootDirs, translationDirName)
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

    const routeLocales: Record<string, string[]> = { ...(options.routeLocales ?? {}) }
    const globalLocaleRoutes: GlobalLocaleRoutes = {}
    const routeDisableMeta: Record<string, boolean | string[]> = {}

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
      } catch (error) {
        logger.debug(`Failed to parse defineI18nRoute config for ${routePath}:`, error)
      }
    }

    const mergedGlobalLocaleRoutes = { ...globalLocaleRoutes, ...options.globalLocaleRoutes }
    if (options.debug) {
      logger.debug('[i18n module] mergedGlobalLocaleRoutes keys:', Object.keys(mergedGlobalLocaleRoutes))
      logger.debug('[i18n module] mergedGlobalLocaleRoutes["unlocalized"]:', mergedGlobalLocaleRoutes['unlocalized'])
      logger.debug('[i18n module] strategy:', options.strategy)
    }

    const resolvedStrategyPath = await resolveStrategyPath(options.strategy!)

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
    const apiConfig = { apiBaseUrl, apiBaseClientHost, apiBaseServerHost }

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

    const fullConfig = buildFullConfig({
      options,
      nuxt,
      defaultLocale,
      isSSG,
      apiConfig,
      translationPayloadMode: translationPayloads.mode,
      routeLocales,
      routeDisableMeta,
      mergedGlobalLocaleRoutes,
      locales: routeGenerator.locales ?? [],
      translationsHash,
    })

    const privateConfig = buildPrivateConfig(options, nuxt, apiConfig, routeGenerator.locales ?? [])
    const templates = registerI18nTemplates(options, resolvedStrategyPath, fullConfig, privateConfig)

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

    if (options.disablePageLocales) {
      nuxt.hook('build:before', () => addDataRoutes([] as NuxtPage[]))
    }

    addVitePlugin(
      createDefineI18nRoutePlugin({
        buildDir: nuxt.options.buildDir,
        rootDirs,
      }).vite(),
    )

    const { pluralTemplate, strategyTemplate, configTemplate } = templates

    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {}
      nitroConfig.alias['#i18n-internal/plural'] = pluralTemplate.dst
      nitroConfig.alias['#i18n-internal/strategy'] = strategyTemplate.dst
      nitroConfig.alias['#i18n-internal/config'] = configTemplate.dst

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
          if (existsSync(translationAssetsDir)) {
            fs.cpSync(translationAssetsDir, publicDir, { recursive: true })
            logger.log(`Translation payloads copied to public directory`)

            // Nitro compresses public assets before this hook runs, so files copied
            // here are never covered by `compressPublicAssets` — honour the setting
            // ourselves rather than leaving the payloads as the one uncompressed part
            // of the output.
            const compressed = compressTranslationPayloads(publicDir, nitro.options.compressPublicAssets)
            if (compressed > 0) {
              logger.log(`Compressed ${compressed} translation payload file(s)`)
            }
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

      // Static generation needs an entry point the crawler can actually follow.
      // With `prefix`, `/` only answers with a redirect to `/<defaultLocale>`:
      // Nitro writes the redirect stub but never enqueues its target, so nothing
      // beyond the explicitly listed routes is prerendered. Seed the localized
      // roots instead (never `/` itself — prerendering that would shadow the SSR
      // handler with a static redirect).
      if (isSSG) {
        // `/` itself is kept so a static host still answers the bare root (it
        // renders as the redirect stub to the default locale). Only for SSG:
        // prerendering it in an SSR build would shadow the dynamic handler.
        if (routeRules['/']?.prerender !== false) {
          routesSet.add('/')
        }
        for (const locale of routeGenerator.locales) {
          // Same allowed-locale guard as the localization loop below: a locale
          // excluded from the index route has no root to prerender, and asking
          // for one yields a 404/fallback page.
          if (!isLocaleAllowedForUnlocalizedRoute(routeGenerator.routeLocales, routeGenerator.locales, '/', locale.code)) {
            continue
          }
          const localizedRoot = routeGenerator.resolveLocalizedPath('/', locale.code)
          if (localizedRoot && localizedRoot !== '/' && routeRules[localizedRoot]?.prerender !== false) {
            routesSet.add(localizedRoot)
          }
        }
      }

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

      if (withPrefixStrategy(options.strategy!)) {
        const deleted: string[] = []
        for (const route of routesSet) {
          if (route === '/' || route === '') continue
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

    // `devtools: false` and `devtools: { enabled: false }` both mean no tab, and
    // therefore no route to serve it from, no RPC and — while this repo is being
    // worked on — no dev server for the client UI.
    const devtoolsOptions = nuxt.options.devtools
    const devtoolsEnabled = devtoolsOptions !== false && devtoolsOptions?.enabled !== false
    if (nuxt.options.dev && devtoolsEnabled) {
      setupDevToolsUI(options, rootDirs)
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
