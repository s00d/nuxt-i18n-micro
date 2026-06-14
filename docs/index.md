---
titleTemplate: false
title: "Nuxt I18n Micro"
description: "Fast, lightweight i18n for Nuxt with strategy-based routing."
layout: home

hero:
  name: "Nuxt I18n Micro"
  text: "Fast, Simple, and Lightweight Internationalization for Nuxt"
  tagline: Optimize your Nuxt app with a powerful and efficient i18n solution.
  image:
    src: /logo.svg
    alt: Nuxt I18n Micro logo
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
    details: 🧱 A lean module core with a small set of runtime plugins, easy to extend and maintain.
  - title: 🔄 Strategy-Based Routing
    details: 🗺️ Locale prefix strategies (no_prefix, prefix, prefix_except_default, prefix_and_default) via @i18n-micro/route-strategy (build-time) and @i18n-micro/path-strategy (runtime) extend Nuxt pages with the right localized routes.
  - title: 📂 Streamlined Translation Loading
    details: 🔧 Supports only JSON files, with auto-generated page-specific translations.
  - title: 🌐 Seamless Nuxt Integration
    details: 🛠️ Seamless integration with Nuxt.js, making it easy to add powerful i18n features to your application.
---

## ✨ Introduction

`Nuxt I18n Micro` is a fast, simple, and lightweight internationalization (i18n) module for Nuxt. Despite its compact size, it's designed with **large projects** in mind, offering significant performance improvements over traditional i18n solutions like `nuxt-i18n`. The module was built from the ground up to be highly efficient, focusing on minimizing build times, reducing server load, and shrinking bundle sizes.

## 📝 Why Nuxt I18n Micro?

The `Nuxt I18n Micro` module was created to address critical performance issues found in the original `nuxt-i18n` module, particularly in **high-traffic environments** and projects with **large translation files**. Key issues with `nuxt-i18n` include:

- 🚨 **High Memory Consumption**: Consumes significant memory during both build and runtime, leading to performance bottlenecks.
- 🐢 **Slow Performance**: Especially with large translation files, it causes noticeable slowdowns in build times and server response.
- 💼 **Large Bundle Size**: Generates a large bundle, negatively impacting application performance.
- 🐛 **Memory Leaks and Bugs**: Known for memory leaks and unpredictable behavior under heavy load.

### 🏁 Performance Comparison

To showcase the efficiency of `Nuxt I18n Micro`, we conducted tests under identical conditions on the fixtures in [`test/performance.test.ts`](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/performance.test.ts). See the [full benchmark report](/guide/performance-results) for methodology, charts, and raw numbers.

#### ⏱️ Build Time and Resource Consumption

> **Note:** The `plain-nuxt` baseline is a minimal implementation created solely for benchmarking purposes. It loads data directly from JSON files without any i18n logic. Real-world applications will have more complexity and higher resource usage.

::: details **plain-nuxt** (baseline)
- **Build Time**: 6.50 seconds
- **Max CPU Usage**: 195.10%
- **Max Memory Usage**: 744.58 MB
:::

::: details **Nuxt I18n v10**
- **Build Time**: 82.26 seconds
- **Max CPU Usage**: 419.20%
- **Max Memory Usage**: 9,117.41 MB
:::

::: tip **Nuxt I18n Micro**
- **Build Time**: 14.95 seconds — **82% faster than i18n v10**
- **Max CPU Usage**: 243.00% — **42% lower than i18n v10**
- **Max Memory Usage**: 1,174.55 MB — **87% less memory than i18n v10**
:::

#### 🌐 Server Performance (Stress Test)

::: details **plain-nuxt** (baseline)
- **Requests per Second**: 274 RPS (Artillery)
- **Average Response Time**: 453.20 ms
- **Max Memory Usage**: 324.30 MB
:::

::: details **Nuxt I18n v10**
- **Requests per Second**: 51 RPS (Artillery)
- **Average Response Time**: 1,177.10 ms
- **Max Memory Usage**: 1,094.72 MB
:::

::: tip **Nuxt I18n Micro**
- **Requests per Second**: 278 RPS (Artillery) — **5.4x more than i18n v10**
- **Average Response Time**: 437.20 ms — **63% faster than i18n v10**
- **Max Memory Usage**: 274.70 MB — **75% less memory than i18n v10**
:::

These results clearly demonstrate that `Nuxt I18n Micro` significantly outperforms the original module in every critical area while staying close to the plain Nuxt baseline.

## 🔑 Key Features

- 🌐 **Compact Yet Powerful**: Despite its small size, `Nuxt I18n Micro` is designed for **large-scale projects**, focusing on performance and efficiency.
- ⚡ **Optimized Build and Runtime**: Reduces build times, memory usage, and server load, making it ideal for **high-traffic applications**.
- 🛠️ **Minimalist Design**: The module core is a single Nuxt module plus a small set of runtime plugins, making it easy to understand, extend, and maintain.
- 📏 **Strategy-Based Routing**: Uses `@i18n-micro/route-strategy` (build-time) and `@i18n-micro/path-strategy` (runtime) to extend Nuxt pages with localized routes according to the chosen strategy (prefix, no_prefix, etc.), so each page gets the correct locale variants without manual route duplication.
- 🗂 **Streamlined Translation Loading**: Only **JSON files** are supported, with translations split between a global file for common texts (e.g., menus) and page-specific files, which are auto-generated in the `dev` mode if not present.

## ⚙️ Quick Setup

Install the module in your Nuxt application with:

```bash
npm install nuxt-i18n-micro
```

Then, add it to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    'nuxt-i18n-micro',
  ],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
      { code: 'ar', iso: 'ar-SA', dir: 'rtl' },
    ],
    defaultLocale: 'en',
    translationDir: 'locales',
    meta: true,
  },
})
```

That's it! You're now ready to use **Nuxt I18n Micro** in your Nuxt app.

## 🌍 Ecosystem Packages

Starting from v2.14+/v3.0.0, the i18n-micro ecosystem includes standalone packages for other frameworks and tools:

| Package | Description |
|---------|-------------|
| [`@i18n-micro/vue`](https://www.npmjs.com/package/@i18n-micro/vue) | Vue 3 integration (standalone, without Nuxt) |
| [`@i18n-micro/react`](https://www.npmjs.com/package/@i18n-micro/react) | React integration |
| [`@i18n-micro/solid`](https://www.npmjs.com/package/@i18n-micro/solid) | SolidJS integration |
| [`@i18n-micro/preact`](https://www.npmjs.com/package/@i18n-micro/preact) | Preact integration |
| [`@i18n-micro/astro`](https://www.npmjs.com/package/@i18n-micro/astro) | Astro integration |
| [`@i18n-micro/node`](https://www.npmjs.com/package/@i18n-micro/node) | Node.js server-side loader |
| [`@i18n-micro/core`](https://www.npmjs.com/package/@i18n-micro/core) | Core utilities (shared by all packages) |
| [`@i18n-micro/types`](https://www.npmjs.com/package/@i18n-micro/types) | TypeScript type definitions |
| [`@i18n-micro/types-generator`](https://www.npmjs.com/package/@i18n-micro/types-generator) | Auto-generate TypeScript types from translation files |
| [`@i18n-micro/test-utils`](https://www.npmjs.com/package/@i18n-micro/test-utils) | Testing utilities |

## 🗂 Folder Structure

Translations are organized into **global** and **page-specific** files:

```tree
locales/
├── pages/
│   ├── index/
│   │   ├── en.json
│   │   ├── fr.json
│   │   └── ar.json
│   ├── about/
│   │   ├── en.json
│   │   ├── fr.json
│   │   └── ar.json
├── en.json
├── fr.json
└── ar.json
```
