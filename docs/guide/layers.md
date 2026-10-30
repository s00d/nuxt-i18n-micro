---
title: Layers and domains
description: Share i18n config and translation files through Nuxt layers, and serve locales on their own domains.
outline: [2, 3]
---

# Layers and domains

A Nuxt layer can carry the i18n config and the `locales/` folder for several apps, and each app adds or overrides what it needs. This page shows that, and how one build serves several domains.

## Share config and translations

```ts
// base/nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE' },
      { code: 'fr', iso: 'fr-FR' },
    ],
    defaultLocale: 'en',
  },
})
```

```ts
// shop/nuxt.config.ts
export default defineNuxtConfig({
  extends: ['../base'], // a layer directory or package, not a nuxt.config file
  i18n: {
    locales: [
      { code: 'es', iso: 'es-ES' }, // added
      { code: 'fr', disabled: true }, // the base layer's fr, switched off here
    ],
  },
})
```

- **Config:** scalar options in the app replace the layer's. `locales` arrays from all layers are combined, and entries with the same `code` merge into one with the app's fields winning, so an app can add a locale or set fields such as `disabled: true` on an inherited one.
- **Translations:** `locales/` of every layer are merged key by key, layer first and app last, so a key in `shop/locales/en.json` overrides the same key in `base/locales/en.json`. Page files (`locales/pages/<page>/`) merge the same way.
- **Pages:** `$defineI18nRoute` is read from the pages of every layer.

To merge folders that are not part of a layer, list them in [`additionalTranslationDirs`](/api/module-options#additionaltranslationdirs).

## Multiple domains

One build serves every domain. List each locale with its domain; `baseDefault` makes it the default of that host:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    locales: [
      { code: 'en', iso: 'en-US', baseUrl: 'https://example.com', baseDefault: true },
      { code: 'de', iso: 'de-DE', baseUrl: 'https://example.de', baseDefault: true },
      { code: 'nl', iso: 'nl-NL', baseUrl: 'https://example.de' },
      { code: 'fr', iso: 'fr-FR' },
    ],
  },
})
```

Point both domains at the same server. The request's host decides the rest:

- **Default:** the host's `baseDefault` locale. Without one, the build default if the host serves it, else the host's first locale.
- **Served locales:** the locales of that host, plus every locale with no `baseUrl`. On `example.de` that is `de`, `nl` and `fr`.
- **Locales of other domains** are link targets. `$localePath`, `$switchLocalePath`, `<i18n-switcher>` and `hreflang` give absolute URLs on their `baseUrl`, and `$switchLocale` navigates there. On this host their URLs are a 404, and a cookie or `Accept-Language` cannot pick them.
- **Any other host** gets the build config, with every `baseUrl` locale as a link target. Nothing from the request is echoed: canonical and `hreflang` use `metaBaseUrl`, else the build default's `baseUrl`.
- **Payload files** in `public/` are static: any host returns any locale's file. Per-domain [generate](/guide/deployment#static-site-nuxi-generate) publishes only that domain's.

`example.de` under each strategy, with `de: '/kontakt'` as a custom path of `contact`:

| Strategy | `/` | Default locale's page | Other URLs |
| --- | --- | --- | --- |
| `prefix_except_default` | `de` | `/kontakt` | `/de/kontakt` and `/en/contact` are a 404, `/contact` redirects to `/kontakt` |
| `prefix_and_default` | `de` | `/kontakt` and `/de/kontakt`, links use `/kontakt` | `/en/contact` and `/contact` are a 404 |
| `prefix` | redirects to `/de` | `/de/kontakt` | `/kontakt` redirects to `/de/kontakt`, `/en/contact` is a 404 |
| `no_prefix` | `de` | `/kontakt` | a custom path of a locale on another domain is a 404 |

Under `prefix` a link from another domain keeps the prefix, since the unprefixed URL would only redirect. Under `no_prefix` a link to another domain lands on that host's default locale: the URL cannot name a second one.

Things to know:

- **Behind a proxy** the host comes from `Host`. If the proxy puts the public host in `X-Forwarded-Host` instead, set [`trustForwardedHost`](/api/module-options#trustforwardedhost), and only when the proxy overwrites that header.
- **`app.baseURL`** belongs in `baseUrl` too: `baseUrl: 'https://example.de/shop'` with `app.baseURL: '/shop'`.
- **Hosts match exactly.** `www.example.de` is another host: redirect it at the edge, or give the locale that `baseUrl`. Only one host per locale.
- **Caches must key on the host.** A CDN normally does. Nitro's `swr` and `isr` route rules key on the path: add `cache: { varies: ['host'] }`.
- **Custom paths of two host defaults must not collide.** The unprefixed records share one router, so `/x` cannot be one page on `example.de` and another on `example.com`.
- **Prerendered pages:** a `prerender: true` route rule in `nuxt build` renders once, with no host, and the file answers every domain. Leave pages that differ per domain to the server, or [generate per domain](/guide/deployment#static-site-nuxi-generate).
- **`noPrefixRedirect`** with a custom path of the build default redirects on every host, so it does not suit a domain build.
- **`hashMode`:** the host picks the render as above, links to another domain carry the route in the hash (`https://example.com/#/contact`).
- **`ssr: false`:** the browser reads the domain from `location.host`, so a host with no server still resolves.
- **[Runtime overrides](/guide/runtime-overrides)** apply first. A runtime `disabledLocales` holds on every host, with one exception: under `prefix_except_default` and `prefix_and_default` the default of a host stays on on its host, as its pages are the unprefixed records. Under `prefix` and `no_prefix` the host falls to the next locale it serves. A runtime `defaultLocale` applies to unknown hosts only.

For a [static site](/guide/deployment#static-site-nuxi-generate), generate once per domain.

### One app per domain

A shared layer with one small app per domain still works, when the domains need different pages or modules. Each app sets its own `defaultLocale` on top of the same `locales` list. A locale on another domain is a 404 in that app, as above.

### Choosing the locale in code

For a single instance answering every domain with the request's own origin in SEO tags, see [SEO](/guide/seo#set-the-public-origin); to choose the locale from the host in code, see [Custom locale detection](/guide/custom-auto-detect).

## Related

- [Translation files](/guide/translations)
- [Runtime overrides](/guide/runtime-overrides)
- [SEO](/guide/seo)
- [Nuxt layers](https://nuxt.com/docs/getting-started/layers)
