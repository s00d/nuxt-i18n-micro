# company · prefix_except_default

typical company site: translated slugs, dynamic pages, catch-all, unlocalized legal page, per-page locale restriction

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| about | /about-us | /about |  |
| contact | /contact |  |  |
| blog | /blog |  |  |
| blog-slug | /blog/:slug() |  |  |
| products | /products |  |  |
| products-id | /products/:id | /products/:id() |  |
| legal-imprint | /legal/imprint |  |  |
| careers | /careers |  |  |
| slug | /:slug(.*)* |  |  |
| localized-index | /:locale(de\|fr) |  |  |
| localized-about-de | /:locale(de)/ueber-uns |  |  |
| localized-about-fr | /:locale(fr)/a-propos |  |  |
| localized-contact-de | /:locale(de)/kontakt |  |  |
| localized-contact-fr | /:locale(fr)/contact-fr |  |  |
| localized-blog | /:locale(de\|fr)/blog |  |  |
| localized-blog-slug-de | /:locale(de)/artikel/:slug |  |  |
| localized-blog-slug-fr | /:locale(fr)/article/:slug |  |  |
| localized-products | /:locale(de\|fr)/products |  |  |
| localized-products-id-de | /:locale(de)/produkte/:id |  |  |
| localized-products-id-fr | /:locale(fr)/produits/:id |  |  |
| localized-careers | /:locale(de)/careers |  |  |
| localized-slug | /:locale(de\|fr)/:slug(.*)* |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | en | null |
| /about | about | en | about | about | English | null | en | null |
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
| /de/products | localized-products | de | products | products | Deutsch | de | de | null |
| /de/produkte/42 | localized-products-id-de | de | products-id | products-id | Deutsch | de | de | null |
| /de/ueber-uns | localized-about-de | de | about | about | Deutsch | de | de | null |
| /fr | localized-index | fr | index | index | Français | fr | fr | null |
| /fr/a-propos | localized-about-fr | fr | about | about | Français | fr | fr | null |
| /fr/article/hello-world | localized-blog-slug-fr | fr | blog-slug | blog-slug | Français | fr | fr | null |
| /fr/blog | localized-blog | fr | blog | blog | Français | fr | fr | null |
| /fr/contact-fr | localized-contact-fr | fr | contact | contact | Français | fr | fr | null |
| /fr/hello-world | localized-slug | fr | slug | slug | Français | fr | fr | null |
| /fr/products | localized-products | fr | products | products | Français | fr | fr | null |
| /fr/produits/42 | localized-products-id-fr | fr | products-id | products-id | Français | fr | fr | null |
| /hello-world | slug | en | slug | slug | English | null | en | null |
| /legal/imprint | legal-imprint | en | legal-imprint | legal-imprint | English | null | en | null |
| /products | products | en | products | products | English | null | en | null |
| /products/42 | products-id | en | products-id | products-id | English | null | en | null |
| /en | slug | en | slug | slug | English | en | en | Default locale should not have prefix |
| /en/ | slug | en | slug | slug | English | en | en | Default locale should not have prefix |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | about | en | about | about | English | null | en | null |
| /de/about/ | localized-slug | de | slug | slug | Deutsch | de | de | null |
| /missing | slug | en | slug | slug | English | null | en | null |
| /de/missing | localized-slug | de | slug | slug | Deutsch | de | de | null |
| /xx/about | slug | en | slug | slug | English | null | en | null |
| /de/de/about | localized-slug | de | slug | slug | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /about | /about-us?q=1#top [about] |  | /about-us?q=1#top [about] | /about-us?q=1#top [about] | /about | /about-us |
| /about-us | /about-us?q=1#top [about] |  | /about-us?q=1#top [about] | /about-us?q=1#top [about] | /about-us | null |
| /blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | /blog | null |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world | null |
| /careers | /careers?q=1#top [careers] |  | /careers?q=1#top [careers] | /careers?q=1#top [careers] | /careers | null |
| /contact | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | /contact | null |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/artikel/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /de/artikel/hello-world | null |
| /de/blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | /de/blog | null |
| /de/careers | /careers?q=1#top [careers] |  | /careers?q=1#top [careers] | /careers?q=1#top [careers] | /de/careers | null |
| /de/hello-world | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /de/hello-world | null |
| /de/kontakt | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | /de/kontakt | null |
| /de/products | /products?q=1#top [products] |  | /products?q=1#top [products] | /products?q=1#top [products] | /de/products | null |
| /de/produkte/42 | /products/42?q=1#top [products-id] | /products/42-en?q=1#top [products-id] | /products/42?q=1#top [products-id] | /products/42?q=1#top [products-id] | /de/produkte/42 | null |
| /de/ueber-uns | /about-us?q=1#top [about] |  | /about-us?q=1#top [about] | /about-us?q=1#top [about] | /de/ueber-uns | null |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /fr | null |
| /fr/a-propos | /about-us?q=1#top [about] |  | /about-us?q=1#top [about] | /about-us?q=1#top [about] | /fr/a-propos | null |
| /fr/article/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /fr/article/hello-world | null |
| /fr/blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | /fr/blog | null |
| /fr/contact-fr | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | /fr/contact-fr | null |
| /fr/hello-world | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /fr/hello-world | null |
| /fr/products | /products?q=1#top [products] |  | /products?q=1#top [products] | /products?q=1#top [products] | /fr/products | null |
| /fr/produits/42 | /products/42?q=1#top [products-id] | /products/42-en?q=1#top [products-id] | /products/42?q=1#top [products-id] | /products/42?q=1#top [products-id] | /fr/produits/42 | null |
| /hello-world | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world | null |
| /legal/imprint | /legal/imprint?q=1#top [legal-imprint] |  | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint | null |
| /products | /products?q=1#top [products] |  | /products?q=1#top [products] | /products?q=1#top [products] | /products | null |
| /products/42 | /products/42?q=1#top [products-id] | /products/42-en?q=1#top [products-id] | /products/42?q=1#top [products-id] | /products/42?q=1#top [products-id] | /products/42 | null |
| /en | /en?q=1#top [slug] | /en?q=1#top [slug] | /en?q=1#top [slug] | /en?q=1#top [slug] | /en | null |
| /en/ | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /en/ | null |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /about-us?q=1#top [about] |  | /about-us?q=1#top [about] | /about-us?q=1#top [about] | /about/ | /about-us |
| /de/about/ | /about/?q=1#top [slug] | /about/?q=1#top [slug] | /about/?q=1#top [slug] | /about/?q=1#top [slug] | /de/about/ | null |
| /missing | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing | null |
| /de/missing | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about | null |
| /de/de/about | /de/about?q=1#top [slug] | /de/about?q=1#top [slug] | /de/about?q=1#top [slug] | /de/about?q=1#top [slug] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | / | /de |
| /about | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /about | /de/ueber-uns |
| /about-us | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /about-us | /de/ueber-uns |
| /blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /blog | /de/blog |
| /blog/hello-world | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /blog/hello-world | /de/artikel/hello-world |
| /careers | /de/careers?q=1#top [localized-careers] |  | /de/careers?q=1#top [localized-careers] | /de/careers?q=1#top [localized-careers] | /careers | /de/careers |
| /contact | /de/kontakt?q=1#top [localized-contact-de] |  | /de/kontakt?q=1#top [localized-contact-de] | /de/kontakt?q=1#top [localized-contact-de] | /contact | /de/kontakt |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | null |
| /de/artikel/hello-world | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world | null |
| /de/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /de/blog | null |
| /de/careers | /de/careers?q=1#top [localized-careers] |  | /de/careers?q=1#top [localized-careers] | /de/careers?q=1#top [localized-careers] | /de/careers | null |
| /de/hello-world | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world | null |
| /de/kontakt | /de/kontakt?q=1#top [localized-contact-de] |  | /de/kontakt?q=1#top [localized-contact-de] | /de/kontakt?q=1#top [localized-contact-de] | /de/kontakt | null |
| /de/products | /de/products?q=1#top [localized-products] |  | /de/products?q=1#top [localized-products] | /de/products?q=1#top [localized-products] | /de/products | null |
| /de/produkte/42 | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42-de?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42 | null |
| /de/ueber-uns | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns | null |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /fr | null |
| /fr/a-propos | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /fr/a-propos | null |
| /fr/article/hello-world | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /fr/article/hello-world | null |
| /fr/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /fr/blog | null |
| /fr/contact-fr | /de/kontakt?q=1#top [localized-contact-de] |  | /de/kontakt?q=1#top [localized-contact-de] | /de/kontakt?q=1#top [localized-contact-de] | /fr/contact-fr | null |
| /fr/hello-world | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /fr/hello-world | null |
| /fr/products | /de/products?q=1#top [localized-products] |  | /de/products?q=1#top [localized-products] | /de/products?q=1#top [localized-products] | /fr/products | null |
| /fr/produits/42 | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42-de?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /fr/produits/42 | null |
| /hello-world | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /hello-world | /de/hello-world |
| /legal/imprint | /legal/imprint?q=1#top [legal-imprint] |  | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint | null |
| /products | /de/products?q=1#top [localized-products] |  | /de/products?q=1#top [localized-products] | /de/products?q=1#top [localized-products] | /products | /de/products |
| /products/42 | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42-de?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /products/42 | /de/produkte/42 |
| /en | /de/en?q=1#top [localized-slug] | /de/en?q=1#top [localized-slug] | /de/en?q=1#top [localized-slug] | /de/en?q=1#top [localized-slug] | /en | null |
| /en/ | /de/en/?q=1#top [localized-slug] | /de/en/?q=1#top [localized-slug] | /de/en/?q=1#top [localized-slug] | /de/en/?q=1#top [localized-slug] | /en/ | null |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de/ | null |
| /about/ | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /about/ | /de/ueber-uns |
| /de/about/ | /de/about/?q=1#top [localized-slug] | /de/about/?q=1#top [localized-slug] | /de/about/?q=1#top [localized-slug] | /de/about/?q=1#top [localized-slug] | /de/about/ | null |
| /missing | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /missing | /de/missing |
| /de/missing | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /de/missing | null |
| /xx/about | /de/xx/about?q=1#top [localized-slug] | /de/xx/about?q=1#top [localized-slug] | /de/xx/about?q=1#top [localized-slug] | /de/xx/about?q=1#top [localized-slug] | /xx/about | /de/xx/about |
| /de/de/about | /de/de/about?q=1#top [localized-slug] | /de/de/about?q=1#top [localized-slug] | /de/de/about?q=1#top [localized-slug] | /de/de/about?q=1#top [localized-slug] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | / | /fr |
| /about | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | /about | /fr/a-propos |
| /about-us | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | /about-us | /fr/a-propos |
| /blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /blog | /fr/blog |
| /blog/hello-world | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /blog/hello-world | /fr/article/hello-world |
| /careers | /careers?q=1#top [careers] |  | /careers?q=1#top [careers] | /careers?q=1#top [careers] | /careers | null |
| /contact | /fr/contact-fr?q=1#top [localized-contact-fr] |  | /fr/contact-fr?q=1#top [localized-contact-fr] | /fr/contact-fr?q=1#top [localized-contact-fr] | /contact | /fr/contact-fr |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de | null |
| /de/artikel/hello-world | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /de/artikel/hello-world | null |
| /de/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /de/blog | null |
| /de/careers | /careers?q=1#top [careers] |  | /careers?q=1#top [careers] | /careers?q=1#top [careers] | /de/careers | null |
| /de/hello-world | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /de/hello-world | null |
| /de/kontakt | /fr/contact-fr?q=1#top [localized-contact-fr] |  | /fr/contact-fr?q=1#top [localized-contact-fr] | /fr/contact-fr?q=1#top [localized-contact-fr] | /de/kontakt | null |
| /de/products | /fr/products?q=1#top [localized-products] |  | /fr/products?q=1#top [localized-products] | /fr/products?q=1#top [localized-products] | /de/products | null |
| /de/produkte/42 | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42-fr?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /de/produkte/42 | null |
| /de/ueber-uns | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | /de/ueber-uns | null |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | null |
| /fr/a-propos | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos | null |
| /fr/article/hello-world | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world | null |
| /fr/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /fr/blog | null |
| /fr/contact-fr | /fr/contact-fr?q=1#top [localized-contact-fr] |  | /fr/contact-fr?q=1#top [localized-contact-fr] | /fr/contact-fr?q=1#top [localized-contact-fr] | /fr/contact-fr | null |
| /fr/hello-world | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world | null |
| /fr/products | /fr/products?q=1#top [localized-products] |  | /fr/products?q=1#top [localized-products] | /fr/products?q=1#top [localized-products] | /fr/products | null |
| /fr/produits/42 | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42-fr?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42 | null |
| /hello-world | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /hello-world | /fr/hello-world |
| /legal/imprint | /legal/imprint?q=1#top [legal-imprint] |  | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint | null |
| /products | /fr/products?q=1#top [localized-products] |  | /fr/products?q=1#top [localized-products] | /fr/products?q=1#top [localized-products] | /products | /fr/products |
| /products/42 | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42-fr?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /products/42 | /fr/produits/42 |
| /en | /fr/en?q=1#top [localized-slug] | /fr/en?q=1#top [localized-slug] | /fr/en?q=1#top [localized-slug] | /fr/en?q=1#top [localized-slug] | /en | null |
| /en/ | /fr/en/?q=1#top [localized-slug] | /fr/en/?q=1#top [localized-slug] | /fr/en/?q=1#top [localized-slug] | /fr/en/?q=1#top [localized-slug] | /en/ | null |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de/ | null |
| /about/ | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | /about/ | /fr/a-propos |
| /de/about/ | /fr/about/?q=1#top [localized-slug] | /fr/about/?q=1#top [localized-slug] | /fr/about/?q=1#top [localized-slug] | /fr/about/?q=1#top [localized-slug] | /de/about/ | null |
| /missing | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /missing | /fr/missing |
| /de/missing | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /de/missing | null |
| /xx/about | /fr/xx/about?q=1#top [localized-slug] | /fr/xx/about?q=1#top [localized-slug] | /fr/xx/about?q=1#top [localized-slug] | /fr/xx/about?q=1#top [localized-slug] | /xx/about | /fr/xx/about |
| /de/de/about | /fr/de/about?q=1#top [localized-slug] | /fr/de/about?q=1#top [localized-slug] | /fr/de/about?q=1#top [localized-slug] | /fr/de/about?q=1#top [localized-slug] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /about-us [about] | /de/ueber-uns [localized-about-de] | /fr/a-propos [localized-about-fr] | /about-us [about] | /de/ueber-uns [localized-about-de] | /fr/a-propos [localized-about-fr] | /about-us [about] | /de/ueber-uns [localized-about-de] | /fr/a-propos [localized-about-fr] |
| blog | /blog [blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] | /blog [blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] | /blog [blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] |
| blog-slug | /blog/hello-world [blog-slug] | /de/artikel/hello-world [localized-blog-slug-de] | /fr/article/hello-world [localized-blog-slug-fr] | /blog/hello-world [blog-slug] | /de/artikel/hello-world [localized-blog-slug-de] | /fr/article/hello-world [localized-blog-slug-fr] | /blog/hello-world [blog-slug] | /de/artikel/hello-world [localized-blog-slug-de] | /fr/article/hello-world [localized-blog-slug-fr] |
| careers | /careers [careers] | /de/careers [localized-careers] | /careers [careers] | /careers [careers] | /de/careers [localized-careers] | /careers [careers] | /careers [careers] | /de/careers [localized-careers] | /careers [careers] |
| contact | /contact [contact] | /de/kontakt [localized-contact-de] | /fr/contact-fr [localized-contact-fr] | /contact [contact] | /de/kontakt [localized-contact-de] | /fr/contact-fr [localized-contact-fr] | /contact [contact] | /de/kontakt [localized-contact-de] | /fr/contact-fr [localized-contact-fr] |
| index | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] |
| legal-imprint | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] |
| products | /products [products] | /de/products [localized-products] | /fr/products [localized-products] | /products [products] | /de/products [localized-products] | /fr/products [localized-products] | /products [products] | /de/products [localized-products] | /fr/products [localized-products] |
| products-id | /products/42 [products-id] | /de/produkte/42 [localized-products-id-de] | /fr/produits/42 [localized-products-id-fr] | /products/42 [products-id] | /de/produkte/42 [localized-products-id-de] | /fr/produits/42 [localized-products-id-fr] | /products/42 [products-id] | /de/produkte/42 [localized-products-id-de] | /fr/produits/42 [localized-products-id-fr] |
| slug | /hello-world [slug] | /de/hello-world [localized-slug] | /fr/hello-world [localized-slug] | /hello-world [slug] | /de/hello-world [localized-slug] | /fr/hello-world [localized-slug] | /hello-world [slug] | /de/hello-world [localized-slug] | /fr/hello-world [localized-slug] |

## Invariant breaks (0)

none
