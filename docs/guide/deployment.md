---
title: Deployment
description: Deploy to a Node server, serverless or Edge, or as a static site — where translation payloads go, cache headers, dateBuild and baseURL.
outline: [2, 3]
---

# Deployment

The module works with any Nitro preset without extra config: it picks where translation files live from the preset you build for. This page explains that choice, so you know what ends up in `.output/`, which headers the payloads get, and what to change for static hosting, large catalogs, a sub-path or a CDN. Defaults are right for most apps; read the section for your platform.

## How translations are delivered

At build time the module turns `locales/` (all layers merged) into **payloads**: one JSON file per page and locale. Two consumers read them:

- **SSR** loads the payload of the rendered page in-process — no HTTP request, and the dictionary is not embedded in the HTML.
- **The browser** fetches `/_locales/<page>/<locale>/data.json?v=<dateBuild>` on hydration and on navigation.

`_locales` is [`apiBaseUrl`](/api/module-options#apibaseurl). The built-in server route answers that URL; the static copy in `public/` answers it without a server.

## Node server

```bash
npx nuxi build
node .output/server/index.mjs
```

With `node-server` (the default preset), `node-cluster`, `bun`, `deno-server` or any other preset that serves `public/` from disk, with `public/` next to the `server/` folder:

- payloads are copied to `.output/public/_locales/<page>/<locale>/data.json`;
- SSR reads them from that folder with `fs` (nothing is bundled into the server);
- the browser gets them as static files, or from the server route.

Deploy the whole `.output/` directory. Node 20 or newer is required.

With another layout, the module embeds the payloads as described in the next section. That covers a custom `nitro.output.publicDir`, which the build reads once, and `serveStatic: true` on a preset that keeps static files elsewhere. If a build reads `public/` and the folder does not reach the server, as with `aws-lambda` and `serveStatic: true`, the server logs one error and pages show raw keys. Set `nitro.serveStatic: false` to embed the payloads.

## Serverless and Edge

These presets cannot read `public/` at runtime:

- function presets that ship `public/` to a CDN or do not serve it: `vercel`, `netlify`, `aws-lambda`, `aws-amplify`, `azure-swa`, `firebase`, `stormkit`, `zeabur`, `node-listener`;
- Edge presets without a file system: `cloudflare-module`, `cloudflare-pages`, `vercel-edge`, `netlify-edge`, `deno-deploy`;
- `serveStatic: 'inline'`, such as `winterjs`.

There the module embeds the payloads into the server bundle as Nitro server assets (`assets:i18n`) and still writes the public copy for the browser.

Embedding the full page × locale matrix makes the bundle large. Past the limit of an Edge platform the build warns and names it, see [Bundle limits](#bundle-limits-on-edge). For big catalogs switch to `source` mode, which embeds the compact source files and merges root, page and fallback translations at runtime:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    translationPayloads: {
      mode: 'source',
    },
  },
})
```

In `source` mode the browser always fetches payloads from the server route, which merges them on request (any public copy holds the compact source tree that only the server reads). That needs a running server, so do not use `source` for a pure static site.

### Bundle limits on Edge

| Platform | Limit |
| --- | --- |
| Cloudflare Workers | 64 MiB uncompressed, on Free and Paid. No compressed limit. 1 s startup, 128 MB memory |
| Vercel Edge | 1 MB gzip on Hobby, 2 MB on Pro, 4 MB on Enterprise |
| Netlify Edge | 20 MB compressed |

The build sums the dictionaries it embeds and warns only past the lowest limit of the platform. It counts dictionaries alone, so the app comes on top. As an example, 120 pages × 4 locales with a 60 KB root file embed 34.9 MiB in `premerged` mode, which fits Cloudflare but not Vercel Edge or Netlify Edge, and 5.7 MiB in `source` mode, which is still 3 MB gzip on Vercel Edge. A catalog that size on Vercel Edge needs a [payload host](#app-baseurl-and-payload-hosts).

`source` pays a merge per page and locale in each isolate, about 1 ms in that example and 7 ms of CPU in a cold one. It grows with the size of the fallback chain: about 43 ms for 4 MB of chain files. Netlify Edge allows 50 ms of CPU per request and Cloudflare's Free plan 10 ms.

## Static site (nuxi generate)

```bash
npx nuxi generate
```

`nuxi build --preset <static preset>` does the same. The default `premerged` mode writes every payload into `.output/public/_locales/`, so any static host can serve them. Pages are prerendered for each locale: under `prefix` the module seeds every localized root (`/en`, `/de`), and `/` is kept as a redirect stub. Leave [`prerenderRoutes`](/api/module-options#translationpayloads) off: the public copy already contains the payload files. With `source` mode or `publicAssets: false` there is nothing for the browser to read, and the build warns.

For Cloudflare Pages use the `cloudflare-pages-static` preset: `nuxi generate --preset cloudflare-pages` is a server build with no `index.html`. Under `no_prefix` the HTML holds the default locale, and the browser switches to the visitor's locale after hydration.

For a build with [locale domains](/guide/layers#multiple-domains), run generate once per domain, with `NUXT_I18N_DOMAIN` as the host of the run. Each tree then holds that domain's pages and payloads. Nitro has no variable for the output folder, so read your own from the config:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: { output: { publicDir: process.env.PUBLIC_DIR } },
})
```

```bash
NUXT_I18N_DOMAIN=example.de PUBLIC_DIR=sites/example.de npx nuxi generate
NUXT_I18N_DOMAIN=example.com PUBLIC_DIR=sites/example.com npx nuxi generate
```

Keep the folders outside `.output`: each run empties it. Absolute links to the other domains are not crawled. Without the variable, a build with a `baseUrl` locale warns and generates the build config, where those locales are links and get no pages. On a Node server the same variable pins the process to one domain, whatever `Host` says.

A static host applies its own headers to these files; set caching in the host's config. The module's `/_locales/*` rule does reach Cloudflare Pages through `_headers` and Vercel through `config.json`, as `public, max-age=0, must-revalidate`. To ship `.gz` / `.br` siblings, turn on `nitro.compressPublicAssets` — the module compresses the payload copy with the same settings.

## Cache headers and dateBuild

| Request | `Cache-Control` |
| --- | --- |
| Server route, `?v=` equal to the current `dateBuild`, a non-empty dictionary | `public, max-age=<httpCacheDuration>, immutable` |
| Server route, without `?v=`, with an old one, or an empty dictionary | `public, max-age=0, must-revalidate` |
| Static copy in `public/`, any `?v=` | `public, max-age=0, must-revalidate` |
| Server route, the dictionary could not be read | `503`, `no-store` |
| dev server | none |

The first two rows are set by the server route, the third by a `/_locales/**` route rule with CORS enabled. A default `premerged` build answers from the static copy, so `immutable` applies only when the route answers: in `source` mode or with `publicAssets: false`. The browser then revalidates a payload on each navigation, at the cost of one conditional request. [`httpCacheDuration`](/api/module-options#httpcacheduration) defaults to one year; `0` sends no header.

[`dateBuild`](/api/module-options#datebuild) is the `?v=` value. By default it is a hash of your translation files, so it changes only when translations change and browsers keep their cached payloads across deploys that did not touch them. Set it yourself to pin a value, or set `0` / `''` to drop `?v=` entirely (payloads are then never `immutable`).

### When a dictionary cannot be read

A failed fetch from a host (anything but a 404), an unreadable or corrupt file, or a 200 that is not a JSON object reaches no cache, and the next request reads again:

- a page render logs a warning and shows raw keys for that dictionary, with HTTP 200;
- `/_locales/...` answers `503` with `no-store`;
- `useTranslationServerMiddleware` gives a `t` that answers the key or the default value.

A 404 from the host means there is no such page: it reads as an empty dictionary and stays in the server's cache. Requests during an outage each reach the host, with no timeout of the module's own.

The server keeps loaded payloads in an in-process LRU cache of up to `cacheMaxSize` entries (1000 by default) that reloads an entry after `cacheTtl` when set; [Performance tuning](/guide/performance) covers both, and [`cacheStorage`](/guide/performance#shared-cache-for-several-instances) adds a cache shared by instances. Do not add a Nitro `cache` route rule on `/_locales/**` on top: it keys by full URL, query included, and stores a third copy.

## App baseURL and payload hosts

With `app.baseURL: '/shop/'` the browser fetches `/shop/_locales/...`; the copy stays in `.output/public/_locales/`, which Nitro serves under the base (a static host must mount the output at `/shop/`). Nothing else to set. Locale prefixes and [excluded paths](/guide/excluding-static-files) are matched without the base. `app.cdnURL` moves Nuxt's assets, not the payloads: they stay on the app's origin.

To serve payloads from another origin, point the client and server at it and turn the local outputs off:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    apiBaseClientHost: 'https://cdn.example.com',
    apiBaseServerHost: 'https://cdn.example.com',
    translationPayloads: {
      serverHandler: false,
      publicAssets: false,
    },
  },
})
```

The host must serve the same `<apiBaseUrl>/<page>/<locale>/data.json` layout. The build warns when every local output is off and a host is missing. The same values can come from `NUXT_I18N_APP_BASE_URL`, `NUXT_I18N_APP_BASE_CLIENT_HOST` and `NUXT_I18N_APP_BASE_SERVER_HOST` at build time. `NUXT_I18N_APP_BASE_SERVER_HOST` also works at runtime and wins over the build value. See [`apiBaseServerHost`](/api/module-options#apibaseserverhost) for the details.

## Platform notes

### Firebase

App Hosting runs the Node build: use the default preset or `firebase-app-hosting`, and Node 20+. The `firebase` preset (Cloud Functions) embeds the payloads and needs `firebase-functions`. Firebase Hosting (static) serves `.output/public` as files, so `/_locales/**` gets Hosting's headers; if JSON comes back with the wrong `Content-Type` or caching, add a `headers` entry for `/_locales/**` in `firebase.json`. Nuxt `routeRules` headers do not apply to files Hosting serves itself, and the payload route sets its own `Content-Type` and `Cache-Control` on responses that do reach the server.

### Several instances of one build

One artifact can run with a different default or disabled locale per instance through environment variables: see [Runtime overrides](/guide/runtime-overrides). A locale disabled only at runtime still has its static files in `public/`; disable it at build time if those must not be reachable.

Instances that load dictionaries from a remote host can share them in Redis, Cloudflare KV or another Nitro storage, so the backend gets one request instead of one per instance: see [Shared cache for several instances](/guide/performance#shared-cache-for-several-instances).

### AWS Amplify

`aws-amplify` keeps static files beside its compute folder, not next to the server, so the payloads are embedded like on a function platform.

## Related

- [Performance tuning](/guide/performance)
- [Runtime overrides](/guide/runtime-overrides)
- [`translationPayloads` reference](/api/module-options#translationpayloads)
- [Layers and domains](/guide/layers)
