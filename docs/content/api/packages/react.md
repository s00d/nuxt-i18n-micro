---
title: '@i18n-micro/react'
description: 'Exported API of @i18n-micro/react, generated from the source.'
navigation:
  title: 'react'
---

# `@i18n-micro/react`

React bindings for i18n-micro — hooks, context, and UI components.

Entry points: `@i18n-micro/react`, `@i18n-micro/react/client`, `@i18n-micro/react/router`, `@i18n-micro/react/server`.

## `@i18n-micro/react`

### Components

#### `I18nGroup`

```ts
function I18nGroup(props: I18nGroupProps): HostElement
```

**See** [`I18nGroupProps`](#i18ngroupprops)

#### `I18nLink`

```ts
function I18nLink(props: I18nLinkProps): HostElement
```

**See** [`I18nLinkProps`](#i18nlinkprops)

#### `I18nProvider`

```ts
function I18nProvider(props: I18nProviderProps): HostElement
```

**See** [`I18nProviderProps`](#i18nproviderprops)

#### `I18nSwitcher`

```ts
function I18nSwitcher(props: I18nSwitcherProps): HostElement
```

**See** [`I18nSwitcherProps`](#i18nswitcherprops)

#### `I18nT`

```ts
function I18nT(props: I18nTProps): HostElement
```

**See** [`I18nTProps`](#i18ntprops)

### Hooks

#### `useI18n`

```ts
function useI18n(options?: UseI18nOptions): UseI18nReturn
```

**See** [`UseI18nOptions`](#usei18noptions) · [`UseI18nReturn`](#usei18nreturn)

#### `useI18nContext`

```ts
function useI18nContext(): I18n
```

**See** [`I18n`](/api/packages/node#i18n)

#### `useI18nDefaultLocale`

```ts
function useI18nDefaultLocale(): string | null
```

#### `useI18nLocales`

```ts
function useI18nLocales(): Locale[] | null
```

**See** [`Locale`](/api/packages/types#locale)

#### `useI18nRouter`

```ts
function useI18nRouter(): I18nRoutingStrategy | null
```

**See** [`I18nRoutingStrategy`](#i18nroutingstrategy)

#### `useLocaleSwitch`

`setLocale` that loads first. A store write is synchronous for React, even inside
`startTransition`, so a reader that suspends on a missing dictionary would show its fallback:
this keeps the old UI until the messages are in. The last call wins; a failed `load` rejects
and leaves the locale as it was.

```ts
function useLocaleSwitch(
  load: (locale: string) => unknown,
): [ (locale: string) => Promise<void>, boolean ]
```

#### `useT`

One translation as a value: the component renders only when this string changes, not on every
locale or message write, nor when a provider gets a new adapter object.

```ts
function useT(
  key: TranslationKey,
  params?: Params,
  defaultValue?: string,
  routeName?: string,
): string
```

**See** [`TranslationKey`](/api/packages/types#translationkey) · [`Params`](/api/packages/types#params)

### Constants

#### `I18nConfigContext`

```ts
const I18nConfigContext: React.Context<I18nConfig | null>
```

**See** [`I18nConfig`](#i18nconfig)

#### `I18nContext`

The instance alone, stable while the app runs: `useT` and `<I18nT>` read only this, so a new
adapter object does not render them.

```ts
const I18nContext: React.Context<I18n | null>
```

**See** [`I18n`](/api/packages/node#i18n)

### Types

#### `I18nConfig`

What a provider adds to its instance. It changes with its props, an adapter built in render on every render.

```ts
interface I18nConfig
```

::field-group
:::field
---
name: "locales"
type: "Locale[] | null"
required: true
---

:::
:::field
---
name: "defaultLocale"
type: "string | null"
required: true
---

:::
:::field
---
name: "router"
type: "I18nRoutingStrategy | null"
required: true
---

:::
:::field
---
name: "api"
type: "{ snapshot: string; value: UseI18nReturn; } | null"
required: true
---
The `useI18n()` object of the current snapshot, shared by every consumer of this provider.
:::
:::field
---
name: "methods"
type: "{ current: TranslationMethods | null; }"
required: true
---
Translation methods by snapshot: they outlive the config, so `t` does not change with an adapter.
:::
::

#### `I18nGroupProps`

```ts
interface I18nGroupProps extends Omit<HostAttrs<HTMLDivElement>, 'children'>
```

::field-group
:::field
---
name: "prefix"
type: "string"
required: true
---

:::
:::field
---
name: "groupClass"
type: "string"
---

:::
:::field
---
name: "children"
type: "HostNode | ((props: { prefix: string; t: (key: string, params?: Record<string, string | number | boolean>) => string; }) => HostNode)"
---

:::
::

#### `I18nLinkProps`

```ts
type I18nLinkProps = HostAnchorAttrs<HTMLAnchorElement> & { … }
```

::field-group
:::field
---
name: "to"
type: "RouteTarget"
required: true
---

:::
:::field
---
name: "activeStyle"
type: "HostStyle"
---

:::
:::field
---
name: "localeRoute"
type: "(to: RouteTarget, locale?: string) => RouteTarget"
---

:::
:::field
---
name: "children"
type: "HostNode"
---

:::
::

#### `I18nProviderProps`

```ts
interface I18nProviderProps extends Partial<I18nOptions>
```

::field-group
:::field
---
name: "i18n"
type: "I18n"
---
An instance you created. Without it, the outer provider's; without that, one built from the options next to it: plain data, so a server component can pass them.
:::
:::field
---
name: "locales"
type: "Locale[]"
---

:::
:::field
---
name: "defaultLocale"
type: "string"
---

:::
:::field
---
name: "routingStrategy"
type: "I18nRoutingStrategy"
---

:::
:::field
---
name: "children"
type: "HostNode"
---

:::
::

**See** [`I18nOptions`](/api/packages/node#i18noptions)

#### `I18nRoutingStrategy`

Routing strategy interface for i18n
Implement this interface to integrate with any router library
Matches Vue/Solid package interface for consistency

```ts
interface I18nRoutingStrategy
```

::field-group
:::field
---
name: "getCurrentPath"
type: "() => string"
required: true
---
Returns the current path with its query and hash, so a locale switch keeps them.
Links compare it by page: query and hash do not count.
:::
:::field
---
name: "linkComponent"
type: "string | HostComponent<{ href: string; children?: HostNode; style?: HostStyle; className?: string; [key: string]: unknown; }>"
---
Component to use for rendering links (e.g., RouterLink)
:::
:::field
---
name: "push"
type: "(target: { path: string; }) => void"
required: true
---
Function to navigate to another route/locale
:::
:::field
---
name: "replace"
type: "(target: { path: string; }) => void"
required: true
---
Function to replace current route
:::
:::field
---
name: "resolvePath"
type: "(to: RouteTarget, locale: string) => RouteTarget"
---
Generate path for specific locale
:::
:::field
---
name: "getRoute"
type: "() => { fullPath: string; query: Record<string, unknown>; }"
---
(Optional) Get current route object for SEO/Meta tags
:::
::

#### `I18nSwitcherProps`

```ts
interface I18nSwitcherProps extends HostAttrs<HTMLDivElement>
```

::collapsible{name="14 properties"}
:::field-group
::::field
---
name: "locales"
type: "Locale[]"
---

::::
::::field
---
name: "currentLocale"
type: "string | (() => string)"
---

::::
::::field
---
name: "getLocaleName"
type: "() => string | null"
---

::::
::::field
---
name: "switchLocale"
type: "(locale: string) => void"
---

::::
::::field
---
name: "localeRoute"
type: "(to: RouteTarget, locale?: string) => RouteTarget"
---

::::
::::field
---
name: "customLabels"
type: "Record<string, string>"
---

::::
::::field
---
name: "customWrapperStyle"
type: "HostStyle"
---

::::
::::field
---
name: "customButtonStyle"
type: "HostStyle"
---

::::
::::field
---
name: "customDropdownStyle"
type: "HostStyle"
---

::::
::::field
---
name: "customItemStyle"
type: "HostStyle"
---

::::
::::field
---
name: "customLinkStyle"
type: "HostStyle"
---

::::
::::field
---
name: "customActiveLinkStyle"
type: "HostStyle"
---

::::
::::field
---
name: "customDisabledLinkStyle"
type: "HostStyle"
---
Inline style applied to the main switcher button when the current locale is
marked as `disabled: true` in the locale config. Disabled locales are omitted from the dropdown items, but still shown as the
active button label.
::::
::::field
---
name: "customIconStyle"
type: "HostStyle"
---

::::
:::
::

#### `I18nTComponent`

What fills a `{name}` placeholder: a node, or a function returning one (it may use hooks).

```ts
type I18nTComponent = HostNode | (() => HostNode)
```

#### `I18nTProps`

```ts
interface I18nTProps extends Omit<HostAttrs<HTMLElement>, 'children' | 'defaultValue'>, Omit<I18nTRenderProps, 'tag'>
```

::field-group
:::field
---
name: "tag"
type: "HostTag"
---

:::
:::field
---
name: "components"
type: "Record<string, I18nTComponent>"
---
Elements for `{name}` placeholders. Beats a param of the same name.
:::
:::field
---
name: "children"
type: "HostNode | ((props: { translation: string; }) => HostNode)"
---
Replaces the text. As a function it gets the translation, like Vue's default slot.
:::
::

**See** [`I18nTRenderProps`](/api/packages/core#i18ntrenderprops)

#### `RouteTarget`

Where a link or a switch goes.

```ts
type RouteTarget = string | {
  path?: string;
}
```

#### `UseI18nOptions`

```ts
interface UseI18nOptions
```

::field-group
:::field
---
name: "locales"
type: "Locale[]"
---

:::
:::field
---
name: "defaultLocale"
type: "string"
---

:::
::

#### `UseI18nReturn`

```ts
interface UseI18nReturn
```

::collapsible{name="22 properties"}
:::field-group
::::field
---
name: "t"
type: "(key: TranslationKey, params?: Params, defaultValue?: string | null, routeName?: string) => CleanTranslation"
required: true
---

::::
::::field
---
name: "ts"
type: "(key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string"
required: true
---

::::
::::field
---
name: "tc"
type: "(key: TranslationKey, count: number | Params, defaultValue?: string) => string"
required: true
---

::::
::::field
---
name: "tn"
type: "(value: number, options?: Intl.NumberFormatOptions) => string"
required: true
---

::::
::::field
---
name: "td"
type: "(value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string"
required: true
---

::::
::::field
---
name: "tdr"
type: "(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions) => string"
required: true
---

::::
::::field
---
name: "has"
type: "(key: TranslationKey, routeName?: string) => boolean"
required: true
---

::::
::::field
---
name: "locale"
type: "string"
required: true
---

::::
::::field
---
name: "fallbackLocale"
type: "string"
required: true
---

::::
::::field
---
name: "currentRoute"
type: "string"
required: true
---

::::
::::field
---
name: "setLocale"
type: "(locale: string) => void"
required: true
---

::::
::::field
---
name: "setRoute"
type: "(routeName: string) => void"
required: true
---

::::
::::field
---
name: "getRoute"
type: "() => string"
required: true
---

::::
::::field
---
name: "getLocales"
type: "() => Locale[]"
required: true
---

::::
::::field
---
name: "defaultLocale"
type: "() => string"
required: true
---

::::
::::field
---
name: "getLocaleName"
type: "() => string | null"
required: true
---

::::
::::field
---
name: "switchLocale"
type: "(locale: string) => void"
required: true
---

::::
::::field
---
name: "localeRoute"
type: "(to: RouteTarget, locale?: string) => RouteTarget"
required: true
---

::::
::::field
---
name: "localePath"
type: "(to: RouteTarget, locale?: string) => string"
required: true
---

::::
::::field
---
name: "addTranslations"
type: "(locale: string, translations: Translations, merge?: boolean) => void"
required: true
---

::::
::::field
---
name: "addRouteTranslations"
type: "(locale: string, routeName: string, translations: Translations, merge?: boolean) => void"
required: true
---

::::
::::field
---
name: "clearCache"
type: "() => void"
required: true
---

::::
:::
::

### Re-exports

Declared in another package of this repository and documented on its page.

- From [`@i18n-micro/core`](/api/packages/core): [`defaultPlural`](/api/packages/core#defaultplural) · [`interpolate`](/api/packages/core#interpolate) · [`FormatService`](/api/packages/core#formatservice)
- From [`@i18n-micro/runtime`](/api/packages/runtime): [`createI18n`](/api/packages/runtime#createi18n) · [`ReactI18n`](/api/packages/runtime#i18n) (as `I18n`) · [`ReactI18nOptions`](/api/packages/runtime#i18noptions) (as `I18nOptions`)
- From [`@i18n-micro/types`](/api/packages/types): [`CleanTranslation`](/api/packages/types#cleantranslation) · [`Getter`](/api/packages/types#getter) · [`Locale`](/api/packages/types#locale) · [`LocaleCode`](/api/packages/types#localecode) · [`ModuleOptions`](/api/packages/types#moduleoptions) · [`Params`](/api/packages/types#params) · [`PluralFunc`](/api/packages/types#pluralfunc) · [`TranslationKey`](/api/packages/types#translationkey) · [`Translations`](/api/packages/types#translations)

## `@i18n-micro/react/client`

The same exports as `@i18n-micro/react` above.

## `@i18n-micro/react/router`

Also exports, as `@i18n-micro/react` does: [`I18nRoutingStrategy`](#i18nroutingstrategy).

### Functions

#### `createReactRouterAdapter`

Factory for React Router adapter
Implements routing utilities for React Router
Uses react-router-dom APIs for navigation and path resolution

```ts
function createReactRouterAdapter(
  locales: Locale[],
  defaultLocale: string,
  location: ReturnType<typeof useLocation>,
  navigate: ReturnType<typeof useNavigate>,
): I18nRoutingStrategy
```

**See** [`Locale`](/api/packages/types#locale) · [`I18nRoutingStrategy`](#i18nroutingstrategy)

## `@i18n-micro/react/server`

Also exports, as `@i18n-micro/react` does: [`createI18n`](/api/packages/runtime#createi18n) · [`defaultPlural`](/api/packages/core#defaultplural) · [`interpolate`](/api/packages/core#interpolate) · [`FormatService`](/api/packages/core#formatservice) · [`ReactI18n`](/api/packages/runtime#i18n) · [`I18nTComponent`](#i18ntcomponent) · [`ReactI18nOptions`](/api/packages/runtime#i18noptions).

### Components

#### `I18nT`

`<I18nT>` for a server component. Its text stays out of the client bundle.

```ts
function I18nT(props: ServerI18nTProps): HostElement
```

**See** [`ServerI18nTProps`](#serveri18ntprops)

### Types

#### `ServerI18nTProps`

```ts
interface ServerI18nTProps extends I18nTProps
```

::field-group
:::field
---
name: "i18n"
type: "I18n"
required: true
---
The request's instance: a server component has no context.
:::
::

**See** [`I18nTProps`](#i18ntprops)

---

Generated from the TypeScript sources and their JSDoc by `pnpm run docs:generate`.
Back to [all packages](/api/packages) · [Integration guides](/integrations/)
