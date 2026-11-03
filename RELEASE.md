# Releasing nuxt-i18n-micro

Every command a release needs, in the order you run them. The maintainer picks every version level and starts every publish: no CI workflow publishes to npm, and no command reads a level from commit messages.

The detailed reference is [Maintenance commands](https://s00d.github.io/nuxt-i18n-micro/contributing/maintenance-commands#publishing) (`docs/content/contributing/maintenance-commands.md`).

## Before you start

```bash
npm login            # or: npm whoami, to check
gh auth status       # gh is used for the CI check and the GitHub release
git checkout main && git pull
pnpm install --frozen-lockfile
```

If a local install looks broken (for example `astro check` asks to install `@astrojs/check` although it is installed), relink everything from the lockfile:

```bash
pnpm install --force --frozen-lockfile
```

## 1. Publish

| What | Command |
| --- | --- |
| Root module, patch / minor / major | `pnpm run release:patch` · `pnpm run release:minor` · `pnpm run release:major` |
| Packages only (root stays) | `pnpm run release:packages` |
| Everything but publishing (a dry run) | `pnpm run release:check` |

Each release command runs `pnpm -C scripts cli publish`, which does, in order:

1. `release:auth`: stops when you are not logged in to npm.
2. `prepack`: builds the packages, the module and the DevTools client.
3. `format:check`, `lint`, `typecheck`, `check:versions -- --npm`, `release:source`, `compare:published`.
4. `test` (the whole suite).
5. With `--bump`: changelogen writes the root `version` and `CHANGELOG.md`, commits `chore(release): vX.Y.Z` and tags it.
6. `pnpm publish -r`: the root and every package whose version is not on npm yet.
7. `git push --follow-tags`.

### Skipping the tests (step 4)

Everything else, the build and the packaging checks, still runs.

| Flag | When | What it checks |
| --- | --- | --- |
| `--ci-passed` | CI already passed on `HEAD` | Asks `gh` that the `ci` job passed on `HEAD`. Refuses when CI failed, is still running, or the tree is dirty |
| `--ci-passed --force` | CI passed but `gh` cannot answer (offline, not logged in) | Nothing: your confirmation. Does not override a failed run |
| `--skip-tests` | You decide the tests are not needed, for example a fix since the last green run cannot affect them | Nothing: your call |

```bash
pnpm run release:major --ci-passed
pnpm run release:major --skip-tests
pnpm run release:packages --skip-tests
```

`--ci-passed` and `--skip-tests` cannot be combined. The flags go straight after the script name; `pnpm run release:major -- --skip-tests` works too.

### Packages

`bump` edits only `version` in the named `packages/*/package.json`. It does not commit, tag or publish.

```bash
pnpm run bump --level patch --packages core,vue   # short or scoped names, or `all`
pnpm run check:versions                           # names dependents that still need a bump
git commit -am "chore(packages): bump versions"
pnpm run release:packages
```

Bump a package only when its current version is already on npm. A version that is not published yet ships as it is.

### When a publish stops halfway

`pnpm publish -r` stops at the first package it cannot publish, so some packages can be on npm and others not. Nothing needs to be undone: the commit and the tag already exist, and `release:packages` publishes only the versions npm does not have yet.

```bash
pnpm run release:packages --skip-tests
```

Then check that a clean install works:

```bash
mkdir /tmp/i18n-check && cd /tmp/i18n-check && npm init -y >/dev/null
npm install nuxt-i18n-micro@latest --ignore-scripts
npm view nuxt-i18n-micro dist-tags
npm view @i18n-micro/utils dist-tags
```

## 2. GitHub release

`release` runs changelogen with `--no-github`, so it never opens a browser with a huge URL. Create the GitHub release from the tag:

```bash
GH_TOKEN="$(gh auth token)" pnpm exec changelogen gh release X.Y.Z
```

For a release with a banner and hand-written notes (as for 4.0.0):

```bash
gh release upload vX.Y.Z docs/public/X.Y.Z.png --clobber
gh release edit vX.Y.Z --title "vX.Y.Z" --notes-file notes.md
```

In the notes, reference the banner as `https://github.com/s00d/nuxt-i18n-micro/releases/download/vX.Y.Z/X.Y.Z.png`.

## 3. Documentation

The docs site is a static Nuxt site (`docs/`) on GitHub Pages under `/nuxt-i18n-micro/`.

| Command | What |
| --- | --- |
| `pnpm run docs:dev` | Dev server |
| `pnpm run docs:build` | Generate the API pages, then `nuxt generate` into `docs/.output/public` |
| `pnpm run docs:preview` | Serve the build the way GitHub Pages does |
| `pnpm run docs:generate` | Regenerate the API pages from the sources |

`.github/workflows/docs.yml` deploys on a push to `main` that changes `docs/`, on a published GitHub release, and by hand:

```bash
gh workflow run docs.yml
```

Release notes live in `docs/content/news/`. Add a page there only for a released version.

## 4. The v3 line

v3 lives on the `v3` branch. Users install it by major version, no tag needed:

```bash
npm install nuxt-i18n-micro@3
```

To publish a 3.x patch:

```bash
git checkout v3 && git pull
pnpm run release:patch
```

The v3 `release:*` scripts pass `--tag v3` to `pnpm publish`. That tag is only there because npm refuses to publish a version lower than `latest` under `latest`; nobody needs to install by it.

## 5. Packages replaced in 4.0

```bash
npm deprecate nuxt-i18n-micro-cli "Replaced by @i18n-micro/cli"
npm deprecate @i18n-micro/hmr "Translation HMR is built into nuxt-i18n-micro 4"
```

## Checklist

- [ ] `main` pulled, install clean
- [ ] `pnpm run release:<level>` (with `--ci-passed` or `--skip-tests` if the tests already ran)
- [ ] every package on npm: `npm install nuxt-i18n-micro@latest` in an empty folder
- [ ] GitHub release created, notes and banner in place
- [ ] docs deployed (the `docs` workflow ran on the release)
- [ ] for a major: deprecations
