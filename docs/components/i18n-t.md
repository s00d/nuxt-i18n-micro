---
outline: deep
---

# `<i18n-t>` Component

The `<i18n-t>` component is a powerful tool in the `Nuxt I18n Micro` module, designed to handle translations within your application. It provides various features such as interpolation, pluralization, dynamic HTML rendering, and more, making it highly flexible for internationalizing your content.

## Props

### `keypath` (`string`, required)
The `keypath` prop specifies the translation key to use. This key is looked up in the translation files based on the current locale.

- **Type**: `string`
- **Required**: Yes
- **Example**:
  ```vue
  <i18n-t keypath="welcomeMessage"></i18n-t>
  ```

### `plural` (`number | null`, optional)
The `plural` prop is used to specify the count for pluralization. When provided, the component uses the `$tc` method to fetch the appropriate pluralized translation based on the locale’s pluralization rules.

- **Type**: `number | null`
- **Optional**: Yes
- **Example**:
  ```vue
  <i18n-t keypath="apples" :plural="10"></i18n-t>
  ```

### `tag` (`string`, optional, default: `'span'`)
The `tag` prop specifies the HTML tag used to wrap the translated content. You can customize this to any valid HTML tag, such as `div`, `p`, `h1`, etc.

- **Type**: `string`
- **Optional**: Yes
- **Default**: `'span'`
- **Example**:
  ```vue
  <i18n-t keypath="welcomeMessage" tag="h1"></i18n-t>
  ```

### `scope` (`string`, optional, default: `'global'`)
The `scope` prop defines the scope of the translation. By default, it is set to `'global'`, meaning the translation key will be searched in the global scope.

- **Type**: `string`
- **Optional**: Yes
- **Default**: `'global'`
- **Example**:
  ```vue
  <i18n-t keypath="welcomeMessage" scope="page"></i18n-t>
  ```

### `params` (`Record<string, string | number | boolean>`, optional, default: `() => ({})`)
The `params` prop is an object containing key-value pairs that are interpolated into the translation string. This is particularly useful for dynamic content where values need to be inserted into the translated text.

- **Type**: `Record<string, string | number | boolean>`
- **Optional**: Yes
- **Default**: `() => ({})`
- **Example**:
  ```vue
  <i18n-t keypath="greeting" :params="{ name: 'John' }"></i18n-t>
  ```

### `defaultValue` (`string`, optional, default: `''`)
The `defaultValue` prop provides a fallback translation that will be displayed if the specified `keypath` does not match any key in the translation files.

- **Type**: `string`
- **Optional**: Yes
- **Default**: `''`
- **Example**:
  ```vue
  <i18n-t keypath="nonExistentKey" defaultValue="Fallback text"></i18n-t>
  ```

### `html` (`boolean`, optional, default: `false`)
The `html` prop determines whether the translation contains HTML content. When set to `true`, the translated string is rendered as raw HTML.

- **Type**: `boolean`
- **Optional**: Yes
- **Default**: `false`
- **Example**:
  ```vue
  <i18n-t keypath="richText" :html="true"></i18n-t>
  ```

### `locale` (`string`, optional)
The `locale` prop allows you to override the current locale for this specific translation. If not provided, the component will use the application’s current locale.

- **Type**: `string`
- **Optional**: Yes
- **Example**:
  ```vue
  <i18n-t keypath="welcomeMessage" locale="fr"></i18n-t>
  ```

### `wrap` (`boolean`, optional, default: `true`)
The `wrap` prop controls whether the translated content should be wrapped in the specified HTML `tag`. If set to `false`, the component will not wrap the translation in an HTML element.

- **Type**: `boolean`
- **Optional**: Yes
- **Default**: `true`
- **Example**:
  ```vue
  <i18n-t keypath="welcomeMessage" :wrap="false"></i18n-t>
  ```

### `customPluralRule` (`(value: string, count: number, locale: string) => string`, optional)
The `customPluralRule` prop is a function that allows you to define custom pluralization logic. This is useful if the default pluralization rules do not fit your specific needs.

- **Type**: `Function`
- **Optional**: Yes
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

### `hideIfEmpty` (`boolean`, optional, default: `false`)
The `hideIfEmpty` prop determines whether the component should render anything if the translation string is empty. This can be useful for conditional rendering based on the presence of a translation.

- **Type**: `boolean`
- **Optional**: Yes
- **Default**: `false`
- **Example**:
  ```vue
  <i18n-t keypath="optionalMessage" :hideIfEmpty="true"></i18n-t>
  ```

## Examples of Usage

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
