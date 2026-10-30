# domains · no_prefix

one build on two domains: a default per host, a second locale on one host, a locale on every host, a page of one locale

locales: en, de, nl, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| about | /about |  |  |
| blog-slug | /blog/:slug() |  |  |
| de-only | /de-only |  |  |
| localized-about-de | /ueber-uns |  |  |
| localized-about-fr | /a-propos |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | null | null | null | null |
| /a-propos | localized-about-fr | fr | about | about | null | null | null | null |
| /about | about | en | about | about | null | null | null | null |
| /blog/hello-world | blog-slug | en | blog-slug | blog-slug | null | null | null | null |
| /de-only | de-only | de | de-only | de-only | null | null | null | null |
| /ueber-uns | localized-about-de | de | about | about | null | null | null | null |
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

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /a-propos | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,nl,de,fr |
| /about | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,nl,de,fr |
| /blog/hello-world | external https://example.com/blog/hello-world?q=1#top | external https://example.com/blog/hello-world-en?q=1#top | https://example.com/blog/hello-world?q=1#top [—] | https://example.com/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /de-only | external https://example.com/ |  | https://example.com/ [—] | https://example.com/ [—] | null | null | de |
| /ueber-uns | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,nl,de,fr |
| /en | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /en/ | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /de | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /de/ | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /about/ | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,nl,de,fr |
| /de/about/ | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,nl,de,fr |
| /missing | external https://example.com/missing?q=1#top |  | https://example.com/missing?q=1#top [—] | https://example.com/missing?q=1#top [—] | null | null | null |
| /de/missing | external https://example.com/missing?q=1#top |  | https://example.com/missing?q=1#top [—] | https://example.com/missing?q=1#top [—] | null | null | null |
| /xx/about | external https://example.com/xx/about?q=1#top |  | https://example.com/xx/about?q=1#top [—] | https://example.com/xx/about?q=1#top [—] | null | null | null |
| /de/de/about | external https://example.com/de/about?q=1#top |  | https://example.com/de/about?q=1#top [—] | https://example.com/de/about?q=1#top [—] | null | null | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /a-propos | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,nl,de,fr |
| /about | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,nl,de,fr |
| /blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /de-only | external https://example.de/de-only?q=1#top |  | https://example.de/de-only?q=1#top [—] | https://example.de/de-only?q=1#top [—] | null | null | de |
| /ueber-uns | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,nl,de,fr |
| /en | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /en/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /de | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /de/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /about/ | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,nl,de,fr |
| /de/about/ | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,nl,de,fr |
| /missing | external https://example.de/missing?q=1#top |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | null | null | null |
| /de/missing | external https://example.de/missing?q=1#top |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | null | null | null |
| /xx/about | external https://example.de/xx/about?q=1#top |  | https://example.de/xx/about?q=1#top [—] | https://example.de/xx/about?q=1#top [—] | null | null | null |
| /de/de/about | external https://example.de/de/about?q=1#top |  | https://example.de/de/about?q=1#top [—] | https://example.de/de/about?q=1#top [—] | null | null | null |

## To nl

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /a-propos | external https://example.de/about?q=1#top |  | https://example.de/about?q=1#top [—] | https://example.de/about?q=1#top [—] | null | null | en,nl,de,fr |
| /about | external https://example.de/about?q=1#top |  | https://example.de/about?q=1#top [—] | https://example.de/about?q=1#top [—] | null | null | en,nl,de,fr |
| /blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-nl?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /de-only | external https://example.de/ |  | https://example.de/ [—] | https://example.de/ [—] | null | null | de |
| /ueber-uns | external https://example.de/about?q=1#top |  | https://example.de/about?q=1#top [—] | https://example.de/about?q=1#top [—] | null | null | en,nl,de,fr |
| /en | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /en/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /de | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /de/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,nl,fr |
| /about/ | external https://example.de/about?q=1#top |  | https://example.de/about?q=1#top [—] | https://example.de/about?q=1#top [—] | null | null | en,nl,de,fr |
| /de/about/ | external https://example.de/about?q=1#top |  | https://example.de/about?q=1#top [—] | https://example.de/about?q=1#top [—] | null | null | en,nl,de,fr |
| /missing | external https://example.de/missing?q=1#top |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | null | null | null |
| /de/missing | external https://example.de/missing?q=1#top |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | null | null | null |
| /xx/about | external https://example.de/xx/about?q=1#top |  | https://example.de/xx/about?q=1#top [—] | https://example.de/xx/about?q=1#top [—] | null | null | null |
| /de/de/about | external https://example.de/de/about?q=1#top |  | https://example.de/de/about?q=1#top [—] | https://example.de/de/about?q=1#top [—] | null | null | null |

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
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /about/ | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | null | null | en,nl,de,fr |
| /de/about/ | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | null | null | en,nl,de,fr |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | nl from / | fr from / |
|---|---|---|---|---|
| about | https://example.com/about [—] | https://example.de/ueber-uns [—] | https://example.de/about [—] | /a-propos [localized-about-fr] |
| blog-slug | https://example.com/blog/hello-world [—] | https://example.de/blog/hello-world [—] | https://example.de/blog/hello-world [—] | /blog/hello-world [blog-slug] |
| de-only | https://example.com/ [—] | https://example.de/de-only [—] | https://example.de/ [—] | / [index] |
| index | https://example.com/ [—] | https://example.de/ [—] | https://example.de/ [—] | / [index] |

## Invariant breaks (0)

none
