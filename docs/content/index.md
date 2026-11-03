---
title: Nuxt I18n Micro
description: Small, fast i18n for Nuxt — JSON translations per page, build-time localized routes, SEO tags out of the box.
navigation: false
---

::code-group
```bash [pnpm]
pnpm add nuxt-i18n-micro
```

```bash [npm]
npm install nuxt-i18n-micro
```

```bash [yarn]
yarn add nuxt-i18n-micro
```

```bash [bun]
bun add nuxt-i18n-micro
```
::

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE' },
    ],
    defaultLocale: 'en',
  },
})
```
