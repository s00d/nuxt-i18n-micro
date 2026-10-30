---
title: 'useI18nHead'
description: 'useI18nHead overrides the generated i18n SEO tags for one page: replace or drop canonical, hreflang and og tags, or add your own.'
outline: [2, 3]
---

# `useI18nHead`

`useI18nHead()` changes the SEO tags the module generates, for one page only. Use it when a page knows better than the router: a CMS article that exists in some locales only, a canonical URL from an API, extra `og:` tags. You get the generated tags with your overrides merged on top.

## Signature

<!-- generated:symbol:useI18nHead — do not edit; run `pnpm run docs:generate` -->

```ts
useI18nHead(input?: MaybeRefOrGetter<I18nHeadInput | null>): { pageHead: any; resetPageHead: () => void }
```

Register page-level overrides for i18n SEO head tags.
Merged on top of `useLocaleHead` output by the `02.meta` plugin.

Prefer a getter (`() => ({ … })`) when values come from `$t` / `t` so they
re-resolve on locale change. A plain object is evaluated once and stays frozen.

| Parameter | Type | Description |
| --- | --- | --- |
| `input` *(optional)* | `MaybeRefOrGetter<I18nHeadInput \| null>` |  |

<!-- /generated:symbol:useI18nHead -->

It works with [`meta: true`](/api/module-options#meta) (the default): the module's meta plugin merges the input over the [`useLocaleHead`](/composables/useLocaleHead) output on every head render. With `meta: false` nothing reads it.

The override is reset when the route name changes. A page that sets `disableMeta` gets no i18n tags at all, overrides included.

## Input

`I18nHeadInput` (from `@i18n-micro/types`):

| Key | Type | Effect |
| --- | --- | --- |
| `htmlAttrs` | `Record<string, string>` | Merged into the `<html>` attributes (`lang`, `dir`). |
| `meta` | `I18nHeadMeta[]` | Added after the generated tags; replaces a tag with the same `id`, `property` or `name`. |
| `link` | `I18nHeadLink[]` | Added after the generated links; replaces a link with the same `id`, or `rel` + `hreflang`. |
| `replace.canonical` | `string \| false` | Replace the canonical `href`, or remove the link. |
| `replace.hreflang` | `I18nHeadLink[] \| false` | Replace or remove **every** `rel="alternate"` link, `x-default` included. |
| `replace.xDefault` | `I18nHeadLink \| false` | Replace or remove the `x-default` link. |
| `replace.ogLocale` | `string \| false` | Replace or remove `og:locale`. |
| `replace.ogUrl` | `string \| false` | Replace or remove `og:url`. |
| `replace.ogAlternates` | `string[] \| false` | Rebuild `og:locale:alternate` from these locale codes (via `og` / `iso`), or remove them. |
| `disable` | `I18nHeadDisableGroup[]` | Drop generated groups: `'hreflang'` (not `x-default`), `'x-default'`, `'canonical'`, `'og'` (`og:locale` + `og:url`), `'og-alternates'`, `'html'`. |

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

- [SEO](/guide/seo) — what the module generates and how to configure it
- [`useLocaleHead`](/composables/useLocaleHead) — the generated tags as an object
