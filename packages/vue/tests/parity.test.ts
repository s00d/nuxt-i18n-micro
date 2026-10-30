// The Vue package and the Nuxt module side by side: both render through one code path, so every
// test here runs over both components.
import type { Locale } from '@i18n-micro/types'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { type Component, createSSRApp, defineComponent, h, onMounted, ref, shallowRef } from 'vue'
import { renderToString } from 'vue/server-renderer'
import NuxtGroup from '../../../src/runtime/components/i18n-group.vue'
import NuxtSwitcher from '../../../src/runtime/components/i18n-switcher.vue'
import NuxtT from '../../../src/runtime/components/i18n-t.vue'
import { NuxtI18n } from '../../../src/runtime/utils/nuxt-i18n'
import { I18nGroup } from '../src/components/i18n-group'
import { I18nSwitcher } from '../src/components/i18n-switcher'
import { I18nT } from '../src/components/i18n-t'
import { I18nInjectionKey, I18nLocalesKey } from '../src/injection'
import { mountNuxt, mountVue, type MountOptions, vueInstance, wireNuxtApp } from './characterization/harness'
import { routerBase } from './characterization/nuxt-stub'

const messages = {
  en: {
    order: '{a} then {b}',
    reorder: '{b} then {a}',
    repeat: '{a} and {a}',
    posted: 'Posted {date}',
    ago: 'Updated {relativeDate}',
    group: { deep: 'Deep {x}' },
  },
}

const sides: [string, Component, typeof mountVue][] = [
  ['vue', I18nT, mountVue],
  ['nuxt', NuxtT, mountNuxt],
]

afterEach(() => vi.restoreAllMocks())

describe.each(sides)('%s i18n-t', (_side, component, mountIt) => {
  test('a slot is mounted once however often the parent renders', async () => {
    let mounts = 0
    const Child = defineComponent({
      setup() {
        onMounted(() => mounts++)
        return () => h('input')
      },
    })
    const tick = ref(0)
    // a hand-written parent passes a new slots object on every render
    const Parent = defineComponent({
      setup: () => () => h(component, { keypath: 'order', 'data-tick': tick.value }, { a: () => h(Child), b: () => 'B' }),
    })
    const { wrapper } = mountIt(Parent, messages)
    const input = wrapper.find('input').element
    for (let i = 0; i < 3; i++) {
      tick.value++
      await flushPromises()
    }
    expect(mounts).toBe(1)
    expect(wrapper.find('input').element).toBe(input)
    wrapper.unmount()
  })

  test('a reordered translation keeps the DOM of its slots', async () => {
    const keypath = ref('order')
    const Parent = defineComponent({
      setup: () => () => h(component, { keypath: keypath.value }, { a: () => h('input', { id: 'a' }), b: () => h('input', { id: 'b' }) }),
    })
    const { wrapper } = mountIt(Parent, messages)
    const a = wrapper.find('#a').element
    keypath.value = 'reorder'
    await flushPromises()
    expect(wrapper.text()).toBe('then')
    expect(wrapper.find('#a').element).toBe(a)
    expect(wrapper.find('#b').element.nextElementSibling).toBe(a)
    wrapper.unmount()
  })

  test('every occurrence of a repeated placeholder gets its own slot content', () => {
    const { wrapper } = mountIt(component, messages, { props: { keypath: 'repeat' }, slots: { a: () => h('b', 'A') } })
    expect(wrapper.findAll('b')).toHaveLength(2)
    wrapper.unmount()
  })

  test('a slot declared with a scope gets one', () => {
    const { wrapper } = mountIt(component, messages, { props: { keypath: 'order' }, slots: { a: ({ x = 'scoped' }: { x?: string }) => x } })
    expect(wrapper.text()).toBe('scoped then {b}')
    wrapper.unmount()
  })
})

describe('date output across hydration', () => {
  const render = async (mountApp: (at: number) => ReturnType<typeof createSSRApp>) => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(Date.UTC(2024, 5, 15, 12, 0, 0))
    const html = await renderToString(mountApp(0))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.setSystemTime(Date.UTC(2024, 5, 15, 12, 1, 0))
    const root = document.createElement('div')
    root.innerHTML = html
    mountApp(1).mount(root)
    vi.useRealTimers()
    return { html, warnings: [...warn.mock.calls, ...error.mock.calls].flat().map(String) }
  }
  const relativeDate = Date.UTC(2024, 5, 15, 11, 59, 30)

  test.each([
    ['vue', I18nT],
    ['nuxt', NuxtT],
  ] as [string, Component][])('%s: a date next to a slot does not warn either', async (side, component) => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'index', { dated: '{relativeDate}: {who}' })
    wireNuxtApp(i18n)
    const { html, warnings } = await render(() => {
      const app = createSSRApp({ render: () => h(component, { keypath: 'dated', relativeDate }, { who: () => h('b', 'x') }) })
      if (side === 'vue') app.provide(I18nInjectionKey, vueInstance({ en: { dated: '{relativeDate}: {who}' } }))
      return app
    })
    expect(html).toContain('<b>x</b>')
    expect(warnings.filter((line) => /Hydration/.test(line))).toEqual([])
  })

  test('vue: a clock that moved on does not warn', async () => {
    const { html, warnings } = await render(() => {
      const app = createSSRApp({ render: () => h(I18nT, { keypath: 'ago', relativeDate }) })
      app.provide(I18nInjectionKey, vueInstance(messages))
      return app
    })
    expect(html).toContain('30 seconds ago')
    expect(html).toContain('data-allow-mismatch="text"')
    expect(warnings.filter((line) => line.includes('Hydration'))).toEqual([])
  })

  test('nuxt: a clock that moved on does not warn', async () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'index', messages.en)
    wireNuxtApp(i18n)
    const { html, warnings } = await render(() => createSSRApp({ render: () => h(NuxtT, { keypath: 'ago', relativeDate }) }))
    expect(html).toContain('data-allow-mismatch="text"')
    expect(warnings.filter((line) => line.includes('Hydration'))).toEqual([])
  })
})

describe('the Nuxt i18n-t reads what $t reads', () => {
  test('an evicted chunk still renders from the active dictionary', () => {
    const i18n = new NuxtI18n({ missingWarn: false, cacheMaxSize: 1 })
    i18n.setRouteContextResolver(() => ({ locale: 'en', routeName: 'index' }))
    i18n.applySwitchContext('en', 'index', { hi: 'Hello' })
    i18n.setChunk('en', 'other', { x: '1' })
    expect(i18n.hasChunk('en', 'index')).toBe(false)
    wireNuxtApp(i18n)
    const wrapper = mount(NuxtT as never, { props: { keypath: 'hi' } as never })
    expect(wrapper.text()).toBe('Hello')
    wrapper.unmount()
  })

  test('no route-bound lookup per render', () => {
    const route = vi.fn()
    const { wrapper } = mountNuxt(NuxtT, messages, { props: { keypath: 'order' }, provide: { $_t: route } })
    wrapper.unmount()
    expect(route).not.toHaveBeenCalled()
  })
})

describe.each([
  ['vue', I18nGroup, mountVue],
  ['nuxt', NuxtGroup, mountNuxt],
] as [string, Component, typeof mountVue][])('%s i18n-group', (_side, component, mountIt) => {
  test('scopes keys to its prefix', () => {
    const options: MountOptions = {
      props: { prefix: 'group' },
      slots: { default: ({ t }: { t: (k: string, p: object) => string }) => t('deep', { x: 1 }) },
    }
    const { wrapper } = mountIt(component, messages, options)
    expect(wrapper.text()).toBe('Deep 1')
    wrapper.unmount()
  })
})

const LOCALES: Locale[] = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'ar', iso: 'ar-EG', dir: 'rtl', displayName: 'العربية' },
]

/** Both switchers over one navigation spy. */
function mountSwitcher(side: 'vue' | 'nuxt', options: { host?: (inner: Component) => Component } = {}) {
  const select = vi.fn()
  const inner = side === 'vue' ? I18nSwitcher : NuxtSwitcher
  const component = options.host ? options.host(inner) : inner
  const passedProps = side === 'vue' ? { switchLocale: select, localeRoute: (_: unknown, code?: string) => `/${code}/page` } : {}
  if (side === 'vue') {
    const provide = { [I18nLocalesKey as symbol]: LOCALES }
    return { select, ...mountVue(component, messages, { props: passedProps, provide }) }
  }
  const provide = {
    $getLocales: () => LOCALES,
    $getLocaleName: () => 'English',
    $switchLocalePath: (code: string) => `/${code}/page`,
    $switchLocale: select,
  }
  return { select, ...mountNuxt(component, messages, { provide }) }
}

const click = (init: MouseEventInit = {}) => new MouseEvent('click', { bubbles: true, cancelable: true, ...init })

describe.each(['vue', 'nuxt'] as const)('%s switcher', (side) => {
  const open = async (wrapper: ReturnType<typeof mountVue>['wrapper']) => {
    await wrapper.find('button').trigger('click')
    await flushPromises()
  }
  const listed = (wrapper: ReturnType<typeof mountVue>['wrapper']) => {
    const list = wrapper.find('.i18n-switcher-dropdown')
    return list.exists() && (list.element as HTMLElement).style.display !== 'none'
  }

  test('a plain click is one navigation, and closes the list', async () => {
    const { wrapper, select } = mountSwitcher(side)
    await open(wrapper)
    const event = click()
    wrapper.find('.switcher-locale-ar').element.dispatchEvent(event)
    await flushPromises()
    expect(select).toHaveBeenCalledTimes(1)
    expect(select).toHaveBeenCalledWith('ar')
    expect(event.defaultPrevented).toBe(true)
    expect(listed(wrapper)).toBe(false)
    wrapper.unmount()
  })

  test.each([['ctrlKey'], ['metaKey'], ['shiftKey'], ['altKey']])("%s + click is the browser's", async (key) => {
    const { wrapper, select } = mountSwitcher(side)
    await open(wrapper)
    const event = click({ [key]: true })
    wrapper.find('.switcher-locale-ar').element.dispatchEvent(event)
    await flushPromises()
    expect(select).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
    wrapper.unmount()
  })

  test('inside a form the button does not submit it', async () => {
    const submit = vi.fn((event: Event) => event.preventDefault())
    const { wrapper } = mountSwitcher(side, {
      host: (inner) =>
        defineComponent({
          setup:
            (_, { attrs }) =>
            () =>
              h('form', { onSubmit: submit }, [h(inner, attrs)]),
        }),
    })
    ;(wrapper.find('button').element as HTMLButtonElement).click()
    await flushPromises()
    expect(submit).not.toHaveBeenCalled()
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    wrapper.unmount()
  })

  test('Escape and a click outside close it; two switchers never stay open together', async () => {
    const first = mountSwitcher(side)
    const second = mountSwitcher(side)
    await open(first.wrapper)
    await second.wrapper.find('button').element.dispatchEvent(click())
    await flushPromises()
    expect(listed(first.wrapper)).toBe(false)
    expect(listed(second.wrapper)).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(listed(second.wrapper)).toBe(false)
    await open(first.wrapper)
    document.body.click()
    await flushPromises()
    expect(listed(first.wrapper)).toBe(false)
    first.wrapper.unmount()
    second.wrapper.unmount()
  })

  test('removes its document listeners', () => {
    const remove = vi.spyOn(document, 'removeEventListener')
    const { wrapper } = mountSwitcher(side)
    wrapper.unmount()
    expect(remove.mock.calls.map(([type]) => type)).toEqual(expect.arrayContaining(['click', 'keydown']))
  })

  test('RTL: logical CSS, and each label states its language and direction', async () => {
    const { wrapper } = mountSwitcher(side)
    await open(wrapper)
    const list = wrapper.find('.i18n-switcher-dropdown').attributes('style')
    expect(list).toContain('inset-inline-start')
    expect(list).not.toMatch(/(^|\s)left:/)
    expect(wrapper.find('button').html()).toContain('margin-inline-start')
    const link = wrapper.find('.switcher-locale-ar')
    expect(link.attributes()).toMatchObject({ lang: 'ar-EG', hreflang: 'ar-EG', dir: 'rtl' })
    wrapper.unmount()
  })

  test('every attribute reaches the root, on the client and on the server', async () => {
    const attrs = { id: 'lang', 'data-testid': 'sw', 'aria-label': 'Language', title: 'T', class: 'mine', style: 'color: red' }
    const { wrapper } = mountSwitcher(side, { host: (inner) => defineComponent({ setup: () => () => h(inner, attrs) }) })
    expect(wrapper.find('#lang').attributes()).toMatchObject({ 'data-testid': 'sw', 'aria-label': 'Language', title: 'T' })
    expect(wrapper.find('#lang').classes()).toEqual(['i18n-switcher-wrapper', 'mine'])
    wrapper.unmount()
  })

  test('a slot that appears after mount renders', async () => {
    const show = ref(false)
    const { wrapper } = mountSwitcher(side, {
      host: (inner) => defineComponent({ setup: () => () => h(inner, null, show.value ? { 'before-button': () => h('em', 'new') } : {}) }),
    })
    expect(wrapper.find('em').exists()).toBe(false)
    show.value = true
    await flushPromises()
    expect(wrapper.find('em').exists()).toBe(true)
    wrapper.unmount()
  })

  test('the current locale is marked for assistive tech', async () => {
    const { wrapper } = mountSwitcher(side)
    await open(wrapper)
    expect(wrapper.find('.switcher-locale-en').attributes('aria-current')).toBe('page')
    expect(wrapper.find('.switcher-locale-ar').attributes('aria-current')).toBeUndefined()
    wrapper.unmount()
  })

  test('both class names, so styles of either side keep working', () => {
    const { wrapper } = mountSwitcher(side)
    expect(wrapper.find('button').classes()).toEqual(['i18n-switcher-button', 'language-switcher'])
    expect(wrapper.classes()).toContain('i18n-switcher-wrapper')
    wrapper.unmount()
  })
})

test('the Nuxt switcher keeps its links in the server HTML, the Vue one renders them on opening', async () => {
  const i18n = new NuxtI18n({ missingWarn: false })
  i18n.applySwitchContext('en', 'index', {})
  wireNuxtApp(i18n, {
    $getLocales: () => LOCALES,
    $getLocaleName: () => 'English',
    $switchLocalePath: (code: string) => `/${code}/page`,
    $switchLocale: () => {},
  })
  expect(await renderToString(createSSRApp({ render: () => h(NuxtSwitcher) }))).toContain('href="/ar/page"')
  const app = createSSRApp({ render: () => h(I18nSwitcher, { locales: LOCALES }) })
  app.provide(I18nInjectionKey, vueInstance(messages))
  expect(await renderToString(app)).not.toContain('switcher-locale-ar')
})

describe('the Nuxt switcher under app.baseURL', () => {
  afterEach(() => {
    routerBase.value = ''
  })

  test('links carry the base, in the server HTML too; a URL of another domain stays as it is', async () => {
    routerBase.value = '/app'
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'index', {})
    wireNuxtApp(i18n, {
      $getLocales: () => LOCALES,
      $getLocaleName: () => 'English',
      $switchLocalePath: (code: string) => (code === 'ar' ? 'https://example.ae/page' : `/${code}/page`),
      $switchLocale: () => {},
    })
    const html = await renderToString(createSSRApp({ render: () => h(NuxtSwitcher) }))
    expect(html).toContain('href="/app/en/page"')
    expect(html).toContain('href="https://example.ae/page"')
  })
})

test('a Vue listener that throws stops neither the write nor the others', () => {
  const i18n = vueInstance({ en: {} })
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const after = vi.fn()
  i18n.subscribeToChanges(() => {
    throw new Error('boom')
  })
  i18n.subscribeToChanges(after)
  i18n.addTranslations('en', { hi: 'Hello' })
  expect(after).toHaveBeenCalledTimes(1)
  expect(i18n.t('hi')).toBe('Hello')
  expect(error).toHaveBeenCalled()
})

test('a shallow prop change re-renders a functional I18nT', async () => {
  const keypath = shallowRef('order')
  const { wrapper } = mountVue(defineComponent({ setup: () => () => h(I18nT, { keypath: keypath.value, params: { a: 1, b: 2 } }) }), messages)
  expect(wrapper.text()).toBe('1 then 2')
  keypath.value = 'reorder'
  await flushPromises()
  expect(wrapper.text()).toBe('2 then 1')
  wrapper.unmount()
})
