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
| `createReactRouterAdapter` | function | `(locales: Locale[], defaultLocale: string, location: ReturnType<typeof useLocation>, navigate: ReturnType<typeof useNavigate>) => I18nRoutingStrategy` |
| `defaultPlural` | const | `PluralFunc` |
| `FormatService` | class | 19 members |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `I18nContext` | const | `import("react").Context<ReactI18n \| null>` |
| `I18nDefaultLocaleContext` | const | `import("react").Context<string \| null>` |
| `I18nGroup` | const | `(props: I18nGroupProps) => React.ReactElement` |
| `I18nGroupProps` | interface | 279 members |
| `I18nLink` | const | `(props: I18nLinkProps) => React.ReactElement` |
| `I18nLinkProps` | interface | 289 members |
| `I18nLocalesContext` | const | `import("react").Context<Locale[] \| null>` |
| `I18nProvider` | function | `({ i18n, locales, defaultLocale, routingStrategy, children }: I18nProviderProps) => React.ReactElement` |
| `I18nProviderProps` | interface | 5 members |
| `I18nRouterContext` | const | `import("react").Context<I18nRoutingStrategy \| null>` |
| `I18nRoutingStrategy` | interface | 6 members |
| `I18nSwitcher` | const | `(props: I18nSwitcherProps) => React.ReactElement` |
| `I18nSwitcherProps` | interface | 292 members |
| `I18nT` | const | `(props: I18nTProps) => React.ReactElement \| null` |
| `I18nTProps` | interface | 288 members |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `Locale` | interface | 11 members |
| `LocaleCode` | type | `string` |
| `ModuleOptions` | interface | 49 members |
| `Params` | type | `Record<string, string \| number \| boolean>` |
| `PluralFunc` | type | `(key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string \| null` |
| `ReactI18n` | class | 55 members |
| `ReactI18nOptions` | interface | 9 members |
| `TranslationKey` | type | `Exclude<keyof DefineLocaleMessage, '__augmentation'> extends never ? string : Exclude<keyof DefineLocaleMessage, '__augmentation'> \| (string & {})` |
| `Translations` | interface | 1 members |
| `useI18n` | const | `(options?: UseI18nOptions) => UseI18nReturn` |
| `useI18nContext` | const | `() => ReactI18n` |
| `useI18nDefaultLocale` | const | `() => string \| null` |
| `useI18nLocales` | const | `() => Locale[] \| null` |
| `UseI18nOptions` | interface | 2 members |
| `UseI18nReturn` | interface | 22 members |
| `useI18nRouter` | const | `() => I18nRoutingStrategy \| null` |

<code>FormatService</code> — 19 members, identical to [`FormatService`](/api/packages/astro).

<details>
<summary><code>I18nGroupProps</code> — 279 members</summary>

| Member | Type |
| --- | --- |
| `about?` | `string \| undefined` |
| `accessKey?` | `string \| undefined` |
| `aria-activedescendant?` | `string \| undefined` |
| `aria-atomic?` | `Booleanish \| undefined` |
| `aria-autocomplete?` | `"none" \| "list" \| "inline" \| "both" \| undefined` |
| `aria-braillelabel?` | `string \| undefined` |
| `aria-brailleroledescription?` | `string \| undefined` |
| `aria-busy?` | `Booleanish \| undefined` |
| `aria-checked?` | `boolean \| "true" \| "false" \| "mixed" \| undefined` |
| `aria-colcount?` | `number \| undefined` |
| `aria-colindex?` | `number \| undefined` |
| `aria-colindextext?` | `string \| undefined` |
| `aria-colspan?` | `number \| undefined` |
| `aria-controls?` | `string \| undefined` |
| `aria-current?` | `boolean \| "true" \| "false" \| "page" \| "step" \| "location" \| "date" \| "time" \| undefined` |
| `aria-describedby?` | `string \| undefined` |
| `aria-description?` | `string \| undefined` |
| `aria-details?` | `string \| undefined` |
| `aria-disabled?` | `Booleanish \| undefined` |
| `aria-dropeffect?` | `"none" \| "link" \| "copy" \| "execute" \| "move" \| "popup" \| undefined` |
| `aria-errormessage?` | `string \| undefined` |
| `aria-expanded?` | `Booleanish \| undefined` |
| `aria-flowto?` | `string \| undefined` |
| `aria-grabbed?` | `Booleanish \| undefined` |
| `aria-haspopup?` | `boolean \| "true" \| "false" \| "dialog" \| "grid" \| "listbox" \| "menu" \| "tree" \| undefined` |
| `aria-hidden?` | `Booleanish \| undefined` |
| `aria-invalid?` | `boolean \| "true" \| "false" \| "grammar" \| "spelling" \| undefined` |
| `aria-keyshortcuts?` | `string \| undefined` |
| `aria-label?` | `string \| undefined` |
| `aria-labelledby?` | `string \| undefined` |
| `aria-level?` | `number \| undefined` |
| `aria-live?` | `"off" \| "assertive" \| "polite" \| undefined` |
| `aria-modal?` | `Booleanish \| undefined` |
| `aria-multiline?` | `Booleanish \| undefined` |
| `aria-multiselectable?` | `Booleanish \| undefined` |
| `aria-orientation?` | `"horizontal" \| "vertical" \| undefined` |
| `aria-owns?` | `string \| undefined` |
| `aria-placeholder?` | `string \| undefined` |
| `aria-posinset?` | `number \| undefined` |
| `aria-pressed?` | `boolean \| "true" \| "false" \| "mixed" \| undefined` |
| `aria-readonly?` | `Booleanish \| undefined` |
| `aria-relevant?` | `"text" \| "additions" \| "additions removals" \| "additions text" \| "all" \| "removals" \| "removals additions" \| "removals text" \| "text additions" \| "text removals" \| undefined` |
| `aria-required?` | `Booleanish \| undefined` |
| `aria-roledescription?` | `string \| undefined` |
| `aria-rowcount?` | `number \| undefined` |
| `aria-rowindex?` | `number \| undefined` |
| `aria-rowindextext?` | `string \| undefined` |
| `aria-rowspan?` | `number \| undefined` |
| `aria-selected?` | `Booleanish \| undefined` |
| `aria-setsize?` | `number \| undefined` |
| `aria-sort?` | `"none" \| "ascending" \| "descending" \| "other" \| undefined` |
| `aria-valuemax?` | `number \| undefined` |
| `aria-valuemin?` | `number \| undefined` |
| `aria-valuenow?` | `number \| undefined` |
| `aria-valuetext?` | `string \| undefined` |
| `autoCapitalize?` | `"off" \| "none" \| "on" \| "sentences" \| "words" \| "characters" \| (string & {}) \| undefined` |
| `autoCorrect?` | `string \| undefined` |
| `autoFocus?` | `boolean \| undefined` |
| `autoSave?` | `string \| undefined` |
| `children?` | `((props: { prefix: string; t: (key: string, params?: Record<string, string \| number \| boolean>) => string; }) => React.ReactNode) \| undefined` |
| `className?` | `string \| undefined` |
| `color?` | `string \| undefined` |
| `content?` | `string \| undefined` |
| `contentEditable?` | `Booleanish \| "inherit" \| "plaintext-only" \| undefined` |
| `contextMenu?` | `string \| undefined` |
| `dangerouslySetInnerHTML?` | `{ __html: string \| TrustedHTML; } \| undefined` |
| `datatype?` | `string \| undefined` |
| `defaultChecked?` | `boolean \| undefined` |
| `defaultValue?` | `string \| number \| readonly string[] \| undefined` |
| `dir?` | `string \| undefined` |
| `draggable?` | `Booleanish \| undefined` |
| `enterKeyHint?` | `"enter" \| "done" \| "go" \| "next" \| "previous" \| "search" \| "send" \| undefined` |
| `exportparts?` | `string \| undefined` |
| `groupClass?` | `string \| undefined` |
| `hidden?` | `boolean \| undefined` |
| `id?` | `string \| undefined` |
| `inert?` | `boolean \| undefined` |
| `inlist?` | `any` |
| `inputMode?` | `"none" \| "search" \| "text" \| "tel" \| "url" \| "email" \| "numeric" \| "decimal" \| undefined` |
| `is?` | `string \| undefined` |
| `itemID?` | `string \| undefined` |
| `itemProp?` | `string \| undefined` |
| `itemRef?` | `string \| undefined` |
| `itemScope?` | `boolean \| undefined` |
| `itemType?` | `string \| undefined` |
| `lang?` | `string \| undefined` |
| `nonce?` | `string \| undefined` |
| `onAbort?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onAbortCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
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
| `onCanPlay?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onCanPlayCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onCanPlayThrough?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onCanPlayThroughCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onChange?` | `ChangeEventHandler<HTMLDivElement, Element> \| undefined` |
| `onChangeCapture?` | `ChangeEventHandler<HTMLDivElement, Element> \| undefined` |
| `onClick?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onClickCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
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
| `onDoubleClick?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onDoubleClickCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
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
| `onDurationChange?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onDurationChangeCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onEmptied?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onEmptiedCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onEncrypted?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onEncryptedCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onEnded?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onEndedCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onError?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onErrorCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onFocus?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onFocusCapture?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onGotPointerCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onGotPointerCaptureCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onInput?` | `InputEventHandler<HTMLDivElement> \| undefined` |
| `onInputCapture?` | `InputEventHandler<HTMLDivElement> \| undefined` |
| `onInvalid?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onInvalidCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onKeyDown?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyDownCapture?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyPress?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyPressCapture?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyUp?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyUpCapture?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onLoad?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onLoadCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onLoadedData?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onLoadedDataCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onLoadedMetadata?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onLoadedMetadataCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onLoadStart?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onLoadStartCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onLostPointerCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onLostPointerCaptureCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onMouseDown?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseDownCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseEnter?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseLeave?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
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
| `onPause?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onPauseCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onPlay?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onPlayCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onPlaying?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onPlayingCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onPointerCancel?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerCancelCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerDown?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerDownCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerEnter?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerLeave?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerMove?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerMoveCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerOut?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerOutCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerOver?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerOverCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerUp?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerUpCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onProgress?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onProgressCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onRateChange?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onRateChangeCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onReset?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onResetCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onScroll?` | `UIEventHandler<HTMLDivElement> \| undefined` |
| `onScrollCapture?` | `UIEventHandler<HTMLDivElement> \| undefined` |
| `onScrollEnd?` | `UIEventHandler<HTMLDivElement> \| undefined` |
| `onScrollEndCapture?` | `UIEventHandler<HTMLDivElement> \| undefined` |
| `onSeeked?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onSeekedCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onSeeking?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onSeekingCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onSelect?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onSelectCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onStalled?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onStalledCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onSubmit?` | `SubmitEventHandler<HTMLDivElement> \| undefined` |
| `onSubmitCapture?` | `SubmitEventHandler<HTMLDivElement> \| undefined` |
| `onSuspend?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onSuspendCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onTimeUpdate?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onTimeUpdateCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
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
| `onVolumeChange?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onVolumeChangeCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onWaiting?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onWaitingCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onWheel?` | `WheelEventHandler<HTMLDivElement> \| undefined` |
| `onWheelCapture?` | `WheelEventHandler<HTMLDivElement> \| undefined` |
| `part?` | `string \| undefined` |
| `popover?` | `"" \| "auto" \| "manual" \| "hint" \| undefined` |
| `popoverTarget?` | `string \| undefined` |
| `popoverTargetAction?` | `"toggle" \| "show" \| "hide" \| undefined` |
| `prefix` | `string` |
| `property?` | `string \| undefined` |
| `radioGroup?` | `string \| undefined` |
| `rel?` | `string \| undefined` |
| `resource?` | `string \| undefined` |
| `results?` | `number \| undefined` |
| `rev?` | `string \| undefined` |
| `role?` | `AriaRole \| undefined` |
| `security?` | `string \| undefined` |
| `slot?` | `string \| undefined` |
| `spellCheck?` | `Booleanish \| undefined` |
| `style?` | `CSSProperties \| undefined` |
| `suppressContentEditableWarning?` | `boolean \| undefined` |
| `suppressHydrationWarning?` | `boolean \| undefined` |
| `tabIndex?` | `number \| undefined` |
| `title?` | `string \| undefined` |
| `translate?` | `"yes" \| "no" \| undefined` |
| `typeof?` | `string \| undefined` |
| `unselectable?` | `"off" \| "on" \| undefined` |
| `vocab?` | `string \| undefined` |

</details>

<details>
<summary><code>I18nLinkProps</code> — 289 members</summary>

| Member | Type |
| --- | --- |
| `about?` | `string \| undefined` |
| `accessKey?` | `string \| undefined` |
| `activeStyle?` | `React.CSSProperties \| undefined` |
| `aria-activedescendant?` | `string \| undefined` |
| `aria-atomic?` | `Booleanish \| undefined` |
| `aria-autocomplete?` | `"none" \| "list" \| "inline" \| "both" \| undefined` |
| `aria-braillelabel?` | `string \| undefined` |
| `aria-brailleroledescription?` | `string \| undefined` |
| `aria-busy?` | `Booleanish \| undefined` |
| `aria-checked?` | `boolean \| "true" \| "false" \| "mixed" \| undefined` |
| `aria-colcount?` | `number \| undefined` |
| `aria-colindex?` | `number \| undefined` |
| `aria-colindextext?` | `string \| undefined` |
| `aria-colspan?` | `number \| undefined` |
| `aria-controls?` | `string \| undefined` |
| `aria-current?` | `boolean \| "true" \| "false" \| "page" \| "step" \| "location" \| "date" \| "time" \| undefined` |
| `aria-describedby?` | `string \| undefined` |
| `aria-description?` | `string \| undefined` |
| `aria-details?` | `string \| undefined` |
| `aria-disabled?` | `Booleanish \| undefined` |
| `aria-dropeffect?` | `"none" \| "link" \| "copy" \| "execute" \| "move" \| "popup" \| undefined` |
| `aria-errormessage?` | `string \| undefined` |
| `aria-expanded?` | `Booleanish \| undefined` |
| `aria-flowto?` | `string \| undefined` |
| `aria-grabbed?` | `Booleanish \| undefined` |
| `aria-haspopup?` | `boolean \| "true" \| "false" \| "dialog" \| "grid" \| "listbox" \| "menu" \| "tree" \| undefined` |
| `aria-hidden?` | `Booleanish \| undefined` |
| `aria-invalid?` | `boolean \| "true" \| "false" \| "grammar" \| "spelling" \| undefined` |
| `aria-keyshortcuts?` | `string \| undefined` |
| `aria-label?` | `string \| undefined` |
| `aria-labelledby?` | `string \| undefined` |
| `aria-level?` | `number \| undefined` |
| `aria-live?` | `"off" \| "assertive" \| "polite" \| undefined` |
| `aria-modal?` | `Booleanish \| undefined` |
| `aria-multiline?` | `Booleanish \| undefined` |
| `aria-multiselectable?` | `Booleanish \| undefined` |
| `aria-orientation?` | `"horizontal" \| "vertical" \| undefined` |
| `aria-owns?` | `string \| undefined` |
| `aria-placeholder?` | `string \| undefined` |
| `aria-posinset?` | `number \| undefined` |
| `aria-pressed?` | `boolean \| "true" \| "false" \| "mixed" \| undefined` |
| `aria-readonly?` | `Booleanish \| undefined` |
| `aria-relevant?` | `"text" \| "additions" \| "additions removals" \| "additions text" \| "all" \| "removals" \| "removals additions" \| "removals text" \| "text additions" \| "text removals" \| undefined` |
| `aria-required?` | `Booleanish \| undefined` |
| `aria-roledescription?` | `string \| undefined` |
| `aria-rowcount?` | `number \| undefined` |
| `aria-rowindex?` | `number \| undefined` |
| `aria-rowindextext?` | `string \| undefined` |
| `aria-rowspan?` | `number \| undefined` |
| `aria-selected?` | `Booleanish \| undefined` |
| `aria-setsize?` | `number \| undefined` |
| `aria-sort?` | `"none" \| "ascending" \| "descending" \| "other" \| undefined` |
| `aria-valuemax?` | `number \| undefined` |
| `aria-valuemin?` | `number \| undefined` |
| `aria-valuenow?` | `number \| undefined` |
| `aria-valuetext?` | `string \| undefined` |
| `autoCapitalize?` | `"off" \| "none" \| "on" \| "sentences" \| "words" \| "characters" \| (string & {}) \| undefined` |
| `autoCorrect?` | `string \| undefined` |
| `autoFocus?` | `boolean \| undefined` |
| `autoSave?` | `string \| undefined` |
| `children?` | `ReactNode` |
| `className?` | `string \| undefined` |
| `color?` | `string \| undefined` |
| `content?` | `string \| undefined` |
| `contentEditable?` | `Booleanish \| "inherit" \| "plaintext-only" \| undefined` |
| `contextMenu?` | `string \| undefined` |
| `dangerouslySetInnerHTML?` | `{ __html: string \| TrustedHTML; } \| undefined` |
| `datatype?` | `string \| undefined` |
| `defaultChecked?` | `boolean \| undefined` |
| `defaultValue?` | `string \| number \| readonly string[] \| undefined` |
| `dir?` | `string \| undefined` |
| `download?` | `any` |
| `draggable?` | `Booleanish \| undefined` |
| `enterKeyHint?` | `"enter" \| "done" \| "go" \| "next" \| "previous" \| "search" \| "send" \| undefined` |
| `exportparts?` | `string \| undefined` |
| `hidden?` | `boolean \| undefined` |
| `href?` | `string \| undefined` |
| `hrefLang?` | `string \| undefined` |
| `id?` | `string \| undefined` |
| `inert?` | `boolean \| undefined` |
| `inlist?` | `any` |
| `inputMode?` | `"none" \| "search" \| "text" \| "tel" \| "url" \| "email" \| "numeric" \| "decimal" \| undefined` |
| `is?` | `string \| undefined` |
| `itemID?` | `string \| undefined` |
| `itemProp?` | `string \| undefined` |
| `itemRef?` | `string \| undefined` |
| `itemScope?` | `boolean \| undefined` |
| `itemType?` | `string \| undefined` |
| `lang?` | `string \| undefined` |
| `localeRoute?` | `((to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }) \| undefined` |
| `media?` | `string \| undefined` |
| `nonce?` | `string \| undefined` |
| `onAbort?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onAbortCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
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
| `onBeforeToggle?` | `ToggleEventHandler<HTMLAnchorElement> \| undefined` |
| `onBlur?` | `FocusEventHandler<HTMLAnchorElement> \| undefined` |
| `onBlurCapture?` | `FocusEventHandler<HTMLAnchorElement> \| undefined` |
| `onCanPlay?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onCanPlayCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onCanPlayThrough?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onCanPlayThroughCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onChange?` | `ChangeEventHandler<HTMLAnchorElement, Element> \| undefined` |
| `onChangeCapture?` | `ChangeEventHandler<HTMLAnchorElement, Element> \| undefined` |
| `onClick?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onClickCapture?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
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
| `onDoubleClick?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onDoubleClickCapture?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
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
| `onDurationChange?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onDurationChangeCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onEmptied?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onEmptiedCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onEncrypted?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onEncryptedCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onEnded?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onEndedCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onError?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onErrorCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onFocus?` | `FocusEventHandler<HTMLAnchorElement> \| undefined` |
| `onFocusCapture?` | `FocusEventHandler<HTMLAnchorElement> \| undefined` |
| `onGotPointerCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onGotPointerCaptureCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onInput?` | `InputEventHandler<HTMLAnchorElement> \| undefined` |
| `onInputCapture?` | `InputEventHandler<HTMLAnchorElement> \| undefined` |
| `onInvalid?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onInvalidCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onKeyDown?` | `KeyboardEventHandler<HTMLAnchorElement> \| undefined` |
| `onKeyDownCapture?` | `KeyboardEventHandler<HTMLAnchorElement> \| undefined` |
| `onKeyPress?` | `KeyboardEventHandler<HTMLAnchorElement> \| undefined` |
| `onKeyPressCapture?` | `KeyboardEventHandler<HTMLAnchorElement> \| undefined` |
| `onKeyUp?` | `KeyboardEventHandler<HTMLAnchorElement> \| undefined` |
| `onKeyUpCapture?` | `KeyboardEventHandler<HTMLAnchorElement> \| undefined` |
| `onLoad?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onLoadCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onLoadedData?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onLoadedDataCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onLoadedMetadata?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onLoadedMetadataCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onLoadStart?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onLoadStartCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onLostPointerCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onLostPointerCaptureCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onMouseDown?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onMouseDownCapture?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onMouseEnter?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
| `onMouseLeave?` | `MouseEventHandler<HTMLAnchorElement> \| undefined` |
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
| `onPause?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onPauseCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onPlay?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onPlayCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onPlaying?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onPlayingCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerCancel?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerCancelCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerDown?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerDownCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerEnter?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerLeave?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerMove?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerMoveCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerOut?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerOutCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerOver?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerOverCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerUp?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onPointerUpCapture?` | `PointerEventHandler<HTMLAnchorElement> \| undefined` |
| `onProgress?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onProgressCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onRateChange?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onRateChangeCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onReset?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onResetCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onScroll?` | `UIEventHandler<HTMLAnchorElement> \| undefined` |
| `onScrollCapture?` | `UIEventHandler<HTMLAnchorElement> \| undefined` |
| `onScrollEnd?` | `UIEventHandler<HTMLAnchorElement> \| undefined` |
| `onScrollEndCapture?` | `UIEventHandler<HTMLAnchorElement> \| undefined` |
| `onSeeked?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onSeekedCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onSeeking?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onSeekingCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onSelect?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onSelectCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onStalled?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onStalledCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onSubmit?` | `SubmitEventHandler<HTMLAnchorElement> \| undefined` |
| `onSubmitCapture?` | `SubmitEventHandler<HTMLAnchorElement> \| undefined` |
| `onSuspend?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onSuspendCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onTimeUpdate?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onTimeUpdateCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
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
| `onVolumeChange?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onVolumeChangeCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onWaiting?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onWaitingCapture?` | `ReactEventHandler<HTMLAnchorElement> \| undefined` |
| `onWheel?` | `WheelEventHandler<HTMLAnchorElement> \| undefined` |
| `onWheelCapture?` | `WheelEventHandler<HTMLAnchorElement> \| undefined` |
| `part?` | `string \| undefined` |
| `ping?` | `string \| undefined` |
| `popover?` | `"" \| "auto" \| "manual" \| "hint" \| undefined` |
| `popoverTarget?` | `string \| undefined` |
| `popoverTargetAction?` | `"toggle" \| "show" \| "hide" \| undefined` |
| `prefix?` | `string \| undefined` |
| `property?` | `string \| undefined` |
| `radioGroup?` | `string \| undefined` |
| `referrerPolicy?` | `HTMLAttributeReferrerPolicy \| undefined` |
| `rel?` | `string \| undefined` |
| `resource?` | `string \| undefined` |
| `results?` | `number \| undefined` |
| `rev?` | `string \| undefined` |
| `role?` | `AriaRole \| undefined` |
| `security?` | `string \| undefined` |
| `slot?` | `string \| undefined` |
| `spellCheck?` | `Booleanish \| undefined` |
| `style?` | `CSSProperties \| undefined` |
| `suppressContentEditableWarning?` | `boolean \| undefined` |
| `suppressHydrationWarning?` | `boolean \| undefined` |
| `tabIndex?` | `number \| undefined` |
| `target?` | `HTMLAttributeAnchorTarget \| undefined` |
| `title?` | `string \| undefined` |
| `to` | `string \| { path?: string; }` |
| `translate?` | `"yes" \| "no" \| undefined` |
| `type?` | `string \| undefined` |
| `typeof?` | `string \| undefined` |
| `unselectable?` | `"off" \| "on" \| undefined` |
| `vocab?` | `string \| undefined` |

</details>

<details>
<summary><code>I18nProviderProps</code> — 5 members</summary>

| Member | Type |
| --- | --- |
| `children` | `React.ReactNode` |
| `defaultLocale?` | `string \| undefined` |
| `i18n` | `ReactI18n` |
| `locales?` | `Locale[] \| undefined` |
| `routingStrategy?` | `I18nRoutingStrategy \| undefined` |

</details>

<code>I18nRoutingStrategy</code> — 6 members, identical to [`I18nRoutingStrategy`](/api/packages/preact).

<details>
<summary><code>I18nSwitcherProps</code> — 292 members</summary>

| Member | Type |
| --- | --- |
| `about?` | `string \| undefined` |
| `accessKey?` | `string \| undefined` |
| `aria-activedescendant?` | `string \| undefined` |
| `aria-atomic?` | `Booleanish \| undefined` |
| `aria-autocomplete?` | `"none" \| "list" \| "inline" \| "both" \| undefined` |
| `aria-braillelabel?` | `string \| undefined` |
| `aria-brailleroledescription?` | `string \| undefined` |
| `aria-busy?` | `Booleanish \| undefined` |
| `aria-checked?` | `boolean \| "true" \| "false" \| "mixed" \| undefined` |
| `aria-colcount?` | `number \| undefined` |
| `aria-colindex?` | `number \| undefined` |
| `aria-colindextext?` | `string \| undefined` |
| `aria-colspan?` | `number \| undefined` |
| `aria-controls?` | `string \| undefined` |
| `aria-current?` | `boolean \| "true" \| "false" \| "page" \| "step" \| "location" \| "date" \| "time" \| undefined` |
| `aria-describedby?` | `string \| undefined` |
| `aria-description?` | `string \| undefined` |
| `aria-details?` | `string \| undefined` |
| `aria-disabled?` | `Booleanish \| undefined` |
| `aria-dropeffect?` | `"none" \| "link" \| "copy" \| "execute" \| "move" \| "popup" \| undefined` |
| `aria-errormessage?` | `string \| undefined` |
| `aria-expanded?` | `Booleanish \| undefined` |
| `aria-flowto?` | `string \| undefined` |
| `aria-grabbed?` | `Booleanish \| undefined` |
| `aria-haspopup?` | `boolean \| "true" \| "false" \| "dialog" \| "grid" \| "listbox" \| "menu" \| "tree" \| undefined` |
| `aria-hidden?` | `Booleanish \| undefined` |
| `aria-invalid?` | `boolean \| "true" \| "false" \| "grammar" \| "spelling" \| undefined` |
| `aria-keyshortcuts?` | `string \| undefined` |
| `aria-label?` | `string \| undefined` |
| `aria-labelledby?` | `string \| undefined` |
| `aria-level?` | `number \| undefined` |
| `aria-live?` | `"off" \| "assertive" \| "polite" \| undefined` |
| `aria-modal?` | `Booleanish \| undefined` |
| `aria-multiline?` | `Booleanish \| undefined` |
| `aria-multiselectable?` | `Booleanish \| undefined` |
| `aria-orientation?` | `"horizontal" \| "vertical" \| undefined` |
| `aria-owns?` | `string \| undefined` |
| `aria-placeholder?` | `string \| undefined` |
| `aria-posinset?` | `number \| undefined` |
| `aria-pressed?` | `boolean \| "true" \| "false" \| "mixed" \| undefined` |
| `aria-readonly?` | `Booleanish \| undefined` |
| `aria-relevant?` | `"text" \| "additions" \| "additions removals" \| "additions text" \| "all" \| "removals" \| "removals additions" \| "removals text" \| "text additions" \| "text removals" \| undefined` |
| `aria-required?` | `Booleanish \| undefined` |
| `aria-roledescription?` | `string \| undefined` |
| `aria-rowcount?` | `number \| undefined` |
| `aria-rowindex?` | `number \| undefined` |
| `aria-rowindextext?` | `string \| undefined` |
| `aria-rowspan?` | `number \| undefined` |
| `aria-selected?` | `Booleanish \| undefined` |
| `aria-setsize?` | `number \| undefined` |
| `aria-sort?` | `"none" \| "ascending" \| "descending" \| "other" \| undefined` |
| `aria-valuemax?` | `number \| undefined` |
| `aria-valuemin?` | `number \| undefined` |
| `aria-valuenow?` | `number \| undefined` |
| `aria-valuetext?` | `string \| undefined` |
| `autoCapitalize?` | `"off" \| "none" \| "on" \| "sentences" \| "words" \| "characters" \| (string & {}) \| undefined` |
| `autoCorrect?` | `string \| undefined` |
| `autoFocus?` | `boolean \| undefined` |
| `autoSave?` | `string \| undefined` |
| `children?` | `ReactNode` |
| `className?` | `string \| undefined` |
| `color?` | `string \| undefined` |
| `content?` | `string \| undefined` |
| `contentEditable?` | `Booleanish \| "inherit" \| "plaintext-only" \| undefined` |
| `contextMenu?` | `string \| undefined` |
| `currentLocale?` | `string \| (() => string) \| undefined` |
| `customActiveLinkStyle?` | `React.CSSProperties \| undefined` |
| `customButtonStyle?` | `React.CSSProperties \| undefined` |
| `customDisabledLinkStyle?` | `React.CSSProperties \| undefined` |
| `customDropdownStyle?` | `React.CSSProperties \| undefined` |
| `customIconStyle?` | `React.CSSProperties \| undefined` |
| `customItemStyle?` | `React.CSSProperties \| undefined` |
| `customLabels?` | `Record<string, string> \| undefined` |
| `customLinkStyle?` | `React.CSSProperties \| undefined` |
| `customWrapperStyle?` | `React.CSSProperties \| undefined` |
| `dangerouslySetInnerHTML?` | `{ __html: string \| TrustedHTML; } \| undefined` |
| `datatype?` | `string \| undefined` |
| `defaultChecked?` | `boolean \| undefined` |
| `defaultValue?` | `string \| number \| readonly string[] \| undefined` |
| `dir?` | `string \| undefined` |
| `draggable?` | `Booleanish \| undefined` |
| `enterKeyHint?` | `"enter" \| "done" \| "go" \| "next" \| "previous" \| "search" \| "send" \| undefined` |
| `exportparts?` | `string \| undefined` |
| `getLocaleName?` | `(() => string \| null) \| undefined` |
| `hidden?` | `boolean \| undefined` |
| `id?` | `string \| undefined` |
| `inert?` | `boolean \| undefined` |
| `inlist?` | `any` |
| `inputMode?` | `"none" \| "search" \| "text" \| "tel" \| "url" \| "email" \| "numeric" \| "decimal" \| undefined` |
| `is?` | `string \| undefined` |
| `itemID?` | `string \| undefined` |
| `itemProp?` | `string \| undefined` |
| `itemRef?` | `string \| undefined` |
| `itemScope?` | `boolean \| undefined` |
| `itemType?` | `string \| undefined` |
| `lang?` | `string \| undefined` |
| `localeRoute?` | `((to: string \| { path?: string; }, locale?: string) => string \| { path?: string; }) \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `nonce?` | `string \| undefined` |
| `onAbort?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onAbortCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
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
| `onCanPlay?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onCanPlayCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onCanPlayThrough?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onCanPlayThroughCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onChange?` | `ChangeEventHandler<HTMLDivElement, Element> \| undefined` |
| `onChangeCapture?` | `ChangeEventHandler<HTMLDivElement, Element> \| undefined` |
| `onClick?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onClickCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
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
| `onDoubleClick?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onDoubleClickCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
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
| `onDurationChange?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onDurationChangeCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onEmptied?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onEmptiedCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onEncrypted?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onEncryptedCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onEnded?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onEndedCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onError?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onErrorCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onFocus?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onFocusCapture?` | `FocusEventHandler<HTMLDivElement> \| undefined` |
| `onGotPointerCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onGotPointerCaptureCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onInput?` | `InputEventHandler<HTMLDivElement> \| undefined` |
| `onInputCapture?` | `InputEventHandler<HTMLDivElement> \| undefined` |
| `onInvalid?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onInvalidCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onKeyDown?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyDownCapture?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyPress?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyPressCapture?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyUp?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onKeyUpCapture?` | `KeyboardEventHandler<HTMLDivElement> \| undefined` |
| `onLoad?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onLoadCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onLoadedData?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onLoadedDataCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onLoadedMetadata?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onLoadedMetadataCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onLoadStart?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onLoadStartCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onLostPointerCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onLostPointerCaptureCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onMouseDown?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseDownCapture?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseEnter?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
| `onMouseLeave?` | `MouseEventHandler<HTMLDivElement> \| undefined` |
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
| `onPause?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onPauseCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onPlay?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onPlayCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onPlaying?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onPlayingCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onPointerCancel?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerCancelCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerDown?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerDownCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerEnter?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerLeave?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerMove?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerMoveCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerOut?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerOutCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerOver?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerOverCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerUp?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onPointerUpCapture?` | `PointerEventHandler<HTMLDivElement> \| undefined` |
| `onProgress?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onProgressCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onRateChange?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onRateChangeCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onReset?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onResetCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onScroll?` | `UIEventHandler<HTMLDivElement> \| undefined` |
| `onScrollCapture?` | `UIEventHandler<HTMLDivElement> \| undefined` |
| `onScrollEnd?` | `UIEventHandler<HTMLDivElement> \| undefined` |
| `onScrollEndCapture?` | `UIEventHandler<HTMLDivElement> \| undefined` |
| `onSeeked?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onSeekedCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onSeeking?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onSeekingCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onSelect?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onSelectCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onStalled?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onStalledCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onSubmit?` | `SubmitEventHandler<HTMLDivElement> \| undefined` |
| `onSubmitCapture?` | `SubmitEventHandler<HTMLDivElement> \| undefined` |
| `onSuspend?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onSuspendCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onTimeUpdate?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onTimeUpdateCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
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
| `onVolumeChange?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onVolumeChangeCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onWaiting?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onWaitingCapture?` | `ReactEventHandler<HTMLDivElement> \| undefined` |
| `onWheel?` | `WheelEventHandler<HTMLDivElement> \| undefined` |
| `onWheelCapture?` | `WheelEventHandler<HTMLDivElement> \| undefined` |
| `part?` | `string \| undefined` |
| `popover?` | `"" \| "auto" \| "manual" \| "hint" \| undefined` |
| `popoverTarget?` | `string \| undefined` |
| `popoverTargetAction?` | `"toggle" \| "show" \| "hide" \| undefined` |
| `prefix?` | `string \| undefined` |
| `property?` | `string \| undefined` |
| `radioGroup?` | `string \| undefined` |
| `rel?` | `string \| undefined` |
| `resource?` | `string \| undefined` |
| `results?` | `number \| undefined` |
| `rev?` | `string \| undefined` |
| `role?` | `AriaRole \| undefined` |
| `security?` | `string \| undefined` |
| `slot?` | `string \| undefined` |
| `spellCheck?` | `Booleanish \| undefined` |
| `style?` | `CSSProperties \| undefined` |
| `suppressContentEditableWarning?` | `boolean \| undefined` |
| `suppressHydrationWarning?` | `boolean \| undefined` |
| `switchLocale?` | `((locale: string) => void) \| undefined` |
| `tabIndex?` | `number \| undefined` |
| `title?` | `string \| undefined` |
| `translate?` | `"yes" \| "no" \| undefined` |
| `typeof?` | `string \| undefined` |
| `unselectable?` | `"off" \| "on" \| undefined` |
| `vocab?` | `string \| undefined` |

</details>

<details>
<summary><code>I18nTProps</code> — 288 members</summary>

| Member | Type |
| --- | --- |
| `about?` | `string \| undefined` |
| `accessKey?` | `string \| undefined` |
| `aria-activedescendant?` | `string \| undefined` |
| `aria-atomic?` | `Booleanish \| undefined` |
| `aria-autocomplete?` | `"none" \| "list" \| "inline" \| "both" \| undefined` |
| `aria-braillelabel?` | `string \| undefined` |
| `aria-brailleroledescription?` | `string \| undefined` |
| `aria-busy?` | `Booleanish \| undefined` |
| `aria-checked?` | `boolean \| "true" \| "false" \| "mixed" \| undefined` |
| `aria-colcount?` | `number \| undefined` |
| `aria-colindex?` | `number \| undefined` |
| `aria-colindextext?` | `string \| undefined` |
| `aria-colspan?` | `number \| undefined` |
| `aria-controls?` | `string \| undefined` |
| `aria-current?` | `boolean \| "true" \| "false" \| "page" \| "step" \| "location" \| "date" \| "time" \| undefined` |
| `aria-describedby?` | `string \| undefined` |
| `aria-description?` | `string \| undefined` |
| `aria-details?` | `string \| undefined` |
| `aria-disabled?` | `Booleanish \| undefined` |
| `aria-dropeffect?` | `"none" \| "link" \| "copy" \| "execute" \| "move" \| "popup" \| undefined` |
| `aria-errormessage?` | `string \| undefined` |
| `aria-expanded?` | `Booleanish \| undefined` |
| `aria-flowto?` | `string \| undefined` |
| `aria-grabbed?` | `Booleanish \| undefined` |
| `aria-haspopup?` | `boolean \| "true" \| "false" \| "dialog" \| "grid" \| "listbox" \| "menu" \| "tree" \| undefined` |
| `aria-hidden?` | `Booleanish \| undefined` |
| `aria-invalid?` | `boolean \| "true" \| "false" \| "grammar" \| "spelling" \| undefined` |
| `aria-keyshortcuts?` | `string \| undefined` |
| `aria-label?` | `string \| undefined` |
| `aria-labelledby?` | `string \| undefined` |
| `aria-level?` | `number \| undefined` |
| `aria-live?` | `"off" \| "assertive" \| "polite" \| undefined` |
| `aria-modal?` | `Booleanish \| undefined` |
| `aria-multiline?` | `Booleanish \| undefined` |
| `aria-multiselectable?` | `Booleanish \| undefined` |
| `aria-orientation?` | `"horizontal" \| "vertical" \| undefined` |
| `aria-owns?` | `string \| undefined` |
| `aria-placeholder?` | `string \| undefined` |
| `aria-posinset?` | `number \| undefined` |
| `aria-pressed?` | `boolean \| "true" \| "false" \| "mixed" \| undefined` |
| `aria-readonly?` | `Booleanish \| undefined` |
| `aria-relevant?` | `"text" \| "additions" \| "additions removals" \| "additions text" \| "all" \| "removals" \| "removals additions" \| "removals text" \| "text additions" \| "text removals" \| undefined` |
| `aria-required?` | `Booleanish \| undefined` |
| `aria-roledescription?` | `string \| undefined` |
| `aria-rowcount?` | `number \| undefined` |
| `aria-rowindex?` | `number \| undefined` |
| `aria-rowindextext?` | `string \| undefined` |
| `aria-rowspan?` | `number \| undefined` |
| `aria-selected?` | `Booleanish \| undefined` |
| `aria-setsize?` | `number \| undefined` |
| `aria-sort?` | `"none" \| "ascending" \| "descending" \| "other" \| undefined` |
| `aria-valuemax?` | `number \| undefined` |
| `aria-valuemin?` | `number \| undefined` |
| `aria-valuenow?` | `number \| undefined` |
| `aria-valuetext?` | `string \| undefined` |
| `autoCapitalize?` | `"off" \| "none" \| "on" \| "sentences" \| "words" \| "characters" \| (string & {}) \| undefined` |
| `autoCorrect?` | `string \| undefined` |
| `autoFocus?` | `boolean \| undefined` |
| `autoSave?` | `string \| undefined` |
| `children?` | `undefined` |
| `className?` | `string \| undefined` |
| `color?` | `string \| undefined` |
| `content?` | `string \| undefined` |
| `contentEditable?` | `Booleanish \| "inherit" \| "plaintext-only" \| undefined` |
| `contextMenu?` | `string \| undefined` |
| `customPluralRule?` | `PluralFunc \| undefined` |
| `dangerouslySetInnerHTML?` | `{ __html: string \| TrustedHTML; } \| undefined` |
| `datatype?` | `string \| undefined` |
| `date?` | `string \| number \| Date \| undefined` |
| `defaultChecked?` | `boolean \| undefined` |
| `defaultValue?` | `string \| undefined` |
| `dir?` | `string \| undefined` |
| `draggable?` | `Booleanish \| undefined` |
| `enterKeyHint?` | `"enter" \| "done" \| "go" \| "next" \| "previous" \| "search" \| "send" \| undefined` |
| `exportparts?` | `string \| undefined` |
| `hidden?` | `boolean \| undefined` |
| `hideIfEmpty?` | `boolean \| undefined` |
| `html?` | `boolean \| undefined` |
| `id?` | `string \| undefined` |
| `inert?` | `boolean \| undefined` |
| `inlist?` | `any` |
| `inputMode?` | `"none" \| "search" \| "text" \| "tel" \| "url" \| "email" \| "numeric" \| "decimal" \| undefined` |
| `is?` | `string \| undefined` |
| `itemID?` | `string \| undefined` |
| `itemProp?` | `string \| undefined` |
| `itemRef?` | `string \| undefined` |
| `itemScope?` | `boolean \| undefined` |
| `itemType?` | `string \| undefined` |
| `keypath` | `string` |
| `lang?` | `string \| undefined` |
| `nonce?` | `string \| undefined` |
| `number?` | `string \| number \| undefined` |
| `onAbort?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onAbortCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
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
| `onCanPlay?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onCanPlayCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onCanPlayThrough?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onCanPlayThroughCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onChange?` | `ChangeEventHandler<HTMLElement, Element> \| undefined` |
| `onChangeCapture?` | `ChangeEventHandler<HTMLElement, Element> \| undefined` |
| `onClick?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onClickCapture?` | `MouseEventHandler<HTMLElement> \| undefined` |
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
| `onDoubleClick?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onDoubleClickCapture?` | `MouseEventHandler<HTMLElement> \| undefined` |
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
| `onDurationChange?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onDurationChangeCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onEmptied?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onEmptiedCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onEncrypted?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onEncryptedCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onEnded?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onEndedCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onError?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onErrorCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onFocus?` | `FocusEventHandler<HTMLElement> \| undefined` |
| `onFocusCapture?` | `FocusEventHandler<HTMLElement> \| undefined` |
| `onGotPointerCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onGotPointerCaptureCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onInput?` | `InputEventHandler<HTMLElement> \| undefined` |
| `onInputCapture?` | `InputEventHandler<HTMLElement> \| undefined` |
| `onInvalid?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onInvalidCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onKeyDown?` | `KeyboardEventHandler<HTMLElement> \| undefined` |
| `onKeyDownCapture?` | `KeyboardEventHandler<HTMLElement> \| undefined` |
| `onKeyPress?` | `KeyboardEventHandler<HTMLElement> \| undefined` |
| `onKeyPressCapture?` | `KeyboardEventHandler<HTMLElement> \| undefined` |
| `onKeyUp?` | `KeyboardEventHandler<HTMLElement> \| undefined` |
| `onKeyUpCapture?` | `KeyboardEventHandler<HTMLElement> \| undefined` |
| `onLoad?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onLoadCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onLoadedData?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onLoadedDataCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onLoadedMetadata?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onLoadedMetadataCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onLoadStart?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onLoadStartCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onLostPointerCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onLostPointerCaptureCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onMouseDown?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onMouseDownCapture?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onMouseEnter?` | `MouseEventHandler<HTMLElement> \| undefined` |
| `onMouseLeave?` | `MouseEventHandler<HTMLElement> \| undefined` |
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
| `onPause?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onPauseCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onPlay?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onPlayCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onPlaying?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onPlayingCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onPointerCancel?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerCancelCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerDown?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerDownCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerEnter?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerLeave?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerMove?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerMoveCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerOut?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerOutCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerOver?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerOverCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerUp?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onPointerUpCapture?` | `PointerEventHandler<HTMLElement> \| undefined` |
| `onProgress?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onProgressCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onRateChange?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onRateChangeCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onReset?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onResetCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onScroll?` | `UIEventHandler<HTMLElement> \| undefined` |
| `onScrollCapture?` | `UIEventHandler<HTMLElement> \| undefined` |
| `onScrollEnd?` | `UIEventHandler<HTMLElement> \| undefined` |
| `onScrollEndCapture?` | `UIEventHandler<HTMLElement> \| undefined` |
| `onSeeked?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onSeekedCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onSeeking?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onSeekingCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onSelect?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onSelectCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onStalled?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onStalledCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onSubmit?` | `SubmitEventHandler<HTMLElement> \| undefined` |
| `onSubmitCapture?` | `SubmitEventHandler<HTMLElement> \| undefined` |
| `onSuspend?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onSuspendCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onTimeUpdate?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onTimeUpdateCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
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
| `onVolumeChange?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onVolumeChangeCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onWaiting?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onWaitingCapture?` | `ReactEventHandler<HTMLElement> \| undefined` |
| `onWheel?` | `WheelEventHandler<HTMLElement> \| undefined` |
| `onWheelCapture?` | `WheelEventHandler<HTMLElement> \| undefined` |
| `params?` | `Record<string, string \| number \| boolean> \| undefined` |
| `part?` | `string \| undefined` |
| `plural?` | `string \| number \| undefined` |
| `popover?` | `"" \| "auto" \| "manual" \| "hint" \| undefined` |
| `popoverTarget?` | `string \| undefined` |
| `popoverTargetAction?` | `"toggle" \| "show" \| "hide" \| undefined` |
| `prefix?` | `string \| undefined` |
| `property?` | `string \| undefined` |
| `radioGroup?` | `string \| undefined` |
| `rel?` | `string \| undefined` |
| `relativeDate?` | `string \| number \| Date \| undefined` |
| `resource?` | `string \| undefined` |
| `results?` | `number \| undefined` |
| `rev?` | `string \| undefined` |
| `role?` | `AriaRole \| undefined` |
| `security?` | `string \| undefined` |
| `slot?` | `string \| undefined` |
| `spellCheck?` | `Booleanish \| undefined` |
| `style?` | `CSSProperties \| undefined` |
| `suppressContentEditableWarning?` | `boolean \| undefined` |
| `suppressHydrationWarning?` | `boolean \| undefined` |
| `tabIndex?` | `number \| undefined` |
| `tag?` | `keyof JSX.IntrinsicElements \| undefined` |
| `title?` | `string \| undefined` |
| `translate?` | `"yes" \| "no" \| undefined` |
| `typeof?` | `string \| undefined` |
| `unselectable?` | `"off" \| "on" \| undefined` |
| `vocab?` | `string \| undefined` |

</details>

<details>
<summary><code>Locale</code> — 11 members</summary>

| Member | Type |
| --- | --- |
| `[string]` | `unknown` |
| `baseDefault?` | `boolean \| undefined` |
| `baseUrl?` | `string \| undefined` |
| `code` | `string` |
| `dir?` | `"auto" \| "ltr" \| "rtl" \| undefined` |
| `disabled?` | `boolean \| undefined` |
| `displayName?` | `string \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `iso?` | `string \| undefined` |
| `og?` | `string \| undefined` |
| `seo?` | `boolean \| undefined` |

</details>

<code>ModuleOptions</code> — 49 members, identical to [`ModuleOptions`](/api/packages/types).

<details>
<summary><code>ReactI18n</code> — 55 members</summary>

| Member | Type |
| --- | --- |
| `activeKey` | `private any` |
| `activeRootKey` | `private any` |
| `addRouteTranslations` | `(locale: string, routeName: string, translations: Translations, merge?: boolean) => void` |
| `addTranslations` | `(locale: string, translations: Translations, merge?: boolean) => void` |
| `clear` | `() => void` |
| `clearCache` | `() => void` |
| `currentRoute` | `string` |
| `extend` | `<M extends Record<string, unknown>>(methods: M & ThisType<import("../../react/src").ReactI18n & M>) => import("../../react/src").ReactI18n & M` |
| `fallbackKey` | `private any` |
| `fallbackLocale` | `string` |
| `fallbackRootKey` | `private any` |
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
| `lookupLocale` | `private any` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn` | `boolean` |
| `new` | `(options: I18nOptions): ReactI18n` |
| `onTranslationsChanged` | `protected () => void` |
| `pluralFunc` | `PluralFunc` |
| `resolveHas` | `protected (key: TranslationKey, routeContext?: unknown) => boolean` |
| `resolveLookup` | `protected (key: TranslationKey, routeContext?: unknown) => unknown \| null` |
| `resolveRouteName` | `protected (routeContext?: unknown) => string` |
| `resolveTranslations` | `(routeContext?: unknown) => Translations` |
| `resolveTranslationTree` | `protected (lower: Record<string, unknown>, upper: Record<string, unknown>) => Translations` |
| `setRoute` | `(routeName: string) => void` |
| `setTranslation` | `(key: TranslationKey, value: unknown) => void` |
| `storage` | `TranslationStorage` |
| `store` | `private any` |
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

<code>ReactI18nOptions</code> — 9 members, identical to [`PreactI18nOptions`](/api/packages/preact).

<code>Translations</code> — 1 members, identical to [`Translations`](/api/packages/types).

<code>UseI18nOptions</code> — 2 members, identical to [`UseI18nOptions`](/api/packages/preact).

<code>UseI18nReturn</code> — 22 members, identical to [`UseI18nReturn`](/api/packages/preact).

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
