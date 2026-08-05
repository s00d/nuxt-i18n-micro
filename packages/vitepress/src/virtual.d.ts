declare module 'virtual:i18n-micro/config' {
  export const config: {
    defaultLocale: string
    fallbackLocale: string
    locales: import('@i18n-micro/types').Locale[]
    localeCodes: string[]
    missingWarn: boolean
    syncWithVitePress: boolean
    translationDir: string
    disablePageLocales: boolean
    localeKeyToCode: Record<string, string>
  }
}

declare module 'virtual:i18n-micro/messages' {
  export const messages: Record<string, import('@i18n-micro/types').Translations>
  export const routeMessages: Record<string, Record<string, import('@i18n-micro/types').Translations>>
}
