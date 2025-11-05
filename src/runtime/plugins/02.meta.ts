import type { ModuleOptionsExtend } from 'nuxt-i18n-micro-types'
import { useLocaleHead } from '../composables/useLocaleHead'
import { useRequestURL, useHead, defineNuxtPlugin, useRuntimeConfig, useRoute } from '#imports'
import { watch } from 'vue'
import { isMetaDisabledForRoute } from '../utils/route-utils'

const host = process.env.HOST ?? 'localhost'
const port = process.env.PORT ?? 'host'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const route = useRoute()

  const i18nConfig: ModuleOptionsExtend = config.public.i18nConfig as unknown as ModuleOptionsExtend

  // Get current locale
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const currentLocale = nuxtApp.$getLocale?.()

  // Check if meta is disabled for this route
  if (isMetaDisabledForRoute(route, i18nConfig.routeDisableMeta, currentLocale)) {
    // Don't generate any meta tags if disabled for this route
    return
  }

  const schema = port === '443' ? 'https' : 'http'
  const defaultUrl = port === '80' || port === '443' ? `${schema}://${host}` : `${schema}://${host}:${port}`

  const url = useRequestURL()
  const baseUrl = (i18nConfig.metaBaseUrl || url.origin || defaultUrl).toString()

  const { metaObject, updateMeta } = useLocaleHead({
    addDirAttribute: true,
    identifierAttribute: 'id',
    addSeoAttributes: true,
    baseUrl,
  })

  useHead(metaObject)

  if (import.meta.server) {
    updateMeta()
  }
  else if (import.meta.client) {
    watch(
      () => useRoute().fullPath,
      () => updateMeta(),
      { immediate: true },
    )
  }
})
