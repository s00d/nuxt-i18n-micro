// An app without a router: the contexts provided around the tree, translations loaded after
// mount, the built-in components in their documented modes, and misuse errors.
import type { Locale } from '@i18n-micro/types'
import { createSignal, type JSX } from 'solid-js'
import { render } from 'solid-js/web'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createI18n, I18nGroup, I18nLink, I18nProvider, I18nSwitcher, I18nT, type SolidI18n, useI18n } from '../src'
import { useI18nContext, useI18nDefaultLocale, useI18nLocales } from '../src/injection'

const locales: Locale[] = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
  { code: 'uk', iso: 'uk-UA', displayName: 'Українська', disabled: true },
]

const en = {
  greeting: 'Hello, {name}!',
  apples: 'no apples | one apple | {count} apples',
  price: 'Price: {number}',
  posted: 'Posted {date}',
  updated: 'Updated {relativeDate}',
  rich: '<b>{count}</b> new',
  blank: '   ',
  profile: { name: 'Name', hint: 'Hi {who}' },
}
const de = { greeting: 'Hallo, {name}!', apples: 'keine Äpfel | ein Apfel | {count} Äpfel', profile: { name: 'Name (de)' } }

let dispose: (() => void) | undefined
// relative dates are measured against a frozen clock
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2025-06-01T12:00:00Z'))
})
afterEach(() => {
  vi.useRealTimers()
  dispose?.()
  dispose = undefined
  document.body.innerHTML = ''
})

function mountApp(i18n: SolidI18n, app: () => JSX.Element) {
  const container = document.body.appendChild(document.createElement('div'))
  dispose = render(
    () => (
      // children read inside the providers, not before them
      <I18nProvider i18n={i18n} locales={locales} defaultLocale="en">
        {app()}
      </I18nProvider>
    ),
    container,
  )
  return (selector: string) => container.querySelector(selector) as HTMLElement
}

test('translations load after mount and every reader re-renders: t in JSX, I18nT, I18nGroup', () => {
  const missing = vi.fn()
  // no fallbackLocale: it defaults to the locale
  const i18n = createI18n({ locale: 'en', missingHandler: missing })
  const changes = vi.fn()
  const unsubscribe = i18n.subscribe(changes)
  let api!: ReturnType<typeof useI18n>
  const $ = mountApp(i18n, () => {
    api = useI18n()
    return (
      <main>
        <h1>{api.t('greeting', { name: 'Bob' }) as string}</h1>
        <h2>{api.t('profile.name') as string}</h2>
        <p>{api.tc('apples', 2)}</p>
        <I18nT keypath="apples" plural={1} tag="em" class="count" html />
        <I18nGroup prefix="profile" groupClass="card" data-x="1">
          {({ t, prefix }: { t: (k: string, p?: object) => string; prefix: string }) => `${prefix}:${t('name')}:${t('hint', { who: 'me' })}`}
        </I18nGroup>
        <I18nGroup prefix="static">plain child</I18nGroup>
      </main>
    )
  })

  // nothing loaded yet: keys come back, the missing handler sees each miss with its route
  expect($('h1').textContent).toBe('greeting')
  expect($('p').textContent).toBe('apples')
  expect(missing).toHaveBeenCalledWith('en', 'greeting', 'index')
  expect($('div.i18n-group').outerHTML).toBe('<div class="i18n-group card" data-x="1">profile:profile.name:profile.hint</div>')
  expect($('div.i18n-group:not(.card)').outerHTML).toBe('<div class="i18n-group">plain child</div>')

  expect(i18n.currentRoute).toBe('index')
  expect(i18n.fallbackLocale).toBe('en')
  expect(i18n.getFallbackLocale()).toBe('en')
  // the mount itself counted: the provider's `iso` moved the plural tag
  expect(changes).toHaveBeenCalledTimes(1)
  changes.mockClear()
  i18n.addTranslations('en', en)
  // merge is the default: a second, partial load keeps the rest
  i18n.addTranslations('en', { greeting: en.greeting })
  expect(changes).toHaveBeenCalledTimes(2)
  expect($('h1').textContent).toBe('Hello, Bob!')
  expect($('p').textContent).toBe('2 apples')
  expect($('em').outerHTML).toBe('<em class="count">one apple</em>')
  expect($('div.card').textContent).toBe('profile:Name:Hi me')

  // a second locale arrives and the user switches to it; missing keys fall back to en
  api.addTranslations('de', de)
  changes.mockClear()
  const before = i18n.getSnapshot()
  api.switchLocale('de')
  expect(changes).toHaveBeenCalledTimes(1)
  expect(i18n.getSnapshot()).not.toBe(before)
  expect(api.locale()).toBe('de')
  expect(i18n.locale).toBe('de')
  expect(api.getLocale()).toBe('de')
  expect(api.getLocaleName()).toBe('Deutsch')
  expect(i18n.fallbackLocale).toBe('en')
  expect(i18n.getFallbackLocale()).toBe('en')
  expect($('h1').textContent).toBe('Hallo, Bob!')
  expect($('em').textContent).toBe('ein Apfel')
  expect($('div.card').textContent).toBe('profile:Name (de):Hi me')
  expect(api.has('profile.hint')).toBe(false)
  expect(api.ts('profile.hint', { who: 'x' })).toBe('Hi x')

  // page-level translations override the root ones while that route is active
  api.addRouteTranslations('de', 'settings', { profile: { name: 'Profilname' } })
  api.addRouteTranslations('de', 'settings', { profile: { extra: 'x' } })
  expect($('h2').textContent).toBe('Name (de)')
  api.setRoute('settings')
  expect(changes).toHaveBeenCalledTimes(4)
  // JSX reading t() follows the route
  expect($('h2').textContent).toBe('Profilname')
  expect(i18n.currentRoute).toBe('settings')
  expect(i18n.routeAccessor()).toBe('settings')
  expect(api.getRoute()).toBe('settings')
  expect($('em').textContent).toBe('ein Apfel')
  expect(api.t('profile.name')).toBe('Profilname')
  expect(api.resolveTranslations().profile).toEqual({ name: 'Profilname', extra: 'x', hint: 'Hi {who}' })
  api.setRoute('index')
  expect($('h2').textContent).toBe('Name (de)')

  // replacing (merge=false) drops keys; setTranslation edits the active locale in place
  api.addTranslations('de', { greeting: 'Servus, {name}!' }, false)
  api.setTranslation('apples', 'Äpfel: {count}')
  expect($('h1').textContent).toBe('Servus, Bob!')
  expect($('em').textContent).toBe('Äpfel: 1')
  expect(api.tn(1234.5)).toBe('1.234,5')
  expect(api.td(new Date(Date.UTC(2024, 0, 15)), { timeZone: 'UTC' })).toBe('15.1.2024')
  expect(api.tdr(Date.now() + 3 * 86_400_000)).toBe('in 3 Tagen')

  const calls = changes.mock.calls.length
  unsubscribe()
  api.clearCache()
  expect(changes).toHaveBeenCalledTimes(calls)
  expect($('h1').textContent).toBe('greeting')
})

test('I18nT renders numbers, dates, plurals, HTML and empty values, and follows the locale in both modes', () => {
  const i18n = createI18n({ locale: 'en', fallbackLocale: 'en', messages: { en, de }, missingWarn: false, timeZone: 'UTC' })
  const now = Date.now()
  const $ = mountApp(i18n, () => (
    <div>
      <I18nT id="num" keypath="price" number="1500" html />
      <I18nT id="date" keypath="posted" date={new Date(Date.UTC(2024, 4, 1, 12))} html />
      <I18nT id="rel" keypath="updated" relativeDate={now - 2 * 3_600_000} html />
      <I18nT id="rich" keypath="rich" plural="3" html tag="p" />
      <I18nT id="text" keypath="rich" plural={3} />
      <I18nT
        id="rule"
        keypath="apples"
        plural={4}
        params={{ name: 'Z' }}
        html
        customPluralRule={(_key, count, params, locale, t) => `${locale}:${count}:${t('greeting', params)}`}
      />
      <I18nT id="rule-empty" keypath="apples" plural={4} customPluralRule={() => null} />
      <I18nT id="tc-default" keypath="nope" plural={2} defaultValue="none" />
      <I18nT id="plain" keypath="greeting" params={{ name: '<i>x</i>' }} />
      <I18nT id="missing" keypath="gone" defaultValue="fallback text" />
      <p id="hidden">
        <I18nT keypath="blank" hideIfEmpty defaultValue="nothing here" />
      </p>
      <p id="hidden-html">
        <I18nT keypath="blank" hideIfEmpty defaultValue="empty" html />
      </p>
      <span id="gone">
        <I18nT keypath="blank" hideIfEmpty />
      </span>
      <I18nT id="blank-shown" keypath="blank" />
    </div>
  ))
  const html = (id: string) => $(`#${id}`).outerHTML

  expect(html('num')).toBe('<span id="num">Price: 1,500</span>')
  expect(html('date')).toBe('<span id="date">Posted 5/1/2024</span>')
  expect(html('rel')).toBe('<span id="rel">Updated 2 hours ago</span>')
  expect(html('rich')).toBe('<p id="rich"><b>3</b> new</p>')
  expect(html('text')).toBe('<span id="text">&lt;b&gt;3&lt;/b&gt; new</span>')
  expect(html('rule')).toBe('<span id="rule">en:4:Hello, Z!</span>')
  expect(html('rule-empty')).toBe('<span id="rule-empty"></span>')
  expect(html('tc-default')).toBe('<span id="tc-default">none</span>')
  expect(html('plain')).toBe('<span id="plain">Hello, &lt;i&gt;x&lt;/i&gt;!</span>')
  expect(html('missing')).toBe('<span id="missing">fallback text</span>')
  expect(html('hidden')).toBe('<p id="hidden">nothing here</p>')
  expect(html('hidden-html')).toBe('<p id="hidden-html">empty</p>')
  expect(html('gone')).toBe('<span id="gone"></span>')
  expect(html('blank-shown')).toBe('<span id="blank-shown">   </span>')

  i18n.locale = 'de'
  expect(html('num')).toBe('<span id="num">Price: 1.500</span>')
  expect(html('date')).toBe('<span id="date">Posted 1.5.2024</span>')
  expect(html('rel')).toBe('<span id="rel">Updated vor 2 Stunden</span>')
  expect(html('rule')).toBe('<span id="rule">de:4:Hallo, Z!</span>')
  // text mode re-renders too
  expect(html('plain')).toBe('<span id="plain">Hallo, &lt;i&gt;x&lt;/i&gt;!</span>')
  expect(html('tc-default')).toBe('<span id="tc-default">none</span>')
})

test('I18nSwitcher driven by props and links without a router', () => {
  const i18n = createI18n({ locale: 'uk', fallbackLocale: 'en', messages: { en, de } })
  const switched = vi.fn()
  const [props, setProps] = createSignal<Record<string, unknown>>({})
  const $ = mountApp(i18n, () => (
    <nav>
      <I18nLink id="plain" to="/about" activeStyle={{ color: 'red' }}>
        About
      </I18nLink>
      <I18nLink id="here" to={{ path: '/' }} activeStyle={{ color: 'red' }} style={{ margin: '1px' }}>
        Here
      </I18nLink>
      <I18nLink id="bare" to={{}}>
        Bare
      </I18nLink>
      <I18nLink id="mail" to="mailto:a@b.c">
        Mail
      </I18nLink>
      <I18nSwitcher
        customDisabledLinkStyle={{ opacity: '0.3' }}
        customLabels={{ en: 'EN' }}
        locales={props().locales as Locale[] | undefined}
        currentLocale={props().currentLocale as string | undefined}
        getLocaleName={props().getLocaleName as (() => string | null) | undefined}
        switchLocale={props().switchLocale as ((l: string) => void) | undefined}
        localeRoute={props().localeRoute as ((to: string, l?: string) => string | { path?: string }) | undefined}
      />
    </nav>
  ))
  const button = () => $('button')

  // without a router: links are plain anchors, nothing says what is active
  expect($('#plain').getAttribute('href')).toBe('/about')
  expect($('#plain').getAttribute('style')).toBeNull()
  expect($('#here').getAttribute('href')).toBe('/')
  expect($('#here').getAttribute('style')).toBe('margin: 1px;')
  expect($('#mail').getAttribute('target')).toBe('_blank')
  expect($('#bare').getAttribute('href')).toBe('/')
  const click = new MouseEvent('click', { bubbles: true, cancelable: true })
  $('#plain').dispatchEvent(click)
  expect(click.defaultPrevented).toBe(false)

  // a disabled current locale gets the disabled style on the button and is still named
  expect(button().getAttribute('style')).toContain('opacity: 0.3;')
  expect(button().textContent).toBe('Українська ▾')
  button().click()
  expect([...document.querySelectorAll('.i18n-switcher-dropdown a')].map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
    ['EN', '#'],
    ['Deutsch', '#'],
  ])
  ;($('.switcher-locale-de') as HTMLElement).click()
  expect(i18n.getLocale()).toBe('de')
  expect(button().getAttribute('style')).not.toContain('opacity')
  expect(button().textContent).toBe('Deutsch ▾')

  // props take over: own locale list, current locale, name, route builder and switch handler
  setProps({
    locales: [{ code: 'en' }, { code: 'pt' }],
    currentLocale: 'pt',
    getLocaleName: () => 'Custom name',
    switchLocale: switched,
    localeRoute: (_to: string, locale?: string) => (locale === 'en' ? { path: '/en' } : {}),
  })
  // a caller's name wins over the list, as in React and Preact
  expect(button().textContent).toBe('Custom name ▾')
  button().click()
  expect([...document.querySelectorAll('.i18n-switcher-dropdown a')].map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
    ['EN', '/en'],
    ['pt', '/'],
  ])
  ;($('.switcher-locale-en') as HTMLElement).click()
  // the handler owns the switch: the instance locale is untouched
  expect(switched).toHaveBeenCalledWith('en')
  expect(i18n.getLocale()).toBe('de')

  setProps({ ...props(), currentLocale: 'xx' })
  expect(button().textContent).toBe('Custom name ▾')
  setProps({ ...props(), getLocaleName: () => null })
  expect(button().textContent).toBe('xx ▾')
  setProps({ locales: [{ code: 'en' }] })
  expect(button().textContent).toBe('de ▾')
  // a current locale missing from the list is its code
  setProps({ currentLocale: 'xx' })
  expect(button().textContent).toBe('xx ▾')
})

test('misuse fails loudly with a pointer to the fix', () => {
  const i18n = createI18n({ locale: 'en' })
  const tryRender = (tree: () => JSX.Element) => {
    const container = document.createElement('div')
    try {
      render(tree, container)()
      return undefined
    } catch (error) {
      return (error as Error).message
    }
  }
  const Probe = (props: { use: () => unknown }) => {
    props.use()
    return null
  }

  expect(tryRender(() => <I18nT keypath="a" />)).toBe('[i18n-micro] I18nContext not found. Make sure I18nProvider is used.')
  const withI18n = (use: () => unknown) => () => (
    <I18nProvider i18n={i18n}>
      <Probe use={use} />
    </I18nProvider>
  )
  // a bare provider is enough: what it lacks is empty, not an error
  expect(tryRender(withI18n(useI18nContext))).toBeUndefined()
  expect(tryRender(withI18n(useI18nLocales))).toBeUndefined()
  expect(tryRender(withI18n(useI18nDefaultLocale))).toBeUndefined()
  expect(tryRender(withI18n(useI18n))).toBeUndefined()
  // a nested provider without locales/defaultLocale keeps the outer ones
  expect(
    tryRender(() => (
      <I18nProvider i18n={i18n} locales={locales} defaultLocale="en">
        <I18nProvider i18n={i18n}>
          <Probe
            use={() =>
              useI18n().getLocales().length === 3 ||
              (() => {
                throw new Error('lost locales')
              })()
            }
          />
        </I18nProvider>
      </I18nProvider>
    )),
  ).toBeUndefined()
  // explicit options win over the provided ones
  let api!: ReturnType<typeof useI18n>
  expect(
    tryRender(() => (
      <I18nProvider i18n={i18n} locales={locales} defaultLocale="en">
        <Probe use={() => (api = useI18n({ locales: [{ code: 'x' }], defaultLocale: 'x' }))} />
      </I18nProvider>
    )),
  ).toBeUndefined()
  expect(api.getLocales()).toEqual([{ code: 'x' }])
  expect(api.defaultLocale()).toBe('x')
  expect(api.instance).toBe(i18n)
  expect(api.getLocaleName()).toBeNull()
  // no router: paths pass through untouched
  expect(api.localeRoute('/a', 'de')).toBe('/a')
})
