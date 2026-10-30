# @i18n-micro/react

React bindings for Nuxt I18n Micro: `createI18n`, `<I18nProvider>`, `useI18n()`, `<I18nT>`, `<I18nLink>`, `<I18nSwitcher>`, `<I18nGroup>`, `useT`, `useLocaleSwitch`, a React Router adapter in `@i18n-micro/react/router`, and a Server Components entry in `@i18n-micro/react/server`.

```bash
pnpm add @i18n-micro/react
```

Peers: `react` `^18.0.0 || ^19.0.0`; `react-dom` `^18.0.0 || ^19.0.0` (optional, for rendering); `react-router-dom` `^6.30.6 || ^7.0.0` (optional).

```tsx
import { createI18n, I18nProvider, useI18n } from '@i18n-micro/react'

const i18n = createI18n({ locale: 'en', fallbackLocale: 'en', messages: { en: { greeting: 'Hello, {name}!' } } })

function Greeting() {
  const { t } = useI18n()
  return <h1>{t('greeting', { name: 'Ada' })}</h1>
}

export const App = () => (
  <I18nProvider i18n={i18n} locales={[{ code: 'en' }, { code: 'de' }]} defaultLocale="en">
    <Greeting />
  </I18nProvider>
)
```

Docs: [https://s00d.github.io/nuxt-i18n-micro/integrations/react-package](https://s00d.github.io/nuxt-i18n-micro/integrations/react-package) · Repository: [github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)

## License

MIT
