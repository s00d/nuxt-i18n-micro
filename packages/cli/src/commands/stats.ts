import { execFileSync } from 'node:child_process'
import { join, relative, resolve, sep } from 'node:path'
import { validationError } from '../errors'
import { type JsonObject, flattenStrings, isObject } from '../json'
import { log } from '../log'
import { Project } from '../project'
import { type StatsDiff, type StatsInput, type StatsReport, buildStatsDiff, buildStatsReport, generateStatsHtmlReport } from '../stats-report'

export interface StatsArgs {
  cwd?: string
  translationDir?: string
  full?: boolean
  html?: string
  json?: boolean
  baseRef?: string
}

type LocaleTree = Pick<StatsInput['locales'][number], 'code' | 'global' | 'pages'>

function buildInput(trees: LocaleTree[], defaultLocale: string, pageScopes: string[]): StatsInput {
  const reference = trees.find((tree) => tree.code === defaultLocale)
  const referenceGlobalKeys = Object.keys(flattenStrings(reference?.global ?? {}))
  const referencePageKeys = Object.fromEntries(pageScopes.map((scope) => [scope, Object.keys(flattenStrings(reference?.pages[scope] ?? {}))]))
  const pageCombined = Object.entries(referencePageKeys).flatMap(([scope, keys]) => keys.map((key) => `pages.${scope}.${key}`))
  return {
    locales: trees.map((tree) => ({ ...tree, combined: { ...tree.global, pages: tree.pages } })),
    pageScopes,
    referenceGlobalKeys,
    referencePageKeys,
    referenceCombinedKeys: [...new Set([...referenceGlobalKeys, ...pageCombined])],
    totalFiles: trees.length * (pageScopes.length + 1),
  }
}

function gitShow(rootDir: string, ref: string, path: string): JsonObject {
  const gitPath = relative(rootDir, path).split(sep).join('/')
  try {
    const parsed = JSON.parse(
      execFileSync('git', ['show', `${ref}:./${gitPath}`], { cwd: rootDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }),
    ) as unknown
    return isObject(parsed) ? parsed : {}
  } catch {
    return {} // the file did not exist at that ref
  }
}

function gitPageScopes(rootDir: string, ref: string, translationDir: string): string[] {
  const pagesDir = relative(rootDir, join(translationDir, 'pages')).split(sep).join('/')
  const listing = execFileSync('git', ['ls-tree', '-r', '--name-only', ref, '--', `./${pagesDir}`], {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  const scopes = listing
    .split('\n')
    .filter((line) => line.endsWith('.json'))
    .map((line) => line.slice(line.indexOf('pages/') + 'pages/'.length, line.lastIndexOf('/')))
  return [...new Set(scopes)]
}

function assertRef(rootDir: string, ref: string): void {
  try {
    execFileSync('git', ['rev-parse', '--verify', `${ref}^{commit}`], { cwd: rootDir, stdio: 'ignore' })
  } catch {
    throw validationError(`Unknown git ref: ${ref}`, ['Pass a branch, tag or commit of this repository.'])
  }
}

function inputAtRef(project: Project, ref: string): StatsInput {
  const { rootDir, translationDir, defaultLocale } = project.config
  assertRef(rootDir, ref)
  const scopes = [...new Set([...project.reference.pageScopes, ...gitPageScopes(rootDir, ref, translationDir)])]
  const trees = project.codes.map((code) => ({
    code,
    global: gitShow(rootDir, ref, join(translationDir, `${code}.json`)),
    pages: Object.fromEntries(scopes.map((scope) => [scope, gitShow(rootDir, ref, join(translationDir, 'pages', scope, `${code}.json`))])),
  }))
  return buildInput(trees, defaultLocale, scopes)
}

const percent = (value: number): string => `${value.toFixed(2)}%`

interface Completion {
  totalKeys: number
  translatedKeys: number
  completion: number
}

const completionRows = (stats: Completion): Array<[string, string | number]> => [
  ['Total Keys', stats.totalKeys],
  ['Translated Keys', stats.translatedKeys],
  ['Completion', percent(stats.completion)],
]

function printLocaleDetails(locale: StatsReport['locales'][number]): void {
  const { global } = locale
  log.section(`Locale: ${locale.code}`)
  log.info('Global Translations:')
  log.rows(
    [
      ...completionRows(global),
      ['Average Key Length', global.averageKeyLength.toFixed(2)],
      ['Average Value Length', global.averageValueLength.toFixed(2)],
      ['Special Characters', global.specialCharsCount],
      ['Empty Values', global.emptyValues],
      ['Total Words', global.wordStats.totalWords],
      ['Unique Words', global.wordStats.uniqueWords],
    ],
    '  ',
  )
  log.list('Duplicate Values', global.duplicateValues)
  log.list(
    'Formatting Issues',
    global.formattingIssues.map((issue) => `${issue.key}: ${issue.issue}`),
  )
  log.list(
    'Value Types',
    Object.entries(global.valueTypes).map(([type, count]) => `${type}: ${count}`),
  )
  log.list(
    'String Lengths',
    Object.entries(global.stringLengths).map(([size, count]) => `${size}: ${count}`),
  )
  log.list(
    'Variables',
    global.variables.examples.slice(0, 5).map(({ key, variables }) => `${key}: ${variables.join(', ')}`),
  )
  log.list(
    'Most Used Tags',
    global.htmlTags.tags.slice(0, 5).map(({ tag, count }) => `${tag}: ${count}`),
  )
  for (const [page, stats] of Object.entries(locale.pages)) {
    log.info(`\nPage ${page}:`)
    log.rows(completionRows(stats), '  ')
  }
  log.info('\nCombined:')
  log.rows(completionRows(locale.combined), '  ')
}

function printFull(report: StatsReport): void {
  for (const locale of report.locales) printLocaleDetails(locale)
  log.section('Summary')
  log.rows([
    ['Total Locales', report.summary.totalLocales],
    ['Total Files', report.summary.totalFiles],
    ['Total Keys', report.summary.totalKeys],
    ['Average Completion', percent(report.summary.averageCompletion)],
    ['Most Translated Locale', report.summary.mostTranslatedLocale],
    ['Least Translated Locale', report.summary.leastTranslatedLocale],
  ])
}

function printDiff(diff: StatsDiff): void {
  log.section(`Diff vs ${diff.baseRef}`)
  log.rows(diff.locales.map((locale) => [locale.code, `${locale.completionDelta >= 0 ? '+' : ''}${percent(locale.completionDelta)}`]))
}

function printSummary(report: StatsReport): void {
  log.section('Completion Summary')
  log.rows(report.locales.map(({ code, combined }) => [code, `${combined.translatedKeys}/${combined.totalKeys} (${percent(combined.completion)})`]))
}

export default async function run(args: StatsArgs): Promise<void> {
  const project = await Project.load(args)
  const { rootDir, defaultLocale } = project.config
  const trees = project.codes.map((code) => {
    const { global, pages } = project.locale(code)
    return { code, global, pages }
  })
  const report = buildStatsReport(buildInput(trees, defaultLocale, project.reference.pageScopes))
  const diff = args.baseRef ? buildStatsDiff(report, buildStatsReport(inputAtRef(project, args.baseRef)), args.baseRef) : undefined
  const htmlReportPath = args.html ? resolve(rootDir, args.html) : undefined
  if (htmlReportPath) generateStatsHtmlReport(report, htmlReportPath)

  if (args.json) {
    log.json({ ...report, diff, htmlReportPath })
    return
  }

  if (args.full) printFull(report)
  else printSummary(report)
  if (diff) printDiff(diff)
  if (htmlReportPath) log.success(`HTML report generated: ${htmlReportPath}`)
}
