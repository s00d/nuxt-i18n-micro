import type { ModuleOptionsExtend, ResolvedI18nConfig } from '@i18n-micro/types'
import {
  applyI18nRuntimeOverrides,
  createI18nConfigResolver,
  readI18nRuntimeOverrides,
  type RuntimeI18nOverrides,
} from '@i18n-micro/utils/runtime-config'
import { useState } from '#app/composables/state'
import type { NuxtApp } from 'nuxt/app'
import { configForHost } from '@i18n-micro/utils/domains'
import { domains, getI18nConfig } from '#build/i18n.strategy.mjs'

/** One resolved config per app (one per SSR request, one in the browser). */
const configs = new WeakMap<NuxtApp, ResolvedI18nConfig>()

/** Server renders without the Nitro middleware's config (no context): the same memo, env read once. */
const resolveOnServer = import.meta.server ? createI18nConfigResolver() : undefined

const silent = () => {}

/** What the server resolved: overrides and the host. */
type Shipped = RuntimeI18nOverrides & { domain?: string }

/** The overrides the server applied, as plain values: the browser has no env to read them from. */
function overridesOf(config: ModuleOptionsExtend): Shipped {
  return {
    defaultLocale: config.defaultLocale,
    fallbackLocale: config.fallbackLocale,
    disabledLocales: (config.locales ?? []).filter((locale) => locale.disabled).map((locale) => locale.code),
    domain: config.domain,
    dateBuild: String(config.dateBuild),
  }
}

/**
 * What the browser has to be told, or null when the server resolved what the build says. By value:
 * Nitro and the app bundle each hold their own copy of the build config, so `config !== base` is always true.
 */
export function shippedOverrides(config: ModuleOptionsExtend, base: ModuleOptionsExtend): Shipped | null {
  const shipped = Object.assign(overridesOf(config), originsOf(config, base))
  const built = overridesOf(base)
  const same =
    shipped.defaultLocale === built.defaultLocale &&
    shipped.fallbackLocale === built.fallbackLocale &&
    shipped.domain === built.domain &&
    shipped.dateBuild === built.dateBuild &&
    String(shipped.disabledLocales) === String(built.disabledLocales) &&
    !shipped.metaBaseUrl &&
    !shipped.localeBaseUrls
  return same ? null : shipped
}

/**
 * The runtime origins, only those that differ from the build. A host config's `metaBaseUrl` is the
 * host's own, which the browser derives again from `domain`: it is no override.
 */
function originsOf(config: ModuleOptionsExtend, base: ModuleOptionsExtend): Pick<Shipped, 'metaBaseUrl' | 'localeBaseUrls'> {
  const origins: Pick<Shipped, 'metaBaseUrl' | 'localeBaseUrls'> = {}
  if (!config.domain && config.metaBaseUrl !== base.metaBaseUrl && config.metaBaseUrl) origins.metaBaseUrl = config.metaBaseUrl
  const built = new Map((base.locales ?? []).map((locale) => [locale.code, locale.baseUrl]))
  const moved = (config.linkLocales ?? config.locales ?? []).filter((locale) => locale.baseUrl && locale.baseUrl !== built.get(locale.code))
  if (moved.length) origins.localeBaseUrls = Object.fromEntries(moved.map((locale) => [locale.code, locale.baseUrl!]))
  return origins
}

function resolve(nuxtApp: NuxtApp): ResolvedI18nConfig {
  const base = getI18nConfig()
  const shipped = useState<Shipped | null>('i18n-runtime-overrides', () => null)
  if (import.meta.server) {
    // the Nitro middleware resolved it for this request (runtimeConfig and env); env reads stay server-side
    const config = nuxtApp.ssrContext?.event?.context?.i18n?.config ?? resolveOnServer!(base, nuxtApp.$config.public as Record<string, unknown>)
    shipped.value = shippedOverrides(config, base)
    return config
  }
  // a server-rendered page: exactly what the server applied (it already warned); a client-only one resolves itself
  if (nuxtApp.payload.serverRendered) {
    const config = shipped.value ? applyI18nRuntimeOverrides(base, shipped.value, silent) : base
    return domains && shipped.value?.domain ? configForHost(config, shipped.value.domain) : config
  }
  const config = applyI18nRuntimeOverrides(base, readI18nRuntimeOverrides(nuxtApp.$config.public as Record<string, unknown>))
  return domains ? configForHost(config, location.host) : config
}

/**
 * The module config with runtime overrides, the same on server and client: routing (the path
 * strategy), validation (`useI18nLocale`) and redirects all read this one.
 */
export function useResolvedI18nConfig(nuxtApp: NuxtApp): ResolvedI18nConfig {
  let config = configs.get(nuxtApp)
  if (!config) configs.set(nuxtApp, (config = resolve(nuxtApp)))
  return config
}
