# options · prefix_except_default

hyphenated locale codes, custom route-name prefix, custom locale regex with a page shaped like a locale, noPrefixRedirect, excluded paths

locales: en-us, pt-br, de · default: en-us

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| about | /about |  |  |
| go | /go |  |  |
| blog-slug | /blog/:slug() |  |  |
| api-docs | /api-docs |  |  |
| i18n-index | /:locale([a-z]{2}-[a-z]{2}\|[a-z]{2}) |  |  |
| i18n-about-pt-br | /:locale([a-z]{2}-[a-z]{2}\|[a-z]{2})/sobre |  |  |
| i18n-about-de | /:locale([a-z]{2}-[a-z]{2}\|[a-z]{2})/ueber-uns |  |  |
| i18n-go | /:locale([a-z]{2}-[a-z]{2}\|[a-z]{2})/go |  |  |
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
| /de/go | i18n-go | de | go | go | null | de | de | null |
| /de/sobre | i18n-about-pt-br | de | about | about | null | de | de | null |
| /de/ueber-uns | i18n-about-de | de | about | about | null | de | de | null |
| /en-us | i18n-index | en-us | index | index | null | en-us | en-us | Default locale should not have prefix |
| /en-us/blog/hello-world | i18n-blog-slug | en-us | blog-slug | blog-slug | null | en-us | en-us | Default locale should not have prefix |
| /en-us/go | i18n-go | en-us | go | go | null | en-us | en-us | Default locale should not have prefix |
| /en-us/sobre | i18n-about-pt-br | en-us | about | about | null | en-us | en-us | Default locale should not have prefix |
| /en-us/ueber-uns | i18n-about-de | en-us | about | about | null | en-us | en-us | Default locale should not have prefix |
| /go | go | en-us | go | go | null | null | en-us | null |
| /pt-br | i18n-index | pt-br | index | index | null | pt-br | pt-br | null |
| /pt-br/blog/hello-world | i18n-blog-slug | pt-br | blog-slug | blog-slug | null | pt-br | pt-br | null |
| /pt-br/go | i18n-go | pt-br | go | go | null | pt-br | pt-br | null |
| /pt-br/sobre | i18n-about-pt-br | pt-br | about | about | null | pt-br | pt-br | null |
| /pt-br/ueber-uns | i18n-about-de | pt-br | about | about | null | pt-br | pt-br | null |
| /en-us/ | i18n-index | en-us | index | index | null | en-us | en-us | Default locale should not have prefix |
| /pt-br/ | i18n-index | pt-br | index | index | null | pt-br | pt-br | null |
| /about/ | about | en-us | about | about | null | null | en-us | null |
| /pt-br/about/ | null | pt-br | about | about | null | pt-br | pt-br | null |
| /missing | null | en-us |  | null | null | null | en-us | null |
| /pt-br/missing | null | pt-br |  | null | null | pt-br | pt-br | null |
| /xx/about | null | en-us |  | null | null | null | en-us | null |
| /pt-br/pt-br/about | null | pt-br |  | null | null | pt-br | pt-br | null |

## To en-us

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en-us,pt-br,de |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en-us,pt-br,de |
| /api-docs | /api-docs?q=1#top [api-docs] |  | /api-docs?q=1#top [api-docs] | /api-docs?q=1#top [api-docs] | null | null | null |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en-us?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en-us,pt-br,de |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en-us,pt-br,de |
| /de/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en-us?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | /blog/hello-world | en-us,pt-br,de |
| /de/go | /go?q=1#top [go] |  | /go?q=1#top [go] | /go?q=1#top [go] | null | /go | en-us,pt-br,de |
| /de/sobre | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en-us,pt-br,de |
| /de/ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en-us,pt-br,de |
| /en-us | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en-us,pt-br,de |
| /en-us/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en-us?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en-us,pt-br,de |
| /en-us/go | /go?q=1#top [go] |  | /go?q=1#top [go] | /go?q=1#top [go] | null | null | en-us,pt-br,de |
| /en-us/sobre | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en-us,pt-br,de |
| /en-us/ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en-us,pt-br,de |
| /go | /go?q=1#top [go] |  | /go?q=1#top [go] | /go?q=1#top [go] | null | null | en-us,pt-br,de |
| /pt-br | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en-us,pt-br,de |
| /pt-br/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en-us?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | /blog/hello-world | en-us,pt-br,de |
| /pt-br/go | /go?q=1#top [go] |  | /go?q=1#top [go] | /go?q=1#top [go] | null | /go | en-us,pt-br,de |
| /pt-br/sobre | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en-us,pt-br,de |
| /pt-br/ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en-us,pt-br,de |
| /en-us/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en-us,pt-br,de |
| /pt-br/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en-us,pt-br,de |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en-us,pt-br,de |
| /pt-br/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en-us,pt-br,de |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /pt-br/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | /missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /pt-br/pt-br/about | /pt-br/about?q=1#top [—] |  | /pt-br/about?q=1#top [null] | /pt-br/about?q=1#top [null] | null | /pt-br/about | null |

## To pt-br

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /pt-br?q=1#top [i18n-index] |  | /pt-br?q=1#top [i18n-index] | /pt-br?q=1#top [i18n-index] | /pt-br | /pt-br | en-us,pt-br,de |
| /about | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre | /pt-br/sobre | en-us,pt-br,de |
| /api-docs | /api-docs?q=1#top [api-docs] |  | /api-docs?q=1#top [api-docs] | /api-docs?q=1#top [api-docs] | null | null | null |
| /blog/hello-world | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world-pt-br?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world | /pt-br/blog/hello-world | en-us,pt-br,de |
| /de | /pt-br?q=1#top [i18n-index] |  | /pt-br?q=1#top [i18n-index] | /pt-br?q=1#top [i18n-index] | null | /pt-br | en-us,pt-br,de |
| /de/blog/hello-world | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world-pt-br?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | null | /pt-br/blog/hello-world | en-us,pt-br,de |
| /de/go | /pt-br/go?q=1#top [i18n-go] |  | /pt-br/go?q=1#top [i18n-go] | /pt-br/go?q=1#top [i18n-go] | null | /pt-br/go | en-us,pt-br,de |
| /de/sobre | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | null | /pt-br/sobre | en-us,pt-br,de |
| /de/ueber-uns | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | null | /pt-br/sobre | en-us,pt-br,de |
| /en-us | /pt-br?q=1#top [i18n-index] |  | /pt-br?q=1#top [i18n-index] | /pt-br?q=1#top [i18n-index] | null | /pt-br | en-us,pt-br,de |
| /en-us/blog/hello-world | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world-pt-br?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | null | /pt-br/blog/hello-world | en-us,pt-br,de |
| /en-us/go | /pt-br/go?q=1#top [i18n-go] |  | /pt-br/go?q=1#top [i18n-go] | /pt-br/go?q=1#top [i18n-go] | null | /pt-br/go | en-us,pt-br,de |
| /en-us/sobre | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | null | /pt-br/sobre | en-us,pt-br,de |
| /en-us/ueber-uns | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | null | /pt-br/sobre | en-us,pt-br,de |
| /go | /pt-br/go?q=1#top [i18n-go] |  | /pt-br/go?q=1#top [i18n-go] | /pt-br/go?q=1#top [i18n-go] | /pt-br/go | /pt-br/go | en-us,pt-br,de |
| /pt-br | /pt-br?q=1#top [i18n-index] |  | /pt-br?q=1#top [i18n-index] | /pt-br?q=1#top [i18n-index] | null | null | en-us,pt-br,de |
| /pt-br/blog/hello-world | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world-pt-br?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | /pt-br/blog/hello-world?q=1#top [i18n-blog-slug] | null | null | en-us,pt-br,de |
| /pt-br/go | /pt-br/go?q=1#top [i18n-go] |  | /pt-br/go?q=1#top [i18n-go] | /pt-br/go?q=1#top [i18n-go] | null | null | en-us,pt-br,de |
| /pt-br/sobre | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | null | null | en-us,pt-br,de |
| /pt-br/ueber-uns | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | null | null | en-us,pt-br,de |
| /en-us/ | /pt-br?q=1#top [i18n-index] |  | /pt-br?q=1#top [i18n-index] | /pt-br?q=1#top [i18n-index] | null | /pt-br | en-us,pt-br,de |
| /pt-br/ | /pt-br?q=1#top [i18n-index] |  | /pt-br?q=1#top [i18n-index] | /pt-br?q=1#top [i18n-index] | null | null | en-us,pt-br,de |
| /about/ | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre | /pt-br/sobre | en-us,pt-br,de |
| /pt-br/about/ | /pt-br/sobre?q=1#top [i18n-about-pt-br] |  | /pt-br/sobre?q=1#top [i18n-about-pt-br] | /pt-br/sobre?q=1#top [i18n-about-pt-br] | null | null | en-us,pt-br,de |
| /missing | /pt-br/missing?q=1#top [—] |  | /pt-br/missing?q=1#top [null] | /pt-br/missing?q=1#top [null] | /pt-br/missing | /pt-br/missing | null |
| /pt-br/missing | /pt-br/missing?q=1#top [—] |  | /pt-br/missing?q=1#top [null] | /pt-br/missing?q=1#top [null] | null | null | null |
| /xx/about | /pt-br/xx/about?q=1#top [—] |  | /pt-br/xx/about?q=1#top [null] | /pt-br/xx/about?q=1#top [null] | /pt-br/xx/about | /pt-br/xx/about | null |
| /pt-br/pt-br/about | /pt-br/pt-br/about?q=1#top [—] |  | /pt-br/pt-br/about?q=1#top [null] | /pt-br/pt-br/about?q=1#top [null] | null | null | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /de?q=1#top [i18n-index] |  | /de?q=1#top [i18n-index] | /de?q=1#top [i18n-index] | /de | /de | en-us,pt-br,de |
| /about | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns | /de/ueber-uns | en-us,pt-br,de |
| /api-docs | /api-docs?q=1#top [api-docs] |  | /api-docs?q=1#top [api-docs] | /api-docs?q=1#top [api-docs] | null | null | null |
| /blog/hello-world | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world-de?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world | /de/blog/hello-world | en-us,pt-br,de |
| /de | /de?q=1#top [i18n-index] |  | /de?q=1#top [i18n-index] | /de?q=1#top [i18n-index] | null | null | en-us,pt-br,de |
| /de/blog/hello-world | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world-de?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | null | null | en-us,pt-br,de |
| /de/go | /de/go?q=1#top [i18n-go] |  | /de/go?q=1#top [i18n-go] | /de/go?q=1#top [i18n-go] | null | null | en-us,pt-br,de |
| /de/sobre | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | null | null | en-us,pt-br,de |
| /de/ueber-uns | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | null | null | en-us,pt-br,de |
| /en-us | /de?q=1#top [i18n-index] |  | /de?q=1#top [i18n-index] | /de?q=1#top [i18n-index] | null | /de | en-us,pt-br,de |
| /en-us/blog/hello-world | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world-de?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | null | /de/blog/hello-world | en-us,pt-br,de |
| /en-us/go | /de/go?q=1#top [i18n-go] |  | /de/go?q=1#top [i18n-go] | /de/go?q=1#top [i18n-go] | null | /de/go | en-us,pt-br,de |
| /en-us/sobre | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | null | /de/ueber-uns | en-us,pt-br,de |
| /en-us/ueber-uns | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | null | /de/ueber-uns | en-us,pt-br,de |
| /go | /de/go?q=1#top [i18n-go] |  | /de/go?q=1#top [i18n-go] | /de/go?q=1#top [i18n-go] | /de/go | /de/go | en-us,pt-br,de |
| /pt-br | /de?q=1#top [i18n-index] |  | /de?q=1#top [i18n-index] | /de?q=1#top [i18n-index] | null | /de | en-us,pt-br,de |
| /pt-br/blog/hello-world | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world-de?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | /de/blog/hello-world?q=1#top [i18n-blog-slug] | null | /de/blog/hello-world | en-us,pt-br,de |
| /pt-br/go | /de/go?q=1#top [i18n-go] |  | /de/go?q=1#top [i18n-go] | /de/go?q=1#top [i18n-go] | null | /de/go | en-us,pt-br,de |
| /pt-br/sobre | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | null | /de/ueber-uns | en-us,pt-br,de |
| /pt-br/ueber-uns | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | null | /de/ueber-uns | en-us,pt-br,de |
| /en-us/ | /de?q=1#top [i18n-index] |  | /de?q=1#top [i18n-index] | /de?q=1#top [i18n-index] | null | /de | en-us,pt-br,de |
| /pt-br/ | /de?q=1#top [i18n-index] |  | /de?q=1#top [i18n-index] | /de?q=1#top [i18n-index] | null | /de | en-us,pt-br,de |
| /about/ | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns | /de/ueber-uns | en-us,pt-br,de |
| /pt-br/about/ | /de/ueber-uns?q=1#top [i18n-about-de] |  | /de/ueber-uns?q=1#top [i18n-about-de] | /de/ueber-uns?q=1#top [i18n-about-de] | null | /de/ueber-uns | en-us,pt-br,de |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | /de/missing | null |
| /pt-br/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | /de/missing | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /de/xx/about | /de/xx/about | null |
| /pt-br/pt-br/about | /de/pt-br/about?q=1#top [—] |  | /de/pt-br/about?q=1#top [null] | /de/pt-br/about?q=1#top [null] | null | /de/pt-br/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en-us from / | pt-br from / | de from / | en-us from /pt-br | pt-br from /pt-br | de from /pt-br | en-us from /de | pt-br from /de | de from /de |
|---|---|---|---|---|---|---|---|---|---|
| about | /about [about] | /pt-br/sobre [i18n-about-pt-br] | /de/ueber-uns [i18n-about-de] | /about [about] | /pt-br/sobre [i18n-about-pt-br] | /de/ueber-uns [i18n-about-de] | /about [about] | /pt-br/sobre [i18n-about-pt-br] | /de/ueber-uns [i18n-about-de] |
| api-docs | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] | /api-docs [api-docs] |
| blog-slug | /blog/hello-world [blog-slug] | /pt-br/blog/hello-world [i18n-blog-slug] | /de/blog/hello-world [i18n-blog-slug] | /blog/hello-world [blog-slug] | /pt-br/blog/hello-world [i18n-blog-slug] | /de/blog/hello-world [i18n-blog-slug] | /blog/hello-world [blog-slug] | /pt-br/blog/hello-world [i18n-blog-slug] | /de/blog/hello-world [i18n-blog-slug] |
| go | /go [go] | /pt-br/go [i18n-go] | /de/go [i18n-go] | /go [go] | /pt-br/go [i18n-go] | /de/go [i18n-go] | /go [go] | /pt-br/go [i18n-go] | /de/go [i18n-go] |
| index | / [index] | /pt-br [i18n-index] | /de [i18n-index] | / [index] | /pt-br [i18n-index] | /de [i18n-index] | / [index] | /pt-br [i18n-index] | /de [i18n-index] |

## Invariant breaks (0)

none
