# `<i18n-t>`

`<i18n-t>` renders one translation into an element. Use it when a translation needs components inside it (a link in a sentence), a plural form, or a formatted number or date. It resolves the key for the current route, like `$t`.

## Props

<collapsible name="11 props">
<field-group>
<field name="keypath" type="string" :required="true">

Translation key to render.

</field>

<field name="plural" type="number | string | null">

Count selecting the plural form. Set it to use `$tc` instead of `$t`. `null` means unset.

</field>

<field name="tag" type="string">

**Default** `'span'` · Element to render.

</field>

<field name="params" type="Record<string, string | number | boolean>">

Interpolation values substituted into the translation.

</field>

<field name="defaultValue" type="string">

**Default** `''` · Rendered instead of the component when `hideIfEmpty` suppresses an empty translation.

</field>

<field name="html" type="boolean">

**Default** `false` · Render the translation as HTML rather than text. Only for translations you control: `params` are escaped, the translation is not.

</field>

<field name="hideIfEmpty" type="boolean">

**Default** `false` · Render nothing when the translation resolves to an empty string.

</field>

<field name="customPluralRule" type="PluralFunc">

**Default** `null` · Plural rule for this element only, overriding the configured one. Its answer is used as is; `null` renders empty.

</field>

<field name="number" type="number | string | null">

Formats the value with `$tn` and passes it to the translation as `{number}`, alongside `params`.

</field>

<field name="date" type="Date | string | number | null">

Formats the value with `$td` and passes it to the translation as `{date}`, alongside `params`.

</field>

<field name="relativeDate" type="Date | string | number | null">

Formats the value with `$tdr` and passes it to the translation as `{relativeDate}`, alongside `params`.

</field>
</field-group>
</collapsible>

## Rendering rules

The first matching case decides the output:

1. `number` — the translation with `{ ...params, number: $tn(number) }`.
2. `date` — the translation with `{ ...params, date: $td(date) }`.
3. `relativeDate` — the translation with `{ ...params, relativeDate: $tdr(relativeDate) }`.
4. `plural` — the form `$tc` picks, the [`=0 ` marker](/api/methods#tc) included, with `{ ...params, count }`; or `customPluralRule(keypath, count, params, locale, t)` when set, which reads the raw value, marker included, and whose answer is used as is, `null` being empty.
5. Otherwise the translation with `params`.

`null` counts as not set. In every case:

- `defaultValue` stands in for a missing key, in every branch.
- `hideIfEmpty` renders `defaultValue` instead of a blank result.
- `html` renders the result as HTML. `params` are escaped, the translation is not; slots are ignored.
- A `default` slot receives `{ translation }`, and named slots are ignored.
- Otherwise each named slot replaces every `{name}` placeholder, before a param of that name. A param value that looks like a placeholder stays text.

`date` and `relativeDate` output carries `data-allow-mismatch="text"`, because the server's time zone and clock are not the browser's. Set [`timeZone`](/api/module-options#timezone) to render one calendar date in both; `relativeDate` depends on the clock, so it can still differ.

## Example

```json
{
  "terms": "I accept the {link}.",
  "termsLink": "terms of use",
  "items": "no items | one item | {count} items"
}
```

```vue
<template>
  <i18n-t keypath="terms" tag="p">
    <template #link>
      <NuxtLink :to="$localePath('/terms')">{{ $t('termsLink') }}</NuxtLink>
    </template>
  </i18n-t>

  <i18n-t keypath="items" :plural="cart.length" />
</template>
```

`html` sets `innerHTML`: use it only for translations you control. `params` are escaped, so user data is safe there, and so is a key that found no translation.

## Related

<card-group>
<card icon="i-lucide-braces" title="Helpers" to="/api/methods#tc">

`$t`, `$tc`, `$tn`, `$td`, `$tdr`

</card>

<card icon="i-lucide-braces" title="plural" to="/api/module-options#plural">

The app-wide plural rule

</card>
</card-group>
