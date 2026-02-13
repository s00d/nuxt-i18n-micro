# Using Translations in Components

Once the module is installed and configured, you can display translations by calling `$t('your_key')` within your Vue templates and scripts.

## 1. Root-Level & Page-Specific Translation Files

1. **Root-level** translations reside directly under the `/locales` folder (e.g. `/locales/en.json`, `/locales/fr.json`). At build time, they are automatically merged into every page-specific file, making them available on all pages.
2. **Page-specific** translations live under `/locales/pages/...`, matching your Nuxt pages folder structure:
```tree
locales/
├── en.json
├── fr.json
└── pages/
    └── dir1/
        ├── en.json
        └── fr.json
```

## 2. Template Usage with `$t`

In your `.vue` files, you can directly use `$t` in the template:

```vue
<template>
  <div>
    <!-- Root-level translation (available on all pages) -->
    <p>{{ $t('test_key') }}</p>
    <!-- Displays: Hello World! -->

    <!-- Page-specific translation (if this page is /dir1) -->
    <p>{{ $t('local_key') }}</p>
    <!-- Displays: This is a page-specific translation for /dir1. -->

    <!-- Nested key -->
    <p>{{ $t('nested.key.deeper') }}</p>
    <!-- Displays: Nested translation here -->

    <!-- Placeholder usage -->
    <p>{{ $t('greeting', { name: 'Alice' }) }}</p>
    <!-- Displays: Hello, Alice! -->
  </div>
</template>

<script setup lang="ts">
// No need to import anything from 'nuxt-i18n-micro'.
// The plugin automatically provides `useI18n` and `$t`.
const { $t } = useI18n()

// You can now use $t in your script, for example:
console.log($t('test_key'))  // "Hello World!"
</script>
```

::: tip `$t` vs `$ts` — choosing the right method
`$t` can return **objects** if the key points to a nested JSON node (e.g. `$t('header')` → `{ title: "Hi" }`). In templates this renders as `[object Object]`. Use `$ts` when you need a guaranteed string, or provide a more specific key like `$t('header.title')`. See [API Reference — $t vs $ts](/api/methods#t) for details.
:::

## 3. Switching the Current Locale

To change languages in your app, you can retrieve `$locale` from `useI18n()` and assign it a new code:

```vue
<template>
  <div>
    <button @click="$switchLocale('en')">English</button>
    <button @click="$switchLocale('fr')">Français</button>
  </div>
</template>

<script setup lang="ts">
// The plugin auto-injects these references
const { $t, $switchLocale } = useI18n()
</script>
```

## 4. Nested Keys and Placeholders

- **Nested keys** use dot notation, e.g. `nested.key.deeper`.
- **Placeholders** allow you to insert dynamic values:
  ```json
  { "greeting": "Hello, {name}!" }
  ```  
  ```vue
  <p>{{ $t('greeting', { name: 'Alice' }) }}</p>
  <!-- Displays: Hello, Alice! -->
  ```

## 5. Tips & Best Practices

- **Conflicting Keys**: If a page-specific file contains the same key as a root-level file, the page-specific version takes priority (root translations are merged as a base at build time).
- **Disabling Page Files**: If you'd rather not use page-specific translations, you can set `disablePageLocales: true` in your Nuxt config. This way, only the `/locales/*.json` files are used.
- **No Direct Imports**: You don't need to do `import { useI18n } from 'nuxt-i18n-micro'`; the module's auto-injection feature handles it for you.

That's it! With these steps, you can quickly **start retrieving translations** from root-level or page-specific JSON files and **display them** in your Nuxt application using `$t`.

## Additional Resources

To explore more advanced features, be sure to check out:

1. **`<i18n-t>` Component**  
   The `<i18n-t>` component is a powerful alternative to `$t`, especially useful for situations involving nested elements, advanced placeholder usage, and more complex translation structures.
- **Documentation**: [i18n-t](/components/i18n-t)

2. **`useI18n` Composable**  
   The `useI18n` composable offers a complete set of functions and reactive properties for managing translations, handling locale switching, formatting, and more.
- **Documentation**: [useI18n](/composables/useI18n)
