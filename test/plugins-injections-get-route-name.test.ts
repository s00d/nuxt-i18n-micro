import { describe, expectTypeOf, it } from 'vitest'
import type { RouteLocationNormalizedLoaded, RouteLocationResolvedGeneric } from 'vue-router'
import type { PluginsInjections } from '../src/runtime/plugins/01.plugin'

describe('PluginsInjections $getRouteName typing', () => {
  it('accepts RouteLocationNormalizedLoaded from useRoute() (vue-router 5)', () => {
    type Arg = Parameters<PluginsInjections['$getRouteName']>[0]
    expectTypeOf<RouteLocationNormalizedLoaded>().toMatchTypeOf<Arg>()
    expectTypeOf<RouteLocationResolvedGeneric>().toMatchTypeOf<Arg>()
    expectTypeOf<PluginsInjections['$getRouteName']>().returns.toBeString()
  })

  it('matches $getLocale route argument shape', () => {
    type GetRouteNameArg = Parameters<PluginsInjections['$getRouteName']>[0]
    type GetLocaleArg = Parameters<PluginsInjections['$getLocale']>[0]
    expectTypeOf<GetRouteNameArg>().toEqualTypeOf<GetLocaleArg>()
  })
})
