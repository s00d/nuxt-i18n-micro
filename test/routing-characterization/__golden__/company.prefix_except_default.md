# company · prefix_except_default

typical company site: translated slugs, dynamic pages, catch-all, unlocalized legal page, per-page locale restriction, one routeRules redirect

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
| — | /old |  |  |
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
| — | /:locale(de\|fr)/old |  |  |

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
| /de/old | null | de |  | null | Deutsch | de | de | null |
| /de/products | localized-products | de | products | products | Deutsch | de | de | null |
| /de/produkte/42 | localized-products-id-de | de | products-id | products-id | Deutsch | de | de | null |
| /de/ueber-uns | localized-about-de | de | about | about | Deutsch | de | de | null |
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
| /old | null | en | slug | slug | English | null | en | null |
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

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about | /about-us?q=1#top [about] |  | /about-us?q=1#top [about] | /about-us?q=1#top [about] | /about-us | /about-us | en,de,fr |
| /about-us | /about-us?q=1#top [about] |  | /about-us?q=1#top [about] | /about-us?q=1#top [about] | null | null | en,de,fr |
| /blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | null | null | en,de,fr |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de,fr |
| /careers | /careers?q=1#top [careers] |  | /careers?q=1#top [careers] | /careers?q=1#top [careers] | null | null | en,de |
| /contact | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | null | null | en,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /de/artikel/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | /blog/hello-world | en,de,fr |
| /de/blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | null | /blog | en,de,fr |
| /de/careers | /careers?q=1#top [careers] |  | /careers?q=1#top [careers] | /careers?q=1#top [careers] | null | /careers | en,de |
| /de/hello-world | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | null | /hello-world | de,fr,en |
| /de/kontakt | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | null | /contact | en,de,fr |
| /de/old | /old?q=1#top [—] |  | /old?q=1#top [null] | /old?q=1#top [null] | null | /old | null |
| /de/products | /products?q=1#top [products] |  | /products?q=1#top [products] | /products?q=1#top [products] | null | /products | en,de,fr |
| /de/produkte/42 | /products/42?q=1#top [products-id] | /products/42-en?q=1#top [products-id] | /products/42?q=1#top [products-id] | /products/42?q=1#top [products-id] | null | /products/42 | en,de,fr |
| /de/ueber-uns | /about-us?q=1#top [about] |  | /about-us?q=1#top [about] | /about-us?q=1#top [about] | null | /about-us | en,de,fr |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /fr/a-propos | /about-us?q=1#top [about] |  | /about-us?q=1#top [about] | /about-us?q=1#top [about] | null | /about-us | en,de,fr |
| /fr/article/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | /blog/hello-world | en,de,fr |
| /fr/blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | null | /blog | en,de,fr |
| /fr/contact-fr | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | null | /contact | en,de,fr |
| /fr/hello-world | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | null | /hello-world | de,fr,en |
| /fr/old | /old?q=1#top [—] |  | /old?q=1#top [null] | /old?q=1#top [null] | null | /old | null |
| /fr/products | /products?q=1#top [products] |  | /products?q=1#top [products] | /products?q=1#top [products] | null | /products | en,de,fr |
| /fr/produits/42 | /products/42?q=1#top [products-id] | /products/42-en?q=1#top [products-id] | /products/42?q=1#top [products-id] | /products/42?q=1#top [products-id] | null | /products/42 | en,de,fr |
| /hello-world | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | null | null | de,fr,en |
| /legal/imprint | /legal/imprint?q=1#top [legal-imprint] |  | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint?q=1#top [legal-imprint] | null | null | null |
| /old | /en/old?q=1#top [slug] |  | /en/old?q=1#top [slug] | /en/old?q=1#top [slug] | /en/old | /en/old | de,fr,en |
| /products | /products?q=1#top [products] |  | /products?q=1#top [products] | /products?q=1#top [products] | null | null | en,de,fr |
| /products/42 | /products/42?q=1#top [products-id] | /products/42-en?q=1#top [products-id] | /products/42?q=1#top [products-id] | /products/42?q=1#top [products-id] | null | null | en,de,fr |
| /en | /en?q=1#top [slug] | /en?q=1#top [slug] | /en?q=1#top [slug] | /?q=1#top [index] | null | null | de,fr,en |
| /en/ | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /?q=1#top [index] | null | null | de,fr,en |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /about/ | /about-us?q=1#top [about] |  | /about-us?q=1#top [about] | /about-us?q=1#top [about] | /about-us | /about-us | en,de,fr |
| /de/about/ | /about/?q=1#top [slug] | /about/?q=1#top [slug] | /about/?q=1#top [slug] | /about-us?q=1#top [about] | null | /about-us | de,fr,en |
| /missing | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | null | null | de,fr,en |
| /de/missing | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | null | /missing | de,fr,en |
| /xx/about | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | null | null | de,fr,en |
| /de/de/about | /de/about?q=1#top [slug] | /de/about?q=1#top [slug] | /de/about?q=1#top [slug] | /de/about?q=1#top [slug] | null | /de/about | de,fr,en |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | /de | en,de,fr |
| /about | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns | /de/ueber-uns | en,de,fr |
| /about-us | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns | /de/ueber-uns | en,de,fr |
| /blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | /de/blog | /de/blog | en,de,fr |
| /blog/hello-world | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world | /de/artikel/hello-world | en,de,fr |
| /careers | /de/careers?q=1#top [localized-careers] |  | /de/careers?q=1#top [localized-careers] | /de/careers?q=1#top [localized-careers] | /de/careers | /de/careers | en,de |
| /contact | /de/kontakt?q=1#top [localized-contact-de] |  | /de/kontakt?q=1#top [localized-contact-de] | /de/kontakt?q=1#top [localized-contact-de] | /de/kontakt | /de/kontakt | en,de,fr |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /de/artikel/hello-world | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | null | null | en,de,fr |
| /de/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | null | null | en,de,fr |
| /de/careers | /de/careers?q=1#top [localized-careers] |  | /de/careers?q=1#top [localized-careers] | /de/careers?q=1#top [localized-careers] | null | null | en,de |
| /de/hello-world | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | null | null | de,fr,en |
| /de/kontakt | /de/kontakt?q=1#top [localized-contact-de] |  | /de/kontakt?q=1#top [localized-contact-de] | /de/kontakt?q=1#top [localized-contact-de] | null | null | en,de,fr |
| /de/old | /de/old?q=1#top [—] |  | /de/old?q=1#top [null] | /de/old?q=1#top [null] | null | null | null |
| /de/products | /de/products?q=1#top [localized-products] |  | /de/products?q=1#top [localized-products] | /de/products?q=1#top [localized-products] | null | null | en,de,fr |
| /de/produkte/42 | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42-de?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | null | null | en,de,fr |
| /de/ueber-uns | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | null | en,de,fr |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /fr/a-propos | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | /de/ueber-uns | en,de,fr |
| /fr/article/hello-world | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | /de/artikel/hello-world?q=1#top [localized-blog-slug-de] | null | /de/artikel/hello-world | en,de,fr |
| /fr/blog | /de/blog?q=1#top [localized-blog] |  | /de/blog?q=1#top [localized-blog] | /de/blog?q=1#top [localized-blog] | null | /de/blog | en,de,fr |
| /fr/contact-fr | /de/kontakt?q=1#top [localized-contact-de] |  | /de/kontakt?q=1#top [localized-contact-de] | /de/kontakt?q=1#top [localized-contact-de] | null | /de/kontakt | en,de,fr |
| /fr/hello-world | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | null | /de/hello-world | de,fr,en |
| /fr/old | /de/old?q=1#top [—] |  | /de/old?q=1#top [null] | /de/old?q=1#top [null] | null | /de/old | null |
| /fr/products | /de/products?q=1#top [localized-products] |  | /de/products?q=1#top [localized-products] | /de/products?q=1#top [localized-products] | null | /de/products | en,de,fr |
| /fr/produits/42 | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42-de?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | null | /de/produkte/42 | en,de,fr |
| /hello-world | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world?q=1#top [localized-slug] | /de/hello-world | /de/hello-world | de,fr,en |
| /legal/imprint | /legal/imprint?q=1#top [legal-imprint] |  | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint?q=1#top [legal-imprint] | null | null | null |
| /old | /de/en/old?q=1#top [localized-slug] |  | /de/en/old?q=1#top [localized-slug] | /de/en/old?q=1#top [localized-slug] | /de/en/old | /de/en/old | de,fr,en |
| /products | /de/products?q=1#top [localized-products] |  | /de/products?q=1#top [localized-products] | /de/products?q=1#top [localized-products] | /de/products | /de/products | en,de,fr |
| /products/42 | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42-de?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42?q=1#top [localized-products-id-de] | /de/produkte/42 | /de/produkte/42 | en,de,fr |
| /en | /de/en?q=1#top [localized-slug] | /de/en?q=1#top [localized-slug] | /de/en?q=1#top [localized-slug] | /de?q=1#top [localized-index] | null | /de | de,fr,en |
| /en/ | /de/en/?q=1#top [localized-slug] | /de/en/?q=1#top [localized-slug] | /de/en/?q=1#top [localized-slug] | /de?q=1#top [localized-index] | null | /de | de,fr,en |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /about/ | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns | /de/ueber-uns | en,de,fr |
| /de/about/ | /de/about/?q=1#top [localized-slug] | /de/about/?q=1#top [localized-slug] | /de/about/?q=1#top [localized-slug] | /de/ueber-uns?q=1#top [localized-about-de] | null | null | de,fr,en |
| /missing | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /de/missing | /de/missing | de,fr,en |
| /de/missing | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | /de/missing?q=1#top [localized-slug] | null | null | de,fr,en |
| /xx/about | /de/xx/about?q=1#top [localized-slug] | /de/xx/about?q=1#top [localized-slug] | /de/xx/about?q=1#top [localized-slug] | /de/xx/about?q=1#top [localized-slug] | /de/xx/about | /de/xx/about | de,fr,en |
| /de/de/about | /de/de/about?q=1#top [localized-slug] | /de/de/about?q=1#top [localized-slug] | /de/de/about?q=1#top [localized-slug] | /de/de/about?q=1#top [localized-slug] | null | null | de,fr,en |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | /fr | en,de,fr |
| /about | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos | /fr/a-propos | en,de,fr |
| /about-us | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos | /fr/a-propos | en,de,fr |
| /blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | /fr/blog | /fr/blog | en,de,fr |
| /blog/hello-world | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world | /fr/article/hello-world | en,de,fr |
| /careers | /fr [localized-index] |  | /fr [localized-index] | /fr [localized-index] | null | null | en,de |
| /contact | /fr/contact-fr?q=1#top [localized-contact-fr] |  | /fr/contact-fr?q=1#top [localized-contact-fr] | /fr/contact-fr?q=1#top [localized-contact-fr] | /fr/contact-fr | /fr/contact-fr | en,de,fr |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/artikel/hello-world | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | null | /fr/article/hello-world | en,de,fr |
| /de/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | null | /fr/blog | en,de,fr |
| /de/careers | /fr [localized-index] |  | /fr [localized-index] | /fr [localized-index] | null | null | en,de |
| /de/hello-world | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | null | /fr/hello-world | de,fr,en |
| /de/kontakt | /fr/contact-fr?q=1#top [localized-contact-fr] |  | /fr/contact-fr?q=1#top [localized-contact-fr] | /fr/contact-fr?q=1#top [localized-contact-fr] | null | /fr/contact-fr | en,de,fr |
| /de/old | /fr/old?q=1#top [—] |  | /fr/old?q=1#top [null] | /fr/old?q=1#top [null] | null | /fr/old | null |
| /de/products | /fr/products?q=1#top [localized-products] |  | /fr/products?q=1#top [localized-products] | /fr/products?q=1#top [localized-products] | null | /fr/products | en,de,fr |
| /de/produkte/42 | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42-fr?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | null | /fr/produits/42 | en,de,fr |
| /de/ueber-uns | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | /fr/a-propos | en,de,fr |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,fr |
| /fr/a-propos | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | null | null | en,de,fr |
| /fr/article/hello-world | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | /fr/article/hello-world?q=1#top [localized-blog-slug-fr] | null | null | en,de,fr |
| /fr/blog | /fr/blog?q=1#top [localized-blog] |  | /fr/blog?q=1#top [localized-blog] | /fr/blog?q=1#top [localized-blog] | null | null | en,de,fr |
| /fr/contact-fr | /fr/contact-fr?q=1#top [localized-contact-fr] |  | /fr/contact-fr?q=1#top [localized-contact-fr] | /fr/contact-fr?q=1#top [localized-contact-fr] | null | null | en,de,fr |
| /fr/hello-world | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | null | null | de,fr,en |
| /fr/old | /fr/old?q=1#top [—] |  | /fr/old?q=1#top [null] | /fr/old?q=1#top [null] | null | null | null |
| /fr/products | /fr/products?q=1#top [localized-products] |  | /fr/products?q=1#top [localized-products] | /fr/products?q=1#top [localized-products] | null | null | en,de,fr |
| /fr/produits/42 | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42-fr?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | null | null | en,de,fr |
| /hello-world | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world?q=1#top [localized-slug] | /fr/hello-world | /fr/hello-world | de,fr,en |
| /legal/imprint | /legal/imprint?q=1#top [legal-imprint] |  | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint?q=1#top [legal-imprint] | null | null | null |
| /old | /fr/en/old?q=1#top [localized-slug] |  | /fr/en/old?q=1#top [localized-slug] | /fr/en/old?q=1#top [localized-slug] | /fr/en/old | /fr/en/old | de,fr,en |
| /products | /fr/products?q=1#top [localized-products] |  | /fr/products?q=1#top [localized-products] | /fr/products?q=1#top [localized-products] | /fr/products | /fr/products | en,de,fr |
| /products/42 | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42-fr?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42?q=1#top [localized-products-id-fr] | /fr/produits/42 | /fr/produits/42 | en,de,fr |
| /en | /fr/en?q=1#top [localized-slug] | /fr/en?q=1#top [localized-slug] | /fr/en?q=1#top [localized-slug] | /fr?q=1#top [localized-index] | null | /fr | de,fr,en |
| /en/ | /fr/en/?q=1#top [localized-slug] | /fr/en/?q=1#top [localized-slug] | /fr/en/?q=1#top [localized-slug] | /fr?q=1#top [localized-index] | null | /fr | de,fr,en |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /about/ | /fr/a-propos?q=1#top [localized-about-fr] |  | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos?q=1#top [localized-about-fr] | /fr/a-propos | /fr/a-propos | en,de,fr |
| /de/about/ | /fr/about/?q=1#top [localized-slug] | /fr/about/?q=1#top [localized-slug] | /fr/about/?q=1#top [localized-slug] | /fr/a-propos?q=1#top [localized-about-fr] | null | /fr/a-propos | de,fr,en |
| /missing | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /fr/missing | /fr/missing | de,fr,en |
| /de/missing | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | /fr/missing?q=1#top [localized-slug] | null | /fr/missing | de,fr,en |
| /xx/about | /fr/xx/about?q=1#top [localized-slug] | /fr/xx/about?q=1#top [localized-slug] | /fr/xx/about?q=1#top [localized-slug] | /fr/xx/about?q=1#top [localized-slug] | /fr/xx/about | /fr/xx/about | de,fr,en |
| /de/de/about | /fr/de/about?q=1#top [localized-slug] | /fr/de/about?q=1#top [localized-slug] | /fr/de/about?q=1#top [localized-slug] | /fr/de/about?q=1#top [localized-slug] | null | /fr/de/about | de,fr,en |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /about-us [about] | /de/ueber-uns [localized-about-de] | /fr/a-propos [localized-about-fr] | /about-us [about] | /de/ueber-uns [localized-about-de] | /fr/a-propos [localized-about-fr] | /about-us [about] | /de/ueber-uns [localized-about-de] | /fr/a-propos [localized-about-fr] |
| blog | /blog [blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] | /blog [blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] | /blog [blog] | /de/blog [localized-blog] | /fr/blog [localized-blog] |
| blog-slug | /blog/hello-world [blog-slug] | /de/artikel/hello-world [localized-blog-slug-de] | /fr/article/hello-world [localized-blog-slug-fr] | /blog/hello-world [blog-slug] | /de/artikel/hello-world [localized-blog-slug-de] | /fr/article/hello-world [localized-blog-slug-fr] | /blog/hello-world [blog-slug] | /de/artikel/hello-world [localized-blog-slug-de] | /fr/article/hello-world [localized-blog-slug-fr] |
| careers | /careers [careers] | /de/careers [localized-careers] | /fr [localized-index] | /careers [careers] | /de/careers [localized-careers] | /fr [localized-index] | /careers [careers] | /de/careers [localized-careers] | /fr [localized-index] |
| contact | /contact [contact] | /de/kontakt [localized-contact-de] | /fr/contact-fr [localized-contact-fr] | /contact [contact] | /de/kontakt [localized-contact-de] | /fr/contact-fr [localized-contact-fr] | /contact [contact] | /de/kontakt [localized-contact-de] | /fr/contact-fr [localized-contact-fr] |
| index | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] |
| legal-imprint | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] |
| products | /products [products] | /de/products [localized-products] | /fr/products [localized-products] | /products [products] | /de/products [localized-products] | /fr/products [localized-products] | /products [products] | /de/products [localized-products] | /fr/products [localized-products] |
| products-id | /products/42 [products-id] | /de/produkte/42 [localized-products-id-de] | /fr/produits/42 [localized-products-id-fr] | /products/42 [products-id] | /de/produkte/42 [localized-products-id-de] | /fr/produits/42 [localized-products-id-fr] | /products/42 [products-id] | /de/produkte/42 [localized-products-id-de] | /fr/produits/42 [localized-products-id-fr] |
| slug | /hello-world [slug] | /de/hello-world [localized-slug] | /fr/hello-world [localized-slug] | /hello-world [slug] | /de/hello-world [localized-slug] | /fr/hello-world [localized-slug] | /hello-world [slug] | /de/hello-world [localized-slug] | /fr/hello-world [localized-slug] |

## Invariant breaks (4)

- /careers → fr → en: round trip ends on /, not /careers?q=1#top
- /de/careers → fr → de: round trip ends on /de, not /de/careers?q=1#top
- /de/old → en → de: round trip ends on /de/en/old?q=1#top, not /de/old?q=1#top
- /fr/old → en → fr: round trip ends on /fr/en/old?q=1#top, not /fr/old?q=1#top
