import { appendFileSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { formatBytes, type LoadMetrics, type PerfReporter, type PerfTargetResult } from 'untestutils/perf'
import { repoRoot } from '../utils/workspace'
import {
  generateAndSaveChart,
  generateBuildComparisonCharts,
  generateComparisonCharts,
  generateComparisonMarkdown,
  logChartsSaved,
  saveChartJsConfig,
} from './charts'
import { fixtureProfileMarkdown, leafKeysFor } from './config'
import { fixtureById, fixtureSourceAbsDir, resolveFixtureSelection, type PerfFixtureDef } from './fixtures'
import type { FixtureId, PerfRuntimeProfile, ResolvedPerfArgs } from './types'

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

function mb(bytes: number): number {
  return Math.round((bytes / 1024 / 1024) * 10) / 10
}

export function createMarkdownWriter(enabled: boolean): {
  init: (profile: PerfRuntimeProfile, runs: number) => void
  write: (content: string) => void
} {
  return {
    init(profile, runs) {
      if (!enabled) return
      writeFileSync(
        resultsFilePath,
        `---
title: "Performance Test Results"
description: "Benchmarks vs nuxt-i18n on real fixtures."
outline: "deep"
---

# Performance Test Results

## Project Information

- **[plain-nuxt](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/plain-nuxt)**: ./test/fixtures/plain-nuxt
- **[i18n-micro](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n-micro)**: ./test/fixtures/i18n-micro
- **[i18n](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/i18n)**: ./test/fixtures/i18n
- **CLI**: \`pnpm test:performance\`

### Description

Compares **plain Nuxt**, **i18n-micro**, and **\`@nuxtjs/i18n\`** under one shared dictionary profile via \`untestutils/perf\`.

Focus: build time, peak RSS, deployable **code vs translations (asset) vs total**, and load (Artillery).

### Methodology notes

- Metrics are **means of ${runs} consecutive runs per fixture** (not interleaved).
- **Translations** = \`bundle.asset\` (locale JSON, \`chunks/raw/\`, matching locale chunks via \`isTranslationFile\`).
- **plain-nuxt** serves the same leaf volume as static JSON — I/O-heavy under load, not “i18n overhead”.

### Runs

All metrics below are **means across ${runs} runs**.

---
`,
      )
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

/** Markdown + Chart.js reporter for \`--only all\`. */
export function createDocsReporter(args: ResolvedPerfArgs): PerfReporter {
  const md = createMarkdownWriter(true)
  return {
    name: 'i18n-docs',
    onStart() {
      const fixtures = resolveFixtureSelection(args.only)
      md.init(args.profile, args.runs)
      writeSourceDictionaries(md.write, measureSourceDictionaries(fixtures), args.profile)
    },
    async onEnd({ results }) {
      await writeDocsReport(md.write, results, args.runs, args.profile)
      console.log('Wrote docs report: docs/guide/performance-results.md')
    },
  }
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

function writeBuildSection(write: (c: string) => void, result: PerfTargetResult): void {
  const b = result.build
  const bundle = b.bundle
  write(`
## Build Performance for test/fixtures/${result.id}

- **Build Time**: ${b.buildTimeSec.toFixed(2)} seconds
- **Bundle Size**: ${formatBytes(bundle?.total || 0)} (code: ${formatBytes(bundle?.code || 0)}, translations: ${formatBytes(bundle?.asset || 0)})
- **Output dirs**: public: ${formatBytes(bundle?.byDir.public || 0)}, server: ${formatBytes(bundle?.byDir.server || 0)}
- **Max / Avg CPU**: ${b.maxCpuPct.toFixed(2)}% / ${b.avgCpuPct.toFixed(2)}%
- **Max / Avg Memory**: ${b.maxMemoryMb.toFixed(2)} MB / ${b.avgMemoryMb.toFixed(2)} MB

`)
}

function writeComparisonPair(write: (c: string) => void, name1: string, name2: string, a: LoadMetrics, b: LoadMetrics): void {
  const d = (x: number, y: number) => y - x
  const fmt = (n: number, unit: string) => `${n > 0 ? '+' : ''}${n.toFixed(2)} ${unit}`

  write(`
## Comparison: ${name1} vs ${name2}

| Metric | ${name1} | ${name2} | Difference |
|--------|----------|----------|------------|
| Max Memory | ${a.maxMemoryMb.toFixed(2)} MB | ${b.maxMemoryMb.toFixed(2)} MB | ${fmt(d(a.maxMemoryMb, b.maxMemoryMb), 'MB')} |
| Avg Memory | ${a.avgMemoryMb.toFixed(2)} MB | ${b.avgMemoryMb.toFixed(2)} MB | ${fmt(d(a.avgMemoryMb, b.avgMemoryMb), 'MB')} |
| Response Avg | ${a.responseTimeAvg?.toFixed(2) ?? 'N/A'} ms | ${b.responseTimeAvg?.toFixed(2) ?? 'N/A'} ms | ${fmt(d(a.responseTimeAvg || 0, b.responseTimeAvg || 0), 'ms')} |
| Response P95 | ${a.responseTimeP95?.toFixed(2) ?? 'N/A'} ms | ${b.responseTimeP95?.toFixed(2) ?? 'N/A'} ms | ${fmt(d(a.responseTimeP95 || 0, b.responseTimeP95 || 0), 'ms')} |
| RPS (Artillery) | ${a.requestsPerSecond?.toFixed(2) ?? 'N/A'} | ${b.requestsPerSecond?.toFixed(2) ?? 'N/A'} | ${fmt(d(a.requestsPerSecond || 0, b.requestsPerSecond || 0), '')} |
| Error rate | ${a.errorRate?.toFixed(2) ?? 'N/A'}% | ${b.errorRate?.toFixed(2) ?? 'N/A'}% | ${fmt(d(a.errorRate || 0, b.errorRate || 0), '%')} |

`)
}

function displayLabel(id: string, label: string): string {
  return id === 'plain-nuxt' ? `${label} (baseline)` : label
}

/** Write charts + full markdown from averaged \`PerfTargetResult\`s. */
export async function writeDocsReport(
  write: (c: string) => void,
  results: PerfTargetResult[],
  runs: number,
  profile: PerfRuntimeProfile,
): Promise<void> {
  const note = meanNote(runs)
  const byId = Object.fromEntries(results.map((r) => [r.id, r])) as Record<string, PerfTargetResult>

  for (const r of results) writeBuildSection(write, r)

  const labels = results.map((r) => displayLabel(r.id, r.label))
  const buildTimes = results.map((r) => Math.round(r.build.buildTimeSec * 10) / 10)
  const codeMB = results.map((r) => mb(r.build.bundle?.code || 0))
  const trMB = results.map((r) => mb(r.build.bundle?.asset || 0))
  const totalMB = results.map((r) => mb(r.build.bundle?.total || 0))

  const charts = generateBuildComparisonCharts(labels, buildTimes, codeMB, trMB, totalMB)
  saveChartJsConfig('build-time-comparison.js', charts.buildTimeConfig)
  saveChartJsConfig('bundle-size-comparison.js', charts.bundleSizeConfig)
  saveChartJsConfig('translations-size-comparison.js', charts.translationsConfig)
  saveChartJsConfig('total-bundle-comparison.js', charts.totalBundleConfig)
  let chartCount = 4

  write(`
## Build Performance Summary${note}

| Project | Build Time | Code Bundle | Translations | Total |
|---------|------------|-------------|--------------|-------|
${results
  .map(
    (r) =>
      `| **${displayLabel(r.id, r.label)}** | ${r.build.buildTimeSec.toFixed(2)}s | ${formatBytes(r.build.bundle?.code || 0)} | ${formatBytes(r.build.bundle?.asset || 0)} | ${formatBytes(r.build.bundle?.total || 0)} |`,
  )
  .join('\n')}

> “Total” = code + translations (\`bundle.asset\`). Translations include \`locales/\`, \`_locales/\`, \`chunks/raw/\`, and matching locale chunks.

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

  const withLoad = results.filter((r) => r.load)
  if (withLoad.length === 0) {
    logChartsSaved(chartCount)
    writeAnalysisFooter(write, profile)
    return
  }

  for (const r of withLoad) {
    const l = r.load!
    // oxlint-disable-next-line no-await-in-loop -- sequential chart writes share filenames
    if (l.artillery) {
      await generateAndSaveChart(r.label, l.artillery)
      chartCount += 2
    }
    const safeName = r.label.replace(/[^a-z0-9-]/gi, '-')
    const chartsBlock = l.artillery
      ? `
\`\`\`chart
url: /charts/${safeName}-traffic.js
height: 400px
\`\`\`

\`\`\`chart
url: /charts/${safeName}-latency.js
height: 300px
\`\`\`
`
      : ''
    write(`
## Load Results for ${r.label}

### Resource Usage
- **Max / Avg CPU**: ${l.maxCpuPct.toFixed(2)}% / ${l.avgCpuPct.toFixed(2)}%
- **Max / Avg Memory**: ${l.maxMemoryMb.toFixed(2)} MB / ${l.avgMemoryMb.toFixed(2)} MB

### Artillery
- **Duration**: ${(l.durationSec ?? 0).toFixed(2)}s · **RPS**: ${l.requestsPerSecond?.toFixed(2) ?? 'N/A'} · **Error rate**: ${l.errorRate?.toFixed(2) ?? 'N/A'}%
- **Latency avg / p50 / p95 / p99**: ${l.responseTimeAvg?.toFixed(2) ?? 'N/A'} / ${l.responseTimeP50?.toFixed(2) ?? 'N/A'} / ${l.responseTimeP95?.toFixed(2) ?? 'N/A'} / ${l.responseTimeP99?.toFixed(2) ?? 'N/A'} ms
${chartsBlock}`)
  }

  const comparisonResults = withLoad.map((r) => ({
    name: r.label,
    load: r.load,
  }))
  const cmp = generateComparisonCharts(comparisonResults)
  saveChartJsConfig('comparison-rps-artillery.js', cmp.rpsConfig)
  saveChartJsConfig('comparison-latency.js', cmp.latencyConfig)
  chartCount += 2
  logChartsSaved(chartCount)

  write(`
## Load Summary${note}

### Artillery
| Project | Avg Response | P50 | P95 | P99 | RPS | Error Rate |
|---------|--------------|-----|-----|-----|-----|------------|
${withLoad
  .map(
    (r) =>
      `| **${r.label}** | ${r.load?.responseTimeAvg?.toFixed(2) ?? 'N/A'} ms | ${r.load?.responseTimeP50?.toFixed(2) ?? 'N/A'} ms | ${r.load?.responseTimeP95?.toFixed(2) ?? 'N/A'} ms | ${r.load?.responseTimeP99?.toFixed(2) ?? 'N/A'} ms | ${r.load?.requestsPerSecond?.toFixed(2) ?? 'N/A'} | ${r.load?.errorRate?.toFixed(2) ?? 'N/A'}% |`,
  )
  .join('\n')}

${generateComparisonMarkdown(comparisonResults)}
`)

  const plain = byId['plain-nuxt']?.load
  const i18n = byId.i18n?.load
  const micro = byId['i18n-micro']?.load
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
- Load: Autocannon (10c×5s) + programmatic Artillery (paths from runtime profile; see \`scripts/src/perf/load.ts\`).
- Re-run: \`pnpm test:performance\` or \`pnpm -C scripts cli performance --locales N --keys K --only all|micro|i18n|plain --runs N --skip-load\`.
`)
}
