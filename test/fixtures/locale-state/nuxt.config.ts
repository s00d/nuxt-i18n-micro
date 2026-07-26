import type { Strategies } from '../../../src/module'
import MyModule from '../../../src/module'

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
  compatibilityDate: '2024-08-16',

  i18n: {
    locales: [{ code: 'en' }, { code: 'ja' }],
    localeCookie: 'user-locale',
    autoDetectLanguage: false,
    strategy: resolveStrategy(),
    defaultLocale: 'en',
    translationDir: 'locales',
  },
})
