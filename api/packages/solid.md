---
url: 'https://s00d.github.io/nuxt-i18n-micro/api/packages/solid.md'
description: 'Exported API of @i18n-micro/solid, generated from the source.'
---

# `@i18n-micro/solid`

33 exports across 1 entry point.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/solid`

```ts
import { /* … */ } from '@i18n-micro/solid'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `CleanTranslation` | type | `string \| number \| boolean \| Translations \| PluralTranslations \| null` |
| `createI18n` | function | `(options: SolidI18nOptions) => SolidI18n` |
| `createSolidRouterAdapter` | function | `(locales: Locale[], defaultLocale: string, navigate: NavigateFunction, location: Location) => I18nRoutingStrategy & { getCurrentPathAccessor: Accessor<string>; }` |
| `defaultPlural` | const | `PluralFunc` |
| `FormatService` | class | 19 members |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `I18nContext` | const | `import("solid-js/types/index").Context<SolidI18n \| undefined>` |
| `I18nDefaultLocaleContext` | const | `import("solid-js/types/index").Context<string \| undefined>` |
| `I18nGroup` | const | `Component<I18nGroupProps>` |
| `I18nLink` | const | `Component<I18nLinkProps>` |
| `I18nLocalesContext` | const | `import("solid-js/types/index").Context<Locale[] \| undefined>` |
| `I18nProvider` | const | `ParentComponent<I18nProviderProps>` |
| `I18nProviderProps` | interface | 4 members |
| `I18nRouterContext` | const | `import("solid-js/types/index").Context<I18nRoutingStrategy \| undefined>` |
| `I18nRoutingStrategy` | interface | 7 members |
| `I18nSwitcher` | const | `Component<I18nSwitcherProps>` |
| `I18nT` | const | `Component<I18nTProps>` |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `Locale` | interface | 11 members |
| `LocaleCode` | type | `string` |
| `ModuleOptions` | interface | 47 members |
| `Params` | type | `Record<string, string \| number \| boolean>` |
| `PluralFunc` | type | `(key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string \| null` |
| `SolidI18n` | class | 53 members |
| `SolidI18nOptions` | interface | 6 members |
| `TranslationKey` | type | `keyof DefineLocaleMessage extends never ? string : keyof DefineLocaleMessage \| string` |
| `Translations` | interface | 1 members |
| `useI18n` | function | `(options?: UseI18nOptions) => { instance: import("packages/solid/src/i18n").SolidI18n; locale: import("solid-js/types/index").Accessor<string>; getLocales: () => Locale[]; defaultLocale: () => string; getLocaleName: () => string \| null; localeRoute: (to: string \| { path?: string; }, localeCode?: string) => string \| { path?: string; }; localePath: (to: string \| { path?: string; }, locale?: string) => string; switchLocale: (newLocale: string) => void; t: (key: import("packages/types/dist/index").TranslationKey, params?: import("packages/types/dist/index").Params, defaultValue?: string \| null, routeContext?: unknown) => import("packages/types/dist/index").CleanTranslation; ts: (key: import("packages/types/dist/index").TranslationKey, params?: import("packages/types/dist/index").Params, defaultValue?: string, routeContext?: unknown) => string; tc: (key: import("packages/types/dist/index").TranslationKey, count: number \| import("packages/types/dist/index").Params, defaultValue?: string) => string; tn: { (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }; td: { (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: import("packages/types/dist/index").TranslationKey, routeContext?: unknown) => boolean; setRoute: (val: string) => void; getRoute: () => string; getLocale: () => string; addTranslations: (locale: string, translations: import("packages/types/dist/index").Translations, merge?: boolean) => void; addRouteTranslations: (locale: string, routeName: string, translations: import("packages/types/dist/index").Translations, merge?: boolean) => void; resolveTranslations: (routeContext?: unknown) => import("packages/types/dist/index").Translations; setTranslation: (key: import("packages/types/dist/index").TranslationKey, value: unknown) => void; clearCache: () => void; }` |
| `useI18nContext` | const | `() => SolidI18n` |
| `useI18nDefaultLocale` | const | `() => string` |
| `useI18nLocales` | const | `() => Locale[]` |
| `UseI18nOptions` | interface | 2 members |
| `useI18nRouter` | const | `() => I18nRoutingStrategy \| undefined` |

FormatService — 19 members, identical to [`FormatService`](/api/packages/astro).

| Member | Type |
| --- | --- |
| `defaultLocale?` | `string \| undefined` |
| `i18n` | `SolidI18n` |
| `locales?` | `Locale[] \| undefined` |
| `routingStrategy?` | `I18nRoutingStrategy \| undefined` |

| Member | Type |
| --- | --- |
| `getCurrentPath` | `() => string` |
| `getCurrentPathAccessor?` | `(() => Accessor<string>) \| undefined` |
| `getRoute?` | `(() => { fullPath: string; query: Record<string, unknown>; }) \| undefined` |
| `linkComponent?` | `string \| Component<{ [key: string]: unknown; href: string; children?: JSX.Element; style?: JSX.CSSProperties; class?: string; }> \| undefined` |
| `push` | `(target: { path: string; }) => void` |
| `replace` | `(target: { path: string; }) => void` |
| `resolvePath?` | `((to: string \| { path?: string; }, locale: string) => string \| { path?: string; }) \| undefined` |

| Member | Type |
| --- | --- |
| `_fallbackSignal` | `private Accessor<string>` |
| `_localeSignal` | `private Accessor<string>` |
| `_routeSignal` | `private Accessor<string>` |
| `_setLocaleSignal` | `private (v: string) => void` |
| `_setRouteSignal` | `private (v: string) => void` |
| `addRouteTranslations` | `(locale: string, routeName: string, translations: Translations, merge?: boolean) => void` |
| `addTranslations` | `(locale: string, translations: Translations, merge?: boolean) => void` |
| `clearCache` | `() => void` |
| `currentRoute` | `string` |
| `fallbackLocale` | `string` |
| `formatter` | `FormatService` |
| `getCustomMissingHandler?` | `(() => MissingHandler \| null) \| undefined` |
| `getFallbackLocale` | `() => string` |
| `getLocale` | `() => string` |
| `getMissingContext` | `protected (routeContext?: unknown) => { locale: string; routeName: string; }` |
| `getRoute` | `() => string` |
| `getSnapshot` | `() => string` |
| `has` | `(key: TranslationKey, routeContext?: unknown) => boolean` |
| `helper` | `{ hasCache(locale: string, page: string): boolean; getCache(locale: string, routeName: string): Translations \| undefined; setCache(_locale: string, _routeName: string, _cache: Map<string, unknown>): void; hasTranslation(locale: string, key: string): boolean; hasPageTranslation(locale: string, routeName: string): boolean; getTranslation<T = unknown>(locale: string, routeName: string, key: string): T \| null; loadTranslations(locale: string, data: Translations, routeName?: string): void; setTranslations(locale: string, data: Translations, routeName?: string): void; loadPageTranslations(locale: string, routeName: string, data: Translations): void; mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force?: boolean): void; clearCache(): void; }` |
| `listeners` | `private Set<() => void>` |
| `loadRouteTranslationsCore` | `(locale: string, routeName: string, translations: Translations, merge: boolean) => void` |
| `loadTranslationsCore` | `(locale: string, translations: Translations, merge: boolean, routeName?: string) => void` |
| `locale` | `string` |
| `localeAccessor` | `Accessor<string>` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn` | `boolean` |
| `new` | `(options: SolidI18nOptions): SolidI18n` |
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
| `routeAccessor` | `Accessor<string>` |
| `setRoute` | `(val: string) => void` |
| `setTranslation` | `(key: TranslationKey, value: unknown) => void` |
| `storage` | `TranslationStorage` |
| `store` | `private ReactiveI18nStore` |
| `subscribe` | `(cb: () => void) => () => void` |
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

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
