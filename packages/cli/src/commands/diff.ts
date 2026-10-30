import { log } from '../log'
import { GLOBAL_SCOPE, Project } from '../project'

export interface DiffArgs {
  cwd?: string
  translationDir?: string
  json?: boolean
}

export interface DiffEntry {
  locale: string
  file: string
  missing: Array<{ key: string; defaultValue: string }>
}

const fileOf = (scope: string, code: string): string => (scope === GLOBAL_SCOPE ? `${code}.json` : `pages/${scope}/${code}.json`)

export function buildDiff(project: Project): DiffEntry[] {
  const { reference } = project
  const entries: DiffEntry[] = []

  for (const code of project.targetCodes) {
    const locale = project.locale(code)
    for (const scope of reference.scopes) {
      const current = locale.strings(scope)
      const missing = Object.entries(reference.strings(scope))
        .filter(([key]) => !Object.hasOwn(current, key))
        .map(([key, defaultValue]) => ({ key, defaultValue }))
      if (missing.length > 0) entries.push({ locale: code, file: fileOf(scope, code), missing })
    }
  }
  return entries
}

export default async function run(args: DiffArgs): Promise<void> {
  const entries = buildDiff(await Project.load(args))
  if (args.json) {
    log.json(entries)
    return
  }
  if (entries.length === 0) {
    log.success('No missing translations found')
    return
  }

  log.section('Translation Diff')
  log.rows([
    ['Files with issues', entries.length],
    ['Missing keys', entries.reduce((sum, entry) => sum + entry.missing.length, 0)],
  ])
  for (const entry of entries) {
    log.list(
      entry.file,
      entry.missing.map((item) => `${item.key} -> ${item.defaultValue}`),
    )
  }
}
