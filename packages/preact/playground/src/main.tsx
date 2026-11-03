// The pages are React's, built with `preact/compat`: `@i18n-micro/preact` has the same API and the same source.
import { I18nProvider } from '@i18n-micro/preact'
import { type ComponentChildren, hydrate, render } from 'preact'
import { localeOfPath, persisted, routeOfPath } from '../../../../benchmark/integrations/catalogue'
import { AllPages, Shell } from '../../../react/playground/src/App'
import { createBenchI18n, defaultLocale, localesConfig } from '../../../react/playground/src/app-config'

const container = document.getElementById('app')!
const ssr = (window as { __INITIAL_STATE__?: unknown }).__INITIAL_STATE__ !== undefined
const mount = (app: ComponentChildren) => (ssr ? hydrate(app, container) : render(app, container))

if (import.meta.env.VITE_ROUTER === '0') {
  mount(
    <I18nProvider i18n={createBenchI18n(persisted.read() ?? defaultLocale) as never} locales={localesConfig} defaultLocale={defaultLocale}>
      <Shell routed={false}>
        <AllPages />
      </Shell>
    </I18nProvider>,
  )
} else {
  const { RoutedApp } = await import('./routed')
  const { pathname } = window.location
  mount(<RoutedApp i18n={createBenchI18n(localeOfPath(pathname), routeOfPath(pathname)) as never} />)
}
