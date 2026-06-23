import type { I18nRouteParams, ModuleOptionsExtend } from '@i18n-micro/types'
import { isMetaDisabledForRoute } from '@i18n-micro/utils/route'
import { resolveI18nConfigWithRuntimeOverrides } from '@i18n-micro/utils/runtime-config'
import { watch } from 'vue'
import { getI18nConfig } from '#build/i18n.strategy.mjs'
import { defineNuxtPlugin, useHead, useRequestURL, useRoute, useState } from '#imports'
import { useLocaleHead } from '../composables/useLocaleHead'

export default defineNuxtPlugin((nuxtApp) => {
  const route = useRoute()
  const i18nRouteParams = useState<I18nRouteParams>('i18n-route-params', () => ({}))
  const getRuntimeConfig = (nuxtApp as unknown as { $getI18nConfig?: () => ModuleOptionsExtend }).$getI18nConfig
  const i18nConfig = resolveI18nConfigWithRuntimeOverrides(
    (typeof getRuntimeConfig === 'function' ? getRuntimeConfig() : getI18nConfig()) as ModuleOptionsExtend,
  )

  // Locale is already set by 01.plugin (from Middleware -> event.context on server, or hydration on client)
  // @ts-expect-error
  const currentLocale = nuxtApp.$getLocale?.()

  if (isMetaDisabledForRoute(route, i18nConfig.routeDisableMeta, currentLocale)) {
    return
  }

  // Resolve base URL for SEO meta tags.
  // undefined → dynamically resolve from the current request (supports multi-domain).
  // Proxy-header options so the origin is correct behind nginx / Cloudflare / ALB / etc.:
  //   X-Forwarded-Host  → real hostname  (controlled by metaTrustForwardedHost)
  //   X-Forwarded-Proto → real protocol  (controlled by metaTrustForwardedProto)
  const url = useRequestURL({
    xForwardedHost: i18nConfig.metaTrustForwardedHost !== false,
    xForwardedProto: i18nConfig.metaTrustForwardedProto !== false,
  })
  const baseUrl = i18nConfig.metaBaseUrl || url.origin

  const { metaObject, updateMeta } = useLocaleHead({
    addDirAttribute: true,
    identifierAttribute: 'id',
    addSeoAttributes: true,
    baseUrl,
    autoUpdate: false,
  })

  useHead(metaObject)

  const refreshMeta = () => updateMeta()

  if (import.meta.server) {
    nuxtApp.hook('app:rendered', refreshMeta)
  } else {
    refreshMeta()
    nuxtApp.hook('page:finish', refreshMeta)
  }

  watch(
    () => i18nRouteParams.value,
    refreshMeta,
    { deep: true, flush: 'post' },
  )

  watch(
    () => [route.fullPath, route.name, route.matched.length] as const,
    refreshMeta,
    { flush: 'post' },
  )
})
