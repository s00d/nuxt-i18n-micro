# aliases · prefix

definePageMeta aliases on plain, translated, dynamic and parent pages

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| localized-index | /:locale(en\|de\|fr) |  |  |
| localized-about | /:locale(en\|fr)/about | /:locale(en\|fr)/company, /:locale(en\|fr)/über, /:locale(en\|fr)/%C3%BCber |  |
| localized-about-de | /:locale(de)/ueber-uns | /:locale(de)/company, /:locale(de)/über, /:locale(de)/%C3%BCber |  |
| localized-help | /:locale(en\|de\|fr)/help | /:locale(en\|de\|fr)/support |  |
| localized-blog-slug | /:locale(en\|de\|fr)/blog/:slug() | /:locale(en\|de\|fr)/news/:slug() |  |
| localized-docs | /:locale(en\|fr)/docs | /:locale(en\|fr)/documentation |  |
| · localized-docs-intro | intro |  |  |
| localized-docs-de | /:locale(de)/docs | /:locale(de)/documentation |  |
| · localized-docs-intro-de | einfuehrung |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
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
| /en | localized-index | en | index | index | English | en | en | null |
| /en/%C3%BCber | localized-about | en | about | about | English | en | en | null |
| /en/about | localized-about | en | about | about | English | en | en | null |
| /en/blog/hello-world | localized-blog-slug | en | blog-slug | blog-slug | English | en | en | null |
| /en/company | localized-about | en | about | about | English | en | en | null |
| /en/docs | localized-docs | en | docs | docs | English | en | en | null |
| /en/docs/intro | localized-docs-intro | en | docs-intro | docs-intro | English | en | en | null |
| /en/documentation | localized-docs | en | docs | docs | English | en | en | null |
| /en/documentation/intro | localized-docs-intro | en | docs-intro | docs-intro | English | en | en | null |
| /en/help | localized-help | en | help | help | English | en | en | null |
| /en/news/hello-world | localized-blog-slug | en | blog-slug | blog-slug | English | en | en | null |
| /en/support | localized-help | en | help | help | English | en | en | null |
| /en/über | localized-about | en | about | about | English | en | en | null |
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
| / | null | en |  | index | English | null | null | null |
| /en/ | localized-index | en | index | index | English | en | en | null |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | null | en |  | about | English | null | null | null |
| /de/about/ | null | de |  | null | Deutsch | de | de | null |
| /missing | null | en |  | null | English | null | null | null |
| /de/missing | null | de |  | null | Deutsch | de | de | null |
| /xx/about | null | en |  | null | English | null | null | null |
| /de/de/about | null | de |  | null | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| /de | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /de | null |
| /de/%C3%BCber | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /de/%C3%BCber | null |
| /de/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world | null |
| /de/company | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /de/company | null |
| /de/docs | /en/docs?q=1#top [localized-docs] |  | /en/docs?q=1#top [localized-docs] | /en/docs?q=1#top [localized-docs] | /de/docs | null |
| /de/docs/einfuehrung | /en/docs/intro?q=1#top [localized-docs-intro] |  | /en/docs/intro?q=1#top [localized-docs-intro] | /en/docs/intro?q=1#top [localized-docs-intro] | /de/docs/einfuehrung | null |
| /de/documentation | /en/docs?q=1#top [localized-docs] |  | /en/docs?q=1#top [localized-docs] | /en/docs?q=1#top [localized-docs] | /de/documentation | null |
| /de/documentation/einfuehrung | /en/docs/intro?q=1#top [localized-docs-intro] |  | /en/docs/intro?q=1#top [localized-docs-intro] | /en/docs/intro?q=1#top [localized-docs-intro] | /de/documentation/einfuehrung | null |
| /de/help | /en/help?q=1#top [localized-help] |  | /en/help?q=1#top [localized-help] | /en/help?q=1#top [localized-help] | /de/help | null |
| /de/news/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /de/news/hello-world | null |
| /de/support | /en/help?q=1#top [localized-help] |  | /en/help?q=1#top [localized-help] | /en/help?q=1#top [localized-help] | /de/support | null |
| /de/ueber-uns | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /de/ueber-uns | null |
| /de/über | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /de/über | null |
| /en | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en | null |
| /en/%C3%BCber | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/%C3%BCber | null |
| /en/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/about | null |
| /en/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world | null |
| /en/company | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/company | null |
| /en/docs | /en/docs?q=1#top [localized-docs] |  | /en/docs?q=1#top [localized-docs] | /en/docs?q=1#top [localized-docs] | /en/docs | null |
| /en/docs/intro | /en/docs/intro?q=1#top [localized-docs-intro] |  | /en/docs/intro?q=1#top [localized-docs-intro] | /en/docs/intro?q=1#top [localized-docs-intro] | /en/docs/intro | null |
| /en/documentation | /en/docs?q=1#top [localized-docs] |  | /en/docs?q=1#top [localized-docs] | /en/docs?q=1#top [localized-docs] | /en/documentation | null |
| /en/documentation/intro | /en/docs/intro?q=1#top [localized-docs-intro] |  | /en/docs/intro?q=1#top [localized-docs-intro] | /en/docs/intro?q=1#top [localized-docs-intro] | /en/documentation/intro | null |
| /en/help | /en/help?q=1#top [localized-help] |  | /en/help?q=1#top [localized-help] | /en/help?q=1#top [localized-help] | /en/help | null |
| /en/news/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/news/hello-world | null |
| /en/support | /en/help?q=1#top [localized-help] |  | /en/help?q=1#top [localized-help] | /en/help?q=1#top [localized-help] | /en/support | null |
| /en/über | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/über | null |
| /fr | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /fr | null |
| /fr/%C3%BCber | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /fr/%C3%BCber | null |
| /fr/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /fr/about | null |
| /fr/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world | null |
| /fr/company | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /fr/company | null |
| /fr/docs | /en/docs?q=1#top [localized-docs] |  | /en/docs?q=1#top [localized-docs] | /en/docs?q=1#top [localized-docs] | /fr/docs | null |
| /fr/docs/intro | /en/docs/intro?q=1#top [localized-docs-intro] |  | /en/docs/intro?q=1#top [localized-docs-intro] | /en/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro | null |
| /fr/documentation | /en/docs?q=1#top [localized-docs] |  | /en/docs?q=1#top [localized-docs] | /en/docs?q=1#top [localized-docs] | /fr/documentation | null |
| /fr/documentation/intro | /en/docs/intro?q=1#top [localized-docs-intro] |  | /en/docs/intro?q=1#top [localized-docs-intro] | /en/docs/intro?q=1#top [localized-docs-intro] | /fr/documentation/intro | null |
| /fr/help | /en/help?q=1#top [localized-help] |  | /en/help?q=1#top [localized-help] | /en/help?q=1#top [localized-help] | /fr/help | null |
| /fr/news/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /fr/news/hello-world | null |
| /fr/support | /en/help?q=1#top [localized-help] |  | /en/help?q=1#top [localized-help] | /en/help?q=1#top [localized-help] | /fr/support | null |
| /fr/über | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /fr/über | null |
| / | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en | /en |
| /en/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en/ | null |
| /de/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /de/ | null |
| /about/ | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/about/ | /en/about |
| /de/about/ | /en/about?q=1#top [localized-about] |  | /en/about/?q=1#top [localized-about] | /en/about/?q=1#top [localized-about] | /de/about/ | null |
| /missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | /en/missing | /en/missing |
| /de/missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /en/xx/about?q=1#top [—] |  | /en/xx/about?q=1#top [null] | /en/xx/about?q=1#top [null] | /en/xx/about | /en/xx/about |
| /de/de/about | /en/de/about?q=1#top [—] |  | /en/de/about?q=1#top [null] | /en/de/about?q=1#top [null] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
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
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en | null |
| /en/%C3%BCber | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /en/%C3%BCber | null |
| /en/about | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /en/about | null |
| /en/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world | null |
| /en/company | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /en/company | null |
| /en/docs | /de/docs?q=1#top [localized-docs-de] |  | /de/docs?q=1#top [localized-docs-de] | /de/docs?q=1#top [localized-docs-de] | /en/docs | null |
| /en/docs/intro | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /en/docs/intro | null |
| /en/documentation | /de/docs?q=1#top [localized-docs-de] |  | /de/docs?q=1#top [localized-docs-de] | /de/docs?q=1#top [localized-docs-de] | /en/documentation | null |
| /en/documentation/intro | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /en/documentation/intro | null |
| /en/help | /de/help?q=1#top [localized-help] |  | /de/help?q=1#top [localized-help] | /de/help?q=1#top [localized-help] | /en/help | null |
| /en/news/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /en/news/hello-world | null |
| /en/support | /de/help?q=1#top [localized-help] |  | /de/help?q=1#top [localized-help] | /de/help?q=1#top [localized-help] | /en/support | null |
| /en/über | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /en/über | null |
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
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en | /de |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en/ | null |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de/ | null |
| /about/ | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /en/about/ | /de/ueber-uns |
| /de/about/ | /de/about/?q=1#top [—] |  | /de/about/?q=1#top [null] | /de/about/?q=1#top [null] | /de/about/ | null |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /en/missing | /de/missing |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /en/xx/about | /de/xx/about |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
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
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en | null |
| /en/%C3%BCber | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /en/%C3%BCber | null |
| /en/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /en/about | null |
| /en/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world | null |
| /en/company | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /en/company | null |
| /en/docs | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | /en/docs | null |
| /en/docs/intro | /fr/docs/intro?q=1#top [localized-docs-intro] |  | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro?q=1#top [localized-docs-intro] | /en/docs/intro | null |
| /en/documentation | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | /en/documentation | null |
| /en/documentation/intro | /fr/docs/intro?q=1#top [localized-docs-intro] |  | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro?q=1#top [localized-docs-intro] | /en/documentation/intro | null |
| /en/help | /fr/help?q=1#top [localized-help] |  | /fr/help?q=1#top [localized-help] | /fr/help?q=1#top [localized-help] | /en/help | null |
| /en/news/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /en/news/hello-world | null |
| /en/support | /fr/help?q=1#top [localized-help] |  | /fr/help?q=1#top [localized-help] | /fr/help?q=1#top [localized-help] | /en/support | null |
| /en/über | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /en/über | null |
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
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en | /fr |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en/ | null |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de/ | null |
| /about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /en/about/ | /fr/about |
| /de/about/ | /fr/about?q=1#top [localized-about] |  | /fr/about/?q=1#top [localized-about] | /fr/about/?q=1#top [localized-about] | /de/about/ | null |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /en/missing | /fr/missing |
| /de/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | /en/xx/about | /fr/xx/about |
| /de/de/about | /fr/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from /en | de from /en | fr from /en | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /en/about [localized-about] | /de/ueber-uns [localized-about-de] | /fr/about [localized-about] | /en/about [localized-about] | /de/ueber-uns [localized-about-de] | /fr/about [localized-about] | /en/about [localized-about] | /de/ueber-uns [localized-about-de] | /fr/about [localized-about] |
| blog-slug | /en/blog/hello-world [localized-blog-slug] | /de/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] | /en/blog/hello-world [localized-blog-slug] | /de/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] | /en/blog/hello-world [localized-blog-slug] | /de/blog/hello-world [localized-blog-slug] | /fr/blog/hello-world [localized-blog-slug] |
| docs | /en/docs [localized-docs] | /de/docs [localized-docs-de] | /fr/docs [localized-docs] | /en/docs [localized-docs] | /de/docs [localized-docs-de] | /fr/docs [localized-docs] | /en/docs [localized-docs] | /de/docs [localized-docs-de] | /fr/docs [localized-docs] |
| docs-intro | /en/docs/intro [localized-docs-intro] | /de/docs/einfuehrung [localized-docs-intro-de] | /fr/docs/intro [localized-docs-intro] | /en/docs/intro [localized-docs-intro] | /de/docs/einfuehrung [localized-docs-intro-de] | /fr/docs/intro [localized-docs-intro] | /en/docs/intro [localized-docs-intro] | /de/docs/einfuehrung [localized-docs-intro-de] | /fr/docs/intro [localized-docs-intro] |
| help | /en/help [localized-help] | /de/help [localized-help] | /fr/help [localized-help] | /en/help [localized-help] | /de/help [localized-help] | /fr/help [localized-help] | /en/help [localized-help] | /de/help [localized-help] | /fr/help [localized-help] |
| index | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] |

## Invariant breaks (0)

none
