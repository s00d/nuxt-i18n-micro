import { splitList } from '../fs'
import { log } from '../log'
import { type LocaleSet, Project, relativeFile } from '../project'
import { scanProject, usageIndex } from '../source'

export interface SyncArgs {
  cwd?: string
  translationDir?: string
  ignore?: string
  dryRun?: boolean
}

export interface ExtraKey {
  scope: string
  key: string
}

/** Keys of `locale` the default locale cannot answer, compared by path: `"a.b"` and `a: { b }` are the same key. */
export function extraKeys(reference: LocaleSet, locale: LocaleSet): ExtraKey[] {
  return locale.scopes.flatMap((scope) =>
    Object.keys(locale.leaves(scope))
      .filter((key) => reference.resolve(key, scope) === undefined)
      .map((key) => ({ scope, key })),
  )
}

/**
 * Removes what the default locale does not have. Missing keys stay missing: `''` would hide
 * them from `fallbackLocale` and from `check`.
 */
export default async function run(args: SyncArgs): Promise<void> {
  const project = await Project.load(args)
  const { reference } = project
  const isUsed = usageIndex(scanProject(project.config, { ignore: splitList(args.ignore) }))
  const removed: string[] = []

  for (const code of project.targetCodes) {
    const locale = project.locale(code)
    for (const { scope, key } of extraKeys(reference, locale)) {
      if (isUsed(key)) {
        log.warn(`Keeping ${key} in ${relativeFile(code, scope)}: the code uses it, but ${project.config.defaultLocale} has no text for it.`)
        continue
      }
      removed.push(`${relativeFile(code, scope)} ${key}`)
      if (!args.dryRun) locale.delete(key, scope)
    }
  }

  log.list(args.dryRun ? 'Would remove' : 'Removed', removed)
  if (args.dryRun) {
    log.info(`Dry run: ${removed.length} keys would be removed.`)
    return
  }
  project.save()
  log.success(`Translations have been synchronized: ${removed.length} extra keys removed.`)
}
