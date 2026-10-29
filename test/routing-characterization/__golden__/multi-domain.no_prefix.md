# multi-domain · no_prefix

locales on their own domains (baseUrl, baseDefault)

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| about | /about |  |  |
| blog-slug | /blog/:slug() |  |  |
| localized-about-de | /ueber-uns |  |  |
| localized-about-fr | /a-propos |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | null | null | null | null |
| /a-propos | localized-about-fr | en | about | about | null | null | null | null |
| /about | about | en | about | about | null | null | null | null |
| /blog/hello-world | blog-slug | en | blog-slug | blog-slug | null | null | null | null |
| /ueber-uns | localized-about-de | en | about | about | null | null | null | null |
| /en | null | en |  | null | null | en | null | null |
| /en/ | null | en |  | null | null | en | null | null |
| /de | null | en |  | null | null | de | null | null |
| /de/ | null | en |  | null | null | de | null | null |
| /about/ | about | en | about | about | null | null | null | null |
| /de/about/ | null | en |  | null | null | de | null | null |
| /missing | null | en |  | null | null | null | null | null |
| /de/missing | null | en |  | null | null | de | null | null |
| /xx/about | null | en |  | null | null | null | null | null |
| /de/de/about | null | en |  | null | null | de | null | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /a-propos | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /a-propos | null |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | null |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world | null |
| /ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /ueber-uns | null |
| /en | /en?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /en/?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de | /de?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/ | /de/?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /about/?q=1#top [about] | /about/?q=1#top [about] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | / | null |
| /a-propos | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | /a-propos | null |
| /about | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | /about | null |
| /blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | /blog/hello-world | null |
| /ueber-uns | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | /ueber-uns | null |
| /en | /en?q=1#top [—] |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | /en | null |
| /en/ | /en/?q=1#top [—] |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | /en/ | null |
| /de | /de?q=1#top [—] |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | /de | null |
| /de/ | /de/?q=1#top [—] |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | /de/ | null |
| /about/ | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | /about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | https://example.de/about/?q=1#top [—] | https://example.de/about/?q=1#top [—] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | /missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | https://example.de/xx/about?q=1#top [—] | https://example.de/xx/about?q=1#top [—] | /xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | https://example.de/de/about?q=1#top [—] | https://example.de/de/about?q=1#top [—] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | external https://example.fr/?q=1#top |  | https://example.fr/?q=1#top [—] | https://example.fr/?q=1#top [—] | / | null |
| /a-propos | external https://example.fr/a-propos?q=1#top |  | https://example.fr/a-propos?q=1#top [—] | https://example.fr/a-propos?q=1#top [—] | /a-propos | null |
| /about | external https://example.fr/a-propos?q=1#top |  | https://example.fr/a-propos?q=1#top [—] | https://example.fr/a-propos?q=1#top [—] | /about | null |
| /blog/hello-world | external https://example.fr/blog/hello-world?q=1#top | external https://example.fr/blog/hello-world-fr?q=1#top | https://example.fr/blog/hello-world?q=1#top [—] | https://example.fr/blog/hello-world?q=1#top [—] | /blog/hello-world | null |
| /ueber-uns | external https://example.fr/a-propos?q=1#top |  | https://example.fr/a-propos?q=1#top [—] | https://example.fr/a-propos?q=1#top [—] | /ueber-uns | null |
| /en | /en?q=1#top [—] |  | https://example.fr/?q=1#top [—] | https://example.fr/?q=1#top [—] | /en | null |
| /en/ | /en/?q=1#top [—] |  | https://example.fr/?q=1#top [—] | https://example.fr/?q=1#top [—] | /en/ | null |
| /de | /de?q=1#top [—] |  | https://example.fr/?q=1#top [—] | https://example.fr/?q=1#top [—] | /de | null |
| /de/ | /de/?q=1#top [—] |  | https://example.fr/?q=1#top [—] | https://example.fr/?q=1#top [—] | /de/ | null |
| /about/ | external https://example.fr/a-propos?q=1#top |  | https://example.fr/a-propos?q=1#top [—] | https://example.fr/a-propos?q=1#top [—] | /about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | https://example.fr/about/?q=1#top [—] | https://example.fr/about/?q=1#top [—] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | https://example.fr/missing?q=1#top [—] | https://example.fr/missing?q=1#top [—] | /missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | https://example.fr/missing?q=1#top [—] | https://example.fr/missing?q=1#top [—] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | https://example.fr/xx/about?q=1#top [—] | https://example.fr/xx/about?q=1#top [—] | /xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | https://example.fr/de/about?q=1#top [—] | https://example.fr/de/about?q=1#top [—] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / |
|---|---|---|---|
| about | /about [about] | https://example.de/ueber-uns [—] | https://example.fr/a-propos [—] |
| blog-slug | /blog/hello-world [blog-slug] | https://example.de/blog/hello-world [—] | https://example.fr/blog/hello-world [—] |
| index | / [index] | https://example.de/ [—] | https://example.fr/ [—] |

## Invariant breaks (0)

none
