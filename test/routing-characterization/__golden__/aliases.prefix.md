# aliases · prefix

definePageMeta aliases on plain, translated, dynamic and parent pages

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect | meta.i18n |
|---|---|---|---|---|
| localized-index | /:locale(en\|de\|fr) |  |  | index: en, de, fr |
| localized-about | /:locale(en\|fr)/about | /:locale(en\|fr)/company, /:locale(en\|fr)/über, /:locale(en\|fr)/%C3%BCber |  | about: en, fr |
| localized-about-de | /:locale(de)/ueber-uns | /:locale(de)/company, /:locale(de)/über, /:locale(de)/%C3%BCber |  | about: de |
| localized-help | /:locale(en\|de\|fr)/help | /:locale(en\|de\|fr)/support |  | help: en, de, fr |
| localized-blog-slug | /:locale(en\|de\|fr)/blog/:slug() | /:locale(en\|de\|fr)/news/:slug() |  | blog-slug: en, de, fr |
| localized-docs | /:locale(en\|fr)/docs | /:locale(en\|fr)/documentation |  | docs: en, fr |
| · localized-docs-intro | intro |  |  | docs-intro: en, fr |
| localized-docs-de | /:locale(de)/docs | /:locale(de)/documentation |  | docs: de |
| · localized-docs-intro-de | einfuehrung |  |  | docs-intro: de |

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
| / | null | en | index | index | English | null | null | null |
| /en/ | localized-index | en | index | index | English | en | en | null |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | null | en | about | about | English | null | null | null |
| /de/about/ | null | de |  | null | Deutsch | de | de | null |
| /missing | null | en |  | null | English | null | null | null |
| /de/missing | null | de |  | null | Deutsch | de | de | null |
| /xx/about | null | en |  | null | English | null | null | null |
| /de/de/about | null | de |  | null | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| /de | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /de/%C3%BCber | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | /en/about | en,fr,de |
| /de/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | null | /en/blog/hello-world | en,de,fr |
| /de/company | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | /en/about | en,fr,de |
| /de/docs | /en/docs?q=1#top [localized-docs] |  | /en/docs?q=1#top [localized-docs] | /en/docs?q=1#top [localized-docs] | null | /en/docs | en,fr,de |
| /de/docs/einfuehrung | /en/docs/intro?q=1#top [localized-docs-intro] |  | /en/docs/intro?q=1#top [localized-docs-intro] | /en/docs/intro?q=1#top [localized-docs-intro] | null | /en/docs/intro | en,fr,de |
| /de/documentation | /en/docs?q=1#top [localized-docs] |  | /en/docs?q=1#top [localized-docs] | /en/docs?q=1#top [localized-docs] | null | /en/docs | en,fr,de |
| /de/documentation/einfuehrung | /en/docs/intro?q=1#top [localized-docs-intro] |  | /en/docs/intro?q=1#top [localized-docs-intro] | /en/docs/intro?q=1#top [localized-docs-intro] | null | /en/docs/intro | en,fr,de |
| /de/help | /en/help?q=1#top [localized-help] |  | /en/help?q=1#top [localized-help] | /en/help?q=1#top [localized-help] | null | /en/help | en,de,fr |
| /de/news/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | null | /en/blog/hello-world | en,de,fr |
| /de/support | /en/help?q=1#top [localized-help] |  | /en/help?q=1#top [localized-help] | /en/help?q=1#top [localized-help] | null | /en/help | en,de,fr |
| /de/ueber-uns | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | /en/about | en,fr,de |
| /de/über | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | /en/about | en,fr,de |
| /en | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /en/%C3%BCber | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | null | en,fr,de |
| /en/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | null | en,fr,de |
| /en/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,fr |
| /en/company | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | null | en,fr,de |
| /en/docs | /en/docs?q=1#top [localized-docs] |  | /en/docs?q=1#top [localized-docs] | /en/docs?q=1#top [localized-docs] | null | null | en,fr,de |
| /en/docs/intro | /en/docs/intro?q=1#top [localized-docs-intro] |  | /en/docs/intro?q=1#top [localized-docs-intro] | /en/docs/intro?q=1#top [localized-docs-intro] | null | null | en,fr,de |
| /en/documentation | /en/docs?q=1#top [localized-docs] |  | /en/docs?q=1#top [localized-docs] | /en/docs?q=1#top [localized-docs] | null | null | en,fr,de |
| /en/documentation/intro | /en/docs/intro?q=1#top [localized-docs-intro] |  | /en/docs/intro?q=1#top [localized-docs-intro] | /en/docs/intro?q=1#top [localized-docs-intro] | null | null | en,fr,de |
| /en/help | /en/help?q=1#top [localized-help] |  | /en/help?q=1#top [localized-help] | /en/help?q=1#top [localized-help] | null | null | en,de,fr |
| /en/news/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,fr |
| /en/support | /en/help?q=1#top [localized-help] |  | /en/help?q=1#top [localized-help] | /en/help?q=1#top [localized-help] | null | null | en,de,fr |
| /en/über | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | null | en,fr,de |
| /fr | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /fr/%C3%BCber | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | /en/about | en,fr,de |
| /fr/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | /en/about | en,fr,de |
| /fr/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | null | /en/blog/hello-world | en,de,fr |
| /fr/company | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | /en/about | en,fr,de |
| /fr/docs | /en/docs?q=1#top [localized-docs] |  | /en/docs?q=1#top [localized-docs] | /en/docs?q=1#top [localized-docs] | null | /en/docs | en,fr,de |
| /fr/docs/intro | /en/docs/intro?q=1#top [localized-docs-intro] |  | /en/docs/intro?q=1#top [localized-docs-intro] | /en/docs/intro?q=1#top [localized-docs-intro] | null | /en/docs/intro | en,fr,de |
| /fr/documentation | /en/docs?q=1#top [localized-docs] |  | /en/docs?q=1#top [localized-docs] | /en/docs?q=1#top [localized-docs] | null | /en/docs | en,fr,de |
| /fr/documentation/intro | /en/docs/intro?q=1#top [localized-docs-intro] |  | /en/docs/intro?q=1#top [localized-docs-intro] | /en/docs/intro?q=1#top [localized-docs-intro] | null | /en/docs/intro | en,fr,de |
| /fr/help | /en/help?q=1#top [localized-help] |  | /en/help?q=1#top [localized-help] | /en/help?q=1#top [localized-help] | null | /en/help | en,de,fr |
| /fr/news/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | null | /en/blog/hello-world | en,de,fr |
| /fr/support | /en/help?q=1#top [localized-help] |  | /en/help?q=1#top [localized-help] | /en/help?q=1#top [localized-help] | null | /en/help | en,de,fr |
| /fr/über | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | /en/about | en,fr,de |
| / | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en | /en | en,de,fr |
| /en/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /de/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /about/ | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/about | /en/about | en,fr,de |
| /de/about/ | /en/about?q=1#top [localized-about] |  | /en/about/?q=1#top [localized-about] | /en/about/?q=1#top [localized-about] | null | /en/about | null |
| /missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | /en/missing | /en/missing | null |
| /de/missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | null | /en/missing | null |
| /xx/about | /en/xx/about?q=1#top [—] |  | /en/xx/about?q=1#top [null] | /en/xx/about?q=1#top [null] | /en/xx/about | /en/xx/about | null |
| /de/de/about | /en/de/about?q=1#top [—] |  | /en/de/about?q=1#top [null] | /en/de/about?q=1#top [null] | null | /en/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
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
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /en/%C3%BCber | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | /de/ueber-uns | en,fr,de |
| /en/about | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | /de/ueber-uns | en,fr,de |
| /en/blog/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | null | /de/blog/hello-world | en,de,fr |
| /en/company | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | /de/ueber-uns | en,fr,de |
| /en/docs | /de/docs?q=1#top [localized-docs-de] |  | /de/docs?q=1#top [localized-docs-de] | /de/docs?q=1#top [localized-docs-de] | null | /de/docs | en,fr,de |
| /en/docs/intro | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | null | /de/docs/einfuehrung | en,fr,de |
| /en/documentation | /de/docs?q=1#top [localized-docs-de] |  | /de/docs?q=1#top [localized-docs-de] | /de/docs?q=1#top [localized-docs-de] | null | /de/docs | en,fr,de |
| /en/documentation/intro | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] |  | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | /de/docs/einfuehrung?q=1#top [localized-docs-intro-de] | null | /de/docs/einfuehrung | en,fr,de |
| /en/help | /de/help?q=1#top [localized-help] |  | /de/help?q=1#top [localized-help] | /de/help?q=1#top [localized-help] | null | /de/help | en,de,fr |
| /en/news/hello-world | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world-de?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | /de/blog/hello-world?q=1#top [localized-blog-slug] | null | /de/blog/hello-world | en,de,fr |
| /en/support | /de/help?q=1#top [localized-help] |  | /de/help?q=1#top [localized-help] | /de/help?q=1#top [localized-help] | null | /de/help | en,de,fr |
| /en/über | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | /de/ueber-uns | en,fr,de |
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
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | /de | en,de,fr |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /about/ | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns | /de/ueber-uns | en,fr,de |
| /de/about/ | /de/about/?q=1#top [—] |  | /de/about/?q=1#top [null] | /de/about/?q=1#top [null] | null | null | null |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | /de/missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | null | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /de/xx/about | /de/xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
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
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /en/%C3%BCber | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,fr,de |
| /en/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,fr,de |
| /en/blog/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | /fr/blog/hello-world | en,de,fr |
| /en/company | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,fr,de |
| /en/docs | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | null | /fr/docs | en,fr,de |
| /en/docs/intro | /fr/docs/intro?q=1#top [localized-docs-intro] |  | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro?q=1#top [localized-docs-intro] | null | /fr/docs/intro | en,fr,de |
| /en/documentation | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | null | /fr/docs | en,fr,de |
| /en/documentation/intro | /fr/docs/intro?q=1#top [localized-docs-intro] |  | /fr/docs/intro?q=1#top [localized-docs-intro] | /fr/docs/intro?q=1#top [localized-docs-intro] | null | /fr/docs/intro | en,fr,de |
| /en/help | /fr/help?q=1#top [localized-help] |  | /fr/help?q=1#top [localized-help] | /fr/help?q=1#top [localized-help] | null | /fr/help | en,de,fr |
| /en/news/hello-world | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world-fr?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | /fr/blog/hello-world?q=1#top [localized-blog-slug] | null | /fr/blog/hello-world | en,de,fr |
| /en/support | /fr/help?q=1#top [localized-help] |  | /fr/help?q=1#top [localized-help] | /fr/help?q=1#top [localized-help] | null | /fr/help | en,de,fr |
| /en/über | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,fr,de |
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
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | /fr | en,de,fr |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/about | /fr/about | en,fr,de |
| /de/about/ | /fr/about?q=1#top [localized-about] |  | /fr/about/?q=1#top [localized-about] | /fr/about/?q=1#top [localized-about] | null | /fr/about | null |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /fr/missing | /fr/missing | null |
| /de/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | /fr/missing | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | /fr/xx/about | /fr/xx/about | null |
| /de/de/about | /fr/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | null | /fr/de/about | null |

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
