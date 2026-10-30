## requests, no strategy

- `GET / {}` → {"status":200,"location":null,"vary":"Cookie, Accept-Language","locale":"en","route":"index","cookie":{}}
- `GET /?a=1 {}` → {"status":200,"location":null,"vary":"Cookie, Accept-Language","locale":"en","route":"index","cookie":{}}
- `GET /de {}` → {"status":200,"location":null,"vary":null,"locale":"de","route":"index","cookie":{}}
- `GET /de/ {}` → {"status":200,"location":null,"vary":null,"locale":"de","route":"index","cookie":{}}
- `GET /de/about {}` → {"status":200,"location":null,"vary":null,"locale":"de","route":"about","cookie":{}}
- `GET /de/about/ {}` → {"status":200,"location":null,"vary":null,"locale":"de","route":"about","cookie":{}}
- `GET /ar/x/y {}` → {"status":200,"location":null,"vary":null,"locale":"ar","route":"x-y","cookie":{}}
- `GET /en/about {}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"about","cookie":{}}
- `GET /fr {}` → {"status":200,"location":null,"vary":null,"locale":"fr","route":"index","cookie":{}}
- `GET /fr/about {}` → {"status":200,"location":null,"vary":null,"locale":"fr","route":"about","cookie":{}}
- `GET /about {}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"about","cookie":{}}
- `GET /about/ {}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"about","cookie":{}}
- `GET /deutsch {}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"deutsch","cookie":{}}
- `GET /about {"cookie":"de","acceptLanguage":"de"}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"about","cookie":{}}
- `GET / {"acceptLanguage":"de"}` → {"status":302,"location":"/de","vary":"Cookie, Accept-Language","locale":"«undefined»","route":"«undefined»","cookie":{}}
- `GET / {"acceptLanguage":"de-DE,en;q=0.5"}` → {"status":302,"location":"/de","vary":"Cookie, Accept-Language","locale":"«undefined»","route":"«undefined»","cookie":{}}
- `GET / {"acceptLanguage":"fr"}` → {"status":302,"location":"/fr","vary":"Cookie, Accept-Language","locale":"«undefined»","route":"«undefined»","cookie":{}}
- `GET / {"acceptLanguage":"ja"}` → {"status":200,"location":null,"vary":"Cookie, Accept-Language","locale":"en","route":"index","cookie":{}}
- `GET / {"cookie":"de"}` → {"status":302,"location":"/de","vary":"Cookie, Accept-Language","locale":"«undefined»","route":"«undefined»","cookie":{}}
- `GET / {"cookie":"fr"}` → {"status":302,"location":"/fr","vary":"Cookie, Accept-Language","locale":"«undefined»","route":"«undefined»","cookie":{}}
- `GET / {"cookie":"xx","acceptLanguage":"de"}` → {"status":302,"location":"/de","vary":"Cookie, Accept-Language","locale":"«undefined»","route":"«undefined»","cookie":{}}
- `GET / {"cookie":"en","acceptLanguage":"de"}` → {"status":200,"location":null,"vary":"Cookie, Accept-Language","locale":"en","route":"index","cookie":{}}
- `GET / {"acceptLanguage":"de","prerendered":true}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"index","cookie":{}}
- `GET / {"acceptLanguage":"de","referer":"http://site.test/de"}` → {"status":302,"location":"/de","vary":"Cookie, Accept-Language","locale":"«undefined»","route":"«undefined»","cookie":{}}
- `GET /de {"cookie":"en","referer":"http://site.test/about"}` → {"status":200,"location":null,"vary":null,"locale":"de","route":"index","cookie":{}}
- `GET /de {"cookie":"en","referer":"https://elsewhere.test/about"}` → {"status":200,"location":null,"vary":null,"locale":"de","route":"index","cookie":{}}
- `GET /blog/hello {"routePattern":"/blog/[slug]","params":{"slug":"hello"}}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"blog-hello","cookie":{}}
- `GET /de/blog/hello {"routePattern":"/[locale]/blog/[slug]","params":{"locale":"de","slug":"hello"}}` → {"status":200,"location":null,"vary":null,"locale":"de","route":"blog-hello","cookie":{}}
- `GET /de/docs/a/b {"routePattern":"/de/docs/[...path]","params":{"path":"a/b"}}` → {"status":200,"location":null,"vary":null,"locale":"de","route":"docs-a-b","cookie":{}}
- `GET /_server-islands/Late {"routePattern":"/_server-islands/[name]","params":{"name":"Late"},"referer":"http://site.test/de/about"}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"_server-islands-Late","cookie":{}}
- `GET /_server-islands/Late {"routePattern":"/_server-islands/[name]","params":{"name":"Late"}}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"_server-islands-Late","cookie":{}}
- `GET /_actions/like {"routePattern":"/_actions/[...path]","params":{"path":"like"},"referer":"http://site.test/de/about"}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"_actions-like","cookie":{}}

## requests, adapter

- `GET / {}` → {"status":200,"location":null,"vary":"Cookie, Accept-Language","locale":"en","route":"index","cookie":{}}
- `GET /?a=1 {}` → {"status":200,"location":null,"vary":"Cookie, Accept-Language","locale":"en","route":"index","cookie":{}}
- `GET /de {}` → {"status":200,"location":null,"vary":null,"locale":"de","route":"index","cookie":{}}
- `GET /de/ {}` → {"status":200,"location":null,"vary":null,"locale":"de","route":"index","cookie":{}}
- `GET /de/about {}` → {"status":200,"location":null,"vary":null,"locale":"de","route":"about","cookie":{}}
- `GET /de/about/ {}` → {"status":200,"location":null,"vary":null,"locale":"de","route":"about","cookie":{}}
- `GET /ar/x/y {}` → {"status":200,"location":null,"vary":null,"locale":"ar","route":"x-y","cookie":{}}
- `GET /en/about {}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"about","cookie":{}}
- `GET /fr {}` → {"status":200,"location":null,"vary":null,"locale":"fr","route":"index","cookie":{}}
- `GET /fr/about {}` → {"status":200,"location":null,"vary":null,"locale":"fr","route":"about","cookie":{}}
- `GET /about {}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"about","cookie":{}}
- `GET /about/ {}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"about","cookie":{}}
- `GET /deutsch {}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"deutsch","cookie":{}}
- `GET /about {"cookie":"de","acceptLanguage":"de"}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"about","cookie":{}}
- `GET / {"acceptLanguage":"de"}` → {"status":302,"location":"/de","vary":"Cookie, Accept-Language","locale":"«undefined»","route":"«undefined»","cookie":{}}
- `GET / {"acceptLanguage":"de-DE,en;q=0.5"}` → {"status":302,"location":"/de","vary":"Cookie, Accept-Language","locale":"«undefined»","route":"«undefined»","cookie":{}}
- `GET / {"acceptLanguage":"fr"}` → {"status":302,"location":"/fr","vary":"Cookie, Accept-Language","locale":"«undefined»","route":"«undefined»","cookie":{}}
- `GET / {"acceptLanguage":"ja"}` → {"status":200,"location":null,"vary":"Cookie, Accept-Language","locale":"en","route":"index","cookie":{}}
- `GET / {"cookie":"de"}` → {"status":302,"location":"/de","vary":"Cookie, Accept-Language","locale":"«undefined»","route":"«undefined»","cookie":{}}
- `GET / {"cookie":"fr"}` → {"status":302,"location":"/fr","vary":"Cookie, Accept-Language","locale":"«undefined»","route":"«undefined»","cookie":{}}
- `GET / {"cookie":"xx","acceptLanguage":"de"}` → {"status":302,"location":"/de","vary":"Cookie, Accept-Language","locale":"«undefined»","route":"«undefined»","cookie":{}}
- `GET / {"cookie":"en","acceptLanguage":"de"}` → {"status":200,"location":null,"vary":"Cookie, Accept-Language","locale":"en","route":"index","cookie":{}}
- `GET / {"acceptLanguage":"de","prerendered":true}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"index","cookie":{}}
- `GET / {"acceptLanguage":"de","referer":"http://site.test/de"}` → {"status":302,"location":"/de","vary":"Cookie, Accept-Language","locale":"«undefined»","route":"«undefined»","cookie":{}}
- `GET /de {"cookie":"en","referer":"http://site.test/about"}` → {"status":200,"location":null,"vary":null,"locale":"de","route":"index","cookie":{}}
- `GET /de {"cookie":"en","referer":"https://elsewhere.test/about"}` → {"status":200,"location":null,"vary":null,"locale":"de","route":"index","cookie":{}}
- `GET /blog/hello {"routePattern":"/blog/[slug]","params":{"slug":"hello"}}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"blog-hello","cookie":{}}
- `GET /de/blog/hello {"routePattern":"/[locale]/blog/[slug]","params":{"locale":"de","slug":"hello"}}` → {"status":200,"location":null,"vary":null,"locale":"de","route":"blog-hello","cookie":{}}
- `GET /de/docs/a/b {"routePattern":"/de/docs/[...path]","params":{"path":"a/b"}}` → {"status":200,"location":null,"vary":null,"locale":"de","route":"docs-a-b","cookie":{}}
- `GET /_server-islands/Late {"routePattern":"/_server-islands/[name]","params":{"name":"Late"},"referer":"http://site.test/de/about"}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"_server-islands-Late","cookie":{}}
- `GET /_server-islands/Late {"routePattern":"/_server-islands/[name]","params":{"name":"Late"}}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"_server-islands-Late","cookie":{}}
- `GET /_actions/like {"routePattern":"/_actions/[...path]","params":{"path":"like"},"referer":"http://site.test/de/about"}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"_actions-like","cookie":{}}

## requests, options

- `GET / {"acceptLanguage":"de"}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"index","cookie":{}}
- `GET / {"cookie":"de"}` → {"status":200,"location":null,"vary":"Accept-Language","locale":"en","route":"index","cookie":{}}
- `GET / {}` → {"status":200,"location":null,"vary":"Cookie, Accept-Language","locale":"en","route":"index","cookie":{}}
- `GET /de/about?x=1 {}` → {"status":200,"location":null,"vary":null,"locale":"de","route":"about","cookie":{}}

## helpers on /de/about?x=1

- `locale, default` → ["de","en",4]
- `getRoute` → "about"
- `getRouteName(undefined)` → "about"
- `getRouteName(/)` → "index"
- `getRouteName(/de)` → "index"
- `getRouteName(/de/)` → "index"
- `getRouteName(/de/a/b)` → "a-b"
- `getRouteName(/a/b/)` → "a-b"
- `getRouteName(/fr/x)` → "x"
- `getLocaleFromPath(undefined)` → "de"
- `getLocaleFromPath(/)` → "en"
- `getLocaleFromPath(/de/x)` → "de"
- `getLocaleFromPath(/ar)` → "ar"
- `getLocaleFromPath(/fr/x)` → "fr"
- `getLocaleFromPath(/x)` → "en"
- `switchLocalePath(en)` → "/about"
- `switchLocalePath(de)` → "/de/about"
- `switchLocalePath(ar)` → "/ar/about"
- `switchLocalePath(fr)` → "/fr/about"
- `localizePath(/, undefined)` → "/de"
- `localizePath(/, de)` → "/de"
- `localizePath(/x, de)` → "/de/x"
- `localizePath(/x/, de)` → "/de/x"
- `localizePath(/de/x, en)` → "/x"
- `localizePath(/x, en)` → "/x"
- `localizePath(x, de)` → "/de/x"
- `localizePath(/x?q=1#h, de)` → "/de/x?q=1#h"
- `getBasePath()` → "/about"
- `getBasePath(/de/z)` → "/z"
- `getLocaleRewritePath` → "/about"
- `t(title)` → "Über"
- `t(only)` → "en only"
- `t(a.b)` → "DE AB"
- `t(a)` → {"b":"DE AB"}
- `has(a)` → true
- `tc(apples, 2)` → "2 apples"
- `tn` → "1.234,5"
- `td` → "15.6.2024"
- `tdr` → "in 1 Stunde"

## head on /de/about?x=1

- `useLocaleHead()` → {"htmlAttrs":{"lang":"de-DE","dir":"auto"},"link":[{"rel":"canonical","href":"//de/about"},{"rel":"alternate","href":"//about","hreflang":"en-US"},{"rel":"alternate","href":"//de/about","hreflang":"de-DE"},{"rel":"alternate","href":"//ar/about","hreflang":"ar-EG"},{"rel":"alternate","href":"//about","hreflang":"x-default"}],"meta":[{"property":"og:locale","content":"de_DE"},{"property":"og:url","content":"//de/about"},{"property":"og:locale:alternate","content":"en_US"},{"property":"og:locale:alternate","content":"ar_EG"}]}
- `useLocaleHead(baseUrl)` → {"htmlAttrs":{"lang":"de-DE","dir":"auto"},"link":[{"rel":"canonical","href":"https://site.test/de/about"},{"rel":"alternate","href":"https://site.test/about","hreflang":"en-US"},{"rel":"alternate","href":"https://site.test/de/about","hreflang":"de-DE"},{"rel":"alternate","href":"https://site.test/ar/about","hreflang":"ar-EG"},{"rel":"alternate","href":"https://site.test/about","hreflang":"x-default"}],"meta":[{"property":"og:locale","content":"de_DE"},{"property":"og:url","content":"https://site.test/de/about"},{"property":"og:locale:alternate","content":"en_US"},{"property":"og:locale:alternate","content":"ar_EG"}]}
- `useLocaleHead(no seo)` → {"htmlAttrs":{"lang":"de-DE"},"link":[],"meta":[]}

## props on /de/about?x=1

- `getI18nProps()` → {"locale":"de","fallbackLocale":"en","currentRoute":"about","translations":{"about":{"title":"Über"}}}
- `getI18nProps([])` → {"locale":"de","fallbackLocale":"en","currentRoute":"about","translations":{"about":{"title":"Über"}}}
- `getI18nProps(keys)` → {"locale":"de","fallbackLocale":"en","currentRoute":"about","translations":{"about":{"title":"Über","a":{"b":"DE AB"},"only":"en only","island":{"cta":"Buy"}}}}
- `getI18nProps(a, a.b)` → {"locale":"de","fallbackLocale":"en","currentRoute":"about","translations":{"about":{"a":{"b":"DE AB"}}}}
- `GET /about {}` → {"status":200,"location":null,"vary":null,"locale":"en","route":"about","cookie":{}}

## helpers on /about

- `locale, default` → ["en","en",4]
- `getRoute` → "about"
- `getRouteName(undefined)` → "about"
- `getRouteName(/)` → "index"
- `getRouteName(/de)` → "index"
- `getRouteName(/de/)` → "index"
- `getRouteName(/de/a/b)` → "a-b"
- `getRouteName(/a/b/)` → "a-b"
- `getRouteName(/fr/x)` → "x"
- `getLocaleFromPath(undefined)` → "en"
- `getLocaleFromPath(/)` → "en"
- `getLocaleFromPath(/de/x)` → "de"
- `getLocaleFromPath(/ar)` → "ar"
- `getLocaleFromPath(/fr/x)` → "fr"
- `getLocaleFromPath(/x)` → "en"
- `switchLocalePath(en)` → "/about"
- `switchLocalePath(de)` → "/de/about"
- `switchLocalePath(ar)` → "/ar/about"
- `switchLocalePath(fr)` → "/fr/about"
- `localizePath(/, undefined)` → "/"
- `localizePath(/, de)` → "/de"
- `localizePath(/x, de)` → "/de/x"
- `localizePath(/x/, de)` → "/de/x"
- `localizePath(/de/x, en)` → "/x"
- `localizePath(/x, en)` → "/x"
- `localizePath(x, de)` → "/de/x"
- `localizePath(/x?q=1#h, de)` → "/de/x?q=1#h"
- `getBasePath()` → "/about"
- `getBasePath(/de/z)` → "/z"
- `getLocaleRewritePath` → "/about"
- `t(title)` → "About"
- `t(only)` → "en only"
- `t(a.b)` → "AB"
- `t(a)` → {"b":"AB"}
- `has(a)` → true
- `tc(apples, 2)` → "2 apples"
- `tn` → "1,234.5"
- `td` → "6/15/2024"
- `tdr` → "in 1 hour"

## head on /about

- `useLocaleHead()` → {"htmlAttrs":{"lang":"en-US","dir":"auto"},"link":[{"rel":"canonical","href":"//about"},{"rel":"alternate","href":"//about","hreflang":"en-US"},{"rel":"alternate","href":"//de/about","hreflang":"de-DE"},{"rel":"alternate","href":"//ar/about","hreflang":"ar-EG"},{"rel":"alternate","href":"//about","hreflang":"x-default"}],"meta":[{"property":"og:locale","content":"en_US"},{"property":"og:url","content":"//about"},{"property":"og:locale:alternate","content":"de_DE"},{"property":"og:locale:alternate","content":"ar_EG"}]}
- `useLocaleHead(baseUrl)` → {"htmlAttrs":{"lang":"en-US","dir":"auto"},"link":[{"rel":"canonical","href":"https://site.test/about"},{"rel":"alternate","href":"https://site.test/about","hreflang":"en-US"},{"rel":"alternate","href":"https://site.test/de/about","hreflang":"de-DE"},{"rel":"alternate","href":"https://site.test/ar/about","hreflang":"ar-EG"},{"rel":"alternate","href":"https://site.test/about","hreflang":"x-default"}],"meta":[{"property":"og:locale","content":"en_US"},{"property":"og:url","content":"https://site.test/about"},{"property":"og:locale:alternate","content":"de_DE"},{"property":"og:locale:alternate","content":"ar_EG"}]}
- `useLocaleHead(no seo)` → {"htmlAttrs":{"lang":"en-US"},"link":[],"meta":[]}

## props on /about

- `getI18nProps()` → {"locale":"en","fallbackLocale":"en","currentRoute":"about","translations":{"about":{"title":"About","island":{"cta":"Buy"}}}}
- `getI18nProps([])` → {"locale":"en","fallbackLocale":"en","currentRoute":"about","translations":{"about":{"title":"About","island":{"cta":"Buy"}}}}
- `getI18nProps(keys)` → {"locale":"en","fallbackLocale":"en","currentRoute":"about","translations":{"about":{"title":"About","a":{"b":"AB"},"only":"en only","island":{"cta":"Buy"}}}}
- `getI18nProps(a, a.b)` → {"locale":"en","fallbackLocale":"en","currentRoute":"about","translations":{"about":{"a":{"b":"AB"}}}}
- `GET /ar/x {}` → {"status":200,"location":null,"vary":null,"locale":"ar","route":"x","cookie":{}}

## helpers on /ar/x

- `locale, default` → ["ar","en",4]
- `getRoute` → "x"
- `getRouteName(undefined)` → "x"
- `getRouteName(/)` → "index"
- `getRouteName(/de)` → "index"
- `getRouteName(/de/)` → "index"
- `getRouteName(/de/a/b)` → "a-b"
- `getRouteName(/a/b/)` → "a-b"
- `getRouteName(/fr/x)` → "x"
- `getLocaleFromPath(undefined)` → "ar"
- `getLocaleFromPath(/)` → "en"
- `getLocaleFromPath(/de/x)` → "de"
- `getLocaleFromPath(/ar)` → "ar"
- `getLocaleFromPath(/fr/x)` → "fr"
- `getLocaleFromPath(/x)` → "en"
- `switchLocalePath(en)` → "/x"
- `switchLocalePath(de)` → "/de/x"
- `switchLocalePath(ar)` → "/ar/x"
- `switchLocalePath(fr)` → "/fr/x"
- `localizePath(/, undefined)` → "/ar"
- `localizePath(/, de)` → "/de"
- `localizePath(/x, de)` → "/de/x"
- `localizePath(/x/, de)` → "/de/x"
- `localizePath(/de/x, en)` → "/x"
- `localizePath(/x, en)` → "/x"
- `localizePath(x, de)` → "/de/x"
- `localizePath(/x?q=1#h, de)` → "/de/x?q=1#h"
- `getBasePath()` → "/x"
- `getBasePath(/de/z)` → "/z"
- `getLocaleRewritePath` → "/x"
- `t(title)` → "Root title"
- `t(only)` → "en only"
- `t(a.b)` → "AB"
- `t(a)` → {"b":"AB"}
- `has(a)` → false
- `tc(apples, 2)` → "2 apples"
- `tn` → "1,234.5"
- `td` → "15‏/6‏/2024"
- `tdr` → "خلال ساعة واحدة"

## head on /ar/x

- `useLocaleHead()` → {"htmlAttrs":{"lang":"ar-EG","dir":"rtl"},"link":[{"rel":"canonical","href":"//ar/x"},{"rel":"alternate","href":"//x","hreflang":"en-US"},{"rel":"alternate","href":"//de/x","hreflang":"de-DE"},{"rel":"alternate","href":"//ar/x","hreflang":"ar-EG"},{"rel":"alternate","href":"//x","hreflang":"x-default"}],"meta":[{"property":"og:locale","content":"ar_EG"},{"property":"og:url","content":"//ar/x"},{"property":"og:locale:alternate","content":"en_US"},{"property":"og:locale:alternate","content":"de_DE"}]}
- `useLocaleHead(baseUrl)` → {"htmlAttrs":{"lang":"ar-EG","dir":"rtl"},"link":[{"rel":"canonical","href":"https://site.test/ar/x"},{"rel":"alternate","href":"https://site.test/x","hreflang":"en-US"},{"rel":"alternate","href":"https://site.test/de/x","hreflang":"de-DE"},{"rel":"alternate","href":"https://site.test/ar/x","hreflang":"ar-EG"},{"rel":"alternate","href":"https://site.test/x","hreflang":"x-default"}],"meta":[{"property":"og:locale","content":"ar_EG"},{"property":"og:url","content":"https://site.test/ar/x"},{"property":"og:locale:alternate","content":"en_US"},{"property":"og:locale:alternate","content":"de_DE"}]}
- `useLocaleHead(no seo)` → {"htmlAttrs":{"lang":"ar-EG"},"link":[],"meta":[]}

## props on /ar/x

- `getI18nProps()` → {"locale":"ar","fallbackLocale":"en","currentRoute":"x","translations":{}}
- `getI18nProps([])` → {"locale":"ar","fallbackLocale":"en","currentRoute":"x","translations":{}}
- `getI18nProps(keys)` → {"locale":"ar","fallbackLocale":"en","currentRoute":"x","translations":{"x":{"title":"Root title","a":{"b":"AB"},"only":"en only"}}}
- `getI18nProps(a, a.b)` → {"locale":"ar","fallbackLocale":"en","currentRoute":"x","translations":{"x":{"a":{"b":"AB"}}}}

## rewrite

- `GET /de/about {}` → {"status":200,"location":null,"vary":null,"locale":"de","route":"about","cookie":{}}
- `prepareLocaleRewrite ok` → "/about"
- `locals.locale` → "ar"
- `prepareLocaleRewrite bad` → 404
- `prepareLocaleRewrite disabled` → "/about"

## adapter

- `getRouteName(/)` → "index"
- `getLocaleFromPath(/)` → "en"
- `switchLocalePath(/, de)` → "/de"
- `switchLocalePath(/, en)` → "/"
- `localizePath(/, de)` → "/de"
- `removeLocaleFromPath(/)` → "/"
- `resolvePath(/, de)` → "/de"
- `getRouteName(/de)` → "index"
- `getLocaleFromPath(/de)` → "de"
- `switchLocalePath(/de, de)` → "/de"
- `switchLocalePath(/de, en)` → "/"
- `localizePath(/de, de)` → "/de"
- `removeLocaleFromPath(/de)` → "/"
- `resolvePath(/de, de)` → "/de"
- `getRouteName(/de/a)` → "a"
- `getLocaleFromPath(/de/a)` → "de"
- `switchLocalePath(/de/a, de)` → "/de/a"
- `switchLocalePath(/de/a, en)` → "/a"
- `localizePath(/de/a, de)` → "/de/a"
- `removeLocaleFromPath(/de/a)` → "/a"
- `resolvePath(/de/a, de)` → "/de/a"
- `getRouteName(/a/b)` → "a-b"
- `getLocaleFromPath(/a/b)` → "en"
- `switchLocalePath(/a/b, de)` → "/de/a/b"
- `switchLocalePath(/a/b, en)` → "/a/b"
- `localizePath(/a/b, de)` → "/de/a/b"
- `removeLocaleFromPath(/a/b)` → "/a/b"
- `resolvePath(/a/b, de)` → "/de/a/b"
- `getRouteName(a/b)` → "a-b"
- `getLocaleFromPath(a/b)` → "en"
- `switchLocalePath(a/b, de)` → "/de/a/b"
- `switchLocalePath(a/b, en)` → "/a/b"
- `localizePath(a/b, de)` → "/de/a/b"
- `removeLocaleFromPath(a/b)` → "/a/b"
- `resolvePath(a/b, de)` → "/de/a/b"
- `getRouteName(//de/a)` → "a"
- `getLocaleFromPath(//de/a)` → "de"
- `switchLocalePath(//de/a, de)` → "/de/a"
- `switchLocalePath(//de/a, en)` → "/a"
- `localizePath(//de/a, de)` → "/de/a"
- `removeLocaleFromPath(//de/a)` → "/a"
- `resolvePath(//de/a, de)` → "/de/a"
- `getRouteName(/a//b)` → "a-b"
- `getLocaleFromPath(/a//b)` → "en"
- `switchLocalePath(/a//b, de)` → "/de/a/b"
- `switchLocalePath(/a//b, en)` → "/a/b"
- `localizePath(/a//b, de)` → "/de/a/b"
- `removeLocaleFromPath(/a//b)` → "/a/b"
- `resolvePath(/a//b, de)` → "/de/a/b"
- `getRouteName(/a/)` → "a"
- `getLocaleFromPath(/a/)` → "en"
- `switchLocalePath(/a/, de)` → "/de/a"
- `switchLocalePath(/a/, en)` → "/a"
- `localizePath(/a/, de)` → "/de/a"
- `removeLocaleFromPath(/a/)` → "/a"
- `resolvePath(/a/, de)` → "/de/a"

## instance

- `fork locale` → ["de","en","en"]
- `fork write stays` → ["own","own","own","index"]
- `clearCache on a fork` → ["Hallo","Hello","own"]
- `initial messages survive clearCache` → ["Hello","Root title"]
- `getRouteTranslations` → {"hello":"Hello","title":"Root title","apples":"no apples | one apple | {count} apples","a":{"b":"AB"},"only":"en only","hi":"Hi {name}"}

## island core

- `translate(title)` → "Über"
- `translate(title, D)` → "Über"
- `has(title)` → true
- `translate(o)` → {"x":"X"}
- `translate(o, D)` → {"x":"X"}
- `has(o)` → false
- `translate(o.x)` → "X"
- `translate(o.x, D)` → "X"
- `has(o.x)` → true
- `translate(zero)` → 0
- `translate(zero, D)` → 0
- `has(zero)` → true
- `translate(empty)` → ""
- `translate(empty, D)` → ""
- `has(empty)` → true
- `translate(nope)` → "nope"
- `translate(nope, D)` → "D"
- `has(nope)` → false
- `translate()` → ""
- `translate(, D)` → "D"
- `has()` → false
- `translate(toString)` → "toString"
- `translate(toString, D)` → "D"
- `has(toString)` → false
- `translate(__proto__)` → "__proto__"
- `translate(__proto__, D)` → "D"
- `has(__proto__)` → false
- `translate(hi, params)` → "Hi Jo"
- `tc(apples, 0)` → "keine"
- `tc(apples, 1)` → "ein"
- `tc(apples, 2)` → "2 viele"
- `tc(apples, 1.5)` → "1.5 viele"
