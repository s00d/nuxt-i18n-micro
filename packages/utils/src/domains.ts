import type { Locale, ModuleOptionsExtend } from '@i18n-micro/types'

const normalizeHost = (host: string) =>
  host
    .trim()
    .toLowerCase()
    .replace(/:(?:80|443)$/, '')

function hostOf(locale: Locale): string | null {
  if (!locale.baseUrl) return null
  try {
    return normalizeHost(new URL(locale.baseUrl).host)
  } catch {
    return null
  }
}

function localesByHost(locales: Locale[]): Map<string, Locale[]> {
  const hosts = new Map<string, Locale[]>()
  for (const locale of locales) {
    const host = hostOf(locale)
    if (host) hosts.set(host, [...(hosts.get(host) ?? []), locale])
  }
  return hosts
}

/** Everything a host answers for: its own locales, locales with no domain, disabled ones (a 404, not another domain's link). */
const servedOn = (host: string, locales: Locale[]) =>
  locales.filter((locale) => {
    const own = hostOf(locale)
    return !own || own === host || locale.disabled
  })

/** `baseDefault` of the host, else the build default when the host serves it, else its first locale. */
function hostDefault(own: Locale[], served: Locale[], defaultLocale: string | undefined): string | undefined {
  const enabled = own.filter((locale) => !locale.disabled)
  const fixed = enabled.find((locale) => locale.baseDefault)
  if (fixed) return fixed.code
  if (served.some((locale) => locale.code === defaultLocale && !locale.disabled)) return defaultLocale
  return (enabled[0] ?? served.find((locale) => !locale.disabled))?.code
}

/** `locales` with `baseDefault` on the default of every host, whether the config named it or not. */
export function withHostDefaults(locales: Locale[], defaultLocale: string): Locale[] {
  const codes = new Set<string>()
  for (const [host, own] of localesByHost(locales)) {
    const code = hostDefault(own, servedOn(host, locales), defaultLocale)
    // a locale with no domain is no host's own
    if (own.some((locale) => locale.code === code)) codes.add(code!)
  }
  return locales.map((locale) => (codes.has(locale.code) && !locale.baseDefault ? { ...locale, baseDefault: true } : locale))
}

function buildHostConfigs(config: ModuleOptionsExtend): Map<string, ModuleOptionsExtend> {
  const configs = new Map<string, ModuleOptionsExtend>()
  // ponytail: silent, unlike pinDefault; this runs in the browser too, and the docs state it
  const pinned = config.strategy === 'prefix_except_default' || config.strategy === 'prefix_and_default'
  const locales = (config.locales ?? []).map((locale) => (pinned && locale.baseDefault && locale.disabled ? { ...locale, disabled: false } : locale))
  for (const [host, own] of localesByHost(locales)) {
    const served = servedOn(host, locales)
    configs.set(host, {
      ...config,
      domain: host,
      locales: served,
      linkLocales: locales,
      // every locale of the host disabled: it serves nothing, and still not another domain's
      defaultLocale: hostDefault(own, served, config.defaultLocale) ?? config.defaultLocale,
      // the configured origin, never the request's
      metaBaseUrl: own[0]!.baseUrl!.replace(/\/+$/, ''),
    })
  }
  return configs
}

const hostConfigs = new WeakMap<ModuleOptionsExtend, Map<string, ModuleOptionsExtend>>()

/**
 * `config` as `host` sees it: its default, its locales, its origin. Any other host gets `config`
 * itself and nothing of the request is kept or echoed: the table holds configured hosts only, one
 * per resolved config (immutable, so it cannot go stale).
 */
export function configForHost(config: ModuleOptionsExtend, host: string): ModuleOptionsExtend {
  let configs = hostConfigs.get(config)
  if (!configs) hostConfigs.set(config, (configs = buildHostConfigs(config)))
  return configs.get(normalizeHost(host)) ?? config
}
