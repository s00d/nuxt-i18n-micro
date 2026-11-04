import type { ModuleOptionsExtend } from '@i18n-micro/types'

export interface RuntimeI18nOverrides {
  defaultLocale?: string
  fallbackLocale?: string
  disabledLocales?: string[]
  strategy?: string
  /** A new `?v=` with no rebuild: for dictionaries replaced in place. Restart to apply, as for any env. */
  dateBuild?: string
  /** SEO origin (canonical, hreflang) in place of the build's `metaBaseUrl`. */
  metaBaseUrl?: string
  /** `locales[].baseUrl` by locale code. Only in a build that has locale domains: routing for them is built in. */
  localeBaseUrls?: Record<string, string>
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

/** `code=url` → `[code, url]`; the URL keeps any `=` of its own. */
function splitPair(entry: string): [string, string] {
  const at = entry.indexOf('=')
  return at < 0 ? [entry, ''] : [entry.slice(0, at), entry.slice(at + 1)]
}

/** `'de=https://de.example.com,fr=…'` or `{ de: 'https://de.example.com' }`. `__proto__` is no locale code. */
function parseBaseUrls(value: unknown): Record<string, string> | undefined {
  const pairs = typeof value === 'string' ? value.split(',').map(splitPair) : value && typeof value === 'object' ? Object.entries(value) : []
  const urls: Record<string, string> = {}
  for (const [rawCode, rawUrl] of pairs) {
    const code = toNonEmptyString(rawCode)
    const url = toNonEmptyString(rawUrl)
    if (code && url && code !== '__proto__') urls[code] = url
  }
  return Object.keys(urls).length > 0 ? urls : undefined
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
    dateBuild: toNonEmptyString(env.NUXT_I18N_DATE_BUILD) ?? toNonEmptyString(env.NUXT_PUBLIC_I18N_RUNTIME_DATE_BUILD),
    metaBaseUrl: toNonEmptyString(env.NUXT_I18N_META_BASE_URL) ?? toNonEmptyString(env.NUXT_PUBLIC_I18N_RUNTIME_META_BASE_URL),
    localeBaseUrls: parseBaseUrls(env.NUXT_I18N_LOCALE_BASE_URLS) ?? parseBaseUrls(env.NUXT_PUBLIC_I18N_RUNTIME_LOCALE_BASE_URLS),
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
    dateBuild: toNonEmptyString(runtime.dateBuild),
    metaBaseUrl: toNonEmptyString(runtime.metaBaseUrl),
  }
}

/**
 * `runtimeConfig.public.i18nRuntime.localeBaseUrls`. Apart from `readI18nRuntimeOverrides`: only a build with
 * locale domains reads it, so a browser bundle without them drops the parser.
 */
export function readLocaleBaseUrls(runtimePublic?: Record<string, unknown>): Record<string, string> | undefined {
  const raw = runtimePublic?.i18nRuntime
  return raw && typeof raw === 'object' ? parseBaseUrls((raw as Record<string, unknown>).localeBaseUrls) : undefined
}

/** `primary`'s values, `secondary`'s where `primary` has none. */
export function mergeI18nOverrides(primary: RuntimeI18nOverrides, secondary: RuntimeI18nOverrides): RuntimeI18nOverrides {
  return {
    defaultLocale: primary.defaultLocale ?? secondary.defaultLocale,
    fallbackLocale: primary.fallbackLocale ?? secondary.fallbackLocale,
    disabledLocales: primary.disabledLocales ?? secondary.disabledLocales,
    strategy: primary.strategy ?? secondary.strategy,
    dateBuild: primary.dateBuild ?? secondary.dateBuild,
    metaBaseUrl: primary.metaBaseUrl ?? secondary.metaBaseUrl,
    localeBaseUrls: primary.localeBaseUrls ?? secondary.localeBaseUrls,
  }
}

/** A stable string of the overrides: equal strings resolve to equal configs. */
export function i18nOverridesKey(overrides: RuntimeI18nOverrides): string {
  return `${overrides.defaultLocale ?? ''}\0${overrides.fallbackLocale ?? ''}\0${overrides.disabledLocales?.join(',') ?? ''}\0${overrides.strategy ?? ''}\0${overrides.dateBuild ?? ''}\0${overrides.metaBaseUrl ?? ''}\0${JSON.stringify(overrides.localeBaseUrls ?? null)}`
}

const defaultWarn = (message: string) => console.warn(message)

/**
 * The build config with runtime overrides applied. Runtime `disabledLocales` add to the
 * build-time disabled ones (a locale disabled at build has no payloads to re-enable);
 * `defaultLocale` and `fallbackLocale` must be enabled. No env reads: see `readI18nEnvOverrides`.
 * When nothing changes, the build config itself is returned (a disabled build default is still replaced).
 */
export function applyI18nRuntimeOverrides<T extends ModuleOptionsExtend>(
  baseConfig: T,
  requested: RuntimeI18nOverrides,
  warn: (message: string) => void = defaultWarn,
): T {
  if (requested.strategy && requested.strategy !== baseConfig.strategy) {
    warn(
      `[nuxt-i18n-micro] runtime i18n strategy override is ignored: ` +
        `"${requested.strategy}" (build strategy: "${baseConfig.strategy}"). ` +
        `Build a separate artifact for each strategy.`,
    )
  }

  const overrides = pinDefault(baseConfig, requested, warn)
  const disabledSet = new Set(overrides.disabledLocales ?? [])
  let locales = (baseConfig.locales ?? []).map((locale) => (disabledSet.has(locale.code) ? Object.assign({}, locale, { disabled: true }) : locale))
  if (disabledSet.size > 0 && !locales.some((locale) => !locale.disabled)) {
    warn('[nuxt-i18n-micro] runtime disabledLocales override would disable all locales; override ignored.')
    locales = baseConfig.locales ?? []
  }

  const enabledCodes = new Set(locales.filter((locale) => !locale.disabled).map((locale) => locale.code))
  const defaultLocale = enabledDefault(baseConfig, overrides, enabledCodes, warn)
  const fallbackLocale = enabledFallback(baseConfig, overrides, enabledCodes, warn)
  const dateBuild = overrides.dateBuild ?? baseConfig.dateBuild
  const metaBaseUrl = overrides.metaBaseUrl ?? baseConfig.metaBaseUrl
  const same =
    defaultLocale === baseConfig.defaultLocale &&
    fallbackLocale === baseConfig.fallbackLocale &&
    dateBuild === baseConfig.dateBuild &&
    metaBaseUrl === baseConfig.metaBaseUrl
  if (same && locales.every((locale, i) => locale === baseConfig.locales?.[i])) return baseConfig
  return { ...baseConfig, locales, defaultLocale, fallbackLocale, dateBuild, metaBaseUrl } as T
}

const isUrl = (value: string | undefined) => {
  try {
    return Boolean(value && new URL(value).host)
  } catch {
    return false
  }
}

/**
 * `config` with the runtime `locales[].baseUrl`s, after `applyI18nRuntimeOverrides`. A build without
 * locale domains has no routing for them (the path strategy is chosen at build): ignored there, like
 * `strategy`. Apart, so that a browser bundle without domains drops it. A `metaBaseUrl` the build took
 * from the default locale's `baseUrl` follows it, unless one is set at runtime.
 */
export function applyLocaleBaseUrls<T extends ModuleOptionsExtend>(
  config: T,
  overrides: RuntimeI18nOverrides,
  warn: (message: string) => void = defaultWarn,
): T {
  const urls = overrides.localeBaseUrls
  const locales = config.locales ?? []
  if (!urls) return config
  if (!locales.some((locale) => locale.baseUrl)) {
    warn('[nuxt-i18n-micro] runtime localeBaseUrls ignored: the build has no locales[].baseUrl.')
    return config
  }
  const own = (code: string) => (Object.prototype.hasOwnProperty.call(urls, code) ? urls[code] : undefined)
  const ignored = Object.keys(urls).filter((code) => !locales.some((locale) => locale.code === code) || !isUrl(urls[code]))
  if (ignored.length) warn(`[nuxt-i18n-micro] runtime localeBaseUrls ignored for ${ignored.join(', ')}: no such locale, or no absolute URL.`)
  const moved = locales.map((locale) => {
    const url = own(locale.code)
    return isUrl(url) && url !== locale.baseUrl ? Object.assign({}, locale, { baseUrl: url }) : locale
  })
  if (moved.every((locale, i) => locale === locales[i])) return config
  const derived = config.metaBaseUrlFromLocale && overrides.metaBaseUrl === undefined
  const metaBaseUrl = derived ? (moved.find((locale) => locale.code === config.defaultLocale)?.baseUrl ?? config.metaBaseUrl) : config.metaBaseUrl
  return { ...config, locales: moved, metaBaseUrl }
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
  const ignored = [moved && `defaultLocale "${overrides.defaultLocale}"`, disabled && `disabledLocales entry "${pinned}"`].filter(Boolean)
  warn(`[nuxt-i18n-micro] runtime ${ignored.join(' and ')} ignored: under ${base.strategy} the default locale "${pinned}" is fixed at build.`)
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

const isDev = () => {
  try {
    return process.env.NODE_ENV !== 'production'
  } catch {
    return false
  }
}

/** Deep-freezes plain objects and arrays, in place. A RegExp stays writable: `lastIndex` is its state. */
function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object' || value instanceof RegExp || Object.isFrozen(value)) return value
  Object.freeze(value)
  for (const key of Object.keys(value)) deepFreeze((value as Record<string, unknown>)[key])
  return value
}

/**
 * `applyI18nRuntimeOverrides` with `runtimeConfig.public.i18nRuntime` first, then env vars, memoized
 * for one process: env is read once, and the same config object answers while the base config and the overrides are unchanged (so warnings
 * are logged once). That object is shared by every request: in dev it is deep-frozen, so a
 * mutation throws instead of leaking into later requests.
 */
export function createI18nConfigResolver(
  warn: (message: string) => void = defaultWarn,
): <T extends ModuleOptionsExtend>(baseConfig: T, runtimePublic?: Record<string, unknown>) => T {
  let env: RuntimeI18nOverrides | undefined
  let memo: { base: ModuleOptionsExtend; key: string; config: ModuleOptionsExtend } | undefined
  return <T extends ModuleOptionsExtend>(base: T, runtimePublic?: Record<string, unknown>): T => {
    env ??= readI18nEnvOverrides()
    const overrides = mergeI18nOverrides({ ...readI18nRuntimeOverrides(runtimePublic), localeBaseUrls: readLocaleBaseUrls(runtimePublic) }, env)
    const key = i18nOverridesKey(overrides)
    if (memo && memo.base === base && memo.key === key) return memo.config as T
    const config = applyLocaleBaseUrls(applyI18nRuntimeOverrides(base, overrides, warn), overrides, warn)
    memo = { base, key, config: isDev() ? deepFreeze(config) : config }
    return memo.config as T
  }
}
