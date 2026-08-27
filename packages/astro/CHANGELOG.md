# @i18n-micro/astro

## 1.3.13

_2026-08-27_ · [`711cbe09`](https://github.com/s00d/nuxt-i18n-micro/commit/711cbe09)

### Features

- add `prepareLocaleRewrite()` and `getLocaleRewritePath()` for `/[locale]/*` rewrite stub pages ([`711cbe0`](https://github.com/s00d/nuxt-i18n-micro/commit/711cbe09))

### Fixes

- restore `astro-shim.d.ts`, fix tsconfig so `env.d.ts` is typechecked; export `./astro-shim` ([`a50963d`](https://github.com/s00d/nuxt-i18n-micro/commit/a50963da346970c3f51c10e920d4dfbafd4c1baf))
- run `astro check` (with `--minimumFailingSeverity hint`) in package/playground typecheck ([`c1b9263`](https://github.com/s00d/nuxt-i18n-micro/commit/c1b92633), [`448544d`](https://github.com/s00d/nuxt-i18n-micro/commit/448544dd))

### Documentation

- document locale-prefixed rewrite routes and new helpers ([`92abe2a`](https://github.com/s00d/nuxt-i18n-micro/commit/92abe2ae))

## 1.3.12

_2026-08-21_ · [`0899a63c`](https://github.com/s00d/nuxt-i18n-micro/commit/0899a63ca75e3614b5cda887227b4adf925e13d7)

### Chore

- cascade patch bumps for core 1.3.14 ([`0899a63`](https://github.com/s00d/nuxt-i18n-micro/commit/0899a63ca75e3614b5cda887227b4adf925e13d7))

## 1.3.11

_2026-08-05_ · [`cf4c4caa`](https://github.com/s00d/nuxt-i18n-micro/commit/cf4c4caab89c517b4e8c47540fe1f1a646e745d5)

### Features

- Vue DevTools inspector + docs workspace (#246) ([`cf4c4ca`](https://github.com/s00d/nuxt-i18n-micro/commit/cf4c4caab89c517b4e8c47540fe1f1a646e745d5))

## 1.3.10

_2026-07-31_ · [`d2b6ed77`](https://github.com/s00d/nuxt-i18n-micro/commit/d2b6ed7704fb9aaf4a4da38fc6fb0011d99bbed4)

### Fixes

- **seo:** emit hreflang from iso, not routing code ([`cd932e8`](https://github.com/s00d/nuxt-i18n-micro/commit/cd932e8922bc6557feaead30a62de62dd9d15177))

### Style

- apply oxfmt after checks pipeline ([`d2b6ed7`](https://github.com/s00d/nuxt-i18n-micro/commit/d2b6ed7704fb9aaf4a4da38fc6fb0011d99bbed4))

## 1.3.9

_2026-07-31_ · [`971a93d9`](https://github.com/s00d/nuxt-i18n-micro/commit/971a93d92db807c66088fa4102bca0987b376cdd)

### Fixes

- publishable caret workspace pins ([`971a93d`](https://github.com/s00d/nuxt-i18n-micro/commit/971a93d92db807c66088fa4102bca0987b376cdd))

## 1.3.8

_2026-07-30_ · [`1df9e31d`](https://github.com/s00d/nuxt-i18n-micro/commit/1df9e31dfd302ebceac36e6f7cd8a6ca97cef6db)

### Features

- **vite.config:** add afterDiagnostic handler for TypeScript errors ([`eae3fc6`](https://github.com/s00d/nuxt-i18n-micro/commit/eae3fc6eb9108a2e1455b37ccb76b484312f9072))

### Chore

- **deps:** update package versions to 'catalog:' in package.json files. ([`1df9e31`](https://github.com/s00d/nuxt-i18n-micro/commit/1df9e31dfd302ebceac36e6f7cd8a6ca97cef6db))

### Other

- Vitest migration, shared fixtures, formats & cache DX (#235) ([`cf369ff`](https://github.com/s00d/nuxt-i18n-micro/commit/cf369ff9585a63d1fd71ef7cd99263fb575d0e67))

## 1.3.7

_2026-06-23_ · [`f19aa921`](https://github.com/s00d/nuxt-i18n-micro/commit/f19aa9212448a33f75bef5d34eaafc14bb79244e)

### Fixes

- **seo:** correct og:locale format and meta refresh timing (#230) ([`f19aa92`](https://github.com/s00d/nuxt-i18n-micro/commit/f19aa9212448a33f75bef5d34eaafc14bb79244e))

## 1.3.6

_2026-06-14_ · [`eda8f471`](https://github.com/s00d/nuxt-i18n-micro/commit/eda8f4717a8696f4266918286e676c755a27a3f3)

### Documentation

- audit fixes, configuration reference, and Astro routing cleanup ([`eda8f47`](https://github.com/s00d/nuxt-i18n-micro/commit/eda8f4717a8696f4266918286e676c755a27a3f3))

## 1.3.5

_2026-06-14_ · [`feab68a8`](https://github.com/s00d/nuxt-i18n-micro/commit/feab68a866d458a06fe885b08ee4e46387b36f6e)

### Features

- extract @i18n-micro/utils and @i18n-micro/hmr packages ([`6a89c98`](https://github.com/s00d/nuxt-i18n-micro/commit/6a89c98c8d9c1c24c636eb4c9e19df1795813c51))

### Tests

- exclude dist publish smoke tests from Jest runs ([`5fe00a0`](https://github.com/s00d/nuxt-i18n-micro/commit/5fe00a08fda88daf64036fe4fddfbdb0c8480f40))
- add dist publish smoke tests for workspace libraries ([`cdf9893`](https://github.com/s00d/nuxt-i18n-micro/commit/cdf9893c08baf9e1ace536c48238cdeb5a965ca7))

### Chore

- migrate to oxlint/oxfmt and improve docs SEO ([`feab68a`](https://github.com/s00d/nuxt-i18n-micro/commit/feab68a866d458a06fe885b08ee4e46387b36f6e))

## 1.3.4

_2026-05-26_ · [`221bab4c`](https://github.com/s00d/nuxt-i18n-micro/commit/221bab4ccf3510309df0583a93d36ea0d7f2e49b)

### Chore

- align publish fields and inline dual-package types ([`221bab4`](https://github.com/s00d/nuxt-i18n-micro/commit/221bab4ccf3510309df0583a93d36ea0d7f2e49b))

## 1.3.3

_2026-04-06_ · [`005b5ac0`](https://github.com/s00d/nuxt-i18n-micro/commit/005b5ac04e66b071f35f4e58dbaed3862c17204d)

### Features

- **seo:** add locale seo flag to exclude from hreflang/og alternates ([`005b5ac`](https://github.com/s00d/nuxt-i18n-micro/commit/005b5ac04e66b071f35f4e58dbaed3862c17204d))

## 1.3.2

_2026-02-19_ · [`c6c3d56f`](https://github.com/s00d/nuxt-i18n-micro/commit/c6c3d56f741c39a37c75a7676647664f554d37ef)

### Fixes

- **core:** remove redundant fallback logic in translation functions ([`c6c3d56`](https://github.com/s00d/nuxt-i18n-micro/commit/c6c3d56f741c39a37c75a7676647664f554d37ef))

### Refactors

- **utils:** rename variable for clarity and filter disabled locales ([`4e0f997`](https://github.com/s00d/nuxt-i18n-micro/commit/4e0f997ae388bf8cf15be3fb3f550f9eb7a1ef00))

## 1.3.1

_2026-02-16_ · [`f34d251a`](https://github.com/s00d/nuxt-i18n-micro/commit/f34d251a1282e3a29313c253830be722d4af726e)

### Features

- add support for x-default hreflang in utils ([`f34d251`](https://github.com/s00d/nuxt-i18n-micro/commit/f34d251a1282e3a29313c253830be722d4af726e))

## 1.3.0

_2026-02-13_ · [`5fe4860a`](https://github.com/s00d/nuxt-i18n-micro/commit/5fe4860a03e9060a0119100239a28ccdc0c4ec9a)

### Fixes

- **i18n:** update page parameter handling in loadTranslationsFromServer ([`7052f54`](https://github.com/s00d/nuxt-i18n-micro/commit/7052f54d24253833efcae0328ae434f38a8ea852))
- update comments to English for clarity ([`8dd57b3`](https://github.com/s00d/nuxt-i18n-micro/commit/8dd57b3a26e660d47abc736c233b3a7740394037))
- **middleware:** update TypeScript ignore comment for property mismatch ([`8dfa03b`](https://github.com/s00d/nuxt-i18n-micro/commit/8dfa03bfb596b724d31ad8d30618580981ff12b1))

### Refactors

- **translations:** rename 'general' to 'root' for clarity ([`5fe4860`](https://github.com/s00d/nuxt-i18n-micro/commit/5fe4860a03e9060a0119100239a28ccdc0c4ec9a))
- **astrol:** remove unused i18n and content type definitions ([`fcfd22a`](https://github.com/s00d/nuxt-i18n-micro/commit/fcfd22a4d6d3eccd7c80dab622d7ad24270b9155))

## 1.2.1

_2026-02-07_ · [`b5306887`](https://github.com/s00d/nuxt-i18n-micro/commit/b53068874489e11d9163a724f6677fc8edb34f88)

### Chore

- **pnpm:** remove `@nuxt/eslint-config` and add `@biomejs/biome` ([`b530688`](https://github.com/s00d/nuxt-i18n-micro/commit/b53068874489e11d9163a724f6677fc8edb34f88))

## 1.2.0

_2026-02-05_ · [`5f49aef0`](https://github.com/s00d/nuxt-i18n-micro/commit/5f49aef0249e6f0891a314376be2c3ab4f15e87d)

### Features

- upgrade version and refactor translation storage ([`5f49aef`](https://github.com/s00d/nuxt-i18n-micro/commit/5f49aef0249e6f0891a314376be2c3ab4f15e87d))

### Fixes

- resolve TypeScript errors in middleware and utils ([`af2de3e`](https://github.com/s00d/nuxt-i18n-micro/commit/af2de3ee296bf3782bca3df1ca15eb63ece2315b))

## 1.1.2

_2026-01-29_ · [`8fe24aed`](https://github.com/s00d/nuxt-i18n-micro/commit/8fe24aedb26abc91066c7a821994c7436d11ec12)

### Fixes

- **i18n-micro-env:** allow null values for localeCookie and missingWarn ([`0fffc0c`](https://github.com/s00d/nuxt-i18n-micro/commit/0fffc0c7f61bde2940d88f40d0ec297fba7363f4))

### Chore

- **pnpm-workspace:** update dependencies for catalog and testing ([`8fe24ae`](https://github.com/s00d/nuxt-i18n-micro/commit/8fe24aedb26abc91066c7a821994c7436d11ec12))

## 1.1.1

_2026-01-26_ · [`ffcb9100`](https://github.com/s00d/nuxt-i18n-micro/commit/ffcb91000332d3b3c1e87ab06c0c92ff3880e2c3)

### Fixes

- handle null localeCookie in routing and integration ([`ffcb910`](https://github.com/s00d/nuxt-i18n-micro/commit/ffcb91000332d3b3c1e87ab06c0c92ff3880e2c3))

## 1.1.0

_2025-12-26_ · [`3ff9c68f`](https://github.com/s00d/nuxt-i18n-micro/commit/3ff9c68f762bf44d575b3f14f85d9f86773cba22)

### Features

- upgrade to version 1.1.0 and add new client exports ([`3ff9c68`](https://github.com/s00d/nuxt-i18n-micro/commit/3ff9c68f762bf44d575b3f14f85d9f86773cba22))

## 1.0.1

_2025-12-08_ · [`9c610516`](https://github.com/s00d/nuxt-i18n-micro/commit/9c6105168b1a94f1325afbbc0ef7622ad3eb01ca)

### Features

- **nuxt.config:** implement build output management in hooks ([`22a0cc9`](https://github.com/s00d/nuxt-i18n-micro/commit/22a0cc957bf5a5b256ceee333f46d191443a0f28))

### Refactors

- **playground:** remove unnecessary reference to `content.d.ts` ([`014868b`](https://github.com/s00d/nuxt-i18n-micro/commit/014868b22098b73c010616fb5770794ae947cb41))

### Chore

- update package versions to 1.0.1 ([`9c61051`](https://github.com/s00d/nuxt-i18n-micro/commit/9c6105168b1a94f1325afbbc0ef7622ad3eb01ca))
- remove unnecessary console log statements ([`b003b65`](https://github.com/s00d/nuxt-i18n-micro/commit/b003b651b86a87a2f11b6435d2904eb61a77a0d4))

## 1.0.0

_2025-12-08_ · [`2a01f9a3`](https://github.com/s00d/nuxt-i18n-micro/commit/2a01f9a3d872cc5075bbafe415146ee0d2cd2530)

### Features

- add i18n integration package ([`a697c2f`](https://github.com/s00d/nuxt-i18n-micro/commit/a697c2f3b2334724bf534867be4fb569b0bcfc23))

### Chore

- set publishConfig access to public for all packages ([`2a01f9a`](https://github.com/s00d/nuxt-i18n-micro/commit/2a01f9a3d872cc5075bbafe415146ee0d2cd2530))
