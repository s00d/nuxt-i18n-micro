import type { Locale } from '@i18n-micro/types'
import { getEnabledLocaleCodes } from '@i18n-micro/utils/active-locales'
import type { AstroConfig, AstroIntegration, HookParameters } from 'astro'
import type { FSWatcher } from 'vite'
import { AstroI18n, type AstroI18nOptions } from './composer'

export interface I18nIntegrationOptions {
  locale: string
  fallbackLocale?: string
  locales?: Locale[]
  missingWarn?: boolean
  localeCookie?: string | null
  autoDetect?: boolean
  /** `/` also redirects when nothing prefers another locale: see `createI18nMiddleware`. */
  redirectToDefault?: boolean
  /** Bundled into the server at build time, relative to the project root. */
  translationDir?: string
  /** Page files (`pages/about/de.json`) count as root translations. */
  disablePageLocales?: boolean
  /**
   * `false`: no middleware from the integration. Write `src/middleware.ts` with `createI18nMiddleware`
   * for what cannot cross from the Astro config to the server bundle: `plural`, `missingHandler`, a strategy.
   */
  middleware?: boolean
}

/** Options that moved to the server bundle: passing one here would silently lose it. */
const MOVED_OPTIONS = ['messages', 'plural', 'missingHandler', 'routingStrategy']

const CONFIG_MODULE = 'virtual:i18n-micro/config'
const MESSAGES_MODULE = 'virtual:i18n-micro/messages'
const hidden = (id: string) => `\0${id}`
/** Not a literal, so a server bundle of this entry never sees `node:fs`: only the config process comes here. */
const NODE_ENTRY = '@i18n-micro/astro/node'

type ConfigSetup = HookParameters<'astro:config:setup'>

/** What crosses from the Astro config process to the server bundle: only serializable values. */
function publishedConfig(options: I18nIntegrationOptions, base: string) {
  const locales = options.locales || []
  return {
    defaultLocale: options.locale,
    fallbackLocale: options.fallbackLocale || options.locale,
    locales,
    localeCodes: getEnabledLocaleCodes(locales),
    translationDir: options.translationDir || null,
    autoDetect: options.autoDetect ?? true,
    redirectToDefault: options.redirectToDefault ?? false,
    localeCookie: options.localeCookie === null ? null : options.localeCookie || 'i18n-locale',
    missingWarn: options.missingWarn ?? false,
    base: base === '/' ? '' : base,
  }
}

/**
 * The two virtual modules. The dictionaries become code at build time, so the server reads no disk
 * and an edge runtime works. Their files are watched: in dev an edit reloads the module.
 */
function i18nVitePlugin(options: I18nIntegrationOptions, config: AstroConfig) {
  const code = `export const config = ${JSON.stringify(publishedConfig(options, config.base))}`

  let watched: string[] = []

  const loadMessages = async (watch: (file: string) => void) => {
    const { translationDir, disablePageLocales } = options
    if (!translationDir) return 'export const messages = {"root":{},"routes":{}}'
    const { readTranslationDir } = (await import(/* @vite-ignore */ NODE_ENTRY)) as typeof import('./node')
    const { messages, files } = readTranslationDir({ translationDir, rootDir: config.root, disablePageLocales })
    watched = files
    for (const file of files) watch(file)
    return `export const messages = ${JSON.stringify(messages)}`
  }

  return {
    name: 'vite-plugin-i18n-micro-config',
    resolveId(id: string) {
      return id === CONFIG_MODULE || id === MESSAGES_MODULE ? hidden(id) : undefined
    },
    load(this: { addWatchFile(file: string): void }, id: string) {
      if (id === hidden(CONFIG_MODULE)) return code
      return id === hidden(MESSAGES_MODULE) ? loadMessages((file) => this.addWatchFile(file)) : undefined
    },
    configureServer(server: { watcher: FSWatcher }) {
      const dir = options.translationDir && `/${options.translationDir.replace(/^\.?\/+|\/+$/g, '')}/`
      if (!dir) return
      // A file Vite knows reloads by itself; a new one has no module yet: a change of a known file does it.
      const reload = (file: string) => {
        const isLocaleFile = file.endsWith('.json') && file.replace(/\\/g, '/').includes(dir)
        if (isLocaleFile && watched[0]) server.watcher.emit('change', watched[0])
      }
      server.watcher.on('add', reload)
    },
  }
}

/**
 * `Astro.currentLocale` and `astro:i18n` know the locales, the routing stays ours. Only with a
 * `src/middleware.ts`: Astro rejects `routing: 'manual'` when the only middleware is an integration's
 * (`MissingMiddlewareForInternationalization`), and any other routing would fight this one.
 */
function astroI18nConfig(options: I18nIntegrationOptions, config: AstroConfig) {
  const locales = getEnabledLocaleCodes(options.locales)
  if (options.middleware !== false || config.i18n || !locales.includes(options.locale)) return {}
  return { i18n: { locales, defaultLocale: options.locale, routing: 'manual' as const } }
}

/** Astro integration for i18n-micro: publishes the config and dictionaries, and installs the middleware. */
export function i18nIntegration(options: I18nIntegrationOptions): AstroIntegration {
  const moved = MOVED_OPTIONS.find((key) => (options as unknown as Record<string, unknown>)[key] !== undefined)
  if (moved)
    throw new Error(`[i18n-micro] i18nIntegration no longer takes "${moved}": pass it to createI18n / createI18nMiddleware in src/middleware.ts`)

  return {
    name: '@i18n-micro/astro',
    hooks: {
      'astro:config:setup': (params) => {
        const { updateConfig, addMiddleware, config } = params as ConfigSetup
        updateConfig({
          ...astroI18nConfig(options, config),
          vite: {
            // the middleware and the components import virtual modules and `.astro` files: Vite has to process them
            ssr: { noExternal: ['@i18n-micro/astro'] },
            plugins: [i18nVitePlugin(options, config)],
          },
        })
        if (options.middleware !== false) addMiddleware({ order: 'pre', entrypoint: '@i18n-micro/astro/middleware' })
      },

      'astro:config:done': (params) => {
        const { injectTypes } = params as HookParameters<'astro:config:done'>

        injectTypes({
          filename: 'i18n-micro-env.d.ts',
          content: `
            /// <reference types="@i18n-micro/astro/env" />

            declare module 'virtual:i18n-micro/config' {
              export const config: {
                defaultLocale: string;
                fallbackLocale: string;
                locales: import('@i18n-micro/types').Locale[];
                localeCodes: string[];
                translationDir: string | null;
                autoDetect: boolean;
                redirectToDefault: boolean;
                localeCookie: string | null;
                missingWarn: boolean;
                base: string;
              }
            }

            declare module 'virtual:i18n-micro/messages' {
              export const messages: {
                root: Record<string, import('@i18n-micro/types').Translations>;
                routes: Record<string, Record<string, import('@i18n-micro/types').Translations>>;
              }
            }
          `,
        })
      },
    },
  }
}

/** Create an i18n instance (for a `src/middleware.ts` of your own). */
export function createI18n(options: AstroI18nOptions): AstroI18n {
  return new AstroI18n(options)
}
