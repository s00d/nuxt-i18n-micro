/**
 * Integration scenarios for vitepress-openapi-plugin style sites:
 * deep operation paths, site.base, sync off + manual locale, Node generators, SEO.
 */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from '../src/runtime/create'
import { createI18n as createNodeI18n } from '../src/runtime/node-create'
import { withI18n, type VitePressUserConfigLike } from '../src/plugin/with-i18n'
import { buildVitePressLocales } from '../src/plugin/vitepress-locales'
import { buildVitePressLocaleHead } from '../src/seo/locale-head'
import { getLocaleFromPath, stripSiteBase } from '../src/router/adapter'

const BASE = '/openapi_docs/'

const locales = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'ru', iso: 'ru-RU', displayName: 'Русский' },
  { code: 'zh', iso: 'zh-CN', displayName: '中文' },
  { code: 'fr', iso: 'fr-FR', displayName: 'Français' },
]

const uiMessages = {
  en: {
    try_it_out: 'Try it out',
    deprecated_description: 'This endpoint is deprecated.',
    nested: { ok: 'OK' },
  },
  ru: {
    try_it_out: 'Попробовать',
    deprecated_description: 'Эндпоинт устарел.',
    nested: { ok: 'ОК' },
  },
  zh: {
    try_it_out: '试一试',
    deprecated_description: '此接口已弃用。',
  },
  fr: {
    try_it_out: 'Essayer',
  },
}

function mockApp() {
  return {
    use: vi.fn(),
    provide: vi.fn(),
    config: { globalProperties: {} as Record<string, unknown> },
    component: vi.fn(),
  }
}

function mockRouter(path: string) {
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

const dirs: string[] = []
afterEach(() => {
  for (const dir of dirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
  vi.restoreAllMocks()
})

describe('openapi integration: deep paths + root UI dict', () => {
  it('sync on: a deep path without a page dictionary keeps the index route, the locale follows the URL', async () => {
    const i18n = createI18n({ locale: 'en', defaultLocale: 'en', locales, messages: uiMessages, base: BASE })
    const router = mockRouter(`${BASE}ru/petstore/pets/getPetById`)
    i18n.enhanceApp({ app: mockApp() as never, router })

    expect(i18n.i18n.getLocale()).toBe('ru')
    expect(i18n.i18n.getRoute()).toBe('index')
    expect(i18n.i18n.ts('try_it_out')).toBe('Попробовать')
    expect(i18n.i18n.ts('nested.ok')).toBe('ОК')

    router.route.path = `${BASE}zh/petstore/components/schemas/Pet`
    await router.onAfterRouteChange?.(`${BASE}zh/petstore/components/schemas/Pet`)
    expect(i18n.i18n.getLocale()).toBe('zh')
    expect(i18n.i18n.getRoute()).toBe('index')
    expect(i18n.i18n.ts('try_it_out')).toBe('试一试')
  })

  it('sync on: the route moves only to a page that has a dictionary', () => {
    const start = (path: string) => {
      const i18n = createI18n({
        locale: 'en',
        defaultLocale: 'en',
        locales,
        messages: uiMessages,
        routeMessages: { 'guide-demo': { en: { pageOnly: 'EN' }, ru: { pageOnly: 'RU' } } },
        base: BASE,
      })
      i18n.enhanceApp({ app: mockApp() as never, router: mockRouter(path) })
      return i18n.i18n
    }
    const deep = start(`${BASE}ru/petstore/op`)
    expect(deep.getRoute()).toBe('index')
    expect(deep.t('pageOnly')).toBe('pageOnly')
    const page = start(`${BASE}ru/guide/demo`)
    expect(page.getRoute()).toBe('guide-demo')
    expect(page.t('pageOnly')).toBe('RU')
  })

  // on `main` a forced route hid the root keys; core now reads the route chunk, then the root one
  it('a forced route without a dictionary keeps the root UI', () => {
    const { i18n } = createI18n({ locale: 'ru', defaultLocale: 'en', locales, messages: uiMessages })
    i18n.setRoute('petstore-pets-getPetById')
    expect(i18n.t('try_it_out')).toBe('Попробовать')
  })

  it('openapi theme pattern: sync OFF + manual locale sync (getLocaleFromPath)', async () => {
    const i18n = createI18n({
      locale: 'en',
      defaultLocale: 'en',
      locales,
      messages: uiMessages,
      base: BASE,
      syncWithVitePress: false,
    })

    const router = mockRouter(`${BASE}fr/petstore/pets`)
    i18n.enhanceApp({ app: mockApp() as never, router })

    // Package must not force locale/route when sync is off
    expect(i18n.i18n.getLocale()).toBe('en')
    expect(i18n.i18n.getRoute()).toBe('index')

    const syncLocaleFromPath = (path: string) => {
      const next = i18n.getLocaleFromPath(path)
      if (i18n.i18n.getLocale() !== next) i18n.i18n.locale = next
    }

    syncLocaleFromPath(router.route.path)
    expect(i18n.i18n.getLocale()).toBe('fr')
    expect(i18n.i18n.getRoute()).toBe('index')
    expect(i18n.i18n.ts('try_it_out')).toBe('Essayer')
    // Missing fr key falls back
    expect(i18n.i18n.ts('deprecated_description')).toBe('This endpoint is deprecated.')

    const prev = router.onAfterRouteChange
    router.onAfterRouteChange = async (to: string) => {
      if (typeof prev === 'function') await prev(to)
      syncLocaleFromPath(to)
    }

    router.route.path = `${BASE}ru/petstore/pets`
    await router.onAfterRouteChange(`${BASE}ru/petstore/pets`)
    expect(i18n.i18n.getLocale()).toBe('ru')
    expect(i18n.i18n.ts('try_it_out')).toBe('Попробовать')
  })
})

describe('openapi integration: site.base path helpers', () => {
  it('detects locale and rewrites paths under /openapi_docs/', () => {
    const i18n = createI18n({
      locale: 'en',
      defaultLocale: 'en',
      locales,
      base: BASE,
    })

    expect(i18n.getLocaleFromPath(`${BASE}ru/petstore/getPet`)).toBe('ru')
    expect(i18n.getLocaleFromPath(`${BASE}petstore/getPet`)).toBe('en')
    expect(stripSiteBase(`${BASE}ru/x`, BASE)).toBe('/ru/x')

    expect(i18n.localizePath('/petstore/getPet', 'ru')).toBe('/ru/petstore/getPet')
    expect(i18n.switchLocalePath(`${BASE}ru/petstore/getPet`, 'en')).toBe('/petstore/getPet')
    expect(i18n.switchLocalePath(`${BASE}petstore/getPet`, 'zh')).toBe('/zh/petstore/getPet')
    expect(i18n.removeLocaleFromPath(`${BASE}fr/petstore/a/b`)).toBe('/petstore/a/b')
    expect(i18n.routeNameFromPath(`${BASE}ru/petstore/pets/getPetById`)).toBe('petstore-pets-getPetById')
  })

  it('the free getLocaleFromPath answers like the instance (theme migration)', () => {
    const codes = locales.map((l) => l.code)
    expect(getLocaleFromPath(`${BASE}zh/x`, codes, 'en', {}, BASE)).toBe('zh')
    expect(getLocaleFromPath(`${BASE}x`, codes, 'en', {}, BASE)).toBe('en')
  })

  it('withI18n puts config.base into virtual:i18n-micro/config', async () => {
    const result = withI18n({ base: BASE } as VitePressUserConfigLike, {
      locale: 'en',
      defaultLocale: 'en',
      locales,
      messages: { en: {} },
    })
    const plugin = result.vite?.plugins?.flat().find((p) => p && typeof p === 'object' && 'name' in p && p.name === 'vite-plugin-i18n-vitepress') as {
      resolveId?: (id: string) => string | undefined
      load?: (id: string) => string | undefined | Promise<string | undefined>
    }
    expect(plugin).toBeTruthy()
    const id = plugin.resolveId?.('virtual:i18n-micro/config')
    expect(id).toBeTruthy()
    const code = await plugin.load?.(id!)
    expect(code).toContain('"base":"/openapi_docs/"')
  })
})

describe('openapi integration: Node generators', () => {
  it('createI18n(/node) loads locales/*.json and answers like the client, with the fallback locale', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'i18n-oa-gen-'))
    dirs.push(tmp)
    writeFileSync(join(tmp, 'en.json'), JSON.stringify(uiMessages.en))
    writeFileSync(join(tmp, 'ru.json'), JSON.stringify(uiMessages.ru))
    const node = createNodeI18n({ locale: 'en', fallbackLocale: 'en', translationDir: tmp, locales: ['en', 'ru'], defaultLocale: 'en' })
    await node.loadTranslations()
    const client = createI18n({
      locale: 'en',
      defaultLocale: 'en',
      locales: [{ code: 'en' }, { code: 'ru' }],
      messages: { en: uiMessages.en, ru: uiMessages.ru },
    })

    for (const locale of ['en', 'ru'] as const) {
      node.locale = locale
      client.i18n.locale = locale
      expect(node.t('try_it_out')).toBe(client.i18n.ts('try_it_out'))
      expect(node.t('nested.ok')).toBe(client.i18n.ts('nested.ok'))
    }
    node.locale = 'de'
    expect(node.t('try_it_out')).toBe('Try it out')
  })

  it('path helpers on the Node instance, for absolute generator URLs', () => {
    const node = createNodeI18n({ locale: 'en', locales: ['en', 'ru'], defaultLocale: 'en', base: BASE })
    expect(node.localizePath('/petstore', 'ru')).toBe('/ru/petstore')
    expect(node.switchLocalePath(`${BASE}ru/petstore`, 'en')).toBe('/petstore')
  })
})

describe('openapi integration: locales + SEO coexistence', () => {
  it('buildVitePressLocales gives the multi-locale shape', () => {
    const built = buildVitePressLocales(locales, 'en')
    expect(built.root).toEqual({ label: 'English', lang: 'en-US' })
    expect(built.ru).toEqual({ label: 'Русский', lang: 'ru-RU', link: '/ru/' })
    expect(built.zh?.link).toBe('/zh/')
    expect(built).not.toHaveProperty('en')
  })

  it('meta on: absolute URLs carry the origin and the site base', () => {
    const { head } = buildVitePressLocaleHead({
      path: `${BASE}ru/petstore/getPet`,
      locales,
      defaultLocale: 'en',
      base: BASE,
      metaBaseUrl: 'https://docs.example.com',
    })
    expect(head.find((t) => t[0] === 'link' && t[1].rel === 'canonical')?.[1].href).toBe('https://docs.example.com/openapi_docs/ru/petstore/getPet')
    expect(head.find((t) => t[0] === 'link' && t[1].hreflang === 'en-US')?.[1].href).toBe('https://docs.example.com/openapi_docs/petstore/getPet')
  })

  it('localizePath gives the content path, the site base stays with the caller', () => {
    const i18n = createI18n({ locale: 'en', defaultLocale: 'en', locales, base: BASE })
    expect(i18n.localizePath('/petstore/getPet', 'ru')).toBe('/ru/petstore/getPet')
  })
})
