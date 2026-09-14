import type { CleanTranslation, TranslationKey } from '@i18n-micro/types'
import { describe, expectTypeOf, it } from 'vitest'
import type { PluginsInjections, TranslationFn } from '../src/runtime/plugins/01.plugin'
import type { NuxtI18n, NuxtI18nPluginProvide } from '../src/runtime/utils/nuxt-i18n'

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

describe('NuxtI18n route-bound translation typing (#257)', () => {
  it('types tForRoute / tsForRoute as TranslationFn', () => {
    expectTypeOf<NuxtI18n['tForRoute']>().returns.toEqualTypeOf<TranslationFn<CleanTranslation>>()
    expectTypeOf<NuxtI18n['tsForRoute']>().returns.toEqualTypeOf<TranslationFn<string>>()
    expectTypeOf<Parameters<ReturnType<NuxtI18n['tForRoute']>>[0]>().toEqualTypeOf<TranslationKey>()
    expectTypeOf<Parameters<ReturnType<NuxtI18n['tsForRoute']>>[0]>().toEqualTypeOf<TranslationKey>()
  })

  it('types plugin API ts key as TranslationKey', () => {
    expectTypeOf<Parameters<NuxtI18nPluginProvide['ts']>[0]>().toEqualTypeOf<TranslationKey>()
    expectTypeOf<ReturnType<NuxtI18nPluginProvide['ts']>>().toEqualTypeOf<string>()
  })
})
