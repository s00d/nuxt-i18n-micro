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

<table>
<thead>
  <tr>
    <th>
      Goal
    </th>
    
    <th>
      Location
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Module options, build hooks
    </td>
    
    <td>
      <code>
        src/module.ts
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Nuxt runtime (plugins, composables, middleware, server)
    </td>
    
    <td>
      <code>
        src/runtime/
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Shared types
    </td>
    
    <td>
      <code>
        packages/types/src/
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Framework-agnostic helpers
    </td>
    
    <td>
      <code>
        packages/utils/src/
      </code>
      
       (subpath exports)
    </td>
  </tr>
  
  <tr>
    <td>
      Translation, plural, formatting
    </td>
    
    <td>
      <code>
        packages/core/src/
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Route generation / runtime paths
    </td>
    
    <td>
      <code>
        packages/route-strategy/
      </code>
      
       / <code>
        packages/path-strategy/
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Framework bindings
    </td>
    
    <td>
      <code>
        packages/vue
      </code>
      
      , <code>
        react
      </code>
      
      , <code>
        preact
      </code>
      
      , <code>
        solid
      </code>
      
      , <code>
        astro
      </code>
      
      , <code>
        node
      </code>
      
      , <code>
        vitepress
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Docs
    </td>
    
    <td>
      <code>
        docs/
      </code>
      
       — never <code>
        docs/news/
      </code>
      
       unless a maintainer asks
    </td>
  </tr>
  
  <tr>
    <td>
      E2E tests and fixtures
    </td>
    
    <td>
      <code>
        test/
      </code>
      
      , <code>
        test/fixtures/
      </code>
    </td>
  </tr>
</tbody>
</table>

Work in this order: types, utils, core, then the Nuxt runtime or framework package, then docs and tests. Reuse `@i18n-micro/utils` and core instead of copying logic into a framework package. [Architecture](/contributing/architecture) explains how the pieces fit.

## Checks

<table>
<thead>
  <tr>
    <th>
      Command
    </th>
    
    <th>
      What it does
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        pnpm run lint
      </code>
      
       / <code>
        pnpm run lint:fix
      </code>
    </td>
    
    <td>
      Oxlint
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        pnpm run format
      </code>
    </td>
    
    <td>
      Oxfmt
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        pnpm run typecheck
      </code>
    </td>
    
    <td>
      Root, playground, scripts, packages, package playgrounds
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        pnpm run test:unit
      </code>
    </td>
    
    <td>
      Fast unit tests, no builds
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        pnpm run test
      </code>
    </td>
    
    <td>
      Everything: unit, integration, packages, e2e
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        pnpm run test:e2e
      </code>
    </td>
    
    <td>
      Browser journeys (<code>
        pnpm exec playwright install chromium
      </code>
      
       once first)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        pnpm run docs:generate
      </code>
    </td>
    
    <td>
      Regenerate the generated docs regions after changing JSDoc, options or exports
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        pnpm run docs:dev
      </code>
    </td>
    
    <td>
      Docs site with hot reload
    </td>
  </tr>
</tbody>
</table>

Run at least `lint`, `typecheck` and `test:unit` before you push; run the full `pnpm run test` when you touch runtime or routing. Test layout and how to add a test: [Testing the module](/contributing/testing). Every maintenance command: [Maintenance commands](/contributing/maintenance-commands).

## Changing a package

Packages under `packages/*` are versioned by hand; the release scripts bump only the root. `pnpm publish -r` silently skips a version that is already on npm, so a missing bump leaves the package stale.

1. Bump every changed package once per pull request (not per commit): `pnpm run bump --level patch --packages <names>`. Use a patch unless a maintainer decides on minor or major.
2. Rebuild it so `dist/` matches the source: `pnpm --filter @i18n-micro/<name> build`.
3. Commit source and version together. `dist/` is gitignored; `prepack` rebuilds it for a release.

CI runs `pnpm run check:versions` against the merge base; changes to tests, docs and playgrounds do not count. **Never** edit the root `version` or `CHANGELOG.md` by hand: only the release scripts change them. [Publishing](/contributing/maintenance-commands#publishing) lists the commands.

## Commits and pull requests

- Conventional Commits: `feat(scope): …`, `fix(scope): …`, `docs(scope): …`, `test(scope): …`.
- Follow-ups are new commits; do not amend or force-push a branch under review.
- Target `main` of `s00d/nuxt-i18n-micro`, fill in the pull request template, link the issue.
- Update docs when you change a public API or an exports map; add or adjust tests next to the change.
- Bugs and feature requests go through the [issue templates](https://github.com/s00d/nuxt-i18n-micro/issues/new/choose); include a reproduction.

## Related

<card-group>
<card icon="i-lucide-git-pull-request" title="Architecture" to="/contributing/architecture">



</card>

<card icon="i-lucide-git-pull-request" title="Testing the module" to="/contributing/testing">



</card>

<card icon="i-lucide-git-pull-request" title="Maintenance commands" to="/contributing/maintenance-commands">



</card>

<card icon="i-lucide-git-pull-request" title="Release smoke checks" to="/contributing/release-smoke">



</card>

<card icon="i-lucide-git-pull-request" title="Benchmark methodology" to="/contributing/performance-methodology">



</card>
</card-group>
