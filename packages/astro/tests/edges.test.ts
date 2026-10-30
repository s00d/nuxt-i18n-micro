// @vitest-environment jsdom
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { act, createElement, type ReactElement } from 'react'
import { createRoot } from 'react-dom/client'
import { render as renderPreact, createElement as h } from 'preact'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { AstroI18n, createI18n, createI18nMiddleware, getI18nProps, useI18n, useLocaleHead, type I18nRoutingStrategy } from '../src'
import { translatePlural, withLocale } from '../src/client/core'
import { I18nProvider as PreactProvider, useAstroI18n as usePreact } from '../src/client/preact'
import { I18nProvider, useAstroI18n } from '../src/client/react'
import { loadTranslationsIntoI18n, readTranslationDir } from '../src/node'
import { localeLabel, resolveI18nT, resolveLinkHref } from '../src/utils'

const locales = [
  { code: 'en', iso: 'en-US' },
  { code: 'de', iso: 'de-DE' },
  { code: 'fr', iso: 'fr-FR', disabled: true },
]
const codes = ['en', 'de', 'fr']

interface Init {
  headers?: Record<string, string>
  routePattern?: string
  params?: Record<string, string>
}

function site() {
  return createI18n({ locale: 'en', fallbackLocale: 'en', missingWarn: false, messages: { en: { hello: 'Hello' }, de: { hello: 'Hallo' } } })
}

async function run(path: string, init: Init = {}, options: Record<string, unknown> = {}, i18n = site()) {
  const handler = createI18nMiddleware({ i18n, defaultLocale: 'en', locales: codes, localeObjects: locales, ...options })
  const set = vi.fn()
  const ctx = {
    url: new URL(`http://site.test${path}`),
    locals: {} as Record<string, unknown>,
    params: init.params ?? {},
    routePattern: init.routePattern,
    isPrerendered: false,
    request: { headers: new Headers(init.headers), method: 'GET' },
    cookies: { get: () => undefined, set },
    redirect: (location: string, status: number) => new Response(null, { status, headers: { Location: location } }),
  }
  const page = () => new Response('<html></html>', { headers: { 'content-type': 'text/html' } })
  const response = (await handler(ctx as never, async () => page())) as Response
  return { response, set, astro: { url: ctx.url, locals: ctx.locals, params: ctx.params } as never, locals: ctx.locals as unknown as App.Locals }
}

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('the middleware', () => {
  // a strategy may answer `{}`: it has no opinion on this path
  const silent = { resolvePath: () => ({}) } as unknown as I18nRoutingStrategy

  test('a strategy without an answer leaves the locale its own home', async () => {
    const { response } = await run('/', { headers: { 'accept-language': 'de' } }, { routingStrategy: silent })
    expect(response.headers.get('location')).toBe('/de')
    expect((await run('/', {}, { routingStrategy: silent, redirectToDefault: true })).response.status).toBe(200)
  })

  test('a switched page says the cookie it writes depends on the Referer', async () => {
    const { response, set } = await run('/de', { headers: { referer: 'http://site.test/', 'sec-fetch-site': 'same-origin' } })
    expect(set).toHaveBeenCalled()
    expect(response.headers.get('vary')).toContain('Referer')
  })

  test('a switch to the home keeps what a home varies on', async () => {
    const { response } = await run('/', { headers: { referer: 'http://site.test/de', 'sec-fetch-site': 'same-origin' } })
    expect(response.headers.get('vary')).toBe('Referer, Cookie, Accept-Language')
  })

  test('a disabled locale in a `[locale]` route does not end up in the route name', async () => {
    const { locals } = await run('/fr/about', { routePattern: '/[locale]/about', params: { locale: 'fr' } })
    expect(locals.i18n.getRoute()).toBe('about')
  })
})

describe('links', () => {
  test('percent-encoded dots climb like plain ones: the browser treats them the same', async () => {
    const { astro } = await run('/de/docs/page')
    expect(resolveLinkHref(astro, '/%2e%2e/up')).toBe('/de/up')
    expect(resolveLinkHref(astro, '%2E%2E/up')).toBe(resolveLinkHref(astro, '../up'))
    expect(resolveLinkHref(astro, '/a/%2e/b')).toBe('/de/a/b')
    expect(useI18n(astro).localizePath('/.%2e/up', 'de')).toBe('/de/up')
  })

  test('a relative link from a page with a trailing slash', async () => {
    const localizePath = vi.fn((path: string) => path)
    const { astro } = await run('/de/docs/', {}, { routingStrategy: { localizePath } as unknown as I18nRoutingStrategy })
    expect(resolveLinkHref(astro, 'page')).toBe('/de/docs/page')
    expect(localizePath).toHaveBeenCalledWith('/de/docs/page', 'de', expect.anything(), 'en')
  })

  test('a disabled locale is no locale: `/fr/about` is a page of that name', async () => {
    const { astro } = await run('/de/docs')
    expect(resolveLinkHref(astro, '/fr/about')).toBe('/de/fr/about')
  })
})

describe('the head', () => {
  test('no x-default when the default locale is off, or not configured', async () => {
    const off = await run('/de', {}, { localeObjects: [{ code: 'en', disabled: true }, { code: 'de' }], locales: ['en', 'de'] })
    expect(useLocaleHead(off.astro).link.map((link) => link.hreflang)).not.toContain('x-default')
    const absent = await run('/de', {}, { localeObjects: [{ code: 'de' }], locales: ['de'] })
    expect(useLocaleHead(absent.astro).link.map((link) => link.hreflang)).not.toContain('x-default')
  })
})

describe('AstroI18n.clearCache', () => {
  test('restores what the constructor got, not what happened to the option later', () => {
    const messages: Record<string, Record<string, string>> = { en: { hello: 'Hi' } }
    const routeMessages: Record<string, Record<string, Record<string, string>>> = { about: { en: { title: 'About' } } }
    const i18n = new AstroI18n({ locale: 'en', messages, routeMessages, missingWarn: false })
    messages.en = { hello: 'Changed' }
    routeMessages.about = { en: { title: 'Changed' } }
    i18n.clearCache()
    i18n.setRoute('about')
    expect([i18n.t('hello'), i18n.t('title')]).toEqual(['Hi', 'About'])
  })

  test('keeps a directory loaded into the instance, on the instance and on its forks', () => {
    const root = mkdtempSync(join(tmpdir(), 'i18n-astro-edges-'))
    try {
      writeFileSync(join(root, 'en.json'), '{"hello":"From disk"}')
      const i18n = new AstroI18n({ locale: 'en', missingWarn: false })
      loadTranslationsIntoI18n(i18n, { translationDir: '.', rootDir: root })
      const fork = i18n.fork()
      fork.clearCache()
      expect(fork.t('hello')).toBe('From disk')
      i18n.clearCache()
      expect(i18n.t('hello')).toBe('From disk')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})

describe('readTranslationDir', () => {
  test('walks the directory once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const root = mkdtempSync(join(tmpdir(), 'i18n-astro-edges-'))
    try {
      readTranslationDir({ translationDir: 'missing', rootDir: pathToFileURL(`${root}/`) })
      expect(warn).toHaveBeenCalledTimes(1)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})

describe('getI18nProps', () => {
  test('a cyclic dictionary does not break the size warning', async () => {
    const { locals } = await run('/en')
    const tree: Record<string, unknown> = { hello: 'x' }
    tree.self = tree
    locals.i18n.addTranslations('en', tree as never)
    expect(() => getI18nProps({ locals })).not.toThrow()
  })
})

describe('<I18nT>', () => {
  test('a custom plural rule keeps the fallback it asks for', async () => {
    const i18n = createI18n({
      locale: 'en',
      missingWarn: false,
      plural: (_key, _count, params, _locale, getter) => getter('nope', params, 'from the rule') as string,
    })
    const { astro } = await run('/en', {}, {}, i18n)
    expect(resolveI18nT(astro, { keypath: 'apples', plural: 1, defaultValue: 'from the prop' })).toBe('from the rule')
  })
})

describe('<I18nSwitcher> labels', () => {
  test('a locale code never reads an inherited member', () => {
    expect(localeLabel({ code: 'constructor' }, {})).toBe('constructor')
    expect(localeLabel({ code: 'de', displayName: 'Deutsch' }, { de: 'DE' })).toBe('DE')
    expect(localeLabel({ code: 'de', displayName: 'Deutsch' }, {})).toBe('Deutsch')
  })
})

describe('islands', () => {
  const props = () => ({ locale: 'ua', fallbackLocale: 'en', currentRoute: 'index', translations: { index: { apples: 'one | few | many | other' } } })

  test('setLocale takes the plural tag of the new locale', async () => {
    const i18n = createI18n({ locale: 'en', missingWarn: false, localeIso: { ua: 'uk-UA' }, messages: { en: { apples: 'a | b' } } })
    const { locals } = await run('/en', {}, {}, i18n)
    const state = withLocale(getI18nProps({ locals }), 'ua')
    expect(state.pluralLocale).toBe('uk-UA')
    expect(translatePlural({ ...state, translations: props().translations, currentRoute: 'index' }, 'apples', 21)).toBe(
      translatePlural({ ...props(), pluralLocale: 'uk-UA' }, 'apples', 21),
    )
    expect(withLocale(state, 'de').pluralLocale).toBeUndefined()
  })

  test('props stay as they were without a mapping', async () => {
    const { locals } = await run('/en')
    expect(getI18nProps({ locals })).not.toHaveProperty('localeIso')
  })

  test('React: the setters are the same functions on every render', () => {
    const seen: unknown[][] = []
    function Probe(): null {
      const { setLocale, setRoute } = useAstroI18n()
      seen.push([setLocale, setRoute])
      return null
    }
    const value = props()
    const root = createRoot(document.body.appendChild(document.createElement('div')))
    const tree = (): ReactElement => createElement(I18nProvider, { value, children: createElement(Probe) })
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    act(() => root.render(tree()))
    act(() => root.render(tree()))
    act(() => seen[0]![0] && (seen[0]![0] as (code: string) => void)('de'))
    expect(seen.length).toBeGreaterThan(2)
    for (const pair of seen) expect(pair).toEqual(seen[0])
    act(() => root.unmount())
  })

  test('Preact: the setters are the same functions on every render', () => {
    const seen: unknown[][] = []
    function Probe(): null {
      const { setLocale, setRoute } = usePreact()
      seen.push([setLocale, setRoute])
      return null
    }
    const value = props()
    const host = document.body.appendChild(document.createElement('div'))
    renderPreact(h(PreactProvider, { value, children: h(Probe, null) }), host)
    renderPreact(h(PreactProvider, { value, children: h(Probe, null) }), host)
    expect(seen.length).toBeGreaterThan(1)
    for (const pair of seen) expect(pair).toEqual(seen[0])
  })
})
