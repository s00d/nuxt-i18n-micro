/**
 * The payload measurement, read from the budget file `pnpm run budget:payload` enforces.
 *
 * The guide quotes a measurement rather than a memory: this is the same JSON CI compares
 * against, so a number on the page cannot describe a build that no longer exists.
 */
import { readFileSync } from 'node:fs'
import { defineLoader } from 'vitepress'

interface BudgetFile {
  app: string
  routes: string[]
  limits: Record<string, number>
  observed?: Record<string, number>
}

export interface BudgetRow {
  label: string
  bytes: number
  display: string
}

export interface PayloadBudgetData {
  app: string
  routes: string[]
  rows: BudgetRow[]
  /** How many times larger the dictionary is than the largest inlined payload. */
  ratio: number | null
}

declare const data: PayloadBudgetData
export { data }

export function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(1)} KB`
}

export default defineLoader({
  watch: ['../../scripts/payload-budget.json'],
  load(files: string[]): PayloadBudgetData {
    const file = files[0]
    if (!file) return { app: '', routes: [], rows: [], ratio: null }

    const budget = JSON.parse(readFileSync(file, 'utf8')) as BudgetFile
    const observed = budget.observed ?? {}

    const rows: BudgetRow[] = [
      ['Translation sources on disk', observed.sourceDictionary],
      ['Served as separate payload files', observed.payloadFiles],
      ['Largest inline __NUXT_DATA__', observed.maxNuxtData],
      ['Client assets', observed.clientAssets],
    ]
      .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
      .map(([label, bytes]) => ({ label, bytes, display: formatSize(bytes) }))

    const dictionary = observed.sourceDictionary
    const inlined = observed.maxNuxtData

    return {
      app: budget.app,
      routes: budget.routes,
      rows,
      ratio: dictionary && inlined ? Math.round(dictionary / inlined) : null,
    }
  },
})
