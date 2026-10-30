# disabled-locale · prefix_except_default

a locale disabled in the config: no records, the strategy still knows it

locales: en, de · default: en

## Generated routes

| name | path | alias | redirect | meta.i18n |
|---|---|---|---|---|
| index | / |  |  | index: en |
| about | /about |  |  | about: en |
| blog-slug | /blog/:slug() |  |  | blog-slug: en |
| localized-index | /:locale(de) |  |  | index: de |
| localized-about | /:locale(de)/about |  |  | about: de |
| localized-blog-slug | /:locale(de)/blog/:slug() |  |  | blog-slug: de |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | null | null | en | null |
| /about | about | en | about | about | null | null | en | null |
| /blog/hello-world | blog-slug | en | blog-slug | blog-slug | null | null | en | null |
| /de | localized-index | de | index | index | null | de | de | null |
| /de/about | localized-about | de | about | about | null | de | de | null |
| /de/blog/hello-world | localized-blog-slug | de | blog-slug | blog-slug | null | de | de | null |
| /en | null | en | index | index | null | en | en | Default locale should not have prefix |
| /en/ | null | en | index | index | null | en | en | Default locale should not have prefix |
| /de/ | localized-index | de | index | index | null | de | de | null |
| /about/ | about | en | about | about | null | null | en | null |
| /de/about/ | localized-about | de | about | about | null | de | de | null |
| /missing | null | en |  | null | null | null | en | null |
| /de/missing | null | de |  | null | null | de | de | null |
| /xx/about | null | en |  | null | null | null | en | null |
| /de/de/about | null | de | about | about | null | de | de | null |
| /es | null | en |  | null | null | null | en | Locale disabled |
| /es/about | null | en |  | null | null | null | en | Locale disabled |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de |
| /de/about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,de |
| /de/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | /blog/hello-world | en,de |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de |
| /de/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,de |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | /missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,de |
| /es | /es?q=1#top [—] |  | /es?q=1#top [null] | /es?q=1#top [null] | null | null | null |
| /es/about | /es/about?q=1#top [—] |  | /es/about?q=1#top [null] | /es/about?q=1#top [null] | null | null | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | /de | en,de |
| /about | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | /de/about | /de/about | en,de |
| /blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world | /de/blog/hello-world | en,de |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de |
| /de/about | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | null | null | en,de |
| /de/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de |
| /about/ | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | /de/about | /de/about | en,de |
| /de/about/ | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | null | null | en,de |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | /de/missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | null | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /de/xx/about | /de/xx/about | null |
| /de/de/about | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | null | null | en,de |
| /es | /de/es?q=1#top [—] |  | /de/es?q=1#top [null] | /de/es?q=1#top [null] | null | null | null |
| /es/about | /de/es/about?q=1#top [—] |  | /de/es/about?q=1#top [null] | /de/es/about?q=1#top [null] | null | null | null |

## To es

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de |
| /de | /de?q=1#top [localized-index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de |
| /de/about | /de/about?q=1#top [localized-about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de |
| /de/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de |
| /en | /en?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de |
| /en/ | /en/?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de |
| /de/ | /de?q=1#top [localized-index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de |
| /de/about/ | /de/about?q=1#top [localized-about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /es/missing | /es/missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | /es/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /es/xx/about | /es/xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de |
| /es | /es?q=1#top [—] |  | /es?q=1#top [null] | /es?q=1#top [null] | null | null | null |
| /es/about | /es/about?q=1#top [—] |  | /es/about?q=1#top [null] | /es/about?q=1#top [null] | null | null | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | en from /de | de from /de |
|---|---|---|---|---|
| about | /about [about] | /de/about [localized-about] | /about [about] | /de/about [localized-about] |
| blog-slug | /blog/hello-world [blog-slug] | /de/blog/hello-world [localized-blog-slug] | /blog/hello-world [blog-slug] | /de/blog/hello-world [localized-blog-slug] |
| index | / [index] | /de [localized-index] | / [index] | /de [localized-index] |

## Invariant breaks (0)

none
