---
url: 'https://s00d.github.io/nuxt-i18n-micro/guide/maintenance-commands.md'
description: >-
  Repository checks that catch drift no test or build would notice: payload
  budgets, docs vs code, the public API surface, dependencies, fixtures, and a
  single release preflight.
---

# Maintenance Commands

These are checks for the repository itself, not for apps that use the module. They all
live in the [`@i18n-micro/scripts`](https://github.com/s00d/nuxt-i18n-micro/tree/main/scripts)
workspace package and run through one CLI:

```bash
pnpm -C scripts cli <command> --help
```

Each one exists because something drifted silently: the code still built, every test
still passed, and the problem only surfaced later — in a review, in a bug report, or
after publishing. They are the checks with no other owner.

| Command | Catches |
| --- | --- |
| [`payload-budget`](#payload-budget) | the translation dictionary creeping back into the HTML |
| [`docs-audit`](#docs-audit) | options and pages the documentation no longer matches |
| [`api-surface`](#api-surface) | an export removed or retyped without anyone noticing |
| [`deps-audit`](#deps-audit) | versions escaping the catalog, packages imported but never declared |
| [`fixtures-audit`](#fixtures-audit) | test fixtures nothing references |
| [`ensure-release-source`](#ensure-release-source) | root version / CHANGELOG edited outside `cli release` |
| [`preflight`](#preflight) | the rest of them, before a release |

Two of them do double duty: the artifacts `api-surface` and `payload-budget` produce are
also what the [Package APIs](/api/packages) and [Performance](/guide/performance) pages
read at build time, so the reference documentation and the release gates cannot disagree
— they are the same files. See [Documentation from data](#documentation-from-data).

## Documentation from code

Reference pages are generated as plain Markdown, so the site, the `llms.txt` bundle and
anything else reading the sources all get the same content:

```bash
pnpm run docs:generate          # write the reference
pnpm run docs:generate:check    # fail when a page would change — what CI runs
```

`pnpm run docs:dev` and `docs:build` run it first, so the site is never built from stale
pages.

| What is generated | Read from | Using |
| --- | --- | --- |
| Component props, slots and events | `src/runtime/components/*.vue` | [vue-docgen-api](https://vue-docgen-api.vuejs.org) |
| Composable and helper reference | `src/runtime/composables/*.ts`, `PluginsInjections` | [TypeDoc](https://typedoc.org) |
| [Module options](/api/module-options) | the `ModuleOptions` type | the TypeScript AST |
| [Package APIs](/api/packages) | `scripts/api-surface/*.api.txt` | the snapshots `api-surface` checks |
| Payload numbers in [Performance](/guide/performance) | `scripts/payload-budget.json` | the budget `payload-budget` enforces |

Whole pages (one per package) are written outright; everything else replaces a marked
region inside a hand-written page, so the prose and examples around it stay under an
author's control:

```md
<!-- generated:methods-index — do not edit; run `pnpm run docs:generate` -->
<!-- /generated:methods-index -->
```

Repeated content links instead of repeating: a member list already documented on another
package's page becomes a one-line reference to it. That alone removed 17 KB from the
package reference.

### Writing the documentation in the code

The prose lives next to what it describes, so a rename cannot leave it behind:

```ts
/** Translate with pluralization. `params` may be the count itself, or an object containing `count`. */
$tc: (key: string, params: number | Params, defaultValue?: string) => string
```

```vue
<!-- @slot Content before the button that opens the dropdown. -->
<slot name="before-button" />
```

A `<script setup>` component is described through `defineOptions`, the form
vue-docgen-api reads:

```ts
/** A link that keeps the active locale. */
defineOptions({ name: 'I18nLink' })
```

Two tests keep this honest: every prop and slot must carry a comment, and every injected
helper and composable must carry a description. Adding one without documenting it fails
the suite rather than producing a blank table cell.

### For LLMs

[`vitepress-plugin-llms`](https://github.com/okineadev/vitepress-plugin-llms) publishes
`/llms.txt` (an index) and `/llms-full.txt` (one bundle), plus a `.md` twin of every page.
Because the reference is real Markdown rather than a component rendering JSON in the
browser, all of it reaches those files — the option table, the helper signatures and the
component props included.

## payload-budget

The SSR payload carries the translation chunks a page loaded, so its size follows what the
app asks for. Nothing else notices when that changes: a payload that doubled renders
correctly and passes every test, it is just heavier.

```bash
pnpm run budget:payload                 # build the playground and compare
pnpm -C scripts cli payload-budget --skip-build   # reuse an existing .output
pnpm run budget:payload:update          # record the current numbers as the budget
```

The budget lives in `scripts/payload-budget.json` and is committed, so a change to it is a
change a reviewer sees:

```json
{
  "app": "playground",
  "routes": ["/", "/de"],
  "limits": { "maxNuxtData": 7996113, "totalNuxtData": 15984808, "clientAssets": 506360 }
}
```

The playground is the default target because its dictionary is deliberately huge — around
15 MB on disk — so a change in what the payload carries is unmissable rather than
marginal. Those numbers are a fixed point to compare against, **not** what a real
application should expect; no real dictionary is that size.

`--update` writes the measured numbers plus `--tolerance` percent of headroom (10% by
default), so ordinary growth does not trip the check while a step change cannot hide.

## docs-audit

Four kinds of drift, none of which the VitePress build notices:

* an option exists in `ModuleOptions` but appears nowhere in `docs/`
* a nav or sidebar entry points at a page that was renamed or removed
* a page links to another page that no longer exists
* a page is not reachable from the nav or the sidebar at all *(warning)*

Dynamic routes are understood: a `[param].md` template is not itself expected to be
linked, and a link to a page that template renders (`/api/packages/core`) resolves even
though no such file exists.

```bash
pnpm run audit:docs
pnpm -C scripts cli docs-audit --warnings-as-errors
```

Options are read from the TypeScript AST of `packages/types/src/index.ts` rather than by
pattern-matching the file, because the interface carries JSDoc prose and nested object
types that a regex reports as members that do not exist.

Sidebar links are resolved the way VitePress resolves them, including the `base` a group
declares and the `cleanUrls` behaviour where `/news` may be served by either `news.md` or
`news/index.md`.

## api-surface

Removing an export or changing its type breaks consumers, and nothing in the repository
notices: the package builds, its tests pass, and it publishes. This turns that into a
diff, and into a list you can paste into the release notes.

```bash
pnpm run api:surface           # compare against the committed snapshots
pnpm run api:surface:update    # accept the current surface
pnpm -C scripts cli api-surface --package core
```

Snapshots live in `scripts/api-surface/*.api.txt`, one file per package, one line per
export **or member**:

```
# . (src/index.ts)
class BaseI18n
member BaseI18n.clearCache: () => void
member BaseI18n.t: (key: string, params?: Params, …) => CleanTranslation
```

A line per member rather than per symbol is deliberate: a class with thirty methods on
one line turns "renamed one method" into a diff nobody can read, and TypeScript truncates
long shapes to `... 7 more ...`, which would make the snapshot lossy as well.

The surface is read from `src` through the TypeScript program, so no build is needed and
a stale `dist` cannot hide a change. Removals and signature changes fail the command;
additions are reported but do not.

## deps-audit

Two failures that otherwise surface late and confusingly.

**A version escaping the catalog.** A dependency pinned in a `package.json` while
`pnpm-workspace.yaml` moves on — the package keeps building against a version nothing
else in the workspace uses.

**A package imported but never declared.** `unbuild` only reports this as
`Implicitly bundling X` at pack time, long after the change that caused it. The audit
distinguishes three cases, because they are not equally wrong:

| Finding | Level | Meaning |
| --- | --- | --- |
| `undeclared-import` | error | imported at runtime, declared nowhere |
| `dev-only-import` | warning | only a devDependency — correct if the build inlines it, wrong otherwise |
| `undeclared-type-import` | warning | `import type` only; the emitted `.d.ts` references a package consumers may not have |

```bash
pnpm run audit:deps
pnpm -C scripts cli deps-audit --warnings-as-errors
```

It also reports catalog entries nothing uses, and `peerDependencies` with no matching
`devDependency` — a peer the package cannot resolve locally cannot be typechecked or
tested here.

Sources are scanned with comments removed and template literals emptied. Both matter:
a sentence ending `… from "no request context"` matches a naive import pattern, and
`types-generator` writes a real `import '@i18n-micro/types';` into the `.d.ts` it
generates — which is that file's dependency, not the generator's.

## fixtures-audit

Every fixture is a full Nuxt app, so one that outlived the test it was written for is
invisible: it just makes the suite slower and every config change bigger.

```bash
pnpm run audit:fixtures
pnpm -C scripts cli fixtures-audit --strict
```

It reports and never deletes. A fixture name can be composed at runtime, so anything
listed is a candidate to check, not a verdict. References are searched across `test/`,
`.github/`, `package.json` and the vitest configs, since a fixture is often named from a
config rather than from a test file.

It also flags build output (`.nuxt`, `.output`, `.output-shared`, `.nuxt-test`,
`test-results`) inside a fixture. `pnpm run clean:test` removes most of it; `.output` it
does not, so remove that one by hand.

`--strict` fails only on build output that is **committed**: a local `.nuxt` is gitignored
and expected after running the suites, and an unreferenced fixture is a candidate to check
rather than a defect — which is why the command never deletes either.

## ensure-release-source

Root `package.json` **version** and `CHANGELOG.md` must only move through
`pnpm -C scripts cli release` (changelogen). Hand-bumps and hand-edited changelogs
look fine until the next release rewrites them or publishes the wrong version.

```bash
pnpm run release:source
pnpm -C scripts cli ensure-release-source
pnpm -C scripts cli ensure-release-source --base v3.24.0
```

Checks:

* uncommitted edits to `CHANGELOG.md` or a dirty root `package.json`
* commits since the previous release tag that change `CHANGELOG.md` without a
  `chore(release): vX.Y.Z` subject
* commits that bump the root version the same way

Wired after `release:auth` in `release:patch` / `minor` / `major`, and into `release:check` / `preflight`.

## preflight

The release scripts chain the gates with `&&`, which stops at the first failure: a run
that fails on the first gate tells you nothing about the other five, and each fix-and-retry
runs the whole chain again. `preflight` runs them all and reports together, publishing
nothing.

```bash
pnpm run preflight
pnpm -C scripts cli preflight --npm       # also check the registry and npm auth
pnpm -C scripts cli preflight --offline   # skip everything needing the network
pnpm -C scripts cli preflight --budget    # also build the app and check the payload budget
```

`payload-budget` is behind `--budget` because it builds an application: a gate that takes
ten minutes by default is a gate people stop running.

```
Release preflight

  ok deps-audit
  ok verify-packages
  ok api-surface
  ok docs-audit
  ok check-versions
  ok ensure-release-source
  -  ensure-npm-auth   skipped (needs --npm)

Would publish 15 package(s) (changelog from v3.21.4):
  …

All gates passed. Safe to release.
```

## In CI

`payload-budget` builds an app, so it belongs on pull requests that touch the runtime
rather than on every push. The rest are seconds each and are cheap enough to run always.

See also [Release Smoke Checks](/guide/release-smoke), which verifies the **published**
package by installing it into a real app.
