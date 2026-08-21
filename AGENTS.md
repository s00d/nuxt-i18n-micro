# AGENTS.md

Quick-start context for AI coding agents (local + Cursor Cloud) in this repository.

Human docs: [README](./README.md) · [CONTRIBUTING](./.github/CONTRIBUTING.md) · [Contribution guide](https://s00d.github.io/nuxt-i18n-micro/guide/contribution)  
Deeper agent rules: [`.cursorrules`](./.cursorrules) · [`.cursor/rules/package-versioning.mdc`](./.cursor/rules/package-versioning.mdc)

## What this is

**nuxt-i18n-micro** — performance-focused i18n for Nuxt 3, plus framework packages under `@i18n-micro/*`.

- Published root package: `nuxt-i18n-micro` (Nuxt module from `src/`)
- Shared domain logic: `packages/core`, `packages/types`, `packages/utils`
- Routing: `packages/route-strategy` (build) + `packages/path-strategy` (runtime)
- Framework bindings: `vue`, `react`, `preact`, `solid`, `astro`, `node`, `vitepress`
- Tooling: `hmr`, `devtools-ui`, `types-generator`, `test-utils`
- Local apps: `playground/` (Nuxt), `client/` (devtools UI), `docs/` (VitePress)

Priorities: small bundles, fast builds, low runtime cost. Prefer reusing `@i18n-micro/utils/*` and core over duplicating logic in framework packages.

No Docker, database, or external service is required. Integration/e2e tests spawn their own Nuxt servers in-process.

## Prerequisites

- Node.js ≥ 18 (Cursor Cloud VMs typically have Node 22)
- **pnpm@9.14.2** (see `packageManager` in root `package.json`) — do not use npm/yarn for workspace work

## First-time setup (build order matters)

On a fresh checkout, run steps in this **exact** order before tests, typecheck, or `dev` (mirrors `.github/workflows/ci.yml`):

```bash
pnpm install
pnpm --filter "./packages/**" --filter "!./packages/*/playground" run build
pnpm run dev:prepare
pnpm --filter "./packages/*/playground" run build
```

Why:

- `dev:prepare` loads `src/module.ts`, which imports `@i18n-micro/*` from their `dist/`, so packages must be built first. It also generates `.nuxt/tsconfig.json`, which the root `tsconfig.json` extends.
- Building package playgrounds is easy to forget but **required** for `pnpm run test:unit` / `pnpm run typecheck`: the Astro playground build generates the `virtual:i18n-micro/config` declaration used by `packages/astro/playground/src/middleware.ts`. Skip it and unit tests fail with `Cannot find module 'virtual:i18n-micro/config'` even when runtime tests pass.

Then start the Nuxt playground:

```bash
pnpm run dev                 # http://localhost:3000
```

Notes for `dev`:

- `/` 302-redirects to the default locale (`/en`); locales are prefixed (`/en`, `/de`, `/fr`, `/es`).
- Startup warnings about `localeCookie` and large translation payloads are expected in the playground — not errors.

StackBlitz / cloud agents can also mirror `package.json` → `stackblitz.startCommand` (simpler path without the playground package build; use the full order above when running tests).

## Where to change what

| Goal | Primary location |
| --- | --- |
| Nuxt module options / build hooks | `src/module.ts` |
| Nuxt runtime (plugins, composables, middleware, server) | `src/runtime/` |
| Shared types | `packages/types/src/` (export from `index.ts`) |
| Framework-agnostic helpers | `packages/utils/src/` (subpath exports) |
| Translation / plural / format domain | `packages/core/src/` |
| Locale route generation | `packages/route-strategy/` |
| Runtime path strategies | `packages/path-strategy/` |
| Vue SPA bindings | `packages/vue/` (`/` and `/router` entries) |
| User docs / news | `docs/` · unreleased notes → `docs/news/index.md` |
| E2E / fixtures | `test/` · `test/fixtures/` |
| Package unit / dist tests | `packages/*/tests/` |

**Feature order:** types → utils (if reusable) → core → Nuxt runtime / framework package → docs → tests.

## Everyday commands

| Action | Command |
| --- | --- |
| Playground | `pnpm run dev` |
| Docs site | `pnpm run docs:dev` |
| Lint / format | `pnpm run lint` (oxlint) · `pnpm run format` (oxfmt) |
| Typecheck | `pnpm run typecheck` · `pnpm run test:types` |
| Unit (fast) | `pnpm run test:unit` (includes tsc/vue-tsc of `test/**`) |
| All tests | `pnpm run test` (unit + integration + e2e + package projects) |
| Packages / e2e | `pnpm run test:packages` · `pnpm run test:e2e` |
| E2E browser | `pnpm exec playwright install chromium` (once, before e2e) |
| Build one package | `pnpm --filter @i18n-micro/<name> build` |
| Build packages (no playgrounds) | `pnpm --filter "./packages/**" --filter "!./packages/*/playground" run build` |
| Full module pack | `pnpm run prepack` |
| Regenerate API docs | `pnpm run docs:generate` |
| Release gate helpers | `pnpm run preflight` · see `docs/guide/maintenance-commands.md` |

Standard scripts also live in root `package.json` and `.github/CONTRIBUTING.md`.

## Versioning (before push, not every commit)

When `packages/<name>/` or `src/` changes ship:

1. Bump **one patch** per affected publishable package (and root `package.json` if `src/` changed).
2. Rebuild that package so `dist/` matches source: `pnpm --filter @i18n-micro/<name> build`.
3. Commit source + version + `dist/` together.

Do **not** bump on every intermediate commit in the same PR. Do **not** hand-edit root `CHANGELOG.md` unless doing a formal `pnpm run release:*`.

Minor bumps only when explicitly agreed. Details: `.cursor/rules/package-versioning.mdc`.

## Agent do / don't

**Do**

- Keep changes scoped; match existing Oxlint/Oxfmt and TypeScript style
- Prefer interfaces for object shapes; export public types from `packages/types`
- Update docs when changing public API or exports maps
- Add/adjust tests next to the change (`packages/*/tests` or `test/`)
- Use Conventional Commits when asked to commit (`feat(scope): …`, `fix(scope): …`)

**Don't**

- Commit or push unless the user asks
- Amend commits (`git commit --amend`) — always a new commit
- Invent parallel i18n helpers that already exist in `core` / `utils`
- Expand bundle surface (e.g. pull `vue-router` into the main `@i18n-micro/vue` entry — use `@i18n-micro/vue/router`)
- Edit generated API reference by hand when `docs:generate` owns it

## Sanity checklist before finishing a change

```bash
pnpm run lint
pnpm run typecheck
pnpm run test:unit     # or narrower filter; use full `pnpm run test` when touching runtime/routing
# if a package ships dist:
pnpm --filter @i18n-micro/<name> build
```

## Further reading

- Architecture & conventions: `.cursorrules`
- Routing strategies: `docs/guide/strategy.md`
- Locales layout: `docs/guide/folder-structure.md`
- Maintenance / audits: `docs/guide/maintenance-commands.md`
- Package READMEs: `packages/*/README.md`
- CI build order: `.github/workflows/ci.yml`
