import { i18nUtils } from '@i18n-micro/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { vi } from 'vitest'

export function createFakeI18n() {
  return {
    $getLocale: vi.fn(i18nUtils.getLocale),
    $t: vi.fn(i18nUtils.t),
    $tc: vi.fn(i18nUtils.tc),
    $setLocale: vi.fn(i18nUtils.setLocale),
    $getLocaleName: vi.fn(i18nUtils.getLocaleName),
    $setLocaleName: vi.fn(i18nUtils.setLocaleName),
    $getLocales: vi.fn(i18nUtils.getLocales),
    $setLocales: vi.fn(i18nUtils.setLocales),
    $defaultLocale: vi.fn(i18nUtils.defaultLocale),
    $setDefaultLocale: vi.fn(i18nUtils.setDefaultLocale),
    $getRouteName: vi.fn(i18nUtils.getRouteName),
    $settRouteName: vi.fn(i18nUtils.settRouteName),
    $ts: vi.fn(i18nUtils.ts),
    $tn: vi.fn(i18nUtils.tn),
    $td: vi.fn(i18nUtils.td),
    $has: vi.fn(i18nUtils.has),
    $mergeTranslations: vi.fn(i18nUtils.mergeTranslations),
    $switchLocaleRoute: vi.fn(i18nUtils.switchLocaleRoute),
    $switchLocalePath: vi.fn(i18nUtils.switchLocalePath),
    $switchLocale: vi.fn(i18nUtils.switchLocale),
    $switchRoute: vi.fn(i18nUtils.switchRoute),
    $localeRoute: vi.fn(i18nUtils.localeRoute),
    $localePath: vi.fn(i18nUtils.localePath),
    $setI18nRouteParams: vi.fn(i18nUtils.setI18nRouteParams),
  }
}

mockNuxtImport<() => ReturnType<typeof createFakeI18n>>('useI18n', () => vi.fn(() => createFakeI18n()))

export const setTranslationsFromJson = i18nUtils.setTranslationsFromJson
