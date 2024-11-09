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

## 🔌 Slots

The `<i18n-switcher>` component provides several slots that allow you to insert custom content at various points within the component. These slots enhance the flexibility and customization of the switcher, enabling you to tailor it to your application's specific needs.

### `before-button`

- **Description**: Inserts content immediately before the language switcher button.
- **Usage Example**:
  ```vue
  <i18n-switcher>
    <template #before-button>
      <span>🌐</span>
    </template>
  </i18n-switcher>
  ```

### `before-selected-locale`

- **Description**: Inserts content before the currently selected locale label within the button.
- **Usage Example**:
  ```vue
  <i18n-switcher>
    <template #before-selected-locale>
      <i class="icon-flag"></i>
    </template>
  </i18n-switcher>
  ```

### `after-selected-locale`

- **Description**: Inserts content after the currently selected locale label within the button.
- **Usage Example**:
  ```vue
  <i18n-switcher>
    <template #after-selected-locale>
      <i class="icon-caret"></i>
    </template>
  </i18n-switcher>
  ```

### `before-dropdown`

- **Description**: Inserts content immediately before the dropdown menu.
- **Usage Example**:
  ```vue
  <i18n-switcher>
    <template #before-dropdown>
      <li class="dropdown-header">Select Language</li>
    </template>
  </i18n-switcher>
  ```

### `after-dropdown`

- **Description**: Inserts content immediately after the dropdown menu.
- **Usage Example**:
  ```vue
  <i18n-switcher>
    <template #after-dropdown>
      <li class="dropdown-footer">Powered by Nuxt</li>
    </template>
  </i18n-switcher>
  ```

### `before-dropdown-items`

- **Description**: Inserts content before the list of locale items within the dropdown.
- **Usage Example**:
  ```vue
  <i18n-switcher>
    <template #before-dropdown-items>
      <li class="divider"></li>
    </template>
  </i18n-switcher>
  ```

### `after-dropdown-items`

- **Description**: Inserts content after the list of locale items within the dropdown.
- **Usage Example**:
  ```vue
  <i18n-switcher>
    <template #after-dropdown-items>
      <li class="divider"></li>
    </template>
  </i18n-switcher>
  ```

### `before-item`

- **Description**: Inserts content before each locale item. Receives the locale as a slot prop.
- **Props**: `locale` (Locale object)
- **Usage Example**:
  ```vue
  <i18n-switcher>
    <template #before-item="{ locale }">
      <i :class="`flag-${locale.code}`"></i>
    </template>
  </i18n-switcher>
  ```

### `after-item`

- **Description**: Inserts content after each locale item. Receives the locale as a slot prop.
- **Props**: `locale` (Locale object)
- **Usage Example**:
  ```vue
  <i18n-switcher>
    <template #after-item="{ locale }">
      <span>{{ locale.code }}</span>
    </template>
  </i18n-switcher>
  ```

### `before-link-content`

- **Description**: Inserts content before the locale label inside each link. Receives the locale as a slot prop.
- **Props**: `locale` (Locale object)
- **Usage Example**:
  ```vue
  <i18n-switcher>
    <template #before-link-content="{ locale }">
      <i :class="`icon-${locale.code}`"></i>
    </template>
  </i18n-switcher>
  ```

### `after-link-content`

- **Description**: Inserts content after the locale label inside each link. Receives the locale as a slot prop.
- **Props**: `locale` (Locale object)
- **Usage Example**:
  ```vue
  <i18n-switcher>
    <template #after-link-content="{ locale }">
      <span>({{ locale.code }})</span>
    </template>
  </i18n-switcher>
  ```

### Summary of Slots

| Slot Name                | Description                                                 | Props    |
|--------------------------|-------------------------------------------------------------|----------|
| `before-button`          | Content before the language switcher button                 | None     |
| `before-selected-locale` | Content before the selected locale label within the button  | None     |
| `after-selected-locale`  | Content after the selected locale label within the button   | None     |
| `before-dropdown`        | Content before the dropdown menu                            | None     |
| `after-dropdown`         | Content after the dropdown menu                             | None     |
| `before-dropdown-items`  | Content before the list of locale items within the dropdown | None     |
| `after-dropdown-items`   | Content after the list of locale items within the dropdown  | None     |
| `before-item`            | Content before each locale item                             | `locale` |
| `after-item`             | Content after each locale item                              | `locale` |
| `before-link-content`    | Content before the locale label inside each link            | `locale` |
| `after-link-content`     | Content after the locale label inside each link             | `locale` |


## 🎨 Styles Overview

The `<i18n-switcher>` component comes with basic styles defined using inline styles that can easily be overridden by passing custom styles via props. Here’s a brief overview of the default styling:

- **Wrapper**: Controls the positioning of the dropdown.
- **Button**: Styles the dropdown toggle button.
- **Dropdown**: Styles the dropdown list.
- **Items**: Styles each item in the list.
- **Links**: Styles the links inside each item.
- **Icon**: Styles the dropdown indicator icon.

You can customize these styles by passing custom styles through the respective props, ensuring that the locale switcher integrates seamlessly into your application's UI.
