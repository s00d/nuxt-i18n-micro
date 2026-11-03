import { I18nLink, I18nSwitcher, useI18n } from '@i18n-micro/react'
import { type ReactNode, useEffect } from 'react'
import { dirOf, pagePaths, persisted } from '../../../../benchmark/integrations/catalogue'
import { Routing } from './pages/About'
import { Big } from './pages/Big'
import { Components } from './pages/Components'
import { Dictionaries } from './pages/Dictionaries'
import { Cases } from './pages/Home'

export const AllPages = () => (
  <>
    <Cases />
    <Components />
    <Dictionaries />
    <Routing />
    <Big />
  </>
)

/** The shell of every page: state, locale buttons, links, switcher. `document` follows the locale. */
export function Shell({ routed, children }: { routed: boolean; children: ReactNode }) {
  const { locale, getLocaleName, getLocales, getRoute, switchLocale } = useI18n()

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = dirOf(locale)
  }, [locale])

  const change = (code: string) => {
    persisted.write(code)
    switchLocale(code)
  }

  return (
    <>
      <header data-testid="locale-state">
        <span data-testid="current-locale">{locale}</span>
        <span data-testid="locale-name">{getLocaleName()}</span>
        <span data-testid="current-route">{getRoute()}</span>
      </header>
      <nav>
        {getLocales().map(({ code }) => (
          <button key={code} type="button" data-testid={`switch-${code}`} onClick={() => change(code)}>
            {code}
          </button>
        ))}
        {routed &&
          pagePaths.map((path) => (
            <I18nLink key={path} to={path} data-testid={`link-${path}`}>
              {path}
            </I18nLink>
          ))}
        {routed && (
          <I18nLink to="/nothing/here" data-testid="link-404">
            404
          </I18nLink>
        )}
        <I18nSwitcher />
      </nav>
      <main>{children}</main>
    </>
  )
}
