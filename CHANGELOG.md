# Changelog


## v3.8.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v3.7.0...v3.8.0)

### 🚀 Enhancements

- **locales:** Implement build-time pre-merging of translation files ([a29ac6bb](https://github.com/s00d/nuxt-i18n-micro/commit/a29ac6bb))
- **playground:** Update option value in node-i18n-demo.vue ([966e29fb](https://github.com/s00d/nuxt-i18n-micro/commit/966e29fb))
- **test-utils:** Add routeName parameter to loadTranslations function ([5f0a66af](https://github.com/s00d/nuxt-i18n-micro/commit/5f0a66af))

### 🩹 Fixes

- **i18n:** Update page parameter handling in loadTranslationsFromServer ([7052f54d](https://github.com/s00d/nuxt-i18n-micro/commit/7052f54d))
- **useI18n:** Remove unused `$mergeGlobalTranslations` property ([6da3bd25](https://github.com/s00d/nuxt-i18n-micro/commit/6da3bd25))
- **tests:** Update comment for manual translation loading guidance ([893bba48](https://github.com/s00d/nuxt-i18n-micro/commit/893bba48))
- **docs:** Update storybook output directory path in documentation ([d1339928](https://github.com/s00d/nuxt-i18n-micro/commit/d1339928))
- **path-strategy:** Update return value in getPluginRouteName method ([31af304f](https://github.com/s00d/nuxt-i18n-micro/commit/31af304f))
- **i18n:** Update default currentRoute to 'index' ([90e98af9](https://github.com/s00d/nuxt-i18n-micro/commit/90e98af9))
- **i18n:** Update default route signal to 'index' ([72707dc0](https://github.com/s00d/nuxt-i18n-micro/commit/72707dc0))
- **i18n:** Update default route signal to 'index' ([f6c07b74](https://github.com/s00d/nuxt-i18n-micro/commit/f6c07b74))

### 💅 Refactors

- **plugins:** Simplify cache key generation and cleanup logic ([6eb772a6](https://github.com/s00d/nuxt-i18n-micro/commit/6eb772a6))
- **server-loader:** Simplify translation loading logic ([4e7717d2](https://github.com/s00d/nuxt-i18n-micro/commit/4e7717d2))
- **translation-server-middleware:** Streamline translation storage handling ([c48df9e9](https://github.com/s00d/nuxt-i18n-micro/commit/c48df9e9))
- **plugins:** Rename $mergeGlobalTranslations to $mergeTranslations ([2ffddf80](https://github.com/s00d/nuxt-i18n-micro/commit/2ffddf80))
- **internals:** Remove unused `rootDirs` property from I18nPrivateConfig. ([14a76a9c](https://github.com/s00d/nuxt-i18n-micro/commit/14a76a9c))
- **translations:** Rename 'general' to 'root' for clarity ([5fe4860a](https://github.com/s00d/nuxt-i18n-micro/commit/5fe4860a))
- **translation:** Simplify translation cache management logic ([1a635278](https://github.com/s00d/nuxt-i18n-micro/commit/1a635278))
- **bridge:** Streamline translation cache retrieval and structure ([1b4550d4](https://github.com/s00d/nuxt-i18n-micro/commit/1b4550d4))
- **loader:** Rename global translations to root translations ([ed1e9538](https://github.com/s00d/nuxt-i18n-micro/commit/ed1e9538))
- **preact:** Update default current route from 'general' to 'index' ([f87fb97d](https://github.com/s00d/nuxt-i18n-micro/commit/f87fb97d))
- **types:** Remove unused `rootDirs` property from `ModulePrivateOptionsExtend` ([25139fdd](https://github.com/s00d/nuxt-i18n-micro/commit/25139fdd))
- **composer:** Update current route and simplify cache methods ([c304c6d8](https://github.com/s00d/nuxt-i18n-micro/commit/c304c6d8))

### 📖 Documentation

- **events:** Clarify terminology in `i18n:register` event documentation ([9eff7c98](https://github.com/s00d/nuxt-i18n-micro/commit/9eff7c98))
- **i18n-cache-api:** Update cache API documentation for clarity ([793b863c](https://github.com/s00d/nuxt-i18n-micro/commit/793b863c))
- **cli:** Update description for `check-duplicates` command ([3ac8931b](https://github.com/s00d/nuxt-i18n-micro/commit/3ac8931b))
- **faq:** Update translation fallback solution details ([1c7f3dc0](https://github.com/s00d/nuxt-i18n-micro/commit/1c7f3dc0))
- **firebase:** Update paths in Firebase guide for localization files ([38f85ba7](https://github.com/s00d/nuxt-i18n-micro/commit/38f85ba7))
- **guide:** Update folder structure documentation for clarity ([1f5779ec](https://github.com/s00d/nuxt-i18n-micro/commit/1f5779ec))
- **getting-started:** Clarify translation file descriptions ([111b7863](https://github.com/s00d/nuxt-i18n-micro/commit/111b7863))
- **migration:** Update note for global translations to root-level ([523e5462](https://github.com/s00d/nuxt-i18n-micro/commit/523e5462))
- **guide:** Update terminology from 'global files' to 'root-level files' ([cb68266e](https://github.com/s00d/nuxt-i18n-micro/commit/cb68266e))
- **performance:** Update translation caching details and optimize lookup ([62e84914](https://github.com/s00d/nuxt-i18n-micro/commit/62e84914))
- **performance-results:** Update performance metrics for i18n-micro ([99f50a64](https://github.com/s00d/nuxt-i18n-micro/commit/99f50a64))
- **guide:** Update server-side translations explanation ([1b4cd146](https://github.com/s00d/nuxt-i18n-micro/commit/1b4cd146))
- **guide:** Update terminology for translation file sections ([c95eaa6a](https://github.com/s00d/nuxt-i18n-micro/commit/c95eaa6a))
- **guide:** Update v3 upgrade notes for experimental options ([728b3e9e](https://github.com/s00d/nuxt-i18n-micro/commit/728b3e9e))
- **news:** Update news for v3.0.0 release with feature optimizations ([ccb47c8c](https://github.com/s00d/nuxt-i18n-micro/commit/ccb47c8c))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v3.7.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v3.6.0...v3.7.0)

### 🚀 Enhancements

- **meta:** Enhance base URL resolution for SEO meta tags ([2d95c559](https://github.com/s00d/nuxt-i18n-micro/commit/2d95c559))
- **module:** Add metaTrustForwarded options for improved security ([83e86792](https://github.com/s00d/nuxt-i18n-micro/commit/83e86792))

### 🩹 Fixes

- **nuxt.config:** Remove previousPageFallback option ([f3870a78](https://github.com/s00d/nuxt-i18n-micro/commit/f3870a78))
- **transition:** Set default mode for page transition ([aa771142](https://github.com/s00d/nuxt-i18n-micro/commit/aa771142))

### 💅 Refactors

- **core:** Remove previous page fallback functionality ([024a6d89](https://github.com/s00d/nuxt-i18n-micro/commit/024a6d89))
- **types:** Improve type definitions and documentation for i18n ([cd0f9a4c](https://github.com/s00d/nuxt-i18n-micro/commit/cd0f9a4c))
- **plugins:** Improve translation cache management during page transitions ([611db2ad](https://github.com/s00d/nuxt-i18n-micro/commit/611db2ad))

### 📖 Documentation

- **getting-started:** Clarify `metaBaseUrl` behavior and types ([410b6acb](https://github.com/s00d/nuxt-i18n-micro/commit/410b6acb))
- **seo:** Add dynamic `metaBaseUrl` support for multi-domain deployments ([2538bf73](https://github.com/s00d/nuxt-i18n-micro/commit/2538bf73))
- **performance-results:** Update performance metrics for i18n projects ([7aeb438a](https://github.com/s00d/nuxt-i18n-micro/commit/7aeb438a))

### 🏡 Chore

- **github:** Add FUNDING.yml for sponsorship options ([f6d2b868](https://github.com/s00d/nuxt-i18n-micro/commit/f6d2b868))
- **playwright:** Reduce number of workers for local testing ([1f98f452](https://github.com/s00d/nuxt-i18n-micro/commit/1f98f452))

### ✅ Tests

- Add SEO tests for dynamic `metaBaseUrl` handling ([172ab2a0](https://github.com/s00d/nuxt-i18n-micro/commit/172ab2a0))
- **transitions:** Add tests for translation persistence during navigation ([2d7d3a06](https://github.com/s00d/nuxt-i18n-micro/commit/2d7d3a06))
- **seo-auto:** Import Page type from correct package ([26ca6654](https://github.com/s00d/nuxt-i18n-micro/commit/26ca6654))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v3.6.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v3.4.1...v3.6.0)

### 🚀 Enhancements

- **docs:** Configure Vite build options and add DNS prefetch ([f7a8ff43](https://github.com/s00d/nuxt-i18n-micro/commit/f7a8ff43))
- **redirect:** Improve redirect handling during prerendering ([95cdca99](https://github.com/s00d/nuxt-i18n-micro/commit/95cdca99))

### 🩹 Fixes

- **deps:** Update `vitepress-plugin-folder-tree` to version `1.1.3` ([40919635](https://github.com/s00d/nuxt-i18n-micro/commit/40919635))
- **deps:** Update `vitepress-plugin-folder-tree` to version `1.2.1` ([58417f74](https://github.com/s00d/nuxt-i18n-micro/commit/58417f74))
- **tests:** Increase timeouts and improve locale switching in tests ([6e03afb3](https://github.com/s00d/nuxt-i18n-micro/commit/6e03afb3))
- **module:** Resolve ESM loader issue on Windows for strategy paths ([4779e045](https://github.com/s00d/nuxt-i18n-micro/commit/4779e045))
- **module:** Simplify resolvedStrategyPath assignment ([7ac49fe9](https://github.com/s00d/nuxt-i18n-micro/commit/7ac49fe9))

### 📖 Documentation

- **api:** Update warning in methods documentation for clarity ([d132796f](https://github.com/s00d/nuxt-i18n-micro/commit/d132796f))
- **migration:** Add folder structure examples to use tree syntax ([88a1d46b](https://github.com/s00d/nuxt-i18n-micro/commit/88a1d46b))
- **migration:** Update migration guide and add v2 to v3 upgrade instructions ([0f10891a](https://github.com/s00d/nuxt-i18n-micro/commit/0f10891a))
- **config:** Update Chart.js root path configuration ([5d81f9ee](https://github.com/s00d/nuxt-i18n-micro/commit/5d81f9ee))

### 🏡 Chore

- **changelog:** Update CHANGELOG.md for v3.4.1 release ([b93e2c1a](https://github.com/s00d/nuxt-i18n-micro/commit/b93e2c1a))
- **release:** V3.5.0 ([b5208573](https://github.com/s00d/nuxt-i18n-micro/commit/b5208573))

### ✅ Tests

- **generate-prefix:** Add regression test for nuxi generate with prefix strategy ([c2de8bdf](https://github.com/s00d/nuxt-i18n-micro/commit/c2de8bdf))
- **redirect-prerender:** Add tests for prefix strategy redirection ([3cb6129d](https://github.com/s00d/nuxt-i18n-micro/commit/3cb6129d))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v3.5.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v3.4.1...v3.5.0)

### 🚀 Enhancements

- **docs:** Configure Vite build options and add DNS prefetch ([f7a8ff43](https://github.com/s00d/nuxt-i18n-micro/commit/f7a8ff43))
- **redirect:** Improve redirect handling during prerendering ([95cdca99](https://github.com/s00d/nuxt-i18n-micro/commit/95cdca99))

### 🩹 Fixes

- **deps:** Update `vitepress-plugin-folder-tree` to version `1.1.3` ([40919635](https://github.com/s00d/nuxt-i18n-micro/commit/40919635))
- **deps:** Update `vitepress-plugin-folder-tree` to version `1.2.1` ([58417f74](https://github.com/s00d/nuxt-i18n-micro/commit/58417f74))
- **tests:** Increase timeouts and improve locale switching in tests ([6e03afb3](https://github.com/s00d/nuxt-i18n-micro/commit/6e03afb3))

### 📖 Documentation

- **api:** Update warning in methods documentation for clarity ([d132796f](https://github.com/s00d/nuxt-i18n-micro/commit/d132796f))
- **migration:** Add folder structure examples to use tree syntax ([88a1d46b](https://github.com/s00d/nuxt-i18n-micro/commit/88a1d46b))
- **migration:** Update migration guide and add v2 to v3 upgrade instructions ([0f10891a](https://github.com/s00d/nuxt-i18n-micro/commit/0f10891a))
- **config:** Update Chart.js root path configuration ([5d81f9ee](https://github.com/s00d/nuxt-i18n-micro/commit/5d81f9ee))

### 🏡 Chore

- **changelog:** Update CHANGELOG.md for v3.4.1 release ([b93e2c1a](https://github.com/s00d/nuxt-i18n-micro/commit/b93e2c1a))

### ✅ Tests

- **generate-prefix:** Add regression test for nuxi generate with prefix strategy ([c2de8bdf](https://github.com/s00d/nuxt-i18n-micro/commit/c2de8bdf))
- **redirect-prerender:** Add tests for prefix strategy redirection ([3cb6129d](https://github.com/s00d/nuxt-i18n-micro/commit/3cb6129d))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v3.4.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v3.4.0...v3.4.1)

### 🚀 Enhancements

- **redirect:** Enhance locale handling and redirect logic ([46776b8](https://github.com/s00d/nuxt-i18n-micro/commit/46776b8))
- **module:** Add warning for missing localeCookie with redirects enabled ([096a4ea](https://github.com/s00d/nuxt-i18n-micro/commit/096a4ea))
- **types:** Add optional `redirects` property to ModuleOptions interface ([67b84a3](https://github.com/s00d/nuxt-i18n-micro/commit/67b84a3))
- **route-strategy:** Remove `includeDefaultLocaleRoute` option ([6f38bbd](https://github.com/s00d/nuxt-i18n-micro/commit/6f38bbd))
- **types:** Add cacheMaxSize and cacheTtl options to configuration ([318ccf8](https://github.com/s00d/nuxt-i18n-micro/commit/318ccf8))
- **cache:** Add LRU cache implementation with sliding TTL support ([9e66665](https://github.com/s00d/nuxt-i18n-micro/commit/9e66665))
- **plugins:** Configure storage cache and optimize async loading ([9f41f44](https://github.com/s00d/nuxt-i18n-micro/commit/9f41f44))
- **module:** Add cache settings and improve locale validation error ([cf3cf72](https://github.com/s00d/nuxt-i18n-micro/commit/cf3cf72))

### 🩹 Fixes

- Update comments to English for clarity ([8dd57b3](https://github.com/s00d/nuxt-i18n-micro/commit/8dd57b3))
- **module:** Enable watcher only in development mode ([456138b](https://github.com/s00d/nuxt-i18n-micro/commit/456138b))
- **route-generator:** Handle errors in file creation process ([4e13975](https://github.com/s00d/nuxt-i18n-micro/commit/4e13975))
- **core:** Update version to 1.1.3 in package.json ([d24e49c](https://github.com/s00d/nuxt-i18n-micro/commit/d24e49c))
- **charts:** Update data values for latency and traffic metrics ([61e35e2](https://github.com/s00d/nuxt-i18n-micro/commit/61e35e2))

### 💅 Refactors

- **resolver:** Simplify parameter substitution in path resolution ([c47c564](https://github.com/s00d/nuxt-i18n-micro/commit/c47c564))
- **storage:** Delegate cache control to CacheControl class ([b8cf552](https://github.com/s00d/nuxt-i18n-micro/commit/b8cf552))
- **server-loader:** Replace global cache with CacheControl singleton ([bf964b1](https://github.com/s00d/nuxt-i18n-micro/commit/bf964b1))

### 📖 Documentation

- **strategy:** Clarify `localeCookie` requirement for redirects ([9f2375a](https://github.com/s00d/nuxt-i18n-micro/commit/9f2375a))
- **getting-started:** Clarify localeCookie requirement for prefix strategies ([e7e2cc7](https://github.com/s00d/nuxt-i18n-micro/commit/e7e2cc7))
- **api/methods:** Fix formatting of version introduced for `$switchRoute` ([3fe986d](https://github.com/s00d/nuxt-i18n-micro/commit/3fe986d))
- **guide:** Update cookie name for user locale detection ([b6e68dc](https://github.com/s00d/nuxt-i18n-micro/commit/b6e68dc))
- **guide/firebase:** Update version number for Content-Type headers notice ([f76157d](https://github.com/s00d/nuxt-i18n-micro/commit/f76157d))
- **getting-started:** Document deprecation of includeDefaultLocaleRoute option ([4fe148b](https://github.com/s00d/nuxt-i18n-micro/commit/4fe148b))
- **migration:** Update migration guide for v3.0.0 changes ([e330e99](https://github.com/s00d/nuxt-i18n-micro/commit/e330e99))
- **strategy:** Update `autoDetectLanguage` behavior description ([6bcd7ae](https://github.com/s00d/nuxt-i18n-micro/commit/6bcd7ae))
- Update ecosystem packages section in index.md ([ddec61c](https://github.com/s00d/nuxt-i18n-micro/commit/ddec61c))
- **i18n-cache-api:** Update documentation for built-in cache in v3.0.0 ([9c3f6f4](https://github.com/s00d/nuxt-i18n-micro/commit/9c3f6f4))
- **i18n-cache-api:** Update translation cache architecture documentation ([21b83eb](https://github.com/s00d/nuxt-i18n-micro/commit/21b83eb))
- **api/methods:** Add new translation and cache utility methods ([13625d0](https://github.com/s00d/nuxt-i18n-micro/commit/13625d0))
- **custom-auto-detect:** Update guide to reflect v3 changes ([79717d5](https://github.com/s00d/nuxt-i18n-micro/commit/79717d5))
- **migration:** Update migration guide for Nuxt I18n Micro v3.0.0 ([c8df634](https://github.com/s00d/nuxt-i18n-micro/commit/c8df634))
- **strategy:** Update routing strategies section for clarity and detail ([9e4620c](https://github.com/s00d/nuxt-i18n-micro/commit/9e4620c))
- **getting-started:** Update caching mechanism description and structure ([593b16d](https://github.com/s00d/nuxt-i18n-micro/commit/593b16d))
- **api:** Update return type of `$t` method and add usage warnings ([4539404](https://github.com/s00d/nuxt-i18n-micro/commit/4539404))
- **guide:** Enhance getting started guide with regex matcher and caching options ([7c07ae5](https://github.com/s00d/nuxt-i18n-micro/commit/7c07ae5))
- **performance-results:** Update performance metrics and test results ([fee022f](https://github.com/s00d/nuxt-i18n-micro/commit/fee022f))
- **guide:** Clarify usage of `$t` and `$ts` methods in i18n ([1d56f00](https://github.com/s00d/nuxt-i18n-micro/commit/1d56f00))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v3.4.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v3.3.0...v3.4.0)

### 🚀 Enhancements

- **runtime:** Add context signal for reactive tracking in translations ([ceff8c7](https://github.com/s00d/nuxt-i18n-micro/commit/ceff8c7))

### 🩹 Fixes

- **deps:** Update vitepress-plugin-chartjs to version 1.1.2 ([561ea6c](https://github.com/s00d/nuxt-i18n-micro/commit/561ea6c))
- **middleware:** Update TypeScript ignore comment for property mismatch ([8dfa03b](https://github.com/s00d/nuxt-i18n-micro/commit/8dfa03b))

### 💅 Refactors

- **astrol:** Remove unused i18n and content type definitions ([fcfd22a](https://github.com/s00d/nuxt-i18n-micro/commit/fcfd22a))

### 🏡 Chore

- **pnpm:** Remove `@nuxt/eslint-config` and add `@biomejs/biome` ([b530688](https://github.com/s00d/nuxt-i18n-micro/commit/b530688))
- **ci:** Install Vite globally in CI workflow ([87002ef](https://github.com/s00d/nuxt-i18n-micro/commit/87002ef))
- **.gitignore:** Add pattern to ignore Astro build files ([568fae5](https://github.com/s00d/nuxt-i18n-micro/commit/568fae5))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v3.3.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v3.2.4...v3.3.0)

### 🚀 Enhancements

- **path-strategy:** Enhance route name resolution for localization ([7708c00](https://github.com/s00d/nuxt-i18n-micro/commit/7708c00))
- **route-strategy:** Increment version to 1.1.1 and add custom path redirects ([f2b5bf5](https://github.com/s00d/nuxt-i18n-micro/commit/f2b5bf5))
- **redirect:** Add universal redirect plugin for i18n routes ([6b1e1b8](https://github.com/s00d/nuxt-i18n-micro/commit/6b1e1b8))
- **i18n:** Optimize JSON response handling for translations ([b4ecfd7](https://github.com/s00d/nuxt-i18n-micro/commit/b4ecfd7))
- **server-cache:** Implement process-level caching for translations ([e8b6452](https://github.com/s00d/nuxt-i18n-micro/commit/e8b6452))
- **module:** Add support for default locale route inclusion ([c3cf288](https://github.com/s00d/nuxt-i18n-micro/commit/c3cf288))
- **docs:** Integrate Mermaid plugin for enhanced diagram support ([2b1b0f4](https://github.com/s00d/nuxt-i18n-micro/commit/2b1b0f4))
- **performance:** Add Chart.js integration for performance metrics ([cfa8a61](https://github.com/s00d/nuxt-i18n-micro/commit/cfa8a61))
- **docs:** Add Chart.js integration and performance test results link ([562a351](https://github.com/s00d/nuxt-i18n-micro/commit/562a351))
- **performance:** Enhance performance metrics with code and translation sizes ([219b401](https://github.com/s00d/nuxt-i18n-micro/commit/219b401))
- **tests:** Add redirect snapshots for about and section routes ([4d35238](https://github.com/s00d/nuxt-i18n-micro/commit/4d35238))

### 🩹 Fixes

- **test/fixtures:** Update nuxt.config.ts to handle SSR type errors ([406dd20](https://github.com/s00d/nuxt-i18n-micro/commit/406dd20))
- **test/fixtures:** Suppress TypeScript error for SSR in config ([7e98e12](https://github.com/s00d/nuxt-i18n-micro/commit/7e98e12))
- **path-strategy:** Update version to 1.1.1 in package.json ([a563141](https://github.com/s00d/nuxt-i18n-micro/commit/a563141))

### 💅 Refactors

- **core:** Remove `RouteService` and related imports ([db7b953](https://github.com/s00d/nuxt-i18n-micro/commit/db7b953))
- **plugins:** Simplify locale and translation handling logic ([8ecb75c](https://github.com/s00d/nuxt-i18n-micro/commit/8ecb75c))
- **plugins:** Remove deprecated client redirect plugin ([ac85b16](https://github.com/s00d/nuxt-i18n-micro/commit/ac85b16))
- **i18n:** Simplify middleware by removing redirect logic ([d85e801](https://github.com/s00d/nuxt-i18n-micro/commit/d85e801))
- **storage:** Rename load method to getFromCache and improve caching ([348c23f](https://github.com/s00d/nuxt-i18n-micro/commit/348c23f))
- **docs:** Simplify enhanceApp function in theme index.js ([b092df7](https://github.com/s00d/nuxt-i18n-micro/commit/b092df7))
- **path-strategy:** Rename parameter in getClientRedirect method ([69b2f54](https://github.com/s00d/nuxt-i18n-micro/commit/69b2f54))

### 📖 Documentation

- **readme:** Add star history section with chart link ([90b9652](https://github.com/s00d/nuxt-i18n-micro/commit/90b9652))
- **events:** Add sequence diagram for i18n:register event flow ([8cabe4b](https://github.com/s00d/nuxt-i18n-micro/commit/8cabe4b))
- **i18n-cache-api:** Enhance documentation with cache architecture overview ([a4dc843](https://github.com/s00d/nuxt-i18n-micro/commit/a4dc843))
- **api:** Add API overview and method details to documentation ([d9b16fe](https://github.com/s00d/nuxt-i18n-micro/commit/d9b16fe))
- **useI18n:** Add methods overview diagram to documentation ([bf0cd9d](https://github.com/s00d/nuxt-i18n-micro/commit/bf0cd9d))
- **cli:** Add CLI workflow overview and workflow steps to documentation ([75f970b](https://github.com/s00d/nuxt-i18n-micro/commit/75f970b))
- Add mermaid diagrams for improved clarity in various guides ([336d2f6](https://github.com/s00d/nuxt-i18n-micro/commit/336d2f6))
- Add mermaid diagrams for improved clarity in various guides ([c984958](https://github.com/s00d/nuxt-i18n-micro/commit/c984958))
- **performance:** Update performance comparison charts in guide bundle size, and CPU usage. ([3ca9fef](https://github.com/s00d/nuxt-i18n-micro/commit/3ca9fef))
- **performance-results:** Update performance metrics and comparisons ([932af2a](https://github.com/s00d/nuxt-i18n-micro/commit/932af2a))
- **performance:** Update performance comparison metrics and details ([18a5b27](https://github.com/s00d/nuxt-i18n-micro/commit/18a5b27))
- **performance-results:** Update performance metrics and comparisons ([6a07e86](https://github.com/s00d/nuxt-i18n-micro/commit/6a07e86))
- **readme:** Update performance metrics and comparison for i18n-micro ([3b29935](https://github.com/s00d/nuxt-i18n-micro/commit/3b29935))

### 🏡 Chore

- **.gitignore:** Add `.perf-output` directory to ignored files ([384cbcc](https://github.com/s00d/nuxt-i18n-micro/commit/384cbcc))

### ✅ Tests

- Improve page load assertions in content tests ([eb9bed4](https://github.com/s00d/nuxt-i18n-micro/commit/eb9bed4))
- **layout-switch:** Add tests for layout switching and cookie redirects ([4865d08](https://github.com/s00d/nuxt-i18n-micro/commit/4865d08))
- **redirect:** Remove unused i18n configuration in redirect tests ([f691bcf](https://github.com/s00d/nuxt-i18n-micro/commit/f691bcf))
- **redirect:** Remove unused i18n configuration in redirect tests ([0873b6c](https://github.com/s00d/nuxt-i18n-micro/commit/0873b6c))
- **serverless-cache:** Add type assertion for translations fetching ([11563d8](https://github.com/s00d/nuxt-i18n-micro/commit/11563d8))
- **performance:** Add more info ([94c5eef](https://github.com/s00d/nuxt-i18n-micro/commit/94c5eef))
- **performance:** Add more info ([2351a8e](https://github.com/s00d/nuxt-i18n-micro/commit/2351a8e))
- **path-strategy:** Add tests for getClientRedirect functionality ([c2b512f](https://github.com/s00d/nuxt-i18n-micro/commit/c2b512f))
- **path-strategy:** Remove unused RouterAdapter import from tests ([9a69f29](https://github.com/s00d/nuxt-i18n-micro/commit/9a69f29))
- **path-strategy:** Remove unused imports and clean up whitespace ([9fa1fa8](https://github.com/s00d/nuxt-i18n-micro/commit/9fa1fa8))
- **path-strategy:** Update test for PrefixExceptDefaultPathStrategy ([88e8359](https://github.com/s00d/nuxt-i18n-micro/commit/88e8359))
- **tests:** Remove unnecessary blank line in coverage test file ([b359c9a](https://github.com/s00d/nuxt-i18n-micro/commit/b359c9a))
- **tests:** Remove unnecessary whitespace in test-utils-coverage file ([e8adb62](https://github.com/s00d/nuxt-i18n-micro/commit/e8adb62))
- **strategy-edge-cases:** Clean up test cases for applyBaseUrl and factory ([30b24ae](https://github.com/s00d/nuxt-i18n-micro/commit/30b24ae))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v3.2.4

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v3.2.3...v3.2.4)

### 💅 Refactors

- **module:** Simplify strategy path resolution logic ([3d77bf2](https://github.com/s00d/nuxt-i18n-micro/commit/3d77bf2))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v3.2.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v3.2.2...v3.2.3)

### 🩹 Fixes

- **module:** Update path strategy resolution for pnpm compatibility ([34728d6](https://github.com/s00d/nuxt-i18n-micro/commit/34728d6))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v3.2.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v3.2.1...v3.2.2)

### 🩹 Fixes

- **module:** Add alias resolution for pnpm compatibility ([edcc0cc](https://github.com/s00d/nuxt-i18n-micro/commit/edcc0cc))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v3.2.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v3.2.0...v3.2.1)

### 🏡 Chore

- **path-strategy:** Bump version to 1.0.3 in package.json ([c97eb36](https://github.com/s00d/nuxt-i18n-micro/commit/c97eb36))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v3.2.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v3.1.0...v3.2.0)

### 🚀 Enhancements

- **module:** Update path-strategy to use direct dist paths ([9eca73d](https://github.com/s00d/nuxt-i18n-micro/commit/9eca73d))

### 🏡 Chore

- **path-strategy:** Bump version to 1.0.2 and update package entries ([38b51d6](https://github.com/s00d/nuxt-i18n-micro/commit/38b51d6))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v3.1.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v3.0.0...v3.1.0)

### 🚀 Enhancements

- **module:** Resolve strategy file paths using dynamic require ([ca92093](https://github.com/s00d/nuxt-i18n-micro/commit/ca92093))

### 🏡 Chore

- **route-strategy:** Set publish access to public in package.json ([d4741f0](https://github.com/s00d/nuxt-i18n-micro/commit/d4741f0))
- **route-strategy:** Remove public access configuration from package.json ([00cfa21](https://github.com/s00d/nuxt-i18n-micro/commit/00cfa21))
- **path-strategy:** Bump version to 1.0.1 in package.json ([0aa0c7d](https://github.com/s00d/nuxt-i18n-micro/commit/0aa0c7d))
- **package:** Add lightweight release script for streamlined publishing ([43b594a](https://github.com/s00d/nuxt-i18n-micro/commit/43b594a))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v3.0.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.20.1...v3.0.0)

### 🚀 Enhancements

- **page:** Update link to use locale-aware routing ([a5e457c](https://github.com/s00d/nuxt-i18n-micro/commit/a5e457c))
- **locale-redirect:** Enhance locale preference handling with cookies ([4cb3059](https://github.com/s00d/nuxt-i18n-micro/commit/4cb3059))
- **auto-detect:** Add useState for programmatic locale setting ([21417fb](https://github.com/s00d/nuxt-i18n-micro/commit/21417fb))
- **redirect:** Add route existence check and support for prefix strategy ([17c60fc](https://github.com/s00d/nuxt-i18n-micro/commit/17c60fc))
- **redirect:** Add locale-based redirect middleware ([458614d](https://github.com/s00d/nuxt-i18n-micro/commit/458614d))
- **watcher:** Improve cache invalidation logic for translation files ([38170ae](https://github.com/s00d/nuxt-i18n-micro/commit/38170ae))
- **module:** Add i18nConfig to PublicRuntimeConfig interface ([c40d381](https://github.com/s00d/nuxt-i18n-micro/commit/c40d381))
- **route-generator:** Add initial route generator module ([b963b10](https://github.com/s00d/nuxt-i18n-micro/commit/b963b10))
- **route-generator:** Add RouteGeneratorOptions and extractLocalizedPaths ([d262e98](https://github.com/s00d/nuxt-i18n-micro/commit/d262e98))
- **route-generator:** Add core functionality for route management ([78964ec](https://github.com/s00d/nuxt-i18n-micro/commit/78964ec))
- **route-generator:** Add abstract base strategy for route processing ([a582f4c](https://github.com/s00d/nuxt-i18n-micro/commit/a582f4c))
- **route-generator:** Add route strategy factory function ([718b424](https://github.com/s00d/nuxt-i18n-micro/commit/718b424))
- **route-generator:** Add NoPrefixStrategy for route generation ([4c5a2f1](https://github.com/s00d/nuxt-i18n-micro/commit/4c5a2f1))
- **route-generator:** Implement prefix strategy for route generation ([620c81f](https://github.com/s00d/nuxt-i18n-micro/commit/620c81f))
- **route-generator:** Implement prefix and default localization strategy ([c0d4484](https://github.com/s00d/nuxt-i18n-micro/commit/c0d4484))
- **route-generator:** Add PrefixExceptDefaultStrategy for route handling ([fbf9ec3](https://github.com/s00d/nuxt-i18n-micro/commit/fbf9ec3))
- **route-generator:** Add RouteStrategy interface for page processing ([5190bee](https://github.com/s00d/nuxt-i18n-micro/commit/5190bee))
- **utils:** Add utility functions for route generation and localization ([f2e290c](https://github.com/s00d/nuxt-i18n-micro/commit/f2e290c))
- **route-generator:** Add utility functions for path and route handling ([5217553](https://github.com/s00d/nuxt-i18n-micro/commit/5217553))
- **utils:** Add route path normalization and encoding utilities ([78167c1](https://github.com/s00d/nuxt-i18n-micro/commit/78167c1))
- **types:** Update version to 1.0.18 and add localizedRouteNamePrefix ([b57fa3f](https://github.com/s00d/nuxt-i18n-micro/commit/b57fa3f))
- **useLocaleHead:** Add support for customizable localized route prefix ([eb4ac19](https://github.com/s00d/nuxt-i18n-micro/commit/eb4ac19))
- **auto-detect:** Support customizable localized route name prefix ([403daa0](https://github.com/s00d/nuxt-i18n-micro/commit/403daa0))
- **redirect:** Implement user preferred locale resolution logic ([b37a8d8](https://github.com/s00d/nuxt-i18n-micro/commit/b37a8d8))
- **route-utils:** Allow customizable prefix for localized route name ([926818a](https://github.com/s00d/nuxt-i18n-micro/commit/926818a))
- **module:** Add localized route name prefix option ([bec759f](https://github.com/s00d/nuxt-i18n-micro/commit/bec759f))
- **route-generator:** Add helper for building localized route paths ([d938f9d](https://github.com/s00d/nuxt-i18n-micro/commit/d938f9d))
- **route-generator:** Add support for child routes in alias creation ([beba377](https://github.com/s00d/nuxt-i18n-micro/commit/beba377))
- **path-strategy:** Add initial implementation for path strategy module ([650c1f1](https://github.com/s00d/nuxt-i18n-micro/commit/650c1f1))
- **internals:** Add i18n strategy and private config types ([14f9be6](https://github.com/s00d/nuxt-i18n-micro/commit/14f9be6))
- **playwright:** Add CI-specific configurations for tracing, video, and screenshots ([3eba71f](https://github.com/s00d/nuxt-i18n-micro/commit/3eba71f))
- **useLocaleHead:** Improve locale handling with runtime config ([3f5608c](https://github.com/s00d/nuxt-i18n-micro/commit/3f5608c))
- **i18n:** Integrate i18n strategy and enhance locale handling ([5ba3597](https://github.com/s00d/nuxt-i18n-micro/commit/5ba3597))
- **auto-detect:** Refactor i18n configuration retrieval method ([e51d011](https://github.com/s00d/nuxt-i18n-micro/commit/e51d011))
- **redirect:** Add client-side redirection based on preferred locale ([d691993](https://github.com/s00d/nuxt-i18n-micro/commit/d691993))
- **i18n:** Implement i18n redirect plugin for localized routing ([28059ea](https://github.com/s00d/nuxt-i18n-micro/commit/28059ea))
- **route-utils:** Add support for locale-based path lookups ([906ef39](https://github.com/s00d/nuxt-i18n-micro/commit/906ef39))
- **module:** Improve i18n configuration handling and routing logic ([3f0af58](https://github.com/s00d/nuxt-i18n-micro/commit/3f0af58))
- **route-service:** Add optional locale getter for dynamic locale retrieval ([5ff70ae](https://github.com/s00d/nuxt-i18n-micro/commit/5ff70ae))
- **i18n:** Add composable for managing i18n locale state and cookies ([f22bcf4](https://github.com/s00d/nuxt-i18n-micro/commit/f22bcf4))
- **i18n:** Enhance locale handling and translation loading ([23b798d](https://github.com/s00d/nuxt-i18n-micro/commit/23b798d))
- **redirect:** Simplify locale retrieval in client redirect plugin ([f8f6807](https://github.com/s00d/nuxt-i18n-micro/commit/f8f6807))
- **middleware:** Add i18n global middleware for locale handling ([5ed7a04](https://github.com/s00d/nuxt-i18n-micro/commit/5ed7a04))
- **i18n:** Add handler for fetching merged translations ([1a49369](https://github.com/s00d/nuxt-i18n-micro/commit/1a49369))
- **server:** Add storage utilities for loading i18n translations ([9e509ba](https://github.com/s00d/nuxt-i18n-micro/commit/9e509ba))
- **server:** Add translation server middleware for locale handling ([43cc94e](https://github.com/s00d/nuxt-i18n-micro/commit/43cc94e))
- **cookie:** Add utility functions for locale and hash cookie management ([27d07b3](https://github.com/s00d/nuxt-i18n-micro/commit/27d07b3))
- **utils:** Add translation loader utility for route and locale ([36affb9](https://github.com/s00d/nuxt-i18n-micro/commit/36affb9))
- **module:** Add auto-detect language option and enhance data routes ([cd463ad](https://github.com/s00d/nuxt-i18n-micro/commit/cd463ad))
- **types:** Add i18n support to H3 event context ([8672cb2](https://github.com/s00d/nuxt-i18n-micro/commit/8672cb2))
- **test:** Enhance performance tests for i18n implementations ([4227117](https://github.com/s00d/nuxt-i18n-micro/commit/4227117))
- **devtools:** Enhance DevTools setup with rootDirs parameter ([3d9e389](https://github.com/s00d/nuxt-i18n-micro/commit/3d9e389))
- **tests:** Add performance testing configuration for Vitest ([b8c4cf5](https://github.com/s00d/nuxt-i18n-micro/commit/b8c4cf5))
- **storage:** Add translation storage class for caching translations ([135a011](https://github.com/s00d/nuxt-i18n-micro/commit/135a011))
- **composables:** Enhance i18n injections with additional helpers ([798521a](https://github.com/s00d/nuxt-i18n-micro/commit/798521a))
- **i18n:** Enhance translation loading and context switching ([9981da9](https://github.com/s00d/nuxt-i18n-micro/commit/9981da9))
- **server-loader:** Implement server-side translation loader ([e8314ca](https://github.com/s00d/nuxt-i18n-micro/commit/e8314ca))
- **server:** Update translation middleware to use new storage structure ([7021a7a](https://github.com/s00d/nuxt-i18n-micro/commit/7021a7a))
- **astro:** Upgrade version and refactor translation storage ([5f49aef](https://github.com/s00d/nuxt-i18n-micro/commit/5f49aef))
- **helpers:** Improve template interpolation with regex replacement ([a8180e7](https://github.com/s00d/nuxt-i18n-micro/commit/a8180e7))
- **route-service:** Add support for prefix_except_default strategy ([24c4347](https://github.com/s00d/nuxt-i18n-micro/commit/24c4347))
- **solid:** Update SolidI18n to use TranslationStorage instead of cache ([4dde9ee](https://github.com/s00d/nuxt-i18n-micro/commit/4dde9ee))
- **vue:** Implement translation storage management and update structure ([093139e](https://github.com/s00d/nuxt-i18n-micro/commit/093139e))
- **i18n:** Add previous page fallback for missing translations ([13461c2](https://github.com/s00d/nuxt-i18n-micro/commit/13461c2))
- **translations:** Add setTranslations method for locale management ([da01e7a](https://github.com/s00d/nuxt-i18n-micro/commit/da01e7a))

### 🩹 Fixes

- **types:** Allow `localeCookie` to accept null values ([504afc5](https://github.com/s00d/nuxt-i18n-micro/commit/504afc5))
- **route-service:** Prevent cookie update when localeCookie is disabled ([31bd208](https://github.com/s00d/nuxt-i18n-micro/commit/31bd208))
- **astro:** Handle null localeCookie in routing and integration ([ffcb910](https://github.com/s00d/nuxt-i18n-micro/commit/ffcb910))
- **locale:** Validate preferred locale and improve cookie handling ([c3434f8](https://github.com/s00d/nuxt-i18n-micro/commit/c3434f8))
- **get:** Improve cache management and error handling in translation loading ([843d7a1](https://github.com/s00d/nuxt-i18n-micro/commit/843d7a1))
- **translation-server-middleware:** Update type import for TranslationCache ([64e7245](https://github.com/s00d/nuxt-i18n-micro/commit/64e7245))
- **routeGenerator:** Update instantiation parameters for RouteGenerator ([e7d2e25](https://github.com/s00d/nuxt-i18n-micro/commit/e7d2e25))
- **redirect:** Prevent unnecessary route checks for 'no_prefix' strategy ([da344ec](https://github.com/s00d/nuxt-i18n-micro/commit/da344ec))
- **i18n-micro-env:** Allow null values for localeCookie and missingWarn ([0fffc0c](https://github.com/s00d/nuxt-i18n-micro/commit/0fffc0c))
- **route-generator:** Update localizedPaths type to use LocalizedPathsMap. ([5e292d1](https://github.com/s00d/nuxt-i18n-micro/commit/5e292d1))
- **tests:** Improve date calculation for locale switching test ([b023afc](https://github.com/s00d/nuxt-i18n-micro/commit/b023afc))
- **astro:** Resolve TypeScript errors in middleware and utils ([af2de3e](https://github.com/s00d/nuxt-i18n-micro/commit/af2de3e))
- **devtools-ui:** Handle potential undefined values in file paths ([3ea50b6](https://github.com/s00d/nuxt-i18n-micro/commit/3ea50b6))
- **router:** Handle undefined first path segment in locale check ([ac9b956](https://github.com/s00d/nuxt-i18n-micro/commit/ac9b956))
- **router:** Handle undefined path segments in locale check ([4399317](https://github.com/s00d/nuxt-i18n-micro/commit/4399317))
- **router:** Handle undefined path segment correctly ([d1f50b3](https://github.com/s00d/nuxt-i18n-micro/commit/d1f50b3))
- **types-generator:** Update translationDir retrieval logic ([3edd09a](https://github.com/s00d/nuxt-i18n-micro/commit/3edd09a))
- **i18n-link:** Update `$localeRoute` to `$localePath` for routing ([80e599d](https://github.com/s00d/nuxt-i18n-micro/commit/80e599d))
- **devtools:** Update module options import and improve path handling ([f443cd4](https://github.com/s00d/nuxt-i18n-micro/commit/f443cd4))
- **core:** Update version to 1.0.31 in package.json ([661d7c7](https://github.com/s00d/nuxt-i18n-micro/commit/661d7c7))
- **hooks:** Update type for routeName in beforeEach hook ([588787a](https://github.com/s00d/nuxt-i18n-micro/commit/588787a))
- **config:** Update locale cookie name for clarity ([79dad50](https://github.com/s00d/nuxt-i18n-micro/commit/79dad50))
- **module:** Keep root route for redirect to default locale ([cdb7fe0](https://github.com/s00d/nuxt-i18n-micro/commit/cdb7fe0))
- **i18n:** Adjust redirect logic for root path with prefix strategy ([7ce5652](https://github.com/s00d/nuxt-i18n-micro/commit/7ce5652))
- **i18n.global:** Optimize early exits and locale detection logic ([d3fe0bd](https://github.com/s00d/nuxt-i18n-micro/commit/d3fe0bd))
- **i18n:** Replace local translation loading with server loading ([2163264](https://github.com/s00d/nuxt-i18n-micro/commit/2163264))
- **node:** Update version to 1.1.0 and refactor translation caching logic ([fb36ab3](https://github.com/s00d/nuxt-i18n-micro/commit/fb36ab3))
- **nuxt.config:** Remove experimental i18nPreviousPageFallback option ([b263e46](https://github.com/s00d/nuxt-i18n-micro/commit/b263e46))
- **plugins:** Clarify comments for previous page fallback logic ([0552bea](https://github.com/s00d/nuxt-i18n-micro/commit/0552bea))

### 💅 Refactors

- **module:** Replace PageManager with RouteGenerator for routing logic ([0ca5cac](https://github.com/s00d/nuxt-i18n-micro/commit/0ca5cac))
- **route-generator:** Remove unused path utility functions ([20bdc36](https://github.com/s00d/nuxt-i18n-micro/commit/20bdc36))
- **route-generator:** Remove outdated refactoring plan document ([5b258ad](https://github.com/s00d/nuxt-i18n-micro/commit/5b258ad))
- **redirect:** Simplify locale handling logic in route checks ([6da9d56](https://github.com/s00d/nuxt-i18n-micro/commit/6da9d56))
- **route-generator:** Simplify localized route creation logic ([df6b8e7](https://github.com/s00d/nuxt-i18n-micro/commit/df6b8e7))
- **types:** Unify locale routes configuration type ([6cbc2e1](https://github.com/s00d/nuxt-i18n-micro/commit/6cbc2e1))
- **localized-paths:** Replace `path.posix.join` with `joinPath` ([0972c85](https://github.com/s00d/nuxt-i18n-micro/commit/0972c85))
- **route-generator:** Simplify route path building logic ([eb376de](https://github.com/s00d/nuxt-i18n-micro/commit/eb376de))
- **route-generator:** Simplify route path building logic ([4ab7b78](https://github.com/s00d/nuxt-i18n-micro/commit/4ab7b78))
- ⚠️  Complete rewrite of route generator mechanism ([9be2aa5](https://github.com/s00d/nuxt-i18n-micro/commit/9be2aa5))
- **locales:** Migrate translation generation scripts to ES modules ([469a9c4](https://github.com/s00d/nuxt-i18n-micro/commit/469a9c4))
- **devtools:** Improve type safety in Vite config handling ([353e4ac](https://github.com/s00d/nuxt-i18n-micro/commit/353e4ac))
- **locale-redirect:** Remove unused locale-redirect component ([3da74e5](https://github.com/s00d/nuxt-i18n-micro/commit/3da74e5))
- **meta:** Simplify i18n configuration retrieval in plugin ([e2089e2](https://github.com/s00d/nuxt-i18n-micro/commit/e2089e2))
- **plugins:** Simplify i18n configuration retrieval in hooks ([b7f7151](https://github.com/s00d/nuxt-i18n-micro/commit/b7f7151))
- **middleware:** Remove redirect middleware implementation ([fba5a23](https://github.com/s00d/nuxt-i18n-micro/commit/fba5a23))
- **watcher:** Simplify configuration retrieval in development mode ([49a5c3d](https://github.com/s00d/nuxt-i18n-micro/commit/49a5c3d))
- **routes:** Replace runtime config usage with i18n config imports ([5fcb258](https://github.com/s00d/nuxt-i18n-micro/commit/5fcb258))
- **utils:** Remove unused path-utils module ([e7e5872](https://github.com/s00d/nuxt-i18n-micro/commit/e7e5872))
- **locale-server-middleware:** Replace runtime config with i18n config ([abf3abb](https://github.com/s00d/nuxt-i18n-micro/commit/abf3abb))
- **translation-server-middleware:** Replace runtime config access method ([72cf777](https://github.com/s00d/nuxt-i18n-micro/commit/72cf777))
- **translation:** Simplify mergeTranslation logic and remove dev warning ([8b7fb32](https://github.com/s00d/nuxt-i18n-micro/commit/8b7fb32))
- **plugins:** Simplify meta plugin configuration and improve readability ([75654cc](https://github.com/s00d/nuxt-i18n-micro/commit/75654cc))
- **plugins:** Remove unused auto-detect plugin ([7611d6c](https://github.com/s00d/nuxt-i18n-micro/commit/7611d6c))
- **i18n-redirect:** Remove outdated plugin for i18n handling ([a998907](https://github.com/s00d/nuxt-i18n-micro/commit/a998907))
- **locale-detector:** Move locale-detector to server utilities ([844c3a5](https://github.com/s00d/nuxt-i18n-micro/commit/844c3a5))
- **server/utils:** Rename locale-server-middleware file and update imports ([1eb22bd](https://github.com/s00d/nuxt-i18n-micro/commit/1eb22bd))
- **translation-server-middleware:** Remove unused translation middleware ([e5f0df0](https://github.com/s00d/nuxt-i18n-micro/commit/e5f0df0))
- **utils:** Remove unused `translation-loader.ts` file ([125c7cf](https://github.com/s00d/nuxt-i18n-micro/commit/125c7cf))
- **watcher:** Optimize cache invalidation logic ([71da43f](https://github.com/s00d/nuxt-i18n-micro/commit/71da43f))
- **utils:** Remove unused storage utilities for translations ([6512369](https://github.com/s00d/nuxt-i18n-micro/commit/6512369))
- **core:** Rename cache to storage in BaseI18nOptions interface ([cce1dd2](https://github.com/s00d/nuxt-i18n-micro/commit/cce1dd2))
- **core:** Rename type `TranslationCache` to `TranslationStorage` ([e3d4d3b](https://github.com/s00d/nuxt-i18n-micro/commit/e3d4d3b))
- **translation:** Simplify translation storage and caching logic ([8d427fb](https://github.com/s00d/nuxt-i18n-micro/commit/8d427fb))
- **preact:** Replace `TranslationCache` with `TranslationStorage` ([b97148f](https://github.com/s00d/nuxt-i18n-micro/commit/b97148f))
- **i18n:** Replace `TranslationCache` with `TranslationStorage` ([3ee5b1a](https://github.com/s00d/nuxt-i18n-micro/commit/3ee5b1a))
- **types:** Update experimental options in ModuleOptions interface ([5e830f2](https://github.com/s00d/nuxt-i18n-micro/commit/5e830f2))
- **module:** Replace experimental options with main configuration ([4f756f6](https://github.com/s00d/nuxt-i18n-micro/commit/4f756f6))

### 📖 Documentation

- **i18n-cache-api:** Update cache structure and configuration details ([9b2c945](https://github.com/s00d/nuxt-i18n-micro/commit/9b2c945))
- **guide:** Update cookie-based locale detection information ([1d99624](https://github.com/s00d/nuxt-i18n-micro/commit/1d99624))
- **firebase:** Update lazy loading translations section for clarity ([6c8c8ef](https://github.com/s00d/nuxt-i18n-micro/commit/6c8c8ef))
- **getting-started:** Enhance `localeCookie` section for clarity ([fe1338d](https://github.com/s00d/nuxt-i18n-micro/commit/fe1338d))
- **guide:** Update strategy documentation with localeCookie and redirects ([2d5c36d](https://github.com/s00d/nuxt-i18n-micro/commit/2d5c36d))
- **integrations:** Update `localeCookie` type and usage instructions ([c5a407c](https://github.com/s00d/nuxt-i18n-micro/commit/c5a407c))
- **api:** Update method examples for clarity and accuracy ([8f0e9e3](https://github.com/s00d/nuxt-i18n-micro/commit/8f0e9e3))
- **guide:** Update references to nuxt-i18n-micro module and config file ([bd7deb2](https://github.com/s00d/nuxt-i18n-micro/commit/bd7deb2))
- **migration:** Update route management section for Nuxt I18n Micro ([e7177c6](https://github.com/s00d/nuxt-i18n-micro/commit/e7177c6))
- **guide:** Update references from nuxt-i18n to nuxt-i18n-micro ([5d91765](https://github.com/s00d/nuxt-i18n-micro/commit/5d91765))
- **guide:** Update locale prefix handling section in strategy.md ([cb970f8](https://github.com/s00d/nuxt-i18n-micro/commit/cb970f8))
- **index:** Update routing description to reflect strategy-based approach ([8e51a23](https://github.com/s00d/nuxt-i18n-micro/commit/8e51a23))
- **news:** Add announcement for Nuxt I18n Micro v3.0.0 release ([efff7d6](https://github.com/s00d/nuxt-i18n-micro/commit/efff7d6))
- **index:** Clarify routing strategies in documentation ([c9cf36e](https://github.com/s00d/nuxt-i18n-micro/commit/c9cf36e))
- **news:** Update v3.0.0 announcement with architectural changes ([47a4336](https://github.com/s00d/nuxt-i18n-micro/commit/47a4336))
- **strategy:** Clarify packages used for strategy implementation ([7d5a09d](https://github.com/s00d/nuxt-i18n-micro/commit/7d5a09d))
- **migration:** Update migration guide for v3.0.0 changes ([96f3181](https://github.com/s00d/nuxt-i18n-micro/commit/96f3181))
- **guide:** Update custom auto-detect documentation for cookie handling ([d5536ba](https://github.com/s00d/nuxt-i18n-micro/commit/d5536ba))
- **guide:** Update locale setting method in auto-detect guide ([a8635f4](https://github.com/s00d/nuxt-i18n-micro/commit/a8635f4))
- **guide:** Clarify `customRegexMatcher` example in getting started ([f9a0377](https://github.com/s00d/nuxt-i18n-micro/commit/f9a0377))
- **migration:** Update removal details for `fallbackRedirectComponentPath` ([75f1dd1](https://github.com/s00d/nuxt-i18n-micro/commit/75f1dd1))
- **guide:** Update locale handling instructions in strategy.md ([6e1a4e5](https://github.com/s00d/nuxt-i18n-micro/commit/6e1a4e5))
- **news:** Update redirect architecture and introduce useI18nLocale composable ([e767dd3](https://github.com/s00d/nuxt-i18n-micro/commit/e767dd3))
- **guide:** Update comments in storybook guide to English ([4655239](https://github.com/s00d/nuxt-i18n-micro/commit/4655239))
- **integrations:** Translate comments from Russian to English ([6e723d6](https://github.com/s00d/nuxt-i18n-micro/commit/6e723d6))
- **useI18nLocale:** Add documentation for useI18nLocale composable ([cbe440a](https://github.com/s00d/nuxt-i18n-micro/commit/cbe440a))
- **composables:** Add `useI18nLocale` composable documentation ([c1e112b](https://github.com/s00d/nuxt-i18n-micro/commit/c1e112b))
- **config:** Add link for useI18nLocale to documentation menu ([10179ed](https://github.com/s00d/nuxt-i18n-micro/commit/10179ed))
- **performance:** Update guide with caching and optimization details ([498fe56](https://github.com/s00d/nuxt-i18n-micro/commit/498fe56))
- **news:** Update release notes for v3.0.0 with performance optimizations ([7d9d808](https://github.com/s00d/nuxt-i18n-micro/commit/7d9d808))
- **news:** Update release notes for v3.0.0 with performance optimizations ([056c5c7](https://github.com/s00d/nuxt-i18n-micro/commit/056c5c7))
- **readme:** Update performance comparison with baseline results ([7da88b8](https://github.com/s00d/nuxt-i18n-micro/commit/7da88b8))
- **performance:** Update performance results and benchmarking notes ([b9a51fd](https://github.com/s00d/nuxt-i18n-micro/commit/b9a51fd))
- **guide:** Update experimental features to top-level options ([567837a](https://github.com/s00d/nuxt-i18n-micro/commit/567837a))

### 🏡 Chore

- **scripts:** Add clean:test script to remove test artifacts ([0af2243](https://github.com/s00d/nuxt-i18n-micro/commit/0af2243))
- **pnpm-lock:** Add test fixtures for auto-detect and pages scenarios ([3ff8a01](https://github.com/s00d/nuxt-i18n-micro/commit/3ff8a01))
- **api:** Remove debug log for loaded translations ([10d4335](https://github.com/s00d/nuxt-i18n-micro/commit/10d4335))
- **pnpm-workspace:** Update dependencies for catalog and testing ([8fe24ae](https://github.com/s00d/nuxt-i18n-micro/commit/8fe24ae))
- **package:** Add imports and update test scripts in `package.json` ([5b4389f](https://github.com/s00d/nuxt-i18n-micro/commit/5b4389f))
- **vitest:** Update test configuration to limit parallel execution ([a92eb86](https://github.com/s00d/nuxt-i18n-micro/commit/a92eb86))
- **devtools-ui:** Bump version to 1.1.0 in package.json ([dd3d206](https://github.com/s00d/nuxt-i18n-micro/commit/dd3d206))
- **route-strategy:** Bump version to 1.1.0 ([e7e7b35](https://github.com/s00d/nuxt-i18n-micro/commit/e7e7b35))
- **test-utils:** Bump version to `1.1.0` in `package.json` ([f4cd09e](https://github.com/s00d/nuxt-i18n-micro/commit/f4cd09e))
- **types-generator:** Bump version to 1.1.0 in package.json ([f70292e](https://github.com/s00d/nuxt-i18n-micro/commit/f70292e))
- **lockfile:** Update `pnpm-lock.yaml` with new nuxt dependencies ([5a38606](https://github.com/s00d/nuxt-i18n-micro/commit/5a38606))

### ✅ Tests

- **auto-detect-no-prefix:** Add tests for autoDetectLanguage functionality ([4fd130d](https://github.com/s00d/nuxt-i18n-micro/commit/4fd130d))
- **cookie-redirect:** Add tests for cookie-based locale redirection ([933ff4d](https://github.com/s00d/nuxt-i18n-micro/commit/933ff4d))
- **named-params:** Enhance navigation tests with URL verification ([064ac6e](https://github.com/s00d/nuxt-i18n-micro/commit/064ac6e))
- **pages:** Add tests for i18n with pages: false configuration ([37da7ed](https://github.com/s00d/nuxt-i18n-micro/commit/37da7ed))
- **prefix:** Add tests for prefix strategy redirection behavior ([1ebbcba](https://github.com/s00d/nuxt-i18n-micro/commit/1ebbcba))
- Add reactivity tests for i18n locale switching and routing ([809b114](https://github.com/s00d/nuxt-i18n-micro/commit/809b114))
- **serverless:** Add tests for translations in serverless environment ([9e8d71c](https://github.com/s00d/nuxt-i18n-micro/commit/9e8d71c))
- **route-generator:** Update test cases to use structured options ([cab8fef](https://github.com/s00d/nuxt-i18n-micro/commit/cab8fef))
- **no-prefix:** Update comment for URL check in German ([47346ee](https://github.com/s00d/nuxt-i18n-micro/commit/47346ee))
- **route-strategy:** Improve test assertions for route children ([93f5b13](https://github.com/s00d/nuxt-i18n-micro/commit/93f5b13))
- **basic:** Add error handling for undefined ISO date conversion ([4838440](https://github.com/s00d/nuxt-i18n-micro/commit/4838440))
- Update assertions for URL formats in various test files ([8b25a4c](https://github.com/s00d/nuxt-i18n-micro/commit/8b25a4c))
- Update assertions for URL formats in various test files ([03fc4ff](https://github.com/s00d/nuxt-i18n-micro/commit/03fc4ff))
- **route-service:** Remove setCookie mock from RouteService tests ([cccc3cc](https://github.com/s00d/nuxt-i18n-micro/commit/cccc3cc))
- **auto-detect-no-prefix:** Refactor tests to use direct requests ([36a9c75](https://github.com/s00d/nuxt-i18n-micro/commit/36a9c75))
- **basic:** Fix locale text assertion in navigation test ([c7664a9](https://github.com/s00d/nuxt-i18n-micro/commit/c7664a9))
- **cookie:** Update user locale cookie expectation to 'en' ([14dbe85](https://github.com/s00d/nuxt-i18n-micro/commit/14dbe85))
- **pages:** Prefix test names for clarity and consistency ([3e73d49](https://github.com/s00d/nuxt-i18n-micro/commit/3e73d49))
- **reactivity:** Clear cookies before each test in critical i18n scenarios ([1402eb2](https://github.com/s00d/nuxt-i18n-micro/commit/1402eb2))
- **basic:** Fix expected locale text after navigation ([3070956](https://github.com/s00d/nuxt-i18n-micro/commit/3070956))
- **reactivity:** Update locale assertions in reactivity tests ([1b4872d](https://github.com/s00d/nuxt-i18n-micro/commit/1b4872d))
- **content:** Add waitFor visibility check for locale switcher button ([67cc554](https://github.com/s00d/nuxt-i18n-micro/commit/67cc554))
- **i18n:** Update tests to use custom storage instead of cache ([da1cd44](https://github.com/s00d/nuxt-i18n-micro/commit/da1cd44))
- **route-service:** Improve tests for getCurrentLocale logic ([e05895b](https://github.com/s00d/nuxt-i18n-micro/commit/e05895b))

#### ⚠️ Breaking Changes

- ⚠️  Complete rewrite of route generator mechanism ([9be2aa5](https://github.com/s00d/nuxt-i18n-micro/commit/9be2aa5))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.20.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.20.0...v2.20.1)

### ✅ Tests

- **locale-state-prefix:** Add test for custom-fallback-route 404 error ([29540a9](https://github.com/s00d/nuxt-i18n-micro/commit/29540a9))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.20.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.19.0...v2.20.0)

### 🚀 Enhancements

- **redirect:** Implement locale redirection for prefix_except_default strategy ([c7cf94e](https://github.com/s00d/nuxt-i18n-micro/commit/c7cf94e))
- **locale-redirect:** Add user locale preference handling ([d130b81](https://github.com/s00d/nuxt-i18n-micro/commit/d130b81))

### 📖 Documentation

- **guide:** Clarify redirect behavior for URL prefix strategies ([974eaf4](https://github.com/s00d/nuxt-i18n-micro/commit/974eaf4))
- **guide:** Clarify redirect behavior for URL prefix strategies ([1aa6a8d](https://github.com/s00d/nuxt-i18n-micro/commit/1aa6a8d))

### ✅ Tests

- **locale:** Update test descriptions for clarity and correctness ([075b058](https://github.com/s00d/nuxt-i18n-micro/commit/075b058))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.19.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.18.0...v2.19.0)

### 🚀 Enhancements

- **locale:** Add programmatic locale state management ([cc4348d](https://github.com/s00d/nuxt-i18n-micro/commit/cc4348d))

### 💅 Refactors

- **ui:** Clean up template formatting and remove trailing semicolons ([0163d98](https://github.com/s00d/nuxt-i18n-micro/commit/0163d98))

### 📖 Documentation

- **guide/custom-auto-detect:** Correct punctuation and improve clarity ([880409d](https://github.com/s00d/nuxt-i18n-micro/commit/880409d))
- **guide/strategy:** Update hydration mismatch explanation for no_prefix ([0daa516](https://github.com/s00d/nuxt-i18n-micro/commit/0daa516))

### ✅ Tests

- Add tests for locale state prefix strategies ([25d9380](https://github.com/s00d/nuxt-i18n-micro/commit/25d9380))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.18.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.17.1...v2.18.0)

### 🚀 Enhancements

- **server/routes:** Add safe data parsing helper for storage ([2adb080](https://github.com/s00d/nuxt-i18n-micro/commit/2adb080))

### 📖 Documentation

- **guide:** Update custom auto-detect documentation for clarity ([7dde79a](https://github.com/s00d/nuxt-i18n-micro/commit/7dde79a))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.17.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.17.0...v2.17.1)

### 🩹 Fixes

- **locale:** Prevent partial locale matching by sorting locale codes ([7db7039](https://github.com/s00d/nuxt-i18n-micro/commit/7db7039))

### 📖 Documentation

- **guide:** Add no-prefix strategy for server-side locale detection ([4ba0026](https://github.com/s00d/nuxt-i18n-micro/commit/4ba0026))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.17.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.16.3...v2.17.0)

### 🚀 Enhancements

- **nitro:** Mount translation directories as server assets ([3c69c70](https://github.com/s00d/nuxt-i18n-micro/commit/3c69c70))

### 💅 Refactors

- **server:** Streamline translation file loading logic ([b1bc755](https://github.com/s00d/nuxt-i18n-micro/commit/b1bc755))

### ✅ Tests

- **locale-test:** Update date tests to use dynamic date calculations ([ae51c82](https://github.com/s00d/nuxt-i18n-micro/commit/ae51c82))
- **locale-test:** Update date tests to use dynamic date calculations ([15e7cad](https://github.com/s00d/nuxt-i18n-micro/commit/15e7cad))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.16.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.16.2...v2.16.3)

## v2.16.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.16.1...v2.16.2)

## v2.16.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.16.0...v2.16.1)

## v2.16.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.15.2...v2.16.0)

### 🚀 Enhancements

- **astro:** Upgrade to version 1.1.0 and add new client exports ([3ff9c68](https://github.com/s00d/nuxt-i18n-micro/commit/3ff9c68))
- **core:** Add BaseI18n class for i18n adapter implementation ([cf220bb](https://github.com/s00d/nuxt-i18n-micro/commit/cf220bb))
- **bridge:** Implement createBridge function for DevTools communication ([c3098c6](https://github.com/s00d/nuxt-i18n-micro/commit/c3098c6))
- **devtools-ui:** Add Vite plugin for i18n development tools ([c53673a](https://github.com/s00d/nuxt-i18n-micro/commit/c53673a))
- **preact:** Add initial package configuration for @i18n-micro/preact ([b7d902c](https://github.com/s00d/nuxt-i18n-micro/commit/b7d902c))
- **react:** Add initial implementation of React i18n package ([8a6fe07](https://github.com/s00d/nuxt-i18n-micro/commit/8a6fe07))
- **solid:** Add SolidJS i18n adapter and context management ([1cdeb19](https://github.com/s00d/nuxt-i18n-micro/commit/1cdeb19))
- **solid:** Add SolidJS i18n adapter and context management ([0a527af](https://github.com/s00d/nuxt-i18n-micro/commit/0a527af))
- **tests:** Add greeting and apples messages to context tests ([c847056](https://github.com/s00d/nuxt-i18n-micro/commit/c847056))

### 🩹 Fixes

- Respect localeCookie for no_prefix ([d5bec8e](https://github.com/s00d/nuxt-i18n-micro/commit/d5bec8e))
- **solid:** Update `@solidjs/router` peer dependency version ([c629f5e](https://github.com/s00d/nuxt-i18n-micro/commit/c629f5e))

### 💅 Refactors

- **i18n:** Extend from BaseI18n and simplify constructor logic ([06147c8](https://github.com/s00d/nuxt-i18n-micro/commit/06147c8))
- **vue:** Remove deprecated router integration code ([71574e9](https://github.com/s00d/nuxt-i18n-micro/commit/71574e9))
- **ui:** Remove unnecessary whitespace in icon components and configs ([f76a544](https://github.com/s00d/nuxt-i18n-micro/commit/f76a544))

### 📖 Documentation

- **nodejs:** Remove outdated Node.js integration documentation ([38de7e7](https://github.com/s00d/nuxt-i18n-micro/commit/38de7e7))
- **devtools-ui:** Add documentation for the DevTools UI package ([e937229](https://github.com/s00d/nuxt-i18n-micro/commit/e937229))
- **integrations:** Add integration documentation for i18n packages ([3f580bd](https://github.com/s00d/nuxt-i18n-micro/commit/3f580bd))
- **integrations:** Update links and add new package entries ([86f6595](https://github.com/s00d/nuxt-i18n-micro/commit/86f6595))

### 🏡 Chore

- **types:** Update `vite-plugin-dts` version to `^4.5.4` ([19d9036](https://github.com/s00d/nuxt-i18n-micro/commit/19d9036))
- **test-utils:** Update version and dependencies in package.json ([f43d415](https://github.com/s00d/nuxt-i18n-micro/commit/f43d415))
- **types-generator:** Update dependencies and version in package.json ([e5a64d9](https://github.com/s00d/nuxt-i18n-micro/commit/e5a64d9))
- **pnpm-workspace:** Update package patterns for playground directories ([2648c29](https://github.com/s00d/nuxt-i18n-micro/commit/2648c29))

### ✅ Tests

- **core:** Cover localeCookie fallback ([b18a1ec](https://github.com/s00d/nuxt-i18n-micro/commit/b18a1ec))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))
- Baker <baker@shamlan.sa>

## v2.15.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.15.1...v2.15.2)

### 🩹 Fixes

- **devtools:** Use path.join for candidatePath construction ([4439fa1](https://github.com/s00d/nuxt-i18n-micro/commit/4439fa1))

### 🏡 Chore

- Remove unnecessary console log statements ([b003b65](https://github.com/s00d/nuxt-i18n-micro/commit/b003b65))
- **packages:** Update package versions to 1.0.1 ([9c61051](https://github.com/s00d/nuxt-i18n-micro/commit/9c61051))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.15.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.15.0...v2.15.1)

### 💅 Refactors

- **devtools:** Streamline Vite proxy configuration for client server ([1038171](https://github.com/s00d/nuxt-i18n-micro/commit/1038171))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.15.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.14.1...v2.15.0)

### 🚀 Enhancements

- **nuxt.config:** Implement build output management in hooks ([22a0cc9](https://github.com/s00d/nuxt-i18n-micro/commit/22a0cc9))

### 💅 Refactors

- **playground:** Remove unnecessary reference to `content.d.ts` ([014868b](https://github.com/s00d/nuxt-i18n-micro/commit/014868b))

### 📖 Documentation

- **news:** Update version to v2.14.1 in the news section ([ffb4fd9](https://github.com/s00d/nuxt-i18n-micro/commit/ffb4fd9))
- **types-generator:** Remove redundant TypeScript support link ([dd30614](https://github.com/s00d/nuxt-i18n-micro/commit/dd30614))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.14.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.14.0...v2.14.1)

### 🏡 Chore

- **packages:** Set publishConfig access to public for all packages ([2a01f9a](https://github.com/s00d/nuxt-i18n-micro/commit/2a01f9a))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.14.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.13.0...v2.14.0)

### 🚀 Enhancements

- **vue:** Implement Vue i18n plugin and core functionalities ([4dd2c1e](https://github.com/s00d/nuxt-i18n-micro/commit/4dd2c1e))
- **astro:** Add i18n integration package ([a697c2f](https://github.com/s00d/nuxt-i18n-micro/commit/a697c2f))
- **node:** Add Node.js I18n adapter with translation loading capabilities ([af4ae4e](https://github.com/s00d/nuxt-i18n-micro/commit/af4ae4e))
- **types-generator:** Add implementation of types generator for i18n ([a5c0a92](https://github.com/s00d/nuxt-i18n-micro/commit/a5c0a92))
- **devtools-ui:** Add implementation of i18n DevTools UI ([6db0088](https://github.com/s00d/nuxt-i18n-micro/commit/6db0088))
- **types:** Add translation key types for enhanced localization support ([a57da32](https://github.com/s00d/nuxt-i18n-micro/commit/a57da32))
- **app:** Implement i18n devtools integration ([4663b9f](https://github.com/s00d/nuxt-i18n-micro/commit/4663b9f))
- **config:** Add i18n types configuration and types generator module ([6cda899](https://github.com/s00d/nuxt-i18n-micro/commit/6cda899))
- **playground:** Add Node.js i18n package demo page and API ([8080602](https://github.com/s00d/nuxt-i18n-micro/commit/8080602))
- **playground:** Add Node.js i18n package demo page and API ([654245f](https://github.com/s00d/nuxt-i18n-micro/commit/654245f))
- **playground:** Add Node.js playground for i18n-micro ([0396bcb](https://github.com/s00d/nuxt-i18n-micro/commit/0396bcb))
- **docs:** Add integrations section to documentation sidebar ([88a5e7d](https://github.com/s00d/nuxt-i18n-micro/commit/88a5e7d))

### 🩹 Fixes

- **tests:** Improve command spawning and invalid route handling ([6b720ac](https://github.com/s00d/nuxt-i18n-micro/commit/6b720ac))
- **utils:** Update import path for DefineI18nRouteConfig type ([4379563](https://github.com/s00d/nuxt-i18n-micro/commit/4379563))
- **page-manager:** Add null check for custom path normalization ([7451dc2](https://github.com/s00d/nuxt-i18n-micro/commit/7451dc2))
- **locale-manager:** Update import path for types ([c9b27c4](https://github.com/s00d/nuxt-i18n-micro/commit/c9b27c4))
- **devtools:** Update import path for module types ([c9e77fd](https://github.com/s00d/nuxt-i18n-micro/commit/c9e77fd))
- **locale-server-middleware:** Update import path for types ([c46c35d](https://github.com/s00d/nuxt-i18n-micro/commit/c46c35d))
- **locale-detector:** Handle edge cases in locale detection ([733ae61](https://github.com/s00d/nuxt-i18n-micro/commit/733ae61))

### 💅 Refactors

- **core:** Rename package from `nuxt-i18n-micro-core` to `@i18n-micro/core` ([31ced79](https://github.com/s00d/nuxt-i18n-micro/commit/31ced79))
- **module:** Update plural function to use default from core ([31887a4](https://github.com/s00d/nuxt-i18n-micro/commit/31887a4))
- **translation-server-middleware:** Update imports from nuxt-i18n-micro to @i18n-micro/core ([48e8ae6](https://github.com/s00d/nuxt-i18n-micro/commit/48e8ae6))
- **routes:** Update import paths for module types ([168f23c](https://github.com/s00d/nuxt-i18n-micro/commit/168f23c))
- **plugins:** Update imports to use '@i18n-micro' namespace ([763bacd](https://github.com/s00d/nuxt-i18n-micro/commit/763bacd))
- **composables:** Update import paths for i18n dependencies ([1386a6a](https://github.com/s00d/nuxt-i18n-micro/commit/1386a6a))
- **components:** Update import paths to use scoped packages ([3740786](https://github.com/s00d/nuxt-i18n-micro/commit/3740786))

### 📖 Documentation

- **news:** Add release notes for Nuxt I18n Micro v2.14.0 ([65d4895](https://github.com/s00d/nuxt-i18n-micro/commit/65d4895))
- **nodejs:** Add integration guide for Node.js runtime using `@i18n-micro/node` ([a5fb0aa](https://github.com/s00d/nuxt-i18n-micro/commit/a5fb0aa))
- **nodejs:** Add integration guide for astro runtime using `@i18n-micro/astro` ([109cc29](https://github.com/s00d/nuxt-i18n-micro/commit/109cc29))
- **vue:** Add integration guide for vue runtime using `@i18n-micro/vue` ([05ae3fa](https://github.com/s00d/nuxt-i18n-micro/commit/05ae3fa))
- **types-generator:** Add documentation for types generator package ([ce26f10](https://github.com/s00d/nuxt-i18n-micro/commit/ce26f10))
- **testing:** Update package name in testing guide to @i18n-micro/test-utils ([1a66c80](https://github.com/s00d/nuxt-i18n-micro/commit/1a66c80))
- **composables:** Add documentation for available composables ([e7b86d0](https://github.com/s00d/nuxt-i18n-micro/commit/e7b86d0))
- **components:** Add documentation for available components ([b0c281b](https://github.com/s00d/nuxt-i18n-micro/commit/b0c281b))
- **api:** Add API reference documentation ([cc4ddc6](https://github.com/s00d/nuxt-i18n-micro/commit/cc4ddc6))

### 🏡 Chore

- **test-utils:** Rename package and update imports to @i18n-micro ([703432d](https://github.com/s00d/nuxt-i18n-micro/commit/703432d))
- **types:** Rename package to @i18n-micro/types ([fb76891](https://github.com/s00d/nuxt-i18n-micro/commit/fb76891))
- **eslint:** Add ignores for Astro files in ESLint config ([6b239e4](https://github.com/s00d/nuxt-i18n-micro/commit/6b239e4))
- **package:** Update package names and modify workspaces configuration ([abb4e64](https://github.com/s00d/nuxt-i18n-micro/commit/abb4e64))
- **github-actions:** Trigger deployment on new release publication ([7bfcbcf](https://github.com/s00d/nuxt-i18n-micro/commit/7bfcbcf))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.13.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.12.1...v2.13.0)

### 🚀 Enhancements

- **locale-detector:** Enhance locale detection logic with URL checks ([893edee](https://github.com/s00d/nuxt-i18n-micro/commit/893edee))
- **locale-server-middleware:** Pass locales to config for URL path check ([c933b62](https://github.com/s00d/nuxt-i18n-micro/commit/c933b62))

### 🩹 Fixes

- **translation-server-middleware:** Update config access to use public scope ([36cac43](https://github.com/s00d/nuxt-i18n-micro/commit/36cac43))

### 💅 Refactors

- **route-service:** Improve locale extraction and comments ([fa66c2a](https://github.com/s00d/nuxt-i18n-micro/commit/fa66c2a))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.12.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.12.0...v2.12.1)

### 🩹 Fixes

- **locale-redirect:** Improve error handling for 404 responses ([32e9dbe](https://github.com/s00d/nuxt-i18n-micro/commit/32e9dbe))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.12.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.11.0...v2.12.0)

### 🚀 Enhancements

- **locales:** Add missing handler test fixtures for multiple languages ([63a77f7](https://github.com/s00d/nuxt-i18n-micro/commit/63a77f7))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.11.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.10.0...v2.11.0)

### 🚀 Enhancements

- **types:** Add MissingHandler type and missingWarn option ([96244e4](https://github.com/s00d/nuxt-i18n-micro/commit/96244e4))
- **i18n:** Add custom missing translation handler support ([4f20768](https://github.com/s00d/nuxt-i18n-micro/commit/4f20768))
- **docs:** Add `$setMissingHandler` method documentation ([6e77bb2](https://github.com/s00d/nuxt-i18n-micro/commit/6e77bb2))
- **docs:** Add `$setMissingHandler` documentation for custom handlers ([21b8208](https://github.com/s00d/nuxt-i18n-micro/commit/21b8208))

### 📖 Documentation

- **guide:** Add documentation for missingWarn option in getting started ([1b5a5d4](https://github.com/s00d/nuxt-i18n-micro/commit/1b5a5d4))

### ✅ Tests

- **missing-handler:** Add tests for missing handler functionality ([c57e989](https://github.com/s00d/nuxt-i18n-micro/commit/c57e989))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.10.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.9.0...v2.10.0)

### 🚀 Enhancements

- **route-service:** Add locale extraction from URL path ([782acc3](https://github.com/s00d/nuxt-i18n-micro/commit/782acc3))
- **i18n:** Add cookie locale support for non-hash strategies ([374039d](https://github.com/s00d/nuxt-i18n-micro/commit/374039d))

### ✅ Tests

- **route-service:** Add tests for locale extraction and cookie fallback ([c4854d5](https://github.com/s00d/nuxt-i18n-micro/commit/c4854d5))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.9.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.8.0...v2.9.0)

### 🚀 Enhancements

- **composables:** Prevent SEO tags generation on 404 pages ([da31e8a](https://github.com/s00d/nuxt-i18n-micro/commit/da31e8a))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.8.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.7.0...v2.8.0)

### 🚀 Enhancements

- **locale-redirect:** Enhance locale redirection logic with query support ([88c5fb7](https://github.com/s00d/nuxt-i18n-micro/commit/88c5fb7))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.7.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.6.0...v2.7.0)

### 🚀 Enhancements

- **types:** Add apiBaseClientHost and apiBaseServerHost options ([5a78894](https://github.com/s00d/nuxt-i18n-micro/commit/5a78894))
- **plugins:** Enhance i18n API base URL handling ([f508b3f](https://github.com/s00d/nuxt-i18n-micro/commit/f508b3f))
- **module:** Add apiBaseClientHost and apiBaseServerHost options ([ad17272](https://github.com/s00d/nuxt-i18n-micro/commit/ad17272))

### 📖 Documentation

- **faq:** Update apiBaseUrl instructions for SSR translation fetching ([4e4d7d1](https://github.com/s00d/nuxt-i18n-micro/commit/4e4d7d1))
- **firebase:** Clarify apiBaseUrl usage in route rules ([27647fc](https://github.com/s00d/nuxt-i18n-micro/commit/27647fc))
- **guide:** Update getting started with new API base URL options ([a11ecee](https://github.com/s00d/nuxt-i18n-micro/commit/a11ecee))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.6.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.5.0...v2.6.0)

### 🚀 Enhancements

- **route-service:** Add method to get plugin route name based on locale ([fb2e1ee](https://github.com/s00d/nuxt-i18n-micro/commit/fb2e1ee))
- **types:** Add apiBaseUrl to configuration type ([de7f007](https://github.com/s00d/nuxt-i18n-micro/commit/de7f007))
- **types:** Add apiBaseUrl to configuration type ([78ad31c](https://github.com/s00d/nuxt-i18n-micro/commit/78ad31c))
- **module:** Add apiBaseUrl to module options ([f808685](https://github.com/s00d/nuxt-i18n-micro/commit/f808685))

### 💅 Refactors

- **plugins:** Rename routeService method for clarity ([6fa53ef](https://github.com/s00d/nuxt-i18n-micro/commit/6fa53ef))
- **translation-server-middleware:** Improve type imports and config usage ([ad57f4c](https://github.com/s00d/nuxt-i18n-micro/commit/ad57f4c))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.5.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.4.0...v2.5.0)

### 🚀 Enhancements

- **module:** Enhance API base URL handling for improved path management ([e651bc0](https://github.com/s00d/nuxt-i18n-micro/commit/e651bc0))
- **translation-server-middleware:** Use configurable API base URL for translations ([d770f83](https://github.com/s00d/nuxt-i18n-micro/commit/d770f83))

### 🩹 Fixes

- **plugins:** Correct apiBaseUrl default value in i18n config ([b998b4a](https://github.com/s00d/nuxt-i18n-micro/commit/b998b4a))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.4.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.3.0...v2.4.0)

### 🚀 Enhancements

- **locale-head:** Enhance locale switching functionality ([4361cee](https://github.com/s00d/nuxt-i18n-micro/commit/4361cee))
- **page-manager:** Implement routing logic for prefix_and_default strategy ([c99f5a5](https://github.com/s00d/nuxt-i18n-micro/commit/c99f5a5))
- **utils:** Normalize locale configurations for better handling ([7c8863f](https://github.com/s00d/nuxt-i18n-micro/commit/7c8863f))

### 💅 Refactors

- **i18n-link:** Optimize imports for better clarity ([da68eba](https://github.com/s00d/nuxt-i18n-micro/commit/da68eba))
- **plugins:** Simplify imports in `01.plugin.ts` ([c518dd3](https://github.com/s00d/nuxt-i18n-micro/commit/c518dd3))
- **plugins:** Organize imports in `02.meta.ts` for clarity ([402764f](https://github.com/s00d/nuxt-i18n-micro/commit/402764f))
- **plugins:** Reorganize imports in `03.define.ts` ([04fd8e0](https://github.com/s00d/nuxt-i18n-micro/commit/04fd8e0))

### 📖 Documentation

- **performance-results:** Update test script location and performance metrics ([5384027](https://github.com/s00d/nuxt-i18n-micro/commit/5384027))

### 🏡 Chore

- **test:** Update test configuration and release script ([0164300](https://github.com/s00d/nuxt-i18n-micro/commit/0164300))

### ✅ Tests

- Update i18n route tests to verify correct meta tags for locales ([313b76c](https://github.com/s00d/nuxt-i18n-micro/commit/313b76c))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.3.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.2.0...v2.3.0)

### 🚀 Enhancements

- **localeHead:** Simplify locale path handling in `useLocaleHead.ts` ([4a8844f](https://github.com/s00d/nuxt-i18n-micro/commit/4a8844f))
- **redirect:** Enhance global locale route handling with dynamic path resolution ([eafbaf8](https://github.com/s00d/nuxt-i18n-micro/commit/eafbaf8))
- **module:** Enhance fallback route handling for prefix strategy ([dddc15b](https://github.com/s00d/nuxt-i18n-micro/commit/dddc15b))
- **page-manager:** Normalize global locale routes during initialization ([f055e95](https://github.com/s00d/nuxt-i18n-micro/commit/f055e95))
- **utils:** Add normalizeRouteKey and denormalizeRouteKey functions ([440e75c](https://github.com/s00d/nuxt-i18n-micro/commit/440e75c))
- **product:** Enhance product fetching with TypeScript types ([7256521](https://github.com/s00d/nuxt-i18n-micro/commit/7256521))

### 🩹 Fixes

- **package:** Bump version to 1.0.23 in `package.json` ([1ea1cf7](https://github.com/s00d/nuxt-i18n-micro/commit/1ea1cf7))
- **locale-redirect:** Correct localized path format in redirect logic ([1709bb1](https://github.com/s00d/nuxt-i18n-micro/commit/1709bb1))
- **plugins:** Prevent premature reset of i18nRouteParams during navigation ([5237ffd](https://github.com/s00d/nuxt-i18n-micro/commit/5237ffd))
- **api:** Correct object syntax and import for event handler ([a2169ef](https://github.com/s00d/nuxt-i18n-micro/commit/a2169ef))

### 💅 Refactors

- **helpers:** Replace arrow functions with regular function declarations ([bbc7da8](https://github.com/s00d/nuxt-i18n-micro/commit/bbc7da8))
- **components:** Replace `h` with `hyperscript` in `i18n-t.vue` ([83c9073](https://github.com/s00d/nuxt-i18n-micro/commit/83c9073))

### 📖 Documentation

- **guide:** Add section on dynamic routes with slugs and `$setI18nRouteParams` ([ccec5be](https://github.com/s00d/nuxt-i18n-micro/commit/ccec5be))

### 🏡 Chore

- **.gitignore:** Update ignore patterns for generated files ([083ed9f](https://github.com/s00d/nuxt-i18n-micro/commit/083ed9f))

### ✅ Tests

- Update pages manager tests for route handling and localization ([68b38f3](https://github.com/s00d/nuxt-i18n-micro/commit/68b38f3))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.2.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.1.0...v2.2.0)

### 🚀 Enhancements

- **locale:** Add support for global locale routes in metadata handling ([017af19](https://github.com/s00d/nuxt-i18n-micro/commit/017af19))
- **module:** Add globalLocaleRoutes to route configuration ([0b23682](https://github.com/s00d/nuxt-i18n-micro/commit/0b23682))

### 💅 Refactors

- **route-service:** Improve parameter handling for localized routes ([8ed38b9](https://github.com/s00d/nuxt-i18n-micro/commit/8ed38b9))

### ✅ Tests

- **define-i18n-route:** Add tests for alternate links and canonical URLs ([4a67fad](https://github.com/s00d/nuxt-i18n-micro/commit/4a67fad))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.1.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v2.0.0...v2.1.0)

### 🚀 Enhancements

- **module:** Support page files in both pages/ and app/pages/ directories ([aaf597a](https://github.com/s00d/nuxt-i18n-micro/commit/aaf597a))
- **route-service:** Enhance route resolution by checking route names ([fdbd8b9](https://github.com/s00d/nuxt-i18n-micro/commit/fdbd8b9))
- **route-service:** Enhance route resolution by checking route names ([fd552a9](https://github.com/s00d/nuxt-i18n-micro/commit/fd552a9))

### 💅 Refactors

- **types:** Remove `disableUpdater` option from configuration ([f64238e](https://github.com/s00d/nuxt-i18n-micro/commit/f64238e))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v2.0.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.103.0...v2.0.0)

### 🚀 Enhancements

- **translation:** Implement request-scoped translation caching ([721e5dd](https://github.com/s00d/nuxt-i18n-micro/commit/721e5dd))
- **meta:** Enhance meta management with reactive updates ([b145496](https://github.com/s00d/nuxt-i18n-micro/commit/b145496))
- **plugins:** Unify page and global translation loading ([7209299](https://github.com/s00d/nuxt-i18n-micro/commit/7209299))
- **routes:** Enhance translation file handling and caching ([eb7bba2](https://github.com/s00d/nuxt-i18n-micro/commit/eb7bba2))
- **plugins:** Add i18n hooks plugin for translation management ([6fc04d8](https://github.com/s00d/nuxt-i18n-micro/commit/6fc04d8))
- **runtime:** Add hot module replacement for translation updates ([43b8f56](https://github.com/s00d/nuxt-i18n-micro/commit/43b8f56))
- **docs:** Update getting started guide with HMR feature details ([313f863](https://github.com/s00d/nuxt-i18n-micro/commit/313f863))
- **types:** Add `hmr` and `routesLocaleLinks` to types ([0431b6c](https://github.com/s00d/nuxt-i18n-micro/commit/0431b6c))
- **config:** Add nitro externals configuration to nuxt.config.ts ([c108d04](https://github.com/s00d/nuxt-i18n-micro/commit/c108d04))
- **test-utils:** Add overwrite option to mergeTranslations function ([ff54ad0](https://github.com/s00d/nuxt-i18n-micro/commit/ff54ad0))

### 🩹 Fixes

- **tests:** Update references to nuxt-i18n version in performance tests ([f5f2bf3](https://github.com/s00d/nuxt-i18n-micro/commit/f5f2bf3))
- **translation:** Improve cache handling and warning in mergeTranslation ([e091cfb](https://github.com/s00d/nuxt-i18n-micro/commit/e091cfb))
- **nuxt.config:** Disable i18nPreviousPageFallback option ([5dbbea5](https://github.com/s00d/nuxt-i18n-micro/commit/5dbbea5))
- **page-manager:** Remove alias to prevent infinite recursion ([c9cde51](https://github.com/s00d/nuxt-i18n-micro/commit/c9cde51))

### 💅 Refactors

- **plugins:** Adjust comment formatting for consistency ([635cccd](https://github.com/s00d/nuxt-i18n-micro/commit/635cccd))

### 📖 Documentation

- **issue-templates:** Update issue templates for better clarity ([4384cd2](https://github.com/s00d/nuxt-i18n-micro/commit/4384cd2))
- **issue-templates:** Update issue templates for better clarity ([6b69537](https://github.com/s00d/nuxt-i18n-micro/commit/6b69537))
- **performance-results:** Update performance metrics for nuxt-i18n v10 ([0c28c78](https://github.com/s00d/nuxt-i18n-micro/commit/0c28c78))
- **composables:** Update useLocaleHead documentation for clarity ([2dadefe](https://github.com/s00d/nuxt-i18n-micro/commit/2dadefe))
- **news:** Add release notes for Nuxt I18n Micro v2.0.0 ([70b6c0f](https://github.com/s00d/nuxt-i18n-micro/commit/70b6c0f))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.103.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.102.0...v1.103.0)

### 🚀 Enhancements

- **server:** Set Content-Type header for JSON responses ([be7048b](https://github.com/s00d/nuxt-i18n-micro/commit/be7048b))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.102.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.101.2...v1.102.0)

### 🚀 Enhancements

- **types:** Enhance `DefineI18nRouteConfig` with new properties ([57ab76a](https://github.com/s00d/nuxt-i18n-micro/commit/57ab76a))
- **module:** Add routeDisableMeta to handle disabled routes ([aec858d](https://github.com/s00d/nuxt-i18n-micro/commit/aec858d))
- **route-utils:** Add function to check if meta tags should be disabled ([11fb1f4](https://github.com/s00d/nuxt-i18n-micro/commit/11fb1f4))
- **meta:** Enhance meta generation with route-based checks ([f238ce8](https://github.com/s00d/nuxt-i18n-micro/commit/f238ce8))
- **plugins:** Enhance `defineI18nRoute` with new route config type ([62b73b7](https://github.com/s00d/nuxt-i18n-micro/commit/62b73b7))
- **pages:** Add pages to control i18n meta tag visibility ([368a60b](https://github.com/s00d/nuxt-i18n-micro/commit/368a60b))

### 💅 Refactors

- **utils:** Simplify `extractDefineI18nRouteData` return type. ([03a89ac](https://github.com/s00d/nuxt-i18n-micro/commit/03a89ac))

### 📖 Documentation

- **methods:** Update method descriptions and formatting in documentation ([2834bab](https://github.com/s00d/nuxt-i18n-micro/commit/2834bab))
- **faq:** Update FAQ with new sections and improved clarity ([9c62264](https://github.com/s00d/nuxt-i18n-micro/commit/9c62264))
- **getting-started:** Enhance the guide with clearer installation steps and features ([16b4fb0](https://github.com/s00d/nuxt-i18n-micro/commit/16b4fb0))
- **guide:** Update per-component translations documentation ([6a41e61](https://github.com/s00d/nuxt-i18n-micro/commit/6a41e61))

### ✅ Tests

- **meta:** Add tests for disabling meta tags in various locales ([f62ed68](https://github.com/s00d/nuxt-i18n-micro/commit/f62ed68))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.101.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.101.1...v1.101.2)

### 🩹 Fixes

- **meta:** Remove unnecessary async from defineNuxtPlugin ([16acf22](https://github.com/s00d/nuxt-i18n-micro/commit/16acf22))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.101.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.101.0...v1.101.1)

### 💅 Refactors

- **composables:** Remove async from useLocaleHead function ([f16a9c5](https://github.com/s00d/nuxt-i18n-micro/commit/f16a9c5))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.101.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.100.1...v1.101.0)

### 🚀 Enhancements

- **locale:** Add utility functions for route locale handling ([d57b08e](https://github.com/s00d/nuxt-i18n-micro/commit/d57b08e))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.100.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.100.0...v1.100.1)

### 🩹 Fixes

- **text:** Correct constructor parameters for PageManager instantiation. ([1799aa3](https://github.com/s00d/nuxt-i18n-micro/commit/1799aa3))

### 💅 Refactors

- **utils:** Simplify extraction of i18n route data ([23aa57b](https://github.com/s00d/nuxt-i18n-micro/commit/23aa57b))

### 📖 Documentation

- **api:** Update method documentation with supported configuration formats ([1cf03ea](https://github.com/s00d/nuxt-i18n-micro/commit/1cf03ea))

### ✅ Tests

- **extract-define-i18n-route:** Add tests for extractDefineI18nRouteData function ([48897f5](https://github.com/s00d/nuxt-i18n-micro/commit/48897f5))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.100.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.99.0...v1.100.0)

### 🚀 Enhancements

- **ui:** Translate comments in `app.vue` and `SettingsView.vue` to English ([88754bb](https://github.com/s00d/nuxt-i18n-micro/commit/88754bb))
- **page-manager:** Add support for route locale restrictions ([f58a076](https://github.com/s00d/nuxt-i18n-micro/commit/f58a076))

### 🩹 Fixes

- **utils:** Correct locale extraction regex patterns ([0f10fba](https://github.com/s00d/nuxt-i18n-micro/commit/0f10fba))
- **playground:** Translate comments from Russian to English ([311b993](https://github.com/s00d/nuxt-i18n-micro/commit/311b993))
- **text:** Correct constructor parameters for PageManager instantiation. ([cbd7247](https://github.com/s00d/nuxt-i18n-micro/commit/cbd7247))

### 💅 Refactors

- **module:** Update globalLocaleRoutes key to use routePath ([1684bff](https://github.com/s00d/nuxt-i18n-micro/commit/1684bff))
- **composables:** Improve comments for clarity and consistency ([830044b](https://github.com/s00d/nuxt-i18n-micro/commit/830044b))
- **plugins:** Improve comments for clarity and consistency ([d6f22f7](https://github.com/s00d/nuxt-i18n-micro/commit/d6f22f7))

### ✅ Tests

- Update PageManager tests to include additional parameters ([c044ce7](https://github.com/s00d/nuxt-i18n-micro/commit/c044ce7))
- Translate comments to English for clarity ([bb909d4](https://github.com/s00d/nuxt-i18n-micro/commit/bb909d4))

### 🎨 Styles

- **eslint:** Enforce consistent comment spacing in configuration ([3104905](https://github.com/s00d/nuxt-i18n-micro/commit/3104905))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.99.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.98.0...v1.99.0)

### 🚀 Enhancements

- **types:** Add experimental i18nPreviousPageFallback option ([7df8b03](https://github.com/s00d/nuxt-i18n-micro/commit/7df8b03))

### 🏡 Chore

- **ci:** Update dependency installation process in CI workflow ([21f3e10](https://github.com/s00d/nuxt-i18n-micro/commit/21f3e10))
- **ci:** Remove redundant build step from workflow ([1078250](https://github.com/s00d/nuxt-i18n-micro/commit/1078250))
- **test/fixtures:** Remove unused scripts from package.json ([a48848c](https://github.com/s00d/nuxt-i18n-micro/commit/a48848c))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.98.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.97.0...v1.98.0)

### 🚀 Enhancements

- **path-utils:** Add path utility for excluding static files from i18n routing ([bb0cff5](https://github.com/s00d/nuxt-i18n-micro/commit/bb0cff5))
- **page-manager:** Add support for filesLocaleRoutes in constructor ([8f765cc](https://github.com/s00d/nuxt-i18n-micro/commit/8f765cc))
- **types:** Add `routeLocales` option to `ModuleOptions` ([34afb68](https://github.com/s00d/nuxt-i18n-micro/commit/34afb68))
- **locale:** Add support for route-specific locales in `useLocaleHead` ([5f02fdf](https://github.com/s00d/nuxt-i18n-micro/commit/5f02fdf))
- **plugins:** Update `defineNuxtPlugin` to use async for locale head ([c5cee28](https://github.com/s00d/nuxt-i18n-micro/commit/c5cee28))
- **redirect:** Add locale check for route access control ([82a7862](https://github.com/s00d/nuxt-i18n-micro/commit/82a7862))
- **module:** Extract routeLocales and localeRoutes from page files ([b744950](https://github.com/s00d/nuxt-i18n-micro/commit/b744950))
- **module:** Replace `glob` with `globby` for page file discovery ([28be74f](https://github.com/s00d/nuxt-i18n-micro/commit/28be74f))

### 🩹 Fixes

- **components:** Update import path for `isInternalPath`. ([0fb1dc3](https://github.com/s00d/nuxt-i18n-micro/commit/0fb1dc3))
- **module:** Suppress TypeScript error for routeLocales ([a8e646b](https://github.com/s00d/nuxt-i18n-micro/commit/a8e646b))

### 💅 Refactors

- **text:** Update PageManager instantiation parameters ([08032db](https://github.com/s00d/nuxt-i18n-micro/commit/08032db))

### 🏡 Chore

- **pnpm-lock:** Update dependencies for test fixtures ([17fc3da](https://github.com/s00d/nuxt-i18n-micro/commit/17fc3da))

### ✅ Tests

- Update async component tests and add define-i18n-route tests ([75d0726](https://github.com/s00d/nuxt-i18n-micro/commit/75d0726))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.97.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.96.0...v1.97.0)

### 🚀 Enhancements

- **assets:** Add logo SVG file for branding ([c30d52c](https://github.com/s00d/nuxt-i18n-micro/commit/c30d52c))
- **assets:** Add logo SVG file for branding ([3678d93](https://github.com/s00d/nuxt-i18n-micro/commit/3678d93))
- **assets:** Add logo SVG file for branding ([8417cc9](https://github.com/s00d/nuxt-i18n-micro/commit/8417cc9))
- **types:** Add excludePatterns option to ModuleOptions interface ([b171580](https://github.com/s00d/nuxt-i18n-micro/commit/b171580))
- **page-manager:** Add support for custom exclusion patterns in i18n ([d244b1f](https://github.com/s00d/nuxt-i18n-micro/commit/d244b1f))
- **playground:** Add excludePatterns for static files and catch-all page ([83467a6](https://github.com/s00d/nuxt-i18n-micro/commit/83467a6))
- **docs:** Add guide for excluding static files from i18n routing ([1220921](https://github.com/s00d/nuxt-i18n-micro/commit/1220921))

### 📖 Documentation

- **readme:** Update logo image to full version in README.md ([1146f35](https://github.com/s00d/nuxt-i18n-micro/commit/1146f35))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.96.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.95.0...v1.96.0)

### 🚀 Enhancements

- **i18n-view:** Enhance UI with ActionBar and improve layout ([6ea32cb](https://github.com/s00d/nuxt-i18n-micro/commit/6ea32cb))
- **settings:** Refactor SettingsView for better modularity and clarity ([d536508](https://github.com/s00d/nuxt-i18n-micro/commit/d536508))
- **config:** Refactor ConfigView to use ConfigCard and LocaleTable components ([41fa00b](https://github.com/s00d/nuxt-i18n-micro/commit/41fa00b))
- **i18n:** Add loadPageTranslations method to load translations ([fc881b6](https://github.com/s00d/nuxt-i18n-micro/commit/fc881b6))
- **components:** Add ref import for reactive state management ([2b84513](https://github.com/s00d/nuxt-i18n-micro/commit/2b84513))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.95.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.94.0...v1.95.0)

### 🚀 Enhancements

- **playground:** Add async components test links to index page ([45432bc](https://github.com/s00d/nuxt-i18n-micro/commit/45432bc))
- **async-components:** Add initial configuration and dependencies ([664afb8](https://github.com/s00d/nuxt-i18n-micro/commit/664afb8))

### 🩹 Fixes

- **page-manager:** Translate comments from Russian to English ([3adc3fe](https://github.com/s00d/nuxt-i18n-micro/commit/3adc3fe))
- **format-service:** Update error message for invalid dates ([f8e3db0](https://github.com/s00d/nuxt-i18n-micro/commit/f8e3db0))
- **async-components-test:** Update type for DynamicComponent reference ([59a8c44](https://github.com/s00d/nuxt-i18n-micro/commit/59a8c44))

### 💅 Refactors

- **module:** Remove unused NuxtOptionsWithGenerate interface ([4b01a9b](https://github.com/s00d/nuxt-i18n-micro/commit/4b01a9b))
- **utils:** Improve comments for clarity and consistency ([53a9220](https://github.com/s00d/nuxt-i18n-micro/commit/53a9220))
- **devtools:** Translate comments to English for better clarity ([581b893](https://github.com/s00d/nuxt-i18n-micro/commit/581b893))
- **locale-server-middleware:** Translate comments to English ([03be2da](https://github.com/s00d/nuxt-i18n-micro/commit/03be2da))
- **translator:** Translate comments from Russian to English ([a5c46a2](https://github.com/s00d/nuxt-i18n-micro/commit/a5c46a2))
- **route-service:** Improve comments for clarity and consistency ([c40bc56](https://github.com/s00d/nuxt-i18n-micro/commit/c40bc56))
- **tests:** Improve comments in route-service tests for clarity ([07cf578](https://github.com/s00d/nuxt-i18n-micro/commit/07cf578))
- **test-utils:** Update comments to English for clarity ([3189c30](https://github.com/s00d/nuxt-i18n-micro/commit/3189c30))
- **tests:** Update comments in `no-prefix.spec.ts` for clarity ([7f24148](https://github.com/s00d/nuxt-i18n-micro/commit/7f24148))

### 🏡 Chore

- **vitest:** Update test timeout comment for clarity ([36bf86f](https://github.com/s00d/nuxt-i18n-micro/commit/36bf86f))
- **pnpm-workspace:** Update workspace configuration to include built dependencies ([9ba906f](https://github.com/s00d/nuxt-i18n-micro/commit/9ba906f))
- **test:** Update comments in `hook.spec.ts` for clarity ([2d71f85](https://github.com/s00d/nuxt-i18n-micro/commit/2d71f85))

### ✅ Tests

- **tests:** Update comment for clarity on locale dependency ([19192a4](https://github.com/s00d/nuxt-i18n-micro/commit/19192a4))
- **server:** Update comments to English for clarity ([32b69ed](https://github.com/s00d/nuxt-i18n-micro/commit/32b69ed))
- **async-components:** Add tests for async components in production mode ([bee8210](https://github.com/s00d/nuxt-i18n-micro/commit/bee8210))
- **async-components:** Add comprehensive tests for async components ([810a15e](https://github.com/s00d/nuxt-i18n-micro/commit/810a15e))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.94.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.93.0...v1.94.0)

### 🚀 Enhancements

- **pluralization:** Enhance handling of empty and undefined forms ([0017bed](https://github.com/s00d/nuxt-i18n-micro/commit/0017bed))

### 🩹 Fixes

- **core:** Correct version numbers in package.json files ([c324ed7](https://github.com/s00d/nuxt-i18n-micro/commit/c324ed7))

### 💅 Refactors

- **module:** Improve type safety for Nuxt's generate options ([905bbe5](https://github.com/s00d/nuxt-i18n-micro/commit/905bbe5))

### 🏡 Chore

- **core:** Update package versions and file extensions to .mts ([985929d](https://github.com/s00d/nuxt-i18n-micro/commit/985929d))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.93.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.92.0...v1.93.0)

### 🚀 Enhancements

- **module:** Add route rules for prerendering control ([862d778](https://github.com/s00d/nuxt-i18n-micro/commit/862d778))

### 🏡 Chore

- **test/fixtures/n3:** Update @nuxtjs/tailwindcss version to 6.13.1 ([0ce5a98](https://github.com/s00d/nuxt-i18n-micro/commit/0ce5a98))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.92.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.90.0...v1.92.0)

### 🚀 Enhancements

- **pages:** Enhance content loading with loading state and error handling ([63a42bd](https://github.com/s00d/nuxt-i18n-micro/commit/63a42bd))

### 🩹 Fixes

- **useLocaleHead:** Handle absence of locale functions gracefully ([be0a9f2](https://github.com/s00d/nuxt-i18n-micro/commit/be0a9f2))
- **playwright:** Reduce number of workers for non-CI environments ([15d43fe](https://github.com/s00d/nuxt-i18n-micro/commit/15d43fe))
- **playwright:** Reduce number of workers for non-CI environments ([1167dcd](https://github.com/s00d/nuxt-i18n-micro/commit/1167dcd))

### 🏡 Chore

- **version:** Bump version to 1.91.0 in `package.json` ([fcda15e](https://github.com/s00d/nuxt-i18n-micro/commit/fcda15e))
- **playwright:** Fix ts ([0b1d72b](https://github.com/s00d/nuxt-i18n-micro/commit/0b1d72b))

### ✅ Tests

- **content:** Update span locator tests to target data-item block ([aabb974](https://github.com/s00d/nuxt-i18n-micro/commit/aabb974))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.90.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.89.0...v1.90.0)

### 🚀 Enhancements

- **utils:** Add `isInternalPath` utility function ([62dab3b](https://github.com/s00d/nuxt-i18n-micro/commit/62dab3b))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.89.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.88.2...v1.89.0)

### 🚀 Enhancements

- **module:** Add internal path check for route generation ([0d1315c](https://github.com/s00d/nuxt-i18n-micro/commit/0d1315c))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.88.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.88.1...v1.88.2)

### 💅 Refactors

- **module:** Improve route generation logic for locales ([5e8f231](https://github.com/s00d/nuxt-i18n-micro/commit/5e8f231))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.88.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.88.0...v1.88.1)

### 🏡 Chore

- **lockfile:** Update `json-editor-vue` and `vanilla-jsoneditor` versions ([ae73ab1](https://github.com/s00d/nuxt-i18n-micro/commit/ae73ab1))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.88.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.87.0...v1.88.0)

### 🚀 Enhancements

- **module:** Check for missing "pages" directory in Nuxt project ([a5c5425](https://github.com/s00d/nuxt-i18n-micro/commit/a5c5425))
- **locale-server-middleware:** Add server middleware for locale detection ([09812f6](https://github.com/s00d/nuxt-i18n-micro/commit/09812f6))

### 🩹 Fixes

- Prefer `nitro.static` over `_generate` ([0fea211](https://github.com/s00d/nuxt-i18n-micro/commit/0fea211))
- **module:** Disable eslint rule for explicit 'any' type usage ([d9660e0](https://github.com/s00d/nuxt-i18n-micro/commit/d9660e0))
- **locale:** Add missing `isFallback` property to locale response ([ff1ab69](https://github.com/s00d/nuxt-i18n-micro/commit/ff1ab69))

### 💅 Refactors

- **module:** Simplify imports and remove pages directory check ([388419e](https://github.com/s00d/nuxt-i18n-micro/commit/388419e))
- **locale-server-middleware:** Improve type assertion for i18n config ([f4dec54](https://github.com/s00d/nuxt-i18n-micro/commit/f4dec54))

### 📖 Documentation

- **guide:** Update `canonicalQueryWhitelist` description for clarity ([f09cb05](https://github.com/s00d/nuxt-i18n-micro/commit/f09cb05))
- **guide:** Update `canonicalQueryWhitelist` description for clarity ([81078d6](https://github.com/s00d/nuxt-i18n-micro/commit/81078d6))

### 🏡 Chore

- Use nullish coalescing ([10b8ae2](https://github.com/s00d/nuxt-i18n-micro/commit/10b8ae2))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))
- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v1.87.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.86.0...v1.87.0)

### 🚀 Enhancements

- **locale-head:** Add query filtering for SEO canonical links ([8ba736d](https://github.com/s00d/nuxt-i18n-micro/commit/8ba736d))

### 🩹 Fixes

- **routes:** Correct method name for retrieving cached content ([a7c4ab5](https://github.com/s00d/nuxt-i18n-micro/commit/a7c4ab5))

### 💅 Refactors

- **tests:** Remove deprecated `test.sh` and integrate tests in Vitest ([5b31255](https://github.com/s00d/nuxt-i18n-micro/commit/5b31255))

### 📖 Documentation

- **performance-results:** Update dependency versions and performance metrics ([b592342](https://github.com/s00d/nuxt-i18n-micro/commit/b592342))
- **guide:** Add documentation for canonicalQueryWhitelist option ([387092b](https://github.com/s00d/nuxt-i18n-micro/commit/387092b))

### ✅ Tests

- **seo:** Add SEO tests for canonical URLs and locale attributes ([98739f5](https://github.com/s00d/nuxt-i18n-micro/commit/98739f5))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.86.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.85.1...v1.86.0)

### 🚀 Enhancements

- **redirects:** Add redirect functionality to i18n plugin ([f95d0a6](https://github.com/s00d/nuxt-i18n-micro/commit/f95d0a6))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.85.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.85.0...v1.85.1)

## v1.85.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.84.1...v1.85.0)

### 🚀 Enhancements

- **page-manager:** Improve route localization handling and structure ([aeafb5e](https://github.com/s00d/nuxt-i18n-micro/commit/aeafb5e))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.84.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.84.0...v1.84.1)

### 💅 Refactors

- **page-manager:** Improve dynamic route detection logic ([b2e8851](https://github.com/s00d/nuxt-i18n-micro/commit/b2e8851))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.84.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.83.4...v1.84.0)

### 🚀 Enhancements

- **page-manager:** Enhance localization handling for dynamic routes ([1eea287](https://github.com/s00d/nuxt-i18n-micro/commit/1eea287))

### ✅ Tests

- **pages-manager:** Enhance tests for localized page structure ([2ed5e91](https://github.com/s00d/nuxt-i18n-micro/commit/2ed5e91))
- **undefault:** Add tests for localized routes in post section pages ([e338443](https://github.com/s00d/nuxt-i18n-micro/commit/e338443))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.83.4

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.83.3...v1.83.4)

### 💅 Refactors

- **module:** Replace `extendPages` with `nuxt.hook('pages:resolved')` ([8108f47](https://github.com/s00d/nuxt-i18n-micro/commit/8108f47))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.83.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.83.2...v1.83.3)

### 🩹 Fixes

- **redirects:** Support no-prefix strategy in redirect handling ([f519509](https://github.com/s00d/nuxt-i18n-micro/commit/f519509))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.83.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.83.1...v1.83.2)

### 🩹 Fixes

- **types:** Allow `unknown` type in `Translation` definition ([85f8d41](https://github.com/s00d/nuxt-i18n-micro/commit/85f8d41))
- **page-manager:** Handle no prefix strategy in route adjustments ([aae20c2](https://github.com/s00d/nuxt-i18n-micro/commit/aae20c2))

### 💅 Refactors

- **types:** Rename `Translation` to `CleanTranslation` and update types ([c814477](https://github.com/s00d/nuxt-i18n-micro/commit/c814477))

### 📖 Documentation

- **$defineI18nRoute:** Clarify use-cases & add performance implications ([0f337dc](https://github.com/s00d/nuxt-i18n-micro/commit/0f337dc))
- **localeRoutes:** Clarify navigation constraints when using localised routes ([cfad775](https://github.com/s00d/nuxt-i18n-micro/commit/cfad775))

### 🏡 Chore

- **release:** V1.83.1 ([fe2ed7b](https://github.com/s00d/nuxt-i18n-micro/commit/fe2ed7b))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))
- Buzut ([@Buzut](http://github.com/Buzut))

## v1.83.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.83.0...v1.83.1)

### 🩹 Fixes

- **types:** Allow `unknown` type in `Translation` definition ([e98d4c9](https://github.com/s00d/nuxt-i18n-micro/commit/e98d4c9))

### 💅 Refactors

- **types:** Remove 'unknown' from Translation type definition ([f5000c9](https://github.com/s00d/nuxt-i18n-micro/commit/f5000c9))
- **types:** Rename `Translation` to `CleanTranslation` and update types ([0eb519e](https://github.com/s00d/nuxt-i18n-micro/commit/0eb519e))

### 📖 Documentation

- **useI18n:** Remove outdated section on page-specific translations ([2e9c7ec](https://github.com/s00d/nuxt-i18n-micro/commit/2e9c7ec))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.83.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.82.0...v1.83.0)

### 🚀 Enhancements

- **i18n:** Add route-aware translation functionality ([cd26b4c](https://github.com/s00d/nuxt-i18n-micro/commit/cd26b4c))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.82.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.81.0...v1.82.0)

### 🚀 Enhancements

- **plugins:** Change has ([55dcb4d](https://github.com/s00d/nuxt-i18n-micro/commit/55dcb4d))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.81.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.80.0...v1.81.0)

### 🚀 Enhancements

- **core:** Add cache clearing functionality for translations ([e50d70a](https://github.com/s00d/nuxt-i18n-micro/commit/e50d70a))

### 📖 Documentation

- **i18n-cache-api:** Add documentation for translation caching and loading ([8e3f426](https://github.com/s00d/nuxt-i18n-micro/commit/8e3f426))
- **i18n-cache-api:** Remove outdated cache clearing example ([9ad49b6](https://github.com/s00d/nuxt-i18n-micro/commit/9ad49b6))
- **i18n-cache-api:** Add instructions for clearing server cache ([902c424](https://github.com/s00d/nuxt-i18n-micro/commit/902c424))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.80.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.79.0...v1.80.0)

### 🚀 Enhancements

- Add fallbackLocale configuration option to locale ([df64d4d](https://github.com/s00d/nuxt-i18n-micro/commit/df64d4d))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.79.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.78.0...v1.79.0)

### 🚀 Enhancements

- **playground:** Add environment configuration for English and German ([97d8fc2](https://github.com/s00d/nuxt-i18n-micro/commit/97d8fc2))

### 💅 Refactors

- **page-manager:** Normalize path joining to use posix method ([a1cedb8](https://github.com/s00d/nuxt-i18n-micro/commit/a1cedb8))

### 📖 Documentation

- **faq:** Clarify cause and solution for translation flickering issue ([7d87ba5](https://github.com/s00d/nuxt-i18n-micro/commit/7d87ba5))
- **faq:** Clarify cause of translation issues during page transitions ([ecb32a3](https://github.com/s00d/nuxt-i18n-micro/commit/ecb32a3))
- **faq:** Update solution for nuxt-i18n-micro page transitions ([b91a423](https://github.com/s00d/nuxt-i18n-micro/commit/b91a423))
- **faq:** Update section on `$fetch` limitations during SSR ([04d9bd8](https://github.com/s00d/nuxt-i18n-micro/commit/04d9bd8))
- **faq:** Add section separator for clarity ([8212ee3](https://github.com/s00d/nuxt-i18n-micro/commit/8212ee3))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.78.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.77.0...v1.78.0)

### 🚀 Enhancements

- **plugins:** Extend translation functions to accept route parameter ([47c4763](https://github.com/s00d/nuxt-i18n-micro/commit/47c4763))

### 📖 Documentation

- **faq:** Add explanation for translation issues during page transitions ([657e06e](https://github.com/s00d/nuxt-i18n-micro/commit/657e06e))
- **api:** Add 'route' parameter to translation method documentation ([87199e1](https://github.com/s00d/nuxt-i18n-micro/commit/87199e1))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.77.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.76.3...v1.77.0)

### 🚀 Enhancements

- **types:** Add noPrefixRedirect option to ModuleOptions ([a491d48](https://github.com/s00d/nuxt-i18n-micro/commit/a491d48))
- **types:** Add noPrefixRedirect option to ModuleOptions ([1c8b1e5](https://github.com/s00d/nuxt-i18n-micro/commit/1c8b1e5))

### 📖 Documentation

- **guide:** Add "Using Translations in Components" guide ([4427221](https://github.com/s00d/nuxt-i18n-micro/commit/4427221))
- **faq:** Add troubleshooting section for build errors on Cloudflare ([4dd1afb](https://github.com/s00d/nuxt-i18n-micro/commit/4dd1afb))
- **vitepress:** Update link for custom auto detect guide ([a2121cc](https://github.com/s00d/nuxt-i18n-micro/commit/a2121cc))
- **guide:** Add `noPrefixRedirect` option to getting started guide ([771cea9](https://github.com/s00d/nuxt-i18n-micro/commit/771cea9))

### ✅ Tests

- **pages-manager:** Add includeDefaultLocaleRoute flag to PageManager ([350d3e1](https://github.com/s00d/nuxt-i18n-micro/commit/350d3e1))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.76.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.76.2...v1.76.3)

### 🩹 Fixes

- **plugins:** Enhance locale route resolution logic ([8bdf47a](https://github.com/s00d/nuxt-i18n-micro/commit/8bdf47a))

### 📖 Documentation

- **custom-auto-detect:** Add guide for custom language detection plugin ([3dbccbf](https://github.com/s00d/nuxt-i18n-micro/commit/3dbccbf))
- **guide:** Update custom auto-detect documentation for clarity ([675b717](https://github.com/s00d/nuxt-i18n-micro/commit/675b717))
- **guide:** Remove unnecessary blank lines in custom auto-detect guide ([3868e78](https://github.com/s00d/nuxt-i18n-micro/commit/3868e78))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.76.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.76.1...v1.76.2)

### 💅 Refactors

- **plugins:** Consolidate imports from '#app' into '#imports' ([4026e0b](https://github.com/s00d/nuxt-i18n-micro/commit/4026e0b))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.76.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.76.0...v1.76.1)

### 💅 Refactors

- **module:** Simplify route rule handling in nitroConfig ([5c974b0](https://github.com/s00d/nuxt-i18n-micro/commit/5c974b0))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.76.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.75.0...v1.76.0)

### 🚀 Enhancements

- **module:** Update routing strategy to support prefix_except_default ([14db8a7](https://github.com/s00d/nuxt-i18n-micro/commit/14db8a7))
- **client:** Add client-only page with SSR disabled ([e3c650f](https://github.com/s00d/nuxt-i18n-micro/commit/e3c650f))
- **pages:** Add old product redirect page ([45d7a01](https://github.com/s00d/nuxt-i18n-micro/commit/45d7a01))
- **locales:** Add initial locale files for client and old-product ([898f987](https://github.com/s00d/nuxt-i18n-micro/commit/898f987))

### 🩹 Fixes

- **module:** Improve route rule handling for prefix strategies ([302e002](https://github.com/s00d/nuxt-i18n-micro/commit/302e002))
- **module:** Prevent processing of API routes in route rules ([b700706](https://github.com/s00d/nuxt-i18n-micro/commit/b700706))

### 📖 Documentation

- **guide:** Update default value for `strategy` option in documentation ([2e060b7](https://github.com/s00d/nuxt-i18n-micro/commit/2e060b7))

### 🏡 Chore

- **locales:** Add empty JSON files for language localization ([100724d](https://github.com/s00d/nuxt-i18n-micro/commit/100724d))

### ✅ Tests

- **basic:** Add tests for client-only rendering and redirection ([c65428e](https://github.com/s00d/nuxt-i18n-micro/commit/c65428e))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.75.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.74.0...v1.75.0)

### 🚀 Enhancements

- **playground:** Add no prefix strategy test page ([2e80c5c](https://github.com/s00d/nuxt-i18n-micro/commit/2e80c5c))

### 🩹 Fixes

- **route-service:** Ensure route starts with a leading slash ([86284fb](https://github.com/s00d/nuxt-i18n-micro/commit/86284fb))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.74.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.73.0...v1.74.0)

### 🚀 Enhancements

- **docs:** Update Storybook guide with new translation merging logic ([592aa6d](https://github.com/s00d/nuxt-i18n-micro/commit/592aa6d))

### 🩹 Fixes

- **routes:** Clear storage cache for specific locale keys ([393b3da](https://github.com/s00d/nuxt-i18n-micro/commit/393b3da))

### 📖 Documentation

- **news:** Update release notes for v1.73.0 DevTools enhancements ([8d70a5f](https://github.com/s00d/nuxt-i18n-micro/commit/8d70a5f))
- **news:** Update new features list format in release notes ([dca188c](https://github.com/s00d/nuxt-i18n-micro/commit/dca188c))
- **news:** Update feature name from "Built-in Translator" to "Online Translator" ([70a64f7](https://github.com/s00d/nuxt-i18n-micro/commit/70a64f7))

### 🏡 Chore

- **pnpm:** Clean up `pnpm-lock.yaml` by removing unused dependencies ([06860df](https://github.com/s00d/nuxt-i18n-micro/commit/06860df))
- **stackblitz:** Add configuration for Stackblitz environment ([fd58131](https://github.com/s00d/nuxt-i18n-micro/commit/fd58131))
- **config:** Restore `stackblitz` configuration in `package.json` ([8c85739](https://github.com/s00d/nuxt-i18n-micro/commit/8c85739))
- **config:** Update start command to use PORT=80 for development ([4bf7959](https://github.com/s00d/nuxt-i18n-micro/commit/4bf7959))
- **stackblitz:** Update startCommand and add .stackblitzrc file ([03edeae](https://github.com/s00d/nuxt-i18n-micro/commit/03edeae))
- **package.json:** Remove StackBlitz start command ([280a0cc](https://github.com/s00d/nuxt-i18n-micro/commit/280a0cc))
- **package.json:** Add StackBlitz configuration for project setup ([94ddf4d](https://github.com/s00d/nuxt-i18n-micro/commit/94ddf4d))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.73.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.72.0...v1.73.0)

### 🚀 Enhancements

- **devtools:** Add getConfigs function to ServerFunctions interface ([be0fe96](https://github.com/s00d/nuxt-i18n-micro/commit/be0fe96))
- **files:** Replace button with NButton for improved styling ([938a2ce](https://github.com/s00d/nuxt-i18n-micro/commit/938a2ce))
- **locales:** Update search input and enhance empty state display ([a5b6d43](https://github.com/s00d/nuxt-i18n-micro/commit/a5b6d43))
- **components:** Add DiffViewer component for translation changes ([fa019f1](https://github.com/s00d/nuxt-i18n-micro/commit/fa019f1))
- **components:** Add JSON editor component for translation management ([174c5b8](https://github.com/s00d/nuxt-i18n-micro/commit/174c5b8))
- **components:** Add loader component for loading state indication ([89a16b0](https://github.com/s00d/nuxt-i18n-micro/commit/89a16b0))
- **components:** Add Modal component with customizable options ([18cce48](https://github.com/s00d/nuxt-i18n-micro/commit/18cce48))
- **components:** Add pagination component with navigation buttons ([8777ddf](https://github.com/s00d/nuxt-i18n-micro/commit/8777ddf))
- **statistics:** Add statistics component for translation analysis ([e799bdb](https://github.com/s00d/nuxt-i18n-micro/commit/e799bdb))
- **components:** Add StatItem component for displaying statistics ([d2988c7](https://github.com/s00d/nuxt-i18n-micro/commit/d2988c7))
- **tabs:** Add tabs component with active tab functionality ([f002bc2](https://github.com/s00d/nuxt-i18n-micro/commit/f002bc2))
- **translation-editor:** Add translation editor component ([6c773a9](https://github.com/s00d/nuxt-i18n-micro/commit/6c773a9))
- **store:** Add internationalization store with translation handling ([4229808](https://github.com/s00d/nuxt-i18n-micro/commit/4229808))
- **i18n:** Add utility functions for flattening and unflattening translations ([938f554](https://github.com/s00d/nuxt-i18n-micro/commit/938f554))
- **translator:** Add Translator class with multiple translation APIs ([50c41f4](https://github.com/s00d/nuxt-i18n-micro/commit/50c41f4))
- **config:** Add ConfigView component for managing application settings ([5026c92](https://github.com/s00d/nuxt-i18n-micro/commit/5026c92))
- **i18n:** Add I18nView component for translation management ([8df5b9c](https://github.com/s00d/nuxt-i18n-micro/commit/8df5b9c))
- **settings:** Add settings view for editor and auto-translation configuration ([9004d0c](https://github.com/s00d/nuxt-i18n-micro/commit/9004d0c))
- **app:** Implement tab navigation for i18n, settings, and config views ([f6aac9e](https://github.com/s00d/nuxt-i18n-micro/commit/f6aac9e))
- **types:** Add types for JSON values and translation content ([d57ae91](https://github.com/s00d/nuxt-i18n-micro/commit/d57ae91))
- **components:** Add imports for `computed` and `ref` in `DiffViewer.vue` ([b63eeaa](https://github.com/s00d/nuxt-i18n-micro/commit/b63eeaa))
- **devtools:** Update translation functions to simplify file structure ([c0cb353](https://github.com/s00d/nuxt-i18n-micro/commit/c0cb353))
- **i18n-view:** Update locale and file selection handling ([71c7e8a](https://github.com/s00d/nuxt-i18n-micro/commit/71c7e8a))
- **locales:** Implement file tree structure for locales selection ([07ea486](https://github.com/s00d/nuxt-i18n-micro/commit/07ea486))

### 🩹 Fixes

- **alternate link:** Add current slug to the base url. Replace "indexUrl" with "baseUrl + fullPath" for the alternate link ([6633e23](https://github.com/s00d/nuxt-i18n-micro/commit/6633e23))
- **loader:** Correct self-closing tag for loader-circle component ([57eaf2c](https://github.com/s00d/nuxt-i18n-micro/commit/57eaf2c))
- **StatItem:** Correct default value syntax in stacked property ([8118a2b](https://github.com/s00d/nuxt-i18n-micro/commit/8118a2b))
- **app:** Remove unused `selectedLocale` variable ([27be660](https://github.com/s00d/nuxt-i18n-micro/commit/27be660))
- **TranslationEditor:** Update translation key extraction logic ([56354d2](https://github.com/s00d/nuxt-i18n-micro/commit/56354d2))

### 💅 Refactors

- **alternate link:** Remove unused variable ([1a863bb](https://github.com/s00d/nuxt-i18n-micro/commit/1a863bb))
- **components:** Remove `FilesList.vue` component ([f39fe8d](https://github.com/s00d/nuxt-i18n-micro/commit/f39fe8d))
- **types:** Simplify `LocaleData` and add `TreeNode` interface ([a0520b7](https://github.com/s00d/nuxt-i18n-micro/commit/a0520b7))
- **i18n:** Simplify locale handling and remove unused variables ([3908072](https://github.com/s00d/nuxt-i18n-micro/commit/3908072))

### 📖 Documentation

- **news:** Update release notes for Nuxt I18n Micro v1.73.0 ([4c88007](https://github.com/s00d/nuxt-i18n-micro/commit/4c88007))

### 🏡 Chore

- **tests:** Update devDependencies in package.json for hub-i18n ([6355570](https://github.com/s00d/nuxt-i18n-micro/commit/6355570))
- **test/fixtures/i18n:** Update `@nuxtjs/i18n` version to `9.1.3` ([84b510e](https://github.com/s00d/nuxt-i18n-micro/commit/84b510e))
- **sitemap:** Update dev dependency for @nuxtjs/sitemap to v7.2.3 ([2c028e8](https://github.com/s00d/nuxt-i18n-micro/commit/2c028e8))
- **client:** Add nuxt-i18n-micro-types as a dependency ([db69062](https://github.com/s00d/nuxt-i18n-micro/commit/db69062))

### 🎨 Styles

- **modal:** Remove unnecessary blank line in scoped styles ([76a43fe](https://github.com/s00d/nuxt-i18n-micro/commit/76a43fe))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))
- TristanSurGithub ([@TristanSurGithub](https://github.com/TristanSurGithub))

## v1.72.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.71.0...v1.72.0)

### 🚀 Enhancements

- **pages, components:** Add translation support using useNuxtApp ([ae524f8](https://github.com/s00d/nuxt-i18n-micro/commit/ae524f8))
- **translation:** Improve translation fallback mechanism ([41b8719](https://github.com/s00d/nuxt-i18n-micro/commit/41b8719))

### 🩹 Fixes

- **seo url - slash:** Remove end slash for the canonical link ([28d2aa2](https://github.com/s00d/nuxt-i18n-micro/commit/28d2aa2))
- **useLocaleHead:** Prevent incorrect hreflang links for locales ([7b8a5d4](https://github.com/s00d/nuxt-i18n-micro/commit/7b8a5d4))

### 💅 Refactors

- **seo url - slash:** Edit let to const for "indexUrl" variable ([58b14c9](https://github.com/s00d/nuxt-i18n-micro/commit/58b14c9))

### 🏡 Chore

- **package:** Update clean script and dependencies in package.json ([c28cb9a](https://github.com/s00d/nuxt-i18n-micro/commit/c28cb9a))
- **core:** Bump version to 1.0.16 in `package.json` ([ca578e8](https://github.com/s00d/nuxt-i18n-micro/commit/ca578e8))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))
- TristanSurGithub ([@TristanSurGithub](https://github.com/TristanSurGithub))

## v1.71.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.70.0...v1.71.0)

### 🚀 Enhancements

- **types:** Add hooks and customRegexMatcher properties ([fb616f3](https://github.com/s00d/nuxt-i18n-micro/commit/fb616f3))
- **playground:** Add initialization and type check scripts to package.json ([c8a0d96](https://github.com/s00d/nuxt-i18n-micro/commit/c8a0d96))
- **plugins:** Update getLocale method to accept route parameter ([0b993b4](https://github.com/s00d/nuxt-i18n-micro/commit/0b993b4))
- **i18n:** Add hooks for dynamic translation registration ([69da871](https://github.com/s00d/nuxt-i18n-micro/commit/69da871))
- **module:** Add hooks support to i18n configuration ([4202ca2](https://github.com/s00d/nuxt-i18n-micro/commit/4202ca2))
- **tests:** Add new scripts for type checking and initialization ([093296b](https://github.com/s00d/nuxt-i18n-micro/commit/093296b))

### 🩹 Fixes

- **meta:** Remove unnecessary early return in meta plugin ([e59bf2b](https://github.com/s00d/nuxt-i18n-micro/commit/e59bf2b))
- **define:** Update `locales` type to use `LocalesObject` ([30087db](https://github.com/s00d/nuxt-i18n-micro/commit/30087db))
- **get:** Simplify config destructuring in get.ts ([6c4a718](https://github.com/s00d/nuxt-i18n-micro/commit/6c4a718))

### 💅 Refactors

- **plugins:** Remove redundant i18n hook registration logic ([8c7a1f1](https://github.com/s00d/nuxt-i18n-micro/commit/8c7a1f1))

### 📖 Documentation

- **faq:** Remove outdated troubleshooting information for I18n plugin ([983d1fa](https://github.com/s00d/nuxt-i18n-micro/commit/983d1fa))
- **guide:** Add hooks configuration section to getting started guide ([662d402](https://github.com/s00d/nuxt-i18n-micro/commit/662d402))

### 🏡 Chore

- **playground:** Remove unused nuxt-cookie-control module ([6c4a981](https://github.com/s00d/nuxt-i18n-micro/commit/6c4a981))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.70.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.69.0...v1.70.0)

### 🚀 Enhancements

- **plugins:** Add i18n registration hook to custom plugin ([9bd9e37](https://github.com/s00d/nuxt-i18n-micro/commit/9bd9e37))

### 🩹 Fixes

- **plugin:** Update type for route location in translation functions ([88d92b0](https://github.com/s00d/nuxt-i18n-micro/commit/88d92b0))

### 📖 Documentation

- **faq:** Add explanation for I18n Micro plugin issues in Nuxt ([d4c49e5](https://github.com/s00d/nuxt-i18n-micro/commit/d4c49e5))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.69.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.68.0...v1.69.0)

### 🚀 Enhancements

- **plugins:** Update route type handling in locale functions ([620a3ca](https://github.com/s00d/nuxt-i18n-micro/commit/620a3ca))
- **i18n-link:** Enhance `to` prop type for improved routing support ([ef2d320](https://github.com/s00d/nuxt-i18n-micro/commit/ef2d320))
- **content:** Update configuration and enhance content handling ([68fb0da](https://github.com/s00d/nuxt-i18n-micro/commit/68fb0da))

### 💅 Refactors

- **route-service:** Improve route type handling in locale functions ([037d4bc](https://github.com/s00d/nuxt-i18n-micro/commit/037d4bc))

### 🏡 Chore

- **changelog:** Rm ([9852e9c](https://github.com/s00d/nuxt-i18n-micro/commit/9852e9c))
- **test/fixtures/hub-i18n:** Update `wrangler` dependency version ([31163f4](https://github.com/s00d/nuxt-i18n-micro/commit/31163f4))
- **test/fixtures/hub-i18n:** Update `wrangler` dependency version ([ddad464](https://github.com/s00d/nuxt-i18n-micro/commit/ddad464))
- **test/fixtures:** Remove unused devDependencies from package.json ([4896407](https://github.com/s00d/nuxt-i18n-micro/commit/4896407))
- **playground:** Update `nuxt-i18n-micro` to version `v1.68.0` ([9b4752a](https://github.com/s00d/nuxt-i18n-micro/commit/9b4752a))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.67.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.67.0...v1.67.1)

### 💅 Refactors

- **server:** Simplify server storage initialization in `get.ts` ([966290d](https://github.com/s00d/nuxt-i18n-micro/commit/966290d))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.67.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.66.0...v1.67.0)

### 🚀 Enhancements

- **module:** Add i18n-locales storage configuration ([71d736c](https://github.com/s00d/nuxt-i18n-micro/commit/71d736c))

### 💅 Refactors

- **module:** Remove redundant nitroConfig.devStorage assignment ([9f4ca5d](https://github.com/s00d/nuxt-i18n-micro/commit/9f4ca5d))
- **module:** Remove Vercel preset check and update storage config ([426037f](https://github.com/s00d/nuxt-i18n-micro/commit/426037f))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.66.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.65.3...v1.66.0)

### 🚀 Enhancements

- **nitro:** Add support for Vercel deployment presets ([d859a35](https://github.com/s00d/nuxt-i18n-micro/commit/d859a35))
- **playground:** Add script to measure build execution time ([ca1c831](https://github.com/s00d/nuxt-i18n-micro/commit/ca1c831))

### 💅 Refactors

- **plugins:** Update `$t` method signature to allow null defaultValue ([8511f03](https://github.com/s00d/nuxt-i18n-micro/commit/8511f03))

### 🏡 Chore

- **config:** Disable devtools in various `nuxt.config.ts` files ([f728eeb](https://github.com/s00d/nuxt-i18n-micro/commit/f728eeb))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.65.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.65.2...v1.65.3)

### 🩹 Fixes

- `$has` always returns `true` ([2af97f1](https://github.com/s00d/nuxt-i18n-micro/commit/2af97f1))

### 📖 Documentation

- **storybook:** Add integration guide for Nuxt, Storybook, and nuxt-i18n ([2ea2029](https://github.com/s00d/nuxt-i18n-micro/commit/2ea2029))
- **guide:** Update storybook integration guide title and content ([b418899](https://github.com/s00d/nuxt-i18n-micro/commit/b418899))

### 🏡 Chore

- **ci:** Reorder commands in CI workflow ([0a27650](https://github.com/s00d/nuxt-i18n-micro/commit/0a27650))
- **playground:** Update `nuxt-i18n-micro` to version `v1.65.2` ([7234d2d](https://github.com/s00d/nuxt-i18n-micro/commit/7234d2d))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))
- 김용건 (Kim Younggeon) <[dungsil](https://github.com/dungsil)>

## v1.65.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.65.1...v1.65.2)

### 🏡 Chore

- **scripts:** Update release process to use prepack script ([3145219](https://github.com/s00d/nuxt-i18n-micro/commit/3145219))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.65.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.65.0...v1.65.1)

### 🩹 Fixes

- **test/fixtures:** Correct import path for Strategies type ([2e1488e](https://github.com/s00d/nuxt-i18n-micro/commit/2e1488e))

### 💅 Refactors

- **plugins:** Remove redundant i18n properties from global config ([546bb09](https://github.com/s00d/nuxt-i18n-micro/commit/546bb09))

### 📖 Documentation

- **news:** Add announcement for major release v1.65.0 ([130a43d](https://github.com/s00d/nuxt-i18n-micro/commit/130a43d))
- **news:** Update release date for v1.65.0 announcement ([dbc82d8](https://github.com/s00d/nuxt-i18n-micro/commit/dbc82d8))
- **news:** Update release notes for v1.65.0 ([c1f8d79](https://github.com/s00d/nuxt-i18n-micro/commit/c1f8d79))

### 🏡 Chore

- **package:** Update postinstall script and add client:prepare script ([a00afa7](https://github.com/s00d/nuxt-i18n-micro/commit/a00afa7))
- **docs:** Remove prepack step from documentation workflow ([4da51f0](https://github.com/s00d/nuxt-i18n-micro/commit/4da51f0))
- **package:** Add postinstall script to release process ([582e0c8](https://github.com/s00d/nuxt-i18n-micro/commit/582e0c8))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.65.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.64.0...v1.65.0)

### 🚀 Enhancements

- **types:** Add TypeScript types and configuration for nuxt-i18n ([026964d](https://github.com/s00d/nuxt-i18n-micro/commit/026964d))
- **playground:** Refactor localization handling in index.vue ([0fa4e65](https://github.com/s00d/nuxt-i18n-micro/commit/0fa4e65))
- **locale-redirect:** Implement client-side redirection logic ([de2537a](https://github.com/s00d/nuxt-i18n-micro/commit/de2537a))
- **useLocaleHead:** Update imports and enhance alternate links handling ([a1059e8](https://github.com/s00d/nuxt-i18n-micro/commit/a1059e8))
- **runtime/plugins:** Refactor translation handling and route services ([630e6cd](https://github.com/s00d/nuxt-i18n-micro/commit/630e6cd))
- **module:** Enhance type imports and refactor strategy checks ([1b2c8c6](https://github.com/s00d/nuxt-i18n-micro/commit/1b2c8c6))
- **tests:** Add automated testing script for URL strategies ([e5212a5](https://github.com/s00d/nuxt-i18n-micro/commit/e5212a5))

### 🩹 Fixes

- **i18n-t:** Update import path for PluralFunc type ([0afe21a](https://github.com/s00d/nuxt-i18n-micro/commit/0afe21a))
- **meta:** Update import path for `ModuleOptionsExtend` type ([788242c](https://github.com/s00d/nuxt-i18n-micro/commit/788242c))
- **routes:** Update import path for translation types ([5698723](https://github.com/s00d/nuxt-i18n-micro/commit/5698723))
- **translation-server-middleware:** Update import path for types ([4296fd2](https://github.com/s00d/nuxt-i18n-micro/commit/4296fd2))
- **playwright:** Update testMatch pattern from `*.test.ts` to `*.spec.ts` ([d533c57](https://github.com/s00d/nuxt-i18n-micro/commit/d533c57))
- **format-service:** Return "0 seconds ago" for invalid dates ([f937113](https://github.com/s00d/nuxt-i18n-micro/commit/f937113))
- **test-utils:** Suppress TypeScript error in nuxt.config.ts ([24fc45d](https://github.com/s00d/nuxt-i18n-micro/commit/24fc45d))

### 💅 Refactors

- **test-utils:** Update import path for translation types ([f2ed77a](https://github.com/s00d/nuxt-i18n-micro/commit/f2ed77a))
- **core:** Remove unused types and update imports ([0ca337c](https://github.com/s00d/nuxt-i18n-micro/commit/0ca337c))
- **runtime/plugins:** Streamline locale handling in Nuxt plugin ([2dffdc5](https://github.com/s00d/nuxt-i18n-micro/commit/2dffdc5))
- **plugins:** Update import paths for type definitions and helpers ([c36b4c2](https://github.com/s00d/nuxt-i18n-micro/commit/c36b4c2))
- **helpers:** Remove unused strategy helper functions ([89a1db8](https://github.com/s00d/nuxt-i18n-micro/commit/89a1db8))
- **devtools:** Update import path for type definitions ([09de011](https://github.com/s00d/nuxt-i18n-micro/commit/09de011))
- **locale-manager:** Update import path for types module ([7bde673](https://github.com/s00d/nuxt-i18n-micro/commit/7bde673))
- **page-manager:** Update import paths for types and utilities ([d317be1](https://github.com/s00d/nuxt-i18n-micro/commit/d317be1))
- **utils:** Update Locale and LocaleCode imports for consistency ([e3acdbf](https://github.com/s00d/nuxt-i18n-micro/commit/e3acdbf))
- **tests:** Replace old test files with updated spec files ([03f5ba0](https://github.com/s00d/nuxt-i18n-micro/commit/03f5ba0))

### 📖 Documentation

- **contribution:** Update build instructions in contribution guide ([13d2d7c](https://github.com/s00d/nuxt-i18n-micro/commit/13d2d7c))
- **performance-results:** Update test script location and performance metrics ([2a7d863](https://github.com/s00d/nuxt-i18n-micro/commit/2a7d863))
- **guide:** Add known issues and best practices for locale strategies ([d1a10f3](https://github.com/s00d/nuxt-i18n-micro/commit/d1a10f3))
- **core:** Update README to include formatting and routing utilities ([5b10997](https://github.com/s00d/nuxt-i18n-micro/commit/5b10997))
- **performance-results:** Update performance metrics for i18n and i18n-micro ([5b779bc](https://github.com/s00d/nuxt-i18n-micro/commit/5b779bc))

### 🏡 Chore

- **types:** Add MIT license and types for Jest ([4c12699](https://github.com/s00d/nuxt-i18n-micro/commit/4c12699))
- **types:** Update test script to indicate no tests are specified ([11f0978](https://github.com/s00d/nuxt-i18n-micro/commit/11f0978))
- **playwright:** Rename performance test file to use .spec.ts extension ([e9e5e95](https://github.com/s00d/nuxt-i18n-micro/commit/e9e5e95))

### ✅ Tests

- Add comprehensive unit tests for format and route services ([80ca6d6](https://github.com/s00d/nuxt-i18n-micro/commit/80ca6d6))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.64.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.63.2...v1.64.0)

### 🚀 Enhancements

- **page-manager:** Add support for no-prefix localization strategy ([aa7e4ab](https://github.com/s00d/nuxt-i18n-micro/commit/aa7e4ab))
- **utils:** Add buildFullPathNoPrefix utility function ([316e859](https://github.com/s00d/nuxt-i18n-micro/commit/316e859))
- **runtime:** Add no-prefix strategy check for locale setting ([6dacb39](https://github.com/s00d/nuxt-i18n-micro/commit/6dacb39))
- **locales:** Add internationalization support for contact and about pages ([a53efe1](https://github.com/s00d/nuxt-i18n-micro/commit/a53efe1))

### 🩹 Fixes

- **i18n:** Adjust locale assignment based on prefix strategy ([979e50d](https://github.com/s00d/nuxt-i18n-micro/commit/979e50d))
- **auto-detect:** Correct locale parameter handling in route resolution ([515438b](https://github.com/s00d/nuxt-i18n-micro/commit/515438b))

### 💅 Refactors

- **module:** Reorder conditional checks for improved readability ([1db1919](https://github.com/s00d/nuxt-i18n-micro/commit/1db1919))

### 📖 Documentation

- **guide:** Clarify no_prefix strategy limitations in locale detection ([153a9be](https://github.com/s00d/nuxt-i18n-micro/commit/153a9be))

### 🏡 Chore

- **release:** Bump version for test-utils and core packages ([4d60cee](https://github.com/s00d/nuxt-i18n-micro/commit/4d60cee))
- **release:** Bump version for test-utils and core packages ([3374627](https://github.com/s00d/nuxt-i18n-micro/commit/3374627))
- **workflows:** Update prepack step to build packages before packing ([2a30928](https://github.com/s00d/nuxt-i18n-micro/commit/2a30928))

### ✅ Tests

- **pages:** Add tests for no_prefix strategy and localized paths ([c8cf997](https://github.com/s00d/nuxt-i18n-micro/commit/c8cf997))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.63.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.63.1...v1.63.2)

## v1.63.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.63.0...v1.63.1)

## v1.63.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.62.0...v1.63.0)

### 🚀 Enhancements

- **i18n:** Enhance locale handling with new helper functions ([3d9e227](https://github.com/s00d/nuxt-i18n-micro/commit/3d9e227))
- **locale:** Add support for multiple locales in `useLocaleHead` ([feff1be](https://github.com/s00d/nuxt-i18n-micro/commit/feff1be))
- **translation:** Update translation helper to support locale parameter ([1349e89](https://github.com/s00d/nuxt-i18n-micro/commit/1349e89))
- **test-utils:** Improve locale handling in translation utilities ([991dbc2](https://github.com/s00d/nuxt-i18n-micro/commit/991dbc2))

### 🩹 Fixes

- **module:** Ignore TypeScript error for metaBaseUrl option ([385a61c](https://github.com/s00d/nuxt-i18n-micro/commit/385a61c))

### 💅 Refactors

- **translation-server-middleware:** Streamline translation helper usage ([9994135](https://github.com/s00d/nuxt-i18n-micro/commit/9994135))

### 🏡 Chore

- **playground:** Update `nuxt-i18n-micro` to version `v1.62.0` ([74bde99](https://github.com/s00d/nuxt-i18n-micro/commit/74bde99))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.62.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.61.0...v1.62.0)

### 🚀 Enhancements

- **routes:** Add server route handler for i18n translations ([0b96c2e](https://github.com/s00d/nuxt-i18n-micro/commit/0b96c2e))
- **module:** Add deepMerge function for recursive object merging ([169f864](https://github.com/s00d/nuxt-i18n-micro/commit/169f864))
- **contact:** Add contact page with localized routes ([05fe922](https://github.com/s00d/nuxt-i18n-micro/commit/05fe922))
- **scripts:** Add artillery test script for performance testing ([ca5fcdf](https://github.com/s00d/nuxt-i18n-micro/commit/ca5fcdf))
- **locales:** Add initial localization files for contact page ([e2be027](https://github.com/s00d/nuxt-i18n-micro/commit/e2be027))

### 🩹 Fixes

- **ui:** Add assets ([35d182e](https://github.com/s00d/nuxt-i18n-micro/commit/35d182e))
- **plugins:** Update URL construction for translation data fetching ([2d76c74](https://github.com/s00d/nuxt-i18n-micro/commit/2d76c74))
- **devtools:** Prevent error when index.html does not exist ([b6eef10](https://github.com/s00d/nuxt-i18n-micro/commit/b6eef10))
- **config:** Restore compatibilityDate in fallback locale config ([b83e123](https://github.com/s00d/nuxt-i18n-micro/commit/b83e123))
- **routes:** Suppress TypeScript error in get.ts ([56d3a7f](https://github.com/s00d/nuxt-i18n-micro/commit/56d3a7f))

### 💅 Refactors

- **i18n-loader:** Remove unused translation loader middleware ([691b3ce](https://github.com/s00d/nuxt-i18n-micro/commit/691b3ce))

### 📖 Documentation

- **guide:** Update available strategies section in strategy.md ([cdb44e0](https://github.com/s00d/nuxt-i18n-micro/commit/cdb44e0))
- **guide:** Add instructions for setting default locale using env variable ([298d02f](https://github.com/s00d/nuxt-i18n-micro/commit/298d02f))
- **performance-results:** Update performance metrics and dependencies ([6b33280](https://github.com/s00d/nuxt-i18n-micro/commit/6b33280))

### 🏡 Chore

- **test/fixtures:** Update package versions in fixture files ([3113ff6](https://github.com/s00d/nuxt-i18n-micro/commit/3113ff6))

### ✅ Tests

- **performance:** Update stress test function to include name parameter ([dd6ab7d](https://github.com/s00d/nuxt-i18n-micro/commit/dd6ab7d))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.61.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.60.0...v1.61.0)

### 🚀 Enhancements

- **i18n:** Add mergeGlobalTranslations method for global translation ([35535d8](https://github.com/s00d/nuxt-i18n-micro/commit/35535d8))
- **components:** Add `useNuxtApp` import to `test.vue` ([615a5b4](https://github.com/s00d/nuxt-i18n-micro/commit/615a5b4))

### 🩹 Fixes

- **plugins:** Rename translation merge function for clarity ([98a67ed](https://github.com/s00d/nuxt-i18n-micro/commit/98a67ed))

### 💅 Refactors

- **page-manager:** Remove unnecessary `rootDir` parameter ([e2dc7d8](https://github.com/s00d/nuxt-i18n-micro/commit/e2dc7d8))

### ✅ Tests

- **locale:** Add tests for component text in English and German ([3a780c6](https://github.com/s00d/nuxt-i18n-micro/commit/3a780c6))
- **pages-manager:** Remove unused `rootDir` parameter from tests ([a3d405a](https://github.com/s00d/nuxt-i18n-micro/commit/a3d405a))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.60.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.59.1...v1.60.0)

### 🚀 Enhancements

- **module:** Add disableUpdater option for build process control #100 ([#100](https://github.com/s00d/nuxt-i18n-micro/issues/100))

### 📖 Documentation

- **guide:** Add disableUpdater option to getting started guide ([543bbcf](https://github.com/s00d/nuxt-i18n-micro/commit/543bbcf))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.59.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.59.0...v1.59.1)

### 💅 Refactors

- **plugins:** Rename parameter for clarity in switchRoute method ([b380c69](https://github.com/s00d/nuxt-i18n-micro/commit/b380c69))
- **content:** Add class names to i18n keypaths for styling ([5e14a0f](https://github.com/s00d/nuxt-i18n-micro/commit/5e14a0f))
- **playground:** Update nuxt-i18n-micro to version v1.59.0 ([ab96274](https://github.com/s00d/nuxt-i18n-micro/commit/ab96274))

### 📖 Documentation

- **i18n-t:** Update pluralization example in documentation ([1e42d2d](https://github.com/s00d/nuxt-i18n-micro/commit/1e42d2d))
- **guide:** Remove unnecessary outline comments and add example routes ([7785304](https://github.com/s00d/nuxt-i18n-micro/commit/7785304))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.59.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.58.0...v1.59.0)

### 🚀 Enhancements

- **i18n:** Add relative time formatting function ([b40adfc](https://github.com/s00d/nuxt-i18n-micro/commit/b40adfc))
- **i18n-t:** Add support for number, date, and relativeDate props ([1fe187e](https://github.com/s00d/nuxt-i18n-micro/commit/1fe187e))
- **page:** Add new date formatting function `$tdr` ([bc3bf8c](https://github.com/s00d/nuxt-i18n-micro/commit/bc3bf8c))

### 🩹 Fixes

- **docs:** Correct path for NewsCard import in news index ([630fbe0](https://github.com/s00d/nuxt-i18n-micro/commit/630fbe0))
- **plugins:** Add handling for no prefix strategy in navigation ([983bd50](https://github.com/s00d/nuxt-i18n-micro/commit/983bd50))

### 📖 Documentation

- **news:** Fix links to ensure proper navigation ([7b8bbcf](https://github.com/s00d/nuxt-i18n-micro/commit/7b8bbcf))
- **i18n-t:** Update documentation with new props for number and date ([a46de1f](https://github.com/s00d/nuxt-i18n-micro/commit/a46de1f))
- **api:** Add new methods `$tn` and `$tdr` for number and date formatting ([afc4e5c](https://github.com/s00d/nuxt-i18n-micro/commit/afc4e5c))
- **examples:** Add usage examples for `$tn` and `$tdr` functions ([c30dddb](https://github.com/s00d/nuxt-i18n-micro/commit/c30dddb))

### 🏡 Chore

- **docs:** Remove outdated news components and related files ([f1fd121](https://github.com/s00d/nuxt-i18n-micro/commit/f1fd121))

### ✅ Tests

- **locale:** Enhance pluralization and formatting for multiple locales ([1631bd2](https://github.com/s00d/nuxt-i18n-micro/commit/1631bd2))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.58.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.57.1...v1.58.0)

### 🚀 Enhancements

- **i18n-loader:** Improve deep merge function and refactor translation loading ([73df4cd](https://github.com/s00d/nuxt-i18n-micro/commit/73df4cd))
- **playground:** Disable appManifest in experimental settings ([e57c29b](https://github.com/s00d/nuxt-i18n-micro/commit/e57c29b))
- **docs:** Add news cards for new features and performance updates ([2449173](https://github.com/s00d/nuxt-i18n-micro/commit/2449173))
- **i18n:** Add support for pluralization in translations ([b27f442](https://github.com/s00d/nuxt-i18n-micro/commit/b27f442))

### 💅 Refactors

- **module:** Format import statements for better readability ([0cd6a3c](https://github.com/s00d/nuxt-i18n-micro/commit/0cd6a3c))

### 📖 Documentation

- **README:** Update performance metrics for Nuxt I18n v9 ([352eb62](https://github.com/s00d/nuxt-i18n-micro/commit/352eb62))
- **performance-results:** Update performance metrics for nuxt-i18n-micro ([365c521](https://github.com/s00d/nuxt-i18n-micro/commit/365c521))
- **readme:** Update performance metrics for Nuxt I18n comparison ([3050b83](https://github.com/s00d/nuxt-i18n-micro/commit/3050b83))

### 🏡 Chore

- **playground:** Update `nuxt-i18n-micro` to version `1.57.1` ([141c2ea](https://github.com/s00d/nuxt-i18n-micro/commit/141c2ea))

### ✅ Tests

- **translations:** Add global translation checks in basic tests ([498150f](https://github.com/s00d/nuxt-i18n-micro/commit/498150f))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.57.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.57.0...v1.57.1)

### 🏡 Chore

- **pnpm-lock:** Update nuxt-i18n-micro and related packages ([87d1d9b](https://github.com/s00d/nuxt-i18n-micro/commit/87d1d9b))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.57.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.56.1...v1.57.0)

### 🚀 Enhancements

- **external link:** Add "tel:" and "mailto:" in regex external link ([83c39e6](https://github.com/s00d/nuxt-i18n-micro/commit/83c39e6))
- **core:** Replace object caches with Map for improved performance ([8523707](https://github.com/s00d/nuxt-i18n-micro/commit/8523707))
- **i18n:** Enhance locale switching with fromLocale parameter ([b2fda74](https://github.com/s00d/nuxt-i18n-micro/commit/b2fda74))

### 🩹 Fixes

- **router:** Simplify locale change detection in navigation guard ([dcc2932](https://github.com/s00d/nuxt-i18n-micro/commit/dcc2932))
- **i18n:** Pass locale to getRouteName in multiple instances ([4b13b4f](https://github.com/s00d/nuxt-i18n-micro/commit/4b13b4f))

### 💅 Refactors

- **test-utils:** Simplify locale handling by using i18nHelper ([0fb3220](https://github.com/s00d/nuxt-i18n-micro/commit/0fb3220))
- **plugins:** Simplify locale handling and improve code readability ([be7af49](https://github.com/s00d/nuxt-i18n-micro/commit/be7af49))
- **plugins:** Reorder imports in `02.meta.ts` for consistency ([426e8b3](https://github.com/s00d/nuxt-i18n-micro/commit/426e8b3))
- **translation-server-middleware:** Simplify translation helper usage ([e733a57](https://github.com/s00d/nuxt-i18n-micro/commit/e733a57))
- **utils:** Simplify locale parameter construction in `buildFullPath` ([b868441](https://github.com/s00d/nuxt-i18n-micro/commit/b868441))
- **translation:** Replace Map with Record for locale caches ([d10d997](https://github.com/s00d/nuxt-i18n-micro/commit/d10d997))

### 📖 Documentation

- **performance-results:** Update performance metrics for i18n and i18n-micro ([adddb4f](https://github.com/s00d/nuxt-i18n-micro/commit/adddb4f))

### 🏡 Chore

- **test-utils:** Bump version to 1.0.4 in `package.json` ([9c64863](https://github.com/s00d/nuxt-i18n-micro/commit/9c64863))

### ✅ Tests

- **core:** Simplify translation helper tests by removing locale parameter ([766ad53](https://github.com/s00d/nuxt-i18n-micro/commit/766ad53))
- **performance:** Add pause function for stress test stabilization ([97f6963](https://github.com/s00d/nuxt-i18n-micro/commit/97f6963))
- **custom-regex:** Correct expected URL in locale switching test ([637d970](https://github.com/s00d/nuxt-i18n-micro/commit/637d970))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))
- TristanSurGithub <tristan@defachel.fr>

## v1.56.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.56.0...v1.56.1)

### 🩹 Fixes

- **router:** Resolve route correctly for NoPrefix locale switching ([c59dab9](https://github.com/s00d/nuxt-i18n-micro/commit/c59dab9))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.56.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.55.0...v1.56.0)

### 🚀 Enhancements

- **translation-server-middleware:** Enhance translation function with params ([db6057d](https://github.com/s00d/nuxt-i18n-micro/commit/db6057d))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.55.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.54.2...v1.55.0)

### 🚀 Enhancements

- **locale:** Add custom fallback route handling and improve locale path resolution ([c8d7e3e](https://github.com/s00d/nuxt-i18n-micro/commit/c8d7e3e))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.54.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.54.1...v1.54.2)

### 💅 Refactors

- **module:** Remove redundant Cloudflare Pages validation check ([c51bd98](https://github.com/s00d/nuxt-i18n-micro/commit/c51bd98))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.54.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.54.0...v1.54.1)

### 🩹 Fixes

- **i18n-switcher:** Add support for dynamic props in component interface ([6df4306](https://github.com/s00d/nuxt-i18n-micro/commit/6df4306))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.54.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.53.2...v1.54.0)

### 🚀 Enhancements

- **types:** Add `plugin` option to enable or disable additional features ([be54eaa](https://github.com/s00d/nuxt-i18n-micro/commit/be54eaa))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.53.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.53.1...v1.53.2)

### 💅 Refactors

- **plugins:** Update type definitions for route parameters ([fc61b43](https://github.com/s00d/nuxt-i18n-micro/commit/fc61b43))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.53.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.53.0...v1.53.1)

## v1.53.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.52.0...v1.53.0)

### 🚀 Enhancements

- **docs:** Add news ([75b3509](https://github.com/s00d/nuxt-i18n-micro/commit/75b3509))
- **docs:** Add news ([bd7af6e](https://github.com/s00d/nuxt-i18n-micro/commit/bd7af6e))
- **docs:** Add news ([7d3529d](https://github.com/s00d/nuxt-i18n-micro/commit/7d3529d))
- **docs:** Add news ([5e2871c](https://github.com/s00d/nuxt-i18n-micro/commit/5e2871c))
- **build:** Add entry point for utils in build configuration ([5022b9e](https://github.com/s00d/nuxt-i18n-micro/commit/5022b9e))

### 🏡 Chore

- **package:** Update package.json for exports and dependencies ([42f9a32](https://github.com/s00d/nuxt-i18n-micro/commit/42f9a32))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.52.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.51.0...v1.52.0)

### 🚀 Enhancements

- **i18n-loader:** Initialize storage cache on first load ([6902dc7](https://github.com/s00d/nuxt-i18n-micro/commit/6902dc7))
- **locales:** Add initial German locale files for various pages ([cd0cf1c](https://github.com/s00d/nuxt-i18n-micro/commit/cd0cf1c))

### 📖 Documentation

- **cli:** Update guide with new `text-to-i18n` command details ([3cd8d8e](https://github.com/s00d/nuxt-i18n-micro/commit/3cd8d8e))
- **guide:** Update deprecation notice for `includeDefaultLocaleRoute` ([8adb3f3](https://github.com/s00d/nuxt-i18n-micro/commit/8adb3f3))
- **guide:** Update npm package link for nuxt-i18n-micro-cli ([322b77c](https://github.com/s00d/nuxt-i18n-micro/commit/322b77c))
- **cli:** Add `--path` option to specify a file for processing ([b377609](https://github.com/s00d/nuxt-i18n-micro/commit/b377609))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.51.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.50.4...v1.51.0)

### 🚀 Enhancements

- **fixtures:** Add empty German locale JSON file ([3f70545](https://github.com/s00d/nuxt-i18n-micro/commit/3f70545))

### 🩹 Fixes

- **module:** Prevent execution for no prefix strategy ([b227cd8](https://github.com/s00d/nuxt-i18n-micro/commit/b227cd8))

### 📖 Documentation

- **faq:** Add explanation for translation keys resolution in SSR on Vercel ([bf0e505](https://github.com/s00d/nuxt-i18n-micro/commit/bf0e505))

### 🏡 Chore

- **changelog:** Update version from v1.41.0 to v1.50.0 ([c8fd098](https://github.com/s00d/nuxt-i18n-micro/commit/c8fd098))
- **pnpm:** Update package versions in `pnpm-lock.yaml` ([74201a6](https://github.com/s00d/nuxt-i18n-micro/commit/74201a6))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.50.4

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.50.3...v1.50.4)

## v1.50.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.50.2...v1.50.3)

### 🏡 Chore

- **playground:** Update `nuxt-i18n-micro` to version `^1.50.1` ([3b195b1](https://github.com/s00d/nuxt-i18n-micro/commit/3b195b1))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.50.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.50.1...v1.50.2)

### 🩹 Fixes

- **auto-detect:** Improve locale detection logic for case sensitivity ([e762d5e](https://github.com/s00d/nuxt-i18n-micro/commit/e762d5e))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.50.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.41.0...v1.50.1)

## v1.50.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.40.0...v1.41.0)

### 🚀 Enhancements

- **module:** Add strategy option and deprecate includeDefaultLocaleRoute ([6a2f455](https://github.com/s00d/nuxt-i18n-micro/commit/6a2f455))

### 💅 Refactors

- **translation:** Remove unused serverTranslationInit cache ([33fec8e](https://github.com/s00d/nuxt-i18n-micro/commit/33fec8e))
- **config:** Clean up nuxt.config.ts and enable devtools ([534f8ff](https://github.com/s00d/nuxt-i18n-micro/commit/534f8ff))
- **config:** Reorganize nuxt.config.ts for improved clarity ([2b2363f](https://github.com/s00d/nuxt-i18n-micro/commit/2b2363f))

### 📖 Documentation

- **guide:** Update FAQ and add strategy documentation ([d9c49e4](https://github.com/s00d/nuxt-i18n-micro/commit/d9c49e4))

### ✅ Tests

- **i18n:** Add tests for different i18n strategies ([20420e7](https://github.com/s00d/nuxt-i18n-micro/commit/20420e7))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.40.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.39.0...v1.40.0)

### 🚀 Enhancements

- **i18n-link:** Add support for external links in i18n-link component ([c40e43f](https://github.com/s00d/nuxt-i18n-micro/commit/c40e43f))

### 🩹 Fixes

- **i18n-link:** Remove unnecessary comment in computedStyle ([570335b](https://github.com/s00d/nuxt-i18n-micro/commit/570335b))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.39.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.38.5...v1.39.0)

### 🚀 Enhancements

- **types:** Add disablePageLocales option to ModuleOptions interface ([b9e57cc](https://github.com/s00d/nuxt-i18n-micro/commit/b9e57cc))

### 🩹 Fixes

- Pass `disablePageLocales` to public runtime config ([4ba80ac](https://github.com/s00d/nuxt-i18n-micro/commit/4ba80ac))

### 💅 Refactors

- **slot i18n link:** Remove the default wording of the i18n link ([37e68de](https://github.com/s00d/nuxt-i18n-micro/commit/37e68de))

### 📖 Documentation

- **contribution:** Add reference to Conventional Commits Specification ([b34d5a1](https://github.com/s00d/nuxt-i18n-micro/commit/b34d5a1))

### 🎨 Styles

- **active link:** Remove "font-weight: bold" on active link ([181235b](https://github.com/s00d/nuxt-i18n-micro/commit/181235b))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))
- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Tristan Defachel <tristan.defachel.fr>

## v1.38.5

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.38.4...v1.38.5)

### 🩹 Fixes

- **core, test-utils:** Add documentation and improve translation functions ([9fdd8b7](https://github.com/s00d/nuxt-i18n-micro/commit/9fdd8b7))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.38.4

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.38.3...v1.38.4)

### 🩹 Fixes

- **module:** Update environment variable check for test mode ([a18f84c](https://github.com/s00d/nuxt-i18n-micro/commit/a18f84c))

### 📖 Documentation

- **contribution:** Update Contribution Guide to use pnpm ([2717eee](https://github.com/s00d/nuxt-i18n-micro/commit/2717eee))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.38.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.38.2...v1.38.3)

### 🏡 Chore

- **playwright:** Clean up comments in config file ([c27cfc9](https://github.com/s00d/nuxt-i18n-micro/commit/c27cfc9))
- **github-actions:** Limit deployment trigger to changes in docs folder ([4bfa606](https://github.com/s00d/nuxt-i18n-micro/commit/4bfa606))
- **github-actions:** Limit deployment trigger to changes in docs folder ([29e3a3c](https://github.com/s00d/nuxt-i18n-micro/commit/29e3a3c))
- **github-actions:** Limit deployment trigger to changes in docs folder ([d3e0443](https://github.com/s00d/nuxt-i18n-micro/commit/d3e0443))
- **ci:** Update build command in CI workflow ([a1ec7ec](https://github.com/s00d/nuxt-i18n-micro/commit/a1ec7ec))
- **ci:** Update build command in CI workflow ([c61d76e](https://github.com/s00d/nuxt-i18n-micro/commit/c61d76e))

### ✅ Tests

- **tests:** Add unit tests for i18n utility functions ([37d7dd8](https://github.com/s00d/nuxt-i18n-micro/commit/37d7dd8))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.38.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.38.1...v1.38.2)

### 🏡 Chore

- **packages:** Update package versions and remove postinstall scripts ([6aecd23](https://github.com/s00d/nuxt-i18n-micro/commit/6aecd23))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.38.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.38.0...v1.38.1)

### 🩹 Fixes

- **utils:** Handle empty routePath in normalizePath function ([c375fb9](https://github.com/s00d/nuxt-i18n-micro/commit/c375fb9))

### ❤️ Contributors

- Pavel Kuzmin <Virus191288@gmail.com>

## v1.38.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.37.11...v1.38.0)

### 🚀 Enhancements

- **test-utils:** Add utility functions for i18n testing ([265bd98](https://github.com/s00d/nuxt-i18n-micro/commit/265bd98))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.37.11

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.37.10...v1.37.11)

## v1.37.10

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.37.9...v1.37.10)

## v1.37.9

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.37.8...v1.37.9)

## v1.37.8

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.37.7...v1.37.8)

## v1.37.7

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.37.6...v1.37.7)

## v1.37.6

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.37.5...v1.37.6)

## v1.37.5

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.37.4...v1.37.5)

## v1.37.4

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.37.3...v1.37.4)

## v1.37.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.37.2...v1.37.3)

## v1.37.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.37.1...v1.37.2)

## v1.37.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.36.1...v1.37.0)

### 🚀 Enhancements

- **devtools:** Enhance devtools UI setup and routing logic ([2ab8552](https://github.com/s00d/nuxt-i18n-micro/commit/2ab8552))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.36.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.36.0...v1.36.1)

### 🩹 Fixes

- **runtime:** Update translation middleware to accept default locale ([4a52be6](https://github.com/s00d/nuxt-i18n-micro/commit/4a52be6))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.36.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.35.2...v1.36.0)

### 🚀 Enhancements

- **translations:** Replace runtime config default locale with internal option ([97877a6](https://github.com/s00d/nuxt-i18n-micro/commit/97877a6))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.35.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.35.1...v1.35.2)

### 🩹 Fixes

- **module:** Resolve import path for translation server middleware ([eedbd04](https://github.com/s00d/nuxt-i18n-micro/commit/eedbd04))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.35.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.35.0...v1.35.1)

### 🩹 Fixes

- **nitro:** Add translation server middleware support in config ([7c91ea2](https://github.com/s00d/nuxt-i18n-micro/commit/7c91ea2))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.35.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.34.1...v1.35.0)

### 🚀 Enhancements

- **content:** Add internationalized content structure and components ([f3d2b6c](https://github.com/s00d/nuxt-i18n-micro/commit/f3d2b6c))
- **translation-server:** Add server middleware for translation fetching ([b9b7466](https://github.com/s00d/nuxt-i18n-micro/commit/b9b7466))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.34.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.34.0...v1.34.1)

### 🩹 Fixes

- **plugins:** Await i18n hook to ensure translations are loaded ([f6502d0](https://github.com/s00d/nuxt-i18n-micro/commit/f6502d0))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.34.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.33.3...v1.34.0)

### 🚀 Enhancements

- Support for {"key.key": value} ([779b379](https://github.com/s00d/nuxt-i18n-micro/commit/779b379))

### 🩹 Fixes

- 'translations' is possibly 'null' ([f71e43a](https://github.com/s00d/nuxt-i18n-micro/commit/f71e43a))
- 'translations' is possibly 'null' ([e8cbf5c](https://github.com/s00d/nuxt-i18n-micro/commit/e8cbf5c))

### 💅 Refactors

- Update loadTranslationsForRoute ([bb6621f](https://github.com/s00d/nuxt-i18n-micro/commit/bb6621f))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))
- Xueyang <313867808@qq.com>

## v1.33.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.33.2...v1.33.3)

## v1.33.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.33.1...v1.33.2)

### 🩹 Fixes

- Types ([cf05a56](https://github.com/s00d/nuxt-i18n-micro/commit/cf05a56))

### 📖 Documentation

- Types ([4b73fc4](https://github.com/s00d/nuxt-i18n-micro/commit/4b73fc4))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.33.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.33.0...v1.33.1)

### 🩹 Fixes

- Plural translation with 2 forms ([9ac7a41](https://github.com/s00d/nuxt-i18n-micro/commit/9ac7a41))

### 📖 Documentation

- Types ([c9f44ad](https://github.com/s00d/nuxt-i18n-micro/commit/c9f44ad))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))
- Jules <jules@hykes.dev>

## v1.33.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.32.4...v1.33.0)

### 🚀 Enhancements

- Add params to plural translation ([f67fb9d](https://github.com/s00d/nuxt-i18n-micro/commit/f67fb9d))

### 🩹 Fixes

- Tests ([89abfb8](https://github.com/s00d/nuxt-i18n-micro/commit/89abfb8))
- Tests ([e8ab093](https://github.com/s00d/nuxt-i18n-micro/commit/e8ab093))

### 💅 Refactors

- **i18n:** Update customPluralRule to include _params parameter ([ae6dc4a](https://github.com/s00d/nuxt-i18n-micro/commit/ae6dc4a))

### 📖 Documentation

- Faq ([ed4f4ba](https://github.com/s00d/nuxt-i18n-micro/commit/ed4f4ba))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))
- Jules <jules@hykes.dev>

## v1.32.4

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.32.3...v1.32.4)

### 🩹 Fixes

- Change router logic ([ac81268](https://github.com/s00d/nuxt-i18n-micro/commit/ac81268))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.32.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.32.2...v1.32.3)

### 🩹 Fixes

- Locale loading logic ([d56ce8a](https://github.com/s00d/nuxt-i18n-micro/commit/d56ce8a))
- Locale loading logic ([1541969](https://github.com/s00d/nuxt-i18n-micro/commit/1541969))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.32.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.32.1...v1.32.2)

### 🩹 Fixes

- Locale loading logic ([8383068](https://github.com/s00d/nuxt-i18n-micro/commit/8383068))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.32.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.32.0...v1.32.1)

### 📖 Documentation

- Clear ([a2808c1](https://github.com/s00d/nuxt-i18n-micro/commit/a2808c1))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.32.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.31.9...v1.32.0)

### 🚀 Enhancements

- Add baseUrl to locale ([03b1ffe](https://github.com/s00d/nuxt-i18n-micro/commit/03b1ffe))
- Add i18n-group ([85c2817](https://github.com/s00d/nuxt-i18n-micro/commit/85c2817))
- Add i18n-switcher slots ([9fe69f9](https://github.com/s00d/nuxt-i18n-micro/commit/9fe69f9))

### 🩹 Fixes

- Add cleanup storage ([a73a3dc](https://github.com/s00d/nuxt-i18n-micro/commit/a73a3dc))
- Storage empty ([b942307](https://github.com/s00d/nuxt-i18n-micro/commit/b942307))
- Storage empty ([5a88ca9](https://github.com/s00d/nuxt-i18n-micro/commit/5a88ca9))

### 📖 Documentation

- I18n-switcher Slots ([f6b3e1d](https://github.com/s00d/nuxt-i18n-micro/commit/f6b3e1d))
- I18n-group ([0e750a9](https://github.com/s00d/nuxt-i18n-micro/commit/0e750a9))
- Locales info ([1558b8c](https://github.com/s00d/nuxt-i18n-micro/commit/1558b8c))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.31.9

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.31.8...v1.31.9)

### 🩹 Fixes

- Update default value of autoDetectPath ([08401dc](https://github.com/s00d/nuxt-i18n-micro/commit/08401dc))
- Tests ([e1e0858](https://github.com/s00d/nuxt-i18n-micro/commit/e1e0858))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.31.8

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.31.7...v1.31.8)

### 🩹 Fixes

- Autodetect redirect ([f6f46e4](https://github.com/s00d/nuxt-i18n-micro/commit/f6f46e4))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.31.7

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.31.6...v1.31.7)

### 🩹 Fixes

- SSG auto detect ([8e09cb8](https://github.com/s00d/nuxt-i18n-micro/commit/8e09cb8))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.31.6

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.31.5...v1.31.6)

### 🩹 Fixes

- Cloudflare defineI18nRoute ([88e9f1e](https://github.com/s00d/nuxt-i18n-micro/commit/88e9f1e))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.31.5

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.31.4...v1.31.5)

### 🩹 Fixes

- Add Cloudflare error ([dc073af](https://github.com/s00d/nuxt-i18n-micro/commit/dc073af))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.31.4

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.31.3...v1.31.4)

### 🩹 Fixes

- AddTemplate plural ([5d20201](https://github.com/s00d/nuxt-i18n-micro/commit/5d20201))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.31.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.31.2...v1.31.3)

### 🩹 Fixes

- IsCloudflarePages and custom-fallback-route ([b11d69a](https://github.com/s00d/nuxt-i18n-micro/commit/b11d69a))
- IsCloudflarePages and custom-fallback-route ([21b440e](https://github.com/s00d/nuxt-i18n-micro/commit/21b440e))
- IsCloudflarePages and custom-fallback-route ([5788fce](https://github.com/s00d/nuxt-i18n-micro/commit/5788fce))
- IsCloudflarePages and custom-fallback-route ([bbdca47](https://github.com/s00d/nuxt-i18n-micro/commit/bbdca47))
- IsCloudflarePages and custom-fallback-route ([177cc0e](https://github.com/s00d/nuxt-i18n-micro/commit/177cc0e))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.31.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.31.1...v1.31.2)

### 🩹 Fixes

- Query params ([c464103](https://github.com/s00d/nuxt-i18n-micro/commit/c464103))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.31.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.31.0...v1.31.1)

### 🩹 Fixes

- Update redirect logic ([c06cbbb](https://github.com/s00d/nuxt-i18n-micro/commit/c06cbbb))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.31.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.30.2...v1.31.0)

### 🚀 Enhancements

- Add pathMatch ([b23aeb2](https://github.com/s00d/nuxt-i18n-micro/commit/b23aeb2))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.30.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.30.1...v1.30.2)

### 🩹 Fixes

- Drop default locale routes ([8bd6eb3](https://github.com/s00d/nuxt-i18n-micro/commit/8bd6eb3))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.30.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.30.0...v1.30.1)

### 🩹 Fixes

- Change autodetect redirect type - 302 ([e9975eb](https://github.com/s00d/nuxt-i18n-micro/commit/e9975eb))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.30.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.29.6...v1.30.0)

### 🚀 Enhancements

- Drop default locale routes for includeDefaultLocaleRoute and fix encodeURI ([b2259f3](https://github.com/s00d/nuxt-i18n-micro/commit/b2259f3))

### 🩹 Fixes

- Fix wrong function in docs example ([d72cff6](https://github.com/s00d/nuxt-i18n-micro/commit/d72cff6))

### 📖 Documentation

- Update ([7729b3f](https://github.com/s00d/nuxt-i18n-micro/commit/7729b3f))
- Update ([e1a09ca](https://github.com/s00d/nuxt-i18n-micro/commit/e1a09ca))
- Update ([e5aa667](https://github.com/s00d/nuxt-i18n-micro/commit/e5aa667))
- Update ([7dce43d](https://github.com/s00d/nuxt-i18n-micro/commit/7dce43d))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))
- Florian Werndl <fwerndl@gmail.com>

## v1.29.6

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.29.5...v1.29.6)

### 🩹 Fixes

- Add page name warning ([4696a59](https://github.com/s00d/nuxt-i18n-micro/commit/4696a59))
- Redirect without name ([4ed7428](https://github.com/s00d/nuxt-i18n-micro/commit/4ed7428))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.29.5

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.29.4...v1.29.5)

### 🩹 Fixes

- Add page name warning ([d96c3fb](https://github.com/s00d/nuxt-i18n-micro/commit/d96c3fb))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.29.4

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.29.3...v1.29.4)

## v1.29.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.29.2...v1.29.3)

### 🩹 Fixes

- Types ([361fb2e](https://github.com/s00d/nuxt-i18n-micro/commit/361fb2e))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.29.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.29.1...v1.29.2)

### 🩹 Fixes

- Types ([0dbb7ba](https://github.com/s00d/nuxt-i18n-micro/commit/0dbb7ba))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.29.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.29.0...v1.29.1)

### 🩹 Fixes

- Types ([dc11c94](https://github.com/s00d/nuxt-i18n-micro/commit/dc11c94))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.29.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.28.0...v1.29.0)

### 🚀 Enhancements

- Fix current locale name not found ([593d857](https://github.com/s00d/nuxt-i18n-micro/commit/593d857))

### 🩹 Fixes

- Current locale name not found ([782d046](https://github.com/s00d/nuxt-i18n-micro/commit/782d046))
- Current locale name not found ([d7c2491](https://github.com/s00d/nuxt-i18n-micro/commit/d7c2491))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.28.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.27.1...v1.28.0)

### 🚀 Enhancements

- Add getCurrentName ([b9067ee](https://github.com/s00d/nuxt-i18n-micro/commit/b9067ee))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.27.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.27.0...v1.27.1)

### 🩹 Fixes

- BaseUrl ([5f092c9](https://github.com/s00d/nuxt-i18n-micro/commit/5f092c9))

### 📖 Documentation

- Fix ([8ab30f7](https://github.com/s00d/nuxt-i18n-micro/commit/8ab30f7))
- Fix ([02f69e0](https://github.com/s00d/nuxt-i18n-micro/commit/02f69e0))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.27.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.26.4...v1.27.0)

### 🚀 Enhancements

- Add switchRoute ([854f23e](https://github.com/s00d/nuxt-i18n-micro/commit/854f23e))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.26.4

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.26.3...v1.26.4)

### 🩹 Fixes

- Ts ([2190bf5](https://github.com/s00d/nuxt-i18n-micro/commit/2190bf5))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.26.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.26.2...v1.26.3)

### 🩹 Fixes

- Ts ([b3780ae](https://github.com/s00d/nuxt-i18n-micro/commit/b3780ae))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.26.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.26.1...v1.26.2)

### 🩹 Fixes

- Page.name warning ([1f719be](https://github.com/s00d/nuxt-i18n-micro/commit/1f719be))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.26.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.26.0...v1.26.1)

### 🩹 Fixes

- Types ([e3b0147](https://github.com/s00d/nuxt-i18n-micro/commit/e3b0147))
- Test assets ([860680b](https://github.com/s00d/nuxt-i18n-micro/commit/860680b))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.26.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.25.5...v1.26.0)

### 🚀 Enhancements

- Add debug option ([0696b02](https://github.com/s00d/nuxt-i18n-micro/commit/0696b02))

### 🏡 Chore

- Testing server assets ([81c08b0](https://github.com/s00d/nuxt-i18n-micro/commit/81c08b0))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))
- Rigo-m <matteo.rigoni@atoms.retex.com>

## v1.25.5

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.25.4...v1.25.5)

### 🩹 Fixes

- Add translation assets to dist ([7bc6876](https://github.com/s00d/nuxt-i18n-micro/commit/7bc6876))
- Add translation assets to dist ([5fa35d6](https://github.com/s00d/nuxt-i18n-micro/commit/5fa35d6))
- Add translation assets to dist ([fb7c1df](https://github.com/s00d/nuxt-i18n-micro/commit/fb7c1df))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.25.4

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.25.3...v1.25.4)

## v1.25.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.25.2...v1.25.3)

### 🩹 Fixes

- Add translation assets to dist ([8ce39a9](https://github.com/s00d/nuxt-i18n-micro/commit/8ce39a9))
- Add translation assets to dist ([7e1ede8](https://github.com/s00d/nuxt-i18n-micro/commit/7e1ede8))
- Add translation assets to dist ([6398eab](https://github.com/s00d/nuxt-i18n-micro/commit/6398eab))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.25.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.25.1...v1.25.2)

### 🩹 Fixes

- Add translation assets to dist ([36549b4](https://github.com/s00d/nuxt-i18n-micro/commit/36549b4))
- Add translation assets to dist ([fc5d3b0](https://github.com/s00d/nuxt-i18n-micro/commit/fc5d3b0))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.25.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.25.0...v1.25.1)

### 🩹 Fixes

- Add translation assets to dist ([77bd6ed](https://github.com/s00d/nuxt-i18n-micro/commit/77bd6ed))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.25.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.24.0...v1.25.0)

### 🚀 Enhancements

- **i18n:** Add `$ts` function for guaranteed string return ([dde551c](https://github.com/s00d/nuxt-i18n-micro/commit/dde551c))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.24.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.23.1...v1.24.0)

### 🚀 Enhancements

- Custom locale pattern matcher ([1ab8688](https://github.com/s00d/nuxt-i18n-micro/commit/1ab8688))
- Add a new property to the type Locale ([bd75224](https://github.com/s00d/nuxt-i18n-micro/commit/bd75224))

### 🩹 Fixes

- Mark displayName as an optional property ([126cba7](https://github.com/s00d/nuxt-i18n-micro/commit/126cba7))
- Tests ([c12f76a](https://github.com/s00d/nuxt-i18n-micro/commit/c12f76a))
- Workspaces ([43f9ba3](https://github.com/s00d/nuxt-i18n-micro/commit/43f9ba3))

### 🏡 Chore

- Update lock-file ([8efc92a](https://github.com/s00d/nuxt-i18n-micro/commit/8efc92a))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))
- Liuqi <liuqi6602@163.com>
- Rigo-m <matteo.rigoni@atoms.retex.com>

## v1.23.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.23.0...v1.23.1)

### 🩹 Fixes

- ExtractDefineI18nRouteConfig change to extractLocaleRoutes ([3047dd3](https://github.com/s00d/nuxt-i18n-micro/commit/3047dd3))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.23.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.22.2...v1.23.0)

### 🚀 Enhancements

- Export non-dollar-prefixed functions from useI18n #35 ([#35](https://github.com/s00d/nuxt-i18n-micro/issues/35))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.22.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.22.1...v1.22.2)

### 🩹 Fixes

- Rollback ([24b8950](https://github.com/s00d/nuxt-i18n-micro/commit/24b8950))
- Rollback ([177073f](https://github.com/s00d/nuxt-i18n-micro/commit/177073f))
- Types ([8e79a31](https://github.com/s00d/nuxt-i18n-micro/commit/8e79a31))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.22.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.22.0...v1.22.1)

### 🩹 Fixes

- Cleanup ([071d563](https://github.com/s00d/nuxt-i18n-micro/commit/071d563))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.22.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.21.5...v1.22.0)

### 🚀 Enhancements

- Add apiBaseUrl and fix extend path ([09b4d48](https://github.com/s00d/nuxt-i18n-micro/commit/09b4d48))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.21.5

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.21.4...v1.21.5)

## v1.21.4

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.21.3...v1.21.4)

### 🩹 Fixes

- Next in router ([5933b4b](https://github.com/s00d/nuxt-i18n-micro/commit/5933b4b))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.21.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.21.2...v1.21.3)

## v1.21.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.21.1...v1.21.2)

## v1.21.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.21.0...v1.21.1)

## v1.21.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.20.5...v1.21.0)

### 🚀 Enhancements

- SwitchLocale improvements ([35545a9](https://github.com/s00d/nuxt-i18n-micro/commit/35545a9))

### 🩹 Fixes

- Lint ([594dc3c](https://github.com/s00d/nuxt-i18n-micro/commit/594dc3c))
- Types ([7f62c66](https://github.com/s00d/nuxt-i18n-micro/commit/7f62c66))
- Lint ([de63792](https://github.com/s00d/nuxt-i18n-micro/commit/de63792))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))
- Dmitry Istomin <dmitry.i@monolith.co.il>

## v1.20.5

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.20.4...v1.20.5)

### 🩹 Fixes

- Update globalLocaleRoutes logic ([d64b101](https://github.com/s00d/nuxt-i18n-micro/commit/d64b101))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.20.4

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.20.3...v1.20.4)

### 🩹 Fixes

- Update globalLocaleRoutes logic ([6346d73](https://github.com/s00d/nuxt-i18n-micro/commit/6346d73))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.20.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.20.2...v1.20.3)

### 🩹 Fixes

- Add loadTranslationsIfNeeded catch ([6a36189](https://github.com/s00d/nuxt-i18n-micro/commit/6a36189))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.20.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.20.1...v1.20.2)

### 🩹 Fixes

- I18n plugin order ([0787bf2](https://github.com/s00d/nuxt-i18n-micro/commit/0787bf2))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.20.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.20.0...v1.20.1)

### 🩹 Fixes

- InitializeMarkdown test ([7765599](https://github.com/s00d/nuxt-i18n-micro/commit/7765599))
- Add i18n to provide ([80b65b1](https://github.com/s00d/nuxt-i18n-micro/commit/80b65b1))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.20.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.19.2...v1.20.0)

### 🚀 Enhancements

- Added global configuration for custom routes via globalLocaleRoutes ([d303499](https://github.com/s00d/nuxt-i18n-micro/commit/d303499))

### 📖 Documentation

- Update documentation structure ([3c5ad7c](https://github.com/s00d/nuxt-i18n-micro/commit/3c5ad7c))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.19.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.19.1...v1.19.2)

### 🩹 Fixes

- Add normalizeLocales to defineNuxtPlugin ([99a657a](https://github.com/s00d/nuxt-i18n-micro/commit/99a657a))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.19.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.19.0...v1.19.1)

### 🩹 Fixes

- File watcher depth 2 ([3b92d5f](https://github.com/s00d/nuxt-i18n-micro/commit/3b92d5f))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.19.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.18.1...v1.19.0)

### 🚀 Enhancements

- Add cloudflare_pages ([2412b87](https://github.com/s00d/nuxt-i18n-micro/commit/2412b87))

### 🩹 Fixes

- Update deps ([eda1fde](https://github.com/s00d/nuxt-i18n-micro/commit/eda1fde))
- Update deps ([f74b851](https://github.com/s00d/nuxt-i18n-micro/commit/f74b851))
- Update deps ([e5cae79](https://github.com/s00d/nuxt-i18n-micro/commit/e5cae79))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.18.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.18.0...v1.18.1)

## v1.18.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.17.0...v1.18.0)

### 🚀 Enhancements

- Windows path ([cadd8b9](https://github.com/s00d/nuxt-i18n-micro/commit/cadd8b9))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.17.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.16.1...v1.17.0)

### 🚀 Enhancements

- **hashmode:** New route logic ([4207cd6](https://github.com/s00d/nuxt-i18n-micro/commit/4207cd6))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.17.0-1726909148.4207cd6

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.16.1...v1.17.0-1726909148.4207cd6)

### 🚀 Enhancements

- **hashmode:** New route logic ([4207cd6](https://github.com/s00d/nuxt-i18n-micro/commit/4207cd6))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.16.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.16.0...v1.16.1)

### 📖 Documentation

- Add cli info ([1066708](https://github.com/s00d/nuxt-i18n-micro/commit/1066708))

### ✅ Tests

- HashMode ([7efe490](https://github.com/s00d/nuxt-i18n-micro/commit/7efe490))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.16.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.15.4...v1.16.0)

### 🚀 Enhancements

- **i18n:** Modified pluralization logic ([5664f0e](https://github.com/s00d/nuxt-i18n-micro/commit/5664f0e))

### 🩹 Fixes

- UseLogger ([7c8b74f](https://github.com/s00d/nuxt-i18n-micro/commit/7c8b74f))

### 📖 Documentation

- Plural ([732f88d](https://github.com/s00d/nuxt-i18n-micro/commit/732f88d))
- Crowdin ([9899373](https://github.com/s00d/nuxt-i18n-micro/commit/9899373))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.15.4

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.15.3...v1.15.4)

### 🩹 Fixes

- Plural function ([b325992](https://github.com/s00d/nuxt-i18n-micro/commit/b325992))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.15.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.15.2...v1.15.3)

### 🩹 Fixes

- Fallback-locale array merge and drop __proto__,constructor ([7f72208](https://github.com/s00d/nuxt-i18n-micro/commit/7f72208))

### 📖 Documentation

- Per Component Translations ([484daad](https://github.com/s00d/nuxt-i18n-micro/commit/484daad))
- Per Component Translations ([d0071cc](https://github.com/s00d/nuxt-i18n-micro/commit/d0071cc))
- Per Component Translations ([f0b40bc](https://github.com/s00d/nuxt-i18n-micro/commit/f0b40bc))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.15.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.15.1...v1.15.2)

### 🩹 Fixes

- DeepClone memory leak ([3d8145a](https://github.com/s00d/nuxt-i18n-micro/commit/3d8145a))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.15.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.15.0...v1.15.1)

### 🩹 Fixes

- DeepClone memory leak ([50fa1c6](https://github.com/s00d/nuxt-i18n-micro/commit/50fa1c6))
- Interpolate logics ([7cb174b](https://github.com/s00d/nuxt-i18n-micro/commit/7cb174b))

### ✅ Tests

- Add text escaping ([2637e5e](https://github.com/s00d/nuxt-i18n-micro/commit/2637e5e))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.15.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.14.1...v1.15.0)

### 🚀 Enhancements

- Add fallbackLocale ([5681d42](https://github.com/s00d/nuxt-i18n-micro/commit/5681d42))
- Add localeCookie ([4b3c636](https://github.com/s00d/nuxt-i18n-micro/commit/4b3c636))

### 🩹 Fixes

- Auto-update if detectedLocale === currentLocale ([9d0276d](https://github.com/s00d/nuxt-i18n-micro/commit/9d0276d))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.14.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.14.0...v1.14.1)

### 🩹 Fixes

- Restore redirect for missing locales in defineI18nRoute ([a4cee76](https://github.com/s00d/nuxt-i18n-micro/commit/a4cee76))
- Optimize load locale logic to load main locale only once per page ([fd5a747](https://github.com/s00d/nuxt-i18n-micro/commit/fd5a747))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.14.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.13.3...v1.14.0)

### 🚀 Enhancements

- Update i18n:register hook logic and add documentation ([dec1187](https://github.com/s00d/nuxt-i18n-micro/commit/dec1187))

### 🩹 Fixes

- ToggleDropdown ([a1fc1cf](https://github.com/s00d/nuxt-i18n-micro/commit/a1fc1cf))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.13.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.13.2...v1.13.3)

### 🩹 Fixes

- Routes links ([ccd93b8](https://github.com/s00d/nuxt-i18n-micro/commit/ccd93b8))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.13.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.13.1...v1.13.2)

### 🩹 Fixes

- Routes redirects and routes links ([0bfb87f](https://github.com/s00d/nuxt-i18n-micro/commit/0bfb87f))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.13.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.13.0...v1.13.1)

### 🩹 Fixes

- RootDirs private and fix locale generate ([66a8948](https://github.com/s00d/nuxt-i18n-micro/commit/66a8948))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.13.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.12.6...v1.13.0)

### 🚀 Enhancements

- Add $getRouteName ([56781e1](https://github.com/s00d/nuxt-i18n-micro/commit/56781e1))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.12.6

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.12.5...v1.12.6)

### 🩹 Fixes

- AutoDetect server ([57d6baa](https://github.com/s00d/nuxt-i18n-micro/commit/57d6baa))
- AutoDetect server ([4b7cbc4](https://github.com/s00d/nuxt-i18n-micro/commit/4b7cbc4))
- Autodetect ([fa8d9a3](https://github.com/s00d/nuxt-i18n-micro/commit/fa8d9a3))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.12.5

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.12.4...v1.12.5)

### 🩹 Fixes

- Locale cache ([8d3dc05](https://github.com/s00d/nuxt-i18n-micro/commit/8d3dc05))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.12.4

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.12.3...v1.12.4)

### 🩹 Fixes

- Types ([a8e9cef](https://github.com/s00d/nuxt-i18n-micro/commit/a8e9cef))
- Types ([14546fd](https://github.com/s00d/nuxt-i18n-micro/commit/14546fd))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.12.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.12.2...v1.12.3)

### ✅ Tests

- Add tests for locales path ([1542de5](https://github.com/s00d/nuxt-i18n-micro/commit/1542de5))
- Cleanup ([48c44a2](https://github.com/s00d/nuxt-i18n-micro/commit/48c44a2))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.12.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.12.1...v1.12.2)

### 🩹 Fixes

- I18n-link types ([f74e339](https://github.com/s00d/nuxt-i18n-micro/commit/f74e339))
- Children routes for locales path ([1f2c270](https://github.com/s00d/nuxt-i18n-micro/commit/1f2c270))

### ✅ Tests

- Add tests for locales path ([1a38dd8](https://github.com/s00d/nuxt-i18n-micro/commit/1a38dd8))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.12.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.12.0...v1.12.1)

### 🩹 Fixes

- DisableWatcher ([9b5bfd7](https://github.com/s00d/nuxt-i18n-micro/commit/9b5bfd7))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.12.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.11.1...v1.12.0)

### 🚀 Enhancements

- Add disableWatcher ([f17bd65](https://github.com/s00d/nuxt-i18n-micro/commit/f17bd65))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.11.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.11.0...v1.11.1)

### 🩹 Fixes

- Children routes ([3a79596](https://github.com/s00d/nuxt-i18n-micro/commit/3a79596))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.11.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.10.1...v1.11.0)

### 🚀 Enhancements

- Add tn and td ([1444a0c](https://github.com/s00d/nuxt-i18n-micro/commit/1444a0c))

### 📖 Documentation

- Add $tc example ([8048dae](https://github.com/s00d/nuxt-i18n-micro/commit/8048dae))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.10.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.10.0...v1.10.1)

### 🩹 Fixes

- Prerender ([a26af34](https://github.com/s00d/nuxt-i18n-micro/commit/a26af34))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.10.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.9.0...v1.10.0)

### 🚀 Enhancements

- Add disablePageLocales and localeRoutes ([59d1efe](https://github.com/s00d/nuxt-i18n-micro/commit/59d1efe))

### 📖 Documentation

- Fix ([68e3212](https://github.com/s00d/nuxt-i18n-micro/commit/68e3212))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.9.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.8.0...v1.9.0)

### 🚀 Enhancements

- **cache:** Complite integration && test && docs && refactor ([03ece24](https://github.com/s00d/nuxt-i18n-micro/commit/03ece24))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.8.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.7.0...v1.8.0)

### 🚀 Enhancements

- **cache:** Complite integration && test && docs && refactor ([0d27649](https://github.com/s00d/nuxt-i18n-micro/commit/0d27649))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.7.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.6.1...v1.7.0)

### 🚀 Enhancements

- **devtools:** Add import/export ([5219fea](https://github.com/s00d/nuxt-i18n-micro/commit/5219fea))
- **i1tn-t:** Add Dynamic Content ([fa025ca](https://github.com/s00d/nuxt-i18n-micro/commit/fa025ca))

### 💅 Refactors

- **playground:** Add more examples ([934c48e](https://github.com/s00d/nuxt-i18n-micro/commit/934c48e))
- Clear ([1f6b193](https://github.com/s00d/nuxt-i18n-micro/commit/1f6b193))

### 📖 Documentation

- **i1tn-t:** Add Dynamic Content ([a0661be](https://github.com/s00d/nuxt-i18n-micro/commit/a0661be))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.6.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.6.0...v1.6.1)

### 🩹 Fixes

- Memory leak ([c465d22](https://github.com/s00d/nuxt-i18n-micro/commit/c465d22))

### 📖 Documentation

- Update ([b4028b7](https://github.com/s00d/nuxt-i18n-micro/commit/b4028b7))
- **migrations:** Fix ([f2840bd](https://github.com/s00d/nuxt-i18n-micro/commit/f2840bd))
- **migrations:** Update locales strict ([14f1b06](https://github.com/s00d/nuxt-i18n-micro/commit/14f1b06))
- **migrations:** Add Multi Domain Locales ([c53d42b](https://github.com/s00d/nuxt-i18n-micro/commit/c53d42b))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.6.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.5.1...v1.6.0)

### 🚀 Enhancements

- **components:** Add i18n-link ([a791bfa](https://github.com/s00d/nuxt-i18n-micro/commit/a791bfa))

### 📖 Documentation

- Add vuepress docs ([3b25bd0](https://github.com/s00d/nuxt-i18n-micro/commit/3b25bd0))
- Add vuepress docs ([ef9a196](https://github.com/s00d/nuxt-i18n-micro/commit/ef9a196))
- Update ([3375b67](https://github.com/s00d/nuxt-i18n-micro/commit/3375b67))
- Update ([68da550](https://github.com/s00d/nuxt-i18n-micro/commit/68da550))
- Update ([896842f](https://github.com/s00d/nuxt-i18n-micro/commit/896842f))
- Update ([57fbf8a](https://github.com/s00d/nuxt-i18n-micro/commit/57fbf8a))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.5.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.5.0...v1.5.1)

## v1.5.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.4.0...v1.5.0)

### 🩹 Fixes

- Add global types ([9865479](https://github.com/s00d/nuxt-i18n-micro/commit/9865479))

### 📖 Documentation

- Cleanup ([7274212](https://github.com/s00d/nuxt-i18n-micro/commit/7274212))
- Add note ([3848314](https://github.com/s00d/nuxt-i18n-micro/commit/3848314))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.4.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.3.1...v1.4.0)

### 🚀 Enhancements

- add routesLocaleLinks to link locale files across different routes ([0f8e415](https://github.com/s00d/nuxt-i18n-micro/commit/0f8e415))
- add baseURL handling to support CDN usage ([0f8e415](https://github.com/s00d/nuxt-i18n-micro/commit/0f8e415))
- add dateBuild to locale fetching for translation updates after rebuilds ([0f8e415](https://github.com/s00d/nuxt-i18n-micro/commit/0f8e415))
-  add tests for routesLocaleLinks functionality ([0f8e415](https://github.com/s00d/nuxt-i18n-micro/commit/0f8e415))
- update README with routesLocaleLinks documentation ([0f8e415](https://github.com/s00d/nuxt-i18n-micro/commit/0f8e415))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.3.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.3.0...v1.3.1)

### 🩹 Fixes

- Docs ([7a1a0b0](https://github.com/s00d/nuxt-i18n-micro/commit/7a1a0b0))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.3.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.2.0...v1.3.0)

### 🚀 Enhancements

- Add layer support and tests, revamp DevTools UI, update documentation ([6e099e1](https://github.com/s00d/nuxt-i18n-micro/commit/6e099e1))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.2.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.1.16...v1.2.0)

### 🚀 Enhancements

- **devtools:** Use devtools uikit ([f244ef5](https://github.com/s00d/nuxt-i18n-micro/commit/f244ef5))

### 🩹 Fixes

- **types:** Augment `@vue/runtime-core` and fix $getLocales return type ([546ae33](https://github.com/s00d/nuxt-i18n-micro/commit/546ae33))
- Create locales files ([9dfcb87](https://github.com/s00d/nuxt-i18n-micro/commit/9dfcb87))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))
- Artem Zhirov ([@azhirov](http://github.com/azhirov))
- Osama Haikal <ee.osamahaikal@gmail.com>

## v1.1.16

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.1.15...v1.1.16)

### 🩹 Fixes

- **types:** DefineI18nRoute ([621282e](https://github.com/s00d/nuxt-i18n-micro/commit/621282e))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.1.15

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.1.14...v1.1.15)

### 🩹 Fixes

- **i18n-t:** Cleanup ([07004d0](https://github.com/s00d/nuxt-i18n-micro/commit/07004d0))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.1.14

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.1.13...v1.1.14)

### 🩹 Fixes

- MergeTranslations ([321d2d9](https://github.com/s00d/nuxt-i18n-micro/commit/321d2d9))

### 📖 Documentation

- Add $defineI18nRoute info, i18n-t info ([ff9f58f](https://github.com/s00d/nuxt-i18n-micro/commit/ff9f58f))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.1.13

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.1.12...v1.1.13)

### 🩹 Fixes

- Only augment `vue`, not sub-packages ([ba2d170](https://github.com/s00d/nuxt-i18n-micro/commit/ba2d170))
- Devtools files path ([c2e65ac](https://github.com/s00d/nuxt-i18n-micro/commit/c2e65ac))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))
- Bobbie Goede <bobbiegoede@gmail.com>

## v1.1.12

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.1.11...v1.1.12)

### 🩹 Fixes

- Locale routes ([9c7d3ca](https://github.com/s00d/nuxt-i18n-micro/commit/9c7d3ca))
- Change to $fetch ([c86bd19](https://github.com/s00d/nuxt-i18n-micro/commit/c86bd19))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.1.11

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.1.10...v1.1.11)

### 🩹 Fixes

- Locale routes ([060e88d](https://github.com/s00d/nuxt-i18n-micro/commit/060e88d))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.1.10

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.1.9...v1.1.10)

## v1.1.9

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.1.8...v1.1.9)

### 🩹 Fixes

- DefineI18nRoute redirect ([e692026](https://github.com/s00d/nuxt-i18n-micro/commit/e692026))
- Route locale ([283bb8a](https://github.com/s00d/nuxt-i18n-micro/commit/283bb8a))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.1.8

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.1.7...v1.1.8)

### 🩹 Fixes

- Eslint conflict ([5714fd9](https://github.com/s00d/nuxt-i18n-micro/commit/5714fd9))
- switchLocale change to router ([39487ad](https://github.com/s00d/nuxt-i18n-micro/commit/39487ad))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.1.7

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.1.6...v1.1.7)

## v1.1.6

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.1.5...v1.1.6)

## v1.1.5

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.1.4...v1.1.5)

## v1.1.4

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.1.3...v1.1.4)

## v1.1.3

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.1.2...v1.1.3)

## v1.1.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.1.1...v1.1.2)

### 🩹 Fixes

- Change default-locale-redirect to middleware fix: getLocalizedRoute with locale add: tests ([b4defbf](https://github.com/s00d/nuxt-i18n-micro/commit/b4defbf))
- Deps ([88aad84](https://github.com/s00d/nuxt-i18n-micro/commit/88aad84))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.1.1

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.1.0...v1.1.1)

### 🩹 Fixes

- Load page locale ([419ff77](https://github.com/s00d/nuxt-i18n-micro/commit/419ff77))
- Load page locale ([ba305e6](https://github.com/s00d/nuxt-i18n-micro/commit/ba305e6))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.1.0

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.0.2...v1.1.0)

### 🚀 Enhancements

- **i18n:** Add `includeDefaultLocaleRoute` option to module configuration ([ab91f70](https://github.com/s00d/nuxt-i18n-micro/commit/ab91f70))

### ❤️ Contributors

- Pavel Kuzmin ([@s00d](http://github.com/s00d))

## v1.0.2

[compare changes](https://github.com/s00d/nuxt-i18n-micro/compare/v1.0.1...v1.0.2)

## v1.0.1

