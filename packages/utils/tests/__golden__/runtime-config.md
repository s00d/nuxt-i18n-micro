## readI18nRuntimeOverrides

- `read({})` → {}
- `read({"i18nRuntime":null})` → {}
- `read({"i18nRuntime":{"defaultLocale":" de "}})` → {"defaultLocale":"de"}
- `read({"i18nRuntime":{"disabledLocales":"de, ru"}})` → {"disabledLocales":["de","ru"]}
- `read({"i18nRuntime":{"metaBaseUrl":"https://cdn.example"}})` → {"metaBaseUrl":"https://cdn.example"}
- `read({"i18nRuntime":{"localeBaseUrls":"de=https://de.example.net"}})` → {"localeBaseUrls":{"de":"https://de.example.net"}}
- `read({"i18nRuntime":{"localeBaseUrls":{"de":"https://de.example.net"}}})` → {"localeBaseUrls":{"de":"https://de.example.net"}}

## readI18nEnvOverrides

- `env({})` → {}
- `env({"NUXT_I18N_META_BASE_URL":"https://cdn.example"})` → {"metaBaseUrl":"https://cdn.example"}
- `env({"NUXT_PUBLIC_I18N_RUNTIME_META_BASE_URL":"https://cdn.example"})` → {"metaBaseUrl":"https://cdn.example"}
- `env({"NUXT_I18N_LOCALE_BASE_URLS":"de=https://de.example.net,en=https://example.net"})` → {"localeBaseUrls":{"de":"https://de.example.net","en":"https://example.net"}}
- `env({"NUXT_I18N_LOCALE_BASE_URLS":" de = https://de.example.net , , x"})` → {"localeBaseUrls":{"de":"https://de.example.net"}}
- `env({"NUXT_PUBLIC_I18N_RUNTIME_LOCALE_BASE_URLS":"de=https://de.example.net"})` → {"localeBaseUrls":{"de":"https://de.example.net"}}

## mergeI18nOverrides / i18nOverridesKey

- `merge({}, {})` → {}
- `key(merge({}, {}))` → "\u0000\u0000\u0000\u0000\u0000\u0000null"
- `merge({"defaultLocale":"de"}, {"defaultLocale":"ru","dateBuild":"x"})` → {"defaultLocale":"de","dateBuild":"x"}
- `key(merge({"defaultLocale":"de"}, {"defaultLocale":"ru","dateBuild":"x"}))` → "de\u0000\u0000\u0000\u0000x\u0000\u0000null"
- `merge({"metaBaseUrl":"https://a.example"}, {"metaBaseUrl":"https://b.example"})` → {"metaBaseUrl":"https://a.example"}
- `key(merge({"metaBaseUrl":"https://a.example"}, {"metaBaseUrl":"https://b.example"}))` → "\u0000\u0000\u0000\u0000\u0000https://a.example\u0000null"
- `merge({"localeBaseUrls":{"de":"https://a.example"}}, {"localeBaseUrls":{"en":"https://b.example"}})` → {"localeBaseUrls":{"de":"https://a.example"}}
- `key(merge({"localeBaseUrls":{"de":"https://a.example"}}, {"localeBaseUrls":{"en":"https://b.example"}}))` → "\u0000\u0000\u0000\u0000\u0000\u0000{\"de\":\"https://a.example\"}"

## applyI18nRuntimeOverrides

- `apply(plain, {})` → {"same":true,"defaultLocale":"en","dateBuild":"b1","locales":["en","de","ru"],"warnings":[]}
- `apply(plain, {"defaultLocale":"de"})` → {"same":false,"defaultLocale":"de","dateBuild":"b1","locales":["en","de","ru"],"warnings":[]}
- `apply(plain, {"disabledLocales":["ru"]})` → {"same":false,"defaultLocale":"en","dateBuild":"b1","locales":["en","de","ru:off"],"warnings":[]}
- `apply(plain, {"strategy":"no_prefix"})` → {"same":true,"defaultLocale":"en","dateBuild":"b1","locales":["en","de","ru"],"warnings":["[nuxt-i18n-micro] runtime i18n strategy override is ignored: \"no_prefix\" (build strategy: \"prefix\"). Build a separate artifact for each strategy."]}
- `apply(plain, {"dateBuild":"b2"})` → {"same":false,"defaultLocale":"en","dateBuild":"b2","locales":["en","de","ru"],"warnings":[]}
- `apply(plain, {"metaBaseUrl":"https://cdn.example"})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://cdn.example","dateBuild":"b1","locales":["en","de","ru"],"warnings":[]}
- `apply(plain, {"localeBaseUrls":{"de":"https://de.example.net"}})` → {"same":true,"defaultLocale":"en","dateBuild":"b1","locales":["en","de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored: the build has no locales[].baseUrl."]}
- `apply(plain, {"localeBaseUrls":{"en":"https://example.net"}})` → {"same":true,"defaultLocale":"en","dateBuild":"b1","locales":["en","de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored: the build has no locales[].baseUrl."]}
- `apply(plain, {"localeBaseUrls":{"en":"https://example.net"},"metaBaseUrl":"https://cdn.example"})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://cdn.example","dateBuild":"b1","locales":["en","de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored: the build has no locales[].baseUrl."]}
- `apply(plain, {"localeBaseUrls":{"ru":"https://example.ru"}})` → {"same":true,"defaultLocale":"en","dateBuild":"b1","locales":["en","de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored: the build has no locales[].baseUrl."]}
- `apply(plain, {"localeBaseUrls":{"xx":"https://example.xx"}})` → {"same":true,"defaultLocale":"en","dateBuild":"b1","locales":["en","de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored: the build has no locales[].baseUrl."]}
- `apply(plain, {"localeBaseUrls":{"de":"not a url"}})` → {"same":true,"defaultLocale":"en","dateBuild":"b1","locales":["en","de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored: the build has no locales[].baseUrl."]}
- `apply(plain, {"localeBaseUrls":{"__proto__":"https://evil.example"}})` → {"same":true,"defaultLocale":"en","dateBuild":"b1","locales":["en","de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored: the build has no locales[].baseUrl."]}
- `apply(plain+metaBaseUrl, {})` → {"same":true,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en","de","ru"],"warnings":[]}
- `apply(plain+metaBaseUrl, {"defaultLocale":"de"})` → {"same":false,"defaultLocale":"de","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en","de","ru"],"warnings":[]}
- `apply(plain+metaBaseUrl, {"disabledLocales":["ru"]})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en","de","ru:off"],"warnings":[]}
- `apply(plain+metaBaseUrl, {"strategy":"no_prefix"})` → {"same":true,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en","de","ru"],"warnings":["[nuxt-i18n-micro] runtime i18n strategy override is ignored: \"no_prefix\" (build strategy: \"prefix\"). Build a separate artifact for each strategy."]}
- `apply(plain+metaBaseUrl, {"dateBuild":"b2"})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b2","locales":["en","de","ru"],"warnings":[]}
- `apply(plain+metaBaseUrl, {"metaBaseUrl":"https://cdn.example"})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://cdn.example","dateBuild":"b1","locales":["en","de","ru"],"warnings":[]}
- `apply(plain+metaBaseUrl, {"localeBaseUrls":{"de":"https://de.example.net"}})` → {"same":true,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en","de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored: the build has no locales[].baseUrl."]}
- `apply(plain+metaBaseUrl, {"localeBaseUrls":{"en":"https://example.net"}})` → {"same":true,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en","de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored: the build has no locales[].baseUrl."]}
- `apply(plain+metaBaseUrl, {"localeBaseUrls":{"en":"https://example.net"},"metaBaseUrl":"https://cdn.example"})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://cdn.example","dateBuild":"b1","locales":["en","de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored: the build has no locales[].baseUrl."]}
- `apply(plain+metaBaseUrl, {"localeBaseUrls":{"ru":"https://example.ru"}})` → {"same":true,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en","de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored: the build has no locales[].baseUrl."]}
- `apply(plain+metaBaseUrl, {"localeBaseUrls":{"xx":"https://example.xx"}})` → {"same":true,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en","de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored: the build has no locales[].baseUrl."]}
- `apply(plain+metaBaseUrl, {"localeBaseUrls":{"de":"not a url"}})` → {"same":true,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en","de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored: the build has no locales[].baseUrl."]}
- `apply(plain+metaBaseUrl, {"localeBaseUrls":{"__proto__":"https://evil.example"}})` → {"same":true,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en","de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored: the build has no locales[].baseUrl."]}
- `apply(domains, {})` → {"same":true,"defaultLocale":"en","metaBaseUrl":"https://example.com","dateBuild":"b1","locales":["en@https://example.com","de@https://example.de","ru"],"warnings":[]}
- `apply(domains, {"defaultLocale":"de"})` → {"same":false,"defaultLocale":"de","metaBaseUrl":"https://example.com","dateBuild":"b1","locales":["en@https://example.com","de@https://example.de","ru"],"warnings":[]}
- `apply(domains, {"disabledLocales":["ru"]})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://example.com","dateBuild":"b1","locales":["en@https://example.com","de@https://example.de","ru:off"],"warnings":[]}
- `apply(domains, {"strategy":"no_prefix"})` → {"same":true,"defaultLocale":"en","metaBaseUrl":"https://example.com","dateBuild":"b1","locales":["en@https://example.com","de@https://example.de","ru"],"warnings":["[nuxt-i18n-micro] runtime i18n strategy override is ignored: \"no_prefix\" (build strategy: \"prefix\"). Build a separate artifact for each strategy."]}
- `apply(domains, {"dateBuild":"b2"})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://example.com","dateBuild":"b2","locales":["en@https://example.com","de@https://example.de","ru"],"warnings":[]}
- `apply(domains, {"metaBaseUrl":"https://cdn.example"})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://cdn.example","dateBuild":"b1","locales":["en@https://example.com","de@https://example.de","ru"],"warnings":[]}
- `apply(domains, {"localeBaseUrls":{"de":"https://de.example.net"}})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://example.com","dateBuild":"b1","locales":["en@https://example.com","de@https://de.example.net","ru"],"warnings":[]}
- `apply(domains, {"localeBaseUrls":{"en":"https://example.net"}})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://example.com","dateBuild":"b1","locales":["en@https://example.net","de@https://example.de","ru"],"warnings":[]}
- `apply(domains, {"localeBaseUrls":{"en":"https://example.net"},"metaBaseUrl":"https://cdn.example"})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://cdn.example","dateBuild":"b1","locales":["en@https://example.net","de@https://example.de","ru"],"warnings":[]}
- `apply(domains, {"localeBaseUrls":{"ru":"https://example.ru"}})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://example.com","dateBuild":"b1","locales":["en@https://example.com","de@https://example.de","ru@https://example.ru"],"warnings":[]}
- `apply(domains, {"localeBaseUrls":{"xx":"https://example.xx"}})` → {"same":true,"defaultLocale":"en","metaBaseUrl":"https://example.com","dateBuild":"b1","locales":["en@https://example.com","de@https://example.de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored for xx: no such locale, or no absolute URL."]}
- `apply(domains, {"localeBaseUrls":{"de":"not a url"}})` → {"same":true,"defaultLocale":"en","metaBaseUrl":"https://example.com","dateBuild":"b1","locales":["en@https://example.com","de@https://example.de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored for de: no such locale, or no absolute URL."]}
- `apply(domains, {"localeBaseUrls":{"__proto__":"https://evil.example"}})` → {"same":true,"defaultLocale":"en","metaBaseUrl":"https://example.com","dateBuild":"b1","locales":["en@https://example.com","de@https://example.de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored for __proto__: no such locale, or no absolute URL."]}
- `apply(domains+explicit, {})` → {"same":true,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en@https://example.com","de@https://example.de","ru"],"warnings":[]}
- `apply(domains+explicit, {"defaultLocale":"de"})` → {"same":false,"defaultLocale":"de","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en@https://example.com","de@https://example.de","ru"],"warnings":[]}
- `apply(domains+explicit, {"disabledLocales":["ru"]})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en@https://example.com","de@https://example.de","ru:off"],"warnings":[]}
- `apply(domains+explicit, {"strategy":"no_prefix"})` → {"same":true,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en@https://example.com","de@https://example.de","ru"],"warnings":["[nuxt-i18n-micro] runtime i18n strategy override is ignored: \"no_prefix\" (build strategy: \"prefix\"). Build a separate artifact for each strategy."]}
- `apply(domains+explicit, {"dateBuild":"b2"})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b2","locales":["en@https://example.com","de@https://example.de","ru"],"warnings":[]}
- `apply(domains+explicit, {"metaBaseUrl":"https://cdn.example"})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://cdn.example","dateBuild":"b1","locales":["en@https://example.com","de@https://example.de","ru"],"warnings":[]}
- `apply(domains+explicit, {"localeBaseUrls":{"de":"https://de.example.net"}})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en@https://example.com","de@https://de.example.net","ru"],"warnings":[]}
- `apply(domains+explicit, {"localeBaseUrls":{"en":"https://example.net"}})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en@https://example.net","de@https://example.de","ru"],"warnings":[]}
- `apply(domains+explicit, {"localeBaseUrls":{"en":"https://example.net"},"metaBaseUrl":"https://cdn.example"})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://cdn.example","dateBuild":"b1","locales":["en@https://example.net","de@https://example.de","ru"],"warnings":[]}
- `apply(domains+explicit, {"localeBaseUrls":{"ru":"https://example.ru"}})` → {"same":false,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en@https://example.com","de@https://example.de","ru@https://example.ru"],"warnings":[]}
- `apply(domains+explicit, {"localeBaseUrls":{"xx":"https://example.xx"}})` → {"same":true,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en@https://example.com","de@https://example.de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored for xx: no such locale, or no absolute URL."]}
- `apply(domains+explicit, {"localeBaseUrls":{"de":"not a url"}})` → {"same":true,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en@https://example.com","de@https://example.de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored for de: no such locale, or no absolute URL."]}
- `apply(domains+explicit, {"localeBaseUrls":{"__proto__":"https://evil.example"}})` → {"same":true,"defaultLocale":"en","metaBaseUrl":"https://site.example","dateBuild":"b1","locales":["en@https://example.com","de@https://example.de","ru"],"warnings":["[nuxt-i18n-micro] runtime localeBaseUrls ignored for __proto__: no such locale, or no absolute URL."]}

## configForHost after overrides

- `host({}, example.com)` → {"domain":"example.com","defaultLocale":"en","metaBaseUrl":"https://example.com"}
- `host({}, example.de)` → {"domain":"example.de","defaultLocale":"de","metaBaseUrl":"https://example.de"}
- `host({}, de.example.net)` → {"defaultLocale":"en","metaBaseUrl":"https://example.com"}
- `host({}, example.net)` → {"defaultLocale":"en","metaBaseUrl":"https://example.com"}
- `host({}, evil.test)` → {"defaultLocale":"en","metaBaseUrl":"https://example.com"}
- `host({"localeBaseUrls":{"de":"https://de.example.net"}}, example.com)` → {"domain":"example.com","defaultLocale":"en","metaBaseUrl":"https://example.com"}
- `host({"localeBaseUrls":{"de":"https://de.example.net"}}, example.de)` → {"defaultLocale":"en","metaBaseUrl":"https://example.com"}
- `host({"localeBaseUrls":{"de":"https://de.example.net"}}, de.example.net)` → {"domain":"de.example.net","defaultLocale":"de","metaBaseUrl":"https://de.example.net"}
- `host({"localeBaseUrls":{"de":"https://de.example.net"}}, example.net)` → {"defaultLocale":"en","metaBaseUrl":"https://example.com"}
- `host({"localeBaseUrls":{"de":"https://de.example.net"}}, evil.test)` → {"defaultLocale":"en","metaBaseUrl":"https://example.com"}
- `host({"localeBaseUrls":{"en":"https://example.net"}}, example.com)` → {"defaultLocale":"en","metaBaseUrl":"https://example.com"}
- `host({"localeBaseUrls":{"en":"https://example.net"}}, example.de)` → {"domain":"example.de","defaultLocale":"de","metaBaseUrl":"https://example.de"}
- `host({"localeBaseUrls":{"en":"https://example.net"}}, de.example.net)` → {"defaultLocale":"en","metaBaseUrl":"https://example.com"}
- `host({"localeBaseUrls":{"en":"https://example.net"}}, example.net)` → {"domain":"example.net","defaultLocale":"en","metaBaseUrl":"https://example.net"}
- `host({"localeBaseUrls":{"en":"https://example.net"}}, evil.test)` → {"defaultLocale":"en","metaBaseUrl":"https://example.com"}
