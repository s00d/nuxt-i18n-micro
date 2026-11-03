import { useI18n, useI18nDefaultLocale, useI18nLocales, useI18nRouter } from '@i18n-micro/react'
import { useEffect, useState } from 'react'
import { persisted, type RoutingApi, routingRows } from '../../../../../benchmark/integrations/catalogue'

export function Routing() {
  const i18n = useI18n()
  const locales = useI18nLocales()
  const fallback = useI18nDefaultLocale()
  const router = useI18nRouter()
  const [stored, setStored] = useState('')

  useEffect(() => setStored(persisted.read() ?? ''), [i18n.locale])

  return (
    <ul data-testid="page-routing">
      {routingRows(i18n as unknown as RoutingApi).map(({ id, value }) => (
        <li key={id} data-testid={id}>
          {value}
        </li>
      ))}
      <li data-testid="ctx-locales">{(locales ?? []).length}</li>
      <li data-testid="ctx-default">{fallback}</li>
      <li data-testid="ctx-router">{String(Boolean(router))}</li>
      <li data-testid="ctx-route">{JSON.stringify(router?.getRoute?.())}</li>
      <li data-testid="persisted">{stored}</li>
      <li>
        <button type="button" data-testid="act-switch-query" data-action onClick={() => i18n.switchLocale('de')}>
          switch
        </button>
      </li>
    </ul>
  )
}
