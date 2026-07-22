---
title: "Testing routing strategies"
description: "How the nuxt-i18n-micro repo tests i18n routing strategies and static generation."
outline: deep
---

# Testing routing strategies

The module ships integration tests that exercise all four routing strategies against a shared fixture (`test/fixtures/strategy`).

## Commands

```bash
# All strategy scenarios (static generate + SSR build per strategy)
pnpm run test:strategies

# Full root Vitest suite (includes strategy tests + generate regressions)
pnpm run test:vitest

# Playwright E2E (shared prebuilt fixtures + isolated specs)
pnpm run test
```

## What `test/strategies.test.ts` covers

For each strategy (`no_prefix`, `prefix_except_default`, `prefix`, `prefix_and_default`):

1. **Static generate** — runs `nuxi generate` into an isolated build dir (`NUXT_TEST_BUILD_DIR`), serves `public/`, checks locale routes.
2. **SSR build** — runs `nuxi build`, starts the Nitro server, checks the same routes over HTTP.

Generate-only regressions (prerender success, payload files, nested routes) live in the same file via `registerStrategyGenerateTests()` (`test/helpers/strategy-generate.ts`).

## Parallelism

Each test file uses its own `NUXT_TEST_BUILD_DIR` under `test/fixtures/<name>/.nuxt-test/<test-id>/`, so Vitest can run build-spawning tests in parallel without clobbering `.nuxt` / `.output`.

## Playwright shared fixtures

E2E specs without per-spec `nuxtConfig` use prebuilt servers from `test/setup/global-setup.ts` (`useSharedFixture`). Specs with custom config stay in the `isolated` Playwright project and build per worker.

See also [Testing the module](/guide/testing).
