# @i18n-micro/runtime

Framework-agnostic i18n runtime for vanilla TypeScript/JavaScript — browser, workers, or any environment with `fetch` (no filesystem APIs).

For loading translation JSON from disk in Node/CLI, use [`@i18n-micro/node`](../node) (built on this package).

## Installation

```bash
pnpm add @i18n-micro/runtime
# or
npm install @i18n-micro/runtime
# or
yarn add @i18n-micro/runtime
```

## Quick Start

```typescript
import { createI18n } from '@i18n-micro/runtime'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      greeting: 'Hello, {name}!',
      apples: 'no apples|one apple|{count} apples',
    },
    de: {
      greeting: 'Hallo, {name}!',
    },
  },
})

console.log(i18n.t('greeting', { name: 'John' })) // "Hello, John!"
console.log(i18n.tc('apples', 5)) // "5 apples"

i18n.locale = 'de'
console.log(i18n.t('greeting', { name: 'Hans' })) // "Hallo, Hans!"

// Or load remote JSON
await i18n.loadFromUrl('/locales/fr.json', { locale: 'fr' })
```

## Resources

- **Repository**: [https://github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)
- **Documentation**: [https://s00d.github.io/nuxt-i18n-micro/](https://s00d.github.io/nuxt-i18n-micro/)

## License

MIT
