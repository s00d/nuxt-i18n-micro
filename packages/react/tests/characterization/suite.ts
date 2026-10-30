/**
 * Characterization of the React and Preact components: one `input → output` line each, written to
 * the calling package's `__golden__`, so drift between the two is a visible diff.
 */
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { LINK_TARGETS, LOCALES, PATH_TARGETS, report } from '../../../core/tests/characterization/component-cases'
import { messages, NOW, type SlotSpec, T_CASES, type TCase } from '../../../core/tests/characterization/i18n-t-cases'

/** What differs between the two: their `h`, testing library, and router adapter. */
export interface GoldenHost {
  h: (type: any, props?: any, ...children: any[]) => any
  render: (node: any) => { container: HTMLElement; unmount: () => void }
  fireEvent: { click: (element: Element) => unknown }
  act: (callback: () => unknown) => unknown
  lib: Record<'createI18n' | 'I18nProvider' | 'I18nT' | 'I18nLink' | 'I18nGroup' | 'I18nSwitcher', any>
  /** The adapter at `/de/about?q=1#h`. */
  adapter: () => any
}

export function goldenSuite({ h, render, fireEvent, act, lib, adapter }: GoldenHost) {
  const { createI18n, I18nProvider, I18nT, I18nLink, I18nGroup, I18nSwitcher } = lib
  const instance = (locale = 'en') => createI18n({ locale, fallbackLocale: 'en', messages, missingWarn: false })
  const element = ([tag, text]: SlotSpec) => h(tag, null, text)

  /** A component's HTML, or how it failed: a throw from render is a result here. */
  const htmlOf = (build: () => any): string => {
    try {
      const { container, unmount } = render(build())
      const html = container.innerHTML
      unmount()
      return html || '(nothing)'
    } catch (error) {
      return `throws ${(error as Error).name}: ${(error as Error).message}`
    }
  }

  const tProps = ({ props, attrs, slots, defaultSlot }: TCase) => {
    const { class: className, ...rest } = attrs ?? {}
    const built: Record<string, unknown> = { ...props, ...rest, ...(className ? { className } : {}) }
    if (slots) built.components = Object.fromEntries(Object.entries(slots).map(([name, spec]) => [name, element(spec)]))
    if (defaultSlot) built.children = ({ translation }: { translation: string }) => h('u', null, translation)
    return built
  }

  describe('components characterization', () => {
    beforeAll(() => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(NOW)
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })
    afterAll(() => {
      vi.useRealTimers()
      vi.restoreAllMocks()
    })

    test('i18n-t', async () => {
      const lines = T_CASES.map(([label, spec]) => {
        const html = htmlOf(() => h(I18nProvider, { i18n: instance(spec.locale) }, h(I18nT, tProps(spec))))
        return `- \`${label}\` → ${html}`
      })
      await expect(report(lines)).toMatchFileSnapshot('./__golden__/i18n-t.md')
    })

    test('i18n-group', async () => {
      const children = ({ t }: { t: (key: string, params?: object) => string }) => t('deep', { x: 1 })
      const group = (props: object) => htmlOf(() => h(I18nProvider, { i18n: instance() }, h(I18nGroup, { prefix: 'nested', ...props }, children)))
      const lines = [
        `- plain → ${group({})}`,
        `- groupClass → ${group({ groupClass: 'g' })}`,
        `- className → ${group({ groupClass: 'g', className: 'u' })}`,
      ]
      await expect(report(lines)).toMatchFileSnapshot('./__golden__/i18n-group.md')
    })

    test('i18n-link', async () => {
      const strategy = { ...adapter(), linkComponent: undefined }
      const lines = LINK_TARGETS.flatMap((to) => {
        const link = (provider: object) =>
          htmlOf(() =>
            h(
              I18nProvider,
              { i18n: instance('de'), locales: LOCALES, defaultLocale: 'en', ...provider },
              h(I18nLink, { to, activeStyle: { color: 'red' } }, 'L'),
            ),
          )
        return [`- \`${JSON.stringify(to)}\``, `  - router → ${link({ routingStrategy: strategy })}`, `  - no router → ${link({})}`]
      })
      await expect(report(lines)).toMatchFileSnapshot('./__golden__/i18n-link.md')
    })

    test('i18n-switcher', async () => {
      const provider = { i18n: instance(), locales: LOCALES, defaultLocale: 'en', routingStrategy: adapter() }
      const props = { customLabels: { de: 'DE' } }
      const open = () => {
        const { container, unmount } = render(h(I18nProvider, provider, h(I18nSwitcher, props)))
        act(() => fireEvent.click(container.querySelector('button')!))
        const html = container.innerHTML
        unmount()
        return html
      }
      const lines = [`- closed → ${htmlOf(() => h(I18nProvider, provider, h(I18nSwitcher, props)))}`, `- open → ${open()}`]
      await expect(report(lines)).toMatchFileSnapshot('./__golden__/i18n-switcher.md')
    })

    test('router adapter', async () => {
      const strategy = adapter()
      const lines = PATH_TARGETS.flatMap((to) =>
        ['en', 'de', 'fr'].map((locale) => `- \`${JSON.stringify(to)} ${locale}\` → ${JSON.stringify(strategy.resolvePath(to, locale))}`),
      )
      lines.push(`- getCurrentPath → ${strategy.getCurrentPath()}`, `- getRoute → ${JSON.stringify(strategy.getRoute())}`)
      await expect(report(lines)).toMatchFileSnapshot('./__golden__/router.md')
    })
  })
}
