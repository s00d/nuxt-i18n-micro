# @i18n-micro/react

## 1.3.8

_2026-08-27_ · [`a50963da`](https://github.com/s00d/nuxt-i18n-micro/commit/a50963da346970c3f51c10e920d4dfbafd4c1baf)

### Chore

- add package `typecheck` script (src-only via `tsconfig.build.json`) ([`a50963d`](https://github.com/s00d/nuxt-i18n-micro/commit/a50963da346970c3f51c10e920d4dfbafd4c1baf))

## 1.3.7

_2026-08-21_ · [`0899a63c`](https://github.com/s00d/nuxt-i18n-micro/commit/0899a63ca75e3614b5cda887227b4adf925e13d7)

### Chore

- cascade patch bumps for core 1.3.14 ([`0899a63`](https://github.com/s00d/nuxt-i18n-micro/commit/0899a63ca75e3614b5cda887227b4adf925e13d7))

## 1.3.6

_2026-08-05_ · [`cf4c4caa`](https://github.com/s00d/nuxt-i18n-micro/commit/cf4c4caab89c517b4e8c47540fe1f1a646e745d5)

### Features

- Vue DevTools inspector + docs workspace (#246) ([`cf4c4ca`](https://github.com/s00d/nuxt-i18n-micro/commit/cf4c4caab89c517b4e8c47540fe1f1a646e745d5))

## 1.3.5

_2026-07-31_ · [`d2b6ed77`](https://github.com/s00d/nuxt-i18n-micro/commit/d2b6ed7704fb9aaf4a4da38fc6fb0011d99bbed4)

### Style

- apply oxfmt after checks pipeline ([`d2b6ed7`](https://github.com/s00d/nuxt-i18n-micro/commit/d2b6ed7704fb9aaf4a4da38fc6fb0011d99bbed4))

### Chore

- cascade bump packages after types/utils release pins ([`030834e`](https://github.com/s00d/nuxt-i18n-micro/commit/030834e5dad8b40c46910662eafcc5915d4b703c))

## 1.3.4

_2026-07-31_ · [`971a93d9`](https://github.com/s00d/nuxt-i18n-micro/commit/971a93d92db807c66088fa4102bca0987b376cdd)

### Features

- **tests:** add type error handling in React context test ([`2265246`](https://github.com/s00d/nuxt-i18n-micro/commit/22652468cbf836e823804bb3edd7e8f5a473c4d1))
- **vite.config:** add afterDiagnostic handler for TypeScript errors ([`eae3fc6`](https://github.com/s00d/nuxt-i18n-micro/commit/eae3fc6eb9108a2e1455b37ccb76b484312f9072))
- **react, preact:** update aria attributes for accessibility ([`882390c`](https://github.com/s00d/nuxt-i18n-micro/commit/882390c29a8d8a14067aa1a59b5e978d9110a352))

### Fixes

- publishable caret workspace pins ([`971a93d`](https://github.com/s00d/nuxt-i18n-micro/commit/971a93d92db807c66088fa4102bca0987b376cdd))

### Chore

- silence vue-router volar plugin under vue-router@4 ([`513d92d`](https://github.com/s00d/nuxt-i18n-micro/commit/513d92dbb0520b78ff7e887702a15eaa47778f8b))

## 1.3.3

_2026-07-30_ · [`cf369ff9`](https://github.com/s00d/nuxt-i18n-micro/commit/cf369ff9585a63d1fd71ef7cd99263fb575d0e67)

### Other

- Vitest migration, shared fixtures, formats & cache DX (#235) ([`cf369ff`](https://github.com/s00d/nuxt-i18n-micro/commit/cf369ff9585a63d1fd71ef7cd99263fb575d0e67))

## 1.3.1

_2026-06-14_ · [`feab68a8`](https://github.com/s00d/nuxt-i18n-micro/commit/feab68a866d458a06fe885b08ee4e46387b36f6e)

### Chore

- migrate to oxlint/oxfmt and improve docs SEO ([`feab68a`](https://github.com/s00d/nuxt-i18n-micro/commit/feab68a866d458a06fe885b08ee4e46387b36f6e))
- align publish fields and inline dual-package types ([`221bab4`](https://github.com/s00d/nuxt-i18n-micro/commit/221bab4ccf3510309df0583a93d36ea0d7f2e49b))

## 1.3.0

_2026-02-13_ · [`90e98af9`](https://github.com/s00d/nuxt-i18n-micro/commit/90e98af9a33f3827d1a888a1663711a118b1283e)

### Fixes

- **i18n:** update default currentRoute to 'index' ([`90e98af`](https://github.com/s00d/nuxt-i18n-micro/commit/90e98af9a33f3827d1a888a1663711a118b1283e))

## 1.2.1

_2026-02-07_ · [`b5306887`](https://github.com/s00d/nuxt-i18n-micro/commit/b53068874489e11d9163a724f6677fc8edb34f88)

### Chore

- **pnpm:** remove `@nuxt/eslint-config` and add `@biomejs/biome` ([`b530688`](https://github.com/s00d/nuxt-i18n-micro/commit/b53068874489e11d9163a724f6677fc8edb34f88))

## 1.2.0

_2026-02-05_ · [`3ee5b1a6`](https://github.com/s00d/nuxt-i18n-micro/commit/3ee5b1a68cfe03f402d4b14b4ddd5e144980f111)

### Fixes

- **router:** handle undefined path segments in locale check ([`4399317`](https://github.com/s00d/nuxt-i18n-micro/commit/439931713789bd78389fd87587fe7bf1563a5160))

### Refactors

- **i18n:** replace `TranslationCache` with `TranslationStorage` ([`3ee5b1a`](https://github.com/s00d/nuxt-i18n-micro/commit/3ee5b1a68cfe03f402d4b14b4ddd5e144980f111))

## 1.1.1

_2026-01-29_ · [`8fe24aed`](https://github.com/s00d/nuxt-i18n-micro/commit/8fe24aedb26abc91066c7a821994c7436d11ec12)

### Features

- **tests:** add greeting and apples messages to context tests ([`c847056`](https://github.com/s00d/nuxt-i18n-micro/commit/c847056f77b72d32801ac080549d5488408ee674))

### Chore

- **pnpm-workspace:** update dependencies for catalog and testing ([`8fe24ae`](https://github.com/s00d/nuxt-i18n-micro/commit/8fe24aedb26abc91066c7a821994c7436d11ec12))

## 1.1.0

_2025-12-26_ · [`8a6fe075`](https://github.com/s00d/nuxt-i18n-micro/commit/8a6fe075ea2602e1f0083e801e5b4fd2e2f775dd)

### Features

- add initial implementation of React i18n package ([`8a6fe07`](https://github.com/s00d/nuxt-i18n-micro/commit/8a6fe075ea2602e1f0083e801e5b4fd2e2f775dd))
