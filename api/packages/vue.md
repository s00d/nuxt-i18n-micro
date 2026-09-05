---
url: 'https://s00d.github.io/nuxt-i18n-micro/api/packages/vue.md'
description: 'Exported API of @i18n-micro/vue, generated from the source.'
---

# `@i18n-micro/vue`

28 exports across 2 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/vue`

```ts
import { /* … */ } from '@i18n-micro/vue'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `CleanTranslation` | type | `string \| number \| boolean \| Translations \| PluralTranslations \| null` |
| `createI18n` | function | `(options: CreateI18nOptions) => I18nPlugin` |
| `defaultPlural` | const | `PluralFunc` |
| `FormatService` | class | 19 members |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `I18nDefaultLocaleKey` | const | `InjectionKey<string>` |
| `I18nGroup` | const | `import("vue/dist/vue").DefineComponent<I18nGroupProps, {}, {}, {}, {}, import("vue/dist/vue").ComponentOptionsMixin, import("vue/dist/vue").ComponentOptionsMixin, {}, string, import("vue/dist/vue").PublicProps, Readonly<I18nGroupProps> & Readonly<{}>, {}, {}, {}, {}, string, import("vue/dist/vue").ComponentProvideOptions, false, {}, any>` |
| `I18nInjectionKey` | const | `InjectionKey<VueI18n>` |
| `I18nLink` | const | `import("vue/dist/vue").DefineComponent<import("vue/dist/vue").ExtractPropTypes<{ to: { type: PropType<string \| { path?: string; }>; required: true; }; activeStyle: { type: PropType<CSSProperties>; default: () => {}; }; localeRoute: { type: PropType<(to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }>; default: undefined; }; }>, () => import("vue/dist/vue").VNode<import("vue/dist/vue").RendererNode, import("vue/dist/vue").RendererElement, { [key: string]: any; }>, {}, {}, {}, import("vue/dist/vue").ComponentOptionsMixin, import("vue/dist/vue").ComponentOptionsMixin, {}, string, import("vue/dist/vue").PublicProps, Readonly<import("vue/dist/vue").ExtractPropTypes<{ to: { type: PropType<string \| { path?: string; }>; required: true; }; activeStyle: { type: PropType<CSSProperties>; default: () => {}; }; localeRoute: { type: PropType<(to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }>; default: undefined; }; }>> & Readonly<{}>, { activeStyle: CSSProperties; localeRoute: (to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }; }, {}, {}, {}, string, import("vue/dist/vue").ComponentProvideOptions, true, {}, any>` |
| `I18nLocalesKey` | const | `InjectionKey<Locale[]>` |
| `I18nPlugin` | type | `Plugin & { global: VueI18n setRoutingStrategy: (strategy: I18nRoutingStrategy) => void }` |
| `I18nRoutingStrategy` | interface | 6 members |
| `I18nSwitcher` | const | `import("vue/dist/vue").DefineComponent<import("vue/dist/vue").ExtractPropTypes<{ customLabels: { type: PropType<Record<string, string>>; default: () => {}; }; customWrapperStyle: { type: PropType<CSSProperties>; default: () => {}; }; customButtonStyle: { type: PropType<CSSProperties>; default: () => {}; }; customDropdownStyle: { type: PropType<CSSProperties>; default: () => {}; }; customItemStyle: { type: PropType<CSSProperties>; default: () => {}; }; customLinkStyle: { type: PropType<CSSProperties>; default: () => {}; }; customActiveLinkStyle: { type: PropType<CSSProperties>; default: () => {}; }; customDisabledLinkStyle: { type: PropType<CSSProperties>; default: () => {}; }; customIconStyle: { type: PropType<CSSProperties>; default: () => {}; }; locales: { type: PropType<Locale[]>; default: undefined; }; currentLocale: { type: PropType<string \| (() => string)>; default: undefined; }; getLocaleName: { type: PropType<() => string \| null>; default: undefined; }; switchLocale: { type: PropType<(locale: string) => void>; default: undefined; }; localeRoute: { type: PropType<(to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }>; default: undefined; }; }>, () => VNode<import("vue/dist/vue").RendererNode, import("vue/dist/vue").RendererElement, { [key: string]: any; }>, {}, {}, {}, import("vue/dist/vue").ComponentOptionsMixin, import("vue/dist/vue").ComponentOptionsMixin, {}, string, import("vue/dist/vue").PublicProps, Readonly<import("vue/dist/vue").ExtractPropTypes<{ customLabels: { type: PropType<Record<string, string>>; default: () => {}; }; customWrapperStyle: { type: PropType<CSSProperties>; default: () => {}; }; customButtonStyle: { type: PropType<CSSProperties>; default: () => {}; }; customDropdownStyle: { type: PropType<CSSProperties>; default: () => {}; }; customItemStyle: { type: PropType<CSSProperties>; default: () => {}; }; customLinkStyle: { type: PropType<CSSProperties>; default: () => {}; }; customActiveLinkStyle: { type: PropType<CSSProperties>; default: () => {}; }; customDisabledLinkStyle: { type: PropType<CSSProperties>; default: () => {}; }; customIconStyle: { type: PropType<CSSProperties>; default: () => {}; }; locales: { type: PropType<Locale[]>; default: undefined; }; currentLocale: { type: PropType<string \| (() => string)>; default: undefined; }; getLocaleName: { type: PropType<() => string \| null>; default: undefined; }; switchLocale: { type: PropType<(locale: string) => void>; default: undefined; }; localeRoute: { type: PropType<(to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }>; default: undefined; }; }>> & Readonly<{}>, { localeRoute: (to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }; customLabels: Record<string, string>; customWrapperStyle: CSSProperties; customButtonStyle: CSSProperties; customDropdownStyle: CSSProperties; customItemStyle: CSSProperties; customLinkStyle: CSSProperties; customActiveLinkStyle: CSSProperties; customDisabledLinkStyle: CSSProperties; customIconStyle: CSSProperties; locales: Locale[]; currentLocale: string \| (() => string); getLocaleName: () => string \| null; switchLocale: (locale: string) => void; }, {}, {}, {}, string, import("vue/dist/vue").ComponentProvideOptions, true, {}, any>` |
| `I18nT` | const | `import("vue/dist/vue").DefineComponent<import("vue/dist/vue").ExtractPropTypes<{ keypath: { type: PropType<TranslationKey>; required: true; }; plural: { type: PropType<number \| string>; }; tag: { type: PropType<string>; default: string; }; params: { type: PropType<Record<string, string \| number \| boolean>>; default: () => {}; }; defaultValue: { type: PropType<string>; default: string; }; html: { type: PropType<boolean>; default: boolean; }; hideIfEmpty: { type: PropType<boolean>; default: boolean; }; customPluralRule: { type: PropType<PluralFunc>; default: null; }; number: { type: PropType<number \| string>; }; date: { type: PropType<Date \| string \| number>; }; relativeDate: { type: PropType<Date \| string \| number>; }; }>, () => string \| VNode<import("vue/dist/vue").RendererNode, import("vue/dist/vue").RendererElement, { [key: string]: any; }>, {}, {}, {}, import("vue/dist/vue").ComponentOptionsMixin, import("vue/dist/vue").ComponentOptionsMixin, {}, string, import("vue/dist/vue").PublicProps, Readonly<import("vue/dist/vue").ExtractPropTypes<{ keypath: { type: PropType<TranslationKey>; required: true; }; plural: { type: PropType<number \| string>; }; tag: { type: PropType<string>; default: string; }; params: { type: PropType<Record<string, string \| number \| boolean>>; default: () => {}; }; defaultValue: { type: PropType<string>; default: string; }; html: { type: PropType<boolean>; default: boolean; }; hideIfEmpty: { type: PropType<boolean>; default: boolean; }; customPluralRule: { type: PropType<PluralFunc>; default: null; }; number: { type: PropType<number \| string>; }; date: { type: PropType<Date \| string \| number>; }; relativeDate: { type: PropType<Date \| string \| number>; }; }>> & Readonly<{}>, { html: boolean; tag: string; params: Record<string, string \| number \| boolean>; defaultValue: string; hideIfEmpty: boolean; customPluralRule: PluralFunc; }, {}, {}, {}, string, import("vue/dist/vue").ComponentProvideOptions, true, {}, any>` |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `Locale` | interface | 11 members |
| `LocaleCode` | type | `string` |
| `Params` | type | `Record<string, string \| number \| boolean>` |
| `PluralFunc` | type | `(key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string \| null` |
| `Translations` | interface | 1 members |
| `useI18n` | function | `(options?: UseI18nOptions) => { instance: VueI18n; locale: import("vue/dist/vue").WritableComputedRef<string, string>; getLocales: () => Locale[]; defaultLocale: () => string; getLocaleName: () => string \| null; localeRoute: (to: string \| { path?: string; }, localeCode?: string) => string \| { path?: string; }; localePath: (to: string \| { path?: string; }, locale?: string) => string; switchLocale: (newLocale: string) => void; t: (key: import("packages/types/dist/index").TranslationKey, params?: import("packages/types/dist/index").Params, defaultValue?: string \| null, routeContext?: unknown) => import("packages/types/dist/index").CleanTranslation; ts: (key: import("packages/types/dist/index").TranslationKey, params?: import("packages/types/dist/index").Params, defaultValue?: string, routeContext?: unknown) => string; tc: (key: import("packages/types/dist/index").TranslationKey, count: number \| import("packages/types/dist/index").Params, defaultValue?: string) => string; tn: { (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }; td: { (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: import("packages/types/dist/index").TranslationKey, routeContext?: unknown) => boolean; resolveTranslations: (routeContext?: unknown) => import("packages/types/dist/index").Translations; setTranslation: (key: import("packages/types/dist/index").TranslationKey, value: unknown) => void; setRoute: (routeName: string) => void; getRoute: () => string; getLocale: () => string; addTranslations: (locale: string, translations: import("packages/types/dist/index").Translations, merge?: boolean) => void; addRouteTranslations: (locale: string, routeName: string, translations: import("packages/types/dist/index").Translations, merge?: boolean) => void; mergeTranslations: (locale: string, routeName: string, translations: import("packages/types/dist/index").Translations) => void; clearCache: () => void; }` |
| `UseI18nOptions` | interface | 2 members |
| `useLocaleHead` | function | `(options?: UseLocaleHeadOptions) => { metaObject: import("vue/dist/vue").Ref<{ htmlAttrs: { lang?: string \| undefined; dir?: "ltr" \| "rtl" \| "auto" \| undefined; }; link: { [x: string]: string \| undefined; rel: string; href: string; hreflang?: string \| undefined; }[]; meta: { [x: string]: string; property: string; content: string; }[]; }, MetaObject \| { htmlAttrs: { lang?: string \| undefined; dir?: "ltr" \| "rtl" \| "auto" \| undefined; }; link: { [x: string]: string \| undefined; rel: string; href: string; hreflang?: string \| undefined; }[]; meta: { [x: string]: string; property: string; content: string; }[]; }>; updateMeta: (canonicalQueryWhitelist?: string[]) => void; }` |
| `UseLocaleHeadOptions` | interface | 5 members |
| `VueI18n` | class | 52 members |
| `VueI18nOptions` | interface | 6 members |

FormatService — 19 members, identical to [`FormatService`](/api/packages/astro).
I18nRoutingStrategy — 6 members, identical to [`I18nRoutingStrategy`](/api/packages/vitepress).

| Member | Type |
| --- | --- |
| `[string]` | `unknown` |
| `baseDefault?` | `boolean \| undefined` |
| `baseUrl?` | `string \| undefined` |
| `code` | `string` |
| `dir?` | `"auto" \| "ltr" \| "rtl" \| undefined` |
| `disabled?` | `boolean \| undefined` |
| `displayName?` | `string \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `iso?` | `string \| undefined` |
| `og?` | `string \| undefined` |
| `seo?` | `boolean \| undefined` |

| Member | Type |
| --- | --- |
| `addDirAttribute?` | `boolean \| undefined` |
| `addSeoAttributes?` | `boolean \| undefined` |
| `baseUrl?` | `string \| (() => string) \| undefined` |
| `hreflangBaseLanguage?` | `boolean \| undefined` |
| `identifierAttribute?` | `string \| undefined` |

| Member | Type |
| --- | --- |
| `_currentRoute` | `private Ref<string, string>` |
| `_fallbackLocale` | `private Ref<string, string>` |
| `_locale` | `private Ref<string, string>` |
| `_revision` | `private Ref<number, number>` |
| `addRouteTranslations` | `(locale: string, routeName: string, translations: Translations, merge?: boolean) => void` |
| `addTranslations` | `(locale: string, translations: Translations, merge?: boolean) => void` |
| `clearCache` | `() => void` |
| `currentRoute` | `Ref<string, string>` |
| `extend` | `<M extends Record<string, unknown>>(methods: M & ThisType<import("packages/vue/src/composer").VueI18n & M>) => import("packages/vue/src/composer").VueI18n & M` |
| `fallbackLocale` | `Ref<string, string>` |
| `formatter` | `FormatService` |
| `getCustomMissingHandler?` | `(() => MissingHandler \| null) \| undefined` |
| `getFallbackLocale` | `() => string` |
| `getLocale` | `() => string` |
| `getMissingContext` | `protected (routeContext?: unknown) => { locale: string; routeName: string; }` |
| `getRoute` | `() => string` |
| `getRouteCache` | `() => Record<string, Translations>` |
| `getStorage` | `() => TranslationStorage` |
| `has` | `(key: TranslationKey, routeContext?: unknown) => boolean` |
| `helper` | `{ hasCache(locale: string, page: string): boolean; getCache(locale: string, routeName: string): Translations \| undefined; setCache(_locale: string, _routeName: string, _cache: Map<string, unknown>): void; hasTranslation(locale: string, key: string): boolean; hasPageTranslation(locale: string, routeName: string): boolean; getTranslation<T = unknown>(locale: string, routeName: string, key: string): T \| null; loadTranslations(locale: string, data: Translations, routeName?: string): void; setTranslations(locale: string, data: Translations, routeName?: string): void; loadPageTranslations(locale: string, routeName: string, data: Translations): void; mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force?: boolean): void; clearCache(): void; }` |
| `listeners` | `private Set<() => void>` |
| `loadRouteTranslationsCore` | `(locale: string, routeName: string, translations: Translations, merge: boolean) => void` |
| `loadTranslationsCore` | `(locale: string, translations: Translations, merge: boolean, routeName?: string) => void` |
| `locale` | `Ref<string, string>` |
| `mergeTranslations` | `(locale: string, routeName: string, translations: Translations) => void` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn` | `boolean` |
| `new` | `(options: VueI18nOptions): VueI18n` |
| `notifyListeners` | `private () => void` |
| `onTranslationsChanged` | `protected () => void` |
| `pluralFunc` | `PluralFunc` |
| `resolveDateTimeFormatArgs` | `private any` |
| `resolveHas` | `protected (key: TranslationKey, routeContext?: unknown) => boolean` |
| `resolveLookup` | `protected (key: TranslationKey, routeContext?: unknown) => unknown \| null` |
| `resolveNumberFormatArgs` | `private any` |
| `resolveRouteName` | `protected (routeContext?: unknown) => string` |
| `resolveTranslations` | `(routeContext?: unknown) => Translations` |
| `resolveTranslationTree` | `protected (lower: Record<string, unknown>, upper: Record<string, unknown>) => Translations` |
| `setRoute` | `(routeName: string) => void` |
| `setTranslation` | `(key: TranslationKey, value: unknown) => void` |
| `storage` | `TranslationStorage` |
| `subscribeToChanges` | `(cb: () => void) => () => void` |
| `t` | `(key: TranslationKey, params?: Params, defaultValue?: string \| null, routeContext?: unknown) => CleanTranslation` |
| `tc` | `(key: TranslationKey, count: number \| Params, defaultValue?: string) => string` |
| `td` | `{ (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }` |
| `tdr` | `(value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string` |
| `tn` | `{ (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }` |
| `touch` | `protected () => void` |
| `ts` | `(key: TranslationKey, params?: Params, defaultValue?: string, routeContext?: unknown) => string` |
| `warnDev` | `protected (message: string) => void` |
| `warnMissing` | `protected (key: TranslationKey, routeContext?: unknown) => void` |
| `warnMissingFormat` | `protected (kind: "number" \| "datetime", key: string, locale: string) => void` |

```ts
import { /* … */ } from '@i18n-micro/vue/router'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `createVueRouterAdapter` | function | `(router: Router, locales: Locale[], defaultLocale: string) => I18nRoutingStrategy` |
| `I18nRoutingStrategy` | interface | 6 members |

I18nRoutingStrategy — 6 members, identical to [`I18nRoutingStrategy`](/api/packages/vitepress).

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
