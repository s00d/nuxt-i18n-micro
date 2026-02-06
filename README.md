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

To showcase the efficiency of `Nuxt I18n Micro`, we conducted tests under identical conditions. Both modules were tested with a 10MB translation file on the same hardware. We also include a **plain-nuxt** baseline (no i18n module) to measure the real overhead.

#### Build Time and Resource Consumption

> **Note:** The `plain-nuxt` baseline is a minimal implementation created solely for benchmarking purposes. It loads data directly from JSON files without any i18n logic. Real-world applications will have more complexity and higher resource usage.

| Project | Build Time | Code Bundle | Max Memory | Max CPU |
|---------|------------|-------------|------------|---------|
| **plain-nuxt** (baseline) | 5.71s | 1.35 MB | 674 MB | 240% |
| **i18n-micro** | 23.47s | 1.5 MB | 1,658 MB | 208% |
| **i18n v10** | 84.91s | 19.24 MB | 9,528 MB | 439% |

> **Code Bundle** = JavaScript/CSS code only (excludes translation JSON files).
> i18n-micro stores translations as lazy-loaded JSON files, keeping the code bundle minimal.

- **i18n-micro vs baseline**: +17.76s build, +0.15 MB code, +984 MB memory
- **i18n v10 vs baseline**: +79.20s build, +17.89 MB code, +8,854 MB memory

#### Stress Test Results (Requests per Second)

| Project | Avg Response | RPS (Artillery) | Max Memory |
|---------|--------------|-----------------|------------|
| **plain-nuxt** | 544 ms | 228 | 340 MB |
| **i18n-micro** | 411 ms | 292 | 347 MB |
| **i18n v10** | 1,363 ms | 51 | 1,243 MB |

#### Comparison: i18n v10 vs i18n-micro

- **Code Bundle**: 17.74 MB smaller (i18n-micro: 1.5 MB vs i18n v10: 19.24 MB)
- **Build Time**: 61.44s faster (i18n-micro: 23.47s vs i18n v10: 84.91s)
- **Max Memory (build)**: 7,870 MB less (i18n-micro: 1,658 MB vs i18n v10: 9,528 MB)
- **Average Response Time**: 952 ms faster (i18n-micro: 411 ms vs i18n v10: 1,363 ms)
- **Requests Per Second**: 241 more (i18n-micro: 292 vs i18n v10: 51)

These results clearly demonstrate that `Nuxt I18n Micro` significantly outperforms the original module in every critical area while staying close to the plain Nuxt baseline.

## Key Features

- 🌐 **Compact Yet Powerful**: Despite its small size, `Nuxt I18n Micro` is designed for large-scale projects, focusing on performance and efficiency.
- ⚡ **Optimized Build and Runtime**: Reduces build times, memory usage, and server load, making it ideal for high-traffic applications.
- 🛠 **Minimalist Design**: The module is structured around just 5 components (1 module and 4 plugins), making it easy to understand, extend, and maintain.
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

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=s00d/nuxt-i18n-micro&type=date&legend=top-left)](https://www.star-history.com/#s00d/nuxt-i18n-micro&type=date&legend=top-left)


[Docs](https://s00d.github.io/nuxt-i18n-micro/)

[Plugin Methods](https://s00d.github.io/nuxt-i18n-micro/api/methods)

[Performance](https://s00d.github.io/nuxt-i18n-micro/guide/performance)

[Performance Test Results](https://s00d.github.io/nuxt-i18n-micro/guide/performance-results)

[Components](https://s00d.github.io/nuxt-i18n-micro/components/i18n-t)

[Layers](https://s00d.github.io/nuxt-i18n-micro/guide/layers)

[Seo](https://s00d.github.io/nuxt-i18n-micro/guide/seo)

[Migration](https://s00d.github.io/nuxt-i18n-micro/guide/migration)

[Contribution](https://s00d.github.io/nuxt-i18n-micro/guide/contribution)

