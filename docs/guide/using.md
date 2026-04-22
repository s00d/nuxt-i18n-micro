# Using Translations in Components

After the module is configured, use **`$t('key')` in templates** for translations. In **`<script setup>`**, get helpers from **`useI18n()`** via Nuxt’s **`#imports`** (do not rely on a global `$t` identifier in script).

## 1. Where translation files live

Root-level JSON under `locales/` is merged into each page bundle; page-specific files live under `locales/pages/...`. Layout, dynamic routes, and naming rules are covered in **[Folder structure](./folder-structure.md)**.

## 2. Template usage with `$t`

In the **template** you can use `$t` directly:

```vue
<template>
  <div>
    <!-- Root-level translation (available on all pages) -->
    <p>{{ $t("test_key") }}</p>
    <!-- Displays: Hello World! -->

    <!-- Page-specific translation (if this page is /dir1) -->
    <p>{{ $t("local_key") }}</p>
    <!-- Displays: This is a page-specific translation for /dir1. -->

    <!-- Nested key -->
    <p>{{ $t("nested.key.deeper") }}</p>
    <!-- Displays: Nested translation here -->

    <!-- Placeholder usage -->
    <p>{{ $t("greeting", { name: "Alice" }) }}</p>
    <!-- Displays: Hello, Alice! -->
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "#imports";

const { $t } = useI18n();

// $t here comes from the composable, not a script global:
console.log($t("test_key")); // "Hello World!"
</script>
```

::: tip `$t` vs `$ts` — choosing the right method
`$t` can return **objects** if the key points to a nested JSON node (e.g. `$t('header')` → `{ title: "Hi" }`). In templates this renders as `[object Object]`. Use `$ts` when you need a guaranteed string, or provide a more specific key like `$t('header.title')`. See [API Reference — $t vs $ts](/api/methods#t) for details.
:::

## 3. Switching the current locale

You can call **`$switchLocale`** from the template (plugin-injected) or use the same helper from **`useI18n()`** in script:

```vue
<template>
  <div>
    <button type="button" @click="switchLocale('en')">English</button>
    <button type="button" @click="switchLocale('fr')">Français</button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "#imports";

const { $switchLocale } = useI18n();

function switchLocale(code: string) {
  $switchLocale(code);
}
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

## 5. Tips and best practices

- **Conflicting keys**: If a page-specific file defines the same key as a root file, the page-specific value wins (root is merged as a base at build time).
- **Disabling page locales**: Set `disablePageLocales: true` to use only `locales/*.json`.
- **Imports**: Use `import { useI18n } from "#imports"` in `<script setup>` (Nuxt auto-import), not a deep import from the package name unless you have a specific reason.

With this you can read translations from JSON and show them in templates with `$t`, or in script via `useI18n()`.

## Additional Resources

To explore more advanced features, be sure to check out:

1. **`<i18n-t>` Component**  
   The `<i18n-t>` component is a powerful alternative to `$t`, especially useful for situations involving nested elements, advanced placeholder usage, and more complex translation structures.

- **Documentation**: [i18n-t](/components/i18n-t)

2. **`useI18n` Composable**  
   The `useI18n` composable offers a complete set of functions and reactive properties for managing translations, handling locale switching, formatting, and more.

- **Documentation**: [useI18n](/composables/useI18n)
