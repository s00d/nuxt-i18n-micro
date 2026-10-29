# nested · no_prefix

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
| shop | /shop |  |  |
| · shop-category | :category() |  |  |
| · · shop-category-item | :item() |  |  |
| — | /konto |  |  |
| · localized-account-de |  |  |  |
| · localized-account-settings-de | einstellungen |  |  |
| · localized-account-orders-de | bestellungen |  |  |
| · · localized-account-orders-id-de | :id() |  |  |
| — | /compte |  |  |
| · localized-account-fr |  |  |  |
| · localized-account-settings-fr | parametres |  |  |
| · localized-account-orders-fr | orders |  |  |
| · · localized-account-orders-id-fr | :id() |  |  |
| localized-shop-en | /store |  |  |
| · localized-shop-category-en | :category() |  |  |
| · · localized-shop-category-item-en | :item() |  |  |
| localized-shop-de | /laden |  |  |
| · localized-shop-category-de | :category() |  |  |
| · · localized-shop-category-item-de | artikel/:item |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | null | null |
| /account | account | en | account | account | English | null | null | null |
| /account/orders | account-orders | en | account-orders | account-orders | English | null | null | null |
| /account/orders/42 | account-orders-id | en | account-orders-id | account-orders-id | English | null | null | null |
| /account/settings | account-settings | en | account-settings | account-settings | English | null | null | null |
| /compte | localized-account-fr | en | account | account | English | null | null | null |
| /compte/orders | localized-account-orders-fr | en | account-orders | account-orders | English | null | null | null |
| /compte/orders/42 | localized-account-orders-id-fr | en | account-orders-id | account-orders-id | English | null | null | null |
| /compte/parametres | localized-account-settings-fr | en | account-settings | account-settings | English | null | null | null |
| /konto | localized-account-de | en | account | account | English | null | null | null |
| /konto/bestellungen | localized-account-orders-de | en | account-orders | account-orders | English | null | null | null |
| /konto/bestellungen/42 | localized-account-orders-id-de | en | account-orders-id | account-orders-id | English | null | null | null |
| /konto/einstellungen | localized-account-settings-de | en | account-settings | account-settings | English | null | null | null |
| /laden | localized-shop-de | en | shop | shop | English | null | null | null |
| /laden/shoes | localized-shop-category-de | en | shop-category | shop-category | English | null | null | null |
| /laden/shoes/artikel/red-boot | localized-shop-category-item-de | en | shop-category-item | shop-category-item | English | null | null | null |
| /shop | shop | en | shop | shop | English | null | null | null |
| /shop/shoes | shop-category | en | shop-category | shop-category | English | null | null | null |
| /shop/shoes/red-boot | shop-category-item | en | shop-category-item | shop-category-item | English | null | null | null |
| /store | localized-shop-en | en | shop | shop | English | null | null | null |
| /store/shoes | localized-shop-category-en | en | shop-category | shop-category | English | null | null | null |
| /store/shoes/red-boot | localized-shop-category-item-en | en | shop-category-item | shop-category-item | English | null | null | null |
| /en | null | en |  | index | English | en | null | null |
| /en/ | null | en |  | index | English | en | null | null |
| /de | null | en |  | index | English | de | null | null |
| /de/ | null | en |  | index | English | de | null | null |
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
| /account | /account?q=1#top [account] |  | /account?q=1#top [account] | /account?q=1#top [account] | /account | null |
| /account/orders | /account/orders?q=1#top [account-orders] |  | /account/orders?q=1#top [account-orders] | /account/orders?q=1#top [account-orders] | /account/orders | null |
| /account/orders/42 | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42-en?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42 | null |
| /account/settings | /account/settings?q=1#top [account-settings] |  | /account/settings?q=1#top [account-settings] | /account/settings?q=1#top [account-settings] | /account/settings | null |
| /compte | /account?q=1#top [account] |  | /account?q=1#top [account] | /account?q=1#top [account] | /compte | null |
| /compte/orders | /account/orders?q=1#top [account-orders] |  | /account/orders?q=1#top [account-orders] | /account/orders?q=1#top [account-orders] | /compte/orders | null |
| /compte/orders/42 | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42-en?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | /compte/orders/42 | null |
| /compte/parametres | /account/settings?q=1#top [account-settings] |  | /account/settings?q=1#top [account-settings] | /account/settings?q=1#top [account-settings] | /compte/parametres | null |
| /konto | /account?q=1#top [account] |  | /account?q=1#top [account] | /account?q=1#top [account] | /konto | null |
| /konto/bestellungen | /account/orders?q=1#top [account-orders] |  | /account/orders?q=1#top [account-orders] | /account/orders?q=1#top [account-orders] | /konto/bestellungen | null |
| /konto/bestellungen/42 | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42-en?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | /konto/bestellungen/42 | null |
| /konto/einstellungen | /account/settings?q=1#top [account-settings] |  | /account/settings?q=1#top [account-settings] | /account/settings?q=1#top [account-settings] | /konto/einstellungen | null |
| /laden | /store?q=1#top [localized-shop-en] |  | /store?q=1#top [localized-shop-en] | /store?q=1#top [localized-shop-en] | /laden | null |
| /laden/shoes | /store/shoes?q=1#top [localized-shop-category-en] | /store/shoes-en?q=1#top [localized-shop-category-en] | /store/shoes?q=1#top [localized-shop-category-en] | /store/shoes?q=1#top [localized-shop-category-en] | /laden/shoes | null |
| /laden/shoes/artikel/red-boot | /store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /store/shoes-en/red-boot-en?q=1#top [localized-shop-category-item-en] | /store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /laden/shoes/artikel/red-boot | null |
| /shop | /store?q=1#top [localized-shop-en] |  | /store?q=1#top [localized-shop-en] | /store?q=1#top [localized-shop-en] | /shop | null |
| /shop/shoes | /store/shoes?q=1#top [localized-shop-category-en] | /store/shoes-en?q=1#top [localized-shop-category-en] | /store/shoes?q=1#top [localized-shop-category-en] | /store/shoes?q=1#top [localized-shop-category-en] | /shop/shoes | null |
| /shop/shoes/red-boot | /store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /store/shoes-en/red-boot-en?q=1#top [localized-shop-category-item-en] | /store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /shop/shoes/red-boot | null |
| /store | /store?q=1#top [localized-shop-en] |  | /store?q=1#top [localized-shop-en] | /store?q=1#top [localized-shop-en] | /store | null |
| /store/shoes | /store/shoes?q=1#top [localized-shop-category-en] | /store/shoes-en?q=1#top [localized-shop-category-en] | /store/shoes?q=1#top [localized-shop-category-en] | /store/shoes?q=1#top [localized-shop-category-en] | /store/shoes | null |
| /store/shoes/red-boot | /store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /store/shoes-en/red-boot-en?q=1#top [localized-shop-category-item-en] | /store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /store/shoes/red-boot | null |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
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
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /account | /konto?q=1#top [localized-account-de] |  | /konto?q=1#top [localized-account-de] | /konto?q=1#top [localized-account-de] | /account | null |
| /account/orders | /konto/bestellungen?q=1#top [localized-account-orders-de] |  | /konto/bestellungen?q=1#top [localized-account-orders-de] | /konto/bestellungen?q=1#top [localized-account-orders-de] | /account/orders | null |
| /account/orders/42 | /konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42-de?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /account/orders/42 | null |
| /account/settings | /konto/einstellungen?q=1#top [localized-account-settings-de] |  | /konto/einstellungen?q=1#top [localized-account-settings-de] | /konto/einstellungen?q=1#top [localized-account-settings-de] | /account/settings | null |
| /compte | /konto?q=1#top [localized-account-de] |  | /konto?q=1#top [localized-account-de] | /konto?q=1#top [localized-account-de] | /compte | null |
| /compte/orders | /konto/bestellungen?q=1#top [localized-account-orders-de] |  | /konto/bestellungen?q=1#top [localized-account-orders-de] | /konto/bestellungen?q=1#top [localized-account-orders-de] | /compte/orders | null |
| /compte/orders/42 | /konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42-de?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /compte/orders/42 | null |
| /compte/parametres | /konto/einstellungen?q=1#top [localized-account-settings-de] |  | /konto/einstellungen?q=1#top [localized-account-settings-de] | /konto/einstellungen?q=1#top [localized-account-settings-de] | /compte/parametres | null |
| /konto | /konto?q=1#top [localized-account-de] |  | /konto?q=1#top [localized-account-de] | /konto?q=1#top [localized-account-de] | /konto | null |
| /konto/bestellungen | /konto/bestellungen?q=1#top [localized-account-orders-de] |  | /konto/bestellungen?q=1#top [localized-account-orders-de] | /konto/bestellungen?q=1#top [localized-account-orders-de] | /konto/bestellungen | null |
| /konto/bestellungen/42 | /konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42-de?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42 | null |
| /konto/einstellungen | /konto/einstellungen?q=1#top [localized-account-settings-de] |  | /konto/einstellungen?q=1#top [localized-account-settings-de] | /konto/einstellungen?q=1#top [localized-account-settings-de] | /konto/einstellungen | null |
| /laden | /laden?q=1#top [localized-shop-de] |  | /laden?q=1#top [localized-shop-de] | /laden?q=1#top [localized-shop-de] | /laden | null |
| /laden/shoes | /laden/shoes?q=1#top [localized-shop-category-de] | /laden/shoes-de?q=1#top [localized-shop-category-de] | /laden/shoes?q=1#top [localized-shop-category-de] | /laden/shoes?q=1#top [localized-shop-category-de] | /laden/shoes | null |
| /laden/shoes/artikel/red-boot | /laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /laden/shoes-de/artikel/red-boot-de?q=1#top [localized-shop-category-item-de] | /laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /laden/shoes/artikel/red-boot | null |
| /shop | /laden?q=1#top [localized-shop-de] |  | /laden?q=1#top [localized-shop-de] | /laden?q=1#top [localized-shop-de] | /shop | null |
| /shop/shoes | /laden/shoes?q=1#top [localized-shop-category-de] | /laden/shoes-de?q=1#top [localized-shop-category-de] | /laden/shoes?q=1#top [localized-shop-category-de] | /laden/shoes?q=1#top [localized-shop-category-de] | /shop/shoes | null |
| /shop/shoes/red-boot | /laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /laden/shoes-de/artikel/red-boot-de?q=1#top [localized-shop-category-item-de] | /laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /shop/shoes/red-boot | null |
| /store | /laden?q=1#top [localized-shop-de] |  | /laden?q=1#top [localized-shop-de] | /laden?q=1#top [localized-shop-de] | /store | null |
| /store/shoes | /laden/shoes?q=1#top [localized-shop-category-de] | /laden/shoes-de?q=1#top [localized-shop-category-de] | /laden/shoes?q=1#top [localized-shop-category-de] | /laden/shoes?q=1#top [localized-shop-category-de] | /store/shoes | null |
| /store/shoes/red-boot | /laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /laden/shoes-de/artikel/red-boot-de?q=1#top [localized-shop-category-item-de] | /laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /store/shoes/red-boot | null |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | /about/ | null |
| /de/about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /account | /compte?q=1#top [localized-account-fr] |  | /compte?q=1#top [localized-account-fr] | /compte?q=1#top [localized-account-fr] | /account | null |
| /account/orders | /compte/orders?q=1#top [localized-account-orders-fr] |  | /compte/orders?q=1#top [localized-account-orders-fr] | /compte/orders?q=1#top [localized-account-orders-fr] | /account/orders | null |
| /account/orders/42 | /compte/orders/42?q=1#top [localized-account-orders-id-fr] | /compte/orders/42-fr?q=1#top [localized-account-orders-id-fr] | /compte/orders/42?q=1#top [localized-account-orders-id-fr] | /compte/orders/42?q=1#top [localized-account-orders-id-fr] | /account/orders/42 | null |
| /account/settings | /compte/parametres?q=1#top [localized-account-settings-fr] |  | /compte/parametres?q=1#top [localized-account-settings-fr] | /compte/parametres?q=1#top [localized-account-settings-fr] | /account/settings | null |
| /compte | /compte?q=1#top [localized-account-fr] |  | /compte?q=1#top [localized-account-fr] | /compte?q=1#top [localized-account-fr] | /compte | null |
| /compte/orders | /compte/orders?q=1#top [localized-account-orders-fr] |  | /compte/orders?q=1#top [localized-account-orders-fr] | /compte/orders?q=1#top [localized-account-orders-fr] | /compte/orders | null |
| /compte/orders/42 | /compte/orders/42?q=1#top [localized-account-orders-id-fr] | /compte/orders/42-fr?q=1#top [localized-account-orders-id-fr] | /compte/orders/42?q=1#top [localized-account-orders-id-fr] | /compte/orders/42?q=1#top [localized-account-orders-id-fr] | /compte/orders/42 | null |
| /compte/parametres | /compte/parametres?q=1#top [localized-account-settings-fr] |  | /compte/parametres?q=1#top [localized-account-settings-fr] | /compte/parametres?q=1#top [localized-account-settings-fr] | /compte/parametres | null |
| /konto | /compte?q=1#top [localized-account-fr] |  | /compte?q=1#top [localized-account-fr] | /compte?q=1#top [localized-account-fr] | /konto | null |
| /konto/bestellungen | /compte/orders?q=1#top [localized-account-orders-fr] |  | /compte/orders?q=1#top [localized-account-orders-fr] | /compte/orders?q=1#top [localized-account-orders-fr] | /konto/bestellungen | null |
| /konto/bestellungen/42 | /compte/orders/42?q=1#top [localized-account-orders-id-fr] | /compte/orders/42-fr?q=1#top [localized-account-orders-id-fr] | /compte/orders/42?q=1#top [localized-account-orders-id-fr] | /compte/orders/42?q=1#top [localized-account-orders-id-fr] | /konto/bestellungen/42 | null |
| /konto/einstellungen | /compte/parametres?q=1#top [localized-account-settings-fr] |  | /compte/parametres?q=1#top [localized-account-settings-fr] | /compte/parametres?q=1#top [localized-account-settings-fr] | /konto/einstellungen | null |
| /laden | /shop?q=1#top [shop] |  | /shop?q=1#top [shop] | /shop?q=1#top [shop] | /laden | null |
| /laden/shoes | /shop/shoes?q=1#top [shop-category] | /shop/shoes-fr?q=1#top [shop-category] | /shop/shoes?q=1#top [shop-category] | /shop/shoes?q=1#top [shop-category] | /laden/shoes | null |
| /laden/shoes/artikel/red-boot | /shop/shoes/red-boot?q=1#top [shop-category-item] | /shop/shoes-fr/red-boot-fr?q=1#top [shop-category-item] | /shop/shoes/red-boot?q=1#top [shop-category-item] | /shop/shoes/red-boot?q=1#top [shop-category-item] | /laden/shoes/artikel/red-boot | null |
| /shop | /shop?q=1#top [shop] |  | /shop?q=1#top [shop] | /shop?q=1#top [shop] | /shop | null |
| /shop/shoes | /shop/shoes?q=1#top [shop-category] | /shop/shoes-fr?q=1#top [shop-category] | /shop/shoes?q=1#top [shop-category] | /shop/shoes?q=1#top [shop-category] | /shop/shoes | null |
| /shop/shoes/red-boot | /shop/shoes/red-boot?q=1#top [shop-category-item] | /shop/shoes-fr/red-boot-fr?q=1#top [shop-category-item] | /shop/shoes/red-boot?q=1#top [shop-category-item] | /shop/shoes/red-boot?q=1#top [shop-category-item] | /shop/shoes/red-boot | null |
| /store | /shop?q=1#top [shop] |  | /shop?q=1#top [shop] | /shop?q=1#top [shop] | /store | null |
| /store/shoes | /shop/shoes?q=1#top [shop-category] | /shop/shoes-fr?q=1#top [shop-category] | /shop/shoes?q=1#top [shop-category] | /shop/shoes?q=1#top [shop-category] | /store/shoes | null |
| /store/shoes/red-boot | /shop/shoes/red-boot?q=1#top [shop-category-item] | /shop/shoes-fr/red-boot-fr?q=1#top [shop-category-item] | /shop/shoes/red-boot?q=1#top [shop-category-item] | /shop/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes/red-boot | null |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | /about/ | null |
| /de/about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / |
|---|---|---|---|
| account | /account [account] | /konto [localized-account-de] | /compte [localized-account-fr] |
| account-orders | /account/orders [account-orders] | /konto/bestellungen [localized-account-orders-de] | /compte/orders [localized-account-orders-fr] |
| account-orders-id | /account/orders/42 [account-orders-id] | /konto/bestellungen/42 [localized-account-orders-id-de] | /compte/orders/42 [localized-account-orders-id-fr] |
| account-settings | /account/settings [account-settings] | /konto/einstellungen [localized-account-settings-de] | /compte/parametres [localized-account-settings-fr] |
| index | / [index] | / [index] | / [index] |
| shop | /store [localized-shop-en] | /laden [localized-shop-de] | /shop [shop] |
| shop-category | /store/shoes [localized-shop-category-en] | /laden/shoes [localized-shop-category-de] | /shop/shoes [shop-category] |
| shop-category-item | /store/shoes/red-boot [localized-shop-category-item-en] | /laden/shoes/artikel/red-boot [localized-shop-category-item-de] | /shop/shoes/red-boot [shop-category-item] |

## Invariant breaks (0)

none
