import type { PluralFunc, Translations } from '@i18n-micro/types'
import type { Theme } from 'vitepress'
import { config as virtualConfig } from 'virtual:i18n-micro/config'
import { messages as virtualMessages, routeMessages as virtualRouteMessages } from 'virtual:i18n-micro/messages'
import { createI18n, type CreateI18nResult } from './create'
import { getLocaleFromPath } from '../router/adapter'
import type { VirtualI18nConfig } from '../plugin/with-i18n'

type EnhanceAppContext = Parameters<NonNullable<Theme['enhanceApp']>>[0]

export interface DefineI18nThemeOptions {
  /**
   * Extra `enhanceApp` run after i18n is installed.
   */
  enhanceApp?: NonNullable<Theme['enhanceApp']>
  /**
   * Overrides not serializable into `virtual:i18n-micro/config`.
   */
  plural?: PluralFunc
  missingHandler?: (locale: string, key: string, routeName: string) => void
  localeKeyToCode?: Record<string, string>
  /**
   * Optional overrides (tests / advanced). Defaults come from `virtual:i18n-micro/*`
   * registered by `withI18n`.
   */
  config?: VirtualI18nConfig
  messages?: Record<string, Translations>
  routeMessages?: Record<string, Record<string, Translations>>
}

/**
 * Zero-boilerplate theme wiring. Requires `withI18n(...)` in `.vitepress/config`
 * so virtual config + messages modules exist.
 *
 * Uses **static** `virtual:i18n-micro/*` imports so VitePress SSG can rewrite them.
 * Import this helper from `@i18n-micro/vitepress/theme` (not the root entry) so Node
 * config evaluation never loads virtual modules.
 *
 * @example
 * ```ts
 * import DefaultTheme from 'vitepress/theme'
 * import { defineI18nTheme } from '@i18n-micro/vitepress/theme'
 *
 * export default defineI18nTheme(DefaultTheme)
 * ```
 */
export function defineI18nTheme<T extends Theme>(base: T, options: DefineI18nThemeOptions = {}): T {
  const userEnhance = options.enhanceApp
  const baseEnhance = base.enhanceApp

  // Per app instance (SSR-safe: WeakMap by app).
  const byApp = new WeakMap<object, CreateI18nResult>()

  return {
    ...base,
    async enhanceApp(ctx: EnhanceAppContext) {
      let installed = byApp.get(ctx.app)
      if (!installed) {
        // Cast via `unknown`: root typecheck also sees Astro's ambient `virtual:i18n-micro/config`.
        const config = (options.config ?? virtualConfig) as unknown as VirtualI18nConfig
        const messages = options.messages ?? (virtualMessages as Record<string, Translations>)
        const routeMessages = options.routeMessages ?? (virtualRouteMessages as Record<string, Record<string, Translations>>)

        const localeCodes = config.localeCodes.length ? config.localeCodes : config.locales.map((l) => l.code)
        const localeKeyToCode = options.localeKeyToCode ?? config.localeKeyToCode
        const initialLocale = getLocaleFromPath(ctx.router.route.path, localeCodes, config.defaultLocale, localeKeyToCode, config.base)

        installed = createI18n({
          locale: initialLocale,
          defaultLocale: config.defaultLocale,
          fallbackLocale: config.fallbackLocale,
          locales: config.locales,
          messages,
          routeMessages,
          missingWarn: config.missingWarn ?? undefined,
          syncWithVitePress: config.syncWithVitePress,
          localeKeyToCode,
          base: config.base,
          plural: options.plural,
          missingHandler: options.missingHandler,
        })
        byApp.set(ctx.app, installed)
      }

      // Install plugin first so base/user enhanceApp can use $t / components.
      installed.enhanceApp(ctx as unknown as Parameters<typeof installed.enhanceApp>[0])
      if (baseEnhance) await baseEnhance(ctx)
      if (userEnhance) await userEnhance(ctx)
      // Re-run so route sync wraps any onAfterRouteChange set by base/user.
      installed.enhanceApp(ctx as unknown as Parameters<typeof installed.enhanceApp>[0])
    },
  }
}
