---
title: 'Package APIs'
description: 'The exported API of every @i18n-micro/* package, generated from the API snapshots CI checks against the source.'
outline: [2, 3]
navigation:
  order: 60
---

# Package APIs

The Nuxt module is built from small `@i18n-micro/*` packages, and most of them work on their own: `@i18n-micro/vue` in a Vue app, `@i18n-micro/core` anywhere. Use these pages to look up what a package exports, per entry point. Each page is generated from the snapshot that [`pnpm run api:surface`](/contributing/maintenance-commands#api-surface) checks against the TypeScript sources, so an export cannot change without CI noticing.

<!-- generated:packages-index — do not edit; run `pnpm run docs:generate` -->

- [`@i18n-micro/astro`](/api/packages/astro) · 50 exports — also `@i18n-micro/astro/client`, `@i18n-micro/astro/client/preact`, `@i18n-micro/astro/client/react`, `@i18n-micro/astro/client/svelte`, `@i18n-micro/astro/client/vue`, `@i18n-micro/astro/middleware`, `@i18n-micro/astro/node`
- [`@i18n-micro/cli`](/api/packages/cli) · 6 exports
- [`@i18n-micro/core`](/api/packages/core) · 114 exports — also `@i18n-micro/core/devtools`, `@i18n-micro/core/helpers`, `@i18n-micro/core/render`
- [`@i18n-micro/devtools-ui`](/api/packages/devtools-ui) · 26 exports — also `@i18n-micro/devtools-ui/bridge`, `@i18n-micro/devtools-ui/bridge/create`, `@i18n-micro/devtools-ui/vite`
- [`@i18n-micro/node`](/api/packages/node) · 16 exports
- [`@i18n-micro/path-strategy`](/api/packages/path-strategy) · 20 exports — also `@i18n-micro/path-strategy/types`
- [`@i18n-micro/preact`](/api/packages/preact) · 42 exports — also `@i18n-micro/preact/router`
- [`@i18n-micro/react`](/api/packages/react) · 91 exports — also `@i18n-micro/react/client`, `@i18n-micro/react/router`, `@i18n-micro/react/server`
- [`@i18n-micro/route-strategy`](/api/packages/route-strategy) · 14 exports
- [`@i18n-micro/runtime`](/api/packages/runtime) · 17 exports
- [`@i18n-micro/solid`](/api/packages/solid) · 39 exports — also `@i18n-micro/solid/router`
- [`@i18n-micro/test-utils`](/api/packages/test-utils) · 52 exports
- [`@i18n-micro/types`](/api/packages/types) · 31 exports
- [`@i18n-micro/types-generator`](/api/packages/types-generator) · 7 exports — also `@i18n-micro/types-generator/nuxt`
- [`@i18n-micro/utils`](/api/packages/utils) · 116 exports — also `@i18n-micro/utils/active-locales`, `@i18n-micro/utils/app-path`, `@i18n-micro/utils/auto-detect-path`, `@i18n-micro/utils/cache-control`, `@i18n-micro/utils/cookie`, `@i18n-micro/utils/deep-merge`, `@i18n-micro/utils/domains`, `@i18n-micro/utils/load-dir`, `@i18n-micro/utils/locale-head`, `@i18n-micro/utils/merge-i18n-head`, `@i18n-micro/utils/merge-source`, `@i18n-micro/utils/normalize`, `@i18n-micro/utils/parse-path`, `@i18n-micro/utils/payload-fetch`, `@i18n-micro/utils/payload-url`, `@i18n-micro/utils/resolve-hreflang`, `@i18n-micro/utils/resolve-locale`, `@i18n-micro/utils/resolve-og-locale`, `@i18n-micro/utils/runtime-config`, `@i18n-micro/utils/source-loader`, `@i18n-micro/utils/split-locale-routes`
- [`@i18n-micro/vitepress`](/api/packages/vitepress) · 56 exports — also `@i18n-micro/vitepress/config`, `@i18n-micro/vitepress/node`, `@i18n-micro/vitepress/theme`
- [`@i18n-micro/vue`](/api/packages/vue) · 30 exports — also `@i18n-micro/vue/router`

<!-- /generated:packages-index -->

## Related

::card-group
  :::card{title="Framework packages" icon="i-lucide-boxes" to="/integrations/"}
  Setup guides for each package
  :::
  :::card{title="Module options" icon="i-lucide-braces" to="/api/module-options"}
  Options of the Nuxt module
  :::
  :::card{title="Helpers" icon="i-lucide-braces" to="/api/methods"}
  Runtime helpers of the Nuxt module
  :::
::
