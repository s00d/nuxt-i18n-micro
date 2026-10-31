import { describe, expect, test, vi } from 'vitest'
import middleware from '../../src/runtime/middleware/i18n-redirect.global'

const app = vi.hoisted(() => ({ current: {} as Record<string, unknown>, navigateTo: vi.fn() }))

// every Nuxt path is one stub in unit tests, so one mock answers them all
vi.mock('#imports', () => ({
  defineNuxtRouteMiddleware: (handler: unknown) => handler,
  navigateTo: app.navigateTo,
  useNuxtApp: () => app.current,
  useState: () => ({ value: 'de' }),
}))

function run(path: string, autoDetectPath: string) {
  app.navigateTo.mockClear()
  const strategy = {
    getLocaleFromPath: (p: string) => (p.startsWith('/de') ? 'de' : p.startsWith('/fr') ? 'fr' : null),
    getCurrentLocale: vi.fn((_route: unknown, preferred: string) => preferred),
    getClientRedirect: vi.fn((_path: string, preferred: string) => (autoDetectPath === '*' || !_path.startsWith('/fr') ? `/${preferred}` : null)),
  }
  app.current = {
    payload: { serverRendered: true },
    $i18nStrategy: strategy,
    $getI18nConfig: () => ({
      locales: [{ code: 'en' }, { code: 'de' }, { code: 'fr' }],
      defaultLocale: 'en',
      strategy: 'prefix',
      autoDetectPath,
      localeCookie: null,
    }),
  }
  ;(middleware as unknown as (to: unknown, from: unknown) => void)({ path, query: {}, hash: '' }, { path: '/from' })
  return strategy
}

describe('client redirect middleware', () => {
  test('a prefixed URL cannot move unless autoDetectPath is "*": no preference is read for it', () => {
    const strategy = run('/fr/about', '/')
    expect(strategy.getCurrentLocale).not.toHaveBeenCalled()
    expect(strategy.getClientRedirect).not.toHaveBeenCalled()
    expect(app.navigateTo).not.toHaveBeenCalled()
  })

  test('"*" still moves a prefixed URL to the preferred locale', () => {
    run('/fr/about', '*')
    expect(app.navigateTo).toHaveBeenCalledTimes(1)
    expect(app.navigateTo.mock.calls[0]![0]).toMatchObject({ path: '/de' })
  })

  test('an unprefixed URL still moves', () => {
    run('/', '/')
    expect(app.navigateTo.mock.calls[0]![0]).toMatchObject({ path: '/de' })
  })
})
