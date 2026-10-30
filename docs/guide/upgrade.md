---
title: 'Upgrading'
description: 'Breaking changes when upgrading nuxt-i18n-micro: the release after 3.30.2, and v2 to v3.'
outline: [2, 3]
---

# Upgrading

This page lists what changes for your app when you upgrade nuxt-i18n-micro and its `@i18n-micro/*` packages. Read the section for the version you come from before you bump the dependency. Each item says what changed and what to do; most apps need no code change.

::: tip Coming from `@nuxtjs/i18n`?
See [Migrating from @nuxtjs/i18n](/guide/migration).
:::

## After 3.30.2: routing, core, translations and detection rewrite

The module's public API (options, `$t`/`$localePath`/`$switchLocale`…, components, composables, server utilities) keeps its signatures. What changed is behaviour, mostly bugs fixed.

### Requirements

- **Nuxt 3.18 or newer.** The module declares `compatibility: { nuxt: '>=3.18.0' }`.
- **`@i18n-micro/test-utils` is no longer installed with the module.** If your tests import it, add it: `npm install -D @i18n-micro/test-utils`.
- **`@i18n-micro/hmr` is gone.** Translation HMR is built into the module. Remove the package if you installed it yourself.

### Routing

- **Localized route names are consistent.** A child under a shared locale record keeps the page's name, `no_prefix` honours `localizedRouteNamePrefix`, and a parent with an index child stays unnamed. Only code that hard-codes `localized-…` names in `router.push({ name })` is affected: pass the page's own name to `$localeRoute` / `<i18n-link>` instead.
- **`/en` and `/en/...` are a 404 under `prefix_except_default`** (`en` being the default), as documented.
- **A locale that does not serve a page links to its home.** `$localeRoute`, `$switchLocalePath` and the switcher no longer return another locale's page.
- **`hreflang` lists only the locales that serve the page**; `x-default` is emitted only when the default locale serves it.
- **`autoDetectPath: '*'` now applies the cookie and `Accept-Language` to unprefixed paths too** (`/about` → `/de/about`). Before, every unprefixed URL got the default locale.

### Locale detection

One precedence everywhere, described on [Locale detection](/guide/locale-detection).

- **`?locale=` counts on pages only under `no_prefix`.** Under the prefix strategies the URL decides; `/about?locale=de` no longer renders German under `lang="en"`.
- **`Accept-Language` honours `q` values** (`fr;q=0.1, de;q=0.9` → `de`; `q=0` excludes a language). Regional matching no longer depends on the order of `locales`, and never crosses Chinese scripts.
- **Server API helpers** (`useLocaleServerMiddleware`, `useTranslationServerMiddleware`) use one order on every route: `?locale` → `[locale]` param or prefix → cookie → header → default. They now respect `localeCookie: null` and `autoDetectLanguage: false`, and cache a dictionary per locale.
- **A malformed locale cookie is ignored** instead of failing every SSR page with a 500.
- **Runtime overrides reach routing.** `NUXT_I18N_DEFAULT_LOCALE` and runtime `disabledLocales` now change the generated strategy (a disabled locale stops routing). Under `prefix_except_default` and `prefix_and_default` a runtime `defaultLocale` is ignored with a warning, because that locale's unprefixed routes are generated at build. See [Runtime overrides](/guide/runtime-overrides).
- **`excludePatterns`** match whole segments (`'/admin'` no longer matches `/administrator`), and globs are anchored (`/docs/*` no longer matches `/en/docs/x`). Check your patterns against [Excluding paths](/guide/excluding-static-files).

### Translations

- **Merges are deep at every level.** Root, page and fallback files used a 2-level merge, so `a.b.c` from a fallback or the root was lost in source mode and in dev. All modes now give the same dictionary.
- **Fallback chains are followed to their end** (`fr` → `de` → `en`) in every mode.
- **A page without its own `pages/<name>/` folder reads the root dictionary** in production builds. It used to get `{}` and show raw keys.
- **`disablePageLocales: true` reads the root files only;** `pages/index` is no longer merged in.
- **The leaving page's keys stop resolving after navigation** (at the end of the page transition, or `page:finish`). If a layout used keys that only the previous page's file had, move them to the root file.
- **`$clearCache()` reloads the current page's dictionary** and keeps the old one on screen until the new one lands.
- **`$has(key, route)` honours the route.**
- **Translation HMR applies edits in place**, without a page reload; removed keys disappear and root edits reach every page.

### Plurals and formatting

- `$tc` with a negative, fractional or huge count takes the last form with the real count; `{ count: null }` no longer throws; a missing plural key reaches the missing handler.
- `$tdr` gives real future dates (`in 3 days`, or `tomorrow` with `numeric: 'auto'`) and `Invalid Date` for an invalid input.
- A `{param}` placeholder reads only the params you pass (`{constructor}` stays as written).

### Server cache

- **Bounded by default:** at most 1000 entries when `cacheMaxSize` is unset.
- **`cacheTtl` counts from when an entry was stored**; reads no longer extend it.
- **No Nitro route cache on `/{apiBaseUrl}/**`.** The `Cache-Control` headers stay. If you relied on that cache, put a CDN in front of the payload route.

### Hooks and types

- **`i18n:register` is a runtime hook:** register it with `nuxtApp.hook('i18n:register', …)` in a plugin, without `@ts-expect-error`. The exported type `ModuleHooks` is renamed `ModuleRuntimeHooks`. See [Hooks](/api/events).
- The `hooks` option no longer documents `i18n:beforeLocaleSwitch` / `i18n:afterLocaleSwitch`; they were never emitted.
- `const { $defineI18nRoute } = useNuxtApp()` in a page now works with configs that use variables.

### Framework packages

| Package | Change | Action |
| --- | --- | --- |
| `@i18n-micro/react`, `@i18n-micro/solid` | router adapters moved to the `/router` subpath | `import { createReactRouterAdapter } from '@i18n-micro/react/router'` (Solid: `createSolidRouterAdapter` from `@i18n-micro/solid/router`) |
| `@i18n-micro/react`, `@i18n-micro/preact` | a link to `/` or a locale root is active on an exact match only; `className` on the switcher adds to `i18n-switcher-wrapper` | check active-link styles |
| `@i18n-micro/vue` | canonical / `og:url` keep `canonicalQueryWhitelist` params with the vue-router adapter | — |
| `@i18n-micro/astro` | the URL decides the page locale; `autoDetect` is a 302 from `/` to the preferred locale's home; new `localeCookie` middleware option | see [Astro](/integrations/astro-package) |
| `@i18n-micro/devtools-ui` | `createBridge` takes a `base` option; a failed save to a reachable endpoint throws and rolls back | pass `base` if you changed the plugin's `base` |
| `@i18n-micro/core` (2.0.0) | `TranslationHelper` drops `setCache`, `getGeneration`, `lookupIn` (use `lookup(chunkKey, key)`); `BaseI18n` drops `ensurePinnedChunk`, `invalidatePin`; route chunks hold only their own keys and lookups fall through to the root chunk | only for custom adapters |
| `@i18n-micro/utils` | subpaths `./route`, `./route-pattern`, `./build`, `./payload-stats`, `./payload-config` removed | they were module internals |
| `@i18n-micro/path-strategy` | per-strategy subpaths removed, one class from the root entry; `RouterAdapter` needs `getRoutes` | internal to the module |

## From v2 to v3

### Removed options

```diff
 i18n: {
-  includeDefaultLocaleRoute: true,
+  strategy: 'prefix',
-  fallbackRedirectComponentPath: '~/components/MyRedirect.vue',
-  experimental: { hmr: true, previousPageFallback: true },
+  hmr: true,
 }
```

- `includeDefaultLocaleRoute: true` is `strategy: 'prefix'`; `false` is the default `prefix_except_default`.
- `fallbackRedirectComponentPath` is gone: redirects happen on the server before render and in a client route middleware. Custom redirect logic goes into a plugin that sets the locale, see [Custom locale detection](/guide/custom-auto-detect).
- `experimental.hmr` is the root `hmr` option (on by default).
- `previousPageFallback` is gone: the leaving page's keys resolve until its transition ends, with no option.

### Locale state

Use `useI18nLocale()` instead of `useState('i18n-locale')` and `useCookie('user-locale')`:

```diff
- useState('i18n-locale').value = 'fr'
- useCookie('user-locale').value = 'fr'
+ useI18nLocale().setLocale('fr') // state and cookie together
```

### Config at runtime

Read the config, runtime overrides included, with `$getI18nConfig()`:

```diff
- const cookieName = useRuntimeConfig().public.i18nConfig?.localeCookie
+ const { $getI18nConfig } = useNuxtApp()
+ const cookieName = $getI18nConfig().localeCookie
```

### Internal type aliases

If your IDE or `vue-tsc` cannot resolve `#i18n-internal/*` imports, map them in your `package.json`. Nuxt resolves them at build time, so this is rarely needed:

```json
{
  "imports": {
    "#i18n-internal/plural": "nuxt-i18n-micro/internals",
    "#i18n-internal/strategy": "nuxt-i18n-micro/internals",
    "#i18n-internal/config": "nuxt-i18n-micro/internals"
  }
}
```

## Related

- Next: [Translation files](/guide/translations)
- [Locale detection](/guide/locale-detection)
- [Module options](/api/module-options)
- [Changelog](https://github.com/s00d/nuxt-i18n-micro/blob/main/CHANGELOG.md)
