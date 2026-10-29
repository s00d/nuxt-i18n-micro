# multi-domain · prefix_except_default

locales on their own domains (baseUrl, baseDefault)

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| about | /about |  |  |
| blog-slug | /blog/:slug() |  |  |
| localized-index | /:locale(de\|fr) |  |  |
| localized-about-de | /:locale(de)/ueber-uns |  |  |
| localized-about-fr | /:locale(fr)/a-propos |  |  |
| localized-blog-slug | /:locale(de\|fr)/blog/:slug() |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | null | null | en | null |
| /about | about | en | about | about | null | null | en | null |
| /blog/hello-world | blog-slug | en | blog-slug | blog-slug | null | null | en | null |
| /de | localized-index | de | index | index | null | de | de | null |
| /de/blog/hello-world | localized-blog-slug | de | blog-slug | blog-slug | null | de | de | null |
| /de/ueber-uns | localized-about-de | de | about | about | null | de | de | null |
| /fr | localized-index | fr | index | index | null | fr | fr | null |
| /fr/a-propos | localized-about-fr | fr | about | about | null | fr | fr | null |
| /fr/blog/hello-world | localized-blog-slug | fr | blog-slug | blog-slug | null | fr | fr | null |
| /en | null | en | index | index | null | en | en | Default locale should not have prefix |
| /en/ | null | en | index | index | null | en | en | Default locale should not have prefix |
| /de/ | localized-index | de | index | index | null | de | de | null |
| /about/ | about | en | about | about | null | null | en | null |
| /de/about/ | null | de | about | about | null | de | de | null |
| /missing | null | en |  | null | null | null | en | null |
| /de/missing | null | de |  | null | null | de | de | null |
| /xx/about | null | en |  | null | null | null | en | null |
| /de/de/about | null | de |  | null | null | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | null |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world | null |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /de/blog/hello-world | null |
| /de/ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /de/ueber-uns | null |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /fr | null |
| /fr/a-propos | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /fr/a-propos | null |
| /fr/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /fr/blog/hello-world | null |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about/ | null |
| /de/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | / | /de |
| /about | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | /about | /de/ueber-uns |
| /blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | /blog/hello-world | /de/blog/hello-world |
| /de | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | /de | null |
| /de/blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | /de/blog/hello-world | null |
| /de/ueber-uns | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | /de/ueber-uns | null |
| /fr | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | /fr | null |
| /fr/a-propos | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | /fr/a-propos | null |
| /fr/blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | /fr/blog/hello-world | null |
| /en | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | /en | null |
| /en/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | /en/ | null |
| /de/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | /de/ | null |
| /about/ | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | /about/ | /de/ueber-uns |
| /de/about/ | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | /de/about/ | null |
| /missing | external https://example.de/missing?q=1#top |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | /missing | /de/missing |
| /de/missing | external https://example.de/missing?q=1#top |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | /de/missing | null |
| /xx/about | external https://example.de/xx/about?q=1#top |  | https://example.de/xx/about?q=1#top [—] | https://example.de/xx/about?q=1#top [—] | /xx/about | /de/xx/about |
| /de/de/about | external https://example.de/de/about?q=1#top |  | https://example.de/de/about?q=1#top [—] | https://example.de/de/about?q=1#top [—] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | / | /fr |
| /about | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | /about | /fr/a-propos |
| /blog/hello-world | external https://example.fr/fr/blog/hello-world?q=1#top | external https://example.fr/fr/blog/hello-world-fr?q=1#top | https://example.fr/fr/blog/hello-world?q=1#top [—] | https://example.fr/fr/blog/hello-world?q=1#top [—] | /blog/hello-world | /fr/blog/hello-world |
| /de | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | /de | null |
| /de/blog/hello-world | external https://example.fr/fr/blog/hello-world?q=1#top | external https://example.fr/fr/blog/hello-world-fr?q=1#top | https://example.fr/fr/blog/hello-world?q=1#top [—] | https://example.fr/fr/blog/hello-world?q=1#top [—] | /de/blog/hello-world | null |
| /de/ueber-uns | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | /de/ueber-uns | null |
| /fr | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | /fr | null |
| /fr/a-propos | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | /fr/a-propos | null |
| /fr/blog/hello-world | external https://example.fr/fr/blog/hello-world?q=1#top | external https://example.fr/fr/blog/hello-world-fr?q=1#top | https://example.fr/fr/blog/hello-world?q=1#top [—] | https://example.fr/fr/blog/hello-world?q=1#top [—] | /fr/blog/hello-world | null |
| /en | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | /en | null |
| /en/ | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | /en/ | null |
| /de/ | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | /de/ | null |
| /about/ | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | /about/ | /fr/a-propos |
| /de/about/ | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | /de/about/ | null |
| /missing | external https://example.fr/fr/missing?q=1#top |  | https://example.fr/fr/missing?q=1#top [—] | https://example.fr/fr/missing?q=1#top [—] | /missing | /fr/missing |
| /de/missing | external https://example.fr/fr/missing?q=1#top |  | https://example.fr/fr/missing?q=1#top [—] | https://example.fr/fr/missing?q=1#top [—] | /de/missing | null |
| /xx/about | external https://example.fr/fr/xx/about?q=1#top |  | https://example.fr/fr/xx/about?q=1#top [—] | https://example.fr/fr/xx/about?q=1#top [—] | /xx/about | /fr/xx/about |
| /de/de/about | external https://example.fr/fr/de/about?q=1#top |  | https://example.fr/fr/de/about?q=1#top [—] | https://example.fr/fr/de/about?q=1#top [—] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /about [about] | https://example.de/ueber-uns [—] | https://example.fr/fr/a-propos [—] | /about [about] | https://example.de/ueber-uns [—] | https://example.fr/fr/a-propos [—] | /about [about] | https://example.de/ueber-uns [—] | https://example.fr/fr/a-propos [—] |
| blog-slug | /blog/hello-world [blog-slug] | https://example.de/blog/hello-world [—] | https://example.fr/fr/blog/hello-world [—] | /blog/hello-world [blog-slug] | https://example.de/blog/hello-world [—] | https://example.fr/fr/blog/hello-world [—] | /blog/hello-world [blog-slug] | https://example.de/blog/hello-world [—] | https://example.fr/fr/blog/hello-world [—] |
| index | / [index] | https://example.de/ [—] | https://example.fr/fr [—] | / [index] | https://example.de/ [—] | https://example.fr/fr [—] | / [index] | https://example.de/ [—] | https://example.fr/fr [—] |

## Invariant breaks (0)

none
