---
title: 'Migrating from @nuxtjs/i18n'
description: 'Map @nuxtjs/i18n options, composables and translation files to nuxt-i18n-micro.'
outline: [2, 3]
---

# Migrating from @nuxtjs/i18n

This page maps a `@nuxtjs/i18n` app onto nuxt-i18n-micro: options, helpers and file layout. Use it when you swap the module in an existing app. You keep your URLs (the strategy names are the same) and move translations into JSON files per page.

::: tip Upgrading nuxt-i18n-micro itself?
See [Upgrading](/guide/upgrade).
:::

## Swap the module

```bash
npm uninstall @nuxtjs/i18n
npm install nuxt-i18n-micro
```

```ts
// nuxt.config.ts — before
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'en', language: 'en-US', file: 'en.json' },
      { code: 'de', language: 'de-DE', file: 'de.json' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    langDir: 'locales',
    detectBrowserLanguage: { useCookie: true, cookieKey: 'i18n_redirected', redirectOn: 'root' },
  },
})
```

```ts
// nuxt.config.ts — after
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    translationDir: 'locales',
    localeCookie: 'i18n_redirected',
    autoDetectPath: '/',
  },
})
```

## Options

| `@nuxtjs/i18n` | nuxt-i18n-micro |
| --- | --- |
| `locales[].code` | `locales[].code` |
| `locales[].language` (`iso` before v9) | `locales[].iso` |
| `locales[].name` | `locales[].displayName` |
| `locales[].dir` | `locales[].dir` |
| `locales[].domain` | `locales[].baseUrl` (+ `baseDefault`) |
| `locales[].file` / `files`, `langDir`, `lazy` | `translationDir`; files are found by name and always loaded per page |
| `defaultLocale`, `strategy` | same names, same four values |
| `baseUrl` | `metaBaseUrl` |
| `customRoutes: 'config'` + `pages` | `globalLocaleRoutes` |
| `detectBrowserLanguage: false` | `redirects: false` (no redirects) or `autoDetectLanguage: false` (ignore the header) |
| `detectBrowserLanguage.useCookie` / `cookieKey` | `localeCookie: '<name>'` (`null` turns the cookie off) |
| `detectBrowserLanguage.redirectOn: 'root'` | `autoDetectPath: '/'` (default) |
| `detectBrowserLanguage.redirectOn: 'no prefix'` | `autoDetectPath: 'no_prefix'` |
| `detectBrowserLanguage.redirectOn: 'all'` | `autoDetectPath: '*'` |
| `vueI18n` config file (`fallbackLocale`, `numberFormats`, `datetimeFormats`) | `fallbackLocale`, `numberFormats`, `datetimeFormats` in `i18n` |

There is no `alwaysRedirect`: with a cookie set, `/` follows it on every visit. The full list is [Module options](/api/module-options); detection rules are on [Locale detection](/guide/locale-detection).

## Helpers and composables

| `@nuxtjs/i18n` / vue-i18n | nuxt-i18n-micro (template / `useI18n()`) |
| --- | --- |
| `const { t } = useI18n()` | `const { t } = useI18n()`, `$t` in templates |
| `t('key', count)`, `tc` | `$tc('key', count)` |
| `te('key')` | `$has('key')` |
| `n(value, 'currency')`, `d(date, 'short')` | `$tn(value, 'currency')`, `$td(date, 'short')` |
| — | `$tdr(date)`: relative time ("in 3 days") |
| `locale.value` | `$getLocale()` |
| `locales.value` | `$getLocales()` |
| `setLocale('de')` | `$switchLocale('de')` |
| `useLocalePath()('about')` | `$localePath({ name: 'about' })` |
| `useLocaleRoute()` | `$localeRoute()` |
| `useSwitchLocalePath()('de')` | `$switchLocalePath('de')` |
| `useSetI18nParams()` | `$setI18nRouteParams()` |
| `useLocaleHead()` | automatic with `meta: true`; [`useLocaleHead`](/composables/useLocaleHead) for custom heads |
| `defineI18nRoute({ paths: { de: '/ueber-uns' }, locales: [...] })` | `$defineI18nRoute({ localeRoutes: { de: '/ueber-uns' }, locales: [...] })` |
| `<NuxtLinkLocale to="about">` | `<i18n-link :to="{ name: 'about' }">` |
| `<i18n-t>` | `<i18n-t>` (slots fill `{name}` placeholders) |
| `$i18n` in server routes | `useTranslationServerMiddleware(event)`, see [Server routes and API](/guide/server-side-translations) |

`useI18n()` is auto-imported. `$defineI18nRoute` must keep its `$`: the build reads that call. All helpers: [Methods](/api/methods).

## Translation files

Move the keys of one big file per locale into a root file plus one file per page:

```tree
locales/
├── en.json              # keys used on many pages (nav, footer)
├── de.json
└── pages/
    ├── index/en.json    # keys of pages/index.vue
    └── about/en.json    # keys of pages/about.vue
```

Keeping everything in the root files works too, and is the quickest first step. Set `disablePageLocales: true` until you split them. See [Translation files](/guide/translations).

### Message syntax

| vue-i18n | nuxt-i18n-micro |
| --- | --- |
| `{name}` named interpolation | same |
| `car \| cars` (2 forms: 1 → first) | forms are picked by count from 0: write `no cars \| one car \| {count} cars` |
| `@:other.key` linked messages | not supported: repeat the text or compose in code |
| `@.upper:` modifiers | not supported: format in code or use `<i18n-t>` |
| `{'@'}` literal escapes | not needed: only `{word}` tokens are replaced |
| JS/TS message files | JSON only |

The plural rule is replaceable with the [`plural`](/api/module-options#plural) option.

## Check after the switch

- Every URL you had still resolves; the strategy names match, custom paths move to `globalLocaleRoutes` or `$defineI18nRoute`.
- `hreflang`, canonical and `og:locale` come out of the box with `meta: true`; remove hand-written ones.
- A JSON parse error logs the file path; a missing key logs a warning in the browser console in dev.

## Related

- Next: [Upgrading](/guide/upgrade)
- [Translation files](/guide/translations)
- [Routing strategies](/guide/strategy)
- [Locale detection](/guide/locale-detection)
