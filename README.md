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

> **Note:** The `plain-nuxt` baseline is a minimal implementation created solely for benchmarking purposes. It loads data directly from JSON files without any i18n logic. Real-world applications will have more complexity and higher resource usage. Latest run uses `@nuxtjs/i18n@10.6.0`.

| Project | Build Time | Code Bundle | Max Memory | Max CPU |
|---------|------------|-------------|------------|---------|
| **plain-nuxt** (baseline) | 11.30s | 1.19 MB | 1,098 MB | 101% |
| **i18n-micro** | 7.72s | 1.4 MB | 975 MB | 210% |
| **@nuxtjs/i18n v10.6** | 15.75s | 15.26 MB | 2,138 MB | 195% |

> **Code Bundle** = JavaScript/CSS code only (excludes translation JSON files).
> i18n-micro stores translations as lazy-loaded JSON files, keeping the code bundle minimal.

- **i18n-micro vs baseline**: −3.58s build, +0.21 MB code, −123 MB memory
- **@nuxtjs/i18n v10.6 vs baseline**: +4.45s build, +14.07 MB code, +1,040 MB memory

#### Stress Test Results (Requests per Second)

| Project | Avg Response | RPS (Artillery) | Max Memory |
|---------|--------------|-----------------|------------|
| **plain-nuxt** | 430 ms | 273 | 369 MB |
| **i18n-micro** | 381 ms | 290 | 638 MB |
| **@nuxtjs/i18n v10.6** | 709 ms | 195 | 521 MB |

#### Comparison: `@nuxtjs/i18n` v10.6 vs i18n-micro

- **Code Bundle**: 13.86 MB smaller (i18n-micro: 1.4 MB vs v10.6: 15.26 MB)
- **Build Time**: 8.03s faster (i18n-micro: 7.72s vs v10.6: 15.75s)
- **Max Memory (build)**: 1,163 MB less (i18n-micro: 975 MB vs v10.6: 2,138 MB)
- **Average Response Time**: 328 ms faster (i18n-micro: 381 ms vs v10.6: 709 ms)
- **Requests Per Second**: 95 more (i18n-micro: 290 vs v10.6: 195)

`@nuxtjs/i18n` v10.6 is much closer than older 10.1-era numbers; micro still leads on build time, build RSS, code size, and Artillery RPS/latency on these fixtures. See the [full benchmark report](https://s00d.github.io/nuxt-i18n-micro/guide/performance-results) for methodology and charts.

## Key Features

- 🌐 **Compact Yet Powerful**: Despite its small size, `Nuxt I18n Micro` is designed for large-scale projects, focusing on performance and efficiency.
- ⚡ **Optimized Build and Runtime**: Reduces build times, memory usage, and server load, making it ideal for high-traffic applications.
- 🛠 **Minimalist Design**: The module core is a single Nuxt module plus a small set of runtime plugins, making it easy to understand, extend, and maintain.
- 📏 **Strategy-Based Routing**: Locale prefixes are handled via `@i18n-micro/route-strategy` (build-time) and `@i18n-micro/path-strategy` (runtime), with strategies such as `prefix`, `no_prefix`, `prefix_except_default`, and `prefix_and_default`.
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

