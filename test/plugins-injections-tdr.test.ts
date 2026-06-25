import type { BaseI18n } from '@i18n-micro/core'
import { describe, expectTypeOf, it } from 'vitest'
import type { PluginsInjections } from '../src/runtime/plugins/01.plugin'

type Tdr = PluginsInjections['$tdr']
type TdrOptions = NonNullable<Parameters<Tdr>[1]>

describe('PluginsInjections $tdr typing (#231)', () => {
  it('accepts Intl.RelativeTimeFormatOptions', () => {
    expectTypeOf<{ numeric: 'always'; style: 'long' }>().toMatchTypeOf<TdrOptions>()
    expectTypeOf<{ numeric: 'auto'; style: 'short' }>().toMatchTypeOf<TdrOptions>()
  })

  it('rejects Intl.DateTimeFormatOptions-only fields', () => {
    expectTypeOf<{ year: 'numeric'; month: 'long'; day: 'numeric' }>().not.toMatchTypeOf<TdrOptions>()
    expectTypeOf<{ hour: '2-digit'; minute: '2-digit' }>().not.toMatchTypeOf<TdrOptions>()
  })

  it('matches BaseI18n.tdr options parameter', () => {
    type BaseTdrOptions = NonNullable<Parameters<BaseI18n['tdr']>[1]>
    expectTypeOf<TdrOptions>().toEqualTypeOf<BaseTdrOptions>()
  })
})
