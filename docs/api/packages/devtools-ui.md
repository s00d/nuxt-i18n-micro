---
title: '@i18n-micro/devtools-ui'
description: 'Exported API of @i18n-micro/devtools-ui, generated from the source.'
outline: 'deep'
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
| `TranslationContent` | interface | — |
| `TreeNode` | interface | 4 members |

<details>
<summary><code>BridgeAdapter</code> — 6 members</summary>

| Member | Type |
| --- | --- |
| `addRouteTranslations` | `(locale: string, routeName: string, content: TranslationContent, merge: boolean) => void` |
| `addTranslations` | `(locale: string, content: TranslationContent, merge: boolean) => void` |
| `getCurrentLocale?` | `(() => string) \| undefined` |
| `getFallbackLocale?` | `(() => string) \| undefined` |
| `getRouteCache` | `() => Record<string, TranslationContent>` |
| `subscribe` | `(callback: () => void) => () => void` |

</details>
<details>
<summary><code>CreateBridgeOptions</code> — 4 members</summary>

| Member | Type |
| --- | --- |
| `adapter` | `BridgeAdapter` |
| `defaultLocale?` | `string \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `translationDir?` | `string \| undefined` |

</details>
<details>
<summary><code>I18nDevToolsBridge</code> — 4 members</summary>

| Member | Type |
| --- | --- |
| `getConfigs` | `() => Promise<ModuleOptions>` |
| `getLocalesAndTranslations` | `() => Promise<LocaleData>` |
| `onLocalesUpdate` | `(callback: (data: LocaleData) => void) => () => void` |
| `saveTranslation` | `(filePath: string, content: TranslationContent) => Promise<void>` |

</details>
<details>
<summary><code>JsonRpcEvent</code> — 3 members</summary>

| Member | Type |
| --- | --- |
| `jsonrpc` | `"2.0"` |
| `method` | `string` |
| `params?` | `unknown` |

</details>
<details>
<summary><code>JsonRpcRequest</code> — 4 members</summary>

| Member | Type |
| --- | --- |
| `id` | `string` |
| `jsonrpc` | `"2.0"` |
| `method` | `string` |
| `params?` | `unknown` |

</details>
<details>
<summary><code>JsonRpcResponse</code> — 4 members</summary>

| Member | Type |
| --- | --- |
| `error?` | `{ code: number; message: string; data?: unknown; } \| undefined` |
| `id` | `string` |
| `jsonrpc` | `"2.0"` |
| `result?` | `unknown` |

</details>
<details>
<summary><code>TreeNode</code> — 4 members</summary>

| Member | Type |
| --- | --- |
| `children` | `TreeNode[]` |
| `fullPath` | `string` |
| `isFile` | `boolean` |
| `name` | `string` |

</details>
## `@i18n-micro/devtools-ui/bridge`

```ts
import { /* … */ } from '@i18n-micro/devtools-ui/bridge'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `BRIDGE_INTERFACE_MODULE` | const | `true` |
| `I18nDevToolsBridge` | interface | 4 members |
| `JSONValue` | type | `string \| null \| number \| boolean \| { [key: string]: JSONValue }` |
| `LocaleData` | type | `Record<string, TranslationContent>` |
| `TranslationContent` | interface | — |

<code>I18nDevToolsBridge</code> — 4 members, documented above.
## `@i18n-micro/devtools-ui/bridge/create`

```ts
import { /* … */ } from '@i18n-micro/devtools-ui/bridge/create'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `BridgeAdapter` | interface | 6 members |
| `createBridge` | function | `(options: CreateBridgeOptions) => I18nDevToolsBridge` |
| `CreateBridgeOptions` | interface | 4 members |

<code>BridgeAdapter</code> — 6 members, documented above.
<code>CreateBridgeOptions</code> — 4 members, documented above.
## `@i18n-micro/devtools-ui/vite`

```ts
import { /* … */ } from '@i18n-micro/devtools-ui/vite'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `DevToolsPluginOptions` | interface | 3 members |
| `i18nDevToolsPlugin` | function | `(options?: DevToolsPluginOptions) => PluginOption` |

<details>
<summary><code>DevToolsPluginOptions</code> — 3 members</summary>

| Member | Type |
| --- | --- |
| `base?` | `string \| undefined` |
| `injectButton?` | `boolean \| undefined` |
| `translationDir?` | `string \| undefined` |

</details>

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
