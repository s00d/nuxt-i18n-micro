import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import { existsSync } from 'node:fs'
import { parseCsv } from '../csv'
import { findingsError, notFoundError, validationError } from '../errors'
import { readText, walkFiles } from '../fs'
import { log } from '../log'
import { parsePo } from '../po'
import { GLOBAL_SCOPE, Project } from '../project'
import { defaultExchangeDir, readManifest } from './export'

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

/** Only where `export` puts a catalog: a backup in a subfolder must not land on the global file. */
function poScope(file: string, dir: string): string {
  const parts = relative(dir, dirname(file)).split(sep).filter(Boolean)
  if (parts.length === 0) return GLOBAL_SCOPE
  if (parts[0] === 'pages' && parts.length > 1) return parts.slice(1).join('/')
  throw validationError(`Not a place for a catalog: ${relative(dir, file)}`, ['Expected <locale>.po or pages/<page>/<locale>.po.'])
}

/** A page's catalog the last export did not write: the page is gone, and importing would bring it back. */
function assertExported(file: string, dir: string, exported: string[]): void {
  const name = relative(dir, file).split(sep).join('/')
  if (exported.length === 0 || exported.includes(name)) return
  throw validationError(`Not part of the last export: ${name}`, ['Delete the file, or restore the page and export again.'])
}

function readPo(project: Project, dir: string): Entry[] {
  const files = walkFiles(dir, (path) => path.endsWith('.po'))
  if (files.length === 0) throw notFoundError(`No PO files in ${dir}`)
  const exported = Object.keys(readManifest(dir)).filter((name) => name.endsWith('.po'))
  return files.flatMap((file) => {
    const code = basename(file, '.po')
    if (!project.codes.includes(code)) {
      log.warn(`Skipping ${file}: ${code} is not a configured locale.`)
      return []
    }
    const { messages, fuzzy } = parsePo(readText(file))
    const guesses = Object.keys(fuzzy)
    if (guesses.length > 0) log.warn(`Skipping ${guesses.length} fuzzy entries in ${file}: ${guesses.join(', ')}`)
    const scope = poScope(file, dir)
    if (scope !== GLOBAL_SCOPE) assertExported(file, dir, exported)
    return Object.entries(messages).map(([key, value]) => ({ code, scope, key, value }))
  })
}

/** The column has to name this locale: a row of another one would land in the wrong file. */
function csvScope(file: string, code: string, path: string): string {
  const name = file.replaceAll('\\', '/')
  if (name === `${code}.json`) return GLOBAL_SCOPE
  const match = name.match(/^pages\/(.+)\/([^/]+)\.json$/)
  if (match?.[2] === code) return match[1]!
  throw validationError(`Row of another file in ${path}: ${file}`, [`Expected ${code}.json or pages/<page>/${code}.json.`])
}

function csvColumns(header: string[] | undefined, path: string): { file: number; key: number; translation: number } {
  const columns = { file: header?.indexOf('File') ?? -1, key: header?.indexOf('Key') ?? -1, translation: header?.indexOf('Translation') ?? -1 }
  if (Object.values(columns).includes(-1)) throw validationError(`Malformed header in ${path}: expected File, Key and Translation columns`)
  return columns
}

function readCsvFile(path: string, code: string): Entry[] {
  const [header, ...rows] = parseCsv(readText(path), path)
  const columns = csvColumns(header, path)
  return rows.map((row) => {
    const [file, key, value] = [row[columns.file], row[columns.key], row[columns.translation]]
    if (!file || !key || value === undefined) throw validationError(`Malformed row in ${path}: ${row.join(',')}`)
    return { code, scope: csvScope(file, code, path), key, value }
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
  if (project.config.disablePageLocales && filled.some((entry) => entry.scope !== GLOBAL_SCOPE)) {
    throw validationError('disablePageLocales is on: the app would never read page translations.', [
      'Remove the page entries, or turn the option off.',
    ])
  }
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
