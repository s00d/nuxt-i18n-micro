---
title: 'Maintenance commands'
description: 'Repository checks of the scripts CLI: generated docs, API surface, payload budget, dependency and fixture audits, versions and the release preflight.'
outline: [2, 3]
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
| `ensure-release-source` | `release:source` | Root `version` or `CHANGELOG.md` changed outside `cli release` |
| [`preflight`](#preflight) | `preflight` | All release gates in one run |

`release`, `performance`, `preset-smoke` and the `smoke-*` commands are covered in [Release smoke checks](/contributing/release-smoke) and [Benchmark methodology](/contributing/performance-methodology).

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

Runs every release gate, publishes nothing, and reports all results at once (the `release:*` scripts chain gates with `&&` and stop at the first failure). Gates in order: `deps-audit`, `verify-packages --publint`, `api-surface`, `docs-audit`, `docs-generate --check`, `fixtures-audit --strict`, `check-versions`, `ensure-release-source`, `ensure-npm-auth` (with `--npm`), `payload-budget` (with `--budget`).

```bash
pnpm run preflight
pnpm -C scripts cli preflight --npm       # registry checks and npm auth too
pnpm -C scripts cli preflight --offline   # skip network gates
pnpm -C scripts cli preflight --budget    # also build and check the payload budget
```

Before pushing a change set, maintainers run: `prepack`, `format`, `lint`, `typecheck`, `check:versions -- --npm`, `release:source`, `compare:published`, plus `test` when runtime or routing changed. `release:check` chains most of these. `ensure-release-source` is part of `release:check` and `preflight`, not of `release:patch` / `minor` / `major`.

## Related

- [Contributing](/contributing/)
- [Release smoke checks](/contributing/release-smoke)
- [Package APIs](/api/packages)
