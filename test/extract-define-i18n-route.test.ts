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

const TEST_CASES = [
  // Basic cases
  {
    file: 'simple-array.vue',
    expected: {
      locales: ['en', 'de', 'ru'],
      localeRoutes: null,
      disableMeta: undefined,
    },
  },
  {
    file: 'object-with-paths.vue',
    expected: {
      locales: ['en', 'de', 'ru'],
      localeRoutes: null,
    },
  },
  {
    file: 'with-locale-routes.vue',
    expected: {
      locales: ['en', 'de'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
      },
    },
  },
  {
    file: 'complex-nested.vue',
    expected: {
      locales: ['en-us', 'de-de', 'ru-ru'],
      localeRoutes: null,
    },
  },
  {
    file: 'with-comments.vue',
    expected: {
      locales: ['en', 'de', 'ru'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        ru: '/dobro-pozhalovat',
      },
    },
  },
  {
    file: 'multiline-complex.vue',
    expected: {
      locales: ['en-us', 'de-de'],
      localeRoutes: {
        'en-us': '/welcome',
        'de-de': '/willkommen',
      },
    },
  },
  {
    file: 'template-literals.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/api/welcome',
        de: '/api/willkommen',
        fr: '/api/bienvenue',
      },
    },
  },
  {
    file: 'spread-operator.vue',
    expected: {
      locales: ['en', 'de', 'fr', 'es'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
        es: '/bienvenido',
      },
    },
  },
  {
    file: 'conditional-logic.vue',
    expected: {
      locales: ['en', 'de', 'fr', 'es'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
        es: '/bienvenido',
      },
    },
  },
  {
    file: 'array-of-objects.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'functions-in-objects.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'complex-comments.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'unusual-whitespace.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'mixed-quotes.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'trailing-commas.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'no-spaces.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'very-long-lines.vue',
    expected: {
      locales: ['en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
        es: '/bienvenido',
        it: '/benvenuto',
        pt: '/bem-vindo',
        ru: '/dobro-pozhalovat',
        ja: '/yokoso',
        ko: '/hwan-yeong',
        zh: '/huan-ying',
      },
    },
  },
  {
    file: 'deeply-nested.vue',
    expected: {
      locales: ['en-us', 'de-de', 'fr-fr'],
      localeRoutes: null,
    },
  },
  {
    file: 'empty-arrays-objects.vue',
    expected: {
      locales: [],
      localeRoutes: {},
    },
  },
  {
    file: 'null-undefined.vue',
    expected: {
      locales: null,
      localeRoutes: null,
    },
  },
  {
    file: 'only-locales.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: null,
    },
  },
  {
    file: 'only-locale-routes.vue',
    expected: {
      locales: null,
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'empty-object.vue',
    expected: null,
  },
  {
    file: 'disable-meta-test.vue',
    expected: {
      locales: ['en', 'fr'],
      localeRoutes: null,
      disableMeta: true,
    },
  },
  {
    file: 'disable-meta-locales.vue',
    expected: {
      locales: ['en', 'fr', 'de', 'ru'],
      localeRoutes: null,
      disableMeta: ['en', 'fr'],
    },
  },
  {
    file: 'single-locale.vue',
    expected: {
      locales: ['en'],
      localeRoutes: {
        en: '/welcome',
      },
    },
  },
  {
    file: 'many-locales.vue',
    expected: {
      locales: ['en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi', 'th', 'vi', 'tr', 'pl', 'nl', 'sv', 'no', 'da'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
        es: '/bienvenido',
        it: '/benvenuto',
        pt: '/bem-vindo',
        ru: '/dobro-pozhalovat',
        ja: '/yokoso',
        ko: '/hwan-yeong',
        zh: '/huan-ying',
        ar: '/ahlan-wa-sahlan',
        hi: '/swagat',
        th: '/yindee-ton-rab',
        vi: '/chao-mung',
        tr: '/hos-geldiniz',
        pl: '/witamy',
        nl: '/welkom',
        sv: '/valkommen',
        no: '/velkommen',
        da: '/velkommen',
      },
    },
  },
  {
    file: 'unusual-locale-codes.vue',
    expected: {
      locales: ['en-us', 'de-de', 'fr-fr', 'es-es', 'pt-br', 'zh-cn', 'zh-tw', 'en-gb', 'fr-ca'],
      localeRoutes: {
        'en-us': '/welcome',
        'de-de': '/willkommen',
        'fr-fr': '/bienvenue',
        'es-es': '/bienvenido',
        'pt-br': '/bem-vindo',
        'zh-cn': '/huan-ying',
        'zh-tw': '/huan-ying',
        'en-gb': '/welcome',
        'fr-ca': '/bienvenue',
      },
    },
  },
  {
    file: 'numeric-strings.vue',
    expected: {
      locales: ['1', '2', '3'],
      localeRoutes: {
        1: '/welcome',
        2: '/willkommen',
        3: '/bienvenue',
      },
    },
  },
  {
    file: 'special-characters.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome-to-our-site',
        de: '/willkommen-auf-unserer-website',
        fr: '/bienvenue-sur-notre-site',
      },
    },
  },
  {
    file: 'computed-property-names.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'import-with-static-config.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'js-variables.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'js-functions.vue',
    expected: {
      locales: ['en', 'de', 'ru'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        ru: '/dobro-pozhalovat',
      },
    },
  },
  {
    file: 'complex-nested-objects.vue',
    expected: {
      locales: ['en-us', 'de-de'],
      localeRoutes: null,
    },
  },
  {
    file: 'destructuring.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'map-set.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'json-parsing.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'symbol-properties.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'weakmap-weakset.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'bigint-numbers.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'method-shorthand.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'getter-setter.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'static-methods.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'module-imports.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'iife.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
  {
    file: 'plain-javascript.vue',
    expected: {
      locales: ['en', 'de', 'fr'],
      localeRoutes: {
        en: '/welcome',
        de: '/willkommen',
        fr: '/bienvenue',
      },
    },
  },
]

// Cases that should return null (no defineI18nRoute found or complex cases)
const NULL_CASES = [
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
  describe('should extract correct data from Vue files', () => {
    TEST_CASES.forEach(({ file, expected }) => {
      it(`should parse ${file} correctly`, () => {
        const filePath = join(EXAMPLES_DIR, file)
        const content = readFileSync(filePath, 'utf-8')

        const result = extractDefineI18nRouteData(content, filePath)

        expect(result).toEqual(expected)
      })
    })
  })

  describe('should return null for complex cases', () => {
    NULL_CASES.forEach((file) => {
      it(`should return null for ${file}`, () => {
        const filePath = join(EXAMPLES_DIR, file)
        const content = readFileSync(filePath, 'utf-8')

        const result = extractDefineI18nRouteData(content, filePath)

        expect(result).toBeNull()
      })
    })
  })

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const result = extractDefineI18nRouteData('', 'test.vue')
      expect(result).toEqual({ locales: null, localeRoutes: null })
    })

    it('should handle content without script tag', () => {
      const content = '<template><div>Hello</div></template>'
      const result = extractDefineI18nRouteData(content, 'test.vue')
      expect(result).toEqual({ locales: null, localeRoutes: null })
    })

    it('should handle content without defineI18nRoute', () => {
      const content = '<script setup>const test = "hello"</script>'
      const result = extractDefineI18nRouteData(content, 'test.vue')
      expect(result).toEqual({ locales: null, localeRoutes: null })
    })
  })
})
