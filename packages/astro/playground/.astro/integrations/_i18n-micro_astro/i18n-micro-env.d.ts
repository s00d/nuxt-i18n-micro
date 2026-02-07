/// <reference types="@i18n-micro/astro/env" />

declare module 'virtual:i18n-micro/config' {
  export const config: {
    defaultLocale: string
    fallbackLocale: string
    locales: import('@i18n-micro/types').Locale[]
    localeCodes: string[]
    translationDir: string | null
    autoDetect: boolean
    redirectToDefault: boolean
    localeCookie: string | null
    missingWarn: boolean | null
  }
}
