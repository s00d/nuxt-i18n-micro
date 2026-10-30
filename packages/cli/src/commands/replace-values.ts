import { validationError } from '../errors'
import { log } from '../log'
import { Project } from '../project'

export interface ReplaceValuesArgs {
  cwd?: string
  translationDir?: string
  search: string
  replace: string
  useRegex?: boolean
}

function buildReplacer(args: ReplaceValuesArgs): (value: string) => string {
  if (!args.useRegex) return (value) => value.split(args.search).join(args.replace)
  try {
    const pattern = new RegExp(args.search, 'g')
    return (value) => value.replace(pattern, args.replace)
  } catch {
    throw validationError(`Invalid regular expression: ${args.search}`)
  }
}

export default async function run(args: ReplaceValuesArgs): Promise<void> {
  const project = await Project.load(args)
  const replace = buildReplacer(args)
  let changed = 0

  for (const code of project.codes) {
    const locale = project.locale(code)
    for (const scope of locale.scopes) {
      for (const [key, value] of Object.entries(locale.strings(scope))) {
        const next = replace(value)
        if (next === value) continue
        locale.set(key, next, scope)
        changed += 1
      }
    }
  }

  project.save()
  log.success(`Translation values have been updated. Changed keys: ${changed}`)
}
