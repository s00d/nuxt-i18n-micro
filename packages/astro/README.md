# @i18n-micro/astro

Astro integration for internationalization using the same core logic as Nuxt I18n Micro. Provides translations, route-specific support, and full TypeScript support for Astro projects.

## Installation

```bash
pnpm add @i18n-micro/astro
# or
npm install @i18n-micro/astro
# or
yarn add @i18n-micro/astro
```

## Quick Start

### 1. Add Integration to `astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config'
import { i18nIntegration } from '@i18n-micro/astro'

export default defineConfig({
  integrations: [
    i18nIntegration({
      locale: 'en',
      fallbackLocale: 'en',
      locales: [
        { code: 'en', iso: 'en-US', displayName: 'English' },
        { code: 'fr', iso: 'fr-FR', displayName: 'Français' },
      ],
      messages: {
        en: { greeting: 'Hello, {name}!' },
        fr: { greeting: 'Bonjour, {name}!' },
      },
    }),
  ],
})
```

### 2. Use in Pages

```astro
---
// src/pages/index.astro
import { useI18n } from '@i18n-micro/astro'

const { t, locale } = useI18n(Astro)
---

<html>
  <head>
    <title>{t('greeting', { name: 'World' })}</title>
  </head>
  <body>
    <h1>{t('greeting', { name: 'World' })}</h1>
  </body>
</html>
```

## Resources

- **Repository**: [https://github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)
- **Documentation**: [https://s00d.github.io/nuxt-i18n-micro/](https://s00d.github.io/nuxt-i18n-micro/)

## License

MIT
