import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { dirOf, localeOfPath, routeOfPath } from '../../../../benchmark/integrations/catalogue'
import { createBenchI18n } from './app-config'
import { RoutedApp } from './routed'

export function render(url: string) {
  const locale = localeOfPath(url)
  const i18n = createBenchI18n(locale, routeOfPath(url))
  const html = renderToString(
    <StaticRouter location={url}>
      <RoutedApp i18n={i18n} />
    </StaticRouter>,
  )
  return { html, state: { locale, dir: dirOf(locale), route: url } }
}
