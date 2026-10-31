import { generateHydrationScript, renderToString } from 'solid-js/web'
import { dirOf, localeOfPath, routeOfPath } from '../../../../benchmark/integrations/catalogue'
import { createBenchI18n } from './app-config'
import { RoutedApp } from './routed'

export function render(url: string) {
  const locale = localeOfPath(url)
  const i18n = createBenchI18n(locale, routeOfPath(url))
  const html = renderToString(() => <RoutedApp i18n={i18n} url={url} />)
  return { html: `${generateHydrationScript()}${html}`, state: { locale, dir: dirOf(locale), route: url } }
}
