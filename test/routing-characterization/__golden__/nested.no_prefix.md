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
| /account | /account?q=1#top [account] |  | /account?q=1#top [account] | /account?q=1#top [account] | null | null | en,de,fr |
| /account/orders | /account/orders?q=1#top [account-orders] |  | /account/orders?q=1#top [account-orders] | /account/orders?q=1#top [account-orders] | null | null | en,de,fr |
| /account/orders/42 | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42-en?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | null | null | en,de,fr |
| /account/settings | /account/settings?q=1#top [account-settings] |  | /account/settings?q=1#top [account-settings] | /account/settings?q=1#top [account-settings] | null | null | en,de,fr |
| /compte | /account?q=1#top [account] |  | /account?q=1#top [account] | /account?q=1#top [account] | null | null | en,de,fr |
| /compte/orders | /account/orders?q=1#top [account-orders] |  | /account/orders?q=1#top [account-orders] | /account/orders?q=1#top [account-orders] | null | null | en,de,fr |
| /compte/orders/42 | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42-en?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | null | null | en,de,fr |
| /compte/parametres | /account/settings?q=1#top [account-settings] |  | /account/settings?q=1#top [account-settings] | /account/settings?q=1#top [account-settings] | null | null | en,de,fr |
| /konto | /account?q=1#top [account] |  | /account?q=1#top [account] | /account?q=1#top [account] | null | null | en,de,fr |
| /konto/bestellungen | /account/orders?q=1#top [account-orders] |  | /account/orders?q=1#top [account-orders] | /account/orders?q=1#top [account-orders] | null | null | en,de,fr |
| /konto/bestellungen/42 | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42-en?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | /account/orders/42?q=1#top [account-orders-id] | null | null | en,de,fr |
| /konto/einstellungen | /account/settings?q=1#top [account-settings] |  | /account/settings?q=1#top [account-settings] | /account/settings?q=1#top [account-settings] | null | null | en,de,fr |
| /laden | /store?q=1#top [localized-shop-en] |  | /store?q=1#top [localized-shop-en] | /store?q=1#top [localized-shop-en] | null | null | fr,en,de |
| /laden/shoes | /store/shoes?q=1#top [localized-shop-category-en] | /store/shoes-en?q=1#top [localized-shop-category-en] | /store/shoes?q=1#top [localized-shop-category-en] | /store/shoes?q=1#top [localized-shop-category-en] | null | null | fr,en,de |
| /laden/shoes/artikel/red-boot | /store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /store/shoes-en/red-boot-en?q=1#top [localized-shop-category-item-en] | /store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | null | null | de,fr,en |
| /shop | /store?q=1#top [localized-shop-en] |  | /store?q=1#top [localized-shop-en] | /store?q=1#top [localized-shop-en] | null | null | fr,en,de |
| /shop/shoes | /store/shoes?q=1#top [localized-shop-category-en] | /store/shoes-en?q=1#top [localized-shop-category-en] | /store/shoes?q=1#top [localized-shop-category-en] | /store/shoes?q=1#top [localized-shop-category-en] | null | null | fr,en,de |
| /shop/shoes/red-boot | /store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /store/shoes-en/red-boot-en?q=1#top [localized-shop-category-item-en] | /store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | null | null | de,fr,en |
| /store | /store?q=1#top [localized-shop-en] |  | /store?q=1#top [localized-shop-en] | /store?q=1#top [localized-shop-en] | null | null | fr,en,de |
| /store/shoes | /store/shoes?q=1#top [localized-shop-category-en] | /store/shoes-en?q=1#top [localized-shop-category-en] | /store/shoes?q=1#top [localized-shop-category-en] | /store/shoes?q=1#top [localized-shop-category-en] | null | null | fr,en,de |
| /store/shoes/red-boot | /store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /store/shoes-en/red-boot-en?q=1#top [localized-shop-category-item-en] | /store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | /store/shoes/red-boot?q=1#top [localized-shop-category-item-en] | null | null | de,fr,en |
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
| /account | /konto?q=1#top [localized-account-de] |  | /konto?q=1#top [localized-account-de] | /konto?q=1#top [localized-account-de] | null | null | en,de,fr |
| /account/orders | /konto/bestellungen?q=1#top [localized-account-orders-de] |  | /konto/bestellungen?q=1#top [localized-account-orders-de] | /konto/bestellungen?q=1#top [localized-account-orders-de] | null | null | en,de,fr |
| /account/orders/42 | /konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42-de?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | null | null | en,de,fr |
| /account/settings | /konto/einstellungen?q=1#top [localized-account-settings-de] |  | /konto/einstellungen?q=1#top [localized-account-settings-de] | /konto/einstellungen?q=1#top [localized-account-settings-de] | null | null | en,de,fr |
| /compte | /konto?q=1#top [localized-account-de] |  | /konto?q=1#top [localized-account-de] | /konto?q=1#top [localized-account-de] | null | null | en,de,fr |
| /compte/orders | /konto/bestellungen?q=1#top [localized-account-orders-de] |  | /konto/bestellungen?q=1#top [localized-account-orders-de] | /konto/bestellungen?q=1#top [localized-account-orders-de] | null | null | en,de,fr |
| /compte/orders/42 | /konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42-de?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | null | null | en,de,fr |
| /compte/parametres | /konto/einstellungen?q=1#top [localized-account-settings-de] |  | /konto/einstellungen?q=1#top [localized-account-settings-de] | /konto/einstellungen?q=1#top [localized-account-settings-de] | null | null | en,de,fr |
| /konto | /konto?q=1#top [localized-account-de] |  | /konto?q=1#top [localized-account-de] | /konto?q=1#top [localized-account-de] | null | null | en,de,fr |
| /konto/bestellungen | /konto/bestellungen?q=1#top [localized-account-orders-de] |  | /konto/bestellungen?q=1#top [localized-account-orders-de] | /konto/bestellungen?q=1#top [localized-account-orders-de] | null | null | en,de,fr |
| /konto/bestellungen/42 | /konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42-de?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | /konto/bestellungen/42?q=1#top [localized-account-orders-id-de] | null | null | en,de,fr |
| /konto/einstellungen | /konto/einstellungen?q=1#top [localized-account-settings-de] |  | /konto/einstellungen?q=1#top [localized-account-settings-de] | /konto/einstellungen?q=1#top [localized-account-settings-de] | null | null | en,de,fr |
| /laden | /laden?q=1#top [localized-shop-de] |  | /laden?q=1#top [localized-shop-de] | /laden?q=1#top [localized-shop-de] | null | null | fr,en,de |
| /laden/shoes | /laden/shoes?q=1#top [localized-shop-category-de] | /laden/shoes-de?q=1#top [localized-shop-category-de] | /laden/shoes?q=1#top [localized-shop-category-de] | /laden/shoes?q=1#top [localized-shop-category-de] | null | null | fr,en,de |
| /laden/shoes/artikel/red-boot | /laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /laden/shoes-de/artikel/red-boot-de?q=1#top [localized-shop-category-item-de] | /laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | null | null | de,fr,en |
| /shop | /laden?q=1#top [localized-shop-de] |  | /laden?q=1#top [localized-shop-de] | /laden?q=1#top [localized-shop-de] | null | null | fr,en,de |
| /shop/shoes | /laden/shoes?q=1#top [localized-shop-category-de] | /laden/shoes-de?q=1#top [localized-shop-category-de] | /laden/shoes?q=1#top [localized-shop-category-de] | /laden/shoes?q=1#top [localized-shop-category-de] | null | null | fr,en,de |
| /shop/shoes/red-boot | /laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /laden/shoes-de/artikel/red-boot-de?q=1#top [localized-shop-category-item-de] | /laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | null | null | de,fr,en |
| /store | /laden?q=1#top [localized-shop-de] |  | /laden?q=1#top [localized-shop-de] | /laden?q=1#top [localized-shop-de] | null | null | fr,en,de |
| /store/shoes | /laden/shoes?q=1#top [localized-shop-category-de] | /laden/shoes-de?q=1#top [localized-shop-category-de] | /laden/shoes?q=1#top [localized-shop-category-de] | /laden/shoes?q=1#top [localized-shop-category-de] | null | null | fr,en,de |
| /store/shoes/red-boot | /laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /laden/shoes-de/artikel/red-boot-de?q=1#top [localized-shop-category-item-de] | /laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | /laden/shoes/artikel/red-boot?q=1#top [localized-shop-category-item-de] | null | null | de,fr,en |
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
| /account | /compte?q=1#top [localized-account-fr] |  | /compte?q=1#top [localized-account-fr] | /compte?q=1#top [localized-account-fr] | null | null | en,de,fr |
| /account/orders | /compte/orders?q=1#top [localized-account-orders-fr] |  | /compte/orders?q=1#top [localized-account-orders-fr] | /compte/orders?q=1#top [localized-account-orders-fr] | null | null | en,de,fr |
| /account/orders/42 | /compte/orders/42?q=1#top [localized-account-orders-id-fr] | /compte/orders/42-fr?q=1#top [localized-account-orders-id-fr] | /compte/orders/42?q=1#top [localized-account-orders-id-fr] | /compte/orders/42?q=1#top [localized-account-orders-id-fr] | null | null | en,de,fr |
| /account/settings | /compte/parametres?q=1#top [localized-account-settings-fr] |  | /compte/parametres?q=1#top [localized-account-settings-fr] | /compte/parametres?q=1#top [localized-account-settings-fr] | null | null | en,de,fr |
| /compte | /compte?q=1#top [localized-account-fr] |  | /compte?q=1#top [localized-account-fr] | /compte?q=1#top [localized-account-fr] | null | null | en,de,fr |
| /compte/orders | /compte/orders?q=1#top [localized-account-orders-fr] |  | /compte/orders?q=1#top [localized-account-orders-fr] | /compte/orders?q=1#top [localized-account-orders-fr] | null | null | en,de,fr |
| /compte/orders/42 | /compte/orders/42?q=1#top [localized-account-orders-id-fr] | /compte/orders/42-fr?q=1#top [localized-account-orders-id-fr] | /compte/orders/42?q=1#top [localized-account-orders-id-fr] | /compte/orders/42?q=1#top [localized-account-orders-id-fr] | null | null | en,de,fr |
| /compte/parametres | /compte/parametres?q=1#top [localized-account-settings-fr] |  | /compte/parametres?q=1#top [localized-account-settings-fr] | /compte/parametres?q=1#top [localized-account-settings-fr] | null | null | en,de,fr |
| /konto | /compte?q=1#top [localized-account-fr] |  | /compte?q=1#top [localized-account-fr] | /compte?q=1#top [localized-account-fr] | null | null | en,de,fr |
| /konto/bestellungen | /compte/orders?q=1#top [localized-account-orders-fr] |  | /compte/orders?q=1#top [localized-account-orders-fr] | /compte/orders?q=1#top [localized-account-orders-fr] | null | null | en,de,fr |
| /konto/bestellungen/42 | /compte/orders/42?q=1#top [localized-account-orders-id-fr] | /compte/orders/42-fr?q=1#top [localized-account-orders-id-fr] | /compte/orders/42?q=1#top [localized-account-orders-id-fr] | /compte/orders/42?q=1#top [localized-account-orders-id-fr] | null | null | en,de,fr |
| /konto/einstellungen | /compte/parametres?q=1#top [localized-account-settings-fr] |  | /compte/parametres?q=1#top [localized-account-settings-fr] | /compte/parametres?q=1#top [localized-account-settings-fr] | null | null | en,de,fr |
| /laden | /shop?q=1#top [shop] |  | /shop?q=1#top [shop] | /shop?q=1#top [shop] | null | null | fr,en,de |
| /laden/shoes | /shop/shoes?q=1#top [shop-category] | /shop/shoes-fr?q=1#top [shop-category] | /shop/shoes?q=1#top [shop-category] | /shop/shoes?q=1#top [shop-category] | null | null | fr,en,de |
| /laden/shoes/artikel/red-boot | /shop/shoes/red-boot?q=1#top [shop-category-item] | /shop/shoes-fr/red-boot-fr?q=1#top [shop-category-item] | /shop/shoes/red-boot?q=1#top [shop-category-item] | /shop/shoes/red-boot?q=1#top [shop-category-item] | null | null | de,fr,en |
| /shop | /shop?q=1#top [shop] |  | /shop?q=1#top [shop] | /shop?q=1#top [shop] | null | null | fr,en,de |
| /shop/shoes | /shop/shoes?q=1#top [shop-category] | /shop/shoes-fr?q=1#top [shop-category] | /shop/shoes?q=1#top [shop-category] | /shop/shoes?q=1#top [shop-category] | null | null | fr,en,de |
| /shop/shoes/red-boot | /shop/shoes/red-boot?q=1#top [shop-category-item] | /shop/shoes-fr/red-boot-fr?q=1#top [shop-category-item] | /shop/shoes/red-boot?q=1#top [shop-category-item] | /shop/shoes/red-boot?q=1#top [shop-category-item] | null | null | de,fr,en |
| /store | /shop?q=1#top [shop] |  | /shop?q=1#top [shop] | /shop?q=1#top [shop] | null | null | fr,en,de |
| /store/shoes | /shop/shoes?q=1#top [shop-category] | /shop/shoes-fr?q=1#top [shop-category] | /shop/shoes?q=1#top [shop-category] | /shop/shoes?q=1#top [shop-category] | null | null | fr,en,de |
| /store/shoes/red-boot | /shop/shoes/red-boot?q=1#top [shop-category-item] | /shop/shoes-fr/red-boot-fr?q=1#top [shop-category-item] | /shop/shoes/red-boot?q=1#top [shop-category-item] | /shop/shoes/red-boot?q=1#top [shop-category-item] | null | null | de,fr,en |
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
