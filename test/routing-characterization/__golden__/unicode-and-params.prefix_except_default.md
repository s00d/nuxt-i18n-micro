# unicode-and-params · prefix_except_default

non-ASCII custom paths, param matchers and optional params

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| über-uns | /about | /über-uns, /%C3%BCber-uns |  |
| archive-year | /archive/:year() |  |  |
| docs-page | /docs/:page? |  |  |
| post-id | /post-:id() |  |  |
| localized-index | /:locale(de\|fr) |  |  |
| localized-über-uns | /:locale(de)/über-uns | /:locale(de)/%C3%BCber-uns |  |
| localized-über-uns-fr | /:locale(fr)/à-propos | /:locale(fr)/%C3%A0-propos |  |
| localized-archive-year | /:locale(fr)/archive/:year() |  |  |
| localized-archive-year-de | /:locale(de)/archiv/:year(\d+) |  |  |
| localized-docs-page | /:locale(de)/docs/:page? |  |  |
| localized-docs-page-fr | /:locale(fr)/documentation/:page? |  |  |
| localized-post-id | /:locale(de\|fr)/post-:id() |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | en | null |
| /%C3%BCber-uns | über-uns | en | über-uns | über-uns | English | null | en | null |
| /about | über-uns | en | über-uns | über-uns | English | null | en | null |
| /archive/2025 | archive-year | en | archive-year | archive-year | English | null | en | null |
| /de | localized-index | de | index | index | Deutsch | de | de | null |
| /de/%C3%BCber-uns | localized-über-uns | de | über-uns | über-uns | Deutsch | de | de | null |
| /de/archiv/2025 | localized-archive-year-de | de | archive-year | archive-year | Deutsch | de | de | null |
| /de/docs/2 | localized-docs-page | de | docs-page | docs-page | Deutsch | de | de | null |
| /de/post-42 | localized-post-id | de | post-id | post-id | Deutsch | de | de | null |
| /de/über-uns | localized-über-uns | de | über-uns | über-uns | Deutsch | de | de | null |
| /docs/2 | docs-page | en | docs-page | docs-page | English | null | en | null |
| /fr | localized-index | fr | index | index | Français | fr | fr | null |
| /fr/%C3%A0-propos | localized-über-uns-fr | fr | über-uns | über-uns | Français | fr | fr | null |
| /fr/archive/2025 | localized-archive-year | fr | archive-year | archive-year | Français | fr | fr | null |
| /fr/documentation/2 | localized-docs-page-fr | fr | docs-page | docs-page | Français | fr | fr | null |
| /fr/post-42 | localized-post-id | fr | post-id | post-id | Français | fr | fr | null |
| /fr/à-propos | localized-über-uns-fr | fr | über-uns | über-uns | Français | fr | fr | null |
| /post-42 | post-id | en | post-id | post-id | English | null | en | null |
| /über-uns | über-uns | en | über-uns | über-uns | English | null | en | null |
| /en | null | en |  | index | English | en | en | Default locale should not have prefix |
| /en/ | null | en |  | index | English | en | en | Default locale should not have prefix |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | über-uns | en | über-uns | über-uns | English | null | en | null |
| /de/about/ | null | de |  | über-uns | Deutsch | de | de | null |
| /missing | null | en |  | null | English | null | en | null |
| /de/missing | null | de |  | null | Deutsch | de | de | null |
| /xx/about | null | en |  | null | English | null | en | null |
| /de/de/about | null | de |  | null | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /%C3%BCber-uns | /about?q=1#top [über-uns] |  | /about?q=1#top [über-uns] | /about?q=1#top [über-uns] | /%C3%BCber-uns | /about |
| /about | /about?q=1#top [über-uns] |  | /about?q=1#top [über-uns] | /about?q=1#top [über-uns] | /about | null |
| /archive/2025 | /archive/2025?q=1#top [archive-year] | /archive/2025-en?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | /archive/2025 | null |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/%C3%BCber-uns | /about?q=1#top [über-uns] |  | /about?q=1#top [über-uns] | /about?q=1#top [über-uns] | /de/%C3%BCber-uns | null |
| /de/archiv/2025 | /archive/2025?q=1#top [archive-year] | /archive/2025-en?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | /de/archiv/2025 | null |
| /de/docs/2 | /docs/2?q=1#top [docs-page] | /docs/2-en?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | /de/docs/2 | null |
| /de/post-42 | /post-42?q=1#top [post-id] | /post-42-en?q=1#top [post-id] | /post-42?q=1#top [post-id] | /post-42?q=1#top [post-id] | /de/post-42 | null |
| /de/über-uns | /about?q=1#top [über-uns] |  | /about?q=1#top [über-uns] | /about?q=1#top [über-uns] | /de/über-uns | null |
| /docs/2 | /docs/2?q=1#top [docs-page] | /docs/2-en?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | /docs/2 | null |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /fr | null |
| /fr/%C3%A0-propos | /about?q=1#top [über-uns] |  | /about?q=1#top [über-uns] | /about?q=1#top [über-uns] | /fr/%C3%A0-propos | null |
| /fr/archive/2025 | /archive/2025?q=1#top [archive-year] | /archive/2025-en?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | /fr/archive/2025 | null |
| /fr/documentation/2 | /docs/2?q=1#top [docs-page] | /docs/2-en?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | /fr/documentation/2 | null |
| /fr/post-42 | /post-42?q=1#top [post-id] | /post-42-en?q=1#top [post-id] | /post-42?q=1#top [post-id] | /post-42?q=1#top [post-id] | /fr/post-42 | null |
| /fr/à-propos | /about?q=1#top [über-uns] |  | /about?q=1#top [über-uns] | /about?q=1#top [über-uns] | /fr/à-propos | null |
| /post-42 | /post-42?q=1#top [post-id] | /post-42-en?q=1#top [post-id] | /post-42?q=1#top [post-id] | /post-42?q=1#top [post-id] | /post-42 | null |
| /über-uns | /about?q=1#top [über-uns] |  | /about?q=1#top [über-uns] | /about?q=1#top [über-uns] | /über-uns | /about |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /about?q=1#top [über-uns] |  | /about?q=1#top [über-uns] | /about?q=1#top [über-uns] | /about/ | null |
| /de/about/ | /about?q=1#top [über-uns] |  | /about?q=1#top [über-uns] | /about?q=1#top [über-uns] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | / | /de |
| /%C3%BCber-uns | /de/über-uns?q=1#top [localized-über-uns] |  | /de/über-uns?q=1#top [localized-über-uns] | /de/über-uns?q=1#top [localized-über-uns] | /%C3%BCber-uns | /de/über-uns |
| /about | /de/über-uns?q=1#top [localized-über-uns] |  | /de/über-uns?q=1#top [localized-über-uns] | /de/über-uns?q=1#top [localized-über-uns] | /about | /de/über-uns |
| /archive/2025 | /de/archiv/2025?q=1#top [localized-archive-year-de] | /de/archiv/2025-de?q=1#top [localized-archive-year-de] | /de/archiv/2025?q=1#top [localized-archive-year-de] | /de/archiv/2025?q=1#top [localized-archive-year-de] | /archive/2025 | /de/archiv/2025 |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | null |
| /de/%C3%BCber-uns | /de/über-uns?q=1#top [localized-über-uns] |  | /de/über-uns?q=1#top [localized-über-uns] | /de/über-uns?q=1#top [localized-über-uns] | /de/%C3%BCber-uns | null |
| /de/archiv/2025 | /de/archiv/2025?q=1#top [localized-archive-year-de] | /de/archiv/2025-de?q=1#top [localized-archive-year-de] | /de/archiv/2025?q=1#top [localized-archive-year-de] | /de/archiv/2025?q=1#top [localized-archive-year-de] | /de/archiv/2025 | null |
| /de/docs/2 | /de/docs/2?q=1#top [localized-docs-page] | /de/docs/2-de?q=1#top [localized-docs-page] | /de/docs/2?q=1#top [localized-docs-page] | /de/docs/2?q=1#top [localized-docs-page] | /de/docs/2 | null |
| /de/post-42 | /de/post-42?q=1#top [localized-post-id] | /de/post-42-de?q=1#top [localized-post-id] | /de/post-42?q=1#top [localized-post-id] | /de/post-42?q=1#top [localized-post-id] | /de/post-42 | null |
| /de/über-uns | /de/über-uns?q=1#top [localized-über-uns] |  | /de/über-uns?q=1#top [localized-über-uns] | /de/über-uns?q=1#top [localized-über-uns] | /de/über-uns | null |
| /docs/2 | /de/docs/2?q=1#top [localized-docs-page] | /de/docs/2-de?q=1#top [localized-docs-page] | /de/docs/2?q=1#top [localized-docs-page] | /de/docs/2?q=1#top [localized-docs-page] | /docs/2 | /de/docs/2 |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /fr | null |
| /fr/%C3%A0-propos | /de/über-uns?q=1#top [localized-über-uns] |  | /de/über-uns?q=1#top [localized-über-uns] | /de/über-uns?q=1#top [localized-über-uns] | /fr/%C3%A0-propos | null |
| /fr/archive/2025 | /de/archiv/2025?q=1#top [localized-archive-year-de] | /de/archiv/2025-de?q=1#top [localized-archive-year-de] | /de/archiv/2025?q=1#top [localized-archive-year-de] | /de/archiv/2025?q=1#top [localized-archive-year-de] | /fr/archive/2025 | null |
| /fr/documentation/2 | /de/docs/2?q=1#top [localized-docs-page] | /de/docs/2-de?q=1#top [localized-docs-page] | /de/docs/2?q=1#top [localized-docs-page] | /de/docs/2?q=1#top [localized-docs-page] | /fr/documentation/2 | null |
| /fr/post-42 | /de/post-42?q=1#top [localized-post-id] | /de/post-42-de?q=1#top [localized-post-id] | /de/post-42?q=1#top [localized-post-id] | /de/post-42?q=1#top [localized-post-id] | /fr/post-42 | null |
| /fr/à-propos | /de/über-uns?q=1#top [localized-über-uns] |  | /de/über-uns?q=1#top [localized-über-uns] | /de/über-uns?q=1#top [localized-über-uns] | /fr/à-propos | null |
| /post-42 | /de/post-42?q=1#top [localized-post-id] | /de/post-42-de?q=1#top [localized-post-id] | /de/post-42?q=1#top [localized-post-id] | /de/post-42?q=1#top [localized-post-id] | /post-42 | /de/post-42 |
| /über-uns | /de/über-uns?q=1#top [localized-über-uns] |  | /de/über-uns?q=1#top [localized-über-uns] | /de/über-uns?q=1#top [localized-über-uns] | /über-uns | /de/über-uns |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en | null |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en/ | null |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de/ | null |
| /about/ | /de/über-uns?q=1#top [localized-über-uns] |  | /de/über-uns?q=1#top [localized-über-uns] | /de/über-uns?q=1#top [localized-über-uns] | /about/ | /de/über-uns |
| /de/about/ | /de/über-uns?q=1#top [localized-über-uns] |  | /de/über-uns?q=1#top [localized-über-uns] | /de/über-uns?q=1#top [localized-über-uns] | /de/about/ | null |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /missing | /de/missing |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /xx/about | /de/xx/about |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | / | /fr |
| /%C3%BCber-uns | /fr/à-propos?q=1#top [localized-über-uns-fr] |  | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/à-propos?q=1#top [localized-über-uns-fr] | /%C3%BCber-uns | /fr/à-propos |
| /about | /fr/à-propos?q=1#top [localized-über-uns-fr] |  | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/à-propos?q=1#top [localized-über-uns-fr] | /about | /fr/à-propos |
| /archive/2025 | /fr/archive/2025?q=1#top [localized-archive-year] | /fr/archive/2025-fr?q=1#top [localized-archive-year] | /fr/archive/2025?q=1#top [localized-archive-year] | /fr/archive/2025?q=1#top [localized-archive-year] | /archive/2025 | /fr/archive/2025 |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de | null |
| /de/%C3%BCber-uns | /fr/à-propos?q=1#top [localized-über-uns-fr] |  | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/à-propos?q=1#top [localized-über-uns-fr] | /de/%C3%BCber-uns | null |
| /de/archiv/2025 | /fr/archive/2025?q=1#top [localized-archive-year] | /fr/archive/2025-fr?q=1#top [localized-archive-year] | /fr/archive/2025?q=1#top [localized-archive-year] | /fr/archive/2025?q=1#top [localized-archive-year] | /de/archiv/2025 | null |
| /de/docs/2 | /fr/documentation/2?q=1#top [localized-docs-page-fr] | /fr/documentation/2-fr?q=1#top [localized-docs-page-fr] | /fr/documentation/2?q=1#top [localized-docs-page-fr] | /fr/documentation/2?q=1#top [localized-docs-page-fr] | /de/docs/2 | null |
| /de/post-42 | /fr/post-42?q=1#top [localized-post-id] | /fr/post-42-fr?q=1#top [localized-post-id] | /fr/post-42?q=1#top [localized-post-id] | /fr/post-42?q=1#top [localized-post-id] | /de/post-42 | null |
| /de/über-uns | /fr/à-propos?q=1#top [localized-über-uns-fr] |  | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/à-propos?q=1#top [localized-über-uns-fr] | /de/über-uns | null |
| /docs/2 | /fr/documentation/2?q=1#top [localized-docs-page-fr] | /fr/documentation/2-fr?q=1#top [localized-docs-page-fr] | /fr/documentation/2?q=1#top [localized-docs-page-fr] | /fr/documentation/2?q=1#top [localized-docs-page-fr] | /docs/2 | /fr/documentation/2 |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | null |
| /fr/%C3%A0-propos | /fr/à-propos?q=1#top [localized-über-uns-fr] |  | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/%C3%A0-propos | null |
| /fr/archive/2025 | /fr/archive/2025?q=1#top [localized-archive-year] | /fr/archive/2025-fr?q=1#top [localized-archive-year] | /fr/archive/2025?q=1#top [localized-archive-year] | /fr/archive/2025?q=1#top [localized-archive-year] | /fr/archive/2025 | null |
| /fr/documentation/2 | /fr/documentation/2?q=1#top [localized-docs-page-fr] | /fr/documentation/2-fr?q=1#top [localized-docs-page-fr] | /fr/documentation/2?q=1#top [localized-docs-page-fr] | /fr/documentation/2?q=1#top [localized-docs-page-fr] | /fr/documentation/2 | null |
| /fr/post-42 | /fr/post-42?q=1#top [localized-post-id] | /fr/post-42-fr?q=1#top [localized-post-id] | /fr/post-42?q=1#top [localized-post-id] | /fr/post-42?q=1#top [localized-post-id] | /fr/post-42 | null |
| /fr/à-propos | /fr/à-propos?q=1#top [localized-über-uns-fr] |  | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/à-propos | null |
| /post-42 | /fr/post-42?q=1#top [localized-post-id] | /fr/post-42-fr?q=1#top [localized-post-id] | /fr/post-42?q=1#top [localized-post-id] | /fr/post-42?q=1#top [localized-post-id] | /post-42 | /fr/post-42 |
| /über-uns | /fr/à-propos?q=1#top [localized-über-uns-fr] |  | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/à-propos?q=1#top [localized-über-uns-fr] | /über-uns | /fr/à-propos |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en | null |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en/ | null |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de/ | null |
| /about/ | /fr/à-propos?q=1#top [localized-über-uns-fr] |  | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/à-propos?q=1#top [localized-über-uns-fr] | /about/ | /fr/à-propos |
| /de/about/ | /fr/à-propos?q=1#top [localized-über-uns-fr] |  | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/à-propos?q=1#top [localized-über-uns-fr] | /de/about/ | null |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /missing | /fr/missing |
| /de/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | /xx/about | /fr/xx/about |
| /de/de/about | /fr/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| archive-year | /archive/2025 [archive-year] | /de/archiv/2025 [localized-archive-year-de] | /fr/archive/2025 [localized-archive-year] | /archive/2025 [archive-year] | /de/archiv/2025 [localized-archive-year-de] | /fr/archive/2025 [localized-archive-year] | /archive/2025 [archive-year] | /de/archiv/2025 [localized-archive-year-de] | /fr/archive/2025 [localized-archive-year] |
| docs-page | /docs/2 [docs-page] | /de/docs/2 [localized-docs-page] | /fr/documentation/2 [localized-docs-page-fr] | /docs/2 [docs-page] | /de/docs/2 [localized-docs-page] | /fr/documentation/2 [localized-docs-page-fr] | /docs/2 [docs-page] | /de/docs/2 [localized-docs-page] | /fr/documentation/2 [localized-docs-page-fr] |
| index | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] |
| post-id | /post-42 [post-id] | /de/post-42 [localized-post-id] | /fr/post-42 [localized-post-id] | /post-42 [post-id] | /de/post-42 [localized-post-id] | /fr/post-42 [localized-post-id] | /post-42 [post-id] | /de/post-42 [localized-post-id] | /fr/post-42 [localized-post-id] |
| über-uns | /about [über-uns] | /de/über-uns [localized-über-uns] | /fr/à-propos [localized-über-uns-fr] | /about [über-uns] | /de/über-uns [localized-über-uns] | /fr/à-propos [localized-über-uns-fr] | /about [über-uns] | /de/über-uns [localized-über-uns] | /fr/à-propos [localized-über-uns-fr] |

## Invariant breaks (0)

none
