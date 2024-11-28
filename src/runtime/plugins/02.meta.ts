import type { ModuleOptionsExtend } from '../../types'
import { useLocaleHead } from '../composables/useLocaleHead'
import { useHead, defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useRequestURL } from '#imports'

const host = process.env.HOST ?? 'localhost'
const port = process.env.PORT ?? 'host'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const i18nConfig: ModuleOptionsExtend = config.public.i18nConfig as unknown as ModuleOptionsExtend

  const schema = port === '443' ? 'https' : 'http'
  const defaultUrl = port === '80' || port === '443' ? `${schema}://${host}` : `${schema}://${host}:${port}`

  if (!i18nConfig.meta) {
    return
  }

  nuxtApp.hook('app:rendered', (_context) => {
    const url = useRequestURL()
    const baseUrl = (i18nConfig.metaBaseUrl || url.origin || defaultUrl).toString()

    const head = useLocaleHead({
      addDirAttribute: true,
      identifierAttribute: 'id',
      addSeoAttributes: true,
      baseUrl,
    })

    useHead(head)
  })
})
