---
title: Excluding paths
description: Keep pages and files out of locale routing with excludePatterns, and see which paths are excluded already.
outline: [2, 3]
---

# Excluding paths

Some paths must never get a locale prefix or a locale redirect: an admin area, a health check, a generated feed. `excludePatterns` marks them, and a built-in list already covers Nuxt internals and common static files. An excluded page keeps exactly the path you wrote and still renders with `$t`.

## Exclude a path

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE' },
    ],
    defaultLocale: 'en',
    excludePatterns: [
      '/admin', // /admin and everything below it
      '/preview-*', // glob over the whole path
    ],
  },
})
```

With this config `pages/admin/index.vue` answers only at `/admin`; there is no `/de/admin`, and `/admin` is never redirected to `/de/admin`.

## Pattern syntax

Patterns are matched against the path without `app.baseURL`:

| Pattern | Matches | Does not match |
| --- | --- | --- |
| `'/admin'` | `/admin`, `/admin/users` | `/administrator`, `/de/admin` |
| `'/preview-*'` | `/preview-1`, `/preview-a/b` | `/de/preview-1` |
| `'/file-?'` | `/file-a` | `/file-ab` |
| `/^\/v\d+\//` | `/v2/docs` | `/docs` |

A string without `*` or `?` matches the path and whole segments below it. With `*` (any run of characters, slashes included) or `?` (one character) it must match the whole path. Always start strings with `/`.

## What is excluded already

These never get locale routes or redirects, without any config:

- `/api` and `/_nuxt`, and everything below them;
- the translations route, `/_locales` by default ([`apiBaseUrl`](/api/module-options#apibaseurl));
- any path with a segment starting with `__` (`/__nuxt_content`, `/en/__og-image__`);
- `/sitemap*.xml`, `/robots.txt`, `/favicon.ico`, `/apple-touch-icon*.png`, `/manifest.json`, `/sw.js`, `/workbox-*.js`;
- any path whose last segment ends in a static-file extension: `xml txt ico json js css png jpg jpeg gif svg webp avif pdf wasm map mp4 webm mp3 zip gz woff woff2 ttf eot`. Dotted page slugs like `/user/john.doe` and `.html` paths stay pages.

## What an exclusion does

- **Routes:** no localized variants are generated; the page is kept as written.
- **Redirects and 404s:** the server redirect plugin and the client redirect middleware skip the path.
- **Prerender:** matching paths are removed from the prerender route list.

It does not stop the i18n server middleware from detecting a locale for the request, and it does not stop the page from using translations. To keep a page localized but out of SEO tags, use `disableMeta` ([Page config](/guide/per-component-translations#turn-off-seo-tags)). To keep one page unlocalized from `nuxt.config.ts` by path, `globalLocaleRoutes: { '/admin': false }` ([Localized paths](/guide/custom-locale-routes#in-nuxt-config)) does the same for routing.

## Related

- [Routing strategies](/guide/strategy)
- [Localized paths](/guide/custom-locale-routes)
- [`excludePatterns` reference](/api/module-options#excludepatterns)
