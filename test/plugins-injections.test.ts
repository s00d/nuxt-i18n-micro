import type { BaseI18n } from '@i18n-micro/core'
import type { CleanTranslation, DefineI18nRouteConfig, TranslationKey, Translations } from '@i18n-micro/types'
import { describe, expectTypeOf, it } from 'vitest'
import type { RouteLocationNormalizedLoaded, RouteLocationResolvedGeneric } from 'vue-router'
import type { NuxtAppOnlyInjections, PluginsInjections, TranslationFn } from '../src/runtime/plugins/01.plugin'
import type { createNuxtI18nPluginApi, NuxtI18n, NuxtI18nPluginProvide } from '../src/runtime/utils/nuxt-i18n'

// Type contracts: these assert only under `vitest --typecheck` (the unit project enables it).
type P = PluginsInjections

describe('PluginsInjections typing', () => {
  it('translation functions (#256, #257)', () => {
    // $t / $_t → CleanTranslation, $ts / $_ts / $tc → string, every key a TranslationKey
    expectTypeOf<P['$t']>().toEqualTypeOf<TranslationFn<CleanTranslation>>()
    expectTypeOf<Parameters<P['$t']>[0]>().toEqualTypeOf<TranslationKey>()
    expectTypeOf<ReturnType<P['$_t']>>().toEqualTypeOf<TranslationFn<CleanTranslation>>()
    expectTypeOf<P['$ts']>().toEqualTypeOf<TranslationFn<string>>()
    expectTypeOf<ReturnType<P['$_ts']>>().toEqualTypeOf<TranslationFn<string>>()
    expectTypeOf<Parameters<P['$tc']>[0]>().toEqualTypeOf<TranslationKey>()
    expectTypeOf<ReturnType<P['$tc']>>().toEqualTypeOf<string>()
    // route-bound versions and the plugin API agree
    expectTypeOf<NuxtI18n['tForRoute']>().returns.toEqualTypeOf<TranslationFn<CleanTranslation>>()
    expectTypeOf<NuxtI18n['tsForRoute']>().returns.toEqualTypeOf<TranslationFn<string>>()
    expectTypeOf<Parameters<NuxtI18nPluginProvide['ts']>[0]>().toEqualTypeOf<TranslationKey>()
    expectTypeOf<ReturnType<NuxtI18nPluginProvide['ts']>>().toEqualTypeOf<string>()
  })

  it('$tdr options (#231), routes, translation memory', () => {
    // $tdr takes RelativeTimeFormat options, not DateTimeFormat ones, same as BaseI18n.tdr
    type TdrOptions = NonNullable<Parameters<P['$tdr']>[1]>
    expectTypeOf<{ numeric: 'auto'; style: 'short' }>().toMatchTypeOf<TdrOptions>()
    expectTypeOf<{ year: 'numeric'; month: 'long' }>().not.toMatchTypeOf<TdrOptions>()
    expectTypeOf<TdrOptions>().toEqualTypeOf<NonNullable<Parameters<BaseI18n['tdr']>[1]>>()

    // $getRouteName takes useRoute() (vue-router 5) and resolved routes, like $getLocale
    type RouteArg = Parameters<P['$getRouteName']>[0]
    expectTypeOf<RouteLocationNormalizedLoaded>().toMatchTypeOf<RouteArg>()
    expectTypeOf<RouteLocationResolvedGeneric>().toMatchTypeOf<RouteArg>()
    expectTypeOf<P['$getRouteName']>().returns.toBeString()
    expectTypeOf<RouteArg>().toEqualTypeOf<Parameters<P['$getLocale']>[0]>()

    expectTypeOf<P['$resolveTranslations']>().toEqualTypeOf<() => Translations>()
    expectTypeOf<P['$setTranslation']>().parameters.toEqualTypeOf<[string, unknown]>()
    expectTypeOf<P['$setTranslation']>().returns.toEqualTypeOf<void>()
  })

  /**
   * `NuxtAppOnlyInjections` describes helpers provided elsewhere — `$clearCache` by the plugin
   * API factory, `$defineI18nRoute` by `03.define` — and exists to generate the reference page:
   * a drifted signature documents a call that does not compile. Kept out of useI18n().
   */
  it('NuxtAppOnlyInjections follows what is actually provided', () => {
    type PluginApi = ReturnType<typeof createNuxtI18nPluginApi>['provide']
    expectTypeOf<NuxtAppOnlyInjections['$clearCache']>().toEqualTypeOf<PluginApi['clearCache']>()
    expectTypeOf<NuxtAppOnlyInjections['$defineI18nRoute']>().toEqualTypeOf<(config: DefineI18nRouteConfig) => Promise<void>>()
    expectTypeOf<keyof NuxtAppOnlyInjections>().toEqualTypeOf<'$defineI18nRoute' | '$clearCache'>()
  })
})
