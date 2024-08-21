---
outline: deep
---

# 🌐 `<i18n-t>` Component

The `<i18n-t>` component is a powerful tool in the `Nuxt I18n Micro` module, designed to handle translations within your application. It offers various features such as interpolation, pluralization, dynamic HTML rendering, and more, making it highly flexible for internationalizing your content.

## ⚙️ Props

### `keypath`

- **Type**: `string`
- **Required**: Yes
- **Description**: The `keypath` prop specifies the translation key to use. This key is looked up in the translation files based on the current locale.
- **Example**:
  ```vue
  <i18n-t keypath="welcomeMessage"></i18n-t>
  ```

### `plural`

- **Type**: `number | null`
- **Optional**: Yes
- **Description**: Specifies the count for pluralization. When provided, the component uses the `$tc` method to fetch the appropriate pluralized translation based on the locale’s pluralization rules.
- **Example**:
  ```vue
  <i18n-t keypath="apples" :plural="10"></i18n-t>
  ```

### `tag`

- **Type**: `string`
- **Optional**: Yes
- **Default**: `'span'`
- **Description**: Specifies the HTML tag used to wrap the translated content. You can customize this to any valid HTML tag, such as `div`, `p`, `h1`, etc.
- **Example**:
  ```vue
  <i18n-t keypath="welcomeMessage" tag="h1"></i18n-t>
  ```

### `scope`

- **Type**: `string`
- **Optional**: Yes
- **Default**: `'global'`
- **Description**: Defines the scope of the translation. By default, it is set to `'global'`, meaning the translation key will be searched in the global scope.
- **Example**:
  ```vue
  <i18n-t keypath="welcomeMessage" scope="page"></i18n-t>
  ```

### `params`

- **Type**: `Record<string, string | number | boolean>`
- **Optional**: Yes
- **Default**: `() => ({})`
- **Description**: An object containing key-value pairs that are interpolated into the translation string. Useful for dynamic content where values need to be inserted into the translated text.
- **Example**:
  ```vue
  <i18n-t keypath="greeting" :params="{ name: 'John' }"></i18n-t>
  ```

### `defaultValue`

- **Type**: `string`
- **Optional**: Yes
- **Default**: `''`
- **Description**: Provides a fallback translation that will be displayed if the specified `keypath` does not match any key in the translation files.
- **Example**:
  ```vue
  <i18n-t keypath="nonExistentKey" defaultValue="Fallback text"></i18n-t>
  ```

### `html`

- **Type**: `boolean`
- **Optional**: Yes
- **Default**: `false`
- **Description**: Determines whether the translation contains HTML content. When set to `true`, the translated string is rendered as raw HTML.
- **Example**:
  ```vue
  <i18n-t keypath="richText" :html="true"></i18n-t>
  ```

### `locale`

- **Type**: `string`
- **Optional**: Yes
- **Description**: Allows you to override the current locale for this specific translation. If not provided, the component will use the application’s current locale.
- **Example**:
  ```vue
  <i18n-t keypath="welcomeMessage" locale="fr"></i18n-t>
  ```

### `wrap`

- **Type**: `boolean`
- **Optional**: Yes
- **Default**: `true`
- **Description**: Controls whether the translated content should be wrapped in the specified HTML `tag`. If set to `false`, the component will not wrap the translation in an HTML element.
- **Example**:
  ```vue
  <i18n-t keypath="welcomeMessage" :wrap="false"></i18n-t>
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

### `hideIfEmpty`

- **Type**: `boolean`
- **Optional**: Yes
- **Default**: `false`
- **Description**: Determines whether the component should render anything if the translation string is empty. Useful for conditional rendering based on the presence of a translation.
- **Example**:
  ```vue
  <i18n-t keypath="optionalMessage" :hideIfEmpty="true"></i18n-t>
  ```

## 🛠️ Examples of Usage

### Basic Usage

Render a simple translation string using the `keypath`.

```vue
<i18n-t keypath="welcomeMessage"></i18n-t>
```

### With Pluralization

Handle pluralized translation strings by specifying the `plural` prop.

```vue
<i18n-t keypath="apples" :plural="10" tag="div"></i18n-t>
```

### With Interpolation

Interpolate dynamic values into the translation string using the `params` prop.

```vue
<i18n-t keypath="greeting" :params="{ name: 'John' }"></i18n-t>
```

### Rendering with HTML Content

Render translations that contain HTML content by setting the `html` prop to `true`.

```vue
<i18n-t keypath="richText" :html="true"></i18n-t>
```

### Using a Custom Locale

Override the current application locale for a specific translation.

```vue
<i18n-t keypath="welcomeMessage" locale="fr"></i18n-t>
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
