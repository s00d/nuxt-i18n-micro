---
outline: deep
---

# Getting Started

## Overview

`Nuxt I18n Micro` is a lightweight internationalization module for Nuxt that delivers superior performance compared to traditional solutions.

## Why Nuxt I18n Micro?

Learn about the benefits of using `Nuxt I18n Micro` for your project:

- **High Performance**: Drastically reduces build time and memory usage.
- **Compact Size**: Minimal impact on your app's bundle size.
- **Efficiency**: Designed for high-traffic and large projects with optimized memory consumption and server load.

## Installation

Install the module in your Nuxt application:

```bash
npm install nuxt-i18n-micro
```

## Basic Setup

Add the module to your `nuxt.config.ts`:

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

### Folder Structure

The translation files are organized into global and page-specific files:

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

#### Global and Page-Specific Files

- **Global Files**: Shared translations for the entire app.
- **Page-Specific Files**: Translations unique to each page.
