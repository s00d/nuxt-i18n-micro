# company · no_prefix

typical company site: translated slugs, dynamic pages, catch-all, unlocalized legal page, per-page locale restriction

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| about | /about |  |  |
| contact | /contact |  |  |
| blog | /blog |  |  |
| blog-slug | /blog/:slug() |  |  |
| products | /products |  |  |
| products-id | /products/:id() |  |  |
| legal-imprint | /legal/imprint |  |  |
| careers | /careers |  |  |
| slug | /:slug(.*)* |  |  |
| localized-about-en | /about-us |  |  |
| localized-about-de | /ueber-uns |  |  |
| localized-about-fr | /a-propos |  |  |
| localized-contact-de | /kontakt |  |  |
| localized-contact-fr | /contact-fr |  |  |
| localized-blog-slug-de | /artikel/:slug |  |  |
| localized-blog-slug-fr | /article/:slug |  |  |
| localized-products-id-en | /products/:id |  |  |
| localized-products-id-de | /produkte/:id |  |  |
| localized-products-id-fr | /produits/:id |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | null | null |
| /a-propos | localized-about-fr | en | about | about | English | null | null | null |
| /about | about | en | about | about | English | null | null | null |
| /about-us | localized-about-en | en | about | about | English | null | null | null |
| /article/hello-world | localized-blog-slug-fr | en | blog-slug | blog-slug | English | null | null | null |
| /artikel/hello-world | localized-blog-slug-de | en | blog-slug | blog-slug | English | null | null | null |
| /blog | blog | en | blog | blog | English | null | null | null |
| /blog/hello-world | blog-slug | en | blog-slug | blog-slug | English | null | null | null |
| /careers | careers | en | careers | careers | English | null | null | null |
| /contact | contact | en | contact | contact | English | null | null | null |
| /contact-fr | localized-contact-fr | en | contact | contact | English | null | null | null |
| /hello-world | slug | en | slug | slug | English | null | null | null |
| /kontakt | localized-contact-de | en | contact | contact | English | null | null | null |
| /legal/imprint | legal-imprint | en | legal-imprint | legal-imprint | English | null | null | null |
| /products | products | en | products | products | English | null | null | null |
| /products/42 | products-id | en | products-id | products-id | English | null | null | null |
| /produits/42 | localized-products-id-fr | en | products-id | products-id | English | null | null | null |
| /produkte/42 | localized-products-id-de | en | products-id | products-id | English | null | null | null |
| /ueber-uns | localized-about-de | en | about | about | English | null | null | null |
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

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /a-propos | /about-us?q=1#top [localized-about-en] |  | /about-us?q=1#top [localized-about-en] | /about-us?q=1#top [localized-about-en] | /a-propos | null |
| /about | /about-us?q=1#top [localized-about-en] |  | /about-us?q=1#top [localized-about-en] | /about-us?q=1#top [localized-about-en] | /about | null |
| /about-us | /about-us?q=1#top [localized-about-en] |  | /about-us?q=1#top [localized-about-en] | /about-us?q=1#top [localized-about-en] | /about-us | null |
| /article/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /article/hello-world | null |
| /artikel/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /artikel/hello-world | null |
| /blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | /blog | null |
| /blog/hello-world | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world-en?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world?q=1#top [blog-slug] | /blog/hello-world | null |
| /careers | /careers?q=1#top [careers] |  | /careers?q=1#top [careers] | /careers?q=1#top [careers] | /careers | null |
| /contact | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | /contact | null |
| /contact-fr | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | /contact-fr | null |
| /hello-world | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world | null |
| /kontakt | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | /kontakt | null |
| /legal/imprint | /legal/imprint?q=1#top [legal-imprint] |  | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint | null |
| /products | /products?q=1#top [products] |  | /products?q=1#top [products] | /products?q=1#top [products] | /products | null |
| /products/42 | /products/42?q=1#top [localized-products-id-en] | /products/42-en?q=1#top [localized-products-id-en] | /products/42?q=1#top [localized-products-id-en] | /products/42?q=1#top [localized-products-id-en] | /products/42 | null |
| /produits/42 | /products/42?q=1#top [localized-products-id-en] | /products/42-en?q=1#top [localized-products-id-en] | /products/42?q=1#top [localized-products-id-en] | /products/42?q=1#top [localized-products-id-en] | /produits/42 | null |
| /produkte/42 | /products/42?q=1#top [localized-products-id-en] | /products/42-en?q=1#top [localized-products-id-en] | /products/42?q=1#top [localized-products-id-en] | /products/42?q=1#top [localized-products-id-en] | /produkte/42 | null |
| /ueber-uns | /about-us?q=1#top [localized-about-en] |  | /about-us?q=1#top [localized-about-en] | /about-us?q=1#top [localized-about-en] | /ueber-uns | null |
| /en | /en?q=1#top [slug] | /en?q=1#top [slug] | /en?q=1#top [slug] | /en?q=1#top [slug] | /en | null |
| /en/ | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /en/ | null |
| /de | /de?q=1#top [slug] | /de?q=1#top [slug] | /de?q=1#top [slug] | /de?q=1#top [slug] | /de | null |
| /de/ | /de/?q=1#top [slug] | /de/?q=1#top [slug] | /de/?q=1#top [slug] | /de/?q=1#top [slug] | /de/ | null |
| /about/ | /about-us?q=1#top [localized-about-en] |  | /about-us?q=1#top [localized-about-en] | /about-us?q=1#top [localized-about-en] | /about/ | null |
| /de/about/ | /de/about/?q=1#top [slug] | /de/about/?q=1#top [slug] | /de/about/?q=1#top [slug] | /de/about/?q=1#top [slug] | /de/about/ | null |
| /missing | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing | null |
| /de/missing | /de/missing?q=1#top [slug] | /de/missing?q=1#top [slug] | /de/missing?q=1#top [slug] | /de/missing?q=1#top [slug] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about | null |
| /de/de/about | /de/de/about?q=1#top [slug] | /de/de/about?q=1#top [slug] | /de/de/about?q=1#top [slug] | /de/de/about?q=1#top [slug] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /a-propos | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | /a-propos | null |
| /about | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | /about | null |
| /about-us | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | /about-us | null |
| /article/hello-world | /artikel/hello-world?q=1#top [localized-blog-slug-de] | /artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /artikel/hello-world?q=1#top [localized-blog-slug-de] | /artikel/hello-world?q=1#top [localized-blog-slug-de] | /article/hello-world | null |
| /artikel/hello-world | /artikel/hello-world?q=1#top [localized-blog-slug-de] | /artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /artikel/hello-world?q=1#top [localized-blog-slug-de] | /artikel/hello-world?q=1#top [localized-blog-slug-de] | /artikel/hello-world | null |
| /blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | /blog | null |
| /blog/hello-world | /artikel/hello-world?q=1#top [localized-blog-slug-de] | /artikel/hello-world-de?q=1#top [localized-blog-slug-de] | /artikel/hello-world?q=1#top [localized-blog-slug-de] | /artikel/hello-world?q=1#top [localized-blog-slug-de] | /blog/hello-world | null |
| /careers | /careers?q=1#top [careers] |  | /careers?q=1#top [careers] | /careers?q=1#top [careers] | /careers | null |
| /contact | /kontakt?q=1#top [localized-contact-de] |  | /kontakt?q=1#top [localized-contact-de] | /kontakt?q=1#top [localized-contact-de] | /contact | null |
| /contact-fr | /kontakt?q=1#top [localized-contact-de] |  | /kontakt?q=1#top [localized-contact-de] | /kontakt?q=1#top [localized-contact-de] | /contact-fr | null |
| /hello-world | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world | null |
| /kontakt | /kontakt?q=1#top [localized-contact-de] |  | /kontakt?q=1#top [localized-contact-de] | /kontakt?q=1#top [localized-contact-de] | /kontakt | null |
| /legal/imprint | /legal/imprint?q=1#top [legal-imprint] |  | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint | null |
| /products | /products?q=1#top [products] |  | /products?q=1#top [products] | /products?q=1#top [products] | /products | null |
| /products/42 | /produkte/42?q=1#top [localized-products-id-de] | /produkte/42-de?q=1#top [localized-products-id-de] | /produkte/42?q=1#top [localized-products-id-de] | /produkte/42?q=1#top [localized-products-id-de] | /products/42 | null |
| /produits/42 | /produkte/42?q=1#top [localized-products-id-de] | /produkte/42-de?q=1#top [localized-products-id-de] | /produkte/42?q=1#top [localized-products-id-de] | /produkte/42?q=1#top [localized-products-id-de] | /produits/42 | null |
| /produkte/42 | /produkte/42?q=1#top [localized-products-id-de] | /produkte/42-de?q=1#top [localized-products-id-de] | /produkte/42?q=1#top [localized-products-id-de] | /produkte/42?q=1#top [localized-products-id-de] | /produkte/42 | null |
| /ueber-uns | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns | null |
| /en | /en?q=1#top [slug] | /en?q=1#top [slug] | /en?q=1#top [slug] | /en?q=1#top [slug] | /en | null |
| /en/ | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /en/ | null |
| /de | /de?q=1#top [slug] | /de?q=1#top [slug] | /de?q=1#top [slug] | /de?q=1#top [slug] | /de | null |
| /de/ | /de/?q=1#top [slug] | /de/?q=1#top [slug] | /de/?q=1#top [slug] | /de/?q=1#top [slug] | /de/ | null |
| /about/ | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | /about/ | null |
| /de/about/ | /de/about/?q=1#top [slug] | /de/about/?q=1#top [slug] | /de/about/?q=1#top [slug] | /de/about/?q=1#top [slug] | /de/about/ | null |
| /missing | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing | null |
| /de/missing | /de/missing?q=1#top [slug] | /de/missing?q=1#top [slug] | /de/missing?q=1#top [slug] | /de/missing?q=1#top [slug] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about | null |
| /de/de/about | /de/de/about?q=1#top [slug] | /de/de/about?q=1#top [slug] | /de/de/about?q=1#top [slug] | /de/de/about?q=1#top [slug] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /a-propos | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | /a-propos | null |
| /about | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | /about | null |
| /about-us | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | /about-us | null |
| /article/hello-world | /article/hello-world?q=1#top [localized-blog-slug-fr] | /article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /article/hello-world?q=1#top [localized-blog-slug-fr] | /article/hello-world?q=1#top [localized-blog-slug-fr] | /article/hello-world | null |
| /artikel/hello-world | /article/hello-world?q=1#top [localized-blog-slug-fr] | /article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /article/hello-world?q=1#top [localized-blog-slug-fr] | /article/hello-world?q=1#top [localized-blog-slug-fr] | /artikel/hello-world | null |
| /blog | /blog?q=1#top [blog] |  | /blog?q=1#top [blog] | /blog?q=1#top [blog] | /blog | null |
| /blog/hello-world | /article/hello-world?q=1#top [localized-blog-slug-fr] | /article/hello-world-fr?q=1#top [localized-blog-slug-fr] | /article/hello-world?q=1#top [localized-blog-slug-fr] | /article/hello-world?q=1#top [localized-blog-slug-fr] | /blog/hello-world | null |
| /careers | /careers?q=1#top [careers] |  | /careers?q=1#top [careers] | /careers?q=1#top [careers] | /careers | null |
| /contact | /contact-fr?q=1#top [localized-contact-fr] |  | /contact-fr?q=1#top [localized-contact-fr] | /contact-fr?q=1#top [localized-contact-fr] | /contact | null |
| /contact-fr | /contact-fr?q=1#top [localized-contact-fr] |  | /contact-fr?q=1#top [localized-contact-fr] | /contact-fr?q=1#top [localized-contact-fr] | /contact-fr | null |
| /hello-world | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world?q=1#top [slug] | /hello-world | null |
| /kontakt | /contact-fr?q=1#top [localized-contact-fr] |  | /contact-fr?q=1#top [localized-contact-fr] | /contact-fr?q=1#top [localized-contact-fr] | /kontakt | null |
| /legal/imprint | /legal/imprint?q=1#top [legal-imprint] |  | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint?q=1#top [legal-imprint] | /legal/imprint | null |
| /products | /products?q=1#top [products] |  | /products?q=1#top [products] | /products?q=1#top [products] | /products | null |
| /products/42 | /produits/42?q=1#top [localized-products-id-fr] | /produits/42-fr?q=1#top [localized-products-id-fr] | /produits/42?q=1#top [localized-products-id-fr] | /produits/42?q=1#top [localized-products-id-fr] | /products/42 | null |
| /produits/42 | /produits/42?q=1#top [localized-products-id-fr] | /produits/42-fr?q=1#top [localized-products-id-fr] | /produits/42?q=1#top [localized-products-id-fr] | /produits/42?q=1#top [localized-products-id-fr] | /produits/42 | null |
| /produkte/42 | /produits/42?q=1#top [localized-products-id-fr] | /produits/42-fr?q=1#top [localized-products-id-fr] | /produits/42?q=1#top [localized-products-id-fr] | /produits/42?q=1#top [localized-products-id-fr] | /produkte/42 | null |
| /ueber-uns | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | /ueber-uns | null |
| /en | /en?q=1#top [slug] | /en?q=1#top [slug] | /en?q=1#top [slug] | /en?q=1#top [slug] | /en | null |
| /en/ | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /en/?q=1#top [slug] | /en/ | null |
| /de | /de?q=1#top [slug] | /de?q=1#top [slug] | /de?q=1#top [slug] | /de?q=1#top [slug] | /de | null |
| /de/ | /de/?q=1#top [slug] | /de/?q=1#top [slug] | /de/?q=1#top [slug] | /de/?q=1#top [slug] | /de/ | null |
| /about/ | /a-propos?q=1#top [localized-about-fr] |  | /a-propos?q=1#top [localized-about-fr] | /a-propos?q=1#top [localized-about-fr] | /about/ | null |
| /de/about/ | /de/about/?q=1#top [slug] | /de/about/?q=1#top [slug] | /de/about/?q=1#top [slug] | /de/about/?q=1#top [slug] | /de/about/ | null |
| /missing | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing?q=1#top [slug] | /missing | null |
| /de/missing | /de/missing?q=1#top [slug] | /de/missing?q=1#top [slug] | /de/missing?q=1#top [slug] | /de/missing?q=1#top [slug] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about?q=1#top [slug] | /xx/about | null |
| /de/de/about | /de/de/about?q=1#top [slug] | /de/de/about?q=1#top [slug] | /de/de/about?q=1#top [slug] | /de/de/about?q=1#top [slug] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / |
|---|---|---|---|
| about | /about-us [localized-about-en] | /ueber-uns [localized-about-de] | /a-propos [localized-about-fr] |
| blog | /blog [blog] | /blog [blog] | /blog [blog] |
| blog-slug | /blog/hello-world [blog-slug] | /artikel/hello-world [localized-blog-slug-de] | /article/hello-world [localized-blog-slug-fr] |
| careers | /careers [careers] | /careers [careers] | /careers [careers] |
| contact | /contact [contact] | /kontakt [localized-contact-de] | /contact-fr [localized-contact-fr] |
| index | / [index] | / [index] | / [index] |
| legal-imprint | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] | /legal/imprint [legal-imprint] |
| products | /products [products] | /products [products] | /products [products] |
| products-id | /products/42 [localized-products-id-en] | /produkte/42 [localized-products-id-de] | /produits/42 [localized-products-id-fr] |
| slug | /hello-world [slug] | /hello-world [slug] | /hello-world [slug] |

## Invariant breaks (0)

none
