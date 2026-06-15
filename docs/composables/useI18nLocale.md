---
title: "useI18nLocale"
description: "Centralized locale state, cookies, and sync."
---

# useI18nLocale

Centralized composable for i18n locale management. Combines `useState('i18n-locale')`, locale cookies, and sync utilities.

## Usage

```vue
<script setup>
const {
  locale,
  localeCookie,
  hashCookie,
  validLocales,
  getPreferredLocale,
  getLocale,
  getLocaleWithServerFallback,
  getEffectiveLocale,
  resolveInitialLocale,
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
| `localeCookie` | `Ref` | Locale cookie (when `localeCookie` option is enabled) |
| `hashCookie` | `Ref` | Cookie used when `hashMode` is active |
| `validLocales` | `string[]` | Enabled locale codes from module config (excludes `disabled`) |
| `getLocale()` | `() => string \| null` | Current locale: state → cookie (or hash cookie in hash mode) |
| `getPreferredLocale()` | `() => string \| null` | Locale from state/cookie **validated** against `validLocales`, or `null` |
| `getLocaleWithServerFallback(serverLocale?)` | `(serverLocale?) => string \| null` | State → cookie → optional server context (used during `no_prefix` init) |
| `getEffectiveLocale(route, getLocaleFromRoute)` | `(route, fn) => string` | Locale for loading translations: hash mode prefers state; otherwise reads from route |
| `resolveInitialLocale(options)` | `(options) => string` | Resolves locale: state → `serverLocale` → route; syncs state when needed |
| `setLocale(locale)` | `(locale: string \| null) => void` | Set locale and sync to cookies |
| `syncLocale(locale)` | `(locale: string \| null) => void` | Sync cookies only (no state update) |
| `isValidLocale(locale)` | `(locale) => boolean` | Check if string is in `validLocales` |

### `resolveInitialLocale` options

```typescript
interface ResolveInitialLocaleOptions {
  route: unknown
  serverLocale?: string | null
  getLocaleFromRoute: (route?: unknown) => string
}
```

Used internally by the main plugin on startup. Custom plugins can call it when implementing alternative detection flows.

### `getEffectiveLocale`

```typescript
const { getEffectiveLocale } = useI18nLocale()
const { $getLocale } = useNuxtApp()

const locale = getEffectiveLocale(route, (r) => $getLocale(r))
```

Returns the locale used to load translations and format messages for a given route object.

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

::: tip `setLocale()` vs `$switchLocale()`
`setLocale()` updates locale preference (state + cookie) only. To also reload the active translation context on the client, use `$switchLocale()` from `useNuxtApp()` or `useI18n()`. This matters especially for `no_prefix`, where the URL does not change. See [FAQ — switch locale without changing the URL](/guide/faq#-switch-locale-without-changing-the-url).
:::

## See Also

- [Custom Language Detection](/guide/custom-auto-detect) — configuring auto-detection
- [Strategy](/guide/strategy) — routing strategies and locale priority
- [Methods — useI18nLocale section](/api/methods#-usei18nlocale-composable) — overlap with runtime plugin API
