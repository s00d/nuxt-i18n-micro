import { useI18n } from '@i18n-micro/solid'
import { createMemo, For } from 'solid-js'
import { caseRows, type I18nLike } from '../../../../../benchmark/integrations/catalogue'

export function Cases() {
  const i18n = useI18n()
  const rows = createMemo(() => caseRows(i18n as unknown as I18nLike))
  return (
    <ul data-testid="page-cases">
      <For each={rows()}>{({ id, value }) => <li data-testid={id}>{value}</li>}</For>
      <li data-testid="route-only-title">{String(i18n.t('title'))}</li>
      <li data-testid="fallback-locale">{i18n.instance.fallbackLocale}</li>
      <li data-testid="current-route-value">{i18n.instance.currentRoute}</li>
    </ul>
  )
}
