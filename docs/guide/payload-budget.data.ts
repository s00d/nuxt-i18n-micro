import { defineLoader } from 'vitepress'
import { dataFile, formatSize, readData } from '../.vitepress/data/loaders'

interface RawBudget {
  app: string
  routes: string[]
  rows: { label: string; bytes: number }[]
  ratio: number | null
}

export interface PayloadBudgetData {
  app: string
  routes: string[]
  rows: { label: string; display: string }[]
  ratio: number | null
}

declare const data: PayloadBudgetData
export { data }

export default defineLoader({
  watch: [dataFile('payload-budget')],
  load(): PayloadBudgetData {
    const budget = readData<RawBudget | null>('payload-budget', null)
    if (!budget) return { app: '', routes: [], rows: [], ratio: null }

    return { ...budget, rows: budget.rows.map((row) => ({ label: row.label, display: formatSize(row.bytes) })) }
  },
})
