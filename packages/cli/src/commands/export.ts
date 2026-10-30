import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { parseCsv, stringifyCsv } from '../csv'
import { findingsError } from '../errors'
import { readJsonIfExists, readLoose, stringifyJson, writeFilesAtomic } from '../fs'
import { log } from '../log'
import { type PoMessage, compilePo, parsePo } from '../po'
import { Project, relativeFile } from '../project'

export interface ExportArgs {
  cwd?: string
  translationDir?: string
  format: 'po' | 'csv'
  dir?: string
  force?: boolean
}

export const defaultExchangeDir = (format: string): string => (format === 'csv' ? 'csv_exports' : 'pots')

/** Every key of the scope in either locale, untranslated ones too: they are what a translator is here for. */
function messagesOf(project: Project, code: string, scope: string): PoMessage[] {
  const strings = project.locale(code).strings(scope)
  const source = project.reference.strings(scope)
  return [...new Set([...Object.keys(source), ...Object.keys(strings)])].map((key) => ({ key, value: strings[key] ?? '', source: source[key] }))
}

const scopesOf = (project: Project, code: string): string[] => [...new Set([...project.reference.scopes, ...project.locale(code).scopes])]

function poFiles(project: Project, dir: string): Array<[string, string]> {
  return project.codes.flatMap((code) =>
    scopesOf(project, code).map((scope): [string, string] => [
      join(dir, ...relativeFile(code, scope, 'po').split('/')),
      compilePo(messagesOf(project, code, scope)),
    ]),
  )
}

function csvRows(project: Project, code: string): string[][] {
  const rows = scopesOf(project, code).flatMap((scope) =>
    messagesOf(project, code, scope).map(({ key, value, source }) => [relativeFile(code, scope), key, source ?? '', value]),
  )
  return [['File', 'Key', 'Source', 'Translation'], ...rows]
}

const csvFiles = (project: Project, dir: string): Array<[string, string]> =>
  project.codes.map((code) => [join(dir, `${code}.csv`), stringifyCsv(csvRows(project, code))])

/** What the last export wrote, by file: the one way to tell a translator's edit from a changed locale file. */
const MANIFEST = '.i18n-export.json'

const digest = (text: string): string => createHash('sha256').update(text).digest('hex')

function readManifest(dir: string): Record<string, unknown> {
  try {
    return readJsonIfExists(join(dir, MANIFEST))
  } catch {
    return {}
  }
}

/** Translations in a catalog by key, unconfirmed ones too. `null`: not a file this command wrote. */
function catalogOf(text: string, format: string): Map<string, string> | null {
  if (format === 'po') {
    const { messages, fuzzy } = parsePo(text)
    return new Map(Object.entries({ ...messages, ...fuzzy }))
  }
  const [header, ...rows] = parseCsv(text)
  const [file, key, translation] = ['File', 'Key', 'Translation'].map((name) => header?.indexOf(name) ?? -1)
  if (file === -1 || key === -1 || translation === -1) return null
  return new Map(rows.map((row) => [`${row[file!]} ${row[key!]}`, row[translation!] ?? '']))
}

/** A translator's work this run would write over: the file changed since the last export, and not by an import. */
function holdsUnimportedWork(path: string, next: string, format: string, recorded: unknown): boolean {
  if (!existsSync(path)) return false
  const text = readLoose(path)
  if (digest(text) === recorded) return false
  const before = catalogOf(text, format)
  const after = catalogOf(next, format)
  return !before || [...before].some(([key, value]) => value !== '' && value !== after?.get(key))
}

export default async function run(args: ExportArgs): Promise<void> {
  const project = await Project.load(args)
  const dir = resolve(project.config.rootDir, args.dir ?? defaultExchangeDir(args.format))
  const files = args.format === 'csv' ? csvFiles(project, dir) : poFiles(project, dir)
  const manifest = readManifest(dir)
  const nameOf = (path: string): string => relative(dir, path).split(sep).join('/')

  const edited = files.filter(([path, text]) => holdsUnimportedWork(path, text, args.format, manifest[nameOf(path)]))
  if (edited.length > 0 && !args.force) {
    log.list(
      'Changed since the last export, and not imported',
      edited.map(([path]) => relative(project.config.rootDir, path)),
    )
    throw findingsError('Nothing was exported.', ['Import them first, or overwrite with --force.'])
  }

  const written = Object.fromEntries(files.map(([path, text]) => [nameOf(path), digest(text)]))
  writeFilesAtomic([...files, [join(dir, MANIFEST), stringifyJson({ ...manifest, ...written })]], { overwrite: true })
  log.success(`Exported ${files.length} ${args.format.toUpperCase()} files to ${dir}`)
}
