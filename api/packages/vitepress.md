---
url: 'https://s00d.github.io/nuxt-i18n-micro/api/packages/vitepress.md'
description: 'Exported API of @i18n-micro/vitepress, generated from the source.'
---

# `@i18n-micro/vitepress`

56 exports across 4 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/vitepress`

```ts
import { /* … */ } from '@i18n-micro/vitepress'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `CleanTranslation` | type | `string \| number \| boolean \| Translations \| PluralTranslations \| null` |
| `createI18n` | function | `(options: CreateI18nOptions) => CreateI18nResult` |
| `CreateI18nOptions` | interface | 12 members |
| `CreateI18nResult` | type | ``I18nPlugin & PathMethods & { /** Same as `.global` (VueI18n + path methods). */ i18n: I18nPlugin['global'] & PathMethods enhanceApp: (ctx: { app: App; router: VitePressRouterLike; siteData?: Ref<VitePressSiteDataLike> \| VitePressSiteDataLike }) => void }`` |
| `defaultPlural` | const | `PluralFunc` |
| `FormatService` | class | 19 members |
| `getLocaleFromPath` | function | `(path: string, localeCodes: string[], defaultLocale: string, localeKeyToCode?: Record<string, string>, base?: string) => string` |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `I18nGroup` | const | `DefineComponent<I18nGroupProps, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<I18nGroupProps> & Readonly<{}>, {}, {}, {}, {}, string, ComponentProvideOptions, false, {}, any>` |
| `I18nLink` | const | `DefineComponent<ExtractPropTypes<{ to: { type: PropType<string \| { path?: string; }>; required: true; }; activeStyle: { type: PropType<CSSProperties>; default: () => {}; }; localeRoute: { type: PropType<(to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }>; default: undefined; }; }>, () => VNode<RendererNode, RendererElement, { [key: string]: any; }>, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<{ to: { type: PropType<string \| { path?: string; }>; required: true; }; activeStyle: { type: PropType<CSSProperties>; default: () => {}; }; localeRoute: { type: PropType<(to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }>; default: undefined; }; }>> & Readonly<{}>, { activeStyle: CSSProperties; localeRoute: (to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }; }, {}, {}, {}, string, ComponentProvideOptions, true, {}, any>` |
| `I18nPlugin` | type | `Plugin_2 & { global: VueI18n; setRoutingStrategy: (strategy: I18nRoutingStrategy) => void; }` |
| `I18nRoutingStrategy` | interface | 6 members |
| `I18nSwitcher` | const | `DefineComponent<ExtractPropTypes<{ customLabels: { type: PropType<Record<string, string>>; default: () => {}; }; customWrapperStyle: { type: PropType<CSSProperties>; default: () => {}; }; customButtonStyle: { type: PropType<CSSProperties>; default: () => {}; }; customDropdownStyle: { type: PropType<CSSProperties>; default: () => {}; }; customItemStyle: { type: PropType<CSSProperties>; default: () => {}; }; customLinkStyle: { type: PropType<CSSProperties>; default: () => {}; }; customActiveLinkStyle: { type: PropType<CSSProperties>; default: () => {}; }; customDisabledLinkStyle: { type: PropType<CSSProperties>; default: () => {}; }; customIconStyle: { type: PropType<CSSProperties>; default: () => {}; }; locales: { type: PropType<Locale[]>; default: undefined; }; currentLocale: { type: PropType<string \| (() => string)>; default: undefined; }; getLocaleName: { type: PropType<() => string \| null>; default: undefined; }; switchLocale: { type: PropType<(locale: string) => void>; default: undefined; }; localeRoute: { type: PropType<(to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }>; default: undefined; }; }>, () => VNode<RendererNode, RendererElement, { [key: string]: any; }>, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<{ customLabels: { type: PropType<Record<string, string>>; default: () => {}; }; customWrapperStyle: { type: PropType<CSSProperties>; default: () => {}; }; customButtonStyle: { type: PropType<CSSProperties>; default: () => {}; }; customDropdownStyle: { type: PropType<CSSProperties>; default: () => {}; }; customItemStyle: { type: PropType<CSSProperties>; default: () => {}; }; customLinkStyle: { type: PropType<CSSProperties>; default: () => {}; }; customActiveLinkStyle: { type: PropType<CSSProperties>; default: () => {}; }; customDisabledLinkStyle: { type: PropType<CSSProperties>; default: () => {}; }; customIconStyle: { type: PropType<CSSProperties>; default: () => {}; }; locales: { type: PropType<Locale[]>; default: undefined; }; currentLocale: { type: PropType<string \| (() => string)>; default: undefined; }; getLocaleName: { type: PropType<() => string \| null>; default: undefined; }; switchLocale: { type: PropType<(locale: string) => void>; default: undefined; }; localeRoute: { type: PropType<(to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }>; default: undefined; }; }>> & Readonly<{}>, { localeRoute: (to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }; customLabels: Record<string, string>; customWrapperStyle: CSSProperties; customButtonStyle: CSSProperties; customDropdownStyle: CSSProperties; customItemStyle: CSSProperties; customLinkStyle: CSSProperties; customActiveLinkStyle: CSSProperties; customDisabledLinkStyle: CSSProperties; customIconStyle: CSSProperties; locales: Locale[]; currentLocale: string \| (() => string); getLocaleName: () => string \| null; switchLocale: (locale: string) => void; }, {}, {}, {}, string, ComponentProvideOptions, true, {}, any>` |
| `I18nT` | const | `DefineComponent<ExtractPropTypes<{ keypath: { type: PropType<TranslationKey>; required: true; }; plural: { type: PropType<number \| string>; }; tag: { type: PropType<string>; default: string; }; params: { type: PropType<Record<string, string \| number \| boolean>>; default: () => {}; }; defaultValue: { type: PropType<string>; default: string; }; html: { type: PropType<boolean>; default: boolean; }; hideIfEmpty: { type: PropType<boolean>; default: boolean; }; customPluralRule: { type: PropType<PluralFunc>; default: null; }; number: { type: PropType<number \| string>; }; date: { type: PropType<Date \| string \| number>; }; relativeDate: { type: PropType<Date \| string \| number>; }; }>, () => string \| VNode<RendererNode, RendererElement, { [key: string]: any; }>, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<{ keypath: { type: PropType<TranslationKey>; required: true; }; plural: { type: PropType<number \| string>; }; tag: { type: PropType<string>; default: string; }; params: { type: PropType<Record<string, string \| number \| boolean>>; default: () => {}; }; defaultValue: { type: PropType<string>; default: string; }; html: { type: PropType<boolean>; default: boolean; }; hideIfEmpty: { type: PropType<boolean>; default: boolean; }; customPluralRule: { type: PropType<PluralFunc>; default: null; }; number: { type: PropType<number \| string>; }; date: { type: PropType<Date \| string \| number>; }; relativeDate: { type: PropType<Date \| string \| number>; }; }>> & Readonly<{}>, { html: boolean; tag: string; params: Record<string, string \| number \| boolean>; defaultValue: string; hideIfEmpty: boolean; customPluralRule: PluralFunc; }, {}, {}, {}, string, ComponentProvideOptions, true, {}, any>` |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `Locale` | interface | 11 members |
| `LocaleCode` | type | `string` |
| `messagesFromGlob` | function | `(modules: Record<string, { default: Translations; } \| Translations>) => Record<string, Translations>` |
| `Params` | type | `Record<string, string \| number \| boolean>` |
| `PathMethods` | type | `Pick< VitePressRouterAdapter, 'localizePath' \| 'switchLocalePath' \| 'getLocaleFromPath' \| 'removeLocaleFromPath' \| 'routeNameFromPath' >` |
| `PluralFunc` | type | `(key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string \| null` |
| `routeNameFromPath` | function | `(path: string, localeCodes: string[], defaultLocale?: string, localeKeyToCode?: Record<string, string>, base?: string) => string` |
| `stripSiteBase` | function | `(path: string, base?: string) => string` |
| `Translations` | interface | 1 members |
| `useI18n` | function | `(options?: UseI18nOptions) => { instance: VueI18n; locale: WritableComputedRef<string, string>; getLocales: () => Locale[]; defaultLocale: () => string; getLocaleName: () => string \| null; localeRoute: (to: string \| { path?: string; }, localeCode?: string) => string \| { path?: string; }; localePath: (to: string \| { path?: string; }, locale?: string) => string; switchLocale: (newLocale: string) => void; t: (key: TranslationKey, params?: Params, defaultValue?: string \| null, routeContext?: unknown) => CleanTranslation; ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeContext?: unknown) => string; tc: (key: TranslationKey, count: number \| Params, defaultValue?: string) => string; tn: { (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }; td: { (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: TranslationKey, routeContext?: unknown) => boolean; resolveTranslations: (routeContext?: unknown) => Translations; setTranslation: (key: TranslationKey, value: unknown) => void; setRoute: (routeName: string) => void; getRoute: () => string; getLocale: () => string; addTranslations: (locale: string, translations: Translations, merge?: boolean) => void; addRouteTranslations: (locale: string, routeName: string, translations: Translations, merge?: boolean) => void; mergeTranslations: (locale: string, routeName: string, translations: Translations) => void; clearCache: () => void; }` |
| `UseI18nOptions` | interface | 2 members |
| `VirtualI18nConfig` | interface | 10 members |
| `VitePressSiteDataLike` | interface | 1 members |
| `VitePressUserConfigLike` | interface | 7 members |
| `VueI18nOptions` | interface | 6 members |
| `WithI18nOptions` | interface | 20 members |

| Member | Type |
| --- | --- |
| `base?` | `string \| undefined` |
| `defaultLocale?` | `string \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `locale` | `string` |
| `localeKeyToCode?` | `Record<string, string> \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `messages?` | `Record<string, Translations> \| undefined` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `plural?` | `PluralFunc \| undefined` |
| `routeMessages?` | `Record<string, Record<string, Translations>> \| undefined` |
| `syncWithVitePress?` | `boolean \| undefined` |

| Member | Type |
| --- | --- |
| `getCurrentPath` | `() => string` |
| `getRoute?` | `(() => { fullPath: string; query: Record<string, unknown>; }) \| undefined` |
| `linkComponent?` | `string \| Component \| undefined` |
| `push` | `(target: { path: string; }) => void` |
| `replace` | `(target: { path: string; }) => void` |
| `resolvePath?` | `((to: string \| { path?: string; }, locale: string) => string \| { path?: string; }) \| undefined` |

| Member | Type |
| --- | --- |
| `base?` | `string \| undefined` |
| `defaultLocale` | `string` |
| `disablePageLocales` | `boolean` |
| `fallbackLocale` | `string` |
| `localeCodes` | `string[]` |
| `localeKeyToCode` | `Record<string, string>` |
| `locales` | `Locale[]` |
| `missingWarn` | `boolean` |
| `syncWithVitePress` | `boolean` |
| `translationDir` | `string` |

| Member | Type |
| --- | --- |
| `locales?` | `Record<string, { lang?: string; link?: string; label?: string; }> \| undefined` |

| Member | Type |
| --- | --- |
| `[string]` | `unknown` |
| `base?` | `string \| undefined` |
| `locales?` | `Record<string, unknown> \| undefined` |
| `themeConfig?` | `Record<string, unknown> \| null \| undefined` |
| `transformHead?` | `((...args: any[]) => any) \| undefined` |
| `transformPageData?` | `((...args: any[]) => any) \| undefined` |
| `vite?` | `{ [key: string]: unknown; plugins?: Plugin[] \| Plugin[][]; ssr?: { noExternal?: string \| true \| Array<string \| RegExp>; [key: string]: unknown; }; } \| undefined` |

| Member | Type |
| --- | --- |
| `base?` | `string \| undefined` |
| `canonicalQueryWhitelist?` | `string[] \| undefined` |
| `defaultLocale?` | `string \| undefined` |
| `disablePageLocales?` | `boolean \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `hreflangBaseLanguage?` | `boolean \| undefined` |
| `i18nRouting?` | `boolean \| undefined` |
| `locale` | `string` |
| `localeKeyToCode?` | `Record<string, string> \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `messages?` | `Record<string, Translations> \| undefined` |
| `meta?` | `boolean \| undefined` |
| `metaBaseUrl?` | `string \| undefined` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `plural?` | `PluralFunc \| undefined` |
| `routeMessages?` | `Record<string, Record<string, Translations>> \| undefined` |
| `syncWithVitePress?` | `boolean \| undefined` |
| `translationDir?` | `string \| undefined` |
| `warnOnLocaleMismatch?` | `boolean \| undefined` |

```ts
import { /* … */ } from '@i18n-micro/vitepress/config'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `buildVitePressLocaleHead` | function | `(options: BuildVitePressLocaleHeadOptions) => VitePressLocaleHeadObject` |
| `BuildVitePressLocaleHeadOptions` | interface | 12 members |
| `buildVitePressLocales` | function | `(locales: Locale[], defaultLocale: string, options?: BuildVitePressLocalesOptions) => Record<string, VitePressLocaleEntry>` |
| `BuildVitePressLocalesOptions` | interface | 1 members |
| `relativePathToRoutePath` | function | `(relativePath: string) => string` |
| `VirtualI18nConfig` | interface | 10 members |
| `VitePressHeadTuple` | type | `[string, Record<string, string>]` |
| `VitePressLocaleEntry` | interface | 3 members |
| `VitePressLocaleHeadObject` | interface | 2 members |
| `VitePressUserConfigLike` | interface | 7 members |
| `warnLocaleMismatch` | function | `(config: VitePressUserConfigLike, options: WithI18nOptions) => void` |
| `withI18n` | function | `<T extends VitePressUserConfigLike>(config: T, options: WithI18nOptions) => T` |
| `WithI18nOptions` | interface | 20 members |

| Member | Type |
| --- | --- |
| `addDirAttribute?` | `boolean \| undefined` |
| `addSeoAttributes?` | `boolean \| undefined` |
| `base?` | `string \| undefined` |
| `canonicalQueryWhitelist?` | `string[] \| undefined` |
| `defaultLocale` | `string` |
| `hreflangBaseLanguage?` | `boolean \| undefined` |
| `identifierAttribute?` | `string \| undefined` |
| `localeKeyToCode?` | `Record<string, string> \| undefined` |
| `locales` | `Locale[]` |
| `metaBaseUrl?` | `string \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `path` | `string` |

| Member | Type |
| --- | --- |
| `localeKeyToCode?` | `Record<string, string> \| undefined` |

| Member | Type |
| --- | --- |
| `label` | `string` |
| `lang` | `string` |
| `link?` | `string \| undefined` |

| Member | Type |
| --- | --- |
| `head` | `VitePressHeadTuple[]` |
| `htmlAttrs` | `{ lang?: string; dir?: "ltr" \| "rtl" \| "auto"; }` |

```ts
import { /* … */ } from '@i18n-micro/vitepress/node'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `buildVitePressLocales` | function | `(locales: Locale[], defaultLocale: string, options?: BuildVitePressLocalesOptions) => Record<string, VitePressLocaleEntry>` |
| `BuildVitePressLocalesOptions` | interface | 1 members |
| `createI18n` | function | `(options: CreateI18nOptions) => NodeI18n` |
| `CreateI18nOptions` | interface | 11 members |
| `I18nOptions` | interface | 7 members |
| `LoadedTranslations` | interface | 2 members |
| `loadRootTranslations` | function | `(dir: string, disablePageLocales?: boolean) => Promise<Record<string, Translations>>` |
| `loadTranslations` | function | `(dir: string, disablePageLocales?: boolean) => Promise<LoadedTranslations>` |
| `NodeI18n` | type | `I18n & PathMethods` |
| `VitePressLocaleEntry` | interface | 3 members |

BuildVitePressLocalesOptions — 1 members, identical to `BuildVitePressLocalesOptions` above.

| Member | Type |
| --- | --- |
| `base?` | `string \| undefined` |
| `defaultLocale?` | `string \| undefined` |
| `disablePageLocales?` | `boolean \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `locale` | `string` |
| `localeKeyToCode?` | `Record<string, string> \| undefined` |
| `locales?` | `Locale[] \| string[] \| undefined` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `plural?` | `PluralFunc \| undefined` |
| `translationDir?` | `string \| undefined` |

```ts
import { /* … */ } from '@i18n-micro/vitepress/theme'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `defineI18nTheme` | function | `<T extends Theme>(base: T, options?: DefineI18nThemeOptions) => T` |
| `DefineI18nThemeOptions` | interface | 7 members |

| Member | Type |
| --- | --- |
| `config?` | `VirtualI18nConfig \| undefined` |
| `enhanceApp?` | `((ctx: import("vitepress/types/index").EnhanceAppContext) => import("vitepress/types/shared").Awaitable<void>) \| undefined` |
| `localeKeyToCode?` | `Record<string, string> \| undefined` |
| `messages?` | `Record<string, Translations> \| undefined` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `plural?` | `PluralFunc \| undefined` |
| `routeMessages?` | `Record<string, Record<string, Translations>> \| undefined` |

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
