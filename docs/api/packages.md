---
title: 'Package APIs'
description: 'The exported API of every workspace package, read at build time from the snapshots CI checks against the source.'
outline: 'deep'
---

# Package APIs

`nuxt-i18n-micro` is built from a set of small packages, most of which are usable on
their own — `@i18n-micro/vue` in a plain Vue app, `@i18n-micro/core` anywhere.

Each page below is generated from the API snapshot that
[`pnpm run api:surface`](/guide/maintenance-commands#api-surface) checks against the
TypeScript sources, so an export cannot disappear without either this reference changing
or CI failing.

<!-- generated:packages-index — do not edit; run `pnpm run docs:generate` -->

| Package | Entry points | Exports |
| --- | --- | --- |
| [`@i18n-micro/astro`](/api/packages/astro) | `@i18n-micro/astro`, `@i18n-micro/astro/client`, `@i18n-micro/astro/client/preact`, `@i18n-micro/astro/client/react`, `@i18n-micro/astro/client/svelte`, `@i18n-micro/astro/client/vue` | 56 |
| [`@i18n-micro/core`](/api/packages/core) | `@i18n-micro/core`, `@i18n-micro/core/helpers` | 42 |
| [`@i18n-micro/devtools-ui`](/api/packages/devtools-ui) | `@i18n-micro/devtools-ui`, `@i18n-micro/devtools-ui/bridge`, `@i18n-micro/devtools-ui/bridge/create`, `@i18n-micro/devtools-ui/vite` | 25 |
| [`@i18n-micro/hmr`](/api/packages/hmr) | `@i18n-micro/hmr/cache-keys`, `@i18n-micro/hmr/generate-plugin`, `@i18n-micro/hmr/watcher` | 8 |
| [`@i18n-micro/node`](/api/packages/node) | `@i18n-micro/node` | 15 |
| [`@i18n-micro/path-strategy`](/api/packages/path-strategy) | `@i18n-micro/path-strategy`, `@i18n-micro/path-strategy/no-prefix`, `@i18n-micro/path-strategy/prefix`, `@i18n-micro/path-strategy/prefix-and-default`, `@i18n-micro/path-strategy/prefix-except-default`, `@i18n-micro/path-strategy/types` | 38 |
| [`@i18n-micro/preact`](/api/packages/preact) | `@i18n-micro/preact` | 39 |
| [`@i18n-micro/route-strategy`](/api/packages/route-strategy) | `@i18n-micro/route-strategy` | 18 |
| [`@i18n-micro/solid`](/api/packages/solid) | `@i18n-micro/solid` | 33 |
| [`@i18n-micro/test-utils`](/api/packages/test-utils) | `@i18n-micro/test-utils`, `@i18n-micro/test-utils/publish-smoke` | 36 |
| [`@i18n-micro/types`](/api/packages/types) | `@i18n-micro/types` | 26 |
| [`@i18n-micro/types-generator`](/api/packages/types-generator) | `@i18n-micro/types-generator`, `@i18n-micro/types-generator/nuxt` | 7 |
| [`@i18n-micro/utils`](/api/packages/utils) | `@i18n-micro/utils/accept-language`, `@i18n-micro/utils/active-locales`, `@i18n-micro/utils/app-path`, `@i18n-micro/utils/auto-detect-path`, `@i18n-micro/utils/build`, `@i18n-micro/utils/cache-control`, `@i18n-micro/utils/cookie`, `@i18n-micro/utils/deep-merge`, `@i18n-micro/utils/merge-i18n-head`, `@i18n-micro/utils/merge-source`, `@i18n-micro/utils/normalize`, `@i18n-micro/utils/parse-path`, `@i18n-micro/utils/payload-config`, `@i18n-micro/utils/payload-fetch`, `@i18n-micro/utils/payload-stats`, `@i18n-micro/utils/payload-url`, `@i18n-micro/utils/resolve-hreflang`, `@i18n-micro/utils/resolve-locale`, `@i18n-micro/utils/resolve-og-locale`, `@i18n-micro/utils/route`, `@i18n-micro/utils/route-pattern`, `@i18n-micro/utils/runtime-config`, `@i18n-micro/utils/source-loader` | 98 |
| [`@i18n-micro/vue`](/api/packages/vue) | `@i18n-micro/vue` | 27 |

<!-- /generated:packages-index -->

## See also

- [Integrations](/integrations/) — guides for using these packages in each framework
- [Module Options](/api/module-options) — options accepted by the Nuxt module
- [Methods](/api/methods) — the runtime helpers available inside components
