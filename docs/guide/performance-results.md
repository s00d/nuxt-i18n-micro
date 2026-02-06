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
| nuxt-i18n-micro                       | 3.2.4 |
| @nuxtjs/i18n                       | catalog: |
  
## Build Performance for ./test/fixtures/plain-nuxt

- **Build Time**: 5.71 seconds
- **Bundle Size**: 1.93 MB (code: 1.35 MB, translations: 589.99 KB)
- **Code Bundle**: client: 194.8 KB, server: 1.16 MB
- **Max CPU Usage**: 240.20%
- **Min CPU Usage**: 115.40%
- **Average CPU Usage**: 179.84%
- **Max Memory Usage**: 674.14 MB
- **Min Memory Usage**: 216.06 MB
- **Average Memory Usage**: 422.76 MB


## Build Performance for ./test/fixtures/i18n

- **Build Time**: 84.91 seconds
- **Bundle Size**: 57.29 MB (code: 19.24 MB, translations: 38.05 MB)
- **Code Bundle**: client: 17.13 MB, server: 2.11 MB
- **Max CPU Usage**: 438.50%
- **Min CPU Usage**: 32.80%
- **Average CPU Usage**: 135.52%
- **Max Memory Usage**: 9527.92 MB
- **Min Memory Usage**: 280.91 MB
- **Average Memory Usage**: 3482.72 MB


## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 23.47 seconds
- **Bundle Size**: 62.47 MB (code: 1.5 MB, translations: 60.97 MB)
- **Code Bundle**: client: 242.82 KB, server: 1.27 MB
- **Max CPU Usage**: 207.60%
- **Min CPU Usage**: 12.40%
- **Average CPU Usage**: 71.84%
- **Max Memory Usage**: 1657.73 MB
- **Min Memory Usage**: 82.48 MB
- **Average Memory Usage**: 491.37 MB


## Build Performance Summary

| Project | Build Time | Code Bundle | Translations | Total |
|---------|------------|-------------|--------------|-------|
| **plain-nuxt** (baseline) | 5.71s | 1.35 MB | 589.99 KB | 1.93 MB |
| **i18n v10** | 84.91s | 19.24 MB | 38.05 MB | 57.29 MB |
| **i18n-micro** | 23.47s | 1.5 MB | 60.97 MB | 62.47 MB |

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
- **i18n-micro vs baseline**: 157.79 KB larger
- **i18n-micro vs i18n v10**: 17.73 MB smaller


## Stress Test Results for plain-nuxt

### Resource Usage
- **Max CPU Usage**: 127.70%
- **Average CPU Usage**: 86.58%
- **Max Memory Usage**: 265.16 MB
- **Average Memory Usage**: 205.67 MB

### Artillery Results
- **Test Duration**: 68.59 seconds
- **Requests per Second**: 301.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 351.80 ms |
| Min | 0.00 ms |
| Max | 2430.00 ms |
| P50 | 34.80 ms |
| P95 | 2369.00 ms |
| P99 | 2416.80 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 122.00 |
| Latency avg | 81.38 ms |
| Latency P50 | 59.00 ms |
| Latency P95 | 195.00 ms |
| Latency P99 | 276.00 ms |
| Latency max | 381.00 ms |
| Throughput | 37.83 MB/s |
| Errors | 0 |


#### 📊 Load Summary - plain-nuxt

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **3,470** completed | **301** | **336** |
|:---:|:---:|:---:|:---:|
| vusers created | 95.43% / 4.57% failed | average req/s | peak req/s |

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
| Invalid Date | 53 req/s | 9 ms | 0 | 19 |
| Invalid Date | 294 req/s | 596 ms | 60 | 483 |
| Invalid Date | 333 req/s | 1496 ms | 60 | 600 |
| Invalid Date | 329 req/s | 2369 ms | 60 | 600 |
| Invalid Date | 335 req/s | 2417 ms | 19 | 600 |
| Invalid Date | 336 req/s | 2369 ms | 3 | 600 |
| Invalid Date | 335 req/s | 2369 ms | 0 | 600 |
| Invalid Date | 300 req/s | 2417 ms | 0 | 134 |


</details>


## Stress Test Results for i18n

### Resource Usage
- **Max CPU Usage**: 157.40%
- **Average CPU Usage**: 117.59%
- **Max Memory Usage**: 1135.89 MB
- **Average Memory Usage**: 744.86 MB

### Artillery Results
- **Test Duration**: 75.36 seconds
- **Requests per Second**: 51.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 1151.50 ms |
| Min | 16.00 ms |
| Max | 9864.00 ms |
| P50 | 645.60 ms |
| P95 | 4867.00 ms |
| P99 | 8692.80 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 11.70 |
| Latency avg | 816.50 ms |
| Latency P50 | 806.00 ms |
| Latency P95 | 1427.00 ms |
| Latency P99 | 1777.00 ms |
| Latency max | 2153.00 ms |
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
| Invalid Date | 23 req/s | 1023 ms | 23 | 30 |
| Invalid Date | 75 req/s | 5945 ms | 528 | 559 |
| Invalid Date | 65 req/s | 672 ms | 0 | 600 |
| Invalid Date | 60 req/s | 0 ms | 21 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 600 |
| Invalid Date | 47 req/s | 0 ms | 0 | 47 |
| Invalid Date | 0 req/s | 0 ms | 0 | 0 |


</details>


## Stress Test Results for i18n-micro

### Resource Usage
- **Max CPU Usage**: 129.10%
- **Average CPU Usage**: 88.67%
- **Max Memory Usage**: 366.14 MB
- **Average Memory Usage**: 278.48 MB

### Artillery Results
- **Test Duration**: 69.81 seconds
- **Requests per Second**: 266.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 426.40 ms |
| Min | 1.00 ms |
| Max | 2764.00 ms |
| P50 | 39.30 ms |
| P95 | 2725.00 ms |
| P99 | 2725.00 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 164.10 |
| Latency avg | 60.16 ms |
| Latency P50 | 52.00 ms |
| Latency P95 | 109.00 ms |
| Latency P99 | 119.00 ms |
| Latency max | 255.00 ms |
| Throughput | 52.02 MB/s |
| Errors | 0 |


#### 📊 Load Summary - i18n-micro

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **3,133** completed | **266** | **302** |
|:---:|:---:|:---:|:---:|
| vusers created | 86.17% / 13.83% failed | average req/s | peak req/s |

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
| Invalid Date | 32 req/s | 16 ms | 1 | 6 |
| Invalid Date | 224 req/s | 646 ms | 69 | 332 |
| Invalid Date | 301 req/s | 2466 ms | 122 | 600 |
| Invalid Date | 301 req/s | 2725 ms | 60 | 600 |
| Invalid Date | 302 req/s | 2725 ms | 3 | 600 |
| Invalid Date | 302 req/s | 2725 ms | 3 | 600 |
| Invalid Date | 301 req/s | 2725 ms | 0 | 600 |
| Invalid Date | 277 req/s | 2671 ms | 0 | 298 |


</details>


## Stress Test Summary

### Artillery Results
| Project | Avg Response | P95 | P99 | RPS | Error Rate |
|---------|--------------|-----|-----|-----|------------|
| **plain-nuxt** | 351.80 ms | 2369.00 ms | 2416.80 ms | 301.00 | 0.00% |
| **i18n v10** | 1151.50 ms | 4867.00 ms | 8692.80 ms | 51.00 | 0.00% |
| **i18n-micro** | 426.40 ms | 2725.00 ms | 2725.00 ms | 266.00 | 0.00% |

### Autocannon Results (10 connections, 10s)
| Project | Avg Latency | P50 | P95 | P99 | Max | RPS |
|---------|-------------|-----|-----|-----|-----|-----|
| **plain-nuxt** | 81.38 ms | 59.00 ms | 195.00 ms | 276.00 ms | 381.00 ms | 122.00 |
| **i18n v10** | 816.50 ms | 806.00 ms | 1427.00 ms | 1777.00 ms | 2153.00 ms | 11.70 |
| **i18n-micro** | 60.16 ms | 52.00 ms | 109.00 ms | 119.00 ms | 255.00 ms | 164.10 |


## 🏆 Performance Comparison

### Throughput (Requests per Second)

> **Winner: i18n-micro** with 164 RPS

```chart
url: /charts/comparison-rps-autocannon.js
height: 350px
```

```chart
url: /charts/comparison-rps-artillery.js
height: 350px
```

### Latency Distribution

> **Winner: i18n-micro** with 60.16 ms avg latency

```chart
url: /charts/comparison-latency.js
height: 350px
```

### Quick Comparison

| Metric | **plain-nuxt** | **i18n-v10** | **i18n-micro** | Best |
|--------|---|---|---|------|
| RPS (Autocannon) | 122 | 12 | 164 | i18n-micro |
| Avg Latency | 81.38 ms | 816.50 ms | 60.16 ms | i18n-micro |
| P99 Latency | 276.00 ms | 1777.00 ms | 119.00 ms | i18n-micro |
| Errors | 0 | 0 | 0 | - |



## Comparison: plain-nuxt (baseline) vs i18n v10

| Metric | plain-nuxt (baseline) | i18n v10 | Difference |
|--------|----------|----------|------------|
| Max Memory | 265.16 MB | 1135.89 MB | +870.73 MB |
| Avg Memory | 205.67 MB | 744.86 MB | +539.19 MB |
| Response Avg | 351.80 ms | 1151.50 ms | +799.70 ms |
| Response P95 | 2369.00 ms | 4867.00 ms | +2498.00 ms |
| Response P99 | 2416.80 ms | 8692.80 ms | +6276.00 ms |
| RPS (Artillery) | 301.00 | 51.00 | -250.00 |
| RPS (Autocannon) | 122.00 | 11.70 | -110.30 |
| Latency avg (Autocannon) | 81.38 ms | 816.50 ms | +735.12 ms |


## Comparison: plain-nuxt (baseline) vs i18n-micro

| Metric | plain-nuxt (baseline) | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 265.16 MB | 366.14 MB | +100.98 MB |
| Avg Memory | 205.67 MB | 278.48 MB | +72.81 MB |
| Response Avg | 351.80 ms | 426.40 ms | +74.60 ms |
| Response P95 | 2369.00 ms | 2725.00 ms | +356.00 ms |
| Response P99 | 2416.80 ms | 2725.00 ms | +308.20 ms |
| RPS (Artillery) | 301.00 | 266.00 | -35.00 |
| RPS (Autocannon) | 122.00 | 164.10 | +42.10 |
| Latency avg (Autocannon) | 81.38 ms | 60.16 ms | -21.22 ms |


## Comparison: i18n v10 vs i18n-micro

| Metric | i18n v10 | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 1135.89 MB | 366.14 MB | -769.75 MB |
| Avg Memory | 744.86 MB | 278.48 MB | -466.38 MB |
| Response Avg | 1151.50 ms | 426.40 ms | -725.10 ms |
| Response P95 | 4867.00 ms | 2725.00 ms | -2142.00 ms |
| Response P99 | 8692.80 ms | 2725.00 ms | -5967.80 ms |
| RPS (Artillery) | 51.00 | 266.00 | +215.00 |
| RPS (Autocannon) | 11.70 | 164.10 | +152.40 |
| Latency avg (Autocannon) | 816.50 ms | 60.16 ms | -756.34 ms |


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
