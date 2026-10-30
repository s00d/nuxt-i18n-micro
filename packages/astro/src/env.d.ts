// It's loaded directly by Astro via entrypoint in integration config
/// <reference types="astro/client" />

import type { AstroI18n } from './composer'
import type { Locale } from '@i18n-micro/types'
import type { MiddlewareHandler } from 'astro'
import type { I18nRoutingStrategy } from './router/types'

declare global {
  namespace App {
    interface Locals {
      i18n: AstroI18n
      locale: string
      defaultLocale: string
      locales: Locale[]
      /** The page's URL: the original one after `Astro.rewrite`, the page's one in a server island. */
      currentUrl: URL
      routingStrategy?: I18nRoutingStrategy
      /** Astro's `base`, no trailing slash. */
      i18nBase?: string
      /** The middleware that handled this request. */
      i18nHandler?: MiddlewareHandler
    }
  }
}
