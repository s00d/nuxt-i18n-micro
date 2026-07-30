import { describe, expectTypeOf, it } from 'vitest'
import type { Locale, ModuleOptions, Strategies, Translations } from '../src/index'

describe('@i18n-micro/types', () => {
  it('exports core public types', () => {
    expectTypeOf<Locale>().toMatchTypeOf<{ code: string }>()
    expectTypeOf<ModuleOptions['strategy']>().toEqualTypeOf<Strategies | undefined>()
    expectTypeOf<Translations>().toMatchTypeOf<Record<string, unknown>>()
    expectTypeOf<ModuleOptions['experimental']>().toEqualTypeOf<Record<string, unknown> | undefined>()
  })
})
