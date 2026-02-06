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

- **Build Time**: 5.73 seconds
- **Bundle Size**: 1.93 MB (client: 194.8 KB, server: 1.74 MB)
- **Max CPU Usage**: 234.20%
- **Min CPU Usage**: 116.00%
- **Average CPU Usage**: 170.84%
- **Max Memory Usage**: 680.14 MB
- **Min Memory Usage**: 206.30 MB
- **Average Memory Usage**: 425.63 MB


## Build Performance for ./test/fixtures/i18n

- **Build Time**: 79.40 seconds
- **Bundle Size**: 57.29 MB (client: 17.13 MB, server: 40.17 MB)
- **Max CPU Usage**: 433.30%
- **Min CPU Usage**: 31.90%
- **Average CPU Usage**: 148.25%
- **Max Memory Usage**: 8147.00 MB
- **Min Memory Usage**: 276.59 MB
- **Average Memory Usage**: 3930.35 MB


## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 17.93 seconds
- **Bundle Size**: 62.47 MB (client: 28.12 MB, server: 34.35 MB)
- **Max CPU Usage**: 228.20%
- **Min CPU Usage**: 14.70%
- **Average CPU Usage**: 78.02%
- **Max Memory Usage**: 1617.66 MB
- **Min Memory Usage**: 205.02 MB
- **Average Memory Usage**: 914.72 MB


## Build Performance Summary

| Project | Build Time | Bundle Size | Client | Server |
|---------|------------|-------------|--------|--------|
| **plain-nuxt** (baseline) | 5.73s | 1.93 MB | 194.8 KB | 1.74 MB |
| **i18n v10** | 79.40s | 57.29 MB | 17.13 MB | 40.17 MB |
| **i18n-micro** | 17.93s | 62.47 MB | 28.12 MB | 34.35 MB |

### Build Time Comparison

```chart
url: /charts/build-time-comparison.js
height: 350px
```

### Bundle Size Comparison

```chart
url: /charts/bundle-size-comparison.js
height: 350px
```

- **i18n v10 vs baseline**: 55.37 MB larger
- **i18n-micro vs baseline**: 60.55 MB larger
- **i18n-micro vs i18n v10**: 5.18 MB larger


## Stress Test Results for plain-nuxt

### Resource Usage
- **Max CPU Usage**: 136.10%
- **Average CPU Usage**: 91.85%
- **Max Memory Usage**: 265.05 MB
- **Average Memory Usage**: 211.94 MB

### Artillery Results
- **Test Duration**: 68.59 seconds
- **Requests per Second**: 296.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 353.10 ms |
| Min | 0.00 ms |
| Max | 2472.00 ms |
| P50 | 34.80 ms |
| P95 | 2369.00 ms |
| P99 | 2416.80 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 170.10 |
| Latency avg | 58.22 ms |
| Latency P50 | 55.00 ms |
| Latency P95 | 98.00 ms |
| Latency P99 | 115.00 ms |
| Latency max | 224.00 ms |
| Throughput | 52.74 MB/s |
| Errors | 0 |


#### 📊 Load Summary - plain-nuxt

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **3,493** completed | **296** | **339** |
|:---:|:---:|:---:|:---:|
| vusers created | 96.07% / 3.93% failed | average req/s | peak req/s |

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
| Invalid Date | 36 req/s | 9 ms | 0 | 6 |
| Invalid Date | 240 req/s | 573 ms | 56 | 339 |
| Invalid Date | 336 req/s | 1353 ms | 49 | 600 |
| Invalid Date | 334 req/s | 2144 ms | 52 | 600 |
| Invalid Date | 337 req/s | 2369 ms | 31 | 600 |
| Invalid Date | 339 req/s | 2369 ms | 6 | 600 |
| Invalid Date | 334 req/s | 2417 ms | 4 | 600 |
| Invalid Date | 315 req/s | 2417 ms | 0 | 291 |


</details>


## Stress Test Results for i18n

### Resource Usage
- **Max CPU Usage**: 167.90%
- **Average CPU Usage**: 122.88%
- **Max Memory Usage**: 1017.23 MB
- **Average Memory Usage**: 716.14 MB

### Artillery Results
- **Test Duration**: 75.41 seconds
- **Requests per Second**: 51.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 1140.40 ms |
| Min | 14.00 ms |
| Max | 9819.00 ms |
| P50 | 632.80 ms |
| P95 | 5065.60 ms |
| P99 | 8692.80 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 12.00 |
| Latency avg | 793.45 ms |
| Latency P50 | 779.00 ms |
| Latency P95 | 1603.00 ms |
| Latency P99 | 2300.00 ms |
| Latency max | 2643.00 ms |
| Throughput | 3.8 MB/s |
| Errors | 0 |


#### 📊 Load Summary - i18n

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **52** completed | **51** | **68** |
|:---:|:---:|:---:|:---:|
| vusers created | 1.43% / 98.57% failed | average req/s | peak req/s |

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
| Invalid Date | 23 req/s | 925 ms | 17 | 17 |
| Invalid Date | 66 req/s | 3906 ms | 405 | 436 |
| Invalid Date | 68 req/s | 8352 ms | 59 | 600 |
| Invalid Date | 60 req/s | 0 ms | 10 | 600 |
| Invalid Date | 60 req/s | 0 ms | 4 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 600 |
| Invalid Date | 60 req/s | 0 ms | 0 | 183 |
| Invalid Date | 0 req/s | 0 ms | 0 | 0 |


</details>


## Stress Test Results for i18n-micro

### Resource Usage
- **Max CPU Usage**: 137.60%
- **Average CPU Usage**: 90.89%
- **Max Memory Usage**: 499.31 MB
- **Average Memory Usage**: 297.72 MB

### Artillery Results
- **Test Duration**: 69.44 seconds
- **Requests per Second**: 290.00
- **Error Rate**: 0.00%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | 414.50 ms |
| Min | 0.00 ms |
| Max | 2756.00 ms |
| P50 | 37.70 ms |
| P95 | 2618.10 ms |
| P99 | 2671.00 ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | 175.80 |
| Latency avg | 56.20 ms |
| Latency P50 | 49.00 ms |
| Latency P95 | 100.00 ms |
| Latency P99 | 108.00 ms |
| Latency max | 241.00 ms |
| Throughput | 55.73 MB/s |
| Errors | 0 |


#### 📊 Load Summary - i18n-micro

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **3,636** | **3,191** completed | **290** | **309** |
|:---:|:---:|:---:|:---:|
| vusers created | 87.76% / 12.24% failed | average req/s | peak req/s |

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
| Invalid Date | 196 req/s | 327 ms | 43 | 213 |
| Invalid Date | 300 req/s | 1940 ms | 117 | 600 |
| Invalid Date | 305 req/s | 2671 ms | 85 | 600 |
| Invalid Date | 308 req/s | 2671 ms | 1 | 600 |
| Invalid Date | 307 req/s | 2618 ms | 2 | 600 |
| Invalid Date | 309 req/s | 2618 ms | 2 | 600 |
| Invalid Date | 297 req/s | 2618 ms | 0 | 423 |
| Invalid Date | 286 req/s | 2417 ms | 0 | 0 |


</details>


## Stress Test Summary

### Artillery Results
| Project | Avg Response | P95 | P99 | RPS | Error Rate |
|---------|--------------|-----|-----|-----|------------|
| **plain-nuxt** | 353.10 ms | 2369.00 ms | 2416.80 ms | 296.00 | 0.00% |
| **i18n v10** | 1140.40 ms | 5065.60 ms | 8692.80 ms | 51.00 | 0.00% |
| **i18n-micro** | 414.50 ms | 2618.10 ms | 2671.00 ms | 290.00 | 0.00% |

### Autocannon Results (10 connections, 10s)
| Project | Avg Latency | P50 | P95 | P99 | Max | RPS |
|---------|-------------|-----|-----|-----|-----|-----|
| **plain-nuxt** | 58.22 ms | 55.00 ms | 98.00 ms | 115.00 ms | 224.00 ms | 170.10 |
| **i18n v10** | 793.45 ms | 779.00 ms | 1603.00 ms | 2300.00 ms | 2643.00 ms | 12.00 |
| **i18n-micro** | 56.20 ms | 49.00 ms | 100.00 ms | 108.00 ms | 241.00 ms | 175.80 |


## 🏆 Performance Comparison

### Throughput (Requests per Second)

> **Winner: i18n-micro** with 176 RPS

```chart
url: /charts/comparison-rps-autocannon.js
height: 350px
```

```chart
url: /charts/comparison-rps-artillery.js
height: 350px
```

### Latency Distribution

> **Winner: i18n-micro** with 56.20 ms avg latency

```chart
url: /charts/comparison-latency.js
height: 350px
```

### Quick Comparison

| Metric | **plain-nuxt** | **i18n-v10** | **i18n-micro** | Best |
|--------|---|---|---|------|
| RPS (Autocannon) | 170 | 12 | 176 | i18n-micro |
| Avg Latency | 58.22 ms | 793.45 ms | 56.20 ms | i18n-micro |
| P99 Latency | 115.00 ms | 2300.00 ms | 108.00 ms | i18n-micro |
| Errors | 0 | 0 | 0 | - |



## Comparison: plain-nuxt (baseline) vs i18n v10

| Metric | plain-nuxt (baseline) | i18n v10 | Difference |
|--------|----------|----------|------------|
| Max Memory | 265.05 MB | 1017.23 MB | +752.19 MB |
| Avg Memory | 211.94 MB | 716.14 MB | +504.20 MB |
| Response Avg | 353.10 ms | 1140.40 ms | +787.30 ms |
| Response P95 | 2369.00 ms | 5065.60 ms | +2696.60 ms |
| Response P99 | 2416.80 ms | 8692.80 ms | +6276.00 ms |
| RPS (Artillery) | 296.00 | 51.00 | -245.00 |
| RPS (Autocannon) | 170.10 | 12.00 | -158.10 |
| Latency avg (Autocannon) | 58.22 ms | 793.45 ms | +735.23 ms |


## Comparison: plain-nuxt (baseline) vs i18n-micro

| Metric | plain-nuxt (baseline) | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 265.05 MB | 499.31 MB | +234.27 MB |
| Avg Memory | 211.94 MB | 297.72 MB | +85.78 MB |
| Response Avg | 353.10 ms | 414.50 ms | +61.40 ms |
| Response P95 | 2369.00 ms | 2618.10 ms | +249.10 ms |
| Response P99 | 2416.80 ms | 2671.00 ms | +254.20 ms |
| RPS (Artillery) | 296.00 | 290.00 | -6.00 |
| RPS (Autocannon) | 170.10 | 175.80 | +5.70 |
| Latency avg (Autocannon) | 58.22 ms | 56.20 ms | -2.02 ms |


## Comparison: i18n v10 vs i18n-micro

| Metric | i18n v10 | i18n-micro | Difference |
|--------|----------|----------|------------|
| Max Memory | 1017.23 MB | 499.31 MB | -517.92 MB |
| Avg Memory | 716.14 MB | 297.72 MB | -418.42 MB |
| Response Avg | 1140.40 ms | 414.50 ms | -725.90 ms |
| Response P95 | 5065.60 ms | 2618.10 ms | -2447.50 ms |
| Response P99 | 8692.80 ms | 2671.00 ms | -6021.80 ms |
| RPS (Artillery) | 51.00 | 290.00 | +239.00 |
| RPS (Autocannon) | 12.00 | 175.80 | +163.80 |
| Latency avg (Autocannon) | 793.45 ms | 56.20 ms | -737.25 ms |


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
