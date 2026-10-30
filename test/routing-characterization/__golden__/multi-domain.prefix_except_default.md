# multi-domain · prefix_except_default

locales on their own domains (baseUrl, baseDefault)

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect | meta.i18n |
|---|---|---|---|---|
| index | / |  |  | index: en |
| about | /about |  |  | about: en |
| blog-slug | /blog/:slug() |  |  | blog-slug: en |
| localized-index | /:locale(de\|fr) |  |  | index: de, fr |
| localized-about-de | /:locale(de)/ueber-uns |  |  | about: de |
| localized-about-fr | /:locale(fr)/a-propos |  |  | about: fr |
| localized-blog-slug | /:locale(de\|fr)/blog/:slug() |  |  | blog-slug: de, fr |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | null | null | en | null |
| /about | about | en | about | about | null | null | en | null |
| /blog/hello-world | blog-slug | en | blog-slug | blog-slug | null | null | en | null |
| /de | localized-index | de | index | index | null | de | de | null |
| /de/blog/hello-world | localized-blog-slug | de | blog-slug | blog-slug | null | de | de | null |
| /de/ueber-uns | localized-about-de | de | about | about | null | de | de | null |
| /fr | localized-index | fr | index | index | null | fr | fr | null |
| /fr/a-propos | localized-about-fr | fr | about | about | null | fr | fr | null |
| /fr/blog/hello-world | localized-blog-slug | fr | blog-slug | blog-slug | null | fr | fr | null |
| /en | null | en | index | index | null | en | en | Default locale should not have prefix |
| /en/ | null | en | index | index | null | en | en | Default locale should not have prefix |
| /de/ | localized-index | de | index | index | null | de | de | null |
| /about/ | about | en | about | about | null | null | en | null |
| /de/about/ | null | de | about | about | null | de | de | null |
| /missing | null | en |  | null | null | null | en | null |
| /de/missing | null | de |  | null | null | de | de | null |
| /xx/about | null | en |  | null | null | null | en | null |
| /de/de/about | null | de |  | null | null | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de,fr |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /de/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | /blog/hello-world | en,de,fr |
| /de/ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,de,fr |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /fr/a-propos | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,de,fr |
| /fr/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | /blog/hello-world | en,de,fr |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de,fr |
| /de/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,de,fr |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | /missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | /de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | /de | /de | en,de,fr |
| /about | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | /de/ueber-uns | /de/ueber-uns | en,de,fr |
| /blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | /de/blog/hello-world | /de/blog/hello-world | en,de,fr |
| /de | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,fr |
| /de/blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | null | null | en,de,fr |
| /de/ueber-uns | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,de,fr |
| /fr | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | /de | en,de,fr |
| /fr/a-propos | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | /de/ueber-uns | en,de,fr |
| /fr/blog/hello-world | external https://example.de/blog/hello-world?q=1#top | external https://example.de/blog/hello-world-de?q=1#top | https://example.de/blog/hello-world?q=1#top [—] | https://example.de/blog/hello-world?q=1#top [—] | null | /de/blog/hello-world | en,de,fr |
| /en | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | /de | en,de,fr |
| /en/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | /de | en,de,fr |
| /de/ | external https://example.de/?q=1#top |  | https://example.de/?q=1#top [—] | https://example.de/?q=1#top [—] | null | null | en,de,fr |
| /about/ | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | /de/ueber-uns | /de/ueber-uns | en,de,fr |
| /de/about/ | external https://example.de/ueber-uns?q=1#top |  | https://example.de/ueber-uns?q=1#top [—] | https://example.de/ueber-uns?q=1#top [—] | null | null | en,de,fr |
| /missing | external https://example.de/missing?q=1#top |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | /de/missing | /de/missing | null |
| /de/missing | external https://example.de/missing?q=1#top |  | https://example.de/missing?q=1#top [—] | https://example.de/missing?q=1#top [—] | null | null | null |
| /xx/about | external https://example.de/xx/about?q=1#top |  | https://example.de/xx/about?q=1#top [—] | https://example.de/xx/about?q=1#top [—] | /de/xx/about | /de/xx/about | null |
| /de/de/about | external https://example.de/de/about?q=1#top |  | https://example.de/de/about?q=1#top [—] | https://example.de/de/about?q=1#top [—] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | /fr | /fr | en,de,fr |
| /about | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | /fr/a-propos | /fr/a-propos | en,de,fr |
| /blog/hello-world | external https://example.fr/fr/blog/hello-world?q=1#top | external https://example.fr/fr/blog/hello-world-fr?q=1#top | https://example.fr/fr/blog/hello-world?q=1#top [—] | https://example.fr/fr/blog/hello-world?q=1#top [—] | /fr/blog/hello-world | /fr/blog/hello-world | en,de,fr |
| /de | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | null | /fr | en,de,fr |
| /de/blog/hello-world | external https://example.fr/fr/blog/hello-world?q=1#top | external https://example.fr/fr/blog/hello-world-fr?q=1#top | https://example.fr/fr/blog/hello-world?q=1#top [—] | https://example.fr/fr/blog/hello-world?q=1#top [—] | null | /fr/blog/hello-world | en,de,fr |
| /de/ueber-uns | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | null | /fr/a-propos | en,de,fr |
| /fr | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | null | null | en,de,fr |
| /fr/a-propos | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | null | null | en,de,fr |
| /fr/blog/hello-world | external https://example.fr/fr/blog/hello-world?q=1#top | external https://example.fr/fr/blog/hello-world-fr?q=1#top | https://example.fr/fr/blog/hello-world?q=1#top [—] | https://example.fr/fr/blog/hello-world?q=1#top [—] | null | null | en,de,fr |
| /en | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | null | /fr | en,de,fr |
| /en/ | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | null | /fr | en,de,fr |
| /de/ | external https://example.fr/fr?q=1#top |  | https://example.fr/fr?q=1#top [—] | https://example.fr/fr?q=1#top [—] | null | /fr | en,de,fr |
| /about/ | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | /fr/a-propos | /fr/a-propos | en,de,fr |
| /de/about/ | external https://example.fr/fr/a-propos?q=1#top |  | https://example.fr/fr/a-propos?q=1#top [—] | https://example.fr/fr/a-propos?q=1#top [—] | null | /fr/a-propos | en,de,fr |
| /missing | external https://example.fr/fr/missing?q=1#top |  | https://example.fr/fr/missing?q=1#top [—] | https://example.fr/fr/missing?q=1#top [—] | /fr/missing | /fr/missing | null |
| /de/missing | external https://example.fr/fr/missing?q=1#top |  | https://example.fr/fr/missing?q=1#top [—] | https://example.fr/fr/missing?q=1#top [—] | null | /fr/missing | null |
| /xx/about | external https://example.fr/fr/xx/about?q=1#top |  | https://example.fr/fr/xx/about?q=1#top [—] | https://example.fr/fr/xx/about?q=1#top [—] | /fr/xx/about | /fr/xx/about | null |
| /de/de/about | external https://example.fr/fr/de/about?q=1#top |  | https://example.fr/fr/de/about?q=1#top [—] | https://example.fr/fr/de/about?q=1#top [—] | null | /fr/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /about [about] | https://example.de/ueber-uns [—] | https://example.fr/fr/a-propos [—] | /about [about] | https://example.de/ueber-uns [—] | https://example.fr/fr/a-propos [—] | /about [about] | https://example.de/ueber-uns [—] | https://example.fr/fr/a-propos [—] |
| blog-slug | /blog/hello-world [blog-slug] | https://example.de/blog/hello-world [—] | https://example.fr/fr/blog/hello-world [—] | /blog/hello-world [blog-slug] | https://example.de/blog/hello-world [—] | https://example.fr/fr/blog/hello-world [—] | /blog/hello-world [blog-slug] | https://example.de/blog/hello-world [—] | https://example.fr/fr/blog/hello-world [—] |
| index | / [index] | https://example.de/ [—] | https://example.fr/fr [—] | / [index] | https://example.de/ [—] | https://example.fr/fr [—] | / [index] | https://example.de/ [—] | https://example.fr/fr [—] |

## Invariant breaks (0)

none
