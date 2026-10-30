---
title: '<i18n-t>'
description: 'The <i18n-t> component renders one translation, with plural forms, number and date formatting, HTML and slot interpolation.'
outline: [2, 3]
---

# `<i18n-t>`

`<i18n-t>` renders one translation into an element. Use it when a translation needs components inside it (a link in a sentence), a plural form, or a formatted number or date. It resolves the key for the current route, like `$t`.

## Props

<!-- generated:component:i18n-t — do not edit; run `pnpm run docs:generate` -->

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
| `number` | `number \| string` | — | Formats the value with `$tn` and passes it to the translation as `{number}`, alongside `params`. |
| `date` | `Date \| string \| number` | — | Formats the value with `$td` and passes it to the translation as `{date}`, alongside `params`. |
| `relativeDate` | `Date \| string \| number` | — | Formats the value with `$tdr` and passes it to the translation as `{relativeDate}`, alongside `params`. |

**\*** required.

<!-- /generated:component:i18n-t -->

## Rendering rules

The first matching case decides the output:

1. `number` — renders `$t(keypath, { ...params, number: $tn(number) })`.
2. `date` — renders `$t(keypath, { ...params, date: $td(date) })`.
3. `relativeDate` — renders `$t(keypath, { ...params, relativeDate: $tdr(relativeDate) })`.
4. `plural` — renders `$tc(keypath, { count, ...params })`, or `customPluralRule(keypath, count, params, locale, t)` when set.
5. Otherwise `$t(keypath, params)`: with `hideIfEmpty` an empty result renders `defaultValue` instead; a `default` slot receives `{ translation }` and named slots are ignored; otherwise each named slot replaces its `{name}` placeholder.

`html` applies in every case and renders the result as HTML; slots are then ignored. Slots apply only in case 5.

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

`html` sets `innerHTML`: use it only for translations you control.

## Related

- [Helpers](/api/methods#tc) — `$t`, `$tc`, `$tn`, `$td`, `$tdr`
- [`plural`](/api/module-options#plural) — the app-wide plural rule
