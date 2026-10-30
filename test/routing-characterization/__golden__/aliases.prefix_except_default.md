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
| /en | null | en | index | index | English | en | en | Default locale should not have prefix |
| /en/ | null | en | index | index | English | en | en | Default locale should not have prefix |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | about | en | about | about | English | null | en | null |
| /de/about/ | null | de | about | about | Deutsch | de | de | null |
| /missing | null | en |  | null | English | null | en | null |
| /de/missing | null | de |  | null | Deutsch | de | de | null |
| /xx/about | null | en |  | null | English | null | en | null |
| /de/de/about | null | de |  | null | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /%C3%BCber | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | /about | en,fr,de |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,fr,de |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de,fr |
| /company | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | /about | en,fr,de |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /de/%C3%BCber | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,fr,de |
| /de/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | /blog/hello-world | en,de,fr |
| /de/company | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,fr,de |
| /de/docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | null | /docs | en,fr,de |
| /de/docs/einfuehrung | /docs/intro?q=1#top [docs-intro] |  | /docs/intro?q=1#top [docs-intro] | /docs/intro?q=1#top [docs-intro] | null | /docs/intro | en,fr,de |
| /de/documentation | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | null | /docs | en,fr,de |
| /de/documentation/einfuehrung | /docs/intro?q=1#top [docs-intro] |  | /docs/intro?q=1#top [docs-intro] | /docs/intro?q=1#top [docs-intro] | null | /docs/intro | en,fr,de |
| /de/help | /help?q=1#top [help] |  | /help?q=1#top [help] | /help?q=1#top [help] | null | /help | en,de,fr |
| /de/news/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | /blog/hello-world | en,de,fr |
| /de/support | /help?q=1#top [help] |  | /help?q=1#top [help] | /help?q=1#top [help] | null | /help | en,de,fr |
| /de/ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,fr,de |
| /de/über | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,fr,de |
| /docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | null | null | en,fr,de |
| /docs/intro | /docs/intro?q=1#top [docs-intro] |  | /docs/intro?q=1#top [docs-intro] | /docs/intro?q=1#top [docs-intro] | null | null | en,fr,de |
| /documentation | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | /docs | /docs | en,fr,de |
| /documentation/intro | /docs/intro?q=1#top [docs-intro] |  | /docs/intro?q=1#top [docs-intro] | /docs/intro?q=1#top [docs-intro] | /docs/intro | /docs/intro | en,fr,de |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /fr/%C3%BCber | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,fr,de |
| /fr/about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,fr,de |
| /fr/blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | /blog/hello-world | en,de,fr |
| /fr/company | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,fr,de |
| /fr/docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | null | /docs | en,fr,de |
| /fr/docs/intro | /docs/intro?q=1#top [docs-intro] |  | /docs/intro?q=1#top [docs-intro] | /docs/intro?q=1#top [docs-intro] | null | /docs/intro | en,fr,de |
| /fr/documentation | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | null | /docs | en,fr,de |
| /fr/documentation/intro | /docs/intro?q=1#top [docs-intro] |  | /docs/intro?q=1#top [docs-intro] | /docs/intro?q=1#top [docs-intro] | null | /docs/intro | en,fr,de |
| /fr/help | /help?q=1#top [help] |  | /help?q=1#top [help] | /help?q=1#top [help] | null | /help | en,de,fr |
| /fr/news/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | /blog/hello-world | en,de,fr |
| /fr/support | /help?q=1#top [help] |  | /help?q=1#top [help] | /help?q=1#top [help] | null | /help | en,de,fr |
| /fr/über | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,fr,de |
| /help | /help?q=1#top [help] |  | /help?q=1#top [help] | /help?q=1#top [help] | null | null | en,de,fr |
| /news/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world | /blog/hello-world | en,de,fr |
| /support | /help?q=1#top [help] |  | /help?q=1#top [help] | /help?q=1#top [help] | /help | /help | en,de,fr |
| /über | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | /about | en,fr,de |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,fr,de |
| /de/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,fr,de |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | /missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | /de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | /de | en,de,fr |
| /%C3%BCber | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns | /de/ueber-uns | en,fr,de |
| /about | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns | /de/ueber-uns | en,fr,de |
| /blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world | /de/blog/hello-world | en,de,fr |
| /company | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns | /de/ueber-uns | en,fr,de |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /de/%C3%BCber | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | null | en,fr,de |
| /de/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,fr |
| /de/company | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | null | en,fr,de |
| /de/docs | /de/docs?q=1#top [localized-docs-de] |  | /de/docs?q=1#top [localized-docs-de] | /de/docs?q=1#top [localized-docs-de] | null | null | en,fr,de |
| /de/docs/einfuehrung | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | null | null | en,fr,de |
| /de/documentation | /de/docs?q=1#top [localized-docs-de] |  | /de/docs?q=1#top [localized-docs-de] | /de/docs?q=1#top [localized-docs-de] | null | null | en,fr,de |
| /de/documentation/einfuehrung | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | null | null | en,fr,de |
| /de/help | /de/help?q=1#top [localized-help] |  | /de/help?q=1#top [localized-help] | /de/help?q=1#top [localized-help] | null | null | en,de,fr |
| /de/news/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,fr |
| /de/support | /de/help?q=1#top [localized-help] |  | /de/help?q=1#top [localized-help] | /de/help?q=1#top [localized-help] | null | null | en,de,fr |
| /de/ueber-uns | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | null | en,fr,de |
| /de/über | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | null | en,fr,de |
| /docs | /de/docs?q=1#top [localized-docs-de] |  | /de/docs?q=1#top [localized-docs-de] | /de/docs?q=1#top [localized-docs-de] | /de/docs | /de/docs | en,fr,de |
| /docs/intro | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung | /de/docs/einfuehrung | en,fr,de |
| /documentation | /de/docs?q=1#top [localized-docs-de] |  | /de/docs?q=1#top [localized-docs-de] | /de/docs?q=1#top [localized-docs-de] | /de/docs | /de/docs | en,fr,de |
| /documentation/intro | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung | /de/docs/einfuehrung | en,fr,de |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /fr/%C3%BCber | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | /de/ueber-uns | en,fr,de |
| /fr/about | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | /de/ueber-uns | en,fr,de |
| /fr/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | null | /de/blog/hello-world | en,de,fr |
| /fr/company | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | /de/ueber-uns | en,fr,de |
| /fr/docs | /de/docs?q=1#top [localized-docs-de] |  | /de/docs?q=1#top [localized-docs-de] | /de/docs?q=1#top [localized-docs-de] | null | /de/docs | en,fr,de |
| /fr/docs/intro | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | null | /de/docs/einfuehrung | en,fr,de |
| /fr/documentation | /de/docs?q=1#top [localized-docs-de] |  | /de/docs?q=1#top [localized-docs-de] | /de/docs?q=1#top [localized-docs-de] | null | /de/docs | en,fr,de |
| /fr/documentation/intro | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | null | /de/docs/einfuehrung | en,fr,de |
| /fr/help | /de/help?q=1#top [localized-help] |  | /de/help?q=1#top [localized-help] | /de/help?q=1#top [localized-help] | null | /de/help | en,de,fr |
| /fr/news/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | null | /de/blog/hello-world | en,de,fr |
| /fr/support | /de/help?q=1#top [localized-help] |  | /de/help?q=1#top [localized-help] | /de/help?q=1#top [localized-help] | null | /de/help | en,de,fr |
| /fr/über | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | /de/ueber-uns | en,fr,de |
| /help | /de/help?q=1#top [localized-help] |  | /de/help?q=1#top [localized-help] | /de/help?q=1#top [localized-help] | /de/help | /de/help | en,de,fr |
| /news/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world | /de/blog/hello-world | en,de,fr |
| /support | /de/help?q=1#top [localized-help] |  | /de/help?q=1#top [localized-help] | /de/help?q=1#top [localized-help] | /de/help | /de/help | en,de,fr |
| /über | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns | /de/ueber-uns | en,fr,de |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /about/ | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns | /de/ueber-uns | en,fr,de |
| /de/about/ | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | null | en,fr,de |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | /de/missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | null | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /de/xx/about | /de/xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | /fr | en,de,fr |
| /%C3%BCber | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/about | /fr/about | en,fr,de |
| /about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/about | /fr/about | en,fr,de |
| /blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world | /fr/blog/hello-world | en,de,fr |
| /company | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/about | /fr/about | en,fr,de |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/%C3%BCber | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,fr,de |
| /de/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | /fr/blog/hello-world | en,de,fr |
| /de/company | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,fr,de |
| /de/docs | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | null | /fr/docs | en,fr,de |
| /de/docs/einfuehrung | /fr/docs/intro?q=1#top [localized-docs-intro] |  | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro?q=1#top [localized-docs-intro] | null | /fr/docs/intro | en,fr,de |
| /de/documentation | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | null | /fr/docs | en,fr,de |
| /de/documentation/einfuehrung | /fr/docs/intro?q=1#top [localized-docs-intro] |  | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro?q=1#top [localized-docs-intro] | null | /fr/docs/intro | en,fr,de |
| /de/help | /fr/help?q=1#top [localized-help] |  | /fr/help?q=1#top [localized-help] | /fr/help?q=1#top [localized-help] | null | /fr/help | en,de,fr |
| /de/news/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | /fr/blog/hello-world | en,de,fr |
| /de/support | /fr/help?q=1#top [localized-help] |  | /fr/help?q=1#top [localized-help] | /fr/help?q=1#top [localized-help] | null | /fr/help | en,de,fr |
| /de/ueber-uns | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,fr,de |
| /de/über | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,fr,de |
| /docs | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | /fr/docs | /fr/docs | en,fr,de |
| /docs/intro | /fr/docs/intro?q=1#top [localized-docs-intro] |  | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro | /fr/docs/intro | en,fr,de |
| /documentation | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | /fr/docs | /fr/docs | en,fr,de |
| /documentation/intro | /fr/docs/intro?q=1#top [localized-docs-intro] |  | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro | /fr/docs/intro | en,fr,de |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,fr |
| /fr/%C3%BCber | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | null | en,fr,de |
| /fr/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | null | en,fr,de |
| /fr/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,fr |
| /fr/company | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | null | en,fr,de |
| /fr/docs | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | null | null | en,fr,de |
| /fr/docs/intro | /fr/docs/intro?q=1#top [localized-docs-intro] |  | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro?q=1#top [localized-docs-intro] | null | null | en,fr,de |
| /fr/documentation | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | null | null | en,fr,de |
| /fr/documentation/intro | /fr/docs/intro?q=1#top [localized-docs-intro] |  | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro?q=1#top [localized-docs-intro] | null | null | en,fr,de |
| /fr/help | /fr/help?q=1#top [localized-help] |  | /fr/help?q=1#top [localized-help] | /fr/help?q=1#top [localized-help] | null | null | en,de,fr |
| /fr/news/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,fr |
| /fr/support | /fr/help?q=1#top [localized-help] |  | /fr/help?q=1#top [localized-help] | /fr/help?q=1#top [localized-help] | null | null | en,de,fr |
| /fr/über | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | null | en,fr,de |
| /help | /fr/help?q=1#top [localized-help] |  | /fr/help?q=1#top [localized-help] | /fr/help?q=1#top [localized-help] | /fr/help | /fr/help | en,de,fr |
| /news/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world | /fr/blog/hello-world | en,de,fr |
| /support | /fr/help?q=1#top [localized-help] |  | /fr/help?q=1#top [localized-help] | /fr/help?q=1#top [localized-help] | /fr/help | /fr/help | en,de,fr |
| /über | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/about | /fr/about | en,fr,de |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/about | /fr/about | en,fr,de |
| /de/about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,fr,de |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /fr/missing | /fr/missing | null |
| /de/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | /fr/missing | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | /fr/xx/about | /fr/xx/about | null |
| /de/de/about | /fr/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | null | /fr/de/about | null |

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
