---
url: 'https://s00d.github.io/nuxt-i18n-micro/api/packages/devtools-ui.md'
description: 'Exported API of @i18n-micro/devtools-ui, generated from the source.'
---

# `@i18n-micro/devtools-ui`

25 exports across 4 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/devtools-ui`

```ts
import { /* … */ } from '@i18n-micro/devtools-ui'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `BridgeAdapter` | interface | 6 members |
| `createBridge` | function | `(options: CreateBridgeOptions) => I18nDevToolsBridge` |
| `CreateBridgeOptions` | interface | 4 members |
| `createRpcClient` | function | `() => I18nDevToolsBridge` |
| `I18nDevToolsBridge` | interface | 4 members |
| `I18nDevToolsElement` | const | `import("vue/dist/vue").VueElementConstructor<any>` |
| `JsonRpcEvent` | interface | 3 members |
| `JsonRpcRequest` | interface | 4 members |
| `JsonRpcResponse` | interface | 4 members |
| `JSONValue` | type | `string \| null \| number \| boolean \| { [key: string]: JSONValue }` |
| `LocaleData` | type | `Record<string, TranslationContent>` |
| `register` | function | `() => void` |
| `setupRpcHost` | function | `(iframeWindow: Window, bridge: I18nDevToolsBridge) => () => void` |
| `TranslationContent` | interface | 1 members |
| `TreeNode` | interface | 4 members |

| Member | Type |
| --- | --- |
| `addRouteTranslations` | `(locale: string, routeName: string, content: TranslationContent, merge: boolean) => void` |
| `addTranslations` | `(locale: string, content: TranslationContent, merge: boolean) => void` |
| `getCurrentLocale?` | `(() => string) \| undefined` |
| `getFallbackLocale?` | `(() => string) \| undefined` |
| `getRouteCache` | `() => Record<string, TranslationContent>` |
| `subscribe` | `(callback: () => void) => () => void` |

| Member | Type |
| --- | --- |
| `adapter` | `BridgeAdapter` |
| `defaultLocale?` | `string \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `translationDir?` | `string \| undefined` |

| Member | Type |
| --- | --- |
| `getConfigs` | `() => Promise<ModuleOptions>` |
| `getLocalesAndTranslations` | `() => Promise<LocaleData>` |
| `onLocalesUpdate` | `(callback: (data: LocaleData) => void) => () => void` |
| `saveTranslation` | `(filePath: string, content: TranslationContent) => Promise<void>` |

| Member | Type |
| --- | --- |
| `jsonrpc` | `"2.0"` |
| `method` | `string` |
| `params?` | `unknown` |

| Member | Type |
| --- | --- |
| `id` | `string` |
| `jsonrpc` | `"2.0"` |
| `method` | `string` |
| `params?` | `unknown` |

| Member | Type |
| --- | --- |
| `error?` | `{ code: number; message: string; data?: unknown; } \| undefined` |
| `id` | `string` |
| `jsonrpc` | `"2.0"` |
| `result?` | `unknown` |

| Member | Type |
| --- | --- |
| `[string]` | `JSONValue` |

| Member | Type |
| --- | --- |
| `children` | `TreeNode[]` |
| `fullPath` | `string` |
| `isFile` | `boolean` |
| `name` | `string` |

```ts
import { /* … */ } from '@i18n-micro/devtools-ui/bridge'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `BRIDGE_INTERFACE_MODULE` | const | `true` |
| `I18nDevToolsBridge` | interface | 4 members |
| `JSONValue` | type | `string \| null \| number \| boolean \| { [key: string]: JSONValue }` |
| `LocaleData` | type | `Record<string, TranslationContent>` |
| `TranslationContent` | interface | 1 members |

I18nDevToolsBridge — 4 members, identical to `I18nDevToolsBridge` above.
TranslationContent — 1 members, identical to `TranslationContent` above.

## `@i18n-micro/devtools-ui/bridge/create`

```ts
import { /* … */ } from '@i18n-micro/devtools-ui/bridge/create'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `BridgeAdapter` | interface | 6 members |
| `createBridge` | function | `(options: CreateBridgeOptions) => I18nDevToolsBridge` |
| `CreateBridgeOptions` | interface | 4 members |

BridgeAdapter — 6 members, identical to `BridgeAdapter` above.
CreateBridgeOptions — 4 members, identical to `CreateBridgeOptions` above.

## `@i18n-micro/devtools-ui/vite`

```ts
import { /* … */ } from '@i18n-micro/devtools-ui/vite'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `DevToolsPluginOptions` | interface | 3 members |
| `i18nDevToolsPlugin` | function | `(options?: DevToolsPluginOptions) => PluginOption` |

| Member | Type |
| --- | --- |
| `base?` | `string \| undefined` |
| `injectButton?` | `boolean \| undefined` |
| `translationDir?` | `string \| undefined` |

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
