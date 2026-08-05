---
url: 'https://s00d.github.io/nuxt-i18n-micro/guide/configuration.md'
description: 'All nuxt-i18n-micro module options, defaults, and examples.'
---

# Configuration Reference

Complete reference for every option under the `i18n` key in `nuxt.config`. Types and defaults match [`ModuleOptions`](https://github.com/s00d/nuxt-i18n-micro/blob/main/packages/types/src/index.ts) in `@i18n-micro/types`.

## Quick reference

Every option the module accepts, from the `ModuleOptions` type. The sections below explain
The sections below explain how they work together; the
[Module Options reference](/api/module-options) has the full descriptions.

| Option | Type | Default | Purpose |
| --- | --- | --- | --- |
| [`locales`](/api/module-options) | `Locale[]` | `[]` | List of supported locales. |
| [`meta`](/api/module-options) | `boolean` | `true` | Generate SEO meta tags (`hreflang`, `canonical`, `og:url`, `og:locale`) automatically. |
| [`strategy`](/api/module-options) | `Strategies` | `'prefix_except_default'` | URL routing strategy for locale prefixes. - `'no_prefix'` — no locale in URL; locale stored in cookie. - `'prefix_except_default'` — prefix all locales except the default. - `'prefix'` — always prefix, including the default locale. - `'prefix_and_default'` — like `prefix`, but the default locale is also accessible without prefix. |
| [`metaBaseUrl`](/api/module-options) | `string` | `undefined` | Base URL for SEO meta tags (canonical, og:url, hreflang). - A concrete URL string (e.g. `'https://example.com'`) — used as-is (highest priority). - `undefined` — falls back to `site.url` from `nuxt-site-config` when that module is   present, otherwise the current request origin   (`useRequestURL().origin` on server, `window.location.origin` on client). |
| [`metaTrustForwardedHost`](/api/module-options) | `boolean` | `true` | Trust the `X-Forwarded-Host` header when resolving the base URL for meta tags. |
| [`metaTrustForwardedProto`](/api/module-options) | `boolean` | `true` | Trust the `X-Forwarded-Proto` header when resolving the protocol for meta tags. |
| [`hreflangBaseLanguage`](/api/module-options) | `boolean` | `false` | Also emit a bare-language `hreflang` derived from each locale's `iso` (e.g. `es-ES` → also `es`). |
| [`define`](/api/module-options) | `boolean` | `true` | Register the `defineI18nRoute()` macro plugin, enabling per-page `defineI18nRoute()` calls. |
| [`redirects`](/api/module-options) | `boolean` | `true` | Enable automatic locale-based redirects. |
| [`plugin`](/api/module-options) | `boolean` | `true` | Register the core i18n plugin that provides `$t()`, `$tc()`, `$getLocale()`, `$switchLocale()`, and other runtime helpers. |
| [`hooks`](/api/module-options) | `boolean` | `true` | Register the i18n hooks plugin that provides `i18n:register` and `i18n:beforeLocaleSwitch` / `i18n:afterLocaleSwitch` app-level hooks. |
| [`components`](/api/module-options) | `boolean` | `true` | Register built-in i18n components (`<i18n-link>`, `<i18n-switcher>`, `<i18n-t>`, `<i18n-group>`). |
| [`serverTranslationPreload`](/api/module-options) | `boolean` | `false` | Preload index-page translations in Nitro global middleware (server-only, private config). |
| [`defaultLocale`](/api/module-options) | `string` | `'en'` | The locale to use when no locale can be determined from URL or user preferences. |
| [`apiBaseUrl`](/api/module-options) | `string` | `'_locales'` | Base URL path segment for the translations API route (used in SSR/SSG data fetching). |
| [`apiBaseClientHost`](/api/module-options) | `string` | `undefined` | Override the host used for client-side translation fetch requests. |
| [`apiBaseServerHost`](/api/module-options) | `string` | `undefined` | Override the host used for server-side translation fetch requests. |
| [`translationDir`](/api/module-options) | `string` | `'locales'` | Path to the directory containing translation JSON files, relative to the project root. |
| [`translationPayloads`](/api/module-options) | `TranslationPayloadOptions` | — | Controls how translation payloads are emitted (Node: `public/<apiBaseUrl>`; Edge: Nitro `serverAssets`). - **Node**: `serverAssets` means local SSR via `readFile` under `public/` (no Rollup `raw:`). - **Edge**: `serverAssets` registers Nitro `serverAssets` (`assets:i18n`); it does not force a public copy. |
| [`translationPayloads.mode`](/api/module-options) | `'premerged' \| 'source'` | `'premerged'` | Translation payload strategy. - `premerged`: build-time `{page}/{locale}/data.json` matrix (default) - `source`: compact source files merged at runtime (prefer on Edge / large catalogs) |
| [`translationPayloads.serverAssets`](/api/module-options) | `boolean` | `true` | Local SSR payloads: Node reads `public/<apiBaseUrl>` (forces public copy); Edge embeds via Nitro `serverAssets`. - **Node**: no Nitro `serverAssets` (avoids Rollup `raw:`). |
| [`translationPayloads.serverHandler`](/api/module-options) | `boolean` | `true` | Register the built-in server route at `/{apiBaseUrl}/:page/:locale/data.json`. |
| [`translationPayloads.publicAssets`](/api/module-options) | `boolean` | `true in premerged mode, false in source mode` | Copy payloads into Nitro public output. |
| [`translationPayloads.prerenderRoutes`](/api/module-options) | `boolean` | `false` | Opt in to Nitro-prerender `/{apiBaseUrl}/.../data.json`. |
| [`translationPayloads.publicDir`](/api/module-options) | `string` | — | Public output folder relative to Nitro public root. |
| [`translationPayloads.warnFileCount`](/api/module-options) | `number` | `500` | Warn during build when generated payload file count exceeds this threshold. |
| [`translationPayloads.warnSizeBytes`](/api/module-options) | `number` | `10485760 (10 MB)` | Warn during build when generated payload total size exceeds this threshold in bytes. |
| [`autoDetectLanguage`](/api/module-options) | `boolean` | `true` | Automatically detect the user's preferred language from the `Accept-Language` HTTP header. |
| [`autoDetectPath`](/api/module-options) | `string` | `'/'` | Where cookie / Accept-Language preference redirects may run (when `redirects` is enabled). - `'/'` — only `/` (deep links in the default locale stay reachable; default) - `'no_prefix'` — only paths without a locale prefix - `'*'` — every path, including rewriting an explicit locale prefix   (e.g. `/fr/about` → `/de/about` when the cookie prefers `de`) - any other string — exact path match (e.g. `'/welcome'`) Prefixed strategy cleanup (e.g. `/en` → `/` under `prefix_except_default`) is not gated. |
| [`disableWatcher`](/api/module-options) | `boolean` | `false` | Disable the file watcher that auto-creates missing translation files in development mode. |
| [`types`](/api/module-options) | `boolean` | `true` | Generate TypeScript type declarations for `useI18n`, `$t`, and related helpers based on the translation keys in your default locale files. |
| [`routesLocaleLinks`](/api/module-options) | `{ [key: string]: string }` | `{}` | Map route names to other route names to share the same translation files. |
| [`plural`](/api/module-options) | `PluralFunc` | `built-in pluralization (form index by count)` | Custom pluralization function. |
| [`disablePageLocales`](/api/module-options) | `boolean` | `false` | Disable per-page translation files. |
| [`fallbackLocale`](/api/module-options) | `string` | `undefined (no fallback; returns the raw key)` | Global fallback locale code. |
| [`localeCookie`](/api/module-options) | `string \| null` | `null` | Cookie name for persisting the user's locale preference across sessions. |
| [`debug`](/api/module-options) | `boolean` | `false` | Enable verbose debug logging for locale detection, route generation, and translation loading. |
| [`vueDevtools`](/api/module-options) | `boolean` | `true` | Register Vue DevTools inspector and timeline in dev (browser extension). |
| [`globalLocaleRoutes`](/api/module-options) | `GlobalLocaleRoutes` | `{}` | Global route-level locale configuration. |
| [`customRegexMatcher`](/api/module-options) | `string \| RegExp` | `undefined (uses built-in pattern based on locale codes)` | Custom regular expression (or its string source) for matching locale codes in URL segments. |
| [`noPrefixRedirect`](/api/module-options) | `boolean` | `false` | For `no_prefix` strategy: enable redirect from a locale-prefixed URL (e.g. `/en/about`) to the unprefixed version (`/about`). |
| [`canonicalQueryWhitelist`](/api/module-options) | `string[]` | `['page', 'sort', 'filter', 'search', 'q', 'query', 'tag']` | List of query parameter names preserved in canonical and `og:url` meta tags. |
| [`excludePatterns`](/api/module-options) | `(string \| RegExp)[]` | `undefined` | URL patterns (strings or RegExp) to exclude from i18n processing entirely. |
| [`localizedRouteNamePrefix`](/api/module-options) | `string` | `'localized-'` | Prefix prepended to localized route names (e.g. `'localized-index'`). |
| [`routeLocales`](/api/module-options) | `Record<string, string[]>` | — | Per-route locale restrictions, extracted from `defineI18nRoute()` calls. |
| [`routeDisableMeta`](/api/module-options) | `Record<string, boolean \| string[]>` | — | Per-route meta tag disabling, extracted from `defineI18nRoute()` calls. |
| [`missingWarn`](/api/module-options) | `boolean` | `true` | Show console warnings when a translation key is missing. |
| [`hmr`](/api/module-options) | `boolean` | `true` | Enable Hot Module Replacement for translation files in development. |
| [`cacheMaxSize`](/api/module-options) | `number` | `0` | Maximum number of entries in the in-memory translation cache. |
| [`cacheTtl`](/api/module-options) | `number` | `0` | Time-to-live (in seconds) for cached translation entries. |
| [`numberFormats`](/api/module-options) | `Record<string, Record<string, Intl.NumberFormatOptions>>` | — | Named number formats per locale (Vue I18n-compatible). |
| [`datetimeFormats`](/api/module-options) | `Record<string, Record<string, Intl.DateTimeFormatOptions>>` | — | Named datetime formats per locale (Vue I18n-compatible `datetimeFormats`). |
| [`httpCacheDuration`](/api/module-options) | `number` | `31536000` | HTTP `Cache-Control` max-age (seconds) for `/{apiBaseUrl}/:page/:locale/data.json`. |
| [`dateBuild`](/api/module-options) | `string \| number` | — | Value used for cache-busting translation requests (`?v=...`). |
| [`experimental`](/api/module-options) | `Record<string, unknown>` | — | Bucket for experimental/unstable options. |

# Option details

The module provides extensive configuration options to customize your internationalization setup.

### 🌍 Core Locale Settings

#### `locales`

**Type** `Locale[]` · **Default** `[]`

List of supported locales.
Each entry defines a locale code plus optional metadata (ISO, direction, display name, etc.).

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

**Type** `string` · **Default** `'en'`

The locale to use when no locale can be determined from URL or user preferences.
Also used as the fallback locale for missing translations when `fallbackLocale` is not set.

```typescript
defaultLocale: 'en'
```

#### `strategy`

**Type** `Strategies` · **Default** `'prefix_except_default'`

URL routing strategy for locale prefixes.

* `'no_prefix'` — no locale in URL; locale stored in cookie.
* `'prefix_except_default'` — prefix all locales except the default.
* `'prefix'` — always prefix, including the default locale.
* `'prefix_and_default'` — like `prefix`, but the default locale is also accessible without prefix.

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

**Type** `string` · **Default** `'locales'`

Path to the directory containing translation JSON files, relative to the project root.

```typescript
translationDir: 'i18n' // Custom directory
// Nuxt 4 colocation example:
// translationDir: 'app/locales'
```

Paths are resolved from the Nuxt **project root** (`rootDir`), not from `app/`. With Nuxt 4, the usual setup is `app/pages/` for routes and `locales/` (or `app/locales` if you set `translationDir`) for JSON files.

#### `disablePageLocales`

**Type** `boolean` · **Default** `false`

Disable per-page translation files.
When `true`, only global translations (`{locale}.json`) are loaded;
page-specific files (`pages/{page}/{locale}.json`) are not generated or loaded.

When enabled, only root-level translation files are used:

```tree
locales/
├── en.json
├── fr.json
└── ar.json
```

#### `fallbackLocale`

**Type** `string` · **Default** `undefined (no fallback; returns the raw key)`

Global fallback locale code.
When a translation key is missing in the active locale, the module looks it up
in this locale before returning the key itself.

```typescript
fallbackLocale: 'en' // Global fallback
```

#### `types`

**Type** `boolean` · **Default** `true`

Generate TypeScript type declarations for `useI18n`, `$t`, and related helpers
based on the translation keys in your default locale files.

When enabled, the module emits `.nuxt/i18n.d.ts` during build with typed translation keys. Set to `false` if you prefer untyped helpers or use an external generator.

This built-in generator is separate from the optional [`@i18n-micro/types-generator`](/integrations/types-generator) package, which can produce stricter or standalone type files for monorepos and CI.

```typescript
types: false // Disable built-in key typing
```

#### `routeLocales`

**Type** `Record<string, string[]>` · **Default** —

Per-route locale restrictions, extracted from `defineI18nRoute()` calls.
Maps a route path (e.g. `'/about'`) to an array of allowed locale codes.
Routes not listed have no restrictions (all locales allowed).

Maps a route path (e.g. `'/about'`) to allowed locale codes. Routes not listed allow all configured locales.

You normally configure this via [`defineI18nRoute`](/guide/custom-locale-routes) in pages rather than in `nuxt.config`. The module merges page-level declarations into this map at build time.

#### `routeDisableMeta`

**Type** `Record<string, boolean \| string[]>` · **Default** —

Per-route meta tag disabling, extracted from `defineI18nRoute()` calls.
Maps a route path to `true` (disable all meta) or an array of locale codes
for which meta should be disabled.

* `true` — disable all SEO meta for the route
* `string[]` — disable meta only for listed locale codes

Like `routeLocales`, this is typically set in page components, not manually in config.

#### `experimental`

**Type** `Record<string, unknown>` · **Default** —

Bucket for experimental/unstable options.
Contents may change or be removed without notice between minor versions.

Most former `experimental.*` flags were promoted to top-level options in v3 (for example `hmr`). Prefer documented top-level options. Use `experimental` only when following a release note or migration guide that references a specific key.

### 🔍 SEO & Meta Tags

#### `meta`

**Type** `boolean` · **Default** `true`

Generate SEO meta tags (`hreflang`, `canonical`, `og:url`, `og:locale`) automatically.

```typescript
meta: true // Generate alternate links, canonical URLs, etc.
```

#### `metaBaseUrl`

**Type** `string` · **Default** `undefined`

Base URL for SEO meta tags (canonical, og:url, hreflang).

* A concrete URL string (e.g. `'https://example.com'`) — used as-is (highest priority).
* `undefined` — falls back to `site.url` from `nuxt-site-config` when that module is
  present, otherwise the current request origin
  (`useRequestURL().origin` on server, `window.location.origin` on client).

Priority when unset: `site.url` from `nuxt-site-config` (if installed) → request origin
(`useRequestURL().origin` on the server with `X-Forwarded-Host` / `X-Forwarded-Proto`,
`window.location.origin` on the client). Ideal for **SEO stacks** that already set `site.url`,
and for **multi-domain** deployments when `site.url` is omitted.

* Any other string — used as a static base URL (wins over `site.url`).

```typescript
// Prefer sharing the SEO stack origin — omit metaBaseUrl when site.url is set
site: { url: 'https://example.com' }

// Or pin an explicit override
metaBaseUrl: 'https://example.com'
```

#### `canonicalQueryWhitelist`

**Type** `string[]` · **Default** `['page', 'sort', 'filter', 'search', 'q', 'query', 'tag']`

List of query parameter names preserved in canonical and `og:url` meta tags.
Parameters not in this list are stripped from the canonical URL.

```typescript
canonicalQueryWhitelist: ['page', 'sort', 'category']
```

### 🔄 Advanced Features

#### `globalLocaleRoutes`

**Type** `GlobalLocaleRoutes` · **Default** `{}`

Global route-level locale configuration.
Allows restricting or customizing locale routes for specific pages without
modifying their components.

* `false` — exclude the route from localization.
* `Record<LocaleCode, string>` — custom per-locale paths.

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

::: tip Programmatic routes
For routes added in `pages:extend` (especially many sharing one wrapper SFC), build both `pages` and `globalLocaleRoutes` from one list with [`splitLocaleRoutes`](/guide/custom-locale-routes#programmatic-routes-pagesextend--244) — keyed by route **name**, not file path.
:::

#### `routesLocaleLinks`

**Type** `{ [key: string]: string }` · **Default** `{}`

Map route names to other route names to share the same translation files.
For example, `{ 'about-us': 'about' }` means the `about-us` page will use
translations from the `about` page instead of its own.

```typescript
routesLocaleLinks: {
  'products-id': 'products',
  'about-us': 'about'
}
```

#### `customRegexMatcher`

**Type** `string \| RegExp` · **Default** `undefined (uses built-in pattern based on locale codes)`

Custom regular expression (or its string source) for matching locale codes in URL segments.
All locale codes defined in `locales` must match this pattern, or a warning is emitted.

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

**Type** `boolean` · **Default** `false`

Enable verbose debug logging for locale detection, route generation, and translation loading.

```typescript
debug: true
```

#### `disableWatcher`

**Type** `boolean` · **Default** `false`

Disable the file watcher that auto-creates missing translation files in development mode.

```typescript
disableWatcher: true
```

#### `missingWarn`

**Type** `boolean` · **Default** `true`

Show console warnings when a translation key is missing.

```typescript
missingWarn: false // Disable warnings for missing translations
```

::: tip Custom Missing Handler

You can set a custom handler for missing translations using `setMissingHandler` method. This allows you to send missing translation errors to error tracking services like Sentry.

:::

### 🔧 Plugin Control

#### `define`

**Type** `boolean` · **Default** `true`

Register the `defineI18nRoute()` macro plugin, enabling per-page `defineI18nRoute()` calls.

```typescript
define: false // Disables $defineI18nRoute
```

#### `redirects`

**Type** `boolean` · **Default** `true`

Enable automatic locale-based redirects.
When `true`, visitors are redirected to their preferred locale (detected from cookie,
`Accept-Language` header, or the default) on the first visit.

When `false`, redirect logic is disabled on both environments:

* **Server**: `06.redirect.ts` (server-only) remains registered for 404 checks and cookie synchronization, but does not issue locale redirects
* **Client**: the `i18n-redirect` global route middleware is not registered — no SPA auto-redirects

```typescript
redirects: false // Disable automatic locale redirection (server 404/cookie sync remain; no client middleware)
```

#### `plugin`

**Type** `boolean` · **Default** `true`

Register the core i18n plugin that provides `$t()`, `$tc()`, `$getLocale()`,
`$switchLocale()`, and other runtime helpers.

```typescript
plugin: false
```

#### `hooks`

**Type** `boolean` · **Default** `true`

Register the i18n hooks plugin that provides `i18n:register` and `i18n:beforeLocaleSwitch`
/ `i18n:afterLocaleSwitch` app-level hooks.

```typescript
hooks: false // Disable automatic i18n:register calls
```

See [Events — `i18n:register`](/api/events#-i18n-register) for hook timing and plugin examples.

#### `components`

**Type** `boolean` · **Default** `true`

Register built-in i18n components (`<i18n-link>`, `<i18n-switcher>`, `<i18n-t>`, `<i18n-group>`).
Set to `false` to disable automatic component registration (e.g. if you don't use them
and want to reduce the module footprint).

```typescript
components: false // Disable built-in i18n components
```

### 🌐 Language Detection

#### `autoDetectLanguage`

**Type** `boolean` · **Default** `true`

Automatically detect the user's preferred language from the `Accept-Language` HTTP header.
Used in combination with `autoDetectPath` to decide when detection occurs.

```typescript
autoDetectLanguage: false
```

#### `autoDetectPath`

**Type** `string` · **Default** `'/'`

Where cookie / Accept-Language preference redirects may run (when `redirects` is enabled).

* `'/'` — only `/` (deep links in the default locale stay reachable; default)

* `'no_prefix'` — only paths without a locale prefix

* `'*'` — every path, including rewriting an explicit locale prefix
  (e.g. `/fr/about` → `/de/about` when the cookie prefers `de`)

* any other string — exact path match (e.g. `'/welcome'`)

Prefixed strategy cleanup (e.g. `/en` → `/` under `prefix_except_default`) is not gated.

```typescript
autoDetectPath: '/' // Only on home route
autoDetectPath: '*' // On all routes (use with caution)
```

### 🔢 Customization

#### `plural`

**Type** `PluralFunc` · **Default** `built-in pluralization (form index by count)`

Custom pluralization function.
Receives `(key, count, params, locale, getter)` and should return the selected
plural form as a string, or `null`/`undefined` to fall back to the built-in
`defaultPlural` logic (so you can override only some locales).

For the Nuxt module the function is serialized with `.toString()` into
`.nuxt/i18n.plural.mjs` — it must be self-contained (no imports / outer scope).
A file path string is **not** supported.

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

* **Must use `function` keyword** — NOT shorthand method syntax, NOT arrow functions with external references
* **No imports or external references** — the function must be fully self-contained (a file path like `plural: '~/i18n/plural.ts'` is **not** supported)
* **No TypeScript-only syntax** that doesn't survive `.toString()` (type annotations are fine in `nuxt.config.ts` because Nuxt strips them)
* Returning `null` / `undefined` falls back to the built-in `defaultPlural` (useful for per-locale overrides)
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

* `$tc('apples', 0)` → `"нет яблок"`
* `$tc('apples', 1)` → `"1 яблоко"`
* `$tc('apples', 3)` → `"3 яблока"`
* `$tc('apples', 5)` → `"5 яблок"`
* `$tc('apples', 21)` → `"21 яблоко"`

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

If different locales need different plural rules, branch on `locale` and return `null`
for locales you do not customize — the built-in `defaultPlural` handles the rest:

```typescript
plural: function (key, count, _params, locale, t) {
  // Only override Slavic locales; en/de/… keep the built-in rules
  if (locale !== 'ru' && locale !== 'uk') return null

  const translation = t(key)
  if (!translation) return null

  const forms = translation.toString().split('|').map(function (s) { return s.trim() })
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
```

::: warning No module-path `plural`
`plural: '~/i18n/plural.ts'` (or any string path) is **not** supported. The Nuxt module
serializes the function with `.toString()` into a virtual file; external imports and
helpers from another module are stripped and will be `undefined` at runtime. Keep the
function fully inlined in `nuxt.config.ts` (see the danger note above).
:::

#### `localeCookie`

**Type** `string \| null` · **Default** `null`

Cookie name for persisting the user's locale preference across sessions.
Set to `null` to disable cookie-based persistence.
Automatically set to `'user-locale'` for the `no_prefix` strategy if not provided.

::: warning Effective default depends on strategy
While the configured default is `null` (disabled), the module **automatically overrides** this to `'user-locale'` when using `strategy: 'no_prefix'`. This means:

* **`no_prefix`**: Cookie is **always enabled** (`'user-locale'`), even if you don't set it explicitly. This is required because the URL contains no locale information.
* **All other strategies**: Cookie is `null` (disabled) unless you set it explicitly.

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

* Persists user's locale preference across page reloads
* Remembers locale when user returns to your site
* Required for `no_prefix` strategy to work correctly
* **Required** for redirect behavior in prefix strategies (when `redirects: true`)

#### `apiBaseUrl`

**Type** `string` · **Default** `'_locales'`

Base URL path segment for the translations API route (used in SSR/SSG data fetching).
Can also be set via `NUXT_I18N_APP_BASE_URL` environment variable.

**Environment Variable**: `NUXT_I18N_APP_BASE_URL`

```typescript
apiBaseUrl: 'api/_locales'
```

The translations will be fetched from `/{apiBaseUrl}/{routeName}/{locale}/data.json` (e.g., `/api/_locales/index/en/data.json`).

#### `apiBaseClientHost`

**Type** `string` · **Default** `undefined`

Override the host used for client-side translation fetch requests.
Useful when the client reaches the server via a different hostname than the one Nuxt sees.
Can also be set via `NUXT_I18N_APP_BASE_CLIENT_HOST` environment variable.

**Environment Variable**: `NUXT_I18N_APP_BASE_CLIENT_HOST`

```typescript
apiBaseClientHost: 'https://cdn.example.com'
```

When `apiBaseClientHost` is set, client-side translations will be fetched from `{apiBaseClientHost}/{apiBaseUrl}/{routeName}/{locale}/data.json` (e.g., `https://cdn.example.com/_locales/index/en/data.json`).

#### `apiBaseServerHost`

**Type** `string` · **Default** `undefined`

Override the host used for server-side translation fetch requests.
Useful in container/microservice setups where the server reaches itself via an internal hostname.
Can also be set via `NUXT_I18N_APP_BASE_SERVER_HOST` environment variable.

**Environment Variable**: `NUXT_I18N_APP_BASE_SERVER_HOST`

```typescript
apiBaseServerHost: 'https://internal-cdn.example.com'
```

When `apiBaseServerHost` is set, server-side translations will be fetched from `{apiBaseServerHost}/{apiBaseUrl}/{routeName}/{locale}/data.json` (e.g., `https://internal-cdn.example.com/_locales/index/en/data.json`).

::: tip
Use `apiBaseUrl` for path prefixes, `apiBaseClientHost` for client-side CDN/external domain hosting, and `apiBaseServerHost` for server-side CDN/external domain hosting. This allows you to use different CDNs for client and server requests.
:::

#### `translationPayloads`

**Type** `TranslationPayloadOptions` · **Default** —

Controls how translation payloads are emitted (Node: `public/<apiBaseUrl>`; Edge: Nitro `serverAssets`).

* **Node**: `serverAssets` means local SSR via `readFile` under `public/` (no Rollup `raw:`).
* **Edge**: `serverAssets` registers Nitro `serverAssets` (`assets:i18n`); it does not force a public copy.

Keep the defaults for the usual all-in-one setup. For large Edge catalogs prefer `mode: 'source'`.
For CDN-backed deployments, disable local outputs and set `apiBaseClientHost` / `apiBaseServerHost`.

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
  prerenderRoutes: false
}
```

SSR on **Node** reads the same tree copied to `public/<apiBaseUrl>/` (`readFile`). On **Edge**, Nitro `serverAssets` embeds it (no forced public copy — set `publicAssets: true` for CDN). `mode: 'premerged'` → `{page}/{locale}/data.json` per page/locale; `mode: 'source'` → compact source + runtime merge.

`serverAssets: true` on **Node** forces the public copy even if `publicAssets` is false. On **Edge** it only registers the Nitro embed. Prefer `mode: 'source'` on Edge for large catalogs. Without local payloads and without `apiBaseServerHost`, the build fails.

The local `/{apiBaseUrl}/:page/:locale/data.json` handler, prerender routes, and public asset copies remain optional outputs.

For compact **public** / Edge payloads:

```typescript
i18n: {
  translationPayloads: {
    mode: 'source',
  },
}
```

`mode: 'source'` keeps layer files compact and merges root/page/fallback at runtime through the built-in `/_locales` route (or Edge `assets:i18n`). By default it disables public asset copies and prerendered payload routes.

::: warning Static hosting / pure SSG
With `mode: 'source'`, `publicAssets` defaults to `false` (`prerenderRoutes` is always off unless you opt in). Pure static hosting without a Nitro/edge runtime therefore cannot load translations on the client unless you enable one of these outputs, keep `serverHandler` available at runtime, or host payloads externally.

With default `mode: 'premerged'` and `publicAssets: true`, static files already land at `public/<apiBaseUrl>/{page}/{locale}/data.json` — matching client `$fetch` URLs — so a static host can serve them without Nitro.
:::

::: warning External CDN hosts
When `apiBaseServerHost` or `apiBaseClientHost` is set, the module fetches already merged JSON from that origin. External hosts must serve the same `/{apiBaseUrl}/:page/:locale/data.json` responses as the built-in route. `mode: 'source'` applies to local payload dirs, not to an external CDN unless that CDN also serves runtime-merged payloads.
:::

You can also disable duplicated local outputs manually and serve translation payloads from a CDN or object storage:

```typescript
i18n: {
  apiBaseClientHost: 'https://cdn.example.com',
  apiBaseServerHost: 'https://cdn.example.com',
  translationPayloads: {
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

On **Node**, `serverAssets: true` still forces a public copy for SSR even when `publicAssets` is false — set `serverAssets: false` and `apiBaseServerHost` if you want zero local payload files.

Use `publicDir` to change the public output folder when payloads are copied. It defaults to `apiBaseUrl` (`_locales`). In premerged mode `publicAssets` writes `{page}/{locale}/data.json` there (same paths the client fetches). `prerenderRoutes` is an optional Nitro prerender of the handler routes — usually redundant when that tree was already copied.

If you disable all local payload outputs, you must configure both `apiBaseServerHost` (SSR) and `apiBaseClientHost` (client navigation). Otherwise translations will resolve to empty objects and UI keys may appear untranslated.

`warnFileCount` and `warnSizeBytes` control build-time warnings when pre-merged payload output grows large (defaults: 500 files and 10 MB).

### 🔒 Proxy & Security

#### `metaTrustForwardedHost`

**Type** `boolean` · **Default** `true`

Trust the `X-Forwarded-Host` header when resolving the base URL for meta tags.
Enable when the app runs behind a reverse proxy (nginx, Cloudflare, AWS ALB, etc.)
that sets this header to the real client-facing hostname.

```typescript
metaTrustForwardedHost: false // Ignore X-Forwarded-Host header
```

#### `metaTrustForwardedProto`

**Type** `boolean` · **Default** `true`

Trust the `X-Forwarded-Proto` header when resolving the protocol for meta tags.
Enable when the app runs behind a TLS-terminating proxy so that
canonical URLs use `https://` even though the app itself listens on HTTP.

```typescript
metaTrustForwardedProto: false // Ignore X-Forwarded-Proto header
```

#### `hreflangBaseLanguage`

**Type** `boolean` · **Default** `false`

Also emit a bare-language `hreflang` derived from each locale's `iso`
(e.g. `es-ES` → also `es`). The first regional locale in `locales` claims
the bare tag for that language. Routing `code` is never used — only `iso || code`.

```typescript
hreflangBaseLanguage: true
```

### 🔄 Additional Features

#### `noPrefixRedirect`

**Type** `boolean` · **Default** `false`

For `no_prefix` strategy: enable redirect from a locale-prefixed URL
(e.g. `/en/about`) to the unprefixed version (`/about`).

```typescript
noPrefixRedirect: true // Enable stripping locale prefix in no_prefix strategy
```

#### `excludePatterns`

**Type** `(string \| RegExp)[]` · **Default** `undefined`

URL patterns (strings or RegExp) to exclude from i18n processing entirely.
Matching routes won't get locale prefixes, redirects, or translation loading.
Internal Nuxt paths (`/__nuxt_error`, etc.) are always excluded automatically.

```typescript
excludePatterns: ['/api', '/admin', /^\/internal\/.*/]
```

#### `localizedRouteNamePrefix`

**Type** `string` · **Default** `'localized-'`

Prefix prepended to localized route names (e.g. `'localized-index'`).
Used internally to distinguish original routes from generated locale variants.

```typescript
localizedRouteNamePrefix: 'i18n-' // Custom prefix for localized route names
```

#### `dateBuild`

**Type** `string \| number` · **Default** —

Value used for cache-busting translation requests (`?v=...`).

When not provided, the module falls back to `Date.now()` (non-deterministic).
For reproducible/rolling deployments, set this to a stable value
(e.g. a git SHA or build number).

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

#### `httpCacheDuration`

**Type** `number` · **Default** `31536000`

HTTP `Cache-Control` max-age (seconds) for `/{apiBaseUrl}/:page/:locale/data.json`.

Applies in full only while `dateBuild` busts the URL (`?v=...`), which is the default:
the response is then `public, max-age=…, immutable` and safe for browsers and CDNs.

* `dateBuild: 0`/`''` — the URL is stable, so this duration is *not* honoured; the
  response becomes `public, max-age=0, must-revalidate` instead. A long `max-age` on an
  unchanging URL pins the first payload a browser ever saw.

* `0` — do not set `Cache-Control` at all (useful in local debugging)

* Not applied in development (`import.meta.dev`) so HMR is not fought by the browser cache

* Reaches only responses served through Nitro. Payloads copied into `public/` and served
  by the hosting platform take that platform's headers — see the Performance guide.

Analogous to `@nuxtjs/i18n` experimental `httpCacheDuration` (v10.2.0), but as an
explicit response header rather than Nitro `defineCachedEventHandler` maxAge.

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

#### `numberFormats`

**Type** `Record<string, Record<string, Intl.NumberFormatOptions>>` · **Default** —

Named number formats per locale (Vue I18n-compatible).
Enables `$tn(1000, 'currency')` style calls.

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

**Type** `Record<string, Record<string, Intl.DateTimeFormatOptions>>` · **Default** —

Named datetime formats per locale (Vue I18n-compatible `datetimeFormats`).
Enables `$td(date, 'short')` style calls.

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

**Type** `boolean` · **Default** `true`

Enable Hot Module Replacement for translation files in development.
When `true`, changes to JSON translation files trigger an automatic reload
without a full page refresh.

```typescript
export default defineNuxtConfig({
  i18n: {
    // Hot updates for translation files in dev mode
    hmr: true,
  },
})
```

#### `cacheMaxSize`

**Type** `number` · **Default** `0`

Maximum number of entries in the in-memory translation cache.
`0` means no limit.

#### `cacheTtl`

**Type** `number` · **Default** `0`

Time-to-live (in seconds) for cached translation entries.
`0` means entries never expire.

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
For most projects the default (unlimited, no expiration) is fine — route names are finite (`product-id`, not `product-123`), so the client chunk Map stays bounded by pages × locales. Set a limit when you have **many locales × many page dictionaries** and long-lived Node or SPA sessions.

`cacheMaxSize` caps:

1. **Fetch / server `CacheControl`** (HTTP payload and server loader caches)
2. **Client chunk Map** (`NuxtI18n.storage.translations`) — oldest (by write order) `(locale, route)` chunks are FIFO-evicted; the just-written and active page keys are preferred. If the limit cannot hold both (e.g. `cacheMaxSize: 1`), the just-written key wins so the bound is enforced — active `$t` still uses the view layer

* **`cacheMaxSize`** — caps entries in those caches. Useful for bounding memory.
* **`cacheTtl`** — expires fetch/server cache entries (not the live view layer). Useful for serverless or runtime-updated translations.

**Formula for estimating max entries**: `number_of_locales × (number_of_pages + 1)`. For example, 10 locales × 500 pages = ~5010 entries.
:::
