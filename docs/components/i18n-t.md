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
| `plural` | `number \| string \| null` | — | Count selecting the plural form. Set it to use `$tc` instead of `$t`. `null` means unset. |
| `tag` | `string` | `'span'` | Element to render. |
| `params` | `Record<string, string \| number \| boolean>` | — | Interpolation values substituted into the translation. |
| `defaultValue` | `string` | `''` | Rendered instead of the component when `hideIfEmpty` suppresses an empty translation. |
| `html` | `boolean` | `false` | Render the translation as HTML rather than text. Only for translations you control: `params` are escaped, the translation is not. |
| `hideIfEmpty` | `boolean` | `false` | Render nothing when the translation resolves to an empty string. |
| `customPluralRule` | `PluralFunc` | `null` | Plural rule for this element only, overriding the configured one. Its answer is used as is; `null` renders empty. |
| `number` | `number \| string \| null` | — | Formats the value with `$tn` and passes it to the translation as `{number}`, alongside `params`. |
| `date` | `Date \| string \| number \| null` | — | Formats the value with `$td` and passes it to the translation as `{date}`, alongside `params`. |
| `relativeDate` | `Date \| string \| number \| null` | — | Formats the value with `$tdr` and passes it to the translation as `{relativeDate}`, alongside `params`. |

**\*** required.

<!-- /generated:component:i18n-t -->

## Rendering rules

The first matching case decides the output:

1. `number` — the translation with `{ ...params, number: $tn(number) }`.
2. `date` — the translation with `{ ...params, date: $td(date) }`.
3. `relativeDate` — the translation with `{ ...params, relativeDate: $tdr(relativeDate) }`.
4. `plural` — the form `$tc` picks, with `{ ...params, count }`; or `customPluralRule(keypath, count, params, locale, t)` when set, whose answer is used as is, `null` being empty.
5. Otherwise the translation with `params`.

`null` counts as not set. In every case:

- `hideIfEmpty` renders `defaultValue` instead of a blank result.
- `html` renders the result as HTML. `params` are escaped, the translation is not; slots are ignored.
- A `default` slot receives `{ translation }`, and named slots are ignored.
- Otherwise each named slot replaces every `{name}` placeholder, before a param of that name. A param value that looks like a placeholder stays text.

`date` and `relativeDate` output carries `data-allow-mismatch="text"`, because the server's clock and time zone are not the browser's. Set [`timeZone`](/api/module-options#timezone) to render one date in both.

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

`html` sets `innerHTML`: use it only for translations you control. `params` are escaped, so user data is safe there.

## Related

- [Helpers](/api/methods#tc) — `$t`, `$tc`, `$tn`, `$td`, `$tdr`
- [`plural`](/api/module-options#plural) — the app-wide plural rule
