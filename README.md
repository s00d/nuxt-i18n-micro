[![npm version](https://img.shields.io/npm/v/nuxt-i18n-micro/latest?style=for-the-badge)](https://www.npmjs.com/package/nuxt-i18n-micro)
[![npm downloads](https://img.shields.io/npm/dw/nuxt-i18n-micro?style=for-the-badge)](https://www.npmjs.com/package/nuxt-i18n-micro)
[![License](https://img.shields.io/npm/l/nuxt-i18n-micro?style=for-the-badge)](https://www.npmjs.com/package/nuxt-i18n-micro)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

<p align="center">
<img src="https://github.com/s00d/nuxt-i18n-micro/blob/main/branding/logo_full.png?raw=true" alt="logo">
</p>

# Nuxt I18n Micro

Lightweight, fast **i18n for Nuxt 3**: JSON translations, strategy-based locale URLs, small runtime, and optional SEO/meta integration.

## Quick start

```bash
pnpm add nuxt-i18n-micro
```

```typescript
export default defineNuxtConfig({
  modules: ["nuxt-i18n-micro"],
  i18n: {
    locales: [
      { code: "en", iso: "en-US", dir: "ltr" },
      { code: "fr", iso: "fr-FR", dir: "ltr" },
    ],
    defaultLocale: "en",
    translationDir: "locales",
  },
});
```

- In **templates**, helpers like `$t` are available on the component instance.
- In **`<script setup>`**, use `useI18n()` from `#imports` for `t`, locale switching, etc.

## Documentation

- **[Docs site](https://s00d.github.io/nuxt-i18n-micro/)** — full guides and API
- **[Getting started](https://s00d.github.io/nuxt-i18n-micro/guide/getting-started)** — configuration reference
- **[Performance](https://s00d.github.io/nuxt-i18n-micro/guide/performance)** — benchmarks vs `nuxt-i18n`
- **[Integrations](https://s00d.github.io/nuxt-i18n-micro/integrations/)** — Vue, React, Astro, Node, …
- **[Contributing](https://s00d.github.io/nuxt-i18n-micro/guide/contribution)** — local dev, lint, tests

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=s00d/nuxt-i18n-micro&type=date&legend=top-left)](https://www.star-history.com/#s00d/nuxt-i18n-micro&type=date&legend=top-left)
