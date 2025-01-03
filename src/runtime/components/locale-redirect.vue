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

if (globalLocaleRoutes && globalLocaleRoutes[currentPageName]) {
  const localizedRoutes = globalLocaleRoutes[currentPageName]
  if (localizedRoutes && localizedRoutes[defaultLocale]) {
    const localizedPath = localizedRoutes[defaultLocale]
    navigateTo(localizedPath, { redirectCode: 301, external: true })
  }
}
else if (!locales.includes(firstSegment)) {
  const newPath = `/${defaultLocale}${route.fullPath}`
  navigateTo(newPath, { redirectCode: 301, external: true })
}
else if (locales.includes(firstSegment) && globalLocaleRoutes && globalLocaleRoutes[currentLocalePageName]) {
  const localizedRoutes = globalLocaleRoutes[currentLocalePageName]
  if (localizedRoutes && localizedRoutes[firstSegment]) {
    const localizedPath = `/${firstSegment}${localizedRoutes[firstSegment]}`
    navigateTo(localizedPath, { redirectCode: 301, external: true })
  }
}
else {
  throw createError({
    statusCode: 404,
  })
}
</script>
