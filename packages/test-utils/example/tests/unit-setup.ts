import { i18nUtils } from "@i18n-micro/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { vi } from "vitest";

export function createFakeI18n() {
  return {
    $getLocale: vi.fn<typeof i18nUtils.getLocale>(i18nUtils.getLocale),
    $t: vi.fn<typeof i18nUtils.t>(i18nUtils.t),
    $tc: vi.fn<typeof i18nUtils.tc>(i18nUtils.tc),
    $setLocale: vi.fn<typeof i18nUtils.setLocale>(i18nUtils.setLocale),
    $getLocaleName: vi.fn<typeof i18nUtils.getLocaleName>(i18nUtils.getLocaleName),
    $setLocaleName: vi.fn<typeof i18nUtils.setLocaleName>(i18nUtils.setLocaleName),
    $getLocales: vi.fn<typeof i18nUtils.getLocales>(i18nUtils.getLocales),
    $setLocales: vi.fn<typeof i18nUtils.setLocales>(i18nUtils.setLocales),
    $defaultLocale: vi.fn<typeof i18nUtils.defaultLocale>(i18nUtils.defaultLocale),
    $setDefaultLocale: vi.fn<typeof i18nUtils.setDefaultLocale>(i18nUtils.setDefaultLocale),
    $getRouteName: vi.fn<typeof i18nUtils.getRouteName>(i18nUtils.getRouteName),
    $settRouteName: vi.fn<typeof i18nUtils.settRouteName>(i18nUtils.settRouteName),
    $ts: vi.fn<typeof i18nUtils.ts>(i18nUtils.ts),
    $tn: vi.fn<typeof i18nUtils.tn>(i18nUtils.tn),
    $td: vi.fn<typeof i18nUtils.td>(i18nUtils.td),
    $has: vi.fn<typeof i18nUtils.has>(i18nUtils.has),
    $mergeTranslations: vi.fn<typeof i18nUtils.mergeTranslations>(i18nUtils.mergeTranslations),
    $switchLocaleRoute: vi.fn<typeof i18nUtils.switchLocaleRoute>(i18nUtils.switchLocaleRoute),
    $switchLocalePath: vi.fn<typeof i18nUtils.switchLocalePath>(i18nUtils.switchLocalePath),
    $switchLocale: vi.fn<typeof i18nUtils.switchLocale>(i18nUtils.switchLocale),
    $switchRoute: vi.fn<typeof i18nUtils.switchRoute>(i18nUtils.switchRoute),
    $localeRoute: vi.fn<typeof i18nUtils.localeRoute>(i18nUtils.localeRoute),
    $localePath: vi.fn<typeof i18nUtils.localePath>(i18nUtils.localePath),
    $setI18nRouteParams: vi.fn<typeof i18nUtils.setI18nRouteParams>(i18nUtils.setI18nRouteParams),
  };
}

mockNuxtImport<() => ReturnType<typeof createFakeI18n>>("useI18n", () =>
  vi.fn<() => ReturnType<typeof createFakeI18n>>(() => createFakeI18n()),
);

export const setTranslationsFromJson = i18nUtils.setTranslationsFromJson;
