export type Params = Record<string, string | number | boolean>

export interface PluralTranslations {
  singular: string
  plural: string
}

export type Translation = string | number | boolean | Translations | PluralTranslations | unknown | null

export interface Translations {
  [key: string]: Translation
}
