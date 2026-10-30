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

With `node-server` (the default preset), `node-cluster` or any preset that serves `public/` from disk:

- payloads are copied to `.output/public/_locales/<page>/<locale>/data.json`;
- SSR reads them from that folder with `fs` (nothing is bundled into the server);
- the browser gets them as static files, or from the server route.

Deploy the whole `.output/` directory. Node 20 or newer is required.

## Serverless and Edge

Function presets that ship `public/` to a CDN (`vercel`, `netlify`, `aws-lambda`), Edge presets without a file system (`cloudflare-module`, `cloudflare-pages`, `vercel-edge`, `netlify-edge`), and `serveStatic: 'inline'` cannot read `public/` at runtime. There the module embeds the payloads into the server bundle as Nitro server assets (`assets:i18n`) and still writes the public copy for the browser.

Embedding the full page × locale matrix makes the bundle large, and the build warns about it. For big catalogs switch to `source` mode, which embeds the compact source files and merges root, page and fallback translations at runtime:

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

## Static site (nuxi generate)

```bash
npx nuxi generate
```

The default `premerged` mode writes every payload into `.output/public/_locales/`, so any static host can serve them. Pages are prerendered for each locale: under `prefix` the module seeds every localized root (`/en`, `/de`), and `/` is kept as a redirect stub. Leave [`prerenderRoutes`](/api/module-options#translationpayloads) off: the public copy already contains the payload files.

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

Keep the folders outside `.output`: each run empties it. Absolute links to the other domains are not crawled. Without the variable the build warns and generates the build config. On a Node server the same variable pins the process to one domain, whatever `Host` says.

A static host applies its own headers to these files, not the ones described below; set caching in the host's config. To ship `.gz` / `.br` siblings, turn on `nitro.compressPublicAssets` — the module compresses the payload copy with the same settings.

## Cache headers and dateBuild

| Request | `Cache-Control` |
| --- | --- |
| `/_locales/...` with `?v=` equal to the current `dateBuild` | `public, max-age=<httpCacheDuration>, immutable` |
| the same URL without `?v=`, or with an old one | `public, max-age=0, must-revalidate` |
| dev server | none |

These are set by the server route (and a `/_locales/**` route rule with CORS enabled). [`httpCacheDuration`](/api/module-options#httpcacheduration) defaults to one year; `0` sends no header.

[`dateBuild`](/api/module-options#datebuild) is the `?v=` value. By default it is a hash of your translation files, so it changes only when translations change and browsers keep their cached payloads across deploys that did not touch them. Set it yourself to pin a value, or set `0` / `''` to drop `?v=` entirely (payloads are then never `immutable`).

The server keeps loaded payloads in an in-process LRU cache of up to `cacheMaxSize` entries (1000 by default) that reloads an entry after `cacheTtl` when set; [Performance tuning](/guide/performance) covers both. Do not add a Nitro `cache` route rule on `/_locales/**` on top: it keys by full URL, query included, and stores a third copy.

## App baseURL and payload hosts

With `app.baseURL: '/shop/'` the browser fetches `/shop/_locales/...`; the copy stays in `.output/public/_locales/`, which Nitro serves under the base (a static host must mount the output at `/shop/`). Nothing else to set. Locale prefixes and [excluded paths](/guide/excluding-static-files) are matched without the base.

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

The host must serve the same `<apiBaseUrl>/<page>/<locale>/data.json` layout. The build warns when every local output is off and a host is missing. The same values can come from `NUXT_I18N_APP_BASE_URL`, `NUXT_I18N_APP_BASE_CLIENT_HOST` and `NUXT_I18N_APP_BASE_SERVER_HOST` at build time. See [`apiBaseServerHost`](/api/module-options#apibaseserverhost) for the details.

## Platform notes

### Firebase

App Hosting runs the Node build: use the default preset and Node 20+. Firebase Hosting (static) serves `.output/public` as files, so `/_locales/**` gets Hosting's headers; if JSON comes back with the wrong `Content-Type` or caching, add a `headers` entry for `/_locales/**` in `firebase.json`. Nuxt `routeRules` headers do not apply to files Hosting serves itself, and the payload route sets its own `Content-Type` and `Cache-Control` on responses that do reach the server.

### Several instances of one build

One artifact can run with a different default or disabled locale per instance through environment variables: see [Runtime overrides](/guide/runtime-overrides). A locale disabled only at runtime still has its static files in `public/`; disable it at build time if those must not be reachable.

## Related

- [Performance tuning](/guide/performance)
- [Runtime overrides](/guide/runtime-overrides)
- [`translationPayloads` reference](/api/module-options#translationpayloads)
- [Layers and domains](/guide/layers)
