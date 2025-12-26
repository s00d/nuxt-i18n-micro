/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { type Component, createMemo } from 'solid-js'
import { useI18n, I18nT, I18nLink, I18nSwitcher, I18nGroup } from '@i18n-micro/solid'

const Components: Component = () => {
  const { tn, td, tdr } = useI18n()
  const oneHourAgo = createMemo(() => new Date(Date.now() - 3600000))

  return (
    <div>
      <h1><I18nT keypath="components.title" /></h1>
      <p><I18nT keypath="components.description" /></p>

      <section style={{ 'margin': '30px 0', 'padding': '20px', 'background-color': 'white', 'border-radius': '8px', 'border': '1px solid #e0e0e0' }}>
        <h2 style={{ 'margin-top': 0, 'color': '#42b983' }}>I18nT Component</h2>
        <p><I18nT keypath="welcome" /></p>
        <p><I18nT keypath="greeting" params={{ name: 'Solid' }} /></p>
        <p><I18nT keypath="apples" plural={0} /></p>
        <p><I18nT keypath="apples" plural={1} /></p>
        <p><I18nT keypath="apples" plural={5} /></p>
        <p><I18nT keypath="number" number={1234.56} /></p>
        <p><I18nT keypath="date" date={new Date()} /></p>
        <p><I18nT keypath="relativeDate" relativeDate={oneHourAgo()} /></p>
        <p><I18nT keypath="htmlExample" html tag="div" /></p>
        <p><I18nT keypath="hideIfEmpty" hideIfEmpty defaultValue="No translation" /></p>
      </section>

      <section style={{ 'margin': '30px 0', 'padding': '20px', 'background-color': 'white', 'border-radius': '8px', 'border': '1px solid #e0e0e0' }}>
        <h2 style={{ 'margin-top': 0, 'color': '#42b983' }}>I18nLink Component</h2>
        <div style={{ 'display': 'flex', 'gap': '15px', 'flex-wrap': 'wrap' }}>
          <I18nLink to="/" activeStyle={{ 'font-weight': 'bold', 'color': '#42b983' }}>
            <I18nT keypath="nav.home" />
          </I18nLink>
          <I18nLink to="/about" activeStyle={{ 'font-weight': 'bold', 'color': '#42b983' }}>
            <I18nT keypath="nav.about" />
          </I18nLink>
          <I18nLink to="/components" activeStyle={{ 'font-weight': 'bold', 'color': '#42b983' }}>
            <I18nT keypath="nav.components" />
          </I18nLink>
          <I18nLink to="https://example.com" target="_blank">
            External Link
          </I18nLink>
        </div>
      </section>

      <section style={{ 'margin': '30px 0', 'padding': '20px', 'background-color': 'white', 'border-radius': '8px', 'border': '1px solid #e0e0e0' }}>
        <h2 style={{ 'margin-top': 0, 'color': '#42b983' }}>I18nSwitcher Component</h2>
        <I18nSwitcher />
        <div style={{ 'margin-top': '20px' }}>
          <p>Custom styled switcher:</p>
          <I18nSwitcher
            customButtonStyle={{
              'background-color': '#42b983',
              'color': 'white',
              'border': 'none',
              'border-radius': '4px',
            }}
            customDropdownStyle={{
              'border-radius': '4px',
              'box-shadow': '0 4px 12px rgba(0,0,0,0.2)',
            }}
            customActiveLinkStyle={{
              'background-color': '#e8f5e9',
            }}
          />
        </div>
      </section>

      <section style={{ 'margin': '30px 0', 'padding': '20px', 'background-color': 'white', 'border-radius': '8px', 'border': '1px solid #e0e0e0' }}>
        <h2 style={{ 'margin-top': 0, 'color': '#42b983' }}>I18nGroup Component</h2>
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

      <section style={{ 'margin': '30px 0', 'padding': '20px', 'background-color': 'white', 'border-radius': '8px', 'border': '1px solid #e0e0e0' }}>
        <h2 style={{ 'margin-top': 0, 'color': '#42b983' }}>Formatting Examples</h2>
        <p>
          Number:
          {' '}
          {tn(1234.56)}
        </p>
        <p>
          Date:
          {' '}
          {td(new Date())}
        </p>
        <p>
          Relative Time:
          {' '}
          {tdr(oneHourAgo())}
        </p>
      </section>
    </div>
  )
}

export default Components
