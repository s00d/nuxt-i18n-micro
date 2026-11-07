# Upgrading

This page lists what changes for your app when you upgrade nuxt-i18n-micro and its `@i18n-micro/*` packages. Read the section for the version you come from before you bump the dependency. Most apps need few code changes.

<tip>

**Coming from @nuxtjs/i18n?** — See [Migrating from @nuxtjs/i18n](/guide/migration).

</tip>

## After 3.30.3: the major release

Module options, `$t`, `$localePath`, `$switchLocale` and the other helpers, components, composables and documented server utilities keep their names. What changed is behaviour, mostly bugs fixed. Adapter packages and the routing packages have real API breaks: see [Framework packages](#framework-packages) and [Other packages](#other-packages).

### Do this first

1. **Check your versions.** The module needs Nuxt 3.18 or newer and Node 20 or newer. Nuxt has its own Node minimum: Nuxt 4.5 declares `^22.19.0 || ^24.11.0 || >=26.0.0`. `nuxt generate` on Nuxt 3.18.0 itself fails in plain Nuxt too (`[unstorage] Invalid key: "/"`); 3.21.11 works. `@i18n-micro/react` needs React 18 or newer.
2. **Fix the installed packages.**
  - Remove `@i18n-micro/hmr`. Translation HMR is built into the module.
  - If your tests import `@i18n-micro/test-utils`, add it: `npm install -D @i18n-micro/test-utils`. It is no longer installed with the module.
  - Replace `nuxt-i18n-micro-cli` with `@i18n-micro/cli`. 28 commands became 16, `check` replaces three of them, and exit codes change: see [the CLI guide](/guide/cli#moving-from-nuxt-i18n-micro-cli).
3. **Search your code** for the entries in the table below.
4. **Check what sits in front of the app.** With `baseUrl` on locales behind a proxy, see [Behind a proxy or CDN](/guide/deployment#behind-a-proxy-or-cdn). With a CDN, check its cache key against the `Vary` header: see [Caching HTML](/guide/deployment#caching-html). With `apiBaseClientHost` or a strict CSP, allow the new `preload` link: see [SEO and head tags](#seo-and-head-tags).
5. **Update snapshots.** Head snapshots gain the `preload` link, switcher markup changed ([`<i18n-switcher>` and `<i18n-link>`](#i18n-switcher-and-i18n-link)), and query strings in `$localeRoute` output are encoded differently.
6. **Open your pages in each locale and look for raw keys.** Layouts that used keys of the previous page's file now show them raw: move those keys to the root file.

<caution>

**switchLocaleRoute of @i18n-micro/path-strategy lost its first argument** — `switchLocaleRoute(fromLocale, toLocale, route, options)` is now `switchLocaleRoute(toLocale, route, options)`. **An old JavaScript call does not fail: it returns a wrong result,** because `fromLocale` is read as the target and `toLocale` as the route. Only TypeScript tells you. Nuxt's `$switchLocaleRoute` is not affected.

</caution>

<table>
<thead>
  <tr>
    <th>
      Search for
    </th>
    
    <th>
      Do this
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        switchLocaleRoute(
      </code>
      
       from <code>
        @i18n-micro/path-strategy
      </code>
    </td>
    
    <td>
      Drop the first argument, see above
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        i18n-plugin-hooks
      </code>
      
       or <code>
        i18n-plugin-define
      </code>
      
       in a <code>
        dependsOn
      </code>
    </td>
    
    <td>
      Use <code>
        i18n-plugin-loader
      </code>
      
      . The old names no longer wait for anything, with no error
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        localized-…
      </code>
      
       names in <code>
        router.push({ name })
      </code>
    </td>
    
    <td>
      Pass the page's own name to <code>
        $localeRoute
      </code>
      
       or <code>
        <i18n-link>
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        .name
      </code>
      
       or <code>
        .params
      </code>
      
       on a <code>
        $localeRoute
      </code>
      
       or <code>
        $switchLocaleRoute
      </code>
      
       result
    </td>
    
    <td>
      Handle their absence, see <a href="#links-and-route-objects">
        Links
      </a>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        $localeRoute(x, 'fr')
      </code>
      
       in <code>
        <NuxtLink :to>
      </code>
      
       or <code>
        router.push
      </code>
      
      , with <code>
        baseUrl
      </code>
      
       on locales
    </td>
    
    <td>
      Use <code>
        $localePath
      </code>
      
      , see <a href="#locale-domains">
        Locale domains
      </a>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        $getI18nConfig().globalLocaleRoutes
      </code>
      
      , or <code>
        isSSG
      </code>
      
      , <code>
        hmr
      </code>
      
      , <code>
        hooks
      </code>
      
      , <code>
        noPrefixRedirect
      </code>
      
      , <code>
        routeLocales
      </code>
      
      , <code>
        routeDisableMeta
      </code>
      
       from it
    </td>
    
    <td>
      They are gone from the runtime config. Only the build read them, and the options themselves are unchanged. <code>
        ModuleOptionsExtend.isSSG
      </code>
      
       stays as an optional, deprecated property that nothing sets
    </td>
  </tr>
  
  <tr>
    <td>
      Server auto-imports other than <code>
        useLocaleServerMiddleware
      </code>
      
      , <code>
        useTranslationServerMiddleware
      </code>
      
      , <code>
        loadTranslationsFromServer
      </code>
      
      , <code>
        detectCurrentLocale
      </code>
    </td>
    
    <td>
      Drop them. <code>
        getI18nServerConfig
      </code>
      
      , <code>
        detectRequestLocale
      </code>
      
      , <code>
        getRequestLocale
      </code>
      
      , <code>
        loadLiveDevTranslations
      </code>
      
      , <code>
        getOrCreateServerTranslationCache
      </code>
      
      , <code>
        DEFAULT_SERVER_CACHE_SIZE
      </code>
      
       and the watcher helpers no longer auto-import
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        resolveTranslationPayloadMode
      </code>
      
      , <code>
        resolveTranslationPayloadOptions
      </code>
      
      , <code>
        resolveTranslationPayloadPublicDir
      </code>
      
      , <code>
        resolveTranslationPayloadPublicRel
      </code>
      
      , <code>
        shouldCopyTranslationPayloadsToPublic
      </code>
      
      , <code>
        shouldRegisterNitroServerAssets
      </code>
      
       from <code>
        nuxt-i18n-micro
      </code>
    </td>
    
    <td>
      Drop them. The <code>
        TranslationPayloadMode
      </code>
      
       type stays
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        html
      </code>
      
       on <code>
        <i18n-t>
      </code>
      
       with markup in <code>
        params
      </code>
    </td>
    
    <td>
      Move the markup into the translation, see <a href="#i18n-t">
        <code>
          <i18n-t>
        </code>
      </a>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ref
      </code>
      
       on <code>
        <i18n-t>
      </code>
    </td>
    
    <td>
      It is a functional component, so a <code>
        ref
      </code>
      
       gives no instance
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        useI18n().$t = stub
      </code>
      
       and similar writes
    </td>
    
    <td>
      <code>
        useI18n()
      </code>
      
       is one object per app, so a write reaches every caller. Stub <code>
        useI18n
      </code>
      
       itself
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ModuleHooks
      </code>
      
       type
    </td>
    
    <td>
      Renamed <code>
        ModuleRuntimeHooks
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        resolveServerLocale
      </code>
      
      , <code>
        resolvePreferredLocale
      </code>
      
       from <code>
        @i18n-micro/utils/resolve-locale
      </code>
    </td>
    
    <td>
      Call <code>
        resolveLocale
      </code>
      
       with <code>
        url
      </code>
      
      , <code>
        query
      </code>
      
      , <code>
        state
      </code>
      
      , <code>
        cookie
      </code>
      
       and <code>
        acceptLanguage
      </code>
    </td>
  </tr>
</tbody>
</table>

`detectCurrentLocale` is deprecated. It still works and is still a server auto-import; use [`useLocaleServerMiddleware(event).current`](/guide/server-side-translations), which applies the same rules.

17 pages of these docs moved. The old URLs redirect, so links to them keep working.

### URLs and redirects

- **/en and /en/... are a 404 under prefix_except_default** (`en` being the default), as documented.
- **A locale prefix in another case or spelling redirects to the page in its own spelling.** `/DE/about` used to render the German route in the default locale, or redirect to `/en/DE/about`; it is now a `302` to `/de/about` (`/EN/about` to `/about` under `prefix_except_default`). With no page behind the URL in its own spelling it is a 404. A page of its own on that URL (`pages/DE/about.vue`) stays a page. A bare prefix beside a `[slug]` page goes to the locale home, so a CMS slug equal to a locale code in another case loses its page. Set [`prefixCaseRedirect: false`](/api/module-options) to answer 404 instead; `redirects: false` does the same. With `ssr: false` the client makes the same redirect.
- **A page path in another case redirects to its own spelling.** `/T/BASIC` was a 200 and is now a `302` to `/t/basic`.
- **An unknown URL stays a 404.** With `autoDetectPath: '*'` or `'no_prefix'`, `/nope` no longer redirects to `/de/nope` first. `prefix` keeps the redirect (nothing is served unprefixed there), as does `/` everywhere.
- **Another locale's custom path, unprefixed, finds its page under prefix_except_default.** `/a-propos` was a 404 and is now a `302` to the default locale's URL (`/about`). Under `prefix` the same redirect now reaches a live page (`/en/about`, it was `/en/a-propos`, a 404). `prefix_and_default` stays a 404.
- **prefix with redirects: false answers 404 on an unprefixed URL** (`/about` was a `302`), including the original URL of a page with a custom default path. `$localePath('/about')` still finds that page.
- **Under prefix_except_default the original URL of a page with a custom default path redirects to it,** dynamic pages included. `/dir/one` was a 404 and is now a `302` to `/dir-one/one`.
- **autoDetectPath: '*' now applies the cookie and Accept-Language to unprefixed paths too** (`/about` → `/de/about`).
- **Under prefix an unprefixed URL keeps the visitor's locale.** With cookie `de`, `/about` and a plain `<NuxtLink to="/about">` go to `/de/about`, on every path, whatever `autoDetectPath` says.
- **Under prefix_and_default an unprefixed URL is the default locale.** `/contact` with `Accept-Language: de` used to render German and then hydrate English. It now renders the default locale; visitors reach German through `/de/...`.
- **Under no_prefix a custom path renders its own locale** (`/ueber-uns` is German with any preference), and a restricted page renders in a locale it serves. A path several locales share renders the preference when it is one of them, and under `baseUrl` is a page on each of their domains. Those locales share one record, `localized-<page>-<first locale>`.
- **noPrefixRedirect goes by the visitor's locale.** With cookie `de`, `/about` goes to `/ueber-uns`, and renders German, not to the default locale's `/about-us`. A locale with no custom path of its own stays on `/about`.
- **A routeRules redirect without a page is not localized.** `/de/old` was an empty 200, now it is a 404: add a rule for the prefixed path if you need one. A link from another locale to such a rule keeps the path as written and lands on the rule's target.
- **Route rules reach custom paths.** `/blog/**` also applies to `/de/artikel/:slug` when `blog/[slug]` has that path, and rules are copied under `no_prefix` too. A static sibling such as `/de/artikel/news` matches that pattern as well. A rule already written under a locale prefix stays as written.
- **A locale with disabled: true answers 404 on its prefix** at once, and links to it stay on the page. A locale disabled at runtime does the same: it used to render in the fallback locale.
- **The module's 404 reads Page Not Found** on the prefix of a disabled locale and on a host's own prefix, where Nuxt said `Page not found: /de/about`. The status is the same.
- **customRegexMatcher no longer 404s a real page** whose first segment looks like a locale.
- **Localized route names are consistent.** A child under a shared locale record keeps the page's name, `no_prefix` honours `localizedRouteNamePrefix`, and a parent with an index child stays unnamed.
- **Pages a module adds without a name** (`extendPages`) are localized and get a name, with locale variants and `hreflang`. They used to stay unlocalized.
- **A nuxt.config entry beats $defineI18nRoute,** under any key form (`about/team`, `/about/team`, `about-team`). Which one won used to depend on the spelling.
- **New build warnings:** a `localeRoutes` value that starts with its own locale code (`fr: '/fr/article'`), and a child's custom path outside its parent.
- **Hash mode works under prefix.** The document is `/`, and `/en` or `/about` redirect into the hash.
- **/#/de/x renders German** under `prefix_except_default` and `prefix_and_default`. It rendered English with a hydration mismatch.

### Links and route objects

- **A locale that does not serve a page links to its home.** `$localeRoute`, `$switchLocalePath` and the switcher no longer return another locale's page.
- **An unknown locale code goes to the default locale.** `$localePath(path, 'xx')` and `$localeRoute` used to give `/xx`.
- **$localePath returns a string with an http(s):, mailto: or tel: scheme as is, and the path and fullPath of $localeRoute carry it unchanged**, so do not pass an unchecked value (a `?next=` parameter) to them as a link target. `//host` and bare names like `x.com` stay paths, on this origin in every locale, and no link they turn into leaves it: `/de//x.com` to the default locale is `/x.com`. Backslashes count as slashes.
- **$localePath encodes a path:** `/a b` gives `/a%20b`.
- **$localeRoute and $switchLocaleRoute return plain objects,** safe in `ref`, `reactive`, `useState`, JSON and spreads. When a param needs escaping the object is `{ path, fullPath, query, hash }` (`$localeRoute` adds `href`), with no `name` or `params`, and the URL stays the same before and after a reload. A plain URL has both. `name` is new: the old objects never had it. Code reading `.name` or `.params` must handle their absence, and which form you get depends on the value.
- **Under trailingSlash, $switchLocaleRoute always returns that path form,** plain slugs too, and server redirects follow `trailingSlash`. Results and `Location` headers can change under that option.
- **Query values in $localeRoute output use vue-router's encoding:** `/` stays literal and a space is `+` (`?redirect=/v2`, it was `%2Fv2`). The decoded value is the same, but a snapshot of such an `href` changes.
- **A link with no path stays on the current page.** `$localePath('#top')`, `'?p=2'`, `''` and `{ query }` keep the page they are on; `'#top'` used to read from the site root. A bare `'about'` still means `/about`.
- **Spreads.** `{ ...route, query }` and `{ ...route, hash }` keep the change, also through `$switchRoute`. A new `path` wins in `$localeRoute`, `$localePath` and `$switchRoute`. `{ ...route, params }` works on a named route; on a path-form route the path wins and the params are ignored, with vue-router's dev warning. Use `$localeRoute({ name, params })`.
- **$switchRoute stays in the app.** A locale's own `baseUrl`, `mailto:` and `tel:` leave it; any other string is a path.
- **excludePatterns** match whole segments (`'/admin'` no longer matches `/administrator`), and globs are anchored (`/docs/*` no longer matches `/en/docs/x`). `RegExp` patterns now reach the runtime; they used to be lost there. A page they match is unlocalized: no `hreflang`, and the default locale under `prefix_except_default`. Check your patterns against [Excluding paths](/guide/excluding-static-files).

A `%` or `?` in a param does not survive a server-rendered reload on Nuxt 4.5.2, on any app: that is upstream, not the module.

### Locale domains

- **locales[].baseUrl now routes requests.** One build serves every domain: see [Layers and domains](/guide/layers#multiple-domains). With `baseUrl` set, a locale of another domain is a 404 on this host (`/en/about` on `example.de`), and links to a locale on the same host are relative. Requests on any other host, `localhost` included, behave as before, except that canonical and `hreflang` use `metaBaseUrl` if set, else the default locale's `baseUrl`, and not the request's origin.
- **Behind a proxy that rewrites Host,** every request falls to the build config until you set [`trustForwardedHost`](/api/module-options#trustforwardedhost). It defaults to `false`, unlike `metaTrustForwardedHost`. See [Behind a proxy or CDN](/guide/deployment#behind-a-proxy-or-cdn).
- **nuxi generate with baseUrl needs NUXT_I18N_DOMAIN, once per domain.** Without it the build warns, and those locales are links with no pages. See [Static site](/guide/deployment#static-site-nuxi-generate).
- **A link to a locale with a baseUrl goes through $localePath or <i18n-link>.** `<NuxtLink :to="$localePath(x, 'fr')">` and `<i18n-link :to="$localeRoute(x, 'fr')">` are that absolute URL, and a click goes there. The router takes no absolute object: `<NuxtLink :to="$localeRoute(x, 'fr')">` and `router.push($localeRoute(x, 'fr'))` stay `/https://fr.example.com/...`, a path of this app. On `localhost` or a preview host every locale with a `baseUrl` is such a link, the current one too. In code use `navigateTo($localePath(x, 'fr'), { external: true })`.
- **The home of a domain is written without a trailing slash everywhere** (`https://example.de`), in links, canonical and `hreflang`.
- **Under prefix, a link to another domain keeps the locale prefix, with or without baseDefault.** `https://example.de/de/about`, not `https://example.de/about`, which only redirects.
- **Under prefix_except_default with baseDefault on a locale other than the build default, routes keep every prefix** so other domains can link to them. `/en` is still a 404. Only code reading `router.getRoutes()` sees the difference.
- **Under prefix_except_default a host's own prefix is a 404 on its baseDefault host.** `/de/x` on the `de` host was a 200.
- **$getI18nConfig().locales holds only what the host serves.** `linkLocales` holds all of them, and `$getLocales()` stays complete.

### Navigation and `$switchLocale`

- **A navigation applies when it commits.** The dictionary, the locale, params and head change in `router.afterEach`, so a cancelled or blocked navigation changes nothing, and the old page's links stay valid while the next chunk loads. A `beforeResolve`, a `beforeRouteEnter` or a later global guard now sees the old dictionary and locale. Route middleware is unaffected.
- **A failed chunk keeps the current dictionary.** A 5xx, a network error or a bad body on the root file used to show raw keys. The new page now renders with the old strings, and the next navigation retries. A 404, or a static host's SPA shell in the file's place, gives the root dictionary until the next reload.
- **$switchLocale resolves true or false** (it resolved nothing), `false` when the locale's dictionary did not apply. It is typed `Promise<boolean>`, and `$switchRoute` `Promise<void>`.
- **$switchLocale is an explicit choice.** On arrival it stores the locale, on a 404 too. If the navigation is blocked, cancelled or throws, the stored preference and the state stay as they were, and a throw is rethrown. A move to another host stores it first. Under `no_prefix` and in hash mode the switch stands whatever the navigation does. On a page with one URL for every locale (`excludePatterns`) the choice is not undone, and the next page's URL decides: under `prefix_except_default` an unprefixed link returns to the default locale.
- **Under no_prefix, $switchLocale keeps its page when two pages share a custom path,** with escaped params too. A reload of such a URL, and a `$localeRoute` with an escaped param, land on the first record.
- **A client redirect keeps the mode of its navigation.** A plain `<NuxtLink to="/about">` under `prefix` adds a history entry instead of overwriting the current one; `router.replace` still replaces.
- **$setI18nRouteParams and useI18nHead from the server survive hydration.** After landing on `/news/2` the switcher links to the translated slug (`/de/news/2-zwei`), not `/de/news/2`, in the server HTML too, wherever the switcher sits, when the page sets the params during SSR. They are dropped when a navigation to another path commits, including `/news/1` to `/news/4`: set them again on the new page.
- **$setI18nRouteParams read in setup is bound to that page.** A late call from a page already left does nothing. `useNuxtApp().$setI18nRouteParams` is an accessor now, and two reads give two functions. It has no setter: `useI18n().$setI18nRouteParams = fn`, as a test stub might do, throws in strict mode, so stub `useI18n` itself. In a layout or `app.vue` it is the plain function, as nothing there is left.
- **The server rewrites the links of <i18n-switcher> when the render ends**, on pages with params, because a switcher in the layout renders before the page's async setup. A hand-written `$switchLocalePath` link is not rewritten: see [custom locale routes](/guide/custom-locale-routes). Under Nuxt's SSR streaming the first HTML keeps the URL's params.
- **A prop named locale on a server component sets its render locale**, so `<Greeting :locale="$getLocale()" />` follows the URL and a switch. `$getLocale()`, `$localePath` and `$getLocaleName` inside it follow the prop too. See [server-side translations](/guide/server-side-translations). Without the prop it still uses the cookie or the default.
- **keepalive pages get their params and head back** on return.
- **A nested page set to false under prefix_except_default has no locale URL.** `/de/parent/kid` with `globalLocaleRoutes: { 'parent-kid': false }` was served and is now a 404: the page stays on `/parent/kid`.

### Locale detection and the cookie

One precedence everywhere, described on [Locale detection](/guide/locale-detection).

- **?locale= counts on pages only under no_prefix.** Under the prefix strategies the URL decides; `/about?locale=de` no longer renders German under `lang="en"`. `?locale=de&locale=fr` reads the first value, it was `"de,fr"`.
- **Accept-Language honours q values** (`fr;q=0.1, de;q=0.9` → `de`; `q=0` excludes a language). Regional matching no longer depends on the order of `locales`, and never crosses Chinese scripts.
- **A client navigation to a page stores its locale in the cookie, also on an unprefixed page of the default locale.** With `localeCookie` set, a visitor who clicks a link to `/about` now has `user-locale=en`, and a later change of browser language no longer redirects `/`. A first load of that URL stores nothing. Under `no_prefix` and in hash mode a navigation stores only a change.
- **A 404 writes no cookie:** not the response, and not a plain client navigation to it, in any mode. Under `no_prefix` a URL that looks prefixed writes none either.
- **Under no_prefix an explicit localeCookie: null is honoured.** It used to become `user-locale`. Set it in the `i18n` block of `nuxt.config`: a `null` in `modules: [[name, opts]]` or in a layer is still lost.
- **Hash mode reads only the hash-locale cookie.** A lone `user-locale=de` no longer counts.
- **A malformed locale cookie is ignored and stays as it is,** instead of failing every SSR page with a 500. It is no longer deleted on every request, which also stopped a prefixed page from storing its locale.
- **The URL's locale goes first.** A plugin's `setLocale('de')` on `/en/...` no longer loads the `de` dictionary, and an unknown code in the state is ignored.
- **Server API helpers** (`useLocaleServerMiddleware`, `useTranslationServerMiddleware`) use one order on every route: `?locale` → `[locale]` param or prefix → cookie → header → default. They now respect `localeCookie: null` and `autoDetectLanguage: false`, and cache a dictionary per locale.
- **Runtime overrides reach routing.** `NUXT_I18N_DEFAULT_LOCALE` and runtime `disabledLocales` now change the generated strategy (a disabled locale stops routing), and runtime `disabledLocales` add to the build's. Under `prefix_except_default` and `prefix_and_default` a runtime `defaultLocale` is ignored with a warning, because that locale's unprefixed routes are generated at build. A runtime `fallbackLocale` must be an enabled locale: otherwise it is dropped with a warning and the build's value applies if that one is enabled. See [Runtime overrides](/guide/runtime-overrides).

### SEO and head tags

- **dir="auto" is no longer the default.** A locale without `dir` used to get `dir="auto"`, which slows parsing of large pages. Now a known RTL language gets `dir="rtl"`, and any other locale gets no attribute. This applies to Nuxt, `@i18n-micro/vue`, `astro` and `vitepress`. If you set `dir: 'auto'` on a locale to keep the old output, it costs about 1 s of parsing at 20,000 elements: see [Text direction](/guide/seo#text-direction).
- **Every SSR page has a new tag:** `<link rel="preload" as="fetch" crossorigin="anonymous" href="/_locales/...">`, 404 pages too. With `apiBaseClientHost` the `href` is on that host, which needs CORS. A strict CSP must allow it.
- **hreflang lists only the locales that serve the page**; `x-default` is emitted only when the default locale serves it.
- **An unlocalized page has no hreflang or og:locale:alternate.**
- **Canonical and hreflang include app.baseURL** when the origin comes from the request. `metaBaseUrl` and `site.url` stay as written.
- **404 pages carry <html lang dir>**, in the locale of the URL. They have no canonical, `hreflang`, `og:url`, `og:locale` or alternates, also when the module itself answers the 404 on a matched record (`/en/...`). Tags you pass through `useI18nHead` `replace` stay, so skip them on error pages.
- **Canonical, og:url and hreflang keep a whitelisted query** (`/about?page=2`), on the server too: it was dropped during SSR. `page`, `sort`, `filter`, `search`, `q`, `query` and `tag` are whitelisted by default; see [`canonicalQueryWhitelist`](/api/module-options#canonicalquerywhitelist).
- **An X-Forwarded-Host that does not parse is ignored** instead of a 500 on every page. With no usable host, and no `metaBaseUrl` or `site.url`, canonical and `hreflang` URLs on that response are relative. A `Host` that does not parse stays a 500, as on a plain Nuxt app.
- **disableMeta now works,** in `$defineI18nRoute` and `routeDisableMeta` alike, also when set in `nuxt.config`: the page has no `hreflang`, canonical or `og:locale`. `lang` and `dir` stay.
- `useLocaleHead()` also returns `build()`, a getter for `useHead(() => build())`.
- On a plain build without `metaBaseUrl`, `X-Forwarded-Host` still chooses the host in these tags, as before. Pin `metaBaseUrl` if the origin is reachable directly: see [Behind a proxy or CDN](/guide/deployment#behind-a-proxy-or-cdn).

### Translations

- **Merges are deep at every level.** Root, page and fallback files used a 2-level merge, so `a.b.c` from a fallback or the root was lost in source mode and in dev. All modes now give the same dictionary.
- **Fallback chains are followed to their end** (`fr` → `de` → `en`) in every mode.
- **Merging goes by locale, not by file kind.** The active locale's root file now beats a fallback locale's page file. See [Fallback locales](/guide/translations#fallback-locales).
- **A project's locales entry beats a layer's** for the same `code`; a layer only fills the gaps.
- **A page without its own pages/<name>/ folder reads the root dictionary,** child pages too. It used to get `{}` and show raw keys. Output gains a file per such page, and `__root/<locale>/data.json` per locale: `/_locales/<any name>/en/data.json` is a 200 with the root keys, it was `{}`. That matters for monitoring, for allow-lists on static hosts and for tools that read the tree.
- **disablePageLocales: true reads the root files only;** `pages/index` is no longer merged in.
- **The leaving page's keys stop resolving when its element leaves the document.** If a layout used keys that only the previous page's file had, move them to the root file. A parent's keys stay while its child is shown, including a parent with an `index` child, until the next navigation. Between two children of one parent, a parent's own keys need the child's dictionary or the root one.
- **$clearCache() reloads the current page's dictionary** and keeps the old one on screen until the new one lands. A failed reload keeps the old dictionary, a response requested before the clear is discarded, and a page in its leaving transition stays translated.
- **$has(key, route) honours the route.**
- **$loadPageTranslations on a page not visited yet no longer stops its file from loading.** The file loads on the first visit and your keys stay on top of it. The page used to show raw keys until a reload.
- **Translation HMR applies edits in place**, without a page reload; removed keys disappear and root edits reach every page.
- **A broken locale file warns once with its path, in every mode.** Dev used to throw and premerged skipped it silently, so an app that relied on dev failing hard no longer sees that.

### Plurals and formatting

- `$tc` with a negative, fractional or huge count takes the last form with the real count; `{ count: null }` no longer throws; a missing plural key reaches the missing handler.
- `$tdr` gives real future dates (`in 3 days`, or `tomorrow` with `numeric: 'auto'`) and `Invalid Date` for an invalid input. Under a second in the past is `0 seconds ago`.
- **$tn, $td and $tdr go by iso**, as plurals do: `{ code: 'en', iso: 'en-GB' }` now formats dates as `31/10/2026`. In a locale code `_` reads as `-`, so `en_US` no longer throws, and a code `Intl` does not know formats as `en` rather than following the machine's locale. Named formats are still looked up by `code`.
- A `{param}` placeholder reads only the params you pass (`{constructor}` stays as written).
- `{placeholder}` names may hold any character but braces and spaces: `{firstName}`, `{first-name}` and `{user.name}` are read from `params`. Without such a param they stay as written, as before.
- A `defaultValue` is interpolated, in `$t` and `$tc`: `$t('missing', { n: 1 }, 'Got {n}')` gives `Got 1`, it used to give `Got {n}`. A default that is not a string comes back as it is.
- `$tc` on an empty translation answers `''`, as `$t` does. It used to answer the default value or the key.
- **Plural templates keep their meaning, with one exception.** The table lists every shape. To get `Intl.PluralRules` categories, say so with the new [`=0 ` marker](/api/methods#tc): `=0 no apples | one apple | {count} apples`.<table>
<thead>
  <tr>
    <th>
      Shape
    </th>
    
    <th>
      Example (in <code>
        uk
      </code>
      
      )
    </th>
    
    <th>
      Before
    </th>
    
    <th>
      Now
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Any template in a locale with one or two integer categories (<code>
        en
      </code>
      
      , <code>
        de
      </code>
      
      , <code>
        fr
      </code>
      
      , <code>
        es
      </code>
      
      , <code>
        ja
      </code>
      
      ...)
    </td>
    
    <td>
      <code>
        none | one | {count} many
      </code>
    </td>
    
    <td>
      by index
    </td>
    
    <td>
      <strong>
        unchanged
      </strong>
    </td>
  </tr>
  
  <tr>
    <td>
      One form per category
    </td>
    
    <td>
      <code>
        one | few | many
      </code>
    </td>
    
    <td>
      by index: 21 → <code>
        many
      </code>
    </td>
    
    <td>
      <strong>
        unchanged
      </strong>
      
      . Add the marker for 21 → <code>
        one
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Zero form first, three forms
    </td>
    
    <td>
      <code>
        none | one | many
      </code>
    </td>
    
    <td>
      by index
    </td>
    
    <td>
      <strong>
        unchanged
      </strong>
    </td>
  </tr>
  
  <tr>
    <td>
      Other placeholders
    </td>
    
    <td>
      <code>
        no items | {n} item | {n} items
      </code>
    </td>
    
    <td>
      by index
    </td>
    
    <td>
      <strong>
        unchanged
      </strong>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        {count}
      </code>
      
       in every form
    </td>
    
    <td>
      <code>
        {count} many | {count} one | {count} few
      </code>
    </td>
    
    <td>
      by index
    </td>
    
    <td>
      <strong>
        unchanged
      </strong>
    </td>
  </tr>
  
  <tr>
    <td>
      Fewer or more forms than below
    </td>
    
    <td>
      <code>
        a | b
      </code>
      
      , <code>
        none | one | two | {count} many
      </code>
    </td>
    
    <td>
      by index
    </td>
    
    <td>
      <strong>
        unchanged
      </strong>
    </td>
  </tr>
  
  <tr>
    <td>
      In <code>
        lv
      </code>
      
      , <code>
        prg
      </code>
      
      , <code>
        blo
      </code>
      
      , <code>
        cv
      </code>
      
      , <code>
        ksh
      </code>
      
      , <code>
        lag
      </code>
    </td>
    
    <td>
      <code>
        none | one | {count} many
      </code>
    </td>
    
    <td>
      by index
    </td>
    
    <td>
      <strong>
        unchanged
      </strong>
    </td>
  </tr>
  
  <tr>
    <td>
      Marked with <code>
        =0
      </code>
    </td>
    
    <td>
      <code>
        =0 none | one | many
      </code>
    </td>
    
    <td>
      the marker was shown as text
    </td>
    
    <td>
      zero form, then categories
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        A zero form with no placeholder, then one form per category, with <code>
          {count}
        </code>
        
         in each form several counts share
      </strong>
    </td>
    
    <td>
      <code>
        none | {count} one | {count} few | {count} many
      </code>
    </td>
    
    <td>
      by index: 3 → <code>
        3 many
      </code>
      
      , 21 → <code>
        21 many
      </code>
    </td>
    
    <td>
      <strong>
        by category
      </strong>
      
      : 3 → <code>
        3 few
      </code>
      
      , 21 → <code>
        21 one
      </code>
      
      . 0, 1, 2 and every count that stays in <code>
        many
      </code>
      
       give the same result
    </td>
  </tr>
</tbody>
</table>

<br />

The last shape needs three or more categories (`ru`, `uk`, `pl`, `cs`, `sk`, `hr`, `sr`, `lt`, `ro`, `sl`, `he`, `ar`, `cy`...). In `ar`, `one` and `two` are single counts, so those two forms need no number.
- **A locale code Intl does not know gets the index rule**, with or without the marker's categories: `ua` no longer follows the machine's locale. Set `iso`: `{ code: 'ua', iso: 'uk-UA' }` plurals as Ukrainian, in the module and in `@i18n-micro/vue`.
- **A custom plural rule keeps its signature** and still gets the locale code. It reads the raw value, so a marked template reaches it with `=0 ` in place, and it gets the count as a `Number`: `1.5` where it used to get `1`. Returning `null` falls back to the built-in rule, which honours the marker.
- **timeZone option.** Set it (`Europe/Berlin`) to render one calendar date on the server and in every browser. It has no effect on `relativeDate`, which depends on the clock.

### `<i18n-t>`

This section covers `<i18n-t>` in the module and `I18nT` in `@i18n-micro/vue`. For the other frameworks see [Framework packages](#framework-packages).

- **html escapes params, in every case, and ignores all slots.** Only the translation is trusted markup. A param that held markup on purpose now shows as text: put the markup in the translation and pass the data as params, or use slots without `html`.
- **Slots work with plural, number, date and relativeDate,** and a `default` slot receives `{ translation }` in those cases too. Every `{name}` is filled, not only the first.
- **A slot beats a param of the same name.** A param value that looks like a placeholder stays text. With a `customPluralRule` or a custom `plural` the rule returns a finished string, so a param it interpolated can be taken for a placeholder there.
- **null means not set** for `plural`, `number`, `date` and `relativeDate`. `:plural="null"` used to fail the render, `:date="null"` rendered 1970.
- `plural` counts like `$tc`, with `Number`: `1.5` stays `1.5` and takes the last form, it used to be cut to `1`; `"2 items"` is `NaN`, it used to be `2`; `""` is `0`. A `customPluralRule` sees `1.5` too. Its other contract is unchanged: same arguments, its answer is used as is, `null` renders empty.
- `hideIfEmpty` applies to `plural`, `number`, `date` and `relativeDate`. A hidden value renders a comment, not an empty text node, so a test that read `''` sees `<!---->`.
- **A missing key under html is text.** The key is escaped, because only a translation is trusted and a key can come from a request. A `defaultValue` is yours and stays markup.
- With `plural`, a `defaultValue` or the key stands whole on a miss, as in `$tc`: `a | b` is no longer split.
- `defaultValue` stands in for a missing key in every branch, not the key itself, and a `customPluralRule` gets it through its getter on a miss. It used to do something only after `hideIfEmpty`.
- `<i18n-t>` with `number`, `date` or `relativeDate` keeps `params`; they are merged in.
- `date` and `relativeDate` output carries `data-allow-mismatch="text"`: a clock or a time zone that differs between server and browser no longer warns during hydration. Next to a named slot, the text around the slot sits in a `<span>` of its own, because Vue checks the attribute only on an element's single text.
- `.innerHTML` and `textContent` attributes are dropped along with `innerHTML`.
- `<i18n-t>` and `<i18n-group>` read the active dictionary, as `$t` does, not the route's chunk. Evicted chunks (`cacheMaxSize`) no longer show raw keys. A page in its leaving transition now reads what `$t` reads there: the new page's dictionary, falling through to its own on a miss, so a key both pages define shows the new text, and after a locale switch its own keys show raw until it unmounts.

### `<i18n-switcher>` and `<i18n-link>`

- **A click on a switcher link is one navigation.** It is a plain `<a>` calling `$switchLocale`, not a `NuxtLink` plus a click handler, so `router-link-active` classes are gone. The `href` still carries `app.baseURL`, and the current locale's link still has `aria-current="page"`. Ctrl/cmd-click opens a new tab and leaves this tab alone. Links keep the query and hash.
- The button is `type="button"`, so it no longer submits a surrounding form, and has `aria-expanded`. `aria-haspopup` is gone, in the module, `@i18n-micro/vue` and `@i18n-micro/astro`: it promised a menu, and the list is links. Escape and a click outside close the dropdown; two switchers no longer stay open together.
- The wrapper and dropdown have the classes `i18n-switcher-wrapper` and `i18n-switcher-dropdown`; the button has `i18n-switcher-button` as well as `language-switcher`, and its label sits in a `<span>`. Default styles use logical CSS properties (`inset-inline-start`, `margin-inline-start`), and the caret is `▾`. The dropdown has `z-index: 1000` (it was 10), `min-width: 150px` and a `box-shadow`, the wrapper `vertical-align: middle`. Each link has `lang`, and `dir` when the locale sets it.
- `<i18n-link>`: `https://`, `mailto:` and `tel:` are matched in any case (`HTTPS://x.com`, `Mailto:`). A bare `report.pdf` or `index.html` is a route, not `https://report.pdf`; `example.com` and `example.com:8080` stay external. A file ending that is also a TLD (`example.md`, `x.zip`) counts as a file: write `https://`. `activeStyle` ignores a trailing slash, the query and the hash. It is typed `CSSProperties` now, so some typed values may need a change.

### Hooks, plugins and types

- **i18n:register runs at app:created on startup,** after every plugin instead of between them. A plugin with `order` above 1 or `enforce: 'post'` now has its subscriber called on startup too, but no longer reads registered keys in its own `setup`. In a navigation the hook now runs before other plugins' `router.beforeEach` guards.
- **i18n:register gets the locale of the page it fills.** Under `hashMode` a navigation that changes the locale used to pass the old one, and the keys landed in the wrong chunk.
- **i18n:register is a runtime hook:** register it with `nuxtApp.hook('i18n:register', …)` in a plugin, without `@ts-expect-error`. See [Hooks](/api/events).
- **hooks: false and define: false** still turn their parts off.
- **With plugin: false, $defineI18nRoute stays callable** and does nothing at runtime. It used to crash the page.
- The `hooks` option no longer documents `i18n:beforeLocaleSwitch` / `i18n:afterLocaleSwitch`; they were never emitted.
- `const { $defineI18nRoute } = useNuxtApp()` in a page now works with configs that use variables.
- `useI18n()` has more keys: `clearCache`, `pluralFunc`, `pluralLocale`. `clearCache` is on its type.
- `$getRouteName(route)` answers for the route it is given. It returned an empty string.
- `useI18nLocale()` drops `getLocaleWithServerFallback(serverLocale)`: write `getPreferredLocale() ?? serverLocale ?? null`.
- **$getI18nConfig() is read-only on the server in dev.** A write throws there, and in production it would reach every request.

### Server, build and deployment

- **A page's payload file holds only what differs from the locale's root.** The client loads the root once and merges each page over it, so disk and Edge bundles shrink and a second page costs a fraction of the first. `premerged` now writes `__root/<locale>/data.json`, and `/_locales/<page>/<locale>/data.json` holds only the difference: anything that reads those files directly must merge the two. A full dictionary is still a valid file, so a host or `source` mode that serves one keeps working.
- **Dictionary files are cached by version.** A URL with the current `?v=` is pinned for a year on a Node server, other URLs revalidate, and a host's static copy answers `max-age=60`: see [Cache headers](/guide/deployment#cache-headers-and-datebuild). `httpCacheControl: false` keeps `max-age=0`. A translation changed without a rebuild reaches a browser only when `v` moves: set `NUXT_I18N_DATE_BUILD`.
- **Dictionaries follow app.cdnURL.** The browser fetches public payload files from `<cdnURL>/_locales/...`, where it used `app.baseURL`: the CDN must hold `_locales/` and allow your site's origin (CORS). See [App baseURL and payload hosts](/guide/deployment#app-baseurl-and-payload-hosts).
- **SSR no longer requests /_locales over HTTP,** so a server middleware or a log on that route stops seeing the render's reads. An external `apiBaseServerHost` still goes over HTTP.
- **A failed read no longer sticks, and neither does a 404.** A 404 from a host means it has no such file: the render shows the root dictionary, as the browser does, nothing is kept, and the file is read once it appears. Any other failure, a 200 that is not a JSON object, or an unreadable or corrupt local file reaches no cache, and the next request reads again: a page render logs a warning, shows raw keys and answers `503` with `no-store` and `Retry-After`, so a route rule or a CDN keeps nothing of it while the browser still reads the dictionary on hydration, `/_locales/...` answers `503` with `no-store`, and `useTranslationServerMiddleware` gives a `t` that answers the key or the default. During an outage every request reaches the host, and a host that sends no response headers for 60 seconds fails the read. A slow download of a large file has no limit. See [When a dictionary cannot be read](/guide/deployment#when-a-dictionary-cannot-be-read). `/_locales` passes that 404 on too, where it answered `200 {}`.
- **A prerender that cannot load its dictionary fails,** and so does one whose host has neither the page's file nor the root file. The route is a 500, a warning names the locale and the page, and no file is written; with Nuxt's default `failOnError` the build exits 1. A page with no file of its own over a root file prerenders with the root.
- **A host set at build time answers SSR,** also with the default public copy, and on an error page on an internal path. The public file used to answer. `NUXT_I18N_APP_BASE_SERVER_HOST` at runtime now reaches `/_locales` and the server loader, and the render reads either host through that loader.
- **A custom nitro.output.publicDir, and any other layout where public/ is not beside the server, embeds the payloads.**
- **nuxi build --preset <static preset> prerenders as nuxi generate does,** so it may write more files. `nuxi generate` prerenders every static page in each locale that serves it, linked or not, unless a route rule sets `prerender: false`.
- **source or publicAssets: false on static output warns.** There is nothing for the browser to read.
- **The embed warning is a size check now.** The build warns only past a platform's limit: see [Bundle limits](/guide/deployment#bundle-limits-on-edge).
- **Vary is set wherever the visitor decides:** on every page under `no_prefix`, and on `/` and any other URL that can redirect by preference. It holds `Cookie` when a cookie is in use and, with `autoDetectLanguage`, `Accept-Language`. Check your CDN's cache key: see [Caching HTML](/guide/deployment#caching-html).
- **/_locales caching changed.** There is no Nitro route cache on `/{apiBaseUrl}/**`, and the `s-maxage=60, stale-while-revalidate` header is gone. If you relied on that cache, put a CDN in front of the payload route. An empty dictionary is never `immutable`.
- **The server cache is bounded by default:** at most 1000 entries when `cacheMaxSize` is unset. `cacheTtl` counts from when an entry was stored; reads no longer extend it.
- **New optional cacheStorage:** a dictionary cache several instances share. Unset, nothing changes.

### Framework packages

The `2.0.0` packages depend on each other: upgrade them together.

#### `@i18n-micro/react`, `@i18n-micro/preact`, `@i18n-micro/solid`

<table>
<thead>
  <tr>
    <th>
      Package
    </th>
    
    <th>
      Change
    </th>
    
    <th>
      Action
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      react
    </td>
    
    <td>
      React 18 or newer; <code>
        use-sync-external-store
      </code>
      
       is no longer a dependency; <code>
        react-dom
      </code>
      
       is an optional peer; new entries <code>
        /client
      </code>
      
       and <code>
        /server
      </code>
    </td>
    
    <td>
      Stay on 1.x for React 16 or 17
    </td>
  </tr>
  
  <tr>
    <td>
      react
    </td>
    
    <td>
      Renders on a server: 1.x failed with <code>
        Missing getServerSnapshot
      </code>
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      react, solid
    </td>
    
    <td>
      Router adapters moved to the <code>
        /router
      </code>
      
       subpath
    </td>
    
    <td>
      <code>
        import { createReactRouterAdapter } from '@i18n-micro/react/router'
      </code>
      
       (Solid: <code>
        createSolidRouterAdapter
      </code>
      
       from <code>
        @i18n-micro/solid/router
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      preact
    </td>
    
    <td>
      <code>
        createBrowserHistoryAdapter
      </code>
      
       moved to <code>
        @i18n-micro/preact/router
      </code>
      
      ; <code>
        createPreactRouterAdapter
      </code>
      
       is removed. New optional third argument <code>
        ssrUrl
      </code>
    </td>
    
    <td>
      Change the import. Under SSR pass the request's URL, or links and the switcher render as on <code>
        /
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      react, preact
    </td>
    
    <td>
      <code>
        numberFormats
      </code>
      
       and <code>
        datetimeFormats
      </code>
      
       are honoured, so <code>
        tn(n, 'currency')
      </code>
      
       output changes. They used to be ignored
    </td>
    
    <td>
      Check named formats
    </td>
  </tr>
  
  <tr>
    <td>
      react, preact
    </td>
    
    <td>
      A link to <code>
        /
      </code>
      
       or a locale root is active on an exact match only; <code>
        className
      </code>
      
       on the switcher adds to <code>
        i18n-switcher-wrapper
      </code>
    </td>
    
    <td>
      Check active-link styles
    </td>
  </tr>
  
  <tr>
    <td>
      all three
    </td>
    
    <td>
      <code>
        I18nT
      </code>
      
       follows <a href="#i18n-t">
        <code>
          <i18n-t>
        </code>
      </a>
      
      : <code>
        html
      </code>
      
       escapes params, <code>
        plural
      </code>
      
       keeps fractions, <code>
        number
      </code>
      
      , <code>
        date
      </code>
      
       and <code>
        relativeDate
      </code>
      
       beat a param of their name, <code>
        hideIfEmpty
      </code>
      
       and <code>
        defaultValue
      </code>
      
       apply in every branch, a hidden value renders bare, with no element. <code>
        dangerouslySetInnerHTML
      </code>
      
      , <code>
        innerHTML
      </code>
      
       and <code>
        textContent
      </code>
      
       attributes are dropped
    </td>
    
    <td>
      Move markup from params into the translation or <code>
        components
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      all three
    </td>
    
    <td>
      New <code>
        components
      </code>
      
       prop on <code>
        I18nT
      </code>
      
       for rich text, children as Vue's default slot
    </td>
    
    <td>
      See <a href="/integrations/#rich-text">
        Rich text
      </a>
    </td>
  </tr>
  
  <tr>
    <td>
      all three
    </td>
    
    <td>
      <code>
        I18nSwitcher
      </code>
      
       matches the Vue one: <code>
        <a href>
      </code>
      
       items with <code>
        aria-current="page"
      </code>
      
       on the current locale, <code>
        ▾
      </code>
      
       with a space before it, logical CSS, <code>
        language-switcher
      </code>
      
       on the button, no <code>
        aria-haspopup
      </code>
      
      , clicks bubble, Escape closes it. A caller's <code>
        getLocaleName
      </code>
      
       wins over the list in Solid too
    </td>
    
    <td>
      Check styles and tests that looked for <code>
        li button
      </code>
      
       or <code>
        ▼
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      all three
    </td>
    
    <td>
      <code>
        I18nLink
      </code>
      
      : a user <code>
        onClick
      </code>
      
       and <code>
        style
      </code>
      
       are kept, a modified click or <code>
        target
      </code>
      
       is left to the browser, query and hash do not count for the active check. Without a router a click is the browser's own and no link is active
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      react, preact
    </td>
    
    <td>
      <code>
        I18nLocalesContext
      </code>
      
      , <code>
        I18nDefaultLocaleContext
      </code>
      
       and <code>
        I18nRouterContext
      </code>
      
       are one <code>
        I18nConfigContext
      </code>
      
      ; <code>
        I18nContext
      </code>
      
       still holds the instance
    </td>
    
    <td>
      Use <code>
        I18nProvider
      </code>
      
      , or the <code>
        useI18nLocales
      </code>
      
      -style hooks
    </td>
  </tr>
  
  <tr>
    <td>
      solid
    </td>
    
    <td>
      One context: <code>
        I18nContext
      </code>
      
       holds <code>
        { i18n, locales, defaultLocale, router }
      </code>
      
      ; the other three are gone
    </td>
    
    <td>
      Use <code>
        I18nProvider
      </code>
      
      , or the <code>
        useI18nLocales
      </code>
      
      -style hooks
    </td>
  </tr>
  
  <tr>
    <td>
      all three
    </td>
    
    <td>
      <code>
        getCurrentPath
      </code>
      
       of the adapters has the query and hash, so <code>
        switchLocale
      </code>
      
       keeps them; <code>
        resolvePath
      </code>
      
       keeps them too. <code>
        getRoute().fullPath
      </code>
      
       has them as well, and a repeated key in <code>
        getRoute().query
      </code>
      
       is an array
    </td>
    
    <td>
      Custom strategies: return the full path, links compare by page
    </td>
  </tr>
  
  <tr>
    <td>
      react, preact
    </td>
    
    <td>
      <code>
        ReactI18n
      </code>
      
       and <code>
        PreactI18n
      </code>
      
       are the runtime's <code>
        I18n
      </code>
      
      ; <code>
        t
      </code>
      
       from <code>
        useI18n()
      </code>
      
       keeps its identity until the store changes; <code>
        defaultLocale()
      </code>
      
       without a value is <code>
        fallbackLocale
      </code>
      
      , it used to follow the locale
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      all three
    </td>
    
    <td>
      A nested <code>
        I18nProvider
      </code>
      
       without <code>
        i18n
      </code>
      
       keeps the outer instance; a provider with no instance at all throws. In React and Preact it may instead get the <code>
        createI18n
      </code>
      
       options as props. <code>
        locales
      </code>
      
       add their <code>
        iso
      </code>
      
       to <code>
        localeIso
      </code>
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      solid
    </td>
    
    <td>
      <code>
        SolidI18n
      </code>
      
       is built on the runtime, and the package now depends on <code>
        @i18n-micro/runtime
      </code>
      
       and publishes <code>
        src/
      </code>
      
       through a <code>
        solid
      </code>
      
       export condition. <code>
        routeMessages
      </code>
      
      , <code>
        loadFromUrl
      </code>
      
      , <code>
        hasTranslation
      </code>
      
      , <code>
        clear
      </code>
      
       and a <code>
        fallbackLocale
      </code>
      
       setter are new. <code>
        getCurrentPathAccessor
      </code>
      
       is removed: read a signal in <code>
        getCurrentPath
      </code>
      
      . <code>
        useI18n()
      </code>
      
       no longer throws without <code>
        locales
      </code>
      
      , <code>
        useI18nLocales
      </code>
      
       and <code>
        useI18nDefaultLocale
      </code>
      
       answer <code>
        undefined
      </code>
      
      . The adapter no longer needs a reactive owner
    </td>
    
    <td>
      Remove the accessor from custom strategies
    </td>
  </tr>
</tbody>
</table>

#### `@i18n-micro/vue`

<table>
<thead>
  <tr>
    <th>
      Change
    </th>
    
    <th>
      Action
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        numberFormats
      </code>
      
       and <code>
        datetimeFormats
      </code>
      
       are honoured, so <code>
        tn(n, 'currency')
      </code>
      
       output changes
    </td>
    
    <td>
      Check named formats
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        I18nT
      </code>
      
       is a functional component and follows <a href="#i18n-t">
        <code>
          <i18n-t>
        </code>
      </a>
      
      ; <code>
        I18nSwitcher
      </code>
      
       and <code>
        I18nLink
      </code>
      
       follow <a href="#i18n-switcher-and-i18n-link">
        the section above
      </a>
    </td>
    
    <td>
      A <code>
        ref
      </code>
      
       on <code>
        <I18nT>
      </code>
      
       no longer gives a component instance
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        I18nLink
      </code>
      
       and <code>
        createVueRouterAdapter
      </code>
      
       resolve <code>
        name
      </code>
      
      , <code>
        query
      </code>
      
       and <code>
        hash
      </code>
      
      ; <code>
        #top
      </code>
      
       stays on this page; <code>
        switchLocale
      </code>
      
       and the switcher keep the query and hash
    </td>
    
    <td>
      Check tests that pinned <code>
        /de
      </code>
      
       for a named target. An unknown <code>
        name
      </code>
      
       now throws, as <code>
        RouterLink
      </code>
      
       does
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        useLocaleHead
      </code>
      
       no longer builds <code>
        //de/
      </code>
      
       with the default <code>
        baseUrl: '/'
      </code>
      
      ; canonical and <code>
        hreflang
      </code>
      
       of one page agree (<code>
        /de
      </code>
      
      , was <code>
        /de/
      </code>
      
      ), and whitelisted query params reach <code>
        hreflang
      </code>
      
       and <code>
        x-default
      </code>
      
      , as in Nuxt. Canonical and <code>
        og:url
      </code>
      
       keep <code>
        canonicalQueryWhitelist
      </code>
      
       params with the vue-router adapter
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        I18nRoutingStrategy
      </code>
      
      : <code>
        resolvePath
      </code>
      
       may get a location object and a path with a query and hash; new optional <code>
        toHref
      </code>
    </td>
    
    <td>
      Custom strategies: keep what follows the path
    </td>
  </tr>
</tbody>
</table>

#### `@i18n-micro/astro`

<table>
<thead>
  <tr>
    <th>
      Change
    </th>
    
    <th>
      Action
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        i18nIntegration
      </code>
      
       bundles <code>
        translationDir
      </code>
      
       and installs the middleware
    </td>
    
    <td>
      Delete a <code>
        src/middleware.ts
      </code>
      
       that only copies the setup. To keep it, pass <code>
        middleware: false
      </code>
      
      , or its options are lost (a warning says so)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        i18nIntegration
      </code>
      
       <strong>
        throws
      </strong>
      
       on <code>
        messages
      </code>
      
      , <code>
        plural
      </code>
      
      , <code>
        missingHandler
      </code>
      
       and <code>
        routingStrategy
      </code>
      
      , and no longer sets a global routing strategy
    </td>
    
    <td>
      Pass them to <code>
        createI18n
      </code>
      
       / <code>
        createI18nMiddleware
      </code>
      
       in <code>
        src/middleware.ts
      </code>
      
      , with <code>
        middleware: false
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        I18nIntegrationOptions
      </code>
      
       no longer inherits the module's options, so about 45 fields such as <code>
        strategy
      </code>
      
       and <code>
        meta
      </code>
      
       are TypeScript errors. They never did anything there
    </td>
    
    <td>
      Remove them
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        loadTranslationsFromDir
      </code>
      
      , <code>
        loadTranslationsIntoI18n
      </code>
      
       moved to <code>
        @i18n-micro/astro/node
      </code>
      
      , which is ESM only
    </td>
    
    <td>
      Change the import; <code>
        virtual:i18n-micro/messages
      </code>
      
       has the bundled dictionaries
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        getGlobalRoutingStrategy
      </code>
      
      , <code>
        setGlobalRoutingStrategy
      </code>
      
      , <code>
        runWithRoutingStrategy
      </code>
      
       removed, with their <code>
        AsyncLocalStorage
      </code>
    </td>
    
    <td>
      Read <code>
        Astro.locals.routingStrategy
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        AstroI18n
      </code>
      
       extends the runtime <code>
        I18n
      </code>
      
      : <code>
        clone()
      </code>
      
       is <code>
        fork()
      </code>
      
      , the <code>
        _storage
      </code>
      
       option is gone. The package depends on <code>
        @i18n-micro/runtime
      </code>
      
      , no longer on <code>
        @i18n-micro/node
      </code>
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      Dynamic pages are one route: <code>
        /blog/hello
      </code>
      
       is <code>
        blog-slug
      </code>
      
       (was <code>
        blog-hello
      </code>
      
      ), <code>
        [...path]
      </code>
      
       is <code>
        path
      </code>
    </td>
    
    <td>
      Move <code>
        pages/blog-hello/
      </code>
      
       to <code>
        pages/blog-slug/
      </code>
      
      . A custom <code>
        getRouteName
      </code>
      
       gets the pattern as a third argument
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        base
      </code>
      
       works: helpers return URLs with it, the cookie lives under it
    </td>
    
    <td>
      A <code>
        src/middleware.ts
      </code>
      
       of your own passes <code>
        base: config.base
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      The URL decides the page locale; <code>
        autoDetect
      </code>
      
       is a 302 from <code>
        /
      </code>
      
       to the preferred locale's home; new <code>
        localeCookie
      </code>
      
       middleware option; <code>
        redirectToDefault
      </code>
      
       is implemented
    </td>
    
    <td>
      See <a href="/integrations/astro-package">
        Astro
      </a>
    </td>
  </tr>
  
  <tr>
    <td>
      A page view from a same-origin page of another locale writes the locale cookie and does not redirect; endpoints, images, 404s, posts and prefetches do not. Server islands and actions never redirect and carry <code>
        Vary: Referer
      </code>
    </td>
    
    <td>
      Check your CDN if it refuses <code>
        Set-Cookie
      </code>
      
      ; behind a proxy set <code>
        security.allowedDomains
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Disabled locales: <code>
        config.localeCodes
      </code>
      
       leaves them out, <code>
        /fr
      </code>
      
       is no locale, <code>
        prepareLocaleRewrite
      </code>
      
       answers 404
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        prepareLocaleRewrite
      </code>
      
       and <code>
        getLocaleRewritePath
      </code>
      
       take a narrower type; anything that passed before still passes
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        getI18nProps()
      </code>
      
       without keys sends all <code>
        t()
      </code>
      
       can answer on the page, with a dev warning above 20 KB; <code>
        fallbackLocale
      </code>
      
       is the instance's; <code>
        translations
      </code>
      
       always has the route
    </td>
    
    <td>
      Pass the keys the island uses
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        useLocaleHead
      </code>
      
      : default <code>
        baseUrl
      </code>
      
       is <code>
        site
      </code>
      
      , else root-relative (<code>
        /about
      </code>
      
      , was <code>
        //about
      </code>
      
      ); links and metas carry <code>
        id
      </code>
      
      ; after <code>
        Astro.rewrite
      </code>
      
       it names the requested URL
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        <I18nT html>
      </code>
      
       escapes <code>
        params
      </code>
      
      ; any <code>
        tag
      </code>
      
       works; attributes pass through; an empty translation renders empty, not the key
    </td>
    
    <td>
      Move a param holding markup into the translation
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        <I18nLink>
      </code>
      
       leaves external URLs, <code>
        #hash
      </code>
      
       and <code>
        ?query
      </code>
      
       alone and keeps a trailing slash; <code>
        localizePath
      </code>
      
       the same, and with no locale it uses the current one
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        <I18nSwitcher>
      </code>
      
       keeps the query, one script for all switchers, <code>
        hidden
      </code>
      
       on the list, <code>
        data-i18n-switcher
      </code>
      
       instead of the generated ids, no <code>
        aria-haspopup
      </code>
    </td>
    
    <td>
      Check selectors
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        @i18n-micro/astro/client
      </code>
      
       only has <code>
        translate
      </code>
      
       and <code>
        hasTranslation
      </code>
    </td>
    
    <td>
      Import adapters from <code>
        /client/vue
      </code>
      
      , <code>
        /client/react
      </code>
      
      , <code>
        /client/preact
      </code>
      
      , <code>
        /client/svelte
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        client/vue
      </code>
      
       no longer bundles its own Vue: reactivity works, and <code>
        vue
      </code>
      
       must be installed
    </td>
    
    <td>
      Install <code>
        vue
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Islands: <code>
        has()
      </code>
      
       is true for a subtree, <code>
        t('')
      </code>
      
       is <code>
        ''
      </code>
      
      , as on the server; React and Preact get <code>
        setLocale
      </code>
      
      , <code>
        setRoute
      </code>
      
      . <code>
        provideI18n
      </code>
      
       takes a getter to follow new props
    </td>
    
    <td>
      Use <code>
        provideI18n(() => props.i18n)
      </code>
      
       with <code>
        transition:persist
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        getLocale
      </code>
      
      , <code>
        getDefaultLocale
      </code>
      
       throw without the middleware instead of answering <code>
        'en'
      </code>
    </td>
    
    <td>
      —
    </td>
  </tr>
</tbody>
</table>

#### `@i18n-micro/vitepress`

<table>
<thead>
  <tr>
    <th>
      Change
    </th>
    
    <th>
      Action
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Links, the switcher, <code>
        push
      </code>
      
       and <code>
        replace
      </code>
      
       carry <code>
        site.base
      </code>
      
      ; <code>
        resolvePath
      </code>
      
       and <code>
        localizePath
      </code>
      
       stay relative to it; <code>
        numberFormats
      </code>
      
      , <code>
        datetimeFormats
      </code>
      
       and <code>
        timeZone
      </code>
      
       reach <code>
        createI18n
      </code>
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      The locale head with <code>
        alternates: false
      </code>
      
       also drops <code>
        x-default
      </code>
    </td>
    
    <td>
      —
    </td>
  </tr>
</tbody>
</table>

#### `@i18n-micro/node`, `@i18n-micro/runtime`

<table>
<thead>
  <tr>
    <th>
      Package
    </th>
    
    <th>
      Change
    </th>
    
    <th>
      Action
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      node
    </td>
    
    <td>
      Loads translations on Node 24 (<code>
        dirent.path
      </code>
      
       is gone there)
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      node
    </td>
    
    <td>
      New <code>
        run(locale, fn)
      </code>
      
       and <code>
        fork(locale)
      </code>
      
       for requests; <code>
        reload()
      </code>
      
       swaps dictionaries instead of emptying them first, and logs no success message; a directory that is gone keeps the old ones, an emptied one empties them
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      node, astro, vitepress
    </td>
    
    <td>
      One reader of a locales folder: symlinked files are read, a missing folder warns, a file that is not a JSON object is reported and skipped, a BOM is fine. Messages start with <code>
        [i18n]
      </code>
    </td>
    
    <td>
      Adjust tests that pinned the old messages
    </td>
  </tr>
  
  <tr>
    <td>
      runtime
    </td>
    
    <td>
      <code>
        numberFormats
      </code>
      
       and <code>
        datetimeFormats
      </code>
      
       are honoured, so <code>
        tn(n, 'currency')
      </code>
      
       output changes; new <code>
        timeZone
      </code>
      
      , <code>
        now
      </code>
      
       and <code>
        localeIso
      </code>
      
       options
    </td>
    
    <td>
      Check named formats
    </td>
  </tr>
  
  <tr>
    <td>
      runtime
    </td>
    
    <td>
      A write to a locale that is neither active nor fallback does not notify
    </td>
    
    <td>
      A listener that wants every preload: read the store when the locale changes
    </td>
  </tr>
  
  <tr>
    <td>
      runtime
    </td>
    
    <td>
      New <code>
        fork(locale)
      </code>
      
      ; <code>
        storage
      </code>
      
       is a getter; <code>
        loadFromUrls
      </code>
      
       fetches in parallel and writes nothing if one fails
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      runtime, vue, node, astro
    </td>
    
    <td>
      <code>
        addRouteTranslations(locale, route, messages, false)
      </code>
      
       replaces the chunk. It used to merge
    </td>
    
    <td>
      Pass <code>
        true
      </code>
      
      , or the default, to merge
    </td>
  </tr>
</tbody>
</table>

### Other packages

These are public on npm, but most apps reach them only through the module.

#### `@i18n-micro/core`, `@i18n-micro/utils`

<table>
<thead>
  <tr>
    <th>
      Package
    </th>
    
    <th>
      Change
    </th>
    
    <th>
      Action
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      core
    </td>
    
    <td>
      <code>
        useTranslationHelper(storage)
      </code>
      
       is gone
    </td>
    
    <td>
      <code>
        new TranslationHelper(storage)
      </code>
      
      . A destructured method loses <code>
        this
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      core
    </td>
    
    <td>
      <code>
        TranslationHelper
      </code>
      
       drops <code>
        setCache
      </code>
      
      , <code>
        getGeneration
      </code>
      
      , <code>
        lookupIn
      </code>
      
      ; <code>
        BaseI18n
      </code>
      
       drops <code>
        ensurePinnedChunk
      </code>
      
      , <code>
        invalidatePin
      </code>
      
      ; route chunks hold only their own keys and lookups fall through to the root chunk
    </td>
    
    <td>
      Custom adapters: use <code>
        lookup(chunkKey, key)
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      core
    </td>
    
    <td>
      <code>
        TranslationHelper.hasPageTranslation
      </code>
      
       is gone
    </td>
    
    <td>
      <code>
        hasCache(locale, routeName)
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      core
    </td>
    
    <td>
      <code>
        TranslationHelper.loadTranslations
      </code>
      
       is gone
    </td>
    
    <td>
      <code>
        mergeTranslation(locale, routeName, data)
      </code>
      
      ; <code>
        routeName
      </code>
      
       has no default, the root chunk is <code>
        'index'
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      core
    </td>
    
    <td>
      <code>
        TranslationHelper.loadPageTranslations
      </code>
      
       is gone
    </td>
    
    <td>
      <code>
        mergeTranslation(locale, routeName, data)
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      core
    </td>
    
    <td>
      <code>
        BaseI18n.loadRouteTranslationsCore(locale, routeName, translations, merge)
      </code>
      
       is gone
    </td>
    
    <td>
      <code>
        loadTranslationsCore(locale, translations, merge, routeName)
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      core
    </td>
    
    <td>
      <code>
        tc
      </code>
      
       passes the count as a <code>
        Number
      </code>
      
      , so a custom rule sees <code>
        1.5
      </code>
      
       where it saw <code>
        1
      </code>
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      utils
    </td>
    
    <td>
      <code>
        resolveI18nConfigWithRuntimeOverrides(base, pub, warn)
      </code>
      
       is gone
    </td>
    
    <td>
      <code>
        createI18nConfigResolver(warn)(base, pub)
      </code>
      
      . It memoizes, reads the environment once, and its result is frozen in dev
    </td>
  </tr>
  
  <tr>
    <td>
      utils
    </td>
    
    <td>
      Subpaths <code>
        ./route
      </code>
      
      , <code>
        ./route-pattern
      </code>
      
      , <code>
        ./build
      </code>
      
      , <code>
        ./payload-stats
      </code>
      
      , <code>
        ./payload-config
      </code>
      
       removed
    </td>
    
    <td>
      They were module internals
    </td>
  </tr>
  
  <tr>
    <td>
      utils
    </td>
    
    <td>
      <code>
        mergeRouteTranslationsWithRoot
      </code>
      
       is gone
    </td>
    
    <td>
      <code>
        deepMergeTranslationsRecursive
      </code>
      
      , which merges at every depth
    </td>
  </tr>
  
  <tr>
    <td>
      utils
    </td>
    
    <td>
      <code>
        deepMergeTranslations
      </code>
      
       is gone
    </td>
    
    <td>
      <code>
        deepMergeTranslationsRecursive
      </code>
      
      . The old name stopped at two levels until this release
    </td>
  </tr>
  
  <tr>
    <td>
      utils
    </td>
    
    <td>
      <code>
        applyAutoDetectLanguage
      </code>
      
       is gone
    </td>
    
    <td>
      <code>
        hasExplicitPreference || !autoDetect ? locale : detectLocaleFromAcceptLanguage(header, validLocales) ?? locale
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      utils
    </td>
    
    <td>
      <code>
        LocaleHeadLink
      </code>
      
       is a union by <code>
        rel
      </code>
    </td>
    
    <td>
      Code that builds one with a free <code>
        rel
      </code>
      
      , or an <code>
        alternate
      </code>
      
       with no <code>
        hreflang
      </code>
      
      , no longer compiles
    </td>
  </tr>
</tbody>
</table>

#### `@i18n-micro/path-strategy`, `@i18n-micro/route-strategy`

<table>
<thead>
  <tr>
    <th>
      Package
    </th>
    
    <th>
      Change
    </th>
    
    <th>
      Action
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      path-strategy
    </td>
    
    <td>
      <strong>
        <code>
          switchLocaleRoute(fromLocale, toLocale, route, options)
        </code>
        
         is <code>
          switchLocaleRoute(toLocale, route, options)
        </code>
        
        . An old JS call returns a wrong result, with no error
      </strong>
    </td>
    
    <td>
      Drop the first argument
    </td>
  </tr>
  
  <tr>
    <td>
      path-strategy
    </td>
    
    <td>
      <code>
        localeRoute(locale, routeOrPath)
      </code>
      
       lost its third parameter, <code>
        getRouteBaseName(route)
      </code>
      
       its second. Both were ignored
    </td>
    
    <td>
      Drop them
    </td>
  </tr>
  
  <tr>
    <td>
      path-strategy
    </td>
    
    <td>
      <code>
        Strategy
      </code>
      
       alias removed
    </td>
    
    <td>
      Use <code>
        I18nPathStrategy
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      path-strategy
    </td>
    
    <td>
      <code>
        createPathStrategy
      </code>
      
       no longer builds absolute URLs
    </td>
    
    <td>
      Use <code>
        new DomainPathStrategy(ctx)
      </code>
      
       when locales have <code>
        baseUrl
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      path-strategy
    </td>
    
    <td>
      Subpaths <code>
        /prefix
      </code>
      
      , <code>
        /no-prefix
      </code>
      
      , <code>
        /prefix-except-default
      </code>
      
      , <code>
        /prefix-and-default
      </code>
      
       removed. Gone from the root: <code>
        BasePathStrategy
      </code>
      
      , <code>
        analyzeRoute
      </code>
      
      , <code>
        getRouteBaseName
      </code>
      
      , <code>
        buildLocalizedName
      </code>
      
      , <code>
        isIndexRouteName
      </code>
      
      , <code>
        resolvePathWithParams
      </code>
      
      . Gone from strategies: <code>
        getRedirect
      </code>
      
      , <code>
        getCanonicalPath
      </code>
      
      , the <code>
        get*
      </code>
      
       config getters. The context drops <code>
        globalLocaleRoutes
      </code>
      
      , <code>
        routeLocales
      </code>
      
      , <code>
        routesLocaleLinks
      </code>
      
      , <code>
        noPrefixRedirect
      </code>
      
      . <code>
        RouterAdapter
      </code>
      
       needs <code>
        getRoutes
      </code>
    </td>
    
    <td>
      Build from <code>
        createPathStrategy
      </code>
      
       or the two classes
    </td>
  </tr>
  
  <tr>
    <td>
      route-strategy
    </td>
    
    <td>
      <code>
        isInternalPath
      </code>
      
       is no longer re-exported
    </td>
    
    <td>
      Import it from <code>
        @i18n-micro/utils/app-path
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      route-strategy
    </td>
    
    <td>
      Helper exports gone: <code>
        buildFullPath
      </code>
      
      , <code>
        buildFullPathNoPrefix
      </code>
      
      , <code>
        buildRouteName
      </code>
      
      , <code>
        extractLocalizedPaths
      </code>
      
      , <code>
        isLocalizationDisabledForPage
      </code>
      
       and others. <code>
        filesLocaleRoutes
      </code>
      
       and <code>
        fallbackRedirectComponentPath
      </code>
      
       removed. New: <code>
        generateRoutes
      </code>
      
      , <code>
        Rules
      </code>
      
      , <code>
        nameOfPath
      </code>
      
      , <code>
        routeKey
      </code>
    </td>
    
    <td>
      Use <code>
        RouteGenerator
      </code>
      
       or <code>
        generateRoutes
      </code>
    </td>
  </tr>
</tbody>
</table>

#### `@i18n-micro/test-utils`, `@i18n-micro/types-generator`, `@i18n-micro/devtools-ui`

<table>
<thead>
  <tr>
    <th>
      Package
    </th>
    
    <th>
      Change
    </th>
    
    <th>
      Action
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      test-utils
    </td>
    
    <td>
      The mock is a <code>
        BaseI18n
      </code>
      
      : <code>
        tc('a', 1.5)
      </code>
      
       takes the last form, <code>
        td('nope')
      </code>
      
       is <code>
        Invalid Date
      </code>
      
      , <code>
        tdr
      </code>
      
       follows the active locale, <code>
        t(miss, undefined, '')
      </code>
      
       is the key, root keys answer on a route, a miss no longer logs
    </td>
    
    <td>
      Fix tests that pinned what the app never did
    </td>
  </tr>
  
  <tr>
    <td>
      test-utils
    </td>
    
    <td>
      <code>
        settRouteName
      </code>
      
       and <code>
        $settRouteName
      </code>
      
       removed
    </td>
    
    <td>
      Use <code>
        setRouteName
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      test-utils
    </td>
    
    <td>
      The strategy fake's <code>
        switchLocaleRoute
      </code>
      
       follows the new signature
    </td>
    
    <td>
      Drop the first argument
    </td>
  </tr>
  
  <tr>
    <td>
      test-utils
    </td>
    
    <td>
      <code>
        isolated
      </code>
      
       is gone from <code>
        createI18nTestContext
      </code>
      
       (every context always was); <code>
        ./publish-smoke
      </code>
      
       removed
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      types-generator
    </td>
    
    <td>
      <code>
        I18nTypesPlugin(options)
      </code>
      
       is a plain Vite and Rollup plugin: no <code>
        .vite()
      </code>
      
      , <code>
        .webpack()
      </code>
      
      , <code>
        .esbuild()
      </code>
      
      . <code>
        flattenKeys
      </code>
      
      , <code>
        isPlainTranslationObject
      </code>
      
       removed; <code>
        getTypesString
      </code>
      
       and <code>
        generateTypes
      </code>
      
       are sync; <code>
        translationDir
      </code>
      
       may be an array
    </td>
    
    <td>
      <code>
        I18nTypesPlugin.vite(o)
      </code>
      
       → <code>
        I18nTypesPlugin(o)
      </code>
      
      ; for webpack or esbuild call <code>
        generateTypes
      </code>
      
       in a script
    </td>
  </tr>
  
  <tr>
    <td>
      types-generator
    </td>
    
    <td>
      Keys are what <code>
        t()
      </code>
      
       reads: object paths added, <code>
        __proto__
      </code>
      
       and files outside the locale layout dropped, values typed by their JSON. The Nuxt module reads <code>
        i18n.translationDir
      </code>
      
      , inline options, layers and <code>
        additionalTranslationDirs
      </code>
      
      . <code>
        @nuxt/kit
      </code>
      
       is an optional peer, <code>
        @nuxt/schema
      </code>
      
       and <code>
        vite
      </code>
      
       are new optional peers
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      devtools-ui
    </td>
    
    <td>
      <code>
        /files
      </code>
      
       and <code>
        /file
      </code>
      
       are replaced by <code>
        /translations
      </code>
      
      ; a cross-site or foreign-host request is a 403, <code>
        /save
      </code>
      
       needs <code>
        application/json
      </code>
      
      ; updates come over Vite's socket, no 2s poll; Astro uses <code>
        i18nDevToolsIntegration
      </code>
      
      . <code>
        vite
      </code>
      
       is an optional peer
    </td>
    
    <td>
      —
    </td>
  </tr>
  
  <tr>
    <td>
      devtools-ui
    </td>
    
    <td>
      <code>
        createBridge
      </code>
      
       takes a <code>
        base
      </code>
      
       option; a failed save to a reachable endpoint throws and rolls back
    </td>
    
    <td>
      Pass <code>
        base
      </code>
      
       if you changed the plugin's <code>
        base
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      devtools-ui
    </td>
    
    <td>
      <code>
        /save
      </code>
      
       accepts only an existing <code>
        .json
      </code>
      
       inside <code>
        translationDir
      </code>
      
       and no longer creates files
    </td>
    
    <td>
      Create new locale files yourself
    </td>
  </tr>
</tbody>
</table>

## From v2 to v3

### Removed options

```diff
i18n: {
-  includeDefaultLocaleRoute: true,
+  strategy: 'prefix',
-  fallbackRedirectComponentPath: '~/components/MyRedirect.vue',
-  experimental: { hmr: true, previousPageFallback: true },
+  hmr: true,
 }
```

- `includeDefaultLocaleRoute: true` is `strategy: 'prefix'`; `false` is the default `prefix_except_default`.
- `fallbackRedirectComponentPath` is gone: redirects happen on the server before render and in a client route middleware. Custom redirect logic goes into a plugin that sets the locale, see [Custom locale detection](/guide/custom-auto-detect).
- `experimental.hmr` is the root `hmr` option (on by default).
- `previousPageFallback` is gone: the leaving page's keys resolve until its transition ends, with no option.

### Locale state

Use `useI18nLocale()` instead of `useState('i18n-locale')` and `useCookie('user-locale')`:

```diff
- useState('i18n-locale').value = 'fr'
- useCookie('user-locale').value = 'fr'
+ useI18nLocale().setLocale('fr') // state and cookie together
```

### Config at runtime

Read the config, runtime overrides included, with `$getI18nConfig()`:

```diff
- const cookieName = useRuntimeConfig().public.i18nConfig?.localeCookie
+ const { $getI18nConfig } = useNuxtApp()
+ const cookieName = $getI18nConfig().localeCookie
```

### Internal type aliases

If your IDE or `vue-tsc` cannot resolve `#i18n-internal/*` imports, map them in your `package.json`. Nuxt resolves them at build time, so this is rarely needed:

```json
{
  "imports": {
    "#i18n-internal/plural": "nuxt-i18n-micro/internals",
    "#i18n-internal/strategy": "nuxt-i18n-micro/internals",
    "#i18n-internal/config": "nuxt-i18n-micro/internals"
  }
}
```

## Related

<card-group>
<card icon="i-lucide-book-open" title="Locale detection" to="/guide/locale-detection">



</card>

<card icon="i-lucide-braces" title="Module options" to="/api/module-options">



</card>

<card icon="i-lucide-external-link" title="Changelog" to="https://github.com/s00d/nuxt-i18n-micro/blob/main/CHANGELOG.md" target="_blank">



</card>
</card-group>
