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

// One file per shape the parser has to get through; the rest of test/examples/ adds no case these miss.
const TEST_FILES = [
  'object-with-paths.vue',
  'array-of-objects.vue',
  'functions-in-objects.vue',
  'complex-comments.vue',
  'null-undefined.vue',
  'plain-javascript.vue',
  'js-functions.vue',
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
      // every one of these parses: a successful parse stays quiet
      expect(warn).not.toHaveBeenCalled()
      warn.mockRestore()
    })
  })

  // The argument is sliced out by counting brackets, but the scanner knows what it is counting:
  // a brace, paren or the call name itself inside a string, comment, template or regex used to
  // cut the slice in the wrong place, and the whole config was dropped without a word.
  it('delimiters and call names inside strings, comments and literals', () => {
    const page = (script: string) => `<script setup lang="ts">\n${script}\n</script>`
    const extract = (script: string, file: string) => extractDefineI18nRouteData(page(script), file)

    expect(extract('$defineI18nRoute({ localeRoutes: { en: `/x}y` } })', 'template.vue')).toEqual({ localeRoutes: { en: '/x}y' } })
    expect(extract(`const re = /\\)\\}/g\n$defineI18nRoute({ locales: ['en'] })`, 'regex.vue')).toEqual({ locales: ['en'] })
    const hole = "const p = (l: string) => `/${ { en: 'w' }[l] ?? l }`\n$defineI18nRoute({ localeRoutes: { en: p('en') } })"
    expect(extract(hole, 'hole.vue')).toEqual({ localeRoutes: { en: '/w' } })
    // the first mention used to win, even one that is not a call
    expect(extract(`// $defineI18nRoute({ locales: ['wrong'] })\n$defineI18nRoute({ locales: ['right'] })`, 'commented-call.vue')).toEqual({
      locales: ['right'],
    })
    expect(
      extract(`const doc = '$defineI18nRoute({ locales: [\\'wrong\\'] })'\n$defineI18nRoute({ locales: ['right'] })`, 'stringified-call.vue'),
    ).toEqual({
      locales: ['right'],
    })
    expect(extract(`/* $defineI18nRoute({ locales: ['wrong'] }) */\n$defineI18nRoute({ locales: ['right'] })`, 'block-comment.vue')).toEqual({
      locales: ['right'],
    })
    // a `/` after a value is division, not a regex: the scan steps over it
    expect(extract(`const half = 10 / 2\n$defineI18nRoute({ locales: ['en'] })`, 'division.vue')).toEqual({ locales: ['en'] })
  })

  // A config that references script bindings runs the page script; destructuring the call
  // from useNuxtApp() used to re-declare `$defineI18nRoute` and drop the whole config.
  it('variable config on a page that destructures $defineI18nRoute from useNuxtApp()', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const script = [
      "import { useNuxtApp } from '#imports'",
      'const { $defineI18nRoute } = useNuxtApp()',
      "const locales = ['en', 'de']",
      "const routes = { en: '/welcome', de: '/willkommen' }",
      '$defineI18nRoute({ locales: locales, localeRoutes: routes })',
    ].join('\n')
    expect(extractDefineI18nRouteData(`<script setup lang="ts">\n${script}\n</script>`, 'destructured.vue')).toEqual({
      locales: ['en', 'de'],
      localeRoutes: { en: '/welcome', de: '/willkommen' },
    })
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
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
  })
})

describe('pageFilePathToRoutePath', () => {
  it('maps page files to route paths', () => {
    expect(pageFilePathToRoutePath('/project/pages/index.vue', '/project')).toBe('/')
    expect(pageFilePathToRoutePath('/project/pages/about/index.vue', '/project')).toBe('about')
    expect(pageFilePathToRoutePath('/project/pages/user/profile.vue', '/project')).toBe('user/profile')
  })
})
