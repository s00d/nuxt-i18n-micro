import { commandFailed, validationError } from '../errors'
import { getPath, unflatten } from '../json'
import { log } from '../log'
import { GLOBAL_SCOPE, type LocaleSet, Project } from '../project'
import { type ProjectUsage, scanProject } from '../source'

export interface CleanArgs {
  cwd?: string
  translationDir?: string
  include?: string
  exclude?: string
  dryRun?: boolean
  force?: boolean
}

const LINKED_KEY = /@:([\w.-]+)/g

function regexFrom(pattern: string | undefined, flag: string): RegExp | null {
  if (!pattern) return null
  try {
    return new RegExp(pattern)
  } catch {
    throw validationError(`Invalid regular expression for --${flag}: ${pattern}`)
  }
}

function linkedKeys(project: Project): Set<string> {
  const linked = new Set<string>()
  for (const code of project.codes) {
    const locale = project.locale(code)
    for (const scope of locale.scopes) {
      for (const value of Object.values(locale.strings(scope))) {
        for (const match of value.matchAll(LINKED_KEY)) linked.add(match[1]!)
      }
    }
  }
  return linked
}

/** `$t('a')` also reads everything under `a`, and `$t('a.b')` needs `a.b` itself. */
const covers = (used: string, key: string): boolean => used === key || used.startsWith(`${key}.`) || key.startsWith(`${used}.`)

interface Retention {
  used(key: string, scope: string): boolean
}

function retention(project: Project, usage: ProjectUsage): Retention {
  const linked = linkedKeys(project)
  const everywhere = [...usage.global, ...linked, ...Object.values(usage.pages).flatMap((keys) => Array.from(keys))]
  const shared = [...usage.global, ...linked]
  const prefixes = usage.dynamic.map((entry) => entry.prefix).filter(Boolean)

  return {
    used(key, scope) {
      if (prefixes.some((prefix) => key.startsWith(prefix))) return true
      const candidates = scope === GLOBAL_SCOPE ? everywhere : [...shared, ...(usage.pages[scope] ?? [])]
      return candidates.some((used) => covers(used, key))
    },
  }
}

export default async function run(args: CleanArgs): Promise<void> {
  const project = await Project.load(args)
  const include = regexFrom(args.include, 'include')
  const exclude = regexFrom(args.exclude, 'exclude')
  const usage = scanProject(project.config)

  if (usage.files === 0) {
    throw commandFailed('No source files found: refusing to treat every key as unused.', ['Run from the app root, or pass --cwd.'])
  }
  const opaque = usage.dynamic.filter((entry) => !entry.prefix)
  for (const { file, expression } of opaque) log.warn(`Key computed at runtime in ${file}: ${expression}`)
  if (opaque.length > 0 && !args.force && !args.dryRun) {
    throw commandFailed('Some keys are computed at runtime, so any key may be in use.', [
      'Review the list with --dryRun, protect keys with --exclude, then rerun with --force.',
    ])
  }

  const { used } = retention(project, usage)
  const removable = (key: string, scope: string, locale: LocaleSet): boolean => {
    if (getPath(scope === GLOBAL_SCOPE ? locale.inherited.global : (locale.inherited.pages[scope] ?? {}), key) !== undefined) return false
    if (include && !include.test(key)) return false
    if (exclude?.test(key)) return false
    return !used(key, scope)
  }

  const removed: string[] = []
  for (const code of project.codes) {
    const locale = project.locale(code)
    for (const scope of locale.scopes) {
      const leaves = Object.entries(locale.leaves(scope))
      const kept = leaves.filter(([key]) => !removable(key, scope, locale))
      if (kept.length === leaves.length) continue
      for (const [key] of leaves) if (removable(key, scope, locale)) removed.push(`${code} ${scope === GLOBAL_SCOPE ? '' : `${scope} `}${key}`)
      if (!args.dryRun) locale.replaceTree(scope, unflatten(Object.fromEntries(kept)))
    }
  }

  if (args.dryRun) {
    log.list('Would remove', removed)
    log.info(`Dry run: ${removed.length} keys would be removed.`)
    return
  }
  project.save()
  log.success(`Removed ${removed.length} unused keys.`)
}
