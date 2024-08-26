---
outline: deep
---
Here’s the updated documentation for the `<i18n-switcher>` component, reflecting the transition to using inline styles with support for dynamic customization through props:

---

# 🌍 `<i18n-switcher>` Component

The `<i18n-switcher>` component in `Nuxt I18n Micro` provides a user-friendly dropdown interface for switching between different locales in your application. This component is highly customizable, allowing seamless integration with your application's design and layout.

## ⚙️ Props

### `customLabels`

- **Type**: `Record<string, string>`
- **Default**: `{}`
- **Description**: Allows you to define custom labels for each locale, which will be displayed instead of the locale codes.
- **Example**:
  ```vue
  <i18n-switcher :customLabels="{ en: 'English', fr: 'Français' }"></i18n-switcher>
  ```

### `customWrapperStyle`

- **Type**: `CSSProperties`
- **Default**: `{}`
- **Description**: Allows you to override the default styles applied to the wrapper `<div>` that contains the locale switcher.
- **Example**:
  ```vue
  <i18n-switcher :customWrapperStyle="{ backgroundColor: '#f8f9fa', padding: '10px' }"></i18n-switcher>
  ```

### `customButtonStyle`

- **Type**: `CSSProperties`
- **Default**: `{}`
- **Description**: Allows you to customize the styles applied to the button element that toggles the dropdown menu.
- **Example**:
  ```vue
  <i18n-switcher :customButtonStyle="{ backgroundColor: '#007bff', color: '#fff', borderRadius: '4px' }"></i18n-switcher>
  ```

### `customDropdownStyle`

- **Type**: `CSSProperties`
- **Default**: `{}`
- **Description**: Sets the custom styles for the `<ul>` element that contains the list of locales.
- **Example**:
  ```vue
  <i18n-switcher :customDropdownStyle="{ border: '1px solid #007bff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }"></i18n-switcher>
  ```

### `customItemStyle`

- **Type**: `CSSProperties`
- **Default**: `{}`
- **Description**: Applies custom styles to each `<li>` element representing a locale option.
- **Example**:
  ```vue
  <i18n-switcher :customItemStyle="{ margin: '5px 0', padding: '5px' }"></i18n-switcher>
  ```

### `customLinkStyle`

- **Type**: `CSSProperties`
- **Default**: `{}`
- **Description**: Allows you to customize the styles applied to the `<NuxtLink>` elements used to switch between locales.
- **Example**:
  ```vue
  <i18n-switcher :customLinkStyle="{ padding: '8px 16px', color: '#333', textDecoration: 'none' }"></i18n-switcher>
  ```

### `customActiveLinkStyle`

- **Type**: `CSSProperties`
- **Default**: `{}`
- **Description**: Sets the custom styles for the currently active locale, usually to highlight or indicate the selected option.
- **Example**:
  ```vue
  <i18n-switcher :customActiveLinkStyle="{ color: 'green', fontWeight: 'bold', backgroundColor: '#f0f0f0' }"></i18n-switcher>
  ```

### `customDisabledLinkStyle`

- **Type**: `CSSProperties`
- **Default**: `{}`
- **Description**: Applies custom styles to disable the link for the current locale, preventing users from selecting it.
- **Example**:
  ```vue
  <i18n-switcher :customDisabledLinkStyle="{ color: 'gray', cursor: 'not-allowed' }"></i18n-switcher>
  ```

### `customIconStyle`

- **Type**: `CSSProperties`
- **Default**: `{}`
- **Description**: Defines custom styles for the icon that indicates the dropdown state, such as rotating the icon when the dropdown is opened or closed.
- **Example**:
  ```vue
  <i18n-switcher :customIconStyle="{ fontSize: '20px', color: '#007bff' }"></i18n-switcher>
  ```

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
    :customDisabledLinkStyle="{ color: 'gray', cursor: 'not-allowed' }"
    :customIconStyle="{ fontSize: '20px', color: '#007bff' }"
  />
</template>
```

This example demonstrates a fully customized locale switcher with custom labels and inline styles.

## 🎨 Styles Overview

The `<i18n-switcher>` component comes with basic styles defined using inline styles that can easily be overridden by passing custom styles via props. Here’s a brief overview of the default styling:

- **Wrapper**: Controls the positioning of the dropdown.
- **Button**: Styles the dropdown toggle button.
- **Dropdown**: Styles the dropdown list.
- **Items**: Styles each item in the list.
- **Links**: Styles the links inside each item.
- **Icon**: Styles the dropdown indicator icon.

You can customize these styles by passing custom styles through the respective props, ensuring that the locale switcher integrates seamlessly into your application's UI.
