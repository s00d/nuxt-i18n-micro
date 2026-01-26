import { defineEventHandler, getCookie, sendRedirect, getRequestURL, getHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { ModuleOptionsExtend } from '@i18n-micro/types'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const i18nConfig: ModuleOptionsExtend = config.public.i18nConfig as unknown as ModuleOptionsExtend

  // Only handle prefix strategy redirects
  if (i18nConfig.strategy !== 'prefix') {
    return
  }

  // Skip during prerendering to avoid redirect loops
  // Check multiple indicators of prerendering
  const prerenderHeader = getHeader(event, 'x-nitro-prerender')
  const userAgent = getHeader(event, 'user-agent') || ''

  // Skip if this is a prerender request or internal Nitro request
  if (prerenderHeader || userAgent.includes('Nitro') || !userAgent) {
    return
  }

  const url = getRequestURL(event)
  const pathname = url.pathname

  // Skip if path already has locale prefix
  const validLocales = i18nConfig.locales?.map(l => l.code) || []
  const pathSegments = pathname.split('/').filter(Boolean)
  const firstSegment = pathSegments[0]

  if (firstSegment && validLocales.includes(firstSegment)) {
    // Already has locale prefix
    return
  }

  // Skip static files and API routes
  if (pathname.startsWith('/_nuxt/')
    || pathname.startsWith('/api/')
    || pathname.startsWith('/_locales/')
    || pathname.includes('.')) {
    return
  }

  // Get user's locale preference from cookie
  let targetLocale: string | null = null

  if (i18nConfig.localeCookie !== null) {
    const cookieLocaleName = i18nConfig.localeCookie || 'user-locale'
    const cookieValue = getCookie(event, cookieLocaleName)

    if (cookieValue && validLocales.includes(cookieValue)) {
      targetLocale = cookieValue
    }
  }

  // If no cookie is set, don't redirect from middleware
  // Let the plugin/component handle it (they can set useState or use other logic)
  // This allows custom plugins to set locale via useState before redirect happens
  if (!targetLocale) {
    return
  }

  // Construct redirect path
  const basePath = pathname === '/' ? '' : pathname
  let redirectPath = `/${targetLocale}${basePath}`

  // Ensure trailing slash for index
  if (basePath === '' && !redirectPath.endsWith('/')) {
    redirectPath = `${redirectPath}/`
  }

  // Add query string if present
  if (url.search) {
    redirectPath += url.search
  }

  return sendRedirect(event, redirectPath, 302)
})
