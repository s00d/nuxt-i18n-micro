import { useI18n, useI18nDefaultLocale, useI18nLocales, useI18nRouter } from '@i18n-micro/solid'
import { createMemo, createSignal, For, onMount } from 'solid-js'
import { persisted, type RoutingApi, routingRows } from '../../../../../benchmark/integrations/catalogue'

export function Routing() {
  const i18n = useI18n()
  const locales = useI18nLocales()
  const fallback = useI18nDefaultLocale()
  const router = useI18nRouter()
  const [stored, setStored] = createSignal('')
  const rows = createMemo(() => (i18n.locale(), routingRows(i18n as unknown as RoutingApi)))

  onMount(() => setStored(persisted.read() ?? ''))

  return (
    <ul data-testid="page-routing">
      <For each={rows()}>{({ id, value }) => <li data-testid={id}>{value}</li>}</For>
      <li data-testid="ctx-locales">{(locales ?? []).length}</li>
      <li data-testid="ctx-default">{fallback}</li>
      <li data-testid="ctx-router">{String(Boolean(router))}</li>
      <li data-testid="persisted">{stored()}</li>
      <li>
        <button type="button" data-testid="act-switch-query" data-action onClick={() => i18n.switchLocale('de')}>
          switch
        </button>
      </li>
    </ul>
  )
}
