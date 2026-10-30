import { dirname } from 'node:path'
import { validationError } from '../errors'
import { log } from '../log'
import { Project } from '../project'
import { type SearchMatch, searchProjectTranslations } from '../search'

export interface SearchArgs {
  cwd?: string
  translationDir?: string
  query?: string
  caseSensitive?: boolean
  onlyUnused?: boolean
  preferUnused?: boolean
  scope: 'global' | 'pages' | 'all'
  limit?: number
  hardcodedOnly?: boolean
  onlyVue?: boolean
  json?: boolean
}

function printMatch(match: SearchMatch, index: number, codes: string[]): void {
  log.section(`Match #${index + 1}`)
  log.rows([
    ['Scope', match.scope],
    ['Key', match.key],
    ['Used in source code', match.isUsed ? 'yes' : 'no'],
    ['Missing locales', match.missingLocales.length],
  ])
  log.list(
    'Translations',
    codes.map((code) => `${code}: ${match.translations[code] ? `"${match.translations[code]}"` : '[missing]'}`),
  )
  log.list(
    'Defined in',
    match.translationLocations.map((location) => `[${location.locale}] ${location.file}:${location.line}`),
  )
  log.list(
    'Used in',
    match.usages.map((usage) => `${usage.file}:${usage.line} -> ${usage.content}`),
  )
}

export default async function run(args: SearchArgs): Promise<void> {
  const query = (args.query ?? '').trim()
  if (!query && !args.hardcodedOnly) {
    throw validationError('Search query cannot be empty unless --hardcodedOnly is enabled', [
      'Example: i18n-micro search "welcome"',
      'Or scan hardcoded text: i18n-micro search --hardcodedOnly',
    ])
  }

  const project = await Project.load(args)
  const { rootDir, srcDir, locales, translationDirs } = project.config
  const result = await searchProjectTranslations({
    cwd: rootDir,
    roots: [...new Set([srcDir, rootDir, ...translationDirs.map((dir) => dirname(dir))])],
    query,
    locales,
    translationDirs,
    caseSensitive: Boolean(args.caseSensitive),
    onlyUnused: Boolean(args.onlyUnused),
    preferUnused: Boolean(args.preferUnused),
    hardcodedOnly: Boolean(args.hardcodedOnly),
    onlyVue: Boolean(args.onlyVue),
    scope: args.scope,
    limit: args.limit,
  })

  if (args.json) {
    log.json(result)
    return
  }
  if (result.matches.length === 0 && result.hardcoded.length === 0) {
    log.info(query ? `No matches found for "${query}"` : 'No matches found')
    return
  }

  for (const [index, match] of result.matches.entries()) printMatch(match, index, project.codes)
  if (result.hardcoded.length > 0)
    log.list(
      'Hardcoded text',
      result.hardcoded.map((item) => `${item.file}:${item.line} -> ${item.content}`),
    )
}
