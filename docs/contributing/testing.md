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

# Fast unit tests only — no builds, no browser (~1s)
pnpm run test:unit

# Build-heavy integration suites (strategies, generate, production servers)
pnpm run test:integration

# Browser e2e journeys (untestutils recipes, prebuilt fixtures), via Vitest
pnpm run test:e2e

# Mutation score of one package (see below)
MUTATE_PACKAGE=core pnpm run test:mutation

# Everything (unit + integration + e2e + packages)
pnpm run test
```

## Project layout

| Project          | Contents                                                                  | Config                         |
| ---------------- | ------------------------------------------------------------------------- | ------------------------------ |
| `unit`           | pure unit tests, no Nuxt build                                            | `vitest.unit.config.ts`        |
| `integration`    | suites that spawn `nuxi build`/`generate` or `@nuxt/test-utils` `setup()` | `vitest.integration.config.ts` |
| `e2e`            | browser journeys (`test/journeys/*.spec.ts`) against real servers         | `vitest.e2e.config.ts`         |
| package projects | one per `packages/*`                                                      | `packages/*/vitest.config.ts`  |

The `unit` / `integration` split has a single source of truth: `INTEGRATION_TESTS` in `test/setup/heavy-tests.ts` — the integration config includes that list and the unit config excludes it, so the two can never drift.

## What the strategy suites cover

For each strategy (`no_prefix`, `prefix_except_default`, `prefix`, `prefix_and_default`) there is one file — `test/strategies-<strategy>.test.ts` — so Vitest, which parallelizes per file, can run all four concurrently. They share one implementation in `test/helpers/strategy-suite.ts`:

1. **Static generate** — runs `nuxi generate` into an isolated build dir (`NUXT_TEST_BUILD_DIR`) and reads the output from disk: locale routes, prerender success, payload files, nested routes.
2. **SSR build** — runs `nuxi build`, starts the Nitro server, checks the same routes over HTTP.

Each phase is one chain (a single `test`), so a strategy costs two builds.

## Parallelism

Two rules keep build-spawning suites safe to run concurrently:

- **Own build dir per suite and phase** — `isolatedBuild(fixture, name)` points `NUXT_TEST_BUILD_DIR` at `test/fixtures/<fixture>/.nuxt-test/<name>/`, so nothing rimrafs or reads another suite's output.
- **OS-assigned ports, handle-based shutdown** — take ports from `getFreePort()` (`test/helpers/port.ts`, binds port 0) and stop servers with `stopChild()` (`test/helpers/subprocess.ts`), which kills the whole process group. Never free a port by killing whatever process owns it (`lsof -ti tcp:<port>` + `SIGKILL`): with parallel workers that can kill a sibling suite's server, which surfaces as an unrelated `ERR_IPC_CHANNEL_CLOSED` crash.

## E2E journeys

Browser e2e runs through [untestutils](https://github.com/s00d/untestutils) and a real Playwright browser against real Nuxt servers.

- **Recipes** — `test/recipes.ts` names one build per fixture variant (`app('strategy-prefix', 'strategy', { STRATEGY: 'prefix' })`). Builds are hashed by fixture dir + `src/`, cached in `test/.untestutils/builds` (CI caches that dir) and started once per run.
- **Journeys** — `test/journeys/*.spec.ts`. One spec walks one real flow on one fixture: visit, browse, switch locale, reload, detection, head. Each step has a `// step n: action → assert` comment, and a `// was: <old spec › test>` comment where an older assertion was folded in.
- **One harness per file** — `test.override({ harness: '<recipe>' })` at the top of the `describe`. A second harness in the same file would reach the first one's server, so split such journeys into their own files.
- **Stability rules** — no `waitForTimeout`, no `networkidle`; statuses come from `request.get(path)`, with `{ maxRedirects: 0 }` where the redirect itself is checked; no optional `if` assertions; console collectors are armed before the first `goto`. Retries cover infrastructure only (`retryInfra`, CI): a failing assertion fails.
- **Never write inside the repo tree** — specs that edit locale files (dev HMR) or a config (`storage-cwd`) run on a temp copy from `tmpFixture()` in `test/helpers/tmp-fixture.ts`, so a parallel build never hashes a patched fixture.

## Mutation testing

`pnpm run test:mutation` runs [Stryker](https://stryker-mutator.io/) on one package. Stryker changes the source (`<` to `<=`, a branch removed, a string emptied) and reruns the tests that cover the change; a surviving mutant is a behaviour no test pins.

```bash
MUTATE_PACKAGE=core pnpm run test:mutation                      # score; JSON report in test-results/mutation/
MUTATE_PACKAGE=core MUTATE_ALL_KILLERS=1 pnpm run test:mutation # record every test that kills each mutant
```

With `MUTATE_ALL_KILLERS=1` the JSON report lists every killing test per mutant. A test whose killed mutants are all also killed by other tests can be deleted. Package tests are kept to a small set (greedy set cover) that still kills every mutant any test kills, and new tests are written as scenarios (set up like a real app, act, assert, act again) rather than one-line checks.

See also [Testing the module](/guide/testing).
