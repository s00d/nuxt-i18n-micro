import { realpathSync } from 'node:fs'
import { relative } from 'node:path'
import { commandFailed, findingsError, validationError } from '../errors'
import { splitList, walkFiles } from '../fs'
import { getPath } from '../json'
import { log } from '../log'
import type { ProjectConfig } from '../nuxt'
import { GLOBAL_SCOPE, Project } from '../project'
import { type ProjectScan, scanProject, usageDoubts, usageIndex } from '../source'

export interface CleanArgs {
  cwd?: string
  translationDir?: string
  include?: string
  exclude?: string
  ignore?: string
  dryRun?: boolean
  force?: boolean
}

export interface UnusedKey {
  code: string
  scope: string
  key: string
}

function regexFrom(pattern: string | undefined, flag: string): RegExp | null {
  if (!pattern) return null
  try {
    return new RegExp(pattern)
  } catch {
    throw validationError(`Invalid regular expression for --${flag}: ${pattern}`)
  }
}

/**
 * Keys of this project's own files that nothing in the project can read. A key used anywhere
 * stays in every scope: a page's route name is not always knowable from its file.
 */
export function findUnused(project: Project, scan: ProjectScan): UnusedKey[] {
  const isUsed = usageIndex(scan)
  return project.codes.flatMap((code) => {
    const locale = project.locale(code)
    return locale.scopes.flatMap((scope) =>
      Object.keys(locale.leaves(scope))
        .filter((key) => !isUsed(key) && getPath(locale.inheritedTree(scope), key) === undefined)
        .map((key) => ({ code, scope, key })),
    )
  })
}

/** A locale file that lives outside the project may feed another app too, whose code was not scanned. */
function sharedLocaleFiles(config: ProjectConfig): string[] {
  const root = realpathSync(config.rootDir)
  return walkFiles(config.translationDir, (path) => path.endsWith('.json')).filter((file) => relative(root, realpathSync(file)).startsWith('..'))
}

const describe = ({ code, scope, key }: UnusedKey): string => `${code} ${scope === GLOBAL_SCOPE ? '' : `${scope} `}${key}`

export default async function run(args: CleanArgs): Promise<void> {
  const project = await Project.load(args)
  const include = regexFrom(args.include, 'include')
  const exclude = regexFrom(args.exclude, 'exclude')
  const scan = scanProject(project.config, { ignore: splitList(args.ignore) })

  if (scan.files === 0) {
    throw commandFailed('No source files found: refusing to treat every key as unused.', ['Run from the app root, or pass --cwd.'])
  }

  const shared = sharedLocaleFiles(project.config).map((file) => `Locale file outside the project: ${file}`)
  const doubts = [...usageDoubts(scan), ...shared]
  for (const doubt of doubts) log.warn(doubt)
  if (doubts.length > 0 && !args.force && !args.dryRun) {
    throw findingsError('Cannot prove which keys are unused, so nothing was removed.', [
      'Review the list with --dryRun, protect keys with --exclude, then rerun with --force.',
    ])
  }

  const unused = findUnused(project, scan).filter(({ key }) => (!include || include.test(key)) && !exclude?.test(key))
  if (args.dryRun) {
    log.list('Would remove', unused.map(describe))
    log.info(`Dry run: ${unused.length} keys would be removed.${doubts.length > 0 ? ' Without --force, none would be.' : ''}`)
    return
  }

  for (const { code, scope, key } of unused) project.locale(code).delete(key, scope)
  project.save()
  log.success(`Removed ${unused.length} unused keys.`)
}
