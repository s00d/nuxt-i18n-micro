import { exec, execSync, spawn } from 'node:child_process'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import path, { dirname, join, relative } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import http from 'node:http'
import {
  describe,
  it,
} from 'vitest'

// ============================================================================
// TYPES
// ============================================================================

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

interface ArtilleryResult {
  aggregate: ArtilleryAggregate
  intermediate?: ArtilleryIntermediate[]
}

interface AutocannonResult {
  'url': string
  'title': string
  'socketPath': string | undefined
  'requests': {
    average: number
    mean: number
    stddev: number
    min: number
    max: number
    total: number
    p0_001: number
    p0_01: number
    p0_1: number
    p1: number
    p2_5: number
    p10: number
    p25: number
    p50: number
    p75: number
    p90: number
    p97_5: number
    p99: number
    p99_9: number
    p99_99: number
    p99_999: number
    sent: number
  }
  'latency': {
    average: number
    mean: number
    stddev: number
    min: number
    max: number
    p0_001: number
    p0_01: number
    p0_1: number
    p1: number
    p2_5: number
    p10: number
    p25: number
    p50: number
    p75: number
    p90: number
    p97_5: number
    p99: number
    p99_9: number
    p99_99: number
    p99_999: number
    totalCount: number
  }
  'throughput': {
    average: number
    mean: number
    stddev: number
    min: number
    max: number
    total: number
    p0_001: number
    p0_01: number
    p0_1: number
    p1: number
    p2_5: number
    p10: number
    p25: number
    p50: number
    p75: number
    p90: number
    p97_5: number
    p99: number
    p99_9: number
    p99_99: number
    p99_999: number
  }
  'errors': number
  'timeouts': number
  'mismatches': number
  'duration': number
  'start': string
  'finish': string
  'connections': number
  'pipelining': number
  'non2xx': number
  '1xx': number
  '2xx': number
  '3xx': number
  '4xx': number
  '5xx': number
}

interface BundleSize {
  client: number
  server: number
  total: number
  clientCode: number
  clientTranslations: number
  serverCode: number
  serverTranslations: number
  codeTotal: number
  translationsTotal: number
}

interface PerformanceResult {
  buildTime: number
  maxMemoryUsed: number
  minMemoryUsed: number
  avgMemoryUsed: number
  maxCpuUsage: number
  minCpuUsage: number
  avgCpuUsage: number
  bundleSize?: BundleSize
  stressTestTime?: number
  responseTimeAvg?: number
  responseTimeMin?: number
  responseTimeMax?: number
  responseTimeP50?: number
  responseTimeP95?: number
  responseTimeP99?: number
  requestsPerSecond?: number
  errorRate?: number
  successRequests?: Record<string, number>
  failedRequests?: Record<string, number>
  autocannon?: AutocannonResult
  artillery?: ArtilleryResult
}

interface ChartDataPoint {
  timestamp: number
  requestRate: number
  responseTimeP95: number
  vusersActive: number
  vusersFailed: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const resultsFilePath = join(__dirname, '../docs/guide', 'performance-results.md')
const chartsDir = join(__dirname, '../docs/public/charts')
const tempOutputDir = join(__dirname, '.perf-output')

// Ensure temp output directory exists
if (!fs.existsSync(tempOutputDir)) {
  fs.mkdirSync(tempOutputDir, { recursive: true })
}

// Ensure charts directory exists
if (!fs.existsSync(chartsDir)) {
  fs.mkdirSync(chartsDir, { recursive: true })
}

// ============================================================================
// HELPERS
// ============================================================================

function writeToMarkdown(content: string) {
  fs.appendFileSync(resultsFilePath, content)
}

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

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Paths to package.json
const rootPackagePath = path.resolve(__dirname, '../package.json')
const i18nPackagePath = path.resolve(__dirname, 'fixtures/i18n/package.json')

// ============================================================================
// BUNDLE SIZE MEASUREMENT
// ============================================================================

function measureBundleSize(directory: string): BundleSize {
  const outputDir = path.join(directory, '.output')
  const clientDir = path.join(outputDir, 'public')
  const serverDir = path.join(outputDir, 'server')

  function isTranslationFile(filePath: string): boolean {
    const relativePath = filePath.toLowerCase()
    const fileName = path.basename(filePath)

    // JSON files in locales directories (i18n-micro)
    if (relativePath.includes('locales') && filePath.endsWith('.json')) {
      return true
    }

    // MJS files that are locale translations in chunks/_/ directory (nuxt-i18n)
    // e.g., chunks/_/en.mjs, chunks/_/de.mjs
    if (relativePath.includes('chunks/_') || relativePath.includes('chunks\\_')) {
      const localePattern = /^(?:en|de|ru|fr|es|it|pt|zh|ja|ko|ar|he|hi|pl|nl|sv|da|fi|no|cs|sk|hu|ro|bg|uk|tr|vi|th|id|ms)\.mjs$/i
      if (localePattern.test(fileName)) {
        return true
      }
    }

    // MJS files in chunks/build/ that start with locale code (nuxt-i18n compiled translations)
    // e.g., chunks/build/en-DNSlf_yQ.mjs, chunks/build/de-D2u_zdJD.mjs
    if (relativePath.includes('chunks/build') || relativePath.includes('chunks\\build')) {
      const localePattern = /^(?:en|de|ru|fr|es|it|pt|zh|ja|ko|ar|he|hi|pl|nl|sv|da|fi|no|cs|sk|hu|ro|bg|uk|tr|vi|th|id|ms)-\w+\.mjs$/i
      if (localePattern.test(fileName)) {
        return true
      }
    }

    // Raw translation chunks (i18n-micro)
    // e.g., chunks/raw/en4.mjs, chunks/raw/de2.mjs
    if (relativePath.includes('chunks/raw') || relativePath.includes('chunks\\raw')) {
      const localePattern = /^(?:en|de|ru|fr|es|it|pt|zh|ja|ko|ar|he|hi|pl|nl|sv|da|fi|no|cs|sk|hu|ro|bg|uk|tr|vi|th|id|ms)\d*\.mjs$/i
      if (localePattern.test(fileName)) {
        return true
      }
    }

    // API translations folder (plain-nuxt)
    if (relativePath.includes('routes/api/translations') || relativePath.includes('routes\\api\\translations')) {
      return true
    }

    return false
  }

  function getDirSizeWithSeparation(dir: string): { total: number, code: number, translations: number } {
    if (!fs.existsSync(dir)) return { total: 0, code: 0, translations: 0 }

    let code = 0
    let translations = 0

    function walkDir(currentDir: string) {
      const files = fs.readdirSync(currentDir, { withFileTypes: true })
      for (const file of files) {
        const filePath = path.join(currentDir, file.name)
        if (file.isDirectory()) {
          walkDir(filePath)
        }
        else {
          const fileSize = fs.statSync(filePath).size
          if (isTranslationFile(filePath)) {
            translations += fileSize
          }
          else {
            code += fileSize
          }
        }
      }
    }

    walkDir(dir)
    return { total: code + translations, code, translations }
  }

  const clientStats = getDirSizeWithSeparation(clientDir)
  const serverStats = getDirSizeWithSeparation(serverDir)

  return {
    client: clientStats.total,
    server: serverStats.total,
    total: clientStats.total + serverStats.total,
    clientCode: clientStats.code,
    clientTranslations: clientStats.translations,
    serverCode: serverStats.code,
    serverTranslations: serverStats.translations,
    codeTotal: clientStats.code + serverStats.code,
    translationsTotal: clientStats.translations + serverStats.translations,
  }
}

// ============================================================================
// MARKDOWN INITIALIZATION
// ============================================================================

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

- **[plain-nuxt Path](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/plain-nuxt)**: ./test/fixtures/plain-nuxt
- **[i18n-micro Path](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n-micro)**: ./test/fixtures/i18n-micro
- **[i18n Path](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n)**: ./test/fixtures/i18n
- **[Test Script Location](https://github.com/s00d/nuxt-i18n-micro/tree/main/${relativePath})**: ./${relativePath}


### Description:
This performance test compares **plain Nuxt** (baseline without i18n), **i18n-micro**, and **i18n** (nuxtjs/i18n v10).
The **plain-nuxt** fixture serves as a baseline: it loads data directly from JSON files and displays the same content as i18n fixtures, but without any internationalization module.
The main focus is to evaluate build times, memory usage, CPU usage, and server performance under stress.
Results show the overhead introduced by each i18n solution compared to the baseline.

### Important Note:
The **i18n-micro** example simplifies the translation structure by consolidating translations. However, **i18n-micro** is optimized for per-page translations. The **plain-nuxt** baseline uses the same page structure and data volume for a fair comparison.

---
`

  fs.writeFileSync(resultsFilePath, header)
}

function addTestLogicExplanation() {
  writeToMarkdown(`
## 📊 Detailed Performance Analysis

### 🔍 Test Logic Explanation

The performance tests compare **plain-nuxt** (baseline), **Nuxt I18n Micro**, and **nuxt-i18n** v10. The **plain-nuxt** fixture loads data directly from JSON files without any i18n module, providing a baseline for measuring i18n overhead.

1. **Build Time**: Measures the time required to build each project. Plain-nuxt shows the baseline; i18n modules add overhead for translation processing.
2. **Bundle Size**: Measures the total size of client and server bundles.
3. **CPU Usage**: Tracks CPU load during build and stress tests.
4. **Memory Usage**: Monitors memory consumption. Plain-nuxt establishes the baseline; i18n modules increase memory usage.
5. **Stress Testing**: Simulates concurrent traffic using Artillery and Autocannon.
   - **Artillery**: Warm-up phase (6 seconds, 6 users), Main phase (60 seconds, 60 req/s).
   - **Autocannon**: 10 connections for 10 seconds, measuring latency percentiles.

### 🛠 Why This Approach?

By including a **plain-nuxt** baseline, we can quantify the overhead of each i18n solution. **Nuxt I18n Micro** is optimized for:
- **Faster Build Times**: Lower overhead than nuxt-i18n.
- **Lower Resource Consumption**: Closer to plain-nuxt baseline.
- **Better Scalability**: Per-page translations for large applications.
`)
}

// ============================================================================
// SERVER UTILITIES
// ============================================================================

async function waitForServer(port: number, timeout = 30000): Promise<void> {
  const startTime = Date.now()
  return new Promise((resolve, reject) => {
    const check = () => {
      if (Date.now() - startTime > timeout) {
        return reject(new Error(`Server on port ${port} did not start within ${timeout}ms`))
      }

      const req = http.get(`http://localhost:${port}`, (res) => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
          console.log(`Server on port ${port} is ready.`)
          res.destroy()
          resolve()
        }
        else {
          res.destroy()
          setTimeout(check, 500)
        }
      })

      req.on('error', () => {
        req.destroy()
        setTimeout(check, 500)
      })
    }
    check()
  })
}

function getProcessUsage(pid: number): { cpu: number, memory: number } | null {
  try {
    const result = execSync(`ps -p ${pid} -o %cpu,rss`, { encoding: 'utf-8', stdio: 'pipe' }).toString()
    const lines = result.trim().split('\n')

    if (lines.length < 2 || !lines[1] || lines[1].trim() === '') {
      return null
    }

    const parts = lines[1].trim().split(/\s+/).map(Number.parseFloat)
    const cpu = parts[0]
    const memory = parts[1]

    return {
      cpu: cpu || 0,
      memory: memory ? memory / 1024 : 0,
    }
  }
  catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 1) {
      return null
    }
    return null
  }
}

// ============================================================================
// BUILD PERFORMANCE
// ============================================================================

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

  const cleanEnv: Record<string, string> = {
    NODE_ENV: 'production',
    NODE_OPTIONS: '--max-old-space-size=16000',
    PATH: process.env.PATH || '',
    HOME: process.env.HOME || '',
    USER: process.env.USER || '',
    SHELL: process.env.SHELL || '',
    ...(process.env.PNPM_HOME && { PNPM_HOME: process.env.PNPM_HOME }),
    ...(process.env.PNPM_ROOT && { PNPM_ROOT: process.env.PNPM_ROOT }),
  }

  const childProcess = spawn('nuxi', ['build'], {
    cwd: directory,
    env: cleanEnv,
    stdio: 'pipe',
  })

  const pid = childProcess.pid ?? 0

  childProcess.stdout.on('data', (data: Buffer) => {
    console.log(`[build stdout]: ${data.toString().trim()}`)
  })

  childProcess.stderr.on('data', (data: Buffer) => {
    console.error(`[build stderr]: ${data.toString().trim()}`)
  })

  const monitorInterval = setInterval(() => {
    try {
      const usage = getProcessUsage(pid)
      if (!usage) return

      const { cpu, memory } = usage

      maxCpuUsage = Math.max(maxCpuUsage, cpu)
      minCpuUsage = Math.min(minCpuUsage, cpu)
      totalCpuUsage += cpu
      maxMemoryUsed = Math.max(maxMemoryUsed, memory)
      minMemoryUsed = Math.min(minMemoryUsed, memory)
      totalMemoryUsage += memory
      cpuUsageSamples++

      console.log(`Current CPU: ${cpu}%, Current Memory: ${memory.toFixed(2)} MB`)
    }
    catch {
      // Ignore
    }
  }, 1000)

  try {
    await new Promise<void>((resolve, reject) => {
      childProcess.on('close', (code) => {
        if (code === 0) {
          resolve()
        }
        else {
          reject(new Error(`Build process exited with code ${code}`))
        }
      })
      childProcess.on('error', reject)
    })

    const endTime = performance.now()
    const buildTime = (endTime - startTime) / 1000

    clearInterval(monitorInterval)

    const avgCpuUsage = cpuUsageSamples > 0 ? totalCpuUsage / cpuUsageSamples : 0
    const avgMemoryUsed = cpuUsageSamples > 0 ? totalMemoryUsage / cpuUsageSamples : 0

    // Measure bundle size
    const bundleSize = measureBundleSize(directory)

    console.log(`Build completed in: ${buildTime.toFixed(2)} seconds`)
    console.log(`Bundle size: ${formatBytes(bundleSize.total)} (client: ${formatBytes(bundleSize.client)}, server: ${formatBytes(bundleSize.server)})`)

    writeToMarkdown(`
## Build Performance for ${directory}

- **Build Time**: ${buildTime.toFixed(2)} seconds
- **Bundle Size**: ${formatBytes(bundleSize.total)} (code: ${formatBytes(bundleSize.codeTotal)}, translations: ${formatBytes(bundleSize.translationsTotal)})
- **Code Bundle**: client: ${formatBytes(bundleSize.clientCode)}, server: ${formatBytes(bundleSize.serverCode)}
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
      bundleSize,
    }
  }
  catch (error) {
    clearInterval(monitorInterval)
    console.error('Build failed with error:', error)
    throw error
  }
}

// ============================================================================
// AUTOCANNON BENCHMARK
// ============================================================================

async function runAutocannonTest(port: number, duration = 10, connections = 10): Promise<AutocannonResult> {
  return new Promise((resolve, reject) => {
    const outputFile = join(tempOutputDir, `autocannon-output-${port}.json`)
    exec(
      `npx autocannon -c ${connections} -d ${duration} -j http://localhost:${port}`,
      { maxBuffer: 50 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error && !stdout) {
          console.error(`Autocannon test failed: ${error.message}`)
          console.error(`stderr: ${stderr}`)
          return reject(error)
        }
        try {
          const result = JSON.parse(stdout)
          fs.writeFileSync(outputFile, JSON.stringify(result, null, 2))
          resolve(result)
        }
        catch (e) {
          console.error('Failed to parse autocannon output:', stdout)
          reject(e)
        }
      },
    )
  })
}

// ============================================================================
// ARTILLERY BENCHMARK
// ============================================================================

async function runArtilleryTest(configPath: string, outputName: string): Promise<ArtilleryResult> {
  const outputFile = join(tempOutputDir, `artillery-output-${outputName}.json`)
  return new Promise((resolve, reject) => {
    exec(`npx artillery run ${configPath} --output ${outputFile}`, (error, stdout) => {
      if (error) {
        console.error(`Artillery test failed: ${error.message}`)
        return reject(error)
      }
      console.log(`Artillery test completed successfully:\n${stdout}`)
      fs.readFile(outputFile, 'utf8', (err, data) => {
        if (err) {
          console.error(`Error reading Artillery output: ${err.message}`)
          return reject(err)
        }
        resolve(JSON.parse(data))
      })
    })
  })
}

// ============================================================================
// CHART.JS GENERATION
// ============================================================================

function extractChartData(artillery: ArtilleryResult): ChartDataPoint[] {
  const intermediate = artillery.intermediate || []
  return intermediate.map((entry, index) => ({
    timestamp: index * 10, // 10 second intervals
    requestRate: entry.rates['http.request_rate'] || 0,
    responseTimeP95: entry.summaries?.['http.response_time']?.p95 || 0,
    vusersActive: (entry.counters['vusers.created'] || 0) - (entry.counters['vusers.completed'] || 0) - (entry.counters['vusers.failed'] || 0),
    vusersFailed: entry.counters['vusers.failed'] || 0,
  }))
}

// Color scheme matching the i18n-micro.png style
const chartColors = {
  requestRate: 'rgb(255, 159, 64)', // Orange
  responseTimeP95: 'rgb(75, 192, 192)', // Cyan/Teal
  vusersCreated: 'rgb(153, 102, 255)', // Purple
  vusersActive: 'rgb(46, 204, 113)', // Green
  vusersFailed: 'rgb(255, 99, 132)', // Red/Pink
  plainNuxt: 'rgb(75, 192, 192)', // Teal
  i18nV10: 'rgb(255, 99, 132)', // Red
  i18nMicro: 'rgb(46, 204, 113)', // Green
}

function generateChartJsConfig(
  name: string,
  artillery: ArtilleryResult,
): { trafficConfig: object, latencyConfig: object } {
  const intermediate = artillery.intermediate || []
  const timeSeriesData = intermediate.map((entry, index) => ({
    time: `${index * 10}s`,
    requestRate: entry.rates['http.request_rate'] || 0,
    responseTimeP95: entry.summaries?.['http.response_time']?.p95 || 0,
    vusersCreated: entry.counters['vusers.created'] || 0,
    vusersActive: Math.max(0, (entry.counters['vusers.created'] || 0)
    - (entry.counters['vusers.completed'] || 0)
    - (entry.counters['vusers.failed'] || 0)),
    vusersFailed: entry.counters['vusers.failed'] || 0,
  }))

  const labels = timeSeriesData.map(d => d.time)

  // Traffic Profile Chart (multi-axis line chart)
  const trafficConfig = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'http.request_rate',
          data: timeSeriesData.map(d => Math.round(d.requestRate)),
          borderColor: chartColors.requestRate,
          backgroundColor: chartColors.requestRate.replace('rgb', 'rgba').replace(')', ', 0.1)'),
          borderWidth: 2,
          tension: 0.3,
          yAxisID: 'y1',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'http.response_time.p95',
          data: timeSeriesData.map(d => Math.round(d.responseTimeP95)),
          borderColor: chartColors.responseTimeP95,
          backgroundColor: chartColors.responseTimeP95.replace('rgb', 'rgba').replace(')', ', 0.1)'),
          borderWidth: 2,
          tension: 0.3,
          yAxisID: 'y2',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'vusers.created',
          data: timeSeriesData.map(d => Math.round(d.vusersCreated)),
          borderColor: chartColors.vusersCreated,
          backgroundColor: chartColors.vusersCreated.replace('rgb', 'rgba').replace(')', ', 0.1)'),
          borderWidth: 2,
          tension: 0.3,
          yAxisID: 'y',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'vusers.active',
          data: timeSeriesData.map(d => Math.round(d.vusersActive)),
          borderColor: chartColors.vusersActive,
          backgroundColor: chartColors.vusersActive.replace('rgb', 'rgba').replace(')', ', 0.1)'),
          borderWidth: 2,
          tension: 0.3,
          yAxisID: 'y',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'vusers.failed',
          data: timeSeriesData.map(d => Math.round(d.vusersFailed)),
          borderColor: chartColors.vusersFailed,
          backgroundColor: chartColors.vusersFailed.replace('rgb', 'rgba').replace(')', ', 0.1)'),
          borderWidth: 2,
          tension: 0.3,
          yAxisID: 'y',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: `Load Summary - ${name}`,
          font: { size: 16, weight: 'bold' },
        },
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, padding: 15 },
        },
      },
      scales: {
        x: {
          display: true,
          title: { display: true, text: 'Time' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'VUsers' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          min: 0,
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: 'req/s' },
          grid: { drawOnChartArea: false },
          min: 0,
        },
        y2: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: 'ms' },
          grid: { drawOnChartArea: false },
          min: 0,
        },
      },
    },
  }

  // Response Time P95 Chart
  const latencyConfig = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'P95 Latency (ms)',
          data: timeSeriesData.map(d => Math.round(d.responseTimeP95)),
          borderColor: chartColors.responseTimeP95,
          backgroundColor: chartColors.responseTimeP95.replace('rgb', 'rgba').replace(')', ', 0.2)'),
          borderWidth: 3,
          tension: 0.3,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Response Time P95 - ${name}`,
          font: { size: 16, weight: 'bold' },
        },
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true },
        },
      },
      scales: {
        x: {
          display: true,
          title: { display: true, text: 'Time' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        y: {
          display: true,
          title: { display: true, text: 'Latency (ms)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          min: 0,
        },
      },
    },
  }

  return { trafficConfig, latencyConfig }
}

function generateChartMarkdown(
  name: string,
  artillery: ArtilleryResult,
): string {
  const data = extractChartData(artillery)
  const summary = {
    vusersCreated: artillery.aggregate.counters['vusers.created'] || 0,
    completed: artillery.aggregate.counters['vusers.completed'] || 0,
    failed: artillery.aggregate.counters['vusers.failed'] || 0,
    avgReqPerSec: artillery.aggregate.rates['http.request_rate'] || 0,
    peakReqPerSec: Math.max(...data.map(d => d.requestRate), 0),
  }

  const completedPercent = summary.vusersCreated > 0
    ? ((summary.completed / summary.vusersCreated) * 100).toFixed(2)
    : '0'
  const failedPercent = summary.vusersCreated > 0
    ? ((summary.failed / summary.vusersCreated) * 100).toFixed(2)
    : '0'

  // Extract detailed time-series data for table
  const intermediate = artillery.intermediate || []
  const timeSeriesData = intermediate.map((entry, index) => {
    const timestamp = new Date(entry.period).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    return {
      time: timestamp,
      index,
      requestRate: entry.rates['http.request_rate'] || 0,
      responseTimeP95: entry.summaries?.['http.response_time']?.p95 || 0,
      vusersCreated: entry.counters['vusers.created'] || 0,
      vusersActive: Math.max(0, (entry.counters['vusers.created'] || 0)
      - (entry.counters['vusers.completed'] || 0)
      - (entry.counters['vusers.failed'] || 0)),
      vusersFailed: entry.counters['vusers.failed'] || 0,
    }
  })

  let timeSeriesTable = `
| Time | Request Rate | Response P95 | VUsers Active | VUsers Created |
|------|--------------|--------------|---------------|----------------|
`
  timeSeriesData.forEach((d) => {
    timeSeriesTable += `| ${d.time} | ${d.requestRate.toFixed(0)} req/s | ${d.responseTimeP95.toFixed(0)} ms | ${d.vusersActive} | ${d.vusersCreated} |\n`
  })

  const safeName = name.replace(/[^a-z0-9-]/gi, '-')

  return `
#### 📊 Load Summary - ${name}

<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">

| **${summary.vusersCreated.toLocaleString()}** | **${summary.completed.toLocaleString()}** completed | **${summary.avgReqPerSec.toFixed(0)}** | **${summary.peakReqPerSec.toFixed(0)}** |
|:---:|:---:|:---:|:---:|
| vusers created | ${completedPercent}% / ${failedPercent}% failed | average req/s | peak req/s |

</div>

#### 📈 Traffic Profile Over Time

\`\`\`chart
url: /charts/${safeName}-traffic.js
height: 400px
\`\`\`

#### ⏱️ Response Time P95 Over Time

\`\`\`chart
url: /charts/${safeName}-latency.js
height: 300px
\`\`\`

<details>
<summary>📋 Detailed Time Series Data</summary>

${timeSeriesTable}

</details>
`
}

function generateComparisonCharts(
  results: { name: string, autocannon?: AutocannonResult, artillery?: ArtilleryResult }[],
): { rpsConfig: object, latencyConfig: object, artilleryRpsConfig: object } {
  const labels = results.map(r => r.name)

  // RPS comparison (Autocannon)
  const rpsConfig = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Requests per Second',
          data: results.map(r => Math.round(r.autocannon?.requests.average || 0)),
          backgroundColor: [chartColors.plainNuxt, chartColors.i18nV10, chartColors.i18nMicro],
          borderColor: [chartColors.plainNuxt, chartColors.i18nV10, chartColors.i18nMicro],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Requests per Second - Autocannon (higher is better)',
          font: { size: 16, weight: 'bold' },
        },
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'RPS' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
      },
    },
  }

  // Artillery RPS
  const artilleryRpsConfig = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Requests per Second',
          data: results.map(r => Math.round(r.artillery?.aggregate.rates['http.request_rate'] || 0)),
          backgroundColor: [chartColors.plainNuxt, chartColors.i18nV10, chartColors.i18nMicro],
          borderColor: [chartColors.plainNuxt, chartColors.i18nV10, chartColors.i18nMicro],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Requests per Second - Artillery (higher is better)',
          font: { size: 16, weight: 'bold' },
        },
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'RPS' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
      },
    },
  }

  // Latency comparison
  const latencyConfig = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Avg',
          data: results.map(r => Math.round(r.autocannon?.latency.average || 0)),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1,
        },
        {
          label: 'P50',
          data: results.map(r => Math.round(r.autocannon?.latency.p50 || 0)),
          backgroundColor: 'rgba(255, 206, 86, 0.8)',
          borderColor: 'rgb(255, 206, 86)',
          borderWidth: 1,
        },
        {
          label: 'P95',
          data: results.map(r => Math.round(r.autocannon?.latency.p97_5 || 0)),
          backgroundColor: 'rgba(255, 159, 64, 0.8)',
          borderColor: 'rgb(255, 159, 64)',
          borderWidth: 1,
        },
        {
          label: 'P99',
          data: results.map(r => Math.round(r.autocannon?.latency.p99 || 0)),
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Latency Percentiles (lower is better)',
          font: { size: 16, weight: 'bold' },
        },
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Latency (ms)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
      },
    },
  }

  return { rpsConfig, latencyConfig, artilleryRpsConfig }
}

function generateBuildComparisonCharts(
  buildTimes: number[],
  codeBundleSizesMB: number[],
  translationSizesMB: number[],
): { buildTimeConfig: object, bundleSizeConfig: object } {
  const labels = ['plain-nuxt', 'i18n-v10', 'i18n-micro']

  const buildTimeConfig = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Build Time (seconds)',
          data: buildTimes,
          backgroundColor: [chartColors.plainNuxt, chartColors.i18nV10, chartColors.i18nMicro],
          borderColor: [chartColors.plainNuxt, chartColors.i18nV10, chartColors.i18nMicro],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Build Time (lower is better)',
          font: { size: 16, weight: 'bold' },
        },
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Seconds' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
      },
    },
  }

  // Stacked bar chart showing Code vs Translations
  const bundleSizeConfig = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Code Bundle (MB)',
          data: codeBundleSizesMB,
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 2,
        },
        {
          label: 'Translations (MB)',
          data: translationSizesMB,
          backgroundColor: 'rgba(255, 206, 86, 0.8)',
          borderColor: 'rgb(255, 206, 86)',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Bundle Size: Code vs Translations (lower is better)',
          font: { size: 16, weight: 'bold' },
        },
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          stacked: true,
          title: { display: true, text: 'MB' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        x: {
          stacked: true,
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
      },
    },
  }

  return { buildTimeConfig, bundleSizeConfig }
}

function saveChartJsConfig(filename: string, config: object): void {
  const jsContent = `// Auto-generated Chart.js config
export default function() {
  return ${JSON.stringify(config, null, 2)};
}
`
  const filePath = join(chartsDir, filename)
  fs.writeFileSync(filePath, jsContent)
  console.log(`Chart config saved to: ${filePath}`)
}

function generateComparisonMarkdown(
  results: { name: string, autocannon?: AutocannonResult, artillery?: ArtilleryResult }[],
): string {
  const rpsWinner = results.reduce((best, curr) =>
    (curr.autocannon?.requests.average || 0) > (best.autocannon?.requests.average || 0) ? curr : best,
  )
  const latencyWinner = results.reduce((best, curr) =>
    (curr.autocannon?.latency.average || Infinity) < (best.autocannon?.latency.average || Infinity) ? curr : best,
  )

  return `
## 🏆 Performance Comparison

### Throughput (Requests per Second)

> **Winner: ${rpsWinner.name}** with ${rpsWinner.autocannon?.requests.average.toFixed(0)} RPS

\`\`\`chart
url: /charts/comparison-rps-autocannon.js
height: 350px
\`\`\`

\`\`\`chart
url: /charts/comparison-rps-artillery.js
height: 350px
\`\`\`

### Latency Distribution

> **Winner: ${latencyWinner.name}** with ${latencyWinner.autocannon?.latency.average.toFixed(2)} ms avg latency

\`\`\`chart
url: /charts/comparison-latency.js
height: 350px
\`\`\`

### Quick Comparison

| Metric | ${results.map(r => `**${r.name}**`).join(' | ')} | Best |
|--------|${results.map(() => '---').join('|')}|------|
| RPS (Autocannon) | ${results.map(r => `${r.autocannon?.requests.average.toFixed(0) || 'N/A'}`).join(' | ')} | ${rpsWinner.name} |
| Avg Latency | ${results.map(r => `${r.autocannon?.latency.average.toFixed(2) || 'N/A'} ms`).join(' | ')} | ${latencyWinner.name} |
| P99 Latency | ${results.map(r => `${r.autocannon?.latency.p99.toFixed(2) || 'N/A'} ms`).join(' | ')} | ${latencyWinner.name} |
| Errors | ${results.map(r => `${r.autocannon?.errors || 0}`).join(' | ')} | - |

`
}

async function generateAndSaveChart(name: string, artillery: ArtilleryResult): Promise<string> {
  const data = extractChartData(artillery)
  const { trafficConfig, latencyConfig } = generateChartJsConfig(name, artillery)

  const safeName = name.replace(/[^a-z0-9-]/gi, '-')

  // Save Chart.js configs as JS files
  saveChartJsConfig(`${safeName}-traffic.js`, trafficConfig)
  saveChartJsConfig(`${safeName}-latency.js`, latencyConfig)

  // Save JSON data for reference
  const jsonPath = join(chartsDir, `${safeName}-data.json`)
  const summary = {
    vusersCreated: artillery.aggregate.counters['vusers.created'] || 0,
    completed: artillery.aggregate.counters['vusers.completed'] || 0,
    failed: artillery.aggregate.counters['vusers.failed'] || 0,
    avgReqPerSec: artillery.aggregate.rates['http.request_rate'] || 0,
    peakReqPerSec: Math.max(...data.map(d => d.requestRate), 0),
  }
  fs.writeFileSync(jsonPath, JSON.stringify({ data, summary, intermediate: artillery.intermediate }, null, 2))
  console.log(`Chart data saved to: ${jsonPath}`)

  return generateChartMarkdown(name, artillery)
}

// ============================================================================
// STRESS TEST
// ============================================================================

async function stressTestServerWithArtillery(
  directory: string,
  name: string,
  artilleryConfigPath: string,
): Promise<PerformanceResult> {
  console.log(`Starting server for stress test in ${directory}...`)

  const controller = new AbortController()
  const { signal } = controller
  const port = 10000

  const childProcess = spawn('node', ['.output/server/index.mjs'], {
    cwd: directory,
    signal,
    env: {
      ...process.env,
      PORT: port.toString(),
      NODE_ENV: 'production',
      NITRO_PRESET: 'node-server',
    },
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const pid = childProcess.pid ?? 0

  childProcess.stdout?.on('data', (data: Buffer) => console.log(`[Server stdout ${name}]: ${data.toString().trim()}`))
  childProcess.stderr?.on('data', (data: Buffer) => console.error(`[Server stderr ${name}]: ${data.toString().trim()}`))

  childProcess.on('error', (error: NodeJS.ErrnoException) => {
    if (error.name === 'AbortError' || error.code === 'ABORT_ERR') return
  })

  let maxCpuUsage = 0
  let minCpuUsage = Infinity
  let totalCpuUsage = 0
  let maxMemoryUsed = 0
  let minMemoryUsed = Infinity
  let totalMemoryUsage = 0
  let cpuUsageSamples = 0

  const monitorInterval = setInterval(() => {
    try {
      const usage = getProcessUsage(pid)
      if (!usage) return

      const { cpu, memory } = usage

      maxCpuUsage = Math.max(maxCpuUsage, cpu)
      minCpuUsage = Math.min(minCpuUsage, cpu)
      totalCpuUsage += cpu
      maxMemoryUsed = Math.max(maxMemoryUsed, memory)
      minMemoryUsed = Math.min(minMemoryUsed, memory)
      totalMemoryUsage += memory
      cpuUsageSamples++
    }
    catch {
      // Ignore
    }
  }, 1000)

  try {
    await waitForServer(port)

    // Run Autocannon first (quick benchmark)
    console.log(`Running Autocannon benchmark for ${name}...`)
    const autocannonResults = await runAutocannonTest(port, 10, 10)

    // Run Artillery (detailed benchmark)
    console.log(`Running Artillery benchmark for ${name}...`)
    const artilleryResults = await runArtilleryTest(artilleryConfigPath, name)

    // Generate mermaid chart
    const mermaidChart = await generateAndSaveChart(name, artilleryResults)

    const summary = artilleryResults.aggregate

    const stressTestTime = (summary.lastMetricAt - summary.firstMetricAt) / 1000
    const avgResponseTime = summary.summaries['http.response_time']?.mean || 0
    const responseTimeMin = summary.summaries['http.response_time']?.min || 0
    const responseTimeMax = summary.summaries['http.response_time']?.max || 0
    const responseTimeP50 = summary.summaries['http.response_time']?.p50 || 0
    const responseTimeP95 = summary.summaries['http.response_time']?.p95 || 0
    const responseTimeP99 = summary.summaries['http.response_time']?.p99 || 0
    const requestsPerSecond = summary.rates['http.request_rate'] || 0
    const errorRate
      = summary.counters['http.codes.500'] && summary.counters['http.requests']
        ? (summary.counters['http.codes.500'] / summary.counters['http.requests']) * 100
        : 0

    const avgCpuUsage = cpuUsageSamples > 0 ? totalCpuUsage / cpuUsageSamples : 0
    const avgMemoryUsed = cpuUsageSamples > 0 ? totalMemoryUsage / cpuUsageSamples : 0

    console.log(`
Stress Test Results for ${name}:
- Max CPU usage: ${maxCpuUsage.toFixed(2)}%
- Average CPU usage: ${avgCpuUsage.toFixed(2)}%
- Max Memory usage: ${maxMemoryUsed.toFixed(2)} MB
- Average Memory usage: ${avgMemoryUsed.toFixed(2)} MB
- Stress Test Time: ${stressTestTime.toFixed(2)} seconds
- Average Response Time: ${avgResponseTime.toFixed(2)} ms
- Response Time P50: ${responseTimeP50.toFixed(2)} ms
- Response Time P95: ${responseTimeP95.toFixed(2)} ms
- Response Time P99: ${responseTimeP99.toFixed(2)} ms
- Requests per Second (Artillery): ${requestsPerSecond.toFixed(2)}
- Requests per Second (Autocannon): ${autocannonResults.requests.average.toFixed(2)}
- Error Rate: ${errorRate.toFixed(2)}%
    `)

    writeToMarkdown(`
## Stress Test Results for ${name}

### Resource Usage
- **Max CPU Usage**: ${maxCpuUsage.toFixed(2)}%
- **Average CPU Usage**: ${avgCpuUsage.toFixed(2)}%
- **Max Memory Usage**: ${maxMemoryUsed.toFixed(2)} MB
- **Average Memory Usage**: ${avgMemoryUsed.toFixed(2)} MB

### Artillery Results
- **Test Duration**: ${stressTestTime.toFixed(2)} seconds
- **Requests per Second**: ${requestsPerSecond.toFixed(2)}
- **Error Rate**: ${errorRate.toFixed(2)}%

### Latency (Artillery)
| Metric | Value |
|--------|-------|
| Average | ${avgResponseTime.toFixed(2)} ms |
| Min | ${responseTimeMin.toFixed(2)} ms |
| Max | ${responseTimeMax.toFixed(2)} ms |
| P50 | ${responseTimeP50.toFixed(2)} ms |
| P95 | ${responseTimeP95.toFixed(2)} ms |
| P99 | ${responseTimeP99.toFixed(2)} ms |

### Autocannon Results (10 connections, 10s)
| Metric | Value |
|--------|-------|
| Requests/sec (avg) | ${autocannonResults.requests.average.toFixed(2)} |
| Latency avg | ${autocannonResults.latency.average.toFixed(2)} ms |
| Latency P50 | ${autocannonResults.latency.p50.toFixed(2)} ms |
| Latency P95 | ${autocannonResults.latency.p97_5.toFixed(2)} ms |
| Latency P99 | ${autocannonResults.latency.p99.toFixed(2)} ms |
| Latency max | ${autocannonResults.latency.max.toFixed(2)} ms |
| Throughput | ${formatBytes(autocannonResults.throughput.average)}/s |
| Errors | ${autocannonResults.errors} |

${mermaidChart}
`)

    return {
      buildTime: stressTestTime,
      maxCpuUsage,
      minCpuUsage,
      avgCpuUsage,
      maxMemoryUsed,
      minMemoryUsed,
      avgMemoryUsed,
      stressTestTime,
      responseTimeAvg: avgResponseTime,
      responseTimeMin,
      responseTimeMax,
      responseTimeP50,
      responseTimeP95,
      responseTimeP99,
      requestsPerSecond,
      errorRate,
      autocannon: autocannonResults,
      artillery: artilleryResults,
    }
  }
  catch (error) {
    clearInterval(monitorInterval)
    console.error(`Stress test failed for ${name}:`, error)
    throw error
  }
  finally {
    clearInterval(monitorInterval)
    console.log(`Stopping server for ${name}...`)
    try {
      controller.abort()
      if (childProcess.pid) {
        try {
          process.kill(childProcess.pid, 'SIGTERM')
        }
        catch {
          // Ignore
        }
      }
    }
    catch {
      // Ignore
    }
  }
}

// ============================================================================
// COMPARISON RESULTS
// ============================================================================

function logAndWriteComparisonResults(name1: string, name2: string, result1: PerformanceResult, result2: PerformanceResult) {
  const comparisons = {
    maxMemoryUsedDifference: result2.maxMemoryUsed - result1.maxMemoryUsed,
    avgMemoryUsedDifference: result2.avgMemoryUsed - result1.avgMemoryUsed,
    maxCpuUsageDifference: result2.maxCpuUsage - result1.maxCpuUsage,
    avgCpuUsageDifference: result2.avgCpuUsage - result1.avgCpuUsage,
    responseTimeAvgDifference: (result2.responseTimeAvg || 0) - (result1.responseTimeAvg || 0),
    responseTimeP95Difference: (result2.responseTimeP95 || 0) - (result1.responseTimeP95 || 0),
    responseTimeP99Difference: (result2.responseTimeP99 || 0) - (result1.responseTimeP99 || 0),
    requestsPerSecondDifference: (result2.requestsPerSecond || 0) - (result1.requestsPerSecond || 0),
    autocannonRpsDifference: (result2.autocannon?.requests.average || 0) - (result1.autocannon?.requests.average || 0),
    autocannonLatencyDifference: (result2.autocannon?.latency.average || 0) - (result1.autocannon?.latency.average || 0),
  }

  console.log(`
Comparison between ${name1} and ${name2}:
- Max Memory Used Difference: ${comparisons.maxMemoryUsedDifference.toFixed(2)} MB
- Avg Memory Used Difference: ${comparisons.avgMemoryUsedDifference.toFixed(2)} MB
- Response Time Avg Difference: ${comparisons.responseTimeAvgDifference.toFixed(2)} ms
- Response Time P95 Difference: ${comparisons.responseTimeP95Difference.toFixed(2)} ms
- Requests Per Second Difference (Artillery): ${comparisons.requestsPerSecondDifference.toFixed(2)}
- Requests Per Second Difference (Autocannon): ${comparisons.autocannonRpsDifference.toFixed(2)}
  `)

  writeToMarkdown(`
## Comparison: ${name1} vs ${name2}

| Metric | ${name1} | ${name2} | Difference |
|--------|----------|----------|------------|
| Max Memory | ${result1.maxMemoryUsed.toFixed(2)} MB | ${result2.maxMemoryUsed.toFixed(2)} MB | ${comparisons.maxMemoryUsedDifference > 0 ? '+' : ''}${comparisons.maxMemoryUsedDifference.toFixed(2)} MB |
| Avg Memory | ${result1.avgMemoryUsed.toFixed(2)} MB | ${result2.avgMemoryUsed.toFixed(2)} MB | ${comparisons.avgMemoryUsedDifference > 0 ? '+' : ''}${comparisons.avgMemoryUsedDifference.toFixed(2)} MB |
| Response Avg | ${result1.responseTimeAvg?.toFixed(2) || 'N/A'} ms | ${result2.responseTimeAvg?.toFixed(2) || 'N/A'} ms | ${comparisons.responseTimeAvgDifference > 0 ? '+' : ''}${comparisons.responseTimeAvgDifference.toFixed(2)} ms |
| Response P95 | ${result1.responseTimeP95?.toFixed(2) || 'N/A'} ms | ${result2.responseTimeP95?.toFixed(2) || 'N/A'} ms | ${comparisons.responseTimeP95Difference > 0 ? '+' : ''}${comparisons.responseTimeP95Difference.toFixed(2)} ms |
| Response P99 | ${result1.responseTimeP99?.toFixed(2) || 'N/A'} ms | ${result2.responseTimeP99?.toFixed(2) || 'N/A'} ms | ${comparisons.responseTimeP99Difference > 0 ? '+' : ''}${comparisons.responseTimeP99Difference.toFixed(2)} ms |
| RPS (Artillery) | ${result1.requestsPerSecond?.toFixed(2) || 'N/A'} | ${result2.requestsPerSecond?.toFixed(2) || 'N/A'} | ${comparisons.requestsPerSecondDifference > 0 ? '+' : ''}${comparisons.requestsPerSecondDifference.toFixed(2)} |
| RPS (Autocannon) | ${result1.autocannon?.requests.average.toFixed(2) || 'N/A'} | ${result2.autocannon?.requests.average.toFixed(2) || 'N/A'} | ${comparisons.autocannonRpsDifference > 0 ? '+' : ''}${comparisons.autocannonRpsDifference.toFixed(2)} |
| Latency avg (Autocannon) | ${result1.autocannon?.latency.average.toFixed(2) || 'N/A'} ms | ${result2.autocannon?.latency.average.toFixed(2) || 'N/A'} ms | ${comparisons.autocannonLatencyDifference > 0 ? '+' : ''}${comparisons.autocannonLatencyDifference.toFixed(2)} ms |

`)
}

function pause(duration: number): Promise<void> {
  return delay(duration)
}

// ============================================================================
// MAIN TEST
// ============================================================================

describe('performance', () => {
  it('compare build performance and stress test', async () => {
    initializeMarkdown()
    addDependencyVersions()

    // 1. Build all fixtures
    const plainNuxtResults = await measureBuildPerformance('./test/fixtures/plain-nuxt')
    await pause(5000)
    const i18nResults = await measureBuildPerformance('./test/fixtures/i18n')
    await pause(5000)
    const i18nMicroResults = await measureBuildPerformance('./test/fixtures/i18n-micro')

    console.log('\nPerformance Comparison:')
    console.log('--------------------------')
    console.log(`plain-nuxt (baseline): ${plainNuxtResults.buildTime.toFixed(2)} seconds, Bundle: ${formatBytes(plainNuxtResults.bundleSize?.total || 0)}`)
    console.log(`i18n v10: ${i18nResults.buildTime.toFixed(2)} seconds, Bundle: ${formatBytes(i18nResults.bundleSize?.total || 0)}`)
    console.log(`i18n-micro: ${i18nMicroResults.buildTime.toFixed(2)} seconds, Bundle: ${formatBytes(i18nMicroResults.bundleSize?.total || 0)}`)

    // Build time values for chart (in seconds)
    const buildTimes = [
      Math.round(plainNuxtResults.buildTime * 10) / 10,
      Math.round(i18nResults.buildTime * 10) / 10,
      Math.round(i18nMicroResults.buildTime * 10) / 10,
    ]

    // Code bundle sizes for chart (in MB) - excludes translation JSON files
    const codeBundleSizesMB = [
      Math.round((plainNuxtResults.bundleSize?.codeTotal || 0) / 1024 / 1024 * 10) / 10,
      Math.round((i18nResults.bundleSize?.codeTotal || 0) / 1024 / 1024 * 10) / 10,
      Math.round((i18nMicroResults.bundleSize?.codeTotal || 0) / 1024 / 1024 * 10) / 10,
    ]

    // Translation sizes for chart (in MB)
    const translationSizesMB = [
      Math.round((plainNuxtResults.bundleSize?.translationsTotal || 0) / 1024 / 1024 * 10) / 10,
      Math.round((i18nResults.bundleSize?.translationsTotal || 0) / 1024 / 1024 * 10) / 10,
      Math.round((i18nMicroResults.bundleSize?.translationsTotal || 0) / 1024 / 1024 * 10) / 10,
    ]

    // Generate and save build comparison charts
    const { buildTimeConfig, bundleSizeConfig } = generateBuildComparisonCharts(buildTimes, codeBundleSizesMB, translationSizesMB)
    saveChartJsConfig('build-time-comparison.js', buildTimeConfig)
    saveChartJsConfig('bundle-size-comparison.js', bundleSizeConfig)

    writeToMarkdown(`
## Build Performance Summary

| Project | Build Time | Code Bundle | Translations | Total |
|---------|------------|-------------|--------------|-------|
| **plain-nuxt** (baseline) | ${plainNuxtResults.buildTime.toFixed(2)}s | ${formatBytes(plainNuxtResults.bundleSize?.codeTotal || 0)} | ${formatBytes(plainNuxtResults.bundleSize?.translationsTotal || 0)} | ${formatBytes(plainNuxtResults.bundleSize?.total || 0)} |
| **i18n v10** | ${i18nResults.buildTime.toFixed(2)}s | ${formatBytes(i18nResults.bundleSize?.codeTotal || 0)} | ${formatBytes(i18nResults.bundleSize?.translationsTotal || 0)} | ${formatBytes(i18nResults.bundleSize?.total || 0)} |
| **i18n-micro** | ${i18nMicroResults.buildTime.toFixed(2)}s | ${formatBytes(i18nMicroResults.bundleSize?.codeTotal || 0)} | ${formatBytes(i18nMicroResults.bundleSize?.translationsTotal || 0)} | ${formatBytes(i18nMicroResults.bundleSize?.total || 0)} |

> **Note**: "Code Bundle" = JavaScript/CSS code. "Translations" = JSON translation files in locales directories.
> i18n-micro stores translations as lazy-loaded JSON files, while i18n v10 compiles them into JS bundles.

### Build Time Comparison

\`\`\`chart
url: /charts/build-time-comparison.js
height: 350px
\`\`\`

### Bundle Size Comparison (Code vs Translations)

\`\`\`chart
url: /charts/bundle-size-comparison.js
height: 400px
\`\`\`

**Code Bundle Comparison** (lower is better):
- **i18n v10 vs baseline**: ${formatBytes((i18nResults.bundleSize?.codeTotal || 0) - (plainNuxtResults.bundleSize?.codeTotal || 0))} larger
- **i18n-micro vs baseline**: ${formatBytes((i18nMicroResults.bundleSize?.codeTotal || 0) - (plainNuxtResults.bundleSize?.codeTotal || 0))} larger
- **i18n-micro vs i18n v10**: ${formatBytes(Math.abs((i18nMicroResults.bundleSize?.codeTotal || 0) - (i18nResults.bundleSize?.codeTotal || 0)))} ${(i18nMicroResults.bundleSize?.codeTotal || 0) < (i18nResults.bundleSize?.codeTotal || 0) ? 'smaller' : 'larger'}

`)

    const artilleryConfigPath = './artillery-config.yml'

    // 2. Stress tests
    const plainNuxtStressResults = await stressTestServerWithArtillery('./test/fixtures/plain-nuxt', 'plain-nuxt', artilleryConfigPath)
    await pause(5000)
    const i18nStressResults = await stressTestServerWithArtillery('./test/fixtures/i18n', 'i18n', artilleryConfigPath)
    await pause(5000)
    const i18nMicroStressResults = await stressTestServerWithArtillery('./test/fixtures/i18n-micro', 'i18n-micro', artilleryConfigPath)

    // 3. Summary tables and comparison charts
    const comparisonResults = [
      { name: 'plain-nuxt', autocannon: plainNuxtStressResults.autocannon, artillery: plainNuxtStressResults.artillery },
      { name: 'i18n-v10', autocannon: i18nStressResults.autocannon, artillery: i18nStressResults.artillery },
      { name: 'i18n-micro', autocannon: i18nMicroStressResults.autocannon, artillery: i18nMicroStressResults.artillery },
    ]
    const { rpsConfig, latencyConfig, artilleryRpsConfig } = generateComparisonCharts(comparisonResults)
    saveChartJsConfig('comparison-rps-autocannon.js', rpsConfig)
    saveChartJsConfig('comparison-rps-artillery.js', artilleryRpsConfig)
    saveChartJsConfig('comparison-latency.js', latencyConfig)
    const comparisonCharts = generateComparisonMarkdown(comparisonResults)

    writeToMarkdown(`
## Stress Test Summary

### Artillery Results
| Project | Avg Response | P95 | P99 | RPS | Error Rate |
|---------|--------------|-----|-----|-----|------------|
| **plain-nuxt** | ${plainNuxtStressResults.responseTimeAvg?.toFixed(2) ?? 'N/A'} ms | ${plainNuxtStressResults.responseTimeP95?.toFixed(2) ?? 'N/A'} ms | ${plainNuxtStressResults.responseTimeP99?.toFixed(2) ?? 'N/A'} ms | ${plainNuxtStressResults.requestsPerSecond?.toFixed(2) ?? 'N/A'} | ${plainNuxtStressResults.errorRate?.toFixed(2) ?? 'N/A'}% |
| **i18n v10** | ${i18nStressResults.responseTimeAvg?.toFixed(2) ?? 'N/A'} ms | ${i18nStressResults.responseTimeP95?.toFixed(2) ?? 'N/A'} ms | ${i18nStressResults.responseTimeP99?.toFixed(2) ?? 'N/A'} ms | ${i18nStressResults.requestsPerSecond?.toFixed(2) ?? 'N/A'} | ${i18nStressResults.errorRate?.toFixed(2) ?? 'N/A'}% |
| **i18n-micro** | ${i18nMicroStressResults.responseTimeAvg?.toFixed(2) ?? 'N/A'} ms | ${i18nMicroStressResults.responseTimeP95?.toFixed(2) ?? 'N/A'} ms | ${i18nMicroStressResults.responseTimeP99?.toFixed(2) ?? 'N/A'} ms | ${i18nMicroStressResults.requestsPerSecond?.toFixed(2) ?? 'N/A'} | ${i18nMicroStressResults.errorRate?.toFixed(2) ?? 'N/A'}% |

### Autocannon Results (10 connections, 10s)
| Project | Avg Latency | P50 | P95 | P99 | Max | RPS |
|---------|-------------|-----|-----|-----|-----|-----|
| **plain-nuxt** | ${plainNuxtStressResults.autocannon?.latency.average.toFixed(2) ?? 'N/A'} ms | ${plainNuxtStressResults.autocannon?.latency.p50.toFixed(2) ?? 'N/A'} ms | ${plainNuxtStressResults.autocannon?.latency.p97_5.toFixed(2) ?? 'N/A'} ms | ${plainNuxtStressResults.autocannon?.latency.p99.toFixed(2) ?? 'N/A'} ms | ${plainNuxtStressResults.autocannon?.latency.max.toFixed(2) ?? 'N/A'} ms | ${plainNuxtStressResults.autocannon?.requests.average.toFixed(2) ?? 'N/A'} |
| **i18n v10** | ${i18nStressResults.autocannon?.latency.average.toFixed(2) ?? 'N/A'} ms | ${i18nStressResults.autocannon?.latency.p50.toFixed(2) ?? 'N/A'} ms | ${i18nStressResults.autocannon?.latency.p97_5.toFixed(2) ?? 'N/A'} ms | ${i18nStressResults.autocannon?.latency.p99.toFixed(2) ?? 'N/A'} ms | ${i18nStressResults.autocannon?.latency.max.toFixed(2) ?? 'N/A'} ms | ${i18nStressResults.autocannon?.requests.average.toFixed(2) ?? 'N/A'} |
| **i18n-micro** | ${i18nMicroStressResults.autocannon?.latency.average.toFixed(2) ?? 'N/A'} ms | ${i18nMicroStressResults.autocannon?.latency.p50.toFixed(2) ?? 'N/A'} ms | ${i18nMicroStressResults.autocannon?.latency.p97_5.toFixed(2) ?? 'N/A'} ms | ${i18nMicroStressResults.autocannon?.latency.p99.toFixed(2) ?? 'N/A'} ms | ${i18nMicroStressResults.autocannon?.latency.max.toFixed(2) ?? 'N/A'} ms | ${i18nMicroStressResults.autocannon?.requests.average.toFixed(2) ?? 'N/A'} |

${comparisonCharts}
`)

    // 4. Comparisons
    logAndWriteComparisonResults('plain-nuxt (baseline)', 'i18n v10', plainNuxtStressResults, i18nStressResults)
    logAndWriteComparisonResults('plain-nuxt (baseline)', 'i18n-micro', plainNuxtStressResults, i18nMicroStressResults)
    logAndWriteComparisonResults('i18n v10', 'i18n-micro', i18nStressResults, i18nMicroStressResults)

    addTestLogicExplanation()
  }, { timeout: 1800000 }) // 30 minutes timeout
})
