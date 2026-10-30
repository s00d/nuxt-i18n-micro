---
title: 'Node.js'
description: 'Load translation files from disk and translate in Node.js servers, scripts and CLIs with @i18n-micro/node.'
outline: 'deep'
---

# Node.js

`@i18n-micro/node` is the [runtime](./runtime-package) instance plus a loader that reads a translation folder from disk. Use it in an Express or Fastify server, a CLI, an email or PDF generator, or any script that needs the same JSON files as your Nuxt app. You load the files once and translate per request without sharing mutable state between requests.

## Install

::: code-group

```bash [pnpm]
pnpm add @i18n-micro/node @i18n-micro/utils
```

```bash [npm]
npm install @i18n-micro/node @i18n-micro/utils
```

```bash [yarn]
yarn add @i18n-micro/node @i18n-micro/utils
```

:::

No peer dependencies; Node.js `>=20`. `@i18n-micro/utils` is only needed for the `Accept-Language` helper below.

## Setup

The loader reads the [Nuxt folder layout](/guide/translations): `locales/en.json` is a root dictionary, `locales/pages/blog/post/en.json` belongs to the route `blog-post`.

```ts
import { createI18n } from '@i18n-micro/node'

const i18n = createI18n({ locale: 'en', fallbackLocale: 'en', translationDir: './locales' })
await i18n.loadTranslations()

i18n.t('greeting', { name: 'Ada' }) // 'Hello, Ada!'
i18n.t('title', undefined, undefined, 'blog-post') // from locales/pages/blog/post/en.json
```

Options are the runtime ones (see [the instance](./#create-i18n-options)) plus `translationDir` and `disablePageLocales` (treat `pages/**` files as root dictionaries). `i18n.reload()` clears every dictionary and reads the folder again, for a file watcher in development.

`loadTranslations(dir, disablePageLocales?)` is also exported on its own and returns `{ root, routes }`:

```ts
import { loadTranslations } from '@i18n-micro/node'

const { root, routes } = await loadTranslations('./locales')
// root:   { en: {...}, de: {...} }
// routes: { 'blog-post': { en: {...}, de: {...} } }
```

## Per request

An instance holds one locale and one route. Switching `i18n.locale` on a shared instance inside a request handler races with concurrent requests. `run` gives a request its own:

```ts
const i18n = createI18n({ locale: 'en', fallbackLocale: 'en', translationDir: './locales' })
await i18n.loadTranslations()

// `() => next()`: `run` hands its callback the fork, and Express reads an argument of `next` as an error
app.use((req, res, next) => i18n.run(pickLocale(req), () => next()))

app.get('/', (req, res) => {
  res.send(i18n.t('greeting')) // the request's locale, in everything it awaits
})
```

Inside `run` the shared instance reads and sets the request's locale and route (`AsyncLocalStorage`); the fork starts on the current route, and `i18n.setRoute(...)` inside the callback changes that request's route. The callback also gets the request's fork: dictionaries written to it stay in the request, dictionaries written to the shared instance reach everyone.

Without `AsyncLocalStorage`, `i18n.fork(locale)` returns the same kind of instance to pass around.

`reload()` reads the directory again; the old dictionaries answer until the new ones are in.

## Pick the locale

`detectLocaleFromAcceptLanguage(header, locales)` honours `q` weights and matches `de-DE` to a `de` locale (and `de` to `de-DE`). It returns `null` when nothing matches.

```ts
import express from 'express'
import { detectLocaleFromAcceptLanguage } from '@i18n-micro/utils/accept-language'

const app = express()

app.get('/hello', (req, res) => {
  const locale = detectLocaleFromAcceptLanguage(req.headers['accept-language'], locales) ?? 'en'
  const i18n = byLocale.get(locale)!
  res.json({ message: i18n.t('greeting', { name: 'Ada' }) })
})
```

For URL prefix, cookie and header together, `resolveLocale({ defaultLocale, validLocales, url, cookie, acceptLanguage, autoDetectLanguage: true })` from `@i18n-micro/utils/resolve-locale` applies the module's precedence: URL, then cookie, then `Accept-Language`, then the default. Invalid values are skipped.

Inside a Nuxt app you do not need this package on the server: use the module's [server-side translations](/guide/server-side-translations).

## API

| Export | Notes |
| --- | --- |
| `createI18n(options)`, `I18n` | runtime instance + `translationDir`, `loadTranslations(dir?)`, `reload()` |
| `loadTranslations(dir, disablePageLocales?)` | `{ root, routes }` |
| `loadRootTranslations(dir, disablePageLocales?)` | `root` only |
| `FormatService`, `interpolate` | from core |
| Types: `I18nOptions`, `LoadedTranslations`, `Translations`, `Locale`, `PluralFunc`, `Params` | |

Instance methods are listed on [Runtime](./runtime-package#api). Full signatures: [package reference](/api/packages/node).

## Related

- [Runtime](./runtime-package) — the instance without `fs`
- [Translations](/guide/translations) — folder layout
- [Locale detection](/guide/locale-detection) — the precedence in the Nuxt module
