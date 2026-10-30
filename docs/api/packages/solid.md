---
title: '@i18n-micro/solid'
description: 'Exported API of @i18n-micro/solid, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/solid`

39 exports across 2 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/contributing/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/solid`

```ts
import { /* … */ } from '@i18n-micro/solid'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `CleanTranslation` | type | `string \| number \| boolean \| Translations \| PluralTranslations \| null` |
| `createI18n` | function | `(options: SolidI18nOptions) => SolidI18n` |
| `defaultPlural` | const | `PluralFunc` |
| `FormatService` | class | 21 members |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `I18nContext` | const | `import("solid-js").Context<I18nContextValue \| undefined>` |
| `I18nContextValue` | interface | 5 members |
| `I18nGroup` | const | `Component<I18nGroupProps>` |
| `I18nGroupProps` | interface | 338 members |
| `I18nLink` | const | `Component<I18nLinkProps>` |
| `I18nLinkProps` | interface | 360 members |
| `I18nProvider` | const | `ParentComponent<I18nProviderProps>` |
| `I18nProviderProps` | interface | 4 members |
| `I18nRoutingStrategy` | interface | 6 members |
| `I18nSwitcher` | const | `Component<I18nSwitcherProps>` |
| `I18nSwitcherProps` | interface | 351 members |
| `I18nT` | const | `Component<I18nTProps>` |
| `I18nTComponent` | type | `JSX.Element \| (() => JSX.Element)` |
| `I18nTProps` | interface | 349 members |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `Locale` | interface | 11 members |
| `LocaleCode` | type | `string` |
| `ModuleOptions` | interface | 51 members |
| `Params` | type | `Record<string, string \| number \| boolean>` |
| `PluralFunc` | type | `(key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string \| null` |
| `RouteTarget` | type | `string \| { path?: string }` |
| `SolidI18n` | class | 67 members |
| `SolidI18nOptions` | type | `I18nOptions` |
| `TranslationKey` | type | `Exclude<keyof DefineLocaleMessage, '__augmentation'> extends never ? string : Exclude<keyof DefineLocaleMessage, '__augmentation'> \| (string & {})` |
| `Translations` | interface | 1 members |
| `useI18n` | function | `(options?: UseI18nOptions) => UseI18nReturn` |
| `useI18nContext` | const | `() => SolidI18n` |
| `useI18nDefaultLocale` | const | `() => string \| undefined` |
| `useI18nLocales` | const | `() => Locale[] \| undefined` |
| `UseI18nOptions` | interface | 2 members |
| `UseI18nReturn` | type | `ReturnType<typeof createApi>` |
| `useI18nRouter` | const | `() => I18nRoutingStrategy \| undefined` |

<code>FormatService</code> — 21 members, identical to [`FormatService`](/api/packages/astro).

<details>
<summary><code>I18nContextValue</code> — 5 members</summary>

| Member | Type |
| --- | --- |
| `api?` | `{ instance: SolidI18n; locale: import("solid-js").Accessor<string>; getLocales: () => Locale[]; defaultLocale: () => string; getLocaleName: () => string \| null; localeRoute: (to: import(".").RouteTarget, code?: string) => import(".").RouteTarget; localePath: (to: import(".").RouteTarget, locale?: string) => string; switchLocale: (newLocale: string) => void; t: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null, routeContext?: unknown) => import("@i18n-micro/types").CleanTranslation; ts: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string, routeContext?: unknown) => string; tc: (key: import("@i18n-micro/types").TranslationKey, count: number \| import("@i18n-micro/types").Params, defaultValue?: string) => string; tn: { (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }; td: { (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: import("@i18n-micro/types").TranslationKey, routeContext?: unknown) => boolean; setRoute: (routeName: string) => void; getRoute: () => string; getLocale: () => string; addTranslations: (locale: string, translations: import("@i18n-micro/types").Translations, merge?: boolean) => void; addRouteTranslations: (locale: string, routeName: string, translations: import("@i18n-micro/types").Translations, merge?: boolean) => void; resolveTranslations: (routeContext?: unknown) => import("@i18n-micro/types").Translations; setTranslation: (key: import("@i18n-micro/types").TranslationKey, value: unknown) => void; clearCache: () => void; } \| undefined` |
| `defaultLocale` | `string \| undefined` |
| `i18n` | `SolidI18n` |
| `locales` | `Locale[] \| undefined` |
| `router` | `I18nRoutingStrategy \| undefined` |

</details>

<details>
<summary><code>I18nGroupProps</code> — 338 members</summary>

| Member | Type |
| --- | --- |
| `$ServerOnly?` | `boolean \| undefined` |
| `about?` | `string \| undefined` |
| `accesskey?` | `string \| undefined` |
| `accessKey?` | `string \| undefined` |
| `aria-activedescendant?` | `string \| undefined` |
| `aria-atomic?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-autocomplete?` | `"none" \| "inline" \| "list" \| "both" \| undefined` |
| `aria-braillelabel?` | `string \| undefined` |
| `aria-brailleroledescription?` | `string \| undefined` |
| `aria-busy?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-checked?` | `boolean \| "true" \| "false" \| "mixed" \| undefined` |
| `aria-colcount?` | `string \| number \| undefined` |
| `aria-colindex?` | `string \| number \| undefined` |
| `aria-colindextext?` | `string \| number \| undefined` |
| `aria-colspan?` | `string \| number \| undefined` |
| `aria-controls?` | `string \| undefined` |
| `aria-current?` | `boolean \| "true" \| "false" \| "page" \| "step" \| "location" \| "date" \| "time" \| undefined` |
| `aria-describedby?` | `string \| undefined` |
| `aria-description?` | `string \| undefined` |
| `aria-details?` | `string \| undefined` |
| `aria-disabled?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-dropeffect?` | `"none" \| "copy" \| "execute" \| "link" \| "move" \| "popup" \| undefined` |
| `aria-errormessage?` | `string \| undefined` |
| `aria-expanded?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-flowto?` | `string \| undefined` |
| `aria-grabbed?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-haspopup?` | `boolean \| "true" \| "false" \| "menu" \| "listbox" \| "tree" \| "grid" \| "dialog" \| undefined` |
| `aria-hidden?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-invalid?` | `boolean \| "true" \| "false" \| "grammar" \| "spelling" \| undefined` |
| `aria-keyshortcuts?` | `string \| undefined` |
| `aria-label?` | `string \| undefined` |
| `aria-labelledby?` | `string \| undefined` |
| `aria-level?` | `string \| number \| undefined` |
| `aria-live?` | `"off" \| "assertive" \| "polite" \| undefined` |
| `aria-modal?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-multiline?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-multiselectable?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-orientation?` | `"horizontal" \| "vertical" \| undefined` |
| `aria-owns?` | `string \| undefined` |
| `aria-placeholder?` | `string \| undefined` |
| `aria-posinset?` | `string \| number \| undefined` |
| `aria-pressed?` | `boolean \| "true" \| "false" \| "mixed" \| undefined` |
| `aria-readonly?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-relevant?` | `"text" \| "additions" \| "additions removals" \| "additions text" \| "all" \| "removals" \| "removals additions" \| "removals text" \| "text additions" \| "text removals" \| undefined` |
| `aria-required?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-roledescription?` | `string \| undefined` |
| `aria-rowcount?` | `string \| number \| undefined` |
| `aria-rowindex?` | `string \| number \| undefined` |
| `aria-rowindextext?` | `string \| number \| undefined` |
| `aria-rowspan?` | `string \| number \| undefined` |
| `aria-selected?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-setsize?` | `string \| number \| undefined` |
| `aria-sort?` | `"none" \| "ascending" \| "descending" \| "other" \| undefined` |
| `aria-valuemax?` | `string \| number \| undefined` |
| `aria-valuemin?` | `string \| number \| undefined` |
| `aria-valuenow?` | `string \| number \| undefined` |
| `aria-valuetext?` | `string \| undefined` |
| `autocapitalize?` | `HTMLAutocapitalize \| undefined` |
| `autoCapitalize?` | `HTMLAutocapitalize \| undefined` |
| `autocorrect?` | `"off" \| "on" \| undefined` |
| `autofocus?` | `boolean \| undefined` |
| `children?` | `JSX.Element \| ((props: { prefix: string; t: (key: string, params?: Record<string, string \| number \| boolean>) => string; }) => JSX.Element)` |
| `class?` | `string \| undefined` |
| `classList?` | `ClassList \| undefined` |
| `contenteditable?` | `boolean \| "true" \| "false" \| "plaintext-only" \| "inherit" \| undefined` |
| `contentEditable?` | `boolean \| "plaintext-only" \| "inherit" \| undefined` |
| `contextmenu?` | `string \| undefined` |
| `contextMenu?` | `string \| undefined` |
| `datatype?` | `string \| undefined` |
| `dir?` | `HTMLDir \| undefined` |
| `draggable?` | `boolean \| "true" \| "false" \| undefined` |
| `elementtiming?` | `string \| undefined` |
| `enterkeyhint?` | `"enter" \| "done" \| "go" \| "next" \| "previous" \| "search" \| "send" \| undefined` |
| `exportparts?` | `string \| undefined` |
| `exportParts?` | `string \| undefined` |
| `groupClass?` | `string \| undefined` |
| `hidden?` | `boolean \| "hidden" \| "until-found" \| undefined` |
| `id?` | `string \| undefined` |
| `inert?` | `boolean \| undefined` |
| `inlist?` | `any` |
| `innerHTML?` | `string \| undefined` |
| `innerText?` | `string \| number \| undefined` |
| `inputmode?` | `"none" \| "search" \| "decimal" \| "email" \| "numeric" \| "tel" \| "text" \| "url" \| undefined` |
| `inputMode?` | `"none" \| "search" \| "decimal" \| "email" \| "numeric" \| "tel" \| "text" \| "url" \| undefined` |
| `is?` | `string \| undefined` |
| `itemid?` | `string \| undefined` |
| `itemId?` | `string \| undefined` |
| `itemprop?` | `string \| undefined` |
| `itemProp?` | `string \| undefined` |
| `itemref?` | `string \| undefined` |
| `itemRef?` | `string \| undefined` |
| `itemscope?` | `boolean \| undefined` |
| `itemScope?` | `boolean \| undefined` |
| `itemtype?` | `string \| undefined` |
| `itemType?` | `string \| undefined` |
| `lang?` | `string \| undefined` |
| `nonce?` | `string \| undefined` |
| `onabort?` | `EventHandlerUnion<HTMLDivElement, UIEvent, EventHandler<HTMLDivElement, UIEvent>> \| undefined` |
| `onAbort?` | `EventHandlerUnion<HTMLDivElement, UIEvent, EventHandler<HTMLDivElement, UIEvent>> \| undefined` |
| `onanimationcancel?` | `EventHandlerUnion<HTMLDivElement, AnimationEvent, EventHandler<HTMLDivElement, AnimationEvent>> \| undefined` |
| `onAnimationCancel?` | `EventHandlerUnion<HTMLDivElement, AnimationEvent, EventHandler<HTMLDivElement, AnimationEvent>> \| undefined` |
| `onanimationend?` | `EventHandlerUnion<HTMLDivElement, AnimationEvent, EventHandler<HTMLDivElement, AnimationEvent>> \| undefined` |
| `onAnimationEnd?` | `EventHandlerUnion<HTMLDivElement, AnimationEvent, EventHandler<HTMLDivElement, AnimationEvent>> \| undefined` |
| `onanimationiteration?` | `EventHandlerUnion<HTMLDivElement, AnimationEvent, EventHandler<HTMLDivElement, AnimationEvent>> \| undefined` |
| `onAnimationIteration?` | `EventHandlerUnion<HTMLDivElement, AnimationEvent, EventHandler<HTMLDivElement, AnimationEvent>> \| undefined` |
| `onanimationstart?` | `EventHandlerUnion<HTMLDivElement, AnimationEvent, EventHandler<HTMLDivElement, AnimationEvent>> \| undefined` |
| `onAnimationStart?` | `EventHandlerUnion<HTMLDivElement, AnimationEvent, EventHandler<HTMLDivElement, AnimationEvent>> \| undefined` |
| `onauxclick?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onAuxClick?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onbeforecopy?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onBeforeCopy?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onbeforecut?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onBeforeCut?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onbeforeinput?` | `InputEventHandlerUnion<HTMLDivElement, InputEvent> \| undefined` |
| `onBeforeInput?` | `InputEventHandlerUnion<HTMLDivElement, InputEvent> \| undefined` |
| `onbeforematch?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onBeforeMatch?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onbeforepaste?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onBeforePaste?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onbeforetoggle?` | `EventHandlerUnion<HTMLDivElement, ToggleEvent, EventHandler<HTMLDivElement, ToggleEvent>> \| undefined` |
| `onBeforeToggle?` | `EventHandlerUnion<HTMLDivElement, ToggleEvent, EventHandler<HTMLDivElement, ToggleEvent>> \| undefined` |
| `onbeforexrselect?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onBeforeXRSelect?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onblur?` | `FocusEventHandlerUnion<HTMLDivElement, FocusEvent> \| undefined` |
| `onBlur?` | `FocusEventHandlerUnion<HTMLDivElement, FocusEvent> \| undefined` |
| `oncancel?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onCancel?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `oncanplay?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onCanPlay?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `oncanplaythrough?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onCanPlayThrough?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onchange?` | `ChangeEventHandlerUnion<HTMLDivElement, Event> \| undefined` |
| `onChange?` | `ChangeEventHandlerUnion<HTMLDivElement, Event> \| undefined` |
| `onclick?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onClick?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onclose?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onClose?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `oncommand?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onCommand?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `oncompositionend?` | `EventHandlerUnion<HTMLDivElement, CompositionEvent, EventHandler<HTMLDivElement, CompositionEvent>> \| undefined` |
| `onCompositionEnd?` | `EventHandlerUnion<HTMLDivElement, CompositionEvent, EventHandler<HTMLDivElement, CompositionEvent>> \| undefined` |
| `oncompositionstart?` | `EventHandlerUnion<HTMLDivElement, CompositionEvent, EventHandler<HTMLDivElement, CompositionEvent>> \| undefined` |
| `onCompositionStart?` | `EventHandlerUnion<HTMLDivElement, CompositionEvent, EventHandler<HTMLDivElement, CompositionEvent>> \| undefined` |
| `oncompositionupdate?` | `EventHandlerUnion<HTMLDivElement, CompositionEvent, EventHandler<HTMLDivElement, CompositionEvent>> \| undefined` |
| `onCompositionUpdate?` | `EventHandlerUnion<HTMLDivElement, CompositionEvent, EventHandler<HTMLDivElement, CompositionEvent>> \| undefined` |
| `oncontentvisibilityautostatechange?` | `EventHandlerUnion<HTMLDivElement, ContentVisibilityAutoStateChangeEvent, EventHandler<HTMLDivElement, ContentVisibilityAutoStateChangeEvent>> \| undefined` |
| `onContentVisibilityAutoStateChange?` | `EventHandlerUnion<HTMLDivElement, ContentVisibilityAutoStateChangeEvent, EventHandler<HTMLDivElement, ContentVisibilityAutoStateChangeEvent>> \| undefined` |
| `oncontextlost?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onContextLost?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `oncontextmenu?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onContextMenu?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `oncontextrestored?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onContextRestored?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `oncopy?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onCopy?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `oncuechange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onCueChange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `oncut?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onCut?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `ondblclick?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onDblClick?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `ondrag?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `onDrag?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `ondragend?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `onDragEnd?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `ondragenter?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `onDragEnter?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `ondragexit?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `onDragExit?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `ondragleave?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `onDragLeave?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `ondragover?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `onDragOver?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `ondragstart?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `onDragStart?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `ondrop?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `onDrop?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `ondurationchange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onDurationChange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onemptied?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onEmptied?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onended?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onEnded?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onerror?` | `EventHandlerUnion<HTMLDivElement, ErrorEvent, EventHandler<HTMLDivElement, ErrorEvent>> \| undefined` |
| `onError?` | `EventHandlerUnion<HTMLDivElement, ErrorEvent, EventHandler<HTMLDivElement, ErrorEvent>> \| undefined` |
| `onfocus?` | `FocusEventHandlerUnion<HTMLDivElement, FocusEvent> \| undefined` |
| `onFocus?` | `FocusEventHandlerUnion<HTMLDivElement, FocusEvent> \| undefined` |
| `onfocusin?` | `FocusEventHandlerUnion<HTMLDivElement, FocusEvent> \| undefined` |
| `onFocusIn?` | `FocusEventHandlerUnion<HTMLDivElement, FocusEvent> \| undefined` |
| `onfocusout?` | `FocusEventHandlerUnion<HTMLDivElement, FocusEvent> \| undefined` |
| `onFocusOut?` | `FocusEventHandlerUnion<HTMLDivElement, FocusEvent> \| undefined` |
| `onformdata?` | `EventHandlerUnion<HTMLDivElement, FormDataEvent, EventHandler<HTMLDivElement, FormDataEvent>> \| undefined` |
| `onFormData?` | `EventHandlerUnion<HTMLDivElement, FormDataEvent, EventHandler<HTMLDivElement, FormDataEvent>> \| undefined` |
| `onfullscreenchange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onFullscreenChange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onfullscreenerror?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onFullscreenError?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `ongotpointercapture?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onGotPointerCapture?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `oninput?` | `InputEventHandlerUnion<HTMLDivElement, InputEvent> \| undefined` |
| `onInput?` | `InputEventHandlerUnion<HTMLDivElement, InputEvent> \| undefined` |
| `oninvalid?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onInvalid?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onkeydown?` | `EventHandlerUnion<HTMLDivElement, KeyboardEvent, EventHandler<HTMLDivElement, KeyboardEvent>> \| undefined` |
| `onKeyDown?` | `EventHandlerUnion<HTMLDivElement, KeyboardEvent, EventHandler<HTMLDivElement, KeyboardEvent>> \| undefined` |
| `onkeypress?` | `EventHandlerUnion<HTMLDivElement, KeyboardEvent, EventHandler<HTMLDivElement, KeyboardEvent>> \| undefined` |
| `onKeyPress?` | `EventHandlerUnion<HTMLDivElement, KeyboardEvent, EventHandler<HTMLDivElement, KeyboardEvent>> \| undefined` |
| `onkeyup?` | `EventHandlerUnion<HTMLDivElement, KeyboardEvent, EventHandler<HTMLDivElement, KeyboardEvent>> \| undefined` |
| `onKeyUp?` | `EventHandlerUnion<HTMLDivElement, KeyboardEvent, EventHandler<HTMLDivElement, KeyboardEvent>> \| undefined` |
| `onload?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onLoad?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onloadeddata?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onLoadedData?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onloadedmetadata?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onLoadedMetadata?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onloadstart?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onLoadStart?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onlostpointercapture?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onLostPointerCapture?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onmousedown?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onMouseDown?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onmouseenter?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onMouseEnter?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onmouseleave?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onMouseLeave?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onmousemove?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onMouseMove?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onmouseout?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onMouseOut?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onmouseover?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onMouseOver?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onmouseup?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onMouseUp?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onpaste?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onPaste?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onpause?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onPause?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onplay?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onPlay?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onplaying?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onPlaying?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onpointercancel?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onPointerCancel?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onpointerdown?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onPointerDown?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onpointerenter?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onPointerEnter?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onpointerleave?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onPointerLeave?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onpointermove?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onPointerMove?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onpointerout?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onPointerOut?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onpointerover?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onPointerOver?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onpointerrawupdate?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onPointerRawUpdate?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onpointerup?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onPointerUp?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onprogress?` | `EventHandlerUnion<HTMLDivElement, ProgressEvent<EventTarget>, EventHandler<HTMLDivElement, ProgressEvent<EventTarget>>> \| undefined` |
| `onProgress?` | `EventHandlerUnion<HTMLDivElement, ProgressEvent<EventTarget>, EventHandler<HTMLDivElement, ProgressEvent<EventTarget>>> \| undefined` |
| `onratechange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onRateChange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onreset?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onReset?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onresize?` | `EventHandlerUnion<HTMLDivElement, UIEvent, EventHandler<HTMLDivElement, UIEvent>> \| undefined` |
| `onResize?` | `EventHandlerUnion<HTMLDivElement, UIEvent, EventHandler<HTMLDivElement, UIEvent>> \| undefined` |
| `onscroll?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onScroll?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onscrollend?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onScrollEnd?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onscrollsnapchange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onScrollSnapChange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onscrollsnapchanging?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onScrollSnapChanging?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onsecuritypolicyviolation?` | `EventHandlerUnion<HTMLDivElement, SecurityPolicyViolationEvent, EventHandler<HTMLDivElement, SecurityPolicyViolationEvent>> \| undefined` |
| `onSecurityPolicyViolation?` | `EventHandlerUnion<HTMLDivElement, SecurityPolicyViolationEvent, EventHandler<HTMLDivElement, SecurityPolicyViolationEvent>> \| undefined` |
| `onseeked?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onSeeked?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onseeking?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onSeeking?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onselect?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onSelect?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onselectionchange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onSelectionChange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onselectstart?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onSelectStart?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onslotchange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onSlotChange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onstalled?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onStalled?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onsubmit?` | `EventHandlerUnion<HTMLDivElement, SubmitEvent, EventHandler<HTMLDivElement, SubmitEvent>> \| undefined` |
| `onSubmit?` | `EventHandlerUnion<HTMLDivElement, SubmitEvent, EventHandler<HTMLDivElement, SubmitEvent>> \| undefined` |
| `onsuspend?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onSuspend?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `ontimeupdate?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onTimeUpdate?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `ontoggle?` | `EventHandlerUnion<HTMLDivElement, ToggleEvent, EventHandler<HTMLDivElement, ToggleEvent>> \| undefined` |
| `onToggle?` | `EventHandlerUnion<HTMLDivElement, ToggleEvent, EventHandler<HTMLDivElement, ToggleEvent>> \| undefined` |
| `ontouchcancel?` | `EventHandlerUnion<HTMLDivElement, TouchEvent, EventHandler<HTMLDivElement, TouchEvent>> \| undefined` |
| `onTouchCancel?` | `EventHandlerUnion<HTMLDivElement, TouchEvent, EventHandler<HTMLDivElement, TouchEvent>> \| undefined` |
| `ontouchend?` | `EventHandlerUnion<HTMLDivElement, TouchEvent, EventHandler<HTMLDivElement, TouchEvent>> \| undefined` |
| `onTouchEnd?` | `EventHandlerUnion<HTMLDivElement, TouchEvent, EventHandler<HTMLDivElement, TouchEvent>> \| undefined` |
| `ontouchmove?` | `EventHandlerUnion<HTMLDivElement, TouchEvent, EventHandler<HTMLDivElement, TouchEvent>> \| undefined` |
| `onTouchMove?` | `EventHandlerUnion<HTMLDivElement, TouchEvent, EventHandler<HTMLDivElement, TouchEvent>> \| undefined` |
| `ontouchstart?` | `EventHandlerUnion<HTMLDivElement, TouchEvent, EventHandler<HTMLDivElement, TouchEvent>> \| undefined` |
| `onTouchStart?` | `EventHandlerUnion<HTMLDivElement, TouchEvent, EventHandler<HTMLDivElement, TouchEvent>> \| undefined` |
| `ontransitioncancel?` | `EventHandlerUnion<HTMLDivElement, TransitionEvent, EventHandler<HTMLDivElement, TransitionEvent>> \| undefined` |
| `onTransitionCancel?` | `EventHandlerUnion<HTMLDivElement, TransitionEvent, EventHandler<HTMLDivElement, TransitionEvent>> \| undefined` |
| `ontransitionend?` | `EventHandlerUnion<HTMLDivElement, TransitionEvent, EventHandler<HTMLDivElement, TransitionEvent>> \| undefined` |
| `onTransitionEnd?` | `EventHandlerUnion<HTMLDivElement, TransitionEvent, EventHandler<HTMLDivElement, TransitionEvent>> \| undefined` |
| `ontransitionrun?` | `EventHandlerUnion<HTMLDivElement, TransitionEvent, EventHandler<HTMLDivElement, TransitionEvent>> \| undefined` |
| `onTransitionRun?` | `EventHandlerUnion<HTMLDivElement, TransitionEvent, EventHandler<HTMLDivElement, TransitionEvent>> \| undefined` |
| `ontransitionstart?` | `EventHandlerUnion<HTMLDivElement, TransitionEvent, EventHandler<HTMLDivElement, TransitionEvent>> \| undefined` |
| `onTransitionStart?` | `EventHandlerUnion<HTMLDivElement, TransitionEvent, EventHandler<HTMLDivElement, TransitionEvent>> \| undefined` |
| `onvolumechange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onVolumeChange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onwaiting?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onWaiting?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onwheel?` | `EventHandlerUnion<HTMLDivElement, WheelEvent, EventHandler<HTMLDivElement, WheelEvent>> \| undefined` |
| `onWheel?` | `EventHandlerUnion<HTMLDivElement, WheelEvent, EventHandler<HTMLDivElement, WheelEvent>> \| undefined` |
| `part?` | `string \| undefined` |
| `popover?` | `boolean \| "auto" \| "manual" \| undefined` |
| `prefix` | `string` |
| `property?` | `string \| undefined` |
| `ref?` | `HTMLDivElement \| ((el: HTMLDivElement) => void) \| undefined` |
| `resource?` | `string \| undefined` |
| `role?` | `"none" \| "search" \| "list" \| "link" \| "menu" \| "listbox" \| "tree" \| "grid" \| "dialog" \| "alert" \| "alertdialog" \| "application" \| "article" \| "banner" \| "button" \| "cell" \| "checkbox" \| "columnheader" \| "combobox" \| "complementary" \| "contentinfo" \| "definition" \| "directory" \| "document" \| "feed" \| "figure" \| "form" \| "gridcell" \| "group" \| "heading" \| "img" \| "listitem" \| "log" \| "main" \| "marquee" \| "math" \| "menubar" \| "menuitem" \| "menuitemcheckbox" \| "menuitemradio" \| "meter" \| "navigation" \| "note" \| "option" \| "presentation" \| "progressbar" \| "radio" \| "radiogroup" \| "region" \| "row" \| "rowgroup" \| "rowheader" \| "scrollbar" \| "searchbox" \| "separator" \| "slider" \| "spinbutton" \| "status" \| "switch" \| "tab" \| "table" \| "tablist" \| "tabpanel" \| "term" \| "textbox" \| "timer" \| "toolbar" \| "tooltip" \| "treegrid" \| "treeitem" \| undefined` |
| `slot?` | `string \| undefined` |
| `spellcheck?` | `boolean \| "true" \| "false" \| undefined` |
| `style?` | `string \| CSSProperties \| undefined` |
| `tabindex?` | `string \| number \| undefined` |
| `tabIndex?` | `string \| number \| undefined` |
| `textContent?` | `string \| number \| undefined` |
| `title?` | `string \| undefined` |
| `translate?` | `"yes" \| "no" \| undefined` |
| `typeof?` | `string \| undefined` |
| `vocab?` | `string \| undefined` |

</details>

<details>
<summary><code>I18nLinkProps</code> — 360 members</summary>

| Member | Type |
| --- | --- |
| `$ServerOnly?` | `boolean \| undefined` |
| `about?` | `string \| undefined` |
| `accesskey?` | `string \| undefined` |
| `accessKey?` | `string \| undefined` |
| `activeStyle?` | `JSX.CSSProperties \| undefined` |
| `aria-activedescendant?` | `string \| undefined` |
| `aria-atomic?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-autocomplete?` | `"none" \| "inline" \| "list" \| "both" \| undefined` |
| `aria-braillelabel?` | `string \| undefined` |
| `aria-brailleroledescription?` | `string \| undefined` |
| `aria-busy?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-checked?` | `boolean \| "true" \| "false" \| "mixed" \| undefined` |
| `aria-colcount?` | `string \| number \| undefined` |
| `aria-colindex?` | `string \| number \| undefined` |
| `aria-colindextext?` | `string \| number \| undefined` |
| `aria-colspan?` | `string \| number \| undefined` |
| `aria-controls?` | `string \| undefined` |
| `aria-current?` | `boolean \| "true" \| "false" \| "page" \| "step" \| "location" \| "date" \| "time" \| undefined` |
| `aria-describedby?` | `string \| undefined` |
| `aria-description?` | `string \| undefined` |
| `aria-details?` | `string \| undefined` |
| `aria-disabled?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-dropeffect?` | `"none" \| "copy" \| "execute" \| "link" \| "move" \| "popup" \| undefined` |
| `aria-errormessage?` | `string \| undefined` |
| `aria-expanded?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-flowto?` | `string \| undefined` |
| `aria-grabbed?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-haspopup?` | `boolean \| "true" \| "false" \| "menu" \| "listbox" \| "tree" \| "grid" \| "dialog" \| undefined` |
| `aria-hidden?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-invalid?` | `boolean \| "true" \| "false" \| "grammar" \| "spelling" \| undefined` |
| `aria-keyshortcuts?` | `string \| undefined` |
| `aria-label?` | `string \| undefined` |
| `aria-labelledby?` | `string \| undefined` |
| `aria-level?` | `string \| number \| undefined` |
| `aria-live?` | `"off" \| "assertive" \| "polite" \| undefined` |
| `aria-modal?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-multiline?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-multiselectable?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-orientation?` | `"horizontal" \| "vertical" \| undefined` |
| `aria-owns?` | `string \| undefined` |
| `aria-placeholder?` | `string \| undefined` |
| `aria-posinset?` | `string \| number \| undefined` |
| `aria-pressed?` | `boolean \| "true" \| "false" \| "mixed" \| undefined` |
| `aria-readonly?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-relevant?` | `"text" \| "additions" \| "additions removals" \| "additions text" \| "all" \| "removals" \| "removals additions" \| "removals text" \| "text additions" \| "text removals" \| undefined` |
| `aria-required?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-roledescription?` | `string \| undefined` |
| `aria-rowcount?` | `string \| number \| undefined` |
| `aria-rowindex?` | `string \| number \| undefined` |
| `aria-rowindextext?` | `string \| number \| undefined` |
| `aria-rowspan?` | `string \| number \| undefined` |
| `aria-selected?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-setsize?` | `string \| number \| undefined` |
| `aria-sort?` | `"none" \| "ascending" \| "descending" \| "other" \| undefined` |
| `aria-valuemax?` | `string \| number \| undefined` |
| `aria-valuemin?` | `string \| number \| undefined` |
| `aria-valuenow?` | `string \| number \| undefined` |
| `aria-valuetext?` | `string \| undefined` |
| `attributionsrc?` | `string \| undefined` |
| `autocapitalize?` | `HTMLAutocapitalize \| undefined` |
| `autoCapitalize?` | `HTMLAutocapitalize \| undefined` |
| `autocorrect?` | `"off" \| "on" \| undefined` |
| `autofocus?` | `boolean \| undefined` |
| `charset?` | `string \| undefined` |
| `children?` | `Element` |
| `class?` | `string \| undefined` |
| `classList?` | `ClassList \| undefined` |
| `contenteditable?` | `boolean \| "true" \| "false" \| "plaintext-only" \| "inherit" \| undefined` |
| `contentEditable?` | `boolean \| "plaintext-only" \| "inherit" \| undefined` |
| `contextmenu?` | `string \| undefined` |
| `contextMenu?` | `string \| undefined` |
| `coords?` | `string \| undefined` |
| `datatype?` | `string \| undefined` |
| `dir?` | `HTMLDir \| undefined` |
| `download?` | `string \| undefined` |
| `draggable?` | `boolean \| "true" \| "false" \| undefined` |
| `elementtiming?` | `string \| undefined` |
| `enterkeyhint?` | `"enter" \| "done" \| "go" \| "next" \| "previous" \| "search" \| "send" \| undefined` |
| `exportparts?` | `string \| undefined` |
| `exportParts?` | `string \| undefined` |
| `hidden?` | `boolean \| "hidden" \| "until-found" \| undefined` |
| `href?` | `string \| undefined` |
| `hreflang?` | `string \| undefined` |
| `id?` | `string \| undefined` |
| `inert?` | `boolean \| undefined` |
| `inlist?` | `any` |
| `innerHTML?` | `string \| undefined` |
| `innerText?` | `string \| number \| undefined` |
| `inputmode?` | `"none" \| "search" \| "decimal" \| "email" \| "numeric" \| "tel" \| "text" \| "url" \| undefined` |
| `inputMode?` | `"none" \| "search" \| "decimal" \| "email" \| "numeric" \| "tel" \| "text" \| "url" \| undefined` |
| `is?` | `string \| undefined` |
| `itemid?` | `string \| undefined` |
| `itemId?` | `string \| undefined` |
| `itemprop?` | `string \| undefined` |
| `itemProp?` | `string \| undefined` |
| `itemref?` | `string \| undefined` |
| `itemRef?` | `string \| undefined` |
| `itemscope?` | `boolean \| undefined` |
| `itemScope?` | `boolean \| undefined` |
| `itemtype?` | `string \| undefined` |
| `itemType?` | `string \| undefined` |
| `lang?` | `string \| undefined` |
| `link?` | `boolean \| undefined` |
| `localeRoute?` | `((to: RouteTarget, locale?: string) => RouteTarget) \| undefined` |
| `name?` | `string \| undefined` |
| `nonce?` | `string \| undefined` |
| `noScroll?` | `boolean \| undefined` |
| `onabort?` | `EventHandlerUnion<HTMLAnchorElement, UIEvent, EventHandler<HTMLAnchorElement, UIEvent>> \| undefined` |
| `onAbort?` | `EventHandlerUnion<HTMLAnchorElement, UIEvent, EventHandler<HTMLAnchorElement, UIEvent>> \| undefined` |
| `onanimationcancel?` | `EventHandlerUnion<HTMLAnchorElement, AnimationEvent, EventHandler<HTMLAnchorElement, AnimationEvent>> \| undefined` |
| `onAnimationCancel?` | `EventHandlerUnion<HTMLAnchorElement, AnimationEvent, EventHandler<HTMLAnchorElement, AnimationEvent>> \| undefined` |
| `onanimationend?` | `EventHandlerUnion<HTMLAnchorElement, AnimationEvent, EventHandler<HTMLAnchorElement, AnimationEvent>> \| undefined` |
| `onAnimationEnd?` | `EventHandlerUnion<HTMLAnchorElement, AnimationEvent, EventHandler<HTMLAnchorElement, AnimationEvent>> \| undefined` |
| `onanimationiteration?` | `EventHandlerUnion<HTMLAnchorElement, AnimationEvent, EventHandler<HTMLAnchorElement, AnimationEvent>> \| undefined` |
| `onAnimationIteration?` | `EventHandlerUnion<HTMLAnchorElement, AnimationEvent, EventHandler<HTMLAnchorElement, AnimationEvent>> \| undefined` |
| `onanimationstart?` | `EventHandlerUnion<HTMLAnchorElement, AnimationEvent, EventHandler<HTMLAnchorElement, AnimationEvent>> \| undefined` |
| `onAnimationStart?` | `EventHandlerUnion<HTMLAnchorElement, AnimationEvent, EventHandler<HTMLAnchorElement, AnimationEvent>> \| undefined` |
| `onauxclick?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onAuxClick?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onbeforecopy?` | `EventHandlerUnion<HTMLAnchorElement, ClipboardEvent, EventHandler<HTMLAnchorElement, ClipboardEvent>> \| undefined` |
| `onBeforeCopy?` | `EventHandlerUnion<HTMLAnchorElement, ClipboardEvent, EventHandler<HTMLAnchorElement, ClipboardEvent>> \| undefined` |
| `onbeforecut?` | `EventHandlerUnion<HTMLAnchorElement, ClipboardEvent, EventHandler<HTMLAnchorElement, ClipboardEvent>> \| undefined` |
| `onBeforeCut?` | `EventHandlerUnion<HTMLAnchorElement, ClipboardEvent, EventHandler<HTMLAnchorElement, ClipboardEvent>> \| undefined` |
| `onbeforeinput?` | `InputEventHandlerUnion<HTMLAnchorElement, InputEvent> \| undefined` |
| `onBeforeInput?` | `InputEventHandlerUnion<HTMLAnchorElement, InputEvent> \| undefined` |
| `onbeforematch?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onBeforeMatch?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onbeforepaste?` | `EventHandlerUnion<HTMLAnchorElement, ClipboardEvent, EventHandler<HTMLAnchorElement, ClipboardEvent>> \| undefined` |
| `onBeforePaste?` | `EventHandlerUnion<HTMLAnchorElement, ClipboardEvent, EventHandler<HTMLAnchorElement, ClipboardEvent>> \| undefined` |
| `onbeforetoggle?` | `EventHandlerUnion<HTMLAnchorElement, ToggleEvent, EventHandler<HTMLAnchorElement, ToggleEvent>> \| undefined` |
| `onBeforeToggle?` | `EventHandlerUnion<HTMLAnchorElement, ToggleEvent, EventHandler<HTMLAnchorElement, ToggleEvent>> \| undefined` |
| `onbeforexrselect?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onBeforeXRSelect?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onblur?` | `FocusEventHandlerUnion<HTMLAnchorElement, FocusEvent> \| undefined` |
| `onBlur?` | `FocusEventHandlerUnion<HTMLAnchorElement, FocusEvent> \| undefined` |
| `oncancel?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onCancel?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `oncanplay?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onCanPlay?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `oncanplaythrough?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onCanPlayThrough?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onchange?` | `ChangeEventHandlerUnion<HTMLAnchorElement, Event> \| undefined` |
| `onChange?` | `ChangeEventHandlerUnion<HTMLAnchorElement, Event> \| undefined` |
| `onclick?` | `EventHandlerUnion<HTMLAnchorElement, MouseEvent, EventHandler<HTMLAnchorElement, MouseEvent>> \| undefined` |
| `onClick?` | `EventHandlerUnion<HTMLAnchorElement, MouseEvent, EventHandler<HTMLAnchorElement, MouseEvent>> \| undefined` |
| `onclose?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onClose?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `oncommand?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onCommand?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `oncompositionend?` | `EventHandlerUnion<HTMLAnchorElement, CompositionEvent, EventHandler<HTMLAnchorElement, CompositionEvent>> \| undefined` |
| `onCompositionEnd?` | `EventHandlerUnion<HTMLAnchorElement, CompositionEvent, EventHandler<HTMLAnchorElement, CompositionEvent>> \| undefined` |
| `oncompositionstart?` | `EventHandlerUnion<HTMLAnchorElement, CompositionEvent, EventHandler<HTMLAnchorElement, CompositionEvent>> \| undefined` |
| `onCompositionStart?` | `EventHandlerUnion<HTMLAnchorElement, CompositionEvent, EventHandler<HTMLAnchorElement, CompositionEvent>> \| undefined` |
| `oncompositionupdate?` | `EventHandlerUnion<HTMLAnchorElement, CompositionEvent, EventHandler<HTMLAnchorElement, CompositionEvent>> \| undefined` |
| `onCompositionUpdate?` | `EventHandlerUnion<HTMLAnchorElement, CompositionEvent, EventHandler<HTMLAnchorElement, CompositionEvent>> \| undefined` |
| `oncontentvisibilityautostatechange?` | `EventHandlerUnion<HTMLAnchorElement, ContentVisibilityAutoStateChangeEvent, EventHandler<HTMLAnchorElement, ContentVisibilityAutoStateChangeEvent>> \| undefined` |
| `onContentVisibilityAutoStateChange?` | `EventHandlerUnion<HTMLAnchorElement, ContentVisibilityAutoStateChangeEvent, EventHandler<HTMLAnchorElement, ContentVisibilityAutoStateChangeEvent>> \| undefined` |
| `oncontextlost?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onContextLost?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `oncontextmenu?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onContextMenu?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `oncontextrestored?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onContextRestored?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `oncopy?` | `EventHandlerUnion<HTMLAnchorElement, ClipboardEvent, EventHandler<HTMLAnchorElement, ClipboardEvent>> \| undefined` |
| `onCopy?` | `EventHandlerUnion<HTMLAnchorElement, ClipboardEvent, EventHandler<HTMLAnchorElement, ClipboardEvent>> \| undefined` |
| `oncuechange?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onCueChange?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `oncut?` | `EventHandlerUnion<HTMLAnchorElement, ClipboardEvent, EventHandler<HTMLAnchorElement, ClipboardEvent>> \| undefined` |
| `onCut?` | `EventHandlerUnion<HTMLAnchorElement, ClipboardEvent, EventHandler<HTMLAnchorElement, ClipboardEvent>> \| undefined` |
| `ondblclick?` | `EventHandlerUnion<HTMLAnchorElement, MouseEvent, EventHandler<HTMLAnchorElement, MouseEvent>> \| undefined` |
| `onDblClick?` | `EventHandlerUnion<HTMLAnchorElement, MouseEvent, EventHandler<HTMLAnchorElement, MouseEvent>> \| undefined` |
| `ondrag?` | `EventHandlerUnion<HTMLAnchorElement, DragEvent, EventHandler<HTMLAnchorElement, DragEvent>> \| undefined` |
| `onDrag?` | `EventHandlerUnion<HTMLAnchorElement, DragEvent, EventHandler<HTMLAnchorElement, DragEvent>> \| undefined` |
| `ondragend?` | `EventHandlerUnion<HTMLAnchorElement, DragEvent, EventHandler<HTMLAnchorElement, DragEvent>> \| undefined` |
| `onDragEnd?` | `EventHandlerUnion<HTMLAnchorElement, DragEvent, EventHandler<HTMLAnchorElement, DragEvent>> \| undefined` |
| `ondragenter?` | `EventHandlerUnion<HTMLAnchorElement, DragEvent, EventHandler<HTMLAnchorElement, DragEvent>> \| undefined` |
| `onDragEnter?` | `EventHandlerUnion<HTMLAnchorElement, DragEvent, EventHandler<HTMLAnchorElement, DragEvent>> \| undefined` |
| `ondragexit?` | `EventHandlerUnion<HTMLAnchorElement, DragEvent, EventHandler<HTMLAnchorElement, DragEvent>> \| undefined` |
| `onDragExit?` | `EventHandlerUnion<HTMLAnchorElement, DragEvent, EventHandler<HTMLAnchorElement, DragEvent>> \| undefined` |
| `ondragleave?` | `EventHandlerUnion<HTMLAnchorElement, DragEvent, EventHandler<HTMLAnchorElement, DragEvent>> \| undefined` |
| `onDragLeave?` | `EventHandlerUnion<HTMLAnchorElement, DragEvent, EventHandler<HTMLAnchorElement, DragEvent>> \| undefined` |
| `ondragover?` | `EventHandlerUnion<HTMLAnchorElement, DragEvent, EventHandler<HTMLAnchorElement, DragEvent>> \| undefined` |
| `onDragOver?` | `EventHandlerUnion<HTMLAnchorElement, DragEvent, EventHandler<HTMLAnchorElement, DragEvent>> \| undefined` |
| `ondragstart?` | `EventHandlerUnion<HTMLAnchorElement, DragEvent, EventHandler<HTMLAnchorElement, DragEvent>> \| undefined` |
| `onDragStart?` | `EventHandlerUnion<HTMLAnchorElement, DragEvent, EventHandler<HTMLAnchorElement, DragEvent>> \| undefined` |
| `ondrop?` | `EventHandlerUnion<HTMLAnchorElement, DragEvent, EventHandler<HTMLAnchorElement, DragEvent>> \| undefined` |
| `onDrop?` | `EventHandlerUnion<HTMLAnchorElement, DragEvent, EventHandler<HTMLAnchorElement, DragEvent>> \| undefined` |
| `ondurationchange?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onDurationChange?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onemptied?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onEmptied?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onended?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onEnded?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onerror?` | `EventHandlerUnion<HTMLAnchorElement, ErrorEvent, EventHandler<HTMLAnchorElement, ErrorEvent>> \| undefined` |
| `onError?` | `EventHandlerUnion<HTMLAnchorElement, ErrorEvent, EventHandler<HTMLAnchorElement, ErrorEvent>> \| undefined` |
| `onfocus?` | `FocusEventHandlerUnion<HTMLAnchorElement, FocusEvent> \| undefined` |
| `onFocus?` | `FocusEventHandlerUnion<HTMLAnchorElement, FocusEvent> \| undefined` |
| `onfocusin?` | `FocusEventHandlerUnion<HTMLAnchorElement, FocusEvent> \| undefined` |
| `onFocusIn?` | `FocusEventHandlerUnion<HTMLAnchorElement, FocusEvent> \| undefined` |
| `onfocusout?` | `FocusEventHandlerUnion<HTMLAnchorElement, FocusEvent> \| undefined` |
| `onFocusOut?` | `FocusEventHandlerUnion<HTMLAnchorElement, FocusEvent> \| undefined` |
| `onformdata?` | `EventHandlerUnion<HTMLAnchorElement, FormDataEvent, EventHandler<HTMLAnchorElement, FormDataEvent>> \| undefined` |
| `onFormData?` | `EventHandlerUnion<HTMLAnchorElement, FormDataEvent, EventHandler<HTMLAnchorElement, FormDataEvent>> \| undefined` |
| `onfullscreenchange?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onFullscreenChange?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onfullscreenerror?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onFullscreenError?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `ongotpointercapture?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onGotPointerCapture?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `oninput?` | `InputEventHandlerUnion<HTMLAnchorElement, InputEvent> \| undefined` |
| `onInput?` | `InputEventHandlerUnion<HTMLAnchorElement, InputEvent> \| undefined` |
| `oninvalid?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onInvalid?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onkeydown?` | `EventHandlerUnion<HTMLAnchorElement, KeyboardEvent, EventHandler<HTMLAnchorElement, KeyboardEvent>> \| undefined` |
| `onKeyDown?` | `EventHandlerUnion<HTMLAnchorElement, KeyboardEvent, EventHandler<HTMLAnchorElement, KeyboardEvent>> \| undefined` |
| `onkeypress?` | `EventHandlerUnion<HTMLAnchorElement, KeyboardEvent, EventHandler<HTMLAnchorElement, KeyboardEvent>> \| undefined` |
| `onKeyPress?` | `EventHandlerUnion<HTMLAnchorElement, KeyboardEvent, EventHandler<HTMLAnchorElement, KeyboardEvent>> \| undefined` |
| `onkeyup?` | `EventHandlerUnion<HTMLAnchorElement, KeyboardEvent, EventHandler<HTMLAnchorElement, KeyboardEvent>> \| undefined` |
| `onKeyUp?` | `EventHandlerUnion<HTMLAnchorElement, KeyboardEvent, EventHandler<HTMLAnchorElement, KeyboardEvent>> \| undefined` |
| `onload?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onLoad?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onloadeddata?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onLoadedData?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onloadedmetadata?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onLoadedMetadata?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onloadstart?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onLoadStart?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onlostpointercapture?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onLostPointerCapture?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onmousedown?` | `EventHandlerUnion<HTMLAnchorElement, MouseEvent, EventHandler<HTMLAnchorElement, MouseEvent>> \| undefined` |
| `onMouseDown?` | `EventHandlerUnion<HTMLAnchorElement, MouseEvent, EventHandler<HTMLAnchorElement, MouseEvent>> \| undefined` |
| `onmouseenter?` | `EventHandlerUnion<HTMLAnchorElement, MouseEvent, EventHandler<HTMLAnchorElement, MouseEvent>> \| undefined` |
| `onMouseEnter?` | `EventHandlerUnion<HTMLAnchorElement, MouseEvent, EventHandler<HTMLAnchorElement, MouseEvent>> \| undefined` |
| `onmouseleave?` | `EventHandlerUnion<HTMLAnchorElement, MouseEvent, EventHandler<HTMLAnchorElement, MouseEvent>> \| undefined` |
| `onMouseLeave?` | `EventHandlerUnion<HTMLAnchorElement, MouseEvent, EventHandler<HTMLAnchorElement, MouseEvent>> \| undefined` |
| `onmousemove?` | `EventHandlerUnion<HTMLAnchorElement, MouseEvent, EventHandler<HTMLAnchorElement, MouseEvent>> \| undefined` |
| `onMouseMove?` | `EventHandlerUnion<HTMLAnchorElement, MouseEvent, EventHandler<HTMLAnchorElement, MouseEvent>> \| undefined` |
| `onmouseout?` | `EventHandlerUnion<HTMLAnchorElement, MouseEvent, EventHandler<HTMLAnchorElement, MouseEvent>> \| undefined` |
| `onMouseOut?` | `EventHandlerUnion<HTMLAnchorElement, MouseEvent, EventHandler<HTMLAnchorElement, MouseEvent>> \| undefined` |
| `onmouseover?` | `EventHandlerUnion<HTMLAnchorElement, MouseEvent, EventHandler<HTMLAnchorElement, MouseEvent>> \| undefined` |
| `onMouseOver?` | `EventHandlerUnion<HTMLAnchorElement, MouseEvent, EventHandler<HTMLAnchorElement, MouseEvent>> \| undefined` |
| `onmouseup?` | `EventHandlerUnion<HTMLAnchorElement, MouseEvent, EventHandler<HTMLAnchorElement, MouseEvent>> \| undefined` |
| `onMouseUp?` | `EventHandlerUnion<HTMLAnchorElement, MouseEvent, EventHandler<HTMLAnchorElement, MouseEvent>> \| undefined` |
| `onpaste?` | `EventHandlerUnion<HTMLAnchorElement, ClipboardEvent, EventHandler<HTMLAnchorElement, ClipboardEvent>> \| undefined` |
| `onPaste?` | `EventHandlerUnion<HTMLAnchorElement, ClipboardEvent, EventHandler<HTMLAnchorElement, ClipboardEvent>> \| undefined` |
| `onpause?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onPause?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onplay?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onPlay?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onplaying?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onPlaying?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onpointercancel?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onPointerCancel?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onpointerdown?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onPointerDown?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onpointerenter?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onPointerEnter?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onpointerleave?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onPointerLeave?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onpointermove?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onPointerMove?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onpointerout?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onPointerOut?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onpointerover?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onPointerOver?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onpointerrawupdate?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onPointerRawUpdate?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onpointerup?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onPointerUp?` | `EventHandlerUnion<HTMLAnchorElement, PointerEvent, EventHandler<HTMLAnchorElement, PointerEvent>> \| undefined` |
| `onprogress?` | `EventHandlerUnion<HTMLAnchorElement, ProgressEvent<EventTarget>, EventHandler<HTMLAnchorElement, ProgressEvent<EventTarget>>> \| undefined` |
| `onProgress?` | `EventHandlerUnion<HTMLAnchorElement, ProgressEvent<EventTarget>, EventHandler<HTMLAnchorElement, ProgressEvent<EventTarget>>> \| undefined` |
| `onratechange?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onRateChange?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onreset?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onReset?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onresize?` | `EventHandlerUnion<HTMLAnchorElement, UIEvent, EventHandler<HTMLAnchorElement, UIEvent>> \| undefined` |
| `onResize?` | `EventHandlerUnion<HTMLAnchorElement, UIEvent, EventHandler<HTMLAnchorElement, UIEvent>> \| undefined` |
| `onscroll?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onScroll?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onscrollend?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onScrollEnd?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onscrollsnapchange?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onScrollSnapChange?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onscrollsnapchanging?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onScrollSnapChanging?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onsecuritypolicyviolation?` | `EventHandlerUnion<HTMLAnchorElement, SecurityPolicyViolationEvent, EventHandler<HTMLAnchorElement, SecurityPolicyViolationEvent>> \| undefined` |
| `onSecurityPolicyViolation?` | `EventHandlerUnion<HTMLAnchorElement, SecurityPolicyViolationEvent, EventHandler<HTMLAnchorElement, SecurityPolicyViolationEvent>> \| undefined` |
| `onseeked?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onSeeked?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onseeking?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onSeeking?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onselect?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onSelect?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onselectionchange?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onSelectionChange?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onselectstart?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onSelectStart?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onslotchange?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onSlotChange?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onstalled?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onStalled?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onsubmit?` | `EventHandlerUnion<HTMLAnchorElement, SubmitEvent, EventHandler<HTMLAnchorElement, SubmitEvent>> \| undefined` |
| `onSubmit?` | `EventHandlerUnion<HTMLAnchorElement, SubmitEvent, EventHandler<HTMLAnchorElement, SubmitEvent>> \| undefined` |
| `onsuspend?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onSuspend?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `ontimeupdate?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onTimeUpdate?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `ontoggle?` | `EventHandlerUnion<HTMLAnchorElement, ToggleEvent, EventHandler<HTMLAnchorElement, ToggleEvent>> \| undefined` |
| `onToggle?` | `EventHandlerUnion<HTMLAnchorElement, ToggleEvent, EventHandler<HTMLAnchorElement, ToggleEvent>> \| undefined` |
| `ontouchcancel?` | `EventHandlerUnion<HTMLAnchorElement, TouchEvent, EventHandler<HTMLAnchorElement, TouchEvent>> \| undefined` |
| `onTouchCancel?` | `EventHandlerUnion<HTMLAnchorElement, TouchEvent, EventHandler<HTMLAnchorElement, TouchEvent>> \| undefined` |
| `ontouchend?` | `EventHandlerUnion<HTMLAnchorElement, TouchEvent, EventHandler<HTMLAnchorElement, TouchEvent>> \| undefined` |
| `onTouchEnd?` | `EventHandlerUnion<HTMLAnchorElement, TouchEvent, EventHandler<HTMLAnchorElement, TouchEvent>> \| undefined` |
| `ontouchmove?` | `EventHandlerUnion<HTMLAnchorElement, TouchEvent, EventHandler<HTMLAnchorElement, TouchEvent>> \| undefined` |
| `onTouchMove?` | `EventHandlerUnion<HTMLAnchorElement, TouchEvent, EventHandler<HTMLAnchorElement, TouchEvent>> \| undefined` |
| `ontouchstart?` | `EventHandlerUnion<HTMLAnchorElement, TouchEvent, EventHandler<HTMLAnchorElement, TouchEvent>> \| undefined` |
| `onTouchStart?` | `EventHandlerUnion<HTMLAnchorElement, TouchEvent, EventHandler<HTMLAnchorElement, TouchEvent>> \| undefined` |
| `ontransitioncancel?` | `EventHandlerUnion<HTMLAnchorElement, TransitionEvent, EventHandler<HTMLAnchorElement, TransitionEvent>> \| undefined` |
| `onTransitionCancel?` | `EventHandlerUnion<HTMLAnchorElement, TransitionEvent, EventHandler<HTMLAnchorElement, TransitionEvent>> \| undefined` |
| `ontransitionend?` | `EventHandlerUnion<HTMLAnchorElement, TransitionEvent, EventHandler<HTMLAnchorElement, TransitionEvent>> \| undefined` |
| `onTransitionEnd?` | `EventHandlerUnion<HTMLAnchorElement, TransitionEvent, EventHandler<HTMLAnchorElement, TransitionEvent>> \| undefined` |
| `ontransitionrun?` | `EventHandlerUnion<HTMLAnchorElement, TransitionEvent, EventHandler<HTMLAnchorElement, TransitionEvent>> \| undefined` |
| `onTransitionRun?` | `EventHandlerUnion<HTMLAnchorElement, TransitionEvent, EventHandler<HTMLAnchorElement, TransitionEvent>> \| undefined` |
| `ontransitionstart?` | `EventHandlerUnion<HTMLAnchorElement, TransitionEvent, EventHandler<HTMLAnchorElement, TransitionEvent>> \| undefined` |
| `onTransitionStart?` | `EventHandlerUnion<HTMLAnchorElement, TransitionEvent, EventHandler<HTMLAnchorElement, TransitionEvent>> \| undefined` |
| `onvolumechange?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onVolumeChange?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onwaiting?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onWaiting?` | `EventHandlerUnion<HTMLAnchorElement, Event, EventHandler<HTMLAnchorElement, Event>> \| undefined` |
| `onwheel?` | `EventHandlerUnion<HTMLAnchorElement, WheelEvent, EventHandler<HTMLAnchorElement, WheelEvent>> \| undefined` |
| `onWheel?` | `EventHandlerUnion<HTMLAnchorElement, WheelEvent, EventHandler<HTMLAnchorElement, WheelEvent>> \| undefined` |
| `part?` | `string \| undefined` |
| `ping?` | `string \| undefined` |
| `popover?` | `boolean \| "auto" \| "manual" \| undefined` |
| `prefix?` | `string \| undefined` |
| `preload?` | `boolean \| undefined` |
| `property?` | `string \| undefined` |
| `ref?` | `HTMLAnchorElement \| ((el: HTMLAnchorElement) => void) \| undefined` |
| `referrerpolicy?` | `HTMLReferrerPolicy \| undefined` |
| `referrerPolicy?` | `HTMLReferrerPolicy \| undefined` |
| `rel?` | `string \| undefined` |
| `replace?` | `boolean \| undefined` |
| `resource?` | `string \| undefined` |
| `rev?` | `string \| undefined` |
| `role?` | `"none" \| "search" \| "list" \| "link" \| "menu" \| "listbox" \| "tree" \| "grid" \| "dialog" \| "alert" \| "alertdialog" \| "application" \| "article" \| "banner" \| "button" \| "cell" \| "checkbox" \| "columnheader" \| "combobox" \| "complementary" \| "contentinfo" \| "definition" \| "directory" \| "document" \| "feed" \| "figure" \| "form" \| "gridcell" \| "group" \| "heading" \| "img" \| "listitem" \| "log" \| "main" \| "marquee" \| "math" \| "menubar" \| "menuitem" \| "menuitemcheckbox" \| "menuitemradio" \| "meter" \| "navigation" \| "note" \| "option" \| "presentation" \| "progressbar" \| "radio" \| "radiogroup" \| "region" \| "row" \| "rowgroup" \| "rowheader" \| "scrollbar" \| "searchbox" \| "separator" \| "slider" \| "spinbutton" \| "status" \| "switch" \| "tab" \| "table" \| "tablist" \| "tabpanel" \| "term" \| "textbox" \| "timer" \| "toolbar" \| "tooltip" \| "treegrid" \| "treeitem" \| undefined` |
| `shape?` | `"rect" \| "circle" \| "poly" \| "default" \| undefined` |
| `slot?` | `string \| undefined` |
| `spellcheck?` | `boolean \| "true" \| "false" \| undefined` |
| `state?` | `string \| undefined` |
| `style?` | `string \| CSSProperties \| undefined` |
| `tabindex?` | `string \| number \| undefined` |
| `tabIndex?` | `string \| number \| undefined` |
| `target?` | `(string & {}) \| "_self" \| "_blank" \| "_parent" \| "_top" \| undefined` |
| `textContent?` | `string \| number \| undefined` |
| `title?` | `string \| undefined` |
| `to` | `RouteTarget` |
| `translate?` | `"yes" \| "no" \| undefined` |
| `type?` | `string \| undefined` |
| `typeof?` | `string \| undefined` |
| `vocab?` | `string \| undefined` |

</details>

<details>
<summary><code>I18nProviderProps</code> — 4 members</summary>

| Member | Type |
| --- | --- |
| `defaultLocale?` | `string \| undefined` |
| `i18n?` | `SolidI18n \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `routingStrategy?` | `I18nRoutingStrategy \| undefined` |

</details>

<details>
<summary><code>I18nRoutingStrategy</code> — 6 members</summary>

| Member | Type |
| --- | --- |
| `getCurrentPath` | `() => string` |
| `getRoute?` | `(() => { fullPath: string; query: Record<string, unknown>; }) \| undefined` |
| `linkComponent?` | `string \| Component<{ [key: string]: unknown; href: string; children?: JSX.Element; style?: JSX.CSSProperties \| string; class?: string; }> \| undefined` |
| `push` | `(target: { path: string; }) => void` |
| `replace` | `(target: { path: string; }) => void` |
| `resolvePath?` | `((to: RouteTarget, locale: string) => RouteTarget) \| undefined` |

</details>

<details>
<summary><code>I18nSwitcherProps</code> — 351 members</summary>

| Member | Type |
| --- | --- |
| `$ServerOnly?` | `boolean \| undefined` |
| `about?` | `string \| undefined` |
| `accesskey?` | `string \| undefined` |
| `accessKey?` | `string \| undefined` |
| `aria-activedescendant?` | `string \| undefined` |
| `aria-atomic?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-autocomplete?` | `"none" \| "inline" \| "list" \| "both" \| undefined` |
| `aria-braillelabel?` | `string \| undefined` |
| `aria-brailleroledescription?` | `string \| undefined` |
| `aria-busy?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-checked?` | `boolean \| "true" \| "false" \| "mixed" \| undefined` |
| `aria-colcount?` | `string \| number \| undefined` |
| `aria-colindex?` | `string \| number \| undefined` |
| `aria-colindextext?` | `string \| number \| undefined` |
| `aria-colspan?` | `string \| number \| undefined` |
| `aria-controls?` | `string \| undefined` |
| `aria-current?` | `boolean \| "true" \| "false" \| "page" \| "step" \| "location" \| "date" \| "time" \| undefined` |
| `aria-describedby?` | `string \| undefined` |
| `aria-description?` | `string \| undefined` |
| `aria-details?` | `string \| undefined` |
| `aria-disabled?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-dropeffect?` | `"none" \| "copy" \| "execute" \| "link" \| "move" \| "popup" \| undefined` |
| `aria-errormessage?` | `string \| undefined` |
| `aria-expanded?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-flowto?` | `string \| undefined` |
| `aria-grabbed?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-haspopup?` | `boolean \| "true" \| "false" \| "menu" \| "listbox" \| "tree" \| "grid" \| "dialog" \| undefined` |
| `aria-hidden?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-invalid?` | `boolean \| "true" \| "false" \| "grammar" \| "spelling" \| undefined` |
| `aria-keyshortcuts?` | `string \| undefined` |
| `aria-label?` | `string \| undefined` |
| `aria-labelledby?` | `string \| undefined` |
| `aria-level?` | `string \| number \| undefined` |
| `aria-live?` | `"off" \| "assertive" \| "polite" \| undefined` |
| `aria-modal?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-multiline?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-multiselectable?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-orientation?` | `"horizontal" \| "vertical" \| undefined` |
| `aria-owns?` | `string \| undefined` |
| `aria-placeholder?` | `string \| undefined` |
| `aria-posinset?` | `string \| number \| undefined` |
| `aria-pressed?` | `boolean \| "true" \| "false" \| "mixed" \| undefined` |
| `aria-readonly?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-relevant?` | `"text" \| "additions" \| "additions removals" \| "additions text" \| "all" \| "removals" \| "removals additions" \| "removals text" \| "text additions" \| "text removals" \| undefined` |
| `aria-required?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-roledescription?` | `string \| undefined` |
| `aria-rowcount?` | `string \| number \| undefined` |
| `aria-rowindex?` | `string \| number \| undefined` |
| `aria-rowindextext?` | `string \| number \| undefined` |
| `aria-rowspan?` | `string \| number \| undefined` |
| `aria-selected?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-setsize?` | `string \| number \| undefined` |
| `aria-sort?` | `"none" \| "ascending" \| "descending" \| "other" \| undefined` |
| `aria-valuemax?` | `string \| number \| undefined` |
| `aria-valuemin?` | `string \| number \| undefined` |
| `aria-valuenow?` | `string \| number \| undefined` |
| `aria-valuetext?` | `string \| undefined` |
| `autocapitalize?` | `HTMLAutocapitalize \| undefined` |
| `autoCapitalize?` | `HTMLAutocapitalize \| undefined` |
| `autocorrect?` | `"off" \| "on" \| undefined` |
| `autofocus?` | `boolean \| undefined` |
| `children?` | `Element` |
| `class?` | `string \| undefined` |
| `classList?` | `ClassList \| undefined` |
| `contenteditable?` | `boolean \| "true" \| "false" \| "plaintext-only" \| "inherit" \| undefined` |
| `contentEditable?` | `boolean \| "plaintext-only" \| "inherit" \| undefined` |
| `contextmenu?` | `string \| undefined` |
| `contextMenu?` | `string \| undefined` |
| `currentLocale?` | `string \| (() => string) \| undefined` |
| `customActiveLinkStyle?` | `JSX.CSSProperties \| undefined` |
| `customButtonStyle?` | `JSX.CSSProperties \| undefined` |
| `customDisabledLinkStyle?` | `JSX.CSSProperties \| undefined` |
| `customDropdownStyle?` | `JSX.CSSProperties \| undefined` |
| `customIconStyle?` | `JSX.CSSProperties \| undefined` |
| `customItemStyle?` | `JSX.CSSProperties \| undefined` |
| `customLabels?` | `Record<string, string> \| undefined` |
| `customLinkStyle?` | `JSX.CSSProperties \| undefined` |
| `customWrapperStyle?` | `JSX.CSSProperties \| undefined` |
| `datatype?` | `string \| undefined` |
| `dir?` | `HTMLDir \| undefined` |
| `draggable?` | `boolean \| "true" \| "false" \| undefined` |
| `elementtiming?` | `string \| undefined` |
| `enterkeyhint?` | `"enter" \| "done" \| "go" \| "next" \| "previous" \| "search" \| "send" \| undefined` |
| `exportparts?` | `string \| undefined` |
| `exportParts?` | `string \| undefined` |
| `getLocaleName?` | `(() => string \| null) \| undefined` |
| `hidden?` | `boolean \| "hidden" \| "until-found" \| undefined` |
| `id?` | `string \| undefined` |
| `inert?` | `boolean \| undefined` |
| `inlist?` | `any` |
| `innerHTML?` | `string \| undefined` |
| `innerText?` | `string \| number \| undefined` |
| `inputmode?` | `"none" \| "search" \| "decimal" \| "email" \| "numeric" \| "tel" \| "text" \| "url" \| undefined` |
| `inputMode?` | `"none" \| "search" \| "decimal" \| "email" \| "numeric" \| "tel" \| "text" \| "url" \| undefined` |
| `is?` | `string \| undefined` |
| `itemid?` | `string \| undefined` |
| `itemId?` | `string \| undefined` |
| `itemprop?` | `string \| undefined` |
| `itemProp?` | `string \| undefined` |
| `itemref?` | `string \| undefined` |
| `itemRef?` | `string \| undefined` |
| `itemscope?` | `boolean \| undefined` |
| `itemScope?` | `boolean \| undefined` |
| `itemtype?` | `string \| undefined` |
| `itemType?` | `string \| undefined` |
| `lang?` | `string \| undefined` |
| `localeRoute?` | `((to: RouteTarget, locale?: string) => RouteTarget) \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `nonce?` | `string \| undefined` |
| `onabort?` | `EventHandlerUnion<HTMLDivElement, UIEvent, EventHandler<HTMLDivElement, UIEvent>> \| undefined` |
| `onAbort?` | `EventHandlerUnion<HTMLDivElement, UIEvent, EventHandler<HTMLDivElement, UIEvent>> \| undefined` |
| `onanimationcancel?` | `EventHandlerUnion<HTMLDivElement, AnimationEvent, EventHandler<HTMLDivElement, AnimationEvent>> \| undefined` |
| `onAnimationCancel?` | `EventHandlerUnion<HTMLDivElement, AnimationEvent, EventHandler<HTMLDivElement, AnimationEvent>> \| undefined` |
| `onanimationend?` | `EventHandlerUnion<HTMLDivElement, AnimationEvent, EventHandler<HTMLDivElement, AnimationEvent>> \| undefined` |
| `onAnimationEnd?` | `EventHandlerUnion<HTMLDivElement, AnimationEvent, EventHandler<HTMLDivElement, AnimationEvent>> \| undefined` |
| `onanimationiteration?` | `EventHandlerUnion<HTMLDivElement, AnimationEvent, EventHandler<HTMLDivElement, AnimationEvent>> \| undefined` |
| `onAnimationIteration?` | `EventHandlerUnion<HTMLDivElement, AnimationEvent, EventHandler<HTMLDivElement, AnimationEvent>> \| undefined` |
| `onanimationstart?` | `EventHandlerUnion<HTMLDivElement, AnimationEvent, EventHandler<HTMLDivElement, AnimationEvent>> \| undefined` |
| `onAnimationStart?` | `EventHandlerUnion<HTMLDivElement, AnimationEvent, EventHandler<HTMLDivElement, AnimationEvent>> \| undefined` |
| `onauxclick?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onAuxClick?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onbeforecopy?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onBeforeCopy?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onbeforecut?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onBeforeCut?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onbeforeinput?` | `InputEventHandlerUnion<HTMLDivElement, InputEvent> \| undefined` |
| `onBeforeInput?` | `InputEventHandlerUnion<HTMLDivElement, InputEvent> \| undefined` |
| `onbeforematch?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onBeforeMatch?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onbeforepaste?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onBeforePaste?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onbeforetoggle?` | `EventHandlerUnion<HTMLDivElement, ToggleEvent, EventHandler<HTMLDivElement, ToggleEvent>> \| undefined` |
| `onBeforeToggle?` | `EventHandlerUnion<HTMLDivElement, ToggleEvent, EventHandler<HTMLDivElement, ToggleEvent>> \| undefined` |
| `onbeforexrselect?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onBeforeXRSelect?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onblur?` | `FocusEventHandlerUnion<HTMLDivElement, FocusEvent> \| undefined` |
| `onBlur?` | `FocusEventHandlerUnion<HTMLDivElement, FocusEvent> \| undefined` |
| `oncancel?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onCancel?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `oncanplay?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onCanPlay?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `oncanplaythrough?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onCanPlayThrough?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onchange?` | `ChangeEventHandlerUnion<HTMLDivElement, Event> \| undefined` |
| `onChange?` | `ChangeEventHandlerUnion<HTMLDivElement, Event> \| undefined` |
| `onclick?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onClick?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onclose?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onClose?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `oncommand?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onCommand?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `oncompositionend?` | `EventHandlerUnion<HTMLDivElement, CompositionEvent, EventHandler<HTMLDivElement, CompositionEvent>> \| undefined` |
| `onCompositionEnd?` | `EventHandlerUnion<HTMLDivElement, CompositionEvent, EventHandler<HTMLDivElement, CompositionEvent>> \| undefined` |
| `oncompositionstart?` | `EventHandlerUnion<HTMLDivElement, CompositionEvent, EventHandler<HTMLDivElement, CompositionEvent>> \| undefined` |
| `onCompositionStart?` | `EventHandlerUnion<HTMLDivElement, CompositionEvent, EventHandler<HTMLDivElement, CompositionEvent>> \| undefined` |
| `oncompositionupdate?` | `EventHandlerUnion<HTMLDivElement, CompositionEvent, EventHandler<HTMLDivElement, CompositionEvent>> \| undefined` |
| `onCompositionUpdate?` | `EventHandlerUnion<HTMLDivElement, CompositionEvent, EventHandler<HTMLDivElement, CompositionEvent>> \| undefined` |
| `oncontentvisibilityautostatechange?` | `EventHandlerUnion<HTMLDivElement, ContentVisibilityAutoStateChangeEvent, EventHandler<HTMLDivElement, ContentVisibilityAutoStateChangeEvent>> \| undefined` |
| `onContentVisibilityAutoStateChange?` | `EventHandlerUnion<HTMLDivElement, ContentVisibilityAutoStateChangeEvent, EventHandler<HTMLDivElement, ContentVisibilityAutoStateChangeEvent>> \| undefined` |
| `oncontextlost?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onContextLost?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `oncontextmenu?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onContextMenu?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `oncontextrestored?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onContextRestored?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `oncopy?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onCopy?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `oncuechange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onCueChange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `oncut?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onCut?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `ondblclick?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onDblClick?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `ondrag?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `onDrag?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `ondragend?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `onDragEnd?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `ondragenter?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `onDragEnter?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `ondragexit?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `onDragExit?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `ondragleave?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `onDragLeave?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `ondragover?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `onDragOver?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `ondragstart?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `onDragStart?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `ondrop?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `onDrop?` | `EventHandlerUnion<HTMLDivElement, DragEvent, EventHandler<HTMLDivElement, DragEvent>> \| undefined` |
| `ondurationchange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onDurationChange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onemptied?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onEmptied?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onended?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onEnded?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onerror?` | `EventHandlerUnion<HTMLDivElement, ErrorEvent, EventHandler<HTMLDivElement, ErrorEvent>> \| undefined` |
| `onError?` | `EventHandlerUnion<HTMLDivElement, ErrorEvent, EventHandler<HTMLDivElement, ErrorEvent>> \| undefined` |
| `onfocus?` | `FocusEventHandlerUnion<HTMLDivElement, FocusEvent> \| undefined` |
| `onFocus?` | `FocusEventHandlerUnion<HTMLDivElement, FocusEvent> \| undefined` |
| `onfocusin?` | `FocusEventHandlerUnion<HTMLDivElement, FocusEvent> \| undefined` |
| `onFocusIn?` | `FocusEventHandlerUnion<HTMLDivElement, FocusEvent> \| undefined` |
| `onfocusout?` | `FocusEventHandlerUnion<HTMLDivElement, FocusEvent> \| undefined` |
| `onFocusOut?` | `FocusEventHandlerUnion<HTMLDivElement, FocusEvent> \| undefined` |
| `onformdata?` | `EventHandlerUnion<HTMLDivElement, FormDataEvent, EventHandler<HTMLDivElement, FormDataEvent>> \| undefined` |
| `onFormData?` | `EventHandlerUnion<HTMLDivElement, FormDataEvent, EventHandler<HTMLDivElement, FormDataEvent>> \| undefined` |
| `onfullscreenchange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onFullscreenChange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onfullscreenerror?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onFullscreenError?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `ongotpointercapture?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onGotPointerCapture?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `oninput?` | `InputEventHandlerUnion<HTMLDivElement, InputEvent> \| undefined` |
| `onInput?` | `InputEventHandlerUnion<HTMLDivElement, InputEvent> \| undefined` |
| `oninvalid?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onInvalid?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onkeydown?` | `EventHandlerUnion<HTMLDivElement, KeyboardEvent, EventHandler<HTMLDivElement, KeyboardEvent>> \| undefined` |
| `onKeyDown?` | `EventHandlerUnion<HTMLDivElement, KeyboardEvent, EventHandler<HTMLDivElement, KeyboardEvent>> \| undefined` |
| `onkeypress?` | `EventHandlerUnion<HTMLDivElement, KeyboardEvent, EventHandler<HTMLDivElement, KeyboardEvent>> \| undefined` |
| `onKeyPress?` | `EventHandlerUnion<HTMLDivElement, KeyboardEvent, EventHandler<HTMLDivElement, KeyboardEvent>> \| undefined` |
| `onkeyup?` | `EventHandlerUnion<HTMLDivElement, KeyboardEvent, EventHandler<HTMLDivElement, KeyboardEvent>> \| undefined` |
| `onKeyUp?` | `EventHandlerUnion<HTMLDivElement, KeyboardEvent, EventHandler<HTMLDivElement, KeyboardEvent>> \| undefined` |
| `onload?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onLoad?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onloadeddata?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onLoadedData?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onloadedmetadata?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onLoadedMetadata?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onloadstart?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onLoadStart?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onlostpointercapture?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onLostPointerCapture?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onmousedown?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onMouseDown?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onmouseenter?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onMouseEnter?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onmouseleave?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onMouseLeave?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onmousemove?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onMouseMove?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onmouseout?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onMouseOut?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onmouseover?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onMouseOver?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onmouseup?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onMouseUp?` | `EventHandlerUnion<HTMLDivElement, MouseEvent, EventHandler<HTMLDivElement, MouseEvent>> \| undefined` |
| `onpaste?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onPaste?` | `EventHandlerUnion<HTMLDivElement, ClipboardEvent, EventHandler<HTMLDivElement, ClipboardEvent>> \| undefined` |
| `onpause?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onPause?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onplay?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onPlay?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onplaying?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onPlaying?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onpointercancel?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onPointerCancel?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onpointerdown?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onPointerDown?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onpointerenter?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onPointerEnter?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onpointerleave?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onPointerLeave?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onpointermove?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onPointerMove?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onpointerout?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onPointerOut?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onpointerover?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onPointerOver?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onpointerrawupdate?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onPointerRawUpdate?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onpointerup?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onPointerUp?` | `EventHandlerUnion<HTMLDivElement, PointerEvent, EventHandler<HTMLDivElement, PointerEvent>> \| undefined` |
| `onprogress?` | `EventHandlerUnion<HTMLDivElement, ProgressEvent<EventTarget>, EventHandler<HTMLDivElement, ProgressEvent<EventTarget>>> \| undefined` |
| `onProgress?` | `EventHandlerUnion<HTMLDivElement, ProgressEvent<EventTarget>, EventHandler<HTMLDivElement, ProgressEvent<EventTarget>>> \| undefined` |
| `onratechange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onRateChange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onreset?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onReset?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onresize?` | `EventHandlerUnion<HTMLDivElement, UIEvent, EventHandler<HTMLDivElement, UIEvent>> \| undefined` |
| `onResize?` | `EventHandlerUnion<HTMLDivElement, UIEvent, EventHandler<HTMLDivElement, UIEvent>> \| undefined` |
| `onscroll?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onScroll?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onscrollend?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onScrollEnd?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onscrollsnapchange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onScrollSnapChange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onscrollsnapchanging?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onScrollSnapChanging?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onsecuritypolicyviolation?` | `EventHandlerUnion<HTMLDivElement, SecurityPolicyViolationEvent, EventHandler<HTMLDivElement, SecurityPolicyViolationEvent>> \| undefined` |
| `onSecurityPolicyViolation?` | `EventHandlerUnion<HTMLDivElement, SecurityPolicyViolationEvent, EventHandler<HTMLDivElement, SecurityPolicyViolationEvent>> \| undefined` |
| `onseeked?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onSeeked?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onseeking?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onSeeking?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onselect?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onSelect?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onselectionchange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onSelectionChange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onselectstart?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onSelectStart?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onslotchange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onSlotChange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onstalled?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onStalled?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onsubmit?` | `EventHandlerUnion<HTMLDivElement, SubmitEvent, EventHandler<HTMLDivElement, SubmitEvent>> \| undefined` |
| `onSubmit?` | `EventHandlerUnion<HTMLDivElement, SubmitEvent, EventHandler<HTMLDivElement, SubmitEvent>> \| undefined` |
| `onsuspend?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onSuspend?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `ontimeupdate?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onTimeUpdate?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `ontoggle?` | `EventHandlerUnion<HTMLDivElement, ToggleEvent, EventHandler<HTMLDivElement, ToggleEvent>> \| undefined` |
| `onToggle?` | `EventHandlerUnion<HTMLDivElement, ToggleEvent, EventHandler<HTMLDivElement, ToggleEvent>> \| undefined` |
| `ontouchcancel?` | `EventHandlerUnion<HTMLDivElement, TouchEvent, EventHandler<HTMLDivElement, TouchEvent>> \| undefined` |
| `onTouchCancel?` | `EventHandlerUnion<HTMLDivElement, TouchEvent, EventHandler<HTMLDivElement, TouchEvent>> \| undefined` |
| `ontouchend?` | `EventHandlerUnion<HTMLDivElement, TouchEvent, EventHandler<HTMLDivElement, TouchEvent>> \| undefined` |
| `onTouchEnd?` | `EventHandlerUnion<HTMLDivElement, TouchEvent, EventHandler<HTMLDivElement, TouchEvent>> \| undefined` |
| `ontouchmove?` | `EventHandlerUnion<HTMLDivElement, TouchEvent, EventHandler<HTMLDivElement, TouchEvent>> \| undefined` |
| `onTouchMove?` | `EventHandlerUnion<HTMLDivElement, TouchEvent, EventHandler<HTMLDivElement, TouchEvent>> \| undefined` |
| `ontouchstart?` | `EventHandlerUnion<HTMLDivElement, TouchEvent, EventHandler<HTMLDivElement, TouchEvent>> \| undefined` |
| `onTouchStart?` | `EventHandlerUnion<HTMLDivElement, TouchEvent, EventHandler<HTMLDivElement, TouchEvent>> \| undefined` |
| `ontransitioncancel?` | `EventHandlerUnion<HTMLDivElement, TransitionEvent, EventHandler<HTMLDivElement, TransitionEvent>> \| undefined` |
| `onTransitionCancel?` | `EventHandlerUnion<HTMLDivElement, TransitionEvent, EventHandler<HTMLDivElement, TransitionEvent>> \| undefined` |
| `ontransitionend?` | `EventHandlerUnion<HTMLDivElement, TransitionEvent, EventHandler<HTMLDivElement, TransitionEvent>> \| undefined` |
| `onTransitionEnd?` | `EventHandlerUnion<HTMLDivElement, TransitionEvent, EventHandler<HTMLDivElement, TransitionEvent>> \| undefined` |
| `ontransitionrun?` | `EventHandlerUnion<HTMLDivElement, TransitionEvent, EventHandler<HTMLDivElement, TransitionEvent>> \| undefined` |
| `onTransitionRun?` | `EventHandlerUnion<HTMLDivElement, TransitionEvent, EventHandler<HTMLDivElement, TransitionEvent>> \| undefined` |
| `ontransitionstart?` | `EventHandlerUnion<HTMLDivElement, TransitionEvent, EventHandler<HTMLDivElement, TransitionEvent>> \| undefined` |
| `onTransitionStart?` | `EventHandlerUnion<HTMLDivElement, TransitionEvent, EventHandler<HTMLDivElement, TransitionEvent>> \| undefined` |
| `onvolumechange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onVolumeChange?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onwaiting?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onWaiting?` | `EventHandlerUnion<HTMLDivElement, Event, EventHandler<HTMLDivElement, Event>> \| undefined` |
| `onwheel?` | `EventHandlerUnion<HTMLDivElement, WheelEvent, EventHandler<HTMLDivElement, WheelEvent>> \| undefined` |
| `onWheel?` | `EventHandlerUnion<HTMLDivElement, WheelEvent, EventHandler<HTMLDivElement, WheelEvent>> \| undefined` |
| `part?` | `string \| undefined` |
| `popover?` | `boolean \| "auto" \| "manual" \| undefined` |
| `prefix?` | `string \| undefined` |
| `property?` | `string \| undefined` |
| `ref?` | `HTMLDivElement \| ((el: HTMLDivElement) => void) \| undefined` |
| `resource?` | `string \| undefined` |
| `role?` | `"none" \| "search" \| "list" \| "link" \| "menu" \| "listbox" \| "tree" \| "grid" \| "dialog" \| "alert" \| "alertdialog" \| "application" \| "article" \| "banner" \| "button" \| "cell" \| "checkbox" \| "columnheader" \| "combobox" \| "complementary" \| "contentinfo" \| "definition" \| "directory" \| "document" \| "feed" \| "figure" \| "form" \| "gridcell" \| "group" \| "heading" \| "img" \| "listitem" \| "log" \| "main" \| "marquee" \| "math" \| "menubar" \| "menuitem" \| "menuitemcheckbox" \| "menuitemradio" \| "meter" \| "navigation" \| "note" \| "option" \| "presentation" \| "progressbar" \| "radio" \| "radiogroup" \| "region" \| "row" \| "rowgroup" \| "rowheader" \| "scrollbar" \| "searchbox" \| "separator" \| "slider" \| "spinbutton" \| "status" \| "switch" \| "tab" \| "table" \| "tablist" \| "tabpanel" \| "term" \| "textbox" \| "timer" \| "toolbar" \| "tooltip" \| "treegrid" \| "treeitem" \| undefined` |
| `slot?` | `string \| undefined` |
| `spellcheck?` | `boolean \| "true" \| "false" \| undefined` |
| `style?` | `string \| CSSProperties \| undefined` |
| `switchLocale?` | `((locale: string) => void) \| undefined` |
| `tabindex?` | `string \| number \| undefined` |
| `tabIndex?` | `string \| number \| undefined` |
| `textContent?` | `string \| number \| undefined` |
| `title?` | `string \| undefined` |
| `translate?` | `"yes" \| "no" \| undefined` |
| `typeof?` | `string \| undefined` |
| `vocab?` | `string \| undefined` |

</details>

<details>
<summary><code>I18nTProps</code> — 349 members</summary>

| Member | Type |
| --- | --- |
| `$ServerOnly?` | `boolean \| undefined` |
| `about?` | `string \| undefined` |
| `accesskey?` | `string \| undefined` |
| `accessKey?` | `string \| undefined` |
| `aria-activedescendant?` | `string \| undefined` |
| `aria-atomic?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-autocomplete?` | `"none" \| "inline" \| "list" \| "both" \| undefined` |
| `aria-braillelabel?` | `string \| undefined` |
| `aria-brailleroledescription?` | `string \| undefined` |
| `aria-busy?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-checked?` | `boolean \| "true" \| "false" \| "mixed" \| undefined` |
| `aria-colcount?` | `string \| number \| undefined` |
| `aria-colindex?` | `string \| number \| undefined` |
| `aria-colindextext?` | `string \| number \| undefined` |
| `aria-colspan?` | `string \| number \| undefined` |
| `aria-controls?` | `string \| undefined` |
| `aria-current?` | `boolean \| "true" \| "false" \| "page" \| "step" \| "location" \| "date" \| "time" \| undefined` |
| `aria-describedby?` | `string \| undefined` |
| `aria-description?` | `string \| undefined` |
| `aria-details?` | `string \| undefined` |
| `aria-disabled?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-dropeffect?` | `"none" \| "copy" \| "execute" \| "link" \| "move" \| "popup" \| undefined` |
| `aria-errormessage?` | `string \| undefined` |
| `aria-expanded?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-flowto?` | `string \| undefined` |
| `aria-grabbed?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-haspopup?` | `boolean \| "true" \| "false" \| "menu" \| "listbox" \| "tree" \| "grid" \| "dialog" \| undefined` |
| `aria-hidden?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-invalid?` | `boolean \| "true" \| "false" \| "grammar" \| "spelling" \| undefined` |
| `aria-keyshortcuts?` | `string \| undefined` |
| `aria-label?` | `string \| undefined` |
| `aria-labelledby?` | `string \| undefined` |
| `aria-level?` | `string \| number \| undefined` |
| `aria-live?` | `"off" \| "assertive" \| "polite" \| undefined` |
| `aria-modal?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-multiline?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-multiselectable?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-orientation?` | `"horizontal" \| "vertical" \| undefined` |
| `aria-owns?` | `string \| undefined` |
| `aria-placeholder?` | `string \| undefined` |
| `aria-posinset?` | `string \| number \| undefined` |
| `aria-pressed?` | `boolean \| "true" \| "false" \| "mixed" \| undefined` |
| `aria-readonly?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-relevant?` | `"text" \| "additions" \| "additions removals" \| "additions text" \| "all" \| "removals" \| "removals additions" \| "removals text" \| "text additions" \| "text removals" \| undefined` |
| `aria-required?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-roledescription?` | `string \| undefined` |
| `aria-rowcount?` | `string \| number \| undefined` |
| `aria-rowindex?` | `string \| number \| undefined` |
| `aria-rowindextext?` | `string \| number \| undefined` |
| `aria-rowspan?` | `string \| number \| undefined` |
| `aria-selected?` | `boolean \| "true" \| "false" \| undefined` |
| `aria-setsize?` | `string \| number \| undefined` |
| `aria-sort?` | `"none" \| "ascending" \| "descending" \| "other" \| undefined` |
| `aria-valuemax?` | `string \| number \| undefined` |
| `aria-valuemin?` | `string \| number \| undefined` |
| `aria-valuenow?` | `string \| number \| undefined` |
| `aria-valuetext?` | `string \| undefined` |
| `autocapitalize?` | `HTMLAutocapitalize \| undefined` |
| `autoCapitalize?` | `HTMLAutocapitalize \| undefined` |
| `autocorrect?` | `"off" \| "on" \| undefined` |
| `autofocus?` | `boolean \| undefined` |
| `children?` | `JSX.Element \| ((props: { translation: string; }) => JSX.Element)` |
| `class?` | `string \| undefined` |
| `classList?` | `ClassList \| undefined` |
| `components?` | `Record<string, I18nTComponent> \| undefined` |
| `contenteditable?` | `boolean \| "true" \| "false" \| "plaintext-only" \| "inherit" \| undefined` |
| `contentEditable?` | `boolean \| "plaintext-only" \| "inherit" \| undefined` |
| `contextmenu?` | `string \| undefined` |
| `contextMenu?` | `string \| undefined` |
| `customPluralRule?` | `PluralFunc \| null \| undefined` |
| `datatype?` | `string \| undefined` |
| `date?` | `string \| number \| Date \| null \| undefined` |
| `defaultValue?` | `string \| undefined` |
| `dir?` | `HTMLDir \| undefined` |
| `draggable?` | `boolean \| "true" \| "false" \| undefined` |
| `elementtiming?` | `string \| undefined` |
| `enterkeyhint?` | `"enter" \| "done" \| "go" \| "next" \| "previous" \| "search" \| "send" \| undefined` |
| `exportparts?` | `string \| undefined` |
| `exportParts?` | `string \| undefined` |
| `hidden?` | `boolean \| "hidden" \| "until-found" \| undefined` |
| `hideIfEmpty?` | `boolean \| undefined` |
| `html?` | `boolean \| undefined` |
| `id?` | `string \| undefined` |
| `inert?` | `boolean \| undefined` |
| `inlist?` | `any` |
| `innerHTML?` | `string \| undefined` |
| `innerText?` | `string \| number \| undefined` |
| `inputmode?` | `"none" \| "search" \| "decimal" \| "email" \| "numeric" \| "tel" \| "text" \| "url" \| undefined` |
| `inputMode?` | `"none" \| "search" \| "decimal" \| "email" \| "numeric" \| "tel" \| "text" \| "url" \| undefined` |
| `is?` | `string \| undefined` |
| `itemid?` | `string \| undefined` |
| `itemId?` | `string \| undefined` |
| `itemprop?` | `string \| undefined` |
| `itemProp?` | `string \| undefined` |
| `itemref?` | `string \| undefined` |
| `itemRef?` | `string \| undefined` |
| `itemscope?` | `boolean \| undefined` |
| `itemScope?` | `boolean \| undefined` |
| `itemtype?` | `string \| undefined` |
| `itemType?` | `string \| undefined` |
| `keypath` | `string` |
| `lang?` | `string \| undefined` |
| `nonce?` | `string \| undefined` |
| `number?` | `string \| number \| null \| undefined` |
| `onabort?` | `EventHandlerUnion<HTMLElement, UIEvent, EventHandler<HTMLElement, UIEvent>> \| undefined` |
| `onAbort?` | `EventHandlerUnion<HTMLElement, UIEvent, EventHandler<HTMLElement, UIEvent>> \| undefined` |
| `onanimationcancel?` | `EventHandlerUnion<HTMLElement, AnimationEvent, EventHandler<HTMLElement, AnimationEvent>> \| undefined` |
| `onAnimationCancel?` | `EventHandlerUnion<HTMLElement, AnimationEvent, EventHandler<HTMLElement, AnimationEvent>> \| undefined` |
| `onanimationend?` | `EventHandlerUnion<HTMLElement, AnimationEvent, EventHandler<HTMLElement, AnimationEvent>> \| undefined` |
| `onAnimationEnd?` | `EventHandlerUnion<HTMLElement, AnimationEvent, EventHandler<HTMLElement, AnimationEvent>> \| undefined` |
| `onanimationiteration?` | `EventHandlerUnion<HTMLElement, AnimationEvent, EventHandler<HTMLElement, AnimationEvent>> \| undefined` |
| `onAnimationIteration?` | `EventHandlerUnion<HTMLElement, AnimationEvent, EventHandler<HTMLElement, AnimationEvent>> \| undefined` |
| `onanimationstart?` | `EventHandlerUnion<HTMLElement, AnimationEvent, EventHandler<HTMLElement, AnimationEvent>> \| undefined` |
| `onAnimationStart?` | `EventHandlerUnion<HTMLElement, AnimationEvent, EventHandler<HTMLElement, AnimationEvent>> \| undefined` |
| `onauxclick?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onAuxClick?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onbeforecopy?` | `EventHandlerUnion<HTMLElement, ClipboardEvent, EventHandler<HTMLElement, ClipboardEvent>> \| undefined` |
| `onBeforeCopy?` | `EventHandlerUnion<HTMLElement, ClipboardEvent, EventHandler<HTMLElement, ClipboardEvent>> \| undefined` |
| `onbeforecut?` | `EventHandlerUnion<HTMLElement, ClipboardEvent, EventHandler<HTMLElement, ClipboardEvent>> \| undefined` |
| `onBeforeCut?` | `EventHandlerUnion<HTMLElement, ClipboardEvent, EventHandler<HTMLElement, ClipboardEvent>> \| undefined` |
| `onbeforeinput?` | `InputEventHandlerUnion<HTMLElement, InputEvent> \| undefined` |
| `onBeforeInput?` | `InputEventHandlerUnion<HTMLElement, InputEvent> \| undefined` |
| `onbeforematch?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onBeforeMatch?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onbeforepaste?` | `EventHandlerUnion<HTMLElement, ClipboardEvent, EventHandler<HTMLElement, ClipboardEvent>> \| undefined` |
| `onBeforePaste?` | `EventHandlerUnion<HTMLElement, ClipboardEvent, EventHandler<HTMLElement, ClipboardEvent>> \| undefined` |
| `onbeforetoggle?` | `EventHandlerUnion<HTMLElement, ToggleEvent, EventHandler<HTMLElement, ToggleEvent>> \| undefined` |
| `onBeforeToggle?` | `EventHandlerUnion<HTMLElement, ToggleEvent, EventHandler<HTMLElement, ToggleEvent>> \| undefined` |
| `onbeforexrselect?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onBeforeXRSelect?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onblur?` | `FocusEventHandlerUnion<HTMLElement, FocusEvent> \| undefined` |
| `onBlur?` | `FocusEventHandlerUnion<HTMLElement, FocusEvent> \| undefined` |
| `oncancel?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onCancel?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `oncanplay?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onCanPlay?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `oncanplaythrough?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onCanPlayThrough?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onchange?` | `ChangeEventHandlerUnion<HTMLElement, Event> \| undefined` |
| `onChange?` | `ChangeEventHandlerUnion<HTMLElement, Event> \| undefined` |
| `onclick?` | `EventHandlerUnion<HTMLElement, MouseEvent, EventHandler<HTMLElement, MouseEvent>> \| undefined` |
| `onClick?` | `EventHandlerUnion<HTMLElement, MouseEvent, EventHandler<HTMLElement, MouseEvent>> \| undefined` |
| `onclose?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onClose?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `oncommand?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onCommand?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `oncompositionend?` | `EventHandlerUnion<HTMLElement, CompositionEvent, EventHandler<HTMLElement, CompositionEvent>> \| undefined` |
| `onCompositionEnd?` | `EventHandlerUnion<HTMLElement, CompositionEvent, EventHandler<HTMLElement, CompositionEvent>> \| undefined` |
| `oncompositionstart?` | `EventHandlerUnion<HTMLElement, CompositionEvent, EventHandler<HTMLElement, CompositionEvent>> \| undefined` |
| `onCompositionStart?` | `EventHandlerUnion<HTMLElement, CompositionEvent, EventHandler<HTMLElement, CompositionEvent>> \| undefined` |
| `oncompositionupdate?` | `EventHandlerUnion<HTMLElement, CompositionEvent, EventHandler<HTMLElement, CompositionEvent>> \| undefined` |
| `onCompositionUpdate?` | `EventHandlerUnion<HTMLElement, CompositionEvent, EventHandler<HTMLElement, CompositionEvent>> \| undefined` |
| `oncontentvisibilityautostatechange?` | `EventHandlerUnion<HTMLElement, ContentVisibilityAutoStateChangeEvent, EventHandler<HTMLElement, ContentVisibilityAutoStateChangeEvent>> \| undefined` |
| `onContentVisibilityAutoStateChange?` | `EventHandlerUnion<HTMLElement, ContentVisibilityAutoStateChangeEvent, EventHandler<HTMLElement, ContentVisibilityAutoStateChangeEvent>> \| undefined` |
| `oncontextlost?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onContextLost?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `oncontextmenu?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onContextMenu?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `oncontextrestored?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onContextRestored?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `oncopy?` | `EventHandlerUnion<HTMLElement, ClipboardEvent, EventHandler<HTMLElement, ClipboardEvent>> \| undefined` |
| `onCopy?` | `EventHandlerUnion<HTMLElement, ClipboardEvent, EventHandler<HTMLElement, ClipboardEvent>> \| undefined` |
| `oncuechange?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onCueChange?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `oncut?` | `EventHandlerUnion<HTMLElement, ClipboardEvent, EventHandler<HTMLElement, ClipboardEvent>> \| undefined` |
| `onCut?` | `EventHandlerUnion<HTMLElement, ClipboardEvent, EventHandler<HTMLElement, ClipboardEvent>> \| undefined` |
| `ondblclick?` | `EventHandlerUnion<HTMLElement, MouseEvent, EventHandler<HTMLElement, MouseEvent>> \| undefined` |
| `onDblClick?` | `EventHandlerUnion<HTMLElement, MouseEvent, EventHandler<HTMLElement, MouseEvent>> \| undefined` |
| `ondrag?` | `EventHandlerUnion<HTMLElement, DragEvent, EventHandler<HTMLElement, DragEvent>> \| undefined` |
| `onDrag?` | `EventHandlerUnion<HTMLElement, DragEvent, EventHandler<HTMLElement, DragEvent>> \| undefined` |
| `ondragend?` | `EventHandlerUnion<HTMLElement, DragEvent, EventHandler<HTMLElement, DragEvent>> \| undefined` |
| `onDragEnd?` | `EventHandlerUnion<HTMLElement, DragEvent, EventHandler<HTMLElement, DragEvent>> \| undefined` |
| `ondragenter?` | `EventHandlerUnion<HTMLElement, DragEvent, EventHandler<HTMLElement, DragEvent>> \| undefined` |
| `onDragEnter?` | `EventHandlerUnion<HTMLElement, DragEvent, EventHandler<HTMLElement, DragEvent>> \| undefined` |
| `ondragexit?` | `EventHandlerUnion<HTMLElement, DragEvent, EventHandler<HTMLElement, DragEvent>> \| undefined` |
| `onDragExit?` | `EventHandlerUnion<HTMLElement, DragEvent, EventHandler<HTMLElement, DragEvent>> \| undefined` |
| `ondragleave?` | `EventHandlerUnion<HTMLElement, DragEvent, EventHandler<HTMLElement, DragEvent>> \| undefined` |
| `onDragLeave?` | `EventHandlerUnion<HTMLElement, DragEvent, EventHandler<HTMLElement, DragEvent>> \| undefined` |
| `ondragover?` | `EventHandlerUnion<HTMLElement, DragEvent, EventHandler<HTMLElement, DragEvent>> \| undefined` |
| `onDragOver?` | `EventHandlerUnion<HTMLElement, DragEvent, EventHandler<HTMLElement, DragEvent>> \| undefined` |
| `ondragstart?` | `EventHandlerUnion<HTMLElement, DragEvent, EventHandler<HTMLElement, DragEvent>> \| undefined` |
| `onDragStart?` | `EventHandlerUnion<HTMLElement, DragEvent, EventHandler<HTMLElement, DragEvent>> \| undefined` |
| `ondrop?` | `EventHandlerUnion<HTMLElement, DragEvent, EventHandler<HTMLElement, DragEvent>> \| undefined` |
| `onDrop?` | `EventHandlerUnion<HTMLElement, DragEvent, EventHandler<HTMLElement, DragEvent>> \| undefined` |
| `ondurationchange?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onDurationChange?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onemptied?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onEmptied?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onended?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onEnded?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onerror?` | `EventHandlerUnion<HTMLElement, ErrorEvent, EventHandler<HTMLElement, ErrorEvent>> \| undefined` |
| `onError?` | `EventHandlerUnion<HTMLElement, ErrorEvent, EventHandler<HTMLElement, ErrorEvent>> \| undefined` |
| `onfocus?` | `FocusEventHandlerUnion<HTMLElement, FocusEvent> \| undefined` |
| `onFocus?` | `FocusEventHandlerUnion<HTMLElement, FocusEvent> \| undefined` |
| `onfocusin?` | `FocusEventHandlerUnion<HTMLElement, FocusEvent> \| undefined` |
| `onFocusIn?` | `FocusEventHandlerUnion<HTMLElement, FocusEvent> \| undefined` |
| `onfocusout?` | `FocusEventHandlerUnion<HTMLElement, FocusEvent> \| undefined` |
| `onFocusOut?` | `FocusEventHandlerUnion<HTMLElement, FocusEvent> \| undefined` |
| `onformdata?` | `EventHandlerUnion<HTMLElement, FormDataEvent, EventHandler<HTMLElement, FormDataEvent>> \| undefined` |
| `onFormData?` | `EventHandlerUnion<HTMLElement, FormDataEvent, EventHandler<HTMLElement, FormDataEvent>> \| undefined` |
| `onfullscreenchange?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onFullscreenChange?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onfullscreenerror?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onFullscreenError?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `ongotpointercapture?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onGotPointerCapture?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `oninput?` | `InputEventHandlerUnion<HTMLElement, InputEvent> \| undefined` |
| `onInput?` | `InputEventHandlerUnion<HTMLElement, InputEvent> \| undefined` |
| `oninvalid?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onInvalid?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onkeydown?` | `EventHandlerUnion<HTMLElement, KeyboardEvent, EventHandler<HTMLElement, KeyboardEvent>> \| undefined` |
| `onKeyDown?` | `EventHandlerUnion<HTMLElement, KeyboardEvent, EventHandler<HTMLElement, KeyboardEvent>> \| undefined` |
| `onkeypress?` | `EventHandlerUnion<HTMLElement, KeyboardEvent, EventHandler<HTMLElement, KeyboardEvent>> \| undefined` |
| `onKeyPress?` | `EventHandlerUnion<HTMLElement, KeyboardEvent, EventHandler<HTMLElement, KeyboardEvent>> \| undefined` |
| `onkeyup?` | `EventHandlerUnion<HTMLElement, KeyboardEvent, EventHandler<HTMLElement, KeyboardEvent>> \| undefined` |
| `onKeyUp?` | `EventHandlerUnion<HTMLElement, KeyboardEvent, EventHandler<HTMLElement, KeyboardEvent>> \| undefined` |
| `onload?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onLoad?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onloadeddata?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onLoadedData?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onloadedmetadata?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onLoadedMetadata?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onloadstart?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onLoadStart?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onlostpointercapture?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onLostPointerCapture?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onmousedown?` | `EventHandlerUnion<HTMLElement, MouseEvent, EventHandler<HTMLElement, MouseEvent>> \| undefined` |
| `onMouseDown?` | `EventHandlerUnion<HTMLElement, MouseEvent, EventHandler<HTMLElement, MouseEvent>> \| undefined` |
| `onmouseenter?` | `EventHandlerUnion<HTMLElement, MouseEvent, EventHandler<HTMLElement, MouseEvent>> \| undefined` |
| `onMouseEnter?` | `EventHandlerUnion<HTMLElement, MouseEvent, EventHandler<HTMLElement, MouseEvent>> \| undefined` |
| `onmouseleave?` | `EventHandlerUnion<HTMLElement, MouseEvent, EventHandler<HTMLElement, MouseEvent>> \| undefined` |
| `onMouseLeave?` | `EventHandlerUnion<HTMLElement, MouseEvent, EventHandler<HTMLElement, MouseEvent>> \| undefined` |
| `onmousemove?` | `EventHandlerUnion<HTMLElement, MouseEvent, EventHandler<HTMLElement, MouseEvent>> \| undefined` |
| `onMouseMove?` | `EventHandlerUnion<HTMLElement, MouseEvent, EventHandler<HTMLElement, MouseEvent>> \| undefined` |
| `onmouseout?` | `EventHandlerUnion<HTMLElement, MouseEvent, EventHandler<HTMLElement, MouseEvent>> \| undefined` |
| `onMouseOut?` | `EventHandlerUnion<HTMLElement, MouseEvent, EventHandler<HTMLElement, MouseEvent>> \| undefined` |
| `onmouseover?` | `EventHandlerUnion<HTMLElement, MouseEvent, EventHandler<HTMLElement, MouseEvent>> \| undefined` |
| `onMouseOver?` | `EventHandlerUnion<HTMLElement, MouseEvent, EventHandler<HTMLElement, MouseEvent>> \| undefined` |
| `onmouseup?` | `EventHandlerUnion<HTMLElement, MouseEvent, EventHandler<HTMLElement, MouseEvent>> \| undefined` |
| `onMouseUp?` | `EventHandlerUnion<HTMLElement, MouseEvent, EventHandler<HTMLElement, MouseEvent>> \| undefined` |
| `onpaste?` | `EventHandlerUnion<HTMLElement, ClipboardEvent, EventHandler<HTMLElement, ClipboardEvent>> \| undefined` |
| `onPaste?` | `EventHandlerUnion<HTMLElement, ClipboardEvent, EventHandler<HTMLElement, ClipboardEvent>> \| undefined` |
| `onpause?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onPause?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onplay?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onPlay?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onplaying?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onPlaying?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onpointercancel?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onPointerCancel?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onpointerdown?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onPointerDown?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onpointerenter?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onPointerEnter?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onpointerleave?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onPointerLeave?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onpointermove?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onPointerMove?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onpointerout?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onPointerOut?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onpointerover?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onPointerOver?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onpointerrawupdate?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onPointerRawUpdate?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onpointerup?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onPointerUp?` | `EventHandlerUnion<HTMLElement, PointerEvent, EventHandler<HTMLElement, PointerEvent>> \| undefined` |
| `onprogress?` | `EventHandlerUnion<HTMLElement, ProgressEvent<EventTarget>, EventHandler<HTMLElement, ProgressEvent<EventTarget>>> \| undefined` |
| `onProgress?` | `EventHandlerUnion<HTMLElement, ProgressEvent<EventTarget>, EventHandler<HTMLElement, ProgressEvent<EventTarget>>> \| undefined` |
| `onratechange?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onRateChange?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onreset?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onReset?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onresize?` | `EventHandlerUnion<HTMLElement, UIEvent, EventHandler<HTMLElement, UIEvent>> \| undefined` |
| `onResize?` | `EventHandlerUnion<HTMLElement, UIEvent, EventHandler<HTMLElement, UIEvent>> \| undefined` |
| `onscroll?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onScroll?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onscrollend?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onScrollEnd?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onscrollsnapchange?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onScrollSnapChange?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onscrollsnapchanging?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onScrollSnapChanging?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onsecuritypolicyviolation?` | `EventHandlerUnion<HTMLElement, SecurityPolicyViolationEvent, EventHandler<HTMLElement, SecurityPolicyViolationEvent>> \| undefined` |
| `onSecurityPolicyViolation?` | `EventHandlerUnion<HTMLElement, SecurityPolicyViolationEvent, EventHandler<HTMLElement, SecurityPolicyViolationEvent>> \| undefined` |
| `onseeked?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onSeeked?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onseeking?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onSeeking?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onselect?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onSelect?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onselectionchange?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onSelectionChange?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onselectstart?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onSelectStart?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onslotchange?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onSlotChange?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onstalled?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onStalled?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onsubmit?` | `EventHandlerUnion<HTMLElement, SubmitEvent, EventHandler<HTMLElement, SubmitEvent>> \| undefined` |
| `onSubmit?` | `EventHandlerUnion<HTMLElement, SubmitEvent, EventHandler<HTMLElement, SubmitEvent>> \| undefined` |
| `onsuspend?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onSuspend?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `ontimeupdate?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onTimeUpdate?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `ontoggle?` | `EventHandlerUnion<HTMLElement, ToggleEvent, EventHandler<HTMLElement, ToggleEvent>> \| undefined` |
| `onToggle?` | `EventHandlerUnion<HTMLElement, ToggleEvent, EventHandler<HTMLElement, ToggleEvent>> \| undefined` |
| `ontouchcancel?` | `EventHandlerUnion<HTMLElement, TouchEvent, EventHandler<HTMLElement, TouchEvent>> \| undefined` |
| `onTouchCancel?` | `EventHandlerUnion<HTMLElement, TouchEvent, EventHandler<HTMLElement, TouchEvent>> \| undefined` |
| `ontouchend?` | `EventHandlerUnion<HTMLElement, TouchEvent, EventHandler<HTMLElement, TouchEvent>> \| undefined` |
| `onTouchEnd?` | `EventHandlerUnion<HTMLElement, TouchEvent, EventHandler<HTMLElement, TouchEvent>> \| undefined` |
| `ontouchmove?` | `EventHandlerUnion<HTMLElement, TouchEvent, EventHandler<HTMLElement, TouchEvent>> \| undefined` |
| `onTouchMove?` | `EventHandlerUnion<HTMLElement, TouchEvent, EventHandler<HTMLElement, TouchEvent>> \| undefined` |
| `ontouchstart?` | `EventHandlerUnion<HTMLElement, TouchEvent, EventHandler<HTMLElement, TouchEvent>> \| undefined` |
| `onTouchStart?` | `EventHandlerUnion<HTMLElement, TouchEvent, EventHandler<HTMLElement, TouchEvent>> \| undefined` |
| `ontransitioncancel?` | `EventHandlerUnion<HTMLElement, TransitionEvent, EventHandler<HTMLElement, TransitionEvent>> \| undefined` |
| `onTransitionCancel?` | `EventHandlerUnion<HTMLElement, TransitionEvent, EventHandler<HTMLElement, TransitionEvent>> \| undefined` |
| `ontransitionend?` | `EventHandlerUnion<HTMLElement, TransitionEvent, EventHandler<HTMLElement, TransitionEvent>> \| undefined` |
| `onTransitionEnd?` | `EventHandlerUnion<HTMLElement, TransitionEvent, EventHandler<HTMLElement, TransitionEvent>> \| undefined` |
| `ontransitionrun?` | `EventHandlerUnion<HTMLElement, TransitionEvent, EventHandler<HTMLElement, TransitionEvent>> \| undefined` |
| `onTransitionRun?` | `EventHandlerUnion<HTMLElement, TransitionEvent, EventHandler<HTMLElement, TransitionEvent>> \| undefined` |
| `ontransitionstart?` | `EventHandlerUnion<HTMLElement, TransitionEvent, EventHandler<HTMLElement, TransitionEvent>> \| undefined` |
| `onTransitionStart?` | `EventHandlerUnion<HTMLElement, TransitionEvent, EventHandler<HTMLElement, TransitionEvent>> \| undefined` |
| `onvolumechange?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onVolumeChange?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onwaiting?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onWaiting?` | `EventHandlerUnion<HTMLElement, Event, EventHandler<HTMLElement, Event>> \| undefined` |
| `onwheel?` | `EventHandlerUnion<HTMLElement, WheelEvent, EventHandler<HTMLElement, WheelEvent>> \| undefined` |
| `onWheel?` | `EventHandlerUnion<HTMLElement, WheelEvent, EventHandler<HTMLElement, WheelEvent>> \| undefined` |
| `params?` | `Params \| undefined` |
| `part?` | `string \| undefined` |
| `plural?` | `string \| number \| null \| undefined` |
| `popover?` | `boolean \| "auto" \| "manual" \| undefined` |
| `prefix?` | `string \| undefined` |
| `property?` | `string \| undefined` |
| `ref?` | `HTMLElement \| ((el: HTMLElement) => void) \| undefined` |
| `relativeDate?` | `string \| number \| Date \| null \| undefined` |
| `resource?` | `string \| undefined` |
| `role?` | `"none" \| "search" \| "list" \| "link" \| "menu" \| "listbox" \| "tree" \| "grid" \| "dialog" \| "alert" \| "alertdialog" \| "application" \| "article" \| "banner" \| "button" \| "cell" \| "checkbox" \| "columnheader" \| "combobox" \| "complementary" \| "contentinfo" \| "definition" \| "directory" \| "document" \| "feed" \| "figure" \| "form" \| "gridcell" \| "group" \| "heading" \| "img" \| "listitem" \| "log" \| "main" \| "marquee" \| "math" \| "menubar" \| "menuitem" \| "menuitemcheckbox" \| "menuitemradio" \| "meter" \| "navigation" \| "note" \| "option" \| "presentation" \| "progressbar" \| "radio" \| "radiogroup" \| "region" \| "row" \| "rowgroup" \| "rowheader" \| "scrollbar" \| "searchbox" \| "separator" \| "slider" \| "spinbutton" \| "status" \| "switch" \| "tab" \| "table" \| "tablist" \| "tabpanel" \| "term" \| "textbox" \| "timer" \| "toolbar" \| "tooltip" \| "treegrid" \| "treeitem" \| undefined` |
| `slot?` | `string \| undefined` |
| `spellcheck?` | `boolean \| "true" \| "false" \| undefined` |
| `style?` | `string \| CSSProperties \| undefined` |
| `tabindex?` | `string \| number \| undefined` |
| `tabIndex?` | `string \| number \| undefined` |
| `tag?` | `string \| undefined` |
| `textContent?` | `string \| number \| undefined` |
| `title?` | `string \| undefined` |
| `translate?` | `"yes" \| "no" \| undefined` |
| `typeof?` | `string \| undefined` |
| `vocab?` | `string \| undefined` |

</details>

<code>Locale</code> — 11 members, identical to [`Locale`](/api/packages/types).

<code>ModuleOptions</code> — 51 members, identical to [`ModuleOptions`](/api/packages/types).

<details>
<summary><code>SolidI18n</code> — 67 members</summary>

| Member | Type |
| --- | --- |
| `activeKey` | `private any` |
| `activeRootKey` | `private any` |
| `addLocaleIso` | `(localeIso: Record<string, string>) => void` |
| `addRouteTranslations` | `(locale: string, routeName: string, translations: Translations, merge?: boolean) => void` |
| `addTranslations` | `(locale: string, translations: Translations, merge?: boolean) => void` |
| `clear` | `() => void` |
| `clearCache` | `() => void` |
| `currentRoute` | `string` |
| `extend` | `<M extends Record<string, unknown>>(methods: M & ThisType<import("../../solid/src").SolidI18n & M>) => import("../../solid/src").SolidI18n & M` |
| `fallbackKey` | `private any` |
| `fallbackLocale` | `string` |
| `fallbackRootKey` | `private any` |
| `fallbackSignal` | `private Accessor<string>` |
| `fork` | `(locale?: string) => import("../../solid/src").SolidI18n` |
| `formatArgs` | `private any` |
| `formatter` | `FormatService` |
| `getCustomMissingHandler?` | `(() => MissingHandler \| null) \| undefined` |
| `getFallbackLocale` | `() => string` |
| `getLocale` | `() => string` |
| `getMissingContext` | `protected (routeContext?: unknown) => { locale: string; routeName: string; }` |
| `getRoute` | `() => string` |
| `getSnapshot` | `() => string` |
| `has` | `(key: TranslationKey, routeContext?: unknown) => boolean` |
| `hasTranslation` | `(key: TranslationKey) => boolean` |
| `helper` | `TranslationHelper` |
| `loadFromUrl` | `(url: string, options?: LoadFromUrlOptions) => Promise<void>` |
| `loadFromUrls` | `(entries: LoadFromUrlEntry[]) => Promise<void>` |
| `loadMessages` | `(messages?: Record<string, Translations>, routeMessages?: Record<string, Record<string, Translations>>) => void` |
| `loadRouteTranslationsCore` | `(locale: string, routeName: string, translations: Translations, merge: boolean) => void` |
| `loadTranslationsCore` | `(locale: string, translations: Translations, merge: boolean, routeName?: string) => void` |
| `locale` | `string` |
| `localeAccessor` | `Accessor<string>` |
| `localeIso` | `protected Record<string, string>` |
| `localeSignal` | `private Accessor<string>` |
| `lookupLocale` | `private any` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn` | `boolean` |
| `new` | `(options: I18nOptions): SolidI18n` |
| `onTranslationsChanged` | `protected (locale?: string) => void` |
| `ownStore` | `protected ReactiveI18nStore` |
| `pluralFunc` | `PluralFunc` |
| `pluralLocale` | `() => string` |
| `pluralTag` | `private any` |
| `resolveHas` | `protected (key: TranslationKey, routeContext?: unknown) => boolean` |
| `resolveLookup` | `protected (key: TranslationKey, routeContext?: unknown) => unknown \| null` |
| `resolveRouteName` | `protected (routeContext?: unknown) => string` |
| `resolveTranslations` | `(routeContext?: unknown) => Translations` |
| `resolveTranslationTree` | `protected (lower: Record<string, unknown>, upper: Record<string, unknown>) => Translations` |
| `revision` | `private Accessor<number>` |
| `routeAccessor` | `Accessor<string>` |
| `routeSignal` | `private Accessor<string>` |
| `setRoute` | `(routeName: string) => void` |
| `setTranslation` | `(key: TranslationKey, value: unknown) => void` |
| `storage` | `TranslationStorage` |
| `store` | `protected ReactiveI18nStore` |
| `subscribe` | `(listener: () => void) => () => void` |
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

<code>Translations</code> — 1 members, identical to [`Translations`](/api/packages/types).

<code>UseI18nOptions</code> — 2 members, identical to [`UseI18nOptions`](/api/packages/preact).
## `@i18n-micro/solid/router`

```ts
import { /* … */ } from '@i18n-micro/solid/router'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `createSolidRouterAdapter` | function | `(locales: Locale[], defaultLocale: string, navigate: NavigateFunction, location: Location) => I18nRoutingStrategy` |
| `I18nRoutingStrategy` | interface | 6 members |

<code>I18nRoutingStrategy</code> — 6 members, identical to `I18nRoutingStrategy` above.

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
