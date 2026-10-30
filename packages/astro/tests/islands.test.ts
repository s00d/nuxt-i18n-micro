// @vitest-environment jsdom
import { createElement as h, render as renderPreact } from 'preact'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { get } from 'svelte/store'
import { createApp, defineComponent, h as vh } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import {
  createI18nStore,
  hasTranslation,
  I18nProvider,
  I18nProviderPreact,
  provideI18n,
  translate,
  useAstroI18nPreact,
  useAstroI18nReact,
  useAstroI18nSvelte,
  useAstroI18nVue,
} from '../src/client'
import type { I18nClientProps } from '../src/utils'

// what getI18nProps hands an island on /de/about
const props = (): I18nClientProps => ({
  locale: 'de',
  fallbackLocale: 'en',
  currentRoute: 'about',
  translations: {
    about: { title: 'Über', hi: 'Hallo {name}', apples: 'keine | ein Apfel | {count} Äpfel', nested: { deep: 'Tief' }, 'flat.key': 'Flach' },
    index: { home: 'Start' },
  },
})

type Api = ReturnType<typeof useAstroI18nReact>
// relative dates are measured against a frozen clock
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2025-06-01T12:00:00Z'))
})
afterEach(() => {
  vi.useRealTimers()
})

const day = 86_400_000

/** Every island adapter answers the same questions the same way. */
function expectIslandApi(api: Api, read: { locale: () => string; fallbackLocale: () => string; currentRoute: () => string }) {
  expect([read.locale(), read.fallbackLocale(), read.currentRoute(), api.getRoute()]).toEqual(['de', 'en', 'about', 'about'])
  expect(api.t('title')).toBe('Über')
  expect(api.t('hi', { name: 'Jo' })).toBe('Hallo Jo')
  expect(api.t('nested.deep')).toBe('Tief')
  expect(api.t('flat.key')).toBe('Flach')
  expect(api.t('nested')).toEqual({ deep: 'Tief' })
  expect(api.t('title.x')).toBe('title.x')
  expect(api.t('missing')).toBe('missing')
  expect(api.t('missing', undefined, 'Def')).toBe('Def')
  expect(api.t('missing', undefined, null)).toBe('missing')
  expect(api.t('home', undefined, undefined, 'index')).toBe('Start')
  expect(api.t('home', undefined, undefined, 'nope')).toBe('home')
  expect(api.ts('nested.deep')).toBe('Tief')
  expect(api.ts('missing', undefined, 'D')).toBe('D')
  expect([api.tc('apples', 0), api.tc('apples', 1), api.tc('apples', 5)]).toEqual(['keine', 'ein Apfel', '5 Äpfel'])
  expect(api.tc('apples', { count: '2' as unknown as number })).toBe('2 Äpfel')
  expect(api.tc('apples', {})).toBe('apples')
  expect(api.tc('apples', {}, 'D')).toBe('D')
  expect(api.tn(1234.5)).toBe('1.234,5')
  expect(api.td(Date.UTC(2024, 0, 2), { timeZone: 'UTC' })).toBe('2.1.2024')
  expect(api.tdr(Date.now() + day * 3 + 60_000)).toBe('in 3 Tagen')
  expect([api.has('title'), api.has('nested'), api.has('missing'), api.has('home', 'index'), api.has('title', 'nope')]).toEqual([
    true,
    false,
    false,
    true,
    false,
  ])
}

test('the pure island core: translate / hasTranslation over the props', () => {
  const state = props()
  expect(translate(state, '')).toBe('')
  expect(translate(state, '', undefined, 'D')).toBe('D')
  expect(translate(state, 'title', { x: 1 })).toBe('Über')
  expect(translate(state, 'nested', { x: 1 })).toEqual({ deep: 'Tief' })
  expect(translate({ ...state, translations: {} }, 'title')).toBe('title')
  expect(hasTranslation({ ...state, translations: {} }, 'title')).toBe(false)
})

test('React island: provider + hook, and the hook outside a provider fails loudly', () => {
  let api!: Api
  const Island = () => {
    api = useAstroI18nReact()
    return createElement('b', null, api.t('title'))
  }
  expect(renderToString(createElement(I18nProvider, { value: props() }, createElement(Island)))).toBe('<b>Über</b>')
  expectIslandApi(api, { locale: () => api.locale, fallbackLocale: () => api.fallbackLocale, currentRoute: () => api.currentRoute })
  vi.spyOn(console, 'error').mockImplementation(() => {})
  expect(() => renderToString(createElement(Island))).toThrow('useAstroI18n must be used within an I18nProvider')
  vi.restoreAllMocks()
})

test('Preact island: provider + hook, and the hook outside a provider fails loudly', () => {
  let api!: Api
  const Island = () => {
    api = useAstroI18nPreact() as Api
    return h('b', null, String(api.t('title')))
  }
  const el = document.createElement('div')
  renderPreact(h(I18nProviderPreact, { value: props() }, h(Island, null)), el)
  expect(el.innerHTML).toBe('<b>Über</b>')
  expectIslandApi(api, { locale: () => api.locale, fallbackLocale: () => api.fallbackLocale, currentRoute: () => api.currentRoute })
  expect(() => renderPreact(h(Island, null), document.createElement('div'))).toThrow('useAstroI18n must be used within an I18nProvider')
})

test('Vue island: provideI18n in the root, the hook in a child, locale and route switch reactively', () => {
  let api!: ReturnType<typeof useAstroI18nVue>
  const Child = defineComponent({
    setup() {
      api = useAstroI18nVue()
      return () => vh('b', String(api.t('title')))
    },
  })
  const el = document.createElement('div')
  createApp({
    setup() {
      provideI18n(props())
      return () => vh(Child)
    },
  }).mount(el)
  expect(el.innerHTML).toBe('<b>Über</b>')
  expectIslandApi(api as unknown as Api, {
    locale: () => api.locale.value,
    fallbackLocale: () => api.fallbackLocale.value,
    currentRoute: () => api.currentRoute.value,
  })

  api.setLocale('en')
  expect(api.tn(1234.5)).toBe('1,234.5')
  api.setRoute('index')
  expect([api.getRoute(), api.t('home')]).toEqual(['index', 'Start'])
  api.locale.value = 'fr'
  api.currentRoute.value = 'about'
  expect([api.locale.value, api.getRoute(), api.t('title'), api.tn(1.5)]).toEqual(['fr', 'about', 'Über', '1,5'])

  vi.spyOn(console, 'warn').mockImplementation(() => {})
  expect(() => createApp(Child).mount(document.createElement('div'))).toThrow('useAstroI18n must be used within a component that calls provideI18n')
  vi.restoreAllMocks()
})

test('Svelte island: a store from the props, setters write through it', () => {
  const store = createI18nStore(props())
  const api = useAstroI18nSvelte(store)
  expect(api.store).toBe(store)
  expectIslandApi(api as unknown as Api, { locale: () => api.locale, fallbackLocale: () => api.fallbackLocale, currentRoute: () => api.currentRoute })

  api.setLocale('en')
  api.setRoute('index')
  expect(get(store)).toMatchObject({ locale: 'en', currentRoute: 'index', fallbackLocale: 'en' })
  expect([api.locale, api.getRoute(), api.t('home'), api.tn(1234.5)]).toEqual(['en', 'index', 'Start', '1,234.5'])
})
