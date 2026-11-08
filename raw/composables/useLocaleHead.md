# `useLocaleHead`

`useLocaleHead()` builds the i18n head tags for the current route: `lang` and `dir` on `<html>`, a canonical link, `hreflang` alternates with `x-default`, `og:url`, `og:locale` and `og:locale:alternate`. Use it when you set [`meta: false`](/api/module-options#meta) and manage `useHead` yourself; with `meta: true` the module already registers these tags, and per-page changes go through [`useI18nHead`](/composables/useI18nHead).

## Signature

```ts
useLocaleHead(options: UseLocaleHeadOptions): { build: () => LocaleHead; metaObject: Ref<{ htmlAttrs: { dir?: "ltr" | "rtl" | "auto"; lang?: string; [key: string]: string | undefined }; link: ({ href: string; rel: "canonical"; [key: string]: string | undefined } | { href: string; hreflang: string; rel: "alternate"; [key: string]: string | undefined })[]; meta: { content: string; property: string; [key: string]: string }[] }, LocaleHead | { htmlAttrs: { dir?: "ltr" | "rtl" | "auto"; lang?: string; [key: string]: string | undefined }; link: ({ href: string; rel: "canonical"; [key: string]: string | undefined } | { href: string; hreflang: string; rel: "alternate"; [key: string]: string | undefined })[]; meta: { content: string; property: string; [key: string]: string }[] }>; updateMeta: () => void }
```

The SEO head tags for the current route: `hreflang` alternates for every locale plus
`x-default`, a canonical link, `og:locale`, and `lang`/`dir` on `<html>`.

Only needed when `meta` is disabled or the defaults need adjusting — with `meta: true`
the module registers the same tags itself.

<field-group>
<field :required="true" name="options" type="UseLocaleHeadOptions">



</field>
</field-group>

**Returns** — `metaObject`, a ref holding the head object ready to pass to `useHead`; `updateMeta` refreshes it; `build` computes the head object from the current route (reactive when read in a getter, e.g. `useHead(() => build())`)

```ts
const { metaObject } = useLocaleHead({ addSeoAttributes: true })
useHead(metaObject)
```

## Options

<table>
<thead>
  <tr>
    <th>
      Option
    </th>
    
    <th>
      Default
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        addDirAttribute
      </code>
    </td>
    
    <td>
      <code>
        true
      </code>
    </td>
    
    <td>
      Set <code>
        dir
      </code>
      
       on <code>
        <html>
      </code>
      
       from the locale's <code>
        dir
      </code>
      
       (<code>
        'auto'
      </code>
      
       when it has none).
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        identifierAttribute
      </code>
    </td>
    
    <td>
      <code>
        'id'
      </code>
    </td>
    
    <td>
      Attribute that keys each tag (<code>
        i18n-can
      </code>
      
      , <code>
        i18n-og
      </code>
      
      , <code>
        i18n-alternate-<hreflang>
      </code>
      
      , …), so updates replace tags instead of adding them.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        addSeoAttributes
      </code>
    </td>
    
    <td>
      <code>
        true
      </code>
    </td>
    
    <td>
      Emit canonical, <code>
        hreflang
      </code>
      
       and <code>
        og:
      </code>
      
       tags. <code>
        false
      </code>
      
       keeps only <code>
        htmlAttrs
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        baseUrl
      </code>
    </td>
    
    <td>
      <code>
        '/'
      </code>
    </td>
    
    <td>
      Origin joined to every URL. Keep <code>
        '/'
      </code>
      
       for relative URLs; pass <code>
        'https://example.com'
      </code>
      
       for absolute ones.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        autoUpdate
      </code>
    </td>
    
    <td>
      <code>
        true
      </code>
    </td>
    
    <td>
      Rebuild <code>
        metaObject
      </code>
      
       when the route or the <code>
        i18n-locale
      </code>
      
       state changes.
    </td>
  </tr>
</tbody>
</table>

## What it emits

- Nothing on a route with no match (404) or with `disableMeta` for the active locale.
- Canonical and `og:url`: `$switchLocalePath(<active locale>)`, query reduced to [`canonicalQueryWhitelist`](/api/module-options#canonicalquerywhitelist), [`trailingSlash`](/api/module-options#trailingslash) applied.
- `hreflang`: one link per enabled locale the page exists in, `hreflang = iso || code`, skipping locales with `seo: false`; with `hreflangBaseLanguage: true` the first regional locale of a language also emits its bare-language tag. None under `no_prefix`.
- `x-default`: the default locale's URL, unless the strategy is `no_prefix`, the default locale has `seo: false`, or the page does not exist in it.
- `og:locale` / `og:locale:alternate`: from the locale's `og`, or its `iso` converted (`en-US` → `en_US`); skipped with a dev warning when neither works.

## Example

```ts
// app.vue, with i18n.meta: false
const { metaObject } = useLocaleHead({ baseUrl: 'https://example.com' })
useHead(metaObject)
```

`build()` returns the same object without the ref: `useHead(() => build())` stays reactive without a watcher.

## Related

<card-group>
<card icon="i-lucide-book-open" title="SEO" to="/guide/seo">

Base URL resolution, `metaBaseUrl`, per-locale `seo` / `og`

</card>

<card icon="i-lucide-braces" title="useI18nHead" to="/composables/useI18nHead">

Per-page overrides

</card>
</card-group>
