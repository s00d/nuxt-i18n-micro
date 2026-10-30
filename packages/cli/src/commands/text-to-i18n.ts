import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { notFoundError, validationError } from '../errors'
import { readJsonIfExists, stringifyJson, walkFiles, writeFileAtomic, writeFilesAtomic } from '../fs'
import { flattenStrings, setPath } from '../json'
import { ask, choose, log } from '../log'
import { type ProjectConfig, loadProjectConfig } from '../nuxt'
import { allProjectSources, isSourceFile } from '../source'
import { KeyRegistry, type NewTranslation, convertSource, extractOnlyMatcher } from '../text-to-i18n'

export interface TextToI18nArgs {
  cwd?: string
  translationFile?: string
  path?: string
  context?: string
  dryRun?: boolean
  verbose?: boolean
  extractOnlyDirs: string
  extractOnlyPatterns?: string
  interactive?: boolean
}

interface Decisions {
  keyOverrides: Record<string, string>
  skippedKeys: string[]
}

const splitList = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

function filesToProcess(config: ProjectConfig, customPath: string | undefined): string[] {
  if (!customPath) return allProjectSources(config)
  const target = resolve(config.rootDir, customPath)
  if (!existsSync(target)) throw notFoundError(`Path does not exist: ${target}`)
  if (statSync(target).isDirectory()) return walkFiles(target, isSourceFile)
  if (!isSourceFile(target)) throw validationError(`Unsupported file type: ${target}`, ['Supported: .vue, .js, .ts, .jsx, .tsx'])
  return [target]
}

interface RunResult {
  changes: Array<[string, string]>
  created: Map<string, NewTranslation>
}

function convertAll(files: string[], config: ProjectConfig, args: TextToI18nArgs, existing: Record<string, string>, decisions: Decisions): RunResult {
  const keys = new KeyRegistry(existing, { context: args.context, ...decisions })
  const isExtractOnly = extractOnlyMatcher(config.rootDir, { dirs: splitList(args.extractOnlyDirs), patterns: splitList(args.extractOnlyPatterns) })
  const changes: Array<[string, string]> = []

  for (const file of files) {
    const content = readFileSync(file, 'utf8')
    if (args.verbose) log.info(`Processing ${relative(config.rootDir, file)}`)
    try {
      const updated = convertSource(content, file, keys, isExtractOnly(file))
      if (updated !== content) changes.push([file, updated])
    } catch (error) {
      log.warn(`Skipping ${file}: ${(error as Error).message}`)
    }
  }
  return { changes, created: keys.created }
}

async function askDecision(entry: NewTranslation, decisions: Decisions, reserved: Set<string>): Promise<void> {
  log.info(`\n[${entry.file}:${entry.line}] "${entry.value}" -> ${entry.key}`)
  const action = await choose('Action', ['accept', 'edit', 'skip'])
  if (action === 'skip') {
    decisions.skippedKeys.push(entry.key)
    reserved.delete(entry.key)
    return
  }
  if (action !== 'edit') return

  const edited = await ask(`New key for "${entry.value}":`)
  if (!edited || edited === entry.key) return
  if (reserved.has(edited)) {
    log.warn(`Key "${edited}" is already used in this run; keeping ${entry.key}.`)
    return
  }
  decisions.keyOverrides[entry.key] = edited
  reserved.delete(entry.key)
  reserved.add(edited)
}

async function collectDecisions(created: Map<string, NewTranslation>): Promise<Decisions> {
  const decisions: Decisions = { keyOverrides: {}, skippedKeys: [] }
  const reserved = new Set(created.keys())
  for (const entry of created.values()) {
    // oxlint-disable-next-line no-await-in-loop -- one question at a time
    await askDecision(entry, decisions, reserved)
  }
  return decisions
}

export default async function run(args: TextToI18nArgs): Promise<void> {
  const config = await loadProjectConfig(args.cwd ?? '.')
  const translationFile = args.translationFile
    ? resolve(config.rootDir, args.translationFile)
    : join(config.translationDir, `${config.defaultLocale}.json`)
  const translations = readJsonIfExists(translationFile)
  const existing = flattenStrings(translations)
  const files = filesToProcess(config, args.path)

  let result = convertAll(files, config, args, existing, { keyOverrides: {}, skippedKeys: [] })
  if (args.interactive && result.created.size > 0) {
    result = convertAll(files, config, args, existing, await collectDecisions(result.created))
  }

  log.info(`Found ${files.length} files to process.`)
  if (result.created.size === 0) {
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

  writeFilesAtomic(result.changes)
  for (const { key, value } of result.created.values()) setPath(translations, key, value)
  writeFileAtomic(translationFile, stringifyJson(translations))
  log.success(`Updated ${result.changes.length} files and ${relative(config.rootDir, translationFile)}.`)
}
