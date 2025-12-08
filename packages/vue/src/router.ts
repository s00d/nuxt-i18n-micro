import { watch } from 'vue'
import type { Router, RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'
import type { VueI18n } from './composer'

export interface RouterIntegrationOptions {
  router: Router
  i18n: VueI18n
  defaultLocale?: string
  locales?: string[]
}

/**
 * Get route name from Vue Router route
 * Extracts route name from route.name or route.path
 */
export function getRouteName(route: RouteLocationNormalizedLoaded): string {
  if (route.name && typeof route.name === 'string') {
    return route.name
  }
  if (route.name && typeof route.name === 'object') {
    return String(route.name)
  }

  // Fallback to path-based route name
  const path = route.path.replace(/^\//, '').replace(/\/$/, '')
  if (!path) {
    return 'index'
  }

  return path.split('/').join('-')
}

/**
 * Get locale from route
 * Checks route.params.locale or extracts from path
 */
export function getLocaleFromRoute(
  route: RouteLocationNormalizedLoaded,
  defaultLocale: string = 'en',
  locales: string[] = [],
): string {
  // Check route.params.locale
  if (route.params?.locale && typeof route.params.locale === 'string') {
    return route.params.locale
  }

  // Extract from path
  const path = route.path || route.fullPath || ''
  const pathSegments = path.split('/').filter(Boolean)
  const firstSegment = pathSegments[0]
  if (firstSegment && locales.includes(firstSegment)) {
    return firstSegment
  }

  return defaultLocale
}

/**
 * Setup router integration for i18n
 * Automatically updates route and locale when router changes, AND updates URL when locale changes.
 */
export function setupRouterIntegration(options: RouterIntegrationOptions): () => void {
  const { router, i18n, defaultLocale = 'en', locales = [] } = options

  // Mutex flag to prevent infinite loops between route changes and locale changes
  let isSyncing = false

  // 1. Sync Route -> State
  const updateFromRoute = (route: RouteLocationNormalizedLoaded) => {
    // Ignore initial route (START_LOCATION) if it's empty
    if (route.matched.length === 0 && route.path === '/') return

    // Prevent sync if we're already syncing from locale change
    if (isSyncing) return

    isSyncing = true

    try {
      const routeName = getRouteName(route)
      i18n.setRoute(routeName)

      const locale = getLocaleFromRoute(route, defaultLocale, locales)
      if (i18n.locale.value !== locale) {
        i18n.locale.value = locale
      }
    }
    finally {
      isSyncing = false
    }
  }

  // Wait for router to be ready before first sync
  // This is critical for correct locale detection from URL on F5
  router.isReady().then(() => {
    updateFromRoute(router.currentRoute.value)
  })

  // Watch for route changes
  const unhookRouter = router.afterEach((to) => {
    updateFromRoute(to)
  })

  // 2. Sync State -> Route (Two-way binding)
  // When user does `locale.value = 'fr'`, we should change the URL
  const unwatchLocale = watch(
    () => i18n.locale.value,
    (newLocale, oldLocale) => {
      if (newLocale === oldLocale) return

      // Prevent sync if we're already syncing from route change
      if (isSyncing) return

      const currentRoute = router.currentRoute.value
      const currentRouteLocale = getLocaleFromRoute(currentRoute, defaultLocale, locales)

      // Only push if the route's locale doesn't match the new state
      // (avoids infinite loop with updateFromRoute)
      if (currentRouteLocale !== newLocale) {
        isSyncing = true
        try {
          switchLocaleRoute(router, i18n, newLocale, locales)
        }
        finally {
          // Reset flag after navigation is initiated
          // Note: Navigation is async, but we reset immediately to allow
          // updateFromRoute to handle the final state after navigation completes
          isSyncing = false
        }
      }
    },
  )

  // Return teardown function
  return () => {
    unhookRouter()
    unwatchLocale()
  }
}

/**
 * Switch locale and navigate to localized route
 */
export function switchLocaleRoute(
  router: Router,
  i18n: VueI18n,
  newLocale: string,
  locales: string[] = [],
): void {
  const currentRoute = router.currentRoute.value

  // Update locale state immediately for responsiveness
  i18n.locale.value = newLocale

  // Prepare navigation
  let nextRoute: RouteLocationRaw

  // If route has locale in params, update it (Dynamic Route Matching)
  if (currentRoute.params?.locale) {
    nextRoute = {
      name: currentRoute.name,
      params: {
        ...currentRoute.params,
        locale: newLocale,
      },
      query: currentRoute.query,
      hash: currentRoute.hash,
    }
  }
  // If locale is in path (Path Prefix Strategy)
  else if (locales.length > 0) {
    const path = currentRoute.path
    const pathSegments = path.split('/').filter(Boolean)

    // Check if first segment is a known locale
    const firstSegment = pathSegments[0]
    if (firstSegment && locales.includes(firstSegment)) {
      pathSegments[0] = newLocale
      nextRoute = `/${pathSegments.join('/')}`
    }
    else {
      // Prepend locale to path if it wasn't there
      nextRoute = `/${newLocale}${path === '/' ? '' : path}`
    }
  }
  else {
    // No strategy detected, just return
    return
  }

  // Use push for language switching so user can go back
  router.push(nextRoute).catch((err) => {
    // Ignore navigation duplicates or cancellations
    if (err?.name !== 'NavigationDuplicated') {
      console.error(err)
    }
  })
}
