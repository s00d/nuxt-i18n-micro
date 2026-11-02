---
title: Deployment
description: Deploy to a Node server, serverless or Edge, or as a static site — where translation payloads go, what each platform needs, proxies, and caching.
outline: [2, 3]
---

# Deployment

The module works with any Nitro preset without extra config: it picks where translation files live from the preset you build for. This page explains that choice, so you know what ends up in `.output/`, which headers the payloads get, and what to change for static hosting, large catalogs, a sub-path, a proxy or a CDN. Defaults are right for most apps; read the section for your platform.

Deployed and checked on real hosts: Cloudflare Workers and Pages, Vercel and Vercel Edge, Netlify and Netlify Edge, Cloud Run and Deno Deploy, each with what [Platforms](#platforms) lists. The other presets were built and run locally.

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

Deploy the whole `.output/` directory. The module needs Node 20 or newer, and Nuxt has its own minimum: Nuxt 4.5 declares `^22.19.0 || ^24.11.0 || >=26.0.0`.

A process under steady load can hold much more memory than its live heap. See [Memory on a Node server](/guide/performance#memory-on-a-node-server) before you set a container limit.

With another layout, the module embeds the payloads as described in the next section. That covers a custom `nitro.output.publicDir`, which the build reads once, and `serveStatic: true` on a preset that keeps static files elsewhere. If a build reads `public/` and the folder does not reach the server, as with `aws-lambda` and `serveStatic: true`, the server logs one error and pages show raw keys. Set `nitro.serveStatic: false` to embed the payloads.

## Serverless and Edge

These presets cannot read `public/` at runtime:

- function presets that ship `public/` to a CDN or do not serve it: `vercel`, `netlify`, `aws-lambda`, `aws-amplify`, `azure-swa`, `firebase`, `stormkit`, `zeabur`, `node-listener`;
- Edge presets without a file system: `cloudflare-module`, `cloudflare-pages`, `vercel-edge`, `netlify-edge`, `deno_deploy`;
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

| Platform           | Limit                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------- |
| Cloudflare Workers | 64 MiB uncompressed, on Free and Paid. No compressed limit. 1 s startup, 128 MB memory |
| Vercel Edge        | 1 MB gzip on Hobby, 2 MB on Pro, 4 MB on Enterprise                                    |
| Netlify Edge       | 20 MB compressed                                                                       |

The build sums the dictionaries it embeds and warns only past the lowest limit of the platform. It counts dictionaries alone, so the app comes on top. As an example, 120 pages × 4 locales with a 60 KB root file embed 34.9 MiB in `premerged` mode, which fits Cloudflare but not Vercel Edge or Netlify Edge, and 5.7 MiB in `source` mode, which is still 3 MB gzip on Vercel Edge. A catalog that size on Vercel Edge needs a [payload host](#app-baseurl-and-payload-hosts).

`source` pays a merge per page and locale in each isolate, about 1 ms in that example and 7 ms of CPU in a cold one. It grows with the size of the fallback chain: about 43 ms for 4 MB of chain files. Netlify Edge allows 50 ms of CPU per request and Cloudflare's Free plan 10 ms.

### Dates on Edge runtimes

`$td` uses the runtime's `Intl`, and its ICU data can differ from the browser's. On Netlify Edge a Russian date has U+202F before `г.` where Chrome has a normal space, so Vue logs one hydration mismatch and the text corrects itself on hydration. Plain Nuxt with plain `Intl` does the same there, and Deno Deploy does not. `<i18n-t>` with `date` or `relativeDate` already allows the mismatch. For `$td` in a template, put `data-allow-mismatch="text"` on the element.

## Static site (nuxi generate)

```bash
npx nuxi generate
```

`nuxi build --preset <static preset>` does the same. The default `premerged` mode writes every payload into `.output/public/_locales/`, so any static host can serve them. Pages are prerendered for each locale: under `prefix` the module seeds every localized root (`/en`, `/de`), and `/` is kept as a redirect stub. Leave [`prerenderRoutes`](/api/module-options#translationpayloads) off: the public copy already contains the payload files. With `source` mode or `publicAssets: false` there is nothing for the browser to read, and the build warns.

There is no server to read a cookie or `Accept-Language`, so a saved locale does not redirect `/` on the first load. Under `no_prefix` the HTML holds the default locale, and a saved cookie is not applied on load: `$switchLocale` still works in the open page.

For Cloudflare Pages see [Cloudflare Pages](#cloudflare-pages).

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

A static host applies its own headers to these files; set caching in the host's config. The module's `/_locales/*` rule does reach Cloudflare Pages through `_headers` and Vercel through `config.json`, as `public, max-age=60`. To ship `.gz` / `.br` siblings, turn on `nitro.compressPublicAssets` — the module compresses the payload copy with the same settings.

## Cache headers and dateBuild

| Request                                                                                  | `Cache-Control`                                                                                                 |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Node server or route, `?v=` equal to the current `dateBuild`, a non-empty dictionary     | `private, max-age=<httpCacheDuration>, immutable`                                                               |
| Node server or route, without `?v=`, with an old one, or an empty dictionary             | `public, max-age=0, must-revalidate`                                                                            |
| A host's copy of `public/`, any `?v=`                                                    | `public, max-age=60` ([`httpCacheControl`](/api/module-options#httpcachecontrol)) |
| `source` mode, `cacheTtl`, or `apiBaseServerHost`: a dictionary can change with no build | the `httpCacheControl` header, always                                                                           |
| Server route, the dictionary could not be read                                           | `503`, `no-store`                                                                                               |
| dev server                                                                               | none                                                                                                            |

The URL with the current `v` is pinned like a hashed asset, and only what sees the query can say so: the server route, and a Node server, which sets the header on its static files. It is `private` so a CDN that ignores the query cannot answer the next `v` from this response. A host's static files take a path-wide header from a `/_locales/**` route rule, which cannot see the query, so it stays short; a repeat load still blocks on nothing. An old `v` stays servable, as cached HTML names it.

`httpCacheControl: false` keeps every static file on `max-age=0, must-revalidate`. [`httpCacheDuration`](/api/module-options#httpcacheduration) defaults to one year; `0` sends no header. `$clearCache()` revalidates whatever it loads next.

Safari requests a preloaded payload again when it may not reuse the response: with `no-cache` and an `ETag` the second request is a `304`, with neither a cache header nor a validator it is a second full download. A `max-age` above `0` gives one request. Only `httpCacheDuration: 0` on a host that adds no validator pays this.

[`dateBuild`](/api/module-options#datebuild) is the `?v=` value. By default it is a hash of your translation files, so it changes only when translations change and browsers keep their cached payloads across deploys that did not touch them. It also moves with the fallback chain. Set it yourself to pin a value, or set `0` / `''` to drop `?v=` entirely (payloads are then never `immutable`). After replacing a dictionary in place on a Node server, restart with `NUXT_I18N_DATE_BUILD=<new value>`: nothing else moves `v` without a rebuild.

### Root and delta files

`premerged` writes one root per locale, `__root/<locale>/data.json`, and in each page's file only what differs from it. The file marks the root it was made against with a `__i18n_root` key. The browser fetches both, the page shows nothing until both are in, and SSR merges them once per chunk. A file with no mark is a whole dictionary and stands alone: dev, `source` mode, the server route, and a host still holding older files all answer one, with no setting. So anyone reading `_locales/*/data.json` directly reads a delta. Set `translationPayloads.rootDelta: false` to keep whole files.

A tab open across a deploy that asks for a new delta sees that it was made against another root, and fetches that root before showing it.

### When a dictionary cannot be read

A failed fetch from a host (anything but a 404), an unreadable or corrupt file, or a 200 that is not a JSON object reaches no cache, and the next request reads again:

- a page render logs a warning and shows raw keys for that dictionary, with HTTP 200;
- `/_locales/...` answers `503` with `no-store`;
- `useTranslationServerMiddleware` gives a `t` that answers the key or the default value.

Such a page is a 200, so an `swr` or `cache` route rule, and a CDN, keeps its raw keys for their TTL: the module cannot mark that response. Requests during an outage each reach the host, with no timeout of the module's own.

A 404 from the host means it has no such file, which is not a failure. A page render shows the root dictionary, as the browser does, and `/_locales/...` answers the same 404. No cache keeps either, so a file that appears is read on the next request, at the cost of one request to the host per render of such a page. With no root file either the dictionary is empty, and a [prerender](/guide/upgrade#server-build-and-deployment) fails.

The server keeps loaded payloads in an in-process LRU cache of up to `cacheMaxSize` entries (1000 by default) that reloads an entry after `cacheTtl` when set; [Performance tuning](/guide/performance) covers both, and [`cacheStorage`](/guide/performance#shared-cache-for-several-instances) adds a cache shared by instances. Do not add a Nitro `cache` route rule on `/_locales/**` on top: it keys by full URL, query included, and stores a third copy.

## App baseURL and payload hosts

With `app.baseURL: '/shop/'` the browser fetches `/shop/_locales/...`; the copy stays in `.output/public/_locales/`, which Nitro serves under the base (a static host must mount the output at `/shop/`). Nothing else to set. Locale prefixes and [excluded paths](/guide/excluding-static-files) are matched without the base. `app.cdnURL` moves the payloads too, when they are files in `public/`: the browser fetches and preloads `<cdnURL>/_locales/...`. The CDN must then hold `_locales/` beside `_nuxt/`, at that path, and allow your site's origin (CORS), as the file arrives by `fetch`. A dictionary only the server route answers (`source` mode, no public copy) stays on the app's origin.

A runtime `NUXT_APP_BASE_URL` on `cloudflare-module` needs Node compatibility (`nodejs_compat`). With `nitro.cloudflare.nodeCompat` off, which Nitro also falls to on an old date with no flag, it does not see the variable and serves `/`, plain Nuxt included, while a locale redirect still goes to the base. Set `app.baseURL` at build there.

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
      serverAssets: false,
    },
  },
})
```

On Node `serverAssets` writes the same copy for the server's own reads, and that file answers `/_locales`: it must be off too, also if you keep the server route for the browser, which it would never reach. The host must serve the same `<apiBaseUrl>/<page>/<locale>/data.json` layout. The build warns when every local output is off and a host is missing. The same values can come from `NUXT_I18N_APP_BASE_URL`, `NUXT_I18N_APP_BASE_CLIENT_HOST` and `NUXT_I18N_APP_BASE_SERVER_HOST` at build time. `NUXT_I18N_APP_BASE_SERVER_HOST` also works at runtime and wins over the build value. See [`apiBaseServerHost`](/api/module-options#apibaseserverhost) for the details.

## Platforms

Only what the module or its output needs. Accounts, regions and CLI logins are in the platform's docs.

### Cloudflare Workers

Preset `cloudflare_module`. `wrangler deploy` bundles Nitro's output a second time with esbuild, and after that a raw `defineAsyncComponent(() => import('./X.vue'))` renders empty on the server. Nuxt's default error page is one, so a 404 has an empty body and the browser logs a hydration mismatch. The client then renders the page and the status stays 404, but without JavaScript the page is blank. This is [nuxt#33270](https://github.com/nuxt/nuxt/issues/33270): plain Nuxt without the module does the same. Page routes are not affected.

Turn the second bundle off:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true, // `wrangler` below applies only with it
      wrangler: {
        no_bundle: true,
        find_additional_modules: true,
        rules: [{ type: 'ESModule', globs: ['**/*.mjs'] }],
      },
    },
  },
})
```

```bash
npx nuxi build
cd .output/server && npx wrangler deploy -c wrangler.json
```

Set `compatibilityDate` to `2024-09-19` or later: an older one picks the legacy preset, which writes no `wrangler.json` and gives no error. The 404 then renders, and the upload gets smaller: 190 KiB gzip against 246 KiB on the test app. Your own `error.vue` is the other way out, but it covers only the error page.

The module itself does not need `nodejs_compat`. For the limits see [Bundle limits](#bundle-limits-on-edge).

### Cloudflare Pages

Use the `cloudflare-pages-static` preset. `nuxi generate --preset cloudflare-pages` is a server build with no `index.html`.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'cloudflare-pages-static',
    prerender: { autoSubfolderIndex: false },
  },
})
```

```bash
npx nuxi generate
npx wrangler pages project create my-site --production-branch main --force
npx wrangler pages deploy dist --project-name my-site --branch main
```

- **Output.** The preset writes to `dist/`, not `.output/public`.
- **`--force`.** Without it a new wrangler (4.156 here) hands `pages project create` over to Workers. With it you get a classic Pages project. It is needed once, for the create.
- **`autoSubfolderIndex: false`.** Pages answers `/de` with a 308 to `/de/` while canonical and `hreflang` name `/de`, so they point at a redirect. With this option the file is `de.html`, and the redirect is gone.
- **`NUXT_E1005` in the console on a 404** is a normal 404. Nuxt reports it that way because `404.html` starts on the client, before the app is mounted. The page works, and plain Nuxt prints the same line.

### Vercel and Vercel Edge

Presets `vercel` and `vercel_edge`, with no change to the app. The tags work without `metaBaseUrl`, from the platform's forwarded headers. Vercel Edge has a small bundle limit: see [Bundle limits](#bundle-limits-on-edge). For a shared cache use the [`upstash` driver](/guide/performance#upstash-on-vercel-and-vercel-edge).

### Netlify

Presets `netlify` and `netlify_edge`.

```bash
npx nuxi build --preset netlify
npx netlify deploy --prod --no-build --dir dist --functions .netlify/functions-internal
```

- **Leave `nitro.output` unset.** The preset writes `.netlify/` and `dist/` itself.
- **Keep a `package.json` in the folder you deploy from.** Without one the CLI looks at the parent folder and deploys no function, with no error.
- **Netlify Edge** deploys with `--dir dist` alone. See [Dates on Edge runtimes](#dates-on-edge-runtimes).

### Cloud Run

Use the default `node-server` build. `gcloud run deploy --source` needs a `Dockerfile` in the output folder when docker is not running locally:

```dockerfile
# .output/Dockerfile
FROM node:22-slim
WORKDIR /app
COPY . .
ENV NODE_ENV=production
CMD ["node", "server/index.mjs"]
```

```bash
cd .output && gcloud run deploy my-app --source .
```

The tags work without `metaBaseUrl`, from the platform's forwarded headers.

### Deno Deploy

Preset `deno_deploy`. `deno deploy` replaces `deployctl`. Create a dynamic app with the entrypoint `server/index.ts`, and deploy from the output folder.

### Firebase

App Hosting runs the Node build: use the default preset or `firebase-app-hosting`, and Node 20+. The `firebase` preset (Cloud Functions) embeds the payloads and needs `firebase-functions`. Firebase Hosting (static) serves `.output/public` as files, so `/_locales/**` gets Hosting's headers; if JSON comes back with the wrong `Content-Type` or caching, add a `headers` entry for `/_locales/**` in `firebase.json`. Nuxt `routeRules` headers do not apply to files Hosting serves itself, and the payload route sets its own `Content-Type` and `Cache-Control` on responses that do reach the server.

### AWS Amplify

`aws-amplify` keeps static files beside its compute folder, not next to the server, so the payloads are embedded like on a function platform.

### Several instances of one build

One artifact can run with a different default or disabled locale per instance through environment variables: see [Runtime overrides](/guide/runtime-overrides). A locale disabled only at runtime still has its static files in `public/`; disable it at build time if those must not be reachable.

Instances that load dictionaries from a remote host can share them in Redis, Upstash, Cloudflare KV or D1, Deno KV or another Nitro storage, so the backend gets one request instead of one per instance. It is a cache, not a source of translations: see [Shared cache for several instances](/guide/performance#shared-cache-for-several-instances).

## Behind a proxy or CDN

The app has to learn the public host and the scheme from the request.

| The proxy sends                              | Plain build                                      | Build with `baseUrl` on locales                                                   |
| -------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------- |
| The real `Host`                              | Nothing to set                                   | Nothing to set                                                                    |
| The origin's `Host`, plus `X-Forwarded-Host` | Nothing to set                                   | [`trustForwardedHost: true`](/api/module-options#trustforwardedhost)              |
| Neither                                      | [`metaBaseUrl`](/api/module-options#metabaseurl) | No setting helps: every request looks like the origin's host, so change the proxy |

- **`X-Forwarded-Proto`.** Send it, or canonical URLs read `http://` behind an HTTPS proxy. `metaBaseUrl` also fixes this.
- **In a domain build** the domain picks the base URL of the tags. `metaTrustForwardedHost` does not choose the domain there, only `trustForwardedHost` does.
- **Redirects are relative and the locale cookie has no `Domain`,** so both stay on the public host.

::: warning Pin `metaBaseUrl` when the origin stays reachable
On a plain build without `metaBaseUrl` or `site.url`, canonical, `hreflang` and `og:url` take their host from the request. [`metaTrustForwardedHost`](/api/module-options#metatrustforwardedhost) is on by default, so a direct request with `X-Forwarded-Host: evil.example` gets `https://evil.example` in those tags, and a cache in front spreads that page. A platform host such as `*.workers.dev` is exactly such an origin. `metaBaseUrl` closes this for `Host` too. A known host of a domain build keeps its own `baseUrl`. With `trustForwardedHost: true` a direct client can pick the page of another domain, so turn that on only behind a proxy that overwrites the header.
:::

## Caching HTML

Most URLs are safe to cache, because they name their locale. These depend on the visitor:

| Setup                          | URLs                                              |
| ------------------------------ | ------------------------------------------------- |
| Default, `autoDetectPath: '/'` | `/`                                               |
| `prefix`                       | `/` and every unprefixed URL, which only redirect |
| `autoDetectPath: '*'`          | Every URL                                         |
| `no_prefix`                    | Every page                                        |

- **`Vary`.** Those responses carry `Vary` with `Cookie` when [`localeCookie`](/api/module-options#localecookie) is set and `Accept-Language` when `autoDetectLanguage` is on. A cache that honours it keeps the answers apart.
- **A cache that ignores `Vary`,** such as "cache everything by URL", must skip those URLs. Otherwise one visitor's `302 /de` reaches the next visitor, and a stored default page drops the redirect for everyone. On `/` you can also set `redirects: false`. Nitro's route cache keys on the path and its `varies` list, so keep `/` out of `swr` and `cache` rules as well.
- **`Set-Cookie`.** With `localeCookie` set, every server-rendered page under a prefix carries `Set-Cookie`, and a correct CDN will not store it. For cached HTML leave `localeCookie` off, or strip the header at the edge.
- **`swr` and `cache` rules on a domain build.** The module adds `host` to `cache.varies` of every such rule, and `x-forwarded-host` with `trustForwardedHost`, so one domain does not serve another its page. A rule with `cache: false` stays as written. `isr` is the platform's cache: check that it keys on the host. With the host in the key, a client that sends made-up hosts adds cache entries.

For the payload files see [Cache headers and dateBuild](#cache-headers-and-datebuild).

## Related

- [Performance tuning](/guide/performance)
- [Runtime overrides](/guide/runtime-overrides)
- [`translationPayloads` reference](/api/module-options#translationpayloads)
- [Layers and domains](/guide/layers)
- [SEO](/guide/seo)
