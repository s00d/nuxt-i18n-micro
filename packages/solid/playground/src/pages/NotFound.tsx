import { useI18n } from '@i18n-micro/solid'

export function NotFound() {
  const { t } = useI18n()
  return <p data-testid="not-found">{String(t('no.such.page', undefined, 'not found'))}</p>
}
