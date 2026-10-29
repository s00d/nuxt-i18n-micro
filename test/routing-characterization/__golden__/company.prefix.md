# company · prefix

typical company site: translated slugs, dynamic pages, catch-all, unlocalized legal page, per-page locale restriction

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| redirect-about | /about |  | /en/about-us |
| legal-imprint | /legal/imprint |  |  |
| localized-index | /:locale(en\|de\|fr) |  |  |
| localized-about-en | /:locale(en)/about-us |  |  |
| localized-about-de | /:locale(de)/ueber-uns |  |  |
| localized-about-fr | /:locale(fr)/a-propos |  |  |
| localized-contact | /:locale(en)/contact |  |  |
| localized-contact-de | /:locale(de)/kontakt |  |  |
| localized-contact-fr | /:locale(fr)/contact-fr |  |  |
| localized-blog | /:locale(en\|de\|fr)/blog |  |  |
| localized-blog-slug | /:locale(en)/blog/:slug() |  |  |
| localized-blog-slug-de | /:locale(de)/artikel/:slug |  |  |
| localized-blog-slug-fr | /:locale(fr)/article/:slug |  |  |
| localized-products | /:locale(en\|de\|fr)/products |  |  |
| localized-products-id-en | /:locale(en)/products/:id |  |  |
| localized-products-id-de | /:locale(de)/produkte/:id |  |  |
| localized-products-id-fr | /:locale(fr)/produits/:id |  |  |
| localized-careers | /:locale(en\|de)/careers |  |  |
| localized-slug | /:locale(en\|de\|fr)/:slug(.*)* |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| /de | localized-index | de | index | index | Deutsch | de | de | null |
| /de/artikel/hello-world | localized-blog-slug-de | de | blog-slug | blog-slug | Deutsch | de | de | null |
| /de/blog | localized-blog | de | blog | blog | Deutsch | de | de | null |
| /de/careers | localized-careers | de | careers | careers | Deutsch | de | de | null |
| /de/hello-world | localized-slug | de | slug | slug | Deutsch | de | de | null |
| /de/kontakt | localized-contact-de | de | contact | contact | Deutsch | de | de | null |
| /de/products | localized-products | de | products | products | Deutsch | de | de | null |
| /de/produkte/42 | localized-products-id-de | de | products-id | products-id | Deutsch | de | de | null |
| /de/ueber-uns | localized-about-de | de | about | about | Deutsch | de | de | null |
| /en | localized-index | en | index | index | English | en | en | null |
| /en/about-us | localized-about-en | en | about | about | English | en | en | null |
| /en/blog | localized-blog | en | blog | blog | English | en | en | null |
| /en/blog/hello-world | localized-blog-slug | en | blog-slug | blog-slug | English | en | en | null |
| /en/careers | localized-careers | en | careers | careers | English | en | en | null |
| /en/contact | localized-contact | en | contact | contact | English | en | en | null |
| /en/hello-world | localized-slug | en | slug | slug | English | en | en | null |
| /en/products | localized-products | en | products | products | English | en | en | null |
| /en/products/42 | localized-products-id-en | en | products-id | products-id | English | en | en | null |
| /fr | localized-index | fr | index | index | Français | fr | fr | null |
| /fr/a-propos | localized-about-fr | fr | about | about | Français | fr | fr | null |
| /fr/article/hello-world | localized-blog-slug-fr | fr | blog-slug | blog-slug | Français | fr | fr | null |
| /fr/blog | localized-blog | fr | blog | blog | Français | fr | fr | null |
| /fr/contact-fr | localized-contact-fr | fr | contact | contact | Français | fr | fr | null |
| /fr/hello-world | localized-slug | fr | slug | slug | Français | fr | fr | null |
| /fr/products | localized-products | fr | products | products | Français | fr | fr | null |
| /fr/produits/42 | localized-products-id-fr | fr | products-id | products-id | Français | fr | fr | null |
| /legal/imprint | legal-imprint | en | legal-imprint | legal-imprint | English | null | null | null |
| / | null | en |  | index | English | null | null | null |
| /en/ | localized-index | en | index | index | English | en | en | null |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | redirect-about | en | about | about | English | null | null | null |
| /de/about/ | localized-slug | de | slug | slug | Deutsch | de | de | null |
| /missing | null | en |  | slug | English | null | null | null |
| /de/missing | localized-slug | de | slug | slug | Deutsch | de | de | null |
| /xx/about | null | en |  | slug | English | null | null | null |
| /de/de/about | localized-slug | de | slug | slug | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| /de | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /de | null |
| /de/artikel/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /de/artikel/hello-world | null |
| /de/blog | /en/blog?q=1#top [localized-blog] |  | /en/blog?q=1#top [localized-blog] | /en/blog?q=1#top [localized-blog] | /de/blog | null |
| /de/careers | /en/careers?q=1#top [localized-careers] |  | /en/careers?q=1#top [localized-careers] | /en/careers?q=1#top [localized-careers] | /de/careers | null |
| /de/hello-world | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | /de/hello-world | null |
| /de/kontakt | /en/contact?q=1#top [localized-contact] |  | /en/contact?q=1#top [localized-contact] | /en/contact?q=1#top [localized-contact] | /de/kontakt | null |
| /de/products | /en/products?q=1#top [localized-products] |  | /en/products?q=1#top [localized-products] | /en/products?q=1#top [localized-products] | /de/products | null |
| /de/produkte/42 | /en/products/42?q=1#top [localized-products-id-en] | /en/products/42-en?q=1#top [localized-products-id-en] | /en/products/42?q=1#top [localized-products-id-en] | /en/products/42?q=1#top [localized-products-id-en] | /de/produkte/42 | null |
| /de/ueber-uns | /en/about-us?q=1#top [localized-about-en] |  | /en/about-us?q=1#top [localized-about-en] | /en/about-us?q=1#top [localized-about-en] | /de/ueber-uns | null |
| /en | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en | null |
| /en/about-us | /en/about-us?q=1#top [localized-about-en] |  | /en/about-us?q=1#top [localized-about-en] | /en/about-us?q=1#top [localized-about-en] | /en/about-us | null |
| /en/blog | /en/blog?q=1#top [localized-blog] |  | /en/blog?q=1#top [localized-blog] | /en/blog?q=1#top [localized-blog] | /en/blog | null |
| /en/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world | null |
| /en/careers | /en/careers?q=1#top [localized-careers] |  | /en/careers?q=1#top [localized-careers] | /en/careers?q=1#top [localized-careers] | /en/careers | null |
| /en/contact | /en/contact?q=1#top [localized-contact] |  | /en/contact?q=1#top [localized-contact] | /en/contact?q=1#top [localized-contact] | /en/contact | null |
| /en/hello-world | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | /en/hello-world | null |
| /en/products | /en/products?q=1#top [localized-products] |  | /en/products?q=1#top [localized-products] | /en/products?q=1#top [localized-products] | /en/products | null |
| /en/products/42 | /en/products/42?q=1#top [localized-products-id-en] | /en/products/42-en?q=1#top [localized-products-id-en] | /en/products/42?q=1#top [localized-products-id-en] | /en/products/42?q=1#top [localized-products-id-en] | /en/products/42 | null |
| /fr | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /fr | null |
| /fr/a-propos | /en/about-us?q=1#top [localized-about-en] |  | /en/about-us?q=1#top [localized-about-en] | /en/about-us?q=1#top [localized-about-en] | /fr/a-propos | null |
| /fr/article/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /fr/article/hello-world | null |
| /fr/blog | /en/blog?q=1#top [localized-blog] |  | /en/blog?q=1#top [localized-blog] | /en/blog?q=1#top [localized-blog] | /fr/blog | null |
| /fr/contact-fr | /en/contact?q=1#top [localized-contact] |  | /en/contact?q=1#top [localized-contact] | /en/contact?q=1#top [localized-contact] | /fr/contact-fr | null |
| /fr/hello-world | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | /fr/hello-world | null |
| /fr/products | /en/products?q=1#top [localized-products] |  | /en/products?q=1#top [localized-products] | /en/products?q=1#top [localized-products] | /fr/products | null |
| /fr/produits/42 | /en/products/42?q=1#top [localized-products-id-en] | /en/products/42-en?q=1#top [localized-products-id-en] | /en/products/42?q=1#top [localized-products-id-en] | /en/products/42?q=1#top [localized-products-id-en] | /fr/produits/42 | null |
| /legal/imprint | /legal/imprint?q=1#top [legal-imprint] |  | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint?q=1#top [legal-imprint] | /en/legal/imprint | null |
| / | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en | /en |
| /en/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en/ | null |
| /de/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /de/ | null |
| /about/ | /en/about-us?q=1#top [localized-about-en] |  | /en/about-us?q=1#top [localized-about-en] | /en/about-us?q=1#top [localized-about-en] | /en/about/ | /en/about-us |
| /de/about/ | /en/about/?q=1#top [localized-slug] | /en/about/?q=1#top [localized-slug] | /en/about/?q=1#top [localized-slug] | /en/about-us?q=1#top [localized-about-en] | /de/about/ | null |
| /missing | /en/missing?q=1#top [localized-slug] |  | /en/missing?q=1#top [localized-slug] | /en/missing?q=1#top [localized-slug] | /en/missing | /en/missing |
| /de/missing | /en/missing?q=1#top [localized-slug] | /en/missing?q=1#top [localized-slug] | /en/missing?q=1#top [localized-slug] | /en/missing?q=1#top [localized-slug] | /de/missing | null |
| /xx/about | /en/xx/about?q=1#top [localized-slug] |  | /en/xx/about?q=1#top [localized-slug] | /en/xx/about?q=1#top [localized-slug] | /en/xx/about | /en/xx/about |
| /de/de/about | /en/de/about?q=1#top [localized-slug] | /en/de/about?q=1#top [localized-slug] | /en/de/about?q=1#top [localized-slug] | /en/de/about?q=1#top [localized-slug] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | null |
| /de/artikel/hello-world | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world | null |
| /de/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /de/blog | null |
| /de/careers | /de/careers?q=1#top [localized-careers] |  | /de/careers?q=1#top [localized-careers] | /de/careers?q=1#top [localized-careers] | /de/careers | null |
| /de/hello-world | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world | null |
| /de/kontakt | /de/kontakt?q=1#top [localized-contact-de] |  | /de/kontakt?q=1#top [localized-contact-de] | /de/kontakt?q=1#top [localized-contact-de] | /de/kontakt | null |
| /de/products | /de/products?q=1#top [localized-products] |  | /de/products?q=1#top [localized-products] | /de/products?q=1#top [localized-products] | /de/products | null |
| /de/produkte/42 | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42-de?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42 | null |
| /de/ueber-uns | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns | null |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en | null |
| /en/about-us | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /en/about-us | null |
| /en/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /en/blog | null |
| /en/blog/hello-world | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /en/blog/hello-world | null |
| /en/careers | /de/careers?q=1#top [localized-careers] |  | /de/careers?q=1#top [localized-careers] | /de/careers?q=1#top [localized-careers] | /en/careers | null |
| /en/contact | /de/kontakt?q=1#top [localized-contact-de] |  | /de/kontakt?q=1#top [localized-contact-de] | /de/kontakt?q=1#top [localized-contact-de] | /en/contact | null |
| /en/hello-world | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /en/hello-world | null |
| /en/products | /de/products?q=1#top [localized-products] |  | /de/products?q=1#top [localized-products] | /de/products?q=1#top [localized-products] | /en/products | null |
| /en/products/42 | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42-de?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /en/products/42 | null |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /fr | null |
| /fr/a-propos | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /fr/a-propos | null |
| /fr/article/hello-world | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /fr/article/hello-world | null |
| /fr/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /fr/blog | null |
| /fr/contact-fr | /de/kontakt?q=1#top [localized-contact-de] |  | /de/kontakt?q=1#top [localized-contact-de] | /de/kontakt?q=1#top [localized-contact-de] | /fr/contact-fr | null |
| /fr/hello-world | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /fr/hello-world | null |
| /fr/products | /de/products?q=1#top [localized-products] |  | /de/products?q=1#top [localized-products] | /de/products?q=1#top [localized-products] | /fr/products | null |
| /fr/produits/42 | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42-de?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /fr/produits/42 | null |
| /legal/imprint | /legal/imprint?q=1#top [legal-imprint] |  | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint?q=1#top [legal-imprint] | /en/legal/imprint | null |
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en | /de |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en/ | null |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de/ | null |
| /about/ | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /en/about/ | /de/ueber-uns |
| /de/about/ | /de/about/?q=1#top [localized-slug] | /de/about/?q=1#top [localized-slug] | /de/about/?q=1#top [localized-slug] | /de/ueber-uns?q=1#top [localized-about-de] | /de/about/ | null |
| /missing | /de/missing?q=1#top [localized-slug] |  | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /en/missing | /de/missing |
| /de/missing | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /de/missing | null |
| /xx/about | /de/xx/about?q=1#top [localized-slug] |  | /de/xx/about?q=1#top [localized-slug] | /de/xx/about?q=1#top [localized-slug] | /en/xx/about | /de/xx/about |
| /de/de/about | /de/de/about?q=1#top [localized-slug] | /de/de/about?q=1#top [localized-slug] | /de/de/about?q=1#top [localized-slug] | /de/de/about?q=1#top [localized-slug] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de | null |
| /de/artikel/hello-world | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /de/artikel/hello-world | null |
| /de/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /de/blog | null |
| /de/careers | /en/careers?q=1#top [localized-careers] |  | /en/careers?q=1#top [localized-careers] | /en/careers?q=1#top [localized-careers] | /de/careers | null |
| /de/hello-world | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /de/hello-world | null |
| /de/kontakt | /fr/contact-fr?q=1#top [localized-contact-fr] |  | /fr/contact-fr?q=1#top [localized-contact-fr] | /fr/contact-fr?q=1#top [localized-contact-fr] | /de/kontakt | null |
| /de/products | /fr/products?q=1#top [localized-products] |  | /fr/products?q=1#top [localized-products] | /fr/products?q=1#top [localized-products] | /de/products | null |
| /de/produkte/42 | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42-fr?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /de/produkte/42 | null |
| /de/ueber-uns | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | /de/ueber-uns | null |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en | null |
| /en/about-us | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | /en/about-us | null |
| /en/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /en/blog | null |
| /en/blog/hello-world | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /en/blog/hello-world | null |
| /en/careers | /en/careers?q=1#top [localized-careers] |  | /en/careers?q=1#top [localized-careers] | /en/careers?q=1#top [localized-careers] | /en/careers | null |
| /en/contact | /fr/contact-fr?q=1#top [localized-contact-fr] |  | /fr/contact-fr?q=1#top [localized-contact-fr] | /fr/contact-fr?q=1#top [localized-contact-fr] | /en/contact | null |
| /en/hello-world | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /en/hello-world | null |
| /en/products | /fr/products?q=1#top [localized-products] |  | /fr/products?q=1#top [localized-products] | /fr/products?q=1#top [localized-products] | /en/products | null |
| /en/products/42 | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42-fr?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /en/products/42 | null |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | null |
| /fr/a-propos | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos | null |
| /fr/article/hello-world | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world | null |
| /fr/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /fr/blog | null |
| /fr/contact-fr | /fr/contact-fr?q=1#top [localized-contact-fr] |  | /fr/contact-fr?q=1#top [localized-contact-fr] | /fr/contact-fr?q=1#top [localized-contact-fr] | /fr/contact-fr | null |
| /fr/hello-world | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world | null |
| /fr/products | /fr/products?q=1#top [localized-products] |  | /fr/products?q=1#top [localized-products] | /fr/products?q=1#top [localized-products] | /fr/products | null |
| /fr/produits/42 | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42-fr?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42 | null |
| /legal/imprint | /legal/imprint?q=1#top [legal-imprint] |  | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint?q=1#top [legal-imprint] | /en/legal/imprint | null |
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en | /fr |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en/ | null |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de/ | null |
| /about/ | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | /en/about/ | /fr/a-propos |
| /de/about/ | /fr/about/?q=1#top [localized-slug] | /fr/about/?q=1#top [localized-slug] | /fr/about/?q=1#top [localized-slug] | /fr/a-propos?q=1#top [localized-about-fr] | /de/about/ | null |
| /missing | /fr/missing?q=1#top [localized-slug] |  | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /en/missing | /fr/missing |
| /de/missing | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /de/missing | null |
| /xx/about | /fr/xx/about?q=1#top [localized-slug] |  | /fr/xx/about?q=1#top [localized-slug] | /fr/xx/about?q=1#top [localized-slug] | /en/xx/about | /fr/xx/about |
| /de/de/about | /fr/de/about?q=1#top [localized-slug] | /fr/de/about?q=1#top [localized-slug] | /fr/de/about?q=1#top [localized-slug] | /fr/de/about?q=1#top [localized-slug] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from /en | de from /en | fr from /en | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /en/about-us [localized-about-en] | /de/ueber-uns [localized-about-de] | /fr/a-propos [localized-about-fr] | /en/about-us [localized-about-en] | /de/ueber-uns [localized-about-de] | /fr/a-propos [localized-about-fr] | /en/about-us [localized-about-en] | /de/ueber-uns [localized-about-de] | /fr/a-propos [localized-about-fr] |
| blog | /en/blog [localized-blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] | /en/blog [localized-blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] | /en/blog [localized-blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] |
| blog-slug | /en/blog/hello-world [localized-blog-slug] | /de/artikel/hello-world [localized-blog-slug-de] | /fr/article/hello-world [localized-blog-slug-fr] | /en/blog/hello-world [localized-blog-slug] | /de/artikel/hello-world [localized-blog-slug-de] | /fr/article/hello-world [localized-blog-slug-fr] | /en/blog/hello-world [localized-blog-slug] | /de/artikel/hello-world [localized-blog-slug-de] | /fr/article/hello-world [localized-blog-slug-fr] |
| careers | /en/careers [localized-careers] | /de/careers [localized-careers] | /en/careers [localized-careers] | /en/careers [localized-careers] | /de/careers [localized-careers] | /en/careers [localized-careers] | /en/careers [localized-careers] | /de/careers [localized-careers] | /en/careers [localized-careers] |
| contact | /en/contact [localized-contact] | /de/kontakt [localized-contact-de] | /fr/contact-fr [localized-contact-fr] | /en/contact [localized-contact] | /de/kontakt [localized-contact-de] | /fr/contact-fr [localized-contact-fr] | /en/contact [localized-contact] | /de/kontakt [localized-contact-de] | /fr/contact-fr [localized-contact-fr] |
| index | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] |
| legal-imprint | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] |
| products | /en/products [localized-products] | /de/products [localized-products] | /fr/products [localized-products] | /en/products [localized-products] | /de/products [localized-products] | /fr/products [localized-products] | /en/products [localized-products] | /de/products [localized-products] | /fr/products [localized-products] |
| products-id | /en/products/42 [localized-products-id-en] | /de/produkte/42 [localized-products-id-de] | /fr/produits/42 [localized-products-id-fr] | /en/products/42 [localized-products-id-en] | /de/produkte/42 [localized-products-id-de] | /fr/produits/42 [localized-products-id-fr] | /en/products/42 [localized-products-id-en] | /de/produkte/42 [localized-products-id-de] | /fr/produits/42 [localized-products-id-fr] |
| slug | /en/hello-world [localized-slug] | /de/hello-world [localized-slug] | /fr/hello-world [localized-slug] | /en/hello-world [localized-slug] | /de/hello-world [localized-slug] | /fr/hello-world [localized-slug] | /en/hello-world [localized-slug] | /de/hello-world [localized-slug] | /fr/hello-world [localized-slug] |

## Invariant breaks (0)

none
