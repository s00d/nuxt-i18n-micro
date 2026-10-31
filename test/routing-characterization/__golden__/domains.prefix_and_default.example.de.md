# domains · prefix_and_default · example.de

one build on two domains: a default per host, a second locale on one host, a locale on every host, a page of one locale

locales: de, nl, fr · default: de

## Generated routes

| name | path | alias | redirect | meta.i18n |
|---|---|---|---|---|
| index | / |  |  | index: en, de |
| about | /about |  |  | about: en |
| localized-about-de-default | /ueber-uns |  |  | about: de |
| blog-slug | /blog/:slug() |  |  | blog-slug: en, de |
| localized-de-only-de-default | /de-only |  |  | de-only: de |
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
| / | index | de | index | index | null | null | de | null |
| /about | about | de | about | about | null | null | de | Locale not allowed for this route |
| /blog/hello-world | blog-slug | de | blog-slug | blog-slug | null | null | de | null |
| /de | localized-index | de | index | index | null | de | de | null |
| /de-only | localized-de-only-de-default | de | de-only | de-only | null | null | de | null |
| /de/blog/hello-world | localized-blog-slug | de | blog-slug | blog-slug | null | de | de | null |
| /de/de-only | localized-de-only | de | de-only | de-only | null | de | de | null |
| /de/ueber-uns | localized-about-de | de | about | about | null | de | de | null |
| /en | localized-index | de | index | index | null | null | de | Locale on another domain |
| /en/about | localized-about | de | about | about | null | null | de | Locale on another domain |
| /en/blog/hello-world | localized-blog-slug | de | blog-slug | blog-slug | null | null | de | Locale on another domain |
| /fr | localized-index | fr | index | index | null | fr | fr | null |
| /fr/a-propos | localized-about-fr | fr | about | about | null | fr | fr | null |
| /fr/blog/hello-world | localized-blog-slug | fr | blog-slug | blog-slug | null | fr | fr | null |
| /nl | localized-index | nl | index | index | null | nl | nl | null |
| /nl/about | localized-about | nl | about | about | null | nl | nl | null |
| /nl/blog/hello-world | localized-blog-slug | nl | blog-slug | blog-slug | null | nl | nl | null |
| /ueber-uns | localized-about-de-default | de | about | about | null | null | de | null |
| /de/ | localized-index | de | index | index | null | de | de | null |
| /nl/ | localized-index | nl | index | index | null | nl | nl | null |
| /about/ | about | de | about | about | null | null | de | Locale not allowed for this route |
| /nl/about/ | localized-about | nl | about | about | null | nl | nl | null |
| /missing | null | de |  | null | null | null | de | null |
| /nl/missing | null | nl |  | null | null | nl | nl | null |
| /xx/about | null | de |  | null | null | null | de | null |
| /nl/nl/about | null | nl | about | about | null | nl | nl | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /about | /ueber-uns?q=1#top [localized-about-de-default] |  | /ueber-uns?q=1#top [localized-about-de-default] | /ueber-uns?q=1#top [localized-about-de-default] | null | null | en,de,nl,fr |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-de?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de,nl,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /de-only | /de-only?q=1#top [localized-de-only-de-default] |  | /de-only?q=1#top [localized-de-only-de-default] | /de-only?q=1#top [localized-de-only-de-default] | null | null | de |
| /de/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-de?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de,nl,fr |
| /de/de-only | /de-only?q=1#top [localized-de-only-de-default] |  | /de-only?q=1#top [localized-de-only-de-default] | /de-only?q=1#top [localized-de-only-de-default] | null | null | de |
| /de/ueber-uns | /ueber-uns?q=1#top [localized-about-de-default] |  | /ueber-uns?q=1#top [localized-about-de-default] | /ueber-uns?q=1#top [localized-about-de-default] | null | null | en,de,nl,fr |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /de/en?q=1#top [null] | null | null | en,de,nl,fr |
| /en/about | /ueber-uns?q=1#top [localized-about-de-default] |  | /ueber-uns?q=1#top [localized-about-de-default] | /de/en/about?q=1#top [null] | null | null | en,de,nl,fr |
| /en/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-de?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /de/en/blog/hello-world?q=1#top [null] | null | null | en,de,nl,fr |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,nl,fr |
| /fr/a-propos | /ueber-uns?q=1#top [localized-about-de-default] |  | /ueber-uns?q=1#top [localized-about-de-default] | /ueber-uns?q=1#top [localized-about-de-default] | null | /ueber-uns | en,de,nl,fr |
| /fr/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-de?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | /blog/hello-world | en,de,nl,fr |
| /nl | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,nl,fr |
| /nl/about | /ueber-uns?q=1#top [localized-about-de-default] |  | /ueber-uns?q=1#top [localized-about-de-default] | /ueber-uns?q=1#top [localized-about-de-default] | null | /ueber-uns | en,de,nl,fr |
| /nl/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-de?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | /blog/hello-world | en,de,nl,fr |
| /ueber-uns | /ueber-uns?q=1#top [localized-about-de-default] |  | /ueber-uns?q=1#top [localized-about-de-default] | /ueber-uns?q=1#top [localized-about-de-default] | null | null | en,de,nl,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /nl/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,nl,fr |
| /about/ | /ueber-uns?q=1#top [localized-about-de-default] |  | /ueber-uns?q=1#top [localized-about-de-default] | /ueber-uns?q=1#top [localized-about-de-default] | null | null | en,de,nl,fr |
| /nl/about/ | /ueber-uns?q=1#top [localized-about-de-default] |  | /ueber-uns?q=1#top [localized-about-de-default] | /ueber-uns?q=1#top [localized-about-de-default] | null | /ueber-uns | en,de,nl,fr |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | null | null |
| /nl/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | null | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | null | null | null |
| /nl/nl/about | /ueber-uns?q=1#top [localized-about-de-default] |  | /ueber-uns?q=1#top [localized-about-de-default] | /ueber-uns?q=1#top [localized-about-de-default] | null | /ueber-uns | en,de,nl,fr |

## To nl

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /nl?q=1#top [localized-index] |  | /nl?q=1#top [localized-index] | /nl?q=1#top [localized-index] | null | null | en,de,nl,fr |
| /about | /nl/about?q=1#top [localized-about] |  | /nl/about?q=1#top [localized-about] | /nl/about?q=1#top [localized-about] | null | null | en,de,nl,fr |
| /blog/hello-world | /nl/blog/hello-world?q=1#top [localized-blog-slug] | /nl/blog/hello-world-nl?q=1#top [localized-blog-slug] | /nl/blog/hello-world?q=1#top [localized-blog-slug] | /nl/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,nl,fr |
| /de | /nl?q=1#top [localized-index] |  | /nl?q=1#top [localized-index] | /nl?q=1#top [localized-index] | null | /nl | en,de,nl,fr |
| /de-only | /nl [localized-index] |  | /nl [localized-index] | /nl [localized-index] | null | null | de |
| /de/blog/hello-world | /nl/blog/hello-world?q=1#top [localized-blog-slug] | /nl/blog/hello-world-nl?q=1#top [localized-blog-slug] | /nl/blog/hello-world?q=1#top [localized-blog-slug] | /nl/blog/hello-world?q=1#top [localized-blog-slug] | null | /nl/blog/hello-world | en,de,nl,fr |
| /de/de-only | /nl [localized-index] |  | /nl [localized-index] | /nl [localized-index] | null | null | de |
| /de/ueber-uns | /nl/about?q=1#top [localized-about] |  | /nl/about?q=1#top [localized-about] | /nl/about?q=1#top [localized-about] | null | /nl/about | en,de,nl,fr |
| /en | /nl?q=1#top [localized-index] |  | /nl?q=1#top [localized-index] | /nl/en?q=1#top [null] | null | null | en,de,nl,fr |
| /en/about | /nl/about?q=1#top [localized-about] |  | /nl/about?q=1#top [localized-about] | /nl/en/about?q=1#top [null] | null | null | en,de,nl,fr |
| /en/blog/hello-world | /nl/blog/hello-world?q=1#top [localized-blog-slug] | /nl/blog/hello-world-nl?q=1#top [localized-blog-slug] | /nl/blog/hello-world?q=1#top [localized-blog-slug] | /nl/en/blog/hello-world?q=1#top [null] | null | null | en,de,nl,fr |
| /fr | /nl?q=1#top [localized-index] |  | /nl?q=1#top [localized-index] | /nl?q=1#top [localized-index] | null | /nl | en,de,nl,fr |
| /fr/a-propos | /nl/about?q=1#top [localized-about] |  | /nl/about?q=1#top [localized-about] | /nl/about?q=1#top [localized-about] | null | /nl/about | en,de,nl,fr |
| /fr/blog/hello-world | /nl/blog/hello-world?q=1#top [localized-blog-slug] | /nl/blog/hello-world-nl?q=1#top [localized-blog-slug] | /nl/blog/hello-world?q=1#top [localized-blog-slug] | /nl/blog/hello-world?q=1#top [localized-blog-slug] | null | /nl/blog/hello-world | en,de,nl,fr |
| /nl | /nl?q=1#top [localized-index] |  | /nl?q=1#top [localized-index] | /nl?q=1#top [localized-index] | null | null | en,de,nl,fr |
| /nl/about | /nl/about?q=1#top [localized-about] |  | /nl/about?q=1#top [localized-about] | /nl/about?q=1#top [localized-about] | null | null | en,de,nl,fr |
| /nl/blog/hello-world | /nl/blog/hello-world?q=1#top [localized-blog-slug] | /nl/blog/hello-world-nl?q=1#top [localized-blog-slug] | /nl/blog/hello-world?q=1#top [localized-blog-slug] | /nl/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,nl,fr |
| /ueber-uns | /nl/about?q=1#top [localized-about] |  | /nl/about?q=1#top [localized-about] | /nl/about?q=1#top [localized-about] | null | null | en,de,nl,fr |
| /de/ | /nl?q=1#top [localized-index] |  | /nl?q=1#top [localized-index] | /nl?q=1#top [localized-index] | null | /nl | en,de,nl,fr |
| /nl/ | /nl?q=1#top [localized-index] |  | /nl?q=1#top [localized-index] | /nl?q=1#top [localized-index] | null | null | en,de,nl,fr |
| /about/ | /nl/about?q=1#top [localized-about] |  | /nl/about?q=1#top [localized-about] | /nl/about?q=1#top [localized-about] | null | null | en,de,nl,fr |
| /nl/about/ | /nl/about?q=1#top [localized-about] |  | /nl/about?q=1#top [localized-about] | /nl/about?q=1#top [localized-about] | null | null | en,de,nl,fr |
| /missing | /nl/missing?q=1#top [—] |  | /nl/missing?q=1#top [null] | /nl/missing?q=1#top [null] | null | null | null |
| /nl/missing | /nl/missing?q=1#top [—] |  | /nl/missing?q=1#top [null] | /nl/missing?q=1#top [null] | null | null | null |
| /xx/about | /nl/xx/about?q=1#top [—] |  | /nl/xx/about?q=1#top [null] | /nl/xx/about?q=1#top [null] | null | null | null |
| /nl/nl/about | /nl/about?q=1#top [localized-about] |  | /nl/about?q=1#top [localized-about] | /nl/about?q=1#top [localized-about] | null | null | en,de,nl,fr |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,nl,fr |
| /about | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | null | en,de,nl,fr |
| /blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,nl,fr |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,nl,fr |
| /de-only | /fr [localized-index] |  | /fr [localized-index] | /fr [localized-index] | null | null | de |
| /de/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | /fr/blog/hello-world | en,de,nl,fr |
| /de/de-only | /fr [localized-index] |  | /fr [localized-index] | /fr [localized-index] | null | null | de |
| /de/ueber-uns | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | /fr/a-propos | en,de,nl,fr |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr/en?q=1#top [null] | null | null | en,de,nl,fr |
| /en/about | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/en/about?q=1#top [null] | null | null | en,de,nl,fr |
| /en/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/en/blog/hello-world?q=1#top [null] | null | null | en,de,nl,fr |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,nl,fr |
| /fr/a-propos | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | null | en,de,nl,fr |
| /fr/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,nl,fr |
| /nl | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,nl,fr |
| /nl/about | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | /fr/a-propos | en,de,nl,fr |
| /nl/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | /fr/blog/hello-world | en,de,nl,fr |
| /ueber-uns | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | null | en,de,nl,fr |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,nl,fr |
| /nl/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,nl,fr |
| /about/ | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | null | en,de,nl,fr |
| /nl/about/ | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | /fr/a-propos | en,de,nl,fr |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | null | null |
| /nl/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | null | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | null | null | null |
| /nl/nl/about | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | /fr/a-propos | en,de,nl,fr |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /about | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,de,nl,fr |
| /blog/hello-world | external https://example.com/blog/hello-world?q=1#top | external https://example.com/blog/hello-world?q=1#top | https://example.com/blog/hello-world?q=1#top [—] | https://example.com/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /de | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /de-only | external https://example.com |  | https://example.com [—] | https://example.com [—] | null | null | de |
| /de/blog/hello-world | external https://example.com/blog/hello-world?q=1#top | external https://example.com/blog/hello-world?q=1#top | https://example.com/blog/hello-world?q=1#top [—] | https://example.com/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /de/de-only | external https://example.com |  | https://example.com [—] | https://example.com [—] | null | null | de |
| /de/ueber-uns | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,de,nl,fr |
| /en | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/en?q=1#top [—] | null | null | en,de,nl,fr |
| /en/about | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/en/about?q=1#top [—] | null | null | en,de,nl,fr |
| /en/blog/hello-world | external https://example.com/blog/hello-world?q=1#top | external https://example.com/blog/hello-world?q=1#top | https://example.com/blog/hello-world?q=1#top [—] | https://example.com/en/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /fr | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /fr/a-propos | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,de,nl,fr |
| /fr/blog/hello-world | external https://example.com/blog/hello-world?q=1#top | external https://example.com/blog/hello-world?q=1#top | https://example.com/blog/hello-world?q=1#top [—] | https://example.com/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /nl | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /nl/about | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,de,nl,fr |
| /nl/blog/hello-world | external https://example.com/blog/hello-world?q=1#top | external https://example.com/blog/hello-world?q=1#top | https://example.com/blog/hello-world?q=1#top [—] | https://example.com/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /ueber-uns | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,de,nl,fr |
| /de/ | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /nl/ | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /about/ | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,de,nl,fr |
| /nl/about/ | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,de,nl,fr |
| /missing | external https://example.com/missing?q=1#top |  | https://example.com/missing?q=1#top [—] | https://example.com/missing?q=1#top [—] | null | null | null |
| /nl/missing | external https://example.com/missing?q=1#top |  | https://example.com/missing?q=1#top [—] | https://example.com/missing?q=1#top [—] | null | null | null |
| /xx/about | external https://example.com/xx/about?q=1#top |  | https://example.com/xx/about?q=1#top [—] | https://example.com/xx/about?q=1#top [—] | null | null | null |
| /nl/nl/about | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,de,nl,fr |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | de from / | nl from / | fr from / | de from /nl | nl from /nl | fr from /nl | de from /fr | nl from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /ueber-uns [localized-about-de-default] | /nl/about [localized-about] | /fr/a-propos [localized-about-fr] | /ueber-uns [localized-about-de-default] | /nl/about [localized-about] | /fr/a-propos [localized-about-fr] | /ueber-uns [localized-about-de-default] | /nl/about [localized-about] | /fr/a-propos [localized-about-fr] |
| blog-slug | /blog/hello-world [blog-slug] | /nl/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] | /blog/hello-world [blog-slug] | /nl/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] | /blog/hello-world [blog-slug] | /nl/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] |
| de-only | /de-only [localized-de-only-de-default] | /nl [localized-index] | /fr [localized-index] | /de-only [localized-de-only-de-default] | /nl [localized-index] | /fr [localized-index] | /de-only [localized-de-only-de-default] | /nl [localized-index] | /fr [localized-index] |
| index | / [index] | /nl [localized-index] | /fr [localized-index] | / [index] | /nl [localized-index] | /fr [localized-index] | / [index] | /nl [localized-index] | /fr [localized-index] |

## Invariant breaks (0)

none
