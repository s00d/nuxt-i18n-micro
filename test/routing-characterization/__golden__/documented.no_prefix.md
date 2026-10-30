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
| /change-buchen | localized-activity-de | de | activity | activity | Deutsch | null | null | null |
| /change-buchen/aktivitaet-buchen/ski-fahren | localized-activity-skiing-de | de | activity-skiing | activity-skiing | Deutsch | null | null | null |
| /change-buchen/hiking | localized-activity-hiking-de | de | activity-hiking | activity-hiking | Deutsch | null | null | null |
| /page | page | en | page | page | English | null | null | null |
| /page/42 | localized-page-en | en | page | page | English | null | null | null |
| /product/hello-world | product-slug | en | product-slug | product-slug | English | null | null | null |
| /produkte/hello-world | localized-product-slug-de | de | product-slug | product-slug | Deutsch | null | null | null |
| /same | same | en | same | same | English | null | null | null |
| /unlocalized | unlocalized | en | unlocalized | unlocalized | English | null | null | null |
| /en | null | en | index | index | English | en | null | null |
| /en/ | null | en | index | index | English | en | null | null |
| /de | null | en | index | index | English | de | null | null |
| /de/ | null | en | index | index | English | de | null | null |
| /about/ | null | en |  | null | English | null | null | null |
| /de/about/ | null | en |  | null | English | de | null | null |
| /missing | null | en |  | null | English | null | null | null |
| /de/missing | null | en |  | null | English | de | null | null |
| /xx/about | null | en |  | null | English | null | null | null |
| /de/de/about | null | en |  | null | English | de | null | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /activity | /change-activity?q=1#top [localized-activity-en] |  | /change-activity?q=1#top [localized-activity-en] | /change-activity?q=1#top [localized-activity-en] | null | null | fr,en,de |
| /activity/hiking | /change-activity/hiking?q=1#top [localized-activity-hiking-en] |  | /change-activity/hiking?q=1#top [localized-activity-hiking-en] | /change-activity/hiking?q=1#top [localized-activity-hiking-en] | null | null | fr,en,de |
| /activity/skiing | /change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] |  | /change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | /change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | null | null | en,de,fr |
| /change-activity | /change-activity?q=1#top [localized-activity-en] |  | /change-activity?q=1#top [localized-activity-en] | /change-activity?q=1#top [localized-activity-en] | null | null | fr,en,de |
| /change-activity/book-activity/skiing | /change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] |  | /change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | /change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | null | null | en,de,fr |
| /change-activity/hiking | /change-activity/hiking?q=1#top [localized-activity-hiking-en] |  | /change-activity/hiking?q=1#top [localized-activity-hiking-en] | /change-activity/hiking?q=1#top [localized-activity-hiking-en] | null | null | fr,en,de |
| /change-buchen | /change-activity?q=1#top [localized-activity-en] |  | /change-activity?q=1#top [localized-activity-en] | /change-activity?q=1#top [localized-activity-en] | null | null | fr,en,de |
| /change-buchen/aktivitaet-buchen/ski-fahren | /change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] |  | /change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | /change-activity/book-activity/skiing?q=1#top [localized-activity-skiing-en] | null | null | en,de,fr |
| /change-buchen/hiking | /change-activity/hiking?q=1#top [localized-activity-hiking-en] |  | /change-activity/hiking?q=1#top [localized-activity-hiking-en] | /change-activity/hiking?q=1#top [localized-activity-hiking-en] | null | null | fr,en,de |
| /page | / [index] |  | / [index] | / [index] | null | null | en,de,fr |
| /page/42 | /page/42?q=1#top [localized-page-en] | /page/42-en?q=1#top [localized-page-en] | /page/42?q=1#top [localized-page-en] | /page/42?q=1#top [localized-page-en] | null | null | en,de,fr |
| /product/hello-world | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | null | null | en,fr,de |
| /produkte/hello-world | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | null | null | en,fr,de |
| /same | /same?q=1#top [same] |  | /same?q=1#top [same] | /same?q=1#top [same] | null | null | en,de,fr |
| /unlocalized | /unlocalized?q=1#top [unlocalized] |  | /unlocalized?q=1#top [unlocalized] | /unlocalized?q=1#top [unlocalized] | null | null | null |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | null | null | null |
| /de/about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | null | null | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /activity | /change-buchen?q=1#top [localized-activity-de] |  | /change-buchen?q=1#top [localized-activity-de] | /change-buchen?q=1#top [localized-activity-de] | null | null | fr,en,de |
| /activity/hiking | /change-buchen/hiking?q=1#top [localized-activity-hiking-de] |  | /change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /change-buchen/hiking?q=1#top [localized-activity-hiking-de] | null | null | fr,en,de |
| /activity/skiing | /change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] |  | /change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | null | null | en,de,fr |
| /change-activity | /change-buchen?q=1#top [localized-activity-de] |  | /change-buchen?q=1#top [localized-activity-de] | /change-buchen?q=1#top [localized-activity-de] | null | null | fr,en,de |
| /change-activity/book-activity/skiing | /change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] |  | /change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | null | null | en,de,fr |
| /change-activity/hiking | /change-buchen/hiking?q=1#top [localized-activity-hiking-de] |  | /change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /change-buchen/hiking?q=1#top [localized-activity-hiking-de] | null | null | fr,en,de |
| /change-buchen | /change-buchen?q=1#top [localized-activity-de] |  | /change-buchen?q=1#top [localized-activity-de] | /change-buchen?q=1#top [localized-activity-de] | null | null | fr,en,de |
| /change-buchen/aktivitaet-buchen/ski-fahren | /change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] |  | /change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | /change-buchen/aktivitaet-buchen/ski-fahren?q=1#top [localized-activity-skiing-de] | null | null | en,de,fr |
| /change-buchen/hiking | /change-buchen/hiking?q=1#top [localized-activity-hiking-de] |  | /change-buchen/hiking?q=1#top [localized-activity-hiking-de] | /change-buchen/hiking?q=1#top [localized-activity-hiking-de] | null | null | fr,en,de |
| /page | / [index] |  | / [index] | / [index] | null | null | en,de,fr |
| /page/42 | /page/42?q=1#top [localized-page-de] | /page/42-de?q=1#top [localized-page-de] | /page/42?q=1#top [localized-page-de] | /page/42?q=1#top [localized-page-de] | null | null | en,de,fr |
| /product/hello-world | /produkte/hello-world?q=1#top [localized-product-slug-de] | /produkte/hello-world?q=1#top [localized-product-slug-de] | /produkte/hello-world?q=1#top [localized-product-slug-de] | /produkte/hello-world?q=1#top [localized-product-slug-de] | null | null | en,fr,de |
| /produkte/hello-world | /produkte/hello-world?q=1#top [localized-product-slug-de] | /produkte/hello-world?q=1#top [localized-product-slug-de] | /produkte/hello-world?q=1#top [localized-product-slug-de] | /produkte/hello-world?q=1#top [localized-product-slug-de] | null | null | en,fr,de |
| /same | /same?q=1#top [same] |  | /same?q=1#top [same] | /same?q=1#top [same] | null | null | en,de,fr |
| /unlocalized | /unlocalized?q=1#top [unlocalized] |  | /unlocalized?q=1#top [unlocalized] | /unlocalized?q=1#top [unlocalized] | null | null | null |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | null | null | null |
| /de/about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | null | null | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /activity | /activity?q=1#top [activity] |  | /activity?q=1#top [activity] | /activity?q=1#top [activity] | null | null | fr,en,de |
| /activity/hiking | /activity/hiking?q=1#top [activity-hiking] |  | /activity/hiking?q=1#top [activity-hiking] | /activity/hiking?q=1#top [activity-hiking] | null | null | fr,en,de |
| /activity/skiing | /activity/skiing?q=1#top [activity-skiing] |  | /activity/skiing?q=1#top [activity-skiing] | /activity/skiing?q=1#top [activity-skiing] | null | null | en,de,fr |
| /change-activity | /activity?q=1#top [activity] |  | /activity?q=1#top [activity] | /activity?q=1#top [activity] | null | null | fr,en,de |
| /change-activity/book-activity/skiing | /activity/skiing?q=1#top [activity-skiing] |  | /activity/skiing?q=1#top [activity-skiing] | /activity/skiing?q=1#top [activity-skiing] | null | null | en,de,fr |
| /change-activity/hiking | /activity/hiking?q=1#top [activity-hiking] |  | /activity/hiking?q=1#top [activity-hiking] | /activity/hiking?q=1#top [activity-hiking] | null | null | fr,en,de |
| /change-buchen | /activity?q=1#top [activity] |  | /activity?q=1#top [activity] | /activity?q=1#top [activity] | null | null | fr,en,de |
| /change-buchen/aktivitaet-buchen/ski-fahren | /activity/skiing?q=1#top [activity-skiing] |  | /activity/skiing?q=1#top [activity-skiing] | /activity/skiing?q=1#top [activity-skiing] | null | null | en,de,fr |
| /change-buchen/hiking | /activity/hiking?q=1#top [activity-hiking] |  | /activity/hiking?q=1#top [activity-hiking] | /activity/hiking?q=1#top [activity-hiking] | null | null | fr,en,de |
| /page | /page?q=1#top [page] |  | /page?q=1#top [page] | /page?q=1#top [page] | null | null | en,de,fr |
| /page/42 | /page?q=1#top [page] | /page?q=1#top [page] | /page?q=1#top [page] | /page?q=1#top [page] | null | null | en,de,fr |
| /product/hello-world | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | null | null | en,fr,de |
| /produkte/hello-world | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | /product/hello-world?q=1#top [product-slug] | null | null | en,fr,de |
| /same | /same?q=1#top [same] |  | /same?q=1#top [same] | /same?q=1#top [same] | null | null | en,de,fr |
| /unlocalized | /unlocalized?q=1#top [unlocalized] |  | /unlocalized?q=1#top [unlocalized] | /unlocalized?q=1#top [unlocalized] | null | null | null |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | null | null | null |
| /de/about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | null | null | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |

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

- /page/42 → fr → en: round trip ends on /, not /page/42?q=1#top
