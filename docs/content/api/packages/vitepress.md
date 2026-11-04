---
title: '@i18n-micro/vitepress'
description: 'Exported API of @i18n-micro/vitepress, generated from the source.'
navigation:
  title: 'vitepress'
---

# `@i18n-micro/vitepress`

VitePress bindings for i18n-micro — runtime dictionaries, MD components, and locale switcher.

Entry points: `@i18n-micro/vitepress`, `@i18n-micro/vitepress/config`, `@i18n-micro/vitepress/node`, `@i18n-micro/vitepress/theme`.

## `@i18n-micro/vitepress`

### Functions

#### `createI18n`

Universal VitePress i18n: Vue plugin + path helpers + `enhanceApp` sync.
Path methods are the router adapter’s own functions (no wrapper layer).

```ts
function createI18n(options: CreateI18nOptions): CreateI18nResult
```

**See** [`CreateI18nOptions`](#createi18noptions) · [`CreateI18nResult`](#createi18nresult)

#### `getLocaleFromPath`

Detect i18n locale code from a URL path (prefix_except_default).
Path prefixes are VitePress locale keys; return value is the i18n code.
Pass `base` when the path may include VitePress `site.base` (SSG).

```ts
function getLocaleFromPath(
  path: string,
  localeCodes: string[],
  defaultLocale: string,
  localeKeyToCode?: Record<string, string>,
  base?: string,
): string
```

#### `messagesFromGlob`

Tiny helper if you still prefer `import.meta.glob` instead of `defineI18nTheme`.
Only unwraps Vite module namespaces — dictionaries with a `default` key stay intact.

```ts
function messagesFromGlob(
  modules: Record<string, { default: Translations; } | Translations>,
): Record<string, Translations>
```

**See** [`Translations`](/api/packages/types#translations)

#### `routeNameFromPath`

Route name for page-scoped dictionaries (`/guide/demo` → `guide-demo`).
Strips VitePress URL prefixes (keys), not only raw i18n codes.

When `defaultLocale` is omitted (legacy 2-arg call), any segment that matches a
listed locale code is stripped — callers must not rely on `localeCodes[0]` as default.

```ts
function routeNameFromPath(
  path: string,
  localeCodes: string[],
  defaultLocale?: string,
  localeKeyToCode?: Record<string, string>,
  base?: string,
): string
```

#### `stripSiteBase`

Strip VitePress `site.base` from a path. Leaves query/hash intact.
No-op when `base` is missing or `/`.

```ts
function stripSiteBase(path: string, base?: string): string
```

### Types

#### `CreateI18nOptions`

```ts
interface CreateI18nOptions
```

::collapsible{name="15 properties"}
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
name: "defaultLocale"
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
name: "routeMessages"
type: "Record<string, Record<string, Translations>>"
---
Page-scoped dictionaries keyed by route name (`guide-demo`), then locale.
Loaded from `locales/pages/**` when using `withI18n`.
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
name: "numberFormats"
type: "VueI18nOptions['numberFormats']"
---

::::
::::field
---
name: "datetimeFormats"
type: "VueI18nOptions['datetimeFormats']"
---

::::
::::field
---
name: "timeZone"
type: "string"
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
name: "syncWithVitePress"
type: "boolean"
---
**Default** `true` · Sync i18n locale from the VitePress URL path on every navigation.
::::
::::field
---
name: "localeKeyToCode"
type: "Record<string, string>"
---
Map VitePress locale keys to i18n codes (`root` → default locale code).
::::
::::field
---
name: "base"
type: "string"
---
VitePress `site.base`. Needed so SSG paths (`withBase`) and lang switcher
do not treat the base segment as content / double-prefix links.
::::
:::
::

#### `CreateI18nResult`

```ts
type CreateI18nResult = I18nPlugin & PathMethods & { … }
```

::field-group
:::field
---
name: "i18n"
type: "I18nPlugin['global'] & PathMethods"
required: true
---
Same as `.global` (VueI18n + path methods).
:::
:::field
---
name: "enhanceApp"
type: "(ctx: { app: App; router: VitePressRouterLike; siteData?: Ref<VitePressSiteDataLike> | VitePressSiteDataLike; }) => void"
required: true
---

:::
::

**See** [`I18nPlugin`](/api/packages/vue#i18nplugin) · [`PathMethods`](#pathmethods)

#### `PathMethods`

Path helpers exposed on `createI18n` instances (slice of the router adapter).

```ts
type PathMethods = Pick<VitePressRouterAdapter, 'localizePath' | 'switchLocalePath' | 'getLocaleFromPath' | 'removeLocaleFromPath' | 'routeNameFromPath'>
```

#### `VirtualI18nConfig`

```ts
interface VirtualI18nConfig
```

::collapsible{name="13 properties"}
:::field-group
::::field
---
name: "defaultLocale"
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
name: "locales"
type: "Locale[]"
required: true
---

::::
::::field
---
name: "localeCodes"
type: "string[]"
required: true
---

::::
::::field
---
name: "missingWarn"
type: "boolean"
required: true
---

::::
::::field
---
name: "syncWithVitePress"
type: "boolean"
required: true
---

::::
::::field
---
name: "translationDir"
type: "string"
required: true
---

::::
::::field
---
name: "disablePageLocales"
type: "boolean"
required: true
---

::::
::::field
---
name: "localeKeyToCode"
type: "Record<string, string>"
required: true
---

::::
::::field
---
name: "base"
type: "string"
---
VitePress `site.base` (normalized, trailing slash preserved from config).
::::
::::field
---
name: "numberFormats"
type: "CreateI18nOptions['numberFormats']"
---

::::
::::field
---
name: "datetimeFormats"
type: "CreateI18nOptions['datetimeFormats']"
---

::::
::::field
---
name: "timeZone"
type: "string"
---

::::
:::
::

#### `VitePressSiteDataLike`

```ts
interface VitePressSiteDataLike
```

::field-group
:::field
---
name: "locales"
type: "Record<string, { lang?: string; link?: string; label?: string; }>"
---

:::
::

#### `VitePressUserConfigLike`

Minimal VitePress / Vite user config shape we merge into.
Avoid importing `vitepress` types so the package stays usable as a pure library dep.

```ts
interface VitePressUserConfigLike
```

::field-group
:::field
---
name: "base"
type: "string"
---

:::
:::field
---
name: "locales"
type: "Record<string, unknown>"
---

:::
:::field
---
name: "themeConfig"
type: "Record<string, unknown> | null"
---

:::
:::field
---
name: "transformHead"
type: "(...args: any[]) => any"
---

:::
:::field
---
name: "transformPageData"
type: "(...args: any[]) => any"
---

:::
:::field
---
name: "vite"
type: "{ plugins?: Plugin[] | Plugin[][]; ssr?: { noExternal?: string | true | Array<string | RegExp>; [key: string]: unknown; }; [key: string]: unknown; }"
---

:::
:::field
---
name: "[key: string]"
type: "unknown"
---

:::
::

#### `WithI18nOptions`

```ts
interface WithI18nOptions extends CreateI18nOptions
```

::field-group
:::field
---
name: "translationDir"
type: "string"
---
**Default** `'locales'` · Directory with locale JSON (`en.json`, `pages/guide/demo/en.json`, …), relative to Vite root
(VitePress content / docs root). Used by `virtual:i18n-micro/messages`.
:::
:::field
---
name: "disablePageLocales"
type: "boolean"
---
**Default** `false` · When true, treat `pages/**` as root-level dictionaries.
:::
:::field
---
name: "warnOnLocaleMismatch"
type: "boolean"
---
**Default** `true` · When true, logs a warning if VitePress `locales` keys do not align with
configured i18n locale codes.
:::
:::field
---
name: "i18nRouting"
type: "boolean"
---
**Default** `true` · Inject `themeConfig.i18nRouting` from adapter options + `config.base`.
Set `false` to skip. Skipped automatically when `themeConfig.i18nRouting` is already set.
:::
:::field
---
name: "meta"
type: "boolean"
---
**Default** ``true when `metaBaseUrl` is set, otherwise false`` · Emit i18n SEO tags via `transformHead` (canonical, hreflang, og:locale…) —
Nuxt `meta` / plugin `02.meta` analogue.
Absolute link tags require `metaBaseUrl`.
:::
:::field
---
name: "metaBaseUrl"
type: "string"
---
Public origin without trailing slash (`https://example.com`).
Same role as Nuxt `metaBaseUrl`.
:::
:::field
---
name: "hreflangBaseLanguage"
type: "boolean"
---
**Default** `false` · Also emit bare-language hreflang from `iso` (Nuxt `hreflangBaseLanguage`).
:::
:::field
---
name: "canonicalQueryWhitelist"
type: "string[]"
---
**Default** `[]` · Query keys kept on canonical / alternate URLs.
:::
::

**See** [`CreateI18nOptions`](#createi18noptions)

### Re-exports

Declared in another package of this repository and documented on its page.

- From [`@i18n-micro/core`](/api/packages/core): [`defaultPlural`](/api/packages/core#defaultplural) · [`interpolate`](/api/packages/core#interpolate) · [`FormatService`](/api/packages/core#formatservice)
- From [`@i18n-micro/types`](/api/packages/types): [`CleanTranslation`](/api/packages/types#cleantranslation) · [`Getter`](/api/packages/types#getter) · [`Locale`](/api/packages/types#locale) · [`LocaleCode`](/api/packages/types#localecode) · [`Params`](/api/packages/types#params) · [`PluralFunc`](/api/packages/types#pluralfunc) · [`Translations`](/api/packages/types#translations)
- From [`@i18n-micro/vue`](/api/packages/vue): [`I18nGroup`](/api/packages/vue#i18ngroup) · [`I18nLink`](/api/packages/vue#i18nlink) · [`I18nSwitcher`](/api/packages/vue#i18nswitcher) · [`I18nT`](/api/packages/vue#i18nt) · [`useI18n`](/api/packages/vue#usei18n) · [`I18nPlugin`](/api/packages/vue#i18nplugin) · [`I18nRoutingStrategy`](/api/packages/vue#i18nroutingstrategy) · [`UseI18nOptions`](/api/packages/vue#usei18noptions) · [`VueI18nOptions`](/api/packages/vue#vuei18noptions)

## `@i18n-micro/vitepress/config`

Also exports, as `@i18n-micro/vitepress` does: [`VirtualI18nConfig`](#virtuali18nconfig) · [`VitePressUserConfigLike`](#vitepressuserconfiglike) · [`WithI18nOptions`](#withi18noptions).

### Functions

#### `buildVitePressLocaleHead`

Build i18n SEO head for VitePress — same tags as Nuxt `useLocaleHead` /
plugin `02.meta` (canonical, hreflang, x-default, og:locale / og:url / alternates).

Framework-agnostic pure function; wired automatically by `withI18n` when `meta` is on.

```ts
function buildVitePressLocaleHead(
  options: BuildVitePressLocaleHeadOptions,
): VitePressLocaleHeadObject
```

**See** [`BuildVitePressLocaleHeadOptions`](#buildvitepresslocaleheadoptions) · [`VitePressLocaleHeadObject`](#vitepresslocaleheadobject)

#### `buildVitePressLocales`

Build VitePress `config.locales` from i18n-micro `Locale[]`.
Default locale becomes `root` (no URL prefix); others get `/{key}/`.

```ts
function buildVitePressLocales(
  locales: Locale[],
  defaultLocale: string,
  options?: BuildVitePressLocalesOptions,
): Record<string, VitePressLocaleEntry>
```

**See** [`Locale`](/api/packages/types#locale) · [`BuildVitePressLocalesOptions`](#buildvitepresslocalesoptions) · [`VitePressLocaleEntry`](#vitepresslocaleentry)

#### `relativePathToRoutePath`

Convert VitePress `pageData.relativePath` to a route path (cleanUrls-style).

```ts
function relativePathToRoutePath(relativePath: string): string
```

#### `warnLocaleMismatch`

```ts
function warnLocaleMismatch(
  config: VitePressUserConfigLike,
  options: WithI18nOptions,
): void
```

**See** [`VitePressUserConfigLike`](#vitepressuserconfiglike) · [`WithI18nOptions`](#withi18noptions)

#### `withI18n`

VitePress config helper: virtual modules + optional `i18nRouting` / SEO head.

Registers:

- `virtual:i18n-micro/config`
- `virtual:i18n-micro/messages` (from `translationDir`, default `locales/`)

By default also sets `themeConfig.i18nRouting` (pass `i18nRouting: false` to skip).
Pair with `defineI18nTheme(DefaultTheme)` from `@i18n-micro/vitepress/theme`.
Import from `@i18n-micro/vitepress/config` (Node / config files only).

```ts
function withI18n<T extends VitePressUserConfigLike>(
  config: T,
  options: WithI18nOptions,
): T
```

**See** [`VitePressUserConfigLike`](#vitepressuserconfiglike) · [`WithI18nOptions`](#withi18noptions)

### Types

#### `BuildVitePressLocaleHeadOptions`

```ts
interface BuildVitePressLocaleHeadOptions
```

::collapsible{name="12 properties"}
:::field-group
::::field
---
name: "path"
type: "string"
required: true
---
Current page path (with or without `site.base`). Query/hash optional.
Example: `/docs/fr/guide/` or `/fr/guide`.
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
name: "defaultLocale"
type: "string"
required: true
---

::::
::::field
---
name: "localeKeyToCode"
type: "Record<string, string>"
---

::::
::::field
---
name: "base"
type: "string"
---
VitePress `site.base` (e.g. `/docs/`).
::::
::::field
---
name: "metaBaseUrl"
type: "string"
---
Public site origin **without** trailing slash (e.g. `https://example.com`).
Required for absolute `canonical` / `hreflang` / `og:url`.
When omitted, only `htmlAttrs` are produced.
::::
::::field
---
name: "hreflangBaseLanguage"
type: "boolean"
---
**Default** ``false — same as Nuxt / Vue `useLocaleHead`.``
::::
::::field
---
name: "canonicalQueryWhitelist"
type: "string[]"
---
**Default** `[]` · Query keys kept on canonical / alternate URLs.
::::
::::field
---
name: "addDirAttribute"
type: "boolean"
---
**Default** `true`
::::
::::field
---
name: "addSeoAttributes"
type: "boolean"
---
**Default** `true`
::::
::::field
---
name: "identifierAttribute"
type: "string"
---
**Default** `'id'`
::::
::::field
---
name: "missingWarn"
type: "boolean"
---

::::
:::
::

#### `BuildVitePressLocalesOptions`

```ts
interface BuildVitePressLocalesOptions
```

::field-group
:::field
---
name: "localeKeyToCode"
type: "Record<string, string>"
---
Map VitePress locale keys → i18n codes (`root` → default).
When a non-default code maps to a short VP key (`fr` → `fr-FR`), the URL
prefix / config key uses the VP key.
:::
::

#### `VitePressHeadTuple`

VitePress `HeadConfig` tuple (tag + attrs).

```ts
type VitePressHeadTuple = [
  string,
  Record<string, string>
]
```

#### `VitePressLocaleEntry`

Minimal VitePress `locales` entry used by the default theme language menu.

```ts
interface VitePressLocaleEntry
```

::field-group
:::field
---
name: "label"
type: "string"
required: true
---

:::
:::field
---
name: "lang"
type: "string"
required: true
---

:::
:::field
---
name: "link"
type: "string"
---

:::
::

#### `VitePressLocaleHeadObject`

```ts
interface VitePressLocaleHeadObject
```

::field-group
:::field
---
name: "htmlAttrs"
type: "{ lang?: string; dir?: 'ltr' | 'rtl' | 'auto'; }"
required: true
---

:::
:::field
---
name: "head"
type: "VitePressHeadTuple[]"
required: true
---
Ready for `transformHead` / `frontmatter.head`.
:::
::

## `@i18n-micro/vitepress/node`

Also exports, as `@i18n-micro/vitepress/config` does: [`buildVitePressLocales`](#buildvitepresslocales) · [`BuildVitePressLocalesOptions`](#buildvitepresslocalesoptions) · [`VitePressLocaleEntry`](#vitepresslocaleentry).

### Functions

#### `createI18n`

Node `createI18n` (`@i18n-micro/node`) + VitePress path methods from the router adapter.

```ts
function createI18n(options: CreateI18nOptions): NodeI18n
```

**See** [`CreateI18nOptions`](#createi18noptions) · [`NodeI18n`](#nodei18n)

### Types

#### `CreateI18nOptions`

```ts
interface CreateI18nOptions extends I18nOptions
```

::field-group
:::field
---
name: "locales"
type: "Locale[] | string[]"
---
Locales for path helpers (`localizePath`, …). Defaults to `[{ code: locale }]`.
:::
:::field
---
name: "defaultLocale"
type: "string"
---

:::
:::field
---
name: "localeKeyToCode"
type: "Record<string, string>"
---

:::
:::field
---
name: "base"
type: "string"
---

:::
::

**See** [`I18nOptions`](/api/packages/node#i18noptions)

#### `NodeI18n`

```ts
type NodeI18n = I18n & PathMethods
```

**See** [`I18n`](/api/packages/node#i18n) · [`PathMethods`](#pathmethods)

### Re-exports

Declared in another package of this repository and documented on its page.

- From [`@i18n-micro/node`](/api/packages/node): [`loadRootTranslations`](/api/packages/node#loadroottranslations) · [`loadTranslations`](/api/packages/node#loadtranslations) · [`I18nOptions`](/api/packages/node#i18noptions) · [`LoadedTranslations`](/api/packages/node#loadedtranslations)

## `@i18n-micro/vitepress/theme`

### Functions

#### `defineI18nTheme`

Zero-boilerplate theme wiring. Requires `withI18n(...)` in `.vitepress/config`
so virtual config + messages modules exist.

Uses **static** `virtual:i18n-micro/*` imports so VitePress SSG can rewrite them.
Import this helper from `@i18n-micro/vitepress/theme` (not the root entry) so Node
config evaluation never loads virtual modules.

```ts
function defineI18nTheme<T extends Theme>(base: T, options?: DefineI18nThemeOptions): T
```

```ts
import DefaultTheme from 'vitepress/theme'
import { defineI18nTheme } from '@i18n-micro/vitepress/theme'

export default defineI18nTheme(DefaultTheme)
```

**See** [`DefineI18nThemeOptions`](#definei18nthemeoptions)

### Types

#### `DefineI18nThemeOptions`

```ts
interface DefineI18nThemeOptions
```

::collapsible{name="10 properties"}
:::field-group
::::field
---
name: "enhanceApp"
type: "NonNullable<Theme['enhanceApp']>"
---
Extra `enhanceApp` run after i18n is installed.
::::
::::field
---
name: "plural"
type: "PluralFunc"
---
Overrides for this theme: `plural` and `missingHandler` cannot be serialized into
`virtual:i18n-micro/config`; the formats and `timeZone` default to what `withI18n` got.
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
type: "CreateI18nOptions['numberFormats']"
---

::::
::::field
---
name: "datetimeFormats"
type: "CreateI18nOptions['datetimeFormats']"
---

::::
::::field
---
name: "timeZone"
type: "string"
---

::::
::::field
---
name: "localeKeyToCode"
type: "Record<string, string>"
---

::::
::::field
---
name: "config"
type: "VirtualI18nConfig"
---
Optional overrides (tests / advanced). Defaults come from `virtual:i18n-micro/*`
registered by `withI18n`.
::::
::::field
---
name: "messages"
type: "Record<string, Translations>"
---

::::
::::field
---
name: "routeMessages"
type: "Record<string, Record<string, Translations>>"
---

::::
:::
::

---

Generated from the TypeScript sources and their JSDoc by `pnpm run docs:generate`.
Back to [all packages](/api/packages) · [Integration guides](/integrations/)
