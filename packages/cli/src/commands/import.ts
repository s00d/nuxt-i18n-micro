import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import { existsSync } from 'node:fs'
import { parseCsv } from '../csv'
import { findingsError, notFoundError, validationError } from '../errors'
import { readText, walkFiles } from '../fs'
import { log } from '../log'
import { parsePo } from '../po'
import { GLOBAL_SCOPE, Project } from '../project'
import { defaultExchangeDir } from './export'

export interface ImportArgs {
  cwd?: string
  translationDir?: string
  format: 'po' | 'csv'
  dir?: string
  dryRun?: boolean
}

interface Entry {
  code: string
  scope: string
  key: string
  value: string
}

function poScope(file: string, dir: string): string {
  const parts = relative(dir, dirname(file)).split(sep).filter(Boolean)
  return parts[0] === 'pages' ? parts.slice(1).join('/') : GLOBAL_SCOPE
}

function readPo(project: Project, dir: string): Entry[] {
  const files = walkFiles(dir, (path) => path.endsWith('.po'))
  if (files.length === 0) throw notFoundError(`No PO files in ${dir}`)
  return files.flatMap((file) => {
    const code = basename(file, '.po')
    if (!project.codes.includes(code)) {
      log.warn(`Skipping ${file}: ${code} is not a configured locale.`)
      return []
    }
    const { messages, fuzzy } = parsePo(readText(file))
    if (fuzzy.length > 0) log.warn(`Skipping ${fuzzy.length} fuzzy entries in ${file}: ${fuzzy.join(', ')}`)
    const scope = poScope(file, dir)
    return Object.entries(messages).map(([key, value]) => ({ code, scope, key, value }))
  })
}

function csvScope(file: string, code: string): string {
  const match = file.replaceAll('\\', '/').match(/^pages\/(.+)\/([^/]+)\.json$/)
  return match && match[2] === code ? match[1]! : GLOBAL_SCOPE
}

function csvColumns(header: string[] | undefined, path: string): { file: number; key: number; translation: number } {
  const columns = { file: header?.indexOf('File') ?? -1, key: header?.indexOf('Key') ?? -1, translation: header?.indexOf('Translation') ?? -1 }
  if (Object.values(columns).includes(-1)) throw validationError(`Malformed header in ${path}: expected File, Key and Translation columns`)
  return columns
}

function readCsvFile(path: string, code: string): Entry[] {
  const [header, ...rows] = parseCsv(readText(path))
  const columns = csvColumns(header, path)
  return rows.map((row) => {
    const [file, key, value] = [row[columns.file], row[columns.key], row[columns.translation]]
    if (!file || !key || value === undefined) throw validationError(`Malformed row in ${path}: ${row.join(',')}`)
    return { code, scope: csvScope(file, code), key, value }
  })
}

function readCsv(project: Project, dir: string): Entry[] {
  const present = project.codes.filter((code) => existsSync(join(dir, `${code}.csv`)))
  if (present.length === 0) throw notFoundError(`No CSV files in ${dir}`)
  return present.flatMap((code) => readCsvFile(join(dir, `${code}.csv`), code))
}

export default async function run(args: ImportArgs): Promise<void> {
  const project = await Project.load(args)
  const dir = resolve(project.config.rootDir, args.dir ?? defaultExchangeDir(args.format))
  const entries = args.format === 'csv' ? readCsv(project, dir) : readPo(project, dir)

  // An empty cell says nothing about the existing value.
  const filled = entries.filter((entry) => entry.value !== '')
  const conflicts = filled.flatMap(({ code, scope, key, value }) => {
    const conflict = project.locale(code).set(key, value, scope)
    return conflict ? [`${code} ${key}: ${conflict} already holds a value`] : []
  })
  const imported = filled.length - conflicts.length

  if (!args.dryRun) project.save()
  log.list('Not imported', conflicts)
  log.success(`${args.dryRun ? 'Dry run: would import' : 'Imported'} ${imported} translations.`)
  if (conflicts.length > 0)
    throw findingsError(`${conflicts.length} entries were not imported.`, ['Rename the key or remove the value that blocks it.'])
}
