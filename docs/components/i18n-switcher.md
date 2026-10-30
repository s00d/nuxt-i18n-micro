---
title: '<i18n-switcher>'
description: 'The <i18n-switcher> component is a dropdown of the enabled locales, each linking to the current page in that locale.'
outline: [2, 3]
---

# `<i18n-switcher>`

`<i18n-switcher>` renders a button with the active locale and a dropdown of all enabled locales, including the active one. Use it for a ready-made language menu; build your own from [`$getLocales`](/api/methods#getlocales) and [`$switchLocalePath`](/api/methods#switchlocalepath) when you need different markup. Each entry links to the current page in that locale.

## Props and slots

<!-- generated:component:i18n-switcher — do not edit; run `pnpm run docs:generate` -->

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `customLabels` | `Record<string, string>` | `() => ({})` | Display name per locale code, overriding the `displayName` from the locale config. |
| `customWrapperStyle` | `CSSProperties` | `() => ({})` | Inline style for the outer wrapper. |
| `customButtonStyle` | `CSSProperties` | `() => ({})` | Inline style for the button that opens the dropdown. |
| `customDropdownStyle` | `CSSProperties` | `() => ({})` | Inline style for the dropdown panel. |
| `customItemStyle` | `CSSProperties` | `() => ({})` | Inline style for each item in the dropdown. |
| `customLinkStyle` | `CSSProperties` | `() => ({})` | Inline style for the link inside an item. |
| `customActiveLinkStyle` | `CSSProperties` | `() => ({})` | Inline style for the link of the currently active locale. |
| `customDisabledLinkStyle` | `CSSProperties` | `() => ({})` | Inline style for the *current* locale button when it is `disabled: true` in config. |
| `customIconStyle` | `CSSProperties` | `() => ({})` | Inline style for the caret icon on the button. |

### Slots

| Slot | Bindings | Description |
| --- | --- | --- |
| `before-button` | — | Content before the button that opens the dropdown. |
| `before-selected-locale` | — | Content before the active locale label inside the button. |
| `after-selected-locale` | — | Content after the active locale label inside the button. |
| `before-dropdown` | — | Content between the button and the dropdown panel. |
| `before-dropdown-items` | — | Content at the top of the dropdown, above the locale list. |
| `before-item` | `locale` | Content before each locale entry. |
| `before-link-content` | `locale` | Content before a locale's label inside its link. |
| `after-link-content` | `locale` | Content after a locale's label inside its link. |
| `after-item` | `locale` | Content after each locale entry. |
| `after-dropdown-items` | — | Content at the bottom of the dropdown, below the locale list. |
| `after-dropdown` | — | Content after the dropdown panel. |

<!-- /generated:component:i18n-switcher -->

## Behaviour

- Lists every locale without `disabled: true`, the active one included.
- Each entry is a `NuxtLink` to `$switchLocaleRoute(code)` with `hreflang = iso || code` and class `switcher-locale-<code>`; a click also calls `$switchLocale(code)` and closes the dropdown.
- Label: `customLabels[code]`, then the locale's `displayName`, then the code (with a dev warning).
- Styles: small inline defaults (bordered white button and panel, the active entry bold and blue). Each `custom*Style` prop is applied after the default of its part. The button has class `language-switcher`.

## Example

```vue
<template>
  <i18n-switcher
    :custom-labels="{ en: 'English', de: 'Deutsch' }"
    :custom-button-style="{ borderRadius: '4px' }"
  >
    <template #before-link-content="{ locale }">
      <img :src="`/flags/${locale.code}.svg`" alt="" width="16" />
    </template>
  </i18n-switcher>
</template>
```

## Related

- [`$switchLocale`](/api/methods#switchlocale)
- [`<i18n-link>`](/components/i18n-link)
