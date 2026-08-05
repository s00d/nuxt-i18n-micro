---
url: 'https://s00d.github.io/nuxt-i18n-micro/api/methods.md'
description: All nuxt-i18n-micro runtime methods.
---

# 🛠️ Methods

This page documents all available methods provided by nuxt-i18n-micro. Methods are organized by functionality for easier navigation.

## 📊 API Overview

Every helper the plugin injects, read from the `PluginsInjections` interface — so this
list cannot drift from what is actually available.

| Helper | Signature | Purpose |
| --- | --- | --- |
| [`$_t`](#_t) | `(route: RouteLocationNormalizedLoaded) => (key: string, params?: Params, defaultValue?: string \| null) => CleanTranslation` | Bind `$t` to a specific route, for translating outside the current page — a layout rendering a link to another route, for example. |
| [`$_ts`](#_ts) | `(route: RouteLocationNormalizedLoaded) => (key: string, params?: Params, defaultValue?: string \| null) => string` | Bind `$ts` to a specific route. |
| [`$defaultLocale`](#defaultlocale) | `() => string \| undefined` | Code of the configured default locale. |
| [`$getI18nConfig`](#geti18nconfig) | `() => ModuleOptionsExtend` | The resolved module configuration, as the runtime sees it. |
| [`$getLocale`](#getlocale) | `(route?: RouteLocationNormalizedLoaded \| RouteLocationResolvedGeneric) => string` | Code of the active locale. |
| [`$getLocaleName`](#getlocalename) | `() => string \| null` | The active locale's `displayName` from the config, or `null` when it has none. |
| [`$getLocales`](#getlocales) | `() => Locale[]` | Every configured locale, with its metadata. |
| [`$getRouteName`](#getroutename) | `(route?: RouteLocationNamedRaw \| RouteLocationResolvedGeneric, locale?: string) => string` | Route name with the locale prefix stripped — the name translations are keyed by. |
| [`$has`](#has) | `(key: string) => boolean` | Whether a key resolves in the active locale. |
| `$i18nStrategy` | `PathStrategy` | The active routing strategy, resolving locales to and from paths. |
| [`$loadPageTranslations`](#loadpagetranslations) | `(locale: string, routeName: string, translations: Translations) => Promise<void>` | Load translations for a page at runtime, for content whose keys are not known at build time. |
| [`$localePath`](#localepath) | `(to: RouteLocationNamedRaw \| RouteLocationResolvedGeneric \| string, locale?: string) => string` | Resolve a path in the given locale, or the active one. |
| [`$localeRoute`](#localeroute) | `(to: RouteLocationNamedRaw \| RouteLocationResolvedGeneric \| string, locale?: string) => RouteLocationResolved` | Resolve a route in the given locale, or the active one. |
| [`$mergeTranslations`](#mergetranslations) | `(newTranslations: Translations) => void` | Merge translations into the active locale at runtime, overriding what is loaded. |
| [`$resolveTranslations`](#resolvetranslations) | `() => Translations` | Every translation currently in memory for the active locale and route, as a tree. |
| [`$setI18nRouteParams`](#seti18nrouteparams) | `(value: I18nRouteParams) => I18nRouteParams` | Set per-locale params for the current route, so a dynamic segment can differ per language. |
| [`$setMissingHandler`](#setmissinghandler) | `(handler: MissingHandler \| null) => void` | Install a callback invoked for every unresolved key. |
| [`$setTranslation`](#settranslation) | `(key: string, value: unknown) => void` | Replace the value at `key` in the active dictionary. |
| [`$switchLocale`](#switchlocale) | `(locale: string) => void` | Navigate to the current page in another locale. |
| [`$switchLocalePath`](#switchlocalepath) | `(locale: string) => string` | The path of the current page in another locale, without navigating. |
| [`$switchLocaleRoute`](#switchlocaleroute) | `(locale: string) => RouteLocationRaw` | The route object for the current page in another locale, without navigating. |
| [`$switchRoute`](#switchroute) | `(route: RouteLocationNamedRaw \| RouteLocationResolvedGeneric \| string, toLocale?: string) => void` | Navigate to another route, keeping the active locale or switching to `toLocale`. |
| [`$t`](#t) | `(key: string, params?: Params, defaultValue?: string \| null) => CleanTranslation` | Translate a key, interpolating `params` into it. |
| [`$tc`](#tc) | `(key: string, params: number \| Params, defaultValue?: string) => string` | Translate with pluralization. |
| [`$td`](#td) | `{ (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string }` | Format a date with `Intl.DateTimeFormat` in the active locale. |
| [`$tdr`](#tdr) | `(value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string` | Format a date as relative time ("3 days ago") with `Intl.RelativeTimeFormat`. |
| [`$tn`](#tn) | `{ (value: number, options?: Intl.NumberFormatOptions): string (value: number, key: string, overrides?: Intl.NumberFormatOptions): string (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string }` | Format a number with `Intl.NumberFormat` in the active locale. |
| [`$ts`](#ts) | `(key: string, params?: Params, defaultValue?: string) => string` | Like `$t`, but always returns a string: an object or array value is stringified rather than returned as-is. |

::: info `useNuxtApp()`-only injections
`$defineI18nRoute` and `$clearCache` are provided by the main i18n plugin on
`useNuxtApp()` but are **not** returned by the `useI18n()` composable, so they are absent
from the table above. (`$getI18nConfig` **is** available through both.) See their sections
below.
:::

### `$getI18nConfig`

```ts
() => ModuleOptionsExtend
```

The resolved module configuration, as the runtime sees it.

```typescript
const nuxtApp = useNuxtApp()
const { localeCookie, strategy, hooks } = nuxtApp.$getI18nConfig()
```

For build-time or non-Nuxt contexts, use `getI18nConfig()` from `#build/i18n.strategy.mjs` instead.

::: info `serverTranslationPreload` (internal)
`serverTranslationPreload` is a private module option exposed only in server private config (`#i18n-internal/config`). It is not part of the public runtime API and may change without notice.
:::

## 🌍 Locale Management

Methods for getting and managing locale information.

### `$getLocale`

```ts
(route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric) => string
```

Code of the active locale. Pass a route to read the locale that route belongs to.

```typescript
const locale = $getLocale()
// Output: 'en' (assuming the current locale is English)
```

### `$getLocaleName`

```ts
() => string | null
```

The active locale's `displayName` from the config, or `null` when it has none.

```typescript
const locale = $getLocaleName()
// Output: 'English'
```

### `$getLocales`

```ts
() => Locale[]
```

Every configured locale, with its metadata.

```typescript
const locales = $getLocales()
// Output: [{ code: 'en', iso: 'en-US', dir: 'ltr' }, { code: 'fr', iso: 'fr-FR', dir: 'ltr' }]
```

### `$defaultLocale`

```ts
() => string | undefined
```

Code of the configured default locale.

```typescript
const defaultLocale = $defaultLocale()
// Output: 'en'
```

## 🔍 Translation Methods

Core methods for retrieving and managing translations.

### `$t`

```ts
(key: string, params?: Params, defaultValue?: string | null) => CleanTranslation
```

Translate a key, interpolating `params` into it. Returns `defaultValue` when the key is
missing, or the key itself when no default is given.

```typescript
const welcomeMessage = $t('welcome', { username: 'Alice', unreadCount: 5 })
// Output: "Welcome, Alice! You have 5 unread messages."
```

::: warning Return type includes objects
`$t` returns `CleanTranslation` which is `string | number | boolean | Translations | PluralTranslations | null`. If the key points to a **nested object** in your JSON (e.g. `$t('header')` when the JSON contains `{ "header": { "title": "Hi" } }`), the return value will be that **object**, not a string. Using it directly in a Vue template ({{ $t('header') }}) will render as `[object Object]`.

**How to avoid this:**

* Use a more specific key: `$t('header.title')` → `"Hi"`
* Use `$ts()` which always returns a string (calls `.toString()` on non-strings)
* Use `$t` with a nested key to intentionally access sub-objects for programmatic use
  :::

### `$ts`

```ts
(key: string, params?: Params, defaultValue?: string) => string
```

Like `$t`, but always returns a string: an object or array value is stringified rather than
returned as-is.

```typescript
const welcomeMessage = $ts('welcome', { username: 'Alice', unreadCount: 5 })
// Output: "Welcome, Alice! You have 5 unread messages."
```

### `$_t` and `$_ts`

```ts
(route: RouteLocationNormalizedLoaded) => (key: string, params?: Params, defaultValue?: string | null) => CleanTranslation
```

Bind `$t` to a specific route, for translating outside the current page — a layout rendering
a link to another route, for example.

```ts
(route: RouteLocationNormalizedLoaded) => (key: string, params?: Params, defaultValue?: string | null) => string
```

Bind `$ts` to a specific route. See `$_t`.

Route-bound variants of `$t` and `$ts`. They take a **route** first and return a translation function locked to that route's locale and page context.

* **Access**: `useNuxtApp()` (also re-exported by `useI18n()` as `$_t` / `$_ts`)

Use these when the active route during SSR or transitions differs from `router.currentRoute` — for example inside `<i18n-t>`, `<i18n-group>`, or when rendering content for a specific `route` object.

```typescript
import { useRoute, useNuxtApp } from '#imports'

const route = useRoute()
const { $_t, $_ts } = useNuxtApp()

const $t = $_t(route)
const title = $t('page.title')

// String-safe variant
const label = $_ts(route)('page.label')
```

::: tip
Prefer `$t` / `$ts` in most components. Reach for `$_t` / `$_ts` when you already have an explicit route and need translations for **that** route, not the currently active one.
:::

### `$tc`

```ts
(key: string, params: number | Params, defaultValue?: string) => string
```

Translate with pluralization. `params` may be the count itself, or an object containing
`count`.

**Translation format**: forms separated by `|`. Put placeholders in **each** form:

```json
{
  "apples": "no apples | one apple | {count} apples",
  "cart": "no items for {name} | one item for {name} | {count} items for {name}"
}
```

```typescript
$tc('apples', 0) // "no apples"
$tc('apples', 1) // "one apple"
$tc('apples', 10) // "10 apples"

// count + other params (second argument must be an object)
$tc('cart', { count: 10, name: 'Alice' }) // "10 items for Alice"
```

::: warning
Do not pass extra params as a third argument — `$tc('cart', 10, { name: 'Alice' })` treats `{ name: 'Alice' }` as `defaultValue`, not interpolation params.
:::

**Component alternative** — `<i18n-t keypath="cart" :plural="count" :params="{ name }" />` (merges `count` with `params` internally).

::: tip
The form selection logic depends on the `plural` function in your config. The default selects by index (0 → first form, 1 → second, etc.). For languages like Russian, Arabic, or Polish, configure a custom `plural` function. See [Configuration → plural](/guide/configuration#plural).
:::

### `$mergeTranslations`

```ts
(newTranslations: Translations) => void
```

Merge translations into the active locale at runtime, overriding what is loaded.

```typescript
$mergeTranslations({
  welcome: 'Bienvenue, {username}!',
})
// Output: Updates the translation cache with the new French translation
```

### `$resolveTranslations`

```ts
() => Translations
```

Every translation currently in memory for the active locale and route, as a tree.
Read-only view of what `$t()` can resolve right now.

```typescript
const tree = $resolveTranslations()
// { aaa: { bbb: 'ccc' }, ddd: 1111 } — the same dictionary $t() reads from
```

Use this when you need the full in-memory dictionary (DevTools, tests, runtime editors). Treat the return value as read-only; change values through `$setTranslation` or merge patches with `$mergeTranslations`.

### `$setTranslation`

```ts
(key: string, value: unknown) => void
```

Replace the value at `key` in the active dictionary. This is a replace, not a merge —
use `$mergeTranslations` when existing siblings should survive.

```typescript
$setTranslation('aaa', { fff: 'ggg' }) // replaces the whole `aaa` subtree
$setTranslation('aaa', 'text')          // replaces `aaa` with a string
$setTranslation('ddd', 1111)            // scalar at the top level
$setTranslation('aaa.bbb', 'nested')    // dotted path
```

This is a **replace**, not a merge. Existing siblings under the same key are removed. To patch without losing siblings, use `$mergeTranslations`.

### `$setMissingHandler`

```ts
(handler: MissingHandler | null) => void
```

Install a callback invoked for every unresolved key. Pass `null` to remove it.

**Type Definition**:

```typescript
type MissingHandler = (locale: string, key: string, routeName: string, instance?: unknown, type?: string) => void
```

```typescript
// Set a custom handler
$setMissingHandler((locale, key, routeName) => {
  console.error(`Missing translation: ${key} in ${locale} for route ${routeName}`)
  // Send to Sentry or other error tracking service
  // Sentry.captureMessage(`Missing translation: ${key}`)
})

// Remove the handler
$setMissingHandler(null)
```

**Use Cases**:

* Logging missing translations to error tracking services (Sentry, LogRocket, etc.)
* Collecting analytics on missing translations
* Custom error handling for missing translation keys

## 🔢 Number & Date Formatting

Methods for formatting numbers and dates according to locale conventions.

### `$tn`

```ts
{ (value: number, options?: Intl.NumberFormatOptions): string (value: number, key: string, overrides?: Intl.NumberFormatOptions): string (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string }
```

Format a number with `Intl.NumberFormat` in the active locale. A key selects a named format
from the config.

```typescript
// Inline options
const formattedNumber = $tn(1234567.89, { style: 'currency', currency: 'USD' })
// "$1,234,567.89"

// Named format (from nuxt.config i18n.numberFormats)
const price = $tn(1000, 'currency')
const priceDe = $tn(1000, 'currency', 'de')
const compact = $tn(1000, 'currency', { notation: 'compact' })
```

Unknown named format keys fall back to default `Intl.NumberFormat` options. In development (client), a `console.warn` is emitted when `missingWarn` is enabled (default).

**Config example**:

```ts
export default defineNuxtConfig({
  i18n: {
    numberFormats: {
      en: {
        currency: { style: 'currency', currency: 'USD' },
        decimal: { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 },
      },
      de: {
        currency: { style: 'currency', currency: 'EUR' },
      },
    },
  },
})
```

**Use Cases**:

* Formatting numbers as currency, percentages, or decimals in the appropriate locale format
* Reusing named formats across the app (Vue I18n migration parity)

### `$td`

```ts
{ (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string (value: Date | number | string, key: string, overrides?: Intl.DateTimeFormatOptions): string (value: Date | number | string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string }
```

Format a date with `Intl.DateTimeFormat` in the active locale. A key selects a named format
from the config.

```typescript
const formattedDate = $td(new Date(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
// "Friday, September 1, 2023"

const short = $td(new Date(), 'short')
const longDe = $td(new Date(), 'long', 'de')
```

Unknown named format keys fall back to default `Intl.DateTimeFormat` options. In development (client), a `console.warn` is emitted when `missingWarn` is enabled (default).

**Config example**:

```ts
export default defineNuxtConfig({
  i18n: {
    datetimeFormats: {
      en: {
        short: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
      },
    },
  },
})
```

**Use Cases**:

* Displaying dates in a format that aligns with the user's locale
* Sharing short/long/date-time presets app-wide

### `$tdr`

```ts
(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions) => string
```

Format a date as relative time ("3 days ago") with `Intl.RelativeTimeFormat`.

```typescript
const relativeDate = $tdr(new Date(Date.now() - 1000 * 60 * 5))
// Output: "5 minutes ago" in the 'en-US' locale
```

## 🔄 Route & Locale Switching

Methods for switching between locales and routes.

### `$switchLocale`

```ts
(locale: string) => void
```

Navigate to the current page in another locale.

```typescript
$switchLocale('fr')
// Prefix strategies: navigates to the French version of the route
// no_prefix: updates locale and translations without changing the URL path
```

::: tip Switch locale without changing the URL?
See [FAQ — switch locale without changing the URL](/guide/faq#-switch-locale-without-changing-the-url). For prefix strategies, use `$switchLocalePath()` when you only need a link target.
:::

### `$switchLocaleRoute`

```ts
(locale: string) => RouteLocationRaw
```

The route object for the current page in another locale, without navigating.

```typescript
// on /en/news
const routeFr = $switchLocaleRoute('fr')
// Output: A route object with the new locale applied, e.g., { name: 'localized-news', params: { locale: 'fr' } }
```

### `$switchLocalePath`

```ts
(locale: string) => string
```

The path of the current page in another locale, without navigating.

```typescript
// on /en/news
const routeFr = $switchLocalePath('fr')
window.location.href = routeFr
// Output: url with new locale applied, e.g., '/fr/nouvelles'
```

### `$switchRoute`

```ts
(route: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, toLocale?: string) => void
```

Navigate to another route, keeping the active locale or switching to `toLocale`.

**Examples**:

::: code-group

```typescript [String Path]
// Switches to the given path with the current locale
$switchRoute('/about')
```

```typescript [String Path with Locale]
// Switches to the given path with French locale
$switchRoute('/about', 'fr')
```

```typescript [Named Route]
// Switches to a named route with the current locale
$switchRoute({ name: 'page' })
```

```typescript [Named Route with Locale]
// Switches to a named route and changes the locale to Spanish
$switchRoute({ name: 'page' }, 'es')
```

:::

## 🌐 Route Generation

Methods for generating localized routes and paths.

### `$localeRoute`

```ts
(to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string) => RouteLocationResolved
```

Resolve a route in the given locale, or the active one.

```typescript
const localizedRoute = $localeRoute({ name: 'index' })
// Output: A route object with the current locale applied, e.g., { name: 'index', params: { locale: 'fr' } }
```

### `$localePath`

```ts
(to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string) => string
```

Resolve a path in the given locale, or the active one.

```typescript
const localizedPath = $localePath({ name: 'news' })
// Output: path with current (or specified) locale applied, e.g., '/en/nouvelles'
```

## 🔍 Route Information

Methods for getting route information and names.

### `$getRouteName`

```ts
(route?: RouteLocationNamedRaw | RouteLocationResolvedGeneric, locale?: string) => string
```

Route name with the locale prefix stripped — the name translations are keyed by.

```typescript
const routeName = $getRouteName(routeObject, 'fr')
// Output: 'index' (assuming the base route name is 'index')
```

## 🚦 Route Configuration

Methods for configuring route behavior and access control.

### `$defineI18nRoute`

```ts
(routeDefinition: DefineI18nRouteConfig) => Promise<void>
```

Register per-page locale configuration and translations from inside a component.
Merges into the active locale and re-applies when the locale changes.

> \[!IMPORTANT]
> `$defineI18nRoute` is provided by the **define plugin** and is available on `useNuxtApp()` only — it is **not** part of the `useI18n()` return object.
> Always destructure it from `useNuxtApp()` inside `script setup`. Calling `$defineI18nRoute(...)` as a bare global throws `"$defineI18nRoute is not defined"` during SSR/prerender.

**Parameters**:

* **locales**: `string[] | Record<string, Record<string, string>>` — Available locales for the route
* **localeRoutes**: `Record<string, string>` — Optional. Custom routes for specific locales
* **disableMeta**: `boolean | string[]` — Optional. Disables i18n meta tags for all or specific locales

**Basic Example**:

```typescript
import { useNuxtApp } from '#imports'

const { $defineI18nRoute } = useNuxtApp()

$defineI18nRoute({
  locales: ['en', 'fr', 'de'],
  localeRoutes: {
    en: '/welcome',
    fr: '/bienvenue',
    de: '/willkommen',
  },
  disableMeta: false,
})
```

> 📖 **For detailed usage examples, configuration formats, and best practices, see the [Per-Component Translations Guide](/guide/per-component-translations.md).**

### `$setI18nRouteParams`

```ts
(value: I18nRouteParams) => I18nRouteParams
```

Set per-locale params for the current route, so a dynamic segment can differ per language.
Call it during SSR, before the head is rendered.

```typescript
// in pages/news/[id].vue
// for en/news/1-first-article
const { $switchLocaleRoute, $setI18nRouteParams, $defineI18nRoute } = useNuxtApp()
$defineI18nRoute({
  localeRoutes: {
    en: '/news/:id()',
    fr: '/nouvelles/:id()',
    de: '/Nachricht/:id()',
  },
})
const { data: news } = await useAsyncData(`news-${params.id}`, async () => {
  let response = await $fetch("/api/getNews", {
    query: {
      id: params.id,
    },
  });
  if (response?.localeSlugs) {
    response.localeSlugs = {
      en: {
        id: '1-first-article'
      }
      fr: {
        id: '1-premier-article'
      }
      de: {
        id: '1-erster-Artikel'
      }
    }
    $setI18nRouteParams(response?.localeSlugs);
  }
  return response;
});
$switchLocalePath('fr') // === 'fr/nouvelles/1-premier-article'
$switchLocalePath('de') // === 'de/Nachricht/1-erster-Artikel'
```

## 💻 Usage Examples

### Basic Component Usage

```vue
<template>
  <div>
    <p>{{ $t('key2.key2.key2.key2.key2') }}</p>
    <p>Current Locale: {{ $getLocale() }}</p>

    <div>
      {{ $t('welcome', { username: 'Alice', unreadCount: 5 }) }}
    </div>
    <div>
      {{ $tc('apples', 10) }}
    </div>

    <div>
      <button v-for="locale in $getLocales()" :key="locale.code" :disabled="locale.code === $getLocale()" @click="() => $switchLocale(locale.code)">
        Switch to {{ locale.code }}
      </button>
    </div>

    <div>
      <NuxtLink :to="$localeRoute({ name: 'index' })"> Go to Index </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '#imports'

const { $getLocale, $switchLocale, $getLocales, $localeRoute, $t, $tc } = useI18n()
</script>
```

### Using with useNuxtApp

```typescript
import { useNuxtApp } from '#imports'

const { $getLocale, $switchLocale, $getLocales, $localeRoute, $t } = useNuxtApp()
```

### Using with useI18n Composable

```typescript
import { useI18n } from '#imports'

const { $getLocale, $switchLocale, $getLocales, $localeRoute, $t } = useI18n()
// or
const i18n = useI18n()
```

## 🔧 Cache & Utility Methods

### `$has`

```ts
(key: string) => boolean
```

Whether a key resolves in the active locale. Use it to branch on optional copy instead of
rendering a raw key.

During same-locale page transitions, v3 automatically deep-merges translations from the leaving page into this dictionary until the transition finishes — so keys from the previous page may still return `true` briefly. There is no `previousPageFallback` option; this behavior is built in. See [FAQ — page transitions](/guide/faq#-why-do-translations-break-during-page-transitions-especially-with-defineasynccomponent).

```typescript
if ($has('welcome')) {
  console.log($t('welcome'))
} else {
  console.log('Key not found')
}
```

### `$clearCache`

```ts
() => void
```

Drop every cached chunk, on the client and in the active dictionary.

**Access**: `useNuxtApp().$clearCache`. Declared in `NuxtAppOnlyInjections` rather than `PluginsInjections`, so it is typed but deliberately absent from the `useI18n()` helper object:

```typescript
const { $clearCache } = useNuxtApp()
// All cached translations are removed; next render will re-fetch them
$clearCache()
```

### `$loadPageTranslations`

```ts
(locale: string, routeName: string, translations: Translations) => Promise<void>
```

Load translations for a page at runtime, for content whose keys are not known at build time.

```typescript
await $loadPageTranslations('en', 'about', {
  title: 'About Us',
  description: 'Learn more about our company',
})
```

## 🧭 `useI18nLocale` Composable

The centralized composable for locale state management. Use this instead of directly manipulating `useState('i18n-locale')` or `useCookie('user-locale')`.

```typescript
const {
  setLocale, // (locale: string) => void — updates state + cookie
  getLocale, // () => string | null — from state or cookie
  getPreferredLocale, // () => string | null — validated against locales list
  getEffectiveLocale, // (route, getLocaleFromRoute) => string
  resolveInitialLocale, // (options) => string
  isValidLocale, // (locale) => boolean
  locale, // Ref<string | null> — reactive state
  localeCookie, // CookieRef — reactive cookie
  syncLocale, // (locale) => void — sync to cookie only
  validLocales, // string[] — list of valid locale codes
} = useI18nLocale()
```

### Key Methods

| Method                  | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `setLocale(locale)`     | Sets locale in both `useState` and cookie atomically        |
| `getLocale()`           | Returns current locale from state or cookie                 |
| `getPreferredLocale()`  | Returns locale validated against `locales` list, or `null`  |
| `isValidLocale(locale)` | Checks if a locale code is in the configured `locales` list |

### Usage in Custom Plugins

```typescript
// plugins/i18n-loader.server.ts
export default defineNuxtPlugin({
  name: 'i18n-custom-loader',
  enforce: 'pre',
  order: -10,
  setup() {
    const { setLocale } = useI18nLocale()
    // Detect locale from headers, domain, etc.
    setLocale('de')
  },
})
```

See [Custom Language Detection](/guide/custom-auto-detect) for detailed examples.
