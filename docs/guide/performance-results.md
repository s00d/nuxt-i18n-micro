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

| Dependency                   | Version   |
|-------------------------------|-----------|
| node                       | v20.18.0 |
| nuxt                       | ^3.15.2 |
| nuxt-i18n-micro                       | 1.64.0 |
| @nuxtjs/i18n                       | ^9.1.1 |
  
## Build Performance for ./test/fixtures/i18n

- **Build Time**: 11.81 seconds
- **Max CPU Usage**: 254.40%
- **Min CPU Usage**: 96.40%
- **Average CPU Usage**: 161.34%
- **Max Memory Usage**: 2712.61 MB
- **Min Memory Usage**: 158.28 MB
- **Average Memory Usage**: 1237.77 MB


## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 6.33 seconds
- **Max CPU Usage**: 242.60%
- **Min CPU Usage**: 104.50%
- **Average CPU Usage**: 188.80%
- **Max Memory Usage**: 1141.00 MB
- **Min Memory Usage**: 206.86 MB
- **Average Memory Usage**: 624.47 MB


### ⏱️ Build Time and Resource Consumption

::: details **i18n v9**
- **Build Time**: 11.81 seconds
- **Max CPU Usage**: 254.40%
- **Max Memory Usage**: 2712.61 MB
:::

::: details **i18n-micro**
- **Build Time**: 6.33 seconds
- **Max CPU Usage**: 242.60%
- **Max Memory Usage**: 1141.00 MB
:::

## Performance Comparison

- **i18n-micro**: 6.33 seconds, Max Memory: 1141.00 MB, Max CPU: 242.60%
- **i18n v9**: 11.81 seconds, Max Memory: 2712.61 MB, Max CPU: 254.40%
- **Time Difference**: -5.48 seconds
- **Memory Difference**: -1571.61 MB
- **CPU Usage Difference**: -11.80%

## Stress Test with Artillery for ./test/fixtures/i18n

- **Max CPU Usage**: 166.30%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 128.52%
- **Max Memory Usage**: 662.83 MB
- **Min Memory Usage**: 46.97 MB
- **Average Memory Usage**: 386.11 MB
- **Stress Test Time**: 75.47 seconds
- **Average Response Time**: 1502.80 ms
- **Min Response Time**: 44.00 ms
- **Max Response Time**: 9968.00 ms
- **Requests per Second**: 67.00
- **Error Rate**: 0.00%

![i18n](/i18n.png)
    
## Stress Test with Artillery for ./test/fixtures/i18n-micro

- **Max CPU Usage**: 126.20%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 93.08%
- **Max Memory Usage**: 373.84 MB
- **Min Memory Usage**: 49.44 MB
- **Average Memory Usage**: 284.87 MB
- **Stress Test Time**: 68.46 seconds
- **Average Response Time**: 390.40 ms
- **Min Response Time**: 1.00 ms
- **Max Response Time**: 2720.00 ms
- **Requests per Second**: 282.00
- **Error Rate**: 0.00%

![i18n-micro](/i18n-micro.png)
    
## Comparison between i18n v9 and i18n-micro

- **Max Memory Used Difference**: -288.98 MB
- **Min Memory Used Difference**: 2.47 MB
- **Avg Memory Used Difference**: -101.24 MB
- **Max CPU Usage Difference**: -40.10%
- **Min CPU Usage Difference**: 0.00%
- **Avg CPU Usage Difference**: -35.44%
- **Stress Test Time Difference**: 0.00 seconds
- **Average Response Time Difference**: -1112.40 ms
- **Min Response Time Difference**: -43.00 ms
- **Max Response Time Difference**: -7248.00 ms
- **Requests Per Second Difference**: 215.00
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
