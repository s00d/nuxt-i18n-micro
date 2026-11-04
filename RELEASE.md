# Releasing

## Patch

Before the merge, if `packages/*` changed:

```bash
pnpm run bump --level patch --packages core,vue
pnpm run check:versions -- --npm   # bump what it lists, until OK
```

After the merge:

```bash
git checkout main && git pull && pnpm install --frozen-lockfile
pnpm run release:patch --ci-passed
GH_TOKEN="$(gh auth token)" pnpm exec changelogen gh release X.Y.Z
```

Minor / major: `release:minor` / `release:major`.

## Packages only

```bash
pnpm run release:packages --ci-passed
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
