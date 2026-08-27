import { createI18n, I18nLink, I18nProvider, I18nSwitcher, useI18n } from '@i18n-micro/preact'
import type { Locale } from '@i18n-micro/types'
import { Fragment, h, type ComponentChildren } from 'preact'
import { useEffect } from 'preact/hooks'
import { Route, Router, Switch, useLocation, useRoute } from 'wouter-preact'
import { About } from './pages/About'
import { Components } from './pages/Components'
import { Home } from './pages/Home'
import { createWouterAdapter } from './router-adapter'

const localesConfig: Locale[] = [
  { code: 'en', displayName: 'English', iso: 'en-US' },
  { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
  { code: 'de', displayName: 'Deutsch', iso: 'de-DE' },
]

async function loadTranslations(locale: string) {
  try {
    const messages = await import(`./locales/${locale}.json`)
    return messages.default
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error)
    return {}
  }
}

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {},
  },
})

async function initApp() {
  const path = window.location.pathname
  const firstSegment = path.split('/')[1]
  const initialLocale = localesConfig.some((l) => l.code === firstSegment) ? firstSegment : 'en'

  const translations = await loadTranslations(initialLocale)
  i18n.addTranslations(initialLocale, translations, false)
  if (initialLocale !== 'en') {
    i18n.locale = initialLocale
  }

  const otherLocales = localesConfig.map((l) => l.code).filter((c) => c !== initialLocale)
  Promise.all(otherLocales.map((code) => loadTranslations(code).then((msgs) => ({ code, msgs }))))
    .then((results) => {
      results.forEach(({ code, msgs }) => {
        i18n.addTranslations(code, msgs, false)
      })
    })
    .catch(() => {})
}

initApp()

interface ChildrenProps {
  children?: ComponentChildren
}

const LocaleHandler = ({ children }: ChildrenProps) => {
  const [_match, params] = useRoute('/:locale')
  const { setLocale, locale: currentLocale } = useI18n({ locales: localesConfig, defaultLocale: 'en' })
  const localeParam = params?.locale

  useEffect(() => {
    const targetLocale = localeParam && localesConfig.some((l) => l.code === localeParam) ? localeParam : 'en'
    if (currentLocale !== targetLocale) {
      setLocale(targetLocale)
    }
  }, [localeParam, currentLocale, setLocale])

  return h(Fragment, null, children)
}

const Navigation = () => {
  const { t, getLocales, locale, getLocaleName, switchLocale, localeRoute } = useI18n({ locales: localesConfig, defaultLocale: 'en' })

  return h(
    'nav',
    { style: { marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' } },
    h(I18nLink, { to: '/', localeRoute, activeStyle: { fontWeight: 'bold', backgroundColor: '#e8f5e9' } }, String(t('nav.home'))),
    h(I18nLink, { to: '/about', localeRoute, activeStyle: { fontWeight: 'bold', backgroundColor: '#e8f5e9' } }, String(t('nav.about'))),
    h(I18nLink, { to: '/components', localeRoute, activeStyle: { fontWeight: 'bold', backgroundColor: '#e8f5e9' } }, String(t('nav.components'))),
    h(
      'div',
      { style: { marginLeft: 'auto' } },
      h(I18nSwitcher, {
        locales: getLocales(),
        currentLocale: locale,
        getLocaleName: () => getLocaleName(),
        switchLocale,
        localeRoute,
      }),
    ),
  )
}

const Layout = ({ children }: ChildrenProps) => {
  return h(
    'div',
    { style: { padding: '20px', fontFamily: 'Arial, sans-serif' } },
    h(Navigation, null),
    h('div', { style: { padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' } }, children),
  )
}

const RouterRoot = ({ children }: ChildrenProps) => {
  const [location, navigate] = useLocation()
  const routingStrategy = createWouterAdapter(localesConfig, 'en', location, navigate)

  return h(
    I18nProvider,
    {
      i18n,
      locales: localesConfig,
      defaultLocale: 'en',
      routingStrategy,
    },
    children,
  )
}

export default function App() {
  return h(
    Router,
    null,
    h(
      RouterRoot,
      null,
      h(
        Layout,
        null,
        h(
          Switch,
          null,
          h(Route, { path: '/', component: Home }),
          h(Route, { path: '/about', component: About }),
          h(Route, { path: '/components', component: Components }),
          h(Route, {
            path: '/:locale',
            component: () => h(LocaleHandler, null, h(Home, null)),
          }),
          h(Route, {
            path: '/:locale/about',
            component: () => h(LocaleHandler, null, h(About, null)),
          }),
          h(Route, {
            path: '/:locale/components',
            component: () => h(LocaleHandler, null, h(Components, null)),
          }),
        ),
      ),
    ),
  )
}
