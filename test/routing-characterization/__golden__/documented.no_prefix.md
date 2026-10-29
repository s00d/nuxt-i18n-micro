# documented · no_prefix

cases the docs and e2e tests pin: a renamed parent moving its children, localeRoutes adding a param, a doubled slash, a value equal to the original path, an unlocalized page

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| activity | /activity |  |  |
| · activity-hiking | hiking |  |  |
| · activity-skiing | skiing |  |  |
| page | /page |  |  |
| product-slug | /product/:slug(.*)* |  |  |
| unlocalized | /unlocalized |  |  |
| same | /same |  |  |
| localized-activity-en | /change-activity |  |  |
| · localized-activity-hiking-en | hiking |  |  |
| · localized-activity-skiing-en | book-activity/skiing |  |  |
| localized-activity-de | /change-buchen |  |  |
| · localized-activity-hiking-de | hiking |  |  |
| · localized-activity-skiing-de | aktivitaet-buchen/ski-fahren |  |  |
| localized-page-en | /page/:id |  |  |
| localized-page-de | /page/:id |  |  |
| localized-product-slug-de | /produkte/:slug(.*)* |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | null | null |
| /activity | activity | en | activity | activity | English | null | null | null |
| /activity/hiking | activity-hiking | en | activity-hiking | activity-hiking | English | null | null | null |
| /activity/skiing | activity-skiing | en | activity-skiing | activity-skiing | English | null | null | null |
| /change-activity | localized-activity-en | en | activity | activity | English | null | null | null |
| /change-activity/book-activity/skiing | localized-activity-skiing-en | en | activity-skiing | activity-skiing | English | null | null | null |
| /change-activity/hiking | localized-activity-hiking-en | en | activity-hiking | activity-hiking | English | null | null | null |
| /change-buchen | localized-activity-de | en | activity | activity | English | null | null | null |
| /change-buchen/aktivitaet-buchen/ski-fahren | localized-activity-skiing-de | en | activity-skiing | activity-skiing | English | null | null | null |
| /change-buchen/hiking | localized-activity-hiking-de | en | activity-hiking | activity-hiking | English | null | null | null |
| /page | page | en | page | page | English | null | null | null |
| /page/42 | localized-page-en | en | page | page | English | null | null | null |
| /product/hello-world | product-slug | en | product-slug | product-slug | English | null | null | null |
| /produkte/hello-world | localized-product-slug-de | en | product-slug | product-slug | English | null | null | null |
| /same | same | en | same | same | English | null | null | null |
| /unlocalized | unlocalized | en | unlocalized | unlocalized | English | null | null | null |
| /en | null | en |  | null | English | en | null | null |
| /en/ | null | en |  | null | English | en | null | null |
| /de | null | en |  | null | English | de | null | null |
| /de/ | null | en |  | null | English | de | null | null |
| /about/ | null | en |  | null | English | null | null | null |
| /de/about/ | null | en |  | null | English | de | null | null |
| /missing | null | en |  | null | English | null | null | null |
| /de/missing | null | en |  | null | English | de | null | null |
| /xx/about | null | en |  | null | English | null | null | null |
| /de/de/about | null | en |  | null | English | de | null | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /activity | /change-activity?q=1#top [localized-activity-en] |  | /change-activity?q=1#top [localized-activity-en] | /change-activity?q=1#top [localized-activity-en] | /activity | null |
| /activity/hiking | /change-activity/hiking?q=1#top [localized-activity-hiking-en] |  | /change-activity/hiking?q=1#top [localized-activity-hiking-en] | /change-activity/hiking?q=1#top [localized-activity-hiking-en] | /activity/hiking | null |
| /activity/skiing | /change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] |  | /change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | /change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | /activity/skiing | null |
| /change-activity | /change-activity?q=1#top [localized-activity-en] |  | /change-activity?q=1#top [localized-activity-en] | /change-activity?q=1#top [localized-activity-en] | /change-activity | null |
| /change-activity/book-activity/skiing | /change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] |  | /change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | /change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | /change-activity/book-activity/skiing | null |
| /change-activity/hiking | /change-activity/hiking?q=1#top [localized-activity-hiking-en] |  | /change-activity/hiking?q=1#top [localized-activity-hiking-en] | /change-activity/hiking?q=1#top [localized-activity-hiking-en] | /change-activity/hiking | null |
| /change-buchen | /change-activity?q=1#top [localized-activity-en] |  | /change-activity?q=1#top [localized-activity-en] | /change-activity?q=1#top [localized-activity-en] | /change-buchen | null |
| /change-buchen/aktivitaet-buchen/ski-fahren | /change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] |  | /change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | /change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | /change-buchen/aktivitaet-buchen/ski-fahren | null |
| /change-buchen/hiking | /change-activity/hiking?q=1#top [localized-activity-hiking-en] |  | /change-activity/hiking?q=1#top [localized-activity-hiking-en] | /change-activity/hiking?q=1#top [localized-activity-hiking-en] | /change-buchen/hiking | null |
| /page | /page?q=1#top [page] |  | /page?q=1#top [page] | — [—] | /page | null |
| /page/42 | /page/42?q=1#top [localized-page-en] | /page/42-en?q=1#top [localized-page-en] | /page/42?q=1#top [localized-page-en] | /page/42?q=1#top [localized-page-en] | /page/42 | null |
| /product/hello-world | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world | null |
| /produkte/hello-world | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /produkte/hello-world | null |
| /same | /same?q=1#top [same] |  | /same?q=1#top [same] | /same?q=1#top [same] | /same | null |
| /unlocalized | /unlocalized?q=1#top [unlocalized] |  | /unlocalized?q=1#top [unlocalized] | /unlocalized?q=1#top [unlocalized] | /unlocalized | null |
| /en | /en?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /en/?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de | /de?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/ | /de/?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | /about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /activity | /change-buchen?q=1#top [localized-activity-de] |  | /change-buchen?q=1#top [localized-activity-de] | /change-buchen?q=1#top [localized-activity-de] | /activity | null |
| /activity/hiking | /change-buchen/hiking?q=1#top [localized-activity-hiking-de] |  | /change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /activity/hiking | null |
| /activity/skiing | /change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] |  | /change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /activity/skiing | null |
| /change-activity | /change-buchen?q=1#top [localized-activity-de] |  | /change-buchen?q=1#top [localized-activity-de] | /change-buchen?q=1#top [localized-activity-de] | /change-activity | null |
| /change-activity/book-activity/skiing | /change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] |  | /change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /change-activity/book-activity/skiing | null |
| /change-activity/hiking | /change-buchen/hiking?q=1#top [localized-activity-hiking-de] |  | /change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /change-activity/hiking | null |
| /change-buchen | /change-buchen?q=1#top [localized-activity-de] |  | /change-buchen?q=1#top [localized-activity-de] | /change-buchen?q=1#top [localized-activity-de] | /change-buchen | null |
| /change-buchen/aktivitaet-buchen/ski-fahren | /change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] |  | /change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /change-buchen/aktivitaet-buchen/ski-fahren | null |
| /change-buchen/hiking | /change-buchen/hiking?q=1#top [localized-activity-hiking-de] |  | /change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /change-buchen/hiking | null |
| /page | /page?q=1#top [page] |  | /page?q=1#top [page] | — [—] | /page | null |
| /page/42 | /page/42?q=1#top [localized-page-de] | /page/42-de?q=1#top [localized-page-de] | /page/42?q=1#top [localized-page-de] | /page/42?q=1#top [localized-page-de] | /page/42 | null |
| /product/hello-world | /produkte/hello-world?q=1#top [localized-product-slug-de] | /produkte/hello-world?q=1#top [localized-product-slug-de] | /produkte/hello-world?q=1#top [localized-product-slug-de] | /produkte/hello-world?q=1#top [localized-product-slug-de] | /product/hello-world | null |
| /produkte/hello-world | /produkte/hello-world?q=1#top [localized-product-slug-de] | /produkte/hello-world?q=1#top [localized-product-slug-de] | /produkte/hello-world?q=1#top [localized-product-slug-de] | /produkte/hello-world?q=1#top [localized-product-slug-de] | /produkte/hello-world | null |
| /same | /same?q=1#top [same] |  | /same?q=1#top [same] | /same?q=1#top [same] | /same | null |
| /unlocalized | /unlocalized?q=1#top [unlocalized] |  | /unlocalized?q=1#top [unlocalized] | /unlocalized?q=1#top [unlocalized] | /unlocalized | null |
| /en | /en?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /en/?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de | /de?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/ | /de/?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | /about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /activity | /activity?q=1#top [activity] |  | /activity?q=1#top [activity] | /activity?q=1#top [activity] | /activity | null |
| /activity/hiking | /activity/hiking?q=1#top [activity-hiking] |  | /activity/hiking?q=1#top [activity-hiking] | /activity/hiking?q=1#top [activity-hiking] | /activity/hiking | null |
| /activity/skiing | /activity/skiing?q=1#top [activity-skiing] |  | /activity/skiing?q=1#top [activity-skiing] | /activity/skiing?q=1#top [activity-skiing] | /activity/skiing | null |
| /change-activity | /activity?q=1#top [activity] |  | /activity?q=1#top [activity] | /activity?q=1#top [activity] | /change-activity | null |
| /change-activity/book-activity/skiing | /activity/skiing?q=1#top [activity-skiing] |  | /activity/skiing?q=1#top [activity-skiing] | /activity/skiing?q=1#top [activity-skiing] | /change-activity/book-activity/skiing | null |
| /change-activity/hiking | /activity/hiking?q=1#top [activity-hiking] |  | /activity/hiking?q=1#top [activity-hiking] | /activity/hiking?q=1#top [activity-hiking] | /change-activity/hiking | null |
| /change-buchen | /activity?q=1#top [activity] |  | /activity?q=1#top [activity] | /activity?q=1#top [activity] | /change-buchen | null |
| /change-buchen/aktivitaet-buchen/ski-fahren | /activity/skiing?q=1#top [activity-skiing] |  | /activity/skiing?q=1#top [activity-skiing] | /activity/skiing?q=1#top [activity-skiing] | /change-buchen/aktivitaet-buchen/ski-fahren | null |
| /change-buchen/hiking | /activity/hiking?q=1#top [activity-hiking] |  | /activity/hiking?q=1#top [activity-hiking] | /activity/hiking?q=1#top [activity-hiking] | /change-buchen/hiking | null |
| /page | /page?q=1#top [page] |  | /page?q=1#top [page] | /page?q=1#top [page] | /page | null |
| /page/42 | /page?q=1#top [page] | /page?q=1#top [page] | /page?q=1#top [page] | /page?q=1#top [page] | /page/42 | null |
| /product/hello-world | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world | null |
| /produkte/hello-world | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /produkte/hello-world | null |
| /same | /same?q=1#top [same] |  | /same?q=1#top [same] | /same?q=1#top [same] | /same | null |
| /unlocalized | /unlocalized?q=1#top [unlocalized] |  | /unlocalized?q=1#top [unlocalized] | /unlocalized?q=1#top [unlocalized] | /unlocalized | null |
| /en | /en?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /en/?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de | /de?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/ | /de/?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | /about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / |
|---|---|---|---|
| activity | /change-activity [localized-activity-en] | /change-buchen [localized-activity-de] | /activity [activity] |
| activity-hiking | /change-activity/hiking [localized-activity-hiking-en] | /change-buchen/hiking [localized-activity-hiking-de] | /activity/hiking [activity-hiking] |
| activity-skiing | /change-activity/book-activity/skiing [localized-activity-skiing-en] | /change-buchen/aktivitaet-buchen/ski-fahren [localized-activity-skiing-de] | /activity/skiing [activity-skiing] |
| index | / [index] | / [index] | / [index] |
| page | /page/42 [localized-page-en] | /page/42 [localized-page-de] | /page [page] |
| product-slug | /product/hello-world [product-slug] | /produkte/hello-world [localized-product-slug-de] | /product/hello-world [product-slug] |
| same | /same [same] | /same [same] | /same [same] |
| unlocalized | /unlocalized [unlocalized] | /unlocalized [unlocalized] | /unlocalized [unlocalized] |

## Invariant breaks (1)

- /page/42 → fr → en: round trip ends on /page?q=1#top, not /page/42?q=1#top
