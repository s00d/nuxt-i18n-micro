# @i18n-micro/devtools-ui

## 1.2.9

_2026-08-27_ · [`a50963da`](https://github.com/s00d/nuxt-i18n-micro/commit/a50963da346970c3f51c10e920d4dfbafd4c1baf)

### Chore

- add `vue-tsc` typecheck script and `declare module '*.vue'` in `env.d.ts` ([`a50963d`](https://github.com/s00d/nuxt-i18n-micro/commit/a50963da346970c3f51c10e920d4dfbafd4c1baf))

## 1.2.8

_2026-08-05_ · [`cf4c4caa`](https://github.com/s00d/nuxt-i18n-micro/commit/cf4c4caab89c517b4e8c47540fe1f1a646e745d5)

### Features

- Vue DevTools inspector + docs workspace (#246) ([`cf4c4ca`](https://github.com/s00d/nuxt-i18n-micro/commit/cf4c4caab89c517b4e8c47540fe1f1a646e745d5))

## 1.2.7

_2026-07-31_ · [`030834e5`](https://github.com/s00d/nuxt-i18n-micro/commit/030834e5dad8b40c46910662eafcc5915d4b703c)

### Chore

- cascade bump packages after types/utils release pins ([`030834e`](https://github.com/s00d/nuxt-i18n-micro/commit/030834e5dad8b40c46910662eafcc5915d4b703c))

## 1.2.6

_2026-07-31_ · [`971a93d9`](https://github.com/s00d/nuxt-i18n-micro/commit/971a93d92db807c66088fa4102bca0987b376cdd)

### Fixes

- publishable caret workspace pins ([`971a93d`](https://github.com/s00d/nuxt-i18n-micro/commit/971a93d92db807c66088fa4102bca0987b376cdd))

## 1.2.5

_2026-07-30_ · [`94b768c8`](https://github.com/s00d/nuxt-i18n-micro/commit/94b768c8ac1a79315cf057a591d861fc235eb8be)

### Features

- **vite.config:** add afterDiagnostic handler for TypeScript errors ([`eae3fc6`](https://github.com/s00d/nuxt-i18n-micro/commit/eae3fc6eb9108a2e1455b37ccb76b484312f9072))

### Chore

- bump version to 1.2.5 ([`94b768c`](https://github.com/s00d/nuxt-i18n-micro/commit/94b768c8ac1a79315cf057a591d861fc235eb8be))
- update Vite config to include additional globals for utils ([`9b8d43f`](https://github.com/s00d/nuxt-i18n-micro/commit/9b8d43ffdbdc74ee4b6e034a5a864422745e76cc))

## 1.2.4

_2026-07-30_ · [`cf369ff9`](https://github.com/s00d/nuxt-i18n-micro/commit/cf369ff9585a63d1fd71ef7cd99263fb575d0e67)

### Other

- Vitest migration, shared fixtures, formats & cache DX (#235) ([`cf369ff`](https://github.com/s00d/nuxt-i18n-micro/commit/cf369ff9585a63d1fd71ef7cd99263fb575d0e67))

## 1.2.3

_2026-06-15_ · [`e8b449e5`](https://github.com/s00d/nuxt-i18n-micro/commit/e8b449e5c118287066314f0c24d7d34e99354a79)

### Refactors

- **runtime:** extract NuxtI18n layer and fix SSR/client regressions ([`20f3c55`](https://github.com/s00d/nuxt-i18n-micro/commit/20f3c55246d3a4c40d4a517d146d054bc5945c96))

### Chore

- bump package versions for multiple modules ([`e8b449e`](https://github.com/s00d/nuxt-i18n-micro/commit/e8b449e5c118287066314f0c24d7d34e99354a79))

## 1.2.2

_2026-06-14_ · [`feab68a8`](https://github.com/s00d/nuxt-i18n-micro/commit/feab68a866d458a06fe885b08ee4e46387b36f6e)

### Features

- extract @i18n-micro/utils and @i18n-micro/hmr packages ([`6a89c98`](https://github.com/s00d/nuxt-i18n-micro/commit/6a89c98c8d9c1c24c636eb4c9e19df1795813c51))

### Fixes

- emit Vite plugin types only under dist/vite ([`a81f628`](https://github.com/s00d/nuxt-i18n-micro/commit/a81f6284f53168d28f78d386f8f2826977a4bea4))

### Tests

- add dist publish smoke tests for workspace libraries ([`cdf9893`](https://github.com/s00d/nuxt-i18n-micro/commit/cdf9893c08baf9e1ace536c48238cdeb5a965ca7))

### Chore

- migrate to oxlint/oxfmt and improve docs SEO ([`feab68a`](https://github.com/s00d/nuxt-i18n-micro/commit/feab68a866d458a06fe885b08ee4e46387b36f6e))

## 1.2.1

_2026-05-26_ · [`d3077343`](https://github.com/s00d/nuxt-i18n-micro/commit/d30773431a0f00b33f9f1026f9fd2746a12b3db8)

### Refactors

- single Vite config with dual-package types ([`d307734`](https://github.com/s00d/nuxt-i18n-micro/commit/d30773431a0f00b33f9f1026f9fd2746a12b3db8))

## 1.2.0

_2026-02-13_ · [`1b4550d4`](https://github.com/s00d/nuxt-i18n-micro/commit/1b4550d43043c6b5f72a99f14c2a895f5e2d85ce)

### Fixes

- update comments to English for clarity ([`8dd57b3`](https://github.com/s00d/nuxt-i18n-micro/commit/8dd57b3a26e660d47abc736c233b3a7740394037))

### Refactors

- **bridge:** streamline translation cache retrieval and structure ([`1b4550d`](https://github.com/s00d/nuxt-i18n-micro/commit/1b4550d43043c6b5f72a99f14c2a895f5e2d85ce))

## 1.1.1

_2026-02-07_ · [`b5306887`](https://github.com/s00d/nuxt-i18n-micro/commit/b53068874489e11d9163a724f6677fc8edb34f88)

### Chore

- **pnpm:** remove `@nuxt/eslint-config` and add `@biomejs/biome` ([`b530688`](https://github.com/s00d/nuxt-i18n-micro/commit/b53068874489e11d9163a724f6677fc8edb34f88))

## 1.1.0

_2026-02-05_ · [`dd3d206a`](https://github.com/s00d/nuxt-i18n-micro/commit/dd3d206aa9b98301541daf963fdc778bb2495943)

### Fixes

- handle potential undefined values in file paths ([`3ea50b6`](https://github.com/s00d/nuxt-i18n-micro/commit/3ea50b6f49c2fad54952f72ed409c7fe05d5d5f9))

### Chore

- bump version to 1.1.0 in package.json ([`dd3d206`](https://github.com/s00d/nuxt-i18n-micro/commit/dd3d206aa9b98301541daf963fdc778bb2495943))

## 1.0.4

_2026-01-29_ · [`8fe24aed`](https://github.com/s00d/nuxt-i18n-micro/commit/8fe24aedb26abc91066c7a821994c7436d11ec12)

### Refactors

- **ui:** remove unnecessary whitespace in icon components and configs ([`f76a544`](https://github.com/s00d/nuxt-i18n-micro/commit/f76a544b80e1c59d84d5a12da9585adb5f0f2a3e))

### Chore

- **pnpm-workspace:** update dependencies for catalog and testing ([`8fe24ae`](https://github.com/s00d/nuxt-i18n-micro/commit/8fe24aedb26abc91066c7a821994c7436d11ec12))

## 1.0.3

_2025-12-26_ · [`c53673ad`](https://github.com/s00d/nuxt-i18n-micro/commit/c53673ad727a54f8347e439586cf6734b42d4b46)

### Features

- add Vite plugin for i18n development tools ([`c53673a`](https://github.com/s00d/nuxt-i18n-micro/commit/c53673ad727a54f8347e439586cf6734b42d4b46))
- **bridge:** implement createBridge function for DevTools communication ([`c3098c6`](https://github.com/s00d/nuxt-i18n-micro/commit/c3098c6cb45267e881924b4a88cc9a32fdd81953))

## 1.0.1

_2025-12-08_ · [`9c610516`](https://github.com/s00d/nuxt-i18n-micro/commit/9c6105168b1a94f1325afbbc0ef7622ad3eb01ca)

### Chore

- update package versions to 1.0.1 ([`9c61051`](https://github.com/s00d/nuxt-i18n-micro/commit/9c6105168b1a94f1325afbbc0ef7622ad3eb01ca))
- remove unnecessary console log statements ([`b003b65`](https://github.com/s00d/nuxt-i18n-micro/commit/b003b651b86a87a2f11b6435d2904eb61a77a0d4))

## 1.0.0

_2025-12-08_ · [`2a01f9a3`](https://github.com/s00d/nuxt-i18n-micro/commit/2a01f9a3d872cc5075bbafe415146ee0d2cd2530)

### Features

- add implementation of i18n DevTools UI ([`6db0088`](https://github.com/s00d/nuxt-i18n-micro/commit/6db00886442421f1eb3ba433f3220a57e429d234))

### Chore

- set publishConfig access to public for all packages ([`2a01f9a`](https://github.com/s00d/nuxt-i18n-micro/commit/2a01f9a3d872cc5075bbafe415146ee0d2cd2530))
