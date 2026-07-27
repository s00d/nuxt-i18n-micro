---
title: 'Configuration Reference'
description: 'All nuxt-i18n-micro module options, defaults, and examples.'
outline: 'deep'
---

# Configuration Reference

Complete reference for every option under the `i18n` key in `nuxt.config`. Types and defaults match [`ModuleOptions`](https://github.com/s00d/nuxt-i18n-micro/blob/main/packages/types/src/index.ts) in `@i18n-micro/types`.

## Quick reference

Every option the module accepts, from the `ModuleOptions` type. The sections below explain
how they work together; the [Module Options reference](/api/module-options) has the full
descriptions.

<!-- generated:options-index — do not edit; run `pnpm run docs:generate` -->

| Option | Type | Default | Purpose |
| --- | --- | --- | --- |
| [`locales`](/api/module-options) | `Locale[]` | `[]` | List of supported locales |
| [`meta`](/api/module-options) | `boolean` | `true` | Generate SEO meta tags (`hreflang`, `canonical`, `og:url`, `og:locale`) automatically |
| [`strategy`](/api/module-options) | `Strategies` | `'prefix_except_default'` | URL routing strategy for locale prefixes |
| [`metaBaseUrl`](/api/module-options) | `string` | `undefined` | Base URL for SEO meta tags (canonical, og:url, hreflang) |
| [`metaTrustForwardedHost`](/api/module-options) | `boolean` | `true` | Trust the `X-Forwarded-Host` header when resolving the base URL for meta tags |
| [`metaTrustForwardedProto`](/api/module-options) | `boolean` | `true` | Trust the `X-Forwarded-Proto` header when resolving the protocol for meta tags |
| [`define`](/api/module-options) | `boolean` | `true` | Register the `defineI18nRoute()` macro plugin, enabling per-page `defineI18nRoute()` calls |
| [`redirects`](/api/module-options) | `boolean` | `true` | Enable automatic locale-based redirects |
| [`plugin`](/api/module-options) | `boolean` | `true` | Register the core i18n plugin that provides `$t()`, `$tc()`, `$getLocale()`, `$switchLocale()`, and other runtime helpers |
| [`hooks`](/api/module-options) | `boolean` | `true` | Register the i18n hooks plugin that provides `i18n:register` and `i18n:beforeLocaleSwitch` / `i18n:afterLocaleSwitch` app-level hooks |
| [`components`](/api/module-options) | `boolean` | `true` | Register built-in i18n components (`<i18n-link>`, `<i18n-switcher>`, `<i18n-t>`, `<i18n-group>`) |
| [`serverTranslationPreload`](/api/module-options) | `boolean` | `false` | Preload index-page translations in Nitro global middleware (server-only, private config) |
| [`defaultLocale`](/api/module-options) | `string` | `'en'` | The locale to use when no locale can be determined from URL or user preferences |
| [`apiBaseUrl`](/api/module-options) | `string` | `'_locales'` | Base URL path segment for the translations API route (used in SSR/SSG data fetching) |
| [`apiBaseClientHost`](/api/module-options) | `string` | `undefined` | Override the host used for client-side translation fetch requests |
| [`apiBaseServerHost`](/api/module-options) | `string` | `undefined` | Override the host used for server-side translation fetch requests |
| [`translationDir`](/api/module-options) | `string` | `'locales'` | Path to the directory containing translation JSON files, relative to the project root |
| [`translationPayloads`](/api/module-options) | `TranslationPayloadOptions` | — | Controls how pre-merged translation payload files are emitted during build |
| [`translationPayloads.mode`](/api/module-options) | `'premerged' \| 'source'` | `'premerged'` | Translation payload strategy |
| [`translationPayloads.serverAssets`](/api/module-options) | `boolean` | `true` | Register translation payload files as Nitro server assets |
| [`translationPayloads.serverHandler`](/api/module-options) | `boolean` | `true` | Register the built-in server route at `/{apiBaseUrl}/:page/:locale/data.json` |
| [`translationPayloads.publicAssets`](/api/module-options) | `boolean` | `true in `premerged` mode, `false` in `source` mode` | Copy translation payload files into Nitro public assets during production builds |
| [`translationPayloads.prerenderRoutes`](/api/module-options) | `boolean` | `true in `premerged` mode, `false` in `source` mode` | Add translation data routes to Nuxt/Nitro prerender output |
| [`translationPayloads.publicDir`](/api/module-options) | `string` | — | Public output directory for copied translation payloads, relative to Nitro's public directory |
| [`translationPayloads.warnFileCount`](/api/module-options) | `number` | `500` | Warn during build when generated payload file count exceeds this threshold |
| [`translationPayloads.warnSizeBytes`](/api/module-options) | `number` | `10485760 (10 MB)` | Warn during build when generated payload total size exceeds this threshold in bytes |
| [`autoDetectLanguage`](/api/module-options) | `boolean` | `true` | Automatically detect the user's preferred language from the `Accept-Language` HTTP header |
| [`autoDetectPath`](/api/module-options) | `string` | `'/'` | URL path on which automatic language detection and redirect occur |
| [`disableWatcher`](/api/module-options) | `boolean` | `false` | Disable the file watcher that auto-creates missing translation files in development mode |
| [`types`](/api/module-options) | `boolean` | `true` | Generate TypeScript type declarations for `useI18n`, `$t`, and related helpers based on the translation keys in your default locale files |
| [`routesLocaleLinks`](/api/module-options) | `{ [key: string]: string }` | `{}` | Map route names to other route names to share the same translation files |
| [`plural`](/api/module-options) | `string \| PluralFunc` | `built-in pluralization (singular/plural by count)` | Custom pluralization function or a path to a file exporting one |
| [`disablePageLocales`](/api/module-options) | `boolean` | `false` | Disable per-page translation files |
| [`fallbackLocale`](/api/module-options) | `string` | `undefined (no fallback; returns the raw key)` | Global fallback locale code |
| [`localeCookie`](/api/module-options) | `string \| null` | `null` | Cookie name for persisting the user's locale preference across sessions |
| [`debug`](/api/module-options) | `boolean` | `false` | Enable verbose debug logging for locale detection, route generation, and translation loading |
| [`globalLocaleRoutes`](/api/module-options) | `GlobalLocaleRoutes` | `{}` | Global route-level locale configuration |
| [`customRegexMatcher`](/api/module-options) | `string \| RegExp` | `undefined (uses built-in pattern based on locale codes)` | Custom regular expression (or its string source) for matching locale codes in URL segments |
| [`noPrefixRedirect`](/api/module-options) | `boolean` | `false` | For `no_prefix` strategy: enable redirect from a locale-prefixed URL (e.g |
| [`canonicalQueryWhitelist`](/api/module-options) | `string[]` | `['page', 'sort', 'filter', 'search', 'q', 'query', 'tag']` | List of query parameter names preserved in canonical and `og:url` meta tags |
| [`excludePatterns`](/api/module-options) | `(string \| RegExp)[]` | `undefined` | URL patterns (strings or RegExp) to exclude from i18n processing entirely |
| [`localizedRouteNamePrefix`](/api/module-options) | `string` | `'localized-'` | Prefix prepended to localized route names (e.g |
| [`routeLocales`](/api/module-options) | `Record<string, string[]>` | — | Per-route locale restrictions, extracted from `defineI18nRoute()` calls |
| [`routeDisableMeta`](/api/module-options) | `Record<string, boolean \| string[]>` | — | Per-route meta tag disabling, extracted from `defineI18nRoute()` calls |
| [`missingWarn`](/api/module-options) | `boolean` | `true` | Show console warnings when a translation key is missing |
| [`hmr`](/api/module-options) | `boolean` | `true` | Enable Hot Module Replacement for translation files in development |
| [`cacheMaxSize`](/api/module-options) | `number` | `0` | Maximum number of entries in the in-memory translation cache |
| [`cacheTtl`](/api/module-options) | `number` | `0` | Time-to-live (in seconds) for cached translation entries |
| [`numberFormats`](/api/module-options) | `Record<string, Record<string, Intl.NumberFormatOptions>>` | — | Named number formats per locale (Vue I18n-compatible) |
| [`datetimeFormats`](/api/module-options) | `Record<string, Record<string, Intl.DateTimeFormatOptions>>` | — | Named datetime formats per locale (Vue I18n-compatible `datetimeFormats`) |
| [`httpCacheDuration`](/api/module-options) | `number` | — | HTTP `Cache-Control` max-age (seconds) for `/{apiBaseUrl}/:page/:locale/data.json` |
| [`dateBuild`](/api/module-options) | `string \| number` | — | Value used for cache-busting translation requests (`?v=...`) |
| [`experimental`](/api/module-options) | `Record<string, unknown>` | — | Bucket for experimental/unstable options |

<!-- /generated:options-index -->

# Option details

The module provides extensive configuration options to customize your internationalization setup.

### 🌍 Core Locale Settings

#### `locales`

Defines the locales available in your application.

**Type**: `Locale[]`

Each locale object supports:

| Property         | Type      | Required | Description                                           |
| ---------------- | --------- | -------- | ----------------------------------------------------- |
| `code`           | `string`  | ✅       | Unique identifier (e.g., `'en'`)                      |
| `displayName`    | `string`  | ❌       | Human-readable name for switchers (e.g., `'English'`) |
| `iso`            | `string`  | ❌       | ISO code (e.g., `'en-US'`)                            |
| `dir`            | `string`  | ❌       | Text direction (`'ltr'` or `'rtl'`)                   |
| `disabled`       | `boolean` | ❌       | Disable in dropdown if `true`                         |
| `baseUrl`        | `string`  | ❌       | Base URL for locale-specific domains                  |
| `baseDefault`    | `boolean` | ❌       | Remove locale prefix from URLs                        |
| `fallbackLocale` | `string`  | ❌       | Per-locale fallback (overrides global)                |
| `[key: string]`  | `unknown` | ❌       | Any custom properties (see below)                     |

**Example**:

```typescript
locales: [
  { code: 'en', iso: 'en-US', dir: 'ltr' },
  { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
  { code: 'ar', iso: 'ar-SA', dir: 'rtl', disabled: true },
  {
    code: 'de',
    iso: 'de-DE',
    dir: 'ltr',
    baseUrl: 'https://de.example.com',
    baseDefault: true,
  },
]
```

::: warning BaseUrl Considerations

Using `baseUrl` can lead to duplication of internal routes as external links, complicating routing and maintenance. Consider creating external links directly for specific locales instead.

:::

#### Custom Locale Properties

You can add any custom properties to locale objects. They are passed through to the runtime and accessible via `$getLocales()`:

```typescript
locales: [
  { code: 'en', iso: 'en-US', flag: '🇬🇧', currency: 'GBP' },
  { code: 'de', iso: 'de-DE', flag: '🇩🇪', currency: 'EUR' },
  { code: 'ru', iso: 'ru-RU', flag: '🇷🇺', currency: 'RUB' },
]
```

Access them in components:

```vue
<template>
  <ul>
    <li v-for="locale in $getLocales()" :key="locale.code">{{ locale.flag }} {{ locale.displayName }} ({{ locale.currency }})</li>
  </ul>
</template>
```

By default, custom properties are typed as `unknown`. To get full TypeScript support, use **module augmentation**. Create a declaration file (e.g., `app/i18n.d.ts` or any `.d.ts` included in your `tsconfig`):

```typescript
// app/i18n.d.ts
declare module '@i18n-micro/types' {
  interface Locale {
    flag?: string
    currency?: string
  }
}
```

After this, all custom properties are fully typed:

```typescript
const locales = $getLocales()
locales[0].flag // string | undefined ✅
locales[0].currency // string | undefined ✅
```

::: tip
Module augmentation works because `Locale` is an `interface` (not a `type`), so TypeScript merges your declarations with the original definition. This applies everywhere — `$getLocales()`, `useI18n()`, server middleware, etc.
:::

#### `defaultLocale`

Sets the default locale when no specific locale is selected.

**Type**: `string`  
**Default**: `'en'`

```typescript
defaultLocale: 'en'
```

#### `strategy`

Defines how locale prefixes are handled in routes.

**Type**: `string`  
**Default**: `'prefix_except_default'`

::: code-group

```typescript [no_prefix]
strategy: 'no_prefix'
// Routes: /about, /contact
// Locale detection via browser/cookies
```

```typescript [prefix_except_default]
strategy: 'prefix_except_default'
// Default locale: /about, /contact
// Other locales: /fr/about, /de/contact
```

```typescript [prefix]
strategy: 'prefix'
// All locales: /en/about, /fr/about, /de/about
```

```typescript [prefix_and_default]
strategy: 'prefix_and_default'
// Both prefixed and non-prefixed versions for default locale
```

:::

### 📂 Translation Management

#### `translationDir`

Specifies the directory for translation files.

**Type**: `string`  
**Default**: `'locales'`

```typescript
translationDir: 'i18n' // Custom directory
// Nuxt 4 colocation example:
// translationDir: 'app/locales'
```

Paths are resolved from the Nuxt **project root** (`rootDir`), not from `app/`. With Nuxt 4, the usual setup is `app/pages/` for routes and `locales/` (or `app/locales` if you set `translationDir`) for JSON files.

#### `disablePageLocales`

Disables page-specific translations, using only root-level files.

**Type**: `boolean`  
**Default**: `false`

When enabled, only root-level translation files are used:

```tree
locales/
├── en.json
├── fr.json
└── ar.json
```

#### `fallbackLocale`

Specifies a fallback locale for missing translations.

**Type**: `string | undefined`  
**Default**: `undefined`

```typescript
fallbackLocale: 'en' // Global fallback
```

#### `types`

Generate TypeScript declarations for `useI18n()`, `$t()`, `$tc()`, and related helpers based on translation keys in your default locale files.

**Type**: `boolean`  
**Default**: `true`

When enabled, the module emits `.nuxt/i18n.d.ts` during build with typed translation keys. Set to `false` if you prefer untyped helpers or use an external generator.

This built-in generator is separate from the optional [`@i18n-micro/types-generator`](/integrations/types-generator) package, which can produce stricter or standalone type files for monorepos and CI.

```typescript
types: false // Disable built-in key typing
```

#### `routeLocales`

Per-route locale restrictions, populated at build time from `defineI18nRoute({ locales: [...] })` calls in page components.

**Type**: `Record<string, string[]>`  
**Default**: `{}` (extracted automatically; do not set manually in most cases)

Maps a route path (e.g. `'/about'`) to allowed locale codes. Routes not listed allow all configured locales.

You normally configure this via [`defineI18nRoute`](/guide/custom-locale-routes) in pages rather than in `nuxt.config`. The module merges page-level declarations into this map at build time.

#### `routeDisableMeta`

Per-route SEO meta disabling, populated at build time from `defineI18nRoute({ disableMeta: ... })`.

**Type**: `Record<string, boolean | string[]>`  
**Default**: `{}` (extracted automatically)

- `true` — disable all SEO meta for the route
- `string[]` — disable meta only for listed locale codes

Like `routeLocales`, this is typically set in page components, not manually in config.

#### `experimental`

Bucket for experimental or unstable options. Contents may change between minor versions without notice.

**Type**: `Record<string, unknown>`  
**Default**: `undefined`

Most former `experimental.*` flags were promoted to top-level options in v3 (for example `hmr`). Prefer documented top-level options. Use `experimental` only when following a release note or migration guide that references a specific key.

### 🔍 SEO & Meta Tags

#### `meta`

Enables automatic SEO meta tag generation.

**Type**: `boolean`  
**Default**: `true`

```typescript
meta: true // Generate alternate links, canonical URLs, etc.
```

#### `metaBaseUrl`

Sets the base URL for SEO meta tags (canonical, og:url, hreflang).

**Type**: `string | undefined`  
**Default**: `undefined`

- `undefined` (or omitted) — the base URL is resolved dynamically from the incoming request on the server (`useRequestURL().origin`, respects `X-Forwarded-Host` / `X-Forwarded-Proto` proxy headers) and from `window.location.origin` on the client. Ideal for **multi-domain** deployments where the same application serves multiple hostnames.
- Any other string — used as a static base URL.

```typescript
// Dynamic — automatically uses the current request hostname (recommended for multi-domain)
// Simply omit metaBaseUrl or set it to undefined

// Static — always uses the specified URL
metaBaseUrl: 'https://example.com'
```

#### `canonicalQueryWhitelist`

Specifies which query parameters to preserve in canonical URLs.

**Type**: `string[]`  
**Default**: `['page', 'sort', 'filter', 'search', 'q', 'query', 'tag']`

```typescript
canonicalQueryWhitelist: ['page', 'sort', 'category']
```

### 🔄 Advanced Features

#### `globalLocaleRoutes`

Defines custom localized routes for specific pages.

**Type**: `Record<string, Record<string, string> | false>`

```typescript
globalLocaleRoutes: {
  'about': {
    en: '/about-us',
    fr: '/a-propos',
    de: '/uber-uns'
  },
  'unlocalized': false // Disable localization entirely
}
```

#### `routesLocaleLinks`

Creates links between pages' locale files to share translations.

**Type**: `Record<string, string>`

```typescript
routesLocaleLinks: {
  'products-id': 'products',
  'about-us': 'about'
}
```

#### `customRegexMatcher`

Improves performance for applications with many locales. Instead of checking each locale code one by one, the module uses a single regex to detect whether the first path segment is a locale. The pattern matches the **entire** first path segment (anchors `^` and `$` are applied automatically).

**Type**: `string | RegExp`  
**Default**: `undefined` (auto-generated from locale codes)

::: danger Must match ALL locale codes
At build time, the module **validates** that every locale code in your `locales` list matches the `customRegexMatcher` pattern. If any locale code does not match, **the build will fail** with the error:

> `Nuxt-i18n-micro: Some locale codes does not match customRegexMatcher`

Always verify your regex against all your locale codes before deploying.
:::

```typescript
// ✅ Correct: matches 'en-us', 'de-de', 'fr-fr'
customRegexMatcher: '[a-z]{2}-[a-z]{2}'

// ✅ Correct: matches 'en', 'de', 'fr', 'zh'
customRegexMatcher: '[a-z]{2}'

// ❌ Wrong: won't match 'zh-Hant' (uppercase letter)
// This will FAIL the build if 'zh-Hant' is in your locales list
customRegexMatcher: '[a-z]{2}-[a-z]{2}'
```

### 🛠️ Development Options

#### `debug`

Enables logging and debugging information.

**Type**: `boolean`  
**Default**: `false`

```typescript
debug: true
```

#### `disableWatcher`

Disables automatic creation of locale files during development.

**Type**: `boolean`  
**Default**: `false`

```typescript
disableWatcher: true
```

#### `missingWarn`

Controls whether to show console warnings when translation keys are not found.

**Type**: `boolean`  
**Default**: `true`

```typescript
missingWarn: false // Disable warnings for missing translations
```

::: tip Custom Missing Handler

You can set a custom handler for missing translations using `setMissingHandler` method. This allows you to send missing translation errors to error tracking services like Sentry.

:::

### 🔧 Plugin Control

#### `define`

Enables the `define` plugin for runtime configuration.

**Type**: `boolean`  
**Default**: `true`

```typescript
define: false // Disables $defineI18nRoute
```

#### `redirects`

Enables automatic locale-based redirects. When `true`, visitors are redirected to their preferred locale (detected from cookie, `Accept-Language` header, or the default) on the first visit.

When `false`, redirect logic is disabled on both environments:

- **Server**: `06.redirect.ts` (server-only) remains registered for 404 checks and cookie synchronization, but does not issue locale redirects
- **Client**: the `i18n-redirect` global route middleware is not registered — no SPA auto-redirects

**Type**: `boolean`  
**Default**: `true`

```typescript
redirects: false // Disable automatic locale redirection (server 404/cookie sync remain; no client middleware)
```

#### `plugin`

Enables the main plugin.

**Type**: `boolean`  
**Default**: `true`

```typescript
plugin: false
```

#### `hooks`

Enables the hooks plugin (`05.hooks.ts`) that fires the `i18n:register` event. When `true` (default), the module calls `i18n:register` on startup and on navigation so your plugins can merge extra translations into the active locale/route context.

**Type**: `boolean`  
**Default**: `true`

```typescript
hooks: false // Disable automatic i18n:register calls
```

See [Events — `i18n:register`](/api/events#-i18n-register) for hook timing and plugin examples.

#### `components`

Registers the built-in i18n components (`<i18n-link>`, `<i18n-switcher>`, `<i18n-t>`, `<i18n-group>`). Set to `false` to disable automatic component registration — useful if you don't use the built-in components and want to reduce the module footprint.

**Type**: `boolean`  
**Default**: `true`

```typescript
components: false // Disable built-in i18n components
```

### 🌐 Language Detection

#### `autoDetectLanguage`

Automatically detects user's preferred language.

**Type**: `boolean`  
**Default**: `true`

```typescript
autoDetectLanguage: false
```

#### `autoDetectPath`

Specifies routes where locale detection is active.

**Type**: `string`  
**Default**: `"/"`

```typescript
autoDetectPath: '/' // Only on home route
autoDetectPath: '*' // On all routes (use with caution)
```

### 🔢 Customization

#### `plural`

Custom function for handling pluralization, used by `$tc()`.

**Type**: `PluralFunc` — `(key: string, count: number, params: Record<string, string | number | boolean>, locale: string, t: Getter) => string | null`

**Default**: Built-in function that splits the translation value by `|` and picks the form by index.

##### How it works

Translations use `|` to separate plural forms:

```json
{
  "apples": "no apples | one apple | {count} apples"
}
```

Use `$tc('apples', count)` or `$tc('cart', { count, name })` when a form needs more than `{count}` — pass **`count` and other params in the second argument object**, not as a third argument (third is `defaultValue` only).

The `$tc` call invokes the `plural` function, which:

1. Calls `t(key)` to get the raw translation string (e.g. `"no apples | one apple | {count} apples"`)
2. Splits by `|` to get the forms array
3. Selects a form based on `count`
4. Replaces `{count}` with the actual number

The **default** implementation selects by index: `count < forms.length ? forms[count] : forms[last]`. This works for simple cases (0 → first form, 1 → second, 2+ → last).

##### Custom plural function

For languages with complex pluralization rules (e.g., Russian, Arabic, Polish), override the `plural` option.

::: danger Serialization requirement
The function is serialized via `.toString()` and injected into a virtual module at build time. This means:

- **Must use `function` keyword** — NOT shorthand method syntax, NOT arrow functions with external references
- **No imports or external references** — the function must be fully self-contained
- **No TypeScript-only syntax** that doesn't survive `.toString()` (type annotations are fine in `nuxt.config.ts` because Nuxt strips them)
  :::

**Example: Russian pluralization** (4 forms: zero, one, few, many):

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  i18n: {
    plural: function (key, count, _params, _locale, t) {
      const translation = t(key)
      if (!translation) return key

      const forms = translation
        .toString()
        .split('|')
        .map(function (s) {
          return s.trim()
        })
      let idx

      if (count === 0) {
        idx = 0
      } else {
        const mod10 = count % 10
        const mod100 = count % 100
        if (mod10 === 1 && mod100 !== 11) {
          idx = 1
        } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
          idx = 2
        } else {
          idx = 3
        }
      }

      if (idx >= forms.length) idx = forms.length - 1
      return (forms[idx] || '').replace('{count}', String(count))
    },
  },
})
```

With this translation:

```json
{
  "apples": "нет яблок | {count} яблоко | {count} яблока | {count} яблок"
}
```

Results:

- `$tc('apples', 0)` → `"нет яблок"`
- `$tc('apples', 1)` → `"1 яблоко"`
- `$tc('apples', 3)` → `"3 яблока"`
- `$tc('apples', 5)` → `"5 яблок"`
- `$tc('apples', 21)` → `"21 яблоко"`

**Example: Simple English (default behavior)**:

```typescript
// This is the built-in default — you don't need to set it explicitly
plural: function (key, count, params, _locale, t) {
  const translation = t(key, params)
  if (!translation) return null

  const forms = translation.toString().split('|')
  if (forms.length === 0) return null
  const form = count < forms.length ? forms[count] : forms[forms.length - 1]
  if (!form) return null
  return form.trim().replace('{count}', count.toString())
}
```

##### Per-locale pluralization

If different locales need different plural rules, use the `locale` parameter:

```typescript
plural: function (key, count, _params, locale, t) {
  const translation = t(key)
  if (!translation) return key

  const forms = translation.toString().split('|').map(function (s) { return s.trim() })

  // Russian/Ukrainian plural rules
  if (locale === 'ru' || locale === 'uk') {
    let idx
    if (count === 0) {
      idx = 0
    } else {
      const mod10 = count % 10
      const mod100 = count % 100
      if (mod10 === 1 && mod100 !== 11) idx = 1
      else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) idx = 2
      else idx = 3
    }
    if (idx >= forms.length) idx = forms.length - 1
    return (forms[idx] || '').replace('{count}', String(count))
  }

  // Default: English-like (index-based)
  const idx = count < forms.length ? count : forms.length - 1
  return (forms[idx] || '').replace('{count}', String(count))
}
```

#### `localeCookie`

Specifies the cookie name for storing user's locale. This enables locale persistence across page reloads and browser sessions.

**Type**: `string | null`  
**Default**: `null` (but see note below about `no_prefix`)

::: warning Effective default depends on strategy
While the configured default is `null` (disabled), the module **automatically overrides** this to `'user-locale'` when using `strategy: 'no_prefix'`. This means:

- **`no_prefix`**: Cookie is **always enabled** (`'user-locale'`), even if you don't set it explicitly. This is required because the URL contains no locale information.
- **All other strategies**: Cookie is `null` (disabled) unless you set it explicitly.

If you set `localeCookie` explicitly, your value is always used regardless of strategy.
:::

::: warning Required for redirects with prefix strategies
When using prefix strategies (`prefix`, `prefix_except_default`, `prefix_and_default`) with `redirects: true` (the default), you **must** set `localeCookie` for redirect behavior to work correctly. Without a cookie, the redirect plugin cannot remember the user's locale preference across page reloads, and redirects will only work based on `Accept-Language` header (if `autoDetectLanguage: true`) or `defaultLocale`.
:::

```typescript
// Enable cookie (recommended when using redirects with prefix strategies)
localeCookie: 'user-locale'

// Enable cookie with custom name
localeCookie: 'my-locale-cookie'

// Disable cookie (default) - locale won't persist across reloads
localeCookie: null
```

**What `localeCookie` enables:**

- Persists user's locale preference across page reloads
- Remembers locale when user returns to your site
- Required for `no_prefix` strategy to work correctly
- **Required** for redirect behavior in prefix strategies (when `redirects: true`)

#### `apiBaseUrl`

Defines the path prefix for fetching cached translations. This is a path prefix only, not a full URL.

**Type**: `string`  
**Default**: `'_locales'`  
**Environment Variable**: `NUXT_I18N_APP_BASE_URL`

```typescript
apiBaseUrl: 'api/_locales'
```

The translations will be fetched from `/{apiBaseUrl}/{routeName}/{locale}/data.json` (e.g., `/api/_locales/index/en/data.json`).

#### `apiBaseClientHost`

Defines the base host URL for fetching translations from a CDN or external server on the client side. Use this when translations are hosted on a different domain and need to be fetched from the browser.

**Type**: `string | undefined`  
**Default**: `undefined`  
**Environment Variable**: `NUXT_I18N_APP_BASE_CLIENT_HOST`

```typescript
apiBaseClientHost: 'https://cdn.example.com'
```

When `apiBaseClientHost` is set, client-side translations will be fetched from `{apiBaseClientHost}/{apiBaseUrl}/{routeName}/{locale}/data.json` (e.g., `https://cdn.example.com/_locales/index/en/data.json`).

#### `apiBaseServerHost`

Defines the base host URL for fetching translations from a CDN or external server on the server side (SSR). Use this when translations are hosted on a different domain and need to be fetched during server-side rendering.

**Type**: `string | undefined`  
**Default**: `undefined`  
**Environment Variable**: `NUXT_I18N_APP_BASE_SERVER_HOST`

```typescript
apiBaseServerHost: 'https://internal-cdn.example.com'
```

When `apiBaseServerHost` is set, server-side translations will be fetched from `{apiBaseServerHost}/{apiBaseUrl}/{routeName}/{locale}/data.json` (e.g., `https://internal-cdn.example.com/_locales/index/en/data.json`).

::: tip
Use `apiBaseUrl` for path prefixes, `apiBaseClientHost` for client-side CDN/external domain hosting, and `apiBaseServerHost` for server-side CDN/external domain hosting. This allows you to use different CDNs for client and server requests.
:::

#### `translationPayloads`

Controls how translation payload files are emitted during build and loaded at runtime.

**Type**:

```typescript
{
  mode?: 'premerged' | 'source'
  serverAssets?: boolean
  serverHandler?: boolean
  publicAssets?: boolean
  prerenderRoutes?: boolean
  publicDir?: string
  warnFileCount?: number
  warnSizeBytes?: number
}
```

**Default** (`mode: 'premerged'`):

```typescript
{
  mode: 'premerged',
  serverAssets: true,
  serverHandler: true,
  publicAssets: true,
  prerenderRoutes: true
}
```

The defaults preserve the all-in-one behavior: translations are registered as Nitro server assets, the local `/{apiBaseUrl}/:page/:locale/data.json` handler is registered, data routes are added to prerender output, and the merged files are copied to Nitro public assets during production builds.

For serverless deployments with large locale sets, prefer compact runtime loading:

```typescript
i18n: {
  translationPayloads: {
    mode: 'source',
  },
}
```

`mode: 'source'` keeps layer-merged source files in Nitro server assets and merges root/page/fallback translations at runtime through the built-in `/_locales` route. By default it disables public asset copies and prerendered payload routes, which is usually what you want on Cloudflare Workers.

::: warning Static hosting / pure SSG
With `mode: 'source'`, `publicAssets` and `prerenderRoutes` default to `false`. Pure static hosting without a Nitro/edge runtime therefore cannot load translations on the client unless you enable one of these outputs, keep `serverHandler` available at runtime, or host payloads externally.
:::

::: warning External CDN hosts
When `apiBaseServerHost` or `apiBaseClientHost` is set, the module fetches already merged JSON from that origin. External hosts must serve the same `/{apiBaseUrl}/:page/:locale/data.json` responses as the built-in route. `mode: 'source'` applies only to locally bundled Nitro assets, not to an external CDN unless that CDN also serves runtime-merged payloads.
:::

You can also disable duplicated local outputs manually and serve translation payloads from a CDN or object storage:

```typescript
i18n: {
  apiBaseClientHost: 'https://cdn.example.com',
  apiBaseServerHost: 'https://cdn.example.com',
  translationPayloads: {
    serverAssets: false,
    serverHandler: false,
    publicAssets: false,
    prerenderRoutes: false
  }
}
```

If you only want to avoid writing payloads into public output while keeping the built-in server route for SSR/runtime requests, disable both public outputs:

```typescript
i18n: {
  translationPayloads: {
    publicAssets: false,
    prerenderRoutes: false
  }
}
```

Use `publicDir` to change the public output folder when `publicAssets` is enabled. It defaults to `translationDir`. `publicAssets` controls the direct merged-directory copy, while `prerenderRoutes` controls generated `/{apiBaseUrl}/.../data.json` files such as `/_locales/index/en/data.json`.

If you disable all local payload outputs, you must configure both `apiBaseServerHost` (SSR) and `apiBaseClientHost` (client navigation). Otherwise translations will resolve to empty objects and UI keys may appear untranslated.

`warnFileCount` and `warnSizeBytes` control build-time warnings when pre-merged payload output grows large (defaults: 500 files and 10 MB).

### 🔒 Proxy & Security

#### `metaTrustForwardedHost`

Trust the `X-Forwarded-Host` header when resolving the base URL for meta tags. Enable when the app runs behind a reverse proxy (nginx, Cloudflare, AWS ALB, etc.) that sets this header to the real client-facing hostname.

**Type**: `boolean`  
**Default**: `true`

```typescript
metaTrustForwardedHost: false // Ignore X-Forwarded-Host header
```

#### `metaTrustForwardedProto`

Trust the `X-Forwarded-Proto` header when resolving the protocol for meta tags. Enable when the app runs behind a TLS-terminating proxy so that canonical URLs use `https://` even though the app itself listens on HTTP.

**Type**: `boolean`  
**Default**: `true`

```typescript
metaTrustForwardedProto: false // Ignore X-Forwarded-Proto header
```

### 🔄 Additional Features

#### `noPrefixRedirect`

When using `no_prefix` strategy, controls whether paths that start with a locale segment (e.g. `/en/about`) are automatically redirected to the unprefixed version (`/about`).

**Type**: `boolean`  
**Default**: `false`

```typescript
noPrefixRedirect: true // Enable stripping locale prefix in no_prefix strategy
```

#### `excludePatterns`

URL patterns (strings or RegExp) to exclude from i18n processing entirely. Matching routes won't get locale prefixes, redirects, or translation loading. Internal Nuxt paths (`/__nuxt_error`, etc.) are always excluded automatically.

**Type**: `(string | RegExp)[]`  
**Default**: `undefined`

```typescript
excludePatterns: ['/api', '/admin', /^\/internal\/.*/]
```

#### `localizedRouteNamePrefix`

Prefix prepended to localized route names (e.g. `localized-index`). Used internally to distinguish original routes from generated locale variants. You rarely need to change this.

**Type**: `string`  
**Default**: `'localized-'`

```typescript
localizedRouteNamePrefix: 'i18n-' // Custom prefix for localized route names
```

#### `dateBuild`

Value used for cache-busting translation fetch requests (`?v=...`).

By default the module fingerprints your translation sources (SHA-256 over every
`<layer>/<translationDir>/**/*.json`, in layer order) and uses that. The value only changes when a
translation actually changes, so rebuilding or redeploying untouched translations leaves browser and
CDN caches intact — with `httpCacheDuration` set to a year, a build timestamp would instead force
every client to re-download the whole dictionary on each deploy.

It falls back to `Date.now()` only when there are no translation files to hash.

Set it explicitly to take control (e.g. to tie payload URLs to a release rather than to content):

```ts
export default defineNuxtConfig({
  i18n: {
    // Any stable string/number: git SHA, CI build number, release tag, etc.
    dateBuild: process.env.GIT_SHA ?? 'local-dev',
  },
})
```

**Type**: `string | number`  
**Default**: content fingerprint of the translation sources (falls back to `Date.now()` when there is nothing to hash)

#### `httpCacheDuration`

HTTP `Cache-Control` max-age (seconds) for the built-in translation payload route
`/{apiBaseUrl}/:page/:locale/data.json`.

Because fetches already append `?v={dateBuild}`, responses are safe to cache aggressively:

```http
Cache-Control: public, max-age=31536000, immutable
```

```ts
export default defineNuxtConfig({
  i18n: {
    // Per-build fallback (Date.now()) so immutable payloads never go stale when GIT_SHA is missing.
    dateBuild: process.env.GIT_SHA ?? String(Date.now()),
    httpCacheDuration: 86400, // 24 hours
    // httpCacheDuration: 0, // disable Cache-Control header
  },
})
```

**Type**: `number`  
**Default**: `31536000` (1 year)

- `0` — do not set `Cache-Control`
- Not applied in development (`import.meta.dev`) so browser cache does not fight HMR
- Analog of `@nuxtjs/i18n` v10.2.0 `experimental.httpCacheDuration`, as an explicit response header

#### `numberFormats`

Named number formats per locale (Vue I18n-compatible). Enables `$tn(1000, 'currency')`.

**Type**: `Record<string, Record<string, Intl.NumberFormatOptions>>`  
**Default**: `{}`

```ts
export default defineNuxtConfig({
  i18n: {
    numberFormats: {
      en: {
        currency: { style: 'currency', currency: 'USD', notation: 'standard' },
        decimal: { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 },
        percent: { style: 'percent', useGrouping: false },
      },
      de: {
        currency: { style: 'currency', currency: 'EUR' },
      },
    },
  },
})
```

```ts
$tn(10000, 'currency') // $10,000.00
$tn(10000, 'currency', 'de') // 10.000,00 €
$tn(10000, 'currency', { notation: 'compact' })
```

Keys should match locale `code` values. If an exact locale key is missing, the language subtag is tried (`en-US` → `en`).

#### `datetimeFormats`

Named datetime formats per locale (Vue I18n-compatible). Enables `$td(date, 'short')`.

**Type**: `Record<string, Record<string, Intl.DateTimeFormatOptions>>`  
**Default**: `{}`

```ts
export default defineNuxtConfig({
  i18n: {
    datetimeFormats: {
      en: {
        short: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
      },
      ja: {
        short: { year: 'numeric', month: 'short', day: 'numeric' },
      },
    },
  },
})
```

```ts
$td(new Date(), 'short')
$td(new Date(), 'long', 'en')
```

`Intl.NumberFormat` / `DateTimeFormat` / `RelativeTimeFormat` instances are cached inside `FormatService` by locale + options key.

#### `hmr`

Enables server-side HMR for translations during development. When enabled, the module watches your translation files and invalidates the in-memory server cache for changed locales/pages so that requests immediately get fresh data without restarting the server.

**Type**: `boolean`  
**Default**: `true` (development only)

```typescript
export default defineNuxtConfig({
  i18n: {
    // Hot updates for translation files in dev mode
    hmr: true,
  },
})
```

#### `cacheMaxSize`

Controls the maximum number of entries in the translation cache. When the limit is reached, the **least recently used** entry is evicted (LRU policy). Set to `0` (default) for unlimited cache.

**Type**: `number`  
**Default**: `0` (unlimited)

#### `cacheTtl`

Time-to-live for server cache entries **in seconds**. When a cached entry is accessed, its expiry is **refreshed** (sliding expiration). Expired entries are evicted on the next cache write. Set to `0` (default) for entries that never expire.

**Type**: `number`  
**Default**: `0` (no expiration)

```typescript
export default defineNuxtConfig({
  i18n: {
    // Limit cache to 1000 entries, each lives 10 minutes (refreshed on access)
    cacheMaxSize: 1000,
    cacheTtl: 600,
  },
})
```

::: tip When to use
For most projects the default (unlimited, no expiration) is fine — translations are small and finite. However, if your project has **thousands of pages** with `disablePageLocales: false` and **many locales**, the server cache can grow significantly. In long-running Node.js servers this may lead to excessive memory usage.

- **`cacheMaxSize`** — caps the number of cached entries. Useful for bounding memory.
- **`cacheTtl`** — ensures stale translations are eventually reloaded from storage. Useful for serverless environments or when translations change at runtime.

**Formula for estimating max entries**: `number_of_locales × (number_of_pages + 1)`. For example, 10 locales × 500 pages = ~5010 entries.
:::
