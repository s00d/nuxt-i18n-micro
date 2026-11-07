# Maintenance commands

These commands check the repository itself, not apps that use the module. Run them when you change exports, docs, dependencies or fixtures, and before a release. Each catches a drift that builds and tests do not notice.

All of them live in the `scripts/` workspace package and run through one CLI; `--help` prints every flag:

```bash
pnpm -C scripts cli <command> --help
```

## Commands

<table>
<thead>
  <tr>
    <th>
      Command
    </th>
    
    <th>
      Root script
    </th>
    
    <th>
      Catches
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <a href="#docs-generate">
        <code>
          docs-generate
        </code>
      </a>
    </td>
    
    <td>
      <code>
        docs:generate
      </code>
      
      , <code>
        docs:generate:check
      </code>
    </td>
    
    <td>
      Generated docs regions out of date with the code
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="#api-surface">
        <code>
          api-surface
        </code>
      </a>
    </td>
    
    <td>
      <code>
        api:surface
      </code>
      
      , <code>
        api:surface:update
      </code>
    </td>
    
    <td>
      An export removed or retyped
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="#docs-audit">
        <code>
          docs-audit
        </code>
      </a>
    </td>
    
    <td>
      <code>
        audit:docs
      </code>
    </td>
    
    <td>
      Undocumented options, dead nav/sidebar entries and links
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="#deps-audit">
        <code>
          deps-audit
        </code>
      </a>
    </td>
    
    <td>
      <code>
        audit:deps
      </code>
    </td>
    
    <td>
      Versions outside the catalog, imports never declared
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="#fixtures-audit">
        <code>
          fixtures-audit
        </code>
      </a>
    </td>
    
    <td>
      <code>
        audit:fixtures
      </code>
    </td>
    
    <td>
      Unreferenced fixtures, committed build output
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="#payload-budget">
        <code>
          payload-budget
        </code>
      </a>
    </td>
    
    <td>
      <code>
        budget:payload
      </code>
      
      , <code>
        budget:payload:update
      </code>
    </td>
    
    <td>
      <code>
        __NUXT_DATA__
      </code>
      
       or client assets growing
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        check-versions
      </code>
    </td>
    
    <td>
      <code>
        check:versions
      </code>
    </td>
    
    <td>
      A changed package without a version bump (<code>
        --npm
      </code>
      
      : version already published)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        verify-packages
      </code>
    </td>
    
    <td>
      <code>
        verify:packages
      </code>
      
      , <code>
        verify:packages:publint
      </code>
    </td>
    
    <td>
      Broken <code>
        exports
      </code>
      
       / <code>
        files
      </code>
      
       in a package
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        compare-published
      </code>
    </td>
    
    <td>
      <code>
        compare:published
      </code>
    </td>
    
    <td>
      The packed packages against the versions on npm
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        consumer-types
      </code>
    </td>
    
    <td>
      <code>
        check:consumer
      </code>
    </td>
    
    <td>
      Published <code>
        .d.ts
      </code>
      
       that break a user: Are The Types Wrong, then <code>
        tsc
      </code>
      
       with <code>
        skipLibCheck: false
      </code>
      
       under <code>
        bundler
      </code>
      
       and <code>
        node16
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        oldest-versions
      </code>
    </td>
    
    <td>
      <code>
        check:oldest
      </code>
    </td>
    
    <td>
      A peer range that fails at its floor: Nuxt 3.18, VitePress 1.0, Vue 3.3, vue-router 4.5.1
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        http-fuzz
      </code>
    </td>
    
    <td>
      <code>
        test:fuzz
      </code>
    </td>
    
    <td>
      Off-origin redirects, header injection, reflected HTML, traversal, crashes under hostile HTTP. For release checks, not CI
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ensure-release-source
      </code>
    </td>
    
    <td>
      <code>
        release:source
      </code>
    </td>
    
    <td>
      Root <code>
        version
      </code>
      
       or <code>
        CHANGELOG.md
      </code>
      
       changed outside <code>
        cli release
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="#preflight">
        <code>
          preflight
        </code>
      </a>
    </td>
    
    <td>
      <code>
        preflight
      </code>
    </td>
    
    <td>
      All release gates in one run
    </td>
  </tr>
</tbody>
</table>

`release` and `bump` are covered in [Publishing](#publishing). `performance`, `preset-smoke` and the `smoke-*` commands are covered in [Release smoke checks](/contributing/release-smoke) and [Benchmark methodology](/contributing/performance-methodology).

## docs-generate

Writes the generated parts of the docs from the code. `docs:dev` and `docs:build` run it first; CI and `preflight` run `--check`, which fails when a page would change.

<table>
<thead>
  <tr>
    <th>
      Output
    </th>
    
    <th>
      Read from
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <a href="/api/module-options">
        Module options
      </a>
      
       tables and <code>
        option:<path>
      </code>
      
       regions
    </td>
    
    <td>
      <code>
        ModuleOptions
      </code>
      
       in <code>
        packages/types/src/index.ts
      </code>
      
       (TypeScript AST)
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/api/methods">
        Helpers
      </a>
      
       index and <code>
        method:<name>
      </code>
      
       regions
    </td>
    
    <td>
      <code>
        PluginsInjections
      </code>
      
      , <code>
        NuxtAppOnlyInjections
      </code>
      
       in <code>
        src/runtime/plugins/01.plugin.ts
      </code>
      
       (TypeDoc)
    </td>
  </tr>
  
  <tr>
    <td>
      Composable signatures (<code>
        symbol:<name>
      </code>
      
      )
    </td>
    
    <td>
      <code>
        src/runtime/composables/*.ts
      </code>
      
       (TypeDoc)
    </td>
  </tr>
  
  <tr>
    <td>
      Component props, slots, events (<code>
        component:<tag>
      </code>
      
      )
    </td>
    
    <td>
      <code>
        src/runtime/components/*.vue
      </code>
      
       (vue-docgen-api)
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/api/packages">
        Package APIs
      </a>
      
       index and <code>
        docs/api/packages/*.md
      </code>
    </td>
    
    <td>
      <code>
        scripts/api-surface/*.api.txt
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Payload budget table in <a href="/guide/performance">
        Performance
      </a>
    </td>
    
    <td>
      <code>
        scripts/payload-budget.json
      </code>
    </td>
  </tr>
</tbody>
</table>

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

<table>
<thead>
  <tr>
    <th>
      What
    </th>
    
    <th>
      Patch
    </th>
    
    <th>
      Minor
    </th>
    
    <th>
      Major
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Root module
    </td>
    
    <td>
      <code>
        pnpm run release:patch
      </code>
    </td>
    
    <td>
      <code>
        pnpm run release:minor
      </code>
    </td>
    
    <td>
      <code>
        pnpm run release:major
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Packages
    </td>
    
    <td>
      <code>
        pnpm run bump --level patch --packages <names>
      </code>
    </td>
    
    <td>
      <code>
        pnpm run bump --level minor --packages <names>
      </code>
    </td>
    
    <td>
      <code>
        pnpm run bump --level major --packages <names>
      </code>
    </td>
  </tr>
</tbody>
</table>

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

To publish without the tests and without asking CI, for example when the change since the last green run cannot affect them, use `--skip-tests`. It is your call: nothing checks it. The build, `dist`, version and packaging checks still run.

```bash
pnpm run release:major --skip-tests
```

### CI

<table>
<thead>
  <tr>
    <th>
      Workflow
    </th>
    
    <th>
      Starts on
    </th>
    
    <th>
      Publishes
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        ci.yml
      </code>
    </td>
    
    <td>
      Push to <code>
        main
      </code>
      
      , pull requests
    </td>
    
    <td>
      Nothing
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        release-smoke.yml
      </code>
    </td>
    
    <td>
      Manual; <code>
        presets: true
      </code>
      
       builds every preset on the checkout
    </td>
    
    <td>
      Nothing to npm. The manual <code>
        deploy
      </code>
      
       input deploys the smoke app
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        docs.yml
      </code>
    </td>
    
    <td>
      Push to <code>
        main
      </code>
      
       that changes <code>
        docs/
      </code>
      
      , a published GitHub release, manual
    </td>
    
    <td>
      The docs site only
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        oldest-versions.yml
      </code>
    </td>
    
    <td>
      Manual
    </td>
    
    <td>
      Nothing
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        mutation.yml
      </code>
    </td>
    
    <td>
      Manual
    </td>
    
    <td>
      Nothing. A report to read, not a gate
    </td>
  </tr>
</tbody>
</table>

## Related

<card-group>
<card icon="i-lucide-git-pull-request" title="Contributing" to="/contributing/">



</card>

<card icon="i-lucide-git-pull-request" title="Release smoke checks" to="/contributing/release-smoke">



</card>

<card icon="i-lucide-braces" title="Package APIs" to="/api/packages">



</card>
</card-group>
