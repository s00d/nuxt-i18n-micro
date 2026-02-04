/**
 * Client-only: redirect / to /locale when useI18nLocale (useState + cookie)
 * sets a non-default locale for prefix strategies. Nitro runs before Nuxt,
 * so server doesn't see cookie/useState; this runs after hydration (app:mounted).
 */
import { defineNuxtPlugin, useRoute, navigateTo } from '#imports'
import { getI18nConfig } from '#build/i18n.strategy.mjs'
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { isNoPrefixStrategy, isPrefixStrategy, isPrefixExceptDefaultStrategy } from '@i18n-micro/core'
import { useI18nLocale } from '../composables/useI18nLocale'

export default defineNuxtPlugin({
  name: 'i18n-client-redirect',
  enforce: 'post',
  setup(nuxtApp) {
    if (!import.meta.client) return

    const i18nConfig = getI18nConfig() as ModuleOptionsExtend
    const strategy = i18nConfig.strategy!
    if (isNoPrefixStrategy(strategy)) return

    const validLocales = i18nConfig.locales?.map(l => l.code) || []
    const defaultLocale = i18nConfig.defaultLocale || 'en'

    const runRedirect = () => {
      const { getPreferredLocale } = useI18nLocale()
      const preferredLocale = getPreferredLocale()
      if (!preferredLocale) return

      const route = useRoute()
      const path = route.path || '/'
      const pathSegments = path.replace(/^\//, '').split('/').filter(Boolean)
      const firstSegment = pathSegments[0]
      const hasLocalePrefix = Boolean(firstSegment && validLocales.includes(firstSegment))

      // URL already has preferred locale — nothing to do
      if (hasLocalePrefix && firstSegment === preferredLocale) return

      // Path has another locale prefix (e.g. /en when preferred is ja) — redirect to preferred
      if (hasLocalePrefix && firstSegment !== preferredLocale) {
        const rest = pathSegments.slice(1).join('/')
        const targetPath = rest ? `/${preferredLocale}/${rest}` : `/${preferredLocale}`
        navigateTo(targetPath, { replace: true, redirectCode: 302 })
        return
      }

      // Path without locale: / or /something
      if (path === '/' || path === '') {
        if (isPrefixStrategy(strategy)) {
          navigateTo(`/${preferredLocale}`, { replace: true, redirectCode: 302 })
          return
        }
        if (isPrefixExceptDefaultStrategy(strategy) && preferredLocale !== defaultLocale) {
          navigateTo(`/${preferredLocale}`, { replace: true, redirectCode: 302 })
          return
        }
        // prefix_and_default: / is valid for any locale — no redirect, useState/cookie set locale for content
        return
      }

      // Path like /contact without locale prefix — add preferred locale
      if (preferredLocale === defaultLocale && isPrefixExceptDefaultStrategy(strategy)) return
      const targetPath = `/${preferredLocale}${path.startsWith('/') ? path : `/${path}`}`
      navigateTo(targetPath, { replace: true, redirectCode: 302 })
    }

    // Run after hydration so useState/cookie from server payload are applied
    nuxtApp.hook('app:mounted', () => {
      runRedirect()
    })
  },
})
