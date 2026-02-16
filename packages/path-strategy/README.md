# @i18n-micro/path-strategy

Runtime path and route strategies for **Nuxt I18n Micro**: locale resolution from URL, link generation, redirects, and SEO helpers. Use this package when you need a single routing strategy at build time so only the chosen implementation is bundled.

---

## Overview

- **Strategies**: `no_prefix`, `prefix`, `prefix_except_default`, `prefix_and_default`
- **API**: `resolveLocaleFromPath`, `getLocaleFromPath`, `localeRoute`, `switchLocaleRoute`, `getRedirect`, `getClientRedirect`, `shouldReturn404`, `getCanonicalPath`, `getRouteBaseName`, `getCurrentLocale`, `getPluginRouteName`, `formatPathForResolve`
- **Framework-agnostic**: Works with any router that implements the `RouterAdapter` interface (`hasRoute`, `resolve`); compatible with Vue Router and custom adapters.
- **Tree-shakeable**: Subpath exports (`/prefix`, `/no-prefix`, etc.) let the bundler include only the selected strategy.

---

## Package structure

| Path | Contents |
|------|----------|
| `src/types.ts` | All type definitions (`PathStrategyContext`, `RouteLike`, `ResolvedRouteLike`, `RouterAdapter`, `PathStrategy`, etc.) |
| `src/path.ts` | Path utilities (`normalizePath`, `joinUrl`, `buildUrl`, `getPathWithoutLocale`, `getLocaleFromPath`, `hasKeys`, etc.) |
| `src/resolver.ts` | Route analysis and resolution (`analyzeRoute`, `getRouteBaseName`, `buildLocalizedName`, `isIndexRouteName`, `resolveCustomPath`, etc.) |
| `src/helpers.ts` | Strategy-agnostic helpers (`shouldReturn404`, `preserveQueryAndHash`, `tryResolveByLocalizedName`, etc.) |
| `src/strategies/` | `BasePathStrategy`, `createPathStrategy` factory, and strategy implementations: `no-prefix`, `prefix`, `prefix-except-default`, `prefix-and-default` |
| `src/strategies/common.ts` | Shared strategy logic (`defaultResolveLocaleRoute`) |

---

## Installation

```bash
pnpm add @i18n-micro/path-strategy @i18n-micro/types
```

Peer dependency: `@i18n-micro/types`.

---

## Setup: Using a single strategy via Nuxt alias (build-time)

To ship only the selected strategy (no factory, no other implementations), wire a Nuxt alias at build time.

### 1. Configure the Nuxt module

In your Nuxt module's `setup()` (or in `nuxt.config`), set the alias to the strategy entry you want:

```ts
// src/module.ts (or nuxt.config.ts)

import type { Strategies } from '@i18n-micro/types'

const strategyEntries: Record<Strategies, string> = {
  no_prefix: '@i18n-micro/path-strategy/no-prefix',
  prefix: '@i18n-micro/path-strategy/prefix',
  prefix_except_default: '@i18n-micro/path-strategy/prefix-except-default',
  prefix_and_default: '@i18n-micro/path-strategy/prefix-and-default',
}

const selectedStrategy = strategyEntries[options.strategy] ?? strategyEntries.prefix_except_default

nuxt.options.alias['#i18n-strategy'] = selectedStrategy
```

### 2. Type declarations for `#i18n-strategy`

So that TypeScript and your IDE understand the alias, add a generated declaration in `prepare:types`:

```ts
import { resolve } from 'node:path'

nuxt.hook('prepare:types', ({ references }) => {
  nuxt.addTemplate({
    filename: 'i18n-strategy.d.ts',
    getContents: () => `
      import { BasePathStrategy } from '@i18n-micro/path-strategy'
      export class Strategy extends BasePathStrategy {}
    `,
  })
  references.push({ path: resolve(nuxt.options.buildDir, 'i18n-strategy.d.ts') })
})
```

If your setup already resolves types for this alias, you can skip this step.

### 3. Use in a plugin or composable

Import the strategy only via the alias so the bundler includes just that implementation:

```ts
// runtime/plugins/01.i18n-strategy.ts

import { Strategy } from '#i18n-strategy'
import type { PathStrategyContext } from '@i18n-micro/path-strategy/types'

export default defineNuxtPlugin((nuxtApp) => {
  const context: PathStrategyContext = {
    strategy: useRuntimeConfig().public.i18n.strategy,
    defaultLocale: 'en',
    locales: [/* ... */],
    localizedRouteNamePrefix: 'localized-',
    router: { hasRoute, resolve },
    // optional: globalLocaleRoutes, routeLocales, routesLocaleLinks, noPrefixRedirect
  }

  const pathStrategy = new Strategy(context)
  return { provide: { i18nStrategy: pathStrategy } }
})
```

Only the selected strategy and the base class are included in the bundle; the other strategies are tree-shaken out.

### 4. Package exports

| Entry | Contents |
|-------|----------|
| `@i18n-micro/path-strategy` | Main entry: types, factory, all strategies, resolver utils (`getRouteBaseName`, `buildLocalizedName`, `isIndexRouteName`, `analyzeRoute`) |
| `@i18n-micro/path-strategy/prefix` | `PrefixPathStrategy` and `Strategy` alias |
| `@i18n-micro/path-strategy/no-prefix` | `NoPrefixPathStrategy` and `Strategy` |
| `@i18n-micro/path-strategy/prefix-except-default` | `PrefixExceptDefaultPathStrategy` and `Strategy` |
| `@i18n-micro/path-strategy/prefix-and-default` | `PrefixAndDefaultPathStrategy` and `Strategy` |
| `@i18n-micro/path-strategy/types` | Types only (`PathStrategyContext`, `RouteLike`, `ResolvedRouteLike`, `RouterAdapter`, etc.) |

---

## API

### Factory

- **`createPathStrategy(ctx: PathStrategyContext)`** — Returns the strategy instance for `ctx.strategy`. Use for tests or server-side when you don't use the alias.

### Resolver utilities (from main entry)

- **`getRouteBaseName(route, options?)`** — Returns the base route name (without localized prefix/suffix).
- **`buildLocalizedName(baseName, localeCode, prefix?)`** — Builds a localized route name (e.g. `about` + `de` + `localized-` -> `localized-about-de`).
- **`isIndexRouteName(name, options?)`** — Returns whether the route name is the index route (e.g. `index`, `localized-index-en`).
- **`analyzeRoute(route, ctx)`** — Returns a `RouteAnalysis` object with `baseName`, `pathWithoutLocale`, `localeFromPath`, and `isIndex` for a given route and context.

### Strategy interface

Each strategy implements:

| Method | Description |
|--------|-------------|
| `localeRoute(targetLocale, routeOrPath, currentRoute?)` | Localized route for the target locale. Returns `RouteLike` with `path` and `fullPath` set. |
| `switchLocaleRoute(fromLocale, toLocale, route, options)` | Route to navigate to when switching locale. Returns `RouteLike` or `string`. |
| `getRedirect(currentPath, targetLocale)` | Path to redirect to on server, or `null`. |
| `getClientRedirect(currentPath, preferredLocale)` | Path to redirect to on client (after hydration), or `null`. |
| `shouldReturn404(currentPath)` | Returns a 404 redirect path if the current path is invalid, or `null`. |
| `getCanonicalPath(route, targetLocale)` | Custom path for the route in that locale (from `globalLocaleRoutes`), or `null`. |
| `resolveLocaleFromPath(path)` | Locale code from path (strategy-specific; e.g. `no_prefix` returns `null`). |
| `getLocaleFromPath(path)` | Parses path and returns first segment if it is a locale code. |
| `getRouteBaseName(route)` | Base name for the route (delegates to resolver with context). |
| `getCurrentLocale(route, defaultLocaleOverride?)` | Determines current locale from route (considers strategy, hashMode, params, path). |
| `getPluginRouteName(route, locale)` | Returns the base route name for translation loading. |
| `getCurrentLocaleName(route, defaultLocaleOverride?)` | Returns `displayName` of the current locale, or `null`. |
| `setRouter(router)` | Replaces the router adapter at runtime. |
| `formatPathForResolve(path, fromLocale, toLocale)` | Transforms a path for cross-locale resolution. |
| `getDefaultLocale()` | Returns the default locale code. |
| `getLocales()` | Returns the configured locales array. |
| `getStrategy()` | Returns the strategy name. |

### Context (`PathStrategyContext`)

Import from `@i18n-micro/path-strategy/types`.

| Property | Description |
|----------|-------------|
| `strategy`, `defaultLocale`, `locales`, `localizedRouteNamePrefix`, `router` | Required. |
| `localeCodes` | Pre-computed locale code strings. Set automatically in constructor from `locales`. |
| `globalLocaleRoutes` | `Record<string, Record<string, string> \| false>`: custom path per route/locale; `false` = unlocalized. |
| `routeLocales` | `Record<string, string[]>`: route path or base name -> list of locale codes; limits hreflang entries. |
| `routesLocaleLinks` | `Record<string, string>`: base name -> key for `routeLocales` lookup (e.g. `'products-id'` -> `'products'`). |
| `noPrefixRedirect` | When `true` (default), `NoPrefixPathStrategy.getRedirect` strips a leading locale segment (e.g. `/en/about` -> `/about`). Set to `false` to disable. |
| `hashMode` | Locale stored in hash, no prefix in path. |
| `disablePageLocales` | When `true`, all pages use only global translations (no page-specific loading). |
| `debug` | Enable debug logging. |

### Redirect behavior per strategy

- **prefix**: root `/` -> `/{locale}`; paths without prefix get prefix; wrong prefix is replaced.
- **prefix_except_default**: default locale with prefix (e.g. `/en/about`) -> path without prefix (`/about`); non-default without prefix -> add prefix; root with non-default -> `/{locale}`.
- **prefix_and_default**: same as prefix (all locales have prefix in URL).
- **no_prefix**: paths that start with a locale segment (e.g. `/en/about`) -> path without segment (`/about`), unless `noPrefixRedirect` is `false`.

### Using getRedirect in middleware

```ts
const redirectPath = strategy.getRedirect(to.fullPath, detectedLocale)
if (redirectPath) return navigateTo(redirectPath)
```

---

## Integration with Nuxt I18n Micro

The main Nuxt module (**nuxt-i18n-micro**) integrates path-strategy by default: it generates the strategy from the chosen `strategy` option, creates the instance with runtime config and router, and provides it as `nuxtApp.$i18nStrategy`. The redirect plugin calls `strategy.getRedirect()` (server) and `strategy.getClientRedirect()` (client) and redirects when a path is returned.

---

## Testing

The package is tested with **Jest**. Tests include unit tests for each strategy, snapshot tests, a memory-leak test suite, and performance benchmarks.

```bash
# Unit tests
pnpm test

# Performance benchmarks (Node.js)
pnpm test:perf

# Performance benchmarks (real browsers — Chromium, Firefox, WebKit)
pnpm bench:browser:ci

# Single browser
pnpm bench:browser:ci -- --browser=firefox

# Interactive browser benchmark (opens dev server)
pnpm bench:browser
```

### Browser benchmarks

The `bench/` directory contains a browser-based performance benchmark that runs the same suite as the Node.js tests but in a real browser engine via Playwright. This measures actual client-side performance across V8 (Chromium), SpiderMonkey (Firefox), and JavaScriptCore (WebKit).

Results are saved as baselines per browser engine in `tests/__perf__/baseline-browser-{engine}.json`.

---

## Performance optimizations

- **Pure functions over classes** — Route resolution (`analyzeRoute`, `resolveCustomPath`, etc.) uses pure functions instead of a class-based `RouteResolver`, enabling better tree-shaking and V8 inlining.
- **Pre-computed context flags** — `localeCodes`, `_hasGR` (has global locale routes), and `_hasRL` (has route locales) are computed once in the constructor, avoiding `Object.keys()` allocations on hot paths.
- **Minimal object allocation** — Route objects are constructed via direct property assignment instead of `{ ...spread }` to reduce GC pressure.
- **Fast path utilities** — `normalizePath`, `joinUrl`, and `cleanDoubleSlashes` use character-code checks and fast paths for common cases (e.g. simple paths without double slashes).
- **`hasKeys()` utility** — O(1) check for whether an object has own keys, without `Object.keys()` array allocation.

---

## License

MIT
