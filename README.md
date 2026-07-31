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

To showcase the efficiency of `Nuxt I18n Micro`, we ran the same fixture suite via `pnpm test:performance` (`pnpm -C scripts cli performance`) against **`@nuxtjs/i18n@10.6.0`** on the same hardware. We also include a **plain-nuxt** baseline (no i18n module) to measure the real overhead.

#### Build Time and Resource Consumption

> **Note:** The `plain-nuxt` baseline is a minimal implementation created solely for benchmarking purposes. It loads data directly from JSON files without any i18n logic. Latest run: `@nuxtjs/i18n@10.6.0`, mean of 3 consecutive runs per fixture, default CLI profile (~16.8k index leaves).

| Project | Build Time | Code Bundle | Max Memory | Max CPU |
|---------|------------|-------------|------------|---------|
| **plain-nuxt** (baseline) | 5.32s | 1.53 MB | 810 MB | 207% |
| **i18n-micro** | 5.34s | 1.74 MB | 1,065 MB | 204% |
| **@nuxtjs/i18n v10.6** | 8.34s | 2.16 MB | 1,821 MB | 204% |

> **Code Bundle** = JS/CSS only (excludes classified translation payloads, including `@nuxtjs/i18n` `chunks/raw/*`). Older tables that showed ~15 MB “code” for v10.6 were counting message chunks as app code.

- **i18n-micro vs baseline**: ≈ same build time, +0.21 MB code, +255 MB peak RSS
- **@nuxtjs/i18n v10.6 vs baseline**: +3.02s build, +0.63 MB code, +1,011 MB peak RSS

#### Stress Test Results (Requests per Second)

| Project | Avg Response (Artillery) | RPS (Artillery) | RPS (Autocannon) | Avg Latency (AC) |
|---------|--------------------------|-----------------|------------------|------------------|
| **plain-nuxt** | 1,194 ms | 109 | 65 | 152 ms |
| **i18n-micro** | 483 ms | 275 | 162 | 62 ms |
| **@nuxtjs/i18n v10.6** | 956 ms | 143 | 72 | 139 ms |

#### Comparison: `@nuxtjs/i18n` v10.6 vs i18n-micro

- **Code Bundle**: 0.42 MB smaller (1.74 MB vs 2.16 MB)
- **Build Time**: 3.00s faster (5.34s vs 8.34s)
- **Max Memory (build)**: 756 MB less (1,065 MB vs 1,821 MB)
- **Average Response Time (Artillery)**: 473 ms faster (483 ms vs 956 ms)
- **Requests Per Second (Artillery)**: 132 more (275 vs 143)

Micro leads on build cost and especially under load. See the [full benchmark report](https://s00d.github.io/nuxt-i18n-micro/guide/performance-results) for methodology and charts.

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

