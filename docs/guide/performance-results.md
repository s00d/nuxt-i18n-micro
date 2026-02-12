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
| nuxt-i18n-micro                       | 3.6.0 |
| @nuxtjs/i18n                       | catalog: |
  
## Build Performance for ./test/fixtures/plain-nuxt

- **Build Time**: 5.82 seconds
- **Bundle Size**: 1.93 MB (code: 1.35 MB, translations: 589.99 KB)
- **Code Bundle**: client: 194.81 KB, server: 1.16 MB
- **Max CPU Usage**: 198.00%
- **Min CPU Usage**: 104.90%
- **Average CPU Usage**: 150.50%
- **Max Memory Usage**: 662.11 MB
- **Min Memory Usage**: 185.67 MB
- **Average Memory Usage**: 427.27 MB


## Build Performance for ./test/fixtures/i18n

- **Build Time**: 66.83 seconds
- **Bundle Size**: 57.3 MB (code: 19.24 MB, translations: 38.05 MB)
- **Code Bundle**: client: 17.13 MB, server: 2.11 MB
- **Max CPU Usage**: 576.10%
- **Min CPU Usage**: 11.90%
- **Average CPU Usage**: 156.98%
- **Max Memory Usage**: 8172.84 MB
- **Min Memory Usage**: 267.83 MB
- **Average Memory Usage**: 3701.14 MB


## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 7.28 seconds
- **Bundle Size**: 62.48 MB (code: 1.51 MB, translations: 60.97 MB)
- **Code Bundle**: client: 243.54 KB, server: 1.28 MB
- **Max CPU Usage**: 289.20%
- **Min CPU Usage**: 132.70%
- **Average CPU Usage**: 196.77%
- **Max Memory Usage**: 1643.45 MB
- **Min Memory Usage**: 212.05 MB
- **Average Memory Usage**: 759.63 MB


## Build Performance Summary

| Project | Build Time | Code Bundle | Translations | Total |
|---------|------------|-------------|--------------|-------|
| **plain-nuxt** (baseline) | 5.82s | 1.35 MB | 589.99 KB | 1.93 MB |
| **i18n v10** | 66.83s | 19.24 MB | 38.05 MB | 57.3 MB |
| **i18n-micro** | 7.28s | 1.51 MB | 60.97 MB | 62.48 MB |

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
- **i18n-micro vs baseline**: 164.48 KB larger
- **i18n-micro vs i18n v10**: 17.73 MB smaller


## Stress Test Results for plain-nuxt

### Resource Usage
- **Max CPU Usage**: 136.70%
- **Average CPU Usage**: 82.24%
- **Max Memory Usage**: 342.84 MB
- **Average Memory Usage**: 207.88 MB

### Artillery Results
- **Test Duration**: 72.95 seconds
- **Requests per Second**: 257.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 410.70 ms |
| Min | 0.00 ms |
| Max | 8608.00 ms |
| P50 | 34.80 ms |
| P95 | 2416.80 ms |
| P99 | 5711.50 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 187.00 |
| Latency avg | 52.92 ms |
| Latency P50 | 51.00 ms |
| Latency P95 | 66.00 ms |
| Latency P99 | 68.00 ms |
| Latency max | 217.00 ms |
| Throughput | 57.98 MB/s |
| Errors | 0 |


#### 📊 Load Summary - plain-nuxt

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **2,903** completed | **257** | **342** |
|:---:|:---:|:---:|:---:|
| vusers created | 79.84% / 20.16% failed | average req/s | peak req/s |

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
| Invalid Date | 228 req/s | 257 ms | 33 | 284 |
| Invalid Date | 342 req/s | 872 ms | 40 | 599 |
| Invalid Date | 342 req/s | 1526 ms | 40 | 600 |
| Invalid Date | 342 req/s | 2187 ms | 40 | 600 |
| Invalid Date | 244 req/s | 4147 ms | 211 | 596 |
| Invalid Date | 193 req/s | 3464 ms | 109 | 604 |
| Invalid Date | 140 req/s | 7710 ms | 0 | 353 |
| Invalid Date | 219 req/s | 5598 ms | 0 | 0 |


</details>


## Stress Test Results for i18n

### Resource Usage
- **Max CPU Usage**: 172.50%
- **Average CPU Usage**: 121.83%
- **Max Memory Usage**: 1153.92 MB
- **Average Memory Usage**: 600.58 MB

### Artillery Results
- **Test Duration**: 75.42 seconds
- **Requests per Second**: 52.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 1135.00 ms |
| Min | 15.00 ms |
| Max | 9585.00 ms |
| P50 | 645.60 ms |
| P95 | 4867.00 ms |
| P99 | 8692.80 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 12.00 |
| Latency avg | 805.58 ms |
| Latency P50 | 784.00 ms |
| Latency P95 | 1706.00 ms |
| Latency P99 | 2406.00 ms |
| Latency max | 2768.00 ms |
| Throughput | 3.8 MB/s |
| Errors | 0 |


#### 📊 Load Summary - i18n

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **50** completed | **52** | **75** |
|:---:|:---:|:---:|:---:|
| vusers created | 1.38% / 98.62% failed | average req/s | peak req/s |

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
| Invalid Date | 52 req/s | 2101 ms | 127 | 142 |
| Invalid Date | 75 req/s | 6838 ms | 366 | 600 |
| Invalid Date | 60 req/s | 327 ms | 2 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 600 |
| Invalid Date | 60 req/s | 0 ms | 1 | 600 |
| Invalid Date | 60 req/s | 0 ms | 1 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 494 |
| Invalid Date | 0 req/s | 0 ms | 0 | 0 |


</details>


## Stress Test Results for i18n-micro

### Resource Usage
- **Max CPU Usage**: 135.40%
- **Average CPU Usage**: 88.45%
- **Max Memory Usage**: 332.56 MB
- **Average Memory Usage**: 266.72 MB

### Artillery Results
- **Test Duration**: 69.33 seconds
- **Requests per Second**: 282.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 406.00 ms |
| Min | 1.00 ms |
| Max | 3508.00 ms |
| P50 | 37.00 ms |
| P95 | 2566.30 ms |
| P99 | 2618.10 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 178.20 |
| Latency avg | 55.61 ms |
| Latency P50 | 49.00 ms |
| Latency P95 | 101.00 ms |
| Latency P99 | 108.00 ms |
| Latency max | 274.00 ms |
| Throughput | 56.49 MB/s |
| Errors | 0 |


#### 📊 Load Summary - i18n-micro

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **3,208** completed | **282** | **314** |
|:---:|:---:|:---:|:---:|
| vusers created | 88.23% / 11.77% failed | average req/s | peak req/s |

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
| Invalid Date | 51 req/s | 10 ms | 0 | 21 |
| Invalid Date | 282 req/s | 925 ms | 89 | 486 |
| Invalid Date | 314 req/s | 2466 ms | 99 | 600 |
| Invalid Date | 290 req/s | 2618 ms | 93 | 600 |
| Invalid Date | 312 req/s | 2618 ms | 0 | 600 |
| Invalid Date | 314 req/s | 2618 ms | 0 | 600 |
| Invalid Date | 314 req/s | 2566 ms | 0 | 600 |
| Invalid Date | 288 req/s | 2566 ms | 0 | 129 |


</details>


## Stress Test Summary

### Artillery Results
| Project | Avg Response | P95 | P99 | RPS | Error Rate |
|---------|--------------|-----|-----|-----|------------|
| **plain-nuxt** | 410.70 ms | 2416.80 ms | 5711.50 ms | 257.00 | 0.00% |
| **i18n v10** | 1135.00 ms | 4867.00 ms | 8692.80 ms | 52.00 | 0.00% |
| **i18n-micro** | 406.00 ms | 2566.30 ms | 2618.10 ms | 282.00 | 0.00% |

### Autocannon Results (10 connections, 10s)
| Project | Avg Latency | P50 | P95 | P99 | Max | RPS |
|---------|-------------|-----|-----|-----|-----|-----|
| **plain-nuxt** | 52.92 ms | 51.00 ms | 66.00 ms | 68.00 ms | 217.00 ms | 187.00 |
| **i18n v10** | 805.58 ms | 784.00 ms | 1706.00 ms | 2406.00 ms | 2768.00 ms | 12.00 |
| **i18n-micro** | 55.61 ms | 49.00 ms | 101.00 ms | 108.00 ms | 274.00 ms | 178.20 |


## 🏆 Performance Comparison

### Throughput (Requests per Second)

> **Winner: plain-nuxt** with 187 RPS

```chart
url: /charts/comparison-rps-autocannon.js
height: 350px
```

```chart
url: /charts/comparison-rps-artillery.js
height: 350px
```

### Latency Distribution

> **Winner: plain-nuxt** with 52.92 ms avg latency

```chart
url: /charts/comparison-latency.js
height: 350px
```

### Quick Comparison

| Metric | **plain-nuxt** | **i18n-v10** | **i18n-micro** | Best |
|--------|---|---|---|------|
| RPS (Autocannon) | 187 | 12 | 178 | plain-nuxt |
| Avg Latency | 52.92 ms | 805.58 ms | 55.61 ms | plain-nuxt |
| P99 Latency | 68.00 ms | 2406.00 ms | 108.00 ms | plain-nuxt |
| Errors | 0 | 0 | 0 | - |



## Comparison: plain-nuxt (baseline) vs i18n v10

| Metric | plain-nuxt (baseline) | i18n v10 | Difference |
|--------|----------|----------|------------|
| Max Memory | 342.84 MB | 1153.92 MB | +811.08 MB |
| Avg Memory | 207.88 MB | 600.58 MB | +392.71 MB |
| Response Avg | 410.70 ms | 1135.00 ms | +724.30 ms |
| Response P95 | 2416.80 ms | 4867.00 ms | +2450.20 ms |
| Response P99 | 5711.50 ms | 8692.80 ms | +2981.30 ms |
| RPS (Artillery) | 257.00 | 52.00 | -205.00 |
| RPS (Autocannon) | 187.00 | 12.00 | -175.00 |
| Latency avg (Autocannon) | 52.92 ms | 805.58 ms | +752.66 ms |


## Comparison: plain-nuxt (baseline) vs i18n-micro

| Metric | plain-nuxt (baseline) | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 342.84 MB | 332.56 MB | -10.28 MB |
| Avg Memory | 207.88 MB | 266.72 MB | +58.85 MB |
| Response Avg | 410.70 ms | 406.00 ms | -4.70 ms |
| Response P95 | 2416.80 ms | 2566.30 ms | +149.50 ms |
| Response P99 | 5711.50 ms | 2618.10 ms | -3093.40 ms |
| RPS (Artillery) | 257.00 | 282.00 | +25.00 |
| RPS (Autocannon) | 187.00 | 178.20 | -8.80 |
| Latency avg (Autocannon) | 52.92 ms | 55.61 ms | +2.69 ms |


## Comparison: i18n v10 vs i18n-micro

| Metric | i18n v10 | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 1153.92 MB | 332.56 MB | -821.36 MB |
| Avg Memory | 600.58 MB | 266.72 MB | -333.86 MB |
| Response Avg | 1135.00 ms | 406.00 ms | -729.00 ms |
| Response P95 | 4867.00 ms | 2566.30 ms | -2300.70 ms |
| Response P99 | 8692.80 ms | 2618.10 ms | -6074.70 ms |
| RPS (Artillery) | 52.00 | 282.00 | +230.00 |
| RPS (Autocannon) | 12.00 | 178.20 | +166.20 |
| Latency avg (Autocannon) | 805.58 ms | 55.61 ms | -749.97 ms |


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
