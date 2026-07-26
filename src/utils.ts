import type { DefineI18nRouteConfig } from '@i18n-micro/types'
import { parse as parseSFC } from '@vue/compiler-sfc'

function extractScriptContent(content: string): string | null {
  const { descriptor } = parseSFC(content, { pad: false })
  const parts: string[] = []
  if (descriptor.script?.content) parts.push(descriptor.script.content)
  if (descriptor.scriptSetup?.content) parts.push(descriptor.scriptSetup.content)
  return parts.length > 0 ? parts.join('\n') : null
}

function removeTypeScriptTypes(scriptContent: string): string {
  return scriptContent.replace(/\((\w+):[^)]*\)/g, '($1)')
}

const CALL_NAME = '$defineI18nRoute'

/** Keywords after which a `/` opens a regex literal rather than a division. */
const REGEX_AFTER_KEYWORD = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'do', 'else', 'case', 'yield', 'await'])

function isIdentifierChar(char: string): boolean {
  return char !== '' && (char === '$' || char === '_' || (char >= '0' && char <= '9') || (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z'))
}

function isWhitespace(char: string): boolean {
  return char === ' ' || char === '\n' || char === '\t' || char === '\r'
}

/** Only these can open a string, template, comment or regex — everything else is code. */
function canOpenNonCode(char: string): boolean {
  return char === "'" || char === '"' || char === '`' || char === '/'
}

/**
 * Whether a `/` at this point starts a regex. After a value — identifier, literal,
 * `)` or `]` — it is division; after an operator or a keyword like `return` it is
 * a regex. `prevWord` is the identifier the previous char belongs to, so that
 * `return /x/` is told apart from `count /x/`.
 */
function regexCanStart(prevChar: string, prevWord: string): boolean {
  if (prevChar === '') return true
  if (prevChar === ')' || prevChar === ']') return false
  if (isIdentifierChar(prevChar)) return REGEX_AFTER_KEYWORD.has(prevWord)
  return true
}

/** Index just past the `'`/`"` string starting at `i`. */
function skipQuoted(source: string, i: number): number {
  const quote = source[i]
  for (let j = i + 1; j < source.length; j++) {
    if (source[j] === '\\') {
      j++
      continue
    }
    if (source[j] === quote) return j + 1
    // A raw newline cannot appear in a normal string: treat it as unterminated
    // rather than swallowing the rest of the file.
    if (source[j] === '\n') return j
  }
  return source.length
}

/** Index just past the regex literal starting at `i`, or -1 if it is not one. */
function skipRegex(source: string, i: number): number {
  let inCharClass = false
  for (let j = i + 1; j < source.length; j++) {
    const char = source[j]
    if (char === '\\') {
      j++
      continue
    }
    if (char === '\n') return -1
    if (inCharClass) {
      if (char === ']') inCharClass = false
      continue
    }
    if (char === '[') inCharClass = true
    else if (char === '/') return j + 1
  }
  return -1
}

/** Index just past the template literal starting at `i`, including any `${…}` holes. */
function skipTemplate(source: string, i: number): number {
  for (let j = i + 1; j < source.length; j++) {
    const char = source[j]
    if (char === '\\') {
      j++
      continue
    }
    if (char === '`') return j + 1
    if (char === '$' && source[j + 1] === '{') {
      // The hole holds code, which may nest further strings and templates.
      const end = scanToClosing(source, j + 2, '}')
      if (end === -1) return source.length
      j = end - 1
    }
  }
  return source.length
}

/**
 * Index just past the string, template, comment or regex starting at `i`, or -1
 * when `i` is ordinary code.
 */
function skipNonCode(source: string, i: number, allowRegex: boolean): number {
  const char = source[i]
  if (char === "'" || char === '"') return skipQuoted(source, i)
  if (char === '`') return skipTemplate(source, i)
  if (char !== '/') return -1

  if (source[i + 1] === '/') {
    const newline = source.indexOf('\n', i)
    return newline === -1 ? source.length : newline
  }
  if (source[i + 1] === '*') {
    const end = source.indexOf('*/', i + 2)
    return end === -1 ? source.length : end + 2
  }
  return allowRegex ? skipRegex(source, i) : -1
}

function isCommentStart(source: string, i: number): boolean {
  return source[i] === '/' && (source[i + 1] === '/' || source[i + 1] === '*')
}

/**
 * Index just past the `closer` that matches an already-opened bracket, scanning
 * from `start`. Brackets inside strings, templates, comments and regexes do not
 * count — that is the whole point of going through `skipNonCode`.
 */
function scanToClosing(source: string, start: number, closer: '}' | ')'): number {
  let depth = 0
  let prevChar = ''
  let prevWord = ''

  for (let i = start; i < source.length; i++) {
    const char = source[i]!

    if (canOpenNonCode(char)) {
      const skipped = skipNonCode(source, i, regexCanStart(prevChar, prevWord))
      if (skipped !== -1) {
        // A literal is a value, so a following `/` is division. A comment is not,
        // so it leaves the preceding token in place.
        if (!isCommentStart(source, i)) {
          prevChar = 'x'
          prevWord = ''
        }
        i = skipped - 1
        continue
      }
    } else if (char === '{' || char === '(' || char === '[') {
      depth++
    } else if (char === '}' || char === ')' || char === ']') {
      if (depth === 0 && char === closer) return i + 1
      depth--
    }

    if (!isWhitespace(char)) {
      prevChar = char
      prevWord = isIdentifierChar(char) ? prevWord + char : ''
    }
  }

  return -1
}

/**
 * Source text passed to `$defineI18nRoute(...)`.
 *
 * Brace and paren counting is what makes this cheap — a parser costs ~60x more
 * per file — but the counter has to know what it is counting. Without that, a
 * config as ordinary as `{ en: '/a}b' }` ended at the brace inside the string
 * and the whole config was lost; the call name was also matched inside comments
 * and strings.
 *
 * Returns `null` when the page does not call `$defineI18nRoute` — the common
 * case, since this runs over every `.vue` file in the project.
 */
function locateConfigSource(scriptContent: string): string | null | { error: string } {
  if (!scriptContent.includes(CALL_NAME)) return null

  let prevChar = ''
  let prevWord = ''

  for (let i = 0; i < scriptContent.length; i++) {
    const char = scriptContent[i]!

    if (canOpenNonCode(char)) {
      const skipped = skipNonCode(scriptContent, i, regexCanStart(prevChar, prevWord))
      if (skipped !== -1) {
        if (!isCommentStart(scriptContent, i)) {
          prevChar = 'x'
          prevWord = ''
        }
        i = skipped - 1
        continue
      }
    } else if (char === '$' && scriptContent.startsWith(CALL_NAME, i) && !isIdentifierChar(scriptContent[i - 1] ?? '')) {
      // Match the call only as a whole identifier, so `my$defineI18nRouteHelper(`
      // never triggers it — and, having got here, never inside a comment or string.
      let j = i + CALL_NAME.length
      if (!isIdentifierChar(scriptContent[j] ?? '')) {
        while (j < scriptContent.length && isWhitespace(scriptContent[j]!)) j++
        if (scriptContent[j] === '(') {
          const end = scanToClosing(scriptContent, j + 1, ')')
          if (end === -1) return { error: `${CALL_NAME}( is never closed` }
          return scriptContent.slice(j + 1, end - 1)
        }
      }
    }

    if (!isWhitespace(char)) {
      prevChar = char
      prevWord = isIdentifierChar(char) ? prevWord + char : ''
    }
  }

  return null
}

/** JSON round-trip drops functions/symbols/etc. that cannot survive serialization to the meta file. */
function toPlainConfig(configObject: DefineI18nRouteConfig): DefineI18nRouteConfig {
  try {
    return JSON.parse(JSON.stringify(configObject))
  } catch {
    return configObject
  }
}

type EvalResult = { ok: true; config: DefineI18nRouteConfig } | { ok: false; error: string }

function evaluateConfig(scriptContent: string, configStr: string): EvalResult {
  // Plain literal config — by far the common case, and valid JS as written.
  try {
    return { ok: true, config: toPlainConfig(Function(`"use strict";return (${configStr})`)()) }
  } catch {
    /* falls through */
  }

  // Same, minus TypeScript parameter annotations (e.g. a `.map((l: string) => …)`
  // inside the config). The regex is crude, so it is only reached once the
  // untouched source has already failed.
  const cleanConfigStr = removeTypeScriptTypes(configStr)
  try {
    return { ok: true, config: toPlainConfig(Function(`"use strict";return (${cleanConfigStr})`)()) }
  } catch {
    /* falls through */
  }

  // The config references bindings declared in the script (`locales: myLocales`),
  // so the surrounding code has to run first. Imports are dropped — their
  // modules are not resolvable here — which is why a config built from an
  // imported value ends up reported as an error below.
  const scriptWithoutImports = scriptContent
    .split('\n')
    .filter((line) => !line.trim().startsWith('import '))
    .join('\n')

  const safeScript = `
          const $defineI18nRoute = () => {}
          const defineI18nRoute = () => {}
          const process = { env: { NODE_ENV: 'development' } }
          ${removeTypeScriptTypes(scriptWithoutImports)}
          return (${cleanConfigStr})
        `

  try {
    return { ok: true, config: toPlainConfig(Function(`"use strict";${safeScript}`)()) }
  } catch (error) {
    return { ok: false, error: `config could not be evaluated (${(error as Error).message})` }
  }
}

function normalizeDefineConfig(configObject: DefineI18nRouteConfig): DefineI18nRouteConfig {
  if (configObject.locales && typeof configObject.locales === 'object' && !Array.isArray(configObject.locales)) {
    const localesObj = configObject.locales as Record<string, Record<string, unknown> & { path?: string }>
    const normalizedLocales: string[] = []
    const normalizedLocaleRoutes: Record<string, string> = {}

    for (const [locale, value] of Object.entries(localesObj)) {
      normalizedLocales.push(locale)
      if (value && typeof value === 'object' && 'path' in value && typeof value.path === 'string') {
        normalizedLocaleRoutes[locale] = value.path
      }
    }

    return {
      ...configObject,
      locales: normalizedLocales,
      localeRoutes:
        configObject.localeRoutes || Object.keys(normalizedLocaleRoutes).length > 0
          ? { ...configObject.localeRoutes, ...normalizedLocaleRoutes }
          : undefined,
    }
  }

  if (Array.isArray(configObject.locales) && configObject.locales.length > 0 && typeof configObject.locales[0] === 'object') {
    const normalizedLocales: string[] = configObject.locales.map((item: unknown) => {
      if (item && typeof item === 'object' && 'code' in item) {
        return (item as { code: string }).code
      }
      return String(item)
    })

    return {
      ...configObject,
      locales: normalizedLocales,
    }
  }

  return configObject
}

/** Files already reported, so a rebuild or HMR pass does not repeat the same warning. */
const warnedFiles = new Set<string>()

function warnUnextractable(filePath: string, error: string): void {
  if (warnedFiles.has(filePath)) return
  warnedFiles.add(filePath)
  console.warn(
    `[nuxt-i18n-micro] Ignored the $defineI18nRoute() config in ${filePath}: ${error}. ` +
      'This page keeps the default locales and routes. Pass a literal object, or values declared in the same file — ' +
      'a config assembled from an imported binding cannot be read at build time.',
  )
}

export function extractDefineI18nRouteData(content: string, filePath: string): DefineI18nRouteConfig | null {
  try {
    const scriptContent = extractScriptContent(content)
    if (!scriptContent) {
      return null
    }

    const configStr = locateConfigSource(scriptContent)
    if (configStr === null) {
      return null
    }
    if (typeof configStr === 'object') {
      warnUnextractable(filePath, configStr.error)
      return null
    }

    const result = evaluateConfig(scriptContent, configStr)
    if (!result.ok) {
      warnUnextractable(filePath, result.error)
      return null
    }

    return normalizeDefineConfig(result.config)
  } catch {
    return null
  }
}

export function pageFilePathToRoutePath(pageFile: string, rootDir: string): string {
  const relative = pageFile.replace(rootDir, '').replace(/^[/\\]+/, '')
  const withoutPagesPrefix = relative.replace(/^(app[/\\])?pages[/\\]/, '')

  if (withoutPagesPrefix === 'index.vue') {
    return '/'
  }

  const raw = withoutPagesPrefix
    .replace(/[/\\]index\.vue$/, '')
    .replace(/\.vue$/, '')
    .replace(/[/\\]$/, '')
    .replace(/\\/g, '/')

  return raw === '' ? '/' : raw
}
