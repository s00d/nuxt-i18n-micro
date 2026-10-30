# unicode-and-params · no_prefix

non-ASCII custom paths, param matchers and optional params

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect | meta.i18n |
|---|---|---|---|---|
| index | / |  |  | index: en, de, fr |
| über-uns | /über-uns | /%C3%BCber-uns |  | über-uns: de |
| archive-year | /archive/:year() |  |  | archive-year: en, fr |
| docs-page | /docs/:page? |  |  | docs-page: en, de |
| post-id | /post-:id() |  |  | post-id: en, de, fr |
| localized-über-uns-en | /about |  |  | über-uns: en |
| localized-über-uns-fr | /à-propos | /%C3%A0-propos |  | über-uns: fr |
| localized-archive-year-de | /archiv/:year(\d+) |  |  | archive-year: de |
| localized-docs-page-fr | /documentation/:page? |  |  | docs-page: fr |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | null | null |
| /%C3%A0-propos | localized-über-uns-fr | fr | über-uns | über-uns | Français | null | null | null |
| /%C3%BCber-uns | über-uns | en | über-uns | über-uns | English | null | null | null |
| /about | localized-über-uns-en | en | über-uns | über-uns | English | null | null | null |
| /archiv/2025 | localized-archive-year-de | de | archive-year | archive-year | Deutsch | null | null | null |
| /archive/2025 | archive-year | en | archive-year | archive-year | English | null | null | null |
| /docs/2 | docs-page | en | docs-page | docs-page | English | null | null | null |
| /documentation/2 | localized-docs-page-fr | fr | docs-page | docs-page | Français | null | null | null |
| /post-42 | post-id | en | post-id | post-id | English | null | null | null |
| /à-propos | localized-über-uns-fr | fr | über-uns | über-uns | Français | null | null | null |
| /über-uns | über-uns | en | über-uns | über-uns | English | null | null | null |
| /en | null | en | index | index | English | en | null | null |
| /en/ | null | en | index | index | English | en | null | null |
| /de | null | en | index | index | English | de | null | null |
| /de/ | null | en | index | index | English | de | null | null |
| /about/ | localized-über-uns-en | en | über-uns | über-uns | English | null | null | null |
| /de/about/ | null | en | über-uns | über-uns | English | de | null | null |
| /missing | null | en |  | null | English | null | null | null |
| /de/missing | null | en |  | null | English | de | null | null |
| /xx/about | null | en |  | null | English | null | null | null |
| /de/de/about | null | en |  | null | English | de | null | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /%C3%A0-propos | /about?q=1#top [localized-über-uns-en] |  | /about?q=1#top [localized-über-uns-en] | /about?q=1#top [localized-über-uns-en] | null | null | de,en,fr |
| /%C3%BCber-uns | /about?q=1#top [localized-über-uns-en] |  | /about?q=1#top [localized-über-uns-en] | /about?q=1#top [localized-über-uns-en] | null | null | de,en,fr |
| /about | /about?q=1#top [localized-über-uns-en] |  | /about?q=1#top [localized-über-uns-en] | /about?q=1#top [localized-über-uns-en] | null | null | de,en,fr |
| /archiv/2025 | /archive/2025?q=1#top [archive-year] | /archive/2025-en?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | null | null | de,en,fr |
| /archive/2025 | /archive/2025?q=1#top [archive-year] | /archive/2025-en?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | null | null | de,en,fr |
| /docs/2 | /docs/2?q=1#top [docs-page] | /docs/2-en?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | null | null | en,de,fr |
| /documentation/2 | /docs/2?q=1#top [docs-page] | /docs/2-en?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | null | null | en,de,fr |
| /post-42 | /post-42?q=1#top [post-id] | /post-42-en?q=1#top [post-id] | /post-42?q=1#top [post-id] | /post-42?q=1#top [post-id] | null | null | en,de,fr |
| /à-propos | /about?q=1#top [localized-über-uns-en] |  | /about?q=1#top [localized-über-uns-en] | /about?q=1#top [localized-über-uns-en] | null | null | de,en,fr |
| /über-uns | /about?q=1#top [localized-über-uns-en] |  | /about?q=1#top [localized-über-uns-en] | /about?q=1#top [localized-über-uns-en] | null | null | de,en,fr |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about/ | /about?q=1#top [localized-über-uns-en] |  | /about?q=1#top [localized-über-uns-en] | /about?q=1#top [localized-über-uns-en] | null | null | de,en,fr |
| /de/about/ | /about?q=1#top [localized-über-uns-en] |  | /about?q=1#top [localized-über-uns-en] | /about?q=1#top [localized-über-uns-en] | null | null | de,en,fr |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /%C3%A0-propos | /über-uns?q=1#top [über-uns] |  | /über-uns?q=1#top [über-uns] | /über-uns?q=1#top [über-uns] | null | null | de,en,fr |
| /%C3%BCber-uns | /über-uns?q=1#top [über-uns] |  | /über-uns?q=1#top [über-uns] | /über-uns?q=1#top [über-uns] | null | null | de,en,fr |
| /about | /über-uns?q=1#top [über-uns] |  | /über-uns?q=1#top [über-uns] | /über-uns?q=1#top [über-uns] | null | null | de,en,fr |
| /archiv/2025 | /archiv/2025?q=1#top [localized-archive-year-de] | /archiv/2025-de?q=1#top [localized-archive-year-de] | /archiv/2025?q=1#top [localized-archive-year-de] | /archiv/2025?q=1#top [localized-archive-year-de] | null | null | de,en,fr |
| /archive/2025 | /archiv/2025?q=1#top [localized-archive-year-de] | /archiv/2025-de?q=1#top [localized-archive-year-de] | /archiv/2025?q=1#top [localized-archive-year-de] | /archiv/2025?q=1#top [localized-archive-year-de] | null | null | de,en,fr |
| /docs/2 | /docs/2?q=1#top [docs-page] | /docs/2-de?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | null | null | en,de,fr |
| /documentation/2 | /docs/2?q=1#top [docs-page] | /docs/2-de?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | null | null | en,de,fr |
| /post-42 | /post-42?q=1#top [post-id] | /post-42-de?q=1#top [post-id] | /post-42?q=1#top [post-id] | /post-42?q=1#top [post-id] | null | null | en,de,fr |
| /à-propos | /über-uns?q=1#top [über-uns] |  | /über-uns?q=1#top [über-uns] | /über-uns?q=1#top [über-uns] | null | null | de,en,fr |
| /über-uns | /über-uns?q=1#top [über-uns] |  | /über-uns?q=1#top [über-uns] | /über-uns?q=1#top [über-uns] | null | null | de,en,fr |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about/ | /über-uns?q=1#top [über-uns] |  | /über-uns?q=1#top [über-uns] | /über-uns?q=1#top [über-uns] | null | null | de,en,fr |
| /de/about/ | /über-uns?q=1#top [über-uns] |  | /über-uns?q=1#top [über-uns] | /über-uns?q=1#top [über-uns] | null | null | de,en,fr |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /%C3%A0-propos | /à-propos?q=1#top [localized-über-uns-fr] |  | /à-propos?q=1#top [localized-über-uns-fr] | /à-propos?q=1#top [localized-über-uns-fr] | null | null | de,en,fr |
| /%C3%BCber-uns | /à-propos?q=1#top [localized-über-uns-fr] |  | /à-propos?q=1#top [localized-über-uns-fr] | /à-propos?q=1#top [localized-über-uns-fr] | null | null | de,en,fr |
| /about | /à-propos?q=1#top [localized-über-uns-fr] |  | /à-propos?q=1#top [localized-über-uns-fr] | /à-propos?q=1#top [localized-über-uns-fr] | null | null | de,en,fr |
| /archiv/2025 | /archive/2025?q=1#top [archive-year] | /archive/2025-fr?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | null | null | de,en,fr |
| /archive/2025 | /archive/2025?q=1#top [archive-year] | /archive/2025-fr?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | null | null | de,en,fr |
| /docs/2 | /documentation/2?q=1#top [localized-docs-page-fr] | /documentation/2-fr?q=1#top [localized-docs-page-fr] | /documentation/2?q=1#top [localized-docs-page-fr] | /documentation/2?q=1#top [localized-docs-page-fr] | null | null | en,de,fr |
| /documentation/2 | /documentation/2?q=1#top [localized-docs-page-fr] | /documentation/2-fr?q=1#top [localized-docs-page-fr] | /documentation/2?q=1#top [localized-docs-page-fr] | /documentation/2?q=1#top [localized-docs-page-fr] | null | null | en,de,fr |
| /post-42 | /post-42?q=1#top [post-id] | /post-42-fr?q=1#top [post-id] | /post-42?q=1#top [post-id] | /post-42?q=1#top [post-id] | null | null | en,de,fr |
| /à-propos | /à-propos?q=1#top [localized-über-uns-fr] |  | /à-propos?q=1#top [localized-über-uns-fr] | /à-propos?q=1#top [localized-über-uns-fr] | null | null | de,en,fr |
| /über-uns | /à-propos?q=1#top [localized-über-uns-fr] |  | /à-propos?q=1#top [localized-über-uns-fr] | /à-propos?q=1#top [localized-über-uns-fr] | null | null | de,en,fr |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about/ | /à-propos?q=1#top [localized-über-uns-fr] |  | /à-propos?q=1#top [localized-über-uns-fr] | /à-propos?q=1#top [localized-über-uns-fr] | null | null | de,en,fr |
| /de/about/ | /à-propos?q=1#top [localized-über-uns-fr] |  | /à-propos?q=1#top [localized-über-uns-fr] | /à-propos?q=1#top [localized-über-uns-fr] | null | null | de,en,fr |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / |
|---|---|---|---|
| archive-year | /archive/2025 [archive-year] | /archiv/2025 [localized-archive-year-de] | /archive/2025 [archive-year] |
| docs-page | /docs/2 [docs-page] | /docs/2 [docs-page] | /documentation/2 [localized-docs-page-fr] |
| index | / [index] | / [index] | / [index] |
| post-id | /post-42 [post-id] | /post-42 [post-id] | /post-42 [post-id] |
| über-uns | /about [localized-über-uns-en] | /über-uns [über-uns] | /à-propos [localized-über-uns-fr] |

## Invariant breaks (0)

none
