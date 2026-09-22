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

- Metrics are **means of 1 consecutive runs per fixture** (not interleaved).
- **Translations** = `bundle.asset` (locale JSON, `chunks/raw/`, matching locale chunks via `isTranslationFile`).
- **plain-nuxt** serves the same leaf volume as static JSON — I/O-heavy under load, not “i18n overhead”.

### Runs

All metrics below are **means across 1 runs**.

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
| nuxt-i18n-micro | 3.29.5 |
| @nuxtjs/i18n | 10.6.0 |

## Source dictionaries (pre-build)

| Fixture | On-disk locale data |
|---------|---------------------|
| **plain-nuxt** | 114.88 MB |
| **i18n-v10** | 6.8 MB |
| **i18n-micro** | 6.8 MB |

> From `runtime.json` (4 locales, 16,807 index leaf keys).

## Build Performance for test/fixtures/plain-nuxt

- **Build Time**: 0.00 seconds
- **Bundle Size**: 8.03 MB (code: 1.23 MB, translations: 6.8 MB)
- **Output dirs**: public: 7 MB, server: 1.03 MB
- **Max / Avg CPU**: 0.00% / 0.00%
- **Max / Avg Memory**: 0.00 MB / 0.00 MB


## Build Performance for test/fixtures/i18n

- **Build Time**: 0.00 seconds
- **Bundle Size**: 9.11 MB (code: 1.9 MB, translations: 7.21 MB)
- **Output dirs**: public: 321.25 KB, server: 8.79 MB
- **Max / Avg CPU**: 0.00% / 0.00%
- **Max / Avg Memory**: 0.00 MB / 0.00 MB


## Build Performance for test/fixtures/i18n-micro

- **Build Time**: 6.11 seconds
- **Bundle Size**: 8.23 MB (code: 1.44 MB, translations: 6.8 MB)
- **Output dirs**: public: 7.07 MB, server: 1.16 MB
- **Max / Avg CPU**: 0.00% / 0.00%
- **Max / Avg Memory**: 0.03 MB / 0.03 MB


## Build Performance Summary (mean of 1 run)

> Committed snapshot below was generated with `--runs 1`. Default CLI is now **`--runs 3`** — re-run `pnpm test:performance` to refresh means of three.
| Project | Build Time | Code Bundle | Translations | Total |
|---------|------------|-------------|--------------|-------|
| **plain-nuxt (baseline)** | 0.00s | 1.23 MB | 6.8 MB | 8.03 MB |
| **i18n-v10** | 0.00s | 1.9 MB | 7.21 MB | 9.11 MB |
| **i18n-micro** | 6.11s | 1.44 MB | 6.8 MB | 8.23 MB |

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
- **Max / Avg CPU**: 110.21% / 110.21%
- **Max / Avg Memory**: 340.81 MB / 212.04 MB

### Artillery
- **Duration**: 13.91s · **RPS**: 82.00 · **Error rate**: 0.00%
- **Latency avg / p50 / p95 / p99**: 392.10 / 407.50 / 620.30 / 804.50 ms

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
- **Max / Avg CPU**: 110.58% / 110.58%
- **Max / Avg Memory**: 529.20 MB / 324.30 MB

### Artillery
- **Duration**: 13.61s · **RPS**: 113.00 · **Error rate**: 0.00%
- **Latency avg / p50 / p95 / p99**: 214.30 / 96.60 / 1525.70 / 1556.50 ms

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
- **Max / Avg CPU**: 101.07% / 101.07%
- **Max / Avg Memory**: 308.70 MB / 197.16 MB

### Artillery
- **Duration**: 13.19s · **RPS**: 257.00 · **Error rate**: 0.00%
- **Latency avg / p50 / p95 / p99**: 85.30 / 40.00 / 528.60 / 757.60 ms

```chart
url: /charts/i18n-micro-traffic.js
height: 400px
```

```chart
url: /charts/i18n-micro-latency.js
height: 300px
```

## Load Summary (mean of 1 run)

### Artillery
| Project | Avg Response | P50 | P95 | P99 | RPS | Error Rate |
|---------|--------------|-----|-----|-----|-----|------------|
| **plain-nuxt** | 392.10 ms | 407.50 ms | 620.30 ms | 804.50 ms | 82.00 | 0.00% |
| **i18n-v10** | 214.30 ms | 96.60 ms | 1525.70 ms | 1556.50 ms | 113.00 | 0.00% |
| **i18n-micro** | 85.30 ms | 40.00 ms | 528.60 ms | 757.60 ms | 257.00 | 0.00% |


## Performance Comparison

### Throughput (Requests per Second)

> **Winner: i18n-micro** with 257 RPS

```chart
url: /charts/comparison-rps-artillery.js
height: 350px
```

### Latency Distribution

> **Winner: i18n-micro** with 85.30 ms avg latency

```chart
url: /charts/comparison-latency.js
height: 350px
```

### Quick Comparison

| Metric | **plain-nuxt** | **i18n-v10** | **i18n-micro** | Best |
|--------|---|---|---|------|
| RPS (Artillery) | 82 | 113 | 257 | i18n-micro |
| Avg Latency | 392.10 ms | 214.30 ms | 85.30 ms | i18n-micro |
| P99 Latency | 804.50 ms | 1556.50 ms | 757.60 ms | i18n-micro |
| Error rate | 0.00% | 0.00% | 0.00% | - |



## Comparison: plain-nuxt (baseline) vs i18n v10

| Metric | plain-nuxt (baseline) | i18n v10 | Difference |
|--------|----------|----------|------------|
| Max Memory | 340.81 MB | 529.20 MB | +188.39 MB |
| Avg Memory | 212.04 MB | 324.30 MB | +112.26 MB |
| Response Avg | 392.10 ms | 214.30 ms | -177.80 ms |
| Response P95 | 620.30 ms | 1525.70 ms | +905.40 ms |
| RPS (Artillery) | 82.00 | 113.00 | +31.00  |
| Error rate | 0.00% | 0.00% | 0.00 % |


## Comparison: plain-nuxt (baseline) vs i18n-micro

| Metric | plain-nuxt (baseline) | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 340.81 MB | 308.70 MB | -32.11 MB |
| Avg Memory | 212.04 MB | 197.16 MB | -14.88 MB |
| Response Avg | 392.10 ms | 85.30 ms | -306.80 ms |
| Response P95 | 620.30 ms | 528.60 ms | -91.70 ms |
| RPS (Artillery) | 82.00 | 257.00 | +175.00  |
| Error rate | 0.00% | 0.00% | 0.00 % |


## Comparison: i18n v10 vs i18n-micro

| Metric | i18n v10 | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 529.20 MB | 308.70 MB | -220.50 MB |
| Avg Memory | 324.30 MB | 197.16 MB | -127.14 MB |
| Response Avg | 214.30 ms | 85.30 ms | -129.00 ms |
| Response P95 | 1525.70 ms | 528.60 ms | -997.10 ms |
| RPS (Artillery) | 113.00 | 257.00 | +144.00  |
| Error rate | 0.00% | 0.00% | 0.00 % |


## Notes

- Shared profile: 4 locales × 2 pages × ~16.8k index leaves.
- Load: programmatic Artillery only — warm **6s@6** + main **60s@60**, uncapped VU (historical YAML). Paths from runtime profile — see `scripts/src/perf/load.ts`.
- Cool-downs: 2s post-build, 3s between runs, 5s between fixtures. Builds forced each run.
- Re-run: `pnpm test:performance` or `pnpm -C scripts cli performance --locales N --keys K --only all|micro|i18n|plain --runs N --skip-load`.
