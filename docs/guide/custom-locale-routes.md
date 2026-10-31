---
title: Localized paths
description: Give a page a different URL per locale with localeRoutes or globalLocaleRoutes, including dynamic params and per-locale slugs.
outline: [2, 3]
---

# Localized paths

By default every locale serves a page at the same path: `/en/about`, `/de/about`. Localized paths let each locale use its own words, such as `/de/ueber-uns`, while the page file stays the same. You set them in the page with `$defineI18nRoute`, or for many pages at once in `nuxt.config.ts`.

## In the page

```vue
<!-- pages/about.vue -->
<script setup lang="ts">
const { $defineI18nRoute } = useNuxtApp()

$defineI18nRoute({
  localeRoutes: {
    de: '/ueber-uns',
    fr: '/a-propos',
  },
})
</script>
```

With `prefix_except_default` and `defaultLocale: 'en'` the page answers at `/about`, `/de/ueber-uns` and `/fr/a-propos`. A locale without an entry keeps the default path. Write paths without the locale code: the prefix is added by the [strategy](/guide/strategy), and a path that starts with the locale code logs a warning. What else the call accepts is on [Page config](/guide/per-component-translations).

## In nuxt.config

[`globalLocaleRoutes`](/api/module-options#globallocaleroutes) does the same for any page, keyed by its path (or by its route name, when written without a leading slash):

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
    globalLocaleRoutes: {
      '/about': { de: '/ueber-uns' },
      '/about/team': { de: '/ueber-uns/team' },
      '/admin': false, // not localized: one /admin route, no locale prefix
    },
  },
})
```

When a page sets `localeRoutes` and `globalLocaleRoutes` has the same key, the config entry wins.

## Dynamic params

Write params in any Nuxt form: `[id]`, `[[page]]`, `[...slug]`, or `:id()`. The param names must match the page file.

```ts
// pages/products/[...slug].vue
$defineI18nRoute({
  localeRoutes: {
    en: '/our-products/[...slug]',
    de: '/unsere-produkte/[...slug]',
  },
})
```

Nested pages take an absolute child path (`/ueber-uns/team`) or a path relative to the parent's localized path (`team`).

## Linking to localized pages

Links resolve to the localized path of the target locale, whether you pass a route name or a plain path:

```vue
<template>
  <i18n-link :to="{ name: 'about' }">About</i18n-link>
  <i18n-link to="/about">About</i18n-link>
  <!-- de: both render /de/ueber-uns -->
  <NuxtLink :to="$localePath('/about', 'de')">Deutsch</NuxtLink>
</template>
```

Route names come from the file path (`pages/about/team.vue` is `about-team`) unless you set one with `definePageMeta({ name })`.

## Per-locale slugs

When the slug itself differs per locale (`/our-products/red-shoe` vs `/de/unsere-produkte/roter-schuh`), tell the language switcher which params to use with `$setI18nRouteParams` once the data is loaded:

```vue
<script setup lang="ts">
const { $setI18nRouteParams } = useNuxtApp()
const route = useRoute()

const { data: product } = await useFetch(`/api/products/${route.params.slug}`)

if (product.value) {
  $setI18nRouteParams({
    en: { slug: product.value.slugEn },
    de: { slug: product.value.slugDe },
  })
}
</script>
```

`$switchLocalePath('de')` and `<i18n-switcher>` then link to `/de/unsere-produkte/roter-schuh`. Keys are locale codes, values are params by name (as in the page file).

A switcher in the layout renders before the page's async setup gets here, so when the render ends the module rewrites the links of `<i18n-switcher>`, in `app.vue` and in the page alike. The server HTML, a visitor without JavaScript and the first client render then agree. Set the params during SSR for this: with `lazy` or `server: false` the links change only after hydration. Nuxt's SSR streaming sends the HTML before the params are known, so under it the links in the first HTML keep the URL's own params.

Only the switcher's own links are rewritten. A hand-written `$switchLocalePath` link must render after the params are set, so put it in the page that sets them, also after an `await`. In a layout it renders first: its server HTML keeps the URL's params, and hydration warns about a mismatch. Use `<i18n-switcher>` there, with its slots and `custom*Style` props for the look.

The params belong to the page that set them:

- They are dropped when a navigation to another path commits, so each page sets its own. A cancelled navigation leaves them in place.
- Take `$setI18nRouteParams` from `useNuxtApp()` or `useI18n()` in `setup`, also when you call it later in a `useAsyncData` handler. Taken there, the function knows its page: if the visitor has left, a late call does nothing.
- With `keepalive`, a page gets the params it set back when the visitor returns. `useI18nHead` does the same.

## Routes added in pages:extend

Routes you push in the `pages:extend` hook have no page file to read `$defineI18nRoute` from, and several of them often share one wrapper component. A route pushed without a `name` gets the name Nuxt would give its path (`/a/:id()` becomes `a-id`), so language links reach it, unless another route already has that name; then give it an explicit `name`. Keep one list and split it into pages and `globalLocaleRoutes` keyed by route name with `splitLocaleRoutes` from `@i18n-micro/utils/split-locale-routes` (add the package to your dependencies):

```ts
// nuxt.config.ts
import { splitLocaleRoutes } from '@i18n-micro/utils/split-locale-routes'

const dynamic = splitLocaleRoutes([
  { name: 'products-tag', path: '/products/:tag', file: '~/pages/_dynamic.vue', paths: { de: '/produkte/:tag' } },
  { name: 'internal', path: '/internal', file: '~/pages/_dynamic.vue', paths: false }, // not localized
])

export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  hooks: {
    'pages:extend'(pages) {
      pages.push(...dynamic.pages)
    },
  },
  i18n: {
    globalLocaleRoutes: dynamic.globalLocaleRoutes,
  },
})
```

Do not put localized paths in `route.meta`: they would ship in the client route table.

## Related

- [Page config](/guide/per-component-translations)
- [Routing strategies](/guide/strategy)
- [`$localePath` and `$switchLocalePath`](/api/methods)
- [SEO](/guide/seo)
