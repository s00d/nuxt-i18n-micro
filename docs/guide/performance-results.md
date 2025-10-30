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
| node            | v20.19.4 |
| nuxt            | N/A      |
| nuxt-i18n-micro | 1.103.0  |
| @nuxtjs/i18n    | ^10.1.2  |
  
## Build Performance for ./test/fixtures/i18n

- **Build Time**: 79.75 seconds
- **Max CPU Usage**: 492.00%
- **Min CPU Usage**: 34.60%
- **Average CPU Usage**: 160.95%
- **Max Memory Usage**: 8619.39 MB
- **Min Memory Usage**: 211.05 MB
- **Average Memory Usage**: 4195.56 MB


## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 6.51 seconds
- **Max CPU Usage**: 252.40%
- **Min CPU Usage**: 113.70%
- **Average CPU Usage**: 187.15%
- **Max Memory Usage**: 1226.69 MB
- **Min Memory Usage**: 203.63 MB
- **Average Memory Usage**: 650.08 MB


### ⏱️ Build Time and Resource Consumption

::: details **i18n v10**
- **Build Time**: 79.75 seconds
- **Max CPU Usage**: 492.00%
- **Max Memory Usage**: 8619.39 MB
:::

::: details **i18n-micro**
- **Build Time**: 6.51 seconds
- **Max CPU Usage**: 252.40%
- **Max Memory Usage**: 1226.69 MB
:::

## Performance Comparison

- **i18n-micro**: 6.51 seconds, Max Memory: 1226.69 MB, Max CPU: 252.40%
- **i18n v10**: 79.75 seconds, Max Memory: 8619.39 MB, Max CPU: 492.00%
- **Time Difference**: -73.23 seconds
- **Memory Difference**: -7392.70 MB
- **CPU Usage Difference**: -239.60%

## Stress Test with Artillery for ./test/fixtures/i18n

- **Max CPU Usage**: 165.60%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 123.59%
- **Max Memory Usage**: 1021.88 MB
- **Min Memory Usage**: 51.55 MB
- **Average Memory Usage**: 715.71 MB
- **Stress Test Time**: 75.43 seconds
- **Average Response Time**: 1503.50 ms
- **Min Response Time**: 44.00 ms
- **Max Response Time**: 9991.00 ms
- **Requests per Second**: 51.00
- **Error Rate**: 0.00%

![i18n](/i18n.png)
    
## Stress Test with Artillery for ./test/fixtures/i18n-micro

- **Max CPU Usage**: 150.90%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 127.36%
- **Max Memory Usage**: 914.27 MB
- **Min Memory Usage**: 50.22 MB
- **Average Memory Usage**: 701.38 MB
- **Stress Test Time**: 75.42 seconds
- **Average Response Time**: 2743.30 ms
- **Min Response Time**: 156.00 ms
- **Max Response Time**: 9938.00 ms
- **Requests per Second**: 54.00
- **Error Rate**: 0.00%

![i18n-micro](/i18n-micro.png)
    
## Comparison between i18n v10 and i18n-micro

- **Max Memory Used Difference**: -107.61 MB
- **Min Memory Used Difference**: -1.33 MB
- **Avg Memory Used Difference**: -14.33 MB
- **Max CPU Usage Difference**: -14.70%
- **Min CPU Usage Difference**: 0.00%
- **Avg CPU Usage Difference**: 3.76%
- **Stress Test Time Difference**: 0.00 seconds
- **Average Response Time Difference**: 1239.80 ms
- **Min Response Time Difference**: 112.00 ms
- **Max Response Time Difference**: -53.00 ms
- **Requests Per Second Difference**: 3.00
- **Error Rate Difference**: 0.00%
  
## 📊 Detailed Performance Analysis

### 🔍 Test Logic Explanation

The performance tests conducted for `Nuxt I18n Micro` and `nuxt-i18n` v10 are designed to simulate real-world usage scenarios. Below is an overview of the key aspects of the test methodology:

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
