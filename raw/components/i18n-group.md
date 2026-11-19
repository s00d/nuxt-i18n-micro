# `<i18n-group>`

`<i18n-group>` scopes a block of markup to one key prefix. Use it when many keys of a section share a prefix and you do not want to repeat it. The default slot receives a `t` that prepends the prefix.

## Props and slot

<field-group>
<field name="prefix" type="string" :required="true">

Key prefix every lookup inside the slot is resolved against.

</field>

<field name="groupClass" type="string">

**Default** `''` · Extra class on the wrapper element.

</field>
</field-group>

### Slots

<field-group>
<field name="default">

Receives `prefix` and a `t` function scoped to it.

**Bindings** `prefix`, `t`

</field>
</field-group>

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

<card-group>
<card icon="i-lucide-braces" title="$t" to="/api/methods#t">



</card>

<card icon="i-lucide-component" title="<i18n-t>" to="/components/i18n-t">



</card>
</card-group>
