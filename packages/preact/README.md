# @i18n-micro/preact

Preact bindings for Nuxt I18n Micro: the same API as `@i18n-micro/react` (`createI18n`, `<I18nProvider>`, `useI18n()`, `useT`, `useLocaleSwitch`, four components), built from the same source on Preact itself, plus `createBrowserHistoryAdapter` in `@i18n-micro/preact/router` for any History API router (wouter, preact-router).

```bash
pnpm add @i18n-micro/preact
```

Peer: `preact` `^10.0.0 || ^11.0.0`. The whole range runs. Its published types need preact 10.27.3 or later with `skipLibCheck: false`; with `skipLibCheck: true`, the usual template setting, older versions compile too.

```tsx
import { render } from 'preact'
import { createI18n, I18nProvider } from '@i18n-micro/preact'
import { createBrowserHistoryAdapter } from '@i18n-micro/preact/router'
import { App } from './App'

const locales = [{ code: 'en' }, { code: 'de' }]
const i18n = createI18n({ locale: 'en', fallbackLocale: 'en', messages: { en: { greeting: 'Hello, {name}!' } } })

render(
  <I18nProvider i18n={i18n} locales={locales} defaultLocale="en" routingStrategy={createBrowserHistoryAdapter(locales, 'en')}>
    <App />
  </I18nProvider>,
  document.getElementById('app')!,
)
```

Docs: [https://s00d.github.io/nuxt-i18n-micro/integrations/react-package#preact](https://s00d.github.io/nuxt-i18n-micro/integrations/react-package#preact) · Repository: [github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)

## License

MIT
