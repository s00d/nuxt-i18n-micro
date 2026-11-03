import { useI18n } from '@i18n-micro/solid'
import { createEffect, createMemo, createSignal, For, on, onCleanup } from 'solid-js'
import { fetchDictionary, lazyUrl, pageUrl } from '../../../../../benchmark/integrations/catalogue'

export function Dictionaries() {
  const { t, has, addTranslations, addRouteTranslations, setTranslation, clearCache, locale, resolveTranslations, instance } = useI18n()
  const [loaded, setLoaded] = createSignal('')
  const [changes, setChanges] = createSignal(0)

  /** A slow answer for a locale left meanwhile says nothing about the current one. */
  const report = (code: string, text: string) => code === locale() && setLoaded(text)

  async function load(code: string) {
    try {
      const [lazy, page] = await Promise.all([fetchDictionary(lazyUrl(code)), fetchDictionary(pageUrl(code))])
      addTranslations(code, lazy as never)
      addRouteTranslations(code, 'dictionaries', page as never)
      report(code, code)
    } catch (error) {
      report(code, `failed: ${(error as Error).message}`)
    }
  }

  createEffect(on(locale, (code) => void load(code)))
  createEffect(() => {
    const stop = instance.subscribe(() => setChanges((n) => n + 1))
    onCleanup(stop)
  })

  const resolved = createMemo(() => Object.keys(resolveTranslations()).length)
  const actions: Array<[string, () => void]> = [
    ['act-add', () => addTranslations(locale(), { added: 'added text' })],
    ['act-add-other', () => addTranslations('fr', { other: 'other locale' })],
    ['act-add-route', () => addRouteTranslations(locale(), 'dictionaries', { pageTitle: 'Replaced' }, false)],
    ['act-set', () => setTranslation('section.title', 'Set title')],
    ['act-clear', () => clearCache()],
    ['act-reload', () => void load(locale())],
  ]

  return (
    <ul data-testid="page-dictionaries">
      <li data-testid="dict-loaded">{loaded()}</li>
      <li data-testid="dict-lazy">{String(t('lazy.title'))}</li>
      <li data-testid="dict-lazy-param">{String(t('lazy.hello', { name: 'Ada' }))}</li>
      <li data-testid="dict-page">{String(t('pageTitle', undefined, undefined, 'dictionaries'))}</li>
      <li data-testid="dict-page-override">{String(t('welcome', undefined, undefined, 'dictionaries'))}</li>
      <li data-testid="dict-has-lazy">{String(has('lazy.title'))}</li>
      <li data-testid="dict-added">{String(t('added'))}</li>
      <li data-testid="dict-other-locale">{String(t('other'))}</li>
      <li data-testid="dict-set">{String(t('section.title'))}</li>
      <li data-testid="dict-resolved">{resolved()}</li>
      <li data-testid="dict-changes">{changes()}</li>
      <For each={actions}>
        {([id, run]) => (
          <li>
            <button type="button" data-testid={id} data-action onClick={run}>
              {id}
            </button>
          </li>
        )}
      </For>
    </ul>
  )
}
