---
url: 'https://s00d.github.io/nuxt-i18n-micro/components/i18n-switcher.md'
description: Dropdown component for switching app locales.
---

# 🌍 `<i18n-switcher>` Component

The `<i18n-switcher>` component in `Nuxt I18n Micro` provides a user-friendly dropdown interface for switching between different locales in your application. This component is highly customizable, allowing seamless integration with your application's design and layout.

Locales with `disabled: true` are **omitted** from the dropdown (they remain available via `$getLocales()` for SEO / head tags). Only switchable locales get `NuxtLink` + `hreflang`.

## ⚙️ Props

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

Every part is unstyled by default: the `custom*Style` props take inline style objects, and
the slots below replace the markup entirely when styling is not enough.

## 🛠️ Example Usages

### Basic Usage

```vue
<template>
  <i18n-switcher />
</template>
```

This renders a locale switcher with default styling and behavior.

### Custom Labels and Inline Styles

```vue
<template>
  <i18n-switcher
    :customLabels="{ en: 'English', fr: 'Français' }"
    :customWrapperStyle="{ backgroundColor: '#f8f9fa', padding: '10px' }"
    :customButtonStyle="{ backgroundColor: '#007bff', color: '#fff', borderRadius: '4px' }"
    :customDropdownStyle="{ border: '1px solid #007bff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }"
    :customItemStyle="{ margin: '5px 0', padding: '5px' }"
    :customLinkStyle="{ padding: '8px 16px', color: '#333', textDecoration: 'none' }"
    :customActiveLinkStyle="{ color: 'green', fontWeight: 'bold', backgroundColor: '#f0f0f0' }"
    :customIconStyle="{ fontSize: '20px', color: '#007bff' }"
  />
</template>
```

This example demonstrates a fully customized locale switcher with custom labels and inline styles.

## 🔌 Slots

Every visual part of the switcher can be replaced. The slots are listed with the props
table above; each one takes template content:

```vue
<i18n-switcher>
  <template #before-button>
    <span>🌐</span>
  </template>

  <template #before-item="{ locale }">
    <img :src="`/flags/${locale.code}.svg`" :alt="locale.code">
  </template>

  <template #after-dropdown-items>
    <a href="/help/languages">Missing a language?</a>
  </template>
</i18n-switcher>
```

Slots whose name ends in `-item`, `-link-content` or starts with `before-item` receive the
`locale` object they belong to.

## 🎨 Styles Overview

The `<i18n-switcher>` component comes with basic styles defined using inline styles that can easily be overridden by passing custom styles via props. Here’s a brief overview of the default styling:

* **Wrapper**: Controls the positioning of the dropdown.
* **Button**: Styles the dropdown toggle button.
* **Dropdown**: Styles the dropdown list.
* **Items**: Styles each item in the list.
* **Links**: Styles the links inside each item.
* **Icon**: Styles the dropdown indicator icon.

You can customize these styles by passing custom styles through the respective props, ensuring that the locale switcher integrates seamlessly into your application's UI.
