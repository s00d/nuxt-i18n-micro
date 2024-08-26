import { exec, execSync, spawn } from 'node:child_process'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { dirname, join, relative } from 'node:path'
import axios from 'axios'
import { test } from '@nuxt/test-utils/playwright'
import * as cheerio from 'cheerio'

interface PerformanceResult {
  buildTime: number
  maxMemoryUsed: number
  minMemoryUsed: number
  avgMemoryUsed: number
  maxCpuUsage: number
  minCpuUsage: number
  avgCpuUsage: number
  stressTestTime?: number
  responseTimeAvg?: number
  responseTimeMin?: number
  responseTimeMax?: number
  requestsPerSecond?: number
  errorRate?: number
  successRequests?: Record<string, number>
  failedRequests?: Record<string, number>
}

async function downloadPageAndResources(url: string) {
  try {
    // Загружаем основную страницу
    const response = await axios.get(url)
    // console.log(`Main page loaded successfully: ${url}`)

    // Парсим HTML-код
    const $ = cheerio.load(response.data)

    // Извлекаем все ссылки на ресурсы, игнорируя rel="alternate"
    const resourceUrls: string[] = []
    $('link[href], script[src], img[src]').each((_, element) => {
      const src = $(element).attr('href') || $(element).attr('src')
      const rel = $(element).attr('rel')

      // Игнорируем ссылки с rel="alternate"
      if (src && rel !== 'alternate' && rel !== 'canonical') {
        const resourceUrl = new URL(src, url).href
        resourceUrls.push(resourceUrl)
      }
    })

    // Загружаем все ресурсы
    await Promise.all(resourceUrls.map(async (resourceUrl) => {
      try {
        await axios.get(resourceUrl, { responseType: 'arraybuffer' }) // Загружаем как бинарные данные
        // console.log(`Resource loaded successfully: ${resourceUrl}`)
      }
      catch (error) {
        if (error instanceof Error) {
          console.error(`Resource request to ${resourceUrl} failed: ${error.message}`)
        }
        else {
          console.error(`Resource request to ${resourceUrl} failed: ${String(error)}`)
        }
      }
    }))
  }
  catch (error) {
    if (error instanceof Error) {
      console.error(`Initial request to ${url} failed: ${error.message}`)
    }
    else {
      console.error(`Initial request to ${url} failed: ${String(error)}`)
    }
  }
}

// Получаем текущий каталог, эквивалентный __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const resultsFilePath = join(__dirname, '../docs/guide', 'performance-results.md')

// Функция для записи в MD файл
function writeToMarkdown(content: string) {
  fs.appendFileSync(resultsFilePath, content)
}

function initializeMarkdown() {
  const relativePath = relative(process.cwd(), __filename)

  const header = `---
outline: deep
---

# Performance Test Results

## Project Information

- **i18n-micro Path**: ./test/fixtures/i18n-micro
- **i18n Path**: ./test/fixtures/i18n
- **Test Script Location**: ./${relativePath}

### Description:
This performance test compares two implementations of internationalization: **i18n-micro** and **i18n**.
The main focus of the test is to evaluate build times, memory usage, CPU usage, and the performance of the server under stress (e.g., how many requests can be handled and how efficiently).
The **i18n-micro** implementation shows slightly lower overall script execution times.
This difference is attributed to its ability to handle more requests, which requires additional time for processing.

### Important Note:
It is essential to recognize that the example used in this test is not entirely representative of the intended usage pattern for **i18n-micro**. The example simplifies the translation structure by consolidating all translations into a single file. However, **i18n-micro** is optimized for scenarios where translations are organized on a per-page basis. This approach allows for more granular control and efficiency, particularly in large-scale applications. The current setup is used merely for demonstration purposes and may not fully showcase the potential performance benefits of **i18n-micro** in real-world applications.

---
`

  fs.writeFileSync(resultsFilePath, header)
}

function addTestLogicExplanation() {
  writeToMarkdown(`
## 📊 Detailed Performance Analysis

### 🔍 Test Logic Explanation

The performance tests conducted for \`Nuxt I18n Micro\` and \`nuxt-i18n\` are designed to simulate real-world usage scenarios. Below is an overview of the key aspects of the test methodology:

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
`)
}

// Инициализация файла
initializeMarkdown()

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/i18n-micro', import.meta.url)),
  },
})

function getProcessUsage(pid: number): { cpu: number, memory: number } {
  try {
    const result = execSync(`ps -p ${pid} -o %cpu,rss`).toString()
    const lines = result.trim().split('\n')
    const [cpu, memory] = lines[1].trim().split(/\s+/).map(Number.parseFloat)

    return {
      cpu: cpu || 0,
      memory: memory / 1024 || 0, // Преобразуем из KB в MB
    }
  }
  catch (error) {
    console.error('Error retrieving process usage:', error)
    return { cpu: 0, memory: 0 }
  }
}

async function measureBuildPerformance(directory: string): Promise<PerformanceResult> {
  console.log(`Starting build performance test for ${directory}...`)

  const startTime = performance.now()
  let maxCpuUsage = 0
  let minCpuUsage = Infinity
  let totalCpuUsage = 0
  let maxMemoryUsed = 0
  let minMemoryUsed = Infinity
  let totalMemoryUsage = 0
  let cpuUsageSamples = 0

  const childProcess = exec(`NODE_OPTIONS="--max-old-space-size=16000" nuxi build`, { cwd: directory })
  const pid = childProcess.pid!

  if (childProcess.stdout) {
    childProcess.stdout.on('data', (data) => {
      console.log(`[stdout]: ${data}`)
    })
  }

  if (childProcess.stderr) {
    childProcess.stderr.on('data', (data) => {
      console.error(`[stderr]: ${data}`)
    })
  }

  const monitorInterval = setInterval(() => {
    try {
      const { cpu, memory } = getProcessUsage(pid)

      maxCpuUsage = Math.max(maxCpuUsage, cpu)
      minCpuUsage = Math.min(minCpuUsage, cpu)
      totalCpuUsage += cpu
      maxMemoryUsed = Math.max(maxMemoryUsed, memory)
      minMemoryUsed = Math.min(minMemoryUsed, memory)
      totalMemoryUsage += memory
      cpuUsageSamples++

      console.log(`Current CPU: ${cpu}%, Current Memory: ${memory} MB`)
    }
    catch (error) {
      console.error('Error retrieving process usage:', error)
    }
  }, 1000)

  try {
    await new Promise<void>((resolve, reject) => {
      childProcess.on('exit', resolve)
      childProcess.on('error', reject)
    })

    const endTime = performance.now()
    const buildTime = (endTime - startTime) / 1000

    clearInterval(monitorInterval)

    const avgCpuUsage = totalCpuUsage / cpuUsageSamples
    const avgMemoryUsed = totalMemoryUsage / cpuUsageSamples

    console.log(`Build completed in: ${buildTime.toFixed(2)} seconds`)
    console.log(`Max CPU usage: ${maxCpuUsage.toFixed(2)}%`)
    console.log(`Min CPU usage: ${minCpuUsage.toFixed(2)}%`)
    console.log(`Average CPU usage: ${avgCpuUsage.toFixed(2)}%`)
    console.log(`Max Memory usage: ${maxMemoryUsed.toFixed(2)} MB`)
    console.log(`Min Memory usage: ${minMemoryUsed.toFixed(2)} MB`)
    console.log(`Average Memory usage: ${avgMemoryUsed.toFixed(2)} MB`)

    writeToMarkdown(`
## Build Performance for ${directory}

- **Build Time**: ${buildTime.toFixed(2)} seconds
- **Max CPU Usage**: ${maxCpuUsage.toFixed(2)}%
- **Min CPU Usage**: ${minCpuUsage.toFixed(2)}%
- **Average CPU Usage**: ${avgCpuUsage.toFixed(2)}%
- **Max Memory Usage**: ${maxMemoryUsed.toFixed(2)} MB
- **Min Memory Usage**: ${minMemoryUsed.toFixed(2)} MB
- **Average Memory Usage**: ${avgMemoryUsed.toFixed(2)} MB

`)

    return {
      buildTime,
      maxCpuUsage,
      minCpuUsage,
      avgCpuUsage,
      maxMemoryUsed,
      minMemoryUsed,
      avgMemoryUsed,
    }
  }
  catch (error) {
    clearInterval(monitorInterval)
    console.error('Build failed with error:', error)
    return {
      buildTime: 0,
      maxCpuUsage: 0,
      minCpuUsage: 0,
      avgCpuUsage: 0,
      maxMemoryUsed: 0,
      minMemoryUsed: 0,
      avgMemoryUsed: 0,
    }
  }
}

async function stressTestServer(directory: string): Promise<PerformanceResult> {
  console.log(`Starting server for stress test in ${directory}...`)

  const childProcess = spawn('node', ['.output/server/index.mjs'], {
    cwd: directory,
    env: { ...process.env, PORT: '10000', NODE_OPTIONS: '--max-old-space-size=16000' },
    detached: true,
  })
  const pid = childProcess.pid!
  let maxCpuUsage = 0
  let minCpuUsage = Infinity
  let totalCpuUsage = 0
  let maxMemoryUsed = 0
  let minMemoryUsed = Infinity
  let totalMemoryUsage = 0
  let cpuUsageSamples = 0
  let totalResponseTime = 0
  let responseTimeSamples = 0
  let responseTimeMin = Infinity
  let responseTimeMax = 0
  let errorCount = 0
  const successRequests: Record<string, number> = {}
  const failedRequests: Record<string, number> = {}

  const monitorInterval = setInterval(() => {
    try {
      const { cpu, memory } = getProcessUsage(pid)

      maxCpuUsage = Math.max(maxCpuUsage, cpu)
      minCpuUsage = Math.min(minCpuUsage, cpu)
      totalCpuUsage += cpu
      maxMemoryUsed = Math.max(maxMemoryUsed, memory)
      minMemoryUsed = Math.min(minMemoryUsed, memory)
      totalMemoryUsage += memory
      cpuUsageSamples++

      console.log(`[Stress Test] Current CPU: ${cpu}%, Current Memory: ${memory} MB`)
    }
    catch (error) {
      console.error('Error retrieving process usage during stress test:', error)
    }
  }, 100)

  const stressTestStartTime = performance.now() // Время начала стресс-теста

  await new Promise<void>((resolve, reject) => {
    childProcess.stdout.on('data', (data) => {
      console.log(`[Server stdout]: ${data}`)
    })

    childProcess.stderr.on('data', (data) => {
      console.error(`[Server stderr]: ${data}`)
    })

    childProcess.on('error', (error) => {
      console.error(`Error starting server: ${error}`)
      reject(error)
    })

    // Даем серверу немного времени на старт
    setTimeout(async () => {
      console.log(`Sending 1000 requests to 127.0.0.1:10000...`)
      try {
        const urls = [
          'http://127.0.0.1:10000/page',
          'http://127.0.0.1:10000/ru/page',
          'http://127.0.0.1:10000/de/page',
          'http://127.0.0.1:10000/de',
          'http://127.0.0.1:10000/ru',
          'http://127.0.0.1:10000/',
        ]

        // Предварительные запросы
        console.log('Sending initial requests to warm up the server...')
        await Promise.all(
          urls.map(url => downloadPageAndResources(url)),
        )
        console.log('Initial requests completed. Starting performance test...')

        const maxConcurrentRequests = 100 // Лимит параллельных запросов
        const totalRequestsPerUrl = 1000 // Общее количество запросов на каждый URL

        const sendLimitedRequests = async (url: string) => {
          successRequests[url] = 0
          failedRequests[url] = 0

          const sendRequest = async () => {
            try {
              const startTime = performance.now() // Или Date.now()
              await downloadPageAndResources(url)
              const endTime = performance.now() // Или Date.now()

              const responseTime = endTime - startTime // Время отклика в миллисекундах

              totalResponseTime += responseTime
              responseTimeSamples++
              responseTimeMin = Math.min(responseTimeMin, responseTime)
              responseTimeMax = Math.max(responseTimeMax, responseTime)
              successRequests[url]++
            }
            catch (error) {
              if (error instanceof Error) {
                console.error(`Request to ${url} failed: ${error.message}`)
              }
              else {
                console.error(`Request to ${url} failed: ${String(error)}`)
              }
              errorCount++
              failedRequests[url]++
            }
          }

          const requestQueue = []
          for (let i = 0; i < totalRequestsPerUrl; i++) {
            requestQueue.push(sendRequest)
          }

          for (let i = 0; i < requestQueue.length; i += maxConcurrentRequests) {
            const chunk = requestQueue.slice(i, i + maxConcurrentRequests)
            await Promise.all(chunk.map(req => req()))
            console.log(`Completed ${Math.min(i + maxConcurrentRequests, totalRequestsPerUrl)} requests to ${url}`)
          }
        }

        for (const url of urls) {
          console.log(`Sending requests to ${url}...`)
          await sendLimitedRequests(url)
        }

        resolve()
      }
      catch (error) {
        if (error instanceof Error) {
          console.error(`Overall request failed: ${error.message}`)
        }
        else {
          console.error(`Overall request failed: ${String(error)}`)
        }
        reject(error)
      }
    }, 5000)
  })

  const stressTestEndTime = performance.now() // Время окончания стресс-теста
  const stressTestTime = (stressTestEndTime - stressTestStartTime) / 1000 // Время в секундах
  const avgCpuUsage = totalCpuUsage / cpuUsageSamples
  const avgMemoryUsed = totalMemoryUsage / cpuUsageSamples
  const avgResponseTime = totalResponseTime / responseTimeSamples
  const requestsPerSecond = responseTimeSamples / stressTestTime
  const errorRate = (errorCount / (responseTimeSamples + errorCount)) * 100

  clearInterval(monitorInterval)
  process.kill(-pid) // Убиваем серверный процесс вместе с его дочерними процессами

  console.log(`Max CPU usage during stress test: ${maxCpuUsage.toFixed(2)}%`)
  console.log(`Min CPU usage during stress test: ${minCpuUsage.toFixed(2)}%`)
  console.log(`Average CPU usage during stress test: ${avgCpuUsage.toFixed(2)}%`)
  console.log(`Max Memory usage during stress test: ${maxMemoryUsed.toFixed(2)} MB`)
  console.log(`Min Memory usage during stress test: ${minMemoryUsed.toFixed(2)} MB`)
  console.log(`Average Memory usage during stress test: ${avgMemoryUsed.toFixed(2)} MB`)
  console.log(`Stress test completed in: ${stressTestTime.toFixed(2)} seconds`)
  console.log(`Average Response Time: ${avgResponseTime.toFixed(2)} ms`)
  console.log(`Min Response Time: ${responseTimeMin.toFixed(2)} ms`)
  console.log(`Max Response Time: ${responseTimeMax.toFixed(2)} ms`)
  console.log(`Requests per Second: ${requestsPerSecond.toFixed(2)}`)
  console.log(`Error Rate: ${errorRate.toFixed(2)}%`)

  for (const url of Object.keys(successRequests)) {
    console.log(`${url} - Success: ${successRequests[url]}, Failed: ${failedRequests[url]}`)
  }

  writeToMarkdown(`
## Stress Test for ${directory}

- **Max CPU Usage During Stress Test**: ${maxCpuUsage.toFixed(2)}%
- **Min CPU Usage During Stress Test**: ${minCpuUsage.toFixed(2)}%
- **Average CPU Usage During Stress Test**: ${avgCpuUsage.toFixed(2)}%
- **Max Memory Usage During Stress Test**: ${maxMemoryUsed.toFixed(2)} MB
- **Min Memory Usage During Stress Test**: ${minMemoryUsed.toFixed(2)} MB
- **Average Memory Usage During Stress Test**: ${avgMemoryUsed.toFixed(2)} MB
- **Stress Test Time**: ${stressTestTime.toFixed(2)} seconds
- **Average Response Time**: ${avgResponseTime.toFixed(2)} ms
- **Min Response Time**: ${responseTimeMin.toFixed(2)} ms
- **Max Response Time**: ${responseTimeMax.toFixed(2)} ms
- **Requests per Second**: ${requestsPerSecond.toFixed(2)}
- **Error Rate**: ${errorRate.toFixed(2)}%
`)

  return {
    buildTime: stressTestTime,
    maxCpuUsage,
    minCpuUsage,
    avgCpuUsage,
    maxMemoryUsed,
    minMemoryUsed,
    avgMemoryUsed,
    responseTimeAvg: avgResponseTime,
    responseTimeMin,
    responseTimeMax,
    requestsPerSecond,
    errorRate,
    successRequests,
    failedRequests,
  }
}

test('compare build performance and stress test', async () => {
  test.setTimeout(1600000)

  const i18nResults = await measureBuildPerformance('./test/fixtures/i18n')
  const i18nNextResults = await measureBuildPerformance('./test/fixtures/i18n-micro')

  console.log('\nPerformance Comparison:')
  console.log('--------------------------')
  console.log(`i18n-micro: ${i18nNextResults.buildTime.toFixed(2)} seconds, Max Memory: ${i18nNextResults.maxMemoryUsed.toFixed(2)} MB, Max CPU: ${i18nNextResults.maxCpuUsage.toFixed(2)}%`)
  console.log(`i18n: ${i18nResults.buildTime.toFixed(2)} seconds, Max Memory: ${i18nResults.maxMemoryUsed.toFixed(2)} MB, Max CPU: ${i18nResults.maxCpuUsage.toFixed(2)}%`)

  const timeDifference = i18nNextResults.buildTime - i18nResults.buildTime
  const memoryDifference = i18nNextResults.maxMemoryUsed - i18nResults.maxMemoryUsed
  const cpuDifference = i18nNextResults.maxCpuUsage - i18nResults.maxCpuUsage

  console.log('\nComparison Results:')
  console.log('--------------------------')
  console.log(`Time difference: ${timeDifference.toFixed(2)} seconds`)
  console.log(`Memory difference: ${memoryDifference.toFixed(2)} MB`)
  console.log(`CPU usage difference: ${cpuDifference.toFixed(2)}%`)

  writeToMarkdown(`
### ⏱️ Build Time and Resource Consumption

::: details **i18n**
- **Build Time**: ${i18nResults.buildTime.toFixed(2)} seconds
- **Max CPU Usage**: ${i18nResults.maxCpuUsage.toFixed(2)}%
- **Max Memory Usage**: ${i18nResults.maxMemoryUsed.toFixed(2)} MB
:::

::: details **i18n-micro**
- **Build Time**: ${i18nNextResults.buildTime.toFixed(2)} seconds
- **Max CPU Usage**: ${i18nNextResults.maxCpuUsage.toFixed(2)}%
- **Max Memory Usage**: ${i18nNextResults.maxMemoryUsed.toFixed(2)} MB
:::
`)

  writeToMarkdown(`
## Performance Comparison

- **i18n-micro**: ${i18nNextResults.buildTime.toFixed(2)} seconds, Max Memory: ${i18nNextResults.maxMemoryUsed.toFixed(2)} MB, Max CPU: ${i18nNextResults.maxCpuUsage.toFixed(2)}%
- **i18n**: ${i18nResults.buildTime.toFixed(2)} seconds, Max Memory: ${i18nResults.maxMemoryUsed.toFixed(2)} MB, Max CPU: ${i18nResults.maxCpuUsage.toFixed(2)}%
- **Time Difference**: ${timeDifference.toFixed(2)} seconds
- **Memory Difference**: ${memoryDifference.toFixed(2)} MB
- **CPU Usage Difference**: ${cpuDifference.toFixed(2)}%
`)

  const i18nStressResults = await stressTestServer('./test/fixtures/i18n')
  const i18nNextStressResults = await stressTestServer('./test/fixtures/i18n-micro')

  const stressTestTimeDifference = i18nNextStressResults.buildTime! - i18nStressResults.buildTime!
  const stressTestMemoryDifference = i18nNextStressResults.maxMemoryUsed - i18nStressResults.maxMemoryUsed
  const stressTestCpuDifference = i18nNextStressResults.maxCpuUsage - i18nStressResults.maxCpuUsage

  const totalSuccessRequestsNext = Object.values(i18nNextStressResults.successRequests!).reduce((acc, value) => acc + value, 0)
  const totalFailedRequestsNext = Object.values(i18nNextStressResults.failedRequests!).reduce((acc, value) => acc + value, 0)
  const totalSuccessRequests = Object.values(i18nStressResults.successRequests!).reduce((acc, value) => acc + value, 0)
  const totalFailedRequests = Object.values(i18nStressResults.failedRequests!).reduce((acc, value) => acc + value, 0)

  const totalSuccessDifference = totalSuccessRequestsNext - totalSuccessRequests
  const totalFailedDifference = totalFailedRequestsNext - totalFailedRequests

  const avgRequestTimeNext = i18nNextStressResults.responseTimeAvg!
  const avgRequestTime = i18nStressResults.responseTimeAvg!
  const avgRequestTimeDifference = avgRequestTimeNext - avgRequestTime

  const specificRoute = 'http://127.0.0.1:10000/page' // Выбираем роут для анализа

  const totalRequestsNextForSpecificRoute = i18nNextStressResults.successRequests![specificRoute] + i18nNextStressResults.failedRequests![specificRoute]
  const totalRequestsForSpecificRoute = i18nStressResults.successRequests![specificRoute] + i18nStressResults.failedRequests![specificRoute]

  const avgTotalRequestTimeNextForSpecificRoute = (i18nNextStressResults.buildTime! / totalRequestsNextForSpecificRoute) * 1000
  const avgTotalRequestTimeForSpecificRoute = (i18nStressResults.buildTime! / totalRequestsForSpecificRoute) * 1000
  const avgTotalRequestTimeDifferenceForSpecificRoute = avgTotalRequestTimeNextForSpecificRoute - avgTotalRequestTimeForSpecificRoute

  writeToMarkdown(`
## Stress Test Comparison

- **i18n-micro Stress Test**: Max Memory: ${i18nNextStressResults.maxMemoryUsed.toFixed(2)} MB, Max CPU: ${i18nNextStressResults.maxCpuUsage.toFixed(2)}%, Time: ${i18nNextStressResults.buildTime!.toFixed(2)} seconds
- **i18n Stress Test**: Max Memory: ${i18nStressResults.maxMemoryUsed.toFixed(2)} MB, Max CPU: ${i18nStressResults.maxCpuUsage.toFixed(2)}%, Time: ${i18nStressResults.buildTime!.toFixed(2)} seconds

- **Time Difference**: ${stressTestTimeDifference.toFixed(2)} seconds
- **Memory Difference**: ${stressTestMemoryDifference.toFixed(2)} MB
- **CPU Usage Difference**: ${stressTestCpuDifference.toFixed(2)}%
- **Response Time Difference**: ${avgRequestTimeDifference.toFixed(2)} ms
- **Error Rate Difference**: ${(i18nNextStressResults.errorRate! - i18nStressResults.errorRate!).toFixed(2)}%

### Total Requests Comparison

- **Total Successful Requests Difference**: ${totalSuccessDifference}
- **Total Failed Requests Difference**: ${totalFailedDifference}

### Average Request Time Comparison

- **Average Request Time (i18n-micro)**: ${avgRequestTimeNext.toFixed(2)} ms
- **Average Request Time (i18n)**: ${avgRequestTime.toFixed(2)} ms
- **Average Request Time Difference**: ${avgRequestTimeDifference.toFixed(2)} ms

### Average Total Time Per 1000 Requests (for ${specificRoute})

- **Average Time per 1000 Requests (i18n-micro) for ${specificRoute}**: ${avgTotalRequestTimeNextForSpecificRoute.toFixed(2)} ms
- **Average Time per 1000 Requests (i18n) for ${specificRoute}**: ${avgTotalRequestTimeForSpecificRoute.toFixed(2)} ms
- **Average Time per 1000 Requests Difference for ${specificRoute}**: ${avgTotalRequestTimeDifferenceForSpecificRoute.toFixed(2)} ms
`)

  addTestLogicExplanation()
})
