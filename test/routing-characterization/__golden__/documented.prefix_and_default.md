# documented · prefix_and_default

cases the docs and e2e tests pin: a renamed parent moving its children, localeRoutes adding a param, a doubled slash, a value equal to the original path, an unlocalized page

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| activity | /change-activity |  |  |
| · activity-hiking | hiking |  |  |
| · activity-skiing | book-activity/skiing |  |  |
| page | /page/:id |  |  |
| product-slug | /product/:slug(.*)* |  |  |
| unlocalized | /unlocalized |  |  |
| same | /same |  |  |
| localized-index | /:locale(en\|de\|fr) |  |  |
| localized-activity | /:locale(fr)/activity |  |  |
| · localized-activity-hiking | hiking |  |  |
| · localized-activity-skiing | skiing |  |  |
| localized-activity-en | /:locale(en)/change-activity |  |  |
| · localized-activity-hiking-en | hiking |  |  |
| · localized-activity-skiing-en | book-activity/skiing |  |  |
| localized-activity-de | /:locale(de)/change-buchen |  |  |
| · localized-activity-hiking-de | hiking |  |  |
| · localized-activity-skiing-de | aktivitaet-buchen/ski-fahren |  |  |
| localized-page | /:locale(fr)/page |  |  |
| localized-page-en | /:locale(en)/page/:id |  |  |
| localized-page-de | /:locale(de)/page/:id |  |  |
| localized-product-slug | /:locale(en\|fr)/product/:slug(.*)* |  |  |
| localized-product-slug-de | /:locale(de)/produkte/:slug(.*)* |  |  |
| localized-same | /:locale(en\|de\|fr)/same |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | null | null |
| /change-activity | activity | en | activity | activity | English | null | null | null |
| /change-activity/book-activity/skiing | activity-skiing | en | activity-skiing | activity-skiing | English | null | null | null |
| /change-activity/hiking | activity-hiking | en | activity-hiking | activity-hiking | English | null | null | null |
| /de | localized-index | de | index | index | Deutsch | de | de | null |
| /de/change-buchen | localized-activity-de | de | activity | activity | Deutsch | de | de | null |
| /de/change-buchen/aktivitaet-buchen/ski-fahren | localized-activity-skiing-de | de | activity-skiing | activity-skiing | Deutsch | de | de | null |
| /de/change-buchen/hiking | localized-activity-hiking-de | de | activity-hiking | activity-hiking | Deutsch | de | de | null |
| /de/page/42 | localized-page-de | de | page | page | Deutsch | de | de | null |
| /de/produkte/hello-world | localized-product-slug-de | de | product-slug | product-slug | Deutsch | de | de | null |
| /de/same | localized-same | de | same | same | Deutsch | de | de | null |
| /en | localized-index | en | index | index | English | en | en | null |
| /en/change-activity | localized-activity-en | en | activity | activity | English | en | en | null |
| /en/change-activity/book-activity/skiing | localized-activity-skiing-en | en | activity-skiing | activity-skiing | English | en | en | null |
| /en/change-activity/hiking | localized-activity-hiking-en | en | activity-hiking | activity-hiking | English | en | en | null |
| /en/page/42 | localized-page-en | en | page | page | English | en | en | null |
| /en/product/hello-world | localized-product-slug | en | product-slug | product-slug | English | en | en | null |
| /en/same | localized-same | en | same | same | English | en | en | null |
| /fr | localized-index | fr | index | index | Français | fr | fr | null |
| /fr/activity | localized-activity | fr | activity | activity | Français | fr | fr | null |
| /fr/activity/hiking | localized-activity-hiking | fr | activity-hiking | activity-hiking | Français | fr | fr | null |
| /fr/activity/skiing | localized-activity-skiing | fr | activity-skiing | activity-skiing | Français | fr | fr | null |
| /fr/page | localized-page | fr | page | page | Français | fr | fr | null |
| /fr/product/hello-world | localized-product-slug | fr | product-slug | product-slug | Français | fr | fr | null |
| /fr/same | localized-same | fr | same | same | Français | fr | fr | null |
| /page/42 | page | en | page | page | English | null | null | null |
| /product/hello-world | product-slug | en | product-slug | product-slug | English | null | null | null |
| /same | same | en | same | same | English | null | null | null |
| /unlocalized | unlocalized | en | unlocalized | unlocalized | English | null | null | null |
| /en/ | localized-index | en | index | index | English | en | en | null |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | null | en |  | null | English | null | null | null |
| /de/about/ | null | de |  | null | Deutsch | de | de | null |
| /missing | null | en |  | null | English | null | null | null |
| /de/missing | null | de |  | null | Deutsch | de | de | null |
| /xx/about | null | en |  | null | English | null | null | null |
| /de/de/about | null | de |  | null | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en | null |
| /change-activity | /en/change-activity?q=1#top [localized-activity-en] |  | /en/change-activity?q=1#top [localized-activity-en] | /en/change-activity?q=1#top [localized-activity-en] | /en/change-activity | null |
| /change-activity/book-activity/skiing | /en/change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] |  | /en/change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | /en/change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | /en/change-activity/book-activity/skiing | null |
| /change-activity/hiking | /en/change-activity/hiking?q=1#top [localized-activity-hiking-en] |  | /en/change-activity/hiking?q=1#top [localized-activity-hiking-en] | /en/change-activity/hiking?q=1#top [localized-activity-hiking-en] | /en/change-activity/hiking | null |
| /de | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /de | null |
| /de/change-buchen | /en/change-activity?q=1#top [localized-activity-en] |  | /en/change-activity?q=1#top [localized-activity-en] | /en/change-activity?q=1#top [localized-activity-en] | /de/change-buchen | null |
| /de/change-buchen/aktivitaet-buchen/ski-fahren | /en/change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] |  | /en/change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | /en/change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | /de/change-buchen/aktivitaet-buchen/ski-fahren | null |
| /de/change-buchen/hiking | /en/change-activity/hiking?q=1#top [localized-activity-hiking-en] |  | /en/change-activity/hiking?q=1#top [localized-activity-hiking-en] | /en/change-activity/hiking?q=1#top [localized-activity-hiking-en] | /de/change-buchen/hiking | null |
| /de/page/42 | /en/page/42?q=1#top [localized-page-en] | /en/page/42-en?q=1#top [localized-page-en] | /en/page/42?q=1#top [localized-page-en] | /en/page/42?q=1#top [localized-page-en] | /de/page/42 | null |
| /de/produkte/hello-world | /en/product/hello-world?q=1#top [localized-product-slug] | /en/product/hello-world?q=1#top [localized-product-slug] | /en/product/hello-world?q=1#top [localized-product-slug] | /en/product/hello-world?q=1#top [localized-product-slug] | /de/produkte/hello-world | null |
| /de/same | /en/same?q=1#top [localized-same] |  | /en/same?q=1#top [localized-same] | /en/same?q=1#top [localized-same] | /de/same | null |
| /en | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en | null |
| /en/change-activity | /en/change-activity?q=1#top [localized-activity-en] |  | /en/change-activity?q=1#top [localized-activity-en] | /en/change-activity?q=1#top [localized-activity-en] | /en/change-activity | null |
| /en/change-activity/book-activity/skiing | /en/change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] |  | /en/change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | /en/change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | /en/change-activity/book-activity/skiing | null |
| /en/change-activity/hiking | /en/change-activity/hiking?q=1#top [localized-activity-hiking-en] |  | /en/change-activity/hiking?q=1#top [localized-activity-hiking-en] | /en/change-activity/hiking?q=1#top [localized-activity-hiking-en] | /en/change-activity/hiking | null |
| /en/page/42 | /en/page/42?q=1#top [localized-page-en] | /en/page/42-en?q=1#top [localized-page-en] | /en/page/42?q=1#top [localized-page-en] | /en/page/42?q=1#top [localized-page-en] | /en/page/42 | null |
| /en/product/hello-world | /en/product/hello-world?q=1#top [localized-product-slug] | /en/product/hello-world?q=1#top [localized-product-slug] | /en/product/hello-world?q=1#top [localized-product-slug] | /en/product/hello-world?q=1#top [localized-product-slug] | /en/product/hello-world | null |
| /en/same | /en/same?q=1#top [localized-same] |  | /en/same?q=1#top [localized-same] | /en/same?q=1#top [localized-same] | /en/same | null |
| /fr | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /fr | null |
| /fr/activity | /en/change-activity?q=1#top [localized-activity-en] |  | /en/change-activity?q=1#top [localized-activity-en] | /en/change-activity?q=1#top [localized-activity-en] | /fr/activity | null |
| /fr/activity/hiking | /en/change-activity/hiking?q=1#top [localized-activity-hiking-en] |  | /en/change-activity/hiking?q=1#top [localized-activity-hiking-en] | /en/change-activity/hiking?q=1#top [localized-activity-hiking-en] | /fr/activity/hiking | null |
| /fr/activity/skiing | /en/change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] |  | /en/change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | /en/change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | /fr/activity/skiing | null |
| /fr/page | /fr/page?q=1#top [localized-page] |  | /fr/page?q=1#top [localized-page] | — [—] | /fr/page | null |
| /fr/product/hello-world | /en/product/hello-world?q=1#top [localized-product-slug] | /en/product/hello-world?q=1#top [localized-product-slug] | /en/product/hello-world?q=1#top [localized-product-slug] | /en/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world | null |
| /fr/same | /en/same?q=1#top [localized-same] |  | /en/same?q=1#top [localized-same] | /en/same?q=1#top [localized-same] | /fr/same | null |
| /page/42 | /en/page/42?q=1#top [localized-page-en] | /en/page/42-en?q=1#top [localized-page-en] | /en/page/42?q=1#top [localized-page-en] | /en/page/42?q=1#top [localized-page-en] | /en/page/42 | null |
| /product/hello-world | /en/product/hello-world?q=1#top [localized-product-slug] | /en/product/hello-world?q=1#top [localized-product-slug] | /en/product/hello-world?q=1#top [localized-product-slug] | /en/product/hello-world?q=1#top [localized-product-slug] | /en/product/hello-world | null |
| /same | /en/same?q=1#top [localized-same] |  | /en/same?q=1#top [localized-same] | /en/same?q=1#top [localized-same] | /en/same | null |
| /unlocalized | /unlocalized?q=1#top [unlocalized] |  | /unlocalized?q=1#top [unlocalized] | /unlocalized?q=1#top [unlocalized] | /en/unlocalized | null |
| /en/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en/ | null |
| /de/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /de/ | null |
| /about/ | /about/?q=1#top [—] |  | /en/about/?q=1#top [null] | /en/about/?q=1#top [null] | /en/about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /en/about/?q=1#top [null] | /en/about/?q=1#top [null] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | /en/missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /en/xx/about?q=1#top [null] | /en/xx/about?q=1#top [null] | /en/xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /en/de/about?q=1#top [null] | /en/de/about?q=1#top [null] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en | null |
| /change-activity | /de/change-buchen?q=1#top [localized-activity-de] |  | /de/change-buchen?q=1#top [localized-activity-de] | /de/change-buchen?q=1#top [localized-activity-de] | /en/change-activity | null |
| /change-activity/book-activity/skiing | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] |  | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /en/change-activity/book-activity/skiing | null |
| /change-activity/hiking | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] |  | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /en/change-activity/hiking | null |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | null |
| /de/change-buchen | /de/change-buchen?q=1#top [localized-activity-de] |  | /de/change-buchen?q=1#top [localized-activity-de] | /de/change-buchen?q=1#top [localized-activity-de] | /de/change-buchen | null |
| /de/change-buchen/aktivitaet-buchen/ski-fahren | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] |  | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /de/change-buchen/aktivitaet-buchen/ski-fahren | null |
| /de/change-buchen/hiking | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] |  | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /de/change-buchen/hiking | null |
| /de/page/42 | /de/page/42?q=1#top [localized-page-de] | /de/page/42-de?q=1#top [localized-page-de] | /de/page/42?q=1#top [localized-page-de] | /de/page/42?q=1#top [localized-page-de] | /de/page/42 | null |
| /de/produkte/hello-world | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world | null |
| /de/same | /de/same?q=1#top [localized-same] |  | /de/same?q=1#top [localized-same] | /de/same?q=1#top [localized-same] | /de/same | null |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en | null |
| /en/change-activity | /de/change-buchen?q=1#top [localized-activity-de] |  | /de/change-buchen?q=1#top [localized-activity-de] | /de/change-buchen?q=1#top [localized-activity-de] | /en/change-activity | null |
| /en/change-activity/book-activity/skiing | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] |  | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /en/change-activity/book-activity/skiing | null |
| /en/change-activity/hiking | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] |  | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /en/change-activity/hiking | null |
| /en/page/42 | /de/page/42?q=1#top [localized-page-de] | /de/page/42-de?q=1#top [localized-page-de] | /de/page/42?q=1#top [localized-page-de] | /de/page/42?q=1#top [localized-page-de] | /en/page/42 | null |
| /en/product/hello-world | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /en/product/hello-world | null |
| /en/same | /de/same?q=1#top [localized-same] |  | /de/same?q=1#top [localized-same] | /de/same?q=1#top [localized-same] | /en/same | null |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /fr | null |
| /fr/activity | /de/change-buchen?q=1#top [localized-activity-de] |  | /de/change-buchen?q=1#top [localized-activity-de] | /de/change-buchen?q=1#top [localized-activity-de] | /fr/activity | null |
| /fr/activity/hiking | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] |  | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /de/change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /fr/activity/hiking | null |
| /fr/activity/skiing | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] |  | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /de/change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /fr/activity/skiing | null |
| /fr/page | /fr/page?q=1#top [localized-page] |  | /fr/page?q=1#top [localized-page] | — [—] | /fr/page | null |
| /fr/product/hello-world | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /fr/product/hello-world | null |
| /fr/same | /de/same?q=1#top [localized-same] |  | /de/same?q=1#top [localized-same] | /de/same?q=1#top [localized-same] | /fr/same | null |
| /page/42 | /de/page/42?q=1#top [localized-page-de] | /de/page/42-de?q=1#top [localized-page-de] | /de/page/42?q=1#top [localized-page-de] | /de/page/42?q=1#top [localized-page-de] | /en/page/42 | null |
| /product/hello-world | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /de/produkte/hello-world?q=1#top [localized-product-slug-de] | /en/product/hello-world | null |
| /same | /de/same?q=1#top [localized-same] |  | /de/same?q=1#top [localized-same] | /de/same?q=1#top [localized-same] | /en/same | null |
| /unlocalized | /unlocalized?q=1#top [unlocalized] |  | /unlocalized?q=1#top [unlocalized] | /unlocalized?q=1#top [unlocalized] | /en/unlocalized | null |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en/ | null |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de/ | null |
| /about/ | /about/?q=1#top [—] |  | /de/about/?q=1#top [null] | /de/about/?q=1#top [null] | /en/about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /de/about/?q=1#top [null] | /de/about/?q=1#top [null] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /en/missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /en/xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en | null |
| /change-activity | /fr/activity?q=1#top [localized-activity] |  | /fr/activity?q=1#top [localized-activity] | /fr/activity?q=1#top [localized-activity] | /en/change-activity | null |
| /change-activity/book-activity/skiing | /fr/activity/skiing?q=1#top [localized-activity-skiing] |  | /fr/activity/skiing?q=1#top [localized-activity-skiing] | /fr/activity/skiing?q=1#top [localized-activity-skiing] | /en/change-activity/book-activity/skiing | null |
| /change-activity/hiking | /fr/activity/hiking?q=1#top [localized-activity-hiking] |  | /fr/activity/hiking?q=1#top [localized-activity-hiking] | /fr/activity/hiking?q=1#top [localized-activity-hiking] | /en/change-activity/hiking | null |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de | null |
| /de/change-buchen | /fr/activity?q=1#top [localized-activity] |  | /fr/activity?q=1#top [localized-activity] | /fr/activity?q=1#top [localized-activity] | /de/change-buchen | null |
| /de/change-buchen/aktivitaet-buchen/ski-fahren | /fr/activity/skiing?q=1#top [localized-activity-skiing] |  | /fr/activity/skiing?q=1#top [localized-activity-skiing] | /fr/activity/skiing?q=1#top [localized-activity-skiing] | /de/change-buchen/aktivitaet-buchen/ski-fahren | null |
| /de/change-buchen/hiking | /fr/activity/hiking?q=1#top [localized-activity-hiking] |  | /fr/activity/hiking?q=1#top [localized-activity-hiking] | /fr/activity/hiking?q=1#top [localized-activity-hiking] | /de/change-buchen/hiking | null |
| /de/page/42 | /fr/page?q=1#top [localized-page] | /fr/page?q=1#top [localized-page] | /fr/page?q=1#top [localized-page] | /fr/page?q=1#top [localized-page] | /de/page/42 | null |
| /de/produkte/hello-world | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /de/produkte/hello-world | null |
| /de/same | /fr/same?q=1#top [localized-same] |  | /fr/same?q=1#top [localized-same] | /fr/same?q=1#top [localized-same] | /de/same | null |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en | null |
| /en/change-activity | /fr/activity?q=1#top [localized-activity] |  | /fr/activity?q=1#top [localized-activity] | /fr/activity?q=1#top [localized-activity] | /en/change-activity | null |
| /en/change-activity/book-activity/skiing | /fr/activity/skiing?q=1#top [localized-activity-skiing] |  | /fr/activity/skiing?q=1#top [localized-activity-skiing] | /fr/activity/skiing?q=1#top [localized-activity-skiing] | /en/change-activity/book-activity/skiing | null |
| /en/change-activity/hiking | /fr/activity/hiking?q=1#top [localized-activity-hiking] |  | /fr/activity/hiking?q=1#top [localized-activity-hiking] | /fr/activity/hiking?q=1#top [localized-activity-hiking] | /en/change-activity/hiking | null |
| /en/page/42 | /fr/page?q=1#top [localized-page] | /fr/page?q=1#top [localized-page] | /fr/page?q=1#top [localized-page] | /fr/page?q=1#top [localized-page] | /en/page/42 | null |
| /en/product/hello-world | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /en/product/hello-world | null |
| /en/same | /fr/same?q=1#top [localized-same] |  | /fr/same?q=1#top [localized-same] | /fr/same?q=1#top [localized-same] | /en/same | null |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | null |
| /fr/activity | /fr/activity?q=1#top [localized-activity] |  | /fr/activity?q=1#top [localized-activity] | /fr/activity?q=1#top [localized-activity] | /fr/activity | null |
| /fr/activity/hiking | /fr/activity/hiking?q=1#top [localized-activity-hiking] |  | /fr/activity/hiking?q=1#top [localized-activity-hiking] | /fr/activity/hiking?q=1#top [localized-activity-hiking] | /fr/activity/hiking | null |
| /fr/activity/skiing | /fr/activity/skiing?q=1#top [localized-activity-skiing] |  | /fr/activity/skiing?q=1#top [localized-activity-skiing] | /fr/activity/skiing?q=1#top [localized-activity-skiing] | /fr/activity/skiing | null |
| /fr/page | /fr/page?q=1#top [localized-page] |  | /fr/page?q=1#top [localized-page] | /fr/page?q=1#top [localized-page] | /fr/page | null |
| /fr/product/hello-world | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world | null |
| /fr/same | /fr/same?q=1#top [localized-same] |  | /fr/same?q=1#top [localized-same] | /fr/same?q=1#top [localized-same] | /fr/same | null |
| /page/42 | /fr/page?q=1#top [localized-page] | /fr/page?q=1#top [localized-page] | /fr/page?q=1#top [localized-page] | /fr/page?q=1#top [localized-page] | /en/page/42 | null |
| /product/hello-world | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /fr/product/hello-world?q=1#top [localized-product-slug] | /en/product/hello-world | null |
| /same | /fr/same?q=1#top [localized-same] |  | /fr/same?q=1#top [localized-same] | /fr/same?q=1#top [localized-same] | /en/same | null |
| /unlocalized | /unlocalized?q=1#top [unlocalized] |  | /unlocalized?q=1#top [unlocalized] | /unlocalized?q=1#top [unlocalized] | /en/unlocalized | null |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en/ | null |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de/ | null |
| /about/ | /about/?q=1#top [—] |  | /fr/about/?q=1#top [null] | /fr/about/?q=1#top [null] | /en/about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /fr/about/?q=1#top [null] | /fr/about/?q=1#top [null] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /en/missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | /en/xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| activity | /en/change-activity [localized-activity-en] | /de/change-buchen [localized-activity-de] | /fr/activity [localized-activity] | /en/change-activity [localized-activity-en] | /de/change-buchen [localized-activity-de] | /fr/activity [localized-activity] | /en/change-activity [localized-activity-en] | /de/change-buchen [localized-activity-de] | /fr/activity [localized-activity] |
| activity-hiking | /en/change-activity/hiking [localized-activity-hiking-en] | /de/change-buchen/hiking [localized-activity-hiking-de] | /fr/activity/hiking [localized-activity-hiking] | /en/change-activity/hiking [localized-activity-hiking-en] | /de/change-buchen/hiking [localized-activity-hiking-de] | /fr/activity/hiking [localized-activity-hiking] | /en/change-activity/hiking [localized-activity-hiking-en] | /de/change-buchen/hiking [localized-activity-hiking-de] | /fr/activity/hiking [localized-activity-hiking] |
| activity-skiing | /en/change-activity/book-activity/skiing [localized-activity-skiing-en] | /de/change-buchen/aktivitaet-buchen/ski-fahren [localized-activity-skiing-de] | /fr/activity/skiing [localized-activity-skiing] | /en/change-activity/book-activity/skiing [localized-activity-skiing-en] | /de/change-buchen/aktivitaet-buchen/ski-fahren [localized-activity-skiing-de] | /fr/activity/skiing [localized-activity-skiing] | /en/change-activity/book-activity/skiing [localized-activity-skiing-en] | /de/change-buchen/aktivitaet-buchen/ski-fahren [localized-activity-skiing-de] | /fr/activity/skiing [localized-activity-skiing] |
| index | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] |
| page | /en/page/42 [localized-page-en] | /de/page/42 [localized-page-de] | /fr/page [localized-page] | /en/page/42 [localized-page-en] | /de/page/42 [localized-page-de] | /fr/page [localized-page] | /en/page/42 [localized-page-en] | /de/page/42 [localized-page-de] | /fr/page [localized-page] |
| product-slug | /en/product/hello-world [localized-product-slug] | /de/produkte/hello-world [localized-product-slug-de] | /fr/product/hello-world [localized-product-slug] | /en/product/hello-world [localized-product-slug] | /de/produkte/hello-world [localized-product-slug-de] | /fr/product/hello-world [localized-product-slug] | /en/product/hello-world [localized-product-slug] | /de/produkte/hello-world [localized-product-slug-de] | /fr/product/hello-world [localized-product-slug] |
| same | /en/same [localized-same] | /de/same [localized-same] | /fr/same [localized-same] | /en/same [localized-same] | /de/same [localized-same] | /fr/same [localized-same] | /en/same [localized-same] | /de/same [localized-same] | /fr/same [localized-same] |
| unlocalized | /unlocalized [unlocalized] | /unlocalized [unlocalized] | /unlocalized [unlocalized] | /unlocalized [unlocalized] | /unlocalized [unlocalized] | /unlocalized [unlocalized] | /unlocalized [unlocalized] | /unlocalized [unlocalized] | /unlocalized [unlocalized] |

## Invariant breaks (5)

- /de/page/42 → fr → de: round trip ends on /fr/page?q=1#top, not /de/page/42?q=1#top
- /en/page/42 → fr → en: round trip ends on /fr/page?q=1#top, not /en/page/42?q=1#top
- /fr/page → en: switch lands on /fr/page?q=1#top read as fr
- /fr/page → de: switch lands on /fr/page?q=1#top read as fr
- /page/42 → fr → en: round trip ends on /fr/page?q=1#top, not /en/page/42?q=1#top
