# aliases · prefix_except_default

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
| localized-index | /:locale(de\|fr) |  |  |
| localized-about | /:locale(fr)/about | /:locale(fr)/company, /:locale(fr)/über, /:locale(fr)/%C3%BCber |  |
| localized-about-de | /:locale(de)/ueber-uns | /:locale(de)/company, /:locale(de)/über, /:locale(de)/%C3%BCber |  |
| localized-help | /:locale(de\|fr)/help | /:locale(de\|fr)/support |  |
| localized-blog-slug | /:locale(de\|fr)/blog/:slug() | /:locale(de\|fr)/news/:slug() |  |
| localized-docs | /:locale(fr)/docs | /:locale(fr)/documentation |  |
| · localized-docs-intro | intro |  |  |
| localized-docs-de | /:locale(de)/docs | /:locale(de)/documentation |  |
| · localized-docs-intro-de | einfuehrung |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | en | null |
| /%C3%BCber | about | en | about | about | English | null | en | null |
| /about | about | en | about | about | English | null | en | null |
| /blog/hello-world | blog-slug | en | blog-slug | blog-slug | English | null | en | null |
| /company | about | en | about | about | English | null | en | null |
| /de | localized-index | de | index | index | Deutsch | de | de | null |
| /de/%C3%BCber | localized-about-de | de | about | about | Deutsch | de | de | null |
| /de/blog/hello-world | localized-blog-slug | de | blog-slug | blog-slug | Deutsch | de | de | null |
| /de/company | localized-about-de | de | about | about | Deutsch | de | de | null |
| /de/docs | localized-docs-de | de | docs | docs | Deutsch | de | de | null |
| /de/docs/einfuehrung | localized-docs-intro-de | de | docs-intro | docs-intro | Deutsch | de | de | null |
| /de/documentation | localized-docs-de | de | docs | docs | Deutsch | de | de | null |
| /de/documentation/einfuehrung | localized-docs-intro-de | de | docs-intro | docs-intro | Deutsch | de | de | null |
| /de/help | localized-help | de | help | help | Deutsch | de | de | null |
| /de/news/hello-world | localized-blog-slug | de | blog-slug | blog-slug | Deutsch | de | de | null |
| /de/support | localized-help | de | help | help | Deutsch | de | de | null |
| /de/ueber-uns | localized-about-de | de | about | about | Deutsch | de | de | null |
| /de/über | localized-about-de | de | about | about | Deutsch | de | de | null |
| /docs | docs | en | docs | docs | English | null | en | null |
| /docs/intro | docs-intro | en | docs-intro | docs-intro | English | null | en | null |
| /documentation | docs | en | docs | docs | English | null | en | null |
| /documentation/intro | docs-intro | en | docs-intro | docs-intro | English | null | en | null |
| /fr | localized-index | fr | index | index | Français | fr | fr | null |
| /fr/%C3%BCber | localized-about | fr | about | about | Français | fr | fr | null |
| /fr/about | localized-about | fr | about | about | Français | fr | fr | null |
| /fr/blog/hello-world | localized-blog-slug | fr | blog-slug | blog-slug | Français | fr | fr | null |
| /fr/company | localized-about | fr | about | about | Français | fr | fr | null |
| /fr/docs | localized-docs | fr | docs | docs | Français | fr | fr | null |
| /fr/docs/intro | localized-docs-intro | fr | docs-intro | docs-intro | Français | fr | fr | null |
| /fr/documentation | localized-docs | fr | docs | docs | Français | fr | fr | null |
| /fr/documentation/intro | localized-docs-intro | fr | docs-intro | docs-intro | Français | fr | fr | null |
| /fr/help | localized-help | fr | help | help | Français | fr | fr | null |
| /fr/news/hello-world | localized-blog-slug | fr | blog-slug | blog-slug | Français | fr | fr | null |
| /fr/support | localized-help | fr | help | help | Français | fr | fr | null |
| /fr/über | localized-about | fr | about | about | Français | fr | fr | null |
| /help | help | en | help | help | English | null | en | null |
| /news/hello-world | blog-slug | en | blog-slug | blog-slug | English | null | en | null |
| /support | help | en | help | help | English | null | en | null |
| /über | about | en | about | about | English | null | en | null |
| /en | null | en |  | index | English | en | en | Default locale should not have prefix |
| /en/ | null | en |  | index | English | en | en | Default locale should not have prefix |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | about | en | about | about | English | null | en | null |
| /de/about/ | null | de |  | about | Deutsch | de | de | null |
| /missing | null | en |  | null | English | null | en | null |
| /de/missing | null | de |  | null | Deutsch | de | de | null |
| /xx/about | null | en |  | null | English | null | en | null |
| /de/de/about | null | de |  | null | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /%C3%BCber | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /%C3%BCber | /about |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | null |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world | null |
| /company | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /company | /about |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/%C3%BCber | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /de/%C3%BCber | null |
| /de/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /de/blog/hello-world | null |
| /de/company | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /de/company | null |
| /de/docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | /de/docs | null |
| /de/docs/einfuehrung | /docs/intro?q=1#top [docs-intro] |  | /docs/intro?q=1#top [docs-intro] | /docs/intro?q=1#top [docs-intro] | /de/docs/einfuehrung | null |
| /de/documentation | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | /de/documentation | null |
| /de/documentation/einfuehrung | /docs/intro?q=1#top [docs-intro] |  | /docs/intro?q=1#top [docs-intro] | /docs/intro?q=1#top [docs-intro] | /de/documentation/einfuehrung | null |
| /de/help | /help?q=1#top [help] |  | /help?q=1#top [help] | /help?q=1#top [help] | /de/help | null |
| /de/news/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /de/news/hello-world | null |
| /de/support | /help?q=1#top [help] |  | /help?q=1#top [help] | /help?q=1#top [help] | /de/support | null |
| /de/ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /de/ueber-uns | null |
| /de/über | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /de/über | null |
| /docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | /docs | null |
| /docs/intro | /docs/intro?q=1#top [docs-intro] |  | /docs/intro?q=1#top [docs-intro] | /docs/intro?q=1#top [docs-intro] | /docs/intro | null |
| /documentation | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | /documentation | /docs |
| /documentation/intro | /docs/intro?q=1#top [docs-intro] |  | /docs/intro?q=1#top [docs-intro] | /docs/intro?q=1#top [docs-intro] | /documentation/intro | /docs/intro |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /fr | null |
| /fr/%C3%BCber | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /fr/%C3%BCber | null |
| /fr/about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /fr/about | null |
| /fr/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /fr/blog/hello-world | null |
| /fr/company | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /fr/company | null |
| /fr/docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | /fr/docs | null |
| /fr/docs/intro | /docs/intro?q=1#top [docs-intro] |  | /docs/intro?q=1#top [docs-intro] | /docs/intro?q=1#top [docs-intro] | /fr/docs/intro | null |
| /fr/documentation | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | /fr/documentation | null |
| /fr/documentation/intro | /docs/intro?q=1#top [docs-intro] |  | /docs/intro?q=1#top [docs-intro] | /docs/intro?q=1#top [docs-intro] | /fr/documentation/intro | null |
| /fr/help | /help?q=1#top [help] |  | /help?q=1#top [help] | /help?q=1#top [help] | /fr/help | null |
| /fr/news/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /fr/news/hello-world | null |
| /fr/support | /help?q=1#top [help] |  | /help?q=1#top [help] | /help?q=1#top [help] | /fr/support | null |
| /fr/über | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /fr/über | null |
| /help | /help?q=1#top [help] |  | /help?q=1#top [help] | /help?q=1#top [help] | /help | null |
| /news/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /news/hello-world | /blog/hello-world |
| /support | /help?q=1#top [help] |  | /help?q=1#top [help] | /help?q=1#top [help] | /support | /help |
| /über | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /über | /about |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
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
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | / | /de |
| /%C3%BCber | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /%C3%BCber | /de/ueber-uns |
| /about | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /about | /de/ueber-uns |
| /blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /blog/hello-world | /de/blog/hello-world |
| /company | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /company | /de/ueber-uns |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | null |
| /de/%C3%BCber | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/%C3%BCber | null |
| /de/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world | null |
| /de/company | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/company | null |
| /de/docs | /de/docs?q=1#top [localized-docs-de] |  | /de/docs?q=1#top [localized-docs-de] | /de/docs?q=1#top [localized-docs-de] | /de/docs | null |
| /de/docs/einfuehrung | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung | null |
| /de/documentation | /de/docs?q=1#top [localized-docs-de] |  | /de/docs?q=1#top [localized-docs-de] | /de/docs?q=1#top [localized-docs-de] | /de/documentation | null |
| /de/documentation/einfuehrung | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/documentation/einfuehrung | null |
| /de/help | /de/help?q=1#top [localized-help] |  | /de/help?q=1#top [localized-help] | /de/help?q=1#top [localized-help] | /de/help | null |
| /de/news/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/news/hello-world | null |
| /de/support | /de/help?q=1#top [localized-help] |  | /de/help?q=1#top [localized-help] | /de/help?q=1#top [localized-help] | /de/support | null |
| /de/ueber-uns | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns | null |
| /de/über | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/über | null |
| /docs | /de/docs?q=1#top [localized-docs-de] |  | /de/docs?q=1#top [localized-docs-de] | /de/docs?q=1#top [localized-docs-de] | /docs | /de/docs |
| /docs/intro | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /docs/intro | /de/docs/einfuehrung |
| /documentation | /de/docs?q=1#top [localized-docs-de] |  | /de/docs?q=1#top [localized-docs-de] | /de/docs?q=1#top [localized-docs-de] | /documentation | /de/docs |
| /documentation/intro | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /documentation/intro | /de/docs/einfuehrung |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /fr | null |
| /fr/%C3%BCber | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /fr/%C3%BCber | null |
| /fr/about | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /fr/about | null |
| /fr/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world | null |
| /fr/company | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /fr/company | null |
| /fr/docs | /de/docs?q=1#top [localized-docs-de] |  | /de/docs?q=1#top [localized-docs-de] | /de/docs?q=1#top [localized-docs-de] | /fr/docs | null |
| /fr/docs/intro | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /fr/docs/intro | null |
| /fr/documentation | /de/docs?q=1#top [localized-docs-de] |  | /de/docs?q=1#top [localized-docs-de] | /de/docs?q=1#top [localized-docs-de] | /fr/documentation | null |
| /fr/documentation/intro | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /fr/documentation/intro | null |
| /fr/help | /de/help?q=1#top [localized-help] |  | /de/help?q=1#top [localized-help] | /de/help?q=1#top [localized-help] | /fr/help | null |
| /fr/news/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /fr/news/hello-world | null |
| /fr/support | /de/help?q=1#top [localized-help] |  | /de/help?q=1#top [localized-help] | /de/help?q=1#top [localized-help] | /fr/support | null |
| /fr/über | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /fr/über | null |
| /help | /de/help?q=1#top [localized-help] |  | /de/help?q=1#top [localized-help] | /de/help?q=1#top [localized-help] | /help | /de/help |
| /news/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /news/hello-world | /de/blog/hello-world |
| /support | /de/help?q=1#top [localized-help] |  | /de/help?q=1#top [localized-help] | /de/help?q=1#top [localized-help] | /support | /de/help |
| /über | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /über | /de/ueber-uns |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en | null |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en/ | null |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de/ | null |
| /about/ | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /about/ | /de/ueber-uns |
| /de/about/ | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/about/ | null |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /missing | /de/missing |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /xx/about | /de/xx/about |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | / | /fr |
| /%C3%BCber | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /%C3%BCber | /fr/about |
| /about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /about | /fr/about |
| /blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /blog/hello-world | /fr/blog/hello-world |
| /company | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /company | /fr/about |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de | null |
| /de/%C3%BCber | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /de/%C3%BCber | null |
| /de/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world | null |
| /de/company | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /de/company | null |
| /de/docs | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | /de/docs | null |
| /de/docs/einfuehrung | /fr/docs/intro?q=1#top [localized-docs-intro] |  | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro?q=1#top [localized-docs-intro] | /de/docs/einfuehrung | null |
| /de/documentation | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | /de/documentation | null |
| /de/documentation/einfuehrung | /fr/docs/intro?q=1#top [localized-docs-intro] |  | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro?q=1#top [localized-docs-intro] | /de/documentation/einfuehrung | null |
| /de/help | /fr/help?q=1#top [localized-help] |  | /fr/help?q=1#top [localized-help] | /fr/help?q=1#top [localized-help] | /de/help | null |
| /de/news/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /de/news/hello-world | null |
| /de/support | /fr/help?q=1#top [localized-help] |  | /fr/help?q=1#top [localized-help] | /fr/help?q=1#top [localized-help] | /de/support | null |
| /de/ueber-uns | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /de/ueber-uns | null |
| /de/über | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /de/über | null |
| /docs | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | /docs | /fr/docs |
| /docs/intro | /fr/docs/intro?q=1#top [localized-docs-intro] |  | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro?q=1#top [localized-docs-intro] | /docs/intro | /fr/docs/intro |
| /documentation | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | /documentation | /fr/docs |
| /documentation/intro | /fr/docs/intro?q=1#top [localized-docs-intro] |  | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro?q=1#top [localized-docs-intro] | /documentation/intro | /fr/docs/intro |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | null |
| /fr/%C3%BCber | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/%C3%BCber | null |
| /fr/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/about | null |
| /fr/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world | null |
| /fr/company | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/company | null |
| /fr/docs | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | /fr/docs | null |
| /fr/docs/intro | /fr/docs/intro?q=1#top [localized-docs-intro] |  | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro | null |
| /fr/documentation | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | /fr/documentation | null |
| /fr/documentation/intro | /fr/docs/intro?q=1#top [localized-docs-intro] |  | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/documentation/intro | null |
| /fr/help | /fr/help?q=1#top [localized-help] |  | /fr/help?q=1#top [localized-help] | /fr/help?q=1#top [localized-help] | /fr/help | null |
| /fr/news/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/news/hello-world | null |
| /fr/support | /fr/help?q=1#top [localized-help] |  | /fr/help?q=1#top [localized-help] | /fr/help?q=1#top [localized-help] | /fr/support | null |
| /fr/über | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/über | null |
| /help | /fr/help?q=1#top [localized-help] |  | /fr/help?q=1#top [localized-help] | /fr/help?q=1#top [localized-help] | /help | /fr/help |
| /news/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /news/hello-world | /fr/blog/hello-world |
| /support | /fr/help?q=1#top [localized-help] |  | /fr/help?q=1#top [localized-help] | /fr/help?q=1#top [localized-help] | /support | /fr/help |
| /über | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /über | /fr/about |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en | null |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en/ | null |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de/ | null |
| /about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /about/ | /fr/about |
| /de/about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /de/about/ | null |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /missing | /fr/missing |
| /de/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | /xx/about | /fr/xx/about |
| /de/de/about | /fr/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /about [about] | /de/ueber-uns [localized-about-de] | /fr/about [localized-about] | /about [about] | /de/ueber-uns [localized-about-de] | /fr/about [localized-about] | /about [about] | /de/ueber-uns [localized-about-de] | /fr/about [localized-about] |
| blog-slug | /blog/hello-world [blog-slug] | /de/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] | /blog/hello-world [blog-slug] | /de/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] | /blog/hello-world [blog-slug] | /de/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] |
| docs | /docs [docs] | /de/docs [localized-docs-de] | /fr/docs [localized-docs] | /docs [docs] | /de/docs [localized-docs-de] | /fr/docs [localized-docs] | /docs [docs] | /de/docs [localized-docs-de] | /fr/docs [localized-docs] |
| docs-intro | /docs/intro [docs-intro] | /de/docs/einfuehrung [localized-docs-intro-de] | /fr/docs/intro [localized-docs-intro] | /docs/intro [docs-intro] | /de/docs/einfuehrung [localized-docs-intro-de] | /fr/docs/intro [localized-docs-intro] | /docs/intro [docs-intro] | /de/docs/einfuehrung [localized-docs-intro-de] | /fr/docs/intro [localized-docs-intro] |
| help | /help [help] | /de/help [localized-help] | /fr/help [localized-help] | /help [help] | /de/help [localized-help] | /fr/help [localized-help] | /help [help] | /de/help [localized-help] | /fr/help [localized-help] |
| index | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] |

## Invariant breaks (0)

none
