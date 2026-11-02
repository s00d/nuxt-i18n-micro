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

/** `target` with its methods bound, for destructuring. */
function bound<T extends object>(target: T): T {
  return new Proxy(target, {
    get(object, key) {
      const value = Reflect.get(object, key)
      return typeof value === 'function' ? value.bind(object) : value
    },
  })
}

export const {
  t,
  tc,
  ts,
  _t,
  _ts,
  setTranslationsFromJson,
  loadPageTranslations,
  getLocale,
  setLocale,
  getLocaleName,
  setLocaleName,
  getLocales,
  setLocales,
  defaultLocale,
  setDefaultLocale,
  getRouteName,
  setRouteName,
  tn,
  td,
  tdr,
  has,
  mergeTranslations,
  resolveTranslations,
  setTranslation,
  setMissingHandler,
  getI18nConfig,
  localePath,
  switchLocalePath,
  localeRoute,
  switchLocaleRoute,
  switchLocale,
  switchRoute,
  setI18nRouteParams,
} = bound(shared)

/** Minimal strategy stub so `useI18n().$i18nStrategy` does not throw. */
export const i18nStrategy = shared.i18nStrategy

function applySharedFactoryOptions(options: CreateFakeI18nOptions): void {
  const { spy: _spy, isolated: _isolated, ...resetOptions } = options
  if (Object.values(resetOptions).some((value) => value !== undefined)) shared.reset(resetOptions)
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
    return createI18nTestContext(options).createFake(options.spy)
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
  const context = createI18nTestContext(options)
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
  const context = createI18nTestContext(contextOptions)
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
