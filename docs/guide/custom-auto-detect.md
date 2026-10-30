---
title: Custom locale detection
description: Pick the locale yourself — by domain, header or user profile — with a server plugin and useI18nLocale().setLocale().
outline: [2, 3]
---

# Custom locale detection

The built-in detection reads the URL, a cookie and `Accept-Language`. When the locale depends on something else — the domain, a geo header set by your CDN, a user profile — set it yourself in a plugin that runs before the i18n plugin. The module then loads that locale's translations and uses it for redirects exactly as if it had detected it. The rules that decide when a chosen locale wins over the URL are on [Locale detection](/guide/locale-detection); this page shows how to plug your own source in.

## Set the locale in a server plugin

```ts
// plugins/i18n-locale.server.ts
export default defineNuxtPlugin({
  name: 'i18n-custom-locale',
  enforce: 'pre',
  order: -10, // before the i18n plugin (order -5)
  setup() {
    const { setLocale } = useI18nLocale()
    const host = (useRequestHeaders(['host']).host ?? '').split(':')[0]! // without the port

    if (host.endsWith('.de')) setLocale('de')
    else if (host.endsWith('.fr')) setLocale('fr')
  },
})
```

`setLocale(code)` writes the locale state (`useState('i18n-locale')`) and, when a locale cookie is configured, the cookie. Use it instead of writing `useState` or `useCookie` yourself. Pass only enabled locale codes.

Keep the plugin `.server.ts` when it reads request headers: they do not exist in the browser. A `.client.ts` plugin is the place for browser-only sources such as `localStorage`.

## Turn off the built-in Accept-Language step

Your plugin and `Accept-Language` can disagree. To let only your code (plus the URL and cookie) decide, switch the header off:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    autoDetectLanguage: false,
  },
})
```

[`autoDetectLanguage`](/api/module-options#autodetectlanguage) only controls the header step. The URL and a valid cookie still count.

## What happens next

The effect of `setLocale` depends on the [strategy](/guide/strategy):

| Strategy | Effect of `setLocale('de')` in the plugin |
| --- | --- |
| `no_prefix` | The page renders in German; the URL does not change. |
| `prefix`, `prefix_except_default` | On an unprefixed path where [`autoDetectPath`](/api/module-options#autodetectpath) allows redirects (by default only `/`), the server answers `302` to the German URL. A URL with a locale prefix keeps it. |
| `prefix_and_default` | No redirect: the unprefixed URL is a valid default-locale page. |

Under the prefix strategies a locale in the URL is the user's choice and your plugin does not override it. `autoDetectPath: '*'` is the exception: the server then moves prefixed URLs by cookie and `Accept-Language` and ignores the state, but `setLocale()` also writes the cookie when one is configured, so from the next request your plugin's choice can redirect a prefixed URL. Keep `'/'` or use `'no_prefix'` when explicit locale URLs must win. Use your plugin to choose where a visitor lands, not to rewrite links they followed.

## Respect a locale the user picked

Once a user switches language, the switch writes the cookie. Skip your own detection when there is already a valid preference:

```ts
// plugins/i18n-locale.server.ts
import { detectLocaleFromAcceptLanguage } from '@i18n-micro/utils/accept-language'

export default defineNuxtPlugin({
  name: 'i18n-custom-locale',
  enforce: 'pre',
  order: -10,
  setup() {
    const { getPreferredLocale, setLocale, validLocales } = useI18nLocale()
    if (getPreferredLocale()) return // valid state or cookie: keep it

    const country = useRequestHeaders(['x-country'])['x-country']
    if (country === 'JP') return setLocale('ja')

    const header = useRequestHeaders(['accept-language'])['accept-language']
    setLocale(detectLocaleFromAcceptLanguage(header, validLocales))
  },
})
```

`getPreferredLocale()` returns the state or cookie only when it is an enabled locale, so a stale cookie does not stop detection. `detectLocaleFromAcceptLanguage` is the q-value-aware matcher the module uses itself (install `@i18n-micro/utils` to import it); `setLocale(null)` does nothing.

## One domain per locale

If each domain should serve one locale, you often do not need a plugin at all: give each locale a `baseUrl` and build once, or one build per domain with a layer. See [Layers and domains](/guide/layers#multiple-domains).

## Related

- [Locale detection](/guide/locale-detection) — the full precedence and redirect rules
- [`useI18nLocale`](/composables/useI18nLocale)
- [Routing strategies](/guide/strategy)
- [Layers and domains](/guide/layers)
