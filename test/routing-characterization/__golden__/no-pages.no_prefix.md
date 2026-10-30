# no-pages · no_prefix

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
| /en | null | en |  | null | English | en | null | null |
| /en/ | null | en |  | null | English | en | null | null |
| /de | null | en |  | null | English | de | null | null |
| /de/ | null | en |  | null | English | de | null | null |
| /about/ | null | en |  | null | English | null | null | null |
| /de/about/ | null | en |  | null | English | de | null | null |
| /missing | null | en |  | null | English | null | null | null |
| /de/missing | null | en |  | null | English | de | null | null |
| /xx/about | null | en |  | null | English | null | null | null |
| /de/de/about | null | en |  | null | English | de | null | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [—] |  | /?q=1#top [null] | /?q=1#top [null] | null | null | null |
| /en | /?q=1#top [—] |  | /?q=1#top [null] | /?q=1#top [null] | null | null | null |
| /en/ | /?q=1#top [—] |  | /?q=1#top [null] | /?q=1#top [null] | null | null | null |
| /de | /?q=1#top [—] |  | /?q=1#top [null] | /?q=1#top [null] | null | null | null |
| /de/ | /?q=1#top [—] |  | /?q=1#top [null] | /?q=1#top [null] | null | null | null |
| /about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | null | null | null |
| /de/about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | null | null | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [—] |  | /?q=1#top [null] | /?q=1#top [null] | null | null | null |
| /en | /?q=1#top [—] |  | /?q=1#top [null] | /?q=1#top [null] | null | null | null |
| /en/ | /?q=1#top [—] |  | /?q=1#top [null] | /?q=1#top [null] | null | null | null |
| /de | /?q=1#top [—] |  | /?q=1#top [null] | /?q=1#top [null] | null | null | null |
| /de/ | /?q=1#top [—] |  | /?q=1#top [null] | /?q=1#top [null] | null | null | null |
| /about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | null | null | null |
| /de/about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | null | null | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [—] |  | /?q=1#top [null] | /?q=1#top [null] | null | null | null |
| /en | /?q=1#top [—] |  | /?q=1#top [null] | /?q=1#top [null] | null | null | null |
| /en/ | /?q=1#top [—] |  | /?q=1#top [null] | /?q=1#top [null] | null | null | null |
| /de | /?q=1#top [—] |  | /?q=1#top [null] | /?q=1#top [null] | null | null | null |
| /de/ | /?q=1#top [—] |  | /?q=1#top [null] | /?q=1#top [null] | null | null | null |
| /about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | null | null | null |
| /de/about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | null | null | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name |
|---|

## Invariant breaks (0)

none
