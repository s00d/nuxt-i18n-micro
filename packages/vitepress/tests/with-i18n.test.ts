import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { withI18n, warnLocaleMismatch, type VitePressUserConfigLike } from '../src/plugin/with-i18n'
import { messagesFromGlob } from '../src/runtime/messages-from-glob'
import { createI18n } from '../src/runtime/create'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('withI18n', () => {
  it('injects themeConfig.i18nRouting by default', () => {
    const result = withI18n(
      {
        base: '/docs/',
        themeConfig: { langMenuLabel: 'Lang' },
      } as VitePressUserConfigLike,
      {
        locale: 'en',
        defaultLocale: 'en',
        locales: [{ code: 'en' }, { code: 'fr' }],
        warnOnLocaleMismatch: false,
      },
    )

    const theme = result.themeConfig as { langMenuLabel: string; i18nRouting: (d: unknown, r: { path: string }, t: string) => string }
    expect(theme.langMenuLabel).toBe('Lang')
    expect(typeof theme.i18nRouting).toBe('function')
    expect(theme.i18nRouting({}, { path: '/docs/guide' }, 'fr')).toBe('/fr/guide')
  })

  it('skips i18nRouting when disabled or already set', () => {
    const custom = () => '/custom'
    const disabled = withI18n({} as VitePressUserConfigLike, {
      locale: 'en',
      locales: [{ code: 'en' }],
      i18nRouting: false,
      warnOnLocaleMismatch: false,
    })
    expect((disabled.themeConfig as { i18nRouting?: unknown } | undefined)?.i18nRouting).toBeUndefined()

    const kept = withI18n({ themeConfig: { i18nRouting: custom } } as VitePressUserConfigLike, {
      locale: 'en',
      locales: [{ code: 'en' }, { code: 'fr' }],
      warnOnLocaleMismatch: false,
    })
    expect((kept.themeConfig as { i18nRouting: unknown }).i18nRouting).toBe(custom)
  })

  it('injects transformHead SEO when metaBaseUrl is set', async () => {
    const result = withI18n(
      {
        base: '/docs/',
      } as VitePressUserConfigLike,
      {
        locale: 'en',
        defaultLocale: 'en',
        locales: [
          { code: 'en', iso: 'en-US', og: 'en_US' },
          { code: 'fr', iso: 'fr-FR', og: 'fr_FR' },
        ],
        metaBaseUrl: 'https://example.com',
        warnOnLocaleMismatch: false,
      },
    )

    expect(typeof result.transformHead).toBe('function')
    const head = await result.transformHead!({
      pageData: { relativePath: 'fr/guide.md' },
    })
    expect(Array.isArray(head)).toBe(true)
    const canonical = head.find((t: [string, Record<string, string>]) => t[0] === 'link' && t[1].rel === 'canonical')
    expect(canonical?.[1].href).toBe('https://example.com/docs/fr/guide')
    const alt = head.filter((t: [string, Record<string, string>]) => t[0] === 'link' && t[1].rel === 'alternate')
    expect(alt.some((t: [string, Record<string, string>]) => t[1].hreflang === 'x-default')).toBe(true)
  })

  it('skips meta transformHead when meta is false', () => {
    const result = withI18n({} as VitePressUserConfigLike, {
      locale: 'en',
      locales: [{ code: 'en' }],
      metaBaseUrl: 'https://example.com',
      meta: false,
      warnOnLocaleMismatch: false,
    })
    expect(result.transformHead).toBeUndefined()
  })

  it('respects frontmatter i18n.disableMeta', async () => {
    const result = withI18n({} as VitePressUserConfigLike, {
      locale: 'en',
      defaultLocale: 'en',
      locales: [{ code: 'en', iso: 'en-US', og: 'en_US' }],
      metaBaseUrl: 'https://example.com',
      warnOnLocaleMismatch: false,
    })
    const head = await result.transformHead!({
      pageData: {
        relativePath: 'index.md',
        frontmatter: { i18n: { disableMeta: true } },
      },
    })
    expect(head).toEqual([])
  })

  it('merges vite plugin without dropping existing plugins', () => {
    const existing = { name: 'existing-plugin' }
    const result = withI18n(
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
    expect(plugins.some((p) => p.name === 'vite-plugin-i18n-vitepress')).toBe(true)
  })

  it('virtual plugin resolves config module', () => {
    const result = withI18n({} as VitePressUserConfigLike, {
      locale: 'en',
      locales: [{ code: 'en', iso: 'en-US' }],
      warnOnLocaleMismatch: false,
      localeKeyToCode: { root: 'en' },
    })
    const plugins = (result.vite?.plugins ?? []) as Array<{
      name: string
      resolveId?: (id: string) => string | undefined
      load?: (id: string) => string | undefined
      configResolved?: (config: { root: string }) => void
    }>
    const plugin = plugins.find((p) => p.name === 'vite-plugin-i18n-vitepress')

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

  it('loads root from disk when only routeMessages are inline', () => {
    const dir = mkdtempSync(join(tmpdir(), 'i18n-vp-inline-'))
    try {
      writeFileSync(join(dir, 'en.json'), JSON.stringify({ fromDisk: true }))
      const result = withI18n({} as VitePressUserConfigLike, {
        locale: 'en',
        locales: [{ code: 'en' }],
        translationDir: dir,
        routeMessages: { home: { en: { page: 'inline' } } },
        warnOnLocaleMismatch: false,
      })
      const plugins = (result.vite?.plugins ?? []) as Array<{
        name: string
        configResolved?: (c: { root: string }) => void
        load?: (id: string) => string | undefined
        resolveId?: (id: string) => string | undefined
        configureServer?: (server: unknown) => void
      }>
      const plugin = plugins.find((p) => p.name === 'vite-plugin-i18n-vitepress')!
      plugin.configResolved?.({ root: dir })
      const id = plugin.resolveId!('virtual:i18n-micro/messages')!
      const src = plugin.load!(id)!
      expect(src).toContain('"fromDisk":true')
      expect(src).toContain('"page":"inline"')
      plugin.configureServer?.({
        watcher: { add: vi.fn(), on: vi.fn() },
        moduleGraph: { getModuleById: () => undefined },
        ws: { send: vi.fn() },
      })
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('skips disk watchers when messages and routeMessages are both inline', () => {
    const result = withI18n({} as VitePressUserConfigLike, {
      locale: 'en',
      locales: [{ code: 'en' }],
      messages: { en: { a: '1' } },
      routeMessages: { home: { en: { b: '2' } } },
      warnOnLocaleMismatch: false,
    })
    const plugins = (result.vite?.plugins ?? []) as Array<{
      name: string
      configResolved?: (c: { root: string }) => void
      configureServer?: (server: { watcher: { add: ReturnType<typeof vi.fn> } }) => void
      load?: (id: string) => string | undefined
      resolveId?: (id: string) => string | undefined
    }>
    const plugin = plugins.find((p) => p.name === 'vite-plugin-i18n-vitepress')!
    plugin.configResolved?.({ root: process.cwd() })
    const add = vi.fn()
    plugin.configureServer?.({ watcher: { add } })
    expect(add).not.toHaveBeenCalled()
    const id = plugin.resolveId!('virtual:i18n-micro/messages')!
    const src = plugin.load!(id)!
    expect(src).toContain('"a":"1"')
    expect(src).toContain('"b":"2"')
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

  it('keeps a one-key dictionary whose default value is a string', () => {
    const messages = messagesFromGlob({
      '/x/en.json': { default: 'Default' },
    })
    expect(messages.en).toEqual({ default: 'Default' })
  })

  it('keeps an __esModule-only object as a dictionary', () => {
    const messages = messagesFromGlob({
      '/x/en.json': { __esModule: true } as unknown as { default: never },
    })
    expect(messages.en).toEqual({ __esModule: true })
  })

  it('unwraps Vite module namespaces', () => {
    const messages = messagesFromGlob({
      '/x/de.json': { default: { hello: 'Hallo' } },
    })
    expect(messages.de).toEqual({ hello: 'Hallo' })
  })
})

describe('createI18n', () => {
  it('exposes path methods on the instance', () => {
    const i18n = createI18n({
      locale: 'en',
      defaultLocale: 'en',
      locales: [
        { code: 'en', iso: 'en-US' },
        { code: 'fr', iso: 'fr-FR' },
      ],
    })
    expect(i18n.localizePath('/guide', 'fr')).toBe('/fr/guide')
    expect(i18n.i18n.switchLocalePath('/fr/guide', 'en')).toBe('/guide')
    expect(i18n.getLocaleFromPath('/fr/x')).toBe('fr')
  })

  it('syncs locale and route from path', async () => {
    const { enhanceApp, i18n } = createI18n({
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

  it('keeps root index route when path has no page dictionary', async () => {
    const { enhanceApp, i18n } = createI18n({
      locale: 'en',
      defaultLocale: 'en',
      locales: [{ code: 'en' }, { code: 'fr' }],
      messages: {
        en: { hi: 'Hi' },
        fr: { hi: 'Salut' },
      },
      base: '/docs/',
    })

    const app = {
      use: vi.fn(),
      provide: vi.fn(),
      config: { globalProperties: {} as Record<string, unknown> },
      component: vi.fn(),
    }

    let after: ((to: string) => unknown) | undefined
    const router = {
      route: { path: '/docs/fr/api/users' },
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
    expect(i18n.getRoute()).toBe('index')
    expect(i18n.ts('hi')).toBe('Salut')

    await after?.('/docs/api/users')
    expect(i18n.getLocale()).toBe('en')
    expect(i18n.getRoute()).toBe('index')
    expect(i18n.ts('hi')).toBe('Hi')
  })

  it('re-chains onAfterRouteChange after later enhanceApp overwrites', async () => {
    const { enhanceApp, i18n } = createI18n({
      locale: 'en',
      defaultLocale: 'en',
      locales: [{ code: 'en' }, { code: 'fr' }],
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

  it('installs the plugin on every Vue app', () => {
    const { enhanceApp } = createI18n({
      locale: 'en',
      defaultLocale: 'en',
      locales: [{ code: 'en' }, { code: 'fr' }],
      messages: { en: { hi: 'Hi' }, fr: { hi: 'Salut' } },
      syncWithVitePress: false,
    })

    const makeApp = () => ({
      use: vi.fn(),
      provide: vi.fn(),
      config: { globalProperties: {} as Record<string, unknown> },
      component: vi.fn(),
    })

    const makeRouter = (path: string) => ({
      route: { path },
      go: vi.fn(),
      onAfterRouteChange: undefined as ((to: string) => unknown) | undefined,
    })

    const app1 = makeApp()
    const app2 = makeApp()
    enhanceApp({ app: app1 as never, router: makeRouter('/') as never })
    enhanceApp({ app: app2 as never, router: makeRouter('/fr/') as never })

    expect(app1.use).toHaveBeenCalledTimes(1)
    expect(app2.use).toHaveBeenCalledTimes(1)
  })

  it('does not re-set routing strategy on re-enhance (avoids clobbering other apps)', () => {
    const i18n = createI18n({
      locale: 'en',
      defaultLocale: 'en',
      locales: [{ code: 'en' }, { code: 'fr' }],
      messages: { en: { hi: 'Hi' }, fr: { hi: 'Salut' } },
      syncWithVitePress: false,
    })
    const setSpy = vi.spyOn(i18n, 'setRoutingStrategy')
    const { enhanceApp } = i18n

    const makeApp = () => ({
      use: vi.fn(),
      provide: vi.fn(),
      config: { globalProperties: {} as Record<string, unknown> },
      component: vi.fn(),
    })
    const makeRouter = (path: string) => ({
      route: { path },
      go: vi.fn(),
      onAfterRouteChange: undefined as ((to: string) => unknown) | undefined,
    })

    const app1 = makeApp()
    const app2 = makeApp()
    enhanceApp({ app: app1 as never, router: makeRouter('/') as never })
    enhanceApp({ app: app2 as never, router: makeRouter('/fr/') as never })
    const afterTwo = setSpy.mock.calls.length
    expect(afterTwo).toBe(2)

    enhanceApp({ app: app1 as never, router: makeRouter('/') as never })
    expect(setSpy.mock.calls.length).toBe(afterTwo)
  })
})
