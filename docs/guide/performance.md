---
title: Performance tuning
description: The settings that change memory, payload size and caching, and how to measure what your app ships.
outline: [2, 3]
---

# Performance tuning

The defaults are tuned for a typical app: one JSON payload per page and locale, translations kept off the HTML, bounded caches on the server. This page lists the few settings worth changing when a catalog is large, the server is memory-constrained, or payloads come from another host. For measured numbers against `@nuxtjs/i18n` and plain Nuxt, see [Benchmarks](/guide/performance-results).

## What the defaults already do

- **One payload per page.** The build merges root, page and fallback-locale keys into `/_locales/<page>/<locale>/data.json`, so a page loads one file and `$t` is a single lookup.
- **No dictionary in the HTML.** SSR keeps translations in server memory; the browser fetches the payload instead of parsing it from `__NUXT_DATA__`.
- **Long-lived browser cache.** Versioned payload URLs are `immutable` for a year; `?v=` changes only when translations do ([Deployment](/guide/deployment#cache-headers-and-datebuild)).
- **Bounded server memory.** The server caches at most 1000 payloads by default and drops the least recently used.

## Split translations by page

Keys used on one page belong in `locales/pages/<page>/<locale>.json`, not in the root files: root keys are part of every page's payload. See [Translation files](/guide/translations).

Two settings change this split:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    // pages that show the same keys share one payload: /de/products/123 loads the products payload
    routesLocaleLinks: { 'products-id': 'products' },
    // or: no page files at all, every page loads only the root dictionary
    // disablePageLocales: true,
  },
})
```

[`routesLocaleLinks`](/api/module-options#routeslocalelinks) cuts duplicate payloads for related routes. [`disablePageLocales`](/api/module-options#disablepagelocales) suits small apps where one dictionary per locale is simpler.

## Server caches

| Setting | Default | Effect |
| --- | --- | --- |
| [`cacheMaxSize`](/api/module-options#cachemaxsize) | `0` | Max entries in the payload caches. `0` = no limit in the browser, 1000 on the server. |
| [`cacheTtl`](/api/module-options#cachettl) | `0` | Seconds before a cached entry is reloaded. `0` = never; set it when payloads come from `apiBaseServerHost` and change without a redeploy. |
| `serverTranslationPreload` | `false` | Load the `index` payload in the Nitro middleware for every page request, so server helpers and the home page reuse it. |

Lower `cacheMaxSize` on a small instance with many pages × locales. Locally edited translations never need a TTL: dev reads files live, production payloads change only with a deploy.

## Payload size

The build warns when the payload output passes `translationPayloads.warnFileCount` (500 files) or `warnSizeBytes` (10 MB). When it does:

- move page-only keys out of the root files;
- link routes that show the same keys (`routesLocaleLinks`);
- on serverless or Edge, use `translationPayloads.mode: 'source'` so the server bundle embeds compact sources instead of every page × locale ([Deployment](/guide/deployment#serverless-and-edge));
- enable `nitro.compressPublicAssets` for `.gz` / `.br` copies of the static payloads.

## Measuring

The repository tracks what the playground ships with `pnpm run budget:payload`; the current numbers:

<!-- generated:payload-budget — do not edit; run `pnpm run docs:generate` -->

Measured on `playground` across `/`, `/de`:

| Measurement | Size |
| --- | --- |
| Translation sources on disk | 15.2 MB |
| Served as separate payload files | 37.7 MB |
| Largest inline `__NUXT_DATA__` | 0.4 KB |
| Client assets | 455.1 KB |

The playground carries a deliberately oversized dictionary, so these are not figures to expect from a real
application — they are a fixed point to measure against. The budget fails when they grow unexpectedly,
which is how an accidental change to what the payload carries gets noticed.

<!-- /generated:payload-budget -->

Run the benchmark suite yourself with `pnpm test:performance`; how it works is in the [benchmark methodology](/contributing/performance-methodology).

## Related

- [Benchmarks](/guide/performance-results)
- [Deployment](/guide/deployment)
- [Translation files](/guide/translations)
