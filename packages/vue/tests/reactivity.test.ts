import { describe, expect, test } from 'vitest'
import { computed } from 'vue'
import { VueI18n } from '../src/composer'

describe('VueI18n reactivity', () => {
  test('computed t() re-runs after addTranslations and setTranslation', () => {
    const i18n = new VueI18n({ locale: 'en', messages: { en: {} } })
    const late = computed(() => i18n.t('late'))
    expect(late.value).toBe('late')
    i18n.addTranslations('en', { late: 'Loaded' })
    expect(late.value).toBe('Loaded')
    i18n.setTranslation('late', 'Set')
    expect(late.value).toBe('Set')
  })

  test('named formats are forwarded to the core formatter', () => {
    const i18n = new VueI18n({ locale: 'en-US', numberFormats: { 'en-US': { money: { style: 'currency', currency: 'USD' } } } })
    expect(i18n.tn(5, 'money')).toBe('$5.00')
  })
})
