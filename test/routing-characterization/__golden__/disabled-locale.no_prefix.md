# disabled-locale · no_prefix

a locale disabled in the config: no records, the strategy still knows it

locales: en, de · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| about | /about |  |  |
| blog-slug | /blog/:slug() |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | null | null | null | null |
| /about | about | en | about | about | null | null | null | null |
| /blog/hello-world | blog-slug | en | blog-slug | blog-slug | null | null | null | null |
| /en | null | en | index | index | null | en | null | null |
| /en/ | null | en | index | index | null | en | null | null |
| /de | null | en | index | index | null | de | null | null |
| /de/ | null | en | index | index | null | de | null | null |
| /about/ | about | en | about | about | null | null | null | null |
| /de/about/ | null | en | about | about | null | de | null | null |
| /missing | null | en |  | null | null | null | null | null |
| /de/missing | null | en |  | null | null | de | null | null |
| /xx/about | null | en |  | null | null | null | null | null |
| /de/de/about | null | en |  | null | null | de | null | null |
| /es | null | en |  | null | null | null | null | null |
| /es/about | null | en |  | null | null | null | null | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de |
| /de/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |
| /es | /es?q=1#top [—] |  | /es?q=1#top [null] | /es?q=1#top [null] | null | null | null |
| /es/about | /es/about?q=1#top [—] |  | /es/about?q=1#top [null] | /es/about?q=1#top [null] | null | null | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-de?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de |
| /de/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |
| /es | /es?q=1#top [—] |  | /es?q=1#top [null] | /es?q=1#top [null] | null | null | null |
| /es/about | /es/about?q=1#top [—] |  | /es/about?q=1#top [null] | /es/about?q=1#top [null] | null | null | null |

## To es

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | / [index] |  | / [—] | / [—] | null | null | en,de |
| /about | / [index] |  | / [—] | / [—] | null | null | en,de |
| /blog/hello-world | / [index] | / [index] | / [—] | / [—] | null | null | en,de |
| /en | / [index] |  | / [—] | / [—] | null | null | en,de |
| /en/ | / [index] |  | / [—] | / [—] | null | null | en,de |
| /de | / [index] |  | / [—] | / [—] | null | null | en,de |
| /de/ | / [index] |  | / [—] | / [—] | null | null | en,de |
| /about/ | / [index] |  | / [—] | / [—] | null | null | en,de |
| /de/about/ | / [index] |  | / [—] | / [—] | null | null | en,de |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |
| /es | /es?q=1#top [—] |  | /es?q=1#top [null] | /es?q=1#top [null] | null | null | null |
| /es/about | /es/about?q=1#top [—] |  | /es/about?q=1#top [null] | /es/about?q=1#top [null] | null | null | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / |
|---|---|---|
| about | /about [about] | /about [about] |
| blog-slug | /blog/hello-world [blog-slug] | /blog/hello-world [blog-slug] |
| index | / [index] | / [index] |

## Invariant breaks (0)

none
