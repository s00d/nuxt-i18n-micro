# `<i18n-link>`

`<i18n-link>` renders a `NuxtLink` to `to` in the active locale. Use it instead of `<NuxtLink :to="$localePath(...)">` in templates. An external URL becomes a plain `<a target="_blank" rel="noopener noreferrer">`.

## Props

<field-group>
<field name="to" type="RouteLocationNamedRaw | RouteLocationResolvedGeneric | string" :required="true">

Target route. Localized automatically; an external URL is passed through unchanged.

</field>

<field name="activeStyle" type="CSSProperties">

Inline style applied while the link points at the current route.

</field>
</field-group>

### Slots

<field-group>
<field name="default">

Link content.

</field>
</field-group>

## Behaviour

- `to` goes through [`$localePath`](/api/methods#localepath): a path, a named route or a route object, with custom locale paths applied.
- External: a string starting with `http://`, `https://` or `//`, a bare domain (`example.com`), or a `tel:` / `mailto:` link. A bare domain gets `https://`, and any slash-less dotted string counts as one: write a local file as `/report.pdf`, not `report.pdf`.
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

<card-group>
<card icon="i-lucide-braces" title="$localePath" to="/api/methods#localepath">



</card>

<card icon="i-lucide-component" title="<i18n-switcher>" to="/components/i18n-switcher">

Links to the current page in other locales

</card>
</card-group>
