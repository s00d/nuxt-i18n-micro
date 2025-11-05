/**
 * test/extract-define-i18n-route.test.ts
 * Tests for extractDefineI18nRouteData function using real Vue files
 */

import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { extractDefineI18nRouteData } from '../src/utils'

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
      const filePath = join(EXAMPLES_DIR, file)
      const content = readFileSync(filePath, 'utf-8')

      const result = extractDefineI18nRouteData(content, filePath)

      expect(result).toMatchSnapshot()
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
