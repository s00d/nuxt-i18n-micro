import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { watch } from 'vue'
import { getI18nConfig } from '#build/i18n.strategy.mjs'
import { defineNuxtPlugin, useHead, useRequestURL, useRoute } from '#imports'
import { useLocaleHead } from '../composables/useLocaleHead'
import { isMetaDisabledForRoute } from '../utils/route-utils'

export default defineNuxtPlugin((nuxtApp) => {
  const route = useRoute()
  const i18nConfig = getI18nConfig() as ModuleOptionsExtend

  // Locale is already set by 01.plugin (from Middleware -> event.context on server, or hydration on client)
  // @ts-expect-error
  const currentLocale = nuxtApp.$getLocale?.()

  if (isMetaDisabledForRoute(route, i18nConfig.routeDisableMeta, currentLocale)) {
    return
  }

  // useRequestURL() works everywhere (Node, Edge, Browser) and respects proxy headers (X-Forwarded-Proto, etc.)
  const url = useRequestURL()
  const baseUrl = (i18nConfig.metaBaseUrl || url.origin).toString()

  const { metaObject, updateMeta } = useLocaleHead({
    addDirAttribute: true,
    identifierAttribute: 'id',
    addSeoAttributes: true,
    baseUrl,
  })

  useHead(metaObject)

  if (import.meta.server) {
    updateMeta()
  } else if (import.meta.client) {
    watch(
      () => route.fullPath,
      () => updateMeta(),
      { immediate: true },
    )
  }
})
