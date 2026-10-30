import fs, { existsSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { defaultPlural, isNoPrefixStrategy, withPrefixStrategy } from '@i18n-micro/core'
import { generateHmrPlugin, TRANSLATIONS_HMR_EVENT } from './hmr-plugin'
import { resolveLiveTranslationDirs, translationRelativePath } from './runtime/server/utils/translation-watcher'
import { isInternalPath, isLocaleAllowedForUnlocalizedRoute, normalizePath, RouteGenerator } from '@i18n-micro/route-strategy'
import { configForHost } from '@i18n-micro/utils/domains'
import { buildFullConfigSource } from './config-template'
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
import { buildTranslationSourceLayers, type PreMergeLocaleInfo, preMergeLocales } from './build/build'
import {
  getTranslationPayloadMisconfigurationWarnings,
  getTranslationPayloadSizeWarning,
  resolveTranslationPayloadOptions,
  resolveTranslationPayloadPublicDir,
  resolveTranslationPayloadPublicRel,
  resolveTranslationPayloadWarningThresholds,
  shouldCopyTranslationPayloadsToPublic,
  shouldReadPayloadsFromPublicDir,
  shouldRegisterNitroServerAssets,
  type TranslationPayloadMode,
} from './build/payload-config'
import { compressTranslationPayloads, hashTranslationSources, scanTranslationPayloadDirectory } from './build/payload-stats'
import { buildTranslationPayloadCacheControl } from '@i18n-micro/utils/payload-url'
import { buildI18nPluralTemplate } from './plural-template'
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
import { shouldLocalizeRouteRulePath, buildTranslationPayloadRouteRule } from './route-rules'
import { createLocalizedPathResolver, type LocalizedPathResolver, staticPagePaths } from './localized-paths'
import type { PluginsInjections } from './runtime/plugins/01.plugin'
import { collectDefineI18nRouteMetaFromFiles, createDefineI18nRoutePlugin } from './unplugin-define-i18n-route'

export type { TranslationPayloadMode } from './build/payload-config'
export {
  resolveTranslationPayloadMode,
  resolveTranslationPayloadOptions,
  resolveTranslationPayloadPublicDir,
  resolveTranslationPayloadPublicRel,
  shouldCopyTranslationPayloadsToPublic,
  shouldRegisterNitroServerAssets,
} from './build/payload-config'

/** Absolute path of the path-strategy entry the generated `i18n.strategy.mjs` imports. */
async function resolveStrategyPath(): Promise<string> {
  const specifier = '@i18n-micro/path-strategy'
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

async function resolveHelpersPath(): Promise<string> {
  const specifier = '@i18n-micro/core/helpers'
  let absoluteHelpersPath: string
  try {
    absoluteHelpersPath = fileURLToPath(import.meta.resolve(specifier))
  } catch {
    absoluteHelpersPath = await resolvePath(specifier)
  }
  return process.platform === 'win32' ? pathToFileURL(absoluteHelpersPath).href : absoluteHelpersPath.replace(/\\/g, '/')
}

function generateI18nTypes(): string {
  return `
import type { PluginsInjections } from "nuxt-i18n-micro";

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

/**
 * The cache-buster appended to payload URLs as `?v=`.
 *
 * Prefer a fingerprint of the translations themselves: a timestamp moves on every build and
 * makes clients re-download a dictionary that never changed. `options.dateBuild` wins even
 * when it is `0`/`''`, which is how an app opts out of busting entirely.
 *
 * Derived here and nowhere else — the runtime config and the Nitro route rules both need it,
 * and computing it twice is an invariant somebody has to remember.
 */
function resolveDateBuild(options: ModuleOptions, translationsHash: string | null | undefined): string | number {
  return options.dateBuild ?? translationsHash ?? Date.now()
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
  locales: ModuleOptionsExtend['locales']
  translationsHash: string | null
}) {
  const { options, nuxt, defaultLocale, isSSG, apiConfig, translationPayloadMode, routeLocales, routeDisableMeta, locales, translationsHash } = params
  const dateBuild = resolveDateBuild(options, translationsHash)

  return {
    locales: locales ?? [],
    // an unknown host of a build whose default has a domain takes that origin, not the request's
    metaBaseUrl: options.metaBaseUrl || locales?.find((locale) => locale.code === defaultLocale)?.baseUrl || undefined,
    metaTrustForwardedHost: options.metaTrustForwardedHost ?? true,
    metaTrustForwardedProto: options.metaTrustForwardedProto ?? true,
    trustForwardedHost: options.trustForwardedHost ?? false,
    hreflangBaseLanguage: options.hreflangBaseLanguage ?? false,
    defaultLocale,
    fallbackLocale: options.fallbackLocale ?? undefined,
    localeCookie: options.localeCookie ?? null,
    autoDetectLanguage: options.autoDetectLanguage ?? true,
    autoDetectPath: options.autoDetectPath ?? '/',
    strategy: options.strategy ?? 'prefix_except_default',
    dateBuild,
    hashMode: nuxt.options?.router?.options?.hashMode ?? false,
    trailingSlash:
      options.trailingSlash ??
      (nuxt.options.experimental as { defaults?: { nuxtLink?: { trailingSlash?: 'append' | 'remove' } } })?.defaults?.nuxtLink?.trailingSlash,
    apiBaseUrl: apiConfig.apiBaseUrl,
    apiBaseClientHost: apiConfig.apiBaseClientHost,
    isSSG,
    disablePageLocales: options.disablePageLocales ?? false,
    canonicalQueryWhitelist: options.canonicalQueryWhitelist ?? DEFAULT_CANONICAL_QUERY_WHITELIST,
    excludePatterns: options.excludePatterns ?? [],
    routeLocales,
    routeDisableMeta,
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

function buildPrivateConfig(
  options: ModuleOptions,
  nuxt: Nuxt,
  apiConfig: NormalizedApiConfig,
  locales: ModulePrivateOptionsExtend['locales'],
  payloadFsDir: string,
  payloadPublicRel: string,
) {
  return {
    rootDir: nuxt.options.rootDir,
    // Same order as build translation merge: extends first, project last (wins).
    rootDirs: nuxt.options._layers.map((layer) => layer.config.rootDir).reverse(),
    debug: options.debug ?? false,
    locales: locales ?? [],
    fallbackLocale: options.fallbackLocale ?? undefined,
    translationDir: options.translationDir ?? 'locales',
    additionalTranslationDirs: options.additionalTranslationDirs ?? [],
    customRegexMatcher: options.customRegexMatcher instanceof RegExp ? options.customRegexMatcher.source : options.customRegexMatcher,
    routesLocaleLinks: options.routesLocaleLinks ?? {},
    apiBaseUrl: apiConfig.apiBaseUrl,
    apiBaseClientHost: apiConfig.apiBaseClientHost,
    apiBaseServerHost: apiConfig.apiBaseServerHost,
    serverTranslationPreload: options.serverTranslationPreload ?? false,
    payloadFsDir,
    payloadPublicRel,
  }
}

function registerI18nTemplates(
  options: ModuleOptions,
  resolvedStrategyPath: string,
  resolvedHelpersPath: string,
  fullConfig: ReturnType<typeof buildFullConfig>,
  privateConfig: ReturnType<typeof buildPrivateConfig>,
  disabledLocales: Locale[],
) {
  let runtimeFullConfig = fullConfig

  const pluralTemplate = addTemplate({
    filename: 'i18n.plural.mjs',
    write: true,
    getContents: () => buildI18nPluralTemplate(options.plural, resolvedHelpersPath),
  })

  const strategyTemplate = addTemplate({
    filename: 'i18n.strategy.mjs',
    write: true,
    getContents: () => {
      const domains = runtimeFullConfig.locales.some((locale) => locale.baseUrl)
      return `import { ${domains ? 'DomainPathStrategy as Strategy' : 'Strategy'} } from '${resolvedStrategyPath}'

const __fullConfig = ${buildFullConfigSource(runtimeFullConfig)}
// disabled at build: no routes and not in the config, but routing must answer for their prefix
const __disabledLocales = ${JSON.stringify(disabledLocales)}

export function getI18nConfig() { return __fullConfig }

// a constant, so a build without locale domains drops their code
export const domains = ${domains}

// vue-router's Router is the adapter as is: no wrapper copying every resolve result.
// config: the config with runtime overrides (defaultLocale, disabledLocales) — routing follows them.
export function createI18nStrategy(router, config = __fullConfig) {
  return new Strategy({
    strategy: config.strategy,
    defaultLocale: config.defaultLocale,
    locales: [...config.locales, ...__disabledLocales],
    localizedRouteNamePrefix: config.localizedRouteNamePrefix,
    router,
    hashMode: config.hashMode,
    disablePageLocales: config.disablePageLocales,
    customRegexMatcher: config.customRegexMatcher,${domains ? '\n    domain: config.domain,\n    linkLocales: config.linkLocales,' : ''}
  })
}
`
    },
  })

  const configTemplate = addTemplate({
    filename: 'i18n.config.mjs',
    write: true,
    getContents: () => `const __privateConfig = ${JSON.stringify(privateConfig)}
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
    // Vite environment hotUpdate (HMR) and NuxtPage's ~transitionPromise
    compatibility: { nuxt: '>=3.18.0' },
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
    additionalTranslationDirs: [],
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
      // Do not default publicAssets here — Nuxt deep-merges nested defaults and would
      // force publicAssets:true even for mode:'source' (resolveTranslationPayloadOptions
      // sets publicAssets false in source mode unless explicitly opted in).
      prerenderRoutes: false,
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
    trustForwardedHost: false,
    hreflangBaseLanguage: false,
    httpCacheDuration: 31536000,
  },
  async setup(options, nuxt) {
    const defaultLocale = process.env.DEFAULT_LOCALE ?? options.defaultLocale ?? 'en'
    const isSSG = Boolean(nuxt.options.nitro?.static)
    const logger = useLogger('nuxt-i18n-micro')

    // pnpm (shamefully-hoist=false) nests `@i18n-micro/types` under this package, so
    // `declare module '@i18n-micro/types'` from the app would not merge with the same
    // package `$t` resolves. Nuxt's typescript.hoist adds compilerOptions.paths aliases.
    nuxt.options.typescript.hoist ||= []
    for (const pkg of ['@i18n-micro/types', '@i18n-micro/path-strategy'] as const) {
      if (!nuxt.options.typescript.hoist.includes(pkg)) {
        nuxt.options.typescript.hoist.push(pkg)
      }
    }

    // defu drops a null, so `options` cannot tell an opt-out from "not set": read the user's config.
    // ponytail: a null in `modules: [[name, opts]]` or under a layer's i18n block is still lost that way.
    const cookieOptOut = (nuxt.options as { i18n?: ModuleOptions }).i18n?.localeCookie === null
    if (options.strategy === 'no_prefix' && !options.localeCookie && !cookieOptOut) {
      options.localeCookie = 'user-locale'
      logger.info("Strategy 'no_prefix': localeCookie automatically set to 'user-locale' for locale persistence.")
    }
    // info, not warn: this is the default configuration, so a warning fired for every app
    if (options.strategy !== 'no_prefix' && options.redirects !== false && !options.localeCookie) {
      logger.info(
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
    // Fingerprint only when `dateBuild` is unset. Explicit `0`/`''` opts out of busting and
    // must not pay for a full JSON walk (`??` keeps those values).
    const translationsHash =
      options.dateBuild === undefined ? hashTranslationSources(rootDirs, translationDirName, options.additionalTranslationDirs) : null
    const translationPayloads = resolveTranslationPayloadOptions(options)
    // Public / Edge embed use the same tree: premerged matrix or compact source (`mode`).
    const publicAssetsDir = translationPayloads.mode === 'source' ? sourceLocalesDir : mergedLocalesDir

    for (const warning of getTranslationPayloadMisconfigurationWarnings({
      translationPayloads,
      apiBaseClientHost: options.apiBaseClientHost,
      apiBaseServerHost: options.apiBaseServerHost,
    })) {
      logger.warn(warning.replace('[nuxt-i18n-micro] ', ''))
    }

    if (
      !translationPayloads.serverAssets &&
      !translationPayloads.publicAssets &&
      !(process.env.NUXT_I18N_APP_BASE_SERVER_HOST ?? options.apiBaseServerHost)
    ) {
      throw new Error(
        'nuxt-i18n-micro: local SSR payloads are disabled (serverAssets/publicAssets false) and apiBaseServerHost is not set. ' +
          'SSR would load empty translations.',
      )
    }

    // Skip build-time disabled locales — do not emit public/{apiBaseUrl}/…/data.json for them.
    // Nuxt/defu concatenates `locales` arrays project first, so dedupe by code: the first value wins (as in RouteGenerator).
    // Runtime disabledLocales cannot un-publish files already copied to public/.
    const localeInfosByCode = new Map<string, PreMergeLocaleInfo & { disabled?: boolean }>()
    for (const locale of options.locales ?? []) {
      if (typeof locale === 'string') {
        if (!localeInfosByCode.has(locale)) localeInfosByCode.set(locale, { code: locale })
        continue
      }
      const prev = localeInfosByCode.get(locale.code)
      localeInfosByCode.set(locale.code, {
        code: locale.code,
        fallbackLocale: prev?.fallbackLocale ?? locale.fallbackLocale,
        disabled: prev?.disabled ?? locale.disabled,
      })
    }
    const localeInfos: PreMergeLocaleInfo[] = [...localeInfosByCode.values()]
      .filter((locale) => !locale.disabled)
      .map(({ code, fallbackLocale }) => ({ code, fallbackLocale }))

    nuxt.hook('build:before', async () => {
      // `publicAssetsDir` / Nitro `serverAssets` point at source OR merged — never both.
      // Building i18n-source in premerged mode was unused disk/CPU (Edge embeds publicAssetsDir).
      if (translationPayloads.mode === 'source') {
        await buildTranslationSourceLayers(rootDirs, translationDirName, sourceLocalesDir, options.additionalTranslationDirs)
        logger.info(`Built compact translation source from ${rootDirs.length} layer(s) into ${sourceLocalesDir}`)
      } else {
        await preMergeLocales(
          rootDirs,
          translationDirName,
          mergedLocalesDir,
          localeInfos,
          options.fallbackLocale,
          options.disablePageLocales,
          options.additionalTranslationDirs,
        )
        logger.info(`Pre-merged translations from ${rootDirs.length} layer(s) into ${mergedLocalesDir}`)
      }

      const payloadStats = scanTranslationPayloadDirectory(publicAssetsDir)
      const sizeWarning = getTranslationPayloadSizeWarning(payloadStats, resolveTranslationPayloadWarningThresholds(options.translationPayloads))
      if (sizeWarning) {
        logger.warn(sizeWarning.replace('[nuxt-i18n-micro] ', ''))
      }
    })

    const routeLocales: Record<string, string[]> = { ...(options.routeLocales ?? {}) }
    const globalLocaleRoutes: GlobalLocaleRoutes = {}
    const routeDisableMeta: Record<string, boolean | string[]> = { ...(options.routeDisableMeta ?? {}) }

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

    const resolvedStrategyPath = await resolveStrategyPath()
    const resolvedHelpersPath = await resolveHelpersPath()

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
    // Public copy lands under apiBaseUrl so static hosts serve the same paths the client fetches.
    const payloadPublicRel = resolveTranslationPayloadPublicRel(options, apiBaseUrl)

    const routeGenerator = new RouteGenerator({
      locales: options.locales ?? [],
      defaultLocaleCode: defaultLocale,
      strategy: options.strategy!,
      globalLocaleRoutes: mergedGlobalLocaleRoutes,
      routeLocales,
      routeDisableMeta,
      noPrefixRedirect: options.noPrefixRedirect!,
      excludePatterns: options.excludePatterns,
      apiBaseUrl,
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
      locales: routeGenerator.locales ?? [],
      translationsHash,
    })

    // `nuxt generate` has no real request: this variable is the host of the run
    const generateDomain = process.env.NUXT_I18N_DOMAIN
    const buildConfig = generateDomain ? configForHost(fullConfig as ModuleOptionsExtend, generateDomain) : (fullConfig as ModuleOptionsExtend)
    if (generateDomain && !buildConfig.domain)
      logger.warn(`NUXT_I18N_DOMAIN "${generateDomain}" is no host of locales[].baseUrl: the build config applies.`)
    if (isSSG && !generateDomain && routeGenerator.locales.some((locale) => locale.baseUrl)) {
      logger.warn(
        'locales[].baseUrl in a static build without NUXT_I18N_DOMAIN: the build config applies, and locales with a baseUrl are links. Generate once per domain.',
      )
    }

    const privateConfig = buildPrivateConfig(options, nuxt, apiConfig, routeGenerator.locales ?? [], publicAssetsDir, payloadPublicRel)
    const templates = registerI18nTemplates(
      options,
      resolvedStrategyPath,
      resolvedHelpersPath,
      fullConfig,
      privateConfig,
      routeGenerator.disabledLocales,
    )

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

    // 05, 02 and 06 read what the loader plugin provides: `plugin: false` leaves them nothing to run on
    if (options.plugin && options.hooks) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/05.hooks'),
        name: 'i18n-plugin-hooks',
        order: 1,
      })
    }

    if (options.plugin && options.meta) {
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

    if (nuxt.options.dev && options.plugin !== false && options.vueDevtools !== false) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/04.vue-devtools'),
        name: 'i18n-vue-devtools',
        mode: 'client',
        order: 5,
      })
    }

    if (options.plugin) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/06.redirect'),
        mode: 'server',
        name: 'i18n-plugin-redirect',
        order: 10,
      })
    }

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
      // A translation file is imported by nothing, so Vite would full-reload on every edit: swallow
      // the update and tell the client plugin to reload its dictionaries (the dev server reads the
      // live files). Same roots as the Nitro watcher: every layer's translationDir + additional dirs.
      const translationDirs = resolveLiveTranslationDirs({
        rootDirs,
        translationDir: options.translationDir || 'locales',
        additionalTranslationDirs: options.additionalTranslationDirs,
      })
      addVitePlugin(
        {
          name: 'i18n-micro:translations-hmr',
          hotUpdate({ file }) {
            if (this.environment.name !== 'client' || !translationRelativePath(file, translationDirs)) return
            this.environment.hot.send({ type: 'custom', event: TRANSLATIONS_HMR_EVENT })
            return []
          },
        },
        { server: false },
      )
      const tpl = addTemplate({
        filename: 'i18n.hmr.mjs',
        write: true,
        getContents: () => generateHmrPlugin(),
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
        getContents: () => `import type { ModuleOptionsExtend, Translations } from '@i18n-micro/types'

declare module 'h3' {
  interface H3EventContext {
    i18n?: {
      locale: string
      translations: Translations
      /** Loads a chunk for this request's render (the server loader, no HTTP round trip). */
      load?: (locale: string, routeName: string) => Promise<Translations>
      /** The module config with runtime overrides, resolved once for this request. */
      config?: ModuleOptionsExtend
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
import type { Router } from 'vue-router'

/** The app's vue-router: createI18nStrategy reads hasRoute, resolve and getRoutes from it. */
type I18nStrategyRouter = Pick<Router, 'hasRoute' | 'resolve' | 'getRoutes'>

declare module '#build/i18n.plural.mjs' {
  export function plural(key: string, count: number, params: Params, locale: string, getter: Getter): string | null
}

declare module '#build/i18n.strategy.mjs' {
  export const domains: boolean
  export function getI18nConfig(): ModuleOptionsExtend
  export function createI18nStrategy(router: I18nStrategyRouter, config?: ModuleOptionsExtend): PathStrategy
}

declare module '#i18n-internal/config' {
  export function getI18nPrivateConfig(): ModulePrivateOptionsExtend
}

declare module '#i18n-internal/strategy' {
  export const domains: boolean
  export function getI18nConfig(): ModuleOptionsExtend
  export function createI18nStrategy(router: I18nStrategyRouter, config?: ModuleOptionsExtend): PathStrategy
}

declare module '#i18n-internal/plural' {
  export const plural: PluralFunc
}

declare module '#i18n-internal/payload-source' {
  export function readPayload(relPath: string): Promise<Record<string, unknown>>
}
`
      },
    })

    /** The localized pages, as the app's router will hold them: prerender asks the runtime strategy about them. */
    let generatedPages: NuxtPage[] = []
    /** The pages as written, without params: generate seeds every locale of them, linked or not. */
    let staticPaths: string[] = []
    const createBuildStrategy = () =>
      createLocalizedPathResolver(generatedPages, {
        strategy: options.strategy!,
        defaultLocale: buildConfig.defaultLocale!,
        locales: buildConfig.locales!,
        domain: buildConfig.domain,
        linkLocales: buildConfig.linkLocales,
        localizedRouteNamePrefix: options.localizedRouteNamePrefix,
        customRegexMatcher: fullConfig.customRegexMatcher as string | undefined,
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
      staticPaths = staticPagePaths(pages)
      routeGenerator.extendPages(pages)
      generatedPages = pages
    })

    if (options.disablePageLocales) {
      nuxt.hook('build:before', () => addDataRoutes([] as NuxtPage[]))
    }

    // unplugin@3 types `.vite()` against Vite 8; Nuxt kit still expects Vite 7 Plugin — runtime-compatible.
    addVitePlugin(
      createDefineI18nRoutePlugin({
        buildDir: nuxt.options.buildDir,
        rootDirs,
      }).vite() as Parameters<typeof addVitePlugin>[0],
    )

    const { pluralTemplate, strategyTemplate, configTemplate } = templates

    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {}
      nitroConfig.alias['#i18n-internal/plural'] = pluralTemplate.dst
      nitroConfig.alias['#i18n-internal/strategy'] = strategyTemplate.dst
      nitroConfig.alias['#i18n-internal/config'] = configTemplate.dst

      // Read public/ via fs (no Rollup raw:). Also what dev and the prerenderer use: it is rebuilt
      // from this config. `nitro:init` switches the deployed server once the preset is resolved.
      nitroConfig.alias['#i18n-internal/payload-source'] = resolver.resolve('./runtime/server/payload-source.fs')

      nitroConfig.plugins = nitroConfig.plugins || []
      if (nuxt.options.dev && (options.hmr ?? true)) {
        nitroConfig.plugins.push(resolver.resolve('./runtime/server/plugins/watcher.dev'))
      }

      nitroConfig.routeRules = nitroConfig.routeRules || {}
      const httpCacheDuration = Math.floor(options.httpCacheDuration ?? 0)
      // `null` already means "do not set a header", so the helper's own answer is the
      // condition — repeating it here is how the two drift apart.
      // `false`, deliberately: a route rule matches by path, so it also answers requests
      // that omit `?v=`. The payload handler sees the query and upgrades those that carry it.
      const cacheControl = buildTranslationPayloadCacheControl(httpCacheDuration, false)
      nitroConfig.routeRules[`/${apiBaseUrl}/**`] = {
        ...(nitroConfig.routeRules[`/${apiBaseUrl}/**`] || {}),
        ...buildTranslationPayloadRouteRule({ dev: nuxt.options.dev, cacheControl }),
      }

      const routeRules = nuxt.options.routeRules || {}

      for (const [originalPath, ruleValue] of Object.entries(routeRules)) {
        const { redirect: _redirect, ...restRuleValue } = ruleValue
        if (!Object.keys(restRuleValue).length || !shouldLocalizeRouteRulePath(originalPath)) continue

        for (const { code } of routeGenerator.locales) {
          if (!isLocaleAllowedForUnlocalizedRoute(routeGenerator.routeLocales, routeGenerator.locales, originalPath, code)) continue
          for (const localizedPath of routeGenerator.resolveLocalizedRulePaths(originalPath, code)) {
            if (localizedPath === originalPath || localizedPath === normalizePath(originalPath)) continue
            nitroConfig.routeRules![localizedPath] = { ...nitroConfig.routeRules![localizedPath], ...restRuleValue }
            logger.debug(`Replicated routeRule for ${localizedPath}: ${JSON.stringify(restRuleValue)}`)
          }
        }
      }

      nitroConfig.handlers = nitroConfig.handlers || []
      nitroConfig.handlers.unshift({
        middleware: true,
        handler: resolver.resolve('./runtime/server/middleware/i18n.global'),
      })
    })

    // The preset (and so `node` / `serveStatic`) is only resolved here, not in `nitro:config`.
    nuxt.hook('nitro:init', (nitro) => {
      // Nuxt and the crawler list every static record: on one domain those of another host are a 404 or a redirect
      if (buildConfig.domain) {
        let localize: LocalizedPathResolver | undefined
        nitro.hooks.hook('prerender:generate', async (route) => {
          localize ??= await createBuildStrategy()
          if (route.route !== '/' && localize.isPage(route.route) && !localize.isServed(route.route)) route.skip = true
        })
      }

      // Static output has no server bundle; its prerenderer keeps the fs reader.
      if (nitro.options.static) return
      const readsPublicDir = shouldReadPayloadsFromPublicDir(nitro.options)
      if (!readsPublicDir) {
        nitro.options.alias['#i18n-internal/payload-source'] = resolver.resolve('./runtime/server/payload-source.assets')
      }

      if (shouldRegisterNitroServerAssets(translationPayloads, readsPublicDir)) {
        nitro.options.serverAssets.push({
          baseName: 'i18n',
          // Same layout as public (`mode`): premerged matrix or compact source.
          dir: publicAssetsDir,
        })
        if (translationPayloads.mode === 'premerged') {
          logger.warn(
            `Preset "${nitro.options.preset}" does not ship public/ with the server, so translationPayloads.mode:"premerged" embeds the full page/locale matrix via Nitro serverAssets (Rollup raw:). ` +
              "Prefer mode:'source' for large catalogs.",
          )
        }
      }

      if (readsPublicDir && translationPayloads.serverAssets && !translationPayloads.publicAssets) {
        logger.info('translationPayloads.serverAssets: on Node, payloads are served from public/ (publicAssets copy enabled for SSR).')
      }
    })

    nuxt.hook('nitro:build:public-assets', (nitro) => {
      const isProd = nuxt.options.dev === false
      // publicAssets always; when SSR reads public/, serverAssets also forces copy (fs reader).
      // Function / Edge / serveStatic:"inline" embed only — do not force a public tree.
      const readsPublicDir = shouldReadPayloadsFromPublicDir(nitro.options)
      const copyPublicPayloads = shouldCopyTranslationPayloadsToPublic(translationPayloads, readsPublicDir)

      if (isProd && copyPublicPayloads) {
        const publicDir = resolveTranslationPayloadPublicDir(nitro.options.output.publicDir, options, apiBaseUrl)

        try {
          if (existsSync(publicAssetsDir)) {
            // a per-domain generate publishes that domain's locales only (premerged layout: <page>/<locale>/)
            const foreign = new Set(
              (buildConfig.linkLocales ?? []).map((l) => l.code).filter((code) => !buildConfig.locales!.some((l) => l.code === code)),
            )
            const published = (source: string) => !foreign.has(basename(source)) || basename(dirname(source)) === basename(publicAssetsDir)
            fs.cpSync(publicAssetsDir, publicDir, { recursive: true, filter: published })
            logger.log(`Translation payloads copied to public directory`)

            const compressed = compressTranslationPayloads(publicDir, nitro.options.compressPublicAssets)
            if (compressed > 0) {
              logger.log(`Compressed ${compressed} translation payload file(s)`)
            }
          } else {
            logger.warn(`Translation assets directory not found: ${publicAssetsDir}`)
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
      // the same router and strategy the app runs: custom paths, `false` pages and routeLocales as generated
      const localize = await createBuildStrategy()
      const prerendered = (route: string) => routeRules[route]?.prerender !== false

      // Static generation needs an entry point the crawler can actually follow.
      // With `prefix`, `/` only answers with a redirect to `/<defaultLocale>`:
      // Nitro writes the redirect stub but never enqueues its target, so nothing
      // beyond the explicitly listed routes is prerendered. Seed the localized
      // roots instead (never `/` itself in an SSR build — prerendering that would
      // shadow the dynamic handler with a static redirect).
      if (isSSG) {
        // `/` itself is kept so a static host still answers the bare root (the redirect stub).
        if (prerendered('/')) routesSet.add('/')
        // a page's path as written need not be served (`/page` with `en: '/page/:id'`, anything under `prefix`)
        for (const path of staticPaths) {
          if (prerendered(path) && localize.isServed(path)) routesSet.add(path)
          for (const { code } of buildConfig.locales!) {
            const localized = prerendered(path) ? localize.path(path, code) : null
            if (localized && prerendered(localized)) routesSet.add(localized)
          }
        }
        for (const locale of buildConfig.locales!) {
          const localizedRoot = localize.path('/', locale.code)
          if (localizedRoot && prerendered(localizedRoot)) routesSet.add(localizedRoot)
        }
      }

      for (const route of routesSet) {
        if (isInternalPath(route, options.excludePatterns, apiBaseUrl)) routesSet.delete(route)
      }

      for (const route of routesSet) {
        if (/\.[a-z0-9]+$/i.test(route) || !prerendered(route) || localize.localeOf(route)) continue
        for (const locale of buildConfig.locales!) {
          const localizedRoute = localize.path(route, locale.code)
          if (localizedRoute && prerendered(localizedRoute)) additionalRoutes.add(localizedRoute)
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
          // `/` (the redirect stub), unlocalized pages and non-page routes (API, files) are served without a prefix
          if (route === '/' || route === '' || localize.localeOf(route) || localize.isUnlocalized(route) || !localize.isPage(route)) continue
          routesSet.delete(route)
          deleted.push(route)
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

/**
 * App (runtime) hooks: `nuxtApp.hook('i18n:register', …)` in a Nuxt plugin. nuxt-module-build
 * merges `ModuleRuntimeHooks` into `RuntimeNuxtHooks` (a `ModuleHooks` export would land in the
 * build-time `NuxtHooks`).
 */
export interface ModuleRuntimeHooks {
  'i18n:register': (registerModule: (translations: unknown, locale?: string) => void, locale: string) => HookResult
}

// for apps that load the module from source (playground, fixtures): no generated types.d.mts there
declare module '#app' {
  interface RuntimeNuxtHooks extends ModuleRuntimeHooks {}
}

export type { Locale, PluralFunc, ModuleOptions, GlobalLocaleRoutes, Getter, LocaleCode, PluginsInjections, Strategies }
