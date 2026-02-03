import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike, RouteLike } from '../src'
import { PrefixExceptDefaultPathStrategy } from '../src'
import { makePathStrategyContext, makeRouterAdapter } from './test-utils'

const baseConfig: ModuleOptionsExtend = {
  defaultLocale: 'en',
  strategy: 'prefix_except_default',
  locales: [
    { code: 'en', iso: 'en-US', name: 'English' },
    { code: 'de', iso: 'de-DE', name: 'Deutsch' },
  ],
  dateBuild: 0,
  hashMode: false,
  isSSG: false,
  apiBaseUrl: '',
  disablePageLocales: false,
}

const makeCtx = (extra?: Partial<PathStrategyContext>): PathStrategyContext =>
  makePathStrategyContext(baseConfig, 'prefix_except_default', extra)

describe('PrefixExceptDefaultPathStrategy - switchLocaleRoute', () => {
  test('should build localized route when exact localized name exists', () => {
    const router = makeRouterAdapter(['localized-about-de'])
    const ctx = makeCtx({ router })
    const strategy = new PrefixExceptDefaultPathStrategy(ctx)

    const route: ResolvedRouteLike = {
      name: 'localized-about-en',
      path: '/en/about',
      fullPath: '/en/about',
      params: { locale: 'en' },
      query: {},
      hash: '',
    }

    const result = strategy.switchLocaleRoute('en', 'de', route, { i18nRouteParams: { de: { locale: 'de' } } })
    expect(typeof result).toBe('object')
    expect((result as RouteLike).name).toBe('localized-about-de')
    expect(result).toMatchSnapshot()
  })
})
