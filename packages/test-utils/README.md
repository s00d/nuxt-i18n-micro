# Nuxt I18n Micro Test Utils

Nuxt unit-test mocks for `useI18n()` — translations, locale state, and lightweight path stubs. Pair with `@nuxt/test-utils` + Vitest.

## Features

- **`setupNuxtI18nMock`** — one-call isolated harness + `beforeEach` reseed (keep `mockNuxtImport` in your setup file)
- **`createFakeI18n` / `createIsolatedFakeI18n`** — `useI18n()`-shaped object (`$t` / `t`, `helper`, optional `vi.fn` spies)
- **Factory options** — `locales`, `translations`, `messages`, `strategy`, …
- **`resetI18n`** — clear the shared dictionary cache between tests
- **Translation helpers** — `t`, `tc`, `ts`, `mergeTranslations`, `resolveTranslations`, `setTranslation`
- **Path stubs** — `localePath` / `switchLocalePath` (prefix strategies; does not mutate locale)

## Installation

```bash
npm install @i18n-micro/test-utils --save-dev
```

## Quick setup

```typescript
// tests/unit-setup.ts
import { setupNuxtI18nMock } from '@i18n-micro/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, vi } from 'vitest'

const { i18n, useI18n, setTranslationsFromJson } = setupNuxtI18nMock({
  spy: vi.fn,
  beforeEach,
})

mockNuxtImport('useI18n', () => useI18n)

export { i18n, setTranslationsFromJson }
```

Load dictionaries in a test:

```typescript
await setTranslationsFromJson('en', { welcome: 'Welcome' })
expect(i18n.$t('welcome')).toBe('Welcome')
expect(i18n.$localePath('/about')).toBe('/en/about')
expect(i18n.$switchLocalePath('de')).toBe('/de/about')
expect(i18n.$getLocale()).toBe('en') // switchLocalePath does not change locale
```

See the [testing guide](https://s00d.github.io/nuxt-i18n-micro/guide/testing) and the [`example/`](./example) Nuxt app.

## License

MIT License. See the [LICENSE](LICENSE) file for details.

## Author

- **Name**: s00d
- **Email**: Virus191288@gmail.com
- **Website**: [https://s00d.github.io/](https://s00d.github.io/)
