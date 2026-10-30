---
title: SEO
description: The lang, hreflang, canonical and og:locale tags the module adds, how their base URL is chosen, and how to override them per page.
outline: [2, 3]
---

# SEO

With `meta: true` (the default) every localized page gets `<html lang dir>`, a canonical link, `hreflang` alternates, `x-default` and Open Graph locale tags. You need this page when you want to set the public origin, tune which locales appear in the tags, or override them for one page. Most sites only need a `site.url` or `metaBaseUrl` and correct `iso` codes.

## Minimal setup

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'de', iso: 'de-DE', dir: 'ltr' },
      { code: 'ar', iso: 'ar-SA', dir: 'rtl' },
    ],
    defaultLocale: 'en',
    metaBaseUrl: 'https://example.com',
  },
})
```

`/de/about` then renders:

```html
<html lang="de-DE" dir="ltr">
<link rel="canonical" href="https://example.com/de/about">
<link rel="alternate" hreflang="en-US" href="https://example.com/about">
<link rel="alternate" hreflang="de-DE" href="https://example.com/de/about">
<link rel="alternate" hreflang="ar-SA" href="https://example.com/ar/about">
<link rel="alternate" hreflang="x-default" href="https://example.com/about">
<meta property="og:locale" content="de_DE">
<meta property="og:url" content="https://example.com/de/about">
<meta property="og:locale:alternate" content="en_US">
<meta property="og:locale:alternate" content="ar_SA">
```

## Which tags you get

- **hreflang**: one tag per locale that serves the page, value `iso` (or `code` when `iso` is missing). A page restricted with [Page config](/guide/per-component-translations) or `routeLocales` lists only its locales. [`hreflangBaseLanguage: true`](/api/module-options#hreflangbaselanguage) also adds the bare language (`es-ES` → `es`) for the first regional locale.
- **x-default**: the default locale's URL, only when the default locale serves the page.
- **og:locale**: derived from `iso` (`en-US` → `en_US`). Set `og` on the locale when the mapping is not direct, for example `{ code: 'zh', iso: 'zh-Hans', og: 'zh_CN' }`; without either, no `og:locale` is written and dev mode warns.
- **canonical / og:url**: the current URL without query parameters, except those in [`canonicalQueryWhitelist`](/api/module-options#canonicalquerywhitelist) (default `page`, `sort`, `filter`, `search`, `q`, `query`, `tag`).

By strategy:

| Strategy | hreflang and x-default | canonical, og:url, og:locale, html attrs |
| --- | --- | --- |
| `prefix`, `prefix_except_default`, `prefix_and_default` | yes | yes |
| `no_prefix` | no (one URL serves every locale) | yes |

## Set the public origin

Absolute URLs use the first of:

1. [`metaBaseUrl`](/api/module-options#metabaseurl);
2. `site.url` from `nuxt-site-config` (installed by `@nuxtjs/seo`);
3. the request origin.

Pin one of the first two. The request-origin fallback reads `X-Forwarded-Host` and `X-Forwarded-Proto` because [`metaTrustForwardedHost`](/api/module-options#metatrustforwardedhost) and `metaTrustForwardedProto` default to `true`. That is only safe behind a proxy that overwrites those headers; otherwise a client can choose the host in your canonical links. Set both to `false` if the app is reachable directly.

The fallback is useful for one deployment answering several domains: `https://site-a.com/en/about` and `https://site-b.com/en/about` each get their own origin. For a fixed domain per locale use `baseUrl` on the locale, see [Layers and domains](/guide/layers#multiple-domains).

## Leave locales or pages out

```ts
i18n: {
  locales: [
    { code: 'en', iso: 'en-US' },
    { code: 'ru', iso: 'ru-RU', seo: false }, // routable, but not in hreflang / og:locale:alternate
    { code: 'fr', iso: 'fr-FR', disabled: true }, // no routes, no switching, no tags
  ],
}
```

If the default locale has `seo: false`, no `x-default` is written. To turn the tags off for one page, use `disableMeta` in [Page config](/guide/per-component-translations#turn-off-seo-tags), or [`routeDisableMeta`](/api/module-options#routedisablemeta) in the config.

## Override tags on one page

For CMS content where only some translations exist, or URLs come from an API, replace the generated tags with [`useI18nHead`](/composables/useI18nHead):

```vue
<script setup lang="ts">
const { data: article } = await useFetch('/api/articles/hello')
// article.value.urls = { en: 'https://example.com/blog/hello', de: 'https://example.com/de/artikel/hallo' }

useI18nHead(() => ({
  meta: [{ property: 'og:title', content: article.value?.title ?? '' }],
  replace: {
    hreflang: Object.entries(article.value?.urls ?? {}).map(([locale, href]) => ({ rel: 'alternate', hreflang: locale, href })),
    ogAlternates: Object.keys(article.value?.urls ?? {}),
  },
}))
</script>
```

`replace` can also set or remove `canonical`, `xDefault`, `ogLocale` and `ogUrl`; `disable` drops whole groups (`'hreflang'`, `'x-default'`, `'canonical'`, `'og'`, `'og-alternates'`, `'html'`). Pass a getter so values recompute after a locale switch. For per-locale slugs, set `$setI18nRouteParams` first ([Localized paths](/guide/custom-locale-routes#per-locale-slugs)) and the generated alternates already use them.

## Trailing slash

`$localePath`, `$switchLocalePath`, `<i18n-link>` and the SEO URLs follow one slash rule: `experimental.defaults.nuxtLink.trailingSlash` by default, or [`trailingSlash`](/api/module-options) in the i18n config when i18n paths should differ.

## Nuxt SEO

[`@nuxtjs/seo`](https://nuxtseo.com/) (sitemap, robots, schema.org) works with this module through `nuxt-site-config` 4+. List `nuxt-i18n-micro` first so site config can read the locales, and set `site.url` once — it also feeds the tags above.

```ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro', '@nuxtjs/seo'],
  site: { url: 'https://example.com', name: 'My Site' },
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE' },
    ],
  },
})
```

A translated site name and description come from the `nuxtSiteConfig.name` / `nuxtSiteConfig.description` keys in your locale files. The error `Plugin nuxt-seo:defaults depends on nuxt-site-config:i18n but they are not registered` means `@nuxtjs/seo` is older than 3; upgrade it ([#133](https://github.com/s00d/nuxt-i18n-micro/issues/133)).

## Related

- [`useI18nHead`](/composables/useI18nHead) and [`useLocaleHead`](/composables/useLocaleHead)
- [Page config](/guide/per-component-translations)
- [Localized paths](/guide/custom-locale-routes)
- [Layers and domains](/guide/layers)
