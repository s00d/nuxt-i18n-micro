import { join } from 'node:path'
import type { Strategies } from '../../../src/module'
import MyModule from '../../../src/module'

// Несколько тестовых файлов собирают эту фикстуру параллельно — каждый задаёт
// свой NUXT_TEST_BUILD_DIR, чтобы сборки не затирали общие .nuxt/.output.
const testBuildDir = process.env.NUXT_TEST_BUILD_DIR

const STRATEGIES = ['no_prefix', 'prefix', 'prefix_except_default', 'prefix_and_default'] as const

// Validate instead of blind-casting: a typo in STRATEGY would otherwise only
// surface deep inside module resolution at runtime.
function resolveStrategy(): Strategies {
  const value = process.env.STRATEGY
  if (value && (STRATEGIES as readonly string[]).includes(value)) return value as Strategies
  if (value) console.warn(`[fixture] unknown STRATEGY "${value}", falling back to no_prefix`)
  return 'no_prefix'
}

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  experimental: {
    // typedPages: true,
    appManifest: false,
  },
  compatibilityDate: '2024-08-16',

  ...(testBuildDir ? { buildDir: testBuildDir } : {}),

  // Краулер при prefix находит ссылки типа /ru/kontakt (с /de), которых нет — 404.
  // Не падать generate на ошибках prerender (тест проверяет только успешную сборку и маршруты).
  nitro: {
    prerender: {
      failOnError: false,
    },
    ...(testBuildDir ? { output: { dir: join(testBuildDir, 'output') } } : {}),
  },

  i18n: {
    locales: [
      { code: 'en', iso: 'en_EN', displayName: 'English' },
      { code: 'de', iso: 'de_DE', displayName: 'German' },
      { code: 'ru', iso: 'ru_RU', displayName: 'Russian' },
    ],
    meta: true,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: false,
    strategy: resolveStrategy(),
    ...(process.env.LOCALE_COOKIE ? { localeCookie: process.env.LOCALE_COOKIE } : {}),
  },
})
