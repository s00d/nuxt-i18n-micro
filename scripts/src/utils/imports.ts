/**
 * What a source file imports, split by whether the import survives to runtime.
 *
 * A regex over raw text is enough here — this answers "which packages appear in import
 * position", not "what does this module mean" — but only once comments are gone: a
 * sentence like `… (disabled for this request) from "no request context"` matches a
 * naive `from '…'` pattern and would be reported as an undeclared dependency.
 */
const SOURCE_EXTENSIONS = ['.ts', '.mts', '.cts', '.tsx', '.js', '.mjs', '.cjs', '.jsx', '.vue']

/**
 * Contents of a `${…}` starting at `start`, and the index just past its closing brace.
 *
 * Braces are counted lexically, skipping strings, comments, regexes and nested templates:
 * a lone `}` inside a string (`` `${x['}']}` ``) would otherwise close the interpolation
 * early and hide every import after it.
 *
 * The text is returned with ordinary string literals blanked, because the caller
 * re-scans it as code — `${'import "ghost"'}` is a string, not an import.
 */
function readInterpolation(source: string, start: number): { text: string; end: number } {
  let depth = 1
  let i = start
  let out = ''

  while (i < source.length && depth > 0) {
    const char = source[i]!
    const next = source[i + 1]

    if (char === '\\') {
      out += source.slice(i, i + 2)
      i += 2
      continue
    }

    if (char === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') i++
      continue
    }
    if (char === '/' && next === '*') {
      i += 2
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i++
      i += 2
      out += ' '
      continue
    }

    if (char === '"' || char === "'") {
      const quote = char
      const from = i
      i++
      while (i < source.length) {
        if (source[i] === '\\') {
          i += 2
          continue
        }
        if (source[i] === quote) {
          i++
          break
        }
        i++
      }
      // Kept only where an import specifier could be: after `from`, `import(` or
      // `require(`. Anywhere else it is data, and rescanning it invented dependencies.
      out += /(?:\bfrom|\bimport\s*\(|\brequire\s*\(|\bimport)\s*$/.test(out) ? source.slice(from, i) : '""'
      continue
    }

    if (char === '`') {
      const nested = readTemplate(source, i)
      out += nested.text
      i = nested.end
      continue
    }

    if (char === '/' && regexCanStart(out)) {
      // A regex can hold quotes and braces; scanning it as text both invents specifiers
      // and closes the interpolation early, hiding every import after it.
      const from = i
      i++
      let inClass = false
      while (i < source.length) {
        const inner = source[i]!
        i++
        if (inner === '\\') {
          i++
          continue
        }
        if (inner === '[') inClass = true
        else if (inner === ']') inClass = false
        else if ((inner === '/' && !inClass) || inner === '\n') break
      }
      out += source.slice(from, i)
      continue
    }

    if (char === '{') depth++
    else if (char === '}') depth--

    if (depth > 0 || char !== '}') out += char
    i++
  }

  return { text: out, end: i }
}

/** A template literal starting at the backtick: its text dropped, its interpolations kept. */
function readTemplate(source: string, start: number): { text: string; end: number } {
  let i = start + 1
  let out = '``'

  while (i < source.length) {
    const char = source[i]!
    if (char === '\\') {
      i += 2
      continue
    }
    if (char === '`') {
      i++
      break
    }
    if (char === '$' && source[i + 1] === '{') {
      const body = readInterpolation(source, i + 2)
      out += body.text
      i = body.end
      continue
    }
    i++
  }

  return { text: out, end: i }
}

/** Tokens after which a `/` starts a regex literal rather than division. */
const BEFORE_REGEX = /(?:^|[(,=:[!&|?{};+\-*%~^]|\b(?:return|typeof|instanceof|in|of|new|delete|void|case|do|else|yield|await))\s*$/

function regexCanStart(before: string): boolean {
  return BEFORE_REGEX.test(before)
}

export { SOURCE_EXTENSIONS }

/**
 * Remove everything that can hold text which merely *looks* like an import.
 *
 * Comments go entirely. Template literals keep their backticks but lose their contents:
 * code generators emit real import statements inside them (types-generator writes an
 * `import '@i18n-micro/types';` into the .d.ts it produces), and counting those would
 * charge the generator with a dependency on the code it writes. Ordinary quoted strings
 * are kept, because an import specifier is itself a quoted string.
 */
export function stripComments(source: string): string {
  let out = ''
  let i = 0

  while (i < source.length) {
    const char = source[i]!
    const next = source[i + 1]

    if (char === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') i++
      continue
    }
    if (char === '/' && next === '*') {
      i += 2
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i++
      i += 2
      // A space, not nothing: `import/* x */'p'` must not become `import'p'` and lose the
      // token boundary the patterns below rely on.
      out += ' '
      continue
    }

    if (char === '/' && regexCanStart(out)) {
      // A regex literal can hold `/*`, `//` or an unbalanced quote; treating those as a
      // comment or a string swallows the rest of the file.
      out += char
      i++
      let inClass = false
      while (i < source.length) {
        const inner = source[i]!
        out += inner
        i++
        if (inner === '\\') {
          if (i < source.length) {
            out += source[i]
            i++
          }
          continue
        }
        if (inner === '[') inClass = true
        else if (inner === ']') inClass = false
        else if (inner === '/' && !inClass) break
        else if (inner === '\n') break
      }
      continue
    }

    if (char === '`') {
      // Literal text is dropped, interpolations are kept — `${await import(x)}` is a real
      // dependency, while the text around it is usually generated code.
      const template = readTemplate(source, i)
      out += template.text
      i = template.end
      continue
    }

    if (char === '"' || char === "'") {
      const quote = char
      out += char
      i++
      while (i < source.length) {
        const inner = source[i]!
        out += inner
        i++
        if (inner === '\\') {
          if (i < source.length) {
            out += source[i]
            i++
          }
          continue
        }
        if (inner === quote) break
      }
      continue
    }

    out += char
    i++
  }

  return out
}

export interface FileImports {
  /** Specifiers whose binding exists at runtime. */
  value: string[]
  /** Specifiers behind `import type` / `export type`, erased at compile time. */
  typeOnly: string[]
}

const VALUE_PATTERNS = [
  // import x from 'p' / import { x } from 'p' / import * as x from 'p'
  /\bimport\s+(?!type\b)[^;'"]*?\bfrom\s*['"]([^'"]+)['"]/g,
  // export { x } from 'p' / export * from 'p'
  /\bexport\s+(?!type\b)[^;'"]*?\bfrom\s*['"]([^'"]+)['"]/g,
  // import 'p'  (side effect)
  /\bimport\s+['"]([^'"]+)['"]/g,
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
]

const TYPE_PATTERNS = [/\bimport\s+type\s[^;'"]*?\bfrom\s*['"]([^'"]+)['"]/g, /\bexport\s+type\s[^;'"]*?\bfrom\s*['"]([^'"]+)['"]/g]

export function fileImports(source: string): FileImports {
  const code = stripComments(source)
  const collect = (patterns: RegExp[]): string[] => {
    const found = new Set<string>()
    for (const pattern of patterns) {
      for (const match of code.matchAll(pattern)) found.add(match[1]!)
    }
    return [...found]
  }

  const value = collect(VALUE_PATTERNS)
  // A module imported both ways is a runtime dependency; only the type-only side is
  // erased. Note that inline `import { type A } from 'p'` counts as a value import,
  // which is the conservative direction.
  const typeOnly = collect(TYPE_PATTERNS).filter((specifier) => !value.includes(specifier))
  return { value, typeOnly }
}
