---
url: 'https://s00d.github.io/nuxt-i18n-micro/guide/testing-strategies.md'
description: >-
  How the nuxt-i18n-micro repo tests i18n routing strategies and static
  generation.
---

# Testing routing strategies

The module ships integration tests that exercise all four routing strategies against a shared fixture (`test/fixtures/strategy`).

## Commands

```bash
# All strategy scenarios (static generate + SSR build per strategy)
pnpm run test:strategies

# Fast unit tests only — no builds, no browser (~1s)
pnpm run test:unit

# Build-heavy integration suites (strategies, generate, production servers)
pnpm run test:integration

# Browser e2e project (shared prebuilt fixtures + isolated specs), via Vitest
pnpm run test:e2e

# Everything (unit + integration + e2e + packages)
pnpm run test
```

## Project layout

| Project          | Contents                                                                  | Config                         |
| ---------------- | ------------------------------------------------------------------------- | ------------------------------ |
| `unit`           | pure unit tests, no Nuxt build                                            | `vitest.unit.config.ts`        |
| `integration`    | suites that spawn `nuxi build`/`generate` or `@nuxt/test-utils` `setup()` | `vitest.integration.config.ts` |
| `e2e`            | browser specs (`*.spec.ts`) against real servers                          | `vitest.e2e.config.ts`         |
| package projects | one per `packages/*`                                                      | `packages/*/vitest.config.ts`  |

The `unit` / `integration` split has a single source of truth: `INTEGRATION_TESTS` in `test/setup/heavy-tests.ts` — the integration config includes that list and the unit config excludes it, so the two can never drift.

## What the strategy suites cover

For each strategy (`no_prefix`, `prefix_except_default`, `prefix`, `prefix_and_default`) there is one file — `test/strategies-<strategy>.test.ts` — so Vitest, which parallelizes per file, can run all four concurrently. They share one implementation in `test/helpers/strategy-suite.ts`:

1. **Static generate** — runs `nuxi generate` into an isolated build dir (`NUXT_TEST_BUILD_DIR`), serves `public/`, checks locale routes.
2. **SSR build** — runs `nuxi build`, starts the Nitro server, checks the same routes over HTTP.

Generate-only regressions (prerender success, payload files, nested routes) live in `test/strategies-generate.test.ts` via `registerStrategyGenerateTests()` (`test/helpers/strategy-generate.ts`).

## Parallelism

Two rules keep build-spawning suites safe to run concurrently:

* **Own build dir per suite and phase** — `isolatedBuild(fixture, name)` points `NUXT_TEST_BUILD_DIR` at `test/fixtures/<fixture>/.nuxt-test/<name>/`, so nothing rimrafs or reads another suite's output.
* **OS-assigned ports, handle-based shutdown** — take ports from `getFreePort()` (`test/helpers/port.ts`, binds port 0) and stop servers with `stopChild()` (`test/helpers/subprocess.ts`), which kills the whole process group. Never free a port by killing whatever process owns it (`lsof -ti tcp:<port>` + `SIGKILL`): with parallel workers that can kill a sibling suite's server, which surfaces as an unrelated `ERR_IPC_CHANNEL_CLOSED` crash.

## E2E shared fixtures

Browser e2e specs run through Vitest (`--project e2e`) driving a real Playwright browser against real Nuxt servers — see `test/setup/vitest-e2e.ts`. Specs without per-spec `nuxtConfig` connect to prebuilt servers started once by `test/setup/vitest-global-setup.ts` (build/serve logic in `shared-fixtures-core.ts`) via `setupE2E({ shared: '<fixture>' })`. Specs with custom config or `dev: true` build their own app per file via `setupE2E({ rootDir, nuxtConfig })`.

See also [Testing the module](/guide/testing).
