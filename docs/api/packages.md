---
title: 'Package APIs'
description: 'The exported API of every @i18n-micro/* package, generated from the API snapshots CI checks against the source.'
outline: [2, 3]
---

# Package APIs

The Nuxt module is built from small `@i18n-micro/*` packages, and most of them work on their own: `@i18n-micro/vue` in a Vue app, `@i18n-micro/core` anywhere. Use these pages to look up what a package exports, per entry point. Each page is generated from the snapshot that [`pnpm run api:surface`](/contributing/maintenance-commands#api-surface) checks against the TypeScript sources, so an export cannot change without CI noticing.

<!-- generated:packages-index — do not edit; run `pnpm run docs:generate` -->

| Package | Entry points | Exports |
| --- | --- | --- |
| [`@i18n-micro/astro`](/api/packages/astro) | `@i18n-micro/astro`, `@i18n-micro/astro/client`, `@i18n-micro/astro/client/preact`, `@i18n-micro/astro/client/react`, `@i18n-micro/astro/client/svelte`, `@i18n-micro/astro/client/vue`, `@i18n-micro/astro/middleware`, `@i18n-micro/astro/node` | 50 |
| [`@i18n-micro/cli`](/api/packages/cli) | `@i18n-micro/cli` | 6 |
| [`@i18n-micro/core`](/api/packages/core) | `@i18n-micro/core`, `@i18n-micro/core/devtools`, `@i18n-micro/core/helpers`, `@i18n-micro/core/render` | 103 |
| [`@i18n-micro/devtools-ui`](/api/packages/devtools-ui) | `@i18n-micro/devtools-ui`, `@i18n-micro/devtools-ui/bridge`, `@i18n-micro/devtools-ui/bridge/create`, `@i18n-micro/devtools-ui/vite` | 26 |
| [`@i18n-micro/node`](/api/packages/node) | `@i18n-micro/node` | 16 |
| [`@i18n-micro/path-strategy`](/api/packages/path-strategy) | `@i18n-micro/path-strategy`, `@i18n-micro/path-strategy/types` | 21 |
| [`@i18n-micro/preact`](/api/packages/preact) | `@i18n-micro/preact`, `@i18n-micro/preact/router` | 42 |
| [`@i18n-micro/react`](/api/packages/react) | `@i18n-micro/react`, `@i18n-micro/react/client`, `@i18n-micro/react/router`, `@i18n-micro/react/server` | 91 |
| [`@i18n-micro/route-strategy`](/api/packages/route-strategy) | `@i18n-micro/route-strategy` | 12 |
| [`@i18n-micro/runtime`](/api/packages/runtime) | `@i18n-micro/runtime` | 17 |
| [`@i18n-micro/solid`](/api/packages/solid) | `@i18n-micro/solid`, `@i18n-micro/solid/router` | 39 |
| [`@i18n-micro/test-utils`](/api/packages/test-utils) | `@i18n-micro/test-utils` | 53 |
| [`@i18n-micro/types`](/api/packages/types) | `@i18n-micro/types` | 26 |
| [`@i18n-micro/types-generator`](/api/packages/types-generator) | `@i18n-micro/types-generator`, `@i18n-micro/types-generator/nuxt` | 7 |
| [`@i18n-micro/utils`](/api/packages/utils) | `@i18n-micro/utils/accept-language`, `@i18n-micro/utils/active-locales`, `@i18n-micro/utils/app-path`, `@i18n-micro/utils/auto-detect-path`, `@i18n-micro/utils/cache-control`, `@i18n-micro/utils/cookie`, `@i18n-micro/utils/deep-merge`, `@i18n-micro/utils/domains`, `@i18n-micro/utils/load-dir`, `@i18n-micro/utils/locale-head`, `@i18n-micro/utils/merge-i18n-head`, `@i18n-micro/utils/merge-source`, `@i18n-micro/utils/normalize`, `@i18n-micro/utils/parse-path`, `@i18n-micro/utils/payload-fetch`, `@i18n-micro/utils/payload-url`, `@i18n-micro/utils/resolve-hreflang`, `@i18n-micro/utils/resolve-locale`, `@i18n-micro/utils/resolve-og-locale`, `@i18n-micro/utils/runtime-config`, `@i18n-micro/utils/source-loader`, `@i18n-micro/utils/split-locale-routes` | 103 |
| [`@i18n-micro/vitepress`](/api/packages/vitepress) | `@i18n-micro/vitepress`, `@i18n-micro/vitepress/config`, `@i18n-micro/vitepress/node`, `@i18n-micro/vitepress/theme` | 56 |
| [`@i18n-micro/vue`](/api/packages/vue) | `@i18n-micro/vue`, `@i18n-micro/vue/router` | 30 |

<!-- /generated:packages-index -->

## Related

- [Framework packages](/integrations/) — setup guides for each package
- [Module options](/api/module-options) — options of the Nuxt module
- [Helpers](/api/methods) — runtime helpers of the Nuxt module
