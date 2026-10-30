import { findingsError } from '../errors'
import { splitList } from '../fs'
import { log } from '../log'
import { type LocaleSet, Project, relativeFile } from '../project'
import { scanProject, usageIndex } from '../source'
import { deletionDoubts } from './clean'

export interface SyncArgs {
  cwd?: string
  translationDir?: string
  ignore?: string
  dryRun?: boolean
  force?: boolean
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

/** A scope with nothing to compare against says nothing about the keys of its translations. */
function missingReferences(project: Project, extras: Array<ExtraKey & { code: string }>): string[] {
  const empty = extras.filter(({ scope }) => Object.keys(project.reference.leaves(scope)).length === 0)
  const files = [...new Set(empty.map(({ code, scope }) => relativeFile(code, scope)))]
  return files.map((file) => `No keys in ${project.config.defaultLocale} to compare ${file} with.`)
}

const overridden = (project: Project): string[] =>
  project.config.defaultLocaleOverridden
    ? [`DEFAULT_LOCALE made ${project.config.defaultLocale} the reference, not the default locale of nuxt.config.`]
    : []

/**
 * Removes what the default locale does not have. Missing keys stay missing: `''` would hide
 * them from `fallbackLocale` and from `check`. A delete-only command, so it has the brakes of
 * `clean`, and one more: a reference that is empty proves nothing.
 */
export default async function run(args: SyncArgs): Promise<void> {
  const project = await Project.load(args)
  const { reference } = project
  const scan = scanProject(project.config, { ignore: splitList(args.ignore) })
  const isUsed = usageIndex(scan)

  const extras = project.targetCodes.flatMap((code) => extraKeys(reference, project.locale(code)).map((extra) => ({ ...extra, code })))
  for (const { code, scope, key } of extras.filter((extra) => isUsed(extra.key))) {
    log.warn(`Keeping ${key} in ${relativeFile(code, scope)}: the code uses it, but ${project.config.defaultLocale} has no text for it.`)
  }
  const removable = extras.filter((extra) => !isUsed(extra.key))

  const doubts = removable.length === 0 ? [] : [...overridden(project), ...missingReferences(project, removable), ...deletionDoubts(project, scan)]
  for (const doubt of doubts) log.warn(doubt)
  if (doubts.length > 0 && !args.force && !args.dryRun) {
    throw findingsError('Cannot prove these keys are extra, so nothing was removed.', ['Review the list with --dryRun, then rerun with --force.'])
  }

  const removed = removable.map(({ code, scope, key }) => `${relativeFile(code, scope)} ${key}`)
  log.list(args.dryRun ? 'Would remove' : 'Removed', removed)
  if (args.dryRun) {
    log.info(`Dry run: ${removed.length} keys would be removed.${doubts.length > 0 ? ' Without --force, none would be.' : ''}`)
    return
  }
  for (const { code, scope, key } of removable) project.locale(code).delete(key, scope)
  project.save()
  log.success(`Translations have been synchronized: ${removed.length} extra keys removed.`)
}
