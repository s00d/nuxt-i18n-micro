# nested · prefix_except_default

parent pages with child routes: translated parents, relative and full-URL child values, an index child, deep nesting

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect | meta.i18n |
|---|---|---|---|---|
| index | / |  |  | index: en |
| — | /account |  |  |  |
| · account |  |  |  | account: en |
| · account-settings | settings |  |  | account-settings: en |
| · account-orders | orders |  |  | account-orders: en |
| · · account-orders-id | :id() |  |  | account-orders-id: en |
| shop | /store | /shop |  | shop: en |
| · shop-category | :category() |  |  | shop-category: en |
| · · shop-category-item | :item() |  |  | shop-category-item: en |
| localized-index | /:locale(de\|fr) |  |  | index: de, fr |
| — | /:locale(de)/konto |  |  |  |
| · localized-account-de |  |  |  | account: de |
| · localized-account-settings-de | einstellungen |  |  | account-settings: de |
| · localized-account-orders-de | bestellungen |  |  | account-orders: de |
| · · localized-account-orders-id-de | :id() |  |  | account-orders-id: de |
| — | /:locale(fr)/compte |  |  |  |
| · localized-account-fr |  |  |  | account: fr |
| · localized-account-settings-fr | parametres |  |  | account-settings: fr |
| · localized-account-orders-fr | orders |  |  | account-orders: fr |
| · · localized-account-orders-id-fr | :id() |  |  | account-orders-id: fr |
| localized-shop | /:locale(fr)/shop |  |  | shop: fr |
| · localized-shop-category | :category() |  |  | shop-category: fr |
| · · localized-shop-category-item | :item() |  |  | shop-category-item: fr |
| localized-shop-de | /:locale(de)/laden |  |  | shop: de |
| · localized-shop-category-de | :category() |  |  | shop-category: de |
| · · localized-shop-category-item-de | artikel/:item |  |  | shop-category-item: de |

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

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /account | /account?q=1#top [account] |  | /account?q=1#top [account] | /account?q=1#top [account] | null | null | en,de,fr |
| /account/orders | /account/orders?q=1#top [account-orders] |  | /account/orders?q=1#top [account-orders] | /account/orders?q=1#top [account-orders] | null | null | en,de,fr |
| /account/orders/42 | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42-en?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | null | null | en,de,fr |
| /account/settings | /account/settings?q=1#top [account-settings] |  | /account/settings?q=1#top [account-settings] | /account/settings?q=1#top [account-settings] | null | null | en,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /de/konto | /account?q=1#top [account] |  | /account?q=1#top [account] | /account?q=1#top [account] | null | /account | en,de,fr |
| /de/konto/bestellungen | /account/orders?q=1#top [account-orders] |  | /account/orders?q=1#top [account-orders] | /account/orders?q=1#top [account-orders] | null | /account/orders | en,de,fr |
| /de/konto/bestellungen/42 | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42-en?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | null | /account/orders/42 | en,de,fr |
| /de/konto/einstellungen | /account/settings?q=1#top [account-settings] |  | /account/settings?q=1#top [account-settings] | /account/settings?q=1#top [account-settings] | null | /account/settings | en,de,fr |
| /de/laden | /store?q=1#top [shop] |  | /store?q=1#top [shop] | /store?q=1#top [shop] | null | /store | en,fr,de |
| /de/laden/shoes | /store/shoes?q=1#top [shop-category] | /store/shoes-en?q=1#top [shop-category] | /store/shoes?q=1#top [shop-category] | /store/shoes?q=1#top [shop-category] | null | /store/shoes | en,fr,de |
| /de/laden/shoes/artikel/red-boot | /store/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes-en/red-boot-en?q=1#top [shop-category-item] | /store/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes/red-boot?q=1#top [shop-category-item] | null | /store/shoes/red-boot | en,de,fr |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /fr/compte | /account?q=1#top [account] |  | /account?q=1#top [account] | /account?q=1#top [account] | null | /account | en,de,fr |
| /fr/compte/orders | /account/orders?q=1#top [account-orders] |  | /account/orders?q=1#top [account-orders] | /account/orders?q=1#top [account-orders] | null | /account/orders | en,de,fr |
| /fr/compte/orders/42 | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42-en?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | null | /account/orders/42 | en,de,fr |
| /fr/compte/parametres | /account/settings?q=1#top [account-settings] |  | /account/settings?q=1#top [account-settings] | /account/settings?q=1#top [account-settings] | null | /account/settings | en,de,fr |
| /fr/shop | /store?q=1#top [shop] |  | /store?q=1#top [shop] | /store?q=1#top [shop] | null | /store | en,fr,de |
| /fr/shop/shoes | /store/shoes?q=1#top [shop-category] | /store/shoes-en?q=1#top [shop-category] | /store/shoes?q=1#top [shop-category] | /store/shoes?q=1#top [shop-category] | null | /store/shoes | en,fr,de |
| /fr/shop/shoes/red-boot | /store/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes-en/red-boot-en?q=1#top [shop-category-item] | /store/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes/red-boot?q=1#top [shop-category-item] | null | /store/shoes/red-boot | en,de,fr |
| /shop | /store?q=1#top [shop] |  | /store?q=1#top [shop] | /store?q=1#top [shop] | /store | /store | en,fr,de |
| /shop/shoes | /store/shoes?q=1#top [shop-category] | /store/shoes-en?q=1#top [shop-category] | /store/shoes?q=1#top [shop-category] | /store/shoes?q=1#top [shop-category] | /store/shoes | /store/shoes | en,fr,de |
| /shop/shoes/red-boot | /store/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes-en/red-boot-en?q=1#top [shop-category-item] | /store/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes/red-boot | /store/shoes/red-boot | en,de,fr |
| /store | /store?q=1#top [shop] |  | /store?q=1#top [shop] | /store?q=1#top [shop] | null | null | en,fr,de |
| /store/shoes | /store/shoes?q=1#top [shop-category] | /store/shoes-en?q=1#top [shop-category] | /store/shoes?q=1#top [shop-category] | /store/shoes?q=1#top [shop-category] | null | null | en,fr,de |
| /store/shoes/red-boot | /store/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes-en/red-boot-en?q=1#top [shop-category-item] | /store/shoes/red-boot?q=1#top [shop-category-item] | /store/shoes/red-boot?q=1#top [shop-category-item] | null | null | en,de,fr |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | null | null | null |
| /de/about/ | /about/?q=1#top [—] |  | /about/?q=1#top [null] | /about/?q=1#top [null] | null | null | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | /de | en,de,fr |
| /account | /de/konto?q=1#top [localized-account-de] |  | /de/konto?q=1#top [localized-account-de] | /de/konto?q=1#top [localized-account-de] | /de/konto | /de/konto | en,de,fr |
| /account/orders | /de/konto/bestellungen?q=1#top [localized-account-orders-de] |  | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | /de/konto/bestellungen | /de/konto/bestellungen | en,de,fr |
| /account/orders/42 | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42-de?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42 | /de/konto/bestellungen/42 | en,de,fr |
| /account/settings | /de/konto/einstellungen?q=1#top [localized-account-settings-de] |  | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | /de/konto/einstellungen | /de/konto/einstellungen | en,de,fr |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /de/konto | /de/konto?q=1#top [localized-account-de] |  | /de/konto?q=1#top [localized-account-de] | /de/konto?q=1#top [localized-account-de] | null | null | en,de,fr |
| /de/konto/bestellungen | /de/konto/bestellungen?q=1#top [localized-account-orders-de] |  | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | null | null | en,de,fr |
| /de/konto/bestellungen/42 | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42-de?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | null | null | en,de,fr |
| /de/konto/einstellungen | /de/konto/einstellungen?q=1#top [localized-account-settings-de] |  | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | null | null | en,de,fr |
| /de/laden | /de/laden?q=1#top [localized-shop-de] |  | /de/laden?q=1#top [localized-shop-de] | /de/laden?q=1#top [localized-shop-de] | null | null | en,fr,de |
| /de/laden/shoes | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes-de?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | null | null | en,fr,de |
| /de/laden/shoes/artikel/red-boot | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes-de/artikel/red-boot-de?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | null | null | en,de,fr |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /fr/compte | /de/konto?q=1#top [localized-account-de] |  | /de/konto?q=1#top [localized-account-de] | /de/konto?q=1#top [localized-account-de] | null | /de/konto | en,de,fr |
| /fr/compte/orders | /de/konto/bestellungen?q=1#top [localized-account-orders-de] |  | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | null | /de/konto/bestellungen | en,de,fr |
| /fr/compte/orders/42 | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42-de?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | null | /de/konto/bestellungen/42 | en,de,fr |
| /fr/compte/parametres | /de/konto/einstellungen?q=1#top [localized-account-settings-de] |  | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | null | /de/konto/einstellungen | en,de,fr |
| /fr/shop | /de/laden?q=1#top [localized-shop-de] |  | /de/laden?q=1#top [localized-shop-de] | /de/laden?q=1#top [localized-shop-de] | null | /de/laden | en,fr,de |
| /fr/shop/shoes | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes-de?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | null | /de/laden/shoes | en,fr,de |
| /fr/shop/shoes/red-boot | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes-de/artikel/red-boot-de?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | null | /de/laden/shoes/artikel/red-boot | en,de,fr |
| /shop | /de/laden?q=1#top [localized-shop-de] |  | /de/laden?q=1#top [localized-shop-de] | /de/laden?q=1#top [localized-shop-de] | /de/laden | /de/laden | en,fr,de |
| /shop/shoes | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes-de?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes | /de/laden/shoes | en,fr,de |
| /shop/shoes/red-boot | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes-de/artikel/red-boot-de?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot | /de/laden/shoes/artikel/red-boot | en,de,fr |
| /store | /de/laden?q=1#top [localized-shop-de] |  | /de/laden?q=1#top [localized-shop-de] | /de/laden?q=1#top [localized-shop-de] | /de/laden | /de/laden | en,fr,de |
| /store/shoes | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes-de?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes | /de/laden/shoes | en,fr,de |
| /store/shoes/red-boot | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes-de/artikel/red-boot-de?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot | /de/laden/shoes/artikel/red-boot | en,de,fr |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /about/ | /de/about/?q=1#top [—] |  | /de/about/?q=1#top [null] | /de/about/?q=1#top [null] | null | null | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /de/about/?q=1#top [null] | /de/about/?q=1#top [null] | null | null | null |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | null | null |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | null | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | /fr | en,de,fr |
| /account | /fr/compte?q=1#top [localized-account-fr] |  | /fr/compte?q=1#top [localized-account-fr] | /fr/compte?q=1#top [localized-account-fr] | /fr/compte | /fr/compte | en,de,fr |
| /account/orders | /fr/compte/orders?q=1#top [localized-account-orders-fr] |  | /fr/compte/orders?q=1#top [localized-account-orders-fr] | /fr/compte/orders?q=1#top [localized-account-orders-fr] | /fr/compte/orders | /fr/compte/orders | en,de,fr |
| /account/orders/42 | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42-fr?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42 | /fr/compte/orders/42 | en,de,fr |
| /account/settings | /fr/compte/parametres?q=1#top [localized-account-settings-fr] |  | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | /fr/compte/parametres | /fr/compte/parametres | en,de,fr |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/konto | /fr/compte?q=1#top [localized-account-fr] |  | /fr/compte?q=1#top [localized-account-fr] | /fr/compte?q=1#top [localized-account-fr] | null | /fr/compte | en,de,fr |
| /de/konto/bestellungen | /fr/compte/orders?q=1#top [localized-account-orders-fr] |  | /fr/compte/orders?q=1#top [localized-account-orders-fr] | /fr/compte/orders?q=1#top [localized-account-orders-fr] | null | /fr/compte/orders | en,de,fr |
| /de/konto/bestellungen/42 | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42-fr?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | null | /fr/compte/orders/42 | en,de,fr |
| /de/konto/einstellungen | /fr/compte/parametres?q=1#top [localized-account-settings-fr] |  | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | null | /fr/compte/parametres | en,de,fr |
| /de/laden | /fr/shop?q=1#top [localized-shop] |  | /fr/shop?q=1#top [localized-shop] | /fr/shop?q=1#top [localized-shop] | null | /fr/shop | en,fr,de |
| /de/laden/shoes | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes-fr?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | null | /fr/shop/shoes | en,fr,de |
| /de/laden/shoes/artikel/red-boot | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes-fr/red-boot-fr?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | null | /fr/shop/shoes/red-boot | en,de,fr |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,fr |
| /fr/compte | /fr/compte?q=1#top [localized-account-fr] |  | /fr/compte?q=1#top [localized-account-fr] | /fr/compte?q=1#top [localized-account-fr] | null | null | en,de,fr |
| /fr/compte/orders | /fr/compte/orders?q=1#top [localized-account-orders-fr] |  | /fr/compte/orders?q=1#top [localized-account-orders-fr] | /fr/compte/orders?q=1#top [localized-account-orders-fr] | null | null | en,de,fr |
| /fr/compte/orders/42 | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42-fr?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | null | null | en,de,fr |
| /fr/compte/parametres | /fr/compte/parametres?q=1#top [localized-account-settings-fr] |  | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | null | null | en,de,fr |
| /fr/shop | /fr/shop?q=1#top [localized-shop] |  | /fr/shop?q=1#top [localized-shop] | /fr/shop?q=1#top [localized-shop] | null | null | en,fr,de |
| /fr/shop/shoes | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes-fr?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | null | null | en,fr,de |
| /fr/shop/shoes/red-boot | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes-fr/red-boot-fr?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | null | null | en,de,fr |
| /shop | /fr/shop?q=1#top [localized-shop] |  | /fr/shop?q=1#top [localized-shop] | /fr/shop?q=1#top [localized-shop] | /fr/shop | /fr/shop | en,fr,de |
| /shop/shoes | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes-fr?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes | /fr/shop/shoes | en,fr,de |
| /shop/shoes/red-boot | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes-fr/red-boot-fr?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot | /fr/shop/shoes/red-boot | en,de,fr |
| /store | /fr/shop?q=1#top [localized-shop] |  | /fr/shop?q=1#top [localized-shop] | /fr/shop?q=1#top [localized-shop] | /fr/shop | /fr/shop | en,fr,de |
| /store/shoes | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes-fr?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes | /fr/shop/shoes | en,fr,de |
| /store/shoes/red-boot | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes-fr/red-boot-fr?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot | /fr/shop/shoes/red-boot | en,de,fr |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /about/ | /fr/about/?q=1#top [—] |  | /fr/about/?q=1#top [null] | /fr/about/?q=1#top [null] | null | null | null |
| /de/about/ | /fr/about/?q=1#top [—] |  | /fr/about/?q=1#top [null] | /fr/about/?q=1#top [null] | null | null | null |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | null | null |
| /de/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | null | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /fr/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | null | null | null |

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
