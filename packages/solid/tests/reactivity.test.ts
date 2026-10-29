import { createEffect, createRoot } from 'solid-js'
import { describe, expect, test } from 'vitest'
import { createI18n } from '../src/i18n'

describe('SolidI18n reactivity', () => {
  test('named formats are forwarded to the core formatter', () => {
    const i18n = createI18n({ locale: 'en-US', numberFormats: { 'en-US': { money: { style: 'currency', currency: 'USD' } } } })
    expect(i18n.tn(5, 'money')).toBe('$5.00')
  })
})
