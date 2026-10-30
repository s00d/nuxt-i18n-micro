// @ts-nocheck — JSX typing noise between preact and RTL; behaviour is what these tests pin
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/preact'
import { stderr } from 'node:process'
import { useEffect, useState } from 'preact/hooks'
import {
  createBrowserHistoryAdapter,
  createI18n,
  createPreactRouterAdapter,
  I18nGroup,
  I18nLink,
  I18nProvider,
  I18nSwitcher,
  I18nT,
  PreactI18n,
  useI18n,
} from '../src'

// Same shape as packages/preact/playground: three locales, English default, locale files loaded later.
const locales = [
  { code: 'en', displayName: 'English', iso: 'en-US' },
  { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
  { code: 'de', displayName: 'Deutsch', iso: 'de-DE' },
]

const en = {
  welcome: 'Welcome',
  greeting: 'Hello, {name}!',
  apples: 'no apples | one apple | {count} apples',
  number: 'Number: {number}',
  date: 'Date: {date}',
  relativeDate: 'Relative: {relativeDate}',
  nav: { home: 'Home', about: 'About' },
  htmlExample: 'This is <strong>HTML</strong> content',
  hideIfEmpty: '',
  blank: '   ',
  basket: 'empty | one for {who} | {count} for {who}',
  group: { title: 'Group Title', item: 'Item count: {count}', meta: { a: 'x' } },
}
const fr = {
  welcome: 'Bienvenue',
  greeting: 'Bonjour, {name} !',
  apples: 'pas de pommes | une pomme | {count} pommes',
  number: 'Nombre : {number}',
  nav: { home: 'Accueil', about: 'À propos' },
  group: { title: 'Titre du groupe', item: 'Éléments : {count}' },
}
const de = { welcome: 'Willkommen', nav: { home: 'Startseite', about: 'Über uns' }, number: 'Zahl: {number}' }

// relative dates are measured against a frozen clock
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2025-06-01T12:00:00Z'))
})
afterEach(() => {
  vi.useRealTimers()
})

describe('Preact app over @i18n-micro/preact', () => {
  test('hook outside the provider fails loudly', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const write = stderr.write.bind(stderr)
    stderr.write = (() => true) as typeof stderr.write
    const Orphan = () => {
      useI18n()
      return null
    }
    try {
      expect(() => render(<Orphan />)).toThrow('[i18n-micro] I18nContext not found. Make sure I18nProvider is used.')
    } finally {
      stderr.write = write
      consoleSpy.mockRestore()
    }
  })

  test('page without a router: messages arrive late, locale switches, routes scope keys, links fall back to plain hrefs', () => {
    const i18n = createI18n({ locale: 'en', fallbackLocale: 'en', missingWarn: false, messages: { en: {} } })
    expect(i18n).toBeInstanceOf(PreactI18n)
    let api
    const Page = () => {
      api = useI18n()
      return (
        <div>
          <h1 data-testid="title">{api.t('welcome')}</h1>
          <p data-testid="greeting">{api.ts('greeting', { name: 'React' })}</p>
          <p data-testid="apples">{api.tc('apples', 5)}</p>
          <p data-testid="name">{String(api.getLocaleName())}</p>
          <p data-testid="has">{String(api.has('welcome'))}</p>
          <p data-testid="num">{api.tn(1234.5)}</p>
          <p data-testid="date">{api.td(new Date(2023, 0, 15))}</p>
          <p data-testid="rel">{api.tdr(Date.now() - 3_600_000)}</p>
          <p data-testid="page">{api.t('page.title')}</p>
        </div>
      )
    }
    render(
      <I18nProvider i18n={i18n} locales={locales}>
        <Page />
      </I18nProvider>,
    )
    const text = (id: string) => screen.getByTestId(id).textContent

    // nothing loaded yet: keys show through, has() is false
    expect(text('title')).toBe('welcome')
    expect(text('has')).toBe('false')
    expect(text('name')).toBe('English')
    // provider gave locales but no default: default is the instance's locale
    expect(api.getLocales()).toBe(locales)
    expect(api.defaultLocale()).toBe('en')
    expect([api.locale, api.fallbackLocale, api.currentRoute, api.getRoute()]).toEqual(['en', 'en', 'index', 'index'])

    // locale files land (playground: dynamic import, then addTranslations) → re-render
    act(() => {
      api.addTranslations('en', en, false)
      api.addTranslations('fr', fr, false)
    })
    expect([text('title'), text('greeting'), text('apples'), text('has')]).toEqual(['Welcome', 'Hello, React!', '5 apples', 'true'])
    expect([text('num'), text('date'), text('rel')]).toEqual(['1,234.5', '1/15/2023', '1 hour ago'])

    // no router: switchLocale only sets the locale, paths pass through untouched
    act(() => api.switchLocale('fr'))
    expect([api.locale, text('title'), text('greeting'), text('apples'), text('name')]).toEqual([
      'fr',
      'Bienvenue',
      'Bonjour, React !',
      '5 pommes',
      'Français',
    ])
    expect(api.localePath('/about')).toBe('/about')
    expect(api.localePath({ path: '/about' })).toBe('/about')
    expect(api.localePath({})).toBe('/')
    expect(api.localeRoute({ path: '/x' }, 'de')).toEqual({ path: '/x' })

    // fr misses `date`: fallback locale (en) answers
    expect(api.t('date')).toBe('Date: {date}')

    // a route-scoped chunk only shows on its route
    act(() => api.addRouteTranslations('fr', 'about', { page: { title: 'À propos de nous' } }, false))
    expect(text('page')).toBe('page.title')
    act(() => api.setRoute('about'))
    expect([api.currentRoute, text('page')]).toEqual(['about', 'À propos de nous'])

    // merge keeps siblings; clearCache drops what was loaded
    act(() => api.addTranslations('fr', { extra: 'x' }))
    expect(text('title')).toBe('Bienvenue')
    act(() => api.clearCache())
    expect(text('title')).toBe('welcome')

    // a locale outside the list has no display name; setLocale re-renders too
    act(() => api.setLocale('es'))
    expect([api.locale, text('name')]).toEqual(['es', 'null'])
  })

  test('useI18n options override the provider; nested providers keep outer contexts; a swapped instance is followed', () => {
    const i18n = createI18n({ locale: 'de', messages: { de } })
    let fromOptions
    let bare
    const WithOptions = () => {
      fromOptions = useI18n({ locales: locales.slice(0, 1), defaultLocale: 'fr' })
      return null
    }
    const Bare = () => {
      bare = useI18n()
      return null
    }
    render(
      <I18nProvider i18n={i18n} locales={locales} defaultLocale="en">
        <WithOptions />
        <I18nProvider i18n={i18n}>
          <Bare />
        </I18nProvider>
      </I18nProvider>,
    )
    expect([fromOptions.getLocales(), fromOptions.defaultLocale(), fromOptions.getLocaleName()]).toEqual([locales.slice(0, 1), 'fr', null])
    // the inner provider does not reset the outer contexts
    expect([bare.getLocales(), bare.defaultLocale(), bare.getLocaleName()]).toEqual([locales, 'en', 'Deutsch'])

    // each context is provided on its own: a strategy or a default locale without a locale list still applies,
    // and an inner provider without a strategy keeps the outer one
    let partial
    const Partial = () => {
      partial = useI18n()
      return null
    }
    const prefixer = { getCurrentPath: () => '/x', push: () => {}, replace: () => {}, resolvePath: (to, l) => `/${l}${to}` }
    render(
      <I18nProvider i18n={i18n} defaultLocale="fr" routingStrategy={prefixer}>
        <I18nProvider i18n={i18n}>
          <Partial />
        </I18nProvider>
      </I18nProvider>,
    )
    expect([partial.localePath('/x', 'fr'), partial.defaultLocale(), partial.getLocales()]).toEqual(['/fr/x', 'fr', []])

    // the provider gets a new instance: the hook follows it, not the old one
    const Live = () => <p data-testid="live">{useI18n().t('welcome')}</p>
    const view = render(
      <I18nProvider i18n={i18n}>
        <Live />
      </I18nProvider>,
    )
    const next = createI18n({ locale: 'en', messages: { en, fr } })
    view.rerender(
      <I18nProvider i18n={next}>
        <Live />
      </I18nProvider>,
    )
    expect(screen.getByTestId('live').textContent).toBe('Welcome')
    act(() => {
      next.locale = 'fr'
    })
    expect(screen.getByTestId('live').textContent).toBe('Bienvenue')
  })

  test('I18nT and I18nGroup render every mode and follow locale and route changes', () => {
    const i18n = createI18n({ locale: 'en', missingWarn: false, messages: { en, fr, de } })
    const rule = vi.fn((key, count, params, locale, getter) => `${getter(key)}#${count}@${locale}/${params.who ?? '-'}`)
    const ruleEmpty = () => null
    const { container } = render(
      <I18nProvider i18n={i18n} locales={locales} defaultLocale="en">
        <I18nT data-testid="plain" keypath="welcome" className="t" id="w" />
        <I18nT data-testid="params" keypath="greeting" params={{ name: 'React' }} tag="h2" />
        <I18nT data-testid="p0" keypath="apples" plural={0} />
        <I18nT data-testid="p1" keypath="apples" plural="1" />
        <I18nT data-testid="p5" keypath="apples" plural="5.9" />
        <I18nT data-testid="pmissing" keypath="pears" plural={2} defaultValue="no pears" />
        <I18nT data-testid="prule" keypath="welcome" plural={3} params={{ who: 'me' }} customPluralRule={rule} />
        <I18nT data-testid="pruleempty" keypath="welcome" plural={3} customPluralRule={ruleEmpty} />
        <I18nT data-testid="phtml" keypath="htmlExample" plural={1} html />
        <I18nT data-testid="num" keypath="number" number="1234.5" />
        <I18nT data-testid="numhtml" keypath="htmlExample" number={1} html tag="div" />
        <I18nT data-testid="date" keypath="date" date={new Date(2023, 0, 15)} />
        <I18nT data-testid="numparams" keypath="greeting" number={1} params={{ name: 'N' }} />
        <I18nT data-testid="dateparams" keypath="greeting" date={0} params={{ name: 'D' }} />
        <I18nT data-testid="relparams" keypath="greeting" relativeDate={0} params={{ name: 'R' }} />
        <I18nT data-testid="datehtml" keypath="htmlExample" date={0} html />
        <I18nT data-testid="rel" keypath="relativeDate" relativeDate={Date.now() - 3_600_000} />
        <I18nT data-testid="relhtml" keypath="htmlExample" relativeDate={0} html />
        <I18nT data-testid="html" keypath="htmlExample" html tag="div" />
        <I18nT data-testid="missing" keypath="nope" defaultValue="Fallback text" />
        <I18nT data-testid="pparams" keypath="basket" plural={2} params={{ who: 'Ann' }} />
        <div data-testid="escaped">
          <I18nT keypath="htmlExample" />
          <I18nT keypath="htmlExample" plural={1} />
          <I18nT keypath="htmlExample" number={1} />
          <I18nT keypath="htmlExample" date={0} />
          <I18nT keypath="htmlExample" relativeDate={0} />
        </div>
        <div data-testid="namespace">
          <I18nT keypath="nav" />
          <I18nT keypath="nav" number={1} />
          <I18nT keypath="nav" date={0} />
          <I18nT keypath="nav" relativeDate={0} />
          <I18nGroup prefix="group">{({ t }) => t('meta')}</I18nGroup>
        </div>
        <section data-testid="hidden">
          <I18nT keypath="hideIfEmpty" hideIfEmpty defaultValue="No translation" />|
          <I18nT keypath="hideIfEmpty" hideIfEmpty />|
          <I18nT keypath="blank" hideIfEmpty />|
          <I18nT keypath="hideIfEmpty" />
        </section>
        <I18nGroup data-testid="group" prefix="group" groupClass="card" title="g">
          {({ prefix, t }) => (
            <span>
              {prefix}:{t('title')}/{t('item', { count: 5 })}
            </span>
          )}
        </I18nGroup>
        <I18nGroup data-testid="group-static" prefix="group">
          static
        </I18nGroup>
        <I18nGroup data-testid="group-route" prefix="page">
          {({ t }) => t('title')}
        </I18nGroup>
      </I18nProvider>,
    )
    const el = (id: string) => screen.getByTestId(id)
    const text = (id: string) => el(id).textContent

    expect(el('plain').outerHTML).toBe('<span data-testid="plain" class="t" id="w">Welcome</span>')
    expect(el('params').outerHTML).toBe('<h2 data-testid="params">Hello, React!</h2>')
    expect([text('p0'), text('p1'), text('p5'), text('pmissing')]).toEqual(['no apples', 'one apple', '5 apples', 'no pears'])
    expect(text('prule')).toBe('Welcome#3@en/me')
    expect(el('pruleempty').outerHTML).toBe('<span data-testid="pruleempty"></span>')
    expect(el('phtml').innerHTML).toBe('This is <strong>HTML</strong> content')
    expect([text('num'), text('date'), text('rel')]).toEqual(['Number: 1,234.5', 'Date: 1/15/2023', 'Relative: 1 hour ago'])
    expect([text('numparams'), text('dateparams'), text('relparams')]).toEqual(['Hello, N!', 'Hello, D!', 'Hello, R!'])
    expect(el('numhtml').outerHTML).toBe('<div data-testid="numhtml">This is <strong>HTML</strong> content</div>')
    expect(el('datehtml').innerHTML).toBe('This is <strong>HTML</strong> content')
    expect(el('relhtml').innerHTML).toBe('This is <strong>HTML</strong> content')
    expect(el('html').outerHTML).toBe('<div data-testid="html">This is <strong>HTML</strong> content</div>')
    expect(text('missing')).toBe('Fallback text')
    // hideIfEmpty: default text without a wrapper, else nothing; without the flag an empty span
    expect(el('hidden').innerHTML).toBe('No translation|||<span></span>')
    expect(text('pparams')).toBe('2 for Ann')
    // without `html` markup in a message stays text
    expect(el('escaped').querySelectorAll('strong')).toHaveLength(0)
    expect(text('escaped')).toBe('This is <strong>HTML</strong> content'.repeat(5))
    // a key that names a namespace renders as a string instead of crashing the tree
    expect(text('namespace')).toBe('[object Object]'.repeat(5))
    expect(el('group').outerHTML).toBe(
      '<div data-testid="group" title="g" class="i18n-group card"><span>group:Group Title/Item count: 5</span></div>',
    )
    expect(el('group-static').outerHTML).toBe('<div data-testid="group-static" class="i18n-group">static</div>')
    expect(text('group-route')).toBe('page.title')

    act(() => {
      i18n.locale = 'fr'
    })
    expect([text('plain'), text('p1'), text('num'), text('prule')]).toEqual(['Bienvenue', 'une pomme', 'Nombre : 1\u202f234,5', 'Bienvenue#3@fr/me'])
    expect(text('group')).toBe('group:Titre du groupe/Éléments : 5')

    // route chunk: I18nT and I18nGroup read the active route
    act(() => {
      i18n.addRouteTranslations('fr', 'about', { welcome: 'Bienvenue sur À propos', page: { title: 'Page À propos' } })
      i18n.setRoute('about')
    })
    expect([text('plain'), text('group-route')]).toEqual(['Bienvenue sur À propos', 'Page À propos'])
    expect(container.querySelectorAll('.i18n-group')).toHaveLength(4)
  })

  test('I18nLink without a router: locale paths, external links, clicks left to the browser', () => {
    const i18n = createI18n({ locale: 'fr', messages: { fr } })
    const localeRoute = (to, locale) => ({ path: `/${locale ?? 'fr'}${typeof to === 'string' ? to : to.path}` })
    let probe
    const Probe = () => {
      probe = useI18n()
      return null
    }
    render(
      <I18nProvider i18n={i18n}>
        <I18nLink to="/about" activeStyle={{ color: 'red' }} className="nav">
          plain
        </I18nLink>
        <I18nLink to={{ path: '/team' }}>object</I18nLink>
        <I18nLink to={{}}>empty</I18nLink>
        <I18nLink to="/about" localeRoute={localeRoute}>
          prop
        </I18nLink>
        <I18nLink to="/about" localeRoute={() => ({})}>
          prop-empty
        </I18nLink>
        <I18nLink to="https://example.com/a">https</I18nLink>
        <I18nLink to="http://example.com">http</I18nLink>
        <I18nLink to="//cdn.example.com/x">protocol</I18nLink>
        <I18nLink to="example.com">bare</I18nLink>
        <I18nLink to="example.com/login?next=https://app.example.com">redirect</I18nLink>
        <I18nLink to="mailto:hi@example.com">mail</I18nLink>
        <I18nLink to="tel:+123">tel</I18nLink>
        <I18nLink to="/docs.v2">dotted</I18nLink>
        <I18nLink to="/files/report.pdf">file</I18nLink>
        <I18nLink to="notes.v2">relative</I18nLink>
        <Probe />
      </I18nProvider>,
    )
    const href = (name: string) => screen.getByText(name).getAttribute('href')
    expect(screen.getByText('plain').outerHTML).toBe('<a class="nav" href="/about">plain</a>')
    expect([href('object'), href('empty'), href('prop'), href('prop-empty')]).toEqual(['/team', '/', '/fr/about', '/'])
    expect([href('https'), href('http'), href('protocol'), href('bare')]).toEqual([
      'https://example.com/a',
      'http://example.com',
      'https:////cdn.example.com/x',
      'https://example.com',
    ])
    expect(href('redirect')).toBe('https://example.com/login?next=https://app.example.com')
    expect([href('mail'), href('tel'), href('dotted')]).toEqual(['https://mailto:hi@example.com', 'https://tel:+123', '/docs.v2'])
    const external = screen.getByText('https')
    expect([external.getAttribute('target'), external.getAttribute('rel')]).toEqual(['_blank', 'noopener noreferrer'])
    expect(['dotted', 'file', 'relative'].map((n) => screen.getByText(n).hasAttribute('target'))).toEqual([false, false, false])
    expect(screen.getByText('http').getAttribute('target')).toBe('_blank')
    // a bare provider: no locales, no names
    expect([probe.getLocales(), probe.getLocaleName()]).toEqual([[], null])

    // no router: the click is the browser's (default not prevented)
    expect(fireEvent.click(screen.getByText('prop'))).toBe(true)
  })

  test('history-adapter app: links mark the active section, clicks and the switcher push prefixed routes', () => {
    window.history.replaceState({}, '', '/about/team?tab=1')
    const i18n = createI18n({ locale: 'en', fallbackLocale: 'en', messages: { en, fr, de } })
    const strategy = createBrowserHistoryAdapter(locales, 'en')
    expect(createPreactRouterAdapter).toBe(createBrowserHistoryAdapter)
    let api
    const linkClicks: string[] = []
    const Nav = () => {
      api = useI18n()
      // the app's router re-renders on popstate, as wouter / preact-router do
      const [path, setPath] = useState(window.location.pathname + window.location.search)
      useEffect(() => {
        const sync = () => setPath(window.location.pathname + window.location.search)
        window.addEventListener('popstate', sync)
        return () => window.removeEventListener('popstate', sync)
      }, [])
      return (
        <nav>
          <I18nLink to="/" activeStyle={{ fontWeight: 'bold' }}>
            {api.t('nav.home')}
          </I18nLink>
          <I18nLink to="/about" activeStyle={{ fontWeight: 'bold' }} className="about" onClick={(e) => linkClicks.push(e.type)}>
            {api.t('nav.about')}
          </I18nLink>
          <I18nLink to="/about/team" onClick={(e) => e.preventDefault()}>
            team
          </I18nLink>
          <I18nLink to="/abo" activeStyle={{ color: 'blue' }}>
            prefix-only
          </I18nLink>
          <I18nLink to="https://example.com" activeStyle={{ color: 'blue' }}>
            ext
          </I18nLink>
          <I18nSwitcher />
          <output data-testid="path">{path}</output>
        </nav>
      )
    }
    try {
      render(
        <I18nProvider i18n={i18n} locales={locales} defaultLocale="en" routingStrategy={strategy}>
          <Nav />
        </I18nProvider>,
      )
      const link = (name: string) => screen.getByText(name)
      const path = () => screen.getByTestId('path').textContent

      expect(strategy.getRoute()).toEqual({ fullPath: '/about/team?tab=1', query: { tab: '1' } })
      // /about is a parent of /about/team; /abo is no segment prefix; the root link is active on '/' only
      expect(link('Home').hasAttribute('style')).toBe(false)
      expect(link('About').getAttribute('style')).toBe('font-weight: bold;')
      expect([link('prefix-only').getAttribute('style'), link('ext').getAttribute('style')]).toEqual([null, null])

      // modified or non-primary clicks, external links and handlers that prevent stay with the browser
      expect(fireEvent.click(link('About'), { ctrlKey: true })).toBe(true)
      expect(fireEvent.click(link('About'), { metaKey: true })).toBe(true)
      expect(fireEvent.click(link('About'), { button: 1 })).toBe(true)
      expect(fireEvent.click(link('ext'))).toBe(true)
      fireEvent.click(link('team'))
      expect([path(), linkClicks]).toEqual(['/about/team?tab=1', ['click', 'click', 'click']])

      // a plain click is a client-side push
      expect(fireEvent.click(link('About'))).toBe(false)
      expect([path(), linkClicks.length]).toEqual(['/about', 4])

      // switcher with no props: sets the locale and pushes the prefixed path
      fireEvent.click(screen.getByRole('button', { name: /English/ }))
      fireEvent.click(screen.getByRole('button', { name: 'Français' }))
      expect([i18n.locale, path(), link('À propos').getAttribute('href'), link('Accueil').getAttribute('href')]).toEqual([
        'fr',
        '/fr/about',
        '/fr/about',
        '/fr',
      ])
      expect(link('À propos').getAttribute('style')).toBe('font-weight: bold;')
      // prefix routing: the /fr home link is a locale root, active on /fr only
      expect(link('Accueil').hasAttribute('style')).toBe(false)

      fireEvent.click(link('Accueil'))
      expect(path()).toBe('/fr')
      expect(link('Accueil').getAttribute('style')).toBe('font-weight: bold;')

      // switchLocale from the hook strips the old prefix; back to the default drops it
      act(() => api.switchLocale('de'))
      expect([i18n.locale, path()]).toEqual(['de', '/de'])
      act(() => api.switchLocale('en'))
      expect([i18n.locale, path()]).toEqual(['en', '/'])
      expect(link('Home').getAttribute('style')).toBe('font-weight: bold;')
      expect([api.localePath('/fr/about/team', 'de'), api.localePath({ path: '/about' }), api.localeRoute({}, 'fr'), api.localePath('/')]).toEqual([
        '/de/about/team',
        '/about',
        '/fr',
        '/',
      ])

      // replace() swaps the entry: history length stays put
      const length = window.history.length
      act(() => strategy.replace({ path: '/de/about' }))
      expect([path(), window.history.length]).toEqual(['/de/about', length])
      act(() => strategy.push({ path: '/about' }))
      expect([path(), window.history.length]).toEqual(['/about', length + 1])
    } finally {
      window.history.replaceState({}, '', '/')
    }
  })

  test('custom routing strategy: anchors push through the strategy, switcher honours its props', () => {
    const i18n = createI18n({ locale: 'en', missingWarn: false, messages: { en, fr } })
    const current = '/en/about/'
    const pushes: string[] = []
    const strategy = { getCurrentPath: () => current, push: ({ path }) => pushes.push(path), replace: () => {} }
    const switched: string[] = []
    const parentClick = vi.fn()
    const allLocales = [...locales, { code: 'es', displayName: 'Español', disabled: true }]
    render(
      <I18nProvider i18n={i18n} locales={allLocales} defaultLocale="en" routingStrategy={strategy}>
        <I18nLink to="/en/about" activeStyle={{ color: 'red' }}>
          raw
        </I18nLink>
        <I18nLink to="/en/about/" activeStyle={{ color: 'blue' }}>
          slashed
        </I18nLink>
        <I18nLink to="/en/about/x" activeStyle={{ color: 'red' }}>
          child
        </I18nLink>
        <I18nLink to={{ path: '/en' }} activeStyle={{ color: 'red' }}>
          object
        </I18nLink>
        <I18nLink to={{}}>empty</I18nLink>
        <I18nLink to="https://example.com" activeStyle={{ color: 'red' }}>
          ext
        </I18nLink>
        <div data-testid="free" onClick={parentClick}>
          <I18nSwitcher customLabels={{ fr: 'FR' }} />
        </div>
        <div data-testid="routed">
          <I18nSwitcher localeRoute={(to, code) => `/${code}${to}`} customDisabledLinkStyle={{ opacity: 0.5 }} />
        </div>
        <div data-testid="routed-empty">
          <I18nSwitcher localeRoute={() => ({})} />
        </div>
        <div data-testid="controlled">
          <I18nSwitcher
            currentLocale={() => 'es'}
            getLocaleName={() => 'Spanish'}
            switchLocale={(c) => switched.push(c)}
            customDisabledLinkStyle={{ opacity: 0.5 }}
          />
        </div>
        <div data-testid="disabled-current">
          <I18nSwitcher currentLocale="es" />
        </div>
        <div data-testid="unknown">
          <I18nSwitcher currentLocale="xx" locales={[]} />
        </div>
        <div data-testid="named">
          <I18nSwitcher currentLocale="xx" locales={[]} getLocaleName={() => 'Mystery'} />
        </div>
      </I18nProvider>,
    )
    const within = (id: string, selector: string) => screen.getByTestId(id).querySelector(selector)
    const open = (id: string) => fireEvent.click(within(id, '.i18n-switcher-button'))

    // a disabled current locale is labelled with its own name, not the name of i18n.locale
    expect(within('disabled-current', '.i18n-switcher-button').textContent).toBe('Español▼')

    // no resolvePath: hrefs are the raw targets; exact and parent matches are active
    expect(screen.getByText('raw').getAttribute('style')).toBe('color: red;')
    expect(screen.getByText('slashed').getAttribute('style')).toBe('color: blue;')
    expect(screen.getByText('child').hasAttribute('style')).toBe(false)
    expect(screen.getByText('ext').hasAttribute('style')).toBe(false)
    // the /en locale root is no parent of /en/about/
    expect(screen.getByText('object').hasAttribute('style')).toBe(false)
    expect([screen.getByText('object').getAttribute('href'), screen.getByText('empty').getAttribute('href')]).toEqual(['/en', '/'])
    const click = new MouseEvent('click', { bubbles: true, cancelable: true })
    screen.getByText('object').dispatchEvent(click)
    expect([click.defaultPrevented, pushes]).toEqual([true, ['/en']])
    // a provider without `locales` still knows the current locale root
    const bare = render(
      <I18nProvider i18n={i18n} routingStrategy={strategy}>
        <I18nLink to="/en" activeStyle={{ color: 'red' }}>
          bare-root
        </I18nLink>
      </I18nProvider>,
    )
    expect(screen.getByText('bare-root').hasAttribute('style')).toBe(false)
    bare.unmount()

    // free switcher: custom label for fr, disabled es left out, path pushed unchanged without resolvePath
    open('free')
    const items = () => [...screen.getByTestId('free').querySelectorAll('li button')].map((b) => b.textContent)
    expect(items()).toEqual(['English', 'FR', 'Deutsch'])
    // picking an item is handled here: no default action, no click reaching the parent
    expect(fireEvent.click(within('free', '.switcher-locale-fr'))).toBe(false)
    expect(parentClick).not.toHaveBeenCalled()
    expect([i18n.locale, pushes.at(-1), within('free', 'ul')]).toEqual(['fr', '/en/about/', null])
    expect(within('free', '.i18n-switcher-button').textContent).toBe('FR▼')

    // localeRoute prop wins over the strategy
    open('routed')
    fireEvent.click(within('routed', '.switcher-locale-de'))
    expect([i18n.locale, pushes.at(-1)]).toEqual(['de', '/de/en/about/'])
    open('routed-empty')
    fireEvent.click(within('routed-empty', '.switcher-locale-en'))
    expect(pushes.at(-1)).toBe('/')

    // controlled: current locale from a function, disabled current gets the disabled style, switchLocale prop takes over
    const controlled = within('controlled', '.i18n-switcher-button')
    // a caller's getLocaleName wins over the list name
    expect(controlled.textContent).toBe('Spanish▼')
    expect(controlled.style.opacity).toBe('0.5')
    // a disabled locale elsewhere in the list does not style an enabled current one
    expect(within('routed', '.i18n-switcher-button').style.opacity).toBe('')
    open('controlled')
    const before = pushes.length
    fireEvent.click(within('controlled', '.switcher-locale-de'))
    expect([switched, i18n.locale, pushes.length]).toEqual([['de'], 'en', before])

    // no list, no name: the code itself is the label
    expect(within('unknown', '.i18n-switcher-button').textContent).toBe('xx▼')
    expect(within('named', '.i18n-switcher-button').textContent).toBe('Mystery▼')

    // a strategy whose resolvePath answers with route objects (path may be missing)
    const objPushes: string[] = []
    const objStrategy = {
      getCurrentPath: () => '/about',
      push: ({ path }) => objPushes.push(path),
      replace: () => {},
      resolvePath: (to, l) => (l === 'en' ? {} : { path: `/${l}${to}` }),
    }
    let hook
    const Hook = () => {
      hook = useI18n()
      return null
    }
    const second = render(
      <I18nProvider i18n={i18n} locales={locales} defaultLocale="en" routingStrategy={objStrategy}>
        <I18nSwitcher />
        <Hook />
      </I18nProvider>,
    )
    act(() => hook.switchLocale('fr'))
    act(() => hook.switchLocale('en'))
    fireEvent.click(second.container.querySelector('.i18n-switcher-button'))
    fireEvent.click(second.container.querySelector('.switcher-locale-de'))
    fireEvent.click(second.container.querySelector('.i18n-switcher-button'))
    fireEvent.click(second.container.querySelector('.switcher-locale-en'))
    expect(objPushes).toEqual(['/fr/about', '/', '/de/about', '/'])

    // a strategy may bring its own link element: a tag name or a component, no click interception
    const Custom = ({ href, children, style, title }) => (
      <a data-router="custom" href={href} style={style} title={title}>
        {children}
      </a>
    )
    render(
      <>
        <I18nProvider i18n={i18n} locales={locales} defaultLocale="en" routingStrategy={{ ...strategy, linkComponent: 'a' }}>
          <I18nLink to="/en/about" activeStyle={{ color: 'red' }} title="t">
            tag
          </I18nLink>
        </I18nProvider>
        <I18nProvider i18n={i18n} locales={locales} defaultLocale="en" routingStrategy={{ ...strategy, linkComponent: Custom }}>
          <I18nLink to="/en/about" activeStyle={{ color: 'red' }} title="c">
            comp
          </I18nLink>
        </I18nProvider>
      </>,
    )
    expect(screen.getByText('tag').outerHTML).toBe('<a title="t" href="/en/about" style="color: red;">tag</a>')
    expect(screen.getByText('comp').outerHTML).toBe('<a data-router="custom" href="/en/about" style="color: red;" title="c">comp</a>')
    const pushed = pushes.length
    expect(fireEvent.click(screen.getByText('tag'))).toBe(true)
    expect(pushes.length).toBe(pushed)
  })

  test('I18nSwitcher dropdown: toggles, closes on outside clicks only, marks and styles the active locale', () => {
    const i18n = createI18n({ locale: 'fr', messages: { fr } })
    const view = render(
      <I18nProvider i18n={i18n}>
        <p data-testid="outside">outside</p>
        <I18nSwitcher
          locales={locales}
          className="lang"
          customWrapperStyle={{ margin: '1px' }}
          customButtonStyle={{ color: 'white' }}
          customDropdownStyle={{ borderRadius: '4px' }}
          customItemStyle={{ fontSize: '14px' }}
          customLinkStyle={{ fontSize: '12px' }}
          customActiveLinkStyle={{ textDecoration: 'underline', backgroundColor: 'yellow' }}
          customIconStyle={{ color: 'gray' }}
        />
      </I18nProvider>,
    )
    const button = screen.getByRole('button', { name: /Français/ })
    // a caller className is added to the built-in wrapper class
    const wrapper = view.container.querySelector('.lang')
    expect(wrapper.className).toBe('i18n-switcher-wrapper lang')
    expect(wrapper.getAttribute('style')).toBe('position: relative; display: inline-block; vertical-align: middle; margin: 1px;')
    expect(button.getAttribute('style')).toBe(
      'padding: 4px 12px; font-size: 16px; cursor: pointer; background-color: rgb(255, 255, 255); border: 1px solid rgb(51, 51, 51); transition: background-color 0.3s ease; display: flex; align-items: center; justify-content: space-between; color: white;',
    )
    expect([button.getAttribute('aria-haspopup'), button.getAttribute('aria-expanded'), button.type]).toEqual(['true', 'false', 'button'])
    const icon = () => button.querySelector('span:last-child').getAttribute('style')
    expect(icon()).toBe('margin-left: 8px; display: inline-block; transition: transform 0.3s ease; color: gray;')

    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(icon()).toBe('margin-left: 8px; display: inline-block; transition: transform 0.3s ease; color: gray; transform: rotate(180deg);')
    const list = view.container.querySelector('ul')
    expect(list.className).toBe('i18n-switcher-dropdown')
    expect(list.getAttribute('style')).toBe(
      'position: absolute; top: 100%; left: 0px; z-index: 1000; background-color: rgb(255, 255, 255); border: 1px solid rgb(51, 51, 51); list-style: none; padding: 0px; margin: 4px 0px 0px; min-width: 150px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border-radius: 4px;',
    )
    expect(list.querySelector('li').getAttribute('style')).toBe('margin: 0px; padding: 0px; font-size: 14px;')
    const item = (code: string) => list.querySelector(`.switcher-locale-${code}`)
    expect(item('fr').getAttribute('style')).toBe(
      'display: block; padding: 8px 12px; color: rgb(0, 123, 255); text-decoration: underline; transition: background-color 0.3s ease; cursor: not-allowed; width: 100%; text-align: left; border: medium; background-color: yellow; font-weight: bold; font-size: 12px;',
    )
    expect(item('en').getAttribute('style')).toBe(
      'display: block; padding: 8px 12px; color: rgb(51, 51, 51); text-decoration: none; transition: background-color 0.3s ease; cursor: pointer; width: 100%; text-align: left; border: medium; background-color: transparent; font-size: 12px;',
    )
    // the button reset (no border, transparent background) sits under the caller's styles
    expect([item('fr').style.backgroundColor, item('en').style.backgroundColor]).toEqual(['yellow', 'transparent'])
    expect(item('en').type).toBe('button')

    // clicks inside the open dropdown keep it open; outside clicks close it
    fireEvent.click(list)
    expect(view.container.querySelector('ul')).not.toBeNull()
    fireEvent.click(screen.getByTestId('outside'))
    expect(view.container.querySelector('ul')).toBeNull()
    expect(button.getAttribute('aria-expanded')).toBe('false')

    // the button toggles; a closed dropdown ignores outside clicks
    fireEvent.click(button)
    fireEvent.click(button)
    expect(view.container.querySelector('ul')).toBeNull()
    fireEvent.click(screen.getByTestId('outside'))
    expect(view.container.querySelector('ul')).toBeNull()

    // picking a locale without a router just sets it
    fireEvent.click(button)
    fireEvent.click(view.container.querySelector('.switcher-locale-de'))
    expect([i18n.locale, view.container.querySelector('ul'), button.textContent]).toEqual(['de', null, 'Deutsch▼'])

    // a caller `background` / `border` shorthand replaces the reset longhands instead of mixing with them
    const shorthand = (link: Record<string, string>, active: Record<string, string>) => (
      <I18nProvider i18n={i18n}>
        <I18nSwitcher locales={locales} customLinkStyle={link} customActiveLinkStyle={active} />
      </I18nProvider>
    )
    view.rerender(shorthand({ background: 'pink', borderColor: 'green' }, { background: 'yellow', borderRadius: '2px' }))
    fireEvent.click(view.container.querySelector('.i18n-switcher-button'))
    act(() => {
      i18n.locale = 'en'
    })
    expect(view.container.querySelector('.switcher-locale-de').getAttribute('style')).toBe(
      'display: block; padding: 8px 12px; color: rgb(51, 51, 51); text-decoration: none; transition: background-color 0.3s ease; cursor: pointer; width: 100%; text-align: left; background: pink; border-color: green;',
    )
    // a caller property outside the shorthand (borderRadius) keeps the reset
    fireEvent.click(view.container.querySelector('.i18n-switcher-button'))
    view.rerender(shorthand({ borderRadius: '2px' }, {}))
    fireEvent.click(view.container.querySelector('.i18n-switcher-button'))
    expect(view.container.querySelector('.switcher-locale-de').style.border).toBe('medium')
    expect(view.container.querySelector('.switcher-locale-de').style.backgroundColor).toBe('transparent')
  })
})
