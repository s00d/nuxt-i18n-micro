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
    }),
  ],
})
```

The integration publishes these serializable options as `virtual:i18n-micro/config`. Everything else
(`messages`, `plural`, `missingHandler`, `routingStrategy`) belongs to the runtime: pass it in the middleware.

### 2. Create the Middleware

```ts
// src/middleware.ts
import { config } from 'virtual:i18n-micro/config'
import { createI18n, createI18nMiddleware } from '@i18n-micro/astro'

const i18n = createI18n({
  locale: config.defaultLocale,
  fallbackLocale: config.fallbackLocale,
  messages: {
    en: { greeting: 'Hello, {name}!' },
    fr: { greeting: 'Bonjour, {name}!' },
  },
})

export const onRequest = createI18nMiddleware({
  i18n,
  defaultLocale: config.defaultLocale,
  locales: config.localeCodes,
  localeObjects: config.locales,
  autoDetect: config.autoDetect,
  redirectToDefault: config.redirectToDefault,
  localeCookie: config.localeCookie,
})
```

### 3. Use in Pages

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

### 4. Locale-prefixed URLs (`/[locale]/*`)

When using `createAstroRouterAdapter`, add rewrite stubs under `src/pages/[locale]/`:

```astro
---
import { prepareLocaleRewrite } from '@i18n-micro/astro'

const rewriteTarget = prepareLocaleRewrite(Astro)
if (rewriteTarget instanceof Response) return rewriteTarget

return Astro.rewrite(rewriteTarget)
---
```

See the [full Astro integration guide](https://s00d.github.io/nuxt-i18n-micro/integrations/astro-package.html#locale-prefixed-routes-locale) for routing layout and typecheck notes.

## Resources

- **Repository**: [https://github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)
- **Documentation**: [https://s00d.github.io/nuxt-i18n-micro/](https://s00d.github.io/nuxt-i18n-micro/)

## License

MIT
