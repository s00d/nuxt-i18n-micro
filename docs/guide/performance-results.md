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

## Dependency Versions

| Dependency                   | Version   |
|-------------------------------|-----------|
| node                       | v20.18.0 |
| nuxt                       | 3.13.2 |
| nuxt-i18n-micro                       | 1.40.0 |
| @nuxtjs/i18n                       | ^9.1.1 |
  
## Build Performance for ./test/fixtures/i18n

- **Build Time**: 24.59 seconds
- **Max CPU Usage**: 335.70%
- **Min CPU Usage**: 24.10%
- **Average CPU Usage**: 133.44%
- **Max Memory Usage**: 4596.75 MB
- **Min Memory Usage**: 196.06 MB
- **Average Memory Usage**: 1798.99 MB


## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 8.02 seconds
- **Max CPU Usage**: 195.60%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 134.38%
- **Max Memory Usage**: 856.83 MB
- **Min Memory Usage**: 0.00 MB
- **Average Memory Usage**: 460.37 MB


### ⏱️ Build Time and Resource Consumption

::: details **i18n v9**
- **Build Time**: 24.59 seconds
- **Max CPU Usage**: 335.70%
- **Max Memory Usage**: 4596.75 MB
:::

::: details **i18n-micro**
- **Build Time**: 8.02 seconds
- **Max CPU Usage**: 195.60%
- **Max Memory Usage**: 856.83 MB
:::

## Performance Comparison

- **i18n-micro**: 8.02 seconds, Max Memory: 856.83 MB, Max CPU: 195.60%
- **i18n v9**: 24.59 seconds, Max Memory: 4596.75 MB, Max CPU: 335.70%
- **Time Difference**: -16.57 seconds
- **Memory Difference**: -3739.92 MB
- **CPU Usage Difference**: -140.10%

## Stress Test with Artillery for ./test/fixtures/i18n

- **Max CPU Usage**: 166.20%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 101.23%
- **Max Memory Usage**: 918.52 MB
- **Min Memory Usage**: 49.56 MB
- **Average Memory Usage**: 408.41 MB
- **Stress Test Time**: 75.44 seconds
- **Average Response Time**: 1917.50 ms
- **Min Response Time**: 78.00 ms
- **Max Response Time**: 10001.00 ms
- **Requests per Second**: 57.00
- **Error Rate**: 0.00%
    
## Stress Test with Artillery for ./test/fixtures/i18n-micro

- **Max CPU Usage**: 125.70%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 85.79%
- **Max Memory Usage**: 378.39 MB
- **Min Memory Usage**: 49.64 MB
- **Average Memory Usage**: 299.23 MB
- **Stress Test Time**: 69.82 seconds
- **Average Response Time**: 470.00 ms
- **Min Response Time**: 1.00 ms
- **Max Response Time**: 4122.00 ms
- **Requests per Second**: 267.00
- **Error Rate**: 0.00%
    
## Comparison between i18n v9 and i18n-micro

- **Max Memory Used Difference**: -540.13 MB
- **Min Memory Used Difference**: 0.08 MB
- **Avg Memory Used Difference**: -109.19 MB
- **Max CPU Usage Difference**: -40.50%
- **Min CPU Usage Difference**: 0.00%
- **Avg CPU Usage Difference**: -15.43%
- **Stress Test Time Difference**: 0.00 seconds
- **Average Response Time Difference**: -1447.50 ms
- **Min Response Time Difference**: -77.00 ms
- **Max Response Time Difference**: -5879.00 ms
- **Requests Per Second Difference**: 210.00
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
