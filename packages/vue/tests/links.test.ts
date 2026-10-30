// `I18nLink`, the router adapter and the composables' URLs against a real vue-router.
import type { Locale } from '@i18n-micro/types'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createI18n, I18nLink, I18nSwitcher, useI18n, useLocaleHead } from '../src'
import { createVueRouterAdapter } from '../src/router'

const locales: Locale[] = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
]

async function app(path: string, locale: string, render: () => unknown, setup: () => void = () => {}) {
  const page = { render: () => null }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/:locale(de)?', component: page },
      { path: '/:locale(de)?/about', name: 'about', component: page },
    ],
  })
  await router.push(path)
  const strategy = createVueRouterAdapter(router, locales, 'en')
  const i18n = createI18n({ locale, messages: { en: {} }, locales, defaultLocale: 'en', routingStrategy: strategy })
  const wrapper = mount(
    defineComponent({
      setup() {
        setup()
        return render
      },
    }),
    { global: { plugins: [router, i18n] }, attachTo: document.body },
  )
  return { wrapper, router, strategy, i18n }
}

describe('router adapter', () => {
  test('resolves names, keeps query and hash, leaves a bare hash on this page', async () => {
    const { strategy, wrapper } = await app('/de/about?q=1', 'de', () => null)
    const resolve = strategy.resolvePath!
    expect(resolve({ name: 'about' }, 'de')).toBe('/de/about')
    expect(resolve({ name: 'about', query: { x: '1' }, hash: '#h' }, 'de')).toBe('/de/about?x=1#h')
    expect(resolve({ path: '/about', query: { x: '1' } }, 'en')).toBe('/about?x=1')
    expect(resolve('/about?x=1#y', 'de')).toBe('/de/about?x=1#y')
    expect(resolve('/de/about?x=1', 'en')).toBe('/about?x=1')
    expect(resolve('#top', 'de')).toBe('/de/about#top')
    expect(resolve('?x=1', 'en')).toBe('/about?x=1')
    expect(resolve('/', 'de')).toBe('/de')
    wrapper.unmount()
  })
})

describe('I18nLink', () => {
  test('a named target reaches the router link, localized', async () => {
    const { wrapper } = await app('/', 'de', () => h(I18nLink, { to: { name: 'about', query: { x: '1' } } }, () => 'L'))
    expect(wrapper.find('a').attributes('href')).toBe('/de/about?x=1')
    wrapper.unmount()
  })

  test.each([
    ['/about', true],
    ['/about/', true],
    ['/about?x=1', true],
    ['/about#h', true],
    ['/', false],
  ])('activeStyle on %s at /de/about?q=1: %s', async (to, active) => {
    const { wrapper } = await app('/de/about?q=1', 'de', () => h(I18nLink, { to, activeStyle: { color: 'red' } }, () => 'L'))
    expect(wrapper.find('a').attributes('style') ?? '').toBe(active ? 'color: red;' : '')
    wrapper.unmount()
  })

  describe('a plain anchor (no link component)', () => {
    const plain = (push: (target: { path: string }) => void) => ({ getCurrentPath: () => '/', push, replace: push, resolvePath: () => '/de/x' })
    const mountPlain = (push: () => void) =>
      mount(I18nLink, {
        props: { to: '/x' },
        slots: { default: () => 'L' },
        global: { plugins: [createI18n({ locale: 'en', messages: {}, locales, defaultLocale: 'en', routingStrategy: plain(push) })] },
      })

    test('a plain click navigates once', () => {
      const push = vi.fn()
      const wrapper = mountPlain(push)
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      wrapper.find('a').element.dispatchEvent(event)
      expect(push).toHaveBeenCalledExactlyOnceWith({ path: '/de/x' })
      expect(event.defaultPrevented).toBe(true)
    })

    test.each([['ctrlKey'], ['metaKey'], ['shiftKey'], ['altKey']])('%s + click stays with the browser', (key) => {
      const push = vi.fn()
      const wrapper = mountPlain(push)
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, [key]: true })
      wrapper.find('a').element.dispatchEvent(event)
      expect(push).not.toHaveBeenCalled()
      expect(event.defaultPrevented).toBe(false)
    })

    test('a non-primary button stays with the browser', () => {
      const push = vi.fn()
      const wrapper = mountPlain(push)
      wrapper.find('a').element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 1 }))
      expect(push).not.toHaveBeenCalled()
    })
  })
})

describe('switching locale', () => {
  test('keeps the query and the hash, from code and from the switcher', async () => {
    let api!: ReturnType<typeof useI18n>
    const { wrapper, router } = await app(
      '/de/about?q=1#h',
      'de',
      () => h(I18nSwitcher),
      () => {
        api = useI18n()
      },
    )
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('.switcher-locale-en').attributes('href')).toBe('/about?q=1#h')
    await wrapper.find('.switcher-locale-en').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/about?q=1#h')
    api.switchLocale('de')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/de/about?q=1#h')
    wrapper.unmount()
  })
})

describe('useLocaleHead', () => {
  test('the default base gives root-relative URLs, never protocol-relative ones', async () => {
    let head!: ReturnType<typeof useLocaleHead>
    const { wrapper } = await app(
      '/de',
      'de',
      () => null,
      () => {
        head = useLocaleHead()
        head.updateMeta()
      },
    )
    expect(head.metaObject.value.link.map((link) => link.href)).toEqual(['/de', '/', '/de', '/'])
    wrapper.unmount()
  })

  test('canonical and hreflang of one page agree', async () => {
    let head!: ReturnType<typeof useLocaleHead>
    const { wrapper } = await app(
      '/de',
      'de',
      () => null,
      () => {
        head = useLocaleHead({ baseUrl: 'https://x.com/' })
        head.updateMeta()
      },
    )
    const { link } = head.metaObject.value
    expect(link[0]!.href).toBe('https://x.com/de')
    expect(link.find((tag) => tag.hreflang === 'de-DE')!.href).toBe(link[0]!.href)
    wrapper.unmount()
  })
})
