// The router half of the app: kept out of the no-router build by a dynamic import.
import { I18nProvider } from '@i18n-micro/react'
import { createReactRouterAdapter } from '@i18n-micro/react/router'
import type { ReactI18n } from '@i18n-micro/react'
import { useLayoutEffect, useMemo } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { localeCodes, localeOfPath, routeOfPath } from '../../../../benchmark/integrations/catalogue'
import { defaultLocale, localesConfig } from './app-config'
import { Shell } from './App'
import { Routing } from './pages/About'
import { Big } from './pages/Big'
import { Components } from './pages/Components'
import { Dictionaries } from './pages/Dictionaries'
import { Cases } from './pages/Home'
import { NotFound } from './pages/NotFound'

const pages = [
  ['', <Cases key="home" />],
  ['components', <Components key="components" />],
  ['dictionaries', <Dictionaries key="dictionaries" />],
  ['routing', <Routing key="routing" />],
  ['big', <Big key="big" />],
] as const

export function RoutedApp({ i18n }: { i18n: ReactI18n }) {
  const location = useLocation()
  const navigate = useNavigate()
  const strategy = useMemo(() => createReactRouterAdapter(localesConfig, defaultLocale, location, navigate), [location, navigate])

  // the locale comes from the URL; the first render was built with both, so hydration agrees
  useLayoutEffect(() => {
    i18n.locale = localeOfPath(location.pathname)
    i18n.setRoute(routeOfPath(location.pathname))
  }, [i18n, location.pathname])

  return (
    <I18nProvider i18n={i18n} locales={localesConfig} defaultLocale={defaultLocale} routingStrategy={strategy}>
      <Shell routed>
        <Routes>
          {pages.map(([path, element]) => (
            <Route key={path} path={`/${path}`} element={element} />
          ))}
          {localeCodes.flatMap((code) =>
            pages.map(([path, element]) => <Route key={`${code}/${path}`} path={`/${code}/${path}`} element={element} />),
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Shell>
    </I18nProvider>
  )
}
