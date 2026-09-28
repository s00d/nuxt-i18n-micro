# @i18n-micro/preact

Pure Preact plugin for internationalization using the same core logic as Nuxt I18n Micro. Provides reactive translations, route-specific support, and full TypeScript support. Works with any router (wouter, preact-router) or without a router.

**Peer:** `preact@^10.0.0 || ^11.0.0-0`. Component types import top-level `HTMLAttributes` / `TargetedMouseEvent` (available since Preact 10.27.2; Preact 11 removed the old `JSX.*` forms). Monorepo installs pin Preact 10.x; Preact 11 is ESM-only — prefer the ESM build of this package (or a bundler) over bare `require()` on older Node.

## Installation

```bash
pnpm add @i18n-micro/preact
# or
npm install @i18n-micro/preact
# or
yarn add @i18n-micro/preact
```

## Quick Start

```typescript
import { render } from 'preact'
import { createI18n, I18nProvider, useI18n } from '@i18n-micro/preact'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      greeting: 'Hello, {name}!',
      apples: 'no apples | one apple | {count} apples',
    },
    fr: {
      greeting: 'Bonjour, {name}!',
      apples: 'pas de pommes | une pomme | {count} pommes',
    },
  },
})

function App() {
  return (
    <I18nProvider i18n={i18n}>
      <MyComponent />
    </I18nProvider>
  )
}
```

### Usage in Components

```tsx
import { useI18n } from '@i18n-micro/preact'

function MyComponent() {
  const { t, tc, locale, setLocale } = useI18n()

  return (
    <div>
      <p>{t('greeting', { name: 'World' })}</p>
      <p>{tc('apples', 5)}</p>
      <button onClick={() => setLocale('fr')}>Switch to French</button>
    </div>
  )
}
```

## Resources

- **Repository**: [https://github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)
- **Documentation**: [https://s00d.github.io/nuxt-i18n-micro/](https://s00d.github.io/nuxt-i18n-micro/)

## License

MIT
