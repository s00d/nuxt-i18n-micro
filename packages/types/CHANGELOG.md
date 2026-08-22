# @i18n-micro/types

## 1.2.11

_2026-08-05_ · [`cf4c4caa`](https://github.com/s00d/nuxt-i18n-micro/commit/cf4c4caab89c517b4e8c47540fe1f1a646e745d5)

### Features

- Vue DevTools inspector + docs workspace (#246) ([`cf4c4ca`](https://github.com/s00d/nuxt-i18n-micro/commit/cf4c4caab89c517b4e8c47540fe1f1a646e745d5))
- **meta:** fall back to site.url for SEO base ([`d2996b1`](https://github.com/s00d/nuxt-i18n-micro/commit/d2996b1f5bcd4263077bd3d56dc0d0f54420ac0b))

### Fixes

- honor autoDetectPath for preference redirects ([`d182a92`](https://github.com/s00d/nuxt-i18n-micro/commit/d182a92f2e8e720e1fa837b94c1938648be82e5e))

## 1.2.10

_2026-07-31_ · [`65d72d18`](https://github.com/s00d/nuxt-i18n-micro/commit/65d72d189369aeb9ace5e95c008e206879733654)

### Fixes

- **core:** chain custom plural null to defaultPlural ([`65d72d1`](https://github.com/s00d/nuxt-i18n-micro/commit/65d72d189369aeb9ace5e95c008e206879733654))

## 1.2.9

_2026-07-31_ · [`cd932e89`](https://github.com/s00d/nuxt-i18n-micro/commit/cd932e8922bc6557feaead30a62de62dd9d15177)

### Fixes

- **seo:** emit hreflang from iso, not routing code ([`cd932e8`](https://github.com/s00d/nuxt-i18n-micro/commit/cd932e8922bc6557feaead30a62de62dd9d15177))

## 1.2.8

_2026-07-31_ · [`d58c7f53`](https://github.com/s00d/nuxt-i18n-micro/commit/d58c7f53fe4b7db50b450d76c980828ef6742469)

### Features

- Node SSR from public payloads (no Rollup raw:) ([`d58c7f5`](https://github.com/s00d/nuxt-i18n-micro/commit/d58c7f53fe4b7db50b450d76c980828ef6742469))
- **vite.config:** add afterDiagnostic handler for TypeScript errors ([`eae3fc6`](https://github.com/s00d/nuxt-i18n-micro/commit/eae3fc6eb9108a2e1455b37ccb76b484312f9072))

## 1.2.7

_2026-07-30_ · [`cf369ff9`](https://github.com/s00d/nuxt-i18n-micro/commit/cf369ff9585a63d1fd71ef7cd99263fb575d0e67)

### Other

- Vitest migration, shared fixtures, formats & cache DX (#235) ([`cf369ff`](https://github.com/s00d/nuxt-i18n-micro/commit/cf369ff9585a63d1fd71ef7cd99263fb575d0e67))

## 1.2.6

_2026-06-25_ · [`2408a7a5`](https://github.com/s00d/nuxt-i18n-micro/commit/2408a7a593b2db4b7769f7c31d68d677c746ee2f)

### Features

- **seo:** add useI18nHead for per-page i18n SEO overrides ([`2408a7a`](https://github.com/s00d/nuxt-i18n-micro/commit/2408a7a593b2db4b7769f7c31d68d677c746ee2f))

## 1.2.5

_2026-06-23_ · [`f19aa921`](https://github.com/s00d/nuxt-i18n-micro/commit/f19aa9212448a33f75bef5d34eaafc14bb79244e)

### Fixes

- **seo:** correct og:locale format and meta refresh timing (#230) ([`f19aa92`](https://github.com/s00d/nuxt-i18n-micro/commit/f19aa9212448a33f75bef5d34eaafc14bb79244e))

## 1.2.4

_2026-06-15_ · [`20f3c552`](https://github.com/s00d/nuxt-i18n-micro/commit/20f3c55246d3a4c40d4a517d146d054bc5945c96)

### Refactors

- **runtime:** extract NuxtI18n layer and fix SSR/client regressions ([`20f3c55`](https://github.com/s00d/nuxt-i18n-micro/commit/20f3c55246d3a4c40d4a517d146d054bc5945c96))

## 1.2.3

_2026-06-14_ · [`feab68a8`](https://github.com/s00d/nuxt-i18n-micro/commit/feab68a866d458a06fe885b08ee4e46387b36f6e)

### Features

- extract @i18n-micro/utils and @i18n-micro/hmr packages ([`6a89c98`](https://github.com/s00d/nuxt-i18n-micro/commit/6a89c98c8d9c1c24c636eb4c9e19df1795813c51))

### Fixes

- control prerendered translation payloads ([`a8987a7`](https://github.com/s00d/nuxt-i18n-micro/commit/a8987a7e714d1ee3df8ef1530ed2603dac60806a))
- add translation payload output controls ([`246a5b9`](https://github.com/s00d/nuxt-i18n-micro/commit/246a5b9a8aafe20ffc09f5960b0fdcaa3a896659))

### Chore

- migrate to oxlint/oxfmt and improve docs SEO ([`feab68a`](https://github.com/s00d/nuxt-i18n-micro/commit/feab68a866d458a06fe885b08ee4e46387b36f6e))

## 1.2.2

_2026-05-26_ · [`221bab4c`](https://github.com/s00d/nuxt-i18n-micro/commit/221bab4ccf3510309df0583a93d36ea0d7f2e49b)

### Chore

- align publish fields and inline dual-package types ([`221bab4`](https://github.com/s00d/nuxt-i18n-micro/commit/221bab4ccf3510309df0583a93d36ea0d7f2e49b))

## 1.2.1

_2026-04-06_ · [`005b5ac0`](https://github.com/s00d/nuxt-i18n-micro/commit/005b5ac04e66b071f35f4e58dbaed3862c17204d)

### Features

- **seo:** add locale seo flag to exclude from hreflang/og alternates ([`005b5ac`](https://github.com/s00d/nuxt-i18n-micro/commit/005b5ac04e66b071f35f4e58dbaed3862c17204d))

### Fixes

- **seo:** treat empty locale.og as unset for Open Graph meta ([`7c20f01`](https://github.com/s00d/nuxt-i18n-micro/commit/7c20f011829cbb0fe2cbdfb85726bfdd4e26c902))

## 1.2.0

_2026-04-05_ · [`a585bac9`](https://github.com/s00d/nuxt-i18n-micro/commit/a585bac92e45174f74678360ca3158fc9f524c92)

### Features

- **seo:** optional locale `og` for Open Graph og:locale tags ([`a585bac`](https://github.com/s00d/nuxt-i18n-micro/commit/a585bac92e45174f74678360ca3158fc9f524c92))

## 1.1.7

_2026-03-26_ · [`ec2d28ab`](https://github.com/s00d/nuxt-i18n-micro/commit/ec2d28abdaad48827903ad53c64b74f5b60f4af2)

### Features

- **module:** add configurable cache-busting `dateBuild` option ([`ec2d28a`](https://github.com/s00d/nuxt-i18n-micro/commit/ec2d28abdaad48827903ad53c64b74f5b60f4af2))
- add locale configuration object with index signature support ([`a6d0218`](https://github.com/s00d/nuxt-i18n-micro/commit/a6d0218762c59697c4f5ee23bbe7ad30c03a1509))

### Fixes

- correct time unit in cache TTL documentation ([`e7a4a96`](https://github.com/s00d/nuxt-i18n-micro/commit/e7a4a9696e8b97d47204e8b0e2c01d1228c0c356))

## 1.1.6

_2026-02-16_ · [`aa2ac38e`](https://github.com/s00d/nuxt-i18n-micro/commit/aa2ac38edc9445b2353d27387c657c0e9492a00c)

### Features

- add option to disable built-in i18n component registration ([`aa2ac38`](https://github.com/s00d/nuxt-i18n-micro/commit/aa2ac38edc9445b2353d27387c657c0e9492a00c))

## 1.1.5

_2026-02-13_ · [`25139fdd`](https://github.com/s00d/nuxt-i18n-micro/commit/25139fdd5d702e582d73f0610f8fbf7198f6d3b4)

### Refactors

- remove unused `rootDirs` property from `ModulePrivateOptionsExtend` ([`25139fd`](https://github.com/s00d/nuxt-i18n-micro/commit/25139fdd5d702e582d73f0610f8fbf7198f6d3b4))

## 1.1.4

_2026-02-12_ · [`cd0f9a4c`](https://github.com/s00d/nuxt-i18n-micro/commit/cd0f9a4c3e376f28bf26ec900f0314ebf651317e)

### Features

- add cacheMaxSize and cacheTtl options to configuration ([`318ccf8`](https://github.com/s00d/nuxt-i18n-micro/commit/318ccf8523b8b8f23ad13a50e8133939e6d4d018))

### Refactors

- improve type definitions and documentation for i18n ([`cd0f9a4`](https://github.com/s00d/nuxt-i18n-micro/commit/cd0f9a4c3e376f28bf26ec900f0314ebf651317e))

## 1.1.3

_2026-02-07_ · [`6f38bbdd`](https://github.com/s00d/nuxt-i18n-micro/commit/6f38bbdd1f5a4ea4e29757a1722644893137f73c)

### Features

- **route-strategy:** remove `includeDefaultLocaleRoute` option ([`6f38bbd`](https://github.com/s00d/nuxt-i18n-micro/commit/6f38bbdd1f5a4ea4e29757a1722644893137f73c))

### Fixes

- update comments to English for clarity ([`8dd57b3`](https://github.com/s00d/nuxt-i18n-micro/commit/8dd57b3a26e660d47abc736c233b3a7740394037))

## 1.1.2

_2026-02-07_ · [`67b84a3f`](https://github.com/s00d/nuxt-i18n-micro/commit/67b84a3ff038855c47f39f24d0346454318f7862)

### Features

- add optional `redirects` property to ModuleOptions interface ([`67b84a3`](https://github.com/s00d/nuxt-i18n-micro/commit/67b84a3ff038855c47f39f24d0346454318f7862))

## 1.1.1

_2026-02-07_ · [`b5306887`](https://github.com/s00d/nuxt-i18n-micro/commit/b53068874489e11d9163a724f6677fc8edb34f88)

### Refactors

- update experimental options in ModuleOptions interface ([`5e830f2`](https://github.com/s00d/nuxt-i18n-micro/commit/5e830f29e8d3649ab4c8a2ffeee5247cbb484f58))

### Chore

- **pnpm:** remove `@nuxt/eslint-config` and add `@biomejs/biome` ([`b530688`](https://github.com/s00d/nuxt-i18n-micro/commit/b53068874489e11d9163a724f6677fc8edb34f88))

## 1.1.0

_2026-02-05_ · [`3d0149b1`](https://github.com/s00d/nuxt-i18n-micro/commit/3d0149b180d4210d92ab83c08f04817608dbca07)

### Chore

- **version:** update version to `1.1.0` in `package.json` ([`3d0149b`](https://github.com/s00d/nuxt-i18n-micro/commit/3d0149b180d4210d92ab83c08f04817608dbca07))

## 1.0.19

_2026-01-29_ · [`8fe24aed`](https://github.com/s00d/nuxt-i18n-micro/commit/8fe24aedb26abc91066c7a821994c7436d11ec12)

### Chore

- **pnpm-workspace:** update dependencies for catalog and testing ([`8fe24ae`](https://github.com/s00d/nuxt-i18n-micro/commit/8fe24aedb26abc91066c7a821994c7436d11ec12))

## 1.0.18

_2026-01-28_ · [`b57fa3fa`](https://github.com/s00d/nuxt-i18n-micro/commit/b57fa3fab5a7d5b4ad41d7802723fa13976c1ea2)

### Features

- update version to 1.0.18 and add localizedRouteNamePrefix ([`b57fa3f`](https://github.com/s00d/nuxt-i18n-micro/commit/b57fa3fab5a7d5b4ad41d7802723fa13976c1ea2))

## 1.0.17

_2026-01-26_ · [`504afc53`](https://github.com/s00d/nuxt-i18n-micro/commit/504afc53edbeb1a06f043a2c730bd531d6e91054)

### Fixes

- allow `localeCookie` to accept null values ([`504afc5`](https://github.com/s00d/nuxt-i18n-micro/commit/504afc53edbeb1a06f043a2c730bd531d6e91054))

## 1.0.16

_2025-12-26_ · [`19d90369`](https://github.com/s00d/nuxt-i18n-micro/commit/19d9036924fc02c2ce0417762e18af68b17d64a7)

### Chore

- update `vite-plugin-dts` version to `^4.5.4` ([`19d9036`](https://github.com/s00d/nuxt-i18n-micro/commit/19d9036924fc02c2ce0417762e18af68b17d64a7))

## 1.0.15

_2025-12-08_ · [`2a01f9a3`](https://github.com/s00d/nuxt-i18n-micro/commit/2a01f9a3d872cc5075bbafe415146ee0d2cd2530)

### Features

- add translation key types for enhanced localization support ([`a57da32`](https://github.com/s00d/nuxt-i18n-micro/commit/a57da32031862a63fde3c27007d11492458508b9))
- add MissingHandler type and missingWarn option ([`96244e4`](https://github.com/s00d/nuxt-i18n-micro/commit/96244e4412a1ee830d1f30487c17e3ef86208408))

### Chore

- set publishConfig access to public for all packages ([`2a01f9a`](https://github.com/s00d/nuxt-i18n-micro/commit/2a01f9a3d872cc5075bbafe415146ee0d2cd2530))
- rename package to @i18n-micro/types ([`fb76891`](https://github.com/s00d/nuxt-i18n-micro/commit/fb768916f89a6082967cc8379d49c0e73535f5cf))

## 1.0.14

_2025-11-06_ · [`5a788946`](https://github.com/s00d/nuxt-i18n-micro/commit/5a788946fb56a3178b1b99f3cdbbd7f496a6810f)

### Features

- add apiBaseClientHost and apiBaseServerHost options ([`5a78894`](https://github.com/s00d/nuxt-i18n-micro/commit/5a788946fb56a3178b1b99f3cdbbd7f496a6810f))

## 1.0.13

_2025-11-06_ · [`78ad31c0`](https://github.com/s00d/nuxt-i18n-micro/commit/78ad31c03409cd16676d7a60fb223d5df4874f85)

### Features

- add apiBaseUrl to configuration type ([`78ad31c`](https://github.com/s00d/nuxt-i18n-micro/commit/78ad31c03409cd16676d7a60fb223d5df4874f85))

## 1.0.12

_2025-10-30_ · [`f64238e8`](https://github.com/s00d/nuxt-i18n-micro/commit/f64238e89f554769f6f4f400565139214202cfd0)

### Refactors

- remove `disableUpdater` option from configuration ([`f64238e`](https://github.com/s00d/nuxt-i18n-micro/commit/f64238e89f554769f6f4f400565139214202cfd0))

## 1.0.11

_2025-10-30_ · [`0431b6ca`](https://github.com/s00d/nuxt-i18n-micro/commit/0431b6ca0bd17520ea950f35932321f7a5c43e3e)

### Features

- add `hmr` and `routesLocaleLinks` to types ([`0431b6c`](https://github.com/s00d/nuxt-i18n-micro/commit/0431b6ca0bd17520ea950f35932321f7a5c43e3e))

## 1.0.10

_2025-10-10_ · [`57ab76af`](https://github.com/s00d/nuxt-i18n-micro/commit/57ab76aff37c3572dd6ca6d2127001e7df4f74ba)

### Features

- enhance `DefineI18nRouteConfig` with new properties ([`57ab76a`](https://github.com/s00d/nuxt-i18n-micro/commit/57ab76aff37c3572dd6ca6d2127001e7df4f74ba))

## 1.0.9

_2025-10-06_ · [`7df8b03f`](https://github.com/s00d/nuxt-i18n-micro/commit/7df8b03fe851da5b03fedc89f9e984b1b2f68244)

### Features

- add experimental i18nPreviousPageFallback option ([`7df8b03`](https://github.com/s00d/nuxt-i18n-micro/commit/7df8b03fe851da5b03fedc89f9e984b1b2f68244))

## 1.0.8

_2025-09-30_ · [`34afb682`](https://github.com/s00d/nuxt-i18n-micro/commit/34afb6827f4d633fccff1bd5f630aede0b2ddc65)

### Features

- add `routeLocales` option to `ModuleOptions` ([`34afb68`](https://github.com/s00d/nuxt-i18n-micro/commit/34afb6827f4d633fccff1bd5f630aede0b2ddc65))

## 1.0.7

_2025-09-25_ · [`b1715802`](https://github.com/s00d/nuxt-i18n-micro/commit/b1715802de1484dbbd7a17feaec91d73d0be476d)

### Features

- add excludePatterns option to ModuleOptions interface ([`b171580`](https://github.com/s00d/nuxt-i18n-micro/commit/b1715802de1484dbbd7a17feaec91d73d0be476d))

## 1.0.6

_2025-08-28_ · [`c324ed72`](https://github.com/s00d/nuxt-i18n-micro/commit/c324ed72c317256b084d9b1244250baf8908c903)

### Features

- **locale-head:** add query filtering for SEO canonical links ([`8ba736d`](https://github.com/s00d/nuxt-i18n-micro/commit/8ba736db7819bcb8259df508e1045e6a654065ed))

### Fixes

- **core:** correct version numbers in package.json files ([`c324ed7`](https://github.com/s00d/nuxt-i18n-micro/commit/c324ed72c317256b084d9b1244250baf8908c903))

### Chore

- **core:** update package versions and file extensions to .mts ([`985929d`](https://github.com/s00d/nuxt-i18n-micro/commit/985929d3057ea06dc23db328d58a035c4abfeaea))

## 1.0.5

_2025-04-30_ · [`f95d0a64`](https://github.com/s00d/nuxt-i18n-micro/commit/f95d0a642d02fa7746e7e47d2ab5e7ca7bbc9c60)

### Features

- **redirects:** add redirect functionality to i18n plugin ([`f95d0a6`](https://github.com/s00d/nuxt-i18n-micro/commit/f95d0a642d02fa7746e7e47d2ab5e7ca7bbc9c60))

## 1.0.4

_2025-04-05_ · [`0eb519ee`](https://github.com/s00d/nuxt-i18n-micro/commit/0eb519eeb5bb3a2b6ce1e90ebaeff9d5027c0088)

### Fixes

- allow `unknown` type in `Translation` definition ([`e98d4c9`](https://github.com/s00d/nuxt-i18n-micro/commit/e98d4c91f3c9833e093a4aad7d68e54832b07b8b))

### Refactors

- rename `Translation` to `CleanTranslation` and update types ([`0eb519e`](https://github.com/s00d/nuxt-i18n-micro/commit/0eb519eeb5bb3a2b6ce1e90ebaeff9d5027c0088))
- remove 'unknown' from Translation type definition ([`f5000c9`](https://github.com/s00d/nuxt-i18n-micro/commit/f5000c96fd340913f0b8f8b5758093e21c81c75d))

## 1.0.3

_2025-03-21_ · [`df64d4d7`](https://github.com/s00d/nuxt-i18n-micro/commit/df64d4d7d5857f1785356e96af243e5655006359)

### Features

- add fallbackLocale configuration option to locale ([`df64d4d`](https://github.com/s00d/nuxt-i18n-micro/commit/df64d4d7d5857f1785356e96af243e5655006359))

## 1.0.2

_2025-03-01_ · [`a491d482`](https://github.com/s00d/nuxt-i18n-micro/commit/a491d482b7934df7c38d837d33161d062544eb14)

### Features

- add noPrefixRedirect option to ModuleOptions ([`a491d48`](https://github.com/s00d/nuxt-i18n-micro/commit/a491d482b7934df7c38d837d33161d062544eb14))

## 1.0.1

_2025-01-23_ · [`fb616f3b`](https://github.com/s00d/nuxt-i18n-micro/commit/fb616f3b223c6e0f9a0e80d1df463eedd25cc75c)

### Features

- add hooks and customRegexMatcher properties ([`fb616f3`](https://github.com/s00d/nuxt-i18n-micro/commit/fb616f3b223c6e0f9a0e80d1df463eedd25cc75c))

## 1.0.0

_2025-01-20_ · [`11f09784`](https://github.com/s00d/nuxt-i18n-micro/commit/11f097842da4c5658a49a18ea66024de04e95cbe)

### Features

- add TypeScript types and configuration for nuxt-i18n ([`026964d`](https://github.com/s00d/nuxt-i18n-micro/commit/026964de9ca35e9c2fe18ad0b497d96c8e47b98e))

### Chore

- update test script to indicate no tests are specified ([`11f0978`](https://github.com/s00d/nuxt-i18n-micro/commit/11f097842da4c5658a49a18ea66024de04e95cbe))
- add MIT license and types for Jest ([`4c12699`](https://github.com/s00d/nuxt-i18n-micro/commit/4c12699ff33852eb7b43ac74b01e4f8053453ac6))
