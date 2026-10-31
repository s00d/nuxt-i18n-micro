import { createI18n } from '@i18n-micro/solid'
import type { Locale } from '@i18n-micro/types'
import { BIG_KEYS, bigMessages, datetimeFormats, locales, messages, numberFormats, routeMessages } from '../../../../benchmark/integrations/catalogue'

export const defaultLocale = 'en'

export const localesConfig: Locale[] = locales.map(({ code, iso, dir, name }) => ({ code, iso, dir: dir as 'ltr' | 'rtl', displayName: name }))

export function createBenchI18n(locale: string, route = 'index') {
  const i18n = createI18n({
    locale,
    fallbackLocale: defaultLocale,
    messages: messages as never,
    numberFormats,
    datetimeFormats,
    timeZone: 'UTC',
    missingWarn: false,
  })
  // `routeMessages` as an option is new in 2.0
  for (const [name, perLocale] of Object.entries(routeMessages)) {
    for (const [code, dictionary] of Object.entries(perLocale)) i18n.addRouteTranslations(code, name, dictionary as never)
  }
  for (const code of ['en', 'de']) i18n.addRouteTranslations(code, 'big', bigMessages(BIG_KEYS, code) as never)
  i18n.setRoute(route)
  return i18n
}
