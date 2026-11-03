import { createI18n, type I18nRoutingStrategy } from '@i18n-micro/vue'
import type { Locale } from '@i18n-micro/types'
import { BIG_KEYS, bigMessages, datetimeFormats, locales, messages, numberFormats, routeMessages } from '../../../../benchmark/integrations/catalogue'

export const defaultLocale = 'en'

export const localesConfig: Locale[] = locales.map(({ code, iso, dir, name }) => ({ code, iso, dir: dir as 'ltr' | 'rtl', displayName: name }))

export function createBenchI18n(locale: string, routingStrategy?: I18nRoutingStrategy) {
  const i18n = createI18n({
    locale,
    fallbackLocale: defaultLocale,
    messages: messages as never,
    numberFormats,
    datetimeFormats,
    timeZone: 'UTC',
    missingWarn: false,
    locales: localesConfig,
    defaultLocale,
    routingStrategy,
  })
  for (const [route, perLocale] of Object.entries(routeMessages)) {
    for (const [code, dictionary] of Object.entries(perLocale)) i18n.global.addRouteTranslations(code, route, dictionary as never)
  }
  for (const code of ['en', 'de']) i18n.global.addRouteTranslations(code, 'big', bigMessages(BIG_KEYS, code) as never)
  return i18n
}
