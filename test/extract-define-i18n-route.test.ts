/**
 * test/extract-define-i18n-route.test.ts
 * Tests for extractDefineI18nRouteData function using real Vue files
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { extractDefineI18nRouteData, pageFilePathToRoutePath } from '../src/utils'

/* ──────────────── settings ──────────────── */

const EXAMPLES_DIR = join(fileURLToPath(import.meta.url), '..', 'examples')

/* ──────────────── test cases ──────────────── */

const TEST_FILES = [
  'simple-array.vue',
  'object-with-paths.vue',
  'with-locale-routes.vue',
  'complex-nested.vue',
  'with-comments.vue',
  'multiline-complex.vue',
  'template-literals.vue',
  'spread-operator.vue',
  'conditional-logic.vue',
  'array-of-objects.vue',
  'functions-in-objects.vue',
  'complex-comments.vue',
  'unusual-whitespace.vue',
  'mixed-quotes.vue',
  'trailing-commas.vue',
  'no-spaces.vue',
  'very-long-lines.vue',
  'deeply-nested.vue',
  'empty-arrays-objects.vue',
  'null-undefined.vue',
  'only-locales.vue',
  'only-locale-routes.vue',
  'empty-object.vue',
  'disable-meta-test.vue',
  'disable-meta-locales.vue',
  'single-locale.vue',
  'many-locales.vue',
  'unusual-locale-codes.vue',
  'numeric-strings.vue',
  'special-characters.vue',
  'computed-property-names.vue',
  'import-with-static-config.vue',
  'js-variables.vue',
  'js-functions.vue',
  'complex-nested-objects.vue',
  'destructuring.vue',
  'map-set.vue',
  'json-parsing.vue',
  'symbol-properties.vue',
  'weakmap-weakset.vue',
  'bigint-numbers.vue',
  'method-shorthand.vue',
  'getter-setter.vue',
  'static-methods.vue',
  'module-imports.vue',
  'iife.vue',
  'plain-javascript.vue',
  'array-methods.vue',
  'class-methods.vue',
  'async-await.vue',
  'string-manipulation.vue',
  'try-catch.vue',
  'switch-statement.vue',
  'for-loops.vue',
  'while-loops.vue',
  'do-while-loops.vue',
  'nested-ternary.vue',
  'arrow-functions.vue',
  'generator-functions.vue',
  'proxy-objects.vue',
  'date-math.vue',
  'recursive-functions.vue',
  'promise-simulation.vue',
  'import-external-functions.vue',
  'import-constants.vue',
  'import-default-export.vue',
  'import-multiple.vue',
  'import-destructuring.vue',
  'import-alias.vue',
]

/* ──────────────── tests ──────────────── */

describe('extractDefineI18nRouteData', () => {
  TEST_FILES.forEach((file) => {
    it(`should parse ${file} correctly`, () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const filePath = join(EXAMPLES_DIR, file)
      const content = readFileSync(filePath, 'utf-8')

      const result = extractDefineI18nRouteData(content, filePath)

      expect(result).toMatchSnapshot()
      // Unextractable $defineI18nRoute configs warn once; successful parses stay quiet.
      if (result === null && /\$?defineI18nRoute\s*\(/.test(content)) {
        expect(warn).toHaveBeenCalled()
      }
      else {
        expect(warn).not.toHaveBeenCalled()
      }
      warn.mockRestore()
    })
  })

  // The argument is still sliced out by counting brackets, but the scanner now
  // knows what it is counting. Before, a brace, paren or the call name itself
  // sitting inside a string, comment, template or regex cut the slice in the
  // wrong place and the whole config was dropped without a word.
  describe('delimiters inside strings, comments and literals', () => {
    const page = (script: string) => `<script setup lang="ts">\n${script}\n</script>`

    it('keeps a closing brace inside a route string', () => {
      const result = extractDefineI18nRouteData(
        page(`$defineI18nRoute({ locales: ['en', 'de'], localeRoutes: { en: '/a}b', de: '/c' } })`),
        'braced.vue',
      )
      expect(result).toEqual({ locales: ['en', 'de'], localeRoutes: { en: '/a}b', de: '/c' } })
    })

    it('keeps a closing brace inside a template literal', () => {
      const result = extractDefineI18nRouteData(page('$defineI18nRoute({ localeRoutes: { en: `/x}y` } })'), 'template.vue')
      expect(result).toEqual({ localeRoutes: { en: '/x}y' } })
    })

    it('ignores delimiters in comments', () => {
      const result = extractDefineI18nRouteData(page(`// ) } '\n$defineI18nRoute({ locales: ['en'] })`), 'comment.vue')
      expect(result).toEqual({ locales: ['en'] })
    })

    it('ignores delimiters in a regex literal', () => {
      const result = extractDefineI18nRouteData(page(`const re = /\\)\\}/g\n$defineI18nRoute({ locales: ['en'] })`), 'regex.vue')
      expect(result).toEqual({ locales: ['en'] })
    })

    it('reads braces inside a template hole', () => {
      const script = "const p = (l: string) => `/${ { en: 'w' }[l] ?? l }`\n$defineI18nRoute({ localeRoutes: { en: p('en') } })"
      expect(extractDefineI18nRouteData(page(script), 'hole.vue')).toEqual({ localeRoutes: { en: '/w' } })
    })

    it('does not treat a division as the start of a regex', () => {
      const script = `const half = 10 / 2\n$defineI18nRoute({ locales: ['en'] })`
      expect(extractDefineI18nRouteData(page(script), 'division.vue')).toEqual({ locales: ['en'] })
    })

    // The call name used to be found with a plain indexOf, so the first mention
    // won — even one that is not a call at all.
    it('skips the call name mentioned in a comment', () => {
      const script = `// $defineI18nRoute({ locales: ['wrong'] })\n$defineI18nRoute({ locales: ['right'] })`
      expect(extractDefineI18nRouteData(page(script), 'commented-call.vue')).toEqual({ locales: ['right'] })
    })

    it('skips the call name inside a string', () => {
      const script = `const doc = '$defineI18nRoute({ locales: [\\'wrong\\'] })'\n$defineI18nRoute({ locales: ['right'] })`
      expect(extractDefineI18nRouteData(page(script), 'stringified-call.vue')).toEqual({ locales: ['right'] })
    })

    it('does not match an identifier that merely contains the call name', () => {
      const script = `const my$defineI18nRouteHelper = () => {}\n$defineI18nRoute({ locales: ['right'] })`
      expect(extractDefineI18nRouteData(page(script), 'lookalike.vue')).toEqual({ locales: ['right'] })
    })
  })

  describe('unresolvable config', () => {
    it('warns instead of silently dropping a config built from an import', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const content = `<script setup lang="ts">\nimport { ROUTES } from './routes'\n$defineI18nRoute({ localeRoutes: ROUTES })\n</script>`

      // An imported binding cannot be resolved at build time, so `null` stays the
      // result — but it must be reported, naming the file and the missing binding.
      expect(extractDefineI18nRouteData(content, 'imported-config.vue')).toBeNull()
      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn.mock.calls[0]?.[0]).toContain('imported-config.vue')
      expect(warn.mock.calls[0]?.[0]).toContain('ROUTES is not defined')

      // Every `.vue` file in the project goes through this, and transform reruns on
      // HMR — one warning per file, not one per pass.
      extractDefineI18nRouteData(content, 'imported-config.vue')
      expect(warn).toHaveBeenCalledTimes(1)

      warn.mockRestore()
    })

    it('stays quiet for pages that do not call $defineI18nRoute', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      expect(extractDefineI18nRouteData('<script setup>const a = 1</script>', 'plain.vue')).toBeNull()
      expect(warn).not.toHaveBeenCalled()
      warn.mockRestore()
    })
  })

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const result = extractDefineI18nRouteData('', 'test.vue')
      expect(result).toMatchSnapshot()
    })

    it('should handle content without script tag', () => {
      const content = '<template><div>Hello</div></template>'
      const result = extractDefineI18nRouteData(content, 'test.vue')
      expect(result).toMatchSnapshot()
    })

    it('should handle content without defineI18nRoute', () => {
      const content = '<script setup>const test = "hello"</script>'
      const result = extractDefineI18nRouteData(content, 'test.vue')
      expect(result).toMatchSnapshot()
    })
  })
})

describe('pageFilePathToRoutePath', () => {
  const root = '/project'

  it('maps pages/index.vue to root route', () => {
    expect(pageFilePathToRoutePath(`${root}/pages/index.vue`, root)).toBe('/')
  })

  it('maps pages/index/index.vue to /index route', () => {
    expect(pageFilePathToRoutePath(`${root}/pages/index/index.vue`, root)).toBe('index')
  })

  it('maps nested pages to route paths', () => {
    expect(pageFilePathToRoutePath(`${root}/pages/about/index.vue`, root)).toBe('about')
    expect(pageFilePathToRoutePath(`${root}/pages/user/profile.vue`, root)).toBe('user/profile')
  })
})
