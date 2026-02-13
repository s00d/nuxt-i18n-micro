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

| Dependency                   | Version  |
|-------------------------------|----------|
| node                       | v20.19.6 |
| nuxt                       | N/A      |
| nuxt-i18n-micro                       | 3.8.0    |
| @nuxtjs/i18n                       | catalog: |
  
## Build Performance for ./test/fixtures/plain-nuxt

- **Build Time**: 5.16 seconds
- **Bundle Size**: 1.93 MB (code: 1.35 MB, translations: 589.99 KB)
- **Code Bundle**: client: 194.81 KB, server: 1.16 MB
- **Max CPU Usage**: 200.90%
- **Min CPU Usage**: 117.40%
- **Average CPU Usage**: 174.52%
- **Max Memory Usage**: 1023.20 MB
- **Min Memory Usage**: 208.72 MB
- **Average Memory Usage**: 531.72 MB


## Build Performance for ./test/fixtures/i18n

- **Build Time**: 65.75 seconds
- **Bundle Size**: 57.3 MB (code: 19.24 MB, translations: 38.05 MB)
- **Code Bundle**: client: 17.13 MB, server: 2.11 MB
- **Max CPU Usage**: 602.70%
- **Min CPU Usage**: 18.40%
- **Average CPU Usage**: 160.87%
- **Max Memory Usage**: 8996.45 MB
- **Min Memory Usage**: 277.52 MB
- **Average Memory Usage**: 4111.76 MB


## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 7.75 seconds
- **Bundle Size**: 57.26 MB (code: 1.5 MB, translations: 55.76 MB)
- **Code Bundle**: client: 240.43 KB, server: 1.27 MB
- **Max CPU Usage**: 262.80%
- **Min CPU Usage**: 120.00%
- **Average CPU Usage**: 182.63%
- **Max Memory Usage**: 1398.69 MB
- **Min Memory Usage**: 207.86 MB
- **Average Memory Usage**: 703.99 MB


## Build Performance Summary

| Project | Build Time | Code Bundle | Translations | Total |
|---------|------------|-------------|--------------|-------|
| **plain-nuxt** (baseline) | 5.16s | 1.35 MB | 589.99 KB | 1.93 MB |
| **i18n v10** | 65.75s | 19.24 MB | 38.05 MB | 57.3 MB |
| **i18n-micro** | 7.75s | 1.5 MB | 55.76 MB | 57.26 MB |

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
- **Max CPU Usage**: 135.60%
- **Average CPU Usage**: 70.19%
- **Max Memory Usage**: 261.97 MB
- **Average Memory Usage**: 171.13 MB

### Artillery Results
- **Test Duration**: 68.56 seconds
- **Requests per Second**: 302.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 329.90 ms |
| Min | 0.00 ms |
| Max | 2374.00 ms |
| P50 | 34.80 ms |
| P95 | 2322.10 ms |
| P99 | 2369.00 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 161.10 |
| Latency avg | 61.37 ms |
| Latency P50 | 55.00 ms |
| Latency P95 | 110.00 ms |
| Latency P99 | 152.00 ms |
| Latency max | 455.00 ms |
| Throughput | 49.95 MB/s |
| Errors | 0 |


#### 📊 Load Summary - plain-nuxt

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **3,534** completed | **302** | **340** |
|:---:|:---:|:---:|:---:|
| vusers created | 97.19% / 2.81% failed | average req/s | peak req/s |

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
| Invalid Date | 101 req/s | 25 ms | 10 | 72 |
| Invalid Date | 333 req/s | 672 ms | 57 | 600 |
| Invalid Date | 336 req/s | 1496 ms | 47 | 600 |
| Invalid Date | 340 req/s | 2231 ms | 44 | 600 |
| Invalid Date | 338 req/s | 2369 ms | 35 | 600 |
| Invalid Date | 339 req/s | 2369 ms | 0 | 600 |
| Invalid Date | 336 req/s | 2322 ms | 0 | 564 |
| Invalid Date | 282 req/s | 2322 ms | 0 | 0 |


</details>


## Stress Test Results for i18n

### Resource Usage
- **Max CPU Usage**: 172.90%
- **Average CPU Usage**: 126.41%
- **Max Memory Usage**: 1739.83 MB
- **Average Memory Usage**: 723.74 MB

### Artillery Results
- **Test Duration**: 75.42 seconds
- **Requests per Second**: 52.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 1396.20 ms |
| Min | 15.00 ms |
| Max | 9961.00 ms |
| P50 | 620.30 ms |
| P95 | 8024.50 ms |
| P99 | 9999.20 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 12.40 |
| Latency avg | 765.79 ms |
| Latency P50 | 759.00 ms |
| Latency P95 | 1388.00 ms |
| Latency P99 | 2056.00 ms |
| Latency max | 2483.00 ms |
| Throughput | 3.93 MB/s |
| Errors | 0 |


#### 📊 Load Summary - i18n

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **54** completed | **52** | **74** |
|:---:|:---:|:---:|:---:|
| vusers created | 1.49% / 98.51% failed | average req/s | peak req/s |

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
| Invalid Date | 55 req/s | 2417 ms | 222 | 244 |
| Invalid Date | 74 req/s | 7557 ms | 253 | 600 |
| Invalid Date | 60 req/s | 0 ms | 21 | 600 |
| Invalid Date | 60 req/s | 0 ms | 1 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 392 |
| Invalid Date | 5 req/s | 9999 ms | 0 | 0 |


</details>


## Stress Test Results for i18n-micro

### Resource Usage
- **Max CPU Usage**: 134.20%
- **Average CPU Usage**: 91.08%
- **Max Memory Usage**: 434.91 MB
- **Average Memory Usage**: 292.27 MB

### Artillery Results
- **Test Duration**: 69.19 seconds
- **Requests per Second**: 281.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 398.30 ms |
| Min | 1.00 ms |
| Max | 2680.00 ms |
| P50 | 37.00 ms |
| P95 | 2566.30 ms |
| P99 | 2618.10 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 178.00 |
| Latency avg | 55.47 ms |
| Latency P50 | 49.00 ms |
| Latency P95 | 100.00 ms |
| Latency P99 | 104.00 ms |
| Latency max | 253.00 ms |
| Throughput | 56.42 MB/s |
| Errors | 0 |


#### 📊 Load Summary - i18n-micro

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **3,261** completed | **281** | **316** |
|:---:|:---:|:---:|:---:|
| vusers created | 89.69% / 10.31% failed | average req/s | peak req/s |

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
| Invalid Date | 99 req/s | 37 ms | 15 | 75 |
| Invalid Date | 309 req/s | 1326 ms | 101 | 600 |
| Invalid Date | 314 req/s | 2566 ms | 97 | 600 |
| Invalid Date | 313 req/s | 2566 ms | 21 | 600 |
| Invalid Date | 316 req/s | 2566 ms | 0 | 600 |
| Invalid Date | 312 req/s | 2618 ms | 0 | 600 |
| Invalid Date | 313 req/s | 2566 ms | 0 | 561 |
| Invalid Date | 276 req/s | 2516 ms | 0 | 0 |


</details>


## Stress Test Summary

### Artillery Results
| Project | Avg Response | P95 | P99 | RPS | Error Rate |
|---------|--------------|-----|-----|-----|------------|
| **plain-nuxt** | 329.90 ms | 2322.10 ms | 2369.00 ms | 302.00 | 0.00% |
| **i18n v10** | 1396.20 ms | 8024.50 ms | 9999.20 ms | 52.00 | 0.00% |
| **i18n-micro** | 398.30 ms | 2566.30 ms | 2618.10 ms | 281.00 | 0.00% |

### Autocannon Results (10 connections, 10s)
| Project | Avg Latency | P50 | P95 | P99 | Max | RPS |
|---------|-------------|-----|-----|-----|-----|-----|
| **plain-nuxt** | 61.37 ms | 55.00 ms | 110.00 ms | 152.00 ms | 455.00 ms | 161.10 |
| **i18n v10** | 765.79 ms | 759.00 ms | 1388.00 ms | 2056.00 ms | 2483.00 ms | 12.40 |
| **i18n-micro** | 55.47 ms | 49.00 ms | 100.00 ms | 104.00 ms | 253.00 ms | 178.00 |


## 🏆 Performance Comparison

### Throughput (Requests per Second)

> **Winner: i18n-micro** with 178 RPS

```chart
url: /charts/comparison-rps-autocannon.js
height: 350px
```

```chart
url: /charts/comparison-rps-artillery.js
height: 350px
```

### Latency Distribution

> **Winner: i18n-micro** with 55.47 ms avg latency

```chart
url: /charts/comparison-latency.js
height: 350px
```

### Quick Comparison

| Metric | **plain-nuxt** | **i18n-v10** | **i18n-micro** | Best |
|--------|---|---|---|------|
| RPS (Autocannon) | 161 | 12 | 178 | i18n-micro |
| Avg Latency | 61.37 ms | 765.79 ms | 55.47 ms | i18n-micro |
| P99 Latency | 152.00 ms | 2056.00 ms | 104.00 ms | i18n-micro |
| Errors | 0 | 0 | 0 | - |



## Comparison: plain-nuxt (baseline) vs i18n v10

| Metric | plain-nuxt (baseline) | i18n v10 | Difference |
|--------|----------|----------|------------|
| Max Memory | 261.97 MB | 1739.83 MB | +1477.86 MB |
| Avg Memory | 171.13 MB | 723.74 MB | +552.61 MB |
| Response Avg | 329.90 ms | 1396.20 ms | +1066.30 ms |
| Response P95 | 2322.10 ms | 8024.50 ms | +5702.40 ms |
| Response P99 | 2369.00 ms | 9999.20 ms | +7630.20 ms |
| RPS (Artillery) | 302.00 | 52.00 | -250.00 |
| RPS (Autocannon) | 161.10 | 12.40 | -148.70 |
| Latency avg (Autocannon) | 61.37 ms | 765.79 ms | +704.42 ms |


## Comparison: plain-nuxt (baseline) vs i18n-micro

| Metric | plain-nuxt (baseline) | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 261.97 MB | 434.91 MB | +172.94 MB |
| Avg Memory | 171.13 MB | 292.27 MB | +121.14 MB |
| Response Avg | 329.90 ms | 398.30 ms | +68.40 ms |
| Response P95 | 2322.10 ms | 2566.30 ms | +244.20 ms |
| Response P99 | 2369.00 ms | 2618.10 ms | +249.10 ms |
| RPS (Artillery) | 302.00 | 281.00 | -21.00 |
| RPS (Autocannon) | 161.10 | 178.00 | +16.90 |
| Latency avg (Autocannon) | 61.37 ms | 55.47 ms | -5.90 ms |


## Comparison: i18n v10 vs i18n-micro

| Metric | i18n v10 | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 1739.83 MB | 434.91 MB | -1304.92 MB |
| Avg Memory | 723.74 MB | 292.27 MB | -431.47 MB |
| Response Avg | 1396.20 ms | 398.30 ms | -997.90 ms |
| Response P95 | 8024.50 ms | 2566.30 ms | -5458.20 ms |
| Response P99 | 9999.20 ms | 2618.10 ms | -7381.10 ms |
| RPS (Artillery) | 52.00 | 281.00 | +229.00 |
| RPS (Autocannon) | 12.40 | 178.00 | +165.60 |
| Latency avg (Autocannon) | 765.79 ms | 55.47 ms | -710.32 ms |


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
