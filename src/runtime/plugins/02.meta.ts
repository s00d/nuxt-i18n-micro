import type { ModuleOptionsExtend } from 'nuxt-i18n-micro-types'
import { useLocaleHead } from '../composables/useLocaleHead'
import { useRequestURL, useHead, defineNuxtPlugin, useRuntimeConfig } from '#imports'

const host = process.env.HOST ?? 'localhost'
const port = process.env.PORT ?? 'host'

export default defineNuxtPlugin(async (_nuxtApp) => {
  const config = useRuntimeConfig()

  const i18nConfig: ModuleOptionsExtend = config.public.i18nConfig as unknown as ModuleOptionsExtend

  const schema = port === '443' ? 'https' : 'http'
  const defaultUrl = port === '80' || port === '443' ? `${schema}://${host}` : `${schema}://${host}:${port}`

  const url = useRequestURL()
  const baseUrl = (i18nConfig.metaBaseUrl || url.origin || defaultUrl).toString()

  const head = await useLocaleHead({
    addDirAttribute: true,
    identifierAttribute: 'id',
    addSeoAttributes: true,
    baseUrl,
  })

  useHead(head)
})
