# domains · prefix · example.de

one build on two domains: a default per host, a second locale on one host, a locale on every host, a page of one locale

locales: de, nl, fr · default: de

## Generated routes

| name | path | alias | redirect | meta.i18n |
|---|---|---|---|---|
| localized-index | /:locale(en\|de\|nl\|fr) |  |  | index: en, de, nl, fr |
| localized-about | /:locale(en\|nl)/about |  |  | about: en, nl |
| localized-about-de | /:locale(de)/ueber-uns |  |  | about: de |
| localized-about-fr | /:locale(fr)/a-propos |  |  | about: fr |
| localized-blog-slug | /:locale(en\|de\|nl\|fr)/blog/:slug() |  |  | blog-slug: en, de, nl, fr |
| localized-de-only | /:locale(de)/de-only |  |  | de-only: de |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| /de | localized-index | de | index | index | null | de | de | null |
| /de/blog/hello-world | localized-blog-slug | de | blog-slug | blog-slug | null | de | de | null |
| /de/de-only | localized-de-only | de | de-only | de-only | null | de | de | null |
| /de/ueber-uns | localized-about-de | de | about | about | null | de | de | null |
| /en | localized-index | de | index | index | null | null | null | Locale on another domain |
| /en/about | localized-about | de | about | about | null | null | null | Locale on another domain |
| /en/blog/hello-world | localized-blog-slug | de | blog-slug | blog-slug | null | null | null | Locale on another domain |
| /fr | localized-index | fr | index | index | null | fr | fr | null |
| /fr/a-propos | localized-about-fr | fr | about | about | null | fr | fr | null |
| /fr/blog/hello-world | localized-blog-slug | fr | blog-slug | blog-slug | null | fr | fr | null |
| /nl | localized-index | nl | index | index | null | nl | nl | null |
| /nl/about | localized-about | nl | about | about | null | nl | nl | null |
| /nl/blog/hello-world | localized-blog-slug | nl | blog-slug | blog-slug | null | nl | nl | null |
| / | null | de | index | index | null | null | null | null |
| /de/ | localized-index | de | index | index | null | de | de | null |
| /nl/ | localized-index | nl | index | index | null | nl | nl | null |
| /about/ | null | de | about | about | null | null | null | null |
| /nl/about/ | localized-about | nl | about | about | null | nl | nl | null |
| /missing | null | de |  | null | null | null | null | null |
| /nl/missing | null | nl |  | null | null | nl | nl | null |
| /xx/about | null | de |  | null | null | null | null | null |
| /nl/nl/about | null | nl | about | about | null | nl | nl | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,nl,fr |
| /de/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,nl,fr |
| /de/de-only | /de/de-only?q=1#top [localized-de-only] |  | /de/de-only?q=1#top [localized-de-only] | /de/de-only?q=1#top [localized-de-only] | null | null | de |
| /de/ueber-uns | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | null | en,nl,de,fr |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de/en?q=1#top [null] | null | null | en,de,nl,fr |
| /en/about | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/en/about?q=1#top [null] | null | null | en,nl,de,fr |
| /en/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/en/blog/hello-world?q=1#top [null] | null | null | en,de,nl,fr |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,nl,fr |
| /fr/a-propos | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | /de/ueber-uns | en,nl,de,fr |
| /fr/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | null | /de/blog/hello-world | en,de,nl,fr |
| /nl | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,nl,fr |
| /nl/about | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | /de/ueber-uns | en,nl,de,fr |
| /nl/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | null | /de/blog/hello-world | en,de,nl,fr |
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | /de | en,de,nl,fr |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,nl,fr |
| /nl/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,nl,fr |
| /about/ | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns | /de/ueber-uns | en,nl,de,fr |
| /nl/about/ | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | /de/ueber-uns | en,nl,de,fr |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | /de/missing | null |
| /nl/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | /de/missing | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /de/xx/about | /de/xx/about | null |
| /nl/nl/about | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | /de/ueber-uns | en,nl,de,fr |

## To nl

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| /de | /nl?q=1#top [localized-index] |  | /nl?q=1#top [localized-index] | /nl?q=1#top [localized-index] | null | /nl | en,de,nl,fr |
| /de/blog/hello-world | /nl/blog/hello-world?q=1#top [localized-blog-slug] | /nl/blog/hello-world-nl?q=1#top [localized-blog-slug] | /nl/blog/hello-world?q=1#top [localized-blog-slug] | /nl/blog/hello-world?q=1#top [localized-blog-slug] | null | /nl/blog/hello-world | en,de,nl,fr |
| /de/de-only | /nl [localized-index] |  | /nl [localized-index] | /nl [localized-index] | null | null | de |
| /de/ueber-uns | /nl/about?q=1#top [localized-about] |  | /nl/about?q=1#top [localized-about] | /nl/about?q=1#top [localized-about] | null | /nl/about | en,nl,de,fr |
| /en | /nl?q=1#top [localized-index] |  | /nl?q=1#top [localized-index] | /nl/en?q=1#top [null] | null | null | en,de,nl,fr |
| /en/about | /nl/about?q=1#top [localized-about] |  | /nl/about?q=1#top [localized-about] | /nl/en/about?q=1#top [null] | null | null | en,nl,de,fr |
| /en/blog/hello-world | /nl/blog/hello-world?q=1#top [localized-blog-slug] | /nl/blog/hello-world-nl?q=1#top [localized-blog-slug] | /nl/blog/hello-world?q=1#top [localized-blog-slug] | /nl/en/blog/hello-world?q=1#top [null] | null | null | en,de,nl,fr |
| /fr | /nl?q=1#top [localized-index] |  | /nl?q=1#top [localized-index] | /nl?q=1#top [localized-index] | null | /nl | en,de,nl,fr |
| /fr/a-propos | /nl/about?q=1#top [localized-about] |  | /nl/about?q=1#top [localized-about] | /nl/about?q=1#top [localized-about] | null | /nl/about | en,nl,de,fr |
| /fr/blog/hello-world | /nl/blog/hello-world?q=1#top [localized-blog-slug] | /nl/blog/hello-world-nl?q=1#top [localized-blog-slug] | /nl/blog/hello-world?q=1#top [localized-blog-slug] | /nl/blog/hello-world?q=1#top [localized-blog-slug] | null | /nl/blog/hello-world | en,de,nl,fr |
| /nl | /nl?q=1#top [localized-index] |  | /nl?q=1#top [localized-index] | /nl?q=1#top [localized-index] | null | null | en,de,nl,fr |
| /nl/about | /nl/about?q=1#top [localized-about] |  | /nl/about?q=1#top [localized-about] | /nl/about?q=1#top [localized-about] | null | null | en,nl,de,fr |
| /nl/blog/hello-world | /nl/blog/hello-world?q=1#top [localized-blog-slug] | /nl/blog/hello-world-nl?q=1#top [localized-blog-slug] | /nl/blog/hello-world?q=1#top [localized-blog-slug] | /nl/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,nl,fr |
| / | /nl?q=1#top [localized-index] |  | /nl?q=1#top [localized-index] | /nl?q=1#top [localized-index] | /nl | /nl | en,de,nl,fr |
| /de/ | /nl?q=1#top [localized-index] |  | /nl?q=1#top [localized-index] | /nl?q=1#top [localized-index] | null | /nl | en,de,nl,fr |
| /nl/ | /nl?q=1#top [localized-index] |  | /nl?q=1#top [localized-index] | /nl?q=1#top [localized-index] | null | null | en,de,nl,fr |
| /about/ | /nl/about?q=1#top [localized-about] |  | /nl/about?q=1#top [localized-about] | /nl/about?q=1#top [localized-about] | /nl/about | /nl/about | en,nl,de,fr |
| /nl/about/ | /nl/about?q=1#top [localized-about] |  | /nl/about?q=1#top [localized-about] | /nl/about?q=1#top [localized-about] | null | null | en,nl,de,fr |
| /missing | /nl/missing?q=1#top [—] |  | /nl/missing?q=1#top [null] | /nl/missing?q=1#top [null] | /nl/missing | /nl/missing | null |
| /nl/missing | /nl/missing?q=1#top [—] |  | /nl/missing?q=1#top [null] | /nl/missing?q=1#top [null] | null | null | null |
| /xx/about | /nl/xx/about?q=1#top [—] |  | /nl/xx/about?q=1#top [null] | /nl/xx/about?q=1#top [null] | /nl/xx/about | /nl/xx/about | null |
| /nl/nl/about | /nl/about?q=1#top [localized-about] |  | /nl/about?q=1#top [localized-about] | /nl/about?q=1#top [localized-about] | null | null | en,nl,de,fr |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,nl,fr |
| /de/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | /fr/blog/hello-world | en,de,nl,fr |
| /de/de-only | /fr [localized-index] |  | /fr [localized-index] | /fr [localized-index] | null | null | de |
| /de/ueber-uns | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | /fr/a-propos | en,nl,de,fr |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr/en?q=1#top [null] | null | null | en,de,nl,fr |
| /en/about | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/en/about?q=1#top [null] | null | null | en,nl,de,fr |
| /en/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/en/blog/hello-world?q=1#top [null] | null | null | en,de,nl,fr |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,nl,fr |
| /fr/a-propos | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | null | en,nl,de,fr |
| /fr/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,nl,fr |
| /nl | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,nl,fr |
| /nl/about | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | /fr/a-propos | en,nl,de,fr |
| /nl/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | /fr/blog/hello-world | en,de,nl,fr |
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | /fr | en,de,nl,fr |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,nl,fr |
| /nl/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,nl,fr |
| /about/ | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos | /fr/a-propos | en,nl,de,fr |
| /nl/about/ | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | /fr/a-propos | en,nl,de,fr |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /fr/missing | /fr/missing | null |
| /nl/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | /fr/missing | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | /fr/xx/about | /fr/xx/about | null |
| /nl/nl/about | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | /fr/a-propos | en,nl,de,fr |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| /de | external https://example.com/en?q=1#top |  | https://example.com/en?q=1#top [—] | https://example.com/en?q=1#top [—] | null | null | en,de,nl,fr |
| /de/blog/hello-world | external https://example.com/en/blog/hello-world?q=1#top | external https://example.com/en/blog/hello-world?q=1#top | https://example.com/en/blog/hello-world?q=1#top [—] | https://example.com/en/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /de/de-only | external https://example.com/en |  | https://example.com/en [—] | https://example.com/en [—] | null | null | de |
| /de/ueber-uns | external https://example.com/en/about?q=1#top |  | https://example.com/en/about?q=1#top [—] | https://example.com/en/about?q=1#top [—] | null | null | en,nl,de,fr |
| /en | external https://example.com/en?q=1#top |  | https://example.com/en?q=1#top [—] | https://example.com/en/en?q=1#top [—] | null | null | en,de,nl,fr |
| /en/about | external https://example.com/en/about?q=1#top |  | https://example.com/en/about?q=1#top [—] | https://example.com/en/en/about?q=1#top [—] | null | null | en,nl,de,fr |
| /en/blog/hello-world | external https://example.com/en/blog/hello-world?q=1#top | external https://example.com/en/blog/hello-world?q=1#top | https://example.com/en/blog/hello-world?q=1#top [—] | https://example.com/en/en/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /fr | external https://example.com/en?q=1#top |  | https://example.com/en?q=1#top [—] | https://example.com/en?q=1#top [—] | null | null | en,de,nl,fr |
| /fr/a-propos | external https://example.com/en/about?q=1#top |  | https://example.com/en/about?q=1#top [—] | https://example.com/en/about?q=1#top [—] | null | null | en,nl,de,fr |
| /fr/blog/hello-world | external https://example.com/en/blog/hello-world?q=1#top | external https://example.com/en/blog/hello-world?q=1#top | https://example.com/en/blog/hello-world?q=1#top [—] | https://example.com/en/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /nl | external https://example.com/en?q=1#top |  | https://example.com/en?q=1#top [—] | https://example.com/en?q=1#top [—] | null | null | en,de,nl,fr |
| /nl/about | external https://example.com/en/about?q=1#top |  | https://example.com/en/about?q=1#top [—] | https://example.com/en/about?q=1#top [—] | null | null | en,nl,de,fr |
| /nl/blog/hello-world | external https://example.com/en/blog/hello-world?q=1#top | external https://example.com/en/blog/hello-world?q=1#top | https://example.com/en/blog/hello-world?q=1#top [—] | https://example.com/en/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| / | external https://example.com/en?q=1#top |  | https://example.com/en?q=1#top [—] | https://example.com/en?q=1#top [—] | null | null | en,de,nl,fr |
| /de/ | external https://example.com/en?q=1#top |  | https://example.com/en?q=1#top [—] | https://example.com/en?q=1#top [—] | null | null | en,de,nl,fr |
| /nl/ | external https://example.com/en?q=1#top |  | https://example.com/en?q=1#top [—] | https://example.com/en?q=1#top [—] | null | null | en,de,nl,fr |
| /about/ | external https://example.com/en/about?q=1#top |  | https://example.com/en/about?q=1#top [—] | https://example.com/en/about?q=1#top [—] | null | null | en,nl,de,fr |
| /nl/about/ | external https://example.com/en/about?q=1#top |  | https://example.com/en/about?q=1#top [—] | https://example.com/en/about?q=1#top [—] | null | null | en,nl,de,fr |
| /missing | external https://example.com/en/missing?q=1#top |  | https://example.com/en/missing?q=1#top [—] | https://example.com/en/missing?q=1#top [—] | null | null | null |
| /nl/missing | external https://example.com/en/missing?q=1#top |  | https://example.com/en/missing?q=1#top [—] | https://example.com/en/missing?q=1#top [—] | null | null | null |
| /xx/about | external https://example.com/en/xx/about?q=1#top |  | https://example.com/en/xx/about?q=1#top [—] | https://example.com/en/xx/about?q=1#top [—] | null | null | null |
| /nl/nl/about | external https://example.com/en/about?q=1#top |  | https://example.com/en/about?q=1#top [—] | https://example.com/en/about?q=1#top [—] | null | null | en,nl,de,fr |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | de from /de | nl from /de | fr from /de | de from /nl | nl from /nl | fr from /nl | de from /fr | nl from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /de/ueber-uns [localized-about-de] | /nl/about [localized-about] | /fr/a-propos [localized-about-fr] | /de/ueber-uns [localized-about-de] | /nl/about [localized-about] | /fr/a-propos [localized-about-fr] | /de/ueber-uns [localized-about-de] | /nl/about [localized-about] | /fr/a-propos [localized-about-fr] |
| blog-slug | /de/blog/hello-world [localized-blog-slug] | /nl/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] | /de/blog/hello-world [localized-blog-slug] | /nl/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] | /de/blog/hello-world [localized-blog-slug] | /nl/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] |
| de-only | /de/de-only [localized-de-only] | /nl [localized-index] | /fr [localized-index] | /de/de-only [localized-de-only] | /nl [localized-index] | /fr [localized-index] | /de/de-only [localized-de-only] | /nl [localized-index] | /fr [localized-index] |
| index | /de [localized-index] | /nl [localized-index] | /fr [localized-index] | /de [localized-index] | /nl [localized-index] | /fr [localized-index] | /de [localized-index] | /nl [localized-index] | /fr [localized-index] |

## Invariant breaks (0)

none
