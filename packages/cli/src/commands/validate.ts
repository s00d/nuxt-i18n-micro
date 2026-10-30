import { commandFailed } from '../errors'
import { log } from '../log'
import { GLOBAL_SCOPE, Project } from '../project'

export interface ValidateArgs {
  cwd?: string
  translationDir?: string
}

export interface ValidationIssue {
  locale: string
  scope: string
  missingKeys: string[]
  extraKeys: string[]
}

const without = (keys: string[], present: Set<string>): string[] => keys.filter((key) => !present.has(key))

export function validateProject(project: Project): ValidationIssue[] {
  const { reference } = project
  const issues: ValidationIssue[] = []

  for (const code of project.targetCodes) {
    const locale = project.locale(code)
    for (const scope of new Set([...reference.scopes, ...locale.scopes])) {
      const expected = Object.keys(reference.leaves(scope))
      const actual = Object.keys(locale.leaves(scope))
      const missingKeys = without(expected, new Set(actual))
      const extraKeys = without(actual, new Set(expected))
      if (missingKeys.length + extraKeys.length > 0) issues.push({ locale: code, scope, missingKeys, extraKeys })
    }
  }
  return issues
}

export default async function run(args: ValidateArgs): Promise<void> {
  const issues = validateProject(await Project.load(args))
  if (issues.length === 0) {
    log.success('All translation files are valid.')
    return
  }

  for (const { locale, scope, missingKeys, extraKeys } of issues) {
    const where = scope === GLOBAL_SCOPE ? locale : `${locale}, page ${scope}`
    if (missingKeys.length > 0) log.warn(`Missing keys (${where}):\n  ${missingKeys.join('\n  ')}`)
    if (extraKeys.length > 0) log.warn(`Extra keys (${where}):\n  ${extraKeys.join('\n  ')}`)
  }
  throw commandFailed('Validation failed with errors.', ['Fill the keys, or run i18n-micro sync to align locale files.'])
}
