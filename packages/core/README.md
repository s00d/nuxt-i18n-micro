# @i18n-micro/core

Translation core shared by every `@i18n-micro/*` adapter and `nuxt-i18n-micro`: translation storage, `t` / `tc` / `tn` / `td` / `tdr` / `has`, interpolation, plurals and cached `Intl` formatters. No runtime dependencies (`@i18n-micro/types` is types only), about 3.4 KB min+gzip.

```bash
npm install @i18n-micro/core
```

## Entries

| Entry                       | What                                                                                                                                                                                                                                                                                                        |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@i18n-micro/core`          | `BaseI18n`, `useTranslationHelper` / `TranslationHelper`, `FormatService`, `createReactiveI18nStore`, and everything in `/helpers`                                                                                                                                                                          |
| `@i18n-micro/core/render`   | The `<i18n-t>` and switcher renderers Vue and Nuxt share: `renderI18nT`, `createLocaleSwitcher`. They take Vue's `h` as an argument                                                                                                                                                                         |
| `@i18n-micro/core/helpers`  | Functions: `tokenize`, `interpolate`, `resolveText`, `pluralForm`, `escapeHtml`, `defaultPlural`, `getByPath`, `resolveTranslation`, `hasTranslationValue`, `setTranslationAtKey`, `mergeTranslationChunk`, `mergeTranslationLayers`, `collectTranslationPaths`, `translationCacheKey`, strategy predicates |
| `@i18n-micro/core/devtools` | Vue DevTools inspector tree builders                                                                                                                                                                                                                                                                        |

## Storage model

Translations live in a `TranslationStorage` — a `Map` of chunks keyed `locale:route` (`en:index`, `de:about`), each a nested tree.

- **Stored trees are never mutated.** A merge copies the nodes on the patch's paths and stores a new root. Objects you pass in, objects `t()` / `getCache()` return, route chunks that share subtrees and cloned storages (`new Map(storage.translations)`) all stay as they were.
- **Lookups always start from the Map.** Writes made straight to `storage.translations`, or by another instance sharing the storage, are seen at once. Resolved keys are cached per tree object, so replace a chunk rather than editing a stored tree in place.

```ts
import { useTranslationHelper } from '@i18n-micro/core'

const helper = useTranslationHelper()
helper.loadTranslations('en', { greeting: 'Hello, {name}!', nav: { home: 'Home' } })
helper.mergeTranslation('en', 'index', { nav: { about: 'About' } }) // deep merge, nav.home kept
helper.loadPageTranslations('en', 'about', { title: 'About us' })

helper.getTranslation('en', 'index', 'nav.about') // 'About'
helper.hasTranslation('en', 'title') // true (any route of `en`)
```

## `BaseI18n`

Adapters extend it and supply the current state:

```ts
import { BaseI18n } from '@i18n-micro/core'

class MyI18n extends BaseI18n {
  locale = 'en'
  route = 'index'
  getLocale() {
    return this.locale
  }
  getFallbackLocale() {
    return 'en'
  }
  getRoute() {
    return this.route
  }
}

const i18n = new MyI18n({ numberFormats: { en: { currency: { style: 'currency', currency: 'USD' } } } })
i18n.loadTranslationsCore('en', { apples: 'no apples | one apple | {count} apples' }, true)
i18n.tc('apples', 5) // '5 apples'
i18n.tn(1234.5, 'currency') // '$1,234.50'
```

- `t(key, params?, default?, route?)` — the active locale, then the fallback locale; a missing key returns `default || key` and goes to `missingHandler` (or a dev `console.warn` in the browser).
- `has(key, route?)` — whether the active locale itself defines `key` (not the fallback).
- `tc(key, count | params, default?)` — plural. `defaultPlural` picks form `count` for a whole non-negative count and the last form otherwise; a custom `plural` returning `null` falls back to it.
- `tn` / `td` — Vue I18n-style named formats (`tn(n, 'currency')`, `td(d, 'short', 'de')`); a named format falls back through shorter tags (`zh-Hant-TW` → `zh-Hant` → `zh`).
- `tdr(date)` — `3 days ago` / `in 3 days`; `Invalid Date` for an invalid date.
- `setTranslation(key, value)` — replaces the value at `key` in the active chunk; `resolveTranslations()` — the merged tree `t()` reads from.
- `extend(methods)` — attaches framework helpers onto the instance.

## `FormatService`

Caches one `Intl.NumberFormat` / `DateTimeFormat` / `RelativeTimeFormat` per locale and options (key order does not matter) and resolves named formats.

```ts
const formats = new FormatService()
formats.formatNumber(1234.5, 'de-DE') // '1.234,5'
formats.formatRelativeTime(Date.now() + 86_400_000, 'en', { numeric: 'auto' }) // 'tomorrow'
```

## License

MIT — see [LICENSE](https://github.com/s00d/nuxt-i18n-micro/blob/main/LICENSE).
