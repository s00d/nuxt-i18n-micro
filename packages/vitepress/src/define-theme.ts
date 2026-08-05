import type { PluralFunc, Translations } from '@i18n-micro/types'
import type { Theme } from 'vitepress'
import { createVitePressI18n, type CreateVitePressI18nResult } from './create'
import { getLocaleFromPath } from './router/adapter'
import type { VirtualI18nConfig } from './with-i18n-micro'

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
}

interface VirtualMessagesModule {
  messages: Record<string, Translations>
  routeMessages?: Record<string, Record<string, Translations>>
}

/**
 * Zero-boilerplate theme wiring. Requires `withI18nMicro(...)` in `.vitepress/config`
 * so virtual config + messages modules exist.
 *
 * Virtual modules are loaded inside `enhanceApp` (not at package top-level) so
 * `@i18n-micro/vitepress` stays importable from Node when evaluating VitePress config.
 *
 * @example
 * ```ts
 * import DefaultTheme from 'vitepress/theme'
 * import { defineI18nTheme } from '@i18n-micro/vitepress'
 *
 * export default defineI18nTheme(DefaultTheme)
 * ```
 */
export function defineI18nTheme<T extends Theme>(base: T, options: DefineI18nThemeOptions = {}): T {
  const userEnhance = options.enhanceApp
  const baseEnhance = base.enhanceApp

  // Per app instance (SSR-safe: WeakMap by app).
  const byApp = new WeakMap<object, CreateVitePressI18nResult>()

  return {
    ...base,
    async enhanceApp(ctx: EnhanceAppContext) {
      if (!byApp.has(ctx.app)) {
        const [{ config }, messagesMod] = await Promise.all([
          import('virtual:i18n-micro/config') as Promise<{ config: VirtualI18nConfig }>,
          import('virtual:i18n-micro/messages') as Promise<VirtualMessagesModule>,
        ])

        const localeCodes = config.localeCodes.length
          ? config.localeCodes
          : config.locales.map((l) => l.code)
        const initialLocale = getLocaleFromPath(
          ctx.router.route.path,
          localeCodes,
          config.defaultLocale,
        )

        const installed = createVitePressI18n({
          locale: initialLocale,
          defaultLocale: config.defaultLocale,
          fallbackLocale: config.fallbackLocale,
          locales: config.locales,
          messages: messagesMod.messages,
          routeMessages: messagesMod.routeMessages,
          missingWarn: config.missingWarn,
          syncWithVitePress: config.syncWithVitePress,
          localeKeyToCode: options.localeKeyToCode ?? config.localeKeyToCode,
          plural: options.plural,
          missingHandler: options.missingHandler,
        })
        // Vue peer version may differ between vitepress and @i18n-micro/vue — ctx shape is compatible at runtime.
        installed.enhanceApp(ctx as unknown as Parameters<typeof installed.enhanceApp>[0])
        byApp.set(ctx.app, installed)
      }

      if (baseEnhance) await baseEnhance(ctx)
      if (userEnhance) await userEnhance(ctx)
    },
  }
}
