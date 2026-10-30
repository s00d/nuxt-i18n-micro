# Perf shared profile

Shared locale list + dictionary generator for the three performance fixtures:

- `plain-nuxt`
- `i18n` (`@nuxtjs/i18n`)
- `i18n-micro`

Defaults: **4 locales**, index+page, ~10k index leaves (branch 7 × depth 5).

Override by running:

```bash
pnpm -C scripts cli performance --locales 12 --keys 100000
```

That writes `runtime.json` here and `perf-locales.mjs` next to each fixture `nuxt.config`. Fixture `generate:locales` / `prebuild` read the runtime profile so dictionaries stay aligned.
