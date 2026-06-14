import type { Locale, ModuleOptionsExtend } from '@i18n-micro/types'

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

function readEnvOverrides(): RuntimeI18nOverrides {
  return {
    defaultLocale: toNonEmptyString(process.env.NUXT_I18N_DEFAULT_LOCALE) ?? toNonEmptyString(process.env.NUXT_PUBLIC_I18N_RUNTIME_DEFAULT_LOCALE),
    fallbackLocale: toNonEmptyString(process.env.NUXT_I18N_FALLBACK_LOCALE) ?? toNonEmptyString(process.env.NUXT_PUBLIC_I18N_RUNTIME_FALLBACK_LOCALE),
    disabledLocales:
      parseLocalesList(process.env.NUXT_I18N_DISABLED_LOCALES) ?? parseLocalesList(process.env.NUXT_PUBLIC_I18N_RUNTIME_DISABLED_LOCALES),
    strategy: toNonEmptyString(process.env.NUXT_I18N_STRATEGY) ?? toNonEmptyString(process.env.NUXT_PUBLIC_I18N_RUNTIME_STRATEGY),
  }
}

function readRuntimeOverrides(runtimePublic?: Record<string, unknown>): RuntimeI18nOverrides {
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

function mergeOverrides(runtimePublic?: Record<string, unknown>): RuntimeI18nOverrides {
  const env = readEnvOverrides()
  const runtime = readRuntimeOverrides(runtimePublic)
  return {
    defaultLocale: runtime.defaultLocale ?? env.defaultLocale,
    fallbackLocale: runtime.fallbackLocale ?? env.fallbackLocale,
    disabledLocales: runtime.disabledLocales ?? env.disabledLocales,
    strategy: runtime.strategy ?? env.strategy,
  }
}

export function resolveI18nConfigWithRuntimeOverrides(
  baseConfig: ModuleOptionsExtend,
  runtimePublic?: Record<string, unknown>,
  warn: (message: string) => void = (message) => console.warn(message),
): ModuleOptionsExtend {
  const overrides = mergeOverrides(runtimePublic)
  const locales = (baseConfig.locales ?? []).map((locale) => ({ ...locale }))

  if (overrides.strategy && overrides.strategy !== baseConfig.strategy) {
    warn(
      `[nuxt-i18n-micro] runtime i18n strategy override is ignored: ` +
        `"${overrides.strategy}" (build strategy: "${baseConfig.strategy}"). ` +
        `Build a separate artifact for each strategy.`,
    )
  }

  if (overrides.disabledLocales && overrides.disabledLocales.length > 0) {
    const disabledSet = new Set(overrides.disabledLocales)
    for (const locale of locales) {
      locale.disabled = disabledSet.has(locale.code)
    }
  }

  const enabledLocales = locales.filter((locale) => !locale.disabled)
  if (enabledLocales.length === 0) {
    if (overrides.disabledLocales && overrides.disabledLocales.length > 0) {
      warn('[nuxt-i18n-micro] runtime disabledLocales override would disable all locales; override ignored.')
    }
    return { ...baseConfig, locales: (baseConfig.locales ?? []).map((locale) => ({ ...locale })) }
  }

  const allLocaleCodes = new Set(locales.map((locale) => locale.code))
  let defaultLocale = overrides.defaultLocale ?? baseConfig.defaultLocale
  let fallbackLocale = overrides.fallbackLocale ?? baseConfig.fallbackLocale

  if (fallbackLocale && !allLocaleCodes.has(fallbackLocale)) {
    warn(`[nuxt-i18n-micro] runtime fallbackLocale "${fallbackLocale}" is not defined in locales; override ignored.`)
    fallbackLocale = baseConfig.fallbackLocale
  }

  const enabledLocaleCodes = new Set(enabledLocales.map((locale) => locale.code))
  const firstEnabledLocale = enabledLocales[0]?.code ?? baseConfig.defaultLocale ?? 'en'
  if (!defaultLocale || !enabledLocaleCodes.has(defaultLocale)) {
    if (overrides.defaultLocale) {
      warn(`[nuxt-i18n-micro] runtime defaultLocale "${overrides.defaultLocale}" is not enabled; ` + `falling back to "${firstEnabledLocale}".`)
    } else if (defaultLocale && !enabledLocaleCodes.has(defaultLocale)) {
      warn(`[nuxt-i18n-micro] defaultLocale "${defaultLocale}" is disabled by runtime overrides; ` + `falling back to "${firstEnabledLocale}".`)
    }
    defaultLocale = firstEnabledLocale
  }

  return {
    ...baseConfig,
    locales: locales as Locale[],
    defaultLocale,
    fallbackLocale,
  }
}
