# no-pages · prefix

pages: false: Nuxt's stub router, no records at all, every URL is read from its prefix

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect | meta.i18n |
|---|---|---|---|---|

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | null | en |  | null | English | null | null | null |
| /en | null | en |  | null | English | en | en | null |
| /en/ | null | en |  | null | English | en | en | null |
| /de | null | de |  | null | Deutsch | de | de | null |
| /de/ | null | de |  | null | Deutsch | de | de | null |
| /about/ | null | en |  | null | English | null | null | null |
| /de/about/ | null | de |  | null | Deutsch | de | de | null |
| /missing | null | en |  | null | English | null | null | null |
| /de/missing | null | de |  | null | Deutsch | de | de | null |
| /xx/about | null | en |  | null | English | null | null | null |
| /de/de/about | null | de |  | null | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /en?q=1#top [—] |  | /en?q=1#top [null] | /en?q=1#top [null] | /en | /en | null |
| /en | /en?q=1#top [—] |  | /en?q=1#top [null] | /en?q=1#top [null] | null | null | null |
| /en/ | /en?q=1#top [—] |  | /en?q=1#top [null] | /en?q=1#top [null] | null | null | null |
| /de | /en?q=1#top [—] |  | /en?q=1#top [null] | /en?q=1#top [null] | null | /en | null |
| /de/ | /en?q=1#top [—] |  | /en?q=1#top [null] | /en?q=1#top [null] | null | /en | null |
| /about/ | /en/about/?q=1#top [—] |  | /en/about/?q=1#top [null] | /en/about/?q=1#top [null] | /en/about | /en/about | null |
| /de/about/ | /en/about/?q=1#top [—] |  | /en/about/?q=1#top [null] | /en/about/?q=1#top [null] | null | /en/about | null |
| /missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | /en/missing | /en/missing | null |
| /de/missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | null | /en/missing | null |
| /xx/about | /en/xx/about?q=1#top [—] |  | /en/xx/about?q=1#top [null] | /en/xx/about?q=1#top [null] | /en/xx/about | /en/xx/about | null |
| /de/de/about | /en/de/about?q=1#top [—] |  | /en/de/about?q=1#top [null] | /en/de/about?q=1#top [null] | null | /en/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /de?q=1#top [—] |  | /de?q=1#top [null] | /de?q=1#top [null] | /de | /de | null |
| /en | /de?q=1#top [—] |  | /de?q=1#top [null] | /de?q=1#top [null] | null | /de | null |
| /en/ | /de?q=1#top [—] |  | /de?q=1#top [null] | /de?q=1#top [null] | null | /de | null |
| /de | /de?q=1#top [—] |  | /de?q=1#top [null] | /de?q=1#top [null] | null | null | null |
| /de/ | /de?q=1#top [—] |  | /de?q=1#top [null] | /de?q=1#top [null] | null | null | null |
| /about/ | /de/about/?q=1#top [—] |  | /de/about/?q=1#top [null] | /de/about/?q=1#top [null] | /de/about | /de/about | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /de/about/?q=1#top [null] | /de/about/?q=1#top [null] | null | null | null |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | /de/missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | null | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /de/xx/about | /de/xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /fr?q=1#top [—] |  | /fr?q=1#top [null] | /fr?q=1#top [null] | /fr | /fr | null |
| /en | /fr?q=1#top [—] |  | /fr?q=1#top [null] | /fr?q=1#top [null] | null | /fr | null |
| /en/ | /fr?q=1#top [—] |  | /fr?q=1#top [null] | /fr?q=1#top [null] | null | /fr | null |
| /de | /fr?q=1#top [—] |  | /fr?q=1#top [null] | /fr?q=1#top [null] | null | /fr | null |
| /de/ | /fr?q=1#top [—] |  | /fr?q=1#top [null] | /fr?q=1#top [null] | null | /fr | null |
| /about/ | /fr/about/?q=1#top [—] |  | /fr/about/?q=1#top [null] | /fr/about/?q=1#top [null] | /fr/about | /fr/about | null |
| /de/about/ | /fr/about/?q=1#top [—] |  | /fr/about/?q=1#top [null] | /fr/about/?q=1#top [null] | null | /fr/about | null |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /fr/missing | /fr/missing | null |
| /de/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | /fr/missing | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | /fr/xx/about | /fr/xx/about | null |
| /de/de/about | /fr/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | null | /fr/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name |
|---|

## Invariant breaks (0)

none
