import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { repoRoot } from '../utils/workspace'
import type { ArtilleryResult, AutocannonResult } from './types'

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
  console.log(`Chart config saved to: ${filePath}`)
}

function extractChartData(artillery: ArtilleryResult) {
  const intermediate = artillery.intermediate || []
  return intermediate.map((entry, index) => ({
    timestamp: index * 10,
    requestRate: entry.rates['http.request_rate'] || 0,
    responseTimeP95: entry.summaries?.['http.response_time']?.p95 || 0,
    vusersActive: (entry.counters['vusers.created'] || 0) - (entry.counters['vusers.completed'] || 0) - (entry.counters['vusers.failed'] || 0),
    vusersFailed: entry.counters['vusers.failed'] || 0,
  }))
}

function generateChartJsConfig(name: string, artillery: ArtilleryResult): { trafficConfig: object; latencyConfig: object } {
  const intermediate = artillery.intermediate || []
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
    avgReqPerSec: artillery.aggregate.rates['http.request_rate'] || 0,
    peakReqPerSec: Math.max(...data.map((d) => d.requestRate), 0),
  }

  const completedPercent = summary.vusersCreated > 0 ? ((summary.completed / summary.vusersCreated) * 100).toFixed(2) : '0'
  const failedPercent = summary.vusersCreated > 0 ? ((summary.failed / summary.vusersCreated) * 100).toFixed(2) : '0'
  const safeName = name.replace(/[^a-z0-9-]/gi, '-')

  return `
#### Load Summary - ${name}

| **${summary.vusersCreated.toLocaleString()}** | **${summary.completed.toLocaleString()}** completed | **${summary.avgReqPerSec.toFixed(0)}** | **${summary.peakReqPerSec.toFixed(0)}** |
|:---:|:---:|:---:|:---:|
| vusers created | ${completedPercent}% / ${failedPercent}% failed | average req/s | peak req/s |

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

export async function generateAndSaveChart(name: string, artillery: ArtilleryResult): Promise<string> {
  const data = extractChartData(artillery)
  const { trafficConfig, latencyConfig } = generateChartJsConfig(name, artillery)
  const safeName = name.replace(/[^a-z0-9-]/gi, '-')

  saveChartJsConfig(`${safeName}-traffic.js`, trafficConfig)
  saveChartJsConfig(`${safeName}-latency.js`, latencyConfig)

  const jsonPath = join(chartsDir, `${safeName}-data.json`)
  const summary = {
    vusersCreated: artillery.aggregate.counters['vusers.created'] || 0,
    completed: artillery.aggregate.counters['vusers.completed'] || 0,
    failed: artillery.aggregate.counters['vusers.failed'] || 0,
    avgReqPerSec: artillery.aggregate.rates['http.request_rate'] || 0,
    peakReqPerSec: Math.max(...data.map((d) => d.requestRate), 0),
  }
  writeFileSync(jsonPath, JSON.stringify({ data, summary, intermediate: artillery.intermediate }, null, 2))

  return generateChartMarkdown(name, artillery)
}

export function generateComparisonCharts(results: { name: string; autocannon?: AutocannonResult; artillery?: ArtilleryResult }[]): {
  rpsConfig: object
  latencyConfig: object
  artilleryRpsConfig: object
} {
  const labels = results.map((r) => r.name)
  const colors = results.map((_, i) => [chartColors.plainNuxt, chartColors.i18nV10, chartColors.i18nMicro][i % 3])

  const rpsConfig = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Requests per Second',
          data: results.map((r) => Math.round(r.autocannon?.requests.average || 0)),
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: 'Requests per Second - Autocannon (higher is better)', font: { size: 16, weight: 'bold' } },
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'RPS' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        x: { grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      },
    },
  }

  const artilleryRpsConfig = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Requests per Second',
          data: results.map((r) => Math.round(r.artillery?.aggregate.rates['http.request_rate'] || 0)),
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: 'Requests per Second - Artillery (higher is better)', font: { size: 16, weight: 'bold' } },
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'RPS' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        x: { grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      },
    },
  }

  const latencyConfig = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Avg',
          data: results.map((r) => Math.round(r.autocannon?.latency.average || 0)),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1,
        },
        {
          label: 'P50',
          data: results.map((r) => Math.round(r.autocannon?.latency.p50 || 0)),
          backgroundColor: 'rgba(255, 206, 86, 0.8)',
          borderColor: 'rgb(255, 206, 86)',
          borderWidth: 1,
        },
        {
          label: 'P95',
          data: results.map((r) => Math.round(r.autocannon?.latency.p97_5 || 0)),
          backgroundColor: 'rgba(255, 159, 64, 0.8)',
          borderColor: 'rgb(255, 159, 64)',
          borderWidth: 1,
        },
        {
          label: 'P99',
          data: results.map((r) => Math.round(r.autocannon?.latency.p99 || 0)),
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
        title: { display: true, text: 'Latency Percentiles (lower is better)', font: { size: 16, weight: 'bold' } },
        legend: { position: 'bottom', labels: { usePointStyle: true } },
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Latency (ms)' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        x: { grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      },
    },
  }

  return { rpsConfig, latencyConfig, artilleryRpsConfig }
}

export function generateBuildComparisonCharts(
  labels: string[],
  buildTimes: number[],
  codeBundleSizesMB: number[],
  translationSizesMB: number[],
  totalBundleSizesMB: number[],
): { buildTimeConfig: object; bundleSizeConfig: object; translationsConfig: object; totalBundleConfig: object } {
  const colors = labels.map((_, i) => [chartColors.plainNuxt, chartColors.i18nV10, chartColors.i18nMicro][i % 3])

  const buildTimeConfig = {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Build Time (seconds)', data: buildTimes, backgroundColor: colors, borderColor: colors, borderWidth: 2 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: 'Build Time (lower is better)', font: { size: 16, weight: 'bold' } },
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Seconds' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        x: { grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      },
    },
  }

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
        title: { display: true, text: 'Bundle Size: Code vs Translations (lower is better)', font: { size: 16, weight: 'bold' } },
        legend: { position: 'bottom', labels: { usePointStyle: true } },
      },
      scales: {
        y: { beginAtZero: true, stacked: true, title: { display: true, text: 'MB' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        x: { stacked: true, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      },
    },
  }

  const translationsConfig = {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Translations (MB)', data: translationSizesMB, backgroundColor: colors, borderColor: colors, borderWidth: 2 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: 'Translations Size (lower is better)', font: { size: 16, weight: 'bold' } },
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'MB' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        x: { grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      },
    },
  }

  const totalBundleConfig = {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Total Bundle (MB)', data: totalBundleSizesMB, backgroundColor: colors, borderColor: colors, borderWidth: 2 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: 'Total Deployable Output (lower is better)', font: { size: 16, weight: 'bold' } },
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'MB' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        x: { grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      },
    },
  }

  return { buildTimeConfig, bundleSizeConfig, translationsConfig, totalBundleConfig }
}

export function generateComparisonMarkdown(results: { name: string; autocannon?: AutocannonResult; artillery?: ArtilleryResult }[]): string {
  const rpsWinner = results.reduce((best, curr) =>
    (curr.autocannon?.requests.average || 0) > (best.autocannon?.requests.average || 0) ? curr : best,
  )
  const latencyWinner = results.reduce((best, curr) =>
    (curr.autocannon?.latency.average || Infinity) < (best.autocannon?.latency.average || Infinity) ? curr : best,
  )
  const p99Winner = results.reduce((best, curr) =>
    (curr.autocannon?.latency.p99 || Infinity) < (best.autocannon?.latency.p99 || Infinity) ? curr : best,
  )

  return `
## Performance Comparison

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

| Metric | ${results.map((r) => `**${r.name}**`).join(' | ')} | Best |
|--------|${results.map(() => '---').join('|')}|------|
| RPS (Autocannon) | ${results.map((r) => `${r.autocannon?.requests.average.toFixed(0) || 'N/A'}`).join(' | ')} | ${rpsWinner.name} |
| Avg Latency | ${results.map((r) => `${r.autocannon?.latency.average.toFixed(2) || 'N/A'} ms`).join(' | ')} | ${latencyWinner.name} |
| P99 Latency | ${results.map((r) => `${r.autocannon?.latency.p99.toFixed(2) || 'N/A'} ms`).join(' | ')} | ${p99Winner.name} |
| Errors | ${results.map((r) => `${r.autocannon?.errors || 0}`).join(' | ')} | - |

`
}
