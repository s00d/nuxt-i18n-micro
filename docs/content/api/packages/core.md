---
title: '@i18n-micro/core'
description: 'Exported API of @i18n-micro/core, generated from the source.'
navigation:
  title: 'core'
---

# `@i18n-micro/core`

Core utilities for translations, formatting, and locale routing in Nuxt I18n Micro.

Entry points: `@i18n-micro/core`, `@i18n-micro/core/devtools`, `@i18n-micro/core/helpers`, `@i18n-micro/core/render`.

## `@i18n-micro/core`

### Functions

#### `collectTranslationPaths`

Adds every path of `obj` (objects and leaves, dotted) to `paths`. Arrays are leaves; a cycle is cut.

```ts
function collectTranslationPaths(
  obj: Tree,
  paths: Set<string>,
  prefix?: string,
  ancestors?: Set<object>,
): void
```

**See** [`Tree`](#tree)

#### `convertible`

What `t` hands back for a subtree or an array: that value, or, where `String()` throws on it, an equal copy that
converts. `v-html` and a template literal convert what they get, and a dictionary is no reason for a 500.

```ts
function convertible<T extends object>(value: T): T
```

#### `createReactiveI18nStore`

```ts
function createReactiveI18nStore(options: ReactiveI18nStoreOptions): ReactiveI18nStore
```

**See** [`ReactiveI18nStoreOptions`](#reactivei18nstoreoptions) · [`ReactiveI18nStore`](#reactivei18nstore)

#### `defaultPlural`

Default plural rule, see `pluralForm`. `locale` is the tag for `Intl.PluralRules`: an unknown
one gets the index rule, never the host's locale. Only the picked form is interpolated, with
`params` + `{count}`. Not a string: no plural.

```ts
function defaultPlural(
  key: string,
  count: number,
  params: Params,
  locale: string,
  getter: Getter,
): string | null
```

**See** [`Params`](/api/packages/types#params) · [`Getter`](/api/packages/test-utils#getter)

#### `escapeHtml`

```ts
function escapeHtml(text: string): string
```

#### `externalLinkHref`

The `href` of a link that leaves the app, `undefined` for a route: a bare domain gets `https://`,
anything else already says where it goes.

```ts
function externalLinkHref(to: unknown): string | undefined
```

#### `getByPath`

Own flat key first, then the dotted walk: objects by own key, arrays by index (`list.0`, never `list.length`).
`__proto__` is nothing, even as an own key: `JSON.parse` makes one, and a parsed tree is stored as it is.

```ts
function getByPath(obj: Tree | null | undefined, path: string): unknown
```

**See** [`Tree`](#tree)

#### `hasTranslationValue`

```ts
function hasTranslationValue(obj: Tree | null | undefined, key: string): boolean
```

**See** [`Tree`](#tree)

#### `interpolate`

Replaces `{name}` with `params.name` (`{0}` with an item of a list); a token without an own param stays as written.

```ts
function interpolate(template: string, params: Params | ListParams): string
```

**See** [`Params`](/api/packages/types#params) · [`ListParams`](/api/packages/types#listparams)

#### `isActiveLink`

Whether a link to `link` is active on `current`: the same page, or a section above it. A locale
root (`/de`) is above every page of that locale, so it needs the same page.

```ts
function isActiveLink(
  current: string,
  link: string,
  localeCodes: readonly string[],
): boolean
```

#### `isNoPrefixStrategy`

```ts
function isNoPrefixStrategy(strategy: Strategies): strategy is 'no_prefix'
```

**See** [`Strategies`](/api/packages/types#strategies)

#### `isPlainClick`

A click the app may take over: primary button, no modifier, no `target`, no `download`. The rest are the browser's.

```ts
function isPlainClick(event: MouseEvent): boolean
```

#### `isPrefixAndDefaultStrategy`

```ts
function isPrefixAndDefaultStrategy(
  strategy: Strategies,
): strategy is 'prefix_and_default'
```

**See** [`Strategies`](/api/packages/types#strategies)

#### `isPrefixExceptDefaultStrategy`

```ts
function isPrefixExceptDefaultStrategy(
  strategy: Strategies,
): strategy is 'prefix_except_default'
```

**See** [`Strategies`](/api/packages/types#strategies)

#### `isPrefixStrategy`

```ts
function isPrefixStrategy(strategy: Strategies): strategy is 'prefix'
```

**See** [`Strategies`](/api/packages/types#strategies)

#### `isProduction`

`process.env.NODE_ENV` as bundlers inline it; an unbundled browser has no `process` and counts as development.

```ts
function isProduction(): boolean
```

#### `isSamePage`

Whether two URLs name one page: query, hash and a trailing slash do not count.

```ts
function isSamePage(a: string, b: string): boolean
```

#### `localeIsoMap`

`BaseI18nOptions.localeIso` of a locale list.

```ts
function localeIsoMap(
  locales: readonly { code: string; iso?: string; }[],
): Record<string, string>
```

#### `localizedPath`

`to` in `locale` for a prefix-except-default router: a leading locale segment is replaced, or
dropped for the default locale. Query and hash stay as they are.

```ts
function localizedPath(
  to: string | { path?: string; },
  locale: string,
  localeCodes: readonly string[],
  defaultLocale: string,
): string
```

#### `mergeTranslationChunk`

Deep merge of two trees into a new one; neither input is changed, and the result shares
nothing with `incoming`. Nested objects merge, everything else (arrays, scalars, null) replaces.
Of `existing`, only nodes on the patch's paths are copied.

```ts
function mergeTranslationChunk(
  existing: Tree,
  incoming: Tree,
  options?: MergeTranslationChunkOptions,
): Tree
```

**See** [`Tree`](#tree) · [`MergeTranslationChunkOptions`](#mergetranslationchunkoptions)

#### `mergeTranslationLayers`

Two live layers (`upper` wins) as one tree that answers every key `t()` answers through them.
A `null`/`undefined` in `upper` falls through. Where `upper` replaces an object or an array of
`lower`, its leaves come back as flat dotted keys (`getByPath` reads them first), but for the ones `upper` answers itself.

```ts
function mergeTranslationLayers(lower: Tree, upper: Tree): Tree
```

**See** [`Tree`](#tree)

#### `ownValue`

`obj[key]` if it is the object's own, in one property lookup on the hot path. Only a value
an object could have inherited (a function, or the value `Object.prototype` holds, e.g. after
prototype pollution) is double-checked with `hasOwnProperty`, as is `__proto__`.

```ts
function ownValue(obj: object, key: string): unknown
```

#### `pathEnd`

Where a URL's path ends: its first `?` or `#`, `-1` for neither.

```ts
function pathEnd(url: string): number
```

#### `pathSegments`

The segments of a path, as a browser reads the URL: `\` is a slash and a tab or a newline is dropped, so `/\host` cannot pass for a path.

```ts
function pathSegments(pathname: string): string[]
```

#### `pluralForm`

The picked form of a raw `a | b | c` value, trimmed and not interpolated.

```ts
function pluralForm(translation: string, count: number, locale: string): string
```

#### `resolveCachedTranslation`

`resolveTranslation` with the same per-tree leaf cache the helper uses, for adapters that keep
their own trees (Nuxt's active dictionary). The tree must never be mutated after it is read.

```ts
function resolveCachedTranslation(
  tree: Tree | null | undefined,
  key: string,
): unknown | null
```

**See** [`Tree`](#tree)

#### `resolveText`

The one way from component props to text: which value, which form, which params, html escaping.
`null` when `hideIfEmpty` hides it. Every `<i18n-t>` goes through it, directly or through `renderI18nT`.

```ts
function resolveText(i18n: TextHost, options: ResolveTextOptions): ResolvedText | null
```

**See** [`TextHost`](#texthost) · [`ResolveTextOptions`](#resolvetextoptions) · [`ResolvedText`](#resolvedtext)

#### `resolveTranslation`

`getByPath`, with "nothing there" (missing or `undefined`) as `null`.

```ts
function resolveTranslation(obj: Tree | null | undefined, key: string): unknown | null
```

**See** [`Tree`](#tree)

#### `routeQuery`

The `query` of a route from a search string, as vue-router parses it: `?tag=a&tag=b` gives
`{ tag: ['a', 'b'] }`, `?flag` gives `{ flag: null }`. An empty pair (`?a&&b`) counts for nothing.

```ts
function routeQuery(
  search: string | undefined,
): Record<string, string | null | (string | null)[]>
```

#### `setTranslationAtKey`

A copy of `tree` with `key` set to `value` (replaced, not merged). Only the nodes along the
path are copied; an array keeps its items when the next segment is an index (`list.1`, as
`getByPath` reads it), and any other non-object on the way becomes `{}`. An existing flat key is updated as is.

```ts
function setTranslationAtKey(tree: Tree, key: string, value: unknown): Tree
```

**See** [`Tree`](#tree)

#### `textOf`

`String` of any translation: a subtree may have a `toString` key, which is no method, an array may hold one. Nothing there: `undefined`.

```ts
function textOf(value: unknown): string | undefined
```

#### `tokenize`

`'Hi {a}, {b}!'` → `['Hi ', 'a', ', ', 'b', '!']`: text at even indexes, placeholder names at odd
ones. Works on the raw template, so a param value can never be taken for a placeholder. Cached by
template: the result is shared, do not mutate it.

```ts
function tokenize(template: string): readonly string[]
```

#### `translationCacheKey`

Storage key of one chunk: `locale:route` (`index` when the route is empty).

```ts
function translationCacheKey(locale: string, routeName?: string): string
```

#### `urlPath`

The URL up to its query and hash.

```ts
function urlPath(url: string): string
```

#### `withoutDots`

`/a/b/../c` → `/a/c`, or a `../` would climb out of a locale prefix added later. Read as a browser reads it, `\\` a slash and `%2e` a dot.

```ts
function withoutDots(path: string): string
```

#### `withPrefixStrategy`

```ts
function withPrefixStrategy(
  strategy: Strategies,
): strategy is 'prefix' | 'prefix_and_default'
```

**See** [`Strategies`](/api/packages/types#strategies)

### Classes

#### `BaseI18n`

Translation logic shared by every adapter (`t`, `ts`, `tc`, `tn`, `td`, `tdr`, `has`).
Adapters supply the current locale, fallback locale and route; lookups always read the
storage as it is now (no pinned trees; the helper's leaf cache is keyed by tree identity).

```ts
abstract class BaseI18n {
  constructor(options: BaseI18nOptions = {})
}
```

::collapsible{name="38 members"}
:::field-group
::::field
---
name: "helper"
type: "TranslationHelper"
---

::::
::::field
---
name: "formatter"
type: "FormatService"
---

::::
::::field
---
name: "pluralFunc"
type: "PluralFunc"
---

::::
::::field
---
name: "missingWarn"
type: "boolean"
---

::::
::::field
---
name: "missingHandler"
type: "(locale: string, key: string, routeName: string) => void"
---

::::
::::field
---
name: "getCustomMissingHandler"
type: "() => MissingHandler | null"
---

::::
::::field
---
name: "protected localeIso"
type: "Record<string, string>"
---

::::
::::field
---
name: "abstract getLocale"
type: "() => string"
---

::::
::::field
---
name: "abstract getFallbackLocale"
type: "() => string"
---

::::
::::field
---
name: "abstract getRoute"
type: "() => string"
---

::::
::::field
---
name: "addLocaleIso"
type: "(localeIso: Record<string, string>) => void"
---
Adds to `BaseI18nOptions.localeIso`: a provider knows the locale list, the instance may be built before it.
::::
::::field
---
name: "pluralLocale"
type: "() => string"
---
The tag plurals of the active locale go by: its `iso` when it has one, else the code.
::::
::::field
---
name: "protected touch"
type: "() => void"
---
Called before every read; adapters use it for reactivity tracking.
::::
::::field
---
name: "protected resolveRouteName"
type: "(routeContext?: unknown) => string"
---
Route name of a route context (a string, or whatever an adapter understands).
::::
::::field
---
name: "protected resolveLookup"
type: "(key: TranslationKey, routeContext?: unknown) => unknown | null"
---
Value of `key`, `null` when nothing has it. Layers, first hit wins: the route's chunk, the
locale's root (`index`) chunk, then the same two in the fallback locale. A route chunk holds
only its own keys: root keys are read from the root chunk, never copied into every route.
::::
::::field
---
name: "protected resolveHas"
type: "(key: TranslationKey, routeContext?: unknown) => boolean"
---
Whether the active locale itself (its route or root chunk, not the fallback) defines `key`.
::::
::::field
---
name: "protected resolveTranslationTree"
type: "(lower: Record<string, unknown>, upper: Record<string, unknown>) => Translations"
---
Two live layers as one tree, via `mergeTranslationLayers`; reused while both are the same objects.
::::
::::field
---
name: "resolveTranslations"
type: "(routeContext?: unknown) => Translations"
---
Everything `t()` can resolve right now for the active locale and route: its layers as one tree (read-only).
::::
::::field
---
name: "protected onTranslationsChanged"
type: "(_locale?: string) => void"
---
Called after every write (load, merge, set, clear): the one place adapters bump their reactivity.
`locale` is set when one locale's chunk was written, unset when anything may have changed.
::::
::::field
---
name: "protected getMissingContext"
type: "(routeContext?: unknown) => { locale: string; routeName: string; }"
---

::::
::::field
---
name: "protected warnDev"
type: "(message: string) => void"
---
Dev-only browser `console.warn`, gated by `missingWarn`.
::::
::::field
---
name: "protected warnMissing"
type: "(key: TranslationKey, routeContext?: unknown) => void"
---

::::
::::field
---
name: "protected warnMissingFormat"
type: "(kind: 'number' | 'datetime', key: string, locale: string) => void"
---

::::
::::field
---
name: "t"
type: "(key: TranslationKey, params?: Params | ListParams, defaultValue?: string | null, routeContext?: unknown) => CleanTranslation"
---

::::
::::field
---
name: "ts"
type: "(key: TranslationKey, params?: Params | ListParams, defaultValue?: string, routeContext?: unknown) => string"
---

::::
::::field
---
name: "tc"
type: "(key: TranslationKey, count: number | Params, defaultValue?: string) => string"
---

::::
::::field
---
name: "tn"
type: "(value: number, options?: Intl.NumberFormatOptions) => string"
---
Format a number; Vue I18n-style named formats: `tn(1000, 'currency')`.
::::
::::field
---
name: "tn"
type: "(value: number, key: string, overrides?: Intl.NumberFormatOptions) => string"
---

::::
::::field
---
name: "tn"
type: "(value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions) => string"
---

::::
::::field
---
name: "td"
type: "(value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string"
---
Format a date; Vue I18n-style named formats: `td(date, 'short')`.
::::
::::field
---
name: "td"
type: "(value: Date | number | string, key: string, overrides?: Intl.DateTimeFormatOptions) => string"
---

::::
::::field
---
name: "td"
type: "(value: Date | number | string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions) => string"
---

::::
::::field
---
name: "tdr"
type: "(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions) => string"
---

::::
::::field
---
name: "has"
type: "(key: TranslationKey, routeContext?: unknown) => boolean"
---

::::
::::field
---
name: "setTranslation"
type: "(key: TranslationKey, value: unknown) => void"
---
Replace the value at `key` in the active locale and route (a subtree, a string, anything):
`set`, not `merge`, so siblings under `key` are dropped. Visible to `t()` at once.
::::
::::field
---
name: "clearCache"
type: "() => void"
---
Clear translation and formatter caches.
::::
::::field
---
name: "loadTranslationsCore"
type: "(locale: string, translations: Translations, merge: boolean, routeName = 'index') => void"
---
Load a chunk: deep-merge, or replace it when `merge` is false. Root keys come from the root chunk (`index`).
::::
::::field
---
name: "extend"
type: "<M extends Record<string, unknown>>(methods: M & ThisType<this & M>) => this & M"
---
Attach framework-specific helpers onto this instance (`localizePath`, …).
::::
:::
::

**See** [`BaseI18nOptions`](#basei18noptions)

#### `FormatService`

Cached `Intl` formatters and Vue I18n-compatible named formats (`numberFormats`,
`datetimeFormats`) for `tn(1000, 'currency')` / `td(date, 'short')`.

```ts
class FormatService {
  constructor(options: FormatServiceOptions = {})
}
```

::collapsible{name="13 members"}
:::field-group
::::field
---
name: "setNumberFormats"
type: "(formats: NumberFormatsConfig) => void"
---

::::
::::field
---
name: "setDateTimeFormats"
type: "(formats: DateTimeFormatsConfig) => void"
---

::::
::::field
---
name: "getNumberFormats"
type: "() => NumberFormatsConfig"
---

::::
::::field
---
name: "getDateTimeFormats"
type: "() => DateTimeFormatsConfig"
---

::::
::::field
---
name: "clearCache"
type: "() => void"
---

::::
::::field
---
name: "resolveNumberFormat"
type: "(locale: string, key: string) => Intl.NumberFormatOptions | undefined"
---

::::
::::field
---
name: "resolveDateTimeFormat"
type: "(locale: string, key: string) => Intl.DateTimeFormatOptions | undefined"
---

::::
::::field
---
name: "getNumberFormatter"
type: "(locale: string, options?: Intl.NumberFormatOptions) => Intl.NumberFormat"
---

::::
::::field
---
name: "getDateTimeFormatter"
type: "(locale: string, options?: Intl.DateTimeFormatOptions) => Intl.DateTimeFormat"
---

::::
::::field
---
name: "getRelativeTimeFormatter"
type: "(locale: string, options?: Intl.RelativeTimeFormatOptions) => Intl.RelativeTimeFormat"
---

::::
::::field
---
name: "formatNumber"
type: "(value: number, locale: string, options?: Intl.NumberFormatOptions) => string"
---

::::
::::field
---
name: "formatDate"
type: "(value: Date | number | string, locale: string, options?: Intl.DateTimeFormatOptions) => string"
---

::::
::::field
---
name: "formatRelativeTime"
type: "(value: Date | number | string, locale: string, options?: Intl.RelativeTimeFormatOptions) => string"
---
`3 days ago` / `in 3 days`: the largest unit that fits at least once, rounded down; `Invalid Date` like `formatDate`.
::::
:::
::

**See** [`FormatServiceOptions`](#formatserviceoptions)

#### `TranslationHelper`

Reads and writes chunks of a `TranslationStorage`.

Every lookup starts from the Map as it is now, so writes made straight to
`storage.translations` (or by another helper on the same storage) are seen at once.

Stored trees are treated as immutable: a merge copies the nodes on the patch's paths and
stores a new root. Trees handed in by callers, returned by `t()` / `getCache`, shared between
route chunks or cloned storages stay as they were. Replace a chunk instead of editing one in place.

```ts
class TranslationHelper {
  constructor(storage?: TranslationStorage)
}
```

::collapsible{name="9 members"}
:::field-group
::::field
---
name: "readonly translations"
type: "Map<string, Translations>"
---

::::
::::field
---
name: "getCache"
type: "(locale: string, routeName: string) => Translations | undefined"
---

::::
::::field
---
name: "hasCache"
type: "(locale: string, routeName: string) => boolean"
---

::::
::::field
---
name: "getTranslation"
type: "<T = unknown>(locale: string, routeName: string, key: string) => T | null"
---

::::
::::field
---
name: "lookup"
type: "(chunkKey: string, key: string) => unknown | null"
---
Lookup by a ready chunk key (hot path: callers reuse the key string).
::::
::::field
---
name: "hasTranslation"
type: "(locale: string, key: string) => boolean"
---
Whether any chunk of `locale` (any route) holds `key`.
::::
::::field
---
name: "setTranslations"
type: "(locale: string, data: Translations, routeName = 'index') => void"
---
Replaces the chunk (stored as given, not copied: the caller hands it over).
::::
::::field
---
name: "mergeTranslation"
type: "(locale: string, routeName: string, incoming: Translations) => void"
---
Deep-merges into the chunk; incoming wins.
::::
::::field
---
name: "clearCache"
type: "() => void"
---

::::
:::
::

**See** [`TranslationStorage`](#translationstorage)

### Types

#### `BaseI18nOptions`

```ts
interface BaseI18nOptions
```

::collapsible{name="12 properties"}
:::field-group
::::field
---
name: "storage"
type: "TranslationStorage"
---

::::
::::field
---
name: "helper"
type: "TranslationHelper"
---
Instead of `storage`: a helper of the adapter's own, such as a fork's copy-on-write one.
::::
::::field
---
name: "formatter"
type: "FormatService"
---
Shared formatters: a request instance keeps its parent's `Intl` objects, which are costly to build.
::::
::::field
---
name: "plural"
type: "PluralFunc"
---

::::
::::field
---
name: "missingWarn"
type: "boolean"
---

::::
::::field
---
name: "missingHandler"
type: "(locale: string, key: string, routeName: string) => void"
---

::::
::::field
---
name: "getCustomMissingHandler"
type: "() => MissingHandler | null"
---

::::
::::field
---
name: "numberFormats"
type: "NumberFormatsConfig"
---
Named number formats per locale (Vue I18n-compatible).
::::
::::field
---
name: "datetimeFormats"
type: "DateTimeFormatsConfig"
---
Named datetime formats per locale (Vue I18n-compatible `datetimeFormats`).
::::
::::field
---
name: "timeZone"
type: "string"
---
IANA zone for dates (`Europe/Berlin`): set it so server and browser render one date.
::::
::::field
---
name: "now"
type: "() => number"
---
The clock of relative dates: hand hydration the server's time so both render one text.
::::
::::field
---
name: "localeIso"
type: "Record<string, string>"
---
BCP 47 tag per locale code (`iso`), for a code that is no language tag: `ua` → `uk-UA`.
::::
:::
::

#### `DateTimeFormatsConfig`

```ts
type DateTimeFormatsConfig = Record<string, Record<string, Intl.DateTimeFormatOptions>>
```

#### `FormatServiceOptions`

```ts
interface FormatServiceOptions
```

::field-group
:::field
---
name: "numberFormats"
type: "NumberFormatsConfig"
---

:::
:::field
---
name: "datetimeFormats"
type: "DateTimeFormatsConfig"
---
Vue I18n-compatible name (`datetimeFormats`).
:::
:::field
---
name: "timeZone"
type: "string"
---
IANA zone for dates; a format's own `timeZone` wins. Unset: the runtime's zone.
:::
:::field
---
name: "now"
type: "() => number"
---
The clock of relative dates: hand hydration the server's time so both render one text. Unset: `Date.now`.
:::
::

#### `MergeTranslationChunkOptions`

```ts
interface MergeTranslationChunkOptions
```

::field-group
:::field
---
name: "preserveExisting"
type: "boolean"
---
When true, existing keys win over incoming. Default: incoming wins.
:::
::

#### `NumberFormatsConfig`

```ts
type NumberFormatsConfig = Record<string, Record<string, Intl.NumberFormatOptions>>
```

#### `ReactiveI18nStore`

```ts
interface ReactiveI18nStore
```

::collapsible{name="9 properties"}
:::field-group
::::field
---
name: "subscribe"
type: "(listener: () => void) => () => void"
required: true
---

::::
::::field
---
name: "getSnapshot"
type: "() => string"
required: true
---

::::
::::field
---
name: "getLocale"
type: "() => string"
required: true
---

::::
::::field
---
name: "setLocale"
type: "(locale: string) => void"
required: true
---

::::
::::field
---
name: "getFallbackLocale"
type: "() => string"
required: true
---

::::
::::field
---
name: "setFallbackLocale"
type: "(locale: string) => void"
required: true
---

::::
::::field
---
name: "getRoute"
type: "() => string"
required: true
---

::::
::::field
---
name: "setRoute"
type: "(routeName: string) => void"
required: true
---

::::
::::field
---
name: "notify"
type: "() => void"
required: true
---

::::
:::
::

#### `ReactiveI18nStoreOptions`

Shared reactive state for framework i18n adapters (subscribe / getSnapshot / notify).

```ts
interface ReactiveI18nStoreOptions
```

::field-group
:::field
---
name: "locale"
type: "string"
required: true
---

:::
:::field
---
name: "fallbackLocale"
type: "string"
---

:::
:::field
---
name: "route"
type: "string"
---

:::
::

#### `ResolvedText`

A raw template and its values. `interpolate` makes it a string; `tokenize` gives a renderer the parts.

```ts
interface ResolvedText
```

::field-group
:::field
---
name: "template"
type: "string"
required: true
---

:::
:::field
---
name: "params"
type: "Params"
required: true
---

:::
::

#### `ResolveTextOptions`

```ts
interface ResolveTextOptions
```

::collapsible{name="10 properties"}
:::field-group
::::field
---
name: "keypath"
type: "TranslationKey"
required: true
---

::::
::::field
---
name: "params"
type: "Params"
---

::::
::::field
---
name: "html"
type: "boolean"
---
The result goes into markup: param values are escaped, the translation is not.
::::
::::field
---
name: "hideIfEmpty"
type: "boolean"
---
Answer `null` when the text is blank.
::::
::::field
---
name: "defaultValue"
type: "string"
---
Stands in for a missing key; the renderer also shows it when `hideIfEmpty` hides the text.
::::
::::field
---
name: "plural"
type: "number | string | null"
---

::::
::::field
---
name: "customPluralRule"
type: "PluralFunc | null"
---
Replaces the configured plural rule; its answer is used as is, `null` being empty.
::::
::::field
---
name: "number"
type: "number | string | null"
---

::::
::::field
---
name: "date"
type: "Date | number | string | null"
---

::::
::::field
---
name: "relativeDate"
type: "Date | number | string | null"
---

::::
:::
::

#### `TextHost`

What `resolveText` needs from an i18n instance.

```ts
interface TextHost
```

::collapsible{name="9 properties"}
:::field-group
::::field
---
name: "pluralFunc"
type: "PluralFunc"
required: true
---

::::
::::field
---
name: "getLocale"
type: "() => string"
required: true
---

::::
::::field
---
name: "pluralLocale"
type: "() => string"
---
The tag plurals go by, when it is not the locale code.
::::
::::field
---
name: "has"
type: "(key: TranslationKey) => boolean"
---
Whether the key has a translation: tells a miss from a translation equal to what stands for one.
::::
::::field
---
name: "t"
type: "(key: TranslationKey, params?: Params | ListParams, defaultValue?: string | null) => CleanTranslation"
required: true
---

::::
::::field
---
name: "tc"
type: "(key: TranslationKey, count: number | Params, defaultValue?: string) => string"
required: true
---

::::
::::field
---
name: "tn"
type: "(value: number) => string"
required: true
---

::::
::::field
---
name: "td"
type: "(value: Date | number | string) => string"
required: true
---

::::
::::field
---
name: "tdr"
type: "(value: Date | number | string) => string"
required: true
---

::::
:::
::

#### `TranslationStorage`

Chunks keyed `locale:route`, each a nested tree. Adapters may share one between instances.

```ts
interface TranslationStorage
```

::field-group
:::field
---
name: "translations"
type: "Map<string, Translations>"
required: true
---

:::
::

#### `Tree`

Translation trees: plain JSON objects whose leaves are strings, numbers, arrays, null.

Keys are read the way `t()` reads them: an own flat key (`'a.b': 'x'`) wins over the dotted
walk. `__proto__` is never read through or written, so no tree can reach a prototype.

```ts
type Tree = Record<string, unknown>
```

## `@i18n-micro/core/devtools`

### Functions

#### `buildInspectorState`

```ts
function buildInspectorState(
  snapshot: I18nDevtoolsStateSnapshot,
): Record<string, Array<{ key: string; value: unknown; editable?: boolean; }>>
```

**See** [`I18nDevtoolsStateSnapshot`](#i18ndevtoolsstatesnapshot)

#### `buildInspectorTree`

```ts
function buildInspectorTree(
  options: BuildInspectorTreeOptions,
): I18nDevtoolsInspectorNode[]
```

**See** [`BuildInspectorTreeOptions`](#buildinspectortreeoptions) · [`I18nDevtoolsInspectorNode`](#i18ndevtoolsinspectornode)

#### `countTranslationKeys`

Number of distinct dotted paths (objects and leaves) in a tree.

```ts
function countTranslationKeys(
  translations: Translations | Record<string, unknown> | undefined,
): number
```

**See** [`Translations`](/api/packages/types#translations)

#### `decodeInspectorPath`

```ts
function decodeInspectorPath(encoded: string): string[]
```

#### `encodeInspectorPath`

Encode path segments so a literal key `"a.b"` and the nested path `a → b` get distinct ids.

```ts
function encodeInspectorPath(segments: string[]): string
```

#### `flattenTranslationNode`

```ts
function flattenTranslationNode(
  obj: Record<string, unknown>,
  parentSegments?: string[],
): I18nDevtoolsInspectorNode[]
```

**See** [`I18nDevtoolsInspectorNode`](#i18ndevtoolsinspectornode)

#### `getByInspectorPath`

```ts
function getByInspectorPath(obj: Record<string, unknown>, segments: string[]): unknown
```

#### `parseInspectorNodeId`

```ts
function parseInspectorNodeId(
  nodeId: string,
): { kind: 'root' | 'active' | 'locale' | 'chunk' | 'key'; locale?: string; routeName?: string; path?: string; segments?: string[]; }
```

### Types

#### `BuildInspectorTreeOptions`

```ts
interface BuildInspectorTreeOptions
```

::field-group
:::field
---
name: "nodeId"
type: "string"
required: true
---

:::
:::field
---
name: "storage"
type: "TranslationStorage"
required: true
---

:::
:::field
---
name: "configuredLocales"
type: "Locale[]"
required: true
---

:::
:::field
---
name: "activeLocale"
type: "string"
required: true
---

:::
:::field
---
name: "activeRouteName"
type: "string"
required: true
---

:::
:::field
---
name: "activeTranslations"
type: "Record<string, unknown>"
---

:::
::

#### `I18nDevtoolsInspectorNode`

```ts
interface I18nDevtoolsInspectorNode
```

::field-group
:::field
---
name: "id"
type: "string"
required: true
---

:::
:::field
---
name: "label"
type: "string"
required: true
---

:::
:::field
---
name: "children"
type: "I18nDevtoolsInspectorNode[]"
---

:::
:::field
---
name: "tags"
type: "Array<{ label: string; textColor: number; backgroundColor: number; tooltip?: string; }>"
---

:::
::

#### `I18nDevtoolsStateSnapshot`

```ts
interface I18nDevtoolsStateSnapshot
```

::field-group
:::field
---
name: "locale"
type: "string"
required: true
---

:::
:::field
---
name: "routeName"
type: "string"
required: true
---

:::
:::field
---
name: "strategy"
type: "string"
---

:::
:::field
---
name: "defaultLocale"
type: "string"
---

:::
:::field
---
name: "fallbackLocale"
type: "string"
---

:::
:::field
---
name: "cachedChunks"
type: "number"
required: true
---

:::
:::field
---
name: "locales"
type: "Array<{ code: string; displayName?: string; disabled?: boolean; }>"
required: true
---

:::
::

## `@i18n-micro/core/helpers`

Also exports, as `@i18n-micro/core` does: [`collectTranslationPaths`](#collecttranslationpaths) · [`convertible`](#convertible) · [`defaultPlural`](#defaultplural) · [`escapeHtml`](#escapehtml) · [`externalLinkHref`](#externallinkhref) · [`getByPath`](#getbypath) · [`hasTranslationValue`](#hastranslationvalue) · [`interpolate`](#interpolate) · [`isActiveLink`](#isactivelink) · [`isNoPrefixStrategy`](#isnoprefixstrategy) · [`isPlainClick`](#isplainclick) · [`isPrefixAndDefaultStrategy`](#isprefixanddefaultstrategy) · [`isPrefixExceptDefaultStrategy`](#isprefixexceptdefaultstrategy) · [`isPrefixStrategy`](#isprefixstrategy) · [`isProduction`](#isproduction) · [`isSamePage`](#issamepage) · [`localeIsoMap`](#localeisomap) · [`localizedPath`](#localizedpath) · [`mergeTranslationChunk`](#mergetranslationchunk) · [`mergeTranslationLayers`](#mergetranslationlayers) · [`ownValue`](#ownvalue) · [`pathEnd`](#pathend) · [`pathSegments`](#pathsegments) · [`pluralForm`](#pluralform) · [`resolveText`](#resolvetext) · [`resolveTranslation`](#resolvetranslation) · [`routeQuery`](#routequery) · [`setTranslationAtKey`](#settranslationatkey) · [`textOf`](#textof) · [`tokenize`](#tokenize) · [`translationCacheKey`](#translationcachekey) · [`urlPath`](#urlpath) · [`withoutDots`](#withoutdots) · [`withPrefixStrategy`](#withprefixstrategy) · [`MergeTranslationChunkOptions`](#mergetranslationchunkoptions) · [`ResolvedText`](#resolvedtext) · [`ResolveTextOptions`](#resolvetextoptions) · [`TextHost`](#texthost) · [`Tree`](#tree).

## `@i18n-micro/core/render`

Also exports, as `@i18n-micro/core` does: [`ResolveTextOptions`](#resolvetextoptions) · [`TextHost`](#texthost).

### Functions

#### `createLocaleSwitcher`

One locale switcher for both sides. Call it from `setup`: it owns the open state and the document
listeners, and returns the render function.

```ts
function createLocaleSwitcher(
  vue: SwitcherVue,
  adapter: SwitcherAdapter,
  props: SwitcherProps,
  slots: RenderSlots,
): () => unknown
```

**See** [`SwitcherVue`](#switchervue) · [`SwitcherAdapter`](#switcheradapter) · [`SwitcherProps`](#switcherprops) · [`RenderSlots`](#renderslots)

#### `foldTemplate`

The template as children, one pass over its raw tokens: a slot, else a param, else the token as
written. A slot's fragment is keyed by name and occurrence, so a locale that reorders placeholders
moves the slot's DOM instead of rebuilding it.

```ts
function foldTemplate(
  renderSlot: (slot: RenderSlot, key: string) => unknown,
  template: string,
  params: Record<string, unknown>,
  slots: RenderSlots,
  textChild?: (text: string) => unknown,
): unknown
```

**See** [`RenderSlot`](#renderslot) · [`RenderSlots`](#renderslots)

#### `renderI18nT`

One `<i18n-t>`: `resolveText`, then markup, a default slot, or the folded template.

```ts
function renderI18nT(
  api: RenderApi,
  i18n: TextHost,
  props: I18nTRenderProps,
  slots: RenderSlots,
  attrs: Record<string, unknown>,
): unknown
```

**See** [`RenderApi`](#renderapi) · [`TextHost`](#texthost) · [`I18nTRenderProps`](#i18ntrenderprops) · [`RenderSlots`](#renderslots)

### Constants

#### `SWITCHER_STYLES`

One look for every switcher; the React family spreads these, Solid converts the names.

```ts
const SWITCHER_STYLES: {
  wrapper: object;
  button: object;
  dropdown: object;
  item: object;
  link: object;
  activeLink: object;
  icon: object;
  openIcon: object;
}
```

### Types

#### `I18nTRenderProps`

```ts
interface I18nTRenderProps extends ResolveTextOptions
```

::field-group
:::field
---
name: "tag"
type: "string"
---

:::
::

**See** [`ResolveTextOptions`](#resolvetextoptions)

#### `RenderApi`

Vue's own functions, handed in: `@i18n-micro/vue` and the Nuxt module render with one code path,
and neither core nor the module depends on the other's copy of anything.

```ts
interface RenderApi
```

::field-group
:::field
---
name: "h"
type: "(type: any, props?: any, children?: any) => any"
required: true
---

:::
:::field
---
name: "Fragment"
type: "unknown"
required: true
---

:::
:::field
---
name: "markup"
type: "(html: string) => Record<string, unknown>"
---
The props putting trusted markup into an element. Vue's `innerHTML` when unset.
:::
:::field
---
name: "dated"
type: "Record<string, unknown>"
---
The props telling hydration that clock-dependent text may differ. Vue's `data-allow-mismatch` when unset.
:::
::

#### `RenderSlot`

```ts
type RenderSlot = (props?: Record<string, unknown>) => unknown
```

#### `RenderSlots`

```ts
type RenderSlots = Readonly<Record<string, RenderSlot | undefined>>
```

**See** [`RenderSlot`](#renderslot)

#### `SwitcherAdapter`

What a side supplies: its locales, its URLs and its navigation.

```ts
interface SwitcherAdapter
```

::field-group
:::field
---
name: "locales"
type: "() => Locale[]"
required: true
---
Every locale, disabled ones too: a disabled current locale still labels the button.
:::
:::field
---
name: "locale"
type: "() => string"
required: true
---

:::
:::field
---
name: "localeName"
type: "() => string | null"
---
The label of a current locale missing from `locales`.
:::
:::field
---
name: "href"
type: "(code: string) => string"
required: true
---

:::
:::field
---
name: "select"
type: "(code: string) => void"
required: true
---
The one navigation of a plain click; a modified click is left to the browser.
:::
:::field
---
name: "browserNavigates"
type: "() => boolean"
---
The click is the browser's: `href` is a real page and nothing here navigates. `select` still runs.
:::
:::field
---
name: "keepList"
type: "boolean"
---
Render the closed list too, so server HTML holds the links.
:::
:::field
---
name: "onMissingLabel"
type: "(code: string) => void"
---

:::
::

#### `SwitcherProps`

The `custom*Style` props of the switcher, each merged over the part it names.

```ts
interface SwitcherProps
```

::collapsible{name="9 properties"}
:::field-group
::::field
---
name: "customLabels"
type: "Record<string, string>"
---

::::
::::field
---
name: "customWrapperStyle"
type: "Style"
---

::::
::::field
---
name: "customButtonStyle"
type: "Style"
---

::::
::::field
---
name: "customDropdownStyle"
type: "Style"
---

::::
::::field
---
name: "customItemStyle"
type: "Style"
---

::::
::::field
---
name: "customLinkStyle"
type: "Style"
---

::::
::::field
---
name: "customActiveLinkStyle"
type: "Style"
---

::::
::::field
---
name: "customDisabledLinkStyle"
type: "Style"
---

::::
::::field
---
name: "customIconStyle"
type: "Style"
---

::::
:::
::

#### `SwitcherVue`

```ts
interface SwitcherVue extends RenderApi
```

::field-group
:::field
---
name: "ref"
type: "<T>(value: T) => { value: T; }"
required: true
---

:::
:::field
---
name: "onMounted"
type: "(hook: () => void) => void"
required: true
---

:::
:::field
---
name: "onUnmounted"
type: "(hook: () => void) => void"
required: true
---

:::
::

**See** [`RenderApi`](#renderapi)

---

Generated from the TypeScript sources and their JSDoc by `pnpm run docs:generate`.
Back to [all packages](/api/packages) · [Integration guides](/integrations/)
