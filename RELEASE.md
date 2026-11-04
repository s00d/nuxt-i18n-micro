# Releasing nuxt-i18n-micro

How to ship a fix or a new version. You pick the version level and start every publish: no CI workflow publishes to npm.

Reference for every command and flag: [Maintenance commands](docs/content/contributing/maintenance-commands.md#publishing).

## Which release do I need?

| What changed                                                                                 | Release                                    |
| -------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Only `packages/*` (a bug in `path-strategy`, `core`, `vue`…), and the module needs no change | [Packages only](#packages-only)            |
| `src/` (the Nuxt module), with or without packages                                           | [Patch](#patch)                            |
| A new option or feature, nothing breaks                                                      | [Minor](#minor-and-major): `release:minor` |
| A breaking change                                                                            | [Major](#minor-and-major): `release:major` |
| A fix for 3.x users                                                                          | [Patch on v3](#patch-on-v3)                |

## Patch

The usual case: a bug fixed in `src/`, maybe in a package too.

**1. On a branch, before the PR is merged**

```bash
git checkout -b fix/<what>
# ...the fix and its test...

# only if packages/* changed: bump each changed package once, then its dependents
pnpm run bump --level patch --packages path-strategy
pnpm run check:versions -- --npm      # lists every dependent that still needs a bump
pnpm run bump --level patch --packages core,vue   # comma-separated, as listed
pnpm run check:versions -- --npm      # must end with "OK: N/N"
```

- Bump a package only if its current version is already on npm. One bump per package per release, not per commit.
- Do not touch the root `version` or `CHANGELOG.md`: the release command writes them.
- Commit, push, open the PR, wait for CI, merge.

**2. On `main`, after the merge**

```bash
git checkout main && git pull
pnpm install --frozen-lockfile
npm whoami && gh auth status

pnpm run release:patch --ci-passed
```

This bumps the root (`4.0.0` → `4.0.1`), writes `CHANGELOG.md`, commits `chore(release): v4.0.1`, tags `v4.0.1`, publishes the root and every package whose version is not on npm yet, and pushes the commit and the tag.

**3. After publishing:** [check it, create the GitHub release](#after-publishing).

## Packages only

The module stays at its version; users get the fix through the `^` range of its dependency (`"@i18n-micro/path-strategy": "^2.0.0"` takes `2.0.1`).

1. Same branch work as for a [patch](#patch): fix, `bump`, `check:versions -- --npm`, PR, merge.
2. On `main`:

```bash
git checkout main && git pull
pnpm install --frozen-lockfile
pnpm run release:packages --ci-passed
```

No root bump, no tag, no `CHANGELOG.md` entry: only the package versions npm does not have yet are published.

## Minor and major

Same as a patch, with `pnpm run release:minor` or `pnpm run release:major`. For a major also:

- write the release notes in `docs/content/news/vX.0.0.md` and the upgrade guide `docs/content/guide/upgrade.md` before the release;
- bump the packages a level up as well (`--level major`) when their API breaks.

## Patch on v3

3.x fixes live on the `v3` branch. Its scripts publish under the npm tag `v3`, so `latest` stays on 4.x.

```bash
git checkout v3 && git pull
git checkout -b fix/v3-<what>
# ...the fix, PR into v3, merge...

git checkout v3 && git pull
pnpm install --frozen-lockfile
pnpm run release            # checks, tests, then release:patch
```

On `v3`, `release:patch` alone runs no checks; `pnpm run release` runs `release:check` first.

## Skipping the tests

Every release command runs the build and the packaging checks (`format:check`, `lint`, `typecheck`, `check:versions -- --npm`, `release:source`, `compare:published`), then the full test suite. Two flags skip only the test suite:

| Flag           | Use it when                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `--ci-passed`  | CI passed on `HEAD` (after a merge, the `main` run). Checked through `gh`; refused while CI is running or failed, or with a dirty tree |
| `--skip-tests` | You decide: CI is still running on a commit that changes nothing tested, or the tests ran already                                      |

Without a flag the whole suite runs locally (long). `--ci-passed --force` trusts you when `gh` cannot answer.

## When a publish stops halfway

`pnpm publish -r` stops at the first package it cannot publish, so some versions reach npm and others do not (`npm install` then fails with `ETARGET`). Nothing to undo: the commit and the tag exist. Publish the rest:

```bash
pnpm run release:packages --skip-tests
```

## After publishing

**Check that a clean install works:**

```bash
cd "$(mktemp -d)" && npm init -y >/dev/null
npm install nuxt-i18n-micro@latest --ignore-scripts
npm view nuxt-i18n-micro version
npm view @i18n-micro/path-strategy version   # each package you bumped
```

**Create the GitHub release** (only for a root release; it has a tag):

```bash
GH_TOKEN="$(gh auth token)" pnpm exec changelogen gh release 4.0.1
```

For hand-written notes or a banner:

```bash
gh release edit v4.0.1 --notes-file notes.md
gh release upload v4.0.1 docs/public/4.0.1.png --clobber
```

**Docs** deploy by themselves on a published GitHub release and on a push to `main` that changes `docs/`. By hand: `gh workflow run docs.yml`.

## Checklist

- [ ] Fix merged to `main` with its test; CI green
- [ ] Changed packages and their dependents bumped, `check:versions -- --npm` OK
- [ ] `pnpm run release:<patch|minor|major|packages> --ci-passed`
- [ ] Clean install of `@latest` works
- [ ] GitHub release created (root releases)
