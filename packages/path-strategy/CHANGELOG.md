# @i18n-micro/path-strategy

## 1.3.2

### Build and publish

- Shared runtime chunks use stable names (`base-strategy.js` / `common.js`) instead of content-hashed filenames; smaller tarballs without per-entry sourcemaps.
- Type declaration paths for subpath exports live under `dist/strategies/*.d.ts` (and matching `.d.cts` for `require`), aligned with `package.json` `exports`.
- Dual-package types: `import` resolves `.d.ts`, `require` resolves `.d.cts` for `"type": "module"`.
- Removed redundant top-level `module` field when `exports` is defined.

### Migration

- Prefer official subpaths (`@i18n-micro/path-strategy/prefix`, `/no-prefix`, etc.). Deep imports to old flat type paths such as `dist/prefix-strategy.d.ts` are no longer published; use `exports` or subpath imports instead.
- Internal chunk file names changed; do not import hashed `base-strategy-*` or `common-*` chunks directly.
