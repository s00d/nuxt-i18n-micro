import { readFileSync } from 'node:fs'
import { notFoundError, validationError } from '../errors'
import { writeFilesAtomic } from '../fs'
import { type JsonObject, type JsonValue, flatten, unflatten } from '../json'
import { log } from '../log'
import { Project } from '../project'
import { allProjectSources } from '../source'

export interface RenameArgs {
  cwd?: string
  translationDir?: string
  from: string
  to: string
  dryRun?: boolean
}

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const CALLEES = String.raw`(?:\$t|\$ts|\$tc|\$has|\bi18n\.(?:t|ts|tc|has)|\$i18n\.(?:t|ts|tc|has)|\bt|\bts|\btc)`

interface Replaced {
  text: string
  count: number
}

function replaceKeyInSource(content: string, from: string, to: string): Replaced {
  const key = escapeRegExp(from)
  const call = new RegExp(String.raw`(${CALLEES}\s*\(\s*)(['"\`])${key}\2`, 'g')
  const keypath = new RegExp(String.raw`(\bkeypath=)(['"])${key}\2`, 'g')
  const link = new RegExp(String.raw`(@:)${key}(?![\w.])`, 'g')
  let count = 0
  const replaceQuoted = (_match: string, prefix: string, quote: string): string => {
    count += 1
    return `${prefix}${quote}${to}${quote}`
  }
  const text = content
    .replace(call, replaceQuoted)
    .replace(keypath, replaceQuoted)
    .replace(link, (_match, prefix: string) => {
      count += 1
      return `${prefix}${to}`
    })
  return { text, count }
}

function renameInTree(tree: JsonObject, from: string, to: string): { tree: JsonObject; renamed: boolean; links: number } {
  const flat = flatten(tree)
  const renamed = Object.hasOwn(flat, from)
  if (renamed && Object.hasOwn(flat, to)) throw validationError(`Target key already exists: ${to}`, [], { Key: to })

  const next: Record<string, JsonValue> = {}
  let links = 0
  for (const [key, value] of Object.entries(flat)) {
    const replaced = typeof value === 'string' ? replaceKeyInSource(value, from, to) : { text: value, count: 0 }
    links += replaced.count
    next[key === from ? to : key] = replaced.text
  }
  return { tree: unflatten(next), renamed, links }
}

export default async function run(args: RenameArgs): Promise<void> {
  const { from, to, dryRun } = args
  if (from === to) throw validationError('Source and target keys must be different')

  const project = await Project.load(args)
  let localesUpdated = 0
  let linkedRefs = 0

  for (const code of project.codes) {
    const locale = project.locale(code)
    let changed = false
    for (const scope of locale.scopes) {
      const result = renameInTree(locale.tree(scope), from, to)
      if (!result.renamed && result.links === 0) continue
      changed = true
      linkedRefs += result.links
      if (!dryRun) locale.replaceTree(scope, result.tree)
    }
    if (changed) localesUpdated += 1
  }

  const sourceChanges: Array<[string, string]> = []
  let sourceReplacements = 0
  for (const file of allProjectSources(project.config)) {
    const { text, count } = replaceKeyInSource(readFileSync(file, 'utf8'), from, to)
    if (count === 0) continue
    sourceChanges.push([file, text])
    sourceReplacements += count
  }

  if (localesUpdated === 0 && sourceChanges.length === 0) {
    throw notFoundError(`Key not found: ${from}`, ['Search for the key first: i18n-micro search "<fragment>"'], { Key: from })
  }

  if (dryRun) {
    log.info('Dry run: no files were modified.')
  } else {
    project.save()
    writeFilesAtomic(sourceChanges)
    log.success(`Key renamed: ${from} -> ${to}`)
  }
  log.info(
    `Locales: ${localesUpdated}, linked messages: ${linkedRefs}, source files: ${sourceChanges.length}, source replacements: ${sourceReplacements}`,
  )
}
