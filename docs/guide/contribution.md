---
outline: deep
---

# Contribution guide

Thanks for helping improve **Nuxt I18n Micro**. Bugfixes, features, docs, and tests are all welcome.

## Prerequisites

- **Node.js** 18+ (aligns with Nuxt 3)
- **pnpm** 9+ (see root `packageManager` in `package.json`)

## Workflow

1. **Fork** [nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro) and **clone** your fork (or clone upstream if you have access).
2. Create a branch: `git checkout -b feat/your-change`.
3. Install and build workspace packages, then prepare the module and playground:

```bash
pnpm install
pnpm --filter "./packages/**" run build
pnpm run prepack && cd playground && pnpm run prepare && cd ..
```

4. **Develop** with the playground:

```bash
pnpm run dev
```

Open `http://localhost:3000`.

## Quality checks (before a PR)

Run from the repository root:

| Step                 | Command                                                         |
| -------------------- | --------------------------------------------------------------- |
| Lint                 | `pnpm run lint` — auto-fix: `pnpm run lint:fix` (Oxlint)        |
| Format               | `pnpm run format` — check only: `pnpm run format:check` (Oxfmt) |
| Types                | `pnpm run typecheck` and `pnpm run test:types`                  |
| Unit / package tests | `pnpm run test:workspaces`                                      |
| E2E (Playwright)     | `pnpm run test`                                                 |
| Vitest (root)        | `pnpm run test:vitest`                                          |

Release script also runs `prepack`; to only build the published module:

```bash
pnpm run prepack
```

## Documentation

```bash
pnpm run docs:dev    # local dev
pnpm run docs:build
pnpm run docs:serve  # preview production build
```

## Playground production build

```bash
pnpm run dev:build
```

## Common scripts (quick reference)

- `pnpm run dev` — playground dev server
- `pnpm run prepack` — build module for publish
- `pnpm --filter "./packages/**" run build` — build all workspace packages
- `pnpm run lint` / `pnpm run lint:fix` — Oxlint
- `pnpm run test` — Playwright
- `pnpm run test:workspaces` — tests in all packages
- `pnpm run typecheck` — root TypeScript
- `pnpm run test:types` — `vue-tsc` (root + playground)

## Commits and pull requests

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), for example:

- `fix(router): resolve locale switching edge case`
- `feat(seo): improve hreflang output`
- `docs(contribution): simplify dev setup`

Open a PR against `main` on the upstream repo, describe the change, and link issues if any.

## Tips

- Update docs when behavior or public API changes.
- Add or extend tests for bugfixes and new features.
- Keep changes focused; large refactors are easier to review when split.
