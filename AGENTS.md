# AGENTS.md

## Cursor Cloud specific instructions

This repo is the `nuxt-i18n-micro` pnpm monorepo (Node 22 / pnpm 9.14.2 are preinstalled). The
startup update script already runs `pnpm install`. No Docker, database, or external service is
required; integration/e2e tests spawn their own Nuxt servers in-process.

### Build order matters (non-obvious gotcha)

Before running tests, typecheck, or the dev server on a fresh checkout, run the build steps in this
exact order (the dependency runs both ways):

```bash
pnpm --filter "./packages/**" --filter "!./packages/*/playground" run build
pnpm run dev:prepare
pnpm --filter "./packages/*/playground" run build
```

- `dev:prepare` loads `src/module.ts`, which imports the `@i18n-micro/*` packages from their
  `dist/`, so packages must be built first. It also generates `.nuxt/tsconfig.json`, which the root
  `tsconfig.json` extends.
- The last step (building the package playgrounds) is easy to forget but **required for
  `pnpm run test:unit` / `pnpm run typecheck` to pass**: the Astro playground build generates the
  `virtual:i18n-micro/config` type declaration used by `packages/astro/playground/src/middleware.ts`.
  Skip it and `test:unit` fails with `Cannot find module 'virtual:i18n-micro/config'` even though all
  280 runtime tests still pass. This mirrors the order in `.github/workflows/ci.yml`.

### Running the app (dev)

`pnpm run dev` starts the main playground (Nuxt) on http://localhost:3000. The root path 302-redirects
to the default locale (`/en`); locales are prefixed (`/en`, `/de`, `/fr`, `/es`). The startup
warnings about `localeCookie` and large translation payloads are expected in the playground and are
not errors.

### Lint / test / build reference

Standard commands live in `package.json` scripts and `.github/CONTRIBUTING.md`. Key ones:

- Lint: `pnpm run lint` (oxlint), format: `pnpm run format` (oxfmt)
- Unit tests: `pnpm run test:unit` (fast; includes tsc/vue-tsc typecheck of `test/**`)
- Full suite: `pnpm run test` (unit + integration + e2e + package projects)
- E2E needs a browser first: `pnpm exec playwright install chromium`
- Typecheck: `pnpm run typecheck`

### Package changes

Per `.cursor/rules/package-versioning.mdc`: after editing anything under `packages/<name>/` (or `src/`
for the root module), bump the affected `package.json` patch version once per PR and rebuild that
package (`pnpm --filter @i18n-micro/<name> build`).
