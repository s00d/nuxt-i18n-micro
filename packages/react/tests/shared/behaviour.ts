/**
 * Behaviour both hosts must share: they build from one source, and this suite runs over each with
 * its own `h`, hooks and testing library.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

export interface BehaviourHost {
  h: (type: any, props?: any, ...children: any[]) => any
  useEffect: (effect: () => void, deps?: unknown[]) => void
  useLayoutEffect: (effect: () => void, deps?: unknown[]) => void
  useState: <T>(initial: T) => [T, (value: T) => void]
  render: (node: any) => { container: HTMLElement; rerender: (node: any) => void; unmount: () => void }
  act: (callback: () => unknown) => any
  fireEvent: any
  renderToString: (node: any) => string
  /** Hydrates `html` and answers the mismatches it reported. */
  hydrate: (node: any, container: HTMLElement) => Promise<unknown[]>
  lib: any
}

const locales = [
  { code: 'en', displayName: 'English', iso: 'en-US' },
  { code: 'de', displayName: 'Deutsch', iso: 'de-DE' },
  { code: 'ar', displayName: 'العربية', iso: 'ar-EG', dir: 'rtl' as const },
]

const messages = {
  en: {
    hi: 'Hello {name}',
    plain: 'Hello',
    posted: 'Posted {date}',
    ago: 'Updated {relativeDate}',
    price: 'Price {number}',
    apples: 'one apple | {count} apples',
    order: '{a} then {b}',
    blank: '   ',
  },
  de: { plain: 'Hallo', order: '{b} dann {a}', hi: 'Hallo {name}' },
}

const WHEN = new Date('2024-01-15T23:30:00Z')

export function behaviourSuite({ h, useEffect, useLayoutEffect, useState, render, act, fireEvent, renderToString, hydrate, lib }: BehaviourHost) {
  const { createI18n, I18nProvider, I18nT, I18nLink, I18nGroup, I18nSwitcher, useI18n, useLocaleSwitch, useT } = lib
  const instance = (options: object = {}) => createI18n({ locale: 'en', fallbackLocale: 'en', messages, missingWarn: false, ...options })
  const withI18n = (i18n: unknown, ...children: unknown[]) => h(I18nProvider, { i18n }, ...children)

  const plainStrategy = (current = '/about') => {
    const pushes: string[] = []
    return {
      pushes,
      strategy: {
        getCurrentPath: () => current,
        push: ({ path }: { path: string }) => pushes.push(path),
        replace: () => {},
        resolvePath: (to: string | { path?: string }) => (typeof to === 'string' ? to : (to.path ?? '/')),
      },
    }
  }

  describe('I18nT', () => {
    test.each([
      ['regular', { keypath: 'hi' }],
      ['number', { keypath: 'hi', number: 1 }],
      ['date', { keypath: 'hi', date: WHEN }],
      ['relativeDate', { keypath: 'hi', relativeDate: WHEN }],
      ['plural', { keypath: 'hi', plural: 1 }],
    ])('html mode escapes params in the %s branch', (_branch, props) => {
      const { container } = render(withI18n(instance(), h(I18nT, { ...props, html: true, params: { name: '<img src=x onerror=alert(1)>' } })))
      expect(container.querySelector('img')).toBeNull()
      expect(container.textContent).toContain('<img src=x onerror=alert(1)>')
    })

    test('the translation itself stays markup', () => {
      const i18n = instance({ messages: { en: { rich: '<b>{n}</b>' } } })
      const { container } = render(withI18n(i18n, h(I18nT, { keypath: 'rich', html: true, params: { n: 3 } })))
      expect(container.querySelector('b')?.textContent).toBe('3')
    })

    test('a blank text with hideIfEmpty gives the default in every branch, without the wrapper', () => {
      const branches = [{}, { number: 1 }, { plural: 1 }, { date: WHEN }, { relativeDate: WHEN }, { html: true }]
      for (const branch of branches) {
        const { container, unmount } = render(withI18n(instance(), h(I18nT, { keypath: 'blank', hideIfEmpty: true, defaultValue: 'dv', id: 'x', ...branch })))
        expect(container.innerHTML).toBe('dv')
        unmount()
      }
    })

    test('defaultValue stands in for a missing key in every branch, and is interpolated', () => {
      const branches = [{}, { number: 1 }, { plural: 1 }, { date: WHEN }, { relativeDate: WHEN }]
      for (const branch of branches) {
        const props = { keypath: 'nope', defaultValue: 'dv {who}', params: { who: 'Z' }, ...branch }
        const { container, unmount } = render(withI18n(instance(), h(I18nT, props)))
        expect(container.textContent).toBe('dv Z')
        unmount()
      }
    })

    test('a custom rule sees defaultValue on a miss through its getter', () => {
      const rule = (key: string, _count: number, _params: object, _locale: string, get: (key: string) => unknown) => `got:${get(key)}`
      const { container } = render(withI18n(instance(), h(I18nT, { keypath: 'nope', plural: 2, defaultValue: 'dv', customPluralRule: rule })))
      expect(container.textContent).toBe('got:dv')
    })

    test('a locale that reorders placeholders moves the elements, their state survives', () => {
      const mounts: string[] = []
      const Counter = ({ name }: { name: string }) => {
        const [mountedAs] = useState(name)
        useEffect(() => {
          mounts.push(mountedAs)
        }, [])
        return h('i', null, mountedAs)
      }
      const i18n = instance()
      const a = h(Counter, { name: 'A' })
      const b = h(Counter, { name: 'B' })
      const { container } = render(withI18n(i18n, h(I18nT, { keypath: 'order', components: { a, b } })))
      expect(container.textContent).toBe('A then B')
      act(() => {
        i18n.locale = 'de'
      })
      expect(container.textContent).toBe('B dann A')
      expect(mounts).toEqual(['A', 'B'])
    })

    test('a function component may use hooks, also when the locale changes the order', () => {
      const i18n = instance()
      const stateful = (label: string) => () => {
        const [value] = useState(label)
        return h('b', null, value)
      }
      const props = { keypath: 'order', components: { a: stateful('1'), b: stateful('2') } }
      const { container } = render(withI18n(i18n, h(I18nT, props)))
      act(() => {
        i18n.locale = 'de'
      })
      expect(container.textContent).toBe('2 dann 1')
    })

    test('a component beats a param of its name, a param fills the rest', () => {
      const props = { keypath: 'order', params: { a: 'P', b: 'Q' }, components: { a: h('b', null, 'A') } }
      const { container } = render(withI18n(instance(), h(I18nT, props)))
      expect(container.innerHTML).toBe('<span><b>A</b> then Q</span>')
    })

    test('children replace the text; as a function they get it', () => {
      const replaced = render(withI18n(instance(), h(I18nT, { keypath: 'plain' }, h('b', null, 'own'))))
      expect(replaced.container.innerHTML).toBe('<span><b>own</b></span>')
      const scoped = render(withI18n(instance(), h(I18nT, { keypath: 'plain' }, ({ translation }: { translation: string }) => `[${translation}]`)))
      expect(scoped.container.textContent).toBe('[Hello]')
    })

    test('a locale code that is no language tag plurals by its iso', () => {
      const i18n = createI18n({ locale: 'ua', messages: { ua: { apples: '=0 нема | {count} яблуко | {count} яблука | {count} яблук' } } })
      const { container } = render(h(I18nProvider, { i18n, locales: [{ code: 'ua', iso: 'uk-UA' }] }, h(I18nT, { keypath: 'apples', plural: 21 })))
      expect(container.textContent).toBe('21 яблуко')
    })

    test('dates go through the timeZone option', () => {
      const tz = (timeZone: string) => {
        const { container, unmount } = render(withI18n(instance({ timeZone }), h(I18nT, { keypath: 'posted', date: WHEN })))
        const text = container.textContent
        unmount()
        return text
      }
      expect(tz('UTC')).toBe('Posted 1/15/2024')
      expect(tz('Asia/Tokyo')).toBe('Posted 1/16/2024')
    })
  })

  describe('store and render', () => {
    test.each([
      ['effect', useEffect],
      ['layout effect', useLayoutEffect],
    ])('a child %s changing the locale is not lost', (_name, effect) => {
      const i18n = instance()
      const Writer = () => {
        effect(() => {
          i18n.locale = 'de'
        }, [])
        return null
      }
      // the writer is a child, so its effects run before the reader's own
      const Reader = () => h('p', null, useI18n().t('plain'), h(Writer))
      const { container } = render(withI18n(i18n, h(Reader)))
      expect(container.textContent).toBe('Hallo')
    })

    test('messages arriving before the subscription are not lost', () => {
      const i18n = createI18n({ locale: 'en', missingWarn: false })
      const Loader = () => {
        useLayoutEffect(() => {
          i18n.addTranslations('en', { late: 'loaded' })
        }, [])
        return null
      }
      const Reader = () => h('p', null, h(I18nT, { keypath: 'late' }))
      const { container } = render(withI18n(i18n, h(Loader), h(Reader)))
      expect(container.textContent).toBe('loaded')
    })

    test('t keeps its identity across renders and changes with the store', () => {
      const i18n = instance()
      const seen: unknown[] = []
      let rerender!: () => void
      const Probe = () => {
        const [n, set] = useState(0)
        rerender = () => set(n + 1)
        seen.push(useI18n().t)
        return null
      }
      render(withI18n(i18n, h(Probe)))
      act(() => rerender())
      act(() => rerender())
      expect(new Set(seen).size).toBe(1)
      act(() => {
        i18n.locale = 'de'
      })
      expect(new Set(seen).size).toBe(2)
    })

    test('consumers of one provider share one object', () => {
      const seen: unknown[] = []
      const Probe = () => {
        seen.push(useI18n())
        return null
      }
      render(withI18n(instance(), h(Probe), h(Probe)))
      expect(seen[0]).toBe(seen[1])
    })

    test('hook options replace the provider values', () => {
      let api: any
      const Probe = () => {
        api = useI18n({ locales: [locales[1]], defaultLocale: 'de' })
        return null
      }
      render(h(I18nProvider, { i18n: instance(), locales, defaultLocale: 'en' }, h(Probe)))
      expect([api.getLocales().length, api.defaultLocale()]).toEqual([1, 'de'])
    })

    test('defaultLocale() stays put when the locale changes', () => {
      const i18n = instance()
      let api: any
      const Probe = () => {
        api = useI18n()
        return null
      }
      render(withI18n(i18n, h(Probe)))
      act(() => {
        i18n.locale = 'de'
      })
      expect(api.defaultLocale()).toBe('en')
    })

    test('preloading a locale that is neither active nor fallback renders nothing', () => {
      const i18n = instance()
      let renders = 0
      const Probe = () => {
        renders++
        return h('p', null, useI18n().t('plain'))
      }
      render(withI18n(i18n, h(Probe), h(I18nT, { keypath: 'plain' })))
      const before = renders
      act(() => i18n.addTranslations('fr', { plain: 'Salut' }))
      act(() => i18n.addRouteTranslations('fr', 'about', { plain: 'Salut' }))
      expect(renders).toBe(before)
      act(() => {
        i18n.locale = 'fr'
      })
      expect(renders).toBe(before + 1)
    })

    test('useT renders only when its string changes', () => {
      const i18n = instance()
      let renders = 0
      const Leaf = () => {
        renders++
        return h('p', null, useT('hi', { name: 'Z' }))
      }
      const { container } = render(withI18n(i18n, h(Leaf)))
      expect(container.textContent).toBe('Hello Z')
      const before = renders
      act(() => i18n.addTranslations('en', { other: 'x' }))
      expect(renders).toBe(before)
      act(() => {
        i18n.locale = 'de'
      })
      expect(container.textContent).toBe('Hallo Z')
      expect(renders).toBe(before + 1)
    })

    test('useLocaleSwitch keeps the old text until the load is done; the last call wins', async () => {
      const i18n = createI18n({ locale: 'en', messages: { en: { plain: 'Hello' } }, missingWarn: false })
      const loads: Record<string, () => void> = {}
      const load = (locale: string) =>
        new Promise<void>((resolve) => {
          loads[locale] = () => {
            i18n.addTranslations(locale, messages.de)
            resolve()
          }
        })
      let run!: (locale: string) => Promise<void>
      let pending = false
      const Probe = () => {
        ;[run, pending] = useLocaleSwitch(load)
        return h('p', null, useI18n().t('plain'))
      }
      const { container } = render(withI18n(i18n, h(Probe)))
      let first!: Promise<void>
      let second!: Promise<void>
      act(() => {
        first = run('fr')
        second = run('de')
      })
      expect([container.textContent, pending]).toEqual(['Hello', true])
      await act(async () => {
        loads.de!()
        await second
      })
      expect([container.textContent, i18n.locale, pending]).toEqual(['Hallo', 'de', false])
      await act(async () => {
        loads.fr!()
        await first
      })
      expect(i18n.locale).toBe('de')
    })

    test('useLocaleSwitch: a failed load keeps the locale and rejects', async () => {
      const i18n = instance()
      let run!: (locale: string) => Promise<void>
      let pending = true
      const Probe = () => {
        ;[run, pending] = useLocaleSwitch(() => Promise.reject(new Error('offline')))
        return null
      }
      render(withI18n(i18n, h(Probe)))
      await act(async () => {
        await expect(run('de')).rejects.toThrow('offline')
      })
      expect([i18n.locale, pending]).toEqual(['en', false])
    })
  })

  describe('provider from plain data', () => {
    test('builds its own instance, per mount', () => {
      const tree = () => h(I18nProvider, { locale: 'de', fallbackLocale: 'en', messages }, h(I18nT, { keypath: 'plain' }))
      expect(render(tree()).container.textContent).toBe('Hallo')
      expect(renderToString(tree())).toContain('Hallo')
    })

    test('a new locale prop brings its messages; an inline messages object does not reset the instance', () => {
      let i18n: any
      const Probe = () => {
        i18n = useI18n()
        return h(I18nT, { keypath: 'plain' })
      }
      const tree = (locale: string, plain: string) => h(I18nProvider, { locale, messages: { [locale]: { plain } } }, h(Probe))
      const { container, rerender } = render(tree('en', 'one'))
      act(() => i18n.addTranslations('en', { plain: 'added' }))
      rerender(tree('en', 'two'))
      expect(container.textContent).toBe('added')
      rerender(tree('de', 'drei'))
      expect(container.textContent).toBe('drei')
    })

    test('an omitted prop leaves the outer provider value in place', () => {
      let api: any
      const Probe = () => {
        api = useI18n()
        return null
      }
      const { strategy } = plainStrategy()
      render(h(I18nProvider, { i18n: instance(), locales, routingStrategy: strategy }, h(I18nProvider, { i18n: instance({ locale: 'de' }) }, h(Probe))))
      expect([api.locale, api.getLocales().length, api.localePath('/x')]).toEqual(['de', 3, '/x'])
    })
  })

  describe('I18nLink', () => {
    const link = (extra: object = {}, provider: object = {}) => {
      const onClick = vi.fn()
      const { strategy, pushes } = plainStrategy()
      const view = render(h(I18nProvider, { i18n: instance(), routingStrategy: strategy, ...provider }, h(I18nLink, { to: '/x', onClick, ...extra }, 'go')))
      return { onClick, pushes, anchor: view.container.querySelector('a')! }
    }

    test.each([
      ['ctrl', { ctrlKey: true }],
      ['meta', { metaKey: true }],
      ['shift', { shiftKey: true }],
      ['alt', { altKey: true }],
      ['middle button', { button: 1 }],
    ])('a %s click stays with the browser and still reaches onClick', (_name, init) => {
      const { onClick, pushes, anchor } = link()
      expect(fireEvent.click(anchor, init)).toBe(true)
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(pushes).toEqual([])
    })

    test('target="_blank" stays with the browser', () => {
      const { pushes, anchor } = link({ target: '_blank' })
      expect(fireEvent.click(anchor)).toBe(true)
      expect(pushes).toEqual([])
    })

    test('a plain click reaches onClick and navigates once', () => {
      const { onClick, pushes, anchor } = link()
      expect(fireEvent.click(anchor)).toBe(false)
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(pushes).toEqual(['/x'])
    })

    test('onClick can cancel the navigation', () => {
      const { pushes, anchor } = link({ onClick: (event: Event) => event.preventDefault() })
      fireEvent.click(anchor)
      expect(pushes).toEqual([])
    })

    test('an external link keeps a target or rel of its own', () => {
      const { anchor } = link({ to: 'https://e.com', target: '_self', rel: 'me' })
      expect([anchor.getAttribute('target'), anchor.getAttribute('rel')]).toEqual(['_self', 'me'])
    })

    test('external links keep onClick', () => {
      const { onClick, anchor } = link({ to: 'https://e.com' })
      fireEvent.click(anchor)
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    test('user style stays, active style goes over it', () => {
      expect(link({ style: { color: 'red' } }).anchor.getAttribute('style')).toBe('color: red;')
      const active = link({ to: '/about', style: { color: 'red', margin: '1px' }, activeStyle: { color: 'blue' } })
      expect(active.anchor.getAttribute('style')).toBe('color: blue; margin: 1px;')
    })

    test('user style reaches a router linkComponent', () => {
      const seen: object[] = []
      const LinkComponent = (props: { style: object; href: string }) => {
        seen.push(props.style)
        return h('a', { href: props.href }, 'x')
      }
      const { strategy } = plainStrategy()
      render(h(I18nProvider, { i18n: instance(), routingStrategy: { ...strategy, linkComponent: LinkComponent } }, h(I18nLink, { to: '/x', style: { color: 'red' } })))
      expect(seen[0]).toEqual({ color: 'red' })
    })

    test.each([
      ['/about?x=1', true],
      ['/about#y', true],
      ['/about/', true],
      ['/ab', false],
    ])('%s on /about is active: %s', (to, expected) => {
      const { anchor } = link({ to, activeStyle: { color: 'red' } })
      expect(anchor.hasAttribute('style')).toBe(expected)
    })

    test('the current page is compared by path, whatever the strategy reports', () => {
      const { strategy } = plainStrategy('/about?tab=1#h')
      const view = render(h(I18nProvider, { i18n: instance(), routingStrategy: strategy }, h(I18nLink, { to: '/about', activeStyle: { color: 'red' } }, 'x')))
      expect(view.container.querySelector('a')!.hasAttribute('style')).toBe(true)
    })
  })

  describe('I18nGroup', () => {
    test('class names add up', () => {
      const props = { prefix: 'g', groupClass: 'one', className: 'two' }
      const { container } = render(withI18n(instance(), h(I18nGroup, props, 'x')))
      expect(container.firstElementChild!.className).toBe('i18n-group one two')
    })
  })

  describe('I18nSwitcher', () => {
    const app = (...children: unknown[]) => render(h(I18nProvider, { i18n: instance(), locales, defaultLocale: 'en' }, ...children))

    test('Escape closes it', () => {
      const { container } = app(h(I18nSwitcher))
      fireEvent.click(container.querySelector('button')!)
      expect(container.querySelector('ul')).not.toBeNull()
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(container.querySelector('ul')).toBeNull()
    })

    test('opening one closes the other', () => {
      const { container } = app(h(I18nSwitcher), h(I18nSwitcher))
      const [first, second] = container.querySelectorAll('button')
      fireEvent.click(first!)
      fireEvent.click(second!)
      expect(container.querySelectorAll('ul').length).toBe(1)
    })

    test('items carry the language and direction; the layout is logical', () => {
      const { container } = app(h(I18nSwitcher))
      fireEvent.click(container.querySelector('button')!)
      const arabic = container.querySelector('.switcher-locale-ar')!
      expect([arabic.getAttribute('dir'), arabic.getAttribute('lang'), arabic.getAttribute('hreflang')]).toEqual(['rtl', 'ar-EG', 'ar-EG'])
      const list = container.querySelector('ul')!.getAttribute('style')
      expect(list).toContain('inset-inline-start')
      expect(list).not.toContain('left')
      expect(container.querySelector('button span:last-child')!.getAttribute('style')).toContain('margin-inline-start')
    })

    test('no menu is promised: a disclosure button', () => {
      const { container } = app(h(I18nSwitcher))
      expect(container.querySelector('button')!.hasAttribute('aria-haspopup')).toBe(false)
    })

    test('a modified click on an item opens the link in the browser', () => {
      const { strategy, pushes } = plainStrategy('/de/x')
      const i18n = instance()
      const { container } = render(h(I18nProvider, { i18n, locales, routingStrategy: strategy }, h(I18nSwitcher)))
      fireEvent.click(container.querySelector('button')!)
      expect(fireEvent.click(container.querySelector('.switcher-locale-de')!, { ctrlKey: true })).toBe(true)
      expect([pushes, i18n.locale]).toEqual([[], 'en'])
    })

    test('a switch keeps the query and hash', () => {
      const pushes: string[] = []
      const strategy = { ...plainStrategy('/about?x=1#h').strategy, push: ({ path }: { path: string }) => pushes.push(path), resolvePath: (to: string, l: string) => `/${l}${to}` }
      let api: any
      const Probe = () => {
        api = useI18n()
        return null
      }
      render(h(I18nProvider, { i18n: instance(), locales, routingStrategy: strategy }, h(Probe)))
      act(() => api.switchLocale('de'))
      expect(pushes).toEqual(['/de/about?x=1#h'])
    })
  })

  describe('SSR and hydration', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date('2025-06-01T12:00:00Z'))
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    const page = (i18n: unknown) =>
      withI18n(
        i18n,
        h('h1', null, h(I18nT, { keypath: 'plain' })),
        h(I18nT, { keypath: 'order', components: { a: h('b', null, 'A'), b: h('i', null, 'B') } }),
        h(I18nT, { keypath: 'apples', plural: 2 }),
        h(I18nLink, { to: '/x' }, 'link'),
        h(I18nSwitcher),
        h(I18nGroup, { prefix: 'p' }),
      )

    test('every component renders to a string', () => {
      const html = renderToString(page(instance()))
      for (const part of ['Hello', '<b>A</b>', '2 apples', 'href="/x"', 'i18n-switcher-button', 'i18n-group']) expect(html).toContain(part)
    })

    test('the same locale hydrates without a mismatch', async () => {
      const container = document.body.appendChild(document.createElement('div'))
      container.innerHTML = renderToString(page(instance()))
      expect(await hydrate(page(instance()), container)).toEqual([])
      expect(container.textContent).toContain('2 apples')
      container.remove()
    })

    test('one timeZone hydrates a date without a mismatch', async () => {
      const dated = (i18n: unknown) => withI18n(i18n, h('div', null, h(I18nT, { keypath: 'posted', date: WHEN })))
      const container = document.body.appendChild(document.createElement('div'))
      container.innerHTML = renderToString(dated(instance({ timeZone: 'Asia/Tokyo' })))
      expect(await hydrate(dated(instance({ timeZone: 'Asia/Tokyo' })), container)).toEqual([])
      expect(container.textContent).toBe('Posted 1/16/2024')
      container.remove()
    })

    test('different zones do not fail hydration of <I18nT>', async () => {
      const dated = (i18n: unknown) => withI18n(i18n, h('div', null, h(I18nT, { keypath: 'posted', date: WHEN })))
      const container = document.body.appendChild(document.createElement('div'))
      container.innerHTML = renderToString(dated(instance({ timeZone: 'Asia/Tokyo' })))
      expect(await hydrate(dated(instance({ timeZone: 'UTC' })), container)).toEqual([])
      container.remove()
    })

    test('a frozen clock hydrates relative dates without a mismatch', async () => {
      const serverNow = Date.now()
      const ago = (now: () => number) =>
        withI18n(instance({ now }), h('div', null, h(I18nT, { keypath: 'ago', relativeDate: new Date(serverNow - 3_600_000) })))
      const container = document.body.appendChild(document.createElement('div'))
      container.innerHTML = renderToString(ago(() => serverNow))
      vi.setSystemTime(serverNow + 7_200_000)
      expect(await hydrate(ago(() => serverNow), container)).toEqual([])
      expect(container.textContent).toBe('Updated 1 hour ago')
      container.remove()
    })
  })
}
