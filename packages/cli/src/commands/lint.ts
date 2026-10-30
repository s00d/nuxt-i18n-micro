import { copyFileSync, existsSync } from 'node:fs'
import { basename, join } from 'node:path'
import { commandFailed } from '../errors'
import { readJsonIfExists, readJsonObject, walkFiles, writeJson } from '../fs'
import { type JsonObject, flattenStrings, setPath } from '../json'
import { type LintConfig, type LintResult, type LintRule, lintRules } from '../lint-rules'
import { log } from '../log'
import { Project } from '../project'

export interface LintArgs {
  cwd?: string
  translationDir?: string
  rules?: string
  fix?: boolean
  json?: boolean
}

const stringList = (value: unknown): string[] | undefined => (Array.isArray(value) ? value.filter((item) => typeof item === 'string') : undefined)

function customRule(item: Record<string, unknown>): LintRule[] {
  const { name, pattern, flags, description, replacement } = item
  if (typeof name !== 'string' || typeof pattern !== 'string') return []
  let matcher: RegExp
  try {
    matcher = new RegExp(pattern, typeof flags === 'string' ? flags : undefined)
  } catch {
    log.warn(`Skipping lint rule "${name}": invalid pattern ${pattern}`)
    return []
  }
  return [
    {
      name,
      description: typeof description === 'string' ? description : `Regex rule: ${pattern}`,
      check: (value) => {
        // A `g` or `y` regex keeps its position between calls.
        matcher.lastIndex = 0
        return !matcher.test(value)
      },
      message: (_value, { key, locale, file }) => `Custom lint rule "${name}" failed in file ${file} for key ${key} (${locale})`,
      fix: typeof replacement === 'string' ? (value) => value.replace(matcher, replacement) : undefined,
    },
  ]
}

function loadConfig(rootDir: string): LintConfig {
  const raw = readJsonIfExists(join(rootDir, '.i18n-lintrc.json')) as Record<string, unknown>
  const custom = Array.isArray(raw.customRegexRules) ? raw.customRegexRules : []
  return {
    enabledRules: stringList(raw.enabledRules),
    disabledRules: stringList(raw.disabledRules),
    customRules: custom.filter((item) => item !== null && typeof item === 'object').flatMap((item) => customRule(item as Record<string, unknown>)),
  }
}

function selectRules(args: LintArgs, config: LintConfig): LintRule[] {
  const available = [...lintRules, ...config.customRules]
  const requested =
    args.rules?.split(',').map((name) => name.trim()) ?? (config.enabledRules?.length ? config.enabledRules : available.map((rule) => rule.name))
  const unknown = requested.filter((name) => !available.some((rule) => rule.name === name))
  if (unknown.length > 0) log.warn(`Unknown lint rules: ${unknown.join(', ')}`)
  const disabled = new Set(config.disabledRules)
  return available.filter((rule) => requested.includes(rule.name) && !disabled.has(rule.name))
}

function lintFile(file: string, locale: string, rules: LintRule[]): LintResult[] {
  const results: LintResult[] = []
  for (const [key, value] of Object.entries(flattenStrings(readJsonObject(file)))) {
    const context = { key, locale, file }
    for (const rule of rules) {
      if (!rule.check(value, context)) results.push({ file, locale, key, value, rule: rule.name, message: rule.message(value, context) })
    }
  }
  return results
}

function lintProject(project: Project, rules: LintRule[]): LintResult[] {
  const dir = project.config.translationDir
  return project.codes.flatMap((code) => {
    const fileName = `${code}.json`
    const pageFiles = walkFiles(join(dir, 'pages'), (path) => basename(path) === fileName)
    const global = join(dir, fileName)
    return [...(existsSync(global) ? [global] : []), ...pageFiles].flatMap((file) => lintFile(file, code, rules))
  })
}

/** Fixes stack: two rules on one value both apply, in rule order. */
function applyFixes(results: LintResult[], rules: LintRule[]): number {
  const fixers = new Map(rules.map((rule) => [rule.name, rule.fix]))
  const byFile = new Map<string, LintResult[]>()
  for (const result of results) byFile.set(result.file, [...(byFile.get(result.file) ?? []), result])
  let fixed = 0

  for (const [file, fileResults] of byFile) {
    const tree: JsonObject = readJsonObject(file)
    const current = flattenStrings(tree)
    let changed = false
    for (const result of fileResults) {
      const before = current[result.key]!
      const after = fixers.get(result.rule)?.(before) ?? before
      if (after === before) continue
      current[result.key] = after
      setPath(tree, result.key, after)
      fixed += 1
      changed = true
    }
    if (!changed) continue
    copyFileSync(file, `${file}.bak`)
    writeJson(file, tree)
  }
  return fixed
}

export default async function run(args: LintArgs): Promise<void> {
  const project = await Project.load(args)
  const rules = selectRules(args, loadConfig(project.config.rootDir))
  if (rules.length === 0) {
    log.warn('No rules to check')
    return
  }

  const results = lintProject(project, rules)
  const fixedCount = args.fix ? applyFixes(results, rules) : 0
  const remaining = args.fix ? lintProject(project, rules) : results

  if (args.json) {
    log.json({ rulesChecked: rules.map((rule) => rule.name), issueCount: results.length, fixedCount, fixApplied: Boolean(args.fix), issues: results })
  } else {
    log.info(`Active rules: ${rules.map((rule) => rule.name).join(', ')}`)
    for (const result of results) log.warn(`[${result.rule}] ${result.message}`)
    if (fixedCount > 0) log.success(`Fixed ${fixedCount} issues; originals kept as .bak`)
    if (remaining.length === 0) log.success('Check completed. No issues remain.')
  }

  if (remaining.length > 0) {
    throw commandFailed(`Found ${remaining.length} issues that need to be fixed`, [
      'Review the issues above, or run with --json for machine-readable output.',
      'Apply automatic fixes where available: i18n-micro lint --fix',
    ])
  }
}
