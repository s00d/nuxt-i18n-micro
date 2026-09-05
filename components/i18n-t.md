---
url: 'https://s00d.github.io/nuxt-i18n-micro/components/i18n-t.md'
description: Translation component with slot-based interpolation.
---

# 🌍 `<i18n-t>` Component

The `<i18n-t>` component in `Nuxt I18n Micro` is a flexible translation component that supports dynamic content insertion via slots. It allows you to interpolate translations with custom Vue components or HTML content, enabling advanced localization scenarios.

## ⚙️ Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `keypath` **\*** | `string` | — | Translation key to render. |
| `plural` | `number \| string` | — | Count selecting the plural form. Set it to use `$tc` instead of `$t`. |
| `tag` | `string` | `'span'` | Element to render. |
| `params` | `Record<string, string \| number \| boolean>` | `() => ({})` | Interpolation values substituted into the translation. |
| `defaultValue` | `string` | `''` | Rendered instead of the component when `hideIfEmpty` suppresses an empty translation. |
| `html` | `boolean` | `false` | Render the translation as HTML rather than text. Only for content you control. |
| `hideIfEmpty` | `boolean` | `false` | Render nothing when the translation resolves to an empty string. |
| `customPluralRule` | `PluralFunc` | `null` | Plural rule for this element only, overriding the configured one. |
| `number` | `number \| string` | — | Formats the value with `$tn` and passes it to the translation as `{number}`. |
| `date` | `Date \| string \| number` | — | Formats the value with `$td` and passes it to the translation as `{date}`. |
| `relativeDate` | `Date \| string \| number` | — | Formats the value with `$tdr` and passes it to the translation as `{relativeDate}`. |

**\*** required.

Only one of `plural`, `number`, `date` and `relativeDate` applies at a time; when several
are set, the first in that list wins.

### Examples per prop

```vue
<!-- keypath: the translation to render -->
<i18n-t keypath="feedback.text" />

<!-- plural: selects the plural form -->
<i18n-t keypath="items" :plural="10" />

<!-- params: interpolated into the translation -->
<i18n-t keypath="greeting" :params="{ name: 'Ada' }" />

<!-- tag: the element to render -->
<i18n-t keypath="feedback.text" tag="p" />

<!-- number / date / relativeDate: formatted, then interpolated -->
<i18n-t keypath="cart.total" :number="1234.5" />
<i18n-t keypath="post.published" :date="post.createdAt" />
<i18n-t keypath="post.ago" :relative-date="post.createdAt" />

<!-- hideIfEmpty with a fallback -->
<i18n-t keypath="promo.banner" hide-if-empty default-value="Nothing to show" />
```

```json
{
  "items": "Nothing|You have {count} item|You have {count} items"
}
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
  :customPluralRule="
    (key, count, params, locale, t) => {
      const raw = t(key, params)
      if (!raw) return null
      return count === 1 ? 'One item' : `${count} items`
    }
  "
/>
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
