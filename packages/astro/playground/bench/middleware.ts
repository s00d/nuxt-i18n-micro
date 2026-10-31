// Variant `astro-strategy`: the app's own middleware with a strategy of its own, every locale prefixed. The other variants use the integration's.
import { createAstroRouterAdapter, createI18n, createI18nMiddleware, type I18nRoutingStrategy } from '@i18n-micro/astro'
import { defineMiddleware } from 'astro:middleware'
import { locales, messages, routeMessages } from '../../../../benchmark/integrations/catalogue'

const localesConfig = locales.map(({ code, iso, name }) => ({ code, iso, displayName: name }))
const codes = locales.map((locale) => locale.code)
const defaults = createAstroRouterAdapter(localesConfig, 'en')

const prefixAll = (path: string, locale: string): string => {
  const parts = path.split('/').filter(Boolean)
  if (codes.includes(parts[0] ?? '')) parts.shift()
  return `/${[locale, ...parts].join('/')}`
}
const strategy: I18nRoutingStrategy = {
  ...defaults,
  resolvePath: (to, locale) => prefixAll(typeof to === 'string' ? to : (to.path ?? '/'), locale),
  switchLocalePath: prefixAll,
  localizePath: prefixAll,
}

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: messages as never,
  routeMessages: routeMessages as never,
  missingWarn: false,
})

const own = createI18nMiddleware({
  i18n,
  defaultLocale: 'en',
  locales: codes,
  localeObjects: localesConfig,
  routingStrategy: strategy,
  redirectToDefault: true,
})

export const onRequest = defineMiddleware((context, next) => (process.env.BENCH_STRATEGY === 'prefix-all' ? own(context, next) : next()))
