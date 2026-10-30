import { join, resolve } from 'node:path'
import { writeFilesAtomic } from '../fs'
import { log } from '../log'
import { compilePo } from '../po'
import { GLOBAL_SCOPE, Project } from '../project'

export interface ExportArgs {
  cwd?: string
  translationDir?: string
  potsDir: string
}

export default async function run(args: ExportArgs): Promise<void> {
  const project = await Project.load(args)
  const potsDir = resolve(project.config.rootDir, args.potsDir)
  const files: Array<[string, string]> = []

  for (const code of project.codes) {
    const locale = project.locale(code)
    for (const scope of locale.scopes) {
      const path = scope === GLOBAL_SCOPE ? join(potsDir, `${code}.po`) : join(potsDir, 'pages', ...scope.split('/'), `${code}.po`)
      files.push([path, compilePo(locale.strings(scope))])
    }
  }

  writeFilesAtomic(files)
  log.success(`Exported ${files.length} PO files to ${potsDir}`)
}
