# `@i18n-micro/types`

TypeScript definitions for the Nuxt I18n Micro ecosystem.

```ts
import { … } from '@i18n-micro/types'
```

## Functions

### `init`

```ts
function init(): void
```

## Types

### `CleanTranslation`

A translation value without the `unknown` escape hatch.

```ts
type CleanTranslation =
  | string
  | number
  | boolean
  | Translations
  | PluralTranslations
  | null
```

**See** [`Translations`](#translations) · [`PluralTranslations`](#pluraltranslations)

### `DefineI18nRouteConfig`

Per-page i18n configuration declared via `$defineI18nRoute()` in page components.

```ts
interface DefineI18nRouteConfig
```

<field-group>
<field name="locales" type="string[] | Record<LocaleCode, Translations>">

Restrict which locales this page is available in.

- `string[]` — list of allowed locale codes.
- `Record<LocaleCode, Translations>` — allowed locales with inline translation overrides.

</field>

<field name="localeRoutes" type="Record<LocaleCode, string>">

Per-locale custom route paths (e.g. `{ en: '/about', de: '/ueber-uns' }`).

</field>

<field name="disableMeta" type="boolean | string[]">

Disable SEO meta tag generation for this page.

- `true` — disable all meta tags.
- `string[]` — disable only for the listed locale codes.

</field>
</field-group>

### `DefineLocaleMessage`

Key registry for typed translation keys.
Users (via `@i18n-micro/types-generator`) extend this interface through
TypeScript module augmentation to get autocompletion for `$t()` calls.

```ts
interface DefineLocaleMessage
```

<field-group>
<field name="readonly __augmentation" type="never">



</field>
</field-group>

### `Getter`

Getter function signature used by pluralization to resolve nested keys.

```ts
type Getter = (key: TranslationKey, params?: Record<string, string | number | boolean>, defaultValue?: string) => unknown
```

**See** [`TranslationKey`](#translationkey)

### `GlobalLocaleRoutes`

Global per-route locale configuration.

- `Record<string, string>` — custom paths per locale for the route.
- `false` — exclude the route from localization entirely.
- `true` — include with default behavior.

```ts
type GlobalLocaleRoutes =
  | Record<string, Record<LocaleCode, string> | false | boolean>
  | null
  | undefined
```

**See** [`LocaleCode`](#localecode)

### `I18nBeforeLocaleSwitchContext`

The context of the `i18n:beforeLocaleSwitch` runtime hook. A subscriber may set `to` (another
enabled locale) or `cancel: true`; an invalid `to` is ignored.

```ts
interface I18nBeforeLocaleSwitchContext
```

<field-group>
<field name="from" type="string" :required="true">

The locale shown now.

</field>

<field name="to" type="string" :required="true">

The locale the switch goes to.

</field>

<field name="cancel" type="boolean" :required="true">

`true` stops the switch: the page and the stored preference stay.

</field>
</field-group>

### `I18nHeadDisableGroup`

Groups of built-in i18n SEO tags that can be disabled per page.

```ts
type I18nHeadDisableGroup =
  | 'hreflang'
  | 'x-default'
  | 'canonical'
  | 'og'
  | 'og-alternates'
  | 'html'
```

### `I18nHeadInput`

Page-level overrides merged on top of `useLocaleHead` output.

```ts
interface I18nHeadInput
```

<field-group>
<field name="htmlAttrs" type="Record<string, string>">

Extra or overriding `<html>` attributes.

</field>

<field name="meta" type="I18nHeadMeta[]">

Meta tags appended after base i18n tags (deduped by `id` / `property` / `name`).

</field>

<field name="link" type="I18nHeadLink[]">

Link tags appended after base i18n tags (deduped by `id` / `rel` + `hreflang`).

</field>

<field name="replace" type="{ canonical?: string | false; hreflang?: I18nHeadLink[] | false; xDefault?: I18nHeadLink | false; ogLocale?: string | false; ogUrl?: string | false; ogAlternates?: string[] | false; }">

Replace or remove specific built-in i18n SEO tags.

</field>

<field name="disable" type="I18nHeadDisableGroup[]">

Disable built-in i18n SEO tag groups for this page.

</field>
</field-group>

### `I18nHeadLink`

Link entry for page-level i18n head overrides (`useI18nHead`).

```ts
interface I18nHeadLink
```

<field-group>
<field name="rel" type="string" :required="true">



</field>

<field name="href" type="string" :required="true">



</field>

<field name="hreflang" type="string">



</field>

<field name="[key: string]" type="string | undefined">



</field>
</field-group>

### `I18nHeadMeta`

Meta entry for page-level i18n head overrides (`useI18nHead`).

```ts
interface I18nHeadMeta
```

<field-group>
<field name="[key: string]" type="string | undefined">



</field>
</field-group>

### `I18nRouteParams`

Locale-specific route params for `$switchLocalePath` and `<i18n-link>`.

```ts
type I18nRouteParams = Record<LocaleCode, Record<string, string>> | null
```

**See** [`LocaleCode`](#localecode)

### `ListParams`

A list for `{0}`, `{1}`: what `t()` takes besides `Params`.

```ts
type ListParams = readonly (string | number | boolean)[]
```

### `Locale`

Locale configuration object.

Supports arbitrary custom properties via the index signature `[key: string]: unknown`.
To get full TypeScript support for your custom properties, use module augmentation:

```typescript
// app/i18n.d.ts (or any .d.ts file included in your tsconfig)
declare module '@i18n-micro/types' {
  interface Locale {
    flag?: string
    currency?: string
  }
}
```

Then access them with full typing:

```typescript
const locales = $getLocales()
locales[0].flag     // string | undefined  (typed!)
locales[0].currency // string | undefined  (typed!)
```

```ts
interface Locale
```

<collapsible name="11 properties">
<field-group>
<field name="code" type="LocaleCode" :required="true">

BCP-47 locale code (e.g. `'en'`, `'de-DE'`, `'zh-Hans'`). Used in URLs and as file/key identifier.

</field>

<field name="disabled" type="boolean">

When `true`, this locale is excluded from route generation and language switching.

</field>

<field name="iso" type="string">

ISO 639-1 / BCP-47 tag for `<html lang>` and `hreflang` SEO attributes (e.g. `'en-US'`).

</field>

<field name="og" type="string">

Open Graph locale for `og:locale` / `og:locale:alternate` meta `content` (e.g. `ar_AE`).
When omitted, `iso` is converted to OG format when possible (`en-US` → `en_US`).
If conversion is not possible, `og:locale` tags are not emitted (dev warning when `missingWarn` is enabled).

</field>

<field name="seo" type="boolean">

**Default** `true when omitted.` · When `false`, this locale is omitted from cross-locale SEO tags (`hreflang`,
`og:locale:alternate`). If the configured default locale has `seo: false`, the
`x-default` hreflang link is not emitted. Routing and translations are unchanged.

</field>

<field name="dir" type="'ltr' | 'rtl' | 'auto'">

Text direction. Reflected in `<html dir>` when the locale is active.

</field>

<field name="displayName" type="string">

Human-readable name shown in language switchers (e.g. `'English'`, `'Deutsch'`).

</field>

<field name="baseUrl" type="string">

Origin of this locale's own domain (e.g. `'https://de.example.com'`), plus `app.baseURL` when
the app has one. One build then serves every domain: a request for that host gets this locale,
the other locales of the host and the locales with no `baseUrl`. Links into a locale of another
domain (`$localePath`, `$switchLocalePath`, the switcher, `hreflang`) become absolute URLs on
its origin, and switching to it navigates there. Any other host gets the build config.

</field>

<field name="baseDefault" type="boolean">

With `baseUrl`: this locale is the default of its host, unprefixed there, and links to it from
other domains drop `/<code>`, because the domain already names the locale
(`https://de.example.com/about`, not `…/de/about`). `prefix` keeps the prefix in both.

</field>

<field name="fallbackLocale" type="string">

Locale code to fall back to when a translation key is missing in this locale.
Overrides the global `fallbackLocale` for this specific locale.

</field>

<field name="[key: string]" type="unknown">



</field>
</field-group>
</collapsible>

### `LocaleCode`

BCP-47 locale code string (e.g. `'en'`, `'de-DE'`, `'zh-Hans'`).

```ts
type LocaleCode = string
```

### `LocaleCookieOptions`

Attributes of the locale cookie (`localeCookieOptions`).

```ts
interface LocaleCookieOptions
```

<field-group>
<field name="domain" type="string">

`Domain`: e.g. `.example.com` to share the cookie across subdomains. Unset: the host only.

</field>

<field name="path" type="string">

**Default** `'/'` · `Path`.

</field>

<field name="secure" type="boolean">

**Default** `false` · `Secure`: sent over HTTPS only. Required by browsers with `sameSite: 'none'`.

</field>

<field name="sameSite" type="'lax' | 'strict' | 'none'">

**Default** `'lax'` · `SameSite`. `'none'` (e.g. an app inside an iframe) needs `secure: true`.

</field>

<field name="maxAge" type="number">

**Default** `31536000 (one year)` · Lifetime in seconds (`Max-Age` and `Expires`).

</field>
</field-group>

### `MissingHandler`

Callback invoked when a translation key is missing.
Useful for logging, reporting, or providing dynamic fallbacks.

```ts
type MissingHandler = (locale: string, key: TranslationKey, routeName: string, instance?: unknown, type?: string) => void
```

**See** [`TranslationKey`](#translationkey)

### `ModuleOptions`

```ts
interface ModuleOptions
```

<collapsible name="57 properties">
<field-group>
<field name="locales" type="Locale[]">

**Default** `[]` · List of supported locales.
Each entry defines a locale code plus optional metadata (ISO, direction, display name, etc.).

</field>

<field name="meta" type="boolean">

**Default** `true` · Generate SEO meta tags (`hreflang`, `canonical`, `og:url`, `og:locale`) automatically.

</field>

<field name="strategy" type="Strategies">

**Default** `'prefix_except_default'` · URL routing strategy for locale prefixes.

- `'no_prefix'` — no locale in URL; locale stored in cookie.
- `'prefix_except_default'` — prefix all locales except the default.
- `'prefix'` — always prefix, including the default locale.
- `'prefix_and_default'` — like `prefix`, but the default locale is also accessible without prefix.

</field>

<field name="metaBaseUrl" type="string">

**Default** `undefined` · Base URL for SEO meta tags (canonical, og:url, hreflang).

- A concrete URL string (e.g. `'https://example.com'`) — used as-is (highest priority).
- `undefined` — falls back to `site.url` from `nuxt-site-config` when that module is
present, otherwise the current request origin
(`useRequestURL().origin` on server, `window.location.origin` on client).

</field>

<field name="metaTrustForwardedHost" type="boolean">

**Default** `true` · Trust the `X-Forwarded-Host` header when resolving the base URL for meta tags.
Enable when the app runs behind a reverse proxy (nginx, Cloudflare, AWS ALB, etc.)
that sets this header to the real client-facing hostname.

</field>

<field name="metaTrustForwardedProto" type="boolean">

**Default** `true` · Trust the `X-Forwarded-Proto` header when resolving the protocol for meta tags.
Enable when the app runs behind a TLS-terminating proxy so that
canonical URLs use `https://` even though the app itself listens on HTTP.

</field>

<field name="trustForwardedHost" type="boolean">

**Default** `false` · Choose the domain of a request (`locales[].baseUrl`) from `X-Forwarded-Host` instead of
`Host`. Enable it only behind a proxy that overwrites that header.

</field>

<field name="hreflangBaseLanguage" type="boolean">

**Default** `false` · Also emit a bare-language `hreflang` derived from each locale's `iso`
(e.g. `es-ES` → also `es`). The first regional locale in `locales` claims
the bare tag for that language. Routing `code` is never used — only `iso || code`.

</field>

<field name="define" type="boolean">

**Default** `true` · Provide `$defineI18nRoute()` at runtime. The build reads `$defineI18nRoute()` calls in pages
either way.

</field>

<field name="redirects" type="boolean">

**Default** `true` · Enable automatic locale redirects (server plugin and client route middleware).
When `true`, the prefix strategies redirect an unprefixed URL to its localized form. The locale
comes from the app state, the cookie or `Accept-Language` where `autoDetectPath` allows, otherwise
the default. Under `no_prefix` detection never changes the URL (see `noPrefixRedirect` for custom paths).

</field>

<field name="prefixCaseRedirect" type="boolean">

**Default** `true` · Redirect a locale prefix in another case or encoding to the page in its own spelling
(`/DE/about` → `/de/about`, `/EN/about` → `/about` under `prefix_except_default`). The router
matches the prefix case-insensitively, so without the redirect such a URL would show the page
under a second address. When `false`, or when `redirects` is `false`, the URL is a 404. A URL
with no page behind it in its own spelling is a 404 either way.

</field>

<field name="plugin" type="boolean">

**Default** `true` · Register the core i18n plugin that provides `$t()`, `$tc()`, `$getLocale()`,
`$switchLocale()`, and other runtime helpers.

</field>

<field name="hooks" type="boolean">

**Default** `true` · Call the `i18n:register` app hook on load and on navigation so plugins can add translations.

</field>

<field name="components" type="boolean">

**Default** `true` · Register built-in i18n components (`<i18n-link>`, `<i18n-switcher>`, `<i18n-t>`, `<i18n-group>`).
Set to `false` to disable automatic component registration (e.g. if you don't use them
and want to reduce the module footprint).

</field>

<field name="serverTranslationPreload" type="boolean">

**Default** `false` · Preload index-page translations in Nitro global middleware (server-only, private config).

</field>

<field name="defaultLocale" type="string">

**Default** `'en'` · The locale to use when no locale can be determined from URL or user preferences.
It is not a translation fallback: set `fallbackLocale` for that.

</field>

<field name="apiBaseUrl" type="string">

**Default** `'_locales'` · Base URL path segment for the translations API route (used in SSR/SSG data fetching).
Can also be set via `NUXT_I18N_APP_BASE_URL` environment variable.

</field>

<field name="apiBaseClientHost" type="string">

**Default** `undefined` · Override the host used for client-side translation fetch requests.
Useful when the client reaches the server via a different hostname than the one Nuxt sees.
Can also be set via `NUXT_I18N_APP_BASE_CLIENT_HOST` environment variable.

</field>

<field name="apiBaseServerHost" type="string">

**Default** `undefined` · Override the host used for server-side translation fetch requests.
Useful in container/microservice setups where the server reaches itself via an internal hostname.
Can also be set via `NUXT_I18N_APP_BASE_SERVER_HOST` environment variable.

</field>

<field name="translationDir" type="string">

**Default** `'locales'` · Path to the directory containing translation JSON files, relative to the project root.

</field>

<field name="additionalTranslationDirs" type="string[]">

**Default** `[]` · Extra directories whose top-level `{locale}.json` files are deep-merged into the global
dictionary before `translationDir`. A relative path is read in the project root and in each
Nuxt layer root; an absolute path (a Nuxt module's own folder) is read once. Merge order: each entry in array order (across layers), then `translationDir` (wins on conflicts).
Only root `{locale}.json` files are read — `pages/` under these dirs is ignored.
Entries other modules add to `nuxt.options.i18n.additionalTranslationDirs` count, whatever their order. Example: `translationDir: 'frontend'`, `additionalTranslationDirs: ['common']` → `common/en.json` then `frontend/en.json`.

</field>

<field name="translationPayloads" type="TranslationPayloadOptions">

Controls how translation payloads are emitted (Node server: `public/<apiBaseUrl>`; Edge / function / inline: Nitro `serverAssets`).

- **Node server** (`node-server`, `node-cluster`, disk `serveStatic`): `serverAssets` means local SSR via `readFile` under `public/` (no Rollup `raw:`).
- **Edge, function presets, and serveStatic: "inline"** (`vercel`, `netlify`, `aws-lambda`, winterjs, …): `serverAssets` registers Nitro `serverAssets` (`assets:i18n`),
because `public/` is not available to SSR on disk. Does not force a public copy — set `publicAssets: true` for CDN/static. Keep the defaults for the usual all-in-one setup. For large Edge catalogs prefer `mode: 'source'`.
For CDN-backed deployments, disable local outputs and set `apiBaseClientHost` / `apiBaseServerHost`.

</field>

<field name="autoDetectLanguage" type="boolean">

**Default** `true` · Automatically detect the user's preferred language from the `Accept-Language` HTTP header.
Used in combination with `autoDetectPath` to decide when detection occurs.

</field>

<field name="autoDetectPath" type="string">

**Default** `'/'` · Where cookie / Accept-Language preference redirects may run (when `redirects` is enabled).

- `'/'` — only `/` (deep links in the default locale stay reachable; default)
- `'no_prefix'` — only paths without a locale prefix
- `'*'` — every path, including rewriting an explicit locale prefix
(e.g. `/fr/about` → `/de/about` when the cookie prefers `de`)
- any other string — that path, trailing slashes ignored (e.g. `'/welcome'`)

Under `prefix`, an unprefixed URL outside the allowed paths still redirects to the default
locale's form (`/about` → `/en/about`). The default locale with a prefix under
`prefix_except_default` (`/en`) is a 404, not a redirect.

</field>

<field name="disableWatcher" type="boolean">

**Default** `false` · Disable the file watcher that auto-creates missing translation files in development mode.

</field>

<field name="types" type="boolean">

**Default** `true` · Generate TypeScript type declarations for `useI18n`, `$t`, and related helpers
based on the translation keys in your default locale files.

</field>

<field name="routesLocaleLinks" type="{ [key: string]: string; }">

**Default** `{}` · Map route names to other route names to share the same translation files.
For example, `{ 'about-us': 'about' }` means the `about-us` page will use
translations from the `about` page instead of its own.

</field>

<field name="plural" type="PluralFunc">

**Default** `built-in pluralization (a non-negative integer count picks the form at that index, clamped to the last; negative, fractional and `NaN` counts take the last; `=0 ` opens a template of `Intl.PluralRules` categories)` · Custom pluralization function.
Receives `(key, count, params, locale, getter)` and should return the selected
plural form as a string, or `null`/`undefined` to fall back to the built-in
`defaultPlural` logic (so you can override only some locales). For the Nuxt module the function is serialized with `.toString()` into
`.nuxt/i18n.plural.mjs` — it must be self-contained (no imports / outer scope).
A file path string is **not** supported.

</field>

<field name="disablePageLocales" type="boolean">

**Default** `false` · Disable per-page translation files.
When `true`, only global translations (`{locale}.json`) are loaded;
page-specific files (`pages/{page}/{locale}.json`) are not generated or loaded.

</field>

<field name="fallbackLocale" type="string">

**Default** `undefined (no fallback; returns the raw key)` · Global fallback locale code.
Keys missing in a locale are taken from this locale (merged into each payload when it is
built or loaded); without it a missing key renders as the key itself.

</field>

<field name="redirectStatusCode" type="number">

**Default** `302` · HTTP status of every redirect the server answers for the module: the preferred locale (cookie,
`Accept-Language`), a prefix in another case, and under `hashMode` + `prefix` the move into the
hash. `301` and `308` are cached by browsers: a visitor who later changes the preference is still
sent where the first answer said. One of 301, 302, 303, 307, 308; any other value warns at build
and 302 is used.

</field>

<field name="linkedMessages" type="boolean">

**Default** `false` · Resolve linked messages (`@:key`, `@.upper:key`, `@.lower:key`, `@.capitalize:key`, `@:{'key'}`)
in each built dictionary, so the runtime never parses them. A link to a missing key, or a
cycle, leaves the message as written and warns at build. Translations added at runtime
(`$mergeTranslations`, `i18n:register`, inline `$defineI18nRoute`) are not resolved.
Off by default: `@:` may already be plain text in your messages.

</field>

<field name="localeCookie" type="string | null">

**Default** `null` · Cookie name for persisting the user's locale preference across sessions.
Set to `null` to disable cookie-based persistence.
Automatically set to `'user-locale'` for the `no_prefix` strategy if not provided; an explicit
`null` in the `i18n` config block keeps it off there too.

</field>

<field name="localeCookieOptions" type="LocaleCookieOptions">

**Default** `{}` · Attributes of the locale cookie (and of the hash cookie under `hashMode`), as the server and
the browser write it. Unset fields keep the defaults: `path: '/'`, `sameSite: 'lax'`, a year,
no `Domain`, no `Secure`. Build config only: no request decides them.

</field>

<field name="debug" type="boolean">

**Default** `false` · Enable verbose debug logging for locale detection, route generation, and translation loading.

</field>

<field name="vueDevtools" type="boolean">

**Default** `true` · Register Vue DevTools inspector and timeline in dev (browser extension).
Separate from the Nuxt DevTools custom tab.

</field>

<field name="globalLocaleRoutes" type="GlobalLocaleRoutes">

**Default** `{}` · Global route-level locale configuration.
Allows restricting or customizing locale routes for specific pages without
modifying their components.

- `false` — exclude the route from localization.
- `Record<LocaleCode, string>` — custom per-locale paths.

</field>

<field name="customRegexMatcher" type="string | RegExp">

**Default** `undefined (uses built-in pattern based on locale codes)` · Custom regular expression (or its string source) for matching locale codes in URL segments.
Every locale code in `locales` must match the whole pattern, without its flags, or the build fails.

</field>

<field name="noPrefixRedirect" type="boolean">

**Default** `false` · For `no_prefix` strategy: when the default locale has a custom path for a page
(`localeRoutes` / `globalLocaleRoutes`), redirect the page's original path to the custom
path of the visitor's locale, the default locale's otherwise (e.g. `/about` → `/about-us`).
A locale with no custom path of its own stays on the original path. Pages with dynamic
segments are not redirected.

</field>

<field name="canonicalQueryWhitelist" type="string[]">

**Default** `['page', 'sort', 'filter', 'search', 'q', 'query', 'tag']` · List of query parameter names preserved in canonical and `og:url` meta tags.
Parameters not in this list are stripped from the canonical URL.

</field>

<field name="trailingSlash" type="'append' | 'remove'">

**Default** `undefined (inherit from Nuxt)` · Trailing slash for `$localePath` / `$switchLocalePath` (NuxtLink parity).
Defaults to `experimental.defaults.nuxtLink.trailingSlash` when unset.
Set explicitly to override Nuxt's link default for i18n path helpers.

</field>

<field name="excludePatterns" type="(string | RegExp)[]">

**Default** `undefined` · Paths to leave out of i18n routing: a string is a path prefix (`/admin` covers `/admin/x`)
or a `*` / `?` glob; a RegExp is tested against the path. Matching pages get no locale
variants, no locale redirect or 404, and are dropped from prerender; they still render with
translations. `/api`, `/_nuxt`, `/__*`, the translations route and common static files
(sitemap, robots.txt, favicon, assets by extension) are always excluded.

</field>

<field name="localizedRouteNamePrefix" type="string">

**Default** `'localized-'` · Prefix prepended to localized route names (e.g. `'localized-index'`).
Used internally to distinguish original routes from generated locale variants.

</field>

<field name="routeLocales" type="Record<string, string[]>">

Per-route locale restrictions, extracted at build time from `$defineI18nRoute()` calls.
Maps a route path (e.g. `'/about'`) to an array of allowed locale codes.
Routes not listed have no restrictions (all locales allowed).

</field>

<field name="routeDisableMeta" type="Record<string, boolean | string[]>">

Per-route meta tag disabling. Maps a route name or path to `true` (disable all meta) or an array
of locale codes for which meta should be disabled. Entries found in `$defineI18nRoute()`
calls at build time are added to it.

</field>

<field name="missingWarn" type="boolean">

**Default** `true` · Show console warnings when a translation key is missing (development build, in the browser).

</field>

<field name="hmr" type="boolean">

**Default** `true` · Enable Hot Module Replacement for translation files in development.
When `true`, changes to JSON translation files trigger an automatic reload
without a full page refresh.

</field>

<field name="cacheMaxSize" type="number">

**Default** `0` · Maximum number of entries in the in-memory translation caches. The fetch and server caches
drop the least recently used entry; the browser's dictionary map drops the oldest one (FIFO).
`0` means no limit in the browser; server caches keep at most 1000 entries then, so request
URLs naming made-up pages cannot grow server memory.

</field>

<field name="cacheTtl" type="number">

**Default** `0` · Time-to-live (in seconds) of the fetch and server translation caches, counted from when an
entry was stored (reads do not extend it), so data from `apiBaseServerHost` is refreshed at
least that often. The browser's active dictionaries are not expired by it. `0` means entries
never expire.

</field>

<field name="cacheStorage" type="string">

Name of a Nitro storage mount (`nitro.storage`, e.g. `'redis'`) that several server instances
share as a dictionary cache, read after the in-process cache and before the source. Pays off
mostly with `apiBaseServerHost`: one fetch from the backend instead of one per instance.
Entries are keyed by build and expire after `cacheTtl`, or after one day when it is `0`.
Off in dev and prerender. A failing storage falls back to the source. Unset: no shared cache.

</field>

<field name="numberFormats" type="Record<string, Record<string, Intl.NumberFormatOptions>>">

Named number formats per locale (Vue I18n-compatible).
Enables `$tn(1000, 'currency')` style calls.

</field>

<field name="timeZone" type="string">

**Default** `the runtime's zone` · IANA time zone for `$td` and `<i18n-t date>` (`Europe/Berlin`). Set it to render one date on
the server and in every browser; a named format's own `timeZone` wins.

</field>

<field name="datetimeFormats" type="Record<string, Record<string, Intl.DateTimeFormatOptions>>">

Named datetime formats per locale (Vue I18n-compatible `datetimeFormats`).
Enables `$td(date, 'short')` style calls.

</field>

<field name="httpCacheDuration" type="number">

**Default** `31536000` · HTTP `Cache-Control` max-age (seconds) for `/{apiBaseUrl}/:page/:locale/data.json`. Applies in full only while `dateBuild` busts the URL (`?v=...`), which is the default:
the response is then `private, max-age=…, immutable`: a browser pins it, and a CDN that ignores the query cannot
(`public` with `httpCacheControl: false`).

- `dateBuild: 0`/`''` — the URL is stable, so this duration is *not* honoured; the
response becomes `public, max-age=0, must-revalidate` instead. A long `max-age` on an
unchanging URL pins the first payload a browser ever saw.
- `0` — do not set `Cache-Control` at all (useful in local debugging)
- Not applied in development (`import.meta.dev`) so HMR is not fought by the browser cache
- Reaches only responses served through Nitro. Payloads copied into `public/` and served
by the hosting platform take that platform's headers — see the Performance guide. Analogous to `@nuxtjs/i18n` experimental `httpCacheDuration` (v10.2.0), but as an
explicit response header rather than Nitro `defineCachedEventHandler` maxAge.

</field>

<field name="httpCacheControl" type="string | false">

**Default** `'public, max-age=60'` · `Cache-Control` of a payload file answered by a host or by a path-wide rule, which cannot see `?v=`.
On a Node server a response to the current `?v=` is pinned for `httpCacheDuration` and any other revalidates;
with `source`, `cacheTtl` or `apiBaseServerHost`, where a dictionary changes with no build, every response takes this header.
`false` keeps every file on `max-age=0, must-revalidate`.

</field>

<field name="dateBuild" type="string | number">

Value used for cache-busting translation requests (`?v=...`). When not provided, the module uses a hash of the translation files, so the value changes
only when translations do (`Date.now()` when no hash can be computed). `0` or `''` turns
cache-busting off. Set a stable value (a git SHA, a build number) to pin it yourself.
`NUXT_I18N_DATE_BUILD` or `runtimeConfig.public.i18nRuntime.dateBuild` replaces it at runtime, after a dictionary
was replaced in place: pinned URLs are left behind, with no rebuild.

</field>

<field name="experimental" type="Record<string, unknown>">

Bucket for experimental/unstable options.
Contents may change or be removed without notice between minor versions.

</field>
</field-group>
</collapsible>

### `ModuleOptionsExtend`

Extended module options injected into the Nuxt runtime config.
Includes resolved values and build-time metadata.

```ts
interface ModuleOptionsExtend extends ModuleOptions
```

<collapsible name="14 properties">
<field-group>
<field name="dateBuild" type="string | number" :required="true">

Value used for cache-busting translation requests (`?v=...`).

</field>

<field name="hashMode" type="boolean" :required="true">

Whether the Nuxt app uses hash-based routing (`router.options.hashMode`).

</field>

<field name="isSSG" type="boolean">

**Deprecated** — No longer set at runtime. Kept so code typed against the released module still compiles.

</field>

<field name="apiBaseUrl" type="string" :required="true">

**Default** `'_locales'` · Resolved translations API base URL (after env variable / config merging).

</field>

<field name="disablePageLocales" type="boolean" :required="true">

**Default** `false` · Resolved flag: whether per-page translations are disabled.

</field>

<field name="redirects" type="boolean">

**Default** `true` · Resolved flag: whether locale-based redirects are enabled.

</field>

<field name="prefixCaseRedirect" type="boolean">

**Default** `true` · Resolved flag: whether a locale prefix in another case or encoding redirects to its own spelling.

</field>

<field name="translationPayloadMode" type="'premerged' | 'source'">

Resolved translation payload loading strategy.

</field>

<field name="publicPayloads" type="boolean">

Premerged files are in `public/`, so they can sit on `app.cdnURL`.

</field>

<field name="rootDelta" type="boolean">

A page's file needs its root: the browser loads the two together.

</field>

<field name="noScripts" type="boolean">

Nuxt's `features.noScripts` is on: no page runs a script, so none preloads a dictionary.

</field>

<field name="domain" type="string">

Host this config was resolved for (`locales[].baseUrl`); unset on any other host.

</field>

<field name="linkLocales" type="Locale[]">

With `domain`: every locale, those of other domains included. `locales` holds what the host serves.

</field>

<field name="linkDefaultLocale" type="string">

With `domain`: the build's `defaultLocale`, the same on every host (`x-default`). `defaultLocale` is the host's.

</field>
</field-group>
</collapsible>

**See** [`ModuleOptions`](#moduleoptions)

### `ModulePrivateOptionsExtend`

Private (server-only) module options passed to Nitro plugins and server middleware.
Extends `ModuleOptions` with resolved root paths and directory info.

```ts
interface ModulePrivateOptionsExtend extends ModuleOptions
```

<field-group>
<field name="cacheStorageBuild" type="string">

Nuxt's `buildId`: `cacheStorage` keys of two builds never meet.

</field>

<field name="rootDirs" type="string[]" :required="true">

Absolute Nuxt layer roots in merge order (extends first, project last).
Used by live/HMR translation reads so layers match build-time merge.

</field>

<field name="debug" type="boolean" :required="true">

**Default** `false` · Resolved debug flag.

</field>

<field name="translationDir" type="string" :required="true">

**Default** `'locales'` · Resolved path to the translations directory.

</field>

<field name="apiBaseServerHost" type="string">

**Default** `undefined` · Resolved server-side host override.

</field>

<field name="serverTranslationPreload" type="boolean">

**Default** `false` · Preload index translations in Nitro global middleware.

</field>

<field name="payloadFsDir" type="string" :required="true">

Absolute buildDir path to payload files (`.nuxt/i18n-merged` or `.nuxt/i18n-source`).
Used by the Node fs reader in `import.meta.dev` / `import.meta.prerender`.

</field>

<field name="payloadPublicRel" type="string" :required="true">

Directory under Nitro `public/` for prod payload files (defaults to `translationDir`).

</field>
</field-group>

**See** [`ModuleOptions`](#moduleoptions)

### `Params`

Interpolation parameters passed to the `t()` function.

```ts
type Params = Record<string, string | number | boolean>
```

### `PluralFunc`

Custom pluralization function.
Called when `tc()` / `$tc()` is used. Receives the key, count, params, locale,
and a getter to fetch the singular/plural forms from translations.

```ts
type PluralFunc = (key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string | null
```

**See** [`TranslationKey`](#translationkey) · [`Params`](#params) · [`Getter`](#getter)

### `PluralTranslations`

Object shape for a translation value that contains singular/plural forms.

```ts
interface PluralTranslations
```

<field-group>
<field name="singular" type="string" :required="true">

Singular form of the translation (count === 1).

</field>

<field name="plural" type="string" :required="true">

Plural form of the translation (count !== 1).

</field>
</field-group>

### `ResolvedI18nConfig`

The config the build writes, as `getI18nConfig()` and `$getI18nConfig()` give it.

```ts
type ResolvedI18nConfig = Omit<ModuleOptionsExtend, ResolvedI18nConfigKey> & Required<Pick<ModuleOptionsExtend, ResolvedI18nConfigKey>>
```

**See** [`ModuleOptionsExtend`](#moduleoptionsextend)

### `RouteI18nMeta`

`meta.i18n` that route-strategy puts on every localized record, and path-strategy reads at runtime.

```ts
interface RouteI18nMeta
```

<field-group>
<field name="name" type="string" :required="true">

Base route name of the page (its translation key and the name `localeRoute({ name })` takes).

</field>

<field name="locales" type="string[]" :required="true">

Locales this record serves.

</field>

<field name="noMeta" type="boolean | string[]">

`disableMeta` of the page: SEO tags off in every locale (`true`) or in the listed ones.

</field>

<field name="original" type="string">

On the default locale's record: the path of a page with a custom default path, where it is no record of its own. A link can still name the page by it.

</field>

<field name="paths" type="Record<string, string>">

`noPrefixRedirect`, on the page's original path: the custom path of each locale. The locale is the visitor's, so the runtime redirects.

</field>
</field-group>

### `ScopedKey`

Helper for creating typed prefixes.
Allows safe usage of dynamic keys.

```ts
type ScopedKey<Scope extends string> = Extract<TranslationKey, `${Scope}.${string}`>
```

```ts
// Assuming keys: 'errors.404', 'errors.500', 'btn.save'
function getErrorText(code: string) {
  return t(`errors.${code}` as ScopedKey<'errors'>)
}
```

**See** [`TranslationKey`](#translationkey)

### `Strategies`

URL routing strategy for locale handling.

```ts
type Strategies =
  | 'no_prefix'
  | 'prefix_except_default'
  | 'prefix'
  | 'prefix_and_default'
```

### `TranslateParams`

What `t()` and `interpolate` take: named params or a list. `PluralFunc` keeps `Params`.

```ts
type TranslateParams = Params | ListParams
```

**See** [`Params`](#params) · [`ListParams`](#listparams)

### `Translation`

A single translation value — can be a primitive, nested object, plural pair, or `unknown`.

```ts
type Translation = CleanTranslation | unknown
```

**See** [`CleanTranslation`](#cleantranslation)

### `TranslationKey`

Resolved translation key type.

- When `DefineLocaleMessage` is empty (generator not connected) — resolves to `string`.
- When `DefineLocaleMessage` has keys — resolves to a union of those keys **and**`(string & {})`, providing autocompletion while still allowing dynamic keys
(plain `| string` would collapse the union to `string`).

```ts
type TranslationKey = Exclude<keyof DefineLocaleMessage, '__augmentation'> extends never
  ? string
  : Exclude<keyof DefineLocaleMessage, '__augmentation'> | (string & {})
```

**See** [`DefineLocaleMessage`](#definelocalemessage)

### `TranslationPayloadOptions`

```ts
interface TranslationPayloadOptions
```

<collapsible name="9 properties">
<field-group>
<field name="mode" type="'premerged' | 'source'">

**Default** `'premerged'` · Translation payload strategy.

- `premerged`: build-time `{page}/{locale}/data.json` matrix (default)
- `source`: compact source files merged at runtime (prefer on Edge / large catalogs)

</field>

<field name="serverAssets" type="boolean">

**Default** `true` · Local SSR payloads: a Node server that serves `public/` from disk reads that tree (forces public copy);
Edge, function presets, and `serveStatic: "inline"` embed via Nitro `serverAssets`.

- **Node server** (preset serves `public/` itself, e.g. `node-server`): no Nitro `serverAssets` (avoids Rollup `raw:`). SSR reads
`public/<apiBaseUrl|publicDir>` as `{page}/{locale}/data.json`; when this is `true`,
a public copy is forced even if `publicAssets` is false.
- **Edge, function presets, and inline** (`nitro.node === false`, no disk `serveStatic` such as `vercel` /
`netlify` / `aws-lambda`, or `serveStatic: "inline"` e.g. winterjs): Nitro `serverAssets` (`assets:i18n`)
with the same layout as `mode`. Does **not** force a public copy — set `publicAssets: true` for CDN/static.

</field>

<field name="serverHandler" type="boolean">

**Default** `true` · Register the built-in server route at `/{apiBaseUrl}/:page/:locale/data.json`.
Disable this when translation payloads are served from an external host/CDN.

</field>

<field name="publicAssets" type="boolean">

**Default** `true in premerged mode, false in source mode` · Copy payloads into Nitro public output. Premerged → `{page}/{locale}/data.json` under `apiBaseUrl`; source → compact tree. When SSR reads `public/` (`node-server` and similar), `serverAssets: true` also forces this copy.
On Edge / function / `serveStatic: "inline"` presets, copy only when this is `true` (SSR uses the Nitro embed).

</field>

<field name="prerenderRoutes" type="boolean">

**Default** `false` · Opt in to Nitro-prerender `/{apiBaseUrl}/.../data.json`. Usually redundant when premerged `publicAssets` already wrote those files.

</field>

<field name="publicDir" type="string">

Public output folder relative to Nitro public root. Defaults to `apiBaseUrl` (`_locales`). So static files match client fetch URLs (`/{apiBaseUrl}/{page}/{locale}/data.json`).

</field>

<field name="rootDelta" type="boolean">

**Default** `true` · Write one root file per locale, and in each page file only what differs from it. The client and SSR merge them;
a whole chunk still works wherever a file is read. `false` keeps a whole dictionary in every page file.
`premerged` only, and off with `disablePageLocales`.

</field>

<field name="warnFileCount" type="number">

**Default** `500` · Warn during build when generated payload file count exceeds this threshold.

</field>

<field name="warnSizeBytes" type="number">

**Default** `10485760 (10 MB)` · Warn during build when generated payload total size exceeds this threshold in bytes.

</field>
</field-group>
</collapsible>

### `Translations`

A flat or nested dictionary of translation key-value pairs.

```ts
interface Translations
```

<field-group>
<field name="[key: string]" type="Translation">



</field>
</field-group>

---

Generated from the TypeScript sources and their JSDoc by `pnpm run docs:generate`.
Back to [all packages](/api/packages) · [Integration guides](/integrations/)
