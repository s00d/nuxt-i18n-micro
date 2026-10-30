import { createEffect, createRoot } from 'solid-js'
import { describe, expect, test } from 'vitest'
import { createI18n } from '../src/i18n'

describe('SolidI18n reactivity', () => {
  test('an effect that writes translations runs once, not forever', () => {
    const i18n = createI18n({ locale: 'en', missingWarn: false })
    let runs = 0
    createRoot((dispose) => {
      createEffect(() => {
        runs++
        if (runs > 50) throw new Error('effect loop')
        i18n.addTranslations('en', { a: 'A' })
      })
      dispose()
    })
    expect(runs).toBe(1)
  })

  test('named formats are forwarded to the core formatter', () => {
    const i18n = createI18n({ locale: 'en-US', numberFormats: { 'en-US': { money: { style: 'currency', currency: 'USD' } } } })
    expect(i18n.tn(5, 'money')).toBe('$5.00')
  })
})
