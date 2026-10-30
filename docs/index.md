---
titleTemplate: false
title: 'Nuxt I18n Micro'
description: 'Small, fast i18n for Nuxt: JSON translations per page, build-time localized routes, SEO tags out of the box.'
layout: home

hero:
  name: 'Nuxt I18n Micro'
  text: 'Small, fast i18n for Nuxt'
  tagline: JSON translations loaded per page, localized routes generated at build time, SEO tags without extra code.
  image:
    src: /logo.svg
    alt: Nuxt I18n Micro logo
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Frameworks
      link: /integrations/
    - theme: alt
      text: GitHub
      link: https://github.com/s00d/nuxt-i18n-micro

features:
  - title: Per-page translations
    icon:
      src: /icons/translations.svg
      width: 22
      height: 22
    details: Each page loads one JSON dictionary (shared root keys plus its own), off the HTML payload. Missing files are created for you.
    link: /guide/translations
  - title: Build-time routing
    icon:
      src: /icons/routing.svg
      width: 22
      height: 22
    details: Four routing strategies, custom paths per locale, redirects and 404s decided by one route model the router actually serves.
    link: /guide/strategy
  - title: SEO included
    icon:
      src: /icons/seo.svg
      width: 22
      height: 22
    details: Canonical URLs, html lang/dir, hreflang alternates under the prefix strategies, and og:locale for locales with an iso or og value.
    link: /guide/seo
---

## Install

```bash
npm install nuxt-i18n-micro
```

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
  },
})
```

Next: [Getting started](/guide/getting-started) walks through the first translated page.

Not on Nuxt? The same translation core ships for Vue, React, Preact, Solid, Astro, Node and VitePress — see [Frameworks](/integrations/). Benchmarks against `@nuxtjs/i18n` are in the [benchmark report](/guide/performance-results).
