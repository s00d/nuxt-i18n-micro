import { MagicString } from '@vue/compiler-sfc'
import { notFoundError, validationError } from '../errors'
import { readUtf8, splitList, writeFilesAtomic } from '../fs'
import { type JsonObject, type JsonValue, deletePath, flatten, getPath, groupBy, isWritableKey, pathConflict, setPath } from '../json'
import { log } from '../log'
import type { ProjectConfig } from '../nuxt'
import { Project } from '../project'
import { type ProjectScan, type ScopedRef, isOwnSource, scanProject } from '../source'

export interface RenameArgs {
  cwd?: string
  translationDir?: string
  from: string
  to: string
  ignore?: string
  dryRun?: boolean
}

interface Rename {
  from: string
  to: string
  renamed(key: string): string | null
}

function renameFor(from: string, to: string): Rename {
  return { from, to, renamed: (key) => (key === from ? to : key.startsWith(`${from}.`) ? `${to}${key.slice(from.length)}` : null) }
}

interface Move {
  key: string
  target: string
  value: JsonValue
  /** Written as one dotted key: the renamed one stays that way. */
  flat: boolean
}

/** One path at a time, on a copy: a clash halfway leaves the tree as it was, and every other key as written. */
function moved(tree: JsonObject, rename: Rename): JsonObject | null {
  const moves = Object.keys(flatten(tree)).flatMap((key): Move[] => {
    const target = rename.renamed(key)
    return target ? [{ key, target, value: getPath(tree, key)!, flat: Object.hasOwn(tree, key) }] : []
  })
  if (moves.length === 0) return null
  const next = structuredClone(tree)
  // Twice is possible: `{ "a.b": 1, a: { b: 2 } }`.
  for (const { key } of moves) while (deletePath(next, key));
  for (const { target, value, flat } of moves) {
    const clash = getPath(next, target) === undefined ? pathConflict(next, target) : target
    if (clash) throw validationError(`Target key already exists: ${clash}`, [], { Key: clash })
    if (flat) next[target] = value
    else setPath(next, target, value)
  }
  return next
}

function applyToLocales(project: Project, rename: Rename): number {
  let changed = 0
  for (const code of project.codes) {
    const locale = project.locale(code)
    const scopes = locale.scopes.filter((scope) => {
      const next = moved(locale.tree(scope), rename)
      if (next) locale.replaceTree(scope, next)
      if (next && getPath(locale.inheritedTree(scope), rename.from) !== undefined)
        log.warn(`${rename.from} is also defined in a layer of ${code}: it stays there.`)
      return Boolean(next)
    })
    if (scopes.length > 0) changed += 1
  }
  return changed
}

/** Only what the parser placed. A position that does not hold the key means the expression was decoded: leave it. */
function rewritable(ref: ScopedRef, content: string): boolean {
  const written = ref.keyPrefix ? ref.key.slice(ref.keyPrefix.length) : ref.key
  return ref.start >= 0 && content.slice(ref.start, ref.end) === written
}

function rewriteFile(file: string, refs: ScopedRef[], rename: Rename, skipped: ScopedRef[], config: ProjectConfig): [string, string] | null {
  if (!isOwnSource(config, file)) {
    skipped.push(...refs)
    return null
  }
  const content = readUtf8(file)
  const magic = new MagicString(content)
  let count = 0
  for (const ref of refs) {
    const target = rename.renamed(ref.key)!
    const fits = !ref.keyPrefix || target.startsWith(ref.keyPrefix)
    if (!rewritable(ref, content) || !fits) {
      skipped.push(ref)
      continue
    }
    magic.overwrite(ref.start, ref.end, target.slice(ref.keyPrefix?.length ?? 0))
    count += 1
  }
  return count > 0 ? [file, magic.toString()] : null
}

function rewriteSources(scan: ProjectScan, rename: Rename, skipped: ScopedRef[], config: ProjectConfig): Array<[string, string]> {
  const byFile = groupBy(
    scan.refs.filter((ref) => rename.renamed(ref.key)),
    (ref) => ref.file,
  )
  return [...byFile].flatMap(([file, refs]) => {
    const change = rewriteFile(file, refs, rename, skipped, config)
    return change ? [change] : []
  })
}

/** What a rename cannot do by itself. Silence here is how `$t(name)` ends up pointing at nothing. */
function warnLeftovers(scan: ProjectScan, rename: Rename, skipped: ScopedRef[]): void {
  for (const ref of skipped) log.warn(`Not rewritten, change by hand: ${ref.file}:${ref.line}`)
  for (const entry of scan.dynamic) {
    if (entry.prefix && (rename.renamed(entry.prefix.replace(/\.$/, '')) || rename.from.startsWith(entry.prefix))) {
      log.warn(`Computed key may need the new name: ${entry.file}:${entry.line}: ${entry.expression}`)
    }
  }
  for (const [text, locations] of scan.literals) {
    if (!rename.renamed(text)) continue
    for (const location of locations) log.warn(`The key also appears as a plain string: ${location}`)
  }
}

export default async function run(args: RenameArgs): Promise<void> {
  const { from, to, dryRun } = args
  if (!from || !to) throw validationError('--from and --to cannot be empty')
  if (from === to) throw validationError('Source and target keys must be different')
  if (!isWritableKey(to)) throw validationError(`--to cannot be a key: ${to}`, ['No quotes, backslashes, empty segments or __proto__.'])

  const project = await Project.load(args)
  const rename = renameFor(from, to)
  const localesUpdated = applyToLocales(project, rename)

  const scan = scanProject(project.config, { ignore: splitList(args.ignore) })
  const skipped: ScopedRef[] = []
  const sourceChanges = rewriteSources(scan, rename, skipped, project.config)
  const replaced = scan.refs.filter((ref) => rename.renamed(ref.key)).length - skipped.length

  if (localesUpdated === 0 && sourceChanges.length === 0) {
    throw notFoundError(`Key not found: ${from}`, ['Search for the key first: i18n-micro search "<fragment>"'], { Key: from })
  }

  warnLeftovers(scan, rename, skipped)
  if (dryRun) log.info('Dry run: no files were modified.')
  else {
    writeFilesAtomic([...project.pendingFiles(), ...sourceChanges])
    log.success(`Key renamed: ${from} -> ${to}`)
  }
  log.info(`Locales: ${localesUpdated}, source files: ${sourceChanges.length}, source replacements: ${replaced}`)
}
