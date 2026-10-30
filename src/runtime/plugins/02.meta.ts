import type { RouteLike } from '@i18n-micro/path-strategy'
import type { Locale, ModuleOptionsExtend } from '@i18n-micro/types'
import { joinURL } from 'ufo'
import { defineNuxtPlugin, useHead, useRequestURL, useRoute, useRuntimeConfig } from '#imports'
import { usePageHead } from '../composables/useI18nHead'
import { useLocaleHead } from '../composables/useLocaleHead'
import type { I18nAppInternals } from '../utils/nuxt-i18n'

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
 * SEO origin: explicit `metaBaseUrl` → `site.url` → request origin plus `app.baseURL`.
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
  return joinURL(url.origin, useRuntimeConfig().app.baseURL).replace(/\/+$/, '')
}

export default defineNuxtPlugin((nuxtApp) => {
  const route = useRoute()
  const pageHead = usePageHead()
  const i18nConfig = nuxtApp.$getI18nConfig()

  // Locale is already set by 01.plugin (from Middleware -> event.context on server, or hydration on client)
  // routeDisableMeta is evaluated in useLocaleHead.updateMeta so client navigations
  // can enable/disable tags per page — a one-shot check here would freeze the first route.

  const siteUrl = readSiteConfigUrl(nuxtApp as { $nuxtSiteConfig?: { get?: (opts?: object) => { url?: unknown } } })
  const baseUrl = resolveSeoBaseUrl(i18nConfig, siteUrl)

  const { build } = useLocaleHead({
    addDirAttribute: true,
    identifierAttribute: 'id',
    addSeoAttributes: true,
    baseUrl,
    autoUpdate: false,
  })

  // A getter: unhead resolves it when the head renders (SSR: after the app rendered, so tags a
  // page set while rendering are in; client: again whenever what it read changes — the route,
  // the locale, i18nRouteParams through $switchLocalePath, pageHead). No watchers to keep in sync.
  useHead(() => {
    const { $getLocales, $getLocale } = nuxtApp
    const allLocales = $getLocales?.() ?? i18nConfig.locales ?? []
    const locale = $getLocale?.() || i18nConfig.defaultLocale || 'en'
    // a route that disables meta drops the page-defined i18n head too
    if (nuxtApp.$i18nStrategy.isMetaDisabled(route as unknown as RouteLike, locale)) return { htmlAttrs: {}, link: [], meta: [] }
    // unhead's UseHeadInput does not model the merged i18n head shape; the runtime takes it
    type Head = ReturnType<Extract<Parameters<typeof useHead>[0], () => unknown>>
    const head = build(true)
    const merge = (nuxtApp as I18nAppInternals)._i18nMergeHead
    if (!pageHead.value || !merge) return head as unknown as Head
    return merge(head, pageHead.value, { identifierAttribute: 'id', locales: allLocales as Locale[], currentLocale: locale }) as unknown as Head
  })
})
