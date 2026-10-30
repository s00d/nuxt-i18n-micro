---
title: 'useLocaleHead'
description: 'useLocaleHead builds the i18n SEO tags (lang, dir, canonical, hreflang, og:locale) as an object you pass to useHead.'
outline: [2, 3]
---

# `useLocaleHead`

`useLocaleHead()` builds the i18n head tags for the current route: `lang` and `dir` on `<html>`, a canonical link, `hreflang` alternates with `x-default`, `og:url`, `og:locale` and `og:locale:alternate`. Use it when you set [`meta: false`](/api/module-options#meta) and manage `useHead` yourself; with `meta: true` the module already registers these tags, and per-page changes go through [`useI18nHead`](/composables/useI18nHead).

## Signature

<!-- generated:symbol:useLocaleHead — do not edit; run `pnpm run docs:generate` -->

```ts
useLocaleHead(options: UseLocaleHeadOptions): { build: () => LocaleHead; metaObject: Ref<{ htmlAttrs: { dir?: "ltr" | "rtl" | "auto"; lang?: string; [key: string]: string | undefined }; link: { href: string; hreflang?: string; rel: string; [key: string]: string | undefined }[]; meta: { content: string; property: string; [key: string]: string }[] }, LocaleHead | { htmlAttrs: { dir?: "ltr" | "rtl" | "auto"; lang?: string; [key: string]: string | undefined }; link: { href: string; hreflang?: string; rel: string; [key: string]: string | undefined }[]; meta: { content: string; property: string; [key: string]: string }[] }>; updateMeta: () => void }
```

The SEO head tags for the current route: `hreflang` alternates for every locale plus
`x-default`, a canonical link, `og:locale`, and `lang`/`dir` on `<html>`.

Only needed when `meta` is disabled or the defaults need adjusting — with `meta: true`
the module registers the same tags itself.

| Parameter | Type | Description |
| --- | --- | --- |
| `options` | `UseLocaleHeadOptions` |  |

**Returns** — `metaObject`, a ref holding the head object ready to pass to `useHead`; `updateMeta` refreshes it; `build` computes the head object from the current route (reactive when read in a getter, e.g. `useHead(() => build())`)

```ts
const { metaObject } = useLocaleHead({ addSeoAttributes: true })
useHead(metaObject)
```

<!-- /generated:symbol:useLocaleHead -->

## Options

| Option | Default | Description |
| --- | --- | --- |
| `addDirAttribute` | `true` | Set `dir` on `<html>` from the locale's `dir` (`'auto'` when it has none). |
| `identifierAttribute` | `'id'` | Attribute that keys each tag (`i18n-can`, `i18n-og`, `i18n-alternate-<hreflang>`, …), so updates replace tags instead of adding them. |
| `addSeoAttributes` | `true` | Emit canonical, `hreflang` and `og:` tags. `false` keeps only `htmlAttrs`. |
| `baseUrl` | `'/'` | Origin joined to every URL. Keep `'/'` for relative URLs; pass `'https://example.com'` for absolute ones. |
| `autoUpdate` | `true` | Rebuild `metaObject` when the route or the `i18n-locale` state changes. |

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

- [SEO](/guide/seo) — base URL resolution, `metaBaseUrl`, per-locale `seo` / `og`
- [`useI18nHead`](/composables/useI18nHead) — per-page overrides
