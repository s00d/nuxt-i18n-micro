# `useI18nHead`

`useI18nHead()` changes the SEO tags the module generates, for one page only. Use it when a page knows better than the router: a CMS article that exists in some locales only, a canonical URL from an API, extra `og:` tags. You get the generated tags with your overrides merged on top.

## Signature

```ts
useI18nHead(input?: MaybeRefOrGetter<I18nHeadInput | null>): { pageHead: any; resetPageHead: () => void }
```

Register page-level overrides for i18n SEO head tags.
Merged on top of `useLocaleHead` output by the `02.meta` plugin.

Prefer a getter (`() => ({ … })`) when values come from `$t` / `t` so they
re-resolve on locale change. A plain object is evaluated once and stays frozen.

<field-group>
<field name="input" type="MaybeRefOrGetter<I18nHeadInput | null>">



</field>
</field-group>

It works with [`meta: true`](/api/module-options#meta) (the default): the module's meta plugin merges the input over the [`useLocaleHead`](/composables/useLocaleHead) output on every head render. With `meta: false` nothing reads it.

The override is reset when the route name changes. A page that sets `disableMeta` gets no i18n tags at all, overrides included.

## Input

`I18nHeadInput` (from `@i18n-micro/types`):

<table>
<thead>
  <tr>
    <th>
      Key
    </th>
    
    <th>
      Type
    </th>
    
    <th>
      Effect
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        htmlAttrs
      </code>
    </td>
    
    <td>
      <code>
        Record<string, string>
      </code>
    </td>
    
    <td>
      Merged into the <code>
        <html>
      </code>
      
       attributes (<code>
        lang
      </code>
      
      , <code>
        dir
      </code>
      
      ).
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        meta
      </code>
    </td>
    
    <td>
      <code>
        I18nHeadMeta[]
      </code>
    </td>
    
    <td>
      Added after the generated tags; replaces a tag with the same <code>
        id
      </code>
      
      , <code>
        property
      </code>
      
       or <code>
        name
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        link
      </code>
    </td>
    
    <td>
      <code>
        I18nHeadLink[]
      </code>
    </td>
    
    <td>
      Added after the generated links; replaces a link with the same <code>
        id
      </code>
      
      , or <code>
        rel
      </code>
      
       + <code>
        hreflang
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        replace.canonical
      </code>
    </td>
    
    <td>
      <code>
        string | false
      </code>
    </td>
    
    <td>
      Replace the canonical <code>
        href
      </code>
      
      , or remove the link.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        replace.hreflang
      </code>
    </td>
    
    <td>
      <code>
        I18nHeadLink[] | false
      </code>
    </td>
    
    <td>
      Replace or remove <strong>
        every
      </strong>
      
       <code>
        rel="alternate"
      </code>
      
       link, <code>
        x-default
      </code>
      
       included.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        replace.xDefault
      </code>
    </td>
    
    <td>
      <code>
        I18nHeadLink | false
      </code>
    </td>
    
    <td>
      Replace or remove the <code>
        x-default
      </code>
      
       link.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        replace.ogLocale
      </code>
    </td>
    
    <td>
      <code>
        string | false
      </code>
    </td>
    
    <td>
      Replace or remove <code>
        og:locale
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        replace.ogUrl
      </code>
    </td>
    
    <td>
      <code>
        string | false
      </code>
    </td>
    
    <td>
      Replace or remove <code>
        og:url
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        replace.ogAlternates
      </code>
    </td>
    
    <td>
      <code>
        string[] | false
      </code>
    </td>
    
    <td>
      Rebuild <code>
        og:locale:alternate
      </code>
      
       from these locale codes (via <code>
        og
      </code>
      
       / <code>
        iso
      </code>
      
      ), skipping the current locale, unknown codes and codes without an <code>
        og
      </code>
      
       or <code>
        iso
      </code>
      
       value, or remove them.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        disable
      </code>
    </td>
    
    <td>
      <code>
        I18nHeadDisableGroup[]
      </code>
    </td>
    
    <td>
      Drop generated groups: <code>
        'hreflang'
      </code>
      
       (not <code>
        x-default
      </code>
      
      ), <code>
        'x-default'
      </code>
      
      , <code>
        'canonical'
      </code>
      
      , <code>
        'og'
      </code>
      
       (<code>
        og:locale
      </code>
      
       + <code>
        og:url
      </code>
      
      ), <code>
        'og-alternates'
      </code>
      
      , <code>
        'html'
      </code>
      
      .
    </td>
  </tr>
</tbody>
</table>

Order of application: `disable`, then `replace`, then `htmlAttrs`, `meta`, `link`.

## Example

An article that exists in some locales only, with alternate URLs from the API:

```vue
<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
const { data: article } = await useFetch<{ title: string; urls: Record<string, string> }>(`/api/articles/${route.params.slug}`)

useI18nHead(() => {
  if (!article.value) return null
  const codes = Object.keys(article.value.urls)
  return {
    meta: [{ property: 'og:title', content: article.value.title || t('blog.title') }],
    replace: {
      hreflang: codes.map((code) => ({ rel: 'alternate', hreflang: code, href: article.value!.urls[code]! })),
      ogAlternates: codes,
    },
  }
})
</script>
```

Pass a getter, as here, when values come from `t()` or async data: it re-runs on locale change. A plain object is read once.

## Related

<card-group>
<card icon="i-lucide-book-open" title="SEO" to="/guide/seo">

What the module generates and how to configure it

</card>

<card icon="i-lucide-braces" title="useLocaleHead" to="/composables/useLocaleHead">

The generated tags as an object

</card>
</card-group>
