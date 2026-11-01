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
- **Browser cache.** `?v=` changes only when translations do, so a browser keeps its payloads across deploys that did not touch them. The static copy costs one conditional request per navigation. The server route answers `immutable` for a year ([Deployment](/guide/deployment#cache-headers-and-datebuild)).
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

## Memory on a Node server

Under steady load a Node server can sit at about 12 times its live heap and stay there. On a stress test of 100k keys per page, a live heap of 90 MB ran at about 1.1 GB of RSS. This is not a leak. After one oversized GC cycle V8 raises its heap limit, and it keeps the freed pages in a pool for reuse while load lasts. About 8 seconds after load stops the pool empties and RSS falls to about 160 MB. `global.gc()` does not return this memory. Plain Nuxt without the module does the same, scaled to its smaller heap.

It costs headroom: with a memory limit below that level and no heap cap, the process can be killed. Set a cap that fits your limit and sits well above the live heap:

```bash
NODE_OPTIONS=--max-old-space-size=512 node .output/server/index.mjs
```

| 100k keys, 12 locales, 5 to 30 minutes of load | Default | `--max-old-space-size=512` |
| --- | --- | --- |
| RSS under load | about 1,150 MB | 254-287 MB |
| Requests per second | 624 | 517-572 |

So the cap trades 8 to 10 % of throughput for the memory. A catalog of ordinary size has a smaller heap and a smaller step. These runs were on macOS with Node 22, not in a container.

## Parse time and `dir`

`dir: 'auto'` on a locale makes the browser work out the direction from the content while it parses. In Chromium, DOMContentLoaded at 20,000 elements was about 1.1 s with `dir="auto"` and 0.1 s without it, and at 5,000 elements about 130 ms against 45 ms. Leave `dir` unset or set it to `ltr` or `rtl` ([Text direction](/guide/seo#text-direction)).

## Shared cache for several instances

With several instances of one build, [`cacheStorage`](/api/module-options#cachestorage) gives them one dictionary cache in any Nitro storage, on the connection your app configures in `nitro.storage`. The module adds no connector and no dependency.

**It is a cache, not a source.** Translations come from the embedded or public payloads, or from `apiBaseServerHost`. Only what came from the source is written, and keys carry the build, so a store you fill by hand is not read. To serve translations from KV or a database, put a small route that reads it at `apiBaseServerHost`.

**When it helps.** Only with a remote `apiBaseServerHost`. Three instances walking 39 dictionaries made 117 requests to the host without it and 48 with it. With files on disk a store hit is no faster than the file, and a first pass over 12 pages took 280-296 ms without the option and 308-325 ms with a filled Redis, so leave it unset. On a preset that embeds dictionaries it does nothing without a host, and the build says so.

A cold dictionary, one client, one walk each, so rough, and most of it is the distance to the host:

| Store | From the host | From the store |
| --- | --- | --- |
| Cloudflare KV | about 300 ms | about 110 ms |
| D1 | about 230 ms | about 115 ms |
| Deno KV | about 430 ms | about 100 ms |
| Upstash, Vercel serverless | about 445 ms | about 245 ms |
| Upstash, Vercel Edge | about 505 ms | about 235 ms |

### Redis

Needs `ioredis` in your project.

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

### Upstash on Vercel and Vercel Edge

Use the `upstash` driver on both: it talks REST, where the `redis` driver needs TCP. It needs `@upstash/redis` in your project, and reads `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from the environment.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  nitro: {
    storage: {
      upstash: { driver: 'upstash' },
    },
  },
  i18n: {
    cacheStorage: 'upstash',
    apiBaseServerHost: 'https://translations.example.com',
  },
})
```

### Cloudflare KV

Bind a namespace to the Worker as `I18N_KV` (`kv_namespaces` in its wrangler config).

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  nitro: {
    storage: {
      kv: { driver: 'cloudflare-kv-binding', binding: 'I18N_KV' },
    },
  },
  i18n: {
    cacheStorage: 'kv',
    apiBaseServerHost: 'https://translations.example.com',
  },
})
```

A host that is another Worker on the same account needs the `global_fetch_strictly_public` compatibility flag, or the fetch does not reach it.

### Cloudflare D1

`nitro.storage` cannot hold a database object, so a Nitro plugin mounts the driver. The mount is checked on first use, so that is early enough. Bind the database as `I18N_DB` (`d1_databases`) and have `unstorage` in your project.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  nitro: {
    experimental: { database: true },
    database: {
      default: { connector: 'cloudflare-d1', options: { bindingName: 'I18N_DB' } },
    },
  },
  i18n: {
    cacheStorage: 'd1',
    apiBaseServerHost: 'https://translations.example.com',
  },
})
```

```ts
// server/plugins/i18n-storage.ts
import dbDriver from 'unstorage/drivers/db0'

export default defineNitroPlugin(() => {
  useStorage().mount('d1', dbDriver({ database: useDatabase() }))
})
```

The `db0` driver is marked experimental and ignores the TTL: rows of old builds stay until you delete them.

### Deno KV

On Deno Deploy, provision a database (`deno deploy database provision <name> --kind denokv`), assign it to the app (`deno deploy database assign`), and use the driver:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  nitro: {
    storage: {
      kv: { driver: 'deno-kv' },
    },
  },
  i18n: {
    cacheStorage: 'kv',
    apiBaseServerHost: 'https://translations.example.com',
  },
})
```

### How it behaves

A dictionary is looked up in the instance's own cache, then in the shared storage, then at its source. The instance's own cache stays, because `$t` is synchronous and needs the tree in memory: this separates who fetches from who serves, it does not save memory.

- **Who fetches.** With a remote host, one fetch from the backend per dictionary instead of one per instance. Instances that miss at the same moment each fetch it, because there is no lock.
- **Pages without their own dictionary** are not stored, so that made-up page names cannot add keys. Each instance fetches such a page from the host once, and on Workers, where isolates come and go, that is a steady trickle.
- **The host is down.** Pages with a stored dictionary work. A page with none renders from the stored root dictionary with HTTP 200, its own keys raw, and `/_locales` answers `503` for it until the host is back. `useTranslationServerMiddleware` answers keys for a dictionary it cannot read.
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
