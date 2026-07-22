import type { Params, CleanTranslation, TranslationKey } from '@i18n-micro/types'

// Extend '@vue/runtime-core' module so types work correctly in all environments
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: (key: TranslationKey, params?: Params, defaultValue?: string | null, routeName?: string) => CleanTranslation
    $ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string
    $tc: (key: TranslationKey, count: number | Params, defaultValue?: string) => string
    $tn: {
      (value: number, options?: Intl.NumberFormatOptions): string
      (value: number, key: string, overrides?: Intl.NumberFormatOptions): string
      (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string
    }
    $td: {
      (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string
      (value: Date | number | string, key: string, overrides?: Intl.DateTimeFormatOptions): string
      (value: Date | number | string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string
    }
    $tdr: (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions) => string
    $has: (key: TranslationKey, routeName?: string) => boolean
    $i18n: any
  }
}
