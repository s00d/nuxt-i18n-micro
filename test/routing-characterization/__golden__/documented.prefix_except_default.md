# documented · prefix_except_default

cases the docs and e2e tests pin: a renamed parent moving its children, localeRoutes adding a param, a doubled slash, a value equal to the original path, an unlocalized page

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| activity | /change-activity | /activity |  |
| · activity-hiking | hiking |  |  |
| · activity-skiing | book-activity/skiing |  |  |
| page | /page/:id |  |  |
| product-slug | /product/:slug(.*)* |  |  |
| unlocalized | /unlocalized |  |  |
| same | /same |  |  |
| localized-index | /:locale(de\|fr) |  |  |
| localized-activity | /:locale(fr)/activity |  |  |
| · localized-activity-hiking | hiking |  |  |
| · localized-activity-skiing | skiing |  |  |
| localized-activity-de | /:locale(de)/change-buchen |  |  |
| · localized-activity-hiking-de | hiking |  |  |
| · localized-activity-skiing-de | aktivitaet-buchen/ski-fahren |  |  |
| localized-page | /:locale(fr)/page |  |  |
| localized-page-de | /:locale(de)/page/:id |  |  |
| localized-product-slug | /:locale(fr)/product/:slug(.*)* |  |  |
| localized-product-slug-de | /:locale(de)/produkte/:slug(.*)* |  |  |
| localized-same | /:locale(de\|fr)/same |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | en | null |
| /activity | activity | en | activity | activity | English | null | en | null |
| /activity/book-activity/skiing | activity-skiing | en | activity-skiing | activity-skiing | English | null | en | null |
| /activity/hiking | activity-hiking | en | activity-hiking | activity-hiking | English | null | en | null |
| /change-activity | activity | en | activity | activity | English | null | en | null |
| /change-activity/book-activity/skiing | activity-skiing | en | activity-skiing | activity-skiing | English | null | en | null |
| /change-activity/hiking | activity-hiking | en | activity-hiking | activity-hiking | English | null | en | null |
| /de | localized-index | de | index | index | Deutsch | de | de | null |
| /de/change-buchen | localized-activity-de | de | activity | activity | Deutsch | de | de | null |
| /de/change-buchen/aktivitaet-buchen/ski-fahren | localized-activity-skiing-de | de | activity-skiing | activity-skiing | Deutsch | de | de | null |
| /de/change-buchen/hiking | localized-activity-hiking-de | de | activity-hiking | activity-hiking | Deutsch | de | de | null |
| /de/page/42 | localized-page-de | de | page | page | Deutsch | de | de | null |
| /de/produkte/hello-world | localized-product-slug-de | de | product-slug | product-slug | Deutsch | de | de | null |
| /de/same | localized-same | de | same | same | Deutsch | de | de | null |
| /fr | localized-index | fr | index | index | Français | fr | fr | null |
| /fr/activity | localized-activity | fr | activity | activity | Français | fr | fr | null |
| /fr/activity/hiking | localized-activity-hiking | fr | activity-hiking | activity-hiking | Français | fr | fr | null |
| /fr/activity/skiing | localized-activity-skiing | fr | activity-skiing | activity-skiing | Français | fr | fr | null |
| /fr/page | localized-page | fr | page | page | Français | fr | fr | null |
| /fr/product/hello-world | localized-product-slug | fr | product-slug | product-slug | Français | fr | fr | null |
| /fr/same | localized-same | fr | same | same | Français | fr | fr | null |
| /page/42 | page | en | page | page | English | null | en | null |
| /product/hello-world | product-slug | en | product-slug | product-slug | English | null | en | null |
| /same | same | en | same | same | English | null | en | null |
| /unlocalized | unlocalized | en | unlocalized | unlocalized | English | null | en | null |
| /en | null | en |  | null | English | en | en | Default locale should not have prefix |
| /en/ | null | en |  | null | English | en | en | Default locale should not have prefix |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | null | en |  | null | English | null | en | null |
| /de/about/ | null | de |  | null | Deutsch | de | de | null |
| /missing | null | en |  | null | English | null | en | null |
| /de/missing | null | de |  | null | Deutsch | de | de | null |
| /xx/about | null | en |  | null | English | null | en | null |
| /de/de/about | null | de |  | null | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /activity | /change-activity?q=1#top [activity] |  | /change-activity?q=1#top [activity] | /change-activity?q=1#top [activity] | /activity | /change-activity |
| /activity/book-activity/skiing | /change-activity/book-activity/skiing?q=1#top [activity-skiing] |  | /change-activity/book-activity/skiing?q=1#top [activity-skiing] | /change-activity/book-activity/skiing?q=1#top [activity-skiing] | /activity/book-activity/skiing | /change-activity/book-activity/skiing |
| /activity/hiking | /change-activity/hiking?q=1#top [activity-hiking] |  | /change-activity/hiking?q=1#top [activity-hiking] | /change-activity/hiking?q=1#top [activity-hiking] | /activity/hiking | /change-activity/hiking |
| /change-activity | /change-activity?q=1#top [activity] |  | /change-activity?q=1#top [activity] | /change-activity?q=1#top [activity] | /change-activity | null |
| /change-activity/book-activity/skiing | /change-activity/book-activity/skiing?q=1#top [activity-skiing] |  | /change-activity/book-activity/skiing?q=1#top [activity-skiing] | /change-activity/book-activity/skiing?q=1#top [activity-skiing] | /change-activity/book-activity/skiing | null |
| /change-activity/hiking | /change-activity/hiking?q=1#top [activity-hiking] |  | /change-activity/hiking?q=1#top [activity-hiking] | /change-activity/hiking?q=1#top [activity-hiking] | /change-activity/hiking | null |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/change-buchen | /change-activity?q=1#top [activity] |  | /change-activity?q=1#top [activity] | /change-activity?q=1#top [activity] | /de/change-buchen | null |
| /de/change-buchen/aktivitaet-buchen/ski-fahren | /change-activity/book-activity/skiing?q=1#top [activity-skiing] |  | /change-activity/book-activity/skiing?q=1#top [activity-skiing] | /change-activity/book-activity/skiing?q=1#top [activity-skiing] | /de/change-buchen/aktivitaet-buchen/ski-fahren | null |
| /de/change-buchen/hiking | /change-activity/hiking?q=1#top [activity-hiking] |  | /change-activity/hiking?q=1#top [activity-hiking] | /change-activity/hiking?q=1#top [activity-hiking] | /de/change-buchen/hiking | null |
| /de/page/42 | /page/42?q=1#top [page] | /page/42-en?q=1#top [page] | /page/42?q=1#top [page] | /page/42?q=1#top [page] | /de/page/42 | null |
| /de/produkte/hello-world | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /de/produkte/hello-world | null |
| /de/same | /same?q=1#top [same] |  | /same?q=1#top [same] | /same?q=1#top [same] | /de/same | null |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /fr | null |
| /fr/activity | /change-activity?q=1#top [activity] |  | /change-activity?q=1#top [activity] | /change-activity?q=1#top [activity] | /fr/activity | null |
| /fr/activity/hiking | /change-activity/hiking?q=1#top [activity-hiking] |  | /change-activity/hiking?q=1#top [activity-hiking] | /change-activity/hiking?q=1#top [activity-hiking] | /fr/activity/hiking | null |
| /fr/activity/skiing | /change-activity/book-activity/skiing?q=1#top [activity-skiing] |  | /change-activity/book-activity/skiing?q=1#top [activity-skiing] | /change-activity/book-activity/skiing?q=1#top [activity-skiing] | /fr/activity/skiing | null |
| /fr/page | /fr/page?q=1#top [localized-page] |  | /fr/page?q=1#top [localized-page] | — [—] | /fr/page | null |
| /fr/product/hello-world | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /fr/product/hello-world | null |
| /fr/same | /same?q=1#top [same] |  | /same?q=1#top [same] | /same?q=1#top [same] | /fr/same | null |
| /page/42 | /page/42?q=1#top [page] | /page/42-en?q=1#top [page] | /page/42?q=1#top [page] | /page/42?q=1#top [page] | /page/42 | null |
| /product/hello-world | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world | null |
| /same | /same?q=1#top [same] |  | /same?q=1#top [same] | /same?q=1#top [same] | /same | null |
| /unlocalized | /unlocalized?q=1#top [unlocalized] |  | /unlocalized?q=1#top [unlocalized] | /unlocalized?q=1#top [unlocalized] | /unlocalized | null |
| /en | /en?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /en/?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | /about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | / | /de |
| /activity | /de/change-buchen?q=1#top [localized-activity-de] |  | /de/change-buchen?q=1#top [localized-activity-de] | /de/change-buchen?q=1#top [localized-activity-de] | /activity | /de/change-buchen |
| /activity/book-activity/skiing | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] |  | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /activity/book-activity/skiing | /de/change-buchen/aktivitaet-buchen/ski-fahren |
| /activity/hiking | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] |  | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /activity/hiking | /de/change-buchen/hiking |
| /change-activity | /de/change-buchen?q=1#top [localized-activity-de] |  | /de/change-buchen?q=1#top [localized-activity-de] | /de/change-buchen?q=1#top [localized-activity-de] | /change-activity | /de/change-buchen |
| /change-activity/book-activity/skiing | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] |  | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /change-activity/book-activity/skiing | /de/change-buchen/aktivitaet-buchen/ski-fahren |
| /change-activity/hiking | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] |  | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /change-activity/hiking | /de/change-buchen/hiking |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | null |
| /de/change-buchen | /de/change-buchen?q=1#top [localized-activity-de] |  | /de/change-buchen?q=1#top [localized-activity-de] | /de/change-buchen?q=1#top [localized-activity-de] | /de/change-buchen | null |
| /de/change-buchen/aktivitaet-buchen/ski-fahren | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] |  | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /de/change-buchen/aktivitaet-buchen/ski-fahren | null |
| /de/change-buchen/hiking | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] |  | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /de/change-buchen/hiking | null |
| /de/page/42 | /de/page/42?q=1#top [localized-page-de] | /de/page/42-de?q=1#top [localized-page-de] | /de/page/42?q=1#top [localized-page-de] | /de/page/42?q=1#top [localized-page-de] | /de/page/42 | null |
| /de/produkte/hello-world | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world | null |
| /de/same | /de/same?q=1#top [localized-same] |  | /de/same?q=1#top [localized-same] | /de/same?q=1#top [localized-same] | /de/same | null |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /fr | null |
| /fr/activity | /de/change-buchen?q=1#top [localized-activity-de] |  | /de/change-buchen?q=1#top [localized-activity-de] | /de/change-buchen?q=1#top [localized-activity-de] | /fr/activity | null |
| /fr/activity/hiking | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] |  | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /fr/activity/hiking | null |
| /fr/activity/skiing | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] |  | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /fr/activity/skiing | null |
| /fr/page | /fr/page?q=1#top [localized-page] |  | /fr/page?q=1#top [localized-page] | — [—] | /fr/page | null |
| /fr/product/hello-world | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /fr/product/hello-world | null |
| /fr/same | /de/same?q=1#top [localized-same] |  | /de/same?q=1#top [localized-same] | /de/same?q=1#top [localized-same] | /fr/same | null |
| /page/42 | /de/page/42?q=1#top [localized-page-de] | /de/page/42-de?q=1#top [localized-page-de] | /de/page/42?q=1#top [localized-page-de] | /de/page/42?q=1#top [localized-page-de] | /page/42 | /de/page/42 |
| /product/hello-world | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /product/hello-world | /de/produkte/hello-world |
| /same | /de/same?q=1#top [localized-same] |  | /de/same?q=1#top [localized-same] | /de/same?q=1#top [localized-same] | /same | /de/same |
| /unlocalized | /unlocalized?q=1#top [unlocalized] |  | /unlocalized?q=1#top [unlocalized] | /unlocalized?q=1#top [unlocalized] | /unlocalized | null |
| /en | /en?q=1#top [—] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en | null |
| /en/ | /en/?q=1#top [—] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en/ | null |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de/ | null |
| /about/ | /about/?q=1#top [—] |  | /de/about/?q=1#top [null] | /de/about/?q=1#top [null] | /about/ | /de/about |
| /de/about/ | /de/about/?q=1#top [—] |  | /de/about/?q=1#top [null] | /de/about/?q=1#top [null] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /missing | /de/missing |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /xx/about | /de/xx/about |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | / | /fr |
| /activity | /fr/activity?q=1#top [localized-activity] |  | /fr/activity?q=1#top [localized-activity] | /fr/activity?q=1#top [localized-activity] | /activity | /fr/activity |
| /activity/book-activity/skiing | /fr/activity/skiing?q=1#top [localized-activity-skiing] |  | /fr/activity/skiing?q=1#top [localized-activity-skiing] | /fr/activity/skiing?q=1#top [localized-activity-skiing] | /activity/book-activity/skiing | /fr/activity/skiing |
| /activity/hiking | /fr/activity/hiking?q=1#top [localized-activity-hiking] |  | /fr/activity/hiking?q=1#top [localized-activity-hiking] | /fr/activity/hiking?q=1#top [localized-activity-hiking] | /activity/hiking | /fr/activity/hiking |
| /change-activity | /fr/activity?q=1#top [localized-activity] |  | /fr/activity?q=1#top [localized-activity] | /fr/activity?q=1#top [localized-activity] | /change-activity | /fr/activity |
| /change-activity/book-activity/skiing | /fr/activity/skiing?q=1#top [localized-activity-skiing] |  | /fr/activity/skiing?q=1#top [localized-activity-skiing] | /fr/activity/skiing?q=1#top [localized-activity-skiing] | /change-activity/book-activity/skiing | /fr/activity/skiing |
| /change-activity/hiking | /fr/activity/hiking?q=1#top [localized-activity-hiking] |  | /fr/activity/hiking?q=1#top [localized-activity-hiking] | /fr/activity/hiking?q=1#top [localized-activity-hiking] | /change-activity/hiking | /fr/activity/hiking |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de | null |
| /de/change-buchen | /fr/activity?q=1#top [localized-activity] |  | /fr/activity?q=1#top [localized-activity] | /fr/activity?q=1#top [localized-activity] | /de/change-buchen | null |
| /de/change-buchen/aktivitaet-buchen/ski-fahren | /fr/activity/skiing?q=1#top [localized-activity-skiing] |  | /fr/activity/skiing?q=1#top [localized-activity-skiing] | /fr/activity/skiing?q=1#top [localized-activity-skiing] | /de/change-buchen/aktivitaet-buchen/ski-fahren | null |
| /de/change-buchen/hiking | /fr/activity/hiking?q=1#top [localized-activity-hiking] |  | /fr/activity/hiking?q=1#top [localized-activity-hiking] | /fr/activity/hiking?q=1#top [localized-activity-hiking] | /de/change-buchen/hiking | null |
| /de/page/42 | /fr/page?q=1#top [localized-page] | /fr/page?q=1#top [localized-page] | /fr/page?q=1#top [localized-page] | /fr/page?q=1#top [localized-page] | /de/page/42 | null |
| /de/produkte/hello-world | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /de/produkte/hello-world | null |
| /de/same | /fr/same?q=1#top [localized-same] |  | /fr/same?q=1#top [localized-same] | /fr/same?q=1#top [localized-same] | /de/same | null |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | null |
| /fr/activity | /fr/activity?q=1#top [localized-activity] |  | /fr/activity?q=1#top [localized-activity] | /fr/activity?q=1#top [localized-activity] | /fr/activity | null |
| /fr/activity/hiking | /fr/activity/hiking?q=1#top [localized-activity-hiking] |  | /fr/activity/hiking?q=1#top [localized-activity-hiking] | /fr/activity/hiking?q=1#top [localized-activity-hiking] | /fr/activity/hiking | null |
| /fr/activity/skiing | /fr/activity/skiing?q=1#top [localized-activity-skiing] |  | /fr/activity/skiing?q=1#top [localized-activity-skiing] | /fr/activity/skiing?q=1#top [localized-activity-skiing] | /fr/activity/skiing | null |
| /fr/page | /fr/page?q=1#top [localized-page] |  | /fr/page?q=1#top [localized-page] | /fr/page?q=1#top [localized-page] | /fr/page | null |
| /fr/product/hello-world | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world | null |
| /fr/same | /fr/same?q=1#top [localized-same] |  | /fr/same?q=1#top [localized-same] | /fr/same?q=1#top [localized-same] | /fr/same | null |
| /page/42 | /fr/page?q=1#top [localized-page] | /fr/page?q=1#top [localized-page] | /fr/page?q=1#top [localized-page] | /fr/page?q=1#top [localized-page] | /page/42 | /fr/page |
| /product/hello-world | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /product/hello-world | /fr/product/hello-world |
| /same | /fr/same?q=1#top [localized-same] |  | /fr/same?q=1#top [localized-same] | /fr/same?q=1#top [localized-same] | /same | /fr/same |
| /unlocalized | /unlocalized?q=1#top [unlocalized] |  | /unlocalized?q=1#top [unlocalized] | /unlocalized?q=1#top [unlocalized] | /unlocalized | null |
| /en | /en?q=1#top [—] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en | null |
| /en/ | /en/?q=1#top [—] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en/ | null |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de/ | null |
| /about/ | /about/?q=1#top [—] |  | /fr/about/?q=1#top [null] | /fr/about/?q=1#top [null] | /about/ | /fr/about |
| /de/about/ | /de/about/?q=1#top [—] |  | /fr/about/?q=1#top [null] | /fr/about/?q=1#top [null] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /missing | /fr/missing |
| /de/missing | /de/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | /xx/about | /fr/xx/about |
| /de/de/about | /de/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| activity | /change-activity [activity] | /de/change-buchen [localized-activity-de] | /fr/activity [localized-activity] | /change-activity [activity] | /de/change-buchen [localized-activity-de] | /fr/activity [localized-activity] | /change-activity [activity] | /de/change-buchen [localized-activity-de] | /fr/activity [localized-activity] |
| activity-hiking | /change-activity/hiking [activity-hiking] | /de/change-buchen/hiking [localized-activity-hiking-de] | /fr/activity/hiking [localized-activity-hiking] | /change-activity/hiking [activity-hiking] | /de/change-buchen/hiking [localized-activity-hiking-de] | /fr/activity/hiking [localized-activity-hiking] | /change-activity/hiking [activity-hiking] | /de/change-buchen/hiking [localized-activity-hiking-de] | /fr/activity/hiking [localized-activity-hiking] |
| activity-skiing | /change-activity/book-activity/skiing [activity-skiing] | /de/change-buchen/aktivitaet-buchen/ski-fahren [localized-activity-skiing-de] | /fr/activity/skiing [localized-activity-skiing] | /change-activity/book-activity/skiing [activity-skiing] | /de/change-buchen/aktivitaet-buchen/ski-fahren [localized-activity-skiing-de] | /fr/activity/skiing [localized-activity-skiing] | /change-activity/book-activity/skiing [activity-skiing] | /de/change-buchen/aktivitaet-buchen/ski-fahren [localized-activity-skiing-de] | /fr/activity/skiing [localized-activity-skiing] |
| index | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] |
| page | /page/42 [page] | /de/page/42 [localized-page-de] | /fr/page [localized-page] | /page/42 [page] | /de/page/42 [localized-page-de] | /fr/page [localized-page] | /page/42 [page] | /de/page/42 [localized-page-de] | /fr/page [localized-page] |
| product-slug | /product/hello-world [product-slug] | /de/produkte/hello-world [localized-product-slug-de] | /fr/product/hello-world [localized-product-slug] | /product/hello-world [product-slug] | /de/produkte/hello-world [localized-product-slug-de] | /fr/product/hello-world [localized-product-slug] | /product/hello-world [product-slug] | /de/produkte/hello-world [localized-product-slug-de] | /fr/product/hello-world [localized-product-slug] |
| same | /same [same] | /de/same [localized-same] | /fr/same [localized-same] | /same [same] | /de/same [localized-same] | /fr/same [localized-same] | /same [same] | /de/same [localized-same] | /fr/same [localized-same] |
| unlocalized | /unlocalized [unlocalized] | /unlocalized [unlocalized] | /unlocalized [unlocalized] | /unlocalized [unlocalized] | /unlocalized [unlocalized] | /unlocalized [unlocalized] | /unlocalized [unlocalized] | /unlocalized [unlocalized] | /unlocalized [unlocalized] |

## Invariant breaks (4)

- /de/page/42 → fr → de: round trip ends on /fr/page?q=1#top, not /de/page/42?q=1#top
- /fr/page → en: switch lands on /fr/page?q=1#top read as fr
- /fr/page → de: switch lands on /fr/page?q=1#top read as fr
- /page/42 → fr → en: round trip ends on /fr/page?q=1#top, not /page/42?q=1#top
