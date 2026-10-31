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

## Shared cache for several instances

With several instances of one build, [`cacheStorage`](/api/module-options#cachestorage) gives them one dictionary cache in Redis or any other Nitro storage, on the connection your app already configures in `nitro.storage`, the same way `cache.base: 'redis'` does. The module adds no connector and no dependency (the `redis` driver needs `ioredis` in your project).

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  nitro: {
    storage: {
      redis: { driver: 'redis', url: process.env.REDIS_URL },
    },
  },
  i18n: {
    cacheStorage: 'redis', // the mount name
    apiBaseServerHost: 'https://translations.internal',
    cacheTtl: 300,
  },
})
```

A dictionary is looked up in the instance's own cache, then in the shared storage, then at its source. The instance's own cache stays, because `$t` is synchronous and needs the tree in memory: this separates who fetches from who serves, it does not save memory.

- **What it gains.** With a remote host, one fetch from the backend per dictionary instead of one per instance. Instances that miss at the same moment each fetch it, because there is no lock. With files on disk an instance reads a local file about as fast as Redis answers, so there is nothing to gain: leave the option unset unless the source is slow or remote.
- **The host** is `NUXT_I18N_APP_BASE_SERVER_HOST` at runtime, or else `apiBaseServerHost` from the build, the same as without the option. On a preset that embeds dictionaries (Cloudflare, Vercel, Netlify, see [Deployment](/guide/deployment#serverless-and-edge)) the layer applies only with a host: the data is already in the bundle, and a copy in KV would be a network read for what memory holds.
- **Keys** are `i18n-micro:<buildId>~<dateBuild>~<fallbackLocale>~<host>:<locale>:<page>`, so two builds in a rolling deploy never read each other, and neither do two backends of one artifact. Each instance must come from one build (one artifact, or a pinned Nuxt [`buildId`](https://nuxt.com/docs/api/nuxt-config#buildid)); instances built separately simply do not share. With a pinned `buildId` and `dateBuild: 0`, two different builds do share keys. Only enabled locales are looked up, and page names over 200 characters skip the layer.
- **What is stored.** A dictionary is compared with the root one (`__root`) before it is written, and goes in only when it holds every root key and differs from the root. So a made-up page answered with the root adds no key, and neither does a 200 error body on a page. Each instance reads such a page from the source once. A host must answer unknown pages with the root, an empty object or a 404, and serve `__root`. A host without `__root`, or one that serves pages without the root keys, shares nothing. If the host answers `__root` itself with a well-formed error, that is stored: keep `cacheTtl` short when the backend can do that.
- **Expiry.** An entry expires `cacheTtl` seconds after it was written, or after one day when `cacheTtl` is `0`, so keys of old builds cannot pile up. A value can stay in an instance's own cache for another `cacheTtl`, and in the render's chunk cache for one more: backend changes show within three times `cacheTtl`. Drivers without expiry (`fs`) keep old keys until you remove them.
- **When the storage fails** the page does not. A read may take 1 second, which covers a connection handshake and a Cloudflare KV key that is cold at that location. After a failure the limit is 250 ms until the store answers again. Three failures in a row close the layer for 5 seconds. While it is closed, and while a read has just failed, nothing is written. A failed write closes nothing, so a read-only replica keeps serving reads. A store whose answers take longer than these limits counts as failing: a miss, and the dictionary comes from its source. With ioredis that starts near 400 ms per command, because its handshake takes three round trips. The module logs one warning per minute; ioredis prints its own errors on top of that. A value that is not a dictionary counts as a miss and is overwritten. An unknown mount name warns once on first use; the app then runs without the layer.
- **When the source fails** nothing keeps the failure. A failed fetch or an unreadable file reaches no cache, this one or the instance's own, and the next request reads again. See [Deployment](/guide/deployment#when-a-dictionary-cannot-be-read).
- **Off in dev and in prerender**, which read their files and must not need your production Redis.
- **Invalidation.** There is no purge call: a new build uses new keys. To refresh a running build at once, remove the `i18n-micro:` keys from the storage and restart the instances. `clearCache` and HMR only touch process state.
- Runtime changes (`$mergeTranslations`, `$defineI18nRoute`) stay in the render or the browser that made them and are never written to the storage.

## Payload size

The build warns when the payload output passes `translationPayloads.warnFileCount` (500 files) or `warnSizeBytes` (10 MB). When it does:

- move page-only keys out of the root files;
- link routes that show the same keys (`routesLocaleLinks`);
- on serverless or Edge, use `translationPayloads.mode: 'source'` so the server bundle embeds compact sources instead of every page × locale ([Deployment](/guide/deployment#serverless-and-edge)). An Edge build warns on its own past the platform's limit ([Bundle limits](/guide/deployment#bundle-limits-on-edge));
- enable `nitro.compressPublicAssets` for `.gz` / `.br` copies of the static payloads.

## Measuring

The repository tracks what the playground ships with `pnpm run budget:payload`; the current numbers:

<!-- generated:payload-budget — do not edit; run `pnpm run docs:generate` -->

Measured on `playground` across `/`, `/de`:

| Measurement | Size |
| --- | --- |
| Translation sources on disk | 7.8 MB |
| Served as separate payload files | 23.9 MB |
| Largest inline `__NUXT_DATA__` | 0.4 KB |
| Client assets | 624.4 KB |

The playground is a test bench with generated dictionaries of up to 100k keys, so these are not figures to expect from a real
application — they are a fixed point to measure against. The budget fails when they grow unexpectedly,
which is how an accidental change to what the payload carries gets noticed.

<!-- /generated:payload-budget -->

Run the benchmark suite yourself with `pnpm test:performance`; how it works is in the [benchmark methodology](/contributing/performance-methodology).

## Related

- [Benchmarks](/guide/performance-results)
- [Deployment](/guide/deployment)
- [Translation files](/guide/translations)
