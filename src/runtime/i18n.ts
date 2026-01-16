import { BaseI18n } from '@i18n-micro/core'
import type { RouteService, BaseI18nOptions } from '@i18n-micro/core'
import type { Locale, MissingHandler, I18nRouteParams, TranslationKey, Params, CleanTranslation } from '@i18n-micro/types'
import type { RouteLocationNormalizedLoaded, RouteLocationResolvedGeneric } from 'vue-router'
import type { Ref } from 'vue'

export interface NuxtI18nOptions extends BaseI18nOptions {
  routeService: RouteService
  locales: Ref<Locale[]>
  defaultLocale: Ref<string>
  i18nRouteParams: Ref<I18nRouteParams>
  // References to state for hooks
  customMissingHandler: Ref<MissingHandler | null>
  previousPageInfo: Ref<{ locale: string, routeName: string } | null>
}

export class NuxtI18n extends BaseI18n {
  private _routeService: RouteService
  private _locales: Ref<Locale[]>
  private _defaultLocale: Ref<string>
  private _i18nRouteParams: Ref<I18nRouteParams>

  constructor(options: NuxtI18nOptions) {
    super({
      ...options,
      // Pass hooks through getters that read Ref values
      getCustomMissingHandler: () => options.customMissingHandler.value,
      getPreviousPageInfo: () => options.previousPageInfo.value,
    })

    this._routeService = options.routeService
    this._locales = options.locales
    this._defaultLocale = options.defaultLocale
    this._i18nRouteParams = options.i18nRouteParams
  }

  // --- Implementation of abstract BaseI18n methods ---

  public getLocale(): string {
    // RouteService internally uses router.currentRoute.value, which ensures reactivity
    return this._routeService.getCurrentLocale()
  }

  public getRoute(): string {
    return this._routeService.getPluginRouteName(
      this._routeService.getCurrentRoute(),
      this.getLocale(),
    )
  }

  public getFallbackLocale(): string {
    const currentLocale = this.getLocale()
    const localeData = this._locales.value.find(l => l.code === currentLocale)
    return localeData?.fallbackLocale ?? this._defaultLocale.value
  }

  // --- Override method t to support Route object ---

  public override t(
    key: TranslationKey,
    params?: Params,
    defaultValue?: string | null,
    // In Nuxt plugin, 4th argument can be a route object
    routeOrName?: string | RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric,
    locale?: string,
  ): CleanTranslation {
    let routeName: string | undefined
    let routeLocale: string | undefined

    if (routeOrName && typeof routeOrName === 'object') {
      // If route object is passed, calculate context for it
      routeLocale = this._routeService.getCurrentLocale(routeOrName)
      routeName = this._routeService.getPluginRouteName(routeOrName, routeLocale)
    }
    else {
      routeName = routeOrName as string
      // locale is taken from this.getLocale() inside super.t if not explicitly passed
    }

    // Call updated BaseI18n.t with 5th argument
    return super.t(key, params, defaultValue, routeName, locale || routeLocale)
  }

  // --- Override method has to support Route object ---

  public override has(
    key: TranslationKey,
    // In Nuxt plugin, 2nd argument can be a route object
    routeOrName?: string | RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric,
  ): boolean {
    let routeName: string | undefined

    if (routeOrName && typeof routeOrName === 'object') {
      // If route object is passed, calculate context for it
      const routeLocale = this._routeService.getCurrentLocale(routeOrName)
      routeName = this._routeService.getPluginRouteName(routeOrName, routeLocale)
    }
    else {
      routeName = routeOrName as string
    }

    // Call BaseI18n.has with routeName
    return super.has(key, routeName)
  }

  // --- Proxy RouteService methods (optional, for convenience) ---

  public switchLocale(toLocale: string) {
    // Important: clear compiled cache when switching locale
    this.clearCompiledCache()
    return this._routeService.switchLocaleLogic(toLocale, this._i18nRouteParams.value)
  }
}
