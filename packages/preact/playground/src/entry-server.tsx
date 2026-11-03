import { renderToString } from 'preact-render-to-string'
import { dirOf, localeOfPath, routeOfPath } from '../../../../benchmark/integrations/catalogue'
import { createBenchI18n } from '../../../react/playground/src/app-config'
import { RoutedApp } from './routed'

export function render(url: string) {
  const locale = localeOfPath(url)
  const html = renderToString(<RoutedApp i18n={createBenchI18n(locale, routeOfPath(url)) as never} ssrPath={url} />)
  return { html, state: { locale, dir: dirOf(locale), route: url } }
}
