---
url: 'https://s00d.github.io/nuxt-i18n-micro/guide/performance-results.md'
description: Benchmarks vs nuxt-i18n on real fixtures.
---

# Performance Test Results

## Project Information

* **[plain-nuxt](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/plain-nuxt)**: ./test/fixtures/plain-nuxt
* **[i18n-micro](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n-micro)**: ./test/fixtures/i18n-micro
* **[i18n](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n)**: ./test/fixtures/i18n
* **CLI**: `pnpm test:performance`

### Description

Compares **plain Nuxt**, **i18n-micro**, and **`@nuxtjs/i18n`** under one shared dictionary profile via `untestutils/perf`.

Focus: build time, peak RSS, deployable **code vs translations (asset) vs total**, and load (Artillery).

### Methodology notes

* Metrics are **means of 3 consecutive runs per fixture** (not interleaved).
* **Artifact**: Nitro node-server `.output/server/index.mjs` after forced `nuxi build`; `nuxt-i18n-micro` is the **built module dist** (not `dev:prepare` jiti stub). See [performance-methodology.md](./performance-methodology.md).
* **Translations** = `bundle.asset` (locale JSON, `chunks/raw/`, matching locale chunks via `isTranslationFile`).
* **plain-nuxt** serves the same leaf volume as static JSON — I/O-heavy under load, not “i18n overhead”.
* Load profile `--load full`: warm 6s@6 + main 60s@60 uncapped (historical).
* Cool-downs `--cool strict` (see methodology doc).
* Each of the `runs` builds is **forced** (no warm-cache zeroing of build time).

### Runs

All metrics below are **means across 3 runs**.

***

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

* **Build Time**: 5.07 seconds
* **Bundle Size**: 8.02 MB (code: 1.22 MB, translations: 6.8 MB)
* **Output dirs**: public: 7 MB, server: 1.02 MB
* **Max / Avg CPU**: 223.67% / 156.41%
* **Max / Avg Memory**: 859.04 MB / 511.15 MB

## Build Performance for test/fixtures/i18n

* **Build Time**: 8.23 seconds
* **Bundle Size**: 9.1 MB (code: 1.9 MB, translations: 7.21 MB)
* **Output dirs**: public: 321.25 KB, server: 8.79 MB
* **Max / Avg CPU**: 224.77% / 138.37%
* **Max / Avg Memory**: 1292.36 MB / 646.81 MB

## Build Performance for test/fixtures/i18n-micro

* **Build Time**: 5.01 seconds
* **Bundle Size**: 8.23 MB (code: 1.44 MB, translations: 6.8 MB)
* **Output dirs**: public: 7.07 MB, server: 1.16 MB
* **Max / Avg CPU**: 224.63% / 164.36%
* **Max / Avg Memory**: 996.84 MB / 544.70 MB

## Build Performance Summary (mean of 3 runs)

| Project | Build Time | Code Bundle | Translations | Total |
|---------|------------|-------------|--------------|-------|
| **plain-nuxt (baseline)** | 5.07s | 1.22 MB | 6.8 MB | 8.02 MB |
| **i18n-v10** | 8.23s | 1.9 MB | 7.21 MB | 9.1 MB |
| **i18n-micro** | 5.01s | 1.44 MB | 6.8 MB | 8.23 MB |

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

* **Max / Avg CPU**: 144.20% / 118.88%
* **Max / Avg Memory**: 523.61 MB / 404.14 MB

### Artillery

* **Duration**: 87.63s · **RPS**: 101.67 · **Error rate**: 0.00%
* **Latency avg / p50 / p95 / p99**: 2087.03 / 728.00 / 14143.10 / 15325.17 ms

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

* **Max / Avg CPU**: 134.77% / 93.36%
* **Max / Avg Memory**: 505.81 MB / 387.60 MB

### Artillery

* **Duration**: 82.81s · **RPS**: 126.33 · **Error rate**: 0.00%
* **Latency avg / p50 / p95 / p99**: 1268.13 / 138.07 / 9742.03 / 13547.20 ms

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

* **Max / Avg CPU**: 131.83% / 98.26%
* **Max / Avg Memory**: 359.15 MB / 276.11 MB

### Artillery

* **Duration**: 74.95s · **RPS**: 229.67 · **Error rate**: 0.00%
* **Latency avg / p50 / p95 / p99**: 583.27 / 99.30 / 4122.67 / 5259.10 ms

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
| **plain-nuxt** | 2087.03 ms | 728.00 ms | 14143.10 ms | 15325.17 ms | 101.67 | 0.00% |
| **i18n-v10** | 1268.13 ms | 138.07 ms | 9742.03 ms | 13547.20 ms | 126.33 | 0.00% |
| **i18n-micro** | 583.27 ms | 99.30 ms | 4122.67 ms | 5259.10 ms | 229.67 | 0.00% |

## Performance Comparison

### Throughput (Requests per Second)

> **Winner: i18n-micro** with 230 RPS

```chart
url: /charts/comparison-rps-artillery.js
height: 350px
```

### Latency Distribution

> **Winner: i18n-micro** with 583.27 ms avg latency

```chart
url: /charts/comparison-latency.js
height: 350px
```

### Quick Comparison

| Metric | **plain-nuxt** | **i18n-v10** | **i18n-micro** | Best |
|--------|---|---|---|------|
| RPS (Artillery) | 102 | 126 | 230 | i18n-micro |
| Avg Latency | 2087.03 ms | 1268.13 ms | 583.27 ms | i18n-micro |
| P99 Latency | 15325.17 ms | 13547.20 ms | 5259.10 ms | i18n-micro |
| Error rate | 0.00% | 0.00% | 0.00% | - |

## Comparison: plain-nuxt (baseline) vs i18n v10

| Metric | plain-nuxt (baseline) | i18n v10 | Difference |
|--------|----------|----------|------------|
| Max Memory | 523.61 MB | 505.81 MB | -17.80 MB |
| Avg Memory | 404.14 MB | 387.60 MB | -16.55 MB |
| Response Avg | 2087.03 ms | 1268.13 ms | -818.90 ms |
| Response P95 | 14143.10 ms | 9742.03 ms | -4401.07 ms |
| RPS (Artillery) | 101.67 | 126.33 | +24.67  |
| Error rate | 0.00% | 0.00% | 0.00 % |

## Comparison: plain-nuxt (baseline) vs i18n-micro

| Metric | plain-nuxt (baseline) | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 523.61 MB | 359.15 MB | -164.46 MB |
| Avg Memory | 404.14 MB | 276.11 MB | -128.03 MB |
| Response Avg | 2087.03 ms | 583.27 ms | -1503.77 ms |
| Response P95 | 14143.10 ms | 4122.67 ms | -10020.43 ms |
| RPS (Artillery) | 101.67 | 229.67 | +128.00  |
| Error rate | 0.00% | 0.00% | 0.00 % |

## Comparison: i18n v10 vs i18n-micro

| Metric | i18n v10 | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 505.81 MB | 359.15 MB | -146.66 MB |
| Avg Memory | 387.60 MB | 276.11 MB | -111.48 MB |
| Response Avg | 1268.13 ms | 583.27 ms | -684.87 ms |
| Response P95 | 9742.03 ms | 4122.67 ms | -5619.37 ms |
| RPS (Artillery) | 126.33 | 229.67 | +103.33  |
| Error rate | 0.00% | 0.00% | 0.00 % |

## Notes

* Shared profile: 4 locales × 2 pages × ~16.8k index leaves.
* Load: programmatic Artillery only — warm **6s@6** + main **60s@60**, uncapped VU (historical YAML methodology). Paths from runtime profile — see `scripts/src/perf/load.ts`.
* Cool-downs: 2s post-build, 3s between runs, 5s between fixtures. Builds are forced each run so means are not diluted by cache hits.
* Re-run day-to-day: `pnpm test:performance` (`--load short --cool fast`).
* Regenerate this page: `pnpm -C scripts cli performance --load full --only all --runs 3`.
* Flags: `--locales N --keys K --only all|micro|i18n|plain --runs N --skip-load --cool fast|strict`.
