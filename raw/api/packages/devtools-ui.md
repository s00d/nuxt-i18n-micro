# `@i18n-micro/devtools-ui`

DevTools UI and Vite plugin for Nuxt I18n Micro.

Entry points: `@i18n-micro/devtools-ui`, `@i18n-micro/devtools-ui/bridge`, `@i18n-micro/devtools-ui/bridge/create`, `@i18n-micro/devtools-ui/vite`.

## `@i18n-micro/devtools-ui`

### Components

#### `I18nDevToolsElement`

```ts
const I18nDevToolsElement: VueElementConstructor
```

### Functions

#### `createBridge`

Create a universal bridge for DevTools communication
This bridge works with any framework by using an adapter pattern

```ts
function createBridge(options: CreateBridgeOptions): I18nDevToolsBridge
```

**See** [`CreateBridgeOptions`](#createbridgeoptions) · [`I18nDevToolsBridge`](#i18ndevtoolsbridge)

#### `createRpcClient`

```ts
function createRpcClient(): I18nDevToolsBridge
```

**See** [`I18nDevToolsBridge`](#i18ndevtoolsbridge)

#### `register`

Register the i18n-devtools-ui custom element
This should be called once before using the element

```ts
function register(): void
```

#### `setupRpcHost`

Connects an iframe to an existing Bridge.

```ts
function setupRpcHost(iframeWindow: Window, bridge: I18nDevToolsBridge): () => void
```

<field-group>
<field name="iframeWindow" type="Window" :required="true">

reference to iframe window (contentWindow)

</field>

<field name="bridge" type="I18nDevToolsBridge" :required="true">

local bridge implementation (adapter to Nuxt/Astro RPC)

</field>
</field-group>

**Returns** — cleanup function

**See** [`I18nDevToolsBridge`](#i18ndevtoolsbridge)

### Types

#### `BridgeAdapter`

Adapter interface for accessing i18n instance data
Each framework package will implement this adapter for their specific i18n instance

```ts
interface BridgeAdapter
```

<field-group>
<field name="getRouteCache" type="() => Record<string, TranslationContent>" :required="true">

Get translations cache
Keys are in format "locale:routeName" (e.g., "en:index", "en:home")

</field>

<field name="addTranslations" type="(locale: string, content: TranslationContent, merge: boolean) => void" :required="true">

Add or update translations for a locale

</field>

<field name="addRouteTranslations" type="(locale: string, routeName: string, content: TranslationContent, merge: boolean) => void" :required="true">

Add or update route-specific translations

</field>

<field name="subscribe" type="(callback: () => void) => () => void" :required="true">

Subscribe to changes in translations

</field>

<field name="getCurrentLocale" type="() => string">

Get current locale (optional)

</field>

<field name="getFallbackLocale" type="() => string">

Get fallback locale (optional)

</field>
</field-group>

#### `CreateBridgeOptions`

```ts
interface CreateBridgeOptions
```

<field-group>
<field name="adapter" type="BridgeAdapter" :required="true">



</field>

<field name="locales" type="Locale[]">



</field>

<field name="defaultLocale" type="string">



</field>

<field name="translationDir" type="string">



</field>

<field name="base" type="string">

The dev server's API base, the plugin's `base` option (default `'/__i18n_api'`).

</field>
</field-group>

#### `I18nDevToolsBridge`

Bridge interface for communication between DevTools UI and framework-specific RPC
This abstraction allows the UI to work with both Nuxt and Astro DevTools

```ts
interface I18nDevToolsBridge
```

<field-group>
<field name="getLocalesAndTranslations" type="() => Promise<LocaleData>" :required="true">

Get all locales and their translation files

</field>

<field name="getConfigs" type="() => Promise<ModuleOptions>" :required="true">

Get i18n module configuration

</field>

<field name="saveTranslation" type="(filePath: string, content: TranslationContent) => Promise<void>" :required="true">

Save translation content to a file

</field>

<field name="onLocalesUpdate" type="(callback: (data: LocaleData) => void) => () => void" :required="true">

Subscribe to locale updates from the server

</field>
</field-group>

#### `JsonRpcEvent`

```ts
interface JsonRpcEvent
```

<field-group>
<field name="jsonrpc" type="'2.0'" :required="true">



</field>

<field name="method" type="string" :required="true">



</field>

<field name="params" type="unknown">



</field>
</field-group>

#### `JsonRpcRequest`

```ts
interface JsonRpcRequest
```

<field-group>
<field name="jsonrpc" type="'2.0'" :required="true">



</field>

<field name="id" type="string" :required="true">



</field>

<field name="method" type="string" :required="true">



</field>

<field name="params" type="unknown">



</field>
</field-group>

#### `JsonRpcResponse`

```ts
interface JsonRpcResponse
```

<field-group>
<field name="jsonrpc" type="'2.0'" :required="true">



</field>

<field name="id" type="string" :required="true">



</field>

<field name="result" type="unknown">



</field>

<field name="error" type="{ code: number; message: string; data?: unknown; }">



</field>
</field-group>

#### `JSONValue`

```ts
type JSONValue = string | null | number | boolean | {
  [key: string]: JSONValue;
}
```

#### `LocaleData`

```ts
type LocaleData = Record<string, TranslationContent>
```

**See** [`TranslationContent`](#translationcontent)

#### `TranslationContent`

```ts
interface TranslationContent
```

<field-group>
<field name="[key: string]" type="JSONValue">



</field>
</field-group>

#### `TreeNode`

```ts
interface TreeNode
```

<field-group>
<field name="name" type="string" :required="true">



</field>

<field name="fullPath" type="string" :required="true">



</field>

<field name="isFile" type="boolean" :required="true">



</field>

<field name="children" type="TreeNode[]" :required="true">



</field>
</field-group>

## `@i18n-micro/devtools-ui/bridge`

Also exports, as `@i18n-micro/devtools-ui` does: [`I18nDevToolsBridge`](#i18ndevtoolsbridge) · [`JSONValue`](#jsonvalue) · [`LocaleData`](#localedata) · [`TranslationContent`](#translationcontent).

### Constants

#### `BRIDGE_INTERFACE_MODULE`

Runtime marker so the bridge types entry can be published as a JS module.

```ts
const BRIDGE_INTERFACE_MODULE: true
```

## `@i18n-micro/devtools-ui/bridge/create`

Also exports, as `@i18n-micro/devtools-ui` does: [`createBridge`](#createbridge) · [`BridgeAdapter`](#bridgeadapter) · [`CreateBridgeOptions`](#createbridgeoptions).

## `@i18n-micro/devtools-ui/vite`

### Functions

#### `i18nDevToolsIntegration`

The devtools as an Astro integration: an app in the dev toolbar (Astro has no `transformIndexHtml`, so the plugin's button never shows there).

```ts
function i18nDevToolsIntegration(
  options?: Omit<DevToolsPluginOptions, 'injectButton'>,
): { … }
```

<field-group>
<field name="name" type="string" :required="true">



</field>

<field name="hooks" type="{ 'astro:config:setup': ({ command, updateConfig, addDevToolbarApp }: ToolbarSetup) => void; }" :required="true">



</field>
</field-group>

**See** [`DevToolsPluginOptions`](#devtoolspluginoptions)

#### `i18nDevToolsPlugin`

```ts
function i18nDevToolsPlugin(options?: DevToolsPluginOptions): PluginOption
```

**See** [`DevToolsPluginOptions`](#devtoolspluginoptions)

### Types

#### `DevToolsPluginOptions`

```ts
interface DevToolsPluginOptions
```

<field-group>
<field name="base" type="string">



</field>

<field name="translationDir" type="string">



</field>

<field name="defaultLocale" type="string">

Reported by `/config`. Default: the first locale file in `translationDir`.

</field>

<field name="fallbackLocale" type="string">

Reported by `/config`. Default: `defaultLocale`.

</field>

<field name="injectButton" type="boolean">



</field>
</field-group>

---

Generated from the TypeScript sources and their JSDoc by `pnpm run docs:generate`.
Back to [all packages](/api/packages) · [Integration guides](/integrations/)
