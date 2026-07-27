/**
 * What a source file imports, split by whether the import survives to runtime.
 *
 * A regex over raw text is enough here — this answers "which packages appear in import
 * position", not "what does this module mean" — but only once comments are gone: a
 * sentence like `… (disabled for this request) from "no request context"` matches a
 * naive `from '…'` pattern and would be reported as an undeclared dependency.
 */
const SOURCE_EXTENSIONS = ['.ts', '.mts', '.cts', '.tsx', '.js', '.mjs', '.cjs', '.jsx', '.vue']

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
      continue
    }
    if (char === '`') {
      out += '``'
      i++
      let depth = 0
      while (i < source.length) {
        const inner = source[i]!
        if (inner === '\\') {
          i += 2
          continue
        }
        if (inner === '$' && source[i + 1] === '{') {
          depth++
          i += 2
          continue
        }
        if (inner === '}' && depth > 0) {
          depth--
          i++
          continue
        }
        if (inner === '`' && depth === 0) {
          i++
          break
        }
        i++
      }
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
