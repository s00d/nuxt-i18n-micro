/**
 * Client-side locale redirect middleware.
 * Replaces setTimeout-based afterEach redirects from the legacy redirect plugin.
 */

import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategy, ResolvedRouteLike } from '@i18n-micro/path-strategy'
import { getEnabledLocaleCodes } from '@i18n-micro/utils/active-locales'
import type { RouteLocationNormalized } from 'vue-router'
import { defineNuxtRouteMiddleware, navigateTo, useNuxtApp } from '#imports'
import { useI18nLocale } from '../composables/useI18nLocale'

function redirectTo(path: string, to: RouteLocationNormalized) {
  return navigateTo({ path, query: to.query, hash: to.hash }, { replace: true, redirectCode: 302 })
}

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return

  const nuxtApp = useNuxtApp()
  const getRuntimeConfig = (nuxtApp as unknown as { $getI18nConfig?: () => ModuleOptionsExtend }).$getI18nConfig
  const i18nStrategy = (nuxtApp as unknown as { $i18nStrategy?: PathStrategy }).$i18nStrategy

  if (typeof getRuntimeConfig !== 'function' || !i18nStrategy) return

  const i18nConfig = getRuntimeConfig()
  if (i18nConfig.redirects === false) return

  if (to.path === from.path) return

  const validLocales = getEnabledLocaleCodes(i18nConfig.locales)
  const defaultLocale = i18nConfig.defaultLocale || 'en'
  const autoDetectPath = i18nConfig.autoDetectPath || '/'

  const { getPreferredLocale } = useI18nLocale()
  const routeLocale = i18nStrategy.getCurrentLocale(to as unknown as ResolvedRouteLike, getPreferredLocale())
  let preferredLocale = routeLocale || getPreferredLocale() || defaultLocale

  const path = to.path || '/'
  const pathSegments = path.replace(/^\//, '').split('/').filter(Boolean)
  const firstSegment = pathSegments[0]
  const hasLocalePrefix = Boolean(firstSegment && validLocales.includes(firstSegment))

  if (autoDetectPath === '*' && !hasLocalePrefix) {
    preferredLocale = defaultLocale
  }

  if (autoDetectPath === '*' && hasLocalePrefix && firstSegment !== preferredLocale) {
    const rest = pathSegments.slice(1).join('/')
    let targetPath: string
    if (preferredLocale === defaultLocale && i18nConfig.strategy === 'prefix_except_default') {
      targetPath = rest ? `/${rest}` : '/'
    } else {
      targetPath = rest ? `/${preferredLocale}/${rest}` : `/${preferredLocale}`
    }
    return redirectTo(targetPath, to)
  }

  const redirectPath = i18nStrategy.getClientRedirect(path, preferredLocale)
  if (redirectPath) {
    return redirectTo(redirectPath, to)
  }
})
