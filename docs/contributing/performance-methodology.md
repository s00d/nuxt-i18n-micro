---
title: 'Benchmark methodology'
description: 'How the performance suite compares a plain Nuxt app, @nuxtjs/i18n and nuxt-i18n-micro, and which load profile to use.'
outline: [2, 3]
---

# Benchmark methodology

`pnpm test:performance` builds the same generated app without i18n, with `@nuxtjs/i18n` and with this module, then load-tests each build. Run it when a change may affect build time, memory or throughput. Results for the current release are on [Benchmarks](/guide/performance-results); this page explains what they measure and how to reproduce them.

## What is measured

| Layer | Artifact |
| --- | --- |
| App | Generated fixture, `nuxi build`, Nitro `node-server` output (`.output/server/index.mjs`) |
| Module | Root `dist/module.mjs` from `nuxt-module-build build`; the suite fails on a jiti stub |
| Packages | `@i18n-micro/*/dist`, built before the suite |
| Load | Artillery through `@untestutils/perf` |

Vite SPA output, `nuxi preview` and dev servers are not measured. The defaults are 4 locales, 10,000 leaf keys per tree and 3 consecutive runs (means reported), with paths for `prefix_except_default`.

## Load profiles

| `--load` | Window | Use |
| --- | --- | --- |
| `short` (default) | Warm 2 s at 10/s, main 10 s at 40/s, max 40 VUs | Day to day and CI |
| `mid` | Warm 6 s at 6/s, main 30 s at 60/s, uncapped | Between the two |
| `full` | Warm 6 s at 6/s, main 60 s at 60/s, uncapped | Published numbers |

Absolute RPS scales with the window and the machine. In an A/B of all three profiles the ranking of the three apps never changed, so `short` is the default and `full` is kept for the published page.

## Cool-downs

| `--cool` | After build | Between runs | Between targets |
| --- | --- | --- | --- |
| `fast` (default) | 200 ms | 500 ms | 500 ms |
| `strict` | 2 s | 3 s | 5 s |

`fast` preserves the ranking; `strict` reproduces the older pauses.

## Commands

```bash
# day to day: --load short --cool fast --runs 3
pnpm test:performance

# one target, or build times only
pnpm -C scripts cli performance --only micro
pnpm -C scripts cli performance --skip-load

# regenerate docs/guide/performance-results.md
pnpm -C scripts cli performance --load full --cool fast --runs 3 --only all
```

`--only` takes `plain`, `i18n`, `micro` or `all`. The results page is written only with `--load full --only all`.

## Related

- [Benchmarks](/guide/performance-results)
- [Performance](/guide/performance)
- [Maintenance commands](/contributing/maintenance-commands)
