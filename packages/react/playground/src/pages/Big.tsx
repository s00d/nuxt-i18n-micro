import { useI18n } from '@i18n-micro/react'
import { bigKey, bigRows } from '../../../../../benchmark/integrations/catalogue'

export function Big() {
  const { t } = useI18n()
  return (
    <ul data-testid="page-big">
      <li data-testid="big-sample">{String(t(bigKey(1234), { x: 'y' }, undefined, 'big'))}</li>
      <li data-testid="big-count">{bigRows.length}</li>
      {bigRows.map((n) => (
        <li key={n}>{String(t(bigKey(n), { x: n }, undefined, 'big'))}</li>
      ))}
    </ul>
  )
}
