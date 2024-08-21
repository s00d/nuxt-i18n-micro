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

### `activeClass`

- **Type**: `string`
- **Optional**: Yes
- **Default**: `'active'`
- **Description**: Specifies the CSS class applied when the link matches the current route. This is useful for highlighting the active link in navigation menus.
- **Example**:
  ```vue
  <i18n-link to="/about" activeClass="current">About Us</i18n-link>
  ```

## 🛠️ Example Usages

### Basic Usage

```vue
<i18n-link to="/about">About Us</i18n-link>
```

This example creates a link to the `/about` page, localized to the current locale.

### Active Link Styling

```vue
<i18n-link to="/about" activeClass="current">About Us</i18n-link>
```

The link will have the `current` class applied when the user is on the `/about` page, allowing you to style the active link differently.

### External Links Handling

The component automatically detects external links and adds the necessary attributes for security.

```vue
<i18n-link to="https://example.com">Visit Example</i18n-link>
```

This link will open `https://example.com` in a new tab with `rel="noopener noreferrer"` applied.

## 🎨 Styles

The component includes basic styles for the active link:

- **Active Link**: `.active` (default style for active links)

You can customize these styles by overriding the `activeClass` prop or applying additional classes as needed.

## 🚀 Additional Features

### Slot for Custom Content

You can pass custom content inside the link using slots, making the component flexible for different use cases.

```vue
<i18n-link to="/about">
  <span>About Us</span>
</i18n-link>
```

### Loading State

The component can display a loading state when the link is clicked and navigation is in progress.

### Accessibility Enhancements

The component supports `aria-label` and other accessibility attributes to ensure a more accessible experience.

```vue
<i18n-link to="/about" aria-label="Learn more about us">
  About Us
</i18n-link>
```
