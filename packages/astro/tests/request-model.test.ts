import { describe, expect, test, vi } from 'vitest'
import { createAstroRouterAdapter, createI18n, createI18nMiddleware, getI18nProps, useI18n, useLocaleHead, type I18nRoutingStrategy } from '../src'
import { translatePlural, withLocale } from '../src/client/core'
import { resolveI18nT, resolveLinkHref } from '../src/utils'

const locales = [
  { code: 'en', iso: 'en-US' },
  { code: 'de', iso: 'de-DE' },
  { code: 'fr', iso: 'fr-FR', disabled: true },
]

function site() {
  return createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    missingWarn: false,
    messages: { en: { hello: 'Hello', fb: 'fallback', a: { b: 'AB' }, s: 'str' }, de: { hello: 'Hallo' } },
  })
}

interface Init {
  headers?: Record<string, string>
  cookie?: string
  routePattern?: string
  params?: Record<string, string>
  locals?: Record<string, unknown>
  method?: string
  /** What the route answers. */
  response?: () => Response
}

const htmlPage = () => new Response('<html></html>', { headers: { 'content-type': 'text/html; charset=utf-8' } })

function context(path: string, init: Init = {}) {
  const set = vi.fn()
  return {
    url: new URL(`http://site.test${path}`),
    locals: init.locals ?? ({} as Record<string, unknown>),
    params: init.params ?? {},
    routePattern: init.routePattern,
    isPrerendered: false,
    request: { headers: new Headers(init.headers), method: init.method ?? 'GET' },
    cookies: { get: () => (init.cookie ? { value: init.cookie } : undefined), set },
    redirect: (location: string, status: number) => new Response(null, { status, headers: { Location: location } }),
  }
}

async function run(path: string, init: Init = {}, options: Record<string, unknown> = {}, i18n = site()) {
  const handler = createI18nMiddleware({ i18n, defaultLocale: 'en', locales: ['en', 'de', 'fr'], localeObjects: locales, ...options })
  const ctx = context(path, init)
  const response = (await handler(ctx as never, async () => (init.response ?? htmlPage)())) as Response
  const astro = { url: ctx.url, locals: ctx.locals, params: ctx.params } as never
  return { ctx, response, astro, location: response.headers.get('location'), locals: ctx.locals as unknown as App.Locals }
}

describe('Astro base', () => {
  const options = { base: '/docs' }

  test('the locale and route come from the path without it', async () => {
    const { locals } = await run('/docs/de/about', {}, options)
    expect([locals.locale, locals.i18n.getRoute()]).toEqual(['de', 'about'])
    expect((await run('/docs', {}, options)).locals.i18n.getRoute()).toBe('index')
    expect((await run('/docs/', {}, options)).locals.locale).toBe('en')
  })

  test('the home redirect stays under it', async () => {
    expect((await run('/docs/', { headers: { 'accept-language': 'de' } }, options)).location).toBe('/docs/de')
    expect((await run('/docs?a=1', { headers: { 'accept-language': 'de' } }, options)).location).toBe('/docs/de?a=1')
  })

  test('a trailing slash in the option changes nothing', async () => {
    expect((await run('/docs/', { headers: { 'accept-language': 'de' } }, { base: '/docs/' })).location).toBe('/docs/de')
  })

  test('every URL a page builds carries it, what goes to Astro.rewrite does not', async () => {
    const { astro } = await run('/docs/de/about?q=1', {}, options)
    const page = useI18n(astro)
    expect(page.switchLocalePath('en')).toBe('/docs/about')
    expect(page.switchLocalePath('de')).toBe('/docs/de/about')
    expect(page.localizePath('/x')).toBe('/docs/de/x')
    expect(page.localizePath('/docs/x', 'en')).toBe('/docs/x')
    expect(page.getBasePath()).toBe('/about')
    expect(page.getRouteName('/docs/de/a/b')).toBe('a-b')
    expect(page.getLocaleFromPath('/docs/de/a')).toBe('de')
    expect(resolveLinkHref(astro, '/about', 'en')).toBe('/docs/about')
    expect(useLocaleHead(astro, { baseUrl: 'https://x.test' }).link.map((link) => link.href)).toEqual([
      'https://x.test/docs/de/about',
      'https://x.test/docs/about',
      'https://x.test/docs/de/about',
      'https://x.test/docs/about',
    ])
  })

  test('the home of the default locale is the base itself', async () => {
    const { astro } = await run('/docs/de', {}, options)
    expect(useI18n(astro).switchLocalePath('en')).toBe('/docs')
  })
})

describe('a visitor picks a locale', () => {
  const fromDe = { headers: { referer: 'http://site.test/de/about', 'accept-language': 'de' } }

  test('the switcher reaches the default home and the choice is remembered', async () => {
    const { response, ctx, location } = await run('/', fromDe)
    expect([response.status, location]).toEqual([200, null])
    expect(ctx.cookies.set).toHaveBeenCalledWith('i18n-locale', 'en', { path: '/', maxAge: 31536000, sameSite: 'lax' })
  })

  test('the next landing on / stays there: the cookie beats the header', async () => {
    const { location } = await run('/', { cookie: 'en', headers: { 'accept-language': 'de' } })
    expect(location).toBeNull()
  })

  test('another locale is remembered too, and the cookie lives under the base', async () => {
    const { ctx } = await run('/docs/de', { headers: { referer: 'http://site.test/docs/about' } }, { base: '/docs' })
    expect(ctx.cookies.set).toHaveBeenCalledWith('i18n-locale', 'de', { path: '/docs', maxAge: 31536000, sameSite: 'lax' })
  })

  test('a link from another site or within the locale is no choice', async () => {
    const landing = await run('/', { headers: { referer: 'https://other.test/de', 'accept-language': 'de' } })
    expect(landing.location).toBe('/de')
    expect(landing.ctx.cookies.set).not.toHaveBeenCalled()
    expect((await run('/de/x', { headers: { referer: 'http://site.test/de/y' } })).ctx.cookies.set).not.toHaveBeenCalled()
    expect((await run('/de', { headers: { referer: 'not a url' } })).ctx.cookies.set).not.toHaveBeenCalled()
  })

  test('localeCookie: null writes nothing but still does not bounce', async () => {
    const { ctx, location } = await run('/', fromDe, { localeCookie: null })
    expect(location).toBeNull()
    expect(ctx.cookies.set).not.toHaveBeenCalled()
  })
})

describe('only a page view is a choice', () => {
  const fromDe = { referer: 'http://site.test/de' }
  const cookieOf = async (path: string, init: Init) => (await run(path, init)).ctx.cookies.set

  test('an endpoint fetched from a page', async () => {
    const json = () => new Response('{}', { headers: { 'content-type': 'application/json' } })
    expect(await cookieOf('/api/ping', { headers: fromDe, response: json })).not.toHaveBeenCalled()
  })

  test('a prefetch of the switcher link', async () => {
    expect(await cookieOf('/ssr', { headers: { ...fromDe, 'sec-purpose': 'prefetch' } })).not.toHaveBeenCalled()
    expect(await cookieOf('/ssr', { headers: { ...fromDe, 'sec-purpose': 'prefetch;prerender' } })).not.toHaveBeenCalled()
  })

  test('an image, a 404, a POST, a redirect', async () => {
    const image = () => new Response('x', { headers: { 'content-type': 'image/webp' } })
    const notFound = () => new Response('<html></html>', { status: 404, headers: { 'content-type': 'text/html' } })
    const redirect = () => new Response(null, { status: 302, headers: { location: '/x', 'content-type': 'text/html' } })
    expect(await cookieOf('/_image', { headers: fromDe, response: image })).not.toHaveBeenCalled()
    expect(await cookieOf('/nothing', { headers: fromDe, response: notFound })).not.toHaveBeenCalled()
    expect(await cookieOf('/form', { headers: fromDe, method: 'POST' })).not.toHaveBeenCalled()
    expect(await cookieOf('/x', { headers: fromDe, response: redirect })).not.toHaveBeenCalled()
  })

  test('a served page is', async () => {
    expect(await cookieOf('/about', { headers: fromDe })).toHaveBeenCalledWith('i18n-locale', 'en', expect.anything())
  })

  test('behind a TLS proxy the browser vouches for the origin', async () => {
    const proxied = { referer: 'https://public.example/de', 'sec-fetch-site': 'same-origin' }
    expect(await cookieOf('/about', { headers: proxied })).toHaveBeenCalled()
    expect((await run('/', { headers: { ...proxied, 'accept-language': 'de' } })).location).toBeNull()
    expect(await cookieOf('/about', { headers: { ...proxied, 'sec-fetch-site': 'cross-site' } })).not.toHaveBeenCalled()
  })

  test('without that header the host decides: scheme may differ, another site may not', async () => {
    expect(await cookieOf('/about', { headers: { referer: 'https://site.test/de' } })).toHaveBeenCalled()
    expect(await cookieOf('/about', { headers: { referer: 'https://other.test/de' } })).not.toHaveBeenCalled()
  })
})

describe('only a page view is redirected', () => {
  test('a POST or an API answer at the home page stays', async () => {
    const { location } = await run('/', { method: 'POST', headers: { 'accept-language': 'de' } })
    expect(location).toBeNull()
  })
})

describe('disabled locales', () => {
  test('are no redirect target, by header or cookie', async () => {
    expect((await run('/', { headers: { 'accept-language': 'fr' } })).location).toBeNull()
    expect((await run('/', { cookie: 'fr' })).location).toBeNull()
  })

  test('are no locale of a URL, also when the middleware only got codes that include them', async () => {
    const { locals } = await run('/fr/about')
    expect(locals.locale).toBe('en')
  })
})

describe('route names', () => {
  test('one name per route pattern, whatever the URL', async () => {
    const dynamic = { routePattern: '/blog/[slug]', params: { slug: 'hello' } }
    expect((await run('/blog/hello', dynamic)).locals.i18n.getRoute()).toBe('blog-slug')
    const nested = { routePattern: '/[locale]/blog/[slug]', params: { locale: 'de', slug: 'x' } }
    expect((await run('/de/blog/x', nested)).locals.i18n.getRoute()).toBe('blog-slug')
    const spread = { routePattern: '/docs/[...path]', params: { path: 'a/b' } }
    expect((await run('/docs/a/b', spread)).locals.i18n.getRoute()).toBe('docs-path')
  })

  test('a first param that is no locale stays a part of the name', async () => {
    const init = { routePattern: '/[user]/posts', params: { user: 'ann' } }
    expect((await run('/ann/posts', init)).locals.i18n.getRoute()).toBe('user-posts')
  })

  test('a custom getRouteName gets the URL path, and the pattern to opt in', async () => {
    const getRouteName = vi.fn(() => 'custom')
    const routingStrategy = { getCurrentPath: () => '/', getRouteName }
    await run('/de/blog/x', { routePattern: '/[locale]/blog/[slug]', params: { locale: 'de', slug: 'x' } }, { routingStrategy })
    expect(getRouteName).toHaveBeenCalledWith('/de/blog/x', ['en', 'de'], '/de/blog/[slug]')
  })
})

describe('server islands and actions', () => {
  const island = { routePattern: '/_server-islands/[name]', params: { name: 'Late' } }

  test('render for the page that asked', async () => {
    const { locals, astro } = await run('/_server-islands/Late?e=1', { ...island, headers: { referer: 'http://site.test/de/about?x=1' } })
    expect([locals.locale, locals.i18n.getRoute(), locals.i18n.t('hello')]).toEqual(['de', 'about', 'Hallo'])
    expect(useI18n(astro).switchLocalePath('en')).toBe('/about')
  })

  test('under a base too', async () => {
    const { locals } = await run(
      '/docs/_server-islands/Late',
      { ...island, headers: { referer: 'http://site.test/docs/de/about' } },
      { base: '/docs' },
    )
    expect(locals.locale).toBe('de')
  })

  test('the page may be on another origin than the server sees: a TLS proxy in front of it', async () => {
    const { locals, ctx } = await run('/_server-islands/Late', { ...island, headers: { referer: 'https://public.example/de/about' } })
    expect(locals.locale).toBe('de')
    expect(locals.currentUrl.origin).toBe('http://site.test')
    expect(ctx.cookies.set).not.toHaveBeenCalled()
  })

  test.each([
    ['accept-language', { 'accept-language': 'de' }],
    ['no preference', {}],
  ])('on the home page they stay what they are: no redirect, %s', async (_name, headers) => {
    const { response, location } = await run('/_server-islands/Late', { ...island, headers: { referer: 'http://site.test/', ...headers } })
    expect([response.status, location]).toEqual([200, null])
    const cookie = await run('/_server-islands/Late', { ...island, cookie: 'de', headers: { referer: 'http://site.test/' } })
    expect(cookie.location).toBeNull()
    const redirected = await run('/_actions/like', { ...island, routePattern: '/_actions/[...path]', method: 'POST', headers: { referer: 'http://site.test/' } }, { redirectToDefault: true, routingStrategy: { getCurrentPath: () => '/', resolvePath: () => '/en' } })
    expect(redirected.location).toBeNull()
  })

  test('their answer depends on the Referer: shared caches key on it', async () => {
    const { response } = await run('/_server-islands/Late', { ...island, headers: { referer: 'http://site.test/de' } })
    expect(response.headers.get('vary')).toBe('Referer')
  })

  test('an action called from a page in another locale does not count as switching', async () => {
    const init = { routePattern: '/_actions/[...path]', params: { path: 'like' }, headers: { referer: 'http://site.test/de/about' } }
    const { locals, ctx } = await run('/_actions/like', init)
    expect(locals.locale).toBe('de')
    expect(ctx.cookies.set).not.toHaveBeenCalled()
  })
})

describe('routing strategies', () => {
  test('a class-based strategy keeps its prototype methods and `this`', async () => {
    class Suffix implements I18nRoutingStrategy {
      private readonly mark = '~'
      getCurrentPath() {
        return '/'
      }
      switchLocalePath(path: string, locale: string) {
        return `${path}${this.mark}${locale}`
      }
    }
    const { astro } = await run('/de/a', {}, { routingStrategy: new Suffix() })
    expect(useI18n(astro).switchLocalePath('en')).toBe('/de/a~en')
    // what the class leaves out comes from the default adapter
    expect(useI18n(astro).getBasePath()).toBe('/a')
  })

  test('a class with #private fields works: methods run on the instance itself', async () => {
    class Hash implements I18nRoutingStrategy {
      #mark = '~'
      getCurrentPath() {
        return '/'
      }
      switchLocalePath(path: string, locale: string) {
        return `${path}${this.#mark}${locale}`
      }
      getRouteName(path: string) {
        return `r${this.#mark}${path}`
      }
    }
    const { astro, locals } = await run('/de/a', {}, { routingStrategy: new Hash() })
    expect(useI18n(astro).switchLocalePath('en')).toBe('/de/a~en')
    expect(locals.i18n.getRoute()).toBe('r~/de/a')
  })

  test('a strategy answering a disabled or unknown locale does not reach the page', async () => {
    const { locals } = await run('/x', {}, { routingStrategy: { getCurrentPath: () => '/', getLocaleFromPath: () => 'fr' } })
    expect(locals.locale).toBe('en')
  })

  test('without the middleware the default routing applies', () => {
    const astro = {
      url: new URL('http://site.test/de/a'),
      locals: { i18n: site(), locale: 'de', defaultLocale: 'en', locales },
    } as never
    expect(useI18n(astro).switchLocalePath('en')).toBe('/a')
  })
})

describe('two middlewares', () => {
  test('a second one warns once that its options are lost', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const options = { i18n: site(), defaultLocale: 'en', locales: ['en'] }
    const first = createI18nMiddleware(options)
    const second = createI18nMiddleware(options)
    const ctx = context('/')
    await first(ctx as never, (async () => second(ctx as never, async () => new Response(''))) as never)
    await first(context('/') as never, async () => new Response(''))
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]![0]).toContain('middleware: false')
    warn.mockRestore()
  })

  test('Astro.rewrite through the same one is silent and keeps the locale', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const handler = createI18nMiddleware({ i18n: site(), defaultLocale: 'en', locales: ['en', 'de'] })
    const ctx = context('/de/x')
    await handler(ctx as never, (async () => handler({ ...ctx, url: new URL('http://site.test/x') } as never, async () => new Response(''))) as never)
    expect(ctx.locals.locale).toBe('de')
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})

describe('getI18nProps', () => {
  test('hands an island what the page can answer, and the instance fallback', async () => {
    const i18n = createI18n({ locale: 'en', fallbackLocale: 'de', messages: { de: { only: 'nur' }, en: { root: 'R' } }, missingWarn: false })
    i18n.addRouteTranslations('en', 'about', { own: 'O' })
    const props = getI18nProps((await run('/about', {}, {}, i18n)).astro)
    expect(props.fallbackLocale).toBe('de')
    expect(props.translations.about).toEqual({ only: 'nur', root: 'R', own: 'O' })
  })

  test('a key under a key never writes into the stored tree', async () => {
    const i18n = createI18n({ locale: 'en', messages: { en: { a: { b: 'AB' }, 'a.c': 'flat' } }, missingWarn: false })
    const props = getI18nProps((await run('/', {}, {}, i18n)).astro, ['a', 'a.c'])
    expect(props.translations.index).toEqual({ a: { b: 'AB', c: 'flat' } })
    expect(i18n.t('a')).toEqual({ b: 'AB' })
  })

  test('a key under a string does not throw, a hostile key reaches no prototype', async () => {
    const i18n = createI18n({ locale: 'en', messages: { en: { s: 'str', 'constructor.prototype.polluted': 'yes' } }, missingWarn: false })
    const { astro } = await run('/', {}, {}, i18n)
    expect(getI18nProps(astro, ['s', 's.t']).translations.index).toEqual({ s: 'str' })
    getI18nProps(astro, ['constructor.prototype.polluted'])
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  })
})

describe('getI18nProps size', () => {
  test('without keys, a big dictionary warns once per dictionary in dev', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const big = Object.fromEntries(Array.from({ length: 2000 }, (_, i) => [`key${i}`, 'some translated text']))
    const i18n = createI18n({ locale: 'en', messages: { en: big }, missingWarn: false })
    const { astro } = await run('/', {}, {}, i18n)
    getI18nProps(astro)
    getI18nProps(astro)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]![0]).toContain('getI18nProps')
    getI18nProps(astro, ['key1'])
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })

  test('a small one, and production, stay quiet', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    getI18nProps((await run('/')).astro)
    vi.stubEnv('NODE_ENV', 'production')
    const big = Object.fromEntries(Array.from({ length: 2000 }, (_, i) => [`key${i}`, 'some translated text']))
    getI18nProps((await run('/', {}, {}, createI18n({ locale: 'en', messages: { en: big }, missingWarn: false }))).astro)
    vi.unstubAllEnvs()
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})

describe('links', () => {
  const page = async (path = '/de/blog/post') => (await run(path)).astro

  test.each([
    ['https://example.com/x', 'https://example.com/x'],
    ['//cdn.test/a', '//cdn.test/a'],
    ['mailto:a@b.c', 'mailto:a@b.c'],
    ['tel:+1', 'tel:+1'],
    ['sms:+1', 'sms:+1'],
    ['example.com', 'https://example.com'],
    ['#top', '#top'],
    ['?x=1', '?x=1'],
    ['', ''],
    ['/about', '/de/about'],
    ['/about/', '/de/about/'],
    ['/about?x=1#y', '/de/about?x=1#y'],
    ['/about/?x=1', '/de/about/?x=1'],
    ['/', '/de'],
    ['/en/about', '/de/about'],
    ['report.pdf', '/de/blog/post/report.pdf'],
    ['next', '/de/blog/post/next'],
    ['../up', '/de/blog/up'],
    ['./here', '/de/blog/post/here'],
    ['../../../up', '/de/up'],
    ['/a/../b', '/de/b'],
  ])('%s → %s', async (href, expected) => {
    expect(resolveLinkHref(await page(), href)).toBe(expected)
  })

  test('to another locale, and from the home page', async () => {
    expect(resolveLinkHref(await page(), '/about', 'en')).toBe('/about')
    expect(resolveLinkHref(await page('/'), 'next')).toBe('/next')
  })
})

describe('<I18nT> text', () => {
  const i18n = () =>
    createI18n({
      locale: 'en',
      messages: { en: { hi: 'Hi {name}', bold: '<b>{name}</b>', apples: 'none | one | {count} many', empty: '', n: 'N: {number}', blank: '  ' } },
      missingWarn: false,
    })
  const astroWith = async () => (await run('/', {}, {}, i18n())).astro

  test('with html, params are escaped and the translation is not', async () => {
    const text = resolveI18nT(await astroWith(), { keypath: 'bold', html: true, params: { name: '<img src=x onerror=alert(1)>' } })
    expect(text).toBe('<b>&lt;img src=x onerror=alert(1)&gt;</b>')
  })

  test('without html the text is left for the renderer to escape', async () => {
    expect(resolveI18nT(await astroWith(), { keypath: 'hi', params: { name: '<x>' } })).toBe('Hi <x>')
  })

  test('plural, number and defaults go the way of every other renderer', async () => {
    const astro = await astroWith()
    expect(resolveI18nT(astro, { keypath: 'apples', plural: 2 })).toBe('2 many')
    expect(resolveI18nT(astro, { keypath: 'n', number: 1000 })).toBe('N: 1,000')
    expect(resolveI18nT(astro, { keypath: 'nope', defaultValue: 'D' })).toBe('D')
    expect(resolveI18nT(astro, { keypath: 'nope' })).toBe('nope')
    expect(resolveI18nT(astro, { keypath: 'empty' })).toBe('')
    expect(resolveI18nT(astro, { keypath: 'blank', hideIfEmpty: true })).toBeNull()
  })
})

test('the default adapter survives a window with a URL object', () => {
  const adapter = createAstroRouterAdapter(locales, 'en', () => new URL('http://x.test/a?b=1'))
  expect(adapter.getRoute!()).toEqual({ fullPath: '/a?b=1', query: { b: '1' } })
})

test('islands plural by the locale tag: a code that is no language tag', async () => {
  const i18n = createI18n({
    locale: 'ua',
    localeIso: { ua: 'uk-UA' },
    messages: { ua: { items: '=0 нема | {count} предмет | {count} предмети | {count} предметів' } },
    missingWarn: false,
  })
  const handler = createI18nMiddleware({ i18n, defaultLocale: 'ua', locales: ['ua'] })
  const ctx = context('/')
  await handler(ctx as never, async () => new Response(''))
  const props = getI18nProps({ locals: ctx.locals } as never)
  expect(props.pluralLocale).toBe('uk-UA')
  expect(translatePlural(props, 'items', 21)).toBe('21 предмет')
  expect(withLocale(props, 'en').pluralLocale).toBeUndefined()
})
