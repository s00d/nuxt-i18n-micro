---
title: '@i18n-micro/solid'
description: 'Exported API of @i18n-micro/solid, generated from the source.'
navigation:
  title: 'solid'
---

# `@i18n-micro/solid`

SolidJS bindings for i18n-micro — primitives, context, and UI components.

Entry points: `@i18n-micro/solid`, `@i18n-micro/solid/router`.

## `@i18n-micro/solid`

### Components

#### `I18nGroup`

```ts
function I18nGroup(props: I18nGroupProps): JSX.Element
```

**See** [`I18nGroupProps`](#i18ngroupprops)

#### `I18nLink`

```ts
function I18nLink(props: I18nLinkProps): JSX.Element
```

**See** [`I18nLinkProps`](#i18nlinkprops)

#### `I18nProvider`

```ts
function I18nProvider(props: ParentProps<I18nProviderProps>): JSX.Element
```

**See** [`I18nProviderProps`](#i18nproviderprops)

#### `I18nSwitcher`

```ts
function I18nSwitcher(props: I18nSwitcherProps): JSX.Element
```

**See** [`I18nSwitcherProps`](#i18nswitcherprops)

#### `I18nT`

```ts
function I18nT(props: I18nTProps): JSX.Element
```

**See** [`I18nTProps`](#i18ntprops)

### Hooks

#### `useI18n`

One object per provider; hook options make their own, and win over the provider.

```ts
function useI18n(options?: UseI18nOptions): UseI18nReturn
```

**See** [`UseI18nOptions`](#usei18noptions) · [`UseI18nReturn`](#usei18nreturn)

#### `useI18nContext`

```ts
function useI18nContext(): SolidI18n
```

**See** [`SolidI18n`](#solidi18n)

#### `useI18nDefaultLocale`

```ts
function useI18nDefaultLocale(): string | undefined
```

#### `useI18nLocales`

```ts
function useI18nLocales(): Locale[] | undefined
```

**See** [`Locale`](/api/packages/types#locale)

#### `useI18nRouter`

```ts
function useI18nRouter(): I18nRoutingStrategy | undefined
```

**See** [`I18nRoutingStrategy`](#i18nroutingstrategy)

### Functions

#### `createI18n`

```ts
function createI18n(options: SolidI18nOptions): SolidI18n
```

**See** [`SolidI18nOptions`](#solidi18noptions) · [`SolidI18n`](#solidi18n)

### Classes

#### `SolidI18n`

The runtime instance with signals over its store. A translation read tracks the revision, which
every change bumps. Reading the locale tracks the locale alone, so `createEffect(() => load(locale()))`
does not wake itself. `getLocale()` and `getRoute()` stay plain, as a write reads them too: track
with `locale` and `currentRoute`.

```ts
class SolidI18n extends I18n {
  constructor(options: SolidI18nOptions)
}
```

::field-group
:::field
---
name: "readonly localeAccessor"
type: "Accessor<string>"
---

:::
:::field
---
name: "readonly routeAccessor"
type: "Accessor<string>"
---

:::
:::field
---
name: "protected touch"
type: "() => void"
---
Called before every read; adapters use it for reactivity tracking.
:::
:::field
---
name: "locale"
type: "string"
---

:::
:::field
---
name: "fallbackLocale"
type: "string"
---

:::
:::field
---
name: "currentRoute"
type: "string"
---

:::
::

**See** [`I18n`](/api/packages/node#i18n) · [`SolidI18nOptions`](#solidi18noptions)

### Constants

#### `I18nContext`

```ts
const I18nContext: Context<I18nContextValue | undefined>
```

**See** [`I18nContextValue`](#i18ncontextvalue)

### Types

#### `I18nContextValue`

Everything a provider hands down: getters over its props, so they stay reactive.

```ts
interface I18nContextValue
```

::field-group
:::field
---
name: "readonly i18n"
type: "SolidI18n"
required: true
---

:::
:::field
---
name: "readonly locales"
type: "Locale[] | undefined"
required: true
---

:::
:::field
---
name: "readonly defaultLocale"
type: "string | undefined"
required: true
---

:::
:::field
---
name: "readonly router"
type: "I18nRoutingStrategy | undefined"
required: true
---

:::
:::field
---
name: "api"
type: "UseI18nReturn"
---
The `useI18n()` object: one per provider, signals do the rest.
:::
::

#### `I18nGroupProps`

```ts
interface I18nGroupProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'>
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
type: "JSX.Element | ((props: { prefix: string; t: (key: string, params?: Record<string, string | number | boolean>) => string; }) => JSX.Element)"
---

:::
::

#### `I18nLinkProps`

```ts
interface I18nLinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement>
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
name: "localeRoute"
type: "(to: RouteTarget, locale?: string) => RouteTarget"
---

:::
:::field
---
name: "activeStyle"
type: "JSX.CSSProperties"
---

:::
::

#### `I18nProviderProps`

```ts
interface I18nProviderProps
```

::field-group
:::field
---
name: "i18n"
type: "SolidI18n"
---
Without it, the outer provider's instance.
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
::

#### `I18nRoutingStrategy`

Routing strategy interface for i18n
Implement this interface to integrate with any router library
Matches Vue package interface for consistency

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
Returns the current path with its query and hash, so a locale switch keeps them. Links compare
it by page. Read a signal or a reactive location here and links and the switcher follow it.
:::
:::field
---
name: "linkComponent"
type: "string | Component<{ href: string; children?: JSX.Element; style?: JSX.CSSProperties | string; class?: string; [key: string]: unknown; }>"
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
interface I18nSwitcherProps extends JSX.HTMLAttributes<HTMLDivElement>
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
type: "JSX.CSSProperties"
---

::::
::::field
---
name: "customButtonStyle"
type: "JSX.CSSProperties"
---

::::
::::field
---
name: "customDropdownStyle"
type: "JSX.CSSProperties"
---

::::
::::field
---
name: "customItemStyle"
type: "JSX.CSSProperties"
---

::::
::::field
---
name: "customLinkStyle"
type: "JSX.CSSProperties"
---

::::
::::field
---
name: "customActiveLinkStyle"
type: "JSX.CSSProperties"
---

::::
::::field
---
name: "customDisabledLinkStyle"
type: "JSX.CSSProperties"
---
Inline style applied to the main switcher button when the current locale is
marked as `disabled: true` in locale config. Disabled locales are omitted from dropdown items.
::::
::::field
---
name: "customIconStyle"
type: "JSX.CSSProperties"
---

::::
:::
::

#### `I18nTComponent`

What fills a `{name}` placeholder. A function may run per occurrence; one node can only stand in one place.

```ts
type I18nTComponent = JSX.Element | (() => JSX.Element)
```

#### `I18nTProps`

```ts
interface I18nTProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'children'>, ResolveTextOptions
```

::field-group
:::field
---
name: "tag"
type: "string"
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
type: "JSX.Element | ((props: { translation: string; }) => JSX.Element)"
---
Replaces the text. As a function it gets the translation, like Vue's default slot.
:::
::

**See** [`ResolveTextOptions`](/api/packages/core#resolvetextoptions)

#### `RouteTarget`

Where a link or a switch goes.

```ts
type RouteTarget = string | {
  path?: string;
}
```

#### `SolidI18nOptions`

```ts
type SolidI18nOptions = I18nOptions
```

**See** [`I18nOptions`](/api/packages/node#i18noptions)

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
type UseI18nReturn = ReturnType<typeof createApi>
```

### Re-exports

Declared in another package of this repository and documented on its page.

- From [`@i18n-micro/core`](/api/packages/core): [`defaultPlural`](/api/packages/core#defaultplural) · [`interpolate`](/api/packages/core#interpolate) · [`FormatService`](/api/packages/core#formatservice)
- From [`@i18n-micro/types`](/api/packages/types): [`CleanTranslation`](/api/packages/types#cleantranslation) · [`Getter`](/api/packages/types#getter) · [`Locale`](/api/packages/types#locale) · [`LocaleCode`](/api/packages/types#localecode) · [`ModuleOptions`](/api/packages/types#moduleoptions) · [`Params`](/api/packages/types#params) · [`PluralFunc`](/api/packages/types#pluralfunc) · [`TranslationKey`](/api/packages/types#translationkey) · [`Translations`](/api/packages/types#translations)

## `@i18n-micro/solid/router`

Also exports, as `@i18n-micro/solid` does: [`I18nRoutingStrategy`](#i18nroutingstrategy).

### Functions

#### `createSolidRouterAdapter`

Factory for Solid Router adapter

`location` is the router's reactive object, so reading the path inside a memo or JSX follows
navigation without a signal of its own.

```ts
function createSolidRouterAdapter(
  locales: Locale[],
  defaultLocale: string,
  navigate: NavigateFunction,
  location: Location,
): I18nRoutingStrategy
```

::field-group
:::field
---
name: "locales"
type: "Locale[]"
required: true
---
Array of locale configurations
:::
:::field
---
name: "defaultLocale"
type: "string"
required: true
---
Default locale code
:::
:::field
---
name: "navigate"
type: "NavigateFunction"
required: true
---
Navigation function from
:::
:::field
---
name: "location"
type: "Location"
required: true
---
Location object from
:::
::

**Returns** — I18nRoutingStrategy

```ts
const RouterRoot: Component = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const routingStrategy = createSolidRouterAdapter(locales, defaultLocale, navigate, location)
  // ...
}
```

**See** [`Locale`](/api/packages/types#locale) · [`I18nRoutingStrategy`](#i18nroutingstrategy)

---

Generated from the TypeScript sources and their JSDoc by `pnpm run docs:generate`.
Back to [all packages](/api/packages) · [Integration guides](/integrations/)
