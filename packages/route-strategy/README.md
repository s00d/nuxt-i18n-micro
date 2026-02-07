# @i18n-micro/route-strategy

High‑performance route generation and localization strategies for **Nuxt I18n Micro**.

This package is responsible for turning Nuxt page definitions (`NuxtPage[]`) into a fully localized route tree for all supported strategies:

- `no_prefix`
- `prefix`
- `prefix_except_default`
- `prefix_and_default`

It is used by the main Nuxt module at build/extend‑pages time and is designed to be:

- deterministic (stable snapshots),
- fast (single pass over pages, no heavy allocations),
- and testable (Jest snapshot suite under `tests/`).

---

## Overview

At a high level, `@i18n-micro/route-strategy`:

- takes the raw Nuxt `pages` array;
- applies the selected i18n strategy;
- expands each page into zero, one or many localized routes;
- wires in:
  - `globalLocaleRoutes` (custom paths per locale),
  - `filesLocaleRoutes` (file‑level locale paths),
  - `routeLocales` (locale restrictions),
  - `noPrefixRedirect` flag;
- keeps aliases, children and internal/excluded routes consistent.

All of this is done without any Nuxt runtime / Vue Router dependency – it operates purely on plain `NuxtPage` objects, so it is safe to run in Node during build and easy to test.

---

## Core Concepts

### Strategies

The generator supports the same strategies as the runtime:

- **`no_prefix`**
  - URLs have **no locale prefix** (`/about`, `/kontakt`).
  - Locale is handled via cookies / runtime logic, not via path.
  - `globalLocaleRoutes` are used to generate per‑locale variants where appropriate, but the *visible* URLs stay prefix‑less.

- **`prefix`**
  - All localized routes are prefixed: `/en/about`, `/de/ueber-uns`, etc.
  - There is **no unprefixed** default route; every locale uses its own prefix.

- **`prefix_except_default`**
  - Default locale uses no prefix (`/about`).
  - Non‑default locales are prefixed (`/de/ueber-uns`).
  - This is the most complex strategy around children, aliases and custom paths.

- **`prefix_and_default`**
  - Default locale is available **both** as unprefixed and prefixed:
    - `/about` and `/en/about` can coexist.
  - Non‑default locales behave like in `prefix`.

### Inputs and configuration

The main entry point is the `RouteGenerator` class:

```ts
import type { NuxtPage } from '@nuxt/schema'
import { RouteGenerator } from '@i18n-micro/route-strategy'

const generator = new RouteGenerator({
  locales,               // Array<{ code, iso, name, baseUrl?, baseDefault? }>
  defaultLocaleCode,     // e.g. 'en'
  strategy,              // 'no_prefix' | 'prefix' | 'prefix_except_default' | 'prefix_and_default'
  globalLocaleRoutes,    // Optional: per‑path custom routes per locale
  filesLocaleRoutes,     // Optional: per‑file routes extracted at build time
  routeLocales,          // Optional: per‑route locale restrictions
  noPrefixRedirect,      // Optional: behavior for redirect helpers in no_prefix
})

const pages: NuxtPage[] = [
  { path: '/about', name: 'about' },
  // ...
]

generator.extendPages(pages)
// `pages` is now mutated in‑place and contains localized routes
```

Key config fields:

- **`globalLocaleRoutes`**:
  - Map from *canonical path* or *route name* to per‑locale paths:
  - Example:
    ```ts
    const globalLocaleRoutes = {
      '/about': {
        en: '/about',
        de: '/ueber-uns',
        ru: '/o-nas',
      },
    }
    ```

- **`filesLocaleRoutes`**:
  - Map extracted from files (e.g. Vite/nuxt loader) that describes custom paths defined in code (`$defineI18nRoute`‑like APIs).
  - Used as a fallback when there is no explicit `globalLocaleRoutes` entry.

- **`routeLocales`**:
  - Restricts which locales are allowed for a given page path:
    ```ts
    const routeLocales = {
      '/about': ['en', 'de'], // 'ru' will not get localized variants
    }
    ```

---

## Internal Architecture (for Contributors)

> This section is intended for developers working on `@i18n-micro/route-strategy` itself.

The package is structured around **strategies** and a small **core**:

- `src/route-generator.ts`
  - Thin facade around strategy selection and Nuxt `extendPages` hook contract.
- `src/core/context.ts`
  - `GeneratorContext`:
    - holds locales, default locale, strategy;
    - provides helpers to query:
      - `getAllowedLocales` (applies `routeLocales`);
      - `getCustomPath` (combines `globalLocaleRoutes` + `filesLocaleRoutes`);
      - `localizedPaths` map (used to resolve children/aliases).
- `src/core/localized-paths.ts`
  - Responsible for building a normalized map of `{ pathKey -> perLocalePath }`.
  - Used heavily by strategies to resolve nested/child routes and aliases.
- `src/core/alias.ts`
  - `generateAliasRoutes`:
    - creates proper alias routes for each localized variant;
    - ensures that aliases inherit children so that `/company/team` works when `/about/team` exists.
- `src/strategies/abstract.ts`
  - `BaseStrategy` and helpers:
    - common logic for recursion over children;
    - helpers for looking up custom paths;
    - ensures immutability and deterministic ordering.
- `src/strategies/*.ts`
  - Concrete strategies:
    - `no-prefix.ts`
    - `prefix.ts`
    - `prefix-except-default.ts`
    - `prefix-and-default.ts`
  - Each strategy implements:
    - `processPage(page, context)` → `NuxtPage[]`:
      - decides how the original page should be localized (or left as‑is);
      - uses `localizeChildren` / `localizeChildrenAllLocales` from `BaseStrategy` for deep trees;
      - respects `internal`/excluded routes.

The implementation is heavily covered by snapshot tests under `tests/`:

- `basic.test.ts` – common/simple scenarios.
- `paths-and-alias.test.ts` – aliases, internal paths, Cloudflare Pages, `filesLocaleRoutes`.
- `locale-restrictions.test.ts` – `routeLocales` behavior.
- `strategies.test.ts` – cross‑strategy matrix.
- `deep-nesting.test.ts` / `advanced.test.ts` – complex trees.
- `critical-scenarios.test.ts` – regression cases.

When making changes, always run:

```bash
pnpm --filter @i18n-micro/route-strategy test
```

Snapshots are considered part of the public contract for this package – avoid changing them unless you are intentionally changing behavior and understand the migration impact.

---

## Developer Guidelines

- **Do not depend on Nuxt/Vue Router here**:
  - This package must stay framework‑agnostic and operate on `NuxtPage`‑like POJOs only.
  - All runtime behaviour (redirects, `$localeRoute`, `$localePath`, etc.) is handled by other packages (`@i18n-micro/core`, `@i18n-micro/path-strategy`, runtime plugins).

- **Keep strategies deterministic**:
  - Given the same input pages and config, output must be stable.
  - Do not introduce randomization or time‑dependent behavior.

- **Prefer small, composable helpers**:
  - Logic that is shared between multiple strategies should live in:
    - `BaseStrategy`,
    - or dedicated helpers in `core/`.
  - Avoid copying complex conditionals into each strategy.

- **Respect performance**:
  - `extendPages` is called at build time, and can run on large apps.
  - Avoid unnecessary deep clones; reuse objects where safe.
  - Prefer simple loops over heavy abstractions.

---

## Testing & Contribution

- Tests live in `packages/route-strategy/tests`.
- Jest config: `packages/route-strategy/jest.config.cjs`.
- To run only these tests:

```bash
pnpm --filter @i18n-micro/route-strategy test
```

If you contribute new behavior:

1. Add or update a dedicated test file.
2. Prefer asserting on the full `pages` array via snapshots to catch regressions.
3. Document non‑obvious behavior in this README or in inline comments near the relevant strategy/core function.

---

## Relationship to Other Packages

- **`@i18n-micro/core`**:
  - Uses the routes generated here to implement runtime helpers (`$t`, `$localeRoute`, `$switchLocaleRoute`, etc.).
  - Assumes the naming and path conventions from `@i18n-micro/route-strategy` are stable.

- **`@i18n-micro/path-strategy`**:
  - Implements strategy‑aware **frontend** path building for `$localeRoute` / `$localePath`.
  - Must remain consistent with how `@i18n-micro/route-strategy` names/structures routes.

If you change route naming or generation rules here, you almost certainly need to review these packages as well.
