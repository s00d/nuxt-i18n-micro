import { defineEventHandler, sendRedirect } from 'h3'
import type { H3Event } from 'h3'
import type { Locale } from 'nuxt-i18n-micro'
import type { ModuleOptions } from '../../../module'
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
  // If the locale is missing or invalid, redirect to the route with the defaultLocale
  const locale = locales.find((loc: Locale) => loc.code === localeCode)

  // If the locale is missing or invalid, redirect to the route with the defaultLocale
  if (!locale) {
    const newPath = `/${i18nConfig.defaultLocale}/${pathParts.join('/')}`

    return sendRedirect(event, newPath, 301)
  }
})
