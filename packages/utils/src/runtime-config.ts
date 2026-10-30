import type { ModuleOptionsExtend } from '@i18n-micro/types'

export interface RuntimeI18nOverrides {
  defaultLocale?: string
  fallbackLocale?: string
  disabledLocales?: string[]
  strategy?: string
}

function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

function parseLocalesList(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const items = value.map((entry) => toNonEmptyString(entry)).filter((entry): entry is string => Boolean(entry))
    return items.length > 0 ? items : undefined
  }

  if (typeof value === 'string') {
    const items = value
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
    return items.length > 0 ? items : undefined
  }

  return undefined
}

/** Overrides from `NUXT_I18N_*` / `NUXT_PUBLIC_I18N_RUNTIME_*` env vars (server only: the browser has no env). */
export function readI18nEnvOverrides(): RuntimeI18nOverrides {
  let env: Record<string, string | undefined>
  try {
    env = process.env
  } catch {
    return {}
  }
  return {
    defaultLocale: toNonEmptyString(env.NUXT_I18N_DEFAULT_LOCALE) ?? toNonEmptyString(env.NUXT_PUBLIC_I18N_RUNTIME_DEFAULT_LOCALE),
    fallbackLocale: toNonEmptyString(env.NUXT_I18N_FALLBACK_LOCALE) ?? toNonEmptyString(env.NUXT_PUBLIC_I18N_RUNTIME_FALLBACK_LOCALE),
    disabledLocales: parseLocalesList(env.NUXT_I18N_DISABLED_LOCALES) ?? parseLocalesList(env.NUXT_PUBLIC_I18N_RUNTIME_DISABLED_LOCALES),
    strategy: toNonEmptyString(env.NUXT_I18N_STRATEGY) ?? toNonEmptyString(env.NUXT_PUBLIC_I18N_RUNTIME_STRATEGY),
  }
}

/** Overrides from `runtimeConfig.public.i18nRuntime`. */
export function readI18nRuntimeOverrides(runtimePublic?: Record<string, unknown>): RuntimeI18nOverrides {
  const raw = runtimePublic?.i18nRuntime
  if (!raw || typeof raw !== 'object') return {}
  const runtime = raw as Record<string, unknown>
  return {
    defaultLocale: toNonEmptyString(runtime.defaultLocale),
    fallbackLocale: toNonEmptyString(runtime.fallbackLocale),
    disabledLocales: parseLocalesList(runtime.disabledLocales),
    strategy: toNonEmptyString(runtime.strategy),
  }
}

/** `primary`'s values, `secondary`'s where `primary` has none. */
export function mergeI18nOverrides(primary: RuntimeI18nOverrides, secondary: RuntimeI18nOverrides): RuntimeI18nOverrides {
  return {
    defaultLocale: primary.defaultLocale ?? secondary.defaultLocale,
    fallbackLocale: primary.fallbackLocale ?? secondary.fallbackLocale,
    disabledLocales: primary.disabledLocales ?? secondary.disabledLocales,
    strategy: primary.strategy ?? secondary.strategy,
  }
}

/** A stable string of the overrides: equal strings resolve to equal configs. */
export function i18nOverridesKey(overrides: RuntimeI18nOverrides): string {
  return `${overrides.defaultLocale ?? ''}\0${overrides.fallbackLocale ?? ''}\0${overrides.disabledLocales?.join(',') ?? ''}\0${overrides.strategy ?? ''}`
}

const NO_OVERRIDES = i18nOverridesKey({})

const defaultWarn = (message: string) => console.warn(message)

/**
 * The build config with runtime overrides applied. Runtime `disabledLocales` add to the
 * build-time disabled ones (a locale disabled at build has no payloads to re-enable);
 * `defaultLocale` and `fallbackLocale` must be enabled. No env reads: see `readI18nEnvOverrides`.
 * Without overrides the build config itself is returned.
 */
export function applyI18nRuntimeOverrides(
  baseConfig: ModuleOptionsExtend,
  requested: RuntimeI18nOverrides,
  warn: (message: string) => void = defaultWarn,
): ModuleOptionsExtend {
  if (i18nOverridesKey(requested) === NO_OVERRIDES) return baseConfig

  if (requested.strategy && requested.strategy !== baseConfig.strategy) {
    warn(
      `[nuxt-i18n-micro] runtime i18n strategy override is ignored: ` +
        `"${requested.strategy}" (build strategy: "${baseConfig.strategy}"). ` +
        `Build a separate artifact for each strategy.`,
    )
  }

  const overrides = pinDefault(baseConfig, requested, warn)
  const disabledSet = new Set(overrides.disabledLocales ?? [])
  let locales = (baseConfig.locales ?? []).map((locale) => (disabledSet.has(locale.code) ? { ...locale, disabled: true } : locale))
  if (!locales.some((locale) => !locale.disabled)) {
    warn('[nuxt-i18n-micro] runtime disabledLocales override would disable all locales; override ignored.')
    locales = baseConfig.locales ?? []
  }

  const enabledCodes = new Set(locales.filter((locale) => !locale.disabled).map((locale) => locale.code))
  const defaultLocale = enabledDefault(baseConfig, overrides, enabledCodes, warn)
  const fallbackLocale = enabledFallback(baseConfig, overrides, enabledCodes, warn)
  return { ...baseConfig, locales, defaultLocale, fallbackLocale }
}

const PINNED_DEFAULT = new Set(['prefix_except_default', 'prefix_and_default'])

/**
 * Under prefix_except_default / prefix_and_default the default locale's pages are the unprefixed
 * routes generated at build: moving or disabling it at runtime would leave its URLs to another
 * locale and the build default without routes. Like `strategy`, it needs its own build.
 */
function pinDefault(base: ModuleOptionsExtend, overrides: RuntimeI18nOverrides, warn: (m: string) => void): RuntimeI18nOverrides {
  const pinned = base.defaultLocale
  if (!pinned || !PINNED_DEFAULT.has(base.strategy ?? '')) return overrides
  const moved = overrides.defaultLocale !== undefined && overrides.defaultLocale !== pinned
  const disabled = overrides.disabledLocales?.includes(pinned) ?? false
  if (!moved && !disabled) return overrides
  const what = moved ? `defaultLocale "${overrides.defaultLocale}"` : `disabling "${pinned}"`
  warn(`[nuxt-i18n-micro] runtime ${what} is ignored: under ${base.strategy} the default locale "${pinned}" is fixed at build.`)
  return { ...overrides, defaultLocale: undefined, disabledLocales: overrides.disabledLocales?.filter((code) => code !== pinned) }
}

function enabledDefault(base: ModuleOptionsExtend, overrides: RuntimeI18nOverrides, enabled: Set<string>, warn: (m: string) => void): string {
  const wanted = overrides.defaultLocale ?? base.defaultLocale
  if (wanted && enabled.has(wanted)) return wanted
  const first = enabled.values().next().value ?? base.defaultLocale ?? 'en'
  if (overrides.defaultLocale) {
    warn(`[nuxt-i18n-micro] runtime defaultLocale "${overrides.defaultLocale}" is not enabled; falling back to "${first}".`)
  } else if (wanted) {
    warn(`[nuxt-i18n-micro] defaultLocale "${wanted}" is disabled by runtime overrides; falling back to "${first}".`)
  }
  return first
}

function enabledFallback(
  base: ModuleOptionsExtend,
  overrides: RuntimeI18nOverrides,
  enabled: Set<string>,
  warn: (m: string) => void,
): string | undefined {
  const wanted = overrides.fallbackLocale ?? base.fallbackLocale
  if (!wanted || enabled.has(wanted)) return wanted
  const kept = base.fallbackLocale && enabled.has(base.fallbackLocale) ? base.fallbackLocale : undefined
  warn(`[nuxt-i18n-micro] fallbackLocale "${wanted}" is not an enabled locale; ${kept ? `using "${kept}"` : 'no fallback'}.`)
  return kept
}

/** `applyI18nRuntimeOverrides` with `runtimeConfig.public.i18nRuntime` first, then env vars. */
export function resolveI18nConfigWithRuntimeOverrides(
  baseConfig: ModuleOptionsExtend,
  runtimePublic?: Record<string, unknown>,
  warn: (message: string) => void = defaultWarn,
): ModuleOptionsExtend {
  return applyI18nRuntimeOverrides(baseConfig, mergeI18nOverrides(readI18nRuntimeOverrides(runtimePublic), readI18nEnvOverrides()), warn)
}
