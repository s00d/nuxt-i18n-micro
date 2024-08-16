import { useHead, defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useRoute } from '#imports'
import type { ModuleOptions } from '~/src/module'

interface State extends ModuleOptions {
  rootDir: string
}

export default defineNuxtPlugin((nuxtApp) => {
  const route = useRoute()
  const config = useRuntimeConfig()

  const i18nConfig: State = config.public.myModule as State

  nuxtApp.hook('app:rendered', (context) => {
    const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
    const locales = i18nConfig.locales || []
    const currentIso = locales.find(l => l.code === locale)?.iso || locale
    // const ogUrl = `${context.event.req.protocol}://${context.event.req.headers.host}${context.event.req.url}`
    const baseUrl = config.public.baseURL || 'http://localhost:3000'
    const ogUrl = `${baseUrl}${route.fullPath}`

    useHead({
      htmlAttrs: {
        lang: currentIso,
      },
      meta: [
        { id: 'i18n-og', property: 'og:locale', content: currentIso },
        { id: 'i18n-og-url', property: 'og:url', content: ogUrl },
        ...locales.filter(l => l.code !== locale).map(loc => ({
          id: `i18n-og-alt-${loc.iso || loc.code}`,
          property: 'og:locale:alternate',
          content: loc.iso || loc.code,
        })),
      ],
      link: [
        { id: 'i18n-can', rel: 'canonical', href: ogUrl },
        ...locales.map(loc => ({
          id: `i18n-alternate-${loc.iso || loc.code}`,
          rel: 'alternate',
          href: `${baseUrl}/${loc.code}${route.fullPath}`, // Формирование URL для альтернативных языков
          hreflang: loc.iso || loc.code, // Используем iso или code как hreflang
        })),
      ],
    })
  })
})
