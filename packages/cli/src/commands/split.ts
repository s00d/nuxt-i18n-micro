import { join, resolve } from 'node:path'
import { stringifyJson, writeFilesAtomic } from '../fs'
import { type JsonObject, type JsonValue, flatten, isObject } from '../json'
import { log } from '../log'
import { Project } from '../project'

export interface SplitArgs {
  cwd?: string
  translationDir?: string
  maxKeys: number
  maxDepth: number
  splitByPrefix?: boolean
  outputDir?: string
}

type Group = Record<string, JsonValue>

/** Dotted keys down to `maxDepth`; anything deeper stays a nested object. */
function joinToDepth(tree: JsonObject, maxDepth: number, depth = 0): Group {
  const out: Group = {}
  for (const [key, value] of Object.entries(tree)) {
    if (!isObject(value) || depth >= maxDepth) {
      out[key] = value
      continue
    }
    for (const [nested, nestedValue] of Object.entries(joinToDepth(value, maxDepth, depth + 1))) out[`${key}.${nested}`] = nestedValue
  }
  return out
}

function groupByPrefix(entries: Group): Record<string, Group> {
  const groups: Record<string, Group> = {}
  for (const [key, value] of Object.entries(entries)) {
    const prefix = key.split('.')[0]!
    groups[prefix] = { ...groups[prefix], [key]: value }
  }
  return groups
}

/** A group over `maxKeys` continues in `<prefix>.2`, `<prefix>.3`: a prefix has no dot, so no name can clash. */
function limitGroup(prefix: string, group: Group, maxKeys: number): Array<[string, Group]> {
  const entries = Object.entries(group)
  const parts: Array<[string, Group]> = []
  for (let index = 0; index < entries.length; index += maxKeys) {
    const part = index / maxKeys + 1
    parts.push([part === 1 ? prefix : `${prefix}.${part}`, Object.fromEntries(entries.slice(index, index + maxKeys))])
  }
  return parts
}

export default async function run(args: SplitArgs): Promise<void> {
  const project = await Project.load(args)
  const outputDir = args.outputDir ? resolve(project.config.rootDir, args.outputDir) : join(project.config.translationDir, 'split')
  const files: Array<[string, string]> = []

  for (const code of project.codes) {
    const tree = project.locale(code).global
    const entries = args.splitByPrefix ? flatten(tree) : joinToDepth(tree, args.maxDepth)
    const parts = Object.entries(groupByPrefix(entries)).flatMap(([prefix, group]) => limitGroup(prefix, group, args.maxKeys))
    for (const [name, part] of parts) files.push([join(outputDir, code, `${name}.json`), stringifyJson(part)])
    log.success(`Split translations for locale ${code} into ${parts.length} files`)
  }

  writeFilesAtomic(files)
}
