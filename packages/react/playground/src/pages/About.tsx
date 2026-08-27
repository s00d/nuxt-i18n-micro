import { useI18n } from '@i18n-micro/react'

export function About() {
  const { t } = useI18n()

  return (
    <div>
      <h1>{String(t('about.title'))}</h1>
      <p>{String(t('about.description'))}</p>
    </div>
  )
}
