import { join, resolve } from 'node:path'
import { stringifyCsv } from '../csv'
import { writeFilesAtomic } from '../fs'
import { log } from '../log'
import { GLOBAL_SCOPE, type LocaleSet, Project } from '../project'

export interface ExportCsvArgs {
  cwd?: string
  translationDir?: string
  csvDir: string
}

function rowsOf(locale: LocaleSet, code: string): string[][] {
  return locale.scopes.flatMap((scope) => {
    const file = scope === GLOBAL_SCOPE ? `${code}.json` : `pages/${scope}/${code}.json`
    return Object.entries(locale.strings(scope)).map(([key, value]) => [file, key, value])
  })
}

export default async function run(args: ExportCsvArgs): Promise<void> {
  const project = await Project.load(args)
  const csvDir = resolve(project.config.rootDir, args.csvDir)

  writeFilesAtomic(
    project.codes.map((code): [string, string] => [
      join(csvDir, `${code}.csv`),
      stringifyCsv([['File', 'Key', 'Translation'], ...rowsOf(project.locale(code), code)]),
    ]),
  )
  log.success(`Exported translations to ${csvDir}`)
}
