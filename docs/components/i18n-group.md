# 🌍 `<i18n-group>` Component

The `<i18n-group>` component in Nuxt I18n Micro provides a convenient way to group translations under a common prefix, reducing repetition and improving code organization.

## ⚙️ Props

### `prefix`

- **Type**: `String`
- **Required**: Yes
- **Description**: The translation key prefix that will be automatically prepended to all translations within the group.
- **Example**: `"product.details"`, `"user.profile"`

### `groupClass`

- **Type**: `String`
- **Required**: No
- **Default**: `""`
- **Description**: Additional CSS class(es) to be applied to the wrapper div element.

## 🎯 Slots

### Default Slot

The default slot provides access to two important properties:

- **prefix**: The current prefix string
- **t**: A translation function that automatically prepends the prefix

The slot exposes these properties through scoped slots:

```vue
<template #default="{ prefix, t }">
  <!-- Your content here -->
</template>
```

## 🛠️ Example Usage

### Basic Usage

```vue
<template>
  <i18n-group prefix="product.details">
    <template #default="{ t }">
      <h1>{{ t('title') }}</h1>
      <p>{{ t('description') }}</p>
      <div class="price">{{ t('price', { value: 99.99 }) }}</div>
    </template>
  </i18n-group>
</template>
```

Translation file:
```json
{
  "product": {
    "details": {
      "title": "Premium Product",
      "description": "This is a premium product",
      "price": "Price: ${value}"
    }
  }
}
```

### With Custom Class

```vue
<template>
  <i18n-group 
    prefix="user.profile" 
    group-class="profile-section"
  >
    <template #default="{ t }">
      <div class="user-info">
        <h2>{{ t('title') }}</h2>
        <p>{{ t('bio') }}</p>
        <div class="stats">
          <span>{{ t('stats.followers') }}</span>
          <span>{{ t('stats.following') }}</span>
        </div>
      </div>
    </template>
  </i18n-group>
</template>
```

Translation file:
```json
{
  "user": {
    "profile": {
      "title": "User Profile",
      "bio": "User biography goes here",
      "stats": {
        "followers": "Followers: {count}",
        "following": "Following: {count}"
      }
    }
  }
}
```

### With Dynamic Content

```vue
<template>
  <i18n-group prefix="blog.post">
    <template #default="{ t }">
      <article>
        <h1>{{ t('title') }}</h1>
        <div class="meta">
          {{ t('meta.author', { name: author }) }} |
          {{ t('meta.date', { date: publishDate }) }}
        </div>
        <div v-for="(section, index) in sections" :key="index">
          <h2>{{ t(`sections.${index}.title`) }}</h2>
          <p>{{ t(`sections.${index}.content`) }}</p>
        </div>
      </article>
    </template>
  </i18n-group>
</template>

<script setup>
const author = 'John Doe'
const publishDate = '2024-01-01'
const sections = ['intro', 'main', 'conclusion']
</script>
```

## 🎨 Styling

The component wraps its content in a div with the class `i18n-group` and any additional classes specified in the `groupClass` prop:

```css
.i18n-group {
  /* Your base styles */
}

.profile-section {
  /* Additional styles for profile sections */
}
```

## 🚀 Best Practices

1. **Consistent Prefixes**: Use consistent and logical prefixes that reflect your application's structure
```vue
<i18n-group prefix="features.pricing">
<i18n-group prefix="features.security">
```

2. **Modular Organization**: Group related translations together under meaningful prefixes
```vue
<i18n-group prefix="checkout.payment">
<i18n-group prefix="checkout.shipping">
```

3. **Reusable Components**: Create reusable components with their own translation groups
```vue
<!-- UserProfile.vue -->
<i18n-group prefix="user.profile">

<!-- UserSettings.vue -->
<i18n-group prefix="user.settings">
```

4. **Nested Groups**: Avoid deeply nesting groups to maintain clarity
```vue
<!-- Good -->
<i18n-group prefix="shop.product">

<!-- Avoid -->
<i18n-group prefix="shop.category.product.details.specs">
```
