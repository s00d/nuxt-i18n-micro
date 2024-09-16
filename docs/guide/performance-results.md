---
outline: deep
---

# Performance Test Results

## Project Information

- **[i18n-micro Path](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n-micro)**: ./test/fixtures/i18n-micro
- **[i18n Path](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n)**: ./test/fixtures/i18n
- **[Test Script Location](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/performance.test.ts)**: ./test/performance.test.ts


### Description:
This performance test compares two implementations of internationalization: **i18n-micro** and **i18n**.
The main focus of the test is to evaluate build times, memory usage, CPU usage, and the performance of the server under stress (e.g., how many requests can be handled and how efficiently).
The **i18n-micro** implementation shows slightly lower overall script execution times.
This difference is attributed to its ability to handle more requests, which requires additional time for processing.

### Important Note:
It is essential to recognize that the example used in this test is not entirely representative of the intended usage pattern for **i18n-micro**. The example simplifies the translation structure by consolidating all translations into a single file. However, **i18n-micro** is optimized for scenarios where translations are organized on a per-page basis. This approach allows for more granular control and efficiency, particularly in large-scale applications. The current setup is used merely for demonstration purposes and may not fully showcase the potential performance benefits of **i18n-micro** in real-world applications.

---

## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 6.29 seconds
- **Max CPU Usage**: 185.60%
- **Min CPU Usage**: 84.60%
- **Average CPU Usage**: 146.67%
- **Max Memory Usage**: 1082.77 MB
- **Min Memory Usage**: 172.28 MB
- **Average Memory Usage**: 511.04 MB
-
## Build Performance for ./test/fixtures/i18n

- **Build Time**: 88.02 seconds
- **Max CPU Usage**: 384.40%
- **Min CPU Usage**: 84.70%
- **Average CPU Usage**: 144.63%
- **Max Memory Usage**: 9610.03 MB
- **Min Memory Usage**: 196.80 MB
- **Average Memory Usage**: 3642.73 MB



### ⏱️ Build Time and Resource Consumption

::: details **i18n**
- **Build Time**: 88.02 seconds
- **Max CPU Usage**: 384.40%
- **Max Memory Usage**: 9610.03 MB
  :::

::: details **i18n-micro**
- **Build Time**: 6.29 seconds
- **Max CPU Usage**: 185.60%
- **Max Memory Usage**: 1082.77 MB
  :::

## Performance Comparison

- **i18n-micro**: 6.29 seconds, Max Memory: 1082.77 MB, Max CPU: 185.60%
- **i18n**: 88.02 seconds, Max Memory: 9610.03 MB, Max CPU: 384.40%
- **Time Difference**: -81.73 seconds
- **Memory Difference**: -8527.27 MB
- **CPU Usage Difference**: -198.80%

## Stress Test with Artillery for ./test/fixtures/i18n

- **Max CPU Usage**: 155.10%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 95.97%
- **Max Memory Usage**: 801.61 MB
- **Min Memory Usage**: 49.72 MB
- **Average Memory Usage**: 592.90 MB
- **Stress Test Time**: 69.38 seconds
- **Average Response Time**: 439.40 ms
- **Min Response Time**: 1.00 ms
- **Max Response Time**: 2994.00 ms
- **Requests per Second**: 281.00
- **Error Rate**: 0.00%

## Stress Test with Artillery for ./test/fixtures/i18n-micro

- **Max CPU Usage**: 130.70%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 91.83%
- **Max Memory Usage**: 344.05 MB
- **Min Memory Usage**: 48.22 MB
- **Average Memory Usage**: 288.08 MB
- **Stress Test Time**: 68.58 seconds
- **Average Response Time**: 364.80 ms
- **Min Response Time**: 0.00 ms
- **Max Response Time**: 2483.00 ms
- **Requests per Second**: 311.00
- **Error Rate**: 0.00%

## Comparison between i18n and i18n-micro

- **Max Memory Used Difference**: -457.56 MB
- **Min Memory Used Difference**: -1.50 MB
- **Avg Memory Used Difference**: -304.82 MB
- **Max CPU Usage Difference**: -24.40%
- **Min CPU Usage Difference**: 0.00%
- **Avg CPU Usage Difference**: -4.14%
- **Stress Test Time Difference**: 0.00 seconds
- **Average Response Time Difference**: -74.60 ms
- **Min Response Time Difference**: -1.00 ms
- **Max Response Time Difference**: -511.00 ms
- **Requests Per Second Difference**: 30.00
- **Error Rate Difference**: 0.00%

## 📊 Detailed Performance Analysis

### 🔍 Test Logic Explanation

The performance tests conducted for `Nuxt I18n Micro` and `nuxt-i18n` are designed to simulate real-world usage scenarios. Below is an overview of the key aspects of the test methodology:

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
