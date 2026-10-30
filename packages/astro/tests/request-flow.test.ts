import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Locale } from '@i18n-micro/types'
import type { APIContext, AstroGlobal, MiddlewareNext } from 'astro'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import {
  AstroI18n,
  createAstroRouterAdapter,
  createI18n,
  createI18nMiddleware,
  detectLocale,
  getDefaultLocale,
  getI18n,
  getI18nProps,
  getLocale,
  getLocales,
  i18nIntegration,
  useI18n,
  useLocaleHead,
} from '../src'
import { loadTranslationsFromDir, loadTranslationsIntoI18n } from '../src/node'
import type { I18nRoutingStrategy } from '../src/router/types'

const locales: Locale[] = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'fr', iso: 'fr-FR', displayName: 'Français' },
  { code: 'de', iso: 'de-DE', seo: false },
  { code: 'ja', iso: 'ja-JP', disabled: true },
]
const codes = locales.map((l) => l.code)

let root: string
const write = (file: string, data: unknown) => {
  const full = join(root, file)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, typeof data === 'string' ? data : JSON.stringify(data))
}

// relative dates are measured against a frozen clock
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2025-06-01T12:00:00Z'))
  root = mkdtempSync(join(tmpdir(), 'i18n-astro-'))
  write('src/locales/en.json', { nav: { home: 'Home' }, title: 'Site', apples: 'no apples | one apple | {count} apples', hi: 'Hi, {name}' })
  write('src/locales/fr.json', { nav: { home: 'Accueil' }, title: 'Site FR' })
  write('src/locales/pages/about/en.json', { title: 'About', island: { cta: 'Buy' } })
  write('src/locales/pages/about/fr.json', { title: 'À propos', island: { cta: 'Acheter', more: 'Plus' } })
  write('src/locales/pages/blog/post/en.json', { title: 'Post' })
  write('src/locales/broken.json', '{')
  write('src/locales/readme.md', '# not a locale')
})

afterEach(() => {
  vi.useRealTimers()
  rmSync(root, { recursive: true, force: true })
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

interface Ctx {
  url: URL
  request: Request
  cookies: { get: (name: string) => { value: string } | undefined }
  locals: Partial<App.Locals>
}

/** Run one request through the middleware the way Astro does (no cookie, no Accept-Language); returns what the page sees. */
async function request(mw: ReturnType<typeof createI18nMiddleware>, path: string, locals: Partial<App.Locals> = {}) {
  const url = new URL(`http://site.test${path}`)
  const ctx: Ctx = { url, request: new Request(url), cookies: { get: () => undefined }, locals }
  const next = vi.fn(async () => new Response('ok'))
  const res = await mw(ctx as unknown as APIContext, next as unknown as MiddlewareNext)
  expect(res).toBeInstanceOf(Response)
  expect(next).toHaveBeenCalledTimes(1)
  const astro = { url: ctx.url, params: {}, locals: ctx.locals } as unknown as AstroGlobal
  return { astro, locals: ctx.locals as App.Locals }
}

test('integration publishes its config as a virtual module', () => {
  const integration = i18nIntegration({ locale: 'en', locales, translationDir: 'src/locales', localeCookie: 'lang', missingWarn: true })
  expect(integration.name).toBe('@i18n-micro/astro')

  const setup = (opts: Parameters<typeof i18nIntegration>[0]) => {
    const updateConfig = vi.fn()
    const it = i18nIntegration(opts)
    ;(it.hooks['astro:config:setup'] as (p: unknown) => void)({ updateConfig, addMiddleware: vi.fn(), config: { root: new URL('file:///app/'), base: '/' } })
    const plugin = updateConfig.mock.calls[0]![0].vite.plugins[0]
    expect(plugin.name).toBe('vite-plugin-i18n-micro-config')
    expect(plugin.resolveId('other')).toBeUndefined()
    const id = plugin.resolveId('virtual:i18n-micro/config')
    expect(id).toBe('\0virtual:i18n-micro/config')
    expect(plugin.load('virtual:i18n-micro/config')).toBeUndefined()
    const code: string = plugin.load(id)
    expect(code.startsWith('export const config = ')).toBe(true)
    return JSON.parse(code.slice('export const config = '.length))
  }

  expect(
    setup({
      locale: 'en',
      fallbackLocale: 'fr',
      locales,
      translationDir: 'src/locales',
      localeCookie: 'lang',
      missingWarn: true,
      autoDetect: false,
      redirectToDefault: true,
    }),
  ).toEqual({
    defaultLocale: 'en',
    fallbackLocale: 'fr',
    locales,
    localeCodes: ['en', 'fr', 'de'],
    translationDir: 'src/locales',
    autoDetect: false,
    redirectToDefault: true,
    localeCookie: 'lang',
    missingWarn: true,
    base: '',
  })
  expect(setup({ locale: 'de' })).toEqual({
    defaultLocale: 'de',
    fallbackLocale: 'de',
    locales: [],
    localeCodes: [],
    translationDir: null,
    autoDetect: true,
    redirectToDefault: false,
    localeCookie: 'i18n-locale',
    missingWarn: false,
    base: '',
  })
  expect(setup({ locale: 'en', localeCookie: null }).localeCookie).toBeNull()

  // options of the old integration fail loudly, a config without them keeps working
  for (const key of ['messages', 'plural', 'missingHandler', 'routingStrategy']) {
    expect(() => i18nIntegration({ locale: 'en', [key]: {} })).toThrow(`no longer takes "${key}"`)
  }
  expect(() => i18nIntegration({ locale: 'en', routingStrategy: undefined } as never)).not.toThrow()

  const injectTypes = vi.fn()
  ;(integration.hooks['astro:config:done'] as (p: unknown) => void)({ injectTypes })
  const { filename, content } = injectTypes.mock.calls[0]![0]
  expect(filename).toBe('i18n-micro-env.d.ts')
  expect(content).toContain('/// <reference types="@i18n-micro/astro/env" />')
  expect(content).toContain("declare module 'virtual:i18n-micro/config'")
  expect(content).toContain('localeCookie: string | null;')
})

test('the integration installs the middleware; with `middleware: false` Astro learns the locales instead', () => {
  const hook = (options: Parameters<typeof i18nIntegration>[0], config: Record<string, unknown> = {}) => {
    const updateConfig = vi.fn()
    const addMiddleware = vi.fn()
    const setup = i18nIntegration(options).hooks['astro:config:setup'] as (params: unknown) => void
    setup({ updateConfig, addMiddleware, config: { root: new URL('file:///app/'), base: '/', ...config } })
    return { update: updateConfig.mock.calls[0]![0], addMiddleware }
  }

  const auto = hook({ locale: 'en', locales })
  expect(auto.addMiddleware).toHaveBeenCalledWith({ order: 'pre', entrypoint: '@i18n-micro/astro/middleware' })
  expect(auto.update.i18n).toBeUndefined()
  expect(auto.update.vite.ssr.noExternal).toEqual(['@i18n-micro/astro'])

  const manual = hook({ locale: 'en', locales, middleware: false })
  expect(manual.addMiddleware).not.toHaveBeenCalled()
  expect(manual.update.i18n).toEqual({ locales: ['en', 'fr', 'de'], defaultLocale: 'en', routing: 'manual' })
  // the site's own i18n config stays, and Astro requires the default locale among the locales
  expect(hook({ locale: 'en', locales, middleware: false }, { i18n: {} }).update.i18n).toBeUndefined()
  expect(hook({ locale: 'ja', locales, middleware: false }).update.i18n).toBeUndefined()
})

test('the virtual modules: the base without its slash, the dictionaries as code', async () => {
  const load = async (options: Parameters<typeof i18nIntegration>[0], base = '/') => {
    const updateConfig = vi.fn()
    const setup = i18nIntegration(options).hooks['astro:config:setup'] as (params: unknown) => void
    setup({ updateConfig, addMiddleware: vi.fn(), config: { root: pathToFileURL(`${root}/`), base } })
    const plugin = updateConfig.mock.calls[0]![0].vite.plugins[0]
    const addWatchFile = vi.fn()
    return {
      addWatchFile,
      config: JSON.parse(plugin.load.call({ addWatchFile }, '\0virtual:i18n-micro/config').slice('export const config = '.length)),
      messages: JSON.parse((await plugin.load.call({ addWatchFile }, '\0virtual:i18n-micro/messages')).slice('export const messages = '.length)),
    }
  }
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const { config, messages, addWatchFile } = await load({ locale: 'en', translationDir: 'src/locales' }, '/docs')
  expect(addWatchFile).toHaveBeenCalledWith(join(root, 'src/locales/en.json'))
  expect(config.base).toBe('/docs')
  expect(messages.root.en.title).toBe('Site')
  expect(messages.routes['blog-post'].en).toEqual({ title: 'Post' })
  expect((await load({ locale: 'en' })).messages).toEqual({ root: {}, routes: {} })
  expect((await load({ locale: 'en', translationDir: 'src/locales', disablePageLocales: true })).messages.routes).toEqual({})
})

test('a site loads its locales dir; requests through the middleware get a per-request i18n and page helpers', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const site = createI18n({ locale: 'en', fallbackLocale: 'en', messages: {}, missingWarn: false })
  expect(site).toBeInstanceOf(AstroI18n)
  loadTranslationsIntoI18n(site, { translationDir: 'src/locales', rootDir: root })
  expect(error).toHaveBeenCalledTimes(1)
  expect(error.mock.calls[0]![0]).toBe(`[i18n] Failed to load translation file: ${join(root, 'src/locales/broken.json')}`)

  const mw = createI18nMiddleware({
    i18n: site,
    defaultLocale: 'en',
    locales: codes,
    localeObjects: locales,
    routingStrategy: createAstroRouterAdapter(locales, 'en'),
  })

  // 1. /fr/about?tab=2 — locale from the prefix, page translations, strategy visible to the page
  const fr = await request(mw, '/fr/about?tab=2')
  expect(fr.locals.locale).toBe('fr')
  expect(fr.locals.defaultLocale).toBe('en')
  expect(fr.locals.locales).toBe(locales)
  expect(fr.locals.currentUrl.pathname).toBe('/fr/about')
  expect(fr.locals.routingStrategy!.getCurrentPath()).toBe('/fr/about')
  expect(fr.locals.routingStrategy!.getRoute!()).toEqual({ fullPath: '/fr/about?tab=2', query: { tab: '2' } })
  expect(getI18n(fr.astro)).toBe(fr.locals.i18n)
  expect(fr.locals.i18n).not.toBe(site)
  expect(getLocale(fr.astro)).toBe('fr')
  expect(getDefaultLocale(fr.astro)).toBe('en')
  expect(getLocales(fr.astro)).toBe(locales)

  const page = useI18n(fr.astro)
  expect(page.locale).toBe('fr')
  expect(page.defaultLocale).toBe('en')
  expect(page.getRoute()).toBe('about')
  expect(page.t('title')).toBe('À propos')
  expect(page.t('nav.home')).toBe('Accueil')
  // a route with no fr file: the fr root wins over the en page
  expect(page.t('title', undefined, undefined, 'blog-post')).toBe('Site FR')
  expect(page.ts('missing', undefined, 'Fallback')).toBe('Fallback')
  expect(page.t('hi', { name: 'Zoé' })).toBe('Hi, Zoé')
  expect(page.tc('apples', 3)).toBe('3 apples')
  expect(page.tn(1234.5)).toBe('1\u202f234,5')
  expect(page.td(new Date(Date.UTC(2024, 0, 2)), { timeZone: 'UTC', dateStyle: 'short' })).toBe('02/01/2024')
  expect(page.tdr(Date.now() + 86_400_000 * 3 + 60_000)).toBe('dans 3 jours')
  expect(page.has('title')).toBe(true)
  expect(page.has('island.cta', 'index')).toBe(false)
  expect(page.getRouteName()).toBe('about')
  expect(page.getRouteName('/fr/blog/post/')).toBe('blog-post')
  expect(page.getLocaleFromPath()).toBe('fr')
  expect(page.getLocaleFromPath('/xx/about')).toBe('en')
  expect(page.switchLocalePath('en')).toBe('/about')
  expect(page.switchLocalePath('de')).toBe('/de/about')
  expect(page.localizePath('/fr/contact/')).toBe('/fr/contact/')
  expect(page.localizePath('/contact', 'en')).toBe('/contact')
  expect(page.getBasePath()).toBe('/about')
  expect(page.getBasePath(new URL('http://site.test/fr'))).toBe('/')
  expect(page.getI18n()).toBe(fr.locals.i18n)

  // islands get only the keys they ask for, nested back into objects
  expect(getI18nProps(fr.astro, ['island.cta', 'title', 'island.more', 'nope'])).toEqual({
    locale: 'fr',
    fallbackLocale: 'en',
    currentRoute: 'about',
    translations: { about: { island: { cta: 'Acheter', more: 'Plus' }, title: 'À propos' } },
  })
  expect(getI18nProps(fr.astro, ['nope']).translations).toEqual({ about: {} })
  expect(getI18nProps(fr.astro, []).translations).toEqual(getI18nProps(fr.astro).translations)
  // no keys: what `t()` answers on this page, root and fallback keys too
  expect(getI18nProps(fr.astro).translations.about).toMatchObject({
    title: 'À propos',
    island: { cta: 'Acheter', more: 'Plus' },
    nav: { home: 'Accueil' },
    hi: 'Hi, {name}',
  })

  // SEO head: disabled locales dropped, seo:false kept out of alternates, x-default → default locale
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  expect(useLocaleHead(fr.astro, { baseUrl: 'https://site.test' })).toEqual({
    htmlAttrs: { lang: 'fr-FR', dir: 'auto' },
    link: [
      { id: 'i18n-can', rel: 'canonical', href: 'https://site.test/fr/about' },
      { id: 'i18n-alternate-en-US', rel: 'alternate', href: 'https://site.test/about', hreflang: 'en-US' },
      { id: 'i18n-alternate-fr-FR', rel: 'alternate', href: 'https://site.test/fr/about', hreflang: 'fr-FR' },
      { id: 'i18n-xd', rel: 'alternate', href: 'https://site.test/about', hreflang: 'x-default' },
    ],
    meta: [
      { id: 'i18n-og', property: 'og:locale', content: 'fr_FR' },
      { id: 'i18n-og-url', property: 'og:url', content: 'https://site.test/fr/about' },
      { id: 'i18n-og-alt-en_US', property: 'og:locale:alternate', content: 'en_US' },
    ],
  })
  expect(useLocaleHead(fr.astro, { hreflangBaseLanguage: true }).link.map((l) => l.hreflang)).toEqual([
    undefined,
    'en',
    'en-US',
    'fr',
    'fr-FR',
    'x-default',
  ])
  expect(useLocaleHead(fr.astro, { addSeoAttributes: false, addDirAttribute: false })).toEqual({ htmlAttrs: { lang: 'fr-FR' }, link: [], meta: [] })
  expect(warn).not.toHaveBeenCalled()

  // per-request writes stay in the request; clearCache drops them
  page.addTranslations('fr', { extra: 'Extra' })
  fr.locals.i18n.addTranslations('fr', { extra2: 'E2' })
  fr.locals.i18n.addRouteTranslations('fr', 'about', { cta2: 'C2' })
  // writes merge by default: earlier keys survive
  expect([page.t('nav.home'), page.t('extra2'), page.t('island.cta'), page.t('cta2')]).toEqual(['Accueil', 'E2', 'Acheter', 'C2'])
  page.addRouteTranslations('fr', 'about', { title: 'Nouveau' })
  page.mergeTranslations('fr', 'about', { more: 'Plus' })
  expect([page.t('extra'), page.t('title'), page.t('more')]).toEqual(['Extra', 'Nouveau', 'Plus'])
  site.locale = 'fr'
  expect(site.t('extra')).toBe('extra')
  page.clearCache()
  expect(page.t('title')).toBe('title')
  expect(page.t('more')).toBe('more')

  // 2. /about — no prefix → default locale; a fresh clone does not see request 1's writes
  const en = await request(mw, '/about')
  expect(en.locals.locale).toBe('en')
  expect(en.locals.i18n.t('title')).toBe('About')
  expect(en.locals.i18n.t('extra')).toBe('extra')
  expect(useLocaleHead(en.astro).link[0]).toEqual({ id: 'i18n-can', rel: 'canonical', href: '/about' })

  // locale without an instance is not a rewrite: detection runs again
  expect((await request(mw, '/fr/about', { locale: 'de' })).locals.locale).toBe('fr')

  // x-default is left out when the default locale opts out of SEO
  const deDefault = { ...fr.astro, locals: { ...fr.locals, defaultLocale: 'de' } } as unknown as AstroGlobal
  expect(useLocaleHead(deDefault).link.map((l) => l.hreflang)).toEqual([undefined, 'en-US', 'fr-FR'])

  // 3. Astro.rewrite: locals already set → middleware passes through untouched
  const kept = await request(mw, '/de/x', { locale: 'fr', i18n: fr.locals.i18n })
  expect(kept.locals.locale).toBe('fr')
  expect(kept.locals.routingStrategy).toBeUndefined()

  // 4. unknown locale in locals → head is empty, page helper defaults apply
  const bare = { url: new URL('http://site.test/'), params: {}, locals: {} } as unknown as AstroGlobal
  expect(useLocaleHead({ ...bare, locals: { locale: 'xx', defaultLocale: 'en', locales } } as unknown as AstroGlobal)).toEqual({ htmlAttrs: {}, link: [], meta: [] })
  expect(getLocales(bare)).toEqual([])
  for (const read of [getI18n, getLocale, getDefaultLocale]) expect(() => read(bare)).toThrow('i18n instance not found. Make sure i18n middleware is configured.')
})

test('without a routing strategy the middleware and helpers fall back to plain path parsing', async () => {
  const site = new AstroI18n({ locale: 'en', messages: { en: { a: 'A' }, fr: { a: 'Afr' } }, missingWarn: false })
  const mw = createI18nMiddleware({ i18n: site, defaultLocale: 'en', locales: ['en', 'fr'] })

  const home = await request(mw, '/')
  expect(home.locals.i18n.getRoute()).toBe('index')
  expect(home.locals.locales).toEqual([{ code: 'en' }, { code: 'fr' }])

  const post = await request(mw, '/fr/blog/post')
  // the plain fallback still reads the locale prefix, and the route name drops it like useI18n does
  expect(post.locals.locale).toBe('fr')
  expect(post.locals.i18n.getRoute()).toBe('blog-post')
  expect(post.locals.currentUrl.pathname).toBe('/fr/blog/post')

  const page = useI18n(post.astro)
  expect(page.getRouteName()).toBe('blog-post')
  expect(page.getRouteName('/fr/')).toBe('index')
  expect(page.getRouteName('/')).toBe('index')
  expect(page.getLocaleFromPath()).toBe('fr')
  expect(page.getLocaleFromPath('/blog')).toBe('en')
  expect(page.switchLocalePath('en')).toBe('/blog/post')
  expect(page.switchLocalePath('fr')).toBe('/fr/blog/post')
  expect(page.localizePath('/fr/x/', 'en')).toBe('/x/')
  expect(page.localizePath('/x', 'fr')).toBe('/fr/x')
  expect(page.localizePath('/x')).toBe('/fr/x')
  expect(page.getRouteName('/blog/x')).toBe('blog-x')
  expect(page.localizePath('/blog/x', 'fr')).toBe('/fr/blog/x')

  const astro = {
    url: new URL('http://site.test/fr/blog'),
    locals: {
      ...post.locals,
      locale: 'fr',
      locales: [
        { code: 'en', iso: 'en-US' },
        { code: 'fr', iso: 'fr', dir: 'ltr' },
      ],
    },
  } as unknown as AstroGlobal
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  expect(useLocaleHead(astro)).toEqual({
    htmlAttrs: { lang: 'fr', dir: 'ltr' },
    link: [
      { id: 'i18n-can', rel: 'canonical', href: '/fr/blog/post' },
      { id: 'i18n-alternate-en-US', rel: 'alternate', href: '/blog/post', hreflang: 'en-US' },
      { id: 'i18n-alternate-fr', rel: 'alternate', href: '/fr/blog/post', hreflang: 'fr' },
      { id: 'i18n-xd', rel: 'alternate', href: '/blog/post', hreflang: 'x-default' },
    ],
    meta: [
      { id: 'i18n-og-url', property: 'og:url', content: '/fr/blog/post' },
      { id: 'i18n-og-alt-en_US', property: 'og:locale:alternate', content: 'en_US' },
    ],
  })
  // `fr` has no region → no og:locale, a dev warning instead
  expect(warn).toHaveBeenCalledTimes(1)
  expect(warn.mock.calls[0]![0]).toContain("Cannot derive og:locale for locale 'fr'")

  // same page in the default locale (no prefix): the region-less fr only gets a warning as an alternate
  const enAstro = {
    url: new URL('http://site.test/blog'),
    locals: { ...astro.locals, locale: 'en', currentUrl: new URL('http://site.test/blog') },
  } as unknown as AstroGlobal
  expect(useLocaleHead(enAstro).link.map(({ href, hreflang }) => [href, hreflang])).toEqual([
    ['/blog', undefined],
    ['/blog', 'en-US'],
    ['/fr/blog', 'fr'],
    ['/blog', 'x-default'],
  ])
  expect(warn.mock.calls[1]![0]).toContain("Cannot derive og:locale:alternate for locale 'fr'")
  const enPage = useI18n(enAstro)
  expect([enPage.switchLocalePath('fr'), enPage.getBasePath(), enPage.getRouteName('/blog')]).toEqual(['/fr/blog', '/blog', 'blog'])
})

test('a custom routing strategy decides locale, route name and every link the page builds', async () => {
  const site = new AstroI18n({ locale: 'en', messages: { en: { a: 'A' }, de: { a: 'Ade' } }, missingWarn: false })
  expect([site.getRoute(), site.getFallbackLocale(), site.fallbackLocale]).toEqual(['index', 'en', 'en'])
  site.fallbackLocale = 'de'
  expect(site.getFallbackLocale()).toBe('de')
  // a strategy that maps everything unprefixed to `de` and builds `/~locale` links
  const strategy: I18nRoutingStrategy = {
    getCurrentPath: () => '/',
    getLocaleFromPath: () => 'de',
    getRouteName: (path) => `r${path.replace(/\//g, '_')}`,
    switchLocalePath: (path, loc) => `/~${loc}${path}`,
    localizePath: (path, loc) => `/~${loc}${path}`,
  }
  const mw = createI18nMiddleware({ i18n: site, defaultLocale: 'en', locales: ['en', 'fr', 'de'], localeObjects: locales, routingStrategy: strategy })

  // a real prefix still wins over the strategy
  const fr = await request(mw, '/fr/x')
  expect([fr.locals.locale, fr.locals.i18n.getRoute()]).toEqual(['fr', 'r_fr_x'])
  const de = await request(mw, '/x')
  expect([de.locals.locale, de.locals.i18n.t('a')]).toEqual(['de', 'Ade'])

  const page = useI18n(de.astro)
  expect([
    page.getRouteName('/x'),
    page.getLocaleFromPath(),
    page.switchLocalePath('fr'),
    page.localizePath('/y'),
    page.localizePath('/y', 'fr'),
  ]).toEqual(['r_x', 'de', '/~fr/x', '/~de/y', '/~fr/y'])
  expect(useLocaleHead(de.astro, { baseUrl: 'B' }).link.map((l) => l.href)).toEqual(['B/x', 'B/~en/x', 'B/~fr/x', 'B/~en/x'])

  // the bare adapter tolerates a path without its leading slash, or with two
  const adapter = createAstroRouterAdapter(locales, 'en')
  expect(['fr/about', '//fr/about'].map((path) => adapter.getLocaleFromPath!(path, 'en', ['en', 'fr']))).toEqual(['fr', 'fr'])

  // a strategy with no getLocaleFromPath / getRouteName → the plain path parsing (prefix, route from the path)
  const bare = createI18nMiddleware({ i18n: site, defaultLocale: 'en', locales: ['en', 'fr'], routingStrategy: { getCurrentPath: () => '/' } })
  const res = await request(bare, '/x/y')
  expect([res.locals.locale, res.locals.i18n.getRoute()]).toEqual(['en', 'x-y'])
  const prefixed = await request(bare, '/fr/x/y')
  expect([prefixed.locals.locale, prefixed.locals.i18n.getRoute()]).toEqual(['fr', 'x-y'])
})

test('detectLocale: path, then cookie, then Accept-Language, else default', () => {
  const jar = (value?: string) => ({ get: (name: string) => (name === 'lang' && value ? { value } : undefined) })
  const headers = (al?: string) => new Headers(al ? { 'accept-language': al } : {})
  const L = ['en', 'fr', 'de']

  expect(detectLocale('/fr/x', jar('de'), headers('de'), 'en', L, 'lang')).toBe('fr')
  expect(detectLocale('/x', jar('de'), headers('fr'), 'en', L, 'lang')).toBe('de')
  expect(detectLocale('/x', jar('xx'), headers('fr-FR,fr;q=0.9'), 'en', L, 'lang')).toBe('fr')
  // default cookie name; localeCookie: null ignores the cookie
  expect(detectLocale('/x', { get: (n) => (n === 'i18n-locale' ? { value: 'de' } : undefined) }, headers(), 'en', L)).toBe('de')
  expect(detectLocale('/x', jar('de'), headers(), 'en', L, null)).toBe('en')
  expect(detectLocale('/', jar(), headers('ja'), 'en', L, 'lang')).toBe('en')
  // headers unavailable (static build) → default
  const throwing = {
    get: () => {
      throw new Error('static')
    },
  } as unknown as Headers
  expect(detectLocale('/x', jar(), throwing, 'en', L, 'lang')).toBe('en')

  // a strategy maps unprefixed paths; a literal prefix stays explicit
  const strategy: I18nRoutingStrategy = { getCurrentPath: () => '/', getLocaleFromPath: () => 'de' }
  expect(detectLocale('/x', jar(), headers(), 'en', L, 'lang', strategy)).toBe('de')
  expect(detectLocale('/fr/x', jar(), headers(), 'en', L, 'lang', strategy)).toBe('fr')
  // a strategy without getLocaleFromPath → first-segment parsing
  expect(detectLocale('/fr/x', jar(), headers(), 'en', L, 'lang', { getCurrentPath: () => '/' })).toBe('fr')
})

test('loadTranslationsFromDir: nested pages, disablePageLocales, cwd default, missing dir', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const split = loadTranslationsFromDir({ translationDir: 'src/locales', rootDir: root })
  expect(Object.keys(split.root).sort()).toEqual(['en', 'fr'])
  expect(split.routes).toEqual({
    about: { en: { title: 'About', island: { cta: 'Buy' } }, fr: { title: 'À propos', island: { cta: 'Acheter', more: 'Plus' } } },
    'blog-post': { en: { title: 'Post' } },
  })

  const folded = loadTranslationsFromDir({ translationDir: join(root, 'src/locales'), disablePageLocales: true })
  expect(folded.routes).toEqual({})
  expect(folded.root.fr).toEqual({ nav: { home: 'Accueil' }, title: 'À propos', island: { cta: 'Acheter', more: 'Plus' } })

  vi.spyOn(process, 'cwd').mockReturnValue(root)
  expect(loadTranslationsFromDir({ translationDir: 'src/locales' }).routes).toEqual(split.routes)
  expect(loadTranslationsFromDir({ translationDir: 'nope' })).toEqual({ root: {}, routes: {} })
  expect(warn).toHaveBeenCalledWith(`[i18n] Translation directory not found: ${join(root, 'nope')}`)
})

test('router adapter outside a request reads the browser location, or `/` on the server', () => {
  const server = createAstroRouterAdapter(locales, 'en')
  expect(server.getCurrentPath()).toBe('/')
  expect(server.getRoute!()).toEqual({ fullPath: '/', query: {} })
  expect(server.resolvePath!('/fr/about', 'fr')).toBe('/fr/about')
  expect(server.resolvePath!({ path: '/about' }, 'en')).toBe('/about')
  expect(server.resolvePath!({}, 'de')).toBe('/de')
  expect(server.removeLocaleFromPath!('/fr/a/b', codes)).toBe('/a/b')
  expect(server.removeLocaleFromPath!('/a/b', codes)).toBe('/a/b')
  expect(server.getRouteName!('/fr', codes)).toBe('index')
  expect(server.getRouteName!('/fr/a', [])).toBe('fr-a')
  expect(server.getLocaleFromPath!('/fr/a', 'en', [])).toBe('en')
  // no default given → the locale prefix is always added
  expect(server.switchLocalePath!('/fr/a', 'en', codes)).toBe('/en/a')
  expect(server.localizePath!('/a', 'en', codes)).toBe('/en/a')
  server.push!({ path: '/x' })
  server.replace!({ path: '/x' })

  const fixed = createAstroRouterAdapter(locales, 'en', () => new URL('http://site.test/fr/a?q=1&r=2'))
  expect(fixed.getCurrentPath()).toBe('/fr/a')
  expect(fixed.getRoute!()).toEqual({ fullPath: '/fr/a?q=1&r=2', query: { q: '1', r: '2' } })

  const location = { pathname: '/de/b', href: 'http://site.test/de/b?z=9', replace: vi.fn() }
  vi.stubGlobal('window', { location })
  const browser = createAstroRouterAdapter(locales, 'en')
  expect(browser.getCurrentPath()).toBe('/de/b')
  expect(browser.getRoute!()).toEqual({ fullPath: '/de/b?z=9', query: { z: '9' } })
  browser.push!({ path: '/fr/b' })
  expect(location.href).toBe('/fr/b')
  browser.replace!({ path: '/en/b' })
  expect(location.replace).toHaveBeenCalledWith('/en/b')
})
