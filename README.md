# Nuxt I18n Micro

[![npm version][npm-version-src]][npm-version-href]  
[![npm downloads][npm-downloads-src]][npm-downloads-href]  
[![License][license-src]][license-href]  
[![Nuxt][nuxt-src]][nuxt-href]

`Nuxt I18n Micro` is a lightweight Nuxt module for handling internationalization (i18n) with support for multiple locales, dynamic translations, and SEO optimization. This module was developed to address significant performance issues found in the original `nuxt-i18n` module, particularly in environments where large translation files and high traffic are involved.

## Why Nuxt I18n Micro?

The original `nuxt-i18n` module is known to have several critical issues:
- **High Memory Consumption**: The module consumes a large amount of memory during build and runtime, leading to performance bottlenecks.
- **Slow Performance**: Especially with large translation files, the original module causes a significant slowdown in both build times and server response times.
- **Large Bundle Size**: The module generates a substantially large bundle size, which can negatively impact the performance of your application.
- **Memory Leaks and Bugs**: There are known memory leaks and bugs that can cause the module to behave unpredictably, especially under heavy load.

Here is the updated section with the percentage differences highlighted:

### Performance Comparison

To demonstrate the efficiency of `Nuxt I18n Micro`, we conducted performance tests under identical conditions. Both modules were tested with a 10MB translation file on the same hardware.

#### Build Time and Resource Consumption

**Nuxt I18n**:
- **Total size**: 54.7 MB (3.29 MB gzip)
- **Max CPU Usage**: 394.0%
- **Max Memory Usage**: 8746 MB
- **Elapsed Time**: 0h 1m 30s

**Nuxt I18n Micro**:
- **Total size**: 22.4 MB (2.9 MB gzip) — **59% smaller**
- **Max CPU Usage**: 305.3% — **23% lower**
- **Max Memory Usage**: 3247 MB — **63% less memory**
- **Elapsed Time**: 0h 0m 17s — **81% faster**

#### Server Performance (10k Requests)

**Nuxt I18n**:
- **Requests per second**: 49.05 [#/sec] (mean)
- **Time per request**: 611.599 ms (mean)
- **Max Memory Usage**: 703.73 MB

**Nuxt I18n Micro**:
- **Requests per second**: 61.18 [#/sec] (mean) — **25% more requests per second**
- **Time per request**: 490.379 ms (mean) — **20% faster**
- **Max Memory Usage**: 323.00 MB — **54% less memory usage**

These tests clearly show that `Nuxt I18n Micro` outperforms the original module in every aspect: faster build times, lower memory usage, and better runtime performance.

## Features

- 🌐 &nbsp;Flexible locale management with `code`, `iso`, and `dir` attributes.
- 🔄 &nbsp;Dynamic translation loading based on routes and locales.
- 🛠 &nbsp;SEO optimization with automatic `meta` tags and `alternate` links.
- ⚡ &nbsp;Lightweight and easy to integrate into existing Nuxt projects.

## Quick Setup

Install the module in your Nuxt application with one command:

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

That's it! You can now use Nuxt I18n Micro in your Nuxt app ✨

## Contribution

<details>
  <summary>Local development</summary>

  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-i18n-micro/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-i18n-micro

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-i18n-micro.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/nuxt-i18n-micro

[license-src]: https://img.shields.io/npm/l/nuxt-i18n-micro.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-i18n-micro

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com

---

For more details and updates, visit the [Nuxt I18n Micro GitHub repository](https://github.com/s00d/nuxt-i18n-micro).
