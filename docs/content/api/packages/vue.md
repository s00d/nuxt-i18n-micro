---
title: '@i18n-micro/vue'
description: 'Exported API of @i18n-micro/vue, generated from the source.'
navigation:
  title: 'vue'
---

# `@i18n-micro/vue`

Vue 3 bindings for i18n-micro — composables, components, and routing helpers.

Entry points: `@i18n-micro/vue`, `@i18n-micro/vue/router`.

## `@i18n-micro/vue`

### Components

#### `I18nGroup`

```ts
const I18nGroup: DefineComponent
```

::field-group
:::field
---
name: "prefix"
type: "string"
required: true
---

:::
:::field
---
name: "groupClass"
type: "string"
---
**Default** `''`
:::
::

#### `I18nLink`

```ts
const I18nLink: DefineComponent
```

::field-group
:::field
---
name: "to"
type: "I18nRouteTarget"
required: true
---

:::
:::field
---
name: "activeStyle"
type: "CSSProperties"
---
**Default** `{}`
:::
:::field
---
name: "localeRoute"
type: "(to: I18nRouteTarget, locale?: string) => string | { path?: string; }"
---

:::
::

#### `I18nSwitcher`

```ts
const I18nSwitcher: DefineComponent
```

::collapsible{name="14 props"}
:::field-group
::::field
---
name: "customLabels"
type: "Record<string, string>"
---
**Default** `{}`
::::
::::field
---
name: "customWrapperStyle"
type: "CSSProperties"
---
**Default** `{}`
::::
::::field
---
name: "customButtonStyle"
type: "CSSProperties"
---
**Default** `{}`
::::
::::field
---
name: "customDropdownStyle"
type: "CSSProperties"
---
**Default** `{}`
::::
::::field
---
name: "customItemStyle"
type: "CSSProperties"
---
**Default** `{}`
::::
::::field
---
name: "customLinkStyle"
type: "CSSProperties"
---
**Default** `{}`
::::
::::field
---
name: "customActiveLinkStyle"
type: "CSSProperties"
---
**Default** `{}`
::::
::::field
---
name: "customDisabledLinkStyle"
type: "CSSProperties"
---
**Default** `{}` · Inline style applied to the switcher button when the *current* locale is
marked as `disabled: true` in the locale config. Note: disabled locales are omitted from the dropdown list, but the current
locale label is still shown on the button.
::::
::::field
---
name: "customIconStyle"
type: "CSSProperties"
---
**Default** `{}`
::::
::::field
---
name: "locales"
type: "Locale[]"
---

::::
::::field
---
name: "currentLocale"
type: "string | (() => string)"
---

::::
::::field
---
name: "getLocaleName"
type: "() => string | null"
---

::::
::::field
---
name: "switchLocale"
type: "(locale: string) => void"
---

::::
::::field
---
name: "localeRoute"
type: "(to: string | { path?: string; }, locale?: string) => string | { path?: string; }"
---

::::
:::
::

#### `I18nT`

```ts
function I18nT(props: I18nTProps): any
```

**See** [`I18nTProps`](#i18ntprops)

### Composables

#### `useI18n`

Get the i18n instance from the Vue app context
Returns the same instance that was created with createI18n()

```ts
function useI18n(options?: UseI18nOptions): { … }
```

::collapsible{name="24 properties"}
:::field-group
::::field
---
name: "instance"
type: "VueI18n"
required: true
---

::::
::::field
---
name: "locale"
type: "WritableComputedRef<string, string>"
required: true
---

::::
::::field
---
name: "getLocales"
type: "() => Locale[]"
required: true
---

::::
::::field
---
name: "defaultLocale"
type: "() => string"
required: true
---

::::
::::field
---
name: "getLocaleName"
type: "() => string | null"
required: true
---

::::
::::field
---
name: "localeRoute"
type: "(to: I18nRouteTarget, localeCode?: string) => I18nRouteTarget"
required: true
---

::::
::::field
---
name: "localePath"
type: "(to: I18nRouteTarget, locale?: string) => string"
required: true
---

::::
::::field
---
name: "switchLocale"
type: "(newLocale: string) => void"
required: true
---

::::
::::field
---
name: "t"
type: "(key: TranslationKey, params?: TranslateParams, defaultValue?: string | null, routeContext?: unknown) => CleanTranslation"
required: true
---

::::
::::field
---
name: "ts"
type: "(key: TranslationKey, params?: TranslateParams, defaultValue?: string, routeContext?: unknown) => string"
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
type: "{ (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }"
required: true
---

::::
::::field
---
name: "td"
type: "{ (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string; (value: Date | number | string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date | number | string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }"
required: true
---

::::
::::field
---
name: "tdr"
type: "(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions) => string"
required: true
---

::::
::::field
---
name: "has"
type: "(key: TranslationKey, routeContext?: unknown) => boolean"
required: true
---

::::
::::field
---
name: "resolveTranslations"
type: "(routeContext?: unknown) => Translations"
required: true
---

::::
::::field
---
name: "setTranslation"
type: "(key: TranslationKey, value: unknown) => void"
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
name: "getRoute"
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
name: "addTranslations"
type: "(locale: string, translations: Translations, merge?: boolean) => void"
required: true
---

::::
::::field
---
name: "addRouteTranslations"
type: "(locale: string, routeName: string, translations: Translations, merge?: boolean) => void"
required: true
---

::::
::::field
---
name: "mergeTranslations"
type: "(locale: string, routeName: string, translations: Translations) => void"
required: true
---

::::
::::field
---
name: "clearCache"
type: "() => void"
required: true
---

::::
:::
::

**See** [`UseI18nOptions`](#usei18noptions)

#### `useLocaleHead`

```ts
function useLocaleHead(options?: UseLocaleHeadOptions): { … }
```

::field-group
:::field
---
name: "metaObject"
type: "Ref<{ htmlAttrs: { [x: string]: string | undefined; lang?: string | undefined; dir?: \"ltr\" | \"rtl\" | \"auto\" | undefined; }; link: ({ [x: string]: string | undefined; rel: \"canonical\"; href: string; } | { [x: string]: string | undefined; rel: \"alternate\"; href: string; hreflang: string; })[]; meta: { [x: string]: string; property: string; content: string; }[]; }, LocaleHead | { htmlAttrs: { [x: string]: string | undefined; lang?: string | undefined; dir?: \"ltr\" | \"rtl\" | \"auto\" | undefined; }; link: ({ [x: string]: string | undefined; rel: \"canonical\"; href: string; } | { [x: string]: string | undefined; rel: \"alternate\"; href: string; hreflang: string; })[]; meta: { [x: string]: string; property: string; content: string; }[]; }>"
required: true
---

:::
:::field
---
name: "updateMeta"
type: "(canonicalQueryWhitelist?: string[]) => void"
required: true
---

:::
::

**See** [`UseLocaleHeadOptions`](#uselocaleheadoptions)

### Functions

#### `createI18n`

```ts
function createI18n(options: CreateI18nOptions): I18nPlugin
```

**See** [`CreateI18nOptions`](/api/packages/vitepress#createi18noptions) · [`I18nPlugin`](#i18nplugin)

### Classes

#### `VueI18n`

```ts
class VueI18n extends BaseI18n {
  constructor(options: VueI18nOptions)
}
```

::collapsible{name="16 members"}
:::field-group
::::field
---
name: "readonly storage"
type: "TranslationStorage"
---

::::
::::field
---
name: "locale"
type: "Ref<string>"
---

::::
::::field
---
name: "fallbackLocale"
type: "Ref<string>"
---

::::
::::field
---
name: "currentRoute"
type: "Ref<string>"
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
name: "mergeTranslations"
type: "(locale: string, routeName: string, translations: Translations) => void"
---

::::
::::field
---
name: "protected touch"
type: "() => void"
---
Every read depends on the revision, so `computed(() => t(key))` re-runs after a write.
::::
::::field
---
name: "protected onTranslationsChanged"
type: "() => void"
---
Called after every write (load, merge, set, clear): the one place adapters bump their reactivity.
`locale` is set when one locale's chunk was written, unset when anything may have changed.
::::
::::field
---
name: "subscribeToChanges"
type: "(cb: () => void) => () => void"
---

::::
::::field
---
name: "getStorage"
type: "() => TranslationStorage"
---

::::
::::field
---
name: "getRouteCache"
type: "() => Record<string, Translations>"
---

::::
:::
::

**See** [`BaseI18n`](/api/packages/core#basei18n) · [`VueI18nOptions`](#vuei18noptions)

### Constants

#### `I18nDefaultLocaleKey`

```ts
const I18nDefaultLocaleKey: InjectionKey<string>
```

#### `I18nInjectionKey`

```ts
const I18nInjectionKey: InjectionKey<VueI18n>
```

**See** [`VueI18n`](#vuei18n)

#### `I18nLocalesKey`

```ts
const I18nLocalesKey: InjectionKey<Locale[]>
```

**See** [`Locale`](/api/packages/types#locale)

### Types

#### `I18nPlugin`

```ts
type I18nPlugin = Plugin & { … }
```

::field-group
:::field
---
name: "global"
type: "VueI18n"
required: true
---

:::
:::field
---
name: "setRoutingStrategy"
type: "(strategy: I18nRoutingStrategy) => void"
required: true
---

:::
::

#### `I18nRouteTarget`

A link target: a path with its query and hash, or a location (a named one needs a router that resolves names).

```ts
type I18nRouteTarget = string | {
  path?: string;
  name?: string | symbol;
  params?: object;
  query?: object;
  hash?: string;
}
```

#### `I18nRoutingStrategy`

Routing strategy interface for i18n
Implement this interface to integrate with any router library

```ts
interface I18nRoutingStrategy
```

::field-group
:::field
---
name: "getCurrentPath"
type: "() => string"
required: true
---
Returns current path (without locale prefix if needed, or full path)
Used for determining active classes in links
:::
:::field
---
name: "linkComponent"
type: "string | Component"
---
Component to use for rendering links (e.g., RouterLink)
:::
:::field
---
name: "push"
type: "(target: { path: string; }) => void"
required: true
---
Function to navigate to another route/locale
:::
:::field
---
name: "replace"
type: "(target: { path: string; }) => void"
required: true
---
Function to replace current route
:::
:::field
---
name: "resolvePath"
type: "(to: I18nRouteTarget, locale: string) => string | { path?: string; }"
---
Generate path for specific locale
:::
:::field
---
name: "toHref"
type: "(path: string) => string"
---
`href` of a path from `resolvePath`, for a router that navigates by something else
(VitePress: paths are relative to the site base, the address bar is not)
:::
:::field
---
name: "getRoute"
type: "() => { fullPath: string; query: Record<string, unknown>; }"
---
(Optional) Get current route object for SEO/Meta tags
:::
::

#### `I18nTProps`

```ts
interface I18nTProps
```

::collapsible{name="11 properties"}
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
name: "plural"
type: "number | string | null"
---

::::
::::field
---
name: "tag"
type: "string"
---

::::
::::field
---
name: "params"
type: "Record<string, string | number | boolean>"
---

::::
::::field
---
name: "defaultValue"
type: "string"
---

::::
::::field
---
name: "html"
type: "boolean"
---

::::
::::field
---
name: "hideIfEmpty"
type: "boolean"
---

::::
::::field
---
name: "customPluralRule"
type: "PluralFunc | null"
---

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
type: "Date | string | number | null"
---

::::
::::field
---
name: "relativeDate"
type: "Date | string | number | null"
---

::::
:::
::

#### `UseI18nOptions`

```ts
interface UseI18nOptions
```

::field-group
:::field
---
name: "locales"
type: "Locale[]"
---

:::
:::field
---
name: "defaultLocale"
type: "string"
---

:::
::

#### `UseLocaleHeadOptions`

```ts
interface UseLocaleHeadOptions
```

::field-group
:::field
---
name: "addDirAttribute"
type: "boolean"
---

:::
:::field
---
name: "identifierAttribute"
type: "string"
---

:::
:::field
---
name: "addSeoAttributes"
type: "boolean"
---

:::
:::field
---
name: "baseUrl"
type: "string | (() => string)"
---

:::
:::field
---
name: "hreflangBaseLanguage"
type: "boolean"
---
**Default** `false` · Also emit bare-language `hreflang` tags derived from `iso` (never from routing `code`).
:::
::

#### `VueI18nOptions`

```ts
interface VueI18nOptions
```

::collapsible{name="10 properties"}
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
name: "localeIso"
type: "Record<string, string>"
---
BCP 47 tag per locale code, for plurals of a code that is no language tag. `createI18n` fills it from `locales`.
::::
:::
::

### Re-exports

Declared in another package of this repository and documented on its page.

- From [`@i18n-micro/core`](/api/packages/core): [`defaultPlural`](/api/packages/core#defaultplural) · [`interpolate`](/api/packages/core#interpolate) · [`FormatService`](/api/packages/core#formatservice)
- From [`@i18n-micro/types`](/api/packages/types): [`CleanTranslation`](/api/packages/types#cleantranslation) · [`Getter`](/api/packages/types#getter) · [`Locale`](/api/packages/types#locale) · [`LocaleCode`](/api/packages/types#localecode) · [`Params`](/api/packages/types#params) · [`PluralFunc`](/api/packages/types#pluralfunc) · [`Translations`](/api/packages/types#translations)

## `@i18n-micro/vue/router`

Also exports, as `@i18n-micro/vue` does: [`I18nRoutingStrategy`](#i18nroutingstrategy).

### Functions

#### `createVueRouterAdapter`

Factory for Vue Router adapter
Implements routing utilities for Vue Router
Uses vue-router APIs for navigation and path resolution

```ts
function createVueRouterAdapter(
  router: Router,
  locales: Locale[],
  defaultLocale: string,
): I18nRoutingStrategy
```

**See** [`Locale`](/api/packages/types#locale) · [`I18nRoutingStrategy`](#i18nroutingstrategy)

---

Generated from the TypeScript sources and their JSDoc by `pnpm run docs:generate`.
Back to [all packages](/api/packages) · [Integration guides](/integrations/)
