import { writeFileAtomic } from './fs'
import { type JsonObject, flattenStrings } from './json'

export interface StatsInput {
  locales: Array<{ code: string; global: JsonObject; pages: Record<string, JsonObject>; combined: JsonObject }>
  pageScopes: string[]
  referenceGlobalKeys: string[]
  referencePageKeys: Record<string, string[]>
  referenceCombinedKeys: string[]
  totalFiles: number
}

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/** Keys and values come from locale files: never trust them inside a report someone opens in a browser. */
const esc = (text: string): string => text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]!)

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB']

export function formatBytes(bytes: number): string {
  const unit = Math.min(BYTE_UNITS.length - 1, Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024)))
  return `${(bytes / 1024 ** unit).toFixed(1)} ${BYTE_UNITS[unit]}`
}

export interface TranslationStats {
  totalKeys: number
  translatedKeys: number
  completion: number
  averageKeyLength: number
  averageValueLength: number
  specialCharsCount: number
  emptyValues: number
  duplicateValues: string[]
  longestKeys: Array<{ key: string; length: number }>
  longestValues: Array<{ key: string; value: string; length: number }>
  formattingIssues: Array<{ key: string; issue: string }>
  valueTypes: {
    strings: number
    numbers: number
    booleans: number
    arrays: number
    objects: number
  }
  stringLengths: {
    short: number
    medium: number
    long: number
    veryLong: number
  }
  htmlTags: {
    count: number
    tags: Array<{ tag: string; count: number }>
  }
  variables: {
    count: number
    examples: Array<{ key: string; variables: string[] }>
  }
  specialChars: {
    punctuation: number
    emoji: number
    currency: number
    other: number
  }
  wordStats: {
    totalWords: number
    uniqueWords: number
    repeatedWords: Array<{ word: string; count: number }>
    averageWordLength: number
  }
  caseStats: {
    upperCase: number
    lowerCase: number
    titleCase: number
    mixedCase: number
  }
}

export interface LocaleStats {
  code: string
  global: TranslationStats
  pages: Record<string, TranslationStats>
  combined: TranslationStats
}

export interface StatsReport {
  locales: LocaleStats[]
  summary: {
    totalLocales: number
    totalFiles: number
    totalKeys: number
    averageCompletion: number
    localesByCompletion: Array<{ code: string; completion: number }>
    mostTranslatedLocale: string
    leastTranslatedLocale: string
  }
}

export interface StatsDiff {
  baseRef: string
  summary: {
    averageCompletionDelta: number
    totalKeysDelta: number
  }
  locales: Array<{
    code: string
    completionDelta: number
    translatedKeysDelta: number
    totalKeysDelta: number
  }>
}

function analyzeTranslationStats(translations: Record<string, unknown>, referenceKeys: string[]): TranslationStats {
  const flatTranslations = flattenStrings(translations as JsonObject)
  const keys = Object.keys(flatTranslations)
  const values = Object.values(flatTranslations)
  const translatedKeys = keys.filter((key) => flatTranslations[key] !== '')

  const valueTypes = {
    strings: values.length,
    numbers: 0,
    booleans: 0,
    arrays: 0,
    objects: 0,
  }

  const stringLengths = {
    short: 0,
    medium: 0,
    long: 0,
    veryLong: 0,
  }
  values.forEach((value) => {
    const length = value.length
    if (length <= 10) stringLengths.short++
    else if (length <= 50) stringLengths.medium++
    else if (length <= 100) stringLengths.long++
    else stringLengths.veryLong++
  })

  const htmlTags = {
    count: 0,
    tags: [] as Array<{ tag: string; count: number }>,
  }
  const tagRegex = /<([a-z][a-z0-9]*)\b[^>]*>/gi
  const tagCount = new Map<string, number>()
  values.forEach((value) => {
    const matches = value.match(tagRegex)
    if (matches) {
      htmlTags.count += matches.length
      matches.forEach((tag) => {
        const tagName = tag.match(/<([a-z][a-z0-9]*)/i)?.[1]?.toLowerCase()
        if (tagName) {
          tagCount.set(tagName, (tagCount.get(tagName) || 0) + 1)
        }
      })
    }
  })
  htmlTags.tags = Array.from(tagCount.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)

  const variables = {
    count: 0,
    examples: [] as Array<{ key: string; variables: string[] }>,
  }
  const varRegex = /\{([^}]+)\}/g
  values.forEach((value, index) => {
    const matches = Array.from(value.matchAll(varRegex))
    if (matches.length > 0) {
      variables.count += matches.length
      variables.examples.push({
        key: keys[index],
        variables: matches.map((m) => m[1]),
      })
    }
  })

  const specialChars = {
    punctuation: 0,
    emoji: 0,
    currency: 0,
    other: 0,
  }
  const punctuationRegex = /[.,!?;:]/g
  const emojiRegex = /\p{Emoji}/gu
  const currencyRegex = /[$€£¥₽₴₸₺₼₾₿]/g
  values.forEach((value) => {
    specialChars.punctuation += (value.match(punctuationRegex) || []).length
    specialChars.emoji += (value.match(emojiRegex) || []).length
    specialChars.currency += (value.match(currencyRegex) || []).length
    specialChars.other += (value.match(/[^a-z0-9\s.,!?;:$€£¥₽₴₸₺₼₾₿]/gi) || []).length
  })

  const wordStats = {
    totalWords: 0,
    uniqueWords: 0,
    repeatedWords: [] as Array<{ word: string; count: number }>,
    averageWordLength: 0,
  }
  const wordCount = new Map<string, number>()
  let totalWordLength = 0
  values.forEach((value) => {
    const words = value.toLowerCase().match(/\b\w+\b/g) || []
    wordStats.totalWords += words.length
    words.forEach((word) => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
      totalWordLength += word.length
    })
  })
  wordStats.uniqueWords = wordCount.size
  wordStats.repeatedWords = Array.from(wordCount.entries())
    .filter(([_, count]) => count > 1)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
  wordStats.averageWordLength = wordStats.totalWords > 0 ? totalWordLength / wordStats.totalWords : 0

  const caseStats = {
    upperCase: 0,
    lowerCase: 0,
    titleCase: 0,
    mixedCase: 0,
  }
  values.forEach((value) => {
    if (value === value.toUpperCase()) caseStats.upperCase++
    else if (value === value.toLowerCase()) caseStats.lowerCase++
    else if (value === value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()) caseStats.titleCase++
    else caseStats.mixedCase++
  })

  const keyLengths = keys.map((key) => key.length)
  const valueLengths = values.map((value) => String(value).length)
  const averageKeyLength = keys.length > 0 ? keyLengths.reduce((a, b) => a + b, 0) / keys.length : 0
  const averageValueLength = values.length > 0 ? valueLengths.reduce((a, b) => a + b, 0) / values.length : 0

  const specialCharsRegex = /[^a-z0-9\s.,!?-]/gi
  const specialCharsCount = values.reduce((count, value) => {
    const matches = value.match(specialCharsRegex)
    return count + (matches ? matches.length : 0)
  }, 0)

  const emptyValues = values.filter((value) => value === '').length

  const valueMap = new Map<string, string[]>()
  values.forEach((value, index) => {
    const key = keys[index]
    if (!valueMap.has(value)) {
      valueMap.set(value, [])
    }
    valueMap.get(value)?.push(key)
  })
  const duplicateValues = Array.from(valueMap.entries())
    .filter(([_, entryKeys]) => entryKeys.length > 1)
    .map(([value, entryKeys]) => `${entryKeys.join(', ')}: "${value}"`)

  const longestKeys = keys
    .map((key) => ({ key, length: key.length }))
    .sort((a, b) => b.length - a.length)
    .slice(0, 5)

  const longestValues = values
    .map((value, index) => ({ key: keys[index], value, length: value.length }))
    .sort((a, b) => b.length - a.length)
    .slice(0, 5)

  const formattingIssues: Array<{ key: string; issue: string }> = []
  values.forEach((value, index) => {
    const key = keys[index]
    if (value.includes('  ')) {
      formattingIssues.push({ key, issue: 'Contains multiple spaces' })
    }
    if (value.startsWith(' ') || value.endsWith(' ')) {
      formattingIssues.push({ key, issue: 'Contains leading/trailing spaces' })
    }
    if (value.includes('\n')) {
      formattingIssues.push({ key, issue: 'Contains newlines' })
    }
  })

  return {
    totalKeys: referenceKeys.length,
    translatedKeys: translatedKeys.length,
    completion: referenceKeys.length > 0 ? (translatedKeys.length / referenceKeys.length) * 100 : 0,
    averageKeyLength,
    averageValueLength,
    specialCharsCount,
    emptyValues,
    duplicateValues,
    longestKeys,
    longestValues,
    formattingIssues,
    valueTypes,
    stringLengths,
    htmlTags,
    variables,
    specialChars,
    wordStats,
    caseStats,
  }
}

export function buildStatsReport(input: StatsInput): StatsReport {
  const report: StatsReport = {
    locales: [],
    summary: {
      totalLocales: input.locales.length,
      totalFiles: input.totalFiles,
      totalKeys: 0,
      averageCompletion: 0,
      localesByCompletion: [],
      mostTranslatedLocale: '',
      leastTranslatedLocale: '',
    },
  }

  for (const locale of input.locales) {
    const localeStats: LocaleStats = {
      code: locale.code,
      global: analyzeTranslationStats(locale.global, input.referenceGlobalKeys),
      pages: {},
      combined: analyzeTranslationStats(locale.combined, input.referenceCombinedKeys),
    }

    for (const pageScope of input.pageScopes) {
      localeStats.pages[pageScope] = analyzeTranslationStats(locale.pages[pageScope] ?? {}, input.referencePageKeys[pageScope] ?? [])
    }

    report.locales.push(localeStats)
  }

  report.summary.totalKeys = report.locales.reduce((sum, locale) => sum + locale.combined.totalKeys, 0)
  report.summary.averageCompletion = report.locales.reduce((sum, locale) => sum + locale.combined.completion, 0) / Math.max(1, report.locales.length)
  report.summary.localesByCompletion = report.locales
    .map((locale) => ({ code: locale.code, completion: locale.combined.completion }))
    .sort((a, b) => b.completion - a.completion)
  report.summary.mostTranslatedLocale = report.summary.localesByCompletion[0]?.code || ''
  report.summary.leastTranslatedLocale = report.summary.localesByCompletion[report.summary.localesByCompletion.length - 1]?.code || ''

  return report
}

export function buildStatsDiff(current: StatsReport, previous: StatsReport, baseRef: string): StatsDiff {
  const previousByCode = new Map(previous.locales.map((locale) => [locale.code, locale]))
  const locales = current.locales.map((locale) => {
    const prev = previousByCode.get(locale.code)
    const previousCombined = prev?.combined
    return {
      code: locale.code,
      completionDelta: locale.combined.completion - (previousCombined?.completion ?? 0),
      translatedKeysDelta: locale.combined.translatedKeys - (previousCombined?.translatedKeys ?? 0),
      totalKeysDelta: locale.combined.totalKeys - (previousCombined?.totalKeys ?? 0),
    }
  })

  return {
    baseRef,
    summary: {
      averageCompletionDelta: current.summary.averageCompletion - previous.summary.averageCompletion,
      totalKeysDelta: current.summary.totalKeys - previous.summary.totalKeys,
    },
    locales,
  }
}

export function generateStatsHtmlReport(report: StatsReport, outputPath: string): void {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Translation Statistics Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .locale { margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .stat-card { background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .progress-bar { background: #eee; height: 20px; border-radius: 10px; overflow: hidden; }
        .progress { background: #4CAF50; height: 100%; transition: width 0.3s; }
        .warning { color: #f44336; }
        .success { color: #4CAF50; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Translation Statistics Report</h1>
        
        <div class="summary">
            <h2>Summary</h2>
            <div class="stats">
                <div class="stat-card">
                    <h3>Overall Statistics</h3>
                    <p>Total Locales: ${report.summary.totalLocales}</p>
                    <p>Total Files: ${report.summary.totalFiles}</p>
                    <p>Total Keys: ${report.summary.totalKeys}</p>
                    <p>Average Completion: ${report.summary.averageCompletion.toFixed(2)}%</p>
                </div>
                <div class="stat-card">
                    <h3>Completion by Locale</h3>
                    ${report.summary.localesByCompletion
                      .map(
                        (locale) => `
                        <div>
                            <p>${esc(locale.code)}: ${locale.completion.toFixed(2)}%</p>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${locale.completion}%"></div>
                            </div>
                        </div>
                    `,
                      )
                      .join('')}
                </div>
            </div>
        </div>

        ${report.locales
          .map(
            (locale) => `
            <div class="locale">
                <h2>Locale: ${esc(locale.code)}</h2>
                
                <h3>Global Translations</h3>
                <div class="stats">
                    <div class="stat-card">
                        <h4>Basic Statistics</h4>
                        <p>Total Keys: ${locale.global.totalKeys}</p>
                        <p>Translated Keys: ${locale.global.translatedKeys}</p>
                        <p>Completion: ${locale.global.completion.toFixed(2)}%</p>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${locale.global.completion}%"></div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <h4>Length Analysis</h4>
                        <p>Average Key Length: ${locale.global.averageKeyLength.toFixed(2)}</p>
                        <p>Average Value Length: ${locale.global.averageValueLength.toFixed(2)}</p>
                        <p>Special Characters: ${locale.global.specialCharsCount}</p>
                    </div>
                </div>

                ${
                  locale.global.duplicateValues.length > 0
                    ? `
                    <div class="stat-card warning">
                        <h4>Duplicate Values</h4>
                        <ul>
                            ${locale.global.duplicateValues.map((dup) => `<li>${esc(dup)}</li>`).join('')}
                        </ul>
                    </div>
                `
                    : ''
                }

                ${
                  locale.global.formattingIssues.length > 0
                    ? `
                    <div class="stat-card warning">
                        <h4>Formatting Issues</h4>
                        <table>
                            <tr>
                                <th>Key</th>
                                <th>Issue</th>
                            </tr>
                            ${locale.global.formattingIssues
                              .map(
                                (issue) => `
                                <tr>
                                    <td>${esc(issue.key)}</td>
                                    <td>${esc(issue.issue)}</td>
                                </tr>
                            `,
                              )
                              .join('')}
                        </table>
                    </div>
                `
                    : ''
                }

                <h3>Page Translations</h3>
                ${Object.entries(locale.pages)
                  .map(
                    ([page, stats]) => `
                    <div class="stat-card">
                        <h4>${esc(page)}</h4>
                        <p>Total Keys: ${stats.totalKeys}</p>
                        <p>Translated Keys: ${stats.translatedKeys}</p>
                        <p>Completion: ${stats.completion.toFixed(2)}%</p>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${stats.completion}%"></div>
                        </div>
                    </div>
                `,
                  )
                  .join('')}
            </div>
        `,
          )
          .join('')}
    </div>
</body>
</html>
  `

  writeFileAtomic(outputPath, html)
}
