# domains · no_prefix · example.com

one build on two domains: a default per host, a second locale on one host, a locale on every host, a page of one locale

locales: en, fr · default: en

## Generated routes

| name | path | alias | redirect | meta.i18n |
|---|---|---|---|---|
| index | / |  |  | index: en, de, nl, fr |
| about | /about |  |  | about: en, nl |
| blog-slug | /blog/:slug() |  |  | blog-slug: en, de, nl, fr |
| de-only | /de-only |  |  | de-only: de |
| localized-about-de | /ueber-uns |  |  | about: de |
| localized-about-fr | /a-propos |  |  | about: fr |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | null | null | null | null |
| /a-propos | localized-about-fr | fr | about | about | null | null | null | null |
| /about | about | en | about | about | null | null | null | null |
| /blog/hello-world | blog-slug | en | blog-slug | blog-slug | null | null | null | null |
| /de-only | de-only | en | de-only | de-only | null | null | null | Locale on another domain |
| /ueber-uns | localized-about-de | en | about | about | null | null | null | Locale on another domain |
| /en | null | en | index | index | null | en | null | null |
| /en/ | null | en | index | index | null | en | null | null |
| /fr | null | en | index | index | null | fr | null | null |
| /fr/ | null | en | index | index | null | fr | null | null |
| /about/ | about | en | about | about | null | null | null | null |
| /fr/about/ | null | en | about | about | null | fr | null | null |
| /missing | null | en |  | null | null | null | null | null |
| /fr/missing | null | en |  | null | null | fr | null | null |
| /xx/about | null | en |  | null | null | null | null | null |
| /fr/fr/about | null | en |  | null | null | fr | null | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /a-propos | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,nl,de,fr |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,nl,de,fr |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de,nl,fr |
| /de-only | / [index] |  | / [index] | / [index] | null | null | de |
| /ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,nl,de,fr |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /fr/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,nl,de,fr |
| /fr/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,nl,de,fr |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /fr/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /fr/fr/about | /fr/about?q=1#top [—] |  | /fr/about?q=1#top [null] | /fr/about?q=1#top [null] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /a-propos | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | null | null | en,nl,de,fr |
| /about | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | null | null | en,nl,de,fr |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-fr?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de,nl,fr |
| /de-only | / [index] |  | / [index] | / [index] | null | null | de |
| /ueber-uns | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | null | null | en,nl,de,fr |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /fr/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /about/ | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | null | null | en,nl,de,fr |
| /fr/about/ | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | null | null | en,nl,de,fr |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /fr/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /fr/fr/about | /fr/about?q=1#top [—] |  | /fr/about?q=1#top [null] | /fr/about?q=1#top [null] | null | null | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /a-propos | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,nl,de,fr |
| /about | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,nl,de,fr |
| /blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /de-only | external https://example.de/de-only?q=1#top |  | https://example.de/de-only?q=1#top [—] | https://example.de/de-only?q=1#top [—] | null | null | de |
| /ueber-uns | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,nl,de,fr |
| /en | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /en/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /fr | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /fr/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /about/ | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,nl,de,fr |
| /fr/about/ | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,nl,de,fr |
| /missing | external https://example.de/missing?q=1#top |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | null | null | null |
| /fr/missing | external https://example.de/missing?q=1#top |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | null | null | null |
| /xx/about | external https://example.de/xx/about?q=1#top |  | https://example.de/xx/about?q=1#top [—] | https://example.de/xx/about?q=1#top [—] | null | null | null |
| /fr/fr/about | external https://example.de/fr/about?q=1#top |  | https://example.de/fr/about?q=1#top [—] | https://example.de/fr/about?q=1#top [—] | null | null | null |

## To nl

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /a-propos | external https://example.de/about?q=1#top |  | https://example.de/about?q=1#top [—] | https://example.de/about?q=1#top [—] | null | null | en,nl,de,fr |
| /about | external https://example.de/about?q=1#top |  | https://example.de/about?q=1#top [—] | https://example.de/about?q=1#top [—] | null | null | en,nl,de,fr |
| /blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /de-only | external https://example.de/ |  | https://example.de/ [—] | https://example.de/ [—] | null | null | de |
| /ueber-uns | external https://example.de/about?q=1#top |  | https://example.de/about?q=1#top [—] | https://example.de/about?q=1#top [—] | null | null | en,nl,de,fr |
| /en | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /en/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /fr | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /fr/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /about/ | external https://example.de/about?q=1#top |  | https://example.de/about?q=1#top [—] | https://example.de/about?q=1#top [—] | null | null | en,nl,de,fr |
| /fr/about/ | external https://example.de/about?q=1#top |  | https://example.de/about?q=1#top [—] | https://example.de/about?q=1#top [—] | null | null | en,nl,de,fr |
| /missing | external https://example.de/missing?q=1#top |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | null | null | null |
| /fr/missing | external https://example.de/missing?q=1#top |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | null | null | null |
| /xx/about | external https://example.de/xx/about?q=1#top |  | https://example.de/xx/about?q=1#top [—] | https://example.de/xx/about?q=1#top [—] | null | null | null |
| /fr/fr/about | external https://example.de/fr/about?q=1#top |  | https://example.de/fr/about?q=1#top [—] | https://example.de/fr/about?q=1#top [—] | null | null | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | fr from / |
|---|---|---|
| about | /about [about] | /a-propos [localized-about-fr] |
| blog-slug | /blog/hello-world [blog-slug] | /blog/hello-world [blog-slug] |
| de-only | / [index] | / [index] |
| index | / [index] | / [index] |

## Invariant breaks (0)

none
