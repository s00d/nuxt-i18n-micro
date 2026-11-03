// The router half of the app: kept out of the no-router build by a dynamic import.
import { I18nProvider, type PreactI18n } from '@i18n-micro/preact'
import { createBrowserHistoryAdapter } from '@i18n-micro/preact/router'
import { useLayoutEffect, useMemo } from 'preact/hooks'
import { Route, Router, Switch, useLocation } from 'wouter-preact'
import { localeCodes, localeOfPath, routeOfPath } from '../../../../benchmark/integrations/catalogue'
import { Shell } from '../../../react/playground/src/App'
import { defaultLocale, localesConfig } from '../../../react/playground/src/app-config'
import { Routing } from '../../../react/playground/src/pages/About'
import { Big } from '../../../react/playground/src/pages/Big'
import { Components } from '../../../react/playground/src/pages/Components'
import { Dictionaries } from '../../../react/playground/src/pages/Dictionaries'
import { Cases } from '../../../react/playground/src/pages/Home'
import { NotFound } from '../../../react/playground/src/pages/NotFound'

const pages = [
  ['', Cases],
  ['/components', Components],
  ['/dictionaries', Dictionaries],
  ['/routing', Routing],
  ['/big', Big],
] as const

function Synced({ i18n }: { i18n: PreactI18n }) {
  const [path] = useLocation()
  useLayoutEffect(() => {
    i18n.locale = localeOfPath(path)
    i18n.setRoute(routeOfPath(path))
  }, [i18n, path])
  return (
    <Shell routed>
      <Switch>
        {pages.map(([page, component]) => (
          <Route key={page} path={page || '/'} component={component as never} />
        ))}
        {localeCodes.flatMap((code) =>
          pages.map(([page, component]) => <Route key={`${code}${page}`} path={`/${code}${page}`} component={component as never} />),
        )}
        <Route component={NotFound as never} />
      </Switch>
    </Shell>
  )
}

export function RoutedApp({ i18n, ssrPath }: { i18n: PreactI18n; ssrPath?: string }) {
  const strategy = useMemo(() => createBrowserHistoryAdapter(localesConfig, defaultLocale, ssrPath), [ssrPath])
  return (
    <Router ssrPath={ssrPath}>
      <I18nProvider i18n={i18n} locales={localesConfig} defaultLocale={defaultLocale} routingStrategy={strategy}>
        <Synced i18n={i18n} />
      </I18nProvider>
    </Router>
  )
}
