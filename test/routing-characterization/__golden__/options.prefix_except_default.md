# options · prefix_except_default

hyphenated locale codes, custom route-name prefix, custom locale regex, noPrefixRedirect, excluded paths

locales: en-us, pt-br, de · default: en-us

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| about | /about |  |  |
| blog-slug | /blog/:slug() |  |  |
| api-docs | /api-docs |  |  |
| i18n-index | /:locale([a-z]{2}-[a-z]{2}\|[a-z]{2}) |  |  |
| i18n-about-pt-br | /:locale([a-z]{2}-[a-z]{2}\|[a-z]{2})/sobre |  |  |
| i18n-about-de | /:locale([a-z]{2}-[a-z]{2}\|[a-z]{2})/ueber-uns |  |  |
| i18n-blog-slug | /:locale([a-z]{2}-[a-z]{2}\|[a-z]{2})/blog/:slug() |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en-us | index | index | null | null | en-us | null |
| /about | about | en-us | about | about | null | null | en-us | null |
| /api-docs | api-docs | en-us | api-docs | api-docs | null | null | en-us | null |
| /blog/hello-world | blog-slug | en-us | blog-slug | blog-slug | null | null | en-us | null |
| /de | i18n-index | de | index | index | null | de | de | null |
| /de/blog/hello-world | i18n-blog-slug | de | blog-slug | blog-slug | null | de | de | null |
| /de/sobre | i18n-about-pt-br | de | about | about | null | de | de | null |
| /de/ueber-uns | i18n-about-de | de | about | about | null | de | de | null |
| /en-us | i18n-index | en-us | index | index | null | en-us | en-us | Default locale should not have prefix |
| /en-us/blog/hello-world | i18n-blog-slug | en-us | blog-slug | blog-slug | null | en-us | en-us | Default locale should not have prefix |
| /en-us/sobre | i18n-about-pt-br | en-us | about | about | null | en-us | en-us | Default locale should not have prefix |
| /en-us/ueber-uns | i18n-about-de | en-us | about | about | null | en-us | en-us | Default locale should not have prefix |
| /pt-br | i18n-index | pt-br | index | index | null | pt-br | pt-br | null |
| /pt-br/blog/hello-world | i18n-blog-slug | pt-br | blog-slug | blog-slug | null | pt-br | pt-br | null |
| /pt-br/sobre | i18n-about-pt-br | pt-br | about | about | null | pt-br | pt-br | null |
| /pt-br/ueber-uns | i18n-about-de | pt-br | about | about | null | pt-br | pt-br | null |
| /en-us/ | i18n-index | en-us | index | index | null | en-us | en-us | Default locale should not have prefix |
| /pt-br/ | i18n-index | pt-br | index | index | null | pt-br | pt-br | null |
| /about/ | about | en-us | about | about | null | null | en-us | null |
| /pt-br/about/ | null | pt-br |  | about | null | pt-br | pt-br | null |
| /missing | null | en-us |  | null | null | null | en-us | null |
| /pt-br/missing | null | pt-br |  | null | null | pt-br | pt-br | null |
| /xx/about | null | en-us |  | null | null | null | en-us | null |
| /pt-br/pt-br/about | null | pt-br |  | null | null | pt-br | pt-br | null |

## To en-us

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | null |
| /api-docs | /api-docs?q=1#top [api-docs] |  | /api-docs?q=1#top [api-docs] | /api-docs?q=1#top [api-docs] | /api-docs | null |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en-us?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world | null |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en-us?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /de/blog/hello-world | null |
| /de/sobre | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /de/sobre | null |
| /de/ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /de/ueber-uns | null |
| /en-us | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en-us | null |
| /en-us/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en-us?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /en-us/blog/hello-world | null |
| /en-us/sobre | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /en-us/sobre | null |
| /en-us/ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /en-us/ueber-uns | null |
| /pt-br | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /pt-br | null |
| /pt-br/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en-us?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /pt-br/blog/hello-world | null |
| /pt-br/sobre | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /pt-br/sobre | null |
| /pt-br/ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /pt-br/ueber-uns | null |
| /en-us/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en-us/ | null |
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
| / | /pt-br?q=1#top [i18n-index] |  | /pt-br?q=1#top [i18n-index] | /pt-br?q=1#top [i18n-index] | / | /pt-br |
| /about | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /about | /pt-br/sobre |
| /api-docs | /api-docs?q=1#top [api-docs] |  | /api-docs?q=1#top [api-docs] | /api-docs?q=1#top [api-docs] | /api-docs | null |
| /blog/hello-world | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world-pt-br?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /blog/hello-world | /pt-br/blog/hello-world |
| /de | /pt-br?q=1#top [i18n-index] |  | /pt-br?q=1#top [i18n-index] | /pt-br?q=1#top [i18n-index] | /de | null |
| /de/blog/hello-world | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world-pt-br?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world | null |
| /de/sobre | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /de/sobre | null |
| /de/ueber-uns | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /de/ueber-uns | null |
| /en-us | /pt-br?q=1#top [i18n-index] |  | /pt-br?q=1#top [i18n-index] | /pt-br?q=1#top [i18n-index] | /en-us | null |
| /en-us/blog/hello-world | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world-pt-br?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /en-us/blog/hello-world | null |
| /en-us/sobre | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /en-us/sobre | null |
| /en-us/ueber-uns | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /en-us/ueber-uns | null |
| /pt-br | /pt-br?q=1#top [i18n-index] |  | /pt-br?q=1#top [i18n-index] | /pt-br?q=1#top [i18n-index] | /pt-br | null |
| /pt-br/blog/hello-world | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world-pt-br?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world | null |
| /pt-br/sobre | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre | null |
| /pt-br/ueber-uns | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/ueber-uns | null |
| /en-us/ | /pt-br?q=1#top [i18n-index] |  | /pt-br?q=1#top [i18n-index] | /pt-br?q=1#top [i18n-index] | /en-us/ | null |
| /pt-br/ | /pt-br?q=1#top [i18n-index] |  | /pt-br?q=1#top [i18n-index] | /pt-br?q=1#top [i18n-index] | /pt-br/ | null |
| /about/ | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /about/ | /pt-br/sobre |
| /pt-br/about/ | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/about/ | null |
| /missing | /pt-br/missing?q=1#top [—] |  | /pt-br/missing?q=1#top [null] | /pt-br/missing?q=1#top [null] | /missing | /pt-br/missing |
| /pt-br/missing | /pt-br/missing?q=1#top [—] |  | /pt-br/missing?q=1#top [null] | /pt-br/missing?q=1#top [null] | /pt-br/missing | null |
| /xx/about | /pt-br/xx/about?q=1#top [—] |  | /pt-br/xx/about?q=1#top [null] | /pt-br/xx/about?q=1#top [null] | /xx/about | /pt-br/xx/about |
| /pt-br/pt-br/about | /pt-br/pt-br/about?q=1#top [—] |  | /pt-br/pt-br/about?q=1#top [null] | /pt-br/pt-br/about?q=1#top [null] | /pt-br/pt-br/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /de?q=1#top [i18n-index] |  | /de?q=1#top [i18n-index] | /de?q=1#top [i18n-index] | / | /de |
| /about | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | /about | /de/ueber-uns |
| /api-docs | /api-docs?q=1#top [api-docs] |  | /api-docs?q=1#top [api-docs] | /api-docs?q=1#top [api-docs] | /api-docs | null |
| /blog/hello-world | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world-de?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /blog/hello-world | /de/blog/hello-world |
| /de | /de?q=1#top [i18n-index] |  | /de?q=1#top [i18n-index] | /de?q=1#top [i18n-index] | /de | null |
| /de/blog/hello-world | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world-de?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world | null |
| /de/sobre | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | /de/sobre | null |
| /de/ueber-uns | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns | null |
| /en-us | /de?q=1#top [i18n-index] |  | /de?q=1#top [i18n-index] | /de?q=1#top [i18n-index] | /en-us | null |
| /en-us/blog/hello-world | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world-de?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /en-us/blog/hello-world | null |
| /en-us/sobre | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | /en-us/sobre | null |
| /en-us/ueber-uns | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | /en-us/ueber-uns | null |
| /pt-br | /de?q=1#top [i18n-index] |  | /de?q=1#top [i18n-index] | /de?q=1#top [i18n-index] | /pt-br | null |
| /pt-br/blog/hello-world | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world-de?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world | null |
| /pt-br/sobre | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | /pt-br/sobre | null |
| /pt-br/ueber-uns | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | /pt-br/ueber-uns | null |
| /en-us/ | /de?q=1#top [i18n-index] |  | /de?q=1#top [i18n-index] | /de?q=1#top [i18n-index] | /en-us/ | null |
| /pt-br/ | /de?q=1#top [i18n-index] |  | /de?q=1#top [i18n-index] | /de?q=1#top [i18n-index] | /pt-br/ | null |
| /about/ | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | /about/ | /de/ueber-uns |
| /pt-br/about/ | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | /pt-br/about/ | null |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /missing | /de/missing |
| /pt-br/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /pt-br/missing | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /xx/about | /de/xx/about |
| /pt-br/pt-br/about | /de/pt-br/about?q=1#top [—] |  | /de/pt-br/about?q=1#top [null] | /de/pt-br/about?q=1#top [null] | /pt-br/pt-br/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en-us from / | pt-br from / | de from / | en-us from /pt-br | pt-br from /pt-br | de from /pt-br | en-us from /de | pt-br from /de | de from /de |
|---|---|---|---|---|---|---|---|---|---|
| about | /about [about] | /pt-br/sobre [i18n-about-pt-br] | /de/ueber-uns [i18n-about-de] | /about [about] | /pt-br/sobre [i18n-about-pt-br] | /de/ueber-uns [i18n-about-de] | /about [about] | /pt-br/sobre [i18n-about-pt-br] | /de/ueber-uns [i18n-about-de] |
| api-docs | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] |
| blog-slug | /blog/hello-world [blog-slug] | /pt-br/blog/hello-world [i18n-blog-slug] | /de/blog/hello-world [i18n-blog-slug] | /blog/hello-world [blog-slug] | /pt-br/blog/hello-world [i18n-blog-slug] | /de/blog/hello-world [i18n-blog-slug] | /blog/hello-world [blog-slug] | /pt-br/blog/hello-world [i18n-blog-slug] | /de/blog/hello-world [i18n-blog-slug] |
| index | / [index] | /pt-br [i18n-index] | /de [i18n-index] | / [index] | /pt-br [i18n-index] | /de [i18n-index] | / [index] | /pt-br [i18n-index] | /de [i18n-index] |

## Invariant breaks (0)

none
