// src/runtime/plugins/06.redirect.ts

import { isPrefixExceptDefaultStrategy, isPrefixStrategy } from '@i18n-micro/core'
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { defineNuxtPlugin, useRuntimeConfig, useRoute, useRouter, navigateTo, createError, useState, useCookie } from '#imports'
import { findAllowedLocalesForRoute } from '../utils/route-utils'
import { joinURL, withQuery } from 'ufo'

/**
 * Хелпер для подстановки динамических параметров в шаблон пути.
 * @param {string} path - Шаблон пути, например, "campingplatz/:identifier".
 * @param {object} params - Объект с параметрами, например, {identifier: 'example-campsite'}.
 * @returns {string} - Путь с подставленными параметрами.
 */
function resolvePathWithParams(path: string, params: Record<string, unknown>): string {
  let resolvedPath = path
  for (const key in params) {
    const value = params[key]
    if (value) {
      const stringValue = String(value)
      resolvedPath = resolvedPath.replace(`:${key}()`, stringValue).replace(`:${key}`, stringValue)
    }
  }
  return resolvedPath
}

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()
  const i18nConfig: ModuleOptionsExtend = config.public.i18nConfig as unknown as ModuleOptionsExtend
  const { routeLocales, globalLocaleRoutes } = useRuntimeConfig().public.i18nConfig as unknown as ModuleOptionsExtend
  const route = useRoute()
  const router = useRouter()

  // Helper to check if route exists in router
  const routeExists = (path: string) => {
    try {
      const resolved = router.resolve(path)
      return resolved.name && resolved.name !== 'custom-fallback-route' && resolved.matched.length > 0
    }
    catch {
      return false
    }
  }

  const checkGlobalLocaleRoutes = async (to: ReturnType<typeof useRoute>): Promise<boolean> => {
    if (!globalLocaleRoutes || typeof globalLocaleRoutes !== 'object' || Object.keys(globalLocaleRoutes).length === 0) {
      return false
    }

    const locales = i18nConfig.locales?.map(l => l.code) || []
    const defaultLocale = i18nConfig.defaultLocale || 'en'
    const pathSegments = to.path.split('/').filter(Boolean)
    const firstSegment = pathSegments[0]

    const pathWithoutLocale = firstSegment && locales.includes(firstSegment)
      ? '/' + pathSegments.slice(1).join('/')
      : to.path

    const routeName = (typeof to.name === 'string' ? to.name : '')
      .replace('localized-', '')
      .replace(new RegExp(`-(${locales.join('|')})$`), '')

    const routeRules = globalLocaleRoutes[pathWithoutLocale] || globalLocaleRoutes[routeName]

    if (routeRules && typeof routeRules === 'object') {
      const localeToUse = firstSegment && locales.includes(firstSegment) ? firstSegment : defaultLocale
      const customPathSegment = localeToUse ? routeRules[localeToUse] : undefined

      if (customPathSegment) {
        // --- КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ ---
        // 1. Подставляем параметры в шаблон кастомного пути
        const resolvedCustomPath = resolvePathWithParams(customPathSegment, to.params)

        // 2. Собираем полный ожидаемый путь
        const localizedPath = firstSegment && locales.includes(firstSegment)
          ? joinURL(`/${firstSegment}`, resolvedCustomPath)
          : resolvedCustomPath

        // 3. Сравниваем декодированные пути, чтобы избежать проблем с кириллицей
        if (decodeURI(to.path) !== decodeURI(localizedPath)) {
          const finalUrl = withQuery(localizedPath, to.query)
          // Use external: true for server-side redirects
          await navigateTo(finalUrl, { redirectCode: 301, external: true })
          return true
        }
      }
      else if (firstSegment && locales.includes(firstSegment)) {
        // --- ИСПРАВЛЕНИЕ: Добавлена проверка !routeExists ---
        // Если кастомного пути нет, но физический маршрут существует (авто-генерация),
        // то это НЕ ошибка 404. Ошибку кидаем только если роута реально нет.
        if (!routeExists(to.fullPath)) {
          if (import.meta.server) {
            console.log('[06.redirect] Route does not exist, throwing 404:', to.fullPath)
          }
          throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
        }
      }
    }
    return false
  }

  const checkRouteLocales = (to: ReturnType<typeof useRoute>) => {
    const allowedLocales = findAllowedLocalesForRoute(to, routeLocales)
    if (!allowedLocales || allowedLocales.length === 0) return

    const pathSegments = to.path.split('/').filter(Boolean)
    const firstSegment = pathSegments[0]
    const allLocales = i18nConfig.locales?.map(l => l.code) || []

    if (firstSegment && allLocales.includes(firstSegment) && !allowedLocales.includes(firstSegment)) {
      throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
    }
  }

  const handleRedirect = async (to: ReturnType<typeof useRoute>) => {
    // Skip if locale is already in params (URL already has prefix)
    if (to.params.locale) return

    const strategy = i18nConfig.strategy!
    const defaultLocale = i18nConfig.defaultLocale!
    const validLocales = i18nConfig.locales?.map(l => l.code) || []

    // Only handle prefix and prefix_except_default strategies
    // Note: 'prefix_and_default' allows both /path and /<locale>/path for default locale
    const shouldHandle = isPrefixStrategy(strategy) || isPrefixExceptDefaultStrategy(strategy)
    if (!shouldHandle) return

    // Check if user has explicit locale preference (useState or cookie)
    const localeState = await nuxtApp.runWithContext(() => useState<string | null>('i18n-locale'))

    // Only read cookie if localeCookie is not disabled (null)
    let cookieValue: string | null | undefined
    if (i18nConfig.localeCookie !== null) {
      const cookieLocaleName = i18nConfig.localeCookie || 'user-locale'
      cookieValue = await nuxtApp.runWithContext(() => useCookie(cookieLocaleName).value)
    }
    const userPreferredLocale = localeState.value || cookieValue

    // Validate that preferred locale exists, otherwise fallback to defaultLocale
    const isValidLocale = userPreferredLocale && validLocales.includes(userPreferredLocale)
    const targetLocale = isValidLocale ? userPreferredLocale : defaultLocale

    // For prefix_except_default: only redirect if target locale differs from default
    // (unless includeDefaultLocaleRoute is true, which always requires prefix)
    // For prefix: always redirect (all paths need prefix)
    const includeDefaultRoute = i18nConfig.includeDefaultLocaleRoute === true
    if (isPrefixExceptDefaultStrategy(strategy) && targetLocale === defaultLocale && !includeDefaultRoute) return

    // Find the appropriate route name
    const name = to.name?.toString()

    // Skip custom-fallback-route - it's handled by locale-redirect.vue component
    if (name === 'custom-fallback-route') return

    const targetRouteName = router.hasRoute(`localized-${name}-${targetLocale}`)
      ? `localized-${name}-${targetLocale}`
      : `localized-${name}`

    if (!router.hasRoute(targetRouteName)) return

    const newParams = { ...to.params, locale: targetLocale }
    return navigateTo({ name: targetRouteName, params: newParams }, {
      redirectCode: 302,
      external: true,
    })
  }

  if (import.meta.server) {
    if (await checkGlobalLocaleRoutes(route)) return
    checkRouteLocales(route)
    await handleRedirect(route)
  }

  router.beforeEach(async (to, from, next) => {
    if (await checkGlobalLocaleRoutes(to)) return

    if (from.path !== to.path) {
      checkRouteLocales(to)
    }

    await handleRedirect(to)
    next?.()
  })
})
