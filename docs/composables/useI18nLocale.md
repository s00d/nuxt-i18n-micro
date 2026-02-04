# useI18nLocale

Centralized composable for i18n locale management. Combines `useState('i18n-locale')`, locale cookies, and sync utilities.

## Usage

```vue
<script setup>
const {
  locale,
  localeCookie,
  hashCookie,
  getPreferredLocale,
  getLocale,
  setLocale,
  syncLocale,
  isValidLocale,
} = useI18nLocale()

// Set locale (updates state and cookies)
setLocale('de')

// Get current locale (state → cookie)
const current = getLocale()

// Get valid preferred locale
const preferred = getPreferredLocale()
</script>
```

## API

| Property/Method | Type | Description |
|-----------------|------|-------------|
| `locale` | `Ref<string \| null>` | Reactive locale state (`useState('i18n-locale')`) |
| `localeCookie` | `Ref` | Locale cookie (when `localeCookie` is enabled) |
| `hashCookie` | `Ref` | Cookie for hashMode |
| `getLocale()` | `() => string \| null` | Current locale: state → cookie |
| `getPreferredLocale()` | `() => string \| null` | Valid preferred locale |
| `setLocale(locale)` | `(locale: string \| null) => void` | Set locale and sync to cookies |
| `syncLocale(locale)` | `(locale: string \| null) => void` | Sync cookies only |
| `isValidLocale(locale)` | `(locale) => boolean` | Check if string is a valid locale |

## Programmatic Locale Setting

Prefer `useI18nLocale()` over direct `useState('i18n-locale')` usage:

```ts
// plugins/i18n-loader.server.ts
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin({
  name: 'i18n-custom-loader',
  enforce: 'pre',
  order: -10,

  setup() {
    const { setLocale } = useI18nLocale()
    const detectedLocale = 'ja' // Your detection logic here
    setLocale(detectedLocale)
  }
})
```

## See Also

- [Custom Language Detection](/guide/custom-auto-detect) — configuring auto-detection
- [Strategy](/guide/strategy) — routing strategies and locale priority
