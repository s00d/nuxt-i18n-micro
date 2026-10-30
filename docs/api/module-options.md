---
title: 'Module options'
description: 'Every option of the i18n key in nuxt.config, with its type, default and description, generated from the ModuleOptions type.'
outline: [2, 3]
---

# Module options

This page lists every key of the `i18n` object in `nuxt.config`. Use the tables to look up a type or a default, and the details below for examples and caveats. Types, defaults and descriptions are generated from the `ModuleOptions` interface in [`packages/types/src/index.ts`](https://github.com/s00d/nuxt-i18n-micro/blob/main/packages/types/src/index.ts).

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', displayName: 'English' },
      { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
    ],
    defaultLocale: 'en',
  },
})
```

A nested option appears under its dotted path: `translationPayloads.mode` is the `mode` key of `translationPayloads`.

<!-- generated:module-options — do not edit; run `pnpm run docs:generate` -->

## Locales and routing

Which languages exist and how they appear in the URL.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `locales` | `Locale[]` | `[]` | List of supported locales. Each entry defines a locale code plus optional metadata (ISO, direction, display name, etc.). |
| `strategy` | `Strategies` | `'prefix_except_default'` | URL routing strategy for locale prefixes. - `'no_prefix'` — no locale in URL; locale stored in cookie. - `'prefix_except_default'` — prefix all locales except the default. - `'prefix'` — always prefix, including the default locale. - `'prefix_and_default'` — like `prefix`, but the default locale is also accessible without prefix. |
| `defaultLocale` | `string` | `'en'` | The locale to use when no locale can be determined from URL or user preferences. It is not a translation fallback: set `fallbackLocale` for that. |
| `localeCookie` | `string \| null` | `null` | Cookie name for persisting the user's locale preference across sessions. Set to `null` to disable cookie-based persistence. Automatically set to `'user-locale'` for the `no_prefix` strategy if not provided; an explicit `null` in the `i18n` config block keeps it off there too. |
| `globalLocaleRoutes` | `GlobalLocaleRoutes` | `{}` | Global route-level locale configuration. Allows restricting or customizing locale routes for specific pages without modifying their components. - `false` — exclude the route from localization. - `Record<LocaleCode, string>` — custom per-locale paths. |
| `customRegexMatcher` | `string \| RegExp` | `undefined (uses built-in pattern based on locale codes)` | Custom regular expression (or its string source) for matching locale codes in URL segments. Every locale code in `locales` must match this pattern, or the build fails. |
| `noPrefixRedirect` | `boolean` | `false` | For `no_prefix` strategy: when the default locale has a custom path for a page (`localeRoutes` / `globalLocaleRoutes`), redirect the page's original path to it (e.g. `/about` → `/about-us`). Pages with dynamic segments are not redirected. |
| `excludePatterns` | `(string \| RegExp)[]` | `undefined` | Paths to leave out of i18n routing: a string is a path prefix (`/admin` covers `/admin/x`) or a `*` / `?` glob; a RegExp is tested against the path. Matching pages get no locale variants, no locale redirect or 404, and are dropped from prerender; they still render with translations. `/api`, `/_nuxt`, `/__*`, the translations route and common static files (sitemap, robots.txt, favicon, assets by extension) are always excluded. |
| `routeLocales` | `Record<string, string[]>` | — | Per-route locale restrictions, extracted at build time from `$defineI18nRoute()` calls. Maps a route path (e.g. `'/about'`) to an array of allowed locale codes. Routes not listed have no restrictions (all locales allowed). |

## Translations

Where translation files live and how keys are resolved.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `translationDir` | `string` | `'locales'` | Path to the directory containing translation JSON files, relative to the project root. |
| `disableWatcher` | `boolean` | `false` | Disable the file watcher that auto-creates missing translation files in development mode. |
| `routesLocaleLinks` | `{ [key: string]: string }` | `{}` | Map route names to other route names to share the same translation files. For example, `{ 'about-us': 'about' }` means the `about-us` page will use translations from the `about` page instead of its own. |
| `plural` | `PluralFunc` | `built-in pluralization (form index by count)` | Custom pluralization function. Receives `(key, count, params, locale, getter)` and should return the selected plural form as a string, or `null`/`undefined` to fall back to the built-in `defaultPlural` logic (so you can override only some locales). For the Nuxt module the function is serialized with `.toString()` into `.nuxt/i18n.plural.mjs` — it must be self-contained (no imports / outer scope). A file path string is **not** supported. |
| `disablePageLocales` | `boolean` | `false` | Disable per-page translation files. When `true`, only global translations (`{locale}.json`) are loaded; page-specific files (`pages/{page}/{locale}.json`) are not generated or loaded. |
| `fallbackLocale` | `string` | `undefined (no fallback; returns the raw key)` | Global fallback locale code. Keys missing in a locale are taken from this locale (merged into each payload when it is built or loaded); without it a missing key renders as the key itself. |

## Payloads and caching

How translations reach the browser. [Performance](/guide/performance) explains what these change at runtime.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `serverTranslationPreload` | `boolean` | `false` | Preload index-page translations in Nitro global middleware (server-only, private config). |
| `apiBaseUrl` | `string` | `'_locales'` | Base URL path segment for the translations API route (used in SSR/SSG data fetching). Can also be set via `NUXT_I18N_APP_BASE_URL` environment variable. |
| `apiBaseClientHost` | `string` | `undefined` | Override the host used for client-side translation fetch requests. Useful when the client reaches the server via a different hostname than the one Nuxt sees. Can also be set via `NUXT_I18N_APP_BASE_CLIENT_HOST` environment variable. |
| `apiBaseServerHost` | `string` | `undefined` | Override the host used for server-side translation fetch requests. Useful in container/microservice setups where the server reaches itself via an internal hostname. Can also be set via `NUXT_I18N_APP_BASE_SERVER_HOST` environment variable. |
| `translationPayloads` | `TranslationPayloadOptions` | — | Controls how translation payloads are emitted (Node server: `public/<apiBaseUrl>`; Edge / function / inline: Nitro `serverAssets`). - **Node server** (`node-server`, `node-cluster`, disk `serveStatic`): `serverAssets` means local SSR via `readFile` under `public/` (no Rollup `raw:`). - **Edge, function presets, and `serveStatic: "inline"`** (`vercel`, `netlify`, `aws-lambda`, winterjs, …): `serverAssets` registers Nitro `serverAssets` (`assets:i18n`),   because `public/` is not available to SSR on disk. Does not force a public copy — set `publicAssets: true` for CDN/static. Keep the defaults for the usual all-in-one setup. For large Edge catalogs prefer `mode: 'source'`. For CDN-backed deployments, disable local outputs and set `apiBaseClientHost` / `apiBaseServerHost`. |
| `translationPayloads.mode` | `'premerged' \| 'source'` | `'premerged'` | Translation payload strategy. - `premerged`: build-time `{page}/{locale}/data.json` matrix (default) - `source`: compact source files merged at runtime (prefer on Edge / large catalogs) |
| `translationPayloads.serverAssets` | `boolean` | `true` | Local SSR payloads: a Node server that serves `public/` from disk reads that tree (forces public copy); Edge, function presets, and `serveStatic: "inline"` embed via Nitro `serverAssets`. - **Node server** (preset serves `public/` itself, e.g. `node-server`): no Nitro `serverAssets` (avoids Rollup `raw:`). SSR reads   `public/<apiBaseUrl\|publicDir>` as `{page}/{locale}/data.json`; when this is `true`,   a public copy is forced even if `publicAssets` is false. - **Edge, function presets, and inline** (`nitro.node === false`, no disk `serveStatic` such as `vercel` /   `netlify` / `aws-lambda`, or `serveStatic: "inline"` e.g. winterjs): Nitro `serverAssets` (`assets:i18n`)   with the same layout as `mode`. Does **not** force a public copy — set `publicAssets: true` for CDN/static. |
| `translationPayloads.serverHandler` | `boolean` | `true` | Register the built-in server route at `/{apiBaseUrl}/:page/:locale/data.json`. Disable this when translation payloads are served from an external host/CDN. |
| `translationPayloads.publicAssets` | `boolean` | `true in premerged mode, false in source mode` | Copy payloads into Nitro public output. Premerged → `{page}/{locale}/data.json` under `apiBaseUrl`; source → compact tree. When SSR reads `public/` (`node-server` and similar), `serverAssets: true` also forces this copy. On Edge / function / `serveStatic: "inline"` presets, copy only when this is `true` (SSR uses the Nitro embed). |
| `translationPayloads.prerenderRoutes` | `boolean` | `false` | Opt in to Nitro-prerender `/{apiBaseUrl}/.../data.json`. Usually redundant when premerged `publicAssets` already wrote those files. |
| `translationPayloads.publicDir` | `string` | — | Public output folder relative to Nitro public root. Defaults to `apiBaseUrl` (`_locales`). So static files match client fetch URLs (`/{apiBaseUrl}/{page}/{locale}/data.json`). |
| `translationPayloads.warnFileCount` | `number` | `500` | Warn during build when generated payload file count exceeds this threshold. |
| `translationPayloads.warnSizeBytes` | `number` | `10485760 (10 MB)` | Warn during build when generated payload total size exceeds this threshold in bytes. |

## SEO

Meta tags generated for each localized page.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `meta` | `boolean` | `true` | Generate SEO meta tags (`hreflang`, `canonical`, `og:url`, `og:locale`) automatically. |
| `metaBaseUrl` | `string` | `undefined` | Base URL for SEO meta tags (canonical, og:url, hreflang). - A concrete URL string (e.g. `'https://example.com'`) — used as-is (highest priority). - `undefined` — falls back to `site.url` from `nuxt-site-config` when that module is   present, otherwise the current request origin   (`useRequestURL().origin` on server, `window.location.origin` on client). |
| `metaTrustForwardedHost` | `boolean` | `true` | Trust the `X-Forwarded-Host` header when resolving the base URL for meta tags. Enable when the app runs behind a reverse proxy (nginx, Cloudflare, AWS ALB, etc.) that sets this header to the real client-facing hostname. |
| `metaTrustForwardedProto` | `boolean` | `true` | Trust the `X-Forwarded-Proto` header when resolving the protocol for meta tags. Enable when the app runs behind a TLS-terminating proxy so that canonical URLs use `https://` even though the app itself listens on HTTP. |
| `canonicalQueryWhitelist` | `string[]` | `['page', 'sort', 'filter', 'search', 'q', 'query', 'tag']` | List of query parameter names preserved in canonical and `og:url` meta tags. Parameters not in this list are stripped from the canonical URL. |

## Detection and redirects

Choosing a locale for a visitor who has not picked one.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `redirects` | `boolean` | `true` | Enable automatic locale redirects (server plugin and client route middleware). When `true`, the prefix strategies redirect an unprefixed URL to its localized form. The locale comes from the app state, the cookie or `Accept-Language` where `autoDetectPath` allows, otherwise the default. Under `no_prefix` detection never changes the URL (see `noPrefixRedirect` for custom paths). |
| `autoDetectLanguage` | `boolean` | `true` | Automatically detect the user's preferred language from the `Accept-Language` HTTP header. Used in combination with `autoDetectPath` to decide when detection occurs. |
| `autoDetectPath` | `string` | `'/'` | Where cookie / Accept-Language preference redirects may run (when `redirects` is enabled). - `'/'` — only `/` (deep links in the default locale stay reachable; default) - `'no_prefix'` — only paths without a locale prefix - `'*'` — every path, including rewriting an explicit locale prefix   (e.g. `/fr/about` → `/de/about` when the cookie prefers `de`) - any other string — that path, trailing slashes ignored (e.g. `'/welcome'`) Under `prefix`, an unprefixed URL outside the allowed paths still redirects to the default locale's form (`/about` → `/en/about`). The default locale with a prefix under `prefix_except_default` (`/en`) is a 404, not a redirect. |

## Registration

Parts of the module you can switch off.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `define` | `boolean` | `true` | Register the plugin that provides `$defineI18nRoute()` at runtime. The build reads `$defineI18nRoute()` calls in pages either way. |
| `plugin` | `boolean` | `true` | Register the core i18n plugin that provides `$t()`, `$tc()`, `$getLocale()`, `$switchLocale()`, and other runtime helpers. |
| `hooks` | `boolean` | `true` | Register the i18n hooks plugin, which calls the `i18n:register` app hook on load and on navigation so plugins can add translations. |
| `components` | `boolean` | `true` | Register built-in i18n components (`<i18n-link>`, `<i18n-switcher>`, `<i18n-t>`, `<i18n-group>`). Set to `false` to disable automatic component registration (e.g. if you don't use them and want to reduce the module footprint). |
| `types` | `boolean` | `true` | Generate TypeScript type declarations for `useI18n`, `$t`, and related helpers based on the translation keys in your default locale files. |
| `debug` | `boolean` | `false` | Enable verbose debug logging for locale detection, route generation, and translation loading. |

## Other

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `hreflangBaseLanguage` | `boolean` | `false` | Also emit a bare-language `hreflang` derived from each locale's `iso` (e.g. `es-ES` → also `es`). The first regional locale in `locales` claims the bare tag for that language. Routing `code` is never used — only `iso \|\| code`. |
| `additionalTranslationDirs` | `string[]` | `[]` | Extra directories (relative to the project root / each Nuxt layer root) whose top-level `{locale}.json` files are deep-merged into the global dictionary before `translationDir`. Merge order: each entry in array order (across layers), then `translationDir` (wins on conflicts). Only root `{locale}.json` files are read — `pages/` under these dirs is ignored. Example: `translationDir: 'frontend'`, `additionalTranslationDirs: ['common']` → `common/en.json` then `frontend/en.json`. |
| `vueDevtools` | `boolean` | `true` | Register Vue DevTools inspector and timeline in dev (browser extension). Separate from the Nuxt DevTools custom tab. |
| `trailingSlash` | `'append' \| 'remove'` | `undefined (inherit from Nuxt)` | Trailing slash for `$localePath` / `$switchLocalePath` (NuxtLink parity). Defaults to `experimental.defaults.nuxtLink.trailingSlash` when unset. Set explicitly to override Nuxt's link default for i18n path helpers. |
| `localizedRouteNamePrefix` | `string` | `'localized-'` | Prefix prepended to localized route names (e.g. `'localized-index'`). Used internally to distinguish original routes from generated locale variants. |
| `routeDisableMeta` | `Record<string, boolean \| string[]>` | — | Per-route meta tag disabling. Maps a route name or path to `true` (disable all meta) or an array of locale codes for which meta should be disabled. Entries found in `$defineI18nRoute()` calls at build time are added to it. |
| `missingWarn` | `boolean` | `true` | Show console warnings when a translation key is missing (development build, in the browser). |
| `hmr` | `boolean` | `true` | Enable Hot Module Replacement for translation files in development. When `true`, changes to JSON translation files trigger an automatic reload without a full page refresh. |
| `cacheMaxSize` | `number` | `0` | Maximum number of entries in the in-memory translation caches. The fetch and server caches drop the least recently used entry; the browser's dictionary map drops the oldest one (FIFO). `0` means no limit in the browser; server caches keep at most 1000 entries then, so request URLs naming made-up pages cannot grow server memory. |
| `cacheTtl` | `number` | `0` | Time-to-live (in seconds) of the fetch and server translation caches, counted from when an entry was stored (reads do not extend it), so data from `apiBaseServerHost` is refreshed at least that often. The browser's active dictionaries are not expired by it. `0` means entries never expire. |
| `numberFormats` | `Record<string, Record<string, Intl.NumberFormatOptions>>` | — | Named number formats per locale (Vue I18n-compatible). Enables `$tn(1000, 'currency')` style calls. |
| `datetimeFormats` | `Record<string, Record<string, Intl.DateTimeFormatOptions>>` | — | Named datetime formats per locale (Vue I18n-compatible `datetimeFormats`). Enables `$td(date, 'short')` style calls. |
| `httpCacheDuration` | `number` | `31536000` | HTTP `Cache-Control` max-age (seconds) for `/{apiBaseUrl}/:page/:locale/data.json`. Applies in full only while `dateBuild` busts the URL (`?v=...`), which is the default: the response is then `public, max-age=…, immutable` and safe for browsers and CDNs. - `dateBuild: 0`/`''` — the URL is stable, so this duration is *not* honoured; the   response becomes `public, max-age=0, must-revalidate` instead. A long `max-age` on an   unchanging URL pins the first payload a browser ever saw. - `0` — do not set `Cache-Control` at all (useful in local debugging) - Not applied in development (`import.meta.dev`) so HMR is not fought by the browser cache - Reaches only responses served through Nitro. Payloads copied into `public/` and served   by the hosting platform take that platform's headers — see the Performance guide. Analogous to `@nuxtjs/i18n` experimental `httpCacheDuration` (v10.2.0), but as an explicit response header rather than Nitro `defineCachedEventHandler` maxAge. |
| `dateBuild` | `string \| number` | — | Value used for cache-busting translation requests (`?v=...`). When not provided, the module uses a hash of the translation files, so the value changes only when translations do (`Date.now()` when no hash can be computed). `0` or `''` turns cache-busting off. Set a stable value (a git SHA, a build number) to pin it yourself. |
| `experimental` | `Record<string, unknown>` | — | Bucket for experimental/unstable options. Contents may change or be removed without notice between minor versions. |

<!-- /generated:module-options -->

## Option details

Options with nothing to add beyond the table are not repeated here.

### Locales and URLs

#### `locales`

<!-- generated:option:locales — do not edit; run `pnpm run docs:generate` -->

**Type** `Locale[]` · **Default** `[]`

List of supported locales.
Each entry defines a locale code plus optional metadata (ISO, direction, display name, etc.).

<!-- /generated:option:locales -->

Each entry is a `Locale` object:

| Property | Type | Description |
| --- | --- | --- |
| `code` | `string` | **Required.** URL segment and file name (`en`, `de-at`). |
| `iso` | `string` | BCP-47 tag for `<html lang>` and `hreflang` (`en-US`). |
| `displayName` | `string` | Label in `<i18n-switcher>` and `$getLocaleName()`. |
| `dir` | `'ltr' \| 'rtl' \| 'auto'` | `<html dir>`. |
| `disabled` | `boolean` | Excluded from routes, payloads and switching. |
| `fallbackLocale` | `string` | Fallback for this locale; overrides the global `fallbackLocale`. |
| `seo` | `boolean` | `false` leaves the locale out of `hreflang` and `og:locale:alternate`. |
| `og` | `string` | `og:locale` value (`ar_AE`); default: `iso` converted. |
| `baseUrl` | `string` | The locale's own domain: links into it become absolute URLs there. |
| `baseDefault` | `boolean` | With `baseUrl`: no `/<code>` prefix in those URLs. |

Other properties are kept and returned by `$getLocales()`. Type them by augmenting `Locale`:

```ts
// i18n.d.ts
declare module '@i18n-micro/types' {
  interface Locale {
    flag?: string
  }
}
export {}
```

The module hoists `@i18n-micro/types`, so this works under pnpm without installing the package.

#### `defaultLocale`

<!-- generated:option:defaultLocale — do not edit; run `pnpm run docs:generate` -->

**Type** `string` · **Default** `'en'`

The locale to use when no locale can be determined from URL or user preferences.
It is not a translation fallback: set `fallbackLocale` for that.

<!-- /generated:option:defaultLocale -->

#### `strategy`

<!-- generated:option:strategy — do not edit; run `pnpm run docs:generate` -->

**Type** `Strategies` · **Default** `'prefix_except_default'`

URL routing strategy for locale prefixes.

- `'no_prefix'` — no locale in URL; locale stored in cookie.
- `'prefix_except_default'` — prefix all locales except the default.
- `'prefix'` — always prefix, including the default locale.
- `'prefix_and_default'` — like `prefix`, but the default locale is also accessible without prefix.

<!-- /generated:option:strategy -->

URLs per strategy and redirects: [Routing strategies](/guide/strategy).

#### `globalLocaleRoutes`

<!-- generated:option:globalLocaleRoutes — do not edit; run `pnpm run docs:generate` -->

**Type** `GlobalLocaleRoutes` · **Default** `{}`

Global route-level locale configuration.
Allows restricting or customizing locale routes for specific pages without
modifying their components.

- `false` — exclude the route from localization.
- `Record<LocaleCode, string>` — custom per-locale paths.

<!-- /generated:option:globalLocaleRoutes -->

Keys are route names or paths. Usually set per page with [`$defineI18nRoute`](/guide/per-component-translations).

```ts
globalLocaleRoutes: {
  about: { en: '/about-us', de: '/ueber-uns' },
  'admin-dashboard': false, // not localized
}
```

Details, dynamic segments and `pages:extend` routes: [Localized paths](/guide/custom-locale-routes).

#### `routeLocales`

<!-- generated:option:routeLocales — do not edit; run `pnpm run docs:generate` -->

**Type** `Record<string, string[]>` · **Default** —

Per-route locale restrictions, extracted at build time from `$defineI18nRoute()` calls.
Maps a route path (e.g. `'/about'`) to an array of allowed locale codes.
Routes not listed have no restrictions (all locales allowed).

<!-- /generated:option:routeLocales -->

#### `routeDisableMeta`

<!-- generated:option:routeDisableMeta — do not edit; run `pnpm run docs:generate` -->

**Type** `Record<string, boolean \| string[]>` · **Default** —

Per-route meta tag disabling. Maps a route name or path to `true` (disable all meta) or an array
of locale codes for which meta should be disabled. Entries found in `$defineI18nRoute()`
calls at build time are added to it.

<!-- /generated:option:routeDisableMeta -->

#### `customRegexMatcher`

<!-- generated:option:customRegexMatcher — do not edit; run `pnpm run docs:generate` -->

**Type** `string \| RegExp` · **Default** `undefined (uses built-in pattern based on locale codes)`

Custom regular expression (or its string source) for matching locale codes in URL segments.
Every locale code in `locales` must match this pattern, or the build fails.

<!-- /generated:option:customRegexMatcher -->

```ts
customRegexMatcher: '[a-z]{2}-[a-z]{2}', // en-us, de-at
```

#### `excludePatterns`

<!-- generated:option:excludePatterns — do not edit; run `pnpm run docs:generate` -->

**Type** `(string \| RegExp)[]` · **Default** `undefined`

Paths to leave out of i18n routing: a string is a path prefix (`/admin` covers `/admin/x`)
or a `*` / `?` glob; a RegExp is tested against the path. Matching pages get no locale
variants, no locale redirect or 404, and are dropped from prerender; they still render with
translations. `/api`, `/_nuxt`, `/__*`, the translations route and common static files
(sitemap, robots.txt, favicon, assets by extension) are always excluded.

<!-- /generated:option:excludePatterns -->

```ts
excludePatterns: ['/admin', '/docs/*', /^\/preview\//],
```

More: [Excluding paths](/guide/excluding-static-files).

#### `localizedRouteNamePrefix`

<!-- generated:option:localizedRouteNamePrefix — do not edit; run `pnpm run docs:generate` -->

**Type** `string` · **Default** `'localized-'`

Prefix prepended to localized route names (e.g. `'localized-index'`).
Used internally to distinguish original routes from generated locale variants.

<!-- /generated:option:localizedRouteNamePrefix -->

#### `trailingSlash`

<!-- generated:option:trailingSlash — do not edit; run `pnpm run docs:generate` -->

**Type** `'append' \| 'remove'` · **Default** `undefined (inherit from Nuxt)`

Trailing slash for `$localePath` / `$switchLocalePath` (NuxtLink parity).
Defaults to `experimental.defaults.nuxtLink.trailingSlash` when unset.
Set explicitly to override Nuxt's link default for i18n path helpers.

<!-- /generated:option:trailingSlash -->

### Translations

#### `translationDir`

<!-- generated:option:translationDir — do not edit; run `pnpm run docs:generate` -->

**Type** `string` · **Default** `'locales'`

Path to the directory containing translation JSON files, relative to the project root.

<!-- /generated:option:translationDir -->

Relative to each layer's root, not to `app/` (`'app/locales'` for a Nuxt 4 layout). File layout: [Translation files](/guide/translations).

#### `additionalTranslationDirs`

<!-- generated:option:additionalTranslationDirs — do not edit; run `pnpm run docs:generate` -->

**Type** `string[]` · **Default** `[]`

Extra directories (relative to the project root / each Nuxt layer root) whose top-level
`{locale}.json` files are deep-merged into the global dictionary before `translationDir`.

Merge order: each entry in array order (across layers), then `translationDir` (wins on conflicts).
Only root `{locale}.json` files are read — `pages/` under these dirs is ignored.

Example: `translationDir: 'frontend'`, `additionalTranslationDirs: ['common']` → `common/en.json` then `frontend/en.json`.

<!-- /generated:option:additionalTranslationDirs -->

#### `disablePageLocales`

<!-- generated:option:disablePageLocales — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `false`

Disable per-page translation files.
When `true`, only global translations (`{locale}.json`) are loaded;
page-specific files (`pages/{page}/{locale}.json`) are not generated or loaded.

<!-- /generated:option:disablePageLocales -->

#### `fallbackLocale`

<!-- generated:option:fallbackLocale — do not edit; run `pnpm run docs:generate` -->

**Type** `string` · **Default** `undefined (no fallback; returns the raw key)`

Global fallback locale code.
Keys missing in a locale are taken from this locale (merged into each payload when it is
built or loaded); without it a missing key renders as the key itself.

<!-- /generated:option:fallbackLocale -->

#### `routesLocaleLinks`

<!-- generated:option:routesLocaleLinks — do not edit; run `pnpm run docs:generate` -->

**Type** `{ [key: string]: string }` · **Default** `{}`

Map route names to other route names to share the same translation files.
For example, `{ 'about-us': 'about' }` means the `about-us` page will use
translations from the `about` page instead of its own.

<!-- /generated:option:routesLocaleLinks -->

```ts
routesLocaleLinks: { 'products-id': 'products' },
```

#### `plural`

<!-- generated:option:plural — do not edit; run `pnpm run docs:generate` -->

**Type** `PluralFunc` · **Default** `built-in pluralization (form index by count)`

Custom pluralization function.
Receives `(key, count, params, locale, getter)` and should return the selected
plural form as a string, or `null`/`undefined` to fall back to the built-in
`defaultPlural` logic (so you can override only some locales).

For the Nuxt module the function is serialized with `.toString()` into
`.nuxt/i18n.plural.mjs` — it must be self-contained (no imports / outer scope).
A file path string is **not** supported.

<!-- /generated:option:plural -->

The function receives `(key, count, params, locale, getter)`; `getter(key)` returns the raw string with all forms. Write it as a self-contained `function` or arrow expression (no method shorthand, no imports, no outer variables):

```ts
plural: function (key, count, params, locale, getter) {
  if (locale !== 'ru') return null // built-in rule for other locales
  const forms = String(getter(key) ?? '').split('|').map((form) => form.trim())
  const mod10 = count % 10
  const mod100 = count % 100
  const index = count === 0 ? 0 : mod10 === 1 && mod100 !== 11 ? 1 : mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20) ? 2 : 3
  return (forms[Math.min(index, forms.length - 1)] ?? '').replace('{count}', String(count))
},
```

```json
{ "apples": "нет яблок | {count} яблоко | {count} яблока | {count} яблок" }
```

#### `numberFormats`

<!-- generated:option:numberFormats — do not edit; run `pnpm run docs:generate` -->

**Type** `Record<string, Record<string, Intl.NumberFormatOptions>>` · **Default** —

Named number formats per locale (Vue I18n-compatible).
Enables `$tn(1000, 'currency')` style calls.

<!-- /generated:option:numberFormats -->

Used by [`$tn`](/api/methods#tn).

#### `datetimeFormats`

<!-- generated:option:datetimeFormats — do not edit; run `pnpm run docs:generate` -->

**Type** `Record<string, Record<string, Intl.DateTimeFormatOptions>>` · **Default** —

Named datetime formats per locale (Vue I18n-compatible `datetimeFormats`).
Enables `$td(date, 'short')` style calls.

<!-- /generated:option:datetimeFormats -->

Used by [`$td`](/api/methods#td).

#### `disableWatcher`

<!-- generated:option:disableWatcher — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `false`

Disable the file watcher that auto-creates missing translation files in development mode.

<!-- /generated:option:disableWatcher -->

#### `missingWarn`

<!-- generated:option:missingWarn — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `true`

Show console warnings when a translation key is missing (development build, in the browser).

<!-- /generated:option:missingWarn -->

To report missing keys instead, use [`$setMissingHandler`](/api/methods#setmissinghandler).

### Payloads and caching

#### `translationPayloads`

<!-- generated:option:translationPayloads — do not edit; run `pnpm run docs:generate` -->

**Type** `TranslationPayloadOptions` · **Default** —

Controls how translation payloads are emitted (Node server: `public/<apiBaseUrl>`; Edge / function / inline: Nitro `serverAssets`).

- **Node server** (`node-server`, `node-cluster`, disk `serveStatic`): `serverAssets` means local SSR via `readFile` under `public/` (no Rollup `raw:`).
- **Edge, function presets, and `serveStatic: "inline"`** (`vercel`, `netlify`, `aws-lambda`, winterjs, …): `serverAssets` registers Nitro `serverAssets` (`assets:i18n`),
  because `public/` is not available to SSR on disk. Does not force a public copy — set `publicAssets: true` for CDN/static.

Keep the defaults for the usual all-in-one setup. For large Edge catalogs prefer `mode: 'source'`.
For CDN-backed deployments, disable local outputs and set `apiBaseClientHost` / `apiBaseServerHost`.

<!-- /generated:option:translationPayloads -->

The sub-options are in the [Payloads and caching](#payloads-and-caching) table. Which combination fits Node, serverless, Edge, static hosting or a CDN: [Deployment](/guide/deployment).

#### `apiBaseUrl`

<!-- generated:option:apiBaseUrl — do not edit; run `pnpm run docs:generate` -->

**Type** `string` · **Default** `'_locales'`

Base URL path segment for the translations API route (used in SSR/SSG data fetching).
Can also be set via `NUXT_I18N_APP_BASE_URL` environment variable.

<!-- /generated:option:apiBaseUrl -->

Payload URLs are `/{apiBaseUrl}/{page}/{locale}/data.json`.

#### `apiBaseClientHost`

<!-- generated:option:apiBaseClientHost — do not edit; run `pnpm run docs:generate` -->

**Type** `string` · **Default** `undefined`

Override the host used for client-side translation fetch requests.
Useful when the client reaches the server via a different hostname than the one Nuxt sees.
Can also be set via `NUXT_I18N_APP_BASE_CLIENT_HOST` environment variable.

<!-- /generated:option:apiBaseClientHost -->

#### `apiBaseServerHost`

<!-- generated:option:apiBaseServerHost — do not edit; run `pnpm run docs:generate` -->

**Type** `string` · **Default** `undefined`

Override the host used for server-side translation fetch requests.
Useful in container/microservice setups where the server reaches itself via an internal hostname.
Can also be set via `NUXT_I18N_APP_BASE_SERVER_HOST` environment variable.

<!-- /generated:option:apiBaseServerHost -->

A host must serve the same `/{apiBaseUrl}/{page}/{locale}/data.json` responses as the built-in route.

#### `dateBuild`

<!-- generated:option:dateBuild — do not edit; run `pnpm run docs:generate` -->

**Type** `string \| number` · **Default** —

Value used for cache-busting translation requests (`?v=...`).

When not provided, the module uses a hash of the translation files, so the value changes
only when translations do (`Date.now()` when no hash can be computed). `0` or `''` turns
cache-busting off. Set a stable value (a git SHA, a build number) to pin it yourself.

<!-- /generated:option:dateBuild -->

#### `httpCacheDuration`

<!-- generated:option:httpCacheDuration — do not edit; run `pnpm run docs:generate` -->

**Type** `number` · **Default** `31536000`

HTTP `Cache-Control` max-age (seconds) for `/{apiBaseUrl}/:page/:locale/data.json`.

Applies in full only while `dateBuild` busts the URL (`?v=...`), which is the default:
the response is then `public, max-age=…, immutable` and safe for browsers and CDNs.

- `dateBuild: 0`/`''` — the URL is stable, so this duration is *not* honoured; the
  response becomes `public, max-age=0, must-revalidate` instead. A long `max-age` on an
  unchanging URL pins the first payload a browser ever saw.

- `0` — do not set `Cache-Control` at all (useful in local debugging)
- Not applied in development (`import.meta.dev`) so HMR is not fought by the browser cache
- Reaches only responses served through Nitro. Payloads copied into `public/` and served
  by the hosting platform take that platform's headers — see the Performance guide.

Analogous to `@nuxtjs/i18n` experimental `httpCacheDuration` (v10.2.0), but as an
explicit response header rather than Nitro `defineCachedEventHandler` maxAge.

<!-- /generated:option:httpCacheDuration -->

#### `cacheMaxSize`

<!-- generated:option:cacheMaxSize — do not edit; run `pnpm run docs:generate` -->

**Type** `number` · **Default** `0`

Maximum number of entries in the in-memory translation caches. The fetch and server caches
drop the least recently used entry; the browser's dictionary map drops the oldest one (FIFO).
`0` means no limit in the browser; server caches keep at most 1000 entries then, so request
URLs naming made-up pages cannot grow server memory.

<!-- /generated:option:cacheMaxSize -->

#### `cacheTtl`

<!-- generated:option:cacheTtl — do not edit; run `pnpm run docs:generate` -->

**Type** `number` · **Default** `0`

Time-to-live (in seconds) of the fetch and server translation caches, counted from when an
entry was stored (reads do not extend it), so data from `apiBaseServerHost` is refreshed at
least that often. The browser's active dictionaries are not expired by it. `0` means entries
never expire.

<!-- /generated:option:cacheTtl -->

What both change at runtime: [Performance](/guide/performance).

#### `serverTranslationPreload`

<!-- generated:option:serverTranslationPreload — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `false`

Preload index-page translations in Nitro global middleware (server-only, private config).

<!-- /generated:option:serverTranslationPreload -->

### SEO

#### `meta`

<!-- generated:option:meta — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `true`

Generate SEO meta tags (`hreflang`, `canonical`, `og:url`, `og:locale`) automatically.

<!-- /generated:option:meta -->

Per-page overrides: [`useI18nHead`](/composables/useI18nHead). Everything else: [SEO](/guide/seo).

#### `metaBaseUrl`

<!-- generated:option:metaBaseUrl — do not edit; run `pnpm run docs:generate` -->

**Type** `string` · **Default** `undefined`

Base URL for SEO meta tags (canonical, og:url, hreflang).

- A concrete URL string (e.g. `'https://example.com'`) — used as-is (highest priority).
- `undefined` — falls back to `site.url` from `nuxt-site-config` when that module is
  present, otherwise the current request origin
  (`useRequestURL().origin` on server, `window.location.origin` on client).

<!-- /generated:option:metaBaseUrl -->

#### `metaTrustForwardedHost`

<!-- generated:option:metaTrustForwardedHost — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `true`

Trust the `X-Forwarded-Host` header when resolving the base URL for meta tags.
Enable when the app runs behind a reverse proxy (nginx, Cloudflare, AWS ALB, etc.)
that sets this header to the real client-facing hostname.

<!-- /generated:option:metaTrustForwardedHost -->

Read only when neither `metaBaseUrl` nor `site.url` is set. Set it to `false` when the app is reachable without a proxy that overwrites the header: a client could otherwise choose the host in your canonical URLs.

#### `metaTrustForwardedProto`

<!-- generated:option:metaTrustForwardedProto — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `true`

Trust the `X-Forwarded-Proto` header when resolving the protocol for meta tags.
Enable when the app runs behind a TLS-terminating proxy so that
canonical URLs use `https://` even though the app itself listens on HTTP.

<!-- /generated:option:metaTrustForwardedProto -->

Same scope as `metaTrustForwardedHost`.

#### `hreflangBaseLanguage`

<!-- generated:option:hreflangBaseLanguage — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `false`

Also emit a bare-language `hreflang` derived from each locale's `iso`
(e.g. `es-ES` → also `es`). The first regional locale in `locales` claims
the bare tag for that language. Routing `code` is never used — only `iso || code`.

<!-- /generated:option:hreflangBaseLanguage -->

#### `canonicalQueryWhitelist`

<!-- generated:option:canonicalQueryWhitelist — do not edit; run `pnpm run docs:generate` -->

**Type** `string[]` · **Default** `['page', 'sort', 'filter', 'search', 'q', 'query', 'tag']`

List of query parameter names preserved in canonical and `og:url` meta tags.
Parameters not in this list are stripped from the canonical URL.

<!-- /generated:option:canonicalQueryWhitelist -->

### Detection and redirects

The rules these options feed: [Locale detection](/guide/locale-detection).

#### `redirects`

<!-- generated:option:redirects — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `true`

Enable automatic locale redirects (server plugin and client route middleware).
When `true`, the prefix strategies redirect an unprefixed URL to its localized form. The locale
comes from the app state, the cookie or `Accept-Language` where `autoDetectPath` allows, otherwise
the default. Under `no_prefix` detection never changes the URL (see `noPrefixRedirect` for custom paths).

<!-- /generated:option:redirects -->

With `false` the client redirect middleware is not registered. The server plugin still returns 404 for invalid locale URLs and writes the cookie for a prefixed URL.

#### `autoDetectLanguage`

<!-- generated:option:autoDetectLanguage — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `true`

Automatically detect the user's preferred language from the `Accept-Language` HTTP header.
Used in combination with `autoDetectPath` to decide when detection occurs.

<!-- /generated:option:autoDetectLanguage -->

#### `autoDetectPath`

<!-- generated:option:autoDetectPath — do not edit; run `pnpm run docs:generate` -->

**Type** `string` · **Default** `'/'`

Where cookie / Accept-Language preference redirects may run (when `redirects` is enabled).

- `'/'` — only `/` (deep links in the default locale stay reachable; default)
- `'no_prefix'` — only paths without a locale prefix
- `'*'` — every path, including rewriting an explicit locale prefix
  (e.g. `/fr/about` → `/de/about` when the cookie prefers `de`)

- any other string — that path, trailing slashes ignored (e.g. `'/welcome'`)

Under `prefix`, an unprefixed URL outside the allowed paths still redirects to the default
locale's form (`/about` → `/en/about`). The default locale with a prefix under
`prefix_except_default` (`/en`) is a 404, not a redirect.

<!-- /generated:option:autoDetectPath -->

#### `localeCookie`

<!-- generated:option:localeCookie — do not edit; run `pnpm run docs:generate` -->

**Type** `string \| null` · **Default** `null`

Cookie name for persisting the user's locale preference across sessions.
Set to `null` to disable cookie-based persistence.
Automatically set to `'user-locale'` for the `no_prefix` strategy if not provided; an explicit
`null` in the `i18n` config block keeps it off there too.

<!-- /generated:option:localeCookie -->

Without a cookie, `Accept-Language` still drives redirects; the cookie remembers a choice across visits.

#### `noPrefixRedirect`

<!-- generated:option:noPrefixRedirect — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `false`

For `no_prefix` strategy: when the default locale has a custom path for a page
(`localeRoutes` / `globalLocaleRoutes`), redirect the page's original path to it
(e.g. `/about` → `/about-us`). Pages with dynamic segments are not redirected.

<!-- /generated:option:noPrefixRedirect -->

### Registration and development

#### `plugin`

<!-- generated:option:plugin — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `true`

Register the core i18n plugin that provides `$t()`, `$tc()`, `$getLocale()`,
`$switchLocale()`, and other runtime helpers.

<!-- /generated:option:plugin -->

#### `define`

<!-- generated:option:define — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `true`

Register the plugin that provides `$defineI18nRoute()` at runtime. The build reads
`$defineI18nRoute()` calls in pages either way.

<!-- /generated:option:define -->

#### `hooks`

<!-- generated:option:hooks — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `true`

Register the i18n hooks plugin, which calls the `i18n:register` app hook on load and on
navigation so plugins can add translations.

<!-- /generated:option:hooks -->

See [Hooks](/api/events).

#### `components`

<!-- generated:option:components — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `true`

Register built-in i18n components (`<i18n-link>`, `<i18n-switcher>`, `<i18n-t>`, `<i18n-group>`).
Set to `false` to disable automatic component registration (e.g. if you don't use them
and want to reduce the module footprint).

<!-- /generated:option:components -->

#### `types`

<!-- generated:option:types — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `true`

Generate TypeScript type declarations for `useI18n`, `$t`, and related helpers
based on the translation keys in your default locale files.

<!-- /generated:option:types -->

Separate from the [`@i18n-micro/types-generator`](/integrations/types-generator) package.

#### `hmr`

<!-- generated:option:hmr — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `true`

Enable Hot Module Replacement for translation files in development.
When `true`, changes to JSON translation files trigger an automatic reload
without a full page refresh.

<!-- /generated:option:hmr -->

#### `debug`

<!-- generated:option:debug — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `false`

Enable verbose debug logging for locale detection, route generation, and translation loading.

<!-- /generated:option:debug -->

#### `vueDevtools`

<!-- generated:option:vueDevtools — do not edit; run `pnpm run docs:generate` -->

**Type** `boolean` · **Default** `true`

Register Vue DevTools inspector and timeline in dev (browser extension).
Separate from the Nuxt DevTools custom tab.

<!-- /generated:option:vueDevtools -->

#### `experimental`

<!-- generated:option:experimental — do not edit; run `pnpm run docs:generate` -->

**Type** `Record<string, unknown>` · **Default** —

Bucket for experimental/unstable options.
Contents may change or be removed without notice between minor versions.

<!-- /generated:option:experimental -->

## Related

- [Getting started](/guide/getting-started)
- [Runtime overrides](/guide/runtime-overrides) — change `defaultLocale` and others per deployment
- [Helpers](/api/methods)
