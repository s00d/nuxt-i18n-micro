---
title: "Performance Test Results"
description: "Benchmarks vs nuxt-i18n on real fixtures."
outline: "deep"
---

# Performance Test Results

## Project Information

- **[plain-nuxt Path](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/plain-nuxt)**: ./test/fixtures/plain-nuxt
- **[i18n-micro Path](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n-micro)**: ./test/fixtures/i18n-micro
- **[i18n Path](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n)**: ./test/fixtures/i18n
- **[Test Script Location](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/performance.test.ts)**: ./test/performance.test.ts


### Description:
This performance test compares **plain Nuxt** (baseline without i18n), **i18n-micro**, and **i18n** (`@nuxtjs/i18n` **v10.6**).
The **plain-nuxt** fixture serves as a baseline: it loads data directly from JSON files and displays the same content as i18n fixtures, but without any internationalization module.
The main focus is to evaluate build times, memory usage, CPU usage, and server performance under stress.
Results show the overhead introduced by each i18n solution compared to the baseline.

### Important Note:
The **i18n-micro** example simplifies the translation structure by consolidating translations. However, **i18n-micro** is optimized for per-page translations. The **plain-nuxt** baseline uses the same page structure and data volume for a fair comparison.

---

## Dependency Versions

| Dependency                   | Version   |
|-------------------------------|-----------|
| node                       | v22.22.1 |
| nuxt                       | N/A |
| nuxt-i18n-micro                       | 3.22.2 |
| @nuxtjs/i18n                       | 10.6.0 |
  
## Build Performance for ./test/fixtures/plain-nuxt

- **Build Time**: 11.30 seconds
- **Bundle Size**: 1.77 MB (code: 1.19 MB, translations: 595.42 KB)
- **Code Bundle**: client: 207.67 KB, server: 1013.25 KB
- **Max CPU Usage**: 101.10%
- **Min CPU Usage**: 57.60%
- **Average CPU Usage**: 82.37%
- **Max Memory Usage**: 1097.86 MB
- **Min Memory Usage**: 125.75 MB
- **Average Memory Usage**: 532.48 MB


## Build Performance for ./test/fixtures/i18n

- **Build Time**: 15.75 seconds
- **Bundle Size**: 15.26 MB (code: 15.26 MB, translations: 0 B)
- **Code Bundle**: client: 318.41 KB, server: 14.95 MB
- **Max CPU Usage**: 195.10%
- **Min CPU Usage**: 65.90%
- **Average CPU Usage**: 109.34%
- **Max Memory Usage**: 2138.45 MB
- **Min Memory Usage**: 139.36 MB
- **Average Memory Usage**: 1075.71 MB


## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 7.72 seconds
- **Bundle Size**: 14.09 MB (code: 1.4 MB, translations: 12.69 MB)
- **Code Bundle**: client: 275.24 KB, server: 1.13 MB
- **Max CPU Usage**: 209.60%
- **Min CPU Usage**: 82.20%
- **Average CPU Usage**: 146.36%
- **Max Memory Usage**: 975.25 MB
- **Min Memory Usage**: 194.95 MB
- **Average Memory Usage**: 542.73 MB


## Build Performance Summary

| Project | Build Time | Code Bundle | Translations | Total |
|---------|------------|-------------|--------------|-------|
| **plain-nuxt** (baseline) | 11.30s | 1.19 MB | 595.42 KB | 1.77 MB |
| **i18n v10.6** | 15.75s | 15.26 MB | 0 B | 15.26 MB |
| **i18n-micro** | 7.72s | 1.4 MB | 12.69 MB | 14.09 MB |

> **Note**: "Code Bundle" = JavaScript/CSS code. "Translations" = JSON translation files in locales directories.
> i18n-micro stores translations as lazy-loaded JSON files, while i18n v10.6 compiles them into JS bundles.

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
- **i18n v10.6 vs baseline**: 14.07 MB larger
- **i18n-micro vs baseline**: 212.47 KB larger
- **i18n-micro vs i18n v10.6**: 13.86 MB smaller


## Stress Test Results for plain-nuxt

### Resource Usage
- **Max CPU Usage**: 131.10%
- **Average CPU Usage**: 84.89%
- **Max Memory Usage**: 369.09 MB
- **Average Memory Usage**: 280.56 MB

### Artillery Results
- **Test Duration**: 69.64 seconds
- **Requests per Second**: 273.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 430.40 ms |
| Min | 1.00 ms |
| Max | 3497.00 ms |
| P50 | 40.00 ms |
| P95 | 2725.00 ms |
| P99 | 2893.50 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 163.50 |
| Latency avg | 60.48 ms |
| Latency P50 | 58.00 ms |
| Latency P95 | 80.00 ms |
| Latency P99 | 83.00 ms |
| Latency max | 217.00 ms |
| Throughput | 50.75 MB/s |
| Errors | 0 |


#### 📊 Load Summary - plain-nuxt

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **3,120** completed | **273** | **313** |
|:---:|:---:|:---:|:---:|
| vusers created | 85.81% / 14.19% failed | average req/s | peak req/s |

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
| 11:43:00 PM | 63 req/s | 9 ms | 0 | 15 |
| 11:43:10 PM | 258 req/s | 837 ms | 88 | 432 |
| 11:43:20 PM | 281 req/s | 3012 ms | 162 | 600 |
| 11:43:30 PM | 298 req/s | 2894 ms | 10 | 600 |
| 11:43:40 PM | 313 req/s | 2618 ms | 0 | 600 |
| 11:43:50 PM | 302 req/s | 2725 ms | 25 | 600 |
| 11:44:00 PM | 305 req/s | 2780 ms | 0 | 600 |
| 11:44:10 PM | 276 req/s | 2671 ms | 0 | 189 |


</details>


## Stress Test Results for i18n

### Resource Usage
- **Max CPU Usage**: 121.50%
- **Average CPU Usage**: 82.02%
- **Max Memory Usage**: 520.95 MB
- **Average Memory Usage**: 374.22 MB

### Artillery Results
- **Test Duration**: 73.91 seconds
- **Requests per Second**: 195.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 708.90 ms |
| Min | 1.00 ms |
| Max | 5873.00 ms |
| P50 | 62.20 ms |
| P95 | 4231.10 ms |
| P99 | 5272.40 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 87.50 |
| Latency avg | 112.74 ms |
| Latency P50 | 100.00 ms |
| Latency P95 | 212.00 ms |
| Latency P99 | 238.00 ms |
| Latency max | 483.00 ms |
| Throughput | 27.76 MB/s |
| Errors | 0 |


#### 📊 Load Summary - i18n

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **2,100** completed | **195** | **218** |
|:---:|:---:|:---:|:---:|
| vusers created | 57.76% / 42.24% failed | average req/s | peak req/s |

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
| 11:44:50 PM | 153 req/s | 1176 ms | 133 | 287 |
| 11:45:00 PM | 214 req/s | 4317 ms | 249 | 601 |
| 11:45:10 PM | 216 req/s | 4231 ms | 0 | 599 |
| 11:45:20 PM | 209 req/s | 4231 ms | 25 | 600 |
| 11:45:30 PM | 198 req/s | 5598 ms | 0 | 600 |
| 11:45:40 PM | 218 req/s | 4147 ms | 0 | 600 |
| 11:45:50 PM | 195 req/s | 4231 ms | 0 | 349 |
| 11:46:00 PM | 159 req/s | 4231 ms | 0 | 0 |


</details>


## Stress Test Results for i18n-micro

### Resource Usage
- **Max CPU Usage**: 128.00%
- **Average CPU Usage**: 84.02%
- **Max Memory Usage**: 638.17 MB
- **Average Memory Usage**: 507.27 MB

### Artillery Results
- **Test Duration**: 68.83 seconds
- **Requests per Second**: 290.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 381.30 ms |
| Min | 1.00 ms |
| Max | 3971.00 ms |
| P50 | 34.80 ms |
| P95 | 2465.60 ms |
| P99 | 2780.00 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 182.80 |
| Latency avg | 53.99 ms |
| Latency P50 | 47.00 ms |
| Latency P95 | 98.00 ms |
| Latency P99 | 104.00 ms |
| Latency max | 265.00 ms |
| Throughput | 57.88 MB/s |
| Errors | 0 |


#### 📊 Load Summary - i18n-micro

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **3,290** completed | **290** | **329** |
|:---:|:---:|:---:|:---:|
| vusers created | 90.48% / 9.52% failed | average req/s | peak req/s |

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
| 11:46:30 PM | 46 req/s | 28 ms | 1 | 28 |
| 11:46:40 PM | 313 req/s | 854 ms | 76 | 542 |
| 11:46:50 PM | 318 req/s | 2060 ms | 81 | 600 |
| 11:47:00 PM | 278 req/s | 3262 ms | 137 | 600 |
| 11:47:10 PM | 324 req/s | 2466 ms | 0 | 600 |
| 11:47:20 PM | 329 req/s | 2516 ms | 0 | 600 |
| 11:47:30 PM | 327 req/s | 2466 ms | 0 | 600 |
| 11:47:40 PM | 289 req/s | 2417 ms | 0 | 66 |


</details>


## Stress Test Summary

### Artillery Results
| Project | Avg Response | P95 | P99 | RPS | Error Rate |
|---------|--------------|-----|-----|-----|------------|
| **plain-nuxt** | 430.40 ms | 2725.00 ms | 2893.50 ms | 273.00 | 0.00% |
| **i18n v10.6** | 708.90 ms | 4231.10 ms | 5272.40 ms | 195.00 | 0.00% |
| **i18n-micro** | 381.30 ms | 2465.60 ms | 2780.00 ms | 290.00 | 0.00% |

### Autocannon Results (10 connections, 10s)
| Project | Avg Latency | P50 | P95 | P99 | Max | RPS |
|---------|-------------|-----|-----|-----|-----|-----|
| **plain-nuxt** | 60.48 ms | 58.00 ms | 80.00 ms | 83.00 ms | 217.00 ms | 163.50 |
| **i18n v10.6** | 112.74 ms | 100.00 ms | 212.00 ms | 238.00 ms | 483.00 ms | 87.50 |
| **i18n-micro** | 53.99 ms | 47.00 ms | 98.00 ms | 104.00 ms | 265.00 ms | 182.80 |


## 🏆 Performance Comparison

### Throughput (Requests per Second)

> **Winner: i18n-micro** with 183 RPS

```chart
url: /charts/comparison-rps-autocannon.js
height: 350px
```

```chart
url: /charts/comparison-rps-artillery.js
height: 350px
```

### Latency Distribution

> **Winner: i18n-micro** with 53.99 ms avg latency

```chart
url: /charts/comparison-latency.js
height: 350px
```

### Quick Comparison

| Metric | **plain-nuxt** | **i18n-v10** | **i18n-micro** | Best |
|--------|---|---|---|------|
| RPS (Autocannon) | 164 | 88 | 183 | i18n-micro |
| Avg Latency | 60.48 ms | 112.74 ms | 53.99 ms | i18n-micro |
| P99 Latency | 83.00 ms | 238.00 ms | 104.00 ms | i18n-micro |
| Errors | 0 | 0 | 0 | - |



## Comparison: plain-nuxt (baseline) vs i18n v10.6

| Metric | plain-nuxt (baseline) | i18n v10.6 | Difference |
|--------|----------|----------|------------|
| Max Memory | 369.09 MB | 520.95 MB | +151.86 MB |
| Avg Memory | 280.56 MB | 374.22 MB | +93.66 MB |
| Response Avg | 430.40 ms | 708.90 ms | +278.50 ms |
| Response P95 | 2725.00 ms | 4231.10 ms | +1506.10 ms |
| Response P99 | 2893.50 ms | 5272.40 ms | +2378.90 ms |
| RPS (Artillery) | 273.00 | 195.00 | -78.00 |
| RPS (Autocannon) | 163.50 | 87.50 | -76.00 |
| Latency avg (Autocannon) | 60.48 ms | 112.74 ms | +52.26 ms |


## Comparison: plain-nuxt (baseline) vs i18n-micro

| Metric | plain-nuxt (baseline) | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 369.09 MB | 638.17 MB | +269.08 MB |
| Avg Memory | 280.56 MB | 507.27 MB | +226.72 MB |
| Response Avg | 430.40 ms | 381.30 ms | -49.10 ms |
| Response P95 | 2725.00 ms | 2465.60 ms | -259.40 ms |
| Response P99 | 2893.50 ms | 2780.00 ms | -113.50 ms |
| RPS (Artillery) | 273.00 | 290.00 | +17.00 |
| RPS (Autocannon) | 163.50 | 182.80 | +19.30 |
| Latency avg (Autocannon) | 60.48 ms | 53.99 ms | -6.49 ms |


## Comparison: i18n v10.6 vs i18n-micro

| Metric | i18n v10.6 | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 520.95 MB | 638.17 MB | +117.22 MB |
| Avg Memory | 374.22 MB | 507.27 MB | +133.05 MB |
| Response Avg | 708.90 ms | 381.30 ms | -327.60 ms |
| Response P95 | 4231.10 ms | 2465.60 ms | -1765.50 ms |
| Response P99 | 5272.40 ms | 2780.00 ms | -2492.40 ms |
| RPS (Artillery) | 195.00 | 290.00 | +95.00 |
| RPS (Autocannon) | 87.50 | 182.80 | +95.30 |
| Latency avg (Autocannon) | 112.74 ms | 53.99 ms | -58.75 ms |


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
