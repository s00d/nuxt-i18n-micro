# `useI18nLocale`

`useI18nLocale()` gives access to the locale the app has chosen: the `i18n-locale` state and the locale cookie. Use it in a plugin that detects the locale itself (domain, user profile, header) instead of writing `useState('i18n-locale')` or the cookie by hand. Its validity checks use the enabled locales, runtime overrides included.

## Signature

```ts
useI18nLocale(): { getEffectiveLocale: (route: unknown, getLocaleFromRoute: GetLocaleFromRoute) => string; getLocale: () => string | null; getPreferredLocale: () => string | null; hashCookie: CookieRef; isValidLocale: (locale: string | null | undefined) => locale is string; locale: any; localeCookie: CookieRef; resolveInitialLocale: (options: ResolveInitialLocaleOptions) => string; setLocale: (locale: string | null) => void; syncLocale: (locale: string | null) => void; validLocales: string[] }
```

Centralized entry point for i18n locale management.
Combines useState('i18n-locale'), locale cookie, and sync utilities.

## Returned values

<table>
<thead>
  <tr>
    <th>
      Member
    </th>
    
    <th>
      Type
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
        locale
      </code>
    </td>
    
    <td>
      <code>
        Ref<string | null>
      </code>
    </td>
    
    <td>
      The <code>
        useState('i18n-locale')
      </code>
      
       ref.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        localeCookie
      </code>
    </td>
    
    <td>
      <code>
        Ref<string | null>
      </code>
    </td>
    
    <td>
      The <a href="/api/module-options#localecookie">
        <code>
          localeCookie
        </code>
      </a>
      
       cookie; a plain <code>
        { value: null }
      </code>
      
       when the option is <code>
        null
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        hashCookie
      </code>
    </td>
    
    <td>
      <code>
        Ref<string | null>
      </code>
    </td>
    
    <td>
      The <code>
        hash-locale
      </code>
      
       cookie under hash routing; <code>
        { value: null }
      </code>
      
       otherwise.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        validLocales
      </code>
    </td>
    
    <td>
      <code>
        string[]
      </code>
    </td>
    
    <td>
      Codes of the enabled locales.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        setLocale(locale)
      </code>
    </td>
    
    <td>
      <code>
        (locale: string | null) => void
      </code>
    </td>
    
    <td>
      Write the state and the cookies. Does not validate and does not load translations.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        syncLocale(locale)
      </code>
    </td>
    
    <td>
      <code>
        (locale: string | null) => void
      </code>
    </td>
    
    <td>
      Write the cookies only.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        getLocale()
      </code>
    </td>
    
    <td>
      <code>
        () => string | null
      </code>
    </td>
    
    <td>
      State, then the preference cookie (hash cookie under hash routing). Not validated.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        getPreferredLocale()
      </code>
    </td>
    
    <td>
      <code>
        () => string | null
      </code>
    </td>
    
    <td>
      The first <strong>
        valid
      </strong>
      
       of state and preference cookie, or <code>
        null
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        getEffectiveLocale(route, getLocaleFromRoute)
      </code>
    </td>
    
    <td>
      <code>
        (route, fn) => string
      </code>
    </td>
    
    <td>
      The state under hash routing when set; otherwise <code>
        getLocaleFromRoute(route)
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        resolveInitialLocale(options)
      </code>
    </td>
    
    <td>
      <code>
        (options: ResolveInitialLocaleOptions) => string
      </code>
    </td>
    
    <td>
      <code>
        options.urlLocale
      </code>
      
      , then a valid state, then <code>
        options.serverLocale
      </code>
      
      , then the route's locale. Stores the result in the state when the state is not valid; on the client it also writes the cookie.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        isValidLocale(locale)
      </code>
    </td>
    
    <td>
      <code>
        (locale) => locale is string
      </code>
    </td>
    
    <td>
      Whether <code>
        locale
      </code>
      
       is in <code>
        validLocales
      </code>
      
      .
    </td>
  </tr>
</tbody>
</table>

The cookies last one year, with `path: '/'` and `sameSite: 'lax'`.

## Example

```ts
// plugins/locale-from-domain.server.ts
export default defineNuxtPlugin({
  name: 'locale-from-domain',
  enforce: 'pre',
  setup() {
    const { setLocale, isValidLocale } = useI18nLocale()
    const host = useRequestURL().hostname // e.g. de.example.com
    const code = host.split('.')[0]
    if (isValidLocale(code)) setLocale(code)
  },
})
```

The module's loader plugin reads the state when it starts, so a plugin that sets it must run first (`enforce: 'pre'`). How the state competes with the URL, the cookie and `Accept-Language`: [Locale detection](/guide/locale-detection). Full walkthrough: [Custom detection](/guide/custom-auto-detect).

`setLocale()` does not switch the translations on screen. To change the locale of the current page, call [`$switchLocale()`](/api/methods#switchlocale).

## Related

<card-group>
<card icon="i-lucide-book-open" title="Custom detection" to="/guide/custom-auto-detect">



</card>

<card icon="i-lucide-book-open" title="Locale detection" to="/guide/locale-detection">



</card>

<card icon="i-lucide-braces" title="useI18n" to="/composables/useI18n">



</card>
</card-group>
