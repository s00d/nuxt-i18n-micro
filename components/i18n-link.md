---
url: 'https://s00d.github.io/nuxt-i18n-micro/components/i18n-link.md'
description: Locale-aware NuxtLink wrapper for localized routes.
---

# 🌍 `<i18n-link>` Component

The `<i18n-link>` component in `Nuxt I18n Micro` is a versatile link component that automatically localizes routes based on the current locale. It acts as a wrapper around the `<NuxtLink>` component, providing additional features such as active link styling and support for external links.

## ⚙️ Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `to` **\*** | `RouteLocationNamedRaw \| RouteLocationResolvedGeneric \| string` | — | Target route. Localized automatically; an external URL is passed through unchanged. |
| `activeStyle` | `Partial<CSSStyleValue>` | — | Inline style applied while the link points at the current route. |

**\*** required.

### Slots

| Slot | Bindings | Description |
| --- | --- | --- |
| `default` | — | Link content. |

`to` accepts anything `NuxtLink` does — a path, a named route, or a resolved route object.
An absolute URL is detected and rendered as a plain `<a target="_blank" rel="noopener noreferrer">`
rather than being localized.

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

* **Font Weight**: `bold`
* **Color**: Inherits the browser's default color (if no `color` is specified in `activeStyle`).

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
