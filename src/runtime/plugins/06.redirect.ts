// src/runtime/plugins/06.redirect.ts

import { isNoPrefixStrategy, isPrefixStrategy } from '@i18n-micro/core'
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { defineNuxtPlugin, useRuntimeConfig, useRoute, useRouter, navigateTo, createError } from '#imports'
import { findAllowedLocalesForRoute } from '../utils/route-utils'
import { joinURL, withQuery } from 'ufo'

/**
 * Helper to substitute dynamic parameters into path template.
 * @param {string} path - Path template, e.g., "campingplatz/:identifier".
 * @param {object} params - Object with parameters, e.g., {identifier: 'example-campsite'}.
 * @returns {string} - Path with substituted parameters.
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

  const checkGlobalLocaleRoutes = (to: ReturnType<typeof useRoute>): boolean => {
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
        // --- KEY FIX ---
        // 1. Substitute parameters into custom path template
        const resolvedCustomPath = resolvePathWithParams(customPathSegment, to.params)

        // 2. Build full expected path
        const localizedPath = firstSegment && locales.includes(firstSegment)
          ? joinURL(`/${firstSegment}`, resolvedCustomPath)
          : resolvedCustomPath

        // 3. Compare decoded paths to avoid issues with Cyrillic characters
        if (decodeURI(to.path) !== decodeURI(localizedPath)) {
          const finalUrl = withQuery(localizedPath, to.query)
          navigateTo(finalUrl, { redirectCode: 301, external: true })
          return true
        }
      }
      else if (firstSegment && locales.includes(firstSegment)) {
        throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const currentLocale = (nuxtApp as unknown).$getLocale(to)
    const name = to.name?.toString()

    let defaultRouteName = name?.toString()
      .replace('localized-', '')
      .replace(new RegExp(`-${currentLocale}$`), '')

    if (!to.params.locale) {
      if (router.hasRoute(`localized-${name}-${currentLocale}`)) {
        defaultRouteName = `localized-${name}-${currentLocale}`
      }
      else {
        defaultRouteName = `localized-${name}`
      }

      if (!router.hasRoute(defaultRouteName)) return

      const newParams = { ...to.params }
      if (!isNoPrefixStrategy(i18nConfig.strategy!)) {
        newParams.locale = i18nConfig.defaultLocale!
      }

      return navigateTo({ name: defaultRouteName, params: newParams }, {
        redirectCode: 301,
        external: true,
      })
    }
  }

  if (import.meta.server) {
    if (checkGlobalLocaleRoutes(route)) return
    checkRouteLocales(route)
    if (isPrefixStrategy(i18nConfig.strategy!) || isNoPrefixStrategy(i18nConfig.strategy!)) {
      await handleRedirect(route)
    }
  }

  router.beforeEach(async (to, from, next) => {
    if (checkGlobalLocaleRoutes(to)) return

    if (from.path !== to.path) {
      checkRouteLocales(to)
    }

    if (isPrefixStrategy(i18nConfig.strategy!) || isNoPrefixStrategy(i18nConfig.strategy!)) {
      await handleRedirect(to)
    }
    next?.()
  })
})
