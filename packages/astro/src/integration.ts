import type { AstroIntegration, HookParameters } from 'astro'
import { AstroI18n, type AstroI18nOptions } from './composer'
import type { Locale, ModuleOptions, PluralFunc } from '@i18n-micro/types'
import type { I18nRoutingStrategy } from './router/types'

export interface I18nIntegrationOptions extends Omit<ModuleOptions, 'plural'> {
  locale: string
  fallbackLocale?: string
  locales?: Locale[]
  messages?: Record<string, Record<string, unknown>>
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
  localeCookie?: string | null
  autoDetect?: boolean
  redirectToDefault?: boolean
  translationDir?: string
  routingStrategy?: I18nRoutingStrategy
}

let globalRoutingStrategy: I18nRoutingStrategy | null = null

export function getGlobalRoutingStrategy(): I18nRoutingStrategy | null {
  return globalRoutingStrategy
}

export function setGlobalRoutingStrategy(strategy: I18nRoutingStrategy | null): void {
  globalRoutingStrategy = strategy
}

/**
 * Astro Integration for i18n-micro
 */
export function i18nIntegration(options: I18nIntegrationOptions): AstroIntegration {
  const {
    locale: defaultLocale,
    fallbackLocale,
    translationDir,
    routingStrategy,
  } = options

  globalRoutingStrategy = routingStrategy || null

  return {
    name: '@i18n-micro/astro',
    hooks: {
      // 1. Настройка Vite (Виртуальный модуль) происходит здесь
      'astro:config:setup': (params) => {
        const { updateConfig } = params as HookParameters<'astro:config:setup'>

        const virtualModuleId = 'virtual:i18n-micro/config'
        const resolvedVirtualModuleId = '\0' + virtualModuleId

        const configData = {
          defaultLocale,
          fallbackLocale: fallbackLocale || defaultLocale,
          locales: options.locales || [],
          localeCodes: (options.locales || []).map(l => l.code),
          translationDir: translationDir || null,
          autoDetect: options.autoDetect ?? true,
          redirectToDefault: options.redirectToDefault ?? false,
          localeCookie: options.localeCookie === null ? null : (options.localeCookie || 'i18n-locale'),
          missingWarn: options.missingWarn ?? false,
        }

        updateConfig({
          vite: {
            plugins: [
              {
                name: 'vite-plugin-i18n-micro-config',
                resolveId(id) {
                  if (id === virtualModuleId) {
                    return resolvedVirtualModuleId
                  }
                },
                load(id) {
                  if (id === resolvedVirtualModuleId) {
                    return `export const config = ${JSON.stringify(configData)}`
                  }
                },
              },
            ],
          },
        })
      },

      // 2. Инъекция типов происходит здесь (согласно документации Astro)
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
                missingWarn: boolean | null;
              }
            }
          `,
        })
      },
    },
  }
}
/**
 * Create i18n instance (for manual setup)
 */
export function createI18n(options: AstroI18nOptions): AstroI18n {
  return new AstroI18n(options)
}
