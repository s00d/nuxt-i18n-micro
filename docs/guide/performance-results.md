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
| node                       | v20.19.4 |
| nuxt                       | N/A |
| nuxt-i18n-micro                       | 2.3.0 |
| @nuxtjs/i18n                       | ^10.1.2 |
  
## Build Performance for ./test/fixtures/i18n

- **Build Time**: 63.26 seconds
- **Max CPU Usage**: 440.90%
- **Min CPU Usage**: 28.30%
- **Average CPU Usage**: 158.40%
- **Max Memory Usage**: 7743.72 MB
- **Min Memory Usage**: 228.67 MB
- **Average Memory Usage**: 3691.65 MB


## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 7.18 seconds
- **Max CPU Usage**: 222.40%
- **Min CPU Usage**: 111.80%
- **Average CPU Usage**: 182.87%
- **Max Memory Usage**: 1299.05 MB
- **Min Memory Usage**: 221.77 MB
- **Average Memory Usage**: 714.67 MB


### ⏱️ Build Time and Resource Consumption

::: details **i18n v10**
- **Build Time**: 63.26 seconds
- **Max CPU Usage**: 440.90%
- **Max Memory Usage**: 7743.72 MB
:::

::: details **i18n-micro**
- **Build Time**: 7.18 seconds
- **Max CPU Usage**: 222.40%
- **Max Memory Usage**: 1299.05 MB
:::

## Performance Comparison

- **i18n-micro**: 7.18 seconds, Max Memory: 1299.05 MB, Max CPU: 222.40%
- **i18n v10**: 63.26 seconds, Max Memory: 7743.72 MB, Max CPU: 440.90%
- **Time Difference**: -56.09 seconds
- **Memory Difference**: -6444.67 MB
- **CPU Usage Difference**: -218.50%

## Stress Test with Artillery for ./test/fixtures/i18n

- **Max CPU Usage**: 163.10%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 135.44%
- **Max Memory Usage**: 1011.53 MB
- **Min Memory Usage**: 270.72 MB
- **Average Memory Usage**: 741.74 MB
- **Stress Test Time**: 75.42 seconds
- **Average Response Time**: 1880.10 ms
- **Min Response Time**: 16.00 ms
- **Max Response Time**: 9999.00 ms
- **Requests per Second**: 52.00
- **Error Rate**: 0.00%

![i18n](/i18n.png)
    
## Stress Test with Artillery for ./test/fixtures/i18n-micro

- **Max CPU Usage**: 147.20%
- **Min CPU Usage**: 0.00%
- **Average CPU Usage**: 133.68%
- **Max Memory Usage**: 940.45 MB
- **Min Memory Usage**: 190.61 MB
- **Average Memory Usage**: 748.56 MB
- **Stress Test Time**: 75.41 seconds
- **Average Response Time**: 2036.50 ms
- **Min Response Time**: 16.00 ms
- **Max Response Time**: 9880.00 ms
- **Requests per Second**: 53.00
- **Error Rate**: 0.00%

![i18n-micro](/i18n-micro.png)
    
## Comparison between i18n v10 and i18n-micro

- **Max Memory Used Difference**: -71.08 MB
- **Min Memory Used Difference**: -80.11 MB
- **Avg Memory Used Difference**: 6.82 MB
- **Max CPU Usage Difference**: -15.90%
- **Min CPU Usage Difference**: 0.00%
- **Avg CPU Usage Difference**: -1.77%
- **Stress Test Time Difference**: -0.00 seconds
- **Average Response Time Difference**: 156.40 ms
- **Min Response Time Difference**: 0.00 ms
- **Max Response Time Difference**: -119.00 ms
- **Requests Per Second Difference**: 1.00
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
