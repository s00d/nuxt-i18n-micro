---
title: Page config
description: Restrict a page to some locales, give it custom paths, inline translations or no SEO tags with $defineI18nRoute.
outline: [2, 3]
---

# Page config

`$defineI18nRoute` sets i18n options for one page from inside the page itself. Use it when a page exists only in some locales, needs its own localized path, carries a few translations of its own, or must not get hreflang/canonical tags. The module reads the call at build time and bakes it into the generated routes.

## Restrict a page to some locales

```vue
<!-- pages/product/index.vue -->
<script setup lang="ts">
const { $defineI18nRoute } = useNuxtApp()

$defineI18nRoute({
  locales: ['en', 'de'],
})
</script>
```

Only `/en/product` and `/de/product` are generated; the page has no route in any other locale. The same can be set from `nuxt.config.ts` with [`routeLocales`](/api/module-options#routelocales).

`$defineI18nRoute` is a Nuxt app injection, not a compiler macro: always take it from `useNuxtApp()` and call it with the `$`. Only `$defineI18nRoute(` is recognized by the build step.

## Add inline translations

Pass an object instead of an array. Its keys are the allowed locales, its values are merged into the page's dictionary for the active locale.

```vue
<script setup lang="ts">
const { $defineI18nRoute } = useNuxtApp()

$defineI18nRoute({
  locales: {
    en: { greeting: 'Hello' },
    de: { greeting: 'Hallo' },
    fr: {}, // allowed, no inline keys
  },
})
</script>

<template>
  <h1>{{ $t('greeting') }}</h1>
</template>
```

Inline translations ship inside the page component for every locale. Prefer [page translation files](/guide/translations) for anything larger than a few keys; keep inline keys for self-contained pages and components.

## Set localized paths

```ts
$defineI18nRoute({
  locales: ['en', 'de'],
  localeRoutes: {
    en: '/welcome',
    de: '/willkommen',
  },
})
```

With `prefix_except_default` and `defaultLocale: 'en'` this produces `/welcome` and `/de/willkommen`. A `path` inside an inline locale object does the same: `locales: { de: { path: '/willkommen' } }`. Dynamic params, nested routes and the config-level alternative are covered in [Localized paths](/guide/custom-locale-routes).

## Turn off SEO tags

```ts
$defineI18nRoute({
  disableMeta: true, // no hreflang, canonical or og:locale tags on this page
})

$defineI18nRoute({
  disableMeta: ['de'], // only the de version has no tags
})
```

The config-level alternative is [`routeDisableMeta`](/api/module-options#routedisablemeta). What the tags are is on the [SEO](/guide/seo) page.

## What the build can read

The build step finds the call in each page file and evaluates its argument without running your app. It works when the config is:

- a literal object (strings, arrays, nested objects, template literals, ternaries on `process.env.NODE_ENV`);
- built from constants declared in the same `<script setup>` (`const locales = ['en', 'de']`, spreads included);
- an array of objects with a `code` field (`[{ code: 'en' }, { code: 'de' }]`).

It cannot read values imported from another module, or anything that needs your app at runtime (composables, `await`, fetched data). In that case the build logs `Ignored the $defineI18nRoute() config in <file>` and the page keeps the default locales and routes.

At runtime the call only merges the inline translations for the current locale and re-merges them when the locale changes. `locales`, `localeRoutes` and `disableMeta` take effect only through the build, so changing them needs a rebuild (the dev server rebuilds on save).

## Related

- [Localized paths](/guide/custom-locale-routes)
- [Translation files](/guide/translations)
- [SEO](/guide/seo)
- [`$defineI18nRoute` reference](/api/methods)
