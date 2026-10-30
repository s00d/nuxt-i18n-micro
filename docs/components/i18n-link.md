---
title: '<i18n-link>'
description: 'The <i18n-link> component is a NuxtLink to the route in the active locale; external URLs open in a new tab.'
outline: [2, 3]
---

# `<i18n-link>`

`<i18n-link>` renders a `NuxtLink` to `to` in the active locale. Use it instead of `<NuxtLink :to="$localePath(...)">` in templates. An external URL becomes a plain `<a target="_blank" rel="noopener noreferrer">`.

## Props

<!-- generated:component:i18n-link — do not edit; run `pnpm run docs:generate` -->

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `to` **\*** | `RouteLocationNamedRaw \| RouteLocationResolvedGeneric \| string` | — | Target route. Localized automatically; an external URL is passed through unchanged. |
| `activeStyle` | `Partial<CSSStyleValue>` | — | Inline style applied while the link points at the current route. |

**\*** required.

### Slots

| Slot | Bindings | Description |
| --- | --- | --- |
| `default` | — | Link content. |

<!-- /generated:component:i18n-link -->

## Behaviour

- `to` goes through [`$localePath`](/api/methods#localepath): a path, a named route or a route object, with custom locale paths applied.
- External: a string starting with `http://`, `https://` or `//`, a bare domain (`example.com`), or a `tel:` / `mailto:` link. A bare domain gets `https://`.
- Active: when the current `route.path` equals the localized path (query and hash ignored), `activeStyle` is applied. There is no active class and no default active style.
- Other attributes (`class`, `aria-*`) fall through to the link.

## Example

```vue
<template>
  <i18n-link to="/about" :active-style="{ fontWeight: 'bold' }">{{ $t('nav.about') }}</i18n-link>
  <i18n-link :to="{ name: 'blog-slug', params: { slug: 'hello' } }">{{ $t('nav.post') }}</i18n-link>
  <i18n-link to="https://github.com/s00d/nuxt-i18n-micro">GitHub</i18n-link>
</template>
```

## Related

- [`$localePath`](/api/methods#localepath)
- [`<i18n-switcher>`](/components/i18n-switcher) — links to the current page in other locales
