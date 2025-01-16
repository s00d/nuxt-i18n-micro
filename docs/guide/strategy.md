# 🗂️ Strategies for Locale Prefix Handling in `Nuxt I18n` (Version 1.50.0+)

## 📖 Introduction to Locale Prefix Strategies

Starting with version 1.50.0, `Nuxt I18n` introduces a more flexible way to manage how locale prefixes are handled in URLs through the `strategy` option. This new approach replaces the deprecated `includeDefaultLocaleRoute` and gives you better control over how localization is applied to different routes in your application.

The `strategy` option allows you to choose between different behaviors regarding locale prefixes, providing more fine-grained control over the URLs of your application and how they are structured based on the user's selected language.

## 🚦 `strategy` (New in Version 1.50.0)

The `strategy` option defines how locale prefixes should be managed across your routes. The available strategies give you varying levels of control over how the locale appears in the URLs.

**Type**: `string`  
**Default**: `prefix_and_default`

## Available Strategies:

### 🛑 **no_prefix**

This strategy ensures that no locale prefix is added to your routes. Instead of modifying the URL, the application will detect and change the locale based on the user's browser settings or cookies.

- **Behavior**: Routes won't have any locale prefix.
- **Locale Detection**: The locale is detected based on the user's browser language or cookies, and it is changed without altering the URL.
- **Restrictions**: This strategy does not support features like Custom paths or Ignore routes.

**Important Note**: The no_prefix strategy works only with standard routing. Any functionality tied to route generation (e.g., custom paths, dynamic route matching) can only work with other strategies. To achieve similar functionality with the no_prefix strategy, you must use a slug-based approach (e.g., `[...slug].vue`).

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

## 📝 Conclusion

The new `strategy` option, introduced in version 1.50.0, provides more flexibility and control over how locale prefixes are handled in your application. Whether you need a clean, non-prefixed URL structure, or prefer to add locale prefixes for all or some languages, the available strategies allow you to customize your URL structure to fit your needs.

### 📚 Best Practices:

- **Simplicity for Default Language**: If you don't need locale prefixes for your default language, use `prefix_except_default` or `prefix_and_default`.
- **Consistency**: For a consistent URL structure with locale prefixes across all languages, use `prefix`.
- **User Experience**: Consider using `no_prefix` when you want to rely on browser language detection and avoid cluttering the URL with prefixes.

By understanding and applying these strategies, you can ensure that your application's localization behavior fits your project's requirements.
