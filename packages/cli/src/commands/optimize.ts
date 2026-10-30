import { relative, sep } from 'node:path'
import { statSync } from 'node:fs'
import { readJsonObject, walkFiles } from '../fs'
import { flatten } from '../json'
import { log } from '../log'
import { Project } from '../project'
import { formatBytes } from '../stats-report'

export interface OptimizeArgs {
  cwd?: string
  translationDir?: string
  minSize: number
  maxDepth: number
  json?: boolean
}

export interface FileReport {
  file: string
  size: number
  depth: number
  duplicatedKeys: string[]
}

function duplicatedKeys(values: Record<string, unknown>): string[] {
  const seen = new Set<unknown>()
  const duplicates: string[] = []
  for (const [key, value] of Object.entries(values)) {
    if (typeof value !== 'string') continue
    if (seen.has(value)) duplicates.push(key)
    seen.add(value)
  }
  return duplicates
}

function readFileReport(path: string, root: string): FileReport {
  const leaves = flatten(readJsonObject(path))
  return {
    file: relative(root, path).split(sep).join('/'),
    size: statSync(path).size,
    depth: Math.max(0, ...Object.keys(leaves).map((key) => key.split('.').length)),
    duplicatedKeys: duplicatedKeys(leaves),
  }
}

export default async function run(args: OptimizeArgs): Promise<void> {
  const project = await Project.load(args)
  const dir = project.config.translationDir
  const reports = walkFiles(dir, (path) => path.endsWith('.json')).map((path) => readFileReport(path, dir))
  const totalSize = reports.reduce((sum, report) => sum + report.size, 0)
  const large = reports.filter((report) => report.size > args.minSize)
  const deep = reports.filter((report) => report.depth > args.maxDepth)
  const duplicated = reports.filter((report) => report.duplicatedKeys.length > 0)

  if (args.json) {
    log.json({ totalFiles: reports.length, totalSize, thresholds: { minSize: args.minSize, maxDepth: args.maxDepth }, large, deep, duplicated })
    return
  }
  if (reports.length === 0) {
    log.info('No translation files found')
    return
  }

  log.section('Optimization Analysis')
  log.rows([
    ['Total files', reports.length],
    ['Total size', formatBytes(totalSize)],
    ['Average file size', formatBytes(totalSize / reports.length)],
    [`Files over ${formatBytes(args.minSize)}`, large.length],
    ['Files with deep nesting', deep.length],
    ['Files with duplicated values', duplicated.length],
  ])
  log.list(
    'Large files',
    large.map((report) => `${report.file} (${formatBytes(report.size)})`),
  )
  log.list(
    'Deep nesting',
    deep.map((report) => `${report.file} (depth ${report.depth})`),
  )
  log.list(
    'Duplicated values',
    duplicated.map((report) => `${report.file}: ${report.duplicatedKeys.join(', ')}`),
  )
}
