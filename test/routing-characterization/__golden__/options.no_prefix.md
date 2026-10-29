# options · no_prefix

hyphenated locale codes, custom route-name prefix, custom locale regex, noPrefixRedirect, excluded paths

locales: en-us, pt-br, de · default: en-us

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| about | /about |  |  |
| blog-slug | /blog/:slug() |  |  |
| api-docs | /api-docs |  |  |
| i18n-about-pt-br | /sobre |  |  |
| i18n-about-de | /ueber-uns |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en-us | index | index | null | null | null | null |
| /about | about | en-us | about | about | null | null | null | null |
| /api-docs | api-docs | en-us | api-docs | api-docs | null | null | null | null |
| /blog/hello-world | blog-slug | en-us | blog-slug | blog-slug | null | null | null | null |
| /sobre | i18n-about-pt-br | en-us | about | about | null | null | null | null |
| /ueber-uns | i18n-about-de | en-us | about | about | null | null | null | null |
| /en-us | null | en-us |  | index | null | en-us | null | null |
| /en-us/ | null | en-us |  | index | null | en-us | null | null |
| /pt-br | null | en-us |  | index | null | pt-br | null | null |
| /pt-br/ | null | en-us |  | index | null | pt-br | null | null |
| /about/ | about | en-us | about | about | null | null | null | null |
| /pt-br/about/ | null | en-us |  | about | null | pt-br | null | null |
| /missing | null | en-us |  | null | null | null | null | null |
| /pt-br/missing | null | en-us |  | null | null | pt-br | null | null |
| /xx/about | null | en-us |  | null | null | null | null | null |
| /pt-br/pt-br/about | null | en-us |  | null | null | pt-br | null | null |

## To en-us

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | null |
| /api-docs | /api-docs?q=1#top [api-docs] |  | /api-docs?q=1#top [api-docs] | /api-docs?q=1#top [api-docs] | /api-docs | null |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en-us?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world | null |
| /sobre | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /sobre | null |
| /ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /ueber-uns | null |
| /en-us | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en-us | null |
| /en-us/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en-us/ | null |
| /pt-br | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /pt-br | null |
| /pt-br/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /pt-br/ | null |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about/ | null |
| /pt-br/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /pt-br/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /pt-br/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /pt-br/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /pt-br/pt-br/about | /pt-br/about?q=1#top [—] |  | /pt-br/about?q=1#top [null] | /pt-br/about?q=1#top [null] | /pt-br/pt-br/about | null |

## To pt-br

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /about | /sobre?q=1#top [i18n-about-pt-br] |  | /sobre?q=1#top [i18n-about-pt-br] | /sobre?q=1#top [i18n-about-pt-br] | /about | null |
| /api-docs | /api-docs?q=1#top [api-docs] |  | /api-docs?q=1#top [api-docs] | /api-docs?q=1#top [api-docs] | /api-docs | null |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-pt-br?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world | null |
| /sobre | /sobre?q=1#top [i18n-about-pt-br] |  | /sobre?q=1#top [i18n-about-pt-br] | /sobre?q=1#top [i18n-about-pt-br] | /sobre | null |
| /ueber-uns | /sobre?q=1#top [i18n-about-pt-br] |  | /sobre?q=1#top [i18n-about-pt-br] | /sobre?q=1#top [i18n-about-pt-br] | /ueber-uns | null |
| /en-us | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en-us | null |
| /en-us/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en-us/ | null |
| /pt-br | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /pt-br | null |
| /pt-br/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /pt-br/ | null |
| /about/ | /sobre?q=1#top [i18n-about-pt-br] |  | /sobre?q=1#top [i18n-about-pt-br] | /sobre?q=1#top [i18n-about-pt-br] | /about/ | null |
| /pt-br/about/ | /sobre?q=1#top [i18n-about-pt-br] |  | /sobre?q=1#top [i18n-about-pt-br] | /sobre?q=1#top [i18n-about-pt-br] | /pt-br/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /pt-br/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /pt-br/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /pt-br/pt-br/about | /pt-br/about?q=1#top [—] |  | /pt-br/about?q=1#top [null] | /pt-br/about?q=1#top [null] | /pt-br/pt-br/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /about | /ueber-uns?q=1#top [i18n-about-de] |  | /ueber-uns?q=1#top [i18n-about-de] | /ueber-uns?q=1#top [i18n-about-de] | /about | null |
| /api-docs | /api-docs?q=1#top [api-docs] |  | /api-docs?q=1#top [api-docs] | /api-docs?q=1#top [api-docs] | /api-docs | null |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-de?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world | null |
| /sobre | /ueber-uns?q=1#top [i18n-about-de] |  | /ueber-uns?q=1#top [i18n-about-de] | /ueber-uns?q=1#top [i18n-about-de] | /sobre | null |
| /ueber-uns | /ueber-uns?q=1#top [i18n-about-de] |  | /ueber-uns?q=1#top [i18n-about-de] | /ueber-uns?q=1#top [i18n-about-de] | /ueber-uns | null |
| /en-us | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en-us | null |
| /en-us/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en-us/ | null |
| /pt-br | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /pt-br | null |
| /pt-br/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /pt-br/ | null |
| /about/ | /ueber-uns?q=1#top [i18n-about-de] |  | /ueber-uns?q=1#top [i18n-about-de] | /ueber-uns?q=1#top [i18n-about-de] | /about/ | null |
| /pt-br/about/ | /ueber-uns?q=1#top [i18n-about-de] |  | /ueber-uns?q=1#top [i18n-about-de] | /ueber-uns?q=1#top [i18n-about-de] | /pt-br/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /pt-br/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /pt-br/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /pt-br/pt-br/about | /pt-br/about?q=1#top [—] |  | /pt-br/about?q=1#top [null] | /pt-br/about?q=1#top [null] | /pt-br/pt-br/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en-us from / | pt-br from / | de from / |
|---|---|---|---|
| about | /about [about] | /sobre [i18n-about-pt-br] | /ueber-uns [i18n-about-de] |
| api-docs | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] |
| blog-slug | /blog/hello-world [blog-slug] | /blog/hello-world [blog-slug] | /blog/hello-world [blog-slug] |
| index | / [index] | / [index] | / [index] |

## Invariant breaks (0)

none
