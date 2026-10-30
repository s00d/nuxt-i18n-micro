# restrictions · prefix_except_default

routeLocales and $defineI18nRoute locales, unlocalized pages and routesLocaleLinks

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect | meta.i18n |
|---|---|---|---|---|
| index | / |  |  | index: en |
| about | /about |  |  | about: en |
| blog | /blog |  |  | blog: en |
| blog-slug | /blog/:slug() |  |  | blog-slug: en |
| admin | /admin |  |  |  |
| · admin-users | users |  |  |  |
| landing | /landing |  |  | landing: en |
| localized-index | /:locale(de\|fr) |  |  | index: de, fr |
| localized-about | /:locale(fr)/about |  |  | about: fr |
| localized-de-only | /:locale(de)/de-only |  |  | de-only: de |
| localized-blog | /:locale(de\|fr)/blog |  |  | blog: de, fr |
| localized-blog-slug | /:locale(de\|fr)/blog/:slug() |  |  | blog-slug: de, fr |
| localized-landing-de | /:locale(de)/start |  |  | landing: de |

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
| /en | null | en | index | index | English | en | en | Default locale should not have prefix |
| /en/ | null | en | index | index | English | en | en | Default locale should not have prefix |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | about | en | about | about | English | null | en | null |
| /de/about/ | null | de | about | about | Deutsch | de | de | Locale not allowed for this route |
| /missing | null | en |  | null | English | null | en | null |
| /de/missing | null | de |  | null | Deutsch | de | de | null |
| /xx/about | null | en |  | null | English | null | en | null |
| /de/de/about | null | de |  | null | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,fr |
| /admin | /admin?q=1#top [admin] |  | /admin?q=1#top [admin] | /admin?q=1#top [admin] | null | null | null |
| /admin/users | /admin/users?q=1#top [admin-users] |  | /admin/users?q=1#top [admin-users] | /admin/users?q=1#top [admin-users] | null | null | null |
| /blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | null | null | en,de,fr |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /de/blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | null | /blog | en,de,fr |
| /de/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | /blog/hello-world | en,de,fr |
| /de/de-only | / [index] |  | / [index] | / [index] | null | null | de |
| /de/start | /landing?q=1#top [landing] |  | /landing?q=1#top [landing] | /landing?q=1#top [landing] | null | /landing | en,de |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /fr/about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,fr |
| /fr/blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | null | /blog | en,de,fr |
| /fr/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | /blog/hello-world | en,de,fr |
| /landing | /landing?q=1#top [landing] |  | /landing?q=1#top [landing] | /landing?q=1#top [landing] | null | null | en,de |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,fr |
| /de/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,fr |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | /missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | /de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | /de | en,de,fr |
| /about | /de [localized-index] |  | /de [localized-index] | /de [localized-index] | null | null | en,fr |
| /admin | /admin?q=1#top [admin] |  | /admin?q=1#top [admin] | /admin?q=1#top [admin] | null | null | null |
| /admin/users | /admin/users?q=1#top [admin-users] |  | /admin/users?q=1#top [admin-users] | /admin/users?q=1#top [admin-users] | null | null | null |
| /blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /de/blog | /de/blog | en,de,fr |
| /blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world | /de/blog/hello-world | en,de,fr |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /de/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | null | null | en,de,fr |
| /de/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,fr |
| /de/de-only | /de/de-only?q=1#top [localized-de-only] |  | /de/de-only?q=1#top [localized-de-only] | /de/de-only?q=1#top [localized-de-only] | null | null | de |
| /de/start | /de/start?q=1#top [localized-landing-de] |  | /de/start?q=1#top [localized-landing-de] | /de/start?q=1#top [localized-landing-de] | null | null | en,de |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /fr/about | /de [localized-index] |  | /de [localized-index] | /de [localized-index] | null | null | en,fr |
| /fr/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | null | /de/blog | en,de,fr |
| /fr/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | null | /de/blog/hello-world | en,de,fr |
| /landing | /de/start?q=1#top [localized-landing-de] |  | /de/start?q=1#top [localized-landing-de] | /de/start?q=1#top [localized-landing-de] | /de/start | /de/start | en,de |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /about/ | /de [localized-index] |  | /de [localized-index] | /de [localized-index] | null | null | en,fr |
| /de/about/ | /de [localized-index] |  | /de [localized-index] | /de [localized-index] | null | null | en,fr |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | /de/missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | null | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /de/xx/about | /de/xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | /fr | en,de,fr |
| /about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/about | /fr/about | en,fr |
| /admin | /admin?q=1#top [admin] |  | /admin?q=1#top [admin] | /admin?q=1#top [admin] | null | null | null |
| /admin/users | /admin/users?q=1#top [admin-users] |  | /admin/users?q=1#top [admin-users] | /admin/users?q=1#top [admin-users] | null | null | null |
| /blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /fr/blog | /fr/blog | en,de,fr |
| /blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world | /fr/blog/hello-world | en,de,fr |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | null | /fr/blog | en,de,fr |
| /de/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | /fr/blog/hello-world | en,de,fr |
| /de/de-only | /fr [localized-index] |  | /fr [localized-index] | /fr [localized-index] | null | null | de |
| /de/start | /fr [localized-index] |  | /fr [localized-index] | /fr [localized-index] | null | null | en,de |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,fr |
| /fr/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | null | en,fr |
| /fr/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | null | null | en,de,fr |
| /fr/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,fr |
| /landing | /fr [localized-index] |  | /fr [localized-index] | /fr [localized-index] | null | null | en,de |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/about | /fr/about | en,fr |
| /de/about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,fr |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /fr/missing | /fr/missing | null |
| /de/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | /fr/missing | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | /fr/xx/about | /fr/xx/about | null |
| /de/de/about | /fr/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | null | /fr/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /about [about] | /de [localized-index] | /fr/about [localized-about] | /about [about] | /de [localized-index] | /fr/about [localized-about] | /about [about] | /de [localized-index] | /fr/about [localized-about] |
| admin | /admin [admin] | /admin [admin] | /admin [admin] | /admin [admin] | /admin [admin] | /admin [admin] | /admin [admin] | /admin [admin] | /admin [admin] |
| admin-users | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] |
| blog | /blog [blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] | /blog [blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] | /blog [blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] |
| blog-slug | /blog/hello-world [blog-slug] | /de/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] | /blog/hello-world [blog-slug] | /de/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] | /blog/hello-world [blog-slug] | /de/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] |
| de-only | / [index] | /de/de-only [localized-de-only] | /fr [localized-index] | / [index] | /de/de-only [localized-de-only] | /fr [localized-index] | / [index] | /de/de-only [localized-de-only] | /fr [localized-index] |
| index | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] |
| landing | /landing [landing] | /de/start [localized-landing-de] | /fr [localized-index] | /landing [landing] | /de/start [localized-landing-de] | /fr [localized-index] | /landing [landing] | /de/start [localized-landing-de] | /fr [localized-index] |

## Invariant breaks (0)

none
