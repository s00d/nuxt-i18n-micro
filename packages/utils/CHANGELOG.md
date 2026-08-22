# @i18n-micro/utils

## 1.0.14

_2026-08-05_ · [`cf4c4caa`](https://github.com/s00d/nuxt-i18n-micro/commit/cf4c4caab89c517b4e8c47540fe1f1a646e745d5)

### Features

- Vue DevTools inspector + docs workspace (#246) ([`cf4c4ca`](https://github.com/s00d/nuxt-i18n-micro/commit/cf4c4caab89c517b4e8c47540fe1f1a646e745d5))

### Fixes

- **redirect:** keep localeRoutes aliases under autoDetectPath / ([`bfda069`](https://github.com/s00d/nuxt-i18n-micro/commit/bfda069edb48eef98dade5aec6e3ee8394084c52))

### Style

- apply oxfmt after checks pipeline ([`d2b6ed7`](https://github.com/s00d/nuxt-i18n-micro/commit/d2b6ed7704fb9aaf4a4da38fc6fb0011d99bbed4))

## 1.0.13

_2026-07-31_ · [`084df974`](https://github.com/s00d/nuxt-i18n-micro/commit/084df974da8f0f58e8752cce855520a2ed3ae84e)

### Features

- add splitLocaleRoutes for programmatic pages ([`084df97`](https://github.com/s00d/nuxt-i18n-micro/commit/084df974da8f0f58e8752cce855520a2ed3ae84e))

### Fixes

- honor autoDetectPath for preference redirects ([`d182a92`](https://github.com/s00d/nuxt-i18n-micro/commit/d182a92f2e8e720e1fa837b94c1938648be82e5e))
- **seo:** emit hreflang from iso, not routing code ([`cd932e8`](https://github.com/s00d/nuxt-i18n-micro/commit/cd932e8922bc6557feaead30a62de62dd9d15177))

## 1.0.11

_2026-07-31_ · [`971a93d9`](https://github.com/s00d/nuxt-i18n-micro/commit/971a93d92db807c66088fa4102bca0987b376cdd)

### Fixes

- publishable caret workspace pins ([`971a93d`](https://github.com/s00d/nuxt-i18n-micro/commit/971a93d92db807c66088fa4102bca0987b376cdd))
- omit disabled locales from premerged public payloads ([`98f9b36`](https://github.com/s00d/nuxt-i18n-micro/commit/98f9b36223dfb6b12cb8e70efcffe6babd82eba1))

### Chore

- silence vue-router volar plugin under vue-router@4 ([`513d92d`](https://github.com/s00d/nuxt-i18n-micro/commit/513d92dbb0520b78ff7e887702a15eaa47778f8b))

## 1.0.10

_2026-07-31_ · [`d58c7f53`](https://github.com/s00d/nuxt-i18n-micro/commit/d58c7f53fe4b7db50b450d76c980828ef6742469)

### Features

- Node SSR from public payloads (no Rollup raw:) ([`d58c7f5`](https://github.com/s00d/nuxt-i18n-micro/commit/d58c7f53fe4b7db50b450d76c980828ef6742469))
- **vite.config:** add afterDiagnostic handler for TypeScript errors ([`eae3fc6`](https://github.com/s00d/nuxt-i18n-micro/commit/eae3fc6eb9108a2e1455b37ccb76b484312f9072))

## 1.0.8

_2026-07-30_ · [`cf369ff9`](https://github.com/s00d/nuxt-i18n-micro/commit/cf369ff9585a63d1fd71ef7cd99263fb575d0e67)

### Other

- Vitest migration, shared fixtures, formats & cache DX (#235) ([`cf369ff`](https://github.com/s00d/nuxt-i18n-micro/commit/cf369ff9585a63d1fd71ef7cd99263fb575d0e67))

## 1.0.7

_2026-07-06_ · [`ad15834e`](https://github.com/s00d/nuxt-i18n-micro/commit/ad15834e32d69e80f19b5fdd5b7d3357dec08689)

### Fixes

- **nitro:** harden #233 export conditions with regression tests ([`ad15834`](https://github.com/s00d/nuxt-i18n-micro/commit/ad15834e32d69e80f19b5fdd5b7d3357dec08689))

## 1.0.6

_2026-07-03_ · [`7aeed75d`](https://github.com/s00d/nuxt-i18n-micro/commit/7aeed75d91d7eae7d06fc1794b973d4c41f15d9c)

### Features

- add withoutAppBaseURL utility function to strip baseURL from request paths ([`e70dc97`](https://github.com/s00d/nuxt-i18n-micro/commit/e70dc97b03cfe218f618f43330ac33048ff10a22))

### Fixes

- **redirect:** resolve infinite redirect loop with `app.baseURL` and `strategy: 'prefix'` ([`7aeed75`](https://github.com/s00d/nuxt-i18n-micro/commit/7aeed75d91d7eae7d06fc1794b973d4c41f15d9c))

## 1.0.4

_2026-06-29_ · [`af9f9ea3`](https://github.com/s00d/nuxt-i18n-micro/commit/af9f9ea31d838f7d1e0408c7417b11f34fde7fca)

### Fixes

- order production export before import to silence esbuild warnings ([`af9f9ea`](https://github.com/s00d/nuxt-i18n-micro/commit/af9f9ea31d838f7d1e0408c7417b11f34fde7fca))
- **nitro:** resolve #233 via package export conditions, drop traceInclude hack ([`d467436`](https://github.com/s00d/nuxt-i18n-micro/commit/d4674369969dbae3ed9bae10201185152314bd3d))

## 1.0.3

_2026-06-25_ · [`2408a7a5`](https://github.com/s00d/nuxt-i18n-micro/commit/2408a7a593b2db4b7769f7c31d68d677c746ee2f)

### Features

- **seo:** add useI18nHead for per-page i18n SEO overrides ([`2408a7a`](https://github.com/s00d/nuxt-i18n-micro/commit/2408a7a593b2db4b7769f7c31d68d677c746ee2f))

## 1.0.2

_2026-06-23_ · [`f19aa921`](https://github.com/s00d/nuxt-i18n-micro/commit/f19aa9212448a33f75bef5d34eaafc14bb79244e)

### Fixes

- **seo:** correct og:locale format and meta refresh timing (#230) ([`f19aa92`](https://github.com/s00d/nuxt-i18n-micro/commit/f19aa9212448a33f75bef5d34eaafc14bb79244e))
- address cubic PR review findings ([`47ce12a`](https://github.com/s00d/nuxt-i18n-micro/commit/47ce12afc701d29247bdefd088a6fb43902a5920))

## 1.0.1

_2026-06-15_ · [`20f3c552`](https://github.com/s00d/nuxt-i18n-micro/commit/20f3c55246d3a4c40d4a517d146d054bc5945c96)

### Refactors

- **runtime:** extract NuxtI18n layer and fix SSR/client regressions ([`20f3c55`](https://github.com/s00d/nuxt-i18n-micro/commit/20f3c55246d3a4c40d4a517d146d054bc5945c96))

## 1.0.0

_2026-06-14_ · [`feab68a8`](https://github.com/s00d/nuxt-i18n-micro/commit/feab68a866d458a06fe885b08ee4e46387b36f6e)

### Features

- extract @i18n-micro/utils and @i18n-micro/hmr packages ([`6a89c98`](https://github.com/s00d/nuxt-i18n-micro/commit/6a89c98c8d9c1c24c636eb4c9e19df1795813c51))

### Chore

- migrate to oxlint/oxfmt and improve docs SEO ([`feab68a`](https://github.com/s00d/nuxt-i18n-micro/commit/feab68a866d458a06fe885b08ee4e46387b36f6e))
