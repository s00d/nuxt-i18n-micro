import { log } from '../log'
import { GLOBAL_SCOPE, type LocaleSet, Project } from '../project'

export interface CheckDuplicatesArgs {
  cwd?: string
  translationDir?: string
}

export function findDuplicates(locale: LocaleSet): Map<string, string[]> {
  const byValue = new Map<string, string[]>()
  for (const scope of locale.scopes) {
    const label = scope === GLOBAL_SCOPE ? scope : `pages/${scope}`
    for (const [key, value] of Object.entries(locale.strings(scope))) {
      if (value === '') continue
      byValue.set(value, [...(byValue.get(value) ?? []), `${label} - ${key}`])
    }
  }
  return new Map([...byValue].filter(([, places]) => places.length > 1))
}

export default async function run(args: CheckDuplicatesArgs): Promise<void> {
  const project = await Project.load(args)

  for (const code of project.codes) {
    const duplicates = findDuplicates(project.locale(code))
    if (duplicates.size === 0) {
      log.success(`No duplicate values found for locale ${code}.`)
      continue
    }
    for (const [value, places] of duplicates)
      log.list(
        `Duplicate value "${value}" in ${code}`,
        places.sort((a, b) => a.localeCompare(b, 'en')),
      )
  }
}
