---
title: 'Preset local testing'
description: 'Local production-preset checks for Vercel / Cloudflare / Netlify — Nitro-style runners + smoke-verify.'
outline: 'deep'
---

# Preset local testing

Unit tests and the `serverless` fixture (Nitro `node-server`) do **not** catch bugs where
SSR on a function/edge preset cannot read `public/` from disk. That class of failure
(#261) needs a **real production preset build** and a runner that matches how the
ecosystem validates those artifacts.

## Pyramid (local)

```
Tier 0  unit heuristics (shouldReadPayloadsFromPublicDir, …)
Tier 1  nuxi build --preset + canonical local runner → smoke-verify
```

Real Vercel CDN+function deploys are optional and out of this guide — use
[Release Smoke Checks](/guide/release-smoke) with `deploy: true` if you need a live URL.

Assert layer:
[`smoke-verify`](https://github.com/s00d/nuxt-i18n-micro/blob/main/scripts/src/commands/smoke-verify.ts)
(and optionally `smoke-browser`).

Fixture: [`test/deploy-smoke`](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/deploy-smoke).

## How others do it

| Source | Approach |
| --- | --- |
| [Nitro `test/presets/vercel.test.ts`](https://github.com/nitrojs/nitro/blob/v2/test/presets/vercel.test.ts) | Build vercel preset → import `__fallback.func/index.mjs` → `listen(handle)` → fetch |
| Nitro Cloudflare tests | Build → Miniflare / wrangler against the Worker output |
| Astro community | Vercel adapter has **no** local preview; node-adapter is a **different** bundle — do not use that to validate Vercel |

On **nitropack 2.x** the vercel SSR preset sets `commands.preview: ""`. There is no
`nuxi preview` for that output. Tier 1 follows Nitro v2’s harness (import the function
entry). Nitro 3’s `srvx` preview is a future upgrade path.

## Local commands

```bash
# once: build packages + module
pnpm run prepack

# all three presets (pack → install → build → run → smoke-verify)
pnpm run test:presets

# one preset
pnpm run test:presets:vercel
pnpm run test:presets:cloudflare
pnpm run test:presets:netlify

# CLI
pnpm -C scripts cli preset-smoke --preset vercel
pnpm -C scripts cli preset-smoke --preset all
# no public/_locales tree (SSR must still work from serverAssets)
pnpm -C scripts cli preset-smoke --preset vercel --public-assets false

# reuse an existing pack/install (faster iteration after the first run)
pnpm -C scripts cli preset-smoke --preset vercel --skip-pack --skip-install
```

| Preset | Local runner |
| --- | --- |
| `vercel` | Import `.vercel/output/functions/__fallback.func/index.mjs` (Node listener) — same as Nitro CI |
| `cloudflare_pages` | `wrangler pages dev dist` (Nitro `commands.preview`) |
| `netlify` | Import `.netlify/functions-internal/server/main.mjs` (Fetch handler → local HTTP) |

First run packs tarballs and installs `test/deploy-smoke` — that can take several minutes.
Later runs with `--skip-pack --skip-install` only rebuild the chosen preset.

### What we deliberately skip

- `vercel dev` — development, not the production Build Output
- Firebase App Hosting emulator — **dev** `startCommand`, not dist
- Node/adapter swap “for local preview” — different artifact
- Pure filesystem asserts instead of HTTP SSR checks

## Related

- [Release Smoke Checks](/guide/release-smoke)
- [FAQ — Vercel SSR translations](/guide/faq)
- [Maintenance Commands](/guide/maintenance-commands)
