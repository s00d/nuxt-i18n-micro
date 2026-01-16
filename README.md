[![npm version](https://img.shields.io/npm/v/nuxt-i18n-micro/latest?style=for-the-badge)](https://www.npmjs.com/package/nuxt-i18n-micro)
[![npm downloads](https://img.shields.io/npm/dw/nuxt-i18n-micro?style=for-the-badge)](https://www.npmjs.com/package/nuxt-i18n-micro)
[![License](https://img.shields.io/npm/l/nuxt-i18n-micro?style=for-the-badge)](https://www.npmjs.com/package/nuxt-i18n-micro)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

<p align="center">
<img src="https://github.com/s00d/nuxt-i18n-micro/blob/main/branding/logo_full.png?raw=true" alt="logo">
</p>

# Nuxt I18n Micro

`Nuxt I18n Micro` is a fast, simple, and lightweight internationalization (i18n) module for Nuxt. Despite its compact size, it's designed with large projects in mind, offering significant performance improvements over traditional i18n solutions like `nuxt-i18n`. The module was built from the ground up to be highly efficient, focusing on minimizing build times, reducing server load, and shrinking bundle sizes.

## Why Nuxt I18n Micro?

The `Nuxt I18n Micro` module was created to address critical performance issues found in the original `nuxt-i18n` module, particularly in high-traffic environments and projects with large translation files. Key issues with `nuxt-i18n` include:

- **High Memory Consumption**: Consumes significant memory during both build and runtime, leading to performance bottlenecks.
- **Slow Performance**: Especially with large translation files, it causes noticeable slowdowns in build times and server response.
- **Large Bundle Size**: Generates a large bundle, negatively impacting application performance.
- **Memory Leaks and Bugs**: Known for memory leaks and unpredictable behavior under heavy load.

### Performance Comparison

To showcase the efficiency of `Nuxt I18n Micro`, we conducted tests under identical conditions. Both modules were tested with a 10MB translation file on the same hardware.

#### Build Time and Resource Consumption

- **i18n-micro**: 8.57 seconds, Max Memory: 1080.31 MB, Max CPU: 209.50%
- **i18n v10**: 100.20 seconds, Max Memory: 8827.23 MB, Max CPU: 321.40%
- **Time Difference**: -91.63 seconds
- **Memory Difference**: -7746.92 MB
- **CPU Usage Difference**: -111.90%


#### Comparison between i18n v10 and i18n-micro

- **Max Memory Used Difference**: -107.61 MB
- **Min Memory Used Difference**: -1.33 MB
- **Avg Memory Used Difference**: -14.33 MB
- **Max CPU Usage Difference**: -14.70%
- **Min CPU Usage Difference**: 0.00%
- **Avg CPU Usage Difference**: 3.76%
- **Stress Test Time Difference**: 0.00 seconds
- **Average Response Time Difference**: 1239.80 ms
- **Min Response Time Difference**: 112.00 ms
- **Max Response Time Difference**: -53.00 ms
- **Requests Per Second Difference**: 3.00
- **Error Rate Difference**: 0.00%

These results clearly demonstrate that `Nuxt I18n Micro` significantly outperforms the original module in every critical area.

## Key Features

- 🌐 **Compact Yet Powerful**: Despite its small size, `Nuxt I18n Micro` is designed for large-scale projects, focusing on performance and efficiency.
- ⚡ **Optimized Build and Runtime**: Reduces build times, memory usage, and server load, making it ideal for high-traffic applications.
- 🛠 **Unified Architecture**: Core translation logic is centralized in `NuxtI18n` class extending `BaseI18n` from `@i18n-micro/core`, enabling code reuse across framework integrations (Vue, React, Solid, Preact, Node.js, Astro).
- 📏 **Efficient Routing**: Generates only 2 routes regardless of the number of locales, thanks to dynamic regex-based routing, unlike other i18n modules that generate separate routes for each locale.
- 🗂 **Streamlined Translation Loading**: Only JSON files are supported, with translations split between a global file for common texts (e.g., menus) and page-specific files, which are auto-generated in the `dev` mode if not present.

## Quick Setup

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

That's it! You're now ready to use Nuxt I18n Micro in your Nuxt app.


[Docs](https://s00d.github.io/nuxt-i18n-micro/)

[Plugin Methods](https://s00d.github.io/nuxt-i18n-micro/api/methods)

[Performanc](https://s00d.github.io/nuxt-i18n-micro/guide/performance)

[Performance Test Results](https://s00d.github.io/nuxt-i18n-micro/guide/performance-results)

[Components](https://s00d.github.io/nuxt-i18n-micro/components/i18n-t)

[Layers](https://s00d.github.io/nuxt-i18n-micro/guide/layers)

[Seo](https://s00d.github.io/nuxt-i18n-micro/guide/seo)

[Migration](https://s00d.github.io/nuxt-i18n-micro/guide/migration)

[Contribution](https://s00d.github.io/nuxt-i18n-micro/guide/contribution)

