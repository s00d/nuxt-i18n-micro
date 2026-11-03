import { createI18n } from '@i18n-micro/react'
import type { Locale } from '@i18n-micro/types'
import { BIG_KEYS, bigMessages, datetimeFormats, locales, messages, numberFormats, routeMessages } from '../../../../benchmark/integrations/catalogue'

export const defaultLocale = 'en'

export const localesConfig: Locale[] = locales.map(({ code, iso, dir, name }) => ({ code, iso, dir: dir as 'ltr' | 'rtl', displayName: name }))

export function createBenchI18n(locale: string, route = 'index') {
  const i18n = createI18n({
    locale,
    fallbackLocale: defaultLocale,
    messages: messages as never,
    routeMessages: routeMessages as never,
    numberFormats,
    datetimeFormats,
    timeZone: 'UTC',
    missingWarn: false,
  })
  for (const code of ['en', 'de']) i18n.addRouteTranslations(code, 'big', bigMessages(BIG_KEYS, code) as never)
  i18n.setRoute(route)
  return i18n
}
