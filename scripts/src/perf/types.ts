export interface ArtillerySummary {
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

export interface ArtilleryAggregate {
  counters: Record<string, number | undefined>
  rates: Record<string, number | undefined>
  firstMetricAt: number
  lastMetricAt: number
  summaries: Record<string, ArtillerySummary>
  histograms: Record<string, ArtillerySummary>
}

export interface ArtilleryIntermediate {
  counters: Record<string, number>
  rates: Record<string, number | null>
  period: string
  summaries: Record<string, ArtillerySummary>
  histograms: Record<string, ArtillerySummary>
}

export interface ArtilleryResult {
  aggregate: ArtilleryAggregate
  intermediate?: ArtilleryIntermediate[]
}

export interface AutocannonResult {
  requests: {
    average: number
    mean: number
    total: number
  }
  latency: {
    average: number
    mean: number
    min: number
    max: number
    p50: number
    p97_5: number
    p99: number
  }
  throughput: {
    average: number
  }
  errors: number
}

export interface BundleSize {
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

export interface PerformanceResult {
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
  autocannon?: AutocannonResult
  artillery?: ArtilleryResult
}

export type FixtureAlias = 'plain' | 'i18n' | 'micro'
export type FixtureOnly = FixtureAlias | 'all'
export type FixtureId = 'plain-nuxt' | 'i18n' | 'i18n-micro'


export interface LocaleDef {
  code: string
  iso: string
  language: string
  displayName: string
}

export interface PageDef {
  name: string
  kind: 'index' | 'secondary'
}

export interface PerfRuntimeProfile {
  locales: LocaleDef[]
  depth: number
  branch: number
  secondaryDepth: number
  secondaryBranch: number
  pages: PageDef[]
}

export interface ResolvedPerfArgs {
  locales: number
  keys: number
  only: FixtureOnly
  runs: number
  skipStress: boolean
  profile: PerfRuntimeProfile
  fixtures: FixtureId[]
  writeDocs: boolean
}

export interface FixtureRunResult {
  id: FixtureId
  label: string
  build: PerformanceResult
  stress?: PerformanceResult
}
