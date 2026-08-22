# @i18n-micro/core

## 1.3.14

_2026-08-21_ · [`50d606be`](https://github.com/s00d/nuxt-i18n-micro/commit/50d606bea2fc695475c11e27927b91efafcff111)

### Features

- add BaseI18n.extend for custom methods ([`50d606b`](https://github.com/s00d/nuxt-i18n-micro/commit/50d606bea2fc695475c11e27927b91efafcff111))

## 1.3.13

_2026-08-05_ · [`cf4c4caa`](https://github.com/s00d/nuxt-i18n-micro/commit/cf4c4caab89c517b4e8c47540fe1f1a646e745d5)

### Features

- Vue DevTools inspector + docs workspace (#246) ([`cf4c4ca`](https://github.com/s00d/nuxt-i18n-micro/commit/cf4c4caab89c517b4e8c47540fe1f1a646e745d5))

## 1.3.11

_2026-07-31_ · [`65d72d18`](https://github.com/s00d/nuxt-i18n-micro/commit/65d72d189369aeb9ace5e95c008e206879733654)

### Fixes

- chain custom plural null to defaultPlural ([`65d72d1`](https://github.com/s00d/nuxt-i18n-micro/commit/65d72d189369aeb9ace5e95c008e206879733654))

## 1.3.10

_2026-07-31_ · [`030834e5`](https://github.com/s00d/nuxt-i18n-micro/commit/030834e5dad8b40c46910662eafcc5915d4b703c)

### Chore

- cascade bump packages after types/utils release pins ([`030834e`](https://github.com/s00d/nuxt-i18n-micro/commit/030834e5dad8b40c46910662eafcc5915d4b703c))

## 1.3.9

_2026-07-31_ · [`971a93d9`](https://github.com/s00d/nuxt-i18n-micro/commit/971a93d92db807c66088fa4102bca0987b376cdd)

### Features

- **vite.config:** add afterDiagnostic handler for TypeScript errors ([`eae3fc6`](https://github.com/s00d/nuxt-i18n-micro/commit/eae3fc6eb9108a2e1455b37ccb76b484312f9072))

### Fixes

- publishable caret workspace pins ([`971a93d`](https://github.com/s00d/nuxt-i18n-micro/commit/971a93d92db807c66088fa4102bca0987b376cdd))

## 1.3.8

_2026-07-30_ · [`25fc2de8`](https://github.com/s00d/nuxt-i18n-micro/commit/25fc2de862766512f76c7c023a409f2c7cf81161)

### Fixes

- **i18n:** merge translation layers without flattening dumps ([`25fc2de`](https://github.com/s00d/nuxt-i18n-micro/commit/25fc2de862766512f76c7c023a409f2c7cf81161))

## 1.3.7

_2026-07-30_ · [`cf369ff9`](https://github.com/s00d/nuxt-i18n-micro/commit/cf369ff9585a63d1fd71ef7cd99263fb575d0e67)

### Other

- Vitest migration, shared fixtures, formats & cache DX (#235) ([`cf369ff`](https://github.com/s00d/nuxt-i18n-micro/commit/cf369ff9585a63d1fd71ef7cd99263fb575d0e67))

## 1.3.4

_2026-07-06_ · [`ad15834e`](https://github.com/s00d/nuxt-i18n-micro/commit/ad15834e32d69e80f19b5fdd5b7d3357dec08689)

### Fixes

- **nitro:** harden #233 export conditions with regression tests ([`ad15834`](https://github.com/s00d/nuxt-i18n-micro/commit/ad15834e32d69e80f19b5fdd5b7d3357dec08689))

## 1.3.3

_2026-06-29_ · [`af9f9ea3`](https://github.com/s00d/nuxt-i18n-micro/commit/af9f9ea31d838f7d1e0408c7417b11f34fde7fca)

### Fixes

- order production export before import to silence esbuild warnings ([`af9f9ea`](https://github.com/s00d/nuxt-i18n-micro/commit/af9f9ea31d838f7d1e0408c7417b11f34fde7fca))
- **nitro:** resolve #233 via package export conditions, drop traceInclude hack ([`d467436`](https://github.com/s00d/nuxt-i18n-micro/commit/d4674369969dbae3ed9bae10201185152314bd3d))
- address cubic PR review findings ([`47ce12a`](https://github.com/s00d/nuxt-i18n-micro/commit/47ce12afc701d29247bdefd088a6fb43902a5920))

### Tests

- **types:** cover $tdr RelativeTimeFormatOptions typing (#231) ([`649f8c9`](https://github.com/s00d/nuxt-i18n-micro/commit/649f8c9eeb19bfe4d1862f3de4a278966ac6d41d))

## 1.3.2

_2026-06-15_ · [`20f3c552`](https://github.com/s00d/nuxt-i18n-micro/commit/20f3c55246d3a4c40d4a517d146d054bc5945c96)

### Refactors

- **runtime:** extract NuxtI18n layer and fix SSR/client regressions ([`20f3c55`](https://github.com/s00d/nuxt-i18n-micro/commit/20f3c55246d3a4c40d4a517d146d054bc5945c96))

## 1.3.1

_2026-06-14_ · [`feab68a8`](https://github.com/s00d/nuxt-i18n-micro/commit/feab68a866d458a06fe885b08ee4e46387b36f6e)

### Tests

- exclude dist publish smoke tests from Jest runs ([`5fe00a0`](https://github.com/s00d/nuxt-i18n-micro/commit/5fe00a08fda88daf64036fe4fddfbdb0c8480f40))
- add dist publish smoke tests for workspace libraries ([`cdf9893`](https://github.com/s00d/nuxt-i18n-micro/commit/cdf9893c08baf9e1ace536c48238cdeb5a965ca7))

### Chore

- migrate to oxlint/oxfmt and improve docs SEO ([`feab68a`](https://github.com/s00d/nuxt-i18n-micro/commit/feab68a866d458a06fe885b08ee4e46387b36f6e))
- align publish fields and inline dual-package types ([`221bab4`](https://github.com/s00d/nuxt-i18n-micro/commit/221bab4ccf3510309df0583a93d36ea0d7f2e49b))

## 1.3.0

_2026-04-05_ · [`a585bac9`](https://github.com/s00d/nuxt-i18n-micro/commit/a585bac92e45174f74678360ca3158fc9f524c92)

### Features

- **seo:** optional locale `og` for Open Graph og:locale tags ([`a585bac`](https://github.com/s00d/nuxt-i18n-micro/commit/a585bac92e45174f74678360ca3158fc9f524c92))

## 1.2.0

_2026-02-13_ · [`1a635278`](https://github.com/s00d/nuxt-i18n-micro/commit/1a635278a875bafeec83df21f198e29d0ef5d479)

### Refactors

- **translation:** simplify translation cache management logic ([`1a63527`](https://github.com/s00d/nuxt-i18n-micro/commit/1a635278a875bafeec83df21f198e29d0ef5d479))

## 1.1.4

_2026-02-12_ · [`024a6d89`](https://github.com/s00d/nuxt-i18n-micro/commit/024a6d892a86454d5e819f76a290c49d68e4af37)

### Refactors

- remove previous page fallback functionality ([`024a6d8`](https://github.com/s00d/nuxt-i18n-micro/commit/024a6d892a86454d5e819f76a290c49d68e4af37))

## 1.1.3

_2026-02-07_ · [`d24e49c8`](https://github.com/s00d/nuxt-i18n-micro/commit/d24e49c8be2d8f018f154e69f833cd67bbbe77c3)

### Fixes

- update version to 1.1.3 in package.json ([`d24e49c`](https://github.com/s00d/nuxt-i18n-micro/commit/d24e49c8be2d8f018f154e69f833cd67bbbe77c3))
- update comments to English for clarity ([`8dd57b3`](https://github.com/s00d/nuxt-i18n-micro/commit/8dd57b3a26e660d47abc736c233b3a7740394037))

## 1.1.2

_2026-02-07_ · [`b5306887`](https://github.com/s00d/nuxt-i18n-micro/commit/b53068874489e11d9163a724f6677fc8edb34f88)

### Chore

- **pnpm:** remove `@nuxt/eslint-config` and add `@biomejs/biome` ([`b530688`](https://github.com/s00d/nuxt-i18n-micro/commit/b53068874489e11d9163a724f6677fc8edb34f88))

## 1.1.1

_2026-02-06_ · [`db7b9532`](https://github.com/s00d/nuxt-i18n-micro/commit/db7b9532793288c77a13dd093801372fc75d6110)

### Features

- **translations:** add setTranslations method for locale management ([`da01e7a`](https://github.com/s00d/nuxt-i18n-micro/commit/da01e7ab74e0cad97142a92cbcb7891429583bb2))

### Refactors

- remove `RouteService` and related imports ([`db7b953`](https://github.com/s00d/nuxt-i18n-micro/commit/db7b9532793288c77a13dd093801372fc75d6110))

### Tests

- **route-service:** improve tests for getCurrentLocale logic ([`e05895b`](https://github.com/s00d/nuxt-i18n-micro/commit/e05895bb84d6d96d76885d3e563d1b8a33e863f7))

## 1.1.0

_2026-02-05_ · [`5ab2d3c4`](https://github.com/s00d/nuxt-i18n-micro/commit/5ab2d3c49e2dcf64ec62d3dde0a20297ad69eefc)

### Features

- **route-service:** add support for prefix_except_default strategy ([`24c4347`](https://github.com/s00d/nuxt-i18n-micro/commit/24c4347cbf04b8341814aef3abaa45b8ca572309))
- **helpers:** improve template interpolation with regex replacement ([`a8180e7`](https://github.com/s00d/nuxt-i18n-micro/commit/a8180e7be5ec0583af59fab534d187e854a13fd1))

### Refactors

- **translation:** simplify translation storage and caching logic ([`8d427fb`](https://github.com/s00d/nuxt-i18n-micro/commit/8d427fbd759431a3c1550b007145fab6fdb008cc))
- rename type `TranslationCache` to `TranslationStorage` ([`e3d4d3b`](https://github.com/s00d/nuxt-i18n-micro/commit/e3d4d3b8fbc8bab8affad71f234d7b118dd09cff))
- rename cache to storage in BaseI18nOptions interface ([`cce1dd2`](https://github.com/s00d/nuxt-i18n-micro/commit/cce1dd2edb2154423cf9dbabf9b9f1a4575da59e))

### Tests

- **i18n:** update tests to use custom storage instead of cache ([`da1cd44`](https://github.com/s00d/nuxt-i18n-micro/commit/da1cd44acab880a7024444d1e714f01a6eb4b3e6))

### Chore

- update version to 1.1.0 in package.json ([`5ab2d3c`](https://github.com/s00d/nuxt-i18n-micro/commit/5ab2d3c49e2dcf64ec62d3dde0a20297ad69eefc))

## 1.0.31

_2026-02-04_ · [`661d7c72`](https://github.com/s00d/nuxt-i18n-micro/commit/661d7c729eb98661aff6966b98aa8629796cf5d0)

### Features

- **route-service:** add optional locale getter for dynamic locale retrieval ([`5ff70ae`](https://github.com/s00d/nuxt-i18n-micro/commit/5ff70aed4fb5b1f32cdf42339eb2b94fa52c67f2))

### Fixes

- update version to 1.0.31 in package.json ([`661d7c7`](https://github.com/s00d/nuxt-i18n-micro/commit/661d7c729eb98661aff6966b98aa8629796cf5d0))

### Refactors

- **translation:** simplify mergeTranslation logic and remove dev warning ([`8b7fb32`](https://github.com/s00d/nuxt-i18n-micro/commit/8b7fb32fdd41629b753daa6bf8d0bf92e160dc17))

### Tests

- **route-service:** remove setCookie mock from RouteService tests ([`cccc3cc`](https://github.com/s00d/nuxt-i18n-micro/commit/cccc3cc48f52d10df49f425ace8e3143d2b3974c))

## 1.0.30

_2026-01-29_ · [`8fe24aed`](https://github.com/s00d/nuxt-i18n-micro/commit/8fe24aedb26abc91066c7a821994c7436d11ec12)

### Chore

- **pnpm-workspace:** update dependencies for catalog and testing ([`8fe24ae`](https://github.com/s00d/nuxt-i18n-micro/commit/8fe24aedb26abc91066c7a821994c7436d11ec12))

## 1.0.29

_2026-01-26_ · [`31bd2083`](https://github.com/s00d/nuxt-i18n-micro/commit/31bd208331eff5b62a2a6a4a55efdd87e75376fe)

### Fixes

- **route-service:** prevent cookie update when localeCookie is disabled ([`31bd208`](https://github.com/s00d/nuxt-i18n-micro/commit/31bd208331eff5b62a2a6a4a55efdd87e75376fe))
- respect localeCookie for no_prefix ([`d5bec8e`](https://github.com/s00d/nuxt-i18n-micro/commit/d5bec8e88fff991a7bc6a7add9bc9827ca2ce8cc))

### Tests

- cover localeCookie fallback ([`b18a1ec`](https://github.com/s00d/nuxt-i18n-micro/commit/b18a1ecdafb9f7f625bd0d9b96835d1a82bbb0be))

### Other

- Merge remote-tracking branch 'origin/main' ([`7844f0f`](https://github.com/s00d/nuxt-i18n-micro/commit/7844f0fa52b2a063a124557c123bd1164448935b))

## 1.0.28

_2025-12-26_ · [`cf220bbd`](https://github.com/s00d/nuxt-i18n-micro/commit/cf220bbd5fb17a927587399cac5d1c0c9b384fa7)

### Features

- add BaseI18n class for i18n adapter implementation ([`cf220bb`](https://github.com/s00d/nuxt-i18n-micro/commit/cf220bbd5fb17a927587399cac5d1c0c9b384fa7))

## 1.0.27

_2025-12-08_ · [`2a01f9a3`](https://github.com/s00d/nuxt-i18n-micro/commit/2a01f9a3d872cc5075bbafe415146ee0d2cd2530)

### Refactors

- rename package from `nuxt-i18n-micro-core` to `@i18n-micro/core` ([`31ced79`](https://github.com/s00d/nuxt-i18n-micro/commit/31ced791c449ba08191da87890b8e0759b7cd27d))

### Chore

- set publishConfig access to public for all packages ([`2a01f9a`](https://github.com/s00d/nuxt-i18n-micro/commit/2a01f9a3d872cc5075bbafe415146ee0d2cd2530))

## 1.0.26

_2025-12-03_ · [`fa66c2a7`](https://github.com/s00d/nuxt-i18n-micro/commit/fa66c2a787ca87b591f5c415129d5e5e6a64a298)

### Refactors

- **route-service:** improve locale extraction and comments ([`fa66c2a`](https://github.com/s00d/nuxt-i18n-micro/commit/fa66c2a787ca87b591f5c415129d5e5e6a64a298))

### Tests

- **route-service:** add tests for locale extraction and cookie fallback ([`c4854d5`](https://github.com/s00d/nuxt-i18n-micro/commit/c4854d56e6a0a6b7c15fa887b006e64c8e09a567))

## 1.0.25

_2025-11-20_ · [`782acc3e`](https://github.com/s00d/nuxt-i18n-micro/commit/782acc3e7368b2e488630abcd67a9d7bec1f3b11)

### Features

- **route-service:** add locale extraction from URL path ([`782acc3`](https://github.com/s00d/nuxt-i18n-micro/commit/782acc3e7368b2e488630abcd67a9d7bec1f3b11))

## 1.0.24

_2025-11-06_ · [`fb2e1eea`](https://github.com/s00d/nuxt-i18n-micro/commit/fb2e1eea31c833f7abe47dba1fd28891618dc1e0)

### Features

- **route-service:** add method to get plugin route name based on locale ([`fb2e1ee`](https://github.com/s00d/nuxt-i18n-micro/commit/fb2e1eea31c833f7abe47dba1fd28891618dc1e0))

## 1.0.23

_2025-11-04_ · [`1ea1cf78`](https://github.com/s00d/nuxt-i18n-micro/commit/1ea1cf78fff6e81547785fac6f0925ad8be0589a)

### Fixes

- **package:** bump version to 1.0.23 in `package.json` ([`1ea1cf7`](https://github.com/s00d/nuxt-i18n-micro/commit/1ea1cf78fff6e81547785fac6f0925ad8be0589a))

### Refactors

- **helpers:** replace arrow functions with regular function declarations ([`bbc7da8`](https://github.com/s00d/nuxt-i18n-micro/commit/bbc7da8b6f5830425c3b92e09cf48c3f22af2669))

## 1.0.22

_2025-11-03_ · [`8ed38b9b`](https://github.com/s00d/nuxt-i18n-micro/commit/8ed38b9b7860e7ebfb33d0baa59ecaca0fd54a1c)

### Refactors

- **route-service:** improve parameter handling for localized routes ([`8ed38b9`](https://github.com/s00d/nuxt-i18n-micro/commit/8ed38b9b7860e7ebfb33d0baa59ecaca0fd54a1c))

## 1.0.21

_2025-10-31_ · [`fd552a93`](https://github.com/s00d/nuxt-i18n-micro/commit/fd552a93d74c7041be0f8dc56781ad0452651e43)

### Features

- **route-service:** enhance route resolution by checking route names ([`fd552a9`](https://github.com/s00d/nuxt-i18n-micro/commit/fd552a93d74c7041be0f8dc56781ad0452651e43))

## 1.0.20

_2025-10-30_ · [`e091cfb2`](https://github.com/s00d/nuxt-i18n-micro/commit/e091cfb2224dfd1d7ec3765d77dd5f9b38941ef6)

### Fixes

- **translation:** improve cache handling and warning in mergeTranslation ([`e091cfb`](https://github.com/s00d/nuxt-i18n-micro/commit/e091cfb2224dfd1d7ec3765d77dd5f9b38941ef6))

## 1.0.19

_2025-10-30_ · [`721e5dd6`](https://github.com/s00d/nuxt-i18n-micro/commit/721e5dd6ec9ce77af4e07f0abe053595a6139760)

### Features

- **translation:** implement request-scoped translation caching ([`721e5dd`](https://github.com/s00d/nuxt-i18n-micro/commit/721e5dd6ec9ce77af4e07f0abe053595a6139760))

### Fixes

- **format-service:** update error message for invalid dates ([`f8e3db0`](https://github.com/s00d/nuxt-i18n-micro/commit/f8e3db02391e34ce48b3be8f8e840548eaf1743e))

### Refactors

- **tests:** improve comments in route-service tests for clarity ([`07cf578`](https://github.com/s00d/nuxt-i18n-micro/commit/07cf57818d6a8f1af49f3b828c58d47e64059c02))
- **route-service:** improve comments for clarity and consistency ([`c40bc56`](https://github.com/s00d/nuxt-i18n-micro/commit/c40bc56da23123aa634c959a3bbd1aa339786e5f))

## 1.0.18

_2025-08-28_ · [`c324ed72`](https://github.com/s00d/nuxt-i18n-micro/commit/c324ed72c317256b084d9b1244250baf8908c903)

### Features

- add cache clearing functionality for translations ([`e50d70a`](https://github.com/s00d/nuxt-i18n-micro/commit/e50d70ad1d61c35d4d5cd175377d2a8048d6e4bf))

### Fixes

- correct version numbers in package.json files ([`c324ed7`](https://github.com/s00d/nuxt-i18n-micro/commit/c324ed72c317256b084d9b1244250baf8908c903))

### Chore

- update package versions and file extensions to .mts ([`985929d`](https://github.com/s00d/nuxt-i18n-micro/commit/985929d3057ea06dc23db328d58a035c4abfeaea))
- **version:** update version to 1.0.18 in package.json ([`29366c2`](https://github.com/s00d/nuxt-i18n-micro/commit/29366c231f1c787d67799121d3359d9da94ccba1))

## 1.0.17

_2025-02-18_ · [`86284fbe`](https://github.com/s00d/nuxt-i18n-micro/commit/86284fbe41e96deee687971d09e0712ce5a52e06)

### Fixes

- **route-service:** ensure route starts with a leading slash ([`86284fb`](https://github.com/s00d/nuxt-i18n-micro/commit/86284fbe41e96deee687971d09e0712ce5a52e06))

## 1.0.16

_2025-01-24_ · [`ca578e89`](https://github.com/s00d/nuxt-i18n-micro/commit/ca578e89374e7d03821ad4f40ca3789558229df3)

### Features

- **translation:** improve translation fallback mechanism ([`41b8719`](https://github.com/s00d/nuxt-i18n-micro/commit/41b871935c308575b6ad8ab06e3186f035e7d785))

### Chore

- bump version to 1.0.16 in `package.json` ([`ca578e8`](https://github.com/s00d/nuxt-i18n-micro/commit/ca578e89374e7d03821ad4f40ca3789558229df3))

## 1.0.15

_2025-01-22_ · [`037d4bcb`](https://github.com/s00d/nuxt-i18n-micro/commit/037d4bcb1d7a2bdc0652e2a6b3da54d4dcbf0741)

### Fixes

- **format-service:** return "0 seconds ago" for invalid dates ([`f937113`](https://github.com/s00d/nuxt-i18n-micro/commit/f937113421341bd64d3a89cda8a402bbeafe3a38))

### Refactors

- **route-service:** improve route type handling in locale functions ([`037d4bc`](https://github.com/s00d/nuxt-i18n-micro/commit/037d4bcb1d7a2bdc0652e2a6b3da54d4dcbf0741))

## 1.0.14

_2025-01-20_ · [`5b109975`](https://github.com/s00d/nuxt-i18n-micro/commit/5b109975b08073f1d4d9332f555132d19614db82)

### Refactors

- remove unused types and update imports ([`0ca337c`](https://github.com/s00d/nuxt-i18n-micro/commit/0ca337ca87a1c12f21c68b9439e33ab59049bd03))

### Tests

- add comprehensive unit tests for format and route services ([`80ca6d6`](https://github.com/s00d/nuxt-i18n-micro/commit/80ca6d6c8633b668a1b84dd626c913c29d8fe7cd))

### Documentation

- update README to include formatting and routing utilities ([`5b10997`](https://github.com/s00d/nuxt-i18n-micro/commit/5b109975b08073f1d4d9332f555132d19614db82))

## 1.0.13

_2025-01-16_ · [`4d60cee4`](https://github.com/s00d/nuxt-i18n-micro/commit/4d60cee4ee3c3a03107b3aa9c2aef325d00a88fd)

### Chore

- **release:** bump version for test-utils and core packages ([`4d60cee`](https://github.com/s00d/nuxt-i18n-micro/commit/4d60cee4ee3c3a03107b3aa9c2aef325d00a88fd))

## 1.0.12

_2025-01-16_ · [`1349e899`](https://github.com/s00d/nuxt-i18n-micro/commit/1349e899d70204b8a2f6531c5214f4bc4671e518)

### Features

- **translation:** update translation helper to support locale parameter ([`1349e89`](https://github.com/s00d/nuxt-i18n-micro/commit/1349e899d70204b8a2f6531c5214f4bc4671e518))

### Refactors

- **translation:** replace Map with Record for locale caches ([`d10d997`](https://github.com/s00d/nuxt-i18n-micro/commit/d10d997d0063c526267a82499a96036d4fe51665))

### Tests

- simplify translation helper tests by removing locale parameter ([`766ad53`](https://github.com/s00d/nuxt-i18n-micro/commit/766ad53c618f8ef22424e360c765f5666d85b4f9))

## 1.0.11

_2025-01-09_ · [`8523707d`](https://github.com/s00d/nuxt-i18n-micro/commit/8523707d04a9bb16fb066eba6f52070540dba256)

### Features

- replace object caches with Map for improved performance ([`8523707`](https://github.com/s00d/nuxt-i18n-micro/commit/8523707d04a9bb16fb066eba6f52070540dba256))

### Refactors

- **translation:** remove unused serverTranslationInit cache ([`33fec8e`](https://github.com/s00d/nuxt-i18n-micro/commit/33fec8e845efe4b0149df297fbd6a9aba42d9f37))

## 1.0.10

_2024-12-06_ · [`9fdd8b74`](https://github.com/s00d/nuxt-i18n-micro/commit/9fdd8b74d9e6271e69c1e099354489dec09d56ec)

### Fixes

- **core, test-utils:** add documentation and improve translation functions ([`9fdd8b7`](https://github.com/s00d/nuxt-i18n-micro/commit/9fdd8b74d9e6271e69c1e099354489dec09d56ec))

### Other

- fix ([`a923893`](https://github.com/s00d/nuxt-i18n-micro/commit/a9238932ca61cc70c780a24fcd12bd554a2d73b8))

## 1.0.9

_2024-12-05_ · [`c2cba1fc`](https://github.com/s00d/nuxt-i18n-micro/commit/c2cba1fc3d463f39156ed57ff645d5c3fe647b0d)

### Other

- fix ([`c2cba1f`](https://github.com/s00d/nuxt-i18n-micro/commit/c2cba1fc3d463f39156ed57ff645d5c3fe647b0d))

## 1.0.8

_2024-12-05_ · [`92dc6bae`](https://github.com/s00d/nuxt-i18n-micro/commit/92dc6baeb48f62bc73355a14ccd142a4276d2c0a)

### Tests

- **tests:** add unit tests for i18n utility functions ([`37d7dd8`](https://github.com/s00d/nuxt-i18n-micro/commit/37d7dd87d06c8712352a71a192ef308e6f93dbbb))

### Chore

- update package versions and remove postinstall scripts ([`6aecd23`](https://github.com/s00d/nuxt-i18n-micro/commit/6aecd23b6196a9621a5b28f35a08642f7716cf87))

### Other

- fix ([`92dc6ba`](https://github.com/s00d/nuxt-i18n-micro/commit/92dc6baeb48f62bc73355a14ccd142a4276d2c0a))

## 1.0.7

_2024-12-04_ · [`5f195c38`](https://github.com/s00d/nuxt-i18n-micro/commit/5f195c388d8eee3f54ce8cba12dd9688689566d9)

### Features

- **test-utils:** add utility functions for i18n testing ([`265bd98`](https://github.com/s00d/nuxt-i18n-micro/commit/265bd98f3e1c88da26339e8961b644239aa9499e))

### Other

- fix ([`5f195c3`](https://github.com/s00d/nuxt-i18n-micro/commit/5f195c388d8eee3f54ce8cba12dd9688689566d9))

## 1.0.6

_2024-12-04_ · [`e0550cb4`](https://github.com/s00d/nuxt-i18n-micro/commit/e0550cb4cadbee5778c6accb2282034e8c57cb31)

### Other

- fix ([`e0550cb`](https://github.com/s00d/nuxt-i18n-micro/commit/e0550cb4cadbee5778c6accb2282034e8c57cb31))

## 1.0.5

_2024-12-04_ · [`8161ce5c`](https://github.com/s00d/nuxt-i18n-micro/commit/8161ce5c790d36f727c1f613ceddcb0a823659fe)

### Other

- fix ([`8161ce5`](https://github.com/s00d/nuxt-i18n-micro/commit/8161ce5c790d36f727c1f613ceddcb0a823659fe))

## 1.0.4

_2024-12-04_ · [`0ee5afe8`](https://github.com/s00d/nuxt-i18n-micro/commit/0ee5afe801a3591c8fcaf15f97663dabdde3f64e)

### Other

- fix ([`0ee5afe`](https://github.com/s00d/nuxt-i18n-micro/commit/0ee5afe801a3591c8fcaf15f97663dabdde3f64e))

## 1.0.3

_2024-12-04_ · [`bbc29f0a`](https://github.com/s00d/nuxt-i18n-micro/commit/bbc29f0a9350e0b966317b15a0d45c0462e55b79)

### Chore

- **release:** v1.37.5 ([`9330a24`](https://github.com/s00d/nuxt-i18n-micro/commit/9330a24df32bd3cd24ed3ff9cca005ec447efb0f))

### Other

- fix ([`bbc29f0`](https://github.com/s00d/nuxt-i18n-micro/commit/bbc29f0a9350e0b966317b15a0d45c0462e55b79))

## 1.0.1

_2024-12-04_ · [`13da12a3`](https://github.com/s00d/nuxt-i18n-micro/commit/13da12a3ae3efdda0dcd061a69fcf5396b54e989)

### Other

- fix ([`13da12a`](https://github.com/s00d/nuxt-i18n-micro/commit/13da12a3ae3efdda0dcd061a69fcf5396b54e989))

## 1.0.0

_2024-12-04_ · [`3ffc1dc4`](https://github.com/s00d/nuxt-i18n-micro/commit/3ffc1dc4a4f09532cb0c3e90d9bb8ca50e2f5d35)

### Features

- integrate core translation functionality and improve imports ([`3ffc1dc`](https://github.com/s00d/nuxt-i18n-micro/commit/3ffc1dc4a4f09532cb0c3e90d9bb8ca50e2f5d35))
