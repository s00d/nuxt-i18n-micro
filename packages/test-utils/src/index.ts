import { createI18nTestContext, I18nTestContext, type CreateFakeI18nOptions, type ResetI18nOptions } from './context'

export type {
  CreateFakeI18nOptions,
  CreateI18nTestContextOptions,
  Getter,
  Locale,
  LocaleCode,
  ResetI18nOptions,
  SpyFn,
  TestStrategy,
} from './context'

export { createI18nTestContext, I18nTestContext } from './context'

/** Shared module context — backs `t` / `resetI18n` / `i18nUtils` (backward compatible). */
const shared = createI18nTestContext()

/**
 * Reset the shared mock state and clear the translation cache.
 * Call from `beforeEach` so tests do not leak dictionaries/locales.
 * For isolated harnesses, use the `reset` returned by {@link setupNuxtI18nMock} / {@link createIsolatedFakeI18n}.
 */
export function resetI18n(options: ResetI18nOptions = {}): void {
  shared.reset(options)
}

export function t(...args: Parameters<I18nTestContext['t']>) {
  return shared.t(...args)
}

export function tc(...args: Parameters<I18nTestContext['tc']>) {
  return shared.tc(...args)
}

export function ts(...args: Parameters<I18nTestContext['ts']>) {
  return shared.ts(...args)
}

export function _t(...args: Parameters<I18nTestContext['_t']>) {
  return shared._t(...args)
}

export function _ts(...args: Parameters<I18nTestContext['_ts']>) {
  return shared._ts(...args)
}

export async function setTranslationsFromJson(...args: Parameters<I18nTestContext['setTranslationsFromJson']>) {
  return shared.setTranslationsFromJson(...args)
}

export async function loadPageTranslations(...args: Parameters<I18nTestContext['loadPageTranslations']>) {
  return shared.loadPageTranslations(...args)
}

export const getLocale = (...args: Parameters<I18nTestContext['getLocale']>) => shared.getLocale(...args)
export const setLocale = (...args: Parameters<I18nTestContext['setLocale']>) => shared.setLocale(...args)
export const getLocaleName = (...args: Parameters<I18nTestContext['getLocaleName']>) => shared.getLocaleName(...args)
export const setLocaleName = (...args: Parameters<I18nTestContext['setLocaleName']>) => shared.setLocaleName(...args)
export const getLocales = (...args: Parameters<I18nTestContext['getLocales']>) => shared.getLocales(...args)
export const setLocales = (...args: Parameters<I18nTestContext['setLocales']>) => shared.setLocales(...args)
export const defaultLocale = (...args: Parameters<I18nTestContext['defaultLocale']>) => shared.defaultLocale(...args)
export const setDefaultLocale = (...args: Parameters<I18nTestContext['setDefaultLocale']>) => shared.setDefaultLocale(...args)
export const getRouteName = (...args: Parameters<I18nTestContext['getRouteName']>) => shared.getRouteName(...args)
/** @deprecated Typo kept for compatibility — prefer `setRouteName`. */
export const settRouteName = (...args: Parameters<I18nTestContext['settRouteName']>) => shared.settRouteName(...args)
export const setRouteName = (...args: Parameters<I18nTestContext['setRouteName']>) => shared.setRouteName(...args)
export const tn = (...args: Parameters<I18nTestContext['tn']>) => shared.tn(...args)
export const td = (...args: Parameters<I18nTestContext['td']>) => shared.td(...args)
export const tdr = (...args: Parameters<I18nTestContext['tdr']>) => shared.tdr(...args)
export const has = (...args: Parameters<I18nTestContext['has']>) => shared.has(...args)
export const mergeTranslations = (...args: Parameters<I18nTestContext['mergeTranslations']>) => shared.mergeTranslations(...args)
export const resolveTranslations = (...args: Parameters<I18nTestContext['resolveTranslations']>) => shared.resolveTranslations(...args)
export const setTranslation = (...args: Parameters<I18nTestContext['setTranslation']>) => shared.setTranslation(...args)
export const setMissingHandler = (...args: Parameters<I18nTestContext['setMissingHandler']>) => shared.setMissingHandler(...args)
export const getI18nConfig = (...args: Parameters<I18nTestContext['getI18nConfig']>) => shared.getI18nConfig(...args)
export const localePath = (...args: Parameters<I18nTestContext['localePath']>) => shared.localePath(...args)
export const switchLocalePath = (...args: Parameters<I18nTestContext['switchLocalePath']>) => shared.switchLocalePath(...args)
export const localeRoute = (...args: Parameters<I18nTestContext['localeRoute']>) => shared.localeRoute(...args)
export const switchLocaleRoute = (...args: Parameters<I18nTestContext['switchLocaleRoute']>) => shared.switchLocaleRoute(...args)
export const switchLocale = (...args: Parameters<I18nTestContext['switchLocale']>) => shared.switchLocale(...args)
export const switchRoute = (...args: Parameters<I18nTestContext['switchRoute']>) => shared.switchRoute(...args)
export const setI18nRouteParams = (...args: Parameters<I18nTestContext['setI18nRouteParams']>) => shared.setI18nRouteParams(...args)

/** Minimal strategy stub so `useI18n().$i18nStrategy` does not throw. */
export const i18nStrategy = shared.i18nStrategy

function applySharedFactoryOptions(options: CreateFakeI18nOptions): void {
  const { spy: _spy, isolated: _isolated, ...resetOptions } = options
  if (
    resetOptions.locale !== undefined ||
    resetOptions.defaultLocale !== undefined ||
    resetOptions.localeName !== undefined ||
    resetOptions.locales !== undefined ||
    resetOptions.routeName !== undefined ||
    resetOptions.strategy !== undefined ||
    resetOptions.translations !== undefined ||
    resetOptions.messages !== undefined
  ) {
    shared.reset(resetOptions)
  }
}

/**
 * Build a `useI18n()`-shaped mock for `mockNuxtImport('useI18n', …)`.
 * Includes `$…` methods, bare aliases (`t` / `$t`), `helper`, and test setters.
 *
 * Pass `isolated: true` (or use {@link createIsolatedFakeI18n} / {@link setupNuxtI18nMock})
 * for a private translation cache.
 */
export function createFakeI18n(options: CreateFakeI18nOptions = {}) {
  if (options.isolated) {
    return createI18nTestContext({ ...options, isolated: true }).createFake(options.spy)
  }
  applySharedFactoryOptions(options)
  return shared.createFake(options.spy)
}

export interface IsolatedFakeI18n {
  i18n: ReturnType<I18nTestContext['createFake']>
  context: I18nTestContext
  reset: I18nTestContext['reset']
  setTranslationsFromJson: I18nTestContext['setTranslationsFromJson']
}

/** Isolated fake + bound helpers (does not touch the shared module cache). */
export function createIsolatedFakeI18n(options: CreateFakeI18nOptions = {}): IsolatedFakeI18n {
  const context = createI18nTestContext({ ...options, isolated: true })
  return {
    i18n: context.createFake(options.spy),
    context,
    reset: context.reset.bind(context),
    setTranslationsFromJson: context.setTranslationsFromJson.bind(context),
  }
}

export interface SetupNuxtI18nMockOptions extends CreateFakeI18nOptions {
  /**
   * Vitest `beforeEach`. When provided, registers an auto-reset that reseeds
   * factory `translations` / `messages`.
   */
  beforeEach?: (fn: () => void) => void
  /** @default true when `beforeEach` is passed */
  autoReset?: boolean
}

export interface NuxtI18nMockHarness extends IsolatedFakeI18n {
  /**
   * Replacement for Nuxt `useI18n`. Pass to:
   * `mockNuxtImport('useI18n', () => useI18n)`
   * (keep `mockNuxtImport` in your setup file so `@nuxt/test-utils` can transform it).
   */
  useI18n: () => ReturnType<I18nTestContext['createFake']>
}

/**
 * One-call harness for Nuxt unit tests: isolated fake, optional `beforeEach` reset,
 * and a `useI18n` factory for `mockNuxtImport`.
 *
 * @example
 * ```ts
 * import { setupNuxtI18nMock } from '@i18n-micro/test-utils'
 * import { mockNuxtImport } from '@nuxt/test-utils/runtime'
 * import { beforeEach, vi } from 'vitest'
 *
 * const { i18n, useI18n, setTranslationsFromJson } = setupNuxtI18nMock({
 *   spy: vi.fn,
 *   beforeEach,
 *   translations: { welcome: 'Welcome' },
 * })
 *
 * mockNuxtImport('useI18n', () => useI18n)
 * export { i18n, setTranslationsFromJson }
 * ```
 */
export function setupNuxtI18nMock(options: SetupNuxtI18nMockOptions = {}): NuxtI18nMockHarness {
  const { beforeEach: registerBeforeEach, autoReset = true, spy, ...contextOptions } = options
  const context = createI18nTestContext({ ...contextOptions, isolated: true })
  const i18n = context.createFake(spy)
  const useI18n = spy ? (spy(() => i18n) as () => typeof i18n) : () => i18n

  if (registerBeforeEach && autoReset) {
    registerBeforeEach(() => {
      context.reset({ reseed: true })
    })
  }

  return {
    i18n,
    context,
    useI18n,
    reset: context.reset.bind(context),
    setTranslationsFromJson: context.setTranslationsFromJson.bind(context),
  }
}

export const i18nUtils = {
  t,
  tc,
  ts,
  tn,
  td,
  tdr,
  has,
  resetI18n,
  createFakeI18n,
  createIsolatedFakeI18n,
  setupNuxtI18nMock,
  createI18nTestContext,
  setTranslationsFromJson,
  loadPageTranslations,
  setMissingHandler,
  getI18nConfig,
  i18nStrategy,
  getLocale,
  setLocale,
  getLocaleName,
  setLocaleName,
  getLocales,
  setLocales,
  defaultLocale,
  setDefaultLocale,
  getRouteName,
  settRouteName,
  setRouteName,
  _t,
  _ts,
  mergeTranslations,
  resolveTranslations,
  setTranslation,
  switchLocaleRoute,
  switchLocalePath,
  switchLocale,
  switchRoute,
  localeRoute,
  localePath,
  setI18nRouteParams,
}
