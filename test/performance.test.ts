import { exec, execSync, spawn } from 'node:child_process'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import path, { dirname, join, relative } from 'node:path'
import { test } from '@nuxt/test-utils/playwright'

interface ArtillerySummary {
  min: number
  max: number
  count: number
  mean: number
  p50: number
  median: number
  p75: number
  p90: number
  p95: number
  p99: number
  p999: number
}

interface ArtilleryCounters {
  [key: string]: number | undefined
  'vusers.created_by_name.0': number
  'vusers.created': number
  'http.requests': number
  'http.codes.200': number
  'http.responses': number
  'http.downloaded_bytes': number
  'vusers.failed': number
  'vusers.completed': number
}

interface ArtilleryRates {
  [key: string]: number | undefined
  'http.request_rate': number
}

interface ArtilleryAggregate {
  counters: ArtilleryCounters
  rates: ArtilleryRates
  firstCounterAt: number
  firstHistogramAt: number
  lastCounterAt: number
  lastHistogramAt: number
  firstMetricAt: number
  lastMetricAt: number
  period: number
  summaries: {
    [key: string]: ArtillerySummary
  }
  histograms: {
    [key: string]: ArtillerySummary
  }
}

interface ArtilleryResult {
  aggregate: ArtilleryAggregate
  intermediate?: ArtilleryIntermediate[]
}

interface ArtilleryIntermediate {
  counters: {
    [key: string]: number
  }
  rates: {
    [key: string]: number | null
  }
  firstCounterAt: number
  firstHistogramAt: number
  lastCounterAt: number
  lastHistogramAt: number
  firstMetricAt: number
  lastMetricAt: number
  period: string
  summaries: {
    [key: string]: ArtillerySummary
  }
  histograms: {
    [key: string]: ArtillerySummary
  }
}

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

// Получаем текущий каталог, эквивалентный __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const resultsFilePath = join(__dirname, '../docs/guide', 'performance-results.md')

// Функция для записи в MD файл
function writeToMarkdown(content: string) {
  fs.appendFileSync(resultsFilePath, content)
}

// Чтение версии из package.json
function getVersion(packagePath: string, key: string, subkey: string | null = null) {
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    if (subkey) {
      return packageJson[key]?.[subkey] || 'N/A'
    }
    return packageJson[key] || 'N/A'
  }
  return 'N/A'
}

// Пути к package.json
const rootPackagePath = path.resolve(__dirname, '../package.json')
const i18nPackagePath = path.resolve(__dirname, 'fixtures/i18n/package.json')

// Добавление раздела версий зависимостей в конечный MD-файл
function addDependencyVersions() {
  const dependencies = {
    'node': process.version,
    'nuxt': getVersion(rootPackagePath, 'devDependencies', 'nuxt'),
    'nuxt-i18n-micro': getVersion(rootPackagePath, 'version'),
    '@nuxtjs/i18n': getVersion(i18nPackagePath, 'devDependencies', '@nuxtjs/i18n'),
  }

  const dependencySection = `
## Dependency Versions

| Dependency                   | Version   |
|-------------------------------|-----------|
${Object.entries(dependencies).map(([dep, version]) => `| ${dep}                       | ${version} |`).join('\n')}
  `

  writeToMarkdown(dependencySection)
}

function initializeMarkdown() {
  const relativePath = relative(process.cwd(), __filename)

  const header = `---
outline: deep
---

# Performance Test Results

## Project Information

- **[i18n-micro Path](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n-micro)**: ./test/fixtures/i18n-micro
- **[i18n Path](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n)**: ./test/fixtures/i18n
- **[Test Script Location](https://github.com/s00d/nuxt-i18n-micro/tree/main/${relativePath})**: ./${relativePath}


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

The performance tests conducted for \`Nuxt I18n Micro\` and \`nuxt-i18n\` v9 are designed to simulate real-world usage scenarios. Below is an overview of the key aspects of the test methodology:

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
`)
}

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

async function runArtilleryTest(configPath: string): Promise<ArtilleryResult> {
  return new Promise((resolve, reject) => {
    exec(`npx artillery run ${configPath} --output artillery-output.json`, (error, stdout) => {
      if (error) {
        console.error(`Artillery test failed: ${error.message}`)
        return reject(error)
      }
      console.log(`Artillery test completed successfully:\n${stdout}`)
      fs.readFile('artillery-output.json', 'utf8', (err, data) => {
        if (err) {
          console.error(`Error reading Artillery output: ${err.message}`)
          return reject(err)
        }
        resolve(JSON.parse(data))
      })
    })
  })
}

function logAndWriteComparisonResults(name1: string, name2: string, result1: PerformanceResult, result2: PerformanceResult) {
  const comparisons = {
    maxMemoryUsedDifference: result2.maxMemoryUsed - result1.maxMemoryUsed,
    minMemoryUsedDifference: result2.minMemoryUsed - result1.minMemoryUsed,
    avgMemoryUsedDifference: result2.avgMemoryUsed - result1.avgMemoryUsed,
    maxCpuUsageDifference: result2.maxCpuUsage - result1.maxCpuUsage,
    minCpuUsageDifference: result2.minCpuUsage - result1.minCpuUsage,
    avgCpuUsageDifference: result2.avgCpuUsage - result1.avgCpuUsage,
    stressTestTimeDifference: (result2.stressTestTime || 0) - (result1.stressTestTime || 0),
    responseTimeAvgDifference: (result2.responseTimeAvg || 0) - (result1.responseTimeAvg || 0),
    responseTimeMinDifference: (result2.responseTimeMin || 0) - (result1.responseTimeMin || 0),
    responseTimeMaxDifference: (result2.responseTimeMax || 0) - (result1.responseTimeMax || 0),
    requestsPerSecondDifference: (result2.requestsPerSecond || 0) - (result1.requestsPerSecond || 0),
    errorRateDifference: (result2.errorRate || 0) - (result1.errorRate || 0),
  }

  console.log(`
Comparison between ${name1} and ${name2}:
- Max Memory Used Difference: ${comparisons.maxMemoryUsedDifference.toFixed(2)} MB
- Min Memory Used Difference: ${comparisons.minMemoryUsedDifference.toFixed(2)} MB
- Avg Memory Used Difference: ${comparisons.avgMemoryUsedDifference.toFixed(2)} MB
- Max CPU Usage Difference: ${comparisons.maxCpuUsageDifference.toFixed(2)}%
- Min CPU Usage Difference: ${comparisons.minCpuUsageDifference.toFixed(2)}%
- Avg CPU Usage Difference: ${comparisons.avgCpuUsageDifference.toFixed(2)}%
- Stress Test Time Difference: ${comparisons.stressTestTimeDifference.toFixed(2)} seconds
- Average Response Time Difference: ${comparisons.responseTimeAvgDifference.toFixed(2)} ms
- Min Response Time Difference: ${comparisons.responseTimeMinDifference.toFixed(2)} ms
- Max Response Time Difference: ${comparisons.responseTimeMaxDifference.toFixed(2)} ms
- Requests Per Second Difference: ${comparisons.requestsPerSecondDifference.toFixed(2)}
- Error Rate Difference: ${comparisons.errorRateDifference.toFixed(2)}%
  `)

  writeToMarkdown(`
## Comparison between ${name1} and ${name2}

- **Max Memory Used Difference**: ${comparisons.maxMemoryUsedDifference.toFixed(2)} MB
- **Min Memory Used Difference**: ${comparisons.minMemoryUsedDifference.toFixed(2)} MB
- **Avg Memory Used Difference**: ${comparisons.avgMemoryUsedDifference.toFixed(2)} MB
- **Max CPU Usage Difference**: ${comparisons.maxCpuUsageDifference.toFixed(2)}%
- **Min CPU Usage Difference**: ${comparisons.minCpuUsageDifference.toFixed(2)}%
- **Avg CPU Usage Difference**: ${comparisons.avgCpuUsageDifference.toFixed(2)}%
- **Stress Test Time Difference**: ${comparisons.stressTestTimeDifference.toFixed(2)} seconds
- **Average Response Time Difference**: ${comparisons.responseTimeAvgDifference.toFixed(2)} ms
- **Min Response Time Difference**: ${comparisons.responseTimeMinDifference.toFixed(2)} ms
- **Max Response Time Difference**: ${comparisons.responseTimeMaxDifference.toFixed(2)} ms
- **Requests Per Second Difference**: ${comparisons.requestsPerSecondDifference.toFixed(2)}
- **Error Rate Difference**: ${comparisons.errorRateDifference.toFixed(2)}%
  `)
}

async function stressTestServerWithArtillery(directory: string, artilleryConfigPath: string): Promise<PerformanceResult> {
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
    }
    catch (error) {
      console.error('Error retrieving process usage during stress test:', error)
    }
  }, 1000)

  try {
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

      // Даем серверу время на старт перед запуском Artillery теста
      setTimeout(resolve, 5000)
    })

    // Запуск Artillery и сбор результатов
    const artilleryResults = await runArtilleryTest(artilleryConfigPath)

    // Остановка мониторинга и сервера
    clearInterval(monitorInterval)
    process.kill(-pid)

    const avgCpuUsage = cpuUsageSamples > 0 ? totalCpuUsage / cpuUsageSamples : 0
    const avgMemoryUsed = cpuUsageSamples > 0 ? totalMemoryUsage / cpuUsageSamples : 0

    const summary = artilleryResults.aggregate

    // const stressTestTime = summary.period ? summary.period / 1000 : 0 // Время в секундах
    const stressTestTime = (summary.lastMetricAt - summary.firstMetricAt) / 1000
    const avgResponseTime = summary.summaries['http.response_time']?.mean || 0
    const responseTimeMin = summary.summaries['http.response_time']?.min || 0
    const responseTimeMax = summary.summaries['http.response_time']?.max || 0
    const requestsPerSecond = summary.rates['http.request_rate'] || 0
    const errorRate
      = summary.counters['http.codes.500'] && summary.counters['http.requests']
        ? (summary.counters['http.codes.500'] / summary.counters['http.requests']) * 100
        : 0

    console.log(`
Stress Test Results:
- Max CPU usage: ${maxCpuUsage.toFixed(2)}%
- Min CPU usage: ${minCpuUsage.toFixed(2)}%
- Average CPU usage: ${avgCpuUsage.toFixed(2)}%
- Max Memory usage: ${maxMemoryUsed.toFixed(2)} MB
- Min Memory usage: ${minMemoryUsed.toFixed(2)} MB
- Average Memory usage: ${avgMemoryUsed.toFixed(2)} MB
- Stress Test Time: ${stressTestTime.toFixed(2)} seconds
- Average Response Time: ${avgResponseTime.toFixed(2)} ms
- Min Response Time: ${responseTimeMin.toFixed(2)} ms
- Max Response Time: ${responseTimeMax.toFixed(2)} ms
- Requests per Second: ${requestsPerSecond.toFixed(2)}
- Error Rate: ${errorRate.toFixed(2)}%
    `)

    writeToMarkdown(`
## Stress Test with Artillery for ${directory}

- **Max CPU Usage**: ${maxCpuUsage.toFixed(2)}%
- **Min CPU Usage**: ${minCpuUsage.toFixed(2)}%
- **Average CPU Usage**: ${avgCpuUsage.toFixed(2)}%
- **Max Memory Usage**: ${maxMemoryUsed.toFixed(2)} MB
- **Min Memory Usage**: ${minMemoryUsed.toFixed(2)} MB
- **Average Memory Usage**: ${avgMemoryUsed.toFixed(2)} MB
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
    }
  }
  catch (error) {
    clearInterval(monitorInterval)
    process.kill(-pid)
    throw error
  }
}

function pause(duration: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, duration))
}

test.describe('performance', () => {
  test('compare build performance and stress test', async () => {
    test.setTimeout(1600000)

    initializeMarkdown()
    addDependencyVersions()

    const i18nResults = await measureBuildPerformance('./test/fixtures/i18n')
    await pause(5000)
    const i18nNextResults = await measureBuildPerformance('./test/fixtures/i18n-micro')

    console.log('\nPerformance Comparison:')
    console.log('--------------------------')
    console.log(`i18n-micro: ${i18nNextResults.buildTime.toFixed(2)} seconds, Max Memory: ${i18nNextResults.maxMemoryUsed.toFixed(2)} MB, Max CPU: ${i18nNextResults.maxCpuUsage.toFixed(2)}%`)
    console.log(`i18n v9: ${i18nResults.buildTime.toFixed(2)} seconds, Max Memory: ${i18nResults.maxMemoryUsed.toFixed(2)} MB, Max CPU: ${i18nResults.maxCpuUsage.toFixed(2)}%`)

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

::: details **i18n v9**
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
- **i18n v9**: ${i18nResults.buildTime.toFixed(2)} seconds, Max Memory: ${i18nResults.maxMemoryUsed.toFixed(2)} MB, Max CPU: ${i18nResults.maxCpuUsage.toFixed(2)}%
- **Time Difference**: ${timeDifference.toFixed(2)} seconds
- **Memory Difference**: ${memoryDifference.toFixed(2)} MB
- **CPU Usage Difference**: ${cpuDifference.toFixed(2)}%
`)

    const artilleryConfigPath = './artillery-config.yml' // Убедитесь, что путь корректный

    const i18nStressResults = await stressTestServerWithArtillery('./test/fixtures/i18n', artilleryConfigPath)
    await pause(5000)
    const i18nNextStressResults = await stressTestServerWithArtillery('./test/fixtures/i18n-micro', artilleryConfigPath)

    logAndWriteComparisonResults('i18n v9', 'i18n-micro', i18nStressResults, i18nNextStressResults)

    addTestLogicExplanation()
  })
})
