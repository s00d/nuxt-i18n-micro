import { createI18n, I18nGroup, I18nLink, I18nProvider, I18nSwitcher, I18nT, useI18n } from '@i18n-micro/solid'
import type { JSX } from 'solid-js'

const customRule = (_key: string, count: number) => `rule ${count}`

const Row = (props: { id: string; children: JSX.Element }) => <li data-testid={props.id}>{props.children}</li>

const Inner = () => {
  const { t, locale } = useI18n()
  return (
    <>
      {locale()}: {String(t('welcome'))}
    </>
  )
}

/** A provider inside a provider, with an instance of its own: only its subtree changes. */
const Nested = () => (
  <I18nProvider i18n={createI18n({ locale: 'de', messages: { de: { welcome: 'Innen' } } })}>
    <Inner />
  </I18nProvider>
)

export function Components() {
  const hourAgo = Date.now() - 3_600_000
  return (
    <ul data-testid="page-components">
      <Row id="it-basic">
        <I18nT keypath="welcome" />
      </Row>
      <Row id="it-params">
        <I18nT keypath="greeting" params={{ name: 'Ada' }} />
      </Row>
      <Row id="it-tag">
        <I18nT keypath="welcome" tag="h3" />
      </Row>
      <Row id="it-plural-0">
        <I18nT keypath="apples" plural={0} />
      </Row>
      <Row id="it-plural-2">
        <I18nT keypath="apples" plural={2} />
      </Row>
      <Row id="it-plural-string">
        <I18nT keypath="apples" plural="3" />
      </Row>
      <Row id="it-plural-null">
        <I18nT keypath="welcome" plural={null} />
      </Row>
      <Row id="it-plural-fraction">
        <I18nT keypath="apples" plural={1.5} />
      </Row>
      <Row id="it-plural-custom">
        <I18nT keypath="apples" plural={2} customPluralRule={customRule} />
      </Row>
      <Row id="it-number">
        <I18nT keypath="stats" number={1234.5} params={{ date: 'd', relativeDate: 'r' }} />
      </Row>
      <Row id="it-date">
        <I18nT keypath="stats" date={0} params={{ number: 'n', relativeDate: 'r' }} />
      </Row>
      <Row id="it-relative">
        <I18nT keypath="stats" relativeDate={hourAgo} params={{ number: 'n', date: 'd' }} />
      </Row>
      <Row id="it-html">
        <I18nT keypath="html" params={{ name: '<i>x</i>' }} html />
      </Row>
      <Row id="it-no-html">
        <I18nT keypath="html" params={{ name: '<i>x</i>' }} />
      </Row>
      <Row id="it-missing">
        <I18nT keypath="no.such.key" />
      </Row>
      <Row id="it-missing-html">
        <I18nT keypath="no.<b>key" html />
      </Row>
      <Row id="it-default">
        <I18nT keypath="no.such.key" defaultValue="Default" />
      </Row>
      <Row id="it-hide-empty">
        <I18nT keypath="empty" hideIfEmpty />
      </Row>
      <Row id="it-hide-missing">
        <I18nT keypath="no.such.key" hideIfEmpty />
      </Row>
      <Row id="it-show-empty">
        <I18nT keypath="empty" />
      </Row>
      <Row id="it-slot-name">
        <I18nT keypath="greeting" components={{ name: () => <b>Slot</b> }} />
      </Row>
      <Row id="it-slot-default">
        <I18nT keypath="welcome">{({ translation }: { translation: string }) => `[${translation}]`}</I18nT>
      </Row>
      <Row id="it-slot-two">
        <I18nT keypath="two" components={{ a: () => <i>A</i>, b: () => <u>B</u> }} />
      </Row>
      <Row id="it-slot-plural">
        <I18nT keypath="apples" plural={5} components={{ count: () => <b>five</b> }} />
      </Row>
      <Row id="it-attrs">
        <I18nT keypath="welcome" class="c" title="t" />
      </Row>
      <Row id="group-basic">
        <I18nGroup prefix="section" groupClass="g">
          {({ t, prefix }) => `${prefix}: ${t('title')}`}
        </I18nGroup>
      </Row>
      <Row id="group-deep">
        <I18nGroup prefix="section.deep.er">{({ t }) => t('value')}</I18nGroup>
      </Row>
      <Row id="group-missing">
        <I18nGroup prefix="section">{({ t }) => t('nope')}</I18nGroup>
      </Row>
      <Row id="link-string">
        <I18nLink to="/routing">string</I18nLink>
      </Row>
      <Row id="link-object">
        <I18nLink to={{ path: '/routing' }}>object</I18nLink>
      </Row>
      <Row id="link-query">
        <I18nLink to="/routing?a=1#b">query</I18nLink>
      </Row>
      <Row id="link-hash-only">
        <I18nLink to="#top">hash</I18nLink>
      </Row>
      <Row id="link-external">
        <I18nLink to="https://example.test/x">external</I18nLink>
      </Row>
      <Row id="link-active">
        <I18nLink to="/components" activeStyle={{ 'font-weight': 'bold' }}>
          active
        </I18nLink>
      </Row>
      <Row id="link-custom">
        <I18nLink to="/x" localeRoute={(to) => `/custom${to as string}`}>
          custom
        </I18nLink>
      </Row>
      <Row id="switcher-labels">
        <I18nSwitcher customLabels={{ de: 'DE!' }} />
      </Row>
      <Row id="provider-nested">
        <Nested />
      </Row>
    </ul>
  )
}
