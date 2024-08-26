---
outline: deep
---

# Performance Test Results

## Project Information

- **i18n-micro Path**: ./test/fixtures/i18n-micro
- **i18n Path**: ./test/fixtures/i18n
- **Test Script Location**: ./test/performance.test.ts

### Description:
This performance test compares two implementations of internationalization: **i18n-micro** and **i18n**.
The main focus of the test is to evaluate build times, memory usage, CPU usage, and the performance of the server under stress (e.g., how many requests can be handled and how efficiently).
The **i18n-micro** implementation shows slightly lower overall script execution times.
This difference is attributed to its ability to handle more requests, which requires additional time for processing.

### Important Note:
It is essential to recognize that the example used in this test is not entirely representative of the intended usage pattern for **i18n-micro**. The example simplifies the translation structure by consolidating all translations into a single file. However, **i18n-micro** is optimized for scenarios where translations are organized on a per-page basis. This approach allows for more granular control and efficiency, particularly in large-scale applications. The current setup is used merely for demonstration purposes and may not fully showcase the potential performance benefits of **i18n-micro** in real-world applications.

---

## Build Performance for ./test/fixtures/i18n-micro

- **Build Time**: 7.76 seconds
- **Max CPU Usage**: 178.00%
- **Min CPU Usage**: 101.70%
- **Average CPU Usage**: 142.23%
- **Max Memory Usage**: 1176.38 MB
- **Min Memory Usage**: 194.41 MB
- **Average Memory Usage**: 670.34 MB


## Build Performance for ./test/fixtures/i18n

- **Build Time**: 96.57 seconds
- **Max CPU Usage**: 400.80%
- **Min CPU Usage**: 52.00%
- **Average CPU Usage**: 141.14%
- **Max Memory Usage**: 8511.80 MB
- **Min Memory Usage**: 198.84 MB
- **Average Memory Usage**: 3928.12 MB


### ⏱️ Build Time and Resource Consumption

::: details **i18n**
- **Build Time**: 96.57 seconds
- **Max CPU Usage**: 400.80%
- **Max Memory Usage**: 8511.80 MB
  :::

::: details **i18n-micro**
- **Build Time**: 7.76 seconds
- **Max CPU Usage**: 178.00%
- **Max Memory Usage**: 1176.38 MB
  :::

## Performance Comparison

- **i18n-micro**: 7.76 seconds, Max Memory: 1176.38 MB, Max CPU: 178.00%
- **i18n**: 96.57 seconds, Max Memory: 8511.80 MB, Max CPU: 400.80%
- **Time Difference**: -88.81 seconds
- **Memory Difference**: -7335.42 MB
- **CPU Usage Difference**: -222.80%

## Stress Test for ./test/fixtures/i18n-micro

- **Max CPU Usage During Stress Test**: 145.30%
- **Min CPU Usage During Stress Test**: 0.00%
- **Average CPU Usage During Stress Test**: 65.61%
- **Max Memory Usage During Stress Test**: 539.98 MB
- **Min Memory Usage During Stress Test**: 49.41 MB
- **Average Memory Usage During Stress Test**: 315.98 MB
- **Stress Test Time**: 113.72 seconds
- **Average Response Time**: 1662.08 ms
- **Min Response Time**: 174.79 ms
- **Max Response Time**: 3976.34 ms
- **Requests per Second**: 52.76
- **Error Rate**: 0.00%

## Stress Test for ./test/fixtures/i18n

- **Max CPU Usage During Stress Test**: 200.70%
- **Min CPU Usage During Stress Test**: 0.00%
- **Average CPU Usage During Stress Test**: 34.59%
- **Max Memory Usage During Stress Test**: 979.86 MB
- **Min Memory Usage During Stress Test**: 49.73 MB
- **Average Memory Usage During Stress Test**: 510.21 MB
- **Stress Test Time**: 200.05 seconds
- **Average Response Time**: 2264.46 ms
- **Min Response Time**: 68.52 ms
- **Max Response Time**: 26139.35 ms
- **Requests per Second**: 29.99
- **Error Rate**: 0.00%

## Stress Test Comparison

- **i18n-micro Stress Test**: Max Memory: 539.98 MB, Max CPU: 145.30%, Time: 113.72 seconds
- **i18n Stress Test**: Max Memory: 979.86 MB, Max CPU: 200.70%, Time: 200.05 seconds

- **Time Difference**: -86.32 seconds
- **Memory Difference**: -439.88 MB
- **CPU Usage Difference**: -55.40%
- **Response Time Difference**: -602.38 ms
- **Error Rate Difference**: 0.00%

### Total Requests Comparison

- **Total Successful Requests Difference**: 0
- **Total Failed Requests Difference**: 0

### Average Request Time Comparison

- **Average Request Time (i18n-micro)**: 1662.08 ms
- **Average Request Time (i18n)**: 2264.46 ms
- **Average Request Time Difference**: -602.38 ms

### Average Total Time Per 1000 Requests (for http://127.0.0.1:9999/page)

- **Average Time per 1000 Requests (i18n-micro) for http://127.0.0.1:9999/page**: 113.72 ms
- **Average Time per 1000 Requests (i18n) for http://127.0.0.1:9999/page**: 200.05 ms
- **Average Time per 1000 Requests Difference for http://127.0.0.1:9999/page**: -86.32 ms

## 📊 Detailed Performance Analysis

### 🔍 Test Logic Explanation

The performance tests conducted for `Nuxt I18n Micro` and `nuxt-i18n` are designed to simulate real-world usage scenarios. Below is an overview of the key aspects of the test methodology:

1. **Build Time**: Measures the time required to build the project, focusing on how efficiently each module handles large translation files.
2. **CPU Usage**: Tracks the CPU load during the build and stress tests to assess the impact on server resources.
3. **Memory Usage**: Monitors memory consumption to determine how each module manages memory, especially under high load.
4. **Stress Testing**: Simulates 10,000 requests to evaluate the server's ability to handle concurrent requests, measuring response times, error rates, and overall throughput.

### 🛠 Why This Approach?

The chosen testing methodology is designed to reflect the scenarios that developers are likely to encounter in production environments. By focusing on build time, CPU and memory usage, and server performance under load, the tests provide a comprehensive view of how each module will perform in a large-scale, high-traffic application.

**Nuxt I18n Micro** is optimized for:
- **Faster Build Times**: By reducing the overhead during the build process.
- **Lower Resource Consumption**: Minimizing CPU and memory usage, making it suitable for resource-constrained environments.
- **Better Handling of Large Projects**: With a focus on scalability, ensuring that applications remain responsive even as they grow.
