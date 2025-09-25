<template>
  <div />
</template>

<script setup>
import { useRoute, useI18n, createError, navigateTo, useRuntimeConfig } from '#imports'
import { isInternalPath } from '../../utils'

const route = useRoute()
const { $getLocales, $defaultLocale } = useI18n()
const config = useRuntimeConfig()

const locales = $getLocales().map(locale => locale.code)
const defaultLocale = $defaultLocale() || 'en'
const pathSegments = route.fullPath.split('/')
const firstSegment = pathSegments[1]

// Check if this path should be excluded from i18n processing
const excludePatterns = config.public.i18nConfig?.excludePatterns
if (isInternalPath(route.fullPath, excludePatterns)) {
  // This is a static file or excluded path, let Nuxt handle it normally
  throw createError({
    statusCode: 404,
    statusMessage: 'Static file - should not be processed by i18n',
  })
}

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
else {
  throw createError({
    statusCode: 404,
  })
}
</script>
