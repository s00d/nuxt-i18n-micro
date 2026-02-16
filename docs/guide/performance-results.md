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
| nuxt-i18n-micro                       | 3.9.0 |
| @nuxtjs/i18n                       | catalog: |
  
## Build Performance for ./test/fixtures/plain-nuxt

- **Build Time**: 6.50 seconds
- **Bundle Size**: 1.93 MB (code: 1.35 MB, translations: 589.99 KB)
- **Code Bundle**: client: 194.81 KB, server: 1.16 MB
- **Max CPU Usage**: 195.10%
- **Min CPU Usage**: 57.30%
- **Average CPU Usage**: 144.72%
- **Max Memory Usage**: 744.58 MB
- **Min Memory Usage**: 219.83 MB
- **Average Memory Usage**: 488.47 MB


## Build Performance for ./test/fixtures/i18n

- **Build Time**: 82.26 seconds
- **Bundle Size**: 57.3 MB (code: 19.24 MB, translations: 38.05 MB)
- **Code Bundle**: client: 17.13 MB, server: 2.11 MB
- **Max CPU Usage**: 419.20%
- **Min CPU Usage**: 15.50%
- **Average CPU Usage**: 139.08%
- **Max Memory Usage**: 9117.41 MB
- **Min Memory Usage**: 277.22 MB
- **Average Memory Usage**: 3964.05 MB


## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 14.95 seconds
- **Bundle Size**: 57.24 MB (code: 1.48 MB, translations: 55.76 MB)
- **Code Bundle**: client: 232.73 KB, server: 1.25 MB
- **Max CPU Usage**: 243.00%
- **Min CPU Usage**: 7.50%
- **Average CPU Usage**: 96.66%
- **Max Memory Usage**: 1174.55 MB
- **Min Memory Usage**: 83.13 MB
- **Average Memory Usage**: 416.37 MB


## Build Performance Summary

| Project | Build Time | Code Bundle | Translations | Total |
|---------|------------|-------------|--------------|-------|
| **plain-nuxt** (baseline) | 6.50s | 1.35 MB | 589.99 KB | 1.93 MB |
| **i18n v10** | 82.26s | 19.24 MB | 38.05 MB | 57.3 MB |
| **i18n-micro** | 14.95s | 1.48 MB | 55.76 MB | 57.24 MB |

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
- **i18n-micro vs baseline**: 131.49 KB larger
- **i18n-micro vs i18n v10**: 17.76 MB smaller


## Stress Test Results for plain-nuxt

### Resource Usage
- **Max CPU Usage**: 146.40%
- **Average CPU Usage**: 86.57%
- **Max Memory Usage**: 324.30 MB
- **Average Memory Usage**: 218.66 MB

### Artillery Results
- **Test Duration**: 70.26 seconds
- **Requests per Second**: 274.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 453.20 ms |
| Min | 0.00 ms |
| Max | 5310.00 ms |
| P50 | 37.70 ms |
| P95 | 2780.00 ms |
| P99 | 3905.80 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 154.00 |
| Latency avg | 64.13 ms |
| Latency P50 | 54.00 ms |
| Latency P95 | 163.00 ms |
| Latency P99 | 216.00 ms |
| Latency max | 330.00 ms |
| Throughput | 47.74 MB/s |
| Errors | 0 |


#### 📊 Load Summary - plain-nuxt

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **3,047** completed | **274** | **333** |
|:---:|:---:|:---:|:---:|
| vusers created | 83.80% / 16.20% failed | average req/s | peak req/s |

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
| Invalid Date | 183 req/s | 66 ms | 19 | 116 |
| Invalid Date | 291 req/s | 1864 ms | 138 | 600 |
| Invalid Date | 283 req/s | 3135 ms | 113 | 600 |
| Invalid Date | 312 req/s | 2836 ms | 0 | 600 |
| Invalid Date | 333 req/s | 2369 ms | 0 | 600 |
| Invalid Date | 289 req/s | 2780 ms | 75 | 600 |
| Invalid Date | 223 req/s | 4771 ms | 0 | 520 |
| Invalid Date | 283 req/s | 2417 ms | 0 | 0 |


</details>


## Stress Test Results for i18n

### Resource Usage
- **Max CPU Usage**: 162.80%
- **Average CPU Usage**: 112.41%
- **Max Memory Usage**: 1094.72 MB
- **Average Memory Usage**: 716.95 MB

### Artillery Results
- **Test Duration**: 75.44 seconds
- **Requests per Second**: 51.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 1177.10 ms |
| Min | 17.00 ms |
| Max | 9978.00 ms |
| P50 | 645.60 ms |
| P95 | 5065.60 ms |
| P99 | 8692.80 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 11.70 |
| Latency avg | 804.99 ms |
| Latency P50 | 791.00 ms |
| Latency P95 | 1399.00 ms |
| Latency P99 | 1739.00 ms |
| Latency max | 2110.00 ms |
| Throughput | 3.71 MB/s |
| Errors | 0 |


#### 📊 Load Summary - i18n

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **51** completed | **51** | **75** |
|:---:|:---:|:---:|:---:|
| vusers created | 1.40% / 98.60% failed | average req/s | peak req/s |

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
| Invalid Date | 23 req/s | 1108 ms | 23 | 30 |
| Invalid Date | 75 req/s | 6065 ms | 532 | 563 |
| Invalid Date | 65 req/s | 758 ms | 0 | 600 |
| Invalid Date | 60 req/s | 0 ms | 14 | 600 |
| Invalid Date | 60 req/s | 0 ms | 8 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 600 |
| Invalid Date | 43 req/s | 0 ms | 0 | 43 |
| Invalid Date | 0 req/s | 0 ms | 0 | 0 |


</details>


## Stress Test Results for i18n-micro

### Resource Usage
- **Max CPU Usage**: 131.00%
- **Average CPU Usage**: 86.46%
- **Max Memory Usage**: 343.73 MB
- **Average Memory Usage**: 274.70 MB

### Artillery Results
- **Test Duration**: 69.81 seconds
- **Requests per Second**: 278.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 437.20 ms |
| Min | 1.00 ms |
| Max | 2910.00 ms |
| P50 | 39.30 ms |
| P95 | 2780.00 ms |
| P99 | 2836.20 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 150.70 |
| Latency avg | 65.70 ms |
| Latency P50 | 57.00 ms |
| Latency P95 | 119.00 ms |
| Latency P99 | 141.00 ms |
| Latency max | 363.00 ms |
| Throughput | 47.77 MB/s |
| Errors | 0 |


#### 📊 Load Summary - i18n-micro

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **3,090** completed | **278** | **300** |
|:---:|:---:|:---:|:---:|
| vusers created | 84.98% / 15.02% failed | average req/s | peak req/s |

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
| Invalid Date | 195 req/s | 518 ms | 58 | 245 |
| Invalid Date | 293 req/s | 2276 ms | 135 | 600 |
| Invalid Date | 297 req/s | 2780 ms | 68 | 600 |
| Invalid Date | 298 req/s | 2780 ms | 9 | 600 |
| Invalid Date | 298 req/s | 2780 ms | 0 | 600 |
| Invalid Date | 300 req/s | 2780 ms | 0 | 600 |
| Invalid Date | 282 req/s | 2725 ms | 0 | 391 |
| Invalid Date | 267 req/s | 2466 ms | 0 | 0 |


</details>


## Stress Test Summary

### Artillery Results
| Project | Avg Response | P95 | P99 | RPS | Error Rate |
|---------|--------------|-----|-----|-----|------------|
| **plain-nuxt** | 453.20 ms | 2780.00 ms | 3905.80 ms | 274.00 | 0.00% |
| **i18n v10** | 1177.10 ms | 5065.60 ms | 8692.80 ms | 51.00 | 0.00% |
| **i18n-micro** | 437.20 ms | 2780.00 ms | 2836.20 ms | 278.00 | 0.00% |

### Autocannon Results (10 connections, 10s)
| Project | Avg Latency | P50 | P95 | P99 | Max | RPS |
|---------|-------------|-----|-----|-----|-----|-----|
| **plain-nuxt** | 64.13 ms | 54.00 ms | 163.00 ms | 216.00 ms | 330.00 ms | 154.00 |
| **i18n v10** | 804.99 ms | 791.00 ms | 1399.00 ms | 1739.00 ms | 2110.00 ms | 11.70 |
| **i18n-micro** | 65.70 ms | 57.00 ms | 119.00 ms | 141.00 ms | 363.00 ms | 150.70 |


## 🏆 Performance Comparison

### Throughput (Requests per Second)

> **Winner: plain-nuxt** with 154 RPS

```chart
url: /charts/comparison-rps-autocannon.js
height: 350px
```

```chart
url: /charts/comparison-rps-artillery.js
height: 350px
```

### Latency Distribution

> **Winner: plain-nuxt** with 64.13 ms avg latency

```chart
url: /charts/comparison-latency.js
height: 350px
```

### Quick Comparison

| Metric | **plain-nuxt** | **i18n-v10** | **i18n-micro** | Best |
|--------|---|---|---|------|
| RPS (Autocannon) | 154 | 12 | 151 | plain-nuxt |
| Avg Latency | 64.13 ms | 804.99 ms | 65.70 ms | plain-nuxt |
| P99 Latency | 216.00 ms | 1739.00 ms | 141.00 ms | plain-nuxt |
| Errors | 0 | 0 | 0 | - |



## Comparison: plain-nuxt (baseline) vs i18n v10

| Metric | plain-nuxt (baseline) | i18n v10 | Difference |
|--------|----------|----------|------------|
| Max Memory | 324.30 MB | 1094.72 MB | +770.42 MB |
| Avg Memory | 218.66 MB | 716.95 MB | +498.29 MB |
| Response Avg | 453.20 ms | 1177.10 ms | +723.90 ms |
| Response P95 | 2780.00 ms | 5065.60 ms | +2285.60 ms |
| Response P99 | 3905.80 ms | 8692.80 ms | +4787.00 ms |
| RPS (Artillery) | 274.00 | 51.00 | -223.00 |
| RPS (Autocannon) | 154.00 | 11.70 | -142.30 |
| Latency avg (Autocannon) | 64.13 ms | 804.99 ms | +740.86 ms |


## Comparison: plain-nuxt (baseline) vs i18n-micro

| Metric | plain-nuxt (baseline) | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 324.30 MB | 343.73 MB | +19.44 MB |
| Avg Memory | 218.66 MB | 274.70 MB | +56.04 MB |
| Response Avg | 453.20 ms | 437.20 ms | -16.00 ms |
| Response P95 | 2780.00 ms | 2780.00 ms | 0.00 ms |
| Response P99 | 3905.80 ms | 2836.20 ms | -1069.60 ms |
| RPS (Artillery) | 274.00 | 278.00 | +4.00 |
| RPS (Autocannon) | 154.00 | 150.70 | -3.30 |
| Latency avg (Autocannon) | 64.13 ms | 65.70 ms | +1.57 ms |


## Comparison: i18n v10 vs i18n-micro

| Metric | i18n v10 | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 1094.72 MB | 343.73 MB | -750.98 MB |
| Avg Memory | 716.95 MB | 274.70 MB | -442.25 MB |
| Response Avg | 1177.10 ms | 437.20 ms | -739.90 ms |
| Response P95 | 5065.60 ms | 2780.00 ms | -2285.60 ms |
| Response P99 | 8692.80 ms | 2836.20 ms | -5856.60 ms |
| RPS (Artillery) | 51.00 | 278.00 | +227.00 |
| RPS (Autocannon) | 11.70 | 150.70 | +139.00 |
| Latency avg (Autocannon) | 804.99 ms | 65.70 ms | -739.29 ms |


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
