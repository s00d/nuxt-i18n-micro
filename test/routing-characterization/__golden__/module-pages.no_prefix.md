# module-pages · no_prefix

pages a module pushes in pages:extend, without a name: top-level, dynamic, nested, and one named for comparison

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect | meta.i18n |
|---|---|---|---|---|
| index | / |  |  | index: en, de, fr |
| about | /about |  |  | about: en, de, fr |
| — | /old |  |  |  |
| from-module | /from-module |  |  | from-module: en, fr |
| from-module-dyn-id | /from-module-dyn/:id() |  |  | from-module-dyn-id: en, de, fr |
| module-parent | /module-parent |  |  | module-parent: en, de, fr |
| · module-parent-child | child |  |  | module-parent-child: en, de, fr |
| module-named | /module-named |  |  | module-named: en, de, fr |
| localized-from-module-de | /vom-modul |  |  | from-module: de |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | null | null |
| /about | about | en | about | about | English | null | null | null |
| /from-module | from-module | en | from-module | from-module | English | null | null | null |
| /from-module-dyn/42 | from-module-dyn-id | en | from-module-dyn-id | from-module-dyn-id | English | null | null | null |
| /module-named | module-named | en | module-named | module-named | English | null | null | null |
| /module-parent | module-parent | en | module-parent | module-parent | English | null | null | null |
| /module-parent/child | module-parent-child | en | module-parent-child | module-parent-child | English | null | null | null |
| /old | null | en |  | null | English | null | null | null |
| /vom-modul | localized-from-module-de | de | from-module | from-module | Deutsch | null | null | null |
| /en | null | en | index | index | English | en | null | null |
| /en/ | null | en | index | index | English | en | null | null |
| /de | null | en | index | index | English | de | null | null |
| /de/ | null | en | index | index | English | de | null | null |
| /about/ | about | en | about | about | English | null | null | null |
| /de/about/ | null | en | about | about | English | de | null | null |
| /missing | null | en |  | null | English | null | null | null |
| /de/missing | null | en |  | null | English | de | null | null |
| /xx/about | null | en |  | null | English | null | null | null |
| /de/de/about | null | en |  | null | English | de | null | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de,fr |
| /from-module | /from-module?q=1#top [from-module] |  | /from-module?q=1#top [from-module] | /from-module?q=1#top [from-module] | null | null | en,fr,de |
| /from-module-dyn/42 | /from-module-dyn/42?q=1#top [from-module-dyn-id] | /from-module-dyn/42-en?q=1#top [from-module-dyn-id] | /from-module-dyn/42?q=1#top [from-module-dyn-id] | /from-module-dyn/42?q=1#top [from-module-dyn-id] | null | null | en,de,fr |
| /module-named | /module-named?q=1#top [module-named] |  | /module-named?q=1#top [module-named] | /module-named?q=1#top [module-named] | null | null | en,de,fr |
| /module-parent | /module-parent?q=1#top [module-parent] |  | /module-parent?q=1#top [module-parent] | /module-parent?q=1#top [module-parent] | null | null | en,de,fr |
| /module-parent/child | /module-parent/child?q=1#top [module-parent-child] |  | /module-parent/child?q=1#top [module-parent-child] | /module-parent/child?q=1#top [module-parent-child] | null | null | en,de,fr |
| /old | /old?q=1#top [—] |  | /old?q=1#top [null] | /old?q=1#top [null] | null | null | null |
| /vom-modul | /from-module?q=1#top [from-module] |  | /from-module?q=1#top [from-module] | /from-module?q=1#top [from-module] | null | null | en,fr,de |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de,fr |
| /de/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de,fr |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de,fr |
| /from-module | /vom-modul?q=1#top [localized-from-module-de] |  | /vom-modul?q=1#top [localized-from-module-de] | /vom-modul?q=1#top [localized-from-module-de] | null | null | en,fr,de |
| /from-module-dyn/42 | /from-module-dyn/42?q=1#top [from-module-dyn-id] | /from-module-dyn/42-de?q=1#top [from-module-dyn-id] | /from-module-dyn/42?q=1#top [from-module-dyn-id] | /from-module-dyn/42?q=1#top [from-module-dyn-id] | null | null | en,de,fr |
| /module-named | /module-named?q=1#top [module-named] |  | /module-named?q=1#top [module-named] | /module-named?q=1#top [module-named] | null | null | en,de,fr |
| /module-parent | /module-parent?q=1#top [module-parent] |  | /module-parent?q=1#top [module-parent] | /module-parent?q=1#top [module-parent] | null | null | en,de,fr |
| /module-parent/child | /module-parent/child?q=1#top [module-parent-child] |  | /module-parent/child?q=1#top [module-parent-child] | /module-parent/child?q=1#top [module-parent-child] | null | null | en,de,fr |
| /old | /old?q=1#top [—] |  | /old?q=1#top [null] | /old?q=1#top [null] | null | null | null |
| /vom-modul | /vom-modul?q=1#top [localized-from-module-de] |  | /vom-modul?q=1#top [localized-from-module-de] | /vom-modul?q=1#top [localized-from-module-de] | null | null | en,fr,de |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de,fr |
| /de/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de,fr |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de,fr |
| /from-module | /from-module?q=1#top [from-module] |  | /from-module?q=1#top [from-module] | /from-module?q=1#top [from-module] | null | null | en,fr,de |
| /from-module-dyn/42 | /from-module-dyn/42?q=1#top [from-module-dyn-id] | /from-module-dyn/42-fr?q=1#top [from-module-dyn-id] | /from-module-dyn/42?q=1#top [from-module-dyn-id] | /from-module-dyn/42?q=1#top [from-module-dyn-id] | null | null | en,de,fr |
| /module-named | /module-named?q=1#top [module-named] |  | /module-named?q=1#top [module-named] | /module-named?q=1#top [module-named] | null | null | en,de,fr |
| /module-parent | /module-parent?q=1#top [module-parent] |  | /module-parent?q=1#top [module-parent] | /module-parent?q=1#top [module-parent] | null | null | en,de,fr |
| /module-parent/child | /module-parent/child?q=1#top [module-parent-child] |  | /module-parent/child?q=1#top [module-parent-child] | /module-parent/child?q=1#top [module-parent-child] | null | null | en,de,fr |
| /old | /old?q=1#top [—] |  | /old?q=1#top [null] | /old?q=1#top [null] | null | null | null |
| /vom-modul | /from-module?q=1#top [from-module] |  | /from-module?q=1#top [from-module] | /from-module?q=1#top [from-module] | null | null | en,fr,de |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de,fr |
| /de/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,de,fr |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / |
|---|---|---|---|
| about | /about [about] | /about [about] | /about [about] |
| from-module | /from-module [from-module] | /vom-modul [localized-from-module-de] | /from-module [from-module] |
| from-module-dyn-id | /from-module-dyn/42 [from-module-dyn-id] | /from-module-dyn/42 [from-module-dyn-id] | /from-module-dyn/42 [from-module-dyn-id] |
| index | / [index] | / [index] | / [index] |
| module-named | /module-named [module-named] | /module-named [module-named] | /module-named [module-named] |
| module-parent | /module-parent [module-parent] | /module-parent [module-parent] | /module-parent [module-parent] |
| module-parent-child | /module-parent/child [module-parent-child] | /module-parent/child [module-parent-child] | /module-parent/child [module-parent-child] |

## Invariant breaks (0)

none
