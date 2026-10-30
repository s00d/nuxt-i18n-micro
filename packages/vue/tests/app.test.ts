// An app without vue-router: createI18n installed as a plugin, translations loaded after mount,
// the built-in components in their documented modes, and a hand-written routing strategy.
import type { Locale } from '@i18n-micro/types'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createApp, defineComponent, h, ref, resolveComponent } from 'vue'
import { createI18n, I18nGroup, I18nLink, I18nSwitcher, I18nT, useI18n, useLocaleHead } from '../src'
import type { I18nRoutingStrategy } from '../src'

const locales: Locale[] = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
  { code: 'uk', iso: 'uk-UA', disabled: true },
]

const en = {
  lead: '{first} and {tail}',
  greeting: 'Hello, {name}!',
  apples: 'no apples | one apple | {count} apples',
  price: 'Price: {number}',
  posted: 'Posted {date}',
  updated: 'Updated {relativeDate}',
  rich: '<b>{count}</b> new',
  terms: 'Accept {link} and {policy}.',
  blank: '   ',
  profile: { name: 'Name', hint: 'Hi {who}' },
}
const de = { greeting: 'Hallo, {name}!', apples: 'keine Äpfel | ein Apfel | {count} Äpfel', profile: { name: 'Name (de)' } }

let wrapper: ReturnType<typeof mount> | undefined
// relative dates are measured against a frozen clock
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2025-06-01T12:00:00Z'))
})
afterEach(() => {
  vi.useRealTimers()
  wrapper?.unmount()
  wrapper = undefined
})

function setup(extra: Partial<Parameters<typeof createI18n>[0]> = {}) {
  return createI18n({ locale: 'en', fallbackLocale: 'en', messages: { en }, locales, defaultLocale: 'en', missingWarn: false, ...extra })
}

test('translations load after mount and every reader re-renders: setup t, global $t, I18nT, I18nGroup', async () => {
  const missing = vi.fn()
  const i18n = setup({ messages: { en: {} }, missingHandler: missing })
  const changes = vi.fn()
  const unsubscribe = i18n.global.subscribeToChanges(changes)
  let api!: ReturnType<typeof useI18n>
  const Options = defineComponent({
    render() {
      return h('p', { id: 'opts' }, [this.$t('greeting', { name: 'Ann' }), '|', this.$tc('apples', 2), '|', String(this.$has('greeting'))])
    },
  })
  const App = defineComponent({
    setup() {
      api = useI18n()
      return () =>
        h('main', [
          h('h1', api.t('greeting', { name: 'Bob' })),
          h(Options),
          // the components as a template uses them: registered globally by the plugin
          h(resolveComponent('I18nT'), { keypath: 'apples', plural: 1, tag: 'em', class: 'count' }),
          h(resolveComponent('I18nLink'), { id: 'faq', to: '#faq' }, () => 'FAQ'),
          h(resolveComponent('I18nLink'), { id: 'root', to: {} }, () => 'Root'),
          h(resolveComponent('I18nSwitcher')),
          h(
            resolveComponent('I18nGroup'),
            { prefix: 'profile', groupClass: 'card' },
            {
              default: ({ t, prefix }: { t: (k: string, p?: object) => string; prefix: string }) => [
                prefix,
                ':',
                t('name'),
                ':',
                t('hint', { who: 'me' }),
              ],
            },
          ),
        ])
    },
  })
  wrapper = mount(App, { global: { plugins: [i18n] } })

  // nothing loaded yet: keys come back, the missing handler sees each miss with its route
  expect(wrapper.find('h1').text()).toBe('greeting')
  expect(wrapper.find('#opts').text()).toBe('greeting|apples|false')
  expect(missing).toHaveBeenCalledWith('en', 'greeting', 'index')

  i18n.global.addTranslations('en', en)
  // merge is the default: a second, partial load keeps the rest
  i18n.global.addTranslations('en', { greeting: en.greeting })
  expect(changes).toHaveBeenCalledTimes(2)
  await flushPromises()
  expect(wrapper.find('h1').text()).toBe('Hello, Bob!')
  expect(wrapper.find('#opts').text()).toBe('Hello, Ann!|2 apples|true')
  expect(wrapper.find('em').html()).toBe('<em class="count">one apple</em>')
  expect(wrapper.find('div.i18n-group.card').text()).toBe('profile:Name:Hi me')

  // no router: links are plain anchors that navigate the page themselves
  expect(wrapper.find('#root').attributes('href')).toBe('/')
  const click = new MouseEvent('click', { bubbles: true, cancelable: true })
  wrapper.find('#faq').element.dispatchEvent(click)
  expect(click.defaultPrevented).toBe(true)
  expect(window.location.hash).toBe('#faq')

  // a second locale arrives and the user picks it in the switcher; missing keys fall back to en
  api.addTranslations('de', de)
  await wrapper.find('button').trigger('click')
  await wrapper.find('.switcher-locale-de').trigger('click')
  await flushPromises()
  expect(api.getLocale()).toBe('de')
  expect(api.getLocaleName()).toBe('Deutsch')
  expect(wrapper.find('h1').text()).toBe('Hallo, Bob!')
  expect(wrapper.find('em').text()).toBe('ein Apfel')
  expect(wrapper.find('div.i18n-group').text()).toBe('profile:Name (de):Hi me')
  expect(api.has('profile.hint')).toBe(false)
  expect(api.ts('profile.hint', { who: 'x' })).toBe('Hi x')

  // page-level translations for one route override the root ones while that route is active
  api.addRouteTranslations('de', 'settings', { profile: { name: 'Profilname' } })
  api.addRouteTranslations('de', 'settings', { profile: { extra: 'x' } })
  api.setRoute('settings')
  await flushPromises()
  expect(api.getRoute()).toBe('settings')
  expect(wrapper.find('div.i18n-group').text()).toBe('profile:Profilname:Hi me')
  api.mergeTranslations('de', 'settings', { profile: { hint: 'Hallo {who}' } })
  await flushPromises()
  expect(wrapper.find('div.i18n-group').text()).toBe('profile:Profilname:Hallo me')
  expect(api.resolveTranslations().profile).toEqual({ name: 'Profilname', extra: 'x', hint: 'Hallo {who}' })
  // what devtools read: every loaded chunk, keyed by locale and route
  expect(Object.keys(i18n.global.getRouteCache()).sort()).toEqual([...i18n.global.getStorage().translations.keys()].sort())
  expect(Object.values(i18n.global.getRouteCache())).toContainEqual({ profile: { name: 'Profilname', extra: 'x', hint: 'Hallo {who}' } })
  expect(i18n.global.currentRoute.value).toBe('settings')
  api.setRoute('index')
  await flushPromises()
  expect(wrapper.find('div.i18n-group').text()).toBe('profile:Name (de):Hi me')

  // replacing (merge=false) drops keys; setTranslation edits the active locale in place
  api.addTranslations('de', { greeting: 'Servus, {name}!' }, false)
  api.setTranslation('apples', 'Äpfel: {count}')
  await flushPromises()
  expect(wrapper.find('h1').text()).toBe('Servus, Bob!')
  expect(wrapper.find('em').text()).toBe('Äpfel: 1')
  expect(wrapper.find('div.i18n-group').text()).toBe('profile:Name:Hi me')

  // the plugin also exposes the instance to options-API code
  const vm = wrapper.findComponent(Options).vm as unknown as Record<string, (...a: unknown[]) => string> & { $i18n: unknown }
  expect(vm.$i18n).toBe(i18n.global)
  expect(vm.$ts('missing.key', undefined, 'fallback')).toBe('fallback')
  expect(vm.$t('missing.key', undefined, 'dflt')).toBe('dflt')
  expect(vm.$tn(1234.5)).toBe('1.234,5')
  expect(vm.$td(new Date(Date.UTC(2024, 0, 15)), { timeZone: 'UTC' })).toBe('15.1.2024')
  expect(vm.$tdr(Date.now() + 3 * 86_400_000)).toBe('in 3 Tagen')
  expect(vm.$tc('nope', 1, 'none')).toBe('none')

  // the locale and fallback can be driven by an app-owned ref or a plain string
  const appLocale = ref('en')
  i18n.global.locale = appLocale
  i18n.global.fallbackLocale = 'de'
  expect(i18n.global.getFallbackLocale()).toBe('de')
  const appFallback = ref('en')
  i18n.global.fallbackLocale = appFallback
  appFallback.value = 'de'
  expect(i18n.global.fallbackLocale.value).toBe('de')
  appLocale.value = 'de'
  expect(i18n.global.getLocale()).toBe('de')

  const calls = changes.mock.calls.length
  unsubscribe()
  api.clearCache()
  expect(changes).toHaveBeenCalledTimes(calls)
  await flushPromises()
  expect(wrapper.find('h1').text()).toBe('greeting')
})

test('I18nT renders numbers, dates, plurals, HTML, slots and empty values', async () => {
  const i18n = setup({ messages: { en, de } })
  const now = Date.now()
  const App = defineComponent({
    setup: () => () =>
      h('div', [
        h(I18nT, { id: 'num', keypath: 'price', number: '1500' }),
        h(I18nT, { id: 'date', keypath: 'posted', date: new Date(Date.UTC(2024, 4, 1, 12)) }),
        h(I18nT, { id: 'rel', keypath: 'updated', relativeDate: now - 2 * 3_600_000 }),
        h(I18nT, { id: 'html', keypath: 'rich', plural: '3', html: true, tag: 'p' }),
        h(I18nT, { id: 'text', keypath: 'rich', plural: 3 }),
        h(I18nT, {
          id: 'rule',
          keypath: 'apples',
          plural: 4,
          customPluralRule: (key: string, count: number, params: object, locale: string, t: (k: string, p?: object) => string) =>
            `${locale}:${count}:${t('greeting', params)}`,
          params: { name: 'Z' },
        }),
        h(I18nT, { id: 'rule-empty', keypath: 'apples', plural: 4, customPluralRule: () => null }),
        h(I18nT, { id: 'plain', keypath: 'greeting', params: { name: '<i>x</i>' }, html: true }),
        h(I18nT, { keypath: 'blank', hideIfEmpty: true, defaultValue: 'nothing here' }),
        h(I18nT, { id: 'named', keypath: 'terms', tag: 'label' }, { link: () => h('a', 'terms'), policy: () => h('b', 'policy') }),
        h(
          I18nT,
          { id: 'slot', keypath: 'greeting', params: { name: 'S' } },
          { default: ({ translation }: { translation: string }) => `[${translation}]` },
        ),
        h(I18nT, { id: 'blank-shown', keypath: 'blank' }),
        // template-style boolean attributes (`<I18nT html hide-if-empty />`) arrive as ''
        h(I18nT, { id: 'tpl-html', keypath: 'rich', plural: 2, html: '' }),
        h('i', { id: 'tpl-hide' }, [h(I18nT, { keypath: 'blank', hideIfEmpty: '' })]),
        h(I18nT, { id: 'lead', keypath: 'lead' }, { first: () => h('b', '1'), absent: () => h('b', 'x'), tail: () => h('i', 't') }),
        // fallthrough innerHTML cannot bypass html=false
        h(I18nT, { id: 'attrs', keypath: 'rich', plural: 1, innerHTML: '<img src=x>', title: 't' }),
      ]),
  })
  wrapper = mount(App, { global: { plugins: [i18n] } })
  const html = (id: string) => wrapper!.find(`#${id}`).html()

  expect(html('num')).toBe('<span id="num">Price: 1,500</span>')
  expect(html('date')).toBe('<span id="date">Posted 5/1/2024</span>')
  expect(html('rel')).toBe('<span id="rel">Updated 2 hours ago</span>')
  expect(html('html')).toBe('<p id="html"><b>3</b> new</p>')
  expect(html('text')).toBe('<span id="text">&lt;b&gt;3&lt;/b&gt; new</span>')
  expect(html('rule')).toBe('<span id="rule">en:4:Hello, Z!</span>')
  expect(html('rule-empty')).toBe('<span id="rule-empty"></span>')
  expect(html('plain')).toBe('<span id="plain">Hello, <i>x</i>!</span>')
  expect(wrapper.text()).toContain('nothing here')
  expect(html('named')).toBe('<label id="named">Accept <a>terms</a> and <b>policy</b>.</label>')
  expect(html('slot')).toBe('<span id="slot">[Hello, S!]</span>')
  expect(html('blank-shown')).toBe('<span id="blank-shown">   </span>')
  expect(html('tpl-html')).toBe('<span id="tpl-html"><b>2</b> new</span>')
  expect(html('tpl-hide')).toBe('<i id="tpl-hide"></i>')
  expect(html('lead')).toBe('<span id="lead"><b>1</b> and <i>t</i></span>')
  expect(html('attrs')).toBe('<span id="attrs" title="t">&lt;b&gt;1&lt;/b&gt; new</span>')

  i18n.global.locale.value = 'de'
  await flushPromises()
  expect(html('num')).toBe('<span id="num">Price: 1.500</span>')
  expect(html('date')).toBe('<span id="date">Posted 1.5.2024</span>')
  expect(html('rel')).toBe('<span id="rel">Updated vor 2 Stunden</span>')
  expect(html('rule')).toBe('<span id="rule">de:4:Hallo, Z!</span>')
})

test('I18nLink and I18nSwitcher with a hand-written routing strategy', async () => {
  const path = ref('/de/about/#team')
  const push = vi.fn((to: { path: string }) => {
    path.value = to.path
  })
  const strategy: I18nRoutingStrategy = {
    getCurrentPath: () => path.value,
    push,
    replace: push,
    resolvePath: (to, locale) => ({ path: `/${locale}${typeof to === 'string' ? to.replace(/^\/(en|de)/, '') : to.path}` }),
  }
  const i18n = setup({ locale: 'de', messages: { en, de } })
  let api!: ReturnType<typeof useI18n>
  const App = defineComponent({
    setup: () => {
      api = useI18n()
      return () =>
        h('nav', [
          h(I18nLink, { id: 'about', to: '/about#team', activeStyle: { color: 'red' } }, () => 'About'),
          h(I18nLink, { id: 'home', to: { path: '/' } }, () => 'Home'),
          h(I18nLink, { id: 'ext', to: 'https://example.com/a', activeStyle: { color: 'red' } }, () => 'Ext'),
          h(I18nLink, { id: 'mail', to: 'mailto:a@b.c' }, () => 'Mail'),
          h(I18nLink, { id: 'own', to: '/x', localeRoute: () => ({}) }, () => 'Own'),
          h(I18nLink, { id: 'own-path', to: '/x', localeRoute: (to: string) => ({ path: `/own${to}` }) }, () => 'Own path'),
          ...['cdn.example.com/a.js', '//cdn.example.com/a.js', 'http://example.com', 'tel:+100', '/guide.html'].map((to, i) =>
            h(I18nLink, { class: 'kind', 'data-i': i, to }, () => to),
          ),
          h(
            I18nSwitcher,
            {
              customWrapperStyle: { margin: '1px' },
              customButtonStyle: { color: 'green' },
              customDropdownStyle: { top: '0px' },
              customItemStyle: { padding: '2px' },
              customLinkStyle: { color: 'gray' },
              customActiveLinkStyle: { color: 'navy' },
              customIconStyle: { opacity: '0.5' },
            },
            {
              'before-button': () => h('i', 'bb'),
              'before-selected-locale': () => 'flag:',
              'after-selected-locale': () => [h('i', 'as')],
              'before-dropdown': () => h('i', 'bd'),
              'before-dropdown-items': () => h('li', 'first'),
              'before-item': ({ locale }: { locale: Locale }) => h('i', `bi-${locale.code}`),
              'before-link-content': ({ locale }: { locale: Locale }) => `${locale.code}=`,
              'after-link-content': () => '!',
              'after-item': ({ locale }: { locale: Locale }) => h('i', `ai-${locale.code}`),
              'after-dropdown-items': () => h('li', 'last'),
              'after-dropdown': () => h('i', 'ad'),
            },
          ),
        ])
    },
  })
  // install order: the strategy can arrive after app.use(i18n), before mount
  const early = createApp(App).use(i18n)
  i18n.setRoutingStrategy(strategy)
  const host = document.createElement('div')
  early.mount(host)
  expect(host.querySelector('#about')!.getAttribute('href')).toBe('/de/about#team')
  early.unmount()
  wrapper = mount(App, { global: { plugins: [i18n] }, attachTo: document.body })
  expect(i18n.global.fallbackLocale.value).toBe('en')

  const about = wrapper.find('#about')
  // the active check ignores the hash and a trailing slash
  expect(about.attributes('href')).toBe('/de/about#team')
  expect(about.attributes('style')).toBe('color: red;')
  expect(wrapper.find('#home').attributes('href')).toBe('/de/')
  expect(wrapper.find('#home').attributes('style')).toBeUndefined()
  expect(wrapper.find('#own').attributes('href')).toBe('/')
  expect(wrapper.find('#own-path').attributes('href')).toBe('/own/x')
  expect(wrapper.findAll('.kind').map((a) => a.attributes('target'))).toEqual(['_blank', '_blank', '_blank', '_blank', undefined])
  expect(wrapper.findAll('.kind').map((link) => link.attributes('href'))).toEqual([
    'https://cdn.example.com/a.js',
    '//cdn.example.com/a.js',
    'http://example.com',
    'tel:+100',
    '/de/guide.html',
  ])
  expect(wrapper.find('#mail').attributes('href')).toBe('mailto:a@b.c')
  const ext = wrapper.find('#ext')
  expect([ext.attributes('href'), ext.attributes('target'), ext.attributes('rel'), ext.attributes('style')]).toEqual([
    'https://example.com/a',
    '_blank',
    'noopener noreferrer',
    undefined,
  ])
  expect(wrapper.find('#mail').attributes('target')).toBe('_blank')

  const click = new MouseEvent('click', { bubbles: true, cancelable: true })
  wrapper.find('#home').element.dispatchEvent(click)
  expect(click.defaultPrevented).toBe(true)
  expect(push).toHaveBeenLastCalledWith({ path: '/de/' })
  await flushPromises()
  // the style patch clears the active one
  expect(wrapper.find('#about').attributes('style')).toBe('')

  const button = wrapper.find('button')
  expect(wrapper.find('.i18n-switcher-wrapper').attributes('style')).toBe(
    'position: relative; display: inline-block; vertical-align: middle; margin: 1px;',
  )
  expect(button.attributes('style')).toBe(
    'padding: 4px 12px; font-size: 16px; cursor: pointer; background-color: rgb(255, 255, 255); border: 1px solid rgb(51, 51, 51); transition: background-color 0.3s ease; display: flex; align-items: center; justify-content: space-between; color: green;',
  )
  expect(button.attributes('type')).toBe('button')
  expect(button.findAll('span')[1]!.attributes('style')).toBe(
    'margin-left: 8px; display: inline-block; transition: transform 0.3s ease; opacity: 0.5;',
  )
  expect(wrapper.find('.i18n-switcher-wrapper').text()).toBe('bbflag:Deutschas▼bdad')

  await button.trigger('click')
  expect(button.findAll('span')[1]!.attributes('style')).toContain('transform: rotate(180deg);')
  const dropdown = wrapper.find('.i18n-switcher-dropdown')
  expect(dropdown.attributes('style')).toBe(
    'position: absolute; top: 0px; left: 0px; z-index: 1000; background-color: rgb(255, 255, 255); border: 1px solid rgb(51, 51, 51); list-style: none; padding: 0px; margin: 4px 0px 0px; min-width: 150px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);',
  )
  expect(dropdown.findAll('li').map((li) => li.text())).toEqual(['first', 'bi-enen=English!ai-en', 'bi-dede=Deutsch!ai-de', 'last'])
  expect(dropdown.findAll('li')[1]!.attributes('style')).toBe('margin: 0px; padding: 2px;')
  expect(wrapper.find('.switcher-locale-en').attributes('style')).toBe(
    'display: block; padding: 8px 12px; color: gray; text-decoration: none; transition: background-color 0.3s ease; cursor: pointer;',
  )
  // customActiveLinkStyle wins over customLinkStyle
  expect(wrapper.find('.switcher-locale-de').attributes('style')).toBe(
    'display: block; padding: 8px 12px; color: navy; text-decoration: none; transition: background-color 0.3s ease; cursor: not-allowed; font-weight: bold;',
  )
  // the dropdown links are built from the browser location (jsdom: /)
  expect(wrapper.find('.switcher-locale-en').attributes('href')).toBe('/en/')

  // a click on the button again closes it; reopening and picking a locale pushes the resolved path
  await button.trigger('click')
  expect(wrapper.find('.i18n-switcher-dropdown').exists()).toBe(false)
  await button.trigger('click')
  await wrapper.find('.switcher-locale-en').trigger('click')
  await flushPromises()
  expect(i18n.global.getLocale()).toBe('en')
  expect(push).toHaveBeenLastCalledWith({ path: '/en/' })
  expect(wrapper.find('#about').attributes('href')).toBe('/en/about#team')
  expect(button.text()).toBe('flag:Englishas▼')

  // switchLocale from code pushes the path the strategy resolves
  api.switchLocale('de')
  expect(push).toHaveBeenLastCalledWith({ path: '/de/' })

  // a strategy without resolvePath keeps the current path
  delete strategy.resolvePath
  await button.trigger('click')
  await wrapper.find('.switcher-locale-en').trigger('click')
  await flushPromises()
  expect(push).toHaveBeenLastCalledWith({ path: '/de/' })
  expect(i18n.global.getLocale()).toBe('en')
})

test('I18nSwitcher driven by props: own locales, current locale, label and switch handler', async () => {
  const i18n = setup({ locale: 'uk', messages: { en, de } })
  const switched = vi.fn()
  const routeTo = vi.fn((to: string | { path?: string }, locale?: string) => (locale === 'en' ? { path: `/${locale}` } : {}))
  const props = ref<Record<string, unknown>>({
    locales: [{ code: 'en', displayName: 'English' }, { code: 'pt' }, { code: 'uk', displayName: 'Українська', disabled: true }],
    customDisabledLinkStyle: { opacity: '0.3' },
    customButtonStyle: { color: 'teal' },
  })
  const App = defineComponent({ setup: () => () => h(I18nSwitcher, props.value) })
  wrapper = mount(App, { global: { plugins: [i18n] }, attachTo: document.body })
  const button = () => wrapper!.find('button')

  // a disabled current locale still names itself on the button and gets the disabled style
  expect(button().text()).toBe('Українська▼')
  expect(button().attributes('style')).toContain('color: teal; opacity: 0.3;')
  await button().trigger('click')
  expect(wrapper.findAll('.i18n-switcher-dropdown a').map((a) => a.text())).toEqual(['English', 'pt'])
  expect(wrapper.find('.switcher-locale-pt').attributes('href')).toBe('/')

  props.value = { ...props.value, currentLocale: () => 'pt', getLocaleName: () => 'Custom name', switchLocale: switched, localeRoute: routeTo }
  await flushPromises()
  expect(button().text()).toBe('pt▼')
  expect(button().attributes('style')).not.toContain('opacity')
  expect(wrapper.find('.switcher-locale-en').attributes('href')).toBe('/en')
  expect(wrapper.find('.switcher-locale-pt').attributes('href')).toBe('#')
  await wrapper.find('.switcher-locale-en').trigger('click')
  await flushPromises()
  // the handler owns the switch: the instance locale is untouched
  expect(switched).toHaveBeenCalledWith('en')
  expect(i18n.global.getLocale()).toBe('uk')

  props.value = { ...props.value, currentLocale: 'xx', locales: [{ code: 'en' }] }
  await flushPromises()
  expect(button().text()).toBe('Custom name▼')
  props.value = { ...props.value, getLocaleName: () => null }
  await flushPromises()
  expect(button().text()).toBe('xx▼')
  // a current locale missing from the list is named after the active one when that is listed
  props.value = { locales: [{ code: 'uk', displayName: 'Українська' }], currentLocale: 'xx' }
  await flushPromises()
  expect(button().text()).toBe('Українська▼')
})

test('I18nSwitcher with a router strategy and its own localeRoute; useLocaleHead without a router', async () => {
  const path = ref('/en/blog')
  const push = vi.fn((to: { path: string }) => {
    path.value = to.path
  })
  const i18n = setup({ messages: { en, de }, routingStrategy: { getCurrentPath: () => path.value, push, replace: push } })
  let head!: ReturnType<typeof useLocaleHead>
  let api!: ReturnType<typeof useI18n>
  const App = defineComponent({
    setup() {
      api = useI18n({ locales: [{ code: 'en' }, { code: 'de' }], defaultLocale: 'de' })
      head = useLocaleHead()
      return () => h(I18nSwitcher, { localeRoute: (to: string, locale: string) => (locale === 'de' ? `/de${to}` : {}) })
    },
  })
  wrapper = mount(App, { global: { plugins: [i18n] } })
  expect(api.getLocales()).toEqual([{ code: 'en' }, { code: 'de' }])
  expect(api.defaultLocale()).toBe('de')
  // no resolvePath: paths pass through unchanged
  expect(api.localeRoute('/a', 'de')).toBe('/a')
  expect(api.localePath({ path: '/b' })).toBe('/b')
  expect(api.localePath({})).toBe('/')

  await wrapper.find('button').trigger('click')
  await wrapper.find('.switcher-locale-de').trigger('click')
  await flushPromises()
  expect(push).toHaveBeenLastCalledWith({ path: '/de/en/blog' })
  await wrapper.find('button').trigger('click')
  await wrapper.find('.switcher-locale-en').trigger('click')
  await flushPromises()
  expect(push).toHaveBeenLastCalledWith({ path: '/' })

  // switchLocale without resolvePath pushes the current path as is
  api.switchLocale('de')
  expect(push).toHaveBeenLastCalledWith({ path: '/' })

  // head: a locale missing from the list leaves the previous tags alone
  head.updateMeta()
  expect(head.metaObject.value.htmlAttrs).toEqual({ lang: 'de-DE', dir: 'auto' })
  i18n.global.locale.value = 'zz'
  head.updateMeta()
  expect(head.metaObject.value.htmlAttrs).toEqual({ lang: 'de-DE', dir: 'auto' })
})

test('useLocaleHead options: whitelisted query, relative paths, absolute alternates, no SEO tags', async () => {
  const path = ref('shop?page=2&utm=x&sort=asc')
  // a strategy may also answer with route objects
  let objects = false
  const objectPaths: Record<string, { path?: string }> = { en: { path: 'https://en.example.com/shop' }, de: {}, xx: { path: '/xx/shop' } }
  const routingStrategy: I18nRoutingStrategy = {
    getCurrentPath: () => path.value,
    push: () => {},
    replace: () => {},
    resolvePath: (_to, locale) => (objects ? objectPaths[locale]! : locale === 'de' ? 'https://de.example.com/shop' : locale === 'en' ? 'shop' : ''),
  }
  const seoLocales: Locale[] = [
    { code: 'en', iso: 'en-US' },
    { code: 'de', iso: 'de-DE' },
    { code: 'xx', iso: 'xx' },
    { code: 'hidden', iso: 'fr-FR', seo: false },
  ]
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const i18n = setup({ messages: { en }, locales: seoLocales, routingStrategy })
  const heads: ReturnType<typeof useLocaleHead>[] = []
  const App = defineComponent({
    setup() {
      heads.push(useLocaleHead({ baseUrl: () => 'https://example.com', identifierAttribute: 'key', hreflangBaseLanguage: true }))
      heads.push(useLocaleHead({ addDirAttribute: false, addSeoAttributes: false }))
      heads[0]!.updateMeta(['page', 'sort', 'missing'])
      return () => h('div')
    },
  })
  wrapper = mount(App, { global: { plugins: [i18n] } })
  const [full, bare] = heads as [ReturnType<typeof useLocaleHead>, ReturnType<typeof useLocaleHead>]

  expect(full.metaObject.value).toEqual({
    htmlAttrs: { lang: 'en-US', dir: 'auto' },
    meta: [
      { key: 'i18n-og', property: 'og:locale', content: 'en_US' },
      { key: 'i18n-og-url', property: 'og:url', content: 'https://example.com/shop?page=2&sort=asc' },
      { key: 'i18n-og-alt-de_DE', property: 'og:locale:alternate', content: 'de_DE' },
    ],
    link: [
      { key: 'i18n-can', rel: 'canonical', href: 'https://example.com/shop?page=2&sort=asc' },
      { key: 'i18n-alternate-en', rel: 'alternate', href: 'https://example.com/shop', hreflang: 'en' },
      { key: 'i18n-alternate-en-US', rel: 'alternate', href: 'https://example.com/shop', hreflang: 'en-US' },
      { key: 'i18n-alternate-de', rel: 'alternate', href: 'https://de.example.com/shop', hreflang: 'de' },
      { key: 'i18n-alternate-de-DE', rel: 'alternate', href: 'https://de.example.com/shop', hreflang: 'de-DE' },
      { key: 'i18n-xd', rel: 'alternate', href: 'https://example.com/shop', hreflang: 'x-default' },
    ],
  })
  // 'xx' has no og locale: warned about and skipped
  expect(warn).toHaveBeenCalled()

  bare.updateMeta()
  expect(bare.metaObject.value).toEqual({ htmlAttrs: { lang: 'en-US' }, link: [], meta: [] })

  // a locale without an og mapping, on a locale-prefixed path, with object answers
  objects = true
  path.value = '/xx/shop'
  i18n.global.locale.value = 'xx'
  warn.mockClear()
  let head!: ReturnType<typeof useLocaleHead>
  mount(
    defineComponent({
      setup() {
        head = useLocaleHead({ baseUrl: 'https://example.com' })
        head.updateMeta()
        return () => null
      },
    }),
    { global: { plugins: [i18n] } },
  ).unmount()
  expect(head.metaObject.value).toEqual({
    htmlAttrs: { lang: 'xx', dir: 'auto' },
    meta: [
      { id: 'i18n-og-url', property: 'og:url', content: 'https://example.com/xx/shop' },
      { id: 'i18n-og-alt-en_US', property: 'og:locale:alternate', content: 'en_US' },
      { id: 'i18n-og-alt-de_DE', property: 'og:locale:alternate', content: 'de_DE' },
    ],
    link: [
      { id: 'i18n-can', rel: 'canonical', href: 'https://example.com/xx/shop' },
      { id: 'i18n-alternate-en-US', rel: 'alternate', href: 'https://en.example.com/shop', hreflang: 'en-US' },
      { id: 'i18n-alternate-de-DE', rel: 'alternate', href: 'https://example.com/', hreflang: 'de-DE' },
      { id: 'i18n-alternate-xx', rel: 'alternate', href: 'https://example.com/xx/shop', hreflang: 'xx' },
      { id: 'i18n-xd', rel: 'alternate', href: 'https://en.example.com/shop', hreflang: 'x-default' },
    ],
  })
  expect(warn).toHaveBeenCalled()
  warn.mockRestore()

  // no routing strategy at all: nothing to describe
  const plain = setup()
  mount(
    defineComponent({
      setup() {
        head = useLocaleHead()
        head.updateMeta()
        return () => null
      },
    }),
    { global: { plugins: [plain] } },
  ).unmount()
  expect(head.metaObject.value).toEqual({ htmlAttrs: {}, link: [], meta: [] })
})

test('misuse fails loudly with a pointer to the fix', () => {
  const run = (setupFn: () => unknown, provide: (app: ReturnType<typeof createApp>) => void = () => {}) => {
    const app = createApp({ setup: () => (setupFn(), () => null) })
    app.config.warnHandler = () => {}
    let error: unknown
    app.config.errorHandler = (e) => {
      error = e
    }
    provide(app)
    app.mount(document.createElement('div'))
    return (error as Error | undefined)?.message
  }
  const plugin =
    (options = {}) =>
    (app: ReturnType<typeof createApp>) =>
      app.use(createI18n({ locale: 'en', ...options }))

  expect(run(() => useI18n())).toBe('[i18n-micro] useI18n() must be called after app.use(i18n). Make sure i18n plugin is installed.')
  expect(run(() => useI18n(), plugin())).toBe('[i18n-micro] I18nLocalesKey not provided. Make sure app.provide(I18nLocalesKey, locales) is called.')
  expect(run(() => useI18n(), plugin({ locales }))).toBe(
    '[i18n-micro] I18nDefaultLocaleKey not provided. Make sure app.provide(I18nDefaultLocaleKey, defaultLocale) is called.',
  )
  expect(run(() => useI18n(), plugin({ locales, defaultLocale: 'en' }))).toBeUndefined()
  // the composable's own options stand in for the provided values
  expect(run(() => useI18n({ locales, defaultLocale: 'en' }), plugin())).toBeUndefined()

  const errorOf = (component: object, props: object, provide?: (app: ReturnType<typeof createApp>) => void) => {
    const app = createApp({ render: () => h(component, props) })
    app.config.warnHandler = () => {}
    let error: unknown
    app.config.errorHandler = (e) => {
      error = e
    }
    provide?.(app)
    app.mount(document.createElement('div'))
    return (error as Error | undefined)?.message
  }
  expect(errorOf(I18nT, { keypath: 'a' })).toBe('[i18n-micro] I18nT: i18n instance not found. Make sure i18n plugin is installed.')
  expect(errorOf(I18nLink, { to: '/' })).toBe('[i18n-micro] I18nLink: i18n instance not found. Make sure i18n plugin is installed.')
  expect(errorOf(I18nGroup, { prefix: 'p' })).toBe('[i18n-micro] I18nGroup: i18n instance not found. Make sure i18n plugin is installed.')
  expect(errorOf(I18nSwitcher, {})).toBe('[i18n-micro] I18nSwitcher: i18n instance not found. Make sure i18n plugin is installed.')
  expect(errorOf(I18nSwitcher, {}, plugin())).toBe(
    '[i18n-micro] I18nSwitcher: locales not provided. Make sure app.provide(I18nLocalesKey, locales) is called or pass locales prop.',
  )
  expect(errorOf(I18nSwitcher, { locales }, plugin())).toBeUndefined()
})
