import * as all from '@i18n-micro/react'
import { useI18n, useI18nContext } from '@i18n-micro/react'
import { useCallback, useEffect, useState } from 'react'
import { type Dictionary, fetchDictionary, lazyUrl, pageUrl } from '../../../../../benchmark/integrations/catalogue'

type Load = (locale: string) => Promise<unknown>
type Switcher = (load: Load) => [(locale: string) => Promise<void>, boolean]
/** `useLocaleSwitch` is new in 2.0. */
const useSwitch: Switcher = (all as { useLocaleSwitch?: Switcher }).useLocaleSwitch ?? (() => [async () => {}, false])

export function Dictionaries() {
  const { t, has, addTranslations, addRouteTranslations, clearCache, locale } = useI18n()
  const instance = useI18nContext()
  const [loaded, setLoaded] = useState('')
  const [changes, setChanges] = useState(0)

  const load = useCallback(
    async (code: string) => {
      try {
        const [lazy, page] = await Promise.all([fetchDictionary(lazyUrl(code)), fetchDictionary(pageUrl(code))])
        addTranslations(code, lazy as never)
        addRouteTranslations(code, 'dictionaries', page as never)
        setLoaded(code)
      } catch (error) {
        setLoaded(`failed: ${(error as Error).message}`)
      }
    },
    [addTranslations, addRouteTranslations],
  )

  useEffect(() => {
    void load(locale)
  }, [locale, load])
  useEffect(() => instance.subscribe(() => setChanges((n) => n + 1)), [instance])

  const [loadThenSwitch, pending] = useSwitch(load as Load)
  const other: Dictionary = { other: 'other locale' }
  const actions: Array<[string, () => void]> = [
    ['act-add', () => addTranslations(locale, { added: 'added text' })],
    ['act-add-other', () => addTranslations('fr', other as never)],
    ['act-add-route', () => addRouteTranslations(locale, 'dictionaries', { pageTitle: 'Replaced' }, false)],
    ['act-set', () => instance.setTranslation('section.title', 'Set title')],
    ['act-clear', () => clearCache()],
    ['act-reload', () => void load(locale)],
    ['act-load-switch', () => void loadThenSwitch('fr')],
  ]

  return (
    <ul data-testid="page-dictionaries">
      <li data-testid="dict-loaded">{loaded}</li>
      <li data-testid="dict-pending">{String(pending)}</li>
      <li data-testid="dict-lazy">{String(t('lazy.title'))}</li>
      <li data-testid="dict-lazy-param">{String(t('lazy.hello', { name: 'Ada' }))}</li>
      <li data-testid="dict-page">{String(t('pageTitle', undefined, undefined, 'dictionaries'))}</li>
      <li data-testid="dict-page-override">{String(t('welcome', undefined, undefined, 'dictionaries'))}</li>
      <li data-testid="dict-has-lazy">{String(has('lazy.title'))}</li>
      <li data-testid="dict-added">{String(t('added'))}</li>
      <li data-testid="dict-other-locale">{String(t('other'))}</li>
      <li data-testid="dict-set">{String(t('section.title'))}</li>
      <li data-testid="dict-changes">{changes}</li>
      {actions.map(([id, run]) => (
        <li key={id}>
          <button type="button" data-testid={id} data-action onClick={run}>
            {id}
          </button>
        </li>
      ))}
    </ul>
  )
}
