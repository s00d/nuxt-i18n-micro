# unicode-and-params · no_prefix

non-ASCII custom paths, param matchers and optional params

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| über-uns | /über-uns | /%C3%BCber-uns |  |
| archive-year | /archive/:year() |  |  |
| docs-page | /docs/:page? |  |  |
| post-id | /post-:id() |  |  |
| localized-über-uns-en | /about |  |  |
| localized-über-uns-fr | /à-propos | /%C3%A0-propos |  |
| localized-archive-year-de | /archiv/:year(\d+) |  |  |
| localized-docs-page-fr | /documentation/:page? |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | null | null |
| /%C3%A0-propos | localized-über-uns-fr | en | über-uns | über-uns | English | null | null | null |
| /%C3%BCber-uns | über-uns | en | über-uns | über-uns | English | null | null | null |
| /about | localized-über-uns-en | en | über-uns | über-uns | English | null | null | null |
| /archiv/2025 | localized-archive-year-de | en | archive-year | archive-year | English | null | null | null |
| /archive/2025 | archive-year | en | archive-year | archive-year | English | null | null | null |
| /docs/2 | docs-page | en | docs-page | docs-page | English | null | null | null |
| /documentation/2 | localized-docs-page-fr | en | docs-page | docs-page | English | null | null | null |
| /post-42 | post-id | en | post-id | post-id | English | null | null | null |
| /à-propos | localized-über-uns-fr | en | über-uns | über-uns | English | null | null | null |
| /über-uns | über-uns | en | über-uns | über-uns | English | null | null | null |
| /en | null | en |  | index | English | en | null | null |
| /en/ | null | en |  | index | English | en | null | null |
| /de | null | en |  | index | English | de | null | null |
| /de/ | null | en |  | index | English | de | null | null |
| /about/ | localized-über-uns-en | en | über-uns | über-uns | English | null | null | null |
| /de/about/ | null | en |  | über-uns | English | de | null | null |
| /missing | null | en |  | null | English | null | null | null |
| /de/missing | null | en |  | null | English | de | null | null |
| /xx/about | null | en |  | null | English | null | null | null |
| /de/de/about | null | en |  | null | English | de | null | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /%C3%A0-propos | /about?q=1#top [localized-über-uns-en] |  | /about?q=1#top [localized-über-uns-en] | /about?q=1#top [localized-über-uns-en] | /%C3%A0-propos | null |
| /%C3%BCber-uns | /about?q=1#top [localized-über-uns-en] |  | /about?q=1#top [localized-über-uns-en] | /about?q=1#top [localized-über-uns-en] | /%C3%BCber-uns | null |
| /about | /about?q=1#top [localized-über-uns-en] |  | /about?q=1#top [localized-über-uns-en] | /about?q=1#top [localized-über-uns-en] | /about | null |
| /archiv/2025 | /archive/2025?q=1#top [archive-year] | /archive/2025-en?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | /archiv/2025 | null |
| /archive/2025 | /archive/2025?q=1#top [archive-year] | /archive/2025-en?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | /archive/2025 | null |
| /docs/2 | /docs/2?q=1#top [docs-page] | /docs/2-en?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | /docs/2 | null |
| /documentation/2 | /docs/2?q=1#top [docs-page] | /docs/2-en?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | /documentation/2 | null |
| /post-42 | /post-42?q=1#top [post-id] | /post-42-en?q=1#top [post-id] | /post-42?q=1#top [post-id] | /post-42?q=1#top [post-id] | /post-42 | null |
| /à-propos | /about?q=1#top [localized-über-uns-en] |  | /about?q=1#top [localized-über-uns-en] | /about?q=1#top [localized-über-uns-en] | /à-propos | null |
| /über-uns | /about?q=1#top [localized-über-uns-en] |  | /about?q=1#top [localized-über-uns-en] | /about?q=1#top [localized-über-uns-en] | /über-uns | null |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /about?q=1#top [localized-über-uns-en] |  | /about?q=1#top [localized-über-uns-en] | /about?q=1#top [localized-über-uns-en] | /about/ | null |
| /de/about/ | /about?q=1#top [localized-über-uns-en] |  | /about?q=1#top [localized-über-uns-en] | /about?q=1#top [localized-über-uns-en] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /%C3%A0-propos | /über-uns?q=1#top [über-uns] |  | /über-uns?q=1#top [über-uns] | /über-uns?q=1#top [über-uns] | /%C3%A0-propos | null |
| /%C3%BCber-uns | /über-uns?q=1#top [über-uns] |  | /über-uns?q=1#top [über-uns] | /über-uns?q=1#top [über-uns] | /%C3%BCber-uns | null |
| /about | /über-uns?q=1#top [über-uns] |  | /über-uns?q=1#top [über-uns] | /über-uns?q=1#top [über-uns] | /about | null |
| /archiv/2025 | /archiv/2025?q=1#top [localized-archive-year-de] | /archiv/2025-de?q=1#top [localized-archive-year-de] | /archiv/2025?q=1#top [localized-archive-year-de] | /archiv/2025?q=1#top [localized-archive-year-de] | /archiv/2025 | null |
| /archive/2025 | /archiv/2025?q=1#top [localized-archive-year-de] | /archiv/2025-de?q=1#top [localized-archive-year-de] | /archiv/2025?q=1#top [localized-archive-year-de] | /archiv/2025?q=1#top [localized-archive-year-de] | /archive/2025 | null |
| /docs/2 | /docs/2?q=1#top [docs-page] | /docs/2-de?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | /docs/2 | null |
| /documentation/2 | /docs/2?q=1#top [docs-page] | /docs/2-de?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | /docs/2?q=1#top [docs-page] | /documentation/2 | null |
| /post-42 | /post-42?q=1#top [post-id] | /post-42-de?q=1#top [post-id] | /post-42?q=1#top [post-id] | /post-42?q=1#top [post-id] | /post-42 | null |
| /à-propos | /über-uns?q=1#top [über-uns] |  | /über-uns?q=1#top [über-uns] | /über-uns?q=1#top [über-uns] | /à-propos | null |
| /über-uns | /über-uns?q=1#top [über-uns] |  | /über-uns?q=1#top [über-uns] | /über-uns?q=1#top [über-uns] | /über-uns | null |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /über-uns?q=1#top [über-uns] |  | /über-uns?q=1#top [über-uns] | /über-uns?q=1#top [über-uns] | /about/ | null |
| /de/about/ | /über-uns?q=1#top [über-uns] |  | /über-uns?q=1#top [über-uns] | /über-uns?q=1#top [über-uns] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /%C3%A0-propos | /à-propos?q=1#top [localized-über-uns-fr] |  | /à-propos?q=1#top [localized-über-uns-fr] | /à-propos?q=1#top [localized-über-uns-fr] | /%C3%A0-propos | null |
| /%C3%BCber-uns | /à-propos?q=1#top [localized-über-uns-fr] |  | /à-propos?q=1#top [localized-über-uns-fr] | /à-propos?q=1#top [localized-über-uns-fr] | /%C3%BCber-uns | null |
| /about | /à-propos?q=1#top [localized-über-uns-fr] |  | /à-propos?q=1#top [localized-über-uns-fr] | /à-propos?q=1#top [localized-über-uns-fr] | /about | null |
| /archiv/2025 | /archive/2025?q=1#top [archive-year] | /archive/2025-fr?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | /archiv/2025 | null |
| /archive/2025 | /archive/2025?q=1#top [archive-year] | /archive/2025-fr?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | /archive/2025?q=1#top [archive-year] | /archive/2025 | null |
| /docs/2 | /documentation/2?q=1#top [localized-docs-page-fr] | /documentation/2-fr?q=1#top [localized-docs-page-fr] | /documentation/2?q=1#top [localized-docs-page-fr] | /documentation/2?q=1#top [localized-docs-page-fr] | /docs/2 | null |
| /documentation/2 | /documentation/2?q=1#top [localized-docs-page-fr] | /documentation/2-fr?q=1#top [localized-docs-page-fr] | /documentation/2?q=1#top [localized-docs-page-fr] | /documentation/2?q=1#top [localized-docs-page-fr] | /documentation/2 | null |
| /post-42 | /post-42?q=1#top [post-id] | /post-42-fr?q=1#top [post-id] | /post-42?q=1#top [post-id] | /post-42?q=1#top [post-id] | /post-42 | null |
| /à-propos | /à-propos?q=1#top [localized-über-uns-fr] |  | /à-propos?q=1#top [localized-über-uns-fr] | /à-propos?q=1#top [localized-über-uns-fr] | /à-propos | null |
| /über-uns | /à-propos?q=1#top [localized-über-uns-fr] |  | /à-propos?q=1#top [localized-über-uns-fr] | /à-propos?q=1#top [localized-über-uns-fr] | /über-uns | null |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /à-propos?q=1#top [localized-über-uns-fr] |  | /à-propos?q=1#top [localized-über-uns-fr] | /à-propos?q=1#top [localized-über-uns-fr] | /about/ | null |
| /de/about/ | /à-propos?q=1#top [localized-über-uns-fr] |  | /à-propos?q=1#top [localized-über-uns-fr] | /à-propos?q=1#top [localized-über-uns-fr] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

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
