---
outline: deep
---

# Performance Test Results

## Project Information

- **[i18n-micro Path](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n-micro)**: ./test/fixtures/i18n-micro
- **[i18n Path](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n)**: ./test/fixtures/i18n
- **[Test Script Location](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/performance.spec.ts)**: ./test/performance.spec.ts


### Description:
This performance test compares two implementations of internationalization: **i18n-micro** and **i18n**.
The main focus of the test is to evaluate build times, memory usage, CPU usage, and the performance of the server under stress (e.g., how many requests can be handled and how efficiently).
The **i18n-micro** implementation shows slightly lower overall script execution times.
This difference is attributed to its ability to handle more requests, which requires additional time for processing.

### Important Note:
It is essential to recognize that the example used in this test is not entirely representative of the intended usage pattern for **i18n-micro**. The example simplifies the translation structure by consolidating all translations into a single file. However, **i18n-micro** is optimized for scenarios where translations are organized on a per-page basis. This approach allows for more granular control and efficiency, particularly in large-scale applications. The current setup is used merely for demonstration purposes and may not fully showcase the potential performance benefits of **i18n-micro** in real-world applications.

---

## Dependency Versions

| Dependency      | Version  |
|-----------------|----------|
| node            | v20.18.3 |
| nuxt            | ^3.15.4  |
| nuxt-i18n-micro | 1.86.0   |
| @nuxtjs/i18n    | ^9.2.0   |

## Build Performance for ./test/fixtures/i18n

- **Build Time**: 18.79 seconds
- **Max CPU Usage**: 211.90%
- **Min CPU Usage**: 26.00%
- **Average CPU Usage**: 114.31%
- **Max Memory Usage**: 3196.33 MB
- **Min Memory Usage**: 213.42 MB
- **Average Memory Usage**: 1445.22 MB


## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 8.83 seconds
- **Max CPU Usage**: 203.90%
- **Min CPU Usage**: 61.40%
- **Average CPU Usage**: 135.88%
- **Max Memory Usage**: 975.77 MB
- **Min Memory Usage**: 170.16 MB
- **Average Memory Usage**: 602.83 MB


### ⏱️ Build Time and Resource Consumption

::: details **i18n v9**
- **Build Time**: 18.79 seconds
- **Max CPU Usage**: 211.90%
- **Max Memory Usage**: 3196.33 MB
  :::

::: details **i18n-micro**
- **Build Time**: 8.83 seconds
- **Max CPU Usage**: 203.90%
- **Max Memory Usage**: 975.77 MB
  :::

## Performance Comparison

- **i18n-micro**: 8.83 seconds, Max Memory: 975.77 MB, Max CPU: 203.90%
- **i18n v9**: 18.79 seconds, Max Memory: 3196.33 MB, Max CPU: 211.90%
- **Time Difference**: -9.96 seconds
- **Memory Difference**: -2220.56 MB
- **CPU Usage Difference**: -8.00%

## Stress Test with Artillery for ./test/fixtures/i18n

- **Max CPU Usage**: 155.00%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 121.04%
- **Max Memory Usage**: 544.16 MB
- **Min Memory Usage**: 52.20 MB
- **Average Memory Usage**: 338.24 MB
- **Stress Test Time**: 75.98 seconds
- **Average Response Time**: 1595.80 ms
- **Min Response Time**: 40.00 ms
- **Max Response Time**: 9998.00 ms
- **Requests per Second**: 69.00
- **Error Rate**: 0.00%

![i18n](/i18n.png)

## Stress Test with Artillery for ./test/fixtures/i18n-micro

- **Max CPU Usage**: 126.50%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 91.16%
- **Max Memory Usage**: 390.03 MB
- **Min Memory Usage**: 52.09 MB
- **Average Memory Usage**: 316.31 MB
- **Stress Test Time**: 68.60 seconds
- **Average Response Time**: 392.40 ms
- **Min Response Time**: 1.00 ms
- **Max Response Time**: 2670.00 ms
- **Requests per Second**: 288.00
- **Error Rate**: 0.00%

![i18n-micro](/i18n-micro.png)

## Comparison between i18n v9 and i18n-micro

- **Max Memory Used Difference**: -154.13 MB
- **Min Memory Used Difference**: -0.11 MB
- **Avg Memory Used Difference**: -21.93 MB
- **Max CPU Usage Difference**: -28.50%
- **Min CPU Usage Difference**: 0.00%
- **Avg CPU Usage Difference**: -29.88%
- **Stress Test Time Difference**: 0.00 seconds
- **Average Response Time Difference**: -1203.40 ms
- **Min Response Time Difference**: -39.00 ms
- **Max Response Time Difference**: -7328.00 ms
- **Requests Per Second Difference**: 219.00
- **Error Rate Difference**: 0.00%

## 📊 Detailed Performance Analysis

### 🔍 Test Logic Explanation

The performance tests conducted for `Nuxt I18n Micro` and `nuxt-i18n` v9 are designed to simulate real-world usage scenarios. Below is an overview of the key aspects of the test methodology:

1. **Build Time**: Measures the time required to build the project, focusing on how efficiently each module handles large translation files.
2. **CPU Usage**: Tracks the CPU load during the build and stress tests to assess the impact on server resources.
3. **Memory Usage**: Monitors memory consumption to determine how each module manages memory, especially under high load.
4. **Stress Testing**: Simulates a series of requests to evaluate the server's ability to handle concurrent traffic. The test is divided into two phases:
  - **Warm-up Phase**: Over 6 seconds, one request per second is sent to each of the specified URLs, with a maximum of 6 users, to ensure that the server is ready for the main test.
  - **Main Test Phase**: For 60 seconds, the server is subjected to 60 requests per second, spread across various endpoints, to measure response times, error rates, and overall throughput under load.


### 🛠 Why This Approach?

The chosen testing methodology is designed to reflect the scenarios that developers are likely to encounter in production environments. By focusing on build time, CPU and memory usage, and server performance under load, the tests provide a comprehensive view of how each module will perform in a large-scale, high-traffic application.

**Nuxt I18n Micro** is optimized for:
- **Faster Build Times**: By reducing the overhead during the build process.
- **Lower Resource Consumption**: Minimizing CPU and memory usage, making it suitable for resource-constrained environments.
- **Better Handling of Large Projects**: With a focus on scalability, ensuring that applications remain responsive even as they grow.
