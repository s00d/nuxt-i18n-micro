import { execFileSync } from 'node:child_process'
import { join, relative, resolve, sep } from 'node:path'
import { validationError } from '../errors'
import { writeFileAtomic } from '../fs'
import { type JsonObject, flattenStrings, isObject, ownValue } from '../json'
import { log } from '../log'
import { GLOBAL_SCOPE, Project } from '../project'

export interface StatsArgs {
  cwd?: string
  translationDir?: string
  html?: string
  json?: boolean
  baseRef?: string
}

interface Trees {
  global: JsonObject
  pages: Record<string, JsonObject>
}

export interface LocaleCompletion {
  code: string
  totalKeys: number
  translatedKeys: number
  completion: number
}

export interface LocaleDelta {
  code: string
  completionDelta: number
  translatedKeysDelta: number
  totalKeysDelta: number
}

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/** Locale codes come from the project, but a report is opened in a browser. */
const esc = (text: string): string => text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]!)

const percent = (value: number): string => `${value.toFixed(2)}%`

const scopeKeys = (tree: JsonObject): string[] => Object.keys(flattenStrings(tree))

function completionOf(code: string, trees: Trees, reference: Trees): LocaleCompletion {
  const scopes = [GLOBAL_SCOPE, ...Object.keys(reference.pages)]
  const treeOf = (source: Trees, scope: string): JsonObject => (scope === GLOBAL_SCOPE ? source.global : (ownValue(source.pages, scope) ?? {}))
  let totalKeys = 0
  let translatedKeys = 0
  for (const scope of scopes) {
    const strings = flattenStrings(treeOf(trees, scope))
    const keys = scopeKeys(treeOf(reference, scope))
    totalKeys += keys.length
    translatedKeys += keys.filter((key) => Boolean(strings[key])).length
  }
  return { code, totalKeys, translatedKeys, completion: totalKeys === 0 ? 100 : (translatedKeys / totalKeys) * 100 }
}

const reportOf = (byCode: Map<string, Trees>, defaultLocale: string): LocaleCompletion[] =>
  [...byCode].map(([code, trees]) => completionOf(code, trees, byCode.get(defaultLocale)!))

function git(rootDir: string, args: string[]): string {
  return execFileSync('git', args, { cwd: rootDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: Number.POSITIVE_INFINITY })
}

function gitShow(rootDir: string, ref: string, path: string): JsonObject {
  const gitPath = relative(rootDir, path).split(sep).join('/')
  const spec = `${ref}:./${gitPath}`
  try {
    git(rootDir, ['cat-file', '-e', spec])
  } catch {
    return {} // the file did not exist at that ref
  }
  const text = git(rootDir, ['show', spec])
  try {
    const parsed = JSON.parse(text) as unknown
    return isObject(parsed) ? parsed : {}
  } catch {
    // As an empty file it would read as a false gain in completion.
    throw validationError(`Invalid JSON at ${ref}: ${gitPath}`)
  }
}

function gitPageScopes(rootDir: string, ref: string, translationDir: string): string[] {
  const pagesDir = relative(rootDir, join(translationDir, 'pages')).split(sep).join('/')
  const scopes = git(rootDir, ['ls-tree', '-r', '--name-only', ref, '--', `./${pagesDir}`])
    .split('\n')
    .filter((line) => line.endsWith('.json'))
    .map((line) => line.slice(line.indexOf('pages/') + 'pages/'.length, line.lastIndexOf('/')))
  return [...new Set(scopes)]
}

function assertRef(rootDir: string, ref: string): void {
  try {
    git(rootDir, ['rev-parse', '--verify', `${ref}^{commit}`])
  } catch {
    throw validationError(`Unknown git ref: ${ref}`, ['Pass a branch, tag or commit of this repository.'])
  }
}

function treesAtRef(project: Project, ref: string): Map<string, Trees> {
  const { rootDir, translationDir } = project.config
  assertRef(rootDir, ref)
  // The current side has no pages under `disablePageLocales`, so the baseline must not either.
  const scopes = project.config.disablePageLocales ? [] : [...new Set([...project.reference.pageScopes, ...gitPageScopes(rootDir, ref, translationDir)])]
  return new Map(
    project.codes.map((code) => [
      code,
      {
        global: gitShow(rootDir, ref, join(translationDir, `${code}.json`)),
        pages: Object.fromEntries(scopes.map((scope) => [scope, gitShow(rootDir, ref, join(translationDir, 'pages', scope, `${code}.json`))])),
      },
    ]),
  )
}

/** Git knows the project's own files, so the comparison is between own files: no layer on either side. */
function buildDiff(project: Project, ref: string): LocaleDelta[] {
  const current = new Map(project.codes.map((code) => [code, project.locale(code).own]))
  const before = new Map(reportOf(treesAtRef(project, ref), project.config.defaultLocale).map((entry) => [entry.code, entry]))
  return reportOf(current, project.config.defaultLocale).map((entry) => {
    const base = before.get(entry.code)!
    return {
      code: entry.code,
      completionDelta: entry.completion - base.completion,
      translatedKeysDelta: entry.translatedKeys - base.translatedKeys,
      totalKeysDelta: entry.totalKeys - base.totalKeys,
    }
  })
}

const htmlReport = (locales: LocaleCompletion[]): string => {
  const rows = locales.map(
    ({ code, translatedKeys, totalKeys, completion }) =>
      `<tr><td>${esc(code)}</td><td>${translatedKeys}/${totalKeys}</td><td>${percent(completion)}</td></tr>`,
  )
  return `<!doctype html><meta charset="utf-8"><title>i18n completion</title><table><tr><th>Locale</th><th>Keys</th><th>Completion</th></tr>${rows.join('')}</table>\n`
}

export default async function run(args: StatsArgs): Promise<void> {
  const project = await Project.load(args)
  const { rootDir, defaultLocale } = project.config
  const merged = new Map(project.codes.map((code): [string, Trees] => [code, project.locale(code)]))
  const locales = reportOf(merged, defaultLocale)
  const diff = args.baseRef ? { baseRef: args.baseRef, locales: buildDiff(project, args.baseRef) } : undefined
  const htmlReportPath = args.html ? resolve(rootDir, args.html) : undefined
  if (htmlReportPath) writeFileAtomic(htmlReportPath, htmlReport(locales))

  if (args.json) {
    log.json({ locales, diff, htmlReportPath })
    return
  }

  log.section('Completion Summary')
  log.rows(locales.map(({ code, translatedKeys, totalKeys, completion }) => [code, `${translatedKeys}/${totalKeys} (${percent(completion)})`]))
  if (diff) {
    log.section(`Diff vs ${diff.baseRef}`)
    log.rows(diff.locales.map(({ code, completionDelta }) => [code, `${completionDelta >= 0 ? '+' : ''}${percent(completionDelta)}`]))
  }
  if (htmlReportPath) log.success(`HTML report generated: ${htmlReportPath}`)
}
