---
url: 'https://s00d.github.io/nuxt-i18n-micro/composables/useI18n.md'
description: Access i18n features in components and scripts.
---

# 🛠️ `useI18n` Composable

The `useI18n` composable in `Nuxt I18n Micro` provides access to most runtime i18n helpers in components and scripts. Methods are available **with and without the `$` prefix** (for example `$t` and `t`).

Some injections — `$defineI18nRoute` and `$clearCache` — are available on `useNuxtApp()` only. See [Methods — `$defineI18nRoute`](/api/methods#definei18nroute) and [`$clearCache`](/api/methods#clearcache).

## 📊 What it returns

```ts
useI18n(): PluginsInjectionsWithAliases
```

Every runtime helper, as a plain object.

The same functions the plugin injects as `$t`, `$tc` and so on, available under both
the dollar-prefixed name and a bare alias — so `const { t } = useI18n()` and
`const { $t } = useI18n()` both work.

**Returns** — the helpers described in the [methods reference](/api/methods)

```ts
const { t, tc, switchLocale, getLocale } = useI18n()

t('welcome', { name: 'Ada' })
tc('items', 3)
switchLocale('de')
```

Every helper it returns — `$t`, `$tc`, `$has`, `$switchLocale` and the rest — is listed
with its signature and documented in full on the [Methods reference](/api/methods).

## `useNuxtApp()`-only APIs

These are **not** returned by `useI18n()`. Import them from `useNuxtApp()`:

| Method                     | Purpose                                                                         |
| -------------------------- | ------------------------------------------------------------------------------- |
| `$defineI18nRoute(config)` | Per-page locale routes, restrictions, and inline translations in `script setup` |
| `$clearCache()`            | Clears in-memory translation cache and loaded chunks                            |

```typescript
import { useNuxtApp } from '#imports'

const { $defineI18nRoute, $clearCache } = useNuxtApp()

$defineI18nRoute({
  locales: ['en', 'fr'],
  localeRoutes: { en: '/about', fr: '/a-propos' },
})
```

See [Methods](/api/methods) for full signatures and examples.

## 🛠️ Example Usages

### Basic Locale Retrieval

Retrieve the current locale of the application.

```js
const { $getLocale } = useI18n()
const locale = $getLocale()
```

### Translation with Parameters

Translate a string with dynamic parameters, with a fallback default value.

```js
const { $t } = useI18n()
const welcomeMessage = $t('welcome', { name: 'Jane' }, 'Welcome!')
```

### Switching Locales

Switch the application to a different locale.

```js
const { $switchLocale } = useI18n()
$switchLocale('de')
```

### Generating a Localized Route

Generate a route localized to the current or specified locale.

```js
const { $localeRoute } = useI18n()
const route = $localeRoute('/about', 'fr')
```
