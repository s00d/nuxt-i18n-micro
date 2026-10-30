import type { CleanTranslation, Getter, Params, PluralFunc, TranslationKey } from '@i18n-micro/types'
import { ownValue } from './tree'

/** A placeholder: any run without braces or spaces (`{name}`, `{имя}`, `{first-name}`), so `{ a }` stays text. */
const TOKEN = /\{([^{}\s]+)\}/
const MAX_TEMPLATES = 2000
const MAX_PLURAL_LOCALES = 64
/** Far enough to meet the categories whole numbers reach in practice, not the `many` of `1e6` in French. */
const CATEGORY_PROBE = 200
const CATEGORY_ORDER = ['zero', 'one', 'two', 'few', 'many', 'other']
const HTML_ENTITY: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

const templates = new Map<string, readonly string[]>()

/** Drop the tokenized templates; they are rebuilt on use. */
export function clearTemplateCache(): void {
  templates.clear()
}

/**
 * `'Hi {a}, {b}!'` → `['Hi ', 'a', ', ', 'b', '!']`: text at even indexes, placeholder names at odd
 * ones. Works on the raw template, so a param value can never be taken for a placeholder. Cached by
 * template: the result is shared, do not mutate it.
 */
export function tokenize(template: string): readonly string[] {
  const cached = templates.get(template)
  if (cached) return cached
  const parts = template.split(TOKEN)
  if (templates.size >= MAX_TEMPLATES) templates.clear()
  templates.set(template, parts)
  return parts
}

/** Replaces `{name}` with `params.name`; a token without an own param stays as written. */
export function interpolate(template: string, params: Params): string {
  if (!params || template.indexOf('{') === -1) return template
  const parts = tokenize(template)
  let out = parts[0]!
  for (let i = 1; i < parts.length; i += 2) {
    const value = ownValue(params, parts[i]!)
    out += (value === undefined ? `{${parts[i]}}` : String(value)) + parts[i + 1]
  }
  return out
}

export const escapeHtml = (text: string): string => text.replace(/[&<>"']/g, (char) => HTML_ENTITY[char]!)

/** A copy of `params` safe inside markup: only the translation itself is trusted. */
function escapeParams(params: Params): Params {
  const safe: Params = {}
  for (const name of Object.keys(params)) {
    const value = params[name]
    // undefined stays out: the placeholder keeps showing, as without html
    if (value !== undefined) safe[name] = typeof value === 'number' || typeof value === 'boolean' ? value : escapeHtml(String(value))
  }
  return safe
}

interface LocalePlural {
  rules: Intl.PluralRules
  /** Categories whole numbers reach, in template order (`one, few, many`). */
  categories: string[]
  /** The category of every count under `CATEGORY_PROBE`: `select` costs more than the rest of `tc`. */
  small: string[]
}

const pluralLocales = new Map<string, LocalePlural | null>()

function createLocalePlural(locale: string): LocalePlural | null {
  try {
    const rules = new Intl.PluralRules(locale)
    const small = Array.from({ length: CATEGORY_PROBE }, (_, n) => rules.select(n))
    const reached = new Set<string>(small)
    // Two categories fit the index rule, and templates count on it: `none | one | {count} many`.
    if (reached.size < 3) return null
    return { rules, small, categories: CATEGORY_ORDER.filter((category) => reached.has(category)) }
  } catch {
    return null // not a BCP 47 tag (`en_US`): a locale code is free-form
  }
}

/** `null` for a locale the index rule serves. Bounded, cleared wholesale. */
function localePlural(locale: string): LocalePlural | null {
  const known = pluralLocales.get(locale)
  if (known !== undefined) return known
  if (pluralLocales.size >= MAX_PLURAL_LOCALES) pluralLocales.clear()
  const created = createLocalePlural(locale)
  pluralLocales.set(locale, created)
  return created
}

/** `нет яблок | одно яблоко | {count} яблок`: the first form names no number, a later one does. */
const startsWithZeroForm = (forms: string[]): boolean => !forms[0]!.includes('{count}') && forms.some((form) => form.includes('{count}'))

/** The form of `count` when the template has one per category (or one more, for zero), else -1. */
function categoryIndex(forms: string[], count: number, { rules, categories, small }: LocalePlural): number {
  const hasZeroCategory = categories[0] === 'zero'
  const index = categories.indexOf(small[count] ?? rules.select(count))
  if (forms.length === categories.length + 1 && !hasZeroCategory) return count === 0 ? 0 : index + 1
  return forms.length !== categories.length || (!hasZeroCategory && startsWithZeroForm(forms)) ? -1 : index
}

/**
 * The form `count` selects from `forms` in `locale`.
 *
 * The index rule, always: a whole non-negative count picks that form, the last one past the end;
 * anything else (negative, fractional, NaN) takes the last form. Locales with three or more integer
 * categories (`ru`, `pl`, `ar`...) use `Intl.PluralRules` when the template has a form per category,
 * or one more for zero. Any other shape cannot be mapped, so it stays on the index rule.
 * ponytail: a same-sized template whose first form has no `{count}` while a later one does is read as
 * zero-first; a zero-first template with no `{count}` at all is read as categories. A marker would settle it.
 */
function pluralIndex(forms: string[], count: number, locale: string): number {
  const last = forms.length - 1
  if (!Number.isInteger(count) || count < 0) return last
  const plural = localePlural(locale)
  const index = plural ? categoryIndex(forms, count, plural) : -1
  return index === -1 ? Math.min(count, last) : index
}

/** The picked form of a raw `a | b | c` value, trimmed and not interpolated. */
export function pluralForm(translation: string, count: number, locale: string): string {
  const forms = translation.split('|')
  return forms[pluralIndex(forms, count, locale)]!.trim()
}

/**
 * Default plural rule, see {@link pluralIndex}. Only the picked form is interpolated, with
 * `params` + `{count}`. Not a string: no plural.
 */
export const defaultPlural: PluralFunc = (key: TranslationKey, count: number, params: Params, locale: string, getTranslation: Getter) => {
  // No params: an adapter forwarding to `t()` must not interpolate the whole pipe string first.
  const translation = getTranslation(key)
  if (typeof translation !== 'string' && typeof translation !== 'number') return null
  return interpolate(pluralForm(String(translation), count, locale), { ...params, count })
}

/** What {@link resolveText} needs from an i18n instance. */
export interface TextHost {
  pluralFunc: PluralFunc
  getLocale(): string
  t(key: TranslationKey, params?: Params, defaultValue?: string | null): CleanTranslation
  tc(key: TranslationKey, count: number | Params, defaultValue?: string): string
  tn(value: number): string
  td(value: Date | number | string): string
  tdr(value: Date | number | string): string
}

export interface ResolveTextOptions {
  keypath: TranslationKey
  params?: Params
  /** The result goes into markup: param values are escaped, the translation is not. */
  html?: boolean
  /** Answer `null` when the text is blank. */
  hideIfEmpty?: boolean
  /** Stands in for a missing key; the renderer also shows it when `hideIfEmpty` hides the text. */
  defaultValue?: string
  plural?: number | string | null
  /** Replaces the configured plural rule; its answer is used as is, `null` being empty. */
  customPluralRule?: PluralFunc | null
  number?: number | string | null
  date?: Date | number | string | null
  relativeDate?: Date | number | string | null
}

/** A raw template and its values. `interpolate` makes it a string; `tokenize` gives a renderer the parts. */
export interface ResolvedText {
  template: string
  params: Params
}

/** `{ number }`, `{ date }` or `{ relativeDate }` formatted; the first one set wins. */
function formattedParams(i18n: TextHost, options: ResolveTextOptions): Params | null {
  if (options.number !== undefined && options.number !== null) return { number: i18n.tn(Number(options.number)) }
  if (options.date !== undefined && options.date !== null) return { date: i18n.td(options.date) }
  if (options.relativeDate !== undefined && options.relativeDate !== null) return { relativeDate: i18n.tdr(options.relativeDate) }
  return null
}

function pluralText(i18n: TextHost, options: ResolveTextOptions, params: Params): ResolvedText {
  const { keypath, customPluralRule, defaultValue } = options
  const count = Number(options.plural)
  if (customPluralRule) {
    const getter: Getter = (key, values, fallback) => i18n.t(key, values, fallback ?? defaultValue)
    return { template: String(customPluralRule(keypath, count, params, i18n.getLocale(), getter) ?? ''), params: {} }
  }
  if (i18n.pluralFunc !== defaultPlural) return { template: i18n.tc(keypath, { ...params, count }, defaultValue), params: {} }
  return { template: pluralForm(String(i18n.t(keypath, undefined, defaultValue) ?? ''), count, i18n.getLocale()), params: { ...params, count } }
}

/**
 * The one way from component props to text: which value, which form, which params. Every
 * `<i18n-t>` renderer folds the result. `null` when `hideIfEmpty` hides it.
 */
export function resolveText(i18n: TextHost, options: ResolveTextOptions): ResolvedText | null {
  const params = options.html && options.params ? escapeParams(options.params) : (options.params ?? {})
  const formatted = formattedParams(i18n, options)
  const usesPlural = formatted === null && options.plural !== undefined && options.plural !== null
  const resolved = usesPlural
    ? pluralText(i18n, options, params)
    : { template: String(i18n.t(options.keypath, undefined, options.defaultValue) ?? ''), params: formatted ? { ...params, ...formatted } : params }
  return options.hideIfEmpty && !resolved.template.trim() ? null : resolved
}
