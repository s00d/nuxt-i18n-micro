import * as all from '@i18n-micro/react'
import { useI18n } from '@i18n-micro/react'
import { useMemo, useRef } from 'react'
import { caseRows, type I18nLike } from '../../../../../benchmark/integrations/catalogue'

/** `useT` is new in 2.0: the row reports its absence on an older package. */
const useTitle = (all as { useT?: (key: string) => string }).useT ?? (() => 'no useT')

export function Cases() {
  const i18n = useI18n()
  const title = useTitle('welcome')
  const renders = useRef(0)
  renders.current++
  const rows = useMemo(() => caseRows(i18n as unknown as I18nLike), [i18n.t])
  return (
    <ul data-testid="page-cases">
      {rows.map(({ id, value }) => (
        <li key={id} data-testid={id}>
          {value}
        </li>
      ))}
      <li data-testid="route-only-title">{String(i18n.t('title'))}</li>
      <li data-testid="use-t">{title}</li>
      <li data-testid="fallback-locale">{i18n.fallbackLocale}</li>
      <li data-testid="current-route-value">{i18n.currentRoute}</li>
    </ul>
  )
}
