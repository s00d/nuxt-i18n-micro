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

> **Note:** The `plain-nuxt` baseline is a minimal implementation created solely for benchmarking purposes. It loads data directly from JSON files without any i18n logic. Real-world applications will have more complexity and higher resource usage.

---

## Dependency Versions

| Dependency                   | Version   |
|-------------------------------|-----------|
| node                       | v20.19.6 |
| nuxt                       | N/A |
| nuxt-i18n-micro                       | 2.20.1 |
| @nuxtjs/i18n                       | catalog: |
  
## Build Performance for ./test/fixtures/plain-nuxt

- **Build Time**: 4.48 seconds
- **Max CPU Usage**: 242.60%
- **Min CPU Usage**: 132.10%
- **Average CPU Usage**: 205.47%
- **Max Memory Usage**: 609.55 MB
- **Min Memory Usage**: 239.28 MB
- **Average Memory Usage**: 436.70 MB


## Build Performance for ./test/fixtures/i18n

- **Build Time**: 77.81 seconds
- **Max CPU Usage**: 449.00%
- **Min CPU Usage**: 31.40%
- **Average CPU Usage**: 149.33%
- **Max Memory Usage**: 9494.69 MB
- **Min Memory Usage**: 272.47 MB
- **Average Memory Usage**: 4295.30 MB


## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 7.88 seconds
- **Max CPU Usage**: 336.00%
- **Min CPU Usage**: 117.80%
- **Average CPU Usage**: 190.91%
- **Max Memory Usage**: 1164.02 MB
- **Min Memory Usage**: 206.38 MB
- **Average Memory Usage**: 654.24 MB


### ⏱️ Build Time and Resource Consumption

::: details **plain-nuxt (baseline)**
- **Build Time**: 4.48 seconds
- **Max CPU Usage**: 242.60%
- **Max Memory Usage**: 609.55 MB
:::

::: details **i18n v10**
- **Build Time**: 77.81 seconds
- **Max CPU Usage**: 449.00%
- **Max Memory Usage**: 9494.69 MB
:::

::: details **i18n-micro**
- **Build Time**: 7.88 seconds
- **Max CPU Usage**: 336.00%
- **Max Memory Usage**: 1164.02 MB
:::

## Performance Comparison

| Project | Build Time | Max Memory | Max CPU |
|---------|------------|------------|---------|
| **plain-nuxt** (baseline) | 4.48 seconds | 609.55 MB | 242.60% |
| **i18n v10** | 77.81 seconds | 9494.69 MB | 449.00% |
| **i18n-micro** | 7.88 seconds | 1164.02 MB | 336.00% |

- **i18n v10 vs baseline**: +73.33s build, +8885.14 MB memory
- **i18n-micro vs baseline**: +3.40s build, +554.47 MB memory

## Stress Test with Artillery for ./test/fixtures/plain-nuxt

- **Max CPU Usage**: 126.00%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 71.47%
- **Max Memory Usage**: 229.02 MB
- **Min Memory Usage**: 64.16 MB
- **Average Memory Usage**: 180.41 MB
- **Stress Test Time**: 69.03 seconds
- **Average Response Time**: 106.50 ms
- **Min Response Time**: 0.00 ms
- **Max Response Time**: 5471.00 ms
- **Requests per Second**: 318.00
- **Error Rate**: 0.00%

![plain-nuxt](/plain-nuxt.png)
    
## Stress Test with Artillery for ./test/fixtures/i18n

- **Max CPU Usage**: 174.30%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 131.41%
- **Max Memory Usage**: 1050.38 MB
- **Min Memory Usage**: 266.27 MB
- **Average Memory Usage**: 761.49 MB
- **Stress Test Time**: 75.41 seconds
- **Average Response Time**: 1130.20 ms
- **Min Response Time**: 18.00 ms
- **Max Response Time**: 9759.00 ms
- **Requests per Second**: 51.00
- **Error Rate**: 0.00%

![i18n](/i18n.png)
    
## Stress Test with Artillery for ./test/fixtures/i18n-micro

- **Max CPU Usage**: 125.70%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 96.04%
- **Max Memory Usage**: 366.69 MB
- **Min Memory Usage**: 139.13 MB
- **Average Memory Usage**: 313.24 MB
- **Stress Test Time**: 71.92 seconds
- **Average Response Time**: 516.70 ms
- **Min Response Time**: 1.00 ms
- **Max Response Time**: 3762.00 ms
- **Requests per Second**: 225.00
- **Error Rate**: 0.00%

![i18n-micro](/i18n-micro.png)
    
## Stress Test Comparison

| Project | Avg Response | RPS | Error Rate |
|---------|--------------|-----|------------|
| **plain-nuxt** | 106.50 ms | 318.00 | 0.00% |
| **i18n v10** | 1130.20 ms | 51.00 | 0.00% |
| **i18n-micro** | 516.70 ms | 225.00 | 0.00% |

## Comparison between plain-nuxt (baseline) and i18n v10

- **Max Memory Used Difference**: 821.36 MB
- **Min Memory Used Difference**: 202.11 MB
- **Avg Memory Used Difference**: 581.07 MB
- **Max CPU Usage Difference**: 48.30%
- **Min CPU Usage Difference**: 0.00%
- **Avg CPU Usage Difference**: 59.95%
- **Stress Test Time Difference**: 6.38 seconds
- **Average Response Time Difference**: 1023.70 ms
- **Min Response Time Difference**: 18.00 ms
- **Max Response Time Difference**: 4288.00 ms
- **Requests Per Second Difference**: -267.00
- **Error Rate Difference**: 0.00%
  
## Comparison between plain-nuxt (baseline) and i18n-micro

- **Max Memory Used Difference**: 137.67 MB
- **Min Memory Used Difference**: 74.97 MB
- **Avg Memory Used Difference**: 132.82 MB
- **Max CPU Usage Difference**: -0.30%
- **Min CPU Usage Difference**: 0.00%
- **Avg CPU Usage Difference**: 24.57%
- **Stress Test Time Difference**: 2.89 seconds
- **Average Response Time Difference**: 410.20 ms
- **Min Response Time Difference**: 1.00 ms
- **Max Response Time Difference**: -1709.00 ms
- **Requests Per Second Difference**: -93.00
- **Error Rate Difference**: 0.00%
  
## Comparison between i18n v10 and i18n-micro

- **Max Memory Used Difference**: -683.69 MB
- **Min Memory Used Difference**: -127.14 MB
- **Avg Memory Used Difference**: -448.25 MB
- **Max CPU Usage Difference**: -48.60%
- **Min CPU Usage Difference**: 0.00%
- **Avg CPU Usage Difference**: -35.38%
- **Stress Test Time Difference**: -3.49 seconds
- **Average Response Time Difference**: -613.50 ms
- **Min Response Time Difference**: -17.00 ms
- **Max Response Time Difference**: -5997.00 ms
- **Requests Per Second Difference**: 174.00
- **Error Rate Difference**: 0.00%
  
## 📊 Detailed Performance Analysis

### 🔍 Test Logic Explanation

The performance tests compare **plain-nuxt** (baseline), **Nuxt I18n Micro**, and **nuxt-i18n** v10. The **plain-nuxt** fixture loads data directly from JSON files without any i18n module, providing a baseline for measuring i18n overhead.

1. **Build Time**: Measures the time required to build each project. Plain-nuxt shows the baseline; i18n modules add overhead for translation processing.
2. **CPU Usage**: Tracks CPU load during build and stress tests.
3. **Memory Usage**: Monitors memory consumption. Plain-nuxt establishes the baseline; i18n modules increase memory usage.
4. **Stress Testing**: Simulates concurrent traffic. Plain-nuxt uses `/` and `/page`; i18n fixtures use locale-prefixed routes (`/`, `/ru`, `/de`, `/page`, etc.).
   - **Warm-up Phase**: 6 seconds, 6 users.
   - **Main Test Phase**: 60 seconds, 60 requests/second.

### 🛠 Why This Approach?

By including a **plain-nuxt** baseline, we can quantify the overhead of each i18n solution. **Nuxt I18n Micro** is optimized for:
- **Faster Build Times**: Lower overhead than nuxt-i18n.
- **Lower Resource Consumption**: Closer to plain-nuxt baseline.
- **Better Scalability**: Per-page translations for large applications.
