---
title: Layers and domains
description: Share i18n config and translation files through Nuxt layers, and serve locales on their own domains.
outline: [2, 3]
---

# Layers and domains

A Nuxt layer can carry the i18n config and the `locales/` folder for several apps, and each app adds or overrides what it needs. The same mechanism is the simplest way to run one site per domain: a shared base layer plus a small app per domain. This page shows both, plus the single-build alternatives.

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

- **Config:** scalar options in the app replace the layer's. `locales` arrays from all layers are combined, and entries with the same `code` merge into one, so an app can add a locale or set fields such as `disabled: true` on an inherited one.
- **Translations:** `locales/` of every layer are merged key by key, layer first and app last, so a key in `shop/locales/en.json` overrides the same key in `base/locales/en.json`. Page files (`locales/pages/<page>/`) merge the same way.
- **Pages:** `$defineI18nRoute` is read from the pages of every layer.

To merge folders that are not part of a layer, list them in [`additionalTranslationDirs`](/api/module-options#additionaltranslationdirs).

## Multiple domains

When `example.com` shows English and `example.de` German, build one app per domain on top of a shared base. The base lists every locale with the domain it lives on:

```ts
// base/nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', iso: 'en-US', baseUrl: 'https://example.com', baseDefault: true },
      { code: 'de', iso: 'de-DE', baseUrl: 'https://example.de', baseDefault: true },
    ],
  },
})
```

Each domain's app only picks its default locale:

```ts
// sites/de/nuxt.config.ts
export default defineNuxtConfig({
  extends: ['../../base'],
  i18n: {
    defaultLocale: 'de',
  },
})
```

Build and deploy each app separately and point its domain at it. On `example.de`, German pages are unprefixed (`/about`). Links to another locale — `$localePath`, `$switchLocalePath`, `<i18n-switcher>`, `hreflang` — become absolute URLs on that locale's `baseUrl`, and `baseDefault: true` drops the locale prefix from them: the English link is `https://example.com/about`, which the `example.com` build serves as its default locale.

`baseUrl` and `baseDefault` only shape links; they do not route requests. Each domain must serve its locale at those paths, which is what setting `defaultLocale` per build does.

### One build for every domain

If the domains differ only in their default and enabled locales, skip the per-domain apps: build once with `strategy: 'prefix'` or `'no_prefix'` and start one instance per domain with [runtime overrides](/guide/runtime-overrides):

```bash
NUXT_I18N_DEFAULT_LOCALE=de NUXT_I18N_DISABLED_LOCALES=en,fr node .output/server/index.mjs
```

Under `prefix_except_default` and `prefix_and_default` the default locale is fixed at build, so use separate builds there. For a single instance answering every domain with the request's own origin in SEO tags, see [SEO](/guide/seo#set-the-public-origin); to choose the locale from the host in code, see [Custom locale detection](/guide/custom-auto-detect).

## Related

- [Translation files](/guide/translations)
- [Runtime overrides](/guide/runtime-overrides)
- [SEO](/guide/seo)
- [Nuxt layers](https://nuxt.com/docs/getting-started/layers)
