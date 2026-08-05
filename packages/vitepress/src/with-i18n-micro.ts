import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Locale, Translations } from '@i18n-micro/types'
import { classifyTranslationRelativePath } from '@i18n-micro/utils/parse-path'
import type { Plugin } from 'vite'
import type { VitePressI18nOptions } from './create'
import { listTranslationFiles, loadTranslationBuckets } from './load-messages'

export interface WithI18nMicroOptions extends VitePressI18nOptions {
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
}

/**
 * Minimal VitePress / Vite user config shape we merge into.
 * Avoid importing `vitepress` types so the package stays usable as a pure library dep.
 */
export interface VitePressUserConfigLike {
  locales?: Record<string, unknown>
  vite?: {
    plugins?: Plugin[] | Plugin[][]
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
}

const VIRTUAL_CONFIG_ID = 'virtual:i18n-micro/config'
const RESOLVED_CONFIG_ID = `\0${VIRTUAL_CONFIG_ID}`
const VIRTUAL_MESSAGES_ID = 'virtual:i18n-micro/messages'
const RESOLVED_MESSAGES_ID = `\0${VIRTUAL_MESSAGES_ID}`

function toPosix(path: string): string {
  return path.replace(/\\/g, '/')
}

function generateImportMessagesModule(
  rootDir: string,
  translationDir: string,
  disablePageLocales: boolean,
): string {
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
    const localeEntries = [...byLocale.entries()]
      .map(([locale, varName]) => `    ${JSON.stringify(locale)}: ${varName}`)
      .join(',\n')
    routeEntries.push(`  ${JSON.stringify(routeName)}: {\n${localeEntries}\n  }`)
  }

  return [
    ...imports,
    `export const messages = {\n${rootEntries.join(',\n')}\n}`,
    `export const routeMessages = {\n${routeEntries.join(',\n')}\n}`,
    '',
  ].join('\n')
}

function generateInlineMessagesModule(
  messages: Record<string, Translations>,
  routeMessages: Record<string, Record<string, Translations>>,
): string {
  return [
    `export const messages = ${JSON.stringify(messages)}`,
    `export const routeMessages = ${JSON.stringify(routeMessages)}`,
    '',
  ].join('\n')
}

function createI18nMicroVitePlugin(options: WithI18nMicroOptions): Plugin {
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
  }

  let rootDir = process.cwd()
  let useInline = Boolean(options.messages || options.routeMessages)
  let inlineRoot = options.messages ?? {}
  let inlineRoutes = options.routeMessages ?? {}
  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  const reloadInlineFromDisk = () => {
    if (options.messages || options.routeMessages) return
    const loaded = loadTranslationBuckets({
      rootDir,
      translationDir,
      disablePageLocales,
    })
    inlineRoot = loaded.root
    inlineRoutes = loaded.routes
  }

  return {
    name: 'vite-plugin-i18n-micro-vitepress',
    configResolved(config) {
      rootDir = config.root
      // Prefer Vite JSON imports (code-split + HMR). Inline only when caller passed messages.
      useInline = Boolean(options.messages || options.routeMessages)
      if (useInline && !options.messages && options.routeMessages) {
        reloadInlineFromDisk()
        inlineRoutes = options.routeMessages
      }
    },
    configureServer(server) {
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
      // but we still invalidate when using inline payload.
      server.watcher.on('add', (file) => {
        if (file.startsWith(dir) && file.endsWith('.json')) invalidate()
      })
      server.watcher.on('unlink', (file) => {
        if (file.startsWith(dir) && file.endsWith('.json')) invalidate()
      })
      if (useInline) {
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

export function warnLocaleMismatch(config: VitePressUserConfigLike, options: WithI18nMicroOptions): void {
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
        `[i18n-micro/vitepress] VitePress locale key "${key}" maps to "${expectedCode}", `
        + `which is not in i18n locales (${[...codes].join(', ')}).`,
      )
    }
  }
}

/**
 * Config helper (like `withMermaid`). Name is `withI18nMicro` on purpose —
 * `withI18n` is already used by the unrelated `vitepress-i18n` package.
 *
 * Registers virtual modules:
 * - `virtual:i18n-micro/config`
 * - `virtual:i18n-micro/messages` (from `translationDir`, default `locales/`)
 *
 * Pair with `defineI18nTheme(DefaultTheme)` — no manual `import.meta.glob` in the theme.
 *
 * Import from `@i18n-micro/vitepress/config` (Node / config files only).
 */
export function withI18nMicro<T extends VitePressUserConfigLike>(
  config: T,
  options: WithI18nMicroOptions,
): T {
  warnLocaleMismatch(config, options)

  const existingPlugins = config.vite?.plugins
  const plugins = [
    ...(Array.isArray(existingPlugins) ? existingPlugins.flat() : []),
    createI18nMicroVitePlugin(options),
  ]

  return {
    ...config,
    vite: {
      ...config.vite,
      plugins,
    },
  }
}
