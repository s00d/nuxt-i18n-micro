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

- **Build Time**: 20.12 seconds
- **Max CPU Usage**: 187.00%
- **Min CPU Usage**: 20.30%
- **Average CPU Usage**: 98.24%
- **Max Memory Usage**: 2819.25 MB
- **Min Memory Usage**: 182.17 MB
- **Average Memory Usage**: 1265.44 MB


## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 7.55 seconds
- **Max CPU Usage**: 239.10%
- **Min CPU Usage**: 95.90%
- **Average CPU Usage**: 174.60%
- **Max Memory Usage**: 1155.53 MB
- **Min Memory Usage**: 176.36 MB
- **Average Memory Usage**: 618.83 MB


### ⏱️ Build Time and Resource Consumption

::: details **i18n v9**
- **Build Time**: 20.12 seconds
- **Max CPU Usage**: 187.00%
- **Max Memory Usage**: 2819.25 MB
:::

::: details **i18n-micro**
- **Build Time**: 7.55 seconds
- **Max CPU Usage**: 239.10%
- **Max Memory Usage**: 1155.53 MB
:::

## Performance Comparison

- **i18n-micro**: 7.55 seconds, Max Memory: 1155.53 MB, Max CPU: 239.10%
- **i18n v9**: 20.12 seconds, Max Memory: 2819.25 MB, Max CPU: 187.00%
- **Time Difference**: -12.57 seconds
- **Memory Difference**: -1663.72 MB
- **CPU Usage Difference**: 52.10%

## Stress Test with Artillery for ./test/fixtures/i18n

- **Max CPU Usage**: 174.50%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 129.58%
- **Max Memory Usage**: 796.69 MB
- **Min Memory Usage**: 48.44 MB
- **Average Memory Usage**: 387.15 MB
- **Stress Test Time**: 75.72 seconds
- **Average Response Time**: 1547.10 ms
- **Min Response Time**: 70.00 ms
- **Max Response Time**: 9965.00 ms
- **Requests per Second**: 73.00
- **Error Rate**: 0.00%

![i18n](/i18n.png)
    
## Stress Test with Artillery for ./test/fixtures/i18n-micro

- **Max CPU Usage**: 127.00%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 89.23%
- **Max Memory Usage**: 355.58 MB
- **Min Memory Usage**: 48.09 MB
- **Average Memory Usage**: 291.41 MB
- **Stress Test Time**: 68.11 seconds
- **Average Response Time**: 422.90 ms
- **Min Response Time**: 1.00 ms
- **Max Response Time**: 3055.00 ms
- **Requests per Second**: 291.00
- **Error Rate**: 0.00%

![i18n-micro](/i18n-micro.png)
    
## Comparison between i18n v9 and i18n-micro

- **Max Memory Used Difference**: -441.11 MB
- **Min Memory Used Difference**: -0.34 MB
- **Avg Memory Used Difference**: -95.74 MB
- **Max CPU Usage Difference**: -47.50%
- **Min CPU Usage Difference**: 0.00%
- **Avg CPU Usage Difference**: -40.34%
- **Stress Test Time Difference**: 0.00 seconds
- **Average Response Time Difference**: -1124.20 ms
- **Min Response Time Difference**: -69.00 ms
- **Max Response Time Difference**: -6910.00 ms
- **Requests Per Second Difference**: 218.00
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
