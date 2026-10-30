# multi-domain · prefix_and_default

locales on their own domains (baseUrl, baseDefault)

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| about | /about |  |  |
| localized-about-de-default | /ueber-uns |  |  |
| blog-slug | /blog/:slug() |  |  |
| localized-index | /:locale(en\|de\|fr) |  |  |
| localized-about | /:locale(en)/about |  |  |
| localized-about-de | /:locale(de)/ueber-uns |  |  |
| localized-about-fr | /:locale(fr)/a-propos |  |  |
| localized-blog-slug | /:locale(en\|de\|fr)/blog/:slug() |  |  |

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
| /en | localized-index | en | index | index | null | en | en | null |
| /en/about | localized-about | en | about | about | null | en | en | null |
| /en/blog/hello-world | localized-blog-slug | en | blog-slug | blog-slug | null | en | en | null |
| /fr | localized-index | fr | index | index | null | fr | fr | null |
| /fr/a-propos | localized-about-fr | fr | about | about | null | fr | fr | null |
| /fr/blog/hello-world | localized-blog-slug | fr | blog-slug | blog-slug | null | fr | fr | null |
| /ueber-uns | localized-about-de-default | en | about | about | null | null | en | null |
| /en/ | localized-index | en | index | index | null | en | en | null |
| /de/ | localized-index | de | index | index | null | de | de | null |
| /about/ | about | en | about | about | null | null | en | null |
| /de/about/ | null | de | about | about | null | de | de | null |
| /missing | null | en |  | null | null | null | en | null |
| /de/missing | null | de |  | null | null | de | de | null |
| /xx/about | null | en |  | null | null | null | en | null |
| /de/de/about | null | de |  | null | null | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | null | en,de,fr |
| /blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,fr |
| /de | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /de/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | null | /en/blog/hello-world | en,de,fr |
| /de/ueber-uns | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | /en/about | en,de,fr |
| /en | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /en/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | null | en,de,fr |
| /en/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,fr |
| /fr | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /fr/a-propos | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | /en/about | en,de,fr |
| /fr/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | null | /en/blog/hello-world | en,de,fr |
| /ueber-uns | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | null | en,de,fr |
| /en/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /de/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /about/ | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | null | en,de,fr |
| /de/about/ | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | /en/about | en,de,fr |
| /missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | null | null | null |
| /de/missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | null | /en/missing | null |
| /xx/about | /en/xx/about?q=1#top [—] |  | /en/xx/about?q=1#top [null] | /en/xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /en/de/about?q=1#top [—] |  | /en/de/about?q=1#top [null] | /en/de/about?q=1#top [null] | null | /en/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,fr |
| /about | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,de,fr |
| /blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | null | null | en,de,fr |
| /de | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,fr |
| /de/blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | null | null | en,de,fr |
| /de/ueber-uns | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,de,fr |
| /en | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | /de | en,de,fr |
| /en/about | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | /de/ueber-uns | en,de,fr |
| /en/blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | null | /de/blog/hello-world | en,de,fr |
| /fr | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | /de | en,de,fr |
| /fr/a-propos | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | /de/ueber-uns | en,de,fr |
| /fr/blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | null | /de/blog/hello-world | en,de,fr |
| /ueber-uns | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,de,fr |
| /en/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | /de | en,de,fr |
| /de/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,fr |
| /about/ | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,de,fr |
| /de/about/ | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,de,fr |
| /missing | external https://example.de/missing?q=1#top |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | null | null | null |
| /de/missing | external https://example.de/missing?q=1#top |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | null | null | null |
| /xx/about | external https://example.de/xx/about?q=1#top |  | https://example.de/xx/about?q=1#top [—] | https://example.de/xx/about?q=1#top [—] | null | null | null |
| /de/de/about | external https://example.de/de/about?q=1#top |  | https://example.de/de/about?q=1#top [—] | https://example.de/de/about?q=1#top [—] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | null | null | en,de,fr |
| /about | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | null | null | en,de,fr |
| /blog/hello-world | external https://example.fr/fr/blog/hello-world?q=1#top | external https://example.fr/fr/blog/hello-world-fr?q=1#top | https://example.fr/fr/blog/hello-world?q=1#top [—] | https://example.fr/fr/blog/hello-world?q=1#top [—] | null | null | en,de,fr |
| /de | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | null | /fr | en,de,fr |
| /de/blog/hello-world | external https://example.fr/fr/blog/hello-world?q=1#top | external https://example.fr/fr/blog/hello-world-fr?q=1#top | https://example.fr/fr/blog/hello-world?q=1#top [—] | https://example.fr/fr/blog/hello-world?q=1#top [—] | null | /fr/blog/hello-world | en,de,fr |
| /de/ueber-uns | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | null | /fr/a-propos | en,de,fr |
| /en | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | null | /fr | en,de,fr |
| /en/about | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | null | /fr/a-propos | en,de,fr |
| /en/blog/hello-world | external https://example.fr/fr/blog/hello-world?q=1#top | external https://example.fr/fr/blog/hello-world-fr?q=1#top | https://example.fr/fr/blog/hello-world?q=1#top [—] | https://example.fr/fr/blog/hello-world?q=1#top [—] | null | /fr/blog/hello-world | en,de,fr |
| /fr | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | null | null | en,de,fr |
| /fr/a-propos | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | null | null | en,de,fr |
| /fr/blog/hello-world | external https://example.fr/fr/blog/hello-world?q=1#top | external https://example.fr/fr/blog/hello-world-fr?q=1#top | https://example.fr/fr/blog/hello-world?q=1#top [—] | https://example.fr/fr/blog/hello-world?q=1#top [—] | null | null | en,de,fr |
| /ueber-uns | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | null | null | en,de,fr |
| /en/ | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | null | /fr | en,de,fr |
| /de/ | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | null | /fr | en,de,fr |
| /about/ | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | null | null | en,de,fr |
| /de/about/ | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | null | /fr/a-propos | en,de,fr |
| /missing | external https://example.fr/fr/missing?q=1#top |  | https://example.fr/fr/missing?q=1#top [—] | https://example.fr/fr/missing?q=1#top [—] | null | null | null |
| /de/missing | external https://example.fr/fr/missing?q=1#top |  | https://example.fr/fr/missing?q=1#top [—] | https://example.fr/fr/missing?q=1#top [—] | null | /fr/missing | null |
| /xx/about | external https://example.fr/fr/xx/about?q=1#top |  | https://example.fr/fr/xx/about?q=1#top [—] | https://example.fr/fr/xx/about?q=1#top [—] | null | null | null |
| /de/de/about | external https://example.fr/fr/de/about?q=1#top |  | https://example.fr/fr/de/about?q=1#top [—] | https://example.fr/fr/de/about?q=1#top [—] | null | /fr/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /en/about [localized-about] | https://example.de/ueber-uns [—] | https://example.fr/fr/a-propos [—] | /en/about [localized-about] | https://example.de/ueber-uns [—] | https://example.fr/fr/a-propos [—] | /en/about [localized-about] | https://example.de/ueber-uns [—] | https://example.fr/fr/a-propos [—] |
| blog-slug | /en/blog/hello-world [localized-blog-slug] | https://example.de/blog/hello-world [—] | https://example.fr/fr/blog/hello-world [—] | /en/blog/hello-world [localized-blog-slug] | https://example.de/blog/hello-world [—] | https://example.fr/fr/blog/hello-world [—] | /en/blog/hello-world [localized-blog-slug] | https://example.de/blog/hello-world [—] | https://example.fr/fr/blog/hello-world [—] |
| index | /en [localized-index] | https://example.de/ [—] | https://example.fr/fr [—] | /en [localized-index] | https://example.de/ [—] | https://example.fr/fr [—] | /en [localized-index] | https://example.de/ [—] | https://example.fr/fr [—] |

## Invariant breaks (0)

none
