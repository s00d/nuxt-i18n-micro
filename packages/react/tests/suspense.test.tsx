// A reader that suspends on a missing dictionary, the way `use(promise)` or a data library does.
import { act, render, screen } from '@testing-library/react'
import { startTransition, Suspense } from 'react'
import { renderToString } from 'react-dom/server'
import { expect, test } from 'vitest'
import { createI18n, I18nProvider, useI18n, useLocaleSwitch } from '../src'

test('a render React throws away leaves the instance as it was', async () => {
  const i18n = createI18n({ locale: 'ua', messages: { ua: { a: 'A' } }, missingWarn: false })
  const never = new Promise<void>(() => {})
  const Stuck = ({ stuck }: { stuck: boolean }) => {
    if (stuck) throw never
    return null
  }
  const app = (iso: string, stuck: boolean) => (
    <Suspense fallback={null}>
      <I18nProvider i18n={i18n} locales={[{ code: 'ua', iso }]}>
        <Stuck stuck={stuck} />
      </I18nProvider>
    </Suspense>
  )
  const { rerender } = render(app('uk-UA', false))
  expect(i18n.pluralLocale()).toBe('uk-UA')
  await act(async () => {
    startTransition(() => rerender(app('ru-RU', true)))
  })
  expect(i18n.pluralLocale()).toBe('uk-UA')
})

test('a provider on a fork writes its tags into that fork: the server renders one per request', () => {
  const parent = createI18n({ locale: 'en', missingWarn: false })
  const fork = parent.fork()
  renderToString(<I18nProvider i18n={fork} locales={[{ code: 'en', iso: 'en-GB' }]} />)
  expect(fork.pluralLocale()).toBe('en-GB')
  expect(parent.pluralLocale()).toBe('en')
})

test('useLocaleSwitch: a suspending reader keeps the old text, its fallback never shows', async () => {
  const i18n = createI18n({ locale: 'en', messages: { en: { title: 'Hello' } }, missingWarn: false })
  let finish!: () => void
  const loading = new Promise<void>((resolve) => {
    finish = () => {
      i18n.addTranslations('de', { title: 'Hallo' })
      resolve()
    }
  })
  let fallbacks = 0
  const Fallback = () => {
    fallbacks++
    return <p>loading</p>
  }
  const Reader = () => {
    const { t, has } = useI18n()
    if (!has('title')) throw loading
    return <p>{t('title')}</p>
  }
  let run!: (locale: string) => Promise<void>
  const Switch = () => {
    ;[run] = useLocaleSwitch(() => loading)
    return null
  }
  render(
    <I18nProvider i18n={i18n}>
      <Switch />
      <Suspense fallback={<Fallback />}>
        <Reader />
      </Suspense>
    </I18nProvider>,
  )
  let done!: Promise<void>
  act(() => {
    done = run('de')
  })
  expect(screen.getByText('Hello')).toBeTruthy()
  await act(async () => {
    finish()
    await done
  })
  expect(screen.getByText('Hallo')).toBeTruthy()
  expect(fallbacks).toBe(0)
})
