import type { ModuleOptionsExtend } from '@i18n-micro/types'
import {
  applyI18nRuntimeOverrides,
  createI18nConfigResolver,
  readI18nRuntimeOverrides,
  type RuntimeI18nOverrides,
} from '@i18n-micro/utils/runtime-config'
import { type NuxtApp, useState } from '#app'
import { getI18nConfig } from '#build/i18n.strategy.mjs'

/** One resolved config per app (one per SSR request, one in the browser). */
const configs = new WeakMap<NuxtApp, ModuleOptionsExtend>()

/** Server renders without the Nitro middleware's config (no context): the same memo, env read once. */
const resolveOnServer = import.meta.server ? createI18nConfigResolver() : undefined

const silent = () => {}

/** The overrides the server applied, as plain values: the browser has no env to read them from. */
function overridesOf(config: ModuleOptionsExtend): RuntimeI18nOverrides {
  return {
    defaultLocale: config.defaultLocale,
    fallbackLocale: config.fallbackLocale,
    disabledLocales: (config.locales ?? []).filter((locale) => locale.disabled).map((locale) => locale.code),
  }
}

function resolve(nuxtApp: NuxtApp): ModuleOptionsExtend {
  const base = getI18nConfig() as ModuleOptionsExtend
  const shipped = useState<RuntimeI18nOverrides | null>('i18n-runtime-overrides', () => null)
  if (import.meta.server) {
    // the Nitro middleware resolved it for this request (runtimeConfig and env); env reads stay server-side
    const config = nuxtApp.ssrContext?.event?.context?.i18n?.config ?? resolveOnServer!(base, nuxtApp.$config.public as Record<string, unknown>)
    if (config !== base) shipped.value = overridesOf(config)
    return config
  }
  // a server-rendered page: exactly what the server applied (it already warned); a client-only one resolves itself
  if (nuxtApp.payload.serverRendered) return shipped.value ? applyI18nRuntimeOverrides(base, shipped.value, silent) : base
  return applyI18nRuntimeOverrides(base, readI18nRuntimeOverrides(nuxtApp.$config.public as Record<string, unknown>))
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
