import { appendFileSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { repoRoot } from '../utils/workspace'
import {
  generateAndSaveChart,
  generateBuildComparisonCharts,
  generateComparisonCharts,
  generateComparisonMarkdown,
  saveChartJsConfig,
} from './charts'
import { fixtureProfileMarkdown, leafKeysFor } from './config'
import { formatBytes } from './format'
import { fixtureById, fixtureSourceAbsDir, type PerfFixtureDef } from './fixtures'
import type { FixtureId, FixtureRunResult, PerfRuntimeProfile, PerformanceResult, ResolvedPerfArgs } from './types'

const require = createRequire(import.meta.url)
export const resultsFilePath = join(repoRoot, 'docs/guide/performance-results.md')

function getInstalledVersion(packageName: string, fromDir: string): string {
  try {
    const pkgJsonPath = require.resolve(`${packageName}/package.json`, { paths: [fromDir] })
    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8')) as { version?: string }
    return pkg.version || 'N/A'
  } catch {
    return 'N/A'
  }
}

function getVersion(packagePath: string, key: string): string {
  if (!existsSync(packagePath)) return 'N/A'
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8')) as Record<string, unknown>
  return (packageJson[key] as string) || 'N/A'
}

export function dirSizeBytes(dir: string): number {
  if (!existsSync(dir)) return 0
  let total = 0
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) total += dirSizeBytes(full)
    else total += statSync(full).size
  }
  return total
}

export function measureSourceDictionaries(fixtures: PerfFixtureDef[]): Record<FixtureId, number> {
  const out = {} as Record<FixtureId, number>
  for (const fixture of fixtures) {
    out[fixture.id] = dirSizeBytes(fixtureSourceAbsDir(fixture))
  }
  return out
}

function meanNote(runs: number): string {
  return ` (mean of ${runs} run${runs === 1 ? '' : 's'})`
}

export function createMarkdownWriter(enabled: boolean): {
  init: (profile: PerfRuntimeProfile, runs: number) => void
  write: (content: string) => void
} {
  return {
    init(profile, runs) {
      if (!enabled) return
      const header = `---
title: "Performance Test Results"
description: "Benchmarks vs nuxt-i18n on real fixtures."
outline: "deep"
---

# Performance Test Results

## Project Information

- **[plain-nuxt](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/plain-nuxt)**: ./test/fixtures/plain-nuxt
- **[i18n-micro](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n-micro)**: ./test/fixtures/i18n-micro
- **[i18n](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n)**: ./test/fixtures/i18n
- **[CLI](https://github.com/s00d/nuxt-i18n-micro/tree/main/scripts/src/commands/performance.ts)**: \`pnpm -C scripts cli performance\` / \`pnpm test:performance\`

### Description

Compares **plain Nuxt** (baseline without an i18n module), **i18n-micro**, and **\`@nuxtjs/i18n\` v10.6** under one shared dictionary profile.

Focus: build time, peak RSS, deployable **code vs translations vs total**, and server behaviour under Artillery + Autocannon.

### Methodology notes

- Metrics are **means of ${runs} consecutive runs per fixture** (fixture A ×${runs}, then B ×${runs}, then C ×${runs} — not interleaved).
- **Translations** include locale JSON under \`locales/\` / \`_locales/\` / \`translations/\`, everything under \`chunks/raw/\`, and matching locale chunks. Older reports that showed \`@nuxtjs/i18n\` “translations: 0 B” and a huge “code” column were counting message chunks as app code.
- **plain-nuxt** serves the same leaf volume as static \`public/translations\` JSON (not static JS imports). Under Artillery that baseline is I/O-heavy; it is not “i18n overhead”, it is the cost of fetching large JSON per request.

### Runs

All metrics below are **means across ${runs} runs**.

---
`
      writeFileSync(resultsFilePath, header)
      appendFileSync(resultsFilePath, `\n${fixtureProfileMarkdown(profile)}\n`)

      const i18nFixtureDir = join(repoRoot, 'test/fixtures/i18n')
      const rootPackagePath = join(repoRoot, 'package.json')
      const nuxtVersion = getInstalledVersion('nuxt', i18nFixtureDir)
      const dependencies = {
        node: process.version,
        nuxt: nuxtVersion === 'N/A' ? getInstalledVersion('nuxt', repoRoot) : nuxtVersion,
        'nuxt-i18n-micro': getVersion(rootPackagePath, 'version'),
        '@nuxtjs/i18n': getInstalledVersion('@nuxtjs/i18n', i18nFixtureDir),
      }

      appendFileSync(
        resultsFilePath,
        `
## Dependency Versions

| Dependency | Version |
|------------|---------|
${Object.entries(dependencies)
  .map(([dep, version]) => `| ${dep} | ${version} |`)
  .join('\n')}
`,
      )
    },
    write(content) {
      if (!enabled) return
      appendFileSync(resultsFilePath, content)
    },
  }
}

export function printConsoleReport(results: FixtureRunResult[], args: ResolvedPerfArgs): void {
  console.log(`\n========== Performance summary${meanNote(args.runs)} ==========`)
  console.log(
    `Profile: ${args.profile.locales.length} locales, index branch ${args.profile.branch} (~${leafKeysFor(args.profile.branch).toLocaleString('en-US')} leaves), pages: ${args.profile.pages.map((p) => p.name).join(', ')}`,
  )

  for (const r of results) {
    const b = r.build
    console.log(
      `${r.label}: build ${b.buildTime.toFixed(2)}s, mem peak ${b.maxMemoryUsed.toFixed(0)} MB, bundle ${formatBytes(b.bundleSize?.total || 0)} (code ${formatBytes(b.bundleSize?.codeTotal || 0)} / tr ${formatBytes(b.bundleSize?.translationsTotal || 0)})`,
    )
    if (r.stress) {
      console.log(
        `  stress: artillery ${r.stress.requestsPerSecond?.toFixed(1) ?? 'N/A'} RPS / ${r.stress.responseTimeAvg?.toFixed(1) ?? 'N/A'} ms avg; autocannon ${r.stress.autocannon?.requests.average.toFixed(1) ?? 'N/A'} RPS / ${r.stress.autocannon?.latency.average.toFixed(1) ?? 'N/A'} ms`,
      )
    }
  }
  console.log('==================================================\n')

  // Detailed console when a single fixture was selected
  if (results.length !== 1 || args.writeDocs) return
  const result = results[0]!
  const b = result.build
  console.log(`### Build detail — ${result.label}`)
  console.log(`- Build time: ${b.buildTime.toFixed(2)}s`)
  console.log(`- CPU max/avg: ${b.maxCpuUsage.toFixed(1)}% / ${b.avgCpuUsage.toFixed(1)}%`)
  console.log(`- Memory max/avg: ${b.maxMemoryUsed.toFixed(1)} MB / ${b.avgMemoryUsed.toFixed(1)} MB`)
  if (b.bundleSize) {
    console.log(`- Code: ${formatBytes(b.bundleSize.codeTotal)}`)
    console.log(`- Translations: ${formatBytes(b.bundleSize.translationsTotal)}`)
    console.log(`- Total: ${formatBytes(b.bundleSize.total)}`)
  }
  if (!result.stress) return
  const s = result.stress
  console.log(`### Stress detail — ${result.label}`)
  console.log(`- Artillery RPS: ${s.requestsPerSecond?.toFixed(2) ?? 'N/A'}`)
  console.log(`- Artillery latency avg/p95/p99: ${s.responseTimeAvg?.toFixed(2)} / ${s.responseTimeP95?.toFixed(2)} / ${s.responseTimeP99?.toFixed(2)} ms`)
  console.log(`- Autocannon RPS: ${s.autocannon?.requests.average.toFixed(2) ?? 'N/A'}`)
  console.log(
    `- Autocannon latency avg/p50/p95/p99: ${s.autocannon?.latency.average.toFixed(2)} / ${s.autocannon?.latency.p50.toFixed(2)} / ${s.autocannon?.latency.p97_5.toFixed(2)} / ${s.autocannon?.latency.p99.toFixed(2)} ms`,
  )
  console.log(`- Errors: ${s.autocannon?.errors ?? 0}, error rate: ${s.errorRate?.toFixed(2) ?? 'N/A'}%`)
}

function writeBuildSection(write: (c: string) => void, id: FixtureId, build: PerformanceResult): void {
  write(`
## Build Performance for test/fixtures/${id}

- **Build Time**: ${build.buildTime.toFixed(2)} seconds
- **Bundle Size**: ${formatBytes(build.bundleSize?.total || 0)} (code: ${formatBytes(build.bundleSize?.codeTotal || 0)}, translations: ${formatBytes(build.bundleSize?.translationsTotal || 0)})
- **Code Bundle**: client: ${formatBytes(build.bundleSize?.clientCode || 0)}, server: ${formatBytes(build.bundleSize?.serverCode || 0)}
- **Max / Avg CPU**: ${build.maxCpuUsage.toFixed(2)}% / ${build.avgCpuUsage.toFixed(2)}%
- **Max / Avg Memory**: ${build.maxMemoryUsed.toFixed(2)} MB / ${build.avgMemoryUsed.toFixed(2)} MB

`)
}

export function writeSourceDictionaries(write: (c: string) => void, sizes: Record<FixtureId, number>, profile: PerfRuntimeProfile): void {
  const rows = (Object.entries(sizes) as Array<[FixtureId, number]>)
    .map(([id, size]) => `| **${fixtureById(id).label}** | ${formatBytes(size)} |`)
    .join('\n')

  write(`
## Source dictionaries (pre-build)

| Fixture | On-disk locale data |
|---------|---------------------|
${rows}

> From \`runtime.json\` (${profile.locales.length} locales, ${leafKeysFor(profile.branch, profile.depth).toLocaleString('en-US')} index leaf keys).
`)
}

function writeComparisonPair(write: (c: string) => void, name1: string, name2: string, a: PerformanceResult, b: PerformanceResult): void {
  const d = (x: number, y: number) => y - x
  const fmt = (n: number, unit: string) => `${n > 0 ? '+' : ''}${n.toFixed(2)} ${unit}`

  write(`
## Comparison: ${name1} vs ${name2}

| Metric | ${name1} | ${name2} | Difference |
|--------|----------|----------|------------|
| Max Memory | ${a.maxMemoryUsed.toFixed(2)} MB | ${b.maxMemoryUsed.toFixed(2)} MB | ${fmt(d(a.maxMemoryUsed, b.maxMemoryUsed), 'MB')} |
| Avg Memory | ${a.avgMemoryUsed.toFixed(2)} MB | ${b.avgMemoryUsed.toFixed(2)} MB | ${fmt(d(a.avgMemoryUsed, b.avgMemoryUsed), 'MB')} |
| Response Avg | ${a.responseTimeAvg?.toFixed(2) ?? 'N/A'} ms | ${b.responseTimeAvg?.toFixed(2) ?? 'N/A'} ms | ${fmt(d(a.responseTimeAvg || 0, b.responseTimeAvg || 0), 'ms')} |
| Response P95 | ${a.responseTimeP95?.toFixed(2) ?? 'N/A'} ms | ${b.responseTimeP95?.toFixed(2) ?? 'N/A'} ms | ${fmt(d(a.responseTimeP95 || 0, b.responseTimeP95 || 0), 'ms')} |
| RPS (Artillery) | ${a.requestsPerSecond?.toFixed(2) ?? 'N/A'} | ${b.requestsPerSecond?.toFixed(2) ?? 'N/A'} | ${fmt(d(a.requestsPerSecond || 0, b.requestsPerSecond || 0), '')} |
| RPS (Autocannon) | ${a.autocannon?.requests.average.toFixed(2) ?? 'N/A'} | ${b.autocannon?.requests.average.toFixed(2) ?? 'N/A'} | ${fmt(d(a.autocannon?.requests.average || 0, b.autocannon?.requests.average || 0), '')} |
| Latency avg (AC) | ${a.autocannon?.latency.average.toFixed(2) ?? 'N/A'} ms | ${b.autocannon?.latency.average.toFixed(2) ?? 'N/A'} ms | ${fmt(d(a.autocannon?.latency.average || 0, b.autocannon?.latency.average || 0), 'ms')} |

`)
}

function displayLabel(id: FixtureId, label: string): string {
  return id === 'plain-nuxt' ? `${label} (baseline)` : label
}

/** Write charts + full markdown from already-averaged results. */
export async function writeDocsReport(write: (c: string) => void, results: FixtureRunResult[], runs: number, profile: PerfRuntimeProfile): Promise<void> {
  const note = meanNote(runs)
  const byId = Object.fromEntries(results.map((r) => [r.id, r])) as Record<FixtureId, FixtureRunResult>

  for (const r of results) writeBuildSection(write, r.id, r.build)

  const labels = results.map((r) => displayLabel(r.id, r.label))
  const buildTimes = results.map((r) => Math.round(r.build.buildTime * 10) / 10)
  const codeMB = results.map((r) => Math.round(((r.build.bundleSize?.codeTotal || 0) / 1024 / 1024) * 10) / 10)
  const trMB = results.map((r) => Math.round(((r.build.bundleSize?.translationsTotal || 0) / 1024 / 1024) * 10) / 10)
  const totalMB = results.map((r) => Math.round(((r.build.bundleSize?.total || 0) / 1024 / 1024) * 10) / 10)

  const charts = generateBuildComparisonCharts(labels, buildTimes, codeMB, trMB, totalMB)
  saveChartJsConfig('build-time-comparison.js', charts.buildTimeConfig)
  saveChartJsConfig('bundle-size-comparison.js', charts.bundleSizeConfig)
  saveChartJsConfig('translations-size-comparison.js', charts.translationsConfig)
  saveChartJsConfig('total-bundle-comparison.js', charts.totalBundleConfig)

  write(`
## Build Performance Summary${note}

| Project | Build Time | Code Bundle | Translations | Total |
|---------|------------|-------------|--------------|-------|
${results
  .map(
    (r) =>
      `| **${displayLabel(r.id, r.label)}** | ${r.build.buildTime.toFixed(2)}s | ${formatBytes(r.build.bundleSize?.codeTotal || 0)} | ${formatBytes(r.build.bundleSize?.translationsTotal || 0)} | ${formatBytes(r.build.bundleSize?.total || 0)} |`,
  )
  .join('\n')}

> “Total” = what gets deployed (code + translations). Micro keeps translations as lazy JSON; \`@nuxtjs/i18n\` still ships a larger code graph even after message chunks are classified correctly. Translations include \`locales/\`, \`_locales/\`, \`chunks/raw/\`, and matching locale chunks.

\`\`\`chart
url: /charts/build-time-comparison.js
height: 350px
\`\`\`

\`\`\`chart
url: /charts/bundle-size-comparison.js
height: 400px
\`\`\`

\`\`\`chart
url: /charts/translations-size-comparison.js
height: 350px
\`\`\`

\`\`\`chart
url: /charts/total-bundle-comparison.js
height: 350px
\`\`\`
`)

  const withStress = results.filter((r) => r.stress)
  if (withStress.length === 0) {
    writeAnalysisFooter(write, profile)
    return
  }

  for (const r of withStress) {
    const s = r.stress!
    // oxlint-disable-next-line no-await-in-loop -- sequential chart writes share filenames
    if (s.artillery) await generateAndSaveChart(r.label, s.artillery)
    const safeName = r.label.replace(/[^a-z0-9-]/gi, '-')
    write(`
## Stress Test Results for ${r.label}

### Resource Usage
- **Max / Avg CPU**: ${s.maxCpuUsage.toFixed(2)}% / ${s.avgCpuUsage.toFixed(2)}%
- **Max / Avg Memory**: ${s.maxMemoryUsed.toFixed(2)} MB / ${s.avgMemoryUsed.toFixed(2)} MB

### Artillery
- **Duration**: ${(s.stressTestTime ?? 0).toFixed(2)}s · **RPS**: ${s.requestsPerSecond?.toFixed(2) ?? 'N/A'} · **Error rate**: ${s.errorRate?.toFixed(2) ?? 'N/A'}%
- **Latency avg / p50 / p95 / p99**: ${s.responseTimeAvg?.toFixed(2) ?? 'N/A'} / ${s.responseTimeP50?.toFixed(2) ?? 'N/A'} / ${s.responseTimeP95?.toFixed(2) ?? 'N/A'} / ${s.responseTimeP99?.toFixed(2) ?? 'N/A'} ms

### Autocannon (10c / 10s)
- **RPS**: ${s.autocannon?.requests.average.toFixed(2) ?? 'N/A'} · **Latency avg / p50 / p95 / p99**: ${s.autocannon?.latency.average.toFixed(2) ?? 'N/A'} / ${s.autocannon?.latency.p50.toFixed(2) ?? 'N/A'} / ${s.autocannon?.latency.p97_5.toFixed(2) ?? 'N/A'} / ${s.autocannon?.latency.p99.toFixed(2) ?? 'N/A'} ms · **Errors**: ${s.autocannon?.errors ?? 0}

\`\`\`chart
url: /charts/${safeName}-traffic.js
height: 400px
\`\`\`

\`\`\`chart
url: /charts/${safeName}-latency.js
height: 300px
\`\`\`
`)
  }

  const comparisonResults = withStress.map((r) => ({
    name: r.label,
    autocannon: r.stress?.autocannon,
    artillery: r.stress?.artillery,
  }))
  const cmp = generateComparisonCharts(comparisonResults)
  saveChartJsConfig('comparison-rps-autocannon.js', cmp.rpsConfig)
  saveChartJsConfig('comparison-rps-artillery.js', cmp.artilleryRpsConfig)
  saveChartJsConfig('comparison-latency.js', cmp.latencyConfig)

  write(`
## Stress Test Summary${note}

### Artillery
| Project | Avg Response | P95 | P99 | RPS | Error Rate |
|---------|--------------|-----|-----|-----|------------|
${withStress
  .map(
    (r) =>
      `| **${r.label}** | ${r.stress?.responseTimeAvg?.toFixed(2) ?? 'N/A'} ms | ${r.stress?.responseTimeP95?.toFixed(2) ?? 'N/A'} ms | ${r.stress?.responseTimeP99?.toFixed(2) ?? 'N/A'} ms | ${r.stress?.requestsPerSecond?.toFixed(2) ?? 'N/A'} | ${r.stress?.errorRate?.toFixed(2) ?? 'N/A'}% |`,
  )
  .join('\n')}

### Autocannon
| Project | Avg Latency | P50 | P95 | P99 | RPS |
|---------|-------------|-----|-----|-----|-----|
${withStress
  .map(
    (r) =>
      `| **${r.label}** | ${r.stress?.autocannon?.latency.average.toFixed(2) ?? 'N/A'} ms | ${r.stress?.autocannon?.latency.p50.toFixed(2) ?? 'N/A'} ms | ${r.stress?.autocannon?.latency.p97_5.toFixed(2) ?? 'N/A'} ms | ${r.stress?.autocannon?.latency.p99.toFixed(2) ?? 'N/A'} ms | ${r.stress?.autocannon?.requests.average.toFixed(2) ?? 'N/A'} |`,
  )
  .join('\n')}

${generateComparisonMarkdown(comparisonResults)}
`)

  const plain = byId['plain-nuxt']?.stress
  const i18n = byId.i18n?.stress
  const micro = byId['i18n-micro']?.stress
  if (plain && i18n) writeComparisonPair(write, 'plain-nuxt (baseline)', 'i18n v10', plain, i18n)
  if (plain && micro) writeComparisonPair(write, 'plain-nuxt (baseline)', 'i18n-micro', plain, micro)
  if (i18n && micro) writeComparisonPair(write, 'i18n v10', 'i18n-micro', i18n, micro)

  writeAnalysisFooter(write, profile)
}

function writeAnalysisFooter(write: (c: string) => void, profile: PerfRuntimeProfile): void {
  const indexLeaves = leafKeysFor(profile.branch, profile.depth)
  write(`
## Notes

- Shared profile: ${profile.locales.length} locales × ${profile.pages.length} pages × ~${(indexLeaves / 1000).toFixed(1)}k index leaves.
- Artillery: 6s warm-up @6 VU/s + 60s main @60 VU/s. Autocannon: 10 connections × 10s.
- Re-run: \`pnpm test:performance\` or \`pnpm -C scripts cli performance --locales N --keys K --only all|micro|i18n|plain --runs N\`.
`)
}
