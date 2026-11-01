# AGENTS.md

Quick-start context for AI coding agents (local + Cursor Cloud) in this repository.

Human docs: [README](./README.md) · [CONTRIBUTING](./.github/CONTRIBUTING.md) · [Contribution guide](https://s00d.github.io/nuxt-i18n-micro/contributing/)  
Deeper agent rules: [`.cursor/rules/`](./.cursor/rules) · [`.claude/rules/`](./.claude/rules)

## What this is

**nuxt-i18n-micro** — performance-focused i18n for Nuxt 3 and 4, plus framework packages under `@i18n-micro/*`.

- Published root package: `nuxt-i18n-micro` (Nuxt module from `src/`)
- Shared domain logic: `packages/core`, `packages/types`, `packages/utils`
- Framework-agnostic runtime: `packages/runtime` (`createI18n`, messages/fetch; no `fs`)
- Routing: `packages/route-strategy` (build) + `packages/path-strategy` (runtime)
- Framework bindings: `vue`, `react`, `preact`, `solid`, `astro`, `node`, `vitepress`
- Tooling: `devtools-ui`, `types-generator`, `test-utils` (dev HMR lives in the root module)
- Local apps: `playground/` (the Nuxt test bench: every feature, one page each), `client/` (devtools UI), `docs/` (VitePress)

Priorities: small bundles, fast builds, low runtime cost. Prefer reusing `@i18n-micro/utils/*` and core over duplicating logic in framework packages.

No Docker, database, or external service is required. Integration/e2e tests spawn their own Nuxt servers in-process.

## Prerequisites

- Node.js ≥ 20 for published packages; ≥ 22.12 to run Vitest 5 / local `pnpm run test*` (CI uses 22)
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

- `dev:prepare` loads `src/module.ts`, which imports `@i18n-micro/*` from their `dist/`, so packages must be built first. It also generates `.nuxt/tsconfig.json`.
- Root `tsconfig.json` extends `./.nuxt/tsconfig.json` (after prepare) with monorepo excludes (`packages/**`, playgrounds, …) so the IDE and `typecheck:root` see Nuxt/nitro augmentations without typechecking sibling Vite packages. Packages keep their own `tsconfig.json` / `tsconfig.build.json`. Vite 8 / oxc must resolve a **local** tsconfig for every transformed file before `.nuxt` exists: list `src/**/*.vue` explicitly (oxc does not match `.vue` via `src/**/*`), and include package entrypoints outside `src/` (e.g. `devtools-ui`’s `vite/**/*.ts`) in that same project.
- Building package playgrounds is easy to forget but **required** for `pnpm run test:unit` / `pnpm run typecheck`: the Astro playground build generates the `virtual:i18n-micro/config` declaration used by `packages/astro/playground/src/middleware.ts`. Skip it and unit tests fail with `Cannot find module 'virtual:i18n-micro/config'` even when runtime tests pass.

Then start the Nuxt playground:

```bash
pnpm run dev                 # http://localhost:3000
```

Notes for `dev`:

- `/` 302-redirects to the default locale (`/en`) and lists every bench page; locales are prefixed (`/en`, `/de`, `/fr`, `/ru`, `/ar`, `/pt`). `/es` is disabled on purpose.
- `nuxt.config.ts` reads `BENCH_*` env, and the first run generates `locales/pages/huge-*` (gitignored). `pnpm run bench list` shows every build variant; `pnpm run bench build|start|smoke <variant>` runs one, into `playground/.bench/<variant>`. DevTools is on in plain `pnpm run dev` and starts a `client/` dev server on port 3030 when `client/` has no prebuilt UI.
- A startup warning about large translation payloads is expected in the playground, as are `[i18n] Missing key` warnings on the pages that test them. Not errors.

StackBlitz / cloud agents can also mirror `package.json` → `stackblitz.startCommand` (simpler path without the playground package build; use the full order above when running tests).

## Where to change what

| Goal | Primary location |
| --- | --- |
| Nuxt module options / build hooks | `src/module.ts` |
| Nuxt runtime (plugins, composables, middleware, server) | `src/runtime/` |
| Shared types | `packages/types/src/` (export from `index.ts`) |
| Framework-agnostic helpers | `packages/utils/src/` (subpath exports) |
| Vanilla / fetch runtime | `packages/runtime/` (`createI18n`, no `fs`) |
| Translation / plural / format domain | `packages/core/src/` |
| Locale route generation | `packages/route-strategy/` |
| Runtime path strategies | `packages/path-strategy/` |
| Vue SPA bindings | `packages/vue/` (`/` and `/router` entries) |
| User docs | `docs/` (guide, API). **Do not** edit `docs/news/` unless the user explicitly asks |
| E2E / fixtures | `test/` · `test/fixtures/` |
| Package unit / dist tests | `packages/*/tests/` |

**Feature order:** types → utils (if reusable) → core → Nuxt runtime / framework package → docs → tests.

## Everyday commands

| Action | Command |
| --- | --- |
| Playground | `pnpm run dev` |
| Bench variants | `pnpm run bench list` · `pnpm run bench smoke <variant>` |
| Docs site | `pnpm run docs:dev` |
| Lint / format | `pnpm run lint` (oxlint) · `pnpm run format` (oxfmt) |
| Typecheck | `pnpm run typecheck` |
| Unit (fast) | `pnpm run test:unit` (includes tsc/vue-tsc of `test/**`) |
| All tests | `pnpm run test` (unit + integration + e2e + package projects) |
| Packages / e2e | `pnpm run test:packages` · `pnpm run test:e2e` |
| E2E browser | `pnpm exec playwright install chromium` (once, before e2e) |
| Build one package | `pnpm --filter @i18n-micro/<name> build` |
| Build packages (no playgrounds) | `pnpm --filter "./packages/**" --filter "!./packages/*/playground" run build` |
| Full module pack | `pnpm run prepack` |
| Regenerate API docs | `pnpm run docs:generate` |
| Release gate helpers | `pnpm run preflight` · see `docs/contributing/maintenance-commands.md` |

Standard scripts also live in root `package.json` and `.github/CONTRIBUTING.md`.

## Versioning (before push, not every commit)

When `packages/<name>/` changes ship:

1. Bump each affected publishable workspace package once: `pnpm run bump --level patch --packages <names>`.
2. Rebuild that package so `dist/` matches source: `pnpm --filter @i18n-micro/<name> build`.
3. Commit source + version together. `dist/` is gitignored; `prepack` rebuilds it for a release.

**Root** `package.json` `version` and `CHANGELOG.md`: **never** hand-edit. Only `pnpm run release:patch|minor|major` / `pnpm -C scripts cli release --bump <level>`. Unreleased `src/` changes stay on the last released root version. **Do not** edit `docs/news/index.md` unless the user explicitly asks.

Do **not** bump workspace versions on every intermediate commit in the same PR.

The level is the owner's call: patch unless the owner says minor or major, and nothing picks it from commits. Details: `.cursor/rules/package-versioning.mdc`. Publishing: `docs/contributing/maintenance-commands.md`.

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

- Architecture: `docs/contributing/architecture.md`
- Routing strategies: `docs/guide/strategy.md`
- Locales layout: `docs/guide/translations.md`
- Maintenance / audits: `docs/contributing/maintenance-commands.md`
- Package READMEs: `packages/*/README.md`
- CI build order: `.github/workflows/ci.yml`
