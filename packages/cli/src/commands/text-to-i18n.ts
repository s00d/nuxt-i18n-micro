import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { notFoundError, usageError, validationError } from '../errors'
import { readJsonIfExists, splitList, stringifyLike, walkFiles, writeFilesAtomic } from '../fs'
import { type JsonObject, flattenStrings, setPath } from '../json'
import { ask, choose, log } from '../log'
import { type ProjectConfig, loadProjectConfig } from '../nuxt'
import { isCodeFile, isTestFile, projectFiles } from '../source'
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

function filesToProcess(config: ProjectConfig, args: TextToI18nArgs): string[] {
  if (!args.path) {
    const files = projectFiles(config, { ignore: splitList(args.ignore) })
    return files.filter((file) => isCodeFile(file) && !isTestFile(config, file) && !/\bnuxt\.config\.\w+$/.test(file))
  }
  const target = resolve(config.rootDir, args.path)
  if (!existsSync(target)) throw notFoundError(`Path does not exist: ${target}`)
  if (statSync(target).isDirectory()) return walkFiles(target, isCodeFile)
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
    const content = readFileSync(file, 'utf8')
    try {
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
  if (reserved.has(edited) || !VALID_KEY.test(edited)) {
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
  const files = filesToProcess(config, args)

  let result = convertAll(files, args, translations, { keyOverrides: {}, skippedKeys: [] })
  if (args.interactive && result.created.size > 0) {
    result = convertAll(files, args, translations, await collectDecisions(result.created, flattenStrings(translations)))
  }

  log.info(`Found ${files.length} files to process.`)
  report('Mixed text, not rewritten: wrap the sentence in one key by hand', result.mixed, config.rootDir)
  report('Text in code, not rewritten: `$t` may not be in scope there', result.code, config.rootDir)
  report('Skipped: the generated key would overwrite an existing value', result.blocked, config.rootDir)

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
