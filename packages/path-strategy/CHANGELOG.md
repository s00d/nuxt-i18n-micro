# @i18n-micro/path-strategy

## 1.3.10

_2026-08-05_ · [`cf4c4caa`](https://github.com/s00d/nuxt-i18n-micro/commit/cf4c4caab89c517b4e8c47540fe1f1a646e745d5)

### Features

- Vue DevTools inspector + docs workspace (#246) ([`cf4c4ca`](https://github.com/s00d/nuxt-i18n-micro/commit/cf4c4caab89c517b4e8c47540fe1f1a646e745d5))

### Style

- apply oxfmt after checks pipeline ([`d2b6ed7`](https://github.com/s00d/nuxt-i18n-micro/commit/d2b6ed7704fb9aaf4a4da38fc6fb0011d99bbed4))

## 1.3.9

_2026-07-31_ · [`08dd21e3`](https://github.com/s00d/nuxt-i18n-micro/commit/08dd21e3413db56334bb22ad96841c4a1ce1908f)

### Fixes

- keep nested parent when child is absolute ([`08dd21e`](https://github.com/s00d/nuxt-i18n-micro/commit/08dd21e3413db56334bb22ad96841c4a1ce1908f))

## 1.3.8

_2026-07-31_ · [`d151f7cc`](https://github.com/s00d/nuxt-i18n-micro/commit/d151f7ccc9d6f2b55b1d01e236b02318b22ab5c3)

### Fixes

- localePath dash nest and param matchers ([`d151f7c`](https://github.com/s00d/nuxt-i18n-micro/commit/d151f7ccc9d6f2b55b1d01e236b02318b22ab5c3))

## 1.3.7

_2026-07-31_ · [`971a93d9`](https://github.com/s00d/nuxt-i18n-micro/commit/971a93d92db807c66088fa4102bca0987b376cdd)

### Features

- **vite.config:** add afterDiagnostic handler for TypeScript errors ([`eae3fc6`](https://github.com/s00d/nuxt-i18n-micro/commit/eae3fc6eb9108a2e1455b37ccb76b484312f9072))

### Fixes

- publishable caret workspace pins ([`971a93d`](https://github.com/s00d/nuxt-i18n-micro/commit/971a93d92db807c66088fa4102bca0987b376cdd))

## 1.3.6

_2026-07-30_ · [`cf369ff9`](https://github.com/s00d/nuxt-i18n-micro/commit/cf369ff9585a63d1fd71ef7cd99263fb575d0e67)

### Other

- Vitest migration, shared fixtures, formats & cache DX (#235) ([`cf369ff`](https://github.com/s00d/nuxt-i18n-micro/commit/cf369ff9585a63d1fd71ef7cd99263fb575d0e67))

## 1.3.5

_2026-07-06_ · [`ad15834e`](https://github.com/s00d/nuxt-i18n-micro/commit/ad15834e32d69e80f19b5fdd5b7d3357dec08689)

### Fixes

- **nitro:** harden #233 export conditions with regression tests ([`ad15834`](https://github.com/s00d/nuxt-i18n-micro/commit/ad15834e32d69e80f19b5fdd5b7d3357dec08689))

## 1.3.4

_2026-06-29_ · [`af9f9ea3`](https://github.com/s00d/nuxt-i18n-micro/commit/af9f9ea31d838f7d1e0408c7417b11f34fde7fca)

### Fixes

- order production export before import to silence esbuild warnings ([`af9f9ea`](https://github.com/s00d/nuxt-i18n-micro/commit/af9f9ea31d838f7d1e0408c7417b11f34fde7fca))
- **nitro:** resolve #233 via package export conditions, drop traceInclude hack ([`d467436`](https://github.com/s00d/nuxt-i18n-micro/commit/d4674369969dbae3ed9bae10201185152314bd3d))

## 1.3.3

_2026-06-15_ · [`e8b449e5`](https://github.com/s00d/nuxt-i18n-micro/commit/e8b449e5c118287066314f0c24d7d34e99354a79)

### Refactors

- **runtime:** extract NuxtI18n layer and fix SSR/client regressions ([`20f3c55`](https://github.com/s00d/nuxt-i18n-micro/commit/20f3c55246d3a4c40d4a517d146d054bc5945c96))

### Chore

- bump package versions for multiple modules ([`e8b449e`](https://github.com/s00d/nuxt-i18n-micro/commit/e8b449e5c118287066314f0c24d7d34e99354a79))

## 1.3.2

_2026-06-14_ · [`feab68a8`](https://github.com/s00d/nuxt-i18n-micro/commit/feab68a866d458a06fe885b08ee4e46387b36f6e)

### Build and publish

- Shared runtime chunks use stable names (`base-strategy.js` / `common.js`) instead of content-hashed filenames; smaller tarballs without per-entry sourcemaps.
- Type declaration paths for subpath exports live under `dist/strategies/*.d.ts` (and matching `.d.cts` for `require`), aligned with `package.json` `exports`.
- Dual-package types: `import` resolves `.d.ts`, `require` resolves `.d.cts` for `"type": "module"`.
- Removed redundant top-level `module` field when `exports` is defined.

### Migration

- Prefer official subpaths (`@i18n-micro/path-strategy/prefix`, `/no-prefix`, etc.). Deep imports to old flat type paths such as `dist/prefix-strategy.d.ts` are no longer published; use `exports` or subpath imports instead.
- Internal chunk file names changed; do not import hashed `base-strategy-*` or `common-*` chunks directly.

### Refactors

- stable shared chunks and publint exports ([`bd6a9a6`](https://github.com/s00d/nuxt-i18n-micro/commit/bd6a9a6853d8e7e3bb0c2821410a4b508a6acbff))

### Tests

- add dist publish and export subpath smoke tests ([`c0c4f4e`](https://github.com/s00d/nuxt-i18n-micro/commit/c0c4f4e47a1cac50fa8de82e5eb84d5c922450a4))

### Chore

- migrate to oxlint/oxfmt and improve docs SEO ([`feab68a`](https://github.com/s00d/nuxt-i18n-micro/commit/feab68a866d458a06fe885b08ee4e46387b36f6e))

## 1.3.1

_2026-05-25_ · [`138ee034`](https://github.com/s00d/nuxt-i18n-micro/commit/138ee0348bcd6d6edaa19fd0870ea9ca2cba2573)

### Tests

- extend dist smoke to all strategies and tarball ([`138ee03`](https://github.com/s00d/nuxt-i18n-micro/commit/138ee0348bcd6d6edaa19fd0870ea9ca2cba2573))

## 1.3.0

_2026-05-25_ · [`93ac3d65`](https://github.com/s00d/nuxt-i18n-micro/commit/93ac3d659f49c7012fb08ed04b83dea11ab3052e)

### Features

- add default implementations for locale route handling ([`de0dc19`](https://github.com/s00d/nuxt-i18n-micro/commit/de0dc19824e75e45b74ee63cd1c8635ca6a198e4))
- add standalone strategy helper functions ([`ec92229`](https://github.com/s00d/nuxt-i18n-micro/commit/ec92229e8a70247d74a6b8dd22135992d79f24bb))
- **resolver:** add path resolver for custom locale routes ([`3919379`](https://github.com/s00d/nuxt-i18n-micro/commit/3919379f2f1f85a6b177079e13da97317cb9a6d7))
- **path:** add path utility functions for i18n routing ([`fa4f426`](https://github.com/s00d/nuxt-i18n-micro/commit/fa4f426596fa5658c34c5e4f8ea0e2f0d264c9c2))

### Fixes

- update import path for types ([`9937e09`](https://github.com/s00d/nuxt-i18n-micro/commit/9937e090d5734f82f310ef668686a237ab42741f))

### Refactors

- **tests:** remove obsolete tests and streamline test structure ([`e7faf82`](https://github.com/s00d/nuxt-i18n-micro/commit/e7faf82c2f45ecf72772bb79ca336e732b43b793))
- **tests:** remove obsolete snapshot data for SEO attributes ([`4c024cc`](https://github.com/s00d/nuxt-i18n-micro/commit/4c024cc97c870b0ede7ad3a15311014923f0a687))
- **base:** simplify strategy implementation ([`3f6db7d`](https://github.com/s00d/nuxt-i18n-micro/commit/3f6db7d7bc63069785dde441f09d6b59eecf3255))
- **prefix-except-default:** simplify no-prefix strategy implementation ([`f4383d2`](https://github.com/s00d/nuxt-i18n-micro/commit/f4383d24adb733bff6e699fa41fc179b94974743))
- **prefix-and-default:** simplify no-prefix strategy implementation ([`ec6f1a6`](https://github.com/s00d/nuxt-i18n-micro/commit/ec6f1a66a460e10449efca9836dc8f0ec3d00392))
- **prefix:** simplify no-prefix strategy implementation ([`4932534`](https://github.com/s00d/nuxt-i18n-micro/commit/4932534c26d7557c621f2057b29da45348da92d3))
- simplify no-prefix strategy implementation ([`051d36a`](https://github.com/s00d/nuxt-i18n-micro/commit/051d36a37096da3862c5b44383539b425660980b))
- remove unused route building and normalization code ([`fb3da70`](https://github.com/s00d/nuxt-i18n-micro/commit/fb3da70cbcd3609dae863bd282a7108e717b70f8))
- remove unused path and route name utilities ([`f0fb25f`](https://github.com/s00d/nuxt-i18n-micro/commit/f0fb25f6c6577ebfe7968762108c8b2191d58c4c))
- **types:** consolidate and enhance type definitions for path strategy ([`846ce95`](https://github.com/s00d/nuxt-i18n-micro/commit/846ce9536576225e19b95a8fbfae95e301096c58))
- reorganize exports for improved clarity ([`8cf248c`](https://github.com/s00d/nuxt-i18n-micro/commit/8cf248c8899502d00cde1fd2ab77fcdd4431378f))

### Tests

- verify dist strategy artifacts ([`93ac3d6`](https://github.com/s00d/nuxt-i18n-micro/commit/93ac3d659f49c7012fb08ed04b83dea11ab3052e))
- relax memory growth threshold in leak test ([`125c2c2`](https://github.com/s00d/nuxt-i18n-micro/commit/125c2c2d661f4c89825093c67d328e1a7532c0dd))
- **tests:** increase memory leak threshold in unit test ([`46a682e`](https://github.com/s00d/nuxt-i18n-micro/commit/46a682ea5e018e2aee7d449c31109a2a411e8a18))

### Documentation

- update README with new API methods and optimizations ([`ed79906`](https://github.com/s00d/nuxt-i18n-micro/commit/ed7990642233d377e1fdacfa9a4bba94d46419d8))

### Chore

- bump version to 1.3.0 and update scripts ([`f8c9b92`](https://github.com/s00d/nuxt-i18n-micro/commit/f8c9b9254a5e4cc448a3393a9e2dce70d3ffd26f))
- enhance Vite config for warnings and minification ([`6807d16`](https://github.com/s00d/nuxt-i18n-micro/commit/6807d16d508280be1c6e64578da09eec5a9141d1))

## 1.2.0

_2026-02-13_ · [`31af304f`](https://github.com/s00d/nuxt-i18n-micro/commit/31af304f2e71cae1f7d4102fa97be1e6a8ce0b99)

### Fixes

- update return value in getPluginRouteName method ([`31af304`](https://github.com/s00d/nuxt-i18n-micro/commit/31af304f2e71cae1f7d4102fa97be1e6a8ce0b99))

### Refactors

- **resolver:** simplify parameter substitution in path resolution ([`c47c564`](https://github.com/s00d/nuxt-i18n-micro/commit/c47c564d187521b3d68ee567049dde6336c0b776))

## 1.1.3

_2026-02-07_ · [`6f38bbdd`](https://github.com/s00d/nuxt-i18n-micro/commit/6f38bbdd1f5a4ea4e29757a1722644893137f73c)

### Features

- **route-strategy:** remove `includeDefaultLocaleRoute` option ([`6f38bbd`](https://github.com/s00d/nuxt-i18n-micro/commit/6f38bbdd1f5a4ea4e29757a1722644893137f73c))

## 1.1.2

_2026-02-07_ · [`b5306887`](https://github.com/s00d/nuxt-i18n-micro/commit/b53068874489e11d9163a724f6677fc8edb34f88)

### Chore

- **pnpm:** remove `@nuxt/eslint-config` and add `@biomejs/biome` ([`b530688`](https://github.com/s00d/nuxt-i18n-micro/commit/b53068874489e11d9163a724f6677fc8edb34f88))

## 1.1.1

_2026-02-06_ · [`a563141f`](https://github.com/s00d/nuxt-i18n-micro/commit/a563141fb9cdd405e5ac3e9c9d0a80d56a5892b6)

### Fixes

- update version to 1.1.1 in package.json ([`a563141`](https://github.com/s00d/nuxt-i18n-micro/commit/a563141fb9cdd405e5ac3e9c9d0a80d56a5892b6))

### Refactors

- rename parameter in getClientRedirect method ([`69b2f54`](https://github.com/s00d/nuxt-i18n-micro/commit/69b2f5424a442f20c4f9325009cca8ca87b0fe6d))

### Tests

- **strategy-edge-cases:** clean up test cases for applyBaseUrl and factory ([`30b24ae`](https://github.com/s00d/nuxt-i18n-micro/commit/30b24aef7667ae6996fc5c9cf3900cf7d4c7202a))
- **tests:** remove unnecessary whitespace in test-utils-coverage file ([`e8adb62`](https://github.com/s00d/nuxt-i18n-micro/commit/e8adb626d447d1ee37da325e5ea6247563a172b8))
- **tests:** remove unnecessary blank line in coverage test file ([`b359c9a`](https://github.com/s00d/nuxt-i18n-micro/commit/b359c9a757195be80431875f83e9441dc6bf301f))
- update test for PrefixExceptDefaultPathStrategy ([`88e8359`](https://github.com/s00d/nuxt-i18n-micro/commit/88e83591ee3e620d9c1e5bc09885f7a3f9855552))
- remove unused imports and clean up whitespace ([`9fa1fa8`](https://github.com/s00d/nuxt-i18n-micro/commit/9fa1fa84451e10ea839e7dff606e7719e5ac99f3))
- remove unused RouterAdapter import from tests ([`9a69f29`](https://github.com/s00d/nuxt-i18n-micro/commit/9a69f294201243d331b33316b01eb2403100f490))
- add tests for getClientRedirect functionality ([`c2b512f`](https://github.com/s00d/nuxt-i18n-micro/commit/c2b512fb8470ac7f69551385d81bc0ab4c76dd52))

## 1.1.0

_2026-02-06_ · [`7708c007`](https://github.com/s00d/nuxt-i18n-micro/commit/7708c00759e3e8fc9e5b0b018482708c17e52d40)

### Features

- enhance route name resolution for localization ([`7708c00`](https://github.com/s00d/nuxt-i18n-micro/commit/7708c00759e3e8fc9e5b0b018482708c17e52d40))

## 1.0.3

_2026-02-05_ · [`c97eb368`](https://github.com/s00d/nuxt-i18n-micro/commit/c97eb36829998a42b7f6650440df7c97a838ffa6)

### Chore

- bump version to 1.0.3 in package.json ([`c97eb36`](https://github.com/s00d/nuxt-i18n-micro/commit/c97eb36829998a42b7f6650440df7c97a838ffa6))

## 1.0.2

_2026-02-05_ · [`38b51d67`](https://github.com/s00d/nuxt-i18n-micro/commit/38b51d672051da35a2e94b3d9b38263c9913e08f)

### Chore

- bump version to 1.0.2 and update package entries ([`38b51d6`](https://github.com/s00d/nuxt-i18n-micro/commit/38b51d672051da35a2e94b3d9b38263c9913e08f))

## 1.0.1

_2026-02-05_ · [`0aa0c7d9`](https://github.com/s00d/nuxt-i18n-micro/commit/0aa0c7d9a853e560d09f196997e32d9a7edbffc1)

### Chore

- bump version to 1.0.1 in package.json ([`0aa0c7d`](https://github.com/s00d/nuxt-i18n-micro/commit/0aa0c7d9a853e560d09f196997e32d9a7edbffc1))

## 1.0.0

_2026-02-03_ · [`650c1f10`](https://github.com/s00d/nuxt-i18n-micro/commit/650c1f10290836a97edddf7a277d89b5c814eb74)

### Features

- add initial implementation for path strategy module ([`650c1f1`](https://github.com/s00d/nuxt-i18n-micro/commit/650c1f10290836a97edddf7a277d89b5c814eb74))
