# @i18n-micro/vue

## 1.4.0

_2026-08-21_ · [`86b70346`](https://github.com/s00d/nuxt-i18n-micro/commit/86b703464cb927080a67d017927300e2e3ac87d4)

### Breaking Changes

- `createVueRouterAdapter` moved to `@i18n-micro/vue/router` (main entry no longer imports `vue-router`)

### Features

- split router adapter to /router ([`86b7034`](https://github.com/s00d/nuxt-i18n-micro/commit/86b703464cb927080a67d017927300e2e3ac87d4))

## 1.3.12

_2026-08-21_ · [`0899a63c`](https://github.com/s00d/nuxt-i18n-micro/commit/0899a63ca75e3614b5cda887227b4adf925e13d7)

### Chore

- cascade patch bumps for core 1.3.14 ([`0899a63`](https://github.com/s00d/nuxt-i18n-micro/commit/0899a63ca75e3614b5cda887227b4adf925e13d7))

## 1.3.11

_2026-08-05_ · [`872e0b4f`](https://github.com/s00d/nuxt-i18n-micro/commit/872e0b4f6661ee435228f349ddee23477ccbf945)

### Features

- **vitepress:** add @i18n-micro/vitepress package (#247) ([`872e0b4`](https://github.com/s00d/nuxt-i18n-micro/commit/872e0b4f6661ee435228f349ddee23477ccbf945))

## 1.3.10

_2026-08-05_ · [`cf4c4caa`](https://github.com/s00d/nuxt-i18n-micro/commit/cf4c4caab89c517b4e8c47540fe1f1a646e745d5)

### Features

- Vue DevTools inspector + docs workspace (#246) ([`cf4c4ca`](https://github.com/s00d/nuxt-i18n-micro/commit/cf4c4caab89c517b4e8c47540fe1f1a646e745d5))

## 1.3.9

_2026-08-01_ · [`45859766`](https://github.com/s00d/nuxt-i18n-micro/commit/45859766537377c5d03ffc0ee470cf270913eef8)

### Features

- **perf:** move benchmarks to citty CLI ([`4585976`](https://github.com/s00d/nuxt-i18n-micro/commit/45859766537377c5d03ffc0ee470cf270913eef8))

## 1.3.8

_2026-07-31_ · [`d2b6ed77`](https://github.com/s00d/nuxt-i18n-micro/commit/d2b6ed7704fb9aaf4a4da38fc6fb0011d99bbed4)

### Fixes

- **seo:** emit hreflang from iso, not routing code ([`cd932e8`](https://github.com/s00d/nuxt-i18n-micro/commit/cd932e8922bc6557feaead30a62de62dd9d15177))

### Style

- apply oxfmt after checks pipeline ([`d2b6ed7`](https://github.com/s00d/nuxt-i18n-micro/commit/d2b6ed7704fb9aaf4a4da38fc6fb0011d99bbed4))

## 1.3.7

_2026-07-31_ · [`971a93d9`](https://github.com/s00d/nuxt-i18n-micro/commit/971a93d92db807c66088fa4102bca0987b376cdd)

### Features

- **vite.config:** add afterDiagnostic handler for TypeScript errors ([`eae3fc6`](https://github.com/s00d/nuxt-i18n-micro/commit/eae3fc6eb9108a2e1455b37ccb76b484312f9072))

### Fixes

- publishable caret workspace pins ([`971a93d`](https://github.com/s00d/nuxt-i18n-micro/commit/971a93d92db807c66088fa4102bca0987b376cdd))

## 1.3.6

_2026-07-30_ · [`cf369ff9`](https://github.com/s00d/nuxt-i18n-micro/commit/cf369ff9585a63d1fd71ef7cd99263fb575d0e67)

### Fixes

- resolve @i18n-micro/utils subpath imports in tests ([`cbcd406`](https://github.com/s00d/nuxt-i18n-micro/commit/cbcd406861d5603f1b538c48daaafef29f1b484f))

### Other

- Vitest migration, shared fixtures, formats & cache DX (#235) ([`cf369ff`](https://github.com/s00d/nuxt-i18n-micro/commit/cf369ff9585a63d1fd71ef7cd99263fb575d0e67))

## 1.3.4

_2026-06-23_ · [`f19aa921`](https://github.com/s00d/nuxt-i18n-micro/commit/f19aa9212448a33f75bef5d34eaafc14bb79244e)

### Fixes

- **seo:** correct og:locale format and meta refresh timing (#230) ([`f19aa92`](https://github.com/s00d/nuxt-i18n-micro/commit/f19aa9212448a33f75bef5d34eaafc14bb79244e))

## 1.3.3

_2026-06-14_ · [`feab68a8`](https://github.com/s00d/nuxt-i18n-micro/commit/feab68a866d458a06fe885b08ee4e46387b36f6e)

### Tests

- exclude dist publish smoke tests from Jest runs ([`5fe00a0`](https://github.com/s00d/nuxt-i18n-micro/commit/5fe00a08fda88daf64036fe4fddfbdb0c8480f40))
- add dist publish smoke tests for workspace libraries ([`cdf9893`](https://github.com/s00d/nuxt-i18n-micro/commit/cdf9893c08baf9e1ace536c48238cdeb5a965ca7))

### Chore

- migrate to oxlint/oxfmt and improve docs SEO ([`feab68a`](https://github.com/s00d/nuxt-i18n-micro/commit/feab68a866d458a06fe885b08ee4e46387b36f6e))
- align publish fields and inline dual-package types ([`221bab4`](https://github.com/s00d/nuxt-i18n-micro/commit/221bab4ccf3510309df0583a93d36ea0d7f2e49b))

## 1.3.2

_2026-04-06_ · [`005b5ac0`](https://github.com/s00d/nuxt-i18n-micro/commit/005b5ac04e66b071f35f4e58dbaed3862c17204d)

### Features

- **seo:** add locale seo flag to exclude from hreflang/og alternates ([`005b5ac`](https://github.com/s00d/nuxt-i18n-micro/commit/005b5ac04e66b071f35f4e58dbaed3862c17204d))
- **seo:** optional locale `og` for Open Graph og:locale tags ([`a585bac`](https://github.com/s00d/nuxt-i18n-micro/commit/a585bac92e45174f74678360ca3158fc9f524c92))

### Fixes

- **seo:** treat empty locale.og as unset for Open Graph meta ([`7c20f01`](https://github.com/s00d/nuxt-i18n-micro/commit/7c20f011829cbb0fe2cbdfb85726bfdd4e26c902))
- **use-locale-head:** correct ogUrl assignment and filter alternate locales ([`fb9bc0e`](https://github.com/s00d/nuxt-i18n-micro/commit/fb9bc0e9be65070ecedfb90c3876649bb56f152b))

## 1.3.1

_2026-02-16_ · [`c411b843`](https://github.com/s00d/nuxt-i18n-micro/commit/c411b8434179d98415ced5b052018c6dc50aaec9)

### Features

- **composables:** add x-default hreflang link for default locale ([`c411b84`](https://github.com/s00d/nuxt-i18n-micro/commit/c411b8434179d98415ced5b052018c6dc50aaec9))

## 1.3.0

_2026-02-13_ · [`c304c6d8`](https://github.com/s00d/nuxt-i18n-micro/commit/c304c6d8c2381a0e728b990e7197b1715a32a88f)

### Fixes

- update comments to English for clarity ([`8dd57b3`](https://github.com/s00d/nuxt-i18n-micro/commit/8dd57b3a26e660d47abc736c233b3a7740394037))

### Refactors

- **composer:** update current route and simplify cache methods ([`c304c6d`](https://github.com/s00d/nuxt-i18n-micro/commit/c304c6d8c2381a0e728b990e7197b1715a32a88f))

## 1.2.1

_2026-02-07_ · [`b5306887`](https://github.com/s00d/nuxt-i18n-micro/commit/b53068874489e11d9163a724f6677fc8edb34f88)

### Chore

- **pnpm:** remove `@nuxt/eslint-config` and add `@biomejs/biome` ([`b530688`](https://github.com/s00d/nuxt-i18n-micro/commit/b53068874489e11d9163a724f6677fc8edb34f88))

## 1.2.0

_2026-02-05_ · [`093139e3`](https://github.com/s00d/nuxt-i18n-micro/commit/093139e3388de31c114ef067a3b90cd4ed089811)

### Features

- implement translation storage management and update structure ([`093139e`](https://github.com/s00d/nuxt-i18n-micro/commit/093139e3388de31c114ef067a3b90cd4ed089811))

### Fixes

- **router:** handle undefined path segment correctly ([`d1f50b3`](https://github.com/s00d/nuxt-i18n-micro/commit/d1f50b3e5c9dc8be689fbfe7ca6d63fbb5a2266a))

## 1.1.1

_2026-01-29_ · [`8fe24aed`](https://github.com/s00d/nuxt-i18n-micro/commit/8fe24aedb26abc91066c7a821994c7436d11ec12)

### Features

- **tests:** add greeting and apples messages to context tests ([`c847056`](https://github.com/s00d/nuxt-i18n-micro/commit/c847056f77b72d32801ac080549d5488408ee674))

### Refactors

- **ui:** remove unnecessary whitespace in icon components and configs ([`f76a544`](https://github.com/s00d/nuxt-i18n-micro/commit/f76a544b80e1c59d84d5a12da9585adb5f0f2a3e))

### Chore

- **pnpm-workspace:** update dependencies for catalog and testing ([`8fe24ae`](https://github.com/s00d/nuxt-i18n-micro/commit/8fe24aedb26abc91066c7a821994c7436d11ec12))

## 1.1.0

_2025-12-26_ · [`71574e94`](https://github.com/s00d/nuxt-i18n-micro/commit/71574e941d962ee4cf8b3d132b4d0f474d2a86eb)

### Refactors

- remove deprecated router integration code ([`71574e9`](https://github.com/s00d/nuxt-i18n-micro/commit/71574e941d962ee4cf8b3d132b4d0f474d2a86eb))

## 1.0.1

_2025-12-08_ · [`9c610516`](https://github.com/s00d/nuxt-i18n-micro/commit/9c6105168b1a94f1325afbbc0ef7622ad3eb01ca)

### Chore

- update package versions to 1.0.1 ([`9c61051`](https://github.com/s00d/nuxt-i18n-micro/commit/9c6105168b1a94f1325afbbc0ef7622ad3eb01ca))
- remove unnecessary console log statements ([`b003b65`](https://github.com/s00d/nuxt-i18n-micro/commit/b003b651b86a87a2f11b6435d2904eb61a77a0d4))

## 1.0.0

_2025-12-08_ · [`2a01f9a3`](https://github.com/s00d/nuxt-i18n-micro/commit/2a01f9a3d872cc5075bbafe415146ee0d2cd2530)

### Features

- implement Vue i18n plugin and core functionalities ([`4dd2c1e`](https://github.com/s00d/nuxt-i18n-micro/commit/4dd2c1e525513bdc7869f5c1433e6a4e910c8276))

### Chore

- set publishConfig access to public for all packages ([`2a01f9a`](https://github.com/s00d/nuxt-i18n-micro/commit/2a01f9a3d872cc5075bbafe415146ee0d2cd2530))
