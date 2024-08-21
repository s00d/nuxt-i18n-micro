---
outline: deep
---

# `<i18n-switcher>` Component

The `<i18n-switcher>` component in `Nuxt I18n Micro` provides a dropdown interface for switching between different locales in your application. This component is highly customizable and allows for seamless integration with your application's existing design.

### Props

#### `wrapperClass` (`string`, optional, default: `'locale-switcher'`)
The `wrapperClass` prop defines the CSS class applied to the wrapper `<div>` that contains the locale switcher.

- **Type**: `string`
- **Optional**: Yes
- **Default**: `'locale-switcher'`
- **Example**:
```vue
<i18n-switcher wrapperClass="my-custom-wrapper"></i18n-switcher>
```

#### `buttonClass` (`string`, optional, default: `'locale-button'`)
The `buttonClass` prop specifies the CSS class applied to the button element that toggles the dropdown menu.

- **Type**: `string`
- **Optional**: Yes
- **Default**: `'locale-button'`
- **Example**:
```vue
<i18n-switcher buttonClass="my-custom-button"></i18n-switcher>
```

#### `dropdownClass` (`string`, optional, default: `'locale-dropdown'`)
The `dropdownClass` prop sets the CSS class for the `<ul>` element that contains the list of locales.

- **Type**: `string`
- **Optional**: Yes
- **Default**: `'locale-dropdown'`
- **Example**:
```vue
<i18n-switcher dropdownClass="my-custom-dropdown"></i18n-switcher>
```

#### `itemClass` (`string`, optional, default: `'locale-item'`)
The `itemClass` prop applies a CSS class to each `<li>` element representing a locale option.

- **Type**: `string`
- **Optional**: Yes
- **Default**: `'locale-item'`
- **Example**:
```vue
<i18n-switcher itemClass="my-custom-item"></i18n-switcher>
```

#### `linkClass` (`string`, optional, default: `'locale-link'`)
The `linkClass` prop specifies the CSS class applied to the `<NuxtLink>` elements used to switch between locales.

- **Type**: `string`
- **Optional**: Yes
- **Default**: `'locale-link'`
- **Example**:
```vue
<i18n-switcher linkClass="my-custom-link"></i18n-switcher>
```

#### `activeClass` (`string`, optional, default: `'active'`)
The `activeClass` prop sets the CSS class for the currently active locale, usually to highlight or indicate the selected option.

- **Type**: `string`
- **Optional**: Yes
- **Default**: `'active'`
- **Example**:
```vue
<i18n-switcher activeClass="my-active-class"></i18n-switcher>
```

#### `disabledClass` (`string`, optional, default: `'disabled'`)
The `disabledClass` prop applies a CSS class to disable the link for the current locale, preventing users from selecting it.

- **Type**: `string`
- **Optional**: Yes
- **Default**: `'disabled'`
- **Example**:
```vue
<i18n-switcher disabledClass="my-disabled-class"></i18n-switcher>
```

#### `iconClass` (`string`, optional, default: `'dropdown-icon'`)
The `iconClass` prop defines the CSS class for the icon that indicates the dropdown state, flipping when the dropdown is opened or closed.

- **Type**: `string`
- **Optional**: Yes
- **Default**: `'dropdown-icon'`
- **Example**:
```vue
<i18n-switcher iconClass="my-icon-class"></i18n-switcher>
```

#### `customLabels` (`Record<string, string>`, optional)
The `customLabels` prop allows you to define custom labels for each locale, which will be displayed instead of the locale codes.

- **Type**: `Record<string, string>`
- **Optional**: Yes
- **Default**: `{}`
- **Example**:
```vue
<i18n-switcher :customLabels="{ en: 'English', fr: 'Français' }"></i18n-switcher>
```

### Example Usages

#### Basic Usage

```vue
<i18n-switcher></i18n-switcher>
```
This will render a locale switcher with default styling and behavior.

#### Custom Labels and Styling

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

### Styles

The component comes with basic styles that can be easily overridden by passing custom classes via props. Here’s a brief overview:

- **Wrapper**: `locale-switcher` (controls the positioning of the dropdown)
- **Button**: `locale-button` (styles the dropdown toggle button)
- **Dropdown**: `locale-dropdown` (styles the dropdown list)
- **Items**: `locale-item` (styles each item in the list)
- **Links**: `locale-link` (styles the links inside each item)
- **Icon**: `dropdown-icon` (styles the dropdown indicator icon)

You can customize these classes to match your design requirements.
