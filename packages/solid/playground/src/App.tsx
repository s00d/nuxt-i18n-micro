import { I18nLink, I18nSwitcher, useI18n } from '@i18n-micro/solid'
import { createEffect, For, type JSX, Show } from 'solid-js'
import { dirOf, pagePaths, persisted } from '../../../../benchmark/integrations/catalogue'
import { Big } from './pages/Big'
import { Cases } from './pages/Cases'
import { Components } from './pages/Components'
import { Dictionaries } from './pages/Dictionaries'
import { Routing } from './pages/Routing'

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
export function Shell(props: { routed: boolean; children: JSX.Element }) {
  const { locale, getLocaleName, getLocales, getRoute, switchLocale, instance } = useI18n()

  createEffect(() => {
    document.documentElement.lang = locale()
    document.documentElement.dir = dirOf(locale())
  })

  const change = (code: string) => {
    persisted.write(code)
    switchLocale(code)
  }

  return (
    <>
      <header data-testid="locale-state">
        <span data-testid="current-locale">{locale()}</span>
        <span data-testid="locale-name">{(locale(), getLocaleName())}</span>
        <span data-testid="current-route">{(instance.routeAccessor?.(), getRoute())}</span>
      </header>
      <nav>
        <For each={getLocales()}>
          {({ code }) => (
            <button type="button" data-testid={`switch-${code}`} onClick={() => change(code)}>
              {code}
            </button>
          )}
        </For>
        <Show when={props.routed}>
          <For each={pagePaths}>
            {(path) => (
              <I18nLink to={path} data-testid={`link-${path}`}>
                {path}
              </I18nLink>
            )}
          </For>
          <I18nLink to="/nothing/here" data-testid="link-404">
            404
          </I18nLink>
        </Show>
        <I18nSwitcher />
      </nav>
      <main>{props.children}</main>
    </>
  )
}
