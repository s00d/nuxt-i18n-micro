---
title: 'Routing strategies'
description: 'The four URL strategies, the localized routes they generate, and how to link to a page in any locale.'
outline: [2, 3]
---

# Routing strategies

The `strategy` option decides whether a locale appears in the URL and for which locales. Pick it once, before you publish URLs: changing it later changes every link. The module then generates the localized routes at build time, and `$localePath`, `<i18n-link>` and the switcher read them.

## The four strategies

![The /about page in en (default) and de under each strategy; the same URLs are listed in the text below](/diagrams/strategies.svg)

<!-- generated:option:strategy — do not edit; run `pnpm run docs:generate` -->

**Type** `Strategies` · **Default** `'prefix_except_default'`

URL routing strategy for locale prefixes.

- `'no_prefix'` — no locale in URL; locale stored in cookie.
- `'prefix_except_default'` — prefix all locales except the default.
- `'prefix'` — always prefix, including the default locale.
- `'prefix_and_default'` — like `prefix`, but the default locale is also accessible without prefix.

<!-- /generated:option:strategy -->

URLs for an `about` page with `defaultLocale: 'en'` and locales `en`, `de`:

| Strategy | English | German | Not served |
| --- | --- | --- | --- |
| `prefix_except_default` (default) | `/about` | `/de/about` | `/en` and `/en/about` are a 404 |
| `prefix` | `/en/about` | `/de/about` | `/about` redirects to a prefixed URL |
| `prefix_and_default` | `/about` and `/en/about` | `/de/about` | — |
| `no_prefix` | `/about` | `/about` | the locale is not in the URL |

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix',
  },
})
```

The strategy is fixed at build: a runtime override of it is ignored with a warning ([Runtime overrides](/guide/runtime-overrides)).

## Which one to choose

- **`prefix_except_default`**: most sites. Existing unprefixed URLs keep working for the default language.
- **`prefix`**: every language is equal; `/` always leads to a prefixed home.
- **`prefix_and_default`**: you need `/en/...` and the unprefixed URLs both to work, for example while moving from one to the other. Unprefixed URLs are never redirected.
- **`no_prefix`**: apps behind a login, or one URL per page for every language. The locale comes from a cookie or `?locale=`. Search engines see one language per URL, so no `hreflang` alternates are emitted.

How the locale is picked for a URL, and when a visitor is redirected, is on [Locale detection](/guide/locale-detection).

## Generated routes

At build time every page gets the route records its strategy needs. Each record carries `meta.i18n = { name, locales }`: the page it shows and the locales it serves. Links, switches and redirects are all answered from those records, so a URL the module hands out is always one the router serves.

Locales that share the page's path share one record, `/:locale(de|fr)/about`. A locale with its own path gets its own record, named `localized-<page>-<locale>`:

```ts
// nuxt.config.ts: German has its own path for the about page
i18n: {
  globalLocaleRoutes: { about: { de: '/ueber-uns' } },
}
// prefix_except_default, locales en (default), de, fr:
// about                 /about
// localized-about       /:locale(fr)/about
// localized-about-de    /:locale(de)/ueber-uns
```

Custom paths, per-page locale lists and excluding a page from localization are on [Localized paths](/guide/custom-locale-routes) and [Page config](/guide/per-component-translations). The `localized-` prefix is [`localizedRouteNamePrefix`](/api/module-options#localizedroutenameprefix).

::: warning Route names are generated
Do not hard-code `localized-…` names in `router.push({ name })`. Pass the page's own name to `$localeRoute` or `<i18n-link>`; they pick the right record.
:::

## Linking to a page in a locale

```vue
<script setup lang="ts">
const { localePath, localeRoute, switchLocalePath } = useI18n()

localePath({ name: 'about' }) // '/de/ueber-uns' while the page is German
localePath({ name: 'about' }, 'en') // '/about'
localePath('/about', 'de') // '/de/ueber-uns': a path is read as the page it shows
localeRoute({ name: 'products-id', params: { id: '42' } }, 'de') // resolved route: name, params, fullPath
switchLocalePath('fr') // the current page in French
</script>

<template>
  <i18n-link :to="{ name: 'about' }">{{ $t('nav.about') }}</i18n-link>
  <NuxtLink :to="$switchLocalePath('de')">Deutsch</NuxtLink>
</template>
```

- Named routes and paths both work. A path is matched against the generated routes, so any locale's form of it is accepted.
- A locale that does not serve the page (see `locales` in [Page config](/guide/per-component-translations)) links to that locale's home instead of a missing page.
- Per-locale params (a translated slug) go through `$setI18nRouteParams`, see [Localized paths](/guide/custom-locale-routes).

Signatures are in [Methods](/api/methods).

## `no_prefix` details

- [`localeCookie`](/api/module-options#localecookie) defaults to `'user-locale'` under `no_prefix`, so the choice survives a reload.
- `$switchLocale('de')` loads the German dictionary and replaces the current history entry; the URL does not change.
- Custom per-locale paths still work: with `globalLocaleRoutes: { about: { de: '/ueber-uns' } }`, German readers get `/ueber-uns`. That URL always renders German, whatever the visitor prefers, and a page restricted to some locales renders in one of them. A path several locales share (`en` and `de` both on `/page/:id`) renders the preference when it is one of them. The preference itself stays: the next page returns to it.
- [`noPrefixRedirect: true`](/api/module-options#noprefixredirect) redirects a page's original path to the default locale's custom path (`/about` → `/about-us` when `en` has `/about-us`). Pages with params are not redirected.

## Apps without `pages/`

With `pages: false` there are no page routes to localize. Use root translation files only (`disablePageLocales: true`); detection, the cookie and `$switchLocale` still work. The `pages-false` variant of `test/fixtures/basic` in the repository is a working setup.

## Related

- Next: [Locale detection](/guide/locale-detection): which locale a visitor gets and when they are redirected
- [Localized paths](/guide/custom-locale-routes)
- [Excluding paths](/guide/excluding-static-files)
- [SEO](/guide/seo)
