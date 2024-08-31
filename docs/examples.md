---
outline: deep
---

# 📚 Nuxt I18n Micro Examples and Usage

This section provides various examples demonstrating how to use `Nuxt I18n Micro` in your Nuxt.js application. You'll see how to switch locales, use the `<i18n-link>`, `<i18n-switcher>`, and `<i18n-t>` components, and dynamically handle translation keys.

## 🛠️ Basic Setup

Here's a basic setup to get started with `Nuxt I18n Micro`:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
      { code: 'de', iso: 'de-DE', dir: 'ltr' },
    ],
    defaultLocale: 'en',
    translationDir: 'locales',
    meta: true,
  },
})
```

## 🌍 Locale Switching

### Switching Locales Programmatically

This example demonstrates how to switch locales programmatically using buttons:

```vue
<template>
  <div>
    <p>Current Locale: {{ $getLocale() }}</p>
    <div>
      <button
        v-for="locale in $getLocales()"
        :key="locale.code"
        :disabled="locale.code === $getLocale()"
        @click="$switchLocale(locale.code)"
      >
        Switch to {{ $t(locale.code) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $getLocale, $switchLocale, $getLocales, $t } = useNuxtApp()
</script>
```

### Example JSON for Locale Switching

```json
{
  "en": "English",
  "fr": "Français",
  "de": "Deutsch"
}
```

### Using `<i18n-switcher>` Component

The `<i18n-switcher>` component provides a dropdown for locale switching with customizable labels:

```vue
<template>
  <div>
    <i18n-switcher
      :custom-labels="{ en: 'English', fr: 'Français', de: 'Deutsch' }"
    />
  </div>
</template>
```

## 🌐 Using `<i18n-link>` for Localized Navigation

The `<i18n-link>` component automatically handles locale-specific routing:

```vue
<template>
  <div>
    <i18n-link to="/about">{{ $t('about') }}</i18n-link>
    <i18n-link :to="{ name: 'index' }">{{ $t('home') }}</i18n-link>
  </div>
</template>

<script setup>
  import { useNuxtApp } from '#imports'

  const { $getLocale, $switchLocale, $getLocales, $t } = useNuxtApp()
</script>
```

### Example JSON for Navigation Links

```json
{
  "about": "About Us",
  "home": "Home"
}
```

### Example with Active Link Styling

```vue
<template>
  <div>
    <i18n-link to="/about" activeClass="current">About Us</i18n-link>
  </div>
</template>
```

### Example JSON for Active Link Styling

The same JSON file can be used as in the previous example for this scenario.

## 📝 Rendering Dynamic Keys from Translation Files

In some scenarios, you may want to iterate over dynamic keys stored within your translation files and render their values conditionally. The example below demonstrates how to achieve this using `Nuxt I18n Micro`.

### Example: Rendering Dynamic Keys

This example fetches an array of keys from a specific translation path (in this case, `dynamic`) and iterates over them. Each key is checked for its existence using `$has` before rendering its value with `$t`.

```vue
<template>
  <div>
    <div
      v-for="key in $t('dynamic')"
      :key="key"
    >
      <p>{{ key }}: <span v-if="$has(key)">{{ $t(key) }}</span></p>
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $t, $has } = useNuxtApp()
</script>
```

### Example Translation File (`en.json`)

```json
{
  "dynamic": ["key1", "key2", "key3"],
  "key1": "This is the first key's value",
  "key2": "This is the second key's value",
  "key3": "This is the third key's value"
}
```

### Example: Rendering Dynamic Keys from an Object

In this example, we handle an object stored within your translation file. We fetch and iterate over the keys of the object, dynamically rendering both the key names and their associated values.

```vue
<template>
  <div>
    <div v-for="(value, key) in $t('dynamicObject')" :key="key">
      <p>{{ key }}: {{ value }}</p>
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $t } = useNuxtApp()
</script>
```

### Example Translation File (`en.json`)

```json
{
  "dynamicObject": {
    "title": "Welcome to our site",
    "description": "This is a brief description of our services.",
    "footerNote": "Thank you for visiting!"
  }
}
```

## 🌟 Using `<i18n-t>` for Translations with Slots and Interpolation

The `<i18n-t>` component is useful for rendering translations with dynamic content and HTML tags:

```vue
<template>
  <i18n-t keypath="greeting" tag="h1">
    <template #default="{ translation }">
      <strong>{{ translation.replace('page', 'page replace') }}</strong> <i>!!!</i>
    </template>
  </i18n-t>
</template>
```

### Example JSON for `<i18n-t>`

```json
{
  "greeting": "Welcome to the page"
}
```

### With Interpolation

```vue
<template>
  <i18n-t keypath="welcome" :params="{ username: 'Alice', unreadCount: 5 }"></i18n-t>
</template>
```

### Example JSON for Interpolation

```json
{
  "welcome": "Hello {username}, you have {unreadCount} unread messages."
}
```

## 📝 Comprehensive Example with Nested Sections

Here's a complex structure demonstrating multiple translation uses within a single page:

```vue
<template>
  <div>
    <h1>{{ $t('mainHeader') }}</h1>

    <nav>
      <ul>
        <li><a href="#">{{ $t('nav.home') }}</a></li>
        <li><a href="#">{{ $t('nav.about') }}</a></li>
        <li><a href="#">{{ $t('nav.services') }}</a></li>
        <li><a href="#">{{ $t('nav.contact') }}</a></li>
      </ul>
    </nav>

    <section>
      <h2>{{ $t('section1.header') }}</h2>
      <p>{{ $t('section1.intro') }}</p>

      <div>
        <h3>{{ $t('section1.subsection1.header') }}</h3>
        <p>{{ $t('section1.subsection1.content') }}</p>
      </div>

      <div>
        <h3>{{ $t('section1.subsection2.header') }}</h3>
        <ul>
          <li>{{ $t('section1.subsection2.item1') }}</li>
          <li>{{ $t('section1.subsection2.item2') }}</li>
          <li>{{ $t('section1.subsection2.item3') }}</li>
        </ul>
      </div>
    </section>

    <footer>
      <h4>{{ $t('footer.contact.header') }}</h4>
      <address>
        {{ $t('footer.contact.address') }}<br>
        {{ $t('footer.contact.city') }}<br>
        {{ $t('footer.contact.phone') }}
      </address>
    </footer>

    <div>
      <button
        v-for="locale in $getLocales()"
        :key="locale.code"
        :disabled="locale.code === $getLocale()"
        @click="$switchLocale(locale.code)"
      >
        Switch to {{ locale.code }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $getLocale, $switchLocale, $getLocales, $t } = useNuxtApp()
</script>
```

### Example JSON for Nested Sections

```json
{
  "mainHeader": "Welcome to Our Services",
  "nav": {
    "home": "Home",
    "about": "About Us",
    "services": "Services",
    "contact": "Contact"
  },
  "section1": {
    "header": "Our Expertise",
    "intro": "We provide a wide range of services to meet your needs.",
    "subsection1": {
      "header": "Consulting",
      "content": "Our team offers expert consulting services in various domains."
    },
    "subsection2": {
      "header": "Development",
      "item1":

 "Web Development",
      "item2": "Mobile Apps",
      "item3": "Custom Software"
    }
  },
  "footer": {
    "contact": {
      "header": "Contact Us",
      "address": "123 Main Street",
      "city": "Anytown, USA",
      "phone": "+1 (555) 123-4567"
    }
  }
}
```


## 🌟 Using `$tc` for Pluralization

The `$tc` function in `Nuxt I18n Micro` handles pluralization based on the count and locale settings. This is useful for dynamically adjusting messages that involve counts, such as items, notifications, or other entities that can vary in number.

### Example: Using `$tc` for Pluralization

In the following example, we display a message indicating the number of apples using `$tc`. The translation key handles multiple plural forms based on the count provided.

```vue
<template>
  <div>
    <!-- Display a pluralized message about the number of apples -->
    <p>{{ $tc('apples', 0) }}</p>  <!-- Outputs: no apples -->
    <p>{{ $tc('apples', 1) }}</p>  <!-- Outputs: one apple -->
    <p>{{ $tc('apples', 10) }}</p> <!-- Outputs: 10 apples -->
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $tc } = useNuxtApp()
</script>
```

### Example JSON for Pluralization

Here's how you can define the translation in your JSON file to handle different plural forms:

```json
{
  "apples": "no apples | one apple | {count} apples"
}
```

### Explanation

- **`$tc('apples', 0)`**: Returns the first form, used when the count is zero (`"no apples"`).
- **`$tc('apples', 1)`**: Returns the second form, used when the count is one (`"one apple"`).
- **`$tc('apples', 10)`**: Returns the third form with the count value, used when the count is two or more (`"10 apples"`).

### Additional Example with More Complex Pluralization

If your application needs to handle more complex pluralization rules (e.g., specific cases for zero, one, two, few, many, other), you can extend the translation strings accordingly:

```json
{
  "apples": "no apples | one apple | two apples | a few apples | many apples | {count} apples"
}
```

- **`$tc('apples', 2)`**: Could be set up to return `"two apples"`.
- **`$tc('apples', 3)`**: Could return `"a few apples"`, depending on the rules defined for the count.
