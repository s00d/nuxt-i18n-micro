# domains · prefix_except_default

one build on two domains: a default per host, a second locale on one host, a locale on every host, a page of one locale

locales: en, de, nl, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| about | /about |  |  |
| blog-slug | /blog/:slug() |  |  |
| localized-index | /:locale(de\|nl\|fr) |  |  |
| localized-about | /:locale(nl)/about |  |  |
| localized-about-de | /:locale(de)/ueber-uns |  |  |
| localized-about-fr | /:locale(fr)/a-propos |  |  |
| localized-blog-slug | /:locale(de\|nl\|fr)/blog/:slug() |  |  |
| localized-de-only | /:locale(de)/de-only |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | null | null | en | null |
| /about | about | en | about | about | null | null | en | null |
| /blog/hello-world | blog-slug | en | blog-slug | blog-slug | null | null | en | null |
| /de | localized-index | de | index | index | null | de | de | null |
| /de/blog/hello-world | localized-blog-slug | de | blog-slug | blog-slug | null | de | de | null |
| /de/de-only | localized-de-only | de | de-only | de-only | null | de | de | null |
| /de/ueber-uns | localized-about-de | de | about | about | null | de | de | null |
| /fr | localized-index | fr | index | index | null | fr | fr | null |
| /fr/a-propos | localized-about-fr | fr | about | about | null | fr | fr | null |
| /fr/blog/hello-world | localized-blog-slug | fr | blog-slug | blog-slug | null | fr | fr | null |
| /nl | localized-index | nl | index | index | null | nl | nl | null |
| /nl/about | localized-about | nl | about | about | null | nl | nl | null |
| /nl/blog/hello-world | localized-blog-slug | nl | blog-slug | blog-slug | null | nl | nl | null |
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

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /about | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,nl,de,fr |
| /blog/hello-world | external https://example.com/blog/hello-world?q=1#top | external https://example.com/blog/hello-world-en?q=1#top | https://example.com/blog/hello-world?q=1#top [—] | https://example.com/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /de | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | / | en,de,nl,fr |
| /de/blog/hello-world | external https://example.com/blog/hello-world?q=1#top | external https://example.com/blog/hello-world-en?q=1#top | https://example.com/blog/hello-world?q=1#top [—] | https://example.com/blog/hello-world?q=1#top [—] | null | /blog/hello-world | en,de,nl,fr |
| /de/de-only | external https://example.com/ |  | https://example.com/ [—] | https://example.com/ [—] | null | null | de |
| /de/ueber-uns | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | /about | en,nl,de,fr |
| /fr | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | / | en,de,nl,fr |
| /fr/a-propos | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | /about | en,nl,de,fr |
| /fr/blog/hello-world | external https://example.com/blog/hello-world?q=1#top | external https://example.com/blog/hello-world-en?q=1#top | https://example.com/blog/hello-world?q=1#top [—] | https://example.com/blog/hello-world?q=1#top [—] | null | /blog/hello-world | en,de,nl,fr |
| /nl | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | / | en,de,nl,fr |
| /nl/about | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | /about | en,nl,de,fr |
| /nl/blog/hello-world | external https://example.com/blog/hello-world?q=1#top | external https://example.com/blog/hello-world-en?q=1#top | https://example.com/blog/hello-world?q=1#top [—] | https://example.com/blog/hello-world?q=1#top [—] | null | /blog/hello-world | en,de,nl,fr |
| /en | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /en/ | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /de/ | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | / | en,de,nl,fr |
| /about/ | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,nl,de,fr |
| /de/about/ | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | /about | en,nl,de,fr |
| /missing | external https://example.com/missing?q=1#top |  | https://example.com/missing?q=1#top [—] | https://example.com/missing?q=1#top [—] | null | null | null |
| /de/missing | external https://example.com/missing?q=1#top |  | https://example.com/missing?q=1#top [—] | https://example.com/missing?q=1#top [—] | null | /missing | null |
| /xx/about | external https://example.com/xx/about?q=1#top |  | https://example.com/xx/about?q=1#top [—] | https://example.com/xx/about?q=1#top [—] | null | null | null |
| /de/de/about | external https://example.com/de/about?q=1#top |  | https://example.com/de/about?q=1#top [—] | https://example.com/de/about?q=1#top [—] | null | /de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | /de | /de | en,de,nl,fr |
| /about | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | /de/ueber-uns | /de/ueber-uns | en,nl,de,fr |
| /blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | /de/blog/hello-world | /de/blog/hello-world | en,de,nl,fr |
| /de | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /de/blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /de/de-only | external https://example.de/de-only?q=1#top |  | https://example.de/de-only?q=1#top [—] | https://example.de/de-only?q=1#top [—] | null | null | de |
| /de/ueber-uns | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,nl,de,fr |
| /fr | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | /de | en,de,nl,fr |
| /fr/a-propos | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | /de/ueber-uns | en,nl,de,fr |
| /fr/blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | null | /de/blog/hello-world | en,de,nl,fr |
| /nl | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | /de | en,de,nl,fr |
| /nl/about | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | /de/ueber-uns | en,nl,de,fr |
| /nl/blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | null | /de/blog/hello-world | en,de,nl,fr |
| /en | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | /de | en,de,nl,fr |
| /en/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | /de | en,de,nl,fr |
| /de/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /about/ | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | /de/ueber-uns | /de/ueber-uns | en,nl,de,fr |
| /de/about/ | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,nl,de,fr |
| /missing | external https://example.de/missing?q=1#top |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | /de/missing | /de/missing | null |
| /de/missing | external https://example.de/missing?q=1#top |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | null | null | null |
| /xx/about | external https://example.de/xx/about?q=1#top |  | https://example.de/xx/about?q=1#top [—] | https://example.de/xx/about?q=1#top [—] | /de/xx/about | /de/xx/about | null |
| /de/de/about | external https://example.de/de/about?q=1#top |  | https://example.de/de/about?q=1#top [—] | https://example.de/de/about?q=1#top [—] | null | null | null |

## To nl

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | external https://example.de/nl?q=1#top |  | https://example.de/nl?q=1#top [—] | https://example.de/nl?q=1#top [—] | /nl | /nl | en,de,nl,fr |
| /about | external https://example.de/nl/about?q=1#top |  | https://example.de/nl/about?q=1#top [—] | https://example.de/nl/about?q=1#top [—] | /nl/about | /nl/about | en,nl,de,fr |
| /blog/hello-world | external https://example.de/nl/blog/hello-world?q=1#top | external https://example.de/nl/blog/hello-world-nl?q=1#top | https://example.de/nl/blog/hello-world?q=1#top [—] | https://example.de/nl/blog/hello-world?q=1#top [—] | /nl/blog/hello-world | /nl/blog/hello-world | en,de,nl,fr |
| /de | external https://example.de/nl?q=1#top |  | https://example.de/nl?q=1#top [—] | https://example.de/nl?q=1#top [—] | null | /nl | en,de,nl,fr |
| /de/blog/hello-world | external https://example.de/nl/blog/hello-world?q=1#top | external https://example.de/nl/blog/hello-world-nl?q=1#top | https://example.de/nl/blog/hello-world?q=1#top [—] | https://example.de/nl/blog/hello-world?q=1#top [—] | null | /nl/blog/hello-world | en,de,nl,fr |
| /de/de-only | external https://example.de/nl |  | https://example.de/nl [—] | https://example.de/nl [—] | null | null | de |
| /de/ueber-uns | external https://example.de/nl/about?q=1#top |  | https://example.de/nl/about?q=1#top [—] | https://example.de/nl/about?q=1#top [—] | null | /nl/about | en,nl,de,fr |
| /fr | external https://example.de/nl?q=1#top |  | https://example.de/nl?q=1#top [—] | https://example.de/nl?q=1#top [—] | null | /nl | en,de,nl,fr |
| /fr/a-propos | external https://example.de/nl/about?q=1#top |  | https://example.de/nl/about?q=1#top [—] | https://example.de/nl/about?q=1#top [—] | null | /nl/about | en,nl,de,fr |
| /fr/blog/hello-world | external https://example.de/nl/blog/hello-world?q=1#top | external https://example.de/nl/blog/hello-world-nl?q=1#top | https://example.de/nl/blog/hello-world?q=1#top [—] | https://example.de/nl/blog/hello-world?q=1#top [—] | null | /nl/blog/hello-world | en,de,nl,fr |
| /nl | external https://example.de/nl?q=1#top |  | https://example.de/nl?q=1#top [—] | https://example.de/nl?q=1#top [—] | null | null | en,de,nl,fr |
| /nl/about | external https://example.de/nl/about?q=1#top |  | https://example.de/nl/about?q=1#top [—] | https://example.de/nl/about?q=1#top [—] | null | null | en,nl,de,fr |
| /nl/blog/hello-world | external https://example.de/nl/blog/hello-world?q=1#top | external https://example.de/nl/blog/hello-world-nl?q=1#top | https://example.de/nl/blog/hello-world?q=1#top [—] | https://example.de/nl/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /en | external https://example.de/nl?q=1#top |  | https://example.de/nl?q=1#top [—] | https://example.de/nl?q=1#top [—] | null | /nl | en,de,nl,fr |
| /en/ | external https://example.de/nl?q=1#top |  | https://example.de/nl?q=1#top [—] | https://example.de/nl?q=1#top [—] | null | /nl | en,de,nl,fr |
| /de/ | external https://example.de/nl?q=1#top |  | https://example.de/nl?q=1#top [—] | https://example.de/nl?q=1#top [—] | null | /nl | en,de,nl,fr |
| /about/ | external https://example.de/nl/about?q=1#top |  | https://example.de/nl/about?q=1#top [—] | https://example.de/nl/about?q=1#top [—] | /nl/about | /nl/about | en,nl,de,fr |
| /de/about/ | external https://example.de/nl/about?q=1#top |  | https://example.de/nl/about?q=1#top [—] | https://example.de/nl/about?q=1#top [—] | null | /nl/about | en,nl,de,fr |
| /missing | external https://example.de/nl/missing?q=1#top |  | https://example.de/nl/missing?q=1#top [—] | https://example.de/nl/missing?q=1#top [—] | /nl/missing | /nl/missing | null |
| /de/missing | external https://example.de/nl/missing?q=1#top |  | https://example.de/nl/missing?q=1#top [—] | https://example.de/nl/missing?q=1#top [—] | null | /nl/missing | null |
| /xx/about | external https://example.de/nl/xx/about?q=1#top |  | https://example.de/nl/xx/about?q=1#top [—] | https://example.de/nl/xx/about?q=1#top [—] | /nl/xx/about | /nl/xx/about | null |
| /de/de/about | external https://example.de/nl/de/about?q=1#top |  | https://example.de/nl/de/about?q=1#top [—] | https://example.de/nl/de/about?q=1#top [—] | null | /nl/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | /fr | en,de,nl,fr |
| /about | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos | /fr/a-propos | en,nl,de,fr |
| /blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world | /fr/blog/hello-world | en,de,nl,fr |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,nl,fr |
| /de/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | /fr/blog/hello-world | en,de,nl,fr |
| /de/de-only | /fr [localized-index] |  | /fr [localized-index] | /fr [localized-index] | null | null | de |
| /de/ueber-uns | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | /fr/a-propos | en,nl,de,fr |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,nl,fr |
| /fr/a-propos | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | null | en,nl,de,fr |
| /fr/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,nl,fr |
| /nl | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,nl,fr |
| /nl/about | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | /fr/a-propos | en,nl,de,fr |
| /nl/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | /fr/blog/hello-world | en,de,nl,fr |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,nl,fr |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,nl,fr |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,nl,fr |
| /about/ | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos | /fr/a-propos | en,nl,de,fr |
| /de/about/ | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | /fr/a-propos | en,nl,de,fr |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /fr/missing | /fr/missing | null |
| /de/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | /fr/missing | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | /fr/xx/about | /fr/xx/about | null |
| /de/de/about | /fr/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | null | /fr/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | nl from / | fr from / | en from /de | de from /de | nl from /de | fr from /de | en from /nl | de from /nl | nl from /nl | fr from /nl | en from /fr | de from /fr | nl from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| about | https://example.com/about [—] | https://example.de/ueber-uns [—] | https://example.de/nl/about [—] | /fr/a-propos [localized-about-fr] | https://example.com/about [—] | https://example.de/ueber-uns [—] | https://example.de/nl/about [—] | /fr/a-propos [localized-about-fr] | https://example.com/about [—] | https://example.de/ueber-uns [—] | https://example.de/nl/about [—] | /fr/a-propos [localized-about-fr] | https://example.com/about [—] | https://example.de/ueber-uns [—] | https://example.de/nl/about [—] | /fr/a-propos [localized-about-fr] |
| blog-slug | https://example.com/blog/hello-world [—] | https://example.de/blog/hello-world [—] | https://example.de/nl/blog/hello-world [—] | /fr/blog/hello-world [localized-blog-slug] | https://example.com/blog/hello-world [—] | https://example.de/blog/hello-world [—] | https://example.de/nl/blog/hello-world [—] | /fr/blog/hello-world [localized-blog-slug] | https://example.com/blog/hello-world [—] | https://example.de/blog/hello-world [—] | https://example.de/nl/blog/hello-world [—] | /fr/blog/hello-world [localized-blog-slug] | https://example.com/blog/hello-world [—] | https://example.de/blog/hello-world [—] | https://example.de/nl/blog/hello-world [—] | /fr/blog/hello-world [localized-blog-slug] |
| de-only | https://example.com/ [—] | https://example.de/de-only [—] | https://example.de/nl [—] | /fr [localized-index] | https://example.com/ [—] | https://example.de/de-only [—] | https://example.de/nl [—] | /fr [localized-index] | https://example.com/ [—] | https://example.de/de-only [—] | https://example.de/nl [—] | /fr [localized-index] | https://example.com/ [—] | https://example.de/de-only [—] | https://example.de/nl [—] | /fr [localized-index] |
| index | https://example.com/ [—] | https://example.de/ [—] | https://example.de/nl [—] | /fr [localized-index] | https://example.com/ [—] | https://example.de/ [—] | https://example.de/nl [—] | /fr [localized-index] | https://example.com/ [—] | https://example.de/ [—] | https://example.de/nl [—] | /fr [localized-index] | https://example.com/ [—] | https://example.de/ [—] | https://example.de/nl [—] | /fr [localized-index] |

## Invariant breaks (0)

none
