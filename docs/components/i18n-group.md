---
title: '<i18n-group>'
description: 'The <i18n-group> component gives its slot a t function scoped to a key prefix.'
outline: [2, 3]
---

# `<i18n-group>`

`<i18n-group>` scopes a block of markup to one key prefix. Use it when many keys of a section share a prefix and you do not want to repeat it. The default slot receives a `t` that prepends the prefix.

## Props and slot

<!-- generated:component:i18n-group — do not edit; run `pnpm run docs:generate` -->

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `prefix` **\*** | `string` | — | Key prefix every lookup inside the slot is resolved against. |
| `groupClass` | `string` | `''` | Extra class on the wrapper element. |

**\*** required.

### Slots

| Slot | Bindings | Description |
| --- | --- | --- |
| `default` | `prefix`, `t` | Receives `prefix` and a `t` function scoped to it. |

<!-- /generated:component:i18n-group -->

## Behaviour

- Renders `<div class="i18n-group {groupClass}">` around the slot.
- `t(key, params)` is `$t(prefix + '.' + key, params)` for the current route.
- Only the slot's `t` is scoped: `$t` and nested `<i18n-t>` inside the group still take full keys.

## Example

```json
{
  "checkout": { "title": "Checkout", "items": "Items: {count}" }
}
```

```vue
<template>
  <i18n-group prefix="checkout" group-class="checkout">
    <template #default="{ t }">
      <h2>{{ t('title') }}</h2>
      <p>{{ t('items', { count: 3 }) }}</p>
    </template>
  </i18n-group>
</template>
```

## Related

- [`$t`](/api/methods#t)
- [`<i18n-t>`](/components/i18n-t)
