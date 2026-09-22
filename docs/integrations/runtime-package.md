---
title: 'Runtime Package'
description: 'Vanilla TS/JS i18n with @i18n-micro/runtime.'
outline: 'deep'
---

# 🌐 Runtime Package

Use `@i18n-micro/runtime` for framework-agnostic i18n in the browser, workers, or any environment that can load messages in memory or via `fetch`. No filesystem APIs.

For Node/CLI apps that read JSON from disk, use [`@i18n-micro/node`](./nodejs-package) — it extends this package with `loadTranslations(dir)`.

::: tip Playground
[`packages/runtime/playground`](https://github.com/s00d/nuxt-i18n-micro/tree/main/packages/runtime/playground) — `pnpm -C packages/runtime dev`
:::

## 📦 Installation

```bash
pnpm add @i18n-micro/runtime
# or
npm install @i18n-micro/runtime
# or
yarn add @i18n-micro/runtime
```

## 🚀 Quick Start

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
```

## 📂 Loading Messages

### Inline `messages` / `routeMessages`

```typescript
const i18n = createI18n({
  locale: 'en',
  messages: {
    en: { welcome: 'Welcome' },
  },
  routeMessages: {
    home: {
      en: { title: 'Home' },
    },
  },
})

i18n.setRoute('home')
i18n.t('title') // "Home"
i18n.t('welcome') // "Welcome" (from root)
```

### Remote JSON via `fetch`

```typescript
await i18n.loadFromUrl('/locales/fr.json', { locale: 'fr' })
await i18n.loadFromUrl('/locales/pages/home/fr.json', { locale: 'fr', routeName: 'home' })

await i18n.loadFromUrls([
  { url: '/locales/en.json', locale: 'en' },
  { url: '/locales/de.json', locale: 'de' },
])
```

Or load later:

```typescript
i18n.loadMessages({ en: { hello: 'Hi' } }, { about: { en: { title: 'About' } } })
```

## 🔔 Subscribe (vanilla UI updates)

Locale / route / translation changes notify listeners (same store used by framework adapters):

```typescript
const stop = i18n.subscribe(() => {
  document.getElementById('label')!.textContent = i18n.t('welcome')
})

i18n.locale = 'de'
// …
stop()
```

## 🔧 API Overview

### `createI18n(options): I18n`

| Option            | Type                                           | Description                  |
| ----------------- | ---------------------------------------------- | ---------------------------- |
| `locale`          | `string`                                       | Current locale               |
| `fallbackLocale?` | `string`                                       | Fallback (default: `locale`) |
| `messages?`       | `Record<string, Translations>`                 | Root messages by locale      |
| `routeMessages?`  | `Record<string, Record<string, Translations>>` | Route → locale → messages    |
| `plural?`         | `PluralFunc`                                   | Custom pluralization         |
| `missingWarn?`    | `boolean`                                      | Warn on missing keys         |
| `missingHandler?` | `(locale, key, routeName) => void`             | Custom missing handler       |

### Instance methods

- `t` / `tc` / `tn` / `td` / `tdr` / `ts` / `has` — translation & formatting (from `@i18n-micro/core`)
- `locale` / `fallbackLocale` / `setRoute` / `currentRoute`
- `loadMessages` / `loadFromUrl` / `loadFromUrls`
- `addTranslations` / `addRouteTranslations` / `hasTranslation` / `clear`
- `subscribe` / `getSnapshot`
- `storage` — underlying `TranslationStorage` map

`hasTranslation(key)` scans all route buckets for the active locale (legacy node behavior). Prefer `has(key)` / `has(key, routeName)` when you need route-scoped checks.

See also the generated [API reference](/api/packages/runtime).

## 🔗 Related Packages

| Package                                                             | Use when                     |
| ------------------------------------------------------------------- | ---------------------------- |
| [`@i18n-micro/runtime`](.)                                          | Vanilla browser / TS / JS    |
| [`@i18n-micro/node`](./nodejs-package)                              | Node with filesystem locales |
| [`@i18n-micro/vue`](./vue-package) / [`react`](./react-package) / … | Framework UI bindings        |
| [`@i18n-micro/core`](/api/packages/core)                            | Low-level `BaseI18n` only    |
