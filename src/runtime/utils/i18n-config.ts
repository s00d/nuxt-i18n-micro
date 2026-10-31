import type { ModuleOptionsExtend } from '@i18n-micro/types'
import {
  applyI18nRuntimeOverrides,
  createI18nConfigResolver,
  readI18nRuntimeOverrides,
  type RuntimeI18nOverrides,
} from '@i18n-micro/utils/runtime-config'
import { useState } from '#app/composables/state'
import type { NuxtApp } from '#app/nuxt'
import { configForHost } from '@i18n-micro/utils/domains'
import { domains, getI18nConfig } from '#build/i18n.strategy.mjs'

/** One resolved config per app (one per SSR request, one in the browser). */
const configs = new WeakMap<NuxtApp, ModuleOptionsExtend>()

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
  }
}

/**
 * What the browser has to be told, or null when the server resolved what the build says. By value:
 * Nitro and the app bundle each hold their own copy of the build config, so `config !== base` is always true.
 */
export function shippedOverrides(config: ModuleOptionsExtend, base: ModuleOptionsExtend): Shipped | null {
  const shipped = overridesOf(config)
  const built = overridesOf(base)
  const same =
    shipped.defaultLocale === built.defaultLocale &&
    shipped.fallbackLocale === built.fallbackLocale &&
    shipped.domain === built.domain &&
    String(shipped.disabledLocales) === String(built.disabledLocales)
  return same ? null : shipped
}

function resolve(nuxtApp: NuxtApp): ModuleOptionsExtend {
  const base = getI18nConfig() as ModuleOptionsExtend
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
export function useResolvedI18nConfig(nuxtApp: NuxtApp): ModuleOptionsExtend {
  let config = configs.get(nuxtApp)
  if (!config) configs.set(nuxtApp, (config = resolve(nuxtApp)))
  return config
}
