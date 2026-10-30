---
title: 'Release smoke checks'
description: 'Build a real Nuxt app against the packed or published module, run it locally or on serverless presets, and verify SSR, payloads and SEO.'
outline: [2, 3]
---

# Release smoke checks

The test suites run against the source; these checks install the module the way a user does and test the running app. Run them before a release (packed from the checkout) and after one (from npm), and whenever you touch payload output for serverless or Edge presets. The app is [`test/deploy-smoke`](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/deploy-smoke).

## Sources

| Source | Installs | Catches |
| --- | --- | --- |
| `git` | Tarballs packed from the checkout | Packaging problems before publishing: missing files, unresolved `workspace:` / `catalog:`, undeclared dependencies |
| `npm` | `nuxt-i18n-micro@latest` or a named version | A bad or missing publish, version mismatch between the module and `@i18n-micro/*` |

`smoke-pack` packs every workspace package with `pnpm pack` (only pnpm rewrites `workspace:` and `catalog:`) and points each tarball's `@i18n-micro/*` dependencies at its siblings, because the local versions are not on npm yet.

## What is checked

`smoke-verify --url <base>` (HTTP, so it runs against a local server or a deployment):

- `/`, `/de`, `/fr`, `/de/about` render their own translations; plurals resolve; no raw keys in the HTML;
- `/_locales/index/de/data.json` returns the chunk and is cacheable (not `no-store`);
- `hreflang` alternates with `x-default`, `canonical`, `og:locale`, and `<html lang>` matching the locale.

`smoke-browser --url <base>` (Playwright) adds hydration, client navigation between pages and locales with no raw key visible mid-transition, and no uncaught page errors.

## Run locally

```bash
pnpm run prepack
pnpm -C scripts cli smoke-pack --app test/deploy-smoke
cd test/deploy-smoke
printf 'packages:\n  - .\n' > pnpm-workspace.yaml
pnpm install --no-frozen-lockfile
pnpm exec nuxt build
PORT=3000 node .output/server/index.mjs &
cd ../..
pnpm -C scripts cli smoke-verify --url http://127.0.0.1:3000
pnpm -C scripts cli smoke-browser --url http://127.0.0.1:3000
```

For a published version, skip `smoke-pack` and set the dependency to `nuxt-i18n-micro@<version>` before installing.

## Serverless presets locally

The unit tests and the `node-server` fixtures do not catch SSR that cannot read `public/` on a function or Edge preset. `preset-smoke` packs, installs, builds `test/deploy-smoke` with a real preset, runs it with the runner that matches the artifact, and calls `smoke-verify`:

```bash
pnpm run prepack                       # once
pnpm run test:presets                  # vercel, cloudflare_pages, netlify
pnpm run test:presets:vercel           # one preset
pnpm -C scripts cli preset-smoke --preset vercel --public-assets false   # SSR from serverAssets only
pnpm -C scripts cli preset-smoke --preset vercel --skip-pack --skip-install   # faster reruns
```

`--browser` also runs `smoke-browser`; `--skip-build` reuses the preset output.

| Preset | Runner |
| --- | --- |
| `vercel` | Imports `.vercel/output/functions/__fallback.func/index.mjs` as a Node listener (as Nitro's own preset tests do; nitropack 2 has no `preview` for it) |
| `cloudflare_pages` | `wrangler pages dev dist` |
| `netlify` | Imports `.netlify/functions-internal/server/main.mjs` behind a local HTTP server |

`vercel dev`, emulators and swapping to a Node adapter are not used: they run a different artifact.

## CI workflow

`.github/workflows/release-smoke.yml` runs **manually** (Actions → *release smoke* → *Run workflow*), after a publish has reached npm. Inputs: `source` (`both`, `git`, `npm`), `version` (default `latest`), `deploy`.

With `deploy` it deploys the **published** package to Cloudflare Pages and Vercel, waits for the deployment, and runs `smoke-verify` and `smoke-browser` against the live URL. Use dedicated projects: every run replaces the deployment.

| Name | Kind | Where to get it |
| --- | --- | --- |
| `CLOUDFLARE_PROJECT_NAME` | variable | A direct-upload Pages project (*Workers & Pages* → *Create* → *Pages* → *Upload assets*) |
| `CLOUDFLARE_ACCOUNT_ID` | secret | The ID in the dashboard URL, or *Account details* |
| `CLOUDFLARE_API_TOKEN` | secret | Custom token with one permission: Account · Cloudflare Pages · Edit; no IP filter |
| `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | secret | `pnpm dlx vercel link` in `test/deploy-smoke` writes them to `.vercel/project.json` (do not commit it) |
| `VERCEL_TOKEN` | secret | A token scoped to the account or team that owns the project |

## Related

- [Maintenance commands](/contributing/maintenance-commands)
- [Deployment](/guide/deployment)
- [Contributing](/contributing/)
