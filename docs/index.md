---
layout: home

hero:
  name: "Nuxt I18n Micro"
  text: "Fast, Simple, and Lightweight Internationalization for Nuxt"
  tagline: Optimize your Nuxt app with a powerful and efficient i18n solution.
  actions:
    - theme: brand
      text: 🚀 Get Started
      link: /guide/getting-started
    - theme: alt
      text: ⭐ View on GitHub
      link: https://github.com/s00d/nuxt-i18n-micro

features:
  - title: ⚡ High Performance
    details: 🚀 Significant reductions in build times, memory usage, and server load, making it ideal for large-scale projects.
  - title: 🪶 Compact and Lightweight
    details: 🧩 Designed for efficiency, reducing the total bundle size by up to 96% compared to traditional i18n modules.
  - title: 🎨 Minimalist Design
    details: 🧱 A simple structure with just 5 components, easy to extend and maintain.
  - title: 🔄 Strategy-Based Routing
    details: 🗺️ Locale prefix strategies (no_prefix, prefix, prefix_except_default, prefix_and_default) via @i18n-micro/route-strategy (build-time) and @i18n-micro/path-strategy (runtime) extend Nuxt pages with the right localized routes.
  - title: 📂 Streamlined Translation Loading
    details: 🔧 Supports only JSON files, with auto-generated page-specific translations.
  - title: 🌐 Seamless Nuxt Integration
    details: 🛠️ Seamless integration with Nuxt.js, making it easy to add powerful i18n features to your application.
---

## Documentation map

| Area              | Start here                                                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Nuxt module**   | [Getting started](/guide/getting-started) · [Using translations](/guide/using) · [Folder structure](/guide/folder-structure)     |
| **Routing & SEO** | [Strategy](/guide/strategy) · [SEO](/guide/seo)                                                                                  |
| **API**           | [Methods](/api/methods) · [Cache & storage](/api/i18n-cache-api)                                                                 |
| **Other topics**  | [Examples](/examples) · [Migration](/guide/migration) · [Upgrade to v3](/guide/v3-upgrade) · [Contribution](/guide/contribution) |

**Framework packages** (Vue, React, Solid, Preact, Astro, Node, …): [Integrations overview](/integrations/).

**Performance**: benchmarks and methodology are kept in one place — [Performance](/guide/performance) and [Performance test results](/guide/performance-results) — so numbers stay consistent across the site.

Translations live in JSON under your `translationDir` (default `locales/`): root files for shared copy, `locales/pages/...` for route-specific messages, merged at build time for fast SSR and caching.
