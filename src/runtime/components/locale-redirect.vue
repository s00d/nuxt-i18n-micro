<template>
  <div />
</template>

<script setup>
import { useRoute, useI18n, createError, navigateTo } from '#imports'

const route = useRoute()
const { $getLocales, $defaultLocale } = useI18n()

const locales = $getLocales().map(locale => locale.code)
const defaultLocale = $defaultLocale() || 'en'
const pathSegments = route.fullPath.split('/')
const firstSegment = pathSegments[1]

const generateRouteName = (segments) => {
  return segments
    .slice(1)
    .map(segment => segment.replace(/:/g, ''))
    .join('-')
}

const generateLocaleRouteName = (segments) => {
  return segments
    .filter(segment => segment && segment.trim() !== '')
    .slice(1)
    .map(segment => segment.replace(/:/g, ''))
    .join('-')
}

const currentPageName = generateRouteName(pathSegments)
const currentLocalePageName = generateLocaleRouteName(pathSegments)
const globalLocaleRoutes = route.meta.globalLocaleRoutes ?? {}

const handleRedirect = (path) => {
  if (import.meta.client) {
    window.history.replaceState(null, '', path) // Заменяем текущую запись в истории
    location.assign(path) // Перенаправляем на целевую страницу
  }
  else {
    navigateTo(path, { redirectCode: 301, external: true })
  }
}

if (globalLocaleRoutes && globalLocaleRoutes[currentPageName]) {
  const localizedRoutes = globalLocaleRoutes[currentPageName]
  if (localizedRoutes && localizedRoutes[defaultLocale]) {
    const localizedPath = localizedRoutes[defaultLocale]
    if (route.fullPath !== localizedPath) {
      handleRedirect(localizedPath)
    }
  }
}
else if (!locales.includes(firstSegment)) {
  const newPath = `/${defaultLocale}${route.fullPath}`
  if (route.fullPath !== newPath) {
    handleRedirect(newPath)
  }
}
else if (locales.includes(firstSegment) && globalLocaleRoutes && globalLocaleRoutes[currentLocalePageName]) {
  const localizedRoutes = globalLocaleRoutes[currentLocalePageName]
  if (localizedRoutes && localizedRoutes[firstSegment]) {
    const localizedPath = `/${firstSegment}${localizedRoutes[firstSegment]}`
    if (route.fullPath !== localizedPath) {
      handleRedirect(localizedPath)
    }
  }
}
else if (locales.includes(firstSegment)) {
  // If the first segment is a valid locale but no specific routing rules apply,
  // let the route continue to be handled by other route handlers (e.g., Nuxt Content)
  // This prevents 404 errors on catch-all routes like /:slug(.*)* with locale prefixes
  // No action needed - just let the route through
}
else {
  // Only throw 404 for routes that don't have valid locale prefixes and aren't handled above
  throw createError({
    statusCode: 404,
  })
}
</script>
