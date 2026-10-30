# company · no_prefix

typical company site: translated slugs, dynamic pages, catch-all, unlocalized legal page, per-page locale restriction, one stub record of a routeRules redirect

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect | meta.i18n |
|---|---|---|---|---|
| index | / |  |  | index: en, de, fr |
| about | /about |  |  | about:  |
| contact | /contact |  |  | contact: en |
| blog | /blog |  |  | blog: en, de, fr |
| blog-slug | /blog/:slug() |  |  | blog-slug: en |
| products | /products |  |  | products: en, de, fr |
| products-id | /products/:id() |  |  | products-id:  |
| legal-imprint | /legal/imprint |  |  |  |
| careers | /careers |  |  | careers: en, de |
| slug | /:slug(.*)* |  |  | slug: en, de, fr |
| — | /old |  |  |  |
| localized-about-en | /about-us |  |  | about: en |
| localized-about-de | /ueber-uns |  |  | about: de |
| localized-about-fr | /a-propos |  |  | about: fr |
| localized-contact-de | /kontakt |  |  | contact: de |
| localized-contact-fr | /contact-fr |  |  | contact: fr |
| localized-blog-slug-de | /artikel/:slug |  |  | blog-slug: de |
| localized-blog-slug-fr | /article/:slug |  |  | blog-slug: fr |
| localized-products-id-en | /products/:id |  |  | products-id: en |
| localized-products-id-de | /produkte/:id |  |  | products-id: de |
| localized-products-id-fr | /produits/:id |  |  | products-id: fr |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | null | null |
| /a-propos | localized-about-fr | fr | about | about | Français | null | null | null |
| /about | about | en | about | about | English | null | null | null |
| /about-us | localized-about-en | en | about | about | English | null | null | null |
| /article/hello-world | localized-blog-slug-fr | fr | blog-slug | blog-slug | Français | null | null | null |
| /artikel/hello-world | localized-blog-slug-de | de | blog-slug | blog-slug | Deutsch | null | null | null |
| /blog | blog | en | blog | blog | English | null | null | null |
| /blog/hello-world | blog-slug | en | blog-slug | blog-slug | English | null | null | null |
| /careers | careers | en | careers | careers | English | null | null | null |
| /contact | contact | en | contact | contact | English | null | null | null |
| /contact-fr | localized-contact-fr | fr | contact | contact | Français | null | null | null |
| /hello-world | slug | en | slug | slug | English | null | null | null |
| /kontakt | localized-contact-de | de | contact | contact | Deutsch | null | null | null |
| /legal/imprint | legal-imprint | en | legal-imprint | legal-imprint | English | null | null | null |
| /old | null | en |  | null | English | null | null | null |
| /products | products | en | products | products | English | null | null | null |
| /products/42 | products-id | en | products-id | products-id | English | null | null | null |
| /produits/42 | localized-products-id-fr | fr | products-id | products-id | Français | null | null | null |
| /produkte/42 | localized-products-id-de | de | products-id | products-id | Deutsch | null | null | null |
| /ueber-uns | localized-about-de | de | about | about | Deutsch | null | null | null |
| /en | slug | en | slug | slug | English | en | null | null |
| /en/ | slug | en | slug | slug | English | en | null | null |
| /de | slug | en | slug | slug | English | de | null | null |
| /de/ | slug | en | slug | slug | English | de | null | null |
| /about/ | about | en | about | about | English | null | null | null |
| /de/about/ | slug | en | slug | slug | English | de | null | null |
| /missing | slug | en | slug | slug | English | null | null | null |
| /de/missing | slug | en | slug | slug | English | de | null | null |
| /xx/about | slug | en | slug | slug | English | null | null | null |
| /de/de/about | slug | en | slug | slug | English | de | null | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /a-propos | /about-us?q=1#top [localized-about-en] |  | /about-us?q=1#top [localized-about-en] | /about-us?q=1#top [localized-about-en] | null | null | en,de,fr |
| /about | /about-us?q=1#top [localized-about-en] |  | /about-us?q=1#top [localized-about-en] | /about-us?q=1#top [localized-about-en] | null | null | en,de,fr |
| /about-us | /about-us?q=1#top [localized-about-en] |  | /about-us?q=1#top [localized-about-en] | /about-us?q=1#top [localized-about-en] | null | null | en,de,fr |
| /article/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de,fr |
| /artikel/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de,fr |
| /blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | null | null | en,de,fr |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | null | null | en,de,fr |
| /careers | /careers?q=1#top [careers] |  | /careers?q=1#top [careers] | /careers?q=1#top [careers] | null | null | en,de |
| /contact | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | null | null | en,de,fr |
| /contact-fr | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | null | null | en,de,fr |
| /hello-world | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | null | null | en,de,fr |
| /kontakt | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | null | null | en,de,fr |
| /legal/imprint | /legal/imprint?q=1#top [legal-imprint] |  | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint?q=1#top [legal-imprint] | null | null | null |
| /old | /old?q=1#top [—] |  | /old?q=1#top [null] | /old?q=1#top [null] | null | null | null |
| /products | /products?q=1#top [products] |  | /products?q=1#top [products] | /products?q=1#top [products] | null | null | en,de,fr |
| /products/42 | /products/42?q=1#top [localized-products-id-en] | /products/42-en?q=1#top [localized-products-id-en] | /products/42?q=1#top [localized-products-id-en] | /products/42?q=1#top [localized-products-id-en] | null | null | en,de,fr |
| /produits/42 | /products/42?q=1#top [localized-products-id-en] | /products/42-en?q=1#top [localized-products-id-en] | /products/42?q=1#top [localized-products-id-en] | /products/42?q=1#top [localized-products-id-en] | null | null | en,de,fr |
| /produkte/42 | /products/42?q=1#top [localized-products-id-en] | /products/42-en?q=1#top [localized-products-id-en] | /products/42?q=1#top [localized-products-id-en] | /products/42?q=1#top [localized-products-id-en] | null | null | en,de,fr |
| /ueber-uns | /about-us?q=1#top [localized-about-en] |  | /about-us?q=1#top [localized-about-en] | /about-us?q=1#top [localized-about-en] | null | null | en,de,fr |
| /en | /en?q=1#top [slug] | /en?q=1#top [slug] | /en?q=1#top [slug] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /?q=1#top [index] | null | null | en,de,fr |
| /de | /de?q=1#top [slug] | /de?q=1#top [slug] | /de?q=1#top [slug] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /de/?q=1#top [slug] | /de/?q=1#top [slug] | /de/?q=1#top [slug] | /?q=1#top [index] | null | null | en,de,fr |
| /about/ | /about-us?q=1#top [localized-about-en] |  | /about-us?q=1#top [localized-about-en] | /about-us?q=1#top [localized-about-en] | null | null | en,de,fr |
| /de/about/ | /de/about/?q=1#top [slug] | /de/about/?q=1#top [slug] | /de/about/?q=1#top [slug] | /about-us?q=1#top [localized-about-en] | null | null | en,de,fr |
| /missing | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | null | null | en,de,fr |
| /de/missing | /de/missing?q=1#top [slug] | /de/missing?q=1#top [slug] | /de/missing?q=1#top [slug] | /de/missing?q=1#top [slug] | null | null | en,de,fr |
| /xx/about | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | null | null | en,de,fr |
| /de/de/about | /de/de/about?q=1#top [slug] | /de/de/about?q=1#top [slug] | /de/de/about?q=1#top [slug] | /de/de/about?q=1#top [slug] | null | null | en,de,fr |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /a-propos | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | null | null | en,de,fr |
| /about | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | null | null | en,de,fr |
| /about-us | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | null | null | en,de,fr |
| /article/hello-world | /artikel/hello-world?q=1#top [localized-blog-slug-de] | /artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /artikel/hello-world?q=1#top [localized-blog-slug-de] | /artikel/hello-world?q=1#top [localized-blog-slug-de] | null | null | en,de,fr |
| /artikel/hello-world | /artikel/hello-world?q=1#top [localized-blog-slug-de] | /artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /artikel/hello-world?q=1#top [localized-blog-slug-de] | /artikel/hello-world?q=1#top [localized-blog-slug-de] | null | null | en,de,fr |
| /blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | null | null | en,de,fr |
| /blog/hello-world | /artikel/hello-world?q=1#top [localized-blog-slug-de] | /artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /artikel/hello-world?q=1#top [localized-blog-slug-de] | /artikel/hello-world?q=1#top [localized-blog-slug-de] | null | null | en,de,fr |
| /careers | /careers?q=1#top [careers] |  | /careers?q=1#top [careers] | /careers?q=1#top [careers] | null | null | en,de |
| /contact | /kontakt?q=1#top [localized-contact-de] |  | /kontakt?q=1#top [localized-contact-de] | /kontakt?q=1#top [localized-contact-de] | null | null | en,de,fr |
| /contact-fr | /kontakt?q=1#top [localized-contact-de] |  | /kontakt?q=1#top [localized-contact-de] | /kontakt?q=1#top [localized-contact-de] | null | null | en,de,fr |
| /hello-world | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | null | null | en,de,fr |
| /kontakt | /kontakt?q=1#top [localized-contact-de] |  | /kontakt?q=1#top [localized-contact-de] | /kontakt?q=1#top [localized-contact-de] | null | null | en,de,fr |
| /legal/imprint | /legal/imprint?q=1#top [legal-imprint] |  | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint?q=1#top [legal-imprint] | null | null | null |
| /old | /old?q=1#top [—] |  | /old?q=1#top [null] | /old?q=1#top [null] | null | null | null |
| /products | /products?q=1#top [products] |  | /products?q=1#top [products] | /products?q=1#top [products] | null | null | en,de,fr |
| /products/42 | /produkte/42?q=1#top [localized-products-id-de] | /produkte/42-de?q=1#top [localized-products-id-de] | /produkte/42?q=1#top [localized-products-id-de] | /produkte/42?q=1#top [localized-products-id-de] | null | null | en,de,fr |
| /produits/42 | /produkte/42?q=1#top [localized-products-id-de] | /produkte/42-de?q=1#top [localized-products-id-de] | /produkte/42?q=1#top [localized-products-id-de] | /produkte/42?q=1#top [localized-products-id-de] | null | null | en,de,fr |
| /produkte/42 | /produkte/42?q=1#top [localized-products-id-de] | /produkte/42-de?q=1#top [localized-products-id-de] | /produkte/42?q=1#top [localized-products-id-de] | /produkte/42?q=1#top [localized-products-id-de] | null | null | en,de,fr |
| /ueber-uns | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | null | null | en,de,fr |
| /en | /en?q=1#top [slug] | /en?q=1#top [slug] | /en?q=1#top [slug] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /?q=1#top [index] | null | null | en,de,fr |
| /de | /de?q=1#top [slug] | /de?q=1#top [slug] | /de?q=1#top [slug] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /de/?q=1#top [slug] | /de/?q=1#top [slug] | /de/?q=1#top [slug] | /?q=1#top [index] | null | null | en,de,fr |
| /about/ | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | null | null | en,de,fr |
| /de/about/ | /de/about/?q=1#top [slug] | /de/about/?q=1#top [slug] | /de/about/?q=1#top [slug] | /ueber-uns?q=1#top [localized-about-de] | null | null | en,de,fr |
| /missing | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | null | null | en,de,fr |
| /de/missing | /de/missing?q=1#top [slug] | /de/missing?q=1#top [slug] | /de/missing?q=1#top [slug] | /de/missing?q=1#top [slug] | null | null | en,de,fr |
| /xx/about | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | null | null | en,de,fr |
| /de/de/about | /de/de/about?q=1#top [slug] | /de/de/about?q=1#top [slug] | /de/de/about?q=1#top [slug] | /de/de/about?q=1#top [slug] | null | null | en,de,fr |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /a-propos | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | null | null | en,de,fr |
| /about | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | null | null | en,de,fr |
| /about-us | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | null | null | en,de,fr |
| /article/hello-world | /article/hello-world?q=1#top [localized-blog-slug-fr] | /article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /article/hello-world?q=1#top [localized-blog-slug-fr] | /article/hello-world?q=1#top [localized-blog-slug-fr] | null | null | en,de,fr |
| /artikel/hello-world | /article/hello-world?q=1#top [localized-blog-slug-fr] | /article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /article/hello-world?q=1#top [localized-blog-slug-fr] | /article/hello-world?q=1#top [localized-blog-slug-fr] | null | null | en,de,fr |
| /blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | null | null | en,de,fr |
| /blog/hello-world | /article/hello-world?q=1#top [localized-blog-slug-fr] | /article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /article/hello-world?q=1#top [localized-blog-slug-fr] | /article/hello-world?q=1#top [localized-blog-slug-fr] | null | null | en,de,fr |
| /careers | / [index] |  | / [index] | / [index] | null | null | en,de |
| /contact | /contact-fr?q=1#top [localized-contact-fr] |  | /contact-fr?q=1#top [localized-contact-fr] | /contact-fr?q=1#top [localized-contact-fr] | null | null | en,de,fr |
| /contact-fr | /contact-fr?q=1#top [localized-contact-fr] |  | /contact-fr?q=1#top [localized-contact-fr] | /contact-fr?q=1#top [localized-contact-fr] | null | null | en,de,fr |
| /hello-world | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | null | null | en,de,fr |
| /kontakt | /contact-fr?q=1#top [localized-contact-fr] |  | /contact-fr?q=1#top [localized-contact-fr] | /contact-fr?q=1#top [localized-contact-fr] | null | null | en,de,fr |
| /legal/imprint | /legal/imprint?q=1#top [legal-imprint] |  | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint?q=1#top [legal-imprint] | null | null | null |
| /old | /old?q=1#top [—] |  | /old?q=1#top [null] | /old?q=1#top [null] | null | null | null |
| /products | /products?q=1#top [products] |  | /products?q=1#top [products] | /products?q=1#top [products] | null | null | en,de,fr |
| /products/42 | /produits/42?q=1#top [localized-products-id-fr] | /produits/42-fr?q=1#top [localized-products-id-fr] | /produits/42?q=1#top [localized-products-id-fr] | /produits/42?q=1#top [localized-products-id-fr] | null | null | en,de,fr |
| /produits/42 | /produits/42?q=1#top [localized-products-id-fr] | /produits/42-fr?q=1#top [localized-products-id-fr] | /produits/42?q=1#top [localized-products-id-fr] | /produits/42?q=1#top [localized-products-id-fr] | null | null | en,de,fr |
| /produkte/42 | /produits/42?q=1#top [localized-products-id-fr] | /produits/42-fr?q=1#top [localized-products-id-fr] | /produits/42?q=1#top [localized-products-id-fr] | /produits/42?q=1#top [localized-products-id-fr] | null | null | en,de,fr |
| /ueber-uns | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | null | null | en,de,fr |
| /en | /en?q=1#top [slug] | /en?q=1#top [slug] | /en?q=1#top [slug] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /?q=1#top [index] | null | null | en,de,fr |
| /de | /de?q=1#top [slug] | /de?q=1#top [slug] | /de?q=1#top [slug] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /de/?q=1#top [slug] | /de/?q=1#top [slug] | /de/?q=1#top [slug] | /?q=1#top [index] | null | null | en,de,fr |
| /about/ | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | null | null | en,de,fr |
| /de/about/ | /de/about/?q=1#top [slug] | /de/about/?q=1#top [slug] | /de/about/?q=1#top [slug] | /a-propos?q=1#top [localized-about-fr] | null | null | en,de,fr |
| /missing | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | null | null | en,de,fr |
| /de/missing | /de/missing?q=1#top [slug] | /de/missing?q=1#top [slug] | /de/missing?q=1#top [slug] | /de/missing?q=1#top [slug] | null | null | en,de,fr |
| /xx/about | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | null | null | en,de,fr |
| /de/de/about | /de/de/about?q=1#top [slug] | /de/de/about?q=1#top [slug] | /de/de/about?q=1#top [slug] | /de/de/about?q=1#top [slug] | null | null | en,de,fr |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / |
|---|---|---|---|
| about | /about-us [localized-about-en] | /ueber-uns [localized-about-de] | /a-propos [localized-about-fr] |
| blog | /blog [blog] | /blog [blog] | /blog [blog] |
| blog-slug | /blog/hello-world [blog-slug] | /artikel/hello-world [localized-blog-slug-de] | /article/hello-world [localized-blog-slug-fr] |
| careers | /careers [careers] | /careers [careers] | / [index] |
| contact | /contact [contact] | /kontakt [localized-contact-de] | /contact-fr [localized-contact-fr] |
| index | / [index] | / [index] | / [index] |
| legal-imprint | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] |
| products | /products [products] | /products [products] | /products [products] |
| products-id | /products/42 [localized-products-id-en] | /produkte/42 [localized-products-id-de] | /produits/42 [localized-products-id-fr] |
| slug | /hello-world [slug] | /hello-world [slug] | /hello-world [slug] |

## Invariant breaks (0)

none
