import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { expect, test } from 'vitest'
import { shippedOverrides } from '../../src/runtime/utils/i18n-config'

const build = () => ({ defaultLocale: 'en', fallbackLocale: 'de', locales: [{ code: 'en' }, { code: 'de' }] }) as ModuleOptionsExtend

test('the payload carries overrides only when the server resolved something the build does not say', () => {
  // Nitro and the app bundle each hold their own copy of the build config: another object, the same values
  expect(shippedOverrides(build(), build())).toBeNull()

  const disabled = { ...build(), locales: [{ code: 'en' }, { code: 'de', disabled: true }] }
  expect(shippedOverrides(disabled, build())).toMatchObject({ disabledLocales: ['de'] })
  expect(shippedOverrides({ ...build(), defaultLocale: 'de' }, build())).toMatchObject({ defaultLocale: 'de' })
  expect(shippedOverrides({ ...build(), fallbackLocale: undefined }, build())).toMatchObject({ fallbackLocale: undefined })
  expect(shippedOverrides({ ...build(), domain: 'de.example.com' }, build())).toMatchObject({ domain: 'de.example.com' })
})
