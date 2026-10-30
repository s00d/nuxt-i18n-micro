# @i18n-micro/astro

Astro integration for Nuxt I18n Micro: locale from the URL, a per-request instance in `Astro.locals`, `useI18n(Astro)`, `.astro` components, a home-page redirect to the visitor's language, `useLocaleHead` for SEO, and adapters for Vue, React, Preact and Svelte islands.

```bash
pnpm add @i18n-micro/astro
```

Peer: `astro` `^5.0.0 || ^6.0.0 || ^7.0.0` (island frameworks optional).

The integration bundles the dictionaries and installs the middleware:

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config'
import { i18nIntegration } from '@i18n-micro/astro'

export default defineConfig({
  integrations: [i18nIntegration({ locale: 'en', locales: [{ code: 'en' }, { code: 'de' }], translationDir: 'src/locales' })],
})
```

Islands: [https://s00d.github.io/nuxt-i18n-micro/integrations/astro-islands](https://s00d.github.io/nuxt-i18n-micro/integrations/astro-islands).

Docs: [https://s00d.github.io/nuxt-i18n-micro/integrations/astro-package](https://s00d.github.io/nuxt-i18n-micro/integrations/astro-package) · Repository: [github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)

## License

MIT
