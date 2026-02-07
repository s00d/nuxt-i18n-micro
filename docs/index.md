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

To showcase the efficiency of `Nuxt I18n Micro`, we conducted tests under identical conditions. Both modules were tested with a **10MB translation file** on the same hardware. We also include a **plain-nuxt** baseline (no i18n) to measure the real overhead.

#### ⏱️ Build Time and Resource Consumption

> **Note:** The `plain-nuxt` baseline is a minimal implementation created solely for benchmarking purposes. It loads data directly from JSON files without any i18n logic. Real-world applications will have more complexity and higher resource usage.

::: details **plain-nuxt** (baseline)
- **Build Time**: 4.48 seconds
- **Max CPU Usage**: 242.60%
- **Max Memory Usage**: 609.55 MB
:::

::: details **Nuxt I18n v10**
- **Build Time**: 77.81 seconds
- **Max CPU Usage**: 449.00%
- **Max Memory Usage**: 9494.69 MB
:::

::: tip **Nuxt I18n Micro**
- **Build Time**: 7.88 seconds — **90% faster than i18n v10**
- **Max CPU Usage**: 336.00% — **25% lower than i18n v10**
- **Max Memory Usage**: 1164.02 MB — **88% less memory than i18n v10**
:::

#### 🌐 Server Performance (Stress Test)

::: details **plain-nuxt** (baseline)
- **Requests per Second**: 318 RPS
- **Average Response Time**: 106.50 ms
- **Max Memory Usage**: 229.02 MB
:::

::: details **Nuxt I18n v10**
- **Requests per Second**: 51 RPS
- **Average Response Time**: 1130.20 ms
- **Max Memory Usage**: 1050.38 MB
:::

::: tip **Nuxt I18n Micro**
- **Requests per Second**: 225 RPS — **4.4x more than i18n v10**
- **Average Response Time**: 516.70 ms — **54% faster than i18n v10**
- **Max Memory Usage**: 366.69 MB — **65% less memory than i18n v10**
:::

These results clearly demonstrate that `Nuxt I18n Micro` significantly outperforms the original module in every critical area while staying close to the plain Nuxt baseline.

## 🔑 Key Features

- 🌐 **Compact Yet Powerful**: Despite its small size, `Nuxt I18n Micro` is designed for **large-scale projects**, focusing on performance and efficiency.
- ⚡ **Optimized Build and Runtime**: Reduces build times, memory usage, and server load, making it ideal for **high-traffic applications**.
- 🛠️ **Minimalist Design**: The module is structured around just **5 components** (1 module and 4 plugins), making it easy to understand, extend, and maintain.
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

```plaintext
  /locales
  ├── /pages
  │   ├── /index
  │   │   ├── en.json
  │   │   ├── fr.json
  │   │   └── ar.json
  │   ├── /about
  │   │   ├── en.json
  │   │   ├── fr.json
  │   │   └── ar.json
  ├── en.json
  ├── fr.json
  └── ar.json
```
