/**
 * Characterization of @i18n-micro/astro's public API: every call is one `call → result` line, a
 * behaviour change is a one-line diff in `__golden__/astro.md`. A request goes through the real
 * middleware; `.astro` components run in the SSR test (`tests/publish`).
 */
import type { AstroGlobal } from 'astro'
import { afterAll, beforeAll, expect, test, vi } from 'vitest'
import { Recorder, show } from '../../../core/tests/characterization/record'
import * as api from '../../src'
import { hasTranslation, type I18nState, translate, translatePlural } from '../../src/client/core'

const NOW = Date.UTC(2024, 5, 15, 12, 0, 0)

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
})
afterAll(() => vi.useRealTimers())

const locales = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
  { code: 'ar', iso: 'ar-EG', dir: 'rtl' as const },
  { code: 'fr', iso: 'fr-FR', disabled: true },
]
const codes = locales.map((locale) => locale.code)

const messages = (): Record<string, Record<string, unknown>> => ({
  en: { hello: 'Hello', title: 'Root title', apples: 'no apples | one apple | {count} apples', a: { b: 'AB' }, only: 'en only', hi: 'Hi {name}' },
  de: { hello: 'Hallo', a: { b: 'DE AB' } },
})

function site() {
  const i18n = api.createI18n({ locale: 'en', fallbackLocale: 'en', messages: messages(), missingWarn: false })
  i18n.addRouteTranslations('en', 'about', { title: 'About', island: { cta: 'Buy' } })
  i18n.addRouteTranslations('de', 'about', { title: 'Über' })
  return i18n
}

interface Init {
  cookie?: string
  acceptLanguage?: string
  prerendered?: boolean
  routePattern?: string
  params?: Record<string, string>
  referer?: string
}

function context(path: string, init: Init) {
  const headers = new Headers()
  if (init.acceptLanguage) headers.set('accept-language', init.acceptLanguage)
  if (init.referer) headers.set('referer', init.referer)
  const written: Record<string, string> = {}
  return {
    written,
    url: new URL(`http://site.test${path}`),
    locals: {} as Record<string, unknown>,
    params: init.params ?? {},
    routePattern: init.routePattern,
    isPrerendered: init.prerendered ?? false,
    request: { headers },
    cookies: {
      get: (name: string) => (name === 'i18n-locale' && init.cookie ? { value: init.cookie } : undefined),
      set: (name: string, value: string) => {
        written[name] = value
      },
    },
    redirect: (location: string, status: number) => new Response(null, { status, headers: { Location: location } }),
  }
}

type Middleware = ReturnType<typeof api.createI18nMiddleware>

async function hit(rec: Recorder, handler: Middleware, path: string, init: Init = {}) {
  const ctx = context(path, init)
  const response = (await handler(ctx as never, async () => new Response('page'))) as Response
  const i18n = ctx.locals.i18n as ReturnType<typeof api.createI18n> | undefined
  rec.value(`GET ${path} ${show(init)}`, {
    status: response.status,
    location: response.headers.get('location'),
    vary: response.headers.get('vary'),
    locale: ctx.locals.locale,
    route: i18n?.getRoute(),
    cookie: ctx.written,
  })
  return { url: ctx.url, params: ctx.params, locals: ctx.locals } as unknown as AstroGlobal
}

const REQUESTS: Array<[string, Init?]> = [
  ['/'],
  ['/?a=1'],
  ['/de'],
  ['/de/'],
  ['/de/about'],
  ['/de/about/'],
  ['/ar/x/y'],
  ['/en/about'],
  ['/fr'],
  ['/fr/about'],
  ['/about'],
  ['/about/'],
  ['/deutsch'],
  ['/about', { cookie: 'de', acceptLanguage: 'de' }],
  ['/', { acceptLanguage: 'de' }],
  ['/', { acceptLanguage: 'de-DE,en;q=0.5' }],
  ['/', { acceptLanguage: 'fr' }],
  ['/', { acceptLanguage: 'ja' }],
  ['/', { cookie: 'de' }],
  ['/', { cookie: 'fr' }],
  ['/', { cookie: 'xx', acceptLanguage: 'de' }],
  ['/', { cookie: 'en', acceptLanguage: 'de' }],
  ['/', { acceptLanguage: 'de', prerendered: true }],
  ['/', { acceptLanguage: 'de', referer: 'http://site.test/de' }],
  ['/de', { cookie: 'en', referer: 'http://site.test/about' }],
  ['/de', { cookie: 'en', referer: 'https://elsewhere.test/about' }],
  ['/blog/hello', { routePattern: '/blog/[slug]', params: { slug: 'hello' } }],
  ['/de/blog/hello', { routePattern: '/[locale]/blog/[slug]', params: { locale: 'de', slug: 'hello' } }],
  ['/de/docs/a/b', { routePattern: '/de/docs/[...path]', params: { path: 'a/b' } }],
  ['/_server-islands/Late', { routePattern: '/_server-islands/[name]', params: { name: 'Late' }, referer: 'http://site.test/de/about' }],
  ['/_server-islands/Late', { routePattern: '/_server-islands/[name]', params: { name: 'Late' } }],
  ['/_actions/like', { routePattern: '/_actions/[...path]', params: { path: 'like' }, referer: 'http://site.test/de/about' }],
]

const STRATEGIES = {
  'no strategy': {},
  adapter: { routingStrategy: api.createAstroRouterAdapter(locales, 'en') },
}

function page(rec: Recorder, astro: AstroGlobal, label: string) {
  const i18n = api.useI18n(astro)
  rec.section(`helpers on ${label}`)
  rec.value('locale, default', [i18n.locale, i18n.defaultLocale, i18n.locales.length])
  rec.run('getRoute', () => i18n.getRoute())
  for (const path of [undefined, '/', '/de', '/de/', '/de/a/b', '/a/b/', '/fr/x']) rec.run(`getRouteName(${path})`, () => i18n.getRouteName(path))
  for (const path of [undefined, '/', '/de/x', '/ar', '/fr/x', '/x']) rec.run(`getLocaleFromPath(${path})`, () => i18n.getLocaleFromPath(path))
  for (const code of ['en', 'de', 'ar', 'fr']) rec.run(`switchLocalePath(${code})`, () => i18n.switchLocalePath(code))
  for (const [path, code] of [
    ['/', undefined],
    ['/', 'de'],
    ['/x', 'de'],
    ['/x/', 'de'],
    ['/de/x', 'en'],
    ['/x', 'en'],
    ['x', 'de'],
    ['/x?q=1#h', 'de'],
  ] as const)
    rec.run(`localizePath(${path}, ${code})`, () => i18n.localizePath(path, code))
  rec.run('getBasePath()', () => i18n.getBasePath())
  rec.run('getBasePath(/de/z)', () => i18n.getBasePath(new URL('http://site.test/de/z')))
  rec.run('getLocaleRewritePath', () => api.getLocaleRewritePath(astro))
  rec.run('t(title)', () => i18n.t('title'))
  rec.run('t(only)', () => i18n.t('only'))
  rec.run('t(a.b)', () => i18n.t('a.b'))
  rec.run('t(a)', () => i18n.t('a'))
  rec.run('has(a)', () => i18n.has('a'))
  rec.run('tc(apples, 2)', () => i18n.tc('apples', 2))
  rec.run('tn', () => i18n.tn(1234.5))
  rec.run('td', () => i18n.td(NOW, { timeZone: 'UTC' }))
  rec.run('tdr', () => i18n.tdr(NOW + 3_600_000))
  rec.section(`head on ${label}`)
  rec.run('useLocaleHead()', () => api.useLocaleHead(astro))
  rec.run('useLocaleHead(baseUrl)', () => api.useLocaleHead(astro, { baseUrl: 'https://site.test' }))
  rec.run('useLocaleHead(no seo)', () => api.useLocaleHead(astro, { addSeoAttributes: false, addDirAttribute: false }))
  rec.section(`props on ${label}`)
  rec.run('getI18nProps()', () => api.getI18nProps(astro))
  rec.run('getI18nProps([])', () => api.getI18nProps(astro, []))
  rec.run('getI18nProps(keys)', () => api.getI18nProps(astro, ['title', 'a.b', 'only', 'nope', 'island.cta']))
  rec.run('getI18nProps(a, a.b)', () => api.getI18nProps(astro, ['a', 'a.b']))
}

async function report(): Promise<string> {
  const rec = new Recorder()
  for (const [name, strategy] of Object.entries(STRATEGIES)) {
    rec.section(`requests, ${name}`)
    const handler = api.createI18nMiddleware({ i18n: site(), defaultLocale: 'en', locales: codes, localeObjects: locales, ...strategy })
    for (const [path, init] of REQUESTS) await hit(rec, handler, path, init)
  }

  rec.section('requests, options')
  const options = { i18n: site(), defaultLocale: 'en', locales: codes, localeObjects: locales }
  await hit(rec, api.createI18nMiddleware({ ...options, autoDetect: false }), '/', { acceptLanguage: 'de' })
  await hit(rec, api.createI18nMiddleware({ ...options, localeCookie: null }), '/', { cookie: 'de' })
  await hit(rec, api.createI18nMiddleware({ ...options, redirectToDefault: true }), '/')

  const handler = api.createI18nMiddleware({ ...options, routingStrategy: api.createAstroRouterAdapter(locales, 'en') })
  page(rec, await hit(rec, handler, '/de/about?x=1'), '/de/about?x=1')
  page(rec, await hit(rec, handler, '/about'), '/about')
  page(rec, await hit(rec, handler, '/ar/x'), '/ar/x')

  rec.section('rewrite')
  const astro = await hit(rec, handler, '/de/about')
  rec.run('prepareLocaleRewrite ok', () => api.prepareLocaleRewrite({ ...astro, params: { locale: 'ar' } } as AstroGlobal))
  rec.value('locals.locale', astro.locals.locale)
  rec.run('prepareLocaleRewrite bad', () => (api.prepareLocaleRewrite({ ...astro, params: { locale: 'xx' } } as AstroGlobal) as Response).status)
  rec.run('prepareLocaleRewrite disabled', () => {
    const answer = api.prepareLocaleRewrite({ ...astro, params: { locale: 'fr' } } as AstroGlobal)
    return answer instanceof Response ? answer.status : answer
  })

  rec.section('adapter')
  const adapter = api.createAstroRouterAdapter(locales, 'en')
  for (const path of ['/', '/de', '/de/a', '/a/b', 'a/b', '//de/a', '/a//b', '/a/']) {
    rec.run(`getRouteName(${path})`, () => adapter.getRouteName!(path, codes))
    rec.run(`getLocaleFromPath(${path})`, () => adapter.getLocaleFromPath!(path, 'en', codes))
    rec.run(`switchLocalePath(${path}, de)`, () => adapter.switchLocalePath!(path, 'de', codes, 'en'))
    rec.run(`switchLocalePath(${path}, en)`, () => adapter.switchLocalePath!(path, 'en', codes, 'en'))
    rec.run(`localizePath(${path}, de)`, () => adapter.localizePath!(path, 'de', codes, 'en'))
    rec.run(`removeLocaleFromPath(${path})`, () => adapter.removeLocaleFromPath!(path, codes))
    rec.run(`resolvePath(${path}, de)`, () => adapter.resolvePath!(path, 'de'))
  }

  rec.section('instance')
  const fork = (i18n: ReturnType<typeof site>, locale?: string) => {
    const instance = i18n as never as { fork?(locale?: string): typeof i18n; clone(locale?: string): typeof i18n }
    return instance.fork ? instance.fork(locale) : instance.clone(locale)
  }
  const root = site()
  const a = fork(root, 'de')
  const b = fork(root)
  rec.run('fork locale', () => [a.getLocale(), b.getLocale(), root.getLocale()])
  a.addTranslations('de', { own: 'own' })
  a.setRoute('about')
  rec.run('fork write stays', () => [a.t('own'), b.t('own'), root.t('own'), b.getRoute()])
  a.clearCache()
  rec.run('clearCache on a fork', () => [a.t('hello'), root.t('hello'), a.t('own')])
  rec.run('initial messages survive clearCache', () => {
    root.clearCache()
    return [root.t('hello'), root.t('title', undefined, undefined, 'about')]
  })
  rec.run('getRouteTranslations', () => root.getRouteTranslations?.('en', 'index'))

  rec.section('island core')
  const state = (): I18nState => ({
    locale: 'de',
    fallbackLocale: 'en',
    currentRoute: 'about',
    translations: { about: { title: 'Über', hi: 'Hi {name}', apples: 'keine | ein | {count} viele', o: { x: 'X' }, zero: 0, empty: '' } },
  })
  for (const key of ['title', 'o', 'o.x', 'zero', 'empty', 'nope', '', 'toString', '__proto__']) {
    rec.run(`translate(${key})`, () => translate(state(), key))
    rec.run(`translate(${key}, D)`, () => translate(state(), key, undefined, 'D'))
    rec.run(`has(${key})`, () => hasTranslation(state(), key))
  }
  rec.run('translate(hi, params)', () => translate(state(), 'hi', { name: 'Jo' }))
  for (const count of [0, 1, 2, 1.5]) rec.run(`tc(apples, ${count})`, () => translatePlural(state(), 'apples', count))
  return rec.toString()
}

test('astro characterization', async () => {
  await expect(await report()).toMatchFileSnapshot('./__golden__/astro.md')
})
