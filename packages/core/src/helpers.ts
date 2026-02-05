import type { Params, Strategies, PluralFunc, Getter, TranslationKey } from '@i18n-micro/types'

const RE_TOKEN = /\{(\w+)\}/g

export function interpolate(template: string, params: Params): string {
  if (!params) return template

  return template.replace(RE_TOKEN, (_, key) => {
    const value = params[key]
    return value !== undefined ? String(value) : `{${key}}`
  })
}

export function withPrefixStrategy(strategy: Strategies) {
  return strategy === 'prefix' || strategy === 'prefix_and_default'
}

export function isNoPrefixStrategy(strategy: Strategies) {
  return strategy === 'no_prefix'
}

export function isPrefixStrategy(strategy: Strategies) {
  return strategy === 'prefix'
}

export function isPrefixExceptDefaultStrategy(strategy: Strategies) {
  return strategy === 'prefix_except_default'
}

export function isPrefixAndDefaultStrategy(strategy: Strategies) {
  return strategy === 'prefix_and_default'
}

/**
 * Default pluralization function
 * Splits translation by '|' and selects form based on count
 * @param key - Translation key
 * @param count - Count for pluralization
 * @param params - Parameters for translation
 * @param _locale - Current locale (unused in default implementation)
 * @param getTranslation - Function to get translation value
 * @returns Selected plural form or null if not found
 */
export const defaultPlural: PluralFunc = (key: TranslationKey, count: number, params: Params, _locale: string, getTranslation: Getter) => {
  const translation = getTranslation(key, params)
  if (!translation) {
    return null
  }
  const forms = translation.toString().split('|')
  if (forms.length === 0) return null
  const selectedForm = count < forms.length ? forms[count] : forms[forms.length - 1]
  if (!selectedForm) return null
  return selectedForm.trim().replace('{count}', count.toString())
}
