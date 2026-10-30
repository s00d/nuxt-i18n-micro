---
title: 'FAQ'
description: 'Short answers to common nuxt-i18n-micro problems, each with a link to the page that covers it.'
outline: [2, 3]
---

# FAQ

Short answers to the problems people hit most, for questions the topic pages do not answer head-on. Each answer links the page that owns the topic. If yours is not here, search the docs or open an [issue](https://github.com/s00d/nuxt-i18n-micro/issues).

## Translations

### `$t` fails in a plugin or a utility function

Composables need the Nuxt context. Outside `setup`, take the helper from the app, or run in its context after an `await`:

```ts
const nuxtApp = useNuxtApp()
const title = nuxtApp.$t('errors.unknown')
await nuxtApp.runWithContext(() => nuxtApp.$t('errors.unknown'))
```

In services that have no app at all, pass keys and translate them in the component.

### A key shows as raw text on one page only

The key is in another page's file. A page sees only the root file and its own `locales/pages/<route-name>/` file; move shared keys to the root file. See [Translation files](/guide/translations).

### Keys flash while a page transition runs

They should not: the leaving page's keys resolve until the transition ends. If they still flash, the key lives only in a page file that neither page owns (for example in a layout); move it to the root file.

### Translations are missing during SSR on Vercel, Netlify or Edge

The server function cannot read `public/` there, so payloads are embedded in the server bundle. That is the default; check that `translationPayloads.serverAssets` is not turned off. See [Deployment](/guide/deployment).

### How do I put a link inside a translated sentence?

Use `<i18n-t>`: each named slot fills the `{placeholder}` of the same name.

```vue
<!-- "share": "Share your {link} with friends" -->
<i18n-t keypath="share">
  <template #link>
    <i18n-link :to="{ name: 'referral' }">{{ $t('referralLink') }}</i18n-link>
  </template>
</i18n-t>
```

See [`<i18n-t>`](/components/i18n-t). vue-i18n's linked messages and modifiers are not supported; compose in the template like this.

## Locales and URLs

### `/en/about` is a 404

With the default `prefix_except_default`, the default locale has no prefix: `/about` is English. Use `prefix` or `prefix_and_default` if you want `/en/...`. See [Routing strategies](/guide/strategy).

### Visitors are not redirected on deep links

By default only `/` follows the browser language or the cookie, so shared links keep their language. Set `autoDetectPath: 'no_prefix'` or `'*'`. See [Locale detection](/guide/locale-detection#autodetectpath).

### The chosen language is forgotten after a reload

The locale cookie is off for the prefix strategies. Set `localeCookie: 'user-locale'`. See [Locale detection](/guide/locale-detection#the-cookie).

### Can I switch locale without changing the URL?

Only with `strategy: 'no_prefix'`, where `$switchLocale('de')` reloads the dictionary on the same path. Under the prefix strategies the locale is part of the URL, so switching navigates. For a link instead of a call, use `$switchLocalePath('de')`.

### The page scrolls to the top when I switch locale

That is Nuxt's `scrollBehavior` for any navigation. Set `definePageMeta({ scrollToTop: false })` and restore the position yourself. The playground's [`SwitchLocalePreserve.vue`](https://github.com/s00d/nuxt-i18n-micro/blob/main/playground/components/SwitchLocalePreserve.vue) is a copyable wrapper ([demo page](https://github.com/s00d/nuxt-i18n-micro/blob/main/playground/pages/scroll-test.vue)).

## Build and integrations

### `nuxt-seo:defaults depends on nuxt-site-config:i18n but they are not registered`

An old `nuxt-site-config` only knows `@nuxtjs/i18n`. Upgrade `@nuxtjs/seo` to 3 or newer and list `nuxt-i18n-micro` before it in `modules`. See [SEO](/guide/seo).

### Build error about `@unhead/vue` on Cloudflare

Install `@unhead/vue` in the app so the prerender step finds it, and enable Node compatibility in `wrangler.toml`: `compatibility_flags = ["nodejs_compat"]`.

## Related

- [Getting started](/guide/getting-started)
- [Translation files](/guide/translations)
- [Locale detection](/guide/locale-detection)
- [Deployment](/guide/deployment)
