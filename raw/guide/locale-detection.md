# Locale detection

Every request gets one locale, picked from the same list of sources in the same order on the server and in the browser. Read this when you decide how first-time visitors land on a language, whether their choice is remembered, and what your server API sees. You get the precedence, the redirect each strategy makes, and the options that turn each source on or off.

<tip>

**Prerequisites** — [Routing strategies](/guide/strategy)

</tip>

## The precedence

The first source that names an **enabled** locale wins. An invalid or malformed value (an unknown code, a broken cookie) is skipped and the next source counts.

<table>
<thead>
  <tr>
    <th>
      #
    </th>
    
    <th>
      Source
    </th>
    
    <th>
      Counts when
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      1
    </td>
    
    <td>
      URL prefix (<code>
        /de/about
      </code>
      
      )
    </td>
    
    <td>
      prefix strategies. Under <code>
        prefix_except_default
      </code>
      
       and <code>
        prefix_and_default
      </code>
      
       an unprefixed URL is the default locale
    </td>
  </tr>
  
  <tr>
    <td>
      2
    </td>
    
    <td>
      <code>
        ?locale=de
      </code>
    </td>
    
    <td>
      pages: <code>
        no_prefix
      </code>
      
       only. Server API helpers: always, and before the URL
    </td>
  </tr>
  
  <tr>
    <td>
      3
    </td>
    
    <td>
      Locale state set by the app (<code>
        useI18nLocale().setLocale()
      </code>
      
      )
    </td>
    
    <td>
      the URL has no locale
    </td>
  </tr>
  
  <tr>
    <td>
      4
    </td>
    
    <td>
      Cookie
    </td>
    
    <td>
      <a href="/api/module-options#localecookie">
        <code>
          localeCookie
        </code>
      </a>
      
       is set (<code>
        'user-locale'
      </code>
      
       automatically under <code>
        no_prefix
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      5
    </td>
    
    <td>
      <code>
        Accept-Language
      </code>
      
       header
    </td>
    
    <td>
      <a href="/api/module-options#autodetectlanguage">
        <code>
          autoDetectLanguage
        </code>
      </a>
      
       is <code>
        true
      </code>
      
       (default)
    </td>
  </tr>
  
  <tr>
    <td>
      6
    </td>
    
    <td>
      <a href="/api/module-options#defaultlocale">
        <code>
          defaultLocale
        </code>
      </a>
    </td>
    
    <td>
      always
    </td>
  </tr>
</tbody>
</table>

So under a prefix strategy the URL decides what a page shows; the preference sources (3–5) only decide where a visitor is **redirected**, and only on the paths `autoDetectPath` allows. Under `no_prefix` there is nothing to redirect, and the preference sources decide what the page shows.

![Decision flow: a locale prefix in the URL renders that locale. Without one, no_prefix renders from the preference sources, prefix_and_default renders the default locale, and prefix or prefix_except_default redirect by preference when autoDetectPath allows the path](/diagrams/locale-detection.svg)

## Redirects per strategy

Redirects are a `302`, made on the server before the page renders, and by a route middleware for client navigations. Query and hash are kept. With [`redirects: false`](/api/module-options#redirects) none happen; wrong prefixes are still a 404.

Visitor prefers `de` (cookie or header), `defaultLocale: 'en'`, default `autoDetectPath: '/'`:

<table>
<thead>
  <tr>
    <th>
      Request
    </th>
    
    <th>
      <code>
        prefix_except_default
      </code>
    </th>
    
    <th>
      <code>
        prefix
      </code>
    </th>
    
    <th>
      <code>
        prefix_and_default
      </code>
    </th>
    
    <th>
      <code>
        no_prefix
      </code>
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        /
      </code>
    </td>
    
    <td>
      → <code>
        /de
      </code>
    </td>
    
    <td>
      → <code>
        /de
      </code>
    </td>
    
    <td>
      <code>
        /
      </code>
      
       in <code>
        en
      </code>
    </td>
    
    <td>
      <code>
        /
      </code>
      
       in <code>
        de
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        /about
      </code>
    </td>
    
    <td>
      <code>
        /about
      </code>
      
       in <code>
        en
      </code>
    </td>
    
    <td>
      → <code>
        /de/about
      </code>
    </td>
    
    <td>
      <code>
        /about
      </code>
      
       in <code>
        en
      </code>
    </td>
    
    <td>
      <code>
        /about
      </code>
      
       in <code>
        de
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        /fr/about
      </code>
    </td>
    
    <td>
      <code>
        /fr/about
      </code>
    </td>
    
    <td>
      <code>
        /fr/about
      </code>
    </td>
    
    <td>
      <code>
        /fr/about
      </code>
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        /en/about
      </code>
    </td>
    
    <td>
      404
    </td>
    
    <td>
      <code>
        /en/about
      </code>
    </td>
    
    <td>
      <code>
        /en/about
      </code>
    </td>
    
    <td>
      —
    </td>
  </tr>
</tbody>
</table>

`prefix_and_default` never redirects: an unprefixed URL belongs to the default locale, and other locales live under their prefix. A visitor who prefers `en` is not redirected from `/` under `prefix_except_default`. Targets have no trailing slash (`/de`, not `/de/`) and follow custom paths (`/about` → `/de/ueber-uns`).

Wherever the cookie or the header decides (the redirect from `/`, every page under `no_prefix`), the response carries `Vary: Cookie, Accept-Language`, so a CDN keeps the answers apart.

### `autoDetectPath`

Where the preference sources may move a visitor:

<table>
<thead>
  <tr>
    <th>
      Value
    </th>
    
    <th>
      Preference counts on
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        '/'
      </code>
      
       (default)
    </td>
    
    <td>
      <code>
        /
      </code>
      
       only. Deep links stay in the language of the URL
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        'no_prefix'
      </code>
    </td>
    
    <td>
      every path without a locale prefix (<code>
        /about
      </code>
      
       → <code>
        /de/about
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        '/welcome'
      </code>
    </td>
    
    <td>
      that exact path (a trailing slash is ignored)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        '*'
      </code>
    </td>
    
    <td>
      every path, prefixed ones too: <code>
        /about
      </code>
      
       and <code>
        /fr/about
      </code>
      
       → <code>
        /de/about
      </code>
      
       when the visitor prefers <code>
        de
      </code>
    </td>
  </tr>
</tbody>
</table>

- On paths it does not allow, an unprefixed URL is treated as the default locale.
- `prefix` is the exception: it has no unprefixed pages, so `/about` always goes to the visitor's locale (`/de/about` with cookie `de`, `/en/about` with no preference).
- With `'*'` the server ignores the app's state, and a prefixed URL no longer records its own locale in the cookie; the cookie changes when the visitor switches with `$switchLocale`.

<warning>

With `'*'`, shared links open in the reader's language, which can surprise. Prefer `'/'` or `'no_prefix'` unless that is what you want.

</warning>

## Accept-Language

The header is read as RFC 9110 defines it and matched against the locale **codes** in your config:

- Entries are tried by `q` value, highest first (`fr;q=0.1, de;q=0.9` → `de`). `q=0` means "not this language"; an entry with a malformed `q` is ignored. `*` matches nothing.
- `_` is read as `-` (`en_US` = `en-US`).
- Per entry: the exact code, then shorter forms (`de-AT` → `de`), then a regional locale of the same language (`en` → `en-US`). Exact and shorter forms do not depend on the order of `locales`; among several regional matches, the first in `locales` wins.
- Scripts are never crossed: `zh-TW` and `zh-HK` imply Traditional, `zh-CN` Simplified, so `zh-CN` never matches a `zh-Hant` locale.
- Disabled locales never match.

```ts
// locales: [{ code: 'en' }, { code: 'de' }, { code: 'zh-Hant' }]
// 'de-CH,de;q=0.9,en;q=0.8'  → 'de'
// 'en-GB'                    → 'en'
// 'zh-TW'                    → 'zh-Hant'
// 'zh-CN'                    → no match, next source
```

Turn header detection off with `autoDetectLanguage: false`; the cookie and the state still count.

## The cookie

- **Off by default** for the prefix strategies (`localeCookie: null`). Redirects then work from the header alone, and the choice is not remembered across visits. Set `localeCookie: 'user-locale'` to remember it.
- Under `no_prefix` it is `'user-locale'` unless you set another name. `localeCookie: null` turns it off there too.
- It is written when the visitor switches (`$switchLocale`, `<i18n-switcher>`, `useI18nLocale().setLocale()`), and on a server render of a page under a prefix (`/fr/about` stores `fr`; not under `autoDetectPath: '*'` with redirects on, where the URL can still move). A client navigation to a page stores that page's locale too, also on an unprefixed page of the default locale; a first load of that URL does not. Under `no_prefix` and in hash mode a navigation stores only a change. A 404 stores nothing, unless `$switchLocale` lands on it.
- It lasts one year (`path=/`, `SameSite=Lax`), with no `Domain` and no `Secure`. [`localeCookieOptions`](/api/module-options#localecookieoptions) changes them, e.g. `{ domain: '.example.com' }` to share the choice across subdomains, or `{ sameSite: 'none', secure: true }` for an app in an iframe (browsers drop `SameSite=None` without `Secure`).
- Under `hashMode` the preference lives in the `hash-locale` cookie instead; server and client read the same one. The server renders that locale and, outside `prefix`, never redirects; a locale in the hash (`/#/de`) wins over it and applies right after hydration. Under `prefix` there is no page on `/`, so `/` is rendered in the browser, which goes to `/#/de` by the cookie, then the browser language (`autoDetectLanguage`); any other document (`/about`, `/de`) redirects into the hash.

Read and set the preference with [`useI18nLocale`](/composables/useI18nLocale), not with `useCookie` or `useState` directly.

## Your own detection

To pick the locale yourself (a user setting, a subdomain), call `useI18nLocale().setLocale(code)` in a plugin that runs before the module's plugin. It becomes source 3, the app's state. [Custom locale detection](/guide/custom-auto-detect) has the full recipe, including turning the built-in detection off.

## Server API routes

[`useLocaleServerMiddleware`](/guide/server-side-translations) and `useTranslationServerMiddleware` use their own order, because an API URL is rarely localized:

1. `?locale=`
2. a `[locale]` route param, or a locale prefix in the path
3. cookie (when `localeCookie` is set)
4. `Accept-Language` (when `autoDetectLanguage` is on)
5. `defaultLocale`

`localeCookie: null` and `autoDetectLanguage: false` switch sources 3 and 4 off here too.

## Runtime overrides

[Runtime overrides](/guide/runtime-overrides) change the list the sources are matched against:

- Runtime `disabledLocales` are removed from every step: a cookie or header naming one is skipped.
- A runtime `defaultLocale` is step 6 under `prefix` and `no_prefix`.
- Under `prefix_except_default` and `prefix_and_default` the default locale is fixed at build (its pages are the unprefixed routes). A runtime `defaultLocale`, or disabling the build default, is ignored with a warning.

## Related

<card-group>
<card icon="i-lucide-book-open" title="Custom locale detection" to="/guide/custom-auto-detect">



</card>

<card icon="i-lucide-book-open" title="Server routes and API" to="/guide/server-side-translations">



</card>

<card icon="i-lucide-braces" title="useI18nLocale" to="/composables/useI18nLocale">



</card>
</card-group>
