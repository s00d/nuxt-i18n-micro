# multi-domain · prefix

locales on their own domains (baseUrl, baseDefault)

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| localized-index | /:locale(en\|de\|fr) |  |  |
| localized-about | /:locale(en)/about |  |  |
| localized-about-de | /:locale(de)/ueber-uns |  |  |
| localized-about-fr | /:locale(fr)/a-propos |  |  |
| localized-blog-slug | /:locale(en\|de\|fr)/blog/:slug() |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| /de | localized-index | de | index | index | null | de | de | null |
| /de/blog/hello-world | localized-blog-slug | de | blog-slug | blog-slug | null | de | de | null |
| /de/ueber-uns | localized-about-de | de | about | about | null | de | de | null |
| /en | localized-index | en | index | index | null | en | en | null |
| /en/about | localized-about | en | about | about | null | en | en | null |
| /en/blog/hello-world | localized-blog-slug | en | blog-slug | blog-slug | null | en | en | null |
| /fr | localized-index | fr | index | index | null | fr | fr | null |
| /fr/a-propos | localized-about-fr | fr | about | about | null | fr | fr | null |
| /fr/blog/hello-world | localized-blog-slug | fr | blog-slug | blog-slug | null | fr | fr | null |
| / | null | en |  | index | null | null | null | null |
| /en/ | localized-index | en | index | index | null | en | en | null |
| /de/ | localized-index | de | index | index | null | de | de | null |
| /about/ | null | en |  | about | null | null | null | null |
| /de/about/ | null | de |  | null | null | de | de | null |
| /missing | null | en |  | null | null | null | null | null |
| /de/missing | null | de |  | null | null | de | de | null |
| /xx/about | null | en |  | null | null | null | null | null |
| /de/de/about | null | de |  | null | null | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| /de | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /de | null |
| /de/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world | null |
| /de/ueber-uns | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /de/ueber-uns | null |
| /en | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en | null |
| /en/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/about | null |
| /en/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world | null |
| /fr | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /fr | null |
| /fr/a-propos | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /fr/a-propos | null |
| /fr/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world | null |
| / | /?q=1#top [—] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en | /en |
| /en/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en/ | null |
| /de/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /de/ | null |
| /about/ | /about/?q=1#top [—] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/about/ | /en/about |
| /de/about/ | /de/about/?q=1#top [—] |  | /en/about/?q=1#top [localized-about] | /en/about/?q=1#top [localized-about] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | /en/missing | /en/missing |
| /de/missing | /de/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /en/xx/about?q=1#top [null] | /en/xx/about?q=1#top [null] | /en/xx/about | /en/xx/about |
| /de/de/about | /de/de/about?q=1#top [—] |  | /en/de/about?q=1#top [null] | /en/de/about?q=1#top [null] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| /de | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | /de | null |
| /de/blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | /de/blog/hello-world | null |
| /de/ueber-uns | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | /de/ueber-uns | null |
| /en | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | /en | null |
| /en/about | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | /en/about | null |
| /en/blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | /en/blog/hello-world | null |
| /fr | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | /fr | null |
| /fr/a-propos | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | /fr/a-propos | null |
| /fr/blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | /fr/blog/hello-world | null |
| / | /?q=1#top [—] |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | /en | /de |
| /en/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | /en/ | null |
| /de/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | /de/ | null |
| /about/ | /about/?q=1#top [—] |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | /en/about/ | /de/ueber-uns |
| /de/about/ | /de/about/?q=1#top [—] |  | https://example.de/about/?q=1#top [—] | https://example.de/about/?q=1#top [—] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | /en/missing | /de/missing |
| /de/missing | /de/missing?q=1#top [—] |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | https://example.de/xx/about?q=1#top [—] | https://example.de/xx/about?q=1#top [—] | /en/xx/about | /de/xx/about |
| /de/de/about | /de/de/about?q=1#top [—] |  | https://example.de/de/about?q=1#top [—] | https://example.de/de/about?q=1#top [—] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| /de | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | /de | null |
| /de/blog/hello-world | external https://example.fr/fr/blog/hello-world?q=1#top | external https://example.fr/fr/blog/hello-world-fr?q=1#top | https://example.fr/fr/blog/hello-world?q=1#top [—] | https://example.fr/fr/blog/hello-world?q=1#top [—] | /de/blog/hello-world | null |
| /de/ueber-uns | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | /de/ueber-uns | null |
| /en | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | /en | null |
| /en/about | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | /en/about | null |
| /en/blog/hello-world | external https://example.fr/fr/blog/hello-world?q=1#top | external https://example.fr/fr/blog/hello-world-fr?q=1#top | https://example.fr/fr/blog/hello-world?q=1#top [—] | https://example.fr/fr/blog/hello-world?q=1#top [—] | /en/blog/hello-world | null |
| /fr | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | /fr | null |
| /fr/a-propos | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | /fr/a-propos | null |
| /fr/blog/hello-world | external https://example.fr/fr/blog/hello-world?q=1#top | external https://example.fr/fr/blog/hello-world-fr?q=1#top | https://example.fr/fr/blog/hello-world?q=1#top [—] | https://example.fr/fr/blog/hello-world?q=1#top [—] | /fr/blog/hello-world | null |
| / | /?q=1#top [—] |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | /en | /fr |
| /en/ | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | /en/ | null |
| /de/ | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | /de/ | null |
| /about/ | /about/?q=1#top [—] |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | /en/about/ | /fr/a-propos |
| /de/about/ | /de/about/?q=1#top [—] |  | https://example.fr/fr/about/?q=1#top [—] | https://example.fr/fr/about/?q=1#top [—] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | https://example.fr/fr/missing?q=1#top [—] | https://example.fr/fr/missing?q=1#top [—] | /en/missing | /fr/missing |
| /de/missing | /de/missing?q=1#top [—] |  | https://example.fr/fr/missing?q=1#top [—] | https://example.fr/fr/missing?q=1#top [—] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | https://example.fr/fr/xx/about?q=1#top [—] | https://example.fr/fr/xx/about?q=1#top [—] | /en/xx/about | /fr/xx/about |
| /de/de/about | /de/de/about?q=1#top [—] |  | https://example.fr/fr/de/about?q=1#top [—] | https://example.fr/fr/de/about?q=1#top [—] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from /en | de from /en | fr from /en | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /en/about [localized-about] | https://example.de/ueber-uns [—] | https://example.fr/fr/a-propos [—] | /en/about [localized-about] | https://example.de/ueber-uns [—] | https://example.fr/fr/a-propos [—] | /en/about [localized-about] | https://example.de/ueber-uns [—] | https://example.fr/fr/a-propos [—] |
| blog-slug | /en/blog/hello-world [localized-blog-slug] | https://example.de/blog/hello-world [—] | https://example.fr/fr/blog/hello-world [—] | /en/blog/hello-world [localized-blog-slug] | https://example.de/blog/hello-world [—] | https://example.fr/fr/blog/hello-world [—] | /en/blog/hello-world [localized-blog-slug] | https://example.de/blog/hello-world [—] | https://example.fr/fr/blog/hello-world [—] |
| index | /en [localized-index] | https://example.de/ [—] | https://example.fr/fr [—] | /en [localized-index] | https://example.de/ [—] | https://example.fr/fr [—] | /en [localized-index] | https://example.de/ [—] | https://example.fr/fr [—] |

## Invariant breaks (0)

none
