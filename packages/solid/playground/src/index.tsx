/* @refresh reload */

import { I18nProvider } from '@i18n-micro/solid'
import { hydrate, render } from 'solid-js/web'
import { localeOfPath, persisted, routeOfPath } from '../../../../benchmark/integrations/catalogue'
import { AllPages, Shell } from './App'
import { createBenchI18n, defaultLocale, localesConfig } from './app-config'

const root = document.getElementById('root')!
const ssr = (window as { __INITIAL_STATE__?: unknown }).__INITIAL_STATE__ !== undefined
const mount = (app: () => import('solid-js').JSX.Element) => (ssr ? hydrate(app, root) : render(app, root))

if (import.meta.env.VITE_ROUTER === '0') {
  const i18n = createBenchI18n(persisted.read() ?? defaultLocale)
  mount(() => (
    <I18nProvider i18n={i18n} locales={localesConfig} defaultLocale={defaultLocale}>
      <Shell routed={false}>
        <AllPages />
      </Shell>
    </I18nProvider>
  ))
} else {
  const { RoutedApp } = await import('./routed')
  const { pathname } = window.location
  const i18n = createBenchI18n(localeOfPath(pathname), routeOfPath(pathname))
  mount(() => <RoutedApp i18n={i18n} />)
}
