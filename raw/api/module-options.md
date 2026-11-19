# Module options

This page lists every key of the `i18n` object in `nuxt.config`. Each option has a section below with its type, default, what it does and, where it helps, an example; the index right after the example links to them by group. Types, defaults and descriptions are generated from the `ModuleOptions` interface in [`packages/types/src/index.ts`](https://github.com/s00d/nuxt-i18n-micro/blob/main/packages/types/src/index.ts).

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

- [Locales and URLs](#locales-and-urls) — [`locales`](#locales) · [`defaultLocale`](#defaultlocale) · [`strategy`](#strategy) · [`globalLocaleRoutes`](#globallocaleroutes) · [`routeLocales`](#routelocales) · [`routeDisableMeta`](#routedisablemeta) · [`customRegexMatcher`](#customregexmatcher) · [`excludePatterns`](#excludepatterns) · [`localizedRouteNamePrefix`](#localizedroutenameprefix) · [`trailingSlash`](#trailingslash)
- [Translations](#translations) — [`translationDir`](#translationdir) · [`additionalTranslationDirs`](#additionaltranslationdirs) · [`disablePageLocales`](#disablepagelocales) · [`fallbackLocale`](#fallbacklocale) · [`linkedMessages`](#linkedmessages) · [`routesLocaleLinks`](#routeslocalelinks) · [`plural`](#plural) · [`numberFormats`](#numberformats) · [`datetimeFormats`](#datetimeformats) · [`timeZone`](#timezone) · [`disableWatcher`](#disablewatcher) · [`missingWarn`](#missingwarn)
- [Payloads and caching](#payloads-and-caching) — [`translationPayloads`](#translationpayloads) · [`apiBaseUrl`](#apibaseurl) · [`apiBaseClientHost`](#apibaseclienthost) · [`apiBaseServerHost`](#apibaseserverhost) · [`dateBuild`](#datebuild) · [`httpCacheDuration`](#httpcacheduration) · [`cacheMaxSize`](#cachemaxsize) · [`cacheTtl`](#cachettl) · [`serverTranslationPreload`](#servertranslationpreload) · [`cacheStorage`](#cachestorage) · [`httpCacheControl`](#httpcachecontrol)
- [SEO](#seo) — [`meta`](#meta) · [`metaBaseUrl`](#metabaseurl) · [`metaTrustForwardedHost`](#metatrustforwardedhost) · [`metaTrustForwardedProto`](#metatrustforwardedproto) · [`trustForwardedHost`](#trustforwardedhost) · [`hreflangBaseLanguage`](#hreflangbaselanguage) · [`canonicalQueryWhitelist`](#canonicalquerywhitelist)
- [Detection and redirects](#detection-and-redirects) — [`redirects`](#redirects) · [`redirectStatusCode`](#redirectstatuscode) · [`autoDetectLanguage`](#autodetectlanguage) · [`autoDetectPath`](#autodetectpath) · [`localeCookie`](#localecookie) · [`localeCookieOptions`](#localecookieoptions) · [`noPrefixRedirect`](#noprefixredirect) · [`prefixCaseRedirect`](#prefixcaseredirect)
- [Registration and development](#registration-and-development) — [`plugin`](#plugin) · [`define`](#define) · [`hooks`](#hooks) · [`components`](#components) · [`types`](#types) · [`hmr`](#hmr) · [`debug`](#debug) · [`vueDevtools`](#vuedevtools) · [`experimental`](#experimental)

## Locales and URLs

### `locales`

**Type** `Locale[]` · **Default** `[]`

List of supported locales.
Each entry defines a locale code plus optional metadata (ISO, direction, display name, etc.).

Each entry is a `Locale` object:

<field-group>
<field name="code" type="string" :required="true">

URL segment and file name (`en`, `de-at`).

</field>

<field name="iso" type="string">

BCP-47 tag for `<html lang>`, `hreflang`, plurals and `$tn` / `$td` / `$tdr` (`en-US`).

</field>

<field name="displayName" type="string">

Label in `<i18n-switcher>` and `$getLocaleName()`.

</field>

<field name="dir" type="'ltr' | 'rtl' | 'auto'">

`<html dir>`. Without it, known RTL languages get `rtl` and every other locale gets no attribute. See [SEO](/guide/seo#text-direction).

</field>

<field name="disabled" type="boolean">

Excluded from routes, payloads and switching. Its prefix is a 404, and links to it stay on the page.

</field>

<field name="fallbackLocale" type="string">

Fallback for this locale; overrides the global `fallbackLocale`.

</field>

<field name="seo" type="boolean">

`false` leaves the locale out of `hreflang` and `og:locale:alternate`.

</field>

<field name="og" type="string">

`og:locale` value (`ar_AE`); default: `iso` converted.

</field>

<field name="baseUrl" type="string">

The locale's own domain: one build serves it, and links into it from other domains are absolute.

</field>

<field name="baseDefault" type="boolean">

With `baseUrl`: the default locale of its host, with no `/<code>` prefix in links to it (`prefix` keeps it).

</field>
</field-group>

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

### `defaultLocale`

**Type** `string` · **Default** `'en'`

The locale to use when no locale can be determined from URL or user preferences.
It is not a translation fallback: set `fallbackLocale` for that.

### `strategy`

**Type** `Strategies` · **Default** `'prefix_except_default'`

URL routing strategy for locale prefixes.

- `'no_prefix'` — no locale in URL; locale stored in cookie.
- `'prefix_except_default'` — prefix all locales except the default.
- `'prefix'` — always prefix, including the default locale.
- `'prefix_and_default'` — like `prefix`, but the default locale is also accessible without prefix.

URLs per strategy and redirects: [Routing strategies](/guide/strategy).

### `globalLocaleRoutes`

**Type** `GlobalLocaleRoutes` · **Default** `{}`

Global route-level locale configuration.
Allows restricting or customizing locale routes for specific pages without
modifying their components.

- `false` — exclude the route from localization.
- `Record<LocaleCode, string>` — custom per-locale paths.

Keys are route names or paths. Usually set per page with [`$defineI18nRoute`](/guide/per-component-translations).

```ts
globalLocaleRoutes: {
  about: { en: '/about-us', de: '/ueber-uns' },
  'admin-dashboard': false, // not localized
}
```

Details, dynamic segments and `pages:extend` routes: [Localized paths](/guide/custom-locale-routes).

### `routeLocales`

**Type** `Record<string, string[]>` · **Default** —

Per-route locale restrictions, extracted at build time from `$defineI18nRoute()` calls.
Maps a route path (e.g. `'/about'`) to an array of allowed locale codes.
Routes not listed have no restrictions (all locales allowed).

### `routeDisableMeta`

**Type** `Record<string, boolean | string[]>` · **Default** —

Per-route meta tag disabling. Maps a route name or path to `true` (disable all meta) or an array
of locale codes for which meta should be disabled. Entries found in `$defineI18nRoute()`
calls at build time are added to it.

### `customRegexMatcher`

**Type** `string | RegExp` · **Default** `undefined (uses built-in pattern based on locale codes)`

Custom regular expression (or its string source) for matching locale codes in URL segments.
Every locale code in `locales` must match the whole pattern, without its flags, or the build fails.

```ts
customRegexMatcher: '[a-z]{2}-[a-z]{2}', // en-us, de-at
```

### `excludePatterns`

**Type** `(string | RegExp)[]` · **Default** `undefined`

Paths to leave out of i18n routing: a string is a path prefix (`/admin` covers `/admin/x`)
or a `*` / `?` glob; a RegExp is tested against the path. Matching pages get no locale
variants, no locale redirect or 404, and are dropped from prerender; they still render with
translations. `/api`, `/_nuxt`, `/__*`, the translations route and common static files
(sitemap, robots.txt, favicon, assets by extension) are always excluded.

```ts
excludePatterns: ['/admin', '/docs/*', /^\/preview\//],
```

More: [Excluding paths](/guide/excluding-static-files).

### `localizedRouteNamePrefix`

**Type** `string` · **Default** `'localized-'`

Prefix prepended to localized route names (e.g. `'localized-index'`).
Used internally to distinguish original routes from generated locale variants.

### `trailingSlash`

**Type** `'append' | 'remove'` · **Default** `undefined (inherit from Nuxt)`

Trailing slash for `$localePath` / `$switchLocalePath` (NuxtLink parity).
Defaults to `experimental.defaults.nuxtLink.trailingSlash` when unset.
Set explicitly to override Nuxt's link default for i18n path helpers.

## Translations

### `translationDir`

**Type** `string` · **Default** `'locales'`

Path to the directory containing translation JSON files, relative to the project root.

Relative to each layer's root, not to `app/` (`'app/locales'` for a Nuxt 4 layout). File layout: [Translation files](/guide/translations).

### `additionalTranslationDirs`

**Type** `string[]` · **Default** `[]`

Extra directories whose top-level `{locale}.json` files are deep-merged into the global
dictionary before `translationDir`. A relative path is read in the project root and in each
Nuxt layer root; an absolute path (a Nuxt module's own folder) is read once.

Merge order: each entry in array order (across layers), then `translationDir` (wins on conflicts).
Only root `{locale}.json` files are read — `pages/` under these dirs is ignored.
Entries other modules add to `nuxt.options.i18n.additionalTranslationDirs` count, whatever their order.

Example: `translationDir: 'frontend'`, `additionalTranslationDirs: ['common']` → `common/en.json` then `frontend/en.json`.

A Nuxt module can ship translations of its own: it adds its folder by absolute path, listed before or after `nuxt-i18n-micro`. The folder is read once (not per layer), its files are part of the payload fingerprint (`?v=`), and in dev they hot-reload like the app's.

```ts [my-module/src/module.ts]
import { createResolver, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: { name: 'my-module' },
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const i18n = ((nuxt.options as { i18n?: { additionalTranslationDirs?: string[] } }).i18n ??= {})
    ;(i18n.additionalTranslationDirs ??= []).push(resolve('./runtime/locales'))
  },
})
```

The module's `runtime/locales/en.json` then sits under the app's files: an app key with the same name wins.

### `disablePageLocales`

**Type** `boolean` · **Default** `false`

Disable per-page translation files.
When `true`, only global translations (`{locale}.json`) are loaded;
page-specific files (`pages/{page}/{locale}.json`) are not generated or loaded.

### `fallbackLocale`

**Type** `string` · **Default** `undefined (no fallback; returns the raw key)`

Global fallback locale code.
Keys missing in a locale are taken from this locale (merged into each payload when it is
built or loaded); without it a missing key renders as the key itself.

### `linkedMessages`

**Type** `boolean` · **Default** `false`

Resolve linked messages (`@:key`, `@.upper:key`, `@.lower:key`, `@.capitalize:key`, `@:{'key'}`)
in each built dictionary, so the runtime never parses them. A link to a missing key, or a
cycle, leaves the message as written and warns at build. Translations added at runtime
(`$mergeTranslations`, `i18n:register`, inline `$defineI18nRoute`) are not resolved.
Off by default: `@:` may already be plain text in your messages.

Syntax and limits: [Linked messages](/guide/translations#linked-messages).

### `routesLocaleLinks`

**Type** `{ [key: string]: string }` · **Default** `{}`

Map route names to other route names to share the same translation files.
For example, `{ 'about-us': 'about' }` means the `about-us` page will use
translations from the `about` page instead of its own.

```ts
routesLocaleLinks: { 'products-id': 'products' },
```

### `plural`

**Type** `PluralFunc` · **Default** `built-in pluralization (a non-negative integer count picks the form at that index, clamped to the last; negative, fractional and `NaN` counts take the last; `=0 ` opens a template of `Intl.PluralRules` categories)`

Custom pluralization function.
Receives `(key, count, params, locale, getter)` and should return the selected
plural form as a string, or `null`/`undefined` to fall back to the built-in
`defaultPlural` logic (so you can override only some locales).

For the Nuxt module the function is serialized with `.toString()` into
`.nuxt/i18n.plural.mjs` — it must be self-contained (no imports / outer scope).
A file path string is **not** supported.

The built-in rule and its `=0 ` marker are described at [`$tc`](/api/methods#tc). Your function replaces it for what it answers, gets the raw value with any marker in place, and `null` hands the call back to it. The function receives `(key, count, params, locale, getter)`; `getter(key)` returns the raw string with all forms. Write it as a self-contained `function` or arrow expression (no method shorthand, no imports, no outer variables):

```ts
plural: function (key, count, params, locale, getter) {
  if (!locale.startsWith('en')) return null // built-in rule for other locales
  const forms = String(getter(key) ?? '').split('|').map((form) => form.trim())
  const index = count === 0 ? 0 : count === 1 ? 1 : 2
  return (forms[Math.min(index, forms.length - 1)] ?? '').replace('{count}', String(count))
},
```

```json
{ "apples": "no apples | one apple | {count} apples" }
```

### `numberFormats`

**Type** `Record<string, Record<string, Intl.NumberFormatOptions>>` · **Default** —

Named number formats per locale (Vue I18n-compatible).
Enables `$tn(1000, 'currency')` style calls.

```ts
numberFormats: {
  en: { currency: { style: 'currency', currency: 'USD' } },
  de: { currency: { style: 'currency', currency: 'EUR' } },
}
```

Used by [`$tn`](/api/methods#tn).

### `datetimeFormats`

**Type** `Record<string, Record<string, Intl.DateTimeFormatOptions>>` · **Default** —

Named datetime formats per locale (Vue I18n-compatible `datetimeFormats`).
Enables `$td(date, 'short')` style calls.

```ts
datetimeFormats: {
  en: { short: { year: 'numeric', month: 'short', day: 'numeric' } },
  de: { short: { year: 'numeric', month: 'short', day: 'numeric' } },
}
```

Used by [`$td`](/api/methods#td).

### `timeZone`

**Type** `string` · **Default** `the runtime's zone`

IANA time zone for `$td` and `<i18n-t date>` (`Europe/Berlin`). Set it to render one date on
the server and in every browser; a named format's own `timeZone` wins.

### `disableWatcher`

**Type** `boolean` · **Default** `false`

Disable the file watcher that auto-creates missing translation files in development mode.

### `missingWarn`

**Type** `boolean` · **Default** `true`

Show console warnings when a translation key is missing (development build, in the browser).

To report missing keys instead, use [`$setMissingHandler`](/api/methods#setmissinghandler).

## Payloads and caching

### `translationPayloads`

**Type** `TranslationPayloadOptions` · **Default** —

Controls how translation payloads are emitted (Node server: `public/<apiBaseUrl>`; Edge / function / inline: Nitro `serverAssets`).

- **Node server** (`node-server`, `node-cluster`, disk `serveStatic`): `serverAssets` means local SSR via `readFile` under `public/` (no Rollup `raw:`).
- **Edge, function presets, and serveStatic: "inline"** (`vercel`, `netlify`, `aws-lambda`, winterjs, …): `serverAssets` registers Nitro `serverAssets` (`assets:i18n`),
because `public/` is not available to SSR on disk. Does not force a public copy — set `publicAssets: true` for CDN/static.

Keep the defaults for the usual all-in-one setup. For large Edge catalogs prefer `mode: 'source'`.
For CDN-backed deployments, disable local outputs and set `apiBaseClientHost` / `apiBaseServerHost`.

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

Which combination of these keys fits Node, serverless, Edge, static hosting or a CDN: [Deployment](/guide/deployment).

### `apiBaseUrl`

**Type** `string` · **Default** `'_locales'`

Base URL path segment for the translations API route (used in SSR/SSG data fetching).
Can also be set via `NUXT_I18N_APP_BASE_URL` environment variable.

Payload URLs are `/{apiBaseUrl}/{page}/{locale}/data.json`.

### `apiBaseClientHost`

**Type** `string` · **Default** `undefined`

Override the host used for client-side translation fetch requests.
Useful when the client reaches the server via a different hostname than the one Nuxt sees.
Can also be set via `NUXT_I18N_APP_BASE_CLIENT_HOST` environment variable.

### `apiBaseServerHost`

**Type** `string` · **Default** `undefined`

Override the host used for server-side translation fetch requests.
Useful in container/microservice setups where the server reaches itself via an internal hostname.
Can also be set via `NUXT_I18N_APP_BASE_SERVER_HOST` environment variable.

A host must serve the same `/{apiBaseUrl}/{page}/{locale}/data.json` responses as the built-in route.

### `dateBuild`

**Type** `string | number` · **Default** —

Value used for cache-busting translation requests (`?v=...`).

When not provided, the module uses a hash of the translation files, so the value changes
only when translations do (`Date.now()` when no hash can be computed). `0` or `''` turns
cache-busting off. Set a stable value (a git SHA, a build number) to pin it yourself.
`NUXT_I18N_DATE_BUILD` or `runtimeConfig.public.i18nRuntime.dateBuild` replaces it at runtime, after a dictionary
was replaced in place: pinned URLs are left behind, with no rebuild.

```ts
i18n: { dateBuild: 'e3b0c442' }
```

### `httpCacheDuration`

**Type** `number` · **Default** `31536000`

HTTP `Cache-Control` max-age (seconds) for `/{apiBaseUrl}/:page/:locale/data.json`.

Applies in full only while `dateBuild` busts the URL (`?v=...`), which is the default:
the response is then `private, max-age=…, immutable`: a browser pins it, and a CDN that ignores the query cannot
(`public` with `httpCacheControl: false`).

- `dateBuild: 0`/`''` — the URL is stable, so this duration is *not* honoured; the
response becomes `public, max-age=0, must-revalidate` instead. A long `max-age` on an
unchanging URL pins the first payload a browser ever saw.
- `0` — do not set `Cache-Control` at all (useful in local debugging)
- Not applied in development (`import.meta.dev`) so HMR is not fought by the browser cache
- Reaches only responses served through Nitro. Payloads copied into `public/` and served
by the hosting platform take that platform's headers — see the Performance guide.

Analogous to `@nuxtjs/i18n` experimental `httpCacheDuration` (v10.2.0), but as an
explicit response header rather than Nitro `defineCachedEventHandler` maxAge.

### `cacheMaxSize`

**Type** `number` · **Default** `0`

Maximum number of entries in the in-memory translation caches. The fetch and server caches
drop the least recently used entry; the browser's dictionary map drops the oldest one (FIFO).
`0` means no limit in the browser; server caches keep at most 1000 entries then, so request
URLs naming made-up pages cannot grow server memory.

### `cacheTtl`

**Type** `number` · **Default** `0`

Time-to-live (in seconds) of the fetch and server translation caches, counted from when an
entry was stored (reads do not extend it), so data from `apiBaseServerHost` is refreshed at
least that often. The browser's active dictionaries are not expired by it. `0` means entries
never expire.

What both change at runtime: [Performance](/guide/performance).

### `serverTranslationPreload`

**Type** `boolean` · **Default** `false`

Preload index-page translations in Nitro global middleware (server-only, private config).

### `cacheStorage`

**Type** `string` · **Default** —

Name of a Nitro storage mount (`nitro.storage`, e.g. `'redis'`) that several server instances
share as a dictionary cache, read after the in-process cache and before the source. Pays off
mostly with `apiBaseServerHost`: one fetch from the backend instead of one per instance.
Entries are keyed by build and expire after `cacheTtl`, or after one day when it is `0`.
Off in dev and prerender. A failing storage falls back to the source. Unset: no shared cache.

### `httpCacheControl`

**Type** `string | false` · **Default** `'public, max-age=60'`

`Cache-Control` of a payload file answered by a host or by a path-wide rule, which cannot see `?v=`.
On a Node server a response to the current `?v=` is pinned for `httpCacheDuration` and any other revalidates;
with `source`, `cacheTtl` or `apiBaseServerHost`, where a dictionary changes with no build, every response takes this header.
`false` keeps every file on `max-age=0, must-revalidate`.

## SEO

### `meta`

**Type** `boolean` · **Default** `true`

Generate SEO meta tags (`hreflang`, `canonical`, `og:url`, `og:locale`) automatically.

Per-page overrides: [`useI18nHead`](/composables/useI18nHead). Everything else: [SEO](/guide/seo).

### `metaBaseUrl`

**Type** `string` · **Default** `undefined`

Base URL for SEO meta tags (canonical, og:url, hreflang).

- A concrete URL string (e.g. `'https://example.com'`) — used as-is (highest priority).
- `undefined` — falls back to `site.url` from `nuxt-site-config` when that module is
present, otherwise the current request origin
(`useRequestURL().origin` on server, `window.location.origin` on client).

### `metaTrustForwardedHost`

**Type** `boolean` · **Default** `true`

Trust the `X-Forwarded-Host` header when resolving the base URL for meta tags.
Enable when the app runs behind a reverse proxy (nginx, Cloudflare, AWS ALB, etc.)
that sets this header to the real client-facing hostname.

Read only when neither `metaBaseUrl` nor `site.url` is set. Set it to `false` when the app is reachable without a proxy that overwrites the header: a client could otherwise choose the host in your canonical URLs.

### `metaTrustForwardedProto`

**Type** `boolean` · **Default** `true`

Trust the `X-Forwarded-Proto` header when resolving the protocol for meta tags.
Enable when the app runs behind a TLS-terminating proxy so that
canonical URLs use `https://` even though the app itself listens on HTTP.

Same scope as `metaTrustForwardedHost`.

### `trustForwardedHost`

**Type** `boolean` · **Default** `false`

Choose the domain of a request (`locales[].baseUrl`) from `X-Forwarded-Host` instead of
`Host`. Enable it only behind a proxy that overwrites that header.

Separate from `metaTrustForwardedHost` and off by default: here the header would select another domain's locales, not only the origin of a tag. See [Layers and domains](/guide/layers#multiple-domains).

### `hreflangBaseLanguage`

**Type** `boolean` · **Default** `false`

Also emit a bare-language `hreflang` derived from each locale's `iso`
(e.g. `es-ES` → also `es`). The first regional locale in `locales` claims
the bare tag for that language. Routing `code` is never used — only `iso || code`.

### `canonicalQueryWhitelist`

**Type** `string[]` · **Default** `['page', 'sort', 'filter', 'search', 'q', 'query', 'tag']`

List of query parameter names preserved in canonical and `og:url` meta tags.
Parameters not in this list are stripped from the canonical URL.

## Detection and redirects

The rules these options feed: [Locale detection](/guide/locale-detection).

### `redirects`

**Type** `boolean` · **Default** `true`

Enable automatic locale redirects (server plugin and client route middleware).
When `true`, the prefix strategies redirect an unprefixed URL to its localized form. The locale
comes from the app state, the cookie or `Accept-Language` where `autoDetectPath` allows, otherwise
the default. Under `no_prefix` detection never changes the URL (see `noPrefixRedirect` for custom paths).

With `false` the client redirect middleware is not registered. The server plugin still returns 404 for invalid locale URLs and writes the cookie for a prefixed URL.

### `redirectStatusCode`

**Type** `number` · **Default** `302`

HTTP status of every redirect the server answers for the module: the preferred locale (cookie,
`Accept-Language`), a prefix in another case, and under `hashMode` + `prefix` the move into the
hash. `301` and `308` are cached by browsers: a visitor who later changes the preference is still
sent where the first answer said. One of 301, 302, 303, 307, 308; any other value warns at build
and 302 is used.

Keep `302` (or `307`) for redirects that depend on the visitor: a browser caches a `301` or `308` and goes straight to the first answer, even after the visitor switched the locale. The client redirects of a single-page navigation are router moves and have no status.

### `autoDetectLanguage`

**Type** `boolean` · **Default** `true`

Automatically detect the user's preferred language from the `Accept-Language` HTTP header.
Used in combination with `autoDetectPath` to decide when detection occurs.

### `autoDetectPath`

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

### `localeCookie`

**Type** `string | null` · **Default** `null`

Cookie name for persisting the user's locale preference across sessions.
Set to `null` to disable cookie-based persistence.
Automatically set to `'user-locale'` for the `no_prefix` strategy if not provided; an explicit
`null` in the `i18n` config block keeps it off there too.

Without a cookie, `Accept-Language` still drives redirects; the cookie remembers a choice across visits.

### `localeCookieOptions`

**Type** `LocaleCookieOptions` · **Default** `{}`

Attributes of the locale cookie (and of the hash cookie under `hashMode`), as the server and
the browser write it. Unset fields keep the defaults: `path: '/'`, `sameSite: 'lax'`, a year,
no `Domain`, no `Secure`. Build config only: no request decides them.

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

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  i18n: {
    localeCookie: 'user-locale',
    // one preference on example.com, de.example.com and app.example.com, also inside an iframe
    localeCookieOptions: { domain: '.example.com', secure: true, sameSite: 'none' },
  },
})
```

`sameSite: 'none'` without `secure: true` is rejected by browsers, and the build warns about it. The attributes come from the build config only: no request sets `Domain` or `Secure`. They apply to the `hash-locale` cookie under `hashMode` too.

### `noPrefixRedirect`

**Type** `boolean` · **Default** `false`

For `no_prefix` strategy: when the default locale has a custom path for a page
(`localeRoutes` / `globalLocaleRoutes`), redirect the page's original path to the custom
path of the visitor's locale, the default locale's otherwise (e.g. `/about` → `/about-us`).
A locale with no custom path of its own stays on the original path. Pages with dynamic
segments are not redirected.

### `prefixCaseRedirect`

**Type** `boolean` · **Default** `true`

Redirect a locale prefix in another case or encoding to the page in its own spelling
(`/DE/about` → `/de/about`, `/EN/about` → `/about` under `prefix_except_default`). The router
matches the prefix case-insensitively, so without the redirect such a URL would show the page
under a second address. When `false`, or when `redirects` is `false`, the URL is a 404. A URL
with no page behind it in its own spelling is a 404 either way.

## Registration and development

### `plugin`

**Type** `boolean` · **Default** `true`

Register the core i18n plugin that provides `$t()`, `$tc()`, `$getLocale()`,
`$switchLocale()`, and other runtime helpers.

### `define`

**Type** `boolean` · **Default** `true`

Provide `$defineI18nRoute()` at runtime. The build reads `$defineI18nRoute()` calls in pages
either way.

### `hooks`

**Type** `boolean` · **Default** `true`

Call the `i18n:register` app hook on load and on navigation so plugins can add translations.

See [Hooks](/api/events).

### `components`

**Type** `boolean` · **Default** `true`

Register built-in i18n components (`<i18n-link>`, `<i18n-switcher>`, `<i18n-t>`, `<i18n-group>`).
Set to `false` to disable automatic component registration (e.g. if you don't use them
and want to reduce the module footprint).

### `types`

**Type** `boolean` · **Default** `true`

Generate TypeScript type declarations for `useI18n`, `$t`, and related helpers
based on the translation keys in your default locale files.

Separate from the [`@i18n-micro/types-generator`](/integrations/types-generator) package.

### `hmr`

**Type** `boolean` · **Default** `true`

Enable Hot Module Replacement for translation files in development.
When `true`, changes to JSON translation files trigger an automatic reload
without a full page refresh.

### `debug`

**Type** `boolean` · **Default** `false`

Enable verbose debug logging for locale detection, route generation, and translation loading.

### `vueDevtools`

**Type** `boolean` · **Default** `true`

Register Vue DevTools inspector and timeline in dev (browser extension).
Separate from the Nuxt DevTools custom tab.

### `experimental`

**Type** `Record<string, unknown>` · **Default** —

Bucket for experimental/unstable options.
Contents may change or be removed without notice between minor versions.

## Related

<card-group>
<card icon="i-lucide-book-open" title="Getting started" to="/guide/getting-started">



</card>

<card icon="i-lucide-book-open" title="Runtime overrides" to="/guide/runtime-overrides">

Change `defaultLocale` and others per deployment

</card>

<card icon="i-lucide-braces" title="Helpers" to="/api/methods">



</card>
</card-group>
