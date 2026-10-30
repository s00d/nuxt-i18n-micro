import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import { readJsonIfExists, walkFiles } from './fs'
import { type JsonObject, flattenStrings } from './json'

const toPosix = (value: string): string => value.split(path.sep).join('/')

export interface SearchOccurrence {
  file: string
  line: number
  content: string
}

export interface TranslationOccurrence extends SearchOccurrence {
  locale: string
  scope: string
  value: string
}

export interface SearchMatch {
  scope: string
  key: string
  fullKey: string
  translations: Record<string, string | null>
  missingLocales: string[]
  translationLocations: TranslationOccurrence[]
  usages: SearchOccurrence[]
  isUsed: boolean
}

export interface SearchResult {
  query: string
  totalMatches: number
  matches: SearchMatch[]
  hardcoded: SearchOccurrence[]
  scannedSourceFiles: number
}

export interface SearchParams {
  cwd: string
  roots: string[]
  query: string
  locales: Array<{ code: string }>
  translationDirs: string[]
  caseSensitive?: boolean
  onlyUnused?: boolean
  preferUnused?: boolean
  hardcodedOnly?: boolean
  onlyVue?: boolean
  scope?: 'global' | 'pages' | 'all'
  limit?: number
}

interface FlatTranslationEntry {
  scope: string
  key: string
  value: string
  filePath: string
  line: number
}

interface InternalMatch {
  scope: string
  key: string
  fullKey: string
  translations: Record<string, string | null>
  translationLocations: TranslationOccurrence[]
}

interface RankedMatch {
  score: number
  match: SearchMatch
}

const SOURCE_EXTENSIONS = /\.(vue|js|ts|tsx|jsx|mjs|cjs|md)$/
const I18N_CALL_REGEX = /(?:\$t|\$ts|\$tc|\$has|\bt|\bts|\btc)\s*\(\s*['"`].*?['"`]\s*\)/
const KEYPATH_VALUE_REGEX = /keypath\s*=\s*['"`][^'"`]*['"`]/
const FILE_BATCH_SIZE = 500
const NON_TEXT_ATTRIBUTES = new Set([
  'class',
  'id',
  'style',
  'src',
  'href',
  'to',
  'from',
  'key',
  'ref',
  'slot',
  'name',
  'type',
  'for',
  'accept',
  'media',
  'value',
])

function normalizeValue(input: string, caseSensitive: boolean): string {
  return caseSensitive ? input : input.toLowerCase()
}

function matchesQuery(haystack: string, query: string, caseSensitive: boolean): boolean {
  return normalizeValue(haystack, caseSensitive).includes(normalizeValue(query, caseSensitive))
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeTextValue(input: string): string {
  return input.replace(/\s+/g, ' ').trim().toLowerCase()
}

function shouldTrackCandidateText(text: string): boolean {
  const normalized = text.trim()
  if (normalized.length < 3) {
    return false
  }
  if (!/\p{L}/u.test(normalized)) {
    return false
  }
  if (/^[\w.-]+$/.test(normalized)) {
    return false
  }
  if (/\{\{|\}\}|\$t\(|\$tc\(|\$tm\(|\$te\(|\bt\(/.test(normalized)) {
    return false
  }
  if (/[{}$]|=>|===|!==/.test(normalized)) {
    return false
  }
  if (normalized.startsWith('#')) {
    return false
  }
  if (normalized.includes('/') && !normalized.includes(' ')) {
    return false
  }
  if (/^v-[\w-]+/.test(normalized)) {
    return false
  }
  if (normalized.includes('://')) {
    return false
  }
  return true
}

function collectTextCandidatesFromLine(line: string): string[] {
  const candidates: string[] = []
  const quotedRegex = /(['"`])((?:\\.|(?!\1).)+)\1/g
  let quotedMatch: RegExpExecArray | null
  while ((quotedMatch = quotedRegex.exec(line)) !== null) {
    const left = line.slice(0, quotedMatch.index)
    const attrMatch = /([:@]?[\w-]+)\s*=\s*$/.exec(left)
    const attrName = attrMatch?.[1] || ''
    if (attrName.startsWith(':') || attrName.startsWith('@') || attrName.startsWith('v-')) {
      continue
    }
    if (attrName && NON_TEXT_ATTRIBUTES.has(attrName)) {
      continue
    }
    const value = (quotedMatch[2] || '').trim()
    if (value) {
      candidates.push(value)
    }
  }

  let searchFrom = 0
  while (true) {
    const start = line.indexOf('>', searchFrom)
    if (start === -1) {
      break
    }
    const end = line.indexOf('<', start + 1)
    if (end === -1) {
      break
    }
    const value = line.slice(start + 1, end).trim()
    if (value) {
      candidates.push(value)
    }
    searchFrom = end + 1
  }

  return candidates
}
function isQueryInsideLocalizedExpression(line: string, query: string, caseSensitive: boolean): boolean {
  const matches = [...line.matchAll(new RegExp(I18N_CALL_REGEX.source, 'g')), ...line.matchAll(new RegExp(KEYPATH_VALUE_REGEX.source, 'g'))]
  return matches.some((match) => {
    const fragment = match[0] || ''
    return matchesQuery(fragment, query, caseSensitive)
  })
}

function buildUsageRegex(key: string): RegExp {
  const escaped = escapeRegExp(key)
  return new RegExp(`(?:\\$t|\\$ts|\\$tc|\\$has|\\bt|\\bts|\\btc|\\bhas)\\s*\\(\\s*['"\`]${escaped}['"\`]`)
}

function scoreTextMatch(value: string, query: string, caseSensitive: boolean, weights: { exact: number; prefix: number; contains: number }): number {
  const normalizedValue = normalizeValue(value, caseSensitive)
  const normalizedQuery = normalizeValue(query, caseSensitive)
  if (normalizedValue === normalizedQuery) {
    return weights.exact
  }
  if (normalizedValue.startsWith(normalizedQuery)) {
    return weights.prefix
  }
  if (normalizedValue.includes(normalizedQuery)) {
    return weights.contains
  }
  return 0
}

function calculateMatchScore(match: SearchMatch, query: string, caseSensitive: boolean): number {
  let score = 0
  let bestValueScore = 0

  score += scoreTextMatch(match.fullKey, query, caseSensitive, {
    exact: 120,
    prefix: 90,
    contains: 70,
  })
  score += scoreTextMatch(match.key, query, caseSensitive, {
    exact: 110,
    prefix: 85,
    contains: 65,
  })

  for (const value of Object.values(match.translations)) {
    if (typeof value !== 'string') {
      continue
    }
    bestValueScore = Math.max(
      bestValueScore,
      scoreTextMatch(value, query, caseSensitive, {
        exact: 75,
        prefix: 55,
        contains: 35,
      }),
    )
  }
  score += bestValueScore

  if (match.isUsed) {
    score += 10
  }

  return score
}

function estimateJsonLine(content: string, keyPath: string): number {
  const leaf = keyPath.split('.').pop() || keyPath
  const pattern = `"${leaf}"`
  const index = content.indexOf(pattern)
  if (index < 0) {
    return 1
  }
  let line = 1
  for (let i = 0; i < index; i++) {
    if (content[i] === '\n') {
      line++
    }
  }
  return line
}

function collectSourceFiles(layerRootDirs: string[], onlyVue: boolean, translationDirs: string[]): string[] {
  const inTranslations = (file: string): boolean => translationDirs.some((dir) => file.startsWith(`${dir}${path.sep}`))
  const built = `${path.sep}dist${path.sep}`
  const accept = (file: string): boolean =>
    (onlyVue ? file.endsWith('.vue') : SOURCE_EXTENSIONS.test(file)) && !inTranslations(file) && !file.includes(built)
  return [...new Set(layerRootDirs.flatMap((root) => walkFiles(root, accept)))]
}

function collectPageFiles(translationDir: string, localeCode: string): string[] {
  return walkFiles(path.join(translationDir, 'pages'), (file) => file.endsWith(`${path.sep}${localeCode}.json`))
}

async function readJsonFileSafe(filePath: string): Promise<JsonObject> {
  return readJsonIfExists(filePath)
}

async function collectLocaleEntries(translationDirs: string[], localeCode: string): Promise<FlatTranslationEntry[]> {
  const entries: FlatTranslationEntry[] = []

  for (const translationDir of translationDirs) {
    const globalPath = path.join(translationDir, `${localeCode}.json`)
    if (fs.existsSync(globalPath)) {
      const globalContent = fs.readFileSync(globalPath, 'utf8')
      const globalFlat = flattenStrings(readJsonIfExists(globalPath))
      for (const [key, value] of Object.entries(globalFlat)) {
        entries.push({
          scope: 'global',
          key,
          value,
          filePath: globalPath,
          line: estimateJsonLine(globalContent, key),
        })
      }
    }

    const pageFiles = collectPageFiles(translationDir, localeCode)
    for (const pageFile of pageFiles) {
      // oxlint-disable-next-line no-await-in-loop -- sequential, keeps file handles bounded
      const pageJson = await readJsonFileSafe(pageFile)
      const pageFlat = flattenStrings(pageJson as JsonObject)
      const pagesRoot = path.join(translationDir, 'pages')
      const pageScope = toPosix(path.relative(pagesRoot, path.dirname(pageFile)))
      // oxlint-disable-next-line no-await-in-loop -- sequential, keeps file handles bounded
      const pageContent = await fsPromises.readFile(pageFile, 'utf8')
      for (const [key, value] of Object.entries(pageFlat)) {
        entries.push({
          scope: pageScope,
          key,
          value,
          filePath: pageFile,
          line: estimateJsonLine(pageContent, key),
        })
      }
    }
  }

  return entries
}

async function processSourceFile(
  filePath: string,
  params: {
    query: string
    queryLower: string
    hasQuery: boolean
    isTextSearch: boolean
    caseSensitive: boolean
    hardcodedOnly: boolean
    translationValueSet: Set<string>
    knownKeySet: Set<string>
    keyedMatchers: Array<{ id: string; key: string; usageRegex: RegExp }>
  },
): Promise<{ usages: Record<string, SearchOccurrence[]>; hardcoded: SearchOccurrence[] }> {
  const usages: Record<string, SearchOccurrence[]> = {}
  const hardcoded: SearchOccurrence[] = []

  let content = ''
  try {
    content = await fsPromises.readFile(filePath, 'utf8')
  } catch {
    return { usages, hardcoded }
  }

  if (params.hardcodedOnly) {
    const likelyHasText = /['"`>][^<\n]{2,}/.test(content)
    if (!likelyHasText) {
      return { usages, hardcoded }
    }

    const lines = content.split('\n')
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index] || ''
      const lineNumber = index + 1
      const trimmed = line.trim()
      if (!trimmed) {
        continue
      }

      const candidates = collectTextCandidatesFromLine(line)
      let foundOnLine = false
      for (const candidate of candidates) {
        if (!shouldTrackCandidateText(candidate)) {
          continue
        }
        if (params.knownKeySet.has(candidate.trim())) {
          continue
        }
        if (params.hasQuery && !matchesQuery(candidate, params.query, params.caseSensitive)) {
          continue
        }
        const normalized = normalizeTextValue(candidate)
        if (params.translationValueSet.has(normalized)) {
          continue
        }
        foundOnLine = true
        break
      }

      if (foundOnLine) {
        hardcoded.push({
          file: filePath,
          line: lineNumber,
          content: trimmed,
        })
      }
    }

    return { usages, hardcoded }
  }

  const containsQuery = params.isTextSearch
    ? params.caseSensitive
      ? content.includes(params.query)
      : content.toLowerCase().includes(params.queryLower)
    : false

  const matchedInFile = params.keyedMatchers.filter(({ key }) => content.includes(key))
  if (!containsQuery && matchedInFile.length === 0) {
    return { usages, hardcoded }
  }

  const lines = content.split('\n')
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] || ''
    const lineNumber = index + 1
    const trimmed = line.trim()
    if (!trimmed) {
      continue
    }

    for (const matcher of matchedInFile) {
      if (matcher.usageRegex.test(line) || line.includes(`keypath="${matcher.key}"`) || line.includes(`keypath='${matcher.key}'`)) {
        usages[matcher.id] ||= []
        usages[matcher.id].push({
          file: filePath,
          line: lineNumber,
          content: trimmed,
        })
      }
    }

    if (containsQuery) {
      const lineMatched = params.caseSensitive ? line.includes(params.query) : line.toLowerCase().includes(params.queryLower)
      if (lineMatched && !isQueryInsideLocalizedExpression(line, params.query, params.caseSensitive)) {
        hardcoded.push({
          file: filePath,
          line: lineNumber,
          content: trimmed,
        })
      }
    }
  }

  return { usages, hardcoded }
}

export async function searchProjectTranslations(params: SearchParams): Promise<SearchResult> {
  const scope = params.scope ?? 'all'
  const localeCodes = params.locales.map((locale) => locale.code)
  const translationDirs = Array.from(new Set(params.translationDirs))
  const caseSensitive = Boolean(params.caseSensitive)
  const preferUnused = Boolean(params.preferUnused)
  const hardcodedOnly = Boolean(params.hardcodedOnly)
  const onlyVue = Boolean(params.onlyVue)
  const hasQuery = params.query.trim().length > 0

  const localeEntries = new Map<string, FlatTranslationEntry[]>()
  await Promise.all(
    localeCodes.map(async (localeCode) => {
      localeEntries.set(localeCode, await collectLocaleEntries(translationDirs, localeCode))
    }),
  )

  const mergedMatches = new Map<string, InternalMatch>()
  for (const localeCode of localeCodes) {
    const entries = localeEntries.get(localeCode) || []
    for (const entry of entries) {
      const fullKey = entry.scope === 'global' ? entry.key : `pages.${entry.scope}.${entry.key}`
      const matchId = `${entry.scope}:${entry.key}`
      const existing = mergedMatches.get(matchId) || {
        scope: entry.scope,
        key: entry.key,
        fullKey,
        translations: Object.fromEntries(localeCodes.map((code) => [code, null])),
        translationLocations: [],
      }
      existing.translations[localeCode] = entry.value
      existing.translationLocations.push({
        locale: localeCode,
        scope: entry.scope,
        file: entry.filePath,
        line: entry.line,
        content: entry.key,
        value: entry.value,
      })
      mergedMatches.set(matchId, existing)
    }
  }

  const translationValueSet = new Set<string>()
  for (const match of mergedMatches.values()) {
    for (const value of Object.values(match.translations)) {
      if (typeof value === 'string' && value.trim()) {
        translationValueSet.add(normalizeTextValue(value))
      }
    }
  }
  const knownKeySet = new Set<string>(Array.from(mergedMatches.values()).map((match) => match.key))

  if (!hardcodedOnly) {
    for (const [id, match] of Array.from(mergedMatches.entries())) {
      const queryMatchesKey = matchesQuery(match.key, params.query, caseSensitive) || matchesQuery(match.fullKey, params.query, caseSensitive)
      const queryMatchesValue = Object.values(match.translations).some(
        (value) => typeof value === 'string' && matchesQuery(value, params.query, caseSensitive),
      )
      const inScope = scope === 'all' || (scope === 'global' && match.scope === 'global') || (scope === 'pages' && match.scope !== 'global')
      if ((!queryMatchesKey && !queryMatchesValue) || !inScope) {
        mergedMatches.delete(id)
      }
    }
  } else {
    mergedMatches.clear()
  }

  const keyedMatchers = Array.from(mergedMatches.entries()).map(([id, match]) => ({
    id,
    key: match.key,
    usageRegex: buildUsageRegex(match.key),
  }))

  const sourceFiles = collectSourceFiles(params.roots, onlyVue, translationDirs)
  const hardcodedAll: SearchOccurrence[] = []
  const usagesByMatch = new Map<string, SearchOccurrence[]>()
  const queryLower = params.query.toLowerCase()
  const isTextSearch = hasQuery && !params.query.includes('.')

  for (let offset = 0; offset < sourceFiles.length; offset += FILE_BATCH_SIZE) {
    const batch = sourceFiles.slice(offset, offset + FILE_BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map((filePath) =>
        processSourceFile(filePath, {
          query: params.query,
          queryLower,
          hasQuery,
          isTextSearch,
          caseSensitive,
          hardcodedOnly,
          translationValueSet,
          knownKeySet,
          keyedMatchers,
        }),
      ),
    )

    for (const partial of batchResults) {
      for (const [id, occurrences] of Object.entries(partial.usages)) {
        usagesByMatch.set(id, [...(usagesByMatch.get(id) || []), ...occurrences])
      }
      hardcodedAll.push(...partial.hardcoded)
    }
  }

  let matches = Array.from(mergedMatches.entries()).map(([id, match]) => {
    const usages = usagesByMatch.get(id) || []
    const missingLocales = localeCodes.filter((locale) => !match.translations[locale])
    return {
      ...match,
      translationLocations: match.translationLocations.sort((a, b) => a.file.localeCompare(b.file)),
      usages: usages.sort((a, b) => `${a.file}:${a.line}`.localeCompare(`${b.file}:${b.line}`)),
      missingLocales,
      isUsed: usages.length > 0,
    } satisfies SearchMatch
  })

  if (params.onlyUnused) {
    matches = matches.filter((match) => !match.isUsed)
  }

  const ranked: RankedMatch[] = matches.map((match) => ({
    score: calculateMatchScore(match, params.query, caseSensitive),
    match,
  }))
  ranked.sort((a, b) => {
    if (preferUnused && a.match.isUsed !== b.match.isUsed) {
      return a.match.isUsed ? 1 : -1
    }
    if (b.score !== a.score) {
      return b.score - a.score
    }
    if (a.match.isUsed !== b.match.isUsed) {
      return a.match.isUsed ? -1 : 1
    }
    return a.match.fullKey.localeCompare(b.match.fullKey)
  })
  matches = ranked.map((item) => item.match)

  const totalMatches = matches.length
  if (typeof params.limit === 'number' && params.limit > 0) {
    matches = matches.slice(0, params.limit)
  }

  return {
    query: params.query,
    totalMatches,
    matches,
    hardcoded: hardcodedAll.sort((a, b) => `${a.file}:${a.line}`.localeCompare(`${b.file}:${b.line}`)),
    scannedSourceFiles: sourceFiles.length,
  }
}
