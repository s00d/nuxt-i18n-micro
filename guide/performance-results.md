---
url: 'https://s00d.github.io/nuxt-i18n-micro/guide/performance-results.md'
description: Benchmarks vs nuxt-i18n on real fixtures.
---

# Performance Test Results

## Project Information

* **[plain-nuxt](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/plain-nuxt)**: ./test/fixtures/plain-nuxt
* **[i18n-micro](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n-micro)**: ./test/fixtures/i18n-micro
* **[i18n](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n)**: ./test/fixtures/i18n
* **[CLI](https://github.com/s00d/nuxt-i18n-micro/tree/main/scripts/src/commands/performance.ts)**: `pnpm -C scripts cli performance` / `pnpm test:performance`

### Description

Compares **plain Nuxt** (baseline without an i18n module), **i18n-micro**, and **`@nuxtjs/i18n` v10.6** under one shared dictionary profile.

Focus: build time, peak RSS, deployable **code vs translations vs total**, and server behaviour under Artillery + Autocannon.

### Methodology notes

* Metrics are **means of 3 consecutive runs per fixture** (fixture A ×3, then B ×3, then C ×3 — not interleaved).
* **Translations** include locale JSON under `locales/` / `_locales/` / `translations/`, everything under `chunks/raw/`, and matching locale chunks. Older reports that showed `@nuxtjs/i18n` “translations: 0 B” and a huge “code” column were counting message chunks as app code.
* **plain-nuxt** serves the same leaf volume as static `public/translations` JSON (not static JS imports). Under Artillery that baseline is I/O-heavy; it is not “i18n overhead”, it is the cost of fetching large JSON per request.

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
| node | v22.22.1 |
| nuxt | 4.5.1 |
| nuxt-i18n-micro | 3.25.0 |
| @nuxtjs/i18n | 10.6.0 |

## Source dictionaries (pre-build)

| Fixture | On-disk locale data |
|---------|---------------------|
| **plain-nuxt** | 98.42 MB |
| **i18n-v10** | 6.8 MB |
| **i18n-micro** | 6.8 MB |

> From `runtime.json` (4 locales, 16,807 index leaf keys).

## Build Performance for test/fixtures/plain-nuxt

* **Build Time**: 5.32 seconds
* **Bundle Size**: 8.33 MB (code: 1.53 MB, translations: 6.8 MB)
* **Code Bundle**: client: 201.88 KB, server: 1.33 MB
* **Max / Avg CPU**: 207.10% / 166.29%
* **Max / Avg Memory**: 810.26 MB / 585.14 MB

## Build Performance for test/fixtures/i18n

* **Build Time**: 8.34 seconds
* **Bundle Size**: 9.37 MB (code: 2.16 MB, translations: 7.21 MB)
* **Code Bundle**: client: 315.17 KB, server: 1.86 MB
* **Max / Avg CPU**: 203.97% / 164.39%
* **Max / Avg Memory**: 1820.57 MB / 1177.11 MB

## Build Performance for test/fixtures/i18n-micro

* **Build Time**: 5.34 seconds
* **Bundle Size**: 8.54 MB (code: 1.74 MB, translations: 6.8 MB)
* **Code Bundle**: client: 272.93 KB, server: 1.48 MB
* **Max / Avg CPU**: 203.60% / 177.27%
* **Max / Avg Memory**: 1065.16 MB / 667.77 MB

## Build Performance Summary (mean of 3 runs)

| Project | Build Time | Code Bundle | Translations | Total |
|---------|------------|-------------|--------------|-------|
| **plain-nuxt** (baseline) | 5.32s | 1.53 MB | 6.8 MB | 8.33 MB |
| **i18n-v10** | 8.34s | 2.16 MB | 7.21 MB | 9.37 MB |
| **i18n-micro** | 5.34s | 1.74 MB | 6.8 MB | 8.54 MB |

> “Total” = what gets deployed (code + translations). Micro keeps translations as lazy JSON; `@nuxtjs/i18n` still ships a larger code graph even after message chunks are classified correctly.

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

## Stress Test Results for plain-nuxt

### Resource Usage

* **Max / Avg CPU**: 132.80% / 86.34%
* **Max / Avg Memory**: 506.66 MB / 332.97 MB

### Artillery

* **Duration**: 79.64s · **RPS**: 109.00 · **Error rate**: 0.00%
* **Latency avg / p50 / p95 / p99**: 1193.80 / 604.00 / 6440.57 / 7658.90 ms

### Autocannon (10c / 10s)

* **RPS**: 65.30 · **Latency avg / p50 / p95 / p99**: 151.64 / 150.00 / 178.67 / 191.33 ms · **Errors**: 0

```chart
url: /charts/plain-nuxt-traffic.js
height: 400px
```

```chart
url: /charts/plain-nuxt-latency.js
height: 300px
```

## Stress Test Results for i18n-v10

### Resource Usage

* **Max / Avg CPU**: 128.90% / 81.95%
* **Max / Avg Memory**: 462.53 MB / 335.30 MB

### Artillery

* **Duration**: 79.28s · **RPS**: 142.67 · **Error rate**: 0.00%
* **Latency avg / p50 / p95 / p99**: 955.83 / 125.20 / 7709.80 / 7865.60 ms

### Autocannon (10c / 10s)

* **RPS**: 71.60 · **Latency avg / p50 / p95 / p99**: 138.80 / 117.33 / 291.67 / 332.33 ms · **Errors**: 0

```chart
url: /charts/i18n-v10-traffic.js
height: 400px
```

```chart
url: /charts/i18n-v10-latency.js
height: 300px
```

## Stress Test Results for i18n-micro

### Resource Usage

* **Max / Avg CPU**: 126.17% / 78.28%
* **Max / Avg Memory**: 302.30 MB / 229.25 MB

### Artillery

* **Duration**: 73.10s · **RPS**: 275.33 · **Error rate**: 0.00%
* **Latency avg / p50 / p95 / p99**: 483.43 / 53.37 / 3777.97 / 4203.20 ms

### Autocannon (10c / 10s)

* **RPS**: 161.67 · **Latency avg / p50 / p95 / p99**: 62.04 / 49.67 / 131.00 / 217.67 ms · **Errors**: 0

```chart
url: /charts/i18n-micro-traffic.js
height: 400px
```

```chart
url: /charts/i18n-micro-latency.js
height: 300px
```

## Stress Test Summary (mean of 3 runs)

### Artillery

| Project | Avg Response | P95 | P99 | RPS | Error Rate |
|---------|--------------|-----|-----|-----|------------|
| **plain-nuxt** | 1193.80 ms | 6440.57 ms | 7658.90 ms | 109.00 | 0.00% |
| **i18n-v10** | 955.83 ms | 7709.80 ms | 7865.60 ms | 142.67 | 0.00% |
| **i18n-micro** | 483.43 ms | 3777.97 ms | 4203.20 ms | 275.33 | 0.00% |

### Autocannon

| Project | Avg Latency | P50 | P95 | P99 | RPS |
|---------|-------------|-----|-----|-----|-----|
| **plain-nuxt** | 151.64 ms | 150.00 ms | 178.67 ms | 191.33 ms | 65.30 |
| **i18n-v10** | 138.80 ms | 117.33 ms | 291.67 ms | 332.33 ms | 71.60 |
| **i18n-micro** | 62.04 ms | 49.67 ms | 131.00 ms | 217.67 ms | 161.67 |

## Performance Comparison

### Throughput (Requests per Second)

> **Winner: i18n-micro** with 162 RPS

```chart
url: /charts/comparison-rps-autocannon.js
height: 350px
```

```chart
url: /charts/comparison-rps-artillery.js
height: 350px
```

### Latency Distribution

> **Winner: i18n-micro** with 62.04 ms avg latency

```chart
url: /charts/comparison-latency.js
height: 350px
```

### Quick Comparison

| Metric | **plain-nuxt** | **i18n-v10** | **i18n-micro** | Best |
|--------|---|---|---|------|
| RPS (Autocannon) | 65 | 72 | 162 | i18n-micro |
| Avg Latency | 151.64 ms | 138.80 ms | 62.04 ms | i18n-micro |
| P99 Latency | 191.33 ms | 332.33 ms | 217.67 ms | plain-nuxt |
| Errors | 0 | 0 | 0 | - |

## Comparison: plain-nuxt (baseline) vs i18n v10

| Metric | plain-nuxt (baseline) | i18n v10 | Difference |
|--------|----------|----------|------------|
| Max Memory | 506.66 MB | 462.53 MB | -44.13 MB |
| Avg Memory | 332.97 MB | 335.30 MB | +2.33 MB |
| Response Avg | 1193.80 ms | 955.83 ms | -237.97 ms |
| Response P95 | 6440.57 ms | 7709.80 ms | +1269.23 ms |
| RPS (Artillery) | 109.00 | 142.67 | +33.67  |
| RPS (Autocannon) | 65.30 | 71.60 | +6.30  |
| Latency avg (AC) | 151.64 ms | 138.80 ms | -12.84 ms |

## Comparison: plain-nuxt (baseline) vs i18n-micro

| Metric | plain-nuxt (baseline) | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 506.66 MB | 302.30 MB | -204.36 MB |
| Avg Memory | 332.97 MB | 229.25 MB | -103.72 MB |
| Response Avg | 1193.80 ms | 483.43 ms | -710.37 ms |
| Response P95 | 6440.57 ms | 3777.97 ms | -2662.60 ms |
| RPS (Artillery) | 109.00 | 275.33 | +166.33  |
| RPS (Autocannon) | 65.30 | 161.67 | +96.37  |
| Latency avg (AC) | 151.64 ms | 62.04 ms | -89.60 ms |

## Comparison: i18n v10 vs i18n-micro

| Metric | i18n v10 | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 462.53 MB | 302.30 MB | -160.23 MB |
| Avg Memory | 335.30 MB | 229.25 MB | -106.05 MB |
| Response Avg | 955.83 ms | 483.43 ms | -472.40 ms |
| Response P95 | 7709.80 ms | 3777.97 ms | -3931.83 ms |
| RPS (Artillery) | 142.67 | 275.33 | +132.67  |
| RPS (Autocannon) | 71.60 | 161.67 | +90.07  |
| Latency avg (AC) | 138.80 ms | 62.04 ms | -76.76 ms |

## Notes

* Shared profile: 4 locales × 2 pages × ~16.8k index leaves.
* Artillery: 6s warm-up @6 VU/s + 60s main @60 VU/s. Autocannon: 10 connections × 10s.
* Re-run: `pnpm test:performance` or `pnpm -C scripts cli performance --locales N --keys K --only all|micro|i18n|plain --runs N`.
