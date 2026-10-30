---
title: 'Contributing'
description: 'Set up the nuxt-i18n-micro monorepo, run the playground and the checks, version packages and open a pull request.'
outline: [2, 3]
---

# Contributing

This page takes you from a fresh clone to a pull request. Read it before your first change: the build order and the package versioning rules are easy to get wrong. The other pages in this section cover the architecture, the test suites, the maintenance commands and the release checks.

## Prerequisites

- **Node.js 22** — CI runs 22; Vitest needs ≥ 22.12.
- **pnpm 9.14.2** — the version in `packageManager`; `corepack enable` picks it up. Do not use npm or yarn in the workspace.

No database, Docker or external service is needed: integration and e2e tests start their own Nuxt servers.

## Setup

Fork the repository, then run these steps **in this order** (the same order as `.github/workflows/ci.yml`):

```bash
git clone https://github.com/<you>/nuxt-i18n-micro.git
cd nuxt-i18n-micro
pnpm install
pnpm --filter "./packages/**" --filter "!./packages/*/playground" run build
pnpm run dev:prepare
pnpm --filter "./packages/*/playground" run build
```

- `dev:prepare` loads `src/module.ts`, which imports `@i18n-micro/*` from their `dist/`, so the packages must be built first. It also writes `.nuxt/tsconfig.json`, which the root `tsconfig.json` extends.
- The package playground build generates the `virtual:i18n-micro/config` declaration that the Astro playground needs. Skip it and `pnpm run test:unit` / `pnpm run typecheck` fail with `Cannot find module 'virtual:i18n-micro/config'`.

Then start the playground at `http://localhost:3000` (`/` redirects to `/en`):

```bash
pnpm run dev
```

Warnings about `localeCookie` and large translation payloads at startup are expected.

## Where to change what

| Goal | Location |
| --- | --- |
| Module options, build hooks | `src/module.ts` |
| Nuxt runtime (plugins, composables, middleware, server) | `src/runtime/` |
| Shared types | `packages/types/src/` |
| Framework-agnostic helpers | `packages/utils/src/` (subpath exports) |
| Translation, plural, formatting | `packages/core/src/` |
| Route generation / runtime paths | `packages/route-strategy/` / `packages/path-strategy/` |
| Framework bindings | `packages/vue`, `react`, `preact`, `solid`, `astro`, `node`, `vitepress` |
| Docs | `docs/` — never `docs/news/` unless a maintainer asks |
| E2E tests and fixtures | `test/`, `test/fixtures/` |

Work in this order: types, utils, core, then the Nuxt runtime or framework package, then docs and tests. Reuse `@i18n-micro/utils` and core instead of copying logic into a framework package. [Architecture](/contributing/architecture) explains how the pieces fit.

## Checks

| Command | What it does |
| --- | --- |
| `pnpm run lint` / `pnpm run lint:fix` | Oxlint |
| `pnpm run format` | Oxfmt |
| `pnpm run typecheck` | Root, playground, scripts, packages, package playgrounds |
| `pnpm run test:unit` | Fast unit tests, no builds |
| `pnpm run test` | Everything: unit, integration, packages, e2e |
| `pnpm run test:e2e` | Browser journeys (`pnpm exec playwright install chromium` once first) |
| `pnpm run docs:generate` | Regenerate the generated docs regions after changing JSDoc, options or exports |
| `pnpm run docs:dev` | Docs site with hot reload |

Run at least `lint`, `typecheck` and `test:unit` before you push; run the full `pnpm run test` when you touch runtime or routing. Test layout and how to add a test: [Testing the module](/contributing/testing). Every maintenance command: [Maintenance commands](/contributing/maintenance-commands).

## Changing a package

Packages under `packages/*` are versioned by hand; release tooling bumps only the root. `pnpm publish -r` silently skips a version that is already on npm, so a missing bump leaves the package stale.

1. Bump the `version` of every changed package by **one patch**, once per pull request (not per commit).
2. Rebuild it so `dist/` matches the source: `pnpm --filter @i18n-micro/<name> build`.
3. Commit source, version and `dist/` together.

CI runs `pnpm run check:versions` against the merge base; changes to tests, docs and playgrounds do not count. **Never** edit the root `version` or `CHANGELOG.md` by hand: only the release scripts change them.

## Commits and pull requests

- Conventional Commits: `feat(scope): …`, `fix(scope): …`, `docs(scope): …`, `test(scope): …`.
- Follow-ups are new commits; do not amend or force-push a branch under review.
- Target `main` of `s00d/nuxt-i18n-micro`, fill in the pull request template, link the issue.
- Update docs when you change a public API or an exports map; add or adjust tests next to the change.
- Bugs and feature requests go through the [issue templates](https://github.com/s00d/nuxt-i18n-micro/issues/new/choose); include a reproduction.

## Related

- [Architecture](/contributing/architecture)
- [Testing the module](/contributing/testing)
- [Maintenance commands](/contributing/maintenance-commands)
- [Release smoke checks](/contributing/release-smoke)
- [Benchmark methodology](/contributing/performance-methodology)
