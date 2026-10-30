---
title: '@i18n-micro/preact'
description: 'Exported API of @i18n-micro/preact, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/preact`

42 exports across 2 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/contributing/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/preact`

```ts
import { /* … */ } from '@i18n-micro/preact'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `CleanTranslation` | type | `string \| number \| boolean \| Translations \| PluralTranslations \| null` |
| `createI18n` | function | `(options: I18nOptions) => I18n` |
| `defaultPlural` | const | `PluralFunc` |
| `FormatService` | class | 21 members |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `I18nConfig` | interface | 5 members |
| `I18nConfigContext` | const | `import("preact").Context<I18nConfig \| null>` |
| `I18nContext` | const | `import("preact").Context<I18n \| null>` |
| `I18nGroup` | const | `(props: I18nGroupProps) => HostElement` |
| `I18nGroupProps` | interface | 308 members |
| `I18nLink` | const | `(props: I18nLinkProps) => HostElement` |
| `I18nLinkProps` | type | `HostAnchorAttrs<HTMLAnchorElement> & { to: RouteTarget activeStyle?: HostStyle localeRoute?: (to: RouteTarget, locale?: string) => RouteTarget children?: HostNode }` |
| `I18nProvider` | function | `({ i18n, locales, defaultLocale, routingStrategy, children, ...options }: I18nProviderProps) => HostElement` |
| `I18nProviderProps` | interface | 18 members |
| `I18nRoutingStrategy` | interface | 6 members |
| `I18nSwitcher` | const | `(props: I18nSwitcherProps) => HostElement` |
| `I18nSwitcherProps` | interface | 321 members |
| `I18nT` | const | `(props: I18nTProps) => HostElement` |
| `I18nTComponent` | type | `HostNode \| (() => HostNode)` |
| `I18nTProps` | interface | 319 members |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `Locale` | interface | 11 members |
| `LocaleCode` | type | `string` |
| `ModuleOptions` | interface | 51 members |
| `Params` | type | `Record<string, string \| number \| boolean>` |
| `PluralFunc` | type | `(key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string \| null` |
| `PreactI18n` | class | 61 members |
| `PreactI18nOptions` | interface | 13 members |
| `RouteTarget` | type | `string \| { path?: string }` |
| `TranslationKey` | type | `Exclude<keyof DefineLocaleMessage, '__augmentation'> extends never ? string : Exclude<keyof DefineLocaleMessage, '__augmentation'> \| (string & {})` |
| `Translations` | interface | 1 members |
| `useI18n` | const | `(options?: UseI18nOptions) => UseI18nReturn` |
| `useI18nContext` | const | `() => I18n` |
| `useI18nDefaultLocale` | const | `() => string \| null` |
| `useI18nLocales` | const | `() => Locale[] \| null` |
| `UseI18nOptions` | interface | 2 members |
| `UseI18nReturn` | interface | 22 members |
| `useI18nRouter` | const | `() => I18nRoutingStrategy \| null` |
| `useLocaleSwitch` | function | `(load: (locale: string) => unknown) => [(locale: string) => Promise<void>, boolean]` |
| `useT` | function | `(key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string` |

<code>FormatService</code> — 21 members, identical to [`FormatService`](/api/packages/astro).

<details>
<summary><code>I18nConfig</code> — 5 members</summary>

| Member | Type |
| --- | --- |
| `api` | `{ snapshot: string; value: UseI18nReturn; } \| null` |
| `defaultLocale` | `string \| null` |
| `locales` | `Locale[] \| null` |
| `methods` | `{ current: TranslationMethods \| null; }` |
| `router` | `I18nRoutingStrategy \| null` |

</details>

<details>
<summary><code>I18nGroupProps</code> — 308 members</summary>

| Member | Type |
| --- | --- |
| `about?` | `Signalish<string \| undefined>` |
| `accesskey?` | `Signalish<string \| undefined>` |
| `accessKey?` | `Signalish<string \| undefined>` |
| `aria-activedescendant?` | `Signalish<string \| undefined>` |
| `aria-atomic?` | `Signalish<Booleanish \| undefined>` |
| `aria-autocomplete?` | `Signalish<"none" \| "list" \| "inline" \| "both" \| undefined>` |
| `aria-braillelabel?` | `Signalish<string \| undefined>` |
| `aria-brailleroledescription?` | `Signalish<string \| undefined>` |
| `aria-busy?` | `Signalish<Booleanish \| undefined>` |
| `aria-checked?` | `Signalish<Booleanish \| "mixed" \| undefined>` |
| `aria-colcount?` | `Signalish<number \| undefined>` |
| `aria-colindex?` | `Signalish<number \| undefined>` |
| `aria-colindextext?` | `Signalish<string \| undefined>` |
| `aria-colspan?` | `Signalish<number \| undefined>` |
| `aria-controls?` | `Signalish<string \| undefined>` |
| `aria-current?` | `Signalish<Booleanish \| "time" \| "location" \| "page" \| "step" \| "date" \| undefined>` |
| `aria-describedby?` | `Signalish<string \| undefined>` |
| `aria-description?` | `Signalish<string \| undefined>` |
| `aria-details?` | `Signalish<string \| undefined>` |
| `aria-disabled?` | `Signalish<Booleanish \| undefined>` |
| `aria-dropeffect?` | `Signalish<"none" \| "link" \| "copy" \| "execute" \| "move" \| "popup" \| undefined>` |
| `aria-errormessage?` | `Signalish<string \| undefined>` |
| `aria-expanded?` | `Signalish<Booleanish \| undefined>` |
| `aria-flowto?` | `Signalish<string \| undefined>` |
| `aria-grabbed?` | `Signalish<Booleanish \| undefined>` |
| `aria-haspopup?` | `Signalish<Booleanish \| "dialog" \| "grid" \| "listbox" \| "menu" \| "tree" \| undefined>` |
| `aria-hidden?` | `Signalish<Booleanish \| undefined>` |
| `aria-invalid?` | `Signalish<Booleanish \| "grammar" \| "spelling" \| undefined>` |
| `aria-keyshortcuts?` | `Signalish<string \| undefined>` |
| `aria-label?` | `Signalish<string \| undefined>` |
| `aria-labelledby?` | `Signalish<string \| undefined>` |
| `aria-level?` | `Signalish<number \| undefined>` |
| `aria-live?` | `Signalish<"off" \| "assertive" \| "polite" \| undefined>` |
| `aria-modal?` | `Signalish<Booleanish \| undefined>` |
| `aria-multiline?` | `Signalish<Booleanish \| undefined>` |
| `aria-multiselectable?` | `Signalish<Booleanish \| undefined>` |
| `aria-orientation?` | `Signalish<"horizontal" \| "vertical" \| undefined>` |
| `aria-owns?` | `Signalish<string \| undefined>` |
| `aria-placeholder?` | `Signalish<string \| undefined>` |
| `aria-posinset?` | `Signalish<number \| undefined>` |
| `aria-pressed?` | `Signalish<Booleanish \| "mixed" \| undefined>` |
| `aria-readonly?` | `Signalish<Booleanish \| undefined>` |
| `aria-relevant?` | `Signalish<"additions" \| "additions removals" \| "additions text" \| "all" \| "removals" \| "removals additions" \| "removals text" \| "text" \| "text additions" \| "text removals" \| undefined>` |
| `aria-required?` | `Signalish<Booleanish \| undefined>` |
| `aria-roledescription?` | `Signalish<string \| undefined>` |
| `aria-rowcount?` | `Signalish<number \| undefined>` |
| `aria-rowindex?` | `Signalish<number \| undefined>` |
| `aria-rowindextext?` | `Signalish<string \| undefined>` |
| `aria-rowspan?` | `Signalish<number \| undefined>` |
| `aria-selected?` | `Signalish<Booleanish \| undefined>` |
| `aria-setsize?` | `Signalish<number \| undefined>` |
| `aria-sort?` | `Signalish<"none" \| "ascending" \| "descending" \| "other" \| undefined>` |
| `aria-valuemax?` | `Signalish<number \| undefined>` |
| `aria-valuemin?` | `Signalish<number \| undefined>` |
| `aria-valuenow?` | `Signalish<number \| undefined>` |
| `aria-valuetext?` | `Signalish<string \| undefined>` |
| `autocapitalize?` | `Signalish<"off" \| "none" \| "on" \| "sentences" \| "words" \| "characters" \| undefined>` |
| `autoCapitalize?` | `Signalish<"off" \| "none" \| "on" \| "sentences" \| "words" \| "characters" \| undefined>` |
| `autocorrect?` | `Signalish<string \| undefined>` |
| `autoCorrect?` | `Signalish<string \| undefined>` |
| `autofocus?` | `Signalish<boolean \| undefined>` |
| `autoFocus?` | `Signalish<boolean \| undefined>` |
| `children?` | `import("preact").ComponentChildren \| ((props: { prefix: string; t: (key: string, params?: Record<string, string \| number \| boolean>) => string; }) => HostNode)` |
| `class?` | `Signalish<string \| undefined>` |
| `className?` | `Signalish<string \| undefined>` |
| `contenteditable?` | `Signalish<"" \| Booleanish \| "plaintext-only" \| "inherit" \| undefined>` |
| `contentEditable?` | `Signalish<"" \| Booleanish \| "plaintext-only" \| "inherit" \| undefined>` |
| `dangerouslySetInnerHTML?` | `{ __html: Parameters<DOMParser["parseFromString"]>[0]; } \| undefined` |
| `datatype?` | `Signalish<string \| undefined>` |
| `dir?` | `Signalish<"auto" \| "rtl" \| "ltr" \| undefined>` |
| `disablePictureInPicture?` | `Signalish<boolean \| undefined>` |
| `draggable?` | `Signalish<boolean \| undefined>` |
| `elementtiming?` | `Signalish<string \| undefined>` |
| `elementTiming?` | `Signalish<string \| undefined>` |
| `enterkeyhint?` | `Signalish<"enter" \| "done" \| "go" \| "next" \| "previous" \| "search" \| "send" \| undefined>` |
| `exportparts?` | `Signalish<string \| undefined>` |
| `groupClass?` | `string \| undefined` |
| `hidden?` | `Signalish<boolean \| "hidden" \| "until-found" \| undefined>` |
| `id?` | `Signalish<string \| undefined>` |
| `inert?` | `Signalish<boolean \| undefined>` |
| `inlist?` | `any` |
| `inputmode?` | `Signalish<string \| undefined>` |
| `inputMode?` | `Signalish<string \| undefined>` |
| `is?` | `Signalish<string \| undefined>` |
| `itemid?` | `Signalish<string \| undefined>` |
| `itemID?` | `Signalish<string \| undefined>` |
| `itemprop?` | `Signalish<string \| undefined>` |
| `itemProp?` | `Signalish<string \| undefined>` |
| `itemref?` | `Signalish<string \| undefined>` |
| `itemRef?` | `Signalish<string \| undefined>` |
| `itemscope?` | `Signalish<boolean \| undefined>` |
| `itemScope?` | `Signalish<boolean \| undefined>` |
| `itemtype?` | `Signalish<string \| undefined>` |
| `itemType?` | `Signalish<string \| undefined>` |
| `jsx?` | `boolean \| undefined` |
| `key?` | `any` |
| `lang?` | `Signalish<string \| undefined>` |
| `nonce?` | `Signalish<string \| undefined>` |
| `onAbort?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onAbortCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onAnimationEnd?` | `AnimationEventHandler<HTMLDivElement> \| undefined` |
| `onAnimationEndCapture?` | `AnimationEventHandler<HTMLDivElement> \| undefined` |
| `onAnimationIteration?` | `AnimationEventHandler<HTMLDivElement> \| undefined` |
| `onAnimationIterationCapture?` | `AnimationEventHandler<HTMLDivElement> \| undefined` |
| `onAnimationStart?` | `AnimationEventHandler<HTMLDivElement> \| undefined` |
| `onAnimationStartCapture?` | `AnimationEventHandler<HTMLDivElement> \| undefined` |
| `onAuxClick?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onAuxClickCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onBeforeInput?` | `InputEventHandler<HTMLDivElement> \| undefined` |
| `onBeforeInputCapture?` | `InputEventHandler<HTMLDivElement> \| undefined` |
| `onBeforeToggle?` | `ToggleEventHandler<HTMLDivElement> \| undefined` |
| `onBlur?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onBlurCapture?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onCancel?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onCanPlay?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onCanPlayCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onCanPlayThrough?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onCanPlayThroughCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onChange?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onChangeCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onClick?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onClickCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onClose?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onCommand?` | `CommandEventHandler<HTMLDivElement> \| undefined` |
| `onCompositionEnd?` | `CompositionEventHandler<HTMLDivElement> \| undefined` |
| `onCompositionEndCapture?` | `CompositionEventHandler<HTMLDivElement> \| undefined` |
| `onCompositionStart?` | `CompositionEventHandler<HTMLDivElement> \| undefined` |
| `onCompositionStartCapture?` | `CompositionEventHandler<HTMLDivElement> \| undefined` |
| `onCompositionUpdate?` | `CompositionEventHandler<HTMLDivElement> \| undefined` |
| `onCompositionUpdateCapture?` | `CompositionEventHandler<HTMLDivElement> \| undefined` |
| `onContextMenu?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onContextMenuCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onCopy?` | `ClipboardEventHandler<HTMLDivElement> \| undefined` |
| `onCopyCapture?` | `ClipboardEventHandler<HTMLDivElement> \| undefined` |
| `onCut?` | `ClipboardEventHandler<HTMLDivElement> \| undefined` |
| `onCutCapture?` | `ClipboardEventHandler<HTMLDivElement> \| undefined` |
| `onDblClick?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onDblClickCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onDrag?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragCapture?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragEnd?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragEndCapture?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragEnter?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragEnterCapture?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragExit?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragExitCapture?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragLeave?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragLeaveCapture?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragOver?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragOverCapture?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragStart?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragStartCapture?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDrop?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDropCapture?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDurationChange?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onDurationChangeCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onEmptied?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onEmptiedCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onEncrypted?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onEncryptedCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onEnded?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onEndedCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onEnterPictureInPicture?` | `PictureInPictureEventHandler<HTMLDivElement> \| undefined` |
| `onEnterPictureInPictureCapture?` | `PictureInPictureEventHandler<HTMLDivElement> \| undefined` |
| `onError?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onErrorCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onFocus?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onFocusCapture?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onFocusIn?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onFocusInCapture?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onFocusOut?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onFocusOutCapture?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onFormData?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onFormDataCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onGotPointerCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onGotPointerCaptureCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onInput?` | `InputEventHandler<HTMLDivElement> \| undefined` |
| `onInputCapture?` | `InputEventHandler<HTMLDivElement> \| undefined` |
| `onInvalid?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onInvalidCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onKeyDown?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyDownCapture?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyPress?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyPressCapture?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyUp?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyUpCapture?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onLeavePictureInPicture?` | `PictureInPictureEventHandler<HTMLDivElement> \| undefined` |
| `onLeavePictureInPictureCapture?` | `PictureInPictureEventHandler<HTMLDivElement> \| undefined` |
| `onLoad?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onLoadCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onLoadedData?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onLoadedDataCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onLoadedMetadata?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onLoadedMetadataCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onLoadStart?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onLoadStartCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onLostPointerCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onLostPointerCaptureCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onMouseDown?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseDownCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseEnter?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseEnterCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseLeave?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseLeaveCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseMove?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseMoveCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseOut?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseOutCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseOver?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseOverCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseUp?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseUpCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onPaste?` | `ClipboardEventHandler<HTMLDivElement> \| undefined` |
| `onPasteCapture?` | `ClipboardEventHandler<HTMLDivElement> \| undefined` |
| `onPause?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onPauseCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onPlay?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onPlayCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onPlaying?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onPlayingCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onPointerCancel?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerCancelCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerDown?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerDownCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerEnter?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerEnterCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerLeave?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerLeaveCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerMove?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerMoveCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerOut?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerOutCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerOver?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerOverCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerUp?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerUpCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onProgress?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onProgressCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onRateChange?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onRateChangeCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onReset?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onResetCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onResize?` | `PictureInPictureEventHandler<HTMLDivElement> \| undefined` |
| `onResizeCapture?` | `PictureInPictureEventHandler<HTMLDivElement> \| undefined` |
| `onScroll?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onScrollCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onScrollEnd?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onScrollEndCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onScrollSnapChange?` | `SnapEventHandler<HTMLDivElement> \| undefined` |
| `onScrollSnapChangeCapture?` | `SnapEventHandler<HTMLDivElement> \| undefined` |
| `onScrollSnapChanging?` | `SnapEventHandler<HTMLDivElement> \| undefined` |
| `onScrollSnapChangingCapture?` | `SnapEventHandler<HTMLDivElement> \| undefined` |
| `onSearch?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onSearchCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onSeeked?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onSeekedCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onSeeking?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onSeekingCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onSelect?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onSelectCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onStalled?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onStalledCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onSubmit?` | `SubmitEventHandler<HTMLDivElement> \| undefined` |
| `onSubmitCapture?` | `SubmitEventHandler<HTMLDivElement> \| undefined` |
| `onSuspend?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onSuspendCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onTimeUpdate?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onTimeUpdateCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onToggle?` | `ToggleEventHandler<HTMLDivElement> \| undefined` |
| `onTouchCancel?` | `TouchEventHandler<HTMLDivElement> \| undefined` |
| `onTouchCancelCapture?` | `TouchEventHandler<HTMLDivElement> \| undefined` |
| `onTouchEnd?` | `TouchEventHandler<HTMLDivElement> \| undefined` |
| `onTouchEndCapture?` | `TouchEventHandler<HTMLDivElement> \| undefined` |
| `onTouchMove?` | `TouchEventHandler<HTMLDivElement> \| undefined` |
| `onTouchMoveCapture?` | `TouchEventHandler<HTMLDivElement> \| undefined` |
| `onTouchStart?` | `TouchEventHandler<HTMLDivElement> \| undefined` |
| `onTouchStartCapture?` | `TouchEventHandler<HTMLDivElement> \| undefined` |
| `onTransitionCancel?` | `TransitionEventHandler<HTMLDivElement> \| undefined` |
| `onTransitionCancelCapture?` | `TransitionEventHandler<HTMLDivElement> \| undefined` |
| `onTransitionEnd?` | `TransitionEventHandler<HTMLDivElement> \| undefined` |
| `onTransitionEndCapture?` | `TransitionEventHandler<HTMLDivElement> \| undefined` |
| `onTransitionRun?` | `TransitionEventHandler<HTMLDivElement> \| undefined` |
| `onTransitionRunCapture?` | `TransitionEventHandler<HTMLDivElement> \| undefined` |
| `onTransitionStart?` | `TransitionEventHandler<HTMLDivElement> \| undefined` |
| `onTransitionStartCapture?` | `TransitionEventHandler<HTMLDivElement> \| undefined` |
| `onVolumeChange?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onVolumeChangeCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onWaiting?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onWaitingCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onWheel?` | `WheelEventHandler<HTMLDivElement> \| undefined` |
| `onWheelCapture?` | `WheelEventHandler<HTMLDivElement> \| undefined` |
| `part?` | `Signalish<string \| undefined>` |
| `popover?` | `Signalish<boolean \| "auto" \| "hint" \| "manual" \| undefined>` |
| `prefix` | `string` |
| `property?` | `Signalish<string \| undefined>` |
| `ref?` | `Ref<HTMLDivElement> \| undefined` |
| `resource?` | `Signalish<string \| undefined>` |
| `results?` | `Signalish<number \| undefined>` |
| `role?` | `Signalish<AriaRole \| undefined>` |
| `slot?` | `Signalish<string \| undefined>` |
| `spellcheck?` | `Signalish<boolean \| undefined>` |
| `style?` | `Signalish<string \| CSSProperties \| undefined>` |
| `tabindex?` | `Signalish<number \| undefined>` |
| `tabIndex?` | `Signalish<number \| undefined>` |
| `title?` | `Signalish<string \| undefined>` |
| `translate?` | `Signalish<boolean \| undefined>` |
| `typeof?` | `Signalish<string \| undefined>` |
| `vocab?` | `Signalish<string \| undefined>` |

</details>

<details>
<summary><code>I18nProviderProps</code> — 18 members</summary>

| Member | Type |
| --- | --- |
| `children?` | `import("preact").ComponentChildren` |
| `datetimeFormats?` | `DateTimeFormatsConfig \| undefined` |
| `defaultLocale?` | `string \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `i18n?` | `I18n \| undefined` |
| `locale?` | `string \| undefined` |
| `localeIso?` | `Record<string, string> \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `messages?` | `Record<string, Translations> \| undefined` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `now?` | `(() => number) \| undefined` |
| `numberFormats?` | `NumberFormatsConfig \| undefined` |
| `parent?` | `I18n \| undefined` |
| `plural?` | `PluralFunc \| undefined` |
| `routeMessages?` | `Record<string, Record<string, Translations>> \| undefined` |
| `routingStrategy?` | `I18nRoutingStrategy \| undefined` |
| `timeZone?` | `string \| undefined` |

</details>

<details>
<summary><code>I18nRoutingStrategy</code> — 6 members</summary>

| Member | Type |
| --- | --- |
| `getCurrentPath` | `() => string` |
| `getRoute?` | `(() => { fullPath: string; query: Record<string, unknown>; }) \| undefined` |
| `linkComponent?` | `string \| HostComponent<{ [key: string]: unknown; href: string; children?: HostNode; style?: HostStyle; className?: string; }> \| undefined` |
| `push` | `(target: { path: string; }) => void` |
| `replace` | `(target: { path: string; }) => void` |
| `resolvePath?` | `((to: RouteTarget, locale: string) => RouteTarget) \| undefined` |

</details>

<details>
<summary><code>I18nSwitcherProps</code> — 321 members</summary>

| Member | Type |
| --- | --- |
| `about?` | `Signalish<string \| undefined>` |
| `accesskey?` | `Signalish<string \| undefined>` |
| `accessKey?` | `Signalish<string \| undefined>` |
| `aria-activedescendant?` | `Signalish<string \| undefined>` |
| `aria-atomic?` | `Signalish<Booleanish \| undefined>` |
| `aria-autocomplete?` | `Signalish<"none" \| "list" \| "inline" \| "both" \| undefined>` |
| `aria-braillelabel?` | `Signalish<string \| undefined>` |
| `aria-brailleroledescription?` | `Signalish<string \| undefined>` |
| `aria-busy?` | `Signalish<Booleanish \| undefined>` |
| `aria-checked?` | `Signalish<Booleanish \| "mixed" \| undefined>` |
| `aria-colcount?` | `Signalish<number \| undefined>` |
| `aria-colindex?` | `Signalish<number \| undefined>` |
| `aria-colindextext?` | `Signalish<string \| undefined>` |
| `aria-colspan?` | `Signalish<number \| undefined>` |
| `aria-controls?` | `Signalish<string \| undefined>` |
| `aria-current?` | `Signalish<Booleanish \| "time" \| "location" \| "page" \| "step" \| "date" \| undefined>` |
| `aria-describedby?` | `Signalish<string \| undefined>` |
| `aria-description?` | `Signalish<string \| undefined>` |
| `aria-details?` | `Signalish<string \| undefined>` |
| `aria-disabled?` | `Signalish<Booleanish \| undefined>` |
| `aria-dropeffect?` | `Signalish<"none" \| "link" \| "copy" \| "execute" \| "move" \| "popup" \| undefined>` |
| `aria-errormessage?` | `Signalish<string \| undefined>` |
| `aria-expanded?` | `Signalish<Booleanish \| undefined>` |
| `aria-flowto?` | `Signalish<string \| undefined>` |
| `aria-grabbed?` | `Signalish<Booleanish \| undefined>` |
| `aria-haspopup?` | `Signalish<Booleanish \| "dialog" \| "grid" \| "listbox" \| "menu" \| "tree" \| undefined>` |
| `aria-hidden?` | `Signalish<Booleanish \| undefined>` |
| `aria-invalid?` | `Signalish<Booleanish \| "grammar" \| "spelling" \| undefined>` |
| `aria-keyshortcuts?` | `Signalish<string \| undefined>` |
| `aria-label?` | `Signalish<string \| undefined>` |
| `aria-labelledby?` | `Signalish<string \| undefined>` |
| `aria-level?` | `Signalish<number \| undefined>` |
| `aria-live?` | `Signalish<"off" \| "assertive" \| "polite" \| undefined>` |
| `aria-modal?` | `Signalish<Booleanish \| undefined>` |
| `aria-multiline?` | `Signalish<Booleanish \| undefined>` |
| `aria-multiselectable?` | `Signalish<Booleanish \| undefined>` |
| `aria-orientation?` | `Signalish<"horizontal" \| "vertical" \| undefined>` |
| `aria-owns?` | `Signalish<string \| undefined>` |
| `aria-placeholder?` | `Signalish<string \| undefined>` |
| `aria-posinset?` | `Signalish<number \| undefined>` |
| `aria-pressed?` | `Signalish<Booleanish \| "mixed" \| undefined>` |
| `aria-readonly?` | `Signalish<Booleanish \| undefined>` |
| `aria-relevant?` | `Signalish<"additions" \| "additions removals" \| "additions text" \| "all" \| "removals" \| "removals additions" \| "removals text" \| "text" \| "text additions" \| "text removals" \| undefined>` |
| `aria-required?` | `Signalish<Booleanish \| undefined>` |
| `aria-roledescription?` | `Signalish<string \| undefined>` |
| `aria-rowcount?` | `Signalish<number \| undefined>` |
| `aria-rowindex?` | `Signalish<number \| undefined>` |
| `aria-rowindextext?` | `Signalish<string \| undefined>` |
| `aria-rowspan?` | `Signalish<number \| undefined>` |
| `aria-selected?` | `Signalish<Booleanish \| undefined>` |
| `aria-setsize?` | `Signalish<number \| undefined>` |
| `aria-sort?` | `Signalish<"none" \| "ascending" \| "descending" \| "other" \| undefined>` |
| `aria-valuemax?` | `Signalish<number \| undefined>` |
| `aria-valuemin?` | `Signalish<number \| undefined>` |
| `aria-valuenow?` | `Signalish<number \| undefined>` |
| `aria-valuetext?` | `Signalish<string \| undefined>` |
| `autocapitalize?` | `Signalish<"off" \| "none" \| "on" \| "sentences" \| "words" \| "characters" \| undefined>` |
| `autoCapitalize?` | `Signalish<"off" \| "none" \| "on" \| "sentences" \| "words" \| "characters" \| undefined>` |
| `autocorrect?` | `Signalish<string \| undefined>` |
| `autoCorrect?` | `Signalish<string \| undefined>` |
| `autofocus?` | `Signalish<boolean \| undefined>` |
| `autoFocus?` | `Signalish<boolean \| undefined>` |
| `children?` | `ComponentChildren` |
| `class?` | `Signalish<string \| undefined>` |
| `className?` | `Signalish<string \| undefined>` |
| `contenteditable?` | `Signalish<"" \| Booleanish \| "plaintext-only" \| "inherit" \| undefined>` |
| `contentEditable?` | `Signalish<"" \| Booleanish \| "plaintext-only" \| "inherit" \| undefined>` |
| `currentLocale?` | `string \| (() => string) \| undefined` |
| `customActiveLinkStyle?` | `import("preact").CSSProperties \| undefined` |
| `customButtonStyle?` | `import("preact").CSSProperties \| undefined` |
| `customDisabledLinkStyle?` | `import("preact").CSSProperties \| undefined` |
| `customDropdownStyle?` | `import("preact").CSSProperties \| undefined` |
| `customIconStyle?` | `import("preact").CSSProperties \| undefined` |
| `customItemStyle?` | `import("preact").CSSProperties \| undefined` |
| `customLabels?` | `Record<string, string> \| undefined` |
| `customLinkStyle?` | `import("preact").CSSProperties \| undefined` |
| `customWrapperStyle?` | `import("preact").CSSProperties \| undefined` |
| `dangerouslySetInnerHTML?` | `{ __html: Parameters<DOMParser["parseFromString"]>[0]; } \| undefined` |
| `datatype?` | `Signalish<string \| undefined>` |
| `dir?` | `Signalish<"auto" \| "rtl" \| "ltr" \| undefined>` |
| `disablePictureInPicture?` | `Signalish<boolean \| undefined>` |
| `draggable?` | `Signalish<boolean \| undefined>` |
| `elementtiming?` | `Signalish<string \| undefined>` |
| `elementTiming?` | `Signalish<string \| undefined>` |
| `enterkeyhint?` | `Signalish<"enter" \| "done" \| "go" \| "next" \| "previous" \| "search" \| "send" \| undefined>` |
| `exportparts?` | `Signalish<string \| undefined>` |
| `getLocaleName?` | `(() => string \| null) \| undefined` |
| `hidden?` | `Signalish<boolean \| "hidden" \| "until-found" \| undefined>` |
| `id?` | `Signalish<string \| undefined>` |
| `inert?` | `Signalish<boolean \| undefined>` |
| `inlist?` | `any` |
| `inputmode?` | `Signalish<string \| undefined>` |
| `inputMode?` | `Signalish<string \| undefined>` |
| `is?` | `Signalish<string \| undefined>` |
| `itemid?` | `Signalish<string \| undefined>` |
| `itemID?` | `Signalish<string \| undefined>` |
| `itemprop?` | `Signalish<string \| undefined>` |
| `itemProp?` | `Signalish<string \| undefined>` |
| `itemref?` | `Signalish<string \| undefined>` |
| `itemRef?` | `Signalish<string \| undefined>` |
| `itemscope?` | `Signalish<boolean \| undefined>` |
| `itemScope?` | `Signalish<boolean \| undefined>` |
| `itemtype?` | `Signalish<string \| undefined>` |
| `itemType?` | `Signalish<string \| undefined>` |
| `jsx?` | `boolean \| undefined` |
| `key?` | `any` |
| `lang?` | `Signalish<string \| undefined>` |
| `localeRoute?` | `((to: RouteTarget, locale?: string) => RouteTarget) \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `nonce?` | `Signalish<string \| undefined>` |
| `onAbort?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onAbortCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onAnimationEnd?` | `AnimationEventHandler<HTMLDivElement> \| undefined` |
| `onAnimationEndCapture?` | `AnimationEventHandler<HTMLDivElement> \| undefined` |
| `onAnimationIteration?` | `AnimationEventHandler<HTMLDivElement> \| undefined` |
| `onAnimationIterationCapture?` | `AnimationEventHandler<HTMLDivElement> \| undefined` |
| `onAnimationStart?` | `AnimationEventHandler<HTMLDivElement> \| undefined` |
| `onAnimationStartCapture?` | `AnimationEventHandler<HTMLDivElement> \| undefined` |
| `onAuxClick?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onAuxClickCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onBeforeInput?` | `InputEventHandler<HTMLDivElement> \| undefined` |
| `onBeforeInputCapture?` | `InputEventHandler<HTMLDivElement> \| undefined` |
| `onBeforeToggle?` | `ToggleEventHandler<HTMLDivElement> \| undefined` |
| `onBlur?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onBlurCapture?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onCancel?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onCanPlay?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onCanPlayCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onCanPlayThrough?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onCanPlayThroughCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onChange?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onChangeCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onClick?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onClickCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onClose?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onCommand?` | `CommandEventHandler<HTMLDivElement> \| undefined` |
| `onCompositionEnd?` | `CompositionEventHandler<HTMLDivElement> \| undefined` |
| `onCompositionEndCapture?` | `CompositionEventHandler<HTMLDivElement> \| undefined` |
| `onCompositionStart?` | `CompositionEventHandler<HTMLDivElement> \| undefined` |
| `onCompositionStartCapture?` | `CompositionEventHandler<HTMLDivElement> \| undefined` |
| `onCompositionUpdate?` | `CompositionEventHandler<HTMLDivElement> \| undefined` |
| `onCompositionUpdateCapture?` | `CompositionEventHandler<HTMLDivElement> \| undefined` |
| `onContextMenu?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onContextMenuCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onCopy?` | `ClipboardEventHandler<HTMLDivElement> \| undefined` |
| `onCopyCapture?` | `ClipboardEventHandler<HTMLDivElement> \| undefined` |
| `onCut?` | `ClipboardEventHandler<HTMLDivElement> \| undefined` |
| `onCutCapture?` | `ClipboardEventHandler<HTMLDivElement> \| undefined` |
| `onDblClick?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onDblClickCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onDrag?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragCapture?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragEnd?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragEndCapture?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragEnter?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragEnterCapture?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragExit?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragExitCapture?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragLeave?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragLeaveCapture?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragOver?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragOverCapture?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragStart?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDragStartCapture?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDrop?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDropCapture?` | `DragEventHandler<HTMLDivElement> \| undefined` |
| `onDurationChange?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onDurationChangeCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onEmptied?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onEmptiedCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onEncrypted?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onEncryptedCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onEnded?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onEndedCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onEnterPictureInPicture?` | `PictureInPictureEventHandler<HTMLDivElement> \| undefined` |
| `onEnterPictureInPictureCapture?` | `PictureInPictureEventHandler<HTMLDivElement> \| undefined` |
| `onError?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onErrorCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onFocus?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onFocusCapture?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onFocusIn?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onFocusInCapture?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onFocusOut?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onFocusOutCapture?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onFormData?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onFormDataCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onGotPointerCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onGotPointerCaptureCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onInput?` | `InputEventHandler<HTMLDivElement> \| undefined` |
| `onInputCapture?` | `InputEventHandler<HTMLDivElement> \| undefined` |
| `onInvalid?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onInvalidCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onKeyDown?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyDownCapture?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyPress?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyPressCapture?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyUp?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyUpCapture?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onLeavePictureInPicture?` | `PictureInPictureEventHandler<HTMLDivElement> \| undefined` |
| `onLeavePictureInPictureCapture?` | `PictureInPictureEventHandler<HTMLDivElement> \| undefined` |
| `onLoad?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onLoadCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onLoadedData?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onLoadedDataCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onLoadedMetadata?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onLoadedMetadataCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onLoadStart?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onLoadStartCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onLostPointerCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onLostPointerCaptureCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onMouseDown?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseDownCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseEnter?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseEnterCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseLeave?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseLeaveCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseMove?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseMoveCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseOut?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseOutCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseOver?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseOverCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseUp?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseUpCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onPaste?` | `ClipboardEventHandler<HTMLDivElement> \| undefined` |
| `onPasteCapture?` | `ClipboardEventHandler<HTMLDivElement> \| undefined` |
| `onPause?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onPauseCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onPlay?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onPlayCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onPlaying?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onPlayingCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onPointerCancel?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerCancelCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerDown?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerDownCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerEnter?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerEnterCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerLeave?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerLeaveCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerMove?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerMoveCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerOut?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerOutCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerOver?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerOverCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerUp?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerUpCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onProgress?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onProgressCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onRateChange?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onRateChangeCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onReset?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onResetCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onResize?` | `PictureInPictureEventHandler<HTMLDivElement> \| undefined` |
| `onResizeCapture?` | `PictureInPictureEventHandler<HTMLDivElement> \| undefined` |
| `onScroll?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onScrollCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onScrollEnd?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onScrollEndCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onScrollSnapChange?` | `SnapEventHandler<HTMLDivElement> \| undefined` |
| `onScrollSnapChangeCapture?` | `SnapEventHandler<HTMLDivElement> \| undefined` |
| `onScrollSnapChanging?` | `SnapEventHandler<HTMLDivElement> \| undefined` |
| `onScrollSnapChangingCapture?` | `SnapEventHandler<HTMLDivElement> \| undefined` |
| `onSearch?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onSearchCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onSeeked?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onSeekedCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onSeeking?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onSeekingCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onSelect?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onSelectCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onStalled?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onStalledCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onSubmit?` | `SubmitEventHandler<HTMLDivElement> \| undefined` |
| `onSubmitCapture?` | `SubmitEventHandler<HTMLDivElement> \| undefined` |
| `onSuspend?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onSuspendCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onTimeUpdate?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onTimeUpdateCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onToggle?` | `ToggleEventHandler<HTMLDivElement> \| undefined` |
| `onTouchCancel?` | `TouchEventHandler<HTMLDivElement> \| undefined` |
| `onTouchCancelCapture?` | `TouchEventHandler<HTMLDivElement> \| undefined` |
| `onTouchEnd?` | `TouchEventHandler<HTMLDivElement> \| undefined` |
| `onTouchEndCapture?` | `TouchEventHandler<HTMLDivElement> \| undefined` |
| `onTouchMove?` | `TouchEventHandler<HTMLDivElement> \| undefined` |
| `onTouchMoveCapture?` | `TouchEventHandler<HTMLDivElement> \| undefined` |
| `onTouchStart?` | `TouchEventHandler<HTMLDivElement> \| undefined` |
| `onTouchStartCapture?` | `TouchEventHandler<HTMLDivElement> \| undefined` |
| `onTransitionCancel?` | `TransitionEventHandler<HTMLDivElement> \| undefined` |
| `onTransitionCancelCapture?` | `TransitionEventHandler<HTMLDivElement> \| undefined` |
| `onTransitionEnd?` | `TransitionEventHandler<HTMLDivElement> \| undefined` |
| `onTransitionEndCapture?` | `TransitionEventHandler<HTMLDivElement> \| undefined` |
| `onTransitionRun?` | `TransitionEventHandler<HTMLDivElement> \| undefined` |
| `onTransitionRunCapture?` | `TransitionEventHandler<HTMLDivElement> \| undefined` |
| `onTransitionStart?` | `TransitionEventHandler<HTMLDivElement> \| undefined` |
| `onTransitionStartCapture?` | `TransitionEventHandler<HTMLDivElement> \| undefined` |
| `onVolumeChange?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onVolumeChangeCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onWaiting?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onWaitingCapture?` | `GenericEventHandler<HTMLDivElement> \| undefined` |
| `onWheel?` | `WheelEventHandler<HTMLDivElement> \| undefined` |
| `onWheelCapture?` | `WheelEventHandler<HTMLDivElement> \| undefined` |
| `part?` | `Signalish<string \| undefined>` |
| `popover?` | `Signalish<boolean \| "auto" \| "hint" \| "manual" \| undefined>` |
| `prefix?` | `Signalish<string \| undefined>` |
| `property?` | `Signalish<string \| undefined>` |
| `ref?` | `Ref<HTMLDivElement> \| undefined` |
| `resource?` | `Signalish<string \| undefined>` |
| `results?` | `Signalish<number \| undefined>` |
| `role?` | `Signalish<AriaRole \| undefined>` |
| `slot?` | `Signalish<string \| undefined>` |
| `spellcheck?` | `Signalish<boolean \| undefined>` |
| `style?` | `Signalish<string \| CSSProperties \| undefined>` |
| `switchLocale?` | `((locale: string) => void) \| undefined` |
| `tabindex?` | `Signalish<number \| undefined>` |
| `tabIndex?` | `Signalish<number \| undefined>` |
| `title?` | `Signalish<string \| undefined>` |
| `translate?` | `Signalish<boolean \| undefined>` |
| `typeof?` | `Signalish<string \| undefined>` |
| `vocab?` | `Signalish<string \| undefined>` |

</details>

<details>
<summary><code>I18nTProps</code> — 319 members</summary>

| Member | Type |
| --- | --- |
| `about?` | `Signalish<string \| undefined>` |
| `accesskey?` | `Signalish<string \| undefined>` |
| `accessKey?` | `Signalish<string \| undefined>` |
| `aria-activedescendant?` | `Signalish<string \| undefined>` |
| `aria-atomic?` | `Signalish<Booleanish \| undefined>` |
| `aria-autocomplete?` | `Signalish<"none" \| "list" \| "inline" \| "both" \| undefined>` |
| `aria-braillelabel?` | `Signalish<string \| undefined>` |
| `aria-brailleroledescription?` | `Signalish<string \| undefined>` |
| `aria-busy?` | `Signalish<Booleanish \| undefined>` |
| `aria-checked?` | `Signalish<Booleanish \| "mixed" \| undefined>` |
| `aria-colcount?` | `Signalish<number \| undefined>` |
| `aria-colindex?` | `Signalish<number \| undefined>` |
| `aria-colindextext?` | `Signalish<string \| undefined>` |
| `aria-colspan?` | `Signalish<number \| undefined>` |
| `aria-controls?` | `Signalish<string \| undefined>` |
| `aria-current?` | `Signalish<Booleanish \| "time" \| "location" \| "page" \| "step" \| "date" \| undefined>` |
| `aria-describedby?` | `Signalish<string \| undefined>` |
| `aria-description?` | `Signalish<string \| undefined>` |
| `aria-details?` | `Signalish<string \| undefined>` |
| `aria-disabled?` | `Signalish<Booleanish \| undefined>` |
| `aria-dropeffect?` | `Signalish<"none" \| "link" \| "copy" \| "execute" \| "move" \| "popup" \| undefined>` |
| `aria-errormessage?` | `Signalish<string \| undefined>` |
| `aria-expanded?` | `Signalish<Booleanish \| undefined>` |
| `aria-flowto?` | `Signalish<string \| undefined>` |
| `aria-grabbed?` | `Signalish<Booleanish \| undefined>` |
| `aria-haspopup?` | `Signalish<Booleanish \| "dialog" \| "grid" \| "listbox" \| "menu" \| "tree" \| undefined>` |
| `aria-hidden?` | `Signalish<Booleanish \| undefined>` |
| `aria-invalid?` | `Signalish<Booleanish \| "grammar" \| "spelling" \| undefined>` |
| `aria-keyshortcuts?` | `Signalish<string \| undefined>` |
| `aria-label?` | `Signalish<string \| undefined>` |
| `aria-labelledby?` | `Signalish<string \| undefined>` |
| `aria-level?` | `Signalish<number \| undefined>` |
| `aria-live?` | `Signalish<"off" \| "assertive" \| "polite" \| undefined>` |
| `aria-modal?` | `Signalish<Booleanish \| undefined>` |
| `aria-multiline?` | `Signalish<Booleanish \| undefined>` |
| `aria-multiselectable?` | `Signalish<Booleanish \| undefined>` |
| `aria-orientation?` | `Signalish<"horizontal" \| "vertical" \| undefined>` |
| `aria-owns?` | `Signalish<string \| undefined>` |
| `aria-placeholder?` | `Signalish<string \| undefined>` |
| `aria-posinset?` | `Signalish<number \| undefined>` |
| `aria-pressed?` | `Signalish<Booleanish \| "mixed" \| undefined>` |
| `aria-readonly?` | `Signalish<Booleanish \| undefined>` |
| `aria-relevant?` | `Signalish<"additions" \| "additions removals" \| "additions text" \| "all" \| "removals" \| "removals additions" \| "removals text" \| "text" \| "text additions" \| "text removals" \| undefined>` |
| `aria-required?` | `Signalish<Booleanish \| undefined>` |
| `aria-roledescription?` | `Signalish<string \| undefined>` |
| `aria-rowcount?` | `Signalish<number \| undefined>` |
| `aria-rowindex?` | `Signalish<number \| undefined>` |
| `aria-rowindextext?` | `Signalish<string \| undefined>` |
| `aria-rowspan?` | `Signalish<number \| undefined>` |
| `aria-selected?` | `Signalish<Booleanish \| undefined>` |
| `aria-setsize?` | `Signalish<number \| undefined>` |
| `aria-sort?` | `Signalish<"none" \| "ascending" \| "descending" \| "other" \| undefined>` |
| `aria-valuemax?` | `Signalish<number \| undefined>` |
| `aria-valuemin?` | `Signalish<number \| undefined>` |
| `aria-valuenow?` | `Signalish<number \| undefined>` |
| `aria-valuetext?` | `Signalish<string \| undefined>` |
| `autocapitalize?` | `Signalish<"off" \| "none" \| "on" \| "sentences" \| "words" \| "characters" \| undefined>` |
| `autoCapitalize?` | `Signalish<"off" \| "none" \| "on" \| "sentences" \| "words" \| "characters" \| undefined>` |
| `autocorrect?` | `Signalish<string \| undefined>` |
| `autoCorrect?` | `Signalish<string \| undefined>` |
| `autofocus?` | `Signalish<boolean \| undefined>` |
| `autoFocus?` | `Signalish<boolean \| undefined>` |
| `children?` | `import("preact").ComponentChildren \| ((props: { translation: string; }) => HostNode)` |
| `class?` | `Signalish<string \| undefined>` |
| `className?` | `Signalish<string \| undefined>` |
| `components?` | `Record<string, I18nTComponent> \| undefined` |
| `contenteditable?` | `Signalish<"" \| Booleanish \| "plaintext-only" \| "inherit" \| undefined>` |
| `contentEditable?` | `Signalish<"" \| Booleanish \| "plaintext-only" \| "inherit" \| undefined>` |
| `customPluralRule?` | `PluralFunc \| null \| undefined` |
| `dangerouslySetInnerHTML?` | `{ __html: Parameters<DOMParser["parseFromString"]>[0]; } \| undefined` |
| `datatype?` | `Signalish<string \| undefined>` |
| `date?` | `string \| number \| Date \| null \| undefined` |
| `defaultValue?` | `string \| undefined` |
| `dir?` | `Signalish<"auto" \| "rtl" \| "ltr" \| undefined>` |
| `disablePictureInPicture?` | `Signalish<boolean \| undefined>` |
| `draggable?` | `Signalish<boolean \| undefined>` |
| `elementtiming?` | `Signalish<string \| undefined>` |
| `elementTiming?` | `Signalish<string \| undefined>` |
| `enterkeyhint?` | `Signalish<"enter" \| "done" \| "go" \| "next" \| "previous" \| "search" \| "send" \| undefined>` |
| `exportparts?` | `Signalish<string \| undefined>` |
| `hidden?` | `Signalish<boolean \| "hidden" \| "until-found" \| undefined>` |
| `hideIfEmpty?` | `boolean \| undefined` |
| `html?` | `boolean \| undefined` |
| `id?` | `Signalish<string \| undefined>` |
| `inert?` | `Signalish<boolean \| undefined>` |
| `inlist?` | `any` |
| `inputmode?` | `Signalish<string \| undefined>` |
| `inputMode?` | `Signalish<string \| undefined>` |
| `is?` | `Signalish<string \| undefined>` |
| `itemid?` | `Signalish<string \| undefined>` |
| `itemID?` | `Signalish<string \| undefined>` |
| `itemprop?` | `Signalish<string \| undefined>` |
| `itemProp?` | `Signalish<string \| undefined>` |
| `itemref?` | `Signalish<string \| undefined>` |
| `itemRef?` | `Signalish<string \| undefined>` |
| `itemscope?` | `Signalish<boolean \| undefined>` |
| `itemScope?` | `Signalish<boolean \| undefined>` |
| `itemtype?` | `Signalish<string \| undefined>` |
| `itemType?` | `Signalish<string \| undefined>` |
| `jsx?` | `boolean \| undefined` |
| `key?` | `any` |
| `keypath` | `string` |
| `lang?` | `Signalish<string \| undefined>` |
| `nonce?` | `Signalish<string \| undefined>` |
| `number?` | `string \| number \| null \| undefined` |
| `onAbort?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onAbortCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onAnimationEnd?` | `AnimationEventHandler<HTMLElement> \| undefined` |
| `onAnimationEndCapture?` | `AnimationEventHandler<HTMLElement> \| undefined` |
| `onAnimationIteration?` | `AnimationEventHandler<HTMLElement> \| undefined` |
| `onAnimationIterationCapture?` | `AnimationEventHandler<HTMLElement> \| undefined` |
| `onAnimationStart?` | `AnimationEventHandler<HTMLElement> \| undefined` |
| `onAnimationStartCapture?` | `AnimationEventHandler<HTMLElement> \| undefined` |
| `onAuxClick?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onAuxClickCapture?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onBeforeInput?` | `InputEventHandler<HTMLElement> \| undefined` |
| `onBeforeInputCapture?` | `InputEventHandler<HTMLElement> \| undefined` |
| `onBeforeToggle?` | `ToggleEventHandler<HTMLElement> \| undefined` |
| `onBlur?` | `FocusEventHandler<HTMLElement> \| undefined` |
| `onBlurCapture?` | `FocusEventHandler<HTMLElement> \| undefined` |
| `onCancel?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onCanPlay?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onCanPlayCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onCanPlayThrough?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onCanPlayThroughCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onChange?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onChangeCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onClick?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onClickCapture?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onClose?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onCommand?` | `CommandEventHandler<HTMLElement> \| undefined` |
| `onCompositionEnd?` | `CompositionEventHandler<HTMLElement> \| undefined` |
| `onCompositionEndCapture?` | `CompositionEventHandler<HTMLElement> \| undefined` |
| `onCompositionStart?` | `CompositionEventHandler<HTMLElement> \| undefined` |
| `onCompositionStartCapture?` | `CompositionEventHandler<HTMLElement> \| undefined` |
| `onCompositionUpdate?` | `CompositionEventHandler<HTMLElement> \| undefined` |
| `onCompositionUpdateCapture?` | `CompositionEventHandler<HTMLElement> \| undefined` |
| `onContextMenu?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onContextMenuCapture?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onCopy?` | `ClipboardEventHandler<HTMLElement> \| undefined` |
| `onCopyCapture?` | `ClipboardEventHandler<HTMLElement> \| undefined` |
| `onCut?` | `ClipboardEventHandler<HTMLElement> \| undefined` |
| `onCutCapture?` | `ClipboardEventHandler<HTMLElement> \| undefined` |
| `onDblClick?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onDblClickCapture?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onDrag?` | `DragEventHandler<HTMLElement> \| undefined` |
| `onDragCapture?` | `DragEventHandler<HTMLElement> \| undefined` |
| `onDragEnd?` | `DragEventHandler<HTMLElement> \| undefined` |
| `onDragEndCapture?` | `DragEventHandler<HTMLElement> \| undefined` |
| `onDragEnter?` | `DragEventHandler<HTMLElement> \| undefined` |
| `onDragEnterCapture?` | `DragEventHandler<HTMLElement> \| undefined` |
| `onDragExit?` | `DragEventHandler<HTMLElement> \| undefined` |
| `onDragExitCapture?` | `DragEventHandler<HTMLElement> \| undefined` |
| `onDragLeave?` | `DragEventHandler<HTMLElement> \| undefined` |
| `onDragLeaveCapture?` | `DragEventHandler<HTMLElement> \| undefined` |
| `onDragOver?` | `DragEventHandler<HTMLElement> \| undefined` |
| `onDragOverCapture?` | `DragEventHandler<HTMLElement> \| undefined` |
| `onDragStart?` | `DragEventHandler<HTMLElement> \| undefined` |
| `onDragStartCapture?` | `DragEventHandler<HTMLElement> \| undefined` |
| `onDrop?` | `DragEventHandler<HTMLElement> \| undefined` |
| `onDropCapture?` | `DragEventHandler<HTMLElement> \| undefined` |
| `onDurationChange?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onDurationChangeCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onEmptied?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onEmptiedCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onEncrypted?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onEncryptedCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onEnded?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onEndedCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onEnterPictureInPicture?` | `PictureInPictureEventHandler<HTMLElement> \| undefined` |
| `onEnterPictureInPictureCapture?` | `PictureInPictureEventHandler<HTMLElement> \| undefined` |
| `onError?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onErrorCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onFocus?` | `FocusEventHandler<HTMLElement> \| undefined` |
| `onFocusCapture?` | `FocusEventHandler<HTMLElement> \| undefined` |
| `onFocusIn?` | `FocusEventHandler<HTMLElement> \| undefined` |
| `onFocusInCapture?` | `FocusEventHandler<HTMLElement> \| undefined` |
| `onFocusOut?` | `FocusEventHandler<HTMLElement> \| undefined` |
| `onFocusOutCapture?` | `FocusEventHandler<HTMLElement> \| undefined` |
| `onFormData?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onFormDataCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onGotPointerCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onGotPointerCaptureCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onInput?` | `InputEventHandler<HTMLElement> \| undefined` |
| `onInputCapture?` | `InputEventHandler<HTMLElement> \| undefined` |
| `onInvalid?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onInvalidCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onKeyDown?` | `KeyboardEventHandler<HTMLElement> \| undefined` |
| `onKeyDownCapture?` | `KeyboardEventHandler<HTMLElement> \| undefined` |
| `onKeyPress?` | `KeyboardEventHandler<HTMLElement> \| undefined` |
| `onKeyPressCapture?` | `KeyboardEventHandler<HTMLElement> \| undefined` |
| `onKeyUp?` | `KeyboardEventHandler<HTMLElement> \| undefined` |
| `onKeyUpCapture?` | `KeyboardEventHandler<HTMLElement> \| undefined` |
| `onLeavePictureInPicture?` | `PictureInPictureEventHandler<HTMLElement> \| undefined` |
| `onLeavePictureInPictureCapture?` | `PictureInPictureEventHandler<HTMLElement> \| undefined` |
| `onLoad?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onLoadCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onLoadedData?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onLoadedDataCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onLoadedMetadata?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onLoadedMetadataCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onLoadStart?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onLoadStartCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onLostPointerCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onLostPointerCaptureCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onMouseDown?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onMouseDownCapture?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onMouseEnter?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onMouseEnterCapture?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onMouseLeave?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onMouseLeaveCapture?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onMouseMove?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onMouseMoveCapture?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onMouseOut?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onMouseOutCapture?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onMouseOver?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onMouseOverCapture?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onMouseUp?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onMouseUpCapture?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onPaste?` | `ClipboardEventHandler<HTMLElement> \| undefined` |
| `onPasteCapture?` | `ClipboardEventHandler<HTMLElement> \| undefined` |
| `onPause?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onPauseCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onPlay?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onPlayCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onPlaying?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onPlayingCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onPointerCancel?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerCancelCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerDown?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerDownCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerEnter?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerEnterCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerLeave?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerLeaveCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerMove?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerMoveCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerOut?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerOutCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerOver?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerOverCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerUp?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerUpCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onProgress?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onProgressCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onRateChange?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onRateChangeCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onReset?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onResetCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onResize?` | `PictureInPictureEventHandler<HTMLElement> \| undefined` |
| `onResizeCapture?` | `PictureInPictureEventHandler<HTMLElement> \| undefined` |
| `onScroll?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onScrollCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onScrollEnd?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onScrollEndCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onScrollSnapChange?` | `SnapEventHandler<HTMLElement> \| undefined` |
| `onScrollSnapChangeCapture?` | `SnapEventHandler<HTMLElement> \| undefined` |
| `onScrollSnapChanging?` | `SnapEventHandler<HTMLElement> \| undefined` |
| `onScrollSnapChangingCapture?` | `SnapEventHandler<HTMLElement> \| undefined` |
| `onSearch?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onSearchCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onSeeked?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onSeekedCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onSeeking?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onSeekingCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onSelect?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onSelectCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onStalled?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onStalledCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onSubmit?` | `SubmitEventHandler<HTMLElement> \| undefined` |
| `onSubmitCapture?` | `SubmitEventHandler<HTMLElement> \| undefined` |
| `onSuspend?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onSuspendCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onTimeUpdate?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onTimeUpdateCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onToggle?` | `ToggleEventHandler<HTMLElement> \| undefined` |
| `onTouchCancel?` | `TouchEventHandler<HTMLElement> \| undefined` |
| `onTouchCancelCapture?` | `TouchEventHandler<HTMLElement> \| undefined` |
| `onTouchEnd?` | `TouchEventHandler<HTMLElement> \| undefined` |
| `onTouchEndCapture?` | `TouchEventHandler<HTMLElement> \| undefined` |
| `onTouchMove?` | `TouchEventHandler<HTMLElement> \| undefined` |
| `onTouchMoveCapture?` | `TouchEventHandler<HTMLElement> \| undefined` |
| `onTouchStart?` | `TouchEventHandler<HTMLElement> \| undefined` |
| `onTouchStartCapture?` | `TouchEventHandler<HTMLElement> \| undefined` |
| `onTransitionCancel?` | `TransitionEventHandler<HTMLElement> \| undefined` |
| `onTransitionCancelCapture?` | `TransitionEventHandler<HTMLElement> \| undefined` |
| `onTransitionEnd?` | `TransitionEventHandler<HTMLElement> \| undefined` |
| `onTransitionEndCapture?` | `TransitionEventHandler<HTMLElement> \| undefined` |
| `onTransitionRun?` | `TransitionEventHandler<HTMLElement> \| undefined` |
| `onTransitionRunCapture?` | `TransitionEventHandler<HTMLElement> \| undefined` |
| `onTransitionStart?` | `TransitionEventHandler<HTMLElement> \| undefined` |
| `onTransitionStartCapture?` | `TransitionEventHandler<HTMLElement> \| undefined` |
| `onVolumeChange?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onVolumeChangeCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onWaiting?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onWaitingCapture?` | `GenericEventHandler<HTMLElement> \| undefined` |
| `onWheel?` | `WheelEventHandler<HTMLElement> \| undefined` |
| `onWheelCapture?` | `WheelEventHandler<HTMLElement> \| undefined` |
| `params?` | `Params \| undefined` |
| `part?` | `Signalish<string \| undefined>` |
| `plural?` | `string \| number \| null \| undefined` |
| `popover?` | `Signalish<boolean \| "auto" \| "hint" \| "manual" \| undefined>` |
| `prefix?` | `Signalish<string \| undefined>` |
| `property?` | `Signalish<string \| undefined>` |
| `ref?` | `Ref<HTMLElement> \| undefined` |
| `relativeDate?` | `string \| number \| Date \| null \| undefined` |
| `resource?` | `Signalish<string \| undefined>` |
| `results?` | `Signalish<number \| undefined>` |
| `role?` | `Signalish<AriaRole \| undefined>` |
| `slot?` | `Signalish<string \| undefined>` |
| `spellcheck?` | `Signalish<boolean \| undefined>` |
| `style?` | `Signalish<string \| CSSProperties \| undefined>` |
| `tabindex?` | `Signalish<number \| undefined>` |
| `tabIndex?` | `Signalish<number \| undefined>` |
| `tag?` | `keyof import("preact").JSX.IntrinsicElements \| undefined` |
| `title?` | `Signalish<string \| undefined>` |
| `translate?` | `Signalish<boolean \| undefined>` |
| `typeof?` | `Signalish<string \| undefined>` |
| `vocab?` | `Signalish<string \| undefined>` |

</details>

<details>
<summary><code>Locale</code> — 11 members</summary>

| Member | Type |
| --- | --- |
| `[string]` | `unknown` |
| `baseDefault?` | `boolean \| undefined` |
| `baseUrl?` | `string \| undefined` |
| `code` | `string` |
| `dir?` | `"auto" \| "rtl" \| "ltr" \| undefined` |
| `disabled?` | `boolean \| undefined` |
| `displayName?` | `string \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `iso?` | `string \| undefined` |
| `og?` | `string \| undefined` |
| `seo?` | `boolean \| undefined` |

</details>

<code>ModuleOptions</code> — 51 members, identical to [`ModuleOptions`](/api/packages/types).

<details>
<summary><code>PreactI18n</code> — 61 members</summary>

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
| `extend` | `<M extends Record<string, unknown>>(methods: M & ThisType<import("@i18n-micro/runtime").I18n & M>) => import("@i18n-micro/runtime").I18n & M` |
| `fallbackKey` | `private any` |
| `fallbackLocale` | `string` |
| `fallbackRootKey` | `private any` |
| `fork` | `(locale?: string) => I18n` |
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
| `localeIso` | `protected Record<string, string>` |
| `lookupLocale` | `private any` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn` | `boolean` |
| `new` | `(options: I18nOptions): I18n` |
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

<details>
<summary><code>PreactI18nOptions</code> — 13 members</summary>

| Member | Type |
| --- | --- |
| `datetimeFormats?` | `DateTimeFormatsConfig \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `locale` | `string` |
| `localeIso?` | `Record<string, string> \| undefined` |
| `messages?` | `Record<string, Translations> \| undefined` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `now?` | `(() => number) \| undefined` |
| `numberFormats?` | `NumberFormatsConfig \| undefined` |
| `parent?` | `I18n \| undefined` |
| `plural?` | `PluralFunc \| undefined` |
| `routeMessages?` | `Record<string, Record<string, Translations>> \| undefined` |
| `timeZone?` | `string \| undefined` |

</details>

<code>Translations</code> — 1 members, identical to [`Translations`](/api/packages/types).

<details>
<summary><code>UseI18nOptions</code> — 2 members</summary>

| Member | Type |
| --- | --- |
| `defaultLocale?` | `string \| undefined` |
| `locales?` | `Locale[] \| undefined` |

</details>

<details>
<summary><code>UseI18nReturn</code> — 22 members</summary>

| Member | Type |
| --- | --- |
| `addRouteTranslations` | `(locale: string, routeName: string, translations: Translations, merge?: boolean) => void` |
| `addTranslations` | `(locale: string, translations: Translations, merge?: boolean) => void` |
| `clearCache` | `() => void` |
| `currentRoute` | `string` |
| `defaultLocale` | `() => string` |
| `fallbackLocale` | `string` |
| `getLocaleName` | `() => string \| null` |
| `getLocales` | `() => Locale[]` |
| `getRoute` | `() => string` |
| `has` | `(key: TranslationKey, routeName?: string) => boolean` |
| `locale` | `string` |
| `localePath` | `(to: RouteTarget, locale?: string) => string` |
| `localeRoute` | `(to: RouteTarget, locale?: string) => RouteTarget` |
| `setLocale` | `(locale: string) => void` |
| `setRoute` | `(routeName: string) => void` |
| `switchLocale` | `(locale: string) => void` |
| `t` | `(key: TranslationKey, params?: Params, defaultValue?: string \| null, routeName?: string) => CleanTranslation` |
| `tc` | `(key: TranslationKey, count: number \| Params, defaultValue?: string) => string` |
| `td` | `(value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string` |
| `tdr` | `(value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string` |
| `tn` | `(value: number, options?: Intl.NumberFormatOptions) => string` |
| `ts` | `(key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string` |

</details>
## `@i18n-micro/preact/router`

```ts
import { /* … */ } from '@i18n-micro/preact/router'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `createBrowserHistoryAdapter` | function | `(locales: Locale[], defaultLocale: string) => I18nRoutingStrategy` |
| `I18nRoutingStrategy` | interface | 6 members |

<code>I18nRoutingStrategy</code> — 6 members, identical to `I18nRoutingStrategy` above.

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
