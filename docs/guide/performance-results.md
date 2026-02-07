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
| nuxt-i18n-micro                       | 3.4.0 |
| @nuxtjs/i18n                       | catalog: |
  
## Build Performance for ./test/fixtures/plain-nuxt

- **Build Time**: 5.02 seconds
- **Bundle Size**: 1.93 MB (code: 1.35 MB, translations: 589.99 KB)
- **Code Bundle**: client: 194.81 KB, server: 1.16 MB
- **Max CPU Usage**: 230.40%
- **Min CPU Usage**: 118.10%
- **Average CPU Usage**: 186.02%
- **Max Memory Usage**: 657.17 MB
- **Min Memory Usage**: 217.77 MB
- **Average Memory Usage**: 429.99 MB


## Build Performance for ./test/fixtures/i18n

- **Build Time**: 77.23 seconds
- **Bundle Size**: 57.3 MB (code: 19.24 MB, translations: 38.05 MB)
- **Code Bundle**: client: 17.13 MB, server: 2.11 MB
- **Max CPU Usage**: 375.80%
- **Min CPU Usage**: 19.60%
- **Average CPU Usage**: 167.46%
- **Max Memory Usage**: 8993.03 MB
- **Min Memory Usage**: 265.69 MB
- **Average Memory Usage**: 4373.44 MB


## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 7.68 seconds
- **Bundle Size**: 62.48 MB (code: 1.51 MB, translations: 60.97 MB)
- **Code Bundle**: client: 243.72 KB, server: 1.28 MB
- **Max CPU Usage**: 249.70%
- **Min CPU Usage**: 115.00%
- **Average CPU Usage**: 191.59%
- **Max Memory Usage**: 1444.33 MB
- **Min Memory Usage**: 219.02 MB
- **Average Memory Usage**: 698.04 MB


## Build Performance Summary

| Project | Build Time | Code Bundle | Translations | Total |
|---------|------------|-------------|--------------|-------|
| **plain-nuxt** (baseline) | 5.02s | 1.35 MB | 589.99 KB | 1.93 MB |
| **i18n v10** | 77.23s | 19.24 MB | 38.05 MB | 57.3 MB |
| **i18n-micro** | 7.68s | 1.51 MB | 60.97 MB | 62.48 MB |

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
- **i18n-micro vs baseline**: 164.23 KB larger
- **i18n-micro vs i18n v10**: 17.73 MB smaller


## Stress Test Results for plain-nuxt

### Resource Usage
- **Max CPU Usage**: 136.80%
- **Average CPU Usage**: 93.96%
- **Max Memory Usage**: 259.63 MB
- **Average Memory Usage**: 211.58 MB

### Artillery Results
- **Test Duration**: 68.26 seconds
- **Requests per Second**: 311.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 303.20 ms |
| Min | 0.00 ms |
| Max | 2346.00 ms |
| P50 | 34.10 ms |
| P95 | 2322.10 ms |
| P99 | 2322.10 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 183.90 |
| Latency avg | 53.70 ms |
| Latency P50 | 52.00 ms |
| Latency P95 | 63.00 ms |
| Latency P99 | 69.00 ms |
| Latency max | 164.00 ms |
| Throughput | 57.02 MB/s |
| Errors | 0 |


#### 📊 Load Summary - plain-nuxt

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **3,571** completed | **311** | **343** |
|:---:|:---:|:---:|:---:|
| vusers created | 98.21% / 1.79% failed | average req/s | peak req/s |

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
| Invalid Date | 66 req/s | 8 ms | 0 | 11 |
| Invalid Date | 273 req/s | 296 ms | 36 | 384 |
| Invalid Date | 342 req/s | 854 ms | 38 | 600 |
| Invalid Date | 342 req/s | 1526 ms | 39 | 600 |
| Invalid Date | 342 req/s | 2144 ms | 38 | 600 |
| Invalid Date | 343 req/s | 2322 ms | 33 | 600 |
| Invalid Date | 343 req/s | 2322 ms | 7 | 600 |
| Invalid Date | 321 req/s | 2322 ms | 0 | 241 |


</details>


## Stress Test Results for i18n

### Resource Usage
- **Max CPU Usage**: 167.70%
- **Average CPU Usage**: 124.57%
- **Max Memory Usage**: 1197.92 MB
- **Average Memory Usage**: 738.19 MB

### Artillery Results
- **Test Duration**: 75.42 seconds
- **Requests per Second**: 51.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 1131.10 ms |
| Min | 14.00 ms |
| Max | 9893.00 ms |
| P50 | 620.30 ms |
| P95 | 5168.00 ms |
| P99 | 8692.80 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 12.40 |
| Latency avg | 779.85 ms |
| Latency P50 | 769.00 ms |
| Latency P95 | 1424.00 ms |
| Latency P99 | 2195.00 ms |
| Latency max | 2550.00 ms |
| Throughput | 3.93 MB/s |
| Errors | 0 |


#### 📊 Load Summary - i18n

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **53** completed | **51** | **69** |
|:---:|:---:|:---:|:---:|
| vusers created | 1.46% / 98.54% failed | average req/s | peak req/s |

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
| Invalid Date | 25 req/s | 925 ms | 18 | 18 |
| Invalid Date | 69 req/s | 4317 ms | 438 | 472 |
| Invalid Date | 68 req/s | 8521 ms | 21 | 600 |
| Invalid Date | 60 req/s | 0 ms | 18 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 146 |
| Invalid Date | 0 req/s | 0 ms | 0 | 0 |


</details>


## Stress Test Results for i18n-micro

### Resource Usage
- **Max CPU Usage**: 131.90%
- **Average CPU Usage**: 91.73%
- **Max Memory Usage**: 354.14 MB
- **Average Memory Usage**: 290.90 MB

### Artillery Results
- **Test Duration**: 69.14 seconds
- **Requests per Second**: 300.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 391.80 ms |
| Min | 0.00 ms |
| Max | 2585.00 ms |
| P50 | 36.20 ms |
| P95 | 2566.30 ms |
| P99 | 2566.30 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 181.70 |
| Latency avg | 54.54 ms |
| Latency P50 | 48.00 ms |
| Latency P95 | 97.00 ms |
| Latency P99 | 102.00 ms |
| Latency max | 269.00 ms |
| Throughput | 57.59 MB/s |
| Errors | 0 |


#### 📊 Load Summary - i18n-micro

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **3,295** completed | **300** | **318** |
|:---:|:---:|:---:|:---:|
| vusers created | 90.62% / 9.38% failed | average req/s | peak req/s |

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
| Invalid Date | 219 req/s | 478 ms | 55 | 313 |
| Invalid Date | 316 req/s | 1864 ms | 94 | 600 |
| Invalid Date | 315 req/s | 2566 ms | 71 | 600 |
| Invalid Date | 316 req/s | 2566 ms | 15 | 600 |
| Invalid Date | 318 req/s | 2566 ms | 0 | 600 |
| Invalid Date | 318 req/s | 2516 ms | 0 | 600 |
| Invalid Date | 299 req/s | 2516 ms | 0 | 323 |


</details>


## Stress Test Summary

### Artillery Results
| Project | Avg Response | P95 | P99 | RPS | Error Rate |
|---------|--------------|-----|-----|-----|------------|
| **plain-nuxt** | 303.20 ms | 2322.10 ms | 2322.10 ms | 311.00 | 0.00% |
| **i18n v10** | 1131.10 ms | 5168.00 ms | 8692.80 ms | 51.00 | 0.00% |
| **i18n-micro** | 391.80 ms | 2566.30 ms | 2566.30 ms | 300.00 | 0.00% |

### Autocannon Results (10 connections, 10s)
| Project | Avg Latency | P50 | P95 | P99 | Max | RPS |
|---------|-------------|-----|-----|-----|-----|-----|
| **plain-nuxt** | 53.70 ms | 52.00 ms | 63.00 ms | 69.00 ms | 164.00 ms | 183.90 |
| **i18n v10** | 779.85 ms | 769.00 ms | 1424.00 ms | 2195.00 ms | 2550.00 ms | 12.40 |
| **i18n-micro** | 54.54 ms | 48.00 ms | 97.00 ms | 102.00 ms | 269.00 ms | 181.70 |


## 🏆 Performance Comparison

### Throughput (Requests per Second)

> **Winner: plain-nuxt** with 184 RPS

```chart
url: /charts/comparison-rps-autocannon.js
height: 350px
```

```chart
url: /charts/comparison-rps-artillery.js
height: 350px
```

### Latency Distribution

> **Winner: plain-nuxt** with 53.70 ms avg latency

```chart
url: /charts/comparison-latency.js
height: 350px
```

### Quick Comparison

| Metric | **plain-nuxt** | **i18n-v10** | **i18n-micro** | Best |
|--------|---|---|---|------|
| RPS (Autocannon) | 184 | 12 | 182 | plain-nuxt |
| Avg Latency | 53.70 ms | 779.85 ms | 54.54 ms | plain-nuxt |
| P99 Latency | 69.00 ms | 2195.00 ms | 102.00 ms | plain-nuxt |
| Errors | 0 | 0 | 0 | - |



## Comparison: plain-nuxt (baseline) vs i18n v10

| Metric | plain-nuxt (baseline) | i18n v10 | Difference |
|--------|----------|----------|------------|
| Max Memory | 259.63 MB | 1197.92 MB | +938.30 MB |
| Avg Memory | 211.58 MB | 738.19 MB | +526.61 MB |
| Response Avg | 303.20 ms | 1131.10 ms | +827.90 ms |
| Response P95 | 2322.10 ms | 5168.00 ms | +2845.90 ms |
| Response P99 | 2322.10 ms | 8692.80 ms | +6370.70 ms |
| RPS (Artillery) | 311.00 | 51.00 | -260.00 |
| RPS (Autocannon) | 183.90 | 12.40 | -171.50 |
| Latency avg (Autocannon) | 53.70 ms | 779.85 ms | +726.15 ms |


## Comparison: plain-nuxt (baseline) vs i18n-micro

| Metric | plain-nuxt (baseline) | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 259.63 MB | 354.14 MB | +94.52 MB |
| Avg Memory | 211.58 MB | 290.90 MB | +79.32 MB |
| Response Avg | 303.20 ms | 391.80 ms | +88.60 ms |
| Response P95 | 2322.10 ms | 2566.30 ms | +244.20 ms |
| Response P99 | 2322.10 ms | 2566.30 ms | +244.20 ms |
| RPS (Artillery) | 311.00 | 300.00 | -11.00 |
| RPS (Autocannon) | 183.90 | 181.70 | -2.20 |
| Latency avg (Autocannon) | 53.70 ms | 54.54 ms | +0.84 ms |


## Comparison: i18n v10 vs i18n-micro

| Metric | i18n v10 | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 1197.92 MB | 354.14 MB | -843.78 MB |
| Avg Memory | 738.19 MB | 290.90 MB | -447.29 MB |
| Response Avg | 1131.10 ms | 391.80 ms | -739.30 ms |
| Response P95 | 5168.00 ms | 2566.30 ms | -2601.70 ms |
| Response P99 | 8692.80 ms | 2566.30 ms | -6126.50 ms |
| RPS (Artillery) | 51.00 | 300.00 | +249.00 |
| RPS (Autocannon) | 12.40 | 181.70 | +169.30 |
| Latency avg (Autocannon) | 779.85 ms | 54.54 ms | -725.31 ms |


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
