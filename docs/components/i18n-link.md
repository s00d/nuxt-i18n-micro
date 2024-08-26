---
outline: deep
---

# 🌍 `<i18n-link>` Component

The `<i18n-link>` component in `Nuxt I18n Micro` is a versatile link component that automatically localizes routes based on the current locale. It acts as a wrapper around the `<NuxtLink>` component, providing additional features such as active link styling and support for external links.

## ⚙️ Props

### `to`

- **Type**: `NuxtLinkProps | string`
- **Required**: Yes
- **Description**: Defines the target route or path for the link. It can be a string (for simple paths) or an object containing route information.
- **Example**:
  ```vue
  <i18n-link to="/about">About Us</i18n-link>
  <i18n-link :to="{ name: 'index' }">Home</i18n-link>
  ```

### `activeStyle`

- **Type**: `Partial<CSSStyleDeclaration>`
- **Optional**: Yes
- **Description**: Allows you to customize the inline styles applied to the link when it matches the current route. This can be useful for highlighting the active link in navigation menus without relying on CSS classes.
- **Example**:
  ```vue
  <i18n-link to="/about" :activeStyle="{ fontWeight: 'bold', color: 'red' }">About Us</i18n-link>
  ```

## 🛠️ Example Usages

### Basic Usage

```vue
<i18n-link to="/about">About Us</i18n-link>
```

This example creates a link to the `/about` page, localized to the current locale.

### Active Link Styling with Inline Styles

```vue
<i18n-link to="/about" :activeStyle="{ fontWeight: 'bold' }">About Us</i18n-link>
```

The link will have bold text when the user is on the `/about` page, allowing you to style the active link directly with inline styles.

### External Links Handling

The component automatically detects external links and adds the necessary attributes for security.

```vue
<i18n-link to="https://example.com">Visit Example</i18n-link>
```

This link will open `https://example.com` in a new tab with `rel="noopener noreferrer"` applied.

## 🎨 Styles

The component now uses inline styles for the active state instead of a class. You can customize these styles using the `activeStyle` prop.

### Default Active Styles

- **Font Weight**: `bold`
- **Color**: Inherits the browser's default color (if no `color` is specified in `activeStyle`).

You can override these by providing custom styles through the `activeStyle` prop.

### Custom Active Styles

```vue
<i18n-link to="/about" :activeStyle="{ fontWeight: 'bold', color: '#42b983' }">About Us</i18n-link>
```

In this example, the link will be bold and green when active.

## 🚀 Additional Features

### Slot for Custom Content

You can pass custom content inside the link using slots, making the component flexible for different use cases.

```vue
<i18n-link to="/about">
  <span>About Us</span>
</i18n-link>
```

### Accessibility Enhancements

The component supports `aria-label` and other accessibility attributes to ensure a more accessible experience.

```vue
<i18n-link to="/about" aria-label="Learn more about us">
  About Us
</i18n-link>
```
