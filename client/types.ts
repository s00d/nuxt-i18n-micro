export type JSONValue = string | null | number | boolean | { [key: string]: JSONValue }

export interface TranslationContent {
  [key: string]: JSONValue
}

export interface LocaleData {
  locale: string
  files: string[]
  content: Record<string, TranslationContent>
}

export const RPC_NAMESPACE = 'nuxt-i18n-micro'
