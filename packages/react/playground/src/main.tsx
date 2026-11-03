import { I18nProvider } from '@i18n-micro/react'
import type { ReactNode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { localeOfPath, persisted, routeOfPath } from '../../../../benchmark/integrations/catalogue'
import { AllPages, Shell } from './App'
import { createBenchI18n, defaultLocale, localesConfig } from './app-config'

const container = document.getElementById('app')!
const ssr = (window as { __INITIAL_STATE__?: unknown }).__INITIAL_STATE__ !== undefined
const mount = (app: ReactNode) => (ssr ? hydrateRoot(container, app) : createRoot(container).render(app))

if (import.meta.env.VITE_ROUTER === '0') {
  const i18n = createBenchI18n(persisted.read() ?? defaultLocale)
  mount(
    <I18nProvider i18n={i18n} locales={localesConfig} defaultLocale={defaultLocale}>
      <Shell routed={false}>
        <AllPages />
      </Shell>
    </I18nProvider>,
  )
} else {
  const { BrowserRouter } = await import('react-router-dom')
  const { RoutedApp } = await import('./routed')
  const { pathname } = window.location
  const i18n = createBenchI18n(localeOfPath(pathname), routeOfPath(pathname))
  mount(
    <BrowserRouter>
      <RoutedApp i18n={i18n} />
    </BrowserRouter>,
  )
}
