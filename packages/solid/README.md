# @i18n-micro/solid

SolidJS bindings for Nuxt I18n Micro: a signal-backed `createI18n`, `<I18nProvider>`, `useI18n()`, four components, and a `@solidjs/router` adapter in `@i18n-micro/solid/router`.

```bash
pnpm add @i18n-micro/solid
```

Peers: `solid-js` `^1.9.15`; `@solidjs/router` `^0.15.4 || ^1.0.0` (optional).

```tsx
import { render } from 'solid-js/web'
import { createI18n, I18nProvider, useI18n } from '@i18n-micro/solid'

const i18n = createI18n({ locale: 'en', fallbackLocale: 'en', messages: { en: { greeting: 'Hello, {name}!' } } })

const Greeting = () => {
  const { t } = useI18n()
  return <h1>{t('greeting', { name: 'Ada' }) as string}</h1>
}

render(
  () => (
    <I18nProvider i18n={i18n} locales={[{ code: 'en' }, { code: 'de' }]} defaultLocale="en">
      <Greeting />
    </I18nProvider>
  ),
  document.getElementById('root')!,
)
```

Docs: [https://s00d.github.io/nuxt-i18n-micro/integrations/solid-package](https://s00d.github.io/nuxt-i18n-micro/integrations/solid-package) · Repository: [github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)

## License

MIT
