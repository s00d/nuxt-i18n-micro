# plain · prefix_and_default

small site without any custom path

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| about | /about |  |  |
| contact | /contact |  |  |
| blog | /blog |  |  |
| blog-slug | /blog/:slug() |  |  |
| localized-index | /:locale(en\|de\|fr) |  |  |
| localized-about | /:locale(en\|de\|fr)/about |  |  |
| localized-contact | /:locale(en\|de\|fr)/contact |  |  |
| localized-blog | /:locale(en\|de\|fr)/blog |  |  |
| localized-blog-slug | /:locale(en\|de\|fr)/blog/:slug() |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | null | null |
| /about | about | en | about | about | English | null | null | null |
| /blog | blog | en | blog | blog | English | null | null | null |
| /blog/hello-world | blog-slug | en | blog-slug | blog-slug | English | null | null | null |
| /contact | contact | en | contact | contact | English | null | null | null |
| /de | localized-index | de | index | index | Deutsch | de | de | null |
| /de/about | localized-about | de | about | about | Deutsch | de | de | null |
| /de/blog | localized-blog | de | blog | blog | Deutsch | de | de | null |
| /de/blog/hello-world | localized-blog-slug | de | blog-slug | blog-slug | Deutsch | de | de | null |
| /de/contact | localized-contact | de | contact | contact | Deutsch | de | de | null |
| /en | localized-index | en | index | index | English | en | en | null |
| /en/about | localized-about | en | about | about | English | en | en | null |
| /en/blog | localized-blog | en | blog | blog | English | en | en | null |
| /en/blog/hello-world | localized-blog-slug | en | blog-slug | blog-slug | English | en | en | null |
| /en/contact | localized-contact | en | contact | contact | English | en | en | null |
| /fr | localized-index | fr | index | index | Français | fr | fr | null |
| /fr/about | localized-about | fr | about | about | Français | fr | fr | null |
| /fr/blog | localized-blog | fr | blog | blog | Français | fr | fr | null |
| /fr/blog/hello-world | localized-blog-slug | fr | blog-slug | blog-slug | Français | fr | fr | null |
| /fr/contact | localized-contact | fr | contact | contact | Français | fr | fr | null |
| /en/ | localized-index | en | index | index | English | en | en | null |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | about | en | about | about | English | null | null | null |
| /de/about/ | localized-about | de | about | about | Deutsch | de | de | null |
| /missing | null | en |  | null | English | null | null | null |
| /de/missing | null | de |  | null | Deutsch | de | de | null |
| /xx/about | null | en |  | null | English | null | null | null |
| /de/de/about | null | de | about | about | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en | null |
| /about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/about | null |
| /blog | /en/blog?q=1#top [localized-blog] |  | /en/blog?q=1#top [localized-blog] | /en/blog?q=1#top [localized-blog] | /en/blog | null |
| /blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world | null |
| /contact | /en/contact?q=1#top [localized-contact] |  | /en/contact?q=1#top [localized-contact] | /en/contact?q=1#top [localized-contact] | /en/contact | null |
| /de | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /de | null |
| /de/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /de/about | null |
| /de/blog | /en/blog?q=1#top [localized-blog] |  | /en/blog?q=1#top [localized-blog] | /en/blog?q=1#top [localized-blog] | /de/blog | null |
| /de/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world | null |
| /de/contact | /en/contact?q=1#top [localized-contact] |  | /en/contact?q=1#top [localized-contact] | /en/contact?q=1#top [localized-contact] | /de/contact | null |
| /en | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en | null |
| /en/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/about | null |
| /en/blog | /en/blog?q=1#top [localized-blog] |  | /en/blog?q=1#top [localized-blog] | /en/blog?q=1#top [localized-blog] | /en/blog | null |
| /en/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world | null |
| /en/contact | /en/contact?q=1#top [localized-contact] |  | /en/contact?q=1#top [localized-contact] | /en/contact?q=1#top [localized-contact] | /en/contact | null |
| /fr | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /fr | null |
| /fr/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /fr/about | null |
| /fr/blog | /en/blog?q=1#top [localized-blog] |  | /en/blog?q=1#top [localized-blog] | /en/blog?q=1#top [localized-blog] | /fr/blog | null |
| /fr/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world | null |
| /fr/contact | /en/contact?q=1#top [localized-contact] |  | /en/contact?q=1#top [localized-contact] | /en/contact?q=1#top [localized-contact] | /fr/contact | null |
| /en/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en/ | null |
| /de/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /de/ | null |
| /about/ | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/about/ | null |
| /de/about/ | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /de/about/ | null |
| /missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | /en/missing | null |
| /de/missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /en/xx/about?q=1#top [—] |  | /en/xx/about?q=1#top [null] | /en/xx/about?q=1#top [null] | /en/xx/about | null |
| /de/de/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en | null |
| /about | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | /en/about | null |
| /blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /en/blog | null |
| /blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world | null |
| /contact | /de/contact?q=1#top [localized-contact] |  | /de/contact?q=1#top [localized-contact] | /de/contact?q=1#top [localized-contact] | /en/contact | null |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | null |
| /de/about | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | /de/about | null |
| /de/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /de/blog | null |
| /de/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world | null |
| /de/contact | /de/contact?q=1#top [localized-contact] |  | /de/contact?q=1#top [localized-contact] | /de/contact?q=1#top [localized-contact] | /de/contact | null |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en | null |
| /en/about | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | /en/about | null |
| /en/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /en/blog | null |
| /en/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world | null |
| /en/contact | /de/contact?q=1#top [localized-contact] |  | /de/contact?q=1#top [localized-contact] | /de/contact?q=1#top [localized-contact] | /en/contact | null |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /fr | null |
| /fr/about | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | /fr/about | null |
| /fr/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /fr/blog | null |
| /fr/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world | null |
| /fr/contact | /de/contact?q=1#top [localized-contact] |  | /de/contact?q=1#top [localized-contact] | /de/contact?q=1#top [localized-contact] | /fr/contact | null |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en/ | null |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de/ | null |
| /about/ | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | /en/about/ | null |
| /de/about/ | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | /de/about/ | null |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /en/missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /en/xx/about | null |
| /de/de/about | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en | null |
| /about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /en/about | null |
| /blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /en/blog | null |
| /blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world | null |
| /contact | /fr/contact?q=1#top [localized-contact] |  | /fr/contact?q=1#top [localized-contact] | /fr/contact?q=1#top [localized-contact] | /en/contact | null |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de | null |
| /de/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /de/about | null |
| /de/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /de/blog | null |
| /de/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world | null |
| /de/contact | /fr/contact?q=1#top [localized-contact] |  | /fr/contact?q=1#top [localized-contact] | /fr/contact?q=1#top [localized-contact] | /de/contact | null |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en | null |
| /en/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /en/about | null |
| /en/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /en/blog | null |
| /en/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world | null |
| /en/contact | /fr/contact?q=1#top [localized-contact] |  | /fr/contact?q=1#top [localized-contact] | /fr/contact?q=1#top [localized-contact] | /en/contact | null |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | null |
| /fr/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/about | null |
| /fr/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /fr/blog | null |
| /fr/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world | null |
| /fr/contact | /fr/contact?q=1#top [localized-contact] |  | /fr/contact?q=1#top [localized-contact] | /fr/contact?q=1#top [localized-contact] | /fr/contact | null |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en/ | null |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de/ | null |
| /about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /en/about/ | null |
| /de/about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /de/about/ | null |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /en/missing | null |
| /de/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | /en/xx/about | null |
| /de/de/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /en/about [localized-about] | /de/about [localized-about] | /fr/about [localized-about] | /en/about [localized-about] | /de/about [localized-about] | /fr/about [localized-about] | /en/about [localized-about] | /de/about [localized-about] | /fr/about [localized-about] |
| blog | /en/blog [localized-blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] | /en/blog [localized-blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] | /en/blog [localized-blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] |
| blog-slug | /en/blog/hello-world [localized-blog-slug] | /de/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] | /en/blog/hello-world [localized-blog-slug] | /de/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] | /en/blog/hello-world [localized-blog-slug] | /de/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] |
| contact | /en/contact [localized-contact] | /de/contact [localized-contact] | /fr/contact [localized-contact] | /en/contact [localized-contact] | /de/contact [localized-contact] | /fr/contact [localized-contact] | /en/contact [localized-contact] | /de/contact [localized-contact] | /fr/contact [localized-contact] |
| index | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] |

## Invariant breaks (0)

none
