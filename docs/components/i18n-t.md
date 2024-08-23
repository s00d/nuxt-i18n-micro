---
outline: deep
---

# 🌍 `<i18n-t>` Component

The `<i18n-t>` component in `Nuxt I18n Micro` is a flexible translation component that supports dynamic content insertion via slots. It allows you to interpolate translations with custom Vue components or HTML content, enabling advanced localization scenarios.

## ⚙️ Props

### `keypath`

- **Type**: `string`
- **Required**: Yes
- **Description**: Defines the key path to the translation string in your localization files.
- **Example**:
  ```vue
  <i18n-t keypath="feedback.text" />
  ```

### `plural`

- **Type**: `number | string`
- **Optional**: Yes
- **Description**: Specifies a number for pluralization rules.
- **Example**:
  ```vue
  <i18n-t keypath="items" :plural="itemCount" />
  ```

### `tag`

- **Type**: `string`
- **Optional**: Yes
- **Default**: `'span'`
- **Description**: Specifies the HTML tag to wrap the translated content.
- **Example**:
  ```vue
  <i18n-t keypath="feedback.text" tag="div" />
  ```

### `params`

- **Type**: `Record<string, string | number | boolean>`
- **Optional**: Yes
- **Description**: Provides parameters for interpolating dynamic values in the translation.
- **Example**:
  ```vue
  <i18n-t keypath="user.greeting" :params="{ name: userName }" />
  ```

### `defaultValue`

- **Type**: `string`
- **Optional**: Yes
- **Description**: The default value to use if the translation key is not found.
- **Example**:
  ```vue
  <i18n-t keypath="nonExistentKey" defaultValue="Fallback text"></i18n-t>
  ```

### `html`

- **Type**: `boolean`
- **Optional**: Yes
- **Default**: `false`
- **Description**: Enables the rendering of the translation as raw HTML. 
- **Example**:
  ```vue
  <i18n-t keypath="feedback.text" html />
  ```

### `hideIfEmpty`

- **Type**: `boolean`
- **Optional**: Yes
- **Default**: `false`
- **Description**: If `true`, the component will not render anything if the translation is empty.
- **Example**:
  ```vue
  <i18n-t keypath="optionalMessage" :hideIfEmpty="true"></i18n-t>
  ```
  
### `customPluralRule`

- **Type**: `(value: string, count: number, locale: string) => string`
- **Optional**: Yes
- **Description**: A function that allows you to define custom pluralization logic. Useful if the default pluralization rules do not fit your specific needs.
- **Example**:
  ```vue
  <i18n-t
    keypath="items"
    :plural="itemCount"
    :customPluralRule="(value, count, locale) => {
      return count === 1 ? 'One item' : `${count} items`;
    }"
  ></i18n-t>
  ```

## 🛠️ Example Usages

### Basic Usage

```vue
<i18n-t keypath="feedback.text" />
```

This renders the translation for `feedback.text` within a `<span>` tag.

### Using Slots for Dynamic Content

The `<i18n-t>` component supports the use of slots to dynamically insert Vue components or other content into specific parts of the translation.

```vue
<i18n-t keypath="feedback.text">
  <template #link>
    <nuxt-link :to="{ name: 'index' }">
      <i18n-t keypath="feedback.link" />
    </nuxt-link>
  </template>
</i18n-t>
```

In this example, the `{link}` placeholder in the `feedback.text` translation string is replaced by the `<nuxt-link>` component, which itself contains another translation component.

### Pluralization

```vue
<i18n-t keypath="items.count" :plural="itemCount" />
```

This automatically applies pluralization rules based on the `itemCount` value.

## 🚀 Additional Features

### Default Slot

If no specific slot is provided, the translation can be customized via the default slot, which provides the entire translated string:

```vue
<i18n-t keypath="welcome.message">
  <template #default="{ translation }">
    {{ translation.replace('Nuxt', 'Vue') }}
  </template>
</i18n-t>
```

### Conditional Rendering

Render nothing if the translation string is empty by using the `hideIfEmpty` prop.

```vue
<i18n-t keypath="optionalMessage" :hideIfEmpty="true"></i18n-t>
```

### Custom Pluralization Rule

Use a custom function to handle pluralization.

```vue
<i18n-t
  keypath="items"
  :plural="itemCount"
  :customPluralRule="(value, count, locale) => {
    return count === 1 ? 'One item' : `${count} items`;
  }}"
></i18n-t>
```

### Advanced Example with Slots

Utilize slots to customize how the translation content is rendered.

```vue
<i18n-t keypath="welcomeMessage">
  <template #default="{ translation }">
    <strong>{{ translation }}</strong>
  </template>
</i18n-t>
```
