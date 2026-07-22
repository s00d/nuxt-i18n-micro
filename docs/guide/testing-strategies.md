---
title: 'Testing routing strategies'
description: 'How the nuxt-i18n-micro repo tests i18n routing strategies and static generation.'
outline: deep
---

# Testing routing strategies

The module ships integration tests that exercise all four routing strategies against a shared fixture (`test/fixtures/strategy`).

## Commands

```bash
# All strategy scenarios (static generate + SSR build per strategy)
pnpm run test:strategies

# Unit / build project (includes strategy tests + generate regressions)
pnpm run test:unit

# Browser e2e project (shared prebuilt fixtures + isolated specs), via Vitest
pnpm run test:e2e

# Everything (unit + packages + e2e)
pnpm run test
```

## What `test/strategies.test.ts` covers

For each strategy (`no_prefix`, `prefix_except_default`, `prefix`, `prefix_and_default`):

1. **Static generate** — runs `nuxi generate` into an isolated build dir (`NUXT_TEST_BUILD_DIR`), serves `public/`, checks locale routes.
2. **SSR build** — runs `nuxi build`, starts the Nitro server, checks the same routes over HTTP.

Generate-only regressions (prerender success, payload files, nested routes) live in the same file via `registerStrategyGenerateTests()` (`test/helpers/strategy-generate.ts`).

## Parallelism

Each test file uses its own `NUXT_TEST_BUILD_DIR` under `test/fixtures/<name>/.nuxt-test/<test-id>/`, so Vitest can run build-spawning tests in parallel without clobbering `.nuxt` / `.output`.

## E2E shared fixtures

Browser e2e specs run through Vitest (`--project e2e`) driving a real Playwright browser against real Nuxt servers — see `test/setup/vitest-e2e.ts`. Specs without per-spec `nuxtConfig` connect to prebuilt servers started once by `test/setup/vitest-global-setup.ts` (build/serve logic in `shared-fixtures-core.ts`) via `setupE2E({ shared: '<fixture>' })`. Specs with custom config or `dev: true` build their own app per file via `setupE2E({ rootDir, nuxtConfig })`.

See also [Testing the module](/guide/testing).
