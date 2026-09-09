# Nuxt I18n Micro Test Utils

Nuxt unit-test mocks for `useI18n()` — translations, locale state, and lightweight path stubs. Pair with `@nuxt/test-utils` + Vitest.

## Features

- **`createFakeI18n`** — `useI18n()`-shaped object (`$t` / `t` aliases, optional `vi.fn` spies)
- **`resetI18n`** — clear dictionary cache and locale state between tests
- **Translation helpers** — `t`, `tc`, `ts`, `mergeTranslations`, `resolveTranslations`, `setTranslation`
- **Page chunks** — `loadPageTranslations`, `$_t` / `_t` route-bound translators
- **Formatting** — `tn`, `td`, `tdr` via `Intl`
- **Path stubs** — `localePath` / `switchLocalePath` with a simple locale prefix (no vue-router)

## Installation

```bash
npm install @i18n-micro/test-utils --save-dev
```

## Quick setup

```typescript
// tests/unit-setup.ts
import { createFakeI18n, resetI18n, setTranslationsFromJson } from '@i18n-micro/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, vi } from 'vitest'

const i18n = createFakeI18n({ spy: vi.fn })

mockNuxtImport<() => typeof i18n>('useI18n', () => vi.fn(() => i18n))

beforeEach(() => {
  resetI18n()
})

export { i18n, setTranslationsFromJson }
```

Load dictionaries in a test:

```typescript
await setTranslationsFromJson('en', { welcome: 'Welcome' })
expect(i18n.$t('welcome')).toBe('Welcome')
expect(i18n.$localePath('/about')).toBe('/en/about')
```

See the [testing guide](https://s00d.github.io/nuxt-i18n-micro/guide/testing) and the [`example/`](./example) Nuxt app.

## License

MIT License. See the [LICENSE](LICENSE) file for details.

## Author

- **Name**: s00d
- **Email**: Virus191288@gmail.com
- **Website**: [https://s00d.github.io/](https://s00d.github.io/)
