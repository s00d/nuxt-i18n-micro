// What the React family pins in tests/shared/behaviour.ts, the Solid way: reactive props and reads.
import type { Locale } from '@i18n-micro/types'
import { createEffect, createRoot, createSignal, type JSX, onCleanup } from 'solid-js'
import { render } from 'solid-js/web'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { createI18n, I18nGroup, I18nLink, I18nProvider, I18nSwitcher, I18nT, type I18nRoutingStrategy, type SolidI18n, useI18n } from '../src'

const locales: Locale[] = [
  { code: 'en', displayName: 'English', iso: 'en-US' },
  { code: 'de', displayName: 'Deutsch', iso: 'de-DE' },
  { code: 'ar', displayName: 'العربية', iso: 'ar-EG', dir: 'rtl' },
]

const messages = {
  en: { hi: 'Hello {name}', plain: 'Hello', order: '{a} then {b}', blank: '   ', posted: 'Posted {date}', apples: 'one apple | {count} apples' },
  de: { hi: 'Hallo {name}', plain: 'Hallo', order: '{b} dann {a}' },
}

const WHEN = new Date('2024-01-15T23:30:00Z')
const instance = (options: object = {}) => createI18n({ locale: 'en', fallbackLocale: 'en', messages, missingWarn: false, ...options })

let disposers: (() => void)[] = []
afterEach(() => {
  for (const dispose of disposers) dispose()
  disposers = []
  document.body.innerHTML = ''
})

function mount(app: () => JSX.Element) {
  const container = document.body.appendChild(document.createElement('div'))
  disposers.push(render(app, container))
  return container
}

const withI18n = (i18n: SolidI18n, app: () => JSX.Element, provider: object = {}) =>
  mount(() => (
    <I18nProvider i18n={i18n} {...provider}>
      {app()}
    </I18nProvider>
  ))

function strategy(current = '/about') {
  const pushes: string[] = []
  const routing: I18nRoutingStrategy = {
    getCurrentPath: () => current,
    push: ({ path }) => pushes.push(path),
    replace: () => {},
    resolvePath: (to) => (typeof to === 'string' ? to : (to.path ?? '/')),
  }
  return { routing, pushes }
}

describe('I18nT', () => {
  test.each([
    ['regular', {}],
    ['number', { number: 1 }],
    ['date', { date: WHEN }],
    ['relativeDate', { relativeDate: WHEN }],
    ['plural', { plural: 1 }],
  ])('html mode escapes params in the %s branch', (_branch, props) => {
    const container = withI18n(instance(), () => <I18nT keypath="hi" html params={{ name: '<img src=x onerror=alert(1)>' }} {...props} />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>')
  })

  test('html, and the tag, are reactive', () => {
    const [html, setHtml] = createSignal(false)
    const [tag, setTag] = createSignal<string | undefined>(undefined)
    const i18n = instance({ messages: { en: { rich: '<b>{n}</b>' } } })
    const container = withI18n(i18n, () => <I18nT keypath="rich" html={html()} tag={tag()} params={{ n: 1 }} />)
    expect(container.innerHTML).toBe('<span>&lt;b&gt;1&lt;/b&gt;</span>')
    setHtml(true)
    expect(container.innerHTML).toBe('<span><b>1</b></span>')
    setTag('p')
    expect(container.innerHTML).toBe('<p><b>1</b></p>')
    setHtml(false)
    expect(container.innerHTML).toBe('<p>&lt;b&gt;1&lt;/b&gt;</p>')
  })

  test('props, locale and messages all reach the text', () => {
    const [name, setName] = createSignal('A')
    const i18n = instance()
    const container = withI18n(i18n, () => <I18nT keypath="hi" params={{ name: name() }} />)
    setName('B')
    expect(container.textContent).toBe('Hello B')
    i18n.locale = 'de'
    expect(container.textContent).toBe('Hallo B')
    i18n.addTranslations('de', { hi: 'Servus {name}' })
    expect(container.textContent).toBe('Servus B')
  })

  test('hideIfEmpty follows the text: the element goes and comes back', () => {
    const i18n = instance()
    const container = withI18n(i18n, () => <I18nT keypath="blank" hideIfEmpty defaultValue="dv" id="x" />)
    expect(container.innerHTML).toBe('dv')
    i18n.addTranslations('en', { blank: 'full' })
    expect(container.innerHTML).toBe('<span id="x">full</span>')
  })

  test('a reordering locale moves the nodes of a component; a function runs once per occurrence', () => {
    const i18n = instance()
    const built: string[] = []
    const make = (name: string) => () => {
      built.push(name)
      const node = document.createElement('i')
      node.textContent = name
      return node
    }
    const container = withI18n(i18n, () => <I18nT keypath="order" components={{ a: make('A'), b: make('B') }} />)
    const a = container.querySelector('i')
    expect(container.textContent).toBe('A then B')
    i18n.locale = 'de'
    expect(container.textContent).toBe('B dann A')
    expect(container.querySelectorAll('i')[1]).toBe(a)
    expect(built).toEqual(['A', 'B'])
  })

  test('a component beats a param; children replace the text, as a function they get it', () => {
    const b = () => <b>A</b>
    const container = withI18n(instance(), () => <I18nT keypath="order" params={{ a: 'P', b: 'Q' }} components={{ a: b }} />)
    expect(container.innerHTML).toBe('<span><b>A</b> then Q</span>')
    const own = withI18n(instance(), () => (
      <I18nT keypath="plain">
        <b>own</b>
      </I18nT>
    ))
    expect(own.innerHTML).toBe('<span><b>own</b></span>')
    const i18n = instance()
    const scoped = withI18n(i18n, () => <I18nT keypath="plain">{({ translation }: { translation: string }) => `[${translation}]`}</I18nT>)
    expect(scoped.textContent).toBe('[Hello]')
    i18n.locale = 'de'
    expect(scoped.textContent).toBe('[Hallo]')
  })

  test('a locale code that is no language tag plurals by its iso', () => {
    const i18n = createI18n({ locale: 'ua', messages: { ua: { apples: '=0 нема | {count} яблуко | {count} яблука | {count} яблук' } } })
    const container = withI18n(i18n, () => <I18nT keypath="apples" plural={21} />, { locales: [{ code: 'ua', iso: 'uk-UA' }] })
    expect(container.textContent).toBe('21 яблуко')
  })

  test('a custom rule that reads only its locale argument follows the locale', () => {
    const i18n = instance()
    const rule = (_key: string, count: number, _params: object, locale: string) => `${locale}:${count}`
    const container = withI18n(i18n, () => <I18nT keypath="apples" plural={1} customPluralRule={rule} />)
    expect(container.textContent).toBe('en:1')
    i18n.locale = 'de'
    expect(container.textContent).toBe('de:1')
  })

  test('children JSX draws as nothing leave the text alone', () => {
    for (const child of [false, null, true]) {
      const container = withI18n(instance(), () => <I18nT keypath="plain">{child as never}</I18nT>)
      expect(container.textContent).toBe('Hello')
    }
  })

  test('new components dispose what the old slots created', () => {
    const [round, setRound] = createSignal(1)
    const cleaned: number[] = []
    const slot = (n: number) => () => {
      onCleanup(() => cleaned.push(n))
      return <b>{n}</b>
    }
    const container = withI18n(instance(), () => <I18nT keypath="order" components={{ a: slot(round()), b: slot(round() * 10) }} />)
    expect(container.textContent).toBe('1 then 10')
    setRound(2)
    expect(container.textContent).toBe('2 then 20')
    expect(cleaned.sort((a, b) => a - b)).toEqual([1, 10])
  })

  test('a slot the locale no longer renders is disposed, one that only moves is kept', () => {
    const cleaned: string[] = []
    const built: string[] = []
    const slot = (name: string) => () => {
      built.push(name)
      onCleanup(() => cleaned.push(name))
      return <b>{name}</b>
    }
    const i18n = instance({
      messages: { en: { both: '{a} then {b}', moved: '{b} then {a}', one: 'only {a}', none: 'nothing' } },
    })
    const [key, setKey] = createSignal('both')
    const container = withI18n(i18n, () => <I18nT keypath={key()} components={{ a: slot('a'), b: slot('b') }} />)
    setKey('moved')
    expect(container.textContent).toBe('b then a')
    expect(cleaned).toEqual([])
    expect(built).toEqual(['a', 'b'])
    setKey('one')
    expect(container.textContent).toBe('only a')
    expect(cleaned).toEqual(['b'])
    setKey('none')
    expect(cleaned).toEqual(['b', 'a'])
    setKey('both')
    expect(container.textContent).toBe('a then b')
    expect(built).toEqual(['a', 'b', 'a', 'b'])
  })

  test('dates go through the timeZone option', () => {
    const tz = (timeZone: string) => withI18n(instance({ timeZone }), () => <I18nT keypath="posted" date={WHEN} />).textContent
    expect(tz('UTC')).toBe('Posted 1/15/2024')
    expect(tz('Asia/Tokyo')).toBe('Posted 1/16/2024')
  })
})

describe('reactive reads', () => {
  test('localePath, getLocale and getRoute follow the store in an effect', () => {
    const i18n = instance()
    const seen: string[] = []
    const paths: string[] = []
    const routing = { ...strategy().routing, resolvePath: (to: string | { path?: string }, locale: string) => `/${locale}${to}` }
    const Probe = () => {
      const api = useI18n()
      // one effect each: a read in the same effect would track for its neighbour
      createEffect(() => paths.push(api.localePath('/x')))
      createEffect(() => seen.push(api.getLocale()))
      createEffect(() => seen.push(api.getRoute()))
      return null
    }
    withI18n(i18n, () => <Probe />, { routingStrategy: routing })
    i18n.locale = 'de'
    i18n.setRoute('about')
    expect([...new Set(paths)]).toEqual(['/en/x', '/de/x'])
    expect(seen).toEqual(expect.arrayContaining(['en', 'index', 'de', 'about']))
  })

  test('an effect that reads the locale and loads a dictionary runs once per locale', () => {
    const i18n = instance()
    const loaded: string[] = []
    createRoot((dispose) => {
      disposers.push(dispose)
      createEffect(() => {
        const locale = i18n.localeAccessor()
        loaded.push(locale)
        i18n.addTranslations(locale, { written: 'x' })
        i18n.setTranslation('other', 'y')
      })
    })
    expect(loaded).toEqual(['en'])
    i18n.locale = 'de'
    expect(loaded).toEqual(['en', 'de'])
  })

  test('a reader of the locale or route wakes for that alone', () => {
    const i18n = instance()
    const reads = { locale: 0, route: 0, fallback: 0 }
    createRoot((dispose) => {
      disposers.push(dispose)
      createEffect(() => {
        i18n.locale
        reads.locale++
      })
      createEffect(() => {
        i18n.currentRoute
        reads.route++
      })
      createEffect(() => {
        i18n.fallbackLocale
        reads.fallback++
      })
    })
    i18n.addTranslations('en', { other: 'y' })
    expect(reads).toEqual({ locale: 1, route: 1, fallback: 1 })
    i18n.setRoute('about')
    expect(reads).toEqual({ locale: 1, route: 2, fallback: 1 })
    i18n.locale = 'de'
    expect(reads).toEqual({ locale: 2, route: 2, fallback: 1 })
    i18n.fallbackLocale = 'de'
    expect(reads).toEqual({ locale: 2, route: 2, fallback: 2 })
  })

  test('a nested provider without an instance keeps the outer one; with neither it says so', () => {
    const i18n = instance()
    const container = withI18n(i18n, () => (
      <I18nProvider locales={locales}>
        <I18nT keypath="plain" />
      </I18nProvider>
    ))
    expect(container.textContent).toBe('Hello')
    expect(() =>
      mount(() => (
        <I18nProvider locales={locales}>
          <I18nT keypath="plain" />
        </I18nProvider>
      )),
    ).toThrow('[i18n-micro] I18nProvider needs')
  })

  test('a new iso reaches a plural already on screen', () => {
    const ua = { ua: { apples: '=0 нема | {count} яблуко | {count} яблука | {count} яблук' } }
    const i18n = createI18n({ locale: 'ua', messages: ua, missingWarn: false })
    const [list, setList] = createSignal<Locale[]>([{ code: 'ua', displayName: 'UA' }])
    const container = mount(() => (
      <I18nProvider i18n={i18n} locales={list()}>
        <I18nT keypath="apples" plural={21} />
      </I18nProvider>
    ))
    expect(container.textContent).toBe('21 яблук')
    setList([{ code: 'ua', displayName: 'UA', iso: 'uk-UA' }])
    expect(container.textContent).toBe('21 яблуко')
  })

  test('locales add to localeIso, they do not replace it', () => {
    const ua = { ua: { apples: '=0 нема | {count} яблуко | {count} яблука | {count} яблук' } }
    const i18n = createI18n({ locale: 'ua', messages: ua, localeIso: { ua: 'uk-UA' }, missingWarn: false })
    const container = withI18n(i18n, () => <I18nT keypath="apples" plural={21} />, { locales: [{ code: 'ua', displayName: 'UA' }] })
    expect(container.textContent).toBe('21 яблуко')
  })

  test('hook options win, and a bare provider answers empty', () => {
    let api!: ReturnType<typeof useI18n>
    const Probe = () => {
      api = useI18n({ locales: [locales[1]!], defaultLocale: 'de' })
      return null
    }
    withI18n(instance(), () => <Probe />)
    expect([api.getLocales().length, api.defaultLocale()]).toEqual([1, 'de'])
    const Bare = () => {
      api = useI18n()
      return null
    }
    withI18n(instance(), () => <Bare />)
    expect([api.getLocales(), api.getLocaleName(), api.defaultLocale()]).toEqual([[], null, 'en'])
  })

  test('consumers of one provider share one object, with no memo of their own', () => {
    const seen: unknown[] = []
    const Probe = () => {
      seen.push(useI18n())
      return null
    }
    withI18n(instance(), () => (
      <>
        <Probe />
        <Probe />
      </>
    ))
    expect(seen[0]).toBe(seen[1])
  })

  test('a throwing listener does not stop the rest; setting the same value notifies nobody', () => {
    const i18n = instance()
    const second = vi.fn()
    i18n.subscribe(() => {
      throw new Error('boom')
    })
    i18n.subscribe(second)
    i18n.locale = 'en'
    expect(second).not.toHaveBeenCalled()
    expect(() => {
      i18n.locale = 'de'
    }).toThrow('boom')
    expect(second).toHaveBeenCalledTimes(1)
  })

  test('preloading a locale that is neither active nor fallback reruns nothing', () => {
    const i18n = instance()
    let runs = 0
    createRoot((dispose) => {
      disposers.push(dispose)
      createEffect(() => {
        runs++
        i18n.t('plain')
      })
    })
    i18n.addTranslations('fr', { plain: 'Salut' })
    expect(runs).toBe(1)
    i18n.locale = 'fr'
    expect(runs).toBe(2)
  })

  test('the surface of the runtime is here', async () => {
    const i18n = instance({ routeMessages: { about: { en: { own: 'route' } } } })
    i18n.setRoute('about')
    expect(i18n.t('own')).toBe('route')
    expect(i18n.hasTranslation('own')).toBe(true)
    i18n.fallbackLocale = 'de'
    expect(i18n.fallbackLocale).toBe('de')
    const fetched = vi.fn(async () => new Response(JSON.stringify({ loaded: 'yes' })))
    vi.stubGlobal('fetch', fetched)
    await i18n.loadFromUrl('/en.json')
    vi.unstubAllGlobals()
    expect(i18n.t('loaded')).toBe('yes')
    i18n.clear()
    expect(i18n.t('loaded')).toBe('loaded')
  })
})

describe('I18nLink', () => {
  const link = (extra: object = {}) => {
    const onClick = vi.fn()
    const { routing, pushes } = strategy()
    const container = withI18n(instance(), () => <I18nLink to="/x" onClick={onClick} {...extra} />, { routingStrategy: routing })
    return { onClick, pushes, anchor: container.querySelector('a')! }
  }
  const click = (element: Element, init: MouseEventInit = {}) => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...init })
    element.dispatchEvent(event)
    return event
  }

  test.each([
    ['ctrl', { ctrlKey: true }],
    ['meta', { metaKey: true }],
    ['shift', { shiftKey: true }],
    ['alt', { altKey: true }],
    ['middle button', { button: 1 }],
  ])('a %s click stays with the browser and still reaches onClick', (_name, init) => {
    const { onClick, pushes, anchor } = link()
    expect(click(anchor, init).defaultPrevented).toBe(false)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(pushes).toEqual([])
  })

  test('target="_blank" stays with the browser', () => {
    const { pushes, anchor } = link({ target: '_blank' })
    expect(click(anchor).defaultPrevented).toBe(false)
    expect(pushes).toEqual([])
  })

  test('a plain click reaches onClick and navigates once; onClick can cancel it', () => {
    const plain = link()
    expect(click(plain.anchor).defaultPrevented).toBe(true)
    expect([plain.onClick.mock.calls.length, plain.pushes]).toEqual([1, ['/x']])
    const cancelled = link({ onClick: (event: Event) => event.preventDefault() })
    click(cancelled.anchor)
    expect(cancelled.pushes).toEqual([])
  })

  test('both handler shapes work', () => {
    const handler = vi.fn()
    const { anchor } = link({ onClick: [handler, 'data'] })
    click(anchor)
    expect(handler.mock.calls[0]![0]).toBe('data')
  })

  test('to turning external changes the whole link, back and forth', () => {
    const [to, setTo] = createSignal('/x')
    const { routing, pushes } = strategy()
    const container = withI18n(instance(), () => <I18nLink to={to()}>go</I18nLink>, { routingStrategy: routing })
    const anchor = () => container.querySelector('a')!
    setTo('https://e.com')
    expect([anchor().getAttribute('href'), anchor().getAttribute('target'), anchor().getAttribute('rel')]).toEqual([
      'https://e.com',
      '_blank',
      'noopener noreferrer',
    ])
    click(anchor())
    expect(pushes).toEqual([])
    setTo('/y')
    expect([anchor().getAttribute('href'), anchor().hasAttribute('target')]).toEqual(['/y', false])
    click(anchor())
    expect(pushes).toEqual(['/y'])
  })

  test('user style stays, active style goes over it', () => {
    expect(link({ style: { color: 'red' } }).anchor.getAttribute('style')).toBe('color: red;')
    const active = link({ to: '/about', style: { color: 'red', margin: '1px' }, activeStyle: { color: 'blue' } })
    expect(active.anchor.style.color).toBe('blue')
    expect(active.anchor.style.margin).toBe('1px')
  })

  test.each([
    ['/about?x=1', true],
    ['/about#y', true],
    ['/about/', true],
    ['/ab', false],
  ])('%s on /about is active: %s', (to, expected) => {
    expect(link({ to, activeStyle: { color: 'red' } }).anchor.hasAttribute('style')).toBe(expected)
  })

  test('a parent section is active; a locale root is not, and the path can be reactive', () => {
    const [path, setPath] = createSignal('/de/about/team')
    const { routing } = strategy()
    const container = withI18n(
      instance(),
      () => (
        <>
          <I18nLink id="section" to="/de/about" activeStyle={{ color: 'red' }} />
          <I18nLink id="root" to="/de" activeStyle={{ color: 'red' }} />
        </>
      ),
      { locales, routingStrategy: { ...routing, getCurrentPath: path } },
    )
    const active = (id: string) => container.querySelector(`#${id}`)!.hasAttribute('style')
    expect([active('section'), active('root')]).toEqual([true, false])
    setPath('/de')
    expect([active('section'), active('root')]).toEqual([false, true])
  })
})

describe('a provider prop that changes after mount', () => {
  test('I18nLink follows routingStrategy and locales', () => {
    const [routing, setRouting] = createSignal<I18nRoutingStrategy | undefined>(undefined)
    const [list, setList] = createSignal<Locale[]>([])
    const container = mount(() => (
      <I18nProvider i18n={instance()} routingStrategy={routing()} locales={list()}>
        <I18nLink to="/de" activeStyle={{ color: 'red' }}>
          x
        </I18nLink>
      </I18nProvider>
    ))
    const link = container.querySelector('a')!
    expect(link.style.color).toBe('')
    const { routing: next, pushes } = strategy('/de/about')
    setRouting(next)
    expect(link.style.color).toBe('red')
    setList(locales)
    expect(link.style.color).toBe('')
    link.click()
    expect(pushes).toEqual(['/de'])
  })

  test('I18nSwitcher follows locales and routingStrategy', () => {
    const [routing, setRouting] = createSignal<I18nRoutingStrategy | undefined>(undefined)
    const [list, setList] = createSignal<Locale[]>([locales[0]!])
    const container = mount(() => (
      <I18nProvider i18n={instance()} routingStrategy={routing()} locales={list()}>
        <I18nSwitcher />
      </I18nProvider>
    ))
    container.querySelector('button')!.click()
    expect(container.querySelectorAll('li')).toHaveLength(1)
    setList(locales)
    expect(container.querySelectorAll('li')).toHaveLength(3)
    expect(container.querySelector('a')!.getAttribute('href')).toBe('#')
    setRouting(strategy('/about').routing)
    expect(container.querySelector('a')!.getAttribute('href')).toBe('/about')
  })
})

describe('string styles', () => {
  test('an active I18nLink keeps a string style', () => {
    const container = withI18n(
      instance(),
      () => (
        <I18nLink to="/about" style="margin-top: 3px" activeStyle={{ color: 'red' }}>
          x
        </I18nLink>
      ),
      { routingStrategy: strategy('/about').routing },
    )
    const link = container.querySelector('a')!
    expect(link.style.marginTop).toBe('3px')
    expect(link.style.color).toBe('red')
  })

  test('I18nSwitcher with a custom localeRoute and no router leaves the link to the browser', () => {
    const i18n = instance()
    const container = withI18n(i18n, () => <I18nSwitcher locales={locales} localeRoute={(to, code) => `/${code}${to as string}`} />)
    container.querySelector('button')!.click()
    const item = container.querySelector('.switcher-locale-de')!
    expect(item.getAttribute('href')).toBe('/de/')
    const click = new MouseEvent('click', { bubbles: true, cancelable: true })
    item.dispatchEvent(click)
    expect(click.defaultPrevented).toBe(false)
    expect(i18n.locale).toBe('de')
  })

  test('I18nSwitcher keeps a string style over its own', () => {
    const container = withI18n(instance(), () => <I18nSwitcher style="margin-top: 3px; display: block" customWrapperStyle={{ color: 'red' }} />)
    const wrapper = container.querySelector<HTMLElement>('.i18n-switcher-wrapper')!
    expect(wrapper.style.marginTop).toBe('3px')
    expect(wrapper.style.display).toBe('block')
    expect(wrapper.style.color).toBe('red')
  })
})

describe('I18nGroup', () => {
  test('class names add up, and the prefix is reactive', () => {
    const [prefix, setPrefix] = createSignal('a')
    const i18n = instance({ messages: { en: { a: { x: 'A' }, b: { x: 'B' } } } })
    const container = withI18n(i18n, () => (
      <I18nGroup prefix={prefix()} groupClass="one" class="two">
        {({ t }: { t: (key: string) => string }) => t('x')}
      </I18nGroup>
    ))
    expect(container.firstElementChild!.className).toBe('i18n-group one two')
    expect(container.textContent).toBe('A')
    setPrefix('b')
    expect(container.textContent).toBe('B')
  })
})

describe('I18nSwitcher', () => {
  test('customLabels answers its own keys: a locale named like a prototype member keeps its name', () => {
    const container = withI18n(instance({ locale: 'constructor' }), () => <I18nSwitcher customLabels={{}} />, { locales: [{ code: 'constructor' }] })
    expect(container.querySelector('button')!.textContent).toContain('constructor')
  })

  const app = (extra = () => null as JSX.Element) =>
    withI18n(
      instance(),
      () => (
        <>
          <I18nSwitcher />
          {extra()}
        </>
      ),
      { locales, defaultLocale: 'en' },
    )

  test('Escape closes it', () => {
    const container = app()
    container.querySelector('button')!.click()
    expect(container.querySelector('ul')).not.toBeNull()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(container.querySelector('ul')).toBeNull()
  })

  test('opening one closes the other', () => {
    const container = app(() => <I18nSwitcher />)
    const [first, second] = container.querySelectorAll('button')
    first!.click()
    second!.click()
    expect(container.querySelectorAll('ul').length).toBe(1)
  })

  test('items carry the language and direction; the layout is logical', () => {
    const container = app()
    container.querySelector('button')!.click()
    const arabic = container.querySelector('.switcher-locale-ar')!
    expect([arabic.getAttribute('dir'), arabic.getAttribute('lang'), arabic.getAttribute('hreflang')]).toEqual(['rtl', 'ar-EG', 'ar-EG'])
    const list = container.querySelector('ul')!.getAttribute('style')!
    expect(list).toContain('inset-inline-start')
    expect(list).not.toContain('left')
    expect(container.querySelector('button span:last-child')!.getAttribute('style')).toContain('margin-inline-start')
    expect(container.querySelector('button')!.hasAttribute('aria-haspopup')).toBe(false)
  })

  test('the current locale is marked for screen readers', () => {
    const container = app()
    container.querySelector('button')!.click()
    expect(container.querySelector('.switcher-locale-en')!.getAttribute('aria-current')).toBe('page')
    expect(container.querySelector('.switcher-locale-de')!.hasAttribute('aria-current')).toBe(false)
  })

  test('a modified click on an item stays with the browser', () => {
    const { routing, pushes } = strategy('/x')
    const i18n = instance()
    const container = withI18n(i18n, () => <I18nSwitcher />, { locales, routingStrategy: routing })
    container.querySelector('button')!.click()
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true })
    container.querySelector('.switcher-locale-de')!.dispatchEvent(event)
    expect([event.defaultPrevented, pushes, i18n.locale]).toEqual([false, [], 'en'])
  })

  test('a switch keeps the query and hash', () => {
    const { routing, pushes } = strategy('/about?x=1#h')
    let api!: ReturnType<typeof useI18n>
    const Probe = () => {
      api = useI18n()
      return null
    }
    withI18n(instance(), () => <Probe />, { locales, routingStrategy: { ...routing, resolvePath: (to: string, l: string) => `/${l}${to}` } })
    api.switchLocale('de')
    expect(pushes).toEqual(['/de/about?x=1#h'])
  })

  test('a listener on document goes with the switcher', () => {
    const remove = vi.spyOn(document, 'removeEventListener')
    const container = document.body.appendChild(document.createElement('div'))
    const dispose = render(
      () => (
        <I18nProvider i18n={instance()} locales={locales}>
          <I18nSwitcher />
        </I18nProvider>
      ),
      container,
    )
    dispose()
    expect(remove.mock.calls.map(([type]) => type)).toEqual(expect.arrayContaining(['click', 'keydown']))
    remove.mockRestore()
  })
})
