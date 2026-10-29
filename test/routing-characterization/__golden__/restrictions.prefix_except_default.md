# restrictions · prefix_except_default

routeLocales and $defineI18nRoute locales, unlocalized pages and routesLocaleLinks

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| about | /about |  |  |
| blog | /blog |  |  |
| blog-slug | /blog/:slug() |  |  |
| admin | /admin |  |  |
| · admin-users | users |  |  |
| landing | /landing |  |  |
| localized-index | /:locale(de\|fr) |  |  |
| localized-about | /:locale(fr)/about |  |  |
| localized-de-only | /:locale(de)/de-only |  |  |
| localized-blog | /:locale(de\|fr)/blog |  |  |
| localized-blog-slug | /:locale(de\|fr)/blog/:slug() |  |  |
| localized-landing-de | /:locale(de)/start |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | en | null |
| /about | about | en | about | about | English | null | en | null |
| /admin | admin | en | admin | admin | English | null | en | null |
| /admin/users | admin-users | en | admin-users | admin-users | English | null | en | null |
| /blog | blog | en | blog | blog | English | null | en | null |
| /blog/hello-world | blog-slug | en | blog-slug | blog-slug | English | null | en | null |
| /de | localized-index | de | index | index | Deutsch | de | de | null |
| /de/blog | localized-blog | de | blog | blog | Deutsch | de | de | null |
| /de/blog/hello-world | localized-blog-slug | de | blog-slug | blog-slug | Deutsch | de | de | null |
| /de/de-only | localized-de-only | de | de-only | de-only | Deutsch | de | de | null |
| /de/start | localized-landing-de | de | landing | landing | Deutsch | de | de | null |
| /fr | localized-index | fr | index | index | Français | fr | fr | null |
| /fr/about | localized-about | fr | about | about | Français | fr | fr | null |
| /fr/blog | localized-blog | fr | blog | blog | Français | fr | fr | null |
| /fr/blog/hello-world | localized-blog-slug | fr | blog-slug | blog-slug | Français | fr | fr | null |
| /landing | landing | en | landing | landing | English | null | en | null |
| /en | null | en |  | null | English | en | en | Default locale should not have prefix |
| /en/ | null | en |  | null | English | en | en | Default locale should not have prefix |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | about | en | about | about | English | null | en | null |
| /de/about/ | null | de |  | null | Deutsch | de | de | Locale not allowed for this route |
| /missing | null | en |  | null | English | null | en | null |
| /de/missing | null | de |  | null | Deutsch | de | de | null |
| /xx/about | null | en |  | null | English | null | en | null |
| /de/de/about | null | de |  | null | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | null |
| /admin | /admin?q=1#top [admin] |  | /admin?q=1#top [admin] | /admin?q=1#top [admin] | /admin | null |
| /admin/users | /admin/users?q=1#top [admin-users] |  | /admin/users?q=1#top [admin-users] | /admin/users?q=1#top [admin-users] | /admin/users | null |
| /blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | /blog | null |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world | null |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | /de/blog | null |
| /de/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /de/blog/hello-world | null |
| /de/de-only | /de/de-only?q=1#top [localized-de-only] |  | /de/de-only?q=1#top [localized-de-only] | /de/de-only?q=1#top [localized-de-only] | /de/de-only | null |
| /de/start | /landing?q=1#top [landing] |  | /landing?q=1#top [landing] | /landing?q=1#top [landing] | /de/start | null |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /fr | null |
| /fr/about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /fr/about | null |
| /fr/blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | /fr/blog | null |
| /fr/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /fr/blog/hello-world | null |
| /landing | /landing?q=1#top [landing] |  | /landing?q=1#top [landing] | /landing?q=1#top [landing] | /landing | null |
| /en | /en?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /en/?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /about/?q=1#top [about] | /about/?q=1#top [about] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | / | /de |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | null |
| /admin | /admin?q=1#top [admin] |  | /admin?q=1#top [admin] | /admin?q=1#top [admin] | /admin | null |
| /admin/users | /admin/users?q=1#top [admin-users] |  | /admin/users?q=1#top [admin-users] | /admin/users?q=1#top [admin-users] | /admin/users | null |
| /blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /blog | /de/blog |
| /blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /blog/hello-world | /de/blog/hello-world |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | null |
| /de/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /de/blog | null |
| /de/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world | null |
| /de/de-only | /de/de-only?q=1#top [localized-de-only] |  | /de/de-only?q=1#top [localized-de-only] | /de/de-only?q=1#top [localized-de-only] | /de/de-only | null |
| /de/start | /de/start?q=1#top [localized-landing-de] |  | /de/start?q=1#top [localized-landing-de] | /de/start?q=1#top [localized-landing-de] | /de/start | null |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /fr | null |
| /fr/about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /fr/about | null |
| /fr/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /fr/blog | null |
| /fr/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world | null |
| /landing | /de/start?q=1#top [localized-landing-de] |  | /de/start?q=1#top [localized-landing-de] | /de/start?q=1#top [localized-landing-de] | /landing | /de/start |
| /en | /en?q=1#top [—] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en | null |
| /en/ | /en/?q=1#top [—] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en/ | null |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de/ | null |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /de/about/?q=1#top [null] | /de/about/?q=1#top [null] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /missing | /de/missing |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /xx/about | /de/xx/about |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | / | /fr |
| /about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /about | /fr/about |
| /admin | /admin?q=1#top [admin] |  | /admin?q=1#top [admin] | /admin?q=1#top [admin] | /admin | null |
| /admin/users | /admin/users?q=1#top [admin-users] |  | /admin/users?q=1#top [admin-users] | /admin/users?q=1#top [admin-users] | /admin/users | null |
| /blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /blog | /fr/blog |
| /blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /blog/hello-world | /fr/blog/hello-world |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de | null |
| /de/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /de/blog | null |
| /de/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world | null |
| /de/de-only | /de/de-only?q=1#top [localized-de-only] |  | /de/de-only?q=1#top [localized-de-only] | /de/de-only?q=1#top [localized-de-only] | /de/de-only | null |
| /de/start | /landing?q=1#top [landing] |  | /landing?q=1#top [landing] | /landing?q=1#top [landing] | /de/start | null |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | null |
| /fr/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/about | null |
| /fr/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /fr/blog | null |
| /fr/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world | null |
| /landing | /landing?q=1#top [landing] |  | /landing?q=1#top [landing] | /landing?q=1#top [landing] | /landing | null |
| /en | /en?q=1#top [—] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en | null |
| /en/ | /en/?q=1#top [—] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en/ | null |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de/ | null |
| /about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /about/ | /fr/about |
| /de/about/ | /de/about/?q=1#top [—] |  | /fr/about/?q=1#top [localized-about] | /fr/about/?q=1#top [localized-about] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /missing | /fr/missing |
| /de/missing | /de/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | /xx/about | /fr/xx/about |
| /de/de/about | /de/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /about [about] | /about [about] | /fr/about [localized-about] | /about [about] | /about [about] | /fr/about [localized-about] | /about [about] | /about [about] | /fr/about [localized-about] |
| admin | /admin [admin] | /admin [admin] | /admin [admin] | /admin [admin] | /admin [admin] | /admin [admin] | /admin [admin] | /admin [admin] | /admin [admin] |
| admin-users | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] |
| blog | /blog [blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] | /blog [blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] | /blog [blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] |
| blog-slug | /blog/hello-world [blog-slug] | /de/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] | /blog/hello-world [blog-slug] | /de/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] | /blog/hello-world [blog-slug] | /de/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] |
| de-only | /de/de-only [localized-de-only] | /de/de-only [localized-de-only] | /de/de-only [localized-de-only] | /de/de-only [localized-de-only] | /de/de-only [localized-de-only] | /de/de-only [localized-de-only] | /de/de-only [localized-de-only] | /de/de-only [localized-de-only] | /de/de-only [localized-de-only] |
| index | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] |
| landing | /landing [landing] | /de/start [localized-landing-de] | /landing [landing] | /landing [landing] | /de/start [localized-landing-de] | /landing [landing] | /landing [landing] | /de/start [localized-landing-de] | /landing [landing] |

## Invariant breaks (0)

none
