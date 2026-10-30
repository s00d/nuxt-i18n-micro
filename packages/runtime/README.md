# @i18n-micro/runtime

Framework-agnostic i18n instance of Nuxt I18n Micro for browsers, workers and edge runtimes: dictionaries, `t()`, plurals, `Intl` formatting, `fetch` loading and a change subscription. No `fs`, no framework; for files on disk use `@i18n-micro/node`.

```bash
pnpm add @i18n-micro/runtime
```

```ts
import { createI18n } from '@i18n-micro/runtime'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en: { greeting: 'Hello, {name}!', apples: 'no apples | one apple | {count} apples' } },
})

i18n.t('greeting', { name: 'Ada' }) // 'Hello, Ada!'
i18n.tc('apples', 5) // '5 apples'
await i18n.loadFromUrl('/locales/de.json', { locale: 'de' })
i18n.locale = 'de'
```

Docs: [https://s00d.github.io/nuxt-i18n-micro/integrations/runtime-package](https://s00d.github.io/nuxt-i18n-micro/integrations/runtime-package) · Repository: [github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)

## License

MIT
