import type { I18nRouteParams, Locale, ModuleOptionsExtend } from '@i18n-micro/types'
import { mergeI18nHead } from '@i18n-micro/utils/merge-i18n-head'
import { isMetaDisabledForRoute } from '@i18n-micro/utils/route'
import { resolveI18nConfigWithRuntimeOverrides } from '@i18n-micro/utils/runtime-config'
import { computed, watch } from 'vue'
import { getI18nConfig } from '#build/i18n.strategy.mjs'
import { defineNuxtPlugin, useHead, useRequestURL, useRoute, useState } from '#imports'
import { useI18nHead } from '../composables/useI18nHead'
import { useLocaleHead } from '../composables/useLocaleHead'
import type { PluginsInjections } from './01.plugin'

function readSiteConfigUrl(nuxtApp: { $nuxtSiteConfig?: { get?: (opts?: object) => { url?: unknown } } }): string | undefined {
  // Soft probe: only present when nuxt-site-config (via @nuxtjs/seo etc.) is installed.
  const stack = nuxtApp.$nuxtSiteConfig
  if (!stack || typeof stack.get !== 'function') return undefined
  try {
    const url = stack.get({ resolveRefs: true })?.url
    return typeof url === 'string' && url.trim() ? url : undefined
  } catch {
    return undefined
  }
}

/**
 * SEO origin: explicit `metaBaseUrl` → `site.url` → request origin.
 * `useRequestURL` (and X-Forwarded-*) is only used when both configured origins
 * are missing — that fallback trusts proxy headers when the corresponding
 * `metaTrustForwarded*` flags are true (the published default).
 */
function resolveSeoBaseUrl(i18nConfig: ModuleOptionsExtend, siteUrl: string | undefined): string {
  const configured = i18nConfig.metaBaseUrl || siteUrl
  if (configured) return configured.replace(/\/+$/, '')

  const url = useRequestURL({
    xForwardedHost: i18nConfig.metaTrustForwardedHost !== false,
    xForwardedProto: i18nConfig.metaTrustForwardedProto !== false,
  })
  return url.origin.replace(/\/+$/, '')
}

export default defineNuxtPlugin((nuxtApp) => {
  const route = useRoute()
  const i18nRouteParams = useState<I18nRouteParams>('i18n-route-params', () => ({}))
  const localeState = useState<string | null>('i18n-locale', () => null)
  const { pageHead } = useI18nHead()
  const getRuntimeConfig = (nuxtApp as unknown as { $getI18nConfig?: () => ModuleOptionsExtend }).$getI18nConfig
  const i18nConfig = resolveI18nConfigWithRuntimeOverrides(
    (typeof getRuntimeConfig === 'function' ? getRuntimeConfig() : getI18nConfig()) as ModuleOptionsExtend,
  )

  // Locale is already set by 01.plugin (from Middleware -> event.context on server, or hydration on client)
  // routeDisableMeta is evaluated in useLocaleHead.updateMeta so client navigations
  // can enable/disable tags per page — a one-shot check here would freeze the first route.

  const siteUrl = readSiteConfigUrl(nuxtApp as { $nuxtSiteConfig?: { get?: (opts?: object) => { url?: unknown } } })
  const baseUrl = resolveSeoBaseUrl(i18nConfig, siteUrl)

  const { metaObject, updateMeta } = useLocaleHead({
    addDirAttribute: true,
    identifierAttribute: 'id',
    addSeoAttributes: true,
    baseUrl,
    autoUpdate: false,
  })

  const mergedHead = computed(() => {
    const { $getLocales, $getLocale } = nuxtApp as typeof nuxtApp & Pick<PluginsInjections, '$getLocales' | '$getLocale'>
    const allLocales = $getLocales?.() ?? i18nConfig.locales ?? []
    const locale = $getLocale?.() || i18nConfig.defaultLocale || 'en'

    // Keep page-defined i18n head out when the route disables meta — matching the
    // previous plugin short-circuit that suppressed all head output for that route.
    if (isMetaDisabledForRoute(route, i18nConfig.routeDisableMeta, locale, i18nConfig.localizedRouteNamePrefix || 'localized-')) {
      return { htmlAttrs: {}, link: [], meta: [] }
    }

    return mergeI18nHead(metaObject.value, pageHead.value, {
      identifierAttribute: 'id',
      locales: allLocales as Locale[],
      currentLocale: locale,
    })
  })

  // unhead's UseHeadInput does not model our merged i18n head shape; the runtime
  // accepts a ComputedRef of it just fine.
  useHead(mergedHead as unknown as Parameters<typeof useHead>[0])

  const refreshMeta = () => updateMeta()

  if (import.meta.server) {
    nuxtApp.hook('app:rendered', refreshMeta)
  } else {
    refreshMeta()
    nuxtApp.hook('page:finish', refreshMeta)
  }

  watch(() => i18nRouteParams.value, refreshMeta, { deep: true, flush: 'post' })

  // Locale is included: no_prefix / hashMode / setLocale can change locale without a route change.
  watch(() => [route.fullPath, route.name, route.matched.length, localeState.value] as const, refreshMeta, {
    flush: 'post',
  })

  watch(pageHead, refreshMeta, { deep: true, flush: 'post' })
})
