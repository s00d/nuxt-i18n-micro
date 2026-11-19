# Migrating from @nuxtjs/i18n

This page maps a `@nuxtjs/i18n` app onto nuxt-i18n-micro: options, helpers and file layout. Use it when you swap the module in an existing app. You keep your URLs (the strategy names are the same) and move translations into JSON files per page.

<tip>

**Upgrading nuxt-i18n-micro itself?** — See [Upgrading](/guide/upgrade).

</tip>

## Swap the module

```bash
npm uninstall @nuxtjs/i18n
npm install nuxt-i18n-micro
```

```ts
// nuxt.config.ts — before
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'en', language: 'en-US', file: 'en.json' },
      { code: 'de', language: 'de-DE', file: 'de.json' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    langDir: 'locales',
    detectBrowserLanguage: { useCookie: true, cookieKey: 'i18n_redirected', redirectOn: 'root' },
  },
})
```

```ts
// nuxt.config.ts — after
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    translationDir: 'locales',
    localeCookie: 'i18n_redirected',
    autoDetectPath: '/',
  },
})
```

## Options

<table>
<thead>
  <tr>
    <th>
      <code>
        @nuxtjs/i18n
      </code>
    </th>
    
    <th>
      nuxt-i18n-micro
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        locales[].code
      </code>
    </td>
    
    <td>
      <code>
        locales[].code
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        locales[].language
      </code>
      
       (<code>
        iso
      </code>
      
       before v9)
    </td>
    
    <td>
      <code>
        locales[].iso
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        locales[].name
      </code>
    </td>
    
    <td>
      <code>
        locales[].displayName
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        locales[].dir
      </code>
    </td>
    
    <td>
      <code>
        locales[].dir
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        locales[].domain
      </code>
    </td>
    
    <td>
      <code>
        locales[].baseUrl
      </code>
      
       (an origin with its scheme)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        locales[].domainDefault
      </code>
    </td>
    
    <td>
      <code>
        locales[].baseDefault
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        differentDomains
      </code>
      
      , <code>
        multiDomainLocales
      </code>
    </td>
    
    <td>
      not needed: <code>
        baseUrl
      </code>
      
       alone routes by host, see <a href="/guide/layers#multiple-domains">
        Layers and domains
      </a>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        locales[].file
      </code>
      
       / <code>
        files
      </code>
      
      , <code>
        langDir
      </code>
      
      , <code>
        lazy
      </code>
    </td>
    
    <td>
      <code>
        translationDir
      </code>
      
      ; files are found by name and always loaded per page
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        defaultLocale
      </code>
      
      , <code>
        strategy
      </code>
    </td>
    
    <td>
      same names, same four values
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
        metaBaseUrl
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        customRoutes: 'config'
      </code>
      
       + <code>
        pages
      </code>
    </td>
    
    <td>
      <code>
        globalLocaleRoutes
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        detectBrowserLanguage: false
      </code>
    </td>
    
    <td>
      <code>
        redirects: false
      </code>
      
       (no redirects) or <code>
        autoDetectLanguage: false
      </code>
      
       (ignore the header)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        detectBrowserLanguage.useCookie
      </code>
      
       / <code>
        cookieKey
      </code>
    </td>
    
    <td>
      <code>
        localeCookie: '<name>'
      </code>
      
       (<code>
        null
      </code>
      
       turns the cookie off)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        detectBrowserLanguage.redirectOn: 'root'
      </code>
    </td>
    
    <td>
      <code>
        autoDetectPath: '/'
      </code>
      
       (default)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        detectBrowserLanguage.redirectOn: 'no prefix'
      </code>
    </td>
    
    <td>
      <code>
        autoDetectPath: 'no_prefix'
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        detectBrowserLanguage.redirectOn: 'all'
      </code>
    </td>
    
    <td>
      <code>
        autoDetectPath: '*'
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        vueI18n
      </code>
      
       config file (<code>
        fallbackLocale
      </code>
      
      , <code>
        numberFormats
      </code>
      
      , <code>
        datetimeFormats
      </code>
      
      )
    </td>
    
    <td>
      <code>
        fallbackLocale
      </code>
      
      , <code>
        numberFormats
      </code>
      
      , <code>
        datetimeFormats
      </code>
      
       in <code>
        i18n
      </code>
    </td>
  </tr>
</tbody>
</table>

There is no `alwaysRedirect`: with a cookie set, `/` follows it on every visit. The full list is [Module options](/api/module-options); detection rules are on [Locale detection](/guide/locale-detection).

## Helpers and composables

<table>
<thead>
  <tr>
    <th>
      <code>
        @nuxtjs/i18n
      </code>
      
       / vue-i18n
    </th>
    
    <th>
      nuxt-i18n-micro (template / <code>
        useI18n()
      </code>
      
      )
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        const { t } = useI18n()
      </code>
    </td>
    
    <td>
      <code>
        const { t } = useI18n()
      </code>
      
      , <code>
        $t
      </code>
      
       in templates
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        t('key', count)
      </code>
      
      , <code>
        tc
      </code>
    </td>
    
    <td>
      <code>
        $tc('key', count)
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        te('key')
      </code>
    </td>
    
    <td>
      <code>
        $has('key')
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        n(value, 'currency')
      </code>
      
      , <code>
        d(date, 'short')
      </code>
    </td>
    
    <td>
      <code>
        $tn(value, 'currency')
      </code>
      
      , <code>
        $td(date, 'short')
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      —
    </td>
    
    <td>
      <code>
        $tdr(date)
      </code>
      
      : relative time ("in 3 days")
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        locale.value
      </code>
    </td>
    
    <td>
      <code>
        $getLocale()
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        locales.value
      </code>
    </td>
    
    <td>
      <code>
        $getLocales()
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        setLocale('de')
      </code>
    </td>
    
    <td>
      <code>
        $switchLocale('de')
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        useLocalePath()('about')
      </code>
    </td>
    
    <td>
      <code>
        $localePath({ name: 'about' })
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        useLocaleRoute()
      </code>
    </td>
    
    <td>
      <code>
        $localeRoute()
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        useSwitchLocalePath()('de')
      </code>
    </td>
    
    <td>
      <code>
        $switchLocalePath('de')
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        useSetI18nParams()
      </code>
    </td>
    
    <td>
      <code>
        $setI18nRouteParams()
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        useLocaleHead()
      </code>
    </td>
    
    <td>
      automatic with <code>
        meta: true
      </code>
      
      ; <a href="/composables/useLocaleHead">
        <code>
          useLocaleHead
        </code>
      </a>
      
       for custom heads
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        defineI18nRoute({ paths: { de: '/ueber-uns' }, locales: [...] })
      </code>
    </td>
    
    <td>
      <code>
        $defineI18nRoute({ localeRoutes: { de: '/ueber-uns' }, locales: [...] })
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        <NuxtLinkLocale to="about">
      </code>
    </td>
    
    <td>
      <code>
        <i18n-link :to="{ name: 'about' }">
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        <i18n-t>
      </code>
    </td>
    
    <td>
      <code>
        <i18n-t>
      </code>
      
       (slots fill <code>
        {name}
      </code>
      
       placeholders)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        $i18n
      </code>
      
       in server routes
    </td>
    
    <td>
      <code>
        useTranslationServerMiddleware(event)
      </code>
      
      , see <a href="/guide/server-side-translations">
        Server routes and API
      </a>
    </td>
  </tr>
</tbody>
</table>

`useI18n()` is auto-imported. `$defineI18nRoute` must keep its `$`: the build reads that call. All helpers: [Methods](/api/methods).

## Translation files

Move the keys of one big file per locale into a root file plus one file per page:

```text
locales/
├── en.json              # keys used on many pages (nav, footer)
├── de.json
└── pages/
    ├── index/en.json    # keys of pages/index.vue
    └── about/en.json    # keys of pages/about.vue
```

Keeping everything in the root files works too, and is the quickest first step. Set `disablePageLocales: true` until you split them. See [Translation files](/guide/translations).

### Message syntax

<table>
<thead>
  <tr>
    <th>
      vue-i18n
    </th>
    
    <th>
      nuxt-i18n-micro
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        {name}
      </code>
      
       named interpolation
    </td>
    
    <td>
      same
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        car | cars
      </code>
      
       (2 forms: 1 → first)
    </td>
    
    <td>
      forms are picked by count from 0: write <code>
        no cars | one car | {count} cars
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        @:other.key
      </code>
      
       linked messages
    </td>
    
    <td>
      not supported: repeat the text or compose in code
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        @.upper:
      </code>
      
       modifiers
    </td>
    
    <td>
      not supported: format in code or use <code>
        <i18n-t>
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        {'@'}
      </code>
      
       literal escapes
    </td>
    
    <td>
      not needed: only <code>
        {word}
      </code>
      
       tokens are replaced
    </td>
  </tr>
  
  <tr>
    <td>
      JS/TS message files
    </td>
    
    <td>
      JSON only
    </td>
  </tr>
</tbody>
</table>

The plural rule is replaceable with the [`plural`](/api/module-options#plural) option.

## Check after the switch

- Every URL you had still resolves; the strategy names match, custom paths move to `globalLocaleRoutes` or `$defineI18nRoute`.
- `hreflang`, canonical and `og:locale` come out of the box with `meta: true`; remove hand-written ones.
- A JSON parse error logs the file path; a missing key logs a warning in the browser console in dev.

## Related

<card-group>
<card icon="i-lucide-book-open" title="Translation files" to="/guide/translations">



</card>

<card icon="i-lucide-book-open" title="Routing strategies" to="/guide/strategy">



</card>

<card icon="i-lucide-book-open" title="Locale detection" to="/guide/locale-detection">



</card>
</card-group>
