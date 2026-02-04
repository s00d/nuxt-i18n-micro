import type { Storage } from 'unstorage'
import type { Translations } from '@i18n-micro/types'

declare module 'h3' {
  interface H3EventContext {
    i18n?: {
      locale: string
      translations: Translations
    }
    $i18nStorage?: Storage
  }
}

export {}
