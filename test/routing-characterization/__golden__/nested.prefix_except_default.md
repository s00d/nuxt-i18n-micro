# nested · prefix_except_default

parent pages with child routes: translated parents, relative and full-URL child values, an index child, deep nesting

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| — | /account |  |  |
| · account |  |  |  |
| · account-settings | settings |  |  |
| · account-orders | orders |  |  |
| · · account-orders-id | :id() |  |  |
| shop | /store | /shop |  |
| · shop-category | :category() |  |  |
| · · shop-category-item | :item() |  |  |
| localized-index | /:locale(de\|fr) |  |  |
| — | /:locale(de)/konto |  |  |
| · localized-account-de |  |  |  |
| · localized-account-settings-de | einstellungen |  |  |
| · localized-account-orders-de | bestellungen |  |  |
| · · localized-account-orders-id-de | :id() |  |  |
| — | /:locale(fr)/compte |  |  |
| · localized-account-fr |  |  |  |
| · localized-account-settings-fr | parametres |  |  |
| · localized-account-orders-fr | orders |  |  |
| · · localized-account-orders-id-fr | :id() |  |  |
| localized-shop | /:locale(fr)/shop |  |  |
| · localized-shop-category | :category() |  |  |
| · · localized-shop-category-item | :item() |  |  |
| localized-shop-de | /:locale(de)/laden |  |  |
| · localized-shop-category-de | :category() |  |  |
| · · localized-shop-category-item-de | artikel/:item |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | en | null |
| /account | account | en | account | account | English | null | en | null |
| /account/orders | account-orders | en | account-orders | account-orders | English | null | en | null |
| /account/orders/42 | account-orders-id | en | account-orders-id | account-orders-id | English | null | en | null |
| /account/settings | account-settings | en | account-settings | account-settings | English | null | en | null |
| /de | localized-index | de | index | index | Deutsch | de | de | null |
| /de/konto | localized-account-de | de | account | account | Deutsch | de | de | null |
| /de/konto/bestellungen | localized-account-orders-de | de | account-orders | account-orders | Deutsch | de | de | null |
| /de/konto/bestellungen/42 | localized-account-orders-id-de | de | account-orders-id | account-orders-id | Deutsch | de | de | null |
| /de/konto/einstellungen | localized-account-settings-de | de | account-settings | account-settings | Deutsch | de | de | null |
| /de/laden | localized-shop-de | de | shop | shop | Deutsch | de | de | null |
| /de/laden/shoes | localized-shop-category-de | de | shop-category | shop-category | Deutsch | de | de | null |
| /de/laden/shoes/artikel/red-boot | localized-shop-category-item-de | de | shop-category-item | shop-category-item | Deutsch | de | de | null |
| /fr | localized-index | fr | index | index | Français | fr | fr | null |
| /fr/compte | localized-account-fr | fr | account | account | Français | fr | fr | null |
| /fr/compte/orders | localized-account-orders-fr | fr | account-orders | account-orders | Français | fr | fr | null |
| /fr/compte/orders/42 | localized-account-orders-id-fr | fr | account-orders-id | account-orders-id | Français | fr | fr | null |
| /fr/compte/parametres | localized-account-settings-fr | fr | account-settings | account-settings | Français | fr | fr | null |
| /fr/shop | localized-shop | fr | shop | shop | Français | fr | fr | null |
| /fr/shop/shoes | localized-shop-category | fr | shop-category | shop-category | Français | fr | fr | null |
| /fr/shop/shoes/red-boot | localized-shop-category-item | fr | shop-category-item | shop-category-item | Français | fr | fr | null |
| /shop | shop | en | shop | shop | English | null | en | null |
| /shop/shoes | shop-category | en | shop-category | shop-category | English | null | en | null |
| /shop/shoes/red-boot | shop-category-item | en | shop-category-item | shop-category-item | English | null | en | null |
| /store | shop | en | shop | shop | English | null | en | null |
| /store/shoes | shop-category | en | shop-category | shop-category | English | null | en | null |
| /store/shoes/red-boot | shop-category-item | en | shop-category-item | shop-category-item | English | null | en | null |
| /en | null | en | index | index | English | en | en | Default locale should not have prefix |
| /en/ | null | en | index | index | English | en | en | Default locale should not have prefix |
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
| /account | /account?q=1#top [account] |  | /account?q=1#top [account] | /account?q=1#top [account] | /account | null |
| /account/orders | /account/orders?q=1#top [account-orders] |  | /account/orders?q=1#top [account-orders] | /account/orders?q=1#top [account-orders] | /account/orders | null |
| /account/orders/42 | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42-en?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42 | null |
| /account/settings | /account/settings?q=1#top [account-settings] |  | /account/settings?q=1#top [account-settings] | /account/settings?q=1#top [account-settings] | /account/settings | null |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/konto | /account?q=1#top [account] |  | /account?q=1#top [account] | /account?q=1#top [account] | /de/konto | null |
| /de/konto/bestellungen | /account/orders?q=1#top [account-orders] |  | /account/orders?q=1#top [account-orders] | /account/orders?q=1#top [account-orders] | /de/konto/bestellungen | null |
| /de/konto/bestellungen/42 | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42-en?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | /de/konto/bestellungen/42 | null |
| /de/konto/einstellungen | /account/settings?q=1#top [account-settings] |  | /account/settings?q=1#top [account-settings] | /account/settings?q=1#top [account-settings] | /de/konto/einstellungen | null |
| /de/laden | /store?q=1#top [shop] |  | /store?q=1#top [shop] | /store?q=1#top [shop] | /de/laden | null |
| /de/laden/shoes | /store/shoes?q=1#top [shop-category] | /store/shoes-en?q=1#top [shop-category] | /store/shoes?q=1#top [shop-category] | /store/shoes?q=1#top [shop-category] | /de/laden/shoes | null |
| /de/laden/shoes/artikel/red-boot | /store/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes-en/red-boot-en?q=1#top [shop-category-item] | /store/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes/red-boot?q=1#top [shop-category-item] | /de/laden/shoes/artikel/red-boot | null |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /fr | null |
| /fr/compte | /account?q=1#top [account] |  | /account?q=1#top [account] | /account?q=1#top [account] | /fr/compte | null |
| /fr/compte/orders | /account/orders?q=1#top [account-orders] |  | /account/orders?q=1#top [account-orders] | /account/orders?q=1#top [account-orders] | /fr/compte/orders | null |
| /fr/compte/orders/42 | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42-en?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | /fr/compte/orders/42 | null |
| /fr/compte/parametres | /account/settings?q=1#top [account-settings] |  | /account/settings?q=1#top [account-settings] | /account/settings?q=1#top [account-settings] | /fr/compte/parametres | null |
| /fr/shop | /store?q=1#top [shop] |  | /store?q=1#top [shop] | /store?q=1#top [shop] | /fr/shop | null |
| /fr/shop/shoes | /store/shoes?q=1#top [shop-category] | /store/shoes-en?q=1#top [shop-category] | /store/shoes?q=1#top [shop-category] | /store/shoes?q=1#top [shop-category] | /fr/shop/shoes | null |
| /fr/shop/shoes/red-boot | /store/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes-en/red-boot-en?q=1#top [shop-category-item] | /store/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes/red-boot?q=1#top [shop-category-item] | /fr/shop/shoes/red-boot | null |
| /shop | /store?q=1#top [shop] |  | /store?q=1#top [shop] | /store?q=1#top [shop] | /shop | /store |
| /shop/shoes | /store/shoes?q=1#top [shop-category] | /store/shoes-en?q=1#top [shop-category] | /store/shoes?q=1#top [shop-category] | /store/shoes?q=1#top [shop-category] | /shop/shoes | /store/shoes |
| /shop/shoes/red-boot | /store/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes-en/red-boot-en?q=1#top [shop-category-item] | /store/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes/red-boot?q=1#top [shop-category-item] | /shop/shoes/red-boot | /store/shoes/red-boot |
| /store | /store?q=1#top [shop] |  | /store?q=1#top [shop] | /store?q=1#top [shop] | /store | null |
| /store/shoes | /store/shoes?q=1#top [shop-category] | /store/shoes-en?q=1#top [shop-category] | /store/shoes?q=1#top [shop-category] | /store/shoes?q=1#top [shop-category] | /store/shoes | null |
| /store/shoes/red-boot | /store/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes-en/red-boot-en?q=1#top [shop-category-item] | /store/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes/red-boot | null |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | /about/ | null |
| /de/about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | / | /de |
| /account | /de/konto?q=1#top [localized-account-de] |  | /de/konto?q=1#top [localized-account-de] | /de/konto?q=1#top [localized-account-de] | /account | /de/konto |
| /account/orders | /de/konto/bestellungen?q=1#top [localized-account-orders-de] |  | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | /account/orders | /de/konto/bestellungen |
| /account/orders/42 | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42-de?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /account/orders/42 | /de/konto/bestellungen/42 |
| /account/settings | /de/konto/einstellungen?q=1#top [localized-account-settings-de] |  | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | /account/settings | /de/konto/einstellungen |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | null |
| /de/konto | /de/konto?q=1#top [localized-account-de] |  | /de/konto?q=1#top [localized-account-de] | /de/konto?q=1#top [localized-account-de] | /de/konto | null |
| /de/konto/bestellungen | /de/konto/bestellungen?q=1#top [localized-account-orders-de] |  | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | /de/konto/bestellungen | null |
| /de/konto/bestellungen/42 | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42-de?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42 | null |
| /de/konto/einstellungen | /de/konto/einstellungen?q=1#top [localized-account-settings-de] |  | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | /de/konto/einstellungen | null |
| /de/laden | /de/laden?q=1#top [localized-shop-de] |  | /de/laden?q=1#top [localized-shop-de] | /de/laden?q=1#top [localized-shop-de] | /de/laden | null |
| /de/laden/shoes | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes-de?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes | null |
| /de/laden/shoes/artikel/red-boot | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes-de/artikel/red-boot-de?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot | null |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /fr | null |
| /fr/compte | /de/konto?q=1#top [localized-account-de] |  | /de/konto?q=1#top [localized-account-de] | /de/konto?q=1#top [localized-account-de] | /fr/compte | null |
| /fr/compte/orders | /de/konto/bestellungen?q=1#top [localized-account-orders-de] |  | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | /fr/compte/orders | null |
| /fr/compte/orders/42 | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42-de?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /fr/compte/orders/42 | null |
| /fr/compte/parametres | /de/konto/einstellungen?q=1#top [localized-account-settings-de] |  | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | /fr/compte/parametres | null |
| /fr/shop | /de/laden?q=1#top [localized-shop-de] |  | /de/laden?q=1#top [localized-shop-de] | /de/laden?q=1#top [localized-shop-de] | /fr/shop | null |
| /fr/shop/shoes | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes-de?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | /fr/shop/shoes | null |
| /fr/shop/shoes/red-boot | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes-de/artikel/red-boot-de?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /fr/shop/shoes/red-boot | null |
| /shop | /de/laden?q=1#top [localized-shop-de] |  | /de/laden?q=1#top [localized-shop-de] | /de/laden?q=1#top [localized-shop-de] | /shop | /de/laden |
| /shop/shoes | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes-de?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | /shop/shoes | /de/laden/shoes |
| /shop/shoes/red-boot | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes-de/artikel/red-boot-de?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /shop/shoes/red-boot | /de/laden/shoes/artikel/red-boot |
| /store | /de/laden?q=1#top [localized-shop-de] |  | /de/laden?q=1#top [localized-shop-de] | /de/laden?q=1#top [localized-shop-de] | /store | /de/laden |
| /store/shoes | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes-de?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | /store/shoes | /de/laden/shoes |
| /store/shoes/red-boot | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes-de/artikel/red-boot-de?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /store/shoes/red-boot | /de/laden/shoes/artikel/red-boot |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en | null |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en/ | null |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de/ | null |
| /about/ | /de/about/?q=1#top [—] |  | /de/about/?q=1#top [null] | /de/about/?q=1#top [null] | /about/ | /de/about |
| /de/about/ | /de/about/?q=1#top [—] |  | /de/about/?q=1#top [null] | /de/about/?q=1#top [null] | /de/about/ | null |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /missing | /de/missing |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /xx/about | /de/xx/about |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | / | /fr |
| /account | /fr/compte?q=1#top [localized-account-fr] |  | /fr/compte?q=1#top [localized-account-fr] | /fr/compte?q=1#top [localized-account-fr] | /account | /fr/compte |
| /account/orders | /fr/compte/orders?q=1#top [localized-account-orders-fr] |  | /fr/compte/orders?q=1#top [localized-account-orders-fr] | /fr/compte/orders?q=1#top [localized-account-orders-fr] | /account/orders | /fr/compte/orders |
| /account/orders/42 | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42-fr?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /account/orders/42 | /fr/compte/orders/42 |
| /account/settings | /fr/compte/parametres?q=1#top [localized-account-settings-fr] |  | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | /account/settings | /fr/compte/parametres |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de | null |
| /de/konto | /fr/compte?q=1#top [localized-account-fr] |  | /fr/compte?q=1#top [localized-account-fr] | /fr/compte?q=1#top [localized-account-fr] | /de/konto | null |
| /de/konto/bestellungen | /fr/compte/orders?q=1#top [localized-account-orders-fr] |  | /fr/compte/orders?q=1#top [localized-account-orders-fr] | /fr/compte/orders?q=1#top [localized-account-orders-fr] | /de/konto/bestellungen | null |
| /de/konto/bestellungen/42 | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42-fr?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /de/konto/bestellungen/42 | null |
| /de/konto/einstellungen | /fr/compte/parametres?q=1#top [localized-account-settings-fr] |  | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | /de/konto/einstellungen | null |
| /de/laden | /fr/shop?q=1#top [localized-shop] |  | /fr/shop?q=1#top [localized-shop] | /fr/shop?q=1#top [localized-shop] | /de/laden | null |
| /de/laden/shoes | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes-fr?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | /de/laden/shoes | null |
| /de/laden/shoes/artikel/red-boot | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes-fr/red-boot-fr?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /de/laden/shoes/artikel/red-boot | null |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | null |
| /fr/compte | /fr/compte?q=1#top [localized-account-fr] |  | /fr/compte?q=1#top [localized-account-fr] | /fr/compte?q=1#top [localized-account-fr] | /fr/compte | null |
| /fr/compte/orders | /fr/compte/orders?q=1#top [localized-account-orders-fr] |  | /fr/compte/orders?q=1#top [localized-account-orders-fr] | /fr/compte/orders?q=1#top [localized-account-orders-fr] | /fr/compte/orders | null |
| /fr/compte/orders/42 | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42-fr?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42 | null |
| /fr/compte/parametres | /fr/compte/parametres?q=1#top [localized-account-settings-fr] |  | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | /fr/compte/parametres | null |
| /fr/shop | /fr/shop?q=1#top [localized-shop] |  | /fr/shop?q=1#top [localized-shop] | /fr/shop?q=1#top [localized-shop] | /fr/shop | null |
| /fr/shop/shoes | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes-fr?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes | null |
| /fr/shop/shoes/red-boot | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes-fr/red-boot-fr?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot | null |
| /shop | /fr/shop?q=1#top [localized-shop] |  | /fr/shop?q=1#top [localized-shop] | /fr/shop?q=1#top [localized-shop] | /shop | /fr/shop |
| /shop/shoes | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes-fr?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | /shop/shoes | /fr/shop/shoes |
| /shop/shoes/red-boot | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes-fr/red-boot-fr?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /shop/shoes/red-boot | /fr/shop/shoes/red-boot |
| /store | /fr/shop?q=1#top [localized-shop] |  | /fr/shop?q=1#top [localized-shop] | /fr/shop?q=1#top [localized-shop] | /store | /fr/shop |
| /store/shoes | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes-fr?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | /store/shoes | /fr/shop/shoes |
| /store/shoes/red-boot | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes-fr/red-boot-fr?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /store/shoes/red-boot | /fr/shop/shoes/red-boot |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en | null |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en/ | null |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de/ | null |
| /about/ | /fr/about/?q=1#top [—] |  | /fr/about/?q=1#top [null] | /fr/about/?q=1#top [null] | /about/ | /fr/about |
| /de/about/ | /fr/about/?q=1#top [—] |  | /fr/about/?q=1#top [null] | /fr/about/?q=1#top [null] | /de/about/ | null |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /missing | /fr/missing |
| /de/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | /xx/about | /fr/xx/about |
| /de/de/about | /fr/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| account | /account [account] | /de/konto [localized-account-de] | /fr/compte [localized-account-fr] | /account [account] | /de/konto [localized-account-de] | /fr/compte [localized-account-fr] | /account [account] | /de/konto [localized-account-de] | /fr/compte [localized-account-fr] |
| account-orders | /account/orders [account-orders] | /de/konto/bestellungen [localized-account-orders-de] | /fr/compte/orders [localized-account-orders-fr] | /account/orders [account-orders] | /de/konto/bestellungen [localized-account-orders-de] | /fr/compte/orders [localized-account-orders-fr] | /account/orders [account-orders] | /de/konto/bestellungen [localized-account-orders-de] | /fr/compte/orders [localized-account-orders-fr] |
| account-orders-id | /account/orders/42 [account-orders-id] | /de/konto/bestellungen/42 [localized-account-orders-id-de] | /fr/compte/orders/42 [localized-account-orders-id-fr] | /account/orders/42 [account-orders-id] | /de/konto/bestellungen/42 [localized-account-orders-id-de] | /fr/compte/orders/42 [localized-account-orders-id-fr] | /account/orders/42 [account-orders-id] | /de/konto/bestellungen/42 [localized-account-orders-id-de] | /fr/compte/orders/42 [localized-account-orders-id-fr] |
| account-settings | /account/settings [account-settings] | /de/konto/einstellungen [localized-account-settings-de] | /fr/compte/parametres [localized-account-settings-fr] | /account/settings [account-settings] | /de/konto/einstellungen [localized-account-settings-de] | /fr/compte/parametres [localized-account-settings-fr] | /account/settings [account-settings] | /de/konto/einstellungen [localized-account-settings-de] | /fr/compte/parametres [localized-account-settings-fr] |
| index | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] |
| shop | /store [shop] | /de/laden [localized-shop-de] | /fr/shop [localized-shop] | /store [shop] | /de/laden [localized-shop-de] | /fr/shop [localized-shop] | /store [shop] | /de/laden [localized-shop-de] | /fr/shop [localized-shop] |
| shop-category | /store/shoes [shop-category] | /de/laden/shoes [localized-shop-category-de] | /fr/shop/shoes [localized-shop-category] | /store/shoes [shop-category] | /de/laden/shoes [localized-shop-category-de] | /fr/shop/shoes [localized-shop-category] | /store/shoes [shop-category] | /de/laden/shoes [localized-shop-category-de] | /fr/shop/shoes [localized-shop-category] |
| shop-category-item | /store/shoes/red-boot [shop-category-item] | /de/laden/shoes/artikel/red-boot [localized-shop-category-item-de] | /fr/shop/shoes/red-boot [localized-shop-category-item] | /store/shoes/red-boot [shop-category-item] | /de/laden/shoes/artikel/red-boot [localized-shop-category-item-de] | /fr/shop/shoes/red-boot [localized-shop-category-item] | /store/shoes/red-boot [shop-category-item] | /de/laden/shoes/artikel/red-boot [localized-shop-category-item-de] | /fr/shop/shoes/red-boot [localized-shop-category-item] |

## Invariant breaks (0)

none
