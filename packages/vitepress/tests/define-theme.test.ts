import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Theme } from 'vitepress'

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
    base: undefined,
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

function makeApp() {
  const app = {
    use: vi.fn((plugin: { global: { getLocale: () => string } }) => {
      app._i18n = plugin.global
    }),
    provide: vi.fn(),
    config: { globalProperties: {} as Record<string, unknown> },
    component: vi.fn(),
    _i18n: undefined as { getLocale: () => string } | undefined,
  }
  return app
}

function makeRouter(path: string) {
  let after: ((to: string) => unknown) | undefined
  return {
    route: { path },
    go: vi.fn(),
    set onAfterRouteChange(fn: ((to: string) => unknown) | undefined) {
      after = fn
    },
    get onAfterRouteChange() {
      return after
    },
  }
}

describe('defineI18nTheme', () => {
  it('maps VitePress locale key to i18n code on first enhanceApp', async () => {
    const { defineI18nTheme } = await import('../src/runtime/define-theme')

    const theme = defineI18nTheme({
      Layout: {} as never,
    } as Theme)

    const app = makeApp()
    const router = makeRouter('/fr/guide/')

    await theme.enhanceApp!({
      app: app as never,
      router: router as never,
      siteData: {} as never,
    })

    expect(app._i18n?.getLocale()).toBe('fr-FR')
  })

  it('re-chains onAfterRouteChange after base theme overwrites it', async () => {
    const { defineI18nTheme } = await import('../src/runtime/define-theme')
    const baseHook = vi.fn()

    const theme = defineI18nTheme({
      Layout: {} as never,
      async enhanceApp({ router }) {
        router.onAfterRouteChange = baseHook
      },
    } as Theme)

    const app = makeApp()
    const router = makeRouter('/')

    await theme.enhanceApp!({
      app: app as never,
      router: router as never,
      siteData: {} as never,
    })

    await router.onAfterRouteChange?.('/fr/')
    expect(baseHook).toHaveBeenCalledWith('/fr/')
    expect(app._i18n?.getLocale()).toBe('fr-FR')
  })
})
