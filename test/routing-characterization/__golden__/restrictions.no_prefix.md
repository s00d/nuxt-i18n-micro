# restrictions · no_prefix

routeLocales and $defineI18nRoute locales, unlocalized pages and routesLocaleLinks

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| about | /about |  |  |
| de-only | /de-only |  |  |
| blog | /blog |  |  |
| blog-slug | /blog/:slug() |  |  |
| admin | /admin |  |  |
| · admin-users | users |  |  |
| landing | /landing |  |  |
| localized-landing-de | /start |  |  |

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
| /de-only | de-only | en | de-only | de-only | English | null | null | null |
| /landing | landing | en | landing | landing | English | null | null | null |
| /start | localized-landing-de | en | landing | landing | English | null | null | null |
| /en | null | en |  | null | English | en | null | null |
| /en/ | null | en |  | null | English | en | null | null |
| /de | null | en |  | null | English | de | null | null |
| /de/ | null | en |  | null | English | de | null | null |
| /about/ | about | en | about | about | English | null | null | null |
| /de/about/ | null | en |  | null | English | de | null | null |
| /missing | null | en |  | null | English | null | null | null |
| /de/missing | null | en |  | null | English | de | null | null |
| /xx/about | null | en |  | null | English | null | null | null |
| /de/de/about | null | en |  | null | English | de | null | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | null |
| /admin | /admin?q=1#top [admin] |  | /admin?q=1#top [admin] | /admin?q=1#top [admin] | /admin | null |
| /admin/users | /admin/users?q=1#top [admin-users] |  | /admin/users?q=1#top [admin-users] | /admin/users?q=1#top [admin-users] | /admin/users | null |
| /blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | /blog | null |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world | null |
| /de-only | /de-only?q=1#top [de-only] |  | /de-only?q=1#top [de-only] | /de-only?q=1#top [de-only] | /de-only | null |
| /landing | /landing?q=1#top [landing] |  | /landing?q=1#top [landing] | /landing?q=1#top [landing] | /landing | null |
| /start | /landing?q=1#top [landing] |  | /landing?q=1#top [landing] | /landing?q=1#top [landing] | /start | null |
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
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | null |
| /admin | /admin?q=1#top [admin] |  | /admin?q=1#top [admin] | /admin?q=1#top [admin] | /admin | null |
| /admin/users | /admin/users?q=1#top [admin-users] |  | /admin/users?q=1#top [admin-users] | /admin/users?q=1#top [admin-users] | /admin/users | null |
| /blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | /blog | null |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-de?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world | null |
| /de-only | /de-only?q=1#top [de-only] |  | /de-only?q=1#top [de-only] | /de-only?q=1#top [de-only] | /de-only | null |
| /landing | /start?q=1#top [localized-landing-de] |  | /start?q=1#top [localized-landing-de] | /start?q=1#top [localized-landing-de] | /landing | null |
| /start | /start?q=1#top [localized-landing-de] |  | /start?q=1#top [localized-landing-de] | /start?q=1#top [localized-landing-de] | /start | null |
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

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | null |
| /admin | /admin?q=1#top [admin] |  | /admin?q=1#top [admin] | /admin?q=1#top [admin] | /admin | null |
| /admin/users | /admin/users?q=1#top [admin-users] |  | /admin/users?q=1#top [admin-users] | /admin/users?q=1#top [admin-users] | /admin/users | null |
| /blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | /blog | null |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-fr?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world | null |
| /de-only | /de-only?q=1#top [de-only] |  | /de-only?q=1#top [de-only] | /de-only?q=1#top [de-only] | /de-only | null |
| /landing | /landing?q=1#top [landing] |  | /landing?q=1#top [landing] | /landing?q=1#top [landing] | /landing | null |
| /start | /landing?q=1#top [landing] |  | /landing?q=1#top [landing] | /landing?q=1#top [landing] | /start | null |
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

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / |
|---|---|---|---|
| about | /about [about] | /about [about] | /about [about] |
| admin | /admin [admin] | /admin [admin] | /admin [admin] |
| admin-users | /admin/users [admin-users] | /admin/users [admin-users] | /admin/users [admin-users] |
| blog | /blog [blog] | /blog [blog] | /blog [blog] |
| blog-slug | /blog/hello-world [blog-slug] | /blog/hello-world [blog-slug] | /blog/hello-world [blog-slug] |
| de-only | /de-only [de-only] | /de-only [de-only] | /de-only [de-only] |
| index | / [index] | / [index] | / [index] |
| landing | /landing [landing] | /start [localized-landing-de] | /landing [landing] |

## Invariant breaks (0)

none
