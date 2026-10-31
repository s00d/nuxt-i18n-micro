import type { I18nClientProps } from '@i18n-micro/astro'
import { I18nProvider, useAstroI18n } from '@i18n-micro/astro/client/react'

function Body() {
  const { t, tc, tn, td, tdr, has, locale } = useAstroI18n()
  return (
    <>
      <span data-testid="react-t">{String(t('welcome'))}</span>
      <span data-testid="react-param">{String(t('greeting', { name: 'Ada' }))}</span>
      <span data-testid="react-nested">{String(t('section.title'))}</span>
      <span data-testid="react-tc">{tc('apples', 2)}</span>
      <span data-testid="react-tn">{tn(1234.5)}</span>
      <span data-testid="react-td">{td(0)}</span>
      <span data-testid="react-tdr">{tdr(Date.now() - 3_600_000)}</span>
      <span data-testid="react-has">
        {String(has('welcome'))} {String(has('not.passed'))}
      </span>
      <span data-testid="react-missing">{String(t('not.passed'))}</span>
      <span data-testid="react-locale">{String(locale)}</span>
    </>
  )
}

export default function ReactIsland({ i18n }: { i18n: I18nClientProps }) {
  return (
    <I18nProvider value={i18n}>
      <Body />
    </I18nProvider>
  )
}
