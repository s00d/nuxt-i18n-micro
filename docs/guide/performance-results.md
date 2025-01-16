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
| nuxt                       | ^3.15.2 |
| nuxt-i18n-micro                       | 1.61.0 |
| @nuxtjs/i18n                       | ^9.1.1 |
  
## Build Performance for ./test/fixtures/i18n

- **Build Time**: 12.13 seconds
- **Max CPU Usage**: 238.50%
- **Min CPU Usage**: 102.20%
- **Average CPU Usage**: 162.78%
- **Max Memory Usage**: 3861.34 MB
- **Min Memory Usage**: 236.42 MB
- **Average Memory Usage**: 1711.20 MB


## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 6.74 seconds
- **Max CPU Usage**: 219.10%
- **Min CPU Usage**: 109.80%
- **Average CPU Usage**: 182.48%
- **Max Memory Usage**: 904.44 MB
- **Min Memory Usage**: 184.36 MB
- **Average Memory Usage**: 561.61 MB


### ⏱️ Build Time and Resource Consumption

::: details **i18n v9**
- **Build Time**: 12.13 seconds
- **Max CPU Usage**: 238.50%
- **Max Memory Usage**: 3861.34 MB
:::

::: details **i18n-micro**
- **Build Time**: 6.74 seconds
- **Max CPU Usage**: 219.10%
- **Max Memory Usage**: 904.44 MB
:::

## Performance Comparison

- **i18n-micro**: 6.74 seconds, Max Memory: 904.44 MB, Max CPU: 219.10%
- **i18n v9**: 12.13 seconds, Max Memory: 3861.34 MB, Max CPU: 238.50%
- **Time Difference**: -5.39 seconds
- **Memory Difference**: -2956.91 MB
- **CPU Usage Difference**: -19.40%

## Stress Test with Artillery for ./test/fixtures/i18n

- **Max CPU Usage**: 167.10%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 132.55%
- **Max Memory Usage**: 768.11 MB
- **Min Memory Usage**: 48.50 MB
- **Average Memory Usage**: 393.92 MB
- **Stress Test Time**: 75.49 seconds
- **Average Response Time**: 1509.70 ms
- **Min Response Time**: 52.00 ms
- **Max Response Time**: 9939.00 ms
- **Requests per Second**: 63.00
- **Error Rate**: 0.00%

![i18n](/i18n.png)
    
## Stress Test with Artillery for ./test/fixtures/i18n-micro

- **Max CPU Usage**: 137.20%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 94.44%
- **Max Memory Usage**: 506.72 MB
- **Min Memory Usage**: 49.98 MB
- **Average Memory Usage**: 302.81 MB
- **Stress Test Time**: 68.42 seconds
- **Average Response Time**: 408.50 ms
- **Min Response Time**: 1.00 ms
- **Max Response Time**: 2721.00 ms
- **Requests per Second**: 285.00
- **Error Rate**: 0.00%

![i18n-micro](/i18n-micro.png)
    
## Comparison between i18n v9 and i18n-micro

- **Max Memory Used Difference**: -261.39 MB
- **Min Memory Used Difference**: 1.48 MB
- **Avg Memory Used Difference**: -91.11 MB
- **Max CPU Usage Difference**: -29.90%
- **Min CPU Usage Difference**: 0.00%
- **Avg CPU Usage Difference**: -38.11%
- **Stress Test Time Difference**: 0.00 seconds
- **Average Response Time Difference**: -1101.20 ms
- **Min Response Time Difference**: -51.00 ms
- **Max Response Time Difference**: -7218.00 ms
- **Requests Per Second Difference**: 222.00
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
