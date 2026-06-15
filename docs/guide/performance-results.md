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
| node                       | v20.20.1 |
| nuxt                       | N/A |
| nuxt-i18n-micro                       | 3.19.0 |
| @nuxtjs/i18n                       | catalog: |
  
## Build Performance for ./test/fixtures/plain-nuxt

- **Build Time**: 5.37 seconds
- **Bundle Size**: 1.94 MB (code: 1.36 MB, translations: 589.99 KB)
- **Code Bundle**: client: 194.8 KB, server: 1.17 MB
- **Max CPU Usage**: 209.60%
- **Min CPU Usage**: 105.20%
- **Average CPU Usage**: 183.86%
- **Max Memory Usage**: 757.78 MB
- **Min Memory Usage**: 165.75 MB
- **Average Memory Usage**: 441.48 MB


## Build Performance for ./test/fixtures/i18n

- **Build Time**: 68.28 seconds
- **Bundle Size**: 57.3 MB (code: 19.24 MB, translations: 38.06 MB)
- **Code Bundle**: client: 17.13 MB, server: 2.12 MB
- **Max CPU Usage**: 488.80%
- **Min CPU Usage**: 31.80%
- **Average CPU Usage**: 158.76%
- **Max Memory Usage**: 8096.86 MB
- **Min Memory Usage**: 165.45 MB
- **Average Memory Usage**: 4127.67 MB


## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 8.78 seconds
- **Bundle Size**: 57.27 MB (code: 1.51 MB, translations: 55.76 MB)
- **Code Bundle**: client: 243.68 KB, server: 1.27 MB
- **Max CPU Usage**: 295.00%
- **Min CPU Usage**: 125.50%
- **Average CPU Usage**: 185.68%
- **Max Memory Usage**: 1350.25 MB
- **Min Memory Usage**: 186.80 MB
- **Average Memory Usage**: 657.72 MB


## Build Performance Summary

| Project | Build Time | Code Bundle | Translations | Total |
|---------|------------|-------------|--------------|-------|
| **plain-nuxt** (baseline) | 5.37s | 1.36 MB | 589.99 KB | 1.94 MB |
| **i18n v10** | 68.28s | 19.24 MB | 38.06 MB | 57.3 MB |
| **i18n-micro** | 8.78s | 1.51 MB | 55.76 MB | 57.27 MB |

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
- **i18n v10 vs baseline**: 17.88 MB larger
- **i18n-micro vs baseline**: 157.08 KB larger
- **i18n-micro vs i18n v10**: 17.73 MB smaller


## Stress Test Results for plain-nuxt

### Resource Usage
- **Max CPU Usage**: 140.90%
- **Average CPU Usage**: 99.68%
- **Max Memory Usage**: 223.69 MB
- **Average Memory Usage**: 177.04 MB

### Artillery Results
- **Test Duration**: 69.09 seconds
- **Requests per Second**: 287.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 387.60 ms |
| Min | 0.00 ms |
| Max | 2564.00 ms |
| P50 | 37.00 ms |
| P95 | 2515.50 ms |
| P99 | 2515.50 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 168.10 |
| Latency avg | 58.82 ms |
| Latency P50 | 57.00 ms |
| Latency P95 | 77.00 ms |
| Latency P99 | 93.00 ms |
| Latency max | 129.00 ms |
| Throughput | 52.12 MB/s |
| Errors | 0 |


#### 📊 Load Summary - plain-nuxt

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **3,335** completed | **287** | **321** |
|:---:|:---:|:---:|:---:|
| vusers created | 91.72% / 8.28% failed | average req/s | peak req/s |

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
| Invalid Date | 107 req/s | 40 ms | 14 | 76 |
| Invalid Date | 318 req/s | 1130 ms | 88 | 600 |
| Invalid Date | 319 req/s | 2466 ms | 82 | 600 |
| Invalid Date | 321 req/s | 2516 ms | 42 | 600 |
| Invalid Date | 320 req/s | 2516 ms | 4 | 600 |
| Invalid Date | 321 req/s | 2516 ms | 0 | 600 |
| Invalid Date | 319 req/s | 2516 ms | 0 | 560 |
| Invalid Date | 275 req/s | 2466 ms | 0 | 0 |


</details>


## Stress Test Results for i18n

### Resource Usage
- **Max CPU Usage**: 157.40%
- **Average CPU Usage**: 121.28%
- **Max Memory Usage**: 889.73 MB
- **Average Memory Usage**: 548.46 MB

### Artillery Results
- **Test Duration**: 79.21 seconds
- **Requests per Second**: 26.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 992.00 ms |
| Min | 14.00 ms |
| Max | 7977.00 ms |
| P50 | 608.00 ms |
| P95 | 3605.50 ms |
| P99 | 7117.00 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 12.10 |
| Latency avg | 782.77 ms |
| Latency P50 | 771.00 ms |
| Latency P95 | 923.00 ms |
| Latency P99 | 1088.00 ms |
| Latency max | 1088.00 ms |
| Throughput | 3.83 MB/s |
| Errors | 0 |


#### 📊 Load Summary - i18n

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **48** completed | **26** | **72** |
|:---:|:---:|:---:|:---:|
| vusers created | 1.32% / 98.68% failed | average req/s | peak req/s |

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
| Invalid Date | 54 req/s | 2187 ms | 174 | 193 |
| Invalid Date | 72 req/s | 5712 ms | 297 | 600 |
| Invalid Date | 60 req/s | 0 ms | 8 | 600 |
| Invalid Date | 60 req/s | 0 ms | 5 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 443 |
| Invalid Date | 0 req/s | 0 ms | 0 | 0 |
| Invalid Date | 0 req/s | 0 ms | 0 | 0 |


</details>


## Stress Test Results for i18n-micro

### Resource Usage
- **Max CPU Usage**: 134.10%
- **Average CPU Usage**: 89.28%
- **Max Memory Usage**: 501.33 MB
- **Average Memory Usage**: 254.83 MB

### Artillery Results
- **Test Duration**: 65.44 seconds
- **Requests per Second**: 323.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 10.00 ms |
| Min | 0.00 ms |
| Max | 175.00 ms |
| P50 | 8.90 ms |
| P95 | 25.80 ms |
| P99 | 34.80 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 213.70 |
| Latency avg | 46.17 ms |
| Latency P50 | 40.00 ms |
| Latency P95 | 82.00 ms |
| Latency P99 | 86.00 ms |
| Latency max | 117.00 ms |
| Throughput | 67.6 MB/s |
| Errors | 0 |


#### 📊 Load Summary - i18n-micro

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **3,636** completed | **323** | **368** |
|:---:|:---:|:---:|:---:|
| vusers created | 100.00% / 0.00% failed | average req/s | peak req/s |

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
| Invalid Date | 7 req/s | 11 ms | 5 | 5 |
| Invalid Date | 254 req/s | 41 ms | 5 | 328 |
| Invalid Date | 366 req/s | 25 ms | 0 | 600 |
| Invalid Date | 360 req/s | 14 ms | 0 | 600 |
| Invalid Date | 360 req/s | 20 ms | 0 | 600 |
| Invalid Date | 360 req/s | 13 ms | 0 | 600 |
| Invalid Date | 360 req/s | 13 ms | 0 | 600 |
| Invalid Date | 368 req/s | 12 ms | 0 | 303 |


</details>


## Stress Test Summary

### Artillery Results
| Project | Avg Response | P95 | P99 | RPS | Error Rate |
|---------|--------------|-----|-----|-----|------------|
| **plain-nuxt** | 387.60 ms | 2515.50 ms | 2515.50 ms | 287.00 | 0.00% |
| **i18n v10** | 992.00 ms | 3605.50 ms | 7117.00 ms | 26.00 | 0.00% |
| **i18n-micro** | 10.00 ms | 25.80 ms | 34.80 ms | 323.00 | 0.00% |

### Autocannon Results (10 connections, 10s)
| Project | Avg Latency | P50 | P95 | P99 | Max | RPS |
|---------|-------------|-----|-----|-----|-----|-----|
| **plain-nuxt** | 58.82 ms | 57.00 ms | 77.00 ms | 93.00 ms | 129.00 ms | 168.10 |
| **i18n v10** | 782.77 ms | 771.00 ms | 923.00 ms | 1088.00 ms | 1088.00 ms | 12.10 |
| **i18n-micro** | 46.17 ms | 40.00 ms | 82.00 ms | 86.00 ms | 117.00 ms | 213.70 |


## 🏆 Performance Comparison

### Throughput (Requests per Second)

> **Winner: i18n-micro** with 214 RPS

```chart
url: /charts/comparison-rps-autocannon.js
height: 350px
```

```chart
url: /charts/comparison-rps-artillery.js
height: 350px
```

### Latency Distribution

> **Winner: i18n-micro** with 46.17 ms avg latency

```chart
url: /charts/comparison-latency.js
height: 350px
```

### Quick Comparison

| Metric | **plain-nuxt** | **i18n-v10** | **i18n-micro** | Best |
|--------|---|---|---|------|
| RPS (Autocannon) | 168 | 12 | 214 | i18n-micro |
| Avg Latency | 58.82 ms | 782.77 ms | 46.17 ms | i18n-micro |
| P99 Latency | 93.00 ms | 1088.00 ms | 86.00 ms | i18n-micro |
| Errors | 0 | 0 | 0 | - |



## Comparison: plain-nuxt (baseline) vs i18n v10

| Metric | plain-nuxt (baseline) | i18n v10 | Difference |
|--------|----------|----------|------------|
| Max Memory | 223.69 MB | 889.73 MB | +666.05 MB |
| Avg Memory | 177.04 MB | 548.46 MB | +371.42 MB |
| Response Avg | 387.60 ms | 992.00 ms | +604.40 ms |
| Response P95 | 2515.50 ms | 3605.50 ms | +1090.00 ms |
| Response P99 | 2515.50 ms | 7117.00 ms | +4601.50 ms |
| RPS (Artillery) | 287.00 | 26.00 | -261.00 |
| RPS (Autocannon) | 168.10 | 12.10 | -156.00 |
| Latency avg (Autocannon) | 58.82 ms | 782.77 ms | +723.95 ms |


## Comparison: plain-nuxt (baseline) vs i18n-micro

| Metric | plain-nuxt (baseline) | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 223.69 MB | 501.33 MB | +277.64 MB |
| Avg Memory | 177.04 MB | 254.83 MB | +77.79 MB |
| Response Avg | 387.60 ms | 10.00 ms | -377.60 ms |
| Response P95 | 2515.50 ms | 25.80 ms | -2489.70 ms |
| Response P99 | 2515.50 ms | 34.80 ms | -2480.70 ms |
| RPS (Artillery) | 287.00 | 323.00 | +36.00 |
| RPS (Autocannon) | 168.10 | 213.70 | +45.60 |
| Latency avg (Autocannon) | 58.82 ms | 46.17 ms | -12.65 ms |


## Comparison: i18n v10 vs i18n-micro

| Metric | i18n v10 | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 889.73 MB | 501.33 MB | -388.41 MB |
| Avg Memory | 548.46 MB | 254.83 MB | -293.63 MB |
| Response Avg | 992.00 ms | 10.00 ms | -982.00 ms |
| Response P95 | 3605.50 ms | 25.80 ms | -3579.70 ms |
| Response P99 | 7117.00 ms | 34.80 ms | -7082.20 ms |
| RPS (Artillery) | 26.00 | 323.00 | +297.00 |
| RPS (Autocannon) | 12.10 | 213.70 | +201.60 |
| Latency avg (Autocannon) | 782.77 ms | 46.17 ms | -736.60 ms |


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
