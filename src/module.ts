import path, { join } from 'node:path'
import fs, { readFileSync } from 'node:fs'
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
import type { ModuleOptions, Locale, PluralFunc, GlobalLocaleRoutes, Getter, LocaleCode, Strategies } from '@i18n-micro/types'
import {
  isNoPrefixStrategy,
  withPrefixStrategy,
  defaultPlural,
} from '@i18n-micro/core'
import { setupDevToolsUI } from './devtools'
import { RouteGenerator, isInternalPath, normalizePath } from '@i18n-micro/route-strategy'
import type { PluginsInjections } from './runtime/plugins/01.plugin'
import { generateHmrPlugin } from './hmr-plugin'
import { extractDefineI18nRouteData } from './utils'
import { globby } from 'globby'

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
    types: true,
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    translationDir: 'locales',
    autoDetectPath: '/',
    autoDetectLanguage: true,
    disablePageLocales: false,
    disableWatcher: false,
    // previousPageFallback and hmr are now main options (not experimental)
    noPrefixRedirect: false,
    includeDefaultLocaleRoute: undefined,
    fallbackLocale: undefined,
    localeCookie: null,
    apiBaseUrl: '_locales',
    apiBaseClientHost: undefined,
    apiBaseServerHost: undefined,
    routesLocaleLinks: {},
    globalLocaleRoutes: {},
    canonicalQueryWhitelist: ['page', 'sort', 'filter', 'search', 'q', 'query', 'tag'],
    plural: defaultPlural,
    customRegexMatcher: undefined,
    excludePatterns: undefined,
    localizedRouteNamePrefix: 'localized-',
    missingWarn: true,
  },
  async setup(options, nuxt) {
    const defaultLocale = process.env.DEFAULT_LOCALE ?? options.defaultLocale ?? 'en'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isSSG = nuxt.options.nitro.static ?? (nuxt.options as any)._generate ?? false /* TODO: remove in future */

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

    // For no_prefix strategy, localeCookie is required - set default if not provided
    if (options.strategy === 'no_prefix' && !options.localeCookie) {
      options.localeCookie = 'user-locale'
      logger.info('Strategy \'no_prefix\': localeCookie automatically set to \'user-locale\' for locale persistence.')
    }

    const resolver = createResolver(import.meta.url)
    const rootDirs = nuxt.options._layers.map(layer => layer.config.rootDir).reverse()

    // Extract routeLocales and localeRoutes from pages before creating template
    const routeLocales: Record<string, string[]> = {}
    const globalLocaleRoutes: GlobalLocaleRoutes = {}
    const routeDisableMeta: Record<string, boolean | string[]> = {}

    // Find all page files (both pages/ and app/pages/)
    const pageFiles = await globby(['pages/**/*.vue', 'app/pages/**/*.vue'], { cwd: nuxt.options.rootDir })

    for (const pageFile of pageFiles) {
      const fullPath = join(nuxt.options.rootDir, pageFile)
      try {
        const fileContent = readFileSync(fullPath, 'utf-8')
        const config = extractDefineI18nRouteData(fileContent, fullPath)

        if (!config) continue

        const { locales: extractedLocales, localeRoutes, disableMeta } = config

        // Convert file path to route path (handle both pages/ and app/pages/).
        // No leading slash so keys match route-generator (extractLocalizedPaths, createLocalizedVariants).
        const raw = pageFile
          .replace(/^(app\/)?pages\//, '')
          .replace(/\/index\.vue$/, '')
          .replace(/\.vue$/, '')
          .replace(/\/$/, '')
        const routePath = raw === '' || raw === 'index' ? '/' : raw

        if (extractedLocales) {
          if (Array.isArray(extractedLocales)) {
            routeLocales[routePath] = extractedLocales
          }
          else if (typeof extractedLocales === 'object') {
            routeLocales[routePath] = Object.keys(extractedLocales)
          }
        }

        if (localeRoutes) {
          // Use routePath as key for globalLocaleRoutes to match with RouteGenerator logic
          globalLocaleRoutes[routePath] = localeRoutes
        }

        if (disableMeta !== undefined) {
          routeDisableMeta[routePath] = disableMeta
        }
      }
      catch {
        // Ignore files that can't be read
      }
    }

    // Merge extracted localeRoutes with options.globalLocaleRoutes so user options (e.g. unlocalized: false) take precedence
    const mergedGlobalLocaleRoutes = { ...globalLocaleRoutes, ...options.globalLocaleRoutes }
    if (options.debug) {
      logger.debug('[i18n module] mergedGlobalLocaleRoutes keys:', Object.keys(mergedGlobalLocaleRoutes))
      logger.debug('[i18n module] mergedGlobalLocaleRoutes["unlocalized"]:', mergedGlobalLocaleRoutes['unlocalized'])
      logger.debug('[i18n module] strategy:', options.strategy)
    }

    // Path-strategy: use direct dist path to avoid subpath exports issues in some environments (e.g., Cloudflare)
    const strategyDistPaths: Record<Strategies, string> = {
      no_prefix: '@i18n-micro/path-strategy/dist/no-prefix-strategy.mjs',
      prefix: '@i18n-micro/path-strategy/dist/prefix-strategy.mjs',
      prefix_except_default: '@i18n-micro/path-strategy/dist/prefix-except-default-strategy.mjs',
      prefix_and_default: '@i18n-micro/path-strategy/dist/prefix-and-default-strategy.mjs',
    }
    const selectedStrategyPath = strategyDistPaths[options.strategy!] ?? strategyDistPaths.prefix_except_default

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
      // Redirect/404 logic is in server/middleware/redirect.ts; no fallback route component.
      fallbackRedirectComponentPath: undefined,
    })

    const pluralTemplate = addTemplate({
      filename: 'i18n.plural.mjs',
      write: true,
      getContents: () => `export const plural = ${options.plural!.toString()};`,
    })

    let apiBaseClientHost = process.env.NUXT_I18N_APP_BASE_CLIENT_HOST ?? options.apiBaseClientHost ?? undefined
    if (apiBaseClientHost && apiBaseClientHost.endsWith('/')) {
      apiBaseClientHost = apiBaseClientHost.slice(0, -1)
    }
    let apiBaseServerHost = process.env.NUXT_I18N_APP_BASE_SERVER_HOST ?? options.apiBaseServerHost ?? undefined
    if (apiBaseServerHost && apiBaseServerHost.endsWith('/')) {
      apiBaseServerHost = apiBaseServerHost.slice(0, -1)
    }
    const rawUrl = process.env.NUXT_I18N_APP_BASE_URL ?? options.apiBaseUrl ?? '_locales'
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      throw new Error('Nuxt-i18n-micro: Please use NUXT_I18N_APP_BASE_CLIENT_HOST or NUXT_I18N_APP_BASE_SERVER_HOST instead.')
    }
    const apiBaseUrl = rawUrl.replace(/^\/+|\/+$|\/{2,}/, '')

    const fullConfig = {
      locales: routeGenerator.locales ?? [],
      metaBaseUrl: options.metaBaseUrl ?? undefined,
      defaultLocale: defaultLocale,
      fallbackLocale: options.fallbackLocale ?? undefined,
      localeCookie: options.localeCookie ?? null,
      autoDetectLanguage: options.autoDetectLanguage ?? true,
      autoDetectPath: options.autoDetectPath ?? '/',
      strategy: options.strategy ?? 'prefix_except_default',
      dateBuild: Date.now(),
      hashMode: nuxt.options?.router?.options?.hashMode ?? false,
      apiBaseUrl,
      apiBaseClientHost,
      apiBaseServerHost,
      isSSG,
      disablePageLocales: options.disablePageLocales ?? false,
      canonicalQueryWhitelist: options.canonicalQueryWhitelist ?? [],
      excludePatterns: options.excludePatterns ?? [],
      routeLocales,
      routeDisableMeta: routeDisableMeta,
      globalLocaleRoutes: mergedGlobalLocaleRoutes,
      missingWarn: options.missingWarn ?? true,
      previousPageFallback: options.previousPageFallback ?? false,
      hmr: options.hmr ?? true,
      localizedRouteNamePrefix: options.localizedRouteNamePrefix ?? 'localized-',
      routesLocaleLinks: options.routesLocaleLinks ?? {},
      noPrefixRedirect: options.noPrefixRedirect ?? false,
      debug: options.debug ?? false,
      customRegexMatcher: options.customRegexMatcher instanceof RegExp
        ? options.customRegexMatcher.source
        : options.customRegexMatcher,
    }

    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {}
    ;(nuxt.options.runtimeConfig.public as Record<string, unknown>).i18nConfig = fullConfig

    const fullConfigJson = JSON.stringify(fullConfig)
    const strategyTemplate = addTemplate({
      filename: 'i18n.strategy.mjs',
      write: true,
      getContents: () => `import { Strategy } from '${selectedStrategyPath}'

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
  })
}
`,
    })

    // Конфигурация i18n только в #build/i18n.strategy.mjs (getI18nConfig, createI18nStrategy). runtimeConfig.public.i18nConfig не используется.

    // if there is a customRegexMatcher set and all locales don't match the custom matcher, throw error
    if (typeof options.customRegexMatcher !== 'undefined') {
      const localeCodes = routeGenerator.locales.map(l => l.code)
      if (!localeCodes.every(code => code.match(options.customRegexMatcher as string | RegExp))) {
        throw new Error('Nuxt-18n-micro: Some locale codes does not match customRegexMatcher')
      }
    }

    const privateConfig = {
      rootDir: nuxt.options.rootDir,
      rootDirs,
      debug: options.debug ?? false,
      fallbackLocale: options.fallbackLocale ?? undefined,
      translationDir: options.translationDir ?? 'locales',
      customRegexMatcher: options.customRegexMatcher instanceof RegExp
        ? options.customRegexMatcher.source
        : options.customRegexMatcher,
      routesLocaleLinks: options.routesLocaleLinks ?? {},
      apiBaseUrl,
      apiBaseClientHost,
      apiBaseServerHost,
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

    // Client-only: redirect / to /locale when useState('i18n-locale') or cookie set (Nitro runs before Nuxt, so server doesn't see them).
    addPlugin({
      src: resolver.resolve('./runtime/plugins/06.client-redirect.client'),
      mode: 'client',
      name: 'i18n-plugin-client-redirect',
      order: 10,
    })

    addServerHandler({
      route: `/${apiBaseUrl}/:page/:locale/data.json`,
      handler: resolver.resolve('./runtime/server/routes/i18n'),
    })

    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      pathPrefix: false,
      extensions: ['vue'],
    })

    // HMR for translations
    if (nuxt.options.dev && (options.hmr ?? true)) {
      const translationsDir = join(nuxt.options.rootDir, options.translationDir || 'locales')
      const files = await globby(['**/*.json'], { cwd: translationsDir, absolute: true })
      const tpl = addTemplate({
        filename: 'i18n.hmr.mjs',
        write: true,
        getContents: () => generateHmrPlugin(files.map(f => f.replace(/\\/g, '/'))),
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

    // Типы для #build/* и #i18n-internal/* (подключается в .nuxt/types/, nuxt.d.ts)
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
      const pagesForDataRoutes = pages.filter(
        p => p.name !== undefined && (!options.routesLocaleLinks || !options.routesLocaleLinks[p.name!]),
      )
      const dataRoutes = routeGenerator.generateDataRoutes(pagesForDataRoutes, apiBaseUrl, !!options.disablePageLocales)
      addPrerenderRoutes(dataRoutes)
    }

    nuxt.hook('pages:resolved', (pages) => {
      const pagesNames = pages
        .map(page => page.name)
        .filter((name): name is string => name !== undefined && (!options.routesLocaleLinks || !options.routesLocaleLinks[name]))

      if (!options.disableWatcher) {
        routeGenerator.ensureTranslationFilesExist(pagesNames, options.translationDir!, nuxt.options.rootDir, options.disablePageLocales)
      }

      addDataRoutes(pages)
      routeGenerator.extendPages(pages)
    })

    // When pages: false, pages:resolved may not run — ensure general data routes are added
    if (options.disablePageLocales) {
      nuxt.hook('build:before', () => addDataRoutes([] as NuxtPage[]))
    }

    // Алиасы #i18n-internal/* для Vite (плагины/рантайм резолвят при сборке)
    nuxt.hook('vite:extendConfig', (viteConfig) => {
      const resolve = viteConfig.resolve ?? {}
      ;(viteConfig as { resolve: typeof resolve }).resolve = resolve
      const alias = resolve.alias || {}
      resolve.alias = Array.isArray(alias)
        ? [...alias, { find: '#i18n-internal/plural', replacement: pluralTemplate.dst }, { find: '#i18n-internal/strategy', replacement: strategyTemplate.dst }, { find: '#i18n-internal/config', replacement: configTemplate.dst }]
        : { ...alias, '#i18n-internal/plural': pluralTemplate.dst, '#i18n-internal/strategy': strategyTemplate.dst, '#i18n-internal/config': configTemplate.dst }
    })

    nuxt.hook('nitro:config', (nitroConfig) => {
      // Алиасы для Nitro: префикс #i18n-internal (не #build), чтобы Nitro/Rollup не блокировали
      nitroConfig.alias = nitroConfig.alias || {}
      nitroConfig.alias['#i18n-internal/plural'] = pluralTemplate.dst
      nitroConfig.alias['#i18n-internal/strategy'] = strategyTemplate.dst
      nitroConfig.alias['#i18n-internal/config'] = configTemplate.dst

      // Монтируем директории переводов как серверные ассеты.
      // Это критично для поддержки serverless (Cloudflare Workers), где нет прямого доступа к FS.
      nitroConfig.serverAssets = nitroConfig.serverAssets || []
      rootDirs.forEach((dir, index) => {
        const dirPath = path.resolve(dir, options.translationDir || 'locales')
        if (fs.existsSync(dirPath)) {
          nitroConfig.serverAssets!.push({
            // Даем уникальное имя каждому слою, чтобы потом найти их в рантайме
            baseName: `i18n_layer_${index}`,
            dir: dirPath,
          })
        }
      })

      if (nitroConfig.imports) {
        nitroConfig.imports.presets = nitroConfig.imports.presets || []
        nitroConfig.imports.presets.push({
          from: resolver.resolve('./runtime/server/utils/translation-server-middleware'),
          imports: ['useTranslationServerMiddleware'],
        })
        nitroConfig.imports.presets.push({
          from: resolver.resolve('./runtime/server/utils/locale-server-middleware'),
          imports: ['useLocaleServerMiddleware'],
        })
      }

      const routeRules = nuxt.options.routeRules || {}
      const strategy = options.strategy! as Strategies

      if (routeRules && Object.keys(routeRules).length && !isNoPrefixStrategy(strategy)) {
        nitroConfig.routeRules = nitroConfig.routeRules || {}

        for (const [originalPath, ruleValue] of Object.entries(routeRules)) {
          if (originalPath.startsWith('/api')) continue

          routeGenerator.locales.forEach((localeObj) => {
            const localeCode = localeObj.code
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

    nuxt.hook('nitro:config', (nitroConfig) => {
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

    nuxt.hook('prerender:routes', async (prerenderRoutes) => {
      if (isNoPrefixStrategy(options.strategy!)) {
        return
      }

      const routesSet = prerenderRoutes.routes
      const routeRules = nuxt.options.routeRules || {}
      const additionalRoutes = new Set<string>()

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

        for (const locale of routeGenerator.locales) {
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
        const localeCodes = new Set(routeGenerator.locales.map(l => l.code))
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
