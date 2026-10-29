# aliases · no_prefix

definePageMeta aliases on plain, translated, dynamic and parent pages

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| about | /about | /company, /über, /%C3%BCber |  |
| help | /help | /support |  |
| blog-slug | /blog/:slug() | /news/:slug() |  |
| docs | /docs | /documentation |  |
| · docs-intro | intro |  |  |
| localized-about-de | /ueber-uns |  |  |
| localized-docs-de | /docs |  |  |
| · localized-docs-intro-de | einfuehrung |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | null | null |
| /%C3%BCber | about | en | about | about | English | null | null | null |
| /about | about | en | about | about | English | null | null | null |
| /blog/hello-world | blog-slug | en | blog-slug | blog-slug | English | null | null | null |
| /company | about | en | about | about | English | null | null | null |
| /docs | docs | en | docs | docs | English | null | null | null |
| /docs/einfuehrung | localized-docs-intro-de | en | docs-intro | docs-intro | English | null | null | null |
| /docs/intro | docs-intro | en | docs-intro | docs-intro | English | null | null | null |
| /documentation | docs | en | docs | docs | English | null | null | null |
| /documentation/intro | docs-intro | en | docs-intro | docs-intro | English | null | null | null |
| /help | help | en | help | help | English | null | null | null |
| /news/hello-world | blog-slug | en | blog-slug | blog-slug | English | null | null | null |
| /support | help | en | help | help | English | null | null | null |
| /ueber-uns | localized-about-de | en | about | about | English | null | null | null |
| /über | about | en | about | about | English | null | null | null |
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

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /%C3%BCber | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /%C3%BCber | null |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | null |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world | null |
| /company | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /company | null |
| /docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | /docs | null |
| /docs/einfuehrung | /docs/intro?q=1#top [docs-intro] |  | /docs/intro?q=1#top [docs-intro] | /docs/intro?q=1#top [docs-intro] | /docs/einfuehrung | null |
| /docs/intro | /docs/intro?q=1#top [docs-intro] |  | /docs/intro?q=1#top [docs-intro] | /docs/intro?q=1#top [docs-intro] | /docs/intro | null |
| /documentation | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | /documentation | null |
| /documentation/intro | /docs/intro?q=1#top [docs-intro] |  | /docs/intro?q=1#top [docs-intro] | /docs/intro?q=1#top [docs-intro] | /documentation/intro | null |
| /help | /help?q=1#top [help] |  | /help?q=1#top [help] | /help?q=1#top [help] | /help | null |
| /news/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /news/hello-world | null |
| /support | /help?q=1#top [help] |  | /help?q=1#top [help] | /help?q=1#top [help] | /support | null |
| /ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /ueber-uns | null |
| /über | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /über | null |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about/ | null |
| /de/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /%C3%BCber | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | /%C3%BCber | null |
| /about | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | /about | null |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-de?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world | null |
| /company | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | /company | null |
| /docs | /docs?q=1#top [localized-docs-de] |  | /docs?q=1#top [localized-docs-de] | /docs?q=1#top [localized-docs-de] | /docs | null |
| /docs/einfuehrung | /docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /docs/einfuehrung?q=1#top [localized-docs-intro-de] | /docs/einfuehrung?q=1#top [localized-docs-intro-de] | /docs/einfuehrung | null |
| /docs/intro | /docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /docs/einfuehrung?q=1#top [localized-docs-intro-de] | /docs/einfuehrung?q=1#top [localized-docs-intro-de] | /docs/intro | null |
| /documentation | /docs?q=1#top [localized-docs-de] |  | /docs?q=1#top [localized-docs-de] | /docs?q=1#top [localized-docs-de] | /documentation | null |
| /documentation/intro | /docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /docs/einfuehrung?q=1#top [localized-docs-intro-de] | /docs/einfuehrung?q=1#top [localized-docs-intro-de] | /documentation/intro | null |
| /help | /help?q=1#top [help] |  | /help?q=1#top [help] | /help?q=1#top [help] | /help | null |
| /news/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-de?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /news/hello-world | null |
| /support | /help?q=1#top [help] |  | /help?q=1#top [help] | /help?q=1#top [help] | /support | null |
| /ueber-uns | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns | null |
| /über | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | /über | null |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | /about/ | null |
| /de/about/ | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /%C3%BCber | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /%C3%BCber | null |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | null |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-fr?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world | null |
| /company | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /company | null |
| /docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | /docs | null |
| /docs/einfuehrung | /docs/intro?q=1#top [docs-intro] |  | /docs/intro?q=1#top [docs-intro] | /docs/intro?q=1#top [docs-intro] | /docs/einfuehrung | null |
| /docs/intro | /docs/intro?q=1#top [docs-intro] |  | /docs/intro?q=1#top [docs-intro] | /docs/intro?q=1#top [docs-intro] | /docs/intro | null |
| /documentation | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | /documentation | null |
| /documentation/intro | /docs/intro?q=1#top [docs-intro] |  | /docs/intro?q=1#top [docs-intro] | /docs/intro?q=1#top [docs-intro] | /documentation/intro | null |
| /help | /help?q=1#top [help] |  | /help?q=1#top [help] | /help?q=1#top [help] | /help | null |
| /news/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-fr?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /news/hello-world | null |
| /support | /help?q=1#top [help] |  | /help?q=1#top [help] | /help?q=1#top [help] | /support | null |
| /ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /ueber-uns | null |
| /über | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /über | null |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about/ | null |
| /de/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / |
|---|---|---|---|
| about | /about [about] | /ueber-uns [localized-about-de] | /about [about] |
| blog-slug | /blog/hello-world [blog-slug] | /blog/hello-world [blog-slug] | /blog/hello-world [blog-slug] |
| docs | /docs [docs] | /docs [localized-docs-de] | /docs [docs] |
| docs-intro | /docs/intro [docs-intro] | /docs/einfuehrung [localized-docs-intro-de] | /docs/intro [docs-intro] |
| help | /help [help] | /help [help] | /help [help] |
| index | / [index] | / [index] | / [index] |

## Invariant breaks (0)

none
