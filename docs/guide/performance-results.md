---
title: "Performance Test Results"
description: "Benchmarks vs nuxt-i18n on real fixtures."
outline: "deep"
---

# Performance Test Results

## Project Information

- **[plain-nuxt](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/plain-nuxt)**: ./test/fixtures/plain-nuxt
- **[i18n-micro](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n-micro)**: ./test/fixtures/i18n-micro
- **[i18n](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n)**: ./test/fixtures/i18n
- **CLI**: `pnpm test:performance`

### Description

Compares **plain Nuxt**, **i18n-micro**, and **`@nuxtjs/i18n`** under one shared dictionary profile via `untestutils/perf`.

Focus: build time, peak RSS, deployable **code vs translations (asset) vs total**, and load (Artillery).

### Methodology notes

- Metrics are **means of 3 consecutive runs per fixture** (not interleaved).
- **Artifact**: Nitro node-server `.output/server/index.mjs` after forced `nuxi build`; `nuxt-i18n-micro` is the **built module dist** (not `dev:prepare` jiti stub). See [performance-methodology.md](./performance-methodology.md).
- **Translations** = `bundle.asset` (locale JSON, `chunks/raw/`, matching locale chunks via `isTranslationFile`).
- **plain-nuxt** serves the same leaf volume as static JSON — I/O-heavy under load, not “i18n overhead”.
- Load profile `--load full`: warm 6s@6 + main 60s@60 uncapped (historical).
- Cool-downs `--cool fast` (see methodology doc).
- Artillery **Error rate** in tables is HTTP-status errors from the load metrics. Charts also plot `vusers.failed` (client timeouts under saturation); those can be high while HTTP error rate stays 0%.
- Each of the `runs` builds is **forced** (no warm-cache zeroing of build time).
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

Dictionaries come from `test/fixtures/perf-shared/runtime.json` (written by the CLI) so all three fixtures stay aligned.


## Dependency Versions

| Dependency | Version |
|------------|---------|
| node | v22.23.2 |
| nuxt | 4.5.2 |
| nuxt-i18n-micro | 3.29.8 |
| @nuxtjs/i18n | 10.6.0 |

## Source dictionaries (pre-build)

| Fixture | On-disk locale data |
|---------|---------------------|
| **plain-nuxt** | 114.88 MB |
| **i18n-v10** | 6.8 MB |
| **i18n-micro** | 6.8 MB |

> From `runtime.json` (4 locales, 16,807 index leaf keys).

## Build Performance for test/fixtures/plain-nuxt

- **Build Time**: 4.59 seconds
- **Bundle Size**: 8.07 MB (code: 1.26 MB, translations: 6.8 MB)
- **Output dirs**: public: 7 MB, server: 1.06 MB
- **Max / Avg CPU**: 226.73% / 155.16%
- **Max / Avg Memory**: 890.16 MB / 473.88 MB


## Build Performance for test/fixtures/i18n

- **Build Time**: 5.48 seconds
- **Bundle Size**: 9.15 MB (code: 1.95 MB, translations: 7.21 MB)
- **Output dirs**: public: 323.47 KB, server: 8.84 MB
- **Max / Avg CPU**: 239.30% / 167.34%
- **Max / Avg Memory**: 1325.84 MB / 670.48 MB


## Build Performance for test/fixtures/i18n-micro

- **Build Time**: 4.99 seconds
- **Bundle Size**: 8.28 MB (code: 1.48 MB, translations: 6.8 MB)
- **Output dirs**: public: 7.08 MB, server: 1.21 MB
- **Max / Avg CPU**: 232.93% / 161.92%
- **Max / Avg Memory**: 995.58 MB / 559.91 MB


## Build Performance Summary (mean of 3 runs)

| Project | Build Time | Code Bundle | Translations | Total |
|---------|------------|-------------|--------------|-------|
| **plain-nuxt (baseline)** | 4.59s | 1.26 MB | 6.8 MB | 8.07 MB |
| **i18n-v10** | 5.48s | 1.95 MB | 7.21 MB | 9.15 MB |
| **i18n-micro** | 4.99s | 1.48 MB | 6.8 MB | 8.28 MB |

> “Total” = code + translations (`bundle.asset`). Translations include `locales/`, `_locales/`, `chunks/raw/`, and matching locale chunks.

```chart
url: /charts/build-time-comparison.js
height: 350px
```

```chart
url: /charts/bundle-size-comparison.js
height: 400px
```

```chart
url: /charts/translations-size-comparison.js
height: 350px
```

```chart
url: /charts/total-bundle-comparison.js
height: 350px
```

## Load Results for plain-nuxt

### Resource Usage
- **Max / Avg CPU**: 142.87% / 119.18%
- **Max / Avg Memory**: 559.38 MB / 472.97 MB

### Artillery
- **Duration**: 86.55s · **RPS**: 108.00 · **Error rate**: 0.00%
- **Latency avg / p50 / p95 / p99**: 1877.63 / 663.60 / 12547.07 / 12983.90 ms

```chart
url: /charts/plain-nuxt-traffic.js
height: 400px
```

```chart
url: /charts/plain-nuxt-latency.js
height: 300px
```

## Load Results for i18n-v10

### Resource Usage
- **Max / Avg CPU**: 135.00% / 106.04%
- **Max / Avg Memory**: 527.66 MB / 418.26 MB

### Artillery
- **Duration**: 78.75s · **RPS**: 161.33 · **Error rate**: 0.00%
- **Latency avg / p50 / p95 / p99**: 857.43 / 106.00 / 6702.60 / 6977.03 ms

```chart
url: /charts/i18n-v10-traffic.js
height: 400px
```

```chart
url: /charts/i18n-v10-latency.js
height: 300px
```

## Load Results for i18n-micro

### Resource Usage
- **Max / Avg CPU**: 131.37% / 101.79%
- **Max / Avg Memory**: 474.45 MB / 305.38 MB

### Artillery
- **Duration**: 73.18s · **RPS**: 251.33 · **Error rate**: 0.00%
- **Latency avg / p50 / p95 / p99**: 486.20 / 86.20 / 3534.10 / 3830.03 ms

```chart
url: /charts/i18n-micro-traffic.js
height: 400px
```

```chart
url: /charts/i18n-micro-latency.js
height: 300px
```

## Load Summary (mean of 3 runs)

### Artillery
| Project | Avg Response | P50 | P95 | P99 | RPS | Error Rate |
|---------|--------------|-----|-----|-----|-----|------------|
| **plain-nuxt** | 1877.63 ms | 663.60 ms | 12547.07 ms | 12983.90 ms | 108.00 | 0.00% |
| **i18n-v10** | 857.43 ms | 106.00 ms | 6702.60 ms | 6977.03 ms | 161.33 | 0.00% |
| **i18n-micro** | 486.20 ms | 86.20 ms | 3534.10 ms | 3830.03 ms | 251.33 | 0.00% |


## Performance Comparison

### Throughput (Requests per Second)

> **Winner: i18n-micro** with 251 RPS

```chart
url: /charts/comparison-rps-artillery.js
height: 350px
```

### Latency Distribution

> **Winner: i18n-micro** with 486.20 ms avg latency

```chart
url: /charts/comparison-latency.js
height: 350px
```

### Quick Comparison

| Metric | **plain-nuxt** | **i18n-v10** | **i18n-micro** | Best |
|--------|---|---|---|------|
| RPS (Artillery) | 108 | 161 | 251 | i18n-micro |
| Avg Latency | 1877.63 ms | 857.43 ms | 486.20 ms | i18n-micro |
| P99 Latency | 12983.90 ms | 6977.03 ms | 3830.03 ms | i18n-micro |
| Error rate | 0.00% | 0.00% | 0.00% | - |



## Comparison: plain-nuxt (baseline) vs i18n v10

| Metric | plain-nuxt (baseline) | i18n v10 | Difference |
|--------|----------|----------|------------|
| Max Memory | 559.38 MB | 527.66 MB | -31.72 MB |
| Avg Memory | 472.97 MB | 418.26 MB | -54.71 MB |
| Response Avg | 1877.63 ms | 857.43 ms | -1020.20 ms |
| Response P95 | 12547.07 ms | 6702.60 ms | -5844.47 ms |
| RPS (Artillery) | 108.00 | 161.33 | +53.33  |
| Error rate | 0.00% | 0.00% | 0.00 % |


## Comparison: plain-nuxt (baseline) vs i18n-micro

| Metric | plain-nuxt (baseline) | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 559.38 MB | 474.45 MB | -84.93 MB |
| Avg Memory | 472.97 MB | 305.38 MB | -167.59 MB |
| Response Avg | 1877.63 ms | 486.20 ms | -1391.43 ms |
| Response P95 | 12547.07 ms | 3534.10 ms | -9012.97 ms |
| RPS (Artillery) | 108.00 | 251.33 | +143.33  |
| Error rate | 0.00% | 0.00% | 0.00 % |


## Comparison: i18n v10 vs i18n-micro

| Metric | i18n v10 | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 527.66 MB | 474.45 MB | -53.21 MB |
| Avg Memory | 418.26 MB | 305.38 MB | -112.88 MB |
| Response Avg | 857.43 ms | 486.20 ms | -371.23 ms |
| Response P95 | 6702.60 ms | 3534.10 ms | -3168.50 ms |
| RPS (Artillery) | 161.33 | 251.33 | +90.00  |
| Error rate | 0.00% | 0.00% | 0.00 % |


## Notes

- Shared profile: 4 locales × 2 pages × ~16.8k index leaves.
- Load: programmatic Artillery only — warm **6s@6** + main **60s@60**, uncapped VU (historical YAML methodology). Paths from runtime profile — see `scripts/src/perf/load.ts`.
- Cool-downs (`--cool fast`): 0.2s post-build, 0.5s between runs, 0.5s between fixtures. Builds are forced each run so means are not diluted by cache hits.
- Artillery tables use HTTP **Error rate**; traffic charts also show `vusers.failed` (ETIMEDOUT under uncapped VU saturation) — not the same metric.
- Re-run day-to-day: `pnpm test:performance` (`--load short --cool fast`).
- Regenerate this page: `pnpm -C scripts cli performance --load full --only all --runs 3`.
- Flags: `--locales N --keys K --only all|micro|i18n|plain --runs N --skip-load --cool fast|strict`.
