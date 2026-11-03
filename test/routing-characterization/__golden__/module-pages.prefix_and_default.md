# module-pages · prefix_and_default

pages a module pushes in pages:extend, without a name: top-level, dynamic, nested, and one named for comparison

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect | meta.i18n |
|---|---|---|---|---|
| index | / |  |  | index: en |
| about | /about |  |  | about: en |
| — | /old |  |  |  |
| from-module | /from-module |  |  | from-module: en |
| from-module-dyn-id | /from-module-dyn/:id() |  |  | from-module-dyn-id: en |
| module-parent | /module-parent |  |  | module-parent: en |
| · module-parent-child | child |  |  | module-parent-child: en |
| module-named | /module-named |  |  | module-named: en |
| localized-index | /:locale(en\|de\|fr) |  |  | index: en, de, fr |
| localized-about | /:locale(en\|de\|fr)/about |  |  | about: en, de, fr |
| localized-from-module | /:locale(en\|fr)/from-module |  |  | from-module: en, fr |
| localized-from-module-de | /:locale(de)/vom-modul |  |  | from-module: de |
| localized-from-module-dyn-id | /:locale(en\|de\|fr)/from-module-dyn/:id() |  |  | from-module-dyn-id: en, de, fr |
| localized-module-parent | /:locale(en\|de\|fr)/module-parent |  |  | module-parent: en, de, fr |
| · localized-module-parent-child | child |  |  | module-parent-child: en, de, fr |
| localized-module-named | /:locale(en\|de\|fr)/module-named |  |  | module-named: en, de, fr |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | en | null |
| /about | about | en | about | about | English | null | en | null |
| /de | localized-index | de | index | index | Deutsch | de | de | null |
| /de/about | localized-about | de | about | about | Deutsch | de | de | null |
| /de/from-module-dyn/42 | localized-from-module-dyn-id | de | from-module-dyn-id | from-module-dyn-id | Deutsch | de | de | null |
| /de/module-named | localized-module-named | de | module-named | module-named | Deutsch | de | de | null |
| /de/module-parent | localized-module-parent | de | module-parent | module-parent | Deutsch | de | de | null |
| /de/module-parent/child | localized-module-parent-child | de | module-parent-child | module-parent-child | Deutsch | de | de | null |
| /de/vom-modul | localized-from-module-de | de | from-module | from-module | Deutsch | de | de | null |
| /en | localized-index | en | index | index | English | en | en | null |
| /en/about | localized-about | en | about | about | English | en | en | null |
| /en/from-module | localized-from-module | en | from-module | from-module | English | en | en | null |
| /en/from-module-dyn/42 | localized-from-module-dyn-id | en | from-module-dyn-id | from-module-dyn-id | English | en | en | null |
| /en/module-named | localized-module-named | en | module-named | module-named | English | en | en | null |
| /en/module-parent | localized-module-parent | en | module-parent | module-parent | English | en | en | null |
| /en/module-parent/child | localized-module-parent-child | en | module-parent-child | module-parent-child | English | en | en | null |
| /fr | localized-index | fr | index | index | Français | fr | fr | null |
| /fr/about | localized-about | fr | about | about | Français | fr | fr | null |
| /fr/from-module | localized-from-module | fr | from-module | from-module | Français | fr | fr | null |
| /fr/from-module-dyn/42 | localized-from-module-dyn-id | fr | from-module-dyn-id | from-module-dyn-id | Français | fr | fr | null |
| /fr/module-named | localized-module-named | fr | module-named | module-named | Français | fr | fr | null |
| /fr/module-parent | localized-module-parent | fr | module-parent | module-parent | Français | fr | fr | null |
| /fr/module-parent/child | localized-module-parent-child | fr | module-parent-child | module-parent-child | Français | fr | fr | null |
| /from-module | from-module | en | from-module | from-module | English | null | en | null |
| /from-module-dyn/42 | from-module-dyn-id | en | from-module-dyn-id | from-module-dyn-id | English | null | en | null |
| /module-named | module-named | en | module-named | module-named | English | null | en | null |
| /module-parent | module-parent | en | module-parent | module-parent | English | null | en | null |
| /module-parent/child | module-parent-child | en | module-parent-child | module-parent-child | English | null | en | null |
| /old | null | en |  | null | English | null | en | null |
| /en/ | localized-index | en | index | index | English | en | en | null |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | about | en | about | about | English | null | en | null |
| /de/about/ | localized-about | de | about | about | Deutsch | de | de | null |
| /missing | null | en |  | null | English | null | en | null |
| /de/missing | null | de |  | null | Deutsch | de | de | null |
| /xx/about | null | en |  | null | English | null | en | null |
| /de/de/about | null | de | about | about | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | null | en,de,fr |
| /de | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /de/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | /en/about | en,de,fr |
| /de/from-module-dyn/42 | /en/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /en/from-module-dyn/42-en?q=1#top [localized-from-module-dyn-id] | /en/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /en/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | null | /en/from-module-dyn/42 | en,de,fr |
| /de/module-named | /en/module-named?q=1#top [localized-module-named] |  | /en/module-named?q=1#top [localized-module-named] | /en/module-named?q=1#top [localized-module-named] | null | /en/module-named | en,de,fr |
| /de/module-parent | /en/module-parent?q=1#top [localized-module-parent] |  | /en/module-parent?q=1#top [localized-module-parent] | /en/module-parent?q=1#top [localized-module-parent] | null | /en/module-parent | en,de,fr |
| /de/module-parent/child | /en/module-parent/child?q=1#top [localized-module-parent-child] |  | /en/module-parent/child?q=1#top [localized-module-parent-child] | /en/module-parent/child?q=1#top [localized-module-parent-child] | null | /en/module-parent/child | en,de,fr |
| /de/vom-modul | /en/from-module?q=1#top [localized-from-module] |  | /en/from-module?q=1#top [localized-from-module] | /en/from-module?q=1#top [localized-from-module] | null | /en/from-module | en,fr,de |
| /en | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /en/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | null | en,de,fr |
| /en/from-module | /en/from-module?q=1#top [localized-from-module] |  | /en/from-module?q=1#top [localized-from-module] | /en/from-module?q=1#top [localized-from-module] | null | null | en,fr,de |
| /en/from-module-dyn/42 | /en/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /en/from-module-dyn/42-en?q=1#top [localized-from-module-dyn-id] | /en/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /en/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | null | null | en,de,fr |
| /en/module-named | /en/module-named?q=1#top [localized-module-named] |  | /en/module-named?q=1#top [localized-module-named] | /en/module-named?q=1#top [localized-module-named] | null | null | en,de,fr |
| /en/module-parent | /en/module-parent?q=1#top [localized-module-parent] |  | /en/module-parent?q=1#top [localized-module-parent] | /en/module-parent?q=1#top [localized-module-parent] | null | null | en,de,fr |
| /en/module-parent/child | /en/module-parent/child?q=1#top [localized-module-parent-child] |  | /en/module-parent/child?q=1#top [localized-module-parent-child] | /en/module-parent/child?q=1#top [localized-module-parent-child] | null | null | en,de,fr |
| /fr | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /fr/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | /en/about | en,de,fr |
| /fr/from-module | /en/from-module?q=1#top [localized-from-module] |  | /en/from-module?q=1#top [localized-from-module] | /en/from-module?q=1#top [localized-from-module] | null | /en/from-module | en,fr,de |
| /fr/from-module-dyn/42 | /en/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /en/from-module-dyn/42-en?q=1#top [localized-from-module-dyn-id] | /en/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /en/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | null | /en/from-module-dyn/42 | en,de,fr |
| /fr/module-named | /en/module-named?q=1#top [localized-module-named] |  | /en/module-named?q=1#top [localized-module-named] | /en/module-named?q=1#top [localized-module-named] | null | /en/module-named | en,de,fr |
| /fr/module-parent | /en/module-parent?q=1#top [localized-module-parent] |  | /en/module-parent?q=1#top [localized-module-parent] | /en/module-parent?q=1#top [localized-module-parent] | null | /en/module-parent | en,de,fr |
| /fr/module-parent/child | /en/module-parent/child?q=1#top [localized-module-parent-child] |  | /en/module-parent/child?q=1#top [localized-module-parent-child] | /en/module-parent/child?q=1#top [localized-module-parent-child] | null | /en/module-parent/child | en,de,fr |
| /from-module | /en/from-module?q=1#top [localized-from-module] |  | /en/from-module?q=1#top [localized-from-module] | /en/from-module?q=1#top [localized-from-module] | null | null | en,fr,de |
| /from-module-dyn/42 | /en/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /en/from-module-dyn/42-en?q=1#top [localized-from-module-dyn-id] | /en/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /en/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | null | null | en,de,fr |
| /module-named | /en/module-named?q=1#top [localized-module-named] |  | /en/module-named?q=1#top [localized-module-named] | /en/module-named?q=1#top [localized-module-named] | null | null | en,de,fr |
| /module-parent | /en/module-parent?q=1#top [localized-module-parent] |  | /en/module-parent?q=1#top [localized-module-parent] | /en/module-parent?q=1#top [localized-module-parent] | null | null | en,de,fr |
| /module-parent/child | /en/module-parent/child?q=1#top [localized-module-parent-child] |  | /en/module-parent/child?q=1#top [localized-module-parent-child] | /en/module-parent/child?q=1#top [localized-module-parent-child] | null | null | en,de,fr |
| /old | /old?q=1#top [—] |  | /old?q=1#top [null] | /old?q=1#top [null] | null | null | null |
| /en/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /de/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /about/ | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | null | en,de,fr |
| /de/about/ | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | /en/about | en,de,fr |
| /missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | null | null | null |
| /de/missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | null | null | null |
| /xx/about | /en/xx/about?q=1#top [—] |  | /en/xx/about?q=1#top [null] | /en/xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | /en/about | en,de,fr |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /about | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | null | null | en,de,fr |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /de/about | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | null | null | en,de,fr |
| /de/from-module-dyn/42 | /de/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /de/from-module-dyn/42-de?q=1#top [localized-from-module-dyn-id] | /de/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /de/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | null | null | en,de,fr |
| /de/module-named | /de/module-named?q=1#top [localized-module-named] |  | /de/module-named?q=1#top [localized-module-named] | /de/module-named?q=1#top [localized-module-named] | null | null | en,de,fr |
| /de/module-parent | /de/module-parent?q=1#top [localized-module-parent] |  | /de/module-parent?q=1#top [localized-module-parent] | /de/module-parent?q=1#top [localized-module-parent] | null | null | en,de,fr |
| /de/module-parent/child | /de/module-parent/child?q=1#top [localized-module-parent-child] |  | /de/module-parent/child?q=1#top [localized-module-parent-child] | /de/module-parent/child?q=1#top [localized-module-parent-child] | null | null | en,de,fr |
| /de/vom-modul | /de/vom-modul?q=1#top [localized-from-module-de] |  | /de/vom-modul?q=1#top [localized-from-module-de] | /de/vom-modul?q=1#top [localized-from-module-de] | null | null | en,fr,de |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /en/about | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | null | /de/about | en,de,fr |
| /en/from-module | /de/vom-modul?q=1#top [localized-from-module-de] |  | /de/vom-modul?q=1#top [localized-from-module-de] | /de/vom-modul?q=1#top [localized-from-module-de] | null | /de/vom-modul | en,fr,de |
| /en/from-module-dyn/42 | /de/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /de/from-module-dyn/42-de?q=1#top [localized-from-module-dyn-id] | /de/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /de/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | null | /de/from-module-dyn/42 | en,de,fr |
| /en/module-named | /de/module-named?q=1#top [localized-module-named] |  | /de/module-named?q=1#top [localized-module-named] | /de/module-named?q=1#top [localized-module-named] | null | /de/module-named | en,de,fr |
| /en/module-parent | /de/module-parent?q=1#top [localized-module-parent] |  | /de/module-parent?q=1#top [localized-module-parent] | /de/module-parent?q=1#top [localized-module-parent] | null | /de/module-parent | en,de,fr |
| /en/module-parent/child | /de/module-parent/child?q=1#top [localized-module-parent-child] |  | /de/module-parent/child?q=1#top [localized-module-parent-child] | /de/module-parent/child?q=1#top [localized-module-parent-child] | null | /de/module-parent/child | en,de,fr |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /fr/about | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | null | /de/about | en,de,fr |
| /fr/from-module | /de/vom-modul?q=1#top [localized-from-module-de] |  | /de/vom-modul?q=1#top [localized-from-module-de] | /de/vom-modul?q=1#top [localized-from-module-de] | null | /de/vom-modul | en,fr,de |
| /fr/from-module-dyn/42 | /de/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /de/from-module-dyn/42-de?q=1#top [localized-from-module-dyn-id] | /de/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /de/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | null | /de/from-module-dyn/42 | en,de,fr |
| /fr/module-named | /de/module-named?q=1#top [localized-module-named] |  | /de/module-named?q=1#top [localized-module-named] | /de/module-named?q=1#top [localized-module-named] | null | /de/module-named | en,de,fr |
| /fr/module-parent | /de/module-parent?q=1#top [localized-module-parent] |  | /de/module-parent?q=1#top [localized-module-parent] | /de/module-parent?q=1#top [localized-module-parent] | null | /de/module-parent | en,de,fr |
| /fr/module-parent/child | /de/module-parent/child?q=1#top [localized-module-parent-child] |  | /de/module-parent/child?q=1#top [localized-module-parent-child] | /de/module-parent/child?q=1#top [localized-module-parent-child] | null | /de/module-parent/child | en,de,fr |
| /from-module | /de/vom-modul?q=1#top [localized-from-module-de] |  | /de/vom-modul?q=1#top [localized-from-module-de] | /de/vom-modul?q=1#top [localized-from-module-de] | null | null | en,fr,de |
| /from-module-dyn/42 | /de/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /de/from-module-dyn/42-de?q=1#top [localized-from-module-dyn-id] | /de/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /de/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | null | null | en,de,fr |
| /module-named | /de/module-named?q=1#top [localized-module-named] |  | /de/module-named?q=1#top [localized-module-named] | /de/module-named?q=1#top [localized-module-named] | null | null | en,de,fr |
| /module-parent | /de/module-parent?q=1#top [localized-module-parent] |  | /de/module-parent?q=1#top [localized-module-parent] | /de/module-parent?q=1#top [localized-module-parent] | null | null | en,de,fr |
| /module-parent/child | /de/module-parent/child?q=1#top [localized-module-parent-child] |  | /de/module-parent/child?q=1#top [localized-module-parent-child] | /de/module-parent/child?q=1#top [localized-module-parent-child] | null | null | en,de,fr |
| /old | /old?q=1#top [—] |  | /old?q=1#top [null] | /old?q=1#top [null] | null | null | null |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /about/ | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | null | null | en,de,fr |
| /de/about/ | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | null | null | en,de,fr |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | null | null |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | null | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [localized-about] |  | /de/about?q=1#top [localized-about] | /de/about?q=1#top [localized-about] | null | null | en,de,fr |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,fr |
| /about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | null | en,de,fr |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,de,fr |
| /de/from-module-dyn/42 | /fr/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /fr/from-module-dyn/42-fr?q=1#top [localized-from-module-dyn-id] | /fr/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /fr/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | null | /fr/from-module-dyn/42 | en,de,fr |
| /de/module-named | /fr/module-named?q=1#top [localized-module-named] |  | /fr/module-named?q=1#top [localized-module-named] | /fr/module-named?q=1#top [localized-module-named] | null | /fr/module-named | en,de,fr |
| /de/module-parent | /fr/module-parent?q=1#top [localized-module-parent] |  | /fr/module-parent?q=1#top [localized-module-parent] | /fr/module-parent?q=1#top [localized-module-parent] | null | /fr/module-parent | en,de,fr |
| /de/module-parent/child | /fr/module-parent/child?q=1#top [localized-module-parent-child] |  | /fr/module-parent/child?q=1#top [localized-module-parent-child] | /fr/module-parent/child?q=1#top [localized-module-parent-child] | null | /fr/module-parent/child | en,de,fr |
| /de/vom-modul | /fr/from-module?q=1#top [localized-from-module] |  | /fr/from-module?q=1#top [localized-from-module] | /fr/from-module?q=1#top [localized-from-module] | null | /fr/from-module | en,fr,de |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /en/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,de,fr |
| /en/from-module | /fr/from-module?q=1#top [localized-from-module] |  | /fr/from-module?q=1#top [localized-from-module] | /fr/from-module?q=1#top [localized-from-module] | null | /fr/from-module | en,fr,de |
| /en/from-module-dyn/42 | /fr/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /fr/from-module-dyn/42-fr?q=1#top [localized-from-module-dyn-id] | /fr/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /fr/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | null | /fr/from-module-dyn/42 | en,de,fr |
| /en/module-named | /fr/module-named?q=1#top [localized-module-named] |  | /fr/module-named?q=1#top [localized-module-named] | /fr/module-named?q=1#top [localized-module-named] | null | /fr/module-named | en,de,fr |
| /en/module-parent | /fr/module-parent?q=1#top [localized-module-parent] |  | /fr/module-parent?q=1#top [localized-module-parent] | /fr/module-parent?q=1#top [localized-module-parent] | null | /fr/module-parent | en,de,fr |
| /en/module-parent/child | /fr/module-parent/child?q=1#top [localized-module-parent-child] |  | /fr/module-parent/child?q=1#top [localized-module-parent-child] | /fr/module-parent/child?q=1#top [localized-module-parent-child] | null | /fr/module-parent/child | en,de,fr |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,fr |
| /fr/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | null | en,de,fr |
| /fr/from-module | /fr/from-module?q=1#top [localized-from-module] |  | /fr/from-module?q=1#top [localized-from-module] | /fr/from-module?q=1#top [localized-from-module] | null | null | en,fr,de |
| /fr/from-module-dyn/42 | /fr/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /fr/from-module-dyn/42-fr?q=1#top [localized-from-module-dyn-id] | /fr/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /fr/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | null | null | en,de,fr |
| /fr/module-named | /fr/module-named?q=1#top [localized-module-named] |  | /fr/module-named?q=1#top [localized-module-named] | /fr/module-named?q=1#top [localized-module-named] | null | null | en,de,fr |
| /fr/module-parent | /fr/module-parent?q=1#top [localized-module-parent] |  | /fr/module-parent?q=1#top [localized-module-parent] | /fr/module-parent?q=1#top [localized-module-parent] | null | null | en,de,fr |
| /fr/module-parent/child | /fr/module-parent/child?q=1#top [localized-module-parent-child] |  | /fr/module-parent/child?q=1#top [localized-module-parent-child] | /fr/module-parent/child?q=1#top [localized-module-parent-child] | null | null | en,de,fr |
| /from-module | /fr/from-module?q=1#top [localized-from-module] |  | /fr/from-module?q=1#top [localized-from-module] | /fr/from-module?q=1#top [localized-from-module] | null | null | en,fr,de |
| /from-module-dyn/42 | /fr/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /fr/from-module-dyn/42-fr?q=1#top [localized-from-module-dyn-id] | /fr/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | /fr/from-module-dyn/42?q=1#top [localized-from-module-dyn-id] | null | null | en,de,fr |
| /module-named | /fr/module-named?q=1#top [localized-module-named] |  | /fr/module-named?q=1#top [localized-module-named] | /fr/module-named?q=1#top [localized-module-named] | null | null | en,de,fr |
| /module-parent | /fr/module-parent?q=1#top [localized-module-parent] |  | /fr/module-parent?q=1#top [localized-module-parent] | /fr/module-parent?q=1#top [localized-module-parent] | null | null | en,de,fr |
| /module-parent/child | /fr/module-parent/child?q=1#top [localized-module-parent-child] |  | /fr/module-parent/child?q=1#top [localized-module-parent-child] | /fr/module-parent/child?q=1#top [localized-module-parent-child] | null | null | en,de,fr |
| /old | /old?q=1#top [—] |  | /old?q=1#top [null] | /old?q=1#top [null] | null | null | null |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | null | en,de,fr |
| /de/about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,de,fr |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | null | null |
| /de/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | null | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,de,fr |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /en/about [localized-about] | /de/about [localized-about] | /fr/about [localized-about] | /en/about [localized-about] | /de/about [localized-about] | /fr/about [localized-about] | /en/about [localized-about] | /de/about [localized-about] | /fr/about [localized-about] |
| from-module | /en/from-module [localized-from-module] | /de/vom-modul [localized-from-module-de] | /fr/from-module [localized-from-module] | /en/from-module [localized-from-module] | /de/vom-modul [localized-from-module-de] | /fr/from-module [localized-from-module] | /en/from-module [localized-from-module] | /de/vom-modul [localized-from-module-de] | /fr/from-module [localized-from-module] |
| from-module-dyn-id | /en/from-module-dyn/42 [localized-from-module-dyn-id] | /de/from-module-dyn/42 [localized-from-module-dyn-id] | /fr/from-module-dyn/42 [localized-from-module-dyn-id] | /en/from-module-dyn/42 [localized-from-module-dyn-id] | /de/from-module-dyn/42 [localized-from-module-dyn-id] | /fr/from-module-dyn/42 [localized-from-module-dyn-id] | /en/from-module-dyn/42 [localized-from-module-dyn-id] | /de/from-module-dyn/42 [localized-from-module-dyn-id] | /fr/from-module-dyn/42 [localized-from-module-dyn-id] |
| index | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] |
| module-named | /en/module-named [localized-module-named] | /de/module-named [localized-module-named] | /fr/module-named [localized-module-named] | /en/module-named [localized-module-named] | /de/module-named [localized-module-named] | /fr/module-named [localized-module-named] | /en/module-named [localized-module-named] | /de/module-named [localized-module-named] | /fr/module-named [localized-module-named] |
| module-parent | /en/module-parent [localized-module-parent] | /de/module-parent [localized-module-parent] | /fr/module-parent [localized-module-parent] | /en/module-parent [localized-module-parent] | /de/module-parent [localized-module-parent] | /fr/module-parent [localized-module-parent] | /en/module-parent [localized-module-parent] | /de/module-parent [localized-module-parent] | /fr/module-parent [localized-module-parent] |
| module-parent-child | /en/module-parent/child [localized-module-parent-child] | /de/module-parent/child [localized-module-parent-child] | /fr/module-parent/child [localized-module-parent-child] | /en/module-parent/child [localized-module-parent-child] | /de/module-parent/child [localized-module-parent-child] | /fr/module-parent/child [localized-module-parent-child] | /en/module-parent/child [localized-module-parent-child] | /de/module-parent/child [localized-module-parent-child] | /fr/module-parent/child [localized-module-parent-child] |

## Invariant breaks (0)

none
