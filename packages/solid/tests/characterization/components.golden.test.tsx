/** Characterization of the Solid components over the inputs the React family and Vue use. */
import { createComponent } from 'solid-js'
import { render } from 'solid-js/web'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { LINK_TARGETS, LOCALES, PATH_TARGETS, report } from '../../../core/tests/characterization/component-cases'
import { messages, NOW, type SlotSpec, T_CASES, type TCase } from '../../../core/tests/characterization/i18n-t-cases'
import { createI18n, I18nGroup, I18nLink, I18nProvider, I18nSwitcher, I18nT } from '../../src'
import { createSolidRouterAdapter } from '../../src/router'

const instance = (locale = 'en') => createI18n({ locale, fallbackLocale: 'en', messages, missingWarn: false })
const location = { pathname: '/de/about', search: '?q=1', hash: '#h', query: { q: '1' } } as never
const adapter = () => createSolidRouterAdapter(LOCALES, 'en', (() => {}) as never, location)

const element =
  ([tag, text]: SlotSpec) =>
  () => {
    const node = document.createElement(tag)
    node.textContent = text
    return node
  }

function mount(build: () => unknown) {
  const container = document.body.appendChild(document.createElement('div'))
  const dispose = render(build as never, container)
  return {
    container,
    unmount() {
      dispose()
      container.remove()
    },
  }
}

const htmlOf = (build: () => unknown): string => {
  try {
    const { container, unmount } = mount(build)
    const html = container.innerHTML
    unmount()
    return html || '(nothing)'
  } catch (error) {
    return `throws ${(error as Error).name}: ${(error as Error).message}`
  }
}

const withProvider = (provider: object, child: () => unknown) => () =>
  createComponent(I18nProvider, {
    ...provider,
    get children() {
      return child()
    },
  } as never)

const tProps = ({ props, attrs, slots, defaultSlot }: TCase) => {
  const built: Record<string, unknown> = { ...props, ...attrs }
  if (slots) built.components = Object.fromEntries(Object.entries(slots).map(([name, spec]) => [name, element(spec)]))
  if (defaultSlot)
    built.children = ({ translation }: { translation: string }) => {
      const node = document.createElement('u')
      node.textContent = translation
      return node
    }
  return built
}

describe('components characterization', () => {
  beforeAll(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
  })
  afterAll(() => vi.useRealTimers())

  test('i18n-t', async () => {
    const lines = T_CASES.map(([label, spec]) => {
      const html = htmlOf(withProvider({ i18n: instance(spec.locale) }, () => createComponent(I18nT, tProps(spec) as never)))
      return `- \`${label}\` → ${html}`
    })
    await expect(report(lines)).toMatchFileSnapshot('./__golden__/i18n-t.md')
  })

  test('i18n-group', async () => {
    const children = (({ t }: { t: (key: string, params?: object) => string }) => t('deep', { x: 1 })) as never
    const group = (props: object) =>
      htmlOf(withProvider({ i18n: instance() }, () => createComponent(I18nGroup, { prefix: 'nested', ...props, children } as never)))
    const lines = [`- plain → ${group({})}`, `- groupClass → ${group({ groupClass: 'g' })}`, `- className → ${group({ groupClass: 'g', class: 'u' })}`]
    await expect(report(lines)).toMatchFileSnapshot('./__golden__/i18n-group.md')
  })

  test('i18n-link', async () => {
    const lines: string[] = []
    const { linkComponent: _, ...strategy } = adapter()
    for (const to of LINK_TARGETS) {
      const link = (provider: object) =>
        htmlOf(
          withProvider({ i18n: instance('de'), locales: LOCALES, defaultLocale: 'en', ...provider }, () =>
            createComponent(I18nLink, { to, activeStyle: { color: 'red' }, children: 'L' } as never),
          ),
        )
      lines.push(`- \`${JSON.stringify(to)}\``, `  - router → ${link({ routingStrategy: strategy })}`, `  - no router → ${link({})}`)
    }
    await expect(report(lines)).toMatchFileSnapshot('./__golden__/i18n-link.md')
  })

  test('i18n-switcher', async () => {
    const provider = { i18n: instance(), locales: LOCALES, defaultLocale: 'en', routingStrategy: adapter() }
    const app = withProvider(provider, () => createComponent(I18nSwitcher, { customLabels: { de: 'DE' } } as never))
    const closed = htmlOf(app)
    const { container, unmount } = mount(app)
    container.querySelector('button')!.click()
    const open = container.innerHTML
    unmount()
    await expect(report([`- closed → ${closed}`, `- open → ${open}`])).toMatchFileSnapshot('./__golden__/i18n-switcher.md')
  })

  test('router adapter', async () => {
    const strategy = adapter()
    const lines = PATH_TARGETS.flatMap((to) =>
      ['en', 'de', 'fr'].map((locale) => `- \`${JSON.stringify(to)} ${locale}\` → ${JSON.stringify(strategy.resolvePath!(to as never, locale))}`),
    )
    lines.push(`- getCurrentPath → ${strategy.getCurrentPath()}`, `- getRoute → ${JSON.stringify(strategy.getRoute!())}`)
    await expect(report(lines)).toMatchFileSnapshot('./__golden__/router.md')
  })
})
