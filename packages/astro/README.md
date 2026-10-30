# @i18n-micro/astro

Astro integration for Nuxt I18n Micro: locale from the URL, a per-request instance in `Astro.locals`, `useI18n(Astro)`, `.astro` components, a home-page redirect to the visitor's language, `useLocaleHead` for SEO, and adapters for Vue, React, Preact and Svelte islands.

```bash
pnpm add @i18n-micro/astro
```

Peer: `astro` `^5.0.0 || ^6.0.0 || ^7.0.0` (island frameworks optional).

The integration only writes `virtual:i18n-micro/config`; `src/middleware.ts` does the work and is required:

```ts
// src/middleware.ts
import { config } from 'virtual:i18n-micro/config'
import { createAstroRouterAdapter, createI18n, createI18nMiddleware, loadTranslationsIntoI18n } from '@i18n-micro/astro'

const i18n = createI18n({ locale: config.defaultLocale, fallbackLocale: config.fallbackLocale })
if (config.translationDir) loadTranslationsIntoI18n(i18n, { translationDir: config.translationDir })

export const onRequest = createI18nMiddleware({
  i18n,
  defaultLocale: config.defaultLocale,
  locales: config.localeCodes,
  localeObjects: config.locales,
  autoDetect: config.autoDetect,
  localeCookie: config.localeCookie,
  routingStrategy: createAstroRouterAdapter(config.locales, config.defaultLocale),
})
```

Islands: [https://s00d.github.io/nuxt-i18n-micro/integrations/astro-islands](https://s00d.github.io/nuxt-i18n-micro/integrations/astro-islands).

Docs: [https://s00d.github.io/nuxt-i18n-micro/integrations/astro-package](https://s00d.github.io/nuxt-i18n-micro/integrations/astro-package) · Repository: [github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)

## License

MIT
