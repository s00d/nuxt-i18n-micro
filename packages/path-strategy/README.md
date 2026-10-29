# @i18n-micro/path-strategy

Runtime locale routing for **Nuxt I18n Micro**: which locale a URL is in, the URL of a page in another locale, and the server's redirect / 404 decisions.

It runs in the browser, so it is one small class (~2.6 KB gzip) with no runtime dependencies (`@i18n-micro/types` is types only).

---

## How it works

`@i18n-micro/route-strategy` generates the localized routes at build time. Each localized record carries `meta.i18n`:

```ts
{ name: 'about', locales: ['de'] } // base route name of the page, locales the record serves
```

path-strategy reads those records once from `router.getRoutes()` and builds an index, `page -> locale -> record`. Every answer is then one Map lookup and one `router.resolve`, so the URL it returns is always one the router serves.

It never re-reads `globalLocaleRoutes`: custom paths, restrictions and aliases are already in the records.

Matching a URL means walking every record in vue-router. The results of path lookups (`localeRoute('/x')`, `getClientRedirect`, `shouldReturn404`) and of resolved links are kept in bounded caches, so a repeated call is a Map hit.

---

## Installation

```bash
pnpm add @i18n-micro/path-strategy
```

Routes must come from `@i18n-micro/route-strategy` (the Nuxt module wires both).

---

## Usage

```ts
import { createPathStrategy } from '@i18n-micro/path-strategy'
import { useRouter } from 'vue-router'

const router = useRouter() // the app's router, serving the routes route-strategy generated

const i18n = createPathStrategy({
  strategy: 'prefix_except_default',
  defaultLocale: 'en',
  locales: [{ code: 'en' }, { code: 'de' }],
  router: {
    hasRoute: (name) => router.hasRoute(name),
    resolve: (to) => router.resolve(to),
    getRoutes: () => router.getRoutes(),
  },
})

i18n.localeRoute('de', { name: 'about' }) // { name: 'localized-about-de', path: '/de/ueber-uns', fullPath, params, ... }
i18n.switchLocaleRoute('en', 'de', router.currentRoute.value) // the current page in de
i18n.getClientRedirect('/about', 'de') // '/de/ueber-uns'
i18n.shouldReturn404('/en/about') // 'Default locale should not have prefix'
```

Routes added later with `router.addRoute` are seen after `setRouter(router)`, which rebuilds the index and clears the caches.

---

## API

| Method                                                    | Returns                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `localeRoute(locale, to)`                                 | `to` in `locale`. `to` is a name (`{ name, params, query, hash }`), a resolved route (e.g. `useRoute()`), or a path string in any locale's form. The result has `name`, `params`, `path` and `fullPath`, so it can be pushed by name. A locale with a `baseUrl` gives `{ path: url, fullPath: url }`. |
| `switchLocaleRoute(from, to, route, { i18nRouteParams })` | The current page in `to`. `i18nRouteParams[to]` replaces params. A page not served in `to` falls back to the default locale's record. A `baseUrl` locale gives an absolute URL string; `baseDefault` drops the prefix.                                                                                |
| `getCurrentLocale(route, override?)`                      | Locale of a route: its `locale` param, then the first path segment. Under `no_prefix` / `hashMode` it is `override` or the default.                                                                                                                                                                   |
| `getCurrentLocaleName(route, override?)`                  | `displayName` of that locale, or `null`.                                                                                                                                                                                                                                                              |
| `getRouteBaseName(route)`                                 | Base route name of the page (`localized-about-de` -> `about`).                                                                                                                                                                                                                                        |
| `getPluginRouteName(route, locale)`                       | Translation key of the page: its base name, or `index` with `disablePageLocales`.                                                                                                                                                                                                                     |
| `getLocaleFromPath(path)`                                 | Locale code in the first segment, or `null`.                                                                                                                                                                                                                                                          |
| `resolveLocaleFromPath(path)`                             | Locale a URL is in: the prefix, or the default under `prefix_except_default`. Always `null` under `no_prefix`.                                                                                                                                                                                        |
| `formatPathForResolve(path, from, to)`                    | An unprefixed path written in `from`'s form, prefixed so the router can resolve it.                                                                                                                                                                                                                   |
| `shouldReturn404(path)`                                   | Why a prefixed URL is a 404, or `null`: the default locale's prefix under `prefix_except_default`, a prefix on an unlocalized page, or a locale the page is not served in.                                                                                                                            |
| `getClientRedirect(path, preferred)`                      | For an unprefixed URL, where it goes in the preferred locale (`/about` -> `/de/ueber-uns`), or `null`. Prefixed URLs are never rewritten. Always `null` under `no_prefix` and `prefix_and_default`.                                                                                                   |
| `setRouter(router)`                                       | Swap the router; the index is rebuilt.                                                                                                                                                                                                                                                                |

---

## Strategies

| Strategy                | URLs                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| `prefix_except_default` | The default locale is unprefixed, the others prefixed.                                            |
| `prefix`                | Every locale prefixed.                                                                            |
| `prefix_and_default`    | Every locale prefixed. The default locale is also served unprefixed; links use the prefixed form. |
| `no_prefix`             | No prefix. A locale with its own custom path has its own records.                                 |

---

## Tests

```bash
pnpm test        # unit tests on a real vue-router
pnpm test:perf   # µs per call on a 300-page, 5-locale app, with budgets
pnpm test:dist   # built package (ESM + CJS, publint, npm pack)
```

The whole pipeline is characterized in the repository's `test/routing-characterization/`: 10 apps × 4 strategies, every URL and every navigation, kept as golden files.
