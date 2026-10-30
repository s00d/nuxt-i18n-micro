// A shop app the way the playground wires it: @solidjs/router, createSolidRouterAdapter inside the
// router root, I18nProvider around the app, I18nLink + I18nSwitcher in the nav.
import type { Locale } from '@i18n-micro/types'
import { createMemoryHistory, MemoryRouter, Route, useLocation, useNavigate } from '@solidjs/router'
import type { JSX } from 'solid-js'
import { render } from 'solid-js/web'
import { afterEach, expect, test } from 'vitest'
import { createI18n, I18nLink, I18nProvider, I18nSwitcher, I18nT, useI18n } from '../src'
import { createSolidRouterAdapter } from '../src/router'
import { I18nContext, I18nDefaultLocaleContext, I18nLocalesContext, I18nRouterContext } from '../src/injection'
import type { I18nRoutingStrategy } from '../src/router/types'

const locales: Locale[] = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
  { code: 'ar', iso: 'ar-EG', displayName: 'العربية' },
  { code: 'fr', iso: 'fr-FR', displayName: 'Français', disabled: true },
]

const messages = {
  en: { nav: { products: 'Products' }, home: { title: 'Welcome' }, products: { title: 'All products' } },
  de: { nav: { products: 'Produkte' }, home: { title: 'Willkommen' }, products: { title: 'Alle Produkte' } },
  ar: { nav: { products: 'منتجات' }, home: { title: 'أهلا' }, products: { title: 'كل المنتجات' } },
}

// router navigation settles in a transition
const settle = () => new Promise((resolve) => setTimeout(resolve))

let dispose: (() => void) | undefined
afterEach(() => {
  dispose?.()
  document.body.innerHTML = ''
})

test('a visitor browses, switches language from code and from the switcher, and the URL follows', async () => {
  const i18n = createI18n({ locale: 'en', fallbackLocale: 'en', messages })
  const history = createMemoryHistory()
  let api!: ReturnType<typeof useI18n>
  let adapter!: ReturnType<typeof createSolidRouterAdapter>

  const Home = () => <h1>{useI18n().t('home.title') as string}</h1>
  const Products = () => {
    const { t } = useI18n()
    return <h1>{t('products.title') as string}</h1>
  }
  const Nav = () => {
    api = useI18n()
    return (
      <nav>
        <I18nLink to="/products" class="nav" style={{ color: 'green' }} activeStyle={{ 'font-weight': 'bold' }}>
          <I18nT keypath="nav.products" html />
        </I18nLink>
        <I18nSwitcher customLabels={{ de: 'DE' }} />
      </nav>
    )
  }
  const Root = (props: { children?: JSX.Element }) => {
    adapter = createSolidRouterAdapter(locales, 'en', useNavigate(), useLocation())
    return (
      <I18nProvider i18n={i18n} locales={locales} defaultLocale="en" routingStrategy={adapter}>
        <Nav />
        {props.children}
      </I18nProvider>
    )
  }
  const container = document.body.appendChild(document.createElement('div'))
  dispose = render(
    () => (
      <MemoryRouter history={history} root={Root}>
        <Route path="/:locale?" component={Home} />
        <Route path="/:locale?/products" component={Products} />
      </MemoryRouter>
    ),
    container,
  )
  await settle()
  const h1 = () => container.querySelector('h1')!.textContent
  const link = () => container.querySelector('a.nav') as HTMLAnchorElement

  expect(h1()).toBe('Welcome')
  expect(link().getAttribute('href')).toBe('/products')
  expect(link().textContent).toBe('Products')
  expect(link().getAttribute('style')).toBe('color: green;')

  link().click()
  await settle()
  expect(history.get()).toBe('/products')
  expect(h1()).toBe('All products')
  // the router's <A> marks it active and the activeStyle is merged in
  expect(link().getAttribute('aria-current')).toBe('page')
  expect(link().getAttribute('style')).toBe('color: green; font-weight: bold;')

  // switchLocale moves the URL into the locale prefix and re-renders every translation
  api.switchLocale('de')
  await settle()
  expect(history.get()).toBe('/de/products')
  expect(adapter.getCurrentPath()).toBe('/de/products')
  expect(adapter.getRoute()).toEqual({ fullPath: '/de/products', query: {} })
  expect(api.locale()).toBe('de')
  expect(api.getLocaleName()).toBe('Deutsch')
  expect(api.localePath('/about')).toBe('/de/about')
  expect(api.localePath('/de/about', 'en')).toBe('/about')
  expect(h1()).toBe('Alle Produkte')
  expect(link().textContent).toBe('Produkte')
  // href and style follow the locale through the router's link component
  expect(link().getAttribute('href')).toBe('/de/products')
  expect(link().getAttribute('style')).toBe('color: green; font-weight: bold;')

  // the switcher: closed by default, label from customLabels, opens on click
  const button = container.querySelector('button.i18n-switcher-button') as HTMLButtonElement
  expect(button.textContent).toBe('DE▼')
  expect(button.getAttribute('aria-haspopup')).toBe('true')
  expect(button.getAttribute('aria-expanded')).toBe('false')
  expect(container.querySelector('.i18n-switcher-dropdown')).toBeNull()
  button.click()
  expect(button.getAttribute('aria-expanded')).toBe('true')
  // the disabled locale (fr) is not offered; hrefs point at the same page in each locale
  // default styles: the active locale bold and blue, the others plain
  expect(container.querySelector('.i18n-switcher-dropdown')!.getAttribute('style')).toBe(
    'position: absolute; top: 100%; left: 0px; z-index: 1000; background-color: rgb(255, 255, 255); border: 1px solid rgb(51, 51, 51); list-style: none; padding: 0px; margin: 4px 0px 0px; min-width: 150px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);',
  )
  expect(container.querySelector('.i18n-switcher-dropdown li')!.getAttribute('style')).toBe('margin: 0px; padding: 0px;')
  expect(container.querySelector('.switcher-locale-de')!.getAttribute('style')).toBe(
    'display: block; padding: 8px 12px; color: rgb(0, 123, 255); text-decoration: none; transition: background-color 0.3s ease; cursor: not-allowed; font-weight: bold;',
  )
  expect(container.querySelector('.switcher-locale-en')!.getAttribute('style')).toBe(
    'display: block; padding: 8px 12px; color: rgb(51, 51, 51); text-decoration: none; transition: background-color 0.3s ease; cursor: pointer;',
  )
  const items = [...container.querySelectorAll('.i18n-switcher-dropdown a')]
  expect(items.map((a) => [a.className, a.textContent, a.getAttribute('href')])).toEqual([
    ['switcher-locale-en', 'English', '/products'],
    ['switcher-locale-de', 'DE', '/de/products'],
    ['switcher-locale-ar', 'العربية', '/ar/products'],
  ])

  // clicking inside keeps it open, clicking outside closes it
  ;(container.querySelector('.i18n-switcher-dropdown') as HTMLElement).click()
  expect(container.querySelector('.i18n-switcher-dropdown')).not.toBeNull()
  document.body.click()
  expect(container.querySelector('.i18n-switcher-dropdown')).toBeNull()

  // pick Arabic from the switcher: dropdown closes, locale and URL change
  button.click()
  ;(container.querySelector('.switcher-locale-ar') as HTMLElement).click()
  await settle()
  expect(container.querySelector('.i18n-switcher-dropdown')).toBeNull()
  expect(history.get()).toBe('/ar/products')
  expect(h1()).toBe('كل المنتجات')
  expect(button.textContent).toBe('العربية▼')

  // back to the default locale: the prefix is dropped
  button.click()
  ;(container.querySelector('.switcher-locale-en') as HTMLElement).click()
  await settle()
  expect(history.get()).toBe('/products')
  expect(h1()).toBe('All products')

  // the adapter's own helpers
  expect(adapter.resolvePath('/de/products', 'en')).toBe('/products')
  expect(adapter.resolvePath({ path: '/products' }, 'ar')).toBe('/ar/products')
  expect(adapter.resolvePath({}, 'de')).toBe('/de')
  expect(adapter.resolvePath('/', 'ar')).toBe('/ar')
  expect(adapter.resolvePath('/shop/de', 'en')).toBe('/shop/de')
  adapter.replace({ path: '/de' })
  await settle()
  expect(history.get()).toBe('/de')
  expect(h1()).toBe('Welcome')
  adapter.push({ path: '/products' })
  await settle()
  expect(history.get()).toBe('/products')
  // replace swapped the entry in place, so back lands on /de
  history.back()
  await settle()
  expect(history.get()).toBe('/de')
  history.back()
  await settle()
  expect(history.get()).toBe('/ar/products')
})

test('the switcher and links with a hand-written strategy that has no router link component', async () => {
  const i18n = createI18n({ locale: 'de', fallbackLocale: 'en', messages })
  let path = '/de/about/'
  const pushed: string[] = []
  const strategy: I18nRoutingStrategy = {
    getCurrentPath: () => path,
    push: (to) => {
      pushed.push(to.path)
      path = to.path
    },
    replace: () => {},
    resolvePath: (to, locale) => ({ path: `/${locale}${(typeof to === 'string' ? to : to.path)!.replace(/^\/(en|de|ar)/, '')}` }),
  }
  let api!: ReturnType<typeof useI18n>
  const App = () => {
    api = useI18n()
    return (
      <nav>
        <I18nLink id="about" to="/about/" activeStyle={{ color: 'red' }}>
          About
        </I18nLink>
        <I18nLink id="home" to={{ path: '/' }}>
          Home
        </I18nLink>
        <I18nLink id="ext" to="https://example.com/a" target="_self" activeStyle={{ color: 'red' }}>
          Ext
        </I18nLink>
        <I18nLink id="own" to="/x" localeRoute={() => ({})}>
          Own
        </I18nLink>
        <I18nLink id="own-path" to="/x" localeRoute={(to, locale) => ({ path: `/${locale}${to as string}` })}>
          Own path
        </I18nLink>
        <I18nLink id="cdn" to="cdn.example.com/a.js">
          CDN
        </I18nLink>
        <I18nLink id="proto" to="//cdn.example.com/a.js">
          Proto
        </I18nLink>
        <I18nLink id="http" to="http://example.com">
          Http
        </I18nLink>
        <I18nLink id="tel" to="tel:+100">
          Tel
        </I18nLink>
        <I18nLink id="file" to="/guide.html">
          File
        </I18nLink>
        <I18nSwitcher id="sw2" localeRoute={(to, locale) => (locale === 'ar' ? `/ar-only${to as string}` : {})} />
        <I18nSwitcher
          id="sw"
          customWrapperStyle={{ margin: '1px' }}
          customButtonStyle={{ color: 'green' }}
          customDropdownStyle={{ top: '0px' }}
          customItemStyle={{ padding: '2px' }}
          customLinkStyle={{ color: 'gray' }}
          customActiveLinkStyle={{ color: 'navy' }}
          customIconStyle={{ opacity: '0.5' }}
        />
      </nav>
    )
  }
  const container = document.body.appendChild(document.createElement('div'))
  dispose = render(
    () => (
      <I18nContext.Provider value={i18n}>
        <I18nLocalesContext.Provider value={locales}>
          <I18nDefaultLocaleContext.Provider value="en">
            <I18nRouterContext.Provider value={strategy}>
              <App />
            </I18nRouterContext.Provider>
          </I18nDefaultLocaleContext.Provider>
        </I18nLocalesContext.Provider>
      </I18nContext.Provider>
    ),
    container,
  )
  const el = (id: string) => container.querySelector(`#${id}`) as HTMLElement

  // the active check ignores a trailing slash
  expect(el('about').getAttribute('href')).toBe('/de/about/')
  expect(el('about').getAttribute('style')).toBe('color: red;')
  expect(el('home').getAttribute('href')).toBe('/de/')
  expect(el('home').getAttribute('style')).toBeNull()
  expect(el('own').getAttribute('href')).toBe('/')
  expect(el('own-path').getAttribute('href')).toBe('/de/x')
  expect(['cdn', 'proto', 'http', 'tel', 'file'].map((id) => el(id).getAttribute('target'))).toEqual(['_blank', '_blank', '_blank', '_blank', null])
  expect(['cdn', 'proto', 'http', 'tel', 'file'].map((id) => el(id).getAttribute('href'))).toEqual([
    'https://cdn.example.com/a.js',
    '//cdn.example.com/a.js',
    'http://example.com',
    'tel:+100',
    '/de/guide.html',
  ])
  expect(['href', 'target', 'rel', 'style'].map((a) => el('ext').getAttribute(a))).toEqual([
    'https://example.com/a',
    '_self',
    'noopener noreferrer',
    null,
  ])

  el('home').click()
  expect(pushed).toEqual(['/de/'])

  // localePath / localeRoute go through the strategy with the current locale by default
  expect(api.localePath('/about')).toBe('/de/about')
  expect(api.localePath('/about', 'en')).toBe('/en/about')
  expect(api.localeRoute('/de/x', 'ar')).toEqual({ path: '/ar/x' })
  // switchLocale pushes the object path the strategy resolves
  api.switchLocale('ar')
  expect(pushed).toEqual(['/de/', '/ar/'])
  api.switchLocale('de')
  pushed.length = 0
  pushed.push('/de/')

  const button = el('sw').querySelector('button')!
  expect(el('sw').getAttribute('style')).toBe('position: relative; display: inline-block; vertical-align: middle; margin: 1px;')
  expect(button.getAttribute('style')).toBe(
    'padding: 4px 12px; font-size: 16px; cursor: pointer; background-color: rgb(255, 255, 255); border: 1px solid rgb(51, 51, 51); transition: background-color 0.3s ease; display: flex; align-items: center; justify-content: space-between; color: green;',
  )
  const icon = () => button.querySelectorAll('span')[1]!.getAttribute('style')
  expect(icon()).toBe('margin-left: 8px; display: inline-block; transition: transform 0.3s ease; opacity: 0.5;')
  button.click()
  expect(icon()).toContain('transform: rotate(180deg);')
  const dropdown = el('sw').querySelector('ul')!
  expect(dropdown.getAttribute('style')).toBe(
    'position: absolute; top: 0px; left: 0px; z-index: 1000; background-color: rgb(255, 255, 255); border: 1px solid rgb(51, 51, 51); list-style: none; padding: 0px; margin: 4px 0px 0px; min-width: 150px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);',
  )
  expect(dropdown.querySelector('li')!.getAttribute('style')).toBe('margin: 0px; padding: 2px;')
  expect(el('sw').querySelector('.switcher-locale-en')!.getAttribute('style')).toBe(
    'display: block; padding: 8px 12px; color: gray; text-decoration: none; transition: background-color 0.3s ease; cursor: pointer;',
  )
  // customActiveLinkStyle wins over customLinkStyle
  expect(el('sw').querySelector('.switcher-locale-de')!.getAttribute('style')).toBe(
    'display: block; padding: 8px 12px; color: navy; text-decoration: none; transition: background-color 0.3s ease; cursor: not-allowed; font-weight: bold;',
  )
  expect(el('sw').querySelector('.switcher-locale-ar')!.getAttribute('href')).toBe('/ar/')

  // a second click on the button closes it; picking a locale pushes the resolved path
  button.click()
  expect(el('sw').querySelector('ul')).toBeNull()
  button.click()
  ;(el('sw').querySelector('.switcher-locale-en') as HTMLElement).click()
  expect(i18n.getLocale()).toBe('en')
  expect(pushed).toEqual(['/de/', '/en/'])
  expect(el('about').getAttribute('href')).toBe('/en/about/')
  expect(button.textContent).toBe('English▼')

  // the switcher's own localeRoute wins over the strategy, '/' when it gives no path
  const sw2 = el('sw2').querySelector('button')!
  sw2.click()
  ;(el('sw2').querySelector('.switcher-locale-ar') as HTMLElement).click()
  expect(pushed).toEqual(['/de/', '/en/', '/ar-only/en/'])
  sw2.click()
  ;(el('sw2').querySelector('.switcher-locale-en') as HTMLElement).click()
  expect(pushed).toEqual(['/de/', '/en/', '/ar-only/en/', '/'])
  pushed.splice(2)
  path = '/en/'

  // a strategy without resolvePath keeps the current path, for the switcher and for switchLocale
  delete strategy.resolvePath
  button.click()
  ;(el('sw').querySelector('.switcher-locale-ar') as HTMLElement).click()
  expect(pushed).toEqual(['/de/', '/en/', '/en/'])
  expect(i18n.getLocale()).toBe('ar')
  api.switchLocale('de')
  expect(pushed).toEqual(['/de/', '/en/', '/en/', '/en/'])
  expect(api.localePath({ path: '/p' })).toBe('/p')
  expect(api.localePath({})).toBe('/')
})
