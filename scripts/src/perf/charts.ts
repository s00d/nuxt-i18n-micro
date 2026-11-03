import type { ArtilleryResult, LoadMetrics } from 'untestutils/perf'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { repoRoot } from '../utils/workspace'

export const chartsDir = join(repoRoot, 'docs/public/charts')

const chartColors = {
  requestRate: 'rgb(255, 159, 64)',
  responseTimeP95: 'rgb(75, 192, 192)',
  vusersCreated: 'rgb(153, 102, 255)',
  vusersActive: 'rgb(46, 204, 113)',
  vusersFailed: 'rgb(255, 99, 132)',
  plainNuxt: 'rgb(75, 192, 192)',
  i18nV10: 'rgb(255, 99, 132)',
  i18nMicro: 'rgb(46, 204, 113)',
}

function ensureChartsDir(): void {
  if (!existsSync(chartsDir)) mkdirSync(chartsDir, { recursive: true })
}

export function saveChartJsConfig(filename: string, config: object): void {
  ensureChartsDir()
  const jsContent = `// Auto-generated Chart.js config
export default function() {
  return ${JSON.stringify(config, null, 2)};
}
`
  const filePath = join(chartsDir, filename)
  writeFileSync(filePath, jsContent)
}

/** One summary line after a batch of chart writes. */
export function logChartsSaved(count: number): void {
  console.log(`Chart configs saved: ${count} → ${chartsDir}`)
}

function sortIntermediateByPeriod<T extends { period?: string | number }>(intermediate: T[]): T[] {
  return [...intermediate].sort((a, b) => {
    const ap = Number(a.period ?? 0)
    const bp = Number(b.period ?? 0)
    return ap - bp
  })
}

function extractChartData(artillery: ArtilleryResult) {
  const intermediate = sortIntermediateByPeriod(artillery.intermediate || [])
  return intermediate.map((entry, index) => ({
    timestamp: index * 10,
    requestRate: entry.rates['http.request_rate'] || 0,
    responseTimeP95: entry.summaries?.['http.response_time']?.p95 || 0,
    vusersActive: (entry.counters['vusers.created'] || 0) - (entry.counters['vusers.completed'] || 0) - (entry.counters['vusers.failed'] || 0),
    vusersFailed: entry.counters['vusers.failed'] || 0,
  }))
}

function generateChartJsConfig(name: string, artillery: ArtilleryResult): { trafficConfig: object; latencyConfig: object } {
  const intermediate = sortIntermediateByPeriod(artillery.intermediate || [])
  const timeSeriesData = intermediate.map((entry, index) => ({
    time: `${index * 10}s`,
    requestRate: entry.rates['http.request_rate'] || 0,
    responseTimeP95: entry.summaries?.['http.response_time']?.p95 || 0,
    vusersCreated: entry.counters['vusers.created'] || 0,
    vusersActive: Math.max(
      0,
      (entry.counters['vusers.created'] || 0) - (entry.counters['vusers.completed'] || 0) - (entry.counters['vusers.failed'] || 0),
    ),
    vusersFailed: entry.counters['vusers.failed'] || 0,
  }))

  const labels = timeSeriesData.map((d) => d.time)

  const trafficConfig = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'http.request_rate',
          data: timeSeriesData.map((d) => Math.round(d.requestRate)),
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
          data: timeSeriesData.map((d) => Math.round(d.responseTimeP95)),
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
          data: timeSeriesData.map((d) => Math.round(d.vusersCreated)),
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
          data: timeSeriesData.map((d) => Math.round(d.vusersActive)),
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
          data: timeSeriesData.map((d) => Math.round(d.vusersFailed)),
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
      interaction: { mode: 'index', intersect: false },
      plugins: {
        title: { display: true, text: `Load Summary - ${name}`, font: { size: 16, weight: 'bold' } },
        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } },
      },
      scales: {
        x: { display: true, title: { display: true, text: 'Time' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
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

  const latencyConfig = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'P95 Latency (ms)',
          data: timeSeriesData.map((d) => Math.round(d.responseTimeP95)),
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
        title: { display: true, text: `Response Time P95 - ${name}`, font: { size: 16, weight: 'bold' } },
        legend: { position: 'bottom', labels: { usePointStyle: true } },
      },
      scales: {
        x: { display: true, title: { display: true, text: 'Time' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
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

export function generateChartMarkdown(name: string, artillery: ArtilleryResult): string {
  const data = extractChartData(artillery)
  const summary = {
    vusersCreated: artillery.aggregate.counters['vusers.created'] || 0,
    completed: artillery.aggregate.counters['vusers.completed'] || 0,
    failed: artillery.aggregate.counters['vusers.failed'] || 0,
    skipped: artillery.aggregate.counters['vusers.skipped'] || 0,
    avgReqPerSec: artillery.aggregate.rates['http.request_rate'] || 0,
    peakReqPerSec: Math.max(...data.map((d) => d.requestRate), 0),
  }

  const completedPercent = summary.vusersCreated > 0 ? ((summary.completed / summary.vusersCreated) * 100).toFixed(2) : '0'
  const failedPercent = summary.vusersCreated > 0 ? ((summary.failed / summary.vusersCreated) * 100).toFixed(2) : '0'
  const skippedPercent =
    summary.vusersCreated + summary.skipped > 0 ? ((summary.skipped / (summary.vusersCreated + summary.skipped)) * 100).toFixed(2) : '0'
  const safeName = name.replace(/[^a-z0-9-]/gi, '-')

  return `
#### Load Summary - ${name}

| **${summary.vusersCreated.toLocaleString()}** | **${summary.completed.toLocaleString()}** completed | **${summary.skipped.toLocaleString()}** skipped | **${summary.avgReqPerSec.toFixed(0)}** | **${summary.peakReqPerSec.toFixed(0)}** |
|:---:|:---:|:---:|:---:|:---:|
| vusers created | ${completedPercent}% / ${failedPercent}% failed | ${skippedPercent}% of attempts | average req/s | peak req/s |

\`\`\`chart
url: /charts/${safeName}-traffic.js
height: 400px
\`\`\`

\`\`\`chart
url: /charts/${safeName}-latency.js
height: 300px
\`\`\`
`
}

export function generateAndSaveChart(name: string, artillery: ArtilleryResult): string {
  const ordered: ArtilleryResult = {
    ...artillery,
    intermediate: sortIntermediateByPeriod(artillery.intermediate || []),
  }
  const data = extractChartData(ordered)
  const { trafficConfig, latencyConfig } = generateChartJsConfig(name, ordered)
  const safeName = name.replace(/[^a-z0-9-]/gi, '-')

  saveChartJsConfig(`${safeName}-traffic.js`, trafficConfig)
  saveChartJsConfig(`${safeName}-latency.js`, latencyConfig)

  const jsonPath = join(chartsDir, `${safeName}-data.json`)
  const summary = {
    vusersCreated: ordered.aggregate.counters['vusers.created'] || 0,
    completed: ordered.aggregate.counters['vusers.completed'] || 0,
    failed: ordered.aggregate.counters['vusers.failed'] || 0,
    skipped: ordered.aggregate.counters['vusers.skipped'] || 0,
    avgReqPerSec: ordered.aggregate.rates['http.request_rate'] || 0,
    peakReqPerSec: Math.max(...data.map((d) => d.requestRate), 0),
  }
  writeFileSync(jsonPath, JSON.stringify({ data, summary, intermediate: ordered.intermediate }, null, 2))

  return generateChartMarkdown(name, ordered)
}

const GRID = { color: 'rgba(255, 255, 255, 0.1)' }

interface Dataset {
  label: string
  data: number[]
  backgroundColor: string | string[]
  borderColor: string | string[]
  borderWidth: number
}

function barChart(labels: string[], datasets: Dataset[], title: string, axis: string, stacked?: boolean) {
  return {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: title, font: { size: 16, weight: 'bold' } },
        legend: datasets.length > 1 ? { position: 'bottom', labels: { usePointStyle: true } } : { display: false },
      },
      scales: {
        y: { beginAtZero: true, ...(stacked && { stacked }), title: { display: true, text: axis }, grid: GRID },
        x: { ...(stacked && { stacked }), grid: GRID },
      },
    },
  }
}

/** One dataset with a color per bar. */
const coloredBars = (label: string, data: number[], colors: string[]): Dataset => ({
  label,
  data,
  backgroundColor: colors,
  borderColor: colors,
  borderWidth: 2,
})

/** One series of a grouped chart, `rgb` as `75, 192, 192`. */
const series = (label: string, data: number[], rgb: string, borderWidth: number): Dataset => ({
  label,
  data,
  backgroundColor: `rgba(${rgb}, 0.8)`,
  borderColor: `rgb(${rgb})`,
  borderWidth,
})

export function generateComparisonCharts(results: { name: string; load?: LoadMetrics }[]): {
  rpsConfig: object
  latencyConfig: object
} {
  const labels = results.map((r) => r.name)
  const colors = results.map((_, i) => [chartColors.plainNuxt, chartColors.i18nV10, chartColors.i18nMicro][i % 3])
  const metric = (key: keyof LoadMetrics) => results.map((r) => Math.round(Number(r.load?.[key]) || 0))

  return {
    rpsConfig: barChart(
      labels,
      [coloredBars('Requests per Second', metric('requestsPerSecond'), colors)],
      'Requests per Second - Artillery (higher is better)',
      'RPS',
    ),
    latencyConfig: barChart(
      labels,
      [
        series('Avg', metric('responseTimeAvg'), '75, 192, 192', 1),
        series('P50', metric('responseTimeP50'), '255, 206, 86', 1),
        series('P95', metric('responseTimeP95'), '255, 159, 64', 1),
        series('P99', metric('responseTimeP99'), '255, 99, 132', 1),
      ],
      'Latency Percentiles (lower is better)',
      'Latency (ms)',
    ),
  }
}

export function generateBuildComparisonCharts(
  labels: string[],
  buildTimes: number[],
  codeBundleSizesMB: number[],
  translationSizesMB: number[],
  totalBundleSizesMB: number[],
): { buildTimeConfig: object; bundleSizeConfig: object; translationsConfig: object; totalBundleConfig: object } {
  const colors = labels.map((_, i) => [chartColors.plainNuxt, chartColors.i18nV10, chartColors.i18nMicro][i % 3])

  return {
    buildTimeConfig: barChart(labels, [coloredBars('Build Time (seconds)', buildTimes, colors)], 'Build Time (lower is better)', 'Seconds'),
    bundleSizeConfig: barChart(
      labels,
      [series('Code Bundle (MB)', codeBundleSizesMB, '75, 192, 192', 2), series('Translations (MB)', translationSizesMB, '255, 206, 86', 2)],
      'Bundle Size: Code vs Translations (lower is better)',
      'MB',
      true,
    ),
    translationsConfig: barChart(labels, [coloredBars('Translations (MB)', translationSizesMB, colors)], 'Translations Size (lower is better)', 'MB'),
    totalBundleConfig: barChart(
      labels,
      [coloredBars('Total Bundle (MB)', totalBundleSizesMB, colors)],
      'Total Deployable Output (lower is better)',
      'MB',
    ),
  }
}

export function generateComparisonMarkdown(results: { name: string; load?: LoadMetrics }[]): string {
  const rpsWinner = results.reduce((best, curr) => ((curr.load?.requestsPerSecond || 0) > (best.load?.requestsPerSecond || 0) ? curr : best))
  const latencyWinner = results.reduce((best, curr) =>
    (curr.load?.responseTimeAvg || Infinity) < (best.load?.responseTimeAvg || Infinity) ? curr : best,
  )
  const p99Winner = results.reduce((best, curr) =>
    (curr.load?.responseTimeP99 || Infinity) < (best.load?.responseTimeP99 || Infinity) ? curr : best,
  )

  return `
## Performance Comparison

### Throughput (Requests per Second)

> **Winner: ${rpsWinner.name}** with ${rpsWinner.load?.requestsPerSecond?.toFixed(0) ?? 'N/A'} RPS

\`\`\`chart
url: /charts/comparison-rps-artillery.js
height: 350px
\`\`\`

### Latency Distribution

> **Winner: ${latencyWinner.name}** with ${latencyWinner.load?.responseTimeAvg?.toFixed(2) ?? 'N/A'} ms avg latency

\`\`\`chart
url: /charts/comparison-latency.js
height: 350px
\`\`\`

### Quick Comparison

| Metric | ${results.map((r) => `**${r.name}**`).join(' | ')} | Best |
|--------|${results.map(() => '---').join('|')}|------|
| RPS (Artillery) | ${results.map((r) => `${r.load?.requestsPerSecond?.toFixed(0) || 'N/A'}`).join(' | ')} | ${rpsWinner.name} |
| Avg Latency | ${results.map((r) => `${r.load?.responseTimeAvg?.toFixed(2) || 'N/A'} ms`).join(' | ')} | ${latencyWinner.name} |
| P99 Latency | ${results.map((r) => `${r.load?.responseTimeP99?.toFixed(2) || 'N/A'} ms`).join(' | ')} | ${p99Winner.name} |
| Error rate | ${results.map((r) => `${r.load?.errorRate?.toFixed(2) ?? 'N/A'}%`).join(' | ')} | - |

`
}
