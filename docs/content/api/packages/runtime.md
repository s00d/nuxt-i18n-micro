---
title: '@i18n-micro/runtime'
description: 'Exported API of @i18n-micro/runtime, generated from the source.'
navigation:
  title: 'runtime'
---

# `@i18n-micro/runtime`

Framework-agnostic i18n runtime for vanilla TypeScript/JavaScript (browser and Node).

```ts
import { … } from '@i18n-micro/runtime'
```

## Functions

### `createI18n`

```ts
function createI18n(options: I18nOptions): I18n
```

**See** [`I18nOptions`](#i18noptions) · [`I18n`](#i18n)

### `fetchJsonTranslations`

Fetch a JSON translation document from a URL (browser or any fetch-capable runtime).

```ts
function fetchJsonTranslations(url: string, init?: RequestInit): Promise<Translations>
```

**See** [`Translations`](/api/packages/types#translations)

## Classes

### `I18n`

```ts
class I18n extends BaseI18n {
  constructor(options: I18nOptions)
}
```

::collapsible{name="22 members"}
:::field-group
::::field
---
name: "protected readonly ownStore"
type: "ReactiveI18nStore"
---

::::
::::field
---
name: "storage"
type: "TranslationStorage"
---
The chunks of this instance. Handing them out detaches a fork: what the caller does with them stays here.
::::
::::field
---
name: "protected store"
type: "ReactiveI18nStore"
---
The locale, fallback and route state in force. An adapter with per-request state answers its own.
::::
::::field
---
name: "fork"
type: "(locale: string = this.getLocale()) => this"
---
A cheap instance for one request or task: own locale, fallback and route, the same dictionaries,
formatters and rules. It sees writes to the parent until its first own write; its writes stay in it.
Forking a fork counts as that fork's first write.
::::
::::field
---
name: "subscribe"
type: "(listener: () => void) => () => void"
---

::::
::::field
---
name: "getSnapshot"
type: "() => string"
---

::::
::::field
---
name: "locale"
type: "string"
---

::::
::::field
---
name: "fallbackLocale"
type: "string"
---

::::
::::field
---
name: "currentRoute"
type: "string"
---

::::
::::field
---
name: "setRoute"
type: "(routeName: string) => void"
---

::::
::::field
---
name: "getLocale"
type: "() => string"
---

::::
::::field
---
name: "getFallbackLocale"
type: "() => string"
---

::::
::::field
---
name: "getRoute"
type: "() => string"
---

::::
::::field
---
name: "loadMessages"
type: "(messages?: Record<string, Translations>, routeMessages?: Record<string, Record<string, Translations>>) => void"
---
Load root and optional route-scoped translation maps into the instance. A route chunk holds
the route's own keys; root keys resolve from the root chunk (also ones added later).
::::
::::field
---
name: "addLocaleIso"
type: "(localeIso: Record<string, string>, notify = true) => void"
---
Text on screen follows a new plural tag. A render passes `notify: false`: it must not wake other components.
::::
::::field
---
name: "loadFromUrl"
type: "(url: string, options: LoadFromUrlOptions = {}) => Promise<void>"
---

::::
::::field
---
name: "loadFromUrls"
type: "(entries: LoadFromUrlEntry[]) => Promise<void>"
---
All or nothing: a failed fetch leaves the dictionaries as they were. Merged in entry order.
::::
::::field
---
name: "addTranslations"
type: "(locale: string, translations: Translations, merge = true) => void"
---

::::
::::field
---
name: "addRouteTranslations"
type: "(locale: string, routeName: string, translations: Translations, merge = true) => void"
---

::::
::::field
---
name: "hasTranslation"
type: "(key: TranslationKey) => boolean"
---

::::
::::field
---
name: "clear"
type: "() => void"
---

::::
::::field
---
name: "protected onTranslationsChanged"
type: "(locale?: string) => void"
---
Called after every write (load, merge, set, clear): the one place adapters bump their reactivity.
`locale` is set when one locale's chunk was written, unset when anything may have changed.
::::
:::
::

**See** [`BaseI18n`](/api/packages/core#basei18n) · [`I18nOptions`](#i18noptions)

## Types

### `I18nOptions`

```ts
interface I18nOptions
```

::collapsible{name="13 properties"}
:::field-group
::::field
---
name: "locale"
type: "string"
required: true
---

::::
::::field
---
name: "fallbackLocale"
type: "string"
---

::::
::::field
---
name: "messages"
type: "Record<string, Translations>"
---
Root translations keyed by locale code.
::::
::::field
---
name: "routeMessages"
type: "Record<string, Record<string, Translations>>"
---
Route-specific translations: routeName → locale → messages.
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
name: "numberFormats"
type: "NumberFormatsConfig"
---
Named number formats per locale (`tn(n, 'currency')`).
::::
::::field
---
name: "datetimeFormats"
type: "DateTimeFormatsConfig"
---
Named datetime formats per locale (`td(d, 'short')`).
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
BCP 47 tag per locale code (`iso`), for a code that is no language tag: `ua` → `uk-UA`. `localeIsoMap(locales)` builds it.
::::
::::field
---
name: "parent"
type: "I18n"
---
Set by `fork()`: the instance whose dictionaries, formatters and rules this one shares.
::::
:::
::

### `LoadFromUrlEntry`

```ts
interface LoadFromUrlEntry extends LoadFromUrlOptions
```

::field-group
:::field
---
name: "url"
type: "string"
required: true
---

:::
:::field
---
name: "locale"
type: "string"
required: true
---

:::
::

**See** [`LoadFromUrlOptions`](#loadfromurloptions)

### `LoadFromUrlOptions`

```ts
interface LoadFromUrlOptions
```

::field-group
:::field
---
name: "locale"
type: "string"
---

:::
:::field
---
name: "routeName"
type: "string"
---

:::
:::field
---
name: "init"
type: "RequestInit"
---

:::
::

## Re-exports

Declared in another package of this repository and documented on its page.

- From [`@i18n-micro/core`](/api/packages/core): [`interpolate`](/api/packages/core#interpolate) · [`localeIsoMap`](/api/packages/core#localeisomap) · [`FormatService`](/api/packages/core#formatservice) · [`TranslationStorage`](/api/packages/core#translationstorage)
- From [`@i18n-micro/types`](/api/packages/types): [`CleanTranslation`](/api/packages/types#cleantranslation) · [`Getter`](/api/packages/types#getter) · [`Locale`](/api/packages/types#locale) · [`LocaleCode`](/api/packages/types#localecode) · [`Params`](/api/packages/types#params) · [`PluralFunc`](/api/packages/types#pluralfunc) · [`Translations`](/api/packages/types#translations)

---

Generated from the TypeScript sources and their JSDoc by `pnpm run docs:generate`.
Back to [all packages](/api/packages) · [Integration guides](/integrations/)
