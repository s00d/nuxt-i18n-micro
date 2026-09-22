# @i18n-micro/node

Node.js runtime for nuxt-i18n-micro — filesystem translation loading on top of [`@i18n-micro/runtime`](../runtime). Use this in Node.js applications, CLI tools, or backend services.

For browser / vanilla JS without `fs`, use `@i18n-micro/runtime` directly.

## Installation

```bash
pnpm add @i18n-micro/node
# or
npm install @i18n-micro/node
# or
yarn add @i18n-micro/node
```

## Quick Start

```typescript
import { createI18n } from '@i18n-micro/node'

// 1. Create I18n instance
const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  translationDir: './locales', // Path to your locales directory
  disablePageLocales: false, // If true, ignores pages/ folder and treats all files as global translations
})

// 2. Load translations from directory (recursive, supports pages structure)
await i18n.loadTranslations()

// 3. Use translations
console.log(i18n.t('greeting', { name: 'John' })) // "Hello, John!"
console.log(i18n.tc('apples', 5)) // "5 apples"
```

## Resources

- **Repository**: [https://github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)
- **Documentation**: [https://s00d.github.io/nuxt-i18n-micro/](https://s00d.github.io/nuxt-i18n-micro/)

## License

MIT
