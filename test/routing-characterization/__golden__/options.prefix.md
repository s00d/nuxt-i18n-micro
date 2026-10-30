# options · prefix

hyphenated locale codes, custom route-name prefix, custom locale regex, noPrefixRedirect, excluded paths

locales: en-us, pt-br, de · default: en-us

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| api-docs | /api-docs |  |  |
| i18n-index | /:locale([a-z]{2}-[a-z]{2}\|[a-z]{2}) |  |  |
| i18n-about | /:locale([a-z]{2}-[a-z]{2}\|[a-z]{2})/about |  |  |
| i18n-about-pt-br | /:locale([a-z]{2}-[a-z]{2}\|[a-z]{2})/sobre |  |  |
| i18n-about-de | /:locale([a-z]{2}-[a-z]{2}\|[a-z]{2})/ueber-uns |  |  |
| i18n-blog-slug | /:locale([a-z]{2}-[a-z]{2}\|[a-z]{2})/blog/:slug() |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| /api-docs | api-docs | en-us | api-docs | api-docs | null | null | null | null |
| /de | i18n-index | de | index | index | null | de | de | null |
| /de/about | i18n-about | de | about | about | null | de | de | null |
| /de/blog/hello-world | i18n-blog-slug | de | blog-slug | blog-slug | null | de | de | null |
| /de/sobre | i18n-about-pt-br | de | about | about | null | de | de | null |
| /de/ueber-uns | i18n-about-de | de | about | about | null | de | de | null |
| /en-us | i18n-index | en-us | index | index | null | en-us | en-us | null |
| /en-us/about | i18n-about | en-us | about | about | null | en-us | en-us | null |
| /en-us/blog/hello-world | i18n-blog-slug | en-us | blog-slug | blog-slug | null | en-us | en-us | null |
| /en-us/sobre | i18n-about-pt-br | en-us | about | about | null | en-us | en-us | null |
| /en-us/ueber-uns | i18n-about-de | en-us | about | about | null | en-us | en-us | null |
| /pt-br | i18n-index | pt-br | index | index | null | pt-br | pt-br | null |
| /pt-br/about | i18n-about | pt-br | about | about | null | pt-br | pt-br | null |
| /pt-br/blog/hello-world | i18n-blog-slug | pt-br | blog-slug | blog-slug | null | pt-br | pt-br | null |
| /pt-br/sobre | i18n-about-pt-br | pt-br | about | about | null | pt-br | pt-br | null |
| /pt-br/ueber-uns | i18n-about-de | pt-br | about | about | null | pt-br | pt-br | null |
| / | null | en-us | index | index | null | null | null | null |
| /en-us/ | i18n-index | en-us | index | index | null | en-us | en-us | null |
| /pt-br/ | i18n-index | pt-br | index | index | null | pt-br | pt-br | null |
| /about/ | null | en-us | about | about | null | null | null | null |
| /pt-br/about/ | i18n-about | pt-br | about | about | null | pt-br | pt-br | null |
| /missing | null | en-us |  | null | null | null | null | null |
| /pt-br/missing | null | pt-br |  | null | null | pt-br | pt-br | null |
| /xx/about | i18n-about | en-us | about | about | null | null | null | null |
| /pt-br/pt-br/about | null | pt-br | about | about | null | pt-br | pt-br | null |

## To en-us

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| /api-docs | /api-docs?q=1#top [api-docs] |  | /api-docs?q=1#top [api-docs] | /api-docs?q=1#top [api-docs] | null | null | null |
| /de | /en-us?q=1#top [i18n-index] |  | /en-us?q=1#top [i18n-index] | /en-us?q=1#top [i18n-index] | null | /en-us | en-us,pt-br,de |
| /de/about | /en-us/about?q=1#top [i18n-about] |  | /en-us/about?q=1#top [i18n-about] | /en-us/about?q=1#top [i18n-about] | null | /en-us/about | en-us,pt-br,de |
| /de/blog/hello-world | /en-us/blog/hello-world?q=1#top [i18n-blog-slug] | /en-us/blog/hello-world-en-us?q=1#top [i18n-blog-slug] | /en-us/blog/hello-world?q=1#top [i18n-blog-slug] | /en-us/blog/hello-world?q=1#top [i18n-blog-slug] | null | /en-us/blog/hello-world | en-us,pt-br,de |
| /de/sobre | /en-us/about?q=1#top [i18n-about] |  | /en-us/about?q=1#top [i18n-about] | /en-us/about?q=1#top [i18n-about] | null | /en-us/about | en-us,pt-br,de |
| /de/ueber-uns | /en-us/about?q=1#top [i18n-about] |  | /en-us/about?q=1#top [i18n-about] | /en-us/about?q=1#top [i18n-about] | null | /en-us/about | en-us,pt-br,de |
| /en-us | /en-us?q=1#top [i18n-index] |  | /en-us?q=1#top [i18n-index] | /en-us?q=1#top [i18n-index] | null | null | en-us,pt-br,de |
| /en-us/about | /en-us/about?q=1#top [i18n-about] |  | /en-us/about?q=1#top [i18n-about] | /en-us/about?q=1#top [i18n-about] | null | null | en-us,pt-br,de |
| /en-us/blog/hello-world | /en-us/blog/hello-world?q=1#top [i18n-blog-slug] | /en-us/blog/hello-world-en-us?q=1#top [i18n-blog-slug] | /en-us/blog/hello-world?q=1#top [i18n-blog-slug] | /en-us/blog/hello-world?q=1#top [i18n-blog-slug] | null | null | en-us,pt-br,de |
| /en-us/sobre | /en-us/about?q=1#top [i18n-about] |  | /en-us/about?q=1#top [i18n-about] | /en-us/about?q=1#top [i18n-about] | null | null | en-us,pt-br,de |
| /en-us/ueber-uns | /en-us/about?q=1#top [i18n-about] |  | /en-us/about?q=1#top [i18n-about] | /en-us/about?q=1#top [i18n-about] | null | null | en-us,pt-br,de |
| /pt-br | /en-us?q=1#top [i18n-index] |  | /en-us?q=1#top [i18n-index] | /en-us?q=1#top [i18n-index] | null | /en-us | en-us,pt-br,de |
| /pt-br/about | /en-us/about?q=1#top [i18n-about] |  | /en-us/about?q=1#top [i18n-about] | /en-us/about?q=1#top [i18n-about] | null | /en-us/about | en-us,pt-br,de |
| /pt-br/blog/hello-world | /en-us/blog/hello-world?q=1#top [i18n-blog-slug] | /en-us/blog/hello-world-en-us?q=1#top [i18n-blog-slug] | /en-us/blog/hello-world?q=1#top [i18n-blog-slug] | /en-us/blog/hello-world?q=1#top [i18n-blog-slug] | null | /en-us/blog/hello-world | en-us,pt-br,de |
| /pt-br/sobre | /en-us/about?q=1#top [i18n-about] |  | /en-us/about?q=1#top [i18n-about] | /en-us/about?q=1#top [i18n-about] | null | /en-us/about | en-us,pt-br,de |
| /pt-br/ueber-uns | /en-us/about?q=1#top [i18n-about] |  | /en-us/about?q=1#top [i18n-about] | /en-us/about?q=1#top [i18n-about] | null | /en-us/about | en-us,pt-br,de |
| / | /en-us?q=1#top [i18n-index] |  | /en-us?q=1#top [i18n-index] | /en-us?q=1#top [i18n-index] | /en-us | /en-us | en-us,pt-br,de |
| /en-us/ | /en-us?q=1#top [i18n-index] |  | /en-us?q=1#top [i18n-index] | /en-us?q=1#top [i18n-index] | null | null | en-us,pt-br,de |
| /pt-br/ | /en-us?q=1#top [i18n-index] |  | /en-us?q=1#top [i18n-index] | /en-us?q=1#top [i18n-index] | null | /en-us | en-us,pt-br,de |
| /about/ | /en-us/about?q=1#top [i18n-about] |  | /en-us/about?q=1#top [i18n-about] | /en-us/about?q=1#top [i18n-about] | /en-us/about | /en-us/about | en-us,pt-br,de |
| /pt-br/about/ | /en-us/about?q=1#top [i18n-about] |  | /en-us/about?q=1#top [i18n-about] | /en-us/about?q=1#top [i18n-about] | null | /en-us/about | en-us,pt-br,de |
| /missing | /en-us/missing?q=1#top [—] |  | /en-us/missing?q=1#top [null] | /en-us/missing?q=1#top [null] | /en-us/missing | /en-us/missing | null |
| /pt-br/missing | /en-us/missing?q=1#top [—] |  | /en-us/missing?q=1#top [null] | /en-us/missing?q=1#top [null] | null | /en-us/missing | null |
| /xx/about | /en-us/about?q=1#top [i18n-about] |  | /en-us/about?q=1#top [i18n-about] | /en-us/about?q=1#top [i18n-about] | /en-us/about | /en-us/about | en-us,pt-br,de |
| /pt-br/pt-br/about | /en-us/about?q=1#top [i18n-about] |  | /en-us/about?q=1#top [i18n-about] | /en-us/about?q=1#top [i18n-about] | null | /en-us/about | en-us,pt-br,de |

## To pt-br

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| /api-docs | /api-docs?q=1#top [api-docs] |  | /api-docs?q=1#top [api-docs] | /api-docs?q=1#top [api-docs] | null | null | null |
| /de | /pt-br?q=1#top [i18n-index] |  | /pt-br?q=1#top [i18n-index] | /pt-br?q=1#top [i18n-index] | null | /pt-br | en-us,pt-br,de |
| /de/about | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | null | /pt-br/sobre | en-us,pt-br,de |
| /de/blog/hello-world | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world-pt-br?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | null | /pt-br/blog/hello-world | en-us,pt-br,de |
| /de/sobre | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | null | /pt-br/sobre | en-us,pt-br,de |
| /de/ueber-uns | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | null | /pt-br/sobre | en-us,pt-br,de |
| /en-us | /pt-br?q=1#top [i18n-index] |  | /pt-br?q=1#top [i18n-index] | /pt-br?q=1#top [i18n-index] | null | /pt-br | en-us,pt-br,de |
| /en-us/about | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | null | /pt-br/sobre | en-us,pt-br,de |
| /en-us/blog/hello-world | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world-pt-br?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | null | /pt-br/blog/hello-world | en-us,pt-br,de |
| /en-us/sobre | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | null | /pt-br/sobre | en-us,pt-br,de |
| /en-us/ueber-uns | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | null | /pt-br/sobre | en-us,pt-br,de |
| /pt-br | /pt-br?q=1#top [i18n-index] |  | /pt-br?q=1#top [i18n-index] | /pt-br?q=1#top [i18n-index] | null | null | en-us,pt-br,de |
| /pt-br/about | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | null | null | en-us,pt-br,de |
| /pt-br/blog/hello-world | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world-pt-br?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | null | null | en-us,pt-br,de |
| /pt-br/sobre | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | null | null | en-us,pt-br,de |
| /pt-br/ueber-uns | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | null | null | en-us,pt-br,de |
| / | /pt-br?q=1#top [i18n-index] |  | /pt-br?q=1#top [i18n-index] | /pt-br?q=1#top [i18n-index] | /pt-br | /pt-br | en-us,pt-br,de |
| /en-us/ | /pt-br?q=1#top [i18n-index] |  | /pt-br?q=1#top [i18n-index] | /pt-br?q=1#top [i18n-index] | null | /pt-br | en-us,pt-br,de |
| /pt-br/ | /pt-br?q=1#top [i18n-index] |  | /pt-br?q=1#top [i18n-index] | /pt-br?q=1#top [i18n-index] | null | null | en-us,pt-br,de |
| /about/ | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre | /pt-br/sobre | en-us,pt-br,de |
| /pt-br/about/ | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | null | null | en-us,pt-br,de |
| /missing | /pt-br/missing?q=1#top [—] |  | /pt-br/missing?q=1#top [null] | /pt-br/missing?q=1#top [null] | /pt-br/missing | /pt-br/missing | null |
| /pt-br/missing | /pt-br/missing?q=1#top [—] |  | /pt-br/missing?q=1#top [null] | /pt-br/missing?q=1#top [null] | null | null | null |
| /xx/about | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre | /pt-br/sobre | en-us,pt-br,de |
| /pt-br/pt-br/about | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | null | null | en-us,pt-br,de |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| /api-docs | /api-docs?q=1#top [api-docs] |  | /api-docs?q=1#top [api-docs] | /api-docs?q=1#top [api-docs] | null | null | null |
| /de | /de?q=1#top [i18n-index] |  | /de?q=1#top [i18n-index] | /de?q=1#top [i18n-index] | null | null | en-us,pt-br,de |
| /de/about | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | null | null | en-us,pt-br,de |
| /de/blog/hello-world | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world-de?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | null | null | en-us,pt-br,de |
| /de/sobre | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | null | null | en-us,pt-br,de |
| /de/ueber-uns | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | null | null | en-us,pt-br,de |
| /en-us | /de?q=1#top [i18n-index] |  | /de?q=1#top [i18n-index] | /de?q=1#top [i18n-index] | null | /de | en-us,pt-br,de |
| /en-us/about | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | null | /de/ueber-uns | en-us,pt-br,de |
| /en-us/blog/hello-world | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world-de?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | null | /de/blog/hello-world | en-us,pt-br,de |
| /en-us/sobre | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | null | /de/ueber-uns | en-us,pt-br,de |
| /en-us/ueber-uns | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | null | /de/ueber-uns | en-us,pt-br,de |
| /pt-br | /de?q=1#top [i18n-index] |  | /de?q=1#top [i18n-index] | /de?q=1#top [i18n-index] | null | /de | en-us,pt-br,de |
| /pt-br/about | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | null | /de/ueber-uns | en-us,pt-br,de |
| /pt-br/blog/hello-world | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world-de?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | null | /de/blog/hello-world | en-us,pt-br,de |
| /pt-br/sobre | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | null | /de/ueber-uns | en-us,pt-br,de |
| /pt-br/ueber-uns | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | null | /de/ueber-uns | en-us,pt-br,de |
| / | /de?q=1#top [i18n-index] |  | /de?q=1#top [i18n-index] | /de?q=1#top [i18n-index] | /de | /de | en-us,pt-br,de |
| /en-us/ | /de?q=1#top [i18n-index] |  | /de?q=1#top [i18n-index] | /de?q=1#top [i18n-index] | null | /de | en-us,pt-br,de |
| /pt-br/ | /de?q=1#top [i18n-index] |  | /de?q=1#top [i18n-index] | /de?q=1#top [i18n-index] | null | /de | en-us,pt-br,de |
| /about/ | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns | /de/ueber-uns | en-us,pt-br,de |
| /pt-br/about/ | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | null | /de/ueber-uns | en-us,pt-br,de |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | /de/missing | null |
| /pt-br/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | /de/missing | null |
| /xx/about | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns | /de/ueber-uns | en-us,pt-br,de |
| /pt-br/pt-br/about | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | null | /de/ueber-uns | en-us,pt-br,de |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en-us from /en-us | pt-br from /en-us | de from /en-us | en-us from /pt-br | pt-br from /pt-br | de from /pt-br | en-us from /de | pt-br from /de | de from /de |
|---|---|---|---|---|---|---|---|---|---|
| about | /en-us/about [i18n-about] | /pt-br/sobre [i18n-about-pt-br] | /de/ueber-uns [i18n-about-de] | /en-us/about [i18n-about] | /pt-br/sobre [i18n-about-pt-br] | /de/ueber-uns [i18n-about-de] | /en-us/about [i18n-about] | /pt-br/sobre [i18n-about-pt-br] | /de/ueber-uns [i18n-about-de] |
| api-docs | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] |
| blog-slug | /en-us/blog/hello-world [i18n-blog-slug] | /pt-br/blog/hello-world [i18n-blog-slug] | /de/blog/hello-world [i18n-blog-slug] | /en-us/blog/hello-world [i18n-blog-slug] | /pt-br/blog/hello-world [i18n-blog-slug] | /de/blog/hello-world [i18n-blog-slug] | /en-us/blog/hello-world [i18n-blog-slug] | /pt-br/blog/hello-world [i18n-blog-slug] | /de/blog/hello-world [i18n-blog-slug] |
| index | /en-us [i18n-index] | /pt-br [i18n-index] | /de [i18n-index] | /en-us [i18n-index] | /pt-br [i18n-index] | /de [i18n-index] | /en-us [i18n-index] | /pt-br [i18n-index] | /de [i18n-index] |

## Invariant breaks (0)

none
