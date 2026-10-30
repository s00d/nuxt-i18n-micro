---
title: '@i18n-micro/vue'
description: 'Exported API of @i18n-micro/vue, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/vue`

30 exports across 2 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/contributing/maintenance-commands#api-surface)
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
| `FormatService` | class | 21 members |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `I18nDefaultLocaleKey` | const | `InjectionKey<string>` |
| `I18nGroup` | const | `import("vue").DefineComponent<I18nGroupProps, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<I18nGroupProps> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>` |
| `I18nInjectionKey` | const | `InjectionKey<VueI18n>` |
| `I18nLink` | const | `import("vue").DefineComponent<import("vue").ExtractPropTypes<{ to: { type: PropType<I18nRouteTarget>; required: true; }; activeStyle: { type: PropType<CSSProperties>; default: () => {}; }; localeRoute: { type: PropType<(to: I18nRouteTarget, locale?: string) => string \| { path?: string; }>; default: undefined; }; }>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, { [key: string]: any; }>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{ to: { type: PropType<I18nRouteTarget>; required: true; }; activeStyle: { type: PropType<CSSProperties>; default: () => {}; }; localeRoute: { type: PropType<(to: I18nRouteTarget, locale?: string) => string \| { path?: string; }>; default: undefined; }; }>> & Readonly<{}>, { activeStyle: CSSProperties; localeRoute: (to: I18nRouteTarget, locale?: string) => string \| { path?: string; }; }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>` |
| `I18nLocalesKey` | const | `InjectionKey<Locale[]>` |
| `I18nPlugin` | type | `Plugin & { global: VueI18n setRoutingStrategy: (strategy: I18nRoutingStrategy) => void }` |
| `I18nRouteTarget` | type | `string \| { path?: string; name?: string \| symbol; params?: object; query?: object; hash?: string }` |
| `I18nRoutingStrategy` | interface | 7 members |
| `I18nSwitcher` | const | `import("vue").DefineComponent<import("vue").ExtractPropTypes<{ customLabels: { type: PropType<Record<string, string>>; default: () => {}; }; customWrapperStyle: { type: PropType<CSSProperties>; default: () => {}; }; customButtonStyle: { type: PropType<CSSProperties>; default: () => {}; }; customDropdownStyle: { type: PropType<CSSProperties>; default: () => {}; }; customItemStyle: { type: PropType<CSSProperties>; default: () => {}; }; customLinkStyle: { type: PropType<CSSProperties>; default: () => {}; }; customActiveLinkStyle: { type: PropType<CSSProperties>; default: () => {}; }; customDisabledLinkStyle: { type: PropType<CSSProperties>; default: () => {}; }; customIconStyle: { type: PropType<CSSProperties>; default: () => {}; }; locales: { type: PropType<Locale[]>; default: undefined; }; currentLocale: { type: PropType<string \| (() => string)>; default: undefined; }; getLocaleName: { type: PropType<() => string \| null>; default: undefined; }; switchLocale: { type: PropType<(locale: string) => void>; default: undefined; }; localeRoute: { type: PropType<(to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }>; default: undefined; }; }>, () => unknown, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{ customLabels: { type: PropType<Record<string, string>>; default: () => {}; }; customWrapperStyle: { type: PropType<CSSProperties>; default: () => {}; }; customButtonStyle: { type: PropType<CSSProperties>; default: () => {}; }; customDropdownStyle: { type: PropType<CSSProperties>; default: () => {}; }; customItemStyle: { type: PropType<CSSProperties>; default: () => {}; }; customLinkStyle: { type: PropType<CSSProperties>; default: () => {}; }; customActiveLinkStyle: { type: PropType<CSSProperties>; default: () => {}; }; customDisabledLinkStyle: { type: PropType<CSSProperties>; default: () => {}; }; customIconStyle: { type: PropType<CSSProperties>; default: () => {}; }; locales: { type: PropType<Locale[]>; default: undefined; }; currentLocale: { type: PropType<string \| (() => string)>; default: undefined; }; getLocaleName: { type: PropType<() => string \| null>; default: undefined; }; switchLocale: { type: PropType<(locale: string) => void>; default: undefined; }; localeRoute: { type: PropType<(to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }>; default: undefined; }; }>> & Readonly<{}>, { localeRoute: (to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }; customWrapperStyle: CSSProperties; customButtonStyle: CSSProperties; customDropdownStyle: CSSProperties; customItemStyle: CSSProperties; customLinkStyle: CSSProperties; customActiveLinkStyle: CSSProperties; customDisabledLinkStyle: CSSProperties; customIconStyle: CSSProperties; customLabels: Record<string, string>; locales: Locale[]; currentLocale: string \| (() => string); getLocaleName: () => string \| null; switchLocale: (locale: string) => void; }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>` |
| `I18nT` | const | `FunctionalComponent<I18nTProps, {}, any, {}> & { displayName: string; inheritAttrs: boolean; props: { keypath: { type: PropType<TranslationKey>; required: boolean; }; plural: { type: PropType<number \| string \| null>; }; tag: { type: StringConstructor; default: string; }; params: { type: PropType<Record<string, string \| number \| boolean>>; }; defaultValue: { type: StringConstructor; default: string; }; html: { type: BooleanConstructor; default: boolean; }; hideIfEmpty: { type: BooleanConstructor; default: boolean; }; customPluralRule: { type: PropType<PluralFunc>; default: null; }; number: { type: PropType<number \| string \| null>; }; date: { type: PropType<Date \| string \| number \| null>; }; relativeDate: { type: PropType<Date \| string \| number \| null>; }; }; }` |
| `I18nTProps` | interface | 11 members |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `Locale` | interface | 11 members |
| `LocaleCode` | type | `string` |
| `Params` | type | `Record<string, string \| number \| boolean>` |
| `PluralFunc` | type | `(key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string \| null` |
| `Translations` | interface | 1 members |
| `useI18n` | function | `(options?: UseI18nOptions) => { instance: VueI18n; locale: import("vue").WritableComputedRef<string, string>; getLocales: () => Locale[]; defaultLocale: () => string; getLocaleName: () => string \| null; localeRoute: (to: I18nRouteTarget, localeCode?: string) => I18nRouteTarget; localePath: (to: I18nRouteTarget, locale?: string) => string; switchLocale: (newLocale: string) => void; t: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null, routeContext?: unknown) => import("@i18n-micro/types").CleanTranslation; ts: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string, routeContext?: unknown) => string; tc: (key: import("@i18n-micro/types").TranslationKey, count: number \| import("@i18n-micro/types").Params, defaultValue?: string) => string; tn: { (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }; td: { (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: import("@i18n-micro/types").TranslationKey, routeContext?: unknown) => boolean; resolveTranslations: (routeContext?: unknown) => import("@i18n-micro/types").Translations; setTranslation: (key: import("@i18n-micro/types").TranslationKey, value: unknown) => void; setRoute: (routeName: string) => void; getRoute: () => string; getLocale: () => string; addTranslations: (locale: string, translations: import("@i18n-micro/types").Translations, merge?: boolean) => void; addRouteTranslations: (locale: string, routeName: string, translations: import("@i18n-micro/types").Translations, merge?: boolean) => void; mergeTranslations: (locale: string, routeName: string, translations: import("@i18n-micro/types").Translations) => void; clearCache: () => void; }` |
| `UseI18nOptions` | interface | 2 members |
| `useLocaleHead` | function | `(options?: UseLocaleHeadOptions) => { metaObject: import("vue").Ref<{ htmlAttrs: { [x: string]: string \| undefined; lang?: string \| undefined; dir?: "ltr" \| "rtl" \| "auto" \| undefined; }; link: { [x: string]: string \| undefined; rel: string; href: string; hreflang?: string \| undefined; }[]; meta: { [x: string]: string; property: string; content: string; }[]; }, LocaleHead \| { htmlAttrs: { [x: string]: string \| undefined; lang?: string \| undefined; dir?: "ltr" \| "rtl" \| "auto" \| undefined; }; link: { [x: string]: string \| undefined; rel: string; href: string; hreflang?: string \| undefined; }[]; meta: { [x: string]: string; property: string; content: string; }[]; }>; updateMeta: (canonicalQueryWhitelist?: string[]) => void; }` |
| `UseLocaleHeadOptions` | interface | 5 members |
| `VueI18n` | class | 61 members |
| `VueI18nOptions` | interface | 10 members |

<code>FormatService</code> — 21 members, identical to [`FormatService`](/api/packages/astro).

<code>I18nRoutingStrategy</code> — 7 members, identical to [`I18nRoutingStrategy`](/api/packages/vitepress).

<details>
<summary><code>I18nTProps</code> — 11 members</summary>

| Member | Type |
| --- | --- |
| `customPluralRule?` | `PluralFunc \| null \| undefined` |
| `date?` | `string \| number \| Date \| null \| undefined` |
| `defaultValue?` | `string \| undefined` |
| `hideIfEmpty?` | `boolean \| undefined` |
| `html?` | `boolean \| undefined` |
| `keypath` | `string` |
| `number?` | `string \| number \| null \| undefined` |
| `params?` | `Record<string, string \| number \| boolean> \| undefined` |
| `plural?` | `string \| number \| null \| undefined` |
| `relativeDate?` | `string \| number \| Date \| null \| undefined` |
| `tag?` | `string \| undefined` |

</details>

<code>Locale</code> — 11 members, identical to [`Locale`](/api/packages/react).

<code>Translations</code> — 1 members, identical to [`Translations`](/api/packages/types).

<code>UseI18nOptions</code> — 2 members, identical to [`UseI18nOptions`](/api/packages/preact).

<details>
<summary><code>UseLocaleHeadOptions</code> — 5 members</summary>

| Member | Type |
| --- | --- |
| `addDirAttribute?` | `boolean \| undefined` |
| `addSeoAttributes?` | `boolean \| undefined` |
| `baseUrl?` | `string \| (() => string) \| undefined` |
| `hreflangBaseLanguage?` | `boolean \| undefined` |
| `identifierAttribute?` | `string \| undefined` |

</details>

<details>
<summary><code>VueI18n</code> — 61 members</summary>

| Member | Type |
| --- | --- |
| `_currentRoute` | `private Ref<string, string>` |
| `_fallbackLocale` | `private Ref<string, string>` |
| `_locale` | `private Ref<string, string>` |
| `_revision` | `private Ref<number, number>` |
| `activeKey` | `private any` |
| `activeRootKey` | `private any` |
| `addRouteTranslations` | `(locale: string, routeName: string, translations: Translations, merge?: boolean) => void` |
| `addTranslations` | `(locale: string, translations: Translations, merge?: boolean) => void` |
| `clearCache` | `() => void` |
| `currentRoute` | `Ref<string, string>` |
| `extend` | `<M extends Record<string, unknown>>(methods: M & ThisType<import("../../vue/src").VueI18n & M>) => import("../../vue/src").VueI18n & M` |
| `fallbackKey` | `private any` |
| `fallbackLocale` | `Ref<string, string>` |
| `fallbackRootKey` | `private any` |
| `formatArgs` | `private any` |
| `formatter` | `FormatService` |
| `getCustomMissingHandler?` | `(() => MissingHandler \| null) \| undefined` |
| `getFallbackLocale` | `() => string` |
| `getLocale` | `() => string` |
| `getMissingContext` | `protected (routeContext?: unknown) => { locale: string; routeName: string; }` |
| `getRoute` | `() => string` |
| `getRouteCache` | `() => Record<string, Translations>` |
| `getStorage` | `() => TranslationStorage` |
| `has` | `(key: TranslationKey, routeContext?: unknown) => boolean` |
| `helper` | `TranslationHelper` |
| `listeners` | `private Set<() => void>` |
| `loadRouteTranslationsCore` | `(locale: string, routeName: string, translations: Translations, merge: boolean) => void` |
| `loadTranslationsCore` | `(locale: string, translations: Translations, merge: boolean, routeName?: string) => void` |
| `locale` | `Ref<string, string>` |
| `localeIso` | `private any` |
| `lookupLocale` | `private any` |
| `mergeTranslations` | `(locale: string, routeName: string, translations: Translations) => void` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn` | `boolean` |
| `new` | `(options: VueI18nOptions): VueI18n` |
| `notifyListeners` | `private () => void` |
| `onTranslationsChanged` | `protected () => void` |
| `pluralFunc` | `PluralFunc` |
| `pluralLocale` | `() => string` |
| `pluralTag` | `private any` |
| `resolveHas` | `protected (key: TranslationKey, routeContext?: unknown) => boolean` |
| `resolveLookup` | `protected (key: TranslationKey, routeContext?: unknown) => unknown \| null` |
| `resolveRouteName` | `protected (routeContext?: unknown) => string` |
| `resolveTranslations` | `(routeContext?: unknown) => Translations` |
| `resolveTranslationTree` | `protected (lower: Record<string, unknown>, upper: Record<string, unknown>) => Translations` |
| `setLocaleIso` | `(localeIso: Record<string, string>) => void` |
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
| `write` | `private any` |

</details>

<details>
<summary><code>VueI18nOptions</code> — 10 members</summary>

| Member | Type |
| --- | --- |
| `datetimeFormats?` | `DateTimeFormatsConfig \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `locale` | `string` |
| `localeIso?` | `Record<string, string> \| undefined` |
| `messages?` | `Record<string, Translations> \| undefined` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `numberFormats?` | `NumberFormatsConfig \| undefined` |
| `plural?` | `PluralFunc \| undefined` |
| `timeZone?` | `string \| undefined` |

</details>
## `@i18n-micro/vue/router`

```ts
import { /* … */ } from '@i18n-micro/vue/router'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `createVueRouterAdapter` | function | `(router: Router, locales: Locale[], defaultLocale: string) => I18nRoutingStrategy` |
| `I18nRoutingStrategy` | interface | 7 members |

<code>I18nRoutingStrategy</code> — 7 members, identical to [`I18nRoutingStrategy`](/api/packages/vitepress).

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
