# Performance Test Results

## Project Information

- **plain-nuxt**: ./scripts/perf-fixtures/plain-nuxt
- **i18n-micro**: ./scripts/perf-fixtures/i18n-micro
- **i18n**: ./scripts/perf-fixtures/i18n
- **CLI**: `pnpm test:performance`

### Description

Compares **plain Nuxt**, **i18n-micro**, and **@nuxtjs/i18n** under one shared dictionary profile via `untestutils/perf`.

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

<table>
<thead>
  <tr>
    <th>
      Knob
    </th>
    
    <th>
      Value
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Locales
    </td>
    
    <td>
      <strong>
        4
      </strong>
      
       (<code>
        en
      </code>
      
      , <code>
        de
      </code>
      
      , <code>
        ru
      </code>
      
      , <code>
        fr
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      Pages
    </td>
    
    <td>
      <strong>
        2
      </strong>
      
       (<code>
        index
      </code>
      
      , <code>
        page
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      Index tree
    </td>
    
    <td>
      depth <strong>
        5
      </strong>
      
      , branch <strong>
        7
      </strong>
      
       → <strong>
        16,807
      </strong>
      
       leaf keys / locale
    </td>
  </tr>
  
  <tr>
    <td>
      Secondary pages
    </td>
    
    <td>
      depth <strong>
        5
      </strong>
      
      , branch <strong>
        6
      </strong>
      
       → <strong>
        7,776
      </strong>
      
       leaf keys / page / locale
    </td>
  </tr>
  
  <tr>
    <td>
      Goal
    </td>
    
    <td>
      Default CLI profile (<code>
        --locales 4 --keys 10000
      </code>
      
      ); raise knobs for regression-radar loads
    </td>
  </tr>
</tbody>
</table>

Dictionaries come from `scripts/perf-fixtures/perf-shared/runtime.json` (written by the CLI) so all three fixtures stay aligned.

## Dependency Versions

<table>
<thead>
  <tr>
    <th>
      Dependency
    </th>
    
    <th>
      Version
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      node
    </td>
    
    <td>
      v22.23.4
    </td>
  </tr>
  
  <tr>
    <td>
      nuxt
    </td>
    
    <td>
      4.6.4
    </td>
  </tr>
  
  <tr>
    <td>
      nuxt-i18n-micro
    </td>
    
    <td>
      4.0.0
    </td>
  </tr>
  
  <tr>
    <td>
      @nuxtjs/i18n
    </td>
    
    <td>
      10.6.0
    </td>
  </tr>
</tbody>
</table>

## Source dictionaries (pre-build)

<table>
<thead>
  <tr>
    <th>
      Fixture
    </th>
    
    <th>
      On-disk locale data
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <strong>
        plain-nuxt
      </strong>
    </td>
    
    <td>
      8.25 MB
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        i18n-v10
      </strong>
    </td>
    
    <td>
      6.8 MB
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        i18n-micro
      </strong>
    </td>
    
    <td>
      6.8 MB
    </td>
  </tr>
</tbody>
</table>

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

<table>
<thead>
  <tr>
    <th>
      Project
    </th>
    
    <th>
      Build Time
    </th>
    
    <th>
      Code Bundle
    </th>
    
    <th>
      Translations
    </th>
    
    <th>
      Total
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <strong>
        plain-nuxt (baseline)
      </strong>
    </td>
    
    <td>
      5.92s
    </td>
    
    <td>
      1.11 MB
    </td>
    
    <td>
      6.8 MB
    </td>
    
    <td>
      7.91 MB
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        i18n-v10
      </strong>
    </td>
    
    <td>
      6.18s
    </td>
    
    <td>
      1.75 MB
    </td>
    
    <td>
      7.21 MB
    </td>
    
    <td>
      8.96 MB
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        i18n-micro
      </strong>
    </td>
    
    <td>
      4.74s
    </td>
    
    <td>
      1.29 MB
    </td>
    
    <td>
      6.8 MB
    </td>
    
    <td>
      8.09 MB
    </td>
  </tr>
</tbody>
</table>

> “Total” = code + translations (`bundle.asset`). Translations include `locales/`, `_locales/`, `chunks/raw/`, and matching locale chunks.

<docs-chart url="/charts/build-time-comparison.js">



</docs-chart>

<docs-chart url="/charts/bundle-size-comparison.js">



</docs-chart>

<docs-chart url="/charts/translations-size-comparison.js">



</docs-chart>

<docs-chart url="/charts/total-bundle-comparison.js">



</docs-chart>

## Load Results for plain-nuxt

### Resource Usage

- **Max / Avg CPU**: 142.00% / 118.34%
- **Max / Avg Memory**: 498.61 MB / 402.79 MB

### Artillery

- **Duration**: 86.17s · **RPS**: 114.67 · **Error rate**: 0.00%
- **Latency avg / p50 / p95 / p99**: 1744.23 / 608.33 / 11585.40 / 12474.77 ms

<docs-chart url="/charts/plain-nuxt-traffic.js">



</docs-chart>

<docs-chart url="/charts/plain-nuxt-latency.js">



</docs-chart>

## Load Results for i18n-v10

### Resource Usage

- **Max / Avg CPU**: 134.43% / 104.91%
- **Max / Avg Memory**: 482.12 MB / 369.27 MB

### Artillery

- **Duration**: 77.07s · **RPS**: 178.00 · **Error rate**: 0.00%
- **Latency avg / p50 / p95 / p99**: 757.87 / 86.87 / 6074.27 / 6428.17 ms

<docs-chart url="/charts/i18n-v10-traffic.js">



</docs-chart>

<docs-chart url="/charts/i18n-v10-latency.js">



</docs-chart>

## Load Results for i18n-micro

### Resource Usage

- **Max / Avg CPU**: 137.13% / 98.79%
- **Max / Avg Memory**: 407.34 MB / 327.15 MB

### Artillery

- **Duration**: 66.13s · **RPS**: 414.67 · **Error rate**: 0.00%
- **Latency avg / p50 / p95 / p99**: 41.17 / 28.60 / 101.87 / 237.73 ms

<docs-chart url="/charts/i18n-micro-traffic.js">



</docs-chart>

<docs-chart url="/charts/i18n-micro-latency.js">



</docs-chart>

## Load Summary (mean of 3 runs)

### Artillery

<table>
<thead>
  <tr>
    <th>
      Project
    </th>
    
    <th>
      Avg Response
    </th>
    
    <th>
      P50
    </th>
    
    <th>
      P95
    </th>
    
    <th>
      P99
    </th>
    
    <th>
      RPS
    </th>
    
    <th>
      Error Rate
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <strong>
        plain-nuxt
      </strong>
    </td>
    
    <td>
      1744.23 ms
    </td>
    
    <td>
      608.33 ms
    </td>
    
    <td>
      11585.40 ms
    </td>
    
    <td>
      12474.77 ms
    </td>
    
    <td>
      114.67
    </td>
    
    <td>
      0.00%
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        i18n-v10
      </strong>
    </td>
    
    <td>
      757.87 ms
    </td>
    
    <td>
      86.87 ms
    </td>
    
    <td>
      6074.27 ms
    </td>
    
    <td>
      6428.17 ms
    </td>
    
    <td>
      178.00
    </td>
    
    <td>
      0.00%
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        i18n-micro
      </strong>
    </td>
    
    <td>
      41.17 ms
    </td>
    
    <td>
      28.60 ms
    </td>
    
    <td>
      101.87 ms
    </td>
    
    <td>
      237.73 ms
    </td>
    
    <td>
      414.67
    </td>
    
    <td>
      0.00%
    </td>
  </tr>
</tbody>
</table>

## Performance Comparison

### Throughput (Requests per Second)

> **Winner: i18n-micro** with 415 RPS

<docs-chart url="/charts/comparison-rps-artillery.js">



</docs-chart>

### Latency Distribution

> **Winner: i18n-micro** with 41.17 ms avg latency

<docs-chart url="/charts/comparison-latency.js">



</docs-chart>

### Quick Comparison

<table>
<thead>
  <tr>
    <th>
      Metric
    </th>
    
    <th>
      <strong>
        plain-nuxt
      </strong>
    </th>
    
    <th>
      <strong>
        i18n-v10
      </strong>
    </th>
    
    <th>
      <strong>
        i18n-micro
      </strong>
    </th>
    
    <th>
      Best
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      RPS (Artillery)
    </td>
    
    <td>
      115
    </td>
    
    <td>
      178
    </td>
    
    <td>
      415
    </td>
    
    <td>
      i18n-micro
    </td>
  </tr>
  
  <tr>
    <td>
      Avg Latency
    </td>
    
    <td>
      1744.23 ms
    </td>
    
    <td>
      757.87 ms
    </td>
    
    <td>
      41.17 ms
    </td>
    
    <td>
      i18n-micro
    </td>
  </tr>
  
  <tr>
    <td>
      P99 Latency
    </td>
    
    <td>
      12474.77 ms
    </td>
    
    <td>
      6428.17 ms
    </td>
    
    <td>
      237.73 ms
    </td>
    
    <td>
      i18n-micro
    </td>
  </tr>
  
  <tr>
    <td>
      Error rate
    </td>
    
    <td>
      0.00%
    </td>
    
    <td>
      0.00%
    </td>
    
    <td>
      0.00%
    </td>
    
    <td>
      -
    </td>
  </tr>
</tbody>
</table>

## Comparison: plain-nuxt (baseline) vs i18n v10

<table>
<thead>
  <tr>
    <th>
      Metric
    </th>
    
    <th>
      plain-nuxt (baseline)
    </th>
    
    <th>
      i18n v10
    </th>
    
    <th>
      Difference
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Max Memory
    </td>
    
    <td>
      498.61 MB
    </td>
    
    <td>
      482.12 MB
    </td>
    
    <td>
      -16.49 MB
    </td>
  </tr>
  
  <tr>
    <td>
      Avg Memory
    </td>
    
    <td>
      402.79 MB
    </td>
    
    <td>
      369.27 MB
    </td>
    
    <td>
      -33.52 MB
    </td>
  </tr>
  
  <tr>
    <td>
      Response Avg
    </td>
    
    <td>
      1744.23 ms
    </td>
    
    <td>
      757.87 ms
    </td>
    
    <td>
      -986.37 ms
    </td>
  </tr>
  
  <tr>
    <td>
      Response P95
    </td>
    
    <td>
      11585.40 ms
    </td>
    
    <td>
      6074.27 ms
    </td>
    
    <td>
      -5511.13 ms
    </td>
  </tr>
  
  <tr>
    <td>
      RPS (Artillery)
    </td>
    
    <td>
      114.67
    </td>
    
    <td>
      178.00
    </td>
    
    <td>
      +63.33
    </td>
  </tr>
  
  <tr>
    <td>
      Error rate
    </td>
    
    <td>
      0.00%
    </td>
    
    <td>
      0.00%
    </td>
    
    <td>
      0.00 %
    </td>
  </tr>
</tbody>
</table>

## Comparison: plain-nuxt (baseline) vs i18n-micro

<table>
<thead>
  <tr>
    <th>
      Metric
    </th>
    
    <th>
      plain-nuxt (baseline)
    </th>
    
    <th>
      i18n-micro
    </th>
    
    <th>
      Difference
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Max Memory
    </td>
    
    <td>
      498.61 MB
    </td>
    
    <td>
      407.34 MB
    </td>
    
    <td>
      -91.27 MB
    </td>
  </tr>
  
  <tr>
    <td>
      Avg Memory
    </td>
    
    <td>
      402.79 MB
    </td>
    
    <td>
      327.15 MB
    </td>
    
    <td>
      -75.64 MB
    </td>
  </tr>
  
  <tr>
    <td>
      Response Avg
    </td>
    
    <td>
      1744.23 ms
    </td>
    
    <td>
      41.17 ms
    </td>
    
    <td>
      -1703.07 ms
    </td>
  </tr>
  
  <tr>
    <td>
      Response P95
    </td>
    
    <td>
      11585.40 ms
    </td>
    
    <td>
      101.87 ms
    </td>
    
    <td>
      -11483.53 ms
    </td>
  </tr>
  
  <tr>
    <td>
      RPS (Artillery)
    </td>
    
    <td>
      114.67
    </td>
    
    <td>
      414.67
    </td>
    
    <td>
      +300.00
    </td>
  </tr>
  
  <tr>
    <td>
      Error rate
    </td>
    
    <td>
      0.00%
    </td>
    
    <td>
      0.00%
    </td>
    
    <td>
      0.00 %
    </td>
  </tr>
</tbody>
</table>

## Comparison: i18n v10 vs i18n-micro

<table>
<thead>
  <tr>
    <th>
      Metric
    </th>
    
    <th>
      i18n v10
    </th>
    
    <th>
      i18n-micro
    </th>
    
    <th>
      Difference
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Max Memory
    </td>
    
    <td>
      482.12 MB
    </td>
    
    <td>
      407.34 MB
    </td>
    
    <td>
      -74.78 MB
    </td>
  </tr>
  
  <tr>
    <td>
      Avg Memory
    </td>
    
    <td>
      369.27 MB
    </td>
    
    <td>
      327.15 MB
    </td>
    
    <td>
      -42.12 MB
    </td>
  </tr>
  
  <tr>
    <td>
      Response Avg
    </td>
    
    <td>
      757.87 ms
    </td>
    
    <td>
      41.17 ms
    </td>
    
    <td>
      -716.70 ms
    </td>
  </tr>
  
  <tr>
    <td>
      Response P95
    </td>
    
    <td>
      6074.27 ms
    </td>
    
    <td>
      101.87 ms
    </td>
    
    <td>
      -5972.40 ms
    </td>
  </tr>
  
  <tr>
    <td>
      RPS (Artillery)
    </td>
    
    <td>
      178.00
    </td>
    
    <td>
      414.67
    </td>
    
    <td>
      +236.67
    </td>
  </tr>
  
  <tr>
    <td>
      Error rate
    </td>
    
    <td>
      0.00%
    </td>
    
    <td>
      0.00%
    </td>
    
    <td>
      0.00 %
    </td>
  </tr>
</tbody>
</table>

## Notes

- Shared profile: 4 locales × 2 pages × ~16.8k index leaves.
- Load: programmatic Artillery only — warm **6s@6** + main **60s@60**, uncapped VU (historical YAML methodology). Paths from runtime profile — see `scripts/src/perf/load.ts`.
- Cool-downs: 2s post-build, 3s between runs, 5s between fixtures. Builds are forced each run so means are not diluted by cache hits.
- Re-run day-to-day: `pnpm test:performance` (`--load short --cool fast`).
- Regenerate this page: `pnpm -C scripts cli performance --load full --only all --runs 3`.
- Flags: `--locales N --keys K --only all|micro|i18n|plain --runs N --skip-load --cool fast|strict`.
