# @i18n-micro/route-strategy

Build-time route generation for **Nuxt I18n Micro**: turns Nuxt pages (`NuxtPage[]`) into the localized vue-router routes of a strategy (`prefix_except_default`, `prefix`, `prefix_and_default`, `no_prefix`).

The Nuxt module calls it in `pages:resolved`. It works on plain `NuxtPage` objects, without Nuxt or vue-router.

---

## How it works

Generation has two steps:

1. **Localize.** For each page and locale, build the page tree as that locale serves it. Custom paths are applied, and unlocalized or disallowed pages are dropped.
2. **Emit.** Turn the trees into vue-router records.
   - Locales whose tree equals the page as written share one record, `/:locale(de|fr)/...`, named `localized-<name>`.
   - Every other locale gets its own tree, named `localized-<name>-<locale>`.
   - The default locale of `prefix_except_default` / `prefix_and_default`, and the base page of `no_prefix`, keep the page's own names, unprefixed.

Every localized record carries `meta.i18n = { name, locales }`: the page's base name and the locales it serves. `@i18n-micro/path-strategy` reads that at runtime instead of re-deriving the rules, so the build is the single source of truth.

| Strategy (locales `en` default, `de`, `fr`) | `/about`, `de: '/ueber-uns'`                                                                          |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `prefix_except_default`                     | `about /about`, `localized-about /:locale(fr)/about`, `localized-about-de /:locale(de)/ueber-uns`     |
| `prefix`                                    | `localized-about /:locale(en\|fr)/about`, `localized-about-de /:locale(de)/ueber-uns`                 |
| `prefix_and_default`                        | `about /about`, `localized-about /:locale(en\|fr)/about`, `localized-about-de /:locale(de)/ueber-uns` |
| `no_prefix`                                 | `about /about`, `localized-about-de /ueber-uns`                                                       |

---

## Rules

### Keys

`globalLocaleRoutes` keys and `$defineI18nRoute` file keys are looked up in this order:

1. The page's full path: `about/team`, `/about/team`, `blog/[slug]` or `blog/:slug()`.
2. Its route name (`about-team`), only for keys written without a leading slash.

When both `about-team` and `/about-team` exist for a top-level page, the form without the slash wins.

### Values

- A top-level value is the page's path (`about-us` = `/about-us`). File forms are accepted: `[id]`, `[[page]]`, `[...slug]`.
- A child's value is relative to its parent's localized path:
  - `einstellungen` under `/konto` is `/konto/einstellungen`.
  - An absolute value is a full URL: `/konto/bestellungen` under `/konto` is `bestellungen`.
  - Any other absolute value keeps what follows the segments it shares with the parent.
- A value equal to the original path is no custom path.
- A value that starts with its own locale code (`fr: '/fr/article'`) warns: the prefix is added automatically.
- `false` means the page is not localized. `routeLocales` restricts a page (or a child) to some locales.

### Aliases and redirects

- Declared aliases are localized like their record. Non-ASCII paths also get a percent-encoded alias.
- Under `prefix_except_default`, a page whose default locale has a custom path keeps its original URL as an alias. The redirect middleware sends it on (`/product` -> `/our-products`).
- Under `prefix`, the original URL of a static page with a custom default path is a redirect record. It carries `meta.i18n` so the runtime can find the page from it.
- `noPrefixRedirect` (`no_prefix`) redirects the base page to the default locale's custom path.

---

## API

```ts
import type { NuxtPage } from '@nuxt/schema'
import { RouteGenerator } from '@i18n-micro/route-strategy'

// what Nuxt's `pages:resolved` hook passes
const pages: NuxtPage[] = [{ path: '/about', name: 'about', file: 'pages/about.vue' }]

const generator = new RouteGenerator({
  locales: [{ code: 'en' }, { code: 'de' }, { code: 'fr' }],
  defaultLocaleCode: 'en',
  strategy: 'prefix_except_default',
  globalLocaleRoutes: { about: { de: '/ueber-uns' } }, // $defineI18nRoute localeRoutes merged in, config wins
  routeLocales: {}, // $defineI18nRoute locales
  noPrefixRedirect: false,
  excludePatterns: [],
  localizedRouteNamePrefix: 'localized-',
  customRegexMatcher: undefined,
})

generator.extendPages(pages) // replaces `pages` in place
generator.resolveLocalizedPath('/about', 'de') // '/de/ueber-uns' (nitro routeRules / prerender)
```

| Export                                                 | Purpose                                                                                                                                |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `RouteGenerator`                                       | `extendPages`, `resolveLocalizedPath`, `generateDataRoutes`, `ensureTranslationFilesExist`; `locales`, `defaultLocale`, `routeLocales` |
| `generateRoutes(pages, options)`                       | The generation itself, as a function                                                                                                   |
| `Rules`                                                | Normalized rules: `get(path, name)`, `allowedLocales(path, name)`                                                                      |
| `isLocaleAllowedForUnlocalizedRoute`                   | Whether a locale may serve a path, given routeLocales                                                                                  |
| `normalizeRouteKey`, `normalizePath`, `isInternalPath` | Path helpers the module shares                                                                                                         |
| `RouteI18nMeta`                                        | Type of `meta.i18n`                                                                                                                    |

---

## Tests

```bash
pnpm test       # generation rules
pnpm test:dist  # built package
```

The behaviour of both routing packages together lives in the repository's `test/routing-characterization/` golden files and the `test/routing-*.test.ts` matrices.
