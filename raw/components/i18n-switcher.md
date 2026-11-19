# `<i18n-switcher>`

`<i18n-switcher>` renders a button with the active locale and a dropdown of all enabled locales, including the active one. Use it for a ready-made language menu; build your own from [`$getLocales`](/api/methods#getlocales) and [`$switchLocalePath`](/api/methods#switchlocalepath) when you need different markup. Each entry links to the current page in that locale.

## Props and slots

<collapsible name="9 props">
<field-group>
<field name="customLabels" type="Record<string, string>">

**Default** `() => ({})` · Display name per locale code, overriding the `displayName` from the locale config.

</field>

<field name="customWrapperStyle" type="CSSProperties">

**Default** `() => ({})` · Inline style for the outer wrapper.

</field>

<field name="customButtonStyle" type="CSSProperties">

**Default** `() => ({})` · Inline style for the button that opens the dropdown.

</field>

<field name="customDropdownStyle" type="CSSProperties">

**Default** `() => ({})` · Inline style for the dropdown panel.

</field>

<field name="customItemStyle" type="CSSProperties">

**Default** `() => ({})` · Inline style for each item in the dropdown.

</field>

<field name="customLinkStyle" type="CSSProperties">

**Default** `() => ({})` · Inline style for the link inside an item.

</field>

<field name="customActiveLinkStyle" type="CSSProperties">

**Default** `() => ({})` · Inline style for the link of the currently active locale.

</field>

<field name="customDisabledLinkStyle" type="CSSProperties">

**Default** `() => ({})` · Inline style for the *current* locale button when it is `disabled: true` in config.

</field>

<field name="customIconStyle" type="CSSProperties">

**Default** `() => ({})` · Inline style for the caret icon on the button.

</field>
</field-group>
</collapsible>

### Slots

<collapsible name="11 slots">
<field-group>
<field name="before-button">

Content before the button that opens the dropdown.

</field>

<field name="before-selected-locale">

Content before the active locale label inside the button.

</field>

<field name="after-selected-locale">

Content after the active locale label inside the button.

</field>

<field name="before-dropdown">

Content between the button and the dropdown panel.

</field>

<field name="before-dropdown-items">

Content at the top of the dropdown, above the locale list.

</field>

<field name="before-item">

Content before each locale entry.

**Bindings** `locale`

</field>

<field name="before-link-content">

Content before a locale's label inside its link.

**Bindings** `locale`

</field>

<field name="after-link-content">

Content after a locale's label inside its link.

**Bindings** `locale`

</field>

<field name="after-item">

Content after each locale entry.

**Bindings** `locale`

</field>

<field name="after-dropdown-items">

Content at the bottom of the dropdown, below the locale list.

</field>

<field name="after-dropdown">

Content after the dropdown panel.

</field>
</field-group>
</collapsible>

## Behaviour

- Lists every locale without `disabled: true`, the active one included.
- Each entry is an `<a>` to `$switchLocalePath(code)`. A path resolves under `app.baseURL`; a locale `baseUrl` on another domain stays absolute. It has `hreflang` and `lang` set to `iso || code`, `dir` when the locale has one, `aria-current="page"` on the current locale, and class `switcher-locale-<code>`. A click calls `$switchLocale(code)` and closes the dropdown; with a modifier key it is left to the browser.
- The list stays in the server HTML, hidden, so crawlers see the links. Escape or a click outside closes it.
- Label: `customLabels[code]`, then the locale's `displayName`, then the code (with a dev warning).
- Styles: small inline defaults (bordered white button and panel, the active entry bold and blue). Each `custom*Style` prop is applied after the default of its part. The button has the classes `i18n-switcher-button` and `language-switcher`, the wrapper `i18n-switcher-wrapper`, the list `i18n-switcher-dropdown`. Positions use logical CSS properties, so `dir="rtl"` works.

## Example

```vue
<template>
  <i18n-switcher
    :custom-labels="{ en: 'English', de: 'Deutsch' }"
    :custom-button-style="{ borderRadius: '4px' }"
  >
    <template #before-link-content="{ locale }">
      <img :src="`/flags/${locale.code}.svg`" alt="" width="16" />
    </template>
  </i18n-switcher>
</template>
```

## Related

<card-group>
<card icon="i-lucide-braces" title="$switchLocale" to="/api/methods#switchlocale">



</card>

<card icon="i-lucide-component" title="<i18n-link>" to="/components/i18n-link">



</card>
</card-group>
