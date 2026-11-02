import fs, { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { defaultPlural, isNoPrefixStrategy } from '@i18n-micro/core'
import { forwardSlashes, isInternalPath } from '@i18n-micro/utils/app-path'
import { generateHmrPlugin, TRANSLATIONS_HMR_EVENT } from './hmr-plugin'
import { resolveLiveTranslationDirs, translationRelativePath } from './runtime/server/internal/translation-watcher'
import { localesOutsideMatcher, RouteGenerator } from '@i18n-micro/route-strategy'
import { configForHost } from '@i18n-micro/utils/domains'
import { buildFullConfigSource, buildPrivateConfigSource } from './config-template'
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
  domainPayloadFilter,
  getStaticPayloadWarning,
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
  pathSegments,
} from './build/payload-config'
import {
  compressTranslationPayloads,
  getEmbeddedPayloadSizeWarning,
  hashTranslationSources,
  scanTranslationPayloadDirectory,
} from './build/payload-stats'
import { resolveTranslationPayloadCachePolicy } from '@i18n-micro/utils/payload-url'
import { buildI18nPluralTemplate } from './plural-template'
import {
  addComponentsDir,
  addImportsDir,
  addPlugin,
  addPluginTemplate,
  addPrerenderRoutes,
  addRouteMiddleware,
  addServerHandler,
  addServerImports,
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
import { buildTranslationPayloadRouteRule, localizeRouteRules, varyRouteCacheByHost } from './route-rules'
import {
  createLocalizedPathResolver,
  type LocalizedPathResolver,
  namedPages,
  seedPrerenderRoutes,
  staticPagePaths,
  unfixedOriginWarning,
} from './localized-paths'
import type { PluginsInjections } from './runtime/plugins/01.plugin'
import { collectDefineI18nRouteMetaFromFiles, createDefineI18nRoutePlugin, mergeDefineI18nRouteMeta } from './unplugin-define-i18n-route'
import { parentPagePaths } from './utils'

export type { TranslationPayloadMode } from './build/payload-config'

/** Absolute path of an entry a generated template imports. */
async function resolveEntry(specifier: string): Promise<string> {
  let absolutePath: string
  try {
    // Resolve relative to this module first, so pnpm layouts that nest
    // the package under nuxt-i18n-micro still resolve it.
    absolutePath = fileURLToPath(import.meta.resolve(specifier))
  } catch {
    absolutePath = await resolvePath(specifier)
  }
  return process.platform === 'win32' ? pathToFileURL(absolutePath).href : forwardSlashes(absolutePath)
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

/** Build-time half of `live`: the server adds a host named in the environment. */
function isLiveDictionary(options: ModuleOptions, mode: TranslationPayloadMode): boolean {
  return mode === 'source' || Boolean(options.cacheTtl) || Boolean(process.env.NUXT_I18N_APP_BASE_SERVER_HOST ?? options.apiBaseServerHost)
}

function buildFullConfig(params: {
  options: ModuleOptions
  nuxt: Nuxt
  defaultLocale: string
  apiConfig: NormalizedApiConfig
  translationPayloadMode: TranslationPayloadMode
  locales: ModuleOptionsExtend['locales']
  translationsHash: string | null
  publicPayloads: boolean
  rootDelta: boolean
}) {
  const { options, nuxt, defaultLocale, apiConfig, translationPayloadMode, locales, translationsHash, publicPayloads, rootDelta } = params
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
    disablePageLocales: options.disablePageLocales ?? false,
    canonicalQueryWhitelist: options.canonicalQueryWhitelist ?? DEFAULT_CANONICAL_QUERY_WHITELIST,
    excludePatterns: options.excludePatterns ?? [],
    missingWarn: options.missingWarn ?? true,
    redirects: options.redirects !== false,
    localizedRouteNamePrefix: options.localizedRouteNamePrefix ?? 'localized-',
    routesLocaleLinks: options.routesLocaleLinks ?? {},
    debug: options.debug ?? false,
    customRegexMatcher: options.customRegexMatcher instanceof RegExp ? options.customRegexMatcher.source : options.customRegexMatcher,
    cacheMaxSize: options.cacheMaxSize ?? 0,
    cacheTtl: options.cacheTtl ?? 0,
    httpCacheDuration: options.httpCacheDuration,
    httpCacheControl: options.httpCacheControl,
    numberFormats: options.numberFormats ?? {},
    datetimeFormats: options.datetimeFormats ?? {},
    timeZone: options.timeZone,
    translationPayloadMode,
    publicPayloads,
    rootDelta,
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
    cacheStorage: options.cacheStorage,
    cacheStorageBuild: nuxt.options.buildId,
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
  dev: boolean,
) {
  const pluralTemplate = addTemplate({
    filename: 'i18n.plural.mjs',
    write: true,
    getContents: () => buildI18nPluralTemplate(options.plural, resolvedHelpersPath),
  })

  const strategyTemplate = addTemplate({
    filename: 'i18n.strategy.mjs',
    write: true,
    getContents: () => {
      const domains = fullConfig.locales.some((locale) => locale.baseUrl)
      return `import { ${domains ? 'DomainPathStrategy' : 'I18nPathStrategy'} as Strategy } from '${resolvedStrategyPath}'

const __fullConfig = ${buildFullConfigSource(fullConfig)}
// disabled at build: no routes and not in the config, but routing must answer for their prefix
const __disabledLocales = ${JSON.stringify(disabledLocales)}

export function getI18nConfig() { return __fullConfig }

// a constant, so a build without locale domains drops their code
export const domains = ${domains}

// a constant, so a build that keeps the locale in no cookie drops useCookie (no runtime override reaches these two)
export const cookies = ${fullConfig.localeCookie !== null || fullConfig.hashMode}

// constants too, so a build with these options off drops their code from the loader plugin
export const hooks = ${options.hooks !== false}
export const defineRoute = ${options.define !== false}

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
    getContents: () => buildPrivateConfigSource(privateConfig, dev),
  })

  return {
    pluralTemplate,
    strategyTemplate,
    configTemplate,
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
    /** Static output, set in `nitro:init`: `nuxt build --preset static` is only known once the preset is resolved. */
    let isSSG = false
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
      options.dateBuild === undefined
        ? hashTranslationSources(
            rootDirs,
            translationDirName,
            options.additionalTranslationDirs,
            JSON.stringify([options.fallbackLocale, options.disablePageLocales, (options.locales ?? []).map((l) => [l.code, l.fallbackLocale])]),
          )
        : null
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

    /** Every named page, children too: each asks for a chunk under its own name. */
    let routeNames: string[] = []

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
          routeNames,
          // dev reads live files, and a prerender merges what it reads like any server
          !nuxt.options.dev && translationPayloads.rootDelta,
        )
        logger.info(`Pre-merged translations from ${rootDirs.length} layer(s) into ${mergedLocalesDir}`)
      }

      const payloadStats = scanTranslationPayloadDirectory(publicAssetsDir)
      const sizeWarning = getTranslationPayloadSizeWarning(payloadStats, resolveTranslationPayloadWarningThresholds(options.translationPayloads))
      if (sizeWarning) {
        logger.warn(sizeWarning.replace('[nuxt-i18n-micro] ', ''))
      }
    })

    // by `cwd`, not a joined pattern: a `\\` of a Windows path is an escape in a glob, the pattern then loses its base and
    // the scan walks everything under the working directory, through symlinks
    const pageFiles = (await Promise.all(rootDirs.map((cwd) => globby(['pages/**/*.vue', 'app/pages/**/*.vue'], { cwd, absolute: true })))).flat()

    const {
      routeLocales,
      routeDisableMeta,
      globalLocaleRoutes: mergedGlobalLocaleRoutes,
    } = mergeDefineI18nRouteMeta(collectDefineI18nRouteMetaFromFiles(pageFiles, rootDirs), options)
    if (options.debug) {
      logger.debug('[i18n module] mergedGlobalLocaleRoutes keys:', Object.keys(mergedGlobalLocaleRoutes))
      logger.debug('[i18n module] mergedGlobalLocaleRoutes["unlocalized"]:', mergedGlobalLocaleRoutes['unlocalized'])
      logger.debug('[i18n module] strategy:', options.strategy)
    }

    const resolvedStrategyPath = await resolveEntry('@i18n-micro/path-strategy')
    const resolvedHelpersPath = await resolveEntry('@i18n-micro/core/helpers')

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
    const apiBaseUrl = pathSegments(rawUrl)
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
      redirects: options.redirects,
      excludePatterns: options.excludePatterns,
      apiBaseUrl,
      localizedRouteNamePrefix: options.localizedRouteNamePrefix,
      customRegexMatcher: options.customRegexMatcher,
      parentPaths: parentPagePaths(pageFiles, rootDirs),
    })

    const fullConfig = buildFullConfig({
      options,
      nuxt,
      defaultLocale,
      apiConfig,
      translationPayloadMode: translationPayloads.mode,
      publicPayloads: translationPayloads.mode === 'premerged' && translationPayloads.publicAssets,
      rootDelta:
        !nuxt.options.dev &&
        translationPayloads.mode === 'premerged' &&
        translationPayloads.rootDelta &&
        !options.disablePageLocales &&
        (translationPayloads.publicAssets || Boolean(options.apiBaseClientHost)),
      locales: routeGenerator.locales ?? [],
      translationsHash,
    })

    // `nuxt generate` has no real request: this variable is the host of the run
    const generateDomain = process.env.NUXT_I18N_DOMAIN
    const buildConfig = generateDomain ? configForHost(fullConfig as ModuleOptionsExtend, generateDomain) : (fullConfig as ModuleOptionsExtend)
    if (generateDomain && !buildConfig.domain)
      logger.warn(`NUXT_I18N_DOMAIN "${generateDomain}" is no host of locales[].baseUrl: the build config applies.`)

    const siteUrl = (nuxt.options as { site?: { url?: string } }).site?.url || process.env.NUXT_PUBLIC_SITE_URL || process.env.NUXT_SITE_URL
    const originWarning = buildConfig.domain ? null : unfixedOriginWarning(routeGenerator.locales, defaultLocale, options.metaBaseUrl, siteUrl)
    if (originWarning) logger.warn(originWarning)

    const privateConfig = buildPrivateConfig(options, nuxt, apiConfig, routeGenerator.locales ?? [], publicAssetsDir, payloadPublicRel)
    const templates = registerI18nTemplates(
      options,
      resolvedStrategyPath,
      resolvedHelpersPath,
      fullConfig,
      privateConfig,
      routeGenerator.disabledLocales,
      nuxt.options.dev,
    )

    if (typeof options.customRegexMatcher !== 'undefined') {
      const failedCodes = localesOutsideMatcher(
        routeGenerator.locales.map((l) => l.code),
        options.customRegexMatcher,
      )
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

    // 02 and 06 read what the loader plugin provides: `plugin: false` leaves them nothing to run on
    if (options.plugin && options.meta) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/02.meta'),
        name: 'i18n-plugin-meta',
        order: 2,
      })
    }

    // A page may still call it: the build has read the call, and with no runtime there is nothing left for it to do
    if (!options.plugin && options.define) {
      addPluginTemplate({
        filename: 'i18n.define.mjs',
        getContents: () => `import { defineNuxtPlugin } from '#imports'
export default defineNuxtPlugin(() => ({ provide: { defineI18nRoute: async () => {} } }))
`,
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

    // no_prefix: no URL names a locale, so there is nothing to redirect (`getClientRedirect`)
    if (options.redirects !== false && options.plugin !== false && options.strategy !== 'no_prefix') {
      addRouteMiddleware({
        name: 'i18n-redirect',
        path: resolver.resolve('./runtime/middleware/i18n-redirect.global'),
        global: true,
      })
    }

    // By name, not the directory: every export there would be a user's auto-import, and an API.
    addServerImports([
      { name: 'useLocaleServerMiddleware', from: resolver.resolve('./runtime/server/utils/locale-server-middleware') },
      { name: 'useTranslationServerMiddleware', from: resolver.resolve('./runtime/server/utils/translation-server-middleware') },
      { name: 'loadTranslationsFromServer', from: resolver.resolve('./runtime/server/utils/server-loader') },
      { name: 'detectCurrentLocale', from: resolver.resolve('./runtime/server/utils/locale-detector') },
    ])

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
      /** Loads a chunk for this request's render (the server loader, no local HTTP round trip), or \`null\` when the host has no file for it. */
      load?: (locale: string, routeName: string) => Promise<Translations | null>
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
  export const cookies: boolean
  export const hooks: boolean
  export const defineRoute: boolean
  export function getI18nConfig(): ModuleOptionsExtend
  export function createI18nStrategy(router: I18nStrategyRouter, config?: ModuleOptionsExtend): PathStrategy
}

declare module '#i18n-internal/config' {
  export function getI18nPrivateConfig(): ModulePrivateOptionsExtend
}

declare module '#i18n-internal/strategy' {
  export const domains: boolean
  export const cookies: boolean
  export const hooks: boolean
  export const defineRoute: boolean
  export function getI18nConfig(): ModuleOptionsExtend
  export function createI18nStrategy(router: I18nStrategyRouter, config?: ModuleOptionsExtend): PathStrategy
}

declare module '#i18n-internal/plural' {
  export const plural: PluralFunc
}

declare module '#i18n-internal/payload-source' {
  export const embeddedPayloads: boolean
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
      routeNames = namedPages(pages).filter((name) => !options.routesLocaleLinks?.[name])
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
      if (!nuxt.options.dev) nitroConfig.plugins.push(resolver.resolve('./runtime/server/plugins/payload-cache'))
      if (nuxt.options.dev && (options.hmr ?? true)) {
        nitroConfig.plugins.push(resolver.resolve('./runtime/server/plugins/watcher.dev'))
      }

      nitroConfig.routeRules = nitroConfig.routeRules || {}
      // A route rule matches by path, so it also answers requests that omit `?v=`. What sees the query (the
      // payload handler, the Node plugin) sharpens it: `.file` is what any URL may be given.
      const { file: cacheControl } = resolveTranslationPayloadCachePolicy({
        httpCacheDuration: options.httpCacheDuration,
        httpCacheControl: options.httpCacheControl,
        dateBuild: fullConfig.dateBuild,
        live: isLiveDictionary(options, translationPayloads.mode),
      })
      nitroConfig.routeRules[`/${apiBaseUrl}/**`] = {
        ...(nitroConfig.routeRules[`/${apiBaseUrl}/**`] || {}),
        ...buildTranslationPayloadRouteRule({ dev: nuxt.options.dev, cacheControl }),
      }

      // under hash + prefix a prefixed URL only redirects into the hash: prerendered there, links would fetch a payload that no build writes
      const noDocuments = Boolean(buildConfig.hashMode) && options.strategy === 'prefix'
      localizeRouteRules(
        nuxt.options.routeRules || {},
        nitroConfig.routeRules,
        routeGenerator,
        (path, rule) => {
          logger.debug(`Replicated routeRule for ${path}: ${JSON.stringify(rule)}`)
        },
        noDocuments,
      )

      if (routeGenerator.locales.some((locale) => locale.baseUrl)) {
        for (const [path, rule] of Object.entries(nitroConfig.routeRules)) {
          nitroConfig.routeRules[path] = varyRouteCacheByHost(rule, Boolean(options.trustForwardedHost))
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

      isSSG = Boolean(nitro.options.static)
      // Static output has no server bundle; its prerenderer keeps the fs reader.
      if (isSSG) {
        if (!generateDomain && routeGenerator.locales.some((locale) => locale.baseUrl)) {
          logger.warn(
            'locales[].baseUrl in a static build without NUXT_I18N_DOMAIN: the build config applies, and locales with a baseUrl are links. Generate once per domain.',
          )
        }
        const staticWarning = getStaticPayloadWarning({ translationPayloads, apiBaseClientHost })
        if (staticWarning) logger.warn(staticWarning)
        return
      }
      const readsPublicDir = shouldReadPayloadsFromPublicDir(nitro.options)
      if (!readsPublicDir) {
        nitro.options.alias['#i18n-internal/payload-source'] = resolver.resolve('./runtime/server/payload-source.assets')
        if (options.cacheStorage && !apiBaseServerHost) {
          logger.info('cacheStorage: dictionaries are embedded on this preset, so the shared cache only applies with apiBaseServerHost.')
        }
      }

      if (shouldRegisterNitroServerAssets(translationPayloads, readsPublicDir)) {
        nitro.options.serverAssets.push({
          baseName: 'i18n',
          // Same layout as public (`mode`): premerged matrix or compact source.
          dir: publicAssetsDir,
        })
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

      // here, not in `nitro:init`: `build:before` has written the tree by now
      if (isProd && !isSSG && shouldRegisterNitroServerAssets(translationPayloads, readsPublicDir)) {
        const sizeWarning = getEmbeddedPayloadSizeWarning(nitro.options.preset, publicAssetsDir, translationPayloads.mode)
        if (sizeWarning) logger.warn(sizeWarning)
      }

      if (isProd && copyPublicPayloads) {
        const publicDir = resolveTranslationPayloadPublicDir(nitro.options.output.publicDir, options, apiBaseUrl)

        try {
          if (existsSync(publicAssetsDir)) {
            const filter = domainPayloadFilter({
              mode: translationPayloads.mode,
              root: publicAssetsDir,
              served: buildConfig.locales!,
              linkLocales: buildConfig.linkLocales,
              fallbackLocale: options.fallbackLocale,
            })
            fs.cpSync(publicAssetsDir, publicDir, { recursive: true, filter })
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

      const routeRules = nuxt.options.routeRules || {}
      const { added, removed } = seedPrerenderRoutes(prerenderRoutes.routes, {
        // the same router and strategy the app runs: custom paths, `false` pages and routeLocales as generated
        localize: await createBuildStrategy(),
        locales: buildConfig.locales!,
        staticPaths: isSSG ? staticPaths : null,
        strategy: options.strategy!,
        prerendered: (route) => routeRules[route]?.prerender !== false,
        isInternal: (route) => isInternalPath(route, options.excludePatterns, apiBaseUrl),
      })

      if (added.length > 0) {
        logger.debug('[i18n prerender:routes] added localized routes:', [...added].sort().join(', '))
      }
      if (removed.length > 0) {
        logger.info(`[i18n prerender:routes] removed from prerender list (no locale prefix): ${removed.join(', ')}`)
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
  // an accessor on nuxtApp, not a provide: Nuxt's types of the plugins cannot see it
  interface NuxtApp extends Pick<PluginsInjections, '$setI18nRouteParams'> {}
}

export type { Locale, PluralFunc, ModuleOptions, GlobalLocaleRoutes, Getter, LocaleCode, PluginsInjections, Strategies }
