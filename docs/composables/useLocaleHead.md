---
outline: deep
---

# 🌍 `useLocaleHead` Composable

The `useLocaleHead` composable is a utility in `Nuxt I18n Micro` that helps you manage SEO attributes and HTML meta tags for localized routes. It dynamically generates attributes for the `lang` and `dir` of the HTML document and creates `meta` and `link` tags to improve the SEO of your localized content.

## ⚙️ Options

The `useLocaleHead` composable accepts an options object to customize its behavior:

### `addDirAttribute`

- **Type**: `boolean`
- **Default**: `true`
- **Description**: If `true`, adds the `dir` attribute to the HTML document based on the current locale's direction (`ltr` or `rtl`).
- **Example**:
  ```js
  const head = useLocaleHead({ addDirAttribute: false })
  ```

### `identifierAttribute`

- **Type**: `string`
- **Default**: `'id'`
- **Description**: Specifies the attribute used to identify the generated meta and link tags. This is useful for differentiating tags when inspecting the document head.
- **Example**:
  ```js
  const head = useLocaleHead({ identifierAttribute: 'data-i18n' })
  ```

### `addSeoAttributes`

- **Type**: `boolean`
- **Default**: `true`
- **Description**: If `true`, includes SEO-related meta and link tags, such as `og:locale`, `og:url`, and `hreflang` attributes for alternate languages.
- **Example**:
  ```js
  const head = useLocaleHead({ addSeoAttributes: false })
  ```

### `baseUrl`

- **Type**: `string`
- **Default**: `'/'`
- **Description**: The base URL of your application, used to generate canonical and alternate URLs for SEO purposes.
- **Example**:
  ```js
  const head = useLocaleHead({ baseUrl: 'https://example.com' })
  ```

## 🛠️ Return Values

The `useLocaleHead` composable returns an object with `htmlAttrs`, `meta`, and `link` properties, which can be directly used in the `<head>` section of your Nuxt application.

### `htmlAttrs`

- **Type**: `Record<string, string>`
- **Description**: Contains attributes to be added to the `<html>` tag, such as `lang` and `dir`.
- **Example**:
  ```js
  const { htmlAttrs } = useLocaleHead()
  console.log(htmlAttrs)
  // Output: { lang: 'en-US', dir: 'ltr' }
  ```

### `meta`

- **Type**: `Array<Record<string, string>>`
- **Description**: Contains meta tags for SEO, including Open Graph locale tags and alternate locales.
- **Example**:
  ```js
  const { meta } = useLocaleHead()
  console.log(meta)
  // Output: [{ id: 'i18n-og', property: 'og:locale', content: 'en-US' }, ...]
  ```

### `link`

- **Type**: `Array<Record<string, string>>`
- **Description**: Contains link tags for canonical URLs and alternate language versions of the page.
- **Example**:
  ```js
  const { link } = useLocaleHead()
  console.log(link)
  // Output: [{ id: 'i18n-can', rel: 'canonical', href: 'https://example.com/about' }, ...]
  ```

## 🛠️ Example Usages

### Basic Usage

Generate locale-specific head attributes with default options.

```js
const head = useLocaleHead()
```

### Customize Identifier Attribute

Use a custom identifier attribute for the generated tags.

```js
const head = useLocaleHead({ identifierAttribute: 'data-i18n' })
```

### Disable SEO Attributes

Generate head attributes without adding SEO-related meta and link tags.

```js
const head = useLocaleHead({ addSeoAttributes: false })
```

### Specify a Base URL

Set a custom base URL for canonical and alternate URLs.

```js
const head = useLocaleHead({ baseUrl: 'https://mywebsite.com' })
```

## 🚀 Additional Features

### SEO Meta and Link Tags

When `addSeoAttributes` is enabled, the composable automatically generates the following tags:
- `og:locale` for the current locale.
- `og:url` for the canonical URL of the page.
- `og:locale:alternate` for alternate language versions.
- `rel="canonical"` and `rel="alternate"` links for SEO optimization.

### Dynamic Locale and Direction

The composable dynamically determines the `lang` and `dir` attributes based on the current route's locale, ensuring that your HTML document is correctly configured for international users.

### Handling Localized Routes

If your routes are prefixed with locale codes (e.g., `/en/about`), the composable intelligently adjusts the full path for generating URLs, ensuring that SEO attributes are accurate and relevant.

This composable simplifies the process of optimizing your Nuxt application for international audiences, ensuring that your site is well-prepared for global search engines and users.


## 🛠️ Example Usage

The following example demonstrates how to use the `useLocaleHead` composable within a Vue component with default settings:

```vue
<script setup>
const head = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
  addSeoAttributes: true,
})

useHead(head)
</script>

<template>
  <div>
    
  </div>
</template>
```

### Explanation of the Code

- **`useLocaleHead` Composable**: This composable is called in the `<script setup>` section and returns an object containing `htmlAttrs`, `meta`, and `link`.

- **`<html>` Tag**: The `lang` and `dir` attributes for the HTML document are dynamically determined based on the current locale and are applied to the `<html>` tag.

- **`<head>` Section**:
  - **Meta Tags**: SEO-related meta tags are generated, including `og:locale`, `og:url`, and `rel="canonical"` and `rel="alternate"` tags to specify alternate language versions of the page.
  - **Link Tags**: Canonical links and links to alternate language versions are included.

- **`<body>` Section**: The main content of the page is displayed here. In this example, a simple header and paragraph are used.

### 📝 Notes

1. **Attributes**: The attributes used (`lang`, `dir`, `rel`, `href`, `hreflang`, `property`, `content`) are extracted from the object returned by `useLocaleHead`.

2. **SEO Tags Generation**: If the `addSeoAttributes` option is set to `true`, the composable automatically generates SEO tags for the current locale.

3. **Base URL**: You can set your custom base URL using the `baseUrl` option to correctly generate canonical and alternate links.

This example demonstrates how easy it is to integrate `useLocaleHead` into your application's components to ensure correct SEO attributes and improve the search engine indexing of localized pages.
