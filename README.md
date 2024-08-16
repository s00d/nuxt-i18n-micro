# Nuxt I18n Micro

[![npm version][npm-version-src]][npm-version-href]  
[![npm downloads][npm-downloads-src]][npm-downloads-href]  
[![License][license-src]][license-href]  
[![Nuxt][nuxt-src]][nuxt-href]

A lightweight Nuxt module for handling i18n (internationalization) with support for multiple locales, dynamic translations, and SEO optimization.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/s00d/nuxt-i18n-micro?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

- 🌐 &nbsp;Flexible locale management with `code`, `iso`, and `dir` attributes.
- 🔄 &nbsp;Dynamic translation loading based on routes and locales.
- 🛠 &nbsp;SEO optimization with automatic `meta` tags and `alternate` links.
- ⚡ &nbsp;Lightweight and easy to integrate into existing Nuxt projects.

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npm install nuxt-i18n-micro
```

Then, add it to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    'nuxt-i18n-micro',
  ],
  i18nConfig: {
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
      { code: 'ar', iso: 'ar-SA', dir: 'rtl' },
    ],
    defaultLocale: 'en',
    translationDir: 'locales',
    mata: true,
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
