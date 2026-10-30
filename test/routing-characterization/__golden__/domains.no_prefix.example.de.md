# domains · no_prefix · example.de

one build on two domains: a default per host, a second locale on one host, a locale on every host, a page of one locale

locales: de, nl, fr · default: de

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
| / | index | de | index | index | null | null | null | null |
| /a-propos | localized-about-fr | fr | about | about | null | null | null | null |
| /about | about | de | about | about | null | null | null | null |
| /blog/hello-world | blog-slug | de | blog-slug | blog-slug | null | null | null | null |
| /de-only | de-only | de | de-only | de-only | null | null | null | null |
| /ueber-uns | localized-about-de | de | about | about | null | null | null | null |
| /de | null | de | index | index | null | de | null | null |
| /de/ | null | de | index | index | null | de | null | null |
| /nl | null | de | index | index | null | nl | null | null |
| /nl/ | null | de | index | index | null | nl | null | null |
| /about/ | about | de | about | about | null | null | null | null |
| /nl/about/ | null | de | about | about | null | nl | null | null |
| /missing | null | de |  | null | null | null | null | null |
| /nl/missing | null | de |  | null | null | nl | null | null |
| /xx/about | null | de |  | null | null | null | null | null |
| /nl/nl/about | null | de |  | null | null | nl | null | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /a-propos | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | null | null | en,nl,de,fr |
| /about | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | null | null | en,nl,de,fr |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-de?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de,nl,fr |
| /de-only | /de-only?q=1#top [de-only] |  | /de-only?q=1#top [de-only] | /de-only?q=1#top [de-only] | null | null | de |
| /ueber-uns | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | null | null | en,nl,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /nl | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /nl/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /about/ | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | null | null | en,nl,de,fr |
| /nl/about/ | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | null | null | en,nl,de,fr |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /nl/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /nl/nl/about | /nl/about?q=1#top [—] |  | /nl/about?q=1#top [null] | /nl/about?q=1#top [null] | null | null | null |

## To nl

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /a-propos | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,nl,de,fr |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,nl,de,fr |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-nl?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de,nl,fr |
| /de-only | / [index] |  | / [index] | / [index] | null | null | de |
| /ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,nl,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /nl | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /nl/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,nl,de,fr |
| /nl/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,nl,de,fr |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /nl/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /nl/nl/about | /nl/about?q=1#top [—] |  | /nl/about?q=1#top [null] | /nl/about?q=1#top [null] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /a-propos | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | null | null | en,nl,de,fr |
| /about | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | null | null | en,nl,de,fr |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-fr?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de,nl,fr |
| /de-only | / [index] |  | / [index] | / [index] | null | null | de |
| /ueber-uns | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | null | null | en,nl,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /nl | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /nl/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,nl,fr |
| /about/ | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | null | null | en,nl,de,fr |
| /nl/about/ | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | null | null | en,nl,de,fr |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /nl/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /nl/nl/about | /nl/about?q=1#top [—] |  | /nl/about?q=1#top [null] | /nl/about?q=1#top [null] | null | null | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /a-propos | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,nl,de,fr |
| /about | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,nl,de,fr |
| /blog/hello-world | external https://example.com/blog/hello-world?q=1#top | external https://example.com/blog/hello-world?q=1#top | https://example.com/blog/hello-world?q=1#top [—] | https://example.com/blog/hello-world?q=1#top [—] | null | null | en,de,nl,fr |
| /de-only | external https://example.com/ |  | https://example.com/ [—] | https://example.com/ [—] | null | null | de |
| /ueber-uns | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,nl,de,fr |
| /de | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /de/ | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /nl | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /nl/ | external https://example.com/?q=1#top |  | https://example.com/?q=1#top [—] | https://example.com/?q=1#top [—] | null | null | en,de,nl,fr |
| /about/ | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,nl,de,fr |
| /nl/about/ | external https://example.com/about?q=1#top |  | https://example.com/about?q=1#top [—] | https://example.com/about?q=1#top [—] | null | null | en,nl,de,fr |
| /missing | external https://example.com/missing?q=1#top |  | https://example.com/missing?q=1#top [—] | https://example.com/missing?q=1#top [—] | null | null | null |
| /nl/missing | external https://example.com/missing?q=1#top |  | https://example.com/missing?q=1#top [—] | https://example.com/missing?q=1#top [—] | null | null | null |
| /xx/about | external https://example.com/xx/about?q=1#top |  | https://example.com/xx/about?q=1#top [—] | https://example.com/xx/about?q=1#top [—] | null | null | null |
| /nl/nl/about | external https://example.com/nl/about?q=1#top |  | https://example.com/nl/about?q=1#top [—] | https://example.com/nl/about?q=1#top [—] | null | null | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | de from / | nl from / | fr from / |
|---|---|---|---|
| about | /ueber-uns [localized-about-de] | /about [about] | /a-propos [localized-about-fr] |
| blog-slug | /blog/hello-world [blog-slug] | /blog/hello-world [blog-slug] | /blog/hello-world [blog-slug] |
| de-only | /de-only [de-only] | / [index] | / [index] |
| index | / [index] | / [index] | / [index] |

## Invariant breaks (0)

none
