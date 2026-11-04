---
title: '@i18n-micro/astro'
description: 'Exported API of @i18n-micro/astro, generated from the source.'
navigation:
  title: 'astro'
---

# `@i18n-micro/astro`

Astro integration for i18n-micro — translations, routing, and islands.

Entry points: `@i18n-micro/astro`, `@i18n-micro/astro/client`, `@i18n-micro/astro/client/preact`, `@i18n-micro/astro/client/react`, `@i18n-micro/astro/client/svelte`, `@i18n-micro/astro/client/vue`, `@i18n-micro/astro/middleware`, `@i18n-micro/astro/node`.

## `@i18n-micro/astro`

### Composables

#### `useI18n`

Use i18n in Astro pages/components
Returns helper functions for translations

```ts
function useI18n(astro: Astro): { … }
```

::collapsible{name="21 properties"}
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
name: "defaultLocale"
type: "string"
required: true
---

::::
::::field
---
name: "locales"
type: "Locale[]"
required: true
---

::::
::::field
---
name: "t"
type: "(key: TranslationKey, params?: Params | ListParams, defaultValue?: string | null, routeContext?: unknown) => CleanTranslation"
required: true
---

::::
::::field
---
name: "ts"
type: "(key: TranslationKey, params?: Params | ListParams, defaultValue?: string, routeContext?: unknown) => string"
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
name: "getRoute"
type: "() => string"
required: true
---

::::
::::field
---
name: "getRouteName"
type: "(path?: string) => string"
required: true
---

::::
::::field
---
name: "getLocaleFromPath"
type: "(path?: string) => string"
required: true
---

::::
::::field
---
name: "switchLocalePath"
type: "(newLocale: string) => string"
required: true
---

::::
::::field
---
name: "localizePath"
type: "(path: string, targetLocale?: string) => string"
required: true
---

::::
::::field
---
name: "getI18n"
type: "() => AstroI18n"
required: true
---

::::
::::field
---
name: "getBasePath"
type: "(url?: URL) => string"
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

#### `useLocaleHead`

```ts
function useLocaleHead(astro: Astro, options?: LocaleHeadOptions): LocaleHeadResult
```

**See** [`LocaleHeadOptions`](#localeheadoptions) · [`LocaleHeadResult`](#localeheadresult)

### Functions

#### `createAstroRouterAdapter`

Prefix-except-default routing over plain paths. Paths here never carry Astro's `base`: the
middleware strips it from what comes in and adds it to what goes out.

```ts
function createAstroRouterAdapter(
  locales: Locale[],
  defaultLocale: string,
  getCurrentUrl?: () => URL,
): I18nRoutingStrategy
```

**See** [`Locale`](/api/packages/types#locale) · [`I18nRoutingStrategy`](#i18nroutingstrategy)

#### `createI18n`

Create an i18n instance (for a `src/middleware.ts` of your own).

```ts
function createI18n(options: AstroI18nOptions): AstroI18n
```

**See** [`AstroI18nOptions`](#astroi18noptions) · [`AstroI18n`](#astroi18n)

#### `createI18nMiddleware`

Create Astro middleware for i18n locale detection

```ts
function createI18nMiddleware(options: I18nMiddlewareOptions): MiddlewareHandler
```

**See** [`I18nMiddlewareOptions`](#i18nmiddlewareoptions)

#### `detectLocale`

Locale a visitor prefers: URL prefix → cookie → Accept-Language → default, the one precedence of
`resolveLocale`. An explicit prefix always wins; `autoDetect: false` leaves only the URL.

```ts
function detectLocale(
  pathname: string,
  cookies: { get: (name: string) => { value: string; } | undefined; },
  headers: Headers,
  defaultLocale: string,
  locales: string[],
  localeCookie?: string | null,
  routingStrategy?: I18nRoutingStrategy | null,
  autoDetect?: boolean,
): string
```

**See** [`I18nRoutingStrategy`](#i18nroutingstrategy)

#### `getDefaultLocale`

Get default locale from Astro context

```ts
function getDefaultLocale(astro: Pick<AstroGlobal, 'locals'>): string
```

#### `getI18n`

Get i18n instance from Astro context

```ts
function getI18n(astro: Pick<AstroGlobal, 'locals'>): AstroI18n
```

**See** [`AstroI18n`](#astroi18n)

#### `getI18nProps`

Props for a client island: what `t()` can answer on this page (route, root and fallback keys),
or only `keys` of that, which is the way to keep the page small. Stored trees are shared, an
island must not write into them.

```ts
function getI18nProps(
  astro: Pick<AstroGlobal, 'locals'>,
  keys?: string[],
): I18nClientProps
```

**See** [`I18nClientProps`](#i18nclientprops)

#### `getLocale`

Get current locale from Astro context

```ts
function getLocale(astro: Pick<AstroGlobal, 'locals'>): string
```

#### `getLocaleRewritePath`

Strip locale prefix from the current URL for `Astro.rewrite()` on `/[locale]/*` routes.

```ts
function getLocaleRewritePath(astro: Astro): string
```

#### `getLocales`

Get all locales from Astro context

```ts
function getLocales(astro: Pick<AstroGlobal, 'locals'>): Locale[]
```

**See** [`Locale`](/api/packages/types#locale)

#### `i18nIntegration`

Astro integration for i18n-micro: publishes the config and dictionaries, and installs the middleware.

```ts
function i18nIntegration(options: I18nIntegrationOptions): AstroIntegration
```

**See** [`I18nIntegrationOptions`](#i18nintegrationoptions)

#### `prepareLocaleRewrite`

Validate `:locale`, sync i18n/locals, and return the base path for `Astro.rewrite()`.
Returns a `Response` when the locale param is invalid.

```ts
function prepareLocaleRewrite(
  astro: Astro & Pick<AstroGlobal, 'params'>,
): Response | string
```

### Classes

#### `AstroI18n`

The runtime instance, plus what Astro pages use on top: per-route reads and a reset that keeps `messages`.

```ts
class AstroI18n extends I18n {
  constructor(options: AstroI18nOptions)
}
```

::field-group
:::field
---
name: "keepMessages"
type: "(messages: Record<string, Translations>, routeMessages: Record<string, Record<string, Translations>>) => void"
---
Dictionaries loaded after the constructor that `clearCache` keeps too: a directory read at runtime.
:::
:::field
---
name: "getLocaleIso"
type: "() => Record<string, string>"
---
The `localeIso` option: what an island needs to plural in another locale.
:::
:::field
---
name: "getRouteTranslations"
type: "(locale: string, routeName: string) => Translations | null"
---

:::
:::field
---
name: "mergeTranslations"
type: "(locale: string, routeName: string, translations: Translations) => void"
---

:::
:::field
---
name: "clearCache"
type: "() => void"
---
Clear translation and formatter caches.
:::
::

**See** [`I18n`](/api/packages/node#i18n) · [`AstroI18nOptions`](#astroi18noptions)

### Types

#### `AstroI18nOptions`

```ts
type AstroI18nOptions = I18nOptions
```

**See** [`I18nOptions`](/api/packages/node#i18noptions)

#### `I18nClientProps`

Props to pass to client islands (Vue, React, Svelte, Preact)

```ts
interface I18nClientProps
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
name: "pluralLocale"
type: "string"
---
The tag plurals go by: the locale's `iso` when it has one.
:::
:::field
---
name: "localeIso"
type: "Record<string, string>"
---
Tags of the codes that have one, for `setLocale`. Absent when there are none.
:::
:::field
---
name: "fallbackLocale"
type: "string"
required: true
---

:::
:::field
---
name: "translations"
type: "Record<string, Translations>"
required: true
---

:::
:::field
---
name: "currentRoute"
type: "string"
required: true
---

:::
::

#### `I18nIntegrationOptions`

```ts
interface I18nIntegrationOptions
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
name: "locales"
type: "Locale[]"
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
name: "localeCookie"
type: "string | null"
---

::::
::::field
---
name: "autoDetect"
type: "boolean"
---

::::
::::field
---
name: "redirectToDefault"
type: "boolean"
---
`/` also redirects when nothing prefers another locale: see `createI18nMiddleware`.
::::
::::field
---
name: "translationDir"
type: "string"
---
Bundled into the server at build time, relative to the project root.
::::
::::field
---
name: "disablePageLocales"
type: "boolean"
---
Page files (`pages/about/de.json`) count as root translations.
::::
::::field
---
name: "middleware"
type: "boolean"
---
`false`: no middleware from the integration. Write `src/middleware.ts` with `createI18nMiddleware`
for what cannot cross from the Astro config to the server bundle: `plural`, `missingHandler`, a strategy.
::::
:::
::

#### `I18nMiddlewareOptions`

```ts
interface I18nMiddlewareOptions
```

::collapsible{name="9 properties"}
:::field-group
::::field
---
name: "i18n"
type: "AstroI18n"
required: true
---

::::
::::field
---
name: "defaultLocale"
type: "string"
required: true
---

::::
::::field
---
name: "locales"
type: "string[]"
required: true
---

::::
::::field
---
name: "localeObjects"
type: "Locale[]"
---

::::
::::field
---
name: "autoDetect"
type: "boolean"
---
`/` redirects to the locale the cookie / Accept-Language prefer (default `true`); pages keep the URL's locale.
::::
::::field
---
name: "redirectToDefault"
type: "boolean"
---
`/` also redirects when nothing prefers another locale: to the home `routingStrategy` resolves
for the default locale (default `false`). Without one `/` stays: it is the default locale's page.
::::
::::field
---
name: "routingStrategy"
type: "I18nRoutingStrategy"
---

::::
::::field
---
name: "localeCookie"
type: "string | null"
---
Cookie holding the visitor's locale (default `'i18n-locale'`); `null` disables it.
::::
::::field
---
name: "base"
type: "string"
---
Astro's `base`, `config.base` of the virtual config.
::::
:::
::

#### `I18nRoutingStrategy`

Routing strategy interface for i18n in Astro
Implement this interface to integrate with any routing logic
Matches Vue/Solid/React package interface for consistency
Adapted for Astro SSR context (push/replace are optional)

```ts
interface I18nRoutingStrategy
```

::collapsible{name="10 properties"}
:::field-group
::::field
---
name: "getCurrentPath"
type: "() => string"
required: true
---
Returns current path (without locale prefix if needed, or full path)
Used for determining active classes in links
::::
::::field
---
name: "resolvePath"
type: "(to: string | { path?: string; }, locale: string) => string | { path?: string; }"
---
Generate path for specific locale
::::
::::field
---
name: "getRouteName"
type: "(path: string, locales: string[], routePattern?: string) => string"
---
Get route name from path (e.g., /en/about -> about)
Used in middleware to set route name. `routePattern` is the page's pattern (`/blog/[slug]`), with
a `[locale]` param already replaced by its value: use it to give every URL of a page one name.
::::
::::field
---
name: "getLocaleFromPath"
type: "(path: string, defaultLocale: string, locales: string[]) => string"
---
Get locale from path
Checks if first segment is a locale code
::::
::::field
---
name: "switchLocalePath"
type: "(path: string, newLocale: string, locales: string[], defaultLocale?: string) => string"
---
Switch locale in path
Replaces or adds locale prefix to path
::::
::::field
---
name: "localizePath"
type: "(path: string, locale: string, locales: string[], defaultLocale?: string) => string"
---
Localize path with locale prefix
::::
::::field
---
name: "removeLocaleFromPath"
type: "(path: string, locales: string[]) => string"
---
Remove locale from path
::::
::::field
---
name: "push"
type: "(target: { path: string; }) => void"
---
(Optional) Function to navigate to another route/locale
Not used in SSR, but can be used in client-side islands
::::
::::field
---
name: "replace"
type: "(target: { path: string; }) => void"
---
(Optional) Function to replace current route
Not used in SSR, but can be used in client-side islands
::::
::::field
---
name: "getRoute"
type: "() => { fullPath: string; query: Record<string, unknown>; }"
---
(Optional) Get current route object for SEO/Meta tags
::::
:::
::

#### `LocaleHeadOptions`

Generate locale head meta tags for SEO

```ts
interface LocaleHeadOptions
```

::field-group
:::field
---
name: "baseUrl"
type: "string"
---
Origin of the absolute URLs. Default: `site` from the Astro config, else root-relative URLs.
:::
:::field
---
name: "addDirAttribute"
type: "boolean"
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
name: "hreflangBaseLanguage"
type: "boolean"
---
**Default** `false` · Also emit bare-language `hreflang` tags derived from `iso` (never from routing `code`).
:::
::

#### `LocaleHeadResult`

```ts
type LocaleHeadResult = LocaleHead
```

**See** [`LocaleHead`](/api/packages/utils#localehead)

### Re-exports

Declared in another package of this repository and documented on its page.

- From [`@i18n-micro/core`](/api/packages/core): [`defaultPlural`](/api/packages/core#defaultplural) · [`interpolate`](/api/packages/core#interpolate) · [`localeIsoMap`](/api/packages/core#localeisomap) · [`FormatService`](/api/packages/core#formatservice)
- From [`@i18n-micro/types`](/api/packages/types): [`CleanTranslation`](/api/packages/types#cleantranslation) · [`Getter`](/api/packages/types#getter) · [`Locale`](/api/packages/types#locale) · [`LocaleCode`](/api/packages/types#localecode) · [`Params`](/api/packages/types#params) · [`PluralFunc`](/api/packages/types#pluralfunc) · [`Translations`](/api/packages/types#translations)

## `@i18n-micro/astro/client`

### Functions

#### `hasTranslation`

Checks if a translation exists in the state: a subtree counts, as on the server

```ts
function hasTranslation(state: I18nState, key: string, routeName?: string): boolean
```

**See** [`I18nState`](#i18nstate)

#### `translate`

Pure function to get a translation from state, answering as the server's `t()` does over the
same keys. `getI18nProps` already merged the root and fallback dictionaries into the state.
For Linked Messages (@:path.to.key), use the server-side i18n instance.

```ts
function translate(
  state: I18nState,
  key: string,
  params?: Params,
  defaultValue?: string | null,
  routeName?: string,
): string | number | boolean | Translations | null
```

**See** [`I18nState`](#i18nstate) · [`Params`](/api/packages/types#params) · [`Translations`](/api/packages/types#translations)

### Types

#### `I18nState`

I18n state for client islands

```ts
interface I18nState
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
name: "pluralLocale"
type: "string"
---
The tag plurals go by, when it is not `locale`.
:::
:::field
---
name: "localeIso"
type: "Record<string, string>"
---
Tags of the codes that have one: `setLocale` finds the new locale's here.
:::
:::field
---
name: "fallbackLocale"
type: "string"
required: true
---

:::
:::field
---
name: "translations"
type: "Record<string, Translations>"
required: true
---

:::
:::field
---
name: "currentRoute"
type: "string"
required: true
---

:::
::

## `@i18n-micro/astro/client/preact`

### Components

#### `I18nProvider`

```ts
function I18nProvider(
  props: {
    children: ComponentChildren;
    value: I18nClientProps;
  },
): VNode<{}>
```

**See** [`I18nClientProps`](#i18nclientprops)

### Composables

#### `useAstroI18n`

```ts
function useAstroI18n(): { … }
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
required: true
---

::::
::::field
---
name: "currentRoute"
type: "string"
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
name: "setRoute"
type: "(currentRoute: string) => void"
required: true
---

::::
::::field
---
name: "t"
type: "(key: TranslationKey, params?: Params, defaultValue?: string | null, routeName?: string) => CleanTranslation"
required: true
---

::::
::::field
---
name: "ts"
type: "(key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string"
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
type: "(value: number, options?: Intl.NumberFormatOptions) => string"
required: true
---

::::
::::field
---
name: "td"
type: "(value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string"
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
type: "(key: TranslationKey, routeName?: string) => boolean"
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
:::
::

## `@i18n-micro/astro/client/react`

### Components

#### `I18nProvider`

```ts
function I18nProvider(
  props: {
    children: ReactNode;
    value: I18nClientProps;
  },
): ReactElement<unknown, string | React.JSXElementConstructor<any>>
```

**See** [`I18nClientProps`](#i18nclientprops)

### Composables

#### `useAstroI18n`

```ts
function useAstroI18n(): { … }
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
required: true
---

::::
::::field
---
name: "currentRoute"
type: "string"
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
name: "setRoute"
type: "(currentRoute: string) => void"
required: true
---

::::
::::field
---
name: "t"
type: "(key: TranslationKey, params?: Params, defaultValue?: string | null, routeName?: string) => CleanTranslation"
required: true
---

::::
::::field
---
name: "ts"
type: "(key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string"
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
type: "(value: number, options?: Intl.NumberFormatOptions) => string"
required: true
---

::::
::::field
---
name: "td"
type: "(value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string"
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
type: "(key: TranslationKey, routeName?: string) => boolean"
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
:::
::

## `@i18n-micro/astro/client/svelte`

### Composables

#### `useAstroI18n`

Hook for using i18n in Svelte components
Use in the component's <script> block

```ts
function useAstroI18n(store: Writable<I18nState>): { … }
```

::collapsible{name="14 properties"}
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
required: true
---

::::
::::field
---
name: "currentRoute"
type: "string"
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
name: "setRoute"
type: "(routeName: string) => void"
required: true
---

::::
::::field
---
name: "t"
type: "(key: TranslationKey, params?: Params, defaultValue?: string | null, routeName?: string) => CleanTranslation"
required: true
---

::::
::::field
---
name: "ts"
type: "(key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string"
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
type: "(value: number, options?: Intl.NumberFormatOptions) => string"
required: true
---

::::
::::field
---
name: "td"
type: "(value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string"
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
type: "(key: TranslationKey, routeName?: string) => boolean"
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
name: "store"
type: "Writable<I18nState>"
required: true
---

::::
:::
::

**See** [`I18nState`](#i18nstate)

### Functions

#### `createI18nStore`

Creates a Svelte store for i18n state. An island kept by `transition:persist` follows its new
props with `$: store.set(i18n)` (`$effect(() => store.set(i18n))` with runes).

```ts
function createI18nStore(props: I18nClientProps): Writable<I18nState>
```

**See** [`I18nClientProps`](#i18nclientprops) · [`I18nState`](#i18nstate)

## `@i18n-micro/astro/client/vue`

### Composables

#### `useAstroI18n`

Hook for using i18n in Vue components

```ts
function useAstroI18n(): { … }
```

::collapsible{name="13 properties"}
:::field-group
::::field
---
name: "locale"
type: "WritableComputedRef<string, string>"
required: true
---

::::
::::field
---
name: "fallbackLocale"
type: "ComputedRef<string>"
required: true
---

::::
::::field
---
name: "currentRoute"
type: "WritableComputedRef<string, string>"
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
name: "setRoute"
type: "(currentRoute: string) => void"
required: true
---

::::
::::field
---
name: "t"
type: "(key: TranslationKey, params?: Params, defaultValue?: string | null, routeName?: string) => CleanTranslation"
required: true
---

::::
::::field
---
name: "ts"
type: "(key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string"
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
type: "(value: number, options?: Intl.NumberFormatOptions) => string"
required: true
---

::::
::::field
---
name: "td"
type: "(value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string"
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
type: "(key: TranslationKey, routeName?: string) => boolean"
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
:::
::

### Functions

#### `provideI18n`

Initializes the i18n provider for a Vue island. Call in the island's root component, with a
getter (`() => props.i18n`) so an island kept by `transition:persist` follows its new props.
`shallowRef`: translations are never edited in place, and deep tracking costs 11× on every `t`.

```ts
function provideI18n(props: MaybeRefOrGetter<I18nClientProps>): Ref<I18nState>
```

**See** [`I18nClientProps`](#i18nclientprops) · [`I18nState`](#i18nstate)

## `@i18n-micro/astro/middleware`

### Functions

#### `onRequest`

```ts
function onRequest(
  context: APIContext<Record<string, any>, Record<string, string | undefined>>,
  next: MiddlewareNext,
): void | Response | Promise<Response> | Promise<void>
```

## `@i18n-micro/astro/node`

### Functions

#### `loadTranslationsFromDir`

Load all translations from a directory: flat (`en.json`) and nested (`pages/home/en.json`).

```ts
function loadTranslationsFromDir(options: LoadTranslationsOptions): LoadedTranslations
```

**See** [`LoadTranslationsOptions`](#loadtranslationsoptions) · [`LoadedTranslations`](#loadedtranslations)

#### `loadTranslationsIntoI18n`

Load a directory into an instance, replacing the chunks it finds.

```ts
function loadTranslationsIntoI18n(
  i18n: {
    addTranslations: (locale: string, translations: Translations, merge?: boolean) => void;
    addRouteTranslations: (locale: string, routeName: string, translations: Translations, merge?: boolean) => void;
    keepMessages?: (messages: Record<string, Translations>, routeMessages: Record<string, Record<string, Translations>>) => void;
  },
  options: LoadTranslationsOptions,
): void
```

**See** [`Translations`](/api/packages/types#translations) · [`LoadTranslationsOptions`](#loadtranslationsoptions)

#### `readTranslationDir`

The directory's dictionaries and the files they came from, for the integration's build.

```ts
function readTranslationDir(
  options: { translationDir: string; rootDir: URL; disablePageLocales?: boolean; },
): { … }
```

::field-group
:::field
---
name: "messages"
type: "TranslationFileBuckets<Translations>"
required: true
---

:::
:::field
---
name: "files"
type: "string[]"
required: true
---

:::
::

### Types

#### `LoadedTranslations`

```ts
interface LoadedTranslations extends TranslationFileBuckets<Translations>
```

**See** [`TranslationFileBuckets`](/api/packages/utils#translationfilebuckets) · [`Translations`](/api/packages/types#translations)

#### `LoadTranslationsOptions`

```ts
interface LoadTranslationsOptions
```

::field-group
:::field
---
name: "translationDir"
type: "string"
required: true
---

:::
:::field
---
name: "rootDir"
type: "string"
---

:::
:::field
---
name: "disablePageLocales"
type: "boolean"
---

:::
::

---

Generated from the TypeScript sources and their JSDoc by `pnpm run docs:generate`.
Back to [all packages](/api/packages) · [Integration guides](/integrations/)
