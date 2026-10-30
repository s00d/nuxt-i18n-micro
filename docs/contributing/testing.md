---
title: 'Testing the module'
description: 'How the nuxt-i18n-micro repo is tested: unit, integration and e2e projects, shared fixtures, recipes, isolated builds and mutation testing.'
outline: [2, 3]
---

# Testing the module

The repository's tests split into fast unit tests, build-heavy integration suites and browser journeys, all against a few shared Nuxt fixtures. Read this before you add a test or a fixture. You learn which command to run, where a new check belongs, and how builds stay safe to run in parallel.

To test your own app, see [Testing your app](/guide/testing).

## Commands

```bash
pnpm run test:unit         # no builds, no browser
pnpm run test:integration  # suites that build or generate a fixture
pnpm run test:strategies   # static generate of every strategy
pnpm run test:e2e          # browser journeys
pnpm run test:packages     # one project per packages/*
pnpm run test              # all of the above
```

Run `pnpm exec playwright install chromium` once before e2e.

| Project | Contents | Config |
| --- | --- | --- |
| `unit` | pure unit tests, no Nuxt build | `vitest.unit.config.ts` |
| `integration` | suites that run `nuxi build` / `generate` or `@nuxt/test-utils` `setup()` | `vitest.integration.config.ts` |
| `e2e` | journeys in `test/journeys/*.spec.ts` against real servers | `vitest.e2e.config.ts` |
| packages | one per `packages/*` | `packages/*/vitest.config.ts` |

`INTEGRATION_TESTS` in `test/setup/heavy-tests.ts` is the one list of heavy suites: the integration config includes it and the unit config excludes it.

## Fixtures

All fixtures are apps under `test/fixtures/`:

| Fixture | Covers |
| --- | --- |
| `basic` | the public API; `basic/layer` is the only nested app, because `extends` needs a second root |
| `strategy` | the four strategies, detection and global URL shapes |
| `seo` | head tags |
| `integrations` | `@nuxt/content` and `@nuxtjs/seo` |
| `translation-watcher` | dev HMR |

The benchmark apps are not fixtures: they live in `scripts/perf-fixtures`.

A new check goes into an existing fixture as a page. A build creates an empty `locales/pages/<page>/<locale>.json` for every page without one; commit those files. A file that appears mid-run changes the fixture hash, and the forks then reject the recipe (`bound to conflicting identities`).

## Variants are recipes

`test/recipes.ts` names one build per variant of a fixture. A variant is one recipe line, never a copied directory:

```ts
'strategy-prefix': app('strategy-prefix', 'strategy', { STRATEGY: 'prefix', LOCALE_COOKIE: 'user-locale' }),
'basic-n3': app('basic-n3', 'basic', { BASIC_VARIANT: 'n3' }),
'strategy-baseurl': app('strategy-baseurl', 'strategy', { STRATEGY: 'prefix' }, { app: { baseURL: '/examples' } }),
```

- The third argument is env, read by the fixture's `nuxt.config.ts` (`BASIC_VARIANT`, `SEO_VARIANT`, `STRATEGY`, `TRANSLATION_PAYLOADS`).
- The fourth is a `nuxtConfig` override, for a global URL shape. It is a defu merge, so arrays concatenate: never pass `locales` that way, switch them by env.
- A suite that builds a fixture itself (`setup()`, `nuxi build` / `generate`) sets the same env as the recipe.

Builds are hashed by fixture directory and `src/`, cached in `test/.untestutils/builds` (CI caches that directory) and started once per run.

## Parallel builds

- **Own build dir per suite.** `isolatedBuild(fixture, name)` points `NUXT_TEST_BUILD_DIR` at `test/.fixture-builds/<fixture>/<name>/`, outside the fixture: a build written into it would change the recipe hash mid-run.
- **OS-assigned ports.** Take ports from `getFreePort()` (`test/helpers/port.ts`) and stop servers with `stopChild()` (`test/helpers/subprocess.ts`), which kills the whole process group. Never free a port by killing whatever owns it: with parallel workers that can kill a sibling suite's server.
- **No writes inside the repo tree.** Specs that edit locale files or start a server from the build output run on a temp copy from `tmpFixture()` in `test/helpers/tmp-fixture.ts`.

Each strategy has one file, `test/strategies-<strategy>.test.ts`, so Vitest runs all four at once. They share `test/helpers/strategy-suite.ts`: `nuxi generate` into an isolated build, then the output is read from disk. It is one chain (a single `test`), so a strategy costs one build. The server side of the same routes is checked by `test/journeys/strategies-*.spec.ts` on the recipe's server build.

## Journeys

Browser e2e runs through [untestutils](https://github.com/s00d/untestutils) and a real Playwright browser.

- One spec walks one real flow on one recipe: visit, browse, switch locale, reload, detection, head. Each step has a `// step n: action → assert` comment.
- One harness per file: `test.override({ harness: '<recipe>' })` at the top of the `describe`. A second harness in the same file would reach the first one's server, so split it into its own file.
- No `waitForTimeout`, no `networkidle`, no optional `if` assertions. Statuses come from `request.get(path)`, with `{ maxRedirects: 0 }` where the redirect itself is checked. Arm console collectors before the first `goto`.
- Specs import `test` from `test/helpers/guarded-test.ts`. It fails a test on any document response >= 500, uncaught page error, console error or hydration warning, even when the assertions pass. A test that expects one calls `guard.allow(/pattern/)`; `test.override({ guardAllow: [/pattern/] })` allows a pattern for a whole `describe` (the dev HMR journeys).
- Retries cover infrastructure only (`retryInfra`, CI): a failing assertion fails.

## Routing goldens

`test/routing-characterization` runs every app in `scenarios.ts` under every strategy and records what each URL reads as and where each navigation lands. The harness calls the code the module calls (`mergeDefineI18nRouteMeta`, `extractDefineI18nRouteData`, `RouteGenerator`), so do not copy module logic into it: a copy cannot fail.

- Pages are not only what the file scanner makes: `modulePages` are pushed as in `pages:extend`, with or without a name, and `noPages` runs Nuxt's stub router with no records (`pages: false`).
- Input is frozen, so a package that writes to pages or routes throws in the golden. Every page is tagged with its file, and a record that loses `meta` is listed under the invariant breaks.
- A golden diff is either an intended fix or a bug. Read all of it before you regenerate.

## Mutation testing

`pnpm run test:mutation` runs [Stryker](https://stryker-mutator.io/) on one package. It changes the source (`<` to `<=`, a branch removed, a string emptied) and reruns the tests that cover the change; a surviving mutant is a behaviour no test pins.

```bash
MUTATE_PACKAGE=core pnpm run test:mutation                      # score; JSON report in test-results/mutation/
MUTATE_PACKAGE=core MUTATE_ALL_KILLERS=1 pnpm run test:mutation # record every test that kills each mutant
```

With `MUTATE_ALL_KILLERS=1` the report lists every killing test per mutant, so a test whose mutants are all killed by others can be deleted. Package tests are kept to a small set that still kills every mutant any test kills. New tests are scenarios (set up like a real app, act, assert, act again), not one-line checks.

## Related

- [Contributing](/contributing/)
- [Maintenance commands](/contributing/maintenance-commands)
- [Testing your app](/guide/testing)
