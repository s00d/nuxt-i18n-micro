import type { RouteLike } from '@i18n-micro/path-strategy'
import type { Locale, ModuleOptionsExtend } from '@i18n-micro/types'
import { trimTrailingSlashes } from '@i18n-micro/utils/app-path'
import { mergeI18nHead } from '@i18n-micro/utils/merge-i18n-head'
import { joinURL } from 'ufo'
import { defineNuxtPlugin, useHead, useRequestURL, useRoute, useRuntimeConfig } from '#imports'
import { usePageHead } from '../utils/page-head'
import { useLocaleHead } from '../composables/useLocaleHead'

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

/** The request's origin, or '' for no absolute URLs: a client writes these headers, and one that does not parse must not cost the page. */
function requestOrigin(i18nConfig: ModuleOptionsExtend): string {
  const xForwardedProto = i18nConfig.metaTrustForwardedProto !== false
  try {
    return useRequestURL({ xForwardedHost: i18nConfig.metaTrustForwardedHost !== false, xForwardedProto }).origin
  } catch {
    try {
      return useRequestURL({ xForwardedProto }).origin
    } catch {
      return ''
    }
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
  if (configured) return trimTrailingSlashes(configured)

  return trimTrailingSlashes(joinURL(requestOrigin(i18nConfig), useRuntimeConfig().app.baseURL))
}

export default defineNuxtPlugin((nuxtApp) => {
  const route = useRoute()
  const pageHead = usePageHead()
  const i18nConfig = nuxtApp.$getI18nConfig()

  // Locale is already set by 01.plugin (from Middleware -> event.context on server, or hydration on client)
  // disableMeta is evaluated on every head render so client navigations
  // can enable/disable tags per page — a one-shot check here would freeze the first route.

  const siteUrl = readSiteConfigUrl(nuxtApp as { $nuxtSiteConfig?: { get?: (opts?: object) => { url?: unknown } } })
  const baseUrl = resolveSeoBaseUrl(i18nConfig, siteUrl)

  const { build } = useLocaleHead({
    baseUrl,
    autoUpdate: false,
  })

  // A getter: unhead resolves it when the head renders (SSR: after the app rendered, so tags a
  // page set while rendering are in; client: again whenever what it read changes — the route,
  // the locale, i18nRouteParams through $switchLocalePath, pageHead). No watchers to keep in sync.
  useHead(() => {
    const { $getLocales, $getLocale } = nuxtApp
    const allLocales = $getLocales()
    const locale = $getLocale() || i18nConfig.defaultLocale || 'en'
    // unhead's UseHeadInput does not model the merged i18n head shape; the runtime takes it
    type Head = ReturnType<Extract<Parameters<typeof useHead>[0], () => unknown>>
    const head = build()
    // a route that disables meta drops the page-defined i18n head too: `build` left only `lang` and `dir`
    if (!pageHead.value || nuxtApp.$i18nStrategy.isMetaDisabled(route as unknown as RouteLike, locale)) return head as unknown as Head
    return mergeI18nHead(head, pageHead.value, {
      identifierAttribute: 'id',
      locales: allLocales as Locale[],
      currentLocale: locale,
    }) as unknown as Head
  })
})
