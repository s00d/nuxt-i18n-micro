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
import type { HookResult } from '@nuxt/schema'
import type { ModuleOptions, ModuleOptionsExtend, ModulePrivateOptionsExtend, Locale, PluralFunc, GlobalLocaleRoutes, Getter, LocaleCode, Strategies } from '@i18n-micro/types'
import {
  isNoPrefixStrategy,
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
  interface PublicRuntimeConfig {
    i18nConfig: ModuleOptionsExtend
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
    // experimental kept in runtimeConfig only to avoid type drift here
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

    // Merge options.globalLocaleRoutes with extracted localeRoutes
    const mergedGlobalLocaleRoutes = { ...options.globalLocaleRoutes, ...globalLocaleRoutes }

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
      fallbackRedirectComponentPath: resolver.resolve('./runtime/components/locale-redirect.vue'),
    })

    addTemplate({
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

    nuxt.options.runtimeConfig.public.i18nConfig = {
      locales: routeGenerator.locales ?? [],
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      metaBaseUrl: options.metaBaseUrl ?? undefined,
      defaultLocale: defaultLocale,
      fallbackLocale: options.fallbackLocale ?? undefined,
      localeCookie: options.localeCookie ?? null,
      autoDetectPath: options.autoDetectPath ?? '/',
      strategy: options.strategy ?? 'prefix_except_default',
      dateBuild: Date.now(),
      hashMode: nuxt.options?.router?.options?.hashMode ?? false,
      apiBaseUrl: apiBaseUrl,
      apiBaseClientHost: apiBaseClientHost,
      apiBaseServerHost: apiBaseServerHost,
      isSSG: isSSG,
      disablePageLocales: options.disablePageLocales ?? false,
      canonicalQueryWhitelist: options.canonicalQueryWhitelist ?? [],
      excludePatterns: options.excludePatterns ?? [],
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      routeLocales: routeLocales,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      routeDisableMeta: routeDisableMeta,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      globalLocaleRoutes: mergedGlobalLocaleRoutes,
      missingWarn: options.missingWarn ?? true,
      experimental: {
        i18nPreviousPageFallback: options.experimental?.i18nPreviousPageFallback ?? false,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        hmr: options.experimental?.hmr ?? true,
      },
      localizedRouteNamePrefix: options.localizedRouteNamePrefix ?? 'localized-',
    }

    // if there is a customRegexMatcher set and all locales don't match the custom matcher, throw error
    if (typeof options.customRegexMatcher !== 'undefined') {
      const localeCodes = routeGenerator.locales.map(l => l.code)
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      routesLocaleLinks: options.routesLocaleLinks ?? {},
      apiBaseUrl: apiBaseUrl,
      apiBaseClientHost: apiBaseClientHost,
      apiBaseServerHost: apiBaseServerHost,
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

    if (options.autoDetectLanguage) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/04.auto-detect'),
        mode: 'server',
        name: 'i18n-plugin-auto-detect',
        order: -15, // Execute BEFORE 01.plugin.ts (order: -5) to set locale via useState
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

    // Experimental: client HMR for translations
    if (nuxt.options.dev && (options.experimental?.hmr ?? true)) {
      const translationsDir = join(nuxt.options.rootDir, options.translationDir || 'locales')
      const files = await globby(['**/*.json'], { cwd: translationsDir, absolute: true })
      const tpl = addTemplate({
        filename: 'i18n-hmr-plugin.mjs',
        write: true,
        getContents: () => generateHmrPlugin(files.map(f => f.replace(/\\/g, '/'))),
      })
      addPlugin({
        src: tpl.dst,
        mode: 'client',
        name: 'i18n-hmr-plugin',
        order: 10,
      })
    }

    if (options.types) {
      addTypeTemplate({
        filename: 'types/i18n-plugin.d.ts',
        getContents: () => generateI18nTypes(),
      })
    }

    nuxt.hook('pages:resolved', (pages) => {
      const pagesNames = pages
        .map(page => page.name)
        .filter((name): name is string => name !== undefined && (!options.routesLocaleLinks || !options.routesLocaleLinks[name]))

      if (!options.disableWatcher) {
        routeGenerator.ensureTranslationFilesExist(pagesNames, options.translationDir!, nuxt.options.rootDir, options.disablePageLocales)
      }

      const pagesForDataRoutes = pages.filter(
        p => p.name !== undefined && (!options.routesLocaleLinks || !options.routesLocaleLinks[p.name!]),
      )
      const dataRoutes = routeGenerator.generateDataRoutes(pagesForDataRoutes, apiBaseUrl, !!options.disablePageLocales)
      addPrerenderRoutes(dataRoutes)

      routeGenerator.extendPages(pages)
    })

    nuxt.hook('nitro:config', (nitroConfig) => {
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

    // Регистрируем Nitro-плагин для инвалидирования server storage в dev
    nuxt.hook('nitro:config', (nitroConfig) => {
      if (nuxt.options.dev && (options.experimental?.hmr ?? true)) {
        nitroConfig.plugins = nitroConfig.plugins || []
        nitroConfig.plugins.push(resolver.resolve('./runtime/server/plugins/watcher.dev'))
      }
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

      for (const route of additionalRoutes) {
        routesSet.add(route)
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
    registerModule: (translations: unknown, locale?: string) => void,
    locale: string
  ) => HookResult
}

declare module '@nuxt/schema' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface NuxtHooks extends ModuleHooks {}
}

export type { Locale, PluralFunc, ModuleOptions, GlobalLocaleRoutes, Getter, LocaleCode, PluginsInjections, Strategies }
