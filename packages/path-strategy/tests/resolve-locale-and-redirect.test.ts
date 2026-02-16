import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext } from '../src'
import { createPathStrategy } from '../src'
import { makePathStrategyContext } from './test-utils'

const baseConfig: ModuleOptionsExtend = {
  defaultLocale: 'en',
  strategy: 'prefix_except_default',
  locales: [
    { code: 'en', iso: 'en-US' },
    { code: 'de', iso: 'de-DE' },
    { code: 'ru', iso: 'ru-RU' },
  ],
  dateBuild: 0,
  hashMode: false,
  isSSG: false,
  apiBaseUrl: '',
  disablePageLocales: false,
}

function makeCtx(strategy: NonNullable<ModuleOptionsExtend['strategy']>, extra?: Partial<PathStrategyContext>): PathStrategyContext {
  return makePathStrategyContext(baseConfig, strategy, extra)
}

describe('getLocaleFromPath', () => {
  test('returns first segment when it is a locale code', () => {
    const strategy = createPathStrategy(makeCtx('prefix'))
    expect(strategy.getLocaleFromPath('/en/about')).toBe('en')
    expect(strategy.getLocaleFromPath('/de/ueber-uns')).toBe('de')
    expect(strategy.getLocaleFromPath('/ru')).toBe('ru')
    const result = {
      '/en/about': strategy.getLocaleFromPath('/en/about'),
      '/de/ueber-uns': strategy.getLocaleFromPath('/de/ueber-uns'),
      '/ru': strategy.getLocaleFromPath('/ru'),
    }
    expect(result).toMatchSnapshot()
  })

  test('returns null for root or path without locale prefix', () => {
    const strategy = createPathStrategy(makeCtx('prefix'))
    expect(strategy.getLocaleFromPath('/')).toBe(null)
    expect(strategy.getLocaleFromPath('/about')).toBe(null)
    const result = { '/': strategy.getLocaleFromPath('/'), '/about': strategy.getLocaleFromPath('/about') }
    expect(result).toMatchSnapshot()
  })

  test('strips query and hash before parsing', () => {
    const strategy = createPathStrategy(makeCtx('prefix'))
    expect(strategy.getLocaleFromPath('/en/about?foo=1')).toBe('en')
    expect(strategy.getLocaleFromPath('/de/page#section')).toBe('de')
    const result = {
      withQuery: strategy.getLocaleFromPath('/en/about?foo=1'),
      withHash: strategy.getLocaleFromPath('/de/page#section'),
    }
    expect(result).toMatchSnapshot()
  })
})

describe('resolveLocaleFromPath', () => {
  test('prefix: first segment is locale', () => {
    const strategy = createPathStrategy(makeCtx('prefix'))
    expect(strategy.resolveLocaleFromPath('/en/about')).toBe('en')
    expect(strategy.resolveLocaleFromPath('/')).toBe(null)
    expect(strategy.resolveLocaleFromPath('/about')).toBe(null)
    const result = {
      '/en/about': strategy.resolveLocaleFromPath('/en/about'),
      '/de/ueber-uns': strategy.resolveLocaleFromPath('/de/ueber-uns'),
      '/ru': strategy.resolveLocaleFromPath('/ru'),
      '/': strategy.resolveLocaleFromPath('/'),
      '/about': strategy.resolveLocaleFromPath('/about'),
    }
    expect(result).toMatchSnapshot()
  })

  test('prefix_except_default: first segment or default', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    expect(strategy.resolveLocaleFromPath('/about')).toBe('en')
    expect(strategy.resolveLocaleFromPath('/')).toBe('en')
    const result = {
      '/en/about': strategy.resolveLocaleFromPath('/en/about'),
      '/de/about': strategy.resolveLocaleFromPath('/de/about'),
      '/about': strategy.resolveLocaleFromPath('/about'),
      '/': strategy.resolveLocaleFromPath('/'),
    }
    expect(result).toMatchSnapshot()
  })

  test('no_prefix: cannot determine from path', () => {
    const strategy = createPathStrategy(makeCtx('no_prefix'))
    expect(strategy.resolveLocaleFromPath('/about')).toBe(null)
    const result = { '/about': strategy.resolveLocaleFromPath('/about'), '/en/about': strategy.resolveLocaleFromPath('/en/about') }
    expect(result).toMatchSnapshot()
  })

  test('prefix_and_default: first segment is locale', () => {
    const strategy = createPathStrategy(makeCtx('prefix_and_default'))
    expect(strategy.resolveLocaleFromPath('/en/about')).toBe('en')
    expect(strategy.resolveLocaleFromPath('/about')).toBe(null)
    const result = { '/en/about': strategy.resolveLocaleFromPath('/en/about'), '/about': strategy.resolveLocaleFromPath('/about') }
    expect(result).toMatchSnapshot()
  })
})

describe('getRedirect', () => {
  test('prefix: root redirects to /locale', () => {
    const strategy = createPathStrategy(makeCtx('prefix'))
    expect(strategy.getRedirect('/', 'en')).toBe('/en')
    expect(strategy.getRedirect('/en/about', 'en')).toBe(null)
    const result = {
      rootEn: strategy.getRedirect('/', 'en'),
      rootDe: strategy.getRedirect('/', 'de'),
      aboutEn: strategy.getRedirect('/about', 'en'),
      enAboutEn: strategy.getRedirect('/en/about', 'en'),
      deAboutDe: strategy.getRedirect('/de/about', 'de'),
    }
    expect(result).toMatchSnapshot()
  })

  test('prefix_except_default: default locale no prefix', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    expect(strategy.getRedirect('/', 'en')).toBe(null)
    expect(strategy.getRedirect('/en/about', 'en')).toBe('/about')
    expect(strategy.getRedirect('/about', 'de')).toBe('/de/about')
    const result = {
      rootEn: strategy.getRedirect('/', 'en'),
      aboutEn: strategy.getRedirect('/about', 'en'),
      enAboutToEn: strategy.getRedirect('/en/about', 'en'),
      aboutDe: strategy.getRedirect('/about', 'de'),
      deAboutDe: strategy.getRedirect('/de/about', 'de'),
    }
    expect(result).toMatchSnapshot()
  })

  test('no_prefix: no redirect when noPrefixRedirect is false', () => {
    const strategy = createPathStrategy(makeCtx('no_prefix', { noPrefixRedirect: false }))
    expect(strategy.getRedirect('/en/about', 'en')).toBe(null)
    const result = { aboutEn: strategy.getRedirect('/about', 'en'), enAboutEn: strategy.getRedirect('/en/about', 'en') }
    expect(result).toMatchSnapshot()
  })

  test('no_prefix: strips locale prefix when noPrefixRedirect is true (default)', () => {
    const strategy = createPathStrategy(makeCtx('no_prefix'))
    expect(strategy.getRedirect('/en/about', 'en')).toBe('/about')
    expect(strategy.getRedirect('/en', 'en')).toBe('/')
    const result = {
      enAboutEn: strategy.getRedirect('/en/about', 'en'),
      deUeberDe: strategy.getRedirect('/de/ueber-uns', 'de'),
      enRootEn: strategy.getRedirect('/en', 'en'),
    }
    expect(result).toMatchSnapshot()
  })

  test('prefix_and_default: root redirects to /locale', () => {
    const strategy = createPathStrategy(makeCtx('prefix_and_default'))
    const result = { rootEn: strategy.getRedirect('/', 'en'), aboutDe: strategy.getRedirect('/about', 'de') }
    expect(result).toMatchSnapshot()
  })

  test('prefix_except_default: no redirect when path matches and only query/hash differs (hash preservation)', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const result = {
      withQueryHash: strategy.getRedirect('/de/news/2?search=vue&page=1#top', 'de'),
      withQuery: strategy.getRedirect('/de/news/2?search=vue&page=1', 'de'),
      withHash: strategy.getRedirect('/de/news/2#top', 'de'),
      pathOnly: strategy.getRedirect('/de/news/2', 'de'),
    }
    expect(result).toMatchSnapshot()
  })

  test('no circular redirect: second getRedirect on result returns null (idempotent)', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const redirect1 = strategy.getRedirect('/about', 'de')
    expect(redirect1).toBe('/de/about')
    const redirect2 = redirect1 ? strategy.getRedirect(redirect1, 'de') : null
    expect(redirect2).toBe(null)
    expect({ redirect1, redirect2 }).toMatchSnapshot()
  })

  test('no circular redirect: prefix strategy', () => {
    const strategy = createPathStrategy(makeCtx('prefix'))
    const redirect1 = strategy.getRedirect('/about', 'en')
    expect(redirect1).toBe('/en/about')
    const redirect2 = redirect1 ? strategy.getRedirect(redirect1, 'en') : null
    expect(redirect2).toBe(null)
    expect({ redirect1, redirect2 }).toMatchSnapshot()
  })
})

describe('snapshots (documentation: how resolveLocaleFromPath, getRedirect work)', () => {
  test('resolveLocaleFromPath: result per strategy for set of paths', () => {
    const paths = ['/', '/about', '/en/about', '/de/about', '/de/ueber-uns']
    const strategies = ['no_prefix', 'prefix', 'prefix_except_default', 'prefix_and_default'] as const
    const out: Record<string, Record<string, string | null>> = {}
    for (const s of strategies) {
      const strategy = createPathStrategy(makeCtx(s))
      out[s] = {}
      for (const p of paths) {
        out[s][p] = strategy.resolveLocaleFromPath(p)
      }
    }
    expect(out).toMatchSnapshot()
  })

  test('getRedirect: path and target locale → where to redirect (null = no redirect)', () => {
    const cases: Array<{ path: string; targetLocale: string; strategy: NonNullable<ModuleOptionsExtend['strategy']> }> = [
      { path: '/', targetLocale: 'en', strategy: 'prefix' },
      { path: '/', targetLocale: 'en', strategy: 'prefix_except_default' },
      { path: '/about', targetLocale: 'de', strategy: 'prefix_except_default' },
      { path: '/en/about', targetLocale: 'en', strategy: 'prefix_except_default' },
      { path: '/en/about', targetLocale: 'en', strategy: 'no_prefix' },
      { path: '/de/about', targetLocale: 'de', strategy: 'prefix_except_default' },
    ]
    const out = cases.map(({ path, targetLocale, strategy }) => {
      const s = createPathStrategy(makeCtx(strategy))
      return { path, targetLocale, strategy, redirect: s.getRedirect(path, targetLocale) }
    })
    expect(out).toMatchSnapshot()
  })
})
