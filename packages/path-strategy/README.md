# @i18n-micro/path-strategy

Path and route strategies for **Nuxt I18n Micro**: locale resolution from URL, link generation, redirects, and SEO attributes (canonical, hreflang). Use this package when you need a single routing strategy at build time so only the chosen implementation is bundled.

---

## Overview

- **Strategies**: `no_prefix`, `prefix`, `prefix_except_default`, `prefix_and_default`
- **API**: `resolveLocaleFromPath`, `getLocaleFromPath`, `localeRoute`, `switchLocaleRoute`, `getRedirect`, `getSeoAttributes`, `getCanonicalPath`, `getRouteBaseName`
- **Framework-agnostic**: Works with any router that implements the `RouterAdapter` interface (`hasRoute`, `resolve`); compatible with Vue Router and custom adapters.

---

## Package structure

| Folder | Contents |
|--------|----------|
| `src/core/` | Types (`types.ts`), normalizer (`getPathWithoutLocale`, `getLocaleFromPath`), resolver, builder (`createLocalizedRouteObject`) |
| `src/strategies/` | `BasePathStrategy`, `createPathStrategy`, and strategy implementations: `no-prefix`, `prefix`, `prefix-except-default`, `prefix-and-default` |
| `src/utils/` | Path helpers (`path.ts`), route name helpers (`route-name.ts`: `getRouteBaseName`, `buildLocalizedName`, `isIndexRouteName`) |

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

In your Nuxt module’s `setup()` (or in `nuxt.config`), set the alias to the strategy entry you want:

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
    // optional: globalLocaleRoutes, routeLocales, routesLocaleLinks, noPrefixRedirect, includeDefaultLocaleRoute
  }

  const pathStrategy = new Strategy(context)
  return { provide: { i18nStrategy: pathStrategy } }
})
```

Only the selected strategy and the base class are included in the bundle; the other strategies are tree-shaken out.

### 4. Package exports

| Entry | Contents |
|-------|----------|
| `@i18n-micro/path-strategy` | Main entry: types, factory, all strategies, utils (`getRouteBaseName`, `buildLocalizedName`, `isIndexRouteName`) |
| `@i18n-micro/path-strategy/prefix` | `PrefixPathStrategy` and `Strategy` alias |
| `@i18n-micro/path-strategy/no-prefix` | `NoPrefixPathStrategy` and `Strategy` |
| `@i18n-micro/path-strategy/prefix-except-default` | `PrefixExceptDefaultPathStrategy` and `Strategy` |
| `@i18n-micro/path-strategy/prefix-and-default` | `PrefixAndDefaultPathStrategy` and `Strategy` |
| `@i18n-micro/path-strategy/types` | Types only (`PathStrategyContext`, `RouteLike`, `ResolvedRouteLike`, `RouterAdapter`, `SeoAttributes`, etc.) |

---

## API

### Factory

- **`createPathStrategy(ctx: PathStrategyContext)`** — Returns the strategy instance for `ctx.strategy`. Use for tests or server-side when you don’t use the alias.

### Utilities (from main entry)

- **`getRouteBaseName(route, options?)`** — Returns the base route name (without localized prefix/suffix). Options: `localizedRouteNamePrefix`, `locales`.
- **`buildLocalizedName(baseName, localeCode, prefix?)`** — Builds a localized route name (e.g. `about` + `de` + `localized-` → `localized-about-de`).
- **`isIndexRouteName(name, options?)`** — Returns whether the route name is the index route (e.g. `index`, `localized-index-en`). Options: `localizedRouteNamePrefix`, `locales`.

### Strategy interface

Each strategy implements:

| Method | Description |
|--------|-------------|
| `switchLocaleRoute(fromLocale, toLocale, route, options)` | Route (or path string) to navigate to when switching locale. Returns `RouteLike` or `string`. |
| `localeRoute(targetLocale, routeOrPath, currentRoute?)` | Localized route for the target locale. Always returns `RouteLike` with `path` and `fullPath` set. |
| `getCanonicalPath(route, targetLocale)` | Custom path for the route in that locale (from `globalLocaleRoutes`), or `null`. |
| `resolveLocaleFromPath(path)` | Locale code from path (strategy-specific; e.g. `no_prefix` returns `null`). |
| `getLocaleFromPath(path)` | Parses path and returns first segment if it is a locale code; used for initial state and redirect logic. |
| `getRedirect(currentPath, targetLocale)` | Path to redirect to, or `null`. Use in middleware: `strategy.getRedirect(to.fullPath, detectedLocale)`. |
| `getSeoAttributes(currentRoute)` | `{ canonical?, hreflangs? }` for `useHead`. |
| `getRouteBaseName(route)` | Base name for the route (delegates to `getRouteBaseName` with context). |

### Context (`PathStrategyContext`)

Import from `@i18n-micro/path-strategy/types`.

| Property | Description |
|----------|-------------|
| `strategy`, `defaultLocale`, `locales`, `localizedRouteNamePrefix`, `router` | Required. |
| `globalLocaleRoutes` | `Record<string, Record<string, string> \| false>`: custom path per route/locale; `false` = unlocalized. |
| `routeLocales` | `Record<string, string[]>`: route path or base name → list of locale codes; limits hreflang entries. |
| `routesLocaleLinks` | `Record<string, string>`: base name → key for `routeLocales` lookup (e.g. `'products-id'` → `'products'`). |
| `includeDefaultLocaleRoute` | When set, SEO and links can include the default locale variant. |
| `noPrefixRedirect` | When `true` (default), `NoPrefixPathStrategy.getRedirect` strips a leading locale segment (e.g. `/en/about` → `/about`). Set to `false` to disable. |
| `debug` | Enable debug logging. |

### Redirect behavior per strategy

- **prefix**: root `/` → `/{locale}`; paths without prefix get prefix; wrong prefix is replaced.
- **prefix_except_default**: default locale with prefix (e.g. `/en/about`) → path without prefix (`/about`); non-default without prefix → add prefix; root with non-default → `/{locale}`.
- **prefix_and_default**: same as prefix (all locales have prefix in URL).
- **no_prefix**: paths that start with a locale segment (e.g. `/en/about`) → path without segment (`/about`), unless `noPrefixRedirect` is `false`.

### Using getRedirect in middleware

```ts
const redirectPath = strategy.getRedirect(to.fullPath, detectedLocale)
if (redirectPath) return navigateTo(redirectPath)
```

---

## Integration with Nuxt I18n Micro

The main Nuxt module (**nuxt-i18n-micro**) integrates path-strategy by default: it generates the strategy from the chosen `strategy` option, creates the instance with runtime config and router, and provides it as `nuxtApp.$i18nStrategy`. The catch-all/fallback component (e.g. `locale-redirect.vue`) calls `strategy.getRedirect(route.fullPath, targetLocale)` and redirects when a path is returned; otherwise it can show 404. No duplicated prefix/custom-path logic when the strategy is provided.

---

## Testing

The package is tested with **Jest**. Tests include unit tests for each strategy, `localeRoute`/`switchLocaleRoute`/`getRedirect`/`getSeoAttributes`/`getCanonicalPath`/`getRouteBaseName`, normalizer and path utils, and snapshot tests for documentation and regression.

```bash
pnpm test
```

---

## License

MIT
