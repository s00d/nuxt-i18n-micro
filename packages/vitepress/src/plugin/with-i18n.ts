import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Locale, Translations } from '@i18n-micro/types'
import { classifyTranslationRelativePath } from '@i18n-micro/utils/parse-path'
import type { Plugin } from 'vite'
import type { CreateI18nOptions } from '../runtime/create'
import { buildVitePressLocaleHead, relativePathToRoutePath } from '../seo/locale-head'
import { listTranslationFiles, loadTranslationBuckets } from './load-messages'
import { createI18nRoutingFromAdapter } from '../router/i18n-routing'

export interface WithI18nOptions extends CreateI18nOptions {
  /**
   * Directory with locale JSON (`en.json`, `pages/guide/demo/en.json`, …), relative to Vite root
   * (VitePress content / docs root). Used by `virtual:i18n-micro/messages`.
   * @default 'locales'
   */
  translationDir?: string
  /**
   * When true, treat `pages/**` as root-level dictionaries.
   * @default false
   */
  disablePageLocales?: boolean
  /**
   * When true, logs a warning if VitePress `locales` keys do not align with
   * configured i18n locale codes.
   * @default true
   */
  warnOnLocaleMismatch?: boolean
  /**
   * Inject `themeConfig.i18nRouting` from adapter options + `config.base`.
   * Set `false` to skip. Skipped automatically when `themeConfig.i18nRouting` is already set.
   * @default true
   */
  i18nRouting?: boolean
  /**
   * Emit i18n SEO tags via `transformHead` (canonical, hreflang, og:locale…) —
   * Nuxt `meta` / plugin `02.meta` analogue.
   * Absolute link tags require `metaBaseUrl`.
   * @default true when `metaBaseUrl` is set, otherwise false
   */
  meta?: boolean
  /**
   * Public origin without trailing slash (`https://example.com`).
   * Same role as Nuxt `metaBaseUrl`.
   */
  metaBaseUrl?: string
  /** Also emit bare-language hreflang from `iso` (Nuxt `hreflangBaseLanguage`). @default false */
  hreflangBaseLanguage?: boolean
  /** Query keys kept on canonical / alternate URLs. @default [] */
  canonicalQueryWhitelist?: string[]
}

/**
 * Minimal VitePress / Vite user config shape we merge into.
 * Avoid importing `vitepress` types so the package stays usable as a pure library dep.
 */
export interface VitePressUserConfigLike {
  base?: string
  locales?: Record<string, unknown>
  themeConfig?: Record<string, unknown> | null
  transformHead?: (...args: any[]) => any
  transformPageData?: (...args: any[]) => any
  vite?: {
    plugins?: Plugin[] | Plugin[][]
    ssr?: {
      noExternal?: string | true | Array<string | RegExp>
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface VirtualI18nConfig {
  defaultLocale: string
  fallbackLocale: string
  locales: Locale[]
  localeCodes: string[]
  missingWarn: boolean
  syncWithVitePress: boolean
  translationDir: string
  disablePageLocales: boolean
  localeKeyToCode: Record<string, string>
  /** VitePress `site.base` (normalized, trailing slash preserved from config). */
  base?: string
}

const VIRTUAL_CONFIG_ID = 'virtual:i18n-micro/config'
const RESOLVED_CONFIG_ID = `\0${VIRTUAL_CONFIG_ID}`
const VIRTUAL_MESSAGES_ID = 'virtual:i18n-micro/messages'
const RESOLVED_MESSAGES_ID = `\0${VIRTUAL_MESSAGES_ID}`

function toPosix(path: string): string {
  return path.replace(/\\/g, '/')
}

function generateImportMessagesModule(rootDir: string, translationDir: string, disablePageLocales: boolean): string {
  const files = listTranslationFiles({ rootDir, translationDir })
  if (files.length === 0) {
    return 'export const messages = {}\nexport const routeMessages = {}\n'
  }

  const imports: string[] = []
  const rootEntries: string[] = []
  const routeVarNames = new Map<string, Map<string, string>>()
  let i = 0

  for (const file of files) {
    const parsed = classifyTranslationRelativePath(file.relativePath, disablePageLocales)
    if (parsed.type === 'ignore') continue

    const varName = `__i18n_${i++}`
    imports.push(`import ${varName} from ${JSON.stringify(toPosix(file.absolutePath))}`)

    if (parsed.type === 'root') {
      rootEntries.push(`  ${JSON.stringify(parsed.locale)}: ${varName}`)
      continue
    }

    let byLocale = routeVarNames.get(parsed.pageName)
    if (!byLocale) {
      byLocale = new Map()
      routeVarNames.set(parsed.pageName, byLocale)
    }
    byLocale.set(parsed.locale, varName)
  }

  const routeEntries: string[] = []
  for (const [routeName, byLocale] of routeVarNames) {
    const localeEntries = [...byLocale.entries()].map(([locale, varName]) => `    ${JSON.stringify(locale)}: ${varName}`).join(',\n')
    routeEntries.push(`  ${JSON.stringify(routeName)}: {\n${localeEntries}\n  }`)
  }

  return [
    ...imports,
    `export const messages = {\n${rootEntries.join(',\n')}\n}`,
    `export const routeMessages = {\n${routeEntries.join(',\n')}\n}`,
    '',
  ].join('\n')
}

function generateInlineMessagesModule(messages: Record<string, Translations>, routeMessages: Record<string, Record<string, Translations>>): string {
  return [`export const messages = ${JSON.stringify(messages)}`, `export const routeMessages = ${JSON.stringify(routeMessages)}`, ''].join('\n')
}

function createI18nVitePlugin(options: WithI18nOptions, siteBase?: string): Plugin {
  const defaultLocale = options.defaultLocale || options.locale
  const translationDir = options.translationDir ?? 'locales'
  const disablePageLocales = options.disablePageLocales === true
  const configData: VirtualI18nConfig = {
    defaultLocale,
    fallbackLocale: options.fallbackLocale || defaultLocale,
    locales: options.locales || [],
    localeCodes: (options.locales || []).map((l) => l.code),
    missingWarn: options.missingWarn ?? true,
    syncWithVitePress: options.syncWithVitePress !== false,
    translationDir,
    disablePageLocales,
    localeKeyToCode: options.localeKeyToCode ?? {},
    base: siteBase && siteBase !== '/' ? siteBase : undefined,
  }

  let rootDir = process.cwd()
  let useInline = Boolean(options.messages || options.routeMessages)
  let inlineRoot = options.messages ?? {}
  let inlineRoutes = options.routeMessages ?? {}
  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  const needsDiskReload = () => !options.messages || !options.routeMessages

  const reloadInlineFromDisk = () => {
    // Fully inline config: skip disk I/O (and avoid spurious JSON parse errors).
    if (!needsDiskReload()) return
    const loaded = loadTranslationBuckets({
      rootDir,
      translationDir,
      disablePageLocales,
    })
    if (!options.messages) {
      inlineRoot = loaded.root
    }
    if (!options.routeMessages) {
      inlineRoutes = loaded.routes
    }
  }

  return {
    name: 'vite-plugin-i18n-vitepress',
    configResolved(config) {
      rootDir = config.root
      // Inline when caller passed messages and/or routeMessages.
      // routeMessages alone still loads root dictionaries from translationDir.
      useInline = Boolean(options.messages || options.routeMessages)
      if (useInline) {
        if (options.messages) inlineRoot = options.messages
        if (options.routeMessages) inlineRoutes = options.routeMessages
        if (needsDiskReload()) {
          reloadInlineFromDisk()
        }
        if (options.messages) inlineRoot = options.messages
        if (options.routeMessages) inlineRoutes = options.routeMessages
      }
    },
    configureServer(server) {
      // Both maps provided inline — nothing to watch on disk.
      if (useInline && !needsDiskReload()) return

      const dir = resolve(rootDir, translationDir)
      if (!existsSync(dir)) return

      server.watcher.add(dir)

      const invalidate = () => {
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          if (useInline) reloadInlineFromDisk()
          const mod = server.moduleGraph.getModuleById(RESOLVED_MESSAGES_ID)
          if (mod) {
            server.moduleGraph.invalidateModule(mod)
            server.ws.send({ type: 'full-reload' })
          }
        }, 50)
      }

      // add/unlink need virtual module regen; change is usually handled by JSON import HMR,
      // but we still invalidate when using inline payload that still reads disk.
      server.watcher.on('add', (file) => {
        if (file.startsWith(dir) && file.endsWith('.json')) invalidate()
      })
      server.watcher.on('unlink', (file) => {
        if (file.startsWith(dir) && file.endsWith('.json')) invalidate()
      })
      if (useInline && needsDiskReload()) {
        server.watcher.on('change', (file) => {
          if (file.startsWith(dir) && file.endsWith('.json')) invalidate()
        })
      }
    },
    resolveId(id) {
      if (id === VIRTUAL_CONFIG_ID) return RESOLVED_CONFIG_ID
      if (id === VIRTUAL_MESSAGES_ID) return RESOLVED_MESSAGES_ID
    },
    load(id) {
      if (id === RESOLVED_CONFIG_ID) {
        return `export const config = ${JSON.stringify(configData)}`
      }
      if (id === RESOLVED_MESSAGES_ID) {
        if (useInline) {
          return generateInlineMessagesModule(inlineRoot, inlineRoutes)
        }
        return generateImportMessagesModule(rootDir, translationDir, disablePageLocales)
      }
    },
  }
}

export function warnLocaleMismatch(config: VitePressUserConfigLike, options: WithI18nOptions): void {
  if (options.warnOnLocaleMismatch === false) return
  const vpLocales = config.locales
  if (!vpLocales || !options.locales?.length) return

  const defaultLocale = options.defaultLocale || options.locale
  const vpKeys = Object.keys(vpLocales)
  const codes = new Set(options.locales.map((l) => l.code))

  for (const key of vpKeys) {
    const expectedCode = key === 'root' ? defaultLocale : (options.localeKeyToCode?.[key] ?? key)
    if (!codes.has(expectedCode)) {
      console.warn(
        `[i18n-micro/vitepress] VitePress locale key "${key}" maps to "${expectedCode}", ` +
          `which is not in i18n locales (${[...codes].join(', ')}).`,
      )
    }
  }
}

/**
 * VitePress config helper: virtual modules + optional `i18nRouting` / SEO head.
 *
 * Registers:
 * - `virtual:i18n-micro/config`
 * - `virtual:i18n-micro/messages` (from `translationDir`, default `locales/`)
 *
 * By default also sets `themeConfig.i18nRouting` (pass `i18nRouting: false` to skip).
 * Pair with `defineI18nTheme(DefaultTheme)` from `@i18n-micro/vitepress/theme`.
 * Import from `@i18n-micro/vitepress/config` (Node / config files only).
 */
export function withI18n<T extends VitePressUserConfigLike>(config: T, options: WithI18nOptions): T {
  warnLocaleMismatch(config, options)

  const siteBase = typeof config.base === 'string' ? config.base : undefined
  const existingPlugins = config.vite?.plugins
  const plugins = [...(Array.isArray(existingPlugins) ? existingPlugins.flat() : []), createI18nVitePlugin(options, siteBase)]

  const prevSsr = config.vite?.ssr
  const prevNoExternal = prevSsr?.noExternal
  const noExternalList = [
    '@i18n-micro/vitepress',
    ...(Array.isArray(prevNoExternal) ? prevNoExternal : prevNoExternal && prevNoExternal !== true ? [prevNoExternal] : []),
  ]

  const defaultLocale = options.defaultLocale || options.locale
  const localeCodes = (options.locales || []).map((l) => l.code)
  const prevTheme = (config.themeConfig && typeof config.themeConfig === 'object' ? config.themeConfig : {}) as Record<string, unknown>
  const shouldInjectRouting = options.i18nRouting !== false && prevTheme.i18nRouting === undefined && localeCodes.length > 0

  const metaEnabled = options.meta ?? Boolean(options.metaBaseUrl)
  const locales = options.locales || []
  const prevTransformHead = config.transformHead
  const prevTransformPageData = config.transformPageData

  const transformHead = metaEnabled
    ? async (ctx: {
        pageData?: { relativePath?: string; frontmatter?: { i18n?: { disableMeta?: boolean } } }
        siteConfig?: { site?: { base?: string } }
        siteData?: { base?: string }
      }) => {
        const prev = typeof prevTransformHead === 'function' ? await prevTransformHead(ctx) : []
        const prevHead = Array.isArray(prev) ? prev : []
        if (ctx.pageData?.frontmatter?.i18n?.disableMeta === true) return prevHead

        const relativePath = ctx.pageData?.relativePath || 'index.md'
        const siteBase = (typeof config.base === 'string' ? config.base : undefined) ?? ctx.siteData?.base ?? ctx.siteConfig?.site?.base
        const built = buildVitePressLocaleHead({
          path: relativePathToRoutePath(relativePath),
          locales,
          defaultLocale,
          localeKeyToCode: options.localeKeyToCode,
          base: siteBase,
          metaBaseUrl: options.metaBaseUrl,
          hreflangBaseLanguage: options.hreflangBaseLanguage,
          canonicalQueryWhitelist: options.canonicalQueryWhitelist,
          missingWarn: options.missingWarn,
        })
        return [...prevHead, ...built.head]
      }
    : prevTransformHead

  const transformPageData = metaEnabled
    ? async (
        pageData: {
          relativePath?: string
          frontmatter?: Record<string, unknown> & { i18n?: { disableMeta?: boolean } }
        },
        ctx?: unknown,
      ) => {
        if (typeof prevTransformPageData === 'function') {
          await prevTransformPageData(pageData, ctx)
        }
        if (pageData.frontmatter?.i18n?.disableMeta === true) return

        const built = buildVitePressLocaleHead({
          path: relativePathToRoutePath(pageData.relativePath || 'index.md'),
          locales,
          defaultLocale,
          localeKeyToCode: options.localeKeyToCode,
          base: typeof config.base === 'string' ? config.base : undefined,
          metaBaseUrl: options.metaBaseUrl,
          hreflangBaseLanguage: options.hreflangBaseLanguage,
          canonicalQueryWhitelist: options.canonicalQueryWhitelist,
          missingWarn: options.missingWarn,
          addSeoAttributes: false,
        })
        if (built.htmlAttrs.lang) {
          pageData.frontmatter ??= {}
          // VitePress uses frontmatter for per-page lang when set
          if (!pageData.frontmatter.lang) {
            pageData.frontmatter.lang = built.htmlAttrs.lang
          }
        }
      }
    : prevTransformPageData

  return {
    ...config,
    ...(shouldInjectRouting
      ? {
          themeConfig: {
            ...prevTheme,
            i18nRouting: createI18nRoutingFromAdapter({
              defaultLocale,
              localeCodes,
              localeKeyToCode: options.localeKeyToCode,
              base: siteBase,
            }),
          },
        }
      : {}),
    ...(metaEnabled
      ? {
          transformHead,
          transformPageData,
        }
      : {}),
    vite: {
      ...config.vite,
      plugins,
      // Theme entry statically imports `virtual:i18n-micro/*`; Vite must bundle
      // the package during SSG so those IDs resolve (not left as bare Node imports).
      ssr: {
        ...prevSsr,
        noExternal: prevNoExternal === true ? true : noExternalList,
      },
    },
  }
}
