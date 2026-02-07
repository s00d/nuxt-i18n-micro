// @ts-nocheck

import { I18nLink, I18nSwitcher, I18nT, useI18n } from '@i18n-micro/solid'
import type { Component, JSX } from 'solid-js'

interface AppProps {
  children?: JSX.Element
}

const App: Component<AppProps> = (props) => {
  const { locale, localeRoute, switchLocale, getLocaleName, getLocales } = useI18n()
  const locales = getLocales()

  return (
    <div
      id="app"
      style={{
        'font-family': 'Avenir, Helvetica, Arial, sans-serif',
        '-webkit-font-smoothing': 'antialiased',
        '-moz-osx-font-smoothing': 'grayscale',
        color: '#2c3e50',
        margin: '20px',
      }}
    >
      <nav style={{ 'margin-bottom': '20px', display: 'flex', gap: '15px', 'align-items': 'center' }}>
        <I18nLink
          to="/"
          localeRoute={localeRoute}
          activeStyle={{
            'font-weight': 'bold',
            'background-color': '#e8f5e9',
          }}
          style={{
            'text-decoration': 'none',
            color: '#42b983',
            'font-weight': 500,
            padding: '5px 10px',
            'border-radius': '4px',
            transition: 'background-color 0.3s',
          }}
        >
          <I18nT keypath="nav.home" />
        </I18nLink>
        <I18nLink
          to="/about"
          localeRoute={localeRoute}
          activeStyle={{
            'font-weight': 'bold',
            'background-color': '#e8f5e9',
          }}
          style={{
            'text-decoration': 'none',
            color: '#42b983',
            'font-weight': 500,
            padding: '5px 10px',
            'border-radius': '4px',
            transition: 'background-color 0.3s',
          }}
        >
          <I18nT keypath="nav.about" />
        </I18nLink>
        <I18nLink
          to="/components"
          localeRoute={localeRoute}
          activeStyle={{
            'font-weight': 'bold',
            'background-color': '#e8f5e9',
          }}
          style={{
            'text-decoration': 'none',
            color: '#42b983',
            'font-weight': 500,
            padding: '5px 10px',
            'border-radius': '4px',
            transition: 'background-color 0.3s',
          }}
        >
          <I18nT keypath="nav.components" />
        </I18nLink>
        <div style={{ 'margin-left': 'auto' }}>
          <I18nSwitcher
            locales={locales}
            currentLocale={locale}
            getLocaleName={getLocaleName}
            switchLocale={switchLocale}
            localeRoute={localeRoute}
          />
        </div>
      </nav>

      <main style={{ padding: '20px', 'background-color': '#f9f9f9', 'border-radius': '8px' }}>{props.children}</main>
    </div>
  )
}

export default App
