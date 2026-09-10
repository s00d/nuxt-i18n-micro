---
url: 'https://s00d.github.io/nuxt-i18n-micro/api/module-options.md'
description: >-
  Every option the module accepts, with its type, default and purpose — read at
  build time from the type definition.
---

# Module Options Reference

Every option `nuxt-i18n-micro` accepts, read at build time from the `ModuleOptions`
interface in
[`packages/types/src/index.ts`](https://github.com/s00d/nuxt-i18n-micro/blob/main/packages/types/src/index.ts).
Nothing here is written by hand, so it cannot fall behind the code — types, defaults and
descriptions come from the declaration itself.

For what these options *mean* together — which combinations make sense, what changes when
you switch strategy, worked examples — read [Configuration](/guide/configuration). This
page is the exhaustive list; that one is the explanation.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'de', iso: 'de-DE', dir: 'ltr' },
    ],
    defaultLocale: 'en',
  },
})
```

Nested options appear under their dotted path, so `translationPayloads.mode` is the
`mode` key inside the `translationPayloads` object.

## Locales and routing

Which languages exist and how they appear in the URL.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `locales` | `Locale[]` | `[]` | List of supported locales. Each entry defines a locale code plus optional metadata (ISO, direction, display name, etc.). |
| `strategy` | `Strategies` | `'prefix_except_default'` | URL routing strategy for locale prefixes. - `'no_prefix'` — no locale in URL; locale stored in cookie. - `'prefix_except_default'` — prefix all locales except the default. - `'prefix'` — always prefix, including the default locale. - `'prefix_and_default'` — like `prefix`, but the default locale is also accessible without prefix. |
| `defaultLocale` | `string` | `'en'` | The locale to use when no locale can be determined from URL or user preferences. Also used as the fallback locale for missing translations when `fallbackLocale` is not set. |
| `localeCookie` | `string \| null` | `null` | Cookie name for persisting the user's locale preference across sessions. Set to `null` to disable cookie-based persistence. Automatically set to `'user-locale'` for the `no_prefix` strategy if not provided. |
| `globalLocaleRoutes` | `GlobalLocaleRoutes` | `{}` | Global route-level locale configuration. Allows restricting or customizing locale routes for specific pages without modifying their components. - `false` — exclude the route from localization. - `Record<LocaleCode, string>` — custom per-locale paths. |
| `customRegexMatcher` | `string \| RegExp` | `undefined (uses built-in pattern based on locale codes)` | Custom regular expression (or its string source) for matching locale codes in URL segments. All locale codes defined in `locales` must match this pattern, or a warning is emitted. |
| `noPrefixRedirect` | `boolean` | `false` | For `no_prefix` strategy: enable redirect from a locale-prefixed URL (e.g. `/en/about`) to the unprefixed version (`/about`). |
| `excludePatterns` | `(string \| RegExp)[]` | `undefined` | URL patterns (strings or RegExp) to exclude from i18n processing entirely. Matching routes won't get locale prefixes, redirects, or translation loading. Internal Nuxt paths (`/__nuxt_error`, etc.) are always excluded automatically. |
| `routeLocales` | `Record<string, string[]>` | — | Per-route locale restrictions, extracted from `defineI18nRoute()` calls. Maps a route path (e.g. `'/about'`) to an array of allowed locale codes. Routes not listed have no restrictions (all locales allowed). |

## Translations

Where translation files live and how keys are resolved.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `translationDir` | `string` | `'locales'` | Path to the directory containing translation JSON files, relative to the project root. |
| `disableWatcher` | `boolean` | `false` | Disable the file watcher that auto-creates missing translation files in development mode. |
| `routesLocaleLinks` | `{ [key: string]: string }` | `{}` | Map route names to other route names to share the same translation files. For example, `{ 'about-us': 'about' }` means the `about-us` page will use translations from the `about` page instead of its own. |
| `plural` | `PluralFunc` | `built-in pluralization (form index by count)` | Custom pluralization function. Receives `(key, count, params, locale, getter)` and should return the selected plural form as a string, or `null`/`undefined` to fall back to the built-in `defaultPlural` logic (so you can override only some locales). For the Nuxt module the function is serialized with `.toString()` into `.nuxt/i18n.plural.mjs` — it must be self-contained (no imports / outer scope). A file path string is **not** supported. |
| `disablePageLocales` | `boolean` | `false` | Disable per-page translation files. When `true`, only global translations (`{locale}.json`) are loaded; page-specific files (`pages/{page}/{locale}.json`) are not generated or loaded. |
| `fallbackLocale` | `string` | `undefined (no fallback; returns the raw key)` | Global fallback locale code. When a translation key is missing in the active locale, the module looks it up in this locale before returning the key itself. |

## Payloads and caching

How translations reach the browser. [Performance](/guide/performance) explains what these change at runtime.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `serverTranslationPreload` | `boolean` | `false` | Preload index-page translations in Nitro global middleware (server-only, private config). |
| `apiBaseUrl` | `string` | `'_locales'` | Base URL path segment for the translations API route (used in SSR/SSG data fetching). Can also be set via `NUXT_I18N_APP_BASE_URL` environment variable. |
| `apiBaseClientHost` | `string` | `undefined` | Override the host used for client-side translation fetch requests. Useful when the client reaches the server via a different hostname than the one Nuxt sees. Can also be set via `NUXT_I18N_APP_BASE_CLIENT_HOST` environment variable. |
| `apiBaseServerHost` | `string` | `undefined` | Override the host used for server-side translation fetch requests. Useful in container/microservice setups where the server reaches itself via an internal hostname. Can also be set via `NUXT_I18N_APP_BASE_SERVER_HOST` environment variable. |
| `translationPayloads` | `TranslationPayloadOptions` | — | Controls how translation payloads are emitted (Node: `public/<apiBaseUrl>`; Edge: Nitro `serverAssets`). - **Node**: `serverAssets` means local SSR via `readFile` under `public/` (no Rollup `raw:`). - **Edge**: `serverAssets` registers Nitro `serverAssets` (`assets:i18n`); it does not force a public copy. Keep the defaults for the usual all-in-one setup. For large Edge catalogs prefer `mode: 'source'`. For CDN-backed deployments, disable local outputs and set `apiBaseClientHost` / `apiBaseServerHost`. |
| `translationPayloads.mode` | `'premerged' \| 'source'` | `'premerged'` | Translation payload strategy. - `premerged`: build-time `{page}/{locale}/data.json` matrix (default) - `source`: compact source files merged at runtime (prefer on Edge / large catalogs) |
| `translationPayloads.serverAssets` | `boolean` | `true` | Local SSR payloads: Node reads `public/<apiBaseUrl>` (forces public copy); Edge embeds via Nitro `serverAssets`. - **Node**: no Nitro `serverAssets` (avoids Rollup `raw:`). SSR reads   `public/<apiBaseUrl\|publicDir>` as `{page}/{locale}/data.json`; when this is `true`,   a public copy is forced even if `publicAssets` is false. - **Edge** (`nitro.node === false`): Nitro `serverAssets` (`assets:i18n`) with the same   layout as `mode`. Does **not** force a public copy — set `publicAssets: true` for CDN. |
| `translationPayloads.serverHandler` | `boolean` | `true` | Register the built-in server route at `/{apiBaseUrl}/:page/:locale/data.json`. Disable this when translation payloads are served from an external host/CDN. |
| `translationPayloads.publicAssets` | `boolean` | `true in premerged mode, false in source mode` | Copy payloads into Nitro public output. Premerged → `{page}/{locale}/data.json` under `apiBaseUrl`; source → compact tree. On Node this tree is also the SSR source when `serverAssets` forces a public copy. |
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
| `redirects` | `boolean` | `true` | Enable automatic locale-based redirects. When `true`, visitors are redirected to their preferred locale (detected from cookie, `Accept-Language` header, or the default) on the first visit. |
| `autoDetectLanguage` | `boolean` | `true` | Automatically detect the user's preferred language from the `Accept-Language` HTTP header. Used in combination with `autoDetectPath` to decide when detection occurs. |
| `autoDetectPath` | `string` | `'/'` | Where cookie / Accept-Language preference redirects may run (when `redirects` is enabled). - `'/'` — only `/` (deep links in the default locale stay reachable; default) - `'no_prefix'` — only paths without a locale prefix - `'*'` — every path, including rewriting an explicit locale prefix   (e.g. `/fr/about` → `/de/about` when the cookie prefers `de`) - any other string — exact path match (e.g. `'/welcome'`) Prefixed strategy cleanup (e.g. `/en` → `/` under `prefix_except_default`) is not gated. |

## Registration

Parts of the module you can switch off.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `define` | `boolean` | `true` | Register the `defineI18nRoute()` macro plugin, enabling per-page `defineI18nRoute()` calls. |
| `plugin` | `boolean` | `true` | Register the core i18n plugin that provides `$t()`, `$tc()`, `$getLocale()`, `$switchLocale()`, and other runtime helpers. |
| `hooks` | `boolean` | `true` | Register the i18n hooks plugin that provides `i18n:register` and `i18n:beforeLocaleSwitch` / `i18n:afterLocaleSwitch` app-level hooks. |
| `components` | `boolean` | `true` | Register built-in i18n components (`<i18n-link>`, `<i18n-switcher>`, `<i18n-t>`, `<i18n-group>`). Set to `false` to disable automatic component registration (e.g. if you don't use them and want to reduce the module footprint). |
| `types` | `boolean` | `true` | Generate TypeScript type declarations for `useI18n`, `$t`, and related helpers based on the translation keys in your default locale files. |
| `debug` | `boolean` | `false` | Enable verbose debug logging for locale detection, route generation, and translation loading. |

## Other

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `hreflangBaseLanguage` | `boolean` | `false` | Also emit a bare-language `hreflang` derived from each locale's `iso` (e.g. `es-ES` → also `es`). The first regional locale in `locales` claims the bare tag for that language. Routing `code` is never used — only `iso \|\| code`. |
| `vueDevtools` | `boolean` | `true` | Register Vue DevTools inspector and timeline in dev (browser extension). Separate from the Nuxt DevTools custom tab. |
| `localizedRouteNamePrefix` | `string` | `'localized-'` | Prefix prepended to localized route names (e.g. `'localized-index'`). Used internally to distinguish original routes from generated locale variants. |
| `routeDisableMeta` | `Record<string, boolean \| string[]>` | — | Per-route meta tag disabling, extracted from `defineI18nRoute()` calls. Maps a route path to `true` (disable all meta) or an array of locale codes for which meta should be disabled. |
| `missingWarn` | `boolean` | `true` | Show console warnings when a translation key is missing. |
| `hmr` | `boolean` | `true` | Enable Hot Module Replacement for translation files in development. When `true`, changes to JSON translation files trigger an automatic reload without a full page refresh. |
| `cacheMaxSize` | `number` | `0` | Maximum number of entries in the in-memory translation cache. `0` means no limit. |
| `cacheTtl` | `number` | `0` | Time-to-live (in seconds) for cached translation entries. `0` means entries never expire. |
| `numberFormats` | `Record<string, Record<string, Intl.NumberFormatOptions>>` | — | Named number formats per locale (Vue I18n-compatible). Enables `$tn(1000, 'currency')` style calls. |
| `datetimeFormats` | `Record<string, Record<string, Intl.DateTimeFormatOptions>>` | — | Named datetime formats per locale (Vue I18n-compatible `datetimeFormats`). Enables `$td(date, 'short')` style calls. |
| `httpCacheDuration` | `number` | `31536000` | HTTP `Cache-Control` max-age (seconds) for `/{apiBaseUrl}/:page/:locale/data.json`. Applies in full only while `dateBuild` busts the URL (`?v=...`), which is the default: the response is then `public, max-age=…, immutable` and safe for browsers and CDNs. - `dateBuild: 0`/`''` — the URL is stable, so this duration is *not* honoured; the   response becomes `public, max-age=0, must-revalidate` instead. A long `max-age` on an   unchanging URL pins the first payload a browser ever saw. - `0` — do not set `Cache-Control` at all (useful in local debugging) - Not applied in development (`import.meta.dev`) so HMR is not fought by the browser cache - Reaches only responses served through Nitro. Payloads copied into `public/` and served   by the hosting platform take that platform's headers — see the Performance guide. Analogous to `@nuxtjs/i18n` experimental `httpCacheDuration` (v10.2.0), but as an explicit response header rather than Nitro `defineCachedEventHandler` maxAge. |
| `dateBuild` | `string \| number` | — | Value used for cache-busting translation requests (`?v=...`). When not provided, the module falls back to `Date.now()` (non-deterministic). For reproducible/rolling deployments, set this to a stable value (e.g. a git SHA or build number). |
| `experimental` | `Record<string, unknown>` | — | Bucket for experimental/unstable options. Contents may change or be removed without notice between minor versions. |

## See also

* [Configuration](/guide/configuration) — how these options work together
* [Performance](/guide/performance) — what the payload options change at runtime
* [Package APIs](/api/packages) — the exported API of every workspace package
