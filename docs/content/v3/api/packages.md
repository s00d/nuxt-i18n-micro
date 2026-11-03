---
title: Package APIs
description: The exported API of every workspace package, read at build time from the snapshots CI checks against the source.
navigation:
  title: Package APIs
  order: 60
---

`nuxt-i18n-micro` is built from a set of small packages, most of which are usable on
their own — `@i18n-micro/vue` in a plain Vue app, `@i18n-micro/core` anywhere.

Each page below is generated from the API snapshot that
[`pnpm run api:surface`](/v3/guide/maintenance-commands#api-surface) checks against the
TypeScript sources, so an export cannot disappear without either this reference changing
or CI failing.

<!-- generated:packages-index — do not edit; run `pnpm run docs:generate` -->

| Package | Entry points | Exports |
| --- | --- | --- |
| [`@i18n-micro/astro`](/v3/api/packages/astro) | `@i18n-micro/astro`, `@i18n-micro/astro/client`, `@i18n-micro/astro/client/preact`, `@i18n-micro/astro/client/react`, `@i18n-micro/astro/client/svelte`, `@i18n-micro/astro/client/vue` | 58 |
| [`@i18n-micro/core`](/v3/api/packages/core) | `@i18n-micro/core`, `@i18n-micro/core/devtools`, `@i18n-micro/core/helpers` | 53 |
| [`@i18n-micro/devtools-ui`](/v3/api/packages/devtools-ui) | `@i18n-micro/devtools-ui`, `@i18n-micro/devtools-ui/bridge`, `@i18n-micro/devtools-ui/bridge/create`, `@i18n-micro/devtools-ui/vite` | 25 |
| [`@i18n-micro/hmr`](/v3/api/packages/hmr) | `@i18n-micro/hmr/cache-keys`, `@i18n-micro/hmr/generate-plugin`, `@i18n-micro/hmr/watcher` | 9 |
| [`@i18n-micro/node`](/v3/api/packages/node) | `@i18n-micro/node` | 15 |
| [`@i18n-micro/path-strategy`](/v3/api/packages/path-strategy) | `@i18n-micro/path-strategy`, `@i18n-micro/path-strategy/no-prefix`, `@i18n-micro/path-strategy/prefix`, `@i18n-micro/path-strategy/prefix-and-default`, `@i18n-micro/path-strategy/prefix-except-default`, `@i18n-micro/path-strategy/types` | 38 |
| [`@i18n-micro/preact`](/v3/api/packages/preact) | `@i18n-micro/preact` | 39 |
| [`@i18n-micro/react`](/v3/api/packages/react) | `@i18n-micro/react` | 38 |
| [`@i18n-micro/route-strategy`](/v3/api/packages/route-strategy) | `@i18n-micro/route-strategy` | 18 |
| [`@i18n-micro/runtime`](/v3/api/packages/runtime) | `@i18n-micro/runtime` | 16 |
| [`@i18n-micro/solid`](/v3/api/packages/solid) | `@i18n-micro/solid` | 33 |
| [`@i18n-micro/test-utils`](/v3/api/packages/test-utils) | `@i18n-micro/test-utils`, `@i18n-micro/test-utils/publish-smoke` | 60 |
| [`@i18n-micro/types`](/v3/api/packages/types) | `@i18n-micro/types` | 26 |
| [`@i18n-micro/types-generator`](/v3/api/packages/types-generator) | `@i18n-micro/types-generator`, `@i18n-micro/types-generator/nuxt` | 9 |
| [`@i18n-micro/utils`](/v3/api/packages/utils) | `@i18n-micro/utils/accept-language`, `@i18n-micro/utils/active-locales`, `@i18n-micro/utils/app-path`, `@i18n-micro/utils/auto-detect-path`, `@i18n-micro/utils/build`, `@i18n-micro/utils/cache-control`, `@i18n-micro/utils/cookie`, `@i18n-micro/utils/deep-merge`, `@i18n-micro/utils/merge-i18n-head`, `@i18n-micro/utils/merge-source`, `@i18n-micro/utils/normalize`, `@i18n-micro/utils/parse-path`, `@i18n-micro/utils/payload-config`, `@i18n-micro/utils/payload-fetch`, `@i18n-micro/utils/payload-stats`, `@i18n-micro/utils/payload-url`, `@i18n-micro/utils/resolve-hreflang`, `@i18n-micro/utils/resolve-locale`, `@i18n-micro/utils/resolve-og-locale`, `@i18n-micro/utils/route`, `@i18n-micro/utils/route-pattern`, `@i18n-micro/utils/runtime-config`, `@i18n-micro/utils/source-loader`, `@i18n-micro/utils/split-locale-routes` | 109 |
| [`@i18n-micro/vitepress`](/v3/api/packages/vitepress) | `@i18n-micro/vitepress`, `@i18n-micro/vitepress/config`, `@i18n-micro/vitepress/node`, `@i18n-micro/vitepress/theme` | 56 |
| [`@i18n-micro/vue`](/v3/api/packages/vue) | `@i18n-micro/vue`, `@i18n-micro/vue/router` | 28 |

<!-- /generated:packages-index -->

## See also

- [Integrations](/v3/integrations) — guides for using these packages in each framework
- [Module Options](/v3/api/module-options) — options accepted by the Nuxt module
- [Methods](/v3/api/methods) — the runtime helpers available inside components
