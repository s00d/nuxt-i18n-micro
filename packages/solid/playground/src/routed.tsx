// The router half of the app: kept out of the no-router build by a dynamic import.
import { I18nProvider, type SolidI18n } from '@i18n-micro/solid'
import { createSolidRouterAdapter } from '@i18n-micro/solid/router'
import { Route, Router, useLocation, useNavigate } from '@solidjs/router'
import { createComputed, For, type JSX } from 'solid-js'
import { localeCodes, localeOfPath, routeOfPath } from '../../../../benchmark/integrations/catalogue'
import { Shell } from './App'
import { defaultLocale, localesConfig } from './app-config'
import { Big } from './pages/Big'
import { Cases } from './pages/Cases'
import { Components } from './pages/Components'
import { Dictionaries } from './pages/Dictionaries'
import { NotFound } from './pages/NotFound'
import { Routing } from './pages/Routing'

const pages = [
  ['', Cases],
  ['/components', Components],
  ['/dictionaries', Dictionaries],
  ['/routing', Routing],
  ['/big', Big],
] as const

export function RoutedApp(props: { i18n: SolidI18n; url?: string }) {
  const Root = (rootProps: { children?: JSX.Element }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const strategy = createSolidRouterAdapter(localesConfig, defaultLocale, navigate, location)
    // the locale comes from the URL
    createComputed(() => {
      props.i18n.locale = localeOfPath(location.pathname)
      props.i18n.setRoute(routeOfPath(location.pathname))
    })
    return (
      <I18nProvider i18n={props.i18n} locales={localesConfig} defaultLocale={defaultLocale} routingStrategy={strategy}>
        <Shell routed>{rootProps.children}</Shell>
      </I18nProvider>
    )
  }
  return (
    <Router root={Root} url={props.url}>
      <For each={pages}>{([path, component]) => <Route path={path || '/'} component={component} />}</For>
      <For each={localeCodes}>
        {(code) => <For each={pages}>{([path, component]) => <Route path={`/${code}${path}`} component={component} />}</For>}
      </For>
      <Route path="*" component={NotFound} />
    </Router>
  )
}
