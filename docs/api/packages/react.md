---
title: '@i18n-micro/react'
description: 'Exported API of @i18n-micro/react, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/react`

91 exports across 4 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/contributing/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/react`

```ts
import { /* … */ } from '@i18n-micro/react'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `CleanTranslation` | type | `string \| number \| boolean \| Translations \| PluralTranslations \| null` |
| `createI18n` | function | `(options: I18nOptions) => I18n` |
| `defaultPlural` | const | `PluralFunc` |
| `FormatService` | class | 21 members |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `I18nConfig` | interface | 5 members |
| `I18nConfigContext` | const | `import("react").Context<I18nConfig \| null>` |
| `I18nContext` | const | `import("react").Context<I18n \| null>` |
| `I18nGroup` | const | `(props: I18nGroupProps) => HostElement` |
| `I18nGroupProps` | interface | 279 members |
| `I18nLink` | const | `(props: I18nLinkProps) => HostElement` |
| `I18nLinkProps` | type | `HostAnchorAttrs<HTMLAnchorElement> & { to: RouteTarget; activeStyle?: HostStyle; localeRoute?: (to: RouteTarget, locale?: string) => RouteTarget; children?: HostNode; }` |
| `I18nProvider` | function | `({ i18n, locales, defaultLocale, routingStrategy, children, ...options }: I18nProviderProps) => HostElement` |
| `I18nProviderProps` | interface | 18 members |
| `I18nRoutingStrategy` | interface | 6 members |
| `I18nSwitcher` | const | `(props: I18nSwitcherProps) => HostElement` |
| `I18nSwitcherProps` | interface | 292 members |
| `I18nT` | const | `(props: I18nTProps) => HostElement` |
| `I18nTComponent` | type | `HostNode \| (() => HostNode)` |
| `I18nTProps` | interface | 289 members |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `Locale` | interface | 11 members |
| `LocaleCode` | type | `string` |
| `ModuleOptions` | interface | 51 members |
| `Params` | type | `Record<string, string \| number \| boolean>` |
| `PluralFunc` | type | `(key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string \| null` |
| `ReactI18n` | class | 63 members |
| `ReactI18nOptions` | interface | 13 members |
| `RouteTarget` | type | `string \| { path?: string; }` |
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

<code>I18nConfig</code> — 5 members, identical to [`I18nConfig`](/api/packages/preact).

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
| `children?` | `import("react").ReactNode \| ((props: { prefix: string; t: (key: string, params?: Record<string, string \| number \| boolean>) => string; }) => HostNode)` |
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
<summary><code>I18nProviderProps</code> — 18 members</summary>

| Member | Type |
| --- | --- |
| `children?` | `import("react").ReactNode` |
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
| `customActiveLinkStyle?` | `import("react").CSSProperties \| undefined` |
| `customButtonStyle?` | `import("react").CSSProperties \| undefined` |
| `customDisabledLinkStyle?` | `import("react").CSSProperties \| undefined` |
| `customDropdownStyle?` | `import("react").CSSProperties \| undefined` |
| `customIconStyle?` | `import("react").CSSProperties \| undefined` |
| `customItemStyle?` | `import("react").CSSProperties \| undefined` |
| `customLabels?` | `Record<string, string> \| undefined` |
| `customLinkStyle?` | `import("react").CSSProperties \| undefined` |
| `customWrapperStyle?` | `import("react").CSSProperties \| undefined` |
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
| `localeRoute?` | `((to: RouteTarget, locale?: string) => RouteTarget) \| undefined` |
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
<summary><code>I18nTProps</code> — 289 members</summary>

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
| `children?` | `import("react").ReactNode \| ((props: { translation: string; }) => HostNode)` |
| `className?` | `string \| undefined` |
| `color?` | `string \| undefined` |
| `components?` | `Record<string, I18nTComponent> \| undefined` |
| `content?` | `string \| undefined` |
| `contentEditable?` | `Booleanish \| "inherit" \| "plaintext-only" \| undefined` |
| `contextMenu?` | `string \| undefined` |
| `customPluralRule?` | `PluralFunc \| null \| undefined` |
| `dangerouslySetInnerHTML?` | `{ __html: string \| TrustedHTML; } \| undefined` |
| `datatype?` | `string \| undefined` |
| `date?` | `string \| number \| Date \| null \| undefined` |
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
| `number?` | `string \| number \| null \| undefined` |
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
| `params?` | `Params \| undefined` |
| `part?` | `string \| undefined` |
| `plural?` | `string \| number \| null \| undefined` |
| `popover?` | `"" \| "auto" \| "manual" \| "hint" \| undefined` |
| `popoverTarget?` | `string \| undefined` |
| `popoverTargetAction?` | `"toggle" \| "show" \| "hide" \| undefined` |
| `prefix?` | `string \| undefined` |
| `property?` | `string \| undefined` |
| `radioGroup?` | `string \| undefined` |
| `rel?` | `string \| undefined` |
| `relativeDate?` | `string \| number \| Date \| null \| undefined` |
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
| `tag?` | `keyof import("react").JSX.IntrinsicElements \| undefined` |
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

<code>ModuleOptions</code> — 51 members, identical to [`ModuleOptions`](/api/packages/types).

<code>ReactI18n</code> — 63 members, identical to [`PreactI18n`](/api/packages/preact).

<code>ReactI18nOptions</code> — 13 members, identical to [`PreactI18nOptions`](/api/packages/preact).

<code>Translations</code> — 1 members, identical to [`Translations`](/api/packages/types).

<code>UseI18nOptions</code> — 2 members, identical to [`UseI18nOptions`](/api/packages/preact).

<code>UseI18nReturn</code> — 22 members, identical to [`UseI18nReturn`](/api/packages/preact).
## `@i18n-micro/react/client`

```ts
import { /* … */ } from '@i18n-micro/react/client'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `CleanTranslation` | type | `string \| number \| boolean \| Translations \| PluralTranslations \| null` |
| `createI18n` | function | `(options: I18nOptions) => I18n` |
| `defaultPlural` | const | `PluralFunc` |
| `FormatService` | class | 21 members |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `I18nConfig` | interface | 5 members |
| `I18nConfigContext` | const | `import("react").Context<I18nConfig \| null>` |
| `I18nContext` | const | `import("react").Context<I18n \| null>` |
| `I18nGroup` | const | `(props: I18nGroupProps) => HostElement` |
| `I18nGroupProps` | interface | 279 members |
| `I18nLink` | const | `(props: I18nLinkProps) => HostElement` |
| `I18nLinkProps` | type | `HostAnchorAttrs<HTMLAnchorElement> & { to: RouteTarget; activeStyle?: HostStyle; localeRoute?: (to: RouteTarget, locale?: string) => RouteTarget; children?: HostNode; }` |
| `I18nProvider` | function | `({ i18n, locales, defaultLocale, routingStrategy, children, ...options }: I18nProviderProps) => HostElement` |
| `I18nProviderProps` | interface | 18 members |
| `I18nRoutingStrategy` | interface | 6 members |
| `I18nSwitcher` | const | `(props: I18nSwitcherProps) => HostElement` |
| `I18nSwitcherProps` | interface | 292 members |
| `I18nT` | const | `(props: I18nTProps) => HostElement` |
| `I18nTComponent` | type | `HostNode \| (() => HostNode)` |
| `I18nTProps` | interface | 289 members |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `Locale` | interface | 11 members |
| `LocaleCode` | type | `string` |
| `ModuleOptions` | interface | 51 members |
| `Params` | type | `Record<string, string \| number \| boolean>` |
| `PluralFunc` | type | `(key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string \| null` |
| `ReactI18n` | class | 63 members |
| `ReactI18nOptions` | interface | 13 members |
| `RouteTarget` | type | `string \| { path?: string; }` |
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

<code>I18nConfig</code> — 5 members, identical to [`I18nConfig`](/api/packages/preact).

<code>I18nGroupProps</code> — 279 members, identical to `I18nGroupProps` above.

<code>I18nProviderProps</code> — 18 members, identical to `I18nProviderProps` above.

<code>I18nRoutingStrategy</code> — 6 members, identical to [`I18nRoutingStrategy`](/api/packages/preact).

<code>I18nSwitcherProps</code> — 292 members, identical to `I18nSwitcherProps` above.

<code>I18nTProps</code> — 289 members, identical to `I18nTProps` above.

<code>Locale</code> — 11 members, identical to `Locale` above.

<code>ModuleOptions</code> — 51 members, identical to [`ModuleOptions`](/api/packages/types).

<code>ReactI18n</code> — 63 members, identical to [`PreactI18n`](/api/packages/preact).

<code>ReactI18nOptions</code> — 13 members, identical to [`PreactI18nOptions`](/api/packages/preact).

<code>Translations</code> — 1 members, identical to [`Translations`](/api/packages/types).

<code>UseI18nOptions</code> — 2 members, identical to [`UseI18nOptions`](/api/packages/preact).

<code>UseI18nReturn</code> — 22 members, identical to [`UseI18nReturn`](/api/packages/preact).
## `@i18n-micro/react/router`

```ts
import { /* … */ } from '@i18n-micro/react/router'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `createReactRouterAdapter` | function | `(locales: Locale[], defaultLocale: string, location: ReturnType<typeof useLocation>, navigate: ReturnType<typeof useNavigate>) => I18nRoutingStrategy` |
| `I18nRoutingStrategy` | interface | 6 members |

<code>I18nRoutingStrategy</code> — 6 members, identical to [`I18nRoutingStrategy`](/api/packages/preact).
## `@i18n-micro/react/server`

```ts
import { /* … */ } from '@i18n-micro/react/server'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `createI18n` | function | `(options: I18nOptions) => I18n` |
| `defaultPlural` | const | `PluralFunc` |
| `FormatService` | class | 21 members |
| `I18nT` | const | `({ i18n, ...props }: ServerI18nTProps) => HostElement` |
| `I18nTComponent` | type | `HostNode \| (() => HostNode)` |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `ReactI18n` | class | 63 members |
| `ReactI18nOptions` | interface | 13 members |
| `ServerI18nTProps` | interface | 290 members |

<code>FormatService</code> — 21 members, identical to [`FormatService`](/api/packages/astro).

<code>ReactI18n</code> — 63 members, identical to [`PreactI18n`](/api/packages/preact).

<code>ReactI18nOptions</code> — 13 members, identical to [`PreactI18nOptions`](/api/packages/preact).

<details>
<summary><code>ServerI18nTProps</code> — 290 members</summary>

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
| `children?` | `import("react").ReactNode \| ((props: { translation: string; }) => HostNode)` |
| `className?` | `string \| undefined` |
| `color?` | `string \| undefined` |
| `components?` | `Record<string, I18nTComponent> \| undefined` |
| `content?` | `string \| undefined` |
| `contentEditable?` | `Booleanish \| "inherit" \| "plaintext-only" \| undefined` |
| `contextMenu?` | `string \| undefined` |
| `customPluralRule?` | `PluralFunc \| null \| undefined` |
| `dangerouslySetInnerHTML?` | `{ __html: string \| TrustedHTML; } \| undefined` |
| `datatype?` | `string \| undefined` |
| `date?` | `string \| number \| Date \| null \| undefined` |
| `defaultChecked?` | `boolean \| undefined` |
| `defaultValue?` | `string \| undefined` |
| `dir?` | `string \| undefined` |
| `draggable?` | `Booleanish \| undefined` |
| `enterKeyHint?` | `"enter" \| "done" \| "go" \| "next" \| "previous" \| "search" \| "send" \| undefined` |
| `exportparts?` | `string \| undefined` |
| `hidden?` | `boolean \| undefined` |
| `hideIfEmpty?` | `boolean \| undefined` |
| `html?` | `boolean \| undefined` |
| `i18n` | `I18n` |
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
| `number?` | `string \| number \| null \| undefined` |
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
| `params?` | `Params \| undefined` |
| `part?` | `string \| undefined` |
| `plural?` | `string \| number \| null \| undefined` |
| `popover?` | `"" \| "auto" \| "manual" \| "hint" \| undefined` |
| `popoverTarget?` | `string \| undefined` |
| `popoverTargetAction?` | `"toggle" \| "show" \| "hide" \| undefined` |
| `prefix?` | `string \| undefined` |
| `property?` | `string \| undefined` |
| `radioGroup?` | `string \| undefined` |
| `rel?` | `string \| undefined` |
| `relativeDate?` | `string \| number \| Date \| null \| undefined` |
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
| `tag?` | `keyof import("react").JSX.IntrinsicElements \| undefined` |
| `title?` | `string \| undefined` |
| `translate?` | `"yes" \| "no" \| undefined` |
| `typeof?` | `string \| undefined` |
| `unselectable?` | `"off" \| "on" \| undefined` |
| `vocab?` | `string \| undefined` |

</details>

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
