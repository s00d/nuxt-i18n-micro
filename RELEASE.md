# Releasing

## Before the merge

If `packages/*` changed, bump them (`patch`, `minor` or `major`, same as the release):

```bash
pnpm run bump --level patch --packages core,vue
pnpm run check:versions -- --npm   # bump what it lists, until OK
```

## After the merge

```bash
git checkout main && git pull && pnpm install --frozen-lockfile
```

Then one of:

```bash
pnpm run release:patch --ci-passed      # 4.0.0 → 4.0.1, fixes
pnpm run release:minor --ci-passed      # 4.0.0 → 4.1.0, new features, nothing breaks
pnpm run release:major --ci-passed      # 4.0.0 → 5.0.0, breaking changes
pnpm run release:packages --ci-passed   # only bumped packages, the module stays
```

GitHub release (not for `release:packages`):

```bash
GH_TOKEN="$(gh auth token)" pnpm exec changelogen gh release X.Y.Z
```

## v3

```bash
git checkout v3 && git pull && pnpm install --frozen-lockfile
pnpm run release
```

## Notes

- `--ci-passed`: CI green on `HEAD`. `--skip-tests`: skip tests anyway.
- Publish stopped halfway: `pnpm run release:packages --skip-tests`.
- Never edit the root `version` or `CHANGELOG.md` by hand.
