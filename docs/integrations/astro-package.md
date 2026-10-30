---
title: 'Astro'
description: 'Server-side translations, locale-prefixed routes, home-page detection and SEO tags for Astro with @i18n-micro/astro.'
outline: 'deep'
---

# Astro

`@i18n-micro/astro` translates Astro pages on the server: a middleware picks the locale from the URL and puts a per-request instance in `Astro.locals`, and `useI18n(Astro)` reads it. Use it in an Astro site that needs locale-prefixed URLs (`/about`, `/fr/about`) and shared JSON dictionaries. You get `.astro` components, a home-page redirect to the visitor's language, `hreflang` tags, and props for [islands](./astro-islands).

## Install

::: code-group

```bash [pnpm]
pnpm add @i18n-micro/astro
```

```bash [npm]
npm install @i18n-micro/astro
```

```bash [yarn]
yarn add @i18n-micro/astro
```

:::

Peer dependencies: `astro` `^5.0.0 || ^6.0.0 || ^7.0.0`. Optional, only for [islands](./astro-islands): `vue` `^3.5.43`, `react` `^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0`, `preact` `^10.27.2 || ^11.0.0-0`, `svelte` `^4.0.0 || ^5.0.0`.

## Setup

Setup has two parts. The integration only writes your settings into the virtual module `virtual:i18n-micro/config` and its types. The middleware does the work, so **`src/middleware.ts` is required**.

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import { i18nIntegration } from '@i18n-micro/astro'

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    i18nIntegration({
      locale: 'en',
      fallbackLocale: 'en',
      locales: [
        { code: 'en', iso: 'en-US', displayName: 'English' },
        { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
        { code: 'fr', iso: 'fr-FR', displayName: 'Français' },
      ],
      translationDir: 'src/locales',
    }),
  ],
})
```

```ts
// src/middleware.ts
import { config } from 'virtual:i18n-micro/config'
import { createAstroRouterAdapter, createI18n, createI18nMiddleware, loadTranslationsIntoI18n } from '@i18n-micro/astro'

const i18n = createI18n({ locale: config.defaultLocale, fallbackLocale: config.fallbackLocale })

// Node runtime only (reads the disk at startup)
if (config.translationDir) loadTranslationsIntoI18n(i18n, { translationDir: config.translationDir })

export const onRequest = createI18nMiddleware({
  i18n,
  defaultLocale: config.defaultLocale,
  locales: config.localeCodes,
  localeObjects: config.locales,
  autoDetect: config.autoDetect,
  redirectToDefault: config.redirectToDefault,
  localeCookie: config.localeCookie,
  routingStrategy: createAstroRouterAdapter(config.locales, config.defaultLocale),
})
```

### Integration options

The integration takes these eight options and publishes each one in `config`. Nothing happens until your middleware reads the value.

| Option | Default | Published as |
| --- | --- | --- |
| `locale` | required | `config.defaultLocale` |
| `fallbackLocale` | `locale` | `config.fallbackLocale` |
| `locales` | `[]` | `config.locales`, `config.localeCodes` |
| `translationDir` | `null` | `config.translationDir`; nothing is loaded unless your middleware loads it |
| `autoDetect` | `true` | `config.autoDetect` |
| `redirectToDefault` | `false` | `config.redirectToDefault` |
| `localeCookie` | `'i18n-locale'` | `config.localeCookie`; `null` disables the cookie |
| `missingWarn` | `false` | `config.missingWarn` |

Messages, plural rules, a missing-key handler and a router adapter cannot cross from the config process to the server bundle: pass them to `createI18n` and `createI18nMiddleware` in `src/middleware.ts`.

### Middleware options

| Option | Default | Notes |
| --- | --- | --- |
| `i18n` | required | Global instance; each request gets `i18n.clone(locale)` sharing its dictionaries. |
| `defaultLocale` | required | |
| `locales` | required | Locale codes. |
| `localeObjects` | `locales` as `{ code }` | Full `Locale` objects (`iso`, `dir`, `displayName`) for components and SEO. |
| `autoDetect` | `true` | Home-page redirect, see [Locale detection](#locale-detection). |
| `redirectToDefault` | `false` | `/` also redirects when nothing prefers another locale, to the default locale's home. |
| `localeCookie` | `'i18n-locale'` | `null` disables the cookie. |
| `routingStrategy` | — | Router adapter. |

On the edge (Cloudflare, Vercel Edge) there is no file system: load dictionaries with `import.meta.glob` and `addTranslations` instead of `loadTranslationsIntoI18n`.

```ts
const files = import.meta.glob<{ default: Record<string, unknown> }>('/src/locales/*.json', { eager: true })
for (const [path, mod] of Object.entries(files)) i18n.addTranslations(path.match(/([^/]+)\.json$/)![1]!, mod.default, false)
```

Page files (`src/locales/pages/blog/post/de.json`) go to `addRouteTranslations(locale, 'blog-post', …)`: the route name is the page path joined with `-`.

## Translate

```astro
---
// src/pages/index.astro
import { useI18n } from '@i18n-micro/astro'
import I18nT from '@i18n-micro/astro/i18n-t'

const { t, tc, locale } = useI18n(Astro)
---

<h1>{t('greeting', { name: 'Ada' })}</h1>
<p>{tc('apples', 3)}</p>
<I18nT keypath="welcome" tag="p" />
<p>{locale}</p>
```

`useI18n(Astro)` returns `locale`, `defaultLocale`, `locales`, `t`, `ts`, `tc`, `tn`, `td`, `tdr`, `has`, `getRoute`, `getRouteName(path?)`, `getLocaleFromPath(path?)`, `switchLocalePath(locale)`, `localizePath(path, locale?)`, `getBasePath(url?)`, `getI18n`, `addTranslations`, `addRouteTranslations`, `mergeTranslations` and `clearCache`. It throws when the middleware did not run. Helpers `getI18n`, `getLocale`, `getDefaultLocale` and `getLocales` read the same `Astro.locals`.

The route name comes from the path without its locale (`/fr/blog/post` → `blog-post`), so page dictionaries apply automatically.

### Components

Import them from `@i18n-micro/astro/<name>` (or `@i18n-micro/astro/components/<name>.astro`):

| Component | Props |
| --- | --- |
| `i18n-t` | `keypath`, `params`, `plural`, `number`, `date`, `relativeDate`, `tag` (`span`), `html`, `defaultValue` |
| `i18n-link` | `href`, `locale` (target locale, default current), `class`; other attributes pass through |
| `i18n-switcher` | `class`, `activeClass` (`'active'`), `customLabels`; renders links to the current page in each enabled locale |
| `i18n-group` | none that change output: a `<div>` around its slot, no prefix |

## Locale-prefixed routes

Keep one page per route in `src/pages/` and add thin rewrite stubs under `src/pages/[locale]/`:

```
src/pages/
  index.astro
  about.astro
  [locale]/
    index.astro
    about.astro
```

```astro
---
// src/pages/[locale]/about.astro
import { prepareLocaleRewrite } from '@i18n-micro/astro'

const target = prepareLocaleRewrite(Astro)
if (target instanceof Response) return target
return Astro.rewrite(target)
---
```

`prepareLocaleRewrite` returns a `404` response for an unknown `:locale`, otherwise sets the locale on `Astro.locals` and returns the path without the prefix. The middleware keeps a locale already in `locals`, so the rewritten page renders in it. `getLocaleRewritePath(Astro)` returns only the path, when you validate the locale yourself.

## Locale detection

The URL decides the page's locale:

1. A locale prefix (`/fr/about` → `fr`; `/en/about` is `en` too).
2. Otherwise what the router adapter's `getLocaleFromPath` returns, if it is not the default.
3. Otherwise the default locale. `/about` is always the default locale's page, whatever the cookie says.

`autoDetect` is a redirect hint on the home page only. A request for `/` whose cookie or `Accept-Language` (q-weights honoured; `de-DE` matches a `de` locale, `de` matches a `de-DE` one) prefers another locale gets a `302` to that locale's home (`/de`). With `redirectToDefault`, `/` always redirects: to the preferred locale's home, else the default locale's. The `/` response carries `Vary: Cookie, Accept-Language` (`Accept-Language` only when `localeCookie` is `null`). Prerendered pages never redirect. `detectLocale(pathname, cookies, headers, defaultLocale, locales, localeCookie?, routingStrategy?, autoDetect?)` returns the same preferred locale for your own logic.

The cookie is read, never written: set it yourself when the visitor picks a language if you want the home page to remember it.

## Router adapter

`createAstroRouterAdapter(locales, defaultLocale)` prefixes every locale except the default. An Astro adapter needs only `getCurrentPath`; the other members are optional and used when present: `getRouteName`, `getLocaleFromPath`, `switchLocalePath`, `localizePath`, `removeLocaleFromPath`, `resolvePath` (home redirect target), `push`, `replace`, `getRoute`. Write your own for subdomain or suffix URLs and pass it to `createI18nMiddleware`.

## SEO

```astro
---
// src/layouts/Layout.astro
import { useLocaleHead } from '@i18n-micro/astro'

const head = useLocaleHead(Astro, { baseUrl: 'https://example.com' })
---

<html lang={head.htmlAttrs.lang} dir={head.htmlAttrs.dir}>
  <head>
    {head.link.map((l) => <link rel={l.rel} href={l.href} hreflang={l.hreflang} />)}
    {head.meta.map((m) => <meta property={m.property} content={m.content} />)}
  </head>
  <body><slot /></body>
</html>
```

It returns `htmlAttrs` (`lang` from `iso`, `dir`), a canonical link (path without query), `hreflang` alternates for every enabled locale with `seo !== false` plus `x-default`, `og:locale`, `og:locale:alternate` and `og:url`. Options: `baseUrl` (`'/'`), `addDirAttribute` (`true`), `addSeoAttributes` (`true`), `hreflangBaseLanguage` (`false`).

## Related

- [Astro islands](./astro-islands) — translations inside Vue, React, Preact and Svelte islands
- [Frameworks](./) — instance options and formatting
- [Package reference](/api/packages/astro)
