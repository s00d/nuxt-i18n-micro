---
title: '@i18n-micro/react'
description: 'Exported API of @i18n-micro/react, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/react`

38 exports across 1 entry point.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/react`

```ts
import { /* … */ } from '@i18n-micro/react'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `CleanTranslation` | type | `string \| number \| boolean \| Translations \| PluralTranslations \| null` |
| `createI18n` | function | `(options: ReactI18nOptions) => ReactI18n` |
| `createReactRouterAdapter` | value | `unknown` |
| `defaultPlural` | const | `PluralFunc` |
| `FormatService` | class | 18 members |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `I18nContext` | const | `import("/Users/s00d/packeges/nuxt-i18n-next/node_modules/.pnpm/@types+react@18.3.27/node_modules/@types/react/index").Context<ReactI18n \| null>` |
| `I18nDefaultLocaleContext` | const | `import("/Users/s00d/packeges/nuxt-i18n-next/node_modules/.pnpm/@types+react@18.3.27/node_modules/@types/react/index").Context<string \| null>` |
| `I18nGroup` | value | `unknown` |
| `I18nGroupProps` | value | `unknown` |
| `I18nLink` | value | `unknown` |
| `I18nLinkProps` | value | `unknown` |
| `I18nLocalesContext` | const | `import("/Users/s00d/packeges/nuxt-i18n-next/node_modules/.pnpm/@types+react@18.3.27/node_modules/@types/react/index").Context<Locale[] \| null>` |
| `I18nProvider` | value | `unknown` |
| `I18nProviderProps` | value | `unknown` |
| `I18nRouterContext` | const | `import("/Users/s00d/packeges/nuxt-i18n-next/node_modules/.pnpm/@types+react@18.3.27/node_modules/@types/react/index").Context<I18nRoutingStrategy \| null>` |
| `I18nRoutingStrategy` | interface | 6 members |
| `I18nSwitcher` | value | `unknown` |
| `I18nSwitcherProps` | value | `unknown` |
| `I18nT` | value | `unknown` |
| `I18nTProps` | value | `unknown` |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `Locale` | interface | 10 members |
| `LocaleCode` | type | `string` |
| `ModuleOptions` | interface | 45 members |
| `Params` | type | `Record<string, string \| number \| boolean>` |
| `PluralFunc` | type | `(key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string \| null` |
| `ReactI18n` | class | 42 members |
| `ReactI18nOptions` | interface | 6 members |
| `TranslationKey` | type | `keyof DefineLocaleMessage extends never ? string : keyof DefineLocaleMessage \| string` |
| `Translations` | interface | — |
| `useI18n` | value | `unknown` |
| `useI18nContext` | const | `() => ReactI18n` |
| `useI18nDefaultLocale` | const | `() => string \| null` |
| `useI18nLocales` | const | `() => Locale[] \| null` |
| `UseI18nOptions` | value | `unknown` |
| `UseI18nReturn` | value | `unknown` |
| `useI18nRouter` | const | `() => I18nRoutingStrategy \| null` |

<code>FormatService</code> — 18 members, identical to [`FormatService`](/api/packages/astro).
<code>I18nRoutingStrategy</code> — 6 members, identical to [`I18nRoutingStrategy`](/api/packages/preact).
<code>Locale</code> — 10 members, identical to [`Locale`](/api/packages/types).
<code>ModuleOptions</code> — 45 members, identical to [`ModuleOptions`](/api/packages/types).
<code>ReactI18n</code> — 42 members, identical to [`PreactI18n`](/api/packages/preact).
<code>ReactI18nOptions</code> — 6 members, identical to [`PreactI18nOptions`](/api/packages/preact).

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
