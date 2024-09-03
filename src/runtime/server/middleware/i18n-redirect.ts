import { defineEventHandler, sendRedirect } from 'h3'
import type { H3Event } from 'h3'
import type { ModuleOptions, Locale } from '../../../types'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig()
  const i18nConfig = config.public.i18nConfig as ModuleOptions

  // Ensure defaultLocale is defined
  if (!i18nConfig.defaultLocale) {
    throw new Error('defaultLocale is not defined in the module configuration')
  }

  const locales = i18nConfig.locales || []

  const pathParts = event.path.split('/').filter(Boolean)
  const localeCode = pathParts[0]

  // Check if the last part of the path has a file extension (e.g., data.json?v=123456)
  const lastPart = pathParts[pathParts.length - 1]
  const hasFileExtension = /\.[^/?]+(?:\?.*)?$/.test(lastPart)

  // If the last part contains a file extension, do not perform redirection
  if (hasFileExtension) {
    return
  }

  // If the locale is missing or invalid, redirect to the route with the defaultLocale
  const locale = locales.find((loc: Locale) => loc.code === localeCode)

  // If the locale is missing or invalid, redirect to the route with the defaultLocale
  if (!locale) {
    const newPath = `/${i18nConfig.defaultLocale}/${pathParts.join('/')}`

    return sendRedirect(event, newPath, 301)
  }
})
