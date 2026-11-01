// What the server saw for this request, for `/debug`. Headers by name: a cookie value stays out, only the locale cookie's own.
const HEADERS = ['host', 'accept-language', 'x-forwarded-host', 'x-forwarded-proto']

export default defineEventHandler((event) => {
  const { locale, translations, load, loadsRemote, config } = (event.context.i18n ?? {}) as Record<string, any>
  return {
    variant: process.env.BENCH_VARIANT ?? null,
    node: process.version,
    headers: Object.fromEntries(HEADERS.map((name) => [name, getHeader(event, name) ?? null])),
    localeCookie: config?.localeCookie ? (getCookie(event, config.localeCookie) ?? null) : null,
    context: { locale, preloadedKeys: Object.keys(translations ?? {}).length, loader: typeof load === 'function', loadsRemote: Boolean(loadsRemote) },
    middleware: useLocaleServerMiddleware(event),
    routeRules: getRouteRules(event),
  }
})
