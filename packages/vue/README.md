# @i18n-micro/vue

Vue 3 plugin with the translation core of Nuxt I18n Micro: reactive `t()`, global `$t`, `<I18nT>`, `<I18nLink>`, `<I18nSwitcher>`, `<I18nGroup>`, and a vue-router adapter in `@i18n-micro/vue/router`.

```bash
pnpm add @i18n-micro/vue
```

Peers: `vue` `^3.5.43`; `vue-router` `^4.6.3 || ^5.0.0` (optional).

```ts
import { createApp } from 'vue'
import { createI18n } from '@i18n-micro/vue'
import App from './App.vue'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en: { greeting: 'Hello, {name}!' } },
  locales: [
    { code: 'en', iso: 'en-US' },
    { code: 'de', iso: 'de-DE' },
  ],
  defaultLocale: 'en', // locales and defaultLocale are required by useI18n()
})

createApp(App).use(i18n).mount('#app')
```

Docs: [https://s00d.github.io/nuxt-i18n-micro/integrations/vue-package](https://s00d.github.io/nuxt-i18n-micro/integrations/vue-package) · Repository: [github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)

## License

MIT
