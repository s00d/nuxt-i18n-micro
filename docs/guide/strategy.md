# 🗂️ Strategies for Locale Prefix Handling in `Nuxt I18n` (Version 1.50.0+)

## 📖 Introduction to Locale Prefix Strategies

Starting with version 1.50.0, `Nuxt I18n` introduces a more flexible way to manage how locale prefixes are handled in URLs through the `strategy` option. This new approach replaces the deprecated `includeDefaultLocaleRoute` and gives you better control over how localization is applied to different routes in your application.

The `strategy` option allows you to choose between different behaviors regarding locale prefixes, providing more fine-grained control over the URLs of your application and how they are structured based on the user's selected language.

## 🚦 `strategy` (New in Version 1.50.0)

The `strategy` option defines how locale prefixes should be managed across your routes. The available strategies give you varying levels of control over how the locale appears in the URLs.

**Type**: `string`  
**Default**: `prefix_except_default`

## Available Strategies:

### 🛑 **no_prefix**

This strategy ensures that no locale prefix is added to your routes. Instead of modifying the URL, the application will detect and change the locale based on the user's browser settings or cookies.

- **Behavior**: Routes won't have any locale prefix.
- **Locale Detection**: The locale is detected based on the user's browser language or cookies, and it is changed without altering the URL.
- **Restrictions**: This strategy does not support features like Custom paths or Ignore routes.

**Default Locale**: You can set the default locale using an environment variable. For example:
- `DEFAULT_LOCALE=de npm run dev`
- `DEFAULT_LOCALE=de npm run build`

**Use Case**: Ideal when you want a cleaner URL structure and are relying on automatic language detection rather than explicit locale identifiers in the URL.

```typescript
i18n: {
  strategy: 'no_prefix'
}
```

**Example Routes**:
- `/about` (for any language, e.g., `en`, `ru`, `fr`, etc.)
- `/contact` (for any language)
- `/other` (for any language)
- `/other2` (for any language)

### 🚧 **prefix_except_default**

With this strategy, all of your routes will include a locale prefix, except for the default language. For the default language, the route will appear without any prefix.

- **Behavior**: All routes will include a locale prefix, except for the default language.
- **Locale Handling**: This ensures that only the default locale has URLs without a prefix, while all other locales will have a locale-specific prefix.

**Use Case**: Useful when you want all non-default languages to have a distinct URL structure with a locale prefix but prefer the default language to be accessible without the prefix.

```typescript
i18n: {
  strategy: 'prefix_except_default'
}
```

**Example Routes**:
- `/about` (for the default language, e.g., `en`)
- `/ru/about` (for Russian)
- `/fr/about` (for French)

### 🌍 **prefix**

This strategy ensures that every route in your application will include a locale prefix, regardless of the language. It standardizes the URL structure across all languages.

- **Behavior**: All routes will have a locale prefix.
- **Locale Handling**: Every route will follow a consistent pattern, with a locale prefix present in the URL for all languages.

**Use Case**: Ideal for situations where you want a consistent URL structure for all languages, ensuring every route includes the locale prefix.

```typescript
i18n: {
  strategy: 'prefix'
}
```

**Example Routes**:
- `/en/about` (for English)
- `/ru/about` (for Russian)
- `/fr/about` (for French)

### 🔄 **prefix_and_default**

This strategy combines both the `prefix` and `prefix_except_default` behaviors. It ensures that all languages have a locale prefix in their URLs, but the default language also has a non-prefixed URL version available. When the `detectBrowserLanguage` feature is enabled, the prefixed version of the default language will be preferred.

- **Behavior**: Every language gets a URL with a locale prefix, but the default language also has a non-prefixed version.
- **Locale Handling**: The default language has both a prefixed and non-prefixed URL, but the prefixed version takes priority when the browser language is detected.

**Use Case**: Best for applications that want to support both prefixed and non-prefixed URLs for the default language while maintaining a locale prefix for other languages.

```typescript
i18n: {
  strategy: 'prefix_and_default'
}
```

**Example Routes**:
- `/about` (for the default language, e.g., `en`)
- `/en/about` (for English, with prefix)
- `/ru/about` (for Russian)
- `/fr/about` (for French)

## ⚠️ Known Issues and Best Practices

While the `strategy` option provides flexibility, there are some known issues and best practices to keep in mind when using these strategies.

### 1. **Hydration Mismatch in `no_prefix` Strategy with Static Generation**

When using the `no_prefix` strategy in combination with static site generation (`generate` mode), you may encounter a **hydration mismatch** error. This happens because the locale is determined dynamically (e.g., via cookies or browser settings) after the static page is rendered, leading to a mismatch between the server-rendered content and the client-side hydration.

**Error Example**:
```
Hydration completed but contains mismatches.
```

**Workaround**:
- Avoid relying on dynamic locale changes during static generation.
- Consider using a different strategy like `prefix_except_default` or `prefix` if static generation is a requirement.

### 2. **Issues with `localeRoute` and Route Resolution**

When using `localeRoute` to generate links, there can be issues with route resolution, especially if you rely on path-based routing. For example:

```typescript
localeRoute('/page') // May cause issues with route resolution
```

**Best Practice**:
- Always use named routes with `localeRoute` to avoid unnecessary redirects or route resolution problems:

```typescript
localeRoute({ name: 'page' }) // Preferred approach
```

This ensures that the correct route is resolved regardless of the locale strategy.

### 3. **Rendering Issues with Locale-Dependent Content in `no_prefix` Strategy**

In the `no_prefix` strategy, rendering content that depends on the selected locale (e.g., buttons for switching languages) can lead to issues. For example, if you use a `v-for` loop to render locale buttons, Vue may incorrectly apply the `disabled` attribute due to hydration mismatches.

**Example Problematic Code**:
```vue
<button
  v-for="locale in availableLocales"
  :key="locale.code"
  :disabled="locale.isActive"
  :class="{ disabled: locale.isActive }"
  @click="() => $switchLocale(locale.code)"
>
  Switch to {{ locale.code }}
</button>
```

**Issue**:
- Vue may incorrectly apply the `disabled` attribute during hydration, and it may not update correctly when the locale changes.

**Best Practice**:
- Use a `<select>` element or another approach that avoids direct DOM manipulation for locale-dependent content:

```vue
<select @change="(e) => $switchLocale(e.target.value)">
  <option
    v-for="locale in availableLocales"
    :key="locale.code"
    :value="locale.code"
    :selected="locale.isActive"
  >
    {{ locale.code }}
  </option>
</select>
```

This approach avoids hydration issues and ensures that the UI updates correctly when the locale changes.

## 📝 Conclusion

The new `strategy` option, introduced in version 1.50.0, provides more flexibility and control over how locale prefixes are handled in your application. Whether you need a clean, non-prefixed URL structure, or prefer to add locale prefixes for all or some languages, the available strategies allow you to customize your URL structure to fit your needs.

### 📚 Best Practices:

- **Simplicity for Default Language**: If you don't need locale prefixes for your default language, use `prefix_except_default` or `prefix_and_default`.
- **Consistency**: For a consistent URL structure with locale prefixes across all languages, use `prefix`.
- **User Experience**: Consider using `no_prefix` when you want to rely on browser language detection and avoid cluttering the URL with prefixes.
- **Avoid Hydration Issues**: Be cautious with `no_prefix` in static generation mode and use named routes with `localeRoute` for better route resolution.
- **Handle Locale-Dependent Content Carefully**: Use `<select>` or other approaches to avoid hydration mismatches when rendering locale-dependent content.

By understanding and applying these strategies and best practices, you can ensure that your application's localization behavior fits your project's requirements while avoiding common pitfalls.
