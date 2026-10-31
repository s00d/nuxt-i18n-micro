import { beforeEach, describe, expect, test, vi } from 'vitest'
import { ref, type Ref } from 'vue'
import { useI18nHead } from '../../src/runtime/composables/useI18nHead'
import plugin from '../../src/runtime/plugins/02.meta'

const app = vi.hoisted(() => ({
  current: {} as Record<string, unknown>,
  state: new Map<string, unknown>(),
  head: null as (() => { htmlAttrs: object; link: { rel: string; href?: string }[]; meta: unknown[] }) | null,
}))

// every Nuxt path is one stub in unit tests, so one mock answers them all
vi.mock('#imports', () => ({
  defineNuxtPlugin: (setup: unknown) => setup,
  useHead: (getter: typeof app.head) => {
    app.head = getter
  },
  useError: () => ({ value: null }),
  useNuxtApp: () => app.current,
  useRequestURL: () => new URL('https://example.com/'),
  useRoute: () => ({ path: '/', name: 'index', fullPath: '/', matched: [{}] }),
  useRuntimeConfig: () => ({ app: { baseURL: '/' } }),
  useState: (key: string, init: () => unknown) => {
    if (!app.state.has(key)) app.state.set(key, ref(init()))
    return app.state.get(key) as Ref
  },
}))

function setup(options: { metaDisabled?: boolean } = {}) {
  const isMetaDisabled = vi.fn(() => options.metaDisabled ?? false)
  app.current = {
    $getI18nConfig: () => ({ locales: [{ code: 'en' }], defaultLocale: 'en', metaBaseUrl: 'https://example.com', strategy: 'prefix' }),
    $getLocales: () => [{ code: 'en' }],
    $getLocale: () => 'en',
    $switchLocalePath: () => '/en',
    $i18nStrategy: { isMetaDisabled, pageLocales: () => ['en'] },
  }
  ;(plugin as unknown as (nuxtApp: unknown) => void)(app.current)
  return { isMetaDisabled }
}

describe('02.meta', () => {
  beforeEach(() => {
    app.state.clear()
    app.head = null
  })

  test('one render asks the strategy once', () => {
    const { isMetaDisabled } = setup()
    expect(app.head!().link.length).toBeGreaterThan(0)
    expect(isMetaDisabled).toHaveBeenCalledTimes(1)
  })

  test('without a page head the generated head is left alone; with one it is merged', () => {
    setup()
    const generated = app.head!()
    useI18nHead({ replace: { canonical: 'https://example.com/other' } })
    expect(app.head!().link.find((link) => link.rel === 'canonical')?.href).toBe('https://example.com/other')
    expect(app.head!().link.length).toBe(generated.link.length)
  })

  test('a route that disables meta drops the page head too', () => {
    setup({ metaDisabled: true })
    useI18nHead({ meta: [{ name: 'x', content: 'y' }] })
    expect(app.head!()).toEqual({ htmlAttrs: {}, link: [], meta: [] })
  })

  test('hydration: a page head from the payload applies though no client code calls useI18nHead', () => {
    // server-only code and `hydrate-never` children leave only the payload to go on
    app.state.set('i18n-head-page', ref({ replace: { canonical: 'https://example.com/ssr' } }))
    setup()
    expect(app.head!().link.find((link) => link.rel === 'canonical')?.href).toBe('https://example.com/ssr')
  })
})
