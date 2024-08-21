---
outline: deep
---

# 🌍 `<i18n-switcher>` Component

The `<i18n-switcher>` component in `Nuxt I18n Micro` provides a user-friendly dropdown interface for switching between different locales in your application. This component is highly customizable, allowing seamless integration with your application's design and layout.

## ⚙️ Props

### `wrapperClass`

- **Type**: `string`
- **Default**: `'locale-switcher'`
- **Description**: Defines the CSS class applied to the wrapper `<div>` that contains the locale switcher.
- **Example**:
  ```vue
  <i18n-switcher wrapperClass="my-custom-wrapper"></i18n-switcher>
  ```

### `buttonClass`

- **Type**: `string`
- **Default**: `'locale-button'`
- **Description**: Specifies the CSS class applied to the button element that toggles the dropdown menu.
- **Example**:
  ```vue
  <i18n-switcher buttonClass="my-custom-button"></i18n-switcher>
  ```

### `dropdownClass`

- **Type**: `string`
- **Default**: `'locale-dropdown'`
- **Description**: Sets the CSS class for the `<ul>` element that contains the list of locales.
- **Example**:
  ```vue
  <i18n-switcher dropdownClass="my-custom-dropdown"></i18n-switcher>
  ```

### `itemClass`

- **Type**: `string`
- **Default**: `'locale-item'`
- **Description**: Applies a CSS class to each `<li>` element representing a locale option.
- **Example**:
  ```vue
  <i18n-switcher itemClass="my-custom-item"></i18n-switcher>
  ```

### `linkClass`

- **Type**: `string`
- **Default**: `'locale-link'`
- **Description**: Specifies the CSS class applied to the `<NuxtLink>` elements used to switch between locales.
- **Example**:
  ```vue
  <i18n-switcher linkClass="my-custom-link"></i18n-switcher>
  ```

### `activeClass`

- **Type**: `string`
- **Default**: `'active'`
- **Description**: Sets the CSS class for the currently active locale, usually to highlight or indicate the selected option.
- **Example**:
  ```vue
  <i18n-switcher activeClass="my-active-class"></i18n-switcher>
  ```

### `disabledClass`

- **Type**: `string`
- **Default**: `'disabled'`
- **Description**: Applies a CSS class to disable the link for the current locale, preventing users from selecting it.
- **Example**:
  ```vue
  <i18n-switcher disabledClass="my-disabled-class"></i18n-switcher>
  ```

### `iconClass`

- **Type**: `string`
- **Default**: `'dropdown-icon'`
- **Description**: Defines the CSS class for the icon that indicates the dropdown state, flipping when the dropdown is opened or closed.
- **Example**:
  ```vue
  <i18n-switcher iconClass="my-icon-class"></i18n-switcher>
  ```

### `customLabels`

- **Type**: `Record<string, string>`
- **Default**: `{}`
- **Description**: Allows you to define custom labels for each locale, which will be displayed instead of the locale codes.
- **Example**:
  ```vue
  <i18n-switcher :customLabels="{ en: 'English', fr: 'Français' }"></i18n-switcher>
  ```

## 🛠️ Example Usages

### Basic Usage

```vue
<i18n-switcher></i18n-switcher>
```

This renders a locale switcher with default styling and behavior.

### Custom Labels and Styling

```vue
<i18n-switcher
  wrapperClass="custom-wrapper"
  buttonClass="custom-button"
  dropdownClass="custom-dropdown"
  itemClass="custom-item"
  linkClass="custom-link"
  activeClass="custom-active"
  disabledClass="custom-disabled"
  iconClass="custom-icon"
  :customLabels="{ en: 'English', fr: 'Français' }"
/>
```

This example demonstrates a fully customized locale switcher with custom labels and CSS classes.

## 🎨 Styles Overview

The `<i18n-switcher>` component comes with basic styles that can easily be overridden by passing custom classes via props. Here’s a brief overview of the default styling:

- **Wrapper**: `.locale-switcher` — Controls the positioning of the dropdown.
- **Button**: `.locale-button` — Styles the dropdown toggle button.
- **Dropdown**: `.locale-dropdown` — Styles the dropdown list.
- **Items**: `.locale-item` — Styles each item in the list.
- **Links**: `.locale-link` — Styles the links inside each item.
- **Icon**: `.dropdown-icon` — Styles the dropdown indicator icon.

You can customize these classes to match your design requirements, ensuring that the locale switcher integrates seamlessly into your application's UI.
