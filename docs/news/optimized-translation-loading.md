---
outline: deep
---

[<< back](/news/)

## Optimized Translation Loading Algorithm Released

**Date**: 2025-01-10

**Version Introduced**: `v1.58.0`

![Optimized Loading Demo](/optimized-loading.png)

We are thrilled to announce the release of a **new algorithm for loading translations** in Nuxt I18n Micro. This update introduces significant performance improvements, a cleaner architecture, and more efficient memory usage.

### What’s New?

The new translation-loading algorithm focuses on:
1. **Optimized File Merging**: Enhanced the deep merge functionality to handle translations more efficiently.
2. **Caching Enhancements**: Leveraged server storage for pre-rendered translations, reducing redundant computations.
3. **Streamlined Code**: Simplified file paths and structure for better maintainability.

---

### Key Benefits

#### **1. Faster Build Times**
The new algorithm reduces build times by efficiently handling translation files and minimizing memory overhead.

- **Old Build Time**: 7.20 seconds
- **New Build Time**: 6.91 seconds
- **Improvement**: **4.03% faster**

#### **2. Reduced CPU Usage**
Lower maximum and average CPU usage during builds and stress tests:

- **Build Max CPU**: From **257.60%** → **198.20%** (23.06% lower)
- **Stress Test Avg CPU**: From **93.85%** → **89.14%** (5.01% lower)

#### **3. Lower Memory Usage**
Memory consumption has been significantly optimized across builds and runtime stress tests:

- **Build Max Memory**: From **1286.00 MB** → **885.19 MB** (31.15% lower)
- **Stress Test Max Memory**: From **624.22 MB** → **429.52 MB** (31.20% lower)

#### **4. Enhanced Response Times**
Stress test response times saw drastic improvement:

- **Average Response Time**: From **411.50 ms** → **9.30 ms** (97.74% faster)
- **Max Response Time**: From **2723.00 ms** → **187.00 ms** (93.13% faster)

#### **5. Increased Request Throughput**
The new algorithm boosts the number of handled requests per second:

- **Requests per Second**: From **288.00** → **305.00** (5.90% increase)

---

### Why It’s Important

Localization is essential for global applications, and improving translation-loading performance can have a direct impact on:
- **User Experience**: Faster response times lead to a smoother user experience.
- **Scalability**: Lower resource usage allows better handling of high traffic.
- **Developer Productivity**: Reduced build times and a simplified codebase streamline workflows.

---

### How It Works

1. **Efficient Deep Merging**
- The algorithm has been rewritten to handle translation merging more intelligently, ensuring minimal memory overhead and faster operations.

2. **Smart Caching**
- Server-side storage is now used to cache translations during pre-rendering, which are then reused during runtime. This avoids repetitive reads and merges.

3. **Streamlined File Loading**
- Translation files are loaded in a more predictable and maintainable way by unifying fallback handling and caching.
