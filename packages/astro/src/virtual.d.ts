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
    missingWarn: boolean
    base: string
  }
}

declare module 'virtual:i18n-micro/messages' {
  export const messages: {
    root: Record<string, import('@i18n-micro/types').Translations>
    routes: Record<string, Record<string, import('@i18n-micro/types').Translations>>
  }
}
