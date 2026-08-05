import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('virtual:i18n-micro/config', () => ({
  config: {
    defaultLocale: 'en',
    fallbackLocale: 'en',
    locales: [{ code: 'en' }, { code: 'fr-FR' }],
    localeCodes: ['en', 'fr-FR'],
    missingWarn: false,
    syncWithVitePress: true,
    translationDir: 'locales',
    disablePageLocales: false,
    localeKeyToCode: { root: 'en', fr: 'fr-FR' },
  },
}))

vi.mock('virtual:i18n-micro/messages', () => ({
  messages: {
    en: { hi: 'Hi' },
    'fr-FR': { hi: 'Salut' },
  },
  routeMessages: {},
}))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('defineI18nTheme', () => {
  it('maps VitePress locale key to i18n code on first enhanceApp', async () => {
    const { defineI18nTheme } = await import('../src/define-theme')

    const theme = defineI18nTheme({
      Layout: {} as never,
    })

    const app = {
      use: vi.fn((plugin: { global: { getLocale: () => string } }) => {
        ;(app as { _i18n?: { getLocale: () => string } })._i18n = plugin.global
      }),
      provide: vi.fn(),
      config: { globalProperties: {} as Record<string, unknown> },
      component: vi.fn(),
      _i18n: undefined as { getLocale: () => string } | undefined,
    }

    let after: ((to: string) => unknown) | undefined
    const router = {
      route: { path: '/fr/guide/' },
      go: vi.fn(),
      set onAfterRouteChange(fn: (to: string) => unknown) {
        after = fn
      },
      get onAfterRouteChange() {
        return after
      },
    }

    await theme.enhanceApp!({
      app: app as never,
      router: router as never,
      siteData: {} as never,
    })

    expect(app._i18n?.getLocale()).toBe('fr-FR')
  })

  it('re-chains onAfterRouteChange after base theme overwrites it', async () => {
    const { defineI18nTheme } = await import('../src/define-theme')
    const baseHook = vi.fn()

    const theme = defineI18nTheme({
      Layout: {} as never,
      async enhanceApp({ router }) {
        router.onAfterRouteChange = baseHook
      },
    })

    const app = {
      use: vi.fn((plugin: { global: { getLocale: () => string } }) => {
        ;(app as { _i18n?: { getLocale: () => string } })._i18n = plugin.global
      }),
      provide: vi.fn(),
      config: { globalProperties: {} as Record<string, unknown> },
      component: vi.fn(),
      _i18n: undefined as { getLocale: () => string } | undefined,
    }

    let after: ((to: string) => unknown) | undefined
    const router = {
      route: { path: '/' },
      go: vi.fn(),
      set onAfterRouteChange(fn: (to: string) => unknown) {
        after = fn
      },
      get onAfterRouteChange() {
        return after
      },
    }

    await theme.enhanceApp!({
      app: app as never,
      router: router as never,
      siteData: {} as never,
    })

    await after?.('/fr/')
    expect(baseHook).toHaveBeenCalledWith('/fr/')
    expect(app._i18n?.getLocale()).toBe('fr-FR')
  })
})
