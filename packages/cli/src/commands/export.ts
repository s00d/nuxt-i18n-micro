import { join, resolve } from 'node:path'
import { stringifyCsv } from '../csv'
import { writeFilesAtomic } from '../fs'
import { log } from '../log'
import { type PoMessage, compilePo } from '../po'
import { Project, relativeFile } from '../project'

export interface ExportArgs {
  cwd?: string
  translationDir?: string
  format: 'po' | 'csv'
  dir?: string
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

export default async function run(args: ExportArgs): Promise<void> {
  const project = await Project.load(args)
  const dir = resolve(project.config.rootDir, args.dir ?? defaultExchangeDir(args.format))
  const files = args.format === 'csv' ? csvFiles(project, dir) : poFiles(project, dir)
  writeFilesAtomic(files)
  log.success(`Exported ${files.length} ${args.format.toUpperCase()} files to ${dir}`)
}
