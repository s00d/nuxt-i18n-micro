---
url: 'https://s00d.github.io/nuxt-i18n-micro/api/packages/preact.md'
description: 'Exported API of @i18n-micro/preact, generated from the source.'
---

# `@i18n-micro/preact`

39 exports across 1 entry point.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/preact`

```ts
import { /* … */ } from '@i18n-micro/preact'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `CleanTranslation` | type | `string \| number \| boolean \| Translations \| PluralTranslations \| null` |
| `createBrowserHistoryAdapter` | function | `(locales: Locale[], defaultLocale: string) => I18nRoutingStrategy` |
| `createI18n` | function | `(options: PreactI18nOptions) => PreactI18n` |
| `createPreactRouterAdapter` | const | `(locales: Locale[], defaultLocale: string) => I18nRoutingStrategy` |
| `defaultPlural` | const | `PluralFunc` |
| `FormatService` | class | 19 members |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `I18nContext` | const | `import("preact/src/index").Context<PreactI18n \| null>` |
| `I18nDefaultLocaleContext` | const | `import("preact/src/index").Context<string \| null>` |
| `I18nGroup` | const | `(props: I18nGroupProps) => JSX.Element` |
| `I18nGroupProps` | interface | 301 members |
| `I18nLink` | const | `(props: I18nLinkProps) => JSX.Element` |
| `I18nLinkProps` | interface | 314 members |
| `I18nLocalesContext` | const | `import("preact/src/index").Context<Locale[] \| null>` |
| `I18nProvider` | function | `({ i18n, locales, defaultLocale, routingStrategy, children }: I18nProviderProps) => import("preact/src/index").VNode<import("preact/src/index").Attributes & { value: PreactI18n \| null; children?: ComponentChildren; }>` |
| `I18nProviderProps` | interface | 5 members |
| `I18nRouterContext` | const | `import("preact/src/index").Context<I18nRoutingStrategy \| null>` |
| `I18nRoutingStrategy` | interface | 6 members |
| `I18nSwitcher` | const | `(props: I18nSwitcherProps) => JSX.Element` |
| `I18nSwitcherProps` | interface | 314 members |
| `I18nT` | const | `(props: I18nTProps) => JSX.Element \| null` |
| `I18nTProps` | interface | 311 members |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `Locale` | interface | 11 members |
| `LocaleCode` | type | `string` |
| `ModuleOptions` | interface | 47 members |
| `Params` | type | `Record<string, string \| number \| boolean>` |
| `PluralFunc` | type | `(key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string \| null` |
| `PreactI18n` | class | 44 members |
| `PreactI18nOptions` | interface | 6 members |
| `TranslationKey` | type | `keyof DefineLocaleMessage extends never ? string : keyof DefineLocaleMessage \| string` |
| `Translations` | interface | 1 members |
| `useI18n` | const | `(options?: UseI18nOptions) => UseI18nReturn` |
| `useI18nContext` | const | `() => PreactI18n` |
| `useI18nDefaultLocale` | const | `() => string \| null` |
| `useI18nLocales` | const | `() => Locale[] \| null` |
| `UseI18nOptions` | interface | 2 members |
| `UseI18nReturn` | interface | 22 members |
| `useI18nRouter` | const | `() => I18nRoutingStrategy \| null` |

FormatService — 19 members, identical to [`FormatService`](/api/packages/astro).

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
| `children?` | `((props: { prefix: string; t: (key: string, params?: Record<string, string \| number \| boolean>) => string; }) => ComponentChildren) \| undefined` |
| `class?` | `Signalish<string \| undefined>` |
| `className?` | `Signalish<string \| undefined>` |
| `contenteditable?` | `Signalish<"" \| Booleanish \| "plaintext-only" \| "inherit" \| undefined>` |
| `contentEditable?` | `Signalish<"" \| Booleanish \| "plaintext-only" \| "inherit" \| undefined>` |
| `dangerouslySetInnerHTML?` | `{ __html: string; } \| undefined` |
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
| `onScroll?` | `UIEventHandler<HTMLDivElement> \| undefined` |
| `onScrollCapture?` | `UIEventHandler<HTMLDivElement> \| undefined` |
| `onScrollEnd?` | `UIEventHandler<HTMLDivElement> \| undefined` |
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

| Member | Type |
| --- | --- |
| `about?` | `Signalish<string \| undefined>` |
| `accesskey?` | `Signalish<string \| undefined>` |
| `accessKey?` | `Signalish<string \| undefined>` |
| `activeStyle?` | `Record<string, string \| number> \| undefined` |
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
| `dangerouslySetInnerHTML?` | `{ __html: string; } \| undefined` |
| `datatype?` | `Signalish<string \| undefined>` |
| `dir?` | `Signalish<"auto" \| "rtl" \| "ltr" \| undefined>` |
| `disablePictureInPicture?` | `Signalish<boolean \| undefined>` |
| `download?` | `any` |
| `draggable?` | `Signalish<boolean \| undefined>` |
| `elementtiming?` | `Signalish<string \| undefined>` |
| `elementTiming?` | `Signalish<string \| undefined>` |
| `enterkeyhint?` | `Signalish<"enter" \| "done" \| "go" \| "next" \| "previous" \| "search" \| "send" \| undefined>` |
| `exportparts?` | `Signalish<string \| undefined>` |
| `hidden?` | `Signalish<boolean \| "hidden" \| "until-found" \| undefined>` |
| `href?` | `Signalish<string \| undefined>` |
| `hreflang?` | `Signalish<string \| undefined>` |
| `hrefLang?` | `Signalish<string \| undefined>` |
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
| `localeRoute?` | `((to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }) \| undefined` |
| `media?` | `Signalish<string \| undefined>` |
| `nonce?` | `Signalish<string \| undefined>` |
| `onAbort?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onAbortCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onAnimationEnd?` | `AnimationEventHandler<HTMLAnchorElement> \| undefined` |
| `onAnimationEndCapture?` | `AnimationEventHandler<HTMLAnchorElement> \| undefined` |
| `onAnimationIteration?` | `AnimationEventHandler<HTMLAnchorElement> \| undefined` |
| `onAnimationIterationCapture?` | `AnimationEventHandler<HTMLAnchorElement> \| undefined` |
| `onAnimationStart?` | `AnimationEventHandler<HTMLAnchorElement> \| undefined` |
| `onAnimationStartCapture?` | `AnimationEventHandler<HTMLAnchorElement> \| undefined` |
| `onAuxClick?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onAuxClickCapture?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onBeforeInput?` | `InputEventHandler<HTMLAnchorElement> \| undefined` |
| `onBeforeInputCapture?` | `InputEventHandler<HTMLAnchorElement> \| undefined` |
| `onBlur?` | `FocusEventHandler<HTMLAnchorElement> \| undefined` |
| `onBlurCapture?` | `FocusEventHandler<HTMLAnchorElement> \| undefined` |
| `onCancel?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onCanPlay?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onCanPlayCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onCanPlayThrough?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onCanPlayThroughCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onChange?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onChangeCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onClick?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onClickCapture?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onClose?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onCompositionEnd?` | `CompositionEventHandler<HTMLAnchorElement> \| undefined` |
| `onCompositionEndCapture?` | `CompositionEventHandler<HTMLAnchorElement> \| undefined` |
| `onCompositionStart?` | `CompositionEventHandler<HTMLAnchorElement> \| undefined` |
| `onCompositionStartCapture?` | `CompositionEventHandler<HTMLAnchorElement> \| undefined` |
| `onCompositionUpdate?` | `CompositionEventHandler<HTMLAnchorElement> \| undefined` |
| `onCompositionUpdateCapture?` | `CompositionEventHandler<HTMLAnchorElement> \| undefined` |
| `onContextMenu?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onContextMenuCapture?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onCopy?` | `ClipboardEventHandler<HTMLAnchorElement> \| undefined` |
| `onCopyCapture?` | `ClipboardEventHandler<HTMLAnchorElement> \| undefined` |
| `onCut?` | `ClipboardEventHandler<HTMLAnchorElement> \| undefined` |
| `onCutCapture?` | `ClipboardEventHandler<HTMLAnchorElement> \| undefined` |
| `onDblClick?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onDblClickCapture?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onDrag?` | `DragEventHandler<HTMLAnchorElement> \| undefined` |
| `onDragCapture?` | `DragEventHandler<HTMLAnchorElement> \| undefined` |
| `onDragEnd?` | `DragEventHandler<HTMLAnchorElement> \| undefined` |
| `onDragEndCapture?` | `DragEventHandler<HTMLAnchorElement> \| undefined` |
| `onDragEnter?` | `DragEventHandler<HTMLAnchorElement> \| undefined` |
| `onDragEnterCapture?` | `DragEventHandler<HTMLAnchorElement> \| undefined` |
| `onDragExit?` | `DragEventHandler<HTMLAnchorElement> \| undefined` |
| `onDragExitCapture?` | `DragEventHandler<HTMLAnchorElement> \| undefined` |
| `onDragLeave?` | `DragEventHandler<HTMLAnchorElement> \| undefined` |
| `onDragLeaveCapture?` | `DragEventHandler<HTMLAnchorElement> \| undefined` |
| `onDragOver?` | `DragEventHandler<HTMLAnchorElement> \| undefined` |
| `onDragOverCapture?` | `DragEventHandler<HTMLAnchorElement> \| undefined` |
| `onDragStart?` | `DragEventHandler<HTMLAnchorElement> \| undefined` |
| `onDragStartCapture?` | `DragEventHandler<HTMLAnchorElement> \| undefined` |
| `onDrop?` | `DragEventHandler<HTMLAnchorElement> \| undefined` |
| `onDropCapture?` | `DragEventHandler<HTMLAnchorElement> \| undefined` |
| `onDurationChange?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onDurationChangeCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onEmptied?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onEmptiedCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onEncrypted?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onEncryptedCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onEnded?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onEndedCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onEnterPictureInPicture?` | `PictureInPictureEventHandler<HTMLAnchorElement> \| undefined` |
| `onEnterPictureInPictureCapture?` | `PictureInPictureEventHandler<HTMLAnchorElement> \| undefined` |
| `onError?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onErrorCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onFocus?` | `FocusEventHandler<HTMLAnchorElement> \| undefined` |
| `onFocusCapture?` | `FocusEventHandler<HTMLAnchorElement> \| undefined` |
| `onFocusIn?` | `FocusEventHandler<HTMLAnchorElement> \| undefined` |
| `onFocusInCapture?` | `FocusEventHandler<HTMLAnchorElement> \| undefined` |
| `onFocusOut?` | `FocusEventHandler<HTMLAnchorElement> \| undefined` |
| `onFocusOutCapture?` | `FocusEventHandler<HTMLAnchorElement> \| undefined` |
| `onFormData?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onFormDataCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onGotPointerCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onGotPointerCaptureCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onInput?` | `InputEventHandler<HTMLAnchorElement> \| undefined` |
| `onInputCapture?` | `InputEventHandler<HTMLAnchorElement> \| undefined` |
| `onInvalid?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onInvalidCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onKeyDown?` | `KeyboardEventHandler<HTMLAnchorElement> \| undefined` |
| `onKeyDownCapture?` | `KeyboardEventHandler<HTMLAnchorElement> \| undefined` |
| `onKeyPress?` | `KeyboardEventHandler<HTMLAnchorElement> \| undefined` |
| `onKeyPressCapture?` | `KeyboardEventHandler<HTMLAnchorElement> \| undefined` |
| `onKeyUp?` | `KeyboardEventHandler<HTMLAnchorElement> \| undefined` |
| `onKeyUpCapture?` | `KeyboardEventHandler<HTMLAnchorElement> \| undefined` |
| `onLeavePictureInPicture?` | `PictureInPictureEventHandler<HTMLAnchorElement> \| undefined` |
| `onLeavePictureInPictureCapture?` | `PictureInPictureEventHandler<HTMLAnchorElement> \| undefined` |
| `onLoad?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onLoadCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onLoadedData?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onLoadedDataCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onLoadedMetadata?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onLoadedMetadataCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onLoadStart?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onLoadStartCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onLostPointerCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onLostPointerCaptureCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onMouseDown?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onMouseDownCapture?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onMouseEnter?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onMouseEnterCapture?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onMouseLeave?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onMouseLeaveCapture?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onMouseMove?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onMouseMoveCapture?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onMouseOut?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onMouseOutCapture?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onMouseOver?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onMouseOverCapture?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onMouseUp?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onMouseUpCapture?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onPaste?` | `ClipboardEventHandler<HTMLAnchorElement> \| undefined` |
| `onPasteCapture?` | `ClipboardEventHandler<HTMLAnchorElement> \| undefined` |
| `onPause?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onPauseCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onPlay?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onPlayCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onPlaying?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onPlayingCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerCancel?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerCancelCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerDown?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerDownCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerEnter?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerEnterCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerLeave?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerLeaveCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerMove?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerMoveCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerOut?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerOutCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerOver?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerOverCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerUp?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerUpCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onProgress?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onProgressCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onRateChange?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onRateChangeCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onReset?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onResetCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onResize?` | `PictureInPictureEventHandler<HTMLAnchorElement> \| undefined` |
| `onResizeCapture?` | `PictureInPictureEventHandler<HTMLAnchorElement> \| undefined` |
| `onScroll?` | `UIEventHandler<HTMLAnchorElement> \| undefined` |
| `onScrollCapture?` | `UIEventHandler<HTMLAnchorElement> \| undefined` |
| `onScrollEnd?` | `UIEventHandler<HTMLAnchorElement> \| undefined` |
| `onSearch?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onSearchCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onSeeked?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onSeekedCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onSeeking?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onSeekingCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onSelect?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onSelectCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onStalled?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onStalledCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onSubmit?` | `SubmitEventHandler<HTMLAnchorElement> \| undefined` |
| `onSubmitCapture?` | `SubmitEventHandler<HTMLAnchorElement> \| undefined` |
| `onSuspend?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onSuspendCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onTimeUpdate?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onTimeUpdateCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onToggle?` | `ToggleEventHandler<HTMLAnchorElement> \| undefined` |
| `onTouchCancel?` | `TouchEventHandler<HTMLAnchorElement> \| undefined` |
| `onTouchCancelCapture?` | `TouchEventHandler<HTMLAnchorElement> \| undefined` |
| `onTouchEnd?` | `TouchEventHandler<HTMLAnchorElement> \| undefined` |
| `onTouchEndCapture?` | `TouchEventHandler<HTMLAnchorElement> \| undefined` |
| `onTouchMove?` | `TouchEventHandler<HTMLAnchorElement> \| undefined` |
| `onTouchMoveCapture?` | `TouchEventHandler<HTMLAnchorElement> \| undefined` |
| `onTouchStart?` | `TouchEventHandler<HTMLAnchorElement> \| undefined` |
| `onTouchStartCapture?` | `TouchEventHandler<HTMLAnchorElement> \| undefined` |
| `onTransitionCancel?` | `TransitionEventHandler<HTMLAnchorElement> \| undefined` |
| `onTransitionCancelCapture?` | `TransitionEventHandler<HTMLAnchorElement> \| undefined` |
| `onTransitionEnd?` | `TransitionEventHandler<HTMLAnchorElement> \| undefined` |
| `onTransitionEndCapture?` | `TransitionEventHandler<HTMLAnchorElement> \| undefined` |
| `onTransitionRun?` | `TransitionEventHandler<HTMLAnchorElement> \| undefined` |
| `onTransitionRunCapture?` | `TransitionEventHandler<HTMLAnchorElement> \| undefined` |
| `onTransitionStart?` | `TransitionEventHandler<HTMLAnchorElement> \| undefined` |
| `onTransitionStartCapture?` | `TransitionEventHandler<HTMLAnchorElement> \| undefined` |
| `onVolumeChange?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onVolumeChangeCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onWaiting?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onWaitingCapture?` | `GenericEventHandler<HTMLAnchorElement> \| undefined` |
| `onWheel?` | `WheelEventHandler<HTMLAnchorElement> \| undefined` |
| `onWheelCapture?` | `WheelEventHandler<HTMLAnchorElement> \| undefined` |
| `part?` | `Signalish<string \| undefined>` |
| `ping?` | `Signalish<string \| undefined>` |
| `popover?` | `Signalish<boolean \| "auto" \| "hint" \| "manual" \| undefined>` |
| `prefix?` | `Signalish<string \| undefined>` |
| `property?` | `Signalish<string \| undefined>` |
| `ref?` | `Ref<HTMLAnchorElement> \| undefined` |
| `referrerpolicy?` | `Signalish<HTMLAttributeReferrerPolicy \| undefined>` |
| `referrerPolicy?` | `Signalish<HTMLAttributeReferrerPolicy \| undefined>` |
| `rel?` | `Signalish<string \| undefined>` |
| `resource?` | `Signalish<string \| undefined>` |
| `results?` | `Signalish<number \| undefined>` |
| `role?` | `Signalish<AriaRole \| undefined>` |
| `slot?` | `Signalish<string \| undefined>` |
| `spellcheck?` | `Signalish<boolean \| undefined>` |
| `style?` | `Signalish<string \| CSSProperties \| undefined>` |
| `tabindex?` | `Signalish<number \| undefined>` |
| `tabIndex?` | `Signalish<number \| undefined>` |
| `target?` | `Signalish<HTMLAttributeAnchorTarget \| undefined>` |
| `title?` | `Signalish<string \| undefined>` |
| `to` | `string \| { path?: string; }` |
| `translate?` | `Signalish<boolean \| undefined>` |
| `type?` | `Signalish<string \| undefined>` |
| `typeof?` | `Signalish<string \| undefined>` |
| `vocab?` | `Signalish<string \| undefined>` |

| Member | Type |
| --- | --- |
| `children?` | `ComponentChildren` |
| `defaultLocale?` | `string \| undefined` |
| `i18n` | `PreactI18n` |
| `locales?` | `Locale[] \| undefined` |
| `routingStrategy?` | `I18nRoutingStrategy \| undefined` |

| Member | Type |
| --- | --- |
| `getCurrentPath` | `() => string` |
| `getRoute?` | `(() => { fullPath: string; query: Record<string, unknown>; }) \| undefined` |
| `linkComponent?` | `string \| React.ComponentType<{ [key: string]: unknown; href: string; children?: React.ReactNode; style?: React.CSSProperties; className?: string; }> \| undefined` |
| `push` | `(target: { path: string; }) => void` |
| `replace` | `(target: { path: string; }) => void` |
| `resolvePath?` | `((to: string \| { path?: string; }, locale: string) => string \| { path?: string; }) \| undefined` |

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
| `customActiveLinkStyle?` | `Record<string, string \| number> \| undefined` |
| `customButtonStyle?` | `Record<string, string \| number> \| undefined` |
| `customDisabledLinkStyle?` | `Record<string, string \| number> \| undefined` |
| `customDropdownStyle?` | `Record<string, string \| number> \| undefined` |
| `customIconStyle?` | `Record<string, string \| number> \| undefined` |
| `customItemStyle?` | `Record<string, string \| number> \| undefined` |
| `customLabels?` | `Record<string, string> \| undefined` |
| `customLinkStyle?` | `Record<string, string \| number> \| undefined` |
| `customWrapperStyle?` | `Record<string, string \| number> \| undefined` |
| `dangerouslySetInnerHTML?` | `{ __html: string; } \| undefined` |
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
| `localeRoute?` | `((to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }) \| undefined` |
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
| `onScroll?` | `UIEventHandler<HTMLDivElement> \| undefined` |
| `onScrollCapture?` | `UIEventHandler<HTMLDivElement> \| undefined` |
| `onScrollEnd?` | `UIEventHandler<HTMLDivElement> \| undefined` |
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
| `children?` | `undefined` |
| `class?` | `Signalish<string \| undefined>` |
| `className?` | `Signalish<string \| undefined>` |
| `contenteditable?` | `Signalish<"" \| Booleanish \| "plaintext-only" \| "inherit" \| undefined>` |
| `contentEditable?` | `Signalish<"" \| Booleanish \| "plaintext-only" \| "inherit" \| undefined>` |
| `customPluralRule?` | `PluralFunc \| undefined` |
| `dangerouslySetInnerHTML?` | `{ __html: string; } \| undefined` |
| `datatype?` | `Signalish<string \| undefined>` |
| `date?` | `string \| number \| Date \| undefined` |
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
| `number?` | `string \| number \| undefined` |
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
| `onScroll?` | `UIEventHandler<HTMLElement> \| undefined` |
| `onScrollCapture?` | `UIEventHandler<HTMLElement> \| undefined` |
| `onScrollEnd?` | `UIEventHandler<HTMLElement> \| undefined` |
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
| `params?` | `Record<string, string \| number \| boolean> \| undefined` |
| `part?` | `Signalish<string \| undefined>` |
| `plural?` | `string \| number \| undefined` |
| `popover?` | `Signalish<boolean \| "auto" \| "hint" \| "manual" \| undefined>` |
| `prefix?` | `Signalish<string \| undefined>` |
| `property?` | `Signalish<string \| undefined>` |
| `ref?` | `Ref<HTMLElement> \| undefined` |
| `relativeDate?` | `string \| number \| Date \| undefined` |
| `resource?` | `Signalish<string \| undefined>` |
| `results?` | `Signalish<number \| undefined>` |
| `role?` | `Signalish<AriaRole \| undefined>` |
| `slot?` | `Signalish<string \| undefined>` |
| `spellcheck?` | `Signalish<boolean \| undefined>` |
| `style?` | `Signalish<string \| CSSProperties \| undefined>` |
| `tabindex?` | `Signalish<number \| undefined>` |
| `tabIndex?` | `Signalish<number \| undefined>` |
| `tag?` | `keyof JSX.IntrinsicElements \| undefined` |
| `title?` | `Signalish<string \| undefined>` |
| `translate?` | `Signalish<boolean \| undefined>` |
| `typeof?` | `Signalish<string \| undefined>` |
| `vocab?` | `Signalish<string \| undefined>` |

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

| Member | Type |
| --- | --- |
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
| `loadRouteTranslationsCore` | `(locale: string, routeName: string, translations: Translations, merge: boolean) => void` |
| `loadTranslationsCore` | `(locale: string, translations: Translations, merge: boolean, routeName?: string) => void` |
| `locale` | `string` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn` | `boolean` |
| `new` | `(options: PreactI18nOptions): PreactI18n` |
| `onTranslationsChanged` | `protected () => void` |
| `pluralFunc` | `PluralFunc` |
| `resolveDateTimeFormatArgs` | `private any` |
| `resolveHas` | `protected (key: TranslationKey, routeContext?: unknown) => boolean` |
| `resolveLookup` | `protected (key: TranslationKey, routeContext?: unknown) => unknown \| null` |
| `resolveNumberFormatArgs` | `private any` |
| `resolveRouteName` | `protected (routeContext?: unknown) => string` |
| `resolveTranslations` | `(routeContext?: unknown) => Translations` |
| `resolveTranslationTree` | `protected (lower: Record<string, unknown>, upper: Record<string, unknown>) => Translations` |
| `setRoute` | `(routeName: string) => void` |
| `setTranslation` | `(key: TranslationKey, value: unknown) => void` |
| `storage` | `TranslationStorage` |
| `store` | `private ReactiveI18nStore` |
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

| Member | Type |
| --- | --- |
| `fallbackLocale?` | `string \| undefined` |
| `locale` | `string` |
| `messages?` | `Record<string, Translations> \| undefined` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `plural?` | `PluralFunc \| undefined` |

| Member | Type |
| --- | --- |
| `defaultLocale?` | `string \| undefined` |
| `locales?` | `Locale[] \| undefined` |

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
| `localePath?` | `((to: string \| { path?: string; }, locale?: string) => string) \| undefined` |
| `localeRoute?` | `((to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }) \| undefined` |
| `setLocale` | `(locale: string) => void` |
| `setRoute` | `(routeName: string) => void` |
| `switchLocale?` | `((locale: string) => void) \| undefined` |
| `t` | `(key: TranslationKey, params?: Params, defaultValue?: string \| null, routeName?: string) => CleanTranslation` |
| `tc` | `(key: TranslationKey, count: number \| Params, defaultValue?: string) => string` |
| `td` | `(value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string` |
| `tdr` | `(value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string` |
| `tn` | `(value: number, options?: Intl.NumberFormatOptions) => string` |
| `ts` | `(key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string` |

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
