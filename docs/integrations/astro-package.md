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

Add the integration. It bundles your dictionaries into the server and installs the middleware, so there is nothing else to write:

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

The dictionaries become code at build time: the server reads no disk, so it runs on the edge (Cloudflare, Vercel Edge) too. In `astro dev` an edit to a file applies on the next request.

### Integration options

| Option | Default | Notes |
| --- | --- | --- |
| `locale` | required | Default locale. |
| `fallbackLocale` | `locale` | |
| `locales` | `[]` | Full `Locale` objects. A `disabled` one is no URL's locale and no redirect target. `iso` is the tag plurals go by when the code is not one (`ua` → `uk-UA`). |
| `translationDir` | none | Folder bundled into the server, relative to the project root. |
| `disablePageLocales` | `false` | Page files count as root translations. |
| `autoDetect` | `true` | Home-page redirect, see [Locale detection](#locale-detection). |
| `redirectToDefault` | `false` | `/` also redirects when nothing prefers another locale. |
| `localeCookie` | `'i18n-locale'` | `null` disables the cookie. |
| `missingWarn` | `false` | |
| `middleware` | `true` | `false`: write the middleware yourself, see below. |

Every value is published in `virtual:i18n-micro/config` (`config.base` is Astro's `base`, `config.localeCodes` the enabled codes), the dictionaries in `virtual:i18n-micro/messages`.

### Your own middleware

A plural rule, a missing-key handler and a router adapter cannot cross from the config process to the server bundle. For those, pass `middleware: false` and write `src/middleware.ts`. Astro's `i18n` config is then set for you with `routing: 'manual'`, so `Astro.currentLocale` and `astro:i18n` work. Astro does not allow that setting without a `src/middleware.ts`, so with the integration's own middleware they do not.

```ts
// src/middleware.ts
import { config } from 'virtual:i18n-micro/config'
import { messages } from 'virtual:i18n-micro/messages'
import { createAstroRouterAdapter, createI18n, createI18nMiddleware, localeIsoMap } from '@i18n-micro/astro'

const i18n = createI18n({
  locale: config.defaultLocale,
  fallbackLocale: config.fallbackLocale,
  localeIso: localeIsoMap(config.locales),
  messages: messages.root,
  routeMessages: messages.routes,
  plural: myPluralRule,
})

export const onRequest = createI18nMiddleware({
  i18n,
  defaultLocale: config.defaultLocale,
  locales: config.localeCodes,
  localeObjects: config.locales,
  autoDetect: config.autoDetect,
  redirectToDefault: config.redirectToDefault,
  localeCookie: config.localeCookie,
  base: config.base,
  routingStrategy: createAstroRouterAdapter(config.locales, config.defaultLocale),
})
```

To read the folder at runtime instead, `loadTranslationsFromDir` and `loadTranslationsIntoI18n` are in `@i18n-micro/astro/node` (Node only).

### Middleware options

| Option | Default | Notes |
| --- | --- | --- |
| `i18n` | required | Global instance; each request gets `i18n.fork(locale)`, which costs the same however many dictionaries there are. |
| `defaultLocale` | required | |
| `locales` | required | Locale codes. |
| `localeObjects` | `locales` as `{ code }` | Full `Locale` objects for components and SEO. |
| `autoDetect` | `true` | Home-page redirect, see [Locale detection](#locale-detection). |
| `redirectToDefault` | `false` | `/` also redirects when nothing prefers another locale, to the default locale's home as the routing strategy resolves it. |
| `localeCookie` | `'i18n-locale'` | `null` disables the cookie. |
| `routingStrategy` | prefix except default | Router adapter. Methods it leaves out come from the default adapter. |
| `base` | none | Astro's `base`: `config.base`. |

Page files (`src/locales/pages/blog/post/de.json`) are the route `blog-post`: the page path joined with `-`.

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

The route name comes from the route without its locale: `/fr/blog/post` → `blog-post`, and every URL of `src/pages/blog/[slug].astro` → `blog-slug`, so one folder `locales/pages/blog-slug/` serves them all. `[...path]` is `path`. Under Astro's `base` the helpers take and return URLs of the site: `switchLocalePath` and `localizePath` include it, `getBasePath` does not, because `Astro.rewrite` takes the path without it.

### Components

Import them from `@i18n-micro/astro/<name>` (or `@i18n-micro/astro/components/<name>.astro`):

| Component | Props |
| --- | --- |
| `i18n-t` | `keypath`, `params`, `plural`, `number`, `date`, `relativeDate`, `tag` (`span`, any tag), `html`, `hideIfEmpty`, `defaultValue`; other attributes pass through. With `html` the translation is rendered as HTML and `params` are escaped |
| `i18n-link` | `href`, `locale` (target locale, default current), `class`; other attributes pass through. External URLs, `#hash` and `?query` stay as written; a route keeps its query, hash and trailing slash |
| `i18n-switcher` | `class`, `activeClass` (`'active'`), `customLabels`; renders links to the current page in each enabled locale, with its query |
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

The cookie remembers a choice. A page view that comes from a same-origin page of another locale is a visitor switching, whatever link took them there: the HTML response sets the cookie to the new locale, and `/` does not redirect, so a switcher reaches the default locale's home. An endpoint, an image, a 404, a form post and a prefetch change nothing. "Same origin" is what the browser says in `Sec-Fetch-Site`; without that header the `Referer`'s host is compared with the request's, so behind a proxy set Astro's `security.allowedDomains`.

A [server island](https://docs.astro.build/en/guides/server-islands/) or an action has no locale in its URL. It is rendered for the page that asked, read from the `Referer`, whose path is all that counts, so a proxy in front of the server changes nothing, and it never redirects. Its response carries `Vary: Referer`. Without a `Referer` (a `no-referrer` policy) it is in the default locale, and on a dynamic page its route comes from the URL, so page dictionaries do not reach it.

## Router adapter

`createAstroRouterAdapter(locales, defaultLocale)` prefixes every locale except the default. An Astro adapter needs only `getCurrentPath`; the other members are optional and fall back to the default adapter: `getRouteName(path, locales, routePattern?)`, `getLocaleFromPath`, `switchLocalePath`, `localizePath`, `removeLocaleFromPath`, `resolvePath` (home redirect target), `push`, `replace`, `getRoute`. Write your own for subdomain or suffix URLs and pass it to `createI18nMiddleware`.

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

It returns `htmlAttrs` (`lang` from `iso`, `dir`), a canonical link (path without query), `hreflang` alternates for every enabled locale with `seo !== false` plus `x-default`, `og:locale`, `og:locale:alternate` and `og:url`. Options: `baseUrl` (`site` from the Astro config, else root-relative URLs), `addDirAttribute` (`true`), `addSeoAttributes` (`true`), `hreflangBaseLanguage` (`false`).

## Related

- [Astro islands](./astro-islands) — translations inside Vue, React, Preact and Svelte islands
- [Frameworks](./) — instance options and formatting
- [Package reference](/api/packages/astro)
