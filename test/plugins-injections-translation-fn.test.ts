import type { CleanTranslation, TranslationKey } from '@i18n-micro/types'
import { describe, expectTypeOf, it } from 'vitest'
import type { PluginsInjections, TranslationFn } from '../src/runtime/plugins/01.plugin'

describe('PluginsInjections translation fn typing (#256)', () => {
  it('types $t / $_t as TranslationFn returning CleanTranslation', () => {
    expectTypeOf<PluginsInjections['$t']>().toEqualTypeOf<TranslationFn<CleanTranslation>>()
    expectTypeOf<ReturnType<PluginsInjections['$t']>>().toEqualTypeOf<CleanTranslation>()
    expectTypeOf<Parameters<PluginsInjections['$t']>[0]>().toEqualTypeOf<TranslationKey>()

    type BoundT = ReturnType<PluginsInjections['$_t']>
    expectTypeOf<BoundT>().toEqualTypeOf<TranslationFn<CleanTranslation>>()
    expectTypeOf<ReturnType<BoundT>>().toEqualTypeOf<CleanTranslation>()
  })

  it('types $ts / $_ts as TranslationFn returning string', () => {
    expectTypeOf<PluginsInjections['$ts']>().toEqualTypeOf<TranslationFn<string>>()
    expectTypeOf<ReturnType<PluginsInjections['$ts']>>().toEqualTypeOf<string>()
    expectTypeOf<Parameters<PluginsInjections['$ts']>[0]>().toEqualTypeOf<TranslationKey>()

    type BoundTs = ReturnType<PluginsInjections['$_ts']>
    expectTypeOf<BoundTs>().toEqualTypeOf<TranslationFn<string>>()
    expectTypeOf<ReturnType<BoundTs>>().toEqualTypeOf<string>()
  })

  it('types $tc key as TranslationKey and return as string', () => {
    expectTypeOf<Parameters<PluginsInjections['$tc']>[0]>().toEqualTypeOf<TranslationKey>()
    expectTypeOf<ReturnType<PluginsInjections['$tc']>>().toEqualTypeOf<string>()
  })
})
