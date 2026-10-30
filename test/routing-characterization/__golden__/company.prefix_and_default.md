# company · prefix_and_default

typical company site: translated slugs, dynamic pages, catch-all, unlocalized legal page, per-page locale restriction, one routeRules redirect

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| about | /about-us |  |  |
| contact | /contact |  |  |
| blog | /blog |  |  |
| blog-slug | /blog/:slug() |  |  |
| products | /products |  |  |
| products-id | /products/:id |  |  |
| legal-imprint | /legal/imprint |  |  |
| careers | /careers |  |  |
| slug | /:slug(.*)* |  |  |
| — | /old |  |  |
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
| — | /:locale(en\|de\|fr)/old |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | en | null |
| /about-us | about | en | about | about | English | null | en | null |
| /blog | blog | en | blog | blog | English | null | en | null |
| /blog/hello-world | blog-slug | en | blog-slug | blog-slug | English | null | en | null |
| /careers | careers | en | careers | careers | English | null | en | null |
| /contact | contact | en | contact | contact | English | null | en | null |
| /de | localized-index | de | index | index | Deutsch | de | de | null |
| /de/artikel/hello-world | localized-blog-slug-de | de | blog-slug | blog-slug | Deutsch | de | de | null |
| /de/blog | localized-blog | de | blog | blog | Deutsch | de | de | null |
| /de/careers | localized-careers | de | careers | careers | Deutsch | de | de | null |
| /de/hello-world | localized-slug | de | slug | slug | Deutsch | de | de | null |
| /de/kontakt | localized-contact-de | de | contact | contact | Deutsch | de | de | null |
| /de/old | null | de |  | null | Deutsch | de | de | null |
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
| /en/old | null | en |  | null | English | en | en | null |
| /en/products | localized-products | en | products | products | English | en | en | null |
| /en/products/42 | localized-products-id-en | en | products-id | products-id | English | en | en | null |
| /fr | localized-index | fr | index | index | Français | fr | fr | null |
| /fr/a-propos | localized-about-fr | fr | about | about | Français | fr | fr | null |
| /fr/article/hello-world | localized-blog-slug-fr | fr | blog-slug | blog-slug | Français | fr | fr | null |
| /fr/blog | localized-blog | fr | blog | blog | Français | fr | fr | null |
| /fr/contact-fr | localized-contact-fr | fr | contact | contact | Français | fr | fr | null |
| /fr/hello-world | localized-slug | fr | slug | slug | Français | fr | fr | null |
| /fr/old | null | fr |  | null | Français | fr | fr | null |
| /fr/products | localized-products | fr | products | products | Français | fr | fr | null |
| /fr/produits/42 | localized-products-id-fr | fr | products-id | products-id | Français | fr | fr | null |
| /hello-world | slug | en | slug | slug | English | null | en | null |
| /legal/imprint | legal-imprint | en | legal-imprint | legal-imprint | English | null | en | null |
| /old | null | en |  | null | English | null | en | null |
| /products | products | en | products | products | English | null | en | null |
| /products/42 | products-id | en | products-id | products-id | English | null | en | null |
| /en/ | localized-index | en | index | index | English | en | en | null |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | slug | en | slug | slug | English | null | en | null |
| /de/about/ | localized-slug | de | slug | slug | Deutsch | de | de | null |
| /missing | slug | en | slug | slug | English | null | en | null |
| /de/missing | localized-slug | de | slug | slug | Deutsch | de | de | null |
| /xx/about | slug | en | slug | slug | English | null | en | null |
| /de/de/about | localized-slug | de | slug | slug | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /about-us | /en/about-us?q=1#top [localized-about-en] |  | /en/about-us?q=1#top [localized-about-en] | /en/about-us?q=1#top [localized-about-en] | null | null | en,de,fr |
| /blog | /en/blog?q=1#top [localized-blog] |  | /en/blog?q=1#top [localized-blog] | /en/blog?q=1#top [localized-blog] | null | null | en,de,fr |
| /blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,fr |
| /careers | /en/careers?q=1#top [localized-careers] |  | /en/careers?q=1#top [localized-careers] | /en/careers?q=1#top [localized-careers] | null | null | en,de |
| /contact | /en/contact?q=1#top [localized-contact] |  | /en/contact?q=1#top [localized-contact] | /en/contact?q=1#top [localized-contact] | null | null | en,de,fr |
| /de | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /de/artikel/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | null | /en/blog/hello-world | en,de,fr |
| /de/blog | /en/blog?q=1#top [localized-blog] |  | /en/blog?q=1#top [localized-blog] | /en/blog?q=1#top [localized-blog] | null | /en/blog | en,de,fr |
| /de/careers | /en/careers?q=1#top [localized-careers] |  | /en/careers?q=1#top [localized-careers] | /en/careers?q=1#top [localized-careers] | null | /en/careers | en,de |
| /de/hello-world | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | null | /en/hello-world | en,de,fr |
| /de/kontakt | /en/contact?q=1#top [localized-contact] |  | /en/contact?q=1#top [localized-contact] | /en/contact?q=1#top [localized-contact] | null | /en/contact | en,de,fr |
| /de/old | /en/old?q=1#top [—] |  | /en/old?q=1#top [null] | /en/old?q=1#top [null] | null | /en/old | null |
| /de/products | /en/products?q=1#top [localized-products] |  | /en/products?q=1#top [localized-products] | /en/products?q=1#top [localized-products] | null | /en/products | en,de,fr |
| /de/produkte/42 | /en/products/42?q=1#top [localized-products-id-en] | /en/products/42-en?q=1#top [localized-products-id-en] | /en/products/42?q=1#top [localized-products-id-en] | /en/products/42?q=1#top [localized-products-id-en] | null | /en/products/42 | en,de,fr |
| /de/ueber-uns | /en/about-us?q=1#top [localized-about-en] |  | /en/about-us?q=1#top [localized-about-en] | /en/about-us?q=1#top [localized-about-en] | null | /en/about-us | en,de,fr |
| /en | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /en/about-us | /en/about-us?q=1#top [localized-about-en] |  | /en/about-us?q=1#top [localized-about-en] | /en/about-us?q=1#top [localized-about-en] | null | null | en,de,fr |
| /en/blog | /en/blog?q=1#top [localized-blog] |  | /en/blog?q=1#top [localized-blog] | /en/blog?q=1#top [localized-blog] | null | null | en,de,fr |
| /en/blog/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | null | null | en,de,fr |
| /en/careers | /en/careers?q=1#top [localized-careers] |  | /en/careers?q=1#top [localized-careers] | /en/careers?q=1#top [localized-careers] | null | null | en,de |
| /en/contact | /en/contact?q=1#top [localized-contact] |  | /en/contact?q=1#top [localized-contact] | /en/contact?q=1#top [localized-contact] | null | null | en,de,fr |
| /en/hello-world | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | null | null | en,de,fr |
| /en/old | /en/old?q=1#top [—] |  | /en/old?q=1#top [null] | /en/old?q=1#top [null] | null | null | null |
| /en/products | /en/products?q=1#top [localized-products] |  | /en/products?q=1#top [localized-products] | /en/products?q=1#top [localized-products] | null | null | en,de,fr |
| /en/products/42 | /en/products/42?q=1#top [localized-products-id-en] | /en/products/42-en?q=1#top [localized-products-id-en] | /en/products/42?q=1#top [localized-products-id-en] | /en/products/42?q=1#top [localized-products-id-en] | null | null | en,de,fr |
| /fr | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /fr/a-propos | /en/about-us?q=1#top [localized-about-en] |  | /en/about-us?q=1#top [localized-about-en] | /en/about-us?q=1#top [localized-about-en] | null | /en/about-us | en,de,fr |
| /fr/article/hello-world | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world-en?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | /en/blog/hello-world?q=1#top [localized-blog-slug] | null | /en/blog/hello-world | en,de,fr |
| /fr/blog | /en/blog?q=1#top [localized-blog] |  | /en/blog?q=1#top [localized-blog] | /en/blog?q=1#top [localized-blog] | null | /en/blog | en,de,fr |
| /fr/contact-fr | /en/contact?q=1#top [localized-contact] |  | /en/contact?q=1#top [localized-contact] | /en/contact?q=1#top [localized-contact] | null | /en/contact | en,de,fr |
| /fr/hello-world | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | null | /en/hello-world | en,de,fr |
| /fr/old | /en/old?q=1#top [—] |  | /en/old?q=1#top [null] | /en/old?q=1#top [null] | null | /en/old | null |
| /fr/products | /en/products?q=1#top [localized-products] |  | /en/products?q=1#top [localized-products] | /en/products?q=1#top [localized-products] | null | /en/products | en,de,fr |
| /fr/produits/42 | /en/products/42?q=1#top [localized-products-id-en] | /en/products/42-en?q=1#top [localized-products-id-en] | /en/products/42?q=1#top [localized-products-id-en] | /en/products/42?q=1#top [localized-products-id-en] | null | /en/products/42 | en,de,fr |
| /hello-world | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | /en/hello-world?q=1#top [localized-slug] | null | null | en,de,fr |
| /legal/imprint | /legal/imprint?q=1#top [legal-imprint] |  | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint?q=1#top [legal-imprint] | null | null | null |
| /old | /en/old?q=1#top [—] |  | /en/old?q=1#top [null] | /en/old?q=1#top [null] | null | null | null |
| /products | /en/products?q=1#top [localized-products] |  | /en/products?q=1#top [localized-products] | /en/products?q=1#top [localized-products] | null | null | en,de,fr |
| /products/42 | /en/products/42?q=1#top [localized-products-id-en] | /en/products/42-en?q=1#top [localized-products-id-en] | /en/products/42?q=1#top [localized-products-id-en] | /en/products/42?q=1#top [localized-products-id-en] | null | null | en,de,fr |
| /en/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /de/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /about/ | /en/about/?q=1#top [localized-slug] | /en/about/?q=1#top [localized-slug] | /en/about/?q=1#top [localized-slug] | /en/about/?q=1#top [localized-slug] | null | null | en,de,fr |
| /de/about/ | /en/about/?q=1#top [localized-slug] | /en/about/?q=1#top [localized-slug] | /en/about/?q=1#top [localized-slug] | /en/about/?q=1#top [localized-slug] | null | /en/about | en,de,fr |
| /missing | /en/missing?q=1#top [localized-slug] | /en/missing?q=1#top [localized-slug] | /en/missing?q=1#top [localized-slug] | /en/missing?q=1#top [localized-slug] | null | null | en,de,fr |
| /de/missing | /en/missing?q=1#top [localized-slug] | /en/missing?q=1#top [localized-slug] | /en/missing?q=1#top [localized-slug] | /en/missing?q=1#top [localized-slug] | null | /en/missing | en,de,fr |
| /xx/about | /en/xx/about?q=1#top [localized-slug] | /en/xx/about?q=1#top [localized-slug] | /en/xx/about?q=1#top [localized-slug] | /en/xx/about?q=1#top [localized-slug] | null | null | en,de,fr |
| /de/de/about | /en/de/about?q=1#top [localized-slug] | /en/de/about?q=1#top [localized-slug] | /en/de/about?q=1#top [localized-slug] | /en/de/about?q=1#top [localized-slug] | null | /en/de/about | en,de,fr |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /about-us | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | null | en,de,fr |
| /blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | null | null | en,de,fr |
| /blog/hello-world | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | null | null | en,de,fr |
| /careers | /de/careers?q=1#top [localized-careers] |  | /de/careers?q=1#top [localized-careers] | /de/careers?q=1#top [localized-careers] | null | null | en,de |
| /contact | /de/kontakt?q=1#top [localized-contact-de] |  | /de/kontakt?q=1#top [localized-contact-de] | /de/kontakt?q=1#top [localized-contact-de] | null | null | en,de,fr |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /de/artikel/hello-world | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | null | null | en,de,fr |
| /de/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | null | null | en,de,fr |
| /de/careers | /de/careers?q=1#top [localized-careers] |  | /de/careers?q=1#top [localized-careers] | /de/careers?q=1#top [localized-careers] | null | null | en,de |
| /de/hello-world | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | null | null | en,de,fr |
| /de/kontakt | /de/kontakt?q=1#top [localized-contact-de] |  | /de/kontakt?q=1#top [localized-contact-de] | /de/kontakt?q=1#top [localized-contact-de] | null | null | en,de,fr |
| /de/old | /de/old?q=1#top [—] |  | /de/old?q=1#top [null] | /de/old?q=1#top [null] | null | null | null |
| /de/products | /de/products?q=1#top [localized-products] |  | /de/products?q=1#top [localized-products] | /de/products?q=1#top [localized-products] | null | null | en,de,fr |
| /de/produkte/42 | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42-de?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | null | null | en,de,fr |
| /de/ueber-uns | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | null | en,de,fr |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /en/about-us | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | /de/ueber-uns | en,de,fr |
| /en/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | null | /de/blog | en,de,fr |
| /en/blog/hello-world | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | null | /de/artikel/hello-world | en,de,fr |
| /en/careers | /de/careers?q=1#top [localized-careers] |  | /de/careers?q=1#top [localized-careers] | /de/careers?q=1#top [localized-careers] | null | /de/careers | en,de |
| /en/contact | /de/kontakt?q=1#top [localized-contact-de] |  | /de/kontakt?q=1#top [localized-contact-de] | /de/kontakt?q=1#top [localized-contact-de] | null | /de/kontakt | en,de,fr |
| /en/hello-world | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | null | /de/hello-world | en,de,fr |
| /en/old | /de/old?q=1#top [—] |  | /de/old?q=1#top [null] | /de/old?q=1#top [null] | null | /de/old | null |
| /en/products | /de/products?q=1#top [localized-products] |  | /de/products?q=1#top [localized-products] | /de/products?q=1#top [localized-products] | null | /de/products | en,de,fr |
| /en/products/42 | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42-de?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | null | /de/produkte/42 | en,de,fr |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /fr/a-propos | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | /de/ueber-uns | en,de,fr |
| /fr/article/hello-world | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | null | /de/artikel/hello-world | en,de,fr |
| /fr/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | null | /de/blog | en,de,fr |
| /fr/contact-fr | /de/kontakt?q=1#top [localized-contact-de] |  | /de/kontakt?q=1#top [localized-contact-de] | /de/kontakt?q=1#top [localized-contact-de] | null | /de/kontakt | en,de,fr |
| /fr/hello-world | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | null | /de/hello-world | en,de,fr |
| /fr/old | /de/old?q=1#top [—] |  | /de/old?q=1#top [null] | /de/old?q=1#top [null] | null | /de/old | null |
| /fr/products | /de/products?q=1#top [localized-products] |  | /de/products?q=1#top [localized-products] | /de/products?q=1#top [localized-products] | null | /de/products | en,de,fr |
| /fr/produits/42 | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42-de?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | null | /de/produkte/42 | en,de,fr |
| /hello-world | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | null | null | en,de,fr |
| /legal/imprint | /legal/imprint?q=1#top [legal-imprint] |  | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint?q=1#top [legal-imprint] | null | null | null |
| /old | /de/old?q=1#top [—] |  | /de/old?q=1#top [null] | /de/old?q=1#top [null] | null | null | null |
| /products | /de/products?q=1#top [localized-products] |  | /de/products?q=1#top [localized-products] | /de/products?q=1#top [localized-products] | null | null | en,de,fr |
| /products/42 | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42-de?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | null | null | en,de,fr |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /about/ | /de/about/?q=1#top [localized-slug] | /de/about/?q=1#top [localized-slug] | /de/about/?q=1#top [localized-slug] | /de/about/?q=1#top [localized-slug] | null | null | en,de,fr |
| /de/about/ | /de/about/?q=1#top [localized-slug] | /de/about/?q=1#top [localized-slug] | /de/about/?q=1#top [localized-slug] | /de/about/?q=1#top [localized-slug] | null | null | en,de,fr |
| /missing | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | null | null | en,de,fr |
| /de/missing | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | null | null | en,de,fr |
| /xx/about | /de/xx/about?q=1#top [localized-slug] | /de/xx/about?q=1#top [localized-slug] | /de/xx/about?q=1#top [localized-slug] | /de/xx/about?q=1#top [localized-slug] | null | null | en,de,fr |
| /de/de/about | /de/de/about?q=1#top [localized-slug] | /de/de/about?q=1#top [localized-slug] | /de/de/about?q=1#top [localized-slug] | /de/de/about?q=1#top [localized-slug] | null | null | en,de,fr |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,fr |
| /about-us | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | null | en,de,fr |
| /blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | null | null | en,de,fr |
| /blog/hello-world | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | null | null | en,de,fr |
| /careers | /fr [localized-index] |  | /fr [localized-index] | /fr [localized-index] | null | null | en,de |
| /contact | /fr/contact-fr?q=1#top [localized-contact-fr] |  | /fr/contact-fr?q=1#top [localized-contact-fr] | /fr/contact-fr?q=1#top [localized-contact-fr] | null | null | en,de,fr |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/artikel/hello-world | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | null | /fr/article/hello-world | en,de,fr |
| /de/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | null | /fr/blog | en,de,fr |
| /de/careers | /fr [localized-index] |  | /fr [localized-index] | /fr [localized-index] | null | null | en,de |
| /de/hello-world | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | null | /fr/hello-world | en,de,fr |
| /de/kontakt | /fr/contact-fr?q=1#top [localized-contact-fr] |  | /fr/contact-fr?q=1#top [localized-contact-fr] | /fr/contact-fr?q=1#top [localized-contact-fr] | null | /fr/contact-fr | en,de,fr |
| /de/old | /fr/old?q=1#top [—] |  | /fr/old?q=1#top [null] | /fr/old?q=1#top [null] | null | /fr/old | null |
| /de/products | /fr/products?q=1#top [localized-products] |  | /fr/products?q=1#top [localized-products] | /fr/products?q=1#top [localized-products] | null | /fr/products | en,de,fr |
| /de/produkte/42 | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42-fr?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | null | /fr/produits/42 | en,de,fr |
| /de/ueber-uns | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | /fr/a-propos | en,de,fr |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /en/about-us | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | /fr/a-propos | en,de,fr |
| /en/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | null | /fr/blog | en,de,fr |
| /en/blog/hello-world | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | null | /fr/article/hello-world | en,de,fr |
| /en/careers | /fr [localized-index] |  | /fr [localized-index] | /fr [localized-index] | null | null | en,de |
| /en/contact | /fr/contact-fr?q=1#top [localized-contact-fr] |  | /fr/contact-fr?q=1#top [localized-contact-fr] | /fr/contact-fr?q=1#top [localized-contact-fr] | null | /fr/contact-fr | en,de,fr |
| /en/hello-world | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | null | /fr/hello-world | en,de,fr |
| /en/old | /fr/old?q=1#top [—] |  | /fr/old?q=1#top [null] | /fr/old?q=1#top [null] | null | /fr/old | null |
| /en/products | /fr/products?q=1#top [localized-products] |  | /fr/products?q=1#top [localized-products] | /fr/products?q=1#top [localized-products] | null | /fr/products | en,de,fr |
| /en/products/42 | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42-fr?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | null | /fr/produits/42 | en,de,fr |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,fr |
| /fr/a-propos | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | null | en,de,fr |
| /fr/article/hello-world | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | null | null | en,de,fr |
| /fr/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | null | null | en,de,fr |
| /fr/contact-fr | /fr/contact-fr?q=1#top [localized-contact-fr] |  | /fr/contact-fr?q=1#top [localized-contact-fr] | /fr/contact-fr?q=1#top [localized-contact-fr] | null | null | en,de,fr |
| /fr/hello-world | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | null | null | en,de,fr |
| /fr/old | /fr/old?q=1#top [—] |  | /fr/old?q=1#top [null] | /fr/old?q=1#top [null] | null | null | null |
| /fr/products | /fr/products?q=1#top [localized-products] |  | /fr/products?q=1#top [localized-products] | /fr/products?q=1#top [localized-products] | null | null | en,de,fr |
| /fr/produits/42 | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42-fr?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | null | null | en,de,fr |
| /hello-world | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | null | null | en,de,fr |
| /legal/imprint | /legal/imprint?q=1#top [legal-imprint] |  | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint?q=1#top [legal-imprint] | null | null | null |
| /old | /fr/old?q=1#top [—] |  | /fr/old?q=1#top [null] | /fr/old?q=1#top [null] | null | null | null |
| /products | /fr/products?q=1#top [localized-products] |  | /fr/products?q=1#top [localized-products] | /fr/products?q=1#top [localized-products] | null | null | en,de,fr |
| /products/42 | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42-fr?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | null | null | en,de,fr |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /about/ | /fr/about/?q=1#top [localized-slug] | /fr/about/?q=1#top [localized-slug] | /fr/about/?q=1#top [localized-slug] | /fr/about/?q=1#top [localized-slug] | null | null | en,de,fr |
| /de/about/ | /fr/about/?q=1#top [localized-slug] | /fr/about/?q=1#top [localized-slug] | /fr/about/?q=1#top [localized-slug] | /fr/about/?q=1#top [localized-slug] | null | /fr/about | en,de,fr |
| /missing | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | null | null | en,de,fr |
| /de/missing | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | null | /fr/missing | en,de,fr |
| /xx/about | /fr/xx/about?q=1#top [localized-slug] | /fr/xx/about?q=1#top [localized-slug] | /fr/xx/about?q=1#top [localized-slug] | /fr/xx/about?q=1#top [localized-slug] | null | null | en,de,fr |
| /de/de/about | /fr/de/about?q=1#top [localized-slug] | /fr/de/about?q=1#top [localized-slug] | /fr/de/about?q=1#top [localized-slug] | /fr/de/about?q=1#top [localized-slug] | null | /fr/de/about | en,de,fr |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /en/about-us [localized-about-en] | /de/ueber-uns [localized-about-de] | /fr/a-propos [localized-about-fr] | /en/about-us [localized-about-en] | /de/ueber-uns [localized-about-de] | /fr/a-propos [localized-about-fr] | /en/about-us [localized-about-en] | /de/ueber-uns [localized-about-de] | /fr/a-propos [localized-about-fr] |
| blog | /en/blog [localized-blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] | /en/blog [localized-blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] | /en/blog [localized-blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] |
| blog-slug | /en/blog/hello-world [localized-blog-slug] | /de/artikel/hello-world [localized-blog-slug-de] | /fr/article/hello-world [localized-blog-slug-fr] | /en/blog/hello-world [localized-blog-slug] | /de/artikel/hello-world [localized-blog-slug-de] | /fr/article/hello-world [localized-blog-slug-fr] | /en/blog/hello-world [localized-blog-slug] | /de/artikel/hello-world [localized-blog-slug-de] | /fr/article/hello-world [localized-blog-slug-fr] |
| careers | /en/careers [localized-careers] | /de/careers [localized-careers] | /fr [localized-index] | /en/careers [localized-careers] | /de/careers [localized-careers] | /fr [localized-index] | /en/careers [localized-careers] | /de/careers [localized-careers] | /fr [localized-index] |
| contact | /en/contact [localized-contact] | /de/kontakt [localized-contact-de] | /fr/contact-fr [localized-contact-fr] | /en/contact [localized-contact] | /de/kontakt [localized-contact-de] | /fr/contact-fr [localized-contact-fr] | /en/contact [localized-contact] | /de/kontakt [localized-contact-de] | /fr/contact-fr [localized-contact-fr] |
| index | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] |
| legal-imprint | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] |
| products | /en/products [localized-products] | /de/products [localized-products] | /fr/products [localized-products] | /en/products [localized-products] | /de/products [localized-products] | /fr/products [localized-products] | /en/products [localized-products] | /de/products [localized-products] | /fr/products [localized-products] |
| products-id | /en/products/42 [localized-products-id-en] | /de/produkte/42 [localized-products-id-de] | /fr/produits/42 [localized-products-id-fr] | /en/products/42 [localized-products-id-en] | /de/produkte/42 [localized-products-id-de] | /fr/produits/42 [localized-products-id-fr] | /en/products/42 [localized-products-id-en] | /de/produkte/42 [localized-products-id-de] | /fr/produits/42 [localized-products-id-fr] |
| slug | /en/hello-world [localized-slug] | /de/hello-world [localized-slug] | /fr/hello-world [localized-slug] | /en/hello-world [localized-slug] | /de/hello-world [localized-slug] | /fr/hello-world [localized-slug] | /en/hello-world [localized-slug] | /de/hello-world [localized-slug] | /fr/hello-world [localized-slug] |

## Invariant breaks (3)

- /careers → fr → en: round trip ends on /en, not /en/careers?q=1#top
- /de/careers → fr → de: round trip ends on /de, not /de/careers?q=1#top
- /en/careers → fr → en: round trip ends on /en, not /en/careers?q=1#top
