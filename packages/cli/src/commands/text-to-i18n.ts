import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { notFoundError, usageError, validationError } from '../errors'
import { readJsonIfExists, readUtf8, splitList, stringifyLike, writeFilesAtomic } from '../fs'
import { type JsonObject, flattenStrings, isWritableKey, setPath } from '../json'
import { ask, choose, log } from '../log'
import { type ProjectConfig, loadProjectConfig } from '../nuxt'
import { isCodeFile, isOwnSource, isTestFile, projectFiles } from '../source'
import { type Conversion, type Hardcoded, KeyRegistry, type NewTranslation, convertSource } from '../text-to-i18n'

export interface TextToI18nArgs {
  cwd?: string
  translationFile?: string
  path?: string
  context?: string
  ignore?: string
  dryRun?: boolean
  interactive?: boolean
}

interface Decisions {
  keyOverrides: Record<string, string>
  skippedKeys: string[]
}

const VALID_KEY = /^[\p{L}\p{N}_.-]+$/u

/** A layer or an alias target serves other apps too, and the new keys would land in this one only. */
function ownFiles(config: ProjectConfig, files: string[]): string[] {
  const own = files.filter((file) => isOwnSource(config, file))
  if (own.length < files.length) log.warn(`Left ${files.length - own.length} files of layers and folders outside the project alone.`)
  return own
}

function filesToProcess(config: ProjectConfig, args: TextToI18nArgs): string[] {
  const scanned = projectFiles(config, { ignore: splitList(args.ignore) })
  const sources = scanned.filter((file) => isCodeFile(file) && !isTestFile(config, file) && !/\bnuxt\.config\.\w+$/.test(file))
  if (!args.path) return sources
  const target = resolve(config.rootDir, args.path)
  if (!existsSync(target)) throw notFoundError(`Path does not exist: ${target}`)
  // A folder narrows the same walk: `--path .` must not reach build output and tests.
  if (statSync(target).isDirectory()) return sources.filter((file) => !relative(target, file).startsWith('..'))
  if (!isCodeFile(target)) throw validationError(`Unsupported file type: ${target}`, ['Supported: .vue, .js, .ts, .jsx, .tsx'])
  return [target]
}

interface RunResult {
  changes: Array<[string, string]>
  created: Map<string, NewTranslation>
  mixed: Hardcoded[]
  code: Hardcoded[]
  blocked: Hardcoded[]
}

function convertAll(files: string[], args: TextToI18nArgs, tree: JsonObject, decisions: Decisions): RunResult {
  const keys = new KeyRegistry(flattenStrings(tree), tree, { context: args.context, ...decisions })
  const changes: Array<[string, string]> = []
  const conversions: Conversion[] = []

  for (const file of files) {
    try {
      const content = readUtf8(file)
      const conversion = convertSource(content, file, keys)
      conversions.push(conversion)
      if (conversion.content !== content) changes.push([file, conversion.content])
    } catch (error) {
      log.warn(`Skipping ${file}: ${(error as Error).message}`)
    }
  }
  return {
    changes,
    created: keys.created,
    mixed: conversions.flatMap((item) => item.mixed),
    code: conversions.flatMap((item) => item.code),
    blocked: keys.blocked,
  }
}

async function askDecision(entry: NewTranslation, decisions: Decisions, reserved: Set<string>): Promise<void> {
  log.info(`\n[${entry.file}:${entry.line}] "${entry.value}" -> ${entry.key}`)
  const action = await choose('Action', ['accept', 'edit', 'skip'])
  if (!action) throw usageError('No answer: stopping without changing anything.')
  if (action === 'skip') {
    decisions.skippedKeys.push(entry.key)
    reserved.delete(entry.key)
    return
  }
  if (action !== 'edit') return

  const edited = await ask(`New key for "${entry.value}":`)
  if (!edited || edited === entry.key) return
  if (reserved.has(edited) || !VALID_KEY.test(edited) || !isWritableKey(edited)) {
    log.warn(`Key "${edited}" is taken or not a valid key; keeping ${entry.key}.`)
    return
  }
  decisions.keyOverrides[entry.key] = edited
  reserved.delete(entry.key)
  reserved.add(edited)
}

async function collectDecisions(created: Map<string, NewTranslation>, existing: Record<string, string>): Promise<Decisions> {
  const decisions: Decisions = { keyOverrides: {}, skippedKeys: [] }
  const reserved = new Set([...created.keys(), ...Object.keys(existing)])
  for (const entry of created.values()) {
    // oxlint-disable-next-line no-await-in-loop -- one question at a time
    await askDecision(entry, decisions, reserved)
  }
  return decisions
}

function report(title: string, items: Hardcoded[], rootDir: string): void {
  log.list(
    title,
    items.map(({ file, line, text }) => `${relative(rootDir, file)}:${line} ${text}`),
  )
}

export default async function run(args: TextToI18nArgs): Promise<void> {
  const config = await loadProjectConfig(args.cwd ?? '.')
  const translationFile = args.translationFile
    ? resolve(config.rootDir, args.translationFile)
    : join(config.translationDir, `${config.defaultLocale}.json`)
  const translations = readJsonIfExists(translationFile)
  const files = ownFiles(config, filesToProcess(config, args))

  let result = convertAll(files, args, translations, { keyOverrides: {}, skippedKeys: [] })
  if (args.interactive && result.created.size > 0) {
    result = convertAll(files, args, translations, await collectDecisions(result.created, flattenStrings(translations)))
  }

  log.info(`Found ${files.length} files to process.`)
  report('Mixed text, not rewritten: wrap the sentence in one key by hand', result.mixed, config.rootDir)
  report('Text in code, not rewritten: `$t` may not be in scope there', result.code, config.rootDir)
  report('Skipped: the key would overwrite a value, or cannot be written in a template', result.blocked, config.rootDir)

  if (result.created.size === 0 && result.changes.length === 0) {
    log.info('No new translations found.')
    return
  }
  log.info(`Found ${result.created.size} new translations.`)

  if (args.dryRun) {
    log.info('Dry run: no files were modified.')
    let index = 0
    for (const { key, value, file, line } of result.created.values()) {
      index += 1
      log.info(`[${index}] ${key}: "${value}" (${relative(config.rootDir, file)}:${line})`)
    }
    return
  }

  for (const { key, value } of result.created.values()) setPath(translations, key, value)
  const previous = existsSync(translationFile) ? readFileSync(translationFile, 'utf8') : undefined
  // One step: rewritten sources must not exist without the keys they call.
  writeFilesAtomic([...result.changes, [translationFile, stringifyLike(previous, translations)]])
  log.success(`Updated ${result.changes.length} files and ${relative(config.rootDir, translationFile)}.`)
}
