---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Nuxt I18n Micro"
  text: "Fast, simple, and lightweight internationalization for Nuxt"
  tagline: Optimize your Nuxt app with a powerful and efficient i18n solution
  actions:
    - theme: brand
      text: Getting Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/s00d/nuxt-i18n-micro

features:
  - title: High Performance
    details: Significant reductions in build times, memory usage, and server load, making it ideal for large-scale projects.
  - title: Compact and Lightweight
    details: Designed for efficiency, reducing the total bundle size by up to 96% compared to traditional i18n modules.
  - title: Minimalist Design
    details: A simple structure with just 5 components, easy to extend and maintain.
  - title: Dynamic Routing
    details: Efficient regex-based routing that generates only two routes regardless of the number of locales.
  - title: Streamlined Translation Loading
    details: Supports only JSON files, with auto-generated page-specific translations in `dev` mode.
  - title: Nuxt Integration
    details: Seamless integration with Nuxt.js, making it easy to add powerful i18n features to your application.
---

---

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

**Nuxt I18n**:
- **Total size**: 54.7 MB (3.31 MB gzip)
- **Max CPU Usage**: 391.4%
- **Max Memory Usage**: 8305 MB
- **Elapsed Time**: 0h 1m 31s

**Nuxt I18n Micro**:
- **Total size**: 1.93 MB (473 kB gzip) — **96% smaller**
- **Max CPU Usage**: 220.1% — **44% lower**
- **Max Memory Usage**: 655 MB — **92% less memory**
- **Elapsed Time**: 0h 0m 5s — **94% faster**

#### Server Performance (10k Requests)

**Nuxt I18n**:
- **Requests per second**: 49.05 [#/sec] (mean)
- **Time per request**: 611.599 ms (mean)
- **Max Memory Usage**: 703.73 MB

**Nuxt I18n Micro**:
- **Requests per second**: 61.18 [#/sec] (mean) — **25% more requests per second**
- **Time per request**: 490.379 ms (mean) — **20% faster**
- **Max Memory Usage**: 323.00 MB — **54% less memory usage**

These results clearly demonstrate that `Nuxt I18n Micro` significantly outperforms the original module in every critical area.

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

## Folder Structure

Translations are organized into global and page-specific files:

```
/locales
  /pages
    /index
      en.json
      fr.json
      ar.json
    /about
      en.json
      fr.json
      ar.json
  en.json
  fr.json
  ar.json
```
