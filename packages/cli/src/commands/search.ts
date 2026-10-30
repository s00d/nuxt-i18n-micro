import { relative } from 'node:path'
import { validationError } from '../errors'
import { splitList } from '../fs'
import { flattenStrings } from '../json'
import { log } from '../log'
import { GLOBAL_SCOPE, Project } from '../project'
import { type ProjectScan, scanProject, usageIndex } from '../source'

export interface SearchArgs {
  cwd?: string
  translationDir?: string
  query?: string
  caseSensitive?: boolean
  onlyUnused?: boolean
  scope: 'global' | 'pages' | 'all'
  limit?: number
  ignore?: string
  json?: boolean
}

export interface SearchMatch {
  scope: string
  key: string
  translations: Record<string, string | null>
  missingLocales: string[]
  isUsed: boolean
  usages: string[]
}

function scopesOf(project: Project, wanted: SearchArgs['scope']): string[] {
  const all = [...new Set(project.codes.flatMap((code) => project.locale(code).scopes))]
  if (wanted === 'global') return [GLOBAL_SCOPE]
  return wanted === 'pages' ? all.filter((scope) => scope !== GLOBAL_SCOPE) : all
}

function matchesOf(project: Project, scan: ProjectScan, args: SearchArgs): SearchMatch[] {
  const isUsed = usageIndex(scan)
  const fold = (text: string): string => (args.caseSensitive ? text : text.toLowerCase())
  const query = fold((args.query ?? '').trim())
  const usagesOf = (key: string): string[] =>
    scan.refs.filter((ref) => ref.key === key).map((ref) => `${relative(project.config.rootDir, ref.file)}:${ref.line}`)

  return scopesOf(project, args.scope).flatMap((scope) => {
    const byLocale = project.codes.map((code) => [code, flattenStrings(project.locale(code).tree(scope))] as const)
    const keys = [...new Set(byLocale.flatMap(([, strings]) => Object.keys(strings)))]
    return keys.flatMap((key): SearchMatch[] => {
      const values = byLocale.map(([, strings]) => strings[key] ?? '')
      const used = isUsed(key)
      if (args.onlyUnused && used) return []
      if (query && ![key, ...values].some((text) => fold(text).includes(query))) return []
      return [
        {
          scope: scope === GLOBAL_SCOPE ? 'global' : `pages/${scope}`,
          key,
          translations: Object.fromEntries(byLocale.map(([code, strings]) => [code, strings[key] ?? null])),
          missingLocales: byLocale.filter(([, strings]) => strings[key] === undefined).map(([code]) => code),
          isUsed: used,
          usages: usagesOf(key),
        },
      ]
    })
  })
}

function printMatch(match: SearchMatch): void {
  log.section(`${match.scope}: ${match.key}`)
  log.rows(Object.entries(match.translations).map(([code, value]) => [code, value ?? '[missing]']))
  log.info(match.isUsed ? `Used in: ${match.usages.join(', ') || 'a string or a computed key'}` : 'Not used')
}

export default async function run(args: SearchArgs): Promise<void> {
  const query = (args.query ?? '').trim()
  if (!query && !args.onlyUnused) {
    throw validationError('Search query cannot be empty unless --onlyUnused is set', ['Example: i18n-micro search "welcome"'])
  }

  const project = await Project.load(args)
  const scan = scanProject(project.config, { ignore: splitList(args.ignore) })
  const found = matchesOf(project, scan, args)
  const matches = args.limit ? found.slice(0, args.limit) : found

  if (args.json) {
    log.json({ query, totalMatches: found.length, matches })
    return
  }
  if (matches.length === 0) {
    log.info(query ? `No matches found for "${query}"` : 'No matches found')
    return
  }
  for (const match of matches) printMatch(match)
}
