import type { DefineI18nRouteConfig } from '@i18n-micro/types'
import { describe, expectTypeOf, it } from 'vitest'
import type { NuxtAppOnlyInjections } from '../src/runtime/plugins/01.plugin'
import type { createNuxtI18nPluginApi } from '../src/runtime/utils/nuxt-i18n'

/**
 * `NuxtAppOnlyInjections` describes helpers that are provided from elsewhere — `$clearCache`
 * by the plugin API factory, `$defineI18nRoute` by `03.define` — so nothing makes the
 * interface follow them. It exists to generate the reference page, which means a signature
 * that drifts documents a call that does not compile. These assertions are that link.
 */
type PluginApi = ReturnType<typeof createNuxtI18nPluginApi>['provide']

describe('NuxtAppOnlyInjections', () => {
  it('matches the $clearCache the plugin API actually provides', () => {
    expectTypeOf<NuxtAppOnlyInjections['$clearCache']>().toEqualTypeOf<PluginApi['clearCache']>()
  })

  it('takes a route definition and resolves to nothing', () => {
    expectTypeOf<NuxtAppOnlyInjections['$defineI18nRoute']>().parameters.toEqualTypeOf<[DefineI18nRouteConfig]>()
    expectTypeOf<NuxtAppOnlyInjections['$defineI18nRoute']>().returns.toEqualTypeOf<Promise<void>>()
  })

  it('stays out of the helpers useI18n() exposes', () => {
    // The reason the interface is separate: documenting these alongside `$t` would promise a
    // composable that never had them.
    expectTypeOf<keyof NuxtAppOnlyInjections>().toEqualTypeOf<'$defineI18nRoute' | '$clearCache'>()
  })
})
