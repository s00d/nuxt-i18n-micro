# restrictions · prefix_and_default

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
| localized-index | /:locale(en\|de\|fr) |  |  |
| localized-about | /:locale(en\|fr)/about |  |  |
| localized-de-only | /:locale(de)/de-only |  |  |
| localized-blog | /:locale(en\|de\|fr)/blog |  |  |
| localized-blog-slug | /:locale(en\|de\|fr)/blog/:slug() |  |  |
| localized-landing | /:locale(en)/landing |  |  |
| localized-landing-de | /:locale(de)/start |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | null | null |
| /about | about | en | about | about | English | null | null | null |
| /admin | admin | en | admin | admin | English | null | null | null |
| /admin/users | admin-users | en | admin-users | admin-users | English | null | null | null |
| /blog | blog | en | blog | blog | English | null | null | null |
| /blog/hello-world | blog-slug | en | blog-slug | blog-slug | English | null | null | null |
| /de | localized-index | de | index | index | Deutsch | de | de | null |
| /de/blog | localized-blog | de | blog | blog | Deutsch | de | de | null |
| /de/blog/hello-world | localized-blog-slug | de | blog-slug | blog-slug | Deutsch | de | de | null |
| /de/de-only | localized-de-only | de | de-only | de-only | Deutsch | de | de | null |
| /de/start | localized-landing-de | de | landing | landing | Deutsch | de | de | null |
| /en | localized-index | en | index | index | English | en | en | null |
| /en/about | localized-about | en | about | about | English | en | en | null |
| /en/blog | localized-blog | en | blog | blog | English | en | en | null |
| /en/blog/hello-world | localized-blog-slug | en | blog-slug | blog-slug | English | en | en | null |
| /en/landing | localized-landing | en | landing | landing | English | en | en | null |
| /fr | localized-index | fr | index | index | Français | fr | fr | null |
| /fr/about | localized-about | fr | about | about | Français | fr | fr | null |
| /fr/blog | localized-blog | fr | blog | blog | Français | fr | fr | null |
| /fr/blog/hello-world | localized-blog-slug | fr | blog-slug | blog-slug | Français | fr | fr | null |
| /landing | landing | en | landing | landing | English | null | null | null |
| /en/ | localized-index | en | index | index | English | en | en | null |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | about | en | about | about | English | null | null | null |
| /de/about/ | null | de |  | null | Deutsch | de | de | Locale not allowed for this route |
| /missing | null | en |  | null | English | null | null | null |
| /de/missing | null | de |  | null | Deutsch | de | de | null |
| /xx/about | null | en |  | null | English | null | null | null |
| /de/de/about | null | de |  | null | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en | null |
| /about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/about | null |
| /admin | /admin?q=1#top [admin] |  | /admin?q=1#top [admin] | /admin?q=1#top [admin] | /en/admin | null |
| /admin/users | /admin/users?q=1#top [admin-users] |  | /admin/users?q=1#top [admin-users] | /admin/users?q=1#top [admin-users] | /en/admin/users | null |
| /blog | /en/blog?q=1#top [localized-blog] |  | /en/blog?q=1#top [localized-blog] | /en/blog?q=1#top [localized-blog] | /en/blog | null |
| /blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world | null |
| /de | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /de | null |
| /de/blog | /en/blog?q=1#top [localized-blog] |  | /en/blog?q=1#top [localized-blog] | /en/blog?q=1#top [localized-blog] | /de/blog | null |
| /de/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world | null |
| /de/de-only | /de/de-only?q=1#top [localized-de-only] |  | /de/de-only?q=1#top [localized-de-only] | /de/de-only?q=1#top [localized-de-only] | /de/de-only | null |
| /de/start | /en/landing?q=1#top [localized-landing] |  | /en/landing?q=1#top [localized-landing] | /en/landing?q=1#top [localized-landing] | /de/start | null |
| /en | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en | null |
| /en/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/about | null |
| /en/blog | /en/blog?q=1#top [localized-blog] |  | /en/blog?q=1#top [localized-blog] | /en/blog?q=1#top [localized-blog] | /en/blog | null |
| /en/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world | null |
| /en/landing | /en/landing?q=1#top [localized-landing] |  | /en/landing?q=1#top [localized-landing] | /en/landing?q=1#top [localized-landing] | /en/landing | null |
| /fr | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /fr | null |
| /fr/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /fr/about | null |
| /fr/blog | /en/blog?q=1#top [localized-blog] |  | /en/blog?q=1#top [localized-blog] | /en/blog?q=1#top [localized-blog] | /fr/blog | null |
| /fr/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world | null |
| /landing | /en/landing?q=1#top [localized-landing] |  | /en/landing?q=1#top [localized-landing] | /en/landing?q=1#top [localized-landing] | /en/landing | null |
| /en/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en/ | null |
| /de/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /de/ | null |
| /about/ | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /en/about/?q=1#top [localized-about] | /en/about/?q=1#top [localized-about] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | /en/missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /en/xx/about?q=1#top [null] | /en/xx/about?q=1#top [null] | /en/xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /en/de/about?q=1#top [null] | /en/de/about?q=1#top [null] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en | null |
| /about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/about | null |
| /admin | /admin?q=1#top [admin] |  | /admin?q=1#top [admin] | /admin?q=1#top [admin] | /en/admin | null |
| /admin/users | /admin/users?q=1#top [admin-users] |  | /admin/users?q=1#top [admin-users] | /admin/users?q=1#top [admin-users] | /en/admin/users | null |
| /blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /en/blog | null |
| /blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world | null |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | null |
| /de/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /de/blog | null |
| /de/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world | null |
| /de/de-only | /de/de-only?q=1#top [localized-de-only] |  | /de/de-only?q=1#top [localized-de-only] | /de/de-only?q=1#top [localized-de-only] | /de/de-only | null |
| /de/start | /de/start?q=1#top [localized-landing-de] |  | /de/start?q=1#top [localized-landing-de] | /de/start?q=1#top [localized-landing-de] | /de/start | null |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en | null |
| /en/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/about | null |
| /en/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /en/blog | null |
| /en/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world | null |
| /en/landing | /de/start?q=1#top [localized-landing-de] |  | /de/start?q=1#top [localized-landing-de] | /de/start?q=1#top [localized-landing-de] | /en/landing | null |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /fr | null |
| /fr/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /fr/about | null |
| /fr/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /fr/blog | null |
| /fr/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world | null |
| /landing | /de/start?q=1#top [localized-landing-de] |  | /de/start?q=1#top [localized-landing-de] | /de/start?q=1#top [localized-landing-de] | /en/landing | null |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en/ | null |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de/ | null |
| /about/ | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /de/about/?q=1#top [null] | /de/about/?q=1#top [null] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /en/missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /en/xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en | null |
| /about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /en/about | null |
| /admin | /admin?q=1#top [admin] |  | /admin?q=1#top [admin] | /admin?q=1#top [admin] | /en/admin | null |
| /admin/users | /admin/users?q=1#top [admin-users] |  | /admin/users?q=1#top [admin-users] | /admin/users?q=1#top [admin-users] | /en/admin/users | null |
| /blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /en/blog | null |
| /blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world | null |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de | null |
| /de/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /de/blog | null |
| /de/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world | null |
| /de/de-only | /de/de-only?q=1#top [localized-de-only] |  | /de/de-only?q=1#top [localized-de-only] | /de/de-only?q=1#top [localized-de-only] | /de/de-only | null |
| /de/start | /en/landing?q=1#top [localized-landing] |  | /en/landing?q=1#top [localized-landing] | /en/landing?q=1#top [localized-landing] | /de/start | null |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en | null |
| /en/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /en/about | null |
| /en/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /en/blog | null |
| /en/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world | null |
| /en/landing | /en/landing?q=1#top [localized-landing] |  | /en/landing?q=1#top [localized-landing] | /en/landing?q=1#top [localized-landing] | /en/landing | null |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | null |
| /fr/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/about | null |
| /fr/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /fr/blog | null |
| /fr/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world | null |
| /landing | /en/landing?q=1#top [localized-landing] |  | /en/landing?q=1#top [localized-landing] | /en/landing?q=1#top [localized-landing] | /en/landing | null |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en/ | null |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de/ | null |
| /about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /en/about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /fr/about/?q=1#top [localized-about] | /fr/about/?q=1#top [localized-about] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /en/missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | /en/xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /en/about [localized-about] | /en/about [localized-about] | /fr/about [localized-about] | /en/about [localized-about] | /en/about [localized-about] | /fr/about [localized-about] | /en/about [localized-about] | /en/about [localized-about] | /fr/about [localized-about] |
| admin | /admin [admin] | /admin [admin] | /admin [admin] | /admin [admin] | /admin [admin] | /admin [admin] | /admin [admin] | /admin [admin] | /admin [admin] |
| admin-users | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] |
| blog | /en/blog [localized-blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] | /en/blog [localized-blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] | /en/blog [localized-blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] |
| blog-slug | /en/blog/hello-world [localized-blog-slug] | /de/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] | /en/blog/hello-world [localized-blog-slug] | /de/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] | /en/blog/hello-world [localized-blog-slug] | /de/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] |
| de-only | /de/de-only [localized-de-only] | /de/de-only [localized-de-only] | /de/de-only [localized-de-only] | /de/de-only [localized-de-only] | /de/de-only [localized-de-only] | /de/de-only [localized-de-only] | /de/de-only [localized-de-only] | /de/de-only [localized-de-only] | /de/de-only [localized-de-only] |
| index | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] |
| landing | /en/landing [localized-landing] | /de/start [localized-landing-de] | /en/landing [localized-landing] | /en/landing [localized-landing] | /de/start [localized-landing-de] | /en/landing [localized-landing] | /en/landing [localized-landing] | /de/start [localized-landing-de] | /en/landing [localized-landing] |

## Invariant breaks (0)

none
