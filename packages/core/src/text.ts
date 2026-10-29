import type { Getter, Params, PluralFunc, TranslationKey } from '@i18n-micro/types'
import { ownValue } from './tree'

const TOKEN = /\{(\w+)\}/g

/** Replaces `{name}` with `params.name`; a token without an own param stays as written. */
export function interpolate(template: string, params: Params): string {
  if (!params || template.indexOf('{') === -1) return template
  return template.replace(TOKEN, (token, key: string) => {
    const value = ownValue(params, key)
    return value === undefined ? token : String(value)
  })
}

/**
 * Default plural rule for `a | b | c`: a whole non-negative `count` picks that form (the last
 * one past the end); anything else (negative, fractional, NaN) takes the last form. Only the
 * picked form is interpolated, with `params` + `{count}`. Not a string: no plural.
 */
export const defaultPlural: PluralFunc = (key: TranslationKey, count: number, params: Params, _locale: string, getTranslation: Getter) => {
  // No params: an adapter forwarding to `t()` must not interpolate the whole pipe string first.
  const translation = getTranslation(key)
  if (typeof translation !== 'string' && typeof translation !== 'number') return null
  const forms = String(translation).split('|')
  const last = forms.length - 1
  const form = forms[Number.isInteger(count) && count >= 0 ? Math.min(count, last) : last]!
  return translation === '' ? null : interpolate(form.trim(), { ...params, count })
}
