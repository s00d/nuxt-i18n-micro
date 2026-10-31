# domains · prefix_except_default · example.com

one build on two domains: a default per host, a second locale on one host, a locale on every host, a page of one locale

locales: en, fr · default: en

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
| / | index | en | index | index | null | null | en | null |
| /about | about | en | about | about | null | null | en | null |
| /blog/hello-world | blog-slug | en | blog-slug | blog-slug | null | null | en | null |
| /de | localized-index | en | index | index | null | null | en | Locale on another domain |
| /de-only | localized-de-only-de-default | en | de-only | de-only | null | null | en | Locale not allowed for this route |
| /de/blog/hello-world | localized-blog-slug | en | blog-slug | blog-slug | null | null | en | Locale on another domain |
| /de/de-only | localized-de-only | en | de-only | de-only | null | null | en | Locale on another domain |
| /de/ueber-uns | localized-about-de | en | about | about | null | null | en | Locale on another domain |
| /en | localized-index | en | index | index | null | en | en | Default locale should not have prefix |
| /en/about | localized-about | en | about | about | null | en | en | Default locale should not have prefix |
| /en/blog/hello-world | localized-blog-slug | en | blog-slug | blog-slug | null | en | en | Default locale should not have prefix |
| /fr | localized-index | fr | index | index | null | fr | fr | null |
| /fr/a-propos | localized-about-fr | fr | about | about | null | fr | fr | null |
| /fr/blog/hello-world | localized-blog-slug | fr | blog-slug | blog-slug | null | fr | fr | null |
| /nl | localized-index | en | index | index | null | null | en | Locale on another domain |
| /nl/about | localized-about | en | about | about | null | null | en | Locale on another domain |
| /nl/blog/hello-world | localized-blog-slug | en | blog-slug | blog-slug | null | null | en | Locale on another domain |
| /ueber-uns | localized-about-de-default | en | about | about | null | null | en | null |
| /en/ | localized-index | en | index | index | null | en | en | Default locale should not have prefix |
| /fr/ | localized-index | fr | index | index | null | fr | fr | null |
| /about/ | about | en | about | about | null | null | en | null |
| /fr/about/ | null | fr | about | about | null | fr | fr | null |
| /missing | null | en |  | null | null | null | en | null |
| /fr/missing | null | fr |  | null | null | fr | fr | null |
| /xx/about | null | en |  | null | null | null | en | null |
| /fr/fr/about | null | fr |  | null | null | fr | fr | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de,nl,fr |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de,nl,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /de?q=1#top [localized-index] | null | null | en,de,nl,fr |
| /de-only | / [index] |  | / [index] | / [index] | null | null | de |
| /de/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,nl,fr |
| /de/de-only | / [index] |  | / [index] | /de/de-only?q=1#top [localized-de-only] | null | null | de |
| /de/ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /de/ueber-uns?q=1#top [localized-about-de] | null | null | en,de,nl,fr |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /en/about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de,nl,fr |
| /en/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de,nl,fr |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,nl,fr |
| /fr/a-propos | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,de,nl,fr |
| /fr/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | /blog/hello-world | en,de,nl,fr |
| /nl | /?q=1#top [index] |  | /?q=1#top [index] | /nl?q=1#top [localized-index] | null | null | en,de,nl,fr |
| /nl/about | /about?q=1#top [about] |  | /about?q=1#top [about] | /nl/about?q=1#top [localized-about] | null | null | en,de,nl,fr |
| /nl/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /nl/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,nl,fr |
| /ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | /about | en,de,nl,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /fr/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,nl,fr |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de,nl,fr |
| /fr/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,de,nl,fr |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /fr/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /fr/fr/about | /fr/about?q=1#top [—] |  | /fr/about?q=1#top [null] | /fr/about?q=1#top [null] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | /fr | en,de,nl,fr |
| /about | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos | /fr/a-propos | en,de,nl,fr |
| /blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world | /fr/blog/hello-world | en,de,nl,fr |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr/de?q=1#top [null] | null | null | en,de,nl,fr |
| /de-only | /fr [localized-index] |  | /fr [localized-index] | /fr [localized-index] | null | null | de |
| /de/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/de/blog/hello-world?q=1#top [null] | null | null | en,de,nl,fr |
| /de/de-only | /fr [localized-index] |  | /fr [localized-index] | /fr/de/de-only?q=1#top [null] | null | null | de |
| /de/ueber-uns | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/de/ueber-uns?q=1#top [null] | null | null | en,de,nl,fr |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,nl,fr |
| /en/about | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | /fr/a-propos | en,de,nl,fr |
| /en/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | /fr/blog/hello-world | en,de,nl,fr |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,nl,fr |
| /fr/a-propos | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | null | en,de,nl,fr |
| /fr/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,nl,fr |
| /nl | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr/nl?q=1#top [null] | null | null | en,de,nl,fr |
| /nl/about | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/nl/about?q=1#top [null] | null | null | en,de,nl,fr |
| /nl/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/nl/blog/hello-world?q=1#top [null] | null | null | en,de,nl,fr |
| /ueber-uns | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos | /fr/a-propos | en,de,nl,fr |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,nl,fr |
| /fr/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,nl,fr |
| /about/ | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos | /fr/a-propos | en,de,nl,fr |
| /fr/about/ | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | null | en,de,nl,fr |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | null | null |
| /fr/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | null | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | null | null | null |
| /fr/fr/about | /fr/fr/about?q=1#top [—] |  | /fr/fr/about?q=1#top [null] | /fr/fr/about?q=1#top [null] | null | null | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /about | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,de,nl,fr |
| /blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /de | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/de?q=1#top [—] | null | null | en,de,nl,fr |
| /de-only | external https://example.de/de-only?q=1#top |  | https://example.de/de-only?q=1#top [—] | https://example.de/de-only?q=1#top [—] | null | null | de |
| /de/blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/de/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /de/de-only | external https://example.de/de-only?q=1#top |  | https://example.de/de-only?q=1#top [—] | https://example.de/de/de-only?q=1#top [—] | null | null | de |
| /de/ueber-uns | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/de/ueber-uns?q=1#top [—] | null | null | en,de,nl,fr |
| /en | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /en/about | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,de,nl,fr |
| /en/blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /fr | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /fr/a-propos | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,de,nl,fr |
| /fr/blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /nl | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/nl?q=1#top [—] | null | null | en,de,nl,fr |
| /nl/about | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/nl/about?q=1#top [—] | null | null | en,de,nl,fr |
| /nl/blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/nl/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /ueber-uns | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,de,nl,fr |
| /en/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /fr/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /about/ | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,de,nl,fr |
| /fr/about/ | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,de,nl,fr |
| /missing | external https://example.de/missing?q=1#top |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | null | null | null |
| /fr/missing | external https://example.de/missing?q=1#top |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | null | null | null |
| /xx/about | external https://example.de/xx/about?q=1#top |  | https://example.de/xx/about?q=1#top [—] | https://example.de/xx/about?q=1#top [—] | null | null | null |
| /fr/fr/about | external https://example.de/fr/about?q=1#top |  | https://example.de/fr/about?q=1#top [—] | https://example.de/fr/about?q=1#top [—] | null | null | null |

## To nl

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | external https://example.de/nl?q=1#top |  | https://example.de/nl?q=1#top [—] | https://example.de/nl?q=1#top [—] | null | null | en,de,nl,fr |
| /about | external https://example.de/nl/about?q=1#top |  | https://example.de/nl/about?q=1#top [—] | https://example.de/nl/about?q=1#top [—] | null | null | en,de,nl,fr |
| /blog/hello-world | external https://example.de/nl/blog/hello-world?q=1#top | external https://example.de/nl/blog/hello-world?q=1#top | https://example.de/nl/blog/hello-world?q=1#top [—] | https://example.de/nl/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /de | external https://example.de/nl?q=1#top |  | https://example.de/nl?q=1#top [—] | https://example.de/nl/de?q=1#top [—] | null | null | en,de,nl,fr |
| /de-only | external https://example.de/nl |  | https://example.de/nl [—] | https://example.de/nl [—] | null | null | de |
| /de/blog/hello-world | external https://example.de/nl/blog/hello-world?q=1#top | external https://example.de/nl/blog/hello-world?q=1#top | https://example.de/nl/blog/hello-world?q=1#top [—] | https://example.de/nl/de/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /de/de-only | external https://example.de/nl |  | https://example.de/nl [—] | https://example.de/nl/de/de-only?q=1#top [—] | null | null | de |
| /de/ueber-uns | external https://example.de/nl/about?q=1#top |  | https://example.de/nl/about?q=1#top [—] | https://example.de/nl/de/ueber-uns?q=1#top [—] | null | null | en,de,nl,fr |
| /en | external https://example.de/nl?q=1#top |  | https://example.de/nl?q=1#top [—] | https://example.de/nl?q=1#top [—] | null | null | en,de,nl,fr |
| /en/about | external https://example.de/nl/about?q=1#top |  | https://example.de/nl/about?q=1#top [—] | https://example.de/nl/about?q=1#top [—] | null | null | en,de,nl,fr |
| /en/blog/hello-world | external https://example.de/nl/blog/hello-world?q=1#top | external https://example.de/nl/blog/hello-world?q=1#top | https://example.de/nl/blog/hello-world?q=1#top [—] | https://example.de/nl/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /fr | external https://example.de/nl?q=1#top |  | https://example.de/nl?q=1#top [—] | https://example.de/nl?q=1#top [—] | null | null | en,de,nl,fr |
| /fr/a-propos | external https://example.de/nl/about?q=1#top |  | https://example.de/nl/about?q=1#top [—] | https://example.de/nl/about?q=1#top [—] | null | null | en,de,nl,fr |
| /fr/blog/hello-world | external https://example.de/nl/blog/hello-world?q=1#top | external https://example.de/nl/blog/hello-world?q=1#top | https://example.de/nl/blog/hello-world?q=1#top [—] | https://example.de/nl/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /nl | external https://example.de/nl?q=1#top |  | https://example.de/nl?q=1#top [—] | https://example.de/nl/nl?q=1#top [—] | null | null | en,de,nl,fr |
| /nl/about | external https://example.de/nl/about?q=1#top |  | https://example.de/nl/about?q=1#top [—] | https://example.de/nl/nl/about?q=1#top [—] | null | null | en,de,nl,fr |
| /nl/blog/hello-world | external https://example.de/nl/blog/hello-world?q=1#top | external https://example.de/nl/blog/hello-world?q=1#top | https://example.de/nl/blog/hello-world?q=1#top [—] | https://example.de/nl/nl/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /ueber-uns | external https://example.de/nl/about?q=1#top |  | https://example.de/nl/about?q=1#top [—] | https://example.de/nl/about?q=1#top [—] | null | null | en,de,nl,fr |
| /en/ | external https://example.de/nl?q=1#top |  | https://example.de/nl?q=1#top [—] | https://example.de/nl?q=1#top [—] | null | null | en,de,nl,fr |
| /fr/ | external https://example.de/nl?q=1#top |  | https://example.de/nl?q=1#top [—] | https://example.de/nl?q=1#top [—] | null | null | en,de,nl,fr |
| /about/ | external https://example.de/nl/about?q=1#top |  | https://example.de/nl/about?q=1#top [—] | https://example.de/nl/about?q=1#top [—] | null | null | en,de,nl,fr |
| /fr/about/ | external https://example.de/nl/about?q=1#top |  | https://example.de/nl/about?q=1#top [—] | https://example.de/nl/about?q=1#top [—] | null | null | en,de,nl,fr |
| /missing | external https://example.de/nl/missing?q=1#top |  | https://example.de/nl/missing?q=1#top [—] | https://example.de/nl/missing?q=1#top [—] | null | null | null |
| /fr/missing | external https://example.de/nl/missing?q=1#top |  | https://example.de/nl/missing?q=1#top [—] | https://example.de/nl/missing?q=1#top [—] | null | null | null |
| /xx/about | external https://example.de/nl/xx/about?q=1#top |  | https://example.de/nl/xx/about?q=1#top [—] | https://example.de/nl/xx/about?q=1#top [—] | null | null | null |
| /fr/fr/about | external https://example.de/nl/fr/about?q=1#top |  | https://example.de/nl/fr/about?q=1#top [—] | https://example.de/nl/fr/about?q=1#top [—] | null | null | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | fr from / | en from /fr | fr from /fr |
|---|---|---|---|---|
| about | /about [about] | /fr/a-propos [localized-about-fr] | /about [about] | /fr/a-propos [localized-about-fr] |
| blog-slug | /blog/hello-world [blog-slug] | /fr/blog/hello-world [localized-blog-slug] | /blog/hello-world [blog-slug] | /fr/blog/hello-world [localized-blog-slug] |
| de-only | / [index] | /fr [localized-index] | / [index] | /fr [localized-index] |
| index | / [index] | /fr [localized-index] | / [index] | /fr [localized-index] |

## Invariant breaks (0)

none
