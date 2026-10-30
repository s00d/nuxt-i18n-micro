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

An instance holds one locale and one route. Switching `i18n.locale` or calling `setRoute` on a shared instance inside a request handler races with concurrent requests. Read the files once, then either keep one instance per locale and pass the route to `t()`:

```ts
import { createI18n, loadTranslations } from '@i18n-micro/node'

const locales = ['en', 'de', 'fr']
const { root, routes } = await loadTranslations('./locales')
const byLocale = new Map(
  locales.map((locale) => [locale, createI18n({ locale, fallbackLocale: 'en', messages: root, routeMessages: routes })]),
)

const i18n = byLocale.get('de')!
i18n.t('title', undefined, undefined, 'blog-post')
```

or create a short-lived instance per request from the same `root` and `routes` objects. The dictionaries are read from disk once either way.

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
