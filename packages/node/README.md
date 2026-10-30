# @i18n-micro/node

Node.js loader for Nuxt I18n Micro: reads a translation folder (`locales/en.json`, `locales/pages/<page>/en.json`) into an `@i18n-micro/runtime` instance, for servers, CLIs and generators. Node.js `>=20`.

```bash
pnpm add @i18n-micro/node
```

```ts
import { createI18n } from '@i18n-micro/node'

const i18n = createI18n({ locale: 'en', fallbackLocale: 'en', translationDir: './locales' })
await i18n.loadTranslations()

i18n.t('greeting', { name: 'Ada' })
i18n.t('title', undefined, undefined, 'blog-post') // locales/pages/blog/post/en.json
```

Per request, `i18n.run(locale, next)` gives everything the request awaits its own locale and route; `i18n.fork(locale)` returns such an instance to pass around.

Docs: [https://s00d.github.io/nuxt-i18n-micro/integrations/nodejs-package](https://s00d.github.io/nuxt-i18n-micro/integrations/nodejs-package) · Repository: [github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)

## License

MIT
