<template>
  <div />
</template>

<script setup>
import { useRoute, useRouter, useI18n, createError, navigateTo, useRuntimeConfig, showError, useState, useCookie } from '#imports'
import { isInternalPath } from '../utils/path-utils'
import { isPrefixStrategy, isPrefixExceptDefaultStrategy } from '@i18n-micro/core'

const route = useRoute()
const router = useRouter()
const { $getLocales, $defaultLocale } = useI18n()
const config = useRuntimeConfig()

// --- 1. Configuration ---
const i18nConfig = config.public.i18nConfig
const strategy = i18nConfig?.strategy || 'prefix_except_default'
const locales = $getLocales().map(locale => locale.code)
const defaultLocale = $defaultLocale() || 'en'

// Get user's locale preference from useState or cookie (same behavior as prefix_except_default)
const localeState = useState('i18n-locale')
// Only read cookie if localeCookie is not disabled (null)
let cookieValue
if (i18nConfig?.localeCookie !== null) {
  const cookieLocaleName = i18nConfig?.localeCookie || 'user-locale'
  cookieValue = useCookie(cookieLocaleName).value
}
const userPreferredLocale = localeState.value || cookieValue
// Validate that preferred locale exists, otherwise fallback to defaultLocale
const isValidLocale = userPreferredLocale && locales.includes(userPreferredLocale)
const currentLocale = isValidLocale ? userPreferredLocale : defaultLocale
const pathSegments = route.fullPath.split('/')
const firstSegment = pathSegments[1]

// --- 2. Exclusion checks ---
if (isInternalPath(route.fullPath, i18nConfig?.excludePatterns)) {
  if (import.meta.client) {
    showError({
      statusCode: 404,
      statusMessage: 'Static file - should not be processed by i18n',
    })
  }
  else {
    throw createError({
      statusCode: 404,
      statusMessage: 'Static file - should not be processed by i18n',
    })
  }
}

// --- 3. Utilities ---
const handleRedirect = (path, isIndexRoute = false) => {
  // Use router.resolve to get the correct path
  const resolved = router.resolve(path)
  let resolvedPath = resolved.fullPath || path

  // For index routes, ensure trailing slash
  if (isIndexRoute && !resolvedPath.includes('?') && !resolvedPath.endsWith('/')) {
    resolvedPath = `${resolvedPath}/`
  }

  // Add query parameters to redirect path if not already included
  const hasQuery = resolvedPath.includes('?')
  const finalPath = !hasQuery && route.query && Object.keys(route.query).length > 0
    ? `${resolvedPath}?${new URLSearchParams(route.query).toString()}`
    : resolvedPath

  if (import.meta.client) {
    window.history.replaceState(null, '', finalPath)
    location.assign(finalPath)
  }
  else {
    // Use external: false for SSG to avoid prerender errors
    navigateTo(finalPath, { redirectCode: 301, external: true })
  }
}

const routeExists = (path) => {
  try {
    const resolved = router.resolve(path)
    return resolved.name && resolved.name !== 'custom-fallback-route' && resolved.matched.length > 0
  }
  catch {
    return false
  }
}

// --- 4. Main logic ---
const globalLocaleRoutes = route.meta.globalLocaleRoutes ?? {}
const currentPageName = route.path.split('/').filter(Boolean).join('-')

// Track if we should throw 404 error or if redirect happened
let shouldThrow404 = false
let redirectHandled = false

// Scenario 1: Path starts with locale prefix (e.g., /fr/about)
if (locales.includes(firstSegment)) {
  const pathWithoutPrefix = '/' + pathSegments.slice(2).join('/')

  // Check for canonical URL for `prefix_except_default`
  // If user accessed /en/about, it should be /about
  if (isPrefixExceptDefaultStrategy(strategy) && firstSegment === defaultLocale) {
    if (import.meta.client) {
      showError({
        statusCode: 404,
        statusMessage: `Page not found for default locale with prefix ('${firstSegment}')`,
      })
    }
    else {
      throw createError({
        statusCode: 404,
        statusMessage: `Page not found for default locale with prefix ('${firstSegment}')`,
      })
    }
  }

  // Check if there's a custom path for this page in globalLocaleRoutes
  const customPath = globalLocaleRoutes[currentPageName]?.[firstSegment]
  if (customPath && customPath !== pathWithoutPrefix) {
    handleRedirect(`/${firstSegment}${customPath}`)
    redirectHandled = true
  }
  // For `prefix_except_default` strategy with non-default locale:
  // Check if the route with prefix exists (e.g., /ru/fakepage)
  // If it doesn't exist, this is a real 404
  // Note: Even if route without prefix exists (for default locale),
  // the route with prefix must exist for non-default locale to be valid
  else if (isPrefixExceptDefaultStrategy(strategy) && firstSegment !== defaultLocale) {
    // Check if route with prefix exists for this non-default locale
    if (!routeExists(route.fullPath)) {
      // Route doesn't exist for this locale, this is a real 404
      shouldThrow404 = true
    }
    // If route exists, it's valid for this locale - don't throw 404
  }
  else if (isPrefixStrategy(strategy)) {
    // For 'prefix' strategy, check if route with prefix exists
    if (!routeExists(route.fullPath)) {
      shouldThrow404 = true
    }
  }
  else {
    // For other strategies, if we reached here and no redirect happened, it's 404
    if (!redirectHandled) {
      shouldThrow404 = true
    }
  }
}
// Scenario 2: Path does NOT start with locale prefix (e.g., /about)
else {
  // Check if there's a custom path for current locale
  const customPath = globalLocaleRoutes[currentPageName]?.[currentLocale]
  if (customPath && customPath !== route.fullPath) {
    // If there's a custom path for current locale, redirect to it
    // Strategy 'prefix' will require adding prefix
    const targetPath = isPrefixStrategy(strategy) ? `/${currentLocale}${customPath}` : customPath
    handleRedirect(targetPath)
    redirectHandled = true
  }
  // If no custom path and strategy is 'prefix', redirect is needed
  else if (isPrefixStrategy(strategy)) {
    // Use currentLocale (from cookie/useState) for redirect, not defaultLocale
    const basePath = route.path === '/' ? '' : route.path
    const newPathWithPrefix = `/${currentLocale}${basePath}`
    const isIndexRoute = route.path === '/'
    if (routeExists(newPathWithPrefix) || routeExists(`${newPathWithPrefix}/`)) {
      handleRedirect(newPathWithPrefix, isIndexRoute)
      redirectHandled = true
    }
    else {
      shouldThrow404 = true
    }
  }
  // For 'prefix_except_default' nothing needs to be done here.
  // If we're here, it's a valid URL for default locale (or 404, which Nuxt will handle).
  else if (isPrefixExceptDefaultStrategy(strategy)) {
    // Check if route exists for default locale
    if (!routeExists(route.fullPath)) {
      shouldThrow404 = true
    }
    // If route exists, it's valid for default locale - don't throw 404
  }
  else {
    // For other strategies, if we reached here and no redirect happened, it's 404
    if (!redirectHandled) {
      shouldThrow404 = true
    }
  }
}

// If we reached here and shouldThrow404 is true, handle 404 error
if (shouldThrow404) {
  if (import.meta.client) {
    // On client, use showError to properly handle the error
    showError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
    })
  }
  else {
    // On server, throw createError
    throw createError({
      statusCode: 404,
    })
  }
}
</script>
