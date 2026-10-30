import { relative } from 'node:path'
import { findingsError, usageError } from '../errors'
import { splitList } from '../fs'
import { flattenStrings, groupBy } from '../json'
import { log } from '../log'
import { type LocaleSet, Project, relativeFile } from '../project'
import { type ProjectScan, type ScopedRef, scanProject, usageDoubts } from '../source'
import { CHECK_TYPES, type CheckType } from '../spec'
import { findUnused } from './clean'
import { extraKeys } from './sync'

export interface CheckArgs {
  cwd?: string
  translationDir?: string
  only?: string
  ignore?: string
  duplicates?: boolean
  json?: boolean
}

export interface Finding {
  type: CheckType
  /** Absent for what is not about one locale. */
  locale?: string
  file: string
  key: string
  detail?: string
}

/** What the runtime fills in: any run without braces or spaces. */
const PLACEHOLDER = /\{([^{}\s]+)\}/g

function placeholdersOf(text: string): Map<string, number> {
  const counts = new Map<string, number>()
  for (const [, name] of text.matchAll(PLACEHOLDER)) counts.set(name!, (counts.get(name!) ?? 0) + 1)
  return counts
}

/** Japanese and the like have one form, and their translation of `a | b` lost nothing. */
function hasPluralForms(code: string): boolean {
  try {
    return new Intl.PluralRules(code).resolvedOptions().pluralCategories.length > 1
  } catch {
    return true
  }
}

function placeholderDrift(source: string, translated: string, code: string): string | null {
  const expected = placeholdersOf(source)
  const actual = placeholdersOf(translated)
  // Plural forms repeat a placeholder as often as a language has forms, so there only its presence counts.
  const exact = !source.includes('|') && !translated.includes('|')
  const short = (a: Map<string, number>, b: Map<string, number>): string[] =>
    [...a].filter(([name, count]) => (b.get(name) ?? 0) < (exact ? count : 1)).map(([name]) => name)
  const lost = short(expected, actual).map((name) => `lost {${name}}`)
  const added = short(actual, expected).map((name) => `added {${name}}`)
  const plural = source.includes('|') && !translated.includes('|') && hasPluralForms(code) ? ['lost the plural forms'] : []
  const drift = [...lost, ...added, ...plural]
  return drift.length > 0 ? drift.join(', ') : null
}

function missingAndEmpty(reference: LocaleSet, locale: LocaleSet, code: string): Finding[] {
  return reference.scopes.flatMap((scope) =>
    Object.entries(reference.leaves(scope)).flatMap(([key, value]): Finding[] => {
      const file = relativeFile(code, scope)
      const current = locale.resolve(key, scope)
      if (current === undefined) return [{ type: 'missing', locale: code, file, key, detail: String(value) }]
      if (current === '') return [{ type: 'empty', locale: code, file, key, detail: String(value) }]
      if (typeof value !== 'string' || typeof current !== 'string') return []
      const detail = placeholderDrift(value, current, code)
      return detail ? [{ type: 'placeholders', locale: code, file, key, detail }] : []
    }),
  )
}

function emptyInReference(reference: LocaleSet, code: string): Finding[] {
  return reference.scopes.flatMap((scope) =>
    Object.entries(reference.leaves(scope)).flatMap(([key, value]): Finding[] =>
      value === '' ? [{ type: 'empty', locale: code, file: relativeFile(code, scope), key }] : [],
    ),
  )
}

/** A component can render on any page, so a page's keys answer for it too. */
const isDefined = (reference: LocaleSet, ref: ScopedRef): boolean =>
  ref.page === null
    ? reference.scopes.some((scope) => reference.get(ref.key, scope) !== undefined)
    : reference.resolve(ref.key, ref.page) !== undefined

function undefinedKeys(project: Project, scan: ProjectScan): Finding[] {
  const seen = new Set<string>()
  return scan.refs.flatMap((ref): Finding[] => {
    if (ref.guard || ref.test || seen.has(ref.key) || isDefined(project.reference, ref)) return []
    seen.add(ref.key)
    return [{ type: 'undefined', file: `${relative(project.config.rootDir, ref.file)}:${ref.line}`, key: ref.key }]
  })
}

function duplicates(project: Project): Finding[] {
  return project.codes.flatMap((code) => {
    const locale = project.locale(code)
    const byValue = groupBy(
      locale.scopes
        // Own files only: the finding names a file, and a layer's text is the layer's to change.
        .flatMap((scope) => Object.entries(flattenStrings(locale.ownTree(scope))).map(([key, value]) => ({ scope, key, value })))
        .filter((item) => item.value !== ''),
      (item) => item.value,
    )
    return [...byValue].flatMap(([value, places]): Finding[] =>
      places.length < 2
        ? []
        : places.map(({ scope, key }) => ({ type: 'duplicates', locale: code, file: relativeFile(code, scope), key, detail: value })),
    )
  })
}

function selectedTypes(args: CheckArgs): Set<CheckType> {
  const only = splitList(args.only)
  const unknown = only.filter((type) => !(CHECK_TYPES as readonly string[]).includes(type))
  if (unknown.length > 0) throw usageError(`Unknown check: ${unknown.join(', ')}`, [`Accepted: ${CHECK_TYPES.join(', ')}`])
  if (only.length > 0) return new Set(only as CheckType[])
  return new Set(CHECK_TYPES.filter((type) => type !== 'duplicates' || args.duplicates))
}

const FIX_HINTS: Record<CheckType, string> = {
  missing: 'Translate what is missing: i18n-micro translate.',
  empty: 'Translate what is missing: i18n-micro translate.',
  extra: 'Remove extra keys: i18n-micro sync.',
  placeholders: 'Correct the placeholders in the listed translations.',
  undefined: 'Add the listed keys to the default locale.',
  unused: 'Remove unused keys: i18n-micro clean.',
  duplicates: 'Give each key its own text, or use one key in both places.',
}

export interface CheckReport {
  ok: boolean
  summary: Record<string, number>
  findings: Finding[]
  /** Why `unused` was not checked: nothing can be called unused while some keys are computed at runtime. */
  unusedSkipped?: string[]
}

export function runChecks(project: Project, scan: ProjectScan, types: Set<CheckType>, askedForUnused = false): CheckReport {
  const { reference, config } = project
  const doubts = usageDoubts(scan)
  const skipUnused = types.has('unused') && doubts.length > 0
  const all = [
    ...emptyInReference(reference, config.defaultLocale),
    ...project.targetCodes.flatMap((code) => missingAndEmpty(reference, project.locale(code), code)),
    ...project.targetCodes.flatMap((code) =>
      extraKeys(reference, project.locale(code)).map(({ scope, key }): Finding => ({
        type: 'extra',
        locale: code,
        file: relativeFile(code, scope),
        key,
      })),
    ),
    ...undefinedKeys(project, scan),
    ...(types.has('duplicates') ? duplicates(project) : []),
    ...(types.has('unused') && !skipUnused
      ? findUnused(project, scan).map(({ code, scope, key }): Finding => ({ type: 'unused', locale: code, file: relativeFile(code, scope), key }))
      : []),
  ]
  const findings = all.filter((finding) => types.has(finding.type))
  const summary = Object.fromEntries([...types].map((type) => [type, findings.filter((finding) => finding.type === type).length]))
  // Asked for by name, a check that could not run is not a pass.
  const ok = findings.length === 0 && !(askedForUnused && skipUnused)
  return { ok, summary, findings, ...(skipUnused ? { unusedSkipped: doubts } : {}) }
}

function print(report: CheckReport): void {
  for (const [type, items] of groupBy(report.findings, (finding) => finding.type)) {
    log.list(
      `${type} (${items.length})`,
      items.map(({ locale, file, key, detail }) => `${locale ? `${locale} ` : ''}${key} [${file}]${detail ? `: ${detail}` : ''}`),
    )
  }
  if (report.unusedSkipped) log.warn(`Unused keys not checked:\n  ${report.unusedSkipped.join('\n  ')}`)
}

export default async function run(args: CheckArgs): Promise<void> {
  const types = selectedTypes(args)
  const project = await Project.load(args)
  const report = runChecks(project, scanProject(project.config, { ignore: splitList(args.ignore) }), types, splitList(args.only).includes('unused'))

  if (args.json) log.json(report)
  else print(report)
  if (report.ok) {
    if (!args.json) log.success('All checks passed.')
    return
  }
  const counts = Object.entries(report.summary).filter(([, count]) => count > 0)
  const summary = counts.map(([type, count]) => `${count} ${type}`).join(', ') || 'unused keys could not be checked'
  throw findingsError(`Check failed: ${summary}.`, args.json ? [] : [...new Set(counts.map(([type]) => FIX_HINTS[type as CheckType]))])
}
