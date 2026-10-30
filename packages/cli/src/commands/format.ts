import { type JsonObject, sortKeys } from '../json'
import { log } from '../log'
import { Project } from '../project'

export interface FormatArgs {
  cwd?: string
  translationDir?: string
  indent: number
  sortKeys?: boolean
}

export default async function run(args: FormatArgs): Promise<void> {
  const project = await Project.load(args)

  for (const code of project.codes) {
    const locale = project.locale(code)
    locale.modified = true
    if (!args.sortKeys) continue
    for (const scope of locale.scopes) locale.replaceTree(scope, sortKeys(locale.tree(scope)) as JsonObject)
  }

  const written = project.save({ indent: args.indent })
  log.success(`Formatted translation files: ${written.length} changed.`)
}
