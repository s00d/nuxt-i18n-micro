---
title: 'Getting started'
description: 'Install nuxt-i18n-micro, add two locales and render the first translated page with a language switcher.'
outline: [2, 3]
---

# Getting started

This page takes a Nuxt app from no i18n to a translated page with a language switcher. You need it once, at the start of a project. You end up with localized URLs (`/about`, `/de/about`), one JSON file per locale and page, and `$t` in your templates.

## Install

The module needs Nuxt 3.18 or newer (Nuxt 4 works too) and Node 20 or newer.

::: code-group

```bash [npm]
npm install nuxt-i18n-micro
```

```bash [pnpm]
pnpm add nuxt-i18n-micro
```

```bash [yarn]
yarn add nuxt-i18n-micro
```

```bash [bun]
bun add nuxt-i18n-micro
```

:::

## Configure the locales

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', displayName: 'English' },
      { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
      { code: 'fr', iso: 'fr-FR', displayName: 'Français' },
    ],
    defaultLocale: 'en',
  },
})
```

That is all the configuration a first app needs. The defaults give you:

- `strategy: 'prefix_except_default'`: the default locale has no prefix (`/about`), the others do (`/de/about`). See [Routing strategies](/guide/strategy).
- `translationDir: 'locales'`: translation files live in `locales/` at the project root, also with the Nuxt 4 `app/` layout.
- `meta: true`: `hreflang`, canonical and `og:locale` tags, plus `lang` and `dir` on `<html>`. See [SEO](/guide/seo).
- A visitor who opens `/` is sent to the language their browser asks for (`Accept-Language`). See [Locale detection](/guide/locale-detection).

`iso` is the language tag used in SEO tags; `code` is what appears in the URL. Every option is listed in [Module options](/api/module-options).

## Add translation files

Start the dev server with `nuxt dev`. When Nuxt resolves the pages, the module creates an empty `{}` file for every locale and page that has none (turn this off with [`disableWatcher`](/api/module-options#disablewatcher)):

```tree
locales/
├── en.json            # root: keys every page can use
├── de.json
├── fr.json
└── pages/
    ├── index/         # pages/index.vue
    │   ├── en.json
    │   ├── de.json
    │   └── fr.json
    └── about/         # pages/about.vue
        ├── en.json
        ├── de.json
        └── fr.json
```

Fill in the root file and a page file:

```json
// locales/en.json
{ "nav": { "home": "Home", "about": "About" } }
```

```json
// locales/pages/index/en.json
{ "welcome": "Welcome, {name}!", "items": "no items | one item | {count} items" }
```

A page sees the root keys and its own keys; its own file wins on a clash. Folder names follow the route name (`pages/articles/[id].vue` is `locales/pages/articles-id/`). [Translation files](/guide/translations) covers the layout, fallbacks and loading.

## Use `$t` on a page

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
const { t, tc, getLocale } = useI18n()

const title = t('nav.home') // 'Home'
</script>

<template>
  <h1>{{ $t('welcome', { name: 'Ada' }) }}</h1>
  <!-- Welcome, Ada! -->
  <p>{{ $tc('items', 3) }}</p>
  <!-- 3 items -->
  <p>{{ getLocale() }}</p>
  <!-- en -->
</template>
```

- In templates every helper is available with a `$` (`$t`, `$tc`, `$localePath`, …).
- In `<script setup>`, `useI18n()` returns the same helpers, with and without the `$` (`t` and `$t` are one function). It is auto-imported.
- `{name}` placeholders are filled from the params object. Plural forms are separated by `|`; the count picks the form (0, 1, then the last one for everything above).

All helpers are listed in [Methods](/api/methods).

## Link between pages and switch locale

```vue
<!-- components/AppHeader.vue -->
<template>
  <nav>
    <i18n-link :to="{ name: 'index' }">{{ $t('nav.home') }}</i18n-link>
    <i18n-link :to="{ name: 'about' }">{{ $t('nav.about') }}</i18n-link>
    <i18n-switcher />
  </nav>
</template>
```

- [`<i18n-link>`](/components/i18n-link) is a `NuxtLink` that points at the page in the current locale: on `/de` the about link goes to `/de/about`.
- [`<i18n-switcher>`](/components/i18n-switcher) is a dropdown of the enabled locales; it keeps the visitor on the same page.
- For your own buttons call `$switchLocale('de')`, which navigates to the current page in German and remembers the choice. For a plain `NuxtLink`, use `$localePath({ name: 'about' })` or `$switchLocalePath('de')`.

## Check it

Run `nuxt dev` and open:

| URL | Shows |
| --- | --- |
| `/` | English home (or a redirect to `/de` when your browser prefers German) |
| `/de` | German home |
| `/de/about` | German about page |
| `/en/about` | 404: the default locale has no prefix under `prefix_except_default` |

Edits to the JSON files apply in the open page without a reload.

## Related

- Next: [Translation files](/guide/translations): where keys live, fallbacks, how a page's dictionary loads
- [Routing strategies](/guide/strategy)
- [Locale detection](/guide/locale-detection)
- Coming from another module: [Migrating from @nuxtjs/i18n](/guide/migration) · [Upgrading](/guide/upgrade)
