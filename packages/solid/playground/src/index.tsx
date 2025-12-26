/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* @refresh reload */
import { render } from 'solid-js/web'
import type { Component, JSX } from 'solid-js'
import { Router, Route, useNavigate, useLocation } from '@solidjs/router'
import { createI18n, I18nProvider } from '@i18n-micro/solid'
import { createSolidRouterAdapter } from './router-adapter'
import App from './App'
import './index.css'

import en from './locales/en.json'
import Home from './pages/Home'
import About from './pages/About'
import Components from './pages/Components'
import type { Locale } from '@i18n-micro/types'

const locales: Locale[] = [
  { code: 'en', displayName: 'English' },
  { code: 'fr', displayName: 'Français' },
]
const defaultLocale = 'en'

const i18n = createI18n({
  locale: defaultLocale,
  fallbackLocale: defaultLocale,
  messages: { en },
})

// Async load translations
async function loadTranslations(locale: string) {
  try {
    const messages = await import(`./locales/${locale}.json`)
    i18n.addTranslations(locale, messages.default, false)
  }
  catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error)
  }
}

// Router root component with router adapter setup
const RouterRoot: Component<{ children?: JSX.Element }> = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const routingStrategy = createSolidRouterAdapter(
    locales,
    defaultLocale,
    navigate,
    location,
  )

  return (
    <I18nProvider
      i18n={i18n}
      locales={locales}
      defaultLocale={defaultLocale}
      routingStrategy={routingStrategy}
    >
      <App>
        {props.children}
      </App>
    </I18nProvider>
  )
}

// Locale handler component
const LocaleHandler: Component<{ params: { locale?: string }, children?: JSX.Element }> = (props) => {
  const localeCodes = locales.map(l => l.code)
  const currentLocale = props.params.locale && localeCodes.includes(props.params.locale) ? props.params.locale : defaultLocale

  // Sync locale with i18n instance
  if (currentLocale !== i18n.getLocale()) {
    i18n.locale = currentLocale
  }

  return props.children
}

// Initialize app
async function initApp() {
  // Determine initial locale from URL
  const pathname = window.location.pathname
  const pathParts = pathname.split('/').filter(Boolean)
  const localeParam = pathParts[0]
  const localeCodes = locales.map(l => l.code)
  const initialLocale = localeParam && localeCodes.includes(localeParam) ? localeParam : defaultLocale

  // Load initial locale translations
  await loadTranslations(initialLocale)

  // Preload other locales in background
  Promise.all(
    localeCodes.filter(code => code !== initialLocale).map(locale => loadTranslations(locale)),
  ).catch(() => {
    // Ignore errors for preloading
  })

  // Set initial locale
  if (initialLocale !== i18n.getLocale()) {
    i18n.locale = initialLocale
  }

  const root = document.getElementById('root')

  if (root) {
    render(() => (
      <Router root={RouterRoot}>
        {/* Default locale routes */}
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/components" component={Components} />

        {/* Localized routes */}
        <Route path="/:locale" component={(props: { params: { locale?: string }, children?: JSX.Element }) => <LocaleHandler params={props.params}>{props.children}</LocaleHandler>}>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/components" component={Components} />
        </Route>
      </Router>
    ), root)
  }
}

// Start the app
initApp()
