import { useI18n } from '@i18n-micro/solid'
import { For } from 'solid-js'
import { bigKey, bigRows } from '../../../../../benchmark/integrations/catalogue'

export function Big() {
  const { t } = useI18n()
  return (
    <ul data-testid="page-big">
      <li data-testid="big-sample">{String(t(bigKey(1234), { x: 'y' }, undefined, 'big'))}</li>
      <li data-testid="big-count">{bigRows.length}</li>
      <For each={bigRows}>{(n) => <li>{String(t(bigKey(n), { x: n }, undefined, 'big'))}</li>}</For>
    </ul>
  )
}
