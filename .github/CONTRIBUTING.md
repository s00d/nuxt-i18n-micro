# Contributing to nuxt-i18n-micro

The full guide is in the docs: **[Contributing](https://s00d.github.io/nuxt-i18n-micro/contributing/)**. This file is a summary.

## Setup

Node.js 22 and pnpm 9.14.2 (`corepack enable`). Run the steps in this order:

```bash
pnpm install
pnpm --filter "./packages/**" --filter "!./packages/*/playground" run build
pnpm run dev:prepare
pnpm --filter "./packages/*/playground" run build
pnpm run dev   # playground at http://localhost:3000
```

## Before you open a pull request

- `pnpm run lint`, `pnpm run typecheck`, `pnpm run test:unit` pass; run `pnpm run test` when you touch runtime or routing.
- A changed `packages/<name>` gets one patch version bump per pull request and a rebuilt `dist/` (`pnpm --filter @i18n-micro/<name> build`). Never edit the root `version` or `CHANGELOG.md`.
- After changing JSDoc, options or exports, run `pnpm run docs:generate`.
- Conventional Commits (`feat(scope): …`, `fix(scope): …`); new commits instead of amending.
- Bugs and feature requests: use the [issue templates](https://github.com/s00d/nuxt-i18n-micro/issues/new/choose) with a reproduction.

By contributing, you agree that your contributions are licensed under the [MIT License](../LICENSE).
