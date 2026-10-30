// A reader that suspends on a missing dictionary, the way `use(promise)` or a data library does.
import { act, render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { expect, test } from 'vitest'
import { createI18n, I18nProvider, useI18n, useLocaleSwitch } from '../src'

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
