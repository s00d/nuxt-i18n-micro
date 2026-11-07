# Frameworks

The `@i18n-micro/*` packages bring the translation core of Nuxt I18n Micro to Vue, React, Preact, Solid, Astro, VitePress and plain JavaScript. Use them when your app is not a Nuxt app, or when a script or server outside Nuxt needs the same translation files. Every package shares one instance model, one router adapter contract and the same four components, described once on this page.

## Packages

<table>
<thead>
  <tr>
    <th>
      Stack
    </th>
    
    <th>
      Package
    </th>
    
    <th>
      Router entry
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <a href="/integrations/vue-package">
        Vue 3 SPA
      </a>
    </td>
    
    <td>
      <code>
        @i18n-micro/vue
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/vue/router
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/integrations/react-package">
        React
      </a>
    </td>
    
    <td>
      <code>
        @i18n-micro/react
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/react/router
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/integrations/react-package#preact">
        Preact
      </a>
    </td>
    
    <td>
      <code>
        @i18n-micro/preact
      </code>
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/integrations/solid-package">
        SolidJS
      </a>
    </td>
    
    <td>
      <code>
        @i18n-micro/solid
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/solid/router
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/integrations/astro-package">
        Astro
      </a>
      
      : SSR and <a href="/integrations/astro-islands">
        islands
      </a>
    </td>
    
    <td>
      <code>
        @i18n-micro/astro
      </code>
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/integrations/vitepress-package">
        VitePress
      </a>
    </td>
    
    <td>
      <code>
        @i18n-micro/vitepress
      </code>
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/integrations/runtime-package">
        Browser or edge
      </a>
      
      , no framework
    </td>
    
    <td>
      <code>
        @i18n-micro/runtime
      </code>
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/integrations/nodejs-package">
        Node.js
      </a>
      
       server, CLI
    </td>
    
    <td>
      <code>
        @i18n-micro/node
      </code>
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/integrations/types-generator">
        Typed keys
      </a>
      
      , Vite or Nuxt
    </td>
    
    <td>
      <code>
        @i18n-micro/types-generator
      </code>
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/integrations/devtools-ui-package">
        Translation editor
      </a>
      
       in dev
    </td>
    
    <td>
      <code>
        @i18n-micro/devtools-ui
      </code>
    </td>
    
    <td>
      —
    </td>
  </tr>
</tbody>
</table>

The router entry is a separate import, so an app without a router never bundles one.

`@i18n-micro/core`, `@i18n-micro/types` and `@i18n-micro/utils` are installed with these packages; you rarely import them directly. Signatures of every export are on the generated [package reference](/api/packages).

Each package has a playground under `packages/<name>/playground` in the repository.

## The instance

`createI18n(options)` returns one instance that holds the dictionaries, the current locale and the current route. The options are the same in every package:

<table>
<thead>
  <tr>
    <th>
      Option
    </th>
    
    <th>
      Type
    </th>
    
    <th>
      Default
    </th>
    
    <th>
      Notes
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        locale
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      required
    </td>
    
    <td>
      Active locale.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        fallbackLocale
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      <code>
        locale
      </code>
    </td>
    
    <td>
      Looked up when a key is missing in <code>
        locale
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        messages
      </code>
    </td>
    
    <td>
      <code>
        Record<locale, Translations>
      </code>
    </td>
    
    <td>
      <code>
        {}
      </code>
    </td>
    
    <td>
      Root dictionaries (<code>
        'index'
      </code>
      
       route).
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        routeMessages
      </code>
    </td>
    
    <td>
      <code>
        Record<route, Record<locale, Translations>>
      </code>
    </td>
    
    <td>
      <code>
        {}
      </code>
    </td>
    
    <td>
      Route dictionaries. Runtime, React, Preact, Node and VitePress only.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        plural
      </code>
    </td>
    
    <td>
      <code>
        PluralFunc
      </code>
    </td>
    
    <td>
      <code>
        defaultPlural
      </code>
    </td>
    
    <td>
      Custom plural rule.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        missingWarn
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        true
      </code>
    </td>
    
    <td>
      Dev-only <code>
        console.warn
      </code>
      
       in the browser for a missing key.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        missingHandler
      </code>
    </td>
    
    <td>
      <code>
        (locale, key, routeName) => void
      </code>
    </td>
    
    <td>
      —
    </td>
    
    <td>
      Called instead of the warning.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        numberFormats
      </code>
    </td>
    
    <td>
      <code>
        Record<locale, Record<name, Intl.NumberFormatOptions>>
      </code>
    </td>
    
    <td>
      —
    </td>
    
    <td>
      Named formats: <code>
        tn(9.5, 'currency')
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        datetimeFormats
      </code>
    </td>
    
    <td>
      <code>
        Record<locale, Record<name, Intl.DateTimeFormatOptions>>
      </code>
    </td>
    
    <td>
      —
    </td>
    
    <td>
      Named formats: <code>
        td(date, 'short')
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        timeZone
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      runtime's zone
    </td>
    
    <td>
      IANA zone for <code>
        td
      </code>
      
       dates; it does not affect <code>
        tdr
      </code>
      
      . Set it so server and browser render one date.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        now
      </code>
    </td>
    
    <td>
      <code>
        () => number
      </code>
    </td>
    
    <td>
      <code>
        Date.now
      </code>
    </td>
    
    <td>
      The clock of <code>
        tdr
      </code>
      
      . Hand hydration the server's time so both render one text.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        localeIso
      </code>
    </td>
    
    <td>
      <code>
        Record<code, string>
      </code>
    </td>
    
    <td>
      —
    </td>
    
    <td>
      BCP 47 tag used for plural rules (<code>
        ua
      </code>
      
       → <code>
        uk-UA
      </code>
      
      ). React, Preact and Solid take it from <code>
        iso
      </code>
      
       in the provider's <code>
        locales
      </code>
      
      .
    </td>
  </tr>
</tbody>
</table>

The dictionaries live in `i18n.storage.translations`, a `Map` keyed `locale:route` (`en:index`, `en:about`).

A key is looked up in the current route's dictionary, then in the root dictionary, first for `locale`, then for `fallbackLocale`. A missing key returns the key itself (or the `defaultValue` you pass).

```ts
i18n.addTranslations('en', { nav: { home: 'Home' } }) // root, deep-merged
i18n.addRouteTranslations('en', 'about', { title: 'About us' }) // route chunk
i18n.addTranslations('en', { nav: { home: 'Start' } }, false) // replace instead of merge
i18n.setRoute('about')
i18n.t('title') // 'About us'
i18n.t('nav.home') // 'Start' (root key, still visible on the route)
```

### Translate and format

<table>
<thead>
  <tr>
    <th>
      Method
    </th>
    
    <th>
      Returns
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        t(key, params?, defaultValue?, routeName?)
      </code>
    </td>
    
    <td>
      The value (string, number, object) with <code>
        {param}
      </code>
      
       interpolated.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ts(...)
      </code>
    </td>
    
    <td>
      Same as <code>
        t
      </code>
      
      , as a string.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        tc(key, count | params, defaultValue?)
      </code>
    </td>
    
    <td>
      Plural form.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        tn(value, options | name)
      </code>
    </td>
    
    <td>
      <code>
        Intl.NumberFormat
      </code>
      
       in the active locale.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        td(value, options | name)
      </code>
    </td>
    
    <td>
      <code>
        Intl.DateTimeFormat
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        tdr(value, options?)
      </code>
    </td>
    
    <td>
      Relative time (<code>
        3 days ago
      </code>
      
      ).
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        has(key, routeName?)
      </code>
    </td>
    
    <td>
      <code>
        true
      </code>
      
       when the active locale has the key (route or root dictionary; the fallback is not checked).
    </td>
  </tr>
</tbody>
</table>

`defaultPlural` splits the value on `|` and picks the form at index `count`, clamped to the last one; a negative, fractional or `NaN` count picks the last form.

A custom `plural` receives `(key, count, params, locale, getter)`. Read the value through `getter(key)`; do not split the key:

```ts
import type { PluralFunc } from '@i18n-micro/vue'

const plural: PluralFunc = (key, count, params, _locale, getter) => {
  const value = getter(key)
  if (typeof value !== 'string') return null
  const forms = value.split('|').map((form) => form.trim())
  return (count === 1 ? forms[0] : forms[1] ?? forms[0])!.replace('{count}', String(count))
}
```

## Router adapter

The SPA packages do not depend on a router. A router adapter (`I18nRoutingStrategy`) tells them how to read the current path, navigate and build a localized path. The built-in adapters prefix every locale except `defaultLocale` (`/about`, `/de/about`).

<table>
<thead>
  <tr>
    <th>
      Member
    </th>
    
    <th>
      Required
    </th>
    
    <th>
      Used by
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        getCurrentPath(): string
      </code>
    </td>
    
    <td>
      yes
    </td>
    
    <td>
      active link check (by page, query and hash do not count), <code>
        switchLocale
      </code>
      
       (keeps them)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        push({ path }): void
      </code>
    </td>
    
    <td>
      yes
    </td>
    
    <td>
      <code>
        switchLocale
      </code>
      
      , <code>
        <I18nLink>
      </code>
      
       without <code>
        linkComponent
      </code>
      
      , <code>
        <I18nSwitcher>
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        replace({ path }): void
      </code>
    </td>
    
    <td>
      yes
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        resolvePath(to, locale)
      </code>
    </td>
    
    <td>
      no
    </td>
    
    <td>
      <code>
        localePath
      </code>
      
      , <code>
        localeRoute
      </code>
      
      , <code>
        <I18nLink>
      </code>
      
      ; without it paths are returned as is
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        linkComponent
      </code>
    </td>
    
    <td>
      no
    </td>
    
    <td>
      <code>
        <I18nLink>
      </code>
      
       renders it (e.g. <code>
        RouterLink
      </code>
      
      ) instead of <code>
        <a>
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        getRoute()
      </code>
    </td>
    
    <td>
      no
    </td>
    
    <td>
      <code>
        { fullPath, query }
      </code>
      
       for SEO helpers
    </td>
  </tr>
</tbody>
</table>

`push` and `replace` are required in Vue, React, Preact and Solid. Astro has its own, server-side adapter with optional `push`/`replace` (see [Astro](/integrations/astro-package#router-adapter)).

A minimal adapter for any history-based router:

```ts
import type { I18nRoutingStrategy } from '@i18n-micro/react'

const locales = ['en', 'de']
const stripLocale = (path: string) => path.replace(/^\/(en|de)(?=\/|$)/, '') || '/'

export const historyAdapter: I18nRoutingStrategy = {
  getCurrentPath: () => window.location.pathname + window.location.search + window.location.hash,
  push: ({ path }) => window.history.pushState({}, '', path),
  replace: ({ path }) => window.history.replaceState({}, '', path),
  resolvePath: (to, locale) => {
    const path = stripLocale(typeof to === 'string' ? to : to.path || '/')
    return locale === 'en' ? path : `/${locale}${path === '/' ? '' : path}`
  },
}
```

## Components

Vue, React, Preact and Solid ship the same four components. Their props match; React, Preact and Solid pass other props through to the root element.

### `<I18nT>`

<table>
<thead>
  <tr>
    <th>
      Prop
    </th>
    
    <th>
      Type
    </th>
    
    <th>
      Notes
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        keypath
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      required
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        params
      </code>
    </td>
    
    <td>
      <code>
        object
      </code>
    </td>
    
    <td>
      interpolation values
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        plural
      </code>
    </td>
    
    <td>
      <code>
        number | string
      </code>
    </td>
    
    <td>
      renders <code>
        tc(keypath, count)
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        number
      </code>
    </td>
    
    <td>
      <code>
        number | string
      </code>
    </td>
    
    <td>
      passes <code>
        tn(number)
      </code>
      
       as <code>
        {number}
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        date
      </code>
    </td>
    
    <td>
      <code>
        Date | string | number
      </code>
    </td>
    
    <td>
      passes <code>
        td(date)
      </code>
      
       as <code>
        {date}
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        relativeDate
      </code>
    </td>
    
    <td>
      <code>
        Date | string | number
      </code>
    </td>
    
    <td>
      passes <code>
        tdr(relativeDate)
      </code>
      
       as <code>
        {relativeDate}
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        tag
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      wrapper element, default <code>
        span
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        html
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      render the translation as HTML; it must be trusted, params are escaped
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        defaultValue
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      stands in for a missing key, and is rendered bare when <code>
        hideIfEmpty
      </code>
      
       hides an empty value
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        hideIfEmpty
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      render nothing for an empty translation
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        customPluralRule
      </code>
    </td>
    
    <td>
      <code>
        PluralFunc
      </code>
    </td>
    
    <td>
      plural rule for this element
    </td>
  </tr>
</tbody>
</table>

Only one formatting prop applies, checked in this order: `number`, `date`, `relativeDate`, `plural`.

#### Rich text

A `{placeholder}` can hold an element. In Vue it is a named slot; in React, Preact and Solid the `components` prop gives elements, or functions returning one, by name. Either way it beats a param of the same name, works in every branch, and survives a locale that reorders the placeholders.

```tsx
// { "terms": "I accept the {link} of {company}" }
<I18nT keypath="terms" params={{ company: 'ACME' }} components={{ link: <a href="/terms">terms</a> }} />
```

In Solid pass a function when a placeholder repeats: one node stands in one place. `children` replace the text, as a function they get `{ translation }`, like Vue's default slot. `html` ignores all of these.

### `<I18nLink>`

<table>
<thead>
  <tr>
    <th>
      Prop
    </th>
    
    <th>
      Type
    </th>
    
    <th>
      Notes
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        to
      </code>
    </td>
    
    <td>
      <code>
        string | { path }
      </code>
    </td>
    
    <td>
      localized through the adapter's <code>
        resolvePath
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        activeStyle
      </code>
    </td>
    
    <td>
      style object
    </td>
    
    <td>
      merged over <code>
        style
      </code>
      
       on the current page; React, Preact and Solid also apply it to a section above
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        localeRoute
      </code>
    </td>
    
    <td>
      function
    </td>
    
    <td>
      overrides <code>
        resolvePath
      </code>
      
       for this link
    </td>
  </tr>
</tbody>
</table>

External URLs (`https://`, `mailto:`, `tel:`) render as `<a target="_blank" rel="noopener noreferrer">`; a `target` or `rel` of your own wins. `onClick` always runs. A modified click, another mouse button or a `target` stays with the browser.

### `<I18nSwitcher>`

A dropdown of enabled locales (`disabled: true` locales are hidden) with inline default styles. Its items are links, with `lang`, `hreflang` and `dir` from the locale. By default, clicking one sets the locale and calls the adapter's `push` with the localized current path; a `switchLocale` prop replaces that action. With a `localeRoute` and no router, the browser follows the link. Escape or a click outside closes it.

<table>
<thead>
  <tr>
    <th>
      Prop
    </th>
    
    <th>
      Notes
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        locales
      </code>
      
      , <code>
        currentLocale
      </code>
      
      , <code>
        getLocaleName
      </code>
    </td>
    
    <td>
      override the provided values
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        switchLocale(code)
      </code>
    </td>
    
    <td>
      replaces the built-in switch
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        localeRoute
      </code>
    </td>
    
    <td>
      replaces <code>
        resolvePath
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        customLabels
      </code>
    </td>
    
    <td>
      <code>
        { de: 'DE' }
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        customWrapperStyle
      </code>
      
      , <code>
        customButtonStyle
      </code>
      
      , <code>
        customDropdownStyle
      </code>
      
      , <code>
        customItemStyle
      </code>
      
      , <code>
        customLinkStyle
      </code>
      
      , <code>
        customActiveLinkStyle
      </code>
      
      , <code>
        customDisabledLinkStyle
      </code>
      
      , <code>
        customIconStyle
      </code>
    </td>
    
    <td>
      style overrides
    </td>
  </tr>
</tbody>
</table>

### `<I18nGroup>`

A `<div class="i18n-group">` that hands a prefixed `t` to its children. It does **not** prefix `<I18nT>` or `t()` calls inside it; only the `t` it passes down is prefixed.

<table>
<thead>
  <tr>
    <th>
      Prop
    </th>
    
    <th>
      Notes
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        prefix
      </code>
    </td>
    
    <td>
      required, e.g. <code>
        'profile'
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        groupClass
      </code>
    </td>
    
    <td>
      extra class on the wrapper
    </td>
  </tr>
</tbody>
</table>

The prefixed `t` comes through a scoped slot in Vue (`v-slot="{ t }"`) and a render-prop child in React, Preact and Solid (`{({ t }) => …}`).

## Typed keys

`t()` accepts any string. To get autocomplete for your keys, generate a declaration with the [types generator](/integrations/types-generator). Keys are suggested, not enforced, and params are not typed.

## Compared with the Nuxt module

The packages have no file-based routing, no server middleware and no translation loader: you decide when to load JSON (`import`, `fetch`, or `@i18n-micro/node` on the server) and which router adapter to use. Locale detection, SEO meta and route generation are Nuxt features; Astro has its own middleware for detection and `useLocaleHead` for SEO.

## Related

<card-group>
<card icon="i-lucide-braces" title="Package reference" to="/api/packages">

Every export and signature

</card>

<card icon="i-lucide-book-open" title="Translations" to="/guide/translations">

The file layout these packages read

</card>

<card icon="i-lucide-book-open" title="Getting started with Nuxt" to="/guide/getting-started">



</card>
</card-group>
