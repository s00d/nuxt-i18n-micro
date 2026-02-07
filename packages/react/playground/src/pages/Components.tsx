// @ts-nocheck

import { I18nGroup, I18nLink, I18nSwitcher, I18nT, useI18n } from '@i18n-micro/react'
import type React from 'react'

// @ts-expect-error - React.FC type compatibility
export const Components: React.FC<Record<string, never>> = () => {
  const localesConfig = [
    { code: 'en', displayName: 'English', iso: 'en-US' },
    { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
    { code: 'de', displayName: 'Deutsch', iso: 'de-DE' },
  ]
  const { t, tn, td, tdr, getLocales, locale, getLocaleName, switchLocale, localeRoute } = useI18n({ locales: localesConfig, defaultLocale: 'en' })
  const oneHourAgo = new Date(Date.now() - 3600000)

  return (
    <div>
      <h1>{t('components.title')}</h1>
      <p>{t('components.description')}</p>

      <section style={{ margin: '30px 0', padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        <h2 style={{ marginTop: 0, color: '#42b983' }}>I18nT Component</h2>
        <p>
          <I18nT keypath="welcome" />
        </p>
        <p>
          <I18nT keypath="greeting" params={{ name: 'React' }} />
        </p>
        <p>
          <I18nT keypath="apples" plural={0} />
        </p>
        <p>
          <I18nT keypath="apples" plural={1} />
        </p>
        <p>
          <I18nT keypath="apples" plural={5} />
        </p>
        <p>
          <I18nT keypath="number" number={1234.56} />
        </p>
        <p>
          <I18nT keypath="date" date={new Date()} />
        </p>
        <p>
          <I18nT keypath="relativeDate" relativeDate={oneHourAgo} />
        </p>
        <p>
          <I18nT keypath="htmlExample" html tag="div" />
        </p>
        <p>
          <I18nT keypath="hideIfEmpty" hideIfEmpty defaultValue="No translation" />
        </p>
      </section>

      <section style={{ margin: '30px 0', padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        <h2 style={{ marginTop: 0, color: '#42b983' }}>I18nLink Component</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <I18nLink to="/" localeRoute={localeRoute} activeStyle={{ fontWeight: 'bold', color: '#42b983' }}>
            {t('nav.home')}
          </I18nLink>
          <I18nLink to="/about" localeRoute={localeRoute} activeStyle={{ fontWeight: 'bold', color: '#42b983' }}>
            {t('nav.about')}
          </I18nLink>
          <I18nLink to="/components" localeRoute={localeRoute} activeStyle={{ fontWeight: 'bold', color: '#42b983' }}>
            {t('nav.components')}
          </I18nLink>
          <I18nLink to="https://example.com" target="_blank">
            External Link
          </I18nLink>
        </div>
      </section>

      <section style={{ margin: '30px 0', padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        <h2 style={{ marginTop: 0, color: '#42b983' }}>I18nSwitcher Component</h2>
        <I18nSwitcher
          locales={getLocales()}
          currentLocale={locale}
          getLocaleName={() => getLocaleName()}
          switchLocale={switchLocale}
          localeRoute={localeRoute}
        />
        <div style={{ marginTop: '20px' }}>
          <p>Custom styled switcher:</p>
          <I18nSwitcher
            locales={getLocales()}
            currentLocale={locale}
            getLocaleName={() => getLocaleName()}
            switchLocale={switchLocale}
            localeRoute={localeRoute}
            customButtonStyle={{
              backgroundColor: '#42b983',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
            }}
            customDropdownStyle={{
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
            customActiveLinkStyle={{
              backgroundColor: '#e8f5e9',
            }}
          />
        </div>
      </section>

      <section style={{ margin: '30px 0', padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        <h2 style={{ marginTop: 0, color: '#42b983' }}>I18nGroup Component</h2>
        <I18nGroup prefix="group">
          {({ t: groupT }: { t: (key: string, params?: Record<string, string | number | boolean>) => string }) => (
            <div>
              <p>{groupT('title')}</p>
              <p>{groupT('description')}</p>
              <p>{groupT('item', { count: 5 })}</p>
            </div>
          )}
        </I18nGroup>
      </section>

      <section style={{ margin: '30px 0', padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        <h2 style={{ marginTop: 0, color: '#42b983' }}>Formatting Examples</h2>
        <p>Number: {tn(1234.56)}</p>
        <p>Date: {td(new Date())}</p>
        <p>Relative Time: {tdr(oneHourAgo)}</p>
      </section>
    </div>
  )
}
