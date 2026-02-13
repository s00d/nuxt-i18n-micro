---
outline: deep
---

# Performance Test Results

## Project Information

- **[plain-nuxt Path](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/plain-nuxt)**: ./test/fixtures/plain-nuxt
- **[i18n-micro Path](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n-micro)**: ./test/fixtures/i18n-micro
- **[i18n Path](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n)**: ./test/fixtures/i18n
- **[Test Script Location](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/performance.test.ts)**: ./test/performance.test.ts


### Description:
This performance test compares **plain Nuxt** (baseline without i18n), **i18n-micro**, and **i18n** (nuxtjs/i18n v10).
The **plain-nuxt** fixture serves as a baseline: it loads data directly from JSON files and displays the same content as i18n fixtures, but without any internationalization module.
The main focus is to evaluate build times, memory usage, CPU usage, and server performance under stress.
Results show the overhead introduced by each i18n solution compared to the baseline.

### Important Note:
The **i18n-micro** example simplifies the translation structure by consolidating translations. However, **i18n-micro** is optimized for per-page translations. The **plain-nuxt** baseline uses the same page structure and data volume for a fair comparison.

---

## Dependency Versions

| Dependency                   | Version   |
|-------------------------------|-----------|
| node                       | v20.19.6 |
| nuxt                       | N/A |
| nuxt-i18n-micro                       | 3.8.1 |
| @nuxtjs/i18n                       | catalog: |
  
## Build Performance for ./test/fixtures/plain-nuxt

- **Build Time**: 4.94 seconds
- **Bundle Size**: 1.93 MB (code: 1.35 MB, translations: 589.99 KB)
- **Code Bundle**: client: 194.81 KB, server: 1.16 MB
- **Max CPU Usage**: 207.90%
- **Min CPU Usage**: 122.40%
- **Average CPU Usage**: 176.72%
- **Max Memory Usage**: 602.06 MB
- **Min Memory Usage**: 212.14 MB
- **Average Memory Usage**: 424.93 MB


## Build Performance for ./test/fixtures/i18n

- **Build Time**: 74.90 seconds
- **Bundle Size**: 57.3 MB (code: 19.24 MB, translations: 38.05 MB)
- **Code Bundle**: client: 17.13 MB, server: 2.11 MB
- **Max CPU Usage**: 580.90%
- **Min CPU Usage**: 16.00%
- **Average CPU Usage**: 168.04%
- **Max Memory Usage**: 8500.34 MB
- **Min Memory Usage**: 285.08 MB
- **Average Memory Usage**: 4127.95 MB


## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 7.58 seconds
- **Bundle Size**: 57.26 MB (code: 1.5 MB, translations: 55.76 MB)
- **Code Bundle**: client: 240.43 KB, server: 1.27 MB
- **Max CPU Usage**: 201.60%
- **Min CPU Usage**: 121.60%
- **Average CPU Usage**: 179.39%
- **Max Memory Usage**: 1603.03 MB
- **Min Memory Usage**: 205.39 MB
- **Average Memory Usage**: 720.70 MB


## Build Performance Summary

| Project | Build Time | Code Bundle | Translations | Total |
|---------|------------|-------------|--------------|-------|
| **plain-nuxt** (baseline) | 4.94s | 1.35 MB | 589.99 KB | 1.93 MB |
| **i18n v10** | 74.90s | 19.24 MB | 38.05 MB | 57.3 MB |
| **i18n-micro** | 7.58s | 1.5 MB | 55.76 MB | 57.26 MB |

> **Note**: "Code Bundle" = JavaScript/CSS code. "Translations" = JSON translation files in locales directories.
> i18n-micro stores translations as lazy-loaded JSON files, while i18n v10 compiles them into JS bundles.

### Build Time Comparison

```chart
url: /charts/build-time-comparison.js
height: 350px
```

### Bundle Size Comparison (Code vs Translations)

```chart
url: /charts/bundle-size-comparison.js
height: 400px
```

**Code Bundle Comparison** (lower is better):
- **i18n v10 vs baseline**: 17.89 MB larger
- **i18n-micro vs baseline**: 153.24 KB larger
- **i18n-micro vs i18n v10**: 17.74 MB smaller


## Stress Test Results for plain-nuxt

### Resource Usage
- **Max CPU Usage**: 140.00%
- **Average CPU Usage**: 102.37%
- **Max Memory Usage**: 275.72 MB
- **Average Memory Usage**: 216.90 MB

### Artillery Results
- **Test Duration**: 68.63 seconds
- **Requests per Second**: 300.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 359.90 ms |
| Min | 0.00 ms |
| Max | 2458.00 ms |
| P50 | 36.20 ms |
| P95 | 2416.80 ms |
| P99 | 2416.80 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 179.00 |
| Latency avg | 55.31 ms |
| Latency P50 | 54.00 ms |
| Latency P95 | 67.00 ms |
| Latency P99 | 77.00 ms |
| Latency max | 156.00 ms |
| Throughput | 55.5 MB/s |
| Errors | 0 |


#### 📊 Load Summary - plain-nuxt

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **3,437** completed | **300** | **332** |
|:---:|:---:|:---:|:---:|
| vusers created | 94.53% / 5.47% failed | average req/s | peak req/s |

</div>

#### 📈 Traffic Profile Over Time

```chart
url: /charts/plain-nuxt-traffic.js
height: 400px
```

#### ⏱️ Response Time P95 Over Time

```chart
url: /charts/plain-nuxt-latency.js
height: 300px
```

<details>
<summary>📋 Detailed Time Series Data</summary>


| Time | Request Rate | Response P95 | VUsers Active | VUsers Created |
|------|--------------|--------------|---------------|----------------|
| Invalid Date | 42 req/s | 8 ms | 1 | 33 |
| Invalid Date | 327 req/s | 805 ms | 76 | 594 |
| Invalid Date | 327 req/s | 1864 ms | 63 | 600 |
| Invalid Date | 332 req/s | 2417 ms | 55 | 600 |
| Invalid Date | 329 req/s | 2417 ms | 12 | 600 |
| Invalid Date | 331 req/s | 2417 ms | 0 | 600 |
| Invalid Date | 331 req/s | 2417 ms | 0 | 600 |
| Invalid Date | 284 req/s | 2417 ms | 0 | 9 |


</details>


## Stress Test Results for i18n

### Resource Usage
- **Max CPU Usage**: 163.30%
- **Average CPU Usage**: 124.08%
- **Max Memory Usage**: 1055.30 MB
- **Average Memory Usage**: 739.59 MB

### Artillery Results
- **Test Duration**: 75.42 seconds
- **Requests per Second**: 53.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 1651.00 ms |
| Min | 14.00 ms |
| Max | 9996.00 ms |
| P50 | 608.00 ms |
| P95 | 9801.20 ms |
| P99 | 9999.20 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 12.80 |
| Latency avg | 757.74 ms |
| Latency P50 | 752.00 ms |
| Latency P95 | 1230.00 ms |
| Latency P99 | 1904.00 ms |
| Latency max | 2320.00 ms |
| Throughput | 4.05 MB/s |
| Errors | 0 |


#### 📊 Load Summary - i18n

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **57** completed | **53** | **75** |
|:---:|:---:|:---:|:---:|
| vusers created | 1.57% / 98.43% failed | average req/s | peak req/s |

</div>

#### 📈 Traffic Profile Over Time

```chart
url: /charts/i18n-traffic.js
height: 400px
```

#### ⏱️ Response Time P95 Over Time

```chart
url: /charts/i18n-latency.js
height: 300px
```

<details>
<summary>📋 Detailed Time Series Data</summary>


| Time | Request Rate | Response P95 | VUsers Active | VUsers Created |
|------|--------------|--------------|---------------|----------------|
| Invalid Date | 54 req/s | 2187 ms | 180 | 199 |
| Invalid Date | 75 req/s | 7261 ms | 295 | 600 |
| Invalid Date | 60 req/s | 0 ms | 26 | 600 |
| Invalid Date | 60 req/s | 9999 ms | 0 | 600 |
| Invalid Date | 61 req/s | 9999 ms | 0 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 437 |
| Invalid Date | 10 req/s | 9999 ms | 0 | 0 |


</details>


## Stress Test Results for i18n-micro

### Resource Usage
- **Max CPU Usage**: 129.20%
- **Average CPU Usage**: 89.09%
- **Max Memory Usage**: 357.14 MB
- **Average Memory Usage**: 292.60 MB

### Artillery Results
- **Test Duration**: 69.72 seconds
- **Requests per Second**: 275.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 427.60 ms |
| Min | 1.00 ms |
| Max | 2836.00 ms |
| P50 | 39.30 ms |
| P95 | 2725.00 ms |
| P99 | 2725.00 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 169.80 |
| Latency avg | 58.19 ms |
| Latency P50 | 51.00 ms |
| Latency P95 | 105.00 ms |
| Latency P99 | 110.00 ms |
| Latency max | 330.00 ms |
| Throughput | 53.83 MB/s |
| Errors | 0 |


#### 📊 Load Summary - i18n-micro

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **3,120** completed | **275** | **303** |
|:---:|:---:|:---:|:---:|
| vusers created | 85.81% / 14.19% failed | average req/s | peak req/s |

</div>

#### 📈 Traffic Profile Over Time

```chart
url: /charts/i18n-micro-traffic.js
height: 400px
```

#### ⏱️ Response Time P95 Over Time

```chart
url: /charts/i18n-micro-latency.js
height: 300px
```

<details>
<summary>📋 Detailed Time Series Data</summary>


| Time | Request Rate | Response P95 | VUsers Active | VUsers Created |
|------|--------------|--------------|---------------|----------------|
| Invalid Date | 45 req/s | 9 ms | 3 | 40 |
| Invalid Date | 300 req/s | 1437 ms | 129 | 596 |
| Invalid Date | 302 req/s | 2725 ms | 116 | 600 |
| Invalid Date | 299 req/s | 2725 ms | 4 | 600 |
| Invalid Date | 302 req/s | 2725 ms | 1 | 600 |
| Invalid Date | 299 req/s | 2780 ms | 5 | 600 |
| Invalid Date | 303 req/s | 2725 ms | 0 | 597 |
| Invalid Date | 257 req/s | 2671 ms | 0 | 3 |


</details>


## Stress Test Summary

### Artillery Results
| Project | Avg Response | P95 | P99 | RPS | Error Rate |
|---------|--------------|-----|-----|-----|------------|
| **plain-nuxt** | 359.90 ms | 2416.80 ms | 2416.80 ms | 300.00 | 0.00% |
| **i18n v10** | 1651.00 ms | 9801.20 ms | 9999.20 ms | 53.00 | 0.00% |
| **i18n-micro** | 427.60 ms | 2725.00 ms | 2725.00 ms | 275.00 | 0.00% |

### Autocannon Results (10 connections, 10s)
| Project | Avg Latency | P50 | P95 | P99 | Max | RPS |
|---------|-------------|-----|-----|-----|-----|-----|
| **plain-nuxt** | 55.31 ms | 54.00 ms | 67.00 ms | 77.00 ms | 156.00 ms | 179.00 |
| **i18n v10** | 757.74 ms | 752.00 ms | 1230.00 ms | 1904.00 ms | 2320.00 ms | 12.80 |
| **i18n-micro** | 58.19 ms | 51.00 ms | 105.00 ms | 110.00 ms | 330.00 ms | 169.80 |


## 🏆 Performance Comparison

### Throughput (Requests per Second)

> **Winner: plain-nuxt** with 179 RPS

```chart
url: /charts/comparison-rps-autocannon.js
height: 350px
```

```chart
url: /charts/comparison-rps-artillery.js
height: 350px
```

### Latency Distribution

> **Winner: plain-nuxt** with 55.31 ms avg latency

```chart
url: /charts/comparison-latency.js
height: 350px
```

### Quick Comparison

| Metric | **plain-nuxt** | **i18n-v10** | **i18n-micro** | Best |
|--------|---|---|---|------|
| RPS (Autocannon) | 179 | 13 | 170 | plain-nuxt |
| Avg Latency | 55.31 ms | 757.74 ms | 58.19 ms | plain-nuxt |
| P99 Latency | 77.00 ms | 1904.00 ms | 110.00 ms | plain-nuxt |
| Errors | 0 | 0 | 0 | - |



## Comparison: plain-nuxt (baseline) vs i18n v10

| Metric | plain-nuxt (baseline) | i18n v10 | Difference |
|--------|----------|----------|------------|
| Max Memory | 275.72 MB | 1055.30 MB | +779.58 MB |
| Avg Memory | 216.90 MB | 739.59 MB | +522.69 MB |
| Response Avg | 359.90 ms | 1651.00 ms | +1291.10 ms |
| Response P95 | 2416.80 ms | 9801.20 ms | +7384.40 ms |
| Response P99 | 2416.80 ms | 9999.20 ms | +7582.40 ms |
| RPS (Artillery) | 300.00 | 53.00 | -247.00 |
| RPS (Autocannon) | 179.00 | 12.80 | -166.20 |
| Latency avg (Autocannon) | 55.31 ms | 757.74 ms | +702.43 ms |


## Comparison: plain-nuxt (baseline) vs i18n-micro

| Metric | plain-nuxt (baseline) | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 275.72 MB | 357.14 MB | +81.42 MB |
| Avg Memory | 216.90 MB | 292.60 MB | +75.71 MB |
| Response Avg | 359.90 ms | 427.60 ms | +67.70 ms |
| Response P95 | 2416.80 ms | 2725.00 ms | +308.20 ms |
| Response P99 | 2416.80 ms | 2725.00 ms | +308.20 ms |
| RPS (Artillery) | 300.00 | 275.00 | -25.00 |
| RPS (Autocannon) | 179.00 | 169.80 | -9.20 |
| Latency avg (Autocannon) | 55.31 ms | 58.19 ms | +2.88 ms |


## Comparison: i18n v10 vs i18n-micro

| Metric | i18n v10 | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 1055.30 MB | 357.14 MB | -698.16 MB |
| Avg Memory | 739.59 MB | 292.60 MB | -446.99 MB |
| Response Avg | 1651.00 ms | 427.60 ms | -1223.40 ms |
| Response P95 | 9801.20 ms | 2725.00 ms | -7076.20 ms |
| Response P99 | 9999.20 ms | 2725.00 ms | -7274.20 ms |
| RPS (Artillery) | 53.00 | 275.00 | +222.00 |
| RPS (Autocannon) | 12.80 | 169.80 | +157.00 |
| Latency avg (Autocannon) | 757.74 ms | 58.19 ms | -699.55 ms |


## 📊 Detailed Performance Analysis

### 🔍 Test Logic Explanation

The performance tests compare **plain-nuxt** (baseline), **Nuxt I18n Micro**, and **nuxt-i18n** v10. The **plain-nuxt** fixture loads data directly from JSON files without any i18n module, providing a baseline for measuring i18n overhead.

1. **Build Time**: Measures the time required to build each project. Plain-nuxt shows the baseline; i18n modules add overhead for translation processing.
2. **Bundle Size**: Measures the total size of client and server bundles.
3. **CPU Usage**: Tracks CPU load during build and stress tests.
4. **Memory Usage**: Monitors memory consumption. Plain-nuxt establishes the baseline; i18n modules increase memory usage.
5. **Stress Testing**: Simulates concurrent traffic using Artillery and Autocannon.
   - **Artillery**: Warm-up phase (6 seconds, 6 users), Main phase (60 seconds, 60 req/s).
   - **Autocannon**: 10 connections for 10 seconds, measuring latency percentiles.

### 🛠 Why This Approach?

By including a **plain-nuxt** baseline, we can quantify the overhead of each i18n solution. **Nuxt I18n Micro** is optimized for:
- **Faster Build Times**: Lower overhead than nuxt-i18n.
- **Lower Resource Consumption**: Closer to plain-nuxt baseline.
- **Better Scalability**: Per-page translations for large applications.
