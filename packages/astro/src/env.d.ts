/// <reference types="astro/client" />

import type { AstroI18n } from './composer'
import type { Locale } from '@i18n-micro/types'
import type { I18nRoutingStrategy } from './router/types'

declare global {
  namespace App {
    interface Locals {
      i18n: AstroI18n
      locale: string
      defaultLocale: string
      locales: Locale[]
      currentUrl: URL
      routingStrategy?: I18nRoutingStrategy
    }
  }
}

export {}
