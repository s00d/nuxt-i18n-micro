/**
 * Characterization of the Vue-side components: the Vue package and the Nuxt module over the same
 * inputs, one `input → output` line each, so drift between them is a visible diff.
 */
import { flushPromises } from '@vue/test-utils'
import type { Locale } from '@i18n-micro/types'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { h, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import NuxtGroup from '../../../../src/runtime/components/i18n-group.vue'
import NuxtLinkComponent from '../../../../src/runtime/components/i18n-link.vue'
import NuxtSwitcher from '../../../../src/runtime/components/i18n-switcher.vue'
import NuxtT from '../../../../src/runtime/components/i18n-t.vue'
import { useLocaleHead as useNuxtLocaleHead } from '../../../../src/runtime/composables/useLocaleHead'
import { buildVitePressLocaleHead } from '../../../vitepress/src/seo/locale-head'
import { I18nGroup } from '../../src/components/i18n-group'
import { I18nLink } from '../../src/components/i18n-link'
import { I18nSwitcher } from '../../src/components/i18n-switcher'
import { I18nT } from '../../src/components/i18n-t'
import { useLocaleHead } from '../../src/composables/use-locale-head'
import { I18nDefaultLocaleKey, I18nLocalesKey, I18nRouterKey } from '../../src/injection'
import { createVueRouterAdapter } from '../../src/router'
import { htmlOf, type MountOptions, mountNuxt, mountVue, nuxtInstance, wireNuxtApp } from './harness'
import { app, route } from './nuxt-stub'

const NOW = Date.UTC(2024, 5, 15, 12, 0, 0)

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
})
afterAll(() => vi.useRealTimers())

const messages = {
  en: {
    plain: 'Hello',
    greeting: 'Hello, {name}!',
    repeat: '{a} and {a}',
    order: '{a} then {b}',
    reorder: '{b} then {a}',
    edges: '{a}{b}',
    rich: '<b>{n}</b> new',
    apples: 'no apples | one apple | {count} apples',
    cart: 'none | {count} item in {link} | {count} items in {link}',
    blank: '   ',
    empty: '',
    num: 'n={number}',
    numLink: 'n={number} {link}',
    dated: 'd={date}',
    rel: 'r={relativeDate}',
    uni: '{имя} {first-name}',
    proto: '{__proto__} {constructor} {toString}',
    nested: { deep: 'Deep {x}' },
    tree: { a: 'b' },
    count: 7,
  },
  de: { plain: 'Hallo', reorder: '{a} dann {b}' },
  ru: {
    apples: 'яблоко | яблока | яблок',
    zeroFirst: 'нет яблок | одно яблоко | {count} яблок',
    marked: '=0 нет | {count} яблоко | {count} яблока | {count} яблок',
  },
}

const slotA = () => h('b', 'A')
const slotB = () => h('i', 'B')
const date = new Date(Date.UTC(2024, 0, 15, 12))
const rule = (key: string, count: number, params: object, locale: string, t: (k: string, p?: object) => unknown) =>
  `${locale}:${count}:${t(key)}:${JSON.stringify(params)}`

const T_CASES: [string, MountOptions][] = [
  ['plain', { props: { keypath: 'plain' } }],
  ['missing', { props: { keypath: 'nope' } }],
  ['missing + defaultValue', { props: { keypath: 'nope', defaultValue: 'dv' } }],
  ['nested', { props: { keypath: 'nested.deep', params: { x: 1 } } }],
  ['object value', { props: { keypath: 'tree' } }],
  ['number value', { props: { keypath: 'count' } }],
  ['tag + attrs', { props: { keypath: 'plain', tag: 'p' }, attrs: { id: 'x', class: 'c' } }],
  ['params', { props: { keypath: 'greeting', params: { name: 'Z' } } }],
  ['param missing', { props: { keypath: 'greeting' } }],
  ['param looks like a slot', { props: { keypath: 'order', params: { a: '{b}' } }, slots: { b: slotB } }],
  ['param and slot same name', { props: { keypath: 'order', params: { a: 'P' } }, slots: { a: slotA } }],
  ['slots in order', { props: { keypath: 'order' }, slots: { a: slotA, b: slotB } }],
  ['slots reordered', { props: { keypath: 'reorder' }, slots: { a: slotA, b: slotB } }],
  ['slots repeated', { props: { keypath: 'repeat' }, slots: { a: slotA } }],
  ['slots at the edges', { props: { keypath: 'edges' }, slots: { a: slotA, b: slotB } }],
  ['unknown slot', { props: { keypath: 'order' }, slots: { z: slotA } }],
  [
    'default slot',
    { props: { keypath: 'greeting', params: { name: 'Z' } }, slots: { default: ({ translation }: { translation: string }) => h('u', translation) } },
  ],
  ['unicode names, params', { props: { keypath: 'uni', params: { имя: 'И', 'first-name': 'F' } } }],
  ['unicode names, slots', { props: { keypath: 'uni' }, slots: { имя: slotA, 'first-name': slotB } }],
  ['proto, no params', { props: { keypath: 'proto' } }],
  ['proto, slots object has no such slot', { props: { keypath: 'proto' }, slots: { a: slotA } }],
  ['html', { props: { keypath: 'rich', html: true, params: { n: 3 } } }],
  ['html, hostile param', { props: { keypath: 'greeting', html: true, params: { name: '<img src=x onerror=alert(1)>' } } }],
  ['text, hostile param', { props: { keypath: 'greeting', params: { name: '<img src=x>' } } }],
  ['html ignores slots', { props: { keypath: 'order', html: true }, slots: { a: slotA } }],
  ['innerHTML attr', { props: { keypath: 'plain' }, attrs: { innerHTML: '<i>x</i>' } }],
  ['textContent attr', { props: { keypath: 'plain' }, attrs: { textContent: 'x' } }],
  ['hideIfEmpty blank', { props: { keypath: 'blank', hideIfEmpty: true } }],
  ['hideIfEmpty blank + default', { props: { keypath: 'blank', hideIfEmpty: true, defaultValue: 'dv' } }],
  ['hideIfEmpty empty', { props: { keypath: 'empty', hideIfEmpty: true } }],
  ['hideIfEmpty number', { props: { keypath: 'blank', hideIfEmpty: true, number: 1 } }],
  ['hideIfEmpty plural', { props: { keypath: 'blank', hideIfEmpty: true, plural: 1 } }],
  ['blank shown', { props: { keypath: 'blank' } }],
  ['plural 0', { props: { keypath: 'apples', plural: 0 } }],
  ['plural 1', { props: { keypath: 'apples', plural: 1 } }],
  ['plural 5', { props: { keypath: 'apples', plural: 5 } }],
  ['plural "2"', { props: { keypath: 'apples', plural: '2' } }],
  ['plural 1.5', { props: { keypath: 'apples', plural: 1.5 } }],
  ['plural "abc"', { props: { keypath: 'apples', plural: 'abc' } }],
  ['plural null', { props: { keypath: 'apples', plural: null } }],
  ['plural + slot', { props: { keypath: 'cart', plural: 2 }, slots: { link: slotA } }],
  ['plural + html', { props: { keypath: 'rich', plural: 2, html: true, params: { n: '<i>' } } }],
  ['plural missing + default', { props: { keypath: 'nope', plural: 2, defaultValue: 'dv' } }],
  ['plural ru 1', { locale: 'ru', props: { keypath: 'apples', plural: 1 } }],
  ['plural ru 2', { locale: 'ru', props: { keypath: 'apples', plural: 2 } }],
  ['plural ru 5', { locale: 'ru', props: { keypath: 'apples', plural: 5 } }],
  ['plural ru 21', { locale: 'ru', props: { keypath: 'apples', plural: 21 } }],
  ['plural ru zero-first 0', { locale: 'ru', props: { keypath: 'zeroFirst', plural: 0 } }],
  ['plural ru zero-first 1', { locale: 'ru', props: { keypath: 'zeroFirst', plural: 1 } }],
  ['plural ru zero-first 21', { locale: 'ru', props: { keypath: 'zeroFirst', plural: 21 } }],
  ['plural ru marked 0', { locale: 'ru', props: { keypath: 'marked', plural: 0 } }],
  ['plural ru marked 21', { locale: 'ru', props: { keypath: 'marked', plural: 21 } }],
  ['plural ru marked 22', { locale: 'ru', props: { keypath: 'marked', plural: 22 } }],
  ['customPluralRule marked', { locale: 'ru', props: { keypath: 'marked', plural: 1, customPluralRule: rule } }],
  ['customPluralRule', { props: { keypath: 'apples', plural: 4, params: { p: 1 }, customPluralRule: rule } }],
  ['customPluralRule null', { props: { keypath: 'apples', plural: 4, customPluralRule: () => null } }],
  ['customPluralRule miss', { props: { keypath: 'nope', plural: 4, customPluralRule: rule } }],
  ['customPluralRule fraction', { props: { keypath: 'apples', plural: 1.5, customPluralRule: rule } }],
  ['customPluralRule html', { props: { keypath: 'apples', plural: 1, html: true, customPluralRule: () => '<b>x</b>' } }],
  ['number', { props: { keypath: 'num', number: 1500 } }],
  ['number string', { props: { keypath: 'num', number: '1500' } }],
  ['number null', { props: { keypath: 'plain', number: null } }],
  ['number + same-name param', { props: { keypath: 'num', number: 5, params: { number: 'PARAM' } } }],
  ['number + slot', { props: { keypath: 'numLink', number: 5 }, slots: { link: slotA } }],
  ['date', { props: { keypath: 'dated', date } }],
  ['date null', { props: { keypath: 'plain', date: null } }],
  ['date + same-name param', { props: { keypath: 'dated', date, params: { date: 'PARAM' } } }],
  ['relativeDate', { props: { keypath: 'rel', relativeDate: new Date(NOW - 7200_000) } }],
  ['relativeDate null', { props: { keypath: 'plain', relativeDate: null } }],
  ['precedence number over plural', { props: { keypath: 'num', number: 2, plural: 1 } }],
]

const report = (lines: string[]) => `${lines.join('\n')}\n`

const LOCALES: Locale[] = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
  { code: 'ar', iso: 'ar-EG', dir: 'rtl' },
  { code: 'fr', iso: 'fr-FR', displayName: 'Français', disabled: true },
]

describe('components characterization', () => {
  test('i18n-t', async () => {
    const lines: string[] = []
    for (const [label, options] of T_CASES) {
      lines.push(`- \`${label}\``)
      lines.push(`  - vue → ${htmlOf(() => mountVue(I18nT, messages, options))}`)
      lines.push(`  - nuxt → ${htmlOf(() => mountNuxt(NuxtT, messages, options))}`)
    }
    await expect(report(lines)).toMatchFileSnapshot('./__golden__/i18n-t.md')
  })

  test('i18n-group', async () => {
    const options: MountOptions = {
      props: { prefix: 'nested', groupClass: 'g' },
      slots: { default: ({ t }: { t: (k: string, p?: object) => string }) => t('deep', { x: 1 }) },
    }
    const lines = [
      `- vue → ${htmlOf(() => mountVue(I18nGroup, messages, options))}`,
      `- nuxt → ${htmlOf(() => mountNuxt(NuxtGroup, messages, options))}`,
    ]
    await expect(report(lines)).toMatchFileSnapshot('./__golden__/i18n-group.md')
  })

  test('i18n-link', async () => {
    const targets: unknown[] = [
      '/about',
      'about',
      '/about/',
      '/about?x=1#y',
      '#top',
      '?x=1',
      '/',
      { path: '/a', query: { x: 1 } },
      { path: '/a', hash: '#h' },
      { name: 'about' },
      { name: 'about', query: { x: '1' }, hash: '#h' },
      'https://e.com/x',
      'HTTPS://e.com/x',
      'mailto:a@b.c',
      'Mailto:a@b.c',
      'tel:+1',
      'report.pdf',
      'index.html',
      'example.com/x',
      'www.example.com',
      '//cdn.e.com/y',
    ]
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/:locale(de)?', component: { render: () => null } },
        { path: '/:locale(de)?/about', name: 'about', component: { render: () => null } },
        { path: '/:locale(de)?/a', component: { render: () => null } },
      ],
    })
    await router.push('/de/about?q=1#h')
    const strategy = createVueRouterAdapter(router, LOCALES, 'en')
    const { linkComponent: _, ...plain } = strategy
    const lines: string[] = []
    for (const to of targets) {
      const props = { to, activeStyle: { color: 'red' } }
      const slots = { default: () => 'L' }
      const provide = (routing: object) => ({ [I18nRouterKey as symbol]: routing })
      lines.push(`- \`${JSON.stringify(to)}\``)
      lines.push(`  - vue plain → ${htmlOf(() => mountVue(I18nLink, messages, { locale: 'de', props, slots, provide: provide(plain) }))}`)
      lines.push(`  - vue no router → ${htmlOf(() => mountVue(I18nLink, messages, { locale: 'de', props, slots }))}`)
      route.path = '/de/about'
      lines.push(
        `  - nuxt → ${htmlOf(() =>
          mountNuxt(NuxtLinkComponent, messages, {
            locale: 'de',
            props,
            slots,
            provide: { $localePath: (t: string | { path?: string }) => `/de${typeof t === 'string' ? t : (t.path ?? '')}` },
          }),
        )}`,
      )
    }
    await expect(report(lines)).toMatchFileSnapshot('./__golden__/i18n-link.md')
  })

  test('i18n-switcher', async () => {
    const lines: string[] = []
    const props = { customLabels: { de: 'DE' } }
    const nuxtProvide = {
      $getLocales: () => LOCALES,
      $getLocaleName: () => 'English',
      $switchLocalePath: (code: string) => `/${code}/page`,
      $switchLocale: () => {},
    }
    const open = async (wrapper: ReturnType<typeof mountVue>['wrapper']) => {
      await wrapper.find('button').trigger('click')
      await nextTick()
      const html = wrapper.html()
      wrapper.unmount()
      return html
    }
    const vueProvide = { [I18nLocalesKey as symbol]: LOCALES }
    lines.push(`- vue closed → ${htmlOf(() => mountVue(I18nSwitcher, messages, { props, provide: vueProvide }))}`)
    lines.push(`- vue open → ${await open(mountVue(I18nSwitcher, messages, { props, provide: vueProvide }).wrapper)}`)
    lines.push(`- nuxt closed → ${htmlOf(() => mountNuxt(NuxtSwitcher, messages, { props, provide: nuxtProvide }))}`)
    lines.push(`- nuxt open → ${await open(mountNuxt(NuxtSwitcher, messages, { props, provide: nuxtProvide }).wrapper)}`)
    await expect(report(lines)).toMatchFileSnapshot('./__golden__/i18n-switcher.md')
  })

  test('useLocaleHead', async () => {
    const lines: string[] = []
    const heading = (title: string) => lines.push('', `## ${title}`, '')
    const head = (value: unknown) => JSON.stringify(value)

    heading('vue')
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/:locale(de|ar)?', component: { render: () => null } },
        { path: '/:locale(de|ar)?/about', component: { render: () => null } },
      ],
    })
    for (const baseUrl of ['/', 'https://x.com', 'https://x.com/'])
      for (const path of ['/', '/de', '/de/about?q=1&z=2', '/about']) {
        await router.push(path)
        await flushPromises()
        const locale = path.startsWith('/de') ? 'de' : 'en'
        let built: unknown
        const probe = {
          setup() {
            const value = useLocaleHead({ baseUrl })
            value.updateMeta(['q'])
            built = value.metaObject.value
            return () => null
          },
        }
        mountVue(probe, messages, {
          locale,
          provide: {
            [I18nRouterKey as symbol]: createVueRouterAdapter(router, LOCALES, 'en'),
            [I18nLocalesKey as symbol]: LOCALES,
            [I18nDefaultLocaleKey as symbol]: 'en',
          },
        }).wrapper.unmount()
        lines.push(`- \`${baseUrl} ${path}\` → ${head(built)}`)
      }

    heading('nuxt')
    for (const baseUrl of ['/', 'https://x.com'])
      for (const [locale, path] of [
        ['en', '/about'],
        ['de', '/de/about'],
      ] as const) {
        const i18n = nuxtInstance(messages, locale)
        route.fullPath = path
        route.path = path
        route.matched = [{}]
        wireNuxtApp(i18n, {
          $getI18nConfig: () => ({ defaultLocale: 'en', locales: LOCALES, strategy: 'prefix_except_default', canonicalQueryWhitelist: ['q'] }),
          $getLocales: () => LOCALES,
          $i18nStrategy: { isMetaDisabled: () => false, pageLocales: () => ['en', 'de', 'ar'] },
          $switchLocalePath: (code: string) => (code === 'en' ? '/about' : `/${code}/about`),
        })
        expect(app.$getLocale).toBeDefined()
        lines.push(`- \`${baseUrl} ${path}\` → ${head(useNuxtLocaleHead({ baseUrl, autoUpdate: false }).build())}`)
      }

    heading('vitepress')
    for (const base of [undefined, '/docs/'])
      for (const path of ['/', '/fr/guide', '/docs/fr/guide/?q=1'])
        lines.push(
          `- \`${base} ${path}\` → ${head(
            buildVitePressLocaleHead({
              path,
              base,
              locales: [
                { code: 'en', iso: 'en-US' },
                { code: 'fr', iso: 'fr-FR' },
              ],
              defaultLocale: 'en',
              metaBaseUrl: 'https://x.com',
              canonicalQueryWhitelist: ['q'],
            }),
          )}`,
        )
    await expect(report(lines)).toMatchFileSnapshot('./__golden__/use-locale-head.md')
  })
})
