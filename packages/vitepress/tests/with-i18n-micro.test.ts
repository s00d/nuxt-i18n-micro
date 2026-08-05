import { afterEach, describe, expect, it, vi } from 'vitest'
import { withI18nMicro, warnLocaleMismatch, type VitePressUserConfigLike } from '../src/with-i18n-micro'
import { messagesFromGlob } from '../src/messages-from-glob'
import { createVitePressI18n } from '../src/create'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('withI18nMicro', () => {
  it('merges vite plugin without dropping existing plugins', () => {
    const existing = { name: 'existing-plugin' }
    const result = withI18nMicro(
      {
        locales: {
          root: { label: 'English', lang: 'en' },
          fr: { label: 'French', lang: 'fr' },
        },
        vite: {
          plugins: [existing],
        },
      },
      {
        locale: 'en',
        defaultLocale: 'en',
        locales: [
          { code: 'en', iso: 'en-US' },
          { code: 'fr', iso: 'fr-FR' },
        ],
        warnOnLocaleMismatch: false,
      },
    )

    const plugins = (result.vite?.plugins ?? []) as Array<{ name: string }>
    expect(plugins.some((p) => p.name === 'existing-plugin')).toBe(true)
    expect(plugins.some((p) => p.name === 'vite-plugin-i18n-micro-vitepress')).toBe(true)
  })

  it('virtual plugin resolves config module', () => {
    const result = withI18nMicro(
      {} as VitePressUserConfigLike,
      {
        locale: 'en',
        locales: [{ code: 'en', iso: 'en-US' }],
        warnOnLocaleMismatch: false,
        localeKeyToCode: { root: 'en' },
      },
    )
    const plugins = (result.vite?.plugins ?? []) as Array<{
      name: string
      resolveId?: (id: string) => string | undefined
      load?: (id: string) => string | undefined
      configResolved?: (config: { root: string }) => void
    }>
    const plugin = plugins.find((p) => p.name === 'vite-plugin-i18n-micro-vitepress')

    expect(plugin).toBeTruthy()
    plugin!.configResolved?.({ root: process.cwd() })
    const resolved = plugin!.resolveId!('virtual:i18n-micro/config')
    expect(resolved).toBe('\0virtual:i18n-micro/config')
    const loaded = plugin!.load!(resolved!)
    expect(loaded).toContain('"defaultLocale":"en"')
    expect(loaded).toContain('"localeKeyToCode"')
    expect(loaded).toContain('export const config')

    const messagesId = plugin!.resolveId!('virtual:i18n-micro/messages')
    expect(messagesId).toBe('\0virtual:i18n-micro/messages')
    const messagesMod = plugin!.load!(messagesId!)
    expect(messagesMod).toContain('export const messages')
    expect(messagesMod).toContain('export const routeMessages')
  })

  it('warnLocaleMismatch logs on bad keys', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnLocaleMismatch(
      { locales: { root: {}, de: {} } },
      {
        locale: 'en',
        defaultLocale: 'en',
        locales: [{ code: 'en' }, { code: 'fr' }],
      },
    )
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]?.[0])).toContain('"de"')
    expect(String(warn.mock.calls[0]?.[0])).not.toContain('"root"')
  })
})

describe('messagesFromGlob', () => {
  it('keeps dictionaries that include a default key among others', () => {
    const messages = messagesFromGlob({
      '/x/en.json': { hello: 'Hi' },
      '/x/fr.json': { default: 'Defaut', hello: 'Bonjour' },
    })
    expect(messages.en).toEqual({ hello: 'Hi' })
    expect(messages.fr).toEqual({ default: 'Defaut', hello: 'Bonjour' })
  })

  it('unwraps Vite module namespaces', () => {
    const messages = messagesFromGlob({
      '/x/de.json': { default: { hello: 'Hallo' } },
    })
    expect(messages.de).toEqual({ hello: 'Hallo' })
  })
})

describe('createVitePressI18n', () => {
  it('syncs locale and route from path', async () => {
    const { enhanceApp, i18n } = createVitePressI18n({
      locale: 'en',
      defaultLocale: 'en',
      locales: [
        { code: 'en', iso: 'en-US' },
        { code: 'fr', iso: 'fr-FR' },
      ],
      messages: {
        en: { hi: 'Hi' },
        fr: { hi: 'Salut' },
      },
      routeMessages: {
        'guide-demo': {
          en: { pageNote: 'EN page' },
          fr: { pageNote: 'FR page' },
        },
      },
    })

    const app = {
      use: vi.fn(),
      provide: vi.fn(),
      config: { globalProperties: {} as Record<string, unknown> },
      component: vi.fn(),
    }

    let after: ((to: string) => unknown) | undefined
    const router = {
      route: { path: '/fr/guide/demo' },
      go: vi.fn(),
      set onAfterRouteChange(fn: ((to: string) => unknown) | undefined) {
        after = fn
      },
      get onAfterRouteChange() {
        return after
      },
    }

    enhanceApp({ app: app as never, router })

    expect(i18n.getLocale()).toBe('fr')
    expect(i18n.getRoute()).toBe('guide-demo')
    expect(i18n.t('pageNote')).toBe('FR page')

    router.route.path = '/guide/demo'
    await after?.('/guide/demo')
    expect(i18n.getLocale()).toBe('en')
    expect(i18n.getRoute()).toBe('guide-demo')
  })

  it('re-chains onAfterRouteChange after later enhanceApp overwrites', async () => {
    const { enhanceApp, i18n } = createVitePressI18n({
      locale: 'en',
      defaultLocale: 'en',
      locales: [
        { code: 'en' },
        { code: 'fr' },
      ],
      messages: { en: { hi: 'Hi' }, fr: { hi: 'Salut' } },
    })

    const app = {
      use: vi.fn(),
      provide: vi.fn(),
      config: { globalProperties: {} as Record<string, unknown> },
      component: vi.fn(),
    }

    let after: ((to: string) => unknown) | undefined
    const router = {
      route: { path: '/' },
      go: vi.fn(),
      set onAfterRouteChange(fn: ((to: string) => unknown) | undefined) {
        after = fn
      },
      get onAfterRouteChange() {
        return after
      },
    }

    enhanceApp({ app: app as never, router })
    const userHook = vi.fn()
    router.onAfterRouteChange = userHook
    enhanceApp({ app: app as never, router })

    await after?.('/fr/')
    expect(userHook).toHaveBeenCalled()
    expect(i18n.getLocale()).toBe('fr')
  })
})
