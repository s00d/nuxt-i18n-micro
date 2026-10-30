import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { parseCsv } from '../csv'
import { validationError } from '../errors'
import { log } from '../log'
import { GLOBAL_SCOPE, Project } from '../project'

export interface ImportCsvArgs {
  cwd?: string
  translationDir?: string
  csvDir: string
}

function scopeOf(file: string, code: string): string {
  const match = file.replaceAll('\\', '/').match(/^pages\/(.+)\/([^/]+)\.json$/)
  return match && match[2] === code ? match[1]! : GLOBAL_SCOPE
}

export default async function run(args: ImportCsvArgs): Promise<void> {
  const project = await Project.load(args)
  const csvDir = resolve(project.config.rootDir, args.csvDir)
  let imported = 0

  for (const code of project.codes) {
    const path = join(csvDir, `${code}.csv`)
    if (!existsSync(path)) continue
    for (const [file, key, value] of parseCsv(readFileSync(path, 'utf8')).slice(1)) {
      if (!file || !key || value === undefined) throw validationError(`Malformed row in ${path}: expected File,Key,Translation`)
      project.locale(code).set(key, value, scopeOf(file, code))
      imported += 1
    }
  }

  project.save()
  log.success(`Imported ${imported} translations.`)
}
