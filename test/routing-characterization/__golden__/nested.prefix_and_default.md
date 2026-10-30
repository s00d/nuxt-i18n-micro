# nested · prefix_and_default

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
| shop | /store |  |  |
| · shop-category | :category() |  |  |
| · · shop-category-item | :item() |  |  |
| localized-index | /:locale(en\|de\|fr) |  |  |
| — | /:locale(en)/account |  |  |
| · localized-account |  |  |  |
| · localized-account-settings | settings |  |  |
| · localized-account-orders | orders |  |  |
| · · localized-account-orders-id | :id() |  |  |
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
| localized-shop-en | /:locale(en)/store |  |  |
| · localized-shop-category-en | :category() |  |  |
| · · localized-shop-category-item-en | :item() |  |  |
| localized-shop-de | /:locale(de)/laden |  |  |
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
| /de | localized-index | de | index | index | Deutsch | de | de | null |
| /de/konto | localized-account-de | de | account | account | Deutsch | de | de | null |
| /de/konto/bestellungen | localized-account-orders-de | de | account-orders | account-orders | Deutsch | de | de | null |
| /de/konto/bestellungen/42 | localized-account-orders-id-de | de | account-orders-id | account-orders-id | Deutsch | de | de | null |
| /de/konto/einstellungen | localized-account-settings-de | de | account-settings | account-settings | Deutsch | de | de | null |
| /de/laden | localized-shop-de | de | shop | shop | Deutsch | de | de | null |
| /de/laden/shoes | localized-shop-category-de | de | shop-category | shop-category | Deutsch | de | de | null |
| /de/laden/shoes/artikel/red-boot | localized-shop-category-item-de | de | shop-category-item | shop-category-item | Deutsch | de | de | null |
| /en | localized-index | en | index | index | English | en | en | null |
| /en/account | localized-account | en | account | account | English | en | en | null |
| /en/account/orders | localized-account-orders | en | account-orders | account-orders | English | en | en | null |
| /en/account/orders/42 | localized-account-orders-id | en | account-orders-id | account-orders-id | English | en | en | null |
| /en/account/settings | localized-account-settings | en | account-settings | account-settings | English | en | en | null |
| /en/store | localized-shop-en | en | shop | shop | English | en | en | null |
| /en/store/shoes | localized-shop-category-en | en | shop-category | shop-category | English | en | en | null |
| /en/store/shoes/red-boot | localized-shop-category-item-en | en | shop-category-item | shop-category-item | English | en | en | null |
| /fr | localized-index | fr | index | index | Français | fr | fr | null |
| /fr/compte | localized-account-fr | fr | account | account | Français | fr | fr | null |
| /fr/compte/orders | localized-account-orders-fr | fr | account-orders | account-orders | Français | fr | fr | null |
| /fr/compte/orders/42 | localized-account-orders-id-fr | fr | account-orders-id | account-orders-id | Français | fr | fr | null |
| /fr/compte/parametres | localized-account-settings-fr | fr | account-settings | account-settings | Français | fr | fr | null |
| /fr/shop | localized-shop | fr | shop | shop | Français | fr | fr | null |
| /fr/shop/shoes | localized-shop-category | fr | shop-category | shop-category | Français | fr | fr | null |
| /fr/shop/shoes/red-boot | localized-shop-category-item | fr | shop-category-item | shop-category-item | Français | fr | fr | null |
| /store | shop | en | shop | shop | English | null | null | null |
| /store/shoes | shop-category | en | shop-category | shop-category | English | null | null | null |
| /store/shoes/red-boot | shop-category-item | en | shop-category-item | shop-category-item | English | null | null | null |
| /en/ | localized-index | en | index | index | English | en | en | null |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | null | en |  | null | English | null | null | null |
| /de/about/ | null | de |  | null | Deutsch | de | de | null |
| /missing | null | en |  | null | English | null | null | null |
| /de/missing | null | de |  | null | Deutsch | de | de | null |
| /xx/about | null | en |  | null | English | null | null | null |
| /de/de/about | null | de |  | null | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /account | /en/account?q=1#top [localized-account] |  | /en/account?q=1#top [localized-account] | /en/account?q=1#top [localized-account] | null | null | en,de,fr |
| /account/orders | /en/account/orders?q=1#top [localized-account-orders] |  | /en/account/orders?q=1#top [localized-account-orders] | /en/account/orders?q=1#top [localized-account-orders] | null | null | en,de,fr |
| /account/orders/42 | /en/account/orders/42?q=1#top [localized-account-orders-id] | /en/account/orders/42-en?q=1#top [localized-account-orders-id] | /en/account/orders/42?q=1#top [localized-account-orders-id] | /en/account/orders/42?q=1#top [localized-account-orders-id] | null | null | en,de,fr |
| /account/settings | /en/account/settings?q=1#top [localized-account-settings] |  | /en/account/settings?q=1#top [localized-account-settings] | /en/account/settings?q=1#top [localized-account-settings] | null | null | en,de,fr |
| /de | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /de/konto | /en/account?q=1#top [localized-account] |  | /en/account?q=1#top [localized-account] | /en/account?q=1#top [localized-account] | null | /en/account | en,de,fr |
| /de/konto/bestellungen | /en/account/orders?q=1#top [localized-account-orders] |  | /en/account/orders?q=1#top [localized-account-orders] | /en/account/orders?q=1#top [localized-account-orders] | null | /en/account/orders | en,de,fr |
| /de/konto/bestellungen/42 | /en/account/orders/42?q=1#top [localized-account-orders-id] | /en/account/orders/42-en?q=1#top [localized-account-orders-id] | /en/account/orders/42?q=1#top [localized-account-orders-id] | /en/account/orders/42?q=1#top [localized-account-orders-id] | null | /en/account/orders/42 | en,de,fr |
| /de/konto/einstellungen | /en/account/settings?q=1#top [localized-account-settings] |  | /en/account/settings?q=1#top [localized-account-settings] | /en/account/settings?q=1#top [localized-account-settings] | null | /en/account/settings | en,de,fr |
| /de/laden | /en/store?q=1#top [localized-shop-en] |  | /en/store?q=1#top [localized-shop-en] | /en/store?q=1#top [localized-shop-en] | null | /en/store | en,fr,de |
| /de/laden/shoes | /en/store/shoes?q=1#top [localized-shop-category-en] | /en/store/shoes-en?q=1#top [localized-shop-category-en] | /en/store/shoes?q=1#top [localized-shop-category-en] | /en/store/shoes?q=1#top [localized-shop-category-en] | null | /en/store/shoes | en,fr,de |
| /de/laden/shoes/artikel/red-boot | /en/store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /en/store/shoes-en/red-boot-en?q=1#top [localized-shop-category-item-en] | /en/store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /en/store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | null | /en/store/shoes/red-boot | en,de,fr |
| /en | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /en/account | /en/account?q=1#top [localized-account] |  | /en/account?q=1#top [localized-account] | /en/account?q=1#top [localized-account] | null | null | en,de,fr |
| /en/account/orders | /en/account/orders?q=1#top [localized-account-orders] |  | /en/account/orders?q=1#top [localized-account-orders] | /en/account/orders?q=1#top [localized-account-orders] | null | null | en,de,fr |
| /en/account/orders/42 | /en/account/orders/42?q=1#top [localized-account-orders-id] | /en/account/orders/42-en?q=1#top [localized-account-orders-id] | /en/account/orders/42?q=1#top [localized-account-orders-id] | /en/account/orders/42?q=1#top [localized-account-orders-id] | null | null | en,de,fr |
| /en/account/settings | /en/account/settings?q=1#top [localized-account-settings] |  | /en/account/settings?q=1#top [localized-account-settings] | /en/account/settings?q=1#top [localized-account-settings] | null | null | en,de,fr |
| /en/store | /en/store?q=1#top [localized-shop-en] |  | /en/store?q=1#top [localized-shop-en] | /en/store?q=1#top [localized-shop-en] | null | null | en,fr,de |
| /en/store/shoes | /en/store/shoes?q=1#top [localized-shop-category-en] | /en/store/shoes-en?q=1#top [localized-shop-category-en] | /en/store/shoes?q=1#top [localized-shop-category-en] | /en/store/shoes?q=1#top [localized-shop-category-en] | null | null | en,fr,de |
| /en/store/shoes/red-boot | /en/store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /en/store/shoes-en/red-boot-en?q=1#top [localized-shop-category-item-en] | /en/store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /en/store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | null | null | en,de,fr |
| /fr | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /fr/compte | /en/account?q=1#top [localized-account] |  | /en/account?q=1#top [localized-account] | /en/account?q=1#top [localized-account] | null | /en/account | en,de,fr |
| /fr/compte/orders | /en/account/orders?q=1#top [localized-account-orders] |  | /en/account/orders?q=1#top [localized-account-orders] | /en/account/orders?q=1#top [localized-account-orders] | null | /en/account/orders | en,de,fr |
| /fr/compte/orders/42 | /en/account/orders/42?q=1#top [localized-account-orders-id] | /en/account/orders/42-en?q=1#top [localized-account-orders-id] | /en/account/orders/42?q=1#top [localized-account-orders-id] | /en/account/orders/42?q=1#top [localized-account-orders-id] | null | /en/account/orders/42 | en,de,fr |
| /fr/compte/parametres | /en/account/settings?q=1#top [localized-account-settings] |  | /en/account/settings?q=1#top [localized-account-settings] | /en/account/settings?q=1#top [localized-account-settings] | null | /en/account/settings | en,de,fr |
| /fr/shop | /en/store?q=1#top [localized-shop-en] |  | /en/store?q=1#top [localized-shop-en] | /en/store?q=1#top [localized-shop-en] | null | /en/store | en,fr,de |
| /fr/shop/shoes | /en/store/shoes?q=1#top [localized-shop-category-en] | /en/store/shoes-en?q=1#top [localized-shop-category-en] | /en/store/shoes?q=1#top [localized-shop-category-en] | /en/store/shoes?q=1#top [localized-shop-category-en] | null | /en/store/shoes | en,fr,de |
| /fr/shop/shoes/red-boot | /en/store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /en/store/shoes-en/red-boot-en?q=1#top [localized-shop-category-item-en] | /en/store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /en/store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | null | /en/store/shoes/red-boot | en,de,fr |
| /store | /en/store?q=1#top [localized-shop-en] |  | /en/store?q=1#top [localized-shop-en] | /en/store?q=1#top [localized-shop-en] | null | null | en,fr,de |
| /store/shoes | /en/store/shoes?q=1#top [localized-shop-category-en] | /en/store/shoes-en?q=1#top [localized-shop-category-en] | /en/store/shoes?q=1#top [localized-shop-category-en] | /en/store/shoes?q=1#top [localized-shop-category-en] | null | null | en,fr,de |
| /store/shoes/red-boot | /en/store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /en/store/shoes-en/red-boot-en?q=1#top [localized-shop-category-item-en] | /en/store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /en/store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | null | null | en,de,fr |
| /en/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /de/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /about/ | /en/about/?q=1#top [—] |  | /en/about/?q=1#top [null] | /en/about/?q=1#top [null] | null | null | null |
| /de/about/ | /en/about/?q=1#top [—] |  | /en/about/?q=1#top [null] | /en/about/?q=1#top [null] | null | /en/about | null |
| /missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | null | null | null |
| /de/missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | null | /en/missing | null |
| /xx/about | /en/xx/about?q=1#top [—] |  | /en/xx/about?q=1#top [null] | /en/xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /en/de/about?q=1#top [—] |  | /en/de/about?q=1#top [null] | /en/de/about?q=1#top [null] | null | /en/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /account | /de/konto?q=1#top [localized-account-de] |  | /de/konto?q=1#top [localized-account-de] | /de/konto?q=1#top [localized-account-de] | null | null | en,de,fr |
| /account/orders | /de/konto/bestellungen?q=1#top [localized-account-orders-de] |  | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | null | null | en,de,fr |
| /account/orders/42 | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42-de?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | null | null | en,de,fr |
| /account/settings | /de/konto/einstellungen?q=1#top [localized-account-settings-de] |  | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | null | null | en,de,fr |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /de/konto | /de/konto?q=1#top [localized-account-de] |  | /de/konto?q=1#top [localized-account-de] | /de/konto?q=1#top [localized-account-de] | null | null | en,de,fr |
| /de/konto/bestellungen | /de/konto/bestellungen?q=1#top [localized-account-orders-de] |  | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | null | null | en,de,fr |
| /de/konto/bestellungen/42 | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42-de?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | null | null | en,de,fr |
| /de/konto/einstellungen | /de/konto/einstellungen?q=1#top [localized-account-settings-de] |  | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | null | null | en,de,fr |
| /de/laden | /de/laden?q=1#top [localized-shop-de] |  | /de/laden?q=1#top [localized-shop-de] | /de/laden?q=1#top [localized-shop-de] | null | null | en,fr,de |
| /de/laden/shoes | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes-de?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | null | null | en,fr,de |
| /de/laden/shoes/artikel/red-boot | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes-de/artikel/red-boot-de?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | null | null | en,de,fr |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /en/account | /de/konto?q=1#top [localized-account-de] |  | /de/konto?q=1#top [localized-account-de] | /de/konto?q=1#top [localized-account-de] | null | /de/konto | en,de,fr |
| /en/account/orders | /de/konto/bestellungen?q=1#top [localized-account-orders-de] |  | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | null | /de/konto/bestellungen | en,de,fr |
| /en/account/orders/42 | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42-de?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | null | /de/konto/bestellungen/42 | en,de,fr |
| /en/account/settings | /de/konto/einstellungen?q=1#top [localized-account-settings-de] |  | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | null | /de/konto/einstellungen | en,de,fr |
| /en/store | /de/laden?q=1#top [localized-shop-de] |  | /de/laden?q=1#top [localized-shop-de] | /de/laden?q=1#top [localized-shop-de] | null | /de/laden | en,fr,de |
| /en/store/shoes | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes-de?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | null | /de/laden/shoes | en,fr,de |
| /en/store/shoes/red-boot | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes-de/artikel/red-boot-de?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | null | /de/laden/shoes/artikel/red-boot | en,de,fr |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /fr/compte | /de/konto?q=1#top [localized-account-de] |  | /de/konto?q=1#top [localized-account-de] | /de/konto?q=1#top [localized-account-de] | null | /de/konto | en,de,fr |
| /fr/compte/orders | /de/konto/bestellungen?q=1#top [localized-account-orders-de] |  | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | /de/konto/bestellungen?q=1#top [localized-account-orders-de] | null | /de/konto/bestellungen | en,de,fr |
| /fr/compte/orders/42 | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42-de?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /de/konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | null | /de/konto/bestellungen/42 | en,de,fr |
| /fr/compte/parametres | /de/konto/einstellungen?q=1#top [localized-account-settings-de] |  | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | /de/konto/einstellungen?q=1#top [localized-account-settings-de] | null | /de/konto/einstellungen | en,de,fr |
| /fr/shop | /de/laden?q=1#top [localized-shop-de] |  | /de/laden?q=1#top [localized-shop-de] | /de/laden?q=1#top [localized-shop-de] | null | /de/laden | en,fr,de |
| /fr/shop/shoes | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes-de?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | null | /de/laden/shoes | en,fr,de |
| /fr/shop/shoes/red-boot | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes-de/artikel/red-boot-de?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | null | /de/laden/shoes/artikel/red-boot | en,de,fr |
| /store | /de/laden?q=1#top [localized-shop-de] |  | /de/laden?q=1#top [localized-shop-de] | /de/laden?q=1#top [localized-shop-de] | null | null | en,fr,de |
| /store/shoes | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes-de?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | /de/laden/shoes?q=1#top [localized-shop-category-de] | null | null | en,fr,de |
| /store/shoes/red-boot | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes-de/artikel/red-boot-de?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /de/laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | null | null | en,de,fr |
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
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,fr |
| /account | /fr/compte?q=1#top [localized-account-fr] |  | /fr/compte?q=1#top [localized-account-fr] | /fr/compte?q=1#top [localized-account-fr] | null | null | en,de,fr |
| /account/orders | /fr/compte/orders?q=1#top [localized-account-orders-fr] |  | /fr/compte/orders?q=1#top [localized-account-orders-fr] | /fr/compte/orders?q=1#top [localized-account-orders-fr] | null | null | en,de,fr |
| /account/orders/42 | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42-fr?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | null | null | en,de,fr |
| /account/settings | /fr/compte/parametres?q=1#top [localized-account-settings-fr] |  | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | null | null | en,de,fr |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/konto | /fr/compte?q=1#top [localized-account-fr] |  | /fr/compte?q=1#top [localized-account-fr] | /fr/compte?q=1#top [localized-account-fr] | null | /fr/compte | en,de,fr |
| /de/konto/bestellungen | /fr/compte/orders?q=1#top [localized-account-orders-fr] |  | /fr/compte/orders?q=1#top [localized-account-orders-fr] | /fr/compte/orders?q=1#top [localized-account-orders-fr] | null | /fr/compte/orders | en,de,fr |
| /de/konto/bestellungen/42 | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42-fr?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | null | /fr/compte/orders/42 | en,de,fr |
| /de/konto/einstellungen | /fr/compte/parametres?q=1#top [localized-account-settings-fr] |  | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | null | /fr/compte/parametres | en,de,fr |
| /de/laden | /fr/shop?q=1#top [localized-shop] |  | /fr/shop?q=1#top [localized-shop] | /fr/shop?q=1#top [localized-shop] | null | /fr/shop | en,fr,de |
| /de/laden/shoes | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes-fr?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | null | /fr/shop/shoes | en,fr,de |
| /de/laden/shoes/artikel/red-boot | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes-fr/red-boot-fr?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | null | /fr/shop/shoes/red-boot | en,de,fr |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /en/account | /fr/compte?q=1#top [localized-account-fr] |  | /fr/compte?q=1#top [localized-account-fr] | /fr/compte?q=1#top [localized-account-fr] | null | /fr/compte | en,de,fr |
| /en/account/orders | /fr/compte/orders?q=1#top [localized-account-orders-fr] |  | /fr/compte/orders?q=1#top [localized-account-orders-fr] | /fr/compte/orders?q=1#top [localized-account-orders-fr] | null | /fr/compte/orders | en,de,fr |
| /en/account/orders/42 | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42-fr?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | null | /fr/compte/orders/42 | en,de,fr |
| /en/account/settings | /fr/compte/parametres?q=1#top [localized-account-settings-fr] |  | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | null | /fr/compte/parametres | en,de,fr |
| /en/store | /fr/shop?q=1#top [localized-shop] |  | /fr/shop?q=1#top [localized-shop] | /fr/shop?q=1#top [localized-shop] | null | /fr/shop | en,fr,de |
| /en/store/shoes | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes-fr?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | null | /fr/shop/shoes | en,fr,de |
| /en/store/shoes/red-boot | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes-fr/red-boot-fr?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | null | /fr/shop/shoes/red-boot | en,de,fr |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,fr |
| /fr/compte | /fr/compte?q=1#top [localized-account-fr] |  | /fr/compte?q=1#top [localized-account-fr] | /fr/compte?q=1#top [localized-account-fr] | null | null | en,de,fr |
| /fr/compte/orders | /fr/compte/orders?q=1#top [localized-account-orders-fr] |  | /fr/compte/orders?q=1#top [localized-account-orders-fr] | /fr/compte/orders?q=1#top [localized-account-orders-fr] | null | null | en,de,fr |
| /fr/compte/orders/42 | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42-fr?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | /fr/compte/orders/42?q=1#top [localized-account-orders-id-fr] | null | null | en,de,fr |
| /fr/compte/parametres | /fr/compte/parametres?q=1#top [localized-account-settings-fr] |  | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | /fr/compte/parametres?q=1#top [localized-account-settings-fr] | null | null | en,de,fr |
| /fr/shop | /fr/shop?q=1#top [localized-shop] |  | /fr/shop?q=1#top [localized-shop] | /fr/shop?q=1#top [localized-shop] | null | null | en,fr,de |
| /fr/shop/shoes | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes-fr?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | null | null | en,fr,de |
| /fr/shop/shoes/red-boot | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes-fr/red-boot-fr?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | null | null | en,de,fr |
| /store | /fr/shop?q=1#top [localized-shop] |  | /fr/shop?q=1#top [localized-shop] | /fr/shop?q=1#top [localized-shop] | null | null | en,fr,de |
| /store/shoes | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes-fr?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | /fr/shop/shoes?q=1#top [localized-shop-category] | null | null | en,fr,de |
| /store/shoes/red-boot | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes-fr/red-boot-fr?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | /fr/shop/shoes/red-boot?q=1#top [localized-shop-category-item] | null | null | en,de,fr |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /about/ | /fr/about/?q=1#top [—] |  | /fr/about/?q=1#top [null] | /fr/about/?q=1#top [null] | null | null | null |
| /de/about/ | /fr/about/?q=1#top [—] |  | /fr/about/?q=1#top [null] | /fr/about/?q=1#top [null] | null | /fr/about | null |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | null | null |
| /de/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | /fr/missing | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /fr/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | null | /fr/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| account | /en/account [localized-account] | /de/konto [localized-account-de] | /fr/compte [localized-account-fr] | /en/account [localized-account] | /de/konto [localized-account-de] | /fr/compte [localized-account-fr] | /en/account [localized-account] | /de/konto [localized-account-de] | /fr/compte [localized-account-fr] |
| account-orders | /en/account/orders [localized-account-orders] | /de/konto/bestellungen [localized-account-orders-de] | /fr/compte/orders [localized-account-orders-fr] | /en/account/orders [localized-account-orders] | /de/konto/bestellungen [localized-account-orders-de] | /fr/compte/orders [localized-account-orders-fr] | /en/account/orders [localized-account-orders] | /de/konto/bestellungen [localized-account-orders-de] | /fr/compte/orders [localized-account-orders-fr] |
| account-orders-id | /en/account/orders/42 [localized-account-orders-id] | /de/konto/bestellungen/42 [localized-account-orders-id-de] | /fr/compte/orders/42 [localized-account-orders-id-fr] | /en/account/orders/42 [localized-account-orders-id] | /de/konto/bestellungen/42 [localized-account-orders-id-de] | /fr/compte/orders/42 [localized-account-orders-id-fr] | /en/account/orders/42 [localized-account-orders-id] | /de/konto/bestellungen/42 [localized-account-orders-id-de] | /fr/compte/orders/42 [localized-account-orders-id-fr] |
| account-settings | /en/account/settings [localized-account-settings] | /de/konto/einstellungen [localized-account-settings-de] | /fr/compte/parametres [localized-account-settings-fr] | /en/account/settings [localized-account-settings] | /de/konto/einstellungen [localized-account-settings-de] | /fr/compte/parametres [localized-account-settings-fr] | /en/account/settings [localized-account-settings] | /de/konto/einstellungen [localized-account-settings-de] | /fr/compte/parametres [localized-account-settings-fr] |
| index | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] |
| shop | /en/store [localized-shop-en] | /de/laden [localized-shop-de] | /fr/shop [localized-shop] | /en/store [localized-shop-en] | /de/laden [localized-shop-de] | /fr/shop [localized-shop] | /en/store [localized-shop-en] | /de/laden [localized-shop-de] | /fr/shop [localized-shop] |
| shop-category | /en/store/shoes [localized-shop-category-en] | /de/laden/shoes [localized-shop-category-de] | /fr/shop/shoes [localized-shop-category] | /en/store/shoes [localized-shop-category-en] | /de/laden/shoes [localized-shop-category-de] | /fr/shop/shoes [localized-shop-category] | /en/store/shoes [localized-shop-category-en] | /de/laden/shoes [localized-shop-category-de] | /fr/shop/shoes [localized-shop-category] |
| shop-category-item | /en/store/shoes/red-boot [localized-shop-category-item-en] | /de/laden/shoes/artikel/red-boot [localized-shop-category-item-de] | /fr/shop/shoes/red-boot [localized-shop-category-item] | /en/store/shoes/red-boot [localized-shop-category-item-en] | /de/laden/shoes/artikel/red-boot [localized-shop-category-item-de] | /fr/shop/shoes/red-boot [localized-shop-category-item] | /en/store/shoes/red-boot [localized-shop-category-item-en] | /de/laden/shoes/artikel/red-boot [localized-shop-category-item-de] | /fr/shop/shoes/red-boot [localized-shop-category-item] |

## Invariant breaks (0)

none
