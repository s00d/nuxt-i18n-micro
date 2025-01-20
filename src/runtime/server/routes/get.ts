import { defineEventHandler } from 'h3'
import type { ModuleOptionsExtend, Translations, Translation } from 'nuxt-i18n-micro-types'
import { prefixStorage } from 'unstorage'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { createError, useRuntimeConfig, useStorage } from '#imports'

const serverStorage = prefixStorage<Translations>(useStorage(), 'i18n-locales')

export default defineEventHandler(async (event) => {
  const { page, locale } = event.context.params as { page: string, locale: string }

  const config = useRuntimeConfig()
  const { customRegexMatcher, locales } = config.public.i18nConfig as unknown as ModuleOptionsExtend

  if (customRegexMatcher && locales && !locales.map(l => l.code).includes(locale)) {
    throw createError({ statusCode: 404 })
  }

  const cacheKey = `${locale}:${page}`

  if (await serverStorage.hasItem(cacheKey)) {
    const rawContent: Translation | string = await serverStorage.getItem<Translation | string>(cacheKey) || {}
    return typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent
  }

  return {}
})
