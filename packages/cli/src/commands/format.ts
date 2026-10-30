import { relative } from 'node:path'
import { findingsError } from '../errors'
import { log } from '../log'
import { Project } from '../project'

export interface FormatArgs {
  cwd?: string
  translationDir?: string
  indent: number
  sortKeys?: boolean
  check?: boolean
}

export default async function run(args: FormatArgs): Promise<void> {
  const project = await Project.load(args)
  for (const code of project.codes) project.locale(code).modified = true
  const options = { indent: args.indent, sort: args.sortKeys, rewrite: true }

  if (args.check) {
    const files = project.pendingFiles(options).map(([path]) => relative(project.config.rootDir, path))
    if (files.length === 0) {
      log.success('All translation files are formatted.')
      return
    }
    log.list('Not formatted', files)
    const flags = `${args.indent === 2 ? '' : ` --indent ${args.indent}`}${args.sortKeys === false ? ' --no-sortKeys' : ''}`
    throw findingsError(`${files.length} files need formatting.`, [`Run i18n-micro format${flags}.`])
  }

  const written = project.save(options)
  log.success(`Formatted translation files: ${written.length} changed.`)
}
