import type { Translations } from '@i18n-micro/types'
import { describe, expectTypeOf, it } from 'vitest'
import type { PluginsInjections } from '../src/runtime/plugins/01.plugin'

type ResolveTranslations = PluginsInjections['$resolveTranslations']
type SetTranslation = PluginsInjections['$setTranslation']

describe('PluginsInjections translation memory API', () => {
  it('exposes $resolveTranslations returning Translations', () => {
    expectTypeOf<ResolveTranslations>().returns.toEqualTypeOf<Translations>()
    expectTypeOf<ResolveTranslations>().parameters.toEqualTypeOf<[]>()
  })

  it('exposes $setTranslation with key and value parameters', () => {
    expectTypeOf<SetTranslation>().parameters.toEqualTypeOf<[string, unknown]>()
    expectTypeOf<SetTranslation>().returns.toEqualTypeOf<void>()
  })
})
