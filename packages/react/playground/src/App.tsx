/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type */
// @ts-nocheck
import type React from 'react'
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useParams, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { createI18n, I18nProvider, useI18n, I18nLink, I18nSwitcher, createReactRouterAdapter } from '@i18n-micro/react'
import type { Locale } from '@i18n-micro/types'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { Components } from './pages/Components'

const localesConfig: Locale[] = [
  { code: 'en', displayName: 'English', iso: 'en-US' },
  { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
  { code: 'de', displayName: 'Deutsch', iso: 'de-DE' },
]

// Async load translations
async function loadTranslations(locale: string) {
  try {
    const messages = await import(`./locales/${locale}.json`)
    return messages.default
  }
  catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error)
    return {}
  }
}

// Create i18n instance
const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {},
  },
})

// Initialize app
async function initApp() {
  // Simple check for initial locale from URL to prioritize loading
  const path = window.location.pathname
  const firstSegment = path.split('/')[1]
  const initialLocale = localesConfig.some(l => l.code === firstSegment) ? firstSegment : 'en'

  // Load initial locale
  const translations = await loadTranslations(initialLocale)
  i18n.addTranslations(initialLocale, translations, false)
  if (initialLocale !== 'en') {
    i18n.locale = initialLocale
  }

  // Preload other locales in background
  const otherLocales = localesConfig.map(l => l.code).filter(c => c !== initialLocale)
  Promise.all(otherLocales.map(code => loadTranslations(code).then(msgs => ({ code, msgs }))))
    .then((results) => {
      results.forEach(({ code, msgs }) => {
        i18n.addTranslations(code, msgs, false)
      })
    })
    .catch(() => {
      // Ignore errors for preloading
    })
}

// Start loading translations
initApp()

// Component to handle locale synchronization from URL
// @ts-expect-error - React.FC type compatibility
const LocaleHandler: React.FC<{}> = () => {
  const { locale } = useParams<{ locale?: string }>()
  const { setLocale, locale: currentLocale } = useI18n({ locales: localesConfig, defaultLocale: 'en' })

  useEffect(() => {
    const targetLocale = locale || 'en'
    if (currentLocale !== targetLocale) {
      setLocale(targetLocale)
    }
  }, [locale, currentLocale, setLocale])

  // @ts-expect-error - React Router type issue
  return <Outlet />
}

// Navigation component
// @ts-expect-error - React.FC type compatibility
const Navigation: React.FC<{}> = () => {
  const { t, getLocales, locale, getLocaleName, switchLocale, localeRoute } = useI18n({ locales: localesConfig, defaultLocale: 'en' })

  return (
    <nav style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
      <I18nLink to="/" localeRoute={localeRoute} activeStyle={{ fontWeight: 'bold', backgroundColor: '#e8f5e9' }}>
        {t('nav.home')}
      </I18nLink>
      <I18nLink to="/about" localeRoute={localeRoute} activeStyle={{ fontWeight: 'bold', backgroundColor: '#e8f5e9' }}>
        {t('nav.about')}
      </I18nLink>
      <I18nLink to="/components" localeRoute={localeRoute} activeStyle={{ fontWeight: 'bold', backgroundColor: '#e8f5e9' }}>
        {t('nav.components')}
      </I18nLink>

      <div style={{ marginLeft: 'auto' }}>
        <I18nSwitcher
          locales={getLocales()}
          currentLocale={locale}
          getLocaleName={() => getLocaleName()}
          switchLocale={switchLocale}
          localeRoute={localeRoute}
        />
      </div>
    </nav>
  )
}

// @ts-expect-error - React.FC type compatibility
const Layout: React.FC<{}> = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* @ts-expect-error - React Router type issue */}
      <Navigation />
      <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        {/* @ts-expect-error - React Router type issue */}
        <Outlet />
      </div>
    </div>
  )
}

// @ts-expect-error - React.FC type compatibility
const AppRoutes: React.FC<{}> = () => {
  return (
    // @ts-expect-error - React Router type issue
    <Routes>
      {/* @ts-expect-error - React Router type issue */}
      <Route element={<Layout />}>
        {/* Default locale routes (en) */}
        {/* @ts-expect-error - React Router type issue */}
        {/* @ts-expect-error - React Router type issue - element prop */}
        <Route element={<LocaleHandler />}>
          {/* @ts-expect-error - React Router type issue */}
          <Route path="/" element={<Home /> as any} />
          {/* @ts-expect-error - React Router type issue */}
          <Route path="/about" element={<About /> as any} />
          {/* @ts-expect-error - React Router type issue */}
          <Route path="/components" element={<Components /> as any} />
        </Route>

        {/* Localized routes */}
        {/* @ts-expect-error - React Router type issue */}
        <Route path="/:locale" element={<LocaleHandler />}>
          {/* @ts-expect-error - React Router type issue */}
          <Route index element={<Home /> as any} />
          {/* @ts-expect-error - React Router type issue */}
          <Route path="about" element={<About /> as any} />
          {/* @ts-expect-error - React Router type issue */}
          <Route path="components" element={<Components /> as any} />
        </Route>
      </Route>
    </Routes>
  )
}

// Router root component with router adapter setup
// @ts-expect-error - React.FC type compatibility
const RouterRoot: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const routingStrategy = createReactRouterAdapter(localesConfig, 'en', location, navigate)

  return (
    <I18nProvider
      i18n={i18n}
      locales={localesConfig}
      defaultLocale="en"
      routingStrategy={routingStrategy}
    >
      {children}
    </I18nProvider>
  )
}

export default function App() {
  return (
    // @ts-expect-error - React Router type issue
    <BrowserRouter>
      {/* @ts-expect-error - React Router type issue */}
      <RouterRoot>
        {/* @ts-expect-error - React Router type issue */}
        <AppRoutes />
      </RouterRoot>
    </BrowserRouter>
  )
}
