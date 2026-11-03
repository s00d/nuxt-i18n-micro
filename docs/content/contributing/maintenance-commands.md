---
title: 'Maintenance commands'
description: 'Repository checks of the scripts CLI: generated docs, API surface, payload budget, dependency and fixture audits, versions and the release preflight.'
outline: [2, 3]
navigation:
  order: 40
---

# Maintenance commands

These commands check the repository itself, not apps that use the module. Run them when you change exports, docs, dependencies or fixtures, and before a release. Each catches a drift that builds and tests do not notice.

All of them live in the `scripts/` workspace package and run through one CLI; `--help` prints every flag:

```bash
pnpm -C scripts cli <command> --help
```

## Commands

| Command | Root script | Catches |
| --- | --- | --- |
| [`docs-generate`](#docs-generate) | `docs:generate`, `docs:generate:check` | Generated docs regions out of date with the code |
| [`api-surface`](#api-surface) | `api:surface`, `api:surface:update` | An export removed or retyped |
| [`docs-audit`](#docs-audit) | `audit:docs` | Undocumented options, dead nav/sidebar entries and links |
| [`deps-audit`](#deps-audit) | `audit:deps` | Versions outside the catalog, imports never declared |
| [`fixtures-audit`](#fixtures-audit) | `audit:fixtures` | Unreferenced fixtures, committed build output |
| [`payload-budget`](#payload-budget) | `budget:payload`, `budget:payload:update` | `__NUXT_DATA__` or client assets growing |
| `check-versions` | `check:versions` | A changed package without a version bump (`--npm`: version already published) |
| `verify-packages` | `verify:packages`, `verify:packages:publint` | Broken `exports` / `files` in a package |
| `compare-published` | `compare:published` | The packed packages against the versions on npm |
| `consumer-types` | `check:consumer` | Published `.d.ts` that break a user: Are The Types Wrong, then `tsc` with `skipLibCheck: false` under `bundler` and `node16` |
| `oldest-versions` | `check:oldest` | A peer range that fails at its floor: Nuxt 3.18, VitePress 1.0, Vue 3.3, vue-router 4.5.1 |
| `http-fuzz` | `test:fuzz` | Off-origin redirects, header injection, reflected HTML, traversal, crashes under hostile HTTP. For release checks, not CI |
| `ensure-release-source` | `release:source` | Root `version` or `CHANGELOG.md` changed outside `cli release` |
| [`preflight`](#preflight) | `preflight` | All release gates in one run |

`release` and `bump` are covered in [Publishing](#publishing). `performance`, `preset-smoke` and the `smoke-*` commands are covered in [Release smoke checks](/contributing/release-smoke) and [Benchmark methodology](/contributing/performance-methodology).

## docs-generate

Writes the generated parts of the docs from the code. `docs:dev` and `docs:build` run it first; CI and `preflight` run `--check`, which fails when a page would change.

| Output | Read from |
| --- | --- |
| [Module options](/api/module-options) tables and `option:<path>` regions | `ModuleOptions` in `packages/types/src/index.ts` (TypeScript AST) |
| [Helpers](/api/methods) index and `method:<name>` regions | `PluginsInjections`, `NuxtAppOnlyInjections` in `src/runtime/plugins/01.plugin.ts` (TypeDoc) |
| Composable signatures (`symbol:<name>`) | `src/runtime/composables/*.ts` (TypeDoc) |
| Component props, slots, events (`component:<tag>`) | `src/runtime/components/*.vue` (vue-docgen-api) |
| [Package APIs](/api/packages) index and `docs/api/packages/*.md` | `scripts/api-surface/*.api.txt` |
| Payload budget table in [Performance](/guide/performance) | `scripts/payload-budget.json` |

A region is marked in a hand-written page and replaced on every run:

```md
<!-- generated:method:$t — do not edit; run `pnpm run docs:generate` -->
<!-- /generated:method:$t -->
```

A fixed page that lacks its region makes the command exit with an error; an optional region (an `option:*` or `method:*` block) is filled only where a page has one. To change generated text, edit the JSDoc (or `@slot` comment) in the source and rerun. Tests require a comment on every prop, slot, helper and composable.

## api-surface

Compares the exported API of every package with the committed snapshots in `scripts/api-surface/*.api.txt`: one line per export and per class member. It reads `src` through the TypeScript program, so no build is needed. Removals and signature changes fail; additions are reported.

```bash
pnpm run api:surface
pnpm run api:surface:update   # accept the current surface
pnpm -C scripts cli api-surface --package core
```

After an accepted change run `api:surface:update`, then `docs:generate`, in that order: the package pages read the snapshots.

## docs-audit

Fails on an option of `ModuleOptions` that appears nowhere in `docs/`, a nav or sidebar entry pointing at a missing page, and a link to a missing page. Warns on a page no nav or sidebar reaches. Dynamic routes (`[param].md`) and `cleanUrls` are resolved the way VitePress does.

```bash
pnpm run audit:docs
pnpm -C scripts cli docs-audit --warnings-as-errors
```

## deps-audit

Fails when a dependency is pinned outside the `pnpm-workspace.yaml` catalog or a package imports something it does not declare (`undeclared-import`). Warns on imports satisfied only by a devDependency, `import type` of an undeclared package, unused catalog entries, and peers without a matching devDependency. Comments and template literals are ignored when scanning.

```bash
pnpm run audit:deps
pnpm -C scripts cli deps-audit --warnings-as-errors
```

## fixtures-audit

Lists fixtures under `test/fixtures/` that nothing in `test/`, `.github/`, `package.json` or the Vitest configs references, and build output (`.nuxt`, `.output`, `.output-shared`, `.nuxt-test`, `test-results`) inside a fixture. It never deletes. `--strict` fails only on **committed** build output. `pnpm run clean:test` removes local build output except `.output`.

```bash
pnpm run audit:fixtures
pnpm -C scripts cli fixtures-audit --strict
```

## payload-budget

Builds an app (default: the playground), serves it, and measures `__NUXT_DATA__` per route and the client assets against `scripts/payload-budget.json`. The playground's dictionary is deliberately huge, so the numbers are a fixed point for comparison, not what a real app ships.

```bash
pnpm run budget:payload
pnpm -C scripts cli payload-budget --skip-build   # reuse .output
pnpm run budget:payload:update                    # record with --tolerance headroom (default 10 %)
```

## preflight

Runs the preflight gates, publishes nothing, and reports all results at once (the `release:*` scripts stop at the first failure). `release:check` also runs prepack, format, lint, typecheck, compare-published and tests, so preflight alone is not a full release check. Gates in order: `deps-audit`, `verify-packages --publint`, `api-surface`, `docs-audit`, `docs-generate --check`, `fixtures-audit --strict`, `check-versions`, `ensure-release-source`, `ensure-npm-auth` (with `--npm`), `payload-budget` (with `--budget`).

```bash
pnpm run preflight
pnpm -C scripts cli preflight --npm       # registry checks and npm auth too
pnpm -C scripts cli preflight --offline   # skip network gates
pnpm -C scripts cli preflight --budget    # also build and check the payload budget
```

Before pushing a change set, maintainers run: `prepack`, `format`, `lint`, `typecheck`, `check:versions -- --npm`, `release:source`, `compare:published`, plus `test` when runtime or routing changed. `release:check` chains most of these. `ensure-release-source` is part of `release:check`, `preflight` and every release command.

## Publishing

You pick every version level, and you start every publish. No command reads a level from commit messages, and no CI workflow publishes to npm.

| What | Patch | Minor | Major |
| --- | --- | --- | --- |
| Root module | `pnpm run release:patch` | `pnpm run release:minor` | `pnpm run release:major` |
| Packages | `pnpm run bump --level patch --packages <names>` | `pnpm run bump --level minor --packages <names>` | `pnpm run bump --level major --packages <names>` |

Tests run by default. When CI already passed, add `--ci-passed` to any release command: see [Skip the local tests](#skip-the-local-tests).

### Root module

`release:patch`, `release:minor` and `release:major` run `pnpm -C scripts cli publish --bump <level>`, which does, in order:

1. `release:auth`: fails when you are not logged in to npm.
2. `prepack`: builds the packages, the module and the client.
3. `format:check`, `lint`, `typecheck`, `check:versions -- --npm`, `release:source`, `compare:published`.
4. `test`.
5. `pnpm -C scripts cli release --bump <level>`: changelogen writes the root `version` and `CHANGELOG.md`, commits `chore(release): vX.Y.Z` and tags it. `--bump` is required.
6. `pnpm publish -r`, then `git push --follow-tags`.

`pnpm publish -r` also ships every package whose version is not on npm yet, so bump and commit the packages first.

### Packages

`bump` edits only `version` in the named `packages/*/package.json`. It does not commit, tag or publish. `--packages` takes short or scoped names separated by commas, or `all`.

```bash
pnpm run bump --level minor --packages core,vue
pnpm run check:versions                          # names the dependents that still need a bump
pnpm run bump --level patch --packages runtime,react
git commit -am "chore(packages): bump versions"
pnpm run release:packages                        # the steps above, without the root bump
```

`release:packages` leaves the root alone: its version is already on npm, so `pnpm publish -r` skips it, and no tag is created. To see what would ship without publishing, run `pnpm publish -r --dry-run`.

`check:versions` fails on a changed package that was not bumped, and on a dependent of a bumped package; it never picks the level.

### Skip the local tests

`--ci-passed` works on every release command and on `release:check`. It skips step 4 and nothing else: the build, `dist`, version and packaging checks still run.

```bash
pnpm run release:minor --ci-passed      # root
pnpm run release:packages --ci-passed   # packages only
```

The flag asks `gh run list --commit` about `ci.yml` on `HEAD` and prints why it skipped the tests. It refuses when a run failed or is still running, when no run passed, and when the working tree has uncommitted changes. If `gh` is missing, not logged in or cannot reach GitHub, it says so and stops; add `--force` to confirm by hand that CI passed:

```bash
pnpm run release:minor --ci-passed --force
```

`--force` does not override a failed run. In that case run the release without `--ci-passed`, which runs the tests here.

### CI

| Workflow | Starts on | Publishes |
| --- | --- | --- |
| `ci.yml` | Push to `main`, pull requests | Nothing |
| `release-smoke.yml` | Manual, plus a nightly preset run on the checkout | Nothing to npm. The manual `deploy` input deploys the smoke app |
| `docs.yml` | Push to `main` that changes `docs/`, a published GitHub release, manual | The docs site only |
| `oldest-versions.yml` | Weekly, manual | Nothing |
| `mutation.yml` | Nightly, manual | Nothing. A report to read, not a gate |

## Related

::card-group
  :::card{title="Contributing" icon="i-lucide-git-pull-request" to="/contributing/"}
  :::
  :::card{title="Release smoke checks" icon="i-lucide-git-pull-request" to="/contributing/release-smoke"}
  :::
  :::card{title="Package APIs" icon="i-lucide-braces" to="/api/packages"}
  :::
::
