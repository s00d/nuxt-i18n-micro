---
title: 'Runtime'
description: 'Framework-agnostic createI18n for browsers, workers and edge runtimes with @i18n-micro/runtime.'
outline: 'deep'
---

# Runtime

`@i18n-micro/runtime` is the framework-agnostic i18n instance: dictionaries, `t()`, plurals, `Intl` formatting and a change subscription, with no `fs` and no framework. Use it in plain TypeScript, a web worker, an edge function, or as the base of your own binding. The React, Preact, Node and Astro packages extend this same class.

## Install

::: code-group

```bash [pnpm]
pnpm add @i18n-micro/runtime
```

```bash [npm]
npm install @i18n-micro/runtime
```

```bash [yarn]
yarn add @i18n-micro/runtime
```

:::

No peer dependencies. For translation files on disk use [`@i18n-micro/node`](./nodejs-package).

## Setup

```ts
import { createI18n } from '@i18n-micro/runtime'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: { greeting: 'Hello, {name}!', apples: 'no apples | one apple | {count} apples' },
    de: { greeting: 'Hallo, {name}!' },
  },
  routeMessages: {
    about: { en: { title: 'About us' } },
  },
})
```

All options (`plural`, `missingWarn`, `missingHandler`, `numberFormats`, `datetimeFormats`) are listed in [the instance](./#create-i18n-options).

## Translate

```ts
i18n.t('greeting', { name: 'Ada' }) // 'Hello, Ada!'
i18n.tc('apples', 5) // '5 apples'
i18n.tn(1234.5) // '1,234.5'

i18n.setRoute('about')
i18n.t('title') // 'About us' (route dictionary)
i18n.t('greeting', { name: 'Ada' }) // 'Hello, Ada!' (root, still visible)
```

Load more dictionaries later:

```ts
i18n.loadMessages({ fr: { greeting: 'Bonjour, {name} !' } }, { about: { fr: { title: 'À propos' } } })
i18n.addTranslations('fr', { nav: { home: 'Accueil' } }) // deep merge; pass false to replace

await i18n.loadFromUrl('/locales/fr.json', { locale: 'fr' })
await i18n.loadFromUrl('/locales/pages/about/fr.json', { locale: 'fr', routeName: 'about' })
await i18n.loadFromUrls([
  { url: '/locales/en.json', locale: 'en' },
  { url: '/locales/de.json', locale: 'de' },
])
```

`loadFromUrl` uses `fetch` (pass `init` for headers) and throws on a non-OK response. `loadFromUrls` loads one after another.

## Switch locale

```ts
i18n.locale = 'de'
i18n.t('greeting', { name: 'Ada' }) // 'Hallo, Ada!'
```

Locale, route and dictionary changes notify subscribers, which is how framework bindings re-render:

```ts
const stop = i18n.subscribe(() => {
  document.querySelector('#greeting')!.textContent = i18n.t('greeting', { name: 'Ada' }) as string
})
i18n.locale = 'fr'
stop()
```

`getSnapshot()` returns a string that changes on every notification (for `useSyncExternalStore`-style stores).

## Per request

The instance holds one locale and one route. On a server, do not switch a shared instance per request: two concurrent requests would see each other's locale. `i18n.fork(locale)` gives a request its own: own locale, fallback and route; the same dictionaries, formatters and rules. Forking costs the same however many dictionaries there are. A fork sees writes to its parent until its first own write, and its writes stay in it. [Node.js](./nodejs-package#per-request) adds `run`.

## API

| Member | Notes |
| --- | --- |
| `t`, `ts`, `tc`, `tn`, `td`, `tdr`, `has` | see [Translate and format](./#translate-and-format) |
| `locale`, `fallbackLocale` | get/set |
| `currentRoute`, `setRoute(name)`, `getRoute()` | active route, default `'index'` |
| `loadMessages(messages?, routeMessages?)` | merge many locales and routes at once |
| `addTranslations(locale, tree, merge = true)`, `addRouteTranslations(locale, route, tree, merge = true)` | |
| `loadFromUrl(url, { locale?, routeName?, init? })`, `loadFromUrls(entries)` | `fetch` JSON |
| `hasTranslation(key)` | active locale, any route (unlike `has`, which checks the active route and root) |
| `setTranslation(key, value)`, `resolveTranslations()` | write one key; read the merged tree |
| `clear()`, `clearCache()` | drop every dictionary |
| `subscribe(cb)`, `getSnapshot()` | change notifications |
| `storage` | `{ translations: Map<'locale:route', Translations> }` |

A code that is no language tag gets its plurals from `localeIso: { ua: 'uk-UA' }`; `localeIsoMap(locales)` builds that from a locale list.

Module exports: `createI18n`, `I18n`, `fetchJsonTranslations`, `FormatService`, `interpolate`, `localeIsoMap` and the types `I18nOptions`, `LoadFromUrlOptions`, `LoadFromUrlEntry`, `TranslationStorage`, `Translations`, `Locale`, `PluralFunc`. Full signatures: [package reference](/api/packages/runtime).

## Related

- [Frameworks](./) — options, lookup order, plurals
- [Node.js](./nodejs-package) — load translation files from disk
- [React and Preact](./react-package) — bindings built on this instance
