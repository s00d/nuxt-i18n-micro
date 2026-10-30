import { join } from 'node:path'
import { findingsError, usageError } from '../errors'
import { readJsonIfExists, splitList } from '../fs'
import { flattenStrings } from '../json'
import { type LintRule, lintRules } from '../lint-rules'
import { log } from '../log'
import { Project, relativeFile } from '../project'
import { LINT_RULES } from '../spec'

export interface LintArgs {
  cwd?: string
  translationDir?: string
  rules?: string
  fix?: boolean
  json?: boolean
}

export interface LintResult {
  file: string
  locale: string
  scope: string
  key: string
  value: string
  rule: string
}

interface LintConfig {
  enabledRules: string[]
  disabledRules: string[]
  customRules: LintRule[]
}

const stringList = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [])

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
      isValid: (value) => {
        // A `g` or `y` regex keeps its position between calls.
        matcher.lastIndex = 0
        return !matcher.test(value)
      },
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
  const builtIn = LINT_RULES.map(({ name, description }) => ({ name, description, isValid: lintRules[name].isValid, fix: lintRules[name].fix }))
  const available: LintRule[] = [...builtIn, ...config.customRules]
  const requested = splitList(args.rules)
  const selected = requested.length > 0 ? requested : config.enabledRules.length > 0 ? config.enabledRules : available.map((rule) => rule.name)
  const unknown = selected.filter((name) => !available.some((rule) => rule.name === name))
  if (unknown.length > 0)
    throw usageError(`Unknown lint rules: ${unknown.join(', ')}`, [`Available: ${available.map((rule) => rule.name).join(', ')}`])
  return available.filter((rule) => selected.includes(rule.name) && !config.disabledRules.includes(rule.name))
}

/** Own files only: a layer's text is the layer's to fix. */
function lintProject(project: Project, rules: LintRule[]): LintResult[] {
  return project.codes.flatMap((code) => {
    const locale = project.locale(code)
    return locale.scopes.flatMap((scope) =>
      Object.entries(flattenStrings(locale.ownTree(scope))).flatMap(([key, value]) =>
        rules
          .filter((rule) => !rule.isValid(value))
          .map((rule) => ({ file: relativeFile(code, scope), locale: code, scope, key, value, rule: rule.name })),
      ),
    )
  })
}

/** Fixes stack: two rules on one value both apply, in rule order. */
function applyFixes(project: Project, results: LintResult[], rules: LintRule[]): number {
  const fixers = new Map(rules.map((rule) => [rule.name, rule.fix]))
  let fixed = 0
  for (const { locale, scope, key, rule } of results) {
    const set = project.locale(locale)
    const before = set.get(key, scope) as string
    const after = fixers.get(rule)?.(before) ?? before
    if (after === before) continue
    set.set(key, after, scope)
    fixed += 1
  }
  project.save()
  return fixed
}

export default async function run(args: LintArgs): Promise<void> {
  const project = await Project.load(args)
  const rules = selectRules(args, loadConfig(project.config.rootDir))
  if (rules.length === 0) {
    log.warn('No rules to check')
    if (args.json) log.json({ rulesChecked: [], issueCount: 0, fixedCount: 0, fixApplied: false, issues: [] })
    return
  }

  const results = lintProject(project, rules)
  const fixedCount = args.fix ? applyFixes(project, results, rules) : 0
  const fixers = new Set(rules.filter((rule) => rule.fix).map((rule) => rule.name))
  const remaining = args.fix ? results.filter((result) => !fixers.has(result.rule)).length : results.length

  if (args.json) {
    log.json({ rulesChecked: rules.map((rule) => rule.name), issueCount: results.length, fixedCount, fixApplied: Boolean(args.fix), issues: results })
  } else {
    log.info(`Active rules: ${rules.map((rule) => rule.name).join(', ')}`)
    for (const { rule, file, key, locale } of results) log.warn(`[${rule}] ${key} (${locale}) in ${file}`)
    if (fixedCount > 0) log.success(`Fixed ${fixedCount} issues.`)
    if (remaining === 0) log.success('Check completed. No issues remain.')
  }

  if (remaining > 0) {
    throw findingsError(`Found ${remaining} issues that need to be fixed`, [
      'Review the issues above, or run with --json for machine-readable output.',
      'Apply automatic fixes where available: i18n-micro lint --fix',
    ])
  }
}
