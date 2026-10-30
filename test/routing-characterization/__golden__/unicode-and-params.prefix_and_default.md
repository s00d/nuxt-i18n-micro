# unicode-and-params · prefix_and_default

non-ASCII custom paths, param matchers and optional params

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| über-uns | /about |  |  |
| archive-year | /archive/:year() |  |  |
| docs-page | /docs/:page? |  |  |
| post-id | /post-:id() |  |  |
| localized-index | /:locale(en\|de\|fr) |  |  |
| localized-über-uns | /:locale(de)/über-uns | /:locale(de)/%C3%BCber-uns |  |
| localized-über-uns-en | /:locale(en)/about |  |  |
| localized-über-uns-fr | /:locale(fr)/à-propos | /:locale(fr)/%C3%A0-propos |  |
| localized-archive-year | /:locale(en\|fr)/archive/:year() |  |  |
| localized-archive-year-de | /:locale(de)/archiv/:year(\d+) |  |  |
| localized-docs-page | /:locale(en\|de)/docs/:page? |  |  |
| localized-docs-page-fr | /:locale(fr)/documentation/:page? |  |  |
| localized-post-id | /:locale(en\|de\|fr)/post-:id() |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | null | null |
| /about | über-uns | en | über-uns | über-uns | English | null | null | null |
| /archive/2025 | archive-year | en | archive-year | archive-year | English | null | null | null |
| /de | localized-index | de | index | index | Deutsch | de | de | null |
| /de/%C3%BCber-uns | localized-über-uns | de | über-uns | über-uns | Deutsch | de | de | null |
| /de/archiv/2025 | localized-archive-year-de | de | archive-year | archive-year | Deutsch | de | de | null |
| /de/docs/2 | localized-docs-page | de | docs-page | docs-page | Deutsch | de | de | null |
| /de/post-42 | localized-post-id | de | post-id | post-id | Deutsch | de | de | null |
| /de/über-uns | localized-über-uns | de | über-uns | über-uns | Deutsch | de | de | null |
| /docs/2 | docs-page | en | docs-page | docs-page | English | null | null | null |
| /en | localized-index | en | index | index | English | en | en | null |
| /en/about | localized-über-uns-en | en | über-uns | über-uns | English | en | en | null |
| /en/archive/2025 | localized-archive-year | en | archive-year | archive-year | English | en | en | null |
| /en/docs/2 | localized-docs-page | en | docs-page | docs-page | English | en | en | null |
| /en/post-42 | localized-post-id | en | post-id | post-id | English | en | en | null |
| /fr | localized-index | fr | index | index | Français | fr | fr | null |
| /fr/%C3%A0-propos | localized-über-uns-fr | fr | über-uns | über-uns | Français | fr | fr | null |
| /fr/archive/2025 | localized-archive-year | fr | archive-year | archive-year | Français | fr | fr | null |
| /fr/documentation/2 | localized-docs-page-fr | fr | docs-page | docs-page | Français | fr | fr | null |
| /fr/post-42 | localized-post-id | fr | post-id | post-id | Français | fr | fr | null |
| /fr/à-propos | localized-über-uns-fr | fr | über-uns | über-uns | Français | fr | fr | null |
| /post-42 | post-id | en | post-id | post-id | English | null | null | null |
| /en/ | localized-index | en | index | index | English | en | en | null |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | über-uns | en | über-uns | über-uns | English | null | null | null |
| /de/about/ | null | de | über-uns | über-uns | Deutsch | de | de | null |
| /missing | null | en |  | null | English | null | null | null |
| /de/missing | null | de |  | null | Deutsch | de | de | null |
| /xx/about | null | en |  | null | English | null | null | null |
| /de/de/about | null | de |  | null | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /about | /en/about?q=1#top [localized-über-uns-en] |  | /en/about?q=1#top [localized-über-uns-en] | /en/about?q=1#top [localized-über-uns-en] | null | null | en,de,fr |
| /archive/2025 | /en/archive/2025?q=1#top [localized-archive-year] | /en/archive/2025-en?q=1#top [localized-archive-year] | /en/archive/2025?q=1#top [localized-archive-year] | /en/archive/2025?q=1#top [localized-archive-year] | null | null | en,de,fr |
| /de | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /de/%C3%BCber-uns | /en/about?q=1#top [localized-über-uns-en] |  | /en/about?q=1#top [localized-über-uns-en] | /en/about?q=1#top [localized-über-uns-en] | null | /en/about | en,de,fr |
| /de/archiv/2025 | /en/archive/2025?q=1#top [localized-archive-year] | /en/archive/2025-en?q=1#top [localized-archive-year] | /en/archive/2025?q=1#top [localized-archive-year] | /en/archive/2025?q=1#top [localized-archive-year] | null | /en/archive/2025 | en,de,fr |
| /de/docs/2 | /en/docs/2?q=1#top [localized-docs-page] | /en/docs/2-en?q=1#top [localized-docs-page] | /en/docs/2?q=1#top [localized-docs-page] | /en/docs/2?q=1#top [localized-docs-page] | null | /en/docs/2 | en,de,fr |
| /de/post-42 | /en/post-42?q=1#top [localized-post-id] | /en/post-42-en?q=1#top [localized-post-id] | /en/post-42?q=1#top [localized-post-id] | /en/post-42?q=1#top [localized-post-id] | null | /en/post-42 | en,de,fr |
| /de/über-uns | /en/about?q=1#top [localized-über-uns-en] |  | /en/about?q=1#top [localized-über-uns-en] | /en/about?q=1#top [localized-über-uns-en] | null | /en/about | en,de,fr |
| /docs/2 | /en/docs/2?q=1#top [localized-docs-page] | /en/docs/2-en?q=1#top [localized-docs-page] | /en/docs/2?q=1#top [localized-docs-page] | /en/docs/2?q=1#top [localized-docs-page] | null | null | en,de,fr |
| /en | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /en/about | /en/about?q=1#top [localized-über-uns-en] |  | /en/about?q=1#top [localized-über-uns-en] | /en/about?q=1#top [localized-über-uns-en] | null | null | en,de,fr |
| /en/archive/2025 | /en/archive/2025?q=1#top [localized-archive-year] | /en/archive/2025-en?q=1#top [localized-archive-year] | /en/archive/2025?q=1#top [localized-archive-year] | /en/archive/2025?q=1#top [localized-archive-year] | null | null | en,de,fr |
| /en/docs/2 | /en/docs/2?q=1#top [localized-docs-page] | /en/docs/2-en?q=1#top [localized-docs-page] | /en/docs/2?q=1#top [localized-docs-page] | /en/docs/2?q=1#top [localized-docs-page] | null | null | en,de,fr |
| /en/post-42 | /en/post-42?q=1#top [localized-post-id] | /en/post-42-en?q=1#top [localized-post-id] | /en/post-42?q=1#top [localized-post-id] | /en/post-42?q=1#top [localized-post-id] | null | null | en,de,fr |
| /fr | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /fr/%C3%A0-propos | /en/about?q=1#top [localized-über-uns-en] |  | /en/about?q=1#top [localized-über-uns-en] | /en/about?q=1#top [localized-über-uns-en] | null | /en/about | en,de,fr |
| /fr/archive/2025 | /en/archive/2025?q=1#top [localized-archive-year] | /en/archive/2025-en?q=1#top [localized-archive-year] | /en/archive/2025?q=1#top [localized-archive-year] | /en/archive/2025?q=1#top [localized-archive-year] | null | /en/archive/2025 | en,de,fr |
| /fr/documentation/2 | /en/docs/2?q=1#top [localized-docs-page] | /en/docs/2-en?q=1#top [localized-docs-page] | /en/docs/2?q=1#top [localized-docs-page] | /en/docs/2?q=1#top [localized-docs-page] | null | /en/docs/2 | en,de,fr |
| /fr/post-42 | /en/post-42?q=1#top [localized-post-id] | /en/post-42-en?q=1#top [localized-post-id] | /en/post-42?q=1#top [localized-post-id] | /en/post-42?q=1#top [localized-post-id] | null | /en/post-42 | en,de,fr |
| /fr/à-propos | /en/about?q=1#top [localized-über-uns-en] |  | /en/about?q=1#top [localized-über-uns-en] | /en/about?q=1#top [localized-über-uns-en] | null | /en/about | en,de,fr |
| /post-42 | /en/post-42?q=1#top [localized-post-id] | /en/post-42-en?q=1#top [localized-post-id] | /en/post-42?q=1#top [localized-post-id] | /en/post-42?q=1#top [localized-post-id] | null | null | en,de,fr |
| /en/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /de/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /about/ | /en/about?q=1#top [localized-über-uns-en] |  | /en/about?q=1#top [localized-über-uns-en] | /en/about?q=1#top [localized-über-uns-en] | null | null | en,de,fr |
| /de/about/ | /en/about?q=1#top [localized-über-uns-en] |  | /en/about?q=1#top [localized-über-uns-en] | /en/about?q=1#top [localized-über-uns-en] | null | /en/about | en,de,fr |
| /missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | null | null | null |
| /de/missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | null | /en/missing | null |
| /xx/about | /en/xx/about?q=1#top [—] |  | /en/xx/about?q=1#top [null] | /en/xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /en/de/about?q=1#top [—] |  | /en/de/about?q=1#top [null] | /en/de/about?q=1#top [null] | null | /en/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /about | /de/über-uns?q=1#top [localized-über-uns] |  | /de/über-uns?q=1#top [localized-über-uns] | /de/über-uns?q=1#top [localized-über-uns] | null | null | en,de,fr |
| /archive/2025 | /de/archiv/2025?q=1#top [localized-archive-year-de] | /de/archiv/2025-de?q=1#top [localized-archive-year-de] | /de/archiv/2025?q=1#top [localized-archive-year-de] | /de/archiv/2025?q=1#top [localized-archive-year-de] | null | null | en,de,fr |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /de/%C3%BCber-uns | /de/über-uns?q=1#top [localized-über-uns] |  | /de/über-uns?q=1#top [localized-über-uns] | /de/über-uns?q=1#top [localized-über-uns] | null | null | en,de,fr |
| /de/archiv/2025 | /de/archiv/2025?q=1#top [localized-archive-year-de] | /de/archiv/2025-de?q=1#top [localized-archive-year-de] | /de/archiv/2025?q=1#top [localized-archive-year-de] | /de/archiv/2025?q=1#top [localized-archive-year-de] | null | null | en,de,fr |
| /de/docs/2 | /de/docs/2?q=1#top [localized-docs-page] | /de/docs/2-de?q=1#top [localized-docs-page] | /de/docs/2?q=1#top [localized-docs-page] | /de/docs/2?q=1#top [localized-docs-page] | null | null | en,de,fr |
| /de/post-42 | /de/post-42?q=1#top [localized-post-id] | /de/post-42-de?q=1#top [localized-post-id] | /de/post-42?q=1#top [localized-post-id] | /de/post-42?q=1#top [localized-post-id] | null | null | en,de,fr |
| /de/über-uns | /de/über-uns?q=1#top [localized-über-uns] |  | /de/über-uns?q=1#top [localized-über-uns] | /de/über-uns?q=1#top [localized-über-uns] | null | null | en,de,fr |
| /docs/2 | /de/docs/2?q=1#top [localized-docs-page] | /de/docs/2-de?q=1#top [localized-docs-page] | /de/docs/2?q=1#top [localized-docs-page] | /de/docs/2?q=1#top [localized-docs-page] | null | null | en,de,fr |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /en/about | /de/über-uns?q=1#top [localized-über-uns] |  | /de/über-uns?q=1#top [localized-über-uns] | /de/über-uns?q=1#top [localized-über-uns] | null | /de/über-uns | en,de,fr |
| /en/archive/2025 | /de/archiv/2025?q=1#top [localized-archive-year-de] | /de/archiv/2025-de?q=1#top [localized-archive-year-de] | /de/archiv/2025?q=1#top [localized-archive-year-de] | /de/archiv/2025?q=1#top [localized-archive-year-de] | null | /de/archiv/2025 | en,de,fr |
| /en/docs/2 | /de/docs/2?q=1#top [localized-docs-page] | /de/docs/2-de?q=1#top [localized-docs-page] | /de/docs/2?q=1#top [localized-docs-page] | /de/docs/2?q=1#top [localized-docs-page] | null | /de/docs/2 | en,de,fr |
| /en/post-42 | /de/post-42?q=1#top [localized-post-id] | /de/post-42-de?q=1#top [localized-post-id] | /de/post-42?q=1#top [localized-post-id] | /de/post-42?q=1#top [localized-post-id] | null | /de/post-42 | en,de,fr |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /fr/%C3%A0-propos | /de/über-uns?q=1#top [localized-über-uns] |  | /de/über-uns?q=1#top [localized-über-uns] | /de/über-uns?q=1#top [localized-über-uns] | null | /de/über-uns | en,de,fr |
| /fr/archive/2025 | /de/archiv/2025?q=1#top [localized-archive-year-de] | /de/archiv/2025-de?q=1#top [localized-archive-year-de] | /de/archiv/2025?q=1#top [localized-archive-year-de] | /de/archiv/2025?q=1#top [localized-archive-year-de] | null | /de/archiv/2025 | en,de,fr |
| /fr/documentation/2 | /de/docs/2?q=1#top [localized-docs-page] | /de/docs/2-de?q=1#top [localized-docs-page] | /de/docs/2?q=1#top [localized-docs-page] | /de/docs/2?q=1#top [localized-docs-page] | null | /de/docs/2 | en,de,fr |
| /fr/post-42 | /de/post-42?q=1#top [localized-post-id] | /de/post-42-de?q=1#top [localized-post-id] | /de/post-42?q=1#top [localized-post-id] | /de/post-42?q=1#top [localized-post-id] | null | /de/post-42 | en,de,fr |
| /fr/à-propos | /de/über-uns?q=1#top [localized-über-uns] |  | /de/über-uns?q=1#top [localized-über-uns] | /de/über-uns?q=1#top [localized-über-uns] | null | /de/über-uns | en,de,fr |
| /post-42 | /de/post-42?q=1#top [localized-post-id] | /de/post-42-de?q=1#top [localized-post-id] | /de/post-42?q=1#top [localized-post-id] | /de/post-42?q=1#top [localized-post-id] | null | null | en,de,fr |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /about/ | /de/über-uns?q=1#top [localized-über-uns] |  | /de/über-uns?q=1#top [localized-über-uns] | /de/über-uns?q=1#top [localized-über-uns] | null | null | en,de,fr |
| /de/about/ | /de/über-uns?q=1#top [localized-über-uns] |  | /de/über-uns?q=1#top [localized-über-uns] | /de/über-uns?q=1#top [localized-über-uns] | null | null | en,de,fr |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | null | null |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | null | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,fr |
| /about | /fr/à-propos?q=1#top [localized-über-uns-fr] |  | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/à-propos?q=1#top [localized-über-uns-fr] | null | null | en,de,fr |
| /archive/2025 | /fr/archive/2025?q=1#top [localized-archive-year] | /fr/archive/2025-fr?q=1#top [localized-archive-year] | /fr/archive/2025?q=1#top [localized-archive-year] | /fr/archive/2025?q=1#top [localized-archive-year] | null | null | en,de,fr |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/%C3%BCber-uns | /fr/à-propos?q=1#top [localized-über-uns-fr] |  | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/à-propos?q=1#top [localized-über-uns-fr] | null | /fr/à-propos | en,de,fr |
| /de/archiv/2025 | /fr/archive/2025?q=1#top [localized-archive-year] | /fr/archive/2025-fr?q=1#top [localized-archive-year] | /fr/archive/2025?q=1#top [localized-archive-year] | /fr/archive/2025?q=1#top [localized-archive-year] | null | /fr/archive/2025 | en,de,fr |
| /de/docs/2 | /fr/documentation/2?q=1#top [localized-docs-page-fr] | /fr/documentation/2-fr?q=1#top [localized-docs-page-fr] | /fr/documentation/2?q=1#top [localized-docs-page-fr] | /fr/documentation/2?q=1#top [localized-docs-page-fr] | null | /fr/documentation/2 | en,de,fr |
| /de/post-42 | /fr/post-42?q=1#top [localized-post-id] | /fr/post-42-fr?q=1#top [localized-post-id] | /fr/post-42?q=1#top [localized-post-id] | /fr/post-42?q=1#top [localized-post-id] | null | /fr/post-42 | en,de,fr |
| /de/über-uns | /fr/à-propos?q=1#top [localized-über-uns-fr] |  | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/à-propos?q=1#top [localized-über-uns-fr] | null | /fr/à-propos | en,de,fr |
| /docs/2 | /fr/documentation/2?q=1#top [localized-docs-page-fr] | /fr/documentation/2-fr?q=1#top [localized-docs-page-fr] | /fr/documentation/2?q=1#top [localized-docs-page-fr] | /fr/documentation/2?q=1#top [localized-docs-page-fr] | null | null | en,de,fr |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /en/about | /fr/à-propos?q=1#top [localized-über-uns-fr] |  | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/à-propos?q=1#top [localized-über-uns-fr] | null | /fr/à-propos | en,de,fr |
| /en/archive/2025 | /fr/archive/2025?q=1#top [localized-archive-year] | /fr/archive/2025-fr?q=1#top [localized-archive-year] | /fr/archive/2025?q=1#top [localized-archive-year] | /fr/archive/2025?q=1#top [localized-archive-year] | null | /fr/archive/2025 | en,de,fr |
| /en/docs/2 | /fr/documentation/2?q=1#top [localized-docs-page-fr] | /fr/documentation/2-fr?q=1#top [localized-docs-page-fr] | /fr/documentation/2?q=1#top [localized-docs-page-fr] | /fr/documentation/2?q=1#top [localized-docs-page-fr] | null | /fr/documentation/2 | en,de,fr |
| /en/post-42 | /fr/post-42?q=1#top [localized-post-id] | /fr/post-42-fr?q=1#top [localized-post-id] | /fr/post-42?q=1#top [localized-post-id] | /fr/post-42?q=1#top [localized-post-id] | null | /fr/post-42 | en,de,fr |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,fr |
| /fr/%C3%A0-propos | /fr/à-propos?q=1#top [localized-über-uns-fr] |  | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/à-propos?q=1#top [localized-über-uns-fr] | null | null | en,de,fr |
| /fr/archive/2025 | /fr/archive/2025?q=1#top [localized-archive-year] | /fr/archive/2025-fr?q=1#top [localized-archive-year] | /fr/archive/2025?q=1#top [localized-archive-year] | /fr/archive/2025?q=1#top [localized-archive-year] | null | null | en,de,fr |
| /fr/documentation/2 | /fr/documentation/2?q=1#top [localized-docs-page-fr] | /fr/documentation/2-fr?q=1#top [localized-docs-page-fr] | /fr/documentation/2?q=1#top [localized-docs-page-fr] | /fr/documentation/2?q=1#top [localized-docs-page-fr] | null | null | en,de,fr |
| /fr/post-42 | /fr/post-42?q=1#top [localized-post-id] | /fr/post-42-fr?q=1#top [localized-post-id] | /fr/post-42?q=1#top [localized-post-id] | /fr/post-42?q=1#top [localized-post-id] | null | null | en,de,fr |
| /fr/à-propos | /fr/à-propos?q=1#top [localized-über-uns-fr] |  | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/à-propos?q=1#top [localized-über-uns-fr] | null | null | en,de,fr |
| /post-42 | /fr/post-42?q=1#top [localized-post-id] | /fr/post-42-fr?q=1#top [localized-post-id] | /fr/post-42?q=1#top [localized-post-id] | /fr/post-42?q=1#top [localized-post-id] | null | null | en,de,fr |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /about/ | /fr/à-propos?q=1#top [localized-über-uns-fr] |  | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/à-propos?q=1#top [localized-über-uns-fr] | null | null | en,de,fr |
| /de/about/ | /fr/à-propos?q=1#top [localized-über-uns-fr] |  | /fr/à-propos?q=1#top [localized-über-uns-fr] | /fr/à-propos?q=1#top [localized-über-uns-fr] | null | /fr/à-propos | en,de,fr |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | null | null |
| /de/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | /fr/missing | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /fr/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | null | /fr/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| archive-year | /en/archive/2025 [localized-archive-year] | /de/archiv/2025 [localized-archive-year-de] | /fr/archive/2025 [localized-archive-year] | /en/archive/2025 [localized-archive-year] | /de/archiv/2025 [localized-archive-year-de] | /fr/archive/2025 [localized-archive-year] | /en/archive/2025 [localized-archive-year] | /de/archiv/2025 [localized-archive-year-de] | /fr/archive/2025 [localized-archive-year] |
| docs-page | /en/docs/2 [localized-docs-page] | /de/docs/2 [localized-docs-page] | /fr/documentation/2 [localized-docs-page-fr] | /en/docs/2 [localized-docs-page] | /de/docs/2 [localized-docs-page] | /fr/documentation/2 [localized-docs-page-fr] | /en/docs/2 [localized-docs-page] | /de/docs/2 [localized-docs-page] | /fr/documentation/2 [localized-docs-page-fr] |
| index | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] |
| post-id | /en/post-42 [localized-post-id] | /de/post-42 [localized-post-id] | /fr/post-42 [localized-post-id] | /en/post-42 [localized-post-id] | /de/post-42 [localized-post-id] | /fr/post-42 [localized-post-id] | /en/post-42 [localized-post-id] | /de/post-42 [localized-post-id] | /fr/post-42 [localized-post-id] |
| über-uns | /en/about [localized-über-uns-en] | /de/über-uns [localized-über-uns] | /fr/à-propos [localized-über-uns-fr] | /en/about [localized-über-uns-en] | /de/über-uns [localized-über-uns] | /fr/à-propos [localized-über-uns-fr] | /en/about [localized-über-uns-en] | /de/über-uns [localized-über-uns] | /fr/à-propos [localized-über-uns-fr] |

## Invariant breaks (0)

none
