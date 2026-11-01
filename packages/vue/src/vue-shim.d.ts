// The type rollup copies this block verbatim into each entry and drops the imports of this file,
// so it names its types inline. `export {}` keeps the block an augmentation.
export {}

// Extend '@vue/runtime-core' module so types work correctly in all environments
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: (
      key: import('@i18n-micro/types').TranslationKey,
      params?: import('@i18n-micro/types').Params,
      defaultValue?: string | null,
      routeName?: string,
    ) => import('@i18n-micro/types').CleanTranslation
    $ts: (
      key: import('@i18n-micro/types').TranslationKey,
      params?: import('@i18n-micro/types').Params,
      defaultValue?: string,
      routeName?: string,
    ) => string
    $tc: (key: import('@i18n-micro/types').TranslationKey, count: number | import('@i18n-micro/types').Params, defaultValue?: string) => string
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
    $has: (key: import('@i18n-micro/types').TranslationKey, routeName?: string) => boolean
    $i18n: any
  }
}
