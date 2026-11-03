---
title: "Performance Test Results"
description: "Benchmarks vs nuxt-i18n on real fixtures."
outline: "deep"
navigation:
  order: 180
  group: Production
---

# Performance Test Results

## Project Information

- **[plain-nuxt](https://github.com/s00d/nuxt-i18n-micro/tree/main/scripts/perf-fixtures/plain-nuxt)**: ./scripts/perf-fixtures/plain-nuxt
- **[i18n-micro](https://github.com/s00d/nuxt-i18n-micro/tree/main/scripts/perf-fixtures/i18n-micro)**: ./scripts/perf-fixtures/i18n-micro
- **[i18n](https://github.com/s00d/nuxt-i18n-micro/tree/main/scripts/perf-fixtures/i18n)**: ./scripts/perf-fixtures/i18n
- **CLI**: `pnpm test:performance`

### Description

Compares **plain Nuxt**, **i18n-micro**, and **`@nuxtjs/i18n`** under one shared dictionary profile via `untestutils/perf`.

Focus: build time, peak RSS, deployable **code vs translations (asset) vs total**, and load (Artillery).

### Methodology notes

- Metrics are **means of 3 consecutive runs per fixture** (not interleaved).
- **Artifact**: Nitro node-server `.output/server/index.mjs` after forced `nuxi build`; `nuxt-i18n-micro` is the **built module dist** (not `dev:prepare` jiti stub). See [benchmark methodology](/contributing/performance-methodology).
- **Translations** = `bundle.asset` (locale JSON, `chunks/raw/`, matching locale chunks via `isTranslationFile`).
- **Code** excludes source maps (`*.map`): the fixtures link the module from the repo, so Nitro writes full maps for it and none for npm dependencies.
- **plain-nuxt** serves the same leaf volume as static JSON — I/O-heavy under load, not “i18n overhead”.
- Load profile `--load full`: warm 6s@6 + main 60s@60 uncapped (historical).
- Cool-downs `--cool fast` (see methodology doc).
- Each of the `runs` builds is **forced** (no warm-cache zeroing of build time).
- Artillery **Error rate** in tables is HTTP-status errors from the load metrics. Charts also plot `vusers.failed` (client timeouts under saturation); those can be high while HTTP error rate stays 0%.
### Runs

All metrics below are **means across 3 runs**.

---

### Fixture profile

| Knob | Value |
|------|-------|
| Locales | **4** (`en`, `de`, `ru`, `fr`) |
| Pages | **2** (`index`, `page`) |
| Index tree | depth **5**, branch **7** → **16,807** leaf keys / locale |
| Secondary pages | depth **5**, branch **6** → **7,776** leaf keys / page / locale |
| Goal | Default CLI profile (`--locales 4 --keys 10000`); raise knobs for regression-radar loads |

Dictionaries come from `scripts/perf-fixtures/perf-shared/runtime.json` (written by the CLI) so all three fixtures stay aligned.

## Dependency Versions

| Dependency | Version |
|------------|---------|
| node | v22.23.4 |
| nuxt | 4.6.4 |
| nuxt-i18n-micro | 4.0.0 |
| @nuxtjs/i18n | 10.6.0 |

## Source dictionaries (pre-build)

| Fixture | On-disk locale data |
|---------|---------------------|
| **plain-nuxt** | 8.25 MB |
| **i18n-v10** | 6.8 MB |
| **i18n-micro** | 6.8 MB |

> From `runtime.json` (4 locales, 16,807 index leaf keys).

## Build Performance for scripts/perf-fixtures/plain-nuxt

- **Build Time**: 5.92 seconds
- **Bundle Size**: 7.91 MB (code: 1.11 MB, translations: 6.8 MB)
- **Output dirs**: public: 7.01 MB, server: 971.23 KB
- **Max / Avg CPU**: 237.93% / 124.86%
- **Max / Avg Memory**: 1042.92 MB / 447.42 MB

## Build Performance for scripts/perf-fixtures/i18n

- **Build Time**: 6.18 seconds
- **Bundle Size**: 8.96 MB (code: 1.75 MB, translations: 7.21 MB)
- **Output dirs**: public: 289.27 KB, server: 8.82 MB
- **Max / Avg CPU**: 237.80% / 150.36%
- **Max / Avg Memory**: 1356.10 MB / 660.55 MB

## Build Performance for scripts/perf-fixtures/i18n-micro

- **Build Time**: 4.74 seconds
- **Bundle Size**: 8.09 MB (code: 1.29 MB, translations: 6.8 MB)
- **Output dirs**: public: 7.06 MB, server: 3.1 MB
- **Max / Avg CPU**: 247.27% / 158.03%
- **Max / Avg Memory**: 1195.70 MB / 584.05 MB

## Build Performance Summary (mean of 3 runs)

| Project | Build Time | Code Bundle | Translations | Total |
|---------|------------|-------------|--------------|-------|
| **plain-nuxt (baseline)** | 5.92s | 1.11 MB | 6.8 MB | 7.91 MB |
| **i18n-v10** | 6.18s | 1.75 MB | 7.21 MB | 8.96 MB |
| **i18n-micro** | 4.74s | 1.29 MB | 6.8 MB | 8.09 MB |

> “Total” = code + translations (`bundle.asset`). Translations include `locales/`, `_locales/`, `chunks/raw/`, and matching locale chunks.

::docs-chart{url="/charts/build-time-comparison.js"}
::

::docs-chart{url="/charts/bundle-size-comparison.js"}
::

::docs-chart{url="/charts/translations-size-comparison.js"}
::

::docs-chart{url="/charts/total-bundle-comparison.js"}
::

## Load Results for plain-nuxt

### Resource Usage
- **Max / Avg CPU**: 142.00% / 118.34%
- **Max / Avg Memory**: 498.61 MB / 402.79 MB

### Artillery
- **Duration**: 86.17s · **RPS**: 114.67 · **Error rate**: 0.00%
- **Latency avg / p50 / p95 / p99**: 1744.23 / 608.33 / 11585.40 / 12474.77 ms

::docs-chart{url="/charts/plain-nuxt-traffic.js"}
::

::docs-chart{url="/charts/plain-nuxt-latency.js"}
::

## Load Results for i18n-v10

### Resource Usage
- **Max / Avg CPU**: 134.43% / 104.91%
- **Max / Avg Memory**: 482.12 MB / 369.27 MB

### Artillery
- **Duration**: 77.07s · **RPS**: 178.00 · **Error rate**: 0.00%
- **Latency avg / p50 / p95 / p99**: 757.87 / 86.87 / 6074.27 / 6428.17 ms

::docs-chart{url="/charts/i18n-v10-traffic.js"}
::

::docs-chart{url="/charts/i18n-v10-latency.js"}
::

## Load Results for i18n-micro

### Resource Usage
- **Max / Avg CPU**: 137.13% / 98.79%
- **Max / Avg Memory**: 407.34 MB / 327.15 MB

### Artillery
- **Duration**: 66.13s · **RPS**: 414.67 · **Error rate**: 0.00%
- **Latency avg / p50 / p95 / p99**: 41.17 / 28.60 / 101.87 / 237.73 ms

::docs-chart{url="/charts/i18n-micro-traffic.js"}
::

::docs-chart{url="/charts/i18n-micro-latency.js"}
::

## Load Summary (mean of 3 runs)

### Artillery
| Project | Avg Response | P50 | P95 | P99 | RPS | Error Rate |
|---------|--------------|-----|-----|-----|-----|------------|
| **plain-nuxt** | 1744.23 ms | 608.33 ms | 11585.40 ms | 12474.77 ms | 114.67 | 0.00% |
| **i18n-v10** | 757.87 ms | 86.87 ms | 6074.27 ms | 6428.17 ms | 178.00 | 0.00% |
| **i18n-micro** | 41.17 ms | 28.60 ms | 101.87 ms | 237.73 ms | 414.67 | 0.00% |

## Performance Comparison

### Throughput (Requests per Second)

> **Winner: i18n-micro** with 415 RPS

::docs-chart{url="/charts/comparison-rps-artillery.js"}
::

### Latency Distribution

> **Winner: i18n-micro** with 41.17 ms avg latency

::docs-chart{url="/charts/comparison-latency.js"}
::

### Quick Comparison

| Metric | **plain-nuxt** | **i18n-v10** | **i18n-micro** | Best |
|--------|---|---|---|------|
| RPS (Artillery) | 115 | 178 | 415 | i18n-micro |
| Avg Latency | 1744.23 ms | 757.87 ms | 41.17 ms | i18n-micro |
| P99 Latency | 12474.77 ms | 6428.17 ms | 237.73 ms | i18n-micro |
| Error rate | 0.00% | 0.00% | 0.00% | - |

## Comparison: plain-nuxt (baseline) vs i18n v10

| Metric | plain-nuxt (baseline) | i18n v10 | Difference |
|--------|----------|----------|------------|
| Max Memory | 498.61 MB | 482.12 MB | -16.49 MB |
| Avg Memory | 402.79 MB | 369.27 MB | -33.52 MB |
| Response Avg | 1744.23 ms | 757.87 ms | -986.37 ms |
| Response P95 | 11585.40 ms | 6074.27 ms | -5511.13 ms |
| RPS (Artillery) | 114.67 | 178.00 | +63.33  |
| Error rate | 0.00% | 0.00% | 0.00 % |

## Comparison: plain-nuxt (baseline) vs i18n-micro

| Metric | plain-nuxt (baseline) | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 498.61 MB | 407.34 MB | -91.27 MB |
| Avg Memory | 402.79 MB | 327.15 MB | -75.64 MB |
| Response Avg | 1744.23 ms | 41.17 ms | -1703.07 ms |
| Response P95 | 11585.40 ms | 101.87 ms | -11483.53 ms |
| RPS (Artillery) | 114.67 | 414.67 | +300.00  |
| Error rate | 0.00% | 0.00% | 0.00 % |

## Comparison: i18n v10 vs i18n-micro

| Metric | i18n v10 | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 482.12 MB | 407.34 MB | -74.78 MB |
| Avg Memory | 369.27 MB | 327.15 MB | -42.12 MB |
| Response Avg | 757.87 ms | 41.17 ms | -716.70 ms |
| Response P95 | 6074.27 ms | 101.87 ms | -5972.40 ms |
| RPS (Artillery) | 178.00 | 414.67 | +236.67  |
| Error rate | 0.00% | 0.00% | 0.00 % |

## Notes

- Shared profile: 4 locales × 2 pages × ~16.8k index leaves.
- Load: programmatic Artillery only — warm **6s@6** + main **60s@60**, uncapped VU (historical YAML methodology). Paths from runtime profile — see `scripts/src/perf/load.ts`.
- Cool-downs: 2s post-build, 3s between runs, 5s between fixtures. Builds are forced each run so means are not diluted by cache hits.
- Re-run day-to-day: `pnpm test:performance` (`--load short --cool fast`).
- Regenerate this page: `pnpm -C scripts cli performance --load full --only all --runs 3`.
- Flags: `--locales N --keys K --only all|micro|i18n|plain --runs N --skip-load --cool fast|strict`.
