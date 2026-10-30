import type { CleanTranslation, Getter, Params, PluralFunc, TranslationKey } from '@i18n-micro/types'
import { ownValue } from './tree'

/** A placeholder: any run without braces or spaces (`{name}`, `{имя}`, `{first-name}`), so `{ a }` stays text. */
const TOKEN = /\{([^{}\s]+)\}/
const MAX_TEMPLATES = 2000
const MAX_PLURAL_LOCALES = 64
/** Far enough to meet the categories whole numbers reach in practice, not the `many` of `1e6` in French. */
const CATEGORY_PROBE = 200
const CATEGORY_ORDER = ['zero', 'one', 'two', 'few', 'many', 'other']
/** Opens a plural template whose first form is for 0 and whose other forms go by category. */
const ZERO_MARKER = '=0 '
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
  /** Every category of the locale, in template order. */
  all: string[]
  /** The categories counts under `CATEGORY_PROBE` reach, without `zero`: `one, few, many`. */
  named: string[]
  /** The category of every count under `CATEGORY_PROBE`: `select` costs more than the rest of `tc`. */
  small: string[]
  /** Whether an unmarked template may use categories; see {@link unmarkedIndex}. */
  unmarked: boolean
  /** Per entry of `named`: several counts share it, so a form for it has to show the number. */
  shared: boolean[]
}

const pluralLocales = new Map<string, LocalePlural | null>()

const inTemplateOrder = (categories: Iterable<string>): string[] => {
  const present = new Set(categories)
  return CATEGORY_ORDER.filter((category) => present.has(category))
}

function createLocalePlural(locale: string): LocalePlural | null {
  try {
    // an unknown code would silently get the host's locale, and server and browser would disagree
    if (Intl.PluralRules.supportedLocalesOf(locale).length === 0) return null
    const rules = new Intl.PluralRules(locale)
    const small: string[] = Array.from({ length: CATEGORY_PROBE }, (_, n) => rules.select(n))
    const named = inTemplateOrder(small).filter((category) => category !== 'zero')
    return {
      rules,
      small,
      named,
      all: inTemplateOrder(rules.resolvedOptions().pluralCategories),
      // two categories fit the index rule; `lv`, whose `zero` also covers 10-20, has only two besides it
      unmarked: named.length >= 3,
      shared: named.map((category) => small.indexOf(category) !== small.lastIndexOf(category)),
    }
  } catch {
    return null // not a BCP 47 tag (`en_US`): a locale code is free-form
  }
}

/** `null` for a locale `Intl` does not know. Bounded, cleared wholesale. */
function localePlural(locale: string): LocalePlural | null {
  const known = pluralLocales.get(locale)
  if (known !== undefined) return known
  if (pluralLocales.size >= MAX_PLURAL_LOCALES) pluralLocales.clear()
  const created = createLocalePlural(locale)
  pluralLocales.set(locale, created)
  return created
}

const categoryOf = ({ rules, small }: LocalePlural, count: number): string => small[count] ?? rules.select(count)

/**
 * The one unmarked shape that means categories: a zero form with no placeholder, then a form per
 * category, each with `{count}` where several counts share it (`нет | {count} яблоко | {count} яблока
 * | {count} яблок`). Under the index rule such a template would show the number on forms meant for
 * one count, so nothing else reads this way. Anything else stays on the index rule, because its text
 * cannot tell `яблоко | яблока | яблок` from `нет | одно | много`: those take the `=0 ` marker.
 */
function unmarkedIndex(forms: string[], count: number, plural: LocalePlural): number {
  const { named, shared, unmarked } = plural
  if (!unmarked || forms.length !== named.length + 1 || forms[0]!.includes('{')) return -1
  if (shared.some((numbered, i) => numbered && !forms[i + 1]!.includes('{count}'))) return -1
  if (count === 0) return 0
  const index = named.indexOf(categoryOf(plural, count))
  return index === -1 ? forms.length - 1 : index + 1
}

/**
 * The form `count` selects from `forms` in `locale`: whole non-negative counts by index, the last
 * form past the end, unless {@link unmarkedIndex} applies. Negative, fractional, NaN: the last form.
 */
function pluralIndex(forms: string[], count: number, locale: string): number {
  const last = forms.length - 1
  if (!Number.isInteger(count) || count < 0) return last
  const plural = localePlural(locale)
  const index = plural ? unmarkedIndex(forms, count, plural) : -1
  return index === -1 ? Math.min(count, last) : index
}

/**
 * `=0 нет | одно | много`: the first form for 0, the others by category. With more forms than the
 * categories small counts reach, the rest are every category of the locale (`one, many, other` in
 * French), else those without `zero`. A category with no form of its own takes the last form.
 */
function markedIndex(forms: string[], count: number, locale: string): number {
  const last = forms.length - 1
  if (!Number.isInteger(count) || count < 0) return last
  if (count === 0) return 0
  const plural = localePlural(locale)
  if (!plural) return Math.min(count, last)
  const categories = last > plural.named.length ? plural.all : plural.named
  const index = categories.indexOf(categoryOf(plural, count))
  return index === -1 ? last : Math.min(index + 1, last)
}

/** The picked form of a raw `a | b | c` value, trimmed and not interpolated. */
export function pluralForm(translation: string, count: number, locale: string): string {
  const marked = translation.startsWith(ZERO_MARKER)
  const forms = (marked ? translation.slice(ZERO_MARKER.length) : translation).split('|')
  return forms[marked ? markedIndex(forms, count, locale) : pluralIndex(forms, count, locale)]!.trim()
}

/**
 * Default plural rule, see {@link pluralForm}. `locale` is the tag for `Intl.PluralRules`: an unknown
 * one gets the index rule, never the host's locale. Only the picked form is interpolated, with
 * `params` + `{count}`. Not a string: no plural.
 */
export const defaultPlural: PluralFunc = (key: TranslationKey, count: number, params: Params, locale: string, getTranslation: Getter) => {
  // No params: an adapter forwarding to `t()` must not interpolate the whole pipe string first.
  const translation = getTranslation(key)
  if (typeof translation !== 'string' && typeof translation !== 'number') return null
  return translation === '' ? null : interpolate(pluralForm(String(translation), count, locale), { ...params, count })
}

/** What {@link resolveText} needs from an i18n instance. */
export interface TextHost {
  pluralFunc: PluralFunc
  getLocale(): string
  /** The tag plurals go by, when it is not the locale code. */
  pluralLocale?(): string
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
  const { keypath, customPluralRule } = options
  const count = Number(options.plural)
  if (customPluralRule) {
    const getter: Getter = (key, values, defaultValue) => i18n.t(key, values, defaultValue)
    return { template: String(customPluralRule(keypath, count, params, i18n.getLocale(), getter) ?? ''), params: {} }
  }
  if (i18n.pluralFunc !== defaultPlural) return { template: i18n.tc(keypath, { ...params, count }), params: {} }
  // as `defaultPlural`: a tree or a boolean has no forms, so `tc` answers the key
  const value = i18n.t(keypath)
  const translation = typeof value === 'string' || typeof value === 'number' ? String(value) : keypath
  return { template: pluralForm(translation, count, i18n.pluralLocale?.() ?? i18n.getLocale()), params: { ...params, count } }
}

/**
 * The one way from component props to text: which value, which form, which params, html escaping.
 * `null` when `hideIfEmpty` hides it. The Vue and Nuxt `<i18n-t>` fold the result; the React, Preact,
 * Solid and Astro ones do not use it yet, so their `html` params are not escaped.
 */
export function resolveText(i18n: TextHost, options: ResolveTextOptions): ResolvedText | null {
  const params = options.html && options.params ? escapeParams(options.params) : (options.params ?? {})
  const formatted = formattedParams(i18n, options)
  const usesPlural = formatted === null && options.plural !== undefined && options.plural !== null
  const resolved = usesPlural
    ? pluralText(i18n, options, params)
    : { template: String(i18n.t(options.keypath) ?? ''), params: formatted ? { ...params, ...formatted } : params }
  return options.hideIfEmpty && !interpolate(resolved.template, resolved.params).trim() ? null : resolved
}
