---
title: "Performance methodology"
description: "Why default load is short; when to use --load full."
outline: deep
---

# Performance methodology

Measured A/B on 2026-09-22 (logs: `/tmp/i18n-perf-ab-20260922095038/`). Same machine, `--runs 3`, `--cool strict`, forced rebuilds, **real** `nuxt-i18n-micro` dist (not jiti stub), Nitro `.output/server/index.mjs`.

## What we measure

| Layer | Artifact |
|-------|----------|
| App under test | Fixture `nuxi build` → Nitro **node-server** `.output/server/index.mjs` |
| Module under test | Root `dist/module.mjs` after `nuxt-module-build build` (fail if jiti stub) |
| Packages | `@i18n-micro/*/dist` built before suite |
| Load | Artillery knobs via `@untestutils/perf` ≥0.6.10 |

Not measured: Vite SPA `dist/`, `nuxi preview`, `run: 'dev'`.

## Load profiles

| id | Window | Wall (≈) | plain RPS | v10 RPS | micro RPS | RPS order |
|----|--------|----------|-----------|---------|-----------|-----------|
| **short** | 2s@10 + 10s@40 / maxVU 40 | ~6 min | 42 | 66 | 109 | micro > v10 > plain |
| **mid** | 6s@6 + 30s@60 uncapped | ~11 min | 55 | 112 | 199 | micro > v10 > plain |
| **full** | 6s@6 + 60s@60 uncapped | ~14 min | 102 | 126 | 230 | micro > v10 > plain |

Absolute RPS scales with window/VU (expected). **Relative ranking and the sign of micro−v10 never flipped.**

## Decision

- **CLI default** = `--load short` + `--cool fast` — cheapest profile that preserves ranking.
- **Published docs** (`performance-results.md` / charts / marketing tables) = `--load full --only all` (writes docs only when `load === 'full'`).
- Blind restore of historical 6+60 as the only path was wrong: it burns ~2× wall time without changing conclusions.

## Cool-downs

| preset | postBuild | between runs | between targets | short RPS order (mean of 3) |
|--------|-----------|--------------|-----------------|------------------------------|
| **fast** (default) | 200 ms | 500 ms | 500 ms | micro 250 > v10 142 > plain 69 |
| strict | 2000 ms | 3000 ms | 5000 ms | micro 109 > v10 66 > plain 42 |

Ranking unchanged with **fast**. Absolute RPS differs between sessions (machine load); relative order holds. Use `--cool strict` only when reproducing pre-migration pauses.

Published snapshot in `performance-results.md` from this A/B used `--load full --cool strict`; regenerate with `--cool fast` when refreshing marketing numbers if you want defaults mirrored exactly.

## Commands

```bash
# day-to-day / CI
pnpm test:performance
# same as: --load short --cool fast --runs 3

# regenerate published numbers
pnpm -C scripts cli performance --load full --cool fast --runs 3 --only all
```
