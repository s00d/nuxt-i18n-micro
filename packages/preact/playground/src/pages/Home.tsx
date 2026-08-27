import { useI18n } from '@i18n-micro/preact'

export function Home() {
  const { t, tc, tn, td, tdr, locale } = useI18n()

  return (
    <div>
      <h1>{String(t('home.title'))}</h1>
      <p>{String(t('home.description'))}</p>
      <p>{String(t('welcome'))}</p>
      <p>{String(t('greeting', { name: 'World' }))}</p>
      <p>{String(tc('apples', 0))}</p>
      <p>{String(tc('apples', 1))}</p>
      <p>{String(tc('apples', 5))}</p>
      <p>{String(t('number', { number: tn(1234.56) }))}</p>
      <p>{String(t('date', { date: td(new Date()) }))}</p>
      <p>{String(t('relativeDate', { relativeDate: tdr(Date.now() - 86400000) }))}</p>
      <p>Current locale: {locale}</p>
    </div>
  )
}
